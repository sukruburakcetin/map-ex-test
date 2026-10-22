/** @file Shared prop types for Mapillary Explorer sub-components */

import { JimuMapView } from "jimu-arcgis";
import type {
  CaptureTravelMode
} from "../utils/routingTypes";

// Shared option shape (GlassSelect)
export interface FilterOption {
    value: string;
    label: string;
    iconUrl: string | null;
}

// Alternate image shape
export interface AlternateImage {
    id: string;
    detectionId: string;
    detectionBounds?: { x: number; y: number; width: number; height: number };
    detectionLabel?: string;
    thumbUrl: string;
    capturedAt: number;
    geometry: { type: "Point"; coordinates: [number, number] };
}

// Legend props
export interface LegendProps {
    turboModeActive: boolean;
    onClearCache: () => void;
    hasFieldNotes?: boolean;
}

export interface NearbyImage {
  id: string;
  thumb_256_url: string;
  thumb_512_url: string;
  captured_at: number;
  geometry: { type: 'Point'; coordinates: [number, number] };
  creator?: { username: string };
}

export type FieldNoteStatus = 'open' | 'in_progress' | 'completed' | 'dismissed';
export const FIELD_NOTE_STATUSES = [
    { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In progress' },
    { value: 'completed', label: 'Completed' }, { value: 'dismissed', label: 'Dismissed' }
] as const;
export interface FieldNoteEditor {
    key: string; localId?: string; globalId?: string; url?: string;
    category: string; note: string; status: FieldNoteStatus; resolutionNote: string;
    baseline?: Record<string, any>; saving?: boolean; error?: string;
}
export interface FieldNote {
    status?: FieldNoteStatus;
    resolutionNote?: string;
    sharedGlobalId?: string;
    sharedLayerUrl?: string;
    sharedStatus?: 'saving' | 'shared' | 'failed';
    sharedError?: string;
    id: string;
    source: 'mapillary-detection' | 'manual';
    category: string;
    note: string;
    lon: number;
    lat: number;
    alt?: number;
    imageId: string | null;
    detectionId?: string;
    createdAt: number;
}

export const DEFAULT_FIELD_NOTE_CATEGORIES = [
    "Missing Sign",
    "Damaged Sign",
    "Damaged Sidewalk",
    "Pothole / Road Damage",
    "Streetlight Failure",
    "Illegal Encroachment",
    "Other"
] as const;

export const FIELD_NOTE_CATEGORIES = DEFAULT_FIELD_NOTE_CATEGORIES;

// InfoBox props
export interface InfoBoxProps {
  // visibility / config
  hideInfoBox?: boolean;
  turboCreator?: string;
  // state
  imageId: string | null;
  address: string | null;
  currentZoom?: number;
  jimuMapViewZoom?: number;
  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];
  turboModeActive?: boolean;
  turboColorByDate?: boolean;
  turboYearLegend?: { year: string; color: string }[];
  selectedTurboYear?: string | null;
  trafficSignsActive?: boolean;
  objectsActive?: boolean;
  detectionsActive: boolean;
  showAiTags: boolean;
  alternateImages: AlternateImage[];
  isFetchingAlternates: boolean;
  accessToken: string;
  // callbacks
  onYearLegendClick: (year: string) => void;
  mapFeatureExportLoading?: boolean;
  onDownloadFeatures: () => void;
  onToggleDetections: () => void;
  onToggleAiTags: () => void;
  onCloseAlternates: () => void;
  onSelectAlternateImage: (img: AlternateImage) => void;
  // coverage analysis
  coverageAnalysisLoading?: boolean;
  coverageAnalysisProgress?: string;
  onCancelCoverageAnalysis?: () => void;
  coverageResult?: CoverageResult | null;
  coverageSegmentsVisible?: boolean;
  /** True when turbo layer is loaded and has features in the current view */
  turboPointsAvailable?: boolean;
  /** Minimum zoom level required for Turbo Mode; from ZOOM.TURBO_MIN */
  turboMinZoom?: number;
  /** If true, hides the coverage analysis button entirely */
  hideCoverageAnalysis?: boolean;
  onToggleCoverageSegments: () => void;
  onRunCoverageAnalysis: () => void;
  onDismissCoverageResult: () => void;
  isSightMode?: boolean;
  sightObserver?: any | null;
  sightTargets?: any[];
  isViewshedMode?: boolean;
  onToggleViewshedMode?: () => void;
  onClearViewshed?: () => void;
  onToggleSightMode?: () => void;
  onClearSight?: () => void;
  pointCloudVisible?: boolean;
  isMeasureMode?: boolean;
  measurePoints?: Array<any>;
  onToggleMeasureMode?: () => void;
  onClearMeasurement?: () => void;
  // [4.5.0 Update] Lasso Selection Tool
  /** Indicates if the user is currently drawing a selection polygon */
  isLassoMode?: boolean;
  /** Triggers the activation/deactivation of the lasso drawing state */
  onToggleLassoMode?: () => void;
  /** Clears the current lasso polygon and removes highlights from the 3D scene */
  onClearLasso?: () => void;
  showCalibrationPanel?: boolean;
  nudgeStep?: number;
  onToggleCalibrationPanel?: () => void;
  onJoystickNudge?: (axis: "x" | "y" | "z", direction: 1 | -1) => void;
  onResetCalibration?: () => void;
  onSetNudgeStep?: (step: number) => void;
  pointCloudAutoPaused?: boolean;
  pointCloudPrevious?: boolean;
  pointCloudLoading?: boolean;
  pointCloudAdaptive?: boolean;
  onPointCloudAdaptiveChange?: (enabled: boolean) => void;
  pointCloudSummary?: string;
  pointCloudIncomplete?: boolean;
  onRetryPointCloud?: () => void;
  pointCloudFollowImages?: boolean;
  onPointCloudFollowImagesChange?: (enabled: boolean) => void;
  onCopyCoordinates?: (latitude: number, longitude: number) => void;
  pointCloudColorMode?: "rgb" | "elevation";
  pointCloudLength: number;
  pointCloudMaxLength: number;
  pointCloudActualLength: number;
  pointCloudWidth?: number;
  pointCloudMaxWidth?: number;
  pointCloudActualWidth: number;
  onWidthChange?: (width: number) => void;
  onLengthChange: (length: number) => void;
  pointCloudExportLoading?: boolean;
  onDownloadPointCloud?: (format?: "csv" | "ply" | "las") => void;
  // Quality View
  enableQualityView?: boolean;
  qualityViewActive?: boolean;
  onToggleQualityView: () => void;
  selectedQualityBand?: "good" | "fair" | "poor" | "unscored" | null;
  onQualityLegendClick: (band: "good" | "fair" | "poor" | "unscored") => void;
  nearbyImages?: NearbyImage[];
  nearbyLoading?: boolean;
  onSelectNearbyImage?: (id: string) => void;
  onHoverNearbyImage?: (img: NearbyImage | null) => void;
  nearbyCount?: number;
  nearbyStripOpen?: boolean;
  onToggleNearbyStrip?: () => void;
  fieldNotesCount?: number;
  isAnnotationMode?: boolean;
  fieldNotesListOpen?: boolean;
  onToggleAnnotationMode?: () => void;
  onToggleFieldNotesList?: () => void;
  isGeneratingRoute?: boolean;
  routeGenerationProgress?: { usedMinutes: number; budgetMinutes: number } | null;
  routeData?: RouteData | null;
  onGenerateRoute?: () => void;
  onClearRoute?: () => void;
  onDownloadRouteGPX?: () => void;
  enableSolar?: boolean;
  enableElevationProfile?: boolean;
  isSolarMode?: boolean;
  onToggleSolarMode?: () => void;
  isElevationProfileActive?: boolean;
  onToggleElevationProfile?: () => void;
  routeStartPoint?: [number, number] | null;
  routeEndPoint?: [number, number] | null;
  routeSpareMinutes?: number;
  routePickMode?: "start" | "end" | null;
  runtimeTravelMode?: CaptureTravelMode;
  onChangeRuntimeTravelMode?: ( mode: CaptureTravelMode ) => void;
  travelModeAvailability?: {
  drive: boolean;
  walk: boolean;
  bike: boolean;

  walkReason?: string;
  bikeReason?: string;
};
  onSetRoutePickMode?: (mode: "start" | "end" | null) => void;
  onChangeSpareMinutes?: (minutes: number) => void;
  runtimeRoutingEngine?: "world" | "osrm" | null;
  onChangeRuntimeRoutingEngine?: (engine: "world" | "osrm") => void;
  onResetRoutePoints?: () => void;
}

