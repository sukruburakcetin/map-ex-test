import { observeViewerContainer } from './viewerResize';
import type { PlacesSourceConfig } from '../places/placesSource';

/** Configuration consumed by update reconciliation, including the existing Places source identity. */
export interface WidgetUpdateConfig extends PlacesSourceConfig {
  debugMode?: boolean;
  enable3DTerrain?: boolean;
  enableElevationProfile?: boolean;
  enableMapillaryObjects?: boolean;
  enablePlaces?: boolean;
  enableSolar?: boolean;
  enableTrafficSigns?: boolean;
  hideBearing?: boolean;
  hideLegend?: boolean;
  hideZoom?: boolean;
  sharedFieldNotesEnabled?: boolean;
  sharedFieldNotesReadUrl?: string;
  sharedFieldNotesUrl?: string;
  turboCreator?: string;
  turboDefaultColorByDate?: boolean;
  turboDefaultEndDate?: string;
  turboDefaultIsPano?: boolean;
  turboDefaultStartDate?: string;
  turboOrganization?: string;
}
export interface WidgetUpdateProps { config: WidgetUpdateConfig; visible?: boolean; state?: string; }
/** Comparison-only state surface; no snapshot is retained by the coordinator. */
export interface WidgetUpdateState<Map> {
  coverageFrameResolving?: boolean;
  coverageHelpOpen?: boolean;
  imageId?: string | null;
  imageTrayTab?: string;
  isElevationProfileActive?: boolean;
  isFullscreen?: boolean;
  isLassoMode?: boolean;
  isLoading?: boolean;
  isMeasureMode?: boolean;
  isSightMode?: boolean;
  isViewshedMode?: boolean;
  jimuMapView?: Map | null;
  nearbyStripOpen?: boolean;
  objectsActive?: boolean;
  placesPanelOpen?: boolean;
  pointCloudAdaptive?: boolean;
  qualityViewActive?: boolean;
  selectedQualityBand?: 'good' | 'fair' | 'poor' | 'unscored' | null;
  selectedSequenceId?: string | null;
  sequenceId?: string | null;
  sequenceImages?: unknown;
  sequenceRouteLoading?: boolean;
  trafficSignsActive?: boolean;
  turboFilterEndDate?: string;
  turboFilterIsPano?: boolean;
  turboFilterOrganization?: string;
  turboFilterStartDate?: string;
  turboLoading?: boolean;
  turboModeActive?: boolean;
  turboUpdatingVisible?: boolean;
}
export interface ReopenState {
  turboModeActive: true;
  turboFilterUsername: string;
  turboFilterOrganization: string;
  turboFilterStartDate: string;
  turboFilterEndDate: string;
  turboFilterIsPano: boolean | undefined;
  turboColorByDate: boolean;
  turboYearLegend: { year: string; color: string }[];
  showTurboFilterBox: false;
}
/** Live feature capabilities; concrete React, ExB, viewer and GIS resources remain bound by the widget. */
export interface WidgetUpdateHost<View extends object, Map extends { view: View }> {
  readonly state: Readonly<WidgetUpdateState<Map>>;
  readonly props: Readonly<WidgetUpdateProps>;
  nearbyDemandVisible: boolean;
  nearbyPointerInside: boolean;
  readonly nearbyDiscovery: { cancel(): void } | null;
  readonly routeGeneration: { readonly pending: boolean; current(): boolean };
  readonly coverageAnalysisCurrent: (() => boolean) | null;
  readonly placesVectorLayer: unknown;
  readonly backgroundRequests: { setPaused(paused: boolean): void } | null;
  readonly imageryOpeningRequest: number | null;
  resizeObserver: ResizeObserver | null;
  readonly viewer: { resize(): void; activateComponent(name: string): void; deactivateComponent(name: string): void } | null;
  readonly mapillaryTrafficSignsLayer: unknown;
  readonly mapillaryObjectsLayer: unknown;
  readonly mapillaryVTLayer: unknown;
  readonly detectionLayers: { reset(kind: 'signs' | 'objects'): void };
  readonly debouncedTurboFilter: (() => void) & { cancel?: () => void };
  nearbyPanelVisible(): boolean;
  refreshNearbyAfterPause(immediate: boolean): void;
  cancelCaptureRouteGeneration(): void;
  cancelCoverageAnalysis(): void;
  showToast(message: string, milliseconds: number): void;
  translate(key: 'appAnalysisStoppedBecauseItsMapAreaOrFiltersChanged'): string;
  placesSourceKey(config: WidgetUpdateConfig): string | null;
  organizationFilterId(value: unknown): number | undefined;
  syncPlaces(): void;
  syncSequenceDiagnostics(): void;
  updateNativeSequenceSelection(): void;
  announceNearbyFrames(): void;
  updateElevationProfile(): unknown;
  updateProfileIndicator(): void;
  syncSceneTerrain(): void;
  getTurboOrganizationId(): number | undefined;
  scheduleOrganizationName(): void;
  updatePointCloudDisplay(): void;
  syncSharedFieldNotes(): unknown;
  drawFieldNoteGraphics(): unknown;
  clearSolarGraphics(): void;
  clearElevationProfile(): void;
  syncMapLegendLayer(): void;
  container(): HTMLElement | null;
  log(message: string): void;
  cleanupWidgetEnvironment(reset: boolean, full: boolean): void;
  claimCurrentImagePresentation(view: View): unknown;
  initMapillaryTrafficSignsLayer(): void;
  initMapillaryObjectsLayer(): void;
  restoreReopenState(patch: ReopenState, after: () => void): void;
  setSolarInactive(): void;
  setElevationInactive(): void;
  setOrganization(value: string, after: () => void): void;
  setCreator(value: string, after: () => void): void;
  setStartDate(value: string, after: () => void): void;
  setEndDate(value: string, after: () => void): void;
  setPanorama(value: boolean | undefined, after: () => void): void;
  setColorByDate(value: boolean, after: () => void): void;
  enableTurboCoverageLayer(creator?: string): unknown;
  disableTurboCoverageLayer(): void;
  onActiveViewChange(map: Map): unknown;
  getUserIdFromUsername(username: string): Promise<number | undefined>;
  initMapillaryLayer(id: number | undefined, start: string | undefined, end: string | undefined, pano: boolean | undefined, quality: boolean | undefined, band: 'good' | 'fair' | 'poor' | 'unscored' | null | undefined): void;
  toggleMapillaryTrafficSigns(): void;
  toggleMapillaryObjects(): void;
  resetOrganizationSelection(): void;
}

