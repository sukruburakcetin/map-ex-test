#!/usr/bin/env node
'use strict';
/** Annotation cloud picking installer. Plain source payload.
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
          "before": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudHitRouting } from '../features/point-cloud/PointCloudHitRouting';\nimport type { PointCloudHitGeometry } from '../features/point-cloud/PointCloudHitRouting';\n",
          "after": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudAnnotationPicker } from '../features/field-notes/PointCloudAnnotationPicker';\nimport type { AnnotationMapPoint } from '../features/field-notes/PointCloudAnnotationPicker';\nimport { PointCloudHitRouting } from '../features/point-cloud/PointCloudHitRouting';\nimport type { PointCloudHitGeometry } from '../features/point-cloud/PointCloudHitRouting';\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Route existing SDK hits; enterprise notes, annotation picking and image navigation stay outside. */\n  private _pointCloudHits = new PointCloudHitRouting<__esri.Point & PointCloudHitGeometry>({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Resolve annotation coordinates from live retained cloud data; note creation stays with field notes. */\n  private _annotationCloudPick = new PointCloudAnnotationPicker({\n    readResult: () => this._pointCloudAcquisition.result,\n    isCloudVisible: () => !!this.state.pointCloudVisible,\n    annotate: (lon, lat, altitude) => this.handleAnnotationMapClick(lon, lat, altitude),\n    warn: error => console.warn(\"HitTest failed for Point Cloud\", error),\n  });\n  /** Route existing SDK hits; enterprise notes, annotation picking and image navigation stay outside. */\n  private _pointCloudHits = new PointCloudHitRouting<__esri.Point & PointCloudHitGeometry>({\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 3",
          "before": "      // FIELD NOTES: annotation mode intercepts the click before anything else\n      if (this.state.isAnnotationMode) {\n        try {\n          // 1. \u00d6nce Point Cloud (Nokta Bulutu) 3B grafiklerine mi t\u0131kland\u0131 kontrol et\n          const response = await view.hitTest(evt);\n          const pointCloudHit = response.results.find((r: any) => {\n            const layer = r.layer || (r.graphic && r.graphic.layer);\n            return layer && layer.id === \"point-cloud-layer\";\n          });\n\n          if (pointCloudHit && (pointCloudHit as any).graphic) {\n            const attrs = (pointCloudHit as any).graphic.attributes || {};\n            const rawOriginal = attrs.originalIndex ?? attrs.originalindex;\n            const rawObjectId = attrs.ObjectID ?? attrs.objectid;\n            const originalIdx = rawOriginal !== undefined ? rawOriginal : (rawObjectId || 1) - 1;\n\n            const p = this._pointCloudAcquisition.result?.points[originalIdx];\n\n            if (p) {\n              const exactLon = (p as any).rawLon || p.lon;\n              const exactLat = (p as any).rawLat || p.lat;\n              const exactAlt = p.alt;\n\n              this.handleAnnotationMapClick(exactLon, exactLat, exactAlt);\n              return;\n            }\n          }\n        } catch (e) {\n          console.warn(\"HitTest failed for Point Cloud\", e);\n        }\n\n        // 2. Point Cloud'a tam isabet etmediyse (Veya 2B Ku\u015f Bak\u0131\u015f\u0131 haritadan t\u0131kland\u0131ysa)\n        // Zekice \u00c7\u00f6z\u00fcm: Point Cloud datas\u0131n\u0131 kullanarak t\u0131klad\u0131\u011f\u0131m\u0131z yerin yoku\u015f/zemin y\u00fcksekli\u011fini hesapla!\n        let estimatedAlt: number | undefined = undefined;\n\n        if (this.state.pointCloudVisible && this._pointCloudAcquisition.result) {\n          const clickLat = point.latitude;\n          const clickLon = point.longitude;\n          const localAltitudes: number[] = [];\n\n          // T\u0131klanan koordinat\u0131n 3 metre \u00e7evresindeki t\u00fcm Point Cloud noktalar\u0131n\u0131 bul\n          for (const p of this._pointCloudAcquisition.result.points) {\n            // H\u0131zl\u0131 bounding-box filtresi (Performans i\u00e7in)\n            if (Math.abs(p.lat - clickLat) < 0.00005 && Math.abs(p.lon - clickLon) < 0.00005) {\n              const dist = distanceMeters(clickLat, clickLon, p.lat, p.lon);\n              if (dist < 3.0) {\n                localAltitudes.push(p.alt);\n              }\n            }\n          }\n\n          if (localAltitudes.length > 0) {\n            // Y\u00fckseklikleri k\u00fc\u00e7\u00fckten b\u00fcy\u00fc\u011fe s\u0131rala\n            localAltitudes.sort((a, b) => a - b);\n\n            // A\u011fa\u00e7 tepelerini ve g\u00fcr\u00fclt\u00fcy\u00fc elemek i\u00e7in en alttaki (zemindeki) %10'luk dilimi al\n            const groundIndex = Math.floor(localAltitudes.length * 0.1);\n            estimatedAlt = localAltitudes[groundIndex];\n          }\n        }\n\n        // Hesaplanan yoku\u015f/zemin y\u00fcksekli\u011fini (bulamad\u0131ysa undefined) g\u00f6nder\n        this.handleAnnotationMapClick(point.longitude, point.latitude, estimatedAlt);\n        return;\n      }\n",
          "after": "      // FIELD NOTES: annotation mode intercepts the click before anything else\n      if (this.state.isAnnotationMode) {\n        await this._annotationCloudPick.pick(() => view.hitTest(evt), point as AnnotationMapPoint);\n        return;\n      }\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudAnnotationPicker"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudAnnotationPicker",
          "count": 4
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md annotation cloud picking block 1",
          "before": "\nNo new event, hit test, SDK object, point cache, promise scheduling or navigation policy is owned here. Function comments and baseline tests capture branch consumption, source/filtered indices, tool precedence, center completion and error propagation. Existing tool regression bodies remain unchanged; only harness bindings now route synthetic hits through this feature. Full click-host tokens are unchanged after normalizing the extracted branch.\n",
          "after": "\nNo new event, hit test, SDK object, point cache, promise scheduling or navigation policy is owned here. Function comments and baseline tests capture branch consumption, source/filtered indices, tool precedence, center completion and error propagation. Existing tool regression bodies remain unchanged; only harness bindings now route synthetic hits through this feature. Full click-host tokens are unchanged after normalizing the extracted branch.\n\n## Annotation-mode cloud picking\n\n`src/features/field-notes/PointCloudAnnotationPicker.ts` resolves annotation coordinates from acquisition's current retained full cloud. This belongs with field notes rather than normal cloud-tool hit dispatch: annotation ignores viewer pointIndex, can use exact retained hits while hidden, and otherwise estimates local source altitude. Runtime retains route precedence, annotation-mode interception and note draft/creation callbacks.\n\nThe picker preserves the original hitTest await and post-await live reads, first layer match, originalIndex/ObjectID fallback, raw-coordinate truthiness fallback and exact-hit warning/catch boundary. Fallback estimation retains strict bbox/radius tests and `floor(count * 0.1)` from a temporary numeric altitude sort. No source mutation, point copy, new guard, cache, SDK resource or extra hit-test request is introduced. The original synchronous scan cost remains unchanged.\n\nA field-note contributor README now maps picker, controlled UI, persistence, graphics/viewer and Enterprise helper entry points. Baseline tests cover exact/fallback/error behavior and pending hitTest changes. Normal cloud routing and all surrounding navigation remain unchanged after normalizing only the annotation block.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudAnnotationPicker",
        "## Annotation-mode cloud picking"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudAnnotationPicker",
          "count": 1
        },
        {
          "text": "## Annotation-mode cloud picking",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md annotation cloud picking block 1",
          "before": "Changed: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (route synthetic hits through the new feature; original fixtures/test bodies retained). Added: hit router, 15 baseline-backed cases and frozen original branch. Validation: 279 point-cloud/playback cases; strict routing/actual adapter checks with real SDK hit result and tool/viewer/point types; full TSX parse; structural preservation and guarded installer checks. Host smoke checks remain per-tool cloud clicks, updating-display feedback, highlight/miss behavior, crop/measurement index alignment and ordinary note/object/image navigation.\n\nNext: extract annotation-mode point-cloud picking and local altitude estimation as a separate field-note boundary, preserving its distinct index fallback, coordinate choice, hit-test error handling and annotation-first interception.\n",
          "after": "Changed: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (route synthetic hits through the new feature; original fixtures/test bodies retained). Added: hit router, 15 baseline-backed cases and frozen original branch. Validation: 279 point-cloud/playback cases; strict routing/actual adapter checks with real SDK hit result and tool/viewer/point types; full TSX parse; structural preservation and guarded installer checks. Host smoke checks remain per-tool cloud clicks, updating-display feedback, highlight/miss behavior, crop/measurement index alignment and ordinary note/object/image navigation.\n\nAnnotation-mode cloud picking and local altitude estimation are completed below as a separate field-note boundary.\n\n## Field-note annotation cloud picking and local altitude\n\nExtracted annotation resolution to `src/features/field-notes/PointCloudAnnotationPicker.ts` with a pure local-altitude helper in the same module. Runtime is now 13,251 lines (51 fewer). Typed lazy adapters bind current full-cloud authority, visibility, note callback and the original warning. Runtime retains route/annotation gates, click interception, map-point setup and all subsequent navigation.\n\nFunction comments document degree/meter units, annotation-specific originalIndex/ObjectID lookup, raw-coordinate truthiness fallback, live post-hitTest reads, strict bbox/radius tests, low-percentile selection and original catch scope. Normal cloud-tool routing and utility math are unchanged. No new request, cancellation, event listener, retained cloud, note persistence or scan optimization is introduced.\n\nChanged: runtime, point-cloud contributor README, ownership document and roadmap. Added: annotation picker/helper, field-note contributor README, 15 baseline-backed cases and frozen original annotation branch. Validation: 294 point-cloud/annotation/playback cases; strict actual adapter/SDK hitTest checks; full TSX parse; surrounding click-host token preservation; guarded installer checks. Host validation remains annotation placement in 2D/3D, exact/off-cloud/hidden-cloud picks, slopes, empty data and normal route/image/object/note navigation.\n\nNext: extract field-note annotation activation and draft coordination while preserving panel state, captured map/viewer coordinates, local/shared note paths, feedback and persistence ownership.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudAnnotationPicker",
        "## Field-note annotation cloud picking and local altitude"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudAnnotationPicker",
          "count": 1
        },
        {
          "text": "## Field-note annotation cloud picking and local altitude",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md annotation cloud picking block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Existing cloud-hit dispatch, tool precedence and viewer highlighting | `PointCloudHitRouting.ts` |\n| Tool activation, existing exclusion rules and state-callback coordination | `PointCloudTools.ts` |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Annotation cloud hits/local altitude (field-note policy) | [Field-note picker](../field-notes/README.md) |\n| Existing cloud-hit dispatch, tool precedence and viewer highlighting | `PointCloudHitRouting.ts` |\n| Tool activation, existing exclusion rules and state-callback coordination | `PointCloudTools.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md annotation cloud picking block 2",
          "before": "\nThe feature owns no listener, hitTest, SDK resource, point array or navigation state. Comments explain index spaces and control-flow boundaries. `tests/pointCloudHitRouting.test.cjs` compares the actual call/adapter with a frozen original branch using navigation sentinels, recording owners and held center promises. Existing sight/viewshed suites dispatch synthetic cloud hits through the actual router while retaining their original fixtures/test bodies. Structural checks normalize only this branch and prove all surrounding annotation, enterprise-note and navigation tokens unchanged. Host checks: point picking with each tool, busy-display feedback, highlight/miss clearing, measurement after crop changes and ordinary image/object/note navigation.\n",
          "after": "\nThe feature owns no listener, hitTest, SDK resource, point array or navigation state. Comments explain index spaces and control-flow boundaries. `tests/pointCloudHitRouting.test.cjs` compares the actual call/adapter with a frozen original branch using navigation sentinels, recording owners and held center promises. Existing sight/viewshed suites dispatch synthetic cloud hits through the actual router while retaining their original fixtures/test bodies. Structural checks normalize only this branch and prove all surrounding annotation, enterprise-note and navigation tokens unchanged. Host checks: point picking with each tool, busy-display feedback, highlight/miss clearing, measurement after crop changes and ordinary image/object/note navigation.\n\n## Annotation picking is a field-note boundary\n\nAnnotation resolution now lives in `../field-notes/PointCloudAnnotationPicker.ts`; see the field-note contributor guide. It intentionally keeps original-index/ObjectID lookup and raw-coordinate/visibility behavior separate from the normal cloud-hit router. Acquisition still owns full-cloud points. The annotation mode gate remains in runtime, while the picker runs the supplied hitTest and local altitude scan. Its 15 baseline-backed cases and strict SDK adapter checks preserve the original numerical and warning boundaries.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudAnnotationPicker",
        "## Annotation picking is a field-note boundary"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudAnnotationPicker",
          "count": 1
        },
        {
          "text": "## Annotation picking is a field-note boundary",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/field-notes/PointCloudAnnotationPicker.ts",
      "content": "import { distanceMeters } from '../../utils/geoUtils';\nimport type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';\n\n/** Existing toMap/coverage-fallback coordinates in WGS84 degrees; no projection is added here. */\nexport interface AnnotationMapPoint { longitude: number; latitude: number; }\ninterface CloudHit {\n  layer?: { id?: string };\n  graphic?: { layer?: { id?: string }; attributes?: {\n    originalIndex?: number | null; originalindex?: number | null;\n    ObjectID?: number | null; objectid?: number | null;\n  } };\n}\nexport interface PointCloudAnnotationDependencies {\n  /** Borrow the current retained full cloud after hitTest settles; never a display subset snapshot. */\n  readResult(): PointCloudResult | null;\n  isCloudVisible(): boolean;\n  annotate(longitude: number, latitude: number, altitude?: number): void;\n  warn(error: unknown): void;\n}\n\n/** Estimate source altitude meters using the existing local low sample, without datum correction.\n * Keep strict 0.00005-degree bounding-box and 3 m distance tests, then floor(count * 0.1).\n * Only the temporary altitude list is sorted; source points/order remain borrowed and unchanged.\n */\nexport function estimateAnnotationCloudAltitude(points: readonly PointCloudPoint[], clickLon: number, clickLat: number): number | undefined {\n  const localAltitudes: number[] = [];\n  for (const p of points) {\n    if (Math.abs(p.lat - clickLat) < 0.00005 && Math.abs(p.lon - clickLon) < 0.00005) {\n      const dist = distanceMeters(clickLat, clickLon, p.lat, p.lon);\n      if (dist < 3.0) localAltitudes.push(p.alt);\n    }\n  }\n  if (localAltitudes.length > 0) {\n    localAltitudes.sort((a, b) => a - b);\n    return localAltitudes[Math.floor(localAltitudes.length * 0.1)];\n  }\n  return undefined;\n}\n\n/** Resolve annotation-mode clicks only; route picking and annotation interception remain runtime-owned.\n * No listener, SDK layer, cloud store, note persistence or new request guard is introduced.\n * This path intentionally keeps different index/visibility rules from normal cloud-hit dispatch.\n */\nexport class PointCloudAnnotationPicker {\n  constructor(private readonly dependencies: PointCloudAnnotationDependencies) {}\n\n  /** Run the caller's existing hitTest once, then resolve the live full-cloud point by original index.\n   * Ignore viewer pointIndex; ObjectID arithmetic remains the annotation-specific fallback.\n   * Exact hits use raw coordinates with the original truthy fallback, independent of visibility.\n   * Preserve the original try/catch scope (including exact-hit annotation); fallback annotation\n   * remains outside it. Local estimation requires cloud visibility and falls back to undefined.\n   */\n  async pick(hitTest: () => PromiseLike<{ results: readonly unknown[] }>, point: AnnotationMapPoint): Promise<void> {\n    const d = this.dependencies;\n    try {\n      const response = await hitTest();\n      const hit = response.results.find(result => {\n        const r = result as CloudHit;\n        const layer = r.layer || (r.graphic && r.graphic.layer);\n        return layer && layer.id === 'point-cloud-layer';\n      }) as CloudHit | undefined;\n      if (hit && hit.graphic) {\n        const attrs = hit.graphic.attributes || {};\n        const rawOriginal = attrs.originalIndex ?? attrs.originalindex;\n        const rawObjectId = attrs.ObjectID ?? attrs.objectid;\n        const originalIdx = (rawOriginal !== undefined ? rawOriginal : (rawObjectId || 1) - 1) as number;\n        const p = d.readResult()?.points[originalIdx];\n        if (p) { d.annotate(p.rawLon || p.lon, p.rawLat || p.lat, p.alt); return; }\n      }\n    } catch (error) { d.warn(error); }\n    let estimatedAlt: number | undefined = undefined;\n    if (d.isCloudVisible() && d.readResult()) {\n      const clickLat = point.latitude;\n      const clickLon = point.longitude;\n      estimatedAlt = estimateAnnotationCloudAltitude(d.readResult()!.points, clickLon, clickLat);\n    }\n    d.annotate(point.longitude, point.latitude, estimatedAlt);\n  }\n}\n"
    },
    {
      "file": "src/features/field-notes/README.md",
      "content": "# Field-note contributor entry points\n\n| Concern | Entry point |\n| --- | --- |\n| Annotation-mode cloud hits and local altitude estimation | `PointCloudAnnotationPicker.ts` |\n| Controlled note panels, drafts and editor | `NoteToolsSection.tsx`, `NoteDraftForm.tsx`, `NoteEditor.tsx` |\n| Local/shared lists and attachments | `LocalNotesList.tsx`, `EnterpriseNotesList.tsx`, `NoteAttachments.tsx`, `attachmentFiles.ts` |\n| Local persistence and GeoJSON conversion | `localPersistence.ts`, `geoJson.ts` |\n| Plain map graphic descriptors and pending marker | `mapGraphic.ts`, `PendingNoteMarker.ts` |\n| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining activation, draft, SDK and persistence orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n\n`PointCloudAnnotationPicker.pick` runs the existing caller-supplied hitTest and resolves annotation coordinates. Runtime keeps route-pick precedence, the annotation-mode gate and its unconditional return, toMap/coverage fallback, and note draft/creation behavior. No event listener, cloud cache, layer, persistence or extra hit test is owned here.\n\nExact cloud hits resolve the current retained full-cloud point after hitTest settles. Keep first-layer-match semantics, originalIndex aliases and ObjectID arithmetic. Annotation ignores pointIndex and does not require the cloud to be visible. Raw longitude/latitude keep the existing truthy fallback to shifted coordinates; altitude remains the source value with no datum conversion.\n\nIf exact picking does not resolve a point, local estimation requires current visibility and a retained result. `estimateAnnotationCloudAltitude` keeps strict 0.00005-degree bbox and 3 m distance tests, numeric sorting of a temporary altitude list and sample index `floor(count * 0.1)`. It borrows points and preserves their order; no interpolation, sampling cap or new coordinate correction is introduced. No candidates returns undefined altitude. This synchronous full-cloud scan keeps its original computational behavior.\n\nThe original try/catch includes hitTest, index lookup and exact-hit annotation. Its warning remains unchanged; fallback annotation remains outside that catch. Result, visibility and fallback map-point reads stay live after await. The runtime adds no cancellation or mode recheck to this refactor.\n\nFunction comments document coordinate units, index policy, authority and catch boundaries. `tests/annotationCloudPicking.test.cjs` compares actual adapters against a frozen original branch with real distance math and held hitTests. It covers exact/fallback coordinates, aliases/visibility, percentile/bbox/radius behavior, cloud replacement, point mutation, errors and click interception. Host smoke checks: 2D/3D note placement on and off cloud points, hidden/empty cloud, sloped terrain and normal route/image/object/note navigation.\n"
    },
    {
      "file": "tests/annotationCloudPicking.test.cjs",
      "content": "/** Frozen original annotation branch versus actual feature adapter and real distance math.\n * Held hitTests expose live result/visibility/point reads and original warning/annotation catch scope.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst geo=ts.createSourceFile('geo.ts',fs.readFileSync(root+'/src/utils/geoUtils.ts','utf8'),ts.ScriptTarget.Latest,true);const distanceMeters=new Function(compile(geo.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text==='distanceMeters').getText(geo).replace(/^export /,'')+';return distanceMeters;'))();\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/PointCloudAnnotationPicker.ts','utf8')))(()=>({distanceMeters}),m,m.exports);\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/annotationCloudPicking.baseline.json','utf8'));const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),adapter=cl.members.find(n=>n.name?.getText(sf)==='_annotationCloudPick').getText(sf);\nconst call='await this._annotationCloudPick.pick(() => view.hitTest(evt), point as AnnotationMapPoint);';assert.equal(source.split(call).length,2);\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};\nconst point=(lon=0,lat=0,alt=10)=>({lon,lat,rawLon:1,rawLat:2,alt});const hit=(attributes={originalIndex:0})=>({layer:{id:'point-cloud-layer'},graphic:{attributes}});\nfunction setup(kind,{hold=false,hitResults=[]}={}){\n const trace=[],pending=deferred();let annotateHook=()=>{},hitHook=()=>{};\n const Harness=new Function('PointCloudAnnotationPicker','distanceMeters','console',compile('class Widget{'+(kind==='working'?adapter:'')+'async click(view:any,evt:any,point:any){if(this.state.isAnnotationMode){'+(kind==='baseline'?fixture.branch:call)+'return;}this.navigate();}};return Widget;'))(m.exports.PointCloudAnnotationPicker,distanceMeters,{warn:(label,error)=>trace.push(['warn',label,error.message])});\n const w=new Harness(),points=[point(0,0,12),point(.000001,0,20)];w.state={isAnnotationMode:true,pointCloudVisible:true};w._pointCloudAcquisition={result:{points}};w.handleAnnotationMapClick=(...args)=>{trace.push(['annotate',...args]);annotateHook(...args)};w.navigate=()=>trace.push(['navigate']);\n const evt={x:2,y:3},mapPoint={longitude:0,latitude:0};const view={hitTest:arg=>{assert.strictEqual(arg,evt);trace.push(['hitTest']);hitHook();return hold?pending.promise:Promise.resolve({results:hitResults})}};\n return{w,trace,points,pending,mapPoint,view,click:()=>w.click(view,evt,mapPoint),onAnnotation:fn=>annotateHook=fn,onHit:fn=>hitHook=fn};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b}\ntest('exact cloud hit uses original raw coordinates/source altitude and consumes annotation click',async()=>{await compare(async h=>{await h.click();assert.deepEqual(h.trace,[['hitTest'],['annotate',1,2,12]])},{hitResults:[hit()]})});\ntest('annotation aliases/ObjectID fallback ignore filtered viewer pointIndex',async()=>{for(const attrs of [{originalindex:1},{originalIndex:0,originalindex:1},{ObjectID:2},{objectid:2},{ObjectID:0,pointIndex:1},{pointIndex:1},{originalIndex:null,originalindex:1}])await compare(async h=>{await h.click()},{hitResults:[hit(attrs)]})});\ntest('exact hit remains available when cloud hidden and retains raw-zero truthy fallback',async()=>{await compare(async h=>{h.w.state.pointCloudVisible=false;h.points[0].rawLon=0;h.points[0].rawLat=0;await h.click();assert.deepEqual(h.trace.at(-1),['annotate',0,0,12])},{hitResults:[hit()]})});\ntest('local estimate retains floor(count * 0.1), numeric sort and source order for sample sizes',async()=>{for(const count of [1,9,10,20])await compare(async h=>{const points=Array.from({length:count},(_,i)=>point(0,0,count-i));h.w._pointCloudAcquisition.result={points};const before=structuredClone(points);points.forEach(Object.freeze);Object.freeze(points);await h.click();assert.equal(h.trace.at(-1)[3],1+Math.floor(count*.1));assert.deepEqual(points,before)})});\ntest('strict bbox and 3m distance filters retain original boundary behavior',async()=>{await compare(async h=>{const rad=180/Math.PI/6371000;h.w._pointCloudAcquisition.result={points:[point(2.999*rad,0,7),point(3.001*rad,0,-100)]};await h.click();assert.equal(h.trace.at(-1)[3],7)});await compare(async h=>{h.mapPoint.latitude=85;h.w._pointCloudAcquisition.result={points:[point(.00005,85,-100),point(.000049,85,9)]};await h.click();assert.equal(h.trace.at(-1)[3],9)})});\ntest('hidden/missing/empty or distant cloud falls back to undefined altitude',async()=>{for(const missing of ['visible','result','empty','distant'])await compare(async h=>{if(missing==='visible')h.w.state.pointCloudVisible=false;if(missing==='result')h.w._pointCloudAcquisition.result=null;if(missing==='empty')h.w._pointCloudAcquisition.result.points=[];if(missing==='distant')h.w._pointCloudAcquisition.result.points=[point(1,1)];await h.click();assert.deepEqual(h.trace.at(-1),['annotate',0,0,undefined])})});\ntest('exact lookup uses replacement retained result after hitTest settles',async()=>{await compare(async h=>{const task=h.click();h.w._pointCloudAcquisition.result={points:[{...point(3,4,99),rawLon:5,rawLat:6}]};h.pending.resolve({results:[hit()]});await task;assert.deepEqual(h.trace.at(-1),['annotate',5,6,99])},{hold:true})});\ntest('fallback reads live visibility and map point after await',async()=>{await compare(async h=>{const task=h.click();h.w.state.pointCloudVisible=false;h.mapPoint.longitude=7;h.mapPoint.latitude=8;h.pending.resolve({results:[]});await task;assert.deepEqual(h.trace.at(-1),['annotate',7,8,undefined])},{hold:true})});\ntest('rejected hitTest warns with exact message then estimates fallback altitude',async()=>{await compare(async h=>{const task=h.click();h.pending.reject(Error('hit failed'));await task;assert.deepEqual(h.trace[1],['warn','HitTest failed for Point Cloud','hit failed']);assert.equal(h.trace.at(-1)[3],12)},{hold:true})});\ntest('synchronous hitTest error keeps warning/fallback behavior',async()=>{await compare(async h=>{h.onHit(()=>{throw Error('sync hit')});await h.click();assert.equal(h.trace[1][0],'warn');assert.equal(h.trace.at(-1)[0],'annotate')})});\ntest('first layer match and top-level layer precedence retain annotation fallback rules',async()=>{for(const results of [[{layer:{id:'point-cloud-layer'}},hit({originalIndex:1})],[{layer:{id:'other'},graphic:{layer:{id:'point-cloud-layer'},attributes:{originalIndex:1}}}],[{graphic:{layer:{id:'point-cloud-layer'},attributes:{originalIndex:1}}}]])await compare(async h=>{await h.click()},{hitResults:results})});\ntest('malformed hit-list error is caught before fallback without adding new shape validation',async()=>{await compare(async h=>{await h.click();assert.equal(h.trace[1][0],'warn');assert.equal(h.trace.at(-1)[0],'annotate')},{hitResults:[null]})});\ntest('exact-hit annotation exception retains original warning and fallback retry scope',async()=>{await compare(async h=>{let first=true;h.onAnnotation(()=>{if(first){first=false;throw Error('exact note failed')}});await h.click();assert.deepEqual(h.trace.map(x=>x[0]),['hitTest','annotate','warn','annotate'])},{hitResults:[hit()]})});\ntest('fallback annotation exception propagates without warning or duplicate annotation',async()=>{await compare(async h=>{h.onAnnotation(()=>{throw Error('fallback failed')});await assert.rejects(h.click(),{message:'fallback failed'});assert.deepEqual(h.trace.map(x=>x[0]),['hitTest','annotate'])})});\ntest('annotation gate stays at click time and consumes pending click even after mode changes',async()=>{await compare(async h=>{const task=h.click();h.w.state.isAnnotationMode=false;h.pending.resolve({results:[]});await task;assert(!h.trace.some(x=>x[0]==='navigate'));await h.click();assert.equal(h.trace.at(-1)[0],'navigate')},{hold:true})});\n"
    },
    {
      "file": "tests/fixtures/annotationCloudPicking.baseline.json",
      "content": "{\n  \"branch\": \"        try {\\n          // 1. \\u00d6nce Point Cloud (Nokta Bulutu) 3B grafiklerine mi t\\u0131kland\\u0131 kontrol et\\n          const response = await view.hitTest(evt);\\n          const pointCloudHit = response.results.find((r: any) => {\\n            const layer = r.layer || (r.graphic && r.graphic.layer);\\n            return layer && layer.id === \\\"point-cloud-layer\\\";\\n          });\\n\\n          if (pointCloudHit && (pointCloudHit as any).graphic) {\\n            const attrs = (pointCloudHit as any).graphic.attributes || {};\\n            const rawOriginal = attrs.originalIndex ?? attrs.originalindex;\\n            const rawObjectId = attrs.ObjectID ?? attrs.objectid;\\n            const originalIdx = rawOriginal !== undefined ? rawOriginal : (rawObjectId || 1) - 1;\\n\\n            const p = this._pointCloudAcquisition.result?.points[originalIdx];\\n\\n            if (p) {\\n              const exactLon = (p as any).rawLon || p.lon;\\n              const exactLat = (p as any).rawLat || p.lat;\\n              const exactAlt = p.alt;\\n\\n              this.handleAnnotationMapClick(exactLon, exactLat, exactAlt);\\n              return;\\n            }\\n          }\\n        } catch (e) {\\n          console.warn(\\\"HitTest failed for Point Cloud\\\", e);\\n        }\\n\\n        // 2. Point Cloud'a tam isabet etmediyse (Veya 2B Ku\\u015f Bak\\u0131\\u015f\\u0131 haritadan t\\u0131kland\\u0131ysa)\\n        // Zekice \\u00c7\\u00f6z\\u00fcm: Point Cloud datas\\u0131n\\u0131 kullanarak t\\u0131klad\\u0131\\u011f\\u0131m\\u0131z yerin yoku\\u015f/zemin y\\u00fcksekli\\u011fini hesapla!\\n        let estimatedAlt: number | undefined = undefined;\\n\\n        if (this.state.pointCloudVisible && this._pointCloudAcquisition.result) {\\n          const clickLat = point.latitude;\\n          const clickLon = point.longitude;\\n          const localAltitudes: number[] = [];\\n\\n          // T\\u0131klanan koordinat\\u0131n 3 metre \\u00e7evresindeki t\\u00fcm Point Cloud noktalar\\u0131n\\u0131 bul\\n          for (const p of this._pointCloudAcquisition.result.points) {\\n            // H\\u0131zl\\u0131 bounding-box filtresi (Performans i\\u00e7in)\\n            if (Math.abs(p.lat - clickLat) < 0.00005 && Math.abs(p.lon - clickLon) < 0.00005) {\\n              const dist = distanceMeters(clickLat, clickLon, p.lat, p.lon);\\n              if (dist < 3.0) {\\n                localAltitudes.push(p.alt);\\n              }\\n            }\\n          }\\n\\n          if (localAltitudes.length > 0) {\\n            // Y\\u00fckseklikleri k\\u00fc\\u00e7\\u00fckten b\\u00fcy\\u00fc\\u011fe s\\u0131rala\\n            localAltitudes.sort((a, b) => a - b);\\n\\n            // A\\u011fa\\u00e7 tepelerini ve g\\u00fcr\\u00fclt\\u00fcy\\u00fc elemek i\\u00e7in en alttaki (zemindeki) %10'luk dilimi al\\n            const groundIndex = Math.floor(localAltitudes.length * 0.1);\\n            estimatedAlt = localAltitudes[groundIndex];\\n          }\\n        }\\n\\n        // Hesaplanan yoku\\u015f/zemin y\\u00fcksekli\\u011fini (bulamad\\u0131ysa undefined) g\\u00f6nder\\n        this.handleAnnotationMapClick(point.longitude, point.latitude, estimatedAlt);\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'annotation-cloud-picking-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-annotation-cloud-picking.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited annotation-picking references remain)');
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
    console.log(uninstall ? 'Annotation cloud picking is already uninstalled. No files changed.' : 'Annotation cloud picking is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'annotation-cloud-picking', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Annotation cloud picking ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Annotation cloud picking flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
