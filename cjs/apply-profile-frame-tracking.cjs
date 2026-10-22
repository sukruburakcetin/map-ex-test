#!/usr/bin/env node
'use strict';
/** Confirmed-image elevation profile tracking installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx confirmed profile tracking block 1",
          "before": "import { SolarViewerRenderer } from '../features/solar/SolarViewerRenderer';\nimport { SolarSceneLighting } from '../features/solar/SolarSceneLighting';\nimport { updateElevationIndicator } from '../features/elevation/profileIndicator';\nimport { SceneTerrainController } from '../features/elevation/SceneTerrainController';\nimport { ElevationProfileController } from '../features/elevation/ElevationProfileController';\n",
          "after": "import { SolarViewerRenderer } from '../features/solar/SolarViewerRenderer';\nimport { SolarSceneLighting } from '../features/solar/SolarSceneLighting';\nimport { SceneTerrainController } from '../features/elevation/SceneTerrainController';\nimport { ElevationProfileController } from '../features/elevation/ElevationProfileController';\n"
        },
        {
          "label": "src/runtime/widget.tsx confirmed profile tracking block 2",
          "before": "  // Elevation Profile\n  private _elevationProfile: ElevationProfileController | null = null;\n  private _sceneTerrain: SceneTerrainController | null = null;\n  private syncSceneTerrain(view = this.state.jimuMapView?.view): void {\n",
          "after": "  // Elevation Profile\n  private _elevationProfile: ElevationProfileController | null = null;\n  private _profileConfirmedImageId: string | null = null;\n  private _profileConfirmedViewer: any = null;\n  private _sceneTerrain: SceneTerrainController | null = null;\n  private syncSceneTerrain(view = this.state.jimuMapView?.view): void {\n"
        },
        {
          "label": "src/runtime/widget.tsx confirmed profile tracking block 3",
          "before": "  // Binds events (cone drawing, zoom, image changes) to the current viewer instance.\n  private bindMapillaryEvents() {\n    if (!this.mapillaryViewer) return;\n\n",
          "after": "  // Binds events (cone drawing, zoom, image changes) to the current viewer instance.\n  private bindMapillaryEvents() {\n    const profileEventViewer = this.mapillaryViewer;\n    if (!this.mapillaryViewer) return;\n\n"
        },
        {
          "label": "src/runtime/widget.tsx confirmed profile tracking block 4",
          "before": "    // 3. Image Change Event\n    this.mapillaryViewer.on(\"image\", async (event: any) => {\n      // Apply custom angle if set in config\n      // Only apply custom angle on the initial load, not during sequence navigation\n",
          "after": "    // 3. Image Change Event\n    this.mapillaryViewer.on(\"image\", async (event: any) => {\n      if (this.mapillaryViewer !== profileEventViewer) return;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n      this.updateProfileIndicator();\n      // Apply custom angle if set in config\n      // Only apply custom angle on the initial load, not during sequence navigation\n"
        },
        {
          "label": "src/runtime/widget.tsx confirmed profile tracking block 5",
          "before": "private updateElevationProfile = async () => {\n    const { jimuMapView, sequenceImages, isElevationProfileActive } = this.state;\n    if (this.props.config.enableElevationProfile !== true || !isElevationProfileActive || !jimuMapView || !sequenceImages || sequenceImages.length < 2) return;\n    const view = jimuMapView.view;\n    await this.ensureElevationProfileOwner().update(view, sequenceImages, () =>\n      this.props.config.enableElevationProfile === true && this.state.isElevationProfileActive && this.state.jimuMapView?.view === view);\n  };\n\n  /** Forward the current frame to the elevation chart's presentation module. */\nprivate updateProfileIndicator = () => {\n    updateElevationIndicator(this._elevationProfile?.widget, this.state.sequenceImages, this.state.imageId, this.state.isElevationProfileActive);\n  };\n  // #endregion ELEVATION PROFILE\n",
          "after": "private updateElevationProfile = async () => {\n    const { jimuMapView, sequenceImages, isElevationProfileActive } = this.state;\n    if (this.props.config.enableElevationProfile !== true || !isElevationProfileActive || !jimuMapView) return;\n    if (!sequenceImages || sequenceImages.length < 2) { this.clearElevationProfile(); return; }\n    const view = jimuMapView.view;\n    try {\n      await this.ensureElevationProfileOwner().update(view, sequenceImages, () =>\n        this.props.config.enableElevationProfile === true && this.state.isElevationProfileActive && this.state.jimuMapView?.view === view);\n      this.updateProfileIndicator();\n    } catch (error) {\n      console.warn(\"[Mapillary profile] Could not generate the current sequence profile:\", error);\n    }\n  };\n\n  /** Forward the current frame to the elevation chart's presentation module. */\nprivate updateProfileIndicator = () => {\n    const confirmed = this.state.isElevationProfileActive && this._profileConfirmedViewer === this.mapillaryViewer &&\n      this._profileConfirmedImageId === String(this.state.imageId) ? this._profileConfirmedImageId : null;\n    this._elevationProfile?.track(confirmed);\n  };\n  // #endregion ELEVATION PROFILE\n"
        },
        {
          "label": "src/runtime/widget.tsx confirmed profile tracking block 6",
          "before": "\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevProps.config.enable3DTerrain !== this.props.config.enable3DTerrain) this.syncSceneTerrain();\n    const previousOrganization = organizationFilterId(prevProps.config.turboOrganization || prevState.turboFilterOrganization);\n",
          "after": "\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (this.state.isElevationProfileActive && (prevState.sequenceImages !== this.state.sequenceImages ||\n      prevState.jimuMapView?.view !== this.state.jimuMapView?.view)) void this.updateElevationProfile();\n    if (prevState.imageId !== this.state.imageId) this.updateProfileIndicator();\n    if (prevProps.config.enable3DTerrain !== this.props.config.enable3DTerrain) this.syncSceneTerrain();\n    const previousOrganization = organizationFilterId(prevProps.config.turboOrganization || prevState.turboFilterOrganization);\n"
        }
      ],
      "absentAfterUninstall": [
        "_profileConfirmedImageId",
        "_profileConfirmedViewer",
        "profileEventViewer"
      ],
      "requiredOccurrences": [
        {
          "text": "_profileConfirmedImageId",
          "count": 4
        },
        {
          "text": "_profileConfirmedViewer",
          "count": 3
        },
        {
          "text": "profileEventViewer",
          "count": 3
        }
      ]
    },
    {
      "file": "src/features/elevation/ElevationProfileController.ts",
      "blocks": [
        {
          "label": "src/features/elevation/ElevationProfileController.ts confirmed profile tracking block 1",
          "before": "import type { ElevationIndicatorImage, ElevationIndicatorWidget } from './profileIndicator';\n\n/** Minimal host boundary; constructors are supplied by the Experience Builder SDK loader. */\nexport interface ElevationProfileView {\n  type: string;\n  map: { ground?: { layers?: { length: number } } };\n  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };\n}\n",
          "after": "import { ProfileFrameChart } from './profileIndicator';\nimport type { ElevationIndicatorWidget } from './profileIndicator';\nimport { frameDistanceIndex, sameProfileInput } from './profileTracking';\nimport type { ElevationIndicatorImage } from './profileTracking';\n\n/** Minimal host boundary; constructors are supplied by the Experience Builder SDK loader. */\nexport interface ElevationProfileView {\n  type: string;\n  destroyed?: boolean;\n  map?: { ground?: { layers?: { length: number } } } | null;\n  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };\n}\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts confirmed profile tracking block 2",
          "before": "type SDKConstructor = new (properties: any) => any;\n\n/** Owns the optional chart widget, independent terrain source and asynchronous update revision.\n * Runtime supplies active-view/mode validity; this owner never changes map ground or camera.\n * Module requests cannot be aborted, so disposal and newer updates invalidate late completions.\n */\nexport class ElevationProfileController {\n",
          "after": "type SDKConstructor = new (properties: any) => any;\n\n/** Generate profiles and the frame index from one immutable route snapshot.\n * Confirmed frame changes only update the chart needle; queries are route-owned.\n * SDK sample inspection cannot replace or move the active-image map marker.\n */\nexport class ElevationProfileController {\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts confirmed profile tracking block 3",
          "before": "  private terrainSource: { destroy(): void } | null = null;\n  private revision = 0;\n  private readonly loadModules: (ids: string[]) => Promise<SDKConstructor[]>;\n  private readonly getGraphic: () => SDKConstructor;\n\n  constructor(loadModules: (ids: string[]) => Promise<SDKConstructor[]>, getGraphic: () => SDKConstructor) {\n    this.loadModules = loadModules; this.getGraphic = getGraphic;\n  }\n\n  /** Build or update the existing sequence profile. Coordinates are degrees; altitude is metres.\n   * The original terrain/input/infrastructure profiles and bottom-leading placement are preserved.\n   */\n  async update(view: ElevationProfileView, sequenceImages: readonly ElevationIndicatorImage[], isCurrent: () => boolean): Promise<void> {\n    const request = ++this.revision;\n    // Sample fallback terrain for the chart without changing the visible map's ground.\n    const needsTerrainSource = !view.map.ground?.layers?.length;\n    const [ElevationProfile, Polyline, ElevationLayer] = await this.loadModules([\n      \"esri/widgets/ElevationProfile\", \"esri/geometry/Polyline\",\n      ...(needsTerrainSource ? [\"esri/layers/ElevationLayer\"] : []),\n    ]);\n    if (request !== this.revision || !isCurrent()) return;\n    const Graphic = this.getGraphic();\n\n    // 2. Build 3D polyline with altitude (if available from Mapillary)\n    const hasAltitude = sequenceImages.some((img) => (img as any).alt && (img as any).alt !== 0);\n    const paths = sequenceImages.map((img) => [img.lon, img.lat, (img as any).alt || 0]);\n\n    const polyline = new Polyline({\n      paths: [paths],\n      hasZ: hasAltitude,\n      spatialReference: { wkid: 4326 },\n    });\n\n    const inputGraphic = new Graphic({\n      geometry: polyline,\n    });\n\n    // 3. Configure profiles: Terrain + Vehicle Trajectory + 3D Buildings\n    if (needsTerrainSource && !this.terrainSource) {\n      this.terrainSource = new ElevationLayer({ url: \"https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer\" });\n    }\n    const profiles: any[] = [needsTerrainSource\n      ? { type: \"query\", source: this.terrainSource, title: \"Terrain Surface\", color: \"#2ecc71\" }\n      : { type: \"ground\", title: \"Terrain Surface\", color: \"#2ecc71\" }];\n\n    // If Mapillary has GPS/SfM altitude, plot the vehicle's path!\n    if (hasAltitude) {\n      profiles.push({ type: \"input\", title: \"Vehicle Altitude\", color: \"#f39c12\" });\n    }\n\n    if (view.type === \"3d\") {\n      profiles.push({ type: \"view\", title: \"3D Infrastructure\", color: \"#3498db\" });\n    }\n\n    if (!this.widget) {\n      this.widget = new ElevationProfile({\n        view: view,\n        profiles: profiles,\n        visibleElements: {\n          selectButton: false, // Hide manual select button\n          sketchButton: false, // Hide sketch button\n          settingsButton: false, // Hide bulky gear icon\n          clearButton: false, // Hide trash can button\n          uniformChartScalingToggle: false, // Hide scaling toggle\n        },\n        input: inputGraphic,\n      });\n\n      view.ui.add(this.widget, \"bottom-leading\");\n    } else {\n      this.widget.profiles = profiles;\n      this.widget.input = inputGraphic;\n    }\n  }\n\n  /** Invalidate pending updates, remove chart annotations, then destroy chart and query source.\n   * View transfer retains its existing best-effort widget teardown; ordinary clear propagates SDK errors.\n   * The host passes the same UI view as before extraction to preserve teardown ordering.\n   */\n  clear(view?: ElevationProfileView, transferring = false): void {\n    ++this.revision;\n    if (view && this.widget) {\n      if (transferring) {\n        try { view.ui.remove(this.widget); this.widget.destroy(); } catch (error) {}\n      } else {\n        const container = this.widget.container as HTMLElement;\n        container?.querySelector('#mly-elevation-needle')?.remove();\n        container?.querySelector('#mly-elevation-badge')?.remove();\n        view.ui.remove(this.widget);\n        this.widget.destroy();\n      }\n      this.widget = null;\n    }\n    this.terrainSource?.destroy(); this.terrainSource = null;\n  }\n}\n",
          "after": "  private terrainSource: { destroy(): void } | null = null;\n  private revision = 0;\n  private view: ElevationProfileView | null = null;\n  private images: readonly ElevationIndicatorImage[] | null = null;\n  private pendingImages: readonly ElevationIndicatorImage[] | null = null;\n  private chart: ProfileFrameChart | null = null;\n  private chartWatch: { remove(): void } | null = null;\n  private confirmedImageId: string | null = null;\n  constructor(private readonly loadModules: (ids: string[]) => Promise<any[]>, private readonly getGraphic: () => SDKConstructor) {}\n\n  track(imageId: string | null): void {\n    this.confirmedImageId = imageId;\n    this.chart?.setFrame(imageId);\n  }\n\n  async update(view: ElevationProfileView, sequenceImages: readonly ElevationIndicatorImage[], isCurrent: () => boolean): Promise<void> {\n    if (!view.map || view.destroyed) { this.clear(); return; }\n    const map = view.map;\n    if (this.view === view && this.images && sameProfileInput(this.images, sequenceImages)) { this.track(this.confirmedImageId); return; }\n    if (this.view === view && this.pendingImages && sameProfileInput(this.pendingImages, sequenceImages)) return;\n    const confirmed = this.confirmedImageId;\n    this.clear(); this.confirmedImageId = confirmed;\n    this.view = view;\n    if (sequenceImages.length < 2) return;\n    const snapshot = sequenceImages.map(image => ({ id: String(image.id), lon: image.lon, lat: image.lat, alt: image.alt }));\n    this.pendingImages = snapshot;\n    const request = ++this.revision;\n    const current = () => request === this.revision && this.view === view && view.map === map && !view.destroyed && isCurrent();\n    const needsTerrainSource = !map.ground?.layers?.length;\n    try {\n      const [ElevationProfile, Polyline, geodesicUtils, reactiveUtils, ElevationLayer] = await this.loadModules([\n        'esri/widgets/ElevationProfile', 'esri/geometry/Polyline', 'esri/geometry/support/geodesicUtils', 'esri/core/reactiveUtils',\n        ...(needsTerrainSource ? ['esri/layers/ElevationLayer'] : []),\n      ]);\n      if (!current()) return;\n      const lengths: number[] = [];\n      // The SDK uses ellipsoidal geodesic distances for geographic profile input.\n      // Build once, in bounded batches; never scan the route during frame playback.\n      for (let start = 1; start < snapshot.length; start += 256) {\n        if (!current()) return;\n        const segments = snapshot.slice(start, start + 256).map((image, offset) => {\n          const previous = snapshot[start + offset - 1];\n          return new Polyline({ paths: [[[previous.lon, previous.lat], [image.lon, image.lat]]], spatialReference: { wkid: 4326 } });\n        });\n        lengths.push(...geodesicUtils.geodesicLengths(segments, 'meters'));\n        if (start + 256 < snapshot.length) await new Promise(resolve => setTimeout(resolve, 0));\n      }\n      if (!current()) return;\n      const index = frameDistanceIndex(snapshot, lengths);\n      if (!(index.total > 0)) { this.pendingImages = null; return; }\n      const Graphic = this.getGraphic();\n      const hasAltitude = snapshot.some(image => typeof image.alt === 'number' && Number.isFinite(image.alt));\n      const polyline = new Polyline({ paths: [snapshot.map(image => [image.lon, image.lat, image.alt || 0])], hasZ: hasAltitude, spatialReference: { wkid: 4326 } });\n      const inputGraphic = new Graphic({ geometry: polyline, elevationInfo: { mode: 'absolute-height' } });\n      if (needsTerrainSource) this.terrainSource = new ElevationLayer({ url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer' });\n      const profiles: any[] = [needsTerrainSource\n        ? { type: 'query', source: this.terrainSource, title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }\n        : { type: 'ground', title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }];\n      if (hasAltitude) profiles.push({ type: 'input', title: 'Vehicle Altitude', color: '#f39c12', viewVisualizationEnabled: false });\n      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n        visibleElements: { selectButton: false, sketchButton: false, settingsButton: false, clearButton: false, uniformChartScalingToggle: false } });\n      this.widget!.viewModel.hoveredChartPosition = null;\n      this.images = snapshot; this.pendingImages = null;\n      view.ui.add(this.widget, 'bottom-leading');\n      this.chart = new ProfileFrameChart(this.widget!, index);\n      this.chart.setFrame(this.confirmedImageId);\n      this.chartWatch = reactiveUtils.watch(() => [this.widget?.viewModel.progress,\n        ...this.widget?.profiles.toArray().flatMap((line: any) => [line.visible, line.samples]) || []], () => this.chart?.refresh());\n    } catch (error) {\n      if (current()) { this.clear(); throw error; }\n    } finally {\n      if (request === this.revision) this.pendingImages = null;\n    }\n  }\n\n  /** Always remove from the creating view, including a 2D/3D transfer. */\n  clear(_view?: ElevationProfileView, transferring = false): void {\n    ++this.revision;\n    this.chartWatch?.remove(); this.chartWatch = null;\n    this.chart?.dispose(); this.chart = null;\n    const widget = this.widget, view = this.view;\n    this.widget = null; this.view = null; this.images = null; this.pendingImages = null; this.confirmedImageId = null;\n    try {\n      if (widget) {\n        try { view?.ui.remove(widget); } finally { widget.destroy(); }\n      }\n    } catch (error) { if (!transferring) throw error; }\n    finally { this.terrainSource?.destroy(); this.terrainSource = null; }\n  }\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "ProfileFrameChart",
        "frameDistanceIndex",
        "sameProfileInput"
      ],
      "requiredOccurrences": [
        {
          "text": "ProfileFrameChart",
          "count": 3
        },
        {
          "text": "frameDistanceIndex",
          "count": 2
        },
        {
          "text": "sameProfileInput",
          "count": 3
        }
      ]
    },
    {
      "file": "src/features/elevation/README.md",
      "blocks": [
        {
          "label": "src/features/elevation/README.md confirmed profile tracking block 1",
          "before": "# Elevation profile\n\n`profileIndicator.ts` synchronizes the existing ArcGIS elevation chart with the active image. It computes cumulative sequence distance in metres, sets the SDK hover position, and updates the needle and distance/altitude badge. Static overlay styles live in `src/styles/elevationIndicator.ts`; pixel positions depend on the live chart bounds.\n\n`ElevationProfileController.ts` owns chart creation, independent terrain sources, update revisions and teardown. The runtime binds SDK factories once, supplies the sequence snapshot and a live view/configuration/mode predicate, and calls the indicator from the existing playback/state lifecycle. The indicator adds no listeners, animation frames, timers, caches, network requests, or camera changes. Nodes are reused and are removed by the existing profile teardown.\n\nWhen changing the renderer, preserve SVG-bounds positioning, the margin fallback before the SVG is ready, and tolerance of SDK hover setters that reject writes. `tests/elevationIndicator.test.cjs` covers those contracts. Validate the chart in both 2D and 3D in Experience Builder after visual changes.\n\nThe controller loads the same SDK modules in the same order and reuses the chart and terrain source across updates. A flat map uses a query profile without replacing visible map ground. Existing terrain uses a ground profile. Clearing invalidates late module completions and releases annotations, widget, then source. View-transfer cleanup retains the host\u2019s existing best-effort widget teardown. The host still chooses the UI view used for removal; this extraction does not change view-transfer policy.\n",
          "after": "# Elevation profile\n\n`ElevationProfileController` builds the ArcGIS profile input and an immutable frame-distance index from the same ordered sequence snapshot. Segment distances use the SDK's geodesic calculation in metres, in bounded batches. Identical inputs are reused; image playback does not regenerate profiles or scan the sequence.\n\n`profileIndicator.ts` renders a small SVG chart from the public `ElevationProfileLine.samples` API. Its explicit distance axis positions the dashed blue current-image line. The frame label includes its ordinal, distance, optional GPS altitude and an image-ID tooltip. Distance-axis zoom, pan and reset use the chart buttons. All elevations and stored distances are metres; long horizontal axes are labelled in kilometres.\n\nOnly confirmed viewer image events may drive the current-image line. An optimistic selection, missing frame, or mismatching route/viewer hides the line. A separate grey line and \u201cInspecting profile\u201d text show interpolated sample values under the pointer. Inspection neither changes imagery nor navigates the map. ArcGIS's sample-snapped map visualizations are disabled, leaving the existing green active-image marker authoritative.\n\nThe SDK still owns terrain queries, loading progress, profile visibility switches and statistics. Its native chart is hidden while this renderer is attached and restored during cleanup. The renderer does not use private chart internals, arbitrary SVG paths, screenshot readback or predicted frames. Sample rendering preserves missing-data gaps and bounds SVG complexity by chart width.\n\nRoute replacement and view transfer remove the old chart, watch, widget and fallback terrain source. The controller removes widgets from their creating view. The elevation profile never changes the visible map's Ground; the independent 3D-terrain setting owns optional scene terrain.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/elevation/profileIndicator.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileIndicator.ts confirmed profile tracking block 1",
          "before": "import { distanceMeters } from '../../utils/geoUtils';\nimport { elevationIndicatorStyles } from '../../styles/elevationIndicator';\n\n/** Coordinates are WGS84 degrees; optional image altitude and displayed distances are metres. */\nexport interface ElevationIndicatorImage { id: string; lat: number; lon: number; alt?: number; }\nexport interface ElevationIndicatorWidget {\n  container?: HTMLElement | string | null;\n  viewModel?: { hoveredChartPosition: number };\n}\n\n/** Synchronize the existing profile chart with the active sequence frame.\n * Reuses the chart's needle/badge DOM, including its SVG bounds and margin fallback.\n * The profile widget owns these nodes and removes them during its existing teardown.\n * This synchronous presentation step performs no requests or map/camera navigation.\n */\nexport function updateElevationIndicator(widget: ElevationIndicatorWidget | null | undefined,\n  sequenceImages: readonly ElevationIndicatorImage[] | null | undefined,\n  imageId: string | null | undefined, enabled: boolean): void {\n    if (!widget || !enabled) return;\n    if (!sequenceImages || sequenceImages.length < 2 || !imageId) return;\n\n    const activeIndex = sequenceImages.findIndex((img) => img.id === imageId);\n    if (activeIndex === -1) return;\n\n    // 1. Calculate cumulative distance along the street up to the active frame\n    let totalDist = 0;\n    let activeDist = 0;\n\n    for (let i = 0; i < sequenceImages.length - 1; i++) {\n      const segDist = distanceMeters(sequenceImages[i].lat, sequenceImages[i].lon, sequenceImages[i + 1].lat, sequenceImages[i + 1].lon);\n      if (i < activeIndex) {\n        activeDist += segDist;\n      }\n      totalDist += segDist;\n    }\n\n    if (totalDist <= 0) return;\n\n    const progress = Math.min(Math.max(activeDist / totalDist, 0), 1);\n\n    // 2. Sync the map marker via Esri ViewModel\n    if (widget.viewModel) {\n      try {\n        widget.viewModel.hoveredChartPosition = progress;\n      } catch (e) {}\n    }\n\n    // 3. Render Custom Needle & Tooltip Overlay on the Chart DOM\n    const container = widget.container as HTMLElement;\n    if (!container) return;\n\n    const chartContainer = container.querySelector(\".esri-elevation-profile__chart-container\") as HTMLElement;\n    if (!chartContainer) return;\n\n    // Ensure chart container allows absolute positioning\n    chartContainer.style.position = \"relative\";\n\n    const profilePath = chartContainer.querySelector(\"path\") as SVGPathElement;\n    const chartRect = chartContainer.getBoundingClientRect();\n\n    let targetPixelX = 0;\n    let plotHeight = chartRect.height - 25; // Exclude bottom X-axis label space\n\n    if (profilePath) {\n      const pathRect = profilePath.getBoundingClientRect();\n      targetPixelX = pathRect.left - chartRect.left + progress * pathRect.width;\n      plotHeight = pathRect.height;\n    } else {\n      // Fallback: 45px left margin for Y-axis numbers, 15px right margin\n      const leftMargin = 45;\n      const plotWidth = Math.max(chartRect.width - leftMargin - 15, 10);\n      targetPixelX = leftMargin + progress * plotWidth;\n    }\n\n    if (targetPixelX <= 0) return;\n\n    // A. CREATE OR UPDATE NEEDLE (Vertical Line)\n    let needle = chartContainer.querySelector(\"#mly-elevation-needle\") as HTMLElement;\n    if (!needle) {\n      needle = document.createElement(\"div\");\n      needle.id = \"mly-elevation-needle\";\n      Object.assign(needle.style, elevationIndicatorStyles.needle);\n      chartContainer.appendChild(needle);\n    }\n    needle.style.left = `${targetPixelX}px`;\n    needle.style.height = `${plotHeight + 8}px`;\n\n    // B. CREATE OR UPDATE BADGE (Distance & Elevation Tag)\n    let badge = chartContainer.querySelector(\"#mly-elevation-badge\") as HTMLElement;\n    if (!badge) {\n      badge = document.createElement(\"div\");\n      badge.id = \"mly-elevation-badge\";\n      Object.assign(badge.style, elevationIndicatorStyles.badge);\n      chartContainer.appendChild(badge);\n    }\n    badge.style.left = `${targetPixelX}px`;\n\n    const alt = (sequenceImages[activeIndex] as any).alt;\n    const elevText = alt ? ` \u00b7 <span style=\"color:${elevationIndicatorStyles.altitudeColor};\">${alt.toFixed(1)} m</span>` : \"\";\n\n    badge.innerHTML = `${Math.round(activeDist)} m${elevText}`;\n}\n",
          "after": "import { axisPixel, sampledElevation, sampledPath } from './profileTracking';\nimport type { FrameDistanceIndex, FramePosition, ProfileSample } from './profileTracking';\nexport type { ElevationIndicatorImage } from './profileTracking';\nexport interface ProfileLine {\n  title?: string | null;\n  visible: boolean;\n  color: { toCss(): string };\n  samples?: readonly ProfileSample[] | null;\n}\nexport interface ElevationIndicatorWidget {\n  container?: HTMLElement | string | null;\n  profiles: { toArray(): ProfileLine[] };\n  viewModel: { progress: number; hoveredChartPosition: number | null | undefined };\n}\nconst svgNS = 'http://www.w3.org/2000/svg';\n/** Own the distance axis instead of inferring it from SDK SVG/canvas internals.\n * The SDK still owns profile generation, progress UI, legend and statistics.\n * Native sampled map inspection is disabled: the existing active-image marker\n * remains the sole frame marker. Inspecting this chart never navigates the map.\n */\nexport class ProfileFrameChart {\n  private host: HTMLDivElement | null = null;\n  private native: HTMLElement | null = null;\n  private nativeDisplay = '';\n  private svg: SVGSVGElement | null = null;\n  private frameLabel: HTMLDivElement | null = null;\n  private inspectLabel: HTMLDivElement | null = null;\n  private frameLine: SVGLineElement | null = null;\n  private inspectionLine: SVGLineElement | null = null;\n  private observer: MutationObserver | null = null;\n  private resize: ResizeObserver | null = null;\n  private raf: number | null = null;\n  private disposed = false;\n  private frame: FramePosition | null = null;\n  private width = 440;\n  private start = 0;\n  private end: number;\n  private readonly height = 240;\n  private readonly left = 50;\n  private readonly top = 12;\n  private readonly bottom = 30;\n  private readonly right = 12;\n  private root: HTMLElement | null = null;\n  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex) {\n    this.end = index.total;\n    const container = widget.container;\n    this.root = typeof container === 'string' ? document.getElementById(container) : container || null;\n    if (!this.root) return;\n    const win = this.root.ownerDocument.defaultView;\n    if (!win) return;\n    this.observer = new win.MutationObserver(records => {\n      if (records.some(record => !this.host?.contains(record.target))) this.refresh();\n    });\n    this.observer.observe(this.root, { childList: true, subtree: true });\n    this.mount(); this.refresh();\n  }\n  private mount(): void {\n    if (!this.root || this.disposed) return;\n    const native = this.root.querySelector<HTMLElement>('.esri-elevation-profile__chart-container');\n    if (!native) return;\n    if (this.host?.isConnected && this.native === native) return;\n    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();\n    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';\n    const doc = native.ownerDocument, host = doc.createElement('div'); this.host = host;\n    host.className = 'mly-profile-frame-chart';\n    Object.assign(host.style, { padding: '4px 12px 0', boxSizing: 'border-box', width: '100%' });\n    const label = doc.createElement('div'); this.frameLabel = label;\n    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '32px', color: 'inherit' });\n    const controls = doc.createElement('div');\n    Object.assign(controls.style, { display: 'flex', gap: '4px', justifyContent: 'flex-end' });\n    for (const [text, title, action] of [\n      ['\u2212', 'Zoom out along the sequence', () => this.zoom(2)],\n      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],\n      ['\u2190', 'Show earlier sequence distance', () => this.pan(-0.25)],\n      ['\u2192', 'Show later sequence distance', () => this.pan(0.25)],\n      ['Full sequence', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],\n    ] as const) {\n      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title;\n      button.setAttribute('aria-label', title);\n      Object.assign(button.style, { fontSize: '10px', padding: '2px 5px', cursor: 'pointer', background: 'transparent', color: 'inherit', border: '1px solid #aaa', borderRadius: '3px' });\n      button.addEventListener('click', action); controls.appendChild(button);\n    }\n    const svg = doc.createElementNS(svgNS, 'svg'); this.svg = svg;\n    svg.setAttribute('width', '100%'); svg.setAttribute('height', String(this.height));\n    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Sequence elevation in metres. Dashed blue line marks the confirmed current image.');\n    svg.style.display = 'block'; svg.style.overflow = 'hidden';\n    svg.addEventListener('pointermove', this.inspect);\n    svg.addEventListener('pointerleave', this.clearInspection);\n    const inspect = doc.createElement('div'); this.inspectLabel = inspect;\n    Object.assign(inspect.style, { fontSize: '10px', minHeight: '26px', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    host.append(label, controls, svg, inspect); native.before(host);\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n      this.resize = new win.ResizeObserver(() => this.refresh()); this.resize.observe(host);\n    }\n  }\n  /** Frame movement only touches text and one SVG line, never re-queries profiles. */\n  setFrame(id: string | null): void {\n    this.frame = id ? this.index.frames.get(String(id)) || null : null;\n    this.updateFrame();\n  }\n  refresh = (): void => {\n    if (this.disposed || this.raf !== null || !this.root) return;\n    const win = this.root.ownerDocument.defaultView; if (!win) return;\n    this.raf = win.requestAnimationFrame(() => { this.raf = null; this.mount(); this.render(); });\n  };\n  private lines(): ProfileLine[] { return this.widget.profiles.toArray().filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || this.disposed) return;\n    const measured = this.svg.getBoundingClientRect().width;\n    if (measured <= this.left + this.right) return;\n    this.width = measured; this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);\n    const plotWidth = this.width - this.left - this.right, plotHeight = this.height - this.top - this.bottom;\n    const lines = this.lines(); let min = Infinity, max = -Infinity;\n    for (const line of lines) for (const sample of line.samples || []) {\n      if (typeof sample.elevation === 'number' && Number.isFinite(sample.elevation)) { min = Math.min(min, sample.elevation); max = Math.max(max, sample.elevation); }\n    }\n    const available = Number.isFinite(min) && Number.isFinite(max);\n    if (!available) { min = 0; max = 1; }\n    const pad = Math.max((max - min) * 0.08, 1); min -= pad; max += pad;\n    const children: SVGElement[] = [];\n    const element = <K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] => {\n      const node = this.svg!.ownerDocument.createElementNS(svgNS, tag);\n      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));\n      if (text !== undefined) node.textContent = text; children.push(node); return node;\n    };\n    for (let i = 0; i <= 4; i++) {\n      const y = this.top + i / 4 * plotHeight;\n      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });\n      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');\n      const x = this.left + i / 4 * plotWidth, distance = this.start + i / 4 * (this.end - this.start);\n      element('text', { x, y: this.height - 8, 'text-anchor': i === 4 ? 'end' : i === 0 ? 'start' : 'middle', 'font-size': 10, fill: 'currentColor' }, this.index.total >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`);\n    }\n    for (const line of lines) {\n      element('path', { d: sampledPath(line.samples || [], this.start, this.end, this.left, plotWidth, this.top, plotHeight, min, max), fill: 'none', stroke: line.color.toCss(), 'stroke-width': 2, 'stroke-linejoin': 'round' });\n    }\n    if (!available) element('text', { x: this.width / 2, y: this.height / 2, 'text-anchor': 'middle', 'font-size': 12, fill: 'currentColor' }, this.widget.viewModel.progress < 1 ? 'Sampling elevation\u2026' : 'No elevation samples available');\n    this.frameLine = element('line', { y1: this.top, y2: this.top + plotHeight, stroke: '#3498db', 'stroke-width': 1.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' });\n    this.inspectionLine = element('line', { y1: this.top, y2: this.top + plotHeight, stroke: '#888', 'stroke-width': 1, 'pointer-events': 'none', visibility: 'hidden' });\n    this.svg.replaceChildren(...children); this.clearInspection(); this.updateFrame();\n  }\n  private updateFrame(): void {\n    const frame = this.frame;\n    if (this.frameLabel) {\n      this.frameLabel.textContent = frame\n        ? `Current image \u00b7 Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} \u00b7 ${Math.round(frame.distance).toLocaleString()} m${frame.altitude !== undefined ? ` \u00b7 GPS altitude ${frame.altitude.toFixed(1)} m` : ''}`\n        : 'Waiting for a confirmed image in this profile\u2026';\n      this.frameLabel.title = frame ? `Current Mapillary image ID: ${frame.id}` : '';\n    }\n    if (this.host) { if (frame) this.host.dataset.imageId = frame.id; else delete this.host.dataset.imageId; }\n    if (!this.frameLine) return;\n    const x = frame ? axisPixel(frame.distance, this.start, this.end, this.left, this.width - this.left - this.right) : null;\n    this.frameLine.setAttribute('visibility', x === null ? 'hidden' : 'visible');\n    if (x !== null) { this.frameLine.setAttribute('x1', String(x)); this.frameLine.setAttribute('x2', String(x)); }\n    else if (frame && this.frameLabel) this.frameLabel.textContent += ' \u00b7 outside chart view';\n  }\n  private inspect = (event: PointerEvent): void => {\n    if (!this.svg || !this.inspectionLine || !this.inspectLabel) return;\n    const rect = this.svg.getBoundingClientRect(); if (!rect.width) return;\n    const x = (event.clientX - rect.left) / rect.width * this.width;\n    if (x < this.left || x > this.width - this.right) { this.clearInspection(); return; }\n    const distance = this.start + (x - this.left) / (this.width - this.left - this.right) * (this.end - this.start);\n    this.inspectionLine.setAttribute('x1', String(x)); this.inspectionLine.setAttribute('x2', String(x)); this.inspectionLine.setAttribute('visibility', 'visible');\n    this.inspectLabel.textContent = `Inspecting profile \u00b7 ${Math.round(distance).toLocaleString()} m \u00b7 ` + this.lines().map(line => {\n      const elevation = sampledElevation(line.samples || [], distance);\n      return `${line.title || 'Elevation'}: ${elevation === null ? 'no data' : elevation.toFixed(1) + ' m'}`;\n    }).join(' \u00b7 ');\n  };\n  private clearInspection = (): void => {\n    this.inspectionLine?.setAttribute('visibility', 'hidden');\n    if (this.inspectLabel) this.inspectLabel.textContent = 'Move over the chart to inspect sampled elevations.';\n  };\n  private zoom(factor: number): void {\n    const span = Math.min(this.index.total, Math.max(Math.min(10, this.index.total), (this.end - this.start) * factor));\n    const center = this.frame && this.frame.distance >= this.start && this.frame.distance <= this.end ? this.frame.distance : (this.start + this.end) / 2;\n    this.start = Math.max(0, Math.min(center - span / 2, this.index.total - span)); this.end = this.start + span; this.render();\n  }\n  private pan(factor: number): void {\n    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();\n  }\n  private restoreNative(): void { if (this.native) this.native.style.display = this.nativeDisplay; }\n  dispose(): void {\n    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect();\n    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);\n    this.raf = null; this.host?.remove(); this.restoreNative(); this.host = null; this.root = null;\n  }\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "ProfileFrameChart"
      ],
      "requiredOccurrences": [
        {
          "text": "ProfileFrameChart",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/elevation/profileTracking.ts",
      "content": "/** Metres throughout. Frame identity/order come from the exact profile input snapshot. */\nexport interface ElevationIndicatorImage { id: string; lat: number; lon: number; alt?: number; }\nexport interface ProfileSample { distance: number; elevation?: number | null; }\nexport interface FramePosition { id: string; ordinal: number; distance: number; altitude?: number; }\nexport interface FrameDistanceIndex {\n  images: readonly ElevationIndicatorImage[];\n  frames: ReadonlyMap<string, FramePosition>;\n  total: number;\n}\nexport function frameDistanceIndex(images: readonly ElevationIndicatorImage[], segmentMeters: readonly number[]): FrameDistanceIndex {\n  if (segmentMeters.length !== images.length - 1) throw new Error('Profile segment count does not match its input.');\n  const frames = new Map<string, FramePosition>(); let distance = 0;\n  images.forEach((image, i) => {\n    if (!image.id || frames.has(String(image.id)) || !Number.isFinite(image.lat) || !Number.isFinite(image.lon)) throw new Error('Invalid or duplicate profile frame.');\n    if (i) {\n      const length = segmentMeters[i - 1];\n      if (!Number.isFinite(length) || length < 0) throw new Error('Invalid profile segment distance.');\n      distance += length;\n    }\n    frames.set(String(image.id), { id: String(image.id), ordinal: i + 1, distance,\n      altitude: typeof image.alt === 'number' && Number.isFinite(image.alt) ? image.alt : undefined });\n  });\n  return { images, frames, total: distance };\n}\nexport function sameProfileInput(a: readonly ElevationIndicatorImage[], b: readonly ElevationIndicatorImage[]): boolean {\n  return a === b || a.length === b.length && a.every((p, i) => {\n    const q = b[i]; return String(p.id) === String(q.id) && p.lon === q.lon && p.lat === q.lat && Object.is(p.alt, q.alt);\n  });\n}\nexport function axisPixel(distance: number, start: number, end: number, left: number, width: number): number | null {\n  if (![distance, start, end, left, width].every(Number.isFinite) || end <= start || width <= 0 || distance < start || distance > end) return null;\n  return left + (distance - start) / (end - start) * width;\n}\n/** Interpolate chart values only. Never interpret a sampled point as an image frame. */\nexport function sampledElevation(samples: readonly ProfileSample[], distance: number): number | null {\n  let lo = 0, hi = samples.length - 1;\n  if (!Number.isFinite(distance) || hi < 0 || distance < samples[0].distance || distance > samples[hi].distance) return null;\n  while (lo < hi) { const mid = (lo + hi) >>> 1; if (samples[mid].distance < distance) lo = mid + 1; else hi = mid; }\n  const b = samples[lo], a = samples[Math.max(0, lo - 1)];\n  if (typeof b.elevation !== 'number' || !Number.isFinite(b.elevation)) return null;\n  if (b.distance === distance) return b.elevation;\n  if (typeof a.elevation !== 'number' || !Number.isFinite(a.elevation) || b.distance <= a.distance) return null;\n  return a.elevation + (distance - a.distance) / (b.distance - a.distance) * (b.elevation - a.elevation);\n}\n/** Bound SVG size by chart width. Preserve extrema and missing-data breaks. */\nexport function sampledPath(samples: readonly ProfileSample[], start: number, end: number, left: number, width: number, top: number, height: number, min: number, max: number): string {\n  const commands: string[] = []; let open = false;\n  let bucket = -1, points: { i: number; x: number; y: number }[] = [];\n  const flush = () => {\n    if (!points.length) return;\n    const first = points[0], last = points[points.length - 1];\n    const low = points.reduce((a, b) => a.y < b.y ? a : b), high = points.reduce((a, b) => a.y > b.y ? a : b);\n    for (const p of [...new Map([first, low, high, last].map(p => [p.i, p])).values()].sort((a, b) => a.i - b.i)) {\n      commands.push(`${open ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`); open = true;\n    }\n    points = [];\n  };\n  const visit = (sample: ProfileSample, i: number) => {\n    if (typeof sample.elevation !== 'number' || !Number.isFinite(sample.elevation)) { flush(); open = false; bucket = -1; return; }\n    const x = axisPixel(sample.distance, start, end, left, width);\n    if (x === null) { flush(); return; }\n    const next = Math.floor(x);\n    if (next !== bucket) { flush(); bucket = next; }\n    points.push({ i, x, y: top + height - (sample.elevation - min) / Math.max(1e-9, max - min) * height });\n  };\n  visit({ distance: start, elevation: sampledElevation(samples, start) }, -1);\n  samples.forEach((sample, i) => { if (sample.distance > start && sample.distance < end) visit(sample, i); });\n  visit({ distance: end, elevation: sampledElevation(samples, end) }, samples.length);\n  flush(); return commands.join(' ');\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'profile-frame-tracking-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-profile-frame-tracking.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited organization filter references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Confirmed profile tracking is already uninstalled. No files changed.' : 'Confirmed profile tracking is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'profile-frame-tracking', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Confirmed profile tracking ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Enable the elevation profile. Its dashed blue line follows the confirmed image; chart inspection stays separate. The chart uses metres and explicit zoom/pan buttons.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