/** Reconcile an update in its original feature-demand, visibility and configuration order.
 * Previous props/state are comparison inputs; asynchronous callbacks continue reading live host values.
 * This move introduces no new scheduling, subscription, request owner or reopen policy.
 */
export function reconcileWidgetUpdate<View extends object, Map extends { view: View }>(prevProps: WidgetUpdateProps,
  prevState: WidgetUpdateState<Map>, host: WidgetUpdateHost<View, Map>): void {
  reconcileFeatureDemand(prevProps, prevState, host);
  reconcileWidgetVisibility(prevProps, prevState, host);
  reconcileConfiguration(prevProps, host);
}

/** Apply demand and feature effects before visibility and configuration transitions. */
function reconcileFeatureDemand<View extends object, Map extends { view: View }>(prevProps: WidgetUpdateProps,
  prevState: WidgetUpdateState<Map>, host: WidgetUpdateHost<View, Map>): void {
    const nearbyVisible = host.nearbyPanelVisible();
    const wasNearbyVisible = host.nearbyDemandVisible; host.nearbyDemandVisible = nearbyVisible;
    if (!nearbyVisible) {
      if (!host.state.nearbyStripOpen || host.state.imageTrayTab === 'object' || host.props.visible === false || host.props.state === 'CLOSED') host.nearbyPointerInside = false;
      host.nearbyDiscovery?.cancel();
    } else if (!wasNearbyVisible || prevState.imageId !== host.state.imageId || prevState.isLoading !== host.state.isLoading)
      host.refreshNearbyAfterPause(!prevState.nearbyStripOpen || prevState.imageTrayTab === 'object');

    if (host.routeGeneration.pending && !host.routeGeneration.current()) host.cancelCaptureRouteGeneration();

    if (host.coverageAnalysisCurrent && !host.coverageAnalysisCurrent()) {
      host.cancelCoverageAnalysis();
      host.showToast(host.translate('appAnalysisStoppedBecauseItsMapAreaOrFiltersChanged'), 5000);
    }
    if (prevProps.config.enablePlaces !== host.props.config.enablePlaces || host.placesSourceKey(prevProps.config) !== host.placesSourceKey(host.props.config) || prevProps.state !== host.props.state ||
      prevState.jimuMapView?.view !== host.state.jimuMapView?.view || prevState.isLoading !== host.state.isLoading || prevState.isFullscreen !== host.state.isFullscreen ||
      (!!host.placesVectorLayer && prevState.placesPanelOpen !== host.state.placesPanelOpen)) host.syncPlaces();
    if (prevState.isLoading !== host.state.isLoading) host.backgroundRequests?.setPaused(!!host.state.isLoading || host.imageryOpeningRequest != null);
    if (prevProps.config.debugMode !== host.props.config.debugMode || prevProps.state !== host.props.state) host.syncSequenceDiagnostics();
    if (prevState.selectedSequenceId !== host.state.selectedSequenceId || prevState.sequenceId !== host.state.sequenceId ||
      prevState.turboModeActive !== host.state.turboModeActive || prevState.isLoading !== host.state.isLoading) host.updateNativeSequenceSelection();
    if (prevState.isLoading !== host.state.isLoading || prevState.coverageFrameResolving !== host.state.coverageFrameResolving ||
      prevState.sequenceRouteLoading !== host.state.sequenceRouteLoading || prevState.turboLoading !== host.state.turboLoading ||
      prevState.turboUpdatingVisible !== host.state.turboUpdatingVisible || prevState.coverageHelpOpen !== host.state.coverageHelpOpen)
      host.announceNearbyFrames();
    if (host.state.isElevationProfileActive && (prevState.sequenceImages !== host.state.sequenceImages ||
      prevState.jimuMapView?.view !== host.state.jimuMapView?.view)) void host.updateElevationProfile();
    if (prevState.imageId !== host.state.imageId) host.updateProfileIndicator();
    if (prevProps.config.enable3DTerrain !== host.props.config.enable3DTerrain) host.syncSceneTerrain();
    const previousOrganization = host.organizationFilterId(prevProps.config.turboOrganization || prevState.turboFilterOrganization);
    if (previousOrganization !== host.getTurboOrganizationId()) host.scheduleOrganizationName();
    if (prevState.pointCloudAdaptive !== host.state.pointCloudAdaptive || prevState.isMeasureMode !== host.state.isMeasureMode || prevState.isLassoMode !== host.state.isLassoMode || prevState.isSightMode !== host.state.isSightMode || prevState.isViewshedMode !== host.state.isViewshedMode) host.updatePointCloudDisplay();
    if (prevProps.config.sharedFieldNotesEnabled !== host.props.config.sharedFieldNotesEnabled || prevProps.config.sharedFieldNotesUrl !== host.props.config.sharedFieldNotesUrl || prevProps.config.sharedFieldNotesReadUrl !== host.props.config.sharedFieldNotesReadUrl) {
      void host.syncSharedFieldNotes(); void host.drawFieldNoteGraphics();
    }
    if (prevProps.config.enableSolar !== host.props.config.enableSolar && host.props.config.enableSolar !== true) {
      host.clearSolarGraphics(); host.setSolarInactive();
    }
    if (prevProps.config.enableElevationProfile !== host.props.config.enableElevationProfile && host.props.config.enableElevationProfile !== true) {
      host.clearElevationProfile(); host.setElevationInactive();
    }
    if (prevProps.config.hideLegend !== host.props.config.hideLegend) host.syncMapLegendLayer();
}

