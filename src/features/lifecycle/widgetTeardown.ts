import { releaseViewerObservation, unlistenForViewerResize } from './viewerResize';
/** Minimal view identity used only to gate owned-map cleanup. SDK operations stay at the concrete boundary. */
export interface TeardownView { map?: unknown; graphics?: unknown; }
interface Removable { remove(): void; }

/** Fresh reset values preserve empty-array identity on every cleanup; shared map/view state remains separate. */
export function clearedWidgetState() {
  return {
    imageId: null,
    sequenceId: null,
    sequenceImages: [],
    placesActive: false, placesPanelOpen: false, selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null,
    lon: null,
    lat: null,
    isFullscreen: false,
    address: null,
    tilesActive: false,
    trafficSignsActive: false,
    objectsActive: false,
    availableSequences: [],
    selectedSequenceId: null,
    noImageMessageVisible: false,
    turboModeActive: false,
    turboFilterUsername: "",
    turboFilterOrganization: "",
    turboFilterStartDate: "",
    turboFilterEndDate: "",
    turboFilterIsPano: undefined,
    turboFilterOnFoot: undefined,
    showTurboFilterBox: false,
  };
}

/** Ordered teardown capabilities over existing owners; no replacement resource registry or lifetime counter. */
export interface WidgetTeardownHost<View extends TeardownView, Viewer extends { remove(): void }> {
  readonly view: View | undefined;
  container(): HTMLElement | null;
  clearOwnedGraphics(view: View): void;
  removeOwnedLayers(view: View): void;
  clearHoverCard(): void;
  resetSelection(patch: ReturnType<typeof clearedWidgetState>): void;
  resetDetectionState(): void;
  setTurboInactive(): void;
  readonly backgroundRequests: { clear(): void; setPaused(value: boolean): void } | null;
  readonly cachedSequencePreview: { clear(): void } | null;
  readonly cameraCone: { dispose(view: View | undefined): void } | null;
  readonly coverageSelectionTargets: { clear(): void };
  readonly currentImagePresentation: { release(): void } | null;
  readonly directionBindings: { clear(): void } | null;
  readonly hoverPreviewStatus: { dispose(): void } | null;
  readonly hoverTimingAbort: AbortController | null;
  readonly lasso: { clear(): void; cancelGesture(): void } | null;
  readonly liveFrameDetails: { clear(): void };
  readonly liveSequenceFrames: { clear(): void };
  readonly mapFeatureExportAbort: AbortController | null;
  readonly mapSpriteLoading: { clearAll(): void };
  readonly measurement: { dispose(): void; detachViewer(): void } | null;
  readonly nativeCurrentImageMarker: { clear(): void } | null;
  readonly nativeSequenceSelection: { detach(): void };
  readonly nearbyDiscovery: { cancelTimer(): void; cancelRequest(): void } | null;
  readonly pendingCoverageHover: { clear(): void } | null;
  readonly places: { controller: { sync(): void } } | null;
  readonly playbackBindings: { clear(): void } | null;
  readonly pointCloudAcquisition: { cancel(reason: 'cleanup'): void };
  readonly pointCloudCache: { clear(): void };
  readonly reverseAddressEnrichment: { clear(): void };
  readonly rings: { clear(): void } | null;
  readonly screenDirectionCone: { clear(): void } | null;
  readonly sequenceDemand: { clear(): void };
  readonly sequencePerformance: { playbackFrame(value: boolean): void; dispose(): void };
  readonly sequenceTileIndex: { clear(): void } | null;
  readonly sequenceVisibilityChange: () => void;
  readonly sharedTileRequests: { clear(): void } | null;
  readonly sight: { dispose(): void } | null;
  readonly stopRoutePreview: (() => void) | null;
  readonly timeTravelAvailability: { clear(): void } | null;
  readonly turboViewBindings: { clear(): void };
  readonly viewZoomBindings: { clear(): void };
  readonly zoomWarningTimer: { cancel(): void };
  readonly handleFullscreenChange: () => void;
  readonly handleNudgeKeyDown: (event: KeyboardEvent) => void;
  readonly handleNudgeKeyUp: (event: KeyboardEvent) => void;
  readonly handleWindowResize: () => void;
  imageryOpeningRequest: number | null;
  mapClickHandle: Removable | null;
  viewer: Viewer | null;
  objectsStationaryHandle: Removable | null;
  objectsZoomHandle: Removable | null;
  pointerMoveHandle: Removable | null;
  resizeObserver: ResizeObserver | null;
  tooltipDiv: HTMLDivElement | null;
  trafficSignsStationaryHandle: Removable | null;
  trafficSignsZoomHandle: Removable | null;
  cancelCaptureRouteGeneration(): void;
  cancelCoverageAnalysis(): void;
  cleanupEnvironment(reset: boolean, full: boolean): void;
  clearActiveSequenceLayer(): void;
  clearClickRipples(): void;
  clearDetectionOverlays(): void;
  clearDirectionHighlight(): void;
  clearElevationProfile(): void;
  clearFieldNotesGroup(): void;
  clearGreenPulse(): void;
  clearMapLegendLayer(): void;
  clearPointCloud(full: true): void;
  clearSelectedMapFeature(): void;
  clearSequenceDiagnostics(): void;
  clearSolarGraphics(): void;
  clearTurboHover(): void;
  clearViewshed(): void;
  disableTurboCoverageLayer(): void;
  finishTurboLoading(): void;
  highlightNearbyPin(image: null): void;
  stopCoverageRendering(): void;
  stopSafePlayback(): void;
  resetSharedStartup(): void;
  retirePlaces(): void;
  cancelImageryReadiness(): void;
  cancelCoveragePicks(): void;
  retireViewRequests(): void;
  clearRoutingLogin(): void;
  invalidateSelection(): void;
  closeOwnedObjectPopup(): void;
  cancelDetectionWork(): void;
  cancelConeRedraw(): void;
  retireMapPicking(): void;
  cancelDetectionFetches(): void;
  dropLayerBindings(): void;
  retirePlacesTiles(): void;
  retirePlaceNotes(): void;
  retireHoverBindings(): void;
  disposeUnmountPlaces(): void;
  clearNearbyHintTimer(): void;
  disposeTerrain(): void;
  retireOrganizationLookup(): void;
  disposeAlignmentDiagnostic(): void;
  markSharedNotesDisposed(): void;
}

