import { CoverageHoverResume, type HoverPointerSnapshot } from '../coverage/CoverageHoverResume';
import { CoverageTouchHover } from '../coverage/CoverageTouchHover';
import type { PendingCoverageHover } from '../coverage/PendingCoverageHover';
import type { DelayedHoverStatus } from '../imagery/DelayedHoverStatus';
import { renderMapFeatureHoverLabel } from '../imagery/hoverCard';
import type { PlacesCoordinator } from '../places/PlacesCoordinator';
import type { PlacesVectorLayer } from '../places/PlacesVectorLayer';
import { tilePlace } from '../places/tilePlace';
import { LAYER_IDS } from '../../utils/constants';
import { TURBO_LIMITS } from '../../utils/turboCoverageUtils';
import type { MessageKey } from '../../i18n/messages';

type HoverView = __esri.MapView | __esri.SceneView;
export interface MapHoverPointer extends HoverPointerSnapshot {
  pointerType?: string;
  native?: { clientX?: number; clientY?: number; buttons?: number; pointerType?: string };
}
type Places = Pick<PlacesCoordinator, 'hit' | 'setHover' | 'setMapHover' | 'hoverLabel'>;

/** Live hover-only capabilities; no widget state/props or transport ownership is transferred. */
export interface MapHoverHost {
  readonly currentView: HoverView | undefined;
  readonly closed: boolean;
  readonly turboModeActive: boolean;
  touchHover: CoverageTouchHover | null;
  readonly workspaceLocation: { readonly active: boolean } | null;
  hoverResume: CoverageHoverResume | null;
  hoverHandler: ((pointer: MapHoverPointer) => void) | null;
  readonly alignment: { pointer(view: HoverView, point: { x: number; y: number }): void } | null;
  hoverAbort: AbortController | null;
  readonly hoveredScreen: { x: number; y: number } | null;
  leaveCleanup: (() => void) | null;
  readonly places: Places | null;
  readonly tilePlaces: Pick<PlacesVectorLayer, 'version' | 'resolveHover' | 'cancelHover'> | null;
  readonly tooltip: HTMLElement | null;
  detailsTimer: ReturnType<typeof setTimeout> | null;
  hoveredId: string | null;
  readonly coverageRevision: number;
  readonly coverageLayer: __esri.VectorTileLayer | null;
  readonly previewStatus: Pick<DelayedHoverStatus, 'begin'> | null;
  readonly pendingHover: Pick<PendingCoverageHover<HoverView>, 'begin'> | null;
  readonly cloudMap: { readonly updating: boolean } | null;
  readonly cloudRenderer: { readonly selectedIndex: number; setHighlight(index: number): void } | null;
  readonly viewer: { resize(): void } | null;
  readonly tilePlacesOwner: Places | null;
  clearTurboHoverDetails(): void;
  clearTurboHover(): void;
  highlightSequenceOnVTL(id: string | null): void;
  pickTurboRepresentative(point: { x: number; y: number }, view: HoverView, signal: AbortSignal, preview: boolean): Promise<__esri.Graphic | null>;
  pickTurboGraphic(point: { x: number; y: number }, view: HoverView, signal: AbortSignal, radius: number): Promise<__esri.Graphic | null>;
  updateTurboHover(graphic: __esri.Graphic, x: number, y: number): void;
  hitTestHoverLayers(view: HoverView, point: { x: number; y: number }): Promise<{ results: any[] }>;
  pickMapFeature(point: { x: number; y: number }, view: HoverView, signal: AbortSignal): Promise<unknown>;
  log(message: string): void;
  placesBusy(): boolean;
  updateTurboPickWarning(message: string, action: 'retry'): void;
  text(key: MessageKey): string;
}

/** Bind map-leave/touch/replay cleanup and return the coalesced pointer dispatcher.
 * Coverage starts independently of SDK/detection latency; existing owners retain all requests and status tokens.
 * The caller installs the returned pointer callback after its click handler, preserving listener order.
 */
