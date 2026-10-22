#!/usr/bin/env node
'use strict';
/** Point-cloud lifecycle installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud result application block 1",
          "before": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudResultApplication } from '../features/point-cloud/PointCloudResultApplication';\nimport { showPointCloudLoadedFeedback, showPointCloudProgressFeedback } from '../features/point-cloud/PointCloudResultFeedback';\n",
          "after": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudLifecycle } from '../features/point-cloud/PointCloudLifecycle';\nimport { PointCloudResultApplication } from '../features/point-cloud/PointCloudResultApplication';\nimport { showPointCloudLoadedFeedback, showPointCloudProgressFeedback } from '../features/point-cloud/PointCloudResultFeedback';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Apply accepted results without duplicating acquisition, scene edits or viewer ownership. */\n  private _pointCloudResult = new PointCloudResultApplication({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind existing resource owners lazily; construction starts no cleanup or SDK work. */\n  private _pointCloudLifecycle = new PointCloudLifecycle({\n    readState: () => this.state,\n    acquisition: () => this._pointCloudAcquisition,\n    adaptive: () => this._pointCloudAdaptiveDisplay,\n    map: () => this._pointCloudMapLayer,\n    lasso: () => this._lasso,\n    measurement: () => this._measurement,\n    sight: () => this._sight,\n    rings: () => this._rings,\n    dismissProgress: () => {\n      if (this._toastOwner === \"point-cloud-progress\") {\n        if (this._toastTimer) clearTimeout(this._toastTimer);\n        this._toastTimer = null; this._toastOwner = undefined;\n        this.setState({ toastMessage: undefined });\n      }\n    },\n    cancelNudge: () => this._debouncedNudgeRender?.cancel?.(),\n    clearViewerData: () => {\n      this._pointCloudSequenceContext = null;\n      this.removeViewerPointCloudRenderer(); this._filteredPointCloudPoints = [];\n    },\n    setState: (patch, callback) => this.setState(patch, callback),\n    canUpdateMeasurement: () => !!this.state.jimuMapView?.view?.map && !this.state.jimuMapView.view.destroyed,\n    updateMeasurement: () => this.updateMeasurementGraphics(),\n    clearViewshed: () => this.clearViewshed(),\n    clearLasso: () => this.clearLasso(),\n    clear: reset => this.clearPointCloud(reset),\n    load: () => this.loadPointCloudLayer(),\n  });\n  /** Apply accepted results without duplicating acquisition, scene edits or viewer ownership. */\n  private _pointCloudResult = new PointCloudResultApplication({\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 3",
          "before": "  }\n\n  /**\n   * Removes the point cloud GraphicsLayer from the map and resets state.\n   * @param resetState If true, also resets pointCloudAvailable to undefined.\n   *                   Pass false when clearing before a reload so the loading\n   *                   spinner state is not interrupted.\n   */\n  private clearPointCloud = (resetState: boolean = true) => {\n    this._pointCloudAcquisition.stopMode();\n    // Cancel dismisses only cloud progress; a newer unrelated notification stays visible.\n    // Internal reload cleanup preserves the active loading message.\n    if (resetState && this._toastOwner === \"point-cloud-progress\") {\n      if (this._toastTimer) clearTimeout(this._toastTimer);\n      this._toastTimer = null;\n      this._toastOwner = undefined;\n      this.setState({ toastMessage: undefined });\n    }\n    this._pointCloudAdaptiveDisplay?.dispose();\n    this._debouncedNudgeRender?.cancel?.();\n    this._pointCloudAcquisition.cancel('clear'); this._pointCloudMapLayer?.invalidate();\n    this._pointCloudMapLayer?.clear();\n    this._pointCloudAcquisition.releaseResult(); this._pointCloudSequenceContext = null;\n    this.removeViewerPointCloudRenderer();\n\n    this._filteredPointCloudPoints = [];\n\n    // DEACTIVATE ALL POINT-CLOUD-DEPENDENT TOOLS\n    // Release measurement resources before asynchronous state-reset callbacks.\n    this._lasso?.clear();\n    this._measurement?.dispose();\n    // Measure mode\n    if (this.state.isMeasureMode) {\n      this.setState({ isMeasureMode: false, measurePoints: [] }, () => {\n        if (this.state.jimuMapView?.view?.map && !this.state.jimuMapView.view.destroyed) this.updateMeasurementGraphics(); // clears the 3D line from map + viewer\n      });\n    }\n\n    // Line of Sight\n    if (this.state.isSightMode) {\n      this._sight?.clear();\n      this.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });\n    }\n\n    // Viewshed\n    if (this.state.isViewshedMode) {\n      this.clearViewshed();\n      this.setState({ isViewshedMode: false });\n    }\n\n    // Ring resources belong to their original map, independent of the feature layer.\n    this._rings?.clear();\n\n    // Calibration panel\n    if (this.state.showCalibrationPanel) {\n      this.setState({ showCalibrationPanel: false });\n    }\n\n    if (resetState) {\n      this.setState({\n        pointCloudPrevious: false, pointCloudAutoPaused: false, pointCloudVisible: false, pointCloudLoading: false, pointCloudSummary: undefined, pointCloudIncomplete: false,\n        pointCloudAvailable: undefined,\n      });\n    }\n\n    // [4.5.0 Update] Ensure Lasso clears out when the point cloud is deactivated\n    if (this.state.isLassoMode) {\n      this.clearLasso();\n      this.setState({ isLassoMode: false });\n    }\n  };\n\n  /**\n   * Toggles the point cloud layer.\n   * - If a cloud is loaded and visible: removes it\n   * - If no cloud is loaded: triggers a fresh load\n   * The toggle is image-aware, switching to a new image clears the\n   * previous cloud automatically via the image change event handler.\n   */\n  private togglePointCloud = () => {\n    if (this._pointCloudAcquisition.active || this.state.pointCloudVisible || this.state.pointCloudLoading || this._pointCloudAcquisition.following) {\n      this.clearPointCloud(true);\n    } else {\n      this.loadPointCloudLayer();\n    }\n  };\n\n  /** Keep the original trailing 150 ms debounce and clearPointCloud cancellation boundary. */\n",
          "after": "  }\n\n  /** Coordinate owner teardown; false preserves reload loading/progress state. */\n  private clearPointCloud = (resetState: boolean = true) => this._pointCloudLifecycle.clear(resetState);\n\n  /** Forward activation intent; lifecycle preserves active/loading/following toggle semantics. */\n  private togglePointCloud = () => this._pointCloudLifecycle.toggle();\n\n  /** Keep the original trailing 150 ms debounce and clearPointCloud cancellation boundary. */\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLifecycle"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLifecycle",
          "count": 3
        }
      ]
    },
    {
      "file": "tests/pointCloudMapLayer.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudMapLayer.test.cjs point-cloud result application block 1",
          "before": "const funcs=util('pointCloudUtils.ts',['diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud'],'const corridorIndexes = new WeakMap();\\n');const geo=util('geoUtils.ts',['distanceMeters']);\nconst geometry={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?geo:funcs,geometry,geometry.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudMapLayer','diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud','distanceMeters','POINT_CLOUD_CONFIG','setTimeout','geometry','policy',compile('const {preparePointCloudMapGeometry,pointCloudCorridorBasis}=geometry; const {pointCloudMapRenderer}=policy; class Harness {'+methods(kind,kind==='working'?['ensurePointCloudMapLayerOwner','renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud']:['renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud'])+'};return Harness;'));\nconst copy=x=>structuredClone(x),tick=()=>new Promise(r=>setImmediate(r));async function until(f){for(let i=0;i<50;i++){if(f())return;await tick()}throw Error('Timed out')}\nfunction setup(kind,{count=12,manual=false,points, state={}}={}){\n const trace=[],layers=[],calls=[],views=[];let h;\n class Layer{constructor(properties){Object.assign(this,properties);this.destroyed=false;this.data=new Map();this.next=1000;this.number=layers.length;layers.push(this);trace.push(['create',copy(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.number])}applyEdits(edits){trace.push(['edits',this.number,copy(edits)]);let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});const call={edits,layer:this,resolve,reject,finish:(custom)=>{const results={};for(const [kind,features]of Object.entries(edits)){const confirmations=[];for(let i=0;i<features.length;i++){const f=features[i],confirmation=custom?custom(f,i,kind):{objectId:kind==='addFeatures'?++this.next:f.attributes.ObjectID};confirmations.push(confirmation);if(confirmation&&!confirmation.error&&Number.isFinite(confirmation.objectId)){if(kind==='deleteFeatures')this.data.delete(f.attributes.ObjectID);else this.data.set(confirmation.objectId,{...copy(f),attributes:{...copy(f.attributes),ObjectID:confirmation.objectId}})}}results[kind==='deleteFeatures'?'deleteFeatureResults':kind==='updateFeatures'?'updateFeatureResults':'addFeatureResults']=confirmations}resolve(results)}};calls.push(call);if(!manual)call.finish();return promise}}\n const Harness=classes[kind](PointCloudMapLayer,funcs.diffPointCloudFeatures,funcs.pointCloudCandidates,funcs.summarizePointCloud,geo.distanceMeters,{GROUND_MODE_HEIGHT_M:1.5},(fn,ms)=>{trace.push(['yield',ms]);queueMicrotask(fn);return 1},geometry.exports,policy.exports);\n function view(){const v={destroyed:false,map:{add(layer){trace.push(['add',views.indexOf(v),layer.number])},remove(layer){trace.push(['remove',views.indexOf(v),layer.number])}}};views.push(v);return v}\n const w=new Harness();const pts=points||Array.from({length:count},(_,i)=>({lon:i/100000,lat:i/200000,rawLon:i/100000+.001,rawLat:i/200000+.001,alt:i/10,r:i%2?.5:80,g:i%2?.25:90,b:i%2?1:100}));\n",
          "after": "const funcs=util('pointCloudUtils.ts',['diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud'],'const corridorIndexes = new WeakMap();\\n');const geo=util('geoUtils.ts',['distanceMeters']);\nconst geometry={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?geo:funcs,geometry,geometry.exports);\nconst lifecycle={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudLifecycle.ts','utf8')))(lifecycle,lifecycle.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudMapLayer','diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud','distanceMeters','POINT_CLOUD_CONFIG','setTimeout','geometry','policy','PointCloudLifecycle',compile('const {preparePointCloudMapGeometry,pointCloudCorridorBasis}=geometry; const {pointCloudMapRenderer}=policy; class Harness {'+methods(kind,kind==='working'?['_pointCloudLifecycle','ensurePointCloudMapLayerOwner','renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud']:['renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud'])+'};return Harness;'));\nconst copy=x=>structuredClone(x),tick=()=>new Promise(r=>setImmediate(r));async function until(f){for(let i=0;i<50;i++){if(f())return;await tick()}throw Error('Timed out')}\nfunction setup(kind,{count=12,manual=false,points, state={}}={}){\n const trace=[],layers=[],calls=[],views=[];let h;\n class Layer{constructor(properties){Object.assign(this,properties);this.destroyed=false;this.data=new Map();this.next=1000;this.number=layers.length;layers.push(this);trace.push(['create',copy(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.number])}applyEdits(edits){trace.push(['edits',this.number,copy(edits)]);let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});const call={edits,layer:this,resolve,reject,finish:(custom)=>{const results={};for(const [kind,features]of Object.entries(edits)){const confirmations=[];for(let i=0;i<features.length;i++){const f=features[i],confirmation=custom?custom(f,i,kind):{objectId:kind==='addFeatures'?++this.next:f.attributes.ObjectID};confirmations.push(confirmation);if(confirmation&&!confirmation.error&&Number.isFinite(confirmation.objectId)){if(kind==='deleteFeatures')this.data.delete(f.attributes.ObjectID);else this.data.set(confirmation.objectId,{...copy(f),attributes:{...copy(f.attributes),ObjectID:confirmation.objectId}})}}results[kind==='deleteFeatures'?'deleteFeatureResults':kind==='updateFeatures'?'updateFeatureResults':'addFeatureResults']=confirmations}resolve(results)}};calls.push(call);if(!manual)call.finish();return promise}}\n const Harness=classes[kind](PointCloudMapLayer,funcs.diffPointCloudFeatures,funcs.pointCloudCandidates,funcs.summarizePointCloud,geo.distanceMeters,{GROUND_MODE_HEIGHT_M:1.5},(fn,ms)=>{trace.push(['yield',ms]);queueMicrotask(fn);return 1},geometry.exports,policy.exports,lifecycle.exports.PointCloudLifecycle);\n function view(){const v={destroyed:false,map:{add(layer){trace.push(['add',views.indexOf(v),layer.number])},remove(layer){trace.push(['remove',views.indexOf(v),layer.number])}}};views.push(v);return v}\n const w=new Harness();const pts=points||Array.from({length:count},(_,i)=>({lon:i/100000,lat:i/200000,rawLon:i/100000+.001,rawLat:i/200000+.001,alt:i/10,r:i%2?.5:80,g:i%2?.25:90,b:i%2?1:100}));\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLifecycle"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLifecycle",
          "count": 3
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud result application block 1",
          "before": "\nFunction comments document degrees/meters, source altitude policy, strict versus string-normalized ID matching and authority/order boundaries. Baseline-backed tests verify real geometry/summary/count helpers plus feedback properties, ready/unready viewer behavior, null/empty/partial results and the automatic follow limit. Host validation still needs real initial/follow loads, calibration/lasso carryover, viewer recreation and progress cleanup.\n",
          "after": "\nFunction comments document degrees/meters, source altitude policy, strict versus string-normalized ID matching and authority/order boundaries. Baseline-backed tests verify real geometry/summary/count helpers plus feedback properties, ready/unready viewer behavior, null/empty/partial results and the automatic follow limit. Host validation still needs real initial/follow loads, calibration/lasso carryover, viewer recreation and progress cleanup.\n\n## Activation and clear coordination\n\n`PointCloudLifecycle.ts` owns the sequence of existing owner calls rather than their resources. Runtime binds lazy acquisition/adaptive/map/tool/ring getters, progress dismissal, pending-nudge cancellation, viewer/context/subset cleanup and state callbacks. All nine existing resource-owner files remain unchanged.\n\nFull reset retains stop/progress/adaptive/debounce/acquisition/map/release/viewer/tool/ring/state order. Reload cleanup (`resetState=false`) preserves cloud progress and loading/availability/status flags while releasing resources and deactivating tools. Measurement resources are disposed before the React callback; the callback still checks the then-current map and destroyed flag. The early lasso resource clear and late full lasso/state clear remain separate. Toggle still considers active, visible, loading and following intent.\n\nThe coordinator owns no mode mirror, cloud, SDK object, timer or listener. It preserves synchronous error propagation and delegates repeated cleanup/idempotence to owners. Comments and baseline-backed tests capture callback/live-state and reset/reload boundaries. Real host testing remains necessary for tool visuals, rapid toggle/reload, pending nudges and loading/following closure.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLifecycle",
        "## Activation and clear coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLifecycle",
          "count": 1
        },
        {
          "text": "## Activation and clear coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud result application block 1",
          "before": "Changed: runtime, contributor README, ownership document, roadmap and geometry/acquisition test harnesses (actual module binding only; original fixtures/assertions retained). Added: application module, feedback module, 15 baseline-backed cases and frozen original result/progress fixture. Validation: 234 point-cloud/playback cases; strict application/feedback/actual runtime boundary checks with actual ArcGIS session and viewer/point types plus local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Experience Builder smoke checks remain initial/automatic loading, calibration/lasso preservation, viewer replacement and partial/progress feedback.\n\nNext: review remaining point-cloud activation/clear lifecycle and tool deactivation coordination as a separate boundary, preserving teardown order, debounce cancellation and acquisition/map/viewer ownership. Avoid combining unrelated runtime features into a generic controller.\n",
          "after": "Changed: runtime, contributor README, ownership document, roadmap and geometry/acquisition test harnesses (actual module binding only; original fixtures/assertions retained). Added: application module, feedback module, 15 baseline-backed cases and frozen original result/progress fixture. Validation: 234 point-cloud/playback cases; strict application/feedback/actual runtime boundary checks with actual ArcGIS session and viewer/point types plus local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Experience Builder smoke checks remain initial/automatic loading, calibration/lasso preservation, viewer replacement and partial/progress feedback.\n\nActivation/clear coordination is completed below with teardown order, debounce cancellation and acquisition/map/viewer ownership retained. Tool activation/mutual-exclusion policy remains a separate boundary.\n\n## Point-cloud activation and clear coordination\n\nExtracted clear/toggle orchestration to `src/features/point-cloud/PointCloudLifecycle.ts`. Runtime is now 13,489 lines (48 fewer), with two forwarding methods and lazy owner/UI adapters. All other existing runtime members are token-identical; acquisition, map, viewer, adaptive, lasso, measurement, sight, viewshed and ring owners are byte-identical.\n\nFunction comments explain reset-versus-reload behavior, original teardown order, cloud-owned progress dismissal, pending nudge cancellation, measurement callback live-view gating and distinct early/late lasso cleanup. No resource lifetime, callback coalescing, exception policy, timer, request, point copy or UI behavior is introduced.\n\nChanged: runtime, contributor README, ownership document, roadmap and map test harness (feature binding only; original test bodies and fixture retained). Added: lifecycle coordinator, 15 baseline-backed cases and frozen original clear/toggle fixture. Validation: 249 point-cloud/playback cases; strict actual adapter checks against existing owner and ArcGIS types; full TSX parse; structural/owner-file preservation and guarded installer checks. Host smoke checks remain loading/following toggles, rapid off/on/reload, active-tool clearing, unrelated toast preservation and pending calibration cancellation.\n\nNext: extract tool activation and mutual-exclusion coordination (measurement, sight and viewshed) without changing their individual owners, state-reset callbacks, hit handling or user feedback.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLifecycle",
        "## Point-cloud activation and clear coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLifecycle",
          "count": 1
        },
        {
          "text": "## Point-cloud activation and clear coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Accepted result application, calibration retention and initial subset/update order | `PointCloudResultApplication.ts` |\n| Loaded/progress toast wording, JSX, duration and ownership | `PointCloudResultFeedback.tsx` |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Activation intent, clear ordering and tool deactivation | `PointCloudLifecycle.ts` |\n| Accepted result application, calibration retention and initial subset/update order | `PointCloudResultApplication.ts` |\n| Loaded/progress toast wording, JSX, duration and ownership | `PointCloudResultFeedback.tsx` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 2",
          "before": "\nThe coordinator intentionally adds no asynchronous state callback or extra stale-result policy. Call it only through acquisition's guarded result callback. `tests/pointCloudResult.test.cjs` compares actual adapters/feedback with immutable original handlers and real geometry/count/summary helpers, including immediate/batched React state behavior, reuse/attachment, partial/null/empty results and auto-follow limits. The existing geometry and acquisition suites keep their original fixtures/assertions and now bind these modules. Host checks: initial/automatic loads, same-cluster calibration, lasso replacement, partial recovery, viewer recreation and progress completion.\n",
          "after": "\nThe coordinator intentionally adds no asynchronous state callback or extra stale-result policy. Call it only through acquisition's guarded result callback. `tests/pointCloudResult.test.cjs` compares actual adapters/feedback with immutable original handlers and real geometry/count/summary helpers, including immediate/batched React state behavior, reuse/attachment, partial/null/empty results and auto-follow limits. The existing geometry and acquisition suites keep their original fixtures/assertions and now bind these modules. Host checks: initial/automatic loads, same-cluster calibration, lasso replacement, partial recovery, viewer recreation and progress completion.\n\n## Activation and clear coordination\n\n`PointCloudLifecycle.ts` coordinates the existing owners through lazy runtime adapters. It owns no layer, timer, request, listener, retained point data or independent mode flags. Acquisition, scene, viewer, tools and ring owners keep their existing cancellation, original-view cleanup and idempotence contracts.\n\n- `toggle` closes whenever acquisition is active/following or the cloud is visible/loading. Otherwise it starts the existing load path. It delegates through the runtime clear/load adapters.\n- `clear(true)` stops mode intent, dismisses only cloud-owned progress, disposes adaptive display, cancels pending calibration debounce, cancels acquisition and invalidates/clears map edits, releases the full result/context, detaches the viewer and empties the display subset.\n- Lasso/measurement resources release before queued state callbacks. Active measurement resets state and checks the live map/destroyed gate inside its callback before refreshing graphics. Sight/viewshed, rings and calibration panel keep their original order.\n- Full reset clears visibility/loading/availability/status flags. `clear(false)` preserves those flags and the active progress toast for reload while still releasing resources and deactivating tools.\n- Keep both early lasso resource clearing and the final full lasso clear/state update: they have distinct existing responsibilities. Do not merge or reorder state patches during this extraction.\n\nFunction comments document live getters, ownership, callback timing and the reset/reload distinction. No new exception swallowing, callback cancellation or coalescing policy is added. `tests/pointCloudLifecycle.test.cjs` compares actual runtime adapters against frozen original methods with recording owners and immediate/batched state callbacks. The existing map suite binds this feature and retains all original test bodies and its original-map cleanup assertions. Host checks: toggle while loading/following, rapid off/on, clear with each tool active, reload, unrelated toast preservation and clear during a pending calibration nudge.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLifecycle",
        "## Activation and clear coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLifecycle",
          "count": 2
        },
        {
          "text": "## Activation and clear coordination",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudLifecycle.ts",
      "content": "export interface PointCloudLifecycleState {\n  pointCloudVisible?: boolean; pointCloudLoading?: boolean;\n  isMeasureMode: boolean; isSightMode: boolean; isViewshedMode: boolean; isLassoMode: boolean;\n  showCalibrationPanel: boolean;\n}\nexport interface PointCloudLifecyclePatch {\n  isMeasureMode?: boolean; measurePoints?: never[];\n  isSightMode?: boolean; sightObserver?: null; sightTargets?: never[];\n  isViewshedMode?: boolean; showCalibrationPanel?: boolean; isLassoMode?: boolean;\n  pointCloudPrevious?: boolean; pointCloudAutoPaused?: boolean; pointCloudVisible?: boolean;\n  pointCloudLoading?: boolean; pointCloudSummary?: undefined; pointCloudIncomplete?: boolean;\n  pointCloudAvailable?: undefined;\n}\nexport interface PointCloudLifecycleDependencies {\n  readState(): PointCloudLifecycleState;\n  acquisition(): { readonly active: boolean; readonly following: boolean; stopMode(): void; cancel(reason: 'clear'): void; releaseResult(): void };\n  adaptive(): { dispose(): void } | null;\n  map(): { invalidate(): void; clear(): void } | null;\n  lasso(): { clear(): void } | null;\n  measurement(): { dispose(): void } | null;\n  sight(): { clear(): void } | null;\n  rings(): { clear(): void } | null;\n  /** Dismiss only the point-cloud-owned progress toast; unrelated notifications remain visible. */\n  dismissProgress(): void;\n  cancelNudge(): void;\n  /** Clear sequence context, detach original viewer owner, then empty the filtered subset. */\n  clearViewerData(): void;\n  setState(patch: PointCloudLifecyclePatch, callback?: () => void): void;\n  /** Re-read the live map/destroyed gate inside the measurement state callback. */\n  canUpdateMeasurement(): boolean;\n  updateMeasurement(): void;\n  clearViewshed(): void;\n  clearLasso(): void;\n  clear(reset: boolean): void;\n  load(): void;\n}\n\n/** Coordinate existing owners without acquiring a layer, timer, listener or cloud reference.\n * Resource getters and state reads remain live across React callbacks. Owners retain their own\n * original-view cleanup, cancellation and idempotence contracts; this class adds no exception policy.\n */\nexport class PointCloudLifecycle {\n  constructor(private readonly dependencies: PointCloudLifecycleDependencies) {}\n\n  /** Stop cloud intent, cancel pending work, clear scene/viewer resources, then deactivate tools.\n   * resetState=false preserves loading/progress/availability during reload; tools still deactivate.\n   * Measurement/lasso resources are released before asynchronous state-reset callbacks. Keep the\n   * final full-lasso clear even after its early resource clear: each has an existing distinct role.\n   */\n  clear(resetState = true): void {\n    const d = this.dependencies;\n    d.acquisition().stopMode();\n    if (resetState) d.dismissProgress();\n    d.adaptive()?.dispose();\n    d.cancelNudge();\n    d.acquisition().cancel('clear'); d.map()?.invalidate();\n    d.map()?.clear();\n    d.acquisition().releaseResult(); d.clearViewerData();\n    d.lasso()?.clear();\n    d.measurement()?.dispose();\n    if (d.readState().isMeasureMode) {\n      d.setState({ isMeasureMode: false, measurePoints: [] }, () => {\n        if (d.canUpdateMeasurement()) d.updateMeasurement();\n      });\n    }\n    if (d.readState().isSightMode) {\n      d.sight()?.clear();\n      d.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });\n    }\n    if (d.readState().isViewshedMode) {\n      d.clearViewshed(); d.setState({ isViewshedMode: false });\n    }\n    d.rings()?.clear();\n    if (d.readState().showCalibrationPanel) d.setState({ showCalibrationPanel: false });\n    if (resetState) d.setState({ pointCloudPrevious: false, pointCloudAutoPaused: false,\n      pointCloudVisible: false, pointCloudLoading: false, pointCloudSummary: undefined,\n      pointCloudIncomplete: false, pointCloudAvailable: undefined });\n    if (d.readState().isLassoMode) { d.clearLasso(); d.setState({ isLassoMode: false }); }\n  }\n\n  /** Any active/visible/loading/following intent closes the cloud; otherwise begin the original load.\n   * Delegate through runtime clear/load adapters so existing call-site behavior stays observable.\n   */\n  toggle(): void {\n    const d = this.dependencies;\n    if (d.acquisition().active || d.readState().pointCloudVisible || d.readState().pointCloudLoading || d.acquisition().following) d.clear(true);\n    else d.load();\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudLifecycle.test.cjs",
      "content": "/** Compare actual runtime lifecycle adapters against frozen original clear/toggle methods.\n * Recording owners and queued state callbacks expose teardown, progress and live-view boundaries.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudLifecycle.ts','utf8')))(m,m.exports);\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudLifecycle.baseline.json','utf8'));const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');\nconst actual=['_pointCloudLifecycle','clearPointCloud','togglePointCloud'].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nfunction setup(kind,{batched=false,state={}}={}){\n const trace=[],pending=[];let fail=null;const record=(name,...args)=>{trace.push([name,...args]);if(fail===name)throw Error('failed '+name)};\n const Harness=new Function('PointCloudLifecycle','clearTimeout',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.PointCloudLifecycle,id=>record('cancelToast',id));const w=new Harness();\n const view={map:{},destroyed:false};w.state={isMeasureMode:true,isSightMode:true,isViewshedMode:true,isLassoMode:true,showCalibrationPanel:true,pointCloudVisible:true,pointCloudLoading:true,pointCloudPrevious:true,pointCloudAutoPaused:true,pointCloudSummary:'ready',pointCloudAvailable:true,pointCloudIncomplete:true,jimuMapView:{view},...state};\n w._toastOwner='point-cloud-progress';w._toastTimer=7;w._filteredPointCloudPoints=[{}];w._pointCloudSequenceContext={id:'A'};\n const a={active:true,following:true,result:{id:'A'},stopMode(){record('stop');this.active=false},cancel:reason=>record('cancel',reason),releaseResult(){record('release');this.result=null}};w._pointCloudAcquisition=a;\n w._pointCloudAdaptiveDisplay={dispose:()=>record('adaptive')};w._debouncedNudgeRender={cancel:()=>record('cancelNudge')};w._pointCloudMapLayer={invalidate:()=>record('invalidate'),clear:()=>record('mapClear')};w.removeViewerPointCloudRenderer=()=>record('detach');w._lasso={clear:()=>record('lassoResource')};w._measurement={dispose:()=>record('measurement')};w._sight={clear:()=>record('sight')};w._rings={clear:()=>record('rings')};w.clearViewshed=()=>record('viewshed');w.clearLasso=()=>record('lassoFull');w.updateMeasurementGraphics=()=>record('measurementUpdate');w.loadPointCloudLayer=()=>record('load');\n w.setState=(patch,callback)=>{record('state',structuredClone(patch));const run=()=>{Object.assign(w.state,patch);callback?.()};if(batched)pending.push(run);else run()};\n return{w,trace,view,a,pending,clear:reset=>w.clearPointCloud(reset),toggle:()=>w.togglePointCloud(),flush:()=>{while(pending.length)pending.shift()()},fail:name=>fail=name};\n}\nfunction comparableState(w){const {jimuMapView,...state}=w.state;return state}\nfunction compare(run,options){const a=setup('baseline',options),b=setup('working',options);run(a);run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(comparableState(b.w),comparableState(a.w));assert.deepEqual([b.w._toastOwner,b.w._toastTimer,b.w._pointCloudSequenceContext,b.w._filteredPointCloudPoints,b.a.result],[a.w._toastOwner,a.w._toastTimer,a.w._pointCloudSequenceContext,a.w._filteredPointCloudPoints,a.a.result]);return b}\ntest('full reset preserves stop/progress/adaptive/nudge/acquisition/map/viewer teardown order',()=>{compare(h=>{h.clear();assert.deepEqual(h.trace.slice(0,10).map(x=>x[0]),['stop','cancelToast','state','adaptive','cancelNudge','cancel','invalidate','mapClear','release','detach']);assert.equal(h.a.result,null);assert.deepEqual(h.w._filteredPointCloudPoints,[]);assert.equal(h.w._pointCloudSequenceContext,null)})});\ntest('reload clear preserves loading/availability/summary/progress while deactivating tools',()=>{compare(h=>{h.clear(false);assert.equal(h.w.state.pointCloudLoading,true);assert.equal(h.w.state.pointCloudAvailable,true);assert.equal(h.w.state.pointCloudSummary,'ready');assert.equal(h.w._toastTimer,7);assert(!h.trace.some(x=>x[0]==='cancelToast'));assert.equal(h.w.state.isMeasureMode,false);assert.equal(h.w.state.isLassoMode,false)})});\ntest('unrelated toast and its timer survive full cloud reset',()=>{compare(h=>{h.w._toastOwner='other';h.clear();assert.equal(h.w._toastOwner,'other');assert.equal(h.w._toastTimer,7);assert(!h.trace.some(x=>x[0]==='cancelToast'))})});\ntest('owned progress without timer still clears ownership and message without cancelling a timer',()=>{compare(h=>{h.w._toastTimer=null;h.clear();assert.equal(h.w._toastOwner,undefined);assert(!h.trace.some(x=>x[0]==='cancelToast'));assert(h.trace.some(x=>x[0]==='state'&&Object.hasOwn(x[1],'toastMessage')))})});\ntest('measurement and lasso resources release before queued state-reset callbacks',()=>{compare(h=>{h.clear();assert(h.trace.some(x=>x[0]==='measurement'));assert(!h.trace.some(x=>x[0]==='measurementUpdate'));h.flush();assert.equal(h.trace.at(-1)[0],'measurementUpdate')},{batched:true})});\ntest('queued measurement callback checks current map presence and destroyed state',()=>{for(const mode of ['missing','destroyed','replacement'])compare(h=>{h.clear();if(mode==='missing')h.w.state.jimuMapView=null;if(mode==='destroyed')h.view.destroyed=true;if(mode==='replacement')h.w.state.jimuMapView={view:{map:{},destroyed:false}};h.flush();assert.equal(h.trace.some(x=>x[0]==='measurementUpdate'),mode==='replacement')},{batched:true})});\ntest('disabled tools skip conditional clears/state but keep unconditional owner release',()=>{compare(h=>{Object.assign(h.w.state,{isMeasureMode:false,isSightMode:false,isViewshedMode:false,isLassoMode:false,showCalibrationPanel:false});h.clear(false);assert(h.trace.some(x=>x[0]==='lassoResource'));assert(h.trace.some(x=>x[0]==='measurement'));assert(!h.trace.some(x=>['sight','viewshed','lassoFull','measurementUpdate'].includes(x[0])))})});\ntest('absent optional owners and absent nudge cancel are tolerated',()=>{compare(h=>{for(const field of ['_pointCloudAdaptiveDisplay','_pointCloudMapLayer','_lasso','_measurement','_sight','_rings','_debouncedNudgeRender'])h.w[field]=null;h.clear();assert.equal(h.a.result,null)})});\ntest('early lasso resource clear and final full lasso clear keep their distinct ordering',()=>{compare(h=>{h.clear();const names=h.trace.map(x=>x[0]);assert(names.indexOf('lassoResource')<names.indexOf('measurement'));assert(names.indexOf('rings')<names.indexOf('lassoFull'));assert.equal(names.filter(x=>x==='lassoFull').length,1)})});\ntest('calibration panel and optional full reset preserve individual state patches',()=>{for(const reset of [false,true])compare(h=>{h.clear(reset);assert(h.trace.some(x=>x[0]==='state'&&x[1].showCalibrationPanel===false));assert.equal(h.w.state.pointCloudVisible,!reset);assert.equal(h.w.state.pointCloudAutoPaused,!reset)})});\ntest('toggle closes for any active, visible, loading or following intent',()=>{for(const flag of ['active','visible','loading','following'])compare(h=>{h.a.active=flag==='active';h.a.following=flag==='following';h.w.state.pointCloudVisible=flag==='visible';h.w.state.pointCloudLoading=flag==='loading';h.toggle();assert(h.trace.some(x=>x[0]==='stop'));assert(!h.trace.some(x=>x[0]==='load'))})});\ntest('inactive toggle starts original load without eager cleanup',()=>{compare(h=>{h.a.active=false;h.a.following=false;h.w.state.pointCloudVisible=false;h.w.state.pointCloudLoading=false;h.toggle();assert.deepEqual(h.trace,[['load']])})});\ntest('repeated clear retains owner idempotence delegation and original repeated state behavior',()=>{compare(h=>{h.clear();h.clear();assert.equal(h.trace.filter(x=>x[0]==='cancelToast').length,1);assert.equal(h.trace.filter(x=>x[0]==='mapClear').length,2)})});\ntest('queued callbacks preserve independent reset intents rather than adding coalescing',()=>{compare(h=>{h.clear(false);h.clear(true);h.flush();assert.equal(h.w.state.pointCloudVisible,false);assert.equal(h.trace.filter(x=>x[0]==='cancelNudge').length,2)},{batched:true})});\ntest('owner failure keeps original synchronous propagation and later teardown boundary',()=>{compare(h=>{h.fail('mapClear');assert.throws(()=>h.clear(),{message:'failed mapClear'});assert(!h.trace.some(x=>x[0]==='release'));assert(!h.trace.some(x=>x[0]==='detach'))})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudLifecycle.baseline.json",
      "content": "{\n  \"handlers\": \"  /**\\n   * Removes the point cloud GraphicsLayer from the map and resets state.\\n   * @param resetState If true, also resets pointCloudAvailable to undefined.\\n   *                   Pass false when clearing before a reload so the loading\\n   *                   spinner state is not interrupted.\\n   */\\n  private clearPointCloud = (resetState: boolean = true) => {\\n    this._pointCloudAcquisition.stopMode();\\n    // Cancel dismisses only cloud progress; a newer unrelated notification stays visible.\\n    // Internal reload cleanup preserves the active loading message.\\n    if (resetState && this._toastOwner === \\\"point-cloud-progress\\\") {\\n      if (this._toastTimer) clearTimeout(this._toastTimer);\\n      this._toastTimer = null;\\n      this._toastOwner = undefined;\\n      this.setState({ toastMessage: undefined });\\n    }\\n    this._pointCloudAdaptiveDisplay?.dispose();\\n    this._debouncedNudgeRender?.cancel?.();\\n    this._pointCloudAcquisition.cancel('clear'); this._pointCloudMapLayer?.invalidate();\\n    this._pointCloudMapLayer?.clear();\\n    this._pointCloudAcquisition.releaseResult(); this._pointCloudSequenceContext = null;\\n    this.removeViewerPointCloudRenderer();\\n\\n    this._filteredPointCloudPoints = [];\\n\\n    // DEACTIVATE ALL POINT-CLOUD-DEPENDENT TOOLS\\n    // Release measurement resources before asynchronous state-reset callbacks.\\n    this._lasso?.clear();\\n    this._measurement?.dispose();\\n    // Measure mode\\n    if (this.state.isMeasureMode) {\\n      this.setState({ isMeasureMode: false, measurePoints: [] }, () => {\\n        if (this.state.jimuMapView?.view?.map && !this.state.jimuMapView.view.destroyed) this.updateMeasurementGraphics(); // clears the 3D line from map + viewer\\n      });\\n    }\\n\\n    // Line of Sight\\n    if (this.state.isSightMode) {\\n      this._sight?.clear();\\n      this.setState({ isSightMode: false, sightObserver: null, sightTargets: [] });\\n    }\\n\\n    // Viewshed\\n    if (this.state.isViewshedMode) {\\n      this.clearViewshed();\\n      this.setState({ isViewshedMode: false });\\n    }\\n\\n    // Ring resources belong to their original map, independent of the feature layer.\\n    this._rings?.clear();\\n\\n    // Calibration panel\\n    if (this.state.showCalibrationPanel) {\\n      this.setState({ showCalibrationPanel: false });\\n    }\\n\\n    if (resetState) {\\n      this.setState({\\n        pointCloudPrevious: false, pointCloudAutoPaused: false, pointCloudVisible: false, pointCloudLoading: false, pointCloudSummary: undefined, pointCloudIncomplete: false,\\n        pointCloudAvailable: undefined,\\n      });\\n    }\\n\\n    // [4.5.0 Update] Ensure Lasso clears out when the point cloud is deactivated\\n    if (this.state.isLassoMode) {\\n      this.clearLasso();\\n      this.setState({ isLassoMode: false });\\n    }\\n  };\\n\\n  /**\\n   * Toggles the point cloud layer.\\n   * - If a cloud is loaded and visible: removes it\\n   * - If no cloud is loaded: triggers a fresh load\\n   * The toggle is image-aware, switching to a new image clears the\\n   * previous cloud automatically via the image change event handler.\\n   */\\n  private togglePointCloud = () => {\\n    if (this._pointCloudAcquisition.active || this.state.pointCloudVisible || this.state.pointCloudLoading || this._pointCloudAcquisition.following) {\\n      this.clearPointCloud(true);\\n    } else {\\n      this.loadPointCloudLayer();\\n    }\\n  };\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-lifecycle-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-lifecycle.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited lifecycle references remain)');
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
    console.log(uninstall ? 'Point-cloud lifecycle is already uninstalled. No files changed.' : 'Point-cloud lifecycle is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-lifecycle', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud lifecycle ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Point-cloud lifecycle flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
