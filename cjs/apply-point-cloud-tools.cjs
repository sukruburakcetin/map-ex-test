#!/usr/bin/env node
'use strict';
/** Point-cloud tools installer. Plain source payload.
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
          "before": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudLifecycle } from '../features/point-cloud/PointCloudLifecycle';\nimport { PointCloudResultApplication } from '../features/point-cloud/PointCloudResultApplication';\n",
          "after": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudTools } from '../features/point-cloud/PointCloudTools';\nimport { showPointCloudToolFeedback } from '../features/point-cloud/PointCloudToolFeedback';\nimport { PointCloudLifecycle } from '../features/point-cloud/PointCloudLifecycle';\nimport { PointCloudResultApplication } from '../features/point-cloud/PointCloudResultApplication';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind existing resource owners lazily; construction starts no cleanup or SDK work. */\n  private _pointCloudLifecycle = new PointCloudLifecycle({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind tool policy to live React state and existing feature owners; no new resources. */\n  private _pointCloudTools = new PointCloudTools({\n    readState: () => this.state,\n    setState: (updater, callback) => this.setState(updater, callback),\n    updateMeasurement: () => this.updateMeasurementGraphics(),\n    clearSightResource: () => this._sight?.clear(),\n    activateSight: () => this.ensureSightOwner().activate(),\n    clearSight: () => this.clearSight(),\n    clearViewshed: () => this.clearViewshed(),\n    clearLasso: () => this.clearLasso(),\n    notify: tool => showPointCloudToolFeedback((...args) => this.showToast(...args), tool),\n  });\n  /** Bind existing resource owners lazily; construction starts no cleanup or SDK work. */\n  private _pointCloudLifecycle = new PointCloudLifecycle({\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 3",
          "before": "   * Toggles the 3D Line of Sight Mode on and off.\n   */\n  private toggleSightMode = () => {\n    this.setState(\n      (prev) => {\n        const nextSight = !prev.isSightMode;\n        const updates: any = {\n          isSightMode: nextSight,\n          sightObserver: null,\n          sightTargets: [],\n        };\n\n        // Prevent clash: Automatically turn off Measure Mode if it was on\n        if (nextSight && prev.isMeasureMode) {\n          updates.isMeasureMode = false;\n          updates.measurePoints = [];\n        }\n        return updates;\n      },\n      async () => {\n        // Update Measure graphics to clear the lines if we just turned it off\n        if (!this.state.isMeasureMode) {\n          this.updateMeasurementGraphics();\n        }\n\n        if (this.state.isSightMode) {\n          this.showToast(<span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);\n\n          await this.ensureSightOwner().activate();\n        } else {\n          this.clearSight();\n        }\n      },\n    );\n  };\n\n  /**\n   * Clears the current Line of Sight analysis.\n",
          "after": "   * Toggles the 3D Line of Sight Mode on and off.\n   */\n  private toggleSightMode = () => this._pointCloudTools.toggleSight();\n  /**\n   * Clears the current Line of Sight analysis.\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 4",
          "before": "   * Toggles the 3D Viewshed Analysis Mode on and off.\n   */\n  private toggleViewshedMode = async () => {\n    this.setState(\n      (prev) => {\n        const nextMode = !prev.isViewshedMode;\n        const updates: any = { isViewshedMode: nextMode };\n\n        // Prevent clashes: Automatically turn off other tools\n        if (nextMode) {\n          if (prev.isMeasureMode) {\n            updates.isMeasureMode = false;\n            updates.measurePoints = [];\n            this.updateMeasurementGraphics();\n          }\n          if (prev.isSightMode) {\n            updates.isSightMode = false;\n            updates.sightObserver = null;\n            updates.sightTargets = [];\n            this._sight?.clear();\n          }\n        }\n        return updates;\n      },\n      () => {\n        if (this.state.isViewshedMode) {\n          this.showToast(\n            <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n              <Icons.Viewshed size={14} /> 360\u00b0 Viewshed Mode: Click on the point cloud to drop an observer.\n            </span>,\n            4000,\n          );\n        } else {\n          this.clearViewshed();\n        }\n      },\n    );\n  };\n\n  /** Bind SDK construction once; the feature owns observer policy and analysis lifetime. */\n  private ensureViewshedOwner() {\n",
          "after": "   * Toggles the 3D Viewshed Analysis Mode on and off.\n   */\n  private toggleViewshedMode = async () => this._pointCloudTools.toggleViewshed();\n  /** Bind SDK construction once; the feature owns observer policy and analysis lifetime. */\n  private ensureViewshedOwner() {\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 5",
          "before": "   * Toggles the 3D Measurement Mode on and off.\n   */\n  private toggleMeasureMode = () => {\n    this.setState(\n      (prev) => {\n        const nextMeasure = !prev.isMeasureMode;\n        const updates: any = {\n          isMeasureMode: nextMeasure,\n          measurePoints: [],\n        };\n\n        // Prevent clash: Automatically turn off Sight Mode if it was on\n        if (nextMeasure && prev.isSightMode) {\n          updates.isSightMode = false;\n          updates.sightObserver = null;\n          updates.sightTargets = [];\n          this._sight?.clear();\n          updates.isViewshedMode = false; // Turn off viewshed\n          this.clearViewshed(); // Remove the red/green graphics\n        }\n        return updates;\n      },\n      () => {\n        this.updateMeasurementGraphics();\n        if (this.state.isMeasureMode) {\n          this.showToast(\n            <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.\n            </span>,\n            3000,\n          );\n        }\n      },\n    );\n  };\n\n  /**\n   * Clears the current measurement and removes the 3D line from the map.\n",
          "after": "   * Toggles the 3D Measurement Mode on and off.\n   */\n  private toggleMeasureMode = () => this._pointCloudTools.toggleMeasure();\n  /**\n   * Clears the current measurement and removes the 3D line from the map.\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 6",
          "before": "\n  // [4.5.0 Update] LASSO SELECTION LOGIC\n  private toggleLassoMode = () => {\n    this.setState(\n      (prev) => {\n        const nextMode = !prev.isLassoMode;\n        const updates: any = {\n          isLassoMode: nextMode,\n          lassoPolygon: [],\n          lassoSelectedObjectIds: [],\n        };\n\n        // Prevent clashes with other 3D tools. Auto-disable them if Lasso is activated.\n        if (nextMode) {\n          if (prev.isMeasureMode) {\n            updates.isMeasureMode = false;\n            updates.measurePoints = [];\n            this.updateMeasurementGraphics();\n          }\n          if (prev.isSightMode) {\n            updates.isSightMode = false;\n            updates.sightObserver = null;\n            updates.sightTargets = [];\n            this._sight?.clear();\n          }\n          if (prev.isViewshedMode) {\n            updates.isViewshedMode = false;\n            this.clearViewshed();\n          }\n        }\n        return updates;\n      },\n      () => {\n        if (this.state.isLassoMode) {\n          this.showToast(<span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);\n        } else {\n          this.clearLasso();\n        }\n      },\n    );\n  };\n\n  private clearLasso = () => {\n    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });\n",
          "after": "\n  // [4.5.0 Update] LASSO SELECTION LOGIC\n  private toggleLassoMode = () => this._pointCloudTools.toggleLasso();\n  private clearLasso = () => {\n    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudTools",
        "showPointCloudToolFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudTools",
          "count": 3
        },
        {
          "text": "showPointCloudToolFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "tests/pointCloudSight.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudSight.test.cjs point-cloud result application block 1",
          "before": "const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudSight.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudSight.ts','utf8')))(m,m.exports);const {PointCloudSight}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleSightMode','clearSight','toggleMeasureMode','toggleViewshedMode','toggleLassoMode'];if(kind==='baseline')names.push('applySightHit');else names.push('ensureSightOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplySightHit(geom:any){\\n'+text.slice(text.indexOf('          // SIGHT MODE'),text.indexOf('          // VIEWSHED MODE LOGIC'))+'\\n}':'')}\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve()};\nconst point=(id=1)=>({type:'point',longitude:10+id,latitude:20+id,z:30+id,spatialReference:{wkid:4326}});\n",
          "after": "const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudSight.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudSight.ts','utf8')))(m,m.exports);const {PointCloudSight}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleSightMode','clearSight','toggleMeasureMode','toggleViewshedMode','toggleLassoMode'];if(kind==='baseline')names.push('applySightHit');else names.push('_pointCloudTools','ensureSightOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplySightHit(geom:any){\\n'+text.slice(text.indexOf('          // SIGHT MODE'),text.indexOf('          // VIEWSHED MODE LOGIC'))+'\\n}':'')}\nconst tools={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(tools,tools.exports);\nconst toolFeedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Viewshed:'viewshed',Measure:'measure'},toolFeedback,toolFeedback.exports);\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve()};\nconst point=(id=1)=>({type:'point',longitude:10+id,latitude:20+id,z:30+id,spatialReference:{wkid:4326}});\n"
        },
        {
          "label": "tests/pointCloudSight.test.cjs point-cloud result application block 2",
          "before": " class Model{constructor(properties){this.view=properties.view;this.id=models.length;this.targets={add:properties=>{this.points.push(properties.location);trace.push(['target',this.id,properties])}};this.points=[];models.push(this);trace.push(['create',this.id,views.indexOf(this.view)])}set observer(value){this.observerValue=value;trace.push(['observer',this.id,value])}clear(){trace.push(['clear',this.id]);this.points=[];this.observerValue=null}destroy(){trace.push(['destroy',this.id]);this.destroyed=true}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Model]);return d.promise};\n const Harness=new Function('PointCloudSight','loadArcGISJSAPIModules','jsx','Icons','console',compile('class Harness{'+methods(kind)+'};return Harness;'))(PointCloudSight,load,(tag,props,...children)=>({tag,props:props||{},children}),{Measure:'measure',Viewshed:'viewshed'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))});w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};views.push(v);return v}\n w.state={jimuMapView:{view:view()},isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isViewshedMode:false,isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._sight=null;w._sightViewModel=null;\n",
          "after": " class Model{constructor(properties){this.view=properties.view;this.id=models.length;this.targets={add:properties=>{this.points.push(properties.location);trace.push(['target',this.id,properties])}};this.points=[];models.push(this);trace.push(['create',this.id,views.indexOf(this.view)])}set observer(value){this.observerValue=value;trace.push(['observer',this.id,value])}clear(){trace.push(['clear',this.id]);this.points=[];this.observerValue=null}destroy(){trace.push(['destroy',this.id]);this.destroyed=true}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Model]);return d.promise};\n const Harness=new Function('PointCloudSight','loadArcGISJSAPIModules','jsx','Icons','console','PointCloudTools','showPointCloudToolFeedback',compile('class Harness{'+methods(kind)+'};return Harness;'))(PointCloudSight,load,(tag,props,...children)=>({tag,props:props||{},children}),{Measure:'measure',Viewshed:'viewshed'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))},tools.exports.PointCloudTools,toolFeedback.exports.showPointCloudToolFeedback);w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};views.push(v);return v}\n w.state={jimuMapView:{view:view()},isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isViewshedMode:false,isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._sight=null;w._sightViewModel=null;\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudTools",
        "showPointCloudToolFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudTools",
          "count": 3
        },
        {
          "text": "showPointCloudToolFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "tests/pointCloudViewshed.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudViewshed.test.cjs point-cloud result application block 1",
          "before": "const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudViewshed.ts','utf8')))(m,m.exports);const {PointCloudViewshed}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['clearViewshed','toggleViewshedMode','toggleMeasureMode','toggleLassoMode'];names.push(kind==='baseline'?'applyViewshedHit':'ensureViewshedOwner');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplyViewshedHit(geom:any){\\n'+text.slice(text.indexOf('          // VIEWSHED MODE LOGIC'),text.indexOf('\\n          if (this._pointCloudViewerRenderer)',text.indexOf('          // VIEWSHED MODE LOGIC')))+'\\n}':'')}\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudViewshed','loadArcGISJSAPIModules','jsx','Icons','console',compile('class Harness{'+methods(kind)+'};return Harness;'));\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve()},point=(z=10)=>({longitude:20,latitude:30,z});\nfunction setup(kind,{hold=false,batched=false}={}){\n",
          "after": "const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudViewshed.ts','utf8')))(m,m.exports);const {PointCloudViewshed}=m.exports;\nfunction methods(kind){const text=kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['clearViewshed','toggleViewshedMode','toggleMeasureMode','toggleLassoMode'];names.push(kind==='baseline'?'applyViewshedHit':'ensureViewshedOwner');if(kind==='working')names.push('_pointCloudTools');return names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')+(kind==='working'?'\\napplyViewshedHit(geom:any){\\n'+text.slice(text.indexOf('          // VIEWSHED MODE LOGIC'),text.indexOf('\\n          if (this._pointCloudViewerRenderer)',text.indexOf('          // VIEWSHED MODE LOGIC')))+'\\n}':'')}\nconst tools={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(tools,tools.exports);\nconst toolFeedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Viewshed:'viewshed',Measure:'measure'},toolFeedback,toolFeedback.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudViewshed','loadArcGISJSAPIModules','jsx','Icons','console','PointCloudTools','showPointCloudToolFeedback',compile('class Harness{'+methods(kind)+'};return Harness;'));\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve()},point=(z=10)=>({longitude:20,latitude:30,z});\nfunction setup(kind,{hold=false,batched=false}={}){\n"
        },
        {
          "label": "tests/pointCloudViewshed.test.cjs point-cloud result application block 2",
          "before": " class Analysis{constructor(properties){Object.assign(this,properties);this.id=analyses.length;analyses.push(this);trace.push(['analysis',this.id,structuredClone(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.id])}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Analysis,Viewshed,Point]);return d.promise};\n const Harness=classes[kind](PointCloudViewshed,load,(tag,props,...children)=>({tag,props:props||{},children}),{Viewshed:'viewshed',Measure:'measure'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))});const w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};const collection={items:[],add(a){this.items.push(a);trace.push(['add',views.indexOf(v),a.id])},remove(a){this.items=this.items.filter(x=>x!==a);trace.push(['remove',views.indexOf(v),a.id])}};v.analyses=collection;views.push(v);return v}\n w.state={jimuMapView:{view:view()},isViewshedMode:false,isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._viewshed=null;w._viewshedAnalysis=null;\n",
          "after": " class Analysis{constructor(properties){Object.assign(this,properties);this.id=analyses.length;analyses.push(this);trace.push(['analysis',this.id,structuredClone(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.id])}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Analysis,Viewshed,Point]);return d.promise};\n const Harness=classes[kind](PointCloudViewshed,load,(tag,props,...children)=>({tag,props:props||{},children}),{Viewshed:'viewshed',Measure:'measure'},{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))},tools.exports.PointCloudTools,toolFeedback.exports.showPointCloudToolFeedback);const w=new Harness();\n function view(type='3d'){const v={type,map:{},destroyed:false};const collection={items:[],add(a){this.items.push(a);trace.push(['add',views.indexOf(v),a.id])},remove(a){this.items=this.items.filter(x=>x!==a);trace.push(['remove',views.indexOf(v),a.id])}};v.analyses=collection;views.push(v);return v}\n w.state={jimuMapView:{view:view()},isViewshedMode:false,isSightMode:false,sightObserver:null,sightTargets:[],isMeasureMode:false,measurePoints:[],isLassoMode:false,lassoPolygon:[],lassoSelectedObjectIds:[]};w._viewshed=null;w._viewshedAnalysis=null;\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudTools",
        "showPointCloudToolFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudTools",
          "count": 3
        },
        {
          "text": "showPointCloudToolFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud result application block 1",
          "before": "\nThe coordinator owns no mode mirror, cloud, SDK object, timer or listener. It preserves synchronous error propagation and delegates repeated cleanup/idempotence to owners. Comments and baseline-backed tests capture callback/live-state and reset/reload boundaries. Real host testing remains necessary for tool visuals, rapid toggle/reload, pending nudges and loading/following closure.\n",
          "after": "\nThe coordinator owns no mode mirror, cloud, SDK object, timer or listener. It preserves synchronous error propagation and delegates repeated cleanup/idempotence to owners. Comments and baseline-backed tests capture callback/live-state and reset/reload boundaries. Real host testing remains necessary for tool visuals, rapid toggle/reload, pending nudges and loading/following closure.\n\n## Tool activation coordination\n\n`PointCloudTools.ts` coordinates existing sight/viewshed/measure/lasso toggle policy; `PointCloudToolFeedback.tsx` owns the unchanged enable instructions, icons and toast duration. Runtime provides state updaters/readers and existing owner/clear callbacks. The sight, viewshed, measurement, lasso and cloud-lifecycle modules remain byte-identical.\n\nPrevious-state updater logic and updater-side effects retain their original phase; callbacks deliberately read current flags. Exclusion is asymmetric: sight disables measurement; viewshed disables measurement/sight; measurement clears viewshed only alongside active sight; lasso disables active measurement/sight/viewshed. No new policy is imposed. Clear methods, hit dispatch and resource ownership stay separate.\n\nSight activation is awaited only inside its existing async state callback. Viewshed's public async wrapper still does not wait for its state callback; the remaining toggles return void. No independent mode state, SDK lifetime, timer or exception policy is introduced. Comments and baseline tests capture exact patch/cleanup/feedback order, all flag combinations, batching/replay and activation failure. Existing sight/viewshed regression bodies remain unchanged.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudTools",
        "## Tool activation coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudTools",
          "count": 1
        },
        {
          "text": "## Tool activation coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud result application block 1",
          "before": "Changed: runtime, contributor README, ownership document, roadmap and map test harness (feature binding only; original test bodies and fixture retained). Added: lifecycle coordinator, 15 baseline-backed cases and frozen original clear/toggle fixture. Validation: 249 point-cloud/playback cases; strict actual adapter checks against existing owner and ArcGIS types; full TSX parse; structural/owner-file preservation and guarded installer checks. Host smoke checks remain loading/following toggles, rapid off/on/reload, active-tool clearing, unrelated toast preservation and pending calibration cancellation.\n\nNext: extract tool activation and mutual-exclusion coordination (measurement, sight and viewshed) without changing their individual owners, state-reset callbacks, hit handling or user feedback.\n",
          "after": "Changed: runtime, contributor README, ownership document, roadmap and map test harness (feature binding only; original test bodies and fixture retained). Added: lifecycle coordinator, 15 baseline-backed cases and frozen original clear/toggle fixture. Validation: 249 point-cloud/playback cases; strict actual adapter checks against existing owner and ArcGIS types; full TSX parse; structural/owner-file preservation and guarded installer checks. Host smoke checks remain loading/following toggles, rapid off/on/reload, active-tool clearing, unrelated toast preservation and pending calibration cancellation.\n\nTool activation/exclusion coordination is completed below, including lasso, with individual owners, state callbacks, hit handling and feedback retained.\n\n## Point-cloud tool activation and exclusion coordination\n\nExtracted four toggle policies to `src/features/point-cloud/PointCloudTools.ts` and their existing instructions/JSX to `PointCloudToolFeedback.tsx`. Runtime is now 13,362 lines (127 fewer), with typed lazy callbacks and forwarding toggle methods. The other 540 runtime members are token-identical; tool owners, clear methods, hit handling and cloud lifecycle are unchanged.\n\nFunction comments document previous-state versus callback-time reads, updater-side cleanup, observer/selection resets, original return/await behavior and asymmetric exclusion rules. No symmetric policy redesign, resource ownership change, callback coalescing, error handling, request, timer or point copy is introduced.\n\nChanged: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (actual feature bindings only; original fixtures/test bodies retained). Added: tool coordinator, feedback module, 15 baseline-backed cases and frozen original toggles. Validation: 264 point-cloud/playback cases; strict policy/feedback/actual runtime boundary checks with actual sight/ArcGIS types and local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Host validation remains per-tool activation/clear, switching with analyses present, rapid sight activation, lasso and cloud teardown.\n\nNext: extract point-cloud hit routing and tool click dispatch, preserving hit-test order, geometry handling, measurement/sight/viewshed precedence, viewer highlight and image-navigation behavior.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudTools",
        "## Point-cloud tool activation and exclusion coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudTools",
          "count": 1
        },
        {
          "text": "## Point-cloud tool activation and exclusion coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Activation intent, clear ordering and tool deactivation | `PointCloudLifecycle.ts` |\n| Accepted result application, calibration retention and initial subset/update order | `PointCloudResultApplication.ts` |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Tool activation, existing exclusion rules and state-callback coordination | `PointCloudTools.ts` |\n| Tool instructions, icons and toast durations | `PointCloudToolFeedback.tsx` |\n| Activation intent, clear ordering and tool deactivation | `PointCloudLifecycle.ts` |\n| Accepted result application, calibration retention and initial subset/update order | `PointCloudResultApplication.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 2",
          "before": "\nFunction comments document live getters, ownership, callback timing and the reset/reload distinction. No new exception swallowing, callback cancellation or coalescing policy is added. `tests/pointCloudLifecycle.test.cjs` compares actual runtime adapters against frozen original methods with recording owners and immediate/batched state callbacks. The existing map suite binds this feature and retains all original test bodies and its original-map cleanup assertions. Host checks: toggle while loading/following, rapid off/on, clear with each tool active, reload, unrelated toast preservation and clear during a pending calibration nudge.\n",
          "after": "\nFunction comments document live getters, ownership, callback timing and the reset/reload distinction. No new exception swallowing, callback cancellation or coalescing policy is added. `tests/pointCloudLifecycle.test.cjs` compares actual runtime adapters against frozen original methods with recording owners and immediate/batched state callbacks. The existing map suite binds this feature and retains all original test bodies and its original-map cleanup assertions. Host checks: toggle while loading/following, rapid off/on, clear with each tool active, reload, unrelated toast preservation and clear during a pending calibration nudge.\n\n## Tool activation and exclusion policy\n\n`PointCloudTools.ts` coordinates sight, viewshed, measurement and lasso toggles. `PointCloudToolFeedback.tsx` keeps enable instructions/icons/durations together. Resource owners, clear methods and hit handlers remain unchanged; runtime binds previous-state updates, current-state readers and the existing callbacks.\n\n| Enable action | Existing exclusion rule |\n| --- | --- |\n| Sight | Disable measurement; preserve viewshed/lasso flags |\n| Viewshed | Disable active measurement and sight; preserve lasso |\n| Measurement | If sight is active, clear sight and viewshed; otherwise preserve viewshed; preserve lasso |\n| Lasso | Disable active measurement, sight and viewshed |\n\nThese are preserved rules, not a new uniform policy. Observer/target, measurement-point and lasso-array resets stay attached to their original toggles. Side effects that previously ran inside state updaters still run there; callbacks re-read current state after the patch. Do not move cleanup into a different phase or broaden exclusion conditions during a structural refactor.\n\nSight's async state callback retains measurement refresh \u2192 feedback \u2192 awaited sight activation, or clear on disable. The viewshed runtime method still returns its original immediately resolved async wrapper without waiting for the React callback. Other toggles retain void return behavior. Enabling uses the existing 4000 ms instructions (3000 ms for measurement); disabling delegates the existing clear/update path.\n\nThe coordinator owns no SDK object, request, timer, flag mirror or point data. Function comments document callback phases and deliberate asymmetries. `tests/pointCloudTools.test.cjs` compares actual adapters/feedback against frozen original toggles for all 16 flag combinations, batched/replayed updaters, callback-time reads, rapid toggles, return values and activation rejection. Existing sight/viewshed suites bind this feature with original fixtures/test bodies intact. Host checks: enable/disable each tool, switch tools with active analyses, rapid toggles while sight loads, lasso interactions and cloud clear.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudTools",
        "## Tool activation and exclusion policy"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudTools",
          "count": 2
        },
        {
          "text": "## Tool activation and exclusion policy",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudTools.ts",
      "content": "export type PointCloudTool = 'sight' | 'viewshed' | 'measure' | 'lasso';\nexport interface PointCloudToolsState {\n  isSightMode: boolean; isViewshedMode: boolean; isMeasureMode: boolean; isLassoMode: boolean;\n}\nexport interface PointCloudToolsPatch {\n  isSightMode?: boolean; sightObserver?: null; sightTargets?: never[];\n  isViewshedMode?: boolean; isMeasureMode?: boolean; measurePoints?: never[];\n  isLassoMode?: boolean; lassoPolygon?: never[]; lassoSelectedObjectIds?: never[];\n}\nexport interface PointCloudToolsDependencies {\n  readState(): PointCloudToolsState;\n  setState(updater: (previous: PointCloudToolsState) => PointCloudToolsPatch, callback: () => void | Promise<void>): void;\n  updateMeasurement(): void;\n  clearSightResource(): void;\n  activateSight(): Promise<void>;\n  clearSight(): void;\n  clearViewshed(): void;\n  clearLasso(): void;\n  notify(tool: PointCloudTool): void;\n}\n\n/** Coordinate existing activation rules without owning tool resources, hits or state mirrors.\n * Preserve updater-side effects and callback timing, including the asymmetric exclusion rules.\n * Each updater uses React's previous state; each callback deliberately re-reads current state.\n */\nexport class PointCloudTools {\n  constructor(private readonly dependencies: PointCloudToolsDependencies) {}\n\n  /** Sight toggles reset observer/targets; enabling disables measurement, leaving other flags alone.\n   * Refresh measurement in the callback when disabled, then notify/await sight activation or clear.\n   */\n  toggleSight(): void {\n    const d = this.dependencies;\n    d.setState(previous => {\n      const nextSight = !previous.isSightMode;\n      const updates: PointCloudToolsPatch = { isSightMode: nextSight, sightObserver: null, sightTargets: [] };\n      if (nextSight && previous.isMeasureMode) { updates.isMeasureMode = false; updates.measurePoints = []; }\n      return updates;\n    }, async () => {\n      if (!d.readState().isMeasureMode) d.updateMeasurement();\n      if (d.readState().isSightMode) { d.notify('sight'); await d.activateSight(); }\n      else d.clearSight();\n    });\n  }\n\n  /** Enabling viewshed clears active measurement/sight inside the updater, as before.\n   * This method does not await the React callback; runtime retains its original async public wrapper.\n   */\n  toggleViewshed(): void {\n    const d = this.dependencies;\n    d.setState(previous => {\n      const nextMode = !previous.isViewshedMode;\n      const updates: PointCloudToolsPatch = { isViewshedMode: nextMode };\n      if (nextMode) {\n        if (previous.isMeasureMode) { updates.isMeasureMode = false; updates.measurePoints = []; d.updateMeasurement(); }\n        if (previous.isSightMode) { updates.isSightMode = false; updates.sightObserver = null; updates.sightTargets = []; d.clearSightResource(); }\n      }\n      return updates;\n    }, () => {\n      if (d.readState().isViewshedMode) d.notify('viewshed'); else d.clearViewshed();\n    });\n  }\n\n  /** Reset measurement points on either toggle, then refresh graphics in the callback.\n   * Existing policy clears viewshed only in the branch that also disables active sight; do not\n   * silently broaden this condition to a symmetric all-tools exclusion rule during refactoring.\n   */\n  toggleMeasure(): void {\n    const d = this.dependencies;\n    d.setState(previous => {\n      const nextMeasure = !previous.isMeasureMode;\n      const updates: PointCloudToolsPatch = { isMeasureMode: nextMeasure, measurePoints: [] };\n      if (nextMeasure && previous.isSightMode) {\n        updates.isSightMode = false; updates.sightObserver = null; updates.sightTargets = [];\n        d.clearSightResource(); updates.isViewshedMode = false; d.clearViewshed();\n      }\n      return updates;\n    }, () => {\n      d.updateMeasurement();\n      if (d.readState().isMeasureMode) d.notify('measure');\n    });\n  }\n\n  /** Reset selection arrays on either toggle; enabling excludes active measurement/sight/viewshed.\n   * Updater-side cleanup precedes the state patch; callback feedback/full-lasso clear stays afterward.\n   */\n  toggleLasso(): void {\n    const d = this.dependencies;\n    d.setState(previous => {\n      const nextMode = !previous.isLassoMode;\n      const updates: PointCloudToolsPatch = { isLassoMode: nextMode, lassoPolygon: [], lassoSelectedObjectIds: [] };\n      if (nextMode) {\n        if (previous.isMeasureMode) { updates.isMeasureMode = false; updates.measurePoints = []; d.updateMeasurement(); }\n        if (previous.isSightMode) { updates.isSightMode = false; updates.sightObserver = null; updates.sightTargets = []; d.clearSightResource(); }\n        if (previous.isViewshedMode) { updates.isViewshedMode = false; d.clearViewshed(); }\n      }\n      return updates;\n    }, () => {\n      if (d.readState().isLassoMode) d.notify('lasso'); else d.clearLasso();\n    });\n  }\n}\n"
    },
    {
      "file": "src/features/point-cloud/PointCloudToolFeedback.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { PointCloudTool } from './PointCloudTools';\n\n/** Keep existing tool instructions, icons and 3000/4000 ms durations; called only on enable. */\nexport function showPointCloudToolFeedback(showToast: (content: React.ReactNode, duration?: number) => void, tool: PointCloudTool): void {\n  if (tool === 'sight') {\n    showToast(<span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);\n    return;\n  }\n  if (tool === 'viewshed') {\n    showToast(\n            <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n              <Icons.Viewshed size={14} /> 360\u00b0 Viewshed Mode: Click on the point cloud to drop an observer.\n            </span>,\n            4000,\n          );\n    return;\n  }\n  if (tool === 'measure') {\n    showToast(\n            <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.\n            </span>,\n            3000,\n          );\n    return;\n  }\n  if (tool === 'lasso') {\n    showToast(<span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);\n    return;\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudTools.test.cjs",
      "content": "/** Frozen original tool toggles versus actual adapters and feedback, including all flag combinations.\n * Split updater/callback queues expose previous-state effects and callback-time state reads.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudTools.ts','utf8')))(m,m.exports);\nconst jsx=(tag,props,...children)=>({tag,props:props||{},children}),Icons={Measure:'measure',Viewshed:'viewshed'};const ui={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudToolFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx}:Icons,ui,ui.exports);\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudTools.baseline.json','utf8'));const sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleSightMode','toggleViewshedMode','toggleMeasureMode','toggleLassoMode'];const actual=['_pointCloudTools',...names].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};\nfunction setup(kind,{batched=false,hold=false,replay=false,flags=0}={}){\n const trace=[],updaters=[],callbacks=[],tasks=[],activation=deferred();\n const Harness=new Function('PointCloudTools','showPointCloudToolFeedback','jsx','Icons',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.PointCloudTools,ui.exports.showPointCloudToolFeedback,jsx,Icons);const w=new Harness();\n w.state={isSightMode:!!(flags&1),isViewshedMode:!!(flags&2),isMeasureMode:!!(flags&4),isLassoMode:!!(flags&8),measurePoints:[1],sightObserver:{id:1},sightTargets:[2],lassoPolygon:[[1,2]],lassoSelectedObjectIds:[3]};\n w.setState=(update,callback)=>{const run=()=>{if(replay)update(w.state);const patch=update(w.state);trace.push(['state',structuredClone(patch)]);Object.assign(w.state,patch);if(batched)callbacks.push(callback);else {const p=callback();if(p?.then)tasks.push(p)}};if(batched)updaters.push(run);else run()};\n w.updateMeasurementGraphics=()=>trace.push(['measurement']);w._sight={clear:()=>trace.push(['sightResource'])};w.ensureSightOwner=()=>({activate:()=>{trace.push(['activate']);return hold?activation.promise:Promise.resolve()}});w.clearSight=()=>trace.push(['sightFull']);w.clearViewshed=()=>trace.push(['viewshedClear']);w.clearLasso=()=>trace.push(['lassoFull']);w.showToast=(...args)=>trace.push(['toast',...args]);\n return{w,trace,tasks,activation,call:name=>w[name](),patches:()=>{while(updaters.length)updaters.shift()()},callbacks:()=>{while(callbacks.length){const p=callbacks.shift()();if(p?.then)tasks.push(p)}},settle:async()=>{while(tasks.length)await Promise.all(tasks.splice(0))}};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b}\ntest('all 16 flag combinations preserve every tool transition, patch, cleanup and feedback',async()=>{for(const name of names)for(let flags=0;flags<16;flags++)await compare(async h=>{await h.call(name);await h.settle()},{flags})});\ntest('sight callback feedback precedes awaited activation; public toggle still returns void',async()=>{await compare(async h=>{assert.equal(h.call('toggleSightMode'),undefined);assert.deepEqual(h.trace.slice(-2).map(x=>x[0]),['toast','activate']);h.activation.resolve();await h.settle()},{hold:true})});\ntest('viewshed public promise resolves without awaiting queued state callback',async()=>{await compare(async h=>{const p=h.call('toggleViewshedMode');assert(p instanceof Promise);await p;assert.equal(h.trace.length,0);h.patches();h.callbacks();await h.settle()},{batched:true})});\ntest('queued toggles use previous state at updater execution rather than input time',async()=>{await compare(async h=>{h.call('toggleSightMode');h.w.state.isMeasureMode=true;h.patches();h.callbacks();await h.settle();assert.equal(h.w.state.isMeasureMode,false)},{batched:true})});\ntest('callbacks deliberately read latest flags instead of captured next state',async()=>{for(const name of names)await compare(async h=>{h.call(name);h.patches();h.w.state[name.replace('toggle','is')]=false;h.callbacks();await h.settle();assert(!h.trace.some(x=>x[0]==='toast'))},{batched:true})});\ntest('viewshed enabling clears measurement/sight inside updater before applying state',async()=>{await compare(async h=>{await h.call('toggleViewshedMode');assert.deepEqual(h.trace.slice(0,3).map(x=>x[0]),['measurement','sightResource','state']);await h.settle()},{flags:5})});\ntest('measurement viewshed exclusion remains conditional on active sight',async()=>{for(const sight of [false,true])await compare(async h=>{h.call('toggleMeasureMode');await h.settle();assert.equal(h.w.state.isViewshedMode,!sight);assert.equal(h.trace.some(x=>x[0]==='viewshedClear'),sight)},{flags:2|(sight?1:0)})});\ntest('lasso enabling preserves measurement/sight/viewshed cleanup order',async()=>{await compare(async h=>{h.call('toggleLassoMode');await h.settle();assert.deepEqual(h.trace.slice(0,4).map(x=>x[0]),['measurement','sightResource','viewshedClear','state'])},{flags:7})});\ntest('disabling tools delegates original clear/update behavior without enable feedback',async()=>{for(const [name,flags,clear]of [['toggleSightMode',1,'sightFull'],['toggleViewshedMode',2,'viewshedClear'],['toggleMeasureMode',4,'measurement'],['toggleLassoMode',8,'lassoFull']])await compare(async h=>{await h.call(name);await h.settle();assert(h.trace.some(x=>x[0]===clear));assert(!h.trace.some(x=>x[0]==='toast'))},{flags})});\ntest('missing optional sight owner does not break measurement/viewshed/lasso exclusion',async()=>{for(const name of ['toggleMeasureMode','toggleViewshedMode','toggleLassoMode'])await compare(async h=>{h.w._sight=null;await h.call(name);await h.settle()},{flags:1})});\ntest('existing lasso flag remains unchanged by other tool toggles',async()=>{for(const name of ['toggleSightMode','toggleViewshedMode','toggleMeasureMode'])await compare(async h=>{await h.call(name);await h.settle();assert.equal(h.w.state.isLassoMode,true)},{flags:8})});\ntest('rapid queued mixed toggles retain original callback-time policy',async()=>{await compare(async h=>{for(const name of [...names,...names])h.call(name);h.patches();h.callbacks();await h.settle()},{batched:true})});\ntest('updater replay preserves existing repeated cleanup effects without adding deduplication',async()=>{await compare(async h=>{h.call('toggleLassoMode');await h.settle();assert.equal(h.trace.filter(x=>x[0]==='measurement').length,2)},{flags:7,replay:true})});\ntest('sight activation rejection remains an async callback rejection with original state/feedback',async()=>{await compare(async h=>{h.call('toggleSightMode');const rejected=h.settle();h.activation.reject(Error('activation failed'));await assert.rejects(rejected,{message:'activation failed'});assert.equal(h.w.state.isSightMode,true)},{hold:true})});\ntest('selection/observer resets and tool instruction durations remain exact',async()=>{for(const name of names)await compare(async h=>{await h.call(name);await h.settle();const toast=h.trace.find(x=>x[0]==='toast');assert.equal(toast[2],name==='toggleMeasureMode'?3000:4000);if(name==='toggleLassoMode')assert.deepEqual(h.w.state.lassoSelectedObjectIds,[]);if(name==='toggleSightMode')assert.equal(h.w.state.sightObserver,null)})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudTools.baseline.json",
      "content": "{\n  \"handlers\": \"  private toggleSightMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextSight = !prev.isSightMode;\\n        const updates: any = {\\n          isSightMode: nextSight,\\n          sightObserver: null,\\n          sightTargets: [],\\n        };\\n\\n        // Prevent clash: Automatically turn off Measure Mode if it was on\\n        if (nextSight && prev.isMeasureMode) {\\n          updates.isMeasureMode = false;\\n          updates.measurePoints = [];\\n        }\\n        return updates;\\n      },\\n      async () => {\\n        // Update Measure graphics to clear the lines if we just turned it off\\n        if (!this.state.isMeasureMode) {\\n          this.updateMeasurementGraphics();\\n        }\\n\\n        if (this.state.isSightMode) {\\n          this.showToast(<span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>3D Sight Mode: Click to place Observer, then click Targets.</span>, 4000);\\n\\n          await this.ensureSightOwner().activate();\\n        } else {\\n          this.clearSight();\\n        }\\n      },\\n    );\\n  };\\n\\n  private toggleViewshedMode = async () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMode = !prev.isViewshedMode;\\n        const updates: any = { isViewshedMode: nextMode };\\n\\n        // Prevent clashes: Automatically turn off other tools\\n        if (nextMode) {\\n          if (prev.isMeasureMode) {\\n            updates.isMeasureMode = false;\\n            updates.measurePoints = [];\\n            this.updateMeasurementGraphics();\\n          }\\n          if (prev.isSightMode) {\\n            updates.isSightMode = false;\\n            updates.sightObserver = null;\\n            updates.sightTargets = [];\\n            this._sight?.clear();\\n          }\\n        }\\n        return updates;\\n      },\\n      () => {\\n        if (this.state.isViewshedMode) {\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Viewshed size={14} /> 360\\u00b0 Viewshed Mode: Click on the point cloud to drop an observer.\\n            </span>,\\n            4000,\\n          );\\n        } else {\\n          this.clearViewshed();\\n        }\\n      },\\n    );\\n  };\\n\\n  private toggleMeasureMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMeasure = !prev.isMeasureMode;\\n        const updates: any = {\\n          isMeasureMode: nextMeasure,\\n          measurePoints: [],\\n        };\\n\\n        // Prevent clash: Automatically turn off Sight Mode if it was on\\n        if (nextMeasure && prev.isSightMode) {\\n          updates.isSightMode = false;\\n          updates.sightObserver = null;\\n          updates.sightTargets = [];\\n          this._sight?.clear();\\n          updates.isViewshedMode = false; // Turn off viewshed\\n          this.clearViewshed(); // Remove the red/green graphics\\n        }\\n        return updates;\\n      },\\n      () => {\\n        this.updateMeasurementGraphics();\\n        if (this.state.isMeasureMode) {\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Measure size={14} /> 3D Measure Mode Active: Click two points.\\n            </span>,\\n            3000,\\n          );\\n        }\\n      },\\n    );\\n  };\\n\\n  private toggleLassoMode = () => {\\n    this.setState(\\n      (prev) => {\\n        const nextMode = !prev.isLassoMode;\\n        const updates: any = {\\n          isLassoMode: nextMode,\\n          lassoPolygon: [],\\n          lassoSelectedObjectIds: [],\\n        };\\n\\n        // Prevent clashes with other 3D tools. Auto-disable them if Lasso is activated.\\n        if (nextMode) {\\n          if (prev.isMeasureMode) {\\n            updates.isMeasureMode = false;\\n            updates.measurePoints = [];\\n            this.updateMeasurementGraphics();\\n          }\\n          if (prev.isSightMode) {\\n            updates.isSightMode = false;\\n            updates.sightObserver = null;\\n            updates.sightTargets = [];\\n            this._sight?.clear();\\n          }\\n          if (prev.isViewshedMode) {\\n            updates.isViewshedMode = false;\\n            this.clearViewshed();\\n          }\\n        }\\n        return updates;\\n      },\\n      () => {\\n        if (this.state.isLassoMode) {\\n          this.showToast(<span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>Lasso Mode Active: Draw on the image to select points.</span>, 4000);\\n        } else {\\n          this.clearLasso();\\n        }\\n      },\\n    );\\n  };\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-tools-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-tools.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited tool-policy references remain)');
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
    console.log(uninstall ? 'Point-cloud tools is already uninstalled. No files changed.' : 'Point-cloud tools is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-tools', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud tools ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Point-cloud tools flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
