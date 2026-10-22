/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { React, AllWidgetProps, jsx, SessionManager } from "jimu-core";
import { JimuMapViewComponent, JimuMapView, loadArcGISJSAPIModules, MapViewManager } from "jimu-arcgis";
import ReactDOM from "react-dom";
import * as webMercatorUtils from "esri/geometry/support/webMercatorUtils";
import Pbf from "pbf";
import { VectorTile } from "@mapbox/vector-tile";
import { objectNameMap } from "../utils/mapillaryObjectNameMap";
import * as Icons from "../components/Icons";
import { coverageNoticeStyles, glassStyles, overrideStyles, fullscreenOverlayStyle, fullscreenExitButtonStyle, fullscreenMinimapToggleButtonStyle, getMinimapContainerStyle } from "../utils/styles";
import {
  LAYER_IDS,
  STYLE_LAYER_IDS,
  STYLE_SOURCE_IDS,
  TILE_URLS,
  GRAPH_API,
  SPRITE_URLS,
  ZOOM,
  BBOX,
  LIMITS,
  CACHE_KEYS,
  SHARE_PARAMS,
  TIMING,
  DEFAULT_FILTER_LABELS,
  DETECTION_HIDDEN_RAW,
  DETECTION_HIDDEN_CATEGORIES,
  OVERPASS_ROAD_QUERY,
  STREET_COVERAGE_CONFIG,
  POINT_CLOUD_CONFIG,
  QUALITY_SCORE,
  FIELD_NOTE_CONFIG,
  CAPTURE_ROUTE_CONFIG,
} from "../utils/constants";
import {
  distanceMeters,
  calculateBearing,
  bboxToTileRange,
  createConeGeometry,
  debounce as debounceUtil,
  formatTrafficSignName,
  parseOverpassRoads,
  classifyCoverageAsync,
  coverageAnalysisDelay,
  buildCoverageDisplayPaths,
  insetBbox,
  segmentMidpointInBbox,
  lonLatToWebMercator,
  getSunPosition,
  evaluateRouteCoverage,
  evaluateIncrementalRouteCoverage,
} from "../utils/geoUtils";
import { buildAllFilters } from "../utils/filterBuilder";
import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudCandidates, pointCloudDisplayExpression, pointCloudCorridorCount, buildPointCloudPly, buildPointCloudLas } from "../utils/pointCloudUtils";
import { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';
import { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';
import { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';
import { SelectionPulse } from '../features/map-graphics/SelectionPulse';
import { CameraConeGraphics } from '../features/map-graphics/CameraConeGraphics';
import { DirectionHoverMarker } from '../features/map-graphics/DirectionHoverMarker';
import { DirectionHoverDiscovery } from '../features/imagery/DirectionHoverDiscovery';
import { SolarMapOverlay } from '../features/solar/SolarMapOverlay';
import { SolarViewerRenderer } from '../features/solar/SolarViewerRenderer';
import { SolarSceneLighting } from '../features/solar/SolarSceneLighting';
import { updateElevationIndicator } from '../features/elevation/profileIndicator';
import { ElevationProfileController } from '../features/elevation/ElevationProfileController';
import { SequenceHoverHighlight } from '../features/coverage/SequenceHoverHighlight';
import type { PointCloudResult, PointCloudPoint } from "../utils/pointCloudUtils";
import { decodeAndNormalizeGeometry, getDetectionColor } from "../utils/mapillaryDetections";
import { createYearBasedRenderer, YEAR_COLOR_PALETTE } from "../utils/mapillaryRenderers";
import { loadImage, cropSpriteImage, processInChunks } from "../utils/spriteUtils";
import { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
import { InfoBox } from "../components/InfoBox";
import { sceneFollowCamera } from '../features/imagery/sceneFollowCamera';
import { FilterBar } from "../components/FilterBar";
import { ImageryLoading } from "../components/ImageryLoading";
import { SplashScreen } from "../components/SplashScreen";
import { ControlBar } from "../components/ControlBar";
import { ImageUtilityGroup } from "../components/ImageUtilityGroup";
import type { FilterOption, NearbyImage, RouteData } from "../components/types";
import { FieldNote, FieldNoteEditor, FieldNoteAttachments } from "../components/types";
import { FieldNotesPanel } from "../components/FieldNotesPanel";
import { buildCaptureOpportunities, selectCaptureOpportunities, buildFinalRouteStops } from "../utils/routeOptimizer";
import type { RouteTargetSegment, CaptureOpportunity } from "../utils/routeOptimizer";
import type { RoutingResult, RoutingCoordinate, RoutingProvider, CaptureTravelMode } from "../utils/routingTypes";
import { createArcGISRoutingProvider } from "../utils/arcgisRoutingProvider";
import type { RoutingEngine, RoutingAuthMode } from "../config";
import { createOSRMRoutingProvider } from "../utils/osrmRoutingProvider";
import { TURBO_LIMITS, TurboSpatialIndex, TurboIndexCache, TurboTileCache, turboTiles, visitTurboImageLayer, turboPointMatches, turboTileStyle, turboFootprintBboxes, TurboMetadataCache, detectionThumbnailBounds, coverageQualityColor } from "../utils/turboCoverageUtils";
import { MAPILLARY_IMAGE } from "../utils/mapillary-image-base64";
import type { TurboBbox, TurboFilters, TurboPoint } from "../utils/turboCoverageUtils";
import { fetchGraphJson } from '../services/mapillary/graphJson';
import { queryEnterpriseNotesPage } from '../features/field-notes/enterpriseList';
import { matchesEnterpriseLayerUrl, resolveEnterpriseNotesEndpoint } from '../features/field-notes/enterpriseEndpoint';
import { buildEnterpriseNoteAttributes } from '../features/field-notes/enterpriseAttributes';
import { assertEnterpriseNoteUnchanged, buildEnterpriseNoteEditAttributes } from '../features/field-notes/enterpriseEdit';
import { prepareCurrentImageAttachment, validateNoteAttachmentFile } from '../features/field-notes/attachmentFiles';
import { fieldNotesFromGeoJson, fieldNotesToGeoJson } from '../features/field-notes/geoJson';
import { buildLocalNoteGraphic } from '../features/field-notes/mapGraphic';
import { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';
import { createFieldNoteViewerRenderer } from '../features/field-notes/viewerRenderer';
import { selectViewerFieldNotes } from '../features/field-notes/viewerSelection';
import type { EnterpriseNotesLoader } from '../features/field-notes/enterpriseList';
import { checkTimeTravelAvailability } from '../features/imagery/timeTravel';
import { copyCoordinates } from '../services/browser/coordinateClipboard';
import { fetchReverseAddress } from '../services/geocoding/reverseAddress';
import { resolveCreatorId } from '../features/coverage/creatorLookup';
import { buildPointCloudCsv } from '../features/point-cloud/csvExport';
import { downloadCaptureRouteGPX } from '../features/routing/gpxExport';
import { restoreLocalNotes, persistLocalNotes } from '../features/field-notes/localPersistence';
import { objectDateNotice, lookupImageDetection } from '../features/detections/metadata';
import { findSequenceCandidates } from '../features/imagery/sequenceCandidates';
import { fetchSequenceCoordinates } from '../features/imagery/sequenceCoordinates';
import { SharedSequenceRequests } from '../features/imagery/sharedSequenceRequests';
import { NearbyImageDiscovery } from '../features/imagery/nearbyDiscovery';
import { NearbyImageHighlight } from '../features/imagery/nearbyHighlight';
import type { SequenceCoordinate, SequenceProgress } from '../features/imagery/sequenceCoordinates';
type ResolvedRoutingProvider = {
  kind: "api-key" | "user" | "portal" | "custom";
  routeUrl: string;
  apiKey?: string;
  label: string;
};

const ARCGIS_LOCATION_ROUTE_URL = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
const PUBLIC_OSRM_BASE_URL = "https://router.project-osrm.org";
// React component state
// Holds current map view, image/sequence data, viewer state,
// and temporary interaction information like clicks or loading flags.
interface State {
  jimuMapView: JimuMapView | null;
  imageId: string | null;
  sequenceId: string | null;
  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];
  lon: number | null;
  lat: number | null;
  isFullscreen: boolean;
  address: string | null;
  state?: string; // e.g. 'OPENED' | 'CLOSED'
  visible?: boolean; // directly indicates visibility
  isLoading: boolean;
  availableSequences?: { sequenceId: string; images: { id: string; lon: number; lat: number }[]; _color?: number[]; capturedAt?: string }[];
  selectedSequenceId?: string;
  clickLon?: number;
  clickLat?: number;
  tilesActive?: boolean;
  trafficSignsActive?: boolean;
  objectsActive?: boolean;
  turboModeActive?: boolean;
  turboLoading?: boolean;
  turboUpdatingVisible?: boolean;
  coverageHelpOpen?: boolean;
  sequenceRouteProgress?: string;
  sequenceRouteLoading?: boolean;
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
  turboYearLegend?: { year: string; color: string }[];
  zoomWarningMessage?: string;
  turboWarningAction?: "zoom" | "retry";
  turboWarningIsHelp?: boolean;
  trafficSignsFilterValue: { value: string; label: string; iconUrl: string | null };
  objectsFilterValue: { value: string; label: string; iconUrl: string | null };
  filtersLoaded: boolean;
  showIntro: boolean;
  signSpriteScale?: number;
  objectSpriteScale?: number;
  minimapView?: __esri.MapView;
  noImageMessageVisible: boolean;
  turboFilterUsername: string;
  showTurboFilterBox: boolean;
  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;
  showTrafficSignsFilterBox: boolean;
  objectsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;
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
  isSharedState: boolean;
  imageTrayTab?: "nearby" | "object";
  selectedFeatureMetadata?: { id: string; name: string; firstSeen?: string | number; lastSeen?: string | number };
  featureMetadataLoading?: boolean;
  featureMetadataError?: string;
  alternateImagesError?: string;
  alternateImages: Array<{
    id: string;
    detectionId: string;
    detectionBounds?: { x: number; y: number; width: number; height: number };
    detectionLabel?: string;
    thumbUrl: string;
    capturedAt: number;
    geometry: { type: "Point"; coordinates: [number, number] };
  }>;
  selectedFeatureLocation: { lat: number; lon: number } | null;
  isFetchingAlternates: boolean;
  targetDetectionId: string | null;
  syncHeading: boolean;
  imageryRepresentative?: boolean;
  toastMessage?: React.ReactNode;
  isMeasureMode: boolean;
  measurePoints: Array<{ mapLon: number; mapLat: number; mapZ: number; rawLon: number; rawLat: number; alt: number }>;
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
  sightObserver: any | null;
  sightTargets: any[];
  isViewshedMode: boolean;
  nearbyImages?: NearbyImage[];
  nearbyLoading?: boolean;
  nearbyStripOpen?: boolean;
  isAnnotationMode: boolean;
  fieldNotes: FieldNote[];
  sharedNotesMessage?: string;
  fieldNoteEditor?: FieldNoteEditor | null;
  fieldNoteAttachments?: FieldNoteAttachments | null;
  pendingFieldNote: { lon: number; lat: number; imageId: string | null } | null;
  fieldNotesListOpen: boolean;
  isGeneratingRoute?: boolean;
  routeGenerationProgress?: { usedMinutes: number; budgetMinutes: number } | null;
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

export default class Widget extends React.PureComponent<AllWidgetProps<any>, State> {
  viewerContainer = React.createRef<HTMLDivElement>();
  minimapContainer = React.createRef<HTMLDivElement>();

  mapillaryViewer: any = null;
  ArcGISModules: any = null;

  // Graphics references
  private currentGreenGraphic: __esri.Graphic | null = null;
  private clickedLocationGraphic: __esri.Graphic | null = null;
  private _directionHighlight: DirectionHoverMarker<__esri.Graphic> | null = null;
  private _nearbyHighlight: NearbyImageHighlight<__esri.Graphic> | null = null;
  private _routeGraphicLayer: __esri.GraphicsLayer | null = null;
  private _routePointAGraphic: __esri.Graphic | null = null;
  private _routePointBGraphic: __esri.Graphic | null = null;

  // Field notes
  private _fieldNotesLayer: __esri.GraphicsLayer | null = null;
  private _pendingNoteMarker: PendingNoteMarker | null = null;
  private _fieldNotesGroup: __esri.GroupLayer | null = null;
  private _fieldNotesGroupView: __esri.MapView | __esri.SceneView | null = null;
  private _fieldNotesGroupVisible = true;
  private _fieldNotesGroupRevision = 0;
  private _fieldNotesGroupLoad: Promise<__esri.GroupLayer | null> | null = null;

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
  private turboStationaryHandle: IHandle | null = null;
  private turboZoomHandle: __esri.WatchHandle | null = null;
  private highlightHandle: any = null;
  private viewUrlStationaryHandle: __esri.WatchHandle | null = null;

  // Cancellation flags
  private _cancelTrafficSignsFetch: boolean = false;
  private _cancelObjectsFetch: boolean = false;
  private _isInitialImageLoad = true;

  // Layers
  private accessToken: string = "";
  private mapillaryVTLayer: __esri.VectorTileLayer | null = null;
  private mapillaryTrafficSignsLayer: __esri.VectorTileLayer | null = null;
  private mapillaryObjectsLayer: __esri.VectorTileLayer | null = null;

  // Layer properties
  private _pendingDetectionFocus: { imageId: string; detectionId: string; request: number } | null = null;
  private _focusedDetectionRequest = -1;
  private _detectionLoadRequest = 0;

  private clearDetectionOverlays() {
    ++this._detectionLoadRequest;
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
    if (this.state.trafficSignsActive || this.state.objectsActive) return;
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
          const response = await fetch(`${source.replace("{z}",String(z)).replace("{x}",String(x)).replace("{y}",String(y))}?access_token=${token}`, { signal: controller.signal });
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
      for (let i = 0; i < layer.length; i++) {
        if (i % 100 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); if (signal.aborted) throw new DOMException("Export cancelled", "AbortError"); }
        const feature = layer.feature(i), attrs = feature.properties;
        if (attrs.id == null || !attrs.value || (kind === "objects" && String(attrs.value).includes("object--traffic-sign")) || (code && code !== all && attrs.value !== code)) continue;
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

  private showSelectedObjectPopup() {
    const view = this.state.jimuMapView?.view;
    const selected = this._selectedMapFeature?.graphic;
    if (!view || !selected?.geometry || !this.state.selectedFeatureMetadata) return;
    this._objectPopupContent = document.createElement("div");
    this._objectPopupView = view;
    this.updateSelectedObjectPopup();
    view.openPopup({ location: selected.geometry, title: String(this.state.selectedFeatureMetadata.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), content: this._objectPopupContent });
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
      row.textContent = `${label}: ${date && Number.isFinite(date.getTime()) ? date.toLocaleDateString() : "Not available"}`;
      content.appendChild(row);
    }
    if (this.state.featureMetadataLoading || this.state.featureMetadataError) {
      const status = document.createElement("p");
      status.textContent = this.state.featureMetadataLoading ? "Loading dates…" : this.state.featureMetadataError;
      status.setAttribute("role", "status"); content.appendChild(status);
    }
    const button = document.createElement("button");
    button.type = "button"; button.textContent = "Associated images";
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
  private _objectDetailsRequest = 0;
  private _objectDetailsCache = new TurboMetadataCache<any>(16);
  private _alternateNavigationRequest = 0;
  private _alternateNavigationAbort: AbortController | null = null;

  private _mapFeatureTiles = new TurboTileCache(4 * 1024 * 1024);
  private _mapFeatureIndexes = new TurboIndexCache(8 * 1024 * 1024);
  private _selectedMapFeature: any = null;
  private _mapFeatureFilterCodes = new Map<string, string>();
  private _mapFeatureClickAbort: AbortController | null = null;
  private mapillaryTrafficSignsFeatureLayer: __esri.FeatureLayer | null = null;
  private mapillaryObjectsFeatureLayer: __esri.FeatureLayer | null = null;
  private turboCoverageLayer: __esri.VectorTileLayer | null = null;
  private _coverageRenderView: __esri.MapView | __esri.SceneView | null = null;
  private _coverageRenderWatch: { remove(): void } | null = null;
  private _coverageRenderAbort: AbortController | null = null;
  private _coverageRoadRetryAt = 0;
  private _coverageAnalysisAbort: AbortController | null = null;
  private _coverageAnalysisRevision = 0;
  private cancelCoverageAnalysis = () => {
    ++this._coverageAnalysisRevision;
    this._coverageAnalysisAbort?.abort();
    this._coverageAnalysisAbort = null;
    this.setState({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });
  };

  private _coverageRenderRevision = 0;
  private _coverageRenderLimited = false;

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
      if (!geo || ![geo.xmin,geo.xmax,geo.ymin,geo.ymax].every(Number.isFinite)) return;
      const width = geo.xmax - geo.xmin, height = geo.ymax - geo.ymin;
      const south = Math.max(-90,geo.ymin-height*.1), north = Math.min(90,geo.ymax+height*.1);
      const wrap = (lon: number) => ((lon+180)%360+360)%360-180;
      const boxes: [number,number,number,number][] = width*1.2 >= 180 ? [[-180,south,180,north]] : turboFootprintBboxes([{lon:wrap(geo.xmin-width*.1),lat:south},{lon:wrap(geo.xmax+width*.1),lat:north}]);
      const display = await buildCoverageDisplayPaths(this._coverageSegments, this._coverageSegmentTiers, this._coverageCoveredFlags, boxes, controller.signal);
      if (!current()) return;
      if (display.limited) {
        layer.removeAll();
        if (!this._coverageRenderLimited) this.showToast("Zoom closer to draw classified streets. Full-area analysis and routing data remain available.", 5000);
        this._coverageRenderLimited = true; return;
      }
      this._coverageRenderLimited = false;
      const styles = {
        fresh: { color: [55,213,130,.9], width: 2, style: "solid" },
        aging: { color: [255,193,7,.95], width: 2, style: "solid" },
        stale: { color: [255,110,50,1], width: 3, style: "solid" },
        none: { color: [220,50,50,1], width: 3, style: "dash" },
      };
      const graphics: __esri.Graphic[] = [];
      for (const tier of ["fresh","aging","stale","none"] as const) {
        const paths = display.groups[tier];
        for (let i=0;i<paths.length;i+=512) graphics.push(new this.ArcGISModules.Graphic({
          geometry: { type: "polyline", paths: paths.slice(i,i+512), spatialReference: { wkid:4326 } },
          symbol: { type: "simple-line", ...styles[tier] }, attributes: { coverage_tier: tier },
        }));
      }
      if (!current()) return;
      // One synchronous commit after preparation; no per-segment layer updates.
      layer.removeAll(); layer.addMany(graphics);
    } catch (error) {
      if (current()) this.showToast("Classified streets could not be drawn. Analysis and routing data are retained.", 4000);
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
  private _featureLoadedBboxes: Map<string, [number, number, number, number]> = new Map();
  private _loadedFeatureTileKeys: Map<string, Set<string>> = new Map();
  private _featureTileOids: Map<string, Map<string, number[]>> = new Map();
  private _featureLoadedKeys: Map<string, string> = new Map();
  private _featureRequestCounts: Map<string, number> = new Map();
  private _featureOidCounters: Map<string, number> = new Map();
  private _loadedFeatureIds: Map<string, Set<string>> = new Map();
  private _turboLoadTask: Promise<void> = Promise.resolve();
  private _turboDecodeTask: Promise<void> = Promise.resolve();
  private _turboCloseLayer: __esri.GraphicsLayer | null = null;
  private _turboCloseView: __esri.MapView | __esri.SceneView | null = null;
  private _turboCloseGraphics = new Map<string, __esri.Graphic>();
  private _turboCloseWatch: __esri.WatchHandle | null = null;
  private _turboCloseSymbols = new Map<string, any>();
  private _turboElevationSignature = "";
  private _selectionRequestId = 0;
  private _selectionAbort: AbortController | null = null;
  private _sequenceStorageDisabled = false;
  private _selectionRetry: { sequenceId: string; imageId: string } | null = null;
  private _lastSuccessfulSelection: any = null;
  private _coverageNoticeHidden = false;
  private _coverageHelpButton = React.createRef<HTMLButtonElement>();
  private _focusCoverageHelp = (node: HTMLDivElement | null) => node?.focus();
  private _turboLoadingTimer: ReturnType<typeof setTimeout> | null = null;
  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;
  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;
  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;
  private _turboCloseReady = false;
  private _turboCloseFallback: string | null = null;
  private _turboCloseFallbackAction: "zoom" | "retry" = "zoom";
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
  private _turboHoveredScreen: { x: number; y: number } | null = null;
  private _turboMapLeaveCleanup: (() => void) | null = null;
  private _turboClickPickAbort: AbortController | null = null;


  // Point Cloud Variables
  private _pointCloudCache = new PointCloudClusterCache();
  private _pointCloudAbort: AbortController | null = null;
  private _pointCloudRequest = 0;
  private _pointCloudAutoTimer: ReturnType<typeof setTimeout> | null = null;
  private _pointCloudRenderRequest = 0;
  private _pointCloudEditTask: Promise<void> = Promise.resolve();
  private _pointCloudFeatures = new Map<number, any>();
  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;
  private _pointCloudModeActive = false;
  private _pointCloudAutoFailures = 0;
  private _pointCloudLoadTask: Promise<void> | null = null;
  private _pointCloudQueueVersion = 0;
  private _pointCloudViewerObjectIds: number[] = [];
  private _pointCloudIndexByOriginal = new Map<number, number>();
  private _pointCloudMapUpdating = false;
  private _pointCloudLayerResult: PointCloudResult | null = null;
  private _pointCloudLayerView: __esri.MapView | __esri.SceneView | null = null;
  private _pointCloudLayer: __esri.Layer | null = null;
  private _pointCloudRendererActive: boolean = false; // tracks if Mapillary viewer renderer is attached
  private _pointCloudViewerRenderer: any = null;
  private _pointCloudExportBusy = false;
  private _groundMode: boolean = false;
  private _ringGeneration: number = 0; // Incremented on every ring redraw to cancel stale async draws
  private _lassoHighlightHandle: __esri.Handle | null = null; // Holds the ArcGIS highlight reference so we can clear it when redrawing
  private _isDrawingLasso: boolean = false;
  private measureLabelRef = React.createRef<HTMLDivElement>();

  // Measurement Renderer Variables
  private _measurementRendererActive: boolean = false;
  private _measurementViewerRenderer: any = null;
  private _sightViewModel: any = null;
  private _viewshedAnalysis: any = null;
  private _gridLayer: __esri.GraphicsLayer | null = null;
  private _gridLayerReady: Promise<void> | null = null;

  // Nude Tool Variables
  private _nudgeX: number = 0; // East/West offset in meters
  private _nudgeY: number = 0; // North/South offset in meters
  private _nudgeZ: number = 0; // Up/Down offset in meters
  private _baseAlt: number = 0;
  private _cameraLat: number = 0;
  private _cameraLon: number = 0;
  private _currentPointCloudResult: PointCloudResult | null = null;
  private _filteredPointCloudPoints: PointCloudPoint[] = [];
  private _measureLayer: __esri.GraphicsLayer | null = null;

  // UI elements
  private tooltipDiv: HTMLDivElement | null = null;
  private minimapView: __esri.MapView | null = null;
  private minimapGraphicsLayer: __esri.GraphicsLayer | null = null;

  // Caches and timeouts
  private sequenceCoordsCache: Record<string, { id: string; lat: number; lon: number }[]> = {};
  private _directionDiscovery: DirectionHoverDiscovery | null = null;
  private _hoverTimeout: any = null;
  private _zoomWarningTimeout: any = null;
  private _currentHoveredFeatureId: string | null = null;
  private _directionUnsubscribe: (() => void) | null = null;
  private detectionTagMap: Map<string, string> = new Map();
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Backup arrays to reset filter dropdowns to their initial state
  private _fullTrafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }> = [];
  private _fullObjectsOptions: Array<{ value: string; label: string; iconUrl: string | null }> = [];

  // Camera settings
  private coneSpreads = [60, 40, 30, 20];
  private coneLengths = [10, 15, 20, 30];
  private zoomStepIndex = 0;
  private _lastBearing: number = 0;
  private _coneRedrawRaf: number | null = null;

  // Debounced function
  private debouncedTurboFilter: (() => void) & { cancel?: () => void };
  private _debouncedBearingUrlUpdate: (() => void) & { cancel?: () => void } = Object.assign(() => {}, { cancel: () => {} });
  private _debouncedZoomUrlUpdate: (() => void) & { cancel?: () => void } = Object.assign(() => {}, { cancel: () => {} });
  private zoomDisplayHandle: __esri.WatchHandle | null = null;
  private _sequenceRequests = new SharedSequenceRequests((id, token, signal, progress) => this.fetchSequenceWithCoords(id, token, signal, progress));
  private _nearbyDiscovery: NearbyImageDiscovery | null = null;
  private _turboAbortController: AbortController | null = null;

  // Request tracking
  private _turboRequestCount: number = 0;
  private _hasCheckedSharedState: boolean = false;
  private _sharedStateRestoreComplete: boolean = false;
  private _isFlyInActive: boolean = false;
  private _hasAttemptedMapSwitch: boolean = false;

  // Hover graphics
  private _turboHoverGraphic: __esri.Graphic | null = null;
  private _turboHoverGraphicsLayer: __esri.GraphicsLayer | null = null;
  private _turboHoverInterval: any = null;
  private _turboHoverFrame: number | null = null;
  private _turboHoverOverlay: HTMLDivElement | null = null;
  private _activeSequenceOverlay: ActiveSequenceOverlay<__esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;
  private _lastHoveredTurboOid: string | number | null = null;
  private _sequenceHoverHighlight: SequenceHoverHighlight<__esri.VectorTileLayer> | null = null;
  private _nearbySelectedId: string | null = null;

  // Solar & Shadow Modeling
  private _mapLegendLayer: __esri.FeatureLayer | null = null;
  private _mapLegendView: __esri.MapView | __esri.SceneView | null = null;
  private _solarMapOverlay: SolarMapOverlay<__esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;

  private clearMapLegendLayer() {
    if (this._mapLegendLayer) { this._mapLegendView?.map?.remove(this._mapLegendLayer); this._mapLegendLayer.destroy(); }
    this._mapLegendLayer = null; this._mapLegendView = null;
  }

  private syncMapLegendLayer() {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules?.FeatureLayer || this.props.config.hideLegend) { this.clearMapLegendLayer(); return; }
    if (this._mapLegendView !== view) this.clearMapLegendLayer();
    if (this._mapLegendLayer) return;
    // Empty client-side layer: legend renderer only, no coverage feature copies.
    this._mapLegendLayer = new this.ArcGISModules.FeatureLayer({
      id: `mapillary-symbol-legend-${this.props.id || "explorer"}`, title: "Mapillary Explorer Symbols",
      source: [], fields: [{ name: "OBJECTID", type: "oid" }, { name: "symbol_role", type: "string" }],
      objectIdField: "OBJECTID", geometryType: "point", spatialReference: { wkid: 4326 },
      popupEnabled: false, legendEnabled: true,
      renderer: { type: "unique-value", field: "symbol_role", defaultSymbol: null,
        uniqueValueInfos: [
          { value: "active", label: "Active Image", symbol: { type: "simple-marker", color: "#00ff00", size: 9, outline: { color: "white", width: 1 } } },
          { value: "sequence", label: "Active Sequence Images", symbol: { type: "simple-marker", color: "blue", size: 7, outline: { color: "yellow", width: 1 } } },
          { value: "hover", label: "Hovered Image", symbol: { type: "simple-marker", color: "brown", size: 7, outline: { color: "white", width: 1 } } },
          { value: "first", label: "First Selected Image", symbol: { type: "simple-marker", color: [0,0,0,0], size: 7, outline: { color: "cyan", width: 1.5 } } },
          { value: "next", label: "Next Frame", symbol: { type: "simple-marker", color: "yellow", size: 7, outline: { color: "orange", width: 1 } } },
          { value: "note", label: "Field Note", symbol: { type: "simple-marker", style: "diamond", color: "#f5a623", size: 7, outline: { color: "white", width: 1 } } },
        ] },
    });
    this._mapLegendView = view; view.map.add(this._mapLegendLayer);
  }

  private _solarViewer: SolarViewerRenderer | null = null;
  private _solarSceneLighting: SolarSceneLighting | null = null;

  // Elevation Profile
  private _elevationProfile: ElevationProfileController | null = null;

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
    turboFilterStartDate: "",
    turboFilterEndDate: "",
    turboFilterIsPano: undefined,
        turboFilterOnFoot: undefined,
    showTurboFilterBox: false,
    turboYearLegend: [],
    qualityViewActive: false,
    selectedQualityBand: null,
    showTrafficSignsFilterBox: false,
    trafficSignsFilterValue: { value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null },
    trafficSignsOptions: [{ value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null }],
    showObjectsFilterBox: false,
    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },
    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],
    filtersLoaded: false,
    showIntro: true,
    hasTimeTravel: false,
    showMinimap: true,
    detectionsActive: false,
    showAiTags: true,
    isSharedState: false,
    alternateImages: [],
    selectedFeatureLocation: null,
    isFetchingAlternates: false,
    targetDetectionId: null,
    syncHeading: false,
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
    this.log("Loaded Access Token:", this.accessToken);

    // Wrap the layer reload logic in debounce (300ms delay after typing stops)
    this.debouncedTurboFilter = debounceUtil(async () => {
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

  // Binds events (cone drawing, zoom, image changes) to the current viewer instance.
  private bindMapillaryEvents() {
    if (!this.mapillaryViewer) return;

    // Clear any existing green pulse before binding new events
    this.clearGreenPulse();

    // Also clear any existing cone graphics
    this.clearConeGraphics();

    // Debounced URL bearing update, rebuilds on every bindMapillaryEvents call
    // so it always closes over the latest imageId/lat/lon from state
    this._debouncedBearingUrlUpdate = debounceUtil(() => {
      // Skip while fly-in is active, Mapillary keeps firing bearing events
      // as it transitions to the image's natural compass angle, which would
      // overwrite the shared bearing in the URL before the user even sees it.
      if (this._isFlyInActive) return;
      const { imageId, sequenceImages } = this.state;
      if (!imageId) return;
      const img = sequenceImages.find((s) => s.id === imageId);
      if (img) this.updateUrlWithCurrentImage(imageId, img.lat, img.lon);
    }, 600);

    // Define local redraw helper, pass specific coordinates
    const redrawCone = async (lon?: number, lat?: number) => {
      const view = this.state.jimuMapView?.view;
      if (!view) return;

      // If Turbo Mode is active and no specific sequence is selected,
      // we should not draw the camera cone.
      if (this.state.turboModeActive && !this.state.selectedSequenceId) {
        this.clearConeGraphics();
        return;
      }

      // If no coordinates provided, get from current image
      if (lon === undefined || lat === undefined) {
        const currentId = this.state.imageId;
        if (!currentId) return;
        const img = this.state.sequenceImages.find((s) => s.id === currentId);
        if (!img) return;
        lon = img.lon;
        lat = img.lat;
      }

      // Get bearing from viewer or fallback
      let bearing = this._lastBearing || 0;
      try {
        const b = await this.mapillaryViewer.getBearing();
        if (typeof b === "number") {
          bearing = b;
          this._lastBearing = bearing;
        }
      } catch (e) {
        /* ignore */
      }

      const length = this.coneLengths[this.zoomStepIndex];
      const spread = this.coneSpreads[this.zoomStepIndex];

      // drawCone() already clears the previous cone internally
      this.drawCone(lon, lat, bearing, length, spread);
    };

    // 1. Viewer Load Event
    this.mapillaryViewer.on("load", () => {
      // Zoom component logic
      const zoomComponent: any = this.mapillaryViewer.getComponent("zoom");
      if (zoomComponent && zoomComponent._zoomDelta$) {
        zoomComponent._zoomDelta$.subscribe((delta: number) => {
          if (delta > 0 && this.zoomStepIndex < this.coneSpreads.length - 1) {
            this.zoomStepIndex++;
          } else if (delta < 0 && this.zoomStepIndex > 0) {
            this.zoomStepIndex--;
          }
          redrawCone();
        });
      }

      // Disable Keyboard Zoom
      const keyboardComponent: any = this.mapillaryViewer.getComponent("keyboard");
      if (keyboardComponent?.keyZoom) {
        keyboardComponent.keyZoom.disable();
      }

      // Custom Wheel Logic
      if (this.viewerContainer.current) {
        this.viewerContainer.current.onwheel = (evt: WheelEvent) => {
          evt.preventDefault();
          if (evt.deltaY < 0) {
            this.zoomStepIndex = Math.min(this.zoomStepIndex + 1, this.coneSpreads.length - 1);
          } else {
            this.zoomStepIndex = Math.max(this.zoomStepIndex - 1, 0);
          }
          redrawCone();
        };
      }

      // Set initial bearing and draw cone
      this.mapillaryViewer
        .getBearing()
        .then((b: number) => {
          if (typeof b === "number") {
            this._lastBearing = b;
            redrawCone();
          }
        })
        .catch(() => {
          redrawCone();
        });

      // PLAYBACK RECOVERY GUARDIAN
      const sequenceComponent: any = this.mapillaryViewer.getComponent("sequence");
      if (sequenceComponent) {
        sequenceComponent.on("playing", (event: { playing: boolean }) => {
          if (event.playing) {
            this._userPaused = false; // Native player successfully started
            this._nearbyDiscovery?.cancel();
            if (this.state.nearbyLoading) this.setState({ nearbyLoading: false });
          } else {
            // The player paused. Was it the user, or a network crash?
            const timeSinceLastInteraction = Date.now() - this._lastInteractionTime;

            if (timeSinceLastInteraction < 500) {
              // A human clicked or pressed a key recently, so respect their pause
              this._userPaused = true; this.refreshNearbyAfterPause();
            } else if (!this._userPaused) {
              // Nobody touched anything, but playback halted. Must be a dead frame on the CDN!
              this.log("[Mapillary Recovery] Playback halted on dead frame. Auto-skipping...");

              // ADD THIS: Notify the user what is happening!
              this.showToast(
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ffc107" }}>
                  <Icons.Warning size={14} />
                  (403) Skipping unavailable frame...
                </span>,
                2000,
              );

              setTimeout(() => this.forceSkipNext(), 400);
            }
          }
        });
      }

      // Track genuine user pause intent without blocking camera rotation
      if (this.viewerContainer.current && !(this.viewerContainer.current as any)._hasPlaybackListener) {
        (this.viewerContainer.current as any)._hasPlaybackListener = true;

        const handleInteraction = (e: Event) => {
          const target = e.target as HTMLElement | null;

          // 1. Dragging/clicking the canvas rotates bearing or pitches the camera — DO NOT pause!
          if (target instanceof HTMLCanvasElement || target?.tagName === "CANVAS") {
            return;
          }

          // 2. Keyboard: only Spacebar is the Mapillary native play/pause shortcut
          if (e instanceof KeyboardEvent) {
            if (e.code !== "Space" && e.key !== " ") {
              return;
            }
          }

          // 3. Pointer events: only flag pause if clicking sequence buttons/controls
          if (e instanceof PointerEvent || e instanceof MouseEvent) {
            const isSequenceControl = target?.closest?.('.mapillary-sequence-container, [class*="sequence"]');
            const isButton = target?.closest?.("button");
            if (!isSequenceControl && !isButton) {
              return; // Ignore clicks on custom overlays, measurement labels, etc.
            }
          }

          // User deliberately clicked Pause or hit Spacebar
          this._lastInteractionTime = Date.now();
          this._userPaused = true;
        };

        this.viewerContainer.current.addEventListener("pointerdown", handleInteraction, true);
        this.viewerContainer.current.addEventListener("keydown", handleInteraction, true);
      }
    });

    // Setup Direction Component Hover with delay
    setTimeout(() => {
      this.setupDirectionHover();
    }, 500); // 500ms delay to ensure component is loaded

    // 2. Bearing Change Event
    this.mapillaryViewer.on("bearing", (event: any) => {
      this._lastBearing = event.bearing;

      /**
       * Cone drawing in SceneView is relatively expensive.
       *
       * Mapillary can emit several bearing events before the browser
       * has rendered the next frame. Instead of rebuilding the cone
       * for every single event, collapse them into one redraw per frame.
       *
       * The most recent bearing is always kept in this._lastBearing.
       */
      if (this._coneRedrawRaf == null) {
        this._coneRedrawRaf = requestAnimationFrame(() => {
          this._coneRedrawRaf = null;

          redrawCone();
        });
      }

      // Keep existing minimap behavior unchanged for now
      this.updateMinimapTracking();

      // Debounced URL update
      this._debouncedBearingUrlUpdate();

      const view = this.state.jimuMapView?.view;

      if (view && view.type === "3d" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading) {
        const activeImg = this.state.sequenceImages.find((s) => s.id === this.state.imageId);

        if (activeImg) {
          view.goTo(
            {
              center: [activeImg.lon, activeImg.lat],
              heading: event.bearing,
            },
            {
              animate: false,
            },
          );
        } else {
          view.goTo(
            {
              heading: event.bearing,
            },
            {
              animate: false,
            },
          );
        }
      }
    });

    // 3. Image Change Event
    this.mapillaryViewer.on("image", async (event: any) => {
      // Apply custom angle if set in config
      // Only apply custom angle on the initial load, not during sequence navigation
      if (this._isInitialImageLoad) {
        this.applyCustomCameraAngle();
      }
      const newId = event.image.id;
      const view = this.state.jimuMapView?.view;
      if (!view) return;

      // Check if this image is in our current sequence
      let newImg = this.state.sequenceImages.find((s) => s.id === newId);
      let didLateralJump = false; // Track if we jumped to a new sequence

      // If not found (lateral movement to different sequence), fetch the new sequence
      if (!newImg) {
        this.log("Image not in current sequence, fetching new sequence data...");
        didLateralJump = true; // Mark that we're doing a lateral jump

        try {
          // Fetch the sequence ID for this image
          const resp = await fetch(`${GRAPH_API.BASE}/${newId}?fields=sequence,geometry`, {
            headers: { Authorization: `OAuth ${this.accessToken}` },
          });

          if (resp.ok) {
            const data = await resp.json();
            const newSeqId = data.sequence;
            const coords = data.geometry?.coordinates;

            if (newSeqId && coords) {
              // Fetch full sequence coordinates
              const newSequenceImages = await this.getSequenceWithCoords(newSeqId, this.accessToken);

              // Update state with new sequence
              this.setState({
                sequenceId: newSeqId,
                selectedSequenceId: newSeqId,
                sequenceImages: newSequenceImages,
              });

              // Save to cache
              this.saveSequenceCache(newSeqId, newSequenceImages);

              // Find the new image in the updated sequence
              newImg = newSequenceImages.find((s) => s.id === newId);

              // Redraw sequence graphics
              if (newImg) {
                // Clear green pulse first
                this.clearGreenPulse();

                // Clear ALL old graphics (including old sequence overlay)
                const toRemove: __esri.Graphic[] = [];
                view.graphics.forEach((g) => {
                  toRemove.push(g);
                });
                toRemove.forEach((g) => view.graphics.remove(g));

                // Draw new sequence polyline
                if (newSequenceImages.length > 1) {
                  const { Graphic } = this.ArcGISModules;
                  const paths = newSequenceImages.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });

                  const polylineGraphic = new Graphic({
                    geometry: { type: "polyline", paths: [paths], spatialReference: { wkid: 4326 } },
                    symbol: { type: "simple-line", color: [0, 0, 255, 0.8], width: 3 },
                    attributes: { sequenceId: newSeqId },
                  });
                  (polylineGraphic as any).__isSequenceOverlay = true;
                  view.graphics.add(polylineGraphic);
                }

                // Draw new sequence points
                newSequenceImages.forEach((img) => {
                  if (img.id !== newId) {
                    const position = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat);
          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], newSeqId, img.id);
                  }
                });
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch lateral sequence:", err);
          return; // Exit if we can't load the new sequence
        }
      }

      if (!newImg) {
        console.warn("Could not locate image coordinates");
        return;
      }

      // Turn previous active into static blue point ONLY if staying in same sequence
      if (this.state.imageId && this.state.imageId !== newId && !didLateralJump) {
        const prevImg = this.state.sequenceImages.find((s) => s.id === this.state.imageId);
        if (prevImg) {
          this.clearGreenPulse();
          const previousPosition = this.getCoverageDisplayPosition(String(prevImg.id), prevImg.lon, prevImg.lat);
          this.drawPointWithoutRemoving(previousPosition.lon, previousPosition.lat, [0, 0, 255, 1], this.state.sequenceId!, prevImg.id);
        }
      }

      // Update State with New ID
      this.setState({ imageId: newId }, () => {
        this._nearbySelectedId = null; // real imageId is now in state, clear the optimistic selection

        // 1. FRESH LOOKUP: Ensure we have the exact coordinates for the active ID
        // This guarantees the graphics are drawn exactly where the new image is.
        const activeImg = this.state.sequenceImages.find((s) => s.id === newId);
        this.checkAndLoadNextPointCloud(newId);
        // GUARD: Only access coordinates if activeImg was found!
        if (activeImg) {
          // Update elevation readout and profile chart needle
          if (this.state.isElevationProfileActive) {
            this.updateProfileIndicator();
          }
          // Reuse the same-image marker; drawPulsingPoint replaces a different image.
          this.currentGreenGraphic = this.drawPulsingPoint(activeImg.lon, activeImg.lat, [0, 255, 0, 1], activeImg.id);
          this._lastSuccessfulSelection = { sequenceImages: this.state.sequenceImages, imageId: newId, sequenceId: this.state.sequenceId, selectedSequenceId: this.state.selectedSequenceId };

          this.checkForTimeTravel(newId);

          if (this.state.isSolarMode) {
            this.updateSolarGraphics();
          }

          this.mapillaryViewer
            .getBearing()
            .then((b: number) => {
              if (typeof b === "number") {
                this._lastBearing = b;
              }
              redrawCone(activeImg.lon, activeImg.lat);
            })
            .catch(() => {
              redrawCone(activeImg.lon, activeImg.lat);
            });

          // 3. Map Synchronization Logic (With Offset)
          if (this.props.config.syncMapWithImage === true && !this._isFlyInActive) {
            const position = this.props.config.syncMapPosition || "center";
            // Profile tracking follows the image position without letting goTo resolve a new zoom.
            const followScale = view.scale;

            const targetPoint = new this.ArcGISModules.Point({
              longitude: activeImg.lon,
              latitude: activeImg.lat,
            });

            // 3D SCENE: GPS NAVIGATION MODE
            if (view.type === "3d") {
              const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);
              if (camera) view.goTo(camera, { animate: true, duration: 300 });
            }
            // 2D MAP MODE
            else {
              // Standard Center
              if (position === "center") {
                view.goTo({ center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
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

                    view.goTo({ center: newCenter, scale: followScale }, { animate: true, duration: 300 });
                  } else {
                    view.goTo({ center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
                  }
                } catch (e) {
                  view.goTo({ center: targetPoint, scale: followScale }, { animate: true, duration: 300 });
                }
              }
            }
          }
        }
      });

      if (this.state.detectionsActive) {
        this.loadDetections(event.image.id);
      }
      this.updateViewerFieldNoteMarkers();
      // Reverse geocode
      this.fetchReverseGeocode(newImg.lat, newImg.lon);
      // Update minimap tracking
      this.updateMinimapTracking();
      if (!this._isFlyInActive) {
        this.updateUrlWithCurrentImage(newId, newImg.lat, newImg.lon);
      }

      this.fetchNearbyImages(newImg.lat, newImg.lon, newId);
    });
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

  /**
   * Sets up hover detection for DirectionComponent arrows.
   * When user hovers over navigation arrows, highlights the target image marker on the map.
   */
  private setupDirectionHover() {
    if (!this.mapillaryViewer) return;

    try {
      const directionComponent: any = this.mapillaryViewer.getComponent("direction");

      if (!directionComponent) {
        console.warn("DirectionComponent not found");
        return;
      }

      if (directionComponent._hoveredId$) {
        const subscription = directionComponent._hoveredId$.subscribe((hoveredId: string | null) => {
          this.log("Direction hover:", hoveredId);
          this.handleDirectionHover(hoveredId);
        });

        // Store unsubscribe function for cleanup
        this._directionUnsubscribe = () => subscription.unsubscribe();

        // Mobile 'hover'
        if (this.viewerContainer.current) {
          const container = this.viewerContainer.current;

          const simulateMouseMove = (e: TouchEvent) => {
            if (e.touches.length > 1) return;

            const touch = e.touches[0];
            // create fake mousemove event
            const mouseEvent = new MouseEvent("mousemove", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: touch.clientX,
              clientY: touch.clientY,
              screenX: touch.screenX,
              screenY: touch.screenY,
            });

            if (e.target) {
              e.target.dispatchEvent(mouseEvent);
            }
          };

          // TouchStart
          container.addEventListener("touchstart", simulateMouseMove, { passive: true });

          // TouchMove
          container.addEventListener("touchmove", simulateMouseMove, { passive: true });

          // TouchEnd
          container.addEventListener(
            "touchend",
            () => {
              this.handleDirectionHover(null);
            },
            { passive: true },
          );
        }
      } else {
        console.warn("_hoveredId$ not available on DirectionComponent");
      }
    } catch (err) {
      console.warn("Failed to setup direction hover:", err);
    }
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
      setInterval: (callback, milliseconds) => setInterval(callback, milliseconds),
      clearInterval: handle => clearInterval(handle),
    });
  }

  /** Forward the resolved navigation target to the map/minimap pulse owner. */
  private drawDirectionHighlight(hoveredImg: { id: string; lon: number; lat: number }) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;
    this.ensureDirectionHoverMarker().draw(view, hoveredImg);
  }

  /** Release the navigation-target marker, matching minimap marker and pulse interval. */
  private clearDirectionHighlight() {
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
  // Fetches all image coordinates in the sequence,
  // updates the viewer, re-draws map markers,
  // and attaches Mapillary event listeners for bearing/image changes.
  private async getSelectedImageCoords(sequenceId: string, imageId: string, signal: AbortSignal): Promise<{id:string;lon:number;lat:number;captured_at?:number}> {
    const cached: {id:string;lon:number;lat:number;captured_at?:number}[] = this.sequenceCoordsCache[sequenceId] || (this.state.sequenceId === sequenceId ? this.state.sequenceImages : []);
    const found = cached.find(p => String(p.id) === String(imageId));
    if (found && Number.isFinite(found.lon) && Number.isFinite(found.lat)) return { ...found, id: String(imageId) };
    const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/${imageId}?fields=id,geometry,captured_at`, this.accessToken, signal);
    const xy = data.geometry?.coordinates;
    if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1])) throw Object.assign(new Error("Selected image coordinates are unavailable"), { status: 404 });
    return { id: String(imageId), lon: xy[0], lat: xy[1], captured_at: data.captured_at ? new Date(data.captured_at).getTime() : undefined };
  }

  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false) {
    const requestId = ++this._selectionRequestId;
    this._selectionAbort?.abort();
    const controller = new AbortController(); this._selectionAbort = controller;
    const previous = this.mapillaryViewer ? this._lastSuccessfulSelection : null;
    this._selectionRetry = { sequenceId, imageId: startImageId };
    const current = () => requestId === this._selectionRequestId && !controller.signal.aborted && this.state.jimuMapView?.view === jimuMapView?.view;
    if (this.currentGreenGraphic?.attributes?.image_id !== String(startImageId)) this.clearGreenPulse();
    this._userPaused = true;
    this.clearConeGraphics();

    const { jimuMapView } = this.state;
    if (!jimuMapView) return;

    // A clicked hybrid image can be highlighted before sequence metadata arrives.
    const clicked = this._turboCloseGraphics.get(String(startImageId));
    if (clicked && Number.isFinite(clicked.attributes?.turbo_lon) && Number.isFinite(clicked.attributes?.turbo_lat)) {
      this.drawPulsingPoint(clicked.attributes.turbo_lon, clicked.attributes.turbo_lat, [0, 255, 0, 1], startImageId);
    } else if (clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {
      this.drawPulsingPoint(clickPoint.lon, clickPoint.lat, [0, 255, 0, 1], startImageId);
    }
    this._nearbyDiscovery?.cancel();
    this.setState({ nearbyLoading: false, isLoading: true, imageryRepresentative: representative, sequenceRouteProgress: undefined, sequenceRouteLoading: true, selectionError: undefined, selectionCanRetry: false });

    if (this.state.isElevationProfileActive) {
      this.updateElevationProfile();
    }

    try {
      // Fetch only the selected image first; full route loading must not block opening imagery.
      const selected = await this.getSelectedImageCoords(sequenceId, startImageId, controller.signal);
      let updatedSequence = [selected];
      if (!current()) return;
      if (!updatedSequence.some(img => String(img.id) === String(startImageId))) throw Object.assign(new Error("Selected image coordinates are unavailable"), { status: 404 });

      // Commit coordinates before moveTo can emit its image event.
      await new Promise<void>(resolve => {
        const cancelled = () => resolve(); controller.signal.addEventListener("abort", cancelled, { once: true });
        this.setState({ sequenceImages: updatedSequence, imageId: startImageId, sequenceId, selectedSequenceId: sequenceId, hasTimeTravel: false }, () => {
          controller.signal.removeEventListener("abort", cancelled); resolve();
        });
      });
      if (!current()) return;

      // Check for Time Travel for the starting image
      let currentImg = updatedSequence.find((img) => String(img.id) === String(startImageId));
      if (currentImg) {
        this.checkForTimeTravel(startImageId);
        this.currentGreenGraphic = this.drawPulsingPoint(currentImg.lon, currentImg.lat, [0, 255, 0, 1], currentImg.id);
      }


      // Create new Mapillary viewer
      if (!this.mapillaryViewer && this.viewerContainer.current) {
        this._isInitialImageLoad = true;
        this.mapillaryViewer = new Viewer({
          container: this.viewerContainer.current,
          accessToken: this.accessToken,
          imageTiling: false,
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
        if (this.state.pointCloudVisible && this._currentPointCloudResult) {
          this.addViewerPointCloudRenderer({ ...this._currentPointCloudResult, points: this._filteredPointCloudPoints }, startImageId);
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

      if (!this.mapillaryViewer) throw new Error("Image viewer is not ready");
      if (previous?.imageId !== startImageId) await this.mapillaryViewer.moveTo(startImageId);
      if (!current()) return;

      if (previous?.sequenceId && previous.sequenceId !== sequenceId) this.clearActiveSequenceGraphics(previous.sequenceId);
      this.clearActiveSequenceLayer();
      void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);
      this.setState({ isLoading: false });
      this.drawPulsingPoint(selected.lon, selected.lat, [0, 255, 0, 1], selected.id);
      try { this._lastBearing = await this.mapillaryViewer.getBearing(); } catch { /* Retain last known bearing. */ }
      if (!current()) return;
      this.drawCone(selected.lon, selected.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
      this._lastSuccessfulSelection = { sequenceImages: [selected], imageId: startImageId, sequenceId, selectedSequenceId: sequenceId };
      try { updatedSequence = await this.getSequenceWithCoords(sequenceId, this.accessToken, controller.signal, (points, batch, loaded, total) => {
        if (!current()) return;
        this.setState({ sequenceRouteProgress: `${loaded.toLocaleString()}/${total.toLocaleString()}` });
        if (points.length < 2 || !this.ArcGISModules?.Graphic) return;
        const layer = this.ensureActiveSequenceLayer(jimuMapView.view);
        layer.add(new this.ArcGISModules.Graphic({ geometry: { type: "polyline", paths: [points.map(p => { const display = this.getCoverageDisplayPosition(p.id, p.lon, p.lat); return [display.lon, display.lat]; })], spatialReference: { wkid: 4326 } }, symbol: { type: "simple-line", color: [0,0,255,0.65], width: 3 }, attributes: { sequence_preview: true, sequence_batch: batch, sequenceId } }));
      }); }
      catch (error) {
        if (current()) this.setState({ sequenceRouteLoading: false, selectionError: "Image is open, but its sequence route could not load. Retry or choose another point.", selectionCanRetry: true });
        return;
      }
      if (!current()) return;
      this.setState({ sequenceRouteLoading: false });
      if (this._activeSequenceOverlay?.layer) {
        const previews = this._activeSequenceOverlay?.layer.graphics.toArray().filter(g => g.attributes?.sequence_preview);
        this._activeSequenceOverlay?.layer.removeMany(previews);
      }
      // Viewer navigation may have changed the active image while the route loaded.
      if (this.state.imageId !== startImageId) { if (this.state.sequenceId === sequenceId) this.setState({ sequenceImages: updatedSequence }); return; }
      this.setState({ sequenceImages: updatedSequence });
      currentImg = updatedSequence.find(img => String(img.id) === String(startImageId)) || selected;
      this.saveSequenceCache(sequenceId, updatedSequence);


      // Clear old map graphics (except overlay)
      const toRemove: __esri.Graphic[] = [];
      jimuMapView.view.graphics.forEach((g: __esri.Graphic) => {
        if (!(g as any).__isSequenceOverlay && !(g as any).__isClickRipple) {
          toRemove.push(g);
        }
      });
      toRemove.forEach((g) => jimuMapView.view.graphics.remove(g));

      // Draw Polyline FIRST so it stays BEHIND points
      const { Graphic } = this.ArcGISModules;

      const hasPolyline = jimuMapView.view.graphics.some((g: __esri.Graphic) => (g as any).__isSequenceOverlay && g.geometry?.type === "polyline" && g.attributes?.sequenceId === sequenceId);

      if (!hasPolyline && updatedSequence.length > 1) {
        const paths = updatedSequence.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });

        const polylineGraphic = new Graphic({
          geometry: { type: "polyline", paths: [paths], spatialReference: { wkid: 4326 } },
          symbol: { type: "simple-line", color: [0, 0, 255, 0.8], width: 3 },
          attributes: { sequenceId: sequenceId },
        });
        (polylineGraphic as any).__isSequenceOverlay = true;
        jimuMapView.view.graphics.add(polylineGraphic);
      }

      // Draw Blue Dots (Active Sequence), Now they render ON TOP of the line
      let markerBatch: __esri.Graphic[] = [];
      for (const img of updatedSequence) {
        if (!current()) return;
        if (img.id !== startImageId && img.id !== this.state.imageId) {
          const position = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat);
          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], sequenceId, img.id, markerBatch);
        }
        if (markerBatch.length >= 256) { this.ensureActiveSequenceLayer(jimuMapView.view).addMany(markerBatch); markerBatch = []; await new Promise(resolve => setTimeout(resolve, 0)); }
      }
      if (markerBatch.length) this.ensureActiveSequenceLayer(jimuMapView.view).addMany(markerBatch);
      if (this.state.imageId !== startImageId) return;


      // Draw active Green Pulse - Topmost
      if (currentImg) {
        this.currentGreenGraphic = this.drawPulsingPoint(currentImg.lon, currentImg.lat, [0, 255, 0, 1], currentImg.id);
      }

      // Redraw clicked location marker if exists
      // Use passed point (fresh) or fallback to state (if no new click passed)
      const targetLon = clickPoint ? clickPoint.lon : this.state.clickLon;
      const targetLat = clickPoint ? clickPoint.lat : this.state.clickLat;

      if (targetLon != null && targetLat != null) {
        this.drawPoint(targetLon, targetLat);
      }
      if (currentImg) {
        try { this._lastBearing = await this.mapillaryViewer.getBearing(); } catch { /* Use last known bearing. */ }
        if (!current()) return;
        this.drawCone(currentImg.lon, currentImg.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
      }
      this._lastSuccessfulSelection = { sequenceImages: updatedSequence, imageId: startImageId, sequenceId, selectedSequenceId: sequenceId };
      this._selectionRetry = null;
    } catch (err) {
      if (!current()) return;
      this.setState({ sequenceRouteLoading: false });
      this.clearGreenPulse(); this.clearConeGraphics();
      if (previous) {
        this.setState(previous, () => {
          if (!current()) return;
          const image = previous.sequenceImages.find((p: any) => p.id === previous.imageId);
          if (image) {
            this.drawPulsingPoint(image.lon, image.lat, [0, 255, 0, 1], image.id);
            this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);
          }
        });
      }
      if (!previous) { this._lastSuccessfulSelection = null; this.setState({ imageId: null, sequenceImages: [], sequenceId: null, selectedSequenceId: null }); }
      const status = (err as any)?.status;
      const unavailable = status === 401 || status === 403 || status === 404;
      this.setState({ selectionError: unavailable ? "This image is unavailable. Choose another point." : "Image could not load. Check your connection, retry, or choose another point.", selectionCanRetry: !unavailable });
    } finally {
      if (requestId === this._selectionRequestId) this.setState({ isLoading: false });
    }
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
  private async fetchMapillaryJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {
    return fetchGraphJson(url, accessToken, signal);
  }

  private async getSequenceWithCoords(sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {
    this._sequenceRequests ??= new SharedSequenceRequests((id, token, requestSignal, progress) => this.fetchSequenceWithCoords(id, token, requestSignal, progress));
    return this._sequenceRequests.get(sequenceId, accessToken, signal, onProgress);
  }

  private async fetchSequenceWithCoords(sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {
    return fetchSequenceCoordinates({
      cache: this.sequenceCoordsCache,
      fetchJson: (url, token, requestSignal) => this.fetchMapillaryJson(url, token, requestSignal),
      getSelectedImageId: () => this.state.imageId,
      isStorageDisabled: () => this._sequenceStorageDisabled,
      disableStorage: () => { this._sequenceStorageDisabled = true; },
    }, sequenceId, accessToken, signal, onProgress);
  }

  /** Provisional tile geometry: no network requests and no image-marker allocation. */
  private async showCachedSequencePreview(sequenceId: string, requestId: number, signal: AbortSignal) {
    const view = this.state.jimuMapView?.view;
    if (!view) return;
    const current = () => !signal.aborted && requestId === this._selectionRequestId && this.state.jimuMapView?.view === view && this.state.sequenceRouteLoading;
    const paths: number[][][] = [];
    let vertices = 0;
    try {
      for (const [key, buffer] of this._turboTileCache.snapshot().reverse()) {
        if (!current()) return;
        if (!buffer.byteLength) continue;
        const [z, x, y] = key.split("/").map(Number), n = 2 ** z;
        const layer = new VectorTile(new Pbf(new Uint8Array(buffer))).layers.sequence;
        if (!layer) continue;
        for (let i = 0; i < layer.length; i++) {
          if (i % 100 === 0) { await new Promise(resolve => setTimeout(resolve, 0)); if (!current()) return; }
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
      this.ensureActiveSequenceLayer(view).add(new this.ArcGISModules.Graphic({
        geometry: { type: "polyline", paths, spatialReference: { wkid: 4326 } },
        symbol: { type: "simple-line", color: [0, 0, 255, 0.65], width: 3 },
        attributes: { sequenceId, sequence_preview: true },
      }));
    } catch { /* Preview is optional; the complete API route remains authoritative. */ }
  }

  private async retrySelectedImage() {
    const target = this._selectionRetry;
    if (target) await this.loadSequenceById(target.sequenceId, target.imageId);
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
   * (keeps polylines/text), and clears the pulsing point.
   */
  private clearActiveSequenceGraphics(sequenceId: string) {
    this.clearActiveSequenceLayer();
    const { jimuMapView, availableSequences } = this.state;
    if (!jimuMapView) return;
    const { view } = jimuMapView;

    // Remove cones & blue active sequence markers
    const toRemove: __esri.Graphic[] = [];
    view.graphics.forEach((g) => {
      if ((g as any).__isCone) {
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
        view.graphics.add(pointGraphic);
      });
    }

    // Clear pulsing green point
    this.clearGreenPulse();
    this.clearConeGraphics();
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
   * - Clears all map graphics
   * - Resets relevant widget state
   */
  private clearSequenceCache = () => {
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

      // Remove red clicked location marker
      if (this.clickedLocationGraphic && this.state.jimuMapView) {
        this.state.jimuMapView.view.graphics.remove(this.clickedLocationGraphic);
        this.clickedLocationGraphic = null;
      }

      // Clear all map graphics
      if (this.state.jimuMapView) {
        this.state.jimuMapView.view.graphics.removeAll();
      }

      // Destroy the Mapillary viewer completely
      if (this.mapillaryViewer) {
        try {
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
      });
    } catch (err) {
      console.warn("Failed to clear sequence cache", err);
    }
  };

  // Local caching of last sequence
  // Stores minimal sequence info (IDs + coords) in localStorage
  // to reload previous sequence instantly on widget startup.
  private saveSequenceCache(sequenceId: string, sequenceImages: { id: string; lat: number; lon: number }[]) {
    if (this._sequenceStorageDisabled) return;
    try {
      const payload = JSON.stringify({ sequenceId, sequenceImages: sequenceImages.map(({ id, lat, lon }) => ({ id, lat, lon })) });
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

  // Clean up everything when widget closes or reloads
  // Stops animation intervals, removes all map graphics,
  // destroys Mapillary viewer instance, clears DOM container,
  // and resets internal state if requested.
  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {
    if (fullRemove) {
      this._sequenceRequests?.dispose(); this.clearSharedNotesView(); this.clearFieldNotesGroup(); }
    if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
    this._routingLoginExpiry = null; this._routingLoginView = null;
    this._pointCloudAbort?.abort(); ++this._pointCloudRequest;
    if (this._pointCloudAutoTimer) clearTimeout(this._pointCloudAutoTimer);
    this._pointCloudAutoTimer = null;
    if (fullRemove) { this.clearPointCloud(true); this._pointCloudCache.clear(); }
    this.cancelCoverageAnalysis();
    this.stopCoverageRendering();
    this.clearMapLegendLayer();
    this.clearSolarGraphics();
    this._selectionRequestId++; this._selectionAbort?.abort(); this._selectionAbort = null;
    this._lastSuccessfulSelection = null; this._selectionRetry = null;
    this.clearActiveSequenceLayer();
    if (this._objectPopupView?.popup?.content === this._objectPopupContent) this._objectPopupView.closePopup();
    this._objectPopupContent = null; this._objectPopupView = null;
    this._mapFeatureExportAbort?.abort();
    this.clearDetectionOverlays();
    this._alternateNavigationAbort?.abort(); this._objectDetailsAbort?.abort(); ++this._objectDetailsRequest; ++this._alternateNavigationRequest; this._objectDetailsCache.clear();
    this._mapFeatureClickAbort?.abort(); this._mapFeatureTiles.clear(); this._mapFeatureIndexes.clear(); this._selectedMapFeature = null;
    this.finishTurboLoading();
    this.clearClickRipples();
    this.clearGreenPulse();

    if (this._coneRedrawRaf != null) {
      cancelAnimationFrame(this._coneRedrawRaf);
      this._coneRedrawRaf = null;
    }

    this._nearbyDiscovery?.cancelTimer();
    this.stopSafePlayback();
    this._nearbyDiscovery?.cancelRequest();

    this._sequenceHoverHighlight?.detach(this.state.jimuMapView?.view);

    // Clean up zoom watcher and cancel any pending zoom URL update
    if (this.zoomDisplayHandle) {
      this.zoomDisplayHandle.remove();
      this.zoomDisplayHandle = null;
    }
    this._debouncedZoomUrlUpdate.cancel?.();

    // Clean up direction hover graphic
    this.clearDirectionHighlight();
    this.clearTurboHover();
    this.clearElevationProfile();

    // Unsubscribe from direction hover events
    if (this._directionUnsubscribe) {
      this._directionUnsubscribe();
      this._directionUnsubscribe = null;
    }

    if (this._sightViewModel) {
      this._sightViewModel.clear();
      this._sightViewModel = null;
    }

    if (this._viewshedAnalysis) {
      this.clearViewshed();
    }

    //  graphics cleanup
    if (fullRemove && this.state.jimuMapView?.view?.graphics) {
      const { view } = this.state.jimuMapView;
      view.graphics.removeAll();
    }

    if (fullRemove) {
      this._turboMapLeaveCleanup?.();
      this._turboMapLeaveCleanup = null;
      this.disableTurboCoverageLayer();
      // listener removals
      if (this.mapClickHandle) {
        this.mapClickHandle.remove();
        this.mapClickHandle = null;
      }
      if (this.pointerMoveHandle) {
        this.pointerMoveHandle.remove();
        this.pointerMoveHandle = null;
      }

      this._cancelObjectsFetch = true;
      this._cancelTrafficSignsFetch = true;

      // watcher removals
      if (this.trafficSignsStationaryHandle) {
        this.trafficSignsStationaryHandle.remove();
        this.trafficSignsStationaryHandle = null;
      }
      if (this.trafficSignsZoomHandle) {
        this.trafficSignsZoomHandle.remove();
        this.trafficSignsZoomHandle = null;
      }
      if (this.objectsStationaryHandle) {
        this.objectsStationaryHandle.remove();
        this.objectsStationaryHandle = null;
      }
      if (this.objectsZoomHandle) {
        this.objectsZoomHandle.remove();
        this.objectsZoomHandle = null;
      }
      if (this.turboStationaryHandle) {
        this.turboStationaryHandle.remove();
        this.turboStationaryHandle = null;
      }
      if (this.turboZoomHandle) {
        this.turboZoomHandle.remove();
        this.turboZoomHandle = null;
      }

      this.setState({
        trafficSignsActive: false,
        objectsActive: false,
        tilesActive: false,
      });
    }

    if (this.state.jimuMapView?.view?.map && fullRemove) {
      const { view } = this.state.jimuMapView;

      // ROBUST REMOVAL BY ID
      const layersToRemoveById = [
        LAYER_IDS.COVERAGE_VT, // General Tiles
        LAYER_IDS.TRAFFIC_SIGNS_VT, // Traffic Signs Coverage
        LAYER_IDS.TRAFFIC_SIGNS_FL, // Traffic Signs Popup Points
        LAYER_IDS.OBJECTS_VT, // Objects Coverage
        LAYER_IDS.OBJECTS_FL, // Objects Popup Points
        LAYER_IDS.TURBO_COVERAGE,
      TURBO_LIMITS.closeLayerId, // Turbo Points
      ];

      layersToRemoveById.forEach((id) => {
        const layer = view.map.findLayerById(id);
        if (layer) {
          view.map.remove(layer);
          this.log(`Removed layer by ID: ${id}`);
        }
      });

      // Nullify References
      this.mapillaryVTLayer = null;
      this.mapillaryTrafficSignsLayer = null;
      this.mapillaryTrafficSignsFeatureLayer = null;
      this.mapillaryObjectsLayer = null;
      this.mapillaryObjectsFeatureLayer = null;
      this.turboCoverageLayer = null;
      this.turboCoverageLayerView = null;

      // Fallback sweep (optional, but good for safety)
      view.map.layers.forEach((layer) => {
        if (layer.type === "feature" && (layer as any).fields?.some((f: any) => f.name === "value") && (layer as any).fields?.some((f: any) => f.name === "name")) {
          view.map.remove(layer);
        }
      });

      this.setState({ turboModeActive: false });
    }

    // viewer destruction and rest of the method
    if (this.mapillaryViewer) {
      try {
        this.mapillaryViewer.remove();
      } catch (err) {}
      this.mapillaryViewer = null;
    }
    if (this.viewerContainer.current) {
      this.viewerContainer.current.innerHTML = "";
    }

    if (resetState) {
      // state reset logic
      this.setState({
        imageId: null,
        sequenceId: null,
        sequenceImages: [],
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
        turboFilterStartDate: "",
        turboFilterEndDate: "",
        turboFilterIsPano: undefined,
        turboFilterOnFoot: undefined,
        showTurboFilterBox: false,
      });
    }
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

    // 3. Restore Active Sequence (Blue line & dots)
    if (selectedSequenceId && sequenceImages && sequenceImages.length > 0) {
      const { Graphic } = this.ArcGISModules;

      // Blue Polyline
      if (sequenceImages.length > 1) {
        const paths = sequenceImages.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });
        const polylineGraphic = new Graphic({
          geometry: { type: "polyline", paths: [paths], spatialReference: { wkid: 4326 } },
          symbol: { type: "simple-line", color: [0, 0, 255, 0.8], width: 3 },
          attributes: { sequenceId: selectedSequenceId },
        });
        (polylineGraphic as any).__isSequenceOverlay = true;
        view.graphics.add(polylineGraphic);
      }

      // Blue Dots
      sequenceImages.forEach((img) => {
        if (img.id !== imageId) {
          const position = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat);
          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], selectedSequenceId, img.id);
        }
      });
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

        if (this.mapillaryViewer) {
          this.mapillaryViewer
            .getBearing()
            .then((b: number) => {
              if (typeof b === "number") this._lastBearing = b;
              this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing, length, spread);
            })
            .catch(() => {
              this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);
            });
        } else {
          this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);
        }
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
  /*
   * Initializes the minimap view within the fullscreen portal.
   * It replicates the main map's basemap and specific Vector Tile layers (safely re-creating them to avoid cloning errors),
   * and binds click events to allow users to jump to different frames within the sequence.
   */
  private async createMinimap() {
    if (!this.minimapContainer.current || !this.state.jimuMapView || !this.ArcGISModules) return;

    this.destroyMinimap();

    try {
      // 1. Load 'esri/Basemap' in addition to others
      const [MapView, Map, GraphicsLayer, Basemap] = await loadArcGISJSAPIModules(["esri/views/MapView", "esri/Map", "esri/layers/GraphicsLayer", "esri/Basemap"]);

      const { VectorTileLayer } = this.ArcGISModules;

      this.minimapGraphicsLayer = new GraphicsLayer({
        id: LAYER_IDS.MINIMAP_TRACKING, title: "Mapillary Minimap",
      });

      // 2. Advanced Basemap Duplication Strategy
      let basemapConfig: any = "topo-vector"; // Fallback

      try {
        const mainBasemap = this.state.jimuMapView.view.map.basemap;
        if (mainBasemap) {
          const standardIds = [
            "satellite",
            "hybrid",
            "oceans",
            "osm",
            "terrain",
            "dark-gray",
            "dark-gray-vector",
            "gray",
            "gray-vector",
            "streets",
            "streets-vector",
            "streets-night-vector",
            "streets-relief-vector",
            "streets-navigation-vector",
            "topo",
            "topo-vector",
          ];

          if (mainBasemap.id && standardIds.includes(mainBasemap.id)) {
            // A. Simple String ID (Fastest)
            basemapConfig = mainBasemap.id;
          } else {
            // B. Custom Basemap: JSON Serialization (Safe Deep Copy)
            // Using .clone() shares resources and breaks the main map on destroy.
            // Using .toJSON() -> .fromJSON() forces a completely new, independent instance.
            try {
              const basemapJson = mainBasemap.toJSON();
              // Rehydrate a new Basemap instance from the JSON definition
              basemapConfig = Basemap.fromJSON(basemapJson);
            } catch (jsonErr) {
              console.warn("Failed to serialize custom basemap via JSON, falling back to clone (risky) or default.", jsonErr);
              // Last resort fallback if JSON fails
              basemapConfig = mainBasemap.clone();
            }
          }
        }
      } catch (err) {
        console.warn("Could not determine basemap, using default");
      }

      // Create minimap map instance
      const minimap = new Map({
        basemap: basemapConfig,
        layers: [this.minimapGraphicsLayer],
      });

      // Determine initial center
      let initialCenter = this.state.jimuMapView.view.center;
      if (this.state.imageId && this.state.sequenceImages.length > 0) {
        const currentImg = this.state.sequenceImages.find((img) => img.id === this.state.imageId);
        if (currentImg) {
          initialCenter = [currentImg.lon, currentImg.lat] as any;
        }
      }

      this.minimapView = new MapView({
        container: this.minimapContainer.current,
        map: minimap,
        center: initialCenter,
        zoom: this.state.imageId ? 15 : Math.max(3, this.state.jimuMapView.view.zoom - ZOOM.MINIMAP_OFFSET),
        ui: { components: [] },
        constraints: { rotationEnabled: true, snapToZoom: true, minZoom: 0, maxZoom: 20 },
        navigation: { mouseWheelZoomEnabled: true, browserTouchPanEnabled: true },
      });

      await this.minimapView.when();

      // Safe Layer Transfer
      const layersToAdd: __esri.Layer[] = [];
      const mainLayers = this.state.jimuMapView.view.map.layers;
      const isLayerActive = (layer: any) => layer && mainLayers.includes(layer);

      // A. Mapillary VT
      if (isLayerActive(this.mapillaryVTLayer)) {
        try {
          const styleCopy = JSON.parse(JSON.stringify(this.mapillaryVTLayer.style));
          layersToAdd.push(new VectorTileLayer({ style: styleCopy, opacity: 0.6 }));
        } catch (e) {}
      }
      // B. Traffic Signs
      if (isLayerActive(this.mapillaryTrafficSignsLayer)) {
        try {
          const styleCopy = JSON.parse(JSON.stringify(this.mapillaryTrafficSignsLayer.style));
          layersToAdd.push(new VectorTileLayer({ style: styleCopy, opacity: 0.6 }));
        } catch (e) {}
      }
      // C. Objects
      if (isLayerActive(this.mapillaryObjectsLayer)) {
        try {
          const styleCopy = JSON.parse(JSON.stringify(this.mapillaryObjectsLayer.style));
          layersToAdd.push(new VectorTileLayer({ style: styleCopy, opacity: 0.6 }));
        } catch (e) {}
      }

      // D. Mapillary coverage VectorTileLayer for minimap
      // Always shows image circles at full opacity regardless of hideCoverageCircles config,
      // so the minimap always has useful point context.
      try {
        const vectorTileSourceUrl = `${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`;
        const minimapCoverageStyle = {
          version: 8,
          sources: {
            [STYLE_SOURCE_IDS.MAPILLARY]: {
              type: "vector",
              tiles: [vectorTileSourceUrl],
              minzoom: 0,
              maxzoom: 14,
            },
          },
          layers: [
            {
              id: STYLE_LAYER_IDS.SEQUENCE,
              source: STYLE_SOURCE_IDS.MAPILLARY,
              "source-layer": STYLE_LAYER_IDS.SEQUENCE,
              type: "line",
              paint: {
                "line-opacity": 0.6,
                "line-color": "#35AF6D",
                "line-width": 1.5,
              },
            },
            {
              id: STYLE_LAYER_IDS.IMAGE,
              source: STYLE_SOURCE_IDS.MAPILLARY,
              "source-layer": STYLE_LAYER_IDS.IMAGE,
              type: "circle",
              paint: {
                "circle-radius": 2,
                "circle-color": "#35AF6D",
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1,
                "circle-opacity": 1,
                "circle-stroke-opacity": 1,
              },
            },
          ],
        };
        const minimapCoverageLayer = new VectorTileLayer({
          style: minimapCoverageStyle,
          opacity: 0.8,
        });
        layersToAdd.push(minimapCoverageLayer);
      } catch (e) {
        console.warn("Could not add coverage layer to minimap:", e);
      }

      minimap.addMany(layersToAdd);

      // Re-add graphics layer on top so cone, green dot and hover markers
      // always render above turbo coverage points and VT layers
      minimap.remove(this.minimapGraphicsLayer);
      minimap.add(this.minimapGraphicsLayer);

      this.updateMinimapTracking();

      this.minimapView.on("click", async (evt) => {
        const clickPoint = evt.mapPoint;
        const clickLon = clickPoint.longitude;
        const clickLat = clickPoint.latitude;

        // 1. Check if the click is near a point in the CURRENT sequence (proximity jump)
        if (this.state.sequenceImages?.length > 0 && this.state.sequenceId) {
          let closestImg: { id: string; lat: number; lon: number; captured_at?: number } | null = null;
          let minDist = Infinity;
          this.state.sequenceImages.forEach((img) => {
            const dist = distanceMeters(img.lat, img.lon, clickLat, clickLon);
            if (dist < minDist) {
              minDist = dist;
              closestImg = img;
            }
          });
          // If within 5m of a sequence point, jump within the current sequence
          if (closestImg && minDist < 5 && closestImg.id !== this.state.imageId) {
            await this.loadSequenceById(this.state.sequenceId!, closestImg.id);
            return;
          }
        }

        // 2. Click is elsewhere, search for nearby sequences at that location.
        //    We intentionally do NOT set availableSequences or call drawSequencesOverlay
        //    so the main map is not polluted with colored multi-sequence overlays.
        //    We just find the closest image and load it directly.
        this.setState({ isLoading: true });
        try {
          const nearbySeqs = await this.getSequencesInBBox(clickLon, clickLat, this.accessToken);
          if (!nearbySeqs.length) {
            this.showNoImageMessage();
            this.setState({ isLoading: false });
            return;
          }

          // Fetch full coords for each nearby sequence
          const fullSeqs = await Promise.all(
            nearbySeqs.map(async (seq) => {
              const allImages = await this.getSequenceWithCoords(seq.sequenceId, this.accessToken);
              return { ...seq, images: allImages };
            }),
          );

          // Find the image closest to the click across all returned sequences
          let globalClosest: { seqId: string; imgId: string; dist: number } | null = null;
          fullSeqs.forEach((seq) => {
            seq.images.forEach((img) => {
              const dist = distanceMeters(img.lat, img.lon, clickLat, clickLon);
              if (!globalClosest || dist < globalClosest.dist) {
                globalClosest = { seqId: seq.sequenceId, imgId: img.id, dist };
              }
            });
          });

          if (!globalClosest) {
            this.showNoImageMessage();
            this.setState({ isLoading: false });
            return;
          }

          // Load the sequence, this updates sequenceImages/imageId/selectedSequenceId
          // but leaves availableSequences untouched so no colored overlay appears.
          // When the user exits fullscreen they'll see just the single blue sequence line.
          await this.loadSequenceById(globalClosest.seqId, globalClosest.imgId, { lon: clickLon, lat: clickLat });
          this.setState({ isLoading: false, availableSequences: [], clickLon, clickLat });
        } catch (err) {
          console.error("Minimap click error:", err);
          this.setState({ isLoading: false });
        }
      });

      this.setState({ minimapView: this.minimapView });
    } catch (err) {
      console.error("Error creating minimap:", err);
      this.destroyMinimap();
    }
  }

  /*
   * Fully disposes of the minimap view, map instance, and associated graphics layers.
   * This ensures WebGL contexts are released and prevents memory leaks when the user exits fullscreen mode.
   */
  private destroyMinimap() {
    this.log("Destroying minimap...");

    // Remove watch handle first
    if (this.minimapWatchHandle) {
      try {
        this.minimapWatchHandle.remove();
      } catch (err) {}
      this.minimapWatchHandle = null;
    }

    // Clear graphics layer contents but don't destroy yet,
    // destroying before the view is gone causes ArcGIS to access
    // deallocated animation state and throw "Cannot read properties of undefined (reading 'animation')"
    if (this.minimapGraphicsLayer) {
      try {
        this.minimapGraphicsLayer.removeAll();
      } catch (err) {}
    }

    // Destroy the view first (nulls this.minimapView immediately so updateMinimapTracking
    // won't fire goTo on a half-destroyed view during async Mapillary image events)
    if (this.minimapView) {
      const viewToDestroy = this.minimapView;
      this.minimapView = null; // null BEFORE destroy so any in-flight callbacks bail out

      try {
        (viewToDestroy as any).container = null;
      } catch (err) {}

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
      } catch (err) {}
      this.minimapGraphicsLayer = null;
    }

    // Clear the container HTML
    if (this.minimapContainer.current) {
      this.minimapContainer.current.innerHTML = "";
    }

    this.setState({ minimapView: null });
    this.log("Minimap destroyed");
  }

  /*
   * Synchronizes the minimap with the active Mapillary image.
   * It centers the view on the current coordinates and redraws tracking graphics:
   * a pulsing location dot, a camera direction cone, and the sequence polyline.
   */
  private updateMinimapTracking() {
    // Guard: view must exist AND not have been destroyed.
    // After destroyMinimap() sets container=null, the view object lingers briefly
    // before this.minimapView is nulled, check destroyed flag to close that window.
    if (!this.minimapGraphicsLayer || !this.state.imageId || !this.ArcGISModules || !this.minimapView) return;
    if ((this.minimapView as any).destroyed) return;

    const currentImg = this.state.sequenceImages.find((img) => img.id === this.state.imageId);
    if (!currentImg) return;

    const { Graphic } = this.ArcGISModules;

    // Clearing previous tracking graphics
    try {
      this.minimapGraphicsLayer.removeAll();
    } catch {
      return;
    }

    // Center the minimap on the current frame.
    // goTo() returns a Promise; use .catch() not try/catch so the
    // async rejection ("Cannot read properties of undefined: animation")
    // is silently swallowed when the view is destroyed mid-flight.
    if (this.minimapView && !(this.minimapView as any).destroyed) {
      this.minimapView
        .goTo(
          {
            center: [currentImg.lon, currentImg.lat],
            zoom: Math.max(14, Math.min(18, this.minimapView.zoom || 15)),
          },
          { animate: false },
        )
        .catch(() => {
          /* view destroyed mid-flight, ignore */
        });
    }

    // Re-check view is still alive before adding graphics
    if (!this.minimapGraphicsLayer || !this.minimapView || (this.minimapView as any).destroyed) return;

    // Adding pulsing tracking dot
    const trackingDot = new Graphic({
      geometry: {
        type: "point",
        longitude: currentImg.lon,
        latitude: currentImg.lat,
        spatialReference: { wkid: 4326 },
      },
      symbol: {
        type: "simple-marker",
        color: "#00ff00",
        size: 10,
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
      },
    });

    try {
      this.minimapGraphicsLayer.add(trackingDot);
    } catch {
      return;
    }

    // Adding direction cone on minimap
    if (this._lastBearing !== undefined && this.minimapGraphicsLayer && !(this.minimapView as any)?.destroyed) {
      try {
        const coneMini = new Graphic({
          geometry: createConeGeometry(currentImg.lon, currentImg.lat, this._lastBearing, 30, 60),
          symbol: {
            type: "simple-fill",
            color: [255, 165, 0, 0.6],
            outline: {
              color: [255, 165, 0, 1],
              width: 1,
            },
          },
        });
        this.minimapGraphicsLayer.add(coneMini);
      } catch {
        return;
      }
    }

    // Optionally, adding the sequence polyline
    if (this.state.sequenceImages.length > 1 && this.minimapGraphicsLayer && !(this.minimapView as any)?.destroyed) {
      try {
        const paths = this.state.sequenceImages.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });
        const sequenceLine = new Graphic({
          geometry: {
            type: "polyline",
            paths: [paths],
            spatialReference: { wkid: 4326 },
          },
          symbol: {
            type: "simple-line",
            color: [0, 0, 255, 0.8],
            width: 2,
          },
        });
        this.minimapGraphicsLayer.add(sequenceLine);
      } catch {
        return;
      }
    }
  }
  // #endregion MINIMAP

  // #region FULLSCREEN & RESIZE
  // Manages toggling fullscreen mode and keeping the Mapillary viewer
  // correctly sized when the container or window dimensions change.
  // Toggle between embedded and fullscreen modes
  // Destroys/recreates Mapillary viewer in the appropriate container
  // because Mapillary viewer must rebind its WebGL canvas context.
  private toggleFullscreen = async () => {
    const goingFullscreen = !this.state.isFullscreen;
    if (goingFullscreen) {
      this._pointCloudAbort?.abort(); ++this._pointCloudRequest;
      this._pointCloudQueueVersion = (this._pointCloudQueueVersion || 0) + 1;
      if (this._pointCloudAutoTimer) clearTimeout(this._pointCloudAutoTimer);
      this._pointCloudAutoTimer = null;
      this.setState({ pointCloudLoading: false, minimapExpanded: false });
    }

    // Store the current state
    let currentBearing = this._lastBearing || 0;
    let currentImageId = this.state.imageId;
    let currentImageCoords: { lon: number; lat: number } | null = null;

    if (currentImageId) {
      const img = this.state.sequenceImages.find((s) => s.id === currentImageId);
      if (img) {
        currentImageCoords = { lon: img.lon, lat: img.lat };
      }
    }

    // Clear graphics before state change
    this.clearGreenPulse();
    this.clearConeGraphics();

    // Destroy minimap when exiting fullscreen
    if (!goingFullscreen && this.minimapView) {
      this.destroyMinimap();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Destroy current viewer
    if (this.mapillaryViewer) {
      try {
        await this.mapillaryViewer
          .getBearing()
          .then((b: number) => {
            if (typeof b === "number") {
              currentBearing = b;
              this._lastBearing = b;
            }
          })
          .catch(() => {});

        this.mapillaryViewer.remove();
        // Wait for WebGL context to be released
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        // Ignore "Request aborted" errors which are expected during cleanup
        const errorMsg = err instanceof Error ? err.message : String(err);
        const errorName = (err as any).name;

        if (errorName !== "CancelMapillaryError" && !errorMsg.includes("aborted")) {
          console.warn("Error removing viewer:", err);
        }
      }
      this.mapillaryViewer = null;
    }

    this.setState({ isFullscreen: goingFullscreen }, async () => {
      // Small delay to ensure state is settled
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (this.viewerContainer.current && currentImageId) {
        this._isInitialImageLoad = true;
        // Create new viewer
        this.mapillaryViewer = new Viewer({
          container: this.viewerContainer.current,
          accessToken: this.accessToken,
          imageId: currentImageId,
          renderMode: this.props.config.renderMode ?? 1, // Default to Fill
          transitionMode: this.props.config.transitionMode ?? 0, // Default to Smooth
          component: {
            zoom: true,
            direction: true,
            cover: false,
            marker: true,
          },
        });

        // Restore bearing
        this._lastBearing = currentBearing;

        // Redraw graphics
        if (currentImageCoords) {
          this.currentGreenGraphic = this.drawPulsingPoint(currentImageCoords.lon, currentImageCoords.lat, [0, 255, 0, 1]);

          const length = this.coneLengths[this.zoomStepIndex];
          const spread = this.coneSpreads[this.zoomStepIndex];
          this.drawCone(currentImageCoords.lon, currentImageCoords.lat, currentBearing, length, spread);
        }

        this.applyCustomCameraAngle();
        // Bind events
        this.bindMapillaryEvents();

        if (this.state.pointCloudVisible && this._currentPointCloudResult) {
          this.addViewerPointCloudRenderer({ ...this._currentPointCloudResult, points: this._filteredPointCloudPoints }, currentImageId);
        }
        if (this.state.isMeasureMode) {
          this.updateViewerMeasurementRenderer();
        }

        // Re-attach the Sun renderer for the fullscreen viewer
        if (this.state.isSolarMode) {
          this._solarViewer?.resetRegistration(); // Reset the flag
          this.updateSolarGraphics();
        }

        // Create minimap only in fullscreen
        if (this.state.isFullscreen) {
          setTimeout(() => {
            this.createMinimap();
          }, 300);
        }

        // Center map on current frame when exiting fullscreen
        if (!this.state.isFullscreen && this.state.jimuMapView?.view && currentImageCoords) {
          const view = this.state.jimuMapView.view;

          // Wait a bit for the view to stabilize
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Center the map on the current active frame location
          await view.goTo(
            {
              center: [currentImageCoords.lon, currentImageCoords.lat],
              zoom: view.zoom, // Keep the current zoom level
            },
            {
              animate: true,
              duration: 1000, // Smooth 1-second animation
            },
          );

          this.log("Centered map on active frame:", currentImageCoords);
        }
      }
    });
  };

  /**
   * Handles fullscreen mode changes by resizing the Mapillary viewer.
   * Ensures viewer adapts to fullscreen dimensions.
   */
  private handleFullscreenChange = () => {
    // When fullscreen mode changes, resize the Mapillary viewer
    if (this.mapillaryViewer?.resize) {
      try {
        this.mapillaryViewer.resize();
      } catch (e) {
        console.warn("Viewer resize suppressed during fullscreen toggle");
      }
    }
  };

  /**
   * Handles window resize events by resizing the Mapillary viewer.
   * Ensures viewer adapts to window dimension changes.
   */
  private handleWindowResize = () => {
    if (this.mapillaryViewer?.resize) {
      try {
        this.mapillaryViewer.resize();
        this.applyCustomCameraAngle();
      } catch (e) {
        // Ignore resize errors if widget is hidden/destroyed
      }
    }
  };
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
    const request = ++this._detectionLoadRequest;
    const viewer = this.mapillaryViewer;

    try {
      const url = `${GRAPH_API.BASE}/${imageId}/detections?fields=id,value,geometry&access_token=${this.accessToken}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Detection request failed (${resp.status})`);
      const data = await resp.json();
      if (request !== this._detectionLoadRequest || this.mapillaryViewer !== viewer || !this.state.detectionsActive) return;
      const activeImage = await viewer.getImage();
      if (request !== this._detectionLoadRequest || String(activeImage.id) !== String(imageId)) return;

      const tagComponent = this.mapillaryViewer.getComponent("tag");
      if (!tagComponent || !data.data) return;

      // PREVENT MEMORY LEAKS: Clean up previous hover listeners and flash intervals
      if ((tagComponent as any)._detectionHoverCleanup) {
        (tagComponent as any)._detectionHoverCleanup();
        delete (tagComponent as any)._detectionHoverCleanup;
      }

      tagComponent.removeAll();

      const tags: OutlineTag[] = [];

      data.data.forEach((det: any) => {
        if (!det.geometry) return;

        const labelFull = det.value
          .split("--")
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "))
          .join(" ");

        const labelRaw = det.value.split("--").pop();

        // HIDE such as UNLABELED
        const labelLower = labelFull.toLowerCase();
        if (DETECTION_HIDDEN_RAW.includes(labelRaw ?? "") || DETECTION_HIDDEN_CATEGORIES.some((cat) => labelLower.includes(cat))) return;

        this.detectionTagMap.set(det.id, det.value);

        const points = decodeAndNormalizeGeometry(det.geometry);

        if (points.length >= 3) {
          try {
            const geometry = new PolygonGeometry(points);
            const color = getDetectionColor(det.value);

            // Is this the specific object the user clicked in the alternate panel?
            const isTarget = String(det.id) === String(this.state.targetDetectionId);
            const bounds = isTarget ? detectionThumbnailBounds(points) : undefined;
            if (bounds) void this.focusSelectedDetection(imageId, bounds);

            const tag = new OutlineTag(det.id, geometry, {
              text: this.state.showAiTags ? labelFull : "",
              textColor: isTarget ? 0xffff00 : 0xffffff,
              lineColor: isTarget ? 0xffff00 : color,
              lineWidth: isTarget ? 4 : 2,
              fillColor: color,
              fillOpacity: isTarget ? 0.0 : 0.3, // Empty (transparent) fill for target
            });
            tags.push(tag);
          } catch (err) {
            console.warn("Could not create tag for detection", det.id, err);
          }
        }
      });

      if (tags.length > 0) {
        tagComponent.add(tags);
        this.log(`Successfully rendered ${tags.length} AI objects.`);

        // hover listeners after tags are added
        this.setupDetectionHover(tagComponent, tags);
      }
    } catch (err) {
      console.error("Failed to load image detections:", err);
    }
  }

  /**
   * Sets up hover interactions for AI detection tags.
   * Shows label text only when the user hovers over a detection polygon.
   */
  private setupDetectionHover(tagComponent: any, tags: OutlineTag[]) {
    if (!this.viewerContainer.current) return;

    const container = this.viewerContainer.current;

    // Store original tag configurations
    const tagConfigs = new Map<string, { text: string; color: number }>();
    tags.forEach((tag) => {
      const detectionValue = this.getDetectionValueFromTagId(tag.id);
      const labelFull = detectionValue
        .split("--")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "))
        .join(" ");
      const color = getDetectionColor(detectionValue);

      tagConfigs.set(tag.id, { text: labelFull, color });
    });

    let currentHoveredId: string | null = null;
    let updateTimeout: any = null;

    // Flashing State Variables
    let flashState = true;
    let flashInterval: any = null;

    const updateTags = (hoveredId: string | null, isFlashUpdate: boolean = false) => {
      // Only skip update if nothing changed and it wasn't triggered by the flash interval
      if (currentHoveredId === hoveredId && !isFlashUpdate) return;
      currentHoveredId = hoveredId;

      tagComponent.removeAll();

      const updatedTags: OutlineTag[] = [];
      tags.forEach((tag) => {
        const config = tagConfigs.get(tag.id);
        if (!config) return;

        const isHovered = tag.id === hoveredId;
        const isTarget = tag.id === this.state.targetDetectionId;

        const shouldShowText = this.state.showAiTags && (isHovered || isTarget);

        // Defaults
        let lineColor = config.color;
        let fillColor = config.color;
        let fillOpacity = 0.3;
        let lineWidth = 2;

        // 1. Target Priority (Flashing Empty Box)
        if (isTarget) {
          lineColor = flashState ? 0xffff00 : 0xff3333; // Flash Yellow <-> Bright Red
          fillOpacity = 0.0; // Completely empty inside
          lineWidth = 4; // Thick border to show vertices clearly
        }
        // 2. Hover State (More solid fill)
        else if (isHovered) {
          fillOpacity = 0.6;
          lineWidth = 3;
        }

        try {
          const geometry = new PolygonGeometry((tag.geometry as PolygonGeometry).polygon);
          const newTag = new OutlineTag(tag.id, geometry, {
            text: shouldShowText ? config.text : "",
            textColor: isTarget ? 0xffff00 : 0xffffff,
            lineColor: lineColor,
            lineWidth: lineWidth,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
          });
          updatedTags.push(newTag);
        } catch (err) {
          console.warn("Error updating tag", tag.id, err);
        }
      });

      if (updatedTags.length > 0) {
        tagComponent.add(updatedTags);
      }
    };

    (tagComponent as any)._refreshDetectionLabels = () => updateTags(currentHoveredId, true);

    // If a target exists, start the flashing animation loop
    if (this.state.targetDetectionId) {
      flashInterval = setInterval(() => {
        flashState = !flashState; // Toggle flash color
        updateTags(currentHoveredId, true); // Force update tags
      }, 500); // Flashes every half second
    }

    // Mouse move handler
    const handleMouseMove = async (event: MouseEvent) => {
      if (!this.mapillaryViewer) return;

      try {
        const canvas = container.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const pixelPoint = [event.clientX - rect.left, event.clientY - rect.top];

        const tagIds = await tagComponent.getTagIdsAt(pixelPoint);
        const hoveredTagId = tagIds.length > 0 ? tagIds[0] : null;

        if (updateTimeout) clearTimeout(updateTimeout);

        updateTimeout = setTimeout(() => {
          updateTags(hoveredTagId, false);
        }, 50);
      } catch (err) {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => updateTags(null, false), 50);
      }
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTags(null, false);
    };

    // Attach listeners
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Store cleanup function
    (tagComponent as any)._detectionHoverCleanup = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      if (flashInterval) clearInterval(flashInterval); // Kill the flashing interval
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      delete (tagComponent as any)._refreshDetectionLabels;
      tagConfigs.clear();
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
    });
  };

  /**
   * Fetches a small set of alternate Mapillary images related to a detected feature.
   * The function queries the Mapillary Graph API for detections associated with the
   * provided feature ID, extracts image metadata (thumbnail URL, capture time, geometry),
   * removes duplicate images, and stores up to 3 alternate images in component state.
   * It also updates UI state to indicate loading progress and saves the selected
   * feature location for reference.
   * @param featureId - Mapillary feature identifier used to query detections.
   * @param featureLat - Latitude of the selected feature.
   * @param featureLon - Longitude of the selected feature.
   */
  private async fetchAlternateImages(featureId: string, featureLat: number, featureLon: number) {
    this._objectDetailsAbort?.abort();
    const controller = new AbortController();
    this._objectDetailsAbort = controller;
    const request = ++this._objectDetailsRequest;
    ++this._alternateNavigationRequest;
    this._pendingDetectionFocus = null;
    this._alternateNavigationAbort?.abort();
    const attrs = this._selectedMapFeature?.graphic?.attributes || {};
    const metadata = { id: String(featureId), name: attrs.name || attrs.value || "Selected object", firstSeen: attrs.first_seen_at, lastSeen: attrs.last_seen_at };
    const current = () => !controller.signal.aborted && request === this._objectDetailsRequest;
    const cached = this._objectDetailsCache.get(String(featureId));
    this.setState({ selectedFeatureMetadata: cached?.metadata || metadata, featureMetadataLoading: !cached,
      featureMetadataError: "", alternateImagesError: "", isFetchingAlternates: !cached,
      selectedFeatureLocation: { lat: featureLat, lon: featureLon }, alternateImages: cached?.images || [],
      nearbyStripOpen: true, imageTrayTab: "object", fieldNotesListOpen: false }, () => this.showSelectedObjectPopup());
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
          if (current()) this.setState({ featureMetadataError: "Dates could not be loaded." });
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
                resolvedImages = resolvedImages.map(item => item.id === img.id ? { ...item,
                  detectionLabel: det?.value ? formatTrafficSignName(det.value) : item.detectionLabel,
                  detectionBounds: bounds || item.detectionBounds } : item);
                this.setState({ alternateImages: resolvedImages });
              } catch { /* Keep captures available even if their detection query fails. */ }
            }));
          }

        } catch (error) {
          if (current()) this.setState({ alternateImagesError: "Images could not be loaded. Try again." });
        } finally { if (current()) this.setState({ isFetchingAlternates: false }); }
      })(),
    ]);
    if (current() && metadataOK && imagesOK) this._objectDetailsCache.set(String(featureId), { metadata: resolvedMetadata, images: resolvedImages });
  }

  /*
   * Handles selecting an alternate image from the InfoBox panel.
   * When a user clicks a different image thumbnail, this function:
   * 1. Retrieves the sequence containing that image
   * 2. Loads the sequence on the map/viewer
   * 3. Rotates the Mapillary viewer toward the detected feature
   * 4. Moves the ArcGIS map camera to the image location
   * 5. Loads detections for the selected image
   */
  private _handleSelectAlternateImage = async (img: {
    id: string;
    detectionId: string;
    detectionBounds?: { x: number; y: number; width: number; height: number };
    thumbUrl: string;
    capturedAt: number;
    geometry: { type: "Point"; coordinates: [number, number] };
  }) => {
    this._alternateNavigationAbort?.abort();
    const navigation = new AbortController();
    this._alternateNavigationAbort = navigation;
    const request = ++this._alternateNavigationRequest;
    this._pendingDetectionFocus = { imageId: String(img.id), detectionId: String(img.detectionId), request };
    const featureLocation = this.state.selectedFeatureLocation;
    const current = () => !navigation.signal.aborted && request === this._alternateNavigationRequest;
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

              view.goTo(
                {
                  center: [img.geometry.coordinates[0], img.geometry.coordinates[1]],
                  heading: targetBearing,
                  tilt: 60,
                  scale: 500,
                },
                { animate: true, duration: 1500 },
              );
            } else {
              view.goTo(
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
      if (current()) this.setState({ alternateImagesError: "This image could not be opened. Try another capture or retry." });
      console.error(e);
    }
  };
  // #endregion AI DETECTIONS

  // #region FILTER LOADING
  // Preloads traffic sign and object dropdown options from sprite sheets.
  /**
   * Loads traffic sign filter options with icons from Mapillary sprite repository.
   * Sets up dropdown options and initializes filter state to DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS.
   */
  private async preloadTrafficSignOptions() {
    try {
      const spriteBaseUrl = SPRITE_URLS.TRAFFIC_SIGNS;

      const [jsonResp, img] = await Promise.all([fetch(`${spriteBaseUrl}.json`).then((r) => r.json()), loadImage(`${spriteBaseUrl}.png`)]);

      const codes = Object.keys(jsonResp);

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

          return { value: friendlyName, label: friendlyName, iconUrl };
        },
        (results) => {
          const allOption: FilterOption = { value: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, label: DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS, iconUrl: null };

          // Store full list
          const fullList = [allOption, ...results];
          this._fullTrafficSignsOptions = fullList;

          this.setState(
            {
              trafficSignsOptions: fullList,
              trafficSignsFilterValue: allOption,
            },
            () => this.checkFiltersLoaded(),
          );
        },
      );
    } catch (err) {
      console.warn("Failed to preload traffic sign options", err);
    }
  }

  /**
   * Loads object detection filter options with icons from Mapillary sprite repository.
   * Sets up dropdown options and initializes filter state to DEFAULT_FILTER_LABELS.OBJECTS.
   */
  private async preloadObjectOptions() {
    try {
      const spriteBaseUrl = SPRITE_URLS.OBJECTS;

      const [jsonResp, img] = await Promise.all([fetch(`${spriteBaseUrl}.json`).then((r) => r.json()), loadImage(`${spriteBaseUrl}.png`)]);

      const codes = Object.keys(jsonResp);

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

          return { value: friendlyName, label: friendlyName, iconUrl };
        },
        (results) => {
          const allOption: FilterOption = { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null };

          // Store full list
          const fullList = [allOption, ...results];
          this._fullObjectsOptions = fullList;

          this.setState(
            {
              objectsOptions: fullList,
              objectsFilterValue: allOption,
            },
            () => this.checkFiltersLoaded(),
          );
        },
      );
    } catch (err) {
      console.warn("Failed to preload object options", err);
    }
  }

  // Helper to set loaded flag
  private checkFiltersLoaded() {
    // Check if both drop-downs have been populated (length > 1 means data added to default "All" option)
    if (this.state.trafficSignsOptions.length > 1 && this.state.objectsOptions.length > 1) {
      // 1. Mark logic as ready (Triggers CSS fade-out via opacity)
      this.setState({ filtersLoaded: true });

      // 2. Wait for the fade-out animation to finish, then remove from DOM
      setTimeout(() => {
        this.setState({ showIntro: false });
      }, 800); // 800ms delay (matches CSS transition)
    }
  }

  /**
   * Filters the traffic signs VectorTileLayer so only icons matching `selectedValue` show.
   * Works at all zoom levels because VTL renders coverage regardless of FeatureLayer zoom threshold.
   * @param selectedValue trafficSignsOptions dropdown value ("all" or code)
   */
  private filterTrafficSignsVTLayer(selectedValue: string) {
    this._mapFeatureFilterCodes.set("signs", selectedValue || "");
    if (!this.mapillaryTrafficSignsLayer) return;

    const styleJson = this.mapillaryTrafficSignsLayer.style;
    const newStyle = JSON.parse(JSON.stringify(styleJson));

    const targetLayer = newStyle.layers.find((ly: any) => ly.id === STYLE_LAYER_IDS.TRAFFIC_SIGNS_ICONS);
    if (targetLayer) {
      if (!selectedValue || selectedValue === DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS) {
        delete targetLayer.filter;
      } else {
        // Ensure proper filter format
        targetLayer.filter = ["==", ["get", "value"], selectedValue];
      }
    }

    try {
      const { VectorTileLayer } = this.ArcGISModules;
      const filteredLayer = new VectorTileLayer({ style: newStyle });

      const { view } = this.state.jimuMapView;
      if (this.mapillaryTrafficSignsLayer && view.map.layers.includes(this.mapillaryTrafficSignsLayer)) {
        view.map.remove(this.mapillaryTrafficSignsLayer);
      }
      this.mapillaryTrafficSignsLayer = filteredLayer;
      view.map.add(this.mapillaryTrafficSignsLayer);
      void this.applyMapFeatureSpriteScale("signs");
    } catch (err) {
      console.error("Error applying traffic signs filter:", err);
    }
  }

  /**
   * Filters the objects/points VectorTileLayer so only icons matching `selectedValue` show.
   * Works at all zoom levels because VTL renders coverage regardless of FeatureLayer zoom threshold.
   * @param selectedValue objectOptions dropdown value ("all" or code)
   */
  private filterObjectsVTLayer(selectedValue?: string) {
    this._mapFeatureFilterCodes.set("objects", selectedValue || "");
    if (!this.mapillaryObjectsLayer) return;

    const styleJson = this.mapillaryObjectsLayer.style;
    const newStyle = JSON.parse(JSON.stringify(styleJson));
    const targetLayer = newStyle.layers.find((ly: any) => ly.id === STYLE_LAYER_IDS.OBJECTS_ICONS);

    if (targetLayer) {
      if (!selectedValue || selectedValue === DEFAULT_FILTER_LABELS.OBJECTS) {
        delete targetLayer.filter;
      } else {
        targetLayer.filter = ["==", ["get", "value"], selectedValue];
      }
    }

    try {
      const { VectorTileLayer } = this.ArcGISModules;
      const filteredLayer = new VectorTileLayer({ style: newStyle });

      const { view } = this.state.jimuMapView;
      if (this.mapillaryObjectsLayer && view.map.layers.includes(this.mapillaryObjectsLayer)) {
        view.map.remove(this.mapillaryObjectsLayer);
      }
      this.mapillaryObjectsLayer = filteredLayer;
      view.map.add(this.mapillaryObjectsLayer);
      void this.applyMapFeatureSpriteScale("objects");
    } catch (err) {
      console.error("Error applying objects filter:", err);
    }
  }
  // #endregion FILTER LOADING

  // #region COVERAGE LAYERS
  /*
        Initializes the Mapillary Vector Tile Layer
        * Creates a VectorTileLayer from the Mapillary tiles API
        * Uses an inline `minimalStyle` object for symbology (sequence = green line, image = light cyan blue circle)
        * Stores the layer in `this.mapillaryVTLayer` for later toggling
    */
  private initMapillaryLayer(
    filterCreatorId?: number,
    filterStartDate?: string,
    filterEndDate?: string,
    filterIsPano?: boolean | null,
    qualityViewActive?: boolean,
    qualityBandFilter?: "good" | "fair" | "poor" | "unscored" | null,
  ) {
    const { VectorTileLayer } = this.ArcGISModules;
    const vectorTileSourceUrl = `${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`;

    const { overviewFilter, sequenceFilter, imageFilter, hasPanoFilter } = buildAllFilters({
      creatorId: filterCreatorId,
      startDate: filterStartDate,
      endDate: filterEndDate,
      isPano: filterIsPano,
    });

    const layers: any[] = [];

    // Pano condition (classic filter syntax for ArcGIS VTL compatibility)
    let panoCondition: any = null;
    if (filterIsPano === true) {
      panoCondition = ["any", ["==", "is_pano", true], ["==", "is_pano", 1], ["==", "is_pano", "true"]];
    } else if (filterIsPano === false) {
      panoCondition = ["all", ["!=", "is_pano", true], ["!=", "is_pano", 1], ["!=", "is_pano", "true"]];
    }

    const applyPano = (baseFilter: any) => {
      if (!panoCondition) return baseFilter;
      if (!baseFilter) return panoCondition;
      return ["all", baseFilter, panoCondition];
    };

    const finalOverviewFilter = applyPano(overviewFilter);
    const finalSequenceFilter = applyPano(sequenceFilter);
    const finalImageFilter = applyPano(imageFilter);

    // OVERVIEW LAYER
    if (!hasPanoFilter) {
      layers.push({
        id: STYLE_LAYER_IDS.OVERVIEW,
        source: STYLE_SOURCE_IDS.MAPILLARY,
        "source-layer": "overview",
        type: "circle",
        ...(finalOverviewFilter ? { filter: finalOverviewFilter } : {}),
        paint: {
          "circle-radius": 1,
          "circle-color": "#35AF6D",
          "circle-stroke-color": "#35AF6D",
          "circle-stroke-width": 1,
        },
      });
    }

    // SEQUENCE + IMAGE LAYERS
    if (qualityViewActive) {
      // QUALITY VIEW: 4 colour-banded sequence layers
      // Uses pure CLASSIC syntax to prevent crashes when combined with is_pano
      const seqBand = (id: string, qualityConditions: any[], color: string, opacity = 0.85) => {
        const filter = finalSequenceFilter ? ["all", finalSequenceFilter, ...qualityConditions] : ["all", ...qualityConditions];

        return {
          id: id,
          source: STYLE_SOURCE_IDS.MAPILLARY,
          "source-layer": "sequence",
          type: "line",
          filter: filter,
          paint: {
            "line-opacity": opacity,
            "line-color": color,
            "line-width": 2.5,
          },
        };
      };

      const showBand = (band: "good" | "fair" | "poor" | "unscored") => !qualityBandFilter || qualityBandFilter === band;

      if (showBand("good")) {
        layers.push(seqBand(STYLE_LAYER_IDS.SEQUENCE_GOOD, [[">=", "quality_score", QUALITY_SCORE.GOOD]], "#35AF6D"));
      }
      if (showBand("fair")) {
        layers.push(
          seqBand(
            STYLE_LAYER_IDS.SEQUENCE_FAIR,
            [
              [">=", "quality_score", QUALITY_SCORE.FAIR],
              ["<", "quality_score", QUALITY_SCORE.GOOD],
            ],
            "#F5A623",
          ),
        );
      }
      if (showBand("poor")) {
        layers.push(
          seqBand(
            STYLE_LAYER_IDS.SEQUENCE_POOR,
            [
              [">", "quality_score", QUALITY_SCORE.FLOOR],
              ["<", "quality_score", QUALITY_SCORE.FAIR],
            ],
            "#D0021B",
          ),
        );
      }
      if (showBand("unscored")) {
        layers.push(seqBand(STYLE_LAYER_IDS.SEQUENCE_UNSCORED, [["any", ["!has", "quality_score"], ["==", "quality_score", 0]]], "#A855F7", 0.85));
      }

      {
        const imgBand = (id: string, qualityConditions: any[], color: string, opacity = 0.85) => {
          const filter = finalImageFilter ? ["all", finalImageFilter, ...qualityConditions] : ["all", ...qualityConditions];

          return {
            id: id,
            source: STYLE_SOURCE_IDS.MAPILLARY,
            "source-layer": "image",
            type: "circle",
            filter: filter,
            paint: {
              "circle-radius": 2,
              "circle-color": color,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 1,
              "circle-opacity": opacity,
              "circle-stroke-opacity": opacity,
            },
          };
        };

        if (showBand("good")) {
          layers.push(imgBand(STYLE_LAYER_IDS.IMAGE_GOOD, [[">=", "quality_score", QUALITY_SCORE.GOOD]], "#35AF6D"));
        }
        if (showBand("fair")) {
          layers.push(
            imgBand(
              STYLE_LAYER_IDS.IMAGE_FAIR,
              [
                [">=", "quality_score", QUALITY_SCORE.FAIR],
                ["<", "quality_score", QUALITY_SCORE.GOOD],
              ],
              "#F5A623",
            ),
          );
        }
        if (showBand("poor")) {
          layers.push(
            imgBand(
              STYLE_LAYER_IDS.IMAGE_POOR,
              [
                [">", "quality_score", QUALITY_SCORE.FLOOR],
                ["<", "quality_score", QUALITY_SCORE.FAIR],
              ],
              "#D0021B",
            ),
          );
        }
        if (showBand("unscored")) {
          layers.push(imgBand(STYLE_LAYER_IDS.IMAGE_UNSCORED, [["any", ["!has", "quality_score"], ["==", "quality_score", 0]]], "#A855F7", 0.85));
        }
      }
    } else {
      // NORMAL VIEW: single green sequence + image layer
      layers.push({
        id: STYLE_LAYER_IDS.SEQUENCE,
        source: STYLE_SOURCE_IDS.MAPILLARY,
        "source-layer": "sequence",
        type: "line",
        ...(finalSequenceFilter ? { filter: finalSequenceFilter } : {}),
        paint: {
          "line-opacity": 0.8,
          "line-color": "#35AF6D",
          "line-width": 2,
        },
      });

      {
        layers.push({
          id: STYLE_LAYER_IDS.IMAGE,
          source: STYLE_SOURCE_IDS.MAPILLARY,
          "source-layer": "image",
          type: "circle",
          ...(finalImageFilter ? { filter: finalImageFilter } : {}),
          paint: {
            "circle-radius": 2,
            "circle-color": "#35AF6D",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1,
            "circle-opacity": 1,
            "circle-stroke-opacity": 1,
          },
        });
      }
    }

    const minimalStyle = {
      version: 8,
      sources: {
        [STYLE_SOURCE_IDS.MAPILLARY]: {
          type: "vector",
          tiles: [vectorTileSourceUrl],
          minzoom: 0,
          maxzoom: 14,
        },
      },
      layers: layers,
    };

    this._mapillaryCoverageStyle = minimalStyle;
    this.mapillaryVTLayer = new VectorTileLayer({
      id: LAYER_IDS.COVERAGE_VT,
      title: "Mapillary Coverage",
      style: minimalStyle,
    });
  }

  private ensureAlwaysOnCoverageLayer = () => {
    const view = this.state.jimuMapView?.view;
    if (!view?.map || view.destroyed || !this.ArcGISModules?.VectorTileLayer) return;
    this.coverageLayerForView(view);
    this.enforceMapillaryLayerOrder(view);
    if (!this.state.tilesActive) this.setState({ tilesActive: true });
  };

  /**
   * Rebuilds the Mapillary coverage vector tile layer on the map.
   * This method reinitializes the layer with new filters (creator, date, pano),
   * removes any existing coverage layer from the map, and adds the updated one.
   * @param creatorId Optional Mapillary creator/user ID to filter images by.
   * @param startDate Optional start date for filtering images.
   * @param endDate Optional end date for filtering images.
   * @param isPano Optional flag to filter panorama images (true = pano, false = non-pano, null/undefined = all).
   */
  private rebuildCoverageLayer(
    creatorId?: number,
    startDate?: string,
    endDate?: string,
    isPano?: boolean | null,
    qualityViewActive?: boolean,
    qualityBandFilter?: "good" | "fair" | "poor" | "unscored" | null,
  ) {
    if (!this.state.jimuMapView) {
      return;
    }

    const view = this.state.jimuMapView.view;

    /*
     * IMPORTANT:
     * Capture the OLD layer before
     * initMapillaryLayer() overwrites
     * this.mapillaryVTLayer.
     */
    const oldLayer = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | null;

    this.log("[rebuildCoverageLayer] called with isPano:", isPano);

    /*
     * Creates the replacement layer and assigns
     * it to this.mapillaryVTLayer.
     */
    this.initMapillaryLayer(creatorId, startDate, endDate, isPano, qualityViewActive, qualityBandFilter);

    const newLayer = this.mapillaryVTLayer;

    this.log("[rebuildCoverageLayer] tilesActive:", this.state.tilesActive);

    this.log("[rebuildCoverageLayer] image layer filter:", JSON.stringify(newLayer?.style?.layers?.find((l: any) => l.id === "image")?.filter));

    /*
     * Only replace it if coverage is meant
     * to be on the map.
     */
    if (this.state.tilesActive || oldLayer) {
      /*
       * Add replacement first so the coverage
       * doesn't visibly blink.
       */
      if (newLayer && !view.map.layers.includes(newLayer)) {
        view.map.add(newLayer);
      }

      /*
       * Then release the OLD VTL completely.
       *
       * map.remove() alone does NOT guarantee
       * its WebGL/tile resources are released.
       */
      if (oldLayer && oldLayer !== newLayer) {
        try {
          view.map.remove(oldLayer);
        } catch (err) {
          console.warn("[Coverage] Could not remove old VTL", err);
        }

        try {
          oldLayer.destroy();
        } catch (err) {
          console.warn("[Coverage] Could not destroy old VTL", err);
        }
      }

      this.enforceMapillaryLayerOrder(view);
      if (this.state.turboModeActive) void this.enableTurboCoverageLayer();
    }
  }

  /*
        Initializes the Mapillary Traffic Signs Layer
        * Creates a Traffic Signs Layer from the Mapillary tiles API
        * Stores the layer in `this.mapillaryTrafficSignsLayer` for later toggling
    */
  /** Native tiles own all sprites; no per-viewport FeatureLayer is constructed. */
  private async syncMapFeatureCoverage(kind: "signs" | "objects") {
    const view = this.state.jimuMapView?.view;
    if (!view) return;
    const signs = kind === "signs", active = signs ? this.state.trafficSignsActive : this.state.objectsActive;
    const id = signs ? LAYER_IDS.TRAFFIC_SIGNS_VT : LAYER_IDS.OBJECTS_VT;
    const oldFeature = view.map.findLayerById(signs ? LAYER_IDS.TRAFFIC_SIGNS_FL : LAYER_IDS.OBJECTS_FL);
    if (oldFeature) { view.map.remove(oldFeature); oldFeature.destroy(); }
    if (signs) { this.mapillaryTrafficSignsFeatureLayer = null; this.trafficSignsZoomHandle?.remove(); this.trafficSignsStationaryHandle?.remove(); }
    else { this.mapillaryObjectsFeatureLayer = null; this.objectsZoomHandle?.remove(); this.objectsStationaryHandle?.remove(); }
    let layer = view.map.findLayerById(id) as __esri.VectorTileLayer;
    if (!active) { this.setState(signs ? { showTrafficSignsFilterBox: false } : { showObjectsFilterBox: false }); if (layer) view.map.remove(layer); this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort(); this.clearTurboHoverDetails(); this._selectedMapFeature = null; return; }
    if (!layer) {
      if (signs) this.initMapillaryTrafficSignsLayer(); else this.initMapillaryObjectsLayer();
      layer = (signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer)!;
      view.map.add(layer);
    }
    if (signs) this.mapillaryTrafficSignsLayer = layer; else this.mapillaryObjectsLayer = layer;
    layer.visible = true;
    const code = this._mapFeatureFilterCodes.get(kind);
    if (code) { if (signs) this.filterTrafficSignsVTLayer(code); else this.filterObjectsVTLayer(code); }
    void this.applyMapFeatureSpriteScale(kind);
    this.enforceMapillaryLayerOrder(view);
  }

  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */
  private async pickMapFeature(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<any | null> {
    const stationary = () => view.stationary !== false;
    if (view.zoom < ZOOM.FEATURES_INTERACTIVE || !stationary() || signal.aborted) return null;
    const radius = 12;
    const ground = view.toMap(screen) as __esri.Point;
    if (!ground) return null;
    const corners = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({x:screen.x+x,y:screen.y+y}) as __esri.Point).filter(p => p && Number.isFinite(p.longitude) && Number.isFinite(p.latitude));
    const boxes = turboFootprintBboxes(corners.map(p => ({lon:p.longitude!,lat:p.latitude!})));
    let nearest: any = null, distance = radius * radius;
    for (const kind of ["signs", "objects"] as const) {
      const signs = kind === "signs";
      const active = () => signs ? this.state.trafficSignsActive : this.state.objectsActive;
      const layer = signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer;
      if (!active() || !layer?.visible || !view.map.layers.includes(layer)) continue;
      const code = this._mapFeatureFilterCodes.get(kind), all = signs ? DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS : DEFAULT_FILTER_LABELS.OBJECTS;
      const seen = new Set<string>(); let count = 0;
      for (const box of boxes) for (const [x,y,z] of turboTiles(box, ZOOM.TILE_FETCH)) {
        const key = `${kind}:${z}/${x}/${y}`;
        if (seen.has(key)) continue; seen.add(key);
        if (++count > 4) return null; // Never enumerate a tilted scene's broad footprint.
        if (signal.aborted) return null;
        let index = this._mapFeatureIndexes.get(key);
        let buffer = index?.buffer || this._mapFeatureTiles.get(key);
        if (!buffer) {
          const controller = new AbortController(), abort = () => controller.abort();
          signal.addEventListener("abort", abort, {once:true});
          const timer = setTimeout(abort, 12000);
          try {
            const source = signs ? TILE_URLS.TRAFFIC_SIGNS : TILE_URLS.OBJECTS;
            const response = await fetch(`${source.replace("{z}",String(z)).replace("{x}",String(x)).replace("{y}",String(y))}?access_token=${this.accessToken}`, {signal:controller.signal});
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
          if (code && code !== all && attrs.value !== code) return;
          const p = feature.loadGeometry()?.[0]?.[0]; if (!p) return;
          const n = 2 ** z, extent = Number(feature.extent) || 4096;
          const lon = (x+p.x/extent)/n*360-180, lat = Math.atan(Math.sinh(Math.PI*(1-2*(y+p.y/extent)/n)))*180/Math.PI;
          const coordinates = lonLatToWebMercator(lon,lat); if (!coordinates) return;
          const geometry = new this.ArcGISModules.Point({...coordinates,...(view.type === "3d" ? {z:ground.z || 0} : {})});
          const pixel = view.toScreen(geometry); if (!pixel) return;
          const delta = (pixel.x-screen.x)**2+(pixel.y-screen.y)**2;
          if (delta < distance) { distance=delta; nearest={layer,kind,code,geometry,attributes:{...attrs,id:String(attrs.id),name:signs ? formatTrafficSignName(attrs.value) : objectNameMap[attrs.value] || attrs.value}}; }
        };
        if (!index) {
          const bytes = TurboSpatialIndex.bytes(buffer, source.length);
          if (this._mapFeatureIndexes.reserve(bytes)) {
            index = new TurboSpatialIndex(buffer, [x,y,z], source.length);
            await index.build(source, signal); this._mapFeatureIndexes.set(key, index);
          }
        }
        if (index) await index.visitIndices(box, signal, consider);
        else for (let i=0;i<source.length;i++) {
          if (i % 100 === 0) { await new Promise(resolve => setTimeout(resolve,0)); if (signal.aborted) return null; }
          consider(i);
        }

      }
      if (!active() || code !== this._mapFeatureFilterCodes.get(kind)) return null;
    }
    if (signal.aborted || this.state.jimuMapView?.view !== view || !nearest || !stationary() || view.zoom < ZOOM.FEATURES_INTERACTIVE) return null;
    if (!(nearest.kind === "signs" ? this.state.trafficSignsActive : this.state.objectsActive) || nearest.code !== this._mapFeatureFilterCodes.get(nearest.kind)) return null;
    return {layer:nearest.layer,graphic:new this.ArcGISModules.Graphic({geometry:nearest.geometry,attributes:nearest.attributes})};
  }

  private changeMapFeatureSpriteScale = (kind: "signs" | "objects", scale: number) => {
    if (![0.75, 1, 1.25, 1.5, 2].includes(scale)) return;
    this.setState(kind === "signs" ? { signSpriteScale: scale } : { objectSpriteScale: scale }, () => { void this.applyMapFeatureSpriteScale(kind); });
  };

  private async applyMapFeatureSpriteScale(kind: "signs" | "objects") {
    const layer = kind === "signs" ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer;
    const id = kind === "signs" ? STYLE_LAYER_IDS.TRAFFIC_SIGNS_ICONS : STYLE_LAYER_IDS.OBJECTS_ICONS;
    if (!layer || layer.destroyed) return;
    try {
      await layer.load();
      if (this._sharedNotesDisposed || layer.destroyed || layer !== (kind === "signs" ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer)) return;
      const scale = (kind === "signs" ? this.state.signSpriteScale : this.state.objectSpriteScale) || 1;
      layer.setLayoutProperties(id, { ...layer.getLayoutProperties(id), "icon-size": 0.5 * scale });
    } catch (error) { if (!this._sharedNotesDisposed) this.showToast("Icon size could not be applied. Try again after the layer loads.", 4000); }
  }

  private initMapillaryTrafficSignsLayer() {
    const { VectorTileLayer } = this.ArcGISModules;

    const vectorTileSourceUrl = `${TILE_URLS.TRAFFIC_SIGNS}?access_token=${this.accessToken}`;
    const spriteBaseUrl = SPRITE_URLS.TRAFFIC_SIGNS;

    const minimalStyle = {
      version: 8,
      sprite: spriteBaseUrl,
      sources: {
        [STYLE_SOURCE_IDS.TRAFFIC_SIGNS]: {
          type: "vector",
          tiles: [vectorTileSourceUrl],
          minzoom: 14,
          maxzoom: 14,
        },
      },
      layers: [
        {
          id: STYLE_LAYER_IDS.TRAFFIC_SIGNS_ICONS,
          source: STYLE_SOURCE_IDS.TRAFFIC_SIGNS,
          "source-layer": "traffic_sign",
          type: "symbol",
          layout: {
            "icon-image": ["get", "value"],
            "icon-size": 0.5 * (this.state.signSpriteScale || 1),
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        },
      ],
    };

    this.mapillaryTrafficSignsLayer = new VectorTileLayer({
      id: LAYER_IDS.TRAFFIC_SIGNS_VT,
      title: "Mapillary Traffic Signs Coverage",
      style: minimalStyle,
    });
  }
  private toggleMapillaryTrafficSigns = async () => {
    const next = !this.state.trafficSignsActive;
    this.setState({ trafficSignsActive: next }, () => { void this.syncMapFeatureCoverage("signs"); this.syncDetectionLayerAvailability(); });
  };


  /*
        Initializes the Mapillary Objects Layer Layer
        * Creates a Object Layer from the Mapillary tiles API
        * Stores the layer in `this.mapillaryObjectsLayer` for later toggling
    */
  private initMapillaryObjectsLayer() {
    const { VectorTileLayer } = this.ArcGISModules;

    const vectorTileSourceUrl = `${TILE_URLS.OBJECTS}?access_token=${this.accessToken}`;
    const spriteBaseUrl = SPRITE_URLS.OBJECTS;

    const minimalStyle = {
      version: 8,
      sprite: spriteBaseUrl,
      sources: {
        [STYLE_SOURCE_IDS.OBJECTS]: {
          type: "vector",
          tiles: [vectorTileSourceUrl],
          minzoom: 14,
          maxzoom: 14,
        },
      },
      layers: [
        {
          id: STYLE_LAYER_IDS.OBJECTS_ICONS,
          source: STYLE_SOURCE_IDS.OBJECTS,
          "source-layer": "point",
          type: "symbol",
          layout: {
            "icon-image": ["get", "value"],
            "icon-size": 0.5 * (this.state.objectSpriteScale || 1),
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        },
      ],
    };

    this.mapillaryObjectsLayer = new VectorTileLayer({
      id: LAYER_IDS.OBJECTS_VT,
      title: "Mapillary Objects Coverage",
      style: minimalStyle,
    });
  }
  private toggleMapillaryObjects = async () => {
    const next = !this.state.objectsActive;
    this.setState({ objectsActive: next }, () => { void this.syncMapFeatureCoverage("objects"); this.syncDetectionLayerAvailability(); });
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
  private enforceMapillaryLayerOrder(view?: __esri.MapView | __esri.SceneView) {
    const targetView = view ?? this.state.jimuMapView?.view;

    if (!targetView?.map) {
      return;
    }

    const map = targetView.map;
    if (this._activeSequenceOverlay?.layer && this._activeSequenceOverlay?.view === targetView && map.layers.includes(this._activeSequenceOverlay?.layer)) map.reorder(this._activeSequenceOverlay?.layer, map.layers.length - 1);

    /*
     * Desired Mapillary stack, bottom -> top:
     *
     * 1. General coverage VTL
     * 2. Turbo coverage ALWAYS highest Mapillary layer
     * 3. Traffic Sign / Object VTLsTraffic Sign / Object clickable FeatureLayers
     * 4. Traffic Sign / Object clickable FeatureLayers
     */
    const desiredIds = [
      // Bottom
      LAYER_IDS.COVERAGE_VT,

      // Lightweight vector-tile coverage
      LAYER_IDS.TRAFFIC_SIGNS_VT,
      LAYER_IDS.OBJECTS_VT,

      // Turbo points
      LAYER_IDS.TURBO_COVERAGE,
      TURBO_LIMITS.closeLayerId,

      // Interactive features above Turbo
      LAYER_IDS.OBJECTS_FL,

      // Absolute top of the Mapillary stack
      LAYER_IDS.TRAFFIC_SIGNS_FL,
    ];

    const desiredLayers = desiredIds.map((id) => map.findLayerById(id)).filter((layer): layer is __esri.Layer => !!layer && map.layers.includes(layer));

    if (desiredLayers.length < 2) {
      return;
    }

    /*
     * Keep this Mapillary stack around its existing
     * location in the operational-layer collection.
     *
     * This avoids unnecessarily pushing Mapillary
     * above things such as field notes / route layers.
     */
    const currentLayers = map.layers.toArray();

    const currentIndices = desiredLayers.map((layer) => currentLayers.indexOf(layer)).filter((index) => index >= 0);

    if (currentIndices.length === 0) {
      return;
    }

    const baseIndex = Math.min(...currentIndices);

    /*
     * Reorder strictly bottom -> top.
     */
    desiredLayers.forEach((layer, offset) => {
      map.reorder(layer, baseIndex + offset);
    });
    // Final invariant: coverage refreshes must never cover active sequence markers.
    if (this._activeSequenceOverlay?.layer && this._activeSequenceOverlay?.view === targetView && map.layers.includes(this._activeSequenceOverlay?.layer)) map.reorder(this._activeSequenceOverlay?.layer, map.layers.length - 1);
  }

  // #endregion COVERAGE LAYERS

  // #region SHARE & EXPORT
  /** Copy image coordinates with validation, browser fallback and user feedback. */
  private copyImageCoordinates = async (latitude: number, longitude: number) => {
    return copyCoordinates(latitude, longitude, message => this.showToast(message));
  };

  private copyShareLink = async () => {
    if (!this.state.imageId) return;

    try {
      const targetWindow = window.self !== window.top && window.parent ? window.parent : window;

      const urlString = targetWindow.location.href; // already has everything

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(urlString);
          this.showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Check size={14} /> Link copied to clipboard
            </span>,
          );
          return;
        } catch (e) {}
      }

      // Textarea fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = urlString;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          this.showToast("✓ Link copied to clipboard");
          return;
        }
      } catch (e) {}

      this.showToast("⚠ Could not copy, please copy from address bar");
    } catch (err) {
      console.error("Error generating link:", err);
    }
  };

  // Helper method to handle the shared URL
  private checkUrlForSharedState = async () => {
    // 1. Get the query string.
    // We attempt to read the PARENT window (the main browser URL),
    // because the widget runs in an iframe and its own URL won't have the params.
    let search = window.location.search;
    try {
      if (window.self !== window.top && window.parent) {
        search = window.parent.location.search;
      }
    } catch (e) {
      console.warn("Cannot access parent window params, using widget params");
    }

    const params = new URLSearchParams(search);
    const sharedId = params.get(SHARE_PARAMS.IMAGE_ID);

    if (sharedId) {
      // MAP VIEW TYPE CHECK AND SWITCH
      const targetMapType = params.get(SHARE_PARAMS.MAP_TYPE); // '2d' or '3d'

      if (targetMapType && this.state.jimuMapView && !this._hasAttemptedMapSwitch) {
        const currentType = this.state.jimuMapView.view.type;

        // If the link was 2D but the map opened in 3D (or vice versa)
        if (currentType !== targetMapType) {
          this._hasAttemptedMapSwitch = true; // Ensure we only try this once
          try {
            const mvManager = MapViewManager.getInstance();
            const mapGroup = mvManager.getJimuMapViewGroup(this.state.jimuMapView.mapWidgetId);

            if (mapGroup) {
              this.log(`Map mismatch: URL wants ${targetMapType}, current is ${currentType}. Switching...`);

              // Reset the check flag so it runs AGAIN after the map switches
              this._hasCheckedSharedState = false;

              // Tell the Experience Builder Map Widget to toggle its 2D/3D state
              mapGroup.switchMap();

              // Exit now. The map will switch, trigger onActiveViewChange, and come back here automatically.
              return;
            }
          } catch (err) {
            console.warn("Could not auto-switch map view:", err);
          }
        }
      }

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

        if (resp.ok) {
          const data = await resp.json();
          const seqId = data.sequence;
          const coords = data.geometry?.coordinates; // [lon, lat]

          if (seqId && coords) {
            // Take control of the camera and don't let anyone else in.
            this._isFlyInActive = true;

            // 1. Load the sequence in the viewer
            await this.loadSequenceById(seqId, sharedId);

            // 2. ZOOM & CENTER the ArcGIS Map (Cinematic Fly-in)
            if (this.state.jimuMapView && this.ArcGISModules) {
              const view = this.state.jimuMapView.view;
              const { Point } = this.ArcGISModules;

              // Create a precise geometric point
              const targetPoint = new Point({
                longitude: coords[0],
                latitude: coords[1],
                spatialReference: { wkid: 4326 },
              });

              await view.when(); // Ensure map drawing engine is ready

              if (view.type === "3d") {
                await view.goTo(
                  {
                    target: targetPoint,
                    heading: bearing,
                    tilt: 60,
                    zoom: mapZoom,
                  },
                  { animate: true, duration: 2500 },
                );
              } else {
                // Await so we can write the correct URL zoom immediately
                // after animation settles, before _isFlyInActive clears.
                await view.goTo(
                  {
                    target: targetPoint,
                    zoom: mapZoom,
                  },
                  { animate: true, duration: 2000 },
                );
              }
            }

            // Write correct zoom to URL now while _isFlyInActive is still true
            // so the zoom watcher cannot interfere.
            if (this.state.jimuMapView) {
              const { imageId, sequenceImages } = this.state;
              const img = sequenceImages.find((s) => s.id === imageId);
              if (img) this.updateUrlWithCurrentImage(imageId!, img.lat, img.lon);
            }

            // Flight complete, restore normal camera tracking.
            setTimeout(() => {
              this._isFlyInActive = false;
            }, 1500);

            // 3. Apply camera angles after viewer is ready.
            //    setBearing() is not a real Mapillary-JS API; the correct
            //    way to point the viewer at a specific bearing is setCenter([x, 0.5])
            //    where x is derived from the diff between target bearing and the
            //    image's compassAngle (same pattern used in _handleSelectAlternateImage).
            setTimeout(async () => {
              if (this.mapillaryViewer) {
                try {
                  const currentImage = await this.mapillaryViewer.getImage();
                  const imageBearing = currentImage.compassAngle ?? 0;
                  const diff = bearing - imageBearing;
                  // Normalise x into 0..1 range
                  const x = (((0.5 + diff / 360) % 1) + 1) % 1;
                  this.mapillaryViewer.setCenter([x, 0.5]);
                } catch (err) {
                  console.warn("Could not set shared bearing on viewer:", err);
                }
                // Do NOT call viewer.setZoom(); the ZOOM param is the
                // ArcGIS map zoom (19.0), not a Mapillary viewer zoom (0–1).
                // Lock the correct bearing into _lastBearing and the URL.
                this._lastBearing = bearing;
                this.updateUrlWithCurrentImage(sharedId, coords[1], coords[0]);
              }
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Failed to load shared state", err);
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
    this._sharedStateRestoreComplete = true;
  };

  /**
   * Downloads currently visible traffic signs and objects within the map extent
   * as a GeoJSON file.
   * Exports only the explicitly selected map feature; no viewport FeatureLayer is retained.
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
      const url = `${GRAPH_API.BASE}/${imageId}?fields=thumb_2048_url&access_token=${this.accessToken}`;
      const resp = await fetch(url);
      const data = await resp.json();
      const imageUrl = data.thumb_2048_url;

      if (!imageUrl) {
        this.showToast(
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.Warning size={14} /> High-resolution image not available
          </span>,
        );
        return;
      }

      const imageResp = await fetch(imageUrl);
      const blob = await imageResp.blob();
      const blobUrl = URL.createObjectURL(blob);

      let filename = `mapillary_${imageId}.jpg`;
      const currentImg = sequenceImages.find((img) => img.id === imageId);

      if (currentImg && currentImg.captured_at) {
        const dateStr = new Date(currentImg.captured_at).toISOString().split("T")[0];
        filename = `mapillary_${imageId}_${dateStr}.jpg`;
      }

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

      this.showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Download size={14} /> Image downloaded
        </span>,
      );
    } catch (err) {
      console.error("Failed to download image:", err);
      this.showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Warning size={14} /> Download failed
        </span>,
      );
    } finally {
      this.setState({ isDownloading: false });
    }
  };
  // #endregion SHARE & EXPORT

  // #region TURBO MODE

  private createTurboRenderer(yearList?: string[]): __esri.Renderer {
    const view = this.state.jimuMapView?.view;

    const is3D = view?.type === "3d";

    /*
     * 3D Turbo symbol:
     *
     * Same visibility strategy that fixed
     * the active green Mapillary point.
     */
    const make3DSymbol = (color: number[]) => {
      return {
        type: "point-3d",

        disableDepthTestDistance: Number.POSITIVE_INFINITY,

        /*
         * Tiny lift so SceneView treats the
         * symbol as undraped rather than a
         * terrain-draped point.
         */
        verticalOffset: {
          screenLength: 1,
          maxWorldLength: 0.1,
          minWorldLength: 0.1,
        },

        symbolLayers: [
          {
            type: "icon",

            /*
             * JSAPI native way to keep the
             * Turbo point visible when terrain
             * / camera depth would otherwise
             * occlude it.
             */
            occludedVisibility: {
              mode: "visible",
            },

            resource: {
              primitive: "circle",
            },

            material: {
              color,
            },

            size: 5,

            outline: {
              color: [255, 255, 255, 1],
              size: 1,
            },
          },
        ],
      } as any;
    };

    /*
     * COLOR-BY-YEAR renderer
     */
    if (yearList && yearList.length > 0) {
      /*
       * Leave the existing 2D behavior
       * completely unchanged.
       */
      if (!is3D) {
        return createYearBasedRenderer(yearList);
      }

      return {
        type: "unique-value",
        field: "date_category",

        uniqueValueInfos: yearList.map((year, idx) => {
          const paletteColor = YEAR_COLOR_PALETTE[idx % YEAR_COLOR_PALETTE.length];

          const color = paletteColor.length >= 4 ? paletteColor : [...paletteColor, 0.9];

          return {
            value: year,
            label: year,
            symbol: make3DSymbol(color),
          };
        }),
      } as any;
    }

    /*
     * NORMAL brown Turbo renderer
     */
    if (is3D) {
      return {
        type: "simple",
        symbol: make3DSymbol([165, 42, 42, 0.9]),
      } as any;
    }

    /*
     * Existing 2D renderer unchanged.
     */
    return {
      type: "simple",

      symbol: {
        type: "simple-marker",
        color: [165, 42, 42, 0.9],
        size: 5,

        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      },
    } as any;
  }
  /** Native tiles at distance; bounded, full-fidelity interactive Graphics at close zoom. */
  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {
    if (!this.state.turboModeActive) return;
    this._turboAbortController?.abort();
    this._turboHoverPickAbort?.abort();
    this.clearTurboHoverDetails();
    this._turboClickPickAbort?.abort();
    const controller = new AbortController();
    this._turboAbortController = controller;
    const requestId = ++this._turboRequestCount;
    this.beginTurboLoading(requestId);
    const task = this._turboLoadTask.then(async () => {
      if (controller.signal.aborted || requestId !== this._turboRequestCount) return;
      let loaded = false;
      try {
        await this.loadTurboCoverageLayer(forceUsernameFilter, requestId, controller);
        loaded = !!this.turboCoverageLayer;
      } catch (err) {
        if (!controller.signal.aborted && (err as any)?.name !== "AbortError") {
          console.warn("[Turbo] Coverage load failed", err);
          this.updateTurboPickWarning("Coverage could not load. Check your connection and choose Retry.", "retry");
        }
      } finally {
        if (requestId === this._turboRequestCount) {
          this.finishTurboLoading();
          if (loaded && requestId === this._turboRequestCount) this.showTurboInteractionHelp();
        }
      }
    });
    this._turboLoadTask = task;
    await task;
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

  private finishTurboLoading() {
    if (this._turboLoadingTimer) clearTimeout(this._turboLoadingTimer);
    this._turboLoadingTimer = null;
    this.setState({ turboLoading: false, turboUpdatingVisible: false });
  }

  /** Style loading can finish before its visible tiles: wait for the layer view too. */
  private async waitForTurboCoverageReady(view: __esri.MapView | __esri.SceneView, layer: __esri.VectorTileLayer, signal: AbortSignal) {
    const cancelled = () => new DOMException("Cancelled", "AbortError");
    if (signal.aborted) throw cancelled();
    await new Promise<void>((resolve, reject) => {
      let handle: __esri.WatchHandle | undefined;
      let settled = false;
      let deadline: ReturnType<typeof setTimeout> | undefined;
      const finish = (error?: unknown) => {
        if (settled) return;
        settled = true; if (deadline) clearTimeout(deadline); handle?.remove(); signal.removeEventListener("abort", abort);
        if (error) reject(error); else resolve();
      };
      const abort = () => finish(cancelled());
      signal.addEventListener("abort", abort, { once: true });
      // SceneView can keep updating at globe scale. Do not leave UX pending forever.
      deadline = setTimeout(() => finish(new Error("Coverage readiness timed out")), 15000);
      view.whenLayerView(layer).then(layerView => {
        if (settled) return;
        handle = layerView.watch("updating", updating => { if (!updating) finish(); });
        if (!layerView.updating) finish();
      }).catch(error => finish(error));
    });
  }

  private changeTravelMethod = (onFoot: boolean | undefined) => {
    if (this.state.turboFilterOnFoot === onFoot) return;
    this.setState({ turboFilterOnFoot: onFoot }, () => { void this.enableTurboCoverageLayer(); });
  };

  private getTurboFilters(): TurboFilters {
    return {
      qualityActive: !!this.state.qualityViewActive,
      qualityBand: this.state.qualityViewActive ? this.state.selectedQualityBand : null,
      creatorId: this._turboCreatorId,
      startTime: this.state.turboFilterStartDate ? new Date(this.state.turboFilterStartDate).getTime() : undefined,
      endTime: this.state.turboFilterEndDate ? new Date(this.state.turboFilterEndDate).getTime() : undefined,
      isPano: this.state.turboFilterIsPano,
      onFoot: this.state.turboFilterOnFoot,
      selectedYear: this.state.turboColorByDate ? this.state.selectedTurboYear : undefined,
    };
  }

  private async loadTurboCoverageLayer(forceUsernameFilter: string | undefined, requestId: number, controller: AbortController) {
    const jmv = this.state.jimuMapView;
    const view = jmv?.view;
    if (!view?.map || view.destroyed) return;
    const map = view.map;
    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;
    await this.ensureArcGISModules();
    if (!current()) return;
    const username = (forceUsernameFilter ?? (this.state.turboFilterUsername || this.props.config.turboCreator || "")).trim();
    const creatorId = username ? await this.getUserIdFromUsername(username) : undefined;
    if (!current()) return;
    if (username && !creatorId) {
      this.disableTurboCoverageLayer();
      this.showZoomWarning(`User '${username}' not found.`, 3000);
      return;
    }
    this._turboCreatorId = creatorId ?? undefined;
    const filters = this.getTurboFilters();
    const colorByDate = !!this.state.turboColorByDate;
    let key = JSON.stringify({ ...filters, colorByDate, points: "hybrid" });
    let layer = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | undefined;
    if (layer?.destroyed) { view.map.remove(layer); layer = undefined; }
    const legacy = view.map.findLayerById(LAYER_IDS.TURBO_COVERAGE);
    if (legacy) { view.map.remove(legacy); legacy.destroy(); }
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
    let hideImages = false;
    if (view.zoom >= TURBO_LIMITS.closeZoom) {
      if (!this._turboCloseLayer) this.updateTurboPickWarning("Preparing close-up points. Coverage may briefly refresh.", undefined, true);
      hideImages = await this.loadTurboCloseGraphics(view, filters, years, requestId, controller.signal);
    } else {
      this.releaseTurboCloseGraphics();
      this._turboCloseFallback = null;
    }
    if (controller.signal.aborted || requestId !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return;
    key += hideImages ? ":graphics" : ":tiles";
    const style = turboTileStyle(`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`, filters, colorByDate, years, YEAR_COLOR_PALETTE, hideImages);
    if (changedLayer || this._loadedTurboFiltersKey !== key) {
      // loadStyle may complete after cancellation. Invalidate before awaiting so
      // the next request cannot mistake the previous committed style for this one.
      this._loadedTurboFiltersKey = "";
      await layer.loadStyle(style as any);
      if (!current()) return;
    }
    await this.waitForTurboCoverageReady(view, layer, controller.signal);
    if (controller.signal.aborted || requestId !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return;
    if (!hideImages) this.releaseTurboCloseGraphics();
    else if (this._turboCloseLayer && this._turboCloseView === view) {
      // Commit one image renderer only after native image circles have retired.
      this._turboCloseLayer.visible = true;
      this._turboCloseReady = true;
      this.refreshHybridSequenceMembership();
    }
    this.setState({ turboYearLegend: years.map((year, i) => ({ year, color: `rgb(${YEAR_COLOR_PALETTE[i % YEAR_COLOR_PALETTE.length].slice(0, 3).join(",")})` })) });
    this._loadedTurboFiltersKey = key;
    this.enforceMapillaryLayerOrder(view);
    this.log("[Turbo memory]", { cachedTileBytes: this._turboTileCache.byteLength, cachedTiles: this._turboTileCache.size, retainedPointGraphics: this._turboCloseGraphics.size });
  }

  private releaseTurboCloseGraphics() {
    if (this._turboHoverGraphicsLayer === this._turboCloseLayer && this._turboHoverGraphic) this.clearTurboHover();
    this._turboCloseReady = false;
    this._turboCloseWatch?.remove();
    this._turboCloseWatch = null;
    if (this._turboCloseLayer) {
      this._turboCloseView?.map?.remove(this._turboCloseLayer);
      this._turboCloseLayer.removeAll();
      this._turboCloseLayer.destroy();
    }
    this._turboCloseGraphics.clear();
    this._turboCloseSymbols.clear();
    this._turboElevationSignature = "";
    this._turboCloseLayer = null;
    this._turboCloseView = null;
    this.refreshHybridSequenceMembership();
  }

  private async loadTurboCloseGraphics(view: __esri.MapView | __esri.SceneView, filters: TurboFilters, years: string[], revision: number, signal: AbortSignal): Promise<boolean> {
    const current = () => !signal.aborted && revision === this._turboRequestCount && this.state.turboModeActive && this.state.jimuMapView?.view === view;
    const guard = () => { if (!current() || view.stationary === false || view.zoom < TURBO_LIMITS.closeZoom) throw new DOMException("Cancelled", "AbortError"); };
    if (!current()) throw new DOMException("Cancelled", "AbortError");
    if (this._turboCloseView && this._turboCloseView !== view) this.releaseTurboCloseGraphics();
    if (view.stationary === false) return !!this._turboCloseLayer && this._turboCloseLayer.visible !== false;
    this._turboCloseReady = false;
    if (this._turboCloseLayer) this._turboCloseLayer.visible = false;
    this.refreshHybridSequenceMembership();
    const elevationLayers = view.type === "3d" ? view.map.ground.layers.toArray() : [];
    const elevationSignature = elevationLayers.map(layer => `${layer.id}:${layer.visible}`).join("|") || "flat";
    const sameElevation = elevationSignature === this._turboElevationSignature;
    const pad = TURBO_LIMITS.closeBufferPx;
    const inside = (pixel: {x:number;y:number} | null | undefined) => !!pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= -pad && pixel.y >= -pad && pixel.x <= view.width + pad && pixel.y <= view.height + pad;
    const footprint: {lon:number;lat:number}[] = [];
    for (let y = 0; y <= 4; y++) for (let x = 0; x <= 4; x++) {
      const point = view.toMap({ x: -pad + (view.width + pad * 2) * x / 4, y: -pad + (view.height + pad * 2) * y / 4 }) as __esri.Point;
      if (point?.longitude != null && point.latitude != null && Number.isFinite(point.longitude) && Number.isFinite(point.latitude)) footprint.push({ lon: point.longitude, lat: point.latitude });
    }
    let completeFootprint = footprint.length === 25;
    let extentTooWide = false;
    if (view.type === "3d") {
      // SceneView.toMap can return null for sky and off-screen padding. The
      // view's extent is the conservative ground envelope, not a sky sample.
      const extent = view.extent;
      const sr = extent?.spatialReference;
      const geographic = sr?.isWGS84 || sr?.wkid === 4326 ? extent
        : sr?.isWebMercator || sr?.wkid === 3857 || sr?.wkid === 102100 || sr?.wkid === 102113
          ? webMercatorUtils.webMercatorToGeographic(extent) as __esri.Extent : null;
      if (geographic && [geographic.xmin, geographic.ymin, geographic.xmax, geographic.ymax].every(Number.isFinite) && geographic.xmax > geographic.xmin && geographic.ymax > geographic.ymin) {
        const dx = (geographic.xmax - geographic.xmin) * pad / Math.max(1,view.width);
        const dy = (geographic.ymax - geographic.ymin) * pad / Math.max(1,view.height);
        extentTooWide = geographic.xmax - geographic.xmin + dx * 2 > 1 || geographic.ymax - geographic.ymin + dy * 2 > 1;
        const west = geographic.xmin - dx, east = geographic.xmax + dx;
        const south = Math.max(-85.05112878,geographic.ymin - dy), north = Math.min(85.05112878,geographic.ymax + dy);
        footprint.push({lon:west,lat:south},{lon:west,lat:north},{lon:east,lat:south},{lon:east,lat:north});
        completeFootprint = true;
      } else if (!completeFootprint) {
        // A SceneView without a usable WGS84/WebMercator extent can still
        // have a complete on-screen ground grid even when padding rays fail.
        const onScreen: {lon:number;lat:number}[] = [];
        for (let y=0; y<=4; y++) for (let x=0; x<=4; x++) {
          const point = view.toMap({x:Math.max(0,view.width-1)*x/4,y:Math.max(0,view.height-1)*y/4}) as __esri.Point;
          if (point?.longitude != null && point.latitude != null && Number.isFinite(point.longitude) && Number.isFinite(point.latitude)) onScreen.push({lon:point.longitude,lat:point.latitude});
        }
        if (onScreen.length === 25) { footprint.push(...onScreen); completeFootprint = true; }
      }
    }
    const boxes = turboFootprintBboxes(footprint);
    const staged = new Map<string, {point:TurboPoint;geometry:__esri.Point}>();
    try {
      if (view.type === "3d" && !completeFootprint) throw new Error("The terrain footprint is too large or includes sky. Reduce tilt or zoom closer for exact point selection; complete tile coverage remains visible.");
      if (extentTooWide || !boxes.length || boxes.reduce((sum, b) => sum + b[2] - b[0], 0) > 1 || boxes.some(b => b[3] - b[1] > 1)) throw new Error("The visible terrain footprint is too large. Reduce tilt or zoom closer to use exact point selection.");
      let tileCount = 0;
      for (const box of boxes) for (const _tile of turboTiles(box, ZOOM.TILE_FETCH)) {
        if (++tileCount > 64) throw new Error("The visible terrain covers too many source tiles. Reduce tilt or zoom closer for exact point selection; tile coverage remains complete.");
      }
      for (const box of boxes) await this.visitTurboPickCoverage(box, filters, signal, (point: TurboPoint) => {
        guard();
        if (staged.has(point.imageId)) return;
        const coordinates = lonLatToWebMercator(point.lon, point.lat);
        if (!coordinates) return;
        const geometry = new this.ArcGISModules.Point(coordinates) as __esri.Point;
        if (view.type !== "3d" && !inside(view.toScreen(geometry))) return;
        if (staged.size >= TURBO_LIMITS.closeMaxGraphics) throw new Error("This view contains too many individual points. All source points remain visible in tile mode; zoom closer or narrow the filters for exact selection.");
        const retained = this._turboCloseGraphics.get(point.imageId)?.geometry as __esri.Point | undefined;
        if (view.type === "3d" && sameElevation && retained?.x === geometry.x && retained?.y === geometry.y && Number.isFinite(retained.z)) geometry.z = retained.z;
        staged.set(point.imageId, { point, geometry });
      });
      guard();
      if (view.type === "3d" && staged.size) {
        // An empty Ground is a flat surface at z=0. Ground.queryElevation
        // throws when there are no elevation layers; no service is needed here.
        if (!elevationLayers.length) staged.forEach(value => { value.geometry.z = 0.05; });
        const entries = Array.from(staged.entries()).filter(([,value]) => !Number.isFinite(value.geometry.z));
        for (let i = 0; i < entries.length; i += 256) {
          guard();
          const batch = entries.slice(i, i + 256);
          const multipoint = new this.ArcGISModules.Multipoint({ points: batch.map(([,value]) => [value.geometry.x, value.geometry.y]), spatialReference: { wkid: 3857 } });
          const result = await view.map.ground.queryElevation(multipoint, { signal });
          guard();
          const positions = (result.geometry as __esri.Multipoint).points;
          batch.forEach(([id,value], index) => {
            const z = positions[index]?.[2];
            if (!Number.isFinite(z) || z === result.noDataValue) throw new Error("Terrain height is unavailable. Retry or switch to 2D for exact point selection.");
            value.geometry.z = z + 0.05;
            if (!inside(view.toScreen(value.geometry))) staged.delete(id);
          });
        }
      }
      guard();
      if (view.type === "3d") staged.forEach((value,id) => { if (!inside(view.toScreen(value.geometry))) staged.delete(id); });
      if (!this._turboCloseLayer) {
        this._turboCloseView = view;
        this._turboCloseLayer = new this.ArcGISModules.GraphicsLayer({ id: TURBO_LIMITS.closeLayerId, title: "Mapillary Interactive Points", visible: false, elevationInfo: { mode: "absolute-height" }, listMode: "hide" });
        view.map.add(this._turboCloseLayer!);
        if (this._activeSequenceOverlay?.layer && this._activeSequenceOverlay?.view === view) view.map.reorder(this._activeSequenceOverlay?.layer, view.map.layers.length - 1);
        this._turboCloseWatch = view.watch("stationary", (stationary: boolean) => {
          if (!stationary && this._turboCloseView === view) {
            this._turboCloseReady = false;
            this._turboAbortController?.abort();
            this.clearTurboHoverDetails();
            const outgoing: __esri.Graphic[] = [];
            this._turboCloseGraphics.forEach((graphic,id) => {
              if (!inside(view.toScreen(graphic.geometry as __esri.Point))) { outgoing.push(graphic); this._turboCloseGraphics.delete(id); }
            });
            this._turboCloseLayer?.removeMany(outgoing);
            this.refreshHybridSequenceMembership();
          }
        });
      }
      const layer = this._turboCloseLayer!;
      const outgoing: __esri.Graphic[] = [];
      this._turboCloseGraphics.forEach((graphic,id) => { if (!staged.has(id)) { outgoing.push(graphic); this._turboCloseGraphics.delete(id); } });
      layer.removeMany(outgoing);
      const symbols = this._turboCloseSymbols;
      let incoming: __esri.Graphic[] = [];
      let deadline = performance.now() + 8;
      for (const [id, value] of staged) {
        guard();
        const year = value.point.year || "";
        const index = years.indexOf(year);
        const color = this.state.qualityViewActive ? coverageQualityColor(value.point.qualityScore) : index >= 0 ? YEAR_COLOR_PALETTE[index % YEAR_COLOR_PALETTE.length] : TURBO_LIMITS.coverageColor;
        const symbolKey = `${view.type}:${color.join(",")}`;
        if (!symbols.has(symbolKey)) {
          symbols.set(symbolKey, view.type === "3d" ? new this.ArcGISModules.PointSymbol3D({ symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, size: 7, material: { color }, outline: { color: "white", size: 1 } }] }) : new this.ArcGISModules.SimpleMarkerSymbol({ style: "circle", size: 7, color, outline: { color: "white", width: 1 } }));
        }
        const attributes = { oid:id, image_id:id, captured_at:value.point.capturedAt, date_category:value.point.year, turbo_close:true, foot:value.point.onFoot, turbo_lon:value.point.lon, turbo_lat:value.point.lat };
        const existing = this._turboCloseGraphics.get(id);
        if (existing) {
          const previous = existing.geometry as __esri.Point;
          if (previous.x !== value.geometry.x || previous.y !== value.geometry.y || previous.z !== value.geometry.z) existing.geometry = value.geometry;
          if (existing.symbol !== symbols.get(symbolKey)) existing.symbol = symbols.get(symbolKey);
          (existing as any).__turboBaseSymbol = symbols.get(symbolKey);
          if (existing.attributes.foot !== attributes.foot || existing.attributes.captured_at !== attributes.captured_at || existing.attributes.date_category !== attributes.date_category || existing.attributes.turbo_lon !== attributes.turbo_lon || existing.attributes.turbo_lat !== attributes.turbo_lat) existing.attributes = attributes;
        }
        else {
          const graphic = new this.ArcGISModules.Graphic({ geometry:value.geometry, symbol:symbols.get(symbolKey), attributes });
          this._turboCloseGraphics.set(id, graphic);
          incoming.push(graphic);
        }
        if (incoming.length >= 256 || performance.now() >= deadline) {
          layer.addMany(incoming); incoming = [];
          await new Promise(resolve => setTimeout(resolve, 0)); guard(); deadline = performance.now() + 8;
        }
      }
      layer.addMany(incoming);
      this.refreshHybridSequenceMembership();
      const active = this._turboCloseGraphics.get(String(this.state.imageId));
      if (active && this._selectionPulse?.view === view && this.currentGreenGraphic && this.currentGreenGraphic.attributes?.image_id === active.attributes.image_id) this.currentGreenGraphic.geometry = active.geometry;
      this._turboCloseFallback = null;
      this._turboElevationSignature = elevationSignature;
      // Readiness is committed by loadTurboCoverageLayer after tile rendering settles.
      this._turboCloseReady = false;
      this.enforceMapillaryLayerOrder(view);
      return true;
    } catch (error) {
      if (!current() || (error as any)?.name === "AbortError") throw error;
      this.releaseTurboCloseGraphics();
      this._turboCloseFallback = (error as Error).message;
      this._turboCloseFallbackAction = /too many|too large/.test(this._turboCloseFallback) ? "zoom" : "retry";
      return false;
    }
  }

  private async getTurboTileBuffer(tile: [number, number, number], signal: AbortSignal): Promise<ArrayBuffer> {
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const [x, y, z] = tile;
    const key = `${z}/${x}/${y}`;
    const cached = this._turboTileCache.get(key);
    if (cached) return cached;
    const url = `${TILE_URLS.COVERAGE.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y))}?access_token=${this.accessToken}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      try {
        const response = await fetch(url, { signal });
        if (response.status === 204 || response.status === 404) {
          if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
          const empty = new ArrayBuffer(0);
          this._turboTileCache.set(key, empty);
          return empty;
        }
        if (!response.ok) {
          if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
          const error = new Error(`Turbo tile ${key}: HTTP ${response.status}`) as Error & { status: number };
          error.status = response.status;
          throw error;
        }
        const buffer = await response.arrayBuffer();
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
        this._turboTileCache.set(key, buffer);
        return buffer;
      } catch (err) {
        const status = (err as any)?.status;
        if (signal.aborted || (err as any)?.name === "AbortError" || attempt === 1 || (status && status !== 429 && status < 500)) throw err;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    throw new Error(`Turbo tile ${key} could not load`);
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

  /** Match selection visuals to the owned rendered point; API coordinates remain unchanged. */
  private getCoverageDisplayPosition(imageId: string, lon: number, lat: number): { lon: number; lat: number; geometry?: __esri.Point } {
    const view = this.state.jimuMapView?.view;
    const graphic = this._turboCloseGraphics.get(String(imageId));
    if (view && view === this._turboCloseView && view.zoom >= TURBO_LIMITS.closeZoom && this._turboCloseLayer && view.map.layers.includes(this._turboCloseLayer) && graphic?.attributes?.image_id === String(imageId)) {
      const x = graphic.attributes.turbo_lon, y = graphic.attributes.turbo_lat;
      if (Number.isFinite(x) && Number.isFinite(y) && graphic.geometry?.type === "point") return { lon: x, lat: y, geometry: graphic.geometry as __esri.Point };
    }
    return { lon, lat };
  }

  private getCoverageBarPresentation(): { text: string; action?: "show" | "data" | "tilt" | "zoom" | "retry"; label?: string } {
    const view = this.state.jimuMapView?.view;
    const zoom = view?.zoom ?? 0;
    if (this.state.isLoading) return { text: "Opening image…" };
    if (this.state.imageId && this.state.sequenceRouteLoading) return { text: this.state.sequenceRouteProgress ? `Image ready · Sequence ${this.state.sequenceRouteProgress}` : "Image ready · Loading sequence…" };
    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith("Image is open") ? "Image ready · Sequence unavailable" : "Image could not load" };
    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: "Zoom closer for travel-method coverage", action: "show", label: "Zoom to images" };
    if ((this.state.trafficSignsActive || this.state.objectsActive) && zoom < ZOOM.FEATURES_INTERACTIVE) {
      const data = this.state.trafficSignsActive && this.state.objectsActive ? "traffic signs and objects" : this.state.trafficSignsActive ? "traffic signs" : "objects";
      return { text: `Zoom in to display ${data}`, action: "data", label: "Zoom to data" };
    }
    if (this.state.turboModeActive && zoom < 14) return { text: "Zoom closer for image points", action: "show", label: "Zoom to images" };
    if (this.state.turboLoading || this.state.turboUpdatingVisible) return { text: "Updating coverage…" };
    const error = !!this.state.zoomWarningMessage && this.shouldShowCoverageNotice() && !this.state.turboWarningIsHelp;
    if (error && this.state.turboWarningAction === "retry") return { text: "Coverage unavailable", action: "retry", label: "Retry" };
    if (!this.state.turboModeActive) return { text: error ? "Coverage needs attention" : "Mapillary coverage" };
    if (view?.type === "3d" && (view as __esri.SceneView).camera?.tilt > 45) {
      let valid = 0;
      for (const y of [0.1, 0.5, 0.9]) for (const x of [0.1, 0.5, 0.9]) {
        const ground = view.toMap({ x: view.width * x, y: view.height * y });
        if (ground && Number.isFinite(ground.longitude) && Number.isFinite(ground.latitude)) valid++;
      }
      if (valid < 5) return { text: "Tilt hides image points", action: "tilt", label: "Reduce tilt" };
    }
    if (zoom < 14) return { text: "Zoom closer for image points", action: "show", label: "Zoom to images" };
    if (this._turboCloseFallbackAction === "zoom" && this._turboCloseFallback) return { text: "Move closer for image points", action: "zoom", label: "Move closer" };
    if (error) return { text: "Coverage needs attention", ...(this.state.turboWarningAction === "zoom" ? { action: "zoom" as const, label: "Move closer" } : {}) };
    if (this.state.trafficSignsActive || this.state.objectsActive) return { text: this.state.trafficSignsActive && this.state.objectsActive ? "Select a traffic sign, object or image point" : this.state.trafficSignsActive ? "Select a traffic sign or image point" : "Select an object or image point" };
    if (this.state.imageId) return { text: "Select another point to explore" };
    if (this._turboCloseReady && zoom >= TURBO_LIMITS.closeZoom) return { text: this._turboCloseGraphics.size ? "Image points available" : "No image points here" };
    return { text: this.state.imageId ? "Select another point to explore" : "Select a visible image point" };
  }

  private shouldShowCoverageBar(): boolean {
    return this.shouldShowCoverageNotice() && !!(this.state.turboModeActive || this.state.zoomWarningMessage || this.state.turboUpdatingVisible);
  }

  private getExplorerGuideContext(): string[] {
    const context: string[] = [];
    const creator = this.state.turboFilterUsername || this.props.config.turboCreator;
    if (creator) context.push(`Creator: ${creator}`);
    const start = this.state.turboFilterStartDate, end = this.state.turboFilterEndDate;
    if (start || end) context.push(`Dates: ${start || "any"} → ${end || "latest"}`);
    if (this.state.turboFilterOnFoot !== undefined) context.push(this.state.turboFilterOnFoot ? "Travel: On foot" : "Travel: Other travel");
    if (this.state.turboFilterIsPano === true) context.push("360° only");
    else if (this.state.turboFilterIsPano === false) context.push("Non-360° only");
    if (this.state.turboColorByDate) context.push(this.state.selectedTurboYear ? `Year: ${this.state.selectedTurboYear}` : "Colored by year");
    if (this.state.qualityViewActive) context.push(this.state.selectedQualityBand ? `Quality: ${this.state.selectedQualityBand}` : "Quality mode on");
    if (this.state.trafficSignsActive) {
      const code = this._mapFeatureFilterCodes.get("signs");
      context.push(code && code !== DEFAULT_FILTER_LABELS.TRAFFIC_SIGNS ? `Signs: ${formatTrafficSignName(code)}` : "Traffic signs on");
    }
    if (this.state.objectsActive) {
      const code = this._mapFeatureFilterCodes.get("objects");
      context.push(code && code !== DEFAULT_FILTER_LABELS.OBJECTS ? `Objects: ${objectNameMap[code] || code}` : "Objects on");
    }
    return context;
  }

  private getCoverageBarHint(): string {
    if (this.state.turboFilterOnFoot !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) return "Zoom closer for travel-method coverage";
    if (this.state.turboLoading) return "You can keep exploring while coverage loads";
    if ((this.state.jimuMapView?.view?.zoom ?? 0) < 14) return "Click a coverage line to open a representative image";
    if (this._turboCloseReady && !this._turboCloseGraphics.size) return "Try another area or adjust your filters";
    return "Hover to preview · Click to open";
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
    if (this._turboCloseFallback) { this.updateTurboPickWarning(this._turboCloseFallback, this._turboCloseFallbackAction); return; }
    if (this._turboCloseLayer) { this.updateTurboPickWarning("Hover to preview; tap or click to open imagery.", "zoom", true); return; }
    if ((this.state.jimuMapView?.view?.zoom ?? 14) < 14) {
      this.updateTurboPickWarning("Click a coverage line or overview point to open its representative image when available. Zoom closer for individual image hover and selection. Help explains selection and camera limits.", "zoom", true); return;
    }
    const scene = this.state.jimuMapView?.view?.type === "3d";
    this.updateTurboPickWarning(scene
      ? "3D: Hover a visible coverage dot to preview; tap or click it to open imagery. Zoom closer or reduce tilt if terrain hides dots."
      : "Hover a coverage dot to preview; tap or click it to open imagery. Zoom closer if dots overlap. Lines alone do not select an image.", "zoom", true);
  }

  private dismissTurboInteractionHelp() {
    this._turboDismissedWarning = this.state.zoomWarningMessage === this._turboPickWarning ? this._turboPickWarning : null;
    this.clearZoomWarning();
  }

  private async getZoomToImagesTarget(view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<number[] | __esri.Point | null> {
    const id = this.state.imageId;
    if (id) {
      const selected = this.state.sequenceImages?.find((image: any) => String(image.id) === String(id)) || this._lastSuccessfulSelection?.sequenceImages?.find((image: any) => String(image.id) === String(id));
      if (selected && Number.isFinite(selected.lon) && Number.isFinite(selected.lat) && Math.abs(selected.lon) <= 180 && Math.abs(selected.lat) <= 90) return [selected.lon, selected.lat];
      const graphic = this.currentGreenGraphic;
      if (String(graphic?.attributes?.image_id) === String(id) && graphic?.geometry?.type === "point") return graphic.geometry as __esri.Point;
    }
    // In a tilted globe view the screen center can be sky; sample lower ground before falling back to view.center.
    let ground: __esri.Point | null = null;
    for (const fraction of [0.5, 0.65, 0.8]) {
      try { ground = view.toMap({ x: view.width / 2, y: view.height * fraction }) as __esri.Point; } catch (_) { ground = null; }
      if (ground && Number.isFinite(ground.longitude) && Number.isFinite(ground.latitude)) break;
      ground = null;
    }
    ground = ground || view.center;
    if (!ground) return null;
    if (view.zoom < 14 && this.turboCoverageLayer && !signal.aborted) {
      try {
        const pixel = view.toScreen(ground);
        if (pixel) {
          const nearby = await this.pickTurboRepresentative(pixel, view, signal, false, Math.min(160, Math.max(32, Math.min(view.width, view.height) * 0.15)));
          if (nearby?.geometry?.type === "point") return nearby.geometry as __esri.Point;
        }
      } catch (_) { /* Missing/filtered coverage must not prevent navigation to the looked-at ground. */ }
    }
    return ground;
  }

  private async handleTurboWarningAction(action: "show" | "data" | "tilt" | "zoom" | "retry" | undefined = this.state.turboWarningAction) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.state.turboModeActive) return;
    if (action === "show" || action === "data" || action === "tilt") {
      try {
        if (action === "show" || action === "data") {
          const targetZoom = action === "data" ? ZOOM.FEATURES_INTERACTIVE : 14;
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
              this.updateTurboPickWarning("The scene cannot reach the required selection zoom. Check the map zoom constraints or use the map controls to move closer.");
              return;
            }
          } else await view.goTo({ ...location, zoom: targetZoom });
        }
        else if (view.type === "3d") await view.goTo({ tilt: 0 });
        if (this.state.jimuMapView?.view === view && this.state.turboModeActive) await this.enableTurboCoverageLayer();
      } catch (error) {
        if ((error as any)?.name !== "AbortError") this.updateTurboPickWarning("The camera could not reach an image selection view. Use the map controls to move closer or reduce tilt.");
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
        this.updateTurboPickWarning("The map is already at its closest allowed scale. Choose a separate coverage dot or adjust the active filters.");
        return;
      }
      try { await view.goTo({ scale: targetScale }); }
      catch (error) {
        if ((error as any)?.name !== "AbortError" && this.state.jimuMapView?.view === view && this.state.turboModeActive) {
          this.updateTurboPickWarning("The map could not zoom closer. Use the map controls, then choose a visible coverage dot.");
        }
      }
    }
  }

  /** Click-only overview/sequence selection; never fabricates an image hover. */
  private async pickTurboRepresentative(screen: {x:number;y:number}, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, preview = false, searchRadius?: number): Promise<__esri.Graphic | null> {
    if (!this.turboCoverageLayer || view.zoom >= 14 || preview && view.zoom >= 6 || view.stationary === false || signal.aborted) return null;
    if (view.zoom < 6 && this.state.turboFilterOnFoot !== undefined) return null;
    const revision = this._turboRequestCount;
    const radius = searchRadius ?? TURBO_LIMITS.pickRadiusPx;
    const ground = view.toMap(screen) as __esri.Point;
    if (!ground) return null;
    const samples = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({x:screen.x+x,y:screen.y+y}) as __esri.Point).filter(Boolean);
    const boxes = turboFootprintBboxes(samples.filter(p => p.longitude != null && p.latitude != null).map(p => ({lon:p.longitude!,lat:p.latitude!})));
    let best = radius * radius;
    let selected: {id:string;sequence?:string;pixel:{x:number;y:number};geometry:__esri.Point} | null = null;
    const filters = this.getTurboFilters();
    const zoom = Math.max(0, Math.min(14, Math.floor(view.zoom)));
    const seen = new Set<string>();
    for (const box of boxes) for (const tileCoordinates of turboTiles(box, zoom)) {
      const tileKey = tileCoordinates.join("/");
      if (seen.has(tileKey)) continue;
      seen.add(tileKey);
      if (seen.size > 4) return null; // Pointer-local picking never scans a broad scene footprint.
      if (signal.aborted) return null;
      const buffer = await this.getTurboTileBuffer(tileCoordinates, signal);
      if (!buffer.byteLength) continue;
      const tile = new VectorTile(new Pbf(new Uint8Array(buffer)));
      const overview = zoom < 6;
      const source = tile.layers[overview ? "overview" : "sequence"];
      if (!source) continue;
      const [tx,ty,tz] = tileCoordinates, n = 2 ** tz;
      for (let i=0; i<source.length; i++) {
        if (i % TURBO_LIMITS.decodeYield === 0) { await new Promise(resolve=>setTimeout(resolve,0)); if (signal.aborted) return null; }
        const feature = source.feature(i), props = feature.properties;
        if (!turboPointMatches(props, filters)) continue;
        const id = overview ? props.id : props.image_id;
        if (id === undefined || id === null) continue;
        const extent = Number(feature.extent) || 4096;
        for (const path of feature.loadGeometry()) {
          let previous: {x:number;y:number} | null = null;
          for (const vertex of path) {
            const lon = (tx + vertex.x / extent) / n * 360 - 180;
            const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (ty + vertex.y / extent) / n))) * 180 / Math.PI;
            const coords = lonLatToWebMercator(lon,lat);
            if (!coords) { previous=null; continue; }
            const geometry = new this.ArcGISModules.Point({ ...coords, ...(view.type === "3d" ? {z:ground.z || 0} : {}) });
            const pixel = view.toScreen(geometry);
            if (!pixel) { previous=null; continue; }
            let nearest = pixel;
            if (previous && !overview) {
              const dx=pixel.x-previous.x, dy=pixel.y-previous.y;
              const fraction=Math.max(0,Math.min(1,((screen.x-previous.x)*dx+(screen.y-previous.y)*dy)/(dx*dx+dy*dy || 1)));
              nearest={x:previous.x+fraction*dx,y:previous.y+fraction*dy};
            }
            const distance=(nearest.x-screen.x)**2+(nearest.y-screen.y)**2;
            if (distance<=best) { best=distance; selected={id:String(id),sequence:overview ? undefined : String(props.id || ""),pixel:nearest,geometry:overview ? geometry : ground}; }
            previous=pixel;
          }
        }
      }
    }
    if (signal.aborted || revision !== this._turboRequestCount || this.state.jimuMapView?.view !== view || !selected) return null;
    // A line selects its representative image, not the frame at the clicked coordinate.
    // Representative guidance is shown inside the imagery loading card, not a competing toast.
    return new this.ArcGISModules.Graphic({ geometry:selected.geometry, attributes:{ image_id:selected.id, sequence_id:selected.sequence, turbo_representative:true, turbo_screen_x:selected.pixel.x, turbo_screen_y:selected.pixel.y } });
  }

  private async pickTurboGraphic(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, radius: number = TURBO_LIMITS.pickRadiusPx): Promise<__esri.Graphic | null> {
    if (!this.turboCoverageLayer || view.zoom < 14 || view.map.findLayerById(LAYER_IDS.COVERAGE_VT) !== this.turboCoverageLayer) return null;
    if (this._turboCloseLayer && this._turboCloseView === view) {
      const isStationary = () => view.stationary !== false;
      if (!this._turboCloseReady || view.zoom < TURBO_LIMITS.closeZoom || !isStationary() || signal.aborted) return null;
      // Keep a valid hovered point through transient GPU hit-test misses after selection.
      // The actual point must still exist and the pointer must remain inside its hit radius.
      const hovered = this._turboCloseGraphics.get(String(this._lastHoveredTurboOid));
      if (hovered?.geometry?.type === "point") {
        const pixel = view.toScreen(hovered.geometry as __esri.Point);
        if (pixel && (pixel.x - screen.x) ** 2 + (pixel.y - screen.y) ** 2 <= radius * radius) {
          hovered.attributes.turbo_screen_x = pixel.x; hovered.attributes.turbo_screen_y = pixel.y;
          return hovered;
        }
      }
      const revision = this._turboRequestCount;
      const response = await view.hitTest(screen, { include: [this._turboCloseLayer] });
      if (signal.aborted || !this._turboCloseReady || !isStationary() || revision !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return null;
      let nearest: __esri.Graphic | null = null;
      let distance = radius * radius;
      for (const result of response.results) {
        if (result.type !== "graphic" || result.layer !== this._turboCloseLayer) continue;
        const graphic = result.graphic;
        if (this._turboCloseGraphics.get(String(graphic.attributes?.image_id)) !== graphic || graphic.geometry?.type !== "point") continue;
        const pixel = view.toScreen(graphic.geometry as __esri.Point);
        if (!pixel) continue;
        const delta = (pixel.x - screen.x) ** 2 + (pixel.y - screen.y) ** 2;
        if (delta <= distance) { nearest = graphic; distance = delta; graphic.attributes.turbo_screen_x = pixel.x; graphic.attributes.turbo_screen_y = pixel.y; }
      }
      return nearest;
    }
    if (view.zoom >= TURBO_LIMITS.closeZoom && !this._turboCloseFallback) return null;
    const corners = [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius], [0, 0]]
      .map(([dx, dy]) => view.toMap({ x: screen.x + dx, y: screen.y + dy }) as __esri.Point | null)
      .filter((point): point is __esri.Point & { longitude: number; latitude: number } => !!point && point.longitude != null && point.latitude != null && Number.isFinite(point.longitude) && Number.isFinite(point.latitude));
    if (!corners.length) return null;
    const bbox: TurboBbox = [Math.min(...corners.map(p => p.longitude)), Math.min(...corners.map(p => p.latitude)), Math.max(...corners.map(p => p.longitude)), Math.max(...corners.map(p => p.latitude))];
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
    await this.visitTurboPickCoverage(bbox, filters, signal, (point: TurboPoint) => {
      const geometry = lonLatToWebMercator(point.lon, point.lat);
      if (!geometry) return;
      projection.x = geometry.x;
      projection.y = geometry.y;
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
      attributes: { oid: selected.imageId, image_id: selected.imageId, captured_at: selected.capturedAt, date_category: selected.year,
        turbo_screen_x: (nearestScreen as { x: number; y: number }).x, turbo_screen_y: (nearestScreen as { x: number; y: number }).y },
    });
  }

  /** SDK hit testing is only for actual feature/graphics layers, never Turbo tiles. */
  private async hitTestHoverLayers(view: __esri.MapView | __esri.SceneView, screen: { x: number; y: number }): Promise<any> {
    const layers = [this._pointCloudLayer, this.mapillaryObjectsFeatureLayer, this.mapillaryTrafficSignsFeatureLayer].filter(Boolean) as __esri.Layer[];
    if (!layers.length) return { results: [] };
    try {
      return await view.hitTest(screen, { include: layers });
    } catch (err) {
      this.log("[Hover] Feature hit test failed", err);
      return { results: [] }; // A different layer's failure must not disable Turbo hover.
    }
  }

  private clearTurboHoverDetails() {
    this._turboHoverInfoAbort?.abort();
    this._turboHoverInfoAbort = null;
    if (this._hoverTimeout) clearTimeout(this._hoverTimeout);
    this._hoverTimeout = null;
    this._currentHoveredFeatureId = null;
    this._turboHoveredScreen = null;
    if (this.tooltipDiv) this.tooltipDiv.style.display = "none";
    this.clearTurboHover();
    this.highlightSequenceOnVTL(null);
  }

  /** One pulse and one metadata request for the image actually under the pointer. */
  private updateTurboHover(graphic: __esri.Graphic, globalX: number, globalY: number) {
    const attrs = graphic.attributes;
    const imageId = String(attrs?.image_id || "");
    if (!imageId || !this.tooltipDiv) { this.clearTurboHoverDetails(); return; }
    const changed = this._currentHoveredFeatureId !== imageId;
    if (changed) this.clearTurboHoverDetails();
    this._currentHoveredFeatureId = imageId;
    this._turboHoveredScreen = { x: attrs.turbo_screen_x, y: attrs.turbo_screen_y };
    this.showTurboHover(graphic);
    this.tooltipDiv.style.left = `${globalX + 15}px`;
    this.tooltipDiv.style.top = `${globalY + 15}px`;
    if (!changed) return; // Small moves over the same dot do not restart or abort its details.

    const controller = new AbortController();
    this._turboHoverInfoAbort = controller;
    const view = this.state.jimuMapView?.view;
    const isCurrent = () => !controller.signal.aborted && this._currentHoveredFeatureId === imageId &&
      this.state.turboModeActive && this.state.jimuMapView?.view === view && !!this.tooltipDiv;
    this._hoverTimeout = setTimeout(async () => {
      this._hoverTimeout = null;
      if (!isCurrent()) return;
      this.tooltipDiv.textContent = "Loading details…";
      this.tooltipDiv.style.display = "block";
      try {
        let data = this._turboMetadataCache.get(imageId);
        if (!data) {
        const response = await fetch(`${GRAPH_API.BASE}/${imageId}?fields=id,sequence,creator,captured_at,thumb_256_url`, {
          headers: { Authorization: `OAuth ${this.accessToken}` }, signal: controller.signal,
        });
        if (!isCurrent()) return;
        if (!response.ok) throw new Error(`Image details: HTTP ${response.status}`);
        data = await response.json();
        if (!isCurrent()) return;
        this._turboMetadataCache.set(imageId, data);
        }
        if (!isCurrent()) return;
        const tooltip = this.tooltipDiv;
        const doc = tooltip.ownerDocument;
        const user = doc.createElement("div");
        const name = doc.createElement("b");
        name.textContent = data.creator?.username || "Unknown User";
        user.appendChild(name);
        const date = doc.createElement("div");
        date.style.fontSize = "10px";
        const rawDate = data.captured_at ?? attrs.captured_at;
        const captured = new Date(typeof rawDate === "string" && /^\d+$/.test(rawDate) ? Number(rawDate) : rawDate);
        date.textContent = rawDate && Number.isFinite(captured.getTime()) ? captured.toLocaleString() : "Unknown date";
        tooltip.textContent = "";
        tooltip.appendChild(user);
        tooltip.appendChild(date);
        if (data.thumb_256_url) {
          const image = doc.createElement("img");
          image.src = data.thumb_256_url;
          image.alt = "Mapillary image preview";
          Object.assign(image.style, { maxWidth: "150px", borderRadius: "3px", marginTop: "4px", display: "block" });
          tooltip.appendChild(image);
        }
        this.highlightSequenceOnVTL(data.sequence || null);
      } catch (err) {
        if (isCurrent()) this.tooltipDiv.textContent = "Failed to load image details";
      }
    }, this._turboMetadataCache.get(imageId) ? 0 : TURBO_LIMITS.hoverDetailsDelayMs);
  }

  private disableTurboCoverageLayer() {
    this.releaseTurboCloseGraphics();
    this._turboCloseFallback = null;
    this._turboMetadataCache.clear();
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
    if (layer) {
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
    this._loadedTurboFiltersKey = "";
    this.finishTurboLoading();
  }

  /**
   * Displays a pulsing hover indicator on a Turbo point.
   * The function creates a temporary graphic at the hovered point location
   * and animates it by repeatedly increasing and decreasing its size.
   *
   * @param graphic The turbo point graphic being hovered.
   */
  private showTurboHover(graphic: __esri.Graphic) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules) return;
    const oid = graphic.attributes?.oid ?? graphic.attributes?.image_id;
    if (this._lastHoveredTurboOid === oid && this._turboHoverGraphic) { this._turboHoverGraphic.geometry = graphic.geometry; return; }
    this.clearTurboHover(); this._lastHoveredTurboOid = oid;
    const hover = new this.ArcGISModules.Graphic({ geometry: graphic.geometry, symbol: view.type === "3d" ? {
      type: "point-3d", symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color: [165,42,42,0.95] }, size: 6, outline: { color: "white", size: 1.5 } }],
    } : { type: "simple-marker", style: "circle", color: [165,42,42,0.95], size: 6, outline: { color: "white", width: 1.5 } } });
    (hover as any).__isTurboHover = true;
    this._turboHoverGraphic = hover;
    const host = view.container as HTMLElement;
    if (host && typeof host.appendChild === "function" && typeof document !== "undefined") {
      const overlay = document.createElement("div"); overlay.setAttribute("aria-hidden", "true");
      Object.assign(overlay.style, { position: "absolute", pointerEvents: "none", zIndex: "9", width: "6px", height: "6px", border: "1.5px solid white", borderRadius: "50%", boxSizing: "border-box", background: "rgba(165,42,42,0.95)", transform: "translate(-50%,-50%)", display: "none" });
      host.appendChild(overlay); this._turboHoverOverlay = overlay;
    } else {
      this._turboHoverGraphicsLayer = graphic.attributes?.turbo_close ? this._turboCloseLayer : null;
      if (this._turboHoverGraphicsLayer) this._turboHoverGraphicsLayer.add(hover); else view.graphics.add(hover);
    }
    const started = performance.now();
    const animate = (now: number) => {
      if (this._turboHoverGraphic !== hover || this.state.jimuMapView?.view !== view || view.destroyed) return;
      const size = 8.5 - 2.5 * Math.cos((now - started) * Math.PI * 2 / 1200);
      const overlay = this._turboHoverOverlay;
      if (overlay) {
        const p = view.toScreen(hover.geometry as __esri.Point);
        const visible = p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0 && p.x <= view.width && p.y <= view.height;
        overlay.style.display = visible ? "block" : "none";
        if (visible) { overlay.style.left = `${p.x}px`; overlay.style.top = `${p.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }
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
    if (this._turboHoverFrame != null) cancelAnimationFrame(this._turboHoverFrame);
    this._turboHoverFrame = null;
    this._turboHoverOverlay?.remove(); this._turboHoverOverlay = null;
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

  private async pruneFeatureTilesOutsideWindow(layerId: string, layer: __esri.FeatureLayer, keepTileKeys: Set<string>, isCurrentRequest: () => boolean) {
    const loadedTiles = this._loadedFeatureTileKeys.get(layerId);

    const tileOids = this._featureTileOids.get(layerId);

    if (!loadedTiles || !tileOids) {
      return;
    }

    const staleTiles = Array.from(loadedTiles).filter((tileKey) => !keepTileKeys.has(tileKey));

    const deleteChunkSize = 15000;

    for (const tileKey of staleTiles) {
      if (!isCurrentRequest()) {
        return;
      }

      const oids = tileOids.get(tileKey) ?? [];

      for (let i = 0; i < oids.length; i += deleteChunkSize) {
        if (!isCurrentRequest()) {
          return;
        }

        const oidChunk = oids.slice(i, i + deleteChunkSize);

        await layer.applyEdits({
          deleteFeatures: oidChunk.map((objectId) => ({
            objectId,
          })) as any,
        });
      }

      loadedTiles.delete(tileKey);

      tileOids.delete(tileKey);
    }
  }

  // #endregion TURBO MODE

  // #region STREET COVERAGE ANALYSIS

  /** Fetches the OSM road network and analyzes coverage by snapping Turbo points to segments. */
  private runCoverageAnalysis = async () => {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.turboCoverageLayer) return;
    if (Date.now() < this._coverageRoadRetryAt) {
      this.showToast(`Road server is rate-limited. Try again in ${Math.ceil((this._coverageRoadRetryAt - Date.now()) / 1000)} seconds.`, 5000);
      return;
    }

    this.cancelCoverageAnalysis();
    const revision = this._coverageAnalysisRevision;
    const controller = new AbortController();
    this._coverageAnalysisAbort = controller;
    const signal = controller.signal;
    const turboRevision = this._turboRequestCount;
    const turboSignal = this._turboAbortController?.signal;
    const abortFromCoverage = () => controller.abort();
    turboSignal?.addEventListener("abort", abortFromCoverage, { once: true });
    const current = () => !signal.aborted && revision === this._coverageAnalysisRevision && turboRevision === this._turboRequestCount && this.state.jimuMapView?.view === jimuMapView.view;
    const progress = (message: string) => { if (current()) this.setState({ coverageAnalysisProgress: message }); };
    this.setState({ coverageAnalysisLoading: true, coverageAnalysisProgress: "Fetching streets…" });
    let stage: "roads" | "imagery" | "classification" = "roads";

    try {
      // 1. Current View Bounding Box
      const extent = jimuMapView.view.extent;
      const geo = webMercatorUtils.webMercatorToGeographic(extent) as __esri.Extent;
      const { xmin: west, ymin: south, xmax: east, ymax: north } = geo;

      // 2. Fetch OSM Road Network (with Overpass retry mechanism)
      const query = OVERPASS_ROAD_QUERY(south, west, north, east);
      const fetchOverpass = async (): Promise<{ ok: boolean; status: number; data: any }> => {
        const request = new AbortController();
        const abort = () => request.abort();
        signal.addEventListener("abort", abort, { once: true });
        const timer = setTimeout(() => request.abort(), 35000);
        try {
          if (signal.aborted) request.abort();
          const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query, signal: request.signal });
          if (response.status === 429) {
            const header = response.headers?.get("Retry-After");
            let delay = 60000;
            if (header && /^\d+$/.test(header.trim()) && Number.isFinite(Number(header))) delay = Math.max(1000, Number(header) * 1000);
            else if (header && Number.isFinite(Date.parse(header)) && Date.parse(header) > Date.now()) delay = Date.parse(header) - Date.now();
            this._coverageRoadRetryAt = Date.now() + delay;
          }
          return { ok: response.ok, status: response.status, data: response.ok ? await response.json() : null };
        } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
      };

      let resp = await fetchOverpass();
      if (!resp.ok && resp.status === 504) {
        this.showToast("Road server timed out; retrying once in 3s…", 3000);
        progress("Street server busy; retrying…");
        await coverageAnalysisDelay(3000, signal);
        progress("Fetching streets…");
        resp = await fetchOverpass();
      }

      if (!resp.ok) {
        if (resp.status === 504) throw new Error("Road network server is busy (504). Please try again in a moment.");
        if (resp.status === 429) throw new Error(`Road server is rate-limited (429). Try again in ${Math.ceil((this._coverageRoadRetryAt - Date.now()) / 1000)} seconds.`);
        throw new Error(`Overpass API error: ${resp.status}`);
      }

      if (!current()) return;
      const osmData = resp.data;
      if (!osmData || osmData.remark || !Array.isArray(osmData.elements)) throw new Error("Road server returned incomplete data. Please retry later; previous results are preserved.");
      const segments = parseOverpassRoads(osmData);
      if (!segments.length) {
        this.showToast("No road network found in this area.");
        return;
      }

      // 3. Inset Inner Bounding Box (Edge Truncation Filter)
      const innerBbox = insetBbox([west, south, east, north], STREET_COVERAGE_CONFIG.ANALYSIS_INSET_METERS);
      const innerSegments = segments.filter((seg) => segmentMidpointInBbox(seg, innerBbox));
      if (!innerSegments.length) {
        this.showToast("Analysis area too small after edge filtering. Zoom out slightly.");
        return;
      }

      this.log(`Coverage analysis: ${segments.length} total segments → ${innerSegments.length} inner segments (${segments.length - innerSegments.length} edge segments excluded)`);

      stage = "imagery";
      progress("Loading imagery coverage…");

      // 5. Visit the original filtered tile points, not a sampled display layer.
      let points: [number, number][] = [];
      let pointTimestamps: (number | null)[] = [];
      if (!turboSignal || turboSignal.aborted) throw new Error("Turbo coverage is not active.");
      await this.visitTurboCoverage([west, south, east, north], this.getTurboFilters(), signal, (point: TurboPoint) => {
        points.push([point.lon, point.lat]);
        pointTimestamps.push(point.capturedAt);
        if (points.length % 25000 === 0) progress(`Loading imagery: ${points.length.toLocaleString()} points…`);
      });
      if (!current()) return;
      if (!points.length) {
        this.showToast("No coverage points found for this area and the selected filters.");
        return;
      }

      // 6. Snap Points to Road Segments & Classify Tiers
      stage = "classification";
      progress("Classifying roads…");
      const coverage = await classifyCoverageAsync(
        points,
        innerSegments,
        STREET_COVERAGE_CONFIG.SNAP_THRESHOLD_METERS,
        STREET_COVERAGE_CONFIG.MIN_POINTS_PER_SEGMENT,
        STREET_COVERAGE_CONFIG.HIGHWAY_THRESHOLDS,
        pointTimestamps,
        { signal, onProgress: (completed: number, total: number) => progress(completed === 0 ? "Indexing imagery…" : `Classifying roads: ${completed.toLocaleString()} / ${total.toLocaleString()}`),
          onTransferred: () => { points = []; pointTimestamps = []; } },
      );
      if (!current()) return;

      // 7. Store Results in State
      this.stopCoverageRendering();
      this._coverageAnalysisBbox = [west, south, east, north];
      this.drawCoverageZone(innerBbox);
      this._coverageSegments = innerSegments;
      this._coverageCoveredFlags = coverage.segmentTiers.map((t) => t !== "none");
      this._coverageSegmentTiers = coverage.segmentTiers;

      this.setState({ coverageResult: coverage, coverageSegmentsVisible: false });
      this.log(`Coverage: ${coverage.percentCovered}% covered; fresh:${coverage.freshCount} aging:${coverage.agingCount} stale:${coverage.staleCount} none:${coverage.noneCount}`);
    } catch (err) {
      if (!current()) return;
      console.error("Coverage analysis failed:", err);

      const isTimeout = err instanceof DOMException && err.name === "AbortError";

      const message = isTimeout ? "Road network request timed out. Please try again later."
        : err instanceof TypeError && /fetch|network/i.test(err.message)
          ? stage === "roads" ? "Could not reach the road server. Check your connection or try again later."
            : stage === "imagery" ? "Mapillary imagery coverage could not load. Check your connection or try again later."
            : "Background analysis could not finish. Please retry."
          : err instanceof Error ? err.message : "Coverage analysis failed. Please retry.";
      this.showToast(message, 5000);
    } finally {
      turboSignal?.removeEventListener("abort", abortFromCoverage);
      if (revision === this._coverageAnalysisRevision) {
        this._coverageAnalysisAbort = null;
        this.setState({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });
      }
    }
  };

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
      this._coverageSegmentsLayer = new GraphicsLayer({ id:"coverage-segments-layer", title:"Classified Street Coverage", listMode:"hide" });
      view.map.add(this._coverageSegmentsLayer);
      this._coverageRenderWatch = view.watch("stationary", (stationary: boolean) => { if (stationary) void this.refreshCoverageViewport(view); });
      await this.refreshCoverageViewport(view);
    } catch (error) {
      if (revision === this._coverageRenderRevision) { this.stopCoverageRendering(); this.setState({ coverageSegmentsVisible: false }); this.showToast("Unable to initialize classified streets.",4000); }
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
      } catch (e) {}

      this._routePointAGraphic = null;
    }

    if (this._routePointBGraphic) {
      try {
        oldView?.graphics?.remove(this._routePointBGraphic);
      } catch (e) {}

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

    const zoneGraphic = new Graphic({
      geometry: {
        type: "polygon",
        rings: [
          [
            [west, south],
            [east, south],
            [east, north],
            [west, north],
            [west, south],
          ],
        ],
        spatialReference: {
          wkid: 4326,
        },
      },

      symbol: {
        type: "simple-fill",

        color: is3D ? [30, 144, 255, 0.04] : [30, 144, 255, 0.14],

        outline: {
          type: "simple-line",
          color: [30, 144, 255, 1],
          width: is3D ? 4 : 3,
          style: "solid",
        },
      } as any,
    });

    (zoneGraphic as any).__isCoverageZone = true;
    jimuMapView.view.graphics.add(zoneGraphic);
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

  /** Calculates segment length in meters. */
  private getCaptureSegmentLengthMeters = (seg: any): number => {
    if (!seg?.start || !seg?.end) return 0;
    return distanceMeters(seg.start[1], seg.start[0], seg.end[1], seg.end[0]);
  };

  /** Calculates the geographic midpoint [lon, lat] of a segment. */
  private getCaptureSegmentMidpoint = (seg: any): [number, number] => {
    return [(seg.start[0] + seg.end[0]) / 2, (seg.start[1] + seg.end[1]) / 2];
  };

  /** Collects, scores, and prioritizes missing (none) and stale segments for routing. */
  private buildCaptureTargetSegments = (): RouteTargetSegment[] => {
    // Score against the completed analysis area, even while Jimu detaches its view.
    const center = this.state.jimuMapView?.view?.center;
    const bbox = this._coverageAnalysisBbox;
    const centerLon = center?.longitude ?? (bbox ? (bbox[0] + bbox[2]) / 2 : NaN);
    const centerLat = center?.latitude ?? (bbox ? (bbox[1] + bbox[3]) / 2 : NaN);
    if (!Number.isFinite(centerLon) || !Number.isFinite(centerLat)) return [];

    const drivableTypes = new Set([
      "motorway",
      "motorway_link",
      "trunk",
      "trunk_link",
      "primary",
      "primary_link",
      "secondary",
      "secondary_link",
      "tertiary",
      "tertiary_link",
      "unclassified",
      "residential",
      "living_street",
      "service",
    ]);

    const targets: RouteTargetSegment[] = [];

    this._coverageSegments.forEach((seg: any, index: number) => {
      const tier = this._coverageSegmentTiers[index];
      if (tier !== "none" && tier !== "stale") return;
      if (!drivableTypes.has(seg.highwayType)) return;

      const midpoint = this.getCaptureSegmentMidpoint(seg);
      const lengthMeters = this.getCaptureSegmentLengthMeters(seg);
      if (lengthMeters < this.CAPTURE_ROUTE_CONFIG.minimumUsefulSegmentLengthMeters) return;

      const distanceFromCenterMeters = distanceMeters(midpoint[1], midpoint[0], centerLat, centerLon);
      const lengthScore = Math.log10(Math.max(10, lengthMeters));
      const freshnessScore = tier === "none" ? this.CAPTURE_ROUTE_CONFIG.nonePriority : this.CAPTURE_ROUTE_CONFIG.stalePriority;
      const centerScore = 1 / (1 + distanceFromCenterMeters / 5000);

      const priority = lengthScore * this.CAPTURE_ROUTE_CONFIG.lengthWeight * freshnessScore * (1 + this.CAPTURE_ROUTE_CONFIG.centerDistanceWeight * centerScore);

      targets.push({ seg, index, tier, midpoint, lengthMeters, distanceFromCenterMeters, priority, clusterId: -1 });
    });

    return targets;
  };

  /**
   * Executes the multi-pass route optimization pipeline:
   * Targets -> Initial Anchors -> OSRM -> Evaluation -> Refinement Passes -> Best Route Draw
   */
  private generateCaptureRoute = async () => {
    const { routeStartPoint, routeEndPoint, routeSpareMinutes } = this.state;

    if (!routeStartPoint || !routeEndPoint) {
      this.showToast("Lütfen haritadan A (Başlangıç) ve B (Bitiş) noktalarını seçin!", 3500);
      return;
    }

    await this.generateEsriDetourRoute(routeStartPoint, routeEndPoint, routeSpareMinutes || 15);
  };

  /** Draws the generated route onto the map with a purple line and outer glow effect. */
  private async drawCaptureRoute(pathsData: any) {
    const { jimuMapView } = this.state;
    const view = jimuMapView?.view;
    if (!view?.map || view.destroyed || !this.ArcGISModules) return;

    if (!this._routeGraphicLayer) {
      const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
      this._routeGraphicLayer = new GraphicsLayer({
        id: "capture-route-layer",
        title: "Mapillary Capture Route",
      });
      view.map.add(this._routeGraphicLayer);
    }
    this._routeGraphicLayer.removeAll();

    const { Graphic } = this.ArcGISModules;

    // Normalize input into a 3D paths array whether it is an array of paths or GeoJSON
    let polylinePaths: number[][][] = [];
    if (Array.isArray(pathsData)) {
      polylinePaths = Array.isArray(pathsData[0][0]) ? pathsData : [pathsData];
    } else if (pathsData?.coordinates) {
      polylinePaths = Array.isArray(pathsData.coordinates[0][0]) ? pathsData.coordinates : [pathsData.coordinates];
    }
    if (polylinePaths.length === 0) return;

    // 1. Outer Glow Effect
    this._routeGraphicLayer.add(
      new Graphic({
        geometry: { type: "polyline", paths: polylinePaths, spatialReference: { wkid: 4326 } },
        symbol: { type: "simple-line", color: [168, 85, 247, 0.35], width: 8 } as any,
      }),
    );

    // 2. Main Purple Line (Centre Line)
    this._routeGraphicLayer.add(
      new Graphic({
        geometry: { type: "polyline", paths: polylinePaths, spatialReference: { wkid: 4326 } },
        symbol: { type: "simple-line", color: [168, 85, 247, 1], width: 3.5, style: "solid" } as any,
      }),
    );
  }

  // CLEAR CAPTURE ROUTE
  private clearCaptureRoute = () => {
    if (this._routeGraphicLayer) this._routeGraphicLayer.removeAll();
    this.setState({ routeData: null });
  };

  // Exports the generated route as a GPX file.
  private downloadRouteGPX = () => downloadCaptureRouteGPX(this.state.routeData);

  /**
   * Generates a low-cost capture route:
   *
   * 1. Solve one ArcGIS baseline A → B route.
   * 2. Build stale / missing target segments locally.
   * 3. Generate capture opportunities locally around the baseline.
   * 4. Select opportunities locally using the spare-time budget.
   * 5. Build a small, ordered set of capture stops.
   * 6. Solve the final ArcGIS route once.
   * 7. If the real route exceeds the budget, remove the least efficient
   *    opportunity and perform one additional final solve.
   *
   * ArcGIS is used only as the final network routing engine.
   * It is NOT used to evaluate every candidate opportunity.
   */

  /*
   * ------------------------------------------------------------
   * ROUTING AUTHENTICATION
   * ------------------------------------------------------------
   */

  /**
   * Resolves the route service advertised by the current
   * ArcGIS Online / Enterprise portal.
   *
   * Portal() automatically uses Experience Builder's configured
   * portal through the ArcGIS Maps SDK environment.
   */
  private resolvePortalRouteService = async (): Promise<string | null> => {
    try {
      const [Portal] = await loadArcGISJSAPIModules(["esri/portal/Portal"]);

      const portal = new Portal();

      await portal.load();

      const routeUrl = portal.helperServices?.route?.url;

      return routeUrl || null;
    } catch (error) {
      console.warn("[CaptureRoute] " + "Could not discover portal route service:", error);

      return null;
    }
  };

  /**
   * Determines which routing provider should be used.
   *
   * AUTO:
   *
   *   explicit custom service
   *            ↓
   *   signed-in portal service
   *            ↓
   *   configured API key
   *            ↓
   *   anonymous/public portal service
   */
  private resolveRoutingProvider = async (): Promise<ResolvedRoutingProvider> => {
    const routingEngine = this.getEffectiveRoutingEngine();

    const authMode = (this.props.config.routingAuthMode ?? "auto") as RoutingAuthMode;

    const apiKey = String(this.props.config.routingApiKey ?? "").trim();

    /*
     * --------------------------------------------------------
     * 1. ESRI WORLD ROUTE
     * --------------------------------------------------------
     *
     * This is our recommended/default capture-route engine.
     */
    if (routingEngine === "world") {
      /*
       * Explicit API-key mode.
       */
      if (authMode === "api-key") {
        if (!apiKey) {
          throw new Error("Routing API key is not configured.");
        }

        return {
          kind: "api-key",

          routeUrl: ARCGIS_LOCATION_ROUTE_URL,

          apiKey,

          label: "Esri World Route · API Key",
        };
      }

      /*
       * Automatic mode:
       *
       * If the Experience author supplied an API key,
       * use it so anonymous users do not need to sign in.
       */
      if (authMode === "auto" && apiKey) {
        return {
          kind: "api-key",

          routeUrl: ARCGIS_LOCATION_ROUTE_URL,

          apiKey,

          label: "Esri World Route · API Key",
        };
      }

      /*
       * USER mode, or AUTO without an API key.
       *
       * No API key is attached.
       *
       * In Step 4 we will explicitly establish/sign in
       * an ArcGIS user session before the solve.
       */
      return {
        kind: "user",

        routeUrl: ARCGIS_LOCATION_ROUTE_URL,

        label: "Esri World Route · ArcGIS User",
      };
    }

    /*
     * --------------------------------------------------------
     * 2. ORGANIZATION / PORTAL ROUTE
     * --------------------------------------------------------
     *
     * Never selected automatically anymore.
     *
     * The Experience author must explicitly choose it.
     */
    if (routingEngine === "portal") {
      const portalRouteUrl = await this.resolvePortalRouteService();

      if (!portalRouteUrl) {
        throw new Error("No routing service is configured " + "for this ArcGIS portal.");
      }

      return {
        kind: "portal",

        routeUrl: portalRouteUrl,

        label: "Organization Route",
      };
    }

    /*
     * --------------------------------------------------------
     * 3. CUSTOM ROUTE SERVICE
     * --------------------------------------------------------
     */
    if (routingEngine === "custom") {
      const customRouteUrl = String(this.props.config.routingServiceUrl ?? "").trim();

      if (!customRouteUrl) {
        throw new Error("Custom routing service URL " + "is not configured.");
      }

      return {
        kind: "custom",

        routeUrl: customRouteUrl,

        label: "Custom Route Service",
      };
    }

    /*
     * Defensive fallback.
     */
    throw new Error("Unsupported routing configuration.");
  };

  private isRoutingAuthenticationError = (error: any): boolean => {
    const status = Number(error?.details?.httpStatus ?? error?.response?.status ?? error?.status ?? error?.code);

    if (status === 401 || status === 403 || status === 498 || status === 499) {
      return true;
    }

    const message = String(error?.message ?? error?.details?.message ?? error ?? "").toLowerCase();

    return (
      message.includes("token") ||
      message.includes("credential") ||
      message.includes("authentication") ||
      message.includes("unauthorized") ||
      message.includes("not authorized") ||
      message.includes("forbidden")
    );
  };

  private solveRouteWithProvider = async (
    provider: ResolvedRoutingProvider,

    routeParameters: any,
  ): Promise<any> => {
    const { route } = this.ArcGISModules;

    /*
     * API-key authorization.
     *
     * Never append the key to the URL.
     */
    if (provider.kind === "api-key" && provider.apiKey) {
      routeParameters.apiKey = provider.apiKey;
    } else {
      /*
       * Important when reusing RouteParameters:
       *
       * Make sure an old API key isn't accidentally
       * carried into another authentication mode.
       */
      routeParameters.apiKey = null;
    }

    return await route.solve(provider.routeUrl, routeParameters);
  };

  private createCaptureRoutingProvider = async (): Promise<RoutingProvider> => {
    const routingEngine = this.getEffectiveRoutingEngine();

    /*
     * ========================================================
     * OSRM
     * ========================================================
     */
    if (routingEngine === "osrm") {
      const serverMode = this.props.config.osrmServerMode ?? "public";

      let baseUrl: string;

      if (serverMode === "custom") {
        baseUrl = String(this.props.config.osrmServerUrl ?? "").trim();

        if (!baseUrl) {
          throw new Error("Custom OSRM server URL is not configured.");
        }
      } else {
        baseUrl = PUBLIC_OSRM_BASE_URL;
      }

      const provider = createOSRMRoutingProvider({
        baseUrl,

        profile: "driving",

        label: serverMode === "custom" ? "OSRM · Custom Server" : "OSRM · Public Demo",
      });

      this.log(`[CaptureRoute] Routing provider: ` + `${provider.label}`);

      this.log(`[CaptureRoute] OSRM server: ` + `${baseUrl}`);

      return provider;
    }

    /*
     * ========================================================
     * ARCGIS
     * ========================================================
     *
     * Existing ArcGIS resolution remains responsible for:
     *
     * - World Route
     * - Organization / Portal Route
     * - Custom ArcGIS Route
     */
    const resolved = await this.resolveRoutingProvider();

    const providerKind = resolved.kind === "portal" ? "arcgis-portal" : resolved.kind === "custom" ? "arcgis-custom" : "arcgis-world";

    const provider = createArcGISRoutingProvider({
      route: this.ArcGISModules.route,

      networkService: this.ArcGISModules.networkService,

      RouteParameters: this.ArcGISModules.RouteParameters,

      FeatureSet: this.ArcGISModules.FeatureSet,

      Graphic: this.ArcGISModules.Graphic,

      Point: this.ArcGISModules.Point,

      routeUrl: resolved.routeUrl,

      apiKey: resolved.kind === "api-key" ? resolved.apiKey : undefined,

      kind: providerKind,

      label: resolved.label,

      travelMode: this.state.routeTravelMode,
    });

    this.log(`[CaptureRoute] Routing provider: ` + `${provider.label}`);

    this.log(`[CaptureRoute] ArcGIS route service: ` + `${resolved.routeUrl}`);

    return provider;
  };

  private _routingLoginExpiry: ReturnType<typeof setTimeout> | null = null;
  private _coverageOwnerMap: __esri.Map | null = null;

  private coverageLayerForView(view: __esri.MapView | __esri.SceneView): __esri.VectorTileLayer {
    const existing = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | undefined;
    if (existing && !existing.destroyed) { this._coverageOwnerMap = view.map; this.mapillaryVTLayer = existing; return existing; }
    if (existing) view.map.remove(existing);
    const reusable = this.mapillaryVTLayer && !this.mapillaryVTLayer.destroyed && (!this._coverageOwnerMap || this._coverageOwnerMap === view.map);
    const layer = reusable ? this.mapillaryVTLayer : new this.ArcGISModules.VectorTileLayer({ id: LAYER_IDS.COVERAGE_VT, title: "Mapillary Coverage", style: turboTileStyle(`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`, {}, false, [], YEAR_COLOR_PALETTE) });
    view.map.add(layer);
    this._coverageOwnerMap = view.map; this.mapillaryVTLayer = layer;
    return layer;
  }

  private _routingLoginView: { type: string; viewpoint: __esri.Viewpoint } | null = null;

  private rememberRoutingLoginView() {
    if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);
    this._routingLoginExpiry = null;
    const view = this.state.jimuMapView?.view;
    this._routingLoginView = view?.viewpoint ? { type: view.type, viewpoint: view.viewpoint.clone() } : null;
  }

  private async restoreRoutingLoginView(view: __esri.MapView | __esri.SceneView): Promise<void> {
    const saved = this._routingLoginView;
    if (!saved || !view || view.type !== saved.type || view.destroyed) return;
    try {
      await view.when();
      if (this._routingLoginView !== saved || this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
      // A cloned Viewpoint retains 3D camera position, heading and tilt as well as scale.
      await view.goTo(saved.viewpoint.clone(), { animate: false });
    } catch (error) {
      if ((error as any)?.name !== "AbortError") console.warn("[CaptureRoute] Could not restore the pre-sign-in viewpoint:", error);
    }
  }

  private generateEsriDetourRoute = async (startPt: [number, number], endPt: [number, number], spareMinutes: number) => {
    const { jimuMapView } = this.state;

    if (!jimuMapView?.view?.map || jimuMapView.view.destroyed) {
      this.showToast("Map view is reconnecting. Wait for the map, then generate the route again.", 4500);
      return;
    }
    if (!this._coverageSegments || this._coverageSegments.length === 0) {
      this.showToast("Run Street Coverage Analysis first.", 3000);
      return;
    }

    if (!this.ArcGISModules || this.state.isGeneratingRoute) return;
    if (this.getEffectiveRoutingEngine() !== "osrm") this.rememberRoutingLoginView();

    this.setState({
      isGeneratingRoute: true,
      routeData: null,
      routeGenerationProgress: null,
    });

    try {
      /*
       * Resolve routing authentication ONCE.
       *
       * The provider may change from portal → API key
       * if AUTO fallback is required during baseline solve.
       */
      const routingProvider = await this.createCaptureRoutingProvider();

      /*
       * Helpers
       */

      this.setState({
        routeGenerationProgress: {
          usedMinutes: 0,
          budgetMinutes: spareMinutes,
        },
      });

      this.log("[CaptureRoute] Solving baseline A → B...");

      this.log("[CaptureRoute] Test input:", {
        start: startPt,
        end: endPt,

        spareMinutes,

        coverageSegments: this._coverageSegments?.length ?? 0,

        coverageTiers: this._coverageSegmentTiers
          ? {
              fresh: this._coverageSegmentTiers.filter((tier) => tier === "fresh").length,

              aging: this._coverageSegmentTiers.filter((tier) => tier === "aging").length,

              stale: this._coverageSegmentTiers.filter((tier) => tier === "stale").length,

              none: this._coverageSegmentTiers.filter((tier) => tier === "none").length,
            }
          : null,
      });

      const baselineRoute = await routingProvider.solve({
        stops: [startPt, endPt],

        preserveStopOrder: true,

        preserveEndpoints: true,
      });

      /*
       * The optimizer no longer needs to know how
       * ArcGIS represented these values internally.
       */
      const currentView = this.state.jimuMapView?.view;
      if (currentView) await this.restoreRoutingLoginView(currentView);

      const baselineMinutes = baselineRoute.durationMinutes;

      const baselineDistanceMeters = baselineRoute.distanceMeters;

      const baselineKilometers = baselineDistanceMeters / 1000;

      const baselinePaths = baselineRoute.paths;

      const baselineCoordinates: [number, number][] = baselinePaths.flatMap((path) => path);

      if (baselineCoordinates.length < 2) {
        throw new Error("Baseline route geometry is empty.");
      }

      /*
       * Used only for local opportunity scoring.
       *
       * This is NOT used to replace ArcGIS routing.
       */
      const baselineSpeedMetersPerMinute = baselineMinutes > 0 ? baselineDistanceMeters / baselineMinutes : 400;

      this.log(`[CaptureRoute] Baseline: ` + `${baselineKilometers.toFixed(2)} km / ` + `${baselineMinutes.toFixed(1)} min`);

      this.log(`[CaptureRoute] Extra budget: ` + `${spareMinutes.toFixed(1)} min`);

      /*
       * 2. TARGET SEGMENTS
       * buildCaptureTargetSegments() already knows which OSM
       * segments are NONE / STALE.
       * No ArcGIS call happens here.
       */

      const allTargets = this.buildCaptureTargetSegments();

      if (!allTargets.length) {
        this.showToast("No stale or missing roads found in this analysis area.", 3500);
        return;
      }

      /*
       * Convert widget target objects into the optimizer's
       * RouteTargetSegment structure.
       */
      const optimizerTargets = allTargets;

      if (!optimizerTargets.length) {
        this.showToast("No stale or missing roads found in this analysis area.", 3500);

        return;
      }

      this.log(`[CaptureRoute] Target segments: ` + `${optimizerTargets.length}`);

      /*
       * 3. ADAPTIVE LOCAL OPPORTUNITY GENERATION
       *
       * Start with the normal narrow corridor.
       *
       * Only expand farther from the A → B baseline when:
       *
       *   1. all opportunities in the current corridor were exhausted
       *   2. we still have substantial estimated spare-time budget
       *   3. another corridor width is available
       *
       * This keeps normal routes local while allowing short A → B
       * routes with large spare-time budgets to search farther away.
       */

      const corridorWidths = this.CAPTURE_ROUTE_CONFIG.captureCorridorWidthsMeters;

      let opportunities: CaptureOpportunity[] = [];

      let selection: ReturnType<typeof selectCaptureOpportunities> | null = null;

      let selectedCorridorWidth = corridorWidths[0] ?? this.CAPTURE_ROUTE_CONFIG.corridorWidthMeters;

      /*
       * TRY EACH CORRIDOR
       */

      for (let corridorIndex = 0; corridorIndex < corridorWidths.length; corridorIndex++) {
        const corridorWidth = corridorWidths[corridorIndex];

        this.log(`[CaptureRoute] Evaluating corridor: ` + `${corridorWidth} m`);

        /*
         * BUILD OPPORTUNITIES FOR THIS CORRIDOR
         */

        const currentOpportunities = buildCaptureOpportunities(optimizerTargets, baselineCoordinates, baselineSpeedMetersPerMinute, corridorWidth);

        this.log("[CaptureRoute] Active limits:", {
          maxSelectedOpportunities: this.CAPTURE_ROUTE_CONFIG.maxSelectedOpportunities,

          maxFinalStops: this.CAPTURE_ROUTE_CONFIG.maxFinalStops,

          maxAnchorsPerOpportunity: this.CAPTURE_ROUTE_CONFIG.maxAnchorsPerOpportunity,
        });
        /*
         * SELECT OPPORTUNITIES WITHIN USER'S TIME BUDGET
         */

        const currentSelection = selectCaptureOpportunities(currentOpportunities, spareMinutes);

        /*
         * Keep this pass as the current best/final candidate.
         *
         * If we decide to expand, the next iteration replaces these.
         */
        opportunities = currentOpportunities;

        selection = currentSelection;

        selectedCorridorWidth = corridorWidth;

        /*
         * CORRIDOR DIAGNOSTICS
         */

        this.log(
          `[CaptureRoute] Corridor ${corridorWidth}m: ` +
            `${currentOpportunities.length} opportunities, ` +
            `${currentSelection.opportunities.length} selected, ` +
            `${currentSelection.estimatedExtraMinutes.toFixed(1)} min, ` +
            `stop=${currentSelection.stopReason}`,
        );

        /*
         * SHOULD WE TRY A WIDER CORRIDOR?
         */

        const isLastCorridor = corridorIndex === corridorWidths.length - 1;

        /*
         * How much of the user's requested spare time do we
         * currently expect to consume?
         *
         * Example:
         *
         *   estimated = 17 min
         *   budget    = 30 min
         *
         *   ratio = 0.57
         */
        const estimatedBudgetUseRatio = spareMinutes > 0 ? currentSelection.estimatedExtraMinutes / spareMinutes : 1;

        /*
         * Expand ONLY when:
         *
         * - there is another corridor available
         * - selection ran out of useful opportunities
         * - we are still using less than the configured fraction
         *   of the user's spare-time budget
         *
         * Do NOT expand when:
         *
         * - budget already stopped selection
         * - anchor capacity stopped selection
         * - opportunity safety cap stopped selection
         */
        const shouldExpand = !isLastCorridor && currentSelection.stopReason === "exhausted" && estimatedBudgetUseRatio < this.CAPTURE_ROUTE_CONFIG.corridorExpansionBudgetUseRatio;

        if (!shouldExpand) {
          break;
        }

        /*
         * Diagnostic explaining why another pass is happening.
         */
        const nextCorridorWidth = corridorWidths[corridorIndex + 1];

        this.log(
          `[CaptureRoute] Expanding capture corridor ` +
            `${corridorWidth}m → ` +
            `${nextCorridorWidth}m ` +
            `(` +
            `${currentSelection.estimatedExtraMinutes.toFixed(1)}/` +
            `${spareMinutes.toFixed(1)} min estimated` +
            `)`,
        );
      }

      /*
       * VALIDATE FINAL ADAPTIVE SELECTION
       */

      if (!selection) {
        throw new Error("Capture opportunity selection failed.");
      }

      this.log(`[CaptureRoute] Selected corridor: ` + `${selectedCorridorWidth} m`);

      this.log(`[CaptureRoute] Opportunities: ` + `${opportunities.length}`);

      this.log(`[CaptureRoute] Opportunity segment counts: ` + opportunities.map((opportunity) => opportunity.segments.length).join(", "));

      if (!opportunities.length) {
        this.showToast("No suitable stale/missing roads found near your A → B route.", 4500);

        return;
      }

      /*
       * 4. FINAL LOCAL TIME-BUDGET SELECTION RESULT
       *
       * `selection` now represents the result from whichever corridor
       * was ultimately selected: 180m, 250m, or 350m.
       */

      this.log(`[CaptureRoute] Selected opportunities: ` + `${selection.opportunities.length}`);

      this.log(`[CaptureRoute] Estimated extra time: ` + `${selection.estimatedExtraMinutes.toFixed(1)} min`);

      this.log(`[CaptureRoute] Estimated capture: ` + `${selection.estimatedCaptureMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Selection stop reason: ` + `${selection.stopReason}`);

      this.log(`[CaptureRoute] Selected anchor slots: ` + `${selection.usedAnchorSlots}/` + `${this.CAPTURE_ROUTE_CONFIG.maxFinalStops}`);
      const anchorDistribution = selection.opportunities.reduce(
        (acc, opportunity) => {
          const count = opportunity.routePoints.length;

          if (count === 1) acc.one++;
          else if (count === 2) acc.two++;
          else acc.three++;

          return acc;
        },
        {
          one: 0,
          two: 0,
          three: 0,
        },
      );

      this.log(`[CaptureRoute] Anchor distribution: ` + `1=${anchorDistribution.one}, ` + `2=${anchorDistribution.two}, ` + `3=${anchorDistribution.three}`);

      const threeAnchorDiagnostics = selection.opportunities
        .filter((opportunity) => opportunity.routePoints.length === 3)
        .map((opportunity) => ({
          id: opportunity.id,

          segments: opportunity.segments.length,

          novelMeters: Math.round(opportunity.novelMeters),

          totalLengthMeters: Math.round(opportunity.lengthMeters),

          estimatedMinutes: Number(opportunity.estimatedDetourMinutes.toFixed(2)),

          tier: opportunity.tier,
        }))
        .sort((a, b) => a.novelMeters - b.novelMeters);

      this.log("[CaptureRoute] 3-anchor detail:\n" + JSON.stringify(threeAnchorDiagnostics, null, 2));

      this.log(`[CaptureRoute] Rejected by budget: ` + `${selection.rejectedForBudgetCount}`);

      this.log(`[CaptureRoute] Rejected by anchor cap: ` + `${selection.rejectedForAnchorCount}`);

      if (!selection.opportunities.length) {
        this.showToast(`No beneficial capture detour found within ${spareMinutes} minutes.`, 4000);

        return;
      }

      /*
       * Show the LOCAL estimate while the final network route
       * is being solved.
       */
      this.setState({
        routeGenerationProgress: {
          usedMinutes: selection.estimatedExtraMinutes,
          budgetMinutes: spareMinutes,
        },
      });

      /*
       * 5. FINAL ROUTE SOLVE
       * We deliberately keep the number of stops small.
       *
       * buildFinalRouteStops() should already:
       *   - order opportunities along A → B
       *   - create 2–3 useful anchors per opportunity
       *   - avoid unnecessary dense waypoint generation
       * The ArcGIS server receives the already ordered stops.
       *
       * findBestSequence = false
       * means ArcGIS does NOT perform another stop optimization.
       */

      let activeOpportunities = [...selection.opportunities];

      /*
       * Full candidate pool from the selected corridor.
       *
       * Some opportunities may be removed by OSRM preflight.
       * Once we have a valid route, we can cheaply test whether
       * replacing a retained low-value opportunity with one of
       * these excluded opportunities improves capture value.
       */
      const replacementCandidatePool = [...opportunities];

      /*
       * Never re-add opportunities proven intrinsically unsafe,
       * such as badly snapped anchors or broken same-opportunity
       * traversal.
       */
      const permanentlyRejectedOpportunityIds = new Set<string>();

      let osrmReplacementPassesUsed = 0;

      const maxOsrmReplacementPasses = 2;

      /*
       * Diagnostic helper.
       *
       * Mirrors buildFinalRouteStops() so every accepted
       * capture stop can be traced back to the opportunity
       * that created it.
       *
       * IMPORTANT:
       * Keep this in sync with buildFinalRouteStops().
       */
      const buildCaptureStopOwners = (opportunities: CaptureOpportunity[]): string[] => {
        const acceptedStops: [number, number][] = [];
        const owners: string[] = [];

        for (const opportunity of opportunities) {
          for (const point of opportunity.routePoints) {
            /*
             * First point is always accepted.
             */
            if (!acceptedStops.length) {
              acceptedStops.push(point);
              owners.push(opportunity.id);
              continue;
            }

            /*
             * Mirror buildFinalRouteStops():
             * ignore consecutive anchors closer than 8 m.
             */
            const previous = acceptedStops[acceptedStops.length - 1];

            const d = distanceMeters(previous[1], previous[0], point[1], point[0]);

            if (d >= 8) {
              acceptedStops.push(point);
              owners.push(opportunity.id);
            }
          }
        }

        /*
         * Mirror the final-stop cap too.
         */
        return owners.slice(0, this.CAPTURE_ROUTE_CONFIG.maxFinalStops);
      };

      let finalRoute: RoutingResult | null = null;

      let finalRouteOpportunities: CaptureOpportunity[] = [];

      /*
       * BEST ACTUAL ROUTE SEEN
       *
       * A retry after pruning SHOULD normally be shorter.
       *
       * But road-network topology can occasionally make a later
       * waypoint set produce a worse route.
       *
       * Keep the best actual ArcGIS result as a safety fallback.
       */
      let bestRoute: RoutingResult | null = null;

      let bestRouteOpportunities: CaptureOpportunity[] = [];

      let bestActualExtraMinutes = Infinity;

      let finalAttemptCount = 0;

      for (let attempt = 0; attempt < this.CAPTURE_ROUTE_CONFIG.maxFinalRouteSolves; attempt++) {
        finalAttemptCount++;
        /*
         * Build stops from the CURRENT set of opportunities.
         *
         * If the previous real ArcGIS solve exceeded the budget,
         * the opportunity set may have been batch-pruned before
         * reaching this attempt.
         */

        let captureStops = buildFinalRouteStops(activeOpportunities);

        let captureStopOwners = buildCaptureStopOwners(activeOpportunities);

        if (!captureStops.length) {
          finalRoute = null;
          break;
        }

        /*
         * --------------------------------------------------------
         * OSRM PREFLIGHT PRUNING
         * --------------------------------------------------------
         *
         * OSRM can reveal pathological ordered waypoint transitions
         * before we spend one of our authoritative route solves.
         *
         * Example:
         *   25 m direct
         *   3.6 km routed
         *
         * If the complete ordered preflight is already far above
         * the user's spare-time budget, remove low-value /
         * high-cost opportunities first and rebuild the stops.
         *
         * This does NOT consume a final route solve.
         */
        if (routingProvider.preflightOrderedStops) {
          const maxPreflightPrunePasses = Math.min(12, Math.max(1, activeOpportunities.length - 1));
          const hardSnapRejectMeters = 60;

          let lastPreflightExtraMinutes: number | null = null;

          for (let preflightPass = 0; preflightPass < maxPreflightPrunePasses; preflightPass++) {
            const preflightStops: [number, number][] = [startPt, ...captureStops, endPt];

            const preflight = await routingProvider.preflightOrderedStops(preflightStops);
            /*
             * Convert preflight stop indices back to the
             * opportunity that supplied each capture anchor.
             *
             * preflightStops:
             *
             *   0      = START
             *   1..N   = capture anchors
             *   N + 1  = END
             */
            const ownerForStop = (stopIndex: number): string => {
              if (stopIndex === 0) {
                return "START";
              }

              if (stopIndex === captureStopOwners.length + 1) {
                return "END";
              }

              return captureStopOwners[stopIndex - 1] ?? "UNKNOWN";
            };

            const snapDiagnostics = (preflight.waypointSnapDistancesMeters ?? [])
              .map((snapDistanceMeters, index) => ({
                stopIndex: index,
                owner: ownerForStop(index),

                snapDistanceMeters: Number(snapDistanceMeters.toFixed(1)),
              }))
              .filter((item) => item.stopIndex > 0 && item.stopIndex < preflightStops.length - 1)
              .sort((a, b) => b.snapDistanceMeters - a.snapDistanceMeters);

            const badSnapDiagnostics = snapDiagnostics.filter((item) => item.snapDistanceMeters > 40);

            if (badSnapDiagnostics.length) {
              this.log("[CaptureRoute] OSRM capture anchors snapping >40m:\n" + JSON.stringify(badSnapDiagnostics, null, 2));
            }

            const hardBadSnapOwners = new Set(
              snapDiagnostics
                .filter((item) => item.snapDistanceMeters > hardSnapRejectMeters)
                .map((item) => item.owner)
                .filter((owner) => owner !== "START" && owner !== "END"),
            );

            if (hardBadSnapOwners.size) {
              for (const owner of hardBadSnapOwners) {
                permanentlyRejectedOpportunityIds.add(owner);
              }
              this.log("[CaptureRoute] OSRM removing badly snapped opportunities: " + Array.from(hardBadSnapOwners).join(", "));

              activeOpportunities = activeOpportunities.filter((opportunity) => !hardBadSnapOwners.has(opportunity.id));

              captureStops = buildFinalRouteStops(activeOpportunities);

              captureStopOwners = buildCaptureStopOwners(activeOpportunities);

              if (!captureStops.length) {
                break;
              }

              /*
               * Re-run preflight with the cleaned
               * stop set before doing network
               * penalty analysis.
               */
              continue;
            }

            const projectedExtraMinutes = preflight.durationMinutes - baselineMinutes;

            lastPreflightExtraMinutes = projectedExtraMinutes;

            const preflightLegs = preflight.legDurationMinutes.map((durationMinutes, index) => {
              const fromPoint = preflightStops[index];

              const toPoint = preflightStops[index + 1];

              const directMeters = fromPoint && toPoint ? distanceMeters(fromPoint[1], fromPoint[0], toPoint[1], toPoint[0]) : 0;

              return {
                fromStop: index,
                fromOwner: ownerForStop(index),

                toStop: index + 1,
                toOwner: ownerForStop(index + 1),

                directMeters: Math.round(directMeters),

                durationMinutes: Number(durationMinutes.toFixed(2)),
              };
            });

            const worstPreflightLegs = [...preflightLegs].sort((a, b) => b.durationMinutes - a.durationMinutes).slice(0, 10);

            this.log(
              `[CaptureRoute] OSRM preflight ${preflightPass + 1}: ` + `${preflight.durationMinutes.toFixed(1)} min total / ` + `${projectedExtraMinutes.toFixed(1)} min extra`,
            );

            this.log("[CaptureRoute] OSRM preflight worst legs:\n" + JSON.stringify(worstPreflightLegs, null, 2));

            const preflightTolerance = this.CAPTURE_ROUTE_CONFIG.finalBudgetToleranceMinutes ?? 0.25;

            const budgetFits = projectedExtraMinutes <= spareMinutes + preflightTolerance;

            /*
             * --------------------------------------------------------
             * NETWORK QUALITY GATE
             * --------------------------------------------------------
             *
             * A short geometric transition that requires several
             * minutes of driving usually indicates:
             *
             * - divided road / median
             * - one-way incompatibility
             * - ramp / interchange topology
             * - anchor ordering that forces a large loop
             *
             * START and END are excluded because endpoint access
             * may be inherently expensive and unavoidable.
             */
            const pathologicalInternalLegs = preflightLegs.filter(
              (leg) =>
                /*
                 * A hard quality failure only exists when
                 * two anchors belonging to the SAME opportunity
                 * require an absurd network detour.
                 */
                leg.fromOwner !== "START" &&
                leg.fromOwner !== "END" &&
                leg.fromOwner !== "UNKNOWN" &&
                leg.fromOwner === leg.toOwner &&
                leg.directMeters <= 450 &&
                leg.durationMinutes >= 4.5,
            );
            this.log("[CaptureRoute] SAME-OWNER quality guard active");

            const networkQualityFits = pathologicalInternalLegs.length === 0;
            const qualityCleanupMode = budgetFits && !networkQualityFits;

            const pathologicalOwnerIds = new Set<string>();

            for (const leg of pathologicalInternalLegs) {
              pathologicalOwnerIds.add(leg.fromOwner);

              pathologicalOwnerIds.add(leg.toOwner);
            }

            if (pathologicalInternalLegs.length) {
              this.log("[CaptureRoute] OSRM pathological internal legs:\n" + JSON.stringify(pathologicalInternalLegs, null, 2));
            }

            if (budgetFits && networkQualityFits) {
              /*
               * --------------------------------------------------------
               * NETWORK-AWARE REPLACEMENT
               * --------------------------------------------------------
               *
               * We already have a valid route.
               *
               * Before accepting it, try a few one-for-one replacements:
               *
               *   remove retained opportunity A
               *   add excluded opportunity B
               *   restore baselinePosition order
               *   ask OSRM Table
               *
               * We never scramble the A -> B ordering.
               */
              if (osrmReplacementPassesUsed < maxOsrmReplacementPasses) {
                const allowedExtraMinutes = spareMinutes + preflightTolerance;

                const activeIds = new Set(activeOpportunities.map((opportunity) => opportunity.id));

                /*
                 * Highest-value excluded opportunities first.
                 *
                 * Permanently bad opportunities are excluded.
                 */
                const addCandidates = replacementCandidatePool
                  .filter((opportunity) => !activeIds.has(opportunity.id) && !permanentlyRejectedOpportunityIds.has(opportunity.id) && opportunity.valueMeters > 0)
                  .sort((a, b) => b.valueMeters - a.valueMeters)
                  .slice(0, 5);

                /*
                 * Lowest-value retained opportunities are the most
                 * natural things to trade away.
                 */
                const removeCandidates = [...activeOpportunities].sort((a, b) => a.valueMeters - b.valueMeters).slice(0, 5);

                const activeAnchorCount = activeOpportunities.reduce((sum, opportunity) => sum + opportunity.routePoints.length, 0);

                const replacementPairs: Array<{
                  add: CaptureOpportunity;

                  remove: CaptureOpportunity;

                  valueGain: number;

                  baselineGap: number;
                }> = [];

                for (const add of addCandidates) {
                  for (const remove of removeCandidates) {
                    const valueGain = add.valueMeters - remove.valueMeters;

                    /*
                     * Require a meaningful improvement.
                     */
                    if (valueGain <= 25) {
                      continue;
                    }

                    /*
                     * Do not create a trial that exceeds our
                     * configured route-anchor capacity.
                     */
                    const trialAnchorCount = activeAnchorCount - remove.routePoints.length + add.routePoints.length;

                    if (trialAnchorCount > this.CAPTURE_ROUTE_CONFIG.maxFinalStops) {
                      continue;
                    }

                    replacementPairs.push({
                      add,

                      remove,

                      valueGain,

                      baselineGap: Math.abs(add.baselinePosition - remove.baselinePosition),
                    });
                  }
                }

                /*
                 * Prefer the largest capture-value improvement.
                 *
                 * For similar gains, prefer geographically/local-baseline
                 * replacements because they are less likely to cause
                 * severe topology changes.
                 */
                replacementPairs.sort((a, b) => b.valueGain - a.valueGain || a.baselineGap - b.baselineGap);

                const probePairs = replacementPairs.slice(0, 5);

                let bestReplacement: {
                  opportunities: CaptureOpportunity[];

                  addId: string;

                  removeId: string;

                  extraMinutes: number;

                  valueGain: number;
                } | null = null;

                for (const pair of probePairs) {
                  /*
                   * Replace exactly one opportunity and restore
                   * monotonic A -> B baseline ordering.
                   */
                  const trialOpportunities = activeOpportunities
                    .filter((opportunity) => opportunity.id !== pair.remove.id)
                    .concat(pair.add)
                    .sort((a, b) => a.baselinePosition - b.baselinePosition);

                  const trialCaptureStops = buildFinalRouteStops(trialOpportunities);

                  const trialCaptureOwners = buildCaptureStopOwners(trialOpportunities);

                  const trialStops: [number, number][] = [startPt, ...trialCaptureStops, endPt];

                  const trialPreflight = await routingProvider.preflightOrderedStops!(trialStops);

                  const trialExtraMinutes = trialPreflight.durationMinutes - baselineMinutes;

                  const trialOwnerForStop = (stopIndex: number): string => {
                    if (stopIndex === 0) {
                      return "START";
                    }

                    if (stopIndex === trialCaptureOwners.length + 1) {
                      return "END";
                    }

                    return trialCaptureOwners[stopIndex - 1] ?? "UNKNOWN";
                  };

                  /*
                   * Reject newly introduced >60 m snapping.
                   */
                  const trialHasBadSnap = (trialPreflight.waypointSnapDistancesMeters ?? []).some(
                    (snapMeters, index) => index > 0 && index < trialStops.length - 1 && snapMeters > hardSnapRejectMeters,
                  );

                  /*
                   * Reject broken full-road traversal.
                   *
                   * Same rule as the normal quality gate:
                   * the failure must occur INSIDE one opportunity.
                   */
                  const trialHasBrokenOpportunity = trialPreflight.legDurationMinutes.some((durationMinutes, index) => {
                    const fromOwner = trialOwnerForStop(index);

                    const toOwner = trialOwnerForStop(index + 1);

                    if (fromOwner === "START" || fromOwner === "END" || fromOwner === "UNKNOWN" || fromOwner !== toOwner) {
                      return false;
                    }

                    const fromPoint = trialStops[index];

                    const toPoint = trialStops[index + 1];

                    if (!fromPoint || !toPoint) {
                      return false;
                    }

                    const directMeters = distanceMeters(fromPoint[1], fromPoint[0], toPoint[1], toPoint[0]);

                    return directMeters <= 450 && durationMinutes >= 4.5;
                  });

                  const trialFits = trialExtraMinutes <= allowedExtraMinutes;

                  this.log(
                    `[CaptureRoute] OSRM replacement probe: ` +
                      `remove ${pair.remove.id} / ` +
                      `add ${pair.add.id} → ` +
                      `${trialExtraMinutes.toFixed(1)} min extra · ` +
                      `weighted value +${pair.valueGain.toFixed(0)} · ` +
                      `snap=${trialHasBadSnap ? "bad" : "ok"} · ` +
                      `quality=${trialHasBrokenOpportunity ? "bad" : "ok"}`,
                  );

                  /*
                   * If the added opportunity itself introduces an
                   * intrinsic hard failure, stop considering it later.
                   *
                   * The existing active route was already clean, so a
                   * newly appearing hard snap / same-owner failure is
                   * strong evidence against the added opportunity.
                   */
                  if (trialHasBadSnap || trialHasBrokenOpportunity) {
                    permanentlyRejectedOpportunityIds.add(pair.add.id);

                    continue;
                  }

                  if (!trialFits) {
                    continue;
                  }

                  /*
                   * Primary objective:
                   * maximize useful capture value.
                   *
                   * Tie-break:
                   * use more of the available time budget.
                   */
                  if (
                    !bestReplacement ||
                    pair.valueGain > bestReplacement.valueGain ||
                    (pair.valueGain === bestReplacement.valueGain && trialExtraMinutes > bestReplacement.extraMinutes)
                  ) {
                    bestReplacement = {
                      opportunities: trialOpportunities,

                      addId: pair.add.id,

                      removeId: pair.remove.id,

                      extraMinutes: trialExtraMinutes,

                      valueGain: pair.valueGain,
                    };
                  }
                }

                if (bestReplacement) {
                  this.log(
                    `[CaptureRoute] OSRM chosen replacement: ` +
                      `remove ${bestReplacement.removeId} / ` +
                      `add ${bestReplacement.addId} → ` +
                      `${bestReplacement.extraMinutes.toFixed(1)} min extra · ` +
                      `value +${bestReplacement.valueGain.toFixed(0)}`,
                  );

                  activeOpportunities = bestReplacement.opportunities;

                  captureStops = buildFinalRouteStops(activeOpportunities);

                  captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                  osrmReplacementPassesUsed++;

                  /*
                   * The replacement trial itself was already validated,
                   * but rerun the normal preflight loop so all diagnostics
                   * and subsequent replacement decisions use the new set.
                   */
                  lastPreflightExtraMinutes = bestReplacement.extraMinutes;

                  continue;
                }
              }

              /*
               * Fits budget, full-road quality is good,
               * and no better replacement was found.
               */
              break;
            }

            /*
             * Nothing useful left to prune.
             */
            if (activeOpportunities.length <= 1) {
              break;
            }

            /*
             * --------------------------------------------------------
             * OSRM NETWORK-AWARE PRUNING
             * --------------------------------------------------------
             *
             * Prefer removing opportunities that participate in
             * unusually expensive OSRM legs.
             *
             * This runs BEFORE the generic value/time pruning below.
             */

            const badLegThresholdMinutes = Math.max(2.0, Math.min(4.0, spareMinutes * 0.08));

            const networkPenaltyByOpportunity = new Map<string, number>();

            const addNetworkPenalty = (owner: string, minutes: number) => {
              if (!owner || owner === "START" || owner === "END" || owner === "UNKNOWN") {
                return;
              }

              networkPenaltyByOpportunity.set(owner, (networkPenaltyByOpportunity.get(owner) ?? 0) + minutes);
            };

            for (const leg of preflightLegs) {
              /*
               * Once the time budget already fits, we are no longer
               * trying to make the route shorter generally.
               *
               * We are only repairing pathological internal topology.
               * Do not penalize START/END access during this phase.
               */
              if (qualityCleanupMode && (leg.fromOwner === "START" || leg.fromOwner === "END" || leg.toOwner === "START" || leg.toOwner === "END")) {
                continue;
              }
              const excessMinutes = leg.durationMinutes - badLegThresholdMinutes;

              if (excessMinutes <= 0) {
                continue;
              }

              /*
               * Same opportunity on both ends:
               *
               * this is the strongest evidence that the opportunity's
               * own anchor chain is expensive on the OSRM road network.
               */
              if (leg.fromOwner === leg.toOwner) {
                addNetworkPenalty(leg.fromOwner, excessMinutes);

                continue;
              }

              /*
               * START/END transition:
               *
               * assign the complete penalty to the capture opportunity.
               */
              if (leg.fromOwner === "START" || leg.fromOwner === "END" || leg.fromOwner === "UNKNOWN") {
                addNetworkPenalty(leg.toOwner, excessMinutes);

                continue;
              }

              if (leg.toOwner === "START" || leg.toOwner === "END" || leg.toOwner === "UNKNOWN") {
                addNetworkPenalty(leg.fromOwner, excessMinutes);

                continue;
              }

              /*
               * Transition between two capture opportunities.
               *
               * We cannot know which endpoint alone caused the
               * topology penalty, so split the penalty between them.
               */
              addNetworkPenalty(leg.fromOwner, excessMinutes * 0.5);

              addNetworkPenalty(leg.toOwner, excessMinutes * 0.5);
            }

            /*
             * Prioritize large network penalty relative to the
             * useful target metres supplied by the opportunity.
             */
            const networkPruneCandidates = activeOpportunities
              .map((opportunity) => {
                const networkPenaltyMinutes = networkPenaltyByOpportunity.get(opportunity.id) ?? 0;

                const penaltyPer100Meters = (networkPenaltyMinutes / Math.max(100, opportunity.valueMeters)) * 100;

                return {
                  opportunity,
                  networkPenaltyMinutes,
                  penaltyPer100Meters,
                };
              })
              .filter((candidate) => {
                if (candidate.networkPenaltyMinutes <= 0) {
                  return false;
                }

                /*
                 * If the budget already fits, only consider
                 * opportunities directly participating in a
                 * pathological internal transition.
                 */
                if (qualityCleanupMode && !pathologicalOwnerIds.has(candidate.opportunity.id)) {
                  return false;
                }

                return true;
              })
              .sort((a, b) => b.penaltyPer100Meters - a.penaltyPer100Meters || b.networkPenaltyMinutes - a.networkPenaltyMinutes);

            /*
             * Do not batch-delete a dozen opportunities.
             *
             * Remove at most two network offenders, then ask OSRM
             * again because topology changes non-linearly.
             */
            if (networkPruneCandidates.length) {
              const allowedExtraMinutes = spareMinutes + preflightTolerance;

              const overrunRatio = projectedExtraMinutes / Math.max(1, allowedExtraMinutes);
              /*
               * --------------------------------------------------------
               * NEAR-BUDGET SURGICAL PRUNING
               * --------------------------------------------------------
               *
               * When we're only slightly over budget, deleting the single
               * highest-penalty opportunity can cause a huge non-linear
               * topology collapse.
               *
               * Instead, cheaply probe several one-opportunity removals
               * with OSRM Table and choose the candidate that lands closest
               * to the budget without introducing a broken same-opportunity
               * traversal.
               */
              const budgetOverrunMinutes = projectedExtraMinutes - allowedExtraMinutes;

              if (budgetOverrunMinutes > 0 && budgetOverrunMinutes <= 5 && networkPruneCandidates.length > 1) {
                const probeCandidates = networkPruneCandidates.slice(0, Math.min(5, networkPruneCandidates.length));

                let bestProbe: {
                  opportunityId: string;
                  extraMinutes: number;
                  valueLostMeters: number;
                  reliefMinutes: number;
                  valueLossPerReliefMinute: number;
                } | null = null;

                for (const probeCandidate of probeCandidates) {
                  if (activeOpportunities.length <= 1) {
                    break;
                  }

                  const trialOpportunities = activeOpportunities
                    .filter((opportunity) => opportunity.id !== probeCandidate.opportunity.id)
                    .sort((a, b) => a.baselinePosition - b.baselinePosition);

                  const trialCaptureStops = buildFinalRouteStops(trialOpportunities);

                  const trialCaptureOwners = buildCaptureStopOwners(trialOpportunities);

                  const trialStops: [number, number][] = [startPt, ...trialCaptureStops, endPt];

                  const trialPreflight = await routingProvider.preflightOrderedStops!(trialStops);

                  const trialExtraMinutes = trialPreflight.durationMinutes - baselineMinutes;

                  const trialOwnerForStop = (stopIndex: number): string => {
                    if (stopIndex === 0) {
                      return "START";
                    }

                    if (stopIndex === trialCaptureOwners.length + 1) {
                      return "END";
                    }

                    return trialCaptureOwners[stopIndex - 1] ?? "UNKNOWN";
                  };

                  /*
                   * Reject a trial if one selected opportunity
                   * still contains an absurd internal traversal.
                   */
                  const trialHasBrokenOpportunity = trialPreflight.legDurationMinutes.some((durationMinutes, index) => {
                    const fromOwner = trialOwnerForStop(index);

                    const toOwner = trialOwnerForStop(index + 1);

                    if (fromOwner === "START" || fromOwner === "END" || fromOwner === "UNKNOWN" || fromOwner !== toOwner) {
                      return false;
                    }

                    const fromPoint = trialStops[index];

                    const toPoint = trialStops[index + 1];

                    if (!fromPoint || !toPoint) {
                      return false;
                    }

                    const directMeters = distanceMeters(fromPoint[1], fromPoint[0], toPoint[1], toPoint[0]);

                    return directMeters <= 450 && durationMinutes >= 4.5;
                  });

                  const trialFits = trialExtraMinutes <= allowedExtraMinutes;

                  this.log(
                    `[CaptureRoute] OSRM near-budget probe: ` +
                      `remove ${probeCandidate.opportunity.id} → ` +
                      `${trialExtraMinutes.toFixed(1)} min extra · ` +
                      `weighted value lost=${probeCandidate.opportunity.valueMeters.toFixed(0)}m · ` +
                      `quality=${trialHasBrokenOpportunity ? "bad" : "ok"}`,
                  );

                  if (!trialFits || trialHasBrokenOpportunity) {
                    continue;
                  }

                  const reliefMinutes = projectedExtraMinutes - trialExtraMinutes;

                  const valueLostMeters = probeCandidate.opportunity.valueMeters;

                  /*
                   * How much useful-road value must we sacrifice
                   * for each minute of route time recovered?
                   *
                   * Lower is better.
                   */
                  const valueLossPerReliefMinute = valueLostMeters / Math.max(0.25, reliefMinutes);

                  if (
                    !bestProbe ||
                    valueLossPerReliefMinute < bestProbe.valueLossPerReliefMinute - 0.5 ||
                    (Math.abs(valueLossPerReliefMinute - bestProbe.valueLossPerReliefMinute) <= 0.5 && trialExtraMinutes > bestProbe.extraMinutes)
                  ) {
                    bestProbe = {
                      opportunityId: probeCandidate.opportunity.id,

                      extraMinutes: trialExtraMinutes,

                      valueLostMeters,

                      reliefMinutes,

                      valueLossPerReliefMinute,
                    };
                  }
                }

                if (bestProbe) {
                  this.log(
                    `[CaptureRoute] OSRM near-budget chosen removal: ` +
                      `${bestProbe.opportunityId} → ` +
                      `${bestProbe.extraMinutes.toFixed(1)} min extra · ` +
                      `lost=${bestProbe.valueLostMeters.toFixed(0)}m · ` +
                      `relief=${bestProbe.reliefMinutes.toFixed(1)} min · ` +
                      `cost=${bestProbe.valueLossPerReliefMinute.toFixed(1)}m/min`,
                  );

                  activeOpportunities = activeOpportunities
                    .filter((opportunity) => opportunity.id !== bestProbe!.opportunityId)
                    .sort((a, b) => a.baselinePosition - b.baselinePosition);

                  captureStops = buildFinalRouteStops(activeOpportunities);

                  captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                  continue;
                }
              }
              /*
               * Adaptive OSRM network pruning.
               *
               * When the ordered route is catastrophically over budget,
               * removing only 1–2 opportunities per preflight pass wastes
               * requests and may hit the preflight-pass ceiling before
               * converging.
               *
               * As we approach the budget, pruning becomes conservative
               * again because road-network topology is non-linear.
               */
              let targetedRemovalLimit = 1;

              if (overrunRatio >= 3.0) {
                targetedRemovalLimit = 6;
              } else if (overrunRatio >= 2.0) {
                targetedRemovalLimit = 4;
              } else if (overrunRatio >= 1.4) {
                targetedRemovalLimit = 2;
              }

              this.log(
                `[CaptureRoute] OSRM adaptive prune: ` +
                  `${projectedExtraMinutes.toFixed(1)}/${allowedExtraMinutes.toFixed(1)} min ` +
                  `(${overrunRatio.toFixed(2)}x) → ` +
                  `remove up to ${targetedRemovalLimit}`,
              );

              const networkRemoveIds = new Set<string>();

              for (const candidate of networkPruneCandidates) {
                if (networkRemoveIds.size >= targetedRemovalLimit) {
                  break;
                }

                if (activeOpportunities.length - networkRemoveIds.size <= 1) {
                  break;
                }

                networkRemoveIds.add(candidate.opportunity.id);

                this.log(
                  `[CaptureRoute] OSRM network removing: ` +
                    `${candidate.opportunity.id} · ` +
                    `penalty=${candidate.networkPenaltyMinutes.toFixed(1)} min · ` +
                    `${candidate.penaltyPer100Meters.toFixed(2)} min/100m`,
                );
              }

              if (networkRemoveIds.size) {
                /*
                 * If the route already fits the time budget and we are
                 * pruning only because a SAME-OPPORTUNITY traversal is
                 * pathological, do not allow that opportunity back later.
                 */
                if (qualityCleanupMode) {
                  for (const id of networkRemoveIds) {
                    permanentlyRejectedOpportunityIds.add(id);
                  }
                }
                activeOpportunities = activeOpportunities.filter((opportunity) => !networkRemoveIds.has(opportunity.id)).sort((a, b) => a.baselinePosition - b.baselinePosition);

                captureStops = buildFinalRouteStops(activeOpportunities);

                captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                this.log(`[CaptureRoute] OSRM network pruned ` + `${networkRemoveIds.size} opportunity(s).`);

                if (!captureStops.length) {
                  break;
                }

                /*
                 * Re-run OSRM immediately with the altered topology.
                 *
                 * Do NOT run the generic batch-pruner during this pass.
                 */
                continue;
              }
            }

            /*
             * --------------------------------------------------------
             * NEAR-BUDGET GENERIC SINGLE-REMOVAL GUARD
             * --------------------------------------------------------
             *
             * The network-specific candidate list can become empty
             * even though OSRM is only a few minutes over budget.
             *
             * In that case NEVER fall through to the generic
             * multi-opportunity batch pruner.
             *
             * Probe ordinary active opportunities one at a time
             * with OSRM Table and remove at most ONE per pass.
             */
            const nearBudgetAllowedExtraMinutes = spareMinutes + preflightTolerance;

            const nearBudgetOverrunMinutes = projectedExtraMinutes - nearBudgetAllowedExtraMinutes;

            if (nearBudgetOverrunMinutes > 0 && nearBudgetOverrunMinutes <= 5 && activeOpportunities.length > 1) {
              /*
               * Start with the least efficient opportunities,
               * but Table determines the real network result.
               */
              const genericProbeCandidates = [...activeOpportunities]
                .map((opportunity) => ({
                  opportunity,

                  efficiency: opportunity.valueMeters / Math.max(0.25, opportunity.estimatedDetourMinutes),
                }))
                .sort((a, b) => a.efficiency - b.efficiency)
                .slice(0, 5);

              let bestFittingProbe: {
                opportunityId: string;
                extraMinutes: number;
                valueLost: number;
                reliefMinutes: number;
                costPerReliefMinute: number;
              } | null = null;

              /*
               * If none of the five removals gets completely
               * under budget, still remember the best SINGLE
               * removal so we make progress without batch pruning.
               */
              let bestProgressProbe: {
                opportunityId: string;
                extraMinutes: number;
                valueLost: number;
              } | null = null;

              for (const candidate of genericProbeCandidates) {
                const trialOpportunities = activeOpportunities
                  .filter((opportunity) => opportunity.id !== candidate.opportunity.id)
                  .sort((a, b) => a.baselinePosition - b.baselinePosition);

                const trialCaptureStops = buildFinalRouteStops(trialOpportunities);

                const trialCaptureOwners = buildCaptureStopOwners(trialOpportunities);

                const trialStops: [number, number][] = [startPt, ...trialCaptureStops, endPt];

                const trialPreflight = await routingProvider.preflightOrderedStops!(trialStops);

                const trialExtraMinutes = trialPreflight.durationMinutes - baselineMinutes;

                const trialOwnerForStop = (stopIndex: number): string => {
                  if (stopIndex === 0) {
                    return "START";
                  }

                  if (stopIndex === trialCaptureOwners.length + 1) {
                    return "END";
                  }

                  return trialCaptureOwners[stopIndex - 1] ?? "UNKNOWN";
                };

                /*
                 * Preserve the same full-road quality rule.
                 */
                const trialHasBrokenOpportunity = trialPreflight.legDurationMinutes.some((durationMinutes, index) => {
                  const fromOwner = trialOwnerForStop(index);

                  const toOwner = trialOwnerForStop(index + 1);

                  if (fromOwner === "START" || fromOwner === "END" || fromOwner === "UNKNOWN" || fromOwner !== toOwner) {
                    return false;
                  }

                  const fromPoint = trialStops[index];

                  const toPoint = trialStops[index + 1];

                  if (!fromPoint || !toPoint) {
                    return false;
                  }

                  const directMeters = distanceMeters(fromPoint[1], fromPoint[0], toPoint[1], toPoint[0]);

                  return directMeters <= 450 && durationMinutes >= 4.5;
                });

                this.log(
                  `[CaptureRoute] OSRM generic near-budget probe: ` +
                    `remove ${candidate.opportunity.id} → ` +
                    `${trialExtraMinutes.toFixed(1)} min extra · ` +
                    `weighted value lost=${candidate.opportunity.valueMeters.toFixed(0)} · ` +
                    `quality=${trialHasBrokenOpportunity ? "bad" : "ok"}`,
                );

                if (trialHasBrokenOpportunity) {
                  continue;
                }

                /*
                 * Track the best one-removal improvement even
                 * when it does not completely fit yet.
                 */
                if (trialExtraMinutes < projectedExtraMinutes - 0.1 && (!bestProgressProbe || trialExtraMinutes < bestProgressProbe.extraMinutes)) {
                  bestProgressProbe = {
                    opportunityId: candidate.opportunity.id,

                    extraMinutes: trialExtraMinutes,

                    valueLost: candidate.opportunity.valueMeters,
                  };
                }

                if (trialExtraMinutes > nearBudgetAllowedExtraMinutes) {
                  continue;
                }

                const reliefMinutes = projectedExtraMinutes - trialExtraMinutes;

                const valueLost = candidate.opportunity.valueMeters;

                const costPerReliefMinute = valueLost / Math.max(0.25, reliefMinutes);

                if (
                  !bestFittingProbe ||
                  costPerReliefMinute < bestFittingProbe.costPerReliefMinute - 0.5 ||
                  (Math.abs(costPerReliefMinute - bestFittingProbe.costPerReliefMinute) <= 0.5 && trialExtraMinutes > bestFittingProbe.extraMinutes)
                ) {
                  bestFittingProbe = {
                    opportunityId: candidate.opportunity.id,

                    extraMinutes: trialExtraMinutes,

                    valueLost,

                    reliefMinutes,

                    costPerReliefMinute,
                  };
                }
              }

              /*
               * Prefer a removal that actually fits.
               * Otherwise take the best SINGLE step toward
               * the budget and preflight again.
               */
              const chosenNearBudgetProbe = bestFittingProbe ?? bestProgressProbe;

              if (chosenNearBudgetProbe) {
                this.log(
                  `[CaptureRoute] OSRM generic near-budget chosen removal: ` +
                    `${chosenNearBudgetProbe.opportunityId} → ` +
                    `${chosenNearBudgetProbe.extraMinutes.toFixed(1)} min extra`,
                );

                activeOpportunities = activeOpportunities
                  .filter((opportunity) => opportunity.id !== chosenNearBudgetProbe.opportunityId)
                  .sort((a, b) => a.baselinePosition - b.baselinePosition);

                captureStops = buildFinalRouteStops(activeOpportunities);

                captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                /*
                 * Critical:
                 * never reach the generic batch pruner
                 * from near-budget mode.
                 */
                continue;
              }

              /*
               * Extremely defensive fallback:
               *
               * none of the Table probes improved the route.
               * Still remove AT MOST ONE opportunity instead
               * of allowing a 5-10 opportunity batch deletion.
               */
              const fallbackCandidate = genericProbeCandidates[0]?.opportunity;

              if (fallbackCandidate) {
                this.log(`[CaptureRoute] OSRM generic near-budget one-at-a-time fallback: ` + `${fallbackCandidate.id}`);

                activeOpportunities = activeOpportunities.filter((opportunity) => opportunity.id !== fallbackCandidate.id).sort((a, b) => a.baselinePosition - b.baselinePosition);

                captureStops = buildFinalRouteStops(activeOpportunities);

                captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                continue;
              }

              break;
            }
            const activeEstimatedMinutes = activeOpportunities.reduce((sum, opportunity) => sum + Math.max(0, opportunity.estimatedDetourMinutes), 0);

            /*
             * Calibrate the local opportunity estimate against
             * what OSRM says this ordered waypoint chain costs.
             */
            const preflightRatio = projectedExtraMinutes / Math.max(0.25, activeEstimatedMinutes);

            const correctionFactor = Math.min(6.0, Math.max(1.0, preflightRatio));

            const allowedExtraMinutes = spareMinutes + preflightTolerance;

            /*
             * Leave a reserve because removing opportunities can
             * change network topology in non-linear ways.
             */
            const preflightSafetyFactor = 0.85;

            const targetEstimatedMinutes = Math.max(0, (allowedExtraMinutes / correctionFactor) * preflightSafetyFactor);

            const estimatedMinutesToRemove = Math.max(0.25, activeEstimatedMinutes - targetEstimatedMinutes);

            this.log(
              `[CaptureRoute] OSRM preflight prune: ` +
                `actual/local=${correctionFactor.toFixed(2)}, ` +
                `active=${activeEstimatedMinutes.toFixed(1)} min, ` +
                `target=${targetEstimatedMinutes.toFixed(1)} min, ` +
                `remove≈${estimatedMinutesToRemove.toFixed(1)} min`,
            );

            /*
             * Remove the least efficient opportunities first.
             *
             * IMPORTANT:
             * sort a COPY, not activeOpportunities itself,
             * because activeOpportunities must remain A → B ordered.
             */
            const pruneCandidates = activeOpportunities
              .map((opportunity) => ({
                opportunity,

                efficiency: opportunity.valueMeters / Math.max(0.25, opportunity.estimatedDetourMinutes),
              }))
              .sort((a, b) => a.efficiency - b.efficiency);

            const removeIds = new Set<string>();

            let removedEstimatedMinutes = 0;

            for (const candidate of pruneCandidates) {
              /*
               * Always leave at least one opportunity.
               */
              if (activeOpportunities.length - removeIds.size <= 1) {
                break;
              }

              removeIds.add(candidate.opportunity.id);

              removedEstimatedMinutes += Math.max(0, candidate.opportunity.estimatedDetourMinutes);

              this.log(`[CaptureRoute] OSRM preflight removing: ` + `${candidate.opportunity.id} ` + `(${candidate.opportunity.estimatedDetourMinutes.toFixed(1)} min est)`);

              if (removedEstimatedMinutes >= estimatedMinutesToRemove) {
                break;
              }
            }

            /*
             * Safety: if nothing was removable, stop preflight pruning.
             */
            if (!removeIds.size) {
              break;
            }

            activeOpportunities = activeOpportunities.filter((opportunity) => !removeIds.has(opportunity.id)).sort((a, b) => a.baselinePosition - b.baselinePosition);

            /*
             * Rebuild the actual anchor list from the surviving
             * opportunities before running another preflight.
             */
            captureStops = buildFinalRouteStops(activeOpportunities);
            captureStopOwners = buildCaptureStopOwners(activeOpportunities);

            this.log(`[CaptureRoute] OSRM preflight pruned ` + `${removeIds.size} opportunities / ` + `${removedEstimatedMinutes.toFixed(1)} estimated minutes.`);

            this.log(`[CaptureRoute] OSRM preflight pruned ` + `${removeIds.size} opportunities / ` + `${removedEstimatedMinutes.toFixed(1)} estimated minutes.`);

            if (!captureStops.length) {
              break;
            }
          }

          if (lastPreflightExtraMinutes !== null) {
            this.log(`[CaptureRoute] OSRM preflight finished: ` + `${lastPreflightExtraMinutes.toFixed(1)} min extra`);
          }
        }

        /*
         * Preflight may have changed activeOpportunities,
         * so captureStops now represents the final set that
         * will actually be sent to the authoritative solve.
         */
        if (!captureStops.length) {
          finalRoute = null;
          break;
        }

        const solvedOpportunities = [...activeOpportunities];

        this.log(`[CaptureRoute] Final stops: ` + `${captureStops.length}`);

        const finalStops: [number, number][] = [startPt, ...captureStops, endPt];
        const result = await routingProvider.solve({
          stops: finalStops,

          preserveStopOrder: true,

          preserveEndpoints: true,
        });

        finalRoute = result;

        finalRouteOpportunities = solvedOpportunities;

        const finalMinutes = finalRoute.durationMinutes;

        const actualExtraMinutes = finalMinutes - baselineMinutes;

        /*
         * REMEMBER BEST ACTUAL SOLVE
         */
        if (actualExtraMinutes < bestActualExtraMinutes) {
          bestActualExtraMinutes = actualExtraMinutes;

          bestRoute = finalRoute;

          bestRouteOpportunities = [...solvedOpportunities];
        }

        this.log(`[CaptureRoute] Final: ` + `${finalMinutes.toFixed(1)} min`);

        this.log(`[CaptureRoute] Actual extra: ` + `${actualExtraMinutes.toFixed(1)} min`);

        /*
         * REAL BUDGET CHECK
         *
         * The local estimate is only an estimate.
         *
         * ArcGIS's actual route time is authoritative here.
         */
        const budgetTolerance = this.CAPTURE_ROUTE_CONFIG.finalBudgetToleranceMinutes ?? 0.25;

        if (actualExtraMinutes <= spareMinutes + budgetTolerance) {
          this.log("[CaptureRoute] Route fits budget.");

          break;
        }

        /*
         * If the route exceeds the budget but there is
         * only one opportunity left, we cannot prune further.
         */
        if (activeOpportunities.length <= 1) {
          this.warn("[CaptureRoute] " + "Route still exceeds budget after pruning limit.");

          break;
        }

        /*
         * BATCH PRUNE FOR NEXT FINAL SOLVE
         *
         * We only have a small number of authoritative ArcGIS solves.
         *
         * Therefore, after seeing the REAL overrun, don't remove just
         * one tiny opportunity. Estimate how much local detour cost
         * must be removed and prune the least efficient opportunities
         * until we reach that amount.
         */

        const hasAnotherSolve = attempt + 1 < this.CAPTURE_ROUTE_CONFIG.maxFinalRouteSolves;

        if (!hasAnotherSolve) {
          console.warn(`[CaptureRoute] Final solve still exceeds budget; ` + `no retry remains.`);

          break;
        }

        /*
         * Local estimated cost of the opportunities represented by
         * this ArcGIS solve.
         */
        const activeEstimatedMinutes = activeOpportunities.reduce((sum, opportunity) => sum + Math.max(0, opportunity.estimatedDetourMinutes), 0);

        /*
         * ArcGIS tells us how optimistic our local estimate was
         * for THIS particular route.
         */
        const actualToEstimatedRatio = actualExtraMinutes / Math.max(0.25, activeEstimatedMinutes);

        /*
         * Preserve the real calibration signal from the
         * authoritative routing engine.
         *
         * Dense street networks can produce actual/local ratios
         * above 2.0 because local opportunity costs are not fully
         * additive once all waypoints are solved together.
         *
         * Keep a defensive upper bound, but do not truncate useful
         * calibration as aggressively as before.
         */
        const correctionFactor = Math.min(6.0, Math.max(1.0, actualToEstimatedRatio));

        const allowedActualExtraMinutes = spareMinutes + budgetTolerance;

        /*
         * Network topology may change after opportunities are
         * removed, so retain a modest reserve for the one remaining
         * authoritative solve.
         */
        const calibrationSafetyFactor = 0.96;

        const targetEstimatedMinutes = Math.max(0, (allowedActualExtraMinutes / correctionFactor) * calibrationSafetyFactor);

        const estimatedMinutesToRemove = Math.max(0.25, activeEstimatedMinutes - targetEstimatedMinutes);

        this.log(
          `[CaptureRoute] Batch prune calibration: ` +
            `actual/local=${correctionFactor.toFixed(2)}, ` +
            `active estimate=${activeEstimatedMinutes.toFixed(1)} min, ` +
            `target estimate=${targetEstimatedMinutes.toFixed(1)} min, ` +
            `remove≈${estimatedMinutesToRemove.toFixed(1)} min`,
        );

        /*
         * Rank using a COPY.
         *
         * Never sort activeOpportunities itself by efficiency,
         * because activeOpportunities must remain in A → B order.
         */
        const pruneCandidates = activeOpportunities
          .map((opportunity) => ({
            opportunity,

            efficiency: opportunity.valueMeters / Math.max(0.25, opportunity.estimatedDetourMinutes),
          }))
          .sort((a, b) => a.efficiency - b.efficiency);

        const removeIds = new Set<string>();

        let removedEstimatedMinutes = 0;

        for (const candidate of pruneCandidates) {
          /*
           * Always leave at least one capture opportunity.
           */
          if (activeOpportunities.length - removeIds.size <= 1) {
            break;
          }

          removeIds.add(candidate.opportunity.id);

          removedEstimatedMinutes += Math.max(0, candidate.opportunity.estimatedDetourMinutes);

          this.log(`[CaptureRoute] Batch removing: ` + `${candidate.opportunity.id} ` + `(${candidate.opportunity.estimatedDetourMinutes.toFixed(1)} min est)`);

          if (removedEstimatedMinutes >= estimatedMinutesToRemove) {
            break;
          }
        }

        /*
         * Remove candidates while preserving the relative A → B
         * ordering of everything that survives.
         */
        activeOpportunities = activeOpportunities.filter((opportunity) => !removeIds.has(opportunity.id)).sort((a, b) => a.baselinePosition - b.baselinePosition);

        this.log(`[CaptureRoute] Batch pruned ` + `${removeIds.size} opportunities / ` + `${removedEstimatedMinutes.toFixed(1)} estimated minutes.`);
      }

      /*
       * FINAL VALIDATION
       */

      if (!finalRoute) {
        throw new Error("Final capture route could not be generated.");
      }

      const finalBudgetTolerance = this.CAPTURE_ROUTE_CONFIG.finalBudgetToleranceMinutes ?? 0.25;

      const lastRouteMinutes = finalRoute.durationMinutes;

      const lastRouteExtraMinutes = lastRouteMinutes - baselineMinutes;

      /*
       * If the retry somehow produced a WORSE route,
       * recover the best ArcGIS result actually seen.
       */
      if (lastRouteExtraMinutes > spareMinutes + finalBudgetTolerance && bestRoute && bestActualExtraMinutes < lastRouteExtraMinutes) {
        console.warn(
          `[CaptureRoute] Final retry was worse. ` +
            `Restoring best solve: ` +
            `${bestActualExtraMinutes.toFixed(1)} min extra ` +
            `instead of ` +
            `${lastRouteExtraMinutes.toFixed(1)} min.`,
        );

        finalRoute = bestRoute;

        finalRouteOpportunities = [...bestRouteOpportunities];
      }

      /*
       * From here onward, these opportunities correspond
       * exactly to the route stored in finalRoute.
       */
      activeOpportunities = [...finalRouteOpportunities];

      const finalMinutes = finalRoute.durationMinutes;

      const finalDistanceMeters = finalRoute.distanceMeters;

      const finalKilometers = finalDistanceMeters / 1000;

      const actualExtraMinutes = finalMinutes - baselineMinutes;

      this.log(`[CaptureRoute] Completed with ` + `${finalAttemptCount} final solve(s).`);

      this.log(`[CaptureRoute] Final distance: ` + `${finalKilometers.toFixed(2)} km`);

      this.log(`[CaptureRoute] Final duration: ` + `${finalMinutes.toFixed(1)} min`);

      this.log(`[CaptureRoute] Final extra: ` + `${actualExtraMinutes.toFixed(1)} min`);

      this.log(`[CaptureRoute] Opportunity novel metres: ` + opportunities.map((opportunity) => opportunity.novelMeters.toFixed(0)).join(", "));

      /*
       * 6. DRAW FINAL ROUTE
       */

      const finalPaths = finalRoute.paths;

      if (!finalPaths.length) {
        throw new Error("Final route geometry is empty.");
      }

      /*
       * ACTUAL ROUTE COVERAGE EVALUATION
       *
       * Evaluate only the opportunities that survived final budget
       * pruning.
       *
       * This tells us how much of the road we INTENDED to capture is
       * actually followed closely by the final ArcGIS route.
       */

      const activeTargetMap = new Map<number, RouteTargetSegment>();

      for (const opportunity of activeOpportunities) {
        for (const segment of opportunity.segments) {
          /*
           * A target belongs to only one opportunity in the normal
           * pipeline, but Map gives us an inexpensive safety net
           * against accidental duplicates.
           */
          activeTargetMap.set(segment.index, segment);
        }
      }

      const activeRouteCoverageTargets = Array.from(activeTargetMap.values()).map((segment) => ({
        index: segment.index,

        tier: segment.tier,

        start: segment.seg.start,

        end: segment.seg.end,

        lengthMeters: segment.lengthMeters,
      }));

      const routeCoverage = evaluateRouteCoverage(
        finalPaths,
        activeRouteCoverageTargets,

        this.CAPTURE_ROUTE_CONFIG.routeCoverageToleranceMeters,

        this.CAPTURE_ROUTE_CONFIG.coverageSampleSpacingMeters,
      );

      const incrementalCoverage = evaluateIncrementalRouteCoverage(
        finalPaths,
        baselinePaths,
        activeRouteCoverageTargets,

        this.CAPTURE_ROUTE_CONFIG.routeCoverageToleranceMeters,

        this.CAPTURE_ROUTE_CONFIG.coverageSampleSpacingMeters,
      );

      const combinedCoordinates: [number, number][] = finalPaths.flatMap((path) => path);

      await this.drawCaptureRoute(finalPaths);

      /*
       * 7. CAPTURE SUMMARY
       *
       * IMPORTANT:
       *
       * Use activeOpportunities, not the original selection,
       * because some opportunities may have been removed during
       * the budget-pruning loop.
       */

      const missingMeters = activeOpportunities.reduce(
        (sum, opportunity) => sum + opportunity.segments.filter((segment) => segment.tier === "none").reduce((segmentSum, segment) => segmentSum + segment.lengthMeters, 0),
        0,
      );

      const staleMeters = activeOpportunities.reduce(
        (sum, opportunity) => sum + opportunity.segments.filter((segment) => segment.tier === "stale").reduce((segmentSum, segment) => segmentSum + segment.lengthMeters, 0),
        0,
      );

      /*
       * This is still the TARGETED capture length,
       * not a mathematically exact measurement of route
       * coverage. The exact partial-coverage calculation can
       * be added separately without another ArcGIS solve.
       */
      const targetedCaptureMeters = missingMeters + staleMeters;

      this.log(`[CaptureRoute] Active opportunities: ` + `${activeOpportunities.length}`);

      this.log(`[CaptureRoute] Targeted NONE: ` + `${missingMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Targeted STALE: ` + `${staleMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Targeted capture: ` + `${targetedCaptureMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Actual targeted route coverage: ` + `${routeCoverage.coveredTargetMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Actual NONE coverage: ` + `${routeCoverage.noneCoveredMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Actual STALE coverage: ` + `${routeCoverage.staleCoveredMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Target realization: ` + `${routeCoverage.coveragePercent.toFixed(1)}%`);

      this.log(`[CaptureRoute] Target segments touched: ` + `${routeCoverage.touchedSegmentCount}/` + `${routeCoverage.segmentResults.length}`);

      this.log(`[CaptureRoute] Target segments fully covered: ` + `${routeCoverage.fullyCoveredSegmentCount}/` + `${routeCoverage.segmentResults.length}`);

      this.log(`[CaptureRoute] Baseline target overlap: ` + `${incrementalCoverage.baselineCoveredMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Final target overlap: ` + `${incrementalCoverage.finalCoveredMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Shared baseline/final overlap: ` + `${incrementalCoverage.sharedCoveredMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Incremental useful coverage: ` + `${incrementalCoverage.incrementalCoveredMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Incremental NONE: ` + `${incrementalCoverage.incrementalNoneMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Incremental STALE: ` + `${incrementalCoverage.incrementalStaleMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Incremental target gain: ` + `${incrementalCoverage.incrementalPercent.toFixed(1)}%`);

      /*
       * FINAL ACTIVE-SELECTION DIAGNOSTICS
       *
       * IMPORTANT:
       *
       * Use activeOpportunities here, not selection.opportunities.
       *
       * selection.opportunities represents the ORIGINAL local
       * selection before ArcGIS budget correction.
       *
       * activeOpportunities represents the exact opportunity set
       * belonging to the final route after batch pruning/fallback.
       */

      const finalSelectedNovelMeters = activeOpportunities.reduce((sum, opportunity) => sum + opportunity.novelMeters, 0);

      const finalSelectedBaselineOverlapMeters = activeOpportunities.reduce((sum, opportunity) => sum + opportunity.baselineOverlapMeters, 0);

      const finalSelectedAnchorCount = activeOpportunities.reduce((sum, opportunity) => sum + opportunity.routePoints.length, 0);

      this.log(`[CaptureRoute] Final selected baseline-new target: ` + `${finalSelectedNovelMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Final selected baseline-overlap target: ` + `${finalSelectedBaselineOverlapMeters.toFixed(0)} m`);

      this.log(`[CaptureRoute] Final novelty-aware anchors: ` + `${finalSelectedAnchorCount}`);

      /*
       * 9. STORE FINAL ROUTE RESULT
       *
       * IMPORTANT:
       *
       * Everything stored here describes the FINAL ArcGIS route
       * after budget correction / pruning.
       *
       * Do not use the original selection.opportunities here.
       */

      this.setState({
        routeData: {
          /*
           * BASIC ROUTE
           */
          distance: finalDistanceMeters,

          duration: finalMinutes * 60,

          geojson: {
            type: "LineString",
            coordinates: combinedCoordinates,
          },

          /*
           * TIME
           */
          baselineDurationMinutes: baselineMinutes,

          extraDurationMinutes: actualExtraMinutes,

          requestedExtraMinutes: spareMinutes,

          /*
           * TARGET REALIZATION
           */

          /*
           * Length of the final selected NONE/STALE
           * target network.
           */
          targetedLengthMeters: activeRouteCoverageTargets.reduce((sum, target) => sum + target.lengthMeters, 0),

          /*
           * Amount of that final selected target network
           * actually traversed by the ArcGIS route.
           */
          coveredTargetLengthMeters: routeCoverage.coveredTargetMeters,

          targetRealizationPercent: routeCoverage.coveragePercent,

          /*
           * GENUINELY NEW USEFUL COVERAGE
           *
           * This is the headline metric.
           *
           * It excludes target road already covered by the
           * normal baseline A → B route.
           */
          usefulCoverageMeters: incrementalCoverage.incrementalCoveredMeters,

          incrementalNoneMeters: incrementalCoverage.incrementalNoneMeters,

          incrementalStaleMeters: incrementalCoverage.incrementalStaleMeters,

          /*
           * FINAL SELECTION
           */
          selectedNovelTargetMeters: finalSelectedNovelMeters,

          selectedBaselineOverlapMeters: finalSelectedBaselineOverlapMeters,

          selectedOpportunityCount: activeOpportunities.length,

          selectedAnchorCount: finalSelectedAnchorCount,

          selectedCorridorWidthMeters: selectedCorridorWidth,

          selectionStopReason: selection.stopReason,

          /*
           * SEGMENT REALIZATION
           */
          touchedSegmentCount: routeCoverage.touchedSegmentCount,

          fullyCoveredSegmentCount: routeCoverage.fullyCoveredSegmentCount,

          totalTargetSegmentCount: routeCoverage.segmentResults.length,

          /*
           * LEGACY COMPATIBILITY
           */
          targetCoveragePercent: routeCoverage.coveragePercent,

          capturedTargetLengthMeters: routeCoverage.coveredTargetMeters,

          totalTargetLengthMeters: routeCoverage.totalTargetMeters,

          remainingTargetLengthMeters: Math.max(0, activeRouteCoverageTargets.reduce((sum, target) => sum + target.lengthMeters, 0) - routeCoverage.coveredTargetMeters),

          capturedSegmentCount: routeCoverage.fullyCoveredSegmentCount,

          totalSegmentCount: routeCoverage.segmentResults.length,
        },
      });

      /*
       * 10. USER FEEDBACK
       */

      this.showToast(
        `🚗 Capture Route Ready · ` + `${actualExtraMinutes.toFixed(0)} min detour · ` + `${(incrementalCoverage.incrementalCoveredMeters / 1000).toFixed(1)} km useful coverage`,
        5000,
      );
    } catch (err) {
      console.error("[CaptureRoute] Error:", err);

      const message = err instanceof Error ? err.message : String(err);

      if (message.startsWith("Routing is not configured") || message.startsWith("No routing service is configured")) {
        this.showToast(message, 6000);
      } else if (this.isRoutingAuthenticationError(err)) {
        this.showToast("Routing authorization failed. " + "Sign in to ArcGIS or ask the Experience " + "author to configure a routing API key.", 6500);
      } else {
        this.showToast("Could not generate capture route.", 4000);
      }
    } finally {
      const currentView = this.state.jimuMapView?.view;
      if (currentView) await this.restoreRoutingLoginView(currentView);
      // ExB may finish rebuilding its second resource after the routing response.
      const snapshot = this._routingLoginView;
      if (snapshot) this._routingLoginExpiry = setTimeout(() => {
        if (this._routingLoginView === snapshot) this._routingLoginView = null;
        this._routingLoginExpiry = null;
      }, 15000);
      this.setState({
        isGeneratingRoute: false,
        routeGenerationProgress: null,
      });
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

    const pointColor = isStart ? [46, 204, 113, 1] : [231, 76, 60, 1]; // Green (A) / Red (B)

    const symbol = is3D
      ? {
          type: "point-3d",
          symbolLayers: [
            {
              type: "icon",
              resource: { primitive: "circle" },
              material: { color: pointColor },
              size: 16,
              outline: { color: [255, 255, 255, 1], size: 2 },
            },
          ],
          verticalOffset: { screenLength: 40, maxWorldLength: 150, minWorldLength: 10 },
          callout: { type: "line", size: 2, color: pointColor, border: { color: [0, 0, 0, 0.4] } },
        }
      : {
          type: "simple-marker",
          style: "circle",
          color: pointColor,
          size: 12,
          outline: { color: [255, 255, 255, 1], width: 2 },
        };

    const pointGraphic = new Graphic({
      geometry: new Point({ x: lon, y: lat, spatialReference: { wkid: 4326 } }),
      symbol: symbol as any,
    });

    view.graphics.add(pointGraphic);
    if (isStart) this._routePointAGraphic = pointGraphic;
    else this._routePointBGraphic = pointGraphic;
  };

  /** Sets Point A or Point B coordinates in state and updates map marker. */
  private setRoutePoint = (type: "start" | "end", coords: [number, number]) => {
    this.drawRoutePointMarker(type, coords[0], coords[1]);
    if (type === "start") {
      this.setState({ routeStartPoint: coords, routePickMode: null });
      this.showToast("🟢 Start Point (A) set.", 2000);
    } else {
      this.setState({ routeEndPoint: coords, routePickMode: null });
      this.showToast("🔴 Destination Point (B) set.", 2000);
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
    const nextTravelMode: CaptureTravelMode = engine === "osrm" && this.state.routeTravelMode !== "drive" ? "drive" : this.state.routeTravelMode;

    /*
     * Do not change providers during an active solve.
     */
    if (this.state.isGeneratingRoute) {
      return;
    }

    /*
     * Remove only the generated route.
     *
     * Preserve:
     * - Street Coverage analysis
     * - frozen analysis bbox
     * - A
     * - B
     * - spare-time budget
     */
    if (this._routeGraphicLayer) {
      this._routeGraphicLayer.removeAll();
    }

    this.setState({
      routingEngineOverride: engine,

      routeTravelMode: nextTravelMode,

      routeData: null,

      routeGenerationProgress: null,
    });

    this.log(`[CaptureRoute] Runtime engine → ` + `${engine === "world" ? "Esri World Route" : "OSRM"}`);
  };

  private handleRuntimeTravelModeChange = (mode: CaptureTravelMode) => {
    /*
     * Never change routing mode in the middle
     * of an active solve.
     */
    if (this.state.isGeneratingRoute) {
      return;
    }

    /*
     * Changing transport mode invalidates only
     * the generated route.
     *
     * Preserve:
     *
     * - Street Coverage analysis
     * - frozen analysis bbox
     * - A
     * - B
     * - spare-time budget
     * - selected routing engine
     */
    if (this._routeGraphicLayer) {
      this._routeGraphicLayer.removeAll();
    }

    this.setState({
      routeTravelMode: mode,

      routeData: null,

      routeGenerationProgress: null,
    });

    const label = mode === "drive" ? "Drive" : mode === "walk" ? "Walk" : "Bike";

    this.log(`[CaptureRoute] Travel mode → ${label}`);
  };

  // #endregion STREET COVERAGE ANALYSIS

  // #region POINT CLOUD

  /**
   * Loads the Mapillary SfM point cloud for the currently active image
   * and renders it as a GraphicsLayer in the ArcGIS 3D scene.
   * Only available when:
   *  - The map view is 3D (point clouds are meaningless as flat 2D dots)
   *  - An image is currently loaded
   *  - The image has sfm_cluster data (not all images are reconstructed)
   * Flow:
   *  1. loadPointCloud() fetches metadata, downloads CDN blob,
   *     decompresses with pako, converts ENU→WGS84, sanity-checks
   *  2. Points are colored by elevation (Z) using a blue→green→red gradient
   *  3. A GraphicsLayer is added to the scene with one Graphic per point
   *  4. State is updated so the UI button reflects the active cloud
   */
  private recordPointCloudIssue = (message: string, automatic: boolean, toastMessage = message) => {
    if (automatic && this.state.pointCloudFollowImages) this._pointCloudAutoFailures = (this._pointCloudAutoFailures || 0) + 1;
    const paused = automatic && this.state.pointCloudFollowImages && this._pointCloudAutoFailures >= 3;
    const text = paused ? "Auto-follow paused after 3 problem images. Resume to try again. " + message : message;
    this.setState({ pointCloudAutoPaused: !!paused, pointCloudLoading: false, pointCloudVisible: !!this._currentPointCloudResult, pointCloudPrevious: !!this._currentPointCloudResult && this._currentPointCloudResult.imageId !== this.state.imageId, pointCloudAvailable: undefined, pointCloudIncomplete: true, pointCloudSummary: text });
    this.showToast(paused ? "Auto-follow paused after 3 problem images. Use Resume in the cloud status card." : toastMessage, 5000);
  };

  private loadPointCloudLayer = async (isAutoLoading: boolean = false, forceDiscovery = false) => {
    const imageId = this.state.imageId, view = this.state.jimuMapView?.view;
    const version = this._pointCloudQueueVersion = (this._pointCloudQueueVersion || 0) + 1;
    const previous = this._pointCloudLoadTask;
    this._pointCloudAbort?.abort();
    if (previous) await previous.catch(() => {});
    if (version !== this._pointCloudQueueVersion || imageId !== this.state.imageId || view !== this.state.jimuMapView?.view) return;
    const task = (async () => { await this.performPointCloudLoad(isAutoLoading, forceDiscovery); await this._pointCloudEditTask?.catch(() => {}); })();
    this._pointCloudLoadTask = task;
    try { await task; } finally { if (this._pointCloudLoadTask === task) this._pointCloudLoadTask = null; }
  };

  private performPointCloudLoad = async (isAutoLoading: boolean = false, forceDiscovery = false) => {
    const { jimuMapView, imageId, sequenceImages } = this.state;
    const view = jimuMapView?.view;
    if (!view?.map || view.destroyed || !imageId) return;

    if (view.type !== "3d") {
      this.showToast("Point Cloud is only available in 3D map mode.");
      return;
    }

    // Set the Prefix based on the loading context
    const loadingPrefix = isAutoLoading ? "Auto-loading next segment" : "Downloading 3D Point Cloud";

    this._pointCloudAbort?.abort();
    const controller = new AbortController(); this._pointCloudAbort = controller;
    const request = ++this._pointCloudRequest;
    const current = () => request === this._pointCloudRequest && !controller.signal.aborted && this.state.imageId === imageId && this.state.jimuMapView?.view === view && !view.destroyed && !!view.map;
    const deadline = setTimeout(() => controller.abort(), 90000);
    this._pointCloudModeActive = true;
    this.setState({ pointCloudLoading: true, pointCloudAvailable: undefined });

    try {
      let progressEnabled = true;

      const result = await loadPointCloud(imageId, this.accessToken, {
        signal: controller.signal, cache: this._pointCloudCache, forceDiscovery,
        frustumCrop: false,
        cropLengthMeters: POINT_CLOUD_CONFIG.FETCH_LENGTH,
        cropWidthMeters: POINT_CLOUD_CONFIG.FETCH_WIDTH,
        sequenceImages: this.state.sequenceImages.map((img: any) => ({
          id: img.id,
          lon: img.lon,
          lat: img.lat,
        })),
        onProgress: (status) => {
          if (!progressEnabled || !current()) return;
          this.showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span>
                <b>{loadingPrefix}:</b> {status}
              </span>
            </span>,
            15000,
          );
        },
      });

      if (!current()) return;
      if (!result) { this.recordPointCloudIssue("Cloud unavailable for this image. Try the next image or retry.", isAutoLoading); return; }
      const targetImage = sequenceImages.find((img: any) => String(img.id) === String(imageId));
      const targetLocation = targetImage || result.mapImageLocation || result.computedImageLocation;
      if (isAutoLoading && this.state.pointCloudFollowImages && pointCloudCorridorCount(result, targetLocation.lon, targetLocation.lat, this.getStreetBearing(), this.state.pointCloudLength, this.state.pointCloudWidth, 100000) > 100000) {
        this.recordPointCloudIssue("This scene corridor exceeds 100,000 points. Reduce length/width or load manually. The next image can still be followed.", true);
        return;
      }
      // Find the GPS position of the currently active image (The Car/the Person)
      const activeImage = sequenceImages.find((img: any) => img.id === imageId);
      this._cameraLon = activeImage ? activeImage.lon : (result.mapImageLocation || result.computedImageLocation).lon;
      this._cameraLat = activeImage ? activeImage.lat : (result.mapImageLocation || result.computedImageLocation).lat;

      const pointCloudExtentM = result.points.reduce((max, pt) => {
        const d = distanceMeters(pt.lat, pt.lon, this._cameraLat, this._cameraLon);
        return d > max ? d : max;
      }, 0);

      // add width extent using E-W axis only
      const bearing = this.getStreetBearing();
      const rad = (bearing * Math.PI) / 180;
      const sinB = Math.sin(rad);
      const cosB = Math.cos(rad);

      const pointCloudWidthExtentM = result.points.reduce((max, pt) => {
        const dy = (pt.lat - this._cameraLat) * 111320;
        const dx = (pt.lon - this._cameraLon) * 111320 * Math.cos((this._cameraLat * Math.PI) / 180);
        const right = Math.abs(dx * cosB - dy * sinB);
        return right > max ? right : max;
      }, 0);

      this.setState({
        pointCloudActualLength: Math.min(Math.ceil(pointCloudExtentM / 10) * 10, POINT_CLOUD_CONFIG.FETCH_LENGTH),
        pointCloudActualWidth: Math.min(Math.ceil(pointCloudWidthExtentM / 10) * 10, POINT_CLOUD_CONFIG.FETCH_WIDTH),
      });

      // Save the raw result so the T,F,G,H,R,C keys or UI cp calibration values can use it without re-downloading
      const preserveCalibration = isAutoLoading && this._currentPointCloudResult?.sfmClusterUrl.split("?")[0] === result.sfmClusterUrl.split("?")[0];
      if (this._currentPointCloudResult && this.state.isLassoMode) this.clearLasso();
      this._currentPointCloudResult = result;

      // Reset the nudge back to 0 for the new image
      if (!preserveCalibration) { this._nudgeX = 0; this._nudgeY = 0; this._nudgeZ = 0; }

      this.setState({ pointCloudMaxLength: POINT_CLOUD_CONFIG.LENGTH_MAX });

      // Capture agent-PROXIMITY FLOOR ALGORITHM
      // Isolate only the points within a tight 5-meter radius around the car
      const nearbyPoints = result.points.filter((p) => distanceMeters(this._cameraLat, this._cameraLon, p.lat, p.lon) < 5.0);

      // If there are enough points around the car, use them. Otherwise fallback to whole cloud.
      const floorSamplePoints = nearbyPoints.length > 50 ? nearbyPoints : result.points;

      // Sort these specific points by altitude
      const sampledAlts = floorSamplePoints.map((p) => p.alt).sort((a, b) => a - b);

      // Take the 5th percentile of the points immediately around the car.
      // This safely bypasses reflections/noise and perfectly grabs the asphalt!
      this._baseAlt = sampledAlts[Math.floor(sampledAlts.length * 0.05)];

      // Draw the ArcGIS Map
      this.renderPointCloudMapLayer(true);
      this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);

      // Draw the Mapillary Viewer Overlay

      const currentLength = this.state.pointCloudLength;
      const halfWidth = this.state.pointCloudWidth;

      const initialPoints = result.points.filter((p) => {
        const dy = (p.lat - this._cameraLat) * 111320;
        const dx = (p.lon - this._cameraLon) * 111320 * Math.cos((this._cameraLat * Math.PI) / 180);
        const forward = dx * sinB + dy * cosB;
        const right = dx * cosB - dy * sinB;

        // Always apply width filter
        if (halfWidth > 0 && Math.abs(right) > halfWidth) return false;

        // Apply length filter
        if (currentLength > 0) {
          if (forward < -currentLength || forward > currentLength) return false;
        }
        return true;
      });

      this._filteredPointCloudPoints = initialPoints;

      // Pass a shallow copy of result with filtered points for the viewer
      // _currentPointCloudResult still holds the full unfiltered cloud
      if (this._pointCloudRendererActive && this._pointCloudViewerRenderer?._gl && this._pointCloudViewerRenderer?._currentReference) {
        this._pointCloudViewerRenderer.setHighlight(-1);
        this._pointCloudViewerRenderer.updatePoints(initialPoints);
        this.mapillaryViewer?.resize();
      } else this.addViewerPointCloudRenderer({ ...result, points: initialPoints }, imageId);

      this.setState({
        pointCloudLoading: false,
        pointCloudVisible: true,
        pointCloudAvailable: true,
        pointCloudPrevious: false, pointCloudAutoPaused: false,
        pointCloudIncomplete: !!result.diagnostics?.partial,
        pointCloudSummary: summarizePointCloud(result, initialPoints.length),
      });

      progressEnabled = false;

      const totalPoints = result.points.length;
      const dupes = result.duplicatesRemoved;
      const visiblePoints = initialPoints.length;

      // Final success toast with dedup stats
      this.showToast(
        <span style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.Check size={14} color="#37d582" />
            <b>Point cloud loaded:</b> {result.clusterCount} cluster{result.clusterCount !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", paddingLeft: "20px" }}>
            {totalPoints.toLocaleString()} pts total
            {dupes > 0 ? ` · ${dupes.toLocaleString()} dupes removed` : ""}
          </span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", paddingLeft: "20px" }}>
            {visiblePoints.toLocaleString()} pts visible at {this.state.pointCloudLength}m × {this.state.pointCloudWidth}m
          </span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", paddingLeft: "20px" }}>Use T, F, G, H, R, V to align or use calibration panel.</span>
        </span>,
        6000,
      );
      if (result.diagnostics?.partial) this.recordPointCloudIssue("Some cloud data could not be loaded for this image. " + summarizePointCloud(result, initialPoints.length), isAutoLoading, "Cloud partly loaded. Check the cloud status card for details and recovery.");
      else { this._pointCloudAutoFailures = 0; this.setState({ pointCloudAutoPaused: false }); }
    } catch (err) {
      if (request !== this._pointCloudRequest || this.state.imageId !== imageId || this.state.jimuMapView?.view !== view || view.destroyed) return;
      const errorMsg = controller.signal.aborted ? "Point-cloud loading timed out or was cancelled. Retry to load this area." : (err as Error)?.message || "Load failed.";
      console.warn("Point cloud load failed:", errorMsg);
      this.recordPointCloudIssue("Cloud unavailable for this image. " + errorMsg + " Try the next image or retry.", isAutoLoading);
    } finally {
      clearTimeout(deadline);
      if (request === this._pointCloudRequest) {
        this._pointCloudAbort = null;
        if (!view.destroyed && this.state.jimuMapView?.view === view) this.setState({ pointCloudLoading: false });
      }
    }
  };

  /**
   * Forward current cloud/view/tool state to the adaptive display owner.
   * Geometry edits remain in renderPointCloudMapLayer; the controller only changes the display expression.
   */
  private updatePointCloudDisplay = () => {
    this._pointCloudAdaptiveDisplay ??= new PointCloudAdaptiveDisplay(() => ({
      layer: this._pointCloudLayer, view: this.state.jimuMapView?.view, ownerView: this._pointCloudLayerView,
      count: this._currentPointCloudResult?.points.length || 0, adaptive: !!this.state.pointCloudAdaptive,
      toolsActive: !!(this.state.isMeasureMode || this.state.isLassoMode || this.state.isSightMode || this.state.isViewshedMode),
      groundHeight: this._groundMode ? POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M : undefined,
    }), pointCloudDisplayExpression);
    this._pointCloudAdaptiveDisplay.update();
  };

  private renderPointCloudMapLayer = (silent: boolean = false) => {
    const view = this.state.jimuMapView?.view;
    if (!view?.map || view.destroyed || !this._currentPointCloudResult) return;
    const renderRequest = ++this._pointCloudRenderRequest;
    this._pointCloudMapUpdating = true;
    const { FeatureLayer } = this.ArcGISModules;

    const result: PointCloudResult = this._currentPointCloudResult;
    const cropLength = this.state.pointCloudLength <= 0 ? 0 : this.state.pointCloudLength;

    // Convert the Nudge Meters into GPS Degrees
    const nudgeLat = this._nudgeY / 111320;
    const nudgeLon = this._nudgeX / (111320 * Math.cos((this._cameraLat * Math.PI) / 180));

    const uniqueColors = new Set<string>();
    const quantize = (val: number) => {
      const q = Math.round(val / 16) * 16;
      return q > 255 ? 255 : q;
    };
    const toHex = (c: number) => c.toString(16).padStart(2, "0");

    // Compute rotation helpers for the Oriented Bounding Box (OBB) using Street Direction
    const bearing = this.getStreetBearing();
    const rad = (bearing * Math.PI) / 180;
    const sinB = Math.sin(rad);
    const cosB = Math.cos(rad);

    // Dynamic half-width (30m covers standard street width + sidewalks + front yards)
    const halfWidth = this.state.pointCloudWidth;

    const features: any[] = [];
    let filteredIndex = 0;

    pointCloudCandidates(result, this._cameraLon, this._cameraLat, cropLength, halfWidth).forEach((origIndex) => {
      const p = result.points[origIndex];
      // Use pure SfM coordinates for perfect physical photogrammetric distance!
      const distFromCamera = distanceMeters(result.computedImageLocation.lat, result.computedImageLocation.lon, p.rawLat, p.rawLon);

      // Calculate relative offset in meters BEFORE applying shift/nudge
      const dy = (p.lat - this._cameraLat) * 111320;
      const dx = (p.lon - this._cameraLon) * 111320 * Math.cos((this._cameraLat * Math.PI) / 180);

      // Project onto local Forward and Right coordinate system
      const forward = dx * sinB + dy * cosB;
      const right = dx * cosB - dy * sinB;

      // Apply OBB Street Corridor Filter
      // Width always enforced, prevents parallel street bleed even on FULL length
      if (halfWidth > 0 && Math.abs(right) > halfWidth) return;

      // Length crop only when not FULL (0 = unlimited length sentinel)
      if (cropLength > 0) {
        if (forward < -cropLength || forward > cropLength) return;
      }

      const relativeZ = p.alt - this._baseAlt;
      const finalZ = relativeZ + this._nudgeZ;

      let pr = p.r ?? 160,
        pg = p.g ?? 160,
        pb = p.b ?? 160;
      if (pr <= 1 && pg <= 1 && pb <= 1 && (pr > 0 || pg > 0 || pb > 0)) {
        pr = Math.round(pr * 255);
        pg = Math.round(pg * 255);
        pb = Math.round(pb * 255);
      }

      const hexColor = `#${toHex(quantize(pr))}${toHex(quantize(pg))}${toHex(quantize(pb))}`;
      uniqueColors.add(hexColor);

      features.push({
        geometry: {
          type: "point",
          longitude: p.lon + nudgeLon,
          latitude: p.lat + nudgeLat,
          z: finalZ,
          spatialReference: { wkid: 4326 },
        },
        attributes: {
          ObjectID: origIndex + 1,
          pointIndex: filteredIndex,
          originalIndex: origIndex,
          colorCode: hexColor,
          relativeHeight: parseFloat(finalZ.toFixed(2)),
          absoluteAltitude: parseFloat(p.alt.toFixed(2)),
          distanceFromCamera: parseFloat(distFromCamera.toFixed(2)),
        },
      });

      filteredIndex++;
    });

    const uniqueValueInfos = Array.from(uniqueColors).map((hex) => ({
      value: hex,
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "icon",
            resource: { primitive: "circle" },
            material: { color: hex },
            size: 2.0,
            outline: { size: 0 },
          },
        ],
      },
    }));

    // Construct renderer based on selected color mode
    let activeRenderer: __esri.Renderer;

    if (this.state.pointCloudColorMode === "elevation") {
      activeRenderer = {
        type: "simple",
        symbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "icon",
              resource: { primitive: "circle" },
              material: { color: "white" },
              size: 2.0,
              outline: { size: 0 },
            },
          ],
        },
        visualVariables: [
          {
            type: "color",
            field: "relativeHeight",
            stops: [
              { value: -0.5, color: "#0000FF" },
              { value: 0.0, color: "#00FFFF" },
              { value: 2.5, color: "#00FF00" },
              { value: 7.0, color: "#FFFF00" },
              { value: 15.0, color: "#FF0000" },
            ],
          },
        ],
      } as any;
    } else {
      activeRenderer = {
        type: "unique-value",
        field: "colorCode",
        uniqueValueInfos: uniqueValueInfos,
      } as any;
    }

    // 1. Initialize layer completely EMPTY to prevent UI lockup
    const reuse = this._pointCloudLayer && !this._pointCloudLayer.destroyed && this._pointCloudLayerResult === result && this._pointCloudLayerView === view;
    const layer: __esri.FeatureLayer = reuse ? this._pointCloudLayer as __esri.FeatureLayer : new FeatureLayer({
      id: "point-cloud-layer", legendEnabled: false, title: "Mapillary Point Cloud", visible: this._pointCloudLayer?.visible ?? true,
      source: [],
      objectIdField: "ObjectID",
      geometryType: "point",
      hasZ: true,
      spatialReference: { wkid: 4326 },
      elevationInfo: { mode: "relative-to-ground", offset: 0.5 },
      fields: [
        { name: "ObjectID", type: "oid" },
        { name: "pointIndex", type: "integer" },
        { name: "originalIndex", type: "integer" },
        { name: "colorCode", type: "string", alias: "Hex Color" },
        { name: "relativeHeight", type: "double", alias: "Height Above Road (m)" },
        { name: "absoluteAltitude", type: "double", alias: "Sea-level Altitude (m)" },
        { name: "distanceFromCamera", type: "double", alias: "Distance from Car (m)" },
      ],
      outFields: ["*"],
      popupEnabled: true,
      popupTemplate: {
        title: "Point Cloud Node",
        content: `
                    <div style="font-size: 13px; line-height: 1.5;">
                        <b>Horizontal Distance:</b> {distanceFromCamera} m<br/>
                        <span style="font-size: 10px; color: #888; display: block; margin-top: -4px; margin-bottom: 4px;">
                            (From camera GPS origin)
                        </span>
                        <b>Height Above Road:</b> {relativeHeight} m<br/>
                        <b>Absolute Altitude:</b> {absoluteAltitude} m<br/>
                        <span style="display:none;">{originalIndex}</span>
                    </div>
                `,
      },
      renderer: activeRenderer,
      definitionExpression: this._groundMode ? `relativeHeight < ${POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M}` : "1=1",
    });

    layer.legendEnabled = false;
    this.setState({ pointCloudSummary: summarizePointCloud(result, features.length) });
    if (!reuse) {
      if (this._pointCloudLayer) { this._pointCloudLayerView?.map?.remove(this._pointCloudLayer); this._pointCloudLayer.destroy(); }
      view.map.add(layer); this._pointCloudLayer = layer; this._pointCloudLayerView = view; this._pointCloudLayerResult = result;
      this._pointCloudFeatures = new Map();
    }
    this.updatePointCloudDisplay();
    this._pointCloudIndexByOriginal = new Map(features.map(feature => [feature.attributes.originalIndex + 1, feature.attributes.pointIndex]));
    this._pointCloudViewerObjectIds = features.map(feature => this._pointCloudFeatures.get(feature.attributes.originalIndex + 1)?.attributes.ObjectID ?? NaN);
    const current = () => this._pointCloudLayer === layer && this._pointCloudLayerResult === result && this.state.jimuMapView?.view === view && !view.destroyed && !layer.destroyed;
    this._pointCloudEditTask = this._pointCloudEditTask.catch(() => {}).then(async () => {
      if (!current() || renderRequest !== this._pointCloudRenderRequest) return;
      layer.renderer = activeRenderer;
      const changes = diffPointCloudFeatures(this._pointCloudFeatures, features);
      for (const [kind, edits] of [["deleteFeatures", changes.deleteFeatures], ["updateFeatures", changes.updateFeatures], ["addFeatures", changes.addFeatures]] as const) {
        for (let offset = 0; offset < edits.length; offset += 5000) {
          if (!current() || renderRequest !== this._pointCloudRenderRequest) return;
          const chunk = edits.slice(offset, offset + 5000);
          const edited = await layer.applyEdits({ [kind]: chunk } as any);
          const confirmations = kind === "deleteFeatures" ? edited.deleteFeatureResults : kind === "updateFeatures" ? edited.updateFeatureResults : edited.addFeatureResults;
          let failed = false;
          chunk.forEach((feature, index) => {
            if (!confirmations?.[index] || confirmations[index].error) { failed = true; return; }
            if (!current()) return;
            const id = feature.attributes.originalIndex + 1;
            if (kind === "deleteFeatures") this._pointCloudFeatures.delete(id);
            else {
              const assignedId = confirmations[index].objectId;
              if (!Number.isFinite(assignedId)) { failed = true; return; }
              this._pointCloudFeatures.set(id, { ...feature, attributes: { ...feature.attributes, ObjectID: assignedId } });
            }
            const viewerIndex = this._pointCloudIndexByOriginal.get(id);
            if (viewerIndex !== undefined) this._pointCloudViewerObjectIds[viewerIndex] = this._pointCloudFeatures.get(id)?.attributes.ObjectID ?? NaN;
          });
          if (failed) throw new Error("Some point features could not be updated. Retry the cloud display.");
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      if (current() && renderRequest === this._pointCloudRenderRequest) {
        this._pointCloudMapUpdating = false;
        if (this.state.isLassoMode && this.state.lassoPolygon?.length >= 3) this.calculateLassoSelection();
        else if (this.state.lassoSelectedObjectIds?.length) this.highlightLassoInArcGIS();
      }
      if (current() && renderRequest === this._pointCloudRenderRequest && !silent) this.showToast(`3D scene updated (${features.length.toLocaleString()} points)`, 2500);
    }).catch((error: unknown) => {
      if (current() && renderRequest === this._pointCloudRenderRequest) { this._pointCloudMapUpdating = false; this.setState({ pointCloudIncomplete: true, pointCloudSummary: (error as Error).message }); }
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
    if (!this.state.pointCloudVisible || !this._currentPointCloudResult) return;

    // Ignore keystrokes if the user is typing in a text box
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    let handled = false;
    const step = e.shiftKey ? 1.0 : 0.2;

    const bearingRad = (this._lastBearing * Math.PI) / 180;
    const cosB = Math.cos(bearingRad);
    const sinB = Math.sin(bearingRad);

    switch (e.key.toLowerCase()) {
      case "t": // Move FORWARD
        this._nudgeY += step * cosB;
        this._nudgeX += step * sinB;
        handled = true;
        break;

      case "g": // Move BACKWARD
        this._nudgeY -= step * cosB;
        this._nudgeX -= step * sinB;
        handled = true;
        break;

      case "f": // Move LEFT
        this._nudgeY += step * sinB;
        this._nudgeX -= step * cosB;
        handled = true;
        break;

      case "h": // Move RIGHT
        this._nudgeY -= step * sinB;
        this._nudgeX += step * cosB;
        handled = true;
        break;

      case "r": // Move UP
        this._nudgeZ += step;
        handled = true;
        break;
      case "v": // Move DOWN
        this._nudgeZ -= step;
        handled = true;
        break;

      // THE Z-SLICER (GROUND MODE)
      case "x":
        this._groundMode = !this._groundMode;
        if (this._pointCloudLayer) {
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
              .catch(() => {});
          }
        }

        this.showToast(
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.GroundGrid size={14} />
            <b>Ground Mode:</b> {this._groundMode ? `ON (Buildings > ${POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M}m Hidden)` : "OFF (Full Cloud)"}
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
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <b>Color Mode:</b> {this.state.pointCloudColorMode === "elevation" ? "Elevation Heatmap" : "True RGB"}
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
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Crosshair size={14} />
          <b>Total Offset:</b>
          {Math.abs(this._nudgeX).toFixed(1)}m {this._nudgeX > 0 ? "E" : "W"},{Math.abs(this._nudgeY).toFixed(1)}m {this._nudgeY > 0 ? "N" : "S"}
          {Math.abs(this._nudgeZ).toFixed(1)}m {this._nudgeZ > 0 ? "Up" : "Dn"}
        </span>,
        1000,
      );
    }
  };

  /**
   * 2. KEY UP: Triggers the actual map redraw ONLY when the user releases the key.
   */
  private handleNudgeKeyUp = (e: KeyboardEvent) => {
    if (!this.state.pointCloudVisible || !this._currentPointCloudResult) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const key = e.key.toLowerCase();

    // If they released T, F, G, H, R or V apply the final location to the map!
    if (["t", "f", "h", "g", "r", "v"].includes(key)) {
      // We use the debounced version just in case they release two keys (like T and H)
      // at the exact same millisecond, preventing double-renders.
      this._debouncedNudgeRender();
    }
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
    if (!this.state.pointCloudVisible || !this._currentPointCloudResult) return;

    const step = this.state.nudgeStep * direction;
    const bearingRad = (this._lastBearing * Math.PI) / 180;
    const cosB = Math.cos(bearingRad);
    const sinB = Math.sin(bearingRad);

    if (axis === "y") {
      // Forward / Backward
      this._nudgeY += step * cosB;
      this._nudgeX += step * sinB;
    } else if (axis === "x") {
      // Left / Right
      this._nudgeY -= step * sinB;
      this._nudgeX += step * cosB;
    } else if (axis === "z") {
      // Up / Down
      this._nudgeZ += step;
    }

    // Show instant feedback toast
    this.showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.Crosshair size={14} />
        <b>Offset:</b> X:{this._nudgeX.toFixed(1)}m, Y:{this._nudgeY.toFixed(1)}m, Z:{this._nudgeZ.toFixed(1)}m
      </span>,
      1000,
    );

    // Instantly redraw the map
    this._debouncedNudgeRender();
  };

  /**
   * Instantly resets the cloud back to the ground and clears the X/Y drift offset.
   */
  private resetCalibration = () => {
    this._nudgeX = 0;
    this._nudgeY = 0;
    this._nudgeZ = 0;
    this.showToast("Cloud reset to Mapillary coordinates.", 2000);
    this.renderPointCloudMapLayer();
  };

  /**
        Creates and attaches a MapillaryJS ICustomRenderer that draws the point
        cloud as white semi-transparent dots directly onto the street imagery.
        * Uses raw WebGL with gl.POINTS; no Three.js dependency required.
        * geodeticToEnu (from mapillary-js) converts each WGS84 point to the
        * viewer's local topocentric ENU frame so they project correctly onto
        * the panoramic scene as the user pans and zooms.
    */
  private addViewerPointCloudRenderer(result: PointCloudResult, imageId: string) {
    if (!this.mapillaryViewer) return;
    this.removeViewerPointCloudRenderer();

    const points = result.points;

    const vsSource = `
            attribute vec3 aPosition;
            attribute vec4 aColor;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;
            uniform float uIsHighlightDraw;
            uniform float uPixelRatio;
            varying float vIsHighlight;
            varying vec3 vColor;
            varying float vAlpha;

            void main(void) {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                if (uIsHighlightDraw > 0.5) {
                    gl_PointSize = 20.0 * uPixelRatio;
                    vIsHighlight = 1.0;
                } else {
                    gl_PointSize = 1.0 * uPixelRatio;
                    vIsHighlight = 0.0;
                }
                vColor = aColor.rgb / 255.0;
                vAlpha = aColor.a / 255.0; // Pass the Alpha channel to the fragment shader
            }
        `;

    const fsSource = `
            precision mediump float;
            varying float vIsHighlight;
            varying vec3 vColor;
            varying float vAlpha;

            void main(void) {
                // If Ground Mode sets Alpha to 0, kill the pixel instantly!
                if (vAlpha < 0.5) {
                    discard;
                }

                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);

                if (dist > 0.5) discard;

                if (vIsHighlight > 0.5) {
                    if (dist > 0.40) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.8);
                    } else if (dist > 0.30) {
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    } else {
                        gl_FragColor = vec4(1.0, 0.9, 0.0, 1.0);
                    }
                } else {
                    // Soft point splatting for a dense cloud look
                    float alpha = (0.5 - dist) * 2.0;
                    gl_FragColor = vec4(vColor, alpha * 0.95);
                }
            }
        `;

    const widget = this;
    const renderer: any = {
      id: "point-cloud-renderer",
      renderPass: RenderPass.Opaque,
      _gl: null,
      _program: null,
      _positionBuffer: null,
      _highlightBuffer: null,
      _vertexCount: 0,
      _modelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      _points: points,
      _selectedIndex: -1,
      _currentReference: null,
      _uViewMatrixLoc: null,
      _uProjectionMatrixLoc: null,
      _uModelMatrixLoc: null,
      _uIsHighlightDrawLoc: null,
      _uPixelRatioLoc: null,
      _pixelRatio: window.devicePixelRatio || 1,
      _aPositionLoc: -1,
      _colorBuffer: null as WebGLBuffer | null,
      _aColorLoc: -1,
      // [4.5.0 Update] Lasso Buffer & Matrix tracking
      // We store the view matrices here during render() so our raycaster in widget.tsx can read them later.
      _lastViewMatrix: null as Float32Array | null,
      _lastProjMatrix: null as Float32Array | null,
      _lassoBuffer: null as WebGLBuffer | null,
      _aLassoLoc: -1,

      /**
       * [4.5.0 Update] Flushes the selection array to the GPU.
       * 1.0 means selected (Cyan), 0.0 means unselected (RGB).
       */
      updateLasso(indices: number[]) {
        const gl = this._gl;
        if (!gl || !this._lassoBuffer) return;
        const data = new Float32Array(this._vertexCount);
        for (const idx of indices) {
          if (idx >= 0 && idx < this._vertexCount) data[idx] = 1.0;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      },

      updateColors() {
        const gl = this._gl;
        if (!gl || !this._colorBuffer) return;

        const mode = widget.state.pointCloudColorMode;
        const base = widget._baseAlt;
        const nudgeZ = widget._nudgeZ;
        const isGroundMode = widget._groundMode;

        // Fallback to 1.5m to ensure it never fails
        const limit = POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M || 1.5;

        const colors: number[] = [];
        for (const p of this._points) {
          const relH = p.alt - base + nudgeZ;

          // Alpha flag: 255 = visible, 0 = hidden (Ground Mode)
          const a = isGroundMode && relH >= limit ? 0 : 255;

          if (mode === "elevation") {
            let r = 0,
              g = 0,
              b = 255;
            if (relH <= -0.5) {
              r = 0;
              g = 0;
              b = 255;
            } else if (relH <= 0.0) {
              r = 0;
              g = Math.round(((relH - -0.5) / 0.5) * 255);
              b = 255;
            } else if (relH <= 2.5) {
              r = 0;
              g = 255;
              b = Math.round((1 - (relH - 0.0) / 2.5) * 255);
            } else if (relH <= 7.0) {
              r = Math.round(((relH - 2.5) / 4.5) * 255);
              g = 255;
              b = 0;
            } else if (relH <= 15.0) {
              r = 255;
              g = Math.round((1 - (relH - 7.0) / 8.0) * 255);
              b = 0;
            } else {
              r = 255;
              g = 0;
              b = 0;
            }

            colors.push(r, g, b, a); // Push 4 values (RGBA)
          } else {
            colors.push(p.r ?? 160, p.g ?? 160, p.b ?? 160, a); // Push 4 values (RGBA)
          }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        // DYNAMIC_DRAW allows real-time updates without breaking WebGL
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      },

      updatePoints(filteredPoints: PointCloudPoint[]) {
        const gl = this._gl;
        if (!gl || !this._positionBuffer || !this._colorBuffer || !this._currentReference) return;

        this._points = filteredPoints;
        this._vertexCount = filteredPoints.length;

        // Rebuild position buffer from filtered subset
        const positions: number[] = [];
        for (const p of filteredPoints) {
          const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);
          positions.push(enu[0], enu[1], enu[2]);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

        // Rebuild color buffer for the new subset
        this.updateColors();

        // [4.5.0 Update] Wipe the lasso buffer cleanly when slider crops the array
        // Prevents index-out-of-bounds WebGL crashes
        if (this._lassoBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertexCount), gl.DYNAMIC_DRAW);
        }
      },

      setHighlight(index: number) {
        this._selectedIndex = index;
        this.updateHighlightBuffer();
      },

      updateHighlightBuffer() {
        const gl = this._gl;
        if (!gl || !this._highlightBuffer || !this._currentReference || this._selectedIndex < 0) return;

        const p = this._points[this._selectedIndex];
        if (!p) return;

        const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._highlightBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enu), gl.DYNAMIC_DRAW);
      },

      onAdd(viewer: any, reference: any, context: WebGLRenderingContext) {
        const gl = context;
        this._gl = gl;
        this._currentReference = reference;

        const compile = (type: number, src: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };

        const vs = compile(gl.VERTEX_SHADER, vsSource);
        const fs = compile(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        this._program = program;

        this._uViewMatrixLoc = gl.getUniformLocation(program, "uViewMatrix");
        this._uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        this._uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
        this._uIsHighlightDrawLoc = gl.getUniformLocation(program, "uIsHighlightDraw");
        this._aPositionLoc = gl.getAttribLocation(program, "aPosition");
        this._aColorLoc = gl.getAttribLocation(program, "aColor");
        // [4.5.0 Update] Bind the lasso attribute
        this._aLassoLoc = gl.getAttribLocation(program, "aLasso");
        this._uPixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");
        this._pixelRatio = window.devicePixelRatio || 1;

        const positions: number[] = [];
        for (const p of this._points) {
          const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, reference.lng, reference.lat, reference.alt);
          positions.push(enu[0], enu[1], enu[2]);
        }
        this._vertexCount = positions.length / 3;

        // [4.5.0 Update] Setup empty lasso buffer
        this._positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this._colorBuffer = gl.createBuffer()!;
        this.updateColors(); // Generate initial RGBA array

        this._highlightBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._highlightBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0]), gl.DYNAMIC_DRAW);

        this._lassoBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertexCount), gl.DYNAMIC_DRAW);
      },

      onReference(viewer: any, reference: any) {
        this._currentReference = reference;
        const gl = this._gl;
        if (!gl || !this._positionBuffer) return;

        const positions: number[] = [];
        for (const p of this._points) {
          const enu = geodeticToEnu(p.rawLon, p.rawLat, p.alt, reference.lng, reference.lat, reference.alt);
          positions.push(enu[0], enu[1], enu[2]);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.updateHighlightBuffer();
      },

      onRemove(viewer: any, context: WebGLRenderingContext) {
        const gl = context;
        if (this._program) gl.deleteProgram(this._program);
        if (this._positionBuffer) gl.deleteBuffer(this._positionBuffer);
        if (this._highlightBuffer) gl.deleteBuffer(this._highlightBuffer);
        if (this._colorBuffer) gl.deleteBuffer(this._colorBuffer);
        this._gl = null;
        this._program = null;
      },

      render(context: WebGLRenderingContext, viewMatrix: Float32Array, projectionMatrix: Float32Array) {
        // [4.5.0 Update] Intercept and cache matrices for the outside Raycaster
        this._lastViewMatrix = new Float32Array(viewMatrix);
        this._lastProjMatrix = new Float32Array(projectionMatrix);
        const gl = context;
        const program = this._program;
        if (!program || !this._positionBuffer || this._vertexCount === 0) return;

        gl.useProgram(program);

        gl.uniformMatrix4fv(this._uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrixLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(this._uModelMatrixLoc, false, this._modelMatrix);
        if (this._uPixelRatioLoc) gl.uniform1f(this._uPixelRatioLoc, this._pixelRatio);

        gl.uniform1f(this._uIsHighlightDrawLoc, 0.0);

        gl.enableVertexAttribArray(this._aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);

        if (this._aColorLoc >= 0 && this._colorBuffer) {
          gl.enableVertexAttribArray(this._aColorLoc);
          gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);

          // Tell WebGL to expect 4 numbers (RGBA) instead of 3!
          gl.vertexAttribPointer(this._aColorLoc, 4, gl.FLOAT, false, 0, 0);
        }

        // [4.5.0 Update] Tell GPU how to read the Lasso selection flags
        if (this._aLassoLoc >= 0 && this._lassoBuffer) {
          gl.enableVertexAttribArray(this._aLassoLoc);
          gl.bindBuffer(gl.ARRAY_BUFFER, this._lassoBuffer);
          gl.vertexAttribPointer(this._aLassoLoc, 1, gl.FLOAT, false, 0, 0);
        }

        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(false);
        gl.drawArrays(gl.POINTS, 0, this._vertexCount);
        gl.depthMask(true);

        if (this._selectedIndex >= 0 && this._highlightBuffer) {
          gl.uniform1f(this._uIsHighlightDrawLoc, 1.0);
          gl.bindBuffer(gl.ARRAY_BUFFER, this._highlightBuffer);
          gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);
          gl.disableVertexAttribArray(this._aColorLoc);
          gl.vertexAttrib4f(this._aColorLoc, 255, 255, 0, 255);
          gl.disable(gl.DEPTH_TEST);
          gl.drawArrays(gl.POINTS, 0, 1);
          gl.enable(gl.DEPTH_TEST);
        }

        gl.disableVertexAttribArray(this._aPositionLoc);
        if (this._aColorLoc >= 0) gl.disableVertexAttribArray(this._aColorLoc);
        // [4.5.0 Update] Cleanup
        if (this._aLassoLoc >= 0) gl.disableVertexAttribArray(this._aLassoLoc);
      },
    };

    try {
      this.mapillaryViewer.addCustomRenderer(renderer);
      this._pointCloudRendererActive = true;
      this._pointCloudViewerRenderer = renderer;
    } catch (err) {
      console.warn("Could not attach point cloud viewer renderer:", err);
    }
  }

  /**
   * Removes the MapillaryJS WebGL point cloud renderer from the viewer.
   */
  private removeViewerPointCloudRenderer() {
    if (!this.mapillaryViewer || !this._pointCloudRendererActive) return;
    try {
      this.mapillaryViewer.removeCustomRenderer("point-cloud-renderer");
    } catch (err) {
      console.warn("Could not remove point cloud viewer renderer:", err);
    }
    this._pointCloudRendererActive = false;
  }

  /**
   * Removes the point cloud GraphicsLayer from the map and resets state.
   * @param resetState If true, also resets pointCloudAvailable to undefined.
   *                   Pass false when clearing before a reload so the loading
   *                   spinner state is not interrupted.
   */
  private clearPointCloud = (resetState: boolean = true) => {
    this._pointCloudModeActive = false; this._pointCloudAutoFailures = 0;
    const { jimuMapView } = this.state;
    const ownerView = this._pointCloudLayerView || jimuMapView?.view;
    this._pointCloudAdaptiveDisplay?.dispose();
    this._debouncedNudgeRender?.cancel?.();
    this._pointCloudQueueVersion = (this._pointCloudQueueVersion || 0) + 1;
    this._pointCloudAbort?.abort(); this._pointCloudAbort = null; ++this._pointCloudRequest; ++this._pointCloudRenderRequest;
    if (this._pointCloudAutoTimer) clearTimeout(this._pointCloudAutoTimer); this._pointCloudAutoTimer = null;
    if (this._pointCloudLayer) {
      this._pointCloudLayerView?.map?.remove(this._pointCloudLayer);
      this._pointCloudLayer.destroy(); this._pointCloudLayer = null;
    }
    this._pointCloudFeatures.clear(); this._pointCloudIndexByOriginal.clear(); this._pointCloudViewerObjectIds = []; this._pointCloudMapUpdating = false; this._pointCloudLayerResult = null; this._pointCloudLayerView = null;
    this._currentPointCloudResult = null;
    this.removeViewerPointCloudRenderer();

    this._filteredPointCloudPoints = [];

    // DEACTIVATE ALL POINT-CLOUD-DEPENDENT TOOLS
    // Measure mode
    if (this.state.isMeasureMode) {
      this.setState({ isMeasureMode: false, measurePoints: [] }, () => {
        if (this.state.jimuMapView?.view?.map && !this.state.jimuMapView.view.destroyed) this.updateMeasurementGraphics(); // clears the 3D line from map + viewer
      });
    }

    // Line of Sight
    if (this.state.isSightMode) {
      if (this._sightViewModel) this._sightViewModel.clear();
      this.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });
    }

    // Viewshed
    if (this.state.isViewshedMode) {
      this.clearViewshed();
      this.setState({ isViewshedMode: false });
    }

    // Lidar Grid Rings
    if (this._gridLayer) {
      const { jimuMapView } = this.state;
      try {
        ownerView?.map?.remove(this._gridLayer);
        this._gridLayer.destroy();
      } catch (e) {
        // ignore if view already torn down
      }
      this._gridLayer = null;
    }

    this._gridLayerReady = null;

    // Cancel any in-flight async ring-draw from before the clear
    this._ringGeneration++;

    // Calibration panel
    if (this.state.showCalibrationPanel) {
      this.setState({ showCalibrationPanel: false });
    }

    if (resetState) {
      this.setState({
        pointCloudPrevious: false, pointCloudAutoPaused: false, pointCloudVisible: false, pointCloudLoading: false, pointCloudSummary: undefined, pointCloudIncomplete: false,
        pointCloudAvailable: undefined,
      });
    }

    // [4.5.0 Update] Ensure Lasso clears out when the point cloud is deactivated
    if (this.state.isLassoMode) {
      this.clearLasso();
      this.setState({ isLassoMode: false });
    }
  };

  /**
   * Toggles the point cloud layer.
   * - If a cloud is loaded and visible: removes it
   * - If no cloud is loaded: triggers a fresh load
   * The toggle is image-aware, switching to a new image clears the
   * previous cloud automatically via the image change event handler.
   */
  private togglePointCloud = () => {
    if (this._pointCloudModeActive || this.state.pointCloudVisible || this.state.pointCloudLoading || this._pointCloudAutoTimer) {
      this.clearPointCloud(true);
    } else {
      this.loadPointCloudLayer();
    }
  };

  // The debounced function to redraw the layer when you stop pressing keys
  private _debouncedNudgeRender = debounceUtil(() => {
    // Redraw Esri Map (this also calls drawConcentricRings internally,
    // but we call it explicitly here too to clear stale rings immediately
    // before the heavier layer rebuild finishes)
    this.renderPointCloudMapLayer();
    this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);

    // Update colors in the viewer (in case they shifted up/down)
    if (this._pointCloudViewerRenderer) {
      this._pointCloudViewerRenderer.updateColors();
      if (this.mapillaryViewer) this.mapillaryViewer.resize();
    }
  }, 150);

  /**
   * Toggles the 3D Line of Sight Mode on and off.
   */
  private toggleSightMode = () => {
    this.setState(
      (prev) => {
        const nextSight = !prev.isSightMode;
        const updates: any = {
          isSightMode: nextSight,
          sightObserver: null,
          sightTargets: [],
        };

        // Prevent clash: Automatically turn off Measure Mode if it was on
        if (nextSight && prev.isMeasureMode) {
          updates.isMeasureMode = false;
          updates.measurePoints = [];
        }
        return updates;
      },
      async () => {
        // Update Measure graphics to clear the lines if we just turned it off
        if (!this.state.isMeasureMode) {
          this.updateMeasurementGraphics();
        }

        if (this.state.isSightMode) {
          this.showToast(<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);

          if (!this._sightViewModel && this.state.jimuMapView) {
            try {
              const [LineOfSightViewModel] = await loadArcGISJSAPIModules(["esri/widgets/LineOfSight/LineOfSightViewModel"]);
              this._sightViewModel = new LineOfSightViewModel({
                view: this.state.jimuMapView.view,
              });
            } catch (e) {
              console.warn("Could not load LineOfSightViewModel", e);
            }
          }
        } else {
          this.clearSight();
        }
      },
    );
  };

  /**
   * Clears the current Line of Sight analysis.
   */
  private clearSight = () => {
    this.setState({ sightObserver: null, sightTargets: [] });
    if (this._sightViewModel) {
      this._sightViewModel.clear();
    }
  };

  /**
   * Toggles the 3D Viewshed Analysis Mode on and off.
   */
  private toggleViewshedMode = async () => {
    this.setState(
      (prev) => {
        const nextMode = !prev.isViewshedMode;
        const updates: any = { isViewshedMode: nextMode };

        // Prevent clashes: Automatically turn off other tools
        if (nextMode) {
          if (prev.isMeasureMode) {
            updates.isMeasureMode = false;
            updates.measurePoints = [];
            this.updateMeasurementGraphics();
          }
          if (prev.isSightMode) {
            updates.isSightMode = false;
            updates.sightObserver = null;
            updates.sightTargets = [];
            if (this._sightViewModel) this._sightViewModel.clear();
          }
        }
        return updates;
      },
      () => {
        if (this.state.isViewshedMode) {
          this.showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Viewshed size={14} /> 360° Viewshed Mode: Click on the point cloud to drop an observer.
            </span>,
            4000,
          );
        } else {
          this.clearViewshed();
        }
      },
    );
  };

  /**
   * Clears the current Viewshed analysis.
   */
  private clearViewshed = () => {
    if (this._viewshedAnalysis && this.state.jimuMapView) {
      // Cast to 'any' to bypass the TypeScript error for .analyses on MapView
      const view = this.state.jimuMapView.view as any;
      if (view.analyses) {
        view.analyses.remove(this._viewshedAnalysis);
      }
      this._viewshedAnalysis = null;
    }
  };

  /**
   * Toggles the 3D Measurement Mode on and off.
   */
  private toggleMeasureMode = () => {
    this.setState(
      (prev) => {
        const nextMeasure = !prev.isMeasureMode;
        const updates: any = {
          isMeasureMode: nextMeasure,
          measurePoints: [],
        };

        // Prevent clash: Automatically turn off Sight Mode if it was on
        if (nextMeasure && prev.isSightMode) {
          updates.isSightMode = false;
          updates.sightObserver = null;
          updates.sightTargets = [];
          if (this._sightViewModel) {
            this._sightViewModel.clear();
          }
          updates.isViewshedMode = false; // Turn off viewshed
          this.clearViewshed(); // Remove the red/green graphics
        }
        return updates;
      },
      () => {
        this.updateMeasurementGraphics();
        if (this.state.isMeasureMode) {
          this.showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.
            </span>,
            3000,
          );
        }
      },
    );
  };

  /**
   * Clears the current measurement and removes the 3D line from the map.
   */
  private clearMeasurement = () => {
    this.setState({ measurePoints: [] }, () => {
      this.updateMeasurementGraphics();
    });
  };

  // [4.5.0 Update] LASSO SELECTION LOGIC
  private toggleLassoMode = () => {
    this.setState(
      (prev) => {
        const nextMode = !prev.isLassoMode;
        const updates: any = {
          isLassoMode: nextMode,
          lassoPolygon: [],
          lassoSelectedObjectIds: [],
        };

        // Prevent clashes with other 3D tools. Auto-disable them if Lasso is activated.
        if (nextMode) {
          if (prev.isMeasureMode) {
            updates.isMeasureMode = false;
            updates.measurePoints = [];
            this.updateMeasurementGraphics();
          }
          if (prev.isSightMode) {
            updates.isSightMode = false;
            updates.sightObserver = null;
            updates.sightTargets = [];
            if (this._sightViewModel) this._sightViewModel.clear();
          }
          if (prev.isViewshedMode) {
            updates.isViewshedMode = false;
            this.clearViewshed();
          }
        }
        return updates;
      },
      () => {
        if (this.state.isLassoMode) {
          this.showToast(<span style={{ display: "flex", alignItems: "center", gap: "6px" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);
        } else {
          this.clearLasso();
        }
      },
    );
  };

  private clearLasso = () => {
    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });
    // 1. Clear ArcGIS Scene highlight
    if (this._lassoHighlightHandle) {
      this._lassoHighlightHandle.remove();
      this._lassoHighlightHandle = null;
    }
    if (this._pointCloudViewerRenderer) {
      this._pointCloudViewerRenderer.updateLasso([]);
      if (this.mapillaryViewer) this.mapillaryViewer.resize();
    }
  };

  // Starts the SVG polygon path when the user clicks or touches the viewer
  private handleLassoStart = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    this._isDrawingLasso = true;
    const rect = e.currentTarget.getBoundingClientRect();
    this.setState({
      lassoPolygon: [[e.clientX - rect.left, e.clientY - rect.top]],
    });

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Adds points to the polygon path as the finger/mouse moves
  private handleLassoMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // Fix: Use internal boolean flag instead of checking `e.buttons !== 1`
    // (e.buttons is 0 on many mobile touch browsers)
    if (!this._isDrawingLasso) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.setState((prev) => ({
      lassoPolygon: [...prev.lassoPolygon, [x, y]],
    }));
  };

  // Completes the polygon and triggers the 3D math calculation
  private handleLassoEnd = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!this._isDrawingLasso) return;
    this._isDrawingLasso = false;

    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    this.calculateLassoSelection();
  };

  // Applies the calculated ObjectIDs to the ArcGIS 3D Scene LayerView
  private highlightLassoInArcGIS() {
    if (!this.state.jimuMapView || !this._pointCloudLayer) return;

    this.state.jimuMapView.view
      .whenLayerView(this._pointCloudLayer)
      .then((layerView: __esri.FeatureLayerView) => {
        if (this._lassoHighlightHandle) {
          this._lassoHighlightHandle.remove();
          this._lassoHighlightHandle = null;
        }
        if (this.state.lassoSelectedObjectIds.length > 0) {
          this._lassoHighlightHandle = layerView.highlight(this.state.lassoSelectedObjectIds);
        }
      })
      .catch(() => {});
  }

  /**
   * [4.5.0 Core Math]
   * Projects every 3D coordinate from the Point Cloud back onto the 2D screen space
   * using the current WebGL View and Projection matrices.
   * It then uses a Ray-Casting algorithm to check if those 2D coordinates fall inside
   * the user's drawn SVG polygon.
   */
  private pointCloudObjectIds(indices: readonly number[]): number[] {
    return indices.map(index => this._pointCloudViewerObjectIds[index]).filter(Number.isFinite);
  }

  private calculateLassoSelection = () => {
    const { lassoPolygon } = this.state;
    if (lassoPolygon.length < 3) return; // Need at least a triangle

    const renderer = this._pointCloudViewerRenderer;

    // We require the cached matrices from the last render frame
    if (!renderer || !renderer._lastViewMatrix || !renderer._lastProjMatrix || !renderer._currentReference) return;

    const canvas = this.viewerContainer.current?.querySelector("canvas");
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const viewMat = renderer._lastViewMatrix;
    const projMat = renderer._lastProjMatrix;
    const ref = renderer._currentReference;

    const selectedIndices: number[] = [];

    // Manual 4x4 Matrix by 4x1 Vector multiplication (Required for WebGL coordinate projection)
    const transform = (m: Float32Array, v: number[]) => {
      return [
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
      ];
    };

    // Ray-casting algorithm for Point in Polygon check
    const pointInPolygon = (point: number[], vs: [number, number][]) => {
      let x = point[0],
        y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0],
          yi = vs[i][1];
        let xj = vs[j][0],
          yj = vs[j][1];
        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Mathematically project all 3D map points back onto the 2D Screen
    this._filteredPointCloudPoints.forEach((p, idx) => {
      // 1. Convert WGS84 to local ENU (East-North-Up) relative to the camera
      const enuCoords = geodeticToEnu(p.rawLon, p.rawLat, p.alt, ref.lng, ref.lat, ref.alt);
      // 2. Project into camera view space
      const vView = transform(viewMat, [enuCoords[0], enuCoords[1], enuCoords[2], 1.0]);
      // 3. Project into clip space
      const vClip = transform(projMat, vView);

      // If W (vClip[3]) is negative, the point is physically behind the camera's FOV
      if (vClip[3] <= 0) return; // Point is behind camera

      // 4. Perspective Divide to get Normalized Device Coordinates (NDC: -1.0 to 1.0)
      const ndcX = vClip[0] / vClip[3];
      const ndcY = vClip[1] / vClip[3];

      // Reject points way off screen (slight padding allowed for edge-drawing)
      if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) return;

      // 5. Convert NDC to actual screen pixels
      const screenX = ((ndcX + 1) * width) / 2;
      const screenY = ((1 - ndcY) * height) / 2;

      // 6. Test if screen pixel is inside the user's drawn shape
      if (pointInPolygon([screenX, screenY], lassoPolygon)) {
        selectedIndices.push(idx);
      }
    });

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

  /**
   * Draws the dots, the line, and the text label on the ArcGIS 3D Map.
   */
  private async updateMeasurementGraphics() {
    if (!this.state.jimuMapView) return;

    // 1. Create the layer if it doesn't exist yet
    if (!this._measureLayer) {
      const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
      this._measureLayer = new GraphicsLayer({
        id: "pc-measure-layer", title: "Point Cloud Measurements",
        elevationInfo: { mode: "relative-to-ground", offset: 0.5 }, // Must match the point cloud layer perfectly
      });
      this.state.jimuMapView.view.map.add(this._measureLayer);
    }

    this._measureLayer.removeAll();
    const pts = this.state.measurePoints;

    // Sync with the Mapillary Viewer BEFORE the early return!
    this.updateViewerMeasurementRenderer();

    // Now if the points are cleared, it stops here safely.
    if (pts.length === 0) {
      // FORCE the floating label to hide when cleared!
      if (this.measureLabelRef.current) {
        this.measureLabelRef.current.style.display = "none";
      }
      return;
    }

    const { Graphic } = this.ArcGISModules;

    // 2. Draw the clicked anchor points (Cyan for start, Magenta for end)
    pts.forEach((pt, i) => {
      const g = new Graphic({
        geometry: { type: "point", longitude: pt.mapLon, latitude: pt.mapLat, z: pt.mapZ, hasZ: true, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "point-3d",
          symbolLayers: [
            {
              type: "icon",
              resource: { primitive: "circle" },
              material: { color: i === 0 ? [0, 255, 255, 1] : [255, 0, 255, 1] },
              size: 6,
              outline: { color: [255, 255, 255, 1], size: 1.5 },
            },
          ],
        } as any,
      });
      this._measureLayer!.add(g);
    });

    // 3. Draw the Line & Calculate Distance if we have 2 points
    if (pts.length === 2) {
      const p1 = pts[0];
      const p2 = pts[1];

      // Draw a bright yellow line connecting them
      const line = new Graphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [p1.mapLon, p1.mapLat, p1.mapZ],
              [p2.mapLon, p2.mapLat, p2.mapZ],
            ],
          ],
          hasZ: true,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "line-3d",
          symbolLayers: [
            {
              type: "line",
              material: { color: [255, 255, 0, 1] },
              size: 4,
            },
          ],
        } as any,
      });
      this._measureLayer.add(line);

      // THE MATH: Calculate True 3D Distance using raw, unshifted coordinates
      const hDist = distanceMeters(p1.rawLat, p1.rawLon, p2.rawLat, p2.rawLon);
      const vDist = Math.abs(p2.alt - p1.alt);
      const tDist = Math.sqrt(hDist * hDist + vDist * vDist); // Pythagorean theorem
      const slopePct = hDist > 0 ? (vDist / hDist) * 100 : 0; // Slope Percentage!

      const labelText = `${tDist.toFixed(2)}m\nSlope: ${slopePct.toFixed(1)}%`;

      // Update our floating HTML label text
      if (this.measureLabelRef.current) {
        this.measureLabelRef.current.innerText = labelText;
      }

      // Find the midpoint to place the label on the ArcGIS 3D Map
      const midLon = (p1.mapLon + p2.mapLon) / 2;
      const midLat = (p1.mapLat + p2.mapLat) / 2;
      const midZ = (p1.mapZ + p2.mapZ) / 2;

      // Add floating 3D Text to ArcGIS
      const text = new Graphic({
        geometry: { type: "point", longitude: midLon, latitude: midLat, z: midZ + 0.5, hasZ: true, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "text",
          text: labelText,
          color: [255, 255, 255, 1],
          haloColor: [0, 0, 0, 0.8],
          haloSize: 1.5,
          font: { size: 12, weight: "bold" },
        } as any,
      });
      this._measureLayer.add(text);
    } else {
      // Hide the HTML label if they clear the measurement
      if (this.measureLabelRef.current) {
        this.measureLabelRef.current.style.display = "none";
      }
    }

    // Sync the 3D measurement to the Mapillary Panoramic Viewer!
    this.updateViewerMeasurementRenderer();
  }

  /**
   * Triggers the WebGL renderer to update or clear the measurement graphics inside the viewer
   */
  private updateViewerMeasurementRenderer() {
    if (!this.mapillaryViewer) return;

    const pts = this.state.measurePoints;

    // If no points, remove the renderer completely to clear the view
    if (pts.length === 0) {
      if (this._measurementRendererActive) {
        try {
          this.mapillaryViewer.removeCustomRenderer("measurement-line-renderer");
        } catch (e) {}
        this._measurementRendererActive = false;
        this._measurementViewerRenderer = null;
        this.mapillaryViewer.resize(); // Force redraw
      }
      return;
    }

    // Add renderer if missing, otherwise just update the point coordinates
    if (!this._measurementRendererActive) {
      this.addMeasurementRenderer();
    } else if (this._measurementViewerRenderer) {
      this._measurementViewerRenderer.updatePositions(pts);
      this.mapillaryViewer.resize(); // Force redraw
    }
  }

  /**
   * Builds and attaches a Custom WebGL Renderer that draws the 3D measurement line
   * and anchor points directly into the Mapillary panoramic space.
   */
  private addMeasurementRenderer() {
    if (!this.mapillaryViewer) return;

    const vsSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            varying vec3 vColor;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelMatrix;
            uniform float uPixelRatio;

            void main(void) {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
                gl_PointSize = 16.0 * uPixelRatio;
                vColor = aColor;
            }
        `;

    const fsSource = `
            precision mediump float;
            uniform float uIsPoint;
            varying vec3 vColor;

            void main(void) {
                if (uIsPoint > 0.5) {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    if (dist > 0.35) {
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    } else {
                        gl_FragColor = vec4(vColor, 1.0);
                    }
                } else {
                    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
                }
            }
        `;

    const widget = this;

    const renderer: any = {
      id: "measurement-line-renderer",
      // RenderPass: 3 is Transparent Mode. It forces this renderer to draw
      // LAST, directly on top of the Opaque Point Cloud (Pass 2) and Image (Pass 1).
      renderPass: 3,
      _gl: null,
      _program: null,
      _positionBuffer: null,
      _colorBuffer: null,
      _modelMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
      _currentReference: null,
      _vertexCount: 0,

      onAdd(viewer: any, reference: any, context: WebGLRenderingContext) {
        const gl = context;
        this._gl = gl;
        this._currentReference = reference;

        const compile = (type: number, src: string) => {
          const s = gl.createShader(type)!;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };

        const vs = compile(gl.VERTEX_SHADER, vsSource);
        const fs = compile(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        this._program = program;

        this._uViewMatrixLoc = gl.getUniformLocation(program, "uViewMatrix");
        this._uProjectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        this._uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
        this._uPixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");
        this._uIsPointLoc = gl.getUniformLocation(program, "uIsPoint");
        this._aPositionLoc = gl.getAttribLocation(program, "aPosition");
        this._aColorLoc = gl.getAttribLocation(program, "aColor");

        this._positionBuffer = gl.createBuffer()!;
        this._colorBuffer = gl.createBuffer()!;

        this.updatePositions(widget.state.measurePoints);
      },

      onReference(viewer: any, reference: any) {
        this._currentReference = reference;
        this.updatePositions(widget.state.measurePoints);
      },

      updatePositions(pts: any[]) {
        const gl = this._gl;
        if (!gl || !this._positionBuffer || !this._colorBuffer || !this._currentReference) return;

        this._vertexCount = pts.length;
        if (pts.length === 0) return;

        const positions = new Float32Array(pts.length * 3);
        const colors = new Float32Array(pts.length * 3);

        pts.forEach((pt, i) => {
          const enu = geodeticToEnu(pt.rawLon, pt.rawLat, pt.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);
          positions[i * 3] = enu[0];
          positions[i * 3 + 1] = enu[1];
          positions[i * 3 + 2] = enu[2];

          if (i === 0) {
            colors[i * 3] = 0.0;
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;
          } else {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.0;
            colors[i * 3 + 2] = 1.0;
          }
        });

        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        // Switch to DYNAMIC_DRAW to stop graphics drivers from failing during fast updates
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
      },

      onRemove(viewer: any, context: WebGLRenderingContext) {
        const gl = context;
        if (this._program) gl.deleteProgram(this._program);
        if (this._positionBuffer) gl.deleteBuffer(this._positionBuffer);
        if (this._colorBuffer) gl.deleteBuffer(this._colorBuffer);
        this._gl = null;
      },

      render(context: WebGLRenderingContext, viewMatrix: Float32Array, projectionMatrix: Float32Array) {
        const gl = context;
        const program = this._program;
        if (!program || !this._positionBuffer || this._vertexCount === 0) return;

        gl.useProgram(program);

        gl.uniformMatrix4fv(this._uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrixLoc, false, projectionMatrix);
        gl.uniformMatrix4fv(this._uModelMatrixLoc, false, this._modelMatrix);
        gl.uniform1f(this._uPixelRatioLoc, window.devicePixelRatio || 1);

        gl.enableVertexAttribArray(this._aPositionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.vertexAttribPointer(this._aPositionLoc, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(this._aColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.vertexAttribPointer(this._aColorLoc, 3, gl.FLOAT, false, 0, 0);

        // ROBUST RENDERING STATE
        // Disable depth testing completely so it draws ON TOP of the imagery and point cloud
        gl.disable(gl.DEPTH_TEST);

        // Enable Blending for crisp anti-aliased points
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // 1. Draw the connecting yellow line (Only if 2 points exist)
        if (this._vertexCount === 2) {
          gl.uniform1f(this._uIsPointLoc, 0.0);
          gl.lineWidth(3.0);
          gl.drawArrays(gl.LINES, 0, 2);
        }

        // 2. Draw the Cyan & Magenta anchor points on top
        gl.uniform1f(this._uIsPointLoc, 1.0);
        gl.drawArrays(gl.POINTS, 0, this._vertexCount);

        // RESTORE RENDERING STATE
        // Protects Mapillary JS from breaking after our draw cycle
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);

        gl.disableVertexAttribArray(this._aPositionLoc);
        gl.disableVertexAttribArray(this._aColorLoc);

        // DYNAMIC HTML TEXT TRACKING
        if (this._vertexCount === 2 && widget.measureLabelRef.current) {
          const pts = widget.state.measurePoints;
          const p1 = pts[0];
          const p2 = pts[1];

          if (this._currentReference && p1 && p2) {
            const transform = (m: Float32Array, v: number[]) => [
              m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
              m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
              m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
              m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
            ];

            const enu1 = geodeticToEnu(p1.rawLon, p1.rawLat, p1.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);
            const enu2 = geodeticToEnu(p2.rawLon, p2.rawLat, p2.alt, this._currentReference.lng, this._currentReference.lat, this._currentReference.alt);

            const midX = (enu1[0] + enu2[0]) / 2;
            const midY = (enu1[1] + enu2[1]) / 2;
            const midZ = (enu1[2] + enu2[2]) / 2;

            const vView = transform(viewMatrix, [midX, midY, midZ, 1.0]);
            const vClip = transform(projectionMatrix, vView);

            if (vClip[3] > 0) {
              const ndcX = vClip[0] / vClip[3];
              const ndcY = vClip[1] / vClip[3];

              if (ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1) {
                const canvas = widget.viewerContainer.current?.querySelector("canvas");
                if (canvas) {
                  const screenX = ((ndcX + 1) * canvas.clientWidth) / 2;
                  const screenY = ((1 - ndcY) * canvas.clientHeight) / 2;

                  widget.measureLabelRef.current.style.left = `${screenX}px`;
                  widget.measureLabelRef.current.style.top = `${screenY}px`;
                  widget.measureLabelRef.current.style.display = "block";
                }
              } else {
                widget.measureLabelRef.current.style.display = "none";
              }
            } else {
              widget.measureLabelRef.current.style.display = "none";
            }
          }
        } else if (widget.measureLabelRef.current) {
          widget.measureLabelRef.current.style.display = "none";
        }
      },
    };

    try {
      this.mapillaryViewer.addCustomRenderer(renderer);
      this._measurementRendererActive = true;
      this._measurementViewerRenderer = renderer;
      this.mapillaryViewer.resize();
    } catch (e) {
      console.warn("Could not attach measurement renderer:", e);
    }
  }

  /**
   * Checks if the user has driven off the edge of the current point cloud cluster.
   * If they enter a new cluster, it automatically downloads the next 3D block seamlessly!
   */
  private checkAndLoadNextPointCloud = (newImageId: string) => {
    if (this.state.isFullscreen) {
      this.setState({ pointCloudPrevious: !!this._currentPointCloudResult && this._currentPointCloudResult.imageId !== newImageId });
      return;
    }
    if (!this._pointCloudModeActive && !this.state.pointCloudVisible && !this.state.pointCloudLoading) return;
    if (!this.state.pointCloudFollowImages) {
      this.clearPointCloud(true);
      this.showToast("Point cloud closed for browsing. Choose Auto-follow in its mode menu to keep it active.", 3500);
      return;
    }
    this.setState({ pointCloudPrevious: !!this._currentPointCloudResult && this._currentPointCloudResult.imageId !== newImageId });
    if (this.state.pointCloudAutoPaused) return;
    this._pointCloudAbort?.abort(); ++this._pointCloudRequest;
    if (this._pointCloudAutoTimer) clearTimeout(this._pointCloudAutoTimer);
    this._pointCloudAutoTimer = setTimeout(() => {
      this._pointCloudAutoTimer = null;
      if (!this.state.isFullscreen && !this.state.pointCloudAutoPaused && this.state.pointCloudFollowImages && this.state.imageId === newImageId && (this._pointCloudModeActive || this.state.pointCloudVisible || this.state.pointCloudLoading)) void this.loadPointCloudLayer(true);
    }, 250);
  };

  /**
   * Extracts the currently loaded point cloud, applies the user's Nudge calibrations,
   * and downloads it as a standard .CSV file for CAD/ArcGIS Pro import.
   */
  private downloadPointCloud = async (format: "csv" | "ply" | "las" = "csv") => {
    if (!this.state.pointCloudVisible || !this._currentPointCloudResult) { this.showToast("No point cloud available to export."); return; }
    if (this._pointCloudExportBusy) return;
    this._pointCloudExportBusy = true; this.setState({ pointCloudExportLoading: true });
    const exportResult = this._currentPointCloudResult, exportNudgeZ = this._nudgeZ;
    try {
      if (format === "ply" || format === "las") {
        this.showToast(`Preparing ${format.toUpperCase()} export…`, 10000);
        try {
          const writer = format === "las" ? buildPointCloudLas : buildPointCloudPly;
          const blob = await writer(exportResult.points, this._nudgeX, this._nudgeY, exportNudgeZ, this._cameraLat);
          const url = URL.createObjectURL(blob), link = document.createElement("a");
          link.href = url; link.download = `mapillary_3d_scan_${exportResult.imageId || this.state.imageId}.${format}`;
          document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
          this.showToast(format === "las" ? "LAS exported with WGS84 UTM coordinates and RGB. Source height datum is unverified." : "PLY exported: local metric XYZ and RGB. Origin is recorded in the file.");
        } catch (_) { this.showToast(`${format.toUpperCase()} export failed. Check that the cloud has valid coordinates${format === "las" ? " within UTM coverage" : ""}.`); }
        return;
      }
    this.showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        Preparing CSV Export...
      </span>,
      2000,
    );

    const csvContent = await buildPointCloudCsv(exportResult.points, this._nudgeX, this._nudgeY, exportNudgeZ, this._cameraLat);

    // 4. Trigger the Browser Download
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `mapillary_3d_scan_${exportResult.imageId || this.state.imageId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Check size={14} color="#37d582" />
          Point Cloud Exported!
        </span>,
        3000,
      );
    } catch (err) {
      console.error("Point Cloud download failed", err);
      this.showToast("Export failed.");
    }
    } finally { this._pointCloudExportBusy = false; if (!this._sharedNotesDisposed) this.setState({ pointCloudExportLoading: false }); }

  };

  /**
   * Updates the point cloud length radius filter.
   * Clamps the value, applies distance-based filtering, and refreshes the map + viewer.
   * @param newLength Radius in meters (0 = unlimited).
   */
  handlePointCloudLengthChange = (newLength: number) => {
    const clamped = newLength <= 0 ? 0 : Math.min(newLength, this.state.pointCloudMaxLength);

    const bearing = this.getStreetBearing();
    const rad = (bearing * Math.PI) / 180;
    const sinB = Math.sin(rad);
    const cosB = Math.cos(rad);

    // 1. Pull dynamic width from state
    const halfWidth = this.state.pointCloudWidth;

    this.setState({ pointCloudLength: clamped }, () => {
      if (!this.state.pointCloudVisible || !this._currentPointCloudResult) return;

      // 1. Refresh points (WebGL Map)
      this.renderPointCloudMapLayer();

      // 2. Refresh rings (GraphicsLayer)
      this.drawConcentricRings(clamped <= 0 ? this.state.pointCloudActualLength : clamped);

      // 3. Refresh viewer renderer (WebGL Viewer)
      if (this._pointCloudViewerRenderer) {
        const allPoints = this._currentPointCloudResult.points;

        // 2. Filter logic rewritten so Width ALWAYS applies, even if Radius is FULL
        const filteredPoints = allPoints.filter((p) => {
          const dy = (p.lat - this._cameraLat) * 111320;
          const dx = (p.lon - this._cameraLon) * 111320 * Math.cos((this._cameraLat * Math.PI) / 180);
          const forward = dx * sinB + dy * cosB;
          const right = dx * cosB - dy * sinB;

          // Always block parallel streets using the Corridor Width
          if (halfWidth > 0 && Math.abs(right) > halfWidth) return false;

          // If radius is not FULL (0), constrain Forward and Backward symmetrically
          if (clamped > 0) {
            if (forward < -clamped || forward > clamped) return false;
          }

          return true;
        });

        this._filteredPointCloudPoints = filteredPoints;

        this._pointCloudViewerRenderer.updatePoints(filteredPoints);
        if (this.mapillaryViewer) this.mapillaryViewer.resize();
      }
    });
  };

  private handlePointCloudWidthChange = (newWidth: number) => {
    const clamped = newWidth <= 0 ? 0 : Math.max(5, Math.min(newWidth, POINT_CLOUD_CONFIG.WIDTH_MAX));

    this.setState({ pointCloudWidth: clamped }, () => {
      if (!this.state.pointCloudVisible || !this._currentPointCloudResult) return;

      // 1. Refresh points (WebGL Map)
      this.renderPointCloudMapLayer();

      // 2. Refresh rings (GraphicsLayer)
      this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);

      // 3. Refresh viewer renderer (WebGL Viewer)
      if (this._pointCloudViewerRenderer) {
        const allPoints = this._currentPointCloudResult.points;
        const bearing = this.getStreetBearing();
        const rad = (bearing * Math.PI) / 180;
        const sinB = Math.sin(rad);
        const cosB = Math.cos(rad);
        const currentLength = this.state.pointCloudLength;
        const halfWidth = clamped;

        const filteredPoints = allPoints.filter((p) => {
          const dy = (p.lat - this._cameraLat) * 111320;
          const dx = (p.lon - this._cameraLon) * 111320 * Math.cos((this._cameraLat * Math.PI) / 180);
          const forward = dx * sinB + dy * cosB;
          const right = dx * cosB - dy * sinB;

          // Always apply width filter
          if (halfWidth > 0 && Math.abs(right) > halfWidth) return false;

          // Apply length radius filter if not FULL (0)
          if (currentLength > 0) {
            if (forward < -currentLength || forward > currentLength) return false;
          }
          return true;
        });

        this._filteredPointCloudPoints = filteredPoints;

        this._pointCloudViewerRenderer.updatePoints(filteredPoints);
        if (this.mapillaryViewer) this.mapillaryViewer.resize();
      }
    });
  };

  private async ensureGridLayer(): Promise<boolean> {
    const view = this.state.jimuMapView?.view;
    const result = this._currentPointCloudResult;
    if (!view?.map || view.destroyed || !result) return false;
    if (this._gridLayer?.destroyed) this._gridLayer = null;
    if (this._gridLayerReady) {
      await this._gridLayerReady;
      return !!this._gridLayer;
    }

    this._gridLayerReady = (async () => {
      if (!this._gridLayer) {
        const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
        if (this.state.jimuMapView?.view !== view || this._currentPointCloudResult !== result || view.destroyed || !view.map) return;
        if (!this._gridLayer) {
          this._gridLayer = new GraphicsLayer({
            id: "pc-grid-layer", title: "Point Cloud Distance Rings",
            elevationInfo: { mode: "relative-to-ground", offset: 0.5 },
          });
        }
      }
      try {
        if (this.state.jimuMapView?.view !== view || this._currentPointCloudResult !== result || view.destroyed) return;
        const map = view.map;
        if (map && !map.layers.includes(this._gridLayer)) {
          map.add(this._gridLayer);
        }
      } catch (e) {
        // View mid-teardown, ignore
      }
    })();

    await this._gridLayerReady;
    this._gridLayerReady = null;
    return !!this._gridLayer;
  }

  /**
   * Draws concentric distance rings around the camera to provide spatial scale.
   */
  private async drawConcentricRings(currentRadius: number) {
    if (!this.state.jimuMapView || !this.ArcGISModules) return;

    const myGeneration = ++this._ringGeneration;
    const layerReady = await this.ensureGridLayer();
    if (!layerReady || myGeneration !== this._ringGeneration) return;

    this._gridLayer.removeAll();

    const { Graphic } = this.ArcGISModules;

    const nudgeLat = this._nudgeY / 111320;
    const nudgeLon = this._nudgeX / (111320 * Math.cos((this._cameraLat * Math.PI) / 180));
    const centerLon = this._cameraLon + nudgeLon;
    const centerLat = this._cameraLat + nudgeLat;
    const mPerDegLat = 111320;
    const mPerDegLon = 111320 * Math.cos((centerLat * Math.PI) / 180);

    const halfWidth = this.state.pointCloudWidth;

    const effectiveLength = currentRadius > 0 ? currentRadius : (this.state.pointCloudActualLength ?? 100);
    const effectiveWidth = halfWidth > 0 ? halfWidth : (this.state.pointCloudActualWidth ?? 100);
    const effectiveMax = Math.max(effectiveLength, effectiveWidth);

    // Base step on the LARGER dimension so long corridors don't get flooded with rings.
    // Then clamp to a minimum of 10m so we never draw rings every 5m.
    const rawStep = effectiveMax / 6;
    const niceSteps = [10, 25, 50, 100, 200, 500];
    const step = Math.max(niceSteps.find((s) => s >= rawStep) ?? niceSteps[niceSteps.length - 1], 10);

    const allIntervals = new Set<number>();
    for (let r = step; r < effectiveMax; r += step) allIntervals.add(Math.round(r));
    allIntervals.add(effectiveLength);
    allIntervals.add(effectiveWidth);

    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);

    sortedIntervals.forEach((radius) => {
      const isLengthBoundary = radius === effectiveLength;
      const isWidthBoundary = radius === effectiveWidth;

      const isBoundary = isLengthBoundary || isWidthBoundary;
      const bearing = this.getStreetBearing();
      const radB = (bearing * Math.PI) / 180;
      const sinB = Math.sin(radB);
      const cosB = Math.cos(radB);

      const ringCoords: number[][] = [];

      // Draw as a true ellipse scaled to the corridor proportions.
      // Each ring's semi-axis = radius scaled by how far the corridor
      // extends in that direction, capped at the corridor boundary.
      const semiForward = Math.min(radius, effectiveLength);
      const semiRight = Math.min(radius, effectiveWidth);

      for (let i = 0; i <= 360; i += 3) {
        const rad = (i * Math.PI) / 180;
        const forward = semiForward * Math.cos(rad);
        const right = semiRight * Math.sin(rad);

        // Project back to lat/lon
        const finalDx = right * cosB + forward * sinB;
        const finalDy = -right * sinB + forward * cosB;

        ringCoords.push([centerLon + finalDx / mPerDegLon, centerLat + finalDy / mPerDegLat, 0]);
      }

      // Draw as a closed loop (connecting end back to start)
      const ringGraphic = new Graphic({
        geometry: {
          type: "polyline",
          paths: [[...ringCoords, ringCoords[0]]],
          hasZ: true,
          spatialReference: { wkid: 4326 },
        },
        symbol: {
          type: "simple-line",
          color: isLengthBoundary
            ? [255, 165, 0, 0.9] // orange for length
            : isWidthBoundary
              ? [255, 215, 0, 0.9] // gold for width
              : [0, 255, 255, 0.4], // cyan for intermediate
          width: isLengthBoundary || isWidthBoundary ? 3 : 1.5,
          style: "solid",
        } as any,
      });
      this._gridLayer!.add(ringGraphic);

      // Place labels at the most Forward, Backward, Left and Right points
      let bestFrontPt: number[] = ringCoords[0];
      let bestBackPt: number[] = ringCoords[0];
      let bestRightPt: number[] = ringCoords[0];
      let bestLeftPt: number[] = ringCoords[0];
      let maxFwd = -Infinity,
        minFwd = Infinity;
      let maxRgt = -Infinity,
        minRgt = Infinity;

      ringCoords.forEach((c: number[]) => {
        const dy = (c[1] - centerLat) * 111320;
        const dx = (c[0] - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180);
        const fwd = dx * sinB + dy * cosB;
        const rgt = dx * cosB - dy * sinB;

        if (fwd > maxFwd) {
          maxFwd = fwd;
          bestFrontPt = c;
        }
        if (fwd < minFwd) {
          minFwd = fwd;
          bestBackPt = c;
        }
        if (rgt > maxRgt) {
          maxRgt = rgt;
          bestRightPt = c;
        }
        if (rgt < minRgt) {
          minRgt = rgt;
          bestLeftPt = c;
        }
      });

      // Draw labels: length axis shows "Xm", width axis shows "Xm" in a different color
      const drawLabel = (pt: number[], text: string, isWidth: boolean) => {
        const label = new Graphic({
          geometry: { type: "point", longitude: pt[0], latitude: pt[1], z: 0, hasZ: true, spatialReference: { wkid: 4326 } },
          symbol: {
            type: "text",
            text,
            color: isBoundary ? (isWidth ? [255, 200, 0, 1] : [255, 255, 255, 1]) : isWidth ? [255, 200, 0, 0.85] : [0, 255, 255, 0.9],
            haloColor: [0, 0, 0, 0.8],
            haloSize: 1.5,
            font: { size: 10, weight: "bold" },
          } as any,
        });
        this._gridLayer!.add(label);
      };

      const lengthLabel = `${Math.round(semiForward)}m`;
      const widthLabel = `${Math.round(semiRight)}m`;

      // Length axis labels (front + back): cyan / white
      if (maxFwd - minFwd > 10) {
        drawLabel(bestFrontPt, lengthLabel, false);
        drawLabel(bestBackPt, lengthLabel, false);
      } else {
        drawLabel(bestFrontPt, lengthLabel, false);
      }

      // Width axis labels (left + right), yellow/amber
      // Only show if the ellipse is meaningfully wider than it is tall
      if (maxRgt - minRgt > 10 && Math.abs(semiRight - semiForward) > 5) {
        drawLabel(bestRightPt, widthLabel, true);
        drawLabel(bestLeftPt, widthLabel, true);
      }
    });
  }

  /**
   * Calculates the direction of the street based on the sequence path.
   * Looks 15 meters ahead to bypass micro-GPS jitter and keep the corridor perfectly straight.
   */
  private getStreetBearing(): number {
    const { sequenceImages, imageId } = this.state;
    if (!sequenceImages || !imageId) return this._lastBearing || 0;

    const currentIdx = sequenceImages.findIndex((img) => String(img.id) === String(imageId));
    if (currentIdx === -1) return this._lastBearing || 0;

    const currentImg = sequenceImages[currentIdx];

    // 1. Look ahead at least 15 meters to bypass GPS jitter
    for (let i = currentIdx + 1; i < sequenceImages.length; i++) {
      const img = sequenceImages[i];
      if (distanceMeters(currentImg.lat, currentImg.lon, img.lat, img.lon) >= 15) {
        return calculateBearing(currentImg.lat, currentImg.lon, img.lat, img.lon);
      }
    }

    // 2. If at the end, look behind at least 15 meters
    for (let i = currentIdx - 1; i >= 0; i--) {
      const img = sequenceImages[i];
      if (distanceMeters(img.lat, img.lon, currentImg.lat, currentImg.lon) >= 15) {
        return calculateBearing(img.lat, img.lon, currentImg.lat, currentImg.lon);
      }
    }

    // 3. Fallback to immediate neighbors
    if (currentIdx < sequenceImages.length - 1) {
      return calculateBearing(currentImg.lat, currentImg.lon, sequenceImages[currentIdx + 1].lat, sequenceImages[currentIdx + 1].lon);
    } else if (currentIdx > 0) {
      return calculateBearing(sequenceImages[currentIdx - 1].lat, sequenceImages[currentIdx - 1].lon, currentImg.lat, currentImg.lon);
    }

    return this._lastBearing || 0;
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

  private async ensureFieldNotesGroup(view: __esri.MapView | __esri.SceneView): Promise<__esri.GroupLayer | null> {
    if (this._fieldNotesGroupView === view && this._fieldNotesGroup && !this._fieldNotesGroup.destroyed) return this._fieldNotesGroup;
    if (this._fieldNotesGroupLoad) { await this._fieldNotesGroupLoad; if (this._fieldNotesGroupView === view) return this._fieldNotesGroup; }
    const revision = this._fieldNotesGroupRevision;
    const task = (async () => {
      const [GroupLayer] = await loadArcGISJSAPIModules(["esri/layers/GroupLayer"]);
      if (revision !== this._fieldNotesGroupRevision || view.destroyed || !view.map || this.state.jimuMapView?.view !== view || this._sharedNotesDisposed) return null;
      if (this._fieldNotesGroup) {
        this._fieldNotesGroupVisible = this._fieldNotesGroup.visible;
        this._fieldNotesGroupView?.map?.remove(this._fieldNotesGroup);
        this._fieldNotesGroup.destroy();
      }
      const group: __esri.GroupLayer = new GroupLayer({ id: "mapillary-field-notes", title: "Field Notes", visible: this._fieldNotesGroupVisible, visibilityMode: "independent" });
      this._fieldNotesGroup = group; this._fieldNotesGroupView = view; view.map.add(group); return group;
    })();
    this._fieldNotesGroupLoad = task;
    try { return await task; } finally { if (this._fieldNotesGroupLoad === task) this._fieldNotesGroupLoad = null; }
  }

  private clearFieldNotesGroup() {
    ++this._fieldNotesGroupRevision;
    this.clearPendingNoteGraphic();
    if (this._fieldNotesGroup) {
      this._fieldNotesGroupVisible = this._fieldNotesGroup.visible;
      this._fieldNotesGroupView?.map?.remove(this._fieldNotesGroup);
      this._fieldNotesGroup.destroy();
    }
    this._fieldNotesGroup = null; this._fieldNotesGroupView = null; this._fieldNotesLayer = null;
  }

  private sharedNotesUrl(read = false): string {
    return resolveEnterpriseNotesEndpoint(this.props.config, read);
  }

  private clearSharedNotesView() {
    ++this._sharedNotesRevision;
    this._sharedNotesPopupHandle?.remove(); this._sharedNotesPopupHandle = null;
    if (this._sharedNotesTimer) clearInterval(this._sharedNotesTimer);
    this._sharedNotesTimer = null;
    if (this._sharedNotesLayer) {
      this._fieldNotesGroup?.layers.remove(this._sharedNotesLayer);
      this._sharedNotesView?.map?.remove(this._sharedNotesLayer);
      this._sharedNotesLayer.destroy();
    }
    this._sharedNotesLayer = null; this._sharedNotesView = null;
  }

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
    const layer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url, id: "mapillary-shared-field-notes", title: "Enterprise Field Notes", outFields: ["category", "note_text", "image_id", "created_at"], refreshInterval: 0,
      elevationInfo: { mode: "on-the-ground" }, renderer: { type: "simple", symbol: { type: "simple-marker", style: "diamond", color: "#35b7c4", size: 12, outline: { color: "white", width: 1 } } },
      popupTemplate: { title: "Enterprise Field Note", content: [{ type: "fields", fieldInfos: [{ fieldName: "category", label: "Category" }, { fieldName: "note_text", label: "Note" }, { fieldName: "created_at", label: "Created", format: { dateFormat: "short-date-short-time" } }, { fieldName: "image_id", label: "Mapillary image" }] }] } });
    this._sharedNotesLayer = layer; this._sharedNotesView = view;
    this.setState({ sharedNotesMessage: "Loading enterprise notes…" });
    try {
      await layer.load();
      if (revision !== this._sharedNotesRevision || this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
      if (layer.geometryType !== "point" || !["category", "note_text", "image_id", "created_at"].every(name => layer.fields.some(field => field.name === name))) throw new Error("Enterprise notes layer does not match the documented point-layer schema.");
      const workflow = ["status", "resolution_note"].every(name => layer.fields.some(field => field.name === name));
      if (workflow) {
        layer.outFields = ["*"];
        layer.renderer = { type: "unique-value", field: "status", defaultSymbol: { type: "simple-marker", style: "diamond", color: "#35b7c4", size: 12, outline: { color: "white", width: 1 } }, uniqueValueInfos: [
          { value: "open", label: "Open", symbol: { type: "simple-marker", style: "diamond", color: "#35b7c4", size: 12 } },
          { value: "in_progress", label: "In progress", symbol: { type: "simple-marker", style: "diamond", color: "#f5a623", size: 12 } },
          { value: "completed", label: "Completed", symbol: { type: "simple-marker", style: "circle", color: "#05a056", size: 10 } },
          { value: "dismissed", label: "Dismissed", symbol: { type: "simple-marker", style: "circle", color: "#888888", size: 10 } }
        ] } as any;
        layer.popupTemplate = { title: "Enterprise Field Note", content: [{ type: "fields", fieldInfos: [
          { fieldName: "category", label: "Category" }, { fieldName: "note_text", label: "Note" },
          { fieldName: "status", label: "Status" }, { fieldName: "resolution_note", label: "Resolution" },
          { fieldName: "created_at", label: "Created", format: { dateFormat: "short-date-short-time" } }
        ] }], actions: [{ type: "button", id: "edit-enterprise-note", title: "Update note", className: "esri-icon-edit" }, { type: "button", id: "enterprise-note-attachments", title: "Attachments", className: "esri-icon-attachment" }] };
      }
      if (!workflow && layer.capabilities?.data?.supportsAttachment && layer.popupTemplate) layer.popupTemplate.actions?.add({ type: "button", id: "enterprise-note-attachments", title: "Attachments", className: "esri-icon-attachment" } as any);
      const group = await this.ensureFieldNotesGroup(view);
      if (!group || revision !== this._sharedNotesRevision || layer.destroyed) return;
      group.layers.add(layer); this.enforceMapillaryLayerOrder(view);
      this.setState({ sharedNotesMessage: "Enterprise map · updates every 15 seconds" });
      void this.drawFieldNoteGraphics();
      this._sharedNotesTimer = setInterval(() => {
        if (document.visibilityState !== "hidden" && revision === this._sharedNotesRevision && this.state.jimuMapView?.view === view && view.map && !view.destroyed && !layer.destroyed) layer.refresh();
      }, 15000);
    } catch (error) {
      if (revision !== this._sharedNotesRevision) return;
      this.clearSharedNotesView();
      this.setState({ sharedNotesMessage: "Enterprise notes unavailable. Local notes remain available. Retry or check the layer configuration." });
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
      await this.patchSharedFieldNote(id, { sharedStatus: "shared", sharedError: undefined });
      this._sharedNotesLayer?.refresh();
      if (!this._sharedNotesDisposed) this.showToast("Note shared with your organization.", 3000);
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
      this.setState({ fieldNoteEditor: { key: `shared:${globalId}:${revision}`, localId: local?.id, globalId, url,
        category: attrs.category || "Other", note: attrs.note_text || "", status: attrs.status || "open", resolutionNote: attrs.resolution_note || "", baseline: { ...attrs } } });
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
        this.setState({ fieldNoteEditor: null }); this.showToast(editor.globalId ? "Shared note updated." : "Local note updated. Enterprise record unchanged.", 3000);
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
    } catch (error) { if (!this._sharedNotesDisposed) this.showToast("Attachment download failed. Check your access or connection.", 5000); }
  };

  private loadFieldNotesFromStorage() {
    restoreLocalNotes(this.FIELD_NOTES_STORAGE_KEY, notes => {
      this.setState({ fieldNotes: notes }, () => {
        this.drawFieldNoteGraphics();
        this.updateViewerFieldNoteMarkers();
      });
    });
  }

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
  private toggleAnnotationMode = () => {
    this.setState(
      (prev) => ({
        isAnnotationMode: !prev.isAnnotationMode,
        pendingFieldNote: null,
        fieldNotesListOpen: false,
        nearbyStripOpen: false,
      }),
      () => {
        const isActive = this.state.isAnnotationMode;
        this.showToast(
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.Notes size={14} />
            {isActive ? "Field notes enabled" : "Field notes disabled"}
          </span>,
          2000,
        );
      },
    );
  };

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
      isVisible: () => (this._fieldNotesGroup?.visible ?? this._fieldNotesGroupVisible) !== false,
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
  private handleAnnotationMapClick = (lon: number, lat: number, alt?: number) => {
    // 1. Show an orange/amber ripple effect at the clicked location
    this.drawClickRipple(lon, lat, [245, 166, 35], 0.7, 2);

    // 2. Add a temporary pulsing marker on the map while the form remains open
    this.drawPendingNoteGraphic(lon, lat, alt);

    // 3. Open the note input modal
    this.setState({
      pendingFieldNote: { lon, lat, alt, imageId: this.state.imageId },
    });
  };

  /**
   * Submits and saves a pending field note to state, LocalStorage, and 2D/3D renderers.
   * @param category Selected category for the note.
   * @param note Optional description or comment text.
   */
  private submitFieldNote = (category: string, note: string, share = false) => {
    const { pendingFieldNote } = this.state;
    if (!pendingFieldNote) return;

    this.clearPendingNoteGraphic();

    const newNote: FieldNote = {
      id: `note_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      source: "manual",
      category,
      note,
      lon: pendingFieldNote.lon,
      lat: pendingFieldNote.lat,
      alt: pendingFieldNote.alt,
      imageId: pendingFieldNote.imageId,
      createdAt: Date.now(),
    };

    const updated = [...this.state.fieldNotes, newNote];
    this.setState({ fieldNotes: updated, pendingFieldNote: null }, () => {
      this.saveFieldNotesToStorage(updated);
      this.drawFieldNoteGraphics();
      this.updateViewerFieldNoteMarkers();
      if (share) void this.publishFieldNote(newNote.id);
      this.showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Check size={14} color="#37d582" /> Object saved as note
        </span>,
        2000,
      );
    });
  };

  /**
   * Cancels the currently pending field note creation and closes the entry modal.
   */
  private cancelPendingFieldNote = () => {
    this.clearPendingNoteGraphic();
    this.setState({ pendingFieldNote: null });
  };

  /**
   * Deletes a field note by its unique identifier and synchronizes state, storage, and graphics.
   * @param id Unique identifier of the note to remove.
   */
  private deleteFieldNote = (id: string) => {
    if (this._sharedNoteSaves.has(id) || this.state.fieldNoteEditor?.saving) return;
    const updated = this.state.fieldNotes.filter((n) => n.id !== id);
    this.setState({ fieldNotes: updated }, () => {
      this.saveFieldNotesToStorage(updated);
      this.drawFieldNoteGraphics();
      this.updateViewerFieldNoteMarkers();
    });
  };

  /**
   * Clears all field notes, removes them from LocalStorage,
   * and clears the 2D map graphics & 3D viewer markers.
   */
  private clearAllFieldNotes = () => {
    if (!this.state.fieldNotes.length || this._sharedNoteSaves.size || this.state.fieldNoteEditor?.saving) return;

    // the button handles confirmation
    this.setState({ fieldNotes: [] }, () => {
      this.saveFieldNotesToStorage([]);
      this.drawFieldNoteGraphics();
      this.updateViewerFieldNoteMarkers();
      this.showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Check size={14} color="#37d582" /> {this.props.config.sharedFieldNotesEnabled ? "Local notes cleared. Enterprise notes remain." : "Local notes cleared."}
        </span>,
        2000,
      );
    });
  };
  /**
   * Centers the ArcGIS map on the selected field note and navigates
   * the Mapillary viewer to the associated image if one exists.
   * @param note The target field note to focus.
   */
  private focusFieldNote = (note: FieldNote) => {
    const view = this.state.jimuMapView?.view;
    if (!view) return;
    view.goTo({ center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });

    // If the note has an associated image, jump the viewer there too
    if (note.imageId && note.imageId !== this.state.imageId) {
      const img = this.state.sequenceImages.find((s) => s.id === note.imageId);
      if (img && this.mapillaryViewer) {
        this.mapillaryViewer.moveTo(note.imageId).catch(() => {});
      }
    }
  };

  /**
   * Renders all stored field notes as diamond-shaped graphic markers on the ArcGIS map view.
   * Orange diamonds denote manual entries, while green diamonds indicate AI detections.
   */
  private async drawFieldNoteGraphics() {
    const { jimuMapView } = this.state;
    const view = jimuMapView?.view;
    if (!view?.map || view.destroyed || !this.ArcGISModules) return;

    const is3D = view.type === "3d";

    if (!this._fieldNotesLayer) {
      const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
      if (!this._fieldNotesLayer) this._fieldNotesLayer = new GraphicsLayer({ id: "field-notes-layer", title: "Local Notes" });
    }

    const group = await this.ensureFieldNotesGroup(view);
    if (!group || this.state.jimuMapView?.view !== view || !this._fieldNotesLayer || this._fieldNotesLayer.destroyed) return;
    if (!group.layers.includes(this._fieldNotesLayer)) group.layers.add(this._fieldNotesLayer);

    this._fieldNotesLayer.removeAll();
    const { Graphic } = this.ArcGISModules;

    this.state.fieldNotes.forEach((n) => {
      if (n.sharedStatus === "shared" && n.sharedLayerUrl === this.props.config.sharedFieldNotesUrl?.trim().replace(/\/$/, "") && this._sharedNotesLayer?.loaded && this._sharedNotesView === view) return;
      const g = new Graphic(buildLocalNoteGraphic(n, is3D));
      this._fieldNotesLayer!.add(g);
    });
  }

  /**
   * Synchronizes and renders field notes in the Mapillary panoramic/perspective viewer.
   * Uses a custom WebGL renderer (field-notes-renderer) instead of DOM SimpleMarkers
   * to ensure proper 3D positioning, distance scaling, and alignment with Point Cloud data.
   */
  private updateViewerFieldNoteMarkers = () => {
    if (!this.mapillaryViewer) return;

    // Cleanup: Disable Mapillary's built-in MarkerComponent to prevent conflicts
    try {
      const markerComponent = this.mapillaryViewer.getComponent("marker");
      if (markerComponent) markerComponent.removeAll();
    } catch (e) {}

    const relevant = selectViewerFieldNotes(this.state.fieldNotes, this.state.sequenceImages, this.state.imageId, FIELD_NOTE_CONFIG.VIEWER_MAX_DIST_M, distanceMeters) ?? [];

    if (relevant.length === 0) {
      if ((this as any)._fieldNotesRendererActive) {
        try {
          this.mapillaryViewer.removeCustomRenderer("field-notes-renderer");
        } catch (e) {}
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
        return selectViewerFieldNotes(this.state.fieldNotes, this.state.sequenceImages, this.state.imageId, 60, distanceMeters);
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
  private exportFieldNotes = () => {
    const { fieldNotes } = this.state;
    if (!fieldNotes.length) {
      this.showToast("Dışa aktarılacak not bulunamadı.");
      return;
    }

    const featureCollection = fieldNotesToGeoJson(fieldNotes);

    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `field_notes_${Date.now()}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Field notes export failed", err);
    }
  };

  /**
   * Imports field notes from an external GeoJSON file.
   * Parses 3D coordinates (coordinates[2]) or properties.alt, skips duplicates by ID,
   * and updates application state, storage, and renderers.
   * @param file The GeoJSON file selected by the user.
   */
  private importFieldNotesFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const geojson = JSON.parse(raw);

        const imported = fieldNotesFromGeoJson(geojson);

        if (!imported.length) {
          this.showToast("Dosyada geçerli not bulunamadı.");
          return;
        }

        // Deduplicate incoming notes against existing IDs
        const existingIds = new Set(this.state.fieldNotes.map((n) => n.id));
        const newOnes = imported.filter((n) => !existingIds.has(n.id));
        const skipped = imported.length - newOnes.length;

        const merged = [...this.state.fieldNotes, ...newOnes];

        this.setState({ fieldNotes: merged }, () => {
          this.saveFieldNotesToStorage(merged);
          this.drawFieldNoteGraphics();
          this.updateViewerFieldNoteMarkers();

          this.showToast(
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icons.Check size={14} color="#37d582" />
              {newOnes.length} not içe aktarıldı{skipped > 0 ? ` (${skipped} yinelenen atlandı)` : ""}
            </span>,
            3000,
          );
        });
      } catch (err) {
        console.error("Field notes import failed:", err);
        this.showToast("Dosya okunamadı — geçerli bir Field Notes GeoJSON dosyası olmalı.");
      }
    };

    reader.onerror = () => {
      this.showToast("Dosya okunamadı.");
    };

    reader.readAsText(file);
  };

  // #endregion FIELD NOTES

  // #region SOLAR & SHADOW MODELING

  /** Keep the map-layer lifetime independent from viewer rendering and native lighting resources. */
  private ensureSolarMapOverlay(): SolarMapOverlay<__esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {
    return this._solarMapOverlay ??= new SolarMapOverlay();
  }
  private toggleSolarMode = async () => {
    if (this.props.config.enableSolar !== true) return;
    this.setState(
      (prev) => {
        const nextMode = !prev.isSolarMode;

        // Auto-disable conflicting tools
        if (nextMode) {
          if (prev.isMeasureMode) {
            this.clearMeasurement();
          }
          if (prev.isSightMode) {
            this.clearSight();
          }
          if (prev.isViewshedMode) {
            this.clearViewshed();
          }
          if (prev.isLassoMode) {
            this.clearLasso();
          }
        }
        return { isSolarMode: nextMode };
      },
      () => {
        if (this.state.isSolarMode) {
          this.showToast("Solar Modeling Enabled. Sun position computed from photo metadata.", 3000);
          this.updateSolarGraphics();
        } else {
          this.clearSolarGraphics();
        }
      },
    );
  };

  /** Removes both the ArcGIS shadow lines and the WebGL Sun */
  private clearSolarGraphics = () => {
    const solarView = this.ensureSolarMapOverlay().clear(this.state.jimuMapView?.view);
    this._solarViewer?.detach(this.mapillaryViewer);

    this._solarSceneLighting?.restore(solarView);
  };

  /** Computes exact solar position and triggers renderer updates */
  private updateSolarGraphics = async () => {
    if (this.props.config.enableSolar !== true || !this.state.isSolarMode || !this.state.imageId || !this.state.jimuMapView) return;
    const overlay = this.ensureSolarMapOverlay();
    const request = ++overlay.revision;
    const solarView = this.state.jimuMapView.view;

    const currentImg = this.state.sequenceImages.find((img) => img.id === this.state.imageId);
    if (!currentImg || !currentImg.captured_at) {
      this.showToast("Cannot model solar data: Image is missing a timestamp.", 3000);
      this.clearSolarGraphics();
      return;
    }

    // Calculate astronomical position
    const sun = getSunPosition(currentImg.captured_at, currentImg.lat, currentImg.lon);

    if (sun.altitude <= 0) {
      this.showToast("Sun was below the horizon when this photo was taken (Night/Twilight).", 4000);
      this.clearSolarGraphics();
      return;
    }

    // 1. Draw ArcGIS Sun Beam & Shadow Vectors (Draped on ground so green dot stays on top)
    const map = solarView.map;
    if (!overlay.layer) {
      const [GraphicsLayer] = await loadArcGISJSAPIModules(["esri/layers/GraphicsLayer"]);
      if (request !== overlay.revision || !this.state.isSolarMode || this.props.config.enableSolar !== true || this.state.jimuMapView?.view !== solarView) return;
      overlay.create(solarView, properties => new GraphicsLayer(properties));
    }

    overlay.prepare(map);

    const { Graphic } = this.ArcGISModules;

    const metersToDegreesLat = (m: number) => m / 111320;
    const metersToDegreesLon = (m: number, refLat: number) => m / (111320 * Math.cos((refLat * Math.PI) / 180));

    // CLEARANCE BUBBLE: Start vectors 6m away from car so the green pulsing point is 100% unobstructed
    const innerGap = 6;

    // COMPACT SHADOW MATH:
    // Modeled on vehicle height (2m) instead of a 5m pole, clamped between 14m and 32m
    const radAlt = sun.altitude * (Math.PI / 180);
    const realShadowLen = 2.0 / Math.tan(radAlt);
    const shadowDist = Math.min(Math.max(realShadowLen, 14), 32);
    const shadowAzimuth = (sun.azimuth + 180) % 360;
    const radShadowAz = shadowAzimuth * (Math.PI / 180);

    // Shadow points: starts 6m outside car, ends at (6 + shadowDist)m
    const shadowStartLon = currentImg.lon + metersToDegreesLon(innerGap * Math.sin(radShadowAz), currentImg.lat);
    const shadowStartLat = currentImg.lat + metersToDegreesLat(innerGap * Math.cos(radShadowAz));
    const shadowEndLon = currentImg.lon + metersToDegreesLon((innerGap + shadowDist) * Math.sin(radShadowAz), currentImg.lat);
    const shadowEndLat = currentImg.lat + metersToDegreesLat((innerGap + shadowDist) * Math.cos(radShadowAz));

    // COMPACT SUN BEAM:
    // Points toward sun, starts 6m outside car, ends at 24m
    const radSunAz = sun.azimuth * (Math.PI / 180);
    const sunStartLon = currentImg.lon + metersToDegreesLon(innerGap * Math.sin(radSunAz), currentImg.lat);
    const sunStartLat = currentImg.lat + metersToDegreesLat(innerGap * Math.cos(radSunAz));
    const sunEndLon = currentImg.lon + metersToDegreesLon((innerGap + 18) * Math.sin(radSunAz), currentImg.lat);
    const sunEndLat = currentImg.lat + metersToDegreesLat((innerGap + 18) * Math.cos(radSunAz));

    // A. SHADOW VECTOR: Subtle white halo + dark dashed core
    overlay.layer!.add(
      new Graphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [shadowStartLon, shadowStartLat],
              [shadowEndLon, shadowEndLat],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
        symbol: { type: "simple-line", color: [255, 255, 255, 0.85], width: 5 } as any,
      }),
    );
    overlay.layer!.add(
      new Graphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [shadowStartLon, shadowStartLat],
              [shadowEndLon, shadowEndLat],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
        symbol: { type: "simple-line", color: [30, 30, 30, 0.95], width: 2.5, style: "dash" } as any,
      }),
    );

    // B. SHADOW LABEL (Small, crisp, unobtrusive)
    overlay.layer!.add(
      new Graphic({
        geometry: { type: "point", longitude: shadowEndLon, latitude: shadowEndLat, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "text",
          text: `🌑 ${Math.round(shadowAzimuth)}°`,
          color: [30, 30, 30, 1],
          haloColor: [255, 255, 255, 1],
          haloSize: 1.5,
          font: { size: 8, weight: "bold" },
        } as any,
      }),
    );

    // C. SUN BEAM (Clean golden line)
    overlay.layer!.add(
      new Graphic({
        geometry: {
          type: "polyline",
          paths: [
            [
              [sunStartLon, sunStartLat],
              [sunEndLon, sunEndLat],
            ],
          ],
          spatialReference: { wkid: 4326 },
        },
        symbol: { type: "simple-line", color: [255, 200, 0, 0.9], width: 2.5 } as any,
      }),
    );

    // D. SUN LABEL
    overlay.layer!.add(
      new Graphic({
        geometry: { type: "point", longitude: sunEndLon, latitude: sunEndLat, spatialReference: { wkid: 4326 } },
        symbol: {
          type: "text",
          text: `☀️ ${Math.round(sun.azimuth)}°`,
          color: [220, 140, 0, 1],
          haloColor: [255, 255, 255, 1],
          haloSize: 1.5,
          font: { size: 8, weight: "bold" },
        } as any,
      }),
    );

    // 2. Add Glowing WebGL Sun to Mapillary Viewer
    this.ensureSolarViewerOwner().update(this.mapillaryViewer, sun.azimuth, sun.altitude);

    // 3. Sync Native ArcGIS 3D Lighting & ShadowCast Widget
    if (this.state.jimuMapView && this.state.jimuMapView.view.type === "3d") {
      const view = this.state.jimuMapView.view as any;
      const photoDate = new Date(currentImg.captured_at);
      this.ensureSolarSceneLighting().update(view, photoDate, () =>
        request === overlay.revision && !!this.state.isSolarMode && this.props.config.enableSolar === true && this.state.jimuMapView?.view === solarView);
    }
  };

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
  private toggleElevationProfile = async () => {
    if (this.props.config.enableElevationProfile !== true) return;
    const next = !this.state.isElevationProfileActive;
    this.setState({ isElevationProfileActive: next }, () => {
      if (next) {
        this.updateElevationProfile();
        this.showToast("Elevation Profile generated along sequence.", 2500);
      } else {
        this.clearElevationProfile();
      }

      // ADD THIS: Re-draw the cone immediately to match the terrain state
      const { imageId, sequenceImages } = this.state;
      if (imageId && sequenceImages.length > 0) {
        const activeImg = sequenceImages.find((s) => s.id === imageId);
        if (activeImg) {
          const length = this.coneLengths[this.zoomStepIndex];
          const spread = this.coneSpreads[this.zoomStepIndex];
          this.clearConeGraphics();
          this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);
        }
      }
    });
  };

private clearElevationProfile = () => {
    this._elevationProfile?.clear(this.state.jimuMapView?.view);
  };

  /** Bind SDK factories once; profile resources and pending updates belong to this owner. */
  private ensureElevationProfileOwner(): ElevationProfileController {
    this._elevationProfile ??= new ElevationProfileController(
      ids => loadArcGISJSAPIModules(ids), () => this.ArcGISModules.Graphic,
    );
    return this._elevationProfile;
  }

  /** Feeds the active Mapillary sequence polyline into Esri's ElevationProfile widget */
private updateElevationProfile = async () => {
    const { jimuMapView, sequenceImages, isElevationProfileActive } = this.state;
    if (this.props.config.enableElevationProfile !== true || !isElevationProfileActive || !jimuMapView || !sequenceImages || sequenceImages.length < 2) return;
    const view = jimuMapView.view;
    await this.ensureElevationProfileOwner().update(view, sequenceImages, () =>
      this.props.config.enableElevationProfile === true && this.state.isElevationProfileActive && this.state.jimuMapView?.view === view);
  };

  /** Forward the current frame to the elevation chart's presentation module. */
private updateProfileIndicator = () => {
    updateElevationIndicator(this._elevationProfile?.widget, this.state.sequenceImages, this.state.imageId, this.state.isElevationProfileActive);
  };
  // #endregion ELEVATION PROFILE

  // #region Playback Management
  /**
   * Bypasses 403 Forbidden frames.
   * When Mapillary natively halts on a dead image, this function takes over,
   * loops forward until it finds a healthy image, and resumes native playback.
   */
  private forceSkipNext = async () => {
    if (this._userPaused) return;

    const { sequenceImages, imageId } = this.state;
    if (!sequenceImages || !imageId) return;

    let currentIndex = sequenceImages.findIndex((img) => img.id === imageId);
    if (currentIndex === -1 || currentIndex >= sequenceImages.length - 1) {
      this._userPaused = true; // End of sequence reached
      return;
    }

    let targetIndex = currentIndex + 1;
    let success = false;

    // Hunt forward for the next working frame (Aborts instantly if user clicks the screen)
    while (!success && targetIndex < sequenceImages.length && !this._userPaused) {
      const candidateImg = sequenceImages[targetIndex];
      try {
        // If it's a 403 on the CDN, moveTo will reject instantly
        await this.mapillaryViewer.moveTo(candidateImg.id);
        success = true;
      } catch (err) {
        console.warn(`[Auto-Skip] Frame ${candidateImg.id} is dead. Skipping to next...`);
        targetIndex++;
      }
    }

    // Once we successfully land on a healthy frame, hand control back to the Native Mapillary Player
    if (success && !this._userPaused) {
      const sequenceComponent = this.mapillaryViewer?.getComponent("sequence");
      if (sequenceComponent) {
        sequenceComponent.configure({ playing: true });
      }
    } else {
      this._userPaused = true;
    }
  };

  /**
   * Oynatma döngüsünü ve arka plan kare atlama isteklerini güvenle durdurur.
   */
  private stopSafePlayback = () => {
    // 1. Otomatik kare atlama (forceSkipNext) döngüsünü hemen kır
    this._userPaused = true;

    // 2. Mapillary Viewer nesnesi hala canlıysa yerel oynatıcıyı durdur
    try {
      if (this.mapillaryViewer) {
        const sequenceComponent = this.mapillaryViewer.getComponent("sequence");
        if (sequenceComponent) {
          sequenceComponent.configure({ playing: false });
        }
      }
    } catch (err) {
      // Viewer zaten DOM'dan sökülmüş veya dispose edilmişse hatayı yut
      console.warn("[Mapillary] Playback could not be stopped cleanly:", err);
    }
    this.refreshNearbyAfterPause();
  };
  //#endregion Playback Management

  private _arcGISModulesReady: Promise<void> | null = null;

  private async ensureArcGISModules(): Promise<void> {
    if (this.ArcGISModules?.VectorTileLayer) return;
    if (!this._arcGISModulesReady) {
      this._arcGISModulesReady = (async () => {
      const [Graphic, Point, SimpleMarkerSymbol, VectorTileLayer, FeatureLayer, GraphicsLayer, route, networkService, RouteParameters, FeatureSet, Multipoint, PointSymbol3D] = await loadArcGISJSAPIModules([
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/layers/VectorTileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/rest/route",
        "esri/rest/networkService",
        "esri/rest/support/RouteParameters",
        "esri/rest/support/FeatureSet",
        "esri/geometry/Multipoint",
        "esri/symbols/PointSymbol3D",
      ]);
      this.ArcGISModules = {
        Graphic,
        Point,
        SimpleMarkerSymbol,
        VectorTileLayer,
        FeatureLayer,
        GraphicsLayer,
        route,
        networkService,
        RouteParameters,
        FeatureSet,
        Multipoint,
        PointSymbol3D,
      };
      this.log("ArcGIS API modules loaded");
      })();
    }
    const task = this._arcGISModulesReady;
    try { await task; }
    catch (error) { if (this._arcGISModulesReady === task) this._arcGISModulesReady = null; throw error; }
  }

  private dismissIntro = () => this.setState({ showIntro: false });

  // Initial setup lifecycle
  // - Loads ArcGIS API modules dynamically (Graphic, Point, etc.),
  // - restores cache, loads Mapillary JS/CSS via CDN,
  // - and attaches resize/fullscreen event listeners.
  async componentDidMount() {
    try {
      await this.ensureArcGISModules();

      // 1. Read presets FIRST before creating any layer
      const presetStartDate = this.props.config.turboDefaultStartDate || undefined;
      const presetEndDate = this.props.config.turboDefaultEndDate || undefined;
      const presetIsPano = this.props.config.turboDefaultIsPano ?? undefined;
      const presetColorByDate = this.props.config.turboDefaultColorByDate ?? false;

      // 2. Resolve Default Creator ID if configured
      let defaultFilterId: number | undefined = undefined;
      if (this.props.config.turboCreator) {
        defaultFilterId = await this.getUserIdFromUsername(this.props.config.turboCreator);
        if (defaultFilterId) this.log(`Initializing Always-On layer for user ID: ${defaultFilterId}`);
      }

      // 3. Initialize layer with presets baked in from the start,
      //    so when onActiveViewChange adds it to the map it's already filtered
      this.initMapillaryLayer(defaultFilterId, presetStartDate, presetEndDate, presetIsPano, false);
      this.initMapillaryTrafficSignsLayer();
      this.initMapillaryObjectsLayer();

      // 4. Apply preset state, no debouncedTurboFilter needed since
      //    the layer was already created with correct filters above
      this.setState({
        turboFilterStartDate: presetStartDate || "",
        turboFilterEndDate: presetEndDate || "",
        turboFilterIsPano: presetIsPano,
        turboColorByDate: presetColorByDate,
      });
    } catch (err) {
      console.error("ArcGIS modules failed to load:", err);
    }

    // Restore any cached sequence from previous session
    this.restoreSequenceCache();
    this.loadFieldNotesFromStorage();
    void this.syncSharedFieldNotes();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.mapillaryViewer?.resize) {
        this.mapillaryViewer.resize();
      }
    });

    if (this.viewerContainer.current) {
      this.resizeObserver.observe(this.viewerContainer.current);
    }

    // Listen for browser fullscreen events
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", this.handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", this.handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", this.handleFullscreenChange);
    window.addEventListener("resize", this.handleWindowResize);

    // Add keyboard listener for W, A, S, D Point Cloud Nudging
    window.addEventListener("keydown", this.handleNudgeKeyDown);
    window.addEventListener("keyup", this.handleNudgeKeyUp);

    this.tooltipDiv = document.createElement("div");
    Object.assign(this.tooltipDiv.style, {
      position: "fixed",
      pointerEvents: "none",
      background: "rgba(0,0,0,0.7)",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
      zIndex: 999,
      fontSize: "11px",
      display: "none",
      maxWidth: "250px",
    });
    document.body.appendChild(this.tooltipDiv);

    // Defer the heavy processing by 500ms to let the Map widget render first
    setTimeout(() => {
      this.preloadTrafficSignOptions();
      this.preloadObjectOptions();
    }, 500);

    const styleSheet = document.createElement("style");
    styleSheet.innerText = overrideStyles;
    document.head.appendChild(styleSheet);

    if (this.props.config.turboCreator) {
      this.setState({ turboFilterUsername: this.props.config.turboCreator });
    }

    // Check if Turbo Mode Only is enabled in config
    {
      this.setState({ turboModeActive: true });
    }

    // Check if we need to add the "Always On" layer now
    // If the MapView loaded BEFORE these modules, onActiveViewChange skipped the add.
    this.ensureAlwaysOnCoverageLayer();
    this.syncMapLegendLayer();
  }

  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {
    if (prevState.pointCloudAdaptive !== this.state.pointCloudAdaptive || prevState.isMeasureMode !== this.state.isMeasureMode || prevState.isLassoMode !== this.state.isLassoMode || prevState.isSightMode !== this.state.isSightMode || prevState.isViewshedMode !== this.state.isViewshedMode) this.updatePointCloudDisplay();
    if (prevProps.config.sharedFieldNotesEnabled !== this.props.config.sharedFieldNotesEnabled || prevProps.config.sharedFieldNotesUrl !== this.props.config.sharedFieldNotesUrl || prevProps.config.sharedFieldNotesReadUrl !== this.props.config.sharedFieldNotesReadUrl) {
      void this.syncSharedFieldNotes(); void this.drawFieldNoteGraphics();
    }
    if (prevProps.config.enableSolar !== this.props.config.enableSolar && this.props.config.enableSolar !== true) {
      this.clearSolarGraphics(); this.setState({ isSolarMode: false });
    }
    if (prevProps.config.enableElevationProfile !== this.props.config.enableElevationProfile && this.props.config.enableElevationProfile !== true) {
      this.clearElevationProfile(); this.setState({ isElevationProfileActive: false });
    }
    if (prevProps.config.hideLegend !== this.props.config.hideLegend) this.syncMapLegendLayer();
    // 1. Handle fullscreen state change / observer re-attachment

    if (prevState.isFullscreen !== this.state.isFullscreen) {
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.resizeObserver = new ResizeObserver(() => {
        if (this.mapillaryViewer?.resize) this.mapillaryViewer.resize();
      });
      if (this.viewerContainer.current) {
        this.resizeObserver.observe(this.viewerContainer.current);
      }
    }

    // 2. Handle State Transitions (Minimize/Close)

    // Minimized: Keep listeners, but clean up viewer if needed
    if (prevProps.visible && !this.props.visible) {
      this.log("Widget minimized - keeping listeners");
      this.cleanupWidgetEnvironment(true, false);
    }

    // Closed: Full cleanup
    if (prevProps.state === "OPENED" && this.props.state === "CLOSED") {
      this.log("Widget closed - cleaning up completely");
      this.cleanupWidgetEnvironment(true, true);
    }

    // 3. Handle Reopening (Seamless Filter Loading)
    if (prevProps.state === "CLOSED" && this.props.state === "OPENED" && this.state.jimuMapView) {
      this.log("Widget reopened - initializing environment...");

      // A. Define the initialization logic that should run ONLY after the layer is ready
      const proceedWithWidgetInitialization = () => {
        // Init secondary layers
        if (!this.mapillaryTrafficSignsLayer && this.props.config.enableTrafficSigns !== false) {
          this.initMapillaryTrafficSignsLayer();
        }
        if (!this.mapillaryObjectsLayer && this.props.config.enableMapillaryObjects !== false) {
          this.initMapillaryObjectsLayer();
        }

        // Restore state
        this.setState(
          {
            turboModeActive: true,
            turboFilterUsername: this.props.config.turboCreator || "",
            turboFilterStartDate: this.props.config.turboDefaultStartDate || "",
            turboFilterEndDate: this.props.config.turboDefaultEndDate || "",
            turboFilterIsPano: this.props.config.turboDefaultIsPano ?? undefined,
            turboColorByDate: this.props.config.turboDefaultColorByDate ?? false,
            turboYearLegend: [],
            showTurboFilterBox: false,
          },
          () => {
            // Force Turbo Layer if needed
            if (this.state.turboModeActive) {
              this.enableTurboCoverageLayer(this.props.config.turboCreator);
            }
          },
        );

        this.disableTurboCoverageLayer();

        // CRITICAL: onActiveViewChange adds the layer to the map if "Always On" is checked.
        // By calling it here, we ensure we only add the layer AFTER it has been initialized with the correct filter.
        this.onActiveViewChange(this.state.jimuMapView);
      };

      // B. Resolve Layer ID before creating the layer
      const defaultUser = this.props.config.turboCreator || "";

      // If we need to recreate the layer (it was destroyed on close)
      if (!this.mapillaryVTLayer) {
        const reopenInit = async () => {
          let id: number | undefined;
          if (defaultUser) {
            try {
              id = (await this.getUserIdFromUsername(defaultUser)) || undefined;
            } catch {
              id = undefined;
            }
          }
          this.initMapillaryLayer(
            id,
            this.state.turboFilterStartDate || undefined,
            this.state.turboFilterEndDate || undefined,
            this.state.turboFilterIsPano,
            this.state.qualityViewActive,
            this.state.selectedQualityBand,
          );
          proceedWithWidgetInitialization();
        };
        reopenInit();
      } else {
        proceedWithWidgetInitialization();
      }
    }

    // 4. Handle Config Changes (Standard Logic)

    // Traffic Signs Config
    if (prevProps.config.enableTrafficSigns !== this.props.config.enableTrafficSigns) {
      if (this.props.config.enableTrafficSigns === false) {
        if (this.state.trafficSignsActive) this.toggleMapillaryTrafficSigns();
        this.mapillaryTrafficSignsLayer = null;
      } else {
        this.initMapillaryTrafficSignsLayer();
      }
    }

    // Objects Config
    if (prevProps.config.enableMapillaryObjects !== this.props.config.enableMapillaryObjects) {
      if (this.props.config.enableMapillaryObjects === false) {
        if (this.state.objectsActive) this.toggleMapillaryObjects();
        this.mapillaryObjectsLayer = null;
      } else {
        this.initMapillaryObjectsLayer();
      }
    }

    // Creator Config Change (while widget is open)
    if (prevProps.config.turboCreator !== this.props.config.turboCreator) {
      const newCreator = this.props.config.turboCreator || "";
      this.setState({ turboFilterUsername: newCreator }, () => {
        if (this.state.turboModeActive) {
          this.enableTurboCoverageLayer();
        }
      });
    }
    // Turbo Preset: Start Date
    if (prevProps.config.turboDefaultStartDate !== this.props.config.turboDefaultStartDate) {
      this.setState({ turboFilterStartDate: this.props.config.turboDefaultStartDate || "" }, () => {
        this.debouncedTurboFilter(); // always rebuild green layer; also reloads turbo points if active
      });
    }

    // Turbo Preset: End Date
    if (prevProps.config.turboDefaultEndDate !== this.props.config.turboDefaultEndDate) {
      this.setState({ turboFilterEndDate: this.props.config.turboDefaultEndDate || "" }, () => {
        this.debouncedTurboFilter();
      });
    }

    // Turbo Preset: Is Pano
    if (prevProps.config.turboDefaultIsPano !== this.props.config.turboDefaultIsPano) {
      this.setState({ turboFilterIsPano: this.props.config.turboDefaultIsPano ?? undefined }, () => {
        this.debouncedTurboFilter();
      });
    }

    // Turbo Preset: Color by Date
    if (prevProps.config.turboDefaultColorByDate !== this.props.config.turboDefaultColorByDate) {
      this.setState({ turboColorByDate: this.props.config.turboDefaultColorByDate ?? false }, () => {
        this.debouncedTurboFilter();
      });
    }

    // 5. Handle Dynamic Component Toggling (Bearing/Zoom)
    if (this.mapillaryViewer) {
      // Handle Bearing Toggle
      if (prevProps.config.hideBearing !== this.props.config.hideBearing) {
        if (this.props.config.hideBearing) {
          this.mapillaryViewer.deactivateComponent("bearing");
        } else {
          this.mapillaryViewer.activateComponent("bearing");
        }
      }
      // Handle Zoom Toggle
      if (prevProps.config.hideZoom !== this.props.config.hideZoom) {
        if (this.props.config.hideZoom) {
          this.mapillaryViewer.deactivateComponent("zoom");
        } else {
          this.mapillaryViewer.activateComponent("zoom");
        }
      }
    }
  }

  // Cleanup lifecycle
  // - Ensures all intervals, observers, and event listeners are removed
  // - to prevent memory leaks when widget is closed or reloaded.
  componentWillUnmount() {
    this._sharedNotesDisposed = true;
    this.clearFieldNotesGroup();
    this.cleanupWidgetEnvironment(true, true);

    // Stop resize observer
    if (this.resizeObserver && this.viewerContainer.current) {
      this.resizeObserver.unobserve(this.viewerContainer.current);
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.tooltipDiv && this.tooltipDiv.parentNode) {
      this.tooltipDiv.parentNode.removeChild(this.tooltipDiv);
      this.tooltipDiv = null;
    }

    // Remove listeners
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    document.removeEventListener("webkitfullscreenchange", this.handleFullscreenChange);
    document.removeEventListener("mozfullscreenchange", this.handleFullscreenChange);
    document.removeEventListener("MSFullscreenChange", this.handleFullscreenChange);
    window.removeEventListener("resize", this.handleWindowResize);

    window.removeEventListener("keydown", this.handleNudgeKeyDown);
    window.removeEventListener("keyup", this.handleNudgeKeyUp);

    // Clear warning timeout
    if (this._zoomWarningTimeout) {
      clearTimeout(this._zoomWarningTimeout);
      this._zoomWarningTimeout = null;
    }
  }

  private restoreMapillaryFeatureLayersForView(jmv: JimuMapView) {
    this.syncMapLegendLayer();
    const view = jmv.view;
    if (this.state.trafficSignsActive) void this.syncMapFeatureCoverage("signs");

    if (this.state.objectsActive) void this.syncMapFeatureCoverage("objects");
    this.syncDetectionLayerAvailability();

  }

  /*
   * Handles map view changes and sets up click/hover event handlers.
   * Manages interactions for both normal and turbo mode, including object/traffic sign layers.
   */
  /*
   * Handles map view changes and sets up click/hover event handlers.
   * Manages interactions for both normal and turbo mode, including object/traffic sign layers.
   */
  private onActiveViewChange = (jmv: JimuMapView) => {
    const view = jmv?.view;
    if (!view?.map || view.destroyed) return;
    this._pointCloudAdaptiveDisplay?.dispose();
    this._pointCloudAbort?.abort(); this._pointCloudAbort = null; ++this._pointCloudRequest;
    if (this._pointCloudAutoTimer) clearTimeout(this._pointCloudAutoTimer); this._pointCloudAutoTimer = null;
    ++this._pointCloudRenderRequest;
    if (this._gridLayer) { this._pointCloudLayerView?.map?.remove(this._gridLayer); this._gridLayer.destroy(); this._gridLayer = null; }
    this._gridLayerReady = null; ++this._ringGeneration;

    // Remove click / hover handlers from the previous active view
    if (this.mapClickHandle) {
      try {
        this.mapClickHandle.remove();
      } catch (e) {}

      this.mapClickHandle = null;
    }

    if (this.pointerMoveHandle) {
      try {
        this.pointerMoveHandle.remove();
      } catch (e) {}

      this.pointerMoveHandle = null;
    }

    /*
     * Remove URL-sync watcher belonging to the
     * PREVIOUS 2D / 3D MapView.
     *
     * Important: do this before attaching anything
     * to the new jmv.
     */
    if (this.viewUrlStationaryHandle) {
      this.viewUrlStationaryHandle.remove();
      this.viewUrlStationaryHandle = null;
    }

    this.log("Active MapView set - Attaching Handlers");

    // DETECT 2D / 3D DIMENSION SWITCH
    const previousView = this.state.jimuMapView?.view;
    if (previousView && previousView !== view && this.state.turboModeActive) this.disableTurboCoverageLayer();

    const previousViewType = previousView?.type;

    const previousScale = previousView?.scale;

    const previousCenter = previousView?.center?.clone();

    const nextViewType = view.type;

    const dimensionChanged = previousViewType != null && previousViewType !== nextViewType;

    if (dimensionChanged) {
      this.log(`[MapView] ${previousViewType} → ${nextViewType}: ` + `clearing view-dependent analysis.`);

      this.clearViewDependentAnalysis();
    }

    this.log("Active MapView set - Attaching Handlers");

    this.clearSharedNotesView();
    this.clearMapLegendLayer();
    this.clearSolarGraphics();
    this.clearActiveSequenceLayer();
    this.clearGreenPulse();
    this.clearClickRipples();
    this.clearTurboHover();

    // clearSolarGraphics above already releases the solar map layer through its owner.
    this._elevationProfile?.clear(view, true);

    this._cameraCone?.dispose(view);

    this._sequenceHoverHighlight?.reset(view);
    this.clearFieldNotesGroup();
    // Destroy the field notes layer so it safely rebuilds on the new 2D/3D map
    if (this._fieldNotesLayer) {
      try {
        const map = view.map;
        if (map && map.layers.includes(this._fieldNotesLayer)) {
          map.remove(this._fieldNotesLayer);
        }
        this._fieldNotesLayer.destroy();
      } catch (e) {}
      this._fieldNotesLayer = null;
    }

    // Commit the NEW MapView first.
    // Only then restore graphics and sign/object watchers.
    this.setState(
      {
        jimuMapView: jmv, pointCloudLoading: false,
      },
      () => {
        view.when(async () => {
          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {
            return;
          }

          /*
           * Preserve the apparent map scale when the user
           * switches between 2D and 3D.
           *
           * We intentionally preserve SCALE rather than the
           * raw zoom number because MapView and SceneView
           * do not use zoom levels identically.
           */
          if (dimensionChanged && this._sharedStateRestoreComplete && !this._isFlyInActive && Number.isFinite(previousScale) && previousScale! > 0) {
            try {
              const target: any = {
                scale: previousScale,
              };

              if (previousCenter) {
                target.target = previousCenter;
              }

              await view.goTo(target, {
                animate: false,
              });
            } catch (err) {
              console.warn("[MapView] Could not preserve scale during 2D/3D switch:", err);
            }

            /*
             * Abort if another map switch happened
             * while goTo was running.
             */
            if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {
              return;
            }
          }

          await this.ensureArcGISModules();
          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
          await this.restoreRoutingLoginView(view);
          if (this.state.jimuMapView !== jmv || !view?.map) return;
          this.restoreMapGraphics();
          if (this._currentPointCloudResult && this.state.pointCloudVisible) {
            if (view.type === "3d") this.renderPointCloudMapLayer(true);
            else this.clearPointCloud(true);
          }
          void this.syncSharedFieldNotes();

          this.restoreMapillaryFeatureLayersForView(jmv);

          /*
           * Fresh preview / page reload:
           * apply the configured always-on coverage
           * once the new MapView really exists.
           */
          this.ensureAlwaysOnCoverageLayer();
          await this.enableTurboCoverageLayer();

          /*
           * If startup/shared-link restoration has already
           * finished, this is a normal user-driven 2D/3D
           * switch. Immediately write the NEW map type,
           * center and zoom into the URL.
           */
          if (this._sharedStateRestoreComplete && !this._isFlyInActive) {
            /*
             * Write immediately when ExB switches
             * between MapView and SceneView.
             *
             * Do not wait for stationary=true because
             * the new view may already be stationary.
             *
             * imageId is optional; map type / center /
             * zoom must still sync without an image.
             */
            this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
          }

          /*
           * Then attach the persistent URL
           * stationary watcher.
           */
          if (this.viewUrlStationaryHandle) {
            this.viewUrlStationaryHandle.remove();
            this.viewUrlStationaryHandle = null;
          }

          this.viewUrlStationaryHandle = view.watch("stationary", (stationary) => {
            if (!stationary) {
              return;
            }

            if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {
              return;
            }

            if (this._isFlyInActive) {
              return;
            }

            /*
             * Map position belongs in the URL even when
             * no Mapillary image has been selected yet.
             *
             * pKey is added only when imageId exists.
             */

            this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
          });
        }).catch(error => {
          if (this.state.jimuMapView?.view === view && !view.destroyed) console.warn("[MapView] Resource restoration failed:", error);
        });
      },
    );
    // Ensure shared link is checked ONLY AFTER the map view is bound
    if (!this._hasCheckedSharedState) {
      this._hasCheckedSharedState = true;
      // Short delay to ensure React state has committed the map view
      setTimeout(() => {
        this.checkUrlForSharedState();
      }, 100);
    }

    // ZOOM WATCHER
    /*
     * ZOOM / URL SYNC
     *
     * There must be exactly ONE zoom watcher for
     * the currently active JimuMapView.
     */

    /*
     * Remove the previous MapView's watcher before
     * attaching anything to the new 2D/3D view.
     */
    if (this.zoomDisplayHandle) {
      this.zoomDisplayHandle.remove();
      this.zoomDisplayHandle = null;
    }

    /*
     * Cancel a pending URL write belonging to the
     * previous view.
     */
    this._debouncedZoomUrlUpdate.cancel?.();

    /*
     * Build the debounce before the watcher uses it.
     */
    this._debouncedZoomUrlUpdate = debounceUtil(() => {
      /*
       * Ignore a callback if another 2D/3D
       * MapView became active meanwhile.
       */
      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {
        return;
      }

      if (this._isFlyInActive) {
        return;
      }

      this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);
    }, 600);

    /*
     * Initialize STATUS from THIS view.
     */
    this.setState({
      currentZoom: view.zoom,
    });

    /*
     * Attach ONE watcher to THIS view only.
     */
    this.zoomDisplayHandle = view.watch("zoom", (newZoom: number) => {
      /*
       * Critical 2D/3D guard:
       * an obsolete MapView is never allowed
       * to overwrite the displayed zoom.
       */
      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {
        return;
      }

      this.setState({
        currentZoom: newZoom,
      });

      this._debouncedZoomUrlUpdate();

      /*
       * Keep quality hint behavior.
       */
      if (this.state.qualityViewActive) {
        if (newZoom < ZOOM.TILE_FETCH) {
          this.showZoomWarning("Quality bands are based on sequence-level averages until you zoom in further.", 0);
        } else {
          this.clearZoomWarning();
        }
      }
    });

    // Restore manual Turbo Mode or Auto-Initialize if Config is ON
    {
      this.setState({ turboModeActive: true });

      // Apply the Turbo vector tile style to the newly bound 2D/3D view.
      this._loadedTurboFiltersKey = "";

      if (this.turboStationaryHandle) this.turboStationaryHandle.remove();

      this.turboStationaryHandle = view.watch(
        "stationary",
        debounceUtil(async (isStationary) => {
          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
          if (isStationary && this.state.turboModeActive) {
            const stateFilter = this.state.turboFilterUsername.trim();
            const configFilter = this.props.config.turboCreator || "";
            const effectiveFilter = stateFilter || configFilter;

            if (effectiveFilter) {
              await this.enableTurboCoverageLayer(effectiveFilter);
            } else {
              await this.enableTurboCoverageLayer();
            }
          }
        }, TIMING.TURBO_DEBOUNCE_MS),
      );

      if (this.turboZoomHandle) this.turboZoomHandle.remove();
      this.turboZoomHandle = view.watch("zoom", (z) => {
        if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;
        if (this.state.turboModeActive) {
          if (z < TURBO_LIMITS.closeZoom && this._turboCloseLayer) {
            this.releaseTurboCloseGraphics();
            void this.enableTurboCoverageLayer();
          }
          this.showTurboInteractionHelp();
        }
      });

      // Wait for view to be completely ready before checking zoom and fetching!

    }

    // Push the interactive FeatureLayers (dots/icons) back to the absolute top once the view is ready
    view.when(() => {
      if (this.state.jimuMapView?.view === view && view.map && !view.destroyed) this.enforceMapillaryLayerOrder(view);
    }).catch(() => {});

    // If the user swipes the mouse quickly across the map, this prevents lagging and too many hover fetchs
    let hoverHitTestTimeout: any = null;

    // Hide turbo hover tooltip when mouse leaves the map container
    this._turboMapLeaveCleanup?.();
    this._turboMapLeaveCleanup = null;
    const mapContainer = view.container as HTMLElement;
    if (mapContainer) {
      const onMapLeave = () => {
        this._turboHoverPickAbort?.abort();
        this.clearTurboHoverDetails();
        if (hoverHitTestTimeout) {
          clearTimeout(hoverHitTestTimeout);
          hoverHitTestTimeout = null;
        }
        // Clear tooltip
        if (this.tooltipDiv) {
          this.tooltipDiv.style.display = "none";
        }
        // Clear hover animation
        this.clearTurboHover();

        this.highlightSequenceOnVTL(null);
        // Clear pending tooltip fetch
        if (this._hoverTimeout) {
          clearTimeout(this._hoverTimeout);
          this._hoverTimeout = null;
        }
        this._currentHoveredFeatureId = null;
      };
      mapContainer.addEventListener("mouseleave", onMapLeave);
      this._turboMapLeaveCleanup = () => {
        mapContainer.removeEventListener("mouseleave", onMapLeave);
        if (hoverHitTestTimeout) clearTimeout(hoverHitTestTimeout);
      };
    }

    // CLICK HANDLER
    this.mapClickHandle = view.on("click", async (evt) => {
      if (this.props.state === "CLOSED") return;

      const point = view.toMap(evt) as __esri.Point;

      if (this.state.routePickMode) {
        this.setRoutePoint(this.state.routePickMode, [point.longitude, point.latitude]);
        return;
      }

      // FIELD NOTES: annotation mode intercepts the click before anything else
      if (this.state.isAnnotationMode) {
        try {
          // 1. Önce Point Cloud (Nokta Bulutu) 3B grafiklerine mi tıklandı kontrol et
          const response = await view.hitTest(evt);
          const pointCloudHit = response.results.find((r: any) => {
            const layer = r.layer || (r.graphic && r.graphic.layer);
            return layer && layer.id === "point-cloud-layer";
          });

          if (pointCloudHit && (pointCloudHit as any).graphic) {
            const attrs = (pointCloudHit as any).graphic.attributes || {};
            const rawOriginal = attrs.originalIndex ?? attrs.originalindex;
            const rawObjectId = attrs.ObjectID ?? attrs.objectid;
            const originalIdx = rawOriginal !== undefined ? rawOriginal : (rawObjectId || 1) - 1;

            const p = this._currentPointCloudResult?.points[originalIdx];

            if (p) {
              const exactLon = (p as any).rawLon || p.lon;
              const exactLat = (p as any).rawLat || p.lat;
              const exactAlt = p.alt;

              this.handleAnnotationMapClick(exactLon, exactLat, exactAlt);
              return;
            }
          }
        } catch (e) {
          console.warn("HitTest failed for Point Cloud", e);
        }

        // 2. Point Cloud'a tam isabet etmediyse (Veya 2B Kuş Bakışı haritadan tıklandıysa)
        // Zekice Çözüm: Point Cloud datasını kullanarak tıkladığımız yerin yokuş/zemin yüksekliğini hesapla!
        let estimatedAlt: number | undefined = undefined;

        if (this.state.pointCloudVisible && this._currentPointCloudResult) {
          const clickLat = point.latitude;
          const clickLon = point.longitude;
          const localAltitudes: number[] = [];

          // Tıklanan koordinatın 3 metre çevresindeki tüm Point Cloud noktalarını bul
          for (const p of this._currentPointCloudResult.points) {
            // Hızlı bounding-box filtresi (Performans için)
            if (Math.abs(p.lat - clickLat) < 0.00005 && Math.abs(p.lon - clickLon) < 0.00005) {
              const dist = distanceMeters(clickLat, clickLon, p.lat, p.lon);
              if (dist < 3.0) {
                localAltitudes.push(p.alt);
              }
            }
          }

          if (localAltitudes.length > 0) {
            // Yükseklikleri küçükten büyüğe sırala
            localAltitudes.sort((a, b) => a - b);

            // Ağaç tepelerini ve gürültüyü elemek için en alttaki (zemindeki) %10'luk dilimi al
            const groundIndex = Math.floor(localAltitudes.length * 0.1);
            estimatedAlt = localAltitudes[groundIndex];
          }
        }

        // Hesaplanan yokuş/zemin yüksekliğini (bulamadıysa undefined) gönder
        this.handleAnnotationMapClick(point.longitude, point.latitude, estimatedAlt);
        return;
      }

      this.setState({ clickLon: point.longitude, clickLat: point.latitude });

      try {
        const response = await view.hitTest(evt);
        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);
        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {
          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });
          this._sharedNotesPopupHandle?.remove();
          this._sharedNotesPopupHandle = view.popup?.on("trigger-action", event => {
            if (event.action.id === "enterprise-note-attachments" && view.popup?.selectedFeature?.layer === this._sharedNotesLayer) void this.openFieldNoteAttachments(view.popup.selectedFeature);
            if (event.action.id === "edit-enterprise-note" && view.popup?.selectedFeature?.layer === this._sharedNotesLayer) {
              void this.openSharedFieldNoteEditor(view.popup.selectedFeature);
            }
          }) || null;
          return;
        }


        const pointCloudHit = response.results.find((r: any) => {
          const layer = r.layer || (r.graphic && r.graphic.layer);
          return layer && layer.id === "point-cloud-layer";
        });

        if (pointCloudHit && (pointCloudHit as any).graphic) {
          if (this._pointCloudMapUpdating) { this.showToast("Updating point-cloud display. Select the point again in a moment.", 2000); return; }
          const attrs = (pointCloudHit as any).graphic.attributes || {};
          const geom = (pointCloudHit as any).graphic.geometry;

          // Safely handle ArcGIS lowercasing field names randomly
          const rawOriginal = attrs.originalIndex ?? attrs.originalindex;
          const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;
          const rawObjectId = attrs.ObjectID ?? attrs.objectid;

          // Grab filtered index (For Viewer Highlighting)
          const idx = rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1;

          // Grab original index (For raw data lookup)
          const originalIdx = rawOriginal !== undefined ? rawOriginal : idx;

          if (this.state.isMeasureMode) {
            const p = this._currentPointCloudResult?.points[originalIdx];
            if (p) {
              const newPt = {
                mapLon: geom.longitude,
                mapLat: geom.latitude,
                mapZ: geom.z,
                rawLon: (p as any).rawLon || p.lon,
                rawLat: (p as any).rawLat || p.lat,
                alt: p.alt,
              };

              let newPoints = [...this.state.measurePoints, newPt];
              if (newPoints.length > 2) {
                newPoints = [newPt];
              }

              this.setState({ measurePoints: newPoints }, () => {
                this.updateMeasurementGraphics();
              });
            }
            return; // Stop here so it doesn't trigger anything else!
          }

          // SIGHT MODE
          if (this.state.isSightMode && this._sightViewModel) {
            if (!this.state.sightObserver) {
              this.setState({ sightObserver: geom });
              this._sightViewModel.observer = geom;
            } else {
              this.setState((prev) => ({ sightTargets: [...prev.sightTargets, geom] }));
              this._sightViewModel.targets.add({ location: geom });
            }
            return;
          }

          // VIEWSHED MODE LOGIC
          if (this.state.isViewshedMode && this.state.jimuMapView) {
            this.clearViewshed();
            loadArcGISJSAPIModules(["esri/analysis/ViewshedAnalysis", "esri/analysis/Viewshed", "esri/geometry/Point"]).then(([ViewshedAnalysis, Viewshed, Point]) => {
              const viewshed = new Viewshed({
                observer: new Point({
                  longitude: geom.longitude,
                  latitude: geom.latitude,
                  z: geom.z + 1.5,
                  spatialReference: { wkid: 4326 },
                }),
                farDistance: 150,
                horizontalFieldOfView: 360,
                verticalFieldOfView: 90,
                heading: 0,
                tilt: 0,
              });

              this._viewshedAnalysis = new ViewshedAnalysis({
                viewsheds: [viewshed],
              });

              const view = this.state.jimuMapView!.view as any;
              if (view.type === "3d" && view.analyses) {
                view.analyses.add(this._viewshedAnalysis);
              }
            });
            return;
          }

          if (this._pointCloudViewerRenderer) {
            this._pointCloudViewerRenderer.setHighlight(idx); // Use filtered index for WebGL
            if (this.mapillaryViewer) {
              this.mapillaryViewer.resize();
              this.mapillaryViewer
                .getCenter()
                .then((c: number[]) => {
                  this.mapillaryViewer.setCenter([c[0], c[1]]);
                })
                .catch(() => {});
            }
          }
          return;
        } else {
          if (this._pointCloudViewerRenderer) {
            this._pointCloudViewerRenderer.setHighlight(-1);
            if (this.mapillaryViewer) this.mapillaryViewer.resize();
          }
        }

        // 1. Blue Markers
        const seqPointHit = response.results.find(
          (r: any) => r.graphic && ((r.graphic as any).__isSequenceOverlay || (r.graphic as any).__isActiveSequencePoint) && r.graphic.geometry?.type === "point",
        );

        if (seqPointHit) {
          const seqId = (seqPointHit as any).graphic.attributes?.sequenceId || this.state.selectedSequenceId;
          if (!seqId) return;

          let currentSeqData = this.state.sequenceImages;
          if (this.state.selectedSequenceId !== seqId || !currentSeqData.length) {
            currentSeqData = await this.getSequenceWithCoords(seqId, this.accessToken);
          }

          if (currentSeqData.length) {
            const closestImg = currentSeqData.reduce((closest, img) => {
              const dist = distanceMeters(img.lat, img.lon, point.latitude, point.longitude);
              return !closest || dist < closest.dist ? { ...img, dist } : closest;
            }, null as any);

            if (closestImg) {
              if (this.state.selectedSequenceId !== seqId) {
                this.setState({ selectedSequenceId: seqId });
              }
              await this.loadSequenceById(seqId, closestImg.id, { lon: point.longitude, lat: point.latitude });
              return;
            }
          }
          return;
        }

        // 2. Objects/Signs
        const featureHit = response.results.find((r: any) => {
          const layer = r.layer || (r.graphic && r.graphic.layer);
          return layer && (layer.id === LAYER_IDS.OBJECTS_FL || layer.id === LAYER_IDS.TRAFFIC_SIGNS_FL);
        });

        this._mapFeatureClickAbort?.abort();
        const featureController = new AbortController(); this._mapFeatureClickAbort = featureController;
        const selectedFeature = featureHit || await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal);
        if (featureController.signal.aborted) return;
        if (selectedFeature && (selectedFeature as any).graphic) {
          this._selectedMapFeature = selectedFeature;
          const attrs = (selectedFeature as any).graphic.attributes;
          const featureId = attrs.id || attrs.value; // Mapillary usually uses 'id' for the feature ID

          // Get feature coordinates
          const geoPt = webMercatorUtils.webMercatorToGeographic((selectedFeature as any).graphic.geometry) as __esri.Point;

          // 1. Highlight the feature (Optional: Draw a specific marker for the selected object)
          this.drawPoint(geoPt.longitude, geoPt.latitude);

          // 2. Fetch alternates
          this.fetchAlternateImages(featureId, geoPt.latitude, geoPt.longitude);

          // Stop here so we don't trigger the "nearest sequence" search
          return;
        }

        // 3. Turbo Coverage (Get ALL overlapping hits instead of just one)
        let turboHits = response.results.filter((r: any) => {
          const layer = r.layer || (r.graphic && r.graphic.layer);
          return layer && layer.id === LAYER_IDS.TURBO_COVERAGE;
        });

        // TURBO COVERAGE MODE BRANCH
        if (this.state.turboModeActive) {
          this._turboHoverPickAbort?.abort();
          this._turboClickPickAbort?.abort();
          const pickController = new AbortController();
          this._turboClickPickAbort = pickController;
          const picked = await this.pickTurboGraphic({ x: evt.x, y: evt.y }, view, pickController.signal) || await this.pickTurboRepresentative({ x: evt.x, y: evt.y }, view, pickController.signal);
          if (pickController.signal.aborted) return;
          turboHits = picked ? [{ graphic: picked, layer: this.turboCoverageLayer } as any] : [];
          if (turboHits.length > 0) {
            // 1. Mathematically find the ABSOLUTE closest overlapping point
            let closestGraphic: __esri.Graphic | null = null;
            let minDistance = Infinity;

            turboHits.forEach((hit: any) => {
              const graphic = hit.graphic;
              // Convert the hit graphic to WGS84 to calculate distance
              const geom = webMercatorUtils.webMercatorToGeographic(graphic.geometry) as __esri.Point;
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
              // TypeScript safety check
              const safeGraphic = closestGraphic as __esri.Graphic;
              const attrs = safeGraphic.attributes;

              // Safely highlight the point
              if (this.turboCoverageLayerView && safeGraphic.layer === this.turboCoverageLayer) {
                if (this.highlightHandle) this.highlightHandle.remove();
                this.highlightHandle = (this.turboCoverageLayerView as any).highlight(safeGraphic);
              }

              if (attrs) {
                const imageId = attrs.image_id;
                if (!imageId) return;

                let seqId = attrs.sequence_id;

                if (!seqId || seqId === "" || seqId === "undefined") {
                  try {
                    const resp = await fetch(`${GRAPH_API.BASE}/${imageId}?fields=sequence`, {
                      headers: { Authorization: `OAuth ${this.accessToken}` },
                      signal: pickController.signal,
                    });
                    if (resp.ok) {
                      const data = await resp.json();
                      seqId = data.sequence;
                      safeGraphic.attributes.sequence_id = seqId;
                    }
                  } catch (err) {
                    return;
                  }
                }
                if (pickController.signal.aborted) return;
                if (seqId) {
                  const anchor = this.getCoverageDisplayPosition(String(imageId), point.longitude, point.latitude);
                  this.drawClickRipple(anchor.lon, anchor.lat);
                  this.setState({ selectedSequenceId: seqId });
                  this.clearSequenceGraphics(true);
                  await this.loadSequenceById(seqId, imageId, { lon: anchor.lon, lat: anchor.lat }, !!attrs.turbo_representative);
                  return;
                }
              }
            }
          }

          // Clicked empty space
          this.drawClickRipple(point.longitude, point.latitude, [255, 140, 0], 0.6, 2);
          this.updateTurboPickWarning(view.zoom < 14
            ? "No selectable representative image was found here. Choose a coverage line or overview point, or zoom closer for individual image selection."
            : "No image point was found at this position. Choose a visible dot, zoom closer if dots overlap, or adjust the active filters.", "zoom");
          return;
        }

        // Imagery exploration uses Turbo; unrelated map tools remain available.
        this.showToast("Enable Turbo coverage to select street imagery.", 3000);
      } catch (error) {
        console.error("Click error", error);
        if (this.state.turboModeActive && (error as any)?.name !== "AbortError") this.updateTurboPickWarning("Image lookup could not load. Check your connection and choose Retry.", "retry");

      }
    });

    // HOVER HANDLER
    this.pointerMoveHandle = view.on("pointer-move", (evt) => {
      this._turboHoverPickAbort?.abort();
      if (this._turboHoveredScreen && (evt.x - this._turboHoveredScreen.x) ** 2 + (evt.y - this._turboHoveredScreen.y) ** 2 > TURBO_LIMITS.hoverRadiusPx ** 2) {
        this.clearTurboHoverDetails();
      }
      const hoverController = new AbortController();
      this._turboHoverPickAbort = hoverController;
      // Immediately clear the previous pending hitTest
      if (hoverHitTestTimeout) {
        clearTimeout(hoverHitTestTimeout);
      }

      // Capture exact screen coordinates for the deferred hitTest
      const rect = (view.container as HTMLElement)?.getBoundingClientRect();
      const globalX = evt.native?.clientX ?? ((rect?.left || 0) + evt.x);
      const globalY = evt.native?.clientY ?? ((rect?.top || 0) + evt.y);
      const screenPoint = { x: evt.x, y: evt.y };

      // Wait 40ms before performing the expensive hitTest.
      // If the user swiping the mouse wildly, this drops the intermediate
      // frames and prevents the browser UI thread from stuttering.
      hoverHitTestTimeout = setTimeout(async () => {
        try {
          if (hoverController.signal.aborted || this.state.jimuMapView?.view !== view) return;
          const hit = await this.hitTestHoverLayers(view, screenPoint);
          if (hoverController.signal.aborted) return;

          // 1. POINT CLOUD HOVER SYNC (Dual-Hover Feature)
          const pcHit = hit.results.find((r: any) => {
            const l = r.layer || (r.graphic && r.graphic.layer);
            return l && l.id === "point-cloud-layer";
          });

          if (pcHit && (pcHit as any).graphic && !this._pointCloudMapUpdating) {
            const attrs = (pcHit as any).graphic.attributes || {};
            const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;
            const rawObjectId = attrs.ObjectID ?? attrs.objectid;
            const idx = rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1;

            if (this._pointCloudViewerRenderer && this._pointCloudViewerRenderer._selectedIndex !== idx) {
              this._pointCloudViewerRenderer.setHighlight(idx);

              if (this.mapillaryViewer) {
                this.mapillaryViewer.resize();
              }
            }
          } else {
            // Clear point cloud highlight if mouse moves off the cloud
            if (this._pointCloudViewerRenderer && this._pointCloudViewerRenderer._selectedIndex !== -1) {
              this._pointCloudViewerRenderer.setHighlight(-1);
              if (this.mapillaryViewer) this.mapillaryViewer.resize();
            }
          }

          // 2. STANDARD OBJECT / TRAFFIC SIGN HOVER LOGIC
          const obj = hit.results.find((r: any) => {
            const l = r.layer || (r.graphic && r.graphic.layer);
            return l && (l.id === LAYER_IDS.OBJECTS_FL || l.id === LAYER_IDS.TRAFFIC_SIGNS_FL);
          });

          const mapFeature = obj || await this.pickMapFeature(screenPoint, view, hoverController.signal);
          if (hoverController.signal.aborted) return;
          if (mapFeature && (mapFeature as any).graphic) {
            this.clearTurboHoverDetails();
            const attrs = (mapFeature as any).graphic.attributes || {};
            if (this.tooltipDiv) {
              this.tooltipDiv.textContent = attrs.name || attrs.value || "Map feature";
              this.tooltipDiv.style.left = `${globalX + 15}px`;
              this.tooltipDiv.style.top = `${globalY + 15}px`;
              this.tooltipDiv.style.display = "block";
            }
            return; // Stop here, don't trigger Turbo hover
          }

          if (!this.tooltipDiv) return;

          // 3. Turbo vector tiles are picked from raw tile data, independently
          // of SDK hitTest support. No click is needed to show image details.
          if (this.state.turboModeActive && this.turboCoverageLayer) {
            const picked = view.zoom < 6
              ? await this.pickTurboRepresentative(screenPoint, view, hoverController.signal, true)
              : await this.pickTurboGraphic(screenPoint, view, hoverController.signal, TURBO_LIMITS.hoverRadiusPx);
            if (hoverController.signal.aborted) return;
            if (picked) this.updateTurboHover(picked, globalX, globalY);
            else this.clearTurboHoverDetails();
          } else {
            this.clearTurboHoverDetails();
          }
        } catch (err) {
          if (!hoverController.signal.aborted) {
            this.clearTurboHoverDetails();
            if (this.state.turboModeActive && this.state.jimuMapView?.view === view) this.updateTurboPickWarning("Image lookup could not load. Check your connection and choose Retry.", "retry");
          }
        }
      }, 40); // End of debounce timeout
    });
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
    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);
    return this.ensureSelectionPulseOwner().show(view, anchor, lon, lat, baseColor, imageId);
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
   * Hybrid symbol restoration stays in the runtime; layer and marker-index lifetime belong to the owner.
   */
  private ensureActiveSequenceLayer(view: __esri.MapView | __esri.SceneView): __esri.GraphicsLayer {
    this._activeSequenceOverlay ??= new ActiveSequenceOverlay(properties => new this.ArcGISModules.GraphicsLayer(properties));
    if (this._activeSequenceOverlay.view !== view) this.clearActiveSequenceLayer();
    return this._activeSequenceOverlay.ensure(view);
  }

  private refreshHybridSequenceMembership() {
    const view = this.state.jimuMapView?.view;
    this._activeSequenceOverlay?.points.forEach(marker => {
      const close = this._turboCloseView === view && this._turboCloseLayer?.visible !== false ? this._turboCloseGraphics.get(String(marker.attributes?.image_id)) : undefined;
      marker.visible = !close;
      if (close) { (close as any).__turboBaseSymbol ??= close.symbol; close.symbol = marker.symbol; }
    });
  }

  private clearActiveSequenceLayer() {
    this._turboCloseGraphics.forEach(g => { if ((g as any).__turboBaseSymbol) g.symbol = (g as any).__turboBaseSymbol; });
    this._activeSequenceOverlay?.dispose();
  }

  private drawPointWithoutRemoving(lon: number, lat: number, color: any = [0, 0, 255, 1], sequenceId?: string, imageId?: string, deferred?: __esri.Graphic[]) {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules) return;

    const { Graphic } = this.ArcGISModules;

    const graphic = new Graphic({
      geometry: {
        type: "point",
        longitude: lon,
        latitude: lat,
        spatialReference: { wkid: 4326 },
      },
      symbol: jimuMapView.view.type === "3d" ? { type: "point-3d", disableDepthTestDistance: Number.POSITIVE_INFINITY,
        verticalOffset: { screenLength: 1, minWorldLength: 0.05, maxWorldLength: 0.05 },
        symbolLayers: [{ type: "icon", resource: { primitive: "circle" }, material: { color }, size: 7, outline: { color: "#e3da30", size: 1 } }],
      } : {
        type: "simple-marker",
        style: "circle",
        color: color,
        size: 7,
        outline: { color: "#e3da30", width: 1 },
      },
      attributes: sequenceId ? { sequenceId: sequenceId, image_id: imageId } : undefined,
    });

    (graphic as any).__isActiveSequencePoint = true;
    // Tag removed so this is treated as a temporary graphic
    if (sequenceId && color[0] === 0 && color[1] === 0 && color[2] === 255) {
      const layer = this.ensureActiveSequenceLayer(jimuMapView.view);
      const key = imageId ? `${sequenceId}:${imageId}` : `${sequenceId}:${lon}:${lat}`;
      const existing = this._activeSequenceOverlay!.points.get(key);
      if (existing) { existing.geometry = graphic.geometry; existing.symbol = graphic.symbol; }
      else { if (deferred) deferred.push(graphic); else layer.add(graphic); this._activeSequenceOverlay!.points.set(key, graphic); }
      const marker = existing || graphic;
      const close = imageId ? this._turboCloseGraphics.get(String(imageId)) : undefined;
      if (close && this._turboCloseView === jimuMapView.view && this._turboCloseLayer?.visible !== false) {
        (close as any).__turboBaseSymbol ??= close.symbol; close.symbol = marker.symbol; marker.visible = false;
      }
    } else jimuMapView.view.graphics.add(graphic);
  }

  /**
   * Draws a black point at the given coordinates to point clicked area on map
   */
  private drawPoint(lon: number, lat: number) {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules) return;

    const { Graphic } = this.ArcGISModules;

    // Remove existing clicked location marker
    if (this.clickedLocationGraphic) {
      jimuMapView.view.graphics.remove(this.clickedLocationGraphic);
      this.clickedLocationGraphic = null;
    }

    const graphic = new Graphic({
      geometry: {
        type: "point",
        longitude: lon,
        latitude: lat,
        spatialReference: { wkid: 4326 },
      },
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: "black",
        size: 5,
        outline: { color: "white", width: 2 },
      },
      attributes: { isClickedLocation: true },
    });

    (graphic as any).__isSequenceOverlay = true;

    jimuMapView.view.graphics.add(graphic);
    this.clickedLocationGraphic = graphic;
  }

  /**
   * Removes ALL graphics tagged __isCone from the view.
   * Must be called instead of (or before) view.graphics.remove(this.currentConeGraphic).
   */
  private clearConeGraphics() {
    this.ensureCameraConeOwner().clear(this.state.jimuMapView?.view);
  }

  /** Ensures the camera cone layer exists and hugs the terrain at any elevation */
  private ensureConeLayer(): __esri.GraphicsLayer | null {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !this.ArcGISModules?.GraphicsLayer) return null;
    return this.ensureCameraConeOwner().ensure(jimuMapView.view);
  }

  /** Bind the SDK factory once; clearing before SDK readiness does not construct a layer. */
  private ensureCameraConeOwner(): CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {
    return this._cameraCone ??= new CameraConeGraphics(properties => new this.ArcGISModules.GraphicsLayer(properties));
  }

  /**
   * Draws a camera view cone polygon at the given location and bearing.
   * 2D: flat orange polygon (draped onto layer)
   * 3D: a low wedge with 3D edge lines and draped ground fill.
   * Uses this.ensureConeLayer() with elevationInfo { mode: "relative-to-ground" }
   * so that the cone is always rendered on the terrain surface regardless of elevation.
   */
  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {
    const view = this.state.jimuMapView?.view;
    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;
    const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);
    const center = lonLatToWebMercator(anchor.lon, anchor.lat);
    if (!center) return null;
    const layer = this.ensureConeLayer();
    if (!layer) return null;
    const graphic = this.ensureCameraConeOwner().render(view, layer, center, anchor.lat,
      heading, radiusMeters, spreadDeg, view.type === "3d", properties => new this.ArcGISModules.Graphic(properties));

    // Keep selection above the cone without removing/readding animated graphics.
    if (this._selectionPulse?.layer && this._selectionPulse?.view === view) view.map.reorder(this._selectionPulse?.layer, view.map.layers.length - 1);
    return graphic;
  }

  /**
   * Removes the current pulsing green graphic from the map and clears
   * its animation interval.
   */
  private clearGreenPulse() {
    this.ensureSelectionPulseOwner().dispose();
  }

  /**
   * Keeps the browser URL in sync with the currently active Mapillary image.
   * Called on every image change so the address bar always reflects the current
   * state, allowing users to bookmark or copy the URL at any time without
   * needing to use the share button.
   * Attempts to update the parent window URL (Experience Builder iframe context).
   * Silently skips if cross-origin restrictions apply, share button remains
   * as the reliable fallback in that case.
   * @param imageId  Active Mapillary image ID
   * @param lat      Image latitude (written to URL for reference/display)
   * @param lon      Image longitude (written to URL for reference/display)
   */
  private updateUrlWithCurrentImage(imageId?: string | null, _imageLat?: number, _imageLon?: number) {
    try {
      const jmv = this.state.jimuMapView;

      if (!jmv) {
        return;
      }

      const view = jmv.view;

      const center = view.center;

      /*
       * SceneView / MapView may briefly have
       * no center while Experience Builder is
       * switching between 2D and 3D.
       *
       * Never touch x/y until we've confirmed
       * the Point exists.
       */
      if (!center) {
        return;
      }

      let geoCenter: __esri.Point;

      if (center.spatialReference?.isWGS84) {
        geoCenter = center;
      } else {
        const converted = webMercatorUtils.webMercatorToGeographic(center) as __esri.Point | null;

        if (!converted) {
          return;
        }

        geoCenter = converted;
      }

      const lon = geoCenter.longitude ?? geoCenter.x;

      const lat = geoCenter.latitude ?? geoCenter.y;

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return;
      }

      const targetWindow = window.self !== window.top && window.parent ? window.parent : window;

      const url = new URL(targetWindow.location.href);

      /*
       * MAP viewport state
       */
      url.searchParams.set(SHARE_PARAMS.LAT, lat.toFixed(6));

      url.searchParams.set(SHARE_PARAMS.LON, lon.toFixed(6));

      url.searchParams.set(SHARE_PARAMS.ZOOM, Number.isFinite(view.zoom) ? view.zoom.toFixed(1) : "");

      url.searchParams.set(SHARE_PARAMS.MAP_TYPE, view.type === "3d" ? "3d" : "2d");

      /*
       * MAPILLARY viewer state
       */
      if (imageId) {
        url.searchParams.set(SHARE_PARAMS.IMAGE_ID, imageId);

        url.searchParams.set(SHARE_PARAMS.BEARING, this._lastBearing.toFixed(1));
      } else {
        /*
         * Pure map state:
         * no Mapillary image has been selected yet.
         */
        url.searchParams.delete(SHARE_PARAMS.IMAGE_ID);

        url.searchParams.delete(SHARE_PARAMS.BEARING);
      }

      url.searchParams.set(SHARE_PARAMS.BEARING, this._lastBearing.toFixed(1));

      // Remove transient Experience Builder
      // data-source selection state.
      url.hash = "";

      targetWindow.history.replaceState(null, "", url.toString());
    } catch (err) {
      console.warn("Could not synchronize URL state:", err);
    }
  }

  /** Forward hover intent to the reusable sequence-highlight layer owner. */
  private highlightSequenceOnVTL(sequenceId: string | null) {
    this._sequenceHoverHighlight ??= new SequenceHoverHighlight<__esri.VectorTileLayer>();
    this._sequenceHoverHighlight.update(sequenceId, this.state.jimuMapView?.view, this.turboCoverageLayer,
      this.accessToken, this.ArcGISModules ? properties => new this.ArcGISModules.VectorTileLayer(properties) : undefined);
  }



  // #region UTILITIES
  // Misc helpers used across the widget.

  // Fetch ID from Username
  private async getUserIdFromUsername(username: string): Promise<number | null> {
    return resolveCreatorId(username, this.accessToken, this._userIdCache);
  }

  // Reverse geocoding helper
  // Calls ArcGIS World Geocoding API to convert image lat/lon
  // into a readable address displayed in the info box.
  private fetchReverseGeocode = async (lat: number, lon: number) => {
    return fetchReverseAddress(lat, lon, address => this.setState({ address }));
  };

  /*
   * Displays a zoom warning.
   * @param message Text to display
   * @param duration Time in ms. If 0, the message stays indefinitely until cleared manually.
   */
  private showZoomWarning(message: string, duration: number = TIMING.WARNING_DEFAULT_MS) {
    // 1. Clear previous timer to prevent conflicts
    if (this._zoomWarningTimeout) {
      clearTimeout(this._zoomWarningTimeout);
      this._zoomWarningTimeout = null;
    }

    // 2. Set the message
    this.setState({ zoomWarningMessage: message, turboWarningAction: undefined, turboWarningIsHelp: false });

    // 3. If duration > 0, set a timer to auto-hide.
    // If duration is 0, do nothing (it stays visible).
    if (duration > 0) {
      this._zoomWarningTimeout = setTimeout(() => {
        this.setState({ zoomWarningMessage: undefined });
        this._zoomWarningTimeout = null;
      }, duration);
    }
  }

  // Helper to manually clear the warning
  private clearZoomWarning() {
    if (this._zoomWarningTimeout) {
      clearTimeout(this._zoomWarningTimeout);
      this._zoomWarningTimeout = null;
    }
    this.setState({ zoomWarningMessage: undefined, turboWarningAction: undefined, turboWarningIsHelp: false });
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
  private checkForTimeTravel = async (currentImageId: string) => {
    return checkTimeTravelAvailability(currentImageId, () => this.accessToken, hasTimeTravel => this.setState({ hasTimeTravel }));
  };

  /**
   * Displays a temporary toast notification.
   * @param message - React node content to display inside the toast
   * @param duration - Time in milliseconds before the toast disappears (default: 2500ms)
   */
  private showToast(message: React.ReactNode, duration: number = 2500) {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this.setState({ toastMessage: message });
    this._toastTimer = setTimeout(() => {
      this.setState({ toastMessage: undefined });
      this._toastTimer = null;
    }, duration);
  }

  /**
   * Centers the map view on the currently displayed frame.
   * Retrieves the current image from the active sequence and uses its
   * geographic coordinates to reposition the map. The map smoothly
   * animates to the frame location and ensures a minimum zoom level
   * for better visibility. After centering, a toast notification is
   * displayed to inform the user.
   */
  private handleCenterMap = () => {
    const { imageId, sequenceImages, jimuMapView } = this.state;
    if (!imageId || !jimuMapView) return;

    const currentImg = sequenceImages.find((img) => img.id === imageId);
    if (currentImg) {
      jimuMapView.view.goTo(
        {
          center: [currentImg.lon, currentImg.lat],
          zoom: Math.max(jimuMapView.view.zoom, 17),
        },
        { animate: true, duration: 800 },
      );

      this.showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Crosshair size={14} /> Map centered on current frame
        </span>,
      );
    }
  };
  /**
   * Toggles synchronization between the map rotation and the camera heading.
   * When enabled, the map rotates to match the current camera orientation
   * of the viewer. When disabled, the map remains fixed (north-up) regardless
   * of camera direction.
   * After toggling the state, a toast notification is displayed to inform
   * the user whether map rotation is now synced or unlocked.
   */
  private handleToggleSyncHeading = () => {
    const newSyncHeading = !this.state.syncHeading;
    this.setState({ syncHeading: newSyncHeading });

    this.showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {newSyncHeading ? (
          <>
            <Icons.CompassLocked size={14} /> Map rotation synced to camera
          </>
        ) : (
          <>
            <Icons.CompassUnlocked size={14} /> Map rotation unlocked
          </>
        )}
      </span>,
    );
  };

  // Helper for Debug Logging
  private log = (...args: any[]) => {
    if (this.props.config.debugMode) {
      // Adds a prefix so you can easily filter in Chrome DevTools
      console.log("%c[Mapillary Widget]", "color: #37d582; font-weight: bold;", ...args);
    }
  };

  /**
   * Fetches nearby street-level images from the Mapillary Graph API
   * centered on the given coordinates, then populates the nearby image strip.
   * Applies a startup delay on the very first image load so the fetch does not
   * race with the splash-screen fade animation; all subsequent calls are immediate.
   * @param lat     - Latitude of the anchor point (decimal degrees, WGS-84).
   * @param lon     - Longitude of the anchor point (decimal degrees, WGS-84).
   * @param imageId - ID of the currently active image, excluded from results
   *                  so the viewer does not show the current image as a "nearby" suggestion.
   */
  private refreshNearbyAfterPause = () => {
    const image = this.state.sequenceImages.find((img: { id: string; lat: number; lon: number }) => String(img.id) === this.state.imageId);
    if (image && this._userPaused) this.fetchNearbyImages(image.lat, image.lon, String(image.id));
  };
  private fetchNearbyImages(lat: number, lon: number, imageId: string) {
    this._nearbyDiscovery ??= new NearbyImageDiscovery({
      getState: () => this.state,
      update: patch => this.setState(patch),
      isPaused: () => this._userPaused,
      getToken: () => this.accessToken,
      isInitialLoad: () => this._isInitialImageLoad,
      markInitialLoadComplete: () => { this._isInitialImageLoad = false; },
    });
    this._nearbyDiscovery.schedule(lat, lon, imageId);
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
    this._nearbyHighlight ??= new NearbyImageHighlight<__esri.Graphic>();
    this._nearbyHighlight.update(this.state.jimuMapView?.view, this.ArcGISModules, this.state, img);
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
  render() {
    const mapWidgetId = this.props.useMapWidgetIds?.[0];

    // This is the viewer container. It will be placed either in normal widget or fullscreen portal.
    const viewerArea = (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          background: "#000",
          boxSizing: "border-box",
        }}
      >
        {/* This empty div is controlled by Mapillary, React will never touch its internals */}
        <div ref={this.viewerContainer} style={{ width: "100%", height: "100%", position: "relative" }} />

        {/* [4.5.0 Update] LASSO SVG OVERLAY */}
        {/* Renders the dashed cyan line while dragging. */}
        {this.state.isLassoMode && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1000,
              cursor: "crosshair",
              pointerEvents: "auto",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            onPointerDown={this.handleLassoStart}
            onPointerMove={this.handleLassoMove}
            onPointerUp={this.handleLassoEnd}
            onPointerLeave={this.handleLassoEnd}
          >
            {this.state.lassoPolygon.length > 0 && (
              <polygon points={this.state.lassoPolygon.map((p) => `${p[0]},${p[1]}`).join(" ")} fill="rgba(0, 255, 255, 0.2)" stroke="cyan" strokeWidth="2" strokeDasharray="4 2" />
            )}
          </svg>
        )}

        {/* MEASUREMENT FLOATING TEXT OVERLAY */}
        <div
          ref={this.measureLabelRef}
          style={{
            position: "absolute",
            display: "none",
            transform: "translate(-50%, -50%)",
            background: "rgba(20, 20, 20, 0.75)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 0, 0.6)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 1000,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          }}
        ></div>

        {/* FEATURES LOADING REGION; traffic signs / objects tile fetch */}
        {this.state.featuresLoading && (
          <div style={glassStyles.featuresLoadingBadge}>
            <div style={glassStyles.featuresLoadingSpinner} />
            <span style={glassStyles.featuresLoadingText}>Loading features...</span>
          </div>
        )}

        {/* Loading feedback preserves the previous image while the selection opens. */}
        <ImageryLoading loading={this.state.isLoading} hasImage={!!this._lastSuccessfulSelection} representative={!!this.state.imageryRepresentative} />

        {/* CLICK A POINT TO VIEW IMAGERY REGION */}
        {!this.state.imageId && !this.state.isLoading && !this.state.turboLoading && !this.state.noImageMessageVisible && (
          <div style={glassStyles.initialStateContainer}>
            <div className="initial-state-card" style={glassStyles.initialStateCard}>
              {/* Polished text with clean gradient styling */}
              <span
                style={{
                  ...glassStyles.initialStateTextPrimary,
                  background: "linear-gradient(90deg, #fff 0%, #37d582 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CLICK A POINT TO VIEW IMAGERY
              </span>

              {/* Kept intact for TypeScript mapping, automatically hidden by glassStyles config */}
              <span style={glassStyles.initialStateTextSecondary}>(Mapillary imagery will appear here)</span>
            </div>
          </div>
        )}

        {/* NO IMAGE VISIBLE WARNING REGION */}
        {this.state.noImageMessageVisible && (
          <div style={glassStyles.noImageContainer}>
            <div className="no-image-card" style={glassStyles.noImageContent}>
              {/* Icon with a subtle glow */}
              <div
                style={{
                  filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
                  color: "#fff",
                  opacity: 0.9,
                }}
              >
                <Icons.NoImage size={32} />
              </div>

              <span>No nearby Mapillary imagery found.</span>
            </div>
          </div>
        )}

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
            is3D={this.state.jimuMapView?.view?.type === "3d"}
            imageId={this.state.imageId}
            sequenceImages={this.state.sequenceImages}
            onTimeTravel={(lat, lon, imageId) => {
              const url = `https://www.mapillary.com/app/time-travel?lat=${lat}&lng=${lon}&z=17&pKey=${imageId}&focus=photo`;
              this.showToast(
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icons.TimeTravel style={{ color: "#FFD700", width: 14, height: 14 }} /> Opening Time Travel in new tab...
                </span>,
                2000,
              );
              setTimeout(() => window.open(url, "_blank"), 2000);
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
          pointCloudActive={!!this._pointCloudModeActive}
          pointCloudVisible={this.state.pointCloudVisible}
            pointCloudAvailable={this.state.pointCloudAvailable}
          pointCloudFollowImages={!!this.state.pointCloudFollowImages}
          onPointCloudFollowImagesChange={(enabled: boolean) => {
            this._pointCloudAutoFailures = 0;
            this.setState({ pointCloudFollowImages: enabled, pointCloudAutoPaused: false });
            if (!enabled && this._pointCloudAutoTimer) { clearTimeout(this._pointCloudAutoTimer); this._pointCloudAutoTimer = null; }
          }}
            onTogglePointCloud={this.togglePointCloud}
          />
        )}

        {/* NEARBY CAPTURES BOTTOM STRIP */}
        {this.state.nearbyStripOpen && (
          <div className="mapillary-image-tray"
            style={{
              position: "absolute",
              height: "var(--tray-height)",
              boxSizing: "border-box",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 999999990,
              background: "rgba(12,12,12,0.92)",
              backdropFilter: "blur(10px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              padding: "6px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              // slide up animation
              animation: "nearbySlideUp 0.2s ease-out",
            }}
          >
            <style>{`
                            .mapillary-image-tray { --tray-height:176px; --tray-image-height:104px; --tray-card-width:clamp(140px,25vw,220px); }
                            @media(max-width:600px),(max-height:500px) { .mapillary-image-tray { --tray-height:148px; --tray-image-height:76px; --tray-card-width:160px; } }

                            @keyframes nearbySlideUp {
                                from { transform: translateY(100%); opacity: 0; }
                                to   { transform: translateY(0);    opacity: 1; }
                            }
                        `}</style>

            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "24px",
                flexShrink: 0,
                fontSize: "9px",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              <div role="tablist" aria-label="Image sources" style={{ display: "flex", gap: 8 }}>
                {(["nearby", "object"] as const).map(tab => <button key={tab} role="tab" aria-selected={(this.state.imageTrayTab || "nearby") === tab} onClick={() => this.setState({ imageTrayTab: tab })} style={{ background: "none", border: 0, color: (this.state.imageTrayTab || "nearby") === tab ? "#8bdbb7" : "#bbb", padding: "6px", cursor: "pointer" }}>{tab === "nearby" ? `Nearby (${(this.state.nearbyImages || []).length})` : `Selected object (${this.state.alternateImages.length})`}</button>)}
              </div>
              <button
                onClick={() => this.setState({ nearbyStripOpen: false })}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  fontSize: "11px",
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Rows stay mounted while switching tabs, preserving independent scroll positions. */}
            <div role="tabpanel" aria-label="Nearby images"
              style={{
                display: this.state.imageTrayTab === "object" ? "none" : "flex",
                flex: "1 1 0",
                minHeight: 0,
                alignItems: "flex-start",
                overflowY: "hidden",
                gap: "5px",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.2) transparent",
                paddingBottom: "2px",
              }}
            >
              {(this.state.nearbyImages ?? []).map((img) => {
                // Use _nearbySelectedId for instant highlight on click,
                // fall back to imageId so the current sequence image
                // stays highlighted when no carousel pick is pending
                const isCurrent = this._nearbySelectedId ? img.id === this._nearbySelectedId : img.id === this.state.imageId;

                const date = new Date(img.captured_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                });
                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      // Set instantly, no waiting for image event
                      this._nearbySelectedId = img.id;
                      // Force re-render so green border appears immediately
                      this.forceUpdate();
                      this.mapillaryViewer?.moveTo(img.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.04)";
                      this.highlightNearbyPin(img);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      this.highlightNearbyPin(null);
                    }}
                    style={{
                      flex: "0 0 auto",
                      width: "var(--tray-card-width)",
                      scrollSnapAlign: "start",
                      cursor: "pointer",
                      borderRadius: "5px",
                      overflow: "hidden",
                      border: isCurrent ? "2px solid #05a056" : "2px solid transparent",
                      position: "relative",
                      transition: "transform 0.12s",
                    }}
                  >
                    <img src={img.thumb_512_url ?? img.thumb_256_url} alt="" loading="lazy" style={{ width: "100%", height: "var(--tray-image-height)", objectFit: "cover", display: "block" }} />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
                        padding: "10px 4px 3px",
                        fontSize: "8px",
                        color: "rgba(255,255,255,0.85)",
                        lineHeight: 1.3,
                      }}
                    >
                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.creator?.username ?? ""}</div>
                      <div style={{ opacity: 0.7 }}>{date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div role="tabpanel" aria-label="Selected object images" style={{ display: this.state.imageTrayTab === "object" ? "flex" : "none", gap: 6, flex: "1 1 0", minHeight: 0, overflowX: "auto", overflowY: "hidden", alignItems: "flex-start", color: "#ddd", fontSize: 12 }}>
              {this.state.isFetchingAlternates && <span style={{ alignSelf: "center" }} role="status">Loading associated images…</span>}
              {this.state.alternateImagesError && <span style={{ alignSelf: "center" }} role="alert">{this.state.alternateImagesError} <button onClick={() => { const location = this.state.selectedFeatureLocation; const id = this.state.selectedFeatureMetadata?.id; if (location && id) void this.fetchAlternateImages(id, location.lat, location.lon); }}>Retry</button></span>}
              {!this.state.isFetchingAlternates && !this.state.alternateImagesError && !this.state.alternateImages.length && <span>No associated images available. Select a sign or object to see its captures.</span>}
              {this.state.alternateImages.map(img => <button key={img.id} onClick={() => void this._handleSelectAlternateImage(img)} aria-label={`Open associated image ${img.id}`} title={`${img.detectionLabel || "Detected object"} · ${Number.isFinite(img.capturedAt) ? new Date(img.capturedAt).toLocaleDateString() : "Date unavailable"}`} style={{ flex: "0 0 auto", width: "var(--tray-card-width)", padding: 0, background: "#182321", color: "#ddd", border: img.id === this.state.imageId ? "2px solid #05a056" : "2px solid transparent", borderRadius: 5, overflow: "hidden", cursor: "pointer" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "var(--tray-image-height)", background: "#0f1618" }}>
                  <span style={{ display: "inline-block", position: "relative", lineHeight: 0 }}>
                  <img src={img.thumbUrl} alt="Associated camera capture" loading="lazy" style={{ width: "auto", height: "auto", maxWidth: "var(--tray-card-width)", maxHeight: "var(--tray-image-height)", display: "block" }} />
                  {img.detectionBounds && <svg aria-hidden="true" viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    <rect {...img.detectionBounds} fill="none" stroke="#111" strokeWidth={4} vectorEffect="non-scaling-stroke" />
                    <rect {...img.detectionBounds} fill="none" stroke="#ffe45e" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                  </svg>}
                  </span>
                </span>
                <span style={{ display: "block", padding: "3px 4px", height: 20, boxSizing: "border-box", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{img.detectionBounds ? "Outlined" : "Outline unavailable"} · Captured {Number.isFinite(img.capturedAt) ? new Date(img.capturedAt).toLocaleDateString() : "Date unavailable"}</span>
              </button>)}
            </div>
          </div>
        )}
      </div>
    );

    /**
     * NORMAL MODE BLOCK (inside widget bounds)
     */
    const coverageNoticeVisible = !!this.state.zoomWarningMessage && this.shouldShowCoverageNotice();
    const coverageBarVisible = this.shouldShowCoverageBar();
    const coveragePresentation = this.getCoverageBarPresentation();
    const coverageBarHint = this.getCoverageBarHint();
    const guideContext = this.getExplorerGuideContext();
    const guideContextText = guideContext.join(" · ");
    const coverageHelpId = `${this.props.id || "mapillary"}-coverage-help`;

    const normalMode = (
      <div
        className={`widget-mapillary jimu-widget ${this.state.showAiTags ? "" : "hide-mly-tags"}`}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: "none",
          boxSizing: "border-box",
          overflow: "hidden",
          margin: "0",
          padding: "0",
          containerType: "size",
        }}
      >
        {/* wraping this logic component in display:none so it doesn't break the Flex layout */}
        <div style={{ display: "none" }}>{mapWidgetId ? <JimuMapViewComponent useMapWidgetId={mapWidgetId} onActiveViewChange={this.onActiveViewChange} /> : null}</div>

        {/* showing error only if strictly needed,
                    separate from the logic component
                    missing map widget warning overlay*/}
        {!mapWidgetId && (
          <div style={glassStyles.missingMapContainer}>
            <div style={glassStyles.missingMapCard}>
              <div style={glassStyles.missingMapIcon}>
                <Icons.Warning size={36} />
              </div>

              <h3 style={glassStyles.missingMapTitle}>Map Connection Required</h3>

              <p style={glassStyles.missingMapText}>The Mapillary Explorer needs to be linked to a Map Widget to function properly.</p>

              <div style={glassStyles.missingMapInstructionsBox}>
                <div style={glassStyles.missingMapInstructionsTitle}>HOW TO FIX:</div>
                <ol style={glassStyles.missingMapInstructionsList}>
                  <li>
                    Open this widget's <b>Settings</b> panel
                  </li>
                  <li>
                    Go to the <b>Source</b> tab
                  </li>
                  <li>
                    Click <b>Select Map widget</b>
                  </li>
                  <li>Select your target map name</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="mly-viewer-workspace" style={{ flex: "1 1 0", minHeight: 0, minWidth: 0, position: "relative", isolation: "isolate", zIndex: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {viewerArea}


        {(this.state.toastMessage || this.state.pointCloudLoading) && <div style={{ ...glassStyles.toastContainer, top: this.state.isLoading ? 12 : undefined, bottom: this.state.isLoading ? "auto" : glassStyles.toastContainer.bottom, display: "flex", alignItems: "center", gap: 10, maxWidth: "calc(100% - 24px)", width: "max-content", whiteSpace: "normal", boxSizing: "border-box" }}>
          <div style={{ flex: "1 1 auto", minWidth: 0, maxWidth: "100%", whiteSpace: "normal", overflowWrap: "anywhere" }}>{this.state.toastMessage || "Loading point cloud…"}</div>

        </div>}

        <FieldNotesPanel
          isAnnotationMode={this.state.isAnnotationMode}
          pendingNote={this.state.pendingFieldNote}
          notes={this.state.fieldNotes}
          enterpriseEnabled={!!this.props.config.sharedFieldNotesEnabled}
          onLoadEnterpriseNotes={this.loadEnterpriseNotesPage}
          enterpriseContext={this.state.jimuMapView?.view}
          enterpriseLayerUrl={String(this.props.config.sharedFieldNotesReadUrl || this.props.config.sharedFieldNotesUrl || "")}
          sharingEnabled={!!(this.props.config.sharedFieldNotesEnabled && this.props.config.sharedFieldNotesUrl)}
          sharedMessage={this.props.config.sharedFieldNotesEnabled ? this.state.sharedNotesMessage : undefined}
          attachments={this.state.fieldNoteAttachments}
          currentImageAvailable={!!this.state.imageId}
          onAttachments={note => void this.openFieldNoteAttachments(note)}
          onUploadAttachment={this.uploadFieldNoteAttachment}
          onDownloadAttachment={this.downloadFieldNoteAttachment}
          onCloseAttachments={this.closeFieldNoteAttachments}
          editor={this.state.fieldNoteEditor}
          onEditNote={this.editLocalFieldNote}
          onEditSharedNote={note => void this.openSharedFieldNoteEditor(note)}
          onSaveEdit={this.saveFieldNoteEdit}
          onCancelEdit={this.cancelFieldNoteEdit}
          onShareNote={this.publishFieldNote}
          onRetrySharedDisplay={() => void this.syncSharedFieldNotes(true)}
          listOpen={this.state.fieldNotesListOpen}
          categories={this.props.config.fieldNoteCategories ? Array.from(this.props.config.fieldNoteCategories) : undefined}
          onSubmitNote={this.submitFieldNote}
          onCancelPending={this.cancelPendingFieldNote}
          onDeleteNote={this.deleteFieldNote}
          onClearAll={this.clearAllFieldNotes}
          onExport={this.exportFieldNotes}
          onImportFile={this.importFieldNotesFile}
          onFocusNote={this.focusFieldNote}
          onCloseList={() => this.setState({ fieldNotesListOpen: false })}
        />

        {/* INFO BOX */}
        {!this.state.isFullscreen && <InfoBox
          hideInfoBox={this.props.config.hideInfoBox}
          turboCreator={this.props.config.turboCreator}
          imageId={this.state.imageId}
          address={this.state.address}
          currentZoom={this.state.currentZoom}
          jimuMapViewZoom={this.state.jimuMapView?.view?.zoom}
          sequenceImages={this.state.sequenceImages}
          turboModeActive={this.state.turboModeActive}
          turboColorByDate={this.state.turboColorByDate}
          turboYearLegend={this.state.turboYearLegend}
          selectedTurboYear={this.state.selectedTurboYear}
          trafficSignsActive={this.state.trafficSignsActive}
          objectsActive={this.state.objectsActive}
          detectionsActive={this.state.detectionsActive}
          showAiTags={this.state.showAiTags}
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
          onRetryPointCloud={() => { this._pointCloudAutoFailures = 0; this.setState({ pointCloudAutoPaused: false }, () => void this.loadPointCloudLayer(false, true)); }}
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
          signSpriteScale={this.state.signSpriteScale || 1}
          objectSpriteScale={this.state.objectSpriteScale || 1}
          onSpriteScaleChange={this.changeMapFeatureSpriteScale}
          showTurboFilterBox={this.state.showTurboFilterBox}
          showTrafficSignsFilterBox={this.state.showTrafficSignsFilterBox}
          showObjectsFilterBox={this.state.showObjectsFilterBox}
          turboFilterUsername={this.state.turboFilterUsername}
          turboFilterStartDate={this.state.turboFilterStartDate}
          turboFilterEndDate={this.state.turboFilterEndDate}
          turboFilterIsPano={this.state.turboFilterIsPano}
          turboFilterOnFoot={this.state.turboFilterOnFoot}
          onTurboTravelMethodChange={this.changeTravelMethod}
          turboColorByDate={this.state.turboColorByDate}
          turboModeActive={this.state.turboModeActive}
          turboCreator={this.props.config.turboCreator}
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
                const jsonResp = await fetch(`${SPRITE_URLS.TRAFFIC_SIGNS}.json`);
                const spriteData = await jsonResp.json();
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
                const jsonResp = await fetch(`${SPRITE_URLS.OBJECTS}.json`);
                const spriteData = await jsonResp.json();
                const code = Object.keys(spriteData).find((c) => (objectNameMap[c] || c) === newName);
                filterCode = code || newName;
              }
              this.filterObjectsVTLayer(filterCode);
            });
          }}
        />

        {/* Splash Screen */}
        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />

        {/* Control Bar */}
        <ControlBar
          hideTurboFilter={this.props.config.hideTurboFilter}
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
        {coverageBarVisible && (
          <div className="mly-coverage-notice" style={coverageNoticeStyles.container}>
            <img src={MAPILLARY_IMAGE} alt="" aria-hidden="true" style={coverageNoticeStyles.statusIcon} />
            <div role="status" aria-live="polite" aria-atomic="true" style={coverageNoticeStyles.status}>
              {(this.state.turboUpdatingVisible || this.state.isLoading || this.state.sequenceRouteLoading) && <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
                <circle cx="8" cy="8" r="6" fill="none" stroke="#436052" strokeWidth="2" />
                <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="#91d9b5" strokeWidth="2" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.9s" repeatCount="indefinite" />
                </path>
              </svg>}
              <span style={coverageNoticeStyles.title} title={coveragePresentation.text}>{coveragePresentation.text}</span>
            </div>
            {!!guideContext.length && <span className="mly-coverage-filter-hint" title={guideContextText} style={{ ...coverageNoticeStyles.secondary, minWidth: 0, maxWidth: "38%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{guideContextText}</span>}
            <span className="mly-coverage-context-hint" style={coverageNoticeStyles.secondary}>
              <span className="mly-coverage-mouse-hint">{coverageBarHint}</span>
              <span className="mly-coverage-touch-hint">{this.state.turboFilterOnFoot !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6 ? "Zoom closer for travel-method coverage" : this.state.turboLoading ? "Coverage is loading" : (this.state.jimuMapView?.view?.zoom ?? 0) < 14 ? "Tap a coverage line to open imagery" : "Tap a point to open imagery"}</span>
            </span>
            {coveragePresentation.action && (
              <button type="button" onClick={() => void this.handleTurboWarningAction(coveragePresentation.action)} style={coverageNoticeStyles.action}>
                {coveragePresentation.label}
              </button>
            )}
            <button ref={this._coverageHelpButton} className="mly-coverage-help-button" type="button" aria-controls={coverageHelpId} aria-expanded={!!this.state.coverageHelpOpen} onClick={() => this.state.coverageHelpOpen ? this.closeCoverageHelp() : this.setState({ coverageHelpOpen: true })} aria-label="Explorer guide and active filters" title="Explorer guide and active filters" style={coverageNoticeStyles.helpButton}>ⓘ</button>

          </div>
        )}
        {this.state.selectionError && (
          <div role="alert" style={{ ...coverageNoticeStyles.helpPanel, zIndex: 1100 }}>
            <div style={coverageNoticeStyles.message}>{this.state.selectionError}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {this.state.selectionCanRetry && <button type="button" onClick={() => void this.retrySelectedImage()} style={coverageNoticeStyles.action}>Retry image</button>}
              <button type="button" aria-label="Dismiss image error" onClick={() => this.setState({ selectionError: undefined })} style={coverageNoticeStyles.action}>Dismiss</button>
            </div>
          </div>
        )}
        {coverageBarVisible && this.state.coverageHelpOpen && (
          <div id={coverageHelpId} className="mly-coverage-help" role="dialog" aria-label="Coverage help" aria-modal="false" tabIndex={-1} ref={this._focusCoverageHelp} onKeyDown={event => { if (event.key === "Escape") this.closeCoverageHelp(); }} style={coverageNoticeStyles.helpPanel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><img src={MAPILLARY_IMAGE} alt="" aria-hidden="true" style={coverageNoticeStyles.logo} /><div style={coverageNoticeStyles.brand}>MAPILLARY EXPLORER · GUIDE</div></div>
              <button type="button" aria-label="Close coverage help" onClick={() => this.closeCoverageHelp()} style={coverageNoticeStyles.close}>×</button>
            </div>
            <div style={{ ...coverageNoticeStyles.message, marginBottom: 6 }}><strong>{coveragePresentation.text}</strong></div>
            <div style={coverageNoticeStyles.message}>{this.state.turboFilterOnFoot !== undefined ? "Travel-method coverage starts at regional zoom; zoom closer to see matching coverage lines. " : "At the farthest zooms, hover an overview dot to preview its representative image; tap or click to open it. "}At regional zooms, click a coverage line to open a representative image. Zoom closer to select individual images. Hover a point to preview it; tap or click to open imagery.</div>
            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: "4px 0", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}
            {coverageNoticeVisible && !this.state.turboWarningIsHelp && <p style={coverageNoticeStyles.message}>{this.state.zoomWarningMessage}</p>}
            <label style={coverageNoticeStyles.optOut}>
              <input type="checkbox" checked={!this.shouldShowCoverageNotice()} onChange={event => { if (event.currentTarget.checked) this.hideCoverageNotices(); }} style={{ margin: 0, width: 16, height: 16, accentColor: "#91d9b5" }} />
              <span>Hide the guide bar until the page is refreshed</span>
            </label>
          </div>
        )}
      </div>
    );

    /**
     * FULLSCREEN MODE BLOCK (portal to body)
     */
    const fullscreenImage = this.state.sequenceImages.find(image => image.id === this.state.imageId)
      || this._lastSuccessfulSelection?.sequenceImages.find(image => image.id === this.state.imageId);
    const fullscreenMode = ReactDOM.createPortal(
      <div className={`mly-fullscreen-viewer${this.state.minimapExpanded ? " mly-minimap-expanded" : ""}`} style={{ ...fullscreenOverlayStyle, containerType: "size" }}>
        <style>{`
          .mly-fullscreen-viewer.mly-minimap-expanded .minimap-container {
            width: min(420px, calc(100% - 24px)) !important; max-width: 420px !important;
            height: min(280px, 42dvh) !important;
          }
          .mly-fullscreen-viewer.mly-minimap-expanded .glass-image-utility-panel, .mly-fullscreen-viewer.mly-minimap-expanded .mly-fullscreen-location { display: none !important; }
          .mly-fullscreen-location { position: absolute; top: 12px; right: 12px; max-width: 200px; z-index: 10002; padding: 5px 7px; border-radius: 6px; background: #14251ddd; color: #e2ece7; font-size: 10px; }
          .mly-fullscreen-location button { padding: 3px 0; background: none; border: 0; color: #bdd8c8; cursor: pointer; font: inherit; }
          @media (max-width: 768px) { .mly-fullscreen-location { top: calc(76px + env(safe-area-inset-top, 0px)); right: 8px; max-width: 46%; font-size: 9px; } }
          /* Keep mobile perspective navigation clear of widget overlays. */
          @media (max-width: 768px) {
            .mly-fullscreen-viewer .minimap-container {
              top: calc(90px + env(safe-area-inset-top, 0px)) !important;
              bottom: auto !important; left: calc(8px + env(safe-area-inset-left, 0px)) !important;
              width: min(30vw, 112px) !important; max-width: 112px !important;
              height: 78px !important; border-radius: 8px !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel {
              top: calc(178px + env(safe-area-inset-top, 0px)) !important;
              bottom: auto !important; right: auto !important;
              left: calc(8px + env(safe-area-inset-left, 0px)) !important;
              padding: 3px !important; gap: 3px !important;
              border-radius: 9px !important; background: rgba(20, 27, 24, 0.48) !important;
              box-shadow: 0 2px 8px #0003 !important;
            }
            .mly-fullscreen-viewer .mapillary-point-cloud-mode > div[role="group"] {
              left: calc(100% + 6px) !important; right: auto !important;
              top: 0 !important; bottom: auto !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel .utility-button {
              width: 24px !important; height: 24px !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel .utility-button svg {
              width: 14px !important; height: 14px !important;
            }
          }
          @media (max-width: 768px) and (max-height: 440px) {
            .mly-fullscreen-viewer .minimap-container {
              top: calc(78px + env(safe-area-inset-top, 0px)) !important;
              width: 96px !important; height: 64px !important;
            }
            .mly-fullscreen-viewer .glass-image-utility-panel {
              top: calc(78px + env(safe-area-inset-top, 0px)) !important;
              left: calc(114px + env(safe-area-inset-left, 0px)) !important;
            }
          }
        `}</style>
        {viewerArea}
        <button onClick={this.toggleFullscreen} title="Exit Fullscreen" style={fullscreenExitButtonStyle}>
          <Icons.Minimize />
        </button>

        {/* Toggle Minimap Button */}
        <button
          onClick={() => this.setState((prev) => ({ showMinimap: !prev.showMinimap }))}
          title={this.state.showMinimap ? "Hide Minimap" : "Show Minimap"}
          style={fullscreenMinimapToggleButtonStyle}
        >
          {/* Simple SVG Icons for Map Toggle */}
          {this.state.showMinimap ? <Icons.MapOpen size={16} color="white" /> : <Icons.MapClosed size={16} color="white" />}
        </button>

        {!this.props.config.hideInfoBox && fullscreenImage && <div className="mly-fullscreen-location">
          <div title={this.state.address || "Current image"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{this.state.address || "Current image"}</div>
          <button type="button" title="Copy latitude and longitude" aria-label="Copy current image coordinates" onClick={() => void this.copyImageCoordinates(fullscreenImage.lat, fullscreenImage.lon)}>{fullscreenImage.lat.toFixed(6)}, {fullscreenImage.lon.toFixed(6)}</button>
        </div>}
        {/* Minimap frame keeps React controls separate from ArcGIS-managed content. */}
        <div className="minimap-container" style={getMinimapContainerStyle(this.state.showMinimap)}>
          {this.state.minimapExpanded && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, padding: "3px 36px 3px 8px", boxSizing: "border-box", background: "#14251d", color: "#e2ece7", fontSize: 10 }}>
            <div title={this.state.address || "Current image"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{this.state.address || "Current image"}</div>
            {!this.props.config.hideInfoBox && fullscreenImage && <button type="button" title="Copy latitude and longitude" onClick={() => void this.copyImageCoordinates(fullscreenImage.lat, fullscreenImage.lon)} style={{ padding: 0, border: 0, background: "none", color: "#bdd8c8", font: "inherit", cursor: "pointer" }}>{fullscreenImage.lat.toFixed(6)}, {fullscreenImage.lon.toFixed(6)}</button>}
          </div>}
          <div ref={this.minimapContainer} style={{ width: "100%", height: this.state.minimapExpanded ? "calc(100% - 36px)" : "100%", marginTop: this.state.minimapExpanded ? 36 : 0 }} />
          <button type="button" aria-label={this.state.minimapExpanded ? "Collapse minimap" : "Expand minimap"} aria-expanded={!!this.state.minimapExpanded} title={this.state.minimapExpanded ? "Collapse minimap" : "Expand minimap"} onClick={() => this.setState(prev => ({ minimapExpanded: !prev.minimapExpanded }))} style={{ position: "absolute", top: 3, right: 3, zIndex: 10002, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ffffff45", borderRadius: 4, background: "#17251ede", color: "white", cursor: "pointer" }}>
            {this.state.minimapExpanded ? <Icons.Minimize size={14} /> : <Icons.Maximize size={14} />}
          </button>
        </div>
      </div>,
      document.body,
    );
    /** Return either normal or fullscreen layout */
    return this.state.isFullscreen ? fullscreenMode : normalMode;
  }
}