// FilterBar props
export interface FilterBarProps {
    signSpriteScale?: number;
    objectSpriteScale?: number;
    onSpriteScaleChange?: (kind: 'signs' | 'objects', scale: number) => void;
    // visibility
    showTurboFilterBox: boolean;
    showTrafficSignsFilterBox: boolean;
    showObjectsFilterBox: boolean;
    // turbo filter state
    turboFilterUsername: string;
    turboFilterStartDate?: string;
    turboFilterEndDate?: string;
    turboFilterIsPano?: boolean;
    turboFilterOnFoot?: boolean;
    onTurboTravelMethodChange?: (onFoot: boolean | undefined) => void;
    turboColorByDate?: boolean;
    turboModeActive?: boolean;
    // locked creator (from settings)
    turboCreator?: string;
    // options
    trafficSignsFilterValue: FilterOption;
    trafficSignsOptions: FilterOption[];
    objectsFilterValue: FilterOption;
    objectsOptions: FilterOption[];
    // callbacks - turbo
    onTurboUsernameChange: (val: string) => void;
    onTurboUsernameEnter: () => void;
    onTurboUsernameClear: () => void;
    onTurboStartDateChange: (dateString: string) => void;
    onTurboEndDateChange: (dateString: string) => void;
    onTurboIsPanoChange: (val: boolean | undefined) => void;
    onTurboColorByDateChange: (val: boolean) => void;
    // callbacks - traffic signs / objects
    onTrafficSignsFilterChange: (selected: FilterOption) => void;
    onObjectsFilterChange: (selected: FilterOption) => void;
}