export function createMapHoverHandler(view: HoverView, host: MapHoverHost): (pointer: MapHoverPointer) => void {
  // Share the queued pointer task with map-leave and touch cleanup.
  let hoverHitTestTimeout: ReturnType<typeof setTimeout> | null = null;

  // Hide turbo hover tooltip when mouse leaves the map container
  host.leaveCleanup?.();
  host.leaveCleanup = null;
  const mapContainer = view.container as HTMLElement;
  const hoverResume = new CoverageHoverResume(view, (revision, pointer) => {
    if (host.currentView !== view || view.destroyed || view.stationary === false || view.interacting || !mapContainer || mapContainer.isConnected === false ||
      host.closed || !host.turboModeActive || revision !== host.coverageRevision ||
      !host.coverageLayer || view.map?.findLayerById(LAYER_IDS.COVERAGE_VT) !== host.coverageLayer ||
      mapContainer?.ownerDocument?.visibilityState === 'hidden' || pointer.x < 0 || pointer.y < 0 ||
      pointer.x > view.width || pointer.y > view.height) return false;
    // Do not revive map hover under an overlaid form, popup or a different container.
    const x = pointer.native?.clientX, y = pointer.native?.clientY;
    if (Number.isFinite(x) && Number.isFinite(y) && typeof mapContainer.ownerDocument?.elementFromPoint === 'function') {
      const bounds = mapContainer.getBoundingClientRect();
      if (Math.abs(x! - bounds.left - pointer.x) > 1 || Math.abs(y! - bounds.top - pointer.y) > 1) return false;
      const element = mapContainer.ownerDocument.elementFromPoint(x!, y!);
      return !!element && mapContainer.contains(element) && !element.closest('button,input,select,textarea,[role="dialog"],.esri-popup');
    }
    return true;
  }, pointer => host.hoverHandler?.(pointer));
  host.hoverResume = hoverResume;
  if (mapContainer) {
    const onMapLeave = () => {
      hoverResume.leave();
      host.places?.setHover(null);
      host.tilePlaces?.cancelHover();
      host.hoverAbort?.abort();
      host.clearTurboHoverDetails();
      if (hoverHitTestTimeout) {
        clearTimeout(hoverHitTestTimeout);
        hoverHitTestTimeout = null;
      }
      // Clear tooltip
      if (host.tooltip) {
        host.tooltip.style.display = "none";
      }
      // Clear hover animation
      host.clearTurboHover();

      host.highlightSequenceOnVTL(null);
      // Clear pending tooltip fetch
      if (host.detailsTimer) {
        clearTimeout(host.detailsTimer);
        host.detailsTimer = null;
      }
      host.hoveredId = null;
    };
    const touchHover = new CoverageTouchHover(mapContainer, onMapLeave);
    host.touchHover = touchHover;
    mapContainer.addEventListener("mouseleave", onMapLeave);
    host.leaveCleanup = () => {
      touchHover.dispose();
      if (host.touchHover === touchHover) host.touchHover = null;
      hoverResume.dispose();
      if (host.hoverResume === hoverResume) { host.hoverResume = null; host.hoverHandler = null; }
      mapContainer.removeEventListener("mouseleave", onMapLeave);
      if (hoverHitTestTimeout) clearTimeout(hoverHitTestTimeout);
    };
  }

  return (evt) => {
    if (host.touchHover?.shouldIgnore(evt)) return;
    if (host.workspaceLocation?.active) return;
    host.hoverResume?.move(evt);
    host.alignment?.pointer(view, { x: evt.x, y: evt.y });
    host.hoverAbort?.abort();
    if (host.hoveredScreen && (evt.x - host.hoveredScreen.x) ** 2 + (evt.y - host.hoveredScreen.y) ** 2 > (view.zoom < 14 ? TURBO_LIMITS.pickRadiusPx : TURBO_LIMITS.hoverRadiusPx) ** 2) {
      host.clearTurboHoverDetails();
    }
    const hoverController = new AbortController();
    host.hoverAbort = hoverController;
    // Immediately clear the previous pending hitTest
    if (hoverHitTestTimeout) {
      clearTimeout(hoverHitTestTimeout);
    }

    // Capture exact screen coordinates for the deferred hitTest
    const rect = (view.container as HTMLElement)?.getBoundingClientRect();
    const globalX = evt.native?.clientX ?? ((rect?.left || 0) + evt.x);
    const globalY = evt.native?.clientY ?? ((rect?.top || 0) + evt.y);
    const screenPoint = { x: evt.x, y: evt.y };

    // Coalesce queued pointer events without waiting for the pointer to stop.
    // Coverage picking runs independently of SDK/object hit-test latency.
    hoverHitTestTimeout = setTimeout(async () => {
      try {
        if (hoverController.signal.aborted || host.currentView !== view) return;
        const finishCoveragePreview = host.turboModeActive && host.coverageLayer
          ? host.previewStatus?.begin(hoverController.signal) : undefined;
        const finishPending = host.turboModeActive && host.coverageLayer && view.zoom < 14
          ? host.pendingHover?.begin(view, screenPoint, hoverController.signal) : undefined;
        const coverage = host.turboModeActive && host.coverageLayer
          ? (view.zoom < 14
            ? host.pickTurboRepresentative(screenPoint, view, hoverController.signal, true)
            : host.pickTurboGraphic(screenPoint, view, hoverController.signal, TURBO_LIMITS.hoverRadiusPx))
          : Promise.resolve(null);
        let featureOwnsHover = false;
        const coverageFeedback = coverage.then(picked => {
          finishPending?.();
          if (hoverController.signal.aborted || featureOwnsHover || host.currentView !== view) return;
          if (picked) host.updateTurboHover(picked, globalX, globalY);
          else host.clearTurboHoverDetails();
        }).catch(() => { if (!hoverController.signal.aborted && !featureOwnsHover) host.clearTurboHoverDetails(); }).finally(() => { finishPending?.(); finishCoveragePreview?.(); });
        const hit = await host.hitTestHoverLayers(view, screenPoint);
        if (hoverController.signal.aborted || host.currentView !== view) return;

        // 1. POINT CLOUD HOVER SYNC (Dual-Hover Feature)
        const pcHit = hit.results.find((r: any) => {
          const l = r.layer || (r.graphic && r.graphic.layer);
          return l && l.id === "point-cloud-layer";
        });

        if (pcHit && (pcHit as any).graphic && !host.cloudMap?.updating) {
          const attrs = (pcHit as any).graphic.attributes || {};
          const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;
          const rawObjectId = attrs.ObjectID ?? attrs.objectid;
          const idx = rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1;

          if (host.cloudRenderer && host.cloudRenderer.selectedIndex !== idx) {
            host.cloudRenderer.setHighlight(idx);

            if (host.viewer) {
              host.viewer.resize();
            }
          }
        } else {
          // Clear point cloud highlight if mouse moves off the cloud
          if (host.cloudRenderer && host.cloudRenderer.selectedIndex !== -1) {
            host.cloudRenderer.setHighlight(-1);
            if (host.viewer) host.viewer.resize();
          }
        }

        // 2. STANDARD OBJECT / TRAFFIC SIGN HOVER LOGIC
        const obj = hit.results.find((r: any) => {
          const l = r.layer || (r.graphic && r.graphic.layer);
          return l && (l.id === LAYER_IDS.OBJECTS_FL || l.id === LAYER_IDS.TRAFFIC_SIGNS_FL);
        });

        // Optional detection failures must not dismiss independently successful
        // imagery hover. A successful feature still owns the tooltip below.
        const mapFeature = obj || await host.pickMapFeature(screenPoint, view, hoverController.signal).catch(() => {
          if (!hoverController.signal.aborted && host.currentView === view)
            host.log("[Hover] Optional feature lookup failed; imagery hover remains available.");
          return null;
        });
        if (hoverController.signal.aborted || host.currentView !== view) return;
        if (mapFeature && (mapFeature as any).graphic) {
          host.places?.setHover(null);
          featureOwnsHover = true;
          host.clearTurboHoverDetails();
          const attrs = (mapFeature as any).graphic.attributes || {};
          if (host.tooltip) {
            const bounds = view.container?.getBoundingClientRect() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
            renderMapFeatureHoverLabel(host.tooltip, attrs.name || attrs.value || "Map feature", bounds, globalX, globalY);
          }
          return; // Stop here, don't trigger Turbo hover
        }

        let place = host.places?.hit(hit.results);
        let nativeNearbyCount = 0;
        const nativeHoverSource = host.tilePlaces, nativeHoverOwner = host.places;
        const nativeHoverVersion = nativeHoverSource?.version;
        const nativeHoverCurrent = () => !hoverController.signal.aborted && host.currentView === view &&
          host.tilePlaces === nativeHoverSource && host.places === nativeHoverOwner && nativeHoverSource?.version === nativeHoverVersion;
        if (!place && nativeHoverSource && nativeHoverOwner === host.tilePlacesOwner && !host.placesBusy()) {
          // Keep existing image-dot hover responsive and authoritative.
          const coverageHit = await coverage.catch(() => null);
          if (!nativeHoverCurrent()) return;
          if (!coverageHit) {
            const nativeHit = await nativeHoverSource.resolveHover(screenPoint, hoverController.signal);
            if (!nativeHoverCurrent()) return;
            place = nativeHit ? tilePlace(nativeHit.attributes, nativeHit.geometry) : null;
            nativeNearbyCount = nativeHit?.candidates?.length || 0;
            nativeHoverOwner?.setMapHover(place);
          }
        }
        if (place && !hoverController.signal.aborted) {
          featureOwnsHover = true;
          host.clearTurboHoverDetails();
          host.places?.setHover(place.id);
          if (host.tooltip) {
            const bounds = view.container?.getBoundingClientRect() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
            renderMapFeatureHoverLabel(host.tooltip, host.places?.hoverLabel(place, nativeNearbyCount) || place.name, bounds, globalX, globalY);
          }
          return;
        }
        host.places?.setHover(null);
        await coverageFeedback;
      } catch (err) {
        if (!hoverController.signal.aborted) {
          host.places?.setHover(null);
          host.clearTurboHoverDetails();
          if (host.turboModeActive && host.currentView === view) host.updateTurboPickWarning(host.text('appImageLookupCouldNotLoadCheckYourConnectionAnd'), "retry");
        }
      }
    }, 0); // Process the latest queued pointer position.
  };

}