/** Cancel work and release viewer/map presentation in the original order.
 * @param resetState Reset selection and control values after resource cleanup.
 * @param fullRemove Also retire view handlers and owned layers; false retains reusable map attachments.
 * Disposal errors keep their existing propagation/catch boundaries; no blanket error swallowing is added.
 */
export function cleanupWidgetEnvironment<View extends TeardownView, Viewer extends { remove(): void }>(resetState: boolean, fullRemove: boolean, host: WidgetTeardownHost<View, Viewer>): void {
    host.cancelCaptureRouteGeneration();
    host.mapSpriteLoading.clearAll();
    host.stopRoutePreview?.();
    host.resetSharedStartup();
    if (resetState || fullRemove) host.clearSelectedMapFeature?.();
    host.currentImagePresentation?.release();
    if (resetState || fullRemove) { host.retirePlaces(); }
    host.highlightNearbyPin(null);
    host.clearSequenceDiagnostics();
    host.pendingCoverageHover?.clear();
    host.clearHoverCard();
    host.cancelImageryReadiness();
    host.timeTravelAvailability?.clear(); host.cachedSequencePreview?.clear();
    host.reverseAddressEnrichment.clear();
    host.imageryOpeningRequest = null;
    host.places?.controller.sync();
    host.backgroundRequests?.clear(); host.backgroundRequests?.setPaused(false);
    host.sharedTileRequests?.clear(); host.sequenceTileIndex?.clear();
    host.sequencePerformance?.playbackFrame(false);
    host.liveSequenceFrames.clear(); host.liveFrameDetails.clear(); host.sequenceDemand.clear();
    host.cancelCoveragePicks();
    if (fullRemove) {
      host.retireViewRequests();
    }
    host.clearRoutingLogin();
    host.lasso?.clear();
    host.measurement?.dispose();
    host.rings?.clear();
    host.pointCloudAcquisition.cancel('cleanup');
    if (fullRemove) { host.clearPointCloud(true); host.pointCloudCache.clear(); }
    host.cancelCoverageAnalysis();
    host.stopCoverageRendering();
    host.clearMapLegendLayer();
    host.clearSolarGraphics();
    host.invalidateSelection();
    host.clearActiveSequenceLayer();
    host.closeOwnedObjectPopup();
    host.mapFeatureExportAbort?.abort();
    host.clearDetectionOverlays();
    host.cancelDetectionWork();
    host.finishTurboLoading();
    host.clearClickRipples();
    host.clearGreenPulse();
    // Responsive layout remounts must release both full renderers, not only
    // hide their marker part while a fan/mesh and animation remain attached.
    host.nativeCurrentImageMarker?.clear();
    host.screenDirectionCone?.clear();
    host.cameraCone?.dispose(host.view);

    host.cancelConeRedraw();

    host.nearbyDiscovery?.cancelTimer();
    host.stopSafePlayback();
    host.playbackBindings?.clear();
    host.nearbyDiscovery?.cancelRequest();

    host.nativeSequenceSelection.detach();

    // Clean up zoom watcher and cancel any pending zoom URL update
    host.viewZoomBindings.clear();

    // Clean up direction hover graphic
    host.clearDirectionHighlight();
    host.clearTurboHover();
    host.clearElevationProfile();

    // Release direction subscription and touch listeners from their original container.
    host.directionBindings?.clear();

    host.sight?.dispose();

    host.clearViewshed();

    if (fullRemove && host.view?.graphics) {
      const view = host.view!;
      host.clearOwnedGraphics(view);
    }

    if (fullRemove) {
      host.retireMapPicking();
      host.disableTurboCoverageLayer();
      if (host.mapClickHandle) {
        host.mapClickHandle.remove();
        host.mapClickHandle = null;
      }
      if (host.pointerMoveHandle) {
        host.pointerMoveHandle.remove();
        host.pointerMoveHandle = null;
      }

      host.cancelDetectionFetches();

      if (host.trafficSignsStationaryHandle) {
        host.trafficSignsStationaryHandle.remove();
        host.trafficSignsStationaryHandle = null;
      }
      if (host.trafficSignsZoomHandle) {
        host.trafficSignsZoomHandle.remove();
        host.trafficSignsZoomHandle = null;
      }
      if (host.objectsStationaryHandle) {
        host.objectsStationaryHandle.remove();
        host.objectsStationaryHandle = null;
      }
      if (host.objectsZoomHandle) {
        host.objectsZoomHandle.remove();
        host.objectsZoomHandle = null;
      }
      host.turboViewBindings.clear();

      host.resetDetectionState();
    }

    if (host.view?.map && fullRemove) {
      const view = host.view!;

      // Detach owned layers only; borrowed coverage stays on the host map.
      host.removeOwnedLayers(view);

      host.dropLayerBindings();

      host.setTurboInactive();
    }

    if (host.viewer) {
      try {
        host.lasso?.cancelGesture();
        host.measurement?.detachViewer();
        host.viewer.remove();
      } catch (err) { }
      host.viewer = null;
    }
    if (host.container()) {
      host.container()!.innerHTML = "";
    }

    if (resetState) {
      host.resetSelection(clearedWidgetState());
    }
}

