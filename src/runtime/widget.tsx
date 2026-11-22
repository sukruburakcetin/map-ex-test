import { resizeForBrowserFullscreen, resizeForWindow } from '../features/lifecycle/viewerResize';
import { transitionFullscreen } from '../features/lifecycle/fullscreenTransition';
import { cleanupWidgetEnvironment, unmountWidget, type WidgetTeardownHost } from '../features/lifecycle/widgetTeardown';
import { reconcileWidgetUpdate, type WidgetUpdateHost } from '../features/lifecycle/widgetUpdate';
import { mountWidget, disposeWidgetStartup, type WidgetStartupHost } from '../features/lifecycle/widgetStartup';
import { openSequence, type SequenceOpeningHost, type OpeningState } from '../features/imagery/sequenceOpening';
import { bindViewerEvents, type ViewerEventsHost } from '../features/imagery/viewerEventBinding';
import type { ViewerImageTrackingHost } from '../features/imagery/viewerImageTracking';
import { bindDetectionHover, type DetectionHoverHost } from '../features/detections/detectionHover';
import { createMapHoverHandler, type MapHoverHost } from '../features/navigation/mapHoverDispatch';
import { dispatchMapClick, type MapClickHost, type PreparedMapClick } from '../features/navigation/mapClickDispatch';
import { ActiveViewTransfer, type ActiveViewTransferHost, type ActiveViewAttachmentHost } from '../features/navigation/ActiveViewTransfer';
import { restoreActiveView, restoreSharedStateWhenReady, type ActiveViewStartupHost } from '../features/navigation/activeViewStartup';
import { executeCaptureRoute, type CaptureRouteExecutionHost } from '../features/routing/executeCaptureRoute';
import { coverageZoneProperties } from "../features/coverage/coverageZoneProperties";
import { ZoomWarningTimer } from "../features/coverage/ZoomWarningTimer";
import { downloadImageFile } from "../features/imagery/downloadImageFile";
import { zoomToImagesTarget } from "../features/navigation/zoomToImagesTarget";
import { SequenceDiagnostics } from "../features/imagery/SequenceDiagnostics";
import { fetchCoverageTile } from "../features/coverage/coverageTileTransport";
import { waitForCoverageReady } from "../features/coverage/coverageReadiness";
import { PendingCoverageHover } from "../features/coverage/PendingCoverageHover";
import { HoverAnchorProjection } from "../features/imagery/HoverAnchorProjection";
import { CurrentImageBearing } from "../features/imagery/CurrentImageBearing";
import { streetBearing } from "../features/point-cloud/streetBearing";
import { waitForSequencePaint } from "../features/imagery/sequencePaint";
import { StationaryUrlBindings } from "../features/navigation/StationaryUrlBindings";
import { TurboViewBindings } from "../features/coverage/TurboViewBindings";
import { ViewZoomBindings } from "../features/navigation/ViewZoomBindings";
import type { WidgetState as State } from "./widgetState";
import { ViewerSurface } from "../components/ViewerSurface";
import { FullscreenViewer } from "../components/FullscreenViewer";
import { ImageTray } from "../features/imagery/ImageTray";
import { buildMinimapViewOptions } from "../features/minimap/minimapViewOptions";
import { createMinimapClickHandler } from "../features/minimap/minimapSelection";
import { buildMinimapLayers } from "../features/minimap/minimapLayers";
import { resolveMinimapBasemap } from "../features/minimap/minimapBasemap";
import { renderCaptureRouteGraphics } from "../features/routing/captureRouteRenderer";


import { planRuntimeRoutingEngineChange, planRuntimeTravelModeChange } from "../features/routing/runtimeRoutingSettings";
import { discoverPortalRoutingService, isRoutingAuthenticationFailure } from "../features/routing/routingAuthentication";
import { createRoutePointGraphic } from "../features/routing/routePointGraphic";
import { createCaptureProvider } from "../features/routing/captureProviderFactory";
import { resolveCaptureRoutingProvider, type ResolvedRoutingProvider } from "../features/routing/routingProviderResolution";














import { type CaptureRoutePreparationHost } from "../features/routing/captureRoutePreparation";
import { scoreCaptureTargets } from '../features/routing/captureRouteScoring';
import { DetectionLayerController } from '../features/detections/DetectionLayerController';
import { RouteGeneration } from '../features/routing/RouteGeneration';
import { OwnedMapResources } from '../features/map-graphics/OwnedMapResources';
import { type CategoryDisplayMode, categoryMatcher, selectedCategoryCodes, type CategorySelection, type MapCategoryFilter } from '../features/detections/categorySelection';
import { placesSourceKey, placesSourceKind } from '../features/places/placesSource';
import { PortalPlacesSource } from '../features/places/PortalPlacesSource';
import { placesApiEndpoints } from '../features/places/placesApi';
import type { CoverageTouchHover } from '../features/coverage/CoverageTouchHover';
import type { CoverageHoverResume } from '../features/coverage/CoverageHoverResume';
import { hoverBearingImageId, HoverBearingHintCache } from '../features/imagery/hoverBearingTarget';
/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { OwnedMessage } from '../i18n/WidgetLocale';
import { enterprisePopupContent } from '../i18n/enterprisePopup';
import { englishPresentation } from '../i18n/PresentationText';
import type { LocaleValue } from '../i18n/WidgetLocale';
import type { MessageKey } from '../i18n/messages';
import { en } from '../i18n/messages';
import { message } from '../i18n/core';
import { LocaleContent, WidgetLocaleProvider } from '../i18n/WidgetLocale';
import { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';
import { PlaceImageryCache } from '../features/places/PlaceImageryCache';
import { PlacesCoordinator } from "../features/places/PlacesCoordinator";
import { PlacesVectorLayer } from "../features/places/PlacesVectorLayer";
import { isTileCategory, TileCategoryId } from '../features/places/tileCategories';
import { tilePlace, normalizeTilePlaces } from "../features/places/tilePlace";
import { tilePlacePreferenceKey, readTilePlacePreferences, saveTilePlacePreferences } from '../features/places/placePreferences';
import { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';
import { placeCameraDistanceLabel } from '../features/places/placeListUtils';
import type { SelectedPlaceProps } from '../components/SelectedPlaceCard';
import { PlaceNoteReview } from '../features/places/PlaceNoteReview';
import type { PlaceNoteDestination, PlaceNoteOptions, PlaceNoteImageContext, PlaceContributionSeed } from '../features/places/placeNote';
import type { PlaceListOrigin } from '../features/places/placeListUtils';
import { PlacesOverlay } from "../features/places/PlacesOverlay";
import { Place } from "../features/places/placesModel";
import { CoverageAnalysisRun } from "../features/coverage/CoverageAnalysisRun";
import { widgetSpriteUrls } from '../utils/widgetSpriteUrls';
import { React, AllWidgetProps, jsx, getAppStore } from "jimu-core";
import { JimuMapViewComponent, JimuMapView, loadArcGISJSAPIModules, MapViewManager } from "jimu-arcgis";
import ReactDOM from "react-dom";
import * as webMercatorUtils from "esri/geometry/support/webMercatorUtils";
import { PbfReader as Pbf } from "pbf";
import { VectorTile } from "@mapbox/vector-tile";
import { objectNameMap } from "../utils/mapillaryObjectNameMap";
import * as Icons from "../components/Icons";
import { glassStyles, overrideStyles } from "../utils/styles";
import * as widgetLayout from "../styles/widgetLayout";
import {
  LAYER_IDS,
  TILE_URLS,
  GRAPH_API,
  ZOOM,
  LIMITS,
  CACHE_KEYS,
  SHARE_PARAMS,
  TIMING,
  DEFAULT_FILTER_LABELS,
  POINT_CLOUD_CONFIG,
  FIELD_NOTE_CONFIG,
  CAPTURE_ROUTE_CONFIG,
} from "../utils/constants";
import {
  distanceMeters,
  calculateBearing,
  createConeGeometry,
  debounce as debounceUtil,
  formatTrafficSignName,
  buildCoverageDisplayPaths,
  lonLatToWebMercator,
} from "../utils/geoUtils";
import { nativeCoverageStyle, type CoverageQualityBand } from "../features/coverage/nativeCoverageStyle";
import { orderCoverageLayers, replaceNativeCoverage } from "../features/coverage/nativeCoverageLayers";
import { organizationFilterId } from "../utils/organizationFilter";
import { OrganizationNameLookup } from "../features/coverage/organizationNameLookup";
import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudDisplayExpression, buildPointCloudPly, buildPointCloudLas } from "../utils/pointCloudUtils";
import { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';
import { NativeTileHighlightCache } from "../features/coverage/NativeTileHighlightCache";
import { TileSequenceHighlights } from "../features/coverage/TileSequenceHighlights";
import { SharedTileRequests } from "../features/coverage/SharedTileRequests";
import { SequenceTileIndex } from "../features/coverage/SequenceTileIndex";
import { BackgroundRequestQueue } from "../features/imagery/BackgroundRequestQueue";
import { SequencePerformance } from "../features/imagery/SequencePerformance";
import { sequenceRouteMemoryStats } from "../features/imagery/sequenceMemoryBudget";
import { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';
import { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';
import { NativeCurrentImageMarker } from '../features/map-graphics/NativeCurrentImageMarker';
import { ScreenDirectionCone } from '../features/map-graphics/ScreenDirectionCone';
import { CurrentImagePresentationOwner } from '../features/map-graphics/CurrentImagePresentationOwner';
import { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';
import { capConeFootprint } from "../features/map-graphics/capConeFootprint";
import { projectedConeRadius } from "../features/map-graphics/projectedConeRadius";
import { coneDisplayRadius } from "../features/map-graphics/coneDisplayRadius";
import { CameraConeGraphics } from '../features/map-graphics/CameraConeGraphics';
import { MapSymbolLegend } from '../features/map-graphics/MapSymbolLegend';
import { syncBrowserUrl, copyBrowserShareLink } from '../features/navigation/browserUrlState';
import type { BrowserUrlStateHost, BrowserShareLinkHost } from '../features/navigation/browserUrlState';
import { readSharedLinkParameters, restoreSharedMapCamera, restoreSharedViewerBearing } from '../features/navigation/sharedLinkRestoration';
import type { SharedViewerBearingHost } from '../features/navigation/sharedLinkRestoration';
import { needsHoverBearingMetadata, mergeHoverBearingMetadata, hoverPreviewBearing } from '../features/imagery/hoverBearingMetadata';
import { HoverBearingSector } from '../features/map-graphics/HoverBearingSector';
import { DirectionHoverMarker } from '../features/map-graphics/DirectionHoverMarker';
import { DirectionHoverDiscovery } from '../features/imagery/DirectionHoverDiscovery';
import { skipUnavailableSequenceFrames, stopSequencePlayback } from '../features/imagery/playbackRecovery';
import type { PlaybackRecoveryHost } from '../features/imagery/playbackRecovery';
import { PlaybackBindings } from '../features/imagery/PlaybackBindings';
import type { PlaybackBindingsHost } from '../features/imagery/PlaybackBindings';
import { DirectionHoverBindings } from '../features/imagery/DirectionHoverBindings';
import { SolarMapOverlay } from '../features/solar/SolarMapOverlay';
import { SolarViewerRenderer } from '../features/solar/SolarViewerRenderer';
import { SolarSceneLighting } from '../features/solar/SolarSceneLighting';
import { SceneTerrainController } from '../features/elevation/SceneTerrainController';
import { ElevationProfileController } from '../features/elevation/ElevationProfileController';
import { CoverageSelectionTargets } from '../features/coverage/CoverageSelectionTargets';
import { nativeCoverageOffsetMeters, nativeCoverageSourceFootprint } from '../features/coverage/nativeCoverageAlignment';
import { nativeImageAnchor } from '../features/coverage/nativeImageAnchor';
import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';
import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';
import { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';
import { LocalNoteCollection } from '../features/field-notes/LocalNoteCollection';
import { showLocalNotesClearedFeedback } from '../features/field-notes/LocalNoteCollectionFeedback';
import { FieldNoteDraft } from '../features/field-notes/FieldNoteDraft';
import { showFieldNoteDraftFeedback } from '../features/field-notes/FieldNoteDraftFeedback';
import { PointCloudAnnotationPicker } from '../features/field-notes/PointCloudAnnotationPicker';
import { PointCloudHitRouting } from '../features/point-cloud/PointCloudHitRouting';
import type { PointCloudHitGeometry } from '../features/point-cloud/PointCloudHitRouting';
import { PointCloudTools } from '../features/point-cloud/PointCloudTools';
import { showPointCloudToolFeedback } from '../features/point-cloud/PointCloudToolFeedback';
import { PointCloudLifecycle } from '../features/point-cloud/PointCloudLifecycle';
import { PointCloudResultApplication } from '../features/point-cloud/PointCloudResultApplication';
import { showPointCloudLoadedFeedback, showPointCloudProgressFeedback } from '../features/point-cloud/PointCloudResultFeedback';
import { PointCloudCrop } from '../features/point-cloud/PointCloudCrop';
import { PointCloudExport } from '../features/point-cloud/PointCloudExport';
import { showPointCloudExportFeedback } from '../features/point-cloud/PointCloudExportFeedback';
import { PointCloudCalibration } from '../features/point-cloud/PointCloudCalibration';
import { PointCloudRings } from '../features/point-cloud/PointCloudRings';
import { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';
import { PointCloudSight } from '../features/point-cloud/PointCloudSight';
import { PointCloudLasso } from '../features/point-cloud/PointCloudLasso';
import { selectLassoIndices } from '../features/point-cloud/lassoProjection';
import { PointCloudMeasurement } from '../features/point-cloud/PointCloudMeasurement';
import { PointCloudAcquisition } from '../features/point-cloud/PointCloudAcquisition';
import type { PointCloudLoadSession } from '../features/point-cloud/PointCloudAcquisition';
import { PointCloudMapLayer } from '../features/point-cloud/PointCloudMapLayer';
import { PointCloudViewerRenderer } from '../features/point-cloud/PointCloudViewerRenderer';
import type { PointCloudResult, PointCloudPoint } from "../utils/pointCloudUtils";
import { decodeAndNormalizeGeometry, getDetectionColor } from "../utils/mapillaryDetections";
import { YEAR_COLOR_PALETTE } from "../utils/mapillaryRenderers";
import { loadImage, loadSpriteMetadata, cropSpriteImage, processInChunks } from "../utils/spriteUtils";
import { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from "mapillary-js";
import { PanoramaDetectionLabels } from '../features/detections/PanoramaDetectionLabels';
import { MapSpriteLoading } from '../features/detections/MapSpriteLoading';
import { createNoteObjectChoice } from '../features/detections/NoteObjectChoice';
import { attachmentMetadata, captureDetectionCrop, storeDetectionCrop, readDetectionCrop, deleteDetectionCrop } from '../features/detections/detectionImageAttachment';
import { validDetectionNoteLocation, mappedDetectionLocation } from '../features/detections/detectionNote';
import type { DetectionNoteDestination } from '../features/detections/detectionNote';
import type { DetectionPreviewLoader } from '../features/detections/detectionPreview';
import { defaultDetectionExplorer, detectionGroup, showDetection } from '../features/detections/detectionExploration';
import type { DetectionExplorerOptions, DetectionSummary } from '../features/detections/detectionExploration';
import "mapillary-js/dist/mapillary.css";
import { IMAGE_INFORMATION_FIELDS, normalizeImageInformation, viewerImageInformation, type ImageInformationHost } from '../features/image-information/ImageInformation';
import { InfoBox } from "../components/InfoBox";
import { shouldRecenterImage } from "../features/imagery/imageFollowPolicy";
import { sceneFollowCamera } from '../features/imagery/sceneFollowCamera';
import { FilterBar } from "../components/FilterBar";
import { SplashScreen } from "../components/SplashScreen";
import { ControlBar } from "../components/ControlBar";
import { ImageUtilityGroup } from "../components/ImageUtilityGroup";
import type { FilterOption, NearbyImage, AssociatedImage } from "../components/types";
import { FieldNote, FieldNoteAttachments } from "../components/types";
import { FieldNotesOverlay } from "../features/field-notes/FieldNotesOverlay";

import type { RouteTargetSegment } from "../utils/routeOptimizer";
import type { RoutingProvider, CaptureTravelMode } from "../utils/routingTypes";
import type { RoutingEngine } from "../config";
import { TURBO_LIMITS, TurboSpatialIndex, TurboIndexCache, TurboTileCache, turboTiles, visitTurboImageLayer, turboPointMatches, turboTileStyle, turboFootprintBboxes, TurboMetadataCache, detectionThumbnailBounds } from "../utils/turboCoverageUtils";
import { CoverageGuide, type CoverageGuideStatus } from "../features/coverage/CoverageGuide";
import type { TurboBbox, TurboFilters, TurboPoint } from "../utils/turboCoverageUtils";
import { findNearbySequenceFrame } from "../features/coverage/nearbySequenceFrame";
import { CoverageFrameLookup, coverageFrameKey } from "../features/coverage/CoverageFrameLookup";
import { RepresentativePickCache } from "../features/coverage/RepresentativePickCache";
import { DelayedHoverStatus } from "../features/imagery/DelayedHoverStatus";
import { clearImageryHoverCardCache, renderImageryHoverCard, positionImageryHoverCard } from "../features/imagery/hoverCard";
import { fetchGraphJson } from '../services/mapillary/graphJson';
import { queryEnterpriseNotesPage } from '../features/field-notes/enterpriseList';
import { matchesEnterpriseLayerUrl, resolveEnterpriseNotesEndpoint } from '../features/field-notes/enterpriseEndpoint';
import { buildEnterpriseNoteAttributes } from '../features/field-notes/enterpriseAttributes';
import { assertEnterpriseNoteUnchanged, buildEnterpriseNoteEditAttributes } from '../features/field-notes/enterpriseEdit';
import { prepareCurrentImageAttachment, validateNoteAttachmentFile } from '../features/field-notes/attachmentFiles';
import { WorkspaceLocationPicker } from '../features/community-notes/WorkspaceLocationPicker';
import type { WorkspaceLocationRequest } from '../features/community-notes/WorkspaceLocationPicker';
import { FieldNoteMap } from '../features/field-notes/FieldNoteMap';
import { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';
import { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';
import { startNoteHighlight } from '../features/field-notes/nativeNoteHighlight';
import { buildLocalNoteGraphic, buildNoteSymbol } from '../features/field-notes/mapGraphic';
import { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';
import { createFieldNoteViewerRenderer } from '../features/field-notes/viewerRenderer';
import { selectViewerFieldNotes } from '../features/field-notes/viewerSelection';
import type { EnterpriseNotesLoader } from '../features/field-notes/enterpriseList';
import { loadTimeTravelPreview } from '../features/imagery/timeTravelPreview';
import { TimeTravelAvailability } from '../features/imagery/timeTravel';
import { CachedSequencePreview } from '../features/imagery/CachedSequencePreview';
import { copyCoordinates } from '../services/browser/coordinateClipboard';
import { clickedLocationPointProperties, legacySequencePointProperties } from '../features/map-graphics/pointMarkerProperties';
import { updateSequenceProfile, type SequenceProfileHost } from '../features/elevation/updateSequenceProfile';
import { mapCenteredFeedback, headingSyncFeedback } from '../features/navigation/NavigationFeedback';
import { navigationFeedbackStyle, recoveryFeedbackStyle } from '../styles/navigationFeedback';
import { updateSolarModel, type SolarModelHost } from '../features/solar/updateSolarModel';
import { toggleSolarMode, type SolarModeHost } from '../features/solar/solarMode';
import { toggleProfileMode, type ProfileModeHost } from '../features/elevation/profileMode';
import { ArcGISModuleInitialization } from '../services/arcgis/ArcGISModuleInitialization';
import { ToastNotifications } from '../features/notifications/ToastNotifications';
import { ReverseAddressEnrichment } from '../features/imagery/ReverseAddressEnrichment';
import { resolveCreatorId } from '../features/coverage/creatorLookup';
import { buildPointCloudCsv } from '../features/point-cloud/csvExport';
import { downloadCaptureRouteGPX } from '../features/routing/gpxExport';
import { restoreLocalNotes, persistLocalNotes } from '../features/field-notes/localPersistence';
import { objectDateNotice, lookupImageDetection } from '../features/detections/metadata';
import { findSequenceCandidates } from '../features/imagery/sequenceCandidates';
import { SequenceDemandData } from '../features/imagery/SequenceDemandData';
import { fetchSequenceCoordinates, readCachedSequenceCoordinates } from '../features/imagery/sequenceCoordinates';
import { LiveSequenceFrames, LatestFrameDetails, LIVE_SEQUENCE_LIMITS, yieldSequenceWork } from '../features/imagery/LiveSequenceFrames';
import type { LiveSequenceFrame } from '../features/imagery/LiveSequenceFrames';
import { SharedSequenceRequests } from '../features/imagery/sharedSequenceRequests';
import { sequenceCacheStore } from '../features/imagery/sequenceCacheStore';
import { NearbyImageDiscovery } from '../features/imagery/nearbyDiscovery';
import { NearbyImageSelection } from '../features/imagery/NearbyImageSelection';
import { NearbyImageHighlight, nearbyImagePose } from '../features/imagery/nearbyHighlight';
import type { SequenceCoordinate, SequenceProgress } from '../features/imagery/sequenceCoordinates';

/**
 * Experience Builder runtime coordinator. Feature modules own bounded resources;
 * this class supplies live host adapters, React state and cross-feature intent.
 * Read docs/development/runtime-reading-guide.md before changing lifecycle or
 * request ownership; optional enrichment must not delay foreground imagery.
 */
export default class Widget extends React.PureComponent<AllWidgetProps<any>, State> {
  private readonly _ownedMapResources = new OwnedMapResources<__esri.Graphic, __esri.Layer>();
  private _startupDisposed = false;
  /** Invalidates asynchronous widget startup independently of image or map-selection requests. */
  private _startupRevision = 0;
  private _startupAbort = new AbortController();
  private _spritePreloadTimer: ReturnType<typeof setTimeout> | null = null;
  private _introDismissTimer: ReturnType<typeof setTimeout> | null = null;
  private _overrideStyleSheet: HTMLStyleElement | null = null;
  viewerContainer = React.createRef<HTMLDivElement>();
  private _profileFlowHost: HTMLDivElement | null = null;
  /** Attach or release the elevation-profile DOM host without creating a second profile owner. */
  private setProfileFlowHost = (node: HTMLDivElement | null): void => {
    this._profileFlowHost = node;
    this._elevationProfile?.refreshLayout();
  };
  minimapContainer = React.createRef<HTMLDivElement>();

  mapillaryViewer: any = null;
  ArcGISModules: any = null;

  // Graphics references
  private currentGreenGraphic: __esri.Graphic | null = null;
  private clickedLocationGraphic: __esri.Graphic | null = null;
  private _directionHighlight: DirectionHoverMarker<__esri.Graphic> | null = null;
  private _nearbyHoverAbort: AbortController | null = null;
  private _nearbyHighlight: NearbyImageHighlight<__esri.Graphic> | null = null;
  private _routeGraphicLayer: __esri.GraphicsLayer | null = null;
  private _routePointAGraphic: __esri.Graphic | null = null;
  private _routePointBGraphic: __esri.Graphic | null = null;

  // Field notes
  private _pendingNoteMarker: PendingNoteMarker | null = null;

  // Observers and handles
  private resizeObserver: ResizeObserver | null = null;
  private mapClickHandle: IHandle | null = null;
  private pointerMoveHandle: IHandle | null = null;
  private minimapWatchHandle: __esri.WatchHandle | null = null;

  // Missing layer handles
  private objectsStationaryHandle: IHandle | null = null;
  private trafficSignsStationaryHandle: IHandle | null = null;
  private trafficSignsZoomHandle: __esri.WatchHandle | null = null;
  private objectsZoomHandle: __esri.WatchHandle | null = null;
  private readonly _turboViewBindings = new TurboViewBindings<__esri.MapView | __esri.SceneView>({
    currentView: () => this.state.jimuMapView?.view,
    active: () => this.state.turboModeActive,
    username: () => this.state.turboFilterUsername,
    configuredCreator: () => this.props.config.turboCreator,
    debounce: debounceUtil,
    enableCoverage: creator => creator ? this.enableTurboCoverageLayer(creator) : this.enableTurboCoverageLayer(),
    refreshPulse: view => this.refreshActivePulseAnchor(view),
    resumePreview: () => {
      if (this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)
        void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);
    },
    refreshSymbols: () => this._nativeSequenceSelection.refreshSymbols(),
    showHelp: () => this.showTurboInteractionHelp(),
  });
  private highlightHandle: any = null;
  private readonly _stationaryUrlBindings = new StationaryUrlBindings<__esri.MapView | __esri.SceneView>({
    currentView: () => this.state.jimuMapView?.view,
    flyIn: () => this._isFlyInActive,
    imageId: () => this.state.imageId,
    refreshPulse: view => this.refreshActivePulseAnchor(view),
    updateUrl: imageId => this.updateUrlWithCurrentImage(imageId),
  });

  // Cancellation flags
  private _cancelTrafficSignsFetch: boolean = false;
  private _cancelObjectsFetch: boolean = false;
  private _isInitialImageLoad = true;

  // Layers
  private accessToken: string = "";
  private _places: PlacesCoordinator | null = null;
  private _placesView: __esri.MapView | __esri.SceneView | null = null;
  private _placesVectorLayer: PlacesVectorLayer | null = null;
  private _placesLifecycle: { startService(base: string): Promise<void>; stop(keepEnabled?: boolean): void } | null = null;
  private _placesTilesView: any = null;
  private _placesTilesPreferenceKey: string | null = null;
  private _placesTilesOwner: PlacesCoordinator | null = null;
  private _placesTilesStartRevision = 0;
  private _placesConfiguredUrl: string | null = null;
  private _placesConfiguredRequest: { url: string; view: any } | null = null;
  /** Reflect a Places selection in the panel and camera-distance display; list-origin changes request a reveal. */
  private selectedPlaceChanged = (selectedPlace: Place | null, origin: 'map' | 'list' | 'card' = 'map') => {
    if (selectedPlace !== this.state.selectedPlace) this._placeNoteReview?.cancel();
    const frame = this._liveSequenceFrames.current;
    const placesCameraDistance = selectedPlace && frame ? placeCameraDistanceLabel(distanceMeters(frame.lat, frame.lon, selectedPlace.lat, selectedPlace.lon), this._presentation) : null;
    this.setState(previous => ({ selectedPlace, placesCameraDistance, ...(origin === 'map' && selectedPlace ? { placesRevealRequest: previous.placesRevealRequest + 1 } : {}), ...(!selectedPlace ? { placesShowLink: false } : {}) }));
    if (selectedPlace && frame) this._places?.selection.updateCamera(frame.lon, frame.lat);
  };
  /** Bind the configured Places service to live widget/map state. Service startup remains demand-driven by Places actions. */
  private initializePlacesLifecycle() {
    const control = {
      startService: async (base: string) => {
        const portalMode = placesSourceKind(this.props.config) === 'portal';
        const endpoints = portalMode ? { base, style: this.props.config.placesPortalTilesUrl!, query: this.props.config.placesPortalQueryUrl! } : placesApiEndpoints(base);
        const preferences = readTilePlacePreferences(() => window.localStorage,
          tilePlacePreferenceKey(this.props.id, window.location.pathname, endpoints.base));
        const revision = ++this._placesTilesStartRevision;
        this._placesConfiguredUrl = endpoints.base;
        this._placesVectorLayer?.stop(); this._placesVectorLayer = null;
        const view = this.state.jimuMapView?.view;
        if (!view?.ready || view.destroyed) throw new Error('Open a ready map first');
        this.setState({ placesSourceLoading: true, placesStatus: { kind: 'loading', count: 0 } });
        await this.ensureArcGISModules();
        if (revision !== this._placesTilesStartRevision || view !== this.state.jimuMapView?.view || view.destroyed) return;
        this._placeNoteReview?.cancel(); this._places?.dispose();
        this._placesTilesPreferenceKey = tilePlacePreferenceKey(this.props.id, window.location.pathname, endpoints.base);
        let portal: PortalPlacesSource | undefined;
        if (portalMode) {
          const [request] = await loadArcGISJSAPIModules(['esri/request']);
          if (revision !== this._placesTilesStartRevision || view !== this.state.jimuMapView?.view || view.destroyed) return;
          portal = new PortalPlacesSource(endpoints.style, endpoints.query, request);
          portal.filters = { family: preferences.family, minimum: preferences.minimum, hideClosed: preferences.hideClosed };
        }
        let layer: PlacesVectorLayer;
        let sourceErrorReported = false;
        const owner = new PlacesCoordinator({
          manualSearch: true, hybridSearch: preferences.autoUpdate, id: String(this.props.id),
          presentation: this._presentation, modules: this.ArcGISModules, view: () => this.state.jimuMapView?.view,
          geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),
          searchOrigin: () => this.placesListOrigin(),
          queryArea: (bbox, signal, origin, offset, text) => layer.queryArea(bbox, signal, origin, offset, text),
          normalize: normalizeTilePlaces,
          mapVisible: () => layer?.visible === true,
          listActive: () => this.state.placesPanelOpen && !layer?.changing,
          list: placesList => this.setState({ placesList }),
          hovered: placesHoveredId => this.setState(previous => previous.placesHoveredId === placesHoveredId ? null : { placesHoveredId }),
          selected: this.selectedPlaceChanged, busy: this.placesBusy, pauseReason: this.placesPauseReason,
          status: placesStatus => this.setState({ placesStatus }), explore: (place, radius, signal) => this.explorePlace(place, radius, signal),
          openImagery: image => { void this.openPlaceImagery(image); }
        });
        this._places = this._placesTilesOwner = owner; this._placesView = view;
        layer = new PlacesVectorLayer({
          portal, id: String(this.props.id), view, modules: this.ArcGISModules, busy: this.placesBusy,
          sourceChanging: preserve => { if (preserve) owner.resetResults(); else owner.controller.setEnabled(false); },
          loading: placesSourceLoading => this.setState({ placesSourceLoading }, () => owner.controller.sync()),
          sourceReady: bbox => {
            owner.setCoverageExtent(bbox);
            owner.controller.setEnabled(true); owner.controller.searchArea();
          },
          selected: (attributes, location) => { const place = tilePlace(attributes, location); if (place) owner.openPlace(place); },
          clearSelected: () => { this._mapClickRevision = (this._mapClickRevision ?? 0) + 1; owner.clearSelection(); },
          error: error => {
            sourceErrorReported = true; console.warn('[Overture Places]', error);
            const code = (error as any)?.code;
            this.showToast(this._t(code === 'dense' ? 'uiPoiDensePick' : code === 'filter' ? 'uiPoiFilterFailed' : code === 'source' ? 'uiPoiSourceFailed' : 'uiPoiPickFailed'), 4500);
          }
        });
        this._placesTilesView = view; this._placesVectorLayer = layer;
        this.setState({
          placesActive: true, placesAutoUpdate: preferences.autoUpdate,
          placesTileCategory: preferences.family as TileCategoryId, selectedPlace: null,
          placesShowLink: false, placesList: [], placesCameraDistance: null
        });
        const style = new URL(endpoints.style), details = new URL(endpoints.query);
        for (const url of [style, details]) {
          if (preferences.family !== 'all') url.searchParams.set('family', preferences.family);
          if (preferences.minimum !== null) url.searchParams.set('min_confidence', String(preferences.minimum));
          if (preferences.hideClosed) url.searchParams.set('hide_closed', '1');
        }
        try { await layer.start(style.toString(), details.toString()); }
        catch (error) {
          if (revision === this._placesTilesStartRevision) { control.stop(); if (!sourceErrorReported) this.showToast(this._t('uiPoiSourceFailed'), 4500); }
          throw error;
        }
      },
      stop: (keepEnabled = false) => {
        ++this._placesTilesStartRevision; this._placesConfiguredUrl = null; this._placesConfiguredRequest = null;
        this._placesVectorLayer?.stop(); this._placesVectorLayer = null; this._placesTilesView = null;
        this._placeNoteReview?.cancel(); this._placesTilesOwner?.dispose();
        if (this._places === this._placesTilesOwner) { this._places = null; this._placesView = null; }
        this._placesTilesOwner = null; this._placesTilesPreferenceKey = null;
        this.setState({
          placesSourceLoading: false, placesActive: keepEnabled, placesPanelOpen: keepEnabled ? this.state.placesPanelOpen : false,
          selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null
        }, keepEnabled ? undefined : this.syncPlaces);
      },
    };
    this._placesLifecycle = control;
  }

  private _placesImageryCache: PlaceImageryCache | null = null;
  private _placesExploreAbort: AbortController | null = null;
  /** Explain why Places cannot currently explore; the same guards prevent discovery during competing interactions. */
  private placesPauseReason = (): string => {
    if (this.props.state === 'CLOSED') return this._owned("Open the widget to load nearby places.");
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return this._owned("Return to this tab to load nearby places.");
    if (this.state.isFullscreen) return this._owned("Return to the main map to load nearby places.");
    if (this.state.isLoading || this._imageryOpeningRequest != null) return this._owned("Places will update after the image finishes loading.");
    if (this.state.placeNotePhase === 'capturing' || this.state.placeNotePhase === 'picking') return this._owned('Finish preparing the place note to update places.');
    if (this._userPaused === false) return this._owned("Pause image playback to update nearby places.");
    if (this._placesExploreAbort && !this._placesExploreAbort.signal.aborted) return this._owned("Finding imagery near the selected place…");
    return '';
  };
  private placesBusy = () => !!this.placesPauseReason();
  /** Synchronize the active Places source with current view, filters and panel demand; source owners retain transport and rendering. */
  private syncPlaces = () => {
    const view = this.state.jimuMapView?.view;
    const url = placesSourceKey(this.props.config);
    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || this.props.state === 'CLOSED') {
      if (this._placesVectorLayer || this._placesConfiguredRequest || this._placesConfiguredUrl) this._placesLifecycle?.stop();
      if (this.state.placesActive && (this.props.config.enablePlaces !== true || !url)) this.setState({ placesActive: false, placesPanelOpen: false });
      return;
    }
    if (!view?.ready || view.destroyed) { if (this._placesVectorLayer || this._placesConfiguredRequest) this._placesLifecycle?.stop(true); return; }
    if (this._placesConfiguredRequest?.url === url && this._placesConfiguredRequest.view === view) return;
    if (this._placesVectorLayer && this._placesConfiguredUrl === url && this._placesTilesView === view && this._places && this._places === this._placesTilesOwner) { this._places?.controller.sync(); return; }
    if (!this._placesLifecycle) return;
    if (this._placesVectorLayer || this._placesConfiguredRequest) this._placesLifecycle.stop(true);
    const request = { url, view }; this._placesConfiguredRequest = request; this._placesConfiguredUrl = url;
    void this._placesLifecycle.startService(url).then(() => {
      if (this._placesConfiguredRequest !== request) return; this._placesConfiguredRequest = null; this.syncPlaces();
    }).catch(error => {
      if (this._placesConfiguredRequest !== request) return; this._placesConfiguredRequest = null; this._placesLifecycle?.stop();
      console.warn('[Overture Places]', error); this.showToast(this._t('uiPoiSourceFailed'), 4500);
    });
  };
  private placesListOrigin(): PlaceListOrigin | null {
    const frame = this._liveSequenceFrames.current;
    if (frame && frame.id === String(this.state.imageId) && Number.isFinite(frame.lon) && Number.isFinite(frame.lat)) return { lon: frame.lon, lat: frame.lat, kind: 'image' };
    const center = this.state.jimuMapView?.view?.center;
    return center && Number.isFinite(center.longitude) && Number.isFinite(center.latitude) ? { lon: center.longitude, lat: center.latitude, kind: 'map' } : null;
  }
  private getPlacesOverlaySelection(): SelectedPlaceProps | undefined {
    const place = this.state.selectedPlace;
    if (!place) return undefined;
    return {
      place, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,
      enterpriseEnabled: !!(this.props.config.sharedFieldNotesEnabled && this.props.config.sharedFieldNotesUrl),
      onNote: this.createPlaceFieldNote, currentImageId: this.state.imageId,
      onGetNoteImage: this.getPlaceNoteImage, onLoadNotePreview: this.loadDetectionPreview,
      notePhase: this.state.placeNotePhase, onCancelNote: this.cancelPlaceNotePreparation,
      onLink: value => {
        this.setState({ placesShowLink: value });
        this._places?.selection.setLink(value);
      },
      onImagery: () => this._places?.open([], this.state.selectedPlace?.id, true, 'card'),
      onDetails: () => this._places?.open([], this.state.selectedPlace?.id, false, 'card'),
      onBack: this.goToSelectedPlace,
      onClear: () => this._places?.clearSelection(),
    };
  }

  private _placeNoteDisposed = false;
  private _placeNoteReview = new PlaceNoteReview({
    context: () => ({ place: this.state.selectedPlace, view: this.state.jimuMapView?.view || null, imageId: this.state.imageId ? String(this.state.imageId) : null, enabled: !!this.state.placesActive && this.props.state !== 'CLOSED' && !this._placeNoteDisposed && !!this.state.jimuMapView?.view?.ready }),
    blocked: destination => { if (destination === 'enterprise' && !(this.props.config.sharedFieldNotesEnabled && this.props.config.sharedFieldNotesUrl)) return true; if (this.state.pendingFieldNote || this.state.detectionWorkspaceDraft || this._detectionWorkspaceMarkerOwner || this.state.detectionNoteCapturing) { this.showToast(this._owned('Finish or cancel the current note draft first.')); return true; } this.dismissViewerDetection(); this.state.jimuMapView?.view?.closePopup(); return false; },
    capture: async (image, signal) => { const data = await captureDetectionCrop(image, this.loadDetectionPreview, signal), id = crypto.randomUUID(); await storeDetectionCrop(id, data); return id; },
    remove: deleteDetectionCrop,
    draw: point => this.drawPendingNoteGraphic(point.lon, point.lat), clear: () => this.clearPendingNoteGraphic(),
    phase: placeNotePhase => { if (!this._placeNoteDisposed) this.setState({ placeNotePhase }, () => this._places?.controller.sync()); }, error: message => this.showToast(this._owned(message)),
    pick: (picked, cancelled) => { let stopped = false, release: (() => void) | null = null; const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); stop(); cancelled(); } }; const cleanup = () => window.removeEventListener('keydown', key, true); const stop = () => { stopped = true; cleanup(); release?.(); release = null; }; const begin = () => { if (stopped) return; window.addEventListener('keydown', key, true); release = this.requestWorkspaceNoteLocation(point => { cleanup(); release = null; picked(point); }, () => { cleanup(); release = null; cancelled(); }); }; if (this.state.isFullscreen) void this.toggleFullscreen().then(begin, () => { stop(); cancelled(); }); else begin(); return stop; },
    open: (seed, destination) => this.openPlaceFieldNote(seed, destination)
  });
  private cancelPlaceNotePreparation = () => this._placeNoteReview?.cancel();
  /** Resolve the current capture context for a place note; return null when no image is selected. */
  private getPlaceNoteImage = async (): Promise<PlaceNoteImageContext | null> => {
    const viewer = this.mapillaryViewer, id = String(this.state.imageId || ''); if (!viewer || !/^\d+$/.test(id)) return null;
    try {
      const image = await viewer.getImage(); let center: any = [.5, .5]; try { center = await viewer.getCenter(); } catch { } if (viewer !== this.mapillaryViewer || String(this.state.imageId) !== id || String(image?.id) !== id) return null;
      const pair: Array<number> = Array.isArray(center) && center.length === 2 && center.every(value => Number.isFinite(value) && value >= 0 && value <= 1) ? center : [.5, .5];
      const capturedAt = image.capturedAt || this._liveSequenceFrames.find(id)?.captured_at;
      return { imageId: id, center: [pair[0], pair[1]], ...(typeof capturedAt === 'number' && Number.isFinite(new Date(capturedAt).getTime()) ? { capturedAt } : {}) };
    } catch { return null; }
  };
  private createPlaceFieldNote = (destination: PlaceNoteDestination, options?: PlaceNoteOptions) => { void this._placeNoteReview.begin(destination, options); };
  /** Seed a place-linked note draft and route it to the chosen local or shared destination. */
  private openPlaceFieldNote = (seed: PlaceContributionSeed, destination: PlaceNoteDestination) => {
    this._placesExploreAbort?.abort(); this.state.jimuMapView?.view?.closePopup();
    if (destination === 'workspace') { this._placeWorkspaceCrop = seed.attachmentId || null; this._detectionWorkspaceMarkerOwner = seed.requestId; this._detectionWorkspaceImage = seed.attachmentId || null; this.drawPendingNoteGraphic(seed.lon, seed.lat); this.setState({ detectionWorkspaceDraft: seed, fieldNotesListOpen: true, nearbyStripOpen: false }); }
    else { const place = this.state.selectedPlace; if (!place) throw Error('Place selection changed.'); this._fieldNoteDraft.openPlace({ ...place, lon: seed.lon, lat: seed.lat }, destination, seed.description, seed.imageId ? { imageId: seed.imageId, bounds: seed.bounds, attachmentId: seed.attachmentId } : undefined); }
  };
  private togglePlaces = () => {
    if (this.state.placesActive || this._placesVectorLayer || this._placesConfiguredRequest) { this._placesLifecycle?.stop(); return; }
    const url = placesSourceKey(this.props.config);
    if (!url) { this.showToast(this._t('uiPoiServiceSetup'), 5000); return; }
    if (!this.state.jimuMapView?.view?.ready || !this._placesLifecycle) { this.showToast(this._t('appTheMapIsPreparingTryPlacesAgainShortly'), 3500); return; }
    const preferences = readTilePlacePreferences(() => window.localStorage, tilePlacePreferenceKey(this.props.id, window.location.pathname, url));
    this.setState({ placesActive: true, placesPanelOpen: true, placesAutoUpdate: preferences.autoUpdate, placesTileCategory: preferences.family as TileCategoryId }, this.syncPlaces);
  };
  private savePlacesTilePreferences = () => { const p = this._placesVectorLayer; if (!p?.supportsFamilyFilter) return; saveTilePlacePreferences(() => window.localStorage, this._placesTilesPreferenceKey, { family: this.state.placesTileCategory, autoUpdate: this.state.placesAutoUpdate, ...p.quality }); };
  private checkPlacesTileSelection = () => { const p = this._placesVectorLayer, place = this.state.selectedPlace; if (p && place && !p.matches(place)) { this._places?.clearSelection(); this.showToast(this._t('uiPoiSelectionExcluded'), 3500); } };
  private setPlacesAutoUpdate = (value: boolean) => {
    this.setState({ placesAutoUpdate: value }, () => { this._places?.controller.setAutoUpdate(value); this.savePlacesTilePreferences(); });
  };
  private setPlacesTileQuality = (minimum: number | null, hideClosed: boolean) => {
    const p = this._placesVectorLayer; if (!p) return; const task = p.setQuality(minimum, hideClosed), version = p.version;
    void task.then(() => { if (this._placesVectorLayer === p && p.version === version) { this.checkPlacesTileSelection(); this.savePlacesTilePreferences(); } }).catch(error => console.warn('[Overture quality]', error));
  };
  private setPlacesTileCategory = (family: string) => {
    if (!isTileCategory(family)) return; const p = this._placesVectorLayer; if (!p) return; const task = p.setFamily(family), version = p.version;
    void task.then(() => { if (this._placesVectorLayer === p && p.version === version) this.setState({ placesTileCategory: family }, () => { this.checkPlacesTileSelection(); this.savePlacesTilePreferences(); }); }).catch(error => console.warn('[Overture category]', error));
  };
  private goToPlacesArea = () => {
    const view = this.state.jimuMapView?.view, bounds = this._places?.coverageExtent;
    if (!view?.ready || view.destroyed || !bounds || !this.ArcGISModules?.Point) return;
    const [west, south, east, north] = paddedPlacesExtent(bounds);
    const Point = this.ArcGISModules.Point;
    this.navigateMapView(view, { target: [new Point({ longitude: west, latitude: south, spatialReference: { wkid: 4326 } }), new Point({ longitude: east, latitude: north, spatialReference: { wkid: 4326 } })] }, { animate: false });
  };
  private goToSelectedPlace = () => this.centerPlaceOnMap(this.state.selectedPlace);
  private showListedPlaceOnMap = (id: string) => {
    const place = this.state.placesList.find(value => value.id === id);
    if (place && this._places?.open([], id, false, 'list')) this.centerPlaceOnMap(place);
  };
  private centerPlaceOnMap = (place: Place | null) => {
    const view = this.state.jimuMapView?.view;
    if (!this.state.placesActive || !place || !view?.ready || view.destroyed || !this.ArcGISModules?.Point || !Number.isFinite(place.lon) || !Number.isFinite(place.lat) || Math.abs(place.lon) > 180 || Math.abs(place.lat) > 85.051129) return;
    const target = new this.ArcGISModules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });
    this.navigateMapView(view, { target, zoom: Number.isFinite(view.zoom) ? Math.max(view.zoom, 16) : 16 }, { animate: false });
  };
  private updatePlacesCamera(lon: number, lat: number): void {
    this._places?.selection.updateCamera(lon, lat);
    const place = this.state.selectedPlace;
    if (!place) return;
    const label = placeCameraDistanceLabel(distanceMeters(lat, lon, place.lat, place.lon), this._presentation);
    if (label !== this.state.placesCameraDistance) this.setState({ placesCameraDistance: label });
  }
  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }
  /** Search imagery around the selected place under an abortable exploration request; a superseded search cannot publish its result. */
  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]> {
    const view = this.state.jimuMapView?.view;
    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;
    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, 12000);
    const request = this._selectionRequestId;
    const current = () => !controller.signal.aborted && !view.destroyed && this._placesExploreAbort === controller && this.state.jimuMapView?.view === view && request === this._selectionRequestId;
    this._places?.controller.sync();
    try {
      const bbox = placeImageryBbox(place, radius);
      const cache = this._placesImageryCache || (this._placesImageryCache = new PlaceImageryCache());
      cache.scope(view, this.accessToken, placesSourceKey(this.props.config) || '');
      const cached = cache.get(place, radius);
      if (cached !== undefined) { if (!current()) throw new DOMException('Cancelled', 'AbortError'); return cached; }
      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry,compass_angle,computed_compass_angle,is_pano,captured_at&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);
      if (!current()) throw new DOMException('Cancelled', 'AbortError');
      const images = rankPlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);
      cache.put(place, radius, images); return images;
    } finally {
      clearTimeout(timeout); signal.removeEventListener('abort', abort);
      if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); }
    }
  }
  /** Open a selected place capture and orient the viewer toward the place; guard asynchronous restoration against replacement selections. */
  private async openPlaceImagery(image: PlaceImagery) {
    const view = this.state.jimuMapView?.view;
    if (!view || view.destroyed) return;
    view.closePopup();
    const request = this._selectionRequestId + 1;
    try {
      await this.loadSequenceById(image.sequence, image.id, { lon: image.lon, lat: image.lat });
      const viewer = this.mapillaryViewer;
      const current = () => this._selectionRequestId === request && this.state.jimuMapView?.view === view && !view.destroyed && this.mapillaryViewer === viewer && String(this.state.imageId) === image.id;
      if (viewer && current()) {
        // Optional local orientation must never turn a successful image open into an error.
        try {
          const targetBearing = await facePlaceInPanorama(viewer, image, current);
          // Existing viewer bearing events own the actual bearing/cone/URL updates.
          if (targetBearing == null && image.direction === 'panorama' && current()) this.showToast(this._t('appImageOpenedItsViewingDirectionCouldNotBeAdjusted'), 3500);
        } catch (error) {
          this.log('[Mapillary places] Panorama orientation unavailable:', error);
          if (current()) this.showToast(this._t('appImageOpenedItsViewingDirectionCouldNotBeAdjusted'), 3500);
        }
      }
    }
    catch { this.showToast(this._t('appNearbyImageryCouldNotOpenChooseAnotherImagePoint'), 4000); }
  }

  private mapillaryVTLayer: __esri.VectorTileLayer | null = null;
  private readonly _detectionLayers = new DetectionLayerController<__esri.VectorTileLayer, __esri.MapView | __esri.SceneView>({
    view: () => this.state.jimuMapView?.view || null,
    disposed: () => this._sharedNotesDisposed || this._startupDisposed,
    appearance: kind => {
      const signs = kind === 'signs'; return {
        scale: (signs ? this.state.signSpriteScale : this.state.objectSpriteScale) || 1,
        opacity: (signs ? this.state.signOpacity : this.state.objectOpacity) ?? 1,
        reduceOverlap: (signs ? this.state.signReduceOverlap : this.state.objectReduceOverlap) === true,
        labels: (signs ? this.state.signLabels : this.state.objectLabels) === true,
        mode: (signs ? this.state.signDisplayMode : this.state.objectDisplayMode) || 'selected',
      };
    },
    selection: kind => this._mapFeatureFilterCodes.get(kind),
    codes: kind => kind === 'signs' ? this._detectionSignCodes : Object.keys(objectNameMap),
    source: kind => ({
      tiles: `${kind === 'signs' ? TILE_URLS.TRAFFIC_SIGNS : TILE_URLS.OBJECTS}?access_token=${this.accessToken}`,
      sprite: kind === 'signs' ? this.spriteUrls.TRAFFIC_SIGNS : this.spriteUrls.OBJECTS
    }),
    create: properties => new this.ArcGISModules.VectorTileLayer(properties),
    own: layer => { this._ownedMapResources.ownLayer(layer); },
    loading: (kind, view, layer) => this._mapSpriteLoading.start(kind, view as any, layer),
    clearLoading: kind => this._mapSpriteLoading.clear(kind),
    error: (kind, phase, error) => {
      if (phase === 'appearance') this.showToast(this._t('appIconSizeCouldNotBeAppliedTryAgainAfter'), 4000);
      else console.error(`Error applying ${kind} filter:`, error);
    },
  });
  private get mapillaryTrafficSignsLayer() { return this._detectionLayers.layer('signs'); }
  private get mapillaryObjectsLayer() { return this._detectionLayers.layer('objects'); }

  // Layer properties
  private _pendingDetectionFocus: { imageId: string; detectionId: string; request: number } | null = null;
  private _focusedDetectionRequest = -1;
  private _detectionLoadRequest = 0;
  private _detectionAbort: AbortController | null = null;

  private _detectionImageData: { imageId: string; data: any; viewer: any } | null = null;
  private _detectionSignCodes = new Set<string>();
  private _detectionObjectCodes = new Set<string>(Object.keys(objectNameMap));
  private changeDetectionExplorer = (options: DetectionExplorerOptions) => {
    this.setState({ detectionExplorer: options }, () => this.refreshDetectionExploration());
  };
  /** Refresh detection summary and viewer visibility from the active exploration options. */
  private refreshDetectionExploration() {
    if (this.state.detectionsActive && this.state.imageId) void this.loadDetections(this.state.imageId);
  }
  private _panoramaDetectionLabels: PanoramaDetectionLabels | null = null;

  private _pendingDetectionImageId: string | null = null;
  private _detectionCropAbort: AbortController | null = null;
  private _focusedViewerNote: FieldNote | null = null;
  private _detectionViewerMarkers: PanoramaDetectionLabels | null = null;
  private _detectionWorkspaceImage: string | null = null;
  private _placeWorkspaceCrop: string | null = null;
  private _detectionNoteAfterFullscreen: (() => void) | null = null;
  private _detectionWorkspaceMarkerOwner: string | null = null;
  private clearDetectionWorkspaceDraft = (applied?: boolean) => {
    const draft = this.state.detectionWorkspaceDraft;
    if (!applied && draft) this.finishDetectionWorkspaceMarker(draft.requestId);
    this.setState({ detectionWorkspaceDraft: null });
  };
  private moveDetectionWorkspaceMarker = (requestId: string, point: { lon: number; lat: number }) => { if (this._detectionWorkspaceMarkerOwner === requestId && validDetectionNoteLocation(point)) this.drawPendingNoteGraphic(point.lon, point.lat); };
  private finishDetectionWorkspaceMarker = (requestId: string) => { if (this._detectionWorkspaceMarkerOwner === requestId) { this._detectionWorkspaceMarkerOwner = null; this.clearPendingNoteGraphic(); this._detectionWorkspaceImage = null; const crop = this._placeWorkspaceCrop; this._placeWorkspaceCrop = null; if (crop) void deleteDetectionCrop(crop).catch(() => { }); } };
  private _detectionNotePickCancel: (() => void) | null = null;
  private cancelDetectionNoteLocation = () => { if (this._pendingDetectionImageId) { void deleteDetectionCrop(this._pendingDetectionImageId).catch(() => { }); this._pendingDetectionImageId = null; } if (this._detectionCropAbort) this.setState({ detectionNoteCapturing: false }); this._detectionCropAbort?.abort(); this._detectionCropAbort = null; this._detectionNoteAfterFullscreen = null; this._detectionNotePickCancel?.(); this._detectionNotePickCancel = null; };
  private dismissViewerDetection = () => { this.cancelDetectionNoteLocation(); if (!this.state.pendingFieldNote && !this.state.detectionWorkspaceDraft && !this._detectionWorkspaceMarkerOwner) this.clearPendingNoteGraphic(); this.setState({ viewerDetectionNote: null, detectionNotePicking: false }); };
  private chooseDetectionNoteLocation = async (destination: DetectionNoteDestination, includePreview = false) => {
    const selection = this.state.viewerDetectionNote;
    if (!selection || selection.imageId !== String(this.state.imageId) || !this.state.detectionsActive) return;
    if (destination === 'enterprise' && !(this.props.config.sharedFieldNotesEnabled && this.props.config.sharedFieldNotesUrl)) return;
    if (this.state.pendingFieldNote || this.state.detectionWorkspaceDraft || this._detectionWorkspaceMarkerOwner) { this.showToast(this._owned('Finish or cancel the current note draft first.')); return; }
    this.cancelDetectionNoteLocation();
    let attachmentId: string | undefined;
    if (includePreview) {
      const controller = new AbortController(); this._detectionCropAbort = controller; this.setState({ detectionNoteCapturing: true });
      try { const data = await captureDetectionCrop(selection, this.loadDetectionPreview, controller.signal); if (controller.signal.aborted || this.state.viewerDetectionNote !== selection) return; attachmentId = crypto.randomUUID(); await storeDetectionCrop(attachmentId, data); this._pendingDetectionImageId = attachmentId; if (controller.signal.aborted || this.state.viewerDetectionNote !== selection) { await deleteDetectionCrop(attachmentId); return; } }
      catch (error) { if (!controller.signal.aborted) this.showToast(this._owned('The detection image could not be saved. Retry or turn off the image attachment.')); return; }
      finally { if (this._detectionCropAbort === controller) { this._detectionCropAbort = null; this.setState({ detectionNoteCapturing: false }); } }
    }
    const finish = (point: { lon: number; lat: number }) => {
      this._detectionNotePickCancel = null;
      if (this.state.viewerDetectionNote !== selection || selection.imageId !== String(this.state.imageId) || !this.state.detectionsActive || !validDetectionNoteLocation(point)) return;
      this._pendingDetectionImageId = null;
      const draft = { ...selection, includePreview, attachmentId };
      this.setState({ viewerDetectionNote: null, detectionNotePicking: false });
      if (destination === 'workspace') { const seed = { ...draft, ...point, requestId: crypto.randomUUID() }; this._detectionWorkspaceMarkerOwner = seed.requestId; this._detectionWorkspaceImage = attachmentId || null; this.drawPendingNoteGraphic(point.lon, point.lat); this.setState({ detectionWorkspaceDraft: seed, fieldNotesListOpen: true, nearbyStripOpen: false }); }
      else this._fieldNoteDraft.open(point.lon, point.lat, undefined, { ...draft, destination });
    };
    if (selection.location && validDetectionNoteLocation(selection.location)) { finish(selection.location); return; }
    // Only detections without a verified map-feature association require ground picking.
    const begin = () => {
      if (this.state.viewerDetectionNote !== selection) return;
      this.setState({ detectionNotePicking: true });
      this._detectionNotePickCancel = this.requestWorkspaceNoteLocation(finish, () => { this._detectionNotePickCancel = null; this.setState({ detectionNotePicking: false }); });
    };
    if (this.state.isFullscreen) { this._detectionNoteAfterFullscreen = begin; void this.toggleFullscreen().catch(() => { this._detectionNoteAfterFullscreen = null; this.showToast(this._owned('Exit fullscreen, then choose the note location.')); }); } else begin();
  };
  private loadDetectionNoteAttachment = async (note: FieldNote, id: string, signal: AbortSignal): Promise<string> => {
    try { return await readDetectionCrop(id); } catch { /* Remote Enterprise readers use the real layer attachment. */ }
    if (!note.sharedGlobalId || !note.sharedLayerUrl || note.sharedLayerUrl !== this.sharedNotesUrl()) throw Error('Image unavailable for this Enterprise configuration.');
    const layer = new this.ArcGISModules.FeatureLayer({ url: note.sharedLayerUrl });
    try { await layer.load(); const field = layer.fields.find(item => item.type === 'global-id')?.name; if (!field || !/^\{[0-9a-f-]{36}\}$/i.test(note.sharedGlobalId)) throw Error('Invalid note.'); const result = await layer.queryFeatures({ where: `${field} = '${note.sharedGlobalId}'`, outFields: [layer.objectIdField], returnGeometry: false, num: 1 }, { signal }); const oid = result.features[0]?.attributes[layer.objectIdField]; if (!Number.isFinite(oid)) throw Error('Note unavailable.'); const files = await layer.queryAttachments({ objectIds: [oid] }); const file = files[oid]?.find(item => item.name === `detection-${id}.jpg`); if (!file) throw Error('Attachment unavailable.'); const [request] = await loadArcGISJSAPIModules(['esri/request']); const response = await request(`${note.sharedLayerUrl}/${oid}/attachments/${file.id}`, { responseType: 'blob', signal }); return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(response.data); }); } finally { layer.destroy(); }
  };
  private loadDetectionPreview: DetectionPreviewLoader = async (imageId, signal) => {
    if (!/^\d+$/.test(imageId)) throw new Error('Invalid image reference.');
    const token = this.accessToken;
    const data = await this.runSequenceBackground(requestSignal => this.fetchMapillaryJson(`${GRAPH_API.BASE}/${imageId}?fields=thumb_1024_url`, token, requestSignal), signal);
    if (typeof data.thumb_1024_url !== 'string') throw new Error('Preview unavailable.');
    return data.thumb_1024_url;
  };
  /** Invalidate detection consumers and release viewer tag/hover resources before a new image or filter takes ownership. */
  private clearDetectionOverlays() {
    this.cancelDetectionNoteLocation();
    if (this.state.viewerDetectionNote && !this.state.pendingFieldNote && !this.state.detectionWorkspaceDraft && !this._detectionWorkspaceMarkerOwner) this.clearPendingNoteGraphic();
    if (this.state.viewerDetectionNote) this.setState({ viewerDetectionNote: null, detectionNotePicking: false });

    this._detectionImageData = null;
    this._panoramaDetectionLabels?.dispose(); this._panoramaDetectionLabels = null;
    ++this._detectionLoadRequest;
    this._detectionAbort?.abort(); this._detectionAbort = null;
    this._pendingDetectionFocus = null;
    const tags = this.mapillaryViewer?.getComponent("tag");
    if (tags) {
      if ((tags as any)._detectionHoverCleanup) { (tags as any)._detectionHoverCleanup(); delete (tags as any)._detectionHoverCleanup; }
      delete (tags as any)._refreshDetectionLabels;
      tags.removeAll();
    }
    this.detectionTagMap.clear();
  }

  private syncDetectionLayerAvailability() {
    if (this.state.trafficSignsActive || this.state.objectsActive) { this.refreshDetectionExploration(); return; }
    this.clearDetectionOverlays();
    this.setState({ detectionsActive: false, targetDetectionId: null });
  }

  private getObjectDateNotice(): string | null {
    return objectDateNotice(this.state.selectedFeatureMetadata?.lastSeen, this.state.alternateImages);
  }

  private async findImageDetection(imageId: string, detectionId: string, signal: AbortSignal): Promise<any | null> {
    return lookupImageDetection({
      fetchJson: (url, token, requestSignal) => this.fetchMapillaryJson(url, token, requestSignal),
      getToken: () => this.accessToken,
    }, imageId, detectionId, signal);
  }

  private async focusSelectedDetection(imageId: string, bounds: { x: number; y: number; width: number; height: number }) {
    const pending = this._pendingDetectionFocus;
    const viewer = this.mapillaryViewer;
    if (!pending || pending.imageId !== String(imageId) || pending.request !== this._alternateNavigationRequest || pending.request === this._focusedDetectionRequest || !viewer) return;
    try {
      const image = await viewer.getImage();
      if (this.mapillaryViewer !== viewer || this._pendingDetectionFocus !== pending || pending.request !== this._alternateNavigationRequest || String(image.id) !== String(imageId)) return;
      viewer.setCenter([bounds.x + bounds.width / 2, bounds.y + bounds.height / 2]);
      this._focusedDetectionRequest = pending.request;
    } catch { /* Wait for the matching image/detection event; don't center a different image. */ }
  }

  private _mapFeatureExportAbort: AbortController | null = null;

  /**
   * Collect filtered map detections from source tiles for the requested geographic boxes.
   * @param signal Cancels tile collection; no viewport FeatureLayer is created for export.
   */
  private async collectMapFeatureExport(boxes: [number, number, number, number][], kinds: ("signs" | "objects")[], signal: AbortSignal): Promise<Blob> {
    const tiles = new Map<string, [number, number, number]>();
    for (const box of boxes) for (const tile of turboTiles(box, 14)) {
      tiles.set(tile.join("/"), tile);
      if (tiles.size * kinds.length > 64) throw new Error("This area is too large to export safely. Zoom closer and export again.");
    }
    const token = this.accessToken;
    const filters = new Map(kinds.map(kind => [kind, this._mapFeatureFilterCodes.get(kind)]));
    const chunks: BlobPart[] = ['{"type":"FeatureCollection","features":['];
    const seen = new Set<string>();
    let bytes = 0, count = 0;
    for (const kind of kinds) for (const [x, y, z] of tiles.values()) {
      if (signal.aborted) throw new DOMException("Export cancelled", "AbortError");
      const key = `${kind}:${z}/${x}/${y}`;
      let buffer = this._mapFeatureTiles.get(key);
      if (!buffer) {
        const controller = new AbortController();
        const abort = () => controller.abort(); signal.addEventListener("abort", abort, { once: true });
        const timeout = setTimeout(abort, 12000);
        try {
          const source = kind === "signs" ? TILE_URLS.TRAFFIC_SIGNS : TILE_URLS.OBJECTS;
          const response = await fetch(`${source.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y))}?access_token=${token}`, { signal: controller.signal });
          if (response.status === 404 || response.status === 204) buffer = new ArrayBuffer(0);
          else { if (!response.ok) throw new Error(`Export tile request failed (${response.status}). Try again.`); buffer = await response.arrayBuffer(); }
          if (signal.aborted) throw new DOMException("Export cancelled", "AbortError");
          this._mapFeatureTiles.set(key, buffer);
        } finally { clearTimeout(timeout); signal.removeEventListener("abort", abort); }
      }
      if (!buffer.byteLength) continue;
      if (buffer.byteLength > 16 * 1024 * 1024) throw new Error("An export tile exceeds the safe memory budget. Try a smaller region.");
      const layer = new VectorTile(new Pbf(new Uint8Array(buffer))).layers[kind === "signs" ? "traffic_sign" : "point"];
      if (!layer) continue;
      const code = filters.get(kind);
      const all = kind === "signs" ? DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS : DEFAULT_FILTER_LABELS.OBJECTS;
      const matchesCategory = categoryMatcher(code, all);
      for (let i = 0; i < layer.length; i++) {
        if (i % 100 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); if (signal.aborted) throw new DOMException("Export cancelled", "AbortError"); }
        const feature = layer.feature(i), attrs = feature.properties;
        if (attrs.id == null || !attrs.value || (kind === "objects" && String(attrs.value).includes("object--traffic-sign")) || !matchesCategory(attrs.value)) continue;
        const id = `${kind}/${attrs.id}`; if (seen.has(id)) continue;
        const point = feature.loadGeometry()?.[0]?.[0]; if (!point) continue;
        const extent = Number(feature.extent) || 4096, n = 2 ** z;
        const lon = (x + point.x / extent) / n * 360 - 180;
        const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + point.y / extent) / n))) * 180 / Math.PI;
        if (!boxes.some(box => lon >= box[0] && lon <= box[2] && lat >= box[1] && lat <= box[3])) continue;
        const text = JSON.stringify({ type: "Feature", geometry: { type: "Point", coordinates: [lon, lat] }, properties: { ...attrs, id: String(attrs.id), layer: kind } });
        bytes += text.length * 2;
        if (bytes > 32 * 1024 * 1024) throw new Error("This export exceeds the safe memory budget. Zoom closer and export again.");
        chunks.push((count++ ? "," : "") + text); seen.add(id);
      }
    }
    if (!count) throw new Error("No signs or objects match the current area and filters.");
    if (signal.aborted) throw new DOMException("Export cancelled", "AbortError");
    chunks.push("]}"); return new Blob(chunks, { type: "application/geo+json" });
  }

  private _objectPopupContent: HTMLElement | null = null;
  private _objectPopupView: __esri.MapView | __esri.SceneView | null = null;

  /** Opt-in, configuration-only diagnostics; never include popup content or credentials. */
  private traceObjectPopupDocking(view: __esri.MapView | __esri.SceneView, phase: string) {
    try {
      if (sessionStorage.getItem('mlyPopupDebug') !== '1') return;
      const widgetId = this.props.useMapWidgetIds?.[0];
      const config = widgetId ? getAppStore().getState().appConfig?.widgets?.[widgetId]?.config : null;
      const settings: Record<string, unknown> = {};
      const collect = (value: any, path: string, depth: number) => {
        if (!value || typeof value !== 'object' || depth > 8) return;
        for (const key of Object.keys(value)) {
          const next = path ? `${path}.${key}` : key;
          const item = value[key];
          if (/popup|dock/i.test(next) && /dock|position|breakpoint|enabled|width|height/i.test(key) && (item === null || ['string', 'number', 'boolean'].includes(typeof item))) settings[next] = item;
          else if (item && typeof item === 'object') collect(item, next, depth + 1);
        }
      };
      collect(config?.toJS ? config.toJS() : config, '', 0);
      const popup = view.popup;
      console.info('[Mapillary popup docking]', JSON.stringify({
        phase, mapWidgetId: widgetId,
        mapSettings: settings, viewSize: { width: view.width, height: view.height },
        popup: popup ? {
          dockEnabled: popup.dockEnabled, dockOptions: {
            position: typeof popup.dockOptions?.position === 'function' ? '[function]' : popup.dockOptions?.position,
            breakpoint: popup.dockOptions?.breakpoint, buttonEnabled: popup.dockOptions?.buttonEnabled
          },
          visible: popup.visible
        } : null
      }));
    } catch { /* Diagnostics must never affect map interaction. */ }
  }

  private applyObjectPopupDocking(view: __esri.MapView | __esri.SceneView) {
    const widgetId = this.props.useMapWidgetIds?.[0];
    const config = widgetId ? getAppStore().getState().appConfig?.widgets?.[widgetId]?.config : null;
    const position = config?.popupDockPosition;
    if (!view.popup || !['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].includes(position)) return;
    // openPopup lazily creates the SDK Popup in current Experience Builder versions.
    // Preserve its responsive breakpoint and other options; apply the Map widget's corner.
    view.popup.dockOptions = { ...view.popup.dockOptions, position };
    view.popup.dockEnabled = true;
  }

  private showSelectedObjectPopup() {
    const view = this.state.jimuMapView?.view;
    const selected = this._selectedMapFeature?.graphic;
    if (!view || !selected?.geometry || !this.state.selectedFeatureMetadata) return;
    this._objectPopupContent = document.createElement("div");
    this._objectPopupView = view;
    this.updateSelectedObjectPopup();
    this.traceObjectPopupDocking(view, 'before-open');
    this.applyObjectPopupDocking(view);
    const opening = view.openPopup({ location: selected.geometry, title: String(this.state.selectedFeatureMetadata.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), content: this._objectPopupContent });
    void Promise.resolve(opening).then(() => {
      if (view.destroyed || this._objectPopupView !== view || view.popup?.content !== this._objectPopupContent) return;
      this.applyObjectPopupDocking(view);
      this.traceObjectPopupDocking(view, 'after-open');
    }, () => { });
  }

  private updateSelectedObjectPopup() {
    const content = this._objectPopupContent;
    const metadata = this.state.selectedFeatureMetadata;
    if (!content || !metadata) return;
    content.replaceChildren();
    content.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;font-size:12px;line-height:1.4";
    for (const [label, value] of [["First seen", metadata.firstSeen], ["Last seen", metadata.lastSeen]] as const) {
      const row = document.createElement("div");
      const date = value == null ? null : new Date(typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value);
      row.textContent = `${label}: ${date && Number.isFinite(date.getTime()) ? this._presentation.date(date) : "Not available"}`;
      content.appendChild(row);
    }
    if (this.state.featureMetadataLoading || this.state.featureMetadataError) {
      const status = document.createElement("p");
      this._presentation.bind(status, "textContent", () => this.state.featureMetadataLoading ? this._owned("Loading dates…") : this.state.featureMetadataError);
      status.setAttribute("role", "status"); content.appendChild(status);
    }
    const button = document.createElement("button");
    button.type = "button"; button.className = "mly-text-action"; this._presentation.bind(button, "textContent", () => this._owned("Associated images"));
    button.style.cssText = "padding:3px 7px;font-size:12px;white-space:nowrap;cursor:pointer";
    button.onclick = () => this.setState({ nearbyStripOpen: true, imageTrayTab: "object", fieldNotesListOpen: false });
    content.appendChild(button);
    const notice = this.getObjectDateNotice();
    if (notice) {
      const note = document.createElement("small"); note.textContent = notice;
      note.style.cssText = "flex-basis:100%;margin-top:3px;color:var(--calcite-color-text-2,#666)";
      content.appendChild(note);
    }
  }

  private _objectDetailsAbort: AbortController | null = null;
  /** Scopes metadata, thumbnails and outline enrichment to the selected map feature. */
  private _objectDetailsRequest = 0;
  private _objectDetailsCache = new TurboMetadataCache<any>(16);
  /** Scopes associated-capture navigation separately from feature-detail loading. */
  private _alternateNavigationRequest = 0;
  private _alternateNavigationAbort: AbortController | null = null;

  private _mapFeatureTiles = new TurboTileCache(4 * 1024 * 1024);
  private _mapFeatureIndexes = new TurboIndexCache(8 * 1024 * 1024);
  private _selectedMapFeature: any = null;
  private _detectionToolsRequest = 0;
  private revealDetectionTools = () => { ++this._detectionToolsRequest; this.forceUpdate(); };
  private _selectedMapFeatureKind: "signs" | "objects" | null = null;
  private selectedMapFeatureEnabled(): boolean {
    return this._selectedMapFeatureKind === 'signs' ? !!this.state.trafficSignsActive : this._selectedMapFeatureKind === 'objects' ? !!this.state.objectsActive : false;
  }
  /** Invalidate selected-feature detail/navigation requests and clear their popup, tray and detection focus. */
  private clearSelectedMapFeature(kind?: "signs" | "objects"): void {
    if (kind && this._selectedMapFeatureKind !== kind) return;
    this._objectDetailsAbort?.abort(); ++this._objectDetailsRequest;
    this._alternateNavigationAbort?.abort(); ++this._alternateNavigationRequest;
    this._pendingDetectionFocus = null; this._selectedMapFeature = null; this._selectedMapFeatureKind = null;
    if (this._objectPopupContent && this._objectPopupView?.popup?.content === this._objectPopupContent) this._objectPopupView.closePopup();
    this._objectPopupContent = null; this._objectPopupView = null;
    this.setState({
      selectedFeatureMetadata: null, selectedFeatureLocation: null, alternateImages: [], isFetchingAlternates: false,
      featureMetadataLoading: false, featureMetadataError: '', alternateImagesError: '', targetDetectionId: null, imageTrayTab: 'nearby',
      ...(this.state.imageTrayTab === 'object' ? { nearbyStripOpen: false } : {})
    });
  }
  private _mapFeatureFilterCodes = new Map<string, MapCategoryFilter>();
  private _mapFeatureClickAbort: AbortController | null = null;
  private mapillaryTrafficSignsFeatureLayer: __esri.FeatureLayer | null = null;
  private mapillaryObjectsFeatureLayer: __esri.FeatureLayer | null = null;
  private turboCoverageLayer: __esri.VectorTileLayer | null = null;
  private _coverageRenderView: __esri.MapView | __esri.SceneView | null = null;
  private _coverageRenderWatch: { remove(): void } | null = null;
  private _coverageRenderAbort: AbortController | null = null;
  private readonly _coverageAnalysis = new CoverageAnalysisRun<__esri.MapView | __esri.SceneView>({
    map: () => this.state.jimuMapView,
    loading: () => !!this.state.coverageAnalysisLoading,
    coverageReady: () => !!this.turboCoverageLayer && !this.state.turboLoading,
    filters: () => this.getTurboFilters(),
    username: () => this.state.turboFilterUsername,
    configuredUsername: () => this.props.config.turboCreator,
    token: () => this.accessToken,
    turboActive: () => !!this.state.turboModeActive,
    watchExtent: (view, callback) => view.watch("extent", callback),
    geographic: view => webMercatorUtils.webMercatorToGeographic(view.extent) as __esri.Extent,
    visitCoverage: (...args) => this.visitTurboCoverage(...args),
    translate: (...args) => this._t(...args),
    owned: message => this._owned(message),
    formatNumber: value => this._presentation.number(value),
    showToast: (message, ...args) => this.showToast(message, ...args),
    showCooldown: seconds => this.showToast(
      <OwnedMessage source={"Road server is rate-limited. Try again in {value0} seconds."} values={{ value0: String(seconds) }} />, 5000),
    update: patch => this.setState(patch),
    publish: (bbox, innerBbox, segments, coverage) => {
      this.stopCoverageRendering();
      this._coverageAnalysisBbox = bbox;
      this.drawCoverageZone(innerBbox);
      this._coverageSegments = segments;
      this._coverageCoveredFlags = coverage.segmentTiers.map(tier => tier !== "none");
      this._coverageSegmentTiers = coverage.segmentTiers;
      this.setState({ coverageResult: coverage, coverageSegmentsVisible: false });
    },
    log: message => this.log(message),
  });

  private cancelCoverageAnalysis = () => this._coverageAnalysis.cancel();

  private _coverageRenderRevision = 0;
  private _coverageRenderLimited = false;

  /** Cancel incremental coverage drawing so retired analysis cannot continue adding graphics. */
  private stopCoverageRendering() {
    ++this._coverageRenderRevision;
    this._coverageRenderAbort?.abort(); this._coverageRenderAbort = null;
    this._coverageRenderWatch?.remove(); this._coverageRenderWatch = null;
    if (this._coverageSegmentsLayer) {
      this._coverageRenderView?.map?.remove(this._coverageSegmentsLayer);
      this._coverageSegmentsLayer.destroy(); this._coverageSegmentsLayer = null;
    }
    this._coverageRenderView = null; this._coverageRenderLimited = false;
  }

  private async refreshCoverageViewport(view: __esri.MapView | __esri.SceneView) {
    const layer = this._coverageSegmentsLayer;
    if (!layer || this._coverageRenderView !== view || this.state.jimuMapView?.view !== view || !this.state.coverageSegmentsVisible) return;
    this._coverageRenderAbort?.abort();
    const controller = new AbortController(); this._coverageRenderAbort = controller;
    const revision = this._coverageRenderRevision;
    const current = () => !controller.signal.aborted && revision === this._coverageRenderRevision && this._coverageSegmentsLayer === layer && this.state.jimuMapView?.view === view && this.state.coverageSegmentsVisible;
    try {
      const extent = view.extent;
      const geo = extent?.spatialReference?.isGeographic ? extent : webMercatorUtils.webMercatorToGeographic(extent) as __esri.Extent;
      if (!geo || ![geo.xmin, geo.xmax, geo.ymin, geo.ymax].every(Number.isFinite)) return;
      const width = geo.xmax - geo.xmin, height = geo.ymax - geo.ymin;
      const south = Math.max(-90, geo.ymin - height * .1), north = Math.min(90, geo.ymax + height * .1);
      const wrap = (lon: number) => ((lon + 180) % 360 + 360) % 360 - 180;
      const boxes: [number, number, number, number][] = width * 1.2 >= 180 ? [[-180, south, 180, north]] : turboFootprintBboxes([{ lon: wrap(geo.xmin - width * .1), lat: south }, { lon: wrap(geo.xmax + width * .1), lat: north }]);
      const display = await buildCoverageDisplayPaths(this._coverageSegments, this._coverageSegmentTiers, this._coverageCoveredFlags, boxes, controller.signal);
      if (!current()) return;
      if (display.limited) {
        layer.removeAll();
        if (!this._coverageRenderLimited) this.showToast(this._t('appZoomCloserToDrawClassifiedStreetsFullAreaAnalysis'), 5000);
        this._coverageRenderLimited = true; return;
      }
      this._coverageRenderLimited = false;
      const styles = {
        fresh: { color: [55, 213, 130, .9], width: 2, style: "solid" },
        aging: { color: [255, 193, 7, .95], width: 2, style: "solid" },
        stale: { color: [255, 110, 50, 1], width: 3, style: "solid" },
        none: { color: [220, 50, 50, 1], width: 3, style: "dash" },
      };
      const graphics: __esri.Graphic[] = [];
      for (const tier of ["fresh", "aging", "stale", "none"] as const) {
        const paths = display.groups[tier];
        for (let i = 0; i < paths.length; i += 512) graphics.push(new this.ArcGISModules.Graphic({
          geometry: { type: "polyline", paths: paths.slice(i, i + 512), spatialReference: { wkid: 4326 } },
          symbol: { type: "simple-line", ...styles[tier] }, attributes: { coverage_tier: tier },
        }));
      }
      if (!current()) return;
      // One synchronous commit after preparation; no per-segment layer updates.
      layer.removeAll(); layer.addMany(graphics);
    } catch (error) {
      if (current()) this.showToast(this._t('appClassifiedStreetsCouldNotBeDrawnAnalysisAndRouting'), 4000);
    }
  }

  private _coverageSegmentsLayer: __esri.GraphicsLayer | null = null;
  private _coverageZoneGraphic: __esri.Graphic | null = null;
  private _coverageSegments: import("../utils/geoUtils").RoadSegment[] = [];
  private _coverageCoveredFlags: boolean[] = [];
  private _coverageSegmentTiers: import("../components/types").SegmentTier[] = [];
  private _coverageAnalysisBbox: [number, number, number, number] | null = null;
  private turboCoverageLayerView: __esri.LayerView | null = null;
  private _spriteCache: Record<string, { img: HTMLImageElement; json: any }> = {};

  // Spatial Caching Trackers
  private _loadedTurboFiltersKey: string = "";
  private _userIdCache: Map<string, number | null> = new Map();
  private _turboLoadTask: Promise<void> = Promise.resolve();
  private _turboCoveragePending: {
    view: __esri.MapView | __esri.SceneView; map: __esri.Map;
    key: string; controller: AbortController; promise: Promise<void>;
  } | null = null;
  private _turboDecodeTask: Promise<void> = Promise.resolve();
  /** Identifies the foreground imagery selection; stale metadata/navigation must not publish against a newer selection. */
  private _selectionRequestId = 0;
  private readonly _sharedTileRequests = new SharedTileRequests();
  private readonly _sequenceTileIndex = new SequenceTileIndex();
  private readonly _backgroundRequests = new BackgroundRequestQueue(2);
  /** Explicit, read-only information enrichment. It never changes queue policy or foreground work. */
  private readonly _imageInformationHost: ImageInformationHost = {
    hasImage: () => !!this._profileConfirmedImageId && this._profileConfirmedViewer === this.mapillaryViewer,
    isPaused: () => this._userPaused !== false,
    isVisible: () => this.props.state !== 'CLOSED' && this.props.visible !== false && (typeof document === 'undefined' || document.visibilityState !== 'hidden'),
    scope: () => this.accessToken,
    isCurrent: (viewer, id) => this.mapillaryViewer === viewer && this._profileConfirmedViewer === viewer && this._profileConfirmedImageId === id,
    seed: image => ({ ...normalizeImageInformation(String(image.id), this._turboMetadataCache.get(String(image.id))), ...viewerImageInformation(image) }),
    load: (viewer, id, signal) => this._backgroundRequests.run(async queuedSignal => {
      const token = this.accessToken;
      const current = () => !queuedSignal.aborted && this._imageInformationHost.isPaused() && this._imageInformationHost.isVisible()
        && this._imageInformationHost.isCurrent(viewer, id) && !this.state.isLoading && this._imageryOpeningRequest == null && token === this.accessToken;
      if (!current()) throw new DOMException('Cancelled', 'AbortError');
      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/${encodeURIComponent(id)}?fields=${IMAGE_INFORMATION_FIELDS}`, token, queuedSignal);
      if (!current()) throw new DOMException('Cancelled', 'AbortError');
      if (String(data?.id) !== id) throw new Error('Image information identity mismatch.');
      return normalizeImageInformation(id, data);
    }, signal),
  };

  private readonly _sequencePerformance = new SequencePerformance();
  private _tileRequestToken: string | null = null;
  private readonly _reverseAddressEnrichment = new ReverseAddressEnrichment<__esri.MapView | __esri.SceneView>({
    imageId: () => this.state.imageId,
    view: () => this.state.jimuMapView?.view,
    runBackground: (work, signal) => this.runSequenceBackground(work, signal),
    publish: address => this.setState({ address }),
    warn: error => console.warn('[Mapillary] Address enrichment unavailable:', error),
  });
  private readonly _sequenceDiagnostics = new SequenceDiagnostics({
    snapshot: () => this.sequenceDiagnosticsSnapshot(),
    reset: () => { this._sequencePerformance.reset(); this._nearbyDiscovery?.resetStats(); },
    recordLongTask: duration => this._sequencePerformance.recordLongTask(duration),
  });
  private _hoverSequenceTiming: { finish(): void; cancel(): void } | undefined;
  private _imageSequenceTiming: { finish(): void; cancel(): void } | undefined;
  private _hoverTimingAbort: AbortController | null = null;
  private _hoverTimingTarget: { sequenceId: string | null; view: unknown; work: Promise<void>; completion: Promise<void> } | null = null;
  private _viewerImageTiling: boolean | null = null;
  private readonly _sequenceVisibilityChange = () => {
    this._sequencePerformance.playbackFrame(false);
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      this._hoverSequenceTiming?.cancel(); this._hoverTimingAbort?.abort();
      this._imageSequenceTiming?.cancel();
    }
  };
  private _timeTravelAvailability: TimeTravelAvailability | null = null;
  private _cachedSequencePreview: CachedSequencePreview | null = null;
  private _localSequenceDeferredRequest: number | null = null;
  private _imageryOpeningRequest: number | null = null;
  private _selectionAbort: AbortController | null = null;
  private _sequenceStorageDisabled = false;
  private _selectionRetry: { sequenceId: string; imageId: string; clickPoint?: { lon: number; lat: number }; nearestToClick?: boolean } | null = null;
  private _lastSuccessfulSelection: any = null;
  private _coverageNoticeHidden = false;
  private _nearbyFramesHintSeen = false;
  private _nearbyFramesHintTimer: ReturnType<typeof setTimeout> | null = null;
  private _coverageHelpButton = React.createRef<HTMLButtonElement>();
  private _focusCoverageHelp = (node: HTMLDivElement | null) => node?.focus();
  private _turboLoadingTimer: ReturnType<typeof setTimeout> | null = null;
  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;
  private _nativeImageAnchorAbort: AbortController | null = null;
  private _nativeImageAnchorKey = '';
  private _directionAnchorAbort: AbortController | null = null;
  private _directionBearings = new Map<string, { token: string; bearing?: number }>();
  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;
  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;
  private _screenDirectionCone: ScreenDirectionCone | null = null;
  private readonly _currentImagePresentation = new CurrentImagePresentationOwner();
  /** Transfer current-image feedback to this map owner; shared-map presentation must not outlive its claim. */
  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {
    if (!view?.map || view.destroyed || this.props.visible === false || this.props.state === 'CLOSED') return;
    this._currentImagePresentation.activate(view.map, String(this.props.id), () => {
      this._stopRoutePreview?.();
      this._nearbyDiscovery?.cancel();
      this.highlightNearbyPin?.(null);
      this._nativeImageAnchorAbort?.abort(); this._nativeImageAnchorAbort = null; this._nativeImageAnchorKey = '';
      if (this._coneRedrawRaf != null) { cancelAnimationFrame(this._coneRedrawRaf); this._coneRedrawRaf = null; }
      this._nativeCurrentImageMarker?.clear(); this._screenDirectionCone?.clear();
      this._selectionPulse?.dispose(); this._cameraCone?.dispose(view);
    });
  }
  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;
  private _turboMetadataCache = new TurboMetadataCache<any>();
  private _turboTileCache = new TurboTileCache();
  private _turboIndexCache = new TurboIndexCache();
  private _turboIndexTask: Promise<void> = Promise.resolve();
  private _turboIndexPending = new Map<string, Promise<TurboSpatialIndex | null>>();
  private _turboIndexAbort = new AbortController();
  private _turboCoverageOriginalStyle: any = null;
  private _mapillaryCoverageStyle: any = null;
  private _turboCoverageAdded = false;
  private _turboCreatorId: number | undefined;
  private _turboHoverPickAbort: AbortController | null = null;
  private _turboHoverInfoAbort: AbortController | null = null;
  private _turboPickWarning: string | null = null;
  private _turboDismissedWarning: string | null = null;
  private _hoverBearingHints = new HoverBearingHintCache();
  private _coverageFrameLookup: CoverageFrameLookup | null = null;
  private _coverageFrameHoverTimer: ReturnType<typeof setTimeout> | null = null;
  private _coverageFrameHoverTarget: { key: string; sequenceId: string; location: { lon: number; lat: number } } | null = null;
  private _turboHoveredScreen: { x: number; y: number } | null = null;
  private _representativePickCache: RepresentativePickCache | null = null;
  private _coverageHoverResume: CoverageHoverResume | null = null;
  private _coverageTouchHover: CoverageTouchHover | null = null;
  private _coverageHoverHandler: ((event: any) => void) | null = null;
  private _turboMapLeaveCleanup: (() => void) | null = null;
  private _turboClickPickAbort: AbortController | null = null;
  /** Rejects delayed SDK hit tests from an older click or retired map view. */
  private _mapClickRevision = 0;

  // Point Cloud Variables
  private _pointCloudCache = new PointCloudClusterCache();
  /** Bind lazy host adapters once; construction starts no network, timer or SDK work. */
  private _pointCloudAcquisition = new PointCloudAcquisition<__esri.MapView | __esri.SceneView, PointCloudResult>({
    read: () => ({
      view: this.state.jimuMapView?.view, imageId: this.state.imageId, sequenceImages: this.state.sequenceImages,
      fullscreen: this.state.isFullscreen, visible: !!this.state.pointCloudVisible, loading: !!this.state.pointCloudLoading,
      follow: !!this.state.pointCloudFollowImages, paused: !!this.state.pointCloudAutoPaused
    }),
    readSequence: () => ({ complete: this._liveSequenceFrames.complete, sequenceId: this.state.sequenceId }),
    nearby: (id, imageId, signal) => this._sequenceDemand.corridor(id, imageId, signal, (a, b) => distanceMeters(a.lat, a.lon, b.lat, b.lon)),
    loadTransport: (session, corridor, onProgress) => loadPointCloud(session.imageId, this.accessToken, {
      signal: session.signal, cache: this._pointCloudCache, forceDiscovery: session.forceDiscovery, frustumCrop: false,
      cropLengthMeters: POINT_CLOUD_CONFIG.FETCH_LENGTH, cropWidthMeters: POINT_CLOUD_CONFIG.FETCH_WIDTH,
      sequenceImages: corridor.map(image => ({ id: image.id, lon: image.lon, lat: image.lat })), onProgress,
    }),
    onContext: (imageId, points) => { this._pointCloudSequenceContext = { imageId, points }; },
    onContextError: error => console.warn('[Mapillary cloud] Nearby sequence context unavailable; using known image positions:', error),
    onStart: () => this.setState({ pointCloudLoading: true, pointCloudAvailable: undefined }),
    onResult: (result, session) => this.acceptPointCloudResult(result, session),
    onProgress: (status, session) => this.showPointCloudProgress(status, session),
    onError: (error, session) => {
      const message = session.signal.aborted ? "Point-cloud loading timed out or was cancelled. Retry to load this area." : (error as Error)?.message || "Load failed.";
      console.warn("Point cloud load failed:", message);
      this.recordPointCloudIssue("Cloud unavailable for this image. " + message + " Try the next image or retry.", session.automatic);
    },
    onFinish: () => this.setState({ pointCloudLoading: false }),
    onWrongView: () => this.showToast(this._t('appPointCloudIsOnlyAvailableIn3dMapMode')),
    onPrevious: previous => this.setState({ pointCloudPrevious: previous }),
    onCloseForBrowsing: () => {
      this.clearPointCloud(true);
      this.showToast(this._t('appPointCloudClosedForBrowsingChooseAutoFollowIn'), 3500);
    },
    waitForMapEdits: () => this._pointCloudMapLayer?.pending.catch(() => { }) || Promise.resolve(),
    schedule: (callback, delay) => setTimeout(callback, delay),
    cancelTimer: handle => clearTimeout(handle),
  });
  private _pointCloudMapLayer: PointCloudMapLayer<__esri.FeatureLayer, __esri.MapView | __esri.SceneView, PointCloudResult> | null = null;
  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;
  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;
  /** Bind live note/map state and SDK factories; the feature owns group/local-layer lifecycle. */
  private _fieldNoteMap = new FieldNoteMap<__esri.GroupLayer, __esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView>({
    readContext: () => ({ view: this.state.jimuMapView?.view, ready: !!this.ArcGISModules, disposed: this._sharedNotesDisposed }),
    readNotes: () => this.state.fieldNotes,
    readShared: () => ({ url: this.props.config.sharedFieldNotesUrl, loaded: !!this._sharedNotesLayer?.loaded, view: this._sharedNotesView }),
    clearPending: () => this.clearPendingNoteGraphic(),
    loadGroupFactory: async () => {
      const [GroupLayer] = await loadArcGISJSAPIModules(["esri/layers/GroupLayer"]);
      return properties => new GroupLayer(properties) as __esri.GroupLayer;
    },
    loadLayerFactory: async () => {
      const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
      return properties => new GraphicsLayer(properties) as __esri.GraphicsLayer;
    },
    readGraphicFactory: () => {
      const { Graphic } = this.ArcGISModules;
      return (note, is3D) => new Graphic(buildLocalNoteGraphic(note, is3D));
    },
    configureFocusLayer: (layer, measured) => { layer.elevationInfo = { mode: measured ? 'absolute-height' : 'on-the-ground' }; },
    highlightNote: (view, layer, graphic, current) => startNoteHighlight(view, layer, graphic, current),
  });
  private _workspaceNoteLocation = new WorkspaceLocationPicker<__esri.MapView | __esri.SceneView>();
  /** Map intent only; workspace auth, categories and draft content remain feature-owned. */
  private requestWorkspaceNoteLocation: WorkspaceLocationRequest = (picked, cancelled) => {
    this._workspaceNoteLocation.cancel();
    const view = this.state.jimuMapView?.view;
    if (!view || view.destroyed || !view.map) { this.showToast(this._owned('Connect a map before choosing a contribution location.')); cancelled(); return () => { }; }
    this._fieldNoteMap.clearHighlight(); this._coverageHoverResume?.leave(); this._turboHoverPickAbort?.abort(); this.clearTurboHover();
    const container = view.container as HTMLElement, previous = container?.style.cursor;
    if (container) container.style.cursor = 'crosshair';
    const restore = () => { if (container?.style.cursor === 'crosshair') container.style.cursor = previous || ''; };
    return this._workspaceNoteLocation.begin(view, point => { restore(); this.drawClickRipple(point.lon, point.lat, [245, 166, 35]); picked(point); }, () => { restore(); cancelled(); });
  };
  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */
  private _fieldNoteFiles = new FieldNoteFiles({
    readNotes: () => this.state.fieldNotes,
    setNotes: (notes, callback) => this.setState({ fieldNotes: notes }, callback),
    persist: notes => this.saveFieldNotesToStorage(notes),
    drawMapNotes: () => this.drawFieldNoteGraphics(),
    updateViewerNotes: () => this.updateViewerFieldNoteMarkers(),
    notify: notice => showFieldNoteFileFeedback((...args) => this.showToast(...args), notice),
    logExportError: error => console.error("Field notes export failed", error),
    logImportError: error => console.error("Field notes import failed:", error),
  });
  /** Coordinate local collection changes; storage, graphics and shared-save authority stay separate. */
  private _localNoteCollection = new LocalNoteCollection({
    readNotes: () => this.state.fieldNotes,
    isSaving: id => this._sharedNoteSaves.has(id),
    anySaving: () => !!this._sharedNoteSaves.size,
    isEditing: () => !!this.state.fieldNoteEditor?.saving,
    restore: applyNotes => restoreLocalNotes(this.FIELD_NOTES_STORAGE_KEY, applyNotes),
    persist: notes => this.saveFieldNotesToStorage(notes),
    setNotes: (notes, callback) => this.setState({ fieldNotes: notes }, callback),
    drawMapNotes: () => this.drawFieldNoteGraphics(),
    updateViewerNotes: () => this.updateViewerFieldNoteMarkers(),
    notifyCleared: () => showLocalNotesClearedFeedback((...args) => this.showToast(...args), this.props.config.sharedFieldNotesEnabled),
  });
  /** Bind draft intent to existing state, marker, persistence and shared-note publication owners. */
  private _fieldNoteDraft = new FieldNoteDraft({
    readState: () => this.state,
    setState: (update, callback) => this.setState(update, callback),
    drawRipple: (...args) => this.drawClickRipple(...args),
    drawPending: (...args) => this.drawPendingNoteGraphic(...args),
    clearPending: () => this.clearPendingNoteGraphic(),
    persist: notes => this.saveFieldNotesToStorage(notes),
    drawMapNotes: () => this.drawFieldNoteGraphics(),
    updateViewerNotes: () => this.updateViewerFieldNoteMarkers(),
    publish: id => this.publishFieldNote(id),
    notify: (kind, enabled) => showFieldNoteDraftFeedback((...args) => this.showToast(...args), kind, enabled),
    now: () => Date.now(), random: () => Math.random(),
  });
  /** Resolve annotation coordinates from live retained cloud data; note creation stays with field notes. */
  private _annotationCloudPick = new PointCloudAnnotationPicker({
    readResult: () => this._pointCloudAcquisition.result,
    isCloudVisible: () => !!this.state.pointCloudVisible,
    annotate: (lon, lat, altitude) => this.handleAnnotationMapClick(lon, lat, altitude),
    warn: error => console.warn("HitTest failed for Point Cloud", error),
  });
  /** Route existing SDK hits; enterprise notes, annotation picking and image navigation stay outside. */
  private _pointCloudHits = new PointCloudHitRouting<__esri.Point & PointCloudHitGeometry>({
    readState: () => this.state,
    readResult: () => this._pointCloudAcquisition.result,
    mapUpdating: () => !!this._pointCloudMapLayer?.updating,
    setMeasurement: (points, callback) => this.setState({ measurePoints: points }, callback),
    updateMeasurement: () => this.updateMeasurementGraphics(),
    readSight: () => this._sight,
    placeViewshed: geometry => this.ensureViewshedOwner().place(geometry),
    readRenderer: () => this._pointCloudViewerRenderer,
    readViewer: () => this.mapillaryViewer,
    notifyUpdating: () => this.showToast(this._t('appUpdatingPointCloudDisplaySelectThePointAgainIn'), 2000),
  });
  /** Bind tool policy to live React state and existing feature owners; no new resources. */
  private _pointCloudTools = new PointCloudTools({
    readState: () => this.state,
    setState: (updater, callback) => this.setState(updater, callback),
    updateMeasurement: () => this.updateMeasurementGraphics(),
    clearSightResource: () => this._sight?.clear(),
    activateSight: () => this.ensureSightOwner().activate(),
    clearSight: () => this.clearSight(),
    clearViewshed: () => this.clearViewshed(),
    clearLasso: () => this.clearLasso(),
    notify: tool => showPointCloudToolFeedback((...args) => this.showToast(...args), tool),
  });
  /** Bind existing resource owners lazily; construction starts no cleanup or SDK work. */
  private _pointCloudLifecycle = new PointCloudLifecycle({
    readState: () => this.state,
    acquisition: () => this._pointCloudAcquisition,
    adaptive: () => this._pointCloudAdaptiveDisplay,
    map: () => this._pointCloudMapLayer,
    lasso: () => this._lasso,
    measurement: () => this._measurement,
    sight: () => this._sight,
    rings: () => this._rings,
    dismissProgress: () => this._toastNotifications.dismiss("point-cloud-progress"),
    cancelNudge: () => this._debouncedNudgeRender?.cancel?.(),
    clearViewerData: () => {
      this._pointCloudSequenceContext = null;
      this.removeViewerPointCloudRenderer(); this._filteredPointCloudPoints = [];
    },
    setState: (patch, callback) => this.setState(patch, callback),
    canUpdateMeasurement: () => !!this.state.jimuMapView?.view?.map && !this.state.jimuMapView.view.destroyed,
    updateMeasurement: () => this.updateMeasurementGraphics(),
    clearViewshed: () => this.clearViewshed(),
    clearLasso: () => this.clearLasso(),
    clear: reset => this.clearPointCloud(reset),
    load: () => this.loadPointCloudLayer(),
  });
  /** Apply accepted results without duplicating acquisition, scene edits or viewer ownership. */
  private _pointCloudResult = new PointCloudResultApplication({
    readState: () => this.state,
    readAcquisition: () => this._pointCloudAcquisition,
    readCamera: () => ({ lon: this._cameraLon, lat: this._cameraLat }),
    setCamera: (lon, lat) => { this._cameraLon = lon; this._cameraLat = lat; },
    readBearing: () => this.getStreetBearing(),
    clearLasso: () => this.clearLasso(),
    resetOffsets: () => { this._nudgeX = 0; this._nudgeY = 0; this._nudgeZ = 0; },
    setBaseAltitude: altitude => { this._baseAlt = altitude; },
    setState: patch => this.setState(patch),
    renderMap: silent => this.renderPointCloudMapLayer(silent),
    drawRings: radius => this.drawConcentricRings(radius),
    setFilteredPoints: points => { this._filteredPointCloudPoints = points; },
    readViewerRenderer: () => this._pointCloudViewerRenderer,
    resizeViewer: () => this.mapillaryViewer?.resize(),
    attachViewer: (result, imageId) => this.addViewerPointCloudRenderer(result, imageId),
    recordIssue: (...args) => this.recordPointCloudIssue(...args),
    notifyLoaded: (result, points) => showPointCloudLoadedFeedback((...args) => this.showToast(...args), result, points, this.state.pointCloudLength, this.state.pointCloudWidth),
    config: POINT_CLOUD_CONFIG,
  });
  /** Bind crop state and viewer subset authority without retaining a second cloud copy. */
  private _pointCloudCrop = new PointCloudCrop({
    readState: () => this.state,
    readResult: () => this._pointCloudAcquisition.result,
    readCamera: () => ({ lon: this._cameraLon, lat: this._cameraLat }),
    readBearing: () => this.getStreetBearing(),
    readViewerRenderer: () => this._pointCloudViewerRenderer,
    setState: (patch, callback) => this.setState(patch, callback),
    setFilteredPoints: points => { this._filteredPointCloudPoints = points; },
    renderMap: () => this.renderPointCloudMapLayer(),
    drawRings: radius => this.drawConcentricRings(radius),
    resizeViewer: () => { if (this.mapillaryViewer) this.mapillaryViewer.resize(); },
    widthMax: POINT_CLOUD_CONFIG.WIDTH_MAX,
  });
  /** Export owns single-flight state; raw points are borrowed without crop/ground/lasso filtering. */
  private _pointCloudExport = new PointCloudExport({
    canExport: () => !!this.state.pointCloudVisible && !!this._pointCloudAcquisition.result,
    readResult: () => this._pointCloudAcquisition.result!,
    readVerticalOffset: () => this._nudgeZ,
    readHorizontalContext: () => ({ x: this._nudgeX, y: this._nudgeY, latitude: this._cameraLat }),
    readImageId: () => this.state.imageId,
    isDisposed: () => this._sharedNotesDisposed,
    setLoading: loading => this.setState({ pointCloudExportLoading: loading }),
    notify: notice => showPointCloudExportFeedback((...args) => this.showToast(...args), notice),
    writers: { csv: buildPointCloudCsv, ply: buildPointCloudPly, las: buildPointCloudLas },
    logError: error => console.error("Point Cloud download failed", error),
  });
  private _groundMode: boolean = false;
  private _lasso: PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;
  private measureLabelRef = React.createRef<HTMLDivElement>();

  private _measurement: PointCloudMeasurement<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;
  private _sight: PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point> | null = null;
  private _viewshed: PointCloudViewshed<__esri.ViewshedAnalysis, __esri.MapView | __esri.SceneView> | null = null;
  private _rings: PointCloudRings<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView, PointCloudResult> | null = null;

  // Calibration offsets and live runtime adapters
  /** Borrow current meter offsets; input guards and debounce cancellation stay with widget lifecycle. */
  private _pointCloudCalibration = new PointCloudCalibration({
    readOffsets: () => ({ x: this._nudgeX, y: this._nudgeY, z: this._nudgeZ }),
    writeOffsets: offset => { this._nudgeX = offset.x; this._nudgeY = offset.y; this._nudgeZ = offset.z; },
    readBearing: () => this._lastBearing,
    readStep: () => this.state.nudgeStep,
    requestRender: () => this._debouncedNudgeRender(),
    renderMap: () => this.renderPointCloudMapLayer(),
    drawRings: () => this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength),
    updateViewer: () => {
      if (this._pointCloudViewerRenderer) {
        this._pointCloudViewerRenderer.updateColors();
        if (this.mapillaryViewer) this.mapillaryViewer.resize();
      }
    },
  });

  private _nudgeX: number = 0; // East/West offset in meters
  private _nudgeY: number = 0; // North/South offset in meters
  private _nudgeZ: number = 0; // Up/Down offset in meters
  private _baseAlt: number = 0;
  private _cameraLat: number = 0;
  private _cameraLon: number = 0;
  private _filteredPointCloudPoints: PointCloudPoint[] = [];

  // UI elements
  private tooltipDiv: HTMLDivElement | null = null;
  private minimapView: __esri.MapView | null = null;
  private _minimapRevision = 0;
  private _minimapReady = false;
  private minimapGraphicsLayer: __esri.GraphicsLayer | null = null;

  // Caches and timeouts
  private sequenceCoordsCache: Record<string, { id: string; lat: number; lon: number }[]> = {};
  private _directionDiscovery: DirectionHoverDiscovery | null = null;
  private _hoverTimeout: any = null;
  private readonly _pendingCoverageHover = new PendingCoverageHover<__esri.MapView | __esri.SceneView>(
    view => !this._sharedNotesDisposed && this.state.jimuMapView?.view === view && !view.destroyed && view.stationary !== false && this.props.state !== 'CLOSED' && this.props.visible !== false && !this._workspaceNoteLocation?.active,
    () => typeof document === 'undefined' ? null : document.createElement('div'));
  private _hoverPreviewStatus = new DelayedHoverStatus(hoverPreviewLoading => {
    this._pendingCoverageHover?.loading(hoverPreviewLoading);
    if (!this._sharedNotesDisposed) this.setState({ hoverPreviewLoading });
  });
  private readonly _zoomWarningTimer = new ZoomWarningTimer({
    show: message => this.setState({ zoomWarningMessage: message, turboWarningAction: undefined, turboWarningIsHelp: false }),
    hide: () => this.setState({ zoomWarningMessage: undefined }),
    clear: () => this.setState({ zoomWarningMessage: undefined, turboWarningAction: undefined, turboWarningIsHelp: false }),
  });
  private _currentHoveredFeatureId: string | null = null;
  private _coverageSelectionTargets = new CoverageSelectionTargets<__esri.Point>();
  private _directionBindings: DirectionHoverBindings | null = null;
  private detectionTagMap: Map<string, string> = new Map();
  private readonly _toastNotifications = new ToastNotifications<React.ReactNode>({
    show: message => this.setState({ toastMessage: typeof message === "string" ? <OwnedMessage source={message} /> : message }),
    hide: () => this.setState({ toastMessage: undefined }),
  });

  // Backup arrays to reset filter dropdowns to their initial state
  private _fullTrafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }> = [];
  private _fullObjectsOptions: Array<{ value: string; label: string; iconUrl: string | null }> = [];

  // Camera settings
  private coneSpreads = [60, 40, 30, 20];
  private coneLengths = [10, 15, 20, 30];
  private zoomStepIndex = 0;
  private _lastBearing: number = 0;
  private readonly _currentImageBearing = new CurrentImageBearing<Viewer>((viewer, imageId, bearing) => {
    if (this.mapillaryViewer !== viewer || String(this.state.imageId) !== imageId) return;
    this._lastBearing = this._sharedStartupBearing ?? bearing;
    const view = this.state.jimuMapView?.view;
    if (view) this.requestConeRedraw(view);
  });
  private _coneRedrawRaf: number | null = null;
  private readonly _viewZoomBindings = new ViewZoomBindings<__esri.MapView | __esri.SceneView>({
    currentView: () => this.state.jimuMapView?.view,
    flyIn: () => this._isFlyInActive,
    imageId: () => this.state.imageId,
    qualityActive: () => this.state.qualityViewActive,
    debounce: debounceUtil,
    updateUrl: imageId => this.updateUrlWithCurrentImage(imageId),
    publishZoom: currentZoom => this.setState({ currentZoom }),
    refreshPulse: view => this.refreshActivePulseAnchor(view),
    refreshMarkers: () => this.refreshSequenceMarkerWindow(),
    redrawCone: view => this.requestConeRedraw(view),
    showWarning: (message, duration) => this.showZoomWarning(message, duration),
    clearWarning: () => this.clearZoomWarning(),
  });

  // Debounced function
  private debouncedTurboFilter: (() => void) & { cancel?: () => void };
  private _debouncedBearingUrlUpdate: (() => void) & { cancel?: () => void } = Object.assign(() => { }, { cancel: () => { } });
  private _sequenceRequests = new SharedSequenceRequests((id, token, signal, progress) => this.fetchSequenceWithCoords(id, token, signal, progress));
  private _sequenceDemand = new SequenceDemandData((url, signal) => this.runSequenceBackground(requestSignal => this.fetchMapillaryJson(url, this.accessToken, requestSignal), signal));
  private _localSequenceTask: { key: string; request: number; signal: AbortSignal; promise: Promise<void> } | null = null;
  private _pointCloudSequenceContext: { imageId: string; points: SequenceCoordinate[] } | null = null;
  private _localSequenceKey = '';
  private _fullRouteFailure = '';
  private _localSequenceBackoff: { request: number; until: number } | null = null;
  private _fullRouteTask: { sequenceId: string; request: number; controller: AbortController; promise: Promise<void> } | null = null;
  private _liveSequenceFrames = new LiveSequenceFrames((id, signal) => this.fetchMapillaryJson(`${GRAPH_API.BASE}/${id}?fields=id,sequence,geometry`, this.accessToken, signal));
  private _liveFrameDetails = new LatestFrameDetails();
  private _sequenceMarkerKey = '';
  private _sequenceMarkerAbort: AbortController | null = null;
  private _liveSequenceLine: { sequenceId: string; geometry: __esri.Geometry } | null = null;
  private _minimapTrackingOwner: __esri.GraphicsLayer | null = null;
  private _minimapFrameDot: __esri.Graphic | null = null;
  private _minimapFrameCone: __esri.Graphic | null = null;
  private _minimapSequenceLine: __esri.Graphic | null = null;
  private _minimapSequenceGeometry: __esri.Geometry | null = null;
  private _minimapFrameId: string | null = null;

  private _nearbyDiscovery: NearbyImageDiscovery | null = null;
  private _turboAbortController: AbortController | null = null;

  // Request tracking
  /** Scopes native coverage setup/loading feedback to the current coverage revision. */
  private _turboRequestCount: number = 0;
  /** Invalidates delayed setup/shared-link work when the active map view is replaced. */
  private readonly _activeViewTransfer = new ActiveViewTransfer<__esri.MapView | __esri.SceneView>(this.activeViewTransferHost());
  private _startupUrlParameters: URLSearchParams | null = null;
  private _sharedStateRestoreComplete: boolean = false;
  private _isFlyInActive: boolean = false;
  private _sharedStartupBearing: number | null = null;
  private _sharedStartupImageId: string | null = null;
  private _hasAttemptedMapSwitch: boolean = false;

  /** Saved heading is applied to the ready image; final URL writes wait for the flight. */
  private readonly _sharedViewerBearingHost: SharedViewerBearingHost = {
    getViewer: () => this.mapillaryViewer,
    onBearing: bearing => { this._lastBearing = bearing; const view = this.state.jimuMapView?.view; if (view) this.requestConeRedraw(view); this.updateMinimapTracking(); },
    updateUrl: (imageId, latitude, longitude) => { if (!this._isFlyInActive) this.updateUrlWithCurrentImage(imageId, latitude, longitude); },
    warn: error => console.warn("Could not set shared bearing on viewer:", error),
  };

  // Hover graphics
  private _turboHoverGraphic: __esri.Graphic | null = null;
  private _turboHoverGraphicsLayer: __esri.GraphicsLayer | null = null;
  private _turboHoverInterval: any = null;
  private _turboHoverFrame: number | null = null;
  private _turboHoverOverlay: HTMLDivElement | null = null;
  private _turboHoverAnchor: HTMLDivElement | null = null;
  private _turboHoverBearing: HoverBearingSector | null = null;
  private _coverageAlignmentDiagnostic: NativeCoverageAlignmentDiagnostic | null = null;
  private readonly _nativeSequenceSelection = new TileSequenceHighlights();
  private _activeSequenceOverlay: ActiveSequenceOverlay<__esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;
  private _lastHoveredTurboOid: string | number | null = null;
  private _nearbySelectedId: string | null = null;

  // Solar & Shadow Modeling
  private _mapSymbolLegend: MapSymbolLegend<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;
  private _solarMapOverlay: SolarMapOverlay<__esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;

  private clearMapLegendLayer() {
    this._mapSymbolLegend?.clear();
  }

  private syncMapLegendLayer() {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules?.FeatureLayer || this.props.config.hideLegend) { this.clearMapLegendLayer(); return; }
    if (view.destroyed || view.ready === false) return;
    const targetType = this._startupUrlParameters?.get(SHARE_PARAMS.MAP_TYPE);
    // The host may expose its default 3D view before switching to a shared 2D view.
    if (!this._sharedStateRestoreComplete && (targetType === "2d" || targetType === "3d") && view.type !== targetType) return;
    this._mapSymbolLegend ??= new MapSymbolLegend(properties => new this.ArcGISModules.FeatureLayer(properties), this._presentation);
    this._mapSymbolLegend.sync(view, this.props.id);
    this._mapSymbolLegend.setCommunityCategories(this._fieldNoteMap.workspaceCategories, this._fieldNoteMap.workspaceName);
  }

  private _solarViewer: SolarViewerRenderer | null = null;
  private _solarSceneLighting: SolarSceneLighting | null = null;

  // Elevation Profile
  private _elevationProfile: ElevationProfileController | null = null;
  private _profileConfirmedImageId: string | null = null;
  private _profileConfirmedViewer: any = null;
  private _sceneTerrain: SceneTerrainController | null = null;
  private syncSceneTerrain(view = this.state.jimuMapView?.view): void {
    this._sceneTerrain ??= new SceneTerrainController(async () => {
      const [ElevationLayer] = await loadArcGISJSAPIModules(["esri/layers/ElevationLayer"]);
      return ElevationLayer;
    });
    void this._sceneTerrain.sync(view, this.props.config.enable3DTerrain === true).catch(error => {
      console.warn("[Mapillary terrain] Could not enable scene terrain:", error);
    });
  }

  private _playbackBindings: PlaybackBindings | null = null;

  /** Bind live playback/UI callbacks once; the owner manages listeners and recovery delays. */
  private readonly _playbackBindingsHost: PlaybackBindingsHost = {
    isPaused: () => this._userPaused,
    setPaused: paused => { this._userPaused = paused; this._places?.controller.sync(); this._backgroundRequests?.setLimit(paused ? 2 : 1); if (paused) this._sequencePerformance?.playbackFrame(false); },
    getLastInteraction: () => this._lastInteractionTime,
    recordInteraction: time => { this._lastInteractionTime = time; },
    onPlaying: () => {
      this._nearbyDiscovery?.cancel();
      if (this.state.nearbyLoading) this.setState({ nearbyLoading: false });
    },
    refreshNearbyAfterPause: () => this.refreshNearbyAfterPause(),
    announceRecovery: () => {
      this.log("[Mapillary Recovery] Playback halted on dead frame. Auto-skipping...");
      this.showToast(
        <span style={recoveryFeedbackStyle()}>
          <Icons.Warning size={14} />
          {this._t('app403SkippingUnavailableFrame')} </span>,
        2000,
      );
    },
    recover: () => this.forceSkipNext(),
    now: () => Date.now(),
    schedule: (callback, delay) => setTimeout(callback, delay),
    cancel: handle => clearTimeout(handle),
  };

  private _userPaused: boolean = true;
  private _lastInteractionTime: number = 0;
  private readonly CAPTURE_ROUTE_CONFIG = CAPTURE_ROUTE_CONFIG;

  state: State = {
    jimuMapView: null,
    turboModeActive: true,
    imageId: null,
    sequenceId: null,
    sequenceImages: [],
    lon: null,
    lat: null,
    isFullscreen: false,
    address: null,
    isLoading: false,
    availableSequences: [],
    selectedSequenceId: null,
    noImageMessageVisible: false,
    tilesActive: true,
    trafficSignsActive: false,
    objectsActive: false,
    turboLoading: false,
    featuresLoading: false,
    coverageAnalysisLoading: false,
    coverageResult: null,
    coverageSegmentsVisible: false,
    turboFilterUsername: "",
    turboFilterOrganization: this.props.config.turboOrganization || "",
    organizationName: null,
    turboFilterStartDate: "",
    turboFilterEndDate: "",
    turboFilterIsPano: undefined,
    turboFilterOnFoot: undefined,
    showTurboFilterBox: false,
    turboYearLegend: [],
    qualityViewActive: false,
    selectedQualityBand: null,
    showTrafficSignsFilterBox: false,
    trafficSignsSelectedCodes: null,
    objectsSelectedCodes: null,
    trafficSignsFilterValue: { value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null },
    signSpritesStatus: 'idle', objectSpritesStatus: 'idle',
    trafficSignsOptions: [{ value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null }],
    showObjectsFilterBox: false,
    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },
    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],
    filtersLoaded: false,
    showIntro: true,
    placesActive: false, placesAutoUpdate: true, placeNotePhase: 'idle', placesPanelOpen: false, placesTileCategory: 'all', placesSourceLoading: false, placesStatus: { kind: 'off', count: 0 }, selectedPlace: null, placesHoveredId: null, placesRevealRequest: 0, placesShowLink: false, placesList: [], placesCameraDistance: null,
    hasTimeTravel: false,
    showMinimap: true,
    detectionsActive: false,
    showAiTags: true,
    detectionExplorer: { ...defaultDetectionExplorer, groups: [...defaultDetectionExplorer.groups] },
    detectionSummary: { total: 0, shown: 0, counts: {} },
    isSharedState: false,
    alternateImages: [],
    selectedFeatureLocation: null,
    isFetchingAlternates: false,
    targetDetectionId: null,
    syncHeading: false,
    lockToImage: false,
    isLassoMode: false,
    lassoPolygon: [],
    lassoSelectedObjectIds: [],
    isMeasureMode: false,
    measurePoints: [],
    showCalibrationPanel: false,
    nudgeStep: 0.5, // Default movement step is half a meter
    pointCloudLoading: false,
    pointCloudVisible: false,
    pointCloudAvailable: undefined,
    pointCloudLength: POINT_CLOUD_CONFIG.LENGTH_DEFAULT,
    pointCloudMaxLength: POINT_CLOUD_CONFIG.LENGTH_MAX,
    pointCloudActualLength: 100,
    pointCloudWidth: POINT_CLOUD_CONFIG.WIDTH_DEFAULT, // Default width is 30m (15m left, 15m right)
    pointCloudMaxWidth: POINT_CLOUD_CONFIG.WIDTH_MAX,
    pointCloudActualWidth: 50,
    pointCloudFollowImages: false,
    pointCloudAdaptive: false,
    pointCloudColorMode: "rgb",
    isSightMode: false,
    sightObserver: null,
    sightTargets: [],
    isViewshedMode: false,
    isAnnotationMode: false,
    fieldNotes: [],
    pendingFieldNote: null,
    viewerDetectionNote: null, detectionNotePicking: false, detectionNoteCapturing: false, detectionWorkspaceDraft: null,
    fieldNotesListOpen: false,
    isGeneratingRoute: false,
    routeData: null,
    isSolarMode: false,
    isElevationProfileActive: false,
    routeStartPoint: null,
    routeEndPoint: null,
    routeSpareMinutes: 15,
    routePickMode: null,
    routeTravelMode: "drive",
    routeGenerationProgress: null,
    routingEngineOverride: null,
  };

  constructor(props: AllWidgetProps<any>) {
    super(props);

    // Read accessToken from manifest.json properties - you should use your own token start with MLY
    this.accessToken = (props.manifest?.properties as any)?.mapillaryAccessToken || "";

    // Wrap the layer reload logic in debounce (300ms delay after typing stops)
    this.debouncedTurboFilter = debounceUtil(async () => {
      if (this.state.turboModeActive) { await this.enableTurboCoverageLayer(); return; }
      // Read state lazily inside the fired timeout, not captured at schedule time
      const turboFilterUsername = this.state.turboFilterUsername;
      const turboFilterStartDate = this.state.turboFilterStartDate;
      const turboFilterEndDate = this.state.turboFilterEndDate;
      const turboFilterIsPano = this.state.turboFilterIsPano;

      let creatorId: number | undefined = undefined;
      const username = turboFilterUsername?.trim();
      if (username) {
        creatorId = (await this.getUserIdFromUsername(username)) || undefined;
      }

      this.rebuildCoverageLayer(
        creatorId,
        turboFilterStartDate || undefined,
        turboFilterEndDate || undefined,
        turboFilterIsPano,
        this.state.qualityViewActive,
        this.state.selectedQualityBand,
      );

      if (this.state.turboModeActive) {
        await this.enableTurboCoverageLayer();
      }
    }, 300);
  }

  /** Bind live image-tracking capabilities once per viewer event binding; no work starts during binding. */
  private viewerImageTrackingHost(): ViewerImageTrackingHost<Viewer, __esri.MapView | __esri.SceneView> {
    const widget = this;
    return {
      get currentView() { return widget.state.jimuMapView?.view; },
      get syncMap() { return widget.props.config.syncMapWithImage; },
      get loading() { return widget.state.isLoading; },
      get imageId() { return widget.state.imageId; },
      get sequenceId() { return widget.state.sequenceId; },
      get viewerNote() { return widget.state.viewerDetectionNote; },
      get profileActive() { return widget.state.isElevationProfileActive; },
      get detectionsActive() { return widget.state.detectionsActive; },
      get solarActive() { return widget.state.isSolarMode; },
      get currentViewer() { return widget.mapillaryViewer; },
      get openingRequest() { return widget._imageryOpeningRequest; },
      set openingRequest(value) { widget._imageryOpeningRequest = value; },
      get retry() { return widget._selectionRetry; },
      set retry(value) { widget._selectionRetry = value; },
      get bearing() { return widget._currentImageBearing; },
      get confirmedViewer() { return widget._profileConfirmedViewer; },
      set confirmedViewer(value) { widget._profileConfirmedViewer = value; },
      get confirmedImageId() { return widget._profileConfirmedImageId; },
      set confirmedImageId(value) { widget._profileConfirmedImageId = value; },
      get initialImage() { return widget._isInitialImageLoad; },
      get noteReview() { return widget._placeNoteReview; },
      get stopRoute() { return widget._stopRoutePreview; },
      get detectionAbort() { return widget._detectionAbort; },
      get timeTravel() { return widget._timeTravelAvailability; },
      get nearby() { return widget._nearbyDiscovery; },
      get frames() { return widget._liveSequenceFrames; },
      get places() { return widget._places; },
      get performance() { return widget._sequencePerformance; },
      get paused() { return widget._userPaused; },
      get address() { return widget._reverseAddressEnrichment; },
      get requestId() { return widget._selectionRequestId; },
      set requestId(value) { widget._selectionRequestId = value; },
      get selectionAbort() { return widget._selectionAbort; },
      set selectionAbort(value) { widget._selectionAbort = value; },
      get background() { return widget._backgroundRequests; },
      get deferredRequest() { return widget._localSequenceDeferredRequest; },
      set deferredRequest(value) { widget._localSequenceDeferredRequest = value; },
      get optimisticId() { return widget._nearbySelectedId; },
      set optimisticId(value) { widget._nearbySelectedId = value; },
      get details() { return widget._liveFrameDetails; },
      get flying() { return widget._isFlyInActive; },
      highlightNearbyPin: (...args) => this.highlightNearbyPin(...args),
      updateProfileIndicator: (...args) => this.updateProfileIndicator(...args),
      applyCustomCameraAngle: (...args) => this.applyCustomCameraAngle(...args),
      cancelDetectionNoteLocation: (...args) => this.cancelDetectionNoteLocation(...args),
      clearPendingNoteGraphic: (...args) => this.clearPendingNoteGraphic(...args),
      commit: (...args) => this.setState(...args),
      updatePlacesCamera: (...args) => this.updatePlacesCamera(...args),
      clearActiveSequenceLayer: (...args) => this.clearActiveSequenceLayer(...args),
      prepareDemandSequence: (...args) => this.prepareDemandSequence(...args),
      checkAndLoadNextPointCloud: (...args) => this.checkAndLoadNextPointCloud(...args),
      updateMinimapTracking: (...args) => this.updateMinimapTracking(...args),
      refreshSequenceMarkerWindow: (...args) => this.refreshSequenceMarkerWindow(...args),
      refreshLocalSequence: (...args) => this.refreshLocalSequence(...args),
      syncMapToImage: (...args) => this.syncMapToImage(...args),
      loadDetections: (...args) => this.loadDetections(...args),
      updateViewerFieldNoteMarkers: (...args) => this.updateViewerFieldNoteMarkers(...args),
      checkForTimeTravel: (...args) => this.checkForTimeTravel(...args),
      updateSolarGraphics: (...args) => this.updateSolarGraphics(...args),
      fetchReverseGeocode: (...args) => this.fetchReverseGeocode(...args),
      updateUrlWithCurrentImage: (...args) => this.updateUrlWithCurrentImage(...args),
      fetchNearbyImages: (...args) => this.fetchNearbyImages(...args),
      hasDraft: () => !!(this.state.pendingFieldNote || this.state.detectionWorkspaceDraft || this._detectionWorkspaceMarkerOwner),
      clearDetectionMarkers: () => { this._detectionViewerMarkers?.dispose(); this._detectionViewerMarkers = null; },
      clearDetectionImageData: () => { this._detectionImageData = null; },
      clearPanoramaLabels: () => { this._panoramaDetectionLabels?.dispose(); this._panoramaDetectionLabels = null; },
      publishPulse: frame => { this.currentGreenGraphic = this.drawPulsingPoint(frame.lon, frame.lat, [0, 255, 0, 1], frame.id); },
      rememberSelection: newId => { this._lastSuccessfulSelection = { sequenceImages: this.state.sequenceImages, imageId: newId, sequenceId: this.state.sequenceId, selectedSequenceId: this.state.selectedSequenceId }; },
    };
  }

  /**
   * Bind image, camera and playback callbacks to the current Mapillary viewer.
   * Rebinding clears current map feedback; callers restoring feedback must do so afterward.
   * Event handlers coordinate live selection state with feature-owned renderers and background metadata.
   */
  private bindMapillaryEvents() {
    bindViewerEvents(this.viewerEventsHost());
  }

  /** Bind live viewer-event capabilities without starting SDK listeners, timers or rendering while binding. */
  private viewerEventsHost(): ViewerEventsHost<Viewer, __esri.MapView | __esri.SceneView> {
    const widget = this;
    return {
      get view() { return widget.state.jimuMapView?.view; },
      get syncMap() { return widget.props.config.syncMapWithImage; },
      get sequenceImages() { return widget.state.sequenceImages; },
      get imageId() { return widget.state.imageId; },
      get turbo() { return widget.state.turboModeActive; },
      get selectedSequence() { return widget.state.selectedSequenceId; },
      get syncHeading() { return widget.state.syncHeading; },
      get locked() { return widget.state.lockToImage; },
      get viewer() { return widget.mapillaryViewer; },
      get bearing() { return widget._currentImageBearing; },
      get flying() { return widget._isFlyInActive; },
      get frames() { return widget._liveSequenceFrames; },
      get lastBearing() { return widget._lastBearing; },
      set lastBearing(value) { widget._lastBearing = value; },
      get coneLengths() { return widget.coneLengths; },
      get coneSpreads() { return widget.coneSpreads; },
      get zoomStep() { return widget.zoomStepIndex; },
      set zoomStep(value) { widget.zoomStepIndex = value; },
      get sharedBearing() { return widget._sharedStartupBearing; },
      get coneRaf() { return widget._coneRedrawRaf; },
      set coneRaf(value) { widget._coneRedrawRaf = value; },
      get bearingUrl() { return widget._debouncedBearingUrlUpdate; },
      set bearingUrl(value) { widget._debouncedBearingUrlUpdate = value; },
      clearGreenPulse: (...args) => this.clearGreenPulse(...args),
      clearConeGraphics: (...args) => this.clearConeGraphics(...args),
      updateUrlWithCurrentImage: (...args) => this.updateUrlWithCurrentImage(...args),
      drawCone: (...args) => this.drawCone(...args),
      setupDirectionHover: (...args) => this.setupDirectionHover(...args),
      updateMinimapTracking: (...args) => this.updateMinimapTracking(...args),
      navigateMapView: (...args) => this.navigateMapView(...args),
      imageTrackingHost: (...args) => this.viewerImageTrackingHost(...args),
      container: () => this.viewerContainer.current,
      debounce: debounceUtil,
      bindPlayback: () => {
        this._playbackBindings ??= new PlaybackBindings(this._playbackBindingsHost);
        this._playbackBindings.bind(this.mapillaryViewer!.getComponent("sequence"), this.viewerContainer.current);
      },
    };
  }

  // #region DIRECTION HOVER SYSTEM
  // Highlights the target image marker on the map when the user hovers over
  // Mapillary's navigation arrows (DirectionComponent).
  // Flow:
  //   setupDirectionHover        → subscribes to DirectionComponent._hoveredId$
  //       └─ handleDirectionHover    → finds image coords from state/cache/API
  //           ├─ DirectionHoverDiscovery → sequence/cache lookup and API fallback
  //           └─ drawDirectionHighlight  → draws pulsing yellow marker on map
  //   clearDirectionHighlight    → removes marker + stops pulse animation

  /** Bind direction events and touch simulation through one disposable owner. */
  private setupDirectionHover() {
    if (!this.mapillaryViewer) return;
    this._directionBindings ??= new DirectionHoverBindings({
      onHover: imageId => this.handleDirectionHover(imageId),
      log: (...args) => this.log(...args),
    });
    this._directionBindings.bind(this.mapillaryViewer, this.viewerContainer.current);
  }

  /** Bind live lookup state and rendering callbacks once; hover requests stay owner-managed. */
  private ensureDirectionHoverDiscovery(): DirectionHoverDiscovery {
    return this._directionDiscovery ??= new DirectionHoverDiscovery({
      getState: () => this.state,
      getToken: () => this.accessToken,
      hasMarker: () => !!this._directionHighlight?.graphic,
      clearMarker: () => this.clearDirectionHighlight(),
      drawMarker: image => this.drawDirectionHighlight(image),
      log: (...args) => this.log(...args),
      fetch: (input, init) => fetch(input, init),
    });
  }

  /** Forward direction hover only when the current view and SDK can display a marker. */
  private handleDirectionHover(hoveredId: string | null) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;
    this.ensureDirectionHoverDiscovery().handle(hoveredId);
  }

  /** Bind live host dependencies once; marker and interval lifetime belong to the owner. */
  private ensureDirectionHoverMarker(): DirectionHoverMarker<__esri.Graphic> {
    return this._directionHighlight ??= new DirectionHoverMarker({
      getView: () => this.state.jimuMapView?.view,
      getMinimap: () => this.minimapGraphicsLayer,
      createGraphic: properties => new this.ArcGISModules.Graphic(properties),
      createGroundMarker: presented => new ScreenDirectionCone(
        properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),
        { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },
        visible => presented(visible)),
      setInterval: (callback, milliseconds) => setInterval(callback, milliseconds),
      clearInterval: handle => clearInterval(handle),
    });
  }

  /** Forward the resolved navigation target to the map/minimap pulse owner. */
  private drawDirectionHighlight(hoveredImg: { id: string; lon: number; lat: number }) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;
    if (view.type !== '3d') { this.ensureDirectionHoverMarker().draw(view, hoveredImg); return; }
    void this.resolveDirectionHoverAnchor(view, hoveredImg);
  }

  /** Resolve this exact navigation image in coverage tiles; never choose a neighbouring ID. */
  private async resolveDirectionHoverAnchor(view: __esri.MapView | __esri.SceneView, image: { id: string; lon: number; lat: number }) {
    this._directionAnchorAbort?.abort();
    const controller = new AbortController(); this._directionAnchorAbort = controller;
    const context = { ...this.coverageSelectionContext() }, token = this.accessToken;
    const current = () => this._directionAnchorAbort === controller && !controller.signal.aborted &&
      this.state.jimuMapView?.view === view && !view.destroyed && this.accessToken === token &&
      this.coverageSelectionContext().revision === context.revision && this.coverageSelectionContext().layer === context.layer;
    const { lon, lat } = image;
    try {
      if (context.enabled && context.individual && !this._coverageSelectionTargets.anchor(context, image.id)) {
        const zoom = ZOOM.TILE_FETCH, n = 2 ** zoom;
        const x = Math.max(0, Math.min(n - 1, Math.floor((lon + 180) / 360 * n)));
        const latitude = Math.max(-85.05112878, Math.min(85.05112878, lat));
        const y = Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * n)));
        const tiles: [number, number, number][] = [[x, y, zoom]];
        // API and tile quantization can straddle a boundary. Reuse adjacent cached bytes only.
        for (const [tileKey] of this._turboTileCache.snapshot()) {
          const [z, tx, ty] = tileKey.split('/').map(Number);
          if (z === zoom && Math.abs(tx - x) <= 1 && Math.abs(ty - y) <= 1 && (tx !== x || ty !== y)) tiles.push([tx, ty, z]);
        }
        for (const tile of tiles) {
          if (!current()) return;
          const [tx, ty, z] = tile;
          const cached = this._turboTileCache.get(`${z}/${tx}/${ty}`);
          const buffer = cached ?? await this.runSequenceBackground(signal => this.getTurboTileBuffer(tile, signal), controller.signal);
          if (!current()) return;
          if (!buffer.byteLength) continue;
          const index = this._sequenceTileIndex.has(buffer)
            ? await this.getSequenceTileIndex(buffer, controller.signal)
            : await this.runSequenceBackground(signal => this.getSequenceTileIndex(buffer, signal), controller.signal);
          if (!current()) return;
          const point = nativeImageAnchor(buffer, index, bytes => new VectorTile(new Pbf(new Uint8Array(bytes))), tile, image.id);
          if (!point) continue;
          const geometry = new this.ArcGISModules.Point({ ...point, spatialReference: { wkid: 3857 } });
          this._coverageSelectionTargets.retain(this.coverageSelectionContext(), image.id, geometry);
          break;
        }
      }
    } catch (error) {
      if (current() && (error as any)?.name !== 'AbortError') this.log('[Mapillary] Direction coverage anchor unavailable:', error);
    } finally {
      if (current()) {
        const anchor = this.getCoverageDisplayPosition(image.id, lon, lat);
        this.ensureDirectionHoverMarker().draw(view, { id: image.id, lon: anchor.lon, lat: anchor.lat });
        // Draw the aligned disk immediately; enrich its cone only while this hover remains current.
        try {
          let metadata = this._directionBearings.get(image.id);
          if (!metadata || metadata.token !== token) {
            const data = await this.runSequenceBackground(signal => this.fetchMapillaryJson(
              `${GRAPH_API.BASE}/${encodeURIComponent(image.id)}?fields=computed_compass_angle,compass_angle,is_pano`, token, signal), controller.signal);
            if (!current()) return;
            const angle = data.computed_compass_angle ?? data.compass_angle;
            metadata = { token, bearing: !data.is_pano && Number.isFinite(angle) ? angle : undefined };
            this._directionBearings.delete(image.id); this._directionBearings.set(image.id, metadata);
            if (this._directionBearings.size > 64) this._directionBearings.delete(this._directionBearings.keys().next().value!);
          }
          if (current() && metadata.bearing !== undefined)
            this.ensureDirectionHoverMarker().draw(view, { id: image.id, lon: anchor.lon, lat: anchor.lat, bearing: metadata.bearing });
        } catch (error) {
          if (current() && (error as any)?.name !== 'AbortError') this.log('[Mapillary] Direction bearing unavailable:', error);
        }
      }
      if (this._directionAnchorAbort === controller) this._directionAnchorAbort = null;
    }
  }

  /** Release the navigation-target marker, matching minimap marker and pulse interval. */
  private clearDirectionHighlight() {
    this._directionAnchorAbort?.abort(); this._directionAnchorAbort = null;
    this._directionHighlight?.clear();
  }

  // #regionend Direction Hover System

  /*
   * Default color palette for sequence overlays.
   * Each item is [R, G, B, A] with RGB 0–255 and Alpha 0–1.
   * This palette intentionally avoids pure blue for polylines so that blue markers
   * (sequence images) remain visually distinct from sequence lines.
   * Order is chosen to maximize contrast between neighboring sequences
   * and to match common cartographic color practices.
   */
  private sequenceColors = [
    [255, 0, 0, 1], // red
    [0, 200, 0, 1], // green
    [255, 165, 0, 1], // orange
    [160, 32, 240, 1], // purple
    [255, 192, 203, 1], // pink
    [128, 0, 128, 1], // dark purple
    [255, 255, 0, 1], // yellow
    [128, 128, 128, 1], // grey
    [0, 255, 255, 1], // cyan
  ];

  /*
   * Returns a consistent but visually distinct color for a sequence index.
   * Repeats the base palette cyclically, darkening subsequent cycles by 10%
   * to hint repeated usage without losing sequence distinction.
   * @param index Sequence order index from availableSequences array (used for both polyline and dropdown background).
   * @returns Array [R, G, B, A] suitable for ArcGIS API symbol color.
   */
  private pickSequenceColor(index: number) {
    const baseColors = this.sequenceColors;
    // Pick color from palette in cyclic order
    const color = baseColors[index % baseColors.length];

    // If we've cycled through the palette more than once...
    const cycle = Math.floor(index / baseColors.length);
    if (cycle > 0 && Array.isArray(color)) {
      // Reduce RGB brightness progressively for each cycle
      const factor = 1 - cycle * 0.1; // darken 10% each cycle
      return [
        Math.max(0, color[0] * factor),
        Math.max(0, color[1] * factor),
        Math.max(0, color[2] * factor),
        color[3], // keep alpha channel unchanged
      ];
    }
    return color;
  }

  // #region SEQUENCE MANAGEMENT
  // Handles loading, drawing, caching and clearing sequence overlays.
  // Load a specific sequence by ID and image
  // Resolves the selected image independently of optional complete route data,
  // updates the viewer, re-draws map markers,
  // and attaches Mapillary event listeners for bearing/image changes.
  /** Resolve coordinates for one image from available metadata; fetch missing coordinates only on demand. */
  private async getSelectedImageCoords(sequenceId: string, imageId: string, signal: AbortSignal): Promise<{ id: string; lon: number; lat: number; captured_at?: number }> {
    const live = this._liveSequenceFrames.sequenceId === sequenceId ? this._liveSequenceFrames.find(imageId) : undefined;
    if (live) return live;
    const nearby = this._sequenceDemand.find(sequenceId, String(imageId)); if (nearby) return nearby;
    const cached: { id: string; lon: number; lat: number; captured_at?: number }[] = this.sequenceCoordsCache[sequenceId] || (this.state.sequenceId === sequenceId ? this.state.sequenceImages : []);
    const found = cached.find(p => String(p.id) === String(imageId));
    if (found && Number.isFinite(found.lon) && Number.isFinite(found.lat)) return { ...found, id: String(imageId) };
    const preview = this._turboMetadataCache.get(String(imageId));
    const coordinates = preview?.geometry?.coordinates;
    if (coordinates && Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1])) {
      return { id: String(imageId), lon: coordinates[0], lat: coordinates[1], captured_at: preview.captured_at ? new Date(preview.captured_at).getTime() : undefined };
    }
    const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/${imageId}?fields=id,geometry,captured_at`, this.accessToken, signal);
    const xy = data.geometry?.coordinates;
    if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1])) throw Object.assign(new Error("Selected image coordinates are unavailable"), { status: 404 });
    return { id: String(imageId), lon: xy[0], lat: xy[1], captured_at: data.captured_at ? new Date(data.captured_at).getTime() : undefined };
  }

  /**
   * Create and bind the SDK viewer only when its React-owned container exists and no viewer is active.
   * The SDK owns the container contents; React overlays must remain outside it.
   */
  private ensureImageViewer(startImageId: string): void {
    // Create new Mapillary viewer
    if (!this.mapillaryViewer && this.viewerContainer.current) {
      this._isInitialImageLoad = true;
      this._viewerImageTiling = this.props.config.imageTiling === true;
      this.mapillaryViewer = new Viewer({
        container: this.viewerContainer.current,
        accessToken: this.accessToken,
        imageTiling: this.props.config.imageTiling === true,
        renderMode: this.props.config.renderMode ?? 1, // Default to Fill
        transitionMode: this.props.config.transitionMode ?? 0, // Default to Smooth
        component: {
          zoom: true,
          direction: {
            maxWidth: 200,
            minWidth: 200,
          },
          cover: false,
          tag: true,
          marker: true,
          sequence: {
            minWidth: 50,
            maxWidth: 117,
          },
        },
      });

      this.bindMapillaryEvents();

      // Attach custom renderers only when creating a viewer.
      if (this.state.pointCloudVisible && this._pointCloudAcquisition.result) {
        this.addViewerPointCloudRenderer({ ...this._pointCloudAcquisition.result, points: this._filteredPointCloudPoints }, startImageId);
      }
      if (this.state.isMeasureMode) {
        this.updateViewerMeasurementRenderer();
      }

      // Re-attach the Sun renderer if the viewer was destroyed
      if (this.state.isSolarMode) {
        this._solarViewer?.resetRegistration(); // Reset the flag for the new viewer
        this.updateSolarGraphics();
      }
    }

  }

  /**
   * Open the requested capture with foreground selection ownership, then populate local sequence context.
   * New selections invalidate old work; optional route/metadata hydration must not block initial imagery.
   * @param sequenceId Sequence context supplied by the coverage pick or associated-image navigation.
   * @param startImageId Capture to open before optional sequence hydration.
   */
  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {
    return openSequence(sequenceId, startImageId, clickPoint, representative, nearestToClick, clickStartedAt, this.sequenceOpeningHost());
  }

  /** Bind live selection owners and concrete SDK/GIS presentation without retaining a state snapshot. */
  private sequenceOpeningHost(): SequenceOpeningHost<Viewer, __esri.MapView | __esri.SceneView, __esri.Graphic> {
    const widget = this;
    return {
      get backgroundRequests() { return widget._backgroundRequests; },
      get cachedSequencePreview() { return widget._cachedSequencePreview; },
      get currentImageBearing() { return widget._currentImageBearing; },
      get detectionAbort() { return widget._detectionAbort; },
      get imageSequenceTiming() { return widget._imageSequenceTiming; },
      set imageSequenceTiming(value) { widget._imageSequenceTiming = value; },
      get imageryOpeningRequest() { return widget._imageryOpeningRequest; },
      set imageryOpeningRequest(value) { widget._imageryOpeningRequest = value; },
      get isFlyInActive() { return widget._isFlyInActive; },
      set isFlyInActive(value) { widget._isFlyInActive = value; },
      get lastBearing() { return widget._lastBearing; },
      get lastSuccessfulSelection() { return widget._lastSuccessfulSelection; },
      set lastSuccessfulSelection(value) { widget._lastSuccessfulSelection = value; },
      get liveFrameDetails() { return widget._liveFrameDetails; },
      get liveSequenceFrames() { return widget._liveSequenceFrames; },
      get liveSequenceLine() { return widget._liveSequenceLine; },
      get localSequenceDeferredRequest() { return widget._localSequenceDeferredRequest; },
      set localSequenceDeferredRequest(value) { widget._localSequenceDeferredRequest = value; },
      get nativeSequenceSelection() { return widget._nativeSequenceSelection; },
      get nearbyDiscovery() { return widget._nearbyDiscovery; },
      translate: (...args) => this._owned(...args),
      get places() { return widget._places; },
      get placesExploreAbort() { return widget._placesExploreAbort; },
      get profileConfirmedImageId() { return widget._profileConfirmedImageId; },
      get profileConfirmedViewer() { return widget._profileConfirmedViewer; },
      get reverseAddressEnrichment() { return widget._reverseAddressEnrichment; },
      get selectionAbort() { return widget._selectionAbort; },
      set selectionAbort(value) { widget._selectionAbort = value; },
      get selectionRequestId() { return widget._selectionRequestId; },
      set selectionRequestId(value) { widget._selectionRequestId = value; },
      get selectionRetry() { return widget._selectionRetry; },
      set selectionRetry(value) { widget._selectionRetry = value; },
      get sequencePerformance() { return widget._sequencePerformance; },
      get sharedStartupBearing() { return widget._sharedStartupBearing; },
      set sharedStartupBearing(value) { widget._sharedStartupBearing = value; },
      get sharedStartupImageId() { return widget._sharedStartupImageId; },
      set sharedStartupImageId(value) { widget._sharedStartupImageId = value; },
      get stopRoutePreview() { return widget._stopRoutePreview; },
      get timeTravelAvailability() { return widget._timeTravelAvailability; },
      get userPaused() { return widget._userPaused; },
      set userPaused(value) { widget._userPaused = value; },
      get accessToken() { return widget.accessToken; },
      checkForTimeTravel: (...args) => this.checkForTimeTravel(...args),
      clearActiveSequenceGraphics: (...args) => this.clearActiveSequenceGraphics(...args),
      clearActiveSequenceLayer: (...args) => this.clearActiveSequenceLayer(...args),
      clearConeGraphics: (...args) => this.clearConeGraphics(...args),
      clearElevationProfile: (...args) => this.clearElevationProfile(...args),
      clearGreenPulse: (...args) => this.clearGreenPulse(...args),
      get coneLengths() { return widget.coneLengths; },
      get coneSpreads() { return widget.coneSpreads; },
      get currentGreenGraphic() { return widget.currentGreenGraphic; },
      set currentGreenGraphic(value) { widget.currentGreenGraphic = value; },
      drawCone: (...args) => this.drawCone(...args),
      drawPoint: (...args) => this.drawPoint(...args),
      drawPulsingPoint: (...args) => this.drawPulsingPoint(...args),
      ensureImageViewer: (...args) => this.ensureImageViewer(...args),
      getSelectedImageCoords: (...args) => this.getSelectedImageCoords(...args),
      getSequencesInBBox: (...args) => this.getSequencesInBBox(...args),
      highlightNearbyPin: (...args) => this.highlightNearbyPin?.(...args),
      get viewer() { return widget.mapillaryViewer; },
      nearestCoverageImage: (...args) => this.nearestCoverageImage(...args),
      prepareDemandSequence: (...args) => this.prepareDemandSequence(...args),
      refreshSequenceMarkerWindow: (...args) => this.refreshSequenceMarkerWindow(...args),
      get sequenceCoordsCache() { return widget.sequenceCoordsCache; },
      // React's generic Pick<State, Key> cannot infer this feature-owned subset; keep the key-specific bridge local.
      commit: <Key extends keyof OpeningState>(update: Pick<OpeningState, Key> | (() => Pick<OpeningState, Key> | null), after?: () => void) =>
        this.setState<Key>(update as Pick<State, Key> | (() => Pick<State, Key> | null), after),
      get state() { return widget.state; },
      updateNativeSequenceSelection: (...args) => this.updateNativeSequenceSelection(...args),
      updateProfileIndicator: (...args) => this.updateProfileIndicator(...args),
      waitForSequencePaint: (...args) => this.waitForSequencePaint(...args),
      get zoomStepIndex() { return widget.zoomStepIndex; },
      get routeOverlayVisible() { return widget._activeSequenceOverlay?.view === widget.state.jimuMapView?.view && !!widget._activeSequenceOverlay?.layer && !!widget.state.jimuMapView?.view.map?.layers.includes(widget._activeSequenceOverlay.layer); },
      stopMapAnimation: () => { (this.state.jimuMapView?.view as any)?.animation?.stop(); },
    };
  }

  // Fetch nearby sequences (single API call)
  // - Queries Mapillary Graph API for images within ~10m bbox.
  // - Groups them by sequence ID and keeps the earliest captured_at
  // - date per sequence for UI dropdown display.
  private async getSequencesInBBox(lon: number, lat: number, accessToken: string) {
    return findSequenceCandidates(lon, lat, accessToken);
  }

  // Fetch full coordinate list of a sequence
  // - Uses sequence_id → image_ids → geometry batch fetch
  // - to get lat/lon for all frames in a sequence efficiently.
  /** Fetch and validate a Mapillary JSON response through the existing API helper; forward cancellation to transport. */
  private async fetchMapillaryJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {
    return fetchGraphJson(url, accessToken, signal);
  }

  /** Cache reuse and local context never initiate complete coordinate downloads. */
  private async prepareDemandSequence(sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {
    const current = () => !controller.signal.aborted && requestId === this._selectionRequestId && this.state.sequenceId === sequenceId && this.state.jimuMapView?.view === view;
    try {
      if (!current()) return;
      // Cached tile feedback is independent of optional persistent route storage.
      // Local discovery still waits for cache adoption to avoid duplicate requests.
      if (!this._liveSequenceFrames.complete)
        void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);
      const cached = await readCachedSequenceCoordinates(this.sequenceCoordsCache, sequenceId, controller.signal);
      if (!current()) return;
      if (this._localSequenceDeferredRequest === requestId) this._localSequenceDeferredRequest = null;
      if (cached) {
        this._liveSequenceFrames.finish(sequenceId, cached);
        this.setState(() => !current() ? null : ({ sequenceImages: cached, sequenceRouteLoading: false, sequenceRouteProgress: undefined }), () => {
          if (!current()) return;
          this._lastSuccessfulSelection = { sequenceImages: cached, imageId: this.state.imageId, sequenceId, selectedSequenceId: sequenceId };
          this.updateProfileIndicator();
        });
        await this.renderLiveSequenceLine(cached, sequenceId, requestId, controller, view);
      } else if (!cached) {
        void this.refreshLocalSequence();
        void this.refreshSequenceMarkerWindow();
      }
      if (current() && this.state.isElevationProfileActive) void this.updateElevationProfile();
    } catch (error) {
      if (!current()) return;
      // Browser storage is optional. Local browsing must still work.
      if (this._localSequenceDeferredRequest === requestId) this._localSequenceDeferredRequest = null;
      void this.refreshLocalSequence();
      if (this.state.isElevationProfileActive) void this.updateElevationProfile();
    }
  }

  /** A single nearby worker, refreshed only when crossing a 32-frame boundary. */
  private async refreshLocalSequence(): Promise<void> {
    const { sequenceId, imageId, jimuMapView } = this.state;
    const controller = this._selectionAbort, request = this._selectionRequestId, view = jimuMapView?.view;
    if (!sequenceId || !imageId || !controller || controller.signal.aborted || !view ||
      this.state.isLoading || this._localSequenceDeferredRequest === request || this._liveSequenceFrames.complete) return;
    if (this._localSequenceBackoff?.request === request && performance.now() < this._localSequenceBackoff.until) return;
    const key = `${request}:${this._sequenceDemand.windowKey(sequenceId, imageId)}`;
    if (key === this._localSequenceKey) return;
    if (this._localSequenceTask?.request === request && this._localSequenceTask.signal === controller.signal) return;
    const current = () => !controller.signal.aborted && this._selectionRequestId === request && this.state.sequenceId === sequenceId && this.state.jimuMapView?.view === view && !this._liveSequenceFrames.complete;
    const entry = { key, request, signal: controller.signal, promise: Promise.resolve() };
    const timing = this._sequencePerformance?.begin('context-ready');
    this._localSequenceTask = entry;
    entry.promise = (async () => {
      try {
        const known = this._liveSequenceFrames.find(imageId); if (known) this._sequenceDemand.seed(sequenceId, [known]);
        const points = await this._sequenceDemand.window(sequenceId, imageId, controller.signal);
        if (!current() || !points.length) return;
        timing?.finish();
        this._localSequenceBackoff = null;
        this._localSequenceKey = `${request}:${this._sequenceDemand.windowKey(sequenceId, imageId)}`;
        this._liveSequenceFrames.setLocal(sequenceId, points);
        this.setState(() => {
          if (!current()) return null;
          const active = this._liveSequenceFrames.find(this.state.imageId);
          return active ? { sequenceImages: this._liveSequenceFrames.visible(active) } : null;
        }, () => { if (current()) void this.refreshSequenceMarkerWindow(); });
      } catch (error) {
        if (current()) { this._localSequenceBackoff = { request, until: performance.now() + 5000 }; console.warn('[Mapillary sequence] Nearby context unavailable; current image tracking remains active:', error); }
      } finally {
        timing?.cancel();
        if (this._localSequenceTask === entry) {
          this._localSequenceTask = null;
          // Catch up to a newer confirmed frame once, without retry loops on failure.
          if (current() && this.state.imageId !== imageId) void this.refreshLocalSequence();
        }
      }
    })();
    return entry.promise;
  }

  /** The profile is the explicit consumer of complete route metadata. */
  private ensureFullSequenceRoute(): Promise<void> {
    const { sequenceId, jimuMapView } = this.state, selection = this._selectionAbort;
    if (!sequenceId || !jimuMapView || !selection || selection.signal.aborted || this._liveSequenceFrames.complete) return Promise.resolve();
    const request = this._selectionRequestId, active = this._fullRouteTask;
    if (this._fullRouteFailure === `${request}:${sequenceId}`) return Promise.resolve();
    if (active?.sequenceId === sequenceId && active.request === request && !active.controller.signal.aborted) return active.promise;
    active?.controller.abort();
    const controller = new AbortController(), abort = () => controller.abort();
    selection.signal.addEventListener('abort', abort, { once: true });
    const entry = { sequenceId, request, controller, promise: Promise.resolve() };
    this._fullRouteTask = entry;
    this.setState({ sequenceRouteLoading: true, sequenceRouteProgress: undefined });
    entry.promise = this.hydrateLiveSequence(sequenceId, request, controller, jimuMapView.view).finally(() => {
      selection.signal.removeEventListener('abort', abort);
      if (!controller.signal.aborted && this.state.sequenceId === sequenceId && !this._liveSequenceFrames.complete) this._fullRouteFailure = `${request}:${sequenceId}`;
      if (this._fullRouteTask === entry) this._fullRouteTask = null;
    });
    return entry.promise;
  }

  /** Complete route metadata in the background without owning the current viewer frame. */
  private async hydrateLiveSequence(sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {
    const current = () => requestId === this._selectionRequestId && !controller.signal.aborted &&
      this.state.jimuMapView?.view === view && !view.destroyed && this._liveSequenceFrames.sequenceId === sequenceId;
    let lastProgress = -Infinity, previewCount = 0;
    try {
      const route = await this.getSequenceWithCoords(sequenceId, this.accessToken, controller.signal, (points, batch, loaded, total) => {
        if (!current()) return;
        this._liveSequenceFrames.remember(sequenceId, points);
        if (performance.now() - lastProgress >= LIVE_SEQUENCE_LIMITS.progressInterval || loaded === total) {
          lastProgress = performance.now(); this.setState(() => !current() ? null : ({ sequenceRouteProgress: `${this._presentation.number(loaded)}/${this._presentation.number(total)}` }));
        }
        // Bound preview graphics; busy playback/panning takes priority over previews.
        if (this.state.turboModeActive || !this._userPaused || view.stationary === false || points.length < 2 || previewCount >= LIVE_SEQUENCE_LIMITS.previewSegments || !this.ArcGISModules?.Graphic) return;
        ++previewCount;
        const paths = points.map(p => { const display = this.getCoverageDisplayPosition(p.id, p.lon, p.lat); return [display.lon, display.lat]; });
        const graphic = new this.ArcGISModules.Graphic({
          geometry: { type: 'polyline', paths: [paths], spatialReference: { wkid: 4326 } },
          symbol: { type: 'simple-line', color: [0, 0, 255, .65], width: 3 }, attributes: { sequence_preview: true, sequence_batch: batch, sequenceId }
        });
        (graphic as any).__isSequenceOverlay = true; this.ensureActiveSequenceLayer(view).add(graphic);
      });
      if (!current()) return;
      this._liveSequenceFrames.finish(sequenceId, route);
      this.setState(() => !current() ? null : ({ sequenceImages: route, sequenceRouteLoading: false, sequenceRouteProgress: undefined }), () => {
        if (!current()) return;
        this._lastSuccessfulSelection = { sequenceImages: route, imageId: this.state.imageId, sequenceId, selectedSequenceId: sequenceId };
        this.updateProfileIndicator();
      });
      this.saveSequenceCache(sequenceId, route); this._selectionRetry = null;
      await this.renderLiveSequenceLine(route, sequenceId, requestId, controller, view);
    } catch (error) {
      if (!current()) return;
      const retryImageId = this._liveSequenceFrames.current?.id || this.state.imageId;
      if (retryImageId) this._selectionRetry = { sequenceId, imageId: retryImageId };
      this.setState({
        sequenceRouteLoading: false, sequenceRouteProgress: undefined,
        selectionError: this._owned("Image tracking is active, but the sequence route could not load. Retry or choose another point."), selectionCanRetry: true
      });
      console.warn('[Mapillary sequence] Background route unavailable:', error);
    }
  }

  /** Update the active sequence overlay from retained coordinates without taking ownership of the current image. */
  private async renderLiveSequenceLine(route: readonly SequenceCoordinate[], sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {
    const current = () => requestId === this._selectionRequestId && !controller.signal.aborted && this.state.jimuMapView?.view === view && !view.destroyed && this._liveSequenceFrames.sequenceId === sequenceId;
    try {
      // Prepare one route line in short cancellable slices. Never clear the pulse/cone.
      const path: number[][] = [];
      let deadline = performance.now() + 3;
      for (let i = 0; i < route.length; i++) {
        if (!current()) return;
        const point = route[i], display = this.getCoverageDisplayPosition(String(point.id), point.lon, point.lat);
        path.push([display.lon, display.lat]);
        if ((i & 127) === 127 || performance.now() >= deadline) { await yieldSequenceWork(controller.signal); deadline = performance.now() + 3; }
      }
      if (!current() || !this.ArcGISModules?.Graphic) return;
      // The main Turbo map uses Mapillary's native sequence geometry, not an API-route overlay.
      const layer = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);
      if (layer) layer.removeMany(layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));
      if (path.length > 1) {
        const graphic = new this.ArcGISModules.Graphic({
          geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },
          symbol: { type: 'simple-line', color: [0, 0, 255, .8], width: 3 }, attributes: { sequenceId }
        });
        (graphic as any).__isSequenceOverlay = true; layer?.add(graphic);
        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();
      }
      void this.refreshSequenceMarkerWindow();
    } catch (error) { if (current()) console.warn('[Mapillary sequence] Route line unavailable:', error); }
  }

  /** Turbo uses native tile colors at every zoom. Legacy coverage retains its bounded marker window. */
  private async refreshSequenceMarkerWindow() {
    const view = this.state.jimuMapView?.view, sequenceId = this.state.sequenceId;
    if (!view || view.destroyed || !sequenceId || this._liveSequenceFrames.sequenceId !== sequenceId) return;
    if (this.state.turboModeActive) {
      this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = '';
      const overlay = this._activeSequenceOverlay;
      if (overlay?.view === view) overlay.dispose();
      this.updateNativeSequenceSelection();
      return;
    }
    const window = view.zoom >= LIVE_SEQUENCE_LIMITS.markerZoom ? this._liveSequenceFrames.markerWindow(String(this.state.imageId)) : null;
    const key = `${sequenceId}:${window?.key ?? 'line-only'}`;
    if (key === this._sequenceMarkerKey && this._activeSequenceOverlay?.view === view) return;
    // Create/transfer the layer before owning a new marker job: layer cleanup aborts its former job.
    if (window) this.ensureActiveSequenceLayer(view);
    this._sequenceMarkerAbort?.abort(); const controller = new AbortController(); this._sequenceMarkerAbort = controller;
    this._sequenceMarkerKey = key;
    const current = () => !controller.signal.aborted && !this.state.turboModeActive && this.state.jimuMapView?.view === view && this._liveSequenceFrames.sequenceId === sequenceId;
    try {
      const overlay = this._activeSequenceOverlay;
      if (overlay?.view === view && overlay.layer) {
        const points = Array.from(overlay.points.values());
        overlay.layer.removeMany(points); overlay.points.clear();
      }
      if (!window) return;
      let batch: __esri.Graphic[] = [], deadline = performance.now() + 3;
      for (const image of window.points) {
        if (!current()) return;
        const p = this.getCoverageDisplayPosition(String(image.id), image.lon, image.lat);
        this.drawPointWithoutRemoving(p.lon, p.lat, [0, 0, 255, 1], sequenceId, image.id, batch);
        if (batch.length >= 16 || performance.now() >= deadline) {
          if (batch.length) this.ensureActiveSequenceLayer(view).addMany(batch); batch = [];
          await yieldSequenceWork(controller.signal); deadline = performance.now() + 3;
        }
      }
      if (current() && batch.length) this.ensureActiveSequenceLayer(view).addMany(batch);
      if (current()) this.announceNearbyFrames();
    } catch (error) { if (current()) console.warn('[Mapillary sequence] Could not draw nearby route markers:', error); }
  }

  /** Resolve sequence coordinates through the shared request/cache owner; callers retain selection-lifetime guards. */
  private async getSequenceWithCoords(sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {
    this._sequenceRequests ??= new SharedSequenceRequests((id, token, requestSignal, progress) => this.fetchSequenceWithCoords(id, token, requestSignal, progress));
    return this._sequenceRequests.get(sequenceId, accessToken, signal, onProgress);
  }

  private async fetchSequenceWithCoords(sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {
    return fetchSequenceCoordinates({
      cache: this.sequenceCoordsCache,
      fetchJson: (url, token, requestSignal) => this.runSequenceBackground(signal => this.fetchMapillaryJson(url, token, signal), requestSignal),
      getSelectedImageId: () => this.state.imageId,
      getIds: (id, signal) => this._sequenceDemand.ids(id, signal),
      getKnown: id => this._sequenceDemand.find(sequenceId, id),
      isStorageDisabled: () => this._sequenceStorageDisabled,
      disableStorage: () => { this._sequenceStorageDisabled = true; },
    }, sequenceId, accessToken, signal, onProgress);
  }

  /** Minimap-only Turbo previews share work for the same immutable tile snapshot. */
  private async showCachedSequencePreview(sequenceId: string, requestId: number, signal: AbortSignal) {
    const view = this.state.jimuMapView?.view;
    if (!view || signal.aborted || (this.state.turboModeActive &&
      (!this.minimapView || (this.minimapView as any).destroyed || !this.minimapGraphicsLayer))) return;
    const tiles = this._turboTileCache.snapshot().filter(([, buffer]) => buffer.byteLength > 0);
    this._cachedSequencePreview ??= new CachedSequencePreview();
    try {
      await this._cachedSequencePreview.run({ sequenceId, requestId, view, tiles }, signal,
        internal => this.buildCachedSequencePreview(sequenceId, requestId, internal, tiles));
    } catch { /* Optional preview errors never hold the image or route open. */ }
  }

  private async buildCachedSequencePreview(sequenceId: string, requestId: number, signal: AbortSignal, tiles: [string, ArrayBuffer][]) {
    const view = this.state.jimuMapView?.view;
    if (!view) return;
    const current = () => !signal.aborted && requestId === this._selectionRequestId && this.state.jimuMapView?.view === view && this.state.sequenceId === sequenceId && !this._liveSequenceFrames.complete;
    const paths: number[][][] = [];
    let vertices = 0;
    for (const [key, buffer] of tiles) {
      if (!current()) return;
      if (!buffer.byteLength) continue;
      const [z, x, y] = key.split("/").map(Number), n = 2 ** z;
      const membership = await this.getSequenceTileIndex(buffer, signal);
      if (!current()) return;
      const layer = new VectorTile(new Pbf(new Uint8Array(buffer))).layers.sequence;
      if (!layer) continue;
      let checked = 0;
      for (const i of membership.indices('sequence', sequenceId)) {
        if (checked++ % 100 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); if (!current()) return; }
        const feature = layer.feature(i);
        if (String(feature.properties.id) !== String(sequenceId)) continue;
        for (const path of feature.loadGeometry()) {
          const coords = path.map((p: { x: number; y: number }) => [(x + p.x / feature.extent) / n * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + p.y / feature.extent) / n))) * 180 / Math.PI]);
          vertices += coords.length;
          if (vertices > 10000) return; // Skip oversized previews; complete route remains unsampled.
          if (coords.length > 1) paths.push(coords);
        }
      }
    }
    if (!current() || !paths.length) return;
    const layerOwner = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);
    if (layerOwner) layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));
    const previewGraphic = new this.ArcGISModules.Graphic({
      geometry: { type: "polyline", paths, spatialReference: { wkid: 4326 } },
      symbol: { type: "simple-line", color: [0, 0, 255, 0.65], width: 3 },
      attributes: { sequenceId, sequence_preview: true },
    });
    (previewGraphic as any).__isSequenceOverlay = true; layerOwner?.add(previewGraphic);
    this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();
  }

  /**
   * Resolve nearby imagery without waiting for full-sequence enumeration.
   * A complete cached route gives the exact nearest frame. Otherwise inspect up
   * to four local image tiles within an 800 ms budget, accepting only this sequence.
   * No Graph image search or partial sequence cache is created.
   * No match falls back to the line representative; playback never calls this.
   */
  private async nearestCoverageImage(sequenceId: string, clickPoint: { lon: number; lat: number }, signal: AbortSignal): Promise<string | undefined> {
    const check = () => { if (signal.aborted) throw new DOMException("Cancelled", "AbortError"); };
    check();
    let nearest: string | undefined;
    let best = Infinity;
    const consider = (id: unknown, lon: number, lat: number) => {
      if (id == null || !Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) return;
      const distance = distanceMeters(clickPoint.lat, clickPoint.lon, lat, lon);
      if (distance < best) { best = distance; nearest = String(id); }
    };
    const cached = this.sequenceCoordsCache[sequenceId];
    const filters = this.getTurboFilters();
    // Route caches omit ownership metadata, so filtered selection uses local image tiles.
    if (cached?.length && filters.organizationId === undefined) {
      for (let i = 0; i < cached.length; i++) {
        if (i > 0 && i % 4096 === 0) await new Promise(resolve => setTimeout(resolve, 0));
        check();
        consider(cached[i].id, cached[i].lon, cached[i].lat);
      }
      return nearest;
    }
    return findNearbySequenceFrame(sequenceId, clickPoint, signal, {
      boxes: turboFootprintBboxes,
      tiles: turboTiles,
      distance: distanceMeters,
      matches: properties => turboPointMatches(properties, filters),
      load: async (tile, requestSignal) => {
        const index = this._turboIndexCache.get(tile.join("/"));
        const buffer = index?.buffer || await this.getTurboTileBuffer(tile, requestSignal);
        if (requestSignal.aborted) throw new DOMException("Cancelled", "AbortError");
        if (!buffer.byteLength) return null;
        const layer = new VectorTile(new Pbf(new Uint8Array(buffer))).layers.image;
        return layer ? { layer, index } : null;
      },
    });
  }

  /** Reuse nearby-frame work across hover and click without loading full routes. */
  private ensureCoverageFrameLookup(): CoverageFrameLookup {
    return this._coverageFrameLookup ??= new CoverageFrameLookup((sequence, location, signal) => this.nearestCoverageImage(sequence, location, signal));
  }

  /** Speculate after a short dwell, independently of the tooltip. Leaving the
   * pointer target releases hover ownership while an accepted click stays alive.
   */
  private prepareCoverageFrameHover(graphic: __esri.Graphic) {
    const view = this.state.jimuMapView?.view, attrs = graphic.attributes;
    if (!view || view.zoom < 6 || view.zoom >= 14 || !attrs?.turbo_representative || !attrs.sequence_id) return;
    const geometry = graphic.geometry as __esri.Point;
    const geographic = geometry?.spatialReference?.isWGS84 || geometry?.spatialReference?.wkid === 4326
      ? geometry : webMercatorUtils.webMercatorToGeographic(geometry) as __esri.Point;
    if (!Number.isFinite(geographic?.longitude) || !Number.isFinite(geographic?.latitude)) return;
    const sequenceId = String(attrs.sequence_id), location = { lon: geographic.longitude, lat: geographic.latitude };
    const key = coverageFrameKey(sequenceId, location);
    if (this._coverageFrameHoverTarget?.key === key) return;
    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);
    this._coverageFrameLookup?.clearHover();
    const target = { key, sequenceId, location }; this._coverageFrameHoverTarget = target;
    this._coverageFrameHoverTimer = setTimeout(() => {
      this._coverageFrameHoverTimer = null;
      if (this._coverageFrameHoverTarget !== target || this.state.jimuMapView?.view !== view || !this.state.turboModeActive || view.stationary === false) return;
      void this.ensureCoverageFrameLookup().warm(view, sequenceId, location).catch(() => { /* Click may retry speculative failures. */ });
    }, 150);
  }

  /** Cancel nearest-frame discovery before viewer navigation; preserve the last successful selection. */
  private cancelNearestFrameSelection = () => {
    if (this.state.coverageFrameResolving) {
      this._turboClickPickAbort?.abort();
      this.setState({ coverageFrameResolving: false });
      return;
    }
    ++this._selectionRequestId;
    this._liveSequenceFrames.cancelPending(); this._liveFrameDetails.clear();
    this._selectionAbort?.abort(); this._selectionAbort = null;
    this._imageryOpeningRequest = null;
    this._places?.controller.sync();
    this._backgroundRequests?.setPaused(false);
    this._selectionRetry = null;
    this.clearGreenPulse(); this.clearConeGraphics();
    const previous = this._lastSuccessfulSelection;
    this.setState({ ...(previous || { imageId: null, sequenceId: null, selectedSequenceId: null, sequenceImages: [] }), isLoading: false, sequenceRouteLoading: false, sequenceRouteProgress: undefined }, () => {
      const image = previous?.sequenceImages.find(p => String(p.id) === String(previous.imageId));
      if (image) this.drawPulsingPoint(image.lon, image.lat, [0, 255, 0, 1], image.id);
    });
  };

  /** Retry the saved selection target using the normal selection pipeline and its current ownership checks. */
  private async retrySelectedImage() {
    const target = this._selectionRetry;
    if (target) await this.loadSequenceById(target.sequenceId, target.imageId, target.clickPoint, !!target.nearestToClick, !!target.nearestToClick);
  }

  /**
   * Removes all sequence overlay and cone graphics from the map,
   * and clears the active pulsing point.
   */
  private clearSequenceGraphics(preserveSelection = false) {
    this.clearActiveSequenceLayer();
    const { jimuMapView } = this.state;
    if (!jimuMapView) return;

    const { view } = jimuMapView;

    const toRemove: __esri.Graphic[] = [];
    view.graphics.forEach((g) => {
      // Updated to remove blue dots (__isActiveSequencePoint) as well
      if ((g as any).__isSequenceOverlay || (g as any).__isCone || (g as any).__isActiveSequencePoint) {
        toRemove.push(g);
      }
    });
    toRemove.forEach((g) => view.graphics.remove(g));

    // Selection loading can replace route graphics without interrupting its marker.
    if (!preserveSelection) this.clearGreenPulse();
    this.clearConeGraphics();
  }

  /**
   * Removes cone graphics and point markers for the given sequence ID
   * (keeps polylines/text). Retiring an old route can preserve the current image marker/cone.
   */
  private clearActiveSequenceGraphics(sequenceId: string, preserveActiveImage = false) {
    this.clearActiveSequenceLayer();
    const { jimuMapView, availableSequences } = this.state;
    if (!jimuMapView) return;
    const { view } = jimuMapView;

    // Remove cones & blue active sequence markers
    const toRemove: __esri.Graphic[] = [];
    view.graphics.forEach((g) => {
      if ((g as any).__isCone && !preserveActiveImage) {
        toRemove.push(g);
      }
      if ((g as any).__isSequenceOverlay && g.attributes?.sequenceId === sequenceId) {
        if (g.geometry.type !== "polyline" && g.symbol?.type !== "text") {
          toRemove.push(g);
        }
      }
    });
    toRemove.forEach((g) => view.graphics.remove(g));

    if (this.clickedLocationGraphic) {
      this.state.jimuMapView?.view?.graphics?.remove(this.clickedLocationGraphic);
      this.clickedLocationGraphic = null;
    }

    // Restore original colored markers for that sequence
    const seq = availableSequences?.find((s) => s.sequenceId === sequenceId);
    if (seq) {
      const color = seq._color || this.pickSequenceColor(availableSequences.indexOf(seq));
      seq.images.forEach((img) => {
        const pointGraphic = new this.ArcGISModules.Graphic({
          geometry: {
            type: "point",
            longitude: img.lon,
            latitude: img.lat,
            spatialReference: { wkid: 4326 },
          },
          symbol: {
            type: "simple-marker",
            color: color,
            size: "10px",
            outline: { color: "white", width: 1 },
          },
          attributes: { sequenceId: seq.sequenceId },
        });
        (pointGraphic as any).__isSequenceOverlay = true;
        this._ownedMapResources.addGraphic(view, pointGraphic);
      });
    }

    if (!preserveActiveImage) {
      this.clearGreenPulse();
      this.clearConeGraphics();
    }
  }

  /**
   * Clears all sequence graphics and resets related state values.
   */
  private clearSequenceUI() {
    this.clearSequenceGraphics();
    this.setState({
      availableSequences: [],
      selectedSequenceId: null,
      clickLon: null,
      clickLat: null,
    });
  }
  /**
   * Clears the locally saved Mapillary sequence cache and resets the widget UI
   * so there is no active sequence or markers remaining.
   * Triggered by the "Clear Sequence Cache" button in the legend UI.
   * - Removes cache from localStorage
   * - Stops & removes the pulsing green active image marker
   * - Removes clicked location red marker
   * - Clears only widget-owned map graphics
   * - Resets relevant widget state
   */
  private clearSequenceCache = () => {
    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();
    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);
    this._coverageFrameHoverTimer = null; this._coverageFrameHoverTarget = null;
    this.setState({ coverageFrameResolving: false });
    ++this._selectionRequestId;
    this._selectionAbort?.abort(); this._selectionAbort = null;
    this._imageryOpeningRequest = null;
    this._places?.controller.sync();
    this._reverseAddressEnrichment.clear();
    this._detectionAbort?.abort(); this._detectionAbort = null;
    this._backgroundRequests?.clear(); this._backgroundRequests?.setPaused(false);
    this._sequenceDemand.clear(); this._userPaused = true;
    this._sequencePerformance?.playbackFrame(false);
    this._sequenceRequests?.dispose(); this.sequenceCoordsCache = {}; this._selectionRetry = null;
    this._liveSequenceFrames.clear(); this._liveFrameDetails.clear(); this.clearActiveSequenceLayer();
    this._timeTravelAvailability?.clear(); this._cachedSequencePreview?.clear();
    void sequenceCacheStore.clear();
    try {
      localStorage.removeItem(CACHE_KEYS.SEQUENCE);
      // Loop through all localStorage keys and remove coordinate caches
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_KEYS.GEO_PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      this.log("All Mapillary sequence caches cleared from localStorage");

      // Stop and remove green pulsing marker
      this.clearGreenPulse();
      this.clearConeGraphics();
      this.clearDirectionHighlight();
      this.clearClickRipples();
      this.clearTurboHover();

      // Remove red clicked location marker
      if (this.clickedLocationGraphic && this.state.jimuMapView) {
        this.state.jimuMapView.view.graphics.remove(this.clickedLocationGraphic);
        this.clickedLocationGraphic = null;
      }

      // Clear only graphics created by this widget instance.
      this._ownedMapResources.clearGraphics(this.state.jimuMapView?.view);

      // Destroy the Mapillary viewer completely
      if (this.mapillaryViewer) {
        this._playbackBindings?.clear();
        try {
          this._lasso?.cancelGesture();
          this._measurement?.detachViewer();
          this.mapillaryViewer.remove();
        } catch (err) {
          console.warn("Failed to remove Mapillary viewer", err);
        }
        this.mapillaryViewer = null;
      }

      // Reset widget state so UI fully refreshes
      this.setState({
        availableSequences: [],
        selectedSequenceId: null,
        sequenceId: null,
        sequenceImages: [],
        imageId: null,
        clickLon: null,
        clickLat: null,
        address: null,
        isLoading: false,
        sequenceRouteLoading: false, sequenceRouteProgress: undefined, selectionError: undefined, selectionCanRetry: false,
      });
    } catch (err) {
      console.warn("Failed to clear sequence cache", err);
    }
  };

  // Local caching of last sequence
  // Stores minimal sequence info (IDs + coords) in localStorage
  // to reload previous sequence instantly on widget startup.
  /** Persist a bounded sequence snapshot for later restoration; storage failure leaves the live session usable. */
  private saveSequenceCache(sequenceId: string, sequenceImages: { id: string; lat: number; lon: number }[]) {
    if (this._sequenceStorageDisabled) return;
    try {
      const active = Math.max(0, sequenceImages.findIndex(image => String(image.id) === String(this.state.imageId)));
      const start = Math.max(0, Math.min(active - 32, sequenceImages.length - 128));
      const preview = sequenceImages.slice(start, start + 128);
      const payload = JSON.stringify({ sequenceId, sequenceImages: preview.map(({ id, lat, lon }) => ({ id, lat, lon })) });
      // localStorage uses UTF-16. Keep this optional startup hint below 256 KiB.
      if (payload.length * 2 > 256 * 1024) { localStorage.removeItem(CACHE_KEYS.SEQUENCE); return; }
      localStorage.setItem(CACHE_KEYS.SEQUENCE, payload);
    } catch {
      this._sequenceStorageDisabled = true;
      // RAM/network loading remains available; never clear another widget's storage.
      try { localStorage.removeItem(CACHE_KEYS.SEQUENCE); } catch { /* Storage may be blocked. */ }
    }
  }

  // Restores minimal sequence info (IDs + coords) in localStorage
  /** Restore cached coordinate hints without activating a sequence; actual image selection remains user-driven. */
  private restoreSequenceCache() {
    try {
      const cache = localStorage.getItem(CACHE_KEYS.SEQUENCE);
      if (cache) {
        const parsed = JSON.parse(cache);
        if (parsed.sequenceId && Array.isArray(parsed.sequenceImages)) {
          // Only restore sequence images so blue dots appear
          this.setState({
            sequenceId: null, // keep it hidden until user clicks
            sequenceImages: parsed.sequenceImages,
          });
          this.log("Sequence images restored from localStorage");
        }
      } else {
        this.setState({
          sequenceId: null,
          sequenceImages: [],
        });
      }
    } catch (err) {
      console.warn("Failed to restore cache", err);
      this.setState({
        sequenceId: null,
        sequenceImages: [],
      });
    }
  }
  // #endregion SEQUENCE MANAGEMENT

  /**
   * Cancel feature work and release viewer/map presentation for minimize, close or teardown.
   * @param resetState Reset selection and coverage controls after cleanup.
   * @param fullRemove Also retire view handlers, owned layers and full-removal resources; false preserves the reusable view setup.
   * Shared-view cleanup targets registered widget resources rather than unrelated map content.
   */
  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {
    cleanupWidgetEnvironment(resetState, fullRemove, this.widgetTeardownHost());
  }

  /** Bind concrete resource operations and live slots; ordered cleanup policy stays in the lifecycle feature. */
  private widgetTeardownHost(): WidgetTeardownHost<__esri.MapView | __esri.SceneView, Viewer> {
    const widget = this;
    return {
      get backgroundRequests() { return widget._backgroundRequests; },
      get cachedSequencePreview() { return widget._cachedSequencePreview; },
      get cameraCone() { return widget._cameraCone; },
      get coverageSelectionTargets() { return widget._coverageSelectionTargets; },
      get currentImagePresentation() { return widget._currentImagePresentation; },
      get directionBindings() { return widget._directionBindings; },
      get hoverPreviewStatus() { return widget._hoverPreviewStatus; },
      get hoverTimingAbort() { return widget._hoverTimingAbort; },
      get imageryOpeningRequest() { return widget._imageryOpeningRequest; }, set imageryOpeningRequest(value) { widget._imageryOpeningRequest = value; },
      get lasso() { return widget._lasso; },
      get liveFrameDetails() { return widget._liveFrameDetails; },
      get liveSequenceFrames() { return widget._liveSequenceFrames; },
      get mapFeatureExportAbort() { return widget._mapFeatureExportAbort; },
      get mapSpriteLoading() { return widget._mapSpriteLoading; },
      get measurement() { return widget._measurement; },
      get nativeCurrentImageMarker() { return widget._nativeCurrentImageMarker; },
      get nativeSequenceSelection() { return widget._nativeSequenceSelection; },
      get nearbyDiscovery() { return widget._nearbyDiscovery; },
      get pendingCoverageHover() { return widget._pendingCoverageHover; },
      get places() { return widget._places; },
      get playbackBindings() { return widget._playbackBindings; },
      get pointCloudAcquisition() { return widget._pointCloudAcquisition; },
      get pointCloudCache() { return widget._pointCloudCache; },
      get reverseAddressEnrichment() { return widget._reverseAddressEnrichment; },
      get rings() { return widget._rings; },
      get screenDirectionCone() { return widget._screenDirectionCone; },
      get sequenceDemand() { return widget._sequenceDemand; },
      get sequencePerformance() { return widget._sequencePerformance; },
      get sequenceTileIndex() { return widget._sequenceTileIndex; },
      get sequenceVisibilityChange() { return widget._sequenceVisibilityChange; },
      get sharedTileRequests() { return widget._sharedTileRequests; },
      get sight() { return widget._sight; },
      get stopRoutePreview() { return widget._stopRoutePreview; },
      get timeTravelAvailability() { return widget._timeTravelAvailability; },
      get turboViewBindings() { return widget._turboViewBindings; },
      get viewZoomBindings() { return widget._viewZoomBindings; },
      get zoomWarningTimer() { return widget._zoomWarningTimer; },
      cancelCaptureRouteGeneration: (...args) => this.cancelCaptureRouteGeneration(...args),
      cancelCoverageAnalysis: (...args) => this.cancelCoverageAnalysis(...args),
      cleanupEnvironment: (...args) => this.cleanupWidgetEnvironment(...args),
      clearActiveSequenceLayer: (...args) => this.clearActiveSequenceLayer(...args),
      clearClickRipples: (...args) => this.clearClickRipples(...args),
      clearDetectionOverlays: (...args) => this.clearDetectionOverlays(...args),
      clearDirectionHighlight: (...args) => this.clearDirectionHighlight(...args),
      clearElevationProfile: (...args) => this.clearElevationProfile(...args),
      clearFieldNotesGroup: (...args) => this.clearFieldNotesGroup(...args),
      clearGreenPulse: (...args) => this.clearGreenPulse(...args),
      clearMapLegendLayer: (...args) => this.clearMapLegendLayer(...args),
      clearPointCloud: (...args) => this.clearPointCloud(...args),
      clearSelectedMapFeature: (...args) => this.clearSelectedMapFeature?.(...args),
      clearSequenceDiagnostics: (...args) => this.clearSequenceDiagnostics(...args),
      clearSolarGraphics: (...args) => this.clearSolarGraphics(...args),
      clearTurboHover: (...args) => this.clearTurboHover(...args),
      clearViewshed: (...args) => this.clearViewshed(...args),
      disableTurboCoverageLayer: (...args) => this.disableTurboCoverageLayer(...args),
      finishTurboLoading: (...args) => this.finishTurboLoading(...args),
      get handleFullscreenChange() { return widget.handleFullscreenChange; },
      get handleNudgeKeyDown() { return widget.handleNudgeKeyDown; },
      get handleNudgeKeyUp() { return widget.handleNudgeKeyUp; },
      get handleWindowResize() { return widget.handleWindowResize; },
      highlightNearbyPin: (...args) => this.highlightNearbyPin(...args),
      get mapClickHandle() { return widget.mapClickHandle; }, set mapClickHandle(value) { widget.mapClickHandle = value; },
      get viewer() { return widget.mapillaryViewer; }, set viewer(value) { widget.mapillaryViewer = value; },
      get objectsStationaryHandle() { return widget.objectsStationaryHandle; }, set objectsStationaryHandle(value) { widget.objectsStationaryHandle = value; },
      get objectsZoomHandle() { return widget.objectsZoomHandle; }, set objectsZoomHandle(value) { widget.objectsZoomHandle = value; },
      get pointerMoveHandle() { return widget.pointerMoveHandle; }, set pointerMoveHandle(value) { widget.pointerMoveHandle = value; },
      get resizeObserver() { return widget.resizeObserver; }, set resizeObserver(value) { widget.resizeObserver = value; },
      stopCoverageRendering: (...args) => this.stopCoverageRendering(...args),
      stopSafePlayback: (...args) => this.stopSafePlayback(...args),
      get tooltipDiv() { return widget.tooltipDiv; }, set tooltipDiv(value) { widget.tooltipDiv = value; },
      get trafficSignsStationaryHandle() { return widget.trafficSignsStationaryHandle; }, set trafficSignsStationaryHandle(value) { widget.trafficSignsStationaryHandle = value; },
      get trafficSignsZoomHandle() { return widget.trafficSignsZoomHandle; }, set trafficSignsZoomHandle(value) { widget.trafficSignsZoomHandle = value; },
      resetSharedStartup: () => { this._sharedStartupImageId = null; this._sharedStartupBearing = null; this._isFlyInActive = false; },
      retirePlaces: () => { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; },
      cancelImageryReadiness: () => {
        this._currentImageBearing?.invalidate();
        this._hoverTimingAbort?.abort();
        this._hoverSequenceTiming?.cancel();
        this._imageSequenceTiming?.cancel();
        this._imageSequenceTiming = undefined;
        this._hoverTimingTarget = null;
      },
      cancelCoveragePicks: () => {
        this._turboClickPickAbort?.abort();
        this._coverageFrameLookup?.clear();
        if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);
        this._coverageFrameHoverTimer = null;
        this._coverageFrameHoverTarget = null;
        this.setState({ coverageFrameResolving: false });
      },
      retireViewRequests: () => { this._activeViewTransfer.invalidate(); this._isFlyInActive = false; this._sequenceRequests?.dispose(); this.clearSharedNotesView(); this.clearFieldNotesGroup(); },
      clearRoutingLogin: () => { if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry); this._routingLoginExpiry = null; this._routingLoginView = null; },
      invalidateSelection: () => { this._selectionRequestId++; this._selectionAbort?.abort(); this._selectionAbort = null; this._lastSuccessfulSelection = null; this._selectionRetry = null; },
      closeOwnedObjectPopup: () => { if (this._objectPopupView?.popup?.content === this._objectPopupContent) this._objectPopupView.closePopup(); this._objectPopupContent = null; this._objectPopupView = null; },
      cancelDetectionWork: () => {
        this._alternateNavigationAbort?.abort();
        this._objectDetailsAbort?.abort();
        ++this._objectDetailsRequest;
        ++this._alternateNavigationRequest;
        this._objectDetailsCache.clear();
        this._mapFeatureClickAbort?.abort();
        this._mapFeatureTiles.clear();
        this._mapFeatureIndexes.clear();
        this._selectedMapFeature = null;
      },
      cancelConeRedraw: () => { if (this._coneRedrawRaf != null) { cancelAnimationFrame(this._coneRedrawRaf); this._coneRedrawRaf = null; } },
      retireMapPicking: () => {
        ++this._mapClickRevision;
        this._turboMapLeaveCleanup?.();
        this._turboMapLeaveCleanup = null;
      },
      cancelDetectionFetches: () => { this._cancelObjectsFetch = true; this._cancelTrafficSignsFetch = true; },
      dropLayerBindings: () => {
        this.mapillaryVTLayer = null;
        this._detectionLayers.reset('signs');
        this.mapillaryTrafficSignsFeatureLayer = null;
        this._detectionLayers.reset('objects');
        this.mapillaryObjectsFeatureLayer = null;
        this.turboCoverageLayer = null;
        this.turboCoverageLayerView = null;
      },
      retirePlacesTiles: () => { ++this._placesTilesStartRevision; this._placesConfiguredRequest = null; this._placesConfiguredUrl = null; this._placesVectorLayer?.stop(); this._placesVectorLayer = null; },
      retirePlaceNotes: () => {
        this._placeNoteDisposed = true;
        this._placeNoteReview?.cancel();
        const pendingPlaceCrop = this.state.pendingFieldNote?.placeId && this.state.pendingFieldNote.attachmentId;
        if (pendingPlaceCrop) void deleteDetectionCrop(pendingPlaceCrop).catch(() => { });
        if (this._placeWorkspaceCrop) { void deleteDetectionCrop(this._placeWorkspaceCrop).catch(() => { });
        this._placeWorkspaceCrop = null;
        }
      },
      retireHoverBindings: () => {
        this._coverageHoverResume?.dispose();
        this._coverageHoverResume = null;
        this._coverageHoverHandler = null;
        this._presentationHandle?.remove();
        this._presentationHandle = null;
        this._placesImageryCache?.clear();
        this._placesImageryCache = null;
      },
      disposeUnmountPlaces: () => { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; },
      clearNearbyHintTimer: () => { if (this._nearbyFramesHintTimer !== null) clearTimeout(this._nearbyFramesHintTimer); this._nearbyFramesHintTimer = null; },
      disposeTerrain: () => { this._sceneTerrain?.dispose(); this._sceneTerrain = null; },
      retireOrganizationLookup: () => {
        this._organizationNameDisposed = true;
        ++this._organizationNameRevision;
        if (this._organizationNameTimer !== null) clearTimeout(this._organizationNameTimer);
        this._organizationNameTimer = null;
        this._organizationNames?.dispose();
        this._organizationNames = null;
      },
      disposeAlignmentDiagnostic: () => { this._coverageAlignmentDiagnostic?.dispose(); this._coverageAlignmentDiagnostic = null; },
      markSharedNotesDisposed: () => { this._sharedNotesDisposed = true; },
      get view() { return widget.state.jimuMapView?.view; },
      container: () => this.viewerContainer.current,
      clearOwnedGraphics: view => this._ownedMapResources.clearGraphics(view),
      removeOwnedLayers: view => this._ownedMapResources.removeLayers(view.map),
      clearHoverCard: () => clearImageryHoverCardCache(this.tooltipDiv),
      resetSelection: patch => this.setState(patch),
      resetDetectionState: () => this.setState({ trafficSignsActive: false, objectsActive: false, tilesActive: false }),
      setTurboInactive: () => this.setState({ turboModeActive: false }),
    };
  }

  /**
   * Restores map graphics (clicked location, sequence lines, cone, etc.)
   * when the map view switches between 2D and 3D, as graphics are tied to the view instance.
   */
  private restoreMapGraphics = () => {
    const { jimuMapView, clickLon, clickLat, availableSequences, selectedSequenceId, sequenceImages, imageId, turboModeActive, routeStartPoint, routeEndPoint } = this.state;
    if (!jimuMapView || !this.ArcGISModules) return;

    const view = jimuMapView.view;

    // 1. Restore Clicked Location (Black/Red Dot)
    if (clickLon != null && clickLat != null) {
      this.drawPoint(clickLon, clickLat);
    }

    // Legacy nearby-sequence revolver overlays are deprecated.

    // 3. Restore the route independently, with the same bounded marker window.
    if (selectedSequenceId && sequenceImages.length) {
      this._liveSequenceFrames.begin(selectedSequenceId, sequenceImages);
      const requestId = this._selectionRequestId;
      this._selectionAbort?.abort(); const controller = new AbortController(); this._selectionAbort = controller;
      const complete = this.sequenceCoordsCache[selectedSequenceId];
      if (complete) { this._liveSequenceFrames.finish(selectedSequenceId, complete); void this.renderLiveSequenceLine(complete, selectedSequenceId, requestId, controller, view); }
      else { this.setState({ sequenceRouteLoading: false, sequenceRouteProgress: undefined }); void this.prepareDemandSequence(selectedSequenceId, requestId, controller, view); }
    }

    // 4. Restore Active Image (Green Pulse) and Camera Cone
    if (imageId && sequenceImages && sequenceImages.length > 0) {
      const activeImg = sequenceImages.find((s) => s.id === imageId);
      if (activeImg) {
        // Clear old references to prevent memory leaks from old intervals
        this.clearGreenPulse();
        this.clearConeGraphics();

        this.currentGreenGraphic = this.drawPulsingPoint(activeImg.lon, activeImg.lat, [0, 255, 0, 1], activeImg.id);

        const length = this.coneLengths[this.zoomStepIndex];
        const spread = this.coneSpreads[this.zoomStepIndex];

        this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);
      }
    }

    if (this.state.isSolarMode) {
      this.updateSolarGraphics();
    }

    /*
     * RESTORE CAPTURE ROUTE INPUT POINTS
     * Coverage analysis/result itself is intentionally NOT restored.
     * Only the user's A/B selections survive the map-mode switch.
     */
    if (routeStartPoint) {
      this.drawRoutePointMarker("start", routeStartPoint[0], routeStartPoint[1]);
    }

    if (routeEndPoint) {
      this.drawRoutePointMarker("end", routeEndPoint[0], routeEndPoint[1]);
    }

    this.drawFieldNoteGraphics();
  };

  // #region MINIMAP
  // Creates, updates and destroys the fullscreen minimap view.

  /**
   * Construct the fullscreen ArcGIS minimap from the current view and native layers.
   * After asynchronous initialization, verify the container/view still owns the minimap before retaining it.
   */
  private async createMinimap() {
    if (!this.state.isFullscreen || !this.minimapContainer.current || !this.state.jimuMapView || !this.ArcGISModules) return;

    this.destroyMinimap();
    const revision = this._minimapRevision;
    const container = this.minimapContainer.current;
    const owner = this.state.jimuMapView;
    const current = () => revision === this._minimapRevision && this.state.isFullscreen &&
      this.minimapContainer.current === container && this.state.jimuMapView === owner;

    try {
      // 1. Load 'esri/Basemap' in addition to others
      const [MapView, Map, GraphicsLayer, Basemap] = await loadArcGISJSAPIModules(["esri/views/MapView", "esri/Map", "esri/layers/GraphicsLayer", "esri/Basemap"]);
      if (!current()) return;

      const { VectorTileLayer } = this.ArcGISModules;

      this.minimapGraphicsLayer = new GraphicsLayer({
        id: LAYER_IDS.MINIMAP_TRACKING, title: "Mapillary Minimap",
      });

      const basemapConfig = resolveMinimapBasemap(
        () => this.state.jimuMapView.view.map.basemap,
        json => Basemap.fromJSON(json),
        (...args) => console.warn(...args),
      );

      // Create minimap map instance
      const minimap = new Map({
        basemap: basemapConfig,
        layers: [this.minimapGraphicsLayer],
      });

      this.minimapView = new MapView(buildMinimapViewOptions({
        state: () => this.state,
        container: () => this.minimapContainer.current,
        map: minimap, zoomOffset: ZOOM.MINIMAP_OFFSET,
      }));

      const view = this.minimapView;
      await view.when();
      if (!current() || this.minimapView !== view || view.destroyed) return;
      this._minimapReady = true;

      const layersToAdd = buildMinimapLayers<__esri.Layer>({
        mainLayers: this.state.jimuMapView.view.map.layers,
        coverage: () => this.mapillaryVTLayer,
        trafficSigns: () => this.mapillaryTrafficSignsLayer,
        objects: () => this.mapillaryObjectsLayer,
        accessToken: () => this.accessToken,
        VectorTileLayer,
        warn: (...args) => console.warn(...args),
      });

      minimap.addMany(layersToAdd);

      // Re-add graphics layer on top so cone, green dot and hover markers
      // always render above turbo coverage points and VT layers
      minimap.remove(this.minimapGraphicsLayer);
      minimap.add(this.minimapGraphicsLayer);

      this.updateMinimapTracking();
      if (this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)
        void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);

      this.minimapView.on("click", createMinimapClickHandler({
        state: () => this.state,
        accessToken: () => this.accessToken,
        discover: (lon, lat, token) => this.getSequencesInBBox(lon, lat, token),
        loadSequence: (...args) => this.loadSequenceById(...args),
        showNoImage: () => this.showNoImageMessage(),
        update: patch => this.setState(patch),
        error: (...args) => console.error(...args),
      }));

      this.setState({ minimapView: this.minimapView });
    } catch (err) {
      if (!current()) return;
      console.error("Error creating minimap:", err);
      this.destroyMinimap();
    }
  }


  /** Release the minimap view, its tracking handles and references before fullscreen exit or recreation. */
  private destroyMinimap() {
    ++this._minimapRevision;
    this._minimapReady = false;
    this._minimapTrackingOwner = null; this._minimapFrameDot = null; this._minimapFrameCone = null;
    this._minimapSequenceLine = null; this._minimapSequenceGeometry = null; this._minimapFrameId = null;
    this.log("Destroying minimap...");

    // Remove watch handle first
    if (this.minimapWatchHandle) {
      try {
        this.minimapWatchHandle.remove();
      } catch (err) { }
      this.minimapWatchHandle = null;
    }

    // Clear graphics layer contents but don't destroy yet,
    // destroying before the view is gone causes ArcGIS to access
    // deallocated animation state and throw "Cannot read properties of undefined (reading 'animation')"
    if (this.minimapGraphicsLayer) {
      try {
        this.minimapGraphicsLayer.removeAll();
      } catch (err) { }
    }

    // Destroy the view first (nulls this.minimapView immediately so updateMinimapTracking
    // won't fire goTo on a half-destroyed view during async Mapillary image events)
    if (this.minimapView) {
      const viewToDestroy = this.minimapView;
      this.minimapView = null; // null BEFORE destroy so any in-flight callbacks bail out

      try {
        (viewToDestroy as any).container = null;
      } catch (err) { }

      try {
        viewToDestroy.destroy();
      } catch (err) {
        console.warn("Error destroying minimap view:", err);
      }
    }

    // Now safe to destroy graphics layer
    if (this.minimapGraphicsLayer) {
      try {
        this.minimapGraphicsLayer.destroy();
      } catch (err) { }
      this.minimapGraphicsLayer = null;
    }

    // Clear the container HTML
    if (this.minimapContainer.current) {
      this.minimapContainer.current.innerHTML = "";
    }

    this.setState({ minimapView: null });
    this.log("Minimap destroyed");
  }


  /** Synchronize the minimap marker, route and camera with the current image while reusing existing graphics where possible. */
  private updateMinimapTracking() {
    const layer = this.minimapGraphicsLayer, view = this.minimapView;
    if (!this._minimapReady || !layer || !view || !view.ready || view.destroyed || !this.ArcGISModules || !this.state.imageId) return;
    const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || this.state.sequenceImages.find(p => String(p.id) === String(this.state.imageId));
    if (!image) return;
    if (this._minimapTrackingOwner !== layer) {
      this._minimapTrackingOwner = layer; this._minimapFrameDot = null; this._minimapFrameCone = null;
      this._minimapSequenceLine = null; this._minimapSequenceGeometry = null; this._minimapFrameId = null;
    }
    const { Graphic } = this.ArcGISModules;
    const point = { type: 'point', longitude: image.lon, latitude: image.lat, spatialReference: { wkid: 4326 } };
    if (!this._minimapFrameDot) {
      this._minimapFrameDot = new Graphic({ geometry: point, symbol: { type: 'simple-marker', color: '#00ff00', size: 10, outline: { color: 'white', width: 2 } } });
      layer.add(this._minimapFrameDot!);
    } else if (this._minimapFrameId !== String(image.id)) this._minimapFrameDot.geometry = point as any;
    const cone = createConeGeometry(image.lon, image.lat, this._lastBearing || 0, 30, 60);
    if (!this._minimapFrameCone) {
      this._minimapFrameCone = new Graphic({ geometry: cone, symbol: { type: 'simple-fill', color: [255, 165, 0, .6], outline: { color: [255, 165, 0, 1], width: 1 } } });
      layer.add(this._minimapFrameCone!);
    } else this._minimapFrameCone.geometry = cone;
    const route = this._liveSequenceLine?.sequenceId === this.state.sequenceId ? this._liveSequenceLine.geometry : null;
    if (route !== this._minimapSequenceGeometry) {
      if (this._minimapSequenceLine) layer.remove(this._minimapSequenceLine);
      this._minimapSequenceGeometry = route; this._minimapSequenceLine = null;
      if (route) {
        this._minimapSequenceLine = new Graphic({ geometry: route, symbol: { type: 'simple-line', color: [0, 0, 255, .8], width: 2 } });
        layer.add(this._minimapSequenceLine!); layer.graphics.reorder(this._minimapSequenceLine!, 0);
      }
    }
    if (this._minimapFrameId !== String(image.id)) {
      this._minimapFrameId = String(image.id);
      void view.goTo({ center: [image.lon, image.lat], zoom: Math.max(14, Math.min(18, view.zoom || 15)) }, { animate: false }).catch(error => {
        if (!(view as any).destroyed && this.minimapView === view && (error as any)?.name !== 'AbortError') console.warn('[Mapillary minimap] Tracking unavailable:', error);
      });
    }
  }
  // #endregion MINIMAP

  // #region FULLSCREEN & RESIZE
  private toggleFullscreen = () => {
    const widget = this;
    return transitionFullscreen({
      get fullscreen() { return widget.state.isFullscreen; },
      get imageId() { return widget.state.imageId; },
      imageLocation: imageId => {
        const image = this.state.sequenceImages.find(frame => frame.id === imageId);
        return image && { lon: image.lon, lat: image.lat };
      },
      get container() { return widget.viewerContainer.current; },
      get minimapOpen() { return !!widget.minimapView; },
      get mapView() { return widget.state.jimuMapView?.view; },
      get bearing() { return widget._lastBearing; },
      set bearing(value) { widget._lastBearing = value; },
      get viewer() { return widget.mapillaryViewer; },
      set viewer(value) { widget.mapillaryViewer = value; },
      prepareEntry: () => {
        this._pointCloudAcquisition.cancel('fullscreen');
        this.setState({ pointCloudLoading: false, minimapExpanded: false });
      },
      clearMapFeedback: () => {
        this.clearGreenPulse();
        this.clearConeGraphics();
      },
      destroyMinimap: () => this.destroyMinimap(),
      detachViewerTools: () => {
        this._playbackBindings?.clear();
        this._lasso?.cancelGesture();
        this._measurement?.detachViewer();
      },
      commitLayout: (isFullscreen, restore) => this.setState({ isFullscreen }, restore),
      createViewer: (container, imageId) => {
        this._isInitialImageLoad = true;
        this._viewerImageTiling = this.props.config.imageTiling === true;
        this.mapillaryViewer = new Viewer({
          imageTiling: this._viewerImageTiling,
          container,
          accessToken: this.accessToken,
          imageId,
          renderMode: this.props.config.renderMode ?? 1,
          transitionMode: this.props.config.transitionMode ?? 0,
          component: { zoom: true, direction: true, cover: false, marker: true },
        });
      },
      bindViewer: () => this.bindMapillaryEvents(),
      restoreMapFeedback: ({ lon, lat }, bearing) => {
        this.currentGreenGraphic = this.drawPulsingPoint(lon, lat, [0, 255, 0, 1]);
        this.drawCone(lon, lat, bearing, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
      },
      restoreViewerTools: imageId => {
        this.applyCustomCameraAngle();
        if (this.state.pointCloudVisible && this._pointCloudAcquisition.result) {
          this.addViewerPointCloudRenderer({ ...this._pointCloudAcquisition.result, points: this._filteredPointCloudPoints }, imageId);
        }
        if (this.state.isMeasureMode) this.updateViewerMeasurementRenderer();
        if (this.state.isSolarMode) {
          this._solarViewer?.resetRegistration();
          this.updateSolarGraphics();
        }
      },
      createMinimap: () => { void this.createMinimap(); },
      centerMap: (view, location) => view.goTo(
        { center: [location.lon, location.lat], zoom: view.zoom },
        { animate: true, duration: 1000 },
      ),
      reportMapCentered: location => this.log("Centered map on active frame:", location),
      finishExit: () => {
        const next = this._detectionNoteAfterFullscreen;
        this._detectionNoteAfterFullscreen = null;
        next?.();
      },
    });
  };

  private handleFullscreenChange = () => resizeForBrowserFullscreen(this.mapillaryViewer);

  private handleWindowResize = () => resizeForWindow(this.mapillaryViewer, () => this.applyCustomCameraAngle());
  // #endregion FULLSCREEN & RESIZE

  // #region AI DETECTIONS
  // Loads, renders and manages Mapillary detection tags in the viewer.
  /**
   * Fetches AI detection data for a specific image and renders them as interactive tags.
   * 1. Calls Mapillary Graph API for detection features (value and geometry).
   * 2. Decodes the MVT geometry for each object.
   * 3. Creates 'PolygonGeometry' and 'OutlineTag' instances.
   * 4. Applies custom styling (Mapillary Green theme) and human-friendly labels.
   * @param imageId The ID of the image for which to load detections.
   */
  private async loadDetections(imageId: string) {
    if (!this.mapillaryViewer || !this.state.detectionsActive || !(this.state.trafficSignsActive || this.state.objectsActive)) return;
    this._detectionAbort?.abort();
    const controller = new AbortController(); this._detectionAbort = controller;
    const request = ++this._detectionLoadRequest;
    const viewer = this.mapillaryViewer;

    try {
      const url = `${GRAPH_API.BASE}/${imageId}/detections?fields=id,value,geometry&access_token=${this.accessToken}`;
      const cached = this._detectionImageData?.imageId === String(imageId) && this._detectionImageData.viewer === viewer ? this._detectionImageData.data : null;
      if (!cached) this.setState({ detectionSummary: { total: 0, shown: 0, counts: {}, loading: true } });
      const data = cached || await this.runSequenceBackground(async signal => {
        const resp = await fetch(url, { signal });
        if (!resp.ok) throw new Error(`Detection request failed (${resp.status})`);
        return resp.json();
      }, controller.signal);
      if (controller.signal.aborted || request !== this._detectionLoadRequest || this.mapillaryViewer !== viewer || !this.state.detectionsActive) return;
      const activeImage = await viewer.getImage();
      if (controller.signal.aborted || request !== this._detectionLoadRequest || String(activeImage.id) !== String(imageId)) return;

      this._detectionImageData = { imageId: String(imageId), data, viewer };
      const options = this.state.detectionExplorer;
      const counts: DetectionSummary['counts'] = {};
      const detections = (Array.isArray(data.data) ? data.data : []).filter((det: any) => typeof det.value === 'string' && !!det.geometry);
      detections.forEach((det: any) => { const group = detectionGroup(det.value, this._detectionSignCodes); counts[group] = (counts[group] || 0) + 1; });
      const tagComponent = this.mapillaryViewer.getComponent("tag");
      if (!tagComponent || !data.data) return;

      // PREVENT MEMORY LEAKS: Clean up previous hover listeners and flash intervals
      if ((tagComponent as any)._detectionHoverCleanup) {
        (tagComponent as any)._detectionHoverCleanup();
        delete (tagComponent as any)._detectionHoverCleanup;
      }

      this._panoramaDetectionLabels?.dispose(); this._panoramaDetectionLabels = null;
      tagComponent.removeAll();

      const tags: OutlineTag[] = [];

      this.detectionTagMap.clear();
      detections.forEach((det: any) => {
        if (!det.geometry) return;

        const labelFull = det.value
          .split("--")
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "))
          .join(" ");

        const group = detectionGroup(det.value, this._detectionSignCodes);
        const isTarget = String(det.id) === String(this.state.targetDetectionId);
        if (!isTarget && !showDetection(det.value, group, options, {
          signs: !!this.state.trafficSignsActive, objects: !!this.state.objectsActive,
          signCode: this._mapFeatureFilterCodes.get('signs'), objectCode: this._mapFeatureFilterCodes.get('objects'), knownObjects: this._detectionObjectCodes
        })) return;

        this.detectionTagMap.set(det.id, det.value);

        const points = decodeAndNormalizeGeometry(det.geometry);

        if (points.length >= 3) {
          try {
            const geometry = new PolygonGeometry(points);
            const color = getDetectionColor(det.value) || 0x72b8dc;

            // Is this the specific object the user clicked in the alternate panel?
            const isTarget = String(det.id) === String(this.state.targetDetectionId);
            const bounds = isTarget ? detectionThumbnailBounds(points) : undefined;
            if (bounds) void this.focusSelectedDetection(imageId, bounds);

            const tag = new OutlineTag(det.id, geometry, {
              text: this.state.showAiTags && (options.labelMode === 'all' || isTarget) ? labelFull : "",
              textColor: isTarget ? 0xffff00 : 0xffffff,
              lineColor: isTarget ? 0xffff00 : color,
              lineWidth: isTarget ? 4 : 1,
              lineOpacity: isTarget ? 1 : 0.65,
              fillColor: color,
              fillOpacity: 0, // Keep imagery readable; hover adds a subtle fill
            });
            tags.push(tag);
          } catch (err) {
            console.warn("Could not create tag for detection", det.id, err);
          }
        }
      });

      this.setState({ detectionSummary: { total: detections.length, shown: tags.length, counts } });
      this.updateViewerFieldNoteMarkers?.();
      if (tags.length > 0) {
        tagComponent.add(tags);
        this.log(`Successfully rendered ${tags.length} AI objects.`);

        // hover listeners after tags are added
        this.setupDetectionHover(tagComponent, tags);
        if (activeImage.cameraType === 'spherical' && this.viewerContainer.current) {
          this._panoramaDetectionLabels = new PanoramaDetectionLabels(viewer, this.viewerContainer.current,
            tags.map(tag => ({
              id: tag.id, text: this.getDetectionValueFromTagId(tag.id).split('--').map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')).join(' '),
              point: (tag.geometry as PolygonGeometry).getPoleOfInaccessibility2d(),
              target: String(tag.id) === String(this.state.targetDetectionId)
            })), this.state.showAiTags);
        }
        (tagComponent as any)._refreshDetectionLabels?.();
      }
    } catch (err) {
      if (!controller.signal.aborted && request === this._detectionLoadRequest && (err as any)?.name !== 'AbortError') {
        this.setState({ detectionSummary: { total: 0, shown: 0, counts: {}, error: true } });
        console.error("Failed to load image detections:", err);
      }
    } finally { if (this._detectionAbort === controller) this._detectionAbort = null; }
  }

  /**
   * Sets up hover interactions for AI detection tags.
   * Labels controls all detection text; hover and target state only emphasize outlines.
   */
  private setupDetectionHover(tagComponent: any, tags: OutlineTag[]) {
    bindDetectionHover(tagComponent, tags, this.detectionHoverHost());
  }

  /** Bind viewer/draft/label state without starting listeners or timers during binding. */
  private detectionHoverHost(): DetectionHoverHost {
    return {
      container: () => this.viewerContainer.current,
      viewer: () => this.mapillaryViewer,
      imageId: () => this.state.imageId,
      value: id => this.getDetectionValueFromTagId(id),
      targetId: () => this.state.targetDetectionId,
      labelMode: () => this.state.detectionExplorer?.labelMode ?? 'all',
      labels: () => this._panoramaDetectionLabels,
      showLabels: () => this.state.showAiTags,
      detectionsActive: () => this.state.detectionsActive,
      cancelLocation: () => this.cancelDetectionNoteLocation(),
      mappedLocation: selection => mappedDetectionLocation(selection, { featureId: this.state.selectedFeatureMetadata?.id, point: this.state.selectedFeatureLocation, images: this.state.alternateImages }),
      hasDraft: () => !!(this.state.pendingFieldNote || this.state.detectionWorkspaceDraft || this._detectionWorkspaceMarkerOwner),
      drawPending: (lon, lat) => this.drawPendingNoteGraphic(lon, lat),
      clearPending: () => this.clearPendingNoteGraphic(),
      select: selection => this.setState({ viewerDetectionNote: selection, detectionNotePicking: false }),
    };
  }

  // Retrieves the detection label/value associated with a given tag ID.
  private getDetectionValueFromTagId(tagId: string): string {
    return this.detectionTagMap.get(tagId) || "";
  }

  /**
   * Toggles the visibility of AI object detections in the Mapillary viewer.
   * - When activated: Triggers the loading process for the current image.
   * - When deactivated: Removes all existing detection tags from the viewer.
   */
  private toggleDetections = async () => {
    const next = !this.state.detectionsActive && !!(this.state.trafficSignsActive || this.state.objectsActive);
    this.setState({ detectionsActive: next, targetDetectionId: null }, () => {
      if (next && this.state.imageId) void this.loadDetections(this.state.imageId);
      else this.clearDetectionOverlays();
    });
  };

  /**
   * Toggles the visibility state of AI-generated tags in the UI.
   * This function inverses the current `showAiTags` boolean value in the
   * component state, enabling or disabling the display of AI tags.
   */
  private toggleAiTags = () => {
    this.setState((prev: { showAiTags: boolean }) => ({ showAiTags: !prev.showAiTags }), () => {
      const tags = this.mapillaryViewer?.getComponent("tag");
      (tags as any)?._refreshDetectionLabels?.();
      this._panoramaDetectionLabels?.setVisible(this.state.showAiTags);
    });
  };

  /**
   * Load selected-feature metadata and a bounded, deduplicated associated-capture list.
   * Publish thumbnails before optional outline enrichment; cache only successful current-request results.
   * A new feature selection aborts and supersedes these detail and navigation requests.
   * @param featureId Mapillary feature identifier.
   * @param featureLat Feature latitude in WGS84 degrees.
   * @param featureLon Feature longitude in WGS84 degrees.
   */
  private async fetchAlternateImages(featureId: string, featureLat: number, featureLon: number) {
    this._objectDetailsAbort?.abort();
    const controller = new AbortController();
    this._objectDetailsAbort = controller;
    const request = ++this._objectDetailsRequest;
    ++this._alternateNavigationRequest;
    this._pendingDetectionFocus = null;
    this._alternateNavigationAbort?.abort();
    const layerId = this._selectedMapFeature?.layer?.id || this._selectedMapFeature?.graphic?.layer?.id;
    this._selectedMapFeatureKind = [LAYER_IDS.TRAFFIC_SIGNS_VT, LAYER_IDS.TRAFFIC_SIGNS_FL].includes(layerId) ? 'signs' :
      [LAYER_IDS.OBJECTS_VT, LAYER_IDS.OBJECTS_FL].includes(layerId) ? 'objects' : null;
    if (!this.selectedMapFeatureEnabled()) return;
    this.revealDetectionTools();
    const attrs = this._selectedMapFeature?.graphic?.attributes || {};
    const metadata = { id: String(featureId), name: attrs.name || attrs.value || "Selected object", firstSeen: attrs.first_seen_at, lastSeen: attrs.last_seen_at };
    const current = () => !controller.signal.aborted && request === this._objectDetailsRequest && this.selectedMapFeatureEnabled();
    const cached = this._objectDetailsCache.get(String(featureId));
    this.setState({
      selectedFeatureMetadata: cached?.metadata || metadata, featureMetadataLoading: !cached,
      featureMetadataError: "", alternateImagesError: "", isFetchingAlternates: !cached,
      selectedFeatureLocation: { lat: featureLat, lon: featureLon }, alternateImages: cached?.images || [],
      nearbyStripOpen: true, imageTrayTab: "object", fieldNotesListOpen: false
    }, () => this.showSelectedObjectPopup());
    if (cached) return;
    let resolvedMetadata = metadata;
    let resolvedImages: any[] = [];
    let metadataOK = false;
    let imagesOK = false;
    await Promise.all([
      (async () => {
        try {
          const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/${featureId}?fields=id,first_seen_at,last_seen_at`, this.accessToken, controller.signal);
          if (!current()) return;
          resolvedMetadata = { ...metadata, firstSeen: data.first_seen_at ?? metadata.firstSeen, lastSeen: data.last_seen_at ?? metadata.lastSeen };
          metadataOK = true;
          this.setState({ selectedFeatureMetadata: resolvedMetadata }, () => this.updateSelectedObjectPopup());
        } catch (error) {
          if (current()) this.setState({ featureMetadataError: this._owned("Dates could not be loaded.") });
        } finally { if (current()) this.setState({ featureMetadataLoading: false }, () => this.updateSelectedObjectPopup()); }
      })(),
      (async () => {
        try {
          const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/${featureId}/detections?fields=id,image{id,thumb_256_url,geometry,captured_at}&limit=5`, this.accessToken, controller.signal);
          if (!current()) return;
          if (!Array.isArray(data.data)) throw new Error("Invalid detection response");
          const seen = new Set<string>();
          resolvedImages = data.data.filter((det: any) => {
            const id = det.image?.id;
            const coordinates = det.image?.geometry?.coordinates;
            if (!id || !det.id || !det.image.thumb_256_url || !Array.isArray(coordinates) || coordinates.length < 2 || !coordinates.slice(0, 2).every(Number.isFinite) || seen.has(String(id))) return false;
            seen.add(String(id)); return true;
          }).slice(0, LIMITS.ALTERNATE_IMAGES).map((det: any) => ({ id: String(det.image.id), detectionId: String(det.id), detectionBounds: det.geometry ? detectionThumbnailBounds(decodeAndNormalizeGeometry(det.geometry)) : undefined, detectionLabel: det.value ? formatTrafficSignName(det.value) : undefined, thumbUrl: det.image.thumb_256_url, capturedAt: new Date(det.image.captured_at).getTime(), geometry: det.image.geometry }));
          imagesOK = true;
          this.setState({ alternateImages: resolvedImages, isFetchingAlternates: false }, () => this.updateSelectedObjectPopup());
          // Image detections use the same supported endpoint as the main viewer.
          // Fetch at most one bounded list per displayed capture; outlines never block thumbnails.
          if (resolvedImages.length) {
            await Promise.all(resolvedImages.map(async img => {
              try {
                const det = await this.findImageDetection(img.id, img.detectionId, controller.signal);
                if (!current()) return;
                const bounds = typeof det?.geometry === "string" ? detectionThumbnailBounds(decodeAndNormalizeGeometry(det.geometry)) : undefined;
                resolvedImages = resolvedImages.map(item => item.id === img.id ? {
                  ...item,
                  detectionLabel: det?.value ? formatTrafficSignName(det.value) : item.detectionLabel,
                  detectionBounds: bounds || item.detectionBounds
                } : item);
                this.setState({ alternateImages: resolvedImages });
              } catch { /* Keep captures available even if their detection query fails. */ }
            }));
          }

        } catch (error) {
          if (current()) this.setState({ alternateImagesError: this._owned("Images could not be loaded. Try again.") });
        } finally { if (current()) this.setState({ isFetchingAlternates: false }); }
      })(),
    ]);
    if (current() && metadataOK && imagesOK) this._objectDetailsCache.set(String(featureId), { metadata: resolvedMetadata, images: resolvedImages });
  }


  /**
   * Open an associated capture and focus its detection while this feature-navigation request remains current.
   * Coordinate viewer, sequence, map and detection updates without allowing a superseded capture to restore focus.
   */
  private _handleSelectAlternateImage = async (img: AssociatedImage) => {
    if (!this.selectedMapFeatureEnabled()) return;
    this._nearbyDiscovery?.cancel();
    this.revealDetectionTools();
    this._alternateNavigationAbort?.abort();
    const navigation = new AbortController();
    this._alternateNavigationAbort = navigation;
    const request = ++this._alternateNavigationRequest;
    this._pendingDetectionFocus = { imageId: String(img.id), detectionId: String(img.detectionId), request };
    const featureLocation = this.state.selectedFeatureLocation;
    const current = () => !navigation.signal.aborted && request === this._alternateNavigationRequest && this.selectedMapFeatureEnabled();
    try {
      this.setState({ targetDetectionId: img.detectionId, detectionsActive: !!(this.state.trafficSignsActive || this.state.objectsActive) });

      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/${img.id}?fields=sequence`, this.accessToken, navigation.signal);
      if (!current()) return;

      if (data.sequence) {
        if (this.state.selectedSequenceId && this.state.selectedSequenceId !== data.sequence) {
          this.clearSequenceGraphics();
        }

        // 1. Load the sequence and instantiate the Viewer
        await this.loadSequenceById(data.sequence, img.id);
        if (!current()) return;

        // 2. Prevent the widget's default camera angle from overwriting our target bearing
        this._isInitialImageLoad = false;

        if (this.mapillaryViewer && featureLocation) {
          try {
            // 3. AWAIT the image to fully download and render in WebGL
            // (Replaces the unreliable 1000ms setTimeout)
            const currentImage = await this.mapillaryViewer.getImage();
            if (!current() || String(currentImage.id) !== img.id) return;

            // 4. Calculate bearing FROM the car TO the traffic sign
            const targetBearing = calculateBearing(
              img.geometry.coordinates[1],
              img.geometry.coordinates[0],
              featureLocation.lat,
              featureLocation.lon,
            );

            // 5. Calculate angle difference
            const imageBearing = currentImage.compassAngle || 0;
            const diff = targetBearing - imageBearing;

            // 6. Mathematically normalize negative angles to wrap around the panorama (0.0 to 1.0)
            const newX = (((0.5 + diff / 360) % 1) + 1) % 1;

            // 7. Lock the camera onto the object
            if (img.detectionBounds) await this.focusSelectedDetection(img.id, img.detectionBounds);
            else if (this._focusedDetectionRequest !== request) this.mapillaryViewer.setCenter([newX, 0.5]);
            this.loadDetections(img.id);
          } catch (err) {
            console.warn("Could not set bearing:", err);
            this.loadDetections(img.id);
          }

          // 8. Move the ArcGIS map to match
          if (this.state.jimuMapView) {
            const view = this.state.jimuMapView.view;

            if (view.type === "3d") {
              // In 3D, point the ArcGIS camera at the object too!
              const targetBearing = calculateBearing(
                img.geometry.coordinates[1],
                img.geometry.coordinates[0],
                featureLocation.lat,
                featureLocation.lon,
              );

              this.navigateMapView(view,
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
                  heading: targetBearing,
                  tilt: 60,
                  scale: 500,
                },
                { animate: true, duration: 1500 },
              );
            } else {
              this.navigateMapView(view,
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
                  zoom: 20,
                },
                { animate: true, duration: 1000 },
              );
            }
          }
        } else {
          if (this.mapillaryViewer) this.loadDetections(img.id);
        }
        this._isFlyInActive = false;
      }
    } catch (e) {
      if (current()) this.setState({ alternateImagesError: this._owned("This image could not be opened. Try another capture or retry.") });
      console.error(e);
    }
  };
  // #endregion AI DETECTIONS

  // #region FILTER LOADING
  // Preloads traffic sign and object dropdown options from sprite sheets.
  /** Resolve deployment-relative sprite URLs from the Experience Builder widget folder. */
  private get spriteUrls() {
    return widgetSpriteUrls(this.props.context?.folderUrl);
  }

  /**
   * Load the bundled traffic-sign sprite catalog and build filter choices in cancellable chunks.
   * Startup disposal prevents late catalog or image work from publishing options.
   */
  private async preloadTrafficSignOptions() {
    if (this._startupDisposed) return;
    const signal = this._startupAbort?.signal;
    try {
      const spriteBaseUrl = this.spriteUrls.TRAFFIC_SIGNS;

      const [jsonResp, img] = await Promise.all([loadSpriteMetadata(`${spriteBaseUrl}.json`, signal), loadImage(`${spriteBaseUrl}.png`)]);

      if (this._startupDisposed || signal?.aborted) return;
      const codes = Object.keys(jsonResp);
      this._detectionSignCodes = new Set(codes);

      processInChunks(
        codes,
        20,
        (code) => {
          const friendlyName = formatTrafficSignName(code);
          const meta = jsonResp[code];

          // 1. Define the variable
          const iconUrl = cropSpriteImage(img, meta);

          // 2. Check if it is valid
          if (!iconUrl) return null;

          return { value: friendlyName, label: friendlyName, iconUrl, code };
        },
        (results) => {
          if (this._startupDisposed || signal?.aborted) return;
          const allOption: FilterOption = { value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null };

          // Store full list
          const fullList = [allOption, ...results];
          this._fullTrafficSignsOptions = fullList;

          this.setState(
            {
              trafficSignsOptions: fullList,
              trafficSignsFilterValue: allOption,
            },
            () => { this.checkFiltersLoaded(); if (this.state.signLabels && this.state.trafficSignsActive) this.filterTrafficSignsVTLayer(this._mapFeatureFilterCodes.get('signs')); },
          );
        },
        signal,
      );
    } catch (err) {
      if (this._startupDisposed || signal?.aborted) return;
      console.warn("Failed to preload traffic sign options", err);
    }
  }

  /**
   * Load the bundled object sprite catalog and build filter choices in cancellable chunks.
   * Startup disposal prevents late work from publishing options.
   */
  private async preloadObjectOptions() {
    if (this._startupDisposed) return;
    const signal = this._startupAbort?.signal;
    try {
      const spriteBaseUrl = this.spriteUrls.OBJECTS;

      const [jsonResp, img] = await Promise.all([loadSpriteMetadata(`${spriteBaseUrl}.json`, signal), loadImage(`${spriteBaseUrl}.png`)]);

      if (this._startupDisposed || signal?.aborted) return;
      const codes = Object.keys(jsonResp);
      this._detectionObjectCodes = new Set(codes);

      processInChunks(
        codes,
        20,
        (code) => {
          const friendlyName = objectNameMap[code] || code;
          const meta = jsonResp[code];

          // 1. Define
          const iconUrl = cropSpriteImage(img, meta);

          // 2. Check
          if (!iconUrl) return null;

          return { value: friendlyName, label: friendlyName, iconUrl, code };
        },
        (results) => {
          if (this._startupDisposed || signal?.aborted) return;
          const allOption: FilterOption = { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null };

          // Store full list
          const fullList = [allOption, ...results];
          this._fullObjectsOptions = fullList;

          this.setState(
            {
              objectsOptions: fullList,
              objectsFilterValue: allOption,
            },
            () => { this.checkFiltersLoaded(); if (this.state.objectLabels && this.state.objectsActive) this.filterObjectsVTLayer(this._mapFeatureFilterCodes.get('objects')); },
          );
        },
        signal,
      );
    } catch (err) {
      if (this._startupDisposed || signal?.aborted) return;
      console.warn("Failed to preload object options", err);
    }
  }

  // Helper to set loaded flag
  /** Dismiss the introduction after both sprite catalogs are ready, using the startup-owned dismissal timer. */
  private checkFiltersLoaded() {
    if (this._startupDisposed) return;
    const signal = this._startupAbort?.signal;
    // Check if both drop-downs have been populated (length > 1 means data added to default "All" option)
    if (this.state.trafficSignsOptions.length > 1 && this.state.objectsOptions.length > 1) {
      // 1. Mark logic as ready (Triggers CSS fade-out via opacity)
      this.setState({ filtersLoaded: true });

      // 2. Wait for the fade-out animation to finish, then remove from DOM
      if (this._introDismissTimer !== null) clearTimeout(this._introDismissTimer);
      this._introDismissTimer = setTimeout(() => {
        this._introDismissTimer = null;
        if (this._startupDisposed || signal?.aborted) return;
        this.setState({ showIntro: false });
      }, 800); // 800ms delay (matches CSS transition)
    }
  }

  private onTrafficSignCategoriesChange = (codes: CategorySelection) => this.applyMapFeatureCategories('signs', codes);
  private onObjectCategoriesChange = (codes: CategorySelection) => this.applyMapFeatureCategories('objects', codes);

  /** Commit one immutable selection and retire obsolete map-picking feedback. */
  private applyMapFeatureCategories = (kind: 'signs' | 'objects', codes: CategorySelection) => {
    const selection = codes === null ? null : Object.freeze([...new Set(codes)]);
    this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort();
    this.clearSelectedMapFeature(kind); this.clearTurboHoverDetails();
    this.setState(kind === 'signs' ? { trafficSignsSelectedCodes: selection } : { objectsSelectedCodes: selection });
    if (kind === 'signs') this.filterTrafficSignsVTLayer(selection);
    else this.filterObjectsVTLayer(selection);
  };

  /** Apply All/None/multiple categories to the native sign style; legacy single codes remain supported. */
  private filterTrafficSignsVTLayer(selectedValue: MapCategoryFilter) {
    this._mapFeatureFilterCodes.set('signs', selectedValue || '');
    this.refreshDetectionExploration();
    this._detectionLayers.filter('signs');
  }

  /**
   * Filters the objects/points VectorTileLayer so only icons matching `selectedValue` show.
   * Works at all zoom levels because VTL renders coverage regardless of FeatureLayer zoom threshold.
   * @param selectedValue All/None/multiple categories, or a legacy single code
   */
  private filterObjectsVTLayer(selectedValue?: MapCategoryFilter) {
    this._mapFeatureFilterCodes.set('objects', selectedValue || '');
    this.refreshDetectionExploration();
    this._detectionLayers.filter('objects');
  }
  // #endregion FILTER LOADING

  // #region COVERAGE LAYERS

  /** Create and register the native layer for later attachment to the active view. */
  private initMapillaryLayer(
    filterCreatorId?: number,
    filterStartDate?: string,
    filterEndDate?: string,
    filterIsPano?: boolean | null,
    qualityViewActive?: boolean,
    qualityBandFilter?: CoverageQualityBand | null,
  ) {
    const { VectorTileLayer } = this.ArcGISModules;
    const style = nativeCoverageStyle(this.accessToken, this.getTurboOrganizationId(),
      filterCreatorId, filterStartDate, filterEndDate, filterIsPano, qualityViewActive, qualityBandFilter);
    this._mapillaryCoverageStyle = style;
    this.mapillaryVTLayer = new VectorTileLayer({
      id: LAYER_IDS.COVERAGE_VT,
      title: "Mapillary Coverage",
      style,
    });
    this._ownedMapResources.ownLayer(this.mapillaryVTLayer);
  }

  /** Defer coverage until the incoming link's map type is active.
   * This also rejects calls retained by a previous active view.
   */
  private canInitializeCoverage(view: __esri.MapView | __esri.SceneView | null | undefined): boolean {
    if (!view?.map || view.destroyed || this.state.jimuMapView?.view !== view) return false;
    if (this._sharedStateRestoreComplete) return true;
    const parameters = this._startupUrlParameters || readSharedLinkParameters();
    const targetType = parameters.get(SHARE_PARAMS.MAP_TYPE);
    return (targetType !== "2d" && targetType !== "3d") || view.type === targetType;
  }

  /** Observe fire-and-forget navigation at its owner; interruption is expected.
   * Unexpected errors on the active view remain visible with operation context.
   */
  private navigateMapView(view: __esri.MapView | __esri.SceneView, target: any, options: any): void {
    const map = view?.map;
    const current = () => !!map && !view.destroyed && view.map === map && this.state.jimuMapView?.view === view;
    if (!current()) return;
    const failed = (error: any) => {
      if (current() && error?.name !== "AbortError") console.warn("[MapView] Navigation failed:", error);
    };
    try { void Promise.resolve(view.goTo(target, options)).catch(failed); }
    catch (error) { failed(error); }
  }

  private ensureAlwaysOnCoverageLayer = () => {
    const view = this.state.jimuMapView?.view;
    if (!view?.map || view.destroyed || !this.ArcGISModules?.VectorTileLayer) return;
    if (!view.ready || !this.canInitializeCoverage(view)) return;
    this.coverageLayerForView(view);
    this.enforceMapillaryLayerOrder(view);
    if (!this.state.tilesActive) this.setState({ tilesActive: true });
  };

  private rebuildCoverageLayer(
    creatorId?: number,
    startDate?: string,
    endDate?: string,
    isPano?: boolean | null,
    qualityViewActive?: boolean,
    qualityBandFilter?: CoverageQualityBand | null,
  ) {
    const mapView = this.state.jimuMapView;
    if (!mapView) return;
    const view = mapView.view;
    replaceNativeCoverage(view, isPano, {
      createReplacement: () => {
        this.initMapillaryLayer(creatorId, startDate, endDate, isPano, qualityViewActive, qualityBandFilter);
        return this.mapillaryVTLayer;
      },
      tilesActive: () => this.state.tilesActive,
      restoreOrder: () => this.enforceMapillaryLayerOrder(view),
      refreshTurbo: () => { if (this.state.turboModeActive) void this.enableTurboCoverageLayer(); },
      log: (...args) => this.log(...args),
    });
  }

  /** Native tiles own all sprites; no per-viewport FeatureLayer is constructed. */
  private _mapSpriteLoading = new MapSpriteLoading((kind, status) => { if (!this._sharedNotesDisposed) this.setState(kind === 'signs' ? { signSpritesStatus: status } : { objectSpritesStatus: status }); });
  /** Synchronize native detection-layer coverage and appearance through the controller for the requested feature kind. */
  private async syncMapFeatureCoverage(kind: "signs" | "objects") {
    const view = this.state.jimuMapView?.view;
    if (!view) { this._mapSpriteLoading.clear(kind); return; }
    const signs = kind === "signs", active = signs ? this.state.trafficSignsActive : this.state.objectsActive;
    const oldFeature = view.map.findLayerById(signs ? LAYER_IDS.TRAFFIC_SIGNS_FL : LAYER_IDS.OBJECTS_FL);
    if (oldFeature) { view.map.remove(oldFeature); oldFeature.destroy(); }
    if (signs) { this.mapillaryTrafficSignsFeatureLayer = null; this.trafficSignsZoomHandle?.remove(); this.trafficSignsStationaryHandle?.remove(); }
    else { this.mapillaryObjectsFeatureLayer = null; this.objectsZoomHandle?.remove(); this.objectsStationaryHandle?.remove(); }
    this._detectionLayers.sync(kind, active);
    if (!active) {
      this.setState(signs ? { showTrafficSignsFilterBox: false } : { showObjectsFilterBox: false });
      this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort(); this.clearTurboHoverDetails();
      return;
    }
    this.enforceMapillaryLayerOrder(view);
  }

  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */
  private openPickedMapDetection(feature: any) {
    this._selectedMapFeature = feature;
    const attrs = feature.graphic.attributes, featureId = attrs.id || attrs.value;
    const geoPt = webMercatorUtils.webMercatorToGeographic(feature.graphic.geometry) as __esri.Point;
    this.drawPoint(geoPt.longitude, geoPt.latitude);
    void this.fetchAlternateImages(featureId, geoPt.latitude, geoPt.longitude);
  }
  private offerNoteObjectChoice(view: __esri.MapView | __esri.SceneView, graphic: __esri.Graphic, openNote: () => void, current: () => boolean): boolean {
    if (!(this.state.trafficSignsActive || this.state.objectsActive)) return false;
    let content: HTMLElement;
    const choiceCurrent = () => current() && (!view.popup || (view.popup.visible && view.popup.content === content));
    content = createNoteObjectChoice(document, source => this._owned(source), () => { if (!choiceCurrent()) return; view.closePopup(); openNote(); }, async () => {
      if (!choiceCurrent() || !(this.state.trafficSignsActive || this.state.objectsActive)) return false;
      const screen = view.toScreen(graphic.geometry as __esri.Point);
      if (!screen || !Number.isFinite(screen.x) || !Number.isFinite(screen.y) || screen.x < 0 || screen.y < 0 || screen.x > view.width || screen.y > view.height) return false;
      this._mapFeatureClickAbort?.abort(); const controller = new AbortController(); this._mapFeatureClickAbort = controller;
      const picked = await this.pickMapFeature({ x: screen.x, y: screen.y }, view, controller.signal);
      if (!choiceCurrent() || controller.signal.aborted || !picked?.graphic) return false;
      view.closePopup(); this.openPickedMapDetection(picked); return true;
    }, choiceCurrent);
    view.openPopup({ title: this._owned('Note and map objects'), content, location: graphic.geometry as __esri.Point }); return true;
  }

  /** Resolve a pointer-local detection from source tiles under the current map-click request; return only a still-current pick. */
  private async pickMapFeature(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<any | null> {
    const stationary = () => view.stationary !== false;
    // SceneView can report 13.99999 for a settled zoom-14 target.
    if (view.zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE || !stationary() || signal.aborted) return null;
    const radius = 12;
    const ground = view.toMap(screen) as __esri.Point;
    if (!ground) return null;
    const corners = [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius]].map(([x, y]) => view.toMap({ x: screen.x + x, y: screen.y + y }) as __esri.Point).filter(p => p && Number.isFinite(p.longitude) && Number.isFinite(p.latitude));
    const boxes = turboFootprintBboxes(corners.map(p => ({ lon: p.longitude!, lat: p.latitude! })));
    let nearest: any = null, distance = radius * radius;
    for (const kind of ["signs", "objects"] as const) {
      const signs = kind === "signs";
      const active = () => signs ? this.state.trafficSignsActive : this.state.objectsActive;
      const layer = signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer;
      if (!active() || !layer?.visible || !view.map.layers.includes(layer)) continue;
      const code = this._mapFeatureFilterCodes.get(kind), all = signs ? DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS : DEFAULT_FILTER_LABELS.OBJECTS;
      const matchesCategory = categoryMatcher(code, all);
      const seen = new Set<string>(); let count = 0;
      for (const box of boxes) for (const [x, y, z] of turboTiles(box, ZOOM.TILE_FETCH)) {
        const key = `${kind}:${z}/${x}/${y}`;
        if (seen.has(key)) continue; seen.add(key);
        if (++count > 4) return null; // Never enumerate a tilted scene's broad footprint.
        if (signal.aborted) return null;
        let index = this._mapFeatureIndexes.get(key);
        let buffer = index?.buffer || this._mapFeatureTiles.get(key);
        if (!buffer) {
          const controller = new AbortController(), abort = () => controller.abort();
          signal.addEventListener("abort", abort, { once: true });
          const timer = setTimeout(abort, 12000);
          try {
            const source = signs ? TILE_URLS.TRAFFIC_SIGNS : TILE_URLS.OBJECTS;
            const response = await fetch(`${source.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y))}?access_token=${this.accessToken}`, { signal: controller.signal });
            if (response.status === 404 || response.status === 204) buffer = new ArrayBuffer(0);
            else { if (!response.ok) throw new Error(`Map feature tile: HTTP ${response.status}`); buffer = await response.arrayBuffer(); }
            if (signal.aborted) return null;
            this._mapFeatureTiles.set(key, buffer);
          } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
        }
        if (!buffer.byteLength) continue;
        const source = new VectorTile(new Pbf(new Uint8Array(buffer))).layers[signs ? "traffic_sign" : "point"];
        if (!source) continue;
        const consider = (i: number) => {
          const feature = source.feature(i), attrs = feature.properties;
          if (attrs.id == null || !attrs.value || (!signs && String(attrs.value).includes("object--traffic-sign"))) return;
          if (!matchesCategory(attrs.value)) return;
          const p = feature.loadGeometry()?.[0]?.[0]; if (!p) return;
          const n = 2 ** z, extent = Number(feature.extent) || 4096;
          const lon = (x + p.x / extent) / n * 360 - 180, lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + p.y / extent) / n))) * 180 / Math.PI;
          const coordinates = lonLatToWebMercator(lon, lat); if (!coordinates) return;
          const geometry = new this.ArcGISModules.Point({ ...coordinates, ...(view.type === "3d" ? { z: ground.z || 0 } : {}) });
          const pixel = view.toScreen(geometry); if (!pixel) return;
          const delta = (pixel.x - screen.x) ** 2 + (pixel.y - screen.y) ** 2;
          if (delta < distance) { distance = delta; nearest = { layer, kind, code, geometry, attributes: { ...attrs, id: String(attrs.id), name: signs ? formatTrafficSignName(attrs.value) : objectNameMap[attrs.value] || attrs.value } }; }
        };
        if (!index) {
          const bytes = TurboSpatialIndex.bytes(buffer, source.length);
          if (this._mapFeatureIndexes.reserve(bytes)) {
            index = new TurboSpatialIndex(buffer, [x, y, z], source.length);
            await index.build(source, signal); this._mapFeatureIndexes.set(key, index);
          }
        }
        if (index) await index.visitIndices(box, signal, consider);
        else for (let i = 0; i < source.length; i++) {
          if (i % 100 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); if (signal.aborted) return null; }
          consider(i);
        }

      }
      if (!active() || code !== this._mapFeatureFilterCodes.get(kind)) return null;
    }
    if (signal.aborted || this.state.jimuMapView?.view !== view || !nearest || !stationary() || view.zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) return null;
    if (!(nearest.kind === "signs" ? this.state.trafficSignsActive : this.state.objectsActive) || nearest.code !== this._mapFeatureFilterCodes.get(nearest.kind)) return null;
    return { layer: nearest.layer, graphic: new this.ArcGISModules.Graphic({ geometry: nearest.geometry, attributes: nearest.attributes }) };
  }

  private changeDetectionDisplayMode = (kind: 'signs' | 'objects', mode: CategoryDisplayMode) => {
    try { if (sessionStorage.getItem('mlyDisplayDebug') === '1') console.info('[Mapillary display mode]', JSON.stringify({ stage: 'widget-handler', kind, requested: mode, current: kind === 'signs' ? this.state.signDisplayMode : this.state.objectDisplayMode })); } catch { }
    if (mode !== 'selected' && mode !== 'highlight') return;
    this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort();
    this.setState(kind === 'signs' ? { signDisplayMode: mode } : { objectDisplayMode: mode }, () => {
      try { if (sessionStorage.getItem('mlyDisplayDebug') === '1') console.info('[Mapillary display mode]', JSON.stringify({ stage: 'state-committed', kind, current: kind === 'signs' ? this.state.signDisplayMode : this.state.objectDisplayMode })); } catch { }
      const selection = this._mapFeatureFilterCodes.get(kind);
      if (kind === 'signs') this.filterTrafficSignsVTLayer(selection);
      else this.filterObjectsVTLayer(selection);
    });
  };

  private changeDetectionLabels = (kind: 'signs' | 'objects', enabled: boolean) => {
    if (typeof enabled !== 'boolean') return;
    this.setState(kind === 'signs' ? { signLabels: enabled } : { objectLabels: enabled }, () => {
      if (kind === 'signs') this.filterTrafficSignsVTLayer(this._mapFeatureFilterCodes.get(kind));
      else this.filterObjectsVTLayer(this._mapFeatureFilterCodes.get(kind));
    });
  };
  private changeDetectionOverlap = (kind: 'signs' | 'objects', reduce: boolean) => {
    if (typeof reduce !== 'boolean') return;
    this.setState(kind === 'signs' ? { signReduceOverlap: reduce } : { objectReduceOverlap: reduce }, () => {
      void this.applyMapFeatureSpriteScale(kind);
    });
  };
  private changeDetectionOpacity = (kind: 'signs' | 'objects', opacity: number) => {
    if (!Number.isFinite(opacity) || opacity < .2 || opacity > 1) return;
    this._detectionLayers.setOpacity(kind, opacity);
    this.setState(kind === 'signs' ? { signOpacity: opacity } : { objectOpacity: opacity });
  };
  private resetDetectionDisplay = (kind: 'signs' | 'objects') => {
    this.setState(kind === 'signs' ? { signSpriteScale: 1, signOpacity: 1, signDisplayMode: 'selected', signReduceOverlap: false, signLabels: false } : { objectSpriteScale: 1, objectOpacity: 1, objectDisplayMode: 'selected', objectReduceOverlap: false, objectLabels: false }, () => {
      this.applyMapFeatureCategories(kind, null);
      void this.applyMapFeatureSpriteScale(kind);
    });
  };

  private changeMapFeatureSpriteScale = (kind: "signs" | "objects", scale: number) => {
    if (![0.75, 1, 1.25, 1.5, 2].includes(scale)) return;
    this.setState(kind === "signs" ? { signSpriteScale: scale } : { objectSpriteScale: scale }, () => { void this.applyMapFeatureSpriteScale(kind); });
  };

  private async applyMapFeatureSpriteScale(kind: 'signs' | 'objects') {
    await this._detectionLayers.applyAppearance(kind);
  }

  private initMapillaryTrafficSignsLayer() { this._detectionLayers.initialize('signs'); }
  private toggleMapillaryTrafficSigns = async () => {
    const next = !this.state.trafficSignsActive;
    this.setState({ trafficSignsActive: next, signSpritesStatus: next ? 'loading' : 'idle' }, () => { if (!next) this.clearSelectedMapFeature("signs"); void this.syncMapFeatureCoverage("signs"); this.syncDetectionLayerAvailability(); });
  };

  /*
        Initializes the Mapillary Objects Layer Layer
        * Creates a Object Layer from the Mapillary tiles API
        * Detection tile resources are owned by DetectionLayerController
    */
  private initMapillaryObjectsLayer() { this._detectionLayers.initialize('objects'); }
  private toggleMapillaryObjects = async () => {
    const next = !this.state.objectsActive;
    this.setState({ objectsActive: next, objectSpritesStatus: next ? 'loading' : 'idle' }, () => { if (!next) this.clearSelectedMapFeature("objects"); void this.syncMapFeatureCoverage("objects"); this.syncDetectionLayerAvailability(); });
  };

  private toggleQualityView = async () => {
    const newActive = !this.state.qualityViewActive;
    this.setState({ qualityViewActive: newActive, selectedQualityBand: newActive ? this.state.selectedQualityBand : null }, async () => {
      // Sequence-level quality_score exists from zoom 6, but the image
      // layer (and therefore per-image band precision) only renders at
      // ZOOM.TILE_FETCH (14). Below that, bands reflect sequence averages
      // only, hint at this rather than claim a hard visual threshold,
      // since ArcGIS VectorTileLayer has no queryRenderedFeatures to
      // measure actual on-screen band diversity.
      if (newActive && this.state.jimuMapView && this.state.jimuMapView.view.zoom < ZOOM.TILE_FETCH) {
        this.showZoomWarning("Quality bands are based on sequence-level averages until you zoom in further.", 0);
      } else if (!newActive) {
        this.clearZoomWarning();
      }

      if (this.state.turboModeActive) { await this.enableTurboCoverageLayer(); return; }
      if (!this.state.tilesActive) return; // layer not on map, nothing to rebuild

      let creatorId: number | undefined;
      const username = this.state.turboFilterUsername?.trim() || this.props.config.turboCreator;
      if (username) {
        creatorId = (await this.getUserIdFromUsername(username)) || undefined;
      }

      this.rebuildCoverageLayer(
        creatorId,
        this.state.turboFilterStartDate || undefined,
        this.state.turboFilterEndDate || undefined,
        this.state.turboFilterIsPano,
        newActive,
        newActive ? this.state.selectedQualityBand : null,
      );
    });
  };
  /** Restore the widget layer ordering without replacing unrelated layers on the shared map. */
  private enforceMapillaryLayerOrder(view?: __esri.MapView | __esri.SceneView) {
    const targetView = view ?? this.state.jimuMapView?.view;
    if (!targetView?.map) return;
    orderCoverageLayers(targetView.map, () => {
      const overlay = this._activeSequenceOverlay;
      return overlay?.view === targetView ? overlay.layer : undefined;
    });
  }

  // #endregion COVERAGE LAYERS

  // #region SHARE & EXPORT
  /** Copy image coordinates with validation, browser fallback and user feedback. */
  private copyImageCoordinates = async (latitude: number, longitude: number) => {
    return copyCoordinates(latitude, longitude, message => this.showToast(message));
  };

  private copyShareLink = async () => {
    if (!this.state.imageId) return;
    await copyBrowserShareLink(this._browserShareLinkHost);
  };

  /** Keep browser copying separate from the existing toast markup and wording. */
  private readonly _browserShareLinkHost: BrowserShareLinkHost = {
    getWindow: () => window,
    getClipboard: () => navigator.clipboard,
    getDocument: () => document,
    onCopied: method => {
      if (method === "clipboard") {
        this.showToast(
          <span style={navigationFeedbackStyle()}>
            <Icons.Check size={14} />  {this._t('appLinkCopiedToClipboard')} </span>,
        );
      } else this.showToast(this._t('appLinkCopiedToClipboard2'));
    },
    onFailure: () => this.showToast(this._t('appCouldNotCopyPleaseCopyFromAddressBar')),
    onError: error => console.error("Error generating link:", error),
  };

  /** Restore a shared link only after React, the view and ArcGIS modules are ready.
   * Coverage initializes independently so long sequence routes cannot block tiles.
   * The originating setup revision prevents stale views from owning restoration.
   */
  private async restoreSharedStateWhenReady(view: __esri.MapView | __esri.SceneView, current: () => boolean) {
    return restoreSharedStateWhenReady(view, current, {
      restored: () => this._sharedStateRestoreComplete,
      modules: () => this.ensureArcGISModules(),
      restore: () => this.checkUrlForSharedState(current),
      warn: error => console.warn("[MapView] Shared-link initialization failed:", error),
    });
  }

  // Helper method to handle the shared URL
  private checkUrlForSharedState = async (isStartupCurrent: () => boolean = () => true) => {
    const sharedView = this.state.jimuMapView?.view;
    if (!sharedView?.map || sharedView.destroyed) return;
    const sharedMap = sharedView.map;
    const startupClickRevision = this._mapClickRevision;
    const current = () => this._mapClickRevision === startupClickRevision && isStartupCurrent() && this.state.jimuMapView?.view === sharedView &&
      sharedView.map === sharedMap && !sharedView.destroyed && this.props.state !== 'CLOSED' && this.props.visible !== false &&
      (!this._currentImagePresentation || this._currentImagePresentation.owns(sharedMap));
    if (!current()) return;
    // 1. Get the query string.
    // We attempt to read the PARENT window (the main browser URL),
    // because the widget runs in an iframe and its own URL won't have the params.
    const params = this._startupUrlParameters || readSharedLinkParameters();

    const sharedId = params.get(SHARE_PARAMS.IMAGE_ID);

    // MAP VIEW TYPE CHECK AND SWITCH
    const targetMapType = params.get(SHARE_PARAMS.MAP_TYPE); // '2d' or '3d'

    if ((targetMapType === "2d" || targetMapType === "3d") && this.state.jimuMapView && !this._hasAttemptedMapSwitch) {
      const currentType = this.state.jimuMapView.view.type;

      // If the link was 2D but the map opened in 3D (or vice versa)
      if (currentType !== targetMapType) {
        try {
          const mvManager = MapViewManager.getInstance();
          const mapGroup = mvManager.getJimuMapViewGroup(this.state.jimuMapView.mapWidgetId);

          if (mapGroup) {
            this.log(`Map mismatch: URL wants ${targetMapType}, current is ${currentType}. Switching...`);

            this._hasAttemptedMapSwitch = true;
            // Observe asynchronous SDK switch failures; the new view starts its own setup.
            await mapGroup.switchMap();

            // Exit now. The map will switch, trigger onActiveViewChange, and come back here automatically.
            return;
          }
        } catch (err) {
          if (!current()) return;
          console.warn("Could not auto-switch map view:", err);
        }
      }
    }

    if (sharedId) {
      this.log("Shared Mapillary ID found:", sharedId);
      this.setState({ isSharedState: true });

      // Get camera params
      const bearing = parseFloat(params.get(SHARE_PARAMS.BEARING) || "0");
      // SHARE_PARAMS.ZOOM stores the ArcGIS map zoom level (e.g. 19.0),
      // NOT a Mapillary viewer zoom (0–1). Use it to restore the map position.
      const mapZoom = parseFloat(params.get(SHARE_PARAMS.ZOOM) || "19");

      try {
        // Fetch image details to get sequence ID and coords
        const resp = await fetch(`${GRAPH_API.BASE}/${sharedId}?fields=sequence,geometry`, {
          headers: { Authorization: `OAuth ${this.accessToken}` },
        });

        if (!current()) return;
        if (resp.ok) {
          const data = await resp.json();
          if (!current()) return;
          const seqId = data.sequence;
          const coords = data.geometry?.coordinates; // [lon, lat]

          if (seqId && coords) {
            // Pin the saved heading while the SDK opens/centers the image.
            this._isFlyInActive = true; this._sharedStartupImageId = String(sharedId); this._sharedStartupBearing = bearing; this._lastBearing = bearing;
            try {
              await this.loadSequenceById(seqId, sharedId);
              const restoreCurrent = () => current() && String(this.state.imageId) === String(sharedId);
              if (!restoreCurrent()) return;
              await restoreSharedViewerBearing(sharedId, coords, bearing, this._sharedViewerBearingHost, restoreCurrent);
              if (!restoreCurrent()) return;
              // Anchoring can run in parallel with the camera flight when detail
              // coverage is already available; it never blocks imagery or flight.
              this.refreshActivePulseAnchor(sharedView);
              if (this.ArcGISModules) {
                const { Point } = this.ArcGISModules;
                await restoreSharedMapCamera(sharedView, coords, bearing, mapZoom, properties => new Point(properties), restoreCurrent);
              }
              if (!restoreCurrent()) return;
              this.refreshActivePulseAnchor(sharedView);
              this.requestConeRedraw(sharedView);
            } finally {
              if (current()) { this._sharedStartupImageId = null; this._sharedStartupBearing = null; this._isFlyInActive = false; }
            }
          }
        }
      } catch (err) {
        if (current()) {
          this._isFlyInActive = false;
          if ((err as any)?.name !== "AbortError") console.error("Failed to load shared state", err);
        }
      }
    }

    /*
     * Initial URL/shared-state restoration is complete.
     *
     * Important:
     * if switchMap() above is needed, that branch returns
     * before reaching here. The NEW active view will run
     * checkUrlForSharedState() again.
     */
    if (!sharedId && current()) {
      const latText = params.get(SHARE_PARAMS.LAT), lonText = params.get(SHARE_PARAMS.LON);
      const zoomText = params.get(SHARE_PARAMS.ZOOM), bearingText = params.get(SHARE_PARAMS.BEARING);
      const latitude = latText?.trim() ? Number(latText) : NaN;
      const longitude = lonText?.trim() ? Number(lonText) : NaN;
      const zoom = zoomText?.trim() ? Number(zoomText) : sharedView.zoom;
      const bearing = bearingText?.trim() ? Number(bearingText) : 0;
      if (Number.isFinite(latitude) && Math.abs(latitude) <= 90 && Number.isFinite(longitude) && Math.abs(longitude) <= 180 &&
        Number.isFinite(zoom) && Number.isFinite(bearing)) {
        this._isFlyInActive = true;
        try {
          const { Point } = this.ArcGISModules;
          await restoreSharedMapCamera(sharedView, [longitude, latitude], bearing, zoom, properties => new Point(properties), current);
        } catch (error) {
          if (current() && (error as any)?.name !== "AbortError") console.warn("[MapView] Could not restore the shared viewport:", error);
        } finally {
          if (current()) this._isFlyInActive = false;
        }
      }
    }
    if (current()) {
      this._sharedStateRestoreComplete = true;
      this.syncMapLegendLayer();
      // If a requested map switch was unavailable, initialize the surviving view.
      // An existing coverage request already owns initialization for the target view.
      if (!this._turboAbortController || this._turboAbortController.signal.aborted) {
        this.ensureAlwaysOnCoverageLayer();
        if (this.state.turboModeActive) void this.enableTurboCoverageLayer();
      }
      this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
    }
  };

  /**
   * Export enabled traffic-sign/object categories within the current geographic extent as GeoJSON.
   * Collect source tiles under an abortable export request; do not retain a viewport FeatureLayer.
   * Ignore a completed download if its originating view has been replaced.
   */
  private downloadCurrentFeatures = async () => {
    const view = this.state.jimuMapView?.view;
    if (!view || this.state.mapFeatureExportLoading) return;
    const kinds: ("signs" | "objects")[] = [];
    if (this.state.trafficSignsActive) kinds.push("signs");
    if (this.state.objectsActive) kinds.push("objects");
    if (!kinds.length) return;
    const extent = view.extent;
    const geographic = extent?.spatialReference?.isGeographic ? extent : extent?.spatialReference?.isWebMercator ? webMercatorUtils.webMercatorToGeographic(extent) as __esri.Extent : null;
    if (!geographic) { this.showZoomWarning("Map bounds are unavailable for export. Use a geographic or Web Mercator map.", 5000); return; }
    if (geographic.xmax - geographic.xmin >= 180) { this.showZoomWarning("Zoom closer before exporting this area.", 5000); return; }
    const wrap = (lon: number) => ((lon + 180) % 360 + 360) % 360 - 180;
    const boxes = turboFootprintBboxes([{ lon: wrap(geographic.xmin), lat: geographic.ymin }, { lon: wrap(geographic.xmax), lat: geographic.ymax }]);
    this._mapFeatureExportAbort?.abort();
    const controller = new AbortController(); this._mapFeatureExportAbort = controller;
    this.setState({ mapFeatureExportLoading: true });
    let url: string | null = null;
    try {
      const blob = await this.collectMapFeatureExport(boxes, kinds, controller.signal);
      if (controller.signal.aborted || this.state.jimuMapView?.view !== view) return;
      url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url;
      anchor.download = `mapillary_${kinds.join("-")}_bbox_${Date.now()}.geojson`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
    } catch (error) {
      if (!controller.signal.aborted) this.showZoomWarning((error as Error).message || "Export failed. Try again.", 6000);
    } finally {
      if (url) { const downloadUrl = url; setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000); }
      if (this._mapFeatureExportAbort === controller) { this._mapFeatureExportAbort = null; this.setState({ mapFeatureExportLoading: false }); }
    }
  };

  /**
   * Fetches the high-resolution (2048px) image URL for the current image
   * and triggers a browser download.
   */
  private downloadActiveImage = async () => {
    const { imageId, sequenceImages } = this.state;
    if (!imageId) return;

    this.setState({ isDownloading: true });

    try {
      const downloaded = await downloadImageFile(imageId, sequenceImages, this.accessToken, GRAPH_API.BASE);
      if (!downloaded) {
        this.showToast(
          <span style={navigationFeedbackStyle()}>
            <Icons.Warning size={14} />  {this._t('appHighResolutionImageNotAvailable')} </span>,
        );
        return;
      }

      this.showToast(
        <span style={navigationFeedbackStyle()}>
          <Icons.Download size={14} />  {this._t('appImageDownloaded')} </span>,
      );
    } catch (err) {
      console.error("Failed to download image:", err);
      this.showToast(
        <span style={navigationFeedbackStyle()}>
          <Icons.Warning size={14} />  {this._t('appDownloadFailed')} </span>,
      );
    } finally {
      this.setState({ isDownloading: false });
    }
  };
  // #endregion SHARE & EXPORT

  // #region TURBO MODE

  /** Native coverage at every zoom; local decoding supports picking without replacing tile circles. */
  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {
    const view = this.state.jimuMapView?.view;
    if (!this.state.turboModeActive || !view?.map || !this.canInitializeCoverage(view)) return;
    // Startup and stationary callbacks must not cancel the same unfinished style.
    // Creator resolution belongs to that task; key by its input, not its result.
    const key = JSON.stringify({
      ...this.getTurboFilters(), creatorId: undefined,
      username: (forceUsernameFilter ?? (this.state.turboFilterUsername || this.props.config.turboCreator || "")).trim(),
      colorByDate: !!this.state.turboColorByDate, token: this.accessToken
    });
    const pending = this._turboCoveragePending;
    if (pending && pending.view === view && pending.map === view.map && pending.key === key &&
      !pending.controller.signal.aborted) return pending.promise;
    this._turboAbortController?.abort();
    this._turboHoverPickAbort?.abort();
    this.clearTurboHoverDetails();
    this._turboClickPickAbort?.abort();
    const controller = new AbortController();
    this._turboAbortController = controller;
    const requestId = ++this._turboRequestCount;
    const map = view.map;
    const current = () => !!view && !!map && !controller.signal.aborted &&
      requestId === this._turboRequestCount && this.state.turboModeActive &&
      this.canInitializeCoverage(view) && view.map === map && !view.destroyed;
    const attached = () => {
      const layer = this.turboCoverageLayer;
      return !!layer && !layer.destroyed && map?.findLayerById(LAYER_IDS.COVERAGE_VT) === layer;
    };
    this.beginTurboLoading(requestId);
    const task = this._turboLoadTask.then(async () => {
      let loaded = false;
      try {
        if (!current()) return;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            await this.loadTurboCoverageLayer(forceUsernameFilter, requestId, controller);
            loaded = current() && attached();
            break;
          } catch (error) {
            const name = (error as any)?.name;
            // A current layer-view creation can abort during startup. Retry once;
            // detached layers and superseded views are owned by their newer request.
            if (attempt === 0 && current() && attached() &&
              (name === "AbortError" || name === "view:no-layerview-for-layer")) {
              this._loadedTurboFiltersKey = "";
              continue;
            }
            throw error;
          }
        }
      } catch (err) {
        if (current()) {
          console.warn("[Turbo] Coverage load failed", err);
          this.updateTurboPickWarning(this._t('appCoverageCouldNotLoadCheckYourConnectionAndChoose'), "retry");
        }
      } finally {
        if (requestId === this._turboRequestCount) {
          this.finishTurboLoading();
          if (loaded && current() && attached()) {
            this.showTurboInteractionHelp();
            this._coverageHoverResume?.ready(view, requestId);
          }
        }
      }
    });
    this._turboLoadTask = task;
    this._turboCoveragePending = { view, map, key, controller, promise: task };
    try { await task; }
    finally {
      if (this._turboCoveragePending?.promise === task) this._turboCoveragePending = null;
    }
  }

  /** Delay the passive status so fast coverage transitions do not flash. */
  private beginTurboLoading(requestId: number) {
    if (this._turboLoadingTimer) clearTimeout(this._turboLoadingTimer);
    this.setState({ turboLoading: true });
    this._turboLoadingTimer = setTimeout(() => {
      this._turboLoadingTimer = null;
      if (requestId === this._turboRequestCount && this.state.turboModeActive) this.setState({ turboUpdatingVisible: true });
    }, 300);
  }

  /** Cancel the passive loading timer and clear coverage busy feedback; callers own request-validity checks. */
  private finishTurboLoading() {
    if (this._turboLoadingTimer) clearTimeout(this._turboLoadingTimer);
    this._turboLoadingTimer = null;
    this.setState({ turboLoading: false, turboUpdatingVisible: false });
  }

  /** Keep ArcGIS view/layer selection here; readiness resources belong to coverage. */
  private waitForTurboCoverageReady(view: __esri.MapView | __esri.SceneView, layer: __esri.VectorTileLayer, signal: AbortSignal): Promise<void> {
    return waitForCoverageReady(view, layer, signal);
  }

  /** Stable highlights: cached decoded geometry in 2D, fixed native terrain styles in 3D. */
  private bindTileSequenceHighlights(view: __esri.MapView | __esri.SceneView, styles: any[]) {
    const layers: Partial<Record<'selected' | 'hover', __esri.GraphicsLayer>> = {};
    const visibleTiles = (): [number, number, number][] => {
      const extent = view.extent;
      const geo = extent?.spatialReference?.isGeographic ? extent
        : extent?.spatialReference?.isWebMercator ? webMercatorUtils.webMercatorToGeographic(extent) as __esri.Extent : null;
      if (!geo || view.zoom < 6) return [];
      const wrap = (lon: number) => ((lon + 180) % 360 + 360) % 360 - 180;
      const boxes: TurboBbox[] = geo.xmax - geo.xmin >= 180 ? [[-180, geo.ymin, 180, geo.ymax]]
        : turboFootprintBboxes([{ lon: wrap(geo.xmin), lat: geo.ymin }, { lon: wrap(geo.xmax), lat: geo.ymax }]);
      const tiles: [number, number, number][] = [];
      const zoom = Math.max(6, Math.min(14, Math.floor(view.zoom)));
      for (const box of boxes) for (const tile of turboTiles(box, zoom)) {
        tiles.push(tile); if (tiles.length >= 64) break;
      }
      const cached = new Set(this._turboTileCache.snapshot().map(([key]) => key));
      return tiles.slice(0, 64).sort((a, b) => Number(cached.has(`${b[2]}/${b[0]}/${b[1]}`)) - Number(cached.has(`${a[2]}/${a[0]}/${a[1]}`)));
    };
    const native = view.type === '3d' ? new NativeTileHighlightCache<__esri.VectorTileLayer>({
      create: (style, id) => new this.ArcGISModules.VectorTileLayer({ style, id, listMode: 'hide' }),
      attach: layer => {
        const baseIndex = this.turboCoverageLayer ? view.map.layers.indexOf(this.turboCoverageLayer) : -1;
        view.map.add(layer, baseIndex < 0 ? undefined : baseIndex + 1);
        this.enforceMapillaryLayerOrder(view);
      },
      remove: layer => { if (view.map?.layers.includes(layer)) view.map.remove(layer); },
    }, { version: 8, sources: { turbo: { type: 'vector', tiles: [`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`], minzoom: 0, maxzoom: 14 } }, layers: styles }) : null;
    this._nativeSequenceSelection.bind({
      native: native ? (role, id) => native.show(role, id) : undefined,
      tiles: visibleTiles, zoom: () => view.zoom, resolution: () => view.type === '2d' ? view.resolution : NaN,
      rotation: () => view.type === '2d' ? view.rotation : 0, styles,
      load: (tile, signal) => this.getTurboTileBuffer(tile, signal),
      decode: buffer => new VectorTile(new Pbf(new Uint8Array(buffer))),
      index: (buffer, signal) => this.getSequenceTileIndex(buffer, signal),
      create: properties => new this.ArcGISModules.Graphic(properties),
      symbol: ({ type, ...properties }) => this.ArcGISModules.SimpleMarkerSymbol ? new this.ArcGISModules.SimpleMarkerSymbol(properties) : { type, ...properties },
      replace: (role, graphics) => {
        if (this.state.jimuMapView?.view !== view || view.destroyed) return;
        let layer = layers[role];
        if (!layer && graphics.length) {
          layer = layers[role] = new this.ArcGISModules.GraphicsLayer({
            id: `mapillary-tile-${role}`, title: `Mapillary ${role} sequence`, listMode: 'hide',
            elevationInfo: { mode: 'on-the-ground' }
          });
          const baseIndex = this.turboCoverageLayer ? view.map.layers.indexOf(this.turboCoverageLayer) : -1;
          const hoverIndex = view.map.layers.indexOf(layers.hover as __esri.GraphicsLayer);
          view.map.add(layer, role === 'selected' && hoverIndex >= 0 ? hoverIndex + 1 : baseIndex < 0 ? undefined : baseIndex + 1);
        }
        if (!layer) return;
        // Preserve Graphic instances and GPU buffers when the visible set is unchanged.
        const wanted = new Set(graphics);
        const previous = layer.graphics.toArray(), existing = new Set(previous);
        const removed = previous.filter(graphic => !wanted.has(graphic));
        const added = graphics.filter(graphic => !existing.has(graphic));
        if (removed.length) layer.removeMany(removed);
        if (added.length) layer.addMany(added);
      },
      dispose: () => { native?.dispose(); for (const layer of Object.values(layers)) if (layer) { view.map?.remove(layer); layer.destroy(); } },
      warn: error => console.warn('[Mapillary] Tile highlight failed:', error),
    });
  }

  private changeTravelMethod = (onFoot: boolean | undefined) => {
    if (this.state.turboFilterOnFoot === onFoot) return;
    this.setState({ turboFilterOnFoot: onFoot }, () => { void this.enableTurboCoverageLayer(); });
  };

  private _organizationNames: OrganizationNameLookup | null = null;
  private _organizationNameRevision = 0;
  private _organizationNameDisposed = false;
  private _organizationNameTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleOrganizationName() {
    ++this._organizationNameRevision;
    if (this._organizationNameTimer !== null) clearTimeout(this._organizationNameTimer);
    this._organizationNameTimer = setTimeout(() => {
      this._organizationNameTimer = null;
      void this.updateOrganizationName();
    }, 300);
  }

  /** Names are presentation metadata; coverage continues using the numeric ID. */
  private async updateOrganizationName() {
    const revision = ++this._organizationNameRevision;
    const id = this.getTurboOrganizationId();
    if (this._organizationNameDisposed) return;
    if (id === undefined || id < 1) {
      if (this.state.organizationName) this.setState({ organizationName: null });
      return;
    }
    this._organizationNames ??= new OrganizationNameLookup();
    const name = await this._organizationNames.resolve(String(id), this.accessToken);
    if (this._organizationNameDisposed || revision !== this._organizationNameRevision || this.getTurboOrganizationId() !== id) return;
    const next = name ? { id: String(id), name } : null;
    if (this.state.organizationName?.id !== next?.id || this.state.organizationName?.name !== next?.name) {
      this.setState({ organizationName: next });
    }
  }

  private getOrganizationDisplayName(): string | undefined {
    return this.state.organizationName?.id === String(this.getTurboOrganizationId()) ? this.state.organizationName.name : undefined;
  }

  private getTurboOrganizationId(): number | undefined {
    return organizationFilterId(this.props.config.turboOrganization || this.state.turboFilterOrganization);
  }

  /** Invalidate consumers immediately; raw tile and spatial-index caches remain reusable. */
  private resetOrganizationSelection() {
    this._turboAbortController?.abort();
    ++this._turboRequestCount;
    this._turboHoverPickAbort?.abort();
    this._turboClickPickAbort?.abort();
    this._coverageFrameLookup?.clear();
    this.clearTurboHover();
    this.clearTurboHoverDetails();
    this.finishTurboLoading();
    this.setState({ coverageFrameResolving: false });
  }

  private changeCoverageOrganization = (value: string, immediate = false) => {
    if (this.props.config.turboOrganization) return;
    this.resetOrganizationSelection();
    this.setState({ turboFilterOrganization: value }, () => {
      this.debouncedTurboFilter.cancel?.();
      if (immediate) void this.enableTurboCoverageLayer();
      else this.debouncedTurboFilter();
    });
  };

  private getTurboFilters(): TurboFilters {
    return {
      qualityActive: !!this.state.qualityViewActive,
      qualityBand: this.state.qualityViewActive ? this.state.selectedQualityBand : null,
      creatorId: this._turboCreatorId,
      organizationId: this.getTurboOrganizationId(),
      startTime: this.state.turboFilterStartDate ? new Date(this.state.turboFilterStartDate).getTime() : undefined,
      endTime: this.state.turboFilterEndDate ? new Date(this.state.turboFilterEndDate).getTime() : undefined,
      isPano: this.state.turboFilterIsPano,
      onFoot: this.state.turboFilterOnFoot,
      selectedYear: this.state.turboColorByDate ? this.state.selectedTurboYear : undefined,
    };
  }

  /** Replace or restyle native coverage for the active filters and view; preserve request identity across asynchronous SDK work. */
  private async loadTurboCoverageLayer(forceUsernameFilter: string | undefined, requestId: number, controller: AbortController) {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view;
    if (!view?.map || view.destroyed || !this.canInitializeCoverage(view)) return;
    const map = view.map;
    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.canInitializeCoverage(view) && view.map === map && !view.destroyed;
    // Config and stationary callbacks also enter here before the active view is ready.
    await view.when();
    if (!current()) return;
    await this.ensureArcGISModules();
    if (!current()) return;
    const username = (forceUsernameFilter ?? (this.state.turboFilterUsername || this.props.config.turboCreator || "")).trim();
    const creatorId = username ? await this.getUserIdFromUsername(username) : undefined;
    if (!current()) return;
    if (username && !creatorId) this.showZoomWarning(`User '${username}' not found.`, 3000);
    // Invalid identities match no features; never restore unfiltered coverage.
    this._turboCreatorId = username && !creatorId ? -1 : creatorId ?? undefined;
    if (this.getTurboOrganizationId() === -1) this.showZoomWarning("Enter a valid numeric organization ID.", 3000);
    const filters = this.getTurboFilters();
    const colorByDate = !!this.state.turboColorByDate;
    const key = JSON.stringify({ ...filters, colorByDate, points: "native" });
    let layer = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | undefined;
    if (layer?.destroyed) { view.map.remove(layer); layer = undefined; }
    // Retire layers created by older hybrid builds; native circles never hand off to Graphics.
    for (const id of [LAYER_IDS.TURBO_COVERAGE, TURBO_LIMITS.closeLayerId]) {
      const legacy = map.findLayerById(id);
      if (legacy) { map.remove(legacy); legacy.destroy(); }
    }
    const changedLayer = this.turboCoverageLayer !== layer;

    if (!layer) {
      layer = this.coverageLayerForView(view);
      this._turboCoverageAdded = true;
    }
    if (changedLayer || !this._turboCoverageOriginalStyle) {
      this._turboCoverageOriginalStyle = layer === this.mapillaryVTLayer && this._mapillaryCoverageStyle
        ? this._mapillaryCoverageStyle
        : typeof (layer as any).getStyle === "function" ? await (layer as any).getStyle() : (layer as any).style;
      if (!current()) return;
    }
    // Year colors need no viewport scan: use Mapillary's capture-year range.
    const years = colorByDate ? Array.from({ length: new Date().getFullYear() - 2007 + 1 }, (_, i) => String(2007 + i)) : [];
    this.turboCoverageLayer = layer;
    const style = turboTileStyle(`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`, filters, colorByDate, years, YEAR_COLOR_PALETTE);
    if (changedLayer || this._loadedTurboFiltersKey !== key) {
      // loadStyle may complete after cancellation. Invalidate before awaiting so
      // the next request cannot mistake the previous committed style for this one.
      this._loadedTurboFiltersKey = "";
      this._nativeSequenceSelection.detach();
      await layer.loadStyle(style as any);
      if (!current()) return;
      this.bindTileSequenceHighlights(view, style.layers);
      this.updateNativeSequenceSelection();
    }
    await this.waitForTurboCoverageReady(view, layer, controller.signal);
    if (controller.signal.aborted || requestId !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return;
    this.setState({ turboYearLegend: years.map((year, i) => ({ year, color: `rgb(${YEAR_COLOR_PALETTE[i % YEAR_COLOR_PALETTE.length].slice(0, 3).join(",")})` })) });
    this._loadedTurboFiltersKey = key;
    void this.refreshSequenceMarkerWindow();
    void this._nativeSequenceSelection.refresh(this.state.isLoading || this._imageryOpeningRequest != null ? 'hover' : undefined);
    this.enforceMapillaryLayerOrder(view);
    this.log("[Turbo memory]", { cachedTileBytes: this._turboTileCache.byteLength, cachedTiles: this._turboTileCache.size, highlightMode: view.type === "3d" ? "cached-native" : "tile-geometry" });
  }

  /** Optional metadata yields new starts while imagery opens; playback uses one slot. */
  private runSequenceBackground<T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal, priority: 'normal' | 'hover' = 'normal'): Promise<T> {
    this._backgroundRequests.setPaused(!!this.state.isLoading || this._imageryOpeningRequest != null);
    this._backgroundRequests.setLimit(this._userPaused === false ? 1 : 2);
    this._sequencePerformance?.count('backgroundRequests');
    return this._backgroundRequests.run(work, signal, priority);
  }

  private async getSequenceTileIndex(buffer: ArrayBuffer, signal: AbortSignal) {
    const before = this._sequenceTileIndex.stats;
    const timing = this._sequencePerformance?.begin('sequence-index');
    const pending = this._sequenceTileIndex.get(buffer, bytes => new VectorTile(new Pbf(new Uint8Array(bytes))), signal);
    const built = this._sequenceTileIndex.stats.builds > before.builds;
    if (built) this._sequencePerformance?.count('indexBuilds');
    else if (this._sequenceTileIndex.stats.hits > before.hits) this._sequencePerformance?.count('indexHits');
    try {
      const index = await pending;
      if (built) timing?.finish();
      return index;
    } finally { timing?.cancel(); }
  }

  /** Numeric local summaries only; source identities and credentials are never exported. */
  private sequenceDiagnosticsSnapshot() {
    return {
      ...this._sequencePerformance.snapshot(),
      tiles: { ...this._sharedTileRequests.stats, cachedBytes: this._turboTileCache.byteLength, cachedEntries: this._turboTileCache.size },
      sequenceIndex: this._sequenceTileIndex.stats,
      background: { ...this._backgroundRequests.stats, limit: this._backgroundRequests.concurrency },
      routes: sequenceRouteMemoryStats(this.sequenceCoordsCache),
      nearby: this._sequenceDemand.memoryStats,
      nearbyDiscovery: this._nearbyDiscovery?.stats ?? null,
      view: this.state.jimuMapView?.view?.type ?? null,
      imageTiling: this._viewerImageTiling ?? null,
      places: { active: !!this.state.placesActive, status: this.state.placesStatus?.kind ?? 'off', ...this._places?.stats },
    };
  }

  private clearSequenceDiagnostics() {
    this._sequenceDiagnostics.clear(this.props.id);
  }

  private syncSequenceDiagnostics() {
    this._sequenceDiagnostics.sync(this.props.id, !!this.props.config.debugMode, this.props.state === 'CLOSED');
  }

  /** Reuse raw tile bytes or share an in-flight tile request; decoding and selection remain separate consumers. */
  private async getTurboTileBuffer(tile: [number, number, number], signal: AbortSignal): Promise<ArrayBuffer> {
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const token = this.accessToken, [x, y, z] = tile, key = `${z}/${x}/${y}`;
    if (this._tileRequestToken !== token) {
      if (this._tileRequestToken !== null) {
        this._sharedTileRequests.clear(); this._sequenceTileIndex.clear(); this._turboTileCache.clear();
        this._turboIndexAbort.abort(); this._turboIndexAbort = new AbortController();
        this._turboIndexPending.clear(); this._turboIndexCache.clear();
      }
      this._tileRequestToken = token;
    }
    const cached = this._turboTileCache.get(key);
    if (cached) { this._sequencePerformance?.count('tileCacheHits'); return cached; }
    const before = this._sharedTileRequests.stats;
    const result = this._sharedTileRequests.get(`${token}:${key}`, signal,
      requestSignal => this.fetchTurboTileBuffer(tile, requestSignal, token));
    if (this._sharedTileRequests.stats.shared > before.shared) this._sequencePerformance?.count('sharedTileRequests');
    return result;
  }

  /** Stable bindings avoid allocating a transport adapter for each tile request. */
  private readonly _coverageTileTransportHost = {
    getToken: () => this.accessToken,
    begin: () => this._sequencePerformance?.begin('tile-load'),
    count: () => this._sequencePerformance?.count('tileRequests'),
    publish: (key: string, buffer: ArrayBuffer) => this._turboTileCache.set(key, buffer),
  };

  /** Shared-request ownership stays here; the coverage feature owns transport mechanics. */
  private fetchTurboTileBuffer(tile: [number, number, number], signal: AbortSignal, token: string): Promise<ArrayBuffer> {
    return fetchCoverageTile(tile, signal, token, TILE_URLS.COVERAGE, this._coverageTileTransportHost);
  }

  private async visitTurboCoverage(bbox: TurboBbox, filters: TurboFilters, signal: AbortSignal, visit: (point: TurboPoint) => void) {
    for (const tileCoordinates of turboTiles(bbox, ZOOM.TILE_FETCH)) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      // Serialize one tile at a time across hover, click, legend and analysis.
      // Only raw bytes enter the LRU. Decoded PBF/VectorTile objects die here.
      const work = this._turboDecodeTask.then(async () => {
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
        const buffer = await this.getTurboTileBuffer(tileCoordinates, signal);
        if (!buffer.byteLength) return;
        const tile = new VectorTile(new Pbf(buffer));
        const imageLayer = tile.layers.image;
        if (imageLayer) await visitTurboImageLayer(imageLayer, tileCoordinates, bbox, filters, signal, visit);
      });
      this._turboDecodeTask = work.then(() => undefined, () => undefined);
      await work;
    }
  }

  private async visitTurboPickCoverage(bbox: TurboBbox, filters: TurboFilters, signal: AbortSignal, visit: (point: TurboPoint) => void) {
    for (const coordinates of turboTiles(bbox, Math.min(ZOOM.TILE_FETCH, Math.max(0, Math.floor(this.state.jimuMapView?.view?.zoom ?? ZOOM.TILE_FETCH))))) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const key = coordinates.join("/");
      let index = this._turboIndexCache.get(key);
      if (!index) {
        let pending = this._turboIndexPending.get(key);
        if (!pending) {
          const lifecycleSignal = this._turboIndexAbort.signal;
          pending = this._turboIndexTask.then(async () => {
            if (signal.aborted || lifecycleSignal.aborted) return null;
            // Once started, tiny pointer moves do not discard completed decode work.
            const buffer = await this.getTurboTileBuffer(coordinates, lifecycleSignal);
            if (lifecycleSignal.aborted) throw new DOMException("Cancelled", "AbortError");
            if (!buffer.byteLength) return null;
            const layer = new VectorTile(new Pbf(buffer)).layers.image;
            if (!layer || !this._turboIndexCache.reserve(TurboSpatialIndex.bytes(buffer, layer.length))) return null;
            const built = new TurboSpatialIndex(buffer, coordinates, layer.length);
            await built.build(layer, lifecycleSignal);
            this._turboIndexCache.set(key, built);
            return built;
          });
          this._turboIndexPending.set(key, pending);
          this._turboIndexTask = pending.then(() => undefined, () => undefined);
          const cleanup = () => { if (this._turboIndexPending.get(key) === pending) this._turboIndexPending.delete(key); };
          pending.then(cleanup, cleanup);
        }
        index = await pending || undefined;
      }
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      if (index) {
        const layer = new VectorTile(new Pbf(index.buffer)).layers.image;
        if (layer) await index.visit(layer, bbox, filters, signal, visit);
      } else {
        // Oversized tiles still expose every image; never truncate to fit cache.
        const buffer = await this.getTurboTileBuffer(coordinates, signal);
        if (buffer.byteLength) {
          const layer = new VectorTile(new Pbf(buffer)).layers.image;
          if (layer) await visitTurboImageLayer(layer, coordinates, bbox, filters, signal, visit);
        }
      }
    }
  }

  /** Scope display anchors to the active coverage source and filter revision. */
  private coverageSelectionContext() {
    const view = this.state.jimuMapView?.view;
    return {
      view: view || this, layer: this._nativeSequenceSelection,
      revision: this._turboRequestCount, enabled: !!view && this.state.turboModeActive,
      individual: !!view && view.zoom >= 14, stationary: !!view && view.stationary !== false
    };
  }

  /** Match selection visuals to the accepted tile point; API coordinates remain unchanged. */
  private getCoverageDisplayPosition(imageId: string, lon: number, lat: number): { lon: number; lat: number; geometry?: __esri.Point } {
    const selected = this._coverageSelectionTargets.anchor(this.coverageSelectionContext(), String(imageId));
    return selected ? { lon: selected.lon, lat: selected.lat, geometry: selected.geometry } : { lon, lat };
  }

  /** Revisit presentation anchoring after startup zoom/style settles; never pick another image. */
  private refreshActivePulseAnchor(view: __esri.MapView | __esri.SceneView): void {
    if (this.state.jimuMapView?.view !== view || view.destroyed || view.stationary === false || !this.state.turboModeActive || view.zoom < 14) return;
    const id = String(this.state.imageId || '');
    const image = this._liveSequenceFrames.find(id) || this.state.sequenceImages?.find(frame => String(frame.id) === id);
    if (id && image && Number.isFinite(image.lon) && Number.isFinite(image.lat)) void this.resolveNativeImageAnchor(id, image.lon, image.lat);
  }

  /** Resolve only the current image, after opening. Warm bytes/index hits do no
   * network work; a missing tile shares one optional download. API data stays intact.
   */
  private async resolveNativeImageAnchor(imageId: string, lon: number, lat: number) {
    const context = this.coverageSelectionContext(), view = this.state.jimuMapView?.view;
    if (!view || !context.enabled || !context.individual || this._coverageSelectionTargets.anchor(context, imageId)) return;
    const key = `${context.revision}:${imageId}`;
    if (this._nativeImageAnchorKey === key && !this._nativeImageAnchorAbort?.signal.aborted) return;
    this._nativeImageAnchorAbort?.abort();
    const controller = new AbortController(); this._nativeImageAnchorAbort = controller; this._nativeImageAnchorKey = key;
    const token = this.accessToken;
    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view &&
      this.state.imageId === imageId && this.accessToken === token && this.coverageSelectionContext().revision === context.revision && this.state.turboModeActive;
    try {
      // Even a warm tile's first index build must wait for the image paint gate.
      if (this.state.isLoading || this._imageryOpeningRequest != null)
        await this.runSequenceBackground(async () => undefined, controller.signal);
      if (!current()) return;
      const zoom = ZOOM.TILE_FETCH, n = 2 ** zoom;
      const x = Math.max(0, Math.min(n - 1, Math.floor((lon + 180) / 360 * n)));
      const latitude = Math.max(-85.05112878, Math.min(85.05112878, lat));
      const y = Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * n)));
      const tiles: [number, number, number][] = [[x, y, zoom]];
      // API and tile quantization can straddle a boundary. Reuse adjacent cached bytes only.
      for (const [tileKey] of this._turboTileCache.snapshot()) {
        const [z, tx, ty] = tileKey.split('/').map(Number);
        if (z === zoom && Math.abs(tx - x) <= 1 && Math.abs(ty - y) <= 1 && (tx !== x || ty !== y)) tiles.push([tx, ty, z]);
      }
      for (const tile of tiles) {
        if (!current()) return;
        const [tx, ty, z] = tile;
        const cached = this._turboTileCache.get(`${z}/${tx}/${ty}`);
        const buffer = cached ?? await this.runSequenceBackground(signal => this.getTurboTileBuffer(tile, signal), controller.signal);
        if (!current()) return;
        if (!buffer.byteLength) continue;
        const index = this._sequenceTileIndex.has(buffer)
          ? await this.getSequenceTileIndex(buffer, controller.signal)
          : await this.runSequenceBackground(signal => this.getSequenceTileIndex(buffer, signal), controller.signal);
        if (!current()) return;
        const point = nativeImageAnchor(buffer, index, bytes => new VectorTile(new Pbf(new Uint8Array(bytes))), tile, imageId);
        if (!point) continue;
        const geometry = new this.ArcGISModules.Point({ ...point, spatialReference: { wkid: 3857 } });
        this._coverageSelectionTargets.retain(this.coverageSelectionContext(), imageId, geometry, this.state.sequenceId || undefined);
        this.drawPulsingPoint(lon, lat, [0, 255, 0, 1], imageId);
        this.drawCone(lon, lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
        return;
      }
    } catch (error) {
      if (current() && (error as any)?.name !== 'AbortError') this.log('[Mapillary] Native image anchor unavailable:', error);
    } finally {
      if (this._nativeImageAnchorAbort === controller) { this._nativeImageAnchorAbort = null; this._nativeImageAnchorKey = ''; }
    }
  }

  /** Derive status text and busy state from current coverage/selection conditions without initiating requests. */
  private getCoverageBarPresentation(): CoverageGuideStatus {
    const view = this.state.jimuMapView?.view;
    const zoom = view?.zoom ?? 0;
    if (this.state.coverageFrameResolving) return { text: this._t('appFindingNearbyImage'), busy: true };
    if (this.state.isLoading) return { text: this._t('appOpeningImage'), busy: true };
    const signsLoading = this.state.trafficSignsActive && this.state.signSpritesStatus === 'loading', objectsLoading = this.state.objectsActive && this.state.objectSpritesStatus === 'loading';
    if (signsLoading || objectsLoading) return { text: this._owned(signsLoading && objectsLoading ? 'Loading traffic sign and object icons…' : signsLoading ? 'Loading traffic sign icons…' : 'Loading object icons…'), busy: true };
    if ((this.state.trafficSignsActive && this.state.signSpritesStatus === 'error') || (this.state.objectsActive && this.state.objectSpritesStatus === 'error')) return { text: this._owned('Map icons could not load. Toggle the affected layer off and on to retry.') };
    if (this.state.imageId && this.state.sequenceRouteLoading) return { text: this.state.sequenceRouteProgress ? this._t('uiProfileRoute', { progress: this.state.sequenceRouteProgress }) : this._t('uiLoadingProfileRoute'), busy: true };
    if (this.state.turboLoading || this.state.turboUpdatingVisible) return { text: this._t('appLoadingCoverage'), busy: !!this.state.turboUpdatingVisible };
    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: this._t('appEnterAValidOrganizationId') };
    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: this._t('appZoomCloserForOrganizationCoverage'), action: "show", label: this._t('appZoomToCoverage') };
    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith("Image is open") ? this._t('uiImageReadyNoSequence') : this._t('uiImageCouldNotLoad') };
    if (this.state.turboModeActive && this.state.hoverPreviewLoading) return { text: this._t('uiFindingPreview'), busy: true };
    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: this._t('appZoomCloserForTravelMethodCoverage'), action: "show", label: this._t('appZoomToImages') };
    if ((this.state.trafficSignsActive || this.state.objectsActive) && zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) {
      return { text: this._t(this.state.trafficSignsActive && this.state.objectsActive ? 'uiExploreSignsObjects' : this.state.trafficSignsActive ? 'uiExploreSigns' : 'uiExploreObjects'), action: "data", label: this._t('appZoomCloser') };
    }
    if (this.state.turboModeActive && zoom < 14) return { text: this._t('appZoomCloserForImagePoints'), action: "show", label: this._t('appZoomToImages') };
    const error = !!this.state.zoomWarningMessage && this.shouldShowCoverageNotice() && !this.state.turboWarningIsHelp;
    if (error && this.state.turboWarningAction === "retry") return { text: this._t('appCoverageUnavailable'), action: "retry", label: this._t('appRetry') };
    if (!this.state.turboModeActive) return { text: error ? this._t('appCoverageNeedsAttention') : this._t('uiMapillaryCoverage') };
    if (view?.type === "3d" && (view as __esri.SceneView).camera?.tilt > 45) {
      let valid = 0;
      for (const y of [0.1, 0.5, 0.9]) for (const x of [0.1, 0.5, 0.9]) {
        const ground = view.toMap({ x: view.width * x, y: view.height * y });
        if (ground && Number.isFinite(ground.longitude) && Number.isFinite(ground.latitude)) valid++;
      }
      if (valid < 5) return { text: this._t('appTiltHidesImagePoints'), action: "tilt", label: this._t('appReduceTilt') };
    }
    if (zoom < 14) return { text: this._t('appZoomCloserForImagePoints'), action: "show", label: this._t('appZoomToImages') };
    if (error) return { text: this._t('appCoverageNeedsAttention'), ...(this.state.turboWarningAction === "zoom" ? { action: "zoom" as const, label: this._t('appMoveCloser') } : {}) };
    if (this.state.trafficSignsActive || this.state.objectsActive) return { text: this.state.trafficSignsActive && this.state.objectsActive ? this._t('uiSelectSignObjectImage') : this.state.trafficSignsActive ? this._t('uiSelectSignImage') : this._t('uiSelectObjectImage') };
    if (!this.state.turboModeActive && this.state.imageId && this.state.nearbyFramesHintVisible) return { text: this._t('appBlueDotsNearbyFrames') };
    if (this.state.imageId) return { text: this._t('appSelectAnotherPointToExplore') };
    return { text: this.state.imageId ? this._t('appSelectAnotherPointToExplore') : this._t('uiSelectImagePoint') };
  }

  private shouldShowCoverageBar(): boolean {
    return this.shouldShowCoverageNotice() && !!(this.state.turboModeActive || this.state.trafficSignsActive || this.state.objectsActive || this.state.zoomWarningMessage || this.state.turboUpdatingVisible);
  }

  /** Describe active exploration settings for the coverage guide without changing those settings. */
  private getExplorerGuideContext(): string[] {
    const context: string[] = [];
    const creator = this.state.turboFilterUsername || this.props.config.turboCreator;
    if (creator) context.push(this._t('uiCreator', { name: creator }));
    const organization = this.getTurboOrganizationId();
    if (organization !== undefined) context.push(organization > 0 ? this._t('uiOrganization', { name: organization }) : this._t('uiInvalidOrganization'));
    const start = this.state.turboFilterStartDate, end = this.state.turboFilterEndDate;
    if (start || end) context.push(this._t('uiDateRange', { start: start || this._t('uiAnyDate'), end: end || this._t('uiLatest') }));
    if (this.state.turboFilterOnFoot !== undefined) context.push(this.state.turboFilterOnFoot ? this._t('uiTravelFoot') : this._t('uiTravelOther'));
    if (this.state.turboFilterIsPano === true) context.push(this._t('uiPanoOnly'));
    else if (this.state.turboFilterIsPano === false) context.push(this._t('uiNonPanoOnly'));
    if (this.state.turboColorByDate) context.push(this.state.selectedTurboYear ? this._t('uiYear', { year: this.state.selectedTurboYear }) : this._t('uiColorYear'));
    if (this.state.qualityViewActive) context.push(this.state.selectedQualityBand ? this._t('uiQualityBand', { band: this.state.selectedQualityBand }) : this._t('uiQualityOn'));
    if (this.state.trafficSignsActive) {
      const code = this._mapFeatureFilterCodes.get("signs");
      const codes = selectedCategoryCodes(code, DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS);
      context.push(codes === null ? this._t('uiSignsOn') : this._t('uiSigns', { name: codes.length === 1 ? formatTrafficSignName(codes[0]) : codes.length ? this._t('featureSelectedCount', { count: codes.length }) : this._t('featureNoneSelected') }));
    }
    if (this.state.objectsActive) {
      const code = this._mapFeatureFilterCodes.get("objects");
      const codes = selectedCategoryCodes(code, DEFAULT_FILTER_LABELS.OBJECTS);
      context.push(codes === null ? this._t('uiObjectsOn') : this._t('uiObjectsFilter', { name: codes.length === 1 ? objectNameMap[codes[0]] || codes[0] : codes.length ? this._t('featureSelectedCount', { count: codes.length }) : this._t('featureNoneSelected') }));
    }
    return context;
  }

  private getCoverageBarHint(touch = false): string {
    if (this.getTurboOrganizationId() === -1) return this._owned("Use the numeric ID from your Mapillary organization");
    if (this.getTurboOrganizationId() !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) return this._owned("Zoom closer to view this organization's coverage");
    if (this.state.turboFilterOnFoot !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) return this._owned("Zoom closer for travel-method coverage");
    if (this.state.turboLoading) return this._owned("You can keep exploring while coverage loads");
    const zoom = this.state.jimuMapView?.view?.zoom ?? 0;
    if (this.state.trafficSignsActive || this.state.objectsActive) {
      const feature = this.state.trafficSignsActive && this.state.objectsActive ? "sign or object" : this.state.trafficSignsActive ? "traffic sign" : "object";
      if (zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) return touch
        ? this._owned("Zoom closer, then tap a {value0}", { value0: String(feature) })
        : this._owned("Zoom closer, then hover or click a {value0}", { value0: String(feature) });
      return touch ? this._owned("Tap a {value0} for details", { value0: String(feature) }) : this._owned("Hover or click a {value0} for details", { value0: String(feature) });
    }
    if (zoom < 14) return touch ? this._owned("Tap a coverage line to open imagery") : this._owned("Click a coverage line to open a representative image");
    return touch ? this._owned("Tap a point to open imagery") : this._owned("Hover to preview · Click to open");
  }

  /** Explain actual nearby dots once per tab/widget, using the existing guide bar.
   * No network work, overlay, or playback timer is introduced by this hint.
   */
  private announceNearbyFrames(): void {
    if (this.state.turboModeActive || this._nearbyFramesHintSeen || !this.shouldShowCoverageBar() || this.state.coverageHelpOpen ||
      this.state.isLoading || this.state.coverageFrameResolving || this.state.sequenceRouteLoading ||
      this.state.turboLoading || this.state.turboUpdatingVisible || this.state.selectionError) return;
    const view = this.state.jimuMapView?.view, overlay = this._activeSequenceOverlay;
    if (!view || view.destroyed || view.zoom < LIVE_SEQUENCE_LIMITS.markerZoom || overlay?.view !== view || !overlay.points.size) return;
    // Avoid a hint hidden behind higher-priority feature guidance.
    if (this.getCoverageBarPresentation().text !== "Select another point to explore") return;
    const key = `mapillary-nearby-frames-hint-v1:${this.props.id || 'explorer'}`;
    this._nearbyFramesHintSeen = true;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* Session storage is optional. */ }
    this.setState({ nearbyFramesHintVisible: true });
    this._nearbyFramesHintTimer = setTimeout(() => {
      this._nearbyFramesHintTimer = null; this.setState({ nearbyFramesHintVisible: false });
    }, 7000);
  }

  private closeCoverageHelp() {
    this.setState({ coverageHelpOpen: false }, () => this._coverageHelpButton.current?.focus());
  }

  private shouldShowCoverageNotice(): boolean {
    return !this._coverageNoticeHidden;
  }

  private hideCoverageNotices() {
    this._coverageNoticeHidden = true;
    this.setState({ coverageHelpOpen: false });
    this._turboPickWarning = null;
    this.clearZoomWarning();
  }

  private updateTurboPickWarning(message?: string, action?: "zoom" | "retry", isHelp = false) {
    if (!this.shouldShowCoverageNotice()) return;
    if (message) {
      if (message === this._turboDismissedWarning) return;
      const changedMessage = this._turboPickWarning !== message || this.state.zoomWarningMessage !== message;
      if (changedMessage) this.showZoomWarning(message, 0);
      this._turboPickWarning = message;
      if (changedMessage || this.state.turboWarningAction !== action || this.state.turboWarningIsHelp !== isHelp) this.setState({ turboWarningAction: action, turboWarningIsHelp: isHelp });
    } else {
      if (this._turboPickWarning && this.state.zoomWarningMessage === this._turboPickWarning) this.clearZoomWarning();
      this._turboPickWarning = null;
    }
  }

  private showTurboInteractionHelp() {
    if (!this.state.turboModeActive || !this.turboCoverageLayer) return;
    if (this.getTurboOrganizationId() === -1) { this.updateTurboPickWarning(this._t('appEnterAValidNumericOrganizationId')); return; }
    if (this.getTurboOrganizationId() !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) { this.updateTurboPickWarning(this._t('appZoomCloserToViewThisOrganizationSCoverage'), "show", true); return; }
    if ((this.state.jimuMapView?.view?.zoom ?? 14) < 14) {
      this.updateTurboPickWarning(this._t('appClickACoverageLineOrOverviewPointToOpen'), "zoom", true); return;
    }
    const scene = this.state.jimuMapView?.view?.type === "3d";
    this.updateTurboPickWarning(scene
      ? this._owned("3D: Hover a visible coverage dot to preview; tap or click it to open imagery. Zoom closer or reduce tilt if terrain hides dots.")
      : this._owned("Hover a coverage dot to preview; tap or click it to open imagery. Zoom closer if dots overlap. Lines alone do not select an image."), "zoom", true);
  }

  private dismissTurboInteractionHelp() {
    this._turboDismissedWarning = this.state.zoomWarningMessage === this._turboPickWarning ? this._turboPickWarning : null;
    this.clearZoomWarning();
  }

  private readonly _zoomToImagesTargetHost = {
    imageId: () => this.state.imageId,
    images: () => this.state.sequenceImages,
    fallbackImages: () => this._lastSuccessfulSelection?.sequenceImages,
    graphic: () => this.currentGreenGraphic,
    hasCoverage: () => !!this.turboCoverageLayer,
    pick: (pixel: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, radius: number) => this.pickTurboRepresentative(pixel, view, signal, false, radius),
  };

  private getZoomToImagesTarget(view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<number[] | __esri.Point | null> {
    return zoomToImagesTarget<__esri.Point, __esri.MapView | __esri.SceneView>(view, signal, this._zoomToImagesTargetHost);
  }

  private async handleTurboWarningAction(action: "show" | "data" | "tilt" | "zoom" | "retry" | undefined = this.state.turboWarningAction) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.state.turboModeActive) return;
    if (action === "show" || action === "data" || action === "tilt") {
      try {
        if (action === "show" || action === "data") {
          // Scene buildings obscure feature sprites at the source-tile selection threshold.
          // Use a closer navigation target only; tile loading and hit-test thresholds stay unchanged.
          const targetZoom = action === "data"
            ? (view.type === "3d" ? Math.max(17, ZOOM.FEATURES_INTERACTIVE) : ZOOM.FEATURES_INTERACTIVE)
            : 14;
          let center: number[] | __esri.Point | null = null;
          if (action === "show") {
            const controller = new AbortController();
            const deadline = setTimeout(() => controller.abort(), 2500);
            try { center = await this.getZoomToImagesTarget(view, controller.signal); }
            finally { clearTimeout(deadline); }
            if (this.state.jimuMapView?.view !== view || view.destroyed) return;
          }
          const location = center ? { center } : {};
          if (view.type === "3d") {
            await view.goTo({ ...location, zoom: targetZoom + 0.5, tilt: 0 });
            if (this.state.jimuMapView?.view !== view) return;
            if (view.zoom < targetZoom) await view.goTo({ ...location, zoom: targetZoom + 1, tilt: 0 });
            if (view.zoom < targetZoom) {
              this.updateTurboPickWarning(this._t('appTheSceneCannotReachTheRequiredSelectionZoomCheck'));
              return;
            }
          } else await view.goTo({ ...location, zoom: targetZoom });
        }
        else if (view.type === "3d") await view.goTo({ tilt: 0 });
        if (this.state.jimuMapView?.view === view && this.state.turboModeActive) await this.enableTurboCoverageLayer();
      } catch (error) {
        if ((error as any)?.name !== "AbortError") this.updateTurboPickWarning(this._t('appTheCameraCouldNotReachAnImageSelectionView'));
      }
    } else if (action === "retry") {
      this._turboDismissedWarning = null;
      this._turboIndexAbort.abort();
      this._turboIndexAbort = new AbortController();
      this._turboIndexPending.clear();
      this._turboIndexCache.clear();
      this._turboTileCache.clear();
      this.turboCoverageLayer?.refresh();
      await this.enableTurboCoverageLayer();
    } else if (action === "zoom") {
      if (!Number.isFinite(view.scale) || view.scale <= 0) return;
      const targetScale = Math.max(view.scale / 2, (view as any).constraints?.maxScale || 0);
      if (targetScale >= view.scale) {
        this.updateTurboPickWarning(this._t('appTheMapIsAlreadyAtItsClosestAllowedScale'));
        return;
      }
      try { await view.goTo({ scale: targetScale }); }
      catch (error) {
        if ((error as any)?.name !== "AbortError" && this.state.jimuMapView?.view === view && this.state.turboModeActive) {
          this.updateTurboPickWarning(this._t('appTheMapCouldNotZoomCloserUseTheMap'));
        }
      }
    }
  }

  /** Click-only overview/sequence selection; never fabricates an image hover. */
  private async pickTurboRepresentative(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, preview = false, searchRadius?: number): Promise<__esri.Graphic | null> {
    if (!this.turboCoverageLayer || view.zoom >= 14 || view.stationary === false || signal.aborted) return null;
    if (view.zoom < 6 && (this.state.turboFilterOnFoot !== undefined || this.getTurboOrganizationId() !== undefined)) return null;
    const revision = this._turboRequestCount;
    const radius = searchRadius ?? TURBO_LIMITS.pickRadiusPx;
    const ground = view.toMap(screen) as __esri.Point;
    if (!ground) return null;
    const samples = [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius]].map(([x, y]) => view.toMap({ x: screen.x + x, y: screen.y + y }) as __esri.Point).filter(Boolean);
    const boxes = turboFootprintBboxes(samples.filter(p => p.longitude != null && p.latitude != null).map(p => ({ lon: p.longitude!, lat: p.latitude! })));
    let best = radius * radius;
    let selected: { id: string; sequence?: string; pixel: { x: number; y: number }; geometry: __esri.Point } | null = null;
    const filters = this.getTurboFilters();
    const zoom = Math.max(0, Math.min(14, Math.floor(view.zoom)));
    const seen = new Set<string>();
    for (const box of boxes) for (const tileCoordinates of turboTiles(box, zoom)) {
      const tileKey = tileCoordinates.join("/");
      if (seen.has(tileKey)) continue;
      seen.add(tileKey);
      if (seen.size > 4) return null; // Pointer-local picking never scans a broad scene footprint.
      if (signal.aborted) return null;
      const overview = zoom < 6;
      const cache = this._representativePickCache ??= new RepresentativePickCache();
      const indexed = await cache.get(`${tileKey}/${overview ? "overview" : "sequence"}`, async () => {
        const buffer = await this.getTurboTileBuffer(tileCoordinates, this._turboIndexAbort.signal);
        if (!buffer.byteLength) return null;
        const layer = new VectorTile(new Pbf(new Uint8Array(buffer))).layers[overview ? "overview" : "sequence"];
        return layer ? { length: layer.length, byteLength: buffer.byteLength, feature: (index: number) => layer.feature(index) } : null;
      }, this._turboIndexAbort.signal);
      if (signal.aborted) return null;
      if (!indexed) continue;
      const source = indexed.query(boxes, tileCoordinates);
      const [tx, ty, tz] = tileCoordinates, n = 2 ** tz;
      let pickDeadline = performance.now() + 8, vertexChecks = 0;
      for (let i = 0; i < source.length; i++) {
        if ((i & 31) === 0 && performance.now() >= pickDeadline) {
          await new Promise(resolve => setTimeout(resolve, 0)); if (signal.aborted) return null; pickDeadline = performance.now() + 8;
        }
        const feature = source.feature(i), props = feature.properties;
        if (!turboPointMatches(props, filters)) continue;
        const id = overview ? props.id : props.image_id;
        if (id === undefined || id === null) continue;
        const extent = Number(feature.extent) || 4096;
        for (const path of feature.loadGeometry()) {
          let previous: { x: number; y: number } | null = null;
          for (const vertex of path) {
            if ((++vertexChecks & 255) === 0 && performance.now() >= pickDeadline) {
              await new Promise(resolve => setTimeout(resolve, 0)); if (signal.aborted) return null; pickDeadline = performance.now() + 8;
            }
            const lon = (tx + vertex.x / extent) / n * 360 - 180;
            const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (ty + vertex.y / extent) / n))) * 180 / Math.PI;
            const coords = lonLatToWebMercator(lon, lat);
            if (!coords) { previous = null; continue; }
            const geometry = new this.ArcGISModules.Point({ ...coords, ...(view.type === "3d" ? { z: ground.z || 0 } : {}) });
            const pixel = view.toScreen(geometry);
            if (!pixel) { previous = null; continue; }
            let nearest = pixel;
            if (previous && !overview) {
              const dx = pixel.x - previous.x, dy = pixel.y - previous.y;
              const fraction = Math.max(0, Math.min(1, ((screen.x - previous.x) * dx + (screen.y - previous.y) * dy) / (dx * dx + dy * dy || 1)));
              nearest = { x: previous.x + fraction * dx, y: previous.y + fraction * dy };
            }
            const distance = (nearest.x - screen.x) ** 2 + (nearest.y - screen.y) ** 2;
            if (distance <= best) { best = distance; selected = { id: String(id), sequence: overview ? undefined : String(props.id || ""), pixel: nearest, geometry: overview ? geometry : (view.toMap(nearest) as __esri.Point || ground) }; }
            previous = pixel;
          }
        }
      }
    }
    if (signal.aborted || revision !== this._turboRequestCount || this.state.jimuMapView?.view !== view || !selected) return null;
    // A line selects its representative image, not the frame at the clicked coordinate.
    // Representative guidance is shown inside the imagery loading card, not a competing toast.
    return new this.ArcGISModules.Graphic({ geometry: selected.geometry, attributes: { image_id: selected.id, sequence_id: selected.sequence, turbo_representative: true, turbo_nearest_sequence: !!selected.sequence, turbo_sequence_hover: preview && !!selected.sequence, turbo_screen_x: selected.pixel.x, turbo_screen_y: selected.pixel.y } });
  }

  private async pickTurboGraphic(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, radius: number = TURBO_LIMITS.pickRadiusPx): Promise<__esri.Graphic | null> {
    if (!this.turboCoverageLayer || view.zoom < 14 || view.map.findLayerById(LAYER_IDS.COVERAGE_VT) !== this.turboCoverageLayer) return null;
    const corners = [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius], [0, 0]]
      .map(([dx, dy]) => view.toMap({ x: screen.x + dx, y: screen.y + dy }) as __esri.Point | null)
      .filter((point): point is __esri.Point & { longitude: number; latitude: number } => !!point && point.longitude != null && point.latitude != null && Number.isFinite(point.longitude) && Number.isFinite(point.latitude));
    if (!corners.length) return null;
    // Native circles use a measured source-grid offset; query the raw index with its inverse.
    const displayOffset = nativeCoverageOffsetMeters(ZOOM.TILE_FETCH);
    const boxes = turboFootprintBboxes(nativeCoverageSourceFootprint(corners, ZOOM.TILE_FETCH));
    const revision = this._turboRequestCount;
    const filters = this.getTurboFilters();
    let nearest: TurboPoint | null = null;
    let nearestScreen: { x: number; y: number } | null = null;
    let nearestGeometry: __esri.Point | null = null;
    let bestDistance = radius * radius;
    const projection = new this.ArcGISModules.Point({ x: 0, y: 0, spatialReference: { wkid: 3857 } });
    // The vector tiles are ground-draped in SceneView. The local toMap result
    // supplies terrain height; projecting every candidate at sea level misses
    // dots on elevated terrain. Within this small pick window use that height.
    if (view.type === "3d") projection.z = corners[corners.length - 1].z || 0;
    for (const bbox of boxes) await this.visitTurboPickCoverage(bbox, filters, signal, (point: TurboPoint) => {
      const geometry = lonLatToWebMercator(point.lon, point.lat);
      if (!geometry) return;
      // Presentation only: preserve the raw point and reuse the existing terrain height.
      projection.x = geometry.x + displayOffset;
      projection.y = geometry.y - displayOffset;
      const pixel = view.toScreen(projection);
      if (!pixel) return;
      const distance = (pixel.x - screen.x) ** 2 + (pixel.y - screen.y) ** 2;
      if (distance <= bestDistance) { nearest = point; nearestScreen = { x: pixel.x, y: pixel.y }; nearestGeometry = projection.clone(); bestDistance = distance; }
    });
    if (signal.aborted || revision !== this._turboRequestCount || !nearest || !nearestScreen) return null;
    this.showTurboInteractionHelp();
    const selected = nearest as TurboPoint;
    return new this.ArcGISModules.Graphic({
      geometry: nearestGeometry,
      attributes: {
        oid: selected.imageId, image_id: selected.imageId, sequence_id: selected.sequenceId, captured_at: selected.capturedAt, date_category: selected.year,
        turbo_screen_x: (nearestScreen as { x: number; y: number }).x, turbo_screen_y: (nearestScreen as { x: number; y: number }).y
      },
    });
  }

  /** SDK hit testing is only for actual feature/graphics layers, never Turbo tiles. */
  private async hitTestHoverLayers(view: __esri.MapView | __esri.SceneView, screen: { x: number; y: number }): Promise<any> {
    const layers = [this._pointCloudMapLayer?.layer, this.mapillaryObjectsFeatureLayer, this.mapillaryTrafficSignsFeatureLayer, ...(this._places?.hoverLayers || [])].filter(Boolean) as __esri.Layer[];
    if (!layers.length) return { results: [] };
    try {
      return await view.hitTest(screen, { include: layers });
    } catch (err) {
      this.log("[Hover] Feature hit test failed", err);
      return { results: [] }; // A different layer's failure must not disable Turbo hover.
    }
  }

  /** Register default-off console diagnostics. Reads only existing tile caches when enabled;
   * native style ownership and cancellation belong to the temporary diagnostic module.
   */
  private installCoverageAlignmentDiagnostic() {
    this._coverageAlignmentDiagnostic ??= new NativeCoverageAlignmentDiagnostic({
      id: String(this.props.id || "explorer"),
      read: () => {
        const view = this.state.jimuMapView?.view;
        if (!view) return null;
        return {
          view, layer: this.turboCoverageLayer, revision: this._turboRequestCount,
          geometry: this._turboHoverGraphic?.geometry, overlay: this._turboHoverOverlay,
          sourceZoom: ZOOM.TILE_FETCH, closeZoom: TURBO_LIMITS.closeZoom,
          hybridReady: false, hybridVisible: false, hybridFallback: false
        };
      },
      cached: tile => {
        const key = tile.join("/");
        const index = this._turboIndexCache.get(key);
        const buffer = index?.buffer || this._turboTileCache.get(key);
        if (!buffer?.byteLength) return null;
        const layer = new VectorTile(new Pbf(new Uint8Array(buffer))).layers.image;
        return layer ? { layer, indexed: index ? i => ({ x: index.xs[i], y: index.ys[i] }) : undefined } : null;
      },
      project: (context, lon, lat) => {
        const coordinates = lonLatToWebMercator(lon, lat);
        if (!coordinates || !this.ArcGISModules?.Point) return null;
        const point = new this.ArcGISModules.Point({
          ...coordinates,
          ...(context.view.type === "3d" ? { z: context.geometry?.z || 0 } : {})
        });
        return context.view.toScreen(point);
      },
    });
  }

  private clearTurboHoverDetails(preserveSequenceHighlight = false) {
    this._pendingCoverageHover?.clear();
    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);
    this._coverageFrameHoverTimer = null; this._coverageFrameHoverTarget = null;
    this._coverageFrameLookup?.clearHover();
    this._turboHoverInfoAbort?.abort();
    this._turboHoverInfoAbort = null;
    if (this._hoverTimeout) clearTimeout(this._hoverTimeout);
    this._hoverTimeout = null;
    this._currentHoveredFeatureId = null;
    this._turboHoveredScreen = null;
    if (this.tooltipDiv) { this.tooltipDiv.style.display = "none"; this.tooltipDiv.textContent = ""; }
    this.clearTurboHover();
    if (!preserveSequenceHighlight) this.highlightSequenceOnVTL(null);
  }

  /** One pulse and one metadata request for the image actually under the pointer. */
  private updateTurboHover(graphic: __esri.Graphic, globalX: number, globalY: number) {
    const attrs = graphic.attributes;
    const view = this.state.jimuMapView?.view;
    const imageId = String(attrs?.image_id || "");
    if (!imageId) { this.clearTurboHoverDetails(); return; }
    const changed = this._currentHoveredFeatureId !== imageId;
    // The next point updates membership below; do not clear/rebuild the same
    // sequence's styles while moving between its images.
    if (changed) this.clearTurboHoverDetails(true);
    this._currentHoveredFeatureId = imageId;
    this._turboHoveredScreen = { x: attrs.turbo_screen_x, y: attrs.turbo_screen_y };
    this.showTurboHover(graphic); // Visual feedback never waits for metadata or a tooltip.
    this.highlightSequenceOnVTL(attrs.sequence_id ? String(attrs.sequence_id) : null);
    if (!attrs.turbo_representative) this._coverageSelectionTargets.hover(
      this.coverageSelectionContext(), imageId, graphic.geometry as __esri.Point, attrs.sequence_id);
    this._coverageAlignmentDiagnostic?.capture(graphic, globalX, globalY);
    const previousFrameTarget = this._coverageFrameHoverTarget;
    this.prepareCoverageFrameHover(graphic);
    const regionalHover = !!attrs.turbo_representative && !!attrs.sequence_id && !!view && view.zoom >= 6 && view.zoom < 14;
    const frameTarget = regionalHover ? this._coverageFrameHoverTarget : null;
    const movedOnLine = regionalHover && frameTarget !== previousFrameTarget;
    if ((!changed && !movedOnLine) || !this.tooltipDiv) return;
    // Metadata may change along the same representative line; leave its pulse and picking intact.
    if (movedOnLine && !changed) {
      this._turboHoverInfoAbort?.abort();
      if (this._hoverTimeout) clearTimeout(this._hoverTimeout);
      this._turboHoverBearing?.clear();
    }
    const bounds = this.state.jimuMapView?.view?.container?.getBoundingClientRect();
    positionImageryHoverCard(this.tooltipDiv, bounds || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }, globalX, globalY);
    const controller = new AbortController(); this._turboHoverInfoAbort = controller;
    const finishPreview = this._hoverPreviewStatus?.begin(controller.signal);
    const frames = this.state.sequenceImages || [];
    const sequenceId = attrs.sequence_id ? String(attrs.sequence_id) : undefined;
    const organizationId = this.getTurboOrganizationId();
    const localRoute = !!attrs.turbo_representative && !!sequenceId && organizationId === undefined &&
      this.state.sequenceId === sequenceId && !!this._liveSequenceFrames.complete;
    const isCurrent = () => !controller.signal.aborted && this._currentHoveredFeatureId === imageId &&
      this.state.turboModeActive && this.state.jimuMapView?.view === view && (!regionalHover || this._coverageFrameHoverTarget === frameTarget) &&
      (!localRoute || (this.state.sequenceImages === frames && this.state.sequenceId === sequenceId)) && !!this.tooltipDiv;
    const started = performance.now();
    const dwell = regionalHover ? Math.max(150, TURBO_LIMITS.hoverDetailsDelayMs) : TURBO_LIMITS.hoverDetailsDelayMs;
    const geometry = graphic.geometry as __esri.Point;
    const location = frameTarget?.location || (Number.isFinite(geometry?.longitude) && Number.isFinite(geometry?.latitude)
      ? { lon: geometry.longitude, lat: geometry.latitude } : undefined);
    const localKey = localRoute && location ? JSON.stringify([sequenceId, location.lon, location.lat]) : undefined;
    // Tile hints cannot override the active-route click policy; local hints also bind to the route array.
    const cachedPreviewId = localKey ? this._hoverBearingHints.peek(view, frames, localKey)
      : regionalHover && frameTarget ? this._coverageFrameLookup?.peek(view, sequenceId!, frameTarget.location)
        : !regionalHover && !localRoute ? imageId : undefined;
    const present = (previewId: string, data: any, fallbackDate: any) => {
      if (!isCurrent()) return;
      if (String(data.id) === previewId && this._turboHoverAnchor) {
        this._turboHoverBearing ??= new HoverBearingSector(
          properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'));
        this._turboHoverBearing.show(this._turboHoverAnchor,
          hoverPreviewBearing(data), !!data.is_pano);
      }
      renderImageryHoverCard(this.tooltipDiv, data, fallbackDate, undefined, this._presentation, finishPreview);
      this.highlightSequenceOnVTL(data.sequence || attrs.sequence_id || null);
    };
    const enrich = async (previewId: string, cached: any, fallbackDate: any) => {
      if (!isCurrent()) return;
      try {
        const responseData = await this.runSequenceBackground(async signal => {
          const response = await fetch(`${GRAPH_API.BASE}/${previewId}?fields=id,sequence,geometry,creator,captured_at,thumb_256_url,computed_compass_angle,compass_angle,is_pano`, {
            headers: { Authorization: `OAuth ${this.accessToken}` }, signal,
          });
          if (!response.ok) throw new Error(`Image details: HTTP ${response.status}`);
          return response.json();
        }, controller.signal, 'hover');
        if (!isCurrent()) return;
        const data = mergeHoverBearingMetadata(cached, responseData, previewId);
        this._turboMetadataCache.set(previewId, data);
        present(previewId, data, fallbackDate);
      } catch (error) {
        if (isCurrent()) renderImageryHoverCard(this.tooltipDiv, cached || null, fallbackDate, undefined, this._presentation, finishPreview);
      }
    };
    const resolvePreview = async () => {
      this._hoverTimeout = null;
      if (!isCurrent()) return;
      try {
        if (!cachedPreviewId) renderImageryHoverCard(this.tooltipDiv, null, undefined, true, this._presentation, finishPreview);
        const previewId = cachedPreviewId || await hoverBearingImageId({
          imageId, sequenceId,
          representative: !!attrs.turbo_representative, zoom: view?.zoom ?? 0, location,
          activeSequence: this.state.sequenceId, loadedRoute: !!this._liveSequenceFrames.complete,
          frames, organizationId, signal: controller.signal,
          distance: distanceMeters, lookup: (sequence, point, signal) => this.ensureCoverageFrameLookup().resolve(view, sequence, point, signal)
        });
        if (!isCurrent()) { finishPreview?.(); return; }
        if (!previewId) { renderImageryHoverCard(this.tooltipDiv, null, undefined, false, this._presentation, finishPreview); return; }
        if (localKey) this._hoverBearingHints.remember(view, frames, localKey, previewId);
        const fallbackDate = previewId === imageId ? attrs.captured_at : undefined;
        const entry = this._turboMetadataCache.get(previewId);
        const cached = entry && String(entry.id) === previewId ? entry : undefined;
        if (cached && !needsHoverBearingMetadata(cached)) { present(previewId, cached, fallbackDate); return; }
        // Cached thumbnails/text are useful immediately; only missing network enrichment waits.
        renderImageryHoverCard(this.tooltipDiv, cached, fallbackDate, !cached, this._presentation, cached?.thumb_256_url ? finishPreview : undefined);
        const remaining = dwell - (performance.now() - started);
        if (remaining > 0) this._hoverTimeout = setTimeout(async () => {
          this._hoverTimeout = null;
          await enrich(previewId, cached, fallbackDate);
        }, remaining);
        else await enrich(previewId, cached, fallbackDate);
      } catch (error) {
        if (isCurrent()) renderImageryHoverCard(this.tooltipDiv, null, undefined, undefined, this._presentation, finishPreview);
      }
    };
    // Use the TTL-aware cache contract; TurboMetadataCache is not a Map.
    if (cachedPreviewId && this._turboMetadataCache.get(cachedPreviewId) !== undefined) void resolvePreview();
    else this._hoverTimeout = setTimeout(resolvePreview, dwell);
  }

  private disableTurboCoverageLayer(restoreStyle = true) {
    this._coverageHoverResume?.leave();
    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();
    this.setState({ coverageFrameResolving: false });
    this._nativeSequenceSelection.detach();
    this._turboMetadataCache.clear();
    this._representativePickCache?.clear();
    this.clearTurboHoverDetails();
    this.updateTurboPickWarning();
    this._turboDismissedWarning = null;
    this._turboAbortController?.abort();
    this._turboHoverPickAbort?.abort();
    this._turboClickPickAbort?.abort();
    this._turboAbortController = null;
    this._turboHoverPickAbort = null;
    this._turboClickPickAbort = null;
    this._turboRequestCount++;
    this.clearTurboHover();
    this.highlightHandle?.remove();
    this.highlightHandle = null;
    if (this._hoverTimeout) clearTimeout(this._hoverTimeout);
    this._hoverTimeout = null;
    this._currentHoveredFeatureId = null;
    if (this.tooltipDiv) this.tooltipDiv.style.display = "none";
    const map = this.state.jimuMapView?.view?.map;
    const layer = this.turboCoverageLayer;
    // A view transition cancels interaction work without restyling a retiring renderer.
    if (layer && restoreStyle) {
      if (this._turboCoverageAdded) map?.remove(layer);
      if (this._turboCoverageOriginalStyle && !(layer as any).destroyed) {
        const originalStyle = this._turboCoverageOriginalStyle;
        this._turboLoadTask = this._turboLoadTask.then(() => layer.loadStyle(originalStyle)).then(() => undefined).catch(err => console.warn("[Turbo] Coverage style restore failed", err));
      }
    }
    this._turboCoverageAdded = false;
    this._turboCoverageOriginalStyle = null;
    this.turboCoverageLayer = null;
    this.turboCoverageLayerView = null;
    this._turboIndexAbort.abort();
    this._turboIndexAbort = new AbortController();
    this._turboIndexPending.clear();
    this._turboIndexCache.clear();
    this._turboTileCache.clear();
    this._sharedTileRequests.clear(); this._sequenceTileIndex.clear();
    this._loadedTurboFiltersKey = "";
    this.finishTurboLoading();
  }

  /**
   * Show one pointer-local coverage marker, reusing it for the same image.
   * Prefer a DOM pulse anchored to the view, with a graphic fallback when a DOM host is unavailable.
   * @param graphic Resolved coverage pick; its identity and geometry define the hover target.
   */
  private showTurboHover(graphic: __esri.Graphic) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;
    const oid = graphic.attributes?.oid ?? graphic.attributes?.image_id;
    if (this._lastHoveredTurboOid === oid && this._turboHoverGraphic) { this._turboHoverGraphic.geometry = graphic.geometry; return; }
    this.clearTurboHover(); this._lastHoveredTurboOid = oid;
    const hover = new this.ArcGISModules.Graphic({
      geometry: graphic.geometry, symbol: view.type === "3d" ? {
        type: "point-3d", symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color: [165, 42, 42, 0.95] }, size: 6, outline: { color: "white", size: 1.5 } }],
      } : { type: "simple-marker", style: "circle", color: [165, 42, 42, 0.95], size: 6, outline: { color: "white", width: 1.5 } }
    });
    (hover as any).__isTurboHover = true;
    this._turboHoverGraphic = hover;
    const host = view.container as HTMLElement;
    if (host && typeof host.appendChild === "function" && typeof document !== "undefined") {
      const overlay = document.createElement("div"); overlay.setAttribute("aria-hidden", "true");
      Object.assign(overlay.style, { position: "absolute", pointerEvents: "none", zIndex: "9", width: "6px", height: "6px", border: "1.5px solid white", borderRadius: "50%", boxSizing: "border-box", background: "rgba(165,42,42,0.95)", transform: "translate(-50%,-50%)", display: "none" });
      const anchor = document.createElement("div"); anchor.setAttribute("aria-hidden", "true");
      Object.assign(anchor.style, { position: "absolute", pointerEvents: "none", zIndex: "9", width: "60px", height: "60px", transform: "translate(-50%,-50%)", display: "none" });
      // Siblings share a fixed center. Only the brown disk changes dimensions.
      Object.assign(overlay.style, { left: "30px", top: "30px", zIndex: "1", display: "block" });
      anchor.appendChild(overlay); host.appendChild(anchor);
      this._turboHoverAnchor = anchor; this._turboHoverOverlay = overlay;
    } else {
      this._turboHoverGraphicsLayer = null;
      this._ownedMapResources.addGraphic(view, hover);
    }
    const started = performance.now();
    const projection = new HoverAnchorProjection<__esri.Point, __esri.MapView | __esri.SceneView>();
    let positionAnchor: HTMLElement | null = null, positionX = NaN, positionY = NaN;
    const animate = (now: number) => {
      if (this._turboHoverGraphic !== hover || this.state.jimuMapView?.view !== view || view.destroyed) return;
      const size = 8.5 - 2.5 * Math.cos((now - started) * Math.PI * 2 / 1200);
      const overlay = this._turboHoverOverlay;
      if (overlay) {
        const p = projection.project(view, hover.geometry as __esri.Point);
        const visible = p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0 && p.x <= view.width && p.y <= view.height;
        const anchor = this._turboHoverAnchor;
        if (anchor) {
          const display = visible ? "block" : "none";
          if (anchor.style.display !== display) anchor.style.display = display;
          if (visible) {
            if (positionAnchor !== anchor) { positionAnchor = anchor; positionX = positionY = NaN; }
            if (positionX !== p.x) { anchor.style.left = `${p.x}px`; positionX = p.x; }
            if (positionY !== p.y) { anchor.style.top = `${p.y}px`; positionY = p.y; }
          }
        }
        if (visible) { overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }
        this._turboHoverBearing?.update(view, hover.geometry, visible ? p : null, now);
      } else {
        const symbol = hover.symbol as any;
        if (view.type === "3d") (symbol.symbolLayers.getItemAt?.(0) || symbol.symbolLayers[0]).size = size; else symbol.size = size;
      }
      this._turboHoverFrame = requestAnimationFrame(animate);
    };
    this._turboHoverFrame = requestAnimationFrame(animate);
  }

  /**
   * Clears the turbo hover animation and removes the hover graphic from the map.
   * This stops the pulse animation and resets hover state.
   */
  private clearTurboHover() {
    this._coverageAlignmentDiagnostic?.clearHover();
    this._coverageSelectionTargets.clearHover();
    if (this._turboHoverFrame != null) cancelAnimationFrame(this._turboHoverFrame);
    this._turboHoverFrame = null;
    this._turboHoverBearing?.clear(); this._turboHoverBearing = null;
    this._turboHoverOverlay?.remove(); this._turboHoverOverlay = null;
    this._turboHoverAnchor?.remove(); this._turboHoverAnchor = null;
    if (this._turboHoverInterval) {
      clearInterval(this._turboHoverInterval);
      this._turboHoverInterval = null;
    }
    if (this._turboHoverGraphic) {
      const view = this.state.jimuMapView?.view;
      if (this._turboHoverGraphicsLayer) this._turboHoverGraphicsLayer.remove(this._turboHoverGraphic);
      else view?.graphics?.remove(this._turboHoverGraphic);
      this._turboHoverGraphic = null;
    }
    this._turboHoverGraphicsLayer = null;
    this._lastHoveredTurboOid = null;
  }

  // Toggles the year filter on the existing Turbo layer
  private handleYearLegendClick = (year: string) => {
    // Toggle: if clicking the already selected year, turn it off (null). Otherwise, select it.
    const newYear = this.state.selectedTurboYear === year ? null : year;

    this.setState({ selectedTurboYear: newYear }, () => {
      if (this.state.turboModeActive) void this.enableTurboCoverageLayer();
    });
  };

  // Toggles which quality band the Quality legend isolates on the coverage VTL.
  // Like the year legend, the quality
  // bands are separate style layers baked into the VTL's style JSON, so
  // isolating one means rebuilding the layer with only that band's
  // sequence/image entries, see initMapillaryLayer's showBand() gate.
  private handleQualityLegendClick = (band: "good" | "fair" | "poor" | "unscored") => {
    const newBand = this.state.selectedQualityBand === band ? null : band;
    this.setState({ selectedQualityBand: newBand }, async () => {
      if (!this.state.qualityViewActive) return;
      if (this.state.turboModeActive) { await this.enableTurboCoverageLayer(); return; }
      if (!this.state.tilesActive) return;

      let creatorId: number | undefined;
      const username = this.state.turboFilterUsername?.trim() || this.props.config.turboCreator;
      if (username) {
        creatorId = (await this.getUserIdFromUsername(username)) || undefined;
      }

      this.rebuildCoverageLayer(
        creatorId,
        this.state.turboFilterStartDate || undefined,
        this.state.turboFilterEndDate || undefined,
        this.state.turboFilterIsPano,
        this.state.qualityViewActive,
        newBand,
      );
    });
  };

  // #endregion TURBO MODE

  // #region STREET COVERAGE ANALYSIS

  private runCoverageAnalysis = () => this._coverageAnalysis.run();

  /** Draws road segments on the map using four distinct coverage tiers (fresh, aging, stale, none). */
  private async drawCoverageSegments() {
    const view = this.state.jimuMapView?.view;
    if (!view || !this._coverageSegments.length) return;
    this.stopCoverageRendering();
    const revision = this._coverageRenderRevision;
    this.setState({ coverageSegmentsVisible: true });
    try {
      const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
      if (revision !== this._coverageRenderRevision || this.state.jimuMapView?.view !== view || !this.state.coverageSegmentsVisible) return;
      this._coverageRenderView = view;
      this._coverageSegmentsLayer = new GraphicsLayer({ id: "coverage-segments-layer", title: "Classified Street Coverage", listMode: "hide" });
      view.map.add(this._coverageSegmentsLayer);
      this._coverageRenderWatch = view.watch("stationary", (stationary: boolean) => { if (stationary) void this.refreshCoverageViewport(view); });
      await this.refreshCoverageViewport(view);
    } catch (error) {
      if (revision === this._coverageRenderRevision) { this.stopCoverageRendering(); this.setState({ coverageSegmentsVisible: false }); this.showToast(this._t('appUnableToInitializeClassifiedStreets'), 4000); }
    }
  }

  // COVERAGE SEGMENT CLEARING
  /**
   * Removes the coverage layer.
   * resetTiers=false: remove graphics but preserve analysis data.
   * resetTiers=true: completely discard analysis data.
   */
  private clearCoverageSegments(resetTiers: boolean = false) {
    this.stopCoverageRendering();

    // Hiding the overlay preserves the generated route; full dismissal clears it.
    if (resetTiers) {
      this.cancelCoverageAnalysis();
      this.clearCaptureRoute();
      this._coverageSegmentTiers = [];

      this._coverageCoveredFlags = [];

      this._coverageSegments = [];

      this._coverageAnalysisBbox = null;

      this.clearCoverageZone();
    }

    this.setState({ coverageSegmentsVisible: false });
  }

  /**
   * Clears analysis/results that belong to the previous MapView.
   *
   * Coverage analysis and capture routes are derived from the
   * active 2D/3D view, so they must not survive a dimension switch.
   *
   * A/B coordinates are intentionally preserved so the user
   * does not need to select them again.
   */
  private clearViewDependentAnalysis = () => {
    this.cancelCaptureRouteGeneration();
    this.cancelCoverageAnalysis();
    this.stopCoverageRendering();
    const oldView = this.state.jimuMapView?.view;

    /*
     * COVERAGE SEGMENT LAYER
     */
    if (this._coverageSegmentsLayer) {
      try {
        if (oldView?.map && oldView.map.layers.includes(this._coverageSegmentsLayer)) {
          oldView.map.remove(this._coverageSegmentsLayer);
        }

        this._coverageSegmentsLayer.destroy();
      } catch (e) {
        // Old view may already be disposing.
      }

      this._coverageSegmentsLayer = null;
    }

    /*
     * COVERAGE ANALYSIS ZONE
     */
    if (this._coverageZoneGraphic) {
      try {
        oldView?.graphics?.remove(this._coverageZoneGraphic);
      } catch (e) {
        // Ignore view disposal errors.
      }

      this._coverageZoneGraphic = null;
    }

    /*
     * CAPTURE ROUTE LAYER
     */
    if (this._routeGraphicLayer) {
      try {
        if (oldView?.map && oldView.map.layers.includes(this._routeGraphicLayer)) {
          oldView.map.remove(this._routeGraphicLayer);
        }

        this._routeGraphicLayer.destroy();
      } catch (e) {
        // Ignore disposal errors.
      }

      this._routeGraphicLayer = null;
    }

    /*
     * OLD A/B GRAPHICS
     * Keep the coordinates in state, but discard graphics
     * belonging to the old MapView. They will be redrawn
     * in restoreMapGraphics().
     */
    if (this._routePointAGraphic) {
      try {
        oldView?.graphics?.remove(this._routePointAGraphic);
      } catch (e) { }

      this._routePointAGraphic = null;
    }

    if (this._routePointBGraphic) {
      try {
        oldView?.graphics?.remove(this._routePointBGraphic);
      } catch (e) { }

      this._routePointBGraphic = null;
    }

    /*
     * DISCARD ANALYSIS DATA
     */
    this._coverageSegments = [];
    this._coverageCoveredFlags = [];
    this._coverageSegmentTiers = [];
    this._coverageAnalysisBbox = null;

    /*
     * RESET ANALYSIS UI
     */
    this.setState({
      coverageAnalysisLoading: false,

      coverageResult: null,

      coverageSegmentsVisible: false,

      routeData: null,

      isGeneratingRoute: false,

      routeGenerationProgress: null,

      routePickMode: null,
    });
  };

  /** Draws the inner analysis bounding box polygon. */
  private drawCoverageZone(innerBbox: [number, number, number, number]) {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules) return;

    this.clearCoverageZone();

    const [west, south, east, north] = innerBbox;
    const { Graphic } = this.ArcGISModules;

    const is3D = jimuMapView.view.type === "3d";

    const zoneGraphic = new Graphic(coverageZoneProperties(west, south, east, north, is3D));

    (zoneGraphic as any).__isCoverageZone = true;
    this._ownedMapResources.addGraphic(jimuMapView.view, zoneGraphic);
    this._coverageZoneGraphic = zoneGraphic;
  }

  /** Removes the analysis bounding box graphic. */
  private clearCoverageZone() {
    if (this._coverageZoneGraphic) {
      const view = this.state.jimuMapView?.view;
      if (view) view.graphics.remove(this._coverageZoneGraphic);
      this._coverageZoneGraphic = null;
    }
  }

  /** Toggles the road network coverage overlay on the map. */
  private toggleCoverageSegments = () => {
    if (this.state.coverageSegmentsVisible) this.clearCoverageSegments(false);
    else this.drawCoverageSegments();
  };

  /** Score the current analysis snapshot without owning calculation details. */
  private buildCaptureTargetSegments = (): RouteTargetSegment[] => scoreCaptureTargets(
    this._coverageSegments, this._coverageSegmentTiers, this.state.jimuMapView?.view?.center,
    this._coverageAnalysisBbox, this.CAPTURE_ROUTE_CONFIG,
  );

  /** Validate the A/B endpoints and delegate capture-route generation to the selected routing-provider pipeline. */
  private generateCaptureRoute = async () => {
    const { routeStartPoint, routeEndPoint, routeSpareMinutes } = this.state;

    if (!routeStartPoint || !routeEndPoint) {
      this.showToast(this._t('appLTfenHaritadanABaLangVeBBiti'), 3500);
      return;
    }

    await this.generateEsriDetourRoute(routeStartPoint, routeEndPoint, routeSpareMinutes || 15);
  };

  /** Draws the generated route onto the map with a purple line and outer glow effect. */
  private async drawCaptureRoute(pathsData: unknown, current: () => boolean = () => true) {
    await renderCaptureRouteGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView>(pathsData, current, {
      view: () => this.state.jimuMapView?.view,
      modules: () => this.ArcGISModules,
      layer: () => this._routeGraphicLayer,
      setLayer: layer => { this._routeGraphicLayer = layer; },
      loadLayerModules: () => loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]),
    });
  }

  // CLEAR CAPTURE ROUTE
  private clearCaptureRoute = () => {
    this.cancelCaptureRouteGeneration();
    if (this._routeGraphicLayer) this._routeGraphicLayer.removeAll();
    this.setState({ routeData: null });
  };

  // Exports the generated route as a GPX file.
  private _stopRoutePreview: (() => void) | null = null;
  private downloadRouteGPX = () => downloadCaptureRouteGPX(this.state.routeData);

  // Routing service discovery and provider adapters. Run ownership stays with route generation.

  /**
   * Resolves the route service advertised by the current
   * ArcGIS Online / Enterprise portal.
   *
   * Portal() automatically uses Experience Builder's configured
   * portal through the ArcGIS Maps SDK environment.
   */
  private resolvePortalRouteService = async (): Promise<string | null> => discoverPortalRoutingService(
    () => loadArcGISJSAPIModules(["esri/portal/Portal"]),
    (...args) => console.warn(...args),
  );

  /** Apply the selected engine's World/auth, explicit portal or custom-service policy. */
  private resolveRoutingProvider = async (): Promise<ResolvedRoutingProvider> => resolveCaptureRoutingProvider({
    routingEngine: this.getEffectiveRoutingEngine(),
    config: this.props.config,
    discoverPortalRouteService: () => this.resolvePortalRouteService(),
  });

  private isRoutingAuthenticationError = (error: any): boolean => isRoutingAuthenticationFailure(error);

  /** Build the selected routing provider with live SDK/session adapters; the route run owns request cancellation. */
  private createCaptureRoutingProvider = async (): Promise<RoutingProvider> => createCaptureProvider({
    routingEngine: this.getEffectiveRoutingEngine(),
    config: this.props.config,
    resolveArcGIS: () => this.resolveRoutingProvider(),
    modules: () => this.ArcGISModules,
    travelMode: () => this.state.routeTravelMode,
    log: message => this.log(message),
  });

  private readonly _routeGeneration = new RouteGeneration();
  private _captureRouteLoginView: { type: string; viewpoint: __esri.Viewpoint } | null = null;
  private releaseCaptureRouteLoginView() {
    if (this._captureRouteLoginView && this._routingLoginView === this._captureRouteLoginView) {
      this._routingLoginView = null;
      if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
      this._routingLoginExpiry = null;
    }
    this._captureRouteLoginView = null;
  }
  /** Invalidate the active route run before clearing generation feedback and releasing its temporary login-view snapshot. */
  private cancelCaptureRouteGeneration = () => {
    if (!this._routeGeneration.cancel()) return;
    this.releaseCaptureRouteLoginView();
    if (!this._startupDisposed) this.setState({ isGeneratingRoute: false, routeGenerationProgress: null });
  };

  private _routingLoginExpiry: ReturnType<typeof setTimeout> | null = null;
  private _coverageOwnerMap: __esri.Map | null = null;

  private coverageLayerForView(view: __esri.MapView | __esri.SceneView): __esri.VectorTileLayer {
    const existing = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | undefined;
    if (existing && !existing.destroyed) { this._coverageOwnerMap = view.map; this.mapillaryVTLayer = existing; return existing; }
    if (existing) view.map.remove(existing);
    const reusable = this.mapillaryVTLayer && !this.mapillaryVTLayer.destroyed && (!this._coverageOwnerMap || this._coverageOwnerMap === view.map);
    const layer = reusable ? this.mapillaryVTLayer : new this.ArcGISModules.VectorTileLayer({ id: LAYER_IDS.COVERAGE_VT, title: "Mapillary Coverage", style: turboTileStyle(`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`, {}, false, [], YEAR_COLOR_PALETTE) });
    if (!reusable) this._ownedMapResources.ownLayer(layer);
    view.map.add(layer);
    this._coverageOwnerMap = view.map; this.mapillaryVTLayer = layer;
    return layer;
  }

  private _routingLoginView: { type: string; viewpoint: __esri.Viewpoint } | null = null;

  /** Snapshot the active viewpoint for routing authentication; preserve scene camera details through a clone. */
  private rememberRoutingLoginView() {
    if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
    this._routingLoginExpiry = null;
    const view = this.state.jimuMapView?.view;
    this._routingLoginView = view?.viewpoint ? { type: view.type, viewpoint: view.viewpoint.clone() } : null;
  }

  /** Restore a pre-login viewpoint only while the same route run and compatible active view still own it. */
  private async restoreRoutingLoginView(view: __esri.MapView | __esri.SceneView, current: () => boolean = () => true): Promise<void> {
    const saved = this._routingLoginView;
    if (!current() || !saved || !view || view.type !== saved.type || view.destroyed) return;
    try {
      await view.when();
      if (!current() || this._routingLoginView !== saved || this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
      // A cloned Viewpoint retains 3D camera position, heading and tilt as well as scale.
      await view.goTo(saved.viewpoint.clone(), { animate: false });
    } catch (error) {
      if ((error as any)?.name !== "AbortError") console.warn("[CaptureRoute] Could not restore the pre-sign-in viewpoint:", error);
    }
  }

  /** Bind local route preparation without moving provider awaits or run ownership. */
  private readonly _captureRoutePreparationHost: CaptureRoutePreparationHost = {
    targets: () => this.buildCaptureTargetSegments(),
    config: () => this.CAPTURE_ROUTE_CONFIG,
    log: (...args) => this.log(...args),
    notify: (reason, spareMinutes) => {
      if (reason === 'targets') this.showToast(this._t('appNoStaleOrMissingRoadsFoundInThisAnalysis'), 3500);
      else if (reason === 'corridor') this.showToast(this._t('appNoSuitableStaleMissingRoadsFoundNearYourA'), 4500);
      else this.showToast(<OwnedMessage source={"No beneficial capture detour found within {value0} minutes."} values={{ value0: String(spareMinutes) }} />, 4000);
    },
    progress: (usedMinutes, budgetMinutes) => this.setState({ routeGenerationProgress: { usedMinutes, budgetMinutes } }),
  };

  /** Bind one route run to UI/camera/ownership operations without exposing the widget to the optimizer. */
  private captureRouteExecutionHost(routeView: __esri.MapView | __esri.SceneView): CaptureRouteExecutionHost {
      return {
          createProvider: () => this.createCaptureRoutingProvider(),
          config: () => this.CAPTURE_ROUTE_CONFIG,
          preparation: this._captureRoutePreparationHost,
          coverageInput: () => ({ coverageSegments: this._coverageSegments?.length ?? 0,
              coverageTiers: this._coverageSegmentTiers ? {
                  fresh: this._coverageSegmentTiers.filter(tier => tier === 'fresh').length,
                  aging: this._coverageSegmentTiers.filter(tier => tier === 'aging').length,
                  stale: this._coverageSegmentTiers.filter(tier => tier === 'stale').length,
                  none: this._coverageSegmentTiers.filter(tier => tier === 'none').length,
              } : null }),
          progress: (usedMinutes, budgetMinutes) => this.setState({ routeGenerationProgress: { usedMinutes, budgetMinutes } }),
          log: (...args) => this.log(...args),
          warn: (...args) => console.warn(...args),
          consoleWarn: (...args) => console.warn(...args),
          restoreCamera: current => this.restoreRoutingLoginView(routeView, current),
          draw: (paths, current) => this.drawCaptureRoute(paths, current),
          publish: data => this.setState({ routeData: data }),
          ready: (extraMinutes, usefulKilometers) => this.showToast(<OwnedMessage source="🚗 Capture Route Ready · {minutes} min detour · {distance} km useful coverage" values={{ minutes: this._presentation.number(extraMinutes, { maximumFractionDigits: 0 }), distance: this._presentation.number(usefulKilometers, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}/>, 5000),
          error: err => {
              console.error("[CaptureRoute] Error:", err);
              const message = err instanceof Error ? err.message : String(err);
              if (message.startsWith("Routing is not configured") || message.startsWith("No routing service is configured")) {
                  this.showToast(message, 6000);
              }
              else if (this.isRoutingAuthenticationError(err)) {
                  this.showToast(<OwnedMessage source="Routing authorization failed. Sign in to ArcGIS or ask the Experience author to configure a routing API key."/>, 6500);
              }
              else {
                  this.showToast(this._t('appCouldNotGenerateCaptureRoute'), 4000);
              }
          },
          retainLoginWindow: () => {
              const snapshot = this._routingLoginView;
              if (snapshot)
                  this._routingLoginExpiry = setTimeout(() => {
                      if (this._routingLoginView === snapshot)
                          this._routingLoginView = null;
                      this._routingLoginExpiry = null;
                  }, 15000);
          },
          finish: run => {
              const stillCurrent = run.current();
              if (this._routeGeneration.finish(run)) {
                  if (!stillCurrent)
                      this.releaseCaptureRouteLoginView();
                  this._captureRouteLoginView = null;
                  if (!this._startupDisposed)
                      this.setState({ isGeneratingRoute: false, routeGenerationProgress: null });
              }
          },
      };
  }

  /**
   * Start an owned route execution through the routing feature.
   * Forward its promise directly; pre-run failures retain the prior rejected-promise contract.
   * The RouteGeneration run owns provider requests and guards every asynchronous publication/drawing boundary.
   * Only the current run may publish route results, restore its login camera or clear its busy state.
   * @param startPt Start coordinate as [longitude, latitude] in WGS84 degrees.
   * @param endPt End coordinate as [longitude, latitude] in WGS84 degrees.
   * @param spareMinutes Additional travel-time budget beyond the direct route, in minutes.
   */
  private generateEsriDetourRoute = (startPt: [
      number,
      number
  ], endPt: [
      number,
      number
  ], spareMinutes: number): Promise<void> => {
      try {
          const { jimuMapView } = this.state;
          if (!jimuMapView?.view?.map || jimuMapView.view.destroyed) {
              this.showToast(this._t('appMapViewIsReconnectingWaitForTheMapThen'), 4500);
              return Promise.resolve();
          }
          if (!this._coverageSegments || this._coverageSegments.length === 0) {
              this.showToast(this._t('appRunStreetCoverageAnalysisFirst'), 3000);
              return Promise.resolve();
          }
          if (!this.ArcGISModules || this.state.isGeneratingRoute)
              return Promise.resolve();
          const routeView = jimuMapView.view, routeMap = routeView.map;
          const segments = this._coverageSegments, tiers = this._coverageSegmentTiers, bbox = this._coverageAnalysisBbox;
          const config = this.props.config, start = this.state.routeStartPoint, end = this.state.routeEndPoint;
          const travelMode = this.state.routeTravelMode, engine = this.state.routingEngineOverride, budget = this.state.routeSpareMinutes;
          const run = this._routeGeneration.begin(() => !this._startupDisposed && this.props.state !== 'CLOSED' && this.props.visible !== false &&
              this.state.jimuMapView?.view === routeView && routeView.map === routeMap && !routeView.destroyed &&
              this._coverageSegments === segments && this._coverageSegmentTiers === tiers && this._coverageAnalysisBbox === bbox && !this.state.coverageAnalysisLoading &&
              this.props.config === config && this.state.routeStartPoint === start && this.state.routeEndPoint === end &&
              this.state.routeTravelMode === travelMode && this.state.routingEngineOverride === engine && this.state.routeSpareMinutes === budget);
          if (this.getEffectiveRoutingEngine() !== "osrm")
              this.rememberRoutingLoginView();
          this._captureRouteLoginView = this.getEffectiveRoutingEngine() !== "osrm" ? this._routingLoginView : null;
          this.setState({
              isGeneratingRoute: true,
              routeData: null,
              routeGenerationProgress: null,
          });
          return executeCaptureRoute({ startPt, endPt, spareMinutes, run }, this.captureRouteExecutionHost(routeView));
      }
      catch (error) {
          return Promise.reject(error);
      }
  };

  /** Draws Point A (Green) or Point B (Red) marker. Uses vertical offset and callout in 3D to avoid occlusion by buildings. */
  private drawRoutePointMarker = (type: "start" | "end", lon: number, lat: number) => {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;
    const { Graphic, Point } = this.ArcGISModules;

    const isStart = type === "start";
    const is3D = (view as any).type === "3d";
    const graphicRef = isStart ? this._routePointAGraphic : this._routePointBGraphic;
    if (graphicRef) view.graphics.remove(graphicRef);

    const pointGraphic = createRoutePointGraphic<__esri.Graphic, __esri.Point>({ isStart, is3D, lon, lat, Graphic, Point });

    this._ownedMapResources.addGraphic(view, pointGraphic);
    if (isStart) this._routePointAGraphic = pointGraphic;
    else this._routePointBGraphic = pointGraphic;
  };

  /** Sets Point A or Point B coordinates in state and updates map marker. */
  private setRoutePoint = (type: "start" | "end", coords: [number, number]) => {
    this.cancelCaptureRouteGeneration();
    this.drawRoutePointMarker(type, coords[0], coords[1]);
    if (type === "start") {
      this.setState({ routeStartPoint: coords, routePickMode: null });
      this.showToast(this._t('appStartPointASet'), 2000);
    } else {
      this.setState({ routeEndPoint: coords, routePickMode: null });
      this.showToast(this._t('appDestinationPointBSet'), 2000);
    }
  };

  /** Clears route markers, generated route graphics, and resets A/B state. */
  private resetRoutePoints = () => {
    const view = this.state.jimuMapView?.view;
    if (view) {
      if (this._routePointAGraphic) {
        view.graphics.remove(this._routePointAGraphic);
        this._routePointAGraphic = null;
      }
      if (this._routePointBGraphic) {
        view.graphics.remove(this._routePointBGraphic);
        this._routePointBGraphic = null;
      }
    }
    this.clearCaptureRoute();
    this.setState({ routeStartPoint: null, routeEndPoint: null, routePickMode: null });
  };

  private getEffectiveRoutingEngine = (): RoutingEngine => {
    return (this.state.routingEngineOverride ?? this.props.config.routingEngine ?? "world") as RoutingEngine;
  };

  private handleRuntimeRoutingEngineChange = (engine: "world" | "osrm") => {
    const change = planRuntimeRoutingEngineChange(engine, this.state);
    if (!change) return;
    if (this._routeGraphicLayer) this._routeGraphicLayer.removeAll();
    this.setState(change.patch);
    this.log(change.message);
  };

  private handleRuntimeTravelModeChange = (mode: CaptureTravelMode) => {
    const change = planRuntimeTravelModeChange(mode, this.state);
    if (!change) return;
    if (this._routeGraphicLayer) this._routeGraphicLayer.removeAll();
    this.setState(change.patch);
    this.log(change.message);
  };

  // #endregion STREET COVERAGE ANALYSIS

  // #region POINT CLOUD

  /** Present a recoverable acquisition issue; the owner counts automatic failures.
   * A retained previous cloud remains visible while the status card offers recovery.
   */
  private recordPointCloudIssue = (message: string, automatic: boolean, toastMessage = message) => {
    this._localizedCloudSummary = undefined;
    const paused = this._pointCloudAcquisition.recordIssue(automatic);
    const text = paused ? "Auto-follow paused after 3 problem images. Resume to try again. " + message : message;
    this.setState({ pointCloudAutoPaused: !!paused, pointCloudLoading: false, pointCloudVisible: !!this._pointCloudAcquisition.result, pointCloudPrevious: !!this._pointCloudAcquisition.result && this._pointCloudAcquisition.result.imageId !== this.state.imageId, pointCloudAvailable: undefined, pointCloudIncomplete: true, pointCloudSummary: text });
    this.showToast(paused ? <OwnedMessage source={"Auto-follow paused after 3 problem images. Use Resume in the cloud status card."} /> : toastMessage, 5000);
  };

  /** Forward load intent; acquisition serializes transport and waits for pending map edits. */
  private loadPointCloudLayer = (isAutoLoading: boolean = false, forceDiscovery = false) =>
    this._pointCloudAcquisition.load(isAutoLoading, forceDiscovery);

  /** Acquisition has validated request identity; apply its result synchronously through the feature. */
  private acceptPointCloudResult(result: PointCloudResult | null, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {
    this._pointCloudResult.apply(result, session);
  }

  /** Forward guarded acquisition progress with the original toast owner and duration. */
  private showPointCloudProgress(status: string, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {
    showPointCloudProgressFeedback((...args) => this.showToast(...args), status, session.automatic);
  }

  /**
   * Forward current cloud/view/tool state to the adaptive display owner.
   * The map-layer owner applies geometry edits; this adapter supplies display-policy inputs.
   */
  private updatePointCloudDisplay = () => {
    this._pointCloudAdaptiveDisplay ??= new PointCloudAdaptiveDisplay(() => ({
      layer: this._pointCloudMapLayer?.layer ?? null, view: this.state.jimuMapView?.view, ownerView: this._pointCloudMapLayer?.view ?? null,
      count: this._pointCloudAcquisition.result?.points.length || 0, adaptive: !!this.state.pointCloudAdaptive,
      toolsActive: !!(this.state.isMeasureMode || this.state.isLassoMode || this.state.isSightMode || this.state.isViewshedMode),
      groundHeight: this._groundMode ? POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M : undefined,
    }), pointCloudDisplayExpression);
    this._pointCloudAdaptiveDisplay.update();
  };

  /** Bind scene SDK operations and current UI callbacks once for this widget.
   * Plain feature properties cross the SDK boundary only in applyEdits. Geometry and
   * display policy come from feature helpers; this adapter keeps UI/SDK callback order.
   */
  private ensurePointCloudMapLayerOwner() {
    return this._pointCloudMapLayer ??= new PointCloudMapLayer<__esri.FeatureLayer, __esri.MapView | __esri.SceneView, PointCloudResult>({
      createLayer: properties => new this.ArcGISModules.FeatureLayer(properties),
      applyEdits: (layer, edits) => layer.applyEdits(edits as __esri.FeatureLayerApplyEditsEdits),
      readView: () => this.state.jimuMapView?.view,
      diff: diffPointCloudFeatures,
      onSummary: (result, count) => { const imageId = result.imageId; this._localizedCloudSummary = () => this._pointCloudAcquisition.result?.imageId === imageId ? summarizePointCloud(this._pointCloudAcquisition.result, count, this._presentation) : ""; this.setState({ pointCloudSummary: this._localizedCloudSummary() }); },
      onLayerReady: () => this.updatePointCloudDisplay(),
      onSettled: () => {
        if (this.state.isLassoMode && this.state.lassoPolygon?.length >= 3) this.calculateLassoSelection();
        else if (this.state.lassoSelectedObjectIds?.length) this.highlightLassoInArcGIS();
      },
      onToast: count => this.showToast(<OwnedMessage source={"3D scene updated ({value0} points)"} values={{ value0: String(this._presentation.number(count)) }} />, 2500),
      onError: error => this.setState({ pointCloudIncomplete: true, pointCloudSummary: (error as Error).message }),
      yieldEdits: () => new Promise<void>(resolve => setTimeout(resolve, 0)),
    });
  }

  /** Forward pure geometry preparation and renderer policy; the map owner applies SDK edits. */
  private renderPointCloudMapLayer = (silent: boolean = false) => {
    const view = this.state.jimuMapView?.view;
    if (!view?.map || view.destroyed || !this._pointCloudAcquisition.result) return;
    const owner = this.ensurePointCloudMapLayerOwner();
    const renderRequest = owner.beginUpdate();

    const result: PointCloudResult = this._pointCloudAcquisition.result;
    const cropLength = this.state.pointCloudLength <= 0 ? 0 : this.state.pointCloudLength;
    const { features, colors } = preparePointCloudMapGeometry(result, {
      cameraLon: this._cameraLon, cameraLat: this._cameraLat,
      basis: pointCloudCorridorBasis(this.getStreetBearing()), length: cropLength, halfWidth: this.state.pointCloudWidth,
      baseAltitude: this._baseAlt, nudgeX: this._nudgeX, nudgeY: this._nudgeY, nudgeZ: this._nudgeZ,
    });

    const activeRenderer = pointCloudMapRenderer(this.state.pointCloudColorMode, colors);

    owner.update({
      request: renderRequest, view, result, features, renderer: activeRenderer, silent,
      definitionExpression: this._groundMode ? `relativeHeight < ${POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M}` : "1=1"
    });

    // 4. Draw the Concentric Distance Rings
    this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);
  };

  /**
   * 1. KEY DOWN: Accumulates the distance and updates the UI toast,
   * but DOES NOT render the heavy map layer yet.
   */
  private handleNudgeKeyDown = (e: KeyboardEvent) => {
    // Only allow nudging if the point cloud is currently visible
    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;

    // Ignore keystrokes if the user is typing in a text box
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const handled = this._pointCloudCalibration.keyDown(e.key, e.shiftKey);

    switch (e.key.toLowerCase()) {
      // THE Z-SLICER (GROUND MODE)
      case "x":
        this._groundMode = !this._groundMode;
        if (this._pointCloudMapLayer?.layer) {
          // Instantly hide any point taller than 1.5 meters
          this.updatePointCloudDisplay();
        }

        if (this._pointCloudViewerRenderer) {
          this._pointCloudViewerRenderer.updateColors();

          // FORCE REDRAW: The microscopic camera hack instantly applies the visual change
          if (this.mapillaryViewer) {
            this.mapillaryViewer
              .getCenter()
              .then((c: number[]) => {
                this.mapillaryViewer.setCenter([c[0] + 0.000001, c[1]]);
              })
              .catch(() => { });
          }
        }

        this.showToast(
          <span style={navigationFeedbackStyle()}>
            <Icons.GroundGrid size={14} />
            <b> {this._t('appGroundMode')} </b> {this._groundMode ? <OwnedMessage source={"ON (Buildings > {value0}m Hidden)"} values={{ value0: String(POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M) }} /> : this._t('appOffFullCloud')}
          </span>,
          3000,
        );
        e.preventDefault();
        return;

      case "c":
        this.setState(
          (prev) => ({
            pointCloudColorMode: prev.pointCloudColorMode === "rgb" ? "elevation" : "rgb",
          }),
          () => {
            this.showToast(
              <span style={navigationFeedbackStyle()}>
                <b> {this._t('appColorMode')} </b> {this.state.pointCloudColorMode === "elevation" ? this._t('appElevationHeatmap') : this._t('appTrueRgb')}
              </span>,
              3000,
            );

            // 1. Redraw Esri Map
            this.renderPointCloudMapLayer();

            // 2. Redraw Mapillary Viewer
            if (this._pointCloudViewerRenderer) {
              this._pointCloudViewerRenderer.updateColors();
              if (this.mapillaryViewer) this.mapillaryViewer.resize();
            }
          },
        );
        e.preventDefault();
        return;
    }

    if (handled) {
      e.preventDefault();
      this.showToast(
        <span style={navigationFeedbackStyle()}>
          <Icons.Crosshair size={14} />
          <b> {this._t('appTotalOffset')} </b>
          {Math.abs(this._nudgeX).toFixed(1)} {this._t('appM')} {this._nudgeX > 0 ? this._t('appE') : this._t('appW')},{Math.abs(this._nudgeY).toFixed(1)} {this._t('appM')} {this._nudgeY > 0 ? this._t('appN') : this._t('appS')}
          {Math.abs(this._nudgeZ).toFixed(1)} {this._t('appM')} {this._nudgeZ > 0 ? this._t('appUp') : this._t('appDn')}
        </span>,
        1000,
      );
    }
  };

  /**
   * Schedule movement-key commits on release through the shared trailing debounce.
   */
  private handleNudgeKeyUp = (e: KeyboardEvent) => {
    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    this._pointCloudCalibration.keyUp(e.key);
  };

  /**
   * Toggles the Calibration UI Panel
   */
  private toggleCalibrationPanel = () => {
    this.setState((prev) => ({ showCalibrationPanel: !prev.showCalibrationPanel }));
  };

  /**
   * Triggers when the user clicks an on-screen Joystick Arrow.
   * Maps directional clicks to the camera's current viewing angle.
   */
  private handleJoystickNudge = (axis: "x" | "y" | "z", direction: 1 | -1) => {
    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;

    this._pointCloudCalibration.joystick(axis, direction, () => {
      // Show instant feedback toast
      this.showToast(
        <span style={navigationFeedbackStyle()}>
          <Icons.Crosshair size={14} />
          <b> {this._t('appOffset')} </b>  {this._t('appX')} {this._nudgeX.toFixed(1)} {this._t('appMY')} {this._nudgeY.toFixed(1)} {this._t('appMZ')} {this._nudgeZ.toFixed(1)} {this._t('appM')} </span>,
        1000,
      );
    });
  };

  /**
   * Reset east/north/up offsets and rebuild the map immediately; no terrain resampling.
   */
  private resetCalibration = () => {
    this._pointCloudCalibration.reset(() => this.showToast(this._t('appCloudResetToMapillaryCoordinates'), 2000));
  };

  /**
        Creates and attaches a MapillaryJS ICustomRenderer that draws the point
        cloud as white semi-transparent dots directly onto the street imagery.
        * Uses raw WebGL with gl.POINTS; no Three.js dependency required.
        * geodeticToEnu (from mapillary-js) converts each WGS84 point to the
        * viewer's local topocentric ENU frame so they project correctly onto
        * the panoramic scene as the user pans and zooms.
    */
  /** Attach the cloud viewer owner; raw coordinates and color inputs stay live.
   * Acquisition and scene edits have separate owners; this adapter keeps filtered ordering and resize intent.
   */
  private addViewerPointCloudRenderer(result: PointCloudResult, _imageId: string) {
    if (!this.mapillaryViewer) return;
    const owner = this._pointCloudViewerRenderer ?? new PointCloudViewerRenderer({
      readAppearance: () => ({ colorMode: this.state.pointCloudColorMode, baseAltitude: this._baseAlt, nudgeZ: this._nudgeZ, groundMode: this._groundMode }),
      readPixelRatio: () => window.devicePixelRatio || 1,
      readOpaquePass: () => RenderPass.Opaque,
      groundHeightMeters: POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M,
      toEnu: geodeticToEnu,
      warn: (...args) => console.warn(...args),
    });
    if (owner.attach(this.mapillaryViewer, result.points)) this._pointCloudViewerRenderer = owner;
  }

  /** Detach from the original viewer; Mapillary invokes the owner's GL removal callback. */
  private removeViewerPointCloudRenderer() {
    this._pointCloudViewerRenderer?.detach();
  }

  /** Coordinate owner teardown; false preserves reload loading/progress state. */
  private clearPointCloud = (resetState: boolean = true) => this._pointCloudLifecycle.clear(resetState);

  /** Forward activation intent; lifecycle preserves active/loading/following toggle semantics. */
  private togglePointCloud = () => this._pointCloudLifecycle.toggle();

  /** Keep the original trailing 150 ms debounce and clearPointCloud cancellation boundary. */
  private _debouncedNudgeRender = debounceUtil(() => this._pointCloudCalibration.commit(), 150);

  /** Bind the SceneView-only SDK constructor and live point/state adapters once. */
  private ensureSightOwner() {
    return this._sight ??= new PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point>({
      read: () => ({
        view: this.state.jimuMapView?.view, enabled: this.state.isSightMode,
        observer: this.state.sightObserver, targets: this.state.sightTargets
      }),
      loadFactory: async () => {
        const [LineOfSightViewModel] = await loadArcGISJSAPIModules(['esri/widgets/LineOfSight/LineOfSightViewModel']);
        // The owner validates 3D before invoking this constructor.
        return view => new LineOfSightViewModel({ view: view as __esri.SceneView }) as __esri.LineOfSightViewModel;
      },
      setObserver: (model, point) => { model.observer = point; },
      addTarget: (model, point) => {
        // Preserve the existing SDK collection autocast from target properties.
        const targets = model.targets as unknown as { add(properties: __esri.LineOfSightTargetProperties): unknown };
        targets.add({ location: point });
      },
      onObserver: point => this.setState({ sightObserver: point }),
      onTarget: point => this.setState(prev => ({ sightTargets: [...prev.sightTargets, point] })),
      warn: (...args) => console.warn(...args),
    });
  }

  /**
   * Toggles the 3D Line of Sight Mode on and off.
   */
  private toggleSightMode = () => this._pointCloudTools.toggleSight();
  /**
   * Clears the current Line of Sight analysis.
   */
  private clearSight = () => {
    this.setState({ sightObserver: null, sightTargets: [] });
    this._sight?.clear();
  };

  /**
   * Toggles the 3D Viewshed Analysis Mode on and off.
   */
  private toggleViewshedMode = async () => this._pointCloudTools.toggleViewshed();
  /** Bind SDK construction once; the feature owns observer policy and analysis lifetime. */
  private ensureViewshedOwner() {
    return this._viewshed ??= new PointCloudViewshed<__esri.ViewshedAnalysis, __esri.MapView | __esri.SceneView>({
      read: () => ({ enabled: this.state.isViewshedMode, view: this.state.jimuMapView?.view }),
      loadFactory: async () => {
        const [ViewshedAnalysis, Viewshed, Point] = await loadArcGISJSAPIModules([
          'esri/analysis/ViewshedAnalysis', 'esri/analysis/Viewshed', 'esri/geometry/Point',
        ]);
        return specification => new ViewshedAnalysis({
          viewsheds: [new Viewshed({ ...specification, observer: new Point(specification.observer) })],
        }) as __esri.ViewshedAnalysis;
      },
      warn: (...args) => console.warn(...args),
    });
  }

  /** Cancel pending creation and release the original view's analysis without changing mode. */
  private clearViewshed = () => { this._viewshed?.clear(); };

  /**
   * Toggles the 3D Measurement Mode on and off.
   */
  private toggleMeasureMode = () => this._pointCloudTools.toggleMeasure();
  /**
   * Clears the current measurement and removes the 3D line from the map.
   */
  private clearMeasurement = () => {
    this.setState({ measurePoints: [] }, () => {
      this.updateMeasurementGraphics();
    });
  };

  // [4.5.0 Update] LASSO SELECTION LOGIC
  private toggleLassoMode = () => this._pointCloudTools.toggleLasso();
  private clearLasso = () => {
    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });
    this._lasso?.clear();
    if (this._pointCloudViewerRenderer) {
      this._pointCloudViewerRenderer.updateLasso([]);
      if (this.mapillaryViewer) this.mapillaryViewer.resize();
    }
  };

  /** Bind pointer/polygon and map highlight adapters; selected samples remain in React state. */
  private ensureLassoOwner() {
    return this._lasso ??= new PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView>({
      startPolygon: point => this.setState({ lassoPolygon: [point] }),
      appendPoint: point => this.setState(prev => ({ lassoPolygon: [...prev.lassoPolygon, point] })),
      complete: () => this.calculateLassoSelection(),
      readObjectIds: () => this.state.lassoSelectedObjectIds,
      readTarget: () => {
        const view = this.state.jimuMapView?.view, owner = this._pointCloudMapLayer;
        return view && owner?.view === view && owner.layer ? { view, layer: owner.layer } : null;
      },
      whenLayerView: (view, layer) => view.whenLayerView(layer) as Promise<__esri.FeatureLayerView>,
    });
  }

  /** Forward SVG CSS-pixel pointer events without retaining React events. */
  private handleLassoStart = (event: React.PointerEvent<SVGSVGElement>) => this.ensureLassoOwner().start(event);
  private handleLassoMove = (event: React.PointerEvent<SVGSVGElement>) => this._lasso?.move(event);
  private handleLassoEnd = (event: React.PointerEvent<SVGSVGElement>) => this._lasso?.end(event);
  /** Touch cancellation releases capture without completing an unfinished selection. */
  private handleLassoCancel = () => this._lasso?.cancelGesture();

  /** Highlight only on the current owning view/layer after asynchronous layer-view readiness. */
  private highlightLassoInArcGIS() { this.ensureLassoOwner().highlight(); }

  /** Map filtered viewer indices to confirmed SDK ObjectIDs, omitting unconfirmed points. */
  private pointCloudObjectIds(indices: readonly number[]): number[] {
    return this._pointCloudMapLayer?.objectIds(indices) || [];
  }

  /** Project raw WGS84 points with the last viewer matrices, then update map/viewer selection.
   * Pure projection preserves the existing math; the map owner resolves confirmed SDK ObjectIDs.
   */
  private calculateLassoSelection = () => {
    const { lassoPolygon } = this.state;
    if (lassoPolygon.length < 3) return; // Need at least a triangle

    // Borrow the last rendered matrices/reference without exposing GL callback internals.
    const projection = this._pointCloudViewerRenderer?.getProjection();
    if (!projection) return;

    const canvas = this.viewerContainer.current?.querySelector("canvas");
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const selectedIndices = selectLassoIndices(this._filteredPointCloudPoints, lassoPolygon, projection, width, height, geodeticToEnu);

    // Stable IDs belong to original points, not their position in a cropped viewer buffer.
    const objectIds = this.pointCloudObjectIds(selectedIndices);

    this.setState({ lassoSelectedObjectIds: objectIds }, () => {
      if (this._pointCloudViewerRenderer) {
        // Update the viewer instantly
        this._pointCloudViewerRenderer.updateLasso(selectedIndices);
        if (this.mapillaryViewer) this.mapillaryViewer.resize();
      }
      // Update the map asynchronously
      this.highlightLassoInArcGIS();
    });
  };

  /** Bind measurement SDK/DOM adapters once; picked samples and tool intent stay in React state. */
  private ensureMeasurementOwner() {
    return this._measurement ??= new PointCloudMeasurement<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView>({
      readView: () => this.state.jimuMapView?.view,
      readViewer: () => this.mapillaryViewer,
      readPoints: () => this.state.measurePoints,
      readLabel: () => this.measureLabelRef.current,
      readCanvas: () => this.viewerContainer.current?.querySelector('canvas') ?? null,
      readPixelRatio: () => window.devicePixelRatio || 1,
      toEnu: geodeticToEnu,
      createLayer: async properties => {
        const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer']);
        return new GraphicsLayer(properties as __esri.GraphicsLayerProperties) as __esri.GraphicsLayer;
      },
      createGraphic: properties => new this.ArcGISModules.Graphic(properties as __esri.GraphicProperties),
      warn: (...args) => console.warn(...args),
    });
  }

  /** Forward map redraw; the owner contains module-load races and preserves viewer/label order. */
  private async updateMeasurementGraphics() { await this.ensureMeasurementOwner().updateMap(); }

  /** Forward viewer restoration after fullscreen/recreation without owning raw GL callbacks here. */
  private updateViewerMeasurementRenderer() { this.ensureMeasurementOwner().syncViewer(); }

  /** Forward confirmed frame changes; acquisition owns follow delay and stale-load invalidation. */
  private checkAndLoadNextPointCloud = (newImageId: string) => this._pointCloudAcquisition.onImage(newImageId);

  /** Export the retained full cloud; the owner preserves calibration reads and download timing. */
  private downloadPointCloud = async (format: "csv" | "ply" | "las" = "csv") => this._pointCloudExport.download(format);

  /** Forward meter half-length; the feature preserves pre-state bearing/width capture. */
  handlePointCloudLengthChange = (newLength: number) => this._pointCloudCrop.changeLength(newLength);

  /** Forward meter half-width; the feature reads bearing/length after map/ring updates. */
  private handlePointCloudWidthChange = (newWidth: number) => this._pointCloudCrop.changeWidth(newWidth);

  /** Bind the ring feature's live geometry and typed SDK factories once. */
  private ensureRingsOwner() {
    return this._rings ??= new PointCloudRings<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView, PointCloudResult>({
      readContext: () => ({ view: this.state.jimuMapView?.view, result: this._pointCloudAcquisition.result, graphicsReady: !!this.ArcGISModules }),
      readGeometry: () => ({
        cameraLon: this._cameraLon, cameraLat: this._cameraLat, nudgeX: this._nudgeX, nudgeY: this._nudgeY,
        halfWidth: this.state.pointCloudWidth, actualLength: this.state.pointCloudActualLength, actualWidth: this.state.pointCloudActualWidth
      }),
      readBearing: () => this.getStreetBearing(),
      loadFactory: async () => {
        const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer']);
        return properties => new GraphicsLayer(properties as __esri.GraphicsLayerProperties) as __esri.GraphicsLayer;
      },
      createGraphic: properties => new this.ArcGISModules.Graphic(properties as __esri.GraphicProperties),
      warn: (...args) => console.warn(...args),
    });
  }

  /** Forward the captured meter radius; the owner reads live dimensions after SDK readiness. */
  private async drawConcentricRings(currentRadius: number) { await this.ensureRingsOwner().draw(currentRadius); }

  /**
   * Calculates the direction of the street based on the sequence path.
   * Looks 15 meters ahead to bypass micro-GPS jitter and keep the corridor perfectly straight.
   */
  private getStreetBearing(): number {
    const { imageId } = this.state;
    const sequenceImages = this._pointCloudSequenceContext?.imageId === imageId ? this._pointCloudSequenceContext.points : this.state.sequenceImages;
    return streetBearing(sequenceImages, imageId, this._lastBearing || 0);
  }

  // #endregion POINT CLOUD

  // #region FIELD NOTES

  private readonly FIELD_NOTES_STORAGE_KEY = "mly_field_notes_v1";

  /**
   * Loads persisted field notes from browser LocalStorage into the component state.
   * Triggers map graphic redraws and Mapillary viewer renderer updates upon load.
   */
  private _sharedNotesLayer: __esri.FeatureLayer | null = null;
  private _sharedNotesView: __esri.MapView | __esri.SceneView | null = null;
  private _sharedNotesTimer: ReturnType<typeof setInterval> | null = null;
  private _sharedNotesRevision = 0;
  private _sharedNotesPopupHandle: { remove(): void } | null = null;
  private _noteEditorRevision = 0;
  private _noteAttachmentRevision = 0;
  private _sharedNotesDisposed = false;
  private _sharedNoteSaves = new Set<string>();

  /** Borrow/create the current note group; its owner preserves visibility and load guards. */
  private async ensureFieldNotesGroup(view: __esri.MapView | __esri.SceneView): Promise<__esri.GroupLayer | null> {
    return this._fieldNoteMap.ensureGroup(view);
  }

  /** Release the group from its creating view after stopping the pending note marker. */
  private clearFieldNotesGroup() { this._detectionViewerMarkers?.dispose(); this._detectionViewerMarkers = null; this._workspaceNoteLocation?.cancel(); this._fieldNoteMap.clear(); }

  private readonly loadEnterpriseIdentityManager = async () => {
    const [manager] = await loadArcGISJSAPIModules(['esri/identity/IdentityManager']);
    return manager;
  };

  /** Resolve the configured shared-note service endpoint for the requested read/write operation. */
  private sharedNotesUrl(read = false): string {
    return resolveEnterpriseNotesEndpoint(this.props.config, read);
  }

  /** Detach shared-note layer resources and invalidate view-bound reads before another view can attach them. */
  private clearSharedNotesView() {
    ++this._sharedNotesRevision;
    this._sharedNotesPopupHandle?.remove(); this._sharedNotesPopupHandle = null;
    if (this._sharedNotesTimer) clearInterval(this._sharedNotesTimer);
    this._sharedNotesTimer = null;
    if (this._sharedNotesLayer) {
      this._fieldNoteMap.group?.layers.remove(this._sharedNotesLayer);
      this._sharedNotesView?.map?.remove(this._sharedNotesLayer);
      this._sharedNotesLayer.destroy();
    }
    this._sharedNotesLayer = null; this._sharedNotesView = null;
  }

  /** Synchronize the shared-note source with current configuration and map; guard delayed layer work against replacement. */
  private async syncSharedFieldNotes(force = false) {
    if (this._sharedNotesDisposed) return;
    const view = this.state.jimuMapView?.view;
    let url: string;
    try { url = this.sharedNotesUrl(true); }
    catch (error) { this.clearSharedNotesView(); this.setState({ sharedNotesMessage: (error as Error).message }); return; }
    if (!url || !view?.map || view.destroyed || !this.ArcGISModules?.FeatureLayer) { this.clearSharedNotesView(); return; }
    if (this._sharedNotesView === view && matchesEnterpriseLayerUrl(this._sharedNotesLayer, url) && !this._sharedNotesLayer.destroyed) { if (force) this._sharedNotesLayer.refresh(); return; }
    this.clearSharedNotesView();
    const revision = this._sharedNotesRevision;
    const layer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({
      url, id: "mapillary-shared-field-notes", title: "Enterprise Field Notes", outFields: ["category", "note_text", "image_id", "created_at"], refreshInterval: 0,
      elevationInfo: { mode: "on-the-ground" }, renderer: { type: "simple", symbol: buildNoteSymbol("#35b7c4", view.type === "3d") },
      popupTemplate: { title: this._owned("Enterprise Field Note"), content: [{ type: "fields", fieldInfos: [{ fieldName: "category", label: this._owned("Category") }, { fieldName: "note_text", label: this._owned("Note") }, { fieldName: "created_at", label: this._owned("Created"), format: { dateFormat: "short-date-short-time" } }, { fieldName: "image_id", label: this._owned("Mapillary image") }] }] }
    });
    this._sharedNotesLayer = layer; this._sharedNotesView = view;
    this.setState({ sharedNotesMessage: this._owned("Loading enterprise notes…") });
    try {
      await layer.load();
      if (revision !== this._sharedNotesRevision || this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
      if (layer.geometryType !== "point" || !["category", "note_text", "image_id", "created_at"].every(name => layer.fields.some(field => field.name === name))) throw new Error("Enterprise notes layer does not match the documented point-layer schema.");
      const workflow = ["status", "resolution_note"].every(name => layer.fields.some(field => field.name === name));
      if (workflow) {
        layer.outFields = ["*"];
        layer.renderer = {
          type: "unique-value", field: "status", defaultSymbol: { type: "simple-marker", style: "diamond", color: "#35b7c4", size: 12, outline: { color: "white", width: 1 } }, uniqueValueInfos: [
            { value: "open", label: this._owned("Open"), symbol: { type: "simple-marker", style: "diamond", color: "#35b7c4", size: 12 } },
            { value: "in_progress", label: this._owned("In progress"), symbol: { type: "simple-marker", style: "diamond", color: "#f5a623", size: 12 } },
            { value: "completed", label: this._owned("Completed"), symbol: { type: "simple-marker", style: "circle", color: "#05a056", size: 10 } },
            { value: "dismissed", label: this._owned("Dismissed"), symbol: { type: "simple-marker", style: "circle", color: "#888888", size: 10 } }
          ]
        } as any;
        layer.popupTemplate = {
          title: this._owned("Enterprise Field Note"), content: [{
            type: "fields", fieldInfos: [
              { fieldName: "category", label: this._owned("Category") }, { fieldName: "note_text", label: this._owned("Note") },
              { fieldName: "status", label: this._owned("Status") }, { fieldName: "resolution_note", label: this._owned("Resolution") },
              { fieldName: "created_at", label: this._owned("Created"), format: { dateFormat: "short-date-short-time" } }
            ]
          }], actions: [{ type: "button", id: "edit-enterprise-note", title: this._owned("Update note"), className: "esri-icon-edit" }, { type: "button", id: "enterprise-note-attachments", title: this._owned("Attachments"), className: "esri-icon-attachment" }]
        };
      }
      if (layer.popupTemplate) layer.popupTemplate.content = enterprisePopupContent(this._presentation, workflow) as any;
      if (!workflow && layer.capabilities?.data?.supportsAttachment && layer.popupTemplate) layer.popupTemplate.actions?.add({ type: "button", id: "enterprise-note-attachments", title: this._owned("Attachments"), className: "esri-icon-attachment" } as any);
      const group = await this.ensureFieldNotesGroup(view);
      if (!group || revision !== this._sharedNotesRevision || layer.destroyed) return;
      group.layers.add(layer); this.enforceMapillaryLayerOrder(view);
      this.setState({ sharedNotesMessage: this._owned("Enterprise map · updates every 15 seconds") });
      void this.drawFieldNoteGraphics();
      this._sharedNotesTimer = setInterval(() => {
        if (document.visibilityState !== "hidden" && revision === this._sharedNotesRevision && this.state.jimuMapView?.view === view && view.map && !view.destroyed && !layer.destroyed) layer.refresh();
      }, 15000);
    } catch (error) {
      if (revision !== this._sharedNotesRevision) return;
      this.clearSharedNotesView();
      this.setState({ sharedNotesMessage: this._owned("Enterprise notes unavailable. Local notes remain available. Retry or check the layer configuration.") });
      console.warn("[FieldNotes] Shared display failed", error);
    }
  }

  /** Read a bounded Enterprise page only for the open Enterprise list; reject obsolete view/layer responses. */
  private loadEnterpriseNotesPage: EnterpriseNotesLoader = async (offset, signal) => {
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const view = this.state.jimuMapView?.view;
    const url = this.sharedNotesUrl(true);
    if (!url || !view?.map || view.destroyed || this._sharedNotesDisposed) throw new Error("Enterprise notes are unavailable");
    if (!this._sharedNotesLayer || !matchesEnterpriseLayerUrl(this._sharedNotesLayer, url) || this._sharedNotesView !== view || this._sharedNotesLayer.destroyed) await this.syncSharedFieldNotes();
    const layer = this._sharedNotesLayer, revision = this._sharedNotesRevision;
    if (!layer || layer.destroyed || !matchesEnterpriseLayerUrl(layer, url) || this._sharedNotesView !== view) throw new Error("Enterprise notes are unavailable");
    let writeUrl = "";
    try { writeUrl = this.sharedNotesUrl(); } catch { /* Reading can remain available when editing is not configured. */ }
    return queryEnterpriseNotesPage(layer, writeUrl, offset, signal, () => !this._sharedNotesDisposed && revision === this._sharedNotesRevision && this._sharedNotesLayer === layer && this.state.jimuMapView?.view === view && this.sharedNotesUrl(true) === url);
  };

  private patchSharedFieldNote(id: string, patch: Partial<FieldNote>): Promise<boolean> {
    if (this._sharedNotesDisposed) return Promise.resolve(this.saveFieldNotesToStorage(this.state.fieldNotes.map((note: FieldNote) => note.id === id ? { ...note, ...patch } : note)));
    return new Promise(resolve => this.setState((previous: { fieldNotes: FieldNote[] }) => ({ fieldNotes: previous.fieldNotes.map((note: FieldNote) => note.id === id ? { ...note, ...patch } : note) }), () => {
      const saved = this.saveFieldNotesToStorage(this.state.fieldNotes);
      void this.drawFieldNoteGraphics(); this.updateViewerFieldNoteMarkers(); resolve(saved);
    }));
  }

  /** Publish a local draft to the shared destination, serialize saves per note and record confirmation or retryable failure. */
  private publishFieldNote = async (id: string) => {
    const note = this.state.fieldNotes.find((item: FieldNote) => item.id === id);
    if (!note || this._sharedNoteSaves.has(id) || note.sharedStatus === "shared") return;
    this._sharedNoteSaves.add(id);
    let layer: __esri.FeatureLayer | undefined;
    let loginSnapshot: typeof this._routingLoginView = null;
    try {
      const url = this.sharedNotesUrl();
      if (!this.ArcGISModules?.FeatureLayer) throw new Error("Map services are still initializing. Retry shortly.");
      if (!url) throw new Error("Configure and enable a enterprise notes layer before sharing.");
      if (note.sharedLayerUrl && note.sharedLayerUrl !== url) throw new Error("This note is linked to a different layer. Restore that layer configuration before retrying.");
      if (!Number.isFinite(note.lon) || !Number.isFinite(note.lat) || Math.abs(note.lon) > 180 || Math.abs(note.lat) > 90) throw new Error("The note has invalid coordinates.");
      const globalId = note.sharedGlobalId || `{${crypto.randomUUID()}}`;
      if (!/^\{[0-9a-f-]{36}\}$/i.test(globalId)) throw new Error("Invalid saved note identifier.");
      const durable = await this.patchSharedFieldNote(id, { sharedGlobalId: globalId, sharedLayerUrl: url, sharedStatus: "saving", sharedError: undefined });
      if (!durable) throw new Error("Local storage is full or unavailable. Free browser storage before sharing; the note was not submitted.");
      if (!this.state.isGeneratingRoute) { this.rememberRoutingLoginView(); loginSnapshot = this._routingLoginView; }
      // A separate writer is never added to a map, so a sign-in map rebuild cannot dispose it.
      const writer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url });
      layer = writer;
      await writer.load();
      const globalIdField = writer.fields.find(field => field.type === "global-id")?.name;
      if (writer.geometryType !== "point" || !globalIdField || !writer.capabilities?.editing?.supportsGlobalId) throw new Error("The editable layer needs GlobalIDs and support for edits with GlobalIDs. See the setup guide.");
      const attributes = buildEnterpriseNoteAttributes(note, writer.fields, globalIdField, globalId);
      // Check on every retry; server GlobalID uniqueness also protects lost-response races.
      const existing = await writer.queryFeatures({ where: `${globalIdField} = '${globalId}'`, outFields: [writer.objectIdField], returnGeometry: false, num: 1 });
      if (!existing.features.length) {
        if (!writer.capabilities?.operations?.supportsAdd) throw new Error("Your account cannot add notes to this layer.");
        const result = await writer.applyEdits({ addFeatures: [new this.ArcGISModules.Graphic({ geometry: { type: "point", longitude: note.lon, latitude: note.lat, spatialReference: { wkid: 4326 } }, attributes })] }, { globalIdUsed: true });
        const added = result.addFeatureResults?.[0];
        if (!added || added.error) throw new Error(added?.error?.message || "The layer did not confirm the save. Retry safely after checking your connection.");
      }
      const crop = attachmentMetadata(note.note).reference;
      if (crop?.attachmentId) {
        if (!writer.capabilities?.data?.supportsAttachment) throw Error('The note was saved, but image attachments are not enabled on the Enterprise layer. Enable them and retry sharing.');
        const saved = await writer.queryFeatures({ where: `${globalIdField} = '${globalId}'`, outFields: [writer.objectIdField], returnGeometry: false, num: 1 }); const feature = saved.features[0], oid = feature?.attributes[writer.objectIdField]; if (!Number.isFinite(oid)) throw Error('The saved note could not be confirmed for its image attachment.');
        const files = await writer.queryAttachments({ objectIds: [oid] }), name = `detection-${crop.attachmentId}.jpg`;
        if (!files[oid]?.some(file => file.name === name)) { const data = await readDetectionCrop(crop.attachmentId), blob = new Blob([Uint8Array.from(atob(data.split(',')[1]), char => char.charCodeAt(0))], { type: 'image/jpeg' }), form = new FormData(); form.append('attachment', new File([blob], name, { type: 'image/jpeg' })); const added = await writer.addAttachment(feature, form); if (!added || added.error) throw Error('The note was saved, but its image attachment was not confirmed. Retry sharing to check before uploading again.'); }
      }
      await this.patchSharedFieldNote(id, { sharedStatus: "shared", sharedError: undefined });
      this._sharedNotesLayer?.refresh();
      if (!this._sharedNotesDisposed) this.showToast(this._t('appNoteSharedWithYourOrganization'), 3000);
    } catch (error) {
      await this.patchSharedFieldNote(id, { sharedStatus: "failed", sharedError: (error as Error)?.message || "Sharing failed. Retry when connected." });
    } finally {
      layer?.destroy(); this._sharedNoteSaves.delete(id);
      if (loginSnapshot && this._routingLoginView === loginSnapshot && !this._sharedNotesDisposed) {
        const view = this.state.jimuMapView?.view;
        if (view) await this.restoreRoutingLoginView(view);
        if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
        this._routingLoginExpiry = setTimeout(() => { if (this._routingLoginView === loginSnapshot) this._routingLoginView = null; this._routingLoginExpiry = null; }, 15000);
      }
    }
  };

  private editLocalFieldNote = (id: string) => {
    if (this.state.fieldNoteEditor?.saving) return;
    const note = this.state.fieldNotes.find((item: FieldNote) => item.id === id);
    if (!note || this._sharedNoteSaves.has(id)) return;
    ++this._noteEditorRevision;
    this.setState({ fieldNoteEditor: { key: `local:${id}:${this._noteEditorRevision}`, localId: id, category: note.category, note: note.note, status: note.status || "open", resolutionNote: note.resolutionNote || "" } });
  };

  private cancelFieldNoteEdit = () => {
    if (this.state.fieldNoteEditor?.saving) return;
    ++this._noteEditorRevision; this.setState({ fieldNoteEditor: null });
  };

  private async openSharedFieldNoteEditor(feature: __esri.Graphic | FieldNote) {
    if (this.state.fieldNoteEditor?.saving) return;
    const revision = ++this._noteEditorRevision;
    let writer: __esri.FeatureLayer | undefined;
    let loginSnapshot: typeof this._routingLoginView = null;
    try {
      const url = this.sharedNotesUrl();
      if (!url || !this.ArcGISModules?.FeatureLayer) throw new Error("Enable and configure the enterprise notes layer first.");
      const local = "sharedGlobalId" in feature ? feature as FieldNote : null;
      if (local?.sharedLayerUrl && local.sharedLayerUrl !== url) throw new Error("This note belongs to a different enterprise layer.");
      if (!this.state.isGeneratingRoute) { this.rememberRoutingLoginView(); loginSnapshot = this._routingLoginView; }
      const activeWriter: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url });
      writer = activeWriter; await activeWriter.load();
      const field = writer.fields.find(item => item.type === "global-id")?.name;
      const globalId = local?.sharedGlobalId || (field && (feature as __esri.Graphic).attributes?.[field]);
      if (!field || !globalId || !/^\{[0-9a-f-]{36}\}$/i.test(globalId)) throw new Error("The selected note has no valid GlobalID. Ensure the read-only view exposes the GlobalID field.");
      if (!writer.capabilities?.operations?.supportsUpdate || !writer.capabilities?.editing?.supportsGlobalId) throw new Error("Your account or this layer does not allow note updates.");
      if (!["status", "resolution_note"].every(name => writer!.fields.some(item => item.name === name))) throw new Error("Add status and resolution_note to the layer using the updated setup guide.");
      const result = await writer.queryFeatures({ where: `${field} = '${globalId}'`, outFields: ["*"], returnGeometry: false, num: 1 });
      const attrs = result.features[0]?.attributes;
      if (!attrs) throw new Error("This note is missing or your account cannot read it.");
      if (revision !== this._noteEditorRevision || this._sharedNotesDisposed) return;
      this.setState({
        fieldNoteEditor: {
          key: `shared:${globalId}:${revision}`, localId: local?.id, globalId, url,
          category: attrs.category || "Other", note: attrs.note_text || "", status: attrs.status || "open", resolutionNote: attrs.resolution_note || "", baseline: { ...attrs }
        }
      });
    } catch (error) { if (revision === this._noteEditorRevision && !this._sharedNotesDisposed) this.showToast((error as Error).message, 6000); }
    finally {
      writer?.destroy();
      if (loginSnapshot && this._routingLoginView === loginSnapshot && !this._sharedNotesDisposed) {
        const view = this.state.jimuMapView?.view; if (view) await this.restoreRoutingLoginView(view);
        if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
        this._routingLoginExpiry = setTimeout(() => { if (this._routingLoginView === loginSnapshot) this._routingLoginView = null; this._routingLoginExpiry = null; }, 15000);
      }
    }
  }

  /** Persist the active note edit to its local or shared owner and retain actionable feedback when saving fails. */
  private saveFieldNoteEdit = async (values: { category: string; note: string; status: string; resolutionNote: string }) => {
    const editor = this.state.fieldNoteEditor;
    if (!editor || editor.saving) return;
    if (!["open", "in_progress", "completed", "dismissed"].includes(values.status)) return;
    const patch: Partial<FieldNote> = { category: values.category, note: values.note, status: values.status as FieldNote["status"], resolutionNote: values.resolutionNote };
    const revision = this._noteEditorRevision;
    this.setState({ fieldNoteEditor: { ...editor, saving: true, error: undefined } });
    let writer: __esri.FeatureLayer | undefined;
    let loginSnapshot: typeof this._routingLoginView = null;
    try {
      if (editor.globalId) {
        const url = this.sharedNotesUrl();
        if (!url || url !== editor.url) throw new Error("The configured enterprise layer changed. Reopen the note before updating.");
        if (!this.state.isGeneratingRoute) { this.rememberRoutingLoginView(); loginSnapshot = this._routingLoginView; }
        const activeWriter: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url });
        writer = activeWriter; await activeWriter.load();
        const field = writer.fields.find(item => item.type === "global-id")?.name;
        if (!field || !writer.capabilities?.editing?.supportsGlobalId || !writer.capabilities?.operations?.supportsUpdate) throw new Error("Your account or this layer does not allow note updates.");
        const latest = await writer.queryFeatures({ where: `${field} = '${editor.globalId}'`, outFields: ["*"], returnGeometry: false, num: 1 });
        const attrs = latest.features[0]?.attributes;
        if (!attrs) throw new Error("This note was removed or is no longer accessible.");
        assertEnterpriseNoteUnchanged(attrs, editor.baseline, writer.editFieldsInfo?.editDateField);
        const attributes = buildEnterpriseNoteEditAttributes(values, writer.fields, field, editor.globalId);
        // Attribute-only update: no geometry, author, creation time or deletion is submitted.
        const result = await writer.applyEdits({ updateFeatures: [new this.ArcGISModules.Graphic({ attributes })] }, { globalIdUsed: true });
        const updated = result.updateFeatureResults?.[0];
        if (!updated || updated.error) throw new Error(updated?.error?.message || "The server did not confirm the update. Reopen the note to verify its current status before retrying.");
        const linked = this.state.fieldNotes.filter((note: FieldNote) => note.sharedGlobalId?.toLowerCase() === editor.globalId!.toLowerCase() && note.sharedLayerUrl === url);
        for (const note of linked) await this.patchSharedFieldNote(note.id, patch);
        this._sharedNotesLayer?.refresh();
      } else {
        if (!editor.localId || !this.state.fieldNotes.some((note: FieldNote) => note.id === editor.localId) || this._sharedNoteSaves.has(editor.localId)) throw new Error("This note is currently being shared. Wait before editing.");
        if (!await this.patchSharedFieldNote(editor.localId, patch)) throw new Error("Browser storage is unavailable. Export your notes before refreshing the page.");
      }
      if (revision === this._noteEditorRevision && !this._sharedNotesDisposed) {
        this.setState({ fieldNoteEditor: null }); this.showToast(editor.globalId ? <OwnedMessage source={"Shared note updated."} /> : <OwnedMessage source={"Local note updated. Enterprise record unchanged."} />, 3000);
      }
    } catch (error) {
      if (revision === this._noteEditorRevision && !this._sharedNotesDisposed) this.setState({ fieldNoteEditor: { ...editor, saving: false, error: (error as Error).message } });
    } finally {
      writer?.destroy();
      if (loginSnapshot && this._routingLoginView === loginSnapshot && !this._sharedNotesDisposed) {
        const view = this.state.jimuMapView?.view; if (view) await this.restoreRoutingLoginView(view);
        if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
        this._routingLoginExpiry = setTimeout(() => { if (this._routingLoginView === loginSnapshot) this._routingLoginView = null; this._routingLoginExpiry = null; }, 15000);
      }
    }
  };

  /** Load attachment metadata for the selected shared note under the current attachment-panel request. */
  private async openFieldNoteAttachments(feature: __esri.Graphic | FieldNote) {
    if (this.state.fieldNoteAttachments?.busy) return;
    const revision = ++this._noteAttachmentRevision;
    let writer: __esri.FeatureLayer | undefined;
    let loginSnapshot: typeof this._routingLoginView = null;
    try {
      const url = this.sharedNotesUrl();
      if (!url || !this.ArcGISModules?.FeatureLayer) throw new Error("Share the note to a configured enterprise layer before adding attachments.");
      const local = "sharedGlobalId" in feature ? feature as FieldNote : null;
      if (local?.sharedLayerUrl && local.sharedLayerUrl !== url) throw new Error("This note belongs to a different enterprise layer.");
      if (!this.state.isGeneratingRoute) { this.rememberRoutingLoginView(); loginSnapshot = this._routingLoginView; }
      const layer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url }); writer = layer; await layer.load();
      if (!layer.capabilities?.data?.supportsAttachment) throw new Error("Attachments are not enabled on this layer. Ask your Enterprise administrator to enable them.");
      const field = layer.fields.find(item => item.type === "global-id")?.name;
      const globalId = local?.sharedGlobalId || (field && (feature as __esri.Graphic).attributes?.[field]);
      if (!field || !globalId || !/^\{[0-9a-f-]{36}\}$/i.test(globalId)) throw new Error("The selected note needs a valid GlobalID exposed by the read layer.");
      const result = await layer.queryFeatures({ where: `${field} = '${globalId}'`, outFields: [layer.objectIdField], returnGeometry: false, num: 1 });
      const objectId = result.features[0]?.attributes[layer.objectIdField];
      if (!Number.isFinite(objectId)) throw new Error("This note is missing or your account cannot read it.");
      const attachments = await layer.queryAttachments({ objectIds: [objectId] });
      if (revision === this._noteAttachmentRevision && !this._sharedNotesDisposed) this.setState({ fieldNoteAttachments: { key: `${globalId}:${revision}`, url, globalId, objectId, items: attachments[objectId] || [] } });
    } catch (error) { if (!this._sharedNotesDisposed) this.showToast((error as Error).message, 6000); }
    finally {
      writer?.destroy();
      if (loginSnapshot && this._routingLoginView === loginSnapshot && !this._sharedNotesDisposed) {
        const view = this.state.jimuMapView?.view; if (view) await this.restoreRoutingLoginView(view);
        if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
        this._routingLoginExpiry = setTimeout(() => { if (this._routingLoginView === loginSnapshot) this._routingLoginView = null; this._routingLoginExpiry = null; }, 15000);
      }
    }
  }

  private closeFieldNoteAttachments = () => {
    if (this.state.fieldNoteAttachments?.busy) return;
    ++this._noteAttachmentRevision; this.setState({ fieldNoteAttachments: null });
  };

  /** Upload the user-selected file to the current shared note, with save feedback and request-ownership checks. */
  private uploadFieldNoteAttachment = async (file?: File, currentImage = false) => {
    const panel: FieldNoteAttachments | null | undefined = this.state.fieldNoteAttachments;
    if (!panel || panel.busy || (!file && !currentImage)) return;
    const revision = this._noteAttachmentRevision;
    const imageId = this.state.imageId; // Capture exactly the image selected when the user clicks.
    this.setState({ fieldNoteAttachments: { ...panel, busy: true, error: undefined, message: undefined } });
    let writer: __esri.FeatureLayer | undefined;
    let loginSnapshot: typeof this._routingLoginView = null;
    try {
      if (this.sharedNotesUrl() !== panel.url) throw new Error("The enterprise layer changed. Reopen attachments before uploading.");
      if (!this.state.isGeneratingRoute) { this.rememberRoutingLoginView(); loginSnapshot = this._routingLoginView; }
      const layer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url: panel.url }); writer = layer; await layer.load();
      if (!layer.capabilities?.data?.supportsAttachment) throw new Error("Attachments are not enabled on this layer.");
      if (currentImage) {
        file = await prepareCurrentImageAttachment(imageId, selectedId => this.fetchMapillaryJson(`${GRAPH_API.BASE}/${encodeURIComponent(selectedId)}?fields=thumb_2048_url`, this.accessToken), fetch);
      }
      validateNoteAttachmentFile(file);
      const field = layer.fields.find(item => item.type === "global-id")?.name;
      if (!field) throw new Error("The layer is missing its GlobalID field.");
      const found = await layer.queryFeatures({ where: `${field} = '${panel.globalId}'`, outFields: [layer.objectIdField], returnGeometry: false, num: 1 });
      if (!found.features.length || found.features[0].attributes[layer.objectIdField] !== panel.objectId) throw new Error("The note changed or is no longer accessible. Reopen attachments.");
      const form = new FormData(); form.append("attachment", file, file.name);
      // No automatic retries: a lost response may have already committed the file.
      const result = await layer.addAttachment(found.features[0], form);
      if (!result || result.error) throw new Error(result?.error?.message || "The layer did not confirm the attachment.");
      const attachments = await layer.queryAttachments({ objectIds: [panel.objectId] });
      if (revision === this._noteAttachmentRevision && !this._sharedNotesDisposed) this.setState({ fieldNoteAttachments: { ...panel, items: attachments[panel.objectId] || [], busy: false, message: "Attachment added." } });
      this._sharedNotesLayer?.refresh();
    } catch (error) {
      if (revision === this._noteAttachmentRevision && !this._sharedNotesDisposed) this.setState({ fieldNoteAttachments: { ...panel, busy: false, error: `${(error as Error).message} Reopen attachments to check whether the file arrived before uploading again.` } });
    } finally {
      writer?.destroy();
      if (loginSnapshot && this._routingLoginView === loginSnapshot && !this._sharedNotesDisposed) {
        const view = this.state.jimuMapView?.view; if (view) await this.restoreRoutingLoginView(view);
        if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
        this._routingLoginExpiry = setTimeout(() => { if (this._routingLoginView === loginSnapshot) this._routingLoginView = null; this._routingLoginExpiry = null; }, 15000);
      }
    }
  };

  private downloadFieldNoteAttachment = async (id: number) => {
    const panel: FieldNoteAttachments | null | undefined = this.state.fieldNoteAttachments;
    if (!panel || panel.busy || !panel.items.some(item => item.id === id)) return;
    try {
      const [request] = await loadArcGISJSAPIModules(["esri/request"]);
      const response = await request(`${panel.url}/${panel.objectId}/attachments/${id}`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a"); link.href = url; link.download = panel.items.find(item => item.id === id)?.name || "attachment"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { if (!this._sharedNotesDisposed) this.showToast(this._t('appAttachmentDownloadFailedCheckYourAccessOrConnection'), 5000); }
  };

  /** Restore via the existing storage helper, then refresh both note renderers after state commits. */
  private loadFieldNotesFromStorage() { this._localNoteCollection.load(); }

  /**
   * Persists the current array of field notes to browser LocalStorage.
   * @param notes Array of field note objects to be serialized.
   */
  private saveFieldNotesToStorage(notes: FieldNote[]) {
    return persistLocalNotes(this.FIELD_NOTES_STORAGE_KEY, notes);
  }

  /**
   * Toggles annotation mode on/off.
   * When active, clicks on the map are intercepted to create new field notes.
   */
  private toggleAnnotationMode = () => this._fieldNoteDraft.toggle();
  /**
   * Draws one projected marker at the selected map location
   * while the field note form is open.
   * The marker uses an orange/amber color and continuously pulses
   * smoothly to indicate the pending note location without replacing SDK symbols.
   * Supports both 2D and 3D map views. In 3D mode, the marker can
   * optionally be placed at the specified altitude.
   * @param lon - Longitude of the selected location
   * @param lat - Latitude of the selected location
   * @param alt - Optional altitude/elevation for 3D views
   */
  private drawPendingNoteGraphic(lon: number, lat: number, alt?: number) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;

    this.clearPendingNoteGraphic();

    const is3D = view.type === "3d";

    const geom: any = {
      type: "point",
      longitude: lon,
      latitude: lat,
      spatialReference: { wkid: 4326 },
    };
    if (is3D && alt !== undefined) {
      geom.z = alt;
      geom.hasZ = true;
    }

    const host = view.container as HTMLElement;
    if (!host?.appendChild) return;
    this._pendingNoteMarker = new PendingNoteMarker({
      createElement: () => document.createElement("div"),
      createPoint: geometry => new this.ArcGISModules.Point(geometry),
      now: () => performance.now(),
      requestFrame: callback => requestAnimationFrame(callback),
      cancelFrame: handle => cancelAnimationFrame(handle),
      isVisible: () => (this._fieldNoteMap.group?.visible ?? this._fieldNoteMap.visible) !== false,
    });
    this._pendingNoteMarker.start(view, host, geom);
  }

  /** Release the pending overlay and animation before closing the form or replacing its map. */
  private clearPendingNoteGraphic() {
    this._pendingNoteMarker?.stop();
    this._pendingNoteMarker = null;
  }

  /**
   * Handles map clicks while in annotation mode.
   * Triggers ripple feedback, drops temporary pin, and opens note modal.
   * @param lon Longitude of the clicked point (WGS84).
   * @param lat Latitude of the clicked point (WGS84).
   * @param alt Optional altitude in meters (from 3D point cloud or terrain).
   */
  private handleAnnotationMapClick = (lon: number, lat: number, alt?: number) => this._fieldNoteDraft.open(lon, lat, alt);
  /**
   * Submits and saves a pending field note to state, LocalStorage, and 2D/3D renderers.
   * @param category Selected category for the note.
   * @param note Optional description or comment text.
   */
  private submitFieldNote = (category: string, note: string, share = false) => this._fieldNoteDraft.submit(category, note, share);
  /**
   * Cancels the currently pending field note creation and closes the entry modal.
   */
  private cancelPendingFieldNote = () => { const pending = this.state.pendingFieldNote; if (pending?.attachmentId) void deleteDetectionCrop(pending.attachmentId).catch(() => { }); this._fieldNoteDraft.cancel(); };
  /**
   * Deletes a field note by its unique identifier and synchronizes state, storage, and graphics.
   * @param id Unique identifier of the note to remove.
   */
  private deleteFieldNote = (id: string) => this._localNoteCollection.remove(id);
  /**
   * Clears local notes by persisting an empty array and refreshing map/viewer graphics.
   * The existing button owns confirmation; Enterprise notes remain unchanged.
   */
  private clearAllFieldNotes = () => this._localNoteCollection.clear();  /**
   * Centers the ArcGIS map on the selected field note and navigates
   * the Mapillary viewer to the associated image if one exists.
   * @param note The target field note to focus.
   */
  private focusFieldNote = (note: FieldNote) => {
    this._focusedViewerNote = this.state.fieldNotes.some(item => item.id === note.id) ? null : note;
    this.updateViewerFieldNoteMarkers();
    const view = this.state.jimuMapView?.view;
    if (!view) return;
    // Selection is a transient highlight; it never creates a saved local copy.
    void this._fieldNoteMap.focusNote(note)
      .catch(() => this.showToast(this._owned('Selected note marker could not be displayed. Try Show on map again.')));
    this.navigateMapView(view, { center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });

    // If the note has an associated image, jump the viewer there too
    if (note.imageId && note.imageId !== this.state.imageId) {
      if (this.mapillaryViewer) {
        this.mapillaryViewer.moveTo(note.imageId).catch(() => { });
      }
    }
  };

  /**
   * Renders all stored field notes as diamond-shaped graphic markers on the ArcGIS map view.
   * Orange diamonds denote manual entries, while green diamonds indicate AI detections.
   */
  private async drawFieldNoteGraphics() { await this._fieldNoteMap.draw(); await this._fieldNoteMap.drawWorkspace(); }

  /** Receive only authorized loaded results; the notes feature owns auth/search. */
  private updateWorkspaceMapNotes = (notes: FieldNote[], categories: readonly { name: string; color: string }[], workspaceName: string) => {
    if (this._focusedViewerNote?.workspace && !notes.some(note => note.id === this._focusedViewerNote!.id)) { this._focusedViewerNote = null; this.updateViewerFieldNoteMarkers(); }
    void this._fieldNoteMap.setWorkspaceNotes(notes, categories, workspaceName)
      .catch(() => this.showToast(this._owned('Workspace markers could not be displayed. Refresh contributions to retry.')));
    this.syncMapLegendLayer();
  };

  /**
   * Synchronizes and renders field notes in the Mapillary panoramic/perspective viewer.
   * Uses a custom WebGL renderer (field-notes-renderer) instead of DOM SimpleMarkers
   * to ensure proper 3D positioning, distance scaling, and alignment with Point Cloud data.
   */
  private detectionNoteReference(note: FieldNote) {
    const saved = attachmentMetadata(note.note).reference; if (saved?.detectionId) return saved;
    if (note.source !== 'mapillary-detection' || !note.detectionId || String(note.imageId) !== String(this.state.imageId) || this._detectionImageData?.imageId !== String(note.imageId)) return null;
    const det = this._detectionImageData.data?.data?.find((item: any) => String(item.id) === String(note.detectionId));
    const bounds = det?.geometry ? detectionThumbnailBounds(decodeAndNormalizeGeometry(det.geometry)) : undefined;
    return bounds ? { imageId: String(note.imageId), detectionId: note.detectionId, bounds } : null;
  }
  /** Refresh viewer note markers from current note/image state without transferring map-layer ownership. */
  private updateViewerFieldNoteMarkers = () => {
    if (!this.mapillaryViewer) return;

    // Cleanup: Disable Mapillary's built-in MarkerComponent to prevent conflicts
    try {
      const markerComponent = this.mapillaryViewer.getComponent("marker");
      if (markerComponent) markerComponent.removeAll();
    } catch (e) { }

    this._detectionViewerMarkers?.dispose(); this._detectionViewerMarkers = null;
    const markerNotes = this._focusedViewerNote ? [...this.state.fieldNotes, this._focusedViewerNote] : this.state.fieldNotes;
    const anchored = markerNotes.map(note => ({ note, ref: this.detectionNoteReference(note) })).filter(item => item.ref && item.ref.imageId === String(this.state.imageId));
    if (anchored.length && this.viewerContainer.current) this._detectionViewerMarkers = new PanoramaDetectionLabels(this.mapillaryViewer, this.viewerContainer.current, anchored.map(item => ({ id: item.note.id, text: '', marker: true, point: [item.ref!.bounds.x + item.ref!.bounds.width / 2, item.ref!.bounds.y + item.ref!.bounds.height / 2] })), true);
    const relevant = (selectViewerFieldNotes(this.state.fieldNotes, this.state.sequenceImages, this.state.imageId, FIELD_NOTE_CONFIG.VIEWER_MAX_DIST_M, distanceMeters) ?? []).filter(note => note.source !== 'mapillary-detection' && !this.detectionNoteReference(note));

    if (relevant.length === 0) {
      if ((this as any)._fieldNotesRendererActive) {
        try {
          this.mapillaryViewer.removeCustomRenderer("field-notes-renderer");
        } catch (e) { }
        (this as any)._fieldNotesRendererActive = false;
        (this as any)._fieldNotesViewerRenderer = null;
        this.mapillaryViewer.resize();
      }
      return;
    }

    if (!(this as any)._fieldNotesRendererActive) {
      this.addFieldNotesViewerRenderer(relevant);
    } else if ((this as any)._fieldNotesViewerRenderer) {
      (this as any)._fieldNotesViewerRenderer.updatePositions(relevant);
      this.mapillaryViewer.resize();
    }
  };

  /**
   * Attaches a custom MapillaryJS WebGL renderer that draws 3D diamond-shaped field note markers.
   * Employs Manhattan-distance fragment shaping, perspective size scaling, and geodetic-to-ENU projection.
   * @param relevantNotes Array of field notes within the viewing threshold.
   */
  private addFieldNotesViewerRenderer(relevantNotes: any[]) {
    if (!this.mapillaryViewer) return;

    const renderer: any = createFieldNoteViewerRenderer(relevantNotes, {
      getRelevantNotesOnReference: () => {
        return selectViewerFieldNotes(this.state.fieldNotes, this.state.sequenceImages, this.state.imageId, 60, distanceMeters)?.filter(note => note.source !== 'mapillary-detection' && !this.detectionNoteReference(note));
      },
      getPointCloudVisible: () => this.state.pointCloudVisible,
      getBaseAltitude: () => this._baseAlt,
      getPixelRatio: () => window.devicePixelRatio || 1,
      project: geodeticToEnu,
    });

    try {
      this.mapillaryViewer.addCustomRenderer(renderer);
      (this as any)._fieldNotesRendererActive = true;
      (this as any)._fieldNotesViewerRenderer = renderer;
      this.mapillaryViewer.resize();
    } catch (e) {
      console.warn("Could not attach field notes renderer:", e);
    }
  }

  /**
   * Exports all recorded field notes as a 3D GeoJSON FeatureCollection file.
   * Preserves longitude, latitude, and altitude [lon, lat, alt] coordinates.
   */
  private exportFieldNotes = () => this._fieldNoteFiles.export();
  /**
   * Imports field notes from an external GeoJSON file.
   * Parses 3D coordinates (coordinates[2]) or properties.alt, skips duplicates by ID,
   * and updates application state, storage, and renderers.
   * @param file The GeoJSON file selected by the user.
   */
  private importFieldNotesFile = (file: File) => this._fieldNoteFiles.import(file);
  // #endregion FIELD NOTES

  // #region SOLAR & SHADOW MODELING

  /** Keep the map-layer lifetime independent from viewer rendering and native lighting resources. */
  private ensureSolarMapOverlay(): SolarMapOverlay<__esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {
    return this._solarMapOverlay ??= new SolarMapOverlay();
  }
  /** Bind solar-mode transitions to React scheduling and existing tool/resource owners. */
  private readonly _solarModeHost: SolarModeHost = {
    enabled: () => this.props.config.enableSolar === true,
    setState: (updater, callback) => this.setState(updater, callback),
    active: () => this.state.isSolarMode,
    clearMeasurement: () => this.clearMeasurement(),
    clearSight: () => this.clearSight(),
    clearViewshed: () => this.clearViewshed(),
    clearLasso: () => this.clearLasso(),
    notifyEnabled: () => this.showToast(this._t('appSolarModelingEnabledSunPositionComputedFromPhotoMetadata'), 3000),
    update: () => this.updateSolarGraphics(),
    clear: () => this.clearSolarGraphics(),
  };

  /** Toggle solar presentation through the feature while retaining React updater/callback timing. */
  private toggleSolarMode = () => toggleSolarMode(this._solarModeHost);

  /** Removes both the ArcGIS shadow lines and the WebGL Sun */
  private clearSolarGraphics = () => {
    const solarView = this.ensureSolarMapOverlay().clear(this.state.jimuMapView?.view);
    this._solarViewer?.detach(this.mapillaryViewer);

    this._solarSceneLighting?.restore(solarView);
  };

  /** Bind solar modeling to live context, localized feedback and existing resource owners. */
  private readonly _solarModelHost: SolarModelHost<__esri.GraphicsLayer, __esri.MapView | __esri.SceneView> = {
    enabled: () => this.props.config.enableSolar === true,
    state: () => this.state,
    overlay: () => this.ensureSolarMapOverlay(),
    notify: reason => reason === 'missing-timestamp'
      ? this.showToast(this._t('appCannotModelSolarDataImageIsMissingATimestamp'), 3000)
      : this.showToast(this._t('appSunWasBelowTheHorizonWhenThisPhotoWas'), 4000),
    clear: () => this.clearSolarGraphics(),
    loadModules: ids => loadArcGISJSAPIModules(ids),
    graphic: () => this.ArcGISModules.Graphic,
    viewerSun: sun => this.ensureSolarViewerOwner().update(this.mapillaryViewer, sun.azimuth, sun.altitude),
    sceneLighting: (view, date, current) => this.ensureSolarSceneLighting().update(view as any, date, current),
  };

  /** Update solar modeling through its feature workflow and existing resource owners. */
  private updateSolarGraphics = () => updateSolarModel(this._solarModelHost);

  /** Bind viewer rendering dependencies once; sun position is supplied by solar modeling. */
  private ensureSolarViewerOwner(): SolarViewerRenderer {
    return this._solarViewer ??= new SolarViewerRenderer(() => RenderPass.Opaque, () => window.devicePixelRatio || 1);
  }

  /** Keep native lighting and delayed ShadowCast creation under one resource owner. */
  private ensureSolarSceneLighting(): SolarSceneLighting {
    return this._solarSceneLighting ??= new SolarSceneLighting(
      () => loadArcGISJSAPIModules(["esri/widgets/ShadowCast"]),
      error => console.error("ShadowCast Widget Error:", error),
    );
  }
  // #endregion SOLAR & SHADOW MODELING

  // #region ELEVATION PROFILE
  /** Bind profile mode to React, route readiness, localized feedback and existing cone drawing. */
  private readonly _profileModeHost: ProfileModeHost = {
    enabled: () => this.props.config.enableElevationProfile === true,
    active: () => this.state.isElevationProfileActive,
    setActive: (active, callback) => this.setState({ isElevationProfileActive: active }, callback),
    resetRouteFailure: () => { this._fullRouteFailure = ''; },
    update: () => this.updateElevationProfile(),
    complete: () => !!this._liveSequenceFrames.complete,
    notify: complete => this.showToast(complete ? <OwnedMessage source={"Elevation profile enabled."} /> : <OwnedMessage source={"Loading route for elevation profile…"} />, 2500),
    clear: () => this.clearElevationProfile(),
    state: () => this.state,
    coneLength: () => this.coneLengths[this.zoomStepIndex],
    coneSpread: () => this.coneSpreads[this.zoomStepIndex],
    bearing: () => this._lastBearing,
    clearCone: () => this.clearConeGraphics(),
    drawCone: (lon, lat, bearing, length, spread) => this.drawCone(lon, lat, bearing, length, spread),
  };

  /** Toggle the profile and redraw its current cone through the elevation feature. */
  private toggleElevationProfile = () => toggleProfileMode(this._profileModeHost);

  private clearElevationProfile = () => {
    this._fullRouteTask?.controller.abort(); this._fullRouteTask = null;
    if (!this._liveSequenceFrames.complete && this.state.sequenceId) this._liveSequenceFrames.setLocal(this.state.sequenceId, this._liveSequenceFrames.local);
    if (this.state.sequenceRouteLoading) this.setState({ sequenceRouteLoading: false, sequenceRouteProgress: undefined });
    this._elevationProfile?.clear(this.state.jimuMapView?.view);
  };

  /** Bind SDK factories once; profile resources and pending updates belong to this owner. */
  private ensureElevationProfileOwner(): ElevationProfileController {
    this._elevationProfile ??= new ElevationProfileController(
      ids => loadArcGISJSAPIModules(ids), () => this.ArcGISModules.Graphic, () => this._profileFlowHost, this._presentation
    );
    return this._elevationProfile;
  }

  /** Bind route preparation to live context and the existing profile resource owner. */
  private readonly _sequenceProfileHost: SequenceProfileHost<__esri.MapView | __esri.SceneView> = {
    state: () => this.state,
    enabled: () => this.props.config.enableElevationProfile === true,
    complete: () => this._liveSequenceFrames.complete,
    ensureRoute: () => this.ensureFullSequenceRoute(),
    clear: () => this.clearElevationProfile(),
    disable: () => this.setState({ isElevationProfileActive: false }),
    notifyInsufficientRoute: () => this.showToast(this._t('appThisSequenceNeedsAtLeastTwoLocatedImagesFor'), 3000),
    update: (view, images, current) => this.ensureElevationProfileOwner().update(view, images, current),
    indicator: () => this.updateProfileIndicator(),
    warn: error => console.warn("[Mapillary profile] Could not generate the current sequence profile:", error),
  };

  /** Prepare the current sequence route and delegate profile generation to the elevation feature. */
  private updateElevationProfile = () => updateSequenceProfile(this._sequenceProfileHost);

  /** Forward the current frame to the elevation chart's presentation module. */
  private updateProfileIndicator = () => {
    const confirmed = this.state.isElevationProfileActive && this._profileConfirmedViewer === this.mapillaryViewer &&
      this._profileConfirmedImageId === String(this.state.imageId) ? this._profileConfirmedImageId : null;
    this._elevationProfile?.track(confirmed);
  };
  // #endregion ELEVATION PROFILE

  // #region Playback Management
  /**
   * Bypasses 403 Forbidden frames.
   * When Mapillary natively halts on a dead image, this function takes over,
   * loops forward until it finds a healthy image, and resumes native playback.
   */
  private _playbackRecoveryTask: { owner: AbortController | null; promise: Promise<void> } | null = null;
  private forceSkipNext = async () => {
    const owner = this._selectionAbort;
    if (this._playbackRecoveryTask?.owner === owner) return this._playbackRecoveryTask.promise;
    const entry = { owner, promise: skipUnavailableSequenceFrames(this._playbackRecoveryHost) };
    this._playbackRecoveryTask = entry;
    try { await entry.promise; } finally { if (this._playbackRecoveryTask === entry) this._playbackRecoveryTask = null; }
  };

  /** Stop native playback and future recovery candidates, then refresh paused nearby imagery. */
  private stopSafePlayback = () => {
    stopSequencePlayback(this._playbackRecoveryHost);
  };

  /** Bind live playback intent and viewer readers once; recovery snapshots sequence data per attempt. */
  private readonly _playbackRecoveryHost: PlaybackRecoveryHost = {
    getState: () => ({ sequenceImages: this.state.sequenceImages, imageId: this.state.imageId, sequenceId: this.state.sequenceId, recoveryKey: this._selectionAbort }),
    getOrderedImages: async () => {
      const id = this.state.sequenceId, signal = this._selectionAbort?.signal;
      if (!id || !signal) return [];
      const ids = await this._sequenceDemand.ids(id, signal);
      return ids.map(imageId => ({ id: imageId }));
    },
    getViewer: () => this.mapillaryViewer,
    isPaused: () => this._userPaused,
    setPaused: paused => { this._userPaused = paused; this._places?.controller.sync(); this._backgroundRequests?.setLimit(paused ? 2 : 1); },
    refreshNearbyAfterPause: () => this.refreshNearbyAfterPause(),
    warn: (...args) => console.warn(...args),
  };
  //#endregion Playback Management

  private readonly _arcGISModuleInitialization = new ArcGISModuleInitialization({
    ready: () => !!this.ArcGISModules?.VectorTileLayer,
    load: ids => loadArcGISJSAPIModules(ids),
    publish: modules => { this.ArcGISModules = modules; },
    loaded: () => this.log("ArcGIS API modules loaded"),
  });

  /** Share lazy SDK initialization; callers retain their existing post-await lifecycle guards. */
  private ensureArcGISModules(): Promise<void> {
    return this._arcGISModuleInitialization.ensure();
  }

  private dismissIntro = () => this.setState({ showIntro: false });

  /**
   * Initialize SDK dependencies, preset coverage and deferred sprite catalogs for this widget instance.
   * Check the startup revision after awaits so unmount cannot be followed by late listener, layer or DOM attachment.
   * Mapillary JS is imported by the bundle; it is not fetched from a CDN here.
   */
  async componentDidMount() {
    return mountWidget(this.widgetStartupHost());
  }

  /** Bind live startup slots and concrete host operations without creating another startup revision or abort owner. */
  private widgetStartupHost(): WidgetStartupHost {
    const widget = this;
    return {
      get introDismissTimer() { return widget._introDismissTimer; },
      set introDismissTimer(value) { widget._introDismissTimer = value; },
      get overrideStyleSheet() { return widget._overrideStyleSheet; },
      set overrideStyleSheet(value) { widget._overrideStyleSheet = value; },
      get sequenceVisibilityChange() { return widget._sequenceVisibilityChange; },
      get spritePreloadTimer() { return widget._spritePreloadTimer; },
      set spritePreloadTimer(value) { widget._spritePreloadTimer = value; },
      get startupAbort() { return widget._startupAbort; },
      set startupAbort(value) { widget._startupAbort = value; },
      get startupDisposed() { return widget._startupDisposed; },
      set startupDisposed(value) { widget._startupDisposed = value; },
      get startupRevision() { return widget._startupRevision; },
      set startupRevision(value) { widget._startupRevision = value; },
      ensureAlwaysOnCoverageLayer: (...args) => this.ensureAlwaysOnCoverageLayer(...args),
      ensureArcGISModules: (...args) => this.ensureArcGISModules(...args),
      getUserIdFromUsername: (...args) => this.getUserIdFromUsername(...args),
      get handleFullscreenChange() { return widget.handleFullscreenChange; },
      get handleNudgeKeyDown() { return widget.handleNudgeKeyDown; },
      get handleNudgeKeyUp() { return widget.handleNudgeKeyUp; },
      get handleWindowResize() { return widget.handleWindowResize; },
      initMapillaryLayer: (...args) => this.initMapillaryLayer(...args),
      initMapillaryObjectsLayer: (...args) => this.initMapillaryObjectsLayer(...args),
      initMapillaryTrafficSignsLayer: (...args) => this.initMapillaryTrafficSignsLayer(...args),
      initializePlacesLifecycle: (...args) => this.initializePlacesLifecycle(...args),
      installCoverageAlignmentDiagnostic: (...args) => this.installCoverageAlignmentDiagnostic(...args),
      loadFieldNotesFromStorage: (...args) => this.loadFieldNotesFromStorage(...args),
      log: (...args) => this.log(...args),
      get viewer() { return widget.mapillaryViewer; },
      preloadObjectOptions: (...args) => this.preloadObjectOptions(...args),
      preloadTrafficSignOptions: (...args) => this.preloadTrafficSignOptions(...args),
      get resizeObserver() { return widget.resizeObserver; },
      set resizeObserver(value) { widget.resizeObserver = value; },
      restoreSequenceCache: (...args) => this.restoreSequenceCache(...args),
      applyPresets: presets => this.setState(presets),
      setCreator: username => this.setState({ turboFilterUsername: username }),
      enableNativeCoverage: () => this.setState({ turboModeActive: true }),
      syncMapLegendLayer: (...args) => this.syncMapLegendLayer(...args),
      syncSequenceDiagnostics: (...args) => this.syncSequenceDiagnostics(...args),
      syncSharedFieldNotes: (...args) => this.syncSharedFieldNotes(...args),
      get tooltipDiv() { return widget.tooltipDiv; },
      set tooltipDiv(value) { widget.tooltipDiv = value; },
      updateOrganizationName: (...args) => this.updateOrganizationName(...args),
      get config() { return widget.props.config; },
      container: () => this.viewerContainer.current,
      overrideStyles,
    };
  }

  /** Selection updates touch tile filters only; frame playback within one sequence does no style work. */
  private updateNativeSequenceSelection() {
    if (!this.state.turboModeActive) return;
    if (this.state.isLoading || this._imageryOpeningRequest != null) { this._nativeSequenceSelection.cancelPending('selected'); return; }
    this._nativeSequenceSelection.select(this.state.selectedSequenceId || this.state.sequenceId || null);
  }

  /**
   * Reconcile feature demand and configuration changes with the currently active view and viewer.
   * Handle close/reopen, fullscreen resize observation and background-work priority without owning feature implementation details.
   */
  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {
    reconcileWidgetUpdate(prevProps, prevState, this.widgetUpdateHost());
  }

  /** Bind live update inputs, UI commits and feature operations while retaining concrete resource ownership. */
  private widgetUpdateHost(): WidgetUpdateHost<__esri.MapView | __esri.SceneView, JimuMapView> {
    const widget = this;
    return {
      get backgroundRequests() { return widget._backgroundRequests; },
      get coverageAnalysisCurrent() { return widget._coverageAnalysis.currentCheck; },
      get detectionLayers() { return widget._detectionLayers; },
      get imageryOpeningRequest() { return widget._imageryOpeningRequest; },
      get nearbyDemandVisible() { return widget._nearbyDemandVisible; },
      set nearbyDemandVisible(value) { widget._nearbyDemandVisible = value; },
      get nearbyDiscovery() { return widget._nearbyDiscovery; },
      get nearbyPointerInside() { return widget._nearbyPointerInside; },
      set nearbyPointerInside(value) { widget._nearbyPointerInside = value; },
      get placesVectorLayer() { return widget._placesVectorLayer; },
      get routeGeneration() { return widget._routeGeneration; },
      translate: (...args) => this._t(...args),
      announceNearbyFrames: (...args) => this.announceNearbyFrames(...args),
      cancelCaptureRouteGeneration: (...args) => this.cancelCaptureRouteGeneration(...args),
      cancelCoverageAnalysis: (...args) => this.cancelCoverageAnalysis(...args),
      claimCurrentImagePresentation: (...args) => this.claimCurrentImagePresentation(...args),
      cleanupWidgetEnvironment: (...args) => this.cleanupWidgetEnvironment(...args),
      clearElevationProfile: (...args) => this.clearElevationProfile(...args),
      clearSolarGraphics: (...args) => this.clearSolarGraphics(...args),
      get debouncedTurboFilter() { return widget.debouncedTurboFilter; },
      disableTurboCoverageLayer: (...args) => this.disableTurboCoverageLayer(...args),
      drawFieldNoteGraphics: (...args) => this.drawFieldNoteGraphics(...args),
      enableTurboCoverageLayer: (...args) => this.enableTurboCoverageLayer(...args),
      getTurboOrganizationId: (...args) => this.getTurboOrganizationId(...args),
      getUserIdFromUsername: (...args) => this.getUserIdFromUsername(...args),
      initMapillaryLayer: (...args) => this.initMapillaryLayer(...args),
      initMapillaryObjectsLayer: (...args) => this.initMapillaryObjectsLayer(...args),
      initMapillaryTrafficSignsLayer: (...args) => this.initMapillaryTrafficSignsLayer(...args),
      log: (...args) => this.log(...args),
      get mapillaryObjectsLayer() { return widget.mapillaryObjectsLayer; },
      get mapillaryTrafficSignsLayer() { return widget.mapillaryTrafficSignsLayer; },
      get mapillaryVTLayer() { return widget.mapillaryVTLayer; },
      get viewer() { return widget.mapillaryViewer; },
      nearbyPanelVisible: (...args) => this.nearbyPanelVisible(...args),
      onActiveViewChange: (...args) => this.onActiveViewChange(...args),
      get props() { return widget.props; },
      refreshNearbyAfterPause: (...args) => this.refreshNearbyAfterPause(...args),
      resetOrganizationSelection: (...args) => this.resetOrganizationSelection(...args),
      get resizeObserver() { return widget.resizeObserver; },
      set resizeObserver(value) { widget.resizeObserver = value; },
      scheduleOrganizationName: (...args) => this.scheduleOrganizationName(...args),
      restoreReopenState: (patch, after) => this.setState(patch, after),
      setSolarInactive: () => this.setState({ isSolarMode: false }),
      setElevationInactive: () => this.setState({ isElevationProfileActive: false }),
      setOrganization: (value, after) => this.setState({ turboFilterOrganization: value }, after),
      setCreator: (value, after) => this.setState({ turboFilterUsername: value }, after),
      setStartDate: (value, after) => this.setState({ turboFilterStartDate: value }, after),
      setEndDate: (value, after) => this.setState({ turboFilterEndDate: value }, after),
      setPanorama: (value, after) => this.setState({ turboFilterIsPano: value }, after),
      setColorByDate: (value, after) => this.setState({ turboColorByDate: value }, after),
      showToast: (...args) => this.showToast(...args),
      get state() { return widget.state; },
      syncMapLegendLayer: (...args) => this.syncMapLegendLayer(...args),
      syncPlaces: (...args) => this.syncPlaces(...args),
      syncSceneTerrain: (...args) => this.syncSceneTerrain(...args),
      syncSequenceDiagnostics: (...args) => this.syncSequenceDiagnostics(...args),
      syncSharedFieldNotes: (...args) => this.syncSharedFieldNotes(...args),
      toggleMapillaryObjects: (...args) => this.toggleMapillaryObjects(...args),
      toggleMapillaryTrafficSigns: (...args) => this.toggleMapillaryTrafficSigns(...args),
      updateElevationProfile: (...args) => this.updateElevationProfile(...args),
      updateNativeSequenceSelection: (...args) => this.updateNativeSequenceSelection(...args),
      updatePointCloudDisplay: (...args) => this.updatePointCloudDisplay(...args),
      updateProfileIndicator: (...args) => this.updateProfileIndicator(...args),
      container: () => this.viewerContainer.current,
      placesSourceKey,
      organizationFilterId,
    };
  }

  /** Invalidate startup before teardown, abort its work and release its deferred timers and injected stylesheet. */
  private disposeStartupResources() {
    disposeWidgetStartup(this.widgetStartupHost());
  }

  /**
   * Invalidate startup and feature owners before removing instance listeners, observers and shared-map presentation.
   * This is the final teardown path; minimize/close cleanup is handled separately.
   */
  componentWillUnmount() {
    this.disposeStartupResources();
    unmountWidget(this.widgetTeardownHost());
  }

  /** Reattach enabled detection coverage and legend presentation to the newly active ArcGIS view. */
  private restoreMapillaryFeatureLayersForView(jmv: JimuMapView) {
    this.syncMapLegendLayer();
    const view = jmv.view;
    if (this.state.trafficSignsActive) void this.syncMapFeatureCoverage("signs");

    if (this.state.objectsActive) void this.syncMapFeatureCoverage("objects");
    this.syncDetectionLayerAvailability();

  }

  /** Bind restoration operations for this committed view without starting work while binding. */
  private activeViewStartupHost(view: __esri.MapView | __esri.SceneView, jmv: JimuMapView): ActiveViewStartupHost<__esri.MapView | __esri.SceneView> {
    return {
      restored: () => this._sharedStateRestoreComplete,
      flying: () => this._isFlyInActive,
      currentView: () => this.state.jimuMapView?.view,
      goTo: (target, options) => view.goTo(target as any, options),
      modules: () => this.ensureArcGISModules(),
      camera: () => this.restoreRoutingLoginView(view),
      attachCoverage: () => this.ensureAlwaysOnCoverageLayer(),
      coverage: () => this.enableTurboCoverageLayer(),
      graphics: () => this.restoreMapGraphics(),
      places: () => this.syncPlaces(),
      optionalTools: () => {
        if (this._pointCloudAcquisition.result && this.state.pointCloudVisible) {
          if (view.type === "3d") this.renderPointCloudMapLayer(true);
          else this.clearPointCloud(true);
        }
        if (this.state.isSightMode && view.type === "3d") void this.ensureSightOwner().activate();
        if (this.state.isMeasureMode && this.state.measurePoints.length) void this.updateMeasurementGraphics();
        void this.syncSharedFieldNotes();
      },
      featureLayers: () => this.restoreMapillaryFeatureLayersForView(jmv),
      finishPresentation: () => {
        const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);
        if (view.type === "3d" && image && String(image.id) === String(this.state.imageId))
          this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
        this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
      },
      stationary: () => this._stationaryUrlBindings.bind(view),
      warn: (message, error) => console.warn(message, error),
    };
  }

  /** Bind existing feature owners to transfer phases; binding itself performs no cleanup. */
  private activeViewTransferHost(): ActiveViewTransferHost<__esri.MapView | __esri.SceneView> {
    return {
      beforeTransfer: view => {
        if (this._routeGeneration.pending && (view !== this.state.jimuMapView?.view || !this._routeGeneration.current())) this.cancelCaptureRouteGeneration();
        this._hoverPreviewStatus?.clear();
        this._coverageAlignmentDiagnostic?.clearHover();
      },
      terrain: view => this.syncSceneTerrain(view),
      resetStartup: () => {
        this._sharedStartupImageId = null; this._sharedStartupBearing = null;
        this._startupUrlParameters ??= readSharedLinkParameters();
        this._isFlyInActive = false;
      },
      tools: view => {
        this._pointCloudAdaptiveDisplay?.dispose();
        this._lasso?.clear();
        this._viewshed?.onViewChange(view);
        this._sight?.onViewChange(view);
        this._measurement?.onViewChange(view);
        this._pointCloudAcquisition.cancel('view-transfer');
        this._pointCloudMapLayer?.invalidate();
        this._rings?.onViewChange(view);
      },
      detachInteractions: () => {
        this._pendingCoverageHover?.clear();
        this._coverageHoverResume?.dispose(); this._coverageHoverResume = null; this._coverageHoverHandler = null;
        ++this._mapClickRevision;
        if (this.mapClickHandle) {
          try {
            this.mapClickHandle.remove();
          } catch (e) { }
          this.mapClickHandle = null;
        }
        if (this.pointerMoveHandle) {
          try {
            this.pointerMoveHandle.remove();
          } catch (e) { }
          this.pointerMoveHandle = null;
        }
        this._stationaryUrlBindings.clear();
      },
      currentView: () => this.state.jimuMapView?.view,
      turboActive: () => this.state.turboModeActive,
      disableCoverage: () => this.disableTurboCoverageLayer(false),
      log: message => this.log(message),
      clearAnalysis: () => this.clearViewDependentAnalysis(),
      presentation: (view, previousView) => {
        this.clearSharedNotesView();
        if (previousView?.map !== view.map) this.clearMapLegendLayer();
        this.clearSolarGraphics();
        this.clearActiveSequenceLayer();
        this.clearGreenPulse();
        this.clearClickRipples();
        this.clearTurboHover();
        this._elevationProfile?.clear(view, true);
        this._nativeCurrentImageMarker?.clear();
        this._screenDirectionCone?.clear();
        this._cameraCone?.dispose(view);
      },
      requests: () => {
        this._nativeSequenceSelection.detach();
        this._sharedTileRequests.clear(); this._sequenceTileIndex.clear();
        this._hoverSequenceTiming?.cancel(); this._hoverTimingAbort?.abort();
        this._hoverTimingTarget = null;
        this._reverseAddressEnrichment.cancel(); this._backgroundRequests.clear();
        this._timeTravelAvailability?.clear(); this._cachedSequencePreview?.clear();
        this.clearFieldNotesGroup();
      },
      claim: view => this.claimCurrentImagePresentation(view),
    };
  }

  /** Bind committed-view startup and existing view attachments without starting them while binding. */
  private activeViewAttachmentHost(view: __esri.MapView | __esri.SceneView, jmv: JimuMapView): ActiveViewAttachmentHost<__esri.MapView | __esri.SceneView> {
    return {
      commit: ready => this.setState({ jimuMapView: jmv, pointCloudLoading: false }, ready),
      whenReady: ready => view.when(ready),
      restore: context => restoreActiveView(context, this.activeViewStartupHost(view, jmv)),
      shared: current => this.restoreSharedStateWhenReady(view, current),
      zoom: () => this._viewZoomBindings.bind(view),
      turbo: () => {
        this.setState({ turboModeActive: true });
        this._loadedTurboFiltersKey = "";
        this._turboViewBindings.bind(view);
      },
      layerOrder: () => this.enforceMapillaryLayerOrder(view),
      warn: (message, error) => console.warn(message, error),
    };
  }

  /** Capture click identity and preview before any hit test or pointer movement. */
  private prepareMapClick(view: __esri.MapView | __esri.SceneView, evt: __esri.ViewClickEvent): PreparedMapClick | undefined {

    this._pendingCoverageHover?.clear();
    if (this.props.state === "CLOSED" || this.props.visible === false) return;
    if (this._isFlyInActive) (view as any).animation?.stop();
    this._sharedStartupImageId = null; this._sharedStartupBearing = null; this._isFlyInActive = false; this._sharedStateRestoreComplete = true;
    this.claimCurrentImagePresentation?.(view);
    if (this._workspaceNoteLocation?.active) {
      evt.stopPropagation(); const point = view.toMap(evt);
      this._workspaceNoteLocation.consume(view, point ? { lon: point.longitude, lat: point.latitude } : null);
      return;
    }
    this._fieldNoteMap.clearHighlight();
    this._coverageHoverResume?.leave();
    // Claim the click before any await. SDK hit tests cannot be aborted, so
    // late results must lose ownership before they can open imagery or tools.
    const clickRevision = this._mapClickRevision = (this._mapClickRevision ?? 0) + 1;
    const clickCurrent = () => this._mapClickRevision === clickRevision &&
      this.state.jimuMapView?.view === view && !view.destroyed && this.props.state !== "CLOSED" &&
      (!this._currentImagePresentation || this._currentImagePresentation.owns(view.map));
    this._turboClickPickAbort?.abort();
    this._placesVectorLayer?.cancelPick();
    this._mapFeatureClickAbort?.abort();
    if (this.state.coverageFrameResolving) this.setState({ coverageFrameResolving: false });
    this._placesExploreAbort?.abort(); this._placesExploreAbort = null;
    const clickStartedAt = performance.now();
    // Freeze the individual preview identity before hit tests or pointer movement.
    const coverageRevisionAtClick = this._turboRequestCount;
    const coverageClickCurrent = () => clickCurrent() &&
      this.state.turboModeActive && !!this.turboCoverageLayer &&
      this._turboRequestCount === coverageRevisionAtClick;
    const hoveredPoint = this._coverageSelectionTargets.snapshot(this.coverageSelectionContext(), evt,
      TURBO_LIMITS.pickRadiusPx, geometry => view.toScreen(geometry));
    const pointPreviewAtClick = hoveredPoint ? new this.ArcGISModules.Graphic({
      geometry: hoveredPoint.geometry, attributes: {
        image_id: hoveredPoint.imageId,
        sequence_id: hoveredPoint.sequenceId || this._turboMetadataCache.get(hoveredPoint.imageId)?.sequence
      }
    }) : null;
    // Regional line previews keep their existing nearest-frame resolution.
    const hoverPixel = this._turboHoverGraphic?.geometry ? view.toScreen(this._turboHoverGraphic.geometry as __esri.Point) : null;
    const previewImageId = this._currentHoveredFeatureId;
    const coveragePreviewAtClick = pointPreviewAtClick || (this.state.turboModeActive && view.zoom < 14 && this.state.jimuMapView?.view === view &&
      this._turboHoveredScreen && hoverPixel && previewImageId && this._turboHoverGraphic?.geometry &&
      (evt.x - hoverPixel.x) ** 2 + (evt.y - hoverPixel.y) ** 2 <= TURBO_LIMITS.pickRadiusPx ** 2
      ? new this.ArcGISModules.Graphic({
        geometry: this._turboHoverGraphic.geometry.clone?.() || this._turboHoverGraphic.geometry,
        attributes: { image_id: String(previewImageId), sequence_id: this._coverageFrameHoverTarget?.sequenceId || this._turboMetadataCache.get(String(previewImageId))?.sequence, turbo_representative: true }
      })
      : null);

    const point = (view.toMap(evt) || coveragePreviewAtClick?.geometry) as PreparedMapClick['point'];
    if (!point) return;

    return { point, pointPreviewAtClick, coveragePreviewAtClick, clickCurrent, coverageClickCurrent, clickStartedAt };
  }

  /** Bind only click-policy capabilities; live getters retain ownership checks after awaits. */
  private mapClickDispatchHost(view: __esri.MapView | __esri.SceneView): MapClickHost {
    const widget = this;
    return {
      view,
      prepare: evt => this.prepareMapClick(view, evt),
      get currentView() { return widget.state.jimuMapView?.view; },
      get routePickMode() { return widget.state.routePickMode; },
      get isAnnotationMode() { return widget.state.isAnnotationMode; },
      get placesActive() { return widget.state.placesActive; },
      get trafficSignsActive() { return widget.state.trafficSignsActive; },
      get objectsActive() { return widget.state.objectsActive; },
      get turboModeActive() { return widget.state.turboModeActive; },
      get sequenceId() { return widget.state.sequenceId; },
      get sequenceImages() { return widget.state.sequenceImages; },
      get annotationPicker() { return widget._annotationCloudPick; },
      get places() { return widget._places; },
      get tilePlaces() { return widget._placesVectorLayer; },
      get sharedNotesLayer() { return widget._sharedNotesLayer; },
      get fieldNotes() { return widget._fieldNoteMap; },
      get pointCloudMapLayer() { return widget._pointCloudMapLayer; },
      get objectLayer() { return widget.mapillaryObjectsFeatureLayer; },
      get signLayer() { return widget.mapillaryTrafficSignsFeatureLayer; },
      get sharedNotesPopup() { return widget._sharedNotesPopupHandle; },
      set sharedNotesPopup(value) { widget._sharedNotesPopupHandle = value; },
      get cloudHits() { return widget._pointCloudHits; },
      get tilePlacesOwner() { return widget._placesTilesOwner; },
      get sequenceCache() { return widget.sequenceCoordsCache; },
      get selectionRevision() { return widget._selectionRequestId; },
      get selectionAbort() { return widget._selectionAbort; },
      get featureAbort() { return widget._mapFeatureClickAbort; },
      set featureAbort(value) { widget._mapFeatureClickAbort = value; },
      get hoverAbort() { return widget._turboHoverPickAbort; },
      get coverageAbort() { return widget._turboClickPickAbort; },
      set coverageAbort(value) { widget._turboClickPickAbort = value; },
      get coverageLayer() { return widget.turboCoverageLayer; },
      get coverageLayerView() { return widget.turboCoverageLayerView; },
      get highlight() { return widget.highlightHandle; },
      set highlight(value) { widget.highlightHandle = value; },
      get accessToken() { return widget.accessToken; },
      get frames() { return widget._liveSequenceFrames; },
      get selectionTargets() { return widget._coverageSelectionTargets; },
      setRoutePoint: (...args) => this.setRoutePoint(...args),
      setState: (...args) => this.setState(...args),
      openFieldNoteAttachments: (...args) => this.openFieldNoteAttachments(...args),
      openSharedFieldNoteEditor: (...args) => this.openSharedFieldNoteEditor(...args),
      offerNoteObjectChoice: (...args) => this.offerNoteObjectChoice(...args),
      showPlacesHit: (...args) => this.showPlacesHit(...args),
      placesBusy: (...args) => this.placesBusy(...args),
      showToast: (...args) => this.showToast(...args),
      text: (...args) => this._t(...args),
      nearestCoverageImage: (...args) => this.nearestCoverageImage(...args),
      loadSequenceById: (...args) => this.loadSequenceById(...args),
      pickMapFeature: (...args) => this.pickMapFeature(...args),
      openPickedMapDetection: (...args) => this.openPickedMapDetection(...args),
      pickTurboGraphic: (...args) => this.pickTurboGraphic(...args),
      pickTurboRepresentative: (...args) => this.pickTurboRepresentative(...args),
      getTurboOrganizationId: (...args) => this.getTurboOrganizationId(...args),
      drawClickRipple: (...args) => this.drawClickRipple(...args),
      updateTurboPickWarning: (...args) => this.updateTurboPickWarning(...args),
      ensureCoverageFrameLookup: (...args) => this.ensureCoverageFrameLookup(...args),
      ownedText: (...args) => this._owned(...args),
      coverageSelectionContext: (...args) => this.coverageSelectionContext(...args),
      getCoverageDisplayPosition: (...args) => this.getCoverageDisplayPosition(...args),
      toGeographic: geometry => webMercatorUtils.webMercatorToGeographic(geometry) as PreparedMapClick['point'],
    };
  }

  /** Bind live hover capabilities; timer/container lifetime remains inside the interaction factory. */
  private mapHoverHost(): MapHoverHost {
    const widget = this;
    return {
      get currentView() { return widget.state.jimuMapView?.view; },
      get closed() { return widget.props.state === "CLOSED"; },
      get turboModeActive() { return widget.state.turboModeActive; },
      get touchHover() { return widget._coverageTouchHover; },
      set touchHover(value) { widget._coverageTouchHover = value; },
      get workspaceLocation() { return widget._workspaceNoteLocation; },
      get hoverResume() { return widget._coverageHoverResume; },
      set hoverResume(value) { widget._coverageHoverResume = value; },
      get hoverHandler() { return widget._coverageHoverHandler; },
      set hoverHandler(value) { widget._coverageHoverHandler = value; },
      get alignment() { return widget._coverageAlignmentDiagnostic; },
      get hoverAbort() { return widget._turboHoverPickAbort; },
      set hoverAbort(value) { widget._turboHoverPickAbort = value; },
      get hoveredScreen() { return widget._turboHoveredScreen; },
      get leaveCleanup() { return widget._turboMapLeaveCleanup; },
      set leaveCleanup(value) { widget._turboMapLeaveCleanup = value; },
      get places() { return widget._places; },
      get tilePlaces() { return widget._placesVectorLayer; },
      get tooltip() { return widget.tooltipDiv; },
      get detailsTimer() { return widget._hoverTimeout; },
      set detailsTimer(value) { widget._hoverTimeout = value; },
      get hoveredId() { return widget._currentHoveredFeatureId; },
      set hoveredId(value) { widget._currentHoveredFeatureId = value; },
      get coverageRevision() { return widget._turboRequestCount; },
      get coverageLayer() { return widget.turboCoverageLayer; },
      get previewStatus() { return widget._hoverPreviewStatus; },
      get pendingHover() { return widget._pendingCoverageHover; },
      get cloudMap() { return widget._pointCloudMapLayer; },
      get cloudRenderer() { return widget._pointCloudViewerRenderer; },
      get viewer() { return widget.mapillaryViewer; },
      get tilePlacesOwner() { return widget._placesTilesOwner; },
      clearTurboHoverDetails: (...args) => this.clearTurboHoverDetails(...args),
      clearTurboHover: (...args) => this.clearTurboHover(...args),
      highlightSequenceOnVTL: (...args) => this.highlightSequenceOnVTL(...args),
      pickTurboRepresentative: (...args) => this.pickTurboRepresentative(...args),
      pickTurboGraphic: (...args) => this.pickTurboGraphic(...args),
      updateTurboHover: (...args) => this.updateTurboHover(...args),
      hitTestHoverLayers: (...args) => this.hitTestHoverLayers(...args),
      pickMapFeature: (...args) => this.pickMapFeature(...args),
      log: (...args) => this.log(...args),
      placesBusy: (...args) => this.placesBusy(...args),
      updateTurboPickWarning: (...args) => this.updateTurboPickWarning(...args),
      text: (...args) => this._t(...args),
    };
  }

  /**
   * Transfer widget interactions and feature resources to the incoming Experience Builder map view.
   * Retire old handlers and view-bound work before registering replacements.
   * View/startup revisions guard delayed shared-link restoration and SDK hit-test results after a view transfer.
   */
  private onActiveViewChange = (jmv: JimuMapView) => {
    const transfer = this._activeViewTransfer.begin(jmv?.view);
    if (!transfer) return;
    const { view } = transfer;
    this._activeViewTransfer.attach(transfer, this.activeViewAttachmentHost(view, jmv));

    const hoverHandler = createMapHoverHandler(view, this.mapHoverHost());

    // CLICK HANDLER
    this.mapClickHandle = view.on("click", evt => dispatchMapClick(evt, this.mapClickDispatchHost(view)));

    // HOVER HANDLER
    this.pointerMoveHandle = view.on("pointer-move", this._coverageHoverHandler = hoverHandler);
  };

  // #region MAP GRAPHICS
  // All methods that draw or remove graphics on the ArcGIS map view.
  // - drawPulsingPoint → animates active image point (green).
  // - drawClickRipple → shows short-lived red ripple at click.
  // - drawPoint → draws static red point for clicked location.
  // - drawCone → draws camera direction cone based on bearing.
  private drawPulsingPoint(lon: number, lat: number, baseColor: any = [0, 255, 0, 1], imageId = this.state.imageId) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    if (this._currentImagePresentation && !this._currentImagePresentation.owns(view.map)) return null;
    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);
    const graphic = this.ensureSelectionPulseOwner().show(view, anchor, lon, lat, baseColor, imageId, false);
    {
      try { this.ensureScreenDirectionCone()?.showMarker(view, anchor.lon, anchor.lat, baseColor, String(imageId)); }
      catch (error) { console.warn('[Mapillary] Combined marker unavailable; using native marker', error); }
    }
    if (this.state.turboModeActive && imageId) void this.resolveNativeImageAnchor(String(imageId), lon, lat);
    return graphic;
  }

  /** Bind selection identity and host factories once; factories are used only when drawing. */
  private ensureSelectionPulseOwner(): SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {
    const widget = this;
    return this._selectionPulse ??= new SelectionPulse(
      { get graphic() { return widget.currentGreenGraphic; }, set graphic(value) { widget.currentGreenGraphic = value; } },
      { point: properties => new this.ArcGISModules.Point(properties), layer: properties => new this.ArcGISModules.GraphicsLayer(properties), graphic: properties => new this.ArcGISModules.Graphic(properties), overlay: () => typeof document !== "undefined" ? document.createElement("div") : null },
      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame), now: () => performance.now(), clearInterval: handle => clearInterval(handle) },
    );
  }

  /**
   * Unified ripple animation for clicks, warnings, and annotations.
   * @param lon Longitude (WGS84)
   * @param lat Latitude (WGS84)
   * @param rgb RGB array [R, G, B]: defaults to red [255, 0, 0]
   * @param initialAlpha Starting opacity:defaults to 0.5
   * @param outlineWidth Outline border width: defaults to 1
   */
  private drawClickRipple(lon: number, lat: number, rgb: [number, number, number] = [255, 0, 0], initialAlpha = 0.5, outlineWidth = 1) {
    if (!this.ArcGISModules) return;
    this._clickRippleAnimations ??= new ClickRippleAnimations(
      () => this.state.jimuMapView?.view, properties => new this.ArcGISModules.Graphic(properties),
      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame), now: () => performance.now() },
    );
    this._clickRippleAnimations.draw(lon, lat, rgb, initialAlpha, outlineWidth);
  }

  private clearClickRipples() {
    this._clickRippleAnimations?.dispose();
  }

  /**
   * Ensure the sequence layer belongs to the current view without rebuilding its graphics.
   * Used only by legacy coverage; native Turbo selection stays in the tile style.
   */
  private ensureActiveSequenceLayer(view: __esri.MapView | __esri.SceneView): __esri.GraphicsLayer {
    this._activeSequenceOverlay ??= new ActiveSequenceOverlay(properties => new this.ArcGISModules.GraphicsLayer(properties));
    if (this._activeSequenceOverlay.view !== view) this.clearActiveSequenceLayer();
    return this._activeSequenceOverlay.ensure(view);
  }

  private clearActiveSequenceLayer() {
    this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = ''; this._liveSequenceLine = null;
    this._activeSequenceOverlay?.dispose();
  }

  /** Draw a legacy sequence point; retain batching and deduplication, and skip Turbo coverage. */
  private drawPointWithoutRemoving(lon: number, lat: number, color: any = [0, 0, 255, 1], sequenceId?: string, imageId?: string, deferred?: __esri.Graphic[]) {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules || this.state.turboModeActive) return;

    const { Graphic } = this.ArcGISModules;

    const graphic = new Graphic(legacySequencePointProperties(lon, lat, color, jimuMapView.view.type === "3d", sequenceId, imageId));

    (graphic as any).__isActiveSequencePoint = true;
    if (sequenceId && color[0] === 0 && color[1] === 0 && color[2] === 255) {
      const layer = this.ensureActiveSequenceLayer(jimuMapView.view);
      const key = imageId ? `${sequenceId}:${imageId}` : `${sequenceId}:${lon}:${lat}`;
      const existing = this._activeSequenceOverlay!.points.get(key);
      if (existing) { existing.geometry = graphic.geometry; existing.symbol = graphic.symbol; }
      else { if (deferred) deferred.push(graphic); else layer.add(graphic); this._activeSequenceOverlay!.points.set(key, graphic); }
    } else this._ownedMapResources.addGraphic(jimuMapView.view, graphic);
  }

  /** Replace the clicked-location marker through the existing owned map-resource path. */
  private drawPoint(lon: number, lat: number) {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules) return;

    const { Graphic } = this.ArcGISModules;

    // Remove existing clicked location marker
    if (this.clickedLocationGraphic) {
      jimuMapView.view.graphics.remove(this.clickedLocationGraphic);
      this.clickedLocationGraphic = null;
    }

    const graphic = new Graphic(clickedLocationPointProperties(lon, lat));

    (graphic as any).__isSequenceOverlay = true;

    this._ownedMapResources.addGraphic(jimuMapView.view, graphic);
    this.clickedLocationGraphic = graphic;
  }

  /**
   * Removes ALL graphics tagged __isCone from the view.
   * Must be called instead of (or before) view.graphics.remove(this.currentConeGraphic).
   */
  private clearConeGraphics() {
    this._nativeCurrentImageMarker?.hideCone();
    this._screenDirectionCone?.hideCone();
    this.ensureCameraConeOwner().clear(this.state.jimuMapView?.view);
  }

  /** Ensures the camera cone layer exists and hugs the terrain at any elevation */
  private ensureConeLayer(): __esri.GraphicsLayer | null {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules?.GraphicsLayer) return null;
    return this.ensureCameraConeOwner().ensure(jimuMapView.view);
  }

  private ensureScreenDirectionCone(): ScreenDirectionCone | NativeCurrentImageMarker | null {
    if (typeof document === 'undefined') return null;
    if (this.state.jimuMapView?.view.type === '3d') {
      return this._nativeCurrentImageMarker ??= new NativeCurrentImageMarker(
        {
          point: p => new this.ArcGISModules.Point(p), mesh: p => new this.ArcGISModules.Mesh(p),
          layer: p => new this.ArcGISModules.GraphicsLayer(p), graphic: p => new this.ArcGISModules.Graphic(p),
          element: () => document.createElement('div')
        },
        { request: cb => requestAnimationFrame(cb), cancel: frame => cancelAnimationFrame(frame) },
        (presented, view) => {
          if (this._selectionPulse?.view === view && this._selectionPulse.layer && this._selectionPulse.layer.visible === presented)
            this._selectionPulse.layer.visible = !presented;
        });
    }
    return this._screenDirectionCone ??= new ScreenDirectionCone(
      properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),
      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },
      (presented, view) => {
        if (this._selectionPulse?.view === view && this._selectionPulse.layer) {
          const visible = !presented;
          if (this._selectionPulse.layer.visible !== visible) this._selectionPulse.layer.visible = visible;
        }
      });
  }

  /** Bind the SDK factory once; clearing before SDK readiness does not construct a layer. */
  private ensureCameraConeOwner(): CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {
    return this._cameraCone ??= new CameraConeGraphics(properties => new this.ArcGISModules.GraphicsLayer(properties));
  }

  /** Keep visible by default; explicit lock reuses the existing center/direction navigation. */
  private syncMapToImage(activeImg: { id: string; lon: number; lat: number }, view: __esri.MapView | __esri.SceneView) {
    const followAnchor = this.getCoverageDisplayPosition(String(activeImg.id), activeImg.lon, activeImg.lat);
    const followPoint = followAnchor.geometry || new this.ArcGISModules.Point({ longitude: followAnchor.lon, latitude: followAnchor.lat });
    if (this.props.config.syncMapWithImage === true && !this._isFlyInActive &&
      shouldRecenterImage(view, followPoint, this.state.lockToImage)) {
      const position = this.props.config.syncMapPosition || "center";
      // Profile tracking follows the image position without letting goTo resolve a new zoom.
      const followScale = view.scale;
      // Inset-triggered following should glide even during sequence playback.
      // Lock mode retains immediate tracking while playing; the SDK honors reduced motion.
      const followOptions = this.state.lockToImage
        ? { animate: this._userPaused, duration: this._userPaused ? 300 : 0 }
        : { animate: true, duration: 450, easing: "ease-in-out" };

      const targetPoint = new this.ArcGISModules.Point({
        longitude: activeImg.lon,
        latitude: activeImg.lat,
      });

      // 3D SCENE: GPS NAVIGATION MODE
      if (view.type === "3d") {
        const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);
        if (camera) this.navigateMapView(view, camera, followOptions);
      }
      // 2D MAP MODE
      else {
        // Standard Center
        if (position === "center") {
          this.navigateMapView(view, { center: targetPoint, scale: followScale }, followOptions);
        }
        // Offset Logic
        else {
          try {
            const wmPoint = webMercatorUtils.geographicToWebMercator(targetPoint) as __esri.Point;
            const extent = view.extent;

            if (wmPoint && extent) {
              const width = extent.width;
              const height = extent.height;
              const offsetFactor = 0.25; // 25% shift

              let newCenterX = wmPoint.x;
              let newCenterY = wmPoint.y;

              if (position === "east") {
                // Widget Left -> Show point on Right -> Move Camera Left (West)
                newCenterX = wmPoint.x - width * offsetFactor;
              } else if (position === "west") {
                // Widget Right -> Show point on Left -> Move Camera Right (East)
                newCenterX = wmPoint.x + width * offsetFactor;
              } else if (position === "north") {
                // Widget Bottom -> Show point on Top -> Move Camera Down (South)
                newCenterY = wmPoint.y - height * offsetFactor;
              } else if (position === "south") {
                // Widget Top -> Show point on Bottom -> Move Camera Up (North)
                newCenterY = wmPoint.y + height * offsetFactor;
              }

              const newCenter = new this.ArcGISModules.Point({
                x: newCenterX,
                y: newCenterY,
                spatialReference: { wkid: 3857 },
              });

              this.navigateMapView(view, { center: newCenter, scale: followScale }, followOptions);
            } else {
              this.navigateMapView(view, { center: targetPoint, scale: followScale }, followOptions);
            }
          } catch (e) {
            this.navigateMapView(view, { center: targetPoint, scale: followScale }, followOptions);
          }
        }
      }
    }
  }

  /**
   * Draws a camera view cone polygon at the given location and bearing.
   * 2D: flat orange polygon (draped onto layer)
   * 3D: a low wedge with 3D edge lines and draped ground fill.
   * Uses this.ensureConeLayer() with elevationInfo { mode: "relative-to-ground" }
   * so that the cone is always rendered on the terrain surface regardless of elevation.
   */
  /** Share one pending frame across zoom, camera and existing bearing updates. */
  private requestConeRedraw(view: __esri.MapView | __esri.SceneView): void {
    if (this.state.jimuMapView?.view !== view || view.destroyed || this._coneRedrawRaf != null) return;
    this._coneRedrawRaf = requestAnimationFrame(() => {
      this._coneRedrawRaf = null;
      if (this.state.jimuMapView?.view !== view || view.destroyed) return;
      const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);
      if (image && String(image.id) === String(this.state.imageId))
        this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
    });
  }

  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;
    if (this._currentImagePresentation && !this._currentImagePresentation.owns(view.map)) return null;
    if (this.mapillaryViewer) {
      const confirmed = this._currentImageBearing?.read(this.mapillaryViewer, this.state.imageId);
      if (confirmed === undefined) { this.clearConeGraphics(); return null; }
      heading = this._sharedStartupBearing ?? confirmed;
    }
    const screenCone = this.ensureScreenDirectionCone();
    if (screenCone) {
      const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);
      if (this._cameraCone?.graphic || this._cameraCone?.parts.length) this._cameraCone.clear(view);
      try { screenCone.show(view, anchor.lon, anchor.lat, heading, radiusMeters, spreadDeg); }
      catch (error) { screenCone.clear(); console.warn('[Mapillary] Direction fan unavailable', error); }
      return null;
    }
    // Non-DOM fallback retains the bounded native ground indicator.
    let displayRadius = coneDisplayRadius(radiusMeters, view.zoom);
    const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);
    const center = lonLatToWebMercator(anchor.lon, anchor.lat);
    if (!center) return null;
    if (view.type === "3d") {
      // Sample only currently rendered ground; never fetch heights or touch the pulse.
      const angle = heading * Math.PI / 180;
      const mercatorScale = 1 / Math.max(0.01, Math.cos(anchor.lat * Math.PI / 180));
      const measured = projectedConeRadius(radiusMeters, metres => {
        try {
          const point = new this.ArcGISModules.Point({
            x: center.x + metres * mercatorScale * Math.sin(angle),
            y: center.y + metres * mercatorScale * Math.cos(angle), spatialReference: { wkid: 3857 }
          });
          const ground = renderedGroundPoint(view, point, properties => new this.ArcGISModules.Point(properties));
          return ground ? view.toScreen(ground) : null;
        } catch { return null; }
      });
      if (measured !== null) displayRadius = measured;
    }
    // A direction indicator must not become a large ground footprint at close zoom.
    const maxPixels = Math.max(40, Math.min(96, Math.min(view.width || 384, view.height || 384) * 0.25));
    const scene = view.type === '3d', angle = heading * Math.PI / 180;
    const mercatorScale = 1 / Math.max(0.01, Math.cos(anchor.lat * Math.PI / 180));
    const bounded = displayRadius > 0 ? capConeFootprint(displayRadius, spreadDeg, scene, maxPixels, (distance, offset, up) => {
      try {
        const theta = angle + offset * Math.PI / 180;
        const point = new this.ArcGISModules.Point({ x: center.x + distance * mercatorScale * Math.sin(theta), y: center.y + distance * mercatorScale * Math.cos(theta), spatialReference: { wkid: 3857 } });
        if (!scene) return view.toScreen(point);
        const ground = renderedGroundPoint(view, point, properties => new this.ArcGISModules.Point(properties));
        if (!ground) return null;
        return view.toScreen(new this.ArcGISModules.Point({ x: ground.x, y: ground.y, z: ground.z + up, spatialReference: ground.spatialReference }));
      } catch { return null; }
    }) : 0;
    if (bounded !== null) displayRadius = bounded;
    else {
      // Missing terrain/projection: retain a conservative zoom-derived ground cap.
      const resolution = view.type === '2d' && Number.isFinite(view.resolution) && view.resolution > 0 ? view.resolution : 156543.03392804097 / 2 ** view.zoom;
      const metresPerPixel = resolution / mercatorScale;
      if (Number.isFinite(metresPerPixel) && metresPerPixel > 0) displayRadius = Math.min(displayRadius, maxPixels * metresPerPixel / 2);
    }
    if (!displayRadius) { this.clearConeGraphics(); return null; }
    const layer = this.ensureConeLayer();
    if (!layer) return null;
    const graphic = this.ensureCameraConeOwner().render(view, layer, center, anchor.lat,
      heading, displayRadius, spreadDeg, view.type === "3d", properties => new this.ArcGISModules.Graphic(properties),
      properties => new this.ArcGISModules.Mesh(properties));

    // Keep selection above the cone without removing/readding animated graphics.
    if (this._selectionPulse?.layer && this._selectionPulse?.view === view) view.map.reorder(this._selectionPulse?.layer, view.map.layers.length - 1);
    return graphic;
  }

  /**
   * Removes the current pulsing green graphic from the map and clears
   * its animation interval.
   */
  private clearGreenPulse() {
    this._nativeCurrentImageMarker?.hideMarker();
    this._screenDirectionCone?.hideMarker();
    this._nativeImageAnchorAbort?.abort(); this._nativeImageAnchorAbort = null; this._nativeImageAnchorKey = '';
    this.ensureSelectionPulseOwner().dispose();
  }

  /** Synchronize the bookmark URL from the current map viewport and image ID.
   * Legacy image-coordinate arguments remain accepted but are intentionally unused.
   * Parameter formatting, parent-history access and warning behavior live in browserUrlState.
   */
  private updateUrlWithCurrentImage(imageId?: string | null, _imageLat?: number, _imageLon?: number) {
    // Do not overwrite the incoming 2D/3D bookmark with the host's provisional view.
    if (!this._sharedStateRestoreComplete) return;
    syncBrowserUrl(imageId, this._browserUrlStateHost);
  }

  /** Bind live browser/map readers once; the navigation module owns the serialization contract. */
  private readonly _browserUrlStateHost: BrowserUrlStateHost<__esri.Point> = {
    getView: () => this.state.jimuMapView?.view,
    toGeographic: center => webMercatorUtils.webMercatorToGeographic(center) as __esri.Point | null,
    getWindow: () => window,
    getBearing: () => this._lastBearing,
    warn: error => console.warn("Could not synchronize URL state:", error),
  };

  /** Hover keeps a neon green line from native Mapillary tiles, independent of blue selection. */
  private highlightSequenceOnVTL(sequenceId: string | null) {
    const startedAt = performance.now();
    const view = this.state.jimuMapView?.view;
    const work = this._nativeSequenceSelection.hover(sequenceId);
    const previous = this._hoverTimingTarget;
    if (previous?.sequenceId === sequenceId && previous.view === view && previous.work === work && !this._hoverTimingAbort?.signal.aborted)
      return previous.completion;
    this._hoverSequenceTiming?.cancel(); this._hoverTimingAbort?.abort();
    const controller = new AbortController(); this._hoverTimingAbort = controller;
    const measurement = sequenceId ? this._sequencePerformance?.begin('hover-highlight', startedAt) : undefined;
    this._hoverSequenceTiming = measurement;
    if (sequenceId) this._sequencePerformance?.count('hoverRequests');
    const completion = Promise.resolve(work).then(async () => {
      if (!measurement || controller.signal.aborted || !view || view.destroyed || this.state.jimuMapView?.view !== view) return;
      if (view.type === '3d') {
        const layer = view.map.findLayerById(`mapillary-cached-hover-${sequenceId}`) as __esri.VectorTileLayer | undefined;
        if (!layer?.visible) { measurement.cancel(); return; }
        await this.waitForTurboCoverageReady(view, layer, controller.signal);
      }
      // Measure SDK readiness plus the following visible browser frame, not style assignment alone.
      await this.waitForSequencePaint(controller.signal);
      if (this._hoverSequenceTiming === measurement && !controller.signal.aborted) measurement.finish();
    }).catch(() => { measurement?.cancel(); });
    this._hoverTimingTarget = { sequenceId, view, work, completion };
    return completion;
  }

  /** Yield two animation frames for presentation; reject cancellation or a document hidden at entry. */
  private waitForSequencePaint(signal: AbortSignal): Promise<void> {
    return waitForSequencePaint(signal);
  }

  // #region UTILITIES
  // Misc helpers used across the widget.

  // Fetch ID from Username
  private async getUserIdFromUsername(username: string): Promise<number | null> {
    return resolveCreatorId(username, this.accessToken, this._userIdCache);
  }

  /**
   * Enrich the current image address as optional background work.
   * Abort the prior lookup and publish only while the originating image and view remain current.
   * @param lat Image latitude in WGS84 degrees.
   * @param lon Image longitude in WGS84 degrees.
   */
  private fetchReverseGeocode = (lat: number, lon: number) => this._reverseAddressEnrichment.run(lat, lon);

  /*
   * Displays a zoom warning.
   * @param message Text to display
   * @param duration Time in ms. If 0, the message stays indefinitely until cleared manually.
   */
  private showZoomWarning(message: string, duration: number = TIMING.WARNING_DEFAULT_MS) {
    this._zoomWarningTimer.show(message, duration);
  }

  // Manual clearing also resets the warning action, unlike automatic expiry.
  private clearZoomWarning() {
    this._zoomWarningTimer.clear();
  }

  /**
   * Displays a temporary "no image available" message to the user.
   * Message auto-dismisses after 4 seconds.
   */
  private showNoImageMessage() {
    this.setState({
      noImageMessageVisible: true,
      isLoading: false,
    });
    // Automatically hide after fade (4 seconds)
    setTimeout(() => {
      this.setState({ noImageMessageVisible: false });
    }, 4000);
  }

  // Immediately hides the "no image available" message.
  private clearNoImageMessage() {
    this.setState({ noImageMessageVisible: false });
  }

  /**
   * Applies the configured camera center offset to the Mapillary viewer.
   * Uses cameraX/cameraY from widget config, defaulting to [0.5, 0.5]
   * (standard horizon center) if values are absent.
   * Called on every image change and window resize to ensure
   * the viewport stays correctly aligned regardless of widget dimensions.
   */
  private applyCustomCameraAngle = () => {
    const x = this.props.config.cameraX ?? 0.5;
    const y = this.props.config.cameraY ?? 0.5;

    if (this.mapillaryViewer) {
      this.mapillaryViewer.setCenter([x, y]);
    }
  };

  /**
   * Official Mapillary Time Travel Logic:
   * 1. Distance < 12 meters.
   * 2. Compass Angle Difference < 22.5°.
   * 3. Must be from a different date (to be "Time Travel").
   */
  private loadTimeTravelPreview = (imageId: string, signal: AbortSignal) => loadTimeTravelPreview(imageId, this.accessToken, signal);

  private checkForTimeTravel = (currentImageId: string): Promise<void> => {
    this._timeTravelAvailability ??= new TimeTravelAvailability(() => this.accessToken, (imageId, hasTimeTravel) => {
      if (String(this.state.imageId) === imageId) this.setState({ hasTimeTravel });
    }, (work, signal) => this.runSequenceBackground(work, signal));
    return this._timeTravelAvailability.update(String(currentImageId));
  };

  /**
   * Displays a temporary toast notification.
   * @param message - React node content to display inside the toast
   * @param duration - Time in milliseconds before the toast disappears (default: 2500ms)
   */
  private showToast(message: React.ReactNode, duration: number = 2500, owner?: "point-cloud-progress") {
    this._toastNotifications.show(message, duration, owner);
  }
  /** Center on the matching sequence frame, retaining minimum zoom, animation and feedback. */
  private handleCenterMap = () => {
    const { imageId, sequenceImages, jimuMapView } = this.state;
    if (!imageId || !jimuMapView) return;

    const currentImg = sequenceImages.find((img) => img.id === imageId);
    if (currentImg) {
      this.navigateMapView(jimuMapView.view,
        {
          center: [currentImg.lon, currentImg.lat],
          zoom: Math.max(jimuMapView.view.zoom, 17),
        },
        { animate: true, duration: 800 },
      );

      this.showToast(
        mapCenteredFeedback(() => this._t('appMapCenteredOnCurrentFrame')),
      );
    }
  };
  /** Toggle camera/map heading synchronization and publish its existing feedback. */
  private handleToggleSyncHeading = () => {
    const newSyncHeading = !this.state.syncHeading;
    this.setState({ syncHeading: newSyncHeading });

    this.showToast(
      headingSyncFeedback(newSyncHeading, key => this._t(key)),
    );
  };

  // Helper for Debug Logging
  private log = (...args: any[]) => {
    if (this.props.config.debugMode) {
      // Adds a prefix so you can easily filter in Chrome DevTools
      console.log("%c[Mapillary Widget]", "color: #37d582; font-weight: bold;", ...args);
    }
  };

  /** Schedule nearby discovery for the paused frame; expanded requests widen the sample on demand.
   * @param immediate Bypass the normal discovery delay when the tray first opens.
   * @param expanded Search the larger sample requested by the user.
   */
  private refreshNearbyAfterPause = (immediate = false, expanded = false) => {
    const image = this._liveSequenceFrames.find(String(this.state.imageId)) || this.state.sequenceImages.find((img: { id: string; lat: number; lon: number }) => String(img.id) === this.state.imageId);
    if (image && this._userPaused) this.fetchNearbyImages(image.lat, image.lon, String(image.id), immediate, expanded);
  };
  private _nearbyDemandVisible = false;
  private _nearbyPointerInside = false;
  private nearbyPanelVisible = () => !!this.state.nearbyStripOpen && this.state.imageTrayTab !== 'object' &&
    this.props.state !== 'CLOSED' && this.props.visible !== false && !this.state.isLoading && this._imageryOpeningRequest == null &&
    (!this._currentImagePresentation || !!this.state.jimuMapView?.view?.map && this._currentImagePresentation.owns(this.state.jimuMapView.view.map));
  /**
   * Schedule nearby discovery around the display anchor only while the nearby panel is eligible.
   * The discovery owner controls debounce, interaction pauses and request cancellation.
   * @param lat Anchor latitude in WGS84 degrees.
   * @param lon Anchor longitude in WGS84 degrees.
   * @param imageId Current capture excluded by discovery.
   * @param immediate Request discovery without the usual scheduling delay.
   * @param expanded Use the larger user-requested discovery sample.
   */
  private fetchNearbyImages(lat: number, lon: number, imageId: string, immediate = false, expanded = false) {
    if (!this.nearbyPanelVisible()) return;
    this._nearbyDiscovery ??= new NearbyImageDiscovery({
      getState: () => this.state,
      update: patch => this.setState(patch),
      isPaused: () => this._userPaused,
      isVisible: () => this.nearbyPanelVisible(),
      isInteracting: () => this._nearbyPointerInside,
      getToken: () => this.accessToken,
      isInitialLoad: () => this._isInitialImageLoad,
      markInitialLoadComplete: () => { this._isInitialImageLoad = false; },
      runBackground: (work, signal) => this.runSequenceBackground(work, signal),
    });
    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);
    this._nearbyDiscovery.schedule(anchor.lat, anchor.lon, imageId, immediate, expanded);
  }

  private readonly _nearbyImageSelection = new NearbyImageSelection<__esri.MapView | __esri.SceneView>({
    viewer: () => this.mapillaryViewer,
    selection: () => this._selectionRequestId,
    view: () => this.state.jimuMapView?.view,
    cancelDiscovery: () => this._nearbyDiscovery?.cancel(),
    select: id => { this.highlightNearbyPin(null); this._nearbySelectedId = id; this.forceUpdate(); },
    heading: (heading, view) => { this._lastBearing = heading; if (view) this.requestConeRedraw(view); },
    warn: error => this.log('[Mapillary nearby] Image selection failed:', error),
  });

  /** Open a tray capture; the owner restores heading only for the current selection. */
  private selectNearbyImage(img: NearbyImage): Promise<void> {
    return this._nearbyImageSelection.open(img);
  }

  /**
   * Places or removes a temporary highlight pin on the ArcGIS map to indicate
   * the geographic position of a hovered nearby-image thumbnail.
   * Only one pin exists at a time, calling this method always removes the
   * previous graphic before adding a new one. Pass `null` to clear the pin
   * without adding a replacement (e.g. on mouse-leave).
   * @param img - The nearby image whose coordinates should be pinned, or
   *              `null` to remove the existing pin.
   */
  private highlightNearbyPin(img: NearbyImage | null) {
    this._nearbyHoverAbort?.abort(); this._nearbyHoverAbort = null;
    this._nearbyHighlight ??= new NearbyImageHighlight<__esri.Graphic>();
    const view = this.state.jimuMapView?.view, pose = img && nearbyImagePose(img);
    if (!view || !img || !pose || String(img.id) === String(this.state.imageId) || (this._currentImagePresentation && !this._currentImagePresentation.owns(view.map))) {
      this._nearbyHighlight.update(view, this.ArcGISModules, this.state, null); return;
    }
    const context = this.coverageSelectionContext();
    const anchor = this._coverageSelectionTargets.anchor(context, String(img.id));
    if (anchor || !context.enabled || !context.individual) {
      this._nearbyHighlight.update(view, this.ArcGISModules, this.state, img, anchor ? { lon: anchor.lon, lat: anchor.lat } : undefined); return;
    }
    // Resolve the exact ID from shared coverage bytes before displaying a new
    // preview; nearby API coordinates must never snap to a neighbouring image.
    this._nearbyHighlight.clear();
    const controller = new AbortController(); this._nearbyHoverAbort = controller;
    void this.resolveNearbyPreviewAnchor(view, img, pose, controller);
  }

  /**
   * Resolve the exact nearby capture in native coverage before drawing its hover pin.
   * Abort/view/selection checks prevent a departed thumbnail from publishing a late marker.
   */
  private async resolveNearbyPreviewAnchor(view: __esri.MapView | __esri.SceneView, img: NearbyImage, pose: { lon: number; lat: number }, controller: AbortController): Promise<void> {
    const context = { ...this.coverageSelectionContext() }, token = this.accessToken;
    const current = () => this._nearbyHoverAbort === controller && !controller.signal.aborted && this.state.jimuMapView?.view === view && !view.destroyed &&
      this.accessToken === token && this.state.turboModeActive && this.props.state !== 'CLOSED' && this.props.visible !== false &&
      (!this._currentImagePresentation || this._currentImagePresentation.owns(view.map)) &&
      this.coverageSelectionContext().revision === context.revision && this.coverageSelectionContext().layer === context.layer;
    try {
      const zoom = ZOOM.TILE_FETCH, n = 2 ** zoom, latitude = Math.max(-85.05112878, Math.min(85.05112878, pose.lat));
      const x = Math.max(0, Math.min(n - 1, Math.floor((pose.lon + 180) / 360 * n))), y = Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * n)));
      const tiles: [number, number, number][] = [[x, y, zoom]];
      for (const [key] of this._turboTileCache.snapshot()) {
        const [z, tx, ty] = key.split('/').map(Number); if (z === zoom && Math.abs(tx - x) <= 1 && Math.abs(ty - y) <= 1 && (tx !== x || ty !== y)) tiles.push([tx, ty, z]);
      }
      for (const tile of tiles) {
        if (!current()) return;
        const [tx, ty, z] = tile, buffer = this._turboTileCache.get(`${z}/${tx}/${ty}`) ?? await this.runSequenceBackground(signal => this.getTurboTileBuffer(tile, signal), controller.signal);
        if (!current()) return; if (!buffer.byteLength) continue;
        const index = this._sequenceTileIndex.has(buffer) ? await this.getSequenceTileIndex(buffer, controller.signal) : await this.runSequenceBackground(signal => this.getSequenceTileIndex(buffer, signal), controller.signal); if (!current()) return;
        const point = nativeImageAnchor(buffer, index, bytes => new VectorTile(new Pbf(new Uint8Array(bytes))), tile, String(img.id));
        if (!point) continue;
        this._coverageSelectionTargets.retain(this.coverageSelectionContext(), String(img.id), new this.ArcGISModules.Point({ ...point, spatialReference: { wkid: 3857 } })); break;
      }
    } catch (error) { if (current() && (error as any)?.name !== 'AbortError') this.log('[Mapillary nearby] Coverage alignment unavailable:', error); }
    if (current()) {
      const anchor = this.getCoverageDisplayPosition(String(img.id), pose.lon, pose.lat);
      this._nearbyHighlight?.update(view, this.ArcGISModules, this.state, img, anchor);
    }
  }

  private getFeatureZoomThresholds(view: __esri.MapView | __esri.SceneView) {
    return {
      coverage: ZOOM.FEATURES_COVERAGE,

      interactive: ZOOM.FEATURES_INTERACTIVE,
    };
  }

  // #endregion UTILITIES

  // Main UI rendering logic
  // Contains 3 key zones:
  //   1. Map + Viewer area
  //   2. Overlay controls (sequence selector, info, legend)
  //   3. Fullscreen mode portal
  // Conditional rendering is used for:
  //   - Spinner overlay (isLoading)
  //   - Initial empty message
  //   - Sequence dropdown (availableSequences.length > 1)
  //   - Info box + legend (only when image loaded)
  private _runtimeLocale: LocaleValue | null = null;
  private get _presentation() { return this._runtimeLocale?.presentation || englishPresentation; }
  private _owned = (source: string, values?: Record<string, string | number>) => this._runtimeLocale?.owned(source, values) ?? englishPresentation.text(source, values);
  private _presentationHandle: { remove(): void } | null = null;
  private _presentationOwner: unknown = null;
  /** Subscribe to committed presentation changes and release the prior subscription; refresh callbacks do not select data. */
  private bindPresentation = (locale: LocaleValue) => {
    if (this._presentationOwner === locale.presentation) return;
    this._presentationHandle?.remove(); this._presentationOwner = locale.presentation;
    this._presentationHandle = locale.presentation.onChange(() => this.refreshPresentation());
  };
  private _localizedCloudSummary?: () => string;
  /** Refresh visible localized summaries, legends and popup labels without replacing their data sources. */
  private refreshPresentation() {
    const summary = this._localizedCloudSummary?.(); if (summary && this.state.pointCloudVisible) this.setState({ pointCloudSummary: summary });
    this._mapSymbolLegend?.refreshLocale(); this._places?.refreshLocale(); this._elevationProfile?.refreshLocale();
    const layer = this._sharedNotesLayer as any;
    if (layer && !layer.destroyed) {
      const popup = layer.popupTemplate;
      if (popup) { popup.title = this._owned(popup.title); for (const section of popup.content?.toArray?.() || (Array.isArray(popup.content) ? popup.content : [])) for (const info of section.fieldInfos || []) if (info.label) info.label = this._owned(info.label); for (const action of popup.actions?.toArray?.() || popup.actions || []) if (action.title) action.title = this._owned(action.title); }
      const renderer = layer.renderer?.clone?.(); if (renderer?.uniqueValueInfos) { renderer.uniqueValueInfos = renderer.uniqueValueInfos.map((entry: any) => ({ ...entry, label: this._owned(entry.label) })); layer.renderer = renderer; }
    }
  }
  private _t = (key: MessageKey, values?: Record<string, string | number>) => this._runtimeLocale?.t(key, values) ?? message(en, key, values);
  /** Supply the active locale to the runtime render adapter; side-effectful presentation refresh follows locale commit. */
  private renderLocaleContent = (locale: LocaleValue) => { this._runtimeLocale = locale; return this.renderLocalizedContent(); };
  /** Provide widget-scoped localization and delegate layout orchestration to the localized render adapter. */
  render() {
    return <WidgetLocaleProvider key={this.props.id} appLocale={this.props.intl?.locale} widgetId={this.props.id}
      defaultLanguage={this.props.config.widgetLanguage || "auto"} allowUserChoice={this.props.config.allowUserLanguageChoice !== false}><LocaleContent render={this.renderLocaleContent} onCommit={this.bindPresentation} /></WidgetLocaleProvider>;
  }

  /**
   * Compose existing feature panels and stateless viewer views from live state and callbacks.
   * Keep SDK containers ref-owned and empty; fullscreen portal ownership remains here rather than in feature views.
   */
  private renderLocalizedContent() {
    const mapWidgetId = this.props.useMapWidgetIds?.[0];

    // This is the viewer container. It will be placed either in normal widget or fullscreen portal.
    const viewerArea = (
      <ViewerSurface viewerRef={this.viewerContainer} measurementRef={this.measureLabelRef}
        t={this._t} imageId={this.state.imageId} isLoading={this.state.isLoading}
        turboLoading={this.state.turboLoading} featuresLoading={this.state.featuresLoading}
        noImageMessageVisible={this.state.noImageMessageVisible}
        lasso={{
          active: this.state.isLassoMode, polygon: this.state.lassoPolygon,
          onStart: this.handleLassoStart, onMove: this.handleLassoMove,
          onEnd: this.handleLassoEnd, onCancel: this.handleLassoCancel
        }}
        loading={{
          loading: this.state.isLoading || !!this.state.coverageFrameResolving,
          hasImage: !!this._lastSuccessfulSelection, representative: !!this.state.imageryRepresentative,
          resolving: !!this.state.coverageFrameResolving || !!this._selectionRetry?.nearestToClick,
          progress: this.state.sequenceRouteProgress, onCancel: this.cancelNearestFrameSelection
        }}>
        {/* IMAGE UTILITY GROUP */}
        {this.state.imageId && (
          <ImageUtilityGroup
            hideTimeTravel={this.props.config.hideTimeTravel}
            hideShareButton={this.props.config.hideShareButton}
            hideImageDownload={this.props.config.hideImageDownload}
            hideSyncHeadingButton={this.state.isFullscreen || this.props.config.hideSyncHeadingButton}
            hideCenterMapButton={this.state.isFullscreen || this.props.config.hideCenterMapButton}
            hasTimeTravel={this.state.hasTimeTravel}
            isDownloading={this.state.isDownloading}
            syncHeading={this.state.syncHeading}
            mapFollowEnabled={this.props.config.syncMapWithImage === true && !this.state.isFullscreen}
            hideMapFollowButton={this.props.config.hideMapFollowButton}
            lockToImage={this.state.lockToImage}
            onToggleImageLock={() => this.setState(previous => ({ lockToImage: !previous.lockToImage }), () => {
              const view = this.state.jimuMapView?.view;
              const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);
              if (this.state.lockToImage && view && image && String(image.id) === String(this.state.imageId)) this.syncMapToImage(image, view);
            })}
            is3D={this.state.jimuMapView?.view?.type === "3d"}
            imageId={this.state.imageId}
            sequenceImages={this.state.sequenceImages}
            loadTimeTravelPreview={this.loadTimeTravelPreview}
            onTimeTravel={(lat, lon, imageId) => {
              const url = `https://www.mapillary.com/app/time-travel?lat=${lat}&lng=${lon}&z=17&pKey=${imageId}&focus=photo`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            onShare={this.copyShareLink}
            onDownload={this.downloadActiveImage}
            onToggleSyncHeading={this.handleToggleSyncHeading}
            onCenterMap={this.handleCenterMap}
            hidePointCloud={this.state.isFullscreen || this.props.config.hidePointCloud}
            pointCloudLoading={this.state.pointCloudLoading}
            pointCloudSummary={this.state.pointCloudSummary}
            pointCloudIncomplete={this.state.pointCloudIncomplete}
            onRetryPointCloud={() => void this.loadPointCloudLayer(true, true)}
            pointCloudAutoPaused={!!this.state.pointCloudAutoPaused}
            pointCloudActive={!!this._pointCloudAcquisition.active}
            pointCloudVisible={this.state.pointCloudVisible}
            pointCloudAvailable={this.state.pointCloudAvailable}
            pointCloudFollowImages={!!this.state.pointCloudFollowImages}
            onPointCloudFollowImagesChange={(enabled: boolean) => {
              this._pointCloudAcquisition.resetFailures();
              this.setState({ pointCloudFollowImages: enabled, pointCloudAutoPaused: false });
              if (!enabled) this._pointCloudAcquisition.cancelFollow();
            }}
            onTogglePointCloud={this.togglePointCloud}
          />
        )}

        {/* NEARBY CAPTURES BOTTOM STRIP */}
        {this.state.nearbyStripOpen && <ImageTray state={this.state}
          selectedNearbyId={this._nearbySelectedId} formatLocale={this._runtimeLocale?.formatLocale}
          t={this._t} owned={this._owned}
          onChangeTab={tab => { this.highlightNearbyPin(null); if (tab === 'object') this.revealDetectionTools(); this.setState({ imageTrayTab: tab }); }}
          onSearchMore={() => this.refreshNearbyAfterPause(true, true)}
          onClose={() => { this.highlightNearbyPin(null); this.setState({ nearbyStripOpen: false }); }}
          onNearbyPointerEnter={event => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') this._nearbyPointerInside = true; }}
          onNearbyPointerLeave={() => { this._nearbyPointerInside = false; this._nearbyDiscovery?.flush(); }}
          onSelectNearby={image => this.selectNearbyImage(image)} onHighlightNearby={image => this.highlightNearbyPin(image)}
          onSelectAssociated={this._handleSelectAlternateImage}
          onRetryAssociated={() => { const location = this.state.selectedFeatureLocation; const id = this.state.selectedFeatureMetadata?.id; if (location && id) void this.fetchAlternateImages(id, location.lat, location.lon); }} />}
      </ViewerSurface>
    );

    /**
     * NORMAL MODE BLOCK (inside widget bounds)
     */
    const coverageNoticeVisible = !!this.state.zoomWarningMessage && this.shouldShowCoverageNotice();
    const coverageBarVisible = this.shouldShowCoverageBar();
    const coveragePresentation = this.getCoverageBarPresentation();
    const coverageBarHint = this.getCoverageBarHint();
    const guideContext = this.getExplorerGuideContext();
    const coverageHelpId = `${this.props.id || "mapillary"}-coverage-help`;

    const normalMode = (
      <div
        dir={this._runtimeLocale?.direction || "ltr"} lang={this._runtimeLocale?.formatLocale || "en-US"} className={`widget-mapillary jimu-widget ${this.state.showAiTags ? "" : "hide-mly-tags"}`}
        style={widgetLayout.widgetContainer}
      >
        {/* wraping this logic component in display:none so it doesn't break the Flex layout */}
        <div style={widgetLayout.mapConnectionHost}>{mapWidgetId ? <JimuMapViewComponent useMapWidgetId={mapWidgetId} onActiveViewChange={this.onActiveViewChange} /> : null}</div>

        {/* showing error only if strictly needed,
                    separate from the logic component
                    missing map widget warning overlay*/}
        {!mapWidgetId && (
          <div style={glassStyles.missingMapContainer}>
            <div style={glassStyles.missingMapCard}>
              <div style={glassStyles.missingMapIcon}>
                <Icons.Warning size={36} />
              </div>

              <h3 style={glassStyles.missingMapTitle}> {this._t('appMapConnectionRequired')} </h3>

              <p style={glassStyles.missingMapText}> {this._t('appTheMapillaryExplorerNeedsToBeLinkedToA')} </p>

              <div style={glassStyles.missingMapInstructionsBox}>
                <div style={glassStyles.missingMapInstructionsTitle}> {this._t('appHowToFix')} </div>
                <ol style={glassStyles.missingMapInstructionsList}>
                  <li>
                    {this._t('appOpenThisWidgetS')} <b> {this._t('appSettings')} </b>  {this._t('appPanel')} </li>
                  <li>
                    {this._t('appGoToThe')} <b> {this._t('appSource')} </b>  {this._t('appTab')} </li>
                  <li>
                    {this._t('appClick')} <b> {this._t('appSelectMapWidget')} </b>
                  </li>
                  <li> {this._t('appSelectYourTargetMapName')} </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Empty React-owned host: the SDK profile reserves its own space above imagery on mobile. */}
        <div ref={this.setProfileFlowHost} className="mly-profile-flow-dock" style={widgetLayout.profileFlowDock} />
        <div className="mly-viewer-workspace" style={widgetLayout.viewerWorkspace}>
          {viewerArea}

          {(this.state.toastMessage || this.state.pointCloudLoading) && <div style={this.state.isLoading ? widgetLayout.loadingToastContainer : widgetLayout.toastContainer}>
            <div style={widgetLayout.toastMessage}>{this.state.toastMessage || <OwnedMessage source={"Loading point cloud…"} />}</div>

          </div>}

          <FieldNotesOverlay state={this.state} settings={this.props.config}
            detectionActions={{
              onChoose: this.chooseDetectionNoteLocation,
              onCancel: this.cancelDetectionNoteLocation,
              onClose: this.dismissViewerDetection,
            }}
            panelActions={{
              onLoadDetectionPreview: this.loadDetectionPreview,
              onLoadDetectionAttachment: this.loadDetectionNoteAttachment,
              onDetectionDraftFinished: this.finishDetectionWorkspaceMarker,
              onDetectionDraftLocation: this.moveDetectionWorkspaceMarker,
              onClearDetectionWorkspaceDraft: this.clearDetectionWorkspaceDraft,
              onLoadEnterpriseNotes: this.loadEnterpriseNotesPage,
              loadEnterpriseIdentityManager: this.loadEnterpriseIdentityManager,
              onAttachments: note => void this.openFieldNoteAttachments(note),
              onUploadAttachment: this.uploadFieldNoteAttachment,
              onDownloadAttachment: this.downloadFieldNoteAttachment,
              onCloseAttachments: this.closeFieldNoteAttachments,
              onEditNote: this.editLocalFieldNote,
              onEditSharedNote: note => void this.openSharedFieldNoteEditor(note),
              onSaveEdit: this.saveFieldNoteEdit,
              onCancelEdit: this.cancelFieldNoteEdit,
              onShareNote: this.publishFieldNote,
              onRetrySharedDisplay: () => void this.syncSharedFieldNotes(true),
              onSubmitNote: this.submitFieldNote,
              onCancelPending: this.cancelPendingFieldNote,
              onDeleteNote: this.deleteFieldNote,
              onClearAll: this.clearAllFieldNotes,
              onExport: this.exportFieldNotes,
              onImportFile: this.importFieldNotesFile,
              onFocusNote: this.focusFieldNote,
              onWorkspaceMapChange: this.updateWorkspaceMapNotes,
              onWorkspacePickLocation: this.requestWorkspaceNoteLocation,
              onCloseList: () => this.setState({ fieldNotesListOpen: false }),
            }}
          />

          {/* INFO BOX */}
          {!this.state.isFullscreen && <InfoBox
            imageInformationHost={this._imageInformationHost} imageInformationViewer={this.mapillaryViewer}
            imageInformationActive={this.props.state !== 'CLOSED' && this.props.visible !== false}
            detectionToolsRequest={this._detectionToolsRequest}
            hideInfoBox={this.props.config.hideInfoBox}
            turboCreator={this.props.config.turboCreator}
            turboOrganization={this.props.config.turboOrganization || this.state.turboFilterOrganization}
            turboOrganizationName={this.getOrganizationDisplayName()}
            imageId={this.state.imageId}
            address={this.state.address}
            currentZoom={this.state.currentZoom}
            jimuMapViewZoom={this.state.jimuMapView?.view?.zoom}
            qualityViewType={this.state.jimuMapView?.view?.type === '2d' ? '2d' : this.state.jimuMapView?.view?.type === '3d' ? '3d' : undefined}
            sequenceImages={this.state.sequenceImages}
            turboModeActive={this.state.turboModeActive}
            turboColorByDate={this.state.turboColorByDate}
            turboYearLegend={this.state.turboYearLegend}
            selectedTurboYear={this.state.selectedTurboYear}
            trafficSignsActive={this.state.trafficSignsActive}
            objectsActive={this.state.objectsActive}
            detectionsActive={this.state.detectionsActive}
            showAiTags={this.state.showAiTags}
            detectionExplorer={this.state.detectionExplorer}
            detectionSummary={this.state.detectionSummary}
            onChangeDetectionExplorer={this.changeDetectionExplorer}
            alternateImages={this.state.alternateImages}
            isFetchingAlternates={this.state.isFetchingAlternates}
            accessToken={this.accessToken}
            onYearLegendClick={this.handleYearLegendClick}
            mapFeatureExportLoading={this.state.mapFeatureExportLoading}
            onDownloadFeatures={this.downloadCurrentFeatures}
            onToggleDetections={this.toggleDetections}
            onToggleAiTags={this.toggleAiTags}
            onCloseAlternates={() => this.setState({ alternateImages: [], targetDetectionId: null })}
            onSelectAlternateImage={this._handleSelectAlternateImage}
            coverageAnalysisLoading={this.state.coverageAnalysisLoading}
            coverageAnalysisProgress={this.state.coverageAnalysisProgress}
            onCancelCoverageAnalysis={this.cancelCoverageAnalysis}
            coverageResult={this.state.coverageResult}
            coverageSegmentsVisible={this.state.coverageSegmentsVisible}
            turboPointsAvailable={!!this.turboCoverageLayer && !this.state.turboLoading}
            turboMinZoom={ZOOM.TURBO_MIN}
            onToggleCoverageSegments={this.toggleCoverageSegments}
            onRunCoverageAnalysis={this.runCoverageAnalysis}
            hideCoverageAnalysis={this.props.config.hideCoverageAnalysis}
            onDismissCoverageResult={() => {
              this.clearCoverageSegments(true);
              this.setState({ coverageResult: null });
            }}
            onCopyCoordinates={this.copyImageCoordinates}
            pointCloudSummary={this.state.pointCloudSummary}
            pointCloudIncomplete={this.state.pointCloudIncomplete}
            pointCloudAutoPaused={!!this.state.pointCloudAutoPaused}
            pointCloudPrevious={!!this.state.pointCloudPrevious}
            onRetryPointCloud={() => { this._pointCloudAcquisition.resetFailures(); this.setState({ pointCloudAutoPaused: false }, () => void this.loadPointCloudLayer(false, true)); }}
            pointCloudLoading={this.state.pointCloudLoading}
            pointCloudAdaptive={!!this.state.pointCloudAdaptive}
            onPointCloudAdaptiveChange={(enabled: boolean) => this.setState({ pointCloudAdaptive: enabled })}
            pointCloudVisible={this.state.pointCloudVisible}
            isMeasureMode={this.state.isMeasureMode}
            measurePoints={this.state.measurePoints}
            onToggleMeasureMode={this.toggleMeasureMode}
            onClearMeasurement={this.clearMeasurement}
            isLassoMode={this.state.isLassoMode}
            onToggleLassoMode={this.toggleLassoMode}
            onClearLasso={this.clearLasso}
            showCalibrationPanel={this.state.showCalibrationPanel}
            pointCloudColorMode={this.state.pointCloudColorMode}
            nudgeStep={this.state.nudgeStep}
            onToggleCalibrationPanel={this.toggleCalibrationPanel}
            onJoystickNudge={this.handleJoystickNudge}
            onResetCalibration={this.resetCalibration}
            onSetNudgeStep={(step) => this.setState({ nudgeStep: step })}
            pointCloudLength={this.state.pointCloudLength}
            pointCloudMaxLength={this.state.pointCloudMaxLength}
            pointCloudActualLength={this.state.pointCloudActualLength}
            pointCloudWidth={this.state.pointCloudWidth}
            pointCloudMaxWidth={this.state.pointCloudMaxWidth}
            pointCloudActualWidth={this.state.pointCloudActualWidth}
            onWidthChange={this.handlePointCloudWidthChange}
            onLengthChange={this.handlePointCloudLengthChange}
            pointCloudExportLoading={!!this.state.pointCloudExportLoading}
            onDownloadPointCloud={this.downloadPointCloud}
            isSightMode={this.state.isSightMode}
            sightObserver={this.state.sightObserver}
            sightTargets={this.state.sightTargets}
            isViewshedMode={this.state.isViewshedMode}
            onToggleViewshedMode={this.toggleViewshedMode}
            onClearViewshed={this.clearViewshed}
            onToggleSightMode={this.toggleSightMode}
            onClearSight={this.clearSight}
            enableQualityView={this.props.config.enableQualityView}
            qualityViewActive={this.state.qualityViewActive}
            onToggleQualityView={this.toggleQualityView}
            selectedQualityBand={this.state.selectedQualityBand}
            onQualityLegendClick={this.handleQualityLegendClick}
            nearbyCount={this.state.nearbyImages?.length ?? 0}
            nearbyLoading={!!this.state.nearbyLoading}
            nearbyStripOpen={!!this.state.nearbyStripOpen}
            onToggleNearbyStrip={() => this.setState((prev) => ({ nearbyStripOpen: !(prev.nearbyStripOpen && prev.imageTrayTab !== "object"), imageTrayTab: "nearby", fieldNotesListOpen: false }))}
            fieldNotesCount={this.state.fieldNotes.length}
            isAnnotationMode={this.state.isAnnotationMode}
            fieldNotesListOpen={this.state.fieldNotesListOpen}
            onToggleAnnotationMode={this.toggleAnnotationMode}
            onToggleFieldNotesList={() => this.setState((prev) => ({ fieldNotesListOpen: !prev.fieldNotesListOpen, nearbyStripOpen: false }))}
            isGeneratingRoute={this.state.isGeneratingRoute}
            routeData={this.state.routeData}
            onGenerateRoute={this.generateCaptureRoute}
            onClearRoute={this.clearCaptureRoute}
            onDownloadRouteGPX={this.downloadRouteGPX}
            routePreviewHost={this.state.jimuMapView?.view && this.ArcGISModules ? {
              view: this.state.jimuMapView.view, interactionElement: this.viewerContainer.current, registerStop: stop => { this._stopRoutePreview = stop; return () => { if (this._stopRoutePreview === stop) this._stopRoutePreview = null; }; }, createLayer: properties => new this.ArcGISModules.GraphicsLayer(properties),
              createGraphic: properties => new this.ArcGISModules.Graphic(properties)
            } : undefined}
            routeStartPoint={this.state.routeStartPoint}
            routeEndPoint={this.state.routeEndPoint}
            routeSpareMinutes={this.state.routeSpareMinutes}
            routePickMode={this.state.routePickMode}
            runtimeRoutingEngine={["world", "osrm"].includes(this.getEffectiveRoutingEngine()) ? (this.getEffectiveRoutingEngine() as "world" | "osrm") : null}
            onChangeRuntimeRoutingEngine={this.handleRuntimeRoutingEngineChange}
            runtimeTravelMode={this.state.routeTravelMode}
            onChangeRuntimeTravelMode={this.handleRuntimeTravelModeChange}
            travelModeAvailability={
              this.getEffectiveRoutingEngine() === "world"
                ? {
                  drive: true,
                  walk: true,
                  bike: false,
                  bikeReason: "ArcGIS World Route does not provide a cycling travel mode.",
                }
                : {
                  drive: true,
                  walk: false,
                  bike: false,
                  walkReason: "Walking is not enabled for this OSRM server.",
                  bikeReason: "Cycling is not enabled for this OSRM server.",
                }
            }
            onSetRoutePickMode={(mode) => this.setState({ routePickMode: mode })}
            onChangeSpareMinutes={(mins) => {
              if (Number.isFinite(mins) && !this.state.isGeneratingRoute) this.setState({ routeSpareMinutes: Math.min(120, Math.max(5, Math.round(mins / 5) * 5)) });
            }}
            routeGenerationProgress={this.state.routeGenerationProgress}
            onResetRoutePoints={this.resetRoutePoints}
            enableSolar={this.props.config.enableSolar === true}
            enableElevationProfile={this.props.config.enableElevationProfile === true}
            isSolarMode={this.state.isSolarMode}
            onToggleSolarMode={this.toggleSolarMode}
            isElevationProfileActive={this.state.isElevationProfileActive}
            onToggleElevationProfile={this.toggleElevationProfile}
          />}

          {/* UNIFIED FILTER BAR */}
          <FilterBar
            detectionLabelZoom={this.state.currentZoom}
            signSpriteScale={this.state.signSpriteScale || 1}
            objectSpriteScale={this.state.objectSpriteScale || 1}
            signLabels={this.state.signLabels === true} objectLabels={this.state.objectLabels === true}
            onDetectionLabelsChange={this.changeDetectionLabels}
            signReduceOverlap={this.state.signReduceOverlap === true} objectReduceOverlap={this.state.objectReduceOverlap === true}
            onDetectionOverlapChange={this.changeDetectionOverlap}
            signDisplayMode={this.state.signDisplayMode || 'selected'} objectDisplayMode={this.state.objectDisplayMode || 'selected'}
            onDetectionDisplayModeChange={this.changeDetectionDisplayMode}
            signOpacity={this.state.signOpacity ?? 1} objectOpacity={this.state.objectOpacity ?? 1}
            onDetectionOpacityChange={this.changeDetectionOpacity} onDetectionDisplayReset={this.resetDetectionDisplay}
            onSpriteScaleChange={this.changeMapFeatureSpriteScale}
            showTurboFilterBox={this.state.showTurboFilterBox}
            showTrafficSignsFilterBox={this.state.showTrafficSignsFilterBox}
            showObjectsFilterBox={this.state.showObjectsFilterBox}
            turboFilterUsername={this.state.turboFilterUsername}
            turboFilterOrganization={this.state.turboFilterOrganization}
            onTurboOrganizationChange={value => this.changeCoverageOrganization(value)}
            onTurboOrganizationEnter={() => this.changeCoverageOrganization(this.state.turboFilterOrganization, true)}
            onTurboOrganizationClear={() => this.changeCoverageOrganization("", true)}
            turboFilterStartDate={this.state.turboFilterStartDate}
            turboFilterEndDate={this.state.turboFilterEndDate}
            turboFilterIsPano={this.state.turboFilterIsPano}
            turboFilterOnFoot={this.state.turboFilterOnFoot}
            onTurboTravelMethodChange={this.changeTravelMethod}
            turboColorByDate={this.state.turboColorByDate}
            turboModeActive={this.state.turboModeActive}
            turboCreator={this.props.config.turboCreator}
            turboOrganization={this.props.config.turboOrganization}
            trafficSignsSelectedCodes={this.state.trafficSignsSelectedCodes}
            objectsSelectedCodes={this.state.objectsSelectedCodes}
            onTrafficSignCategoriesChange={this.onTrafficSignCategoriesChange}
            onObjectCategoriesChange={this.onObjectCategoriesChange}
            trafficSignsFilterValue={this.state.trafficSignsFilterValue}
            trafficSignsOptions={this.state.trafficSignsOptions}
            objectsFilterValue={this.state.objectsFilterValue}
            objectsOptions={this.state.objectsOptions}
            onTurboUsernameChange={(val) => this.setState({ turboFilterUsername: val }, () => this.debouncedTurboFilter())}
            onTurboUsernameEnter={() => {
              this.debouncedTurboFilter.cancel?.();
              const val = this.state.turboFilterUsername.trim();
              if (this.state.jimuMapView && this.state.turboModeActive) {
                if (val) this.enableTurboCoverageLayer(val);
                else this.enableTurboCoverageLayer();
              }
            }}
            onTurboUsernameClear={() => this.setState({ turboFilterUsername: "" }, () => this.enableTurboCoverageLayer())}
            onTurboStartDateChange={(dateString) => this.setState({ turboFilterStartDate: dateString }, () => this.debouncedTurboFilter())}
            onTurboEndDateChange={(dateString) => this.setState({ turboFilterEndDate: dateString }, () => this.debouncedTurboFilter())}
            onTurboIsPanoChange={(newVal) => {
              this.setState({ turboFilterIsPano: newVal }, () => {
                if (this.state.turboModeActive) { void this.enableTurboCoverageLayer(); return; }
                const rebuild = async () => {
                  let creatorId: number | undefined = undefined;
                  const username = this.state.turboFilterUsername?.trim();
                  if (username) creatorId = (await this.getUserIdFromUsername(username)) || undefined;
                  this.rebuildCoverageLayer(
                    creatorId,
                    this.state.turboFilterStartDate || undefined,
                    this.state.turboFilterEndDate || undefined,
                    newVal,
                    this.state.qualityViewActive,
                    this.state.selectedQualityBand,
                  );
                  if (this.state.turboModeActive) await this.enableTurboCoverageLayer();
                };
                rebuild();
              });
            }}
            onTurboColorByDateChange={(val) => this.setState({ turboColorByDate: val }, () => this.debouncedTurboFilter())}
            onTrafficSignsFilterChange={async (selected: FilterOption) => {
              this.setState({ trafficSignsFilterValue: selected }, async () => {
                if (!this.state.jimuMapView) return;
                const newName = selected.value;
                let filterCode = newName;
                if (newName !== DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS) {
                  const spriteData = await loadSpriteMetadata(`${this.spriteUrls.TRAFFIC_SIGNS}.json`);
                  const code = Object.keys(spriteData).find((c) => formatTrafficSignName(c) === newName);
                  filterCode = code || newName;
                }
                this.filterTrafficSignsVTLayer(filterCode);
              });
            }}
            onObjectsFilterChange={async (selected: FilterOption) => {
              this.setState({ objectsFilterValue: selected }, async () => {
                if (!this.state.jimuMapView) return;
                const newName = selected.value;
                let filterCode = newName;
                if (newName !== DEFAULT_FILTER_LABELS.OBJECTS) {
                  const spriteData = await loadSpriteMetadata(`${this.spriteUrls.OBJECTS}.json`);
                  const code = Object.keys(spriteData).find((c) => (objectNameMap[c] || c) === newName);
                  filterCode = code || newName;
                }
                this.filterObjectsVTLayer(filterCode);
              });
            }}
          />

          {this.state.placesActive && <PlacesOverlay
            panelOpen={this.state.placesPanelOpen} selection={this.getPlacesOverlaySelection()}
            tileLayer={this._placesVectorLayer} tileFamily={this.state.placesTileCategory}
            getLocalOrigin={() => this.placesListOrigin()}
            panel={{
              status: this.state.placesStatus, places: this.state.placesList,
              hoveredId: this.state.placesHoveredId, revealRequest: this.state.placesRevealRequest,
              autoUpdate: this.state.placesAutoUpdate, tileLoading: this.state.placesSourceLoading,
              onShowOnMap: this.showListedPlaceOnMap, onGoToArea: this.goToPlacesArea,
              onTileQuality: this.setPlacesTileQuality, onTileFamily: this.setPlacesTileCategory,
              onAutoUpdate: this.setPlacesAutoUpdate,
              onAreaSearch: text => this._places?.controller.setSearchText(text),
              onLoadMore: () => this._places?.controller.loadMore(),
              onPreviousResults: () => this._places?.controller.previousPage(),
              onSearch: () => this._places?.controller.searchArea(),
              onHover: id => this._places?.setHover(id),
              onSelect: id => this._places?.open([], id, false, 'list'),
              onRetry: () => this._places?.controller.retry(),
              onClose: () => this.setState({ placesPanelOpen: false }),
            }}
          />}

          {/* Splash Screen */}
          <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />

          {/* Control Bar */}
          <ControlBar
            signSpritesStatus={this.state.signSpritesStatus} objectSpritesStatus={this.state.objectSpritesStatus}
            hideTurboFilter={this.props.config.hideTurboFilter}
            enablePlaces={this.props.config.enablePlaces === true || !!this._placesVectorLayer}
            placesAvailable={!!this._placesVectorLayer || !!placesSourceKey(this.props.config)}
            placesActive={this.state.placesActive} placesPanelOpen={this.state.placesPanelOpen}
            onTogglePlaces={this.togglePlaces} onTogglePlacesPanel={() => this.setState(previous => ({ placesPanelOpen: !previous.placesPanelOpen }))}
            enableTrafficSigns={this.props.config.enableTrafficSigns}
            enableMapillaryObjects={this.props.config.enableMapillaryObjects}
            isFullscreen={this.state.isFullscreen}
            tilesActive={this.state.tilesActive}
            turboModeActive={this.state.turboModeActive}
            showTurboFilterBox={this.state.showTurboFilterBox}
            trafficSignsActive={this.state.trafficSignsActive}
            showTrafficSignsFilterBox={this.state.showTrafficSignsFilterBox}
            objectsActive={this.state.objectsActive}
            showObjectsFilterBox={this.state.showObjectsFilterBox}
            jimuMapView={this.state.jimuMapView}
            onToggleFullscreen={this.toggleFullscreen}
            onToggleTurboFilter={() => {
              if (!this.state.turboModeActive) return;
              this.setState((prev) => ({ showTurboFilterBox: !prev.showTurboFilterBox }));
            }}
            onToggleTrafficSigns={this.toggleMapillaryTrafficSigns}
            onToggleTrafficSignsFilter={() => {
              if (!this.state.trafficSignsActive) return;
              this.setState((prev) => ({ showTrafficSignsFilterBox: !prev.showTrafficSignsFilterBox }));
            }}
            onToggleObjects={this.toggleMapillaryObjects}
            onToggleObjectsFilter={() => {
              if (!this.state.objectsActive) return;
              this.setState((prev) => ({ showObjectsFilterBox: !prev.showObjectsFilterBox }));
            }}
          />
        </div>
        <CoverageGuide
          t={this._t} visible={coverageBarVisible} status={coveragePresentation}
          settings={guideContext} mouseHint={coverageBarHint}
          touchHint={coverageBarVisible ? this.getCoverageBarHint(true) : ""}
          helpOpen={!!this.state.coverageHelpOpen} helpId={coverageHelpId}
          helpButtonRef={this._coverageHelpButton} helpPanelRef={this._focusCoverageHelp}
          travelMethodFiltered={this.state.turboFilterOnFoot !== undefined} turboActive={!!this.state.turboModeActive}
          noticesHidden={coverageBarVisible && !!this.state.coverageHelpOpen && !this.shouldShowCoverageNotice()}
          warningVisible={coverageNoticeVisible && !this.state.turboWarningIsHelp} warningMessage={this.state.zoomWarningMessage}
          selectionError={this.state.selectionError} canRetry={this.state.selectionCanRetry}
          onAction={action => void this.handleTurboWarningAction(action)}
          onToggleHelp={() => this.state.coverageHelpOpen ? this.closeCoverageHelp() : this.setState({ coverageHelpOpen: true })}
          onCloseHelp={() => this.closeCoverageHelp()} onHideNotices={() => this.hideCoverageNotices()}
          onRetryImage={() => void this.retrySelectedImage()}
          onDismissImageError={() => this.setState({ selectionError: undefined })}
        />
      </div>
    );

    /**
     * FULLSCREEN MODE BLOCK (portal to body)
     */
    const fullscreenImage = this.state.sequenceImages.find(image => image.id === this.state.imageId)
      || this._lastSuccessfulSelection?.sequenceImages.find(image => image.id === this.state.imageId);
    const fullscreenMode = ReactDOM.createPortal(
      <FullscreenViewer direction={this._runtimeLocale?.direction || "ltr"}
        formatLocale={this._runtimeLocale?.formatLocale || "en-US"}
        showMinimap={this.state.showMinimap} minimapExpanded={this.state.minimapExpanded}
        hideInfoBox={this.props.config.hideInfoBox} address={this.state.address} image={fullscreenImage}
        minimapRef={this.minimapContainer} t={this._t} onExit={this.toggleFullscreen}
        onToggleMinimap={() => this.setState(prev => ({ showMinimap: !prev.showMinimap }))}
        onToggleExpanded={() => this.setState(prev => ({ minimapExpanded: !prev.minimapExpanded }))}
        onCopyCoordinates={(lat, lon) => this.copyImageCoordinates(lat, lon)}>{viewerArea}</FullscreenViewer>,
      document.body,
    );
    /** Return either normal or fullscreen layout */
    return this.state.isFullscreen ? fullscreenMode : normalMode;
  }
}
