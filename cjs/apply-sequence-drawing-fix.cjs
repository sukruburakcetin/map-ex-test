#!/usr/bin/env node
'use strict';
/** Sequence drawing fix for the failing native-selection version in this checkout.
 * Self-contained plain-text payload; Node built-ins only. Run from the widget root.
 * Validates every target before writing, preserves BOM/CRLF and unrelated runtime edits,
 * creates byte-for-byte backups, refuses conflicts/symlinks and rolls back write failures.
 * Flags: --dry-run (no writes), --uninstall (reverses this fix only).
 * Includes regression tests, but does not execute them or run a host build.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 1",
          "before": "  private _turboHoverFrame: number | null = null;\n  private _turboHoverOverlay: HTMLDivElement | null = null;\n  private _coverageAlignmentDiagnostic: NativeCoverageAlignmentDiagnostic | null = null;\n  private readonly _nativeSequenceSelection = new NativeSequenceSelection<__esri.VectorTileLayer>();\n  private _activeSequenceOverlay: ActiveSequenceOverlay<__esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _lastHoveredTurboOid: string | number | null = null;\n  private _sequenceHoverHighlight: SequenceHoverHighlight<__esri.VectorTileLayer> | null = null;\n  private _nearbySelectedId: string | null = null;\n",
          "after": "  private _turboHoverFrame: number | null = null;\n  private _turboHoverOverlay: HTMLDivElement | null = null;\n  private _coverageAlignmentDiagnostic: NativeCoverageAlignmentDiagnostic | null = null;\n  private readonly _nativeSequenceSelection = new NativeSequenceSelection<__esri.VectorTileLayer>();\n  private _hoveredNativeSequenceId: string | null = null;\n  private _activeSequenceOverlay: ActiveSequenceOverlay<__esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _lastHoveredTurboOid: string | number | null = null;\n  private _sequenceHoverHighlight: SequenceHoverHighlight<__esri.VectorTileLayer> | null = null;\n  private _nearbySelectedId: string | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 2",
          "before": "        path.push([display.lon, display.lat]);\n        if ((i & 127) === 127 || performance.now() >= deadline) { await yieldSequenceWork(controller.signal); deadline = performance.now() + 3; }\n      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      const layer = this.ensureActiveSequenceLayer(view);\n      const previews = layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview);\n      layer.removeMany(previews);\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n      void this.refreshSequenceMarkerWindow();\n    } catch (error) { if (current()) console.warn('[Mapillary sequence] Route line unavailable:', error); }\n",
          "after": "        path.push([display.lon, display.lat]);\n        if ((i & 127) === 127 || performance.now() >= deadline) { await yieldSequenceWork(controller.signal); deadline = performance.now() + 3; }\n      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      // Turbo highlights the native tiles; route geometry is retained only for the minimap.\n      const layer = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);\n      if (layer) layer.removeMany(layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer?.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n      void this.refreshSequenceMarkerWindow();\n    } catch (error) { if (current()) console.warn('[Mapillary sequence] Route line unavailable:', error); }\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 3",
          "before": "    if (!view || view.destroyed || !sequenceId || this._liveSequenceFrames.sequenceId !== sequenceId) return;\n    if (this.state.turboModeActive) {\n      this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = '';\n      const overlay = this._activeSequenceOverlay;\n      if (overlay?.view === view && overlay.layer) {\n        overlay.layer.removeMany(Array.from(overlay.points.values())); overlay.points.clear();\n      }\n      this.updateNativeSequenceSelection();\n      return;\n    }\n    const window = view.zoom >= LIVE_SEQUENCE_LIMITS.markerZoom ? this._liveSequenceFrames.markerWindow(String(this.state.imageId)) : null;\n",
          "after": "    if (!view || view.destroyed || !sequenceId || this._liveSequenceFrames.sequenceId !== sequenceId) return;\n    if (this.state.turboModeActive) {\n      this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = '';\n      const overlay = this._activeSequenceOverlay;\n      if (overlay?.view === view) overlay.dispose();\n      this.updateNativeSequenceSelection();\n      return;\n    }\n    const window = view.zoom >= LIVE_SEQUENCE_LIMITS.markerZoom ? this._liveSequenceFrames.markerWindow(String(this.state.imageId)) : null;\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 4",
          "before": "          }\n        }\n      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.ensureActiveSequenceLayer(view);\n      layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n        symbol: { type: \"simple-line\", color: [0, 0, 255, 0.65], width: 3 },\n        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n  }\n\n",
          "after": "          }\n        }\n      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.state.turboModeActive ? null : this.ensureActiveSequenceLayer(view);\n      if (layerOwner) layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n        symbol: { type: \"simple-line\", color: [0, 0, 255, 0.65], width: 3 },\n        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner?.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n  }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 5",
          "before": "      },\n    });\n  }\n\n  private clearTurboHoverDetails() {\n    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);\n    this._coverageFrameHoverTimer = null; this._coverageFrameHoverTarget = null;\n    this._coverageFrameLookup?.clearHover();\n    this._turboHoverInfoAbort?.abort();\n",
          "after": "      },\n    });\n  }\n\n  private clearTurboHoverDetails(preserveSequenceHighlight = false) {\n    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);\n    this._coverageFrameHoverTimer = null; this._coverageFrameHoverTarget = null;\n    this._coverageFrameLookup?.clearHover();\n    this._turboHoverInfoAbort?.abort();\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 6",
          "before": "    this._currentHoveredFeatureId = null;\n    this._turboHoveredScreen = null;\n    if (this.tooltipDiv) { this.tooltipDiv.style.display = \"none\"; this.tooltipDiv.textContent = \"\"; }\n    this.clearTurboHover();\n    this.highlightSequenceOnVTL(null);\n  }\n\n  /** One pulse and one metadata request for the image actually under the pointer. */\n  private updateTurboHover(graphic: __esri.Graphic, globalX: number, globalY: number) {\n    const attrs = graphic.attributes;\n    const imageId = String(attrs?.image_id || \"\");\n    if (!imageId) { this.clearTurboHoverDetails(); return; }\n    const changed = this._currentHoveredFeatureId !== imageId;\n    if (changed) this.clearTurboHoverDetails();\n    this._currentHoveredFeatureId = imageId;\n    this._turboHoveredScreen = { x: attrs.turbo_screen_x, y: attrs.turbo_screen_y };\n    this.showTurboHover(graphic); // Visual feedback never waits for metadata or a tooltip.\n    if (!attrs.turbo_representative) this._coverageSelectionTargets.hover(\n      this.coverageSelectionContext(), imageId, graphic.geometry as __esri.Point, attrs.sequence_id);\n    this._coverageAlignmentDiagnostic?.capture(graphic, globalX, globalY);\n    this.prepareCoverageFrameHover(graphic);\n",
          "after": "    this._currentHoveredFeatureId = null;\n    this._turboHoveredScreen = null;\n    if (this.tooltipDiv) { this.tooltipDiv.style.display = \"none\"; this.tooltipDiv.textContent = \"\"; }\n    this.clearTurboHover();\n    if (!preserveSequenceHighlight) this.highlightSequenceOnVTL(null);\n  }\n\n  /** One pulse and one metadata request for the image actually under the pointer. */\n  private updateTurboHover(graphic: __esri.Graphic, globalX: number, globalY: number) {\n    const attrs = graphic.attributes;\n    const imageId = String(attrs?.image_id || \"\");\n    if (!imageId) { this.clearTurboHoverDetails(); return; }\n    const changed = this._currentHoveredFeatureId !== imageId;\n    // The next point updates membership below; do not clear/rebuild the same\n    // sequence's styles while moving between its images.\n    if (changed) this.clearTurboHoverDetails(true);\n    this._currentHoveredFeatureId = imageId;\n    this._turboHoveredScreen = { x: attrs.turbo_screen_x, y: attrs.turbo_screen_y };\n    this.showTurboHover(graphic); // Visual feedback never waits for metadata or a tooltip.\n    this.highlightSequenceOnVTL(attrs.sequence_id ? String(attrs.sequence_id) : null);\n    if (!attrs.turbo_representative) this._coverageSelectionTargets.hover(\n      this.coverageSelectionContext(), imageId, graphic.geometry as __esri.Point, attrs.sequence_id);\n    this._coverageAlignmentDiagnostic?.capture(graphic, globalX, globalY);\n    this.prepareCoverageFrameHover(graphic);\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 7",
          "before": "\n  /** Selection updates touch tile filters only; frame playback within one sequence does no style work. */\n  private updateNativeSequenceSelection() {\n    if (!this.state.turboModeActive) return;\n    this._nativeSequenceSelection.select(this.state.selectedSequenceId || this.state.sequenceId || null);\n  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevState.selectedSequenceId !== this.state.selectedSequenceId || prevState.sequenceId !== this.state.sequenceId ||\n",
          "after": "\n  /** Selection updates touch tile filters only; frame playback within one sequence does no style work. */\n  private updateNativeSequenceSelection() {\n    if (!this.state.turboModeActive) return;\n    this._nativeSequenceSelection.select(this.state.selectedSequenceId || this.state.sequenceId || null, this._hoveredNativeSequenceId);\n  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevState.selectedSequenceId !== this.state.selectedSequenceId || prevState.sequenceId !== this.state.sequenceId ||\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 8",
          "before": "    this._elevationProfile?.clear(view, true);\n\n    this._cameraCone?.dispose(view);\n\n    this._sequenceHoverHighlight?.reset(view);\n    this.clearFieldNotesGroup();\n    // Commit the NEW MapView first.\n    // Only then restore graphics and sign/object watchers.\n",
          "after": "    this._elevationProfile?.clear(view, true);\n\n    this._cameraCone?.dispose(view);\n\n    this._hoveredNativeSequenceId = null;\n    this._sequenceHoverHighlight?.reset(view);\n    this.clearFieldNotesGroup();\n    // Commit the NEW MapView first.\n    // Only then restore graphics and sign/object watchers.\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence drawing fix block 9",
          "before": "  };\n\n\n\n  /** Forward hover intent to the reusable sequence-highlight layer owner. */\n  private highlightSequenceOnVTL(sequenceId: string | null) {\n    this._sequenceHoverHighlight ??= new SequenceHoverHighlight<__esri.VectorTileLayer>();\n    this._sequenceHoverHighlight.update(sequenceId, this.state.jimuMapView?.view, this.turboCoverageLayer,\n      this.accessToken, this.ArcGISModules ? properties => new this.ArcGISModules.VectorTileLayer(properties) : undefined);\n  }\n",
          "after": "  };\n\n\n\n  /** Native coverage shares blue tile styles for hover/selection; legacy mode has its own layer. */\n  private highlightSequenceOnVTL(sequenceId: string | null) {\n    if (this.state.turboModeActive) {\n      this._hoveredNativeSequenceId = sequenceId;\n      this.updateNativeSequenceSelection();\n      return;\n    }\n    this._sequenceHoverHighlight ??= new SequenceHoverHighlight<__esri.VectorTileLayer>();\n    this._sequenceHoverHighlight.update(sequenceId, this.state.jimuMapView?.view, this.turboCoverageLayer,\n      this.accessToken, this.ArcGISModules ? properties => new this.ArcGISModules.VectorTileLayer(properties) : undefined);\n  }\n"
        }
      ]
    },
    {
      "file": "src/features/coverage/NativeSequenceSelection.ts",
      "blocks": [
        {
          "label": "src/features/coverage/NativeSequenceSelection.ts sequence drawing fix",
          "before": "/** Public SDK boundary for updating the paint of existing native tile styles. */\nexport interface NativeSelectionLayer {\n  setPaintProperties(id: string, paint: any): void;\n}\n\n/**\n * Recolor existing circles without adding style layers, filters or point Graphics.\n * Membership is evaluated per feature: images use sequence_id, lines use id.\n * A missing or different ID keeps the original color, including date expressions\n * and quality-band paints. Geometry, circle radius, stroke and opacity stay intact.\n */\nexport class NativeSequenceSelection<L extends NativeSelectionLayer> {\n  private layer: L | null = null;\n  private templates: any[] = [];\n  private sequenceId: string | null | undefined;\n\n  /** Capture unselected paints after each committed loadStyle; the host owns the layer. */\n  bind(layer: L, styles: readonly any[]): void {\n    this.detach();\n    this.layer = layer;\n    this.templates = styles.filter(style => style.source === 'turbo' &&\n      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'))\n      .map(style => ({ ...style, paint: { ...style.paint } }));\n  }\n\n  /** Change only paint, once per sequence; same-sequence playback does no SDK work. */\n  select(sequenceId: string | null): void {\n    if (!this.layer || this.sequenceId === sequenceId) return;\n    for (const original of this.templates) {\n      const image = original['source-layer'] === 'image';\n      const color = image ? 'circle-color' : 'line-color';\n      const property = image ? 'sequence_id' : 'id';\n      const paint = { ...original.paint };\n      if (sequenceId) paint[color] = ['case', ['==', ['get', property], sequenceId], '#0000ff', original.paint[color]];\n      this.layer.setPaintProperties(original.id, paint);\n    }\n    this.sequenceId = sequenceId;\n  }\n\n  /** Release references when replacing styles or views; no mutations to a retiring renderer. */\n  detach(): void { this.layer = null; this.templates = []; this.sequenceId = undefined; }\n}\n",
          "after": "/** Public SDK boundary shared by MapView and SceneView vector-tile renderers. */\nexport interface NativeSelectionLayer {\n  getStyleLayerId(index: number): string | null;\n  getStyleLayerIndex(id: string): number;\n  setStyleLayer(style: any, index?: number): void;\n  deleteStyleLayer(id: string): void;\n}\n\n/**\n * Partition native tile features into their original style and a blue style.\n * Membership is evaluated per feature: images use sequence_id, lines use id.\n * Keep base paints unchanged: changing constant colors to data-driven paints at\n * selection time can invalidate SceneView's coverage materials. Disjoint classic\n * filters avoid that transition and avoid drawing selected features twice.\n * Copies retain geometry, zoom limits, filters, radius, width, stroke and opacity.\n */\nexport class NativeSequenceSelection<L extends NativeSelectionLayer> {\n  private layer: L | null = null;\n  private templates: any[] = [];\n  private selectionKey: string | undefined;\n\n  /** Capture unselected paints after each committed loadStyle; the host owns the layer. */\n  bind(layer: L, styles: readonly any[]): void {\n    this.detach();\n    this.layer = layer;\n    this.templates = styles.filter(style => style.source === 'turbo' &&\n      (style['source-layer'] === 'image' || style['source-layer'] === 'sequence'))\n      .map(style => ({ ...style, paint: { ...style.paint } }));\n  }\n\n  /** Hover and current selection can coexist; mouseout retains the selected sequence. */\n  select(sequenceId: string | null, hoveredSequenceId: string | null = null): void {\n    const ids = Array.from(new Set([sequenceId, hoveredSequenceId].filter((id): id is string => !!id))).sort();\n    const key = JSON.stringify(ids);\n    if (!this.layer || this.selectionKey === key) return;\n    if (!ids.length && this.selectionKey === undefined) { this.selectionKey = key; return; }\n    for (const original of this.templates) {\n      const image = original['source-layer'] === 'image';\n      const color = image ? 'circle-color' : 'line-color';\n      const property = image ? 'sequence_id' : 'id';\n      const highlightId = `${original.id}-sequence-blue`;\n      if (!ids.length) {\n        if (this.layer.getStyleLayerIndex(highlightId) >= 0) this.layer.deleteStyleLayer(highlightId);\n        this.layer.setStyleLayer(original);\n        continue;\n      }\n      const filter = (membership: any[]) => original.filter ? ['all', original.filter, membership] : membership;\n      this.layer.setStyleLayer({ ...original, filter: filter(['!in', property, ...ids]) });\n      const nextIndex = this.layer.getStyleLayerIndex(original.id) + 1;\n      // ArcGIS clamps an out-of-range insertion index to the last existing layer.\n      // Omit the index to append after the final original instead of before it.\n      const index = this.layer.getStyleLayerId(nextIndex) == null ? undefined : nextIndex;\n      this.layer.setStyleLayer({ ...original, id: highlightId, filter: filter(['in', property, ...ids]),\n        paint: { ...original.paint, [color]: '#0000ff' } }, index);\n    }\n    this.selectionKey = key;\n  }\n\n  /** Release references when replacing styles or views; no mutations to a retiring renderer. */\n  detach(): void { this.layer = null; this.templates = []; this.selectionKey = undefined; }\n}\n",
          "wholeFile": true
        }
      ]
    },
    {
      "file": "src/features/coverage/SEQUENCE-HOVER.md",
      "blocks": [
        {
          "label": "src/features/coverage/SEQUENCE-HOVER.md sequence drawing fix",
          "before": "# Sequence hover highlighting\n\n`SequenceHoverHighlight.ts` owns one reusable vector-tile layer and the last hovered sequence ID. `widget.tsx` forwards hover intent and supplies current host dependencies. The line-only style is colocated with its lifecycle owner; this layer does not draw image circles or change active-sequence point membership.\n\n`update` ignores identical IDs, hides the layer on mouseout, and creates it lazily on the first nonempty hover. Later changes reuse the layer through `loadStyle`, retaining the style-property fallback for older SDKs. Detached layers are reattached at the existing coverage-relative index. The host supplies the current access token; no token is embedded in source files.\n\nTwo existing cleanup paths remain explicit: `detach` removes the layer without destroying it during widget cleanup, while `reset` uses best-effort removal/destruction and resets hover identity during view transfer. These differences are preserved deliberately in this structural extraction; changing disposal policy should be reviewed separately.\n\nThe owner adds no Graph calls, watchers, timers, playback callbacks or point graphics. Highlight tiles retain the existing source URL and zoom limits. `tests/sequenceHoverHighlight.test.cjs` covers reuse, style contents, hide/show, reattachment, the SDK fallback, cleanup and runtime forwarding. Experience Builder still needs visual checks for hover transitions and layer order in 2D and 3D.\n",
          "after": "# Sequence hover highlighting\n\nNative Turbo coverage uses `NativeSequenceSelection.ts` for both hover and the selected image's sequence. Blue styles copy the native line/circle styles and use complementary membership filters, so each feature is drawn once with its existing size, opacity, stroke, zoom limits and user filters. Nonselected paints remain unchanged. Style-layer updates rebuild SceneView's rendering resources rather than changing constant paints to data-driven paints through `setPaintProperties`.\n\nMouseout removes only the hover membership; the selected sequence stays blue. Moving between images in the same sequence does not rebuild styles. Cached and completed route geometry remains available to the minimap, but Turbo does not add route-preview or completed-route graphics to the main map. `tests/nativeSequenceSelection.test.cjs` covers these paths, filter preservation and delayed route completion.\n\nThe separate layer described below is retained for legacy coverage only.\n\n`SequenceHoverHighlight.ts` owns one reusable vector-tile layer and the last hovered sequence ID. `widget.tsx` forwards hover intent and supplies current host dependencies. The line-only style is colocated with its lifecycle owner; this layer does not draw image circles or change active-sequence point membership.\n\n`update` ignores identical IDs, hides the layer on mouseout, and creates it lazily on the first nonempty hover. Later changes reuse the layer through `loadStyle`, retaining the style-property fallback for older SDKs. Detached layers are reattached at the existing coverage-relative index. The host supplies the current access token; no token is embedded in source files.\n\nTwo existing cleanup paths remain explicit: `detach` removes the layer without destroying it during widget cleanup, while `reset` uses best-effort removal/destruction and resets hover identity during view transfer. These differences are preserved deliberately in this structural extraction; changing disposal policy should be reviewed separately.\n\nThe owner adds no Graph calls, watchers, timers, playback callbacks or point graphics. Highlight tiles retain the existing source URL and zoom limits. `tests/sequenceHoverHighlight.test.cjs` covers reuse, style contents, hide/show, reattachment, the SDK fallback, cleanup and runtime forwarding. Experience Builder still needs visual checks for hover transitions and layer order in 2D and 3D.\n",
          "wholeFile": true
        }
      ]
    },
    {
      "file": "tests/nativeSequenceSelection.test.cjs",
      "blocks": [
        {
          "label": "tests/nativeSequenceSelection.test.cjs sequence drawing fix",
          "before": "/** Native paint selection, retained overview and actual runtime entry points. Run with MAPILLARY_TYPESCRIPT pointing to typescript.js. */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction load(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}\nconst {NativeSequenceSelection}=load('features/coverage/NativeSequenceSelection'),{turboTileStyle,TURBO_LIMITS,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{nativeCoverageOffsetMeters,nativeCoverageSourceFootprint}=load('features/coverage/nativeCoverageAlignment');\nconst style=(filters={},date=false,hide=false)=>turboTileStyle('tiles/{z}/{x}/{y}',filters,date,['2024','2025'],[[255,0,0],[0,255,0]],hide);\nclass Layer{setPaintProperties(id,paint){this.calls.push(id);this.styles.find(s=>s.id===id).paint=structuredClone(paint)}constructor(styles){this.styles=structuredClone(styles);this.calls=[]}getStyleLayerIndex(id){return this.styles.findIndex(s=>s.id===id)}setStyleLayer(s,index){this.calls.push(s.id);const old=this.getStyleLayerIndex(s.id);if(old>=0)this.styles.splice(old,1);this.styles.splice(index??(old>=0?old:this.styles.length),0,structuredClone(s))}deleteStyleLayer(id){this.styles.splice(this.getStyleLayerIndex(id),1)}}\nfunction match(f,p){if(!f)return true;const [op,key,val]=f;switch(op){case'all':return f.slice(1).every(x=>match(x,p));case'any':return f.slice(1).some(x=>match(x,p));case'has':return key in p;case'!has':return !(key in p);case'==':return p[key]===val;case'!=':return p[key]!==val;case'>=':return p[key]>=val;case'<=':return p[key]<=val;case'<':return p[key]<val;default:throw Error(op)}}\nfunction color(expression,props){\n if(!Array.isArray(expression))return expression;\n const [op,...args]=expression;\n if(op==='get')return props[args[0]];\n if(op==='==')return color(args[0],props)===color(args[1],props);\n if(op==='case')return color(args[0],props)?color(args[1],props):color(args[2],props);\n if(op==='coalesce')return args.map(a=>color(a,props)).find(v=>v!=null);\n if(op==='step'){const value=color(args[0],props);let result=args[1];for(let i=2;i<args.length;i+=2)if(value>=args[i])result=args[i+1];return result}\n throw Error(op);\n}\nfor(const [name,filters,date] of [['normal',{},false],['dates',{},true],['quality',{qualityActive:true},false],['quality band',{qualityActive:true,qualityBand:'fair'},false],['ownership/travel/pano/date',{organizationId:123,creatorId:456,onFoot:false,isPano:false,startTime:1,endTime:9999999999999,selectedYear:'2024'},false]]){\n test(name+': only matching features turn blue; styles, filters and circle dimensions stay intact',()=>{\n  const base=style(filters,date).layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);owner.select('A');\n  assert.equal(layer.styles.length,base.length);\n  for(const original of base){\n   const actual=layer.styles.find(s=>s.id===original.id);if(original['source-layer']==='overview'){assert.deepEqual(actual,original);continue}\n   const key=original.type==='circle'?'circle-color':'line-color';\n   assert.deepEqual({...actual,paint:original.paint},original);\n   assert.deepEqual({...actual.paint,[key]:original.paint[key]},original.paint);\n   for(const id of ['A','B',undefined,null]){\n    const props={id,sequence_id:id,captured_at:Date.UTC(2025,6,1)};\n    assert.equal(color(actual.paint[key],props),id==='A'?'#0000ff':color(original.paint[key],props));\n   }\n  }\n  owner.select('B');for(const actual of layer.styles.filter(s=>s['source-layer']!=='overview')){const key=actual.type==='circle'?'circle-color':'line-color';assert.equal(color(actual.paint[key],{sequence_id:'B',id:'B'}),'#0000ff');assert.notEqual(color(actual.paint[key],{sequence_id:'A',id:'A'}),'#0000ff')}\n  owner.select(null);assert.deepEqual(layer.styles,base);\n });\n}\ntest('style reload and view transfer bind current templates without retaining old layers',()=>{const a=new Layer(style().layers),b=new Layer(style({qualityActive:true}).layers),o=new NativeSequenceSelection();o.bind(a,a.styles);o.select('A');const calls=a.calls.length;o.bind(b,b.styles);o.select('A');assert.equal(a.calls.length,calls);assert(b.styles.some(s=>JSON.stringify(s.paint).includes('case')));o.detach();const n=b.calls.length;o.select('B');assert.equal(b.calls.length,n)});\ntest('same sequence during playback performs no style operations',()=>{const s=style(),l=new Layer(s.layers),o=new NativeSequenceSelection();o.bind(l,s.layers);o.select('A');const n=l.calls.length;for(let i=0;i<10000;i++)o.select('A');assert.equal(l.calls.length,n)});\ntest('native circles cannot be hidden by the retired hide-images argument',()=>{for(const filters of [{},{qualityActive:true}]){assert.deepEqual(style(filters,false,true),style(filters,false,false));assert(style(filters,false,true).layers.some(s=>s['source-layer']==='image'))}});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);\nconst method=name=>cl.members.find(m=>m.name?.getText(sf)===name).getText(sf);\nconst wanted=['refreshSequenceMarkerWindow','drawPointWithoutRemoving','renderLiveSequenceLine','showCachedSequencePreview','pickTurboGraphic','loadTurboCoverageLayer','updateNativeSequenceSelection'];\nconst globals={Pbf:class{},VectorTile:class{constructor(){this.layers={sequence:{length:1,feature:()=>({properties:{id:\"A\"},extent:4096,loadGeometry:()=>[[{x:1,y:1},{x:2,y:2}]]})}}}},NativeSequenceSelection,TURBO_LIMITS,LIVE_SEQUENCE_LIMITS:{markerZoom:14},yieldSequenceWork:async()=>{},ZOOM:{TILE_FETCH:14},LAYER_IDS:{COVERAGE_VT:'coverage',TURBO_COVERAGE:'old'},TILE_URLS:{COVERAGE:'tiles'},YEAR_COLOR_PALETTE:[[0,255,0]],nativeCoverageOffsetMeters,nativeCoverageSourceFootprint,turboFootprintBboxes,turboTileStyle,lonLatToWebMercator:(lon,lat)=>({x:lon,y:lat})};\nconst Harness=new Function(...Object.keys(globals),compile('class Harness{'+wanted.map(method).join('\\n')+'};')+'return Harness;')(...Object.values(globals));\nfunction setup(zoom=24,type='2d'){\n const w=new Harness(),layer=new Layer(style().layers),view={zoom,type,destroyed:false,stationary:true,map:{findLayerById:id=>id==='coverage'?layer:null},when:async()=>{},toMap:({x,y})=>({longitude:x,latitude:y,z:123}),toScreen:p=>({x:p.x,y:p.y})};let allocations=0;\n w.state={turboModeActive:true,sequenceId:'A',selectedSequenceId:'A',imageId:'1',jimuMapView:{view}};w.props={config:{}};w.turboCoverageLayer=layer;w._selectionRequestId=1;w._turboRequestCount=1;w._liveSequenceFrames={sequenceId:'A',markerWindow(){throw Error('Native selection must not enumerate markers')}};w._nativeSequenceSelection=new NativeSequenceSelection();w._nativeSequenceSelection.bind(layer,style().layers);w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.updateMinimapTracking=()=>{};w.showTurboInteractionHelp=()=>{};w.getTurboFilters=()=>({});\n w.ArcGISModules={Graphic:class{constructor(p){allocations++;Object.assign(this,p)}},Point:class{constructor(p){Object.assign(this,p)}clone(){return {...this}}}};\n w.ensureActiveSequenceLayer=()=>{if(!w._activeSequenceOverlay?.layer){const graphics=[];w._activeSequenceOverlay={view,points:new Map(),layer:{graphics:{toArray:()=>graphics.slice()},add:g=>graphics.push(g),removeMany:items=>items.forEach(g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)})}}}return w._activeSequenceOverlay.layer};w.allocations=()=>allocations;\n return {w,view,layer};\n}\ntest('native marker refresh removes legacy points while preserving the faint overview',async()=>{const {w,view,layer}=setup();const overview={attributes:{sequence_preview:true}},point={attributes:{image_id:'old'}},graphics=[overview,point];const abort=new AbortController();w._sequenceMarkerAbort=abort;w._activeSequenceOverlay={view,points:new Map([['old',point]]),layer:{removeMany:items=>items.forEach(g=>graphics.splice(graphics.indexOf(g),1))},dispose(){throw Error('Must preserve overview')}};for(let i=0;i<100;i++)await w.refreshSequenceMarkerWindow();assert(abort.signal.aborted);assert.equal(w.allocations(),0);assert.deepEqual(graphics,[overview]);assert.equal(w._activeSequenceOverlay.points.size,0);assert.equal(color(layer.styles.find(s=>s.id==='turbo-images').paint['circle-color'],{sequence_id:'A'}),'#0000ff')});\ntest('direct point drawing cannot reintroduce sequence graphics in Turbo',()=>{const {w}=setup();w.drawPointWithoutRemoving(1,2,[0,0,255,1],'A','1');assert.equal(w.allocations(),0)});\ntest('complete profile route retains its sequence line and minimap geometry',async()=>{const {w,view}=setup();await w.renderLiveSequenceLine([{id:'1',lon:1,lat:2},{id:'2',lon:2,lat:3}],'A',1,new AbortController(),view);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2);assert.equal(w._activeSequenceOverlay.layer.graphics.toArray().length,1)});\nfor(const type of ['2d','3d'])for(const zoom of [19,24,26])test(`native picking keeps corrected centers at zoom ${zoom} in ${type}`,async()=>{const {w,view}=setup(zoom,type),offset=nativeCoverageOffsetMeters(14);let visits=0;w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visits++;visit({lon:10,lat:20,imageId:'1'})};const result=await w.pickTurboGraphic({x:10+offset,y:20-offset},view,new AbortController().signal);assert(visits);assert.equal(result.attributes.image_id,'1');assert.equal(result.geometry.x,10+offset);assert.equal(result.geometry.y,20-offset);if(type==='3d')assert.equal(result.geometry.z,123)});\ntest('canceled native picking cannot commit a late result',async()=>{const {w,view}=setup(),abort=new AbortController();w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visit({lon:10,lat:20,imageId:'1'});abort.abort()};assert.equal(await w.pickTurboGraphic({x:10,y:20},view,abort.signal),null)});\ntest('coverage style commit uses the latest selection after an asynchronous style load',async()=>{const {w,layer,view}=setup();let finish;const held=new Promise(r=>finish=r);layer.loadStyle=async s=>{await held;layer.styles=structuredClone(s.layers)};w.canInitializeCoverage=()=>true;w.ensureArcGISModules=async()=>{};w.getTurboOrganizationId=()=>undefined;w._turboCoverageOriginalStyle={};w.waitForTurboCoverageReady=async()=>{};w.setState=p=>Object.assign(w.state,p);w.enforceMapillaryLayerOrder=()=>{};w.log=()=>{};w._turboTileCache={byteLength:0,size:0};w.accessToken='test';const task=w.loadTurboCoverageLayer(undefined,1,new AbortController());await new Promise(r=>setImmediate(r));w.state.sequenceId=w.state.selectedSequenceId='B';finish();await task;assert.equal(w._loadedTurboFiltersKey.includes('native'),true);assert(layer.styles.some(s=>JSON.stringify(s.paint).includes('\"B\"')))});\ntest('retired close renderer and hybrid pick branches are absent',()=>{assert(!cl.members.some(m=>['loadTurboCloseGraphics','releaseTurboCloseGraphics','refreshHybridSequenceMembership'].includes(m.name?.getText(sf))));assert(!method('pickTurboGraphic').includes('closeZoom'));assert(!source.includes('_turboClose'));assert(method('hydrateLiveSequence').includes('this.state.turboModeActive ||'));assert(method('componentDidUpdate').includes('this.updateNativeSequenceSelection()'))});\n\ntest('cached faint sequence overview stays on the main map and minimap',async()=>{const {w}=setup();w._turboTileCache={snapshot:()=>[['14/1/2',new ArrayBuffer(1)]]};await w.showCachedSequencePreview('A',1,new AbortController().signal);assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2);assert.equal(w._activeSequenceOverlay.layer.graphics.toArray().length,1)});\n",
          "after": "/** Native filtered selection, minimap-only routes and actual runtime entry points. Run with MAPILLARY_TYPESCRIPT pointing to typescript.js. */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction load(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}\nconst {NativeSequenceSelection}=load('features/coverage/NativeSequenceSelection'),{turboTileStyle,TURBO_LIMITS,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{nativeCoverageOffsetMeters,nativeCoverageSourceFootprint}=load('features/coverage/nativeCoverageAlignment');\nconst style=(filters={},date=false,hide=false)=>turboTileStyle('tiles/{z}/{x}/{y}',filters,date,['2024','2025'],[[255,0,0],[0,255,0]],hide);\nclass Layer {\n constructor(styles){this.styles=structuredClone(styles);this.calls=[]}\n getStyleLayerId(index){return this.styles[index]?.id??null}\n getStyleLayerIndex(id){return this.styles.findIndex(s=>s.id===id)}\n setStyleLayer(style,index){\n  this.calls.push(style.id);\n  // Match the SDK's append and out-of-range-index behavior.\n  if(index!=null&&index>=this.styles.length)index=this.styles.length-1;\n  const old=this.getStyleLayerIndex(style.id);\n  if(old>=0){index=index||old;if(index===old){this.styles[old]=structuredClone(style);return}this.styles.splice(old,1)}\n  if(!index||index>=this.styles.length)this.styles.push(structuredClone(style));\n  else this.styles.splice(index,0,structuredClone(style));\n }\n deleteStyleLayer(id){this.styles.splice(this.getStyleLayerIndex(id),1)}\n}\n\nfunction match(f,p){if(!f)return true;const [op,key,val]=f;switch(op){case'all':return f.slice(1).every(x=>match(x,p));case'any':return f.slice(1).some(x=>match(x,p));case'in':return f.slice(2).includes(p[key]);case'!in':return !f.slice(2).includes(p[key]);case'has':return key in p;case'!has':return !(key in p);case'==':return p[key]===val;case'!=':return p[key]!==val;case'>=':return p[key]>=val;case'<=':return p[key]<=val;case'<':return p[key]<val;default:throw Error(op)}}\nfunction color(expression,props){\n if(!Array.isArray(expression))return expression;\n const [op,...args]=expression;\n if(op==='get')return props[args[0]];\n if(op==='==')return color(args[0],props)===color(args[1],props);\n if(op==='case')return color(args[0],props)?color(args[1],props):color(args[2],props);\n if(op==='coalesce')return args.map(a=>color(a,props)).find(v=>v!=null);\n if(op==='step'){const value=color(args[0],props);let result=args[1];for(let i=2;i<args.length;i+=2)if(value>=args[i])result=args[i+1];return result}\n throw Error(op);\n}\n// Resolve visible styles, rather than just evaluating a paint expression in isolation.\nfunction visible(styles, sourceLayer, props) {\n return styles.filter(s=>s['source-layer']===sourceLayer && match(s.filter,props));\n}\nfor(const [name,filters,date] of [['normal',{},false],['dates',{},true],['quality',{qualityActive:true},false],['quality band',{qualityActive:true,qualityBand:'fair'},false],['ownership/travel/pano/date',{organizationId:123,creatorId:456,onFoot:false,isPano:false,startTime:1,endTime:9999999999999,selectedYear:'2024'},false]]) {\n test(name+': blue styles partition native features without changing nonselected paint or symbology',()=>{\n  const base=style(filters,date).layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);owner.select('A');\n  for(const original of base) {\n   const actual=layer.styles.find(s=>s.id===original.id);\n   if(original['source-layer']==='overview'){assert.deepEqual(actual,original);continue}\n   assert.deepEqual(actual.paint,original.paint); // No constant-to-expression material changes.\n   const blue=layer.styles.find(s=>s.id===original.id+'-sequence-blue');\n   const key=original.type==='circle'?'circle-color':'line-color';\n   assert.deepEqual({...blue,id:original.id,filter:original.filter,paint:original.paint},{...original,filter:original.filter});\n   assert.deepEqual({...blue.paint,[key]:original.paint[key]},original.paint);\n   assert.equal(blue.paint[key],'#0000ff');\n   assert.equal(layer.getStyleLayerIndex(blue.id),layer.getStyleLayerIndex(original.id)+1);\n   for(const id of ['A','B',undefined,null]) for(const quality of [.1,.5,.9]) {\n    const props={id,sequence_id:id,captured_at:Date.UTC(2024,6,1),quality_score:quality,organization_id:123,organization_id_list:[123],creator_id:456,is_pano:false,foot:false};\n    const originalVisible=match(original.filter,props);\n    const partition=[actual,blue].filter(s=>match(s.filter,props));\n    assert.equal(partition.length,originalVisible?1:0,'no duplicate or newly visible features');\n    if(originalVisible)assert.equal(color(partition[0].paint[key],props),id==='A'?'#0000ff':color(original.paint[key],props));\n   }\n  }\n  owner.select('B');assert(!JSON.stringify(layer.styles).includes('\"A\"'));\n  owner.select(null);assert.deepEqual(layer.styles,base);\n });\n}\ntest('hover preserves selection; leaving the point restores only its sequence',()=>{\n const base=style().layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);\n owner.select('A','B');\n for(const source of ['sequence','image'])for(const id of ['A','B','C',undefined]){\n  const props={id,sequence_id:id};const drawn=visible(layer.styles,source,props);assert.equal(drawn.length,1);\n  const key=source==='image'?'circle-color':'line-color';assert.equal(drawn[0].paint[key],id==='A'||id==='B'?'#0000ff':'#35AF6D');\n }\n owner.select('A',null);assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#35AF6D');\n owner.select(null,'B');assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');\n owner.select(null,null);assert.deepEqual(layer.styles,base);\n});\ntest('style reload and view transfer bind current templates without retaining old layers',()=>{\n const a=new Layer(style().layers),b=new Layer(style({qualityActive:true}).layers),o=new NativeSequenceSelection();o.bind(a,a.styles);o.select('A');const calls=a.calls.length;\n o.bind(b,b.styles);o.select('A');assert.equal(a.calls.length,calls);assert(b.styles.some(s=>s.id.endsWith('-sequence-blue')));\n o.detach();const n=b.calls.length;o.select('B');assert.equal(b.calls.length,n);\n});\ntest('same sequence during playback and duplicate hover IDs perform no style operations',()=>{\n const s=style(),l=new Layer(s.layers),o=new NativeSequenceSelection();o.bind(l,s.layers);o.select('A');const n=l.calls.length;\n for(let i=0;i<10000;i++)o.select('A',i%2?'A':null);assert.equal(l.calls.length,n);\n});\ntest('native circles cannot be hidden by the retired hide-images argument',()=>{for(const filters of [{},{qualityActive:true}]){assert.deepEqual(style(filters,false,true),style(filters,false,false));assert(style(filters,false,true).layers.some(s=>s['source-layer']==='image'))}});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);\nconst method=name=>cl.members.find(m=>m.name?.getText(sf)===name).getText(sf);\nconst wanted=['refreshSequenceMarkerWindow','drawPointWithoutRemoving','renderLiveSequenceLine','showCachedSequencePreview','pickTurboGraphic','loadTurboCoverageLayer','updateNativeSequenceSelection','highlightSequenceOnVTL','clearTurboHoverDetails','updateTurboHover'];\nlet yieldSequenceWorkImpl=async()=>{};\nconst globals={Pbf:class{},VectorTile:class{constructor(){this.layers={sequence:{length:1,feature:()=>({properties:{id:\"A\"},extent:4096,loadGeometry:()=>[[{x:1,y:1},{x:2,y:2}]]})}}}},NativeSequenceSelection,TURBO_LIMITS,LIVE_SEQUENCE_LIMITS:{markerZoom:14},yieldSequenceWork:(...args)=>yieldSequenceWorkImpl(...args),ZOOM:{TILE_FETCH:14},LAYER_IDS:{COVERAGE_VT:'coverage',TURBO_COVERAGE:'old'},TILE_URLS:{COVERAGE:'tiles'},YEAR_COLOR_PALETTE:[[0,255,0]],nativeCoverageOffsetMeters,nativeCoverageSourceFootprint,turboFootprintBboxes,turboTileStyle,lonLatToWebMercator:(lon,lat)=>({x:lon,y:lat})};\nconst Harness=new Function(...Object.keys(globals),compile('class Harness{'+wanted.map(method).join('\\n')+'};')+'return Harness;')(...Object.values(globals));\nfunction setup(zoom=24,type='2d'){\n const w=new Harness(),layer=new Layer(style().layers),view={zoom,type,destroyed:false,stationary:true,map:{findLayerById:id=>id==='coverage'?layer:null},when:async()=>{},toMap:({x,y})=>({longitude:x,latitude:y,z:123}),toScreen:p=>({x:p.x,y:p.y})};let allocations=0;\n w.state={turboModeActive:true,sequenceId:'A',selectedSequenceId:'A',imageId:'1',jimuMapView:{view}};w.props={config:{}};w.turboCoverageLayer=layer;w._selectionRequestId=1;w._turboRequestCount=1;w._liveSequenceFrames={sequenceId:'A',markerWindow(){throw Error('Native selection must not enumerate markers')}};w._nativeSequenceSelection=new NativeSequenceSelection();w._nativeSequenceSelection.bind(layer,style().layers);w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.updateMinimapTracking=()=>{};w.showTurboInteractionHelp=()=>{};w.getTurboFilters=()=>({});\n w.ArcGISModules={Graphic:class{constructor(p){allocations++;Object.assign(this,p)}},Point:class{constructor(p){Object.assign(this,p)}clone(){return {...this}}}};\n w.ensureActiveSequenceLayer=()=>{if(!w._activeSequenceOverlay?.layer){const graphics=[];w._activeSequenceOverlay={view,points:new Map(),layer:{graphics:{toArray:()=>graphics.slice()},add:g=>graphics.push(g),removeMany:items=>items.forEach(g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)})}}}return w._activeSequenceOverlay.layer};w.allocations=()=>allocations;\n return {w,view,layer};\n}\ntest('native marker refresh disposes all legacy route graphics without losing minimap geometry',async()=>{\n const {w,view,layer}=setup(),abort=new AbortController();let disposed=0;const geometry={paths:[[[1,2],[3,4]]]};\n w._liveSequenceLine={sequenceId:'A',geometry};w._sequenceMarkerAbort=abort;\n w._activeSequenceOverlay={view,dispose(){disposed++}};\n await w.refreshSequenceMarkerWindow();assert(abort.signal.aborted);assert.equal(disposed,1);assert.equal(w.allocations(),0);\n assert.equal(w._liveSequenceLine.geometry,geometry);assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#0000ff');\n});\ntest('runtime hover uses native blue styles without creating a separate green layer',()=>{\n const {w,layer}=setup();w.highlightSequenceOnVTL('B');assert.equal(w._hoveredNativeSequenceId,'B');\n assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');\n w.highlightSequenceOnVTL(null);assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#35AF6D');\n assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#0000ff');assert.equal(w._sequenceHoverHighlight,undefined);\n});\ntest('moving between native images in the same hovered sequence does not rebuild styles',()=>{\n const {w,layer}=setup();\n w.clearTurboHover=()=>{};w.showTurboHover=()=>{};w.prepareCoverageFrameHover=()=>{};\n w.coverageSelectionContext=()=>({});w._coverageSelectionTargets={hover(){}};\n for(const id of ['1','2']){\n  w.updateTurboHover({attributes:{image_id:id,sequence_id:'B'}},0,0);\n  if(id==='1')w.firstHoverCalls=layer.calls.length;\n }\n assert.equal(layer.calls.length,w.firstHoverCalls);\n assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');\n w.clearTurboHoverDetails();\n assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#35AF6D');\n assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#0000ff');\n});\ntest('direct point drawing cannot reintroduce sequence graphics in Turbo',()=>{const {w}=setup();w.drawPointWithoutRemoving(1,2,[0,0,255,1],'A','1');assert.equal(w.allocations(),0)});\nfor(const type of ['2d','3d'])test(type+': delayed complete route updates minimap geometry without drawing over native coverage',async()=>{\n const {w,view}=setup(24,type);let resume;const held=new Promise(r=>resume=r);yieldSequenceWorkImpl=()=>held;\n const route=Array.from({length:260},(_,i)=>({id:String(i),lon:i,lat:i}));\n try {\n  const task=w.renderLiveSequenceLine(route,'A',1,new AbortController(),view);\n  assert.equal(w._liveSequenceLine,undefined);assert.equal(w._activeSequenceOverlay,undefined);\n  resume();await task;\n  assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,260);\n  assert.equal(w._activeSequenceOverlay,undefined,'no main-map GraphicsLayer');\n } finally {resume();yieldSequenceWorkImpl=async()=>{}}\n});\ntest('a superseded background route cannot replace the minimap route or add an overview',async()=>{\n const {w,view}=setup();let resume;const held=new Promise(r=>resume=r);yieldSequenceWorkImpl=()=>held;\n try {\n  const route=Array.from({length:260},(_,i)=>({id:String(i),lon:i,lat:i}));\n  const task=w.renderLiveSequenceLine(route,'A',1,new AbortController(),view);\n  w._selectionRequestId=2;w._liveSequenceLine={sequenceId:'B',geometry:{}};resume();await task;\n  assert.equal(w._liveSequenceLine.sequenceId,'B');assert.equal(w._activeSequenceOverlay,undefined);\n } finally {resume();yieldSequenceWorkImpl=async()=>{}}\n});\ntest('legacy coverage still draws its route',async()=>{\n const {w,view}=setup();w.state.turboModeActive=false;w._liveSequenceFrames.markerWindow=()=>null;\n await w.renderLiveSequenceLine([{id:'1',lon:1,lat:2},{id:'2',lon:2,lat:3}],'A',1,new AbortController(),view);\n assert.equal(w._activeSequenceOverlay.layer.graphics.toArray().length,1);\n});\nfor(const type of ['2d','3d'])for(const zoom of [19,24,26])test(`native picking keeps corrected centers at zoom ${zoom} in ${type}`,async()=>{const {w,view}=setup(zoom,type),offset=nativeCoverageOffsetMeters(14);let visits=0;w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visits++;visit({lon:10,lat:20,imageId:'1'})};const result=await w.pickTurboGraphic({x:10+offset,y:20-offset},view,new AbortController().signal);assert(visits);assert.equal(result.attributes.image_id,'1');assert.equal(result.geometry.x,10+offset);assert.equal(result.geometry.y,20-offset);if(type==='3d')assert.equal(result.geometry.z,123)});\ntest('canceled native picking cannot commit a late result',async()=>{const {w,view}=setup(),abort=new AbortController();w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visit({lon:10,lat:20,imageId:'1'});abort.abort()};assert.equal(await w.pickTurboGraphic({x:10,y:20},view,abort.signal),null)});\ntest('coverage style commit uses the latest selection after an asynchronous style load',async()=>{const {w,layer,view}=setup();let finish;const held=new Promise(r=>finish=r);layer.loadStyle=async s=>{await held;layer.styles=structuredClone(s.layers)};w.canInitializeCoverage=()=>true;w.ensureArcGISModules=async()=>{};w.getTurboOrganizationId=()=>undefined;w._turboCoverageOriginalStyle={};w.waitForTurboCoverageReady=async()=>{};w.setState=p=>Object.assign(w.state,p);w.enforceMapillaryLayerOrder=()=>{};w.log=()=>{};w._turboTileCache={byteLength:0,size:0};w.accessToken='test';const task=w.loadTurboCoverageLayer(undefined,1,new AbortController());await new Promise(r=>setImmediate(r));w.state.sequenceId=w.state.selectedSequenceId='B';finish();await task;assert.equal(w._loadedTurboFiltersKey.includes('native'),true);assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#35AF6D')});\ntest('retired close renderer and hybrid pick branches are absent',()=>{assert(!cl.members.some(m=>['loadTurboCloseGraphics','releaseTurboCloseGraphics','refreshHybridSequenceMembership'].includes(m.name?.getText(sf))));assert(!method('pickTurboGraphic').includes('closeZoom'));assert(!source.includes('_turboClose'));assert(method('hydrateLiveSequence').includes('this.state.turboModeActive ||'));assert(method('componentDidUpdate').includes('this.updateNativeSequenceSelection()'))});\n\ntest('cached tile preview supplies minimap geometry without an extra main-map overview',async()=>{\n const {w}=setup();w._turboTileCache={snapshot:()=>[['14/1/2',new ArrayBuffer(1)]]};\n await w.showCachedSequencePreview('A',1,new AbortController().signal);\n assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2);assert.equal(w._activeSequenceOverlay,undefined);\n});\n",
          "wholeFile": true
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
const prefix = 'sequence-drawing-fix-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
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
  const allowed = ['--dry-run', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-sequence-drawing-fix.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited fix references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (required references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Regression test changes are included. Tests and the host build do not run in this installer.');
  if (!writes.length) {
    console.log(uninstall ? 'Sequence drawing fix is already uninstalled. No files changed.' : 'Sequence drawing fix is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'sequence-drawing-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Sequence drawing fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log(uninstall ? 'Previous sequence-drawing behavior restored. Rebuild/reload Experience Builder.' : 'Rebuild/reload Experience Builder. Hover and selection use blue native tiles; no extra main-map overview. Minimap geometry is retained.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
