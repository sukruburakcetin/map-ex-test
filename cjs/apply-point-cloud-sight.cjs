#!/usr/bin/env node
'use strict';
/** Point-cloud sight installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud sight block 1",
          "before": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudLasso } from '../features/point-cloud/PointCloudLasso';\nimport { selectLassoIndices } from '../features/point-cloud/lassoProjection';\n",
          "after": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudSight } from '../features/point-cloud/PointCloudSight';\nimport { PointCloudLasso } from '../features/point-cloud/PointCloudLasso';\nimport { selectLassoIndices } from '../features/point-cloud/lassoProjection';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 2",
          "before": "  lassoSelectedObjectIds: number[];\n  isSightMode: boolean;\n  sightObserver: any | null;\n  sightTargets: any[];\n  isViewshedMode: boolean;\n  nearbyImages?: NearbyImage[];\n",
          "after": "  lassoSelectedObjectIds: number[];\n  isSightMode: boolean;\n  sightObserver: __esri.Point | null;\n  sightTargets: __esri.Point[];\n  isViewshedMode: boolean;\n  nearbyImages?: NearbyImage[];\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 3",
          "before": "\n  private _measurement: PointCloudMeasurement<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _sightViewModel: any = null;\n  private _viewshedAnalysis: any = null;\n  private _gridLayer: __esri.GraphicsLayer | null = null;\n",
          "after": "\n  private _measurement: PointCloudMeasurement<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _sight: PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point> | null = null;\n  private _viewshedAnalysis: any = null;\n  private _gridLayer: __esri.GraphicsLayer | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 4",
          "before": "    this._directionBindings?.clear();\n\n    if (this._sightViewModel) {\n      this._sightViewModel.clear();\n      this._sightViewModel = null;\n    }\n\n    if (this._viewshedAnalysis) {\n",
          "after": "    this._directionBindings?.clear();\n\n    this._sight?.dispose();\n\n    if (this._viewshedAnalysis) {\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 5",
          "before": "    // Line of Sight\n    if (this.state.isSightMode) {\n      if (this._sightViewModel) this._sightViewModel.clear();\n      this.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });\n    }\n",
          "after": "    // Line of Sight\n    if (this.state.isSightMode) {\n      this._sight?.clear();\n      this.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });\n    }\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 6",
          "before": "  }, 150);\n\n  /**\n   * Toggles the 3D Line of Sight Mode on and off.\n",
          "after": "  }, 150);\n\n  /** Bind the SceneView-only SDK constructor and live point/state adapters once. */\n  private ensureSightOwner() {\n    return this._sight ??= new PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point>({\n      read: () => ({ view: this.state.jimuMapView?.view, enabled: this.state.isSightMode,\n        observer: this.state.sightObserver, targets: this.state.sightTargets }),\n      loadFactory: async () => {\n        const [LineOfSightViewModel] = await loadArcGISJSAPIModules(['esri/widgets/LineOfSight/LineOfSightViewModel']);\n        // The owner validates 3D before invoking this constructor.\n        return view => new LineOfSightViewModel({ view: view as __esri.SceneView }) as __esri.LineOfSightViewModel;\n      },\n      setObserver: (model, point) => { model.observer = point; },\n      addTarget: (model, point) => {\n        // Preserve the existing SDK collection autocast from target properties.\n        const targets = model.targets as unknown as { add(properties: __esri.LineOfSightTargetProperties): unknown };\n        targets.add({ location: point });\n      },\n      onObserver: point => this.setState({ sightObserver: point }),\n      onTarget: point => this.setState(prev => ({ sightTargets: [...prev.sightTargets, point] })),\n      warn: (...args) => console.warn(...args),\n    });\n  }\n\n  /**\n   * Toggles the 3D Line of Sight Mode on and off.\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 7",
          "before": "          this.showToast(<span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);\n\n          if (!this._sightViewModel && this.state.jimuMapView) {\n            try {\n              const [LineOfSightViewModel] = await loadArcGISJSAPIModules([\"esri/widgets/LineOfSight/LineOfSightViewModel\"]);\n              this._sightViewModel = new LineOfSightViewModel({\n                view: this.state.jimuMapView.view,\n              });\n            } catch (e) {\n              console.warn(\"Could not load LineOfSightViewModel\", e);\n            }\n          }\n        } else {\n          this.clearSight();\n",
          "after": "          this.showToast(<span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);\n\n          await this.ensureSightOwner().activate();\n        } else {\n          this.clearSight();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 8",
          "before": "  private clearSight = () => {\n    this.setState({ sightObserver: null, sightTargets: [] });\n    if (this._sightViewModel) {\n      this._sightViewModel.clear();\n    }\n  };\n\n",
          "after": "  private clearSight = () => {\n    this.setState({ sightObserver: null, sightTargets: [] });\n    this._sight?.clear();\n  };\n\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 9",
          "before": "            updates.sightObserver = null;\n            updates.sightTargets = [];\n            if (this._sightViewModel) this._sightViewModel.clear();\n          }\n        }\n",
          "after": "            updates.sightObserver = null;\n            updates.sightTargets = [];\n            this._sight?.clear();\n          }\n        }\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 10",
          "before": "          updates.sightObserver = null;\n          updates.sightTargets = [];\n          if (this._sightViewModel) {\n            this._sightViewModel.clear();\n          }\n          updates.isViewshedMode = false; // Turn off viewshed\n          this.clearViewshed(); // Remove the red/green graphics\n",
          "after": "          updates.sightObserver = null;\n          updates.sightTargets = [];\n          this._sight?.clear();\n          updates.isViewshedMode = false; // Turn off viewshed\n          this.clearViewshed(); // Remove the red/green graphics\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 11",
          "before": "            updates.sightObserver = null;\n            updates.sightTargets = [];\n            if (this._sightViewModel) this._sightViewModel.clear();\n          }\n          if (prev.isViewshedMode) {\n",
          "after": "            updates.sightObserver = null;\n            updates.sightTargets = [];\n            this._sight?.clear();\n          }\n          if (prev.isViewshedMode) {\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 12",
          "before": "    this._pointCloudAdaptiveDisplay?.dispose();\n    this._lasso?.clear();\n    this._measurement?.onViewChange(view);\n    this._pointCloudAcquisition.cancel('view-transfer');\n",
          "after": "    this._pointCloudAdaptiveDisplay?.dispose();\n    this._lasso?.clear();\n    this._sight?.onViewChange(view);\n    this._measurement?.onViewChange(view);\n    this._pointCloudAcquisition.cancel('view-transfer');\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 13",
          "before": "            else this.clearPointCloud(true);\n          }\n          if (this.state.isMeasureMode && this.state.measurePoints.length) void this.updateMeasurementGraphics();\n          void this.syncSharedFieldNotes();\n",
          "after": "            else this.clearPointCloud(true);\n          }\n          if (this.state.isSightMode && view.type === \"3d\") void this.ensureSightOwner().activate();\n          if (this.state.isMeasureMode && this.state.measurePoints.length) void this.updateMeasurementGraphics();\n          void this.syncSharedFieldNotes();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud sight block 14",
          "before": "\n          // SIGHT MODE\n          if (this.state.isSightMode && this._sightViewModel) {\n            if (!this.state.sightObserver) {\n              this.setState({ sightObserver: geom });\n              this._sightViewModel.observer = geom;\n            } else {\n              this.setState((prev) => ({ sightTargets: [...prev.sightTargets, geom] }));\n              this._sightViewModel.targets.add({ location: geom });\n            }\n            return;\n          }\n",
          "after": "\n          // SIGHT MODE\n          if (this.state.isSightMode && this._sight?.ready) {\n            this._sight.place(geom);\n            return;\n          }\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudSight",
        "ensureSightOwner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudSight",
          "count": 4
        },
        {
          "text": "ensureSightOwner",
          "count": 3
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud sight block 1",
          "before": "| Lasso pointer/capture and current/pending map highlight | `src/features/point-cloud/PointCloudLasso.ts` |\n| Lasso numerical projection and filtered-viewer index selection | `src/features/point-cloud/lassoProjection.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n",
          "after": "| Lasso pointer/capture and current/pending map highlight | `src/features/point-cloud/PointCloudLasso.ts` |\n| Lasso numerical projection and filtered-viewer index selection | `src/features/point-cloud/lassoProjection.ts` |\n| Line-of-sight model, pending activation and creating-view/map lifetime | `src/features/point-cloud/PointCloudSight.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud sight block 2",
          "before": "\nNormal single-pointer mouse/touch behavior, coordinate units, CSS projection, padding, polygon tests and index mappings are preserved. Lifecycle corrections add pointer cancellation/capture cleanup, active-pointer isolation, pending-request guards and safe repeated cleanup. No shader-policy, tool-toggle, selection-math or UI-layout change is included. Existing renderer tests retain their immutable baseline and compare the moved math and unchanged commit; `tests/pointCloudLasso.test.cjs` separately compares normal behavior and exercises cancellation/stale callbacks. Physical-device touch and actual SDK rendering still need host smoke checks.\n",
          "after": "\nNormal single-pointer mouse/touch behavior, coordinate units, CSS projection, padding, polygon tests and index mappings are preserved. Lifecycle corrections add pointer cancellation/capture cleanup, active-pointer isolation, pending-request guards and safe repeated cleanup. No shader-policy, tool-toggle, selection-math or UI-layout change is included. Existing renderer tests retain their immutable baseline and compare the moved math and unchanged commit; `tests/pointCloudLasso.test.cjs` separately compares normal behavior and exercises cancellation/stale callbacks. Physical-device touch and actual SDK rendering still need host smoke checks.\n\n## Line-of-sight lifetime\n\n`PointCloudSight.ts` owns the SDK view model, creating view/map and pending activation revision. Runtime owns enabled intent, observer/target React state, point-cloud hit geometry and UI/tool exclusion. The raw `any` view-model field is removed, and observer/target state is typed as ArcGIS points. SDK load, observer assignment and target-properties autocast are explicit typed runtime adapters.\n\nActivation loads a factory, then checks current enabled SceneView/map/revision before construction. Multiple current-view activations share loading. A post-constructor guard releases a model if synchronous host activity replaced its context. Current module/constructor failures are reported locally; stale failures remain silent and retry is allowed. Clear invalidates pending activation even when no model exists.\n\nExisting observer/target updates retain the same state-before-SDK ordering and original picked geometry identity, including relative z and spatial reference. The SDK remains responsible for visibility analysis. No source-altitude conversion, ground-height correction, point-array copy, timer, animation loop or point-cloud acquisition is added.\n\nClear retains a reusable current model; widget cleanup clears/destroys it and drops ownership first. View/map replacement disposes the old model before host state transfer. After a new 3D view becomes ready, active intent may restore existing observer/targets to a new model without replaying React target callbacks. Picking is gated by current model/view/map readiness, so old models cannot accept points after replacement or disabling.\n\nIntentional corrections are constructor-load cancellation guards, shared activation, SceneView-only construction, original-model destruction, current-view pick validation, restoration and contained failures. Normal tool state/toasts, clear/reuse and mutual-exclusion behavior are preserved in baseline comparisons. `tests/pointCloudSight.test.cjs` executes real toggle/clear/SDK adapters and the actual hit branch; host validation must still verify real SDK occlusion and terrain/scene behavior.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudSight",
        "## Line-of-sight lifetime"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudSight",
          "count": 2
        },
        {
          "text": "## Line-of-sight lifetime",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud sight block 1",
          "before": "Validation: 15 lasso cases plus the existing 101 geometry/acquisition/map/viewer/measurement/playback cases (116 total). The owner, pure projection and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; SVG targets satisfy the pointer boundary. Tests verify mathematical tokens against the original renderer fixture, numerical selection across shapes/poses, CSS dimensions, sparse confirmed IDs, batched input, feedback order, cancellation, out-of-order requests, replacement and teardown. Host smoke checks still require mouse/touch drawing, clear/cancel, crop/calibration, fullscreen, 2D/3D and close/reopen.\n\nNext: move line-of-sight analysis resource ownership and cancellation as its own tool feature. Keep viewshed separate, preserve tool exclusion and distinguish SDK view-model ownership from React tool intent. Continue reducing runtime coordination only when its feature contracts and validation remain clear.\n",
          "after": "Validation: 15 lasso cases plus the existing 101 geometry/acquisition/map/viewer/measurement/playback cases (116 total). The owner, pure projection and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; SVG targets satisfy the pointer boundary. Tests verify mathematical tokens against the original renderer fixture, numerical selection across shapes/poses, CSS dimensions, sparse confirmed IDs, batched input, feedback order, cancellation, out-of-order requests, replacement and teardown. Host smoke checks still require mouse/touch drawing, clear/cancel, crop/calibration, fullscreen, 2D/3D and close/reopen.\n\nLine-of-sight ownership and pending-load guards are completed below. Keep viewshed separate, preserve tool exclusion and distinguish SDK view-model ownership from React tool intent. Continue reducing runtime coordination only when its feature contracts and validation remain clear.\n\n## Line-of-sight SDK owner\n\n`PointCloudSight.ts` now owns line-of-sight view-model creation, pending activation, observer/target SDK mutation, creating-view/map identity, clear and destroy. Runtime retains React tool intent, typed ArcGIS point state, picking, toasts and tool exclusion through a typed lazy factory. The old `any` view-model field is removed without a mirror.\n\nNormal observer/target geometry and state-before-SDK order, clear/reuse, module path, toasts and tool exclusion are preserved. Intentional lifecycle corrections prevent construction after clear/disable/replacement, share current activation, enforce SceneView-only construction, destroy the original model on teardown, reject picks against old views and restore retained samples after readiness without duplicate React targets. Current SDK errors are contained/retryable; stale failures are ignored. The SDK still performs all visibility analysis.\n\nFunction comments document borrowed map geometry/z/spatial reference, React intent versus SDK authority, constructor-factory guards, sample restoration, clear versus dispose and failure handling. No timers, animation loops, geometry math or point-cloud requests are added. Runtime is 14,050 lines: this small boundary adds three net lines because typed SDK/state adapters replace implicit `any` operations. Clear feature ownership takes priority over reducing every increment's line count. Another 283 method/callback bodies remain token-identical.\n\n| File | Change |\n| --- | --- |\n| `src/runtime/widget.tsx` | Typed sight factory/state, SDK mutation forwarding, view readiness and cleanup hooks |\n| `src/features/point-cloud/PointCloudSight.ts` | SDK model and guarded activation/view-map lifetime |\n| `src/features/point-cloud/README.md` | Sight entry point, SDK contracts and test command |\n| `docs/POINT-CLOUD-OWNERSHIP.md` | Sight authority, lifecycle corrections and validation limits |\n| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |\n| `tests/pointCloudSight.test.cjs` | Real runtime toggle/hit/adapter comparisons and lifetime regressions |\n| `tests/fixtures/pointCloudSight.baseline.json` | Immutable pre-extraction toggles/clear and actual hit branch |\n\nValidation: 17 sight cases plus the existing 116 geometry/acquisition/map/viewer/measurement/lasso/playback cases (133 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover normal state/SDK ordering and geometry identity, exclusion, batched updates, failures/retry, concurrent activation, clear/disable during loading, constructor-side replacement, restoration, cleanup errors and old-view pick rejection. Host smoke checks still need observer/multiple targets, clear/toggle, other tools, 2D/3D and close/reopen with real visibility results.\n\nNext: extract viewshed resource ownership, async creation and cleanup separately. Keep its observer-height, angle, distance and SDK analysis policy unchanged, with explicit original-view cleanup and stale-load rejection. Then review the remaining point-cloud renderer-policy and ring/grid responsibilities for cohesive contributor entry points.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudSight",
        "## Line-of-sight SDK owner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudSight",
          "count": 2
        },
        {
          "text": "## Line-of-sight SDK owner",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud sight block 1",
          "before": "| Lasso pointer capture and asynchronous map highlight lifetime | `PointCloudLasso.ts` |\n| Lasso raw-point projection, ray casting and viewer-index selection | `lassoProjection.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n",
          "after": "| Lasso pointer capture and asynchronous map highlight lifetime | `PointCloudLasso.ts` |\n| Lasso raw-point projection, ray casting and viewer-index selection | `lassoProjection.ts` |\n| Line-of-sight SDK model, activation, observer/target mutation and teardown | `PointCloudSight.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud sight block 2",
          "before": "\nUse the existing Node/TypeScript setup. Tests compare real old/new runtime adapters for projection, polygon input, sparse IDs, feedback order and batched updates; held layer-view promises cover stale results and cleanup. In Experience Builder test mouse/touch drawing, clear during drawing, cancel gestures, repeated selection, crop/calibration, view switches, fullscreen, cloud clear and widget close/reopen. Recording tests do not establish browser/GPU performance or touch behavior on physical devices.\n",
          "after": "\nUse the existing Node/TypeScript setup. Tests compare real old/new runtime adapters for projection, polygon input, sparse IDs, feedback order and batched updates; held layer-view promises cover stale results and cleanup. In Experience Builder test mouse/touch drawing, clear during drawing, cancel gestures, repeated selection, crop/calibration, view switches, fullscreen, cloud clear and widget close/reopen. Recording tests do not establish browser/GPU performance or touch behavior on physical devices.\n\n## Line-of-sight tool\n\n`PointCloudSight.ts` owns the SDK `LineOfSightViewModel`, its creating view/map and pending constructor-module task. Runtime retains `isSightMode`, typed ArcGIS observer/target points, point-cloud picking, tool exclusion, toasts and state callbacks. The SDK continues to calculate visibility; this feature introduces no visibility formula, coordinate conversion or height adjustment.\n\n- `activate()` loads constructors lazily, shares current-view activation and checks enabled 3D view/map/revision before invoking the factory. Clear, disable, disposal and replacement prevent late construction. Current module/constructor errors warn locally and allow retry.\n- `ready` gates picking on a model belonging to the current enabled SceneView and map. `place(point)` preserves state-before-SDK observer/target order and borrows the exact picked ArcGIS point, including z/spatial reference.\n- `clear()` cancels pending construction and clears analysis results while retaining a reusable current model. React observer/target reset remains in the runtime adapter.\n- `onViewChange(nextView)` disposes a model or pending activation belonging to another view/map. After host readiness, active 3D intent may activate a new model and restore existing samples through SDK setters only; this does not append duplicate React targets.\n- `dispose()` drops authority and invalidates pending work before attempting both SDK clear and destroy. It is reusable/idempotent and keeps one failing cleanup operation from skipping the other.\n\nThe SDK factory validates SceneView usage at the owner boundary. Its target adapter preserves the existing collection autocast from `LineOfSightTargetProperties`; it does not replace the collection or introduce a separate target constructor/module request. Points remain shifted map geometry in the same spatial reference/height policy as the picked point cloud; raw SfM measurement/lasso calculations are unrelated.\n\nIntentional lifecycle corrections are stale-load rejection, shared activation, 3D-only creation, original-model destruction, current-view pick validation, replacement restoration and contained current SDK errors. Normal toasts, observer/target state order, clear/reuse and tool-exclusion behavior are compared against the pre-extraction code. No tool layout or viewshed analysis policy changes are included.\n\n```sh\nnode tests/pointCloudSight.test.cjs\n```\n\nUse the existing Node/TypeScript setup. Tests execute actual runtime toggles, the actual sight-hit branch and the typed factory with recording SDK models. The immutable fixture is test-only. In Experience Builder check observer placement, multiple targets, clear, toggle off/on, switching other cloud tools, 2D/3D and repeated widget close/reopen. Also clear/disable during loading and verify actual SDK visibility results; recordings cannot establish terrain/scene rendering or browser performance.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudSight",
        "## Line-of-sight tool"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudSight",
          "count": 2
        },
        {
          "text": "## Line-of-sight tool",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudSight.ts",
      "content": "/** SDK line-of-sight belongs to a live SceneView/map, independently of React tool state. */\nexport interface SightView { type?: string; destroyed?: boolean; map?: unknown; }\nexport interface SightModel { clear(): void; destroy(): void; }\nexport interface SightState<V, P> {\n  view: V | null | undefined;\n  enabled: boolean;\n  observer: P | null;\n  targets: readonly P[];\n}\nexport interface PointCloudSightDependencies<M, V, P> {\n  read(): SightState<V, P>;\n  /** Load constructors only; stale module completion must not construct against an old view. */\n  loadFactory(): Promise<(view: V) => M>;\n  setObserver(model: M, point: P): void;\n  addTarget(model: M, point: P): void;\n  onObserver(point: P): void;\n  onTarget(point: P): void;\n  warn(...args: unknown[]): void;\n}\n\n/** Owns one SDK view model, its creating view/map and a guarded module-load task.\n * Runtime owns tool intent, picked point geometry and React state. The SDK continues\n * to perform the visibility analysis; this owner adds no timers or analysis math.\n */\nexport class PointCloudSight<M extends SightModel, V extends SightView, P> {\n  private model: M | null = null;\n  private view: V | null = null;\n  private map: unknown = null;\n  private revision = 0;\n  private pending: { view: V; map: unknown; promise: Promise<void> } | null = null;\n  /** Bind lazy SDK/state adapters; construction loads no modules and creates no analysis. */\n  constructor(private readonly dependencies: PointCloudSightDependencies<M, V, P>) {}\n\n  /** Picking may mutate only a model belonging to the live enabled 3D view and map. */\n  get ready(): boolean {\n    const state = this.dependencies.read();\n    return !!this.model && this.view === state.view && this.valid(state) && this.map === state.view?.map;\n  }\n\n  /** Gate SceneView-only SDK construction without changing the host's tool UI state. */\n  private valid(state: SightState<V, P>): boolean {\n    return !!(state.enabled && state.view?.map && !state.view.destroyed && state.view.type === '3d');\n  }\n\n  /** Share pending activation; validate before constructor execution and after creation.\n   * Current SDK failures warn locally and remain retryable. Superseded/cleared loads\n   * cannot create or restore analysis. Existing picked points restore on a new view\n   * through SDK adapters only, without replaying React observer/target callbacks.\n   */\n  async activate(): Promise<void> {\n    const state = this.dependencies.read();\n    if (!state.view) return;\n    this.onViewChange(state.view);\n    if (!this.valid(state) || this.ready) return;\n    const view = state.view, map = view.map;\n    if (this.pending?.view === view && this.pending.map === map) { await this.pending.promise; return; }\n    const revision = ++this.revision;\n    const current = () => {\n      const live = this.dependencies.read();\n      return revision === this.revision && this.valid(live) && live.view === view && view.map === map;\n    };\n    const promise = (async () => {\n      try {\n        const factory = await this.dependencies.loadFactory();\n        if (!current()) return;\n        const model = factory(view);\n        if (!current()) { this.release(model); return; }\n        this.model = model; this.view = view; this.map = map;\n        const live = this.dependencies.read();\n        try {\n          if (live.observer) this.dependencies.setObserver(model, live.observer);\n          for (const point of live.targets) this.dependencies.addTarget(model, point);\n        } catch (error) { this.dispose(); this.dependencies.warn('Could not restore line of sight:', error); }\n      } catch (error) {\n        if (current()) this.dependencies.warn('Could not load LineOfSightViewModel', error);\n      }\n    })();\n    const pending = { view, map, promise }; this.pending = pending;\n    try { await promise; } finally { if (this.pending === pending) this.pending = null; }\n  }\n\n  /** Preserve pick order: update React observer/target state before SDK mutation.\n   * Borrow the same shifted ArcGIS point (including z/spatial reference); no raw SfM\n   * conversion, height adjustment or point copy is introduced here.\n   */\n  place(point: P): void {\n    if (!this.ready || !this.model) return;\n    const model = this.model, state = this.dependencies.read();\n    try {\n      if (!state.observer) { this.dependencies.onObserver(point); this.dependencies.setObserver(model, point); }\n      else { this.dependencies.onTarget(point); this.dependencies.addTarget(model, point); }\n    } catch (error) { this.dependencies.warn('Could not update line of sight:', error); }\n  }\n\n  /** Invalidate pending construction and clear results while retaining a reusable current model. */\n  clear(): void {\n    ++this.revision; this.pending = null;\n    if (this.model) {\n      try { this.model.clear(); } catch (error) { this.dependencies.warn('Could not clear line of sight:', error); }\n    }\n  }\n\n  /** Release analysis bound to a replaced view/map before the host commits that view. */\n  onViewChange(view: V): void {\n    if ((this.view && (this.view !== view || this.map !== view.map)) || (this.pending && (this.pending.view !== view || this.pending.map !== view.map))) this.dispose();\n  }\n\n  /** Always attempt both SDK clear and destroy; one failure must not skip the other. */\n  private release(model: M): void {\n    try { model.clear(); } catch (error) { this.dependencies.warn('Could not clear line of sight:', error); }\n    try { model.destroy(); } catch (error) { this.dependencies.warn('Could not destroy line of sight:', error); }\n  }\n\n  /** Reusable teardown invalidates loading first and drops authority before SDK destruction. */\n  dispose(): void {\n    ++this.revision; this.pending = null;\n    const model = this.model; this.model = null; this.view = null; this.map = null;\n    if (model) this.release(model);\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudSight.test.cjs",
      "content": "/** Execute original/current runtime toggles, hit branches and SDK adapters.\n * Held module loads expose stale activation without loading a browser or ArcGIS.\n */\nconst fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudSight.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudSight.ts','utf8')))(m,m.exports);const {PointCloudSight}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleSightMode','clearSight','toggleMeasureMode','toggleViewshedMode','toggleLassoMode'];if(kind==='baseline')names.push('applySightHit');else names.push('ensureSightOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplySightHit(geom:any){\\n'+text.slice(text.indexOf('          // SIGHT MODE'),text.indexOf('          // VIEWSHED MODE LOGIC'))+'\\n}':'')}\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve()};\nconst point=(id=1)=>({type:'point',longitude:10+id,latitude:20+id,z:30+id,spatialReference:{wkid:4326}});\nfunction setup(kind,{hold=false,batched=false}={}){\n const trace=[],models=[],loads=[],callbacks=[],patches=[],warnings=[],views=[];let w;\n class Model{constructor(properties){this.view=properties.view;this.id=models.length;this.targets={add:properties=>{this.points.push(properties.location);trace.push(['target',this.id,properties])}};this.points=[];models.push(this);trace.push(['create',this.id,views.indexOf(this.view)])}set observer(value){this.observerValue=value;trace.push(['observer',this.id,value])}clear(){trace.push(['clear',this.id]);this.points=[];this.observerValue=null}destroy(){trace.push(['destroy',this.id]);this.destroyed=true}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Model]);return d.promise};\n const Harness=new Function('PointCloudSight','loadArcGISJSAPIModules','jsx','Icons','console',compile('class Harness{'+methods(kind)+'};return Harness;'))(PointCloudSight,load,(tag,props,...children)=>({tag,props:props||{},children}),{Measure:'measure',Viewshed:'viewshed'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))});w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};views.push(v);return v}\n w.state={jimuMapView:{view:view()},isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isViewshedMode:false,isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._sight=null;w._sightViewModel=null;\n w.setState=(update,callback)=>{const run=()=>{const patch=typeof update==='function'?update(w.state):update;Object.assign(w.state,patch);trace.push(['state',structuredClone(patch)]);const task=callback?.();if(task?.then)callbacks.push(task)};if(batched)patches.push(run);else run()};w.flush=()=>{while(patches.length)patches.shift()()};\n w.updateMeasurementGraphics=()=>trace.push(['measurement']);w.showToast=(...args)=>trace.push(['toast',...args]);w.clearViewshed=()=>trace.push(['clearViewshed']);w.clearLasso=()=>trace.push(['clearLasso']);\n const h={kind,w,trace,models,loads,warnings,view,Model,activate:()=>w.toggleSightMode(),place:p=>w.applySightHit(p),clear:()=>w.clearSight(),ready:()=>kind==='baseline'?!!w._sightViewModel:!!w._sight?.ready,owner:()=>w.ensureSightOwner(),async settle(){w.flush();await flush();while(callbacks.length)await Promise.all(callbacks.splice(0));w.flush();await flush()}};return h;\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.warnings,a.warnings);assert.deepEqual(b.w.state,a.w.state);return{a,b}}\ntest('normal activation keeps module path, toast, observer/target state-before-SDK order and point identity',async()=>{await compare(async h=>{h.activate();await h.settle();assert(h.ready());const a=point(1),b=point(2);h.place(a);h.place(b);assert.equal(h.models[0].observerValue,a);assert.equal(h.models[0].points[0],b);assert.equal(h.w.state.sightObserver,a);assert.equal(h.w.state.sightTargets[0],b);assert.deepEqual(h.models[0].points[0].spatialReference,{wkid:4326})})});\ntest('clear and toggle off/on reuse current model and preserve observer/target reset',async()=>{await compare(async h=>{h.activate();await h.settle();h.place(point());h.clear();h.place(point(2));h.activate();await h.settle();assert(!h.w.state.isSightMode);h.activate();await h.settle();assert.equal(h.models.length,1);assert.equal(h.loads.length,1);h.place(point(3));assert.equal(h.models[0].observerValue.longitude,13)})});\ntest('enabling sight clears measurement through the original callback order and leaves other intent unchanged',async()=>{await compare(async h=>{h.w.state.isMeasureMode=true;h.w.state.measurePoints=[{old:true}];h.w.state.isViewshedMode=true;h.activate();await h.settle();assert(!h.w.state.isMeasureMode);assert.deepEqual(h.w.state.measurePoints,[]);assert(h.w.state.isViewshedMode)})});\ntest('measurement, viewshed and lasso exclusion preserve sight clear and state behavior',async()=>{for(const method of ['toggleMeasureMode','toggleViewshedMode','toggleLassoMode'])await compare(async h=>{h.activate();await h.settle();h.place(point());h.w[method]();await h.settle();assert(!h.w.state.isSightMode);assert.equal(h.w.state.sightObserver,null);assert.deepEqual(h.w.state.sightTargets,[])})});\ntest('batched observer/target updates preserve original React/SDK ordering',async()=>{await compare(async h=>{h.activate();await h.settle();h.place(point());h.w.flush();h.place(point(2));h.place(point(3));h.w.flush();assert.equal(h.w.state.sightTargets.length,2)},{batched:true})});\ntest('current module failure warns and a later activation retries successfully',async()=>{await compare(async h=>{h.activate();h.loads[0].reject(Error('SDK offline'));await h.settle();assert.equal(h.models.length,0);h.activate();await h.settle();h.activate();h.loads[1].resolve([h.Model]);await h.settle();assert.equal(h.models.length,1);assert.equal(h.warnings.length,1)},{hold:true})});\ntest('off or clear during module load prevents construction and stale warnings',async()=>{for(const mode of ['off','clear','dispose']){const h=setup('working',{hold:true});h.activate();if(mode==='off')h.activate();if(mode==='clear')h.clear();if(mode==='dispose')h.owner().dispose();h.loads[0].resolve([h.Model]);await h.settle();assert.equal(h.models.length,0);assert.equal(h.warnings.length,0)}});\ntest('concurrent activation shares constructor loading and creates one view model',async()=>{const h=setup('working',{hold:true});h.w.state.isSightMode=true;const a=h.owner().activate(),b=h.owner().activate();assert.equal(h.loads.length,1);h.loads[0].resolve([h.Model]);await Promise.all([a,b]);assert.equal(h.models.length,1)});\ntest('view/map replacement invalidates old loading before constructor invocation',async()=>{for(const mode of ['view','map','destroyed']){const h=setup('working',{hold:true});h.activate();if(mode==='view')h.w.state.jimuMapView={view:h.view()};if(mode==='map')h.w.state.jimuMapView.view.map={};if(mode==='destroyed')h.w.state.jimuMapView.view.destroyed=true;h.loads[0].resolve([h.Model]);await h.settle();assert.equal(h.models.length,0);assert.equal(h.warnings.length,0)}});\ntest('replaced current model clears/destroys once and restores existing samples without React duplicates',async()=>{const h=setup('working');h.activate();await h.settle();const a=point(),b=point(2);h.place(a);h.place(b);const view=h.view();h.owner().onViewChange(view);h.w.state.jimuMapView={view};await h.owner().activate();assert(h.models[0].destroyed);assert.equal(h.models[1].observerValue,a);assert.equal(h.models[1].points[0],b);assert.deepEqual(h.w.state.sightTargets,[b]);h.owner().dispose();h.owner().dispose();assert.equal(h.trace.filter(x=>x[0]==='destroy').length,2)});\ntest('older pending completion cannot clear a newer activation after clear/retry',async()=>{const h=setup('working',{hold:true});h.w.state.isSightMode=true;const a=h.owner().activate();h.owner().clear();const b=h.owner().activate();h.loads[0].resolve([h.Model]);await a;assert.equal(h.models.length,0);h.loads[1].resolve([h.Model]);await b;assert.equal(h.models.length,1);assert(h.ready())});\ntest('2D, absent map and destroyed views never load a SceneView-only constructor',async()=>{for(const mode of ['2d','map','destroyed','missing']){const h=setup('working');h.w.state.isSightMode=true;if(mode==='2d')h.w.state.jimuMapView.view.type='2d';if(mode==='map')h.w.state.jimuMapView.view.map=null;if(mode==='destroyed')h.w.state.jimuMapView.view.destroyed=true;if(mode==='missing')h.w.state.jimuMapView=null;await h.owner().activate();assert.equal(h.loads.length,0);assert(!h.ready())}});\ntest('clearing SDK failure does not prevent model destruction; disposed owner can activate again',async()=>{const h=setup('working');h.activate();await h.settle();h.models[0].clear=()=>{throw Error('clear failed')};h.owner().dispose();assert(h.models[0].destroyed);assert.equal(h.warnings.length,1);await h.owner().activate();assert.equal(h.models.length,2);assert(h.ready())});\ntest('picking is rejected after disabling tool or replacing its view until a new model is current',async()=>{const h=setup('working');h.activate();await h.settle();h.w.state.isSightMode=false;h.owner().place(point());assert.equal(h.w.state.sightObserver,null);h.w.state.isSightMode=true;h.w.state.jimuMapView={view:h.view()};h.owner().place(point());assert.equal(h.w.state.sightObserver,null);await h.owner().activate();h.place(point());assert(h.w.state.sightObserver)});\ntest('late module rejection after off/clear/dispose is silent and cannot claim readiness',async()=>{for(const mode of ['off','clear','dispose']){const h=setup('working',{hold:true});h.activate();if(mode==='off')h.activate();if(mode==='clear')h.clear();if(mode==='dispose')h.owner().dispose();h.loads[0].reject(Error('late cancellation'));await h.settle();assert.equal(h.warnings.length,0);assert(!h.ready())}});\ntest('constructor failure is retryable; a constructor-triggered view change releases the new model',async()=>{for(const mode of ['throw','switch']){const h=setup('working',{hold:true});h.w.state.isSightMode=true;const task=h.owner().activate();class Constructor extends h.Model{constructor(properties){if(mode==='throw')throw Error('constructor failed');super(properties);h.w.state.jimuMapView={view:h.view()}}}h.loads[0].resolve([Constructor]);await task;assert(!h.ready());if(mode==='switch')assert(h.models[0].destroyed);else assert.equal(h.warnings.length,1);const next=h.owner().activate();h.loads[1].resolve([h.Model]);await next;assert(h.ready())}});\ntest('failed sample restoration releases partial analysis and retry restores without duplicate React targets',async()=>{const h=setup('working',{hold:true});h.w.state.isSightMode=true;h.w.state.sightObserver=point();h.w.state.sightTargets=[point(2)];const task=h.owner().activate();class Model extends h.Model{constructor(properties){super(properties);this.targets.add=()=>{throw Error('target restore failed')}}}h.loads[0].resolve([Model]);await task;assert(h.models[0].destroyed);assert(!h.ready());assert.equal(h.warnings.length,1);const next=h.owner().activate();h.loads[1].resolve([h.Model]);await next;assert.equal(h.models[1].points.length,1);assert.equal(h.w.state.sightTargets.length,1)});\n"
    },
    {
      "file": "tests/fixtures/pointCloudSight.baseline.json",
      "content": "{\n  \"description\": \"Immutable pre-extraction sight toggles/clear and actual sight-hit branch; test-only.\",\n  \"source\": \"class Widget {\\nprivate toggleSightMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextSight = !prev.isSightMode;\\n        const updates: any = {\\n          isSightMode: nextSight,\\n          sightObserver: null,\\n          sightTargets: [],\\n        };\\n\\n        // Prevent clash: Automatically turn off Measure Mode if it was on\\n        if (nextSight && prev.isMeasureMode) {\\n          updates.isMeasureMode = false;\\n          updates.measurePoints = [];\\n        }\\n        return updates;\\n      },\\n      async () => {\\n        // Update Measure graphics to clear the lines if we just turned it off\\n        if (!this.state.isMeasureMode) {\\n          this.updateMeasurementGraphics();\\n        }\\n\\n        if (this.state.isSightMode) {\\n          this.showToast(<span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);\\n\\n          if (!this._sightViewModel && this.state.jimuMapView) {\\n            try {\\n              const [LineOfSightViewModel] = await loadArcGISJSAPIModules([\\\"esri/widgets/LineOfSight/LineOfSightViewModel\\\"]);\\n              this._sightViewModel = new LineOfSightViewModel({\\n                view: this.state.jimuMapView.view,\\n              });\\n            } catch (e) {\\n              console.warn(\\\"Could not load LineOfSightViewModel\\\", e);\\n            }\\n          }\\n        } else {\\n          this.clearSight();\\n        }\\n      },\\n    );\\n  };\\nprivate clearSight = () => {\\n    this.setState({ sightObserver: null, sightTargets: [] });\\n    if (this._sightViewModel) {\\n      this._sightViewModel.clear();\\n    }\\n  };\\nprivate toggleMeasureMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMeasure = !prev.isMeasureMode;\\n        const updates: any = {\\n          isMeasureMode: nextMeasure,\\n          measurePoints: [],\\n        };\\n\\n        // Prevent clash: Automatically turn off Sight Mode if it was on\\n        if (nextMeasure && prev.isSightMode) {\\n          updates.isSightMode = false;\\n          updates.sightObserver = null;\\n          updates.sightTargets = [];\\n          if (this._sightViewModel) {\\n            this._sightViewModel.clear();\\n          }\\n          updates.isViewshedMode = false; // Turn off viewshed\\n          this.clearViewshed(); // Remove the red/green graphics\\n        }\\n        return updates;\\n      },\\n      () => {\\n        this.updateMeasurementGraphics();\\n        if (this.state.isMeasureMode) {\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.\\n            </span>,\\n            3000,\\n          );\\n        }\\n      },\\n    );\\n  };\\nprivate toggleViewshedMode = async () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMode = !prev.isViewshedMode;\\n        const updates: any = { isViewshedMode: nextMode };\\n\\n        // Prevent clashes: Automatically turn off other tools\\n        if (nextMode) {\\n          if (prev.isMeasureMode) {\\n            updates.isMeasureMode = false;\\n            updates.measurePoints = [];\\n            this.updateMeasurementGraphics();\\n          }\\n          if (prev.isSightMode) {\\n            updates.isSightMode = false;\\n            updates.sightObserver = null;\\n            updates.sightTargets = [];\\n            if (this._sightViewModel) this._sightViewModel.clear();\\n          }\\n        }\\n        return updates;\\n      },\\n      () => {\\n        if (this.state.isViewshedMode) {\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Viewshed size={14} /> 360\u00b0 Viewshed Mode: Click on the point cloud to drop an observer.\\n            </span>,\\n            4000,\\n          );\\n        } else {\\n          this.clearViewshed();\\n        }\\n      },\\n    );\\n  };\\nprivate toggleLassoMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMode = !prev.isLassoMode;\\n        const updates: any = {\\n          isLassoMode: nextMode,\\n          lassoPolygon: [],\\n          lassoSelectedObjectIds: [],\\n        };\\n\\n        // Prevent clashes with other 3D tools. Auto-disable them if Lasso is activated.\\n        if (nextMode) {\\n          if (prev.isMeasureMode) {\\n            updates.isMeasureMode = false;\\n            updates.measurePoints = [];\\n            this.updateMeasurementGraphics();\\n          }\\n          if (prev.isSightMode) {\\n            updates.isSightMode = false;\\n            updates.sightObserver = null;\\n            updates.sightTargets = [];\\n            if (this._sightViewModel) this._sightViewModel.clear();\\n          }\\n          if (prev.isViewshedMode) {\\n            updates.isViewshedMode = false;\\n            this.clearViewshed();\\n          }\\n        }\\n        return updates;\\n      },\\n      () => {\\n        if (this.state.isLassoMode) {\\n          this.showToast(<span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);\\n        } else {\\n          this.clearLasso();\\n        }\\n      },\\n    );\\n  };\\napplySightHit(geom:any){\\n          // SIGHT MODE\\n          if (this.state.isSightMode && this._sightViewModel) {\\n            if (!this.state.sightObserver) {\\n              this.setState({ sightObserver: geom });\\n              this._sightViewModel.observer = geom;\\n            } else {\\n              this.setState((prev) => ({ sightTargets: [...prev.sightTargets, geom] }));\\n              this._sightViewModel.targets.add({ location: geom });\\n            }\\n            return;\\n          }\\n\\n\\n}\\n}\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-sight-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-sight.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited sight references remain)');
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
    console.log(uninstall ? 'Point-cloud sight is already uninstalled. No files changed.' : 'Point-cloud sight is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-sight', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud sight ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Line-of-sight SDK creation, point mutation and cleanup now have one typed owner. Tool intent and visibility policy remain with runtime/SDK. Regression files and contributor docs are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
