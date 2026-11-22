import { coverageClickHitTest } from '../coverage/coverageClickDispatch';
import { nearestLoadedFrame, type LoadedFramePoint } from '../coverage/nearestLoadedFrame';
import { tilePlace } from '../places/tilePlace';
import type { Place } from '../places/placesModel';
import type { PlacesCoordinator } from '../places/PlacesCoordinator';
import type { PlacesVectorLayer } from '../places/PlacesVectorLayer';
import { deferNoteObjectPopup } from '../detections/NoteObjectChoice';
import { attachmentMetadata } from '../detections/detectionImageAttachment';
import type { PointCloudAnnotationPicker, AnnotationMapPoint } from '../field-notes/PointCloudAnnotationPicker';
import type { FieldNoteMap } from '../field-notes/FieldNoteMap';
import type { PointCloudHitRouting, PointCloudHitGeometry } from '../point-cloud/PointCloudHitRouting';
import type { CoverageSelectionContext } from '../coverage/CoverageSelectionTargets';
import type { CoverageFrameLookup } from '../coverage/CoverageFrameLookup';
import type { MessageKey } from '../../i18n/messages';
import { LAYER_IDS, GRAPH_API } from '../../utils/constants';
import { distanceMeters } from '../../utils/geoUtils';

export type ClickPoint = __esri.Point & { longitude: number; latitude: number };
type ClickView = __esri.MapView | __esri.SceneView;
type Places = Pick<PlacesCoordinator, 'screenTarget' | 'openChoices'>;
type Notes = Pick<FieldNoteMap<__esri.GroupLayer, __esri.GraphicsLayer, __esri.Graphic, ClickView>, 'hasPickTargets' | 'noteForGraphic' | 'focusNote'>;
interface Removable { remove(): void; }

/** Synchronous identity/preview snapshot supplied before any asynchronous picking begins. */
export interface PreparedMapClick {
  point: ClickPoint;
  pointPreviewAtClick: __esri.Graphic | null;
  coveragePreviewAtClick: __esri.Graphic | null;
  clickCurrent(): boolean;
  coverageClickCurrent(): boolean;
  clickStartedAt: number;
}

/** Click-only capabilities. Live getters preserve post-await owner/filter checks without exposing widget state. */
export interface MapClickHost {
  readonly view: ClickView;
  prepare(event: __esri.ViewClickEvent): PreparedMapClick | undefined;
  readonly currentView: ClickView | undefined;
  readonly routePickMode: 'start' | 'end' | null;
  readonly isAnnotationMode: boolean;
  readonly placesActive: boolean;
  readonly trafficSignsActive: boolean;
  readonly objectsActive: boolean;
  readonly turboModeActive: boolean;
  readonly sequenceId: string | null;
  readonly sequenceImages: LoadedFramePoint[];
  readonly annotationPicker: Pick<PointCloudAnnotationPicker, 'pick'>;
  readonly places: Places | null;
  readonly tilePlaces: Pick<PlacesVectorLayer, 'resolve'> | null;
  readonly sharedNotesLayer: __esri.FeatureLayer | null;
  readonly fieldNotes: Notes;
  readonly pointCloudMapLayer: { readonly layer: unknown } | null;
  readonly objectLayer: unknown;
  readonly signLayer: unknown;
  sharedNotesPopup: Removable | null;
  readonly cloudHits: Pick<PointCloudHitRouting<__esri.Point & PointCloudHitGeometry>, 'route'>;
  readonly tilePlacesOwner: Places | null;
  readonly sequenceCache: Record<string, LoadedFramePoint[]>;
  readonly selectionRevision: number;
  readonly selectionAbort: AbortController | null;
  featureAbort: AbortController | null;
  readonly hoverAbort: AbortController | null;
  coverageAbort: AbortController | null;
  readonly coverageLayer: __esri.VectorTileLayer | null;
  readonly coverageLayerView: __esri.LayerView | null;
  highlight: Removable | null;
  readonly accessToken: string;
  readonly frames: { readonly complete: unknown };
  readonly selectionTargets: { retain(context: CoverageSelectionContext, image: string, geometry: __esri.Point, sequence: string): unknown };
  setRoutePoint(mode: 'start' | 'end', point: [number, number]): void;
  setState(patch: { clickLon?: number; clickLat?: number; coverageFrameResolving?: boolean }): void;
  openFieldNoteAttachments(graphic: __esri.Graphic): unknown;
  openSharedFieldNoteEditor(graphic: __esri.Graphic): unknown;
  offerNoteObjectChoice(view: ClickView, graphic: __esri.Graphic, open: () => void, current: () => boolean): boolean;
  showPlacesHit(results: unknown[], target: string | null): boolean;
  placesBusy(): boolean;
  showToast(message: string, milliseconds?: number): void;
  text(key: MessageKey): string;
  nearestCoverageImage(sequence: string, point: { lon: number; lat: number }, signal: AbortSignal): Promise<string | undefined>;
  loadSequenceById(sequence: string, image: string, point: { lon: number; lat: number }, representative: boolean, nearest: boolean, started: number): Promise<unknown>;
  pickMapFeature(point: { x: number; y: number }, view: ClickView, signal: AbortSignal): Promise<unknown>;
  openPickedMapDetection(feature: unknown): void;
  pickTurboGraphic(point: { x: number; y: number }, view: ClickView, signal: AbortSignal): Promise<__esri.Graphic | null>;
  pickTurboRepresentative(point: { x: number; y: number }, view: ClickView, signal: AbortSignal): Promise<__esri.Graphic | null>;
  getTurboOrganizationId(): number | undefined;
  drawClickRipple(lon: number, lat: number, color?: number[], duration?: number, size?: number): unknown;
  updateTurboPickWarning(message?: string, action?: 'zoom' | 'retry'): void;
  ensureCoverageFrameLookup(): Pick<CoverageFrameLookup, 'resolve'>;
  ownedText(source: string): string;
  coverageSelectionContext(): CoverageSelectionContext;
  getCoverageDisplayPosition(id: string, lon: number, lat: number): { lon: number; lat: number };
  toGeographic(geometry: __esri.Geometry): ClickPoint;
}