/** Keep observer/minimize/close/reopen ordering and existing asynchronous creator initialization. */
function reconcileWidgetVisibility<View extends object, Map extends { view: View }>(prevProps: WidgetUpdateProps,
  prevState: WidgetUpdateState<Map>, host: WidgetUpdateHost<View, Map>): void {
    if (prevState.isFullscreen !== host.state.isFullscreen) {
      observeViewerContainer(host, true);
    }

    // Minimized: Keep listeners, but clean up viewer if needed
    if (prevProps.visible && !host.props.visible) {
      host.log("Widget minimized - keeping listeners");
      host.cleanupWidgetEnvironment(true, false);
    }

    if (prevProps.visible === false && host.props.visible !== false && host.state.jimuMapView?.view)
      host.claimCurrentImagePresentation(host.state.jimuMapView.view);

    // Closed: Full cleanup
    if (prevProps.state === "OPENED" && host.props.state === "CLOSED") {
      host.log("Widget closed - cleaning up completely");
      host.cleanupWidgetEnvironment(true, true);
    }

    if (prevProps.state === "CLOSED" && host.props.state === "OPENED" && host.state.jimuMapView) {
      host.claimCurrentImagePresentation(host.state.jimuMapView.view);
      host.log("Widget reopened - initializing environment...");

      const proceedWithWidgetInitialization = () => {
        // Init secondary layers
        if (!host.mapillaryTrafficSignsLayer && host.props.config.enableTrafficSigns !== false) {
          host.initMapillaryTrafficSignsLayer();
        }
        if (!host.mapillaryObjectsLayer && host.props.config.enableMapillaryObjects !== false) {
          host.initMapillaryObjectsLayer();
        }

        // Restore state
        host.restoreReopenState(
          {
            turboModeActive: true,
            turboFilterUsername: host.props.config.turboCreator || "",
            turboFilterOrganization: host.props.config.turboOrganization || "",
            turboFilterStartDate: host.props.config.turboDefaultStartDate || "",
            turboFilterEndDate: host.props.config.turboDefaultEndDate || "",
            turboFilterIsPano: host.props.config.turboDefaultIsPano ?? undefined,
            turboColorByDate: host.props.config.turboDefaultColorByDate ?? false,
            turboYearLegend: [],
            showTurboFilterBox: false,
          },
          () => {
            // Force Turbo Layer if needed
            if (host.state.turboModeActive) {
              host.enableTurboCoverageLayer(host.props.config.turboCreator);
            }
          },
        );

        host.disableTurboCoverageLayer();

        // Attach the active view only after recreating coverage with its filters.
        host.onActiveViewChange(host.state.jimuMapView!);
      };

      const defaultUser = host.props.config.turboCreator || "";

      // If we need to recreate the layer (it was destroyed on close)
      if (!host.mapillaryVTLayer) {
        const reopenInit = async () => {
          let id: number | undefined;
          if (defaultUser) {
            try {
              id = (await host.getUserIdFromUsername(defaultUser)) || undefined;
            } catch {
              id = undefined;
            }
          }
          host.initMapillaryLayer(
            id,
            host.state.turboFilterStartDate || undefined,
            host.state.turboFilterEndDate || undefined,
            host.state.turboFilterIsPano,
            host.state.qualityViewActive,
            host.state.selectedQualityBand,
          );
          proceedWithWidgetInitialization();
        };
        reopenInit();
      } else {
        proceedWithWidgetInitialization();
      }
    }

}