// SplashScreen props
export interface SplashScreenProps {
    onDismiss?: () => void;
    showIntro: boolean;
    filtersLoaded: boolean;
}

// Street Coverage Analysis
export type SegmentTier = 'fresh' | 'aging' | 'stale' | 'none';
 
export interface CoverageResult {
    coveredCount:    number;
    totalCount:      number;
    coveredKm:       number;
    remainingKm:     number;
    percentCovered:  number;
    /** Most-recent captured_at (ms) per segment, null if uncovered */
    segmentDates:    (number | null)[];
    /** Freshness tier per segment */
    segmentTiers:    SegmentTier[];
    freshCount: number;  freshKm: number;
    agingCount: number;  agingKm: number;
    staleCount: number;  staleKm: number;
    noneCount:  number;  noneKm:  number;
}

// ControlBar props
export interface ControlBarProps {
    // config flags
    hideTurboFilter?: boolean;
    enableTrafficSigns?: boolean;
    enableMapillaryObjects?: boolean;
    // state
    isFullscreen: boolean;
    tilesActive?: boolean;
    turboModeActive?: boolean;
    showTurboFilterBox: boolean;
    trafficSignsActive?: boolean;
    showTrafficSignsFilterBox: boolean;
    objectsActive?: boolean;
    showObjectsFilterBox: boolean;
    jimuMapView: JimuMapView | null;
    // coverage analysis
    coverageAnalysisLoading?: boolean;
  coverageAnalysisProgress?: string;
  onCancelCoverageAnalysis?: () => void;
    coverageResult?: CoverageResult | null;
    // callbacks
    onToggleFullscreen: () => void;
    onToggleTurboFilter: () => void;
    onToggleTrafficSigns: () => void;
    onToggleTrafficSignsFilter: () => void;
    onToggleObjects: () => void;
    onToggleObjectsFilter: () => void;
}

