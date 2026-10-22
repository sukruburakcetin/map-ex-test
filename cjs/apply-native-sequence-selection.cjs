#!/usr/bin/env node
'use strict';
/** Native sequence selection installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
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
          "label": "src/runtime/widget.tsx native selection block 1",
          "before": "import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudDisplayExpression, buildPointCloudPly, buildPointCloudLas } from \"../utils/pointCloudUtils\";\nimport { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\n",
          "after": "import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudDisplayExpression, buildPointCloudPly, buildPointCloudLas } from \"../utils/pointCloudUtils\";\nimport { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';\nimport { NativeSequenceSelection } from \"../features/coverage/NativeSequenceSelection\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 2",
          "before": "import type { RoutingEngine, RoutingAuthMode } from \"../config\";\nimport { createOSRMRoutingProvider } from \"../utils/osrmRoutingProvider\";\nimport { TURBO_LIMITS, TurboSpatialIndex, TurboIndexCache, TurboTileCache, turboTiles, visitTurboImageLayer, turboPointMatches, turboTileStyle, turboFootprintBboxes, TurboMetadataCache, detectionThumbnailBounds, coverageQualityColor } from \"../utils/turboCoverageUtils\";\nimport { MAPILLARY_IMAGE } from \"../utils/mapillary-image-base64\";\nimport type { TurboBbox, TurboFilters, TurboPoint } from \"../utils/turboCoverageUtils\";\n",
          "after": "import type { RoutingEngine, RoutingAuthMode } from \"../config\";\nimport { createOSRMRoutingProvider } from \"../utils/osrmRoutingProvider\";\nimport { TURBO_LIMITS, TurboSpatialIndex, TurboIndexCache, TurboTileCache, turboTiles, visitTurboImageLayer, turboPointMatches, turboTileStyle, turboFootprintBboxes, TurboMetadataCache, detectionThumbnailBounds } from \"../utils/turboCoverageUtils\";\nimport { MAPILLARY_IMAGE } from \"../utils/mapillary-image-base64\";\nimport type { TurboBbox, TurboFilters, TurboPoint } from \"../utils/turboCoverageUtils\";\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 3",
          "before": "  private _turboLoadTask: Promise<void> = Promise.resolve();\n  private _turboDecodeTask: Promise<void> = Promise.resolve();\n  private _turboCloseLayer: __esri.GraphicsLayer | null = null;\n  private _turboCloseView: __esri.MapView | __esri.SceneView | null = null;\n  private _turboCloseGraphics = new Map<string, __esri.Graphic>();\n  private _turboCloseWatch: __esri.WatchHandle | null = null;\n  private _turboCloseSymbols = new Map<string, any>();\n  private _turboElevationSignature = \"\";\n  private _selectionRequestId = 0;\n  private _selectionAbort: AbortController | null = null;\n",
          "after": "  private _turboLoadTask: Promise<void> = Promise.resolve();\n  private _turboDecodeTask: Promise<void> = Promise.resolve();\n  private _selectionRequestId = 0;\n  private _selectionAbort: AbortController | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 4",
          "before": "  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboCloseReady = false;\n  private _turboCloseFallback: string | null = null;\n  private _turboCloseFallbackAction: \"zoom\" | \"retry\" = \"zoom\";\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n",
          "after": "  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 5",
          "before": "  private _turboHoverOverlay: HTMLDivElement | null = null;\n  private _coverageAlignmentDiagnostic: NativeCoverageAlignmentDiagnostic | null = null;\n  private _activeSequenceOverlay: ActiveSequenceOverlay<__esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _lastHoveredTurboOid: string | number | null = null;\n",
          "after": "  private _turboHoverOverlay: HTMLDivElement | null = null;\n  private _coverageAlignmentDiagnostic: NativeCoverageAlignmentDiagnostic | null = null;\n  private readonly _nativeSequenceSelection = new NativeSequenceSelection<__esri.VectorTileLayer>();\n  private _activeSequenceOverlay: ActiveSequenceOverlay<__esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _lastHoveredTurboOid: string | number | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 6",
          "before": "    if (!jimuMapView) return;\n\n    // A clicked hybrid image can be highlighted before sequence metadata arrives.\n    const clicked = this._turboCloseGraphics.get(String(startImageId));\n    if (clicked && Number.isFinite(clicked.attributes?.turbo_lon) && Number.isFinite(clicked.attributes?.turbo_lat)) {\n      this.drawPulsingPoint(clicked.attributes.turbo_lon, clicked.attributes.turbo_lat, [0, 255, 0, 1], startImageId);\n    } else if (clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {\n      this.drawPulsingPoint(clickPoint.lon, clickPoint.lat, [0, 255, 0, 1], startImageId);\n    }\n",
          "after": "    if (!jimuMapView) return;\n\n    if (clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {\n      this.drawPulsingPoint(clickPoint.lon, clickPoint.lat, [0, 255, 0, 1], startImageId);\n    }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 7",
          "before": "        }\n        // Bound preview graphics; busy playback/panning takes priority over previews.\n        if (!this._userPaused || view.stationary === false || points.length < 2 || previewCount >= LIVE_SEQUENCE_LIMITS.previewSegments || !this.ArcGISModules?.Graphic) return;\n        ++previewCount;\n        const paths = points.map(p => { const display = this.getCoverageDisplayPosition(p.id, p.lon, p.lat); return [display.lon, display.lat]; });\n",
          "after": "        }\n        // Bound preview graphics; busy playback/panning takes priority over previews.\n        if (this.state.turboModeActive || !this._userPaused || view.stationary === false || points.length < 2 || previewCount >= LIVE_SEQUENCE_LIMITS.previewSegments || !this.ArcGISModules?.Graphic) return;\n        ++previewCount;\n        const paths = points.map(p => { const display = this.getCoverageDisplayPosition(p.id, p.lon, p.lat); return [display.lon, display.lat]; });\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 8",
          "before": "      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      const layer = this.ensureActiveSequenceLayer(view);\n      const previews = layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview);\n      layer.removeMany(previews);\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n",
          "after": "      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      // Turbo colors the original tile geometry; route geometry remains available to the minimap/profile.\n      const layer = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);\n      if (layer) layer.removeMany(layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer?.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 9",
          "before": "  }\n\n  /** At close zoom only, reuse a bounded 128-frame marker window, shifting every 32 frames. */\n  private async refreshSequenceMarkerWindow() {\n    const view = this.state.jimuMapView?.view, sequenceId = this.state.sequenceId;\n    if (!view || view.destroyed || !sequenceId || this._liveSequenceFrames.sequenceId !== sequenceId) return;\n    const window = view.zoom >= LIVE_SEQUENCE_LIMITS.markerZoom ? this._liveSequenceFrames.markerWindow(String(this.state.imageId)) : null;\n    const key = `${sequenceId}:${window?.key ?? 'line-only'}`;\n",
          "after": "  }\n\n  /** Turbo uses native tile colors at every zoom. Legacy coverage retains its bounded marker window. */\n  private async refreshSequenceMarkerWindow() {\n    const view = this.state.jimuMapView?.view, sequenceId = this.state.sequenceId;\n    if (!view || view.destroyed || !sequenceId || this._liveSequenceFrames.sequenceId !== sequenceId) return;\n    if (this.state.turboModeActive) {\n      this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = '';\n      this._activeSequenceOverlay?.dispose();\n      this.updateNativeSequenceSelection();\n      return;\n    }\n    const window = view.zoom >= LIVE_SEQUENCE_LIMITS.markerZoom ? this._liveSequenceFrames.markerWindow(String(this.state.imageId)) : null;\n    const key = `${sequenceId}:${window?.key ?? 'line-only'}`;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 10",
          "before": "    this._sequenceMarkerAbort?.abort(); const controller = new AbortController(); this._sequenceMarkerAbort = controller;\n    this._sequenceMarkerKey = key;\n    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && this._liveSequenceFrames.sequenceId === sequenceId;\n    try {\n      const overlay = this._activeSequenceOverlay;\n      if (overlay?.view === view && overlay.layer) {\n        const points = Array.from(overlay.points.values());\n        points.forEach(marker => { const close = this._turboCloseGraphics.get(String(marker.attributes?.image_id)); if (close && (close as any).__turboBaseSymbol) close.symbol = (close as any).__turboBaseSymbol; });\n        overlay.layer.removeMany(points); overlay.points.clear();\n      }\n",
          "after": "    this._sequenceMarkerAbort?.abort(); const controller = new AbortController(); this._sequenceMarkerAbort = controller;\n    this._sequenceMarkerKey = key;\n    const current = () => !controller.signal.aborted && !this.state.turboModeActive && this.state.jimuMapView?.view === view && this._liveSequenceFrames.sequenceId === sequenceId;\n    try {\n      const overlay = this._activeSequenceOverlay;\n      if (overlay?.view === view && overlay.layer) {\n        const points = Array.from(overlay.points.values());\n        overlay.layer.removeMany(points); overlay.points.clear();\n      }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 11",
          "before": "      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.ensureActiveSequenceLayer(view);\n      layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n",
          "after": "      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);\n      if (layerOwner) layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 12",
          "before": "        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n",
          "after": "        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner?.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 13",
          "before": "    } as any;\n  }\n  /** Native tiles at distance; bounded, full-fidelity interactive Graphics at close zoom. */\n  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {\n    const view = this.state.jimuMapView?.view;\n",
          "after": "    } as any;\n  }\n  /** Native coverage at every zoom; local decoding supports picking without replacing tile circles. */\n  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {\n    const view = this.state.jimuMapView?.view;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 14",
          "before": "    this.clearTurboHover();\n    this.clearTurboHoverDetails();\n    this._turboCloseReady = false;\n    if (this._turboCloseLayer) this._turboCloseLayer.visible = false;\n    this.finishTurboLoading();\n    this.setState({ coverageFrameResolving: false });\n",
          "after": "    this.clearTurboHover();\n    this.clearTurboHoverDetails();\n    this.finishTurboLoading();\n    this.setState({ coverageFrameResolving: false });\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 15",
          "before": "    const filters = this.getTurboFilters();\n    const colorByDate = !!this.state.turboColorByDate;\n    let key = JSON.stringify({ ...filters, colorByDate, points: \"hybrid\" });\n    let layer = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | undefined;\n    if (layer?.destroyed) { view.map.remove(layer); layer = undefined; }\n    const legacy = view.map.findLayerById(LAYER_IDS.TURBO_COVERAGE);\n    if (legacy) { view.map.remove(legacy); legacy.destroy(); }\n    const changedLayer = this.turboCoverageLayer !== layer;\n\n",
          "after": "    const filters = this.getTurboFilters();\n    const colorByDate = !!this.state.turboColorByDate;\n    const key = JSON.stringify({ ...filters, colorByDate, points: \"native\" });\n    let layer = view.map.findLayerById(LAYER_IDS.COVERAGE_VT) as __esri.VectorTileLayer | undefined;\n    if (layer?.destroyed) { view.map.remove(layer); layer = undefined; }\n    // Retire layers created by older hybrid builds; native circles never hand off to Graphics.\n    for (const id of [LAYER_IDS.TURBO_COVERAGE, TURBO_LIMITS.closeLayerId]) {\n      const legacy = map.findLayerById(id);\n      if (legacy) { map.remove(legacy); legacy.destroy(); }\n    }\n    const changedLayer = this.turboCoverageLayer !== layer;\n\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 16",
          "before": "    const years = colorByDate ? Array.from({ length: new Date().getFullYear() - 2007 + 1 }, (_, i) => String(2007 + i)) : [];\n    this.turboCoverageLayer = layer;\n    let hideImages = false;\n    if (view.zoom >= TURBO_LIMITS.closeZoom) {\n      if (!this._turboCloseLayer) this.updateTurboPickWarning(\"Preparing close-up points. Coverage may briefly refresh.\", undefined, true);\n      hideImages = await this.loadTurboCloseGraphics(view, filters, years, requestId, controller.signal);\n    } else {\n      this.releaseTurboCloseGraphics();\n      this._turboCloseFallback = null;\n    }\n    if (controller.signal.aborted || requestId !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return;\n    key += hideImages ? \":graphics\" : \":tiles\";\n    const style = turboTileStyle(`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`, filters, colorByDate, years, YEAR_COLOR_PALETTE, hideImages);\n    if (changedLayer || this._loadedTurboFiltersKey !== key) {\n      // loadStyle may complete after cancellation. Invalidate before awaiting so\n      // the next request cannot mistake the previous committed style for this one.\n      this._loadedTurboFiltersKey = \"\";\n      await layer.loadStyle(style as any);\n      if (!current()) return;\n    }\n    await this.waitForTurboCoverageReady(view, layer, controller.signal);\n    if (controller.signal.aborted || requestId !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return;\n    if (!hideImages) this.releaseTurboCloseGraphics();\n    else if (this._turboCloseLayer && this._turboCloseView === view) {\n      // Commit one image renderer only after native image circles have retired.\n      this._turboCloseLayer.visible = true;\n      this._turboCloseReady = true;\n      this.refreshHybridSequenceMembership();\n    }\n    this.setState({ turboYearLegend: years.map((year, i) => ({ year, color: `rgb(${YEAR_COLOR_PALETTE[i % YEAR_COLOR_PALETTE.length].slice(0, 3).join(\",\")})` })) });\n    this._loadedTurboFiltersKey = key;\n    this.enforceMapillaryLayerOrder(view);\n    this.log(\"[Turbo memory]\", { cachedTileBytes: this._turboTileCache.byteLength, cachedTiles: this._turboTileCache.size, retainedPointGraphics: this._turboCloseGraphics.size });\n  }\n\n  private releaseTurboCloseGraphics() {\n    if (this._turboHoverGraphicsLayer === this._turboCloseLayer && this._turboHoverGraphic) this.clearTurboHover();\n    this._turboCloseReady = false;\n    this._turboCloseWatch?.remove();\n    this._turboCloseWatch = null;\n    if (this._turboCloseLayer) {\n      this._turboCloseView?.map?.remove(this._turboCloseLayer);\n      this._turboCloseLayer.removeAll();\n      this._turboCloseLayer.destroy();\n    }\n    this._turboCloseGraphics.clear();\n    this._turboCloseSymbols.clear();\n    this._turboElevationSignature = \"\";\n    this._turboCloseLayer = null;\n    this._turboCloseView = null;\n    this.refreshHybridSequenceMembership();\n  }\n\n  private async loadTurboCloseGraphics(view: __esri.MapView | __esri.SceneView, filters: TurboFilters, years: string[], revision: number, signal: AbortSignal): Promise<boolean> {\n    const current = () => !signal.aborted && revision === this._turboRequestCount && this.state.turboModeActive && this.state.jimuMapView?.view === view;\n    const guard = () => { if (!current() || view.stationary === false || view.zoom < TURBO_LIMITS.closeZoom) throw new DOMException(\"Cancelled\", \"AbortError\"); };\n    if (!current()) throw new DOMException(\"Cancelled\", \"AbortError\");\n    if (this._turboCloseView && this._turboCloseView !== view) this.releaseTurboCloseGraphics();\n    if (view.stationary === false) return !!this._turboCloseLayer && this._turboCloseLayer.visible !== false;\n    this._turboCloseReady = false;\n    if (this._turboCloseLayer) this._turboCloseLayer.visible = false;\n    this.refreshHybridSequenceMembership();\n    const elevationLayers = view.type === \"3d\" ? view.map.ground.layers.toArray() : [];\n    const elevationSignature = elevationLayers.map(layer => `${layer.id}:${layer.visible}`).join(\"|\") || \"flat\";\n    const sameElevation = elevationSignature === this._turboElevationSignature;\n    const pad = TURBO_LIMITS.closeBufferPx;\n    const inside = (pixel: {x:number;y:number} | null | undefined) => !!pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= -pad && pixel.y >= -pad && pixel.x <= view.width + pad && pixel.y <= view.height + pad;\n    const footprint: {lon:number;lat:number}[] = [];\n    for (let y = 0; y <= 4; y++) for (let x = 0; x <= 4; x++) {\n      const point = view.toMap({ x: -pad + (view.width + pad * 2) * x / 4, y: -pad + (view.height + pad * 2) * y / 4 }) as __esri.Point;\n      if (point?.longitude != null && point.latitude != null && Number.isFinite(point.longitude) && Number.isFinite(point.latitude)) footprint.push({ lon: point.longitude, lat: point.latitude });\n    }\n    let completeFootprint = footprint.length === 25;\n    let extentTooWide = false;\n    if (view.type === \"3d\") {\n      // SceneView.toMap can return null for sky and off-screen padding. The\n      // view's extent is the conservative ground envelope, not a sky sample.\n      const extent = view.extent;\n      const sr = extent?.spatialReference;\n      const geographic = sr?.isWGS84 || sr?.wkid === 4326 ? extent\n        : sr?.isWebMercator || sr?.wkid === 3857 || sr?.wkid === 102100 || sr?.wkid === 102113\n          ? webMercatorUtils.webMercatorToGeographic(extent) as __esri.Extent : null;\n      if (geographic && [geographic.xmin, geographic.ymin, geographic.xmax, geographic.ymax].every(Number.isFinite) && geographic.xmax > geographic.xmin && geographic.ymax > geographic.ymin) {\n        const dx = (geographic.xmax - geographic.xmin) * pad / Math.max(1,view.width);\n        const dy = (geographic.ymax - geographic.ymin) * pad / Math.max(1,view.height);\n        extentTooWide = geographic.xmax - geographic.xmin + dx * 2 > 1 || geographic.ymax - geographic.ymin + dy * 2 > 1;\n        const west = geographic.xmin - dx, east = geographic.xmax + dx;\n        const south = Math.max(-85.05112878,geographic.ymin - dy), north = Math.min(85.05112878,geographic.ymax + dy);\n        footprint.push({lon:west,lat:south},{lon:west,lat:north},{lon:east,lat:south},{lon:east,lat:north});\n        completeFootprint = true;\n      } else if (!completeFootprint) {\n        // A SceneView without a usable WGS84/WebMercator extent can still\n        // have a complete on-screen ground grid even when padding rays fail.\n        const onScreen: {lon:number;lat:number}[] = [];\n        for (let y=0; y<=4; y++) for (let x=0; x<=4; x++) {\n          const point = view.toMap({x:Math.max(0,view.width-1)*x/4,y:Math.max(0,view.height-1)*y/4}) as __esri.Point;\n          if (point?.longitude != null && point.latitude != null && Number.isFinite(point.longitude) && Number.isFinite(point.latitude)) onScreen.push({lon:point.longitude,lat:point.latitude});\n        }\n        if (onScreen.length === 25) { footprint.push(...onScreen); completeFootprint = true; }\n      }\n    }\n    const boxes = turboFootprintBboxes(footprint);\n    const staged = new Map<string, {point:TurboPoint;geometry:__esri.Point}>();\n    try {\n      if (view.type === \"3d\" && !completeFootprint) throw new Error(\"The terrain footprint is too large or includes sky. Reduce tilt or zoom closer for exact point selection; complete tile coverage remains visible.\");\n      if (extentTooWide || !boxes.length || boxes.reduce((sum, b) => sum + b[2] - b[0], 0) > 1 || boxes.some(b => b[3] - b[1] > 1)) throw new Error(\"The visible terrain footprint is too large. Reduce tilt or zoom closer to use exact point selection.\");\n      let tileCount = 0;\n      for (const box of boxes) for (const _tile of turboTiles(box, ZOOM.TILE_FETCH)) {\n        if (++tileCount > 64) throw new Error(\"The visible terrain covers too many source tiles. Reduce tilt or zoom closer for exact point selection; tile coverage remains complete.\");\n      }\n      for (const box of boxes) await this.visitTurboPickCoverage(box, filters, signal, (point: TurboPoint) => {\n        guard();\n        if (staged.has(point.imageId)) return;\n        const coordinates = lonLatToWebMercator(point.lon, point.lat);\n        if (!coordinates) return;\n        const geometry = new this.ArcGISModules.Point(coordinates) as __esri.Point;\n        if (view.type !== \"3d\" && !inside(view.toScreen(geometry))) return;\n        if (staged.size >= TURBO_LIMITS.closeMaxGraphics) throw new Error(\"This view contains too many individual points. All source points remain visible in tile mode; zoom closer or narrow the filters for exact selection.\");\n        const retained = this._turboCloseGraphics.get(point.imageId)?.geometry as __esri.Point | undefined;\n        if (view.type === \"3d\" && sameElevation && retained?.x === geometry.x && retained?.y === geometry.y && Number.isFinite(retained.z)) geometry.z = retained.z;\n        staged.set(point.imageId, { point, geometry });\n      });\n      guard();\n      if (view.type === \"3d\" && staged.size) {\n        // An empty Ground is a flat surface at z=0. Ground.queryElevation\n        // throws when there are no elevation layers; no service is needed here.\n        if (!elevationLayers.length) staged.forEach(value => { value.geometry.z = 0.05; });\n        const entries = Array.from(staged.entries()).filter(([,value]) => !Number.isFinite(value.geometry.z));\n        for (let i = 0; i < entries.length; i += 256) {\n          guard();\n          const batch = entries.slice(i, i + 256);\n          const multipoint = new this.ArcGISModules.Multipoint({ points: batch.map(([,value]) => [value.geometry.x, value.geometry.y]), spatialReference: { wkid: 3857 } });\n          const result = await view.map.ground.queryElevation(multipoint, { signal });\n          guard();\n          const positions = (result.geometry as __esri.Multipoint).points;\n          batch.forEach(([id,value], index) => {\n            const z = positions[index]?.[2];\n            if (!Number.isFinite(z) || z === result.noDataValue) throw new Error(\"Terrain height is unavailable. Retry or switch to 2D for exact point selection.\");\n            value.geometry.z = z + 0.05;\n            if (!inside(view.toScreen(value.geometry))) staged.delete(id);\n          });\n        }\n      }\n      guard();\n      if (view.type === \"3d\") staged.forEach((value,id) => { if (!inside(view.toScreen(value.geometry))) staged.delete(id); });\n      if (!this._turboCloseLayer) {\n        this._turboCloseView = view;\n        this._turboCloseLayer = new this.ArcGISModules.GraphicsLayer({ id: TURBO_LIMITS.closeLayerId, title: \"Mapillary Interactive Points\", visible: false, elevationInfo: { mode: \"absolute-height\" }, listMode: \"hide\" });\n        view.map.add(this._turboCloseLayer!);\n        if (this._activeSequenceOverlay?.layer && this._activeSequenceOverlay?.view === view) view.map.reorder(this._activeSequenceOverlay?.layer, view.map.layers.length - 1);\n        this._turboCloseWatch = view.watch(\"stationary\", (stationary: boolean) => {\n          if (!stationary && this._turboCloseView === view) {\n            this._turboCloseReady = false;\n            this._turboAbortController?.abort();\n            this.clearTurboHoverDetails();\n            const outgoing: __esri.Graphic[] = [];\n            this._turboCloseGraphics.forEach((graphic,id) => {\n              if (!inside(view.toScreen(graphic.geometry as __esri.Point))) { outgoing.push(graphic); this._turboCloseGraphics.delete(id); }\n            });\n            this._turboCloseLayer?.removeMany(outgoing);\n            this.refreshHybridSequenceMembership();\n          }\n        });\n      }\n      const layer = this._turboCloseLayer!;\n      const outgoing: __esri.Graphic[] = [];\n      this._turboCloseGraphics.forEach((graphic,id) => { if (!staged.has(id)) { outgoing.push(graphic); this._turboCloseGraphics.delete(id); } });\n      layer.removeMany(outgoing);\n      const symbols = this._turboCloseSymbols;\n      let incoming: __esri.Graphic[] = [];\n      let deadline = performance.now() + 8;\n      for (const [id, value] of staged) {\n        guard();\n        const year = value.point.year || \"\";\n        const index = years.indexOf(year);\n        const color = this.state.qualityViewActive ? coverageQualityColor(value.point.qualityScore) : index >= 0 ? YEAR_COLOR_PALETTE[index % YEAR_COLOR_PALETTE.length] : TURBO_LIMITS.coverageColor;\n        const symbolKey = `${view.type}:${color.join(\",\")}`;\n        if (!symbols.has(symbolKey)) {\n          symbols.set(symbolKey, view.type === \"3d\" ? new this.ArcGISModules.PointSymbol3D({ symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, size: 7, material: { color }, outline: { color: \"white\", size: 1 } }] }) : new this.ArcGISModules.SimpleMarkerSymbol({ style: \"circle\", size: 7, color, outline: { color: \"white\", width: 1 } }));\n        }\n        const attributes = { oid:id, image_id:id, captured_at:value.point.capturedAt, date_category:value.point.year, turbo_close:true, foot:value.point.onFoot, turbo_lon:value.point.lon, turbo_lat:value.point.lat };\n        const existing = this._turboCloseGraphics.get(id);\n        if (existing) {\n          const previous = existing.geometry as __esri.Point;\n          if (previous.x !== value.geometry.x || previous.y !== value.geometry.y || previous.z !== value.geometry.z) existing.geometry = value.geometry;\n          if (existing.symbol !== symbols.get(symbolKey)) existing.symbol = symbols.get(symbolKey);\n          (existing as any).__turboBaseSymbol = symbols.get(symbolKey);\n          if (existing.attributes.foot !== attributes.foot || existing.attributes.captured_at !== attributes.captured_at || existing.attributes.date_category !== attributes.date_category || existing.attributes.turbo_lon !== attributes.turbo_lon || existing.attributes.turbo_lat !== attributes.turbo_lat) existing.attributes = attributes;\n        }\n        else {\n          const graphic = new this.ArcGISModules.Graphic({ geometry:value.geometry, symbol:symbols.get(symbolKey), attributes });\n          this._turboCloseGraphics.set(id, graphic);\n          incoming.push(graphic);\n        }\n        if (incoming.length >= 256 || performance.now() >= deadline) {\n          layer.addMany(incoming); incoming = [];\n          await new Promise(resolve => setTimeout(resolve, 0)); guard(); deadline = performance.now() + 8;\n        }\n      }\n      layer.addMany(incoming);\n      this.refreshHybridSequenceMembership();\n      const active = this._turboCloseGraphics.get(String(this.state.imageId));\n      if (active && this._selectionPulse?.view === view && this.currentGreenGraphic && this.currentGreenGraphic.attributes?.image_id === active.attributes.image_id) this.currentGreenGraphic.geometry = active.geometry;\n      this._turboCloseFallback = null;\n      this._turboElevationSignature = elevationSignature;\n      // Readiness is committed by loadTurboCoverageLayer after tile rendering settles.\n      this._turboCloseReady = false;\n      this.enforceMapillaryLayerOrder(view);\n      return true;\n    } catch (error) {\n      if (!current() || (error as any)?.name === \"AbortError\") throw error;\n      this.releaseTurboCloseGraphics();\n      this._turboCloseFallback = (error as Error).message;\n      this._turboCloseFallbackAction = /too many|too large/.test(this._turboCloseFallback) ? \"zoom\" : \"retry\";\n      return false;\n    }\n  }\n\n",
          "after": "    const years = colorByDate ? Array.from({ length: new Date().getFullYear() - 2007 + 1 }, (_, i) => String(2007 + i)) : [];\n    this.turboCoverageLayer = layer;\n    const style = turboTileStyle(`${TILE_URLS.COVERAGE}?access_token=${this.accessToken}`, filters, colorByDate, years, YEAR_COLOR_PALETTE);\n    if (changedLayer || this._loadedTurboFiltersKey !== key) {\n      // loadStyle may complete after cancellation. Invalidate before awaiting so\n      // the next request cannot mistake the previous committed style for this one.\n      this._loadedTurboFiltersKey = \"\";\n      this._nativeSequenceSelection.detach();\n      await layer.loadStyle(style as any);\n      if (!current()) return;\n      this._nativeSequenceSelection.bind(layer, style.layers);\n      this.updateNativeSequenceSelection();\n    }\n    await this.waitForTurboCoverageReady(view, layer, controller.signal);\n    if (controller.signal.aborted || requestId !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return;\n    this.setState({ turboYearLegend: years.map((year, i) => ({ year, color: `rgb(${YEAR_COLOR_PALETTE[i % YEAR_COLOR_PALETTE.length].slice(0, 3).join(\",\")})` })) });\n    this._loadedTurboFiltersKey = key;\n    void this.refreshSequenceMarkerWindow();\n    this.enforceMapillaryLayerOrder(view);\n    this.log(\"[Turbo memory]\", { cachedTileBytes: this._turboTileCache.byteLength, cachedTiles: this._turboTileCache.size, retainedPointGraphics: 0 });\n  }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 17",
          "before": "  private coverageSelectionContext() {\n    const view = this.state.jimuMapView?.view;\n    const closeLayer = this._turboCloseView === view && this._turboCloseLayer &&\n      view?.map?.layers.includes(this._turboCloseLayer) ? this._turboCloseLayer : null;\n    return { view: view || this, layer: closeLayer || this.turboCoverageLayer,\n      revision: this._turboRequestCount, enabled: !!view && this.state.turboModeActive,\n      individual: !!view && view.zoom >= 14, stationary: !!view && view.stationary !== false };\n",
          "after": "  private coverageSelectionContext() {\n    const view = this.state.jimuMapView?.view;\n    return { view: view || this, layer: this.turboCoverageLayer,\n      revision: this._turboRequestCount, enabled: !!view && this.state.turboModeActive,\n      individual: !!view && view.zoom >= 14, stationary: !!view && view.stationary !== false };\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 18",
          "before": "  /** Match selection visuals to the accepted tile point; API coordinates remain unchanged. */\n  private getCoverageDisplayPosition(imageId: string, lon: number, lat: number): { lon: number; lat: number; geometry?: __esri.Point } {\n    const view = this.state.jimuMapView?.view;\n    const graphic = this._turboCloseGraphics.get(String(imageId));\n    if (view && view === this._turboCloseView && view.zoom >= TURBO_LIMITS.closeZoom && this._turboCloseLayer && view.map.layers.includes(this._turboCloseLayer) && graphic?.attributes?.image_id === String(imageId)) {\n      const x = graphic.attributes.turbo_lon, y = graphic.attributes.turbo_lat;\n      if (Number.isFinite(x) && Number.isFinite(y) && graphic.geometry?.type === \"point\") return { lon: x, lat: y, geometry: graphic.geometry as __esri.Point };\n    }\n    const selected = this._coverageSelectionTargets.anchor(this.coverageSelectionContext(), String(imageId));\n    return selected ? { lon: selected.lon, lat: selected.lat, geometry: selected.geometry } : { lon, lat };\n",
          "after": "  /** Match selection visuals to the accepted tile point; API coordinates remain unchanged. */\n  private getCoverageDisplayPosition(imageId: string, lon: number, lat: number): { lon: number; lat: number; geometry?: __esri.Point } {\n    const selected = this._coverageSelectionTargets.anchor(this.coverageSelectionContext(), String(imageId));\n    return selected ? { lon: selected.lon, lat: selected.lat, geometry: selected.geometry } : { lon, lat };\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 19",
          "before": "    }\n    if (zoom < 14) return { text: \"Zoom closer for image points\", action: \"show\", label: \"Zoom to images\" };\n    if (this._turboCloseFallbackAction === \"zoom\" && this._turboCloseFallback) return { text: \"Move closer for image points\", action: \"zoom\", label: \"Move closer\" };\n    if (error) return { text: \"Coverage needs attention\", ...(this.state.turboWarningAction === \"zoom\" ? { action: \"zoom\" as const, label: \"Move closer\" } : {}) };\n    if (this.state.trafficSignsActive || this.state.objectsActive) return { text: this.state.trafficSignsActive && this.state.objectsActive ? \"Select a traffic sign, object or image point\" : this.state.trafficSignsActive ? \"Select a traffic sign or image point\" : \"Select an object or image point\" };\n    if (this.state.imageId && this.state.nearbyFramesHintVisible) return { text: \"Blue dots: nearby frames\" };\n    if (this.state.imageId) return { text: \"Select another point to explore\" };\n    if (this._turboCloseReady && zoom >= TURBO_LIMITS.closeZoom) return { text: this._turboCloseGraphics.size ? \"Image points available\" : \"No image points here\" };\n    return { text: this.state.imageId ? \"Select another point to explore\" : \"Select a visible image point\" };\n  }\n",
          "after": "    }\n    if (zoom < 14) return { text: \"Zoom closer for image points\", action: \"show\", label: \"Zoom to images\" };\n    if (error) return { text: \"Coverage needs attention\", ...(this.state.turboWarningAction === \"zoom\" ? { action: \"zoom\" as const, label: \"Move closer\" } : {}) };\n    if (this.state.trafficSignsActive || this.state.objectsActive) return { text: this.state.trafficSignsActive && this.state.objectsActive ? \"Select a traffic sign, object or image point\" : this.state.trafficSignsActive ? \"Select a traffic sign or image point\" : \"Select an object or image point\" };\n    if (!this.state.turboModeActive && this.state.imageId && this.state.nearbyFramesHintVisible) return { text: \"Blue dots: nearby frames\" };\n    if (this.state.imageId) return { text: \"Select another point to explore\" };\n    return { text: this.state.imageId ? \"Select another point to explore\" : \"Select a visible image point\" };\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 20",
          "before": "    if (this.state.turboLoading) return \"You can keep exploring while coverage loads\";\n    if ((this.state.jimuMapView?.view?.zoom ?? 0) < 14) return \"Click a coverage line to open a representative image\";\n    if (this._turboCloseReady && !this._turboCloseGraphics.size) return \"Try another area or adjust your filters\";\n    return \"Hover to preview \u00b7 Click to open\";\n  }\n",
          "after": "    if (this.state.turboLoading) return \"You can keep exploring while coverage loads\";\n    if ((this.state.jimuMapView?.view?.zoom ?? 0) < 14) return \"Click a coverage line to open a representative image\";\n    return \"Hover to preview \u00b7 Click to open\";\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 21",
          "before": "   */\n  private announceNearbyFrames(): void {\n    if (this._nearbyFramesHintSeen || !this.shouldShowCoverageBar() || this.state.coverageHelpOpen ||\n      this.state.isLoading || this.state.coverageFrameResolving || this.state.sequenceRouteLoading ||\n      this.state.turboLoading || this.state.turboUpdatingVisible || this.state.selectionError) return;\n",
          "after": "   */\n  private announceNearbyFrames(): void {\n    if (this.state.turboModeActive || this._nearbyFramesHintSeen || !this.shouldShowCoverageBar() || this.state.coverageHelpOpen ||\n      this.state.isLoading || this.state.coverageFrameResolving || this.state.sequenceRouteLoading ||\n      this.state.turboLoading || this.state.turboUpdatingVisible || this.state.selectionError) return;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 22",
          "before": "    if (this.getTurboOrganizationId() === -1) { this.updateTurboPickWarning(\"Enter a valid numeric organization ID.\"); return; }\n    if (this.getTurboOrganizationId() !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) { this.updateTurboPickWarning(\"Zoom closer to view this organization's coverage.\", \"show\", true); return; }\n    if (this._turboCloseFallback) { this.updateTurboPickWarning(this._turboCloseFallback, this._turboCloseFallbackAction); return; }\n    if (this._turboCloseLayer) { this.updateTurboPickWarning(\"Hover to preview; tap or click to open imagery.\", \"zoom\", true); return; }\n    if ((this.state.jimuMapView?.view?.zoom ?? 14) < 14) {\n      this.updateTurboPickWarning(\"Click a coverage line or overview point to open its representative image when available. Zoom closer for individual image hover and selection. Help explains selection and camera limits.\", \"zoom\", true); return;\n",
          "after": "    if (this.getTurboOrganizationId() === -1) { this.updateTurboPickWarning(\"Enter a valid numeric organization ID.\"); return; }\n    if (this.getTurboOrganizationId() !== undefined && (this.state.jimuMapView?.view?.zoom ?? 0) < 6) { this.updateTurboPickWarning(\"Zoom closer to view this organization's coverage.\", \"show\", true); return; }\n    if ((this.state.jimuMapView?.view?.zoom ?? 14) < 14) {\n      this.updateTurboPickWarning(\"Click a coverage line or overview point to open its representative image when available. Zoom closer for individual image hover and selection. Help explains selection and camera limits.\", \"zoom\", true); return;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 23",
          "before": "  private async pickTurboGraphic(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, radius: number = TURBO_LIMITS.pickRadiusPx): Promise<__esri.Graphic | null> {\n    if (!this.turboCoverageLayer || view.zoom < 14 || view.map.findLayerById(LAYER_IDS.COVERAGE_VT) !== this.turboCoverageLayer) return null;\n    if (this._turboCloseLayer && this._turboCloseView === view) {\n      const isStationary = () => view.stationary !== false;\n      if (!this._turboCloseReady || view.zoom < TURBO_LIMITS.closeZoom || !isStationary() || signal.aborted) return null;\n      // Keep a valid hovered point through transient GPU hit-test misses after selection.\n      // The actual point must still exist and the pointer must remain inside its hit radius.\n      const hovered = this._turboCloseGraphics.get(String(this._lastHoveredTurboOid));\n      if (hovered?.geometry?.type === \"point\") {\n        const pixel = view.toScreen(hovered.geometry as __esri.Point);\n        if (pixel && (pixel.x - screen.x) ** 2 + (pixel.y - screen.y) ** 2 <= radius * radius) {\n          hovered.attributes.turbo_screen_x = pixel.x; hovered.attributes.turbo_screen_y = pixel.y;\n          return hovered;\n        }\n      }\n      const revision = this._turboRequestCount;\n      const response = await view.hitTest(screen, { include: [this._turboCloseLayer] });\n      if (signal.aborted || !this._turboCloseReady || !isStationary() || revision !== this._turboRequestCount || this.state.jimuMapView?.view !== view) return null;\n      let nearest: __esri.Graphic | null = null;\n      let distance = radius * radius;\n      for (const result of response.results) {\n        if (result.type !== \"graphic\" || result.layer !== this._turboCloseLayer) continue;\n        const graphic = result.graphic;\n        if (this._turboCloseGraphics.get(String(graphic.attributes?.image_id)) !== graphic || graphic.geometry?.type !== \"point\") continue;\n        const pixel = view.toScreen(graphic.geometry as __esri.Point);\n        if (!pixel) continue;\n        const delta = (pixel.x - screen.x) ** 2 + (pixel.y - screen.y) ** 2;\n        if (delta <= distance) { nearest = graphic; distance = delta; graphic.attributes.turbo_screen_x = pixel.x; graphic.attributes.turbo_screen_y = pixel.y; }\n      }\n      return nearest;\n    }\n    if (view.zoom >= TURBO_LIMITS.closeZoom && !this._turboCloseFallback) return null;\n    const corners = [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius], [0, 0]]\n      .map(([dx, dy]) => view.toMap({ x: screen.x + dx, y: screen.y + dy }) as __esri.Point | null)\n",
          "after": "  private async pickTurboGraphic(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal, radius: number = TURBO_LIMITS.pickRadiusPx): Promise<__esri.Graphic | null> {\n    if (!this.turboCoverageLayer || view.zoom < 14 || view.map.findLayerById(LAYER_IDS.COVERAGE_VT) !== this.turboCoverageLayer) return null;\n    const corners = [[-radius, -radius], [radius, -radius], [radius, radius], [-radius, radius], [0, 0]]\n      .map(([dx, dy]) => view.toMap({ x: screen.x + dx, y: screen.y + dy }) as __esri.Point | null)\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 24",
          "before": "          geometry: this._turboHoverGraphic?.geometry, overlay: this._turboHoverOverlay,\n          sourceZoom: ZOOM.TILE_FETCH, closeZoom: TURBO_LIMITS.closeZoom,\n          hybridReady: this._turboCloseReady,\n          hybridVisible: this._turboCloseView === view && !!this._turboCloseLayer?.visible,\n          hybridFallback: !!this._turboCloseFallback };\n      },\n      cached: tile => {\n",
          "after": "          geometry: this._turboHoverGraphic?.geometry, overlay: this._turboHoverOverlay,\n          sourceZoom: ZOOM.TILE_FETCH, closeZoom: TURBO_LIMITS.closeZoom,\n          hybridReady: false, hybridVisible: false, hybridFallback: false };\n      },\n      cached: tile => {\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 25",
          "before": "    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();\n    this.setState({ coverageFrameResolving: false });\n    this.releaseTurboCloseGraphics();\n    this._turboCloseFallback = null;\n    this._turboMetadataCache.clear();\n    this._representativePickCache?.clear();\n",
          "after": "    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();\n    this.setState({ coverageFrameResolving: false });\n    this._nativeSequenceSelection.detach();\n    this._turboMetadataCache.clear();\n    this._representativePickCache?.clear();\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 26",
          "before": "      host.appendChild(overlay); this._turboHoverOverlay = overlay;\n    } else {\n      this._turboHoverGraphicsLayer = graphic.attributes?.turbo_close ? this._turboCloseLayer : null;\n      if (this._turboHoverGraphicsLayer) this._turboHoverGraphicsLayer.add(hover); else view.graphics.add(hover);\n    }\n    const started = performance.now();\n",
          "after": "      host.appendChild(overlay); this._turboHoverOverlay = overlay;\n    } else {\n      this._turboHoverGraphicsLayer = null;\n      view.graphics.add(hover);\n    }\n    const started = performance.now();\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 27",
          "before": "  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevState.isLoading !== this.state.isLoading || prevState.coverageFrameResolving !== this.state.coverageFrameResolving ||\n      prevState.sequenceRouteLoading !== this.state.sequenceRouteLoading || prevState.turboLoading !== this.state.turboLoading ||\n",
          "after": "  }\n\n  /** Selection updates touch tile filters only; frame playback within one sequence does no style work. */\n  private updateNativeSequenceSelection() {\n    if (!this.state.turboModeActive) return;\n    this._nativeSequenceSelection.select(this.state.selectedSequenceId || this.state.sequenceId || null);\n  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevState.selectedSequenceId !== this.state.selectedSequenceId || prevState.sequenceId !== this.state.sequenceId ||\n        prevState.turboModeActive !== this.state.turboModeActive) this.updateNativeSequenceSelection();\n    if (prevState.isLoading !== this.state.isLoading || prevState.coverageFrameResolving !== this.state.coverageFrameResolving ||\n      prevState.sequenceRouteLoading !== this.state.sequenceRouteLoading || prevState.turboLoading !== this.state.turboLoading ||\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 28",
          "before": "        if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;\n        if (this.state.turboModeActive) {\n          if (z < TURBO_LIMITS.closeZoom && this._turboCloseLayer) {\n            this.releaseTurboCloseGraphics();\n            void this.enableTurboCoverageLayer();\n          }\n          this.showTurboInteractionHelp();\n        }\n",
          "after": "        if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;\n        if (this.state.turboModeActive) {\n          this.showTurboInteractionHelp();\n        }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 29",
          "before": "  /**\n   * Ensure the sequence layer belongs to the current view without rebuilding its graphics.\n   * Hybrid symbol restoration stays in the runtime; layer and marker-index lifetime belong to the owner.\n   */\n  private ensureActiveSequenceLayer(view: __esri.MapView | __esri.SceneView): __esri.GraphicsLayer {\n",
          "after": "  /**\n   * Ensure the sequence layer belongs to the current view without rebuilding its graphics.\n   * Used only by legacy coverage; native Turbo selection stays in the tile style.\n   */\n  private ensureActiveSequenceLayer(view: __esri.MapView | __esri.SceneView): __esri.GraphicsLayer {\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 30",
          "before": "  }\n\n  private refreshHybridSequenceMembership() {\n    const view = this.state.jimuMapView?.view;\n    this._activeSequenceOverlay?.points.forEach(marker => {\n      const close = this._turboCloseView === view && this._turboCloseLayer?.visible !== false ? this._turboCloseGraphics.get(String(marker.attributes?.image_id)) : undefined;\n      marker.visible = !close;\n      if (close) { (close as any).__turboBaseSymbol ??= close.symbol; close.symbol = marker.symbol; }\n    });\n  }\n\n  private clearActiveSequenceLayer() {\n    this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = ''; this._liveSequenceLine = null;\n    this._turboCloseGraphics.forEach(g => { if ((g as any).__turboBaseSymbol) g.symbol = (g as any).__turboBaseSymbol; });\n    this._activeSequenceOverlay?.dispose();\n  }\n",
          "after": "  }\n\n  private clearActiveSequenceLayer() {\n    this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = ''; this._liveSequenceLine = null;\n    this._activeSequenceOverlay?.dispose();\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 31",
          "before": "  private drawPointWithoutRemoving(lon: number, lat: number, color: any = [0, 0, 255, 1], sequenceId?: string, imageId?: string, deferred?: __esri.Graphic[]) {\n    const { jimuMapView } = this.state;\n    if (!jimuMapView || !this.ArcGISModules) return;\n\n    const { Graphic } = this.ArcGISModules;\n",
          "after": "  private drawPointWithoutRemoving(lon: number, lat: number, color: any = [0, 0, 255, 1], sequenceId?: string, imageId?: string, deferred?: __esri.Graphic[]) {\n    const { jimuMapView } = this.state;\n    if (!jimuMapView || !this.ArcGISModules || this.state.turboModeActive) return;\n\n    const { Graphic } = this.ArcGISModules;\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 32",
          "before": "      if (existing) { existing.geometry = graphic.geometry; existing.symbol = graphic.symbol; }\n      else { if (deferred) deferred.push(graphic); else layer.add(graphic); this._activeSequenceOverlay!.points.set(key, graphic); }\n      const marker = existing || graphic;\n      const close = imageId ? this._turboCloseGraphics.get(String(imageId)) : undefined;\n      if (close && this._turboCloseView === jimuMapView.view && this._turboCloseLayer?.visible !== false) {\n        (close as any).__turboBaseSymbol ??= close.symbol; close.symbol = marker.symbol; marker.visible = false;\n      }\n    } else jimuMapView.view.graphics.add(graphic);\n  }\n",
          "after": "      if (existing) { existing.geometry = graphic.geometry; existing.symbol = graphic.symbol; }\n      else { if (deferred) deferred.push(graphic); else layer.add(graphic); this._activeSequenceOverlay!.points.set(key, graphic); }\n    } else jimuMapView.view.graphics.add(graphic);\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx native selection block 33",
          "before": "            <div aria-label=\"Selected sequence symbols\" style={{ ...coverageNoticeStyles.message, marginTop: 8 }}>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7 }}><span aria-hidden=\"true\" style={{ width: 18, borderTop: \"2px solid #739dff\", flexShrink: 0 }} /><span>Blue line \u00b7 Selected sequence</span></div>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7, marginTop: 3 }}><span aria-hidden=\"true\" style={{ width: 6, height: 6, margin: \"0 6px\", borderRadius: \"50%\", background: \"blue\", border: \"1px solid #e3da30\", flexShrink: 0 }} /><span>Blue dots \u00b7 Nearby frames</span></div>\n              <p style={{ margin: \"5px 0 0\" }}>More imagery may continue beyond the dots. Select coverage elsewhere to explore. Route previews follow available coverage tiles.</p>\n            </div>\n            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: \"4px 0\", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}\n",
          "after": "            <div aria-label=\"Selected sequence symbols\" style={{ ...coverageNoticeStyles.message, marginTop: 8 }}>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7 }}><span aria-hidden=\"true\" style={{ width: 18, borderTop: \"2px solid #739dff\", flexShrink: 0 }} /><span>Blue line \u00b7 Selected sequence</span></div>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7, marginTop: 3 }}><span aria-hidden=\"true\" style={{ width: 6, height: 6, margin: \"0 6px\", borderRadius: \"50%\", background: \"blue\", border: this.state.turboModeActive ? \"1px solid white\" : \"1px solid #e3da30\", flexShrink: 0 }} /><span>{this.state.turboModeActive ? \"Blue circles \u00b7 Selected sequence\" : \"Blue dots \u00b7 Nearby frames\"}</span></div>\n              <p style={{ margin: \"5px 0 0\" }}>{this.state.turboModeActive ? \"Selection recolors the original coverage circles and line. Zoom closer for individual circles; select other coverage to explore.\" : \"More imagery may continue beyond the dots. Select coverage elsewhere to explore. Route previews follow available coverage tiles.\"}</p>\n            </div>\n            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: \"4px 0\", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}\n"
        }
      ],
      "absentAfterUninstall": [
        "NativeSequenceSelection"
      ],
      "requiredOccurrences": [
        {
          "text": "NativeSequenceSelection",
          "count": 7
        }
      ]
    },
    {
      "file": "src/utils/turboCoverageUtils.ts",
      "blocks": [
        {
          "label": "src/utils/turboCoverageUtils.ts native selection block 1",
          "before": "}\n\n/** The SDK renders the original image tile layer; no spatial sampling or feature cap. */\nexport function turboTileStyle(url: string, filters: TurboFilters, colorByDate: boolean, years: string[], palette: readonly (readonly number[])[], hideImages = false) {\n  const conditions: any[] = [];\n  const travelRestricted = filters.onFoot !== undefined;\n",
          "after": "}\n\n/** Render native image circles at every zoom. The retired hide-images argument is ignored for caller compatibility. */\nexport function turboTileStyle(url: string, filters: TurboFilters, colorByDate: boolean, years: string[], palette: readonly (readonly number[])[], _legacyHideImages = false) {\n  const conditions: any[] = [];\n  const travelRestricted = filters.onFoot !== undefined;\n"
        },
        {
          "label": "src/utils/turboCoverageUtils.ts native selection block 2",
          "before": "      layers.push({ id: `turbo-sequences-${band.name}`, source: 'turbo', 'source-layer': 'sequence', type: 'line', minzoom: 6, filter,\n        paint: { 'line-color': band.color, 'line-opacity': 0.85, 'line-width': 2.5 } });\n      if (!hideImages) layers.push({ id: `turbo-images-${band.name}`, source: 'turbo', 'source-layer': 'image', type: 'circle', minzoom: 14, filter,\n        paint: { 'circle-radius': 2.5, 'circle-color': band.color, 'circle-opacity': 0.9, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } });\n    }\n",
          "after": "      layers.push({ id: `turbo-sequences-${band.name}`, source: 'turbo', 'source-layer': 'sequence', type: 'line', minzoom: 6, filter,\n        paint: { 'line-color': band.color, 'line-opacity': 0.85, 'line-width': 2.5 } });\n      layers.push({ id: `turbo-images-${band.name}`, source: 'turbo', 'source-layer': 'image', type: 'circle', minzoom: 14, filter,\n        paint: { 'circle-radius': 2.5, 'circle-color': band.color, 'circle-opacity': 0.9, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } });\n    }\n"
        },
        {
          "label": "src/utils/turboCoverageUtils.ts native selection block 3",
          "before": "      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),\n      paint: { 'line-color': '#35AF6D', 'line-opacity': 0.8, 'line-width': 2 } },\n      ...(!hideImages ? [{ id: 'turbo-images', source: 'turbo', 'source-layer': 'image', type: 'circle', minzoom: 14,\n      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),\n      paint: { 'circle-radius': 2.5, 'circle-color': colorByDate && years.length ? colors : '#35AF6D',\n        'circle-opacity': 0.9, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 },\n    }] : []),\n    ],\n  };\n",
          "after": "      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),\n      paint: { 'line-color': '#35AF6D', 'line-opacity': 0.8, 'line-width': 2 } },\n      ...([{ id: 'turbo-images', source: 'turbo', 'source-layer': 'image', type: 'circle', minzoom: 14,\n      ...(conditions.length ? { filter: ['all', ...conditions] } : {}),\n      paint: { 'circle-radius': 2.5, 'circle-color': colorByDate && years.length ? colors : '#35AF6D',\n        'circle-opacity': 0.9, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 },\n    }]),\n    ],\n  };\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md native selection block 1",
          "before": "## Active-sequence overlay owner\n\n`features/imagery/ActiveSequenceOverlay.ts` owns the active-sequence layer, original owning view and marker index. Its ensure/dispose pair keeps layer attachment, ordering and graphics release together. Runtime still owns sequence loading, batch scheduling, marker geometry and hybrid coverage symbol restoration. This boundary adds no requests, timers or playback work.\n\n## Click-ripple animation owner\n",
          "after": "## Active-sequence overlay owner\n\n`features/imagery/ActiveSequenceOverlay.ts` owns the active-sequence layer, original owning view and marker index. Its ensure/dispose pair keeps layer attachment, ordering and graphics release together. Runtime still owns sequence loading and legacy marker batch scheduling. Turbo selection now belongs to the native style owner described below. This boundary adds no requests, timers or playback work.\n\n## Click-ripple animation owner\n"
        },
        {
          "label": "docs/REFACTORING-ROADMAP.md native selection block 2",
          "before": "\nNext: extract field-note viewer registration and marker synchronization, preserving renderer attach/update/remove behavior, relevant-note selection, raw-coordinate/source-height policy and viewer reference callbacks.\n",
          "after": "\nNext: extract field-note viewer registration and marker synchronization, preserving renderer attach/update/remove behavior, relevant-note selection, raw-coordinate/source-height policy and viewer reference callbacks.\n\n## Native coverage selection; refactoring checkpoint\n\nRefactoring is paused after the field-note map resource owner. Resume the queued viewer registration work after validating this coverage change in the host.\n\n`features/coverage/NativeSequenceSelection.ts` owns selected-sequence style partitions. Turbo always renders native vector circles and sequence lines; selection colors their original geometry blue without creating sequence point Graphics. Image membership uses `sequence_id`; sequence lines use `id`. Base quality/date/travel/ownership filters apply to both partitions, and clearing selection restores the original paints and filters. Frame changes within a sequence do not update the style. Bind after each committed style load and release references when retiring a view.\n\nThe close-zoom Graphics renderer and its pick gate are removed. `TURBO_LIMITS.closeZoom` remains a legacy diagnostic value only; editing it cannot enable point replacement. Native offset correction and on-demand tile picking are preserved at all image zooms. Active-image pulse, camera cone and hover feedback remain independent. Complete route geometry remains available to elevation/minimap consumers without a second main-map route overlay in Turbo. Legacy non-Turbo route markers retain their bounded window. The coverage guide describes selected native circles rather than nearby downloaded frames.\n\nHost validation: compare circle centers, radius and outline before/after selection at zooms 14, 19, 21 and 23+; switch sequences, clear selection, apply date/quality/organization filters, and repeat in 2D/3D and during playback/profile loading. GPU appearance and native SDK rendering require the Experience Builder host.\n"
        }
      ],
      "absentAfterUninstall": [
        "NativeSequenceSelection",
        "## Native coverage selection; refactoring checkpoint"
      ],
      "requiredOccurrences": [
        {
          "text": "NativeSequenceSelection",
          "count": 1
        },
        {
          "text": "## Native coverage selection; refactoring checkpoint",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/coverage/NativeSequenceSelection.ts",
      "content": "/** Public ArcGIS vector-style boundary; no tile requests or Graphic allocation. */\nexport interface NativeSelectionLayer {\n  getStyleLayerIndex(id: string): number;\n  setStyleLayer(style: any, index?: number): void;\n  deleteStyleLayer(id: string): void;\n}\n\n/**\n * Recolor the selected sequence using mutually exclusive native style filters.\n * Image tiles identify membership with sequence_id; sequence lines use id.\n * Selected and unselected partitions share the source geometry, zoom limits,\n * radius, stroke and opacity. Only their fill/line color differs. Existing\n * quality/date/ownership filters remain authoritative, including missing scores.\n */\nexport class NativeSequenceSelection<L extends NativeSelectionLayer> {\n  private layer: L | null = null;\n  private templates: any[] = [];\n  private sequenceId: string | null | undefined;\n\n  /** Bind only after loadStyle resolves. Discard the retiring layer without restyling it. */\n  bind(layer: L, styles: readonly any[]): void {\n    this.detach();\n    this.layer = layer;\n    this.templates = styles.filter(style => style.source === 'turbo' &&\n      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'));\n  }\n\n  /** Update once per sequence change, never once per image/frame or pointer move. */\n  select(sequenceId: string | null): void {\n    if (!this.layer || this.sequenceId === sequenceId) return;\n    const layer = this.layer;\n    for (const original of this.templates) {\n      const selectedId = `${original.id}-selected`;\n      if (!sequenceId) {\n        layer.setStyleLayer(original);\n        if (layer.getStyleLayerIndex(selectedId) >= 0) layer.deleteStyleLayer(selectedId);\n        continue;\n      }\n      const property = original['source-layer'] === 'image' ? 'sequence_id' : 'id';\n      const constrain = (condition: any[]) => original.filter ? ['all', original.filter, condition] : condition;\n      layer.setStyleLayer({ ...original, filter: constrain(['!=', property, sequenceId]) });\n      const color = original.type === 'circle' ? 'circle-color' : 'line-color';\n      layer.setStyleLayer({ ...original, id: selectedId, filter: constrain(['==', property, sequenceId]),\n        paint: { ...original.paint, [color]: '#0000ff' } }, layer.getStyleLayerIndex(original.id) + 1);\n    }\n    this.sequenceId = sequenceId;\n  }\n\n  /** Release references on style reload, view transfer or teardown; host owns layer disposal. */\n  detach(): void { this.layer = null; this.templates = []; this.sequenceId = undefined; }\n}\n"
    },
    {
      "file": "tests/nativeSequenceSelection.test.cjs",
      "content": "/** Native style partitions and actual runtime entry points. Run with MAPILLARY_TYPESCRIPT pointing to typescript.js. */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction load(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}\nconst {NativeSequenceSelection}=load('features/coverage/NativeSequenceSelection'),{turboTileStyle,TURBO_LIMITS,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{nativeCoverageOffsetMeters,nativeCoverageSourceFootprint}=load('features/coverage/nativeCoverageAlignment');\nconst style=(filters={},date=false,hide=false)=>turboTileStyle('tiles/{z}/{x}/{y}',filters,date,['2024','2025'],[[255,0,0],[0,255,0]],hide);\nclass Layer{constructor(styles){this.styles=structuredClone(styles);this.calls=[]}getStyleLayerIndex(id){return this.styles.findIndex(s=>s.id===id)}setStyleLayer(s,index){this.calls.push(s.id);const old=this.getStyleLayerIndex(s.id);if(old>=0)this.styles.splice(old,1);this.styles.splice(index??(old>=0?old:this.styles.length),0,structuredClone(s))}deleteStyleLayer(id){this.styles.splice(this.getStyleLayerIndex(id),1)}}\nfunction match(f,p){if(!f)return true;const [op,key,val]=f;switch(op){case'all':return f.slice(1).every(x=>match(x,p));case'any':return f.slice(1).some(x=>match(x,p));case'has':return key in p;case'!has':return !(key in p);case'==':return p[key]===val;case'!=':return p[key]!==val;case'>=':return p[key]>=val;case'<=':return p[key]<=val;case'<':return p[key]<val;default:throw Error(op)}}\nfor(const [name,filters,date] of [['normal',{},false],['dates',{},true],['quality',{qualityActive:true},false],['quality band',{qualityActive:true,qualityBand:'fair'},false],['ownership/travel/pano/date',{organizationId:123,creatorId:456,onFoot:false,isPano:false,startTime:1,endTime:9999999999999,selectedYear:'2024'},false]]){\n test(name+': selection changes color only; each matching feature renders exactly once',()=>{\n  const base=style(filters,date).layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);owner.select('A');\n  for(const original of base.filter(s=>s['source-layer']!=='overview')){\n   const selected=layer.styles.find(s=>s.id===original.id+'-selected'),normal=layer.styles.find(s=>s.id===original.id);\n   for(const key of Object.keys(original).filter(k=>!['id','filter','paint'].includes(k)))assert.deepEqual(selected[key],original[key]);\n   const color=original.type==='circle'?'circle-color':'line-color';assert.deepEqual({...selected.paint,[color]:original.paint[color]},original.paint);assert.equal(selected.paint[color],'#0000ff');\n   for(const sequence of ['A','B',undefined])for(const score of [.8,.5,.2,undefined]){\n    const props={id:original.type==='line'?sequence:'image',sequence_id:sequence,quality_score:score,organization_id:123,creator_id:456,foot:false,is_pano:false,captured_at:Date.UTC(2024,6,1)};\n    assert.equal(Number(match(normal.filter,props))+Number(match(selected.filter,props)),Number(match(original.filter,props)));\n    if(match(selected.filter,props))assert.equal(sequence,'A');\n   }\n  }\n  owner.select('B');assert(!JSON.stringify(layer.styles).includes('\"A\"'));owner.select(null);assert.deepEqual(layer.styles,base);\n });\n}\ntest('style reload and view transfer bind current templates without retaining old layers',()=>{const a=new Layer(style().layers),b=new Layer(style({qualityActive:true}).layers),o=new NativeSequenceSelection();o.bind(a,a.styles);o.select('A');const calls=a.calls.length;o.bind(b,b.styles);o.select('A');assert.equal(a.calls.length,calls);assert(b.styles.some(s=>s.id.endsWith('-selected')));o.detach();const n=b.calls.length;o.select('B');assert.equal(b.calls.length,n)});\ntest('same sequence during playback performs no style operations',()=>{const s=style(),l=new Layer(s.layers),o=new NativeSequenceSelection();o.bind(l,s.layers);o.select('A');const n=l.calls.length;for(let i=0;i<10000;i++)o.select('A');assert.equal(l.calls.length,n)});\ntest('native circles cannot be hidden by the retired hide-images argument',()=>{for(const filters of [{},{qualityActive:true}]){assert.deepEqual(style(filters,false,true),style(filters,false,false));assert(style(filters,false,true).layers.some(s=>s['source-layer']==='image'))}});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);\nconst method=name=>cl.members.find(m=>m.name?.getText(sf)===name).getText(sf);\nconst wanted=['refreshSequenceMarkerWindow','drawPointWithoutRemoving','renderLiveSequenceLine','showCachedSequencePreview','pickTurboGraphic','loadTurboCoverageLayer','updateNativeSequenceSelection'];\nconst globals={Pbf:class{},VectorTile:class{constructor(){this.layers={sequence:{length:1,feature:()=>({properties:{id:\"A\"},extent:4096,loadGeometry:()=>[[{x:1,y:1},{x:2,y:2}]]})}}}},NativeSequenceSelection,TURBO_LIMITS,LIVE_SEQUENCE_LIMITS:{markerZoom:14},yieldSequenceWork:async()=>{},ZOOM:{TILE_FETCH:14},LAYER_IDS:{COVERAGE_VT:'coverage',TURBO_COVERAGE:'old'},TILE_URLS:{COVERAGE:'tiles'},YEAR_COLOR_PALETTE:[[0,255,0]],nativeCoverageOffsetMeters,nativeCoverageSourceFootprint,turboFootprintBboxes,turboTileStyle,lonLatToWebMercator:(lon,lat)=>({x:lon,y:lat})};\nconst Harness=new Function(...Object.keys(globals),compile('class Harness{'+wanted.map(method).join('\\n')+'};')+'return Harness;')(...Object.values(globals));\nfunction setup(zoom=24,type='2d'){\n const w=new Harness(),layer=new Layer(style().layers),view={zoom,type,destroyed:false,stationary:true,map:{findLayerById:id=>id==='coverage'?layer:null},when:async()=>{},toMap:({x,y})=>({longitude:x,latitude:y,z:123}),toScreen:p=>({x:p.x,y:p.y})};let allocations=0;\n w.state={turboModeActive:true,sequenceId:'A',selectedSequenceId:'A',imageId:'1',jimuMapView:{view}};w.props={config:{}};w.turboCoverageLayer=layer;w._selectionRequestId=1;w._turboRequestCount=1;w._liveSequenceFrames={sequenceId:'A',markerWindow(){throw Error('Native selection must not enumerate markers')}};w._nativeSequenceSelection=new NativeSequenceSelection();w._nativeSequenceSelection.bind(layer,style().layers);w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.updateMinimapTracking=()=>{};w.showTurboInteractionHelp=()=>{};w.getTurboFilters=()=>({});\n w.ArcGISModules={Graphic:class{constructor(p){allocations++;Object.assign(this,p)}},Point:class{constructor(p){Object.assign(this,p)}clone(){return {...this}}}};\n w.ensureActiveSequenceLayer=()=>{throw Error('Native coverage must not create sequence GraphicsLayer')};w.allocations=()=>allocations;\n return {w,view,layer};\n}\ntest('native marker refresh aborts old jobs, disposes legacy overlay and allocates zero point graphics',async()=>{const {w,layer}=setup();let disposed=0;const abort=new AbortController();w._sequenceMarkerAbort=abort;w._activeSequenceOverlay={dispose(){disposed++}};for(let i=0;i<100;i++)await w.refreshSequenceMarkerWindow();assert(abort.signal.aborted);assert.equal(w.allocations(),0);assert.equal(disposed,100);assert(layer.styles.some(s=>s.id==='turbo-images-selected'))});\ntest('direct point drawing cannot reintroduce sequence graphics in Turbo',()=>{const {w}=setup();w.drawPointWithoutRemoving(1,2,[0,0,255,1],'A','1');assert.equal(w.allocations(),0)});\ntest('complete profile route retains minimap geometry without adding a main-map overlay',async()=>{const {w,view}=setup();await w.renderLiveSequenceLine([{id:'1',lon:1,lat:2},{id:'2',lon:2,lat:3}],'A',1,new AbortController(),view);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2)});\nfor(const type of ['2d','3d'])for(const zoom of [19,24,26])test(`native picking keeps corrected centers at zoom ${zoom} in ${type}`,async()=>{const {w,view}=setup(zoom,type),offset=nativeCoverageOffsetMeters(14);let visits=0;w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visits++;visit({lon:10,lat:20,imageId:'1'})};const result=await w.pickTurboGraphic({x:10+offset,y:20-offset},view,new AbortController().signal);assert(visits);assert.equal(result.attributes.image_id,'1');assert.equal(result.geometry.x,10+offset);assert.equal(result.geometry.y,20-offset);if(type==='3d')assert.equal(result.geometry.z,123)});\ntest('canceled native picking cannot commit a late result',async()=>{const {w,view}=setup(),abort=new AbortController();w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visit({lon:10,lat:20,imageId:'1'});abort.abort()};assert.equal(await w.pickTurboGraphic({x:10,y:20},view,abort.signal),null)});\ntest('coverage style commit uses the latest selection after an asynchronous style load',async()=>{const {w,layer,view}=setup();let finish;const held=new Promise(r=>finish=r);layer.loadStyle=async s=>{await held;layer.styles=structuredClone(s.layers)};w.canInitializeCoverage=()=>true;w.ensureArcGISModules=async()=>{};w.getTurboOrganizationId=()=>undefined;w._turboCoverageOriginalStyle={};w.waitForTurboCoverageReady=async()=>{};w.setState=p=>Object.assign(w.state,p);w.enforceMapillaryLayerOrder=()=>{};w.log=()=>{};w._turboTileCache={byteLength:0,size:0};w.accessToken='test';const task=w.loadTurboCoverageLayer(undefined,1,new AbortController());await new Promise(r=>setImmediate(r));w.state.sequenceId=w.state.selectedSequenceId='B';finish();await task;assert.equal(w._loadedTurboFiltersKey.includes('native'),true);assert(layer.styles.some(s=>s.id.endsWith('-selected')&&JSON.stringify(s.filter).includes('\"B\"')))});\ntest('retired close renderer and hybrid pick branches are absent',()=>{assert(!cl.members.some(m=>['loadTurboCloseGraphics','releaseTurboCloseGraphics','refreshHybridSequenceMembership'].includes(m.name?.getText(sf))));assert(!method('pickTurboGraphic').includes('closeZoom'));assert(!source.includes('_turboClose'));assert(method('hydrateLiveSequence').includes('this.state.turboModeActive ||'));assert(method('componentDidUpdate').includes('this.updateNativeSequenceSelection()'))});\n\ntest('cached sequence preview supplies minimap geometry without a second main-map line',async()=>{const {w}=setup();w._turboTileCache={snapshot:()=>[['14/1/2',new ArrayBuffer(1)]]};await w.showCachedSequencePreview('A',1,new AbortController().signal);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'native-sequence-selection-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-native-sequence-selection.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited native selection references remain)');
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
    console.log(uninstall ? 'Native sequence selection is already uninstalled. No files changed.' : 'Native sequence selection is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'native-sequence-selection', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Native sequence selection ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Turbo selection now recolors native circles and lines. Close-zoom point replacement is removed; corrected picking, live image tracking and elevation are retained. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
