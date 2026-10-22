#!/usr/bin/env node
'use strict';
/** Point-cloud hit routing installer. Plain source payload.
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
          "before": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudTools } from '../features/point-cloud/PointCloudTools';\nimport { showPointCloudToolFeedback } from '../features/point-cloud/PointCloudToolFeedback';\n",
          "after": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudHitRouting } from '../features/point-cloud/PointCloudHitRouting';\nimport type { PointCloudHitGeometry } from '../features/point-cloud/PointCloudHitRouting';\nimport { PointCloudTools } from '../features/point-cloud/PointCloudTools';\nimport { showPointCloudToolFeedback } from '../features/point-cloud/PointCloudToolFeedback';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind tool policy to live React state and existing feature owners; no new resources. */\n  private _pointCloudTools = new PointCloudTools({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Route existing SDK hits; enterprise notes, annotation picking and image navigation stay outside. */\n  private _pointCloudHits = new PointCloudHitRouting<__esri.Point & PointCloudHitGeometry>({\n    readState: () => this.state,\n    readResult: () => this._pointCloudAcquisition.result,\n    mapUpdating: () => !!this._pointCloudMapLayer?.updating,\n    setMeasurement: (points, callback) => this.setState({ measurePoints: points }, callback),\n    updateMeasurement: () => this.updateMeasurementGraphics(),\n    readSight: () => this._sight,\n    placeViewshed: geometry => this.ensureViewshedOwner().place(geometry),\n    readRenderer: () => this._pointCloudViewerRenderer,\n    readViewer: () => this.mapillaryViewer,\n    notifyUpdating: () => this.showToast(\"Updating point-cloud display. Select the point again in a moment.\", 2000),\n  });\n  /** Bind tool policy to live React state and existing feature owners; no new resources. */\n  private _pointCloudTools = new PointCloudTools({\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 3",
          "before": "\n\n        const pointCloudHit = response.results.find((r: any) => {\n          const layer = r.layer || (r.graphic && r.graphic.layer);\n          return layer && layer.id === \"point-cloud-layer\";\n        });\n\n        if (pointCloudHit && (pointCloudHit as any).graphic) {\n          if (this._pointCloudMapLayer?.updating) { this.showToast(\"Updating point-cloud display. Select the point again in a moment.\", 2000); return; }\n          const attrs = (pointCloudHit as any).graphic.attributes || {};\n          const geom = (pointCloudHit as any).graphic.geometry;\n\n          // Safely handle ArcGIS lowercasing field names randomly\n          const rawOriginal = attrs.originalIndex ?? attrs.originalindex;\n          const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;\n          const rawObjectId = attrs.ObjectID ?? attrs.objectid;\n\n          // Grab filtered index (For Viewer Highlighting)\n          const idx = rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1;\n\n          // Grab original index (For raw data lookup)\n          const originalIdx = rawOriginal !== undefined ? rawOriginal : idx;\n\n          if (this.state.isMeasureMode) {\n            const p = this._pointCloudAcquisition.result?.points[originalIdx];\n            if (p) {\n              const newPt = {\n                mapLon: geom.longitude,\n                mapLat: geom.latitude,\n                mapZ: geom.z,\n                rawLon: (p as any).rawLon || p.lon,\n                rawLat: (p as any).rawLat || p.lat,\n                alt: p.alt,\n              };\n\n              let newPoints = [...this.state.measurePoints, newPt];\n              if (newPoints.length > 2) {\n                newPoints = [newPt];\n              }\n\n              this.setState({ measurePoints: newPoints }, () => {\n                this.updateMeasurementGraphics();\n              });\n            }\n            return; // Stop here so it doesn't trigger anything else!\n          }\n\n          // SIGHT MODE\n          if (this.state.isSightMode && this._sight?.ready) {\n            this._sight.place(geom);\n            return;\n          }\n\n          // VIEWSHED MODE LOGIC\n          if (this.state.isViewshedMode && this.state.jimuMapView) {\n            void this.ensureViewshedOwner().place(geom);\n            return;\n          }\n\n          if (this._pointCloudViewerRenderer) {\n            this._pointCloudViewerRenderer.setHighlight(idx); // Use filtered index for WebGL\n            if (this.mapillaryViewer) {\n              this.mapillaryViewer.resize();\n              this.mapillaryViewer\n                .getCenter()\n                .then((c: number[]) => {\n                  this.mapillaryViewer.setCenter([c[0], c[1]]);\n                })\n                .catch(() => {});\n            }\n          }\n          return;\n        } else {\n          if (this._pointCloudViewerRenderer) {\n            this._pointCloudViewerRenderer.setHighlight(-1);\n            if (this.mapillaryViewer) this.mapillaryViewer.resize();\n          }\n        }\n\n        // A valid individual image preview owns this click. Otherwise blue route\n",
          "after": "\n\n        if (this._pointCloudHits.route(response.results)) return;\n\n        // A valid individual image preview owns this click. Otherwise blue route\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudHitRouting"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudHitRouting",
          "count": 4
        }
      ]
    },
    {
      "file": "tests/pointCloudSight.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudSight.test.cjs point-cloud result application block 1",
          "before": "const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudSight.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudSight.ts','utf8')))(m,m.exports);const {PointCloudSight}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleSightMode','clearSight','toggleMeasureMode','toggleViewshedMode','toggleLassoMode'];if(kind==='baseline')names.push('applySightHit');else names.push('_pointCloudTools','ensureSightOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplySightHit(geom:any){\\n'+text.slice(text.indexOf('          // SIGHT MODE'),text.indexOf('          // VIEWSHED MODE LOGIC'))+'\\n}':'')}\nconst tools={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(tools,tools.exports);\nconst toolFeedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Viewshed:'viewshed',Measure:'measure'},toolFeedback,toolFeedback.exports);\n",
          "after": "const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudSight.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudSight.ts','utf8')))(m,m.exports);const {PointCloudSight}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleSightMode','clearSight','toggleMeasureMode','toggleViewshedMode','toggleLassoMode'];if(kind==='baseline')names.push('applySightHit');else names.push('_pointCloudHits','_pointCloudTools','ensureSightOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplySightHit(geom:any){ this._pointCloudHits.route([{ layer:{id:\"point-cloud-layer\"}, graphic:{geometry:geom} }]); }':'')}\nconst routing={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudHitRouting.ts','utf8')))(routing,routing.exports);\nconst tools={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(tools,tools.exports);\nconst toolFeedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Viewshed:'viewshed',Measure:'measure'},toolFeedback,toolFeedback.exports);\n"
        },
        {
          "label": "tests/pointCloudSight.test.cjs point-cloud result application block 2",
          "before": " class Model{constructor(properties){this.view=properties.view;this.id=models.length;this.targets={add:properties=>{this.points.push(properties.location);trace.push(['target',this.id,properties])}};this.points=[];models.push(this);trace.push(['create',this.id,views.indexOf(this.view)])}set observer(value){this.observerValue=value;trace.push(['observer',this.id,value])}clear(){trace.push(['clear',this.id]);this.points=[];this.observerValue=null}destroy(){trace.push(['destroy',this.id]);this.destroyed=true}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Model]);return d.promise};\n const Harness=new Function('PointCloudSight','loadArcGISJSAPIModules','jsx','Icons','console','PointCloudTools','showPointCloudToolFeedback',compile('class Harness{'+methods(kind)+'};return Harness;'))(PointCloudSight,load,(tag,props,...children)=>({tag,props:props||{},children}),{Measure:'measure',Viewshed:'viewshed'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))},tools.exports.PointCloudTools,toolFeedback.exports.showPointCloudToolFeedback);w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};views.push(v);return v}\n w.state={jimuMapView:{view:view()},isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isViewshedMode:false,isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._sight=null;w._sightViewModel=null;\n",
          "after": " class Model{constructor(properties){this.view=properties.view;this.id=models.length;this.targets={add:properties=>{this.points.push(properties.location);trace.push(['target',this.id,properties])}};this.points=[];models.push(this);trace.push(['create',this.id,views.indexOf(this.view)])}set observer(value){this.observerValue=value;trace.push(['observer',this.id,value])}clear(){trace.push(['clear',this.id]);this.points=[];this.observerValue=null}destroy(){trace.push(['destroy',this.id]);this.destroyed=true}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Model]);return d.promise};\n const Harness=new Function('PointCloudSight','loadArcGISJSAPIModules','jsx','Icons','console','PointCloudTools','showPointCloudToolFeedback','PointCloudHitRouting',compile('class Harness{'+methods(kind)+'};return Harness;'))(PointCloudSight,load,(tag,props,...children)=>({tag,props:props||{},children}),{Measure:'measure',Viewshed:'viewshed'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))},tools.exports.PointCloudTools,toolFeedback.exports.showPointCloudToolFeedback,routing.exports.PointCloudHitRouting);w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};views.push(v);return v}\n w.state={jimuMapView:{view:view()},isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isViewshedMode:false,isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._sight=null;w._sightViewModel=null;\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudHitRouting"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudHitRouting",
          "count": 3
        }
      ]
    },
    {
      "file": "tests/pointCloudViewshed.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudViewshed.test.cjs point-cloud result application block 1",
          "before": "const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudViewshed.ts','utf8')))(m,m.exports);const {PointCloudViewshed}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['clearViewshed','toggleViewshedMode','toggleMeasureMode','toggleLassoMode'];names.push(kind==='baseline'?'applyViewshedHit':'ensureViewshedOwner');if(kind==='working')names.push('_pointCloudTools');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplyViewshedHit(geom:any){\\n'+text.slice(text.indexOf('          // VIEWSHED MODE LOGIC'),text.indexOf('\\n          if (this._pointCloudViewerRenderer)',text.indexOf('          // VIEWSHED MODE LOGIC')))+'\\n}':'')}\nconst tools={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(tools,tools.exports);\nconst toolFeedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Viewshed:'viewshed',Measure:'measure'},toolFeedback,toolFeedback.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudViewshed','loadArcGISJSAPIModules','jsx','Icons','console','PointCloudTools','showPointCloudToolFeedback',compile('class Harness{'+methods(kind)+'};return Harness;'));\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve()},point=(z=10)=>({longitude:20,latitude:30,z});\nfunction setup(kind,{hold=false,batched=false}={}){\n",
          "after": "const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudViewshed.ts','utf8')))(m,m.exports);const {PointCloudViewshed}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['clearViewshed','toggleViewshedMode','toggleMeasureMode','toggleLassoMode'];names.push(kind==='baseline'?'applyViewshedHit':'ensureViewshedOwner');if(kind==='working')names.push('_pointCloudHits','_pointCloudTools');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplyViewshedHit(geom:any){ this._pointCloudHits.route([{ layer:{id:\"point-cloud-layer\"}, graphic:{geometry:geom} }]); }':'')}\nconst routing={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudHitRouting.ts','utf8')))(routing,routing.exports);\nconst tools={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(tools,tools.exports);\nconst toolFeedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Viewshed:'viewshed',Measure:'measure'},toolFeedback,toolFeedback.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudViewshed','loadArcGISJSAPIModules','jsx','Icons','console','PointCloudTools','showPointCloudToolFeedback','PointCloudHitRouting',compile('class Harness{'+methods(kind)+'};return Harness;'));\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve()},point=(z=10)=>({longitude:20,latitude:30,z});\nfunction setup(kind,{hold=false,batched=false}={}){\n"
        },
        {
          "label": "tests/pointCloudViewshed.test.cjs point-cloud result application block 2",
          "before": " class Analysis{constructor(properties){Object.assign(this,properties);this.id=analyses.length;analyses.push(this);trace.push(['analysis',this.id,structuredClone(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.id])}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Analysis,Viewshed,Point]);return d.promise};\n const Harness=classes[kind](PointCloudViewshed,load,(tag,props,...children)=>({tag,props:props||{},children}),{Viewshed:'viewshed',Measure:'measure'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))},tools.exports.PointCloudTools,toolFeedback.exports.showPointCloudToolFeedback);const w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};const collection={items:[],add(a){this.items.push(a);trace.push(['add',views.indexOf(v),a.id])},remove(a){this.items=this.items.filter(x=>x!==a);trace.push(['remove',views.indexOf(v),a.id])}};v.analyses=collection;views.push(v);return v}\n w.state={jimuMapView:{view:view()},isViewshedMode:false,isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._viewshed=null;w._viewshedAnalysis=null;\n",
          "after": " class Analysis{constructor(properties){Object.assign(this,properties);this.id=analyses.length;analyses.push(this);trace.push(['analysis',this.id,structuredClone(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.id])}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Analysis,Viewshed,Point]);return d.promise};\n const Harness=classes[kind](PointCloudViewshed,load,(tag,props,...children)=>({tag,props:props||{},children}),{Viewshed:'viewshed',Measure:'measure'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))},tools.exports.PointCloudTools,toolFeedback.exports.showPointCloudToolFeedback,routing.exports.PointCloudHitRouting);const w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};const collection={items:[],add(a){this.items.push(a);trace.push(['add',views.indexOf(v),a.id])},remove(a){this.items=this.items.filter(x=>x!==a);trace.push(['remove',views.indexOf(v),a.id])}};v.analyses=collection;views.push(v);return v}\n w.state={jimuMapView:{view:view()},isViewshedMode:false,isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._viewshed=null;w._viewshedAnalysis=null;\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudHitRouting"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudHitRouting",
          "count": 3
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud result application block 1",
          "before": "\nSight activation is awaited only inside its existing async state callback. Viewshed's public async wrapper still does not wait for its state callback; the remaining toggles return void. No independent mode state, SDK lifetime, timer or exception policy is introduced. Comments and baseline tests capture exact patch/cleanup/feedback order, all flag combinations, batching/replay and activation failure. Existing sight/viewshed regression bodies remain unchanged.\n",
          "after": "\nSight activation is awaited only inside its existing async state callback. Viewshed's public async wrapper still does not wait for its state callback; the remaining toggles return void. No independent mode state, SDK lifetime, timer or exception policy is introduced. Comments and baseline tests capture exact patch/cleanup/feedback order, all flag combinations, batching/replay and activation failure. Existing sight/viewshed regression bodies remain unchanged.\n\n## Point-cloud hit routing\n\n`PointCloudHitRouting.ts` consumes already-tested SDK hit results. Runtime retains hitTest calls, route/annotation interception, enterprise-note popup precedence and all later image/object/coverage navigation. The route call returns consumed/not-consumed synchronously and remains inside the existing try/catch.\n\nPreserve the first matching cloud layer, mixed-case/nullish attribute fallbacks and full-cloud versus filtered-viewer index spaces. Busy-map feedback consumes the click. Tool precedence remains measurement, ready sight, viewshed with map view, then highlight; a miss clears highlight before normal navigation continues. Measurement stores copied coordinate values and uses the original state callback, while sight/viewshed borrow graphic geometry directly. Viewer center refresh retains its live replacement-viewer read and swallowed async failure behavior.\n\nNo new event, hit test, SDK object, point cache, promise scheduling or navigation policy is owned here. Function comments and baseline tests capture branch consumption, source/filtered indices, tool precedence, center completion and error propagation. Existing tool regression bodies remain unchanged; only harness bindings now route synthetic hits through this feature. Full click-host tokens are unchanged after normalizing the extracted branch.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudHitRouting",
        "## Point-cloud hit routing"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudHitRouting",
          "count": 1
        },
        {
          "text": "## Point-cloud hit routing",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud result application block 1",
          "before": "Changed: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (actual feature bindings only; original fixtures/test bodies retained). Added: tool coordinator, feedback module, 15 baseline-backed cases and frozen original toggles. Validation: 264 point-cloud/playback cases; strict policy/feedback/actual runtime boundary checks with actual sight/ArcGIS types and local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Host validation remains per-tool activation/clear, switching with analyses present, rapid sight activation, lasso and cloud teardown.\n\nNext: extract point-cloud hit routing and tool click dispatch, preserving hit-test order, geometry handling, measurement/sight/viewshed precedence, viewer highlight and image-navigation behavior.\n",
          "after": "Changed: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (actual feature bindings only; original fixtures/test bodies retained). Added: tool coordinator, feedback module, 15 baseline-backed cases and frozen original toggles. Validation: 264 point-cloud/playback cases; strict policy/feedback/actual runtime boundary checks with actual sight/ArcGIS types and local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Host validation remains per-tool activation/clear, switching with analyses present, rapid sight activation, lasso and cloud teardown.\n\nCloud-hit routing is completed below with hit-test order, geometry handling, tool precedence, viewer highlighting and image navigation retained.\n\n## Point-cloud hit routing and tool dispatch\n\nExtracted the normal cloud-hit branch into `src/features/point-cloud/PointCloudHitRouting.ts`. Runtime is now 13,302 lines (60 fewer), with typed live owner/state adapters and one consumed-click call. HitTest, annotation picking, enterprise-note precedence, route/object/coverage navigation and the surrounding error handler remain in runtime. Structural checks prove the click-host member is token-identical after normalizing only the extracted branch; all other existing members are token-identical.\n\nFunction comments document full-cloud versus filtered-viewer indices, SDK shape assertions, original alias/fallback rules, measurement/sight/viewshed precedence, synchronous consumption and async viewer-center refresh. Tool/map/viewer owners are unchanged. No hit-test invocation, event listener, resource, cloud copy or navigation policy is introduced.\n\nChanged: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (route synthetic hits through the new feature; original fixtures/test bodies retained). Added: hit router, 15 baseline-backed cases and frozen original branch. Validation: 279 point-cloud/playback cases; strict routing/actual adapter checks with real SDK hit result and tool/viewer/point types; full TSX parse; structural preservation and guarded installer checks. Host smoke checks remain per-tool cloud clicks, updating-display feedback, highlight/miss behavior, crop/measurement index alignment and ordinary note/object/image navigation.\n\nNext: extract annotation-mode point-cloud picking and local altitude estimation as a separate field-note boundary, preserving its distinct index fallback, coordinate choice, hit-test error handling and annotation-first interception.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudHitRouting",
        "## Point-cloud hit routing",
        "## Point-cloud hit routing and tool dispatch"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudHitRouting",
          "count": 1
        },
        {
          "text": "## Point-cloud hit routing",
          "count": 1
        },
        {
          "text": "## Point-cloud hit routing and tool dispatch",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Tool activation, existing exclusion rules and state-callback coordination | `PointCloudTools.ts` |\n| Tool instructions, icons and toast durations | `PointCloudToolFeedback.tsx` |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Existing cloud-hit dispatch, tool precedence and viewer highlighting | `PointCloudHitRouting.ts` |\n| Tool activation, existing exclusion rules and state-callback coordination | `PointCloudTools.ts` |\n| Tool instructions, icons and toast durations | `PointCloudToolFeedback.tsx` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 2",
          "before": "\nThe coordinator owns no SDK object, request, timer, flag mirror or point data. Function comments document callback phases and deliberate asymmetries. `tests/pointCloudTools.test.cjs` compares actual adapters/feedback against frozen original toggles for all 16 flag combinations, batched/replayed updaters, callback-time reads, rapid toggles, return values and activation rejection. Existing sight/viewshed suites bind this feature with original fixtures/test bodies intact. Host checks: enable/disable each tool, switch tools with active analyses, rapid toggles while sight loads, lasso interactions and cloud clear.\n",
          "after": "\nThe coordinator owns no SDK object, request, timer, flag mirror or point data. Function comments document callback phases and deliberate asymmetries. `tests/pointCloudTools.test.cjs` compares actual adapters/feedback against frozen original toggles for all 16 flag combinations, batched/replayed updaters, callback-time reads, rapid toggles, return values and activation rejection. Existing sight/viewshed suites bind this feature with original fixtures/test bodies intact. Host checks: enable/disable each tool, switch tools with active analyses, rapid toggles while sight loads, lasso interactions and cloud clear.\n\n## Cloud-hit dispatch\n\n`PointCloudHitRouting.ts` routes an already-computed SDK hit result list. Runtime still owns `view.hitTest`, enterprise-note precedence, annotation-mode picking and subsequent route/object/coverage image navigation. The single call returns true when the cloud consumes the click; a miss clears viewer highlight and returns false to continue normal navigation.\n\n- Keep the first matching `point-cloud-layer` result and the original top-level-layer/graphic-layer lookup. A matching result without a graphic retains miss behavior; do not silently choose a later match.\n- An updating map consumes the hit with the same 2000 ms retry toast. Attribute aliases and fallback rules remain unchanged: `originalIndex` addresses the retained full cloud, `pointIndex` addresses the filtered viewer, and ObjectID fallback remains the existing arithmetic. SDK boundary casts do not normalize values.\n- Dispatch precedence stays measurement \u2192 ready sight \u2192 viewshed with a map-view reference \u2192 highlight. Measurement consumes a hit even if no source point is found; it copies map geometry plus original point coordinates/altitude, resets after a third point, and redraws through the same state callback.\n- Sight/viewshed receive the same borrowed geometry object. Highlighting resizes and performs the existing asynchronous center refresh. Completion re-reads the current viewer and keeps swallowed refresh errors; no new stale-viewer policy is introduced.\n- A cloud miss clears highlight and optionally resizes before navigation continues. A cloud hit is consumed even when no viewer renderer exists. Synchronous errors still reach the original outer click-handler catch.\n\nThe feature owns no listener, hitTest, SDK resource, point array or navigation state. Comments explain index spaces and control-flow boundaries. `tests/pointCloudHitRouting.test.cjs` compares the actual call/adapter with a frozen original branch using navigation sentinels, recording owners and held center promises. Existing sight/viewshed suites dispatch synthetic cloud hits through the actual router while retaining their original fixtures/test bodies. Structural checks normalize only this branch and prove all surrounding annotation, enterprise-note and navigation tokens unchanged. Host checks: point picking with each tool, busy-display feedback, highlight/miss clearing, measurement after crop changes and ordinary image/object/note navigation.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudHitRouting",
        "## Cloud-hit dispatch"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudHitRouting",
          "count": 2
        },
        {
          "text": "## Cloud-hit dispatch",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudHitRouting.ts",
      "content": "import type { PointCloudResult } from '../../utils/pointCloudUtils';\nimport type { MeasurementPoint } from './MeasurementViewerRenderer';\n\n/** Geometry borrowed from the existing point-cloud graphic; coordinates are not reprojected here. */\nexport interface PointCloudHitGeometry { longitude: number; latitude: number; z: number; }\ninterface Hit<G> {\n  layer?: { id?: string };\n  graphic?: { layer?: { id?: string }; geometry: G; attributes?: {\n    originalIndex?: number | null; originalindex?: number | null;\n    pointIndex?: number | null; pointindex?: number | null;\n    ObjectID?: number | null; objectid?: number | null;\n  } };\n}\nexport interface PointCloudHitRoutingDependencies<G extends PointCloudHitGeometry> {\n  readState(): { isMeasureMode: boolean; isSightMode: boolean; isViewshedMode: boolean;\n    jimuMapView?: unknown; measurePoints: MeasurementPoint[] };\n  readResult(): PointCloudResult | null;\n  mapUpdating(): boolean;\n  setMeasurement(points: MeasurementPoint[], callback: () => void): void;\n  updateMeasurement(): void;\n  readSight(): { readonly ready: boolean; place(geometry: G): void } | null;\n  placeViewshed(geometry: G): Promise<unknown>;\n  readRenderer(): { setHighlight(index: number): void } | null;\n  readViewer(): { resize(): void; getCenter(): Promise<number[]>; setCenter(center: number[]): void } | null;\n  notifyUpdating(): void;\n}\n\n/** Dispatch already-tested SDK hits; no hitTest, event listener, navigation or resource ownership.\n * The caller keeps enterprise-note precedence and later image selection. A consumed cloud hit\n * returns true; a miss clears viewer highlight then returns false so normal navigation continues.\n */\nexport class PointCloudHitRouting<G extends PointCloudHitGeometry> {\n  constructor(private readonly dependencies: PointCloudHitRoutingDependencies<G>) {}\n\n  /** Preserve first matching layer, mixed-case attributes and existing fallback index rules.\n   * originalIndex addresses retained full-cloud points; pointIndex addresses the filtered viewer.\n   * Tool precedence remains measurement \u2192 ready sight \u2192 viewshed with map view \u2192 highlight.\n   * Hit result shape is asserted only at this SDK boundary, matching the existing layer-ID branch.\n   */\n  route(results: readonly unknown[]): boolean {\n    const d = this.dependencies;\n    const hit = results.find(result => {\n      const r = result as Hit<G>;\n      const layer = r.layer || (r.graphic && r.graphic.layer);\n      return layer && layer.id === 'point-cloud-layer';\n    }) as Hit<G> | undefined;\n    if (hit && hit.graphic) {\n      if (d.mapUpdating()) { d.notifyUpdating(); return true; }\n      const attrs = hit.graphic.attributes || {};\n      const geom = hit.graphic.geometry;\n      const rawOriginal = attrs.originalIndex ?? attrs.originalindex;\n      const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;\n      const rawObjectId = attrs.ObjectID ?? attrs.objectid;\n      const idx = (rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1) as number;\n      const originalIdx = (rawOriginal !== undefined ? rawOriginal : idx) as number;\n      if (d.readState().isMeasureMode) {\n        const p = d.readResult()?.points[originalIdx];\n        if (p) {\n          const newPt: MeasurementPoint = {\n            mapLon: geom.longitude, mapLat: geom.latitude, mapZ: geom.z,\n            rawLon: p.rawLon || p.lon, rawLat: p.rawLat || p.lat, alt: p.alt,\n          };\n          let newPoints = [...d.readState().measurePoints, newPt];\n          if (newPoints.length > 2) newPoints = [newPt];\n          d.setMeasurement(newPoints, () => d.updateMeasurement());\n        }\n        return true;\n      }\n      if (d.readState().isSightMode && d.readSight()?.ready) {\n        d.readSight()!.place(geom); return true;\n      }\n      if (d.readState().isViewshedMode && d.readState().jimuMapView) {\n        void d.placeViewshed(geom); return true;\n      }\n      if (d.readRenderer()) {\n        d.readRenderer()!.setHighlight(idx);\n        if (d.readViewer()) {\n          d.readViewer()!.resize();\n          d.readViewer()!.getCenter().then(c => {\n            // Keep the original live-viewer read and swallowed refresh failure after getCenter.\n            d.readViewer()!.setCenter([c[0], c[1]]);\n          }).catch(() => {});\n        }\n      }\n      return true;\n    }\n    if (d.readRenderer()) {\n      d.readRenderer()!.setHighlight(-1);\n      if (d.readViewer()) d.readViewer()!.resize();\n    }\n    return false;\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudHitRouting.test.cjs",
      "content": "/** Compare frozen original cloud-hit branch with actual runtime routing and recording tool owners.\n * A navigation sentinel proves which hits consume the click; held centers expose live-viewer refresh.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudHitRouting.ts','utf8')))(m,m.exports);\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudHitRouting.baseline.json','utf8'));const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const adapter=cl.members.find(n=>n.name?.getText(sf)==='_pointCloudHits').getText(sf);\nconst call='if (this._pointCloudHits.route(response.results)) return;';assert.equal(source.split(call).length,2);\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};\nconst geom=()=>({longitude:10,latitude:20,z:30});const hit=(attributes={pointIndex:2,originalIndex:0},geometry=geom())=>({layer:{id:'point-cloud-layer'},graphic:{attributes,geometry}});\nfunction setup(kind,{hold=false,batched=false}={}){\n const trace=[],pending=[],center=deferred();const code='class Widget{'+(kind==='working'?adapter:'')+' handle(response:any){'+(kind==='baseline'?fixture.branch:call)+'this.navigate();}};return Widget;';const Harness=new Function('PointCloudHitRouting',compile(code))(m.exports.PointCloudHitRouting);const w=new Harness();\n w.state={isMeasureMode:false,isSightMode:false,isViewshedMode:false,jimuMapView:{},measurePoints:[]};const points=[{rawLon:1,rawLat:2,lon:3,lat:4,alt:5},{rawLon:6,rawLat:7,lon:8,lat:9,alt:10},{rawLon:11,rawLat:12,lon:13,lat:14,alt:15}];w._pointCloudAcquisition={result:{points}};w._pointCloudMapLayer={updating:false};w._sight={ready:true,place:g=>trace.push(['sight',g])};w.ensureViewshedOwner=()=>({place:g=>{trace.push(['viewshed',g]);return Promise.resolve()}});w._pointCloudViewerRenderer={setHighlight:index=>trace.push(['highlight',index])};\n let throwResize=false;const viewer={resize:()=>{trace.push(['resize']);if(throwResize)throw Error('resize failed')},getCenter:()=>{trace.push(['getCenter']);return hold?center.promise:Promise.resolve([.2,.8])},setCenter:c=>trace.push(['setCenter','original',c])};w.mapillaryViewer=viewer;w.showToast=(...args)=>trace.push(['toast',...args]);w.setState=(patch,cb)=>{trace.push(['state',structuredClone(patch)]);const run=()=>{Object.assign(w.state,patch);cb?.()};if(batched)pending.push(run);else run()};w.updateMeasurementGraphics=()=>trace.push(['measurement']);w.navigate=()=>trace.push(['navigate']);\n return{w,trace,center,points,viewer,click:results=>w.handle({results}),flushState:()=>pending.splice(0).forEach(fn=>fn()),throwResize:()=>throwResize=true};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b}\ntest('normal cloud hit highlights filtered index, refreshes center and consumes navigation',async()=>{await compare(async h=>{h.click([hit()]);await flush();assert.deepEqual(h.trace.map(x=>x[0]),['highlight','resize','getCenter','setCenter']);assert.equal(h.trace[0][1],2)})});\ntest('missing cloud hit clears highlight/resizes before continuing navigation',async()=>{await compare(async h=>{h.click([{layer:{id:'other'},graphic:{geometry:geom()}}]);await flush();assert.deepEqual(h.trace,[['highlight',-1],['resize'],['navigate']])})});\ntest('first matching layer and layer-versus-graphic-layer precedence remain unchanged',async()=>{await compare(async h=>{h.click([{layer:{id:'other'},graphic:{layer:{id:'point-cloud-layer'},geometry:geom()}},{graphic:{layer:{id:'point-cloud-layer'},geometry:geom(),attributes:{pointIndex:1}}},hit()]);await flush();assert.equal(h.trace[0][1],1)})});\ntest('first matching result without graphic retains miss behavior even if later graphic matches',async()=>{await compare(async h=>{h.click([{layer:{id:'point-cloud-layer'}},hit()]);await flush();assert(h.trace.some(x=>x[0]==='navigate'))})});\ntest('updating map consumes cloud click with exact feedback and no tool/highlight work',async()=>{await compare(async h=>{h.w._pointCloudMapLayer.updating=true;h.w.state.isMeasureMode=true;h.click([hit()]);await flush();assert.deepEqual(h.trace,[['toast','Updating point-cloud display. Select the point again in a moment.',2000]])})});\ntest('mixed-case/nullish attributes and ObjectID fallback retain original indices',async()=>{for(const attrs of [{pointIndex:0,pointindex:2},{pointindex:1,originalindex:0},{ObjectID:3},{objectid:2},{ObjectID:0},{},{pointIndex:null,pointindex:1},{pointIndex:null,pointindex:null}])await compare(async h=>{h.click([hit(attrs)]);await flush()})});\ntest('measurement uses original source index and map geometry rather than filtered viewer index',async()=>{await compare(async h=>{h.w.state.isMeasureMode=true;const geometry=geom();h.click([hit({pointIndex:2,originalIndex:1},geometry)]);await flush();assert.deepEqual(h.w.state.measurePoints,[{mapLon:10,mapLat:20,mapZ:30,rawLon:6,rawLat:7,alt:10}]);assert(!h.trace.some(x=>['highlight','navigate'].includes(x[0])))})});\ntest('third measurement starts a new pair; queued measurement graphics stay in state callback',async()=>{await compare(async h=>{h.w.state.isMeasureMode=true;h.w.state.measurePoints=[{old:1},{old:2}];h.click([hit()]);assert(!h.trace.some(x=>x[0]==='measurement'));h.flushState();assert.equal(h.w.state.measurePoints.length,1);assert.equal(h.trace.at(-1)[0],'measurement')},{batched:true})});\ntest('raw zero fallback and missing measurement point retain consume behavior',async()=>{for(const missing of [false,true])await compare(async h=>{h.w.state.isMeasureMode=true;h.points[0].rawLon=0;h.points[0].rawLat=0;if(missing)h.w._pointCloudAcquisition.result=null;h.click([hit()]);await flush();assert(!h.trace.some(x=>x[0]==='navigate'));if(!missing)assert.equal(h.w.state.measurePoints[0].rawLon,3);else assert.equal(h.trace.length,0)})});\ntest('measurement then ready sight then viewshed precedence matches all tool flag combinations',async()=>{for(let flags=0;flags<8;flags++)for(const ready of [false,true])await compare(async h=>{h.w.state.isMeasureMode=!!(flags&1);h.w.state.isSightMode=!!(flags&2);h.w.state.isViewshedMode=!!(flags&4);h.w._sight.ready=ready;const geometry=geom();h.click([hit(undefined,geometry)]);await flush();if(h.trace.some(x=>x[0]==='sight'))assert.strictEqual(h.trace.find(x=>x[0]==='sight')[1],geometry)})});\ntest('sight readiness and map-view presence preserve fallthrough to highlight',async()=>{await compare(async h=>{h.w.state.isSightMode=true;h.w._sight=null;h.w.state.isViewshedMode=true;h.w.state.jimuMapView=null;h.click([hit()]);await flush();assert.equal(h.trace[0][0],'highlight')})});\ntest('missing renderer or viewer preserves hit consumption and miss navigation',async()=>{for(const missing of ['renderer','viewer'])await compare(async h=>{if(missing==='renderer')h.w._pointCloudViewerRenderer=null;else h.w.mapillaryViewer=null;h.click([hit()]);await flush();assert(!h.trace.some(x=>x[0]==='navigate'));h.click([]);assert.equal(h.trace.at(-1)[0],'navigate')})});\ntest('center completion reads replacement viewer and contains cleared-viewer errors',async()=>{for(const clear of [false,true])await compare(async h=>{h.click([hit()]);h.w.mapillaryViewer=clear?null:{setCenter:c=>h.trace.push(['setCenter','replacement',c])};h.center.resolve([.3,.7]);await flush();assert.equal(h.trace.some(x=>x[0]==='setCenter'),!clear)},{hold:true})});\ntest('center rejection stays silent and synchronous resize failure retains outer-handler propagation',async()=>{await compare(async h=>{h.click([hit()]);h.center.reject(Error('viewer offline'));await flush();assert.equal(h.trace.length,3)},{hold:true});await compare(async h=>{h.throwResize();assert.throws(()=>h.click([hit()]),{message:'resize failed'});await flush();assert(!h.trace.some(x=>x[0]==='navigate'))})});\ntest('measurement state callback retains live update target and borrowed point data stays unmodified',async()=>{await compare(async h=>{h.w.state.isMeasureMode=true;const before=structuredClone(h.points);h.points.forEach(Object.freeze);h.click([hit()]);h.w.updateMeasurementGraphics=()=>h.trace.push(['replacementMeasurement']);h.flushState();assert.equal(h.trace.at(-1)[0],'replacementMeasurement');assert.deepEqual(h.points,before)},{batched:true})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudHitRouting.baseline.json",
      "content": "{\n  \"branch\": \"        const pointCloudHit = response.results.find((r: any) => {\\n          const layer = r.layer || (r.graphic && r.graphic.layer);\\n          return layer && layer.id === \\\"point-cloud-layer\\\";\\n        });\\n\\n        if (pointCloudHit && (pointCloudHit as any).graphic) {\\n          if (this._pointCloudMapLayer?.updating) { this.showToast(\\\"Updating point-cloud display. Select the point again in a moment.\\\", 2000); return; }\\n          const attrs = (pointCloudHit as any).graphic.attributes || {};\\n          const geom = (pointCloudHit as any).graphic.geometry;\\n\\n          // Safely handle ArcGIS lowercasing field names randomly\\n          const rawOriginal = attrs.originalIndex ?? attrs.originalindex;\\n          const rawPointIdx = attrs.pointIndex ?? attrs.pointindex;\\n          const rawObjectId = attrs.ObjectID ?? attrs.objectid;\\n\\n          // Grab filtered index (For Viewer Highlighting)\\n          const idx = rawPointIdx !== undefined ? rawPointIdx : (rawObjectId || 1) - 1;\\n\\n          // Grab original index (For raw data lookup)\\n          const originalIdx = rawOriginal !== undefined ? rawOriginal : idx;\\n\\n          if (this.state.isMeasureMode) {\\n            const p = this._pointCloudAcquisition.result?.points[originalIdx];\\n            if (p) {\\n              const newPt = {\\n                mapLon: geom.longitude,\\n                mapLat: geom.latitude,\\n                mapZ: geom.z,\\n                rawLon: (p as any).rawLon || p.lon,\\n                rawLat: (p as any).rawLat || p.lat,\\n                alt: p.alt,\\n              };\\n\\n              let newPoints = [...this.state.measurePoints, newPt];\\n              if (newPoints.length > 2) {\\n                newPoints = [newPt];\\n              }\\n\\n              this.setState({ measurePoints: newPoints }, () => {\\n                this.updateMeasurementGraphics();\\n              });\\n            }\\n            return; // Stop here so it doesn't trigger anything else!\\n          }\\n\\n          // SIGHT MODE\\n          if (this.state.isSightMode && this._sight?.ready) {\\n            this._sight.place(geom);\\n            return;\\n          }\\n\\n          // VIEWSHED MODE LOGIC\\n          if (this.state.isViewshedMode && this.state.jimuMapView) {\\n            void this.ensureViewshedOwner().place(geom);\\n            return;\\n          }\\n\\n          if (this._pointCloudViewerRenderer) {\\n            this._pointCloudViewerRenderer.setHighlight(idx); // Use filtered index for WebGL\\n            if (this.mapillaryViewer) {\\n              this.mapillaryViewer.resize();\\n              this.mapillaryViewer\\n                .getCenter()\\n                .then((c: number[]) => {\\n                  this.mapillaryViewer.setCenter([c[0], c[1]]);\\n                })\\n                .catch(() => {});\\n            }\\n          }\\n          return;\\n        } else {\\n          if (this._pointCloudViewerRenderer) {\\n            this._pointCloudViewerRenderer.setHighlight(-1);\\n            if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n          }\\n        }\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-hit-routing-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-hit-routing.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited hit-routing references remain)');
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
    console.log(uninstall ? 'Point-cloud hit routing is already uninstalled. No files changed.' : 'Point-cloud hit routing is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-hit-routing', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud hit routing ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Point-cloud hit routing flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
