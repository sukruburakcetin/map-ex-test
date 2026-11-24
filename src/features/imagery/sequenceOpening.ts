import type { LiveSequenceFrames, ViewerFrameImage } from './LiveSequenceFrames';
import type { SequenceCoordinate } from './sequenceCoordinates';
import type { SequencePerformance } from './SequencePerformance';

/** Only the SDK image fields consumed while opening a capture. */
export interface OpeningImage extends ViewerFrameImage { capturedAt?: number; cameraType?: string; }
export interface SequenceOpeningViewer {
  getImage(): Promise<OpeningImage | null>;
  moveTo(id: string): Promise<OpeningImage | null>;
}
export interface SelectionSnapshot {
  sequenceImages: SequenceCoordinate[];
  imageId: string | null;
  sequenceId: string | null;
  selectedSequenceId: string | null;
}
/** Selection state writes; nullable identities retain the existing failed-open recovery contract. */
export interface OpeningState {
  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];
  imageId: string | null;
  sequenceId: string | null;
  selectedSequenceId?: string | null;
  sequenceRouteLoading?: boolean;
  isLoading: boolean;
  imageryRepresentative?: boolean;
  sequenceRouteProgress?: string | undefined;
  selectionError?: string | undefined;
  selectionCanRetry?: boolean;
  hasTimeTravel: boolean;
  nearbyLoading?: boolean;
}
type Timing = ReturnType<SequencePerformance['begin']>;
type Retry = { sequenceId: string; imageId: string; clickPoint?: { lon: number; lat: number }; nearestToClick?: boolean };
type Cancellable = { cancel(): void };

/** Live capabilities for one foreground selection. Existing owners retain data, cancellation and presentation lifetimes. */
export interface SequenceOpeningHost<Viewer extends SequenceOpeningViewer, View extends object, Graphic extends { attributes?: { image_id?: unknown } }> {
  alignOpeningPanorama?(viewer: Viewer, image: OpeningImage, bearing: number): void;
  readonly state: Readonly<Pick<OpeningState, 'sequenceImages' | 'imageId' | 'sequenceId'> & {
    sequenceRouteLoading?: boolean;
    turboModeActive?: boolean;
    isElevationProfileActive?: boolean;
    jimuMapView?: { view: View } | null;
  }>;
  readonly viewer: Viewer | null;
  readonly routeOverlayVisible: boolean;
  readonly nearbyDiscovery: Cancellable | null;
  readonly stopRoutePreview: (() => void) | null;
  sharedStartupImageId: string | null;
  sharedStartupBearing: number | null;
  isFlyInActive: boolean;
  selectionRequestId: number;
  localSequenceDeferredRequest: number | null;
  selectionAbort: AbortController | null;
  readonly liveSequenceFrames: Pick<LiveSequenceFrames, 'sequenceId' | 'complete' | 'current' | 'find' | 'cancelPending' | 'beginSelection' | 'remember' | 'begin' | 'finish'>;
  readonly liveSequenceLine: { sequenceId: string } | null;
  readonly liveFrameDetails: { clear(): void };
  readonly timeTravelAvailability: { clear(): void } | null;
  readonly cachedSequencePreview: { clear(): void } | null;
  lastSuccessfulSelection: SelectionSnapshot | null;
  selectionRetry: Retry | null;
  currentGreenGraphic: Graphic | null;
  userPaused: boolean;
  readonly currentImageBearing: { select(viewer: Viewer | null, id: string, nearest: boolean): void; image(viewer: Viewer, id: string): void } | null;
  readonly nativeSequenceSelection: { select(id: null): unknown };
  readonly sequencePerformance: Pick<SequencePerformance, 'begin' | 'count'> | null;
  imageSequenceTiming: Timing | undefined;
  imageryOpeningRequest: number | null;
  readonly placesExploreAbort: AbortController | null;
  readonly places: { controller: { sync(): void } } | null;
  readonly backgroundRequests: { setPaused(paused: boolean): void } | null;
  readonly reverseAddressEnrichment: Cancellable;
  readonly detectionAbort: AbortController | null;
  readonly accessToken: string;
  readonly profileConfirmedViewer: Viewer | null;
  readonly profileConfirmedImageId: string | null;
  readonly lastBearing: number;
  readonly coneLengths: readonly number[];
  readonly coneSpreads: readonly number[];
  readonly zoomStepIndex: number;
  readonly sequenceCoordsCache: Record<string, SequenceCoordinate[]>;
  commit<Key extends keyof OpeningState>(update: Pick<OpeningState, Key> | (() => Pick<OpeningState, Key> | null), after?: () => void): void;
  stopMapAnimation(): void;
  highlightNearbyPin(image: null): void;
  clearGreenPulse(): void;
  clearConeGraphics(): void;
  clearElevationProfile(): void;
  nearestCoverageImage(sequence: string, point: { lon: number; lat: number }, signal: AbortSignal): Promise<string | null | undefined>;
  getSequencesInBBox(lon: number, lat: number, token: string): Promise<{ sequenceId: string; images: { id: string; dist: number }[] }[]>;
  ensureImageViewer(image: string): void;
  waitForSequencePaint(signal: AbortSignal): Promise<unknown>;
  updateNativeSequenceSelection(): void;
  getSelectedImageCoords(sequence: string, image: string, signal: AbortSignal): Promise<SequenceCoordinate>;
  checkForTimeTravel(image: string): unknown;
  drawPulsingPoint(lon: number, lat: number, color: number[], image: string): Graphic | null;
  refreshSequenceMarkerWindow(): Promise<unknown>;
  drawPoint(lon: number, lat: number): void;
  updateProfileIndicator(): void;
  drawCone(lon: number, lat: number, bearing: number, length: number, spread: number): void;
  clearActiveSequenceGraphics(sequence: string, preserve: boolean): void;
  clearActiveSequenceLayer(): void;
  prepareDemandSequence(sequence: string, request: number, controller: AbortController, view: View): Promise<unknown>;
  translate(message: string): string;
}

