import type {
  CategoryDisplayMode,
  CategorySelection,
} from "../features/detections/categorySelection";
import type { TileCategoryId } from "../features/places/tileCategories";
import type { ExternalContributionSeed } from "../features/places/placeNote";
import type { Place } from "../features/places/placesModel";
import type { PlacesState } from "../features/places/PlacesController";
import type { React } from "jimu-core";
import type { JimuMapView } from "jimu-arcgis";
import type { PendingFieldNote } from "../features/field-notes/FieldNoteDraft";
import type { MeasurementPoint } from "../features/point-cloud/MeasurementViewerRenderer";
import type { MapSpriteStatus } from "../features/detections/MapSpriteLoading";
import type { DetectionNoteSelection } from "../features/detections/detectionNote";
import type {
  DetectionExplorerOptions,
  DetectionSummary,
} from "../features/detections/detectionExploration";
import type {
  NearbyImage,
  RouteData,
  AssociatedImage,
} from "../components/types";
import type {
  FieldNote,
  FieldNoteEditor,
  FieldNoteAttachments,
} from "../components/types";
import type { CaptureTravelMode } from "../utils/routingTypes";
/** Shared runtime state contract; feature views consume only their own presentation fields. */
export interface WidgetState {
  placesActive: boolean;
  placesAutoUpdate: boolean;
  placeNotePhase: "idle" | "capturing" | "picking";
  placesPanelOpen: boolean;
  placesTileCategory: TileCategoryId;
  placesSourceLoading: boolean;
  placesStatus: PlacesState;
  selectedPlace: Place | null;
  placesHoveredId: string | null;
  placesRevealRequest: number;
  placesShowLink: boolean;
  placesList: readonly Place[];
  placesCameraDistance: string | null;
  jimuMapView: JimuMapView | null;
  imageId: string | null;
  sequenceId: string | null;
  sequenceImages: {
    id: string;
    lat: number;
    lon: number;
    captured_at?: number;
  }[];
  lon: number | null;
  lat: number | null;
  isFullscreen: boolean;
  address: string | null;
  state?: string; // e.g. 'OPENED' | 'CLOSED'
  visible?: boolean; // directly indicates visibility
  isLoading: boolean;
  availableSequences?: {
    sequenceId: string;
    images: {
      id: string;
      lon: number;
      lat: number;
    }[];
    _color?: number[];
    capturedAt?: string;
  }[];
  selectedSequenceId?: string;
  clickLon?: number;
  clickLat?: number;
  tilesActive?: boolean;
  trafficSignsActive?: boolean;
  objectsActive?: boolean;
  turboModeActive?: boolean;
  turboLoading?: boolean;
  turboUpdatingVisible?: boolean;
  hoverPreviewLoading?: boolean;
  coverageHelpOpen?: boolean;
  nearbyFramesHintVisible?: boolean;
  sequenceRouteProgress?: string;
  sequenceRouteLoading?: boolean;
  coverageFrameResolving?: boolean;
  selectionError?: string;
  selectionCanRetry?: boolean;
  featuresLoading?: boolean; // traffic signs / objects tile fetch in progress
  coverageAnalysisLoading?: boolean;
  coverageAnalysisProgress?: string;
  coverageResult?: import("../components/types").CoverageResult | null;
  coverageSegmentsVisible?: boolean;
  turboFilterStartDate?: string; // ISO yyyy-mm-dd
  turboFilterEndDate?: string; // ISO yyyy-mm-dd
  turboFilterOnFoot?: boolean;
  turboFilterIsPano?: boolean; // true = only panoramas, false = only non-panos, undefined/empty = no filter
  turboColorByDate?: boolean;
  qualityViewActive?: boolean; // Which quality band the legend has isolated ("good"|"fair"|"poor"|"unscored"), or null/undefined = show all bands
  selectedQualityBand?: "good" | "fair" | "poor" | "unscored" | null;
  turboYearLegend?: {
    year: string;
    color: string;
  }[];
  zoomWarningMessage?: string;
  turboWarningAction?: "zoom" | "retry";
  turboWarningIsHelp?: boolean;
  trafficSignsSelectedCodes: CategorySelection;
  objectsSelectedCodes: CategorySelection;
  trafficSignsFilterValue: {
    value: string;
    label: string;
    iconUrl: string | null;
  };
  objectsFilterValue: {
    value: string;
    label: string;
    iconUrl: string | null;
  };
  filtersLoaded: boolean;
  showIntro: boolean;
  signDisplayMode?: CategoryDisplayMode;
  objectDisplayMode?: CategoryDisplayMode;
  signReduceOverlap?: boolean;
  objectReduceOverlap?: boolean;
  signLabels?: boolean;
  objectLabels?: boolean;
  signOpacity?: number;
  objectOpacity?: number;
  signSpriteScale?: number;
  objectSpriteScale?: number;
  minimapView?: __esri.MapView;
  noImageMessageVisible: boolean;
  turboFilterUsername: string;
  turboFilterOrganization: string;
  organizationName: {
    id: string;
    name: string;
  } | null;
  showTurboFilterBox: boolean;
  signSpritesStatus: MapSpriteStatus;
  objectSpritesStatus: MapSpriteStatus;
  trafficSignsOptions: Array<{
    value: string;
    label: string;
    iconUrl: string | null;
  }>;
  showTrafficSignsFilterBox: boolean;
  objectsOptions: Array<{
    value: string;
    label: string;
    iconUrl: string | null;
  }>;
  showObjectsFilterBox: boolean;
  currentZoom?: number;
  hasTimeTravel: boolean;
  isDownloading?: boolean;
  mapFeatureExportLoading?: boolean;
  selectedTurboYear?: string | null;
  showMinimap: boolean;
  minimapExpanded?: boolean;
  detectionsActive: boolean;
  showAiTags: boolean;
  detectionExplorer: DetectionExplorerOptions;
  detectionSummary: DetectionSummary;
  isSharedState: boolean;
  imageTrayTab?: "nearby" | "object";
  selectedFeatureMetadata?: {
    id: string;
    name: string;
    firstSeen?: string | number;
    lastSeen?: string | number;
  };
  featureMetadataLoading?: boolean;
  featureMetadataError?: string;
  alternateImagesError?: string;
  alternateImages: AssociatedImage[];
  selectedFeatureLocation: {
    lat: number;
    lon: number;
  } | null;
  isFetchingAlternates: boolean;
  targetDetectionId: string | null;
  syncHeading: boolean;
  lockToImage: boolean;
  imageryRepresentative?: boolean;
  toastMessage?: React.ReactNode;
  isMeasureMode: boolean;
  measurePoints: MeasurementPoint[];
  showCalibrationPanel: boolean;
  nudgeStep: number;
  pointCloudAutoPaused?: boolean;
  pointCloudPrevious?: boolean;
  pointCloudFollowImages?: boolean;
  pointCloudAdaptive?: boolean;
  pointCloudSummary?: string;
  pointCloudIncomplete?: boolean;
  pointCloudExportLoading?: boolean;
  pointCloudLoading?: boolean;
  pointCloudVisible?: boolean;
  pointCloudAvailable?: boolean; // null = unknown, false = no sfm_cluster for this image
  pointCloudColorMode: "rgb" | "elevation";
  pointCloudLength: number;
  pointCloudMaxLength: number;
  pointCloudActualLength: number;
  pointCloudWidth: number;
  pointCloudMaxWidth: number;
  pointCloudActualWidth: number;
  /** Toggles the SVG drawing overlay on the Mapillary viewer */
  isLassoMode: boolean;
  /** Array of 2D screen coordinates representing the user's drawn polygon */
  lassoPolygon: [number, number][];
  /** Maps the selected points to ArcGIS FeatureLayer ObjectIDs for highlighting */
  lassoSelectedObjectIds: number[];
  isSightMode: boolean;
  sightObserver: __esri.Point | null;
  sightTargets: __esri.Point[];
  isViewshedMode: boolean;
  nearbyImages?: NearbyImage[];
  nearbyLoading?: boolean;
  nearbyStripOpen?: boolean;
  nearbyCanExpand?: boolean;
  isAnnotationMode: boolean;
  fieldNotes: FieldNote[];
  sharedNotesMessage?: string;
  fieldNoteEditor?: FieldNoteEditor | null;
  fieldNoteAttachments?: FieldNoteAttachments | null;
  pendingFieldNote: PendingFieldNote | null;
  viewerDetectionNote: DetectionNoteSelection | null;
  detectionNotePicking: boolean;
  detectionNoteCapturing: boolean;
  detectionWorkspaceDraft: ExternalContributionSeed | null;
  fieldNotesListOpen: boolean;
  isGeneratingRoute?: boolean;
  routeGenerationProgress?: {
    usedMinutes: number;
    budgetMinutes: number;
  } | null;
  routeData?: RouteData | null;
  isSolarMode: boolean;
  isElevationProfileActive?: boolean;
  routeStartPoint: [number, number] | null;
  routeEndPoint: [number, number] | null;
  routeSpareMinutes: number;
  routePickMode: "start" | "end" | null;
  routeTravelMode: CaptureTravelMode;
  routingEngineOverride: "world" | "osrm" | null;
}