/** Apply explicit configuration edits and live SDK control toggles after visibility handling. */
function reconcileConfiguration<View extends object, Map extends { view: View }>(prevProps: WidgetUpdateProps, host: WidgetUpdateHost<View, Map>): void {
    // Traffic Signs Config
    if (prevProps.config.enableTrafficSigns !== host.props.config.enableTrafficSigns) {
      if (host.props.config.enableTrafficSigns === false) {
        if (host.state.trafficSignsActive) host.toggleMapillaryTrafficSigns();
        host.detectionLayers.reset('signs');
      } else {
        host.initMapillaryTrafficSignsLayer();
      }
    }

    // Objects Config
    if (prevProps.config.enableMapillaryObjects !== host.props.config.enableMapillaryObjects) {
      if (host.props.config.enableMapillaryObjects === false) {
        if (host.state.objectsActive) host.toggleMapillaryObjects();
        host.detectionLayers.reset('objects');
      } else {
        host.initMapillaryObjectsLayer();
      }
    }

    if (prevProps.config.turboOrganization !== host.props.config.turboOrganization) {
      host.resetOrganizationSelection();
      host.setOrganization(host.props.config.turboOrganization || "", () => {
        host.debouncedTurboFilter.cancel?.();
        if (host.state.turboModeActive) void host.enableTurboCoverageLayer();
      });
    }

    // Creator Config Change (while widget is open)
    if (prevProps.config.turboCreator !== host.props.config.turboCreator) {
      const newCreator = host.props.config.turboCreator || "";
      host.setCreator(newCreator, () => {
        if (host.state.turboModeActive) {
          host.enableTurboCoverageLayer();
        }
      });
    }
    // Turbo Preset: Start Date
    if (prevProps.config.turboDefaultStartDate !== host.props.config.turboDefaultStartDate) {
      host.setStartDate(host.props.config.turboDefaultStartDate || "", () => {
        host.debouncedTurboFilter(); // always rebuild green layer; also reloads turbo points if active
      });
    }

    // Turbo Preset: End Date
    if (prevProps.config.turboDefaultEndDate !== host.props.config.turboDefaultEndDate) {
      host.setEndDate(host.props.config.turboDefaultEndDate || "", () => {
        host.debouncedTurboFilter();
      });
    }

    // Turbo Preset: Is Pano
    if (prevProps.config.turboDefaultIsPano !== host.props.config.turboDefaultIsPano) {
      host.setPanorama(host.props.config.turboDefaultIsPano ?? undefined, () => {
        host.debouncedTurboFilter();
      });
    }

    // Turbo Preset: Color by Date
    if (prevProps.config.turboDefaultColorByDate !== host.props.config.turboDefaultColorByDate) {
      host.setColorByDate(host.props.config.turboDefaultColorByDate ?? false, () => {
        host.debouncedTurboFilter();
      });
    }

    if (host.viewer) {
      // Handle Bearing Toggle
      if (prevProps.config.hideBearing !== host.props.config.hideBearing) {
        if (host.props.config.hideBearing) {
          host.viewer.deactivateComponent("bearing");
        } else {
          host.viewer.activateComponent("bearing");
        }
      }
      // Handle Zoom Toggle
      if (prevProps.config.hideZoom !== host.props.config.hideZoom) {
        if (host.props.config.hideZoom) {
          host.viewer.deactivateComponent("zoom");
        } else {
          host.viewer.activateComponent("zoom");
        }
      }
    }
}
