#!/usr/bin/env node
'use strict';
/** Point-cloud viewshed installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud viewshed block 1",
          "before": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudSight } from '../features/point-cloud/PointCloudSight';\nimport { PointCloudLasso } from '../features/point-cloud/PointCloudLasso';\n",
          "after": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\nimport { PointCloudSight } from '../features/point-cloud/PointCloudSight';\nimport { PointCloudLasso } from '../features/point-cloud/PointCloudLasso';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud viewshed block 2",
          "before": "  private _measurement: PointCloudMeasurement<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _sight: PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point> | null = null;\n  private _viewshedAnalysis: any = null;\n  private _gridLayer: __esri.GraphicsLayer | null = null;\n  private _gridLayerReady: Promise<void> | null = null;\n",
          "after": "  private _measurement: PointCloudMeasurement<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _sight: PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point> | null = null;\n  private _viewshed: PointCloudViewshed<__esri.ViewshedAnalysis, __esri.MapView | __esri.SceneView> | null = null;\n  private _gridLayer: __esri.GraphicsLayer | null = null;\n  private _gridLayerReady: Promise<void> | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud viewshed block 3",
          "before": "    this._sight?.dispose();\n\n    if (this._viewshedAnalysis) {\n      this.clearViewshed();\n    }\n\n    //  graphics cleanup\n",
          "after": "    this._sight?.dispose();\n\n    this.clearViewshed();\n\n    //  graphics cleanup\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud viewshed block 4",
          "before": "  };\n\n  /**\n   * Clears the current Viewshed analysis.\n   */\n  private clearViewshed = () => {\n    if (this._viewshedAnalysis && this.state.jimuMapView) {\n      // Cast to 'any' to bypass the TypeScript error for .analyses on MapView\n      const view = this.state.jimuMapView.view as any;\n      if (view.analyses) {\n        view.analyses.remove(this._viewshedAnalysis);\n      }\n      this._viewshedAnalysis = null;\n    }\n  };\n\n  /**\n",
          "after": "  };\n\n  /** Bind SDK construction once; the feature owns observer policy and analysis lifetime. */\n  private ensureViewshedOwner() {\n    return this._viewshed ??= new PointCloudViewshed<__esri.ViewshedAnalysis, __esri.MapView | __esri.SceneView>({\n      read: () => ({ enabled: this.state.isViewshedMode, view: this.state.jimuMapView?.view }),\n      loadFactory: async () => {\n        const [ViewshedAnalysis, Viewshed, Point] = await loadArcGISJSAPIModules([\n          'esri/analysis/ViewshedAnalysis', 'esri/analysis/Viewshed', 'esri/geometry/Point',\n        ]);\n        return specification => new ViewshedAnalysis({\n          viewsheds: [new Viewshed({ ...specification, observer: new Point(specification.observer) })],\n        }) as __esri.ViewshedAnalysis;\n      },\n      warn: (...args) => console.warn(...args),\n    });\n  }\n\n  /** Cancel pending creation and release the original view's analysis without changing mode. */\n  private clearViewshed = () => { this._viewshed?.clear(); };\n\n  /**\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud viewshed block 5",
          "before": "    this._pointCloudAdaptiveDisplay?.dispose();\n    this._lasso?.clear();\n    this._sight?.onViewChange(view);\n    this._measurement?.onViewChange(view);\n",
          "after": "    this._pointCloudAdaptiveDisplay?.dispose();\n    this._lasso?.clear();\n    this._viewshed?.onViewChange(view);\n    this._sight?.onViewChange(view);\n    this._measurement?.onViewChange(view);\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud viewshed block 6",
          "before": "          // VIEWSHED MODE LOGIC\n          if (this.state.isViewshedMode && this.state.jimuMapView) {\n            this.clearViewshed();\n            loadArcGISJSAPIModules([\"esri/analysis/ViewshedAnalysis\", \"esri/analysis/Viewshed\", \"esri/geometry/Point\"]).then(([ViewshedAnalysis, Viewshed, Point]) => {\n              const viewshed = new Viewshed({\n                observer: new Point({\n                  longitude: geom.longitude,\n                  latitude: geom.latitude,\n                  z: geom.z + 1.5,\n                  spatialReference: { wkid: 4326 },\n                }),\n                farDistance: 150,\n                horizontalFieldOfView: 360,\n                verticalFieldOfView: 90,\n                heading: 0,\n                tilt: 0,\n              });\n\n              this._viewshedAnalysis = new ViewshedAnalysis({\n                viewsheds: [viewshed],\n              });\n\n              const view = this.state.jimuMapView!.view as any;\n              if (view.type === \"3d\" && view.analyses) {\n                view.analyses.add(this._viewshedAnalysis);\n              }\n            });\n            return;\n          }\n",
          "after": "          // VIEWSHED MODE LOGIC\n          if (this.state.isViewshedMode && this.state.jimuMapView) {\n            void this.ensureViewshedOwner().place(geom);\n            return;\n          }\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudViewshed",
        "ensureViewshedOwner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudViewshed",
          "count": 4
        },
        {
          "text": "ensureViewshedOwner",
          "count": 2
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud viewshed block 1",
          "before": "| Lasso numerical projection and filtered-viewer index selection | `src/features/point-cloud/lassoProjection.ts` |\n| Line-of-sight model, pending activation and creating-view/map lifetime | `src/features/point-cloud/PointCloudSight.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n",
          "after": "| Lasso numerical projection and filtered-viewer index selection | `src/features/point-cloud/lassoProjection.ts` |\n| Line-of-sight model, pending activation and creating-view/map lifetime | `src/features/point-cloud/PointCloudSight.ts` |\n| Viewshed pending observer creation, fixed policy and original collection cleanup | `src/features/point-cloud/PointCloudViewshed.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud viewshed block 2",
          "before": "\nIntentional corrections are constructor-load cancellation guards, shared activation, SceneView-only construction, original-model destruction, current-view pick validation, restoration and contained failures. Normal tool state/toasts, clear/reuse and mutual-exclusion behavior are preserved in baseline comparisons. `tests/pointCloudSight.test.cjs` executes real toggle/clear/SDK adapters and the actual hit branch; host validation must still verify real SDK occlusion and terrain/scene behavior.\n",
          "after": "\nIntentional corrections are constructor-load cancellation guards, shared activation, SceneView-only construction, original-model destruction, current-view pick validation, restoration and contained failures. Normal tool state/toasts, clear/reuse and mutual-exclusion behavior are preserved in baseline comparisons. `tests/pointCloudSight.test.cjs` executes real toggle/clear/SDK adapters and the actual hit branch; host validation must still verify real SDK occlusion and terrain/scene behavior.\n\n## Viewshed lifetime\n\n`PointCloudViewshed.ts` owns request revision, SDK analysis and its original view/map/analysis collection. Runtime owns `isViewshedMode`, point-cloud hit geometry, tool exclusion and UI. Its lazy factory loads the same ViewshedAnalysis/Viewshed/Point modules and constructs the same SDK property graph. The raw `any` analysis field and MapView `.analyses` cast are removed.\n\nEach observer click clears prior results before module loading, then validates the newest request, enabled 3D view, map and analysis-collection identity before construction and attachment. A constructor-triggered context change destroys the unattached analysis. Clear or view replacement invalidates pending work; a stale completion cannot attach to a new view. Current module/constructor/attachment failures are locally reported and retryable; stale failures remain silent.\n\nCleanup drops authority first, removes from the creating collection even after host state/view replacement and attempts SDK destroy independently. Partial attachment failures also remove/destroy the analysis. Widget cleanup now always clears the owner, including requests that have not produced an analysis yet. View changes release the old context; no observer state is invented or restored into the new map.\n\nObserver policy is unchanged: picked shifted longitude/latitude, picked map z plus 1.5 meters, WGS84 4326, 150 meters, horizontal/vertical fields 360/90 degrees and heading/tilt 0/0. No altitude-datum correction, new visibility formula, point traversal, timer or point-cloud request is introduced. Existing tool-exclusion conditions remain intact.\n\n`tests/pointCloudViewshed.test.cjs` distinguishes normal policy/toggle comparisons from intentional destruction/race/error improvements. It executes the actual hit branch and SDK adapter with recording constructors/collections. Strict checks use ArcGIS 4.33.12; live host checks must still verify real SDK visibility and scene/terrain behavior.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudViewshed",
        "## Viewshed lifetime"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudViewshed",
          "count": 2
        },
        {
          "text": "## Viewshed lifetime",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud viewshed block 1",
          "before": "Validation: 17 sight cases plus the existing 116 geometry/acquisition/map/viewer/measurement/lasso/playback cases (133 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover normal state/SDK ordering and geometry identity, exclusion, batched updates, failures/retry, concurrent activation, clear/disable during loading, constructor-side replacement, restoration, cleanup errors and old-view pick rejection. Host smoke checks still need observer/multiple targets, clear/toggle, other tools, 2D/3D and close/reopen with real visibility results.\n\nNext: extract viewshed resource ownership, async creation and cleanup separately. Keep its observer-height, angle, distance and SDK analysis policy unchanged, with explicit original-view cleanup and stale-load rejection. Then review the remaining point-cloud renderer-policy and ring/grid responsibilities for cohesive contributor entry points.\n",
          "after": "Validation: 17 sight cases plus the existing 116 geometry/acquisition/map/viewer/measurement/lasso/playback cases (133 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover normal state/SDK ordering and geometry identity, exclusion, batched updates, failures/retry, concurrent activation, clear/disable during loading, constructor-side replacement, restoration, cleanup errors and old-view pick rejection. Host smoke checks still need observer/multiple targets, clear/toggle, other tools, 2D/3D and close/reopen with real visibility results.\n\nViewshed resource ownership and guarded async creation are completed below. Keep its observer-height, angle, distance and SDK analysis policy unchanged, with explicit original-view cleanup and stale-load rejection. Then review the remaining point-cloud renderer-policy and ring/grid responsibilities for cohesive contributor entry points.\n\n## Viewshed SDK owner\n\n`PointCloudViewshed.ts` now owns pending observer-click revision, fixed observer specification, SDK analysis and original view/map/collection lifetime. Runtime keeps mode, picked geometry, conditional tool exclusion, toasts and a typed lazy SDK factory. The raw `any` analysis field and MapView analysis-collection cast are removed without mirrors.\n\nNormal module paths, constructor properties, observer read timing, replacement-before-load, toasts and toggle rules are preserved. Intentional corrections reject stale/out-of-order creation, enforce SceneView-only construction, remove from the original collection, destroy analyses, invalidate pending widget/view teardown and contain current SDK failures while ignoring stale failures. Analysis policy remains picked map z +1.5 m, range 150 m, fields 360/90 degrees and heading/tilt 0/0; the SDK continues visibility calculation.\n\nFunction comments define shifted degrees versus map-relative z, meter/degree policy, pending-request validity, original-collection cleanup and removal versus destruction. No timers, animation loops, point-cloud requests or alternative analysis math are added. Runtime shrinks by 19 lines to 14,031; 289 other method/callback bodies, including tool toggles, remain token-identical.\n\n| File | Change |\n| --- | --- |\n| `src/runtime/widget.tsx` | Typed viewshed factory, hit forwarding, clear and view/widget cleanup hooks |\n| `src/features/point-cloud/PointCloudViewshed.ts` | Fixed observer policy and guarded SDK analysis lifetime |\n| `src/features/point-cloud/README.md` | Viewshed contributor entry point, contracts and checks |\n| `docs/POINT-CLOUD-OWNERSHIP.md` | Viewshed authority, original context and intentional corrections |\n| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |\n| `tests/pointCloudViewshed.test.cjs` | Actual hit/factory/toggle policy comparisons and lifetime regressions |\n| `tests/fixtures/pointCloudViewshed.baseline.json` | Immutable pre-extraction clear/toggles and observer-hit branch |\n\nValidation: 15 viewshed cases plus the existing 133 geometry/acquisition/map/viewer/measurement/lasso/sight/playback cases (148 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover construction values/order, conditional exclusion, batched state, newest-click wins, clear/off/view/map/collection replacement, original-collection cleanup, failures/retry, partial attachment and constructor-side replacement. Host smoke checks still need real visibility results, repeated observer clicks, clear/toggle, other tools, 2D/3D and close/reopen.\n\nNext: extract ring/grid map-resource lifetime and its asynchronous readiness/generation contract. Keep distance/corridor drawing policy and original-view cleanup explicit. Renderer-policy extraction remains a separate later boundary; avoid combining unrelated controllers simply to reduce runtime line count.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudViewshed",
        "## Viewshed SDK owner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudViewshed",
          "count": 2
        },
        {
          "text": "## Viewshed SDK owner",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud viewshed block 1",
          "before": "| Lasso raw-point projection, ray casting and viewer-index selection | `lassoProjection.ts` |\n| Line-of-sight SDK model, activation, observer/target mutation and teardown | `PointCloudSight.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n",
          "after": "| Lasso raw-point projection, ray casting and viewer-index selection | `lassoProjection.ts` |\n| Line-of-sight SDK model, activation, observer/target mutation and teardown | `PointCloudSight.ts` |\n| Viewshed observer policy, pending click and original-analysis collection lifetime | `PointCloudViewshed.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud viewshed block 2",
          "before": "\nUse the existing Node/TypeScript setup. Tests execute actual runtime toggles, the actual sight-hit branch and the typed factory with recording SDK models. The immutable fixture is test-only. In Experience Builder check observer placement, multiple targets, clear, toggle off/on, switching other cloud tools, 2D/3D and repeated widget close/reopen. Also clear/disable during loading and verify actual SDK visibility results; recordings cannot establish terrain/scene rendering or browser performance.\n",
          "after": "\nUse the existing Node/TypeScript setup. Tests execute actual runtime toggles, the actual sight-hit branch and the typed factory with recording SDK models. The immutable fixture is test-only. In Experience Builder check observer placement, multiple targets, clear, toggle off/on, switching other cloud tools, 2D/3D and repeated widget close/reopen. Also clear/disable during loading and verify actual SDK visibility results; recordings cannot establish terrain/scene rendering or browser performance.\n\n## Viewshed tool\n\n`PointCloudViewshed.ts` owns pending observer-click revision, SDK analysis and its creating view/map/analysis collection. Runtime retains mode, point-cloud picking, tool exclusion and toasts, and binds the existing SDK constructor modules through a lazy typed factory. The SDK still calculates visibility.\n\n`pointCloudViewshedSpecification(point)` documents the unchanged policy: shifted longitude/latitude, picked map z plus 1.5 meters, WGS84 4326, 150-meter far distance, 360-degree horizontal field, 90-degree vertical field, heading 0 and tilt 0. This preserves the existing map height frame; it is not a new absolute/source-altitude conversion.\n\n- `place(point)` clears prior results immediately, then loads constructors. Only the newest enabled 3D view/map/analysis-collection context may construct and attach. Replaced or cleared requests cannot construct stale analyses; SDK constructor-side context changes are checked again before attachment.\n- `clear()` invalidates pending creation first, removes the current analysis from its original collection and destroys it. Repeated clear is safe without a current host view. Failed removal does not skip destruction.\n- `onViewChange(nextView)` clears attached or pending analysis before a different view/map/collection becomes current. Tool mode remains a runtime concern; selecting an observer on the new view starts a new analysis.\n\nNormal module paths, constructor properties, observer geometry read timing, replacement-before-load and tool state/toasts are preserved in baseline comparisons. Intentional lifetime corrections are newest-click guards, original-collection cleanup, SDK destruction, SceneView-only construction and contained current errors with silent stale failures. Existing conditional tool-exclusion rules are unchanged, including the measurement toggle's current sight-mode condition; this extraction does not redesign those rules.\n\n```sh\nnode tests/pointCloudViewshed.test.cjs\n```\n\nUse the existing Node/TypeScript setup. Tests execute the actual observer-hit branch and typed SDK factory, compare construction policy with the immutable baseline, and assert destruction separately as an intentional correction. Held module loads test newest-click behavior, clear/off/replacement, failures and retry. In Experience Builder check observer placement, repeated clicks, clear/toggle, other tools, 2D/3D and widget close/reopen with actual visibility results. Recorded SDK calls do not establish real scene/terrain occlusion or browser performance.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudViewshed",
        "## Viewshed tool"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudViewshed",
          "count": 2
        },
        {
          "text": "## Viewshed tool",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudViewshed.ts",
      "content": "/** Picked shifted ArcGIS coordinates; z is retained in the point-cloud map height frame. */\nexport interface ViewshedPick { longitude: number; latitude: number; z: number; }\nexport interface ViewshedSpecification {\n  observer: { longitude: number; latitude: number; z: number; spatialReference: { wkid: 4326 } };\n  farDistance: number; horizontalFieldOfView: number; verticalFieldOfView: number;\n  heading: number; tilt: number;\n}\n/** Preserve existing analysis policy: +1.5 m observer offset, 150 m range and degree angles.\n * This is the existing shifted map z plus offset, not an absolute/source-altitude conversion.\n */\nexport function pointCloudViewshedSpecification(point: ViewshedPick): ViewshedSpecification {\n  return {\n    observer: { longitude: point.longitude, latitude: point.latitude, z: point.z + 1.5, spatialReference: { wkid: 4326 } },\n    farDistance: 150, horizontalFieldOfView: 360, verticalFieldOfView: 90, heading: 0, tilt: 0,\n  };\n}\nexport interface ViewshedResource { destroy(): void; }\nexport interface ViewshedCollection<A> { add(analysis: A): unknown; remove(analysis: A): unknown; }\nexport interface ViewshedView<A> { type?: string; destroyed?: boolean; map?: unknown; analyses?: ViewshedCollection<A>; }\nexport interface PointCloudViewshedDependencies<A, V> {\n  read(): { enabled: boolean; view: V | null | undefined };\n  /** Load SDK constructors only; stale clicks must not construct detached analysis objects. */\n  loadFactory(): Promise<(specification: ViewshedSpecification) => A>;\n  warn(...args: unknown[]): void;\n}\n\n/** Owns pending click revision, analysis and its original view/map/collection.\n * Runtime owns mode, tool exclusion and picking. The SDK owns visibility calculation;\n * this feature adds no timers, point-cloud requests or alternative height policy.\n */\nexport class PointCloudViewshed<A extends ViewshedResource, V extends ViewshedView<A>> {\n  private analysis: A | null = null;\n  private context: { view: V; map: unknown; collection: ViewshedCollection<A> } | null = null;\n  private revision = 0;\n  /** Bind lazy state/SDK adapters without loading modules or starting analysis. */\n  constructor(private readonly dependencies: PointCloudViewshedDependencies<A, V>) {}\n\n  /** Newest observer click replaces prior results immediately, then loads constructors.\n   * Check enabled SceneView/map/collection/revision before and after SDK construction.\n   * Failed current requests are contained/retryable; stale requests remain silent.\n   */\n  async place(point: ViewshedPick): Promise<void> {\n    this.clear();\n    const { enabled, view } = this.dependencies.read();\n    if (!enabled || !view?.map || view.destroyed || view.type !== '3d' || !view.analyses) return;\n    const context = { view, map: view.map, collection: view.analyses };\n    this.context = context;\n    const revision = this.revision;\n    const current = () => {\n      const live = this.dependencies.read();\n      return revision === this.revision && live.enabled && live.view === view && !view.destroyed && view.type === '3d' && view.map === context.map && view.analyses === context.collection;\n    };\n    let created: A | null = null;\n    try {\n      const factory = await this.dependencies.loadFactory();\n      if (!current()) return;\n      created = factory(pointCloudViewshedSpecification(point));\n      if (!current()) { this.destroy(created); return; }\n      this.analysis = created;\n      context.collection.add(created);\n    } catch (error) {\n      const report = current();\n      if (created && this.analysis === created) this.clear();\n      else if (created) this.destroy(created);\n      if (report) this.dependencies.warn('Could not create viewshed analysis:', error);\n    }\n  }\n\n  /** Attempt SDK destruction independently of collection removal. */\n  private destroy(analysis: A): void {\n    try { analysis.destroy(); } catch (error) { this.dependencies.warn('Could not destroy viewshed analysis:', error); }\n  }\n\n  /** Invalidate pending construction first, then remove from the original collection and destroy.\n   * Clear is reusable/idempotent even after host view replacement or SDK cleanup errors.\n   */\n  clear(): void {\n    ++this.revision;\n    const analysis = this.analysis, context = this.context;\n    this.analysis = null; this.context = null;\n    if (!analysis) return;\n    try { context?.collection.remove(analysis); } catch (error) { this.dependencies.warn('Could not remove viewshed analysis:', error); }\n    this.destroy(analysis);\n  }\n\n  /** Release both pending and attached analysis before the host commits a different context. */\n  onViewChange(view: V): void {\n    const context = this.context;\n    if (context && (context.view !== view || context.map !== view.map || context.collection !== view.analyses)) this.clear();\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudViewshed.test.cjs",
      "content": "/** Compare actual old/new runtime factories, observer-hit branch and tool state.\n * Analysis destruction is an intentional lifetime improvement, asserted separately.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudViewshed.baseline.json','utf8'));\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudViewshed.ts','utf8')))(m,m.exports);const {PointCloudViewshed}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['clearViewshed','toggleViewshedMode','toggleMeasureMode','toggleLassoMode'];names.push(kind==='baseline'?'applyViewshedHit':'ensureViewshedOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplyViewshedHit(geom:any){\\n'+text.slice(text.indexOf('          // VIEWSHED MODE LOGIC'),text.indexOf('\\n          if (this._pointCloudViewerRenderer)',text.indexOf('          // VIEWSHED MODE LOGIC')))+'\\n}':'')}\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudViewshed','loadArcGISJSAPIModules','jsx','Icons','console',compile('class Harness{'+methods(kind)+'};return Harness;'));\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve()},point=(z=10)=>({longitude:20,latitude:30,z});\nfunction setup(kind,{hold=false,batched=false}={}){\n const trace=[],warnings=[],loads=[],analyses=[],views=[],patches=[],callbacks=[];\n class Point{constructor(properties){Object.assign(this,properties);trace.push(['point',structuredClone(properties)])}}\n class Viewshed{constructor(properties){Object.assign(this,properties);trace.push(['viewshed',structuredClone(properties)])}}\n class Analysis{constructor(properties){Object.assign(this,properties);this.id=analyses.length;analyses.push(this);trace.push(['analysis',this.id,structuredClone(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.id])}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Analysis,Viewshed,Point]);return d.promise};\n const Harness=classes[kind](PointCloudViewshed,load,(tag,props,...children)=>({tag,props:props||{},children}),{Viewshed:'viewshed',Measure:'measure'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))});const w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};const collection={items:[],add(a){this.items.push(a);trace.push(['add',views.indexOf(v),a.id])},remove(a){this.items=this.items.filter(x=>x!==a);trace.push(['remove',views.indexOf(v),a.id])}};v.analyses=collection;views.push(v);return v}\n w.state={jimuMapView:{view:view()},isViewshedMode:false,isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._viewshed=null;w._viewshedAnalysis=null;\n w.setState=(update,callback)=>{const run=()=>{const patch=typeof update==='function'?update(w.state):update;Object.assign(w.state,patch);trace.push(['state',structuredClone(patch)]);const task=callback?.();if(task?.then)callbacks.push(task)};if(batched)patches.push(run);else run()};w.flush=()=>{while(patches.length)patches.shift()()};w.showToast=(...args)=>trace.push(['toast',...args]);w.updateMeasurementGraphics=()=>trace.push(['measurement']);w._sight={clear:()=>trace.push(['clearSight'])};w.clearLasso=()=>trace.push(['clearLasso']);\n return {kind,w,trace,warnings,loads,analyses,views,view,Analysis,Viewshed,Point,hit:p=>w.applyViewshedHit(p),owner:()=>w.ensureViewshedOwner(),clear:()=>w.clearViewshed(),async settle(){w.flush();await flush();while(callbacks.length)await Promise.all(callbacks.splice(0));w.flush();await flush()}};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace.filter(x=>x[0]!=='destroy'),a.trace);assert.deepEqual(b.warnings,a.warnings);assert.deepEqual([b.w.state.isViewshedMode,b.w.state.isMeasureMode,b.w.state.isSightMode],[a.w.state.isViewshedMode,a.w.state.isMeasureMode,a.w.state.isSightMode]);assert.equal(b.trace.filter(x=>x[0]==='destroy').length,b.trace.filter(x=>x[0]==='remove').length);return {a,b}}\ntest('observer hit preserves module paths, constructor properties, +1.5 m offset, range and all angles',async()=>{await compare(async h=>{await h.w.toggleViewshedMode();await h.settle();h.hit(point());await h.settle();const v=h.analyses[0].viewsheds[0];assert.equal(v.observer.z,11.5);assert.equal(v.observer.spatialReference.wkid,4326);assert.deepEqual([v.farDistance,v.horizontalFieldOfView,v.verticalFieldOfView,v.heading,v.tilt],[150,360,90,0,0]);assert.equal(h.views[0].analyses.items.length,1)})});\ntest('repeated ordinary clicks replace one analysis before loading the next observer',async()=>{await compare(async h=>{h.w.state.isViewshedMode=true;h.hit(point(10));await h.settle();h.hit(point(20));await h.settle();assert.equal(h.views[0].analyses.items.length,1);assert.equal(h.analyses[1].viewsheds[0].observer.z,21.5)})});\ntest('clear and toggle off preserve mode/state behavior while new owner also destroys resources',async()=>{await compare(async h=>{await h.w.toggleViewshedMode();await h.settle();h.hit(point());await h.settle();h.clear();assert(h.w.state.isViewshedMode);h.hit(point());await h.settle();await h.w.toggleViewshedMode();await h.settle();assert(!h.w.state.isViewshedMode);assert.equal(h.views[0].analyses.items.length,0)})});\ntest('viewshed enable retains original measurement/sight exclusion and toast ordering',async()=>{await compare(async h=>{h.w.state.isMeasureMode=true;h.w.state.isSightMode=true;await h.w.toggleViewshedMode();await h.settle();assert(!h.w.state.isMeasureMode);assert(!h.w.state.isSightMode)})});\ntest('measure/lasso retain existing conditional viewshed exclusion and tool-state timing',async()=>{for(const method of ['toggleMeasureMode','toggleLassoMode'])for(const sight of [false,true])await compare(async h=>{h.w.state.isViewshedMode=true;h.w.state.isSightMode=sight;h.hit(point());await h.settle();h.w[method]();await h.settle();const cleared=method==='toggleLassoMode'||sight;assert.equal(h.w.state.isViewshedMode,!cleared);assert.equal(h.views[0].analyses.items.length,cleared?0:1)})});\ntest('batched toggle callbacks and geometry reads after module loading match normal baseline policy',async()=>{await compare(async h=>{await h.w.toggleViewshedMode();await h.settle();const p=point();h.hit(p);p.z=40;h.loads[0].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();assert.equal(h.analyses[0].viewsheds[0].observer.z,41.5)},{hold:true,batched:true})});\ntest('newest click wins when constructor modules resolve out of order',async()=>{const h=setup('working',{hold:true});h.w.state.isViewshedMode=true;h.hit(point(10));h.hit(point(20));h.loads[1].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();h.loads[0].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();assert.equal(h.analyses.length,1);assert.equal(h.analyses[0].viewsheds[0].observer.z,21.5)});\ntest('clear/off/teardown during loading prevents late constructor execution',async()=>{for(const mode of ['clear','off','view','map','collection','destroyed']){const h=setup('working',{hold:true});h.w.state.isViewshedMode=true;h.hit(point());if(mode==='clear')h.clear();if(mode==='off')h.w.state.isViewshedMode=false;if(mode==='view')h.w.state.jimuMapView={view:h.view()};if(mode==='map')h.w.state.jimuMapView.view.map={};if(mode==='collection')h.w.state.jimuMapView.view.analyses=h.view().analyses;if(mode==='destroyed')h.w.state.jimuMapView.view.destroyed=true;h.loads[0].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();assert.equal(h.analyses.length,0);assert.equal(h.trace.filter(x=>x[0]==='point').length,0)}});\ntest('clear removes from original collection after host state replacement and destroys only once',async()=>{const h=setup('working');h.w.state.isViewshedMode=true;h.hit(point());await h.settle();h.w.state.jimuMapView={view:h.view()};h.clear();h.clear();assert.equal(h.views[0].analyses.items.length,0);assert(h.analyses[0].destroyed);assert(h.trace.some(x=>x[0]==='remove'&&x[1]===0));assert(!h.trace.some(x=>x[0]==='remove'&&x[1]===1));assert.equal(h.trace.filter(x=>x[0]==='destroy').length,1)});\ntest('onViewChange releases attached or pending analysis before restoring host context',async()=>{for(const pending of [false,true]){const h=setup('working',{hold:pending});h.w.state.isViewshedMode=true;h.hit(point());if(!pending)await h.settle();h.owner().onViewChange(h.view());if(pending){h.loads[0].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();assert.equal(h.analyses.length,0)}else assert(h.analyses[0].destroyed)}});\ntest('invalid 2D/map/collection contexts do not load constructors',async()=>{for(const mode of ['2d','map','collection','missing']){const h=setup('working');h.w.state.isViewshedMode=true;if(mode==='2d')h.w.state.jimuMapView.view.type='2d';if(mode==='map')h.w.state.jimuMapView.view.map=null;if(mode==='collection')delete h.w.state.jimuMapView.view.analyses;if(mode==='missing')h.w.state.jimuMapView=null;h.hit(point());await h.settle();assert.equal(h.loads.length,0)}});\ntest('current module failure warns/retries while late rejection after clear stays silent',async()=>{for(const stale of [false,true]){const h=setup('working',{hold:true});h.w.state.isViewshedMode=true;h.hit(point());if(stale)h.clear();h.loads[0].reject(Error('module failure'));await h.settle();assert.equal(h.warnings.length,stale?0:1);h.hit(point());h.loads[1].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();assert.equal(h.analyses.length,1)}});\ntest('failed SDK attachment removes and destroys partially attached analysis before retry',async()=>{const h=setup('working'),c=h.views[0].analyses,add=c.add;h.w.state.isViewshedMode=true;c.add=function(a){add.call(this,a);throw Error('add failed')};h.hit(point());await h.settle();assert(h.analyses[0].destroyed);assert.equal(c.items.length,0);assert.equal(h.warnings.length,1);c.add=add;h.hit(point());await h.settle();assert.equal(c.items.length,1)});\ntest('collection removal failure cannot prevent destruction or reusable clear',async()=>{const h=setup('working');h.w.state.isViewshedMode=true;h.hit(point());await h.settle();h.views[0].analyses.remove=()=>{throw Error('old view disposed')};h.clear();h.clear();assert(h.analyses[0].destroyed);assert.equal(h.warnings.length,1);assert.equal(h.trace.filter(x=>x[0]==='destroy').length,1)});\ntest('constructor failure can retry and constructor-triggered replacement destroys unattached analysis',async()=>{for(const mode of ['throw','switch']){const h=setup('working',{hold:true});h.w.state.isViewshedMode=true;h.hit(point());class Analysis extends h.Analysis{constructor(properties){if(mode==='throw')throw Error('constructor failed');super(properties);h.w.state.jimuMapView={view:h.view()}}}h.loads[0].resolve([Analysis,h.Viewshed,h.Point]);await h.settle();if(mode==='switch'){assert(h.analyses[0].destroyed);assert(!h.trace.some(x=>x[0]==='add'))}else assert.equal(h.warnings.length,1);h.hit(point());h.loads[1].resolve([h.Analysis,h.Viewshed,h.Point]);await h.settle();assert.equal(h.w.state.jimuMapView.view.analyses.items.length,1)}});\n"
    },
    {
      "file": "tests/fixtures/pointCloudViewshed.baseline.json",
      "content": "{\n  \"description\": \"Immutable pre-extraction viewshed clear/toggles and actual observer-hit branch; test-only.\",\n  \"source\": \"class Widget{\\nprivate clearViewshed = () => {\\n    if (this._viewshedAnalysis && this.state.jimuMapView) {\\n      // Cast to 'any' to bypass the TypeScript error for .analyses on MapView\\n      const view = this.state.jimuMapView.view as any;\\n      if (view.analyses) {\\n        view.analyses.remove(this._viewshedAnalysis);\\n      }\\n      this._viewshedAnalysis = null;\\n    }\\n  };\\nprivate toggleViewshedMode = async () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMode = !prev.isViewshedMode;\\n        const updates: any = { isViewshedMode: nextMode };\\n\\n        // Prevent clashes: Automatically turn off other tools\\n        if (nextMode) {\\n          if (prev.isMeasureMode) {\\n            updates.isMeasureMode = false;\\n            updates.measurePoints = [];\\n            this.updateMeasurementGraphics();\\n          }\\n          if (prev.isSightMode) {\\n            updates.isSightMode = false;\\n            updates.sightObserver = null;\\n            updates.sightTargets = [];\\n            this._sight?.clear();\\n          }\\n        }\\n        return updates;\\n      },\\n      () => {\\n        if (this.state.isViewshedMode) {\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Viewshed size={14} /> 360\u00b0 Viewshed Mode: Click on the point cloud to drop an observer.\\n            </span>,\\n            4000,\\n          );\\n        } else {\\n          this.clearViewshed();\\n        }\\n      },\\n    );\\n  };\\nprivate toggleMeasureMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMeasure = !prev.isMeasureMode;\\n        const updates: any = {\\n          isMeasureMode: nextMeasure,\\n          measurePoints: [],\\n        };\\n\\n        // Prevent clash: Automatically turn off Sight Mode if it was on\\n        if (nextMeasure && prev.isSightMode) {\\n          updates.isSightMode = false;\\n          updates.sightObserver = null;\\n          updates.sightTargets = [];\\n          this._sight?.clear();\\n          updates.isViewshedMode = false; // Turn off viewshed\\n          this.clearViewshed(); // Remove the red/green graphics\\n        }\\n        return updates;\\n      },\\n      () => {\\n        this.updateMeasurementGraphics();\\n        if (this.state.isMeasureMode) {\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.\\n            </span>,\\n            3000,\\n          );\\n        }\\n      },\\n    );\\n  };\\nprivate toggleLassoMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMode = !prev.isLassoMode;\\n        const updates: any = {\\n          isLassoMode: nextMode,\\n          lassoPolygon: [],\\n          lassoSelectedObjectIds: [],\\n        };\\n\\n        // Prevent clashes with other 3D tools. Auto-disable them if Lasso is activated.\\n        if (nextMode) {\\n          if (prev.isMeasureMode) {\\n            updates.isMeasureMode = false;\\n            updates.measurePoints = [];\\n            this.updateMeasurementGraphics();\\n          }\\n          if (prev.isSightMode) {\\n            updates.isSightMode = false;\\n            updates.sightObserver = null;\\n            updates.sightTargets = [];\\n            this._sight?.clear();\\n          }\\n          if (prev.isViewshedMode) {\\n            updates.isViewshedMode = false;\\n            this.clearViewshed();\\n          }\\n        }\\n        return updates;\\n      },\\n      () => {\\n        if (this.state.isLassoMode) {\\n          this.showToast(<span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);\\n        } else {\\n          this.clearLasso();\\n        }\\n      },\\n    );\\n  };\\napplyViewshedHit(geom:any){\\n          // VIEWSHED MODE LOGIC\\n          if (this.state.isViewshedMode && this.state.jimuMapView) {\\n            this.clearViewshed();\\n            loadArcGISJSAPIModules([\\\"esri/analysis/ViewshedAnalysis\\\", \\\"esri/analysis/Viewshed\\\", \\\"esri/geometry/Point\\\"]).then(([ViewshedAnalysis, Viewshed, Point]) => {\\n              const viewshed = new Viewshed({\\n                observer: new Point({\\n                  longitude: geom.longitude,\\n                  latitude: geom.latitude,\\n                  z: geom.z + 1.5,\\n                  spatialReference: { wkid: 4326 },\\n                }),\\n                farDistance: 150,\\n                horizontalFieldOfView: 360,\\n                verticalFieldOfView: 90,\\n                heading: 0,\\n                tilt: 0,\\n              });\\n\\n              this._viewshedAnalysis = new ViewshedAnalysis({\\n                viewsheds: [viewshed],\\n              });\\n\\n              const view = this.state.jimuMapView!.view as any;\\n              if (view.type === \\\"3d\\\" && view.analyses) {\\n                view.analyses.add(this._viewshedAnalysis);\\n              }\\n            });\\n            return;\\n          }\\n\\n}\\n}\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-viewshed-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-viewshed.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited viewshed references remain)');
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
    console.log(uninstall ? 'Point-cloud viewshed is already uninstalled. No files changed.' : 'Point-cloud viewshed is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-viewshed', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud viewshed ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Viewshed policy and SDK analysis lifetime now have a typed owner with guarded observer clicks and original-collection cleanup. Existing tool rules and visibility settings are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