// Sequence shape
export interface SequenceInfo {
    sequenceId: string;
    images?: { id: string; lon: number; lat: number; }[];
    capturedAt?: string;
    _color?: number[];
}

// ImageUtilityGroup props
export interface ImageUtilityGroupProps {
    // config flags
    hideTimeTravel?: boolean;
    hideShareButton?: boolean;
    hideImageDownload?: boolean;
    hideSyncHeadingButton?: boolean;
    hideCenterMapButton?: boolean;
    hidePointCloud?: boolean;
    // state
    hasTimeTravel: boolean;
    isDownloading?: boolean;
    syncHeading: boolean;
    is3D: boolean;
    imageId: string | null;
    sequenceImages: { id: string; lat: number; lon: number }[];
    pointCloudFollowImages?: boolean;
    onPointCloudFollowImagesChange?: (enabled: boolean) => void;
    pointCloudLoading?: boolean;
    pointCloudAdaptive?: boolean;
    onPointCloudAdaptiveChange?: (enabled: boolean) => void;
    pointCloudSummary?: string;
    pointCloudIncomplete?: boolean;
    onRetryPointCloud?: () => void;
    pointCloudAutoPaused?: boolean;
    pointCloudActive?: boolean;
    pointCloudVisible?: boolean;
    pointCloudAvailable?: boolean; // false = no sfm_cluster for this image
    // callbacks
    onTimeTravel: (lat: number, lon: number, imageId: string) => void;
    onShare: () => void;
    onDownload: () => void;
    onToggleSyncHeading: () => void;
    onCenterMap: () => void;
    onTogglePointCloud: () => void;
}

// ROUTE OPTIMIZER TYPES

export interface RouteData {
    /*
     * Basic final route
     */
    distance: number;       // meters
    duration: number;       // seconds
    geojson: any;

    /*
     * Time budget
     */
    baselineDurationMinutes?: number;
    extraDurationMinutes?: number;
    requestedExtraMinutes?: number;

    /*
     * Final useful-road result
     */
    targetedLengthMeters?: number;
    coveredTargetLengthMeters?: number;
    usefulCoverageMeters?: number;

    /*
     * How much of the FINAL selected target network
     * was actually traversed by ArcGIS.
     */
    targetRealizationPercent?: number;

    /*
     * Useful coverage by coverage tier.
     *
     * These represent road covered by the final route
     * that was NOT already covered by baseline A → B.
     */
    incrementalNoneMeters?: number;
    incrementalStaleMeters?: number;

    /*
     * Final selected target diagnostics
     */
    selectedNovelTargetMeters?: number;
    selectedBaselineOverlapMeters?: number;

    /*
     * Segment realization
     */
    touchedSegmentCount?: number;
    fullyCoveredSegmentCount?: number;
    totalTargetSegmentCount?: number;

    /*
     * Final optimization metadata
     */
    selectedOpportunityCount?: number;
    selectedAnchorCount?: number;
    selectedCorridorWidthMeters?: number;

    selectionStopReason?:
        | "budget"
        | "anchor-cap"
        | "opportunity-cap"
        | "exhausted";

    /*
     * Legacy fields.
     *
     * Keep these for compatibility for now.
     */
    targetCoveragePercent?: number;
    capturedTargetLengthMeters?: number;
    totalTargetLengthMeters?: number;
    remainingTargetLengthMeters?: number;
    capturedSegmentCount?: number;
    totalSegmentCount?: number;
}

export interface FieldNoteAttachments {
    key: string; globalId: string; url: string; objectId: number;
    items: { id: number; name: string; size?: number; contentType?: string }[];
    busy?: boolean; error?: string; message?: string;
}
