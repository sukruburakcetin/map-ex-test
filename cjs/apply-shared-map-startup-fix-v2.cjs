#!/usr/bin/env node
'use strict';
/** Shared map startup and legend ownership installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx startup block 1",
          "before": "  private _turboRequestCount: number = 0;\n  private _hasCheckedSharedState: boolean = false;\n  private _sharedStateRestoreComplete: boolean = false;\n",
          "after": "  private _turboRequestCount: number = 0;\n  private _viewStartupRevision = 0;\n  private _startupUrlParameters: URLSearchParams | null = null;\n  private _sharedStateRestoreComplete: boolean = false;\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 2",
          "before": "    if (!view || !this.ArcGISModules?.FeatureLayer || this.props.config.hideLegend) { this.clearMapLegendLayer(); return; }\n    this._mapSymbolLegend ??= new MapSymbolLegend(properties => new this.ArcGISModules.FeatureLayer(properties));\n",
          "after": "    if (!view || !this.ArcGISModules?.FeatureLayer || this.props.config.hideLegend) { this.clearMapLegendLayer(); return; }\n    if (view.destroyed || view.ready === false) return;\n    const targetType = this._startupUrlParameters?.get(SHARE_PARAMS.MAP_TYPE);\n    // The host may expose its default 3D view before switching to a shared 2D view.\n    if (!this._sharedStateRestoreComplete && (targetType === \"2d\" || targetType === \"3d\") && view.type !== targetType) return;\n    this._mapSymbolLegend ??= new MapSymbolLegend(properties => new this.ArcGISModules.FeatureLayer(properties));\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 3",
          "before": "    if (fullRemove) {\n      this._sequenceRequests?.dispose(); this.clearSharedNotesView(); this.clearFieldNotesGroup(); }\n",
          "after": "    if (fullRemove) {\n      ++this._viewStartupRevision;\n      this._isFlyInActive = false;\n      this._sequenceRequests?.dispose(); this.clearSharedNotesView(); this.clearFieldNotesGroup(); }\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 4",
          "before": "\n  // Helper method to handle the shared URL\n  private checkUrlForSharedState = async () => {\n    // 1. Get the query string.\n",
          "after": "\n  /** Restore a shared link only after React, the view and ArcGIS modules are ready.\n   * Coverage initializes independently so long sequence routes cannot block tiles.\n   * The originating setup revision prevents stale views from owning restoration.\n   */\n  private async restoreSharedStateWhenReady(view: __esri.MapView | __esri.SceneView, current: () => boolean) {\n    if (this._sharedStateRestoreComplete) return;\n    try {\n      await view.when();\n      if (!current() || this._sharedStateRestoreComplete) return;\n      await this.ensureArcGISModules();\n      if (!current() || this._sharedStateRestoreComplete) return;\n      await this.checkUrlForSharedState(current);\n    } catch (error) {\n      if (current() && (error as any)?.name !== \"AbortError\") console.warn(\"[MapView] Shared-link initialization failed:\", error);\n    }\n  }\n\n  // Helper method to handle the shared URL\n  private checkUrlForSharedState = async (isStartupCurrent: () => boolean = () => true) => {\n    const sharedView = this.state.jimuMapView?.view;\n    if (!sharedView?.map || sharedView.destroyed) return;\n    const sharedMap = sharedView.map;\n    const current = () => isStartupCurrent() && this.state.jimuMapView?.view === sharedView &&\n      sharedView.map === sharedMap && !sharedView.destroyed;\n    if (!current()) return;\n    // 1. Get the query string.\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 5",
          "before": "    // because the widget runs in an iframe and its own URL won't have the params.\n    const params = readSharedLinkParameters();\n\n",
          "after": "    // because the widget runs in an iframe and its own URL won't have the params.\n    const params = this._startupUrlParameters || readSharedLinkParameters();\n\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 6",
          "before": "\n    if (sharedId) {\n      // MAP VIEW TYPE CHECK AND SWITCH\n      const targetMapType = params.get(SHARE_PARAMS.MAP_TYPE); // '2d' or '3d'\n\n      if (targetMapType && this.state.jimuMapView && !this._hasAttemptedMapSwitch) {\n        const currentType = this.state.jimuMapView.view.type;\n\n        // If the link was 2D but the map opened in 3D (or vice versa)\n        if (currentType !== targetMapType) {\n          this._hasAttemptedMapSwitch = true; // Ensure we only try this once\n          try {\n            const mvManager = MapViewManager.getInstance();\n            const mapGroup = mvManager.getJimuMapViewGroup(this.state.jimuMapView.mapWidgetId);\n\n            if (mapGroup) {\n              this.log(`Map mismatch: URL wants ${targetMapType}, current is ${currentType}. Switching...`);\n\n              // Reset the check flag so it runs AGAIN after the map switches\n              this._hasCheckedSharedState = false;\n\n              // Tell the Experience Builder Map Widget to toggle its 2D/3D state\n              mapGroup.switchMap();\n\n              // Exit now. The map will switch, trigger onActiveViewChange, and come back here automatically.\n              return;\n            }\n          } catch (err) {\n            console.warn(\"Could not auto-switch map view:\", err);\n          }\n        }\n      }\n\n      this.log(\"Shared Mapillary ID found:\", sharedId);\n",
          "after": "\n    // MAP VIEW TYPE CHECK AND SWITCH\n    const targetMapType = params.get(SHARE_PARAMS.MAP_TYPE); // '2d' or '3d'\n\n    if ((targetMapType === \"2d\" || targetMapType === \"3d\") && this.state.jimuMapView && !this._hasAttemptedMapSwitch) {\n      const currentType = this.state.jimuMapView.view.type;\n\n      // If the link was 2D but the map opened in 3D (or vice versa)\n      if (currentType !== targetMapType) {\n        try {\n          const mvManager = MapViewManager.getInstance();\n          const mapGroup = mvManager.getJimuMapViewGroup(this.state.jimuMapView.mapWidgetId);\n\n          if (mapGroup) {\n            this.log(`Map mismatch: URL wants ${targetMapType}, current is ${currentType}. Switching...`);\n\n            this._hasAttemptedMapSwitch = true;\n            // Observe asynchronous SDK switch failures; the new view starts its own setup.\n            await mapGroup.switchMap();\n\n            // Exit now. The map will switch, trigger onActiveViewChange, and come back here automatically.\n            return;\n          }\n        } catch (err) {\n          if (!current()) return;\n          console.warn(\"Could not auto-switch map view:\", err);\n        }\n      }\n    }\n\n    if (sharedId) {\n      this.log(\"Shared Mapillary ID found:\", sharedId);\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 7",
          "before": "\n        if (resp.ok) {\n          const data = await resp.json();\n          const seqId = data.sequence;\n",
          "after": "\n        if (!current()) return;\n        if (resp.ok) {\n          const data = await resp.json();\n          if (!current()) return;\n          const seqId = data.sequence;\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 8",
          "before": "            await this.loadSequenceById(seqId, sharedId);\n\n            // 2. ZOOM & CENTER the ArcGIS Map (Cinematic Fly-in)\n            if (this.state.jimuMapView && this.ArcGISModules) {\n              const view = this.state.jimuMapView.view;\n              const { Point } = this.ArcGISModules;\n\n              await restoreSharedMapCamera(view, coords, bearing, mapZoom, properties => new Point(properties));\n            }\n\n            // Write correct zoom to URL now while _isFlyInActive is still true\n            // so the zoom watcher cannot interfere.\n            if (this.state.jimuMapView) {\n              const { imageId, sequenceImages } = this.state;\n              const img = sequenceImages.find((s) => s.id === imageId);\n              if (img) this.updateUrlWithCurrentImage(imageId!, img.lat, img.lon);\n            }\n",
          "after": "            await this.loadSequenceById(seqId, sharedId);\n            if (!current()) return;\n\n            // Restore only the originating view; a replacement owns its own camera.\n            if (this.ArcGISModules) {\n              const { Point } = this.ArcGISModules;\n              await restoreSharedMapCamera(sharedView, coords, bearing, mapZoom, properties => new Point(properties));\n              if (!current()) return;\n            }\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 9",
          "before": "            setTimeout(() => {\n              this._isFlyInActive = false;\n            }, 1500);\n",
          "after": "            setTimeout(() => {\n              if (current()) this._isFlyInActive = false;\n            }, 1500);\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 10",
          "before": "            //    image's compassAngle (same pattern used in _handleSelectAlternateImage).\n            setTimeout(() => restoreSharedViewerBearing(sharedId, coords, bearing, this._sharedViewerBearingHost), 1000);\n          }\n",
          "after": "            //    image's compassAngle (same pattern used in _handleSelectAlternateImage).\n            setTimeout(() => {\n              if (current()) void restoreSharedViewerBearing(sharedId, coords, bearing, this._sharedViewerBearingHost);\n            }, 1000);\n          }\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 11",
          "before": "      } catch (err) {\n        console.error(\"Failed to load shared state\", err);\n      }\n",
          "after": "      } catch (err) {\n        if (current()) {\n          this._isFlyInActive = false;\n          if ((err as any)?.name !== \"AbortError\") console.error(\"Failed to load shared state\", err);\n        }\n      }\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 12",
          "before": "     */\n    this._sharedStateRestoreComplete = true;\n  };\n",
          "after": "     */\n    if (!sharedId && current()) {\n      const latText = params.get(SHARE_PARAMS.LAT), lonText = params.get(SHARE_PARAMS.LON);\n      const zoomText = params.get(SHARE_PARAMS.ZOOM), bearingText = params.get(SHARE_PARAMS.BEARING);\n      const latitude = latText?.trim() ? Number(latText) : NaN;\n      const longitude = lonText?.trim() ? Number(lonText) : NaN;\n      const zoom = zoomText?.trim() ? Number(zoomText) : sharedView.zoom;\n      const bearing = bearingText?.trim() ? Number(bearingText) : 0;\n      if (Number.isFinite(latitude) && Math.abs(latitude) <= 90 && Number.isFinite(longitude) && Math.abs(longitude) <= 180 &&\n          Number.isFinite(zoom) && Number.isFinite(bearing)) {\n        this._isFlyInActive = true;\n        try {\n          const { Point } = this.ArcGISModules;\n          await restoreSharedMapCamera(sharedView, [longitude, latitude], bearing, zoom, properties => new Point(properties));\n        } catch (error) {\n          if (current() && (error as any)?.name !== \"AbortError\") console.warn(\"[MapView] Could not restore the shared viewport:\", error);\n        } finally {\n          if (current()) this._isFlyInActive = false;\n        }\n      }\n    }\n    if (current()) {\n      this._sharedStateRestoreComplete = true;\n      this.syncMapLegendLayer();\n      this.updateUrlWithCurrentImage(this.state.imageId ?? undefined);\n    }\n  };\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 13",
          "before": "    const requestId = ++this._turboRequestCount;\n    this.beginTurboLoading(requestId);\n    const task = this._turboLoadTask.then(async () => {\n      if (controller.signal.aborted || requestId !== this._turboRequestCount) return;\n      let loaded = false;\n      try {\n        await this.loadTurboCoverageLayer(forceUsernameFilter, requestId, controller);\n        loaded = !!this.turboCoverageLayer;\n      } catch (err) {\n        if (!controller.signal.aborted && (err as any)?.name !== \"AbortError\") {\n          console.warn(\"[Turbo] Coverage load failed\", err);\n",
          "after": "    const requestId = ++this._turboRequestCount;\n    const view = this.state.jimuMapView?.view;\n    const map = view?.map;\n    const current = () => !!view && !!map && !controller.signal.aborted &&\n      requestId === this._turboRequestCount && this.state.turboModeActive &&\n      this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;\n    const attached = () => {\n      const layer = this.turboCoverageLayer;\n      return !!layer && !layer.destroyed && map?.findLayerById(LAYER_IDS.COVERAGE_VT) === layer;\n    };\n    this.beginTurboLoading(requestId);\n    const task = this._turboLoadTask.then(async () => {\n      let loaded = false;\n      try {\n        if (!current()) return;\n        for (let attempt = 0; attempt < 2; attempt++) {\n          try {\n            await this.loadTurboCoverageLayer(forceUsernameFilter, requestId, controller);\n            loaded = current() && attached();\n            break;\n          } catch (error) {\n            const name = (error as any)?.name;\n            // A current layer-view creation can abort during startup. Retry once;\n            // detached layers and superseded views are owned by their newer request.\n            if (attempt === 0 && current() && attached() &&\n                (name === \"AbortError\" || name === \"view:no-layerview-for-layer\")) {\n              this._loadedTurboFiltersKey = \"\";\n              continue;\n            }\n            throw error;\n          }\n        }\n      } catch (err) {\n        if (current()) {\n          console.warn(\"[Turbo] Coverage load failed\", err);\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 14",
          "before": "          this.finishTurboLoading();\n          if (loaded && requestId === this._turboRequestCount) this.showTurboInteractionHelp();\n        }\n",
          "after": "          this.finishTurboLoading();\n          if (loaded && current() && attached()) this.showTurboInteractionHelp();\n        }\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 15",
          "before": "    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;\n    await this.ensureArcGISModules();\n",
          "after": "    const current = () => !controller.signal.aborted && requestId === this._turboRequestCount && this.state.jimuMapView?.view === view && view.map === map && !view.destroyed;\n    // Config and stationary callbacks also enter here before the active view is ready.\n    await view.when();\n    if (!current()) return;\n    await this.ensureArcGISModules();\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 16",
          "before": "    if (!view?.map || view.destroyed) return;\n    this._pointCloudAdaptiveDisplay?.dispose();\n",
          "after": "    if (!view?.map || view.destroyed) return;\n    const startupRevision = ++this._viewStartupRevision;\n    this._startupUrlParameters ??= readSharedLinkParameters();\n    this._isFlyInActive = false;\n    const startupMap = view.map;\n    const viewStartupCurrent = () => startupRevision === this._viewStartupRevision &&\n      this.state.jimuMapView?.view === view && view.map === startupMap && !view.destroyed;\n    this._pointCloudAdaptiveDisplay?.dispose();\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 17",
          "before": "    this.clearSharedNotesView();\n    this.clearMapLegendLayer();\n    this.clearSolarGraphics();\n",
          "after": "    this.clearSharedNotesView();\n    if (previousView?.map !== view.map) this.clearMapLegendLayer();\n    this.clearSolarGraphics();\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 18",
          "before": "        view.when(async () => {\n          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n            return;\n",
          "after": "        view.when(async () => {\n          if (!viewStartupCurrent()) {\n            return;\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 19",
          "before": "          await this.ensureArcGISModules();\n          if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;\n          await this.restoreRoutingLoginView(view);\n          if (this.state.jimuMapView !== jmv || !view?.map) return;\n          this.restoreMapGraphics();\n",
          "after": "          await this.ensureArcGISModules();\n          if (!viewStartupCurrent()) return;\n          await this.restoreRoutingLoginView(view);\n          if (!viewStartupCurrent()) return;\n          this.restoreMapGraphics();\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 20",
          "before": "          await this.enableTurboCoverageLayer();\n\n",
          "after": "          await this.enableTurboCoverageLayer();\n          if (!viewStartupCurrent()) return;\n\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 21",
          "before": "        }).catch(error => {\n          if (this.state.jimuMapView?.view === view && !view.destroyed) console.warn(\"[MapView] Resource restoration failed:\", error);\n        });\n      },\n    );\n    // Ensure shared link is checked ONLY AFTER the map view is bound\n    if (!this._hasCheckedSharedState) {\n      this._hasCheckedSharedState = true;\n      // Short delay to ensure React state has committed the map view\n      setTimeout(() => {\n        this.checkUrlForSharedState();\n      }, 100);\n    }\n\n",
          "after": "        }).catch(error => {\n          if (viewStartupCurrent() && (error as any)?.name !== \"AbortError\") console.warn(\"[MapView] Resource restoration failed:\", error);\n        });\n        // Run independently of coverage/sequence loading, after this view is committed.\n        void this.restoreSharedStateWhenReady(view, viewStartupCurrent);\n      },\n    );\n\n"
        },
        {
          "label": "src/runtime/widget.tsx startup block 22",
          "before": "  private updateUrlWithCurrentImage(imageId?: string | null, _imageLat?: number, _imageLon?: number) {\n    syncBrowserUrl(imageId, this._browserUrlStateHost);\n",
          "after": "  private updateUrlWithCurrentImage(imageId?: string | null, _imageLat?: number, _imageLon?: number) {\n    // Do not overwrite the incoming 2D/3D bookmark with the host's provisional view.\n    if (!this._sharedStateRestoreComplete) return;\n    syncBrowserUrl(imageId, this._browserUrlStateHost);\n"
        }
      ]
    },
    {
      "file": "src/features/map-graphics/MapSymbolLegend.ts",
      "blocks": [
        {
          "label": "Legend map ownership, preserving local comments and formatting",
          "wholeFile": true,
          "before": "/** Empty renderer-only layer used by the host legend; no coverage/cloud feature copies. */\nexport interface SymbolLegendLayer { destroy(): void; }\nexport interface SymbolLegendView<L> {\n  map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n}\n\n/** Owns the six map-symbol legend entries and removes the layer from its creating view.\n * Titles, labels and symbol properties stay together here. Host layers/renderers are never rewritten.\n * Point-cloud entries are deliberately absent; this owner adds no requests, watchers or timers.\n */\nexport class MapSymbolLegend<L extends SymbolLegendLayer, V extends SymbolLegendView<L>> {\n  layer: L | null = null;\n  private view: V | null = null;\n  private readonly createLayer: (properties: any) => L;\n  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }\n\n  /** Reuse the current view's legend or create its empty client-side FeatureLayer.\n   * Widget ID scopes the layer identity; missing IDs retain the existing explorer fallback.\n   * Runtime handles SDK readiness and the hideLegend configuration before calling this method.\n   */\n  sync(view: V, widgetId: string | null | undefined): void {\n    if (this.view !== view) this.clear();\n    if (this.layer) return;\n    // Empty client-side layer: legend renderer only, no coverage feature copies.\n    this.layer = this.createLayer({\n      id: `mapillary-symbol-legend-${widgetId || \"explorer\"}`, title: \"Mapillary Explorer Symbols\",\n      source: [], fields: [{ name: \"OBJECTID\", type: \"oid\" }, { name: \"symbol_role\", type: \"string\" }],\n      objectIdField: \"OBJECTID\", geometryType: \"point\", spatialReference: { wkid: 4326 },\n      popupEnabled: false, legendEnabled: true,\n      renderer: { type: \"unique-value\", field: \"symbol_role\", defaultSymbol: null,\n        uniqueValueInfos: [\n          { value: \"active\", label: \"Active Image\", symbol: { type: \"simple-marker\", color: \"#00ff00\", size: 9, outline: { color: \"white\", width: 1 } } },\n          { value: \"sequence\", label: \"Active Sequence Images\", symbol: { type: \"simple-marker\", color: \"blue\", size: 7, outline: { color: \"yellow\", width: 1 } } },\n          { value: \"hover\", label: \"Hovered Image\", symbol: { type: \"simple-marker\", color: \"brown\", size: 7, outline: { color: \"white\", width: 1 } } },\n          { value: \"first\", label: \"First Selected Image\", symbol: { type: \"simple-marker\", color: [0,0,0,0], size: 7, outline: { color: \"cyan\", width: 1.5 } } },\n          { value: \"next\", label: \"Next Frame\", symbol: { type: \"simple-marker\", color: \"yellow\", size: 7, outline: { color: \"orange\", width: 1 } } },\n          { value: \"note\", label: \"Field Note\", symbol: { type: \"simple-marker\", style: \"diamond\", color: \"#f5a623\", size: 7, outline: { color: \"white\", width: 1 } } },\n        ] },\n    });\n    this.view = view; view.map!.add(this.layer);\n  }\n\n  /** Remove the legend from the original owning view, then destroy its layer.\n   * Callers keep the existing clear order on view changes, hideLegend and widget teardown.\n   */\n  clear(): void {\n    if (this.layer) { this.view?.map?.remove(this.layer); this.layer.destroy(); }\n    this.layer = null; this.view = null;\n  }\n}\n",
          "after": "/** Empty renderer-only layer used by the host legend; no coverage/cloud feature copies. */\nexport interface SymbolLegendLayer { destroy(): void; }\nexport interface SymbolLegendView<L> {\n  map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n}\n\n/** Owns the six map-symbol legend entries and removes the layer from its creating view.\n * Titles, labels and symbol properties stay together here. Host layers/renderers are never rewritten.\n * Point-cloud entries are deliberately absent; this owner adds no requests, watchers or timers.\n */\nexport class MapSymbolLegend<L extends SymbolLegendLayer, V extends SymbolLegendView<L>> {\n  layer: L | null = null;\n  private map: NonNullable<SymbolLegendView<L>[\"map\"]> | null = null;\n  private readonly createLayer: (properties: any) => L;\n  constructor(createLayer: (properties: any) => L) { this.createLayer = createLayer; }\n\n  /** Reuse the current view's legend or create its empty client-side FeatureLayer.\n   * Widget ID scopes the layer identity; missing IDs retain the existing explorer fallback.\n   * Runtime handles SDK readiness and the hideLegend configuration before calling this method.\n   */\n  sync(view: V, widgetId: string | null | undefined): void {\n    const map = view?.map;\n    if (!map) { this.clear(); return; }\n    if (this.map !== map) this.clear();\n    if (this.layer) return;\n    // Empty client-side layer: legend renderer only, no coverage feature copies.\n    this.layer = this.createLayer({\n      id: `mapillary-symbol-legend-${widgetId || \"explorer\"}`, title: \"Mapillary Explorer Symbols\",\n      source: [], fields: [{ name: \"OBJECTID\", type: \"oid\" }, { name: \"symbol_role\", type: \"string\" }],\n      objectIdField: \"OBJECTID\", geometryType: \"point\", spatialReference: { wkid: 4326 },\n      popupEnabled: false, legendEnabled: true,\n      renderer: { type: \"unique-value\", field: \"symbol_role\", defaultSymbol: null,\n        uniqueValueInfos: [\n          { value: \"active\", label: \"Active Image\", symbol: { type: \"simple-marker\", color: \"#00ff00\", size: 9, outline: { color: \"white\", width: 1 } } },\n          { value: \"sequence\", label: \"Active Sequence Images\", symbol: { type: \"simple-marker\", color: \"blue\", size: 7, outline: { color: \"yellow\", width: 1 } } },\n          { value: \"hover\", label: \"Hovered Image\", symbol: { type: \"simple-marker\", color: \"brown\", size: 7, outline: { color: \"white\", width: 1 } } },\n          { value: \"first\", label: \"First Selected Image\", symbol: { type: \"simple-marker\", color: [0,0,0,0], size: 7, outline: { color: \"cyan\", width: 1.5 } } },\n          { value: \"next\", label: \"Next Frame\", symbol: { type: \"simple-marker\", color: \"yellow\", size: 7, outline: { color: \"orange\", width: 1 } } },\n          { value: \"note\", label: \"Field Note\", symbol: { type: \"simple-marker\", style: \"diamond\", color: \"#f5a623\", size: 7, outline: { color: \"white\", width: 1 } } },\n        ] },\n    });\n    this.map = map;\n    try { map.add(this.layer); }\n    catch (error) {\n      try { this.clear(); } catch (_) {}\n      throw error;\n    }\n  }\n\n  /** Remove the legend from the original owning view, then destroy its layer.\n   * Callers keep the existing clear order on view changes, hideLegend and widget teardown.\n   */\n  clear(): void {\n    const layer = this.layer, map = this.map;\n    this.layer = null; this.map = null;\n    if (layer) {\n      try { map?.remove(layer); }\n      finally { layer.destroy(); }\n    }\n  }\n}\n"
        }
      ]
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'shared-map-startup-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited diagnostic)');
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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-shared-map-startup-fix.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited diagnostic references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (diagnostic references differ)');
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
    console.log(uninstall ? 'Startup fix is already uninstalled. No files changed.' : 'Startup fix is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'shared-map-startup-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Shared map startup fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Refresh 2D/3D bookmarks with and without pKey and check coverage readiness.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}