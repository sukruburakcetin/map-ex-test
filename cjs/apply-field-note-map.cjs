#!/usr/bin/env node
'use strict';
/** Field-note map installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx annotation cloud picking block 1",
          "before": "import { assertEnterpriseNoteUnchanged, buildEnterpriseNoteEditAttributes } from '../features/field-notes/enterpriseEdit';\nimport { prepareCurrentImageAttachment, validateNoteAttachmentFile } from '../features/field-notes/attachmentFiles';\nimport { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\n",
          "after": "import { assertEnterpriseNoteUnchanged, buildEnterpriseNoteEditAttributes } from '../features/field-notes/enterpriseEdit';\nimport { prepareCurrentImageAttachment, validateNoteAttachmentFile } from '../features/field-notes/attachmentFiles';\nimport { FieldNoteMap } from '../features/field-notes/FieldNoteMap';\nimport { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 2",
          "before": "\n  // Field notes\n  private _fieldNotesLayer: __esri.GraphicsLayer | null = null;\n  private _pendingNoteMarker: PendingNoteMarker | null = null;\n  private _fieldNotesGroup: __esri.GroupLayer | null = null;\n  private _fieldNotesGroupView: __esri.MapView | __esri.SceneView | null = null;\n  private _fieldNotesGroupVisible = true;\n  private _fieldNotesGroupRevision = 0;\n  private _fieldNotesGroupLoad: Promise<__esri.GroupLayer | null> | null = null;\n\n  // Observers and handles\n",
          "after": "\n  // Field notes\n  private _pendingNoteMarker: PendingNoteMarker | null = null;\n\n  // Observers and handles\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 3",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n  private _fieldNoteFiles = new FieldNoteFiles({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind live note/map state and SDK factories; the feature owns group/local-layer lifecycle. */\n  private _fieldNoteMap = new FieldNoteMap<__esri.GroupLayer, __esri.GraphicsLayer, __esri.Graphic, __esri.MapView | __esri.SceneView>({\n    readContext: () => ({ view: this.state.jimuMapView?.view, ready: !!this.ArcGISModules, disposed: this._sharedNotesDisposed }),\n    readNotes: () => this.state.fieldNotes,\n    readShared: () => ({ url: this.props.config.sharedFieldNotesUrl, loaded: !!this._sharedNotesLayer?.loaded, view: this._sharedNotesView }),\n    clearPending: () => this.clearPendingNoteGraphic(),\n    loadGroupFactory: async () => {\n      const [GroupLayer] = await loadArcGISJSAPIModules([\"esri/layers/GroupLayer\"]);\n      return properties => new GroupLayer(properties) as __esri.GroupLayer;\n    },\n    loadLayerFactory: async () => {\n      const [GraphicsLayer] = await loadArcGISJSAPIModules([\"esri/layers/GraphicsLayer\"]);\n      return properties => new GraphicsLayer(properties) as __esri.GraphicsLayer;\n    },\n    readGraphicFactory: () => {\n      const { Graphic } = this.ArcGISModules;\n      return (note, is3D) => new Graphic(buildLocalNoteGraphic(note, is3D));\n    },\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n  private _fieldNoteFiles = new FieldNoteFiles({\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 4",
          "before": "  private _sharedNoteSaves = new Set<string>();\n\n  private async ensureFieldNotesGroup(view: __esri.MapView | __esri.SceneView): Promise<__esri.GroupLayer | null> {\n    if (this._fieldNotesGroupView === view && this._fieldNotesGroup && !this._fieldNotesGroup.destroyed) return this._fieldNotesGroup;\n    if (this._fieldNotesGroupLoad) { await this._fieldNotesGroupLoad; if (this._fieldNotesGroupView === view) return this._fieldNotesGroup; }\n    const revision = this._fieldNotesGroupRevision;\n    const task = (async () => {\n      const [GroupLayer] = await loadArcGISJSAPIModules([\"esri/layers/GroupLayer\"]);\n      if (revision !== this._fieldNotesGroupRevision || view.destroyed || !view.map || this.state.jimuMapView?.view !== view || this._sharedNotesDisposed) return null;\n      if (this._fieldNotesGroup) {\n        this._fieldNotesGroupVisible = this._fieldNotesGroup.visible;\n        this._fieldNotesGroupView?.map?.remove(this._fieldNotesGroup);\n        this._fieldNotesGroup.destroy();\n      }\n      const group: __esri.GroupLayer = new GroupLayer({ id: \"mapillary-field-notes\", title: \"Field Notes\", visible: this._fieldNotesGroupVisible, visibilityMode: \"independent\" });\n      this._fieldNotesGroup = group; this._fieldNotesGroupView = view; view.map.add(group); return group;\n    })();\n    this._fieldNotesGroupLoad = task;\n    try { return await task; } finally { if (this._fieldNotesGroupLoad === task) this._fieldNotesGroupLoad = null; }\n  }\n\n  private clearFieldNotesGroup() {\n    ++this._fieldNotesGroupRevision;\n    this.clearPendingNoteGraphic();\n    if (this._fieldNotesGroup) {\n      this._fieldNotesGroupVisible = this._fieldNotesGroup.visible;\n      this._fieldNotesGroupView?.map?.remove(this._fieldNotesGroup);\n      this._fieldNotesGroup.destroy();\n    }\n    this._fieldNotesGroup = null; this._fieldNotesGroupView = null; this._fieldNotesLayer = null;\n  }\n\n  private sharedNotesUrl(read = false): string {\n",
          "after": "  private _sharedNoteSaves = new Set<string>();\n\n  /** Borrow/create the current note group; its owner preserves visibility and load guards. */\n  private async ensureFieldNotesGroup(view: __esri.MapView | __esri.SceneView): Promise<__esri.GroupLayer | null> {\n    return this._fieldNoteMap.ensureGroup(view);\n  }\n\n  /** Release the group from its creating view after stopping the pending note marker. */\n  private clearFieldNotesGroup() { this._fieldNoteMap.clear(); }\n\n  private sharedNotesUrl(read = false): string {\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 5",
          "before": "    this._sharedNotesTimer = null;\n    if (this._sharedNotesLayer) {\n      this._fieldNotesGroup?.layers.remove(this._sharedNotesLayer);\n      this._sharedNotesView?.map?.remove(this._sharedNotesLayer);\n      this._sharedNotesLayer.destroy();\n",
          "after": "    this._sharedNotesTimer = null;\n    if (this._sharedNotesLayer) {\n      this._fieldNoteMap.group?.layers.remove(this._sharedNotesLayer);\n      this._sharedNotesView?.map?.remove(this._sharedNotesLayer);\n      this._sharedNotesLayer.destroy();\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 6",
          "before": "      requestFrame: callback => requestAnimationFrame(callback),\n      cancelFrame: handle => cancelAnimationFrame(handle),\n      isVisible: () => (this._fieldNotesGroup?.visible ?? this._fieldNotesGroupVisible) !== false,\n    });\n    this._pendingNoteMarker.start(view, host, geom);\n",
          "after": "      requestFrame: callback => requestAnimationFrame(callback),\n      cancelFrame: handle => cancelAnimationFrame(handle),\n      isVisible: () => (this._fieldNoteMap.group?.visible ?? this._fieldNoteMap.visible) !== false,\n    });\n    this._pendingNoteMarker.start(view, host, geom);\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 7",
          "before": "   * Orange diamonds denote manual entries, while green diamonds indicate AI detections.\n   */\n  private async drawFieldNoteGraphics() {\n    const { jimuMapView } = this.state;\n    const view = jimuMapView?.view;\n    if (!view?.map || view.destroyed || !this.ArcGISModules) return;\n\n    const is3D = view.type === \"3d\";\n\n    if (!this._fieldNotesLayer) {\n      const [GraphicsLayer] = await loadArcGISJSAPIModules([\"esri/layers/GraphicsLayer\"]);\n      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;\n      if (!this._fieldNotesLayer) this._fieldNotesLayer = new GraphicsLayer({ id: \"field-notes-layer\", title: \"Local Notes\" });\n    }\n\n    const group = await this.ensureFieldNotesGroup(view);\n    if (!group || this.state.jimuMapView?.view !== view || !this._fieldNotesLayer || this._fieldNotesLayer.destroyed) return;\n    if (!group.layers.includes(this._fieldNotesLayer)) group.layers.add(this._fieldNotesLayer);\n\n    this._fieldNotesLayer.removeAll();\n    const { Graphic } = this.ArcGISModules;\n\n    this.state.fieldNotes.forEach((n) => {\n      if (n.sharedStatus === \"shared\" && n.sharedLayerUrl === this.props.config.sharedFieldNotesUrl?.trim().replace(/\\/$/, \"\") && this._sharedNotesLayer?.loaded && this._sharedNotesView === view) return;\n      const g = new Graphic(buildLocalNoteGraphic(n, is3D));\n      this._fieldNotesLayer!.add(g);\n    });\n  }\n\n  /**\n",
          "after": "   * Orange diamonds denote manual entries, while green diamonds indicate AI detections.\n   */\n  private async drawFieldNoteGraphics() { await this._fieldNoteMap.draw(); }\n\n  /**\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 8",
          "before": "    this._sequenceHoverHighlight?.reset(view);\n    this.clearFieldNotesGroup();\n    // Destroy the field notes layer so it safely rebuilds on the new 2D/3D map\n    if (this._fieldNotesLayer) {\n      try {\n        const map = view.map;\n        if (map && map.layers.includes(this._fieldNotesLayer)) {\n          map.remove(this._fieldNotesLayer);\n        }\n        this._fieldNotesLayer.destroy();\n      } catch (e) {}\n      this._fieldNotesLayer = null;\n    }\n\n    // Commit the NEW MapView first.\n    // Only then restore graphics and sign/object watchers.\n",
          "after": "    this._sequenceHoverHighlight?.reset(view);\n    this.clearFieldNotesGroup();\n    // Commit the NEW MapView first.\n    // Only then restore graphics and sign/object watchers.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteMap"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteMap",
          "count": 3
        }
      ]
    },
    {
      "file": "src/features/field-notes/mapGraphic.ts",
      "blocks": [
        {
          "label": "src/features/field-notes/mapGraphic.ts annotation cloud picking block 1",
          "before": "/** Local note graphic descriptors only; SDK allocation and layer ownership remain runtime responsibilities. */\nimport type { FieldNote } from '../../components/types';\n\n",
          "after": "/** Local note graphic descriptors only; FieldNoteMap owns layer coordination; runtime supplies SDK factories. */\nimport type { FieldNote } from '../../components/types';\n\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteMap"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteMap",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/field-notes/README.md",
      "blocks": [
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 1",
          "before": "| Concern | Entry point |\n| --- | --- |\n| GeoJSON file import/export, live-ID merging and browser I/O | `FieldNoteFiles.ts` |\n| File feedback wording and import counts | `FieldNoteFileFeedback.tsx` |\n",
          "after": "| Concern | Entry point |\n| --- | --- |\n| Note group/local graphics lifecycle, visibility and drawing | `FieldNoteMap.ts` |\n| GeoJSON file import/export, live-ID merging and browser I/O | `FieldNoteFiles.ts` |\n| File feedback wording and import counts | `FieldNoteFileFeedback.tsx` |\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 2",
          "before": "\nNo local note store, storage schema, quota logic, Enterprise publication or renderer ownership is moved. Function comments explain I/O/catch/callback boundaries. `tests/fieldNoteFiles.test.cjs` compares actual runtime adapters to frozen original methods using real conversion, controlled readers/DOM/clocks and queued state. Host checks: export/open GeoJSON, import 2D/3D notes, duplicates/all-existing/empty/invalid files, local reload and metadata/altitude preservation.\n",
          "after": "\nNo local note store, storage schema, quota logic, Enterprise publication or renderer ownership is moved. Function comments explain I/O/catch/callback boundaries. `tests/fieldNoteFiles.test.cjs` compares actual runtime adapters to frozen original methods using real conversion, controlled readers/DOM/clocks and queued state. Host checks: export/open GeoJSON, import 2D/3D notes, duplicates/all-existing/empty/invalid files, local reload and metadata/altitude preservation.\n\n## Note map resources and graphics\n\n`FieldNoteMap.ts` owns the existing group/local-layer references, creating view, saved visibility, group revision and pending group load. Runtime binds live map/readiness/disposal/notes/shared-layer inputs and SDK factories. `mapGraphic.ts` still builds unchanged geometry/symbol/popup descriptors. Enterprise querying/refresh and layer lifetime remain in runtime; it borrows `group` to attach/remove its shared layer.\n\n- `ensureGroup(view)` reuses the same-view group or waits for the current group load, preserving original revision/live-view/map/disposal checks before construction. Replacement saves visibility and removes/destroys the previous group through its creating view.\n- `draw` keeps original GraphicsLayer readiness/load behavior, then ensures the group and checks current view/local-layer state. It attaches once, clears local graphics, captures the Graphic constructor once and rebuilds in current note order. 2D/3D is captured before loading; notes/shared-layer inputs remain live during drawing.\n- Local shared copies are suppressed only when the existing shared-status, normalized configured URL, loaded Enterprise layer and same-view conditions all match. Keep the single trailing-slash removal and original undefined-URL behavior.\n- `clear` increments group revision, stops the pending marker, saves visibility, removes/destroys the group and nulls group/view/local references in the original order. It retains existing async draw policy, exception propagation and pending-group sharing.\n- Read-only `group`, `layer` and `visible` accessors support existing Enterprise grouping and pending-marker visibility. Do not create a second authority in runtime. The old post-clear local-layer cleanup block was unreachable because clear unconditionally nulls that reference; it has been removed.\n\nThe owner adds no cloud/note cache, viewer update, timer, query, SDK-load sharing policy or draw cancellation/version rule. Function comments document borrowed resources, live/captured data and lifecycle boundaries. `tests/fieldNoteMap.test.cjs` compares actual adapters with frozen original methods and real descriptors across 2D/3D, concurrent loads, clear/replacement, visibility, suppression and failures. Host checks: local/shared grouping, group visibility, 2D/3D switches, pending marker visibility, repeated clear/reopen and local/shared graphic display.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteMap",
        "## Note map resources and graphics"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteMap",
          "count": 2
        },
        {
          "text": "## Note map resources and graphics",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md annotation cloud picking block 1",
          "before": "Changed: runtime, converter header comment, field-note contributor README and roadmap. Added: file coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 339 point-cloud/field-note/playback cases; strict actual adapter/browser/feedback checks with real DOM/FieldNote types and local Jimu declarations; full runtime TSX parse; unaffected token preservation and guarded installer checks. Host smoke checks remain actual GeoJSON export/import, metadata/altitudes, duplicates and invalid/empty files, plus persistence after reload.\n\nNext: review field-note rendering ownership, starting with map-layer lifecycle and graphic synchronization, while preserving local/shared grouping, map-switch guards and viewer update order.\n",
          "after": "Changed: runtime, converter header comment, field-note contributor README and roadmap. Added: file coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 339 point-cloud/field-note/playback cases; strict actual adapter/browser/feedback checks with real DOM/FieldNote types and local Jimu declarations; full runtime TSX parse; unaffected token preservation and guarded installer checks. Host smoke checks remain actual GeoJSON export/import, metadata/altitudes, duplicates and invalid/empty files, plus persistence after reload.\n\nField-note map rendering ownership is completed below with grouping, existing guards and viewer ordering retained.\n\n## Field-note map group and local graphic ownership\n\nExtracted group/local map state and draw/ensure/clear methods to `src/features/field-notes/FieldNoteMap.ts`. Runtime is now 13,083 lines (45 fewer). Six runtime fields are replaced by one typed feature owner; Enterprise child-layer removal and pending-marker visibility borrow read-only accessors. Map/SDK/group wrappers remain explicit.\n\nFunction comments document group load sharing, original revision/live-view/disposal checks, creating-view cleanup, visibility carryover, 2D/3D capture, live note/shared-layer reads and local-copy suppression. Descriptors remain unchanged. No new load-sharing, draw supersession, cancellation, error policy, query, viewer update, timer or note cache is introduced. A redundant map-switch branch after clear was removed: clear always nulled the local-layer reference before its condition.\n\nChanged: runtime, descriptor header comment, field-note contributor README and roadmap. Added: map owner, 16 baseline-backed cases and frozen original lifecycle methods/redundant cleanup block. Validation: 355 point-cloud/field-note/playback cases; strict actual owner/SDK factory/grouping boundary checks against ArcGIS 4.33.12; full runtime TSX parse; 538 existing member bodies token-identical and three others normalized only for owner accessors/dead cleanup; unchanged helper tokens and guarded installer checks. Host smoke checks remain local/shared grouping, visibility, 2D/3D switches, pending marker display and repeated clear/reopen.\n\nNext: extract field-note viewer registration and marker synchronization, preserving renderer attach/update/remove behavior, relevant-note selection, raw-coordinate/source-height policy and viewer reference callbacks.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteMap",
        "## Field-note map group and local graphic ownership"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteMap",
          "count": 1
        },
        {
          "text": "## Field-note map group and local graphic ownership",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/field-notes/FieldNoteMap.ts",
      "content": "import type { FieldNote } from '../../components/types';\nexport interface NoteMapResource { destroyed?: boolean; destroy(): void; }\nexport interface NoteGraphicsLayer<A> extends NoteMapResource { removeAll(): void; add(graphic: A): unknown; }\nexport interface NoteGroup<L> extends NoteMapResource {\n  visible: boolean;\n  layers: { includes(layer: L): boolean; add(layer: L): unknown };\n}\nexport interface NoteMapView<G> { type: string; destroyed?: boolean; map?: { add(group: G): unknown; remove(group: G): unknown } | null; }\nexport interface FieldNoteMapDependencies<G, L, A, V> {\n  readContext(): { view: V | null | undefined; ready: boolean; disposed: boolean };\n  readNotes(): FieldNote[];\n  readShared(): { url?: string; loaded: boolean; view: V | null };\n  clearPending(): void;\n  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n * Preserve original readiness, asynchronous sharing, view/revision guards and error propagation.\n * No note cache, requests, timers, viewer updates or new draw supersession policy are introduced.\n */\nexport class FieldNoteMap<G extends NoteGroup<L>, L extends NoteGraphicsLayer<A>, A, V extends NoteMapView<G>> {\n  private currentGroup: G | null = null;\n  private currentLayer: L | null = null;\n  private groupView: V | null = null;\n  private groupVisible = true;\n  private revision = 0;\n  private groupLoad: Promise<G | null> | null = null;\n  constructor(private readonly dependencies: FieldNoteMapDependencies<G, L, A, V>) {}\n  /** Borrow SDK resources for existing Enterprise grouping and pending-marker visibility only. */\n  get group(): G | null { return this.currentGroup; }\n  get layer(): L | null { return this.currentLayer; }\n  /** Last saved visibility, used when no current group exists. */\n  get visible(): boolean { return this.groupVisible; }\n\n  /** Reuse the same-view group or await the existing group load before starting another.\n   * After module loading, retain revision/live-view/disposal checks before construction/attachment.\n   * Replacement saves visibility and removes/destroys the old group on its creating view.\n   */\n  async ensureGroup(view: V): Promise<G | null> {\n    const d = this.dependencies;\n    if (this.groupView === view && this.currentGroup && !this.currentGroup.destroyed) return this.currentGroup;\n    if (this.groupLoad) { await this.groupLoad; if (this.groupView === view) return this.currentGroup; }\n    const revision = this.revision;\n    const task = (async () => {\n      const create = await d.loadGroupFactory();\n      if (revision !== this.revision || view.destroyed || !view.map || d.readContext().view !== view || d.readContext().disposed) return null;\n      if (this.currentGroup) {\n        this.groupVisible = this.currentGroup.visible;\n        this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n      }\n      const group = create({ id: 'mapillary-field-notes', title: 'Field Notes', visible: this.groupVisible, visibilityMode: 'independent' });\n      this.currentGroup = group; this.groupView = view; view.map.add(group); return group;\n    })();\n    this.groupLoad = task;\n    try { return await task; } finally { if (this.groupLoad === task) this.groupLoad = null; }\n  }\n\n  /** Invalidate pending group attachment, stop the pending marker, then remove/destroy the group.\n   * Keep original visibility carryover, null/reset order and synchronous failure boundaries.\n   */\n  clear(): void {\n    ++this.revision;\n    this.dependencies.clearPending();\n    if (this.currentGroup) {\n      this.groupVisible = this.currentGroup.visible;\n      this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n    }\n    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n   * Capture 2D/3D before SDK readiness; read current notes/shared-layer state when drawing.\n   * Suppress a local shared copy only for the same normalized URL, loaded Enterprise layer and view.\n   * Geometry/symbol/popup descriptors remain in mapGraphic.ts; point/note objects are not copied here.\n   */\n  async draw(): Promise<void> {\n    const d = this.dependencies;\n    const view = d.readContext().view;\n    if (!view?.map || view.destroyed || !d.readContext().ready) return;\n    const is3D = view.type === '3d';\n    if (!this.currentLayer) {\n      const create = await d.loadLayerFactory();\n      if (d.readContext().view !== view || !view.map || view.destroyed) return;\n      if (!this.currentLayer) this.currentLayer = create({ id: 'field-notes-layer', title: 'Local Notes' });\n    }\n    const group = await this.ensureGroup(view);\n    if (!group || d.readContext().view !== view || !this.currentLayer || this.currentLayer.destroyed) return;\n    if (!group.layers.includes(this.currentLayer)) group.layers.add(this.currentLayer);\n    this.currentLayer.removeAll();\n    const createGraphic = d.readGraphicFactory();\n    d.readNotes().forEach(note => {\n      if (note.sharedStatus === 'shared') {\n        const shared = d.readShared();\n        if (note.sharedLayerUrl === shared.url?.trim().replace(/\\/$/, '') && shared.loaded && shared.view === view) return;\n      }\n      const graphic = createGraphic(note, is3D);\n      this.currentLayer!.add(graphic);\n    });\n  }\n}\n"
    },
    {
      "file": "tests/fieldNoteMap.test.cjs",
      "content": "/** Actual runtime map owner/adapters versus frozen original group/draw/clear methods.\n * Recording SDK objects, actual descriptors and held module loads expose geometry and lifecycle order.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/FieldNoteMap.ts','utf8')))(m,m.exports);const descriptor={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/mapGraphic.ts','utf8')))(descriptor,descriptor.exports);\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/fieldNoteMap.baseline.json','utf8')),source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const actual=['_fieldNoteMap','ensureFieldNotesGroup','clearFieldNotesGroup','drawFieldNoteGraphics'].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve()};\nconst note=(id='A',extra={})=>({id,source:'manual',category:'Other',note:'hello',lon:1,lat:2,alt:3,imageId:'image',createdAt:1000,...extra});\nfunction setup(kind,{hold=false,type='3d'}={}){\n const trace=[],groups=[],layers=[],loads=[],views=[];let graphicFailure=false;\n class Group{constructor(props){Object.assign(this,props);this.number=groups.length;groups.push(this);this.layers={items:[],includes:l=>this.layers.items.includes(l),add:l=>{this.layers.items.push(l);trace.push(['child-add',this.number,l.id])},remove:l=>{this.layers.items=this.layers.items.filter(x=>x!==l);trace.push(['child-remove',this.number,l.id])}};trace.push(['group',structuredClone(props)])}destroy(){this.destroyed=true;trace.push(['destroy-group',this.number])}}\n class Layer{constructor(props){Object.assign(this,props);this.number=layers.length;this.graphics=[];layers.push(this);trace.push(['layer',structuredClone(props)])}removeAll(){this.graphics=[];trace.push(['removeAll',this.number])}add(g){this.graphics.push(g);trace.push(['graphic',this.number,structuredClone(g)])}destroy(){this.destroyed=true;trace.push(['destroy-layer',this.number])}}\n class Graphic{constructor(props){if(graphicFailure)throw Error('graphic failed');Object.assign(this,props)}}\n const load=names=>{trace.push(['load',names]);const d=deferred();d.kind=names[0].includes('GroupLayer')?'group':'layer';loads.push(d);if(!hold)d.resolve([d.kind==='group'?Group:Layer]);return d.promise};\n const Harness=new Function('FieldNoteMap','loadArcGISJSAPIModules','buildLocalNoteGraphic',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.FieldNoteMap,load,descriptor.exports.buildLocalNoteGraphic);const w=new Harness();\n function view(type='3d'){const v={type,destroyed:false,map:{add:g=>trace.push(['map-add',views.indexOf(v),g.number]),remove:g=>trace.push(['map-remove',views.indexOf(v),g.number])}};views.push(v);return v}\n w.state={jimuMapView:{view:view(type)},fieldNotes:[note(),note('B',{source:'mapillary-detection',alt:undefined})]};w.props={config:{sharedFieldNotesUrl:' https://enterprise/notes/ '}};w.ArcGISModules={Graphic};w._sharedNotesDisposed=false;w._sharedNotesLayer=null;w._sharedNotesView=null;w.clearPendingNoteGraphic=()=>trace.push(['pending-clear']);w._fieldNotesGroup=null;w._fieldNotesLayer=null;w._fieldNotesGroupView=null;w._fieldNotesGroupVisible=true;w._fieldNotesGroupRevision=0;w._fieldNotesGroupLoad=null;\n return{w,trace,groups,layers,loads,views,view,Group,Layer,draw:()=>w.drawFieldNoteGraphics(),ensure:v=>w.ensureFieldNotesGroup(v||w.state.jimuMapView.view),clear:()=>w.clearFieldNotesGroup(),group:()=>kind==='baseline'?w._fieldNotesGroup:w._fieldNoteMap.group,layer:()=>kind==='baseline'?w._fieldNotesLayer:w._fieldNoteMap.layer,visible:()=>kind==='baseline'?w._fieldNotesGroupVisible:w._fieldNoteMap.visible,resolve:i=>loads[i].resolve([loads[i].kind==='group'?Group:Layer]),graphicFailure:value=>graphicFailure=value};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(structuredClone(b.layers.map(l=>l.graphics)),structuredClone(a.layers.map(l=>l.graphics)));assert.equal(b.visible(),a.visible());return b}\ntest('2D/3D exact local descriptors, group/layer properties, child attachment and drawing order match',async()=>{for(const type of ['2d','3d'])await compare(async h=>{await h.draw();assert.equal(h.groups.length,1);assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics.length,2);assert.equal(h.layers[0].graphics[0].geometry.hasZ,type==='3d')},{type})});\ntest('repeated draws reuse layer/group and rebuild current notes without duplicate attachment',async()=>{await compare(async h=>{await h.draw();h.w.state.fieldNotes=[note('new')];await h.draw();assert.equal(h.layers.length,1);assert.equal(h.groups.length,1);assert.equal(h.trace.filter(x=>x[0]==='child-add').length,1);assert.equal(h.layers[0].graphics.length,1)})});\ntest('concurrent first draws retain original graphics loads and shared group acquisition',async()=>{await compare(async h=>{const a=h.draw(),b=h.draw();assert.equal(h.loads.length,2);h.resolve(0);h.resolve(1);await flush();assert.equal(h.loads.length,3);h.resolve(2);await Promise.all([a,b]);assert.equal(h.layers.length,1);assert.equal(h.groups.length,1)},{hold:true})});\ntest('missing/destroyed map or SDK readiness skips draw module loading',async()=>{for(const mode of ['view','map','destroyed','sdk'])await compare(async h=>{if(mode==='view')h.w.state.jimuMapView=null;if(mode==='map')h.views[0].map=null;if(mode==='destroyed')h.views[0].destroyed=true;if(mode==='sdk')h.w.ArcGISModules=null;await h.draw();assert.equal(h.loads.length,0)})});\ntest('view replacement during graphics readiness skips local-layer construction',async()=>{await compare(async h=>{const p=h.draw();h.w.state.jimuMapView={view:h.view()};h.resolve(0);await p;assert.equal(h.layers.length,0)},{hold:true})});\ntest('group revision/view/map/disposal guards prevent stale construction',async()=>{for(const mode of ['clear','view','map','destroyed','disposed'])await compare(async h=>{const p=h.ensure();if(mode==='clear')h.clear();if(mode==='view')h.w.state.jimuMapView={view:h.view()};if(mode==='map')h.views[0].map=null;if(mode==='destroyed')h.views[0].destroyed=true;if(mode==='disposed')h.w._sharedNotesDisposed=true;h.resolve(0);assert.equal(await p,null);assert.equal(h.groups.length,0)},{hold:true})});\ntest('clear saves visibility and removes/destroys on original map before resetting state',async()=>{await compare(async h=>{await h.draw();h.group().visible=false;h.w.state.jimuMapView={view:h.view()};h.clear();assert.equal(h.group(),null);assert.equal(h.layer(),null);assert.equal(h.visible(),false);assert.deepEqual(h.trace.slice(-3).map(x=>x[0]),['pending-clear','map-remove','destroy-group']);assert(h.trace.some(x=>x[0]==='map-remove'&&x[1]===0));h.clear()})});\ntest('new-view group replacement preserves original visibility and old-view cleanup',async()=>{await compare(async h=>{await h.ensure();h.group().visible=false;h.w.state.jimuMapView={view:h.view()};await h.ensure();assert.equal(h.groups.length,2);assert.equal(h.group().visible,false);assert(h.groups[0].destroyed)})});\ntest('shared local-copy suppression retains URL/status/load/view conditions including undefined URLs',async()=>{for(const mode of ['matching','different','unloaded','other-view','unshared','undefined','double-slash'])await compare(async h=>{const url=mode==='undefined'?undefined:mode==='different'?'other':'https://enterprise/notes';h.w.state.fieldNotes=[note('shared',{sharedStatus:mode==='unshared'?'failed':'shared',sharedLayerUrl:url})];if(mode==='undefined')h.w.props.config.sharedFieldNotesUrl=undefined;if(mode==='double-slash')h.w.props.config.sharedFieldNotesUrl='https://enterprise/notes//';h.w._sharedNotesLayer={loaded:mode!=='unloaded'};h.w._sharedNotesView=mode==='other-view'?h.view():h.views[0];await h.draw();assert.equal(h.layers[0].graphics.length,['matching','undefined'].includes(mode)?0:1)})});\ntest('draw captures 3D before readiness but uses current notes after awaited group',async()=>{await compare(async h=>{const p=h.draw();h.views[0].type='2d';h.resolve(0);await flush();h.w.state.fieldNotes=[note('late',{alt:99})];h.resolve(1);await p;assert.equal(h.layers[0].graphics[0].geometry.hasZ,true);assert.equal(h.layers[0].graphics[0].geometry.z,99)},{hold:true})});\ntest('group/layer module failures propagate and preserve retry behavior',async()=>{for(const stage of ['group','layer'])await compare(async h=>{const p=stage==='group'?h.ensure():h.draw();h.loads[0].reject(Error('SDK failed'));await assert.rejects(p,{message:'SDK failed'});const next=stage==='group'?h.ensure():h.draw();h.resolve(1);await flush();if(stage==='layer')h.resolve(2);await next;assert.equal(h.groups.length,1)},{hold:true})});\ntest('graphic construction failure preserves partial redraw/error boundary and later retry',async()=>{await compare(async h=>{await h.draw();h.graphicFailure(true);await assert.rejects(h.draw(),{message:'graphic failed'});assert.equal(h.layers[0].graphics.length,0);h.graphicFailure(false);await h.draw();assert.equal(h.layers[0].graphics.length,2)})});\ntest('externally destroyed local layer preserves original skip behavior',async()=>{await compare(async h=>{await h.draw();h.layer().destroyed=true;const before=h.trace.length;await h.draw();assert.equal(h.trace.length,before)})});\ntest('different-view ensure waits for stale group task then loads current view group',async()=>{await compare(async h=>{const first=h.ensure();h.w.state.jimuMapView={view:h.view()};const second=h.ensure();assert.equal(h.loads.length,1);h.resolve(0);await flush();assert.equal(h.loads.length,2);h.resolve(1);assert.equal(await first,null);await second;assert.equal(h.groups.length,1);assert(h.trace.some(x=>x[0]==='map-add'&&x[1]===1))},{hold:true})});\ntest('clear during graphics readiness retains existing live-context draw policy and source identity',async()=>{await compare(async h=>{const before=structuredClone(h.w.state.fieldNotes);h.w.state.fieldNotes.forEach(Object.freeze);Object.freeze(h.w.state.fieldNotes);const p=h.draw();h.clear();h.resolve(0);await flush();h.resolve(1);await p;assert.equal(h.groups.length,1);assert.deepEqual(h.w.state.fieldNotes,before)},{hold:true})});\n\n// Keep the original one-Graphic-constructor snapshot even if construction mutates the host registry.\ntest('Graphic constructor is captured once and missing registry still fails before an empty loop',async()=>{\n await compare(async h=>{h.w.ArcGISModules.Graphic=class{constructor(props){Object.assign(this,props);h.w.ArcGISModules.Graphic=class{constructor(){throw Error('registry changed')}}}};await h.draw();assert.equal(h.layers[0].graphics.length,2)});\n await compare(async h=>{const p=h.draw();h.resolve(0);await flush();h.w.state.fieldNotes=[];h.w.ArcGISModules=null;h.resolve(1);await assert.rejects(p);assert.equal(h.layers[0].graphics.length,0)},{hold:true});\n});\n"
    },
    {
      "file": "tests/fixtures/fieldNoteMap.baseline.json",
      "content": "{\n  \"handlers\": \"  private async ensureFieldNotesGroup(view: __esri.MapView | __esri.SceneView): Promise<__esri.GroupLayer | null> {\\n    if (this._fieldNotesGroupView === view && this._fieldNotesGroup && !this._fieldNotesGroup.destroyed) return this._fieldNotesGroup;\\n    if (this._fieldNotesGroupLoad) { await this._fieldNotesGroupLoad; if (this._fieldNotesGroupView === view) return this._fieldNotesGroup; }\\n    const revision = this._fieldNotesGroupRevision;\\n    const task = (async () => {\\n      const [GroupLayer] = await loadArcGISJSAPIModules([\\\"esri/layers/GroupLayer\\\"]);\\n      if (revision !== this._fieldNotesGroupRevision || view.destroyed || !view.map || this.state.jimuMapView?.view !== view || this._sharedNotesDisposed) return null;\\n      if (this._fieldNotesGroup) {\\n        this._fieldNotesGroupVisible = this._fieldNotesGroup.visible;\\n        this._fieldNotesGroupView?.map?.remove(this._fieldNotesGroup);\\n        this._fieldNotesGroup.destroy();\\n      }\\n      const group: __esri.GroupLayer = new GroupLayer({ id: \\\"mapillary-field-notes\\\", title: \\\"Field Notes\\\", visible: this._fieldNotesGroupVisible, visibilityMode: \\\"independent\\\" });\\n      this._fieldNotesGroup = group; this._fieldNotesGroupView = view; view.map.add(group); return group;\\n    })();\\n    this._fieldNotesGroupLoad = task;\\n    try { return await task; } finally { if (this._fieldNotesGroupLoad === task) this._fieldNotesGroupLoad = null; }\\n  }\\n  private clearFieldNotesGroup() {\\n    ++this._fieldNotesGroupRevision;\\n    this.clearPendingNoteGraphic();\\n    if (this._fieldNotesGroup) {\\n      this._fieldNotesGroupVisible = this._fieldNotesGroup.visible;\\n      this._fieldNotesGroupView?.map?.remove(this._fieldNotesGroup);\\n      this._fieldNotesGroup.destroy();\\n    }\\n    this._fieldNotesGroup = null; this._fieldNotesGroupView = null; this._fieldNotesLayer = null;\\n  }\\n  private async drawFieldNoteGraphics() {\\n    const { jimuMapView } = this.state;\\n    const view = jimuMapView?.view;\\n    if (!view?.map || view.destroyed || !this.ArcGISModules) return;\\n\\n    const is3D = view.type === \\\"3d\\\";\\n\\n    if (!this._fieldNotesLayer) {\\n      const [GraphicsLayer] = await loadArcGISJSAPIModules([\\\"esri/layers/GraphicsLayer\\\"]);\\n      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) return;\\n      if (!this._fieldNotesLayer) this._fieldNotesLayer = new GraphicsLayer({ id: \\\"field-notes-layer\\\", title: \\\"Local Notes\\\" });\\n    }\\n\\n    const group = await this.ensureFieldNotesGroup(view);\\n    if (!group || this.state.jimuMapView?.view !== view || !this._fieldNotesLayer || this._fieldNotesLayer.destroyed) return;\\n    if (!group.layers.includes(this._fieldNotesLayer)) group.layers.add(this._fieldNotesLayer);\\n\\n    this._fieldNotesLayer.removeAll();\\n    const { Graphic } = this.ArcGISModules;\\n\\n    this.state.fieldNotes.forEach((n) => {\\n      if (n.sharedStatus === \\\"shared\\\" && n.sharedLayerUrl === this.props.config.sharedFieldNotesUrl?.trim().replace(/\\\\/$/, \\\"\\\") && this._sharedNotesLayer?.loaded && this._sharedNotesView === view) return;\\n      const g = new Graphic(buildLocalNoteGraphic(n, is3D));\\n      this._fieldNotesLayer!.add(g);\\n    });\\n  }\",\n  \"redundantCleanup\": \"    // Destroy the field notes layer so it safely rebuilds on the new 2D/3D map\\n    if (this._fieldNotesLayer) {\\n      try {\\n        const map = view.map;\\n        if (map && map.layers.includes(this._fieldNotesLayer)) {\\n          map.remove(this._fieldNotesLayer);\\n        }\\n        this._fieldNotesLayer.destroy();\\n      } catch (e) {}\\n      this._fieldNotesLayer = null;\\n    }\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'field-note-map-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-field-note-map.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited map-owner references remain)');
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
    console.log(uninstall ? 'Field-note map is already uninstalled. No files changed.' : 'Field-note map is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'field-note-map', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Field-note map ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Field-note map flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