/** Dispatch one map click in existing tool/note/POI/sequence/detection/coverage priority order.
 * The caller owns preview capture and mutable resources; every original await retains its ownership gate.
 */
export async function dispatchMapClick(evt: __esri.ViewClickEvent, host: MapClickHost): Promise<void> {
  const prepared = host.prepare(evt);
  if (!prepared) return;
  const { point, pointPreviewAtClick, coveragePreviewAtClick, clickCurrent, coverageClickCurrent, clickStartedAt } = prepared;
  const view = host.view;
  if (host.routePickMode) {
    host.setRoutePoint(host.routePickMode, [point.longitude, point.latitude]);
    return;
  }

  // FIELD NOTES: annotation mode intercepts the click before anything else
  if (host.isAnnotationMode) {
    await host.annotationPicker.pick(() => view.hitTest(evt), point as AnnotationMapPoint);
    return;
  }

  // Stop the automatic popup click synchronously, before the first hit-test await.
  // The captured ID survives an unrestricted SDK hit test omitting this small marker.
  const placesOwnerAtClick = host.placesActive ? host.places : null;
  const tilePlacesAtClick = host.tilePlaces;
  const placeTargetAtClick = placesOwnerAtClick?.screenTarget(evt) || null;
  if (placeTargetAtClick) evt.stopPropagation();
  host.setState({ clickLon: point.longitude, clickLat: point.latitude });

  try {
    const responsePromise = coverageClickHitTest(!!pointPreviewAtClick, {
      sharedNotes: !!host.sharedNotesLayer || host.fieldNotes.hasPickTargets,
      pointCloud: !!host.pointCloudMapLayer?.layer,
      places: !!host.placesActive,
      detectionFeatures: !!host.objectLayer || !!host.signLayer,
    }, () => view.hitTest(evt));
    if (typeof (evt as any).defer === 'function' && (host.trafficSignsActive || host.objectsActive) && (host.sharedNotesLayer || host.fieldNotes.hasPickTargets)) {
      deferNoteObjectPopup(evt as any, responsePromise, hit => hit.results.some((result: any) =>
        (!!host.sharedNotesLayer && (result.layer || result.graphic?.layer) === host.sharedNotesLayer) ||
        (result.graphic && !!host.fieldNotes.noteForGraphic(result.graphic))), clickCurrent);
    }
    const response = await responsePromise;
    if (!clickCurrent()) return;
    const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === host.sharedNotesLayer);
    if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {
      const openEnterpriseNote = () => {
        view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });
        host.sharedNotesPopup?.remove();
        host.sharedNotesPopup = view.popup?.on("trigger-action", (event: { action: { id: string } }) => {
          if (event.action.id === "enterprise-note-attachments" && view.popup?.selectedFeature?.layer === host.sharedNotesLayer) void host.openFieldNoteAttachments(view.popup.selectedFeature);
          if (event.action.id === "edit-enterprise-note" && view.popup?.selectedFeature?.layer === host.sharedNotesLayer) {
            void host.openSharedFieldNoteEditor(view.popup.selectedFeature);
          }
        }) || null;
      };
      if ((host.trafficSignsActive || host.objectsActive) && host.offerNoteObjectChoice(view, (enterpriseNoteHit as any).graphic, openEnterpriseNote, clickCurrent)) return;
      openEnterpriseNote(); return;
    }

    // Note clicks select the same highlight as Show on map without moving the camera.
    const noteHit = response.results.find((result: any) => result.graphic && host.fieldNotes.noteForGraphic(result.graphic));
    if (noteHit && (noteHit as any).graphic) {
      const graphic = (noteHit as any).graphic;
      const note = host.fieldNotes.noteForGraphic(graphic);
      const openNote = () => { if (note) void host.fieldNotes.focusNote(note).catch(() => { }); };
      if (note && (host.trafficSignsActive || host.objectsActive) && host.offerNoteObjectChoice(view, graphic, () => { openNote(); const popupGraphic = graphic.clone(); popupGraphic.attributes = { ...popupGraphic.attributes, note: attachmentMetadata(note.note).text }; view.openPopup({ features: [popupGraphic], location: graphic.geometry }); }, clickCurrent)) return;
      openNote(); return;
    }

    if (host.cloudHits.route(response.results)) return;

    // A direct Places marker hit opens local details before coverage's wider pick radius.
    // Route/annotation modes, shared notes and point-cloud tools retain priority.
    if (host.currentView !== view || view.destroyed) return;
    if (host.placesActive && host.places === placesOwnerAtClick && host.showPlacesHit(response.results, placeTargetAtClick)) return;

    if (tilePlacesAtClick && host.places === host.tilePlacesOwner && !pointPreviewAtClick && !coveragePreviewAtClick && !host.placesBusy()) {
      let tileHit: any = null;
      try { tileHit = await tilePlacesAtClick.resolve(evt); }
      catch (error) { if ((error as any)?.name !== 'AbortError') console.warn('[Overture tile pick]', error); }
      if (!clickCurrent()) return;
      if (host.tilePlaces === tilePlacesAtClick && host.places === placesOwnerAtClick && tileHit) {
        if (tileHit.attributes?.cluster_count >= 1) {
          evt.stopPropagation();
          if (view.zoom >= 19) host.showToast(host.text('uiPoiClusterDense'), 3500);
          else void view.goTo({ target: tileHit.geometry, zoom: Math.min(19, Math.max(15, Math.floor(view.zoom) + 2)) }).catch(() => { });
          return;
        }
        const candidates: Place[] = (tileHit.candidates || [tileHit]).map((candidate: any) => tilePlace(candidate.attributes, candidate.geometry)).filter((place: Place | null): place is Place => !!place);
        if (candidates.length && host.places?.openChoices(candidates)) { evt.stopPropagation(); return; }
      }
    }

    // A valid individual image preview owns this click. Otherwise blue route
    // navigation keeps its existing exact-point/nearest-loaded-frame behavior.
    if (pointPreviewAtClick && !coverageClickCurrent()) return;
    const sequenceHits = response.results.filter((r: any) => r.graphic &&
      ((r.graphic as any).__isSequenceOverlay || (r.graphic as any).__isActiveSequencePoint) &&
      r.graphic.attributes?.sequenceId &&
      (r.graphic.geometry?.type === "point" || r.graphic.geometry?.type === "polyline"));
    const seqHit = sequenceHits.find((r: any) => r.graphic.geometry.type === "point" && r.graphic.attributes?.image_id) || sequenceHits[0];
    if (seqHit && !pointPreviewAtClick) {
      const attrs = (seqHit as any).graphic.attributes;
      const seqId = String(attrs.sequenceId);
      let imageId = attrs.image_id ? String(attrs.image_id) : undefined;
      if (!imageId) {
        const images = host.sequenceCache[seqId];
        if (images?.length) {
          const routeCurrent = () => clickCurrent() && host.sequenceCache[seqId] === images;
          imageId = await nearestLoadedFrame(images, { lon: point.longitude, lat: point.latitude }, distanceMeters, routeCurrent);
          if (!routeCurrent()) return;
        }
      }
      if (!imageId) {
        const request = host.selectionRevision;
        try { imageId = await host.nearestCoverageImage(seqId, { lon: point.longitude, lat: point.latitude }, host.selectionAbort?.signal || new AbortController().signal); }
        catch { return; }
        if (!clickCurrent() || request !== host.selectionRevision || !coverageClickCurrent()) return;
      }
      if (imageId) {
        if (!clickCurrent()) return;
        await host.loadSequenceById(seqId, imageId, { lon: point.longitude, lat: point.latitude }, false, false, clickStartedAt);
        return;
      }
    }

    // 2. Objects/Signs
    const featureHit = response.results.find((r: any) => {
      const layer = r.layer || (r.graphic && r.graphic.layer);
      return layer && (layer.id === LAYER_IDS.OBJECTS_FL || layer.id === LAYER_IDS.TRAFFIC_SIGNS_FL);
    });

    host.featureAbort?.abort();
    const featureController = new AbortController(); host.featureAbort = featureController;
    // Native detection tiles need a local pick only while a detection mode is active.
    const selectedFeature = featureHit || (host.objectsActive || host.trafficSignsActive
      ? await host.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal) : null);
    if (!clickCurrent() || featureController.signal.aborted) return;
    if (selectedFeature && (selectedFeature as any).graphic) {
      host.openPickedMapDetection(selectedFeature);

      // Stop here so we don't trigger the "nearest sequence" search
      return;
    }

    // 3. Turbo Coverage (Get ALL overlapping hits instead of just one)
    let turboHits = response.results.filter((r: any) => {
      const layer = r.layer || (r.graphic && r.graphic.layer);
      return layer && layer.id === LAYER_IDS.TURBO_COVERAGE;
    });

    // TURBO COVERAGE MODE BRANCH
    if (host.turboModeActive) {
      if (!coverageClickCurrent()) return;
      host.hoverAbort?.abort();
      host.coverageAbort?.abort();
      const pickController = new AbortController();
      host.coverageAbort = pickController;
      const picked = coveragePreviewAtClick || await host.pickTurboGraphic({ x: evt.x, y: evt.y }, view, pickController.signal) || await host.pickTurboRepresentative({ x: evt.x, y: evt.y }, view, pickController.signal);
      if (!coverageClickCurrent() || pickController.signal.aborted) return;
      turboHits = picked ? [{ graphic: picked, layer: host.coverageLayer } as any] : [];
      if (turboHits.length > 0) {
        // 1. Mathematically find the ABSOLUTE closest overlapping point
        let closestGraphic: __esri.Graphic | null = null;
        let minDistance = Infinity;

        turboHits.forEach((hit: any) => {
          const graphic = hit.graphic;
          // Convert the hit graphic to WGS84 to calculate distance
          const geom = host.toGeographic(graphic.geometry) as ClickPoint;
          if (geom) {
            // Compare mouse click (point.latitude/longitude) to dot location (geom)
            const dist = distanceMeters(point.latitude, point.longitude, geom.latitude, geom.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              closestGraphic = graphic;
            }
          }
        });

        // 2. Load exactly the point they clicked
        if (closestGraphic) {
          const safeGraphic = closestGraphic as __esri.Graphic;
          const attrs = safeGraphic.attributes;

          // Safely highlight the point
          if (host.coverageLayerView && safeGraphic.layer === host.coverageLayer) {
            if (host.highlight) host.highlight.remove();
            host.highlight = (host.coverageLayerView as any).highlight(safeGraphic);
          }

          if (attrs) {
            let imageId = attrs.image_id;
            if (!imageId) return;

            let seqId = attrs.sequence_id;

            if (!seqId || seqId === "" || seqId === "undefined") {
              try {
                const resp = await fetch(`${GRAPH_API.BASE}/${imageId}?fields=sequence`, {
                  headers: { Authorization: `OAuth ${host.accessToken}` },
                  signal: pickController.signal,
                });
                if (resp.ok) {
                  const data = await resp.json();
                  if (!coverageClickCurrent() || pickController.signal.aborted) return;
                  seqId = data.sequence;
                  safeGraphic.attributes.sequence_id = seqId;
                }
              } catch (err) {
                return;
              }
            }
            if (!coverageClickCurrent() || pickController.signal.aborted) return;
            if (seqId) {
              // Coverage hit tests can miss the thin active route at regional zooms.
              // For that same loaded sequence, resolve the click entirely in memory.
              if (attrs.turbo_representative && host.getTurboOrganizationId() === undefined && host.sequenceId === seqId && !!host.frames.complete) {
                const images = host.sequenceImages;
                const routeCurrent = () => coverageClickCurrent() && !pickController.signal.aborted &&
                  host.sequenceId === seqId && host.sequenceImages === images && !!host.frames.complete;
                const nearest = await nearestLoadedFrame(images, { lon: point.longitude, lat: point.latitude }, distanceMeters, routeCurrent);
                if (!routeCurrent()) return;
                if (nearest) imageId = nearest;
              }
              const regionalLine = !!attrs.turbo_representative && view.zoom >= 6 && view.zoom < 14;
              // A sequence tile's image_id represents the whole line, not its clicked location.
              // Resolve only nearby image tiles; never enumerate the full sequence to open it.
              if (regionalLine && !(host.getTurboOrganizationId() === undefined && host.sequenceId === seqId && !!host.frames.complete)) {
                const geometry = safeGraphic.geometry as ClickPoint;
                const geographic = geometry?.spatialReference?.isWGS84 || geometry?.spatialReference?.wkid === 4326
                  ? geometry : host.toGeographic(geometry) as ClickPoint;
                const location = Number.isFinite(geographic?.longitude) && Number.isFinite(geographic?.latitude)
                  ? { lon: geographic.longitude, lat: geographic.latitude }
                  : { lon: point.longitude, lat: point.latitude };
                host.drawClickRipple(location.lon, location.lat, [165, 42, 42], 0.6, 2);
                host.updateTurboPickWarning();
                host.setState({ coverageFrameResolving: true });
                try {
                  const nearby = await host.ensureCoverageFrameLookup().resolve(view, String(seqId), location, pickController.signal);
                  if (!coverageClickCurrent() || pickController.signal.aborted || host.coverageAbort !== pickController) return;
                  if (!nearby) {
                    host.updateTurboPickWarning(host.text('appNoNearbyFrameWasFoundHereZoomCloserTo'), "zoom");
                    return;
                  }
                  imageId = nearby;
                } catch (error) {
                  if (!coverageClickCurrent() || pickController.signal.aborted || host.coverageAbort !== pickController) return;
                  host.updateTurboPickWarning((error as any)?.name === "TimeoutError"
                    ? host.ownedText("Nearby imagery is taking longer to respond. Try again; downloaded tiles will be reused.")
                    : host.ownedText("Nearby imagery could not load. Check your connection and try again."), "zoom");
                  return;
                } finally {
                  if (host.coverageAbort === pickController) host.setState({ coverageFrameResolving: false });
                }
              }
              // Exact image targets keep their picked display position through
              // metadata loading. Regional lines retain their geographic search point.
              if (!attrs.turbo_representative && safeGraphic.geometry?.type === "point") {
                host.selectionTargets.retain(host.coverageSelectionContext(), String(imageId),
                  safeGraphic.geometry as ClickPoint, String(seqId));
              }
              const anchor = host.getCoverageDisplayPosition(String(imageId), point.longitude, point.latitude);
              host.drawClickRipple(anchor.lon, anchor.lat);
              await host.loadSequenceById(seqId, imageId, { lon: anchor.lon, lat: anchor.lat }, !!attrs.turbo_representative && !regionalLine, false, clickStartedAt);
              return;
            }
          }
        }
      }

      // Clicked empty space
      host.drawClickRipple(point.longitude, point.latitude, [255, 140, 0], 0.6, 2);
      host.updateTurboPickWarning(view.zoom < 14
        ? host.ownedText("No selectable representative image was found here. Choose a coverage line or overview point, or zoom closer for individual image selection.")
        : host.ownedText("No image point was found at this position. Choose a visible dot, zoom closer if dots overlap, or adjust the active filters."), "zoom");
      return;
    }

    // Imagery exploration uses Turbo; unrelated map tools remain available.
    host.showToast(host.text('appEnableTurboCoverageToSelectStreetImagery'), 3000);
  } catch (error) {
    if (!clickCurrent()) return;
    console.error("Click error", error);
    if (host.turboModeActive && (error as any)?.name !== "AbortError") host.updateTurboPickWarning(host.text('appImageLookupCouldNotLoadCheckYourConnectionAnd'), "retry");

  }

}