/** Final instance teardown after startup invalidation, preserving common cleanup before DOM/listener release. */
export function unmountWidget<View extends TeardownView, Viewer extends { remove(): void }>(host: WidgetTeardownHost<View, Viewer>): void {
    host.hoverPreviewStatus?.dispose();
    host.retirePlacesTiles();
    host.retirePlaceNotes();
    host.pendingCoverageHover?.clear();
    host.retireHoverBindings();
    host.disposeUnmountPlaces();
    document.removeEventListener('visibilitychange', host.sequenceVisibilityChange);
    host.hoverTimingAbort?.abort();
    host.clearSequenceDiagnostics();
    host.sequencePerformance.dispose();
    host.clearNearbyHintTimer();
    host.disposeTerrain();
    host.retireOrganizationLookup();
    host.disposeAlignmentDiagnostic();
    host.coverageSelectionTargets.clear();
    host.markSharedNotesDisposed();
    host.clearFieldNotesGroup();
    host.cleanupEnvironment(true, true);

    releaseViewerObservation(host);

    if (host.tooltipDiv && host.tooltipDiv.parentNode) {
      host.tooltipDiv.parentNode.removeChild(host.tooltipDiv);
      host.tooltipDiv = null;
    }

    unlistenForViewerResize(host);

    window.removeEventListener("keydown", host.handleNudgeKeyDown);
    window.removeEventListener("keyup", host.handleNudgeKeyUp);

    // Clear warning timeout
    host.zoomWarningTimer.cancel();
}
