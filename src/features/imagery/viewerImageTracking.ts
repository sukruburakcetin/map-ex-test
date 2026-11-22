import type { LiveSequenceFrames, LiveSequenceFrame, ViewerFrameImage } from './LiveSequenceFrames';
import type { SequenceCoordinate, SequenceProgress } from './sequenceCoordinates';
import type { DetectionNoteSelection } from '../detections/detectionNote';

export interface ViewerImageEvent { image: ViewerFrameImage & { id: string | number }; }
interface SelectionRetry { sequenceId: string; imageId: string; clickPoint?: { lon: number; lat: number }; nearestToClick?: boolean; }
/** State keys permitted at this feature's commit boundary; generic picks retain React's partial-update typing. */
export interface ViewerTrackingState {
  imageId: string | null;
  sequenceId: string | null;
  selectedSequenceId: string | null;
  sequenceImages: SequenceCoordinate[];
  sequenceRouteLoading: boolean;
  sequenceRouteProgress: SequenceProgress | undefined;
  isLoading: boolean;
  imageryRepresentative: boolean;
  selectionError: string | undefined;
  selectionCanRetry: boolean;
  viewerDetectionNote: DetectionNoteSelection | null;
  detectionNotePicking: boolean;
}

/** Live image-event capabilities. Frame caches, presentation and request owners remain supplied by the caller. */
export interface ViewerImageTrackingHost<Viewer extends object, View extends object> {
  readonly currentViewer: Viewer | null;
  readonly currentView: View | undefined;
  readonly loading: boolean;
  readonly imageId: string | null;
  readonly sequenceId: string | null;
  readonly viewerNote: DetectionNoteSelection | null;
  readonly profileActive: boolean;
  readonly detectionsActive: boolean;
  readonly solarActive: boolean;
  readonly syncMap: boolean | undefined;
  openingRequest: number | null;
  retry: SelectionRetry | null;
  readonly bearing: { image(viewer: Viewer | null, id: string): void } | null;
  confirmedViewer: Viewer | null;
  confirmedImageId: string | null;
  readonly initialImage: boolean;
  readonly noteReview: { cancel(): void } | null;
  readonly stopRoute: (() => void) | null;
  readonly detectionAbort: AbortController | null;
  readonly timeTravel: { cancelUnless(id: string): void } | null;
  readonly nearby: { cancel(): void } | null;
  readonly frames: Pick<LiveSequenceFrames, 'resolve' | 'isCurrent' | 'sequenceId' | 'visible'>;
  readonly places: { controller: { sync(): void } } | null;
  readonly performance: { playbackFrame(playing: boolean, visible: boolean): void } | null;
  readonly paused: boolean;
  readonly address: { cancel(): void };
  requestId: number;
  selectionAbort: AbortController | null;
  readonly background: { setPaused(paused: boolean): void } | null;
  deferredRequest: number | null;
  optimisticId: string | null;
  readonly details: { queue(work: () => void): void };
  readonly flying: boolean;
  highlightNearbyPin(image: null): void;
  updateProfileIndicator(): void;
  applyCustomCameraAngle(): void;
  cancelDetectionNoteLocation(): void;
  clearPendingNoteGraphic(): void;
  commit<Key extends keyof ViewerTrackingState>(update: Pick<ViewerTrackingState, Key> | (() => Pick<ViewerTrackingState, Key> | null), after?: () => void): void;
  updatePlacesCamera(lon: number, lat: number): void;
  clearActiveSequenceLayer(): void;
  prepareDemandSequence(sequence: string, request: number, controller: AbortController, view: View): Promise<unknown>;
  checkAndLoadNextPointCloud(id: string): unknown;
  updateMinimapTracking(): void;
  refreshSequenceMarkerWindow(): Promise<unknown>;
  refreshLocalSequence(): Promise<unknown>;
  syncMapToImage(frame: LiveSequenceFrame, view: View): void;
  loadDetections(id: string): unknown;
  updateViewerFieldNoteMarkers(): void;
  checkForTimeTravel(id: string): unknown;
  updateSolarGraphics(): unknown;
  fetchReverseGeocode(lat: number, lon: number): unknown;
  updateUrlWithCurrentImage(id: string, lat: number, lon: number): void;
  fetchNearbyImages(lat: number, lon: number, id: string): unknown;
  hasDraft(): boolean;
  clearDetectionMarkers(): void;
  clearDetectionImageData(): void;
  clearPanoramaLabels(): void;
  publishPulse(frame: LiveSequenceFrame): void;
  rememberSelection(image: string): void;
}

/** Track one SDK-confirmed image, preserving image-first publication and latest-frame-only secondary work.
 * The caller retains registration and cone binding. No new awaits, queues, requests or frame stores are introduced.
 */