/** Open one capture before optional route/metadata work, rejecting superseded selection and view results.
 * Request ownership, recovery and metrics retain their original order. The caller supplies live owners;
 * no additional route enumeration, cache, request queue or SDK subscription is created here.
 * @param sequenceId Coverage or associated-image sequence context.
 * @param startImageId Exact capture, or representative capture when nearest-to-click resolution is requested.
 * @param clickPoint Optional WGS84 marker/resolution anchor.
 * @param representative Whether initial UI marks this capture as representative.
 * @param nearestToClick Resolve a line pick locally before opening imagery.
 * @param clickStartedAt Existing performance-clock start time, when supplied by the caller.
 * @param host Live selection, viewer and presentation capabilities.
 */
export async function openSequence<Viewer extends SequenceOpeningViewer, View extends object, Graphic extends { attributes?: { image_id?: unknown } }>(
  sequenceId: string, startImageId: string, clickPoint: { lon: number; lat: number } | undefined,
  representative: boolean, nearestToClick: boolean, clickStartedAt: number | undefined,
  host: SequenceOpeningHost<Viewer, View, Graphic>, panoramaBearing?: number): Promise<void> {
    host.nearbyDiscovery?.cancel();
    host.highlightNearbyPin?.(null);
    host.stopRoutePreview?.();
    if (host.sharedStartupImageId && String(startImageId) !== host.sharedStartupImageId) {
      host.sharedStartupImageId = null; host.sharedStartupBearing = null; host.isFlyInActive = false;
      host.stopMapAnimation();
    }
    // Reuse completed geometry in its current view. Other selections open first,
    // then reuse cached geometry or request only a nearby coordinate window.
    const loadedSequence = host.state.sequenceImages;
    const reuseLoadedRoute = !nearestToClick && !!host.viewer &&
      host.state.sequenceId === sequenceId && !host.state.sequenceRouteLoading &&
      host.lastSuccessfulSelection?.sequenceImages === loadedSequence &&
      host.lastSuccessfulSelection?.sequenceId === sequenceId &&
      (host.state.turboModeActive || host.routeOverlayVisible) &&
      host.liveSequenceFrames.sequenceId === sequenceId && host.liveSequenceFrames.complete === loadedSequence &&
      host.liveSequenceLine?.sequenceId === sequenceId && !!host.liveSequenceFrames.find(String(startImageId));
    const requestId = ++host.selectionRequestId;
    host.localSequenceDeferredRequest = requestId;
    host.selectionAbort?.abort(); host.liveSequenceFrames.cancelPending(); host.liveFrameDetails.clear();
    if (String(host.state.imageId) !== String(startImageId)) host.timeTravelAvailability?.clear();
    host.cachedSequencePreview?.clear();
    const controller = new AbortController(); host.selectionAbort = controller;
    const previous = host.viewer ? host.lastSuccessfulSelection : null;
    host.selectionRetry = { sequenceId, imageId: startImageId, clickPoint, nearestToClick };
    const current = () => requestId === host.selectionRequestId && !controller.signal.aborted && host.state.jimuMapView?.view === jimuMapView?.view;
    if (host.currentGreenGraphic?.attributes?.image_id !== String(startImageId)) host.clearGreenPulse();
    host.userPaused = true;
    host.currentImageBearing?.select(host.viewer, String(startImageId), nearestToClick);
    host.clearConeGraphics();
    // Cancelled highlight jobs keep their already-painted graphics. Retire the
    // old selected role now, before awaiting image navigation, without touching
    // coverage styles or the geometry cache. Same-sequence navigation reuses it.
    if (host.state.turboModeActive && host.state.sequenceId && host.state.sequenceId !== sequenceId) void host.nativeSequenceSelection.select(null);

    const { jimuMapView } = host.state;
    if (!jimuMapView) return;
    const imageTiming = typeof document !== 'undefined' && document.visibilityState !== 'visible'
      ? undefined : host.sequencePerformance?.begin('click-image', clickStartedAt);
    host.imageSequenceTiming = imageTiming;
    host.sequencePerformance?.count('clicks');
    host.imageryOpeningRequest = requestId;
    host.placesExploreAbort?.abort(); host.places?.controller.sync();
    host.backgroundRequests?.setPaused(true);
    host.reverseAddressEnrichment.cancel();
    host.detectionAbort?.abort();

    if (clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {
      host.drawPulsingPoint(clickPoint.lon, clickPoint.lat, [0, 255, 0, 1], startImageId);
    }
    host.commit({ nearbyLoading: false, isLoading: true, imageryRepresentative: representative && !nearestToClick, sequenceRouteProgress: undefined, sequenceRouteLoading: false, selectionError: undefined, selectionCanRetry: false });

    if (host.state.isElevationProfileActive && !reuseLoadedRoute) host.clearElevationProfile();

    let imageOpened = false;
    let viewerTiming: ReturnType<SequencePerformance['begin']> | undefined;
    try {
      // Fetch only the selected image first; full route loading must not block opening imagery.
      // Lines need coordinate resolution; exact image points keep their fast opening path.
      if (nearestToClick && clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {
        let nearest = await host.nearestCoverageImage(sequenceId, clickPoint, controller.signal);
        if (!current()) return;
        if (!nearest) {
          // Resolve only this location; ordinary clicks never enumerate a route.
          const nearby = await host.getSequencesInBBox(clickPoint.lon, clickPoint.lat, host.accessToken);
          if (!current()) return;
          const candidates = nearby.find(candidate => String(candidate.sequenceId) === String(sequenceId))?.images || [];
          nearest = candidates.reduce((best, image) => !best || image.dist < best.dist ? image : best, undefined as typeof candidates[number] | undefined)?.id;

        }
        if (!nearest) throw new Error("No image coordinates are available for this sequence");
        startImageId = nearest;
        host.selectionRetry = { sequenceId, imageId: startImageId };
      }
      // Seed tracking cheaply so the viewer's image event belongs to this request.
      // No Graph coordinate lookup or sequence restyle may delay moveTo.
      host.liveSequenceFrames.beginSelection(sequenceId);
      const seed = host.liveSequenceFrames.complete || [];
      await new Promise<void>(resolve => {
        const cancelled = () => resolve(); controller.signal.addEventListener("abort", cancelled, { once: true });
        host.commit(() => !current() ? null : ({
          sequenceImages: seed, imageId: startImageId, sequenceId,
          selectedSequenceId: sequenceId, hasTimeTravel: false
        }), () => {
          controller.signal.removeEventListener("abort", cancelled); resolve();
        });
      });
      if (!current()) return;
      host.ensureImageViewer(startImageId);
      const viewer = host.viewer;
      if (!viewer) throw new Error("Image viewer is not ready");
      // Separate widget dispatch latency from the SDK's image-opening promise.
      if (clickStartedAt !== undefined) host.sequencePerformance?.begin('click-dispatch', clickStartedAt).finish();
      viewerTiming = host.sequencePerformance?.begin('viewer-open');
      const openedImage = previous?.imageId === startImageId ? await viewer.getImage() : await viewer.moveTo(startImageId);
      if (!current() || host.viewer !== viewer) return;
      viewerTiming?.finish();
      imageOpened = true;
      if (panoramaBearing !== undefined && openedImage?.cameraType === 'spherical' && String(openedImage.id) === String(startImageId)) {
        try { host.alignOpeningPanorama?.(viewer, openedImage, panoramaBearing); }
        catch { /* The successfully opened capture remains usable at its SDK heading. */ }
      }
      // Give the confirmed image a visible browser frame before optional cache/metadata work.
      host.commit({ isLoading: false, imageryRepresentative: false });
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && typeof requestAnimationFrame === 'function')
        await host.waitForSequencePaint(controller.signal);
      if (!current() || host.viewer !== viewer) return;
      // moveTo resolution alone is not proof that its camera has rendered. Reuse only
      // the SDK image event's identity, after the already-existing presentation wait.
      if (host.profileConfirmedViewer === viewer && host.profileConfirmedImageId === String(startImageId) && String(openedImage?.id) === String(startImageId))
        host.currentImageBearing?.image(viewer, String(startImageId));
      imageTiming?.finish();
      host.imageryOpeningRequest = null;

      host.places?.controller.sync();
      host.backgroundRequests?.setPaused(false);
      host.updateNativeSequenceSelection();
      const location = openedImage?.originalLngLat ?? openedImage?.lngLat;
      const selected = location && Number.isFinite(location.lng) && Number.isFinite(location.lat)
        ? { id: startImageId, lon: location.lng, lat: location.lat, captured_at: openedImage!.capturedAt }
        : await host.getSelectedImageCoords(sequenceId, startImageId, controller.signal);
      if (!current()) return;
      host.liveSequenceFrames.remember(sequenceId, [selected]);
      const updatedSequence = host.liveSequenceFrames.complete || [selected];
      host.commit(() => !current() ? null : ({ sequenceImages: updatedSequence }));
      host.checkForTimeTravel(startImageId);
      host.currentGreenGraphic = host.drawPulsingPoint(selected.lon, selected.lat, [0, 255, 0, 1], startImageId);

      if (reuseLoadedRoute) {
        host.localSequenceDeferredRequest = null;
        void host.refreshSequenceMarkerWindow();
        host.commit({ isLoading: false, imageryRepresentative: false });
        if (clickPoint) host.drawPoint(clickPoint.lon, clickPoint.lat);
        if (host.state.isElevationProfileActive) host.updateProfileIndicator();
        const active = host.liveSequenceFrames.current || host.liveSequenceFrames.find(host.state.imageId);
        if (active && String(active.id) === String(host.state.imageId)) host.drawCone(active.lon, active.lat, host.lastBearing || 0, host.coneLengths[host.zoomStepIndex], host.coneSpreads[host.zoomStepIndex]);
        host.lastSuccessfulSelection = { sequenceImages: loadedSequence, imageId: host.state.imageId, sequenceId, selectedSequenceId: sequenceId };
        host.selectionRetry = null;
        return;
      }

      if (previous?.sequenceId && previous.sequenceId !== sequenceId) host.clearActiveSequenceGraphics(previous.sequenceId, true);
      host.clearActiveSequenceLayer();
      host.commit({ isLoading: false });
      const active = host.liveSequenceFrames.current || host.liveSequenceFrames.find(host.state.imageId) || selected;
      if (!host.liveSequenceFrames.current && String(active.id) === String(host.state.imageId)) {
        host.drawPulsingPoint(active.lon, active.lat, [0, 255, 0, 1], active.id);
        host.drawCone(active.lon, active.lat, host.lastBearing || 0, host.coneLengths[host.zoomStepIndex], host.coneSpreads[host.zoomStepIndex]);
      }
      host.lastSuccessfulSelection = { sequenceImages: updatedSequence, imageId: active.id, sequenceId, selectedSequenceId: sequenceId };
      void host.prepareDemandSequence(sequenceId, requestId, controller, jimuMapView.view);
    } catch (err) {
      if (!current()) return;
      host.localSequenceDeferredRequest = null;
      if (imageOpened) {
        host.commit({ sequenceRouteLoading: false, selectionError: host.translate("Image is open, but map tracking could not load. Retry to refresh its location."), selectionCanRetry: true });
        return;
      }
      host.commit({ sequenceRouteLoading: false });
      host.clearGreenPulse(); host.clearConeGraphics();
      if (previous) {
        if (previous.sequenceId) {
          host.liveSequenceFrames.begin(previous.sequenceId, previous.sequenceImages);
          if (host.sequenceCoordsCache[previous.sequenceId] === previous.sequenceImages) host.liveSequenceFrames.finish(previous.sequenceId, previous.sequenceImages);
        }
        host.commit(previous, () => {
          if (!current()) return;
          const image = previous.sequenceImages.find(p => p.id === previous.imageId);
          if (image) {
            host.drawPulsingPoint(image.lon, image.lat, [0, 255, 0, 1], image.id);
            host.drawCone(image.lon, image.lat, host.lastBearing || 0, host.coneLengths[host.zoomStepIndex], host.coneSpreads[host.zoomStepIndex]);
          }
        });
      }
      if (!previous) { host.lastSuccessfulSelection = null; host.commit({ imageId: null, sequenceImages: [], sequenceId: null, selectedSequenceId: null }); }
      const status = (err as { status?: number } | null)?.status;
      const unavailable = status === 401 || status === 403 || status === 404;
      host.commit({ selectionError: unavailable ? host.translate("This image is unavailable. Choose another point.") : host.translate("Image could not load. Check your connection, retry, or choose another point."), selectionCanRetry: !unavailable });
    } finally {
      viewerTiming?.cancel();
      imageTiming?.cancel();
      if (host.imageSequenceTiming === imageTiming) host.imageSequenceTiming = undefined;
      if (requestId === host.selectionRequestId) {
        host.imageryOpeningRequest = null;
        host.places?.controller.sync();
        host.backgroundRequests?.setPaused(false);
        host.commit({ isLoading: false });
      }
    }
}