export async function trackViewerImage<Viewer extends object, View extends object>(event: ViewerImageEvent,
  profileEventViewer: Viewer | null, redrawCone: (lon: number, lat: number) => void,
  host: ViewerImageTrackingHost<Viewer, View>): Promise<void> {

  if (host.currentViewer !== profileEventViewer) return;
  // A previous moveTo can emit while a newer click is opening. It must not
  // turn into a lateral jump that cancels the user's latest image request.
  if ((host.loading || host.openingRequest != null) && host.retry &&
    String(event.image.id) !== String(host.retry.imageId)) return;
  host.bearing?.image(profileEventViewer, String(event.image.id));
  host.highlightNearbyPin(null);
  const firstImageForViewer = host.confirmedViewer !== profileEventViewer;
  host.confirmedViewer = profileEventViewer;
  host.confirmedImageId = String(event.image.id);
  host.updateProfileIndicator();
  // Apply custom angle if set in config
  // Only apply custom angle on the initial load, not during sequence navigation
  if (host.initialImage && firstImageForViewer) {
    host.applyCustomCameraAngle();
  }
  const newId = String(event.image.id);
  if (newId !== String(host.imageId)) host.noteReview?.cancel();
  host.stopRoute?.();
  if (host.viewerNote && host.viewerNote.imageId !== newId) {
    host.cancelDetectionNoteLocation();
    if (!host.hasDraft()) host.clearPendingNoteGraphic();
    host.commit({ viewerDetectionNote: null, detectionNotePicking: false });
  }
  host.clearDetectionMarkers();
  host.clearDetectionImageData();
  host.clearPanoramaLabels();
  host.detectionAbort?.abort();
  host.timeTravel?.cancelUnless(newId);
  host.nearby?.cancel();
  const view = host.currentView;
  if (!view) return;
  let newImg: LiveSequenceFrame | null;
  try { newImg = await host.frames.resolve(event.image); }
  catch (error) {
    if (host.currentViewer === profileEventViewer) console.warn('[Mapillary tracking] Current image metadata unavailable:', error);
    return;
  }
  if (!newImg || host.currentViewer !== profileEventViewer || host.currentView !== view || !host.frames.isCurrent(newImg)) return;
  const frame = newImg;
  if (host.places) host.updatePlacesCamera(frame.lon, frame.lat);
  host.performance?.playbackFrame(!host.paused, typeof document === 'undefined' || document.visibilityState === 'visible');
  host.address.cancel();
  const didLateralJump = host.sequenceId !== frame.sequenceId;
  if (didLateralJump) {
    // A sequence change starts only cache reuse and a nearby window; tracking never awaits it.
    const routeRequestId = ++host.requestId; host.selectionAbort?.abort();
    host.openingRequest = null;
    host.places?.controller.sync();
    host.background?.setPaused(false);
    host.retry = null;
    host.deferredRequest = routeRequestId;
    const controller = new AbortController(); host.selectionAbort = controller;
    host.clearActiveSequenceLayer();
    host.commit(() => !host.frames.isCurrent(frame) || host.currentView !== view || host.currentViewer !== profileEventViewer ? null : ({
      sequenceId: frame.sequenceId, selectedSequenceId: frame.sequenceId,
      sequenceImages: [frame], sequenceRouteLoading: false, sequenceRouteProgress: undefined,
      isLoading: false, imageryRepresentative: false, selectionError: undefined, selectionCanRetry: false
    }), () => {
      if (routeRequestId === host.requestId && !controller.signal.aborted && host.frames.sequenceId === frame.sequenceId && host.currentView === view)
        void host.prepareDemandSequence(frame.sequenceId, routeRequestId, controller, view);
    });
  }

  // Update State with New ID
  host.commit(() => !host.frames.isCurrent(frame) || host.currentView !== view || host.currentViewer !== profileEventViewer ? null : ({
    imageId: newId,
    sequenceImages: host.frames.visible(frame)
  }), () => {
    if (host.currentViewer !== profileEventViewer || host.currentView !== view || !host.frames.isCurrent(frame)) return;
    host.optimisticId = null; // real imageId is now in state, clear the optimistic selection

    // 1. FRESH LOOKUP: Ensure we have the exact coordinates for the active ID
    // This guarantees the graphics are drawn exactly where the new image is.
    const activeImg = frame;
    host.checkAndLoadNextPointCloud(newId);
    // GUARD: Only access coordinates if activeImg was found!
    if (activeImg) {
      // Update elevation readout and profile chart needle
      if (host.profileActive) {
        host.updateProfileIndicator();
      }
      // Reuse the same-image marker; drawPulsingPoint replaces a different image.
      host.publishPulse(activeImg);
      host.rememberSelection(newId);

      redrawCone(activeImg.lon, activeImg.lat);
      host.updateMinimapTracking();
      void host.refreshSequenceMarkerWindow();
      void host.refreshLocalSequence();

      // 3. Map Synchronization Logic (With Offset)
      if (host.syncMap === true) host.syncMapToImage(activeImg, view);
    }
  });

  // Secondary work is latest-frame-only and capped; it cannot delay tracking.
  host.details.queue(() => {
    if (host.currentViewer !== profileEventViewer || host.currentView !== view || !host.frames.isCurrent(frame)) return;
    if (host.detectionsActive) host.loadDetections(newId);
    host.updateViewerFieldNoteMarkers();
    host.checkForTimeTravel(newId);
    if (host.solarActive) host.updateSolarGraphics();
    host.fetchReverseGeocode(frame.lat, frame.lon);
    if (!host.flying) host.updateUrlWithCurrentImage(newId, frame.lat, frame.lon);
    if (host.paused) host.fetchNearbyImages(frame.lat, frame.lon, newId);
  });

}
