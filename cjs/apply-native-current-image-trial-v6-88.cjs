#!/usr/bin/env node
'use strict';
/**
 * Native current image trial v6.88. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
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
      "variants": [
        {
          "blocks": [
            {
              "label": "cached pulse symbols 1",
              "before": "import { SequencePerformance } from \"../features/imagery/SequencePerformance\";\nimport { sequenceRouteMemoryStats } from \"../features/imagery/sequenceMemoryBudget\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { ScreenDirectionCone } from '../features/map-graphics/ScreenDirectionCone';\nimport { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\n",
              "after": "import { SequencePerformance } from \"../features/imagery/SequencePerformance\";\nimport { sequenceRouteMemoryStats } from \"../features/imagery/sequenceMemoryBudget\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { NativeCurrentImageMarker } from '../features/map-graphics/NativeCurrentImageMarker';\nimport { ScreenDirectionCone } from '../features/map-graphics/ScreenDirectionCone';\nimport { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n",
              "after": "  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n"
            },
            {
              "label": "cached pulse symbols 3",
              "before": "\n    // clearSolarGraphics above already releases the solar map layer through its owner.\n    this._elevationProfile?.clear(view, true);\n\n    this._screenDirectionCone?.clear();\n    this._cameraCone?.dispose(view);\n\n    this._nativeSequenceSelection.detach();\n",
              "after": "\n    // clearSolarGraphics above already releases the solar map layer through its owner.\n    this._elevationProfile?.clear(view, true);\n\n    this._nativeCurrentImageMarker?.clear();\n    this._screenDirectionCone?.clear();\n    this._cameraCone?.dispose(view);\n\n    this._nativeSequenceSelection.detach();\n"
            },
            {
              "label": "cached pulse symbols 4",
              "before": "   * Removes ALL graphics tagged __isCone from the view.\n   * Must be called instead of (or before) view.graphics.remove(this.currentConeGraphic).\n   */\n  private clearConeGraphics() {\n    this._screenDirectionCone?.hideCone();\n    this.ensureCameraConeOwner().clear(this.state.jimuMapView?.view);\n  }\n\n",
              "after": "   * Removes ALL graphics tagged __isCone from the view.\n   * Must be called instead of (or before) view.graphics.remove(this.currentConeGraphic).\n   */\n  private clearConeGraphics() {\n    this._nativeCurrentImageMarker?.hideCone();\n    this._screenDirectionCone?.hideCone();\n    this.ensureCameraConeOwner().clear(this.state.jimuMapView?.view);\n  }\n\n"
            },
            {
              "label": "cached pulse symbols 5",
              "before": "    if (!jimuMapView || !this.ArcGISModules?.GraphicsLayer) return null;\n    return this.ensureCameraConeOwner().ensure(jimuMapView.view);\n  }\n\n  private ensureScreenDirectionCone(): ScreenDirectionCone | null {\n    if (typeof document === 'undefined') return null;\n    return this._screenDirectionCone ??= new ScreenDirectionCone(\n      properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),\n      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },\n      (presented, view) => {\n",
              "after": "    if (!jimuMapView || !this.ArcGISModules?.GraphicsLayer) return null;\n    return this.ensureCameraConeOwner().ensure(jimuMapView.view);\n  }\n\n  private ensureScreenDirectionCone(): ScreenDirectionCone | NativeCurrentImageMarker | null {\n    if (typeof document === 'undefined') return null;\n    if (this.state.jimuMapView?.view.type === '3d') {\n      return this._nativeCurrentImageMarker ??= new NativeCurrentImageMarker(\n        { point: p => new this.ArcGISModules.Point(p), mesh: p => new this.ArcGISModules.Mesh(p),\n          layer: p => new this.ArcGISModules.GraphicsLayer(p), graphic: p => new this.ArcGISModules.Graphic(p),\n          element: () => document.createElement('div') },\n        { request: cb => requestAnimationFrame(cb), cancel: frame => cancelAnimationFrame(frame) },\n        (presented, view) => {\n          if (this._selectionPulse?.view === view && this._selectionPulse.layer && this._selectionPulse.layer.visible === presented)\n            this._selectionPulse.layer.visible = !presented;\n        });\n    }\n    return this._screenDirectionCone ??= new ScreenDirectionCone(\n      properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),\n      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },\n      (presented, view) => {\n"
            },
            {
              "label": "cached pulse symbols 6",
              "before": "   * Removes the current pulsing green graphic from the map and clears\n   * its animation interval.\n   */\n  private clearGreenPulse() {\n    this._screenDirectionCone?.hideMarker();\n    this._nativeImageAnchorAbort?.abort(); this._nativeImageAnchorAbort = null; this._nativeImageAnchorKey = '';\n    this.ensureSelectionPulseOwner().dispose();\n  }\n",
              "after": "   * Removes the current pulsing green graphic from the map and clears\n   * its animation interval.\n   */\n  private clearGreenPulse() {\n    this._nativeCurrentImageMarker?.hideMarker();\n    this._screenDirectionCone?.hideMarker();\n    this._nativeImageAnchorAbort?.abort(); this._nativeImageAnchorAbort = null; this._nativeImageAnchorKey = '';\n    this.ensureSelectionPulseOwner().dispose();\n  }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/NativeCurrentImageMarker.ts",
      "content": "import { ScreenDirectionCone } from './ScreenDirectionCone';\nimport { renderedGroundPoint } from './SelectionPulse';\nimport { nativeCurrentImageMesh } from './nativeCurrentImageMesh';\n\n/** Experimental native mesh close up, existing SVG at overview or unavailable geometry. */\nexport class NativeCurrentImageMarker {\n private view:any=null;private layer:any=null;private graphic:any=null;private layerView:any=null;\n private frame:number|null=null;private fallbackFrame:FrameRequestCallback|null=null;private revision=0;\n private model:any=null;private marker=false;private fan=false;private nativeActive=false;private key='';private scale=0;private warned=false;\n private fallback:ScreenDirectionCone;private settled:any=null;\n constructor(private factory:{point:(p:any)=>any;layer:(p:any)=>any;graphic:(p:any)=>any;mesh:(p:any)=>any;element:()=>HTMLDivElement},\n  private clock:{request:(cb:FrameRequestCallback)=>number;cancel:(id:number)=>void},private presented:(active:boolean,view:any)=>void){\n  this.fallback=new ScreenDirectionCone(factory.point,factory.element,{request:cb=>{this.fallbackFrame=cb;return 1},cancel:()=>{this.fallbackFrame=null}},(active,view)=>{if(!this.nativeActive)this.presented(active,view)});\n }\n private useView(view:any):void{if(this.view!==view){this.clear();this.view=view;}}\n showMarker(view:any,lon:number,lat:number,color:any,id:string):void{\n  this.useView(view);if(this.model?.id!==String(id))this.fan=false;\n  this.marker=true;this.model={...this.model,lon,lat,color:Array.isArray(color)?color:[0,255,0,1],id:String(id)};this.start();\n }\n show(view:any,lon:number,lat:number,heading:number,metres:number,spread:number):void{\n  this.useView(view);this.fan=true;this.model={...this.model,lon,lat,heading,metres,spread};this.start();\n }\n hideCone():void{this.fan=false;this.key='';this.fallback.hideCone();if(!this.marker)this.clear();}\n hideMarker():void{this.marker=false;this.key='';this.fallback.hideMarker();this.presented(false,this.view);if(!this.fan)this.clear();}\n private start():void{\n  if(this.frame!=null)return;const ownerView=this.view;let last=-Infinity;\n  const tick=(now:number)=>{\n   if(this.view!==ownerView)return;\n   if(!this.view||this.view.destroyed){this.clear();return;}\n   if(now-last>=100){last=now;try{this.update();}catch(error){if(!this.warned){this.warned=true;console.warn('[Mapillary] Native marker trial using SVG fallback',error);}this.showFallback(true);}}\n   const callback=this.fallbackFrame;this.fallbackFrame=null;if(callback)callback(now);\n   if(this.view)this.frame=this.clock.request(tick);\n  };this.frame=this.clock.request(tick);\n }\n private showFallback(hideMesh:boolean):void{\n  const view=this.view,m=this.model;if(!view||!m)return;\n  const wasNative=this.nativeActive;this.nativeActive=false;\n  if(hideMesh&&this.layer)this.layer.visible=false;\n  if(wasNative)this.presented(false,view);\n  if(this.marker)this.fallback.showMarker(view,m.lon,m.lat,m.color,m.id||'');else this.fallback.hideMarker();\n  if(this.fan)this.fallback.show(view,m.lon,m.lat,m.heading||0,m.metres||10,m.spread||60);else this.fallback.hideCone();\n }\n private update():void{\n  const view=this.view,m=this.model;if(!view||!m)return;\n  const cached=this.settled;\n  if(this.nativeActive&&view.stationary===true&&view.updating===false&&cached?.model===m&&cached.marker===this.marker&&cached.fan===this.fan&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.sampler===view.groundView?.elevationSampler)return;\n  // Readability at globe/overview scale remains the validated SVG representation.\n  if(view.zoom<10){this.showFallback(true);return;}\n  const source=this.factory.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}}),ground=renderedGroundPoint(view,source,this.factory.point);\n  if(!ground){this.showFallback(true);return;}\n  const origin=view.toScreen(ground),d=10,cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));\n  const east=view.toScreen(this.factory.point({longitude:m.lon+d/(111320*cos),latitude:m.lat,z:ground.z,spatialReference:{wkid:4326}}));\n  const north=view.toScreen(this.factory.point({longitude:m.lon,latitude:m.lat+d/111320,z:ground.z,spatialReference:{wkid:4326}}));\n  if(![origin?.x,origin?.y,east?.x,east?.y,north?.x,north?.y].every(Number.isFinite)){this.showFallback(true);return;}\n  const ex=(east.x-origin.x)/d,ey=(east.y-origin.y)/d,nx=(north.x-origin.x)/d,ny=(north.y-origin.y)/d;\n  const aa=ex*ex+ey*ey,bb=nx*nx+ny*ny,dot=ex*nx+ey*ny,px=Math.sqrt((aa+bb+Math.sqrt((aa-bb)**2+4*dot*dot))/2);\n  if(!(px>.0001)){this.showFallback(true);return;}\n  let scale=1/px;const radius=Math.min(52,Math.max(18,32*Math.sqrt((m.metres||10)/10))),extent=(this.fan?radius:8)*scale;\n  if(extent>(this.nativeActive?275:225)){this.showFallback(true);return;}\n  if(this.scale&&Math.abs(scale/this.scale-1)<.03)scale=this.scale;\n  const height=Math.round(ground.z/Math.max(.005,scale*.05))*Math.max(.005,scale*.05);\n  const key=JSON.stringify([m.lon,m.lat,height,scale,m.heading||0,radius,m.spread||60,this.marker,this.fan,m.color,m.id]);\n  if(!this.layer){\n   const layer=this.factory.layer({id:'mapillary-current-image-native-trial',title:'Current image native 3D trial',listMode:'hide',elevationInfo:{mode:'absolute-height'}});\n   view.map.add(layer);this.layer=layer;const revision=++this.revision;\n   Promise.resolve(view.whenLayerView?.(layer)).then(lv=>{if(this.view===view&&this.layer===layer&&this.revision===revision)this.layerView=lv;}).catch(()=>{});\n  }\n  this.layer.visible=true;\n  if(key!==this.key){\n   const geometry=this.factory.mesh(nativeCurrentImageMesh(m.lon,m.lat,height,scale,radius,m.spread||60,m.heading||0,this.marker,this.fan,m.color));\n   if(this.graphic){this.graphic.geometry=geometry;this.graphic.attributes={image_id:m.id||''};}\n   else {this.graphic=this.factory.graphic({geometry,attributes:{image_id:m.id||''},symbol:{type:'mesh-3d',symbolLayers:[{type:'fill',castShadows:false}]}});this.layer.add(this.graphic);}\n   this.key=key;this.scale=scale;\n  }\n  const ready=this.layerView&&!this.layerView.suspended&&this.layerView.visible!==false&&(this.nativeActive||!this.layerView.updating);\n  if(!ready){this.showFallback(false);return;}\n  this.nativeActive=true;this.fallback.clear();this.presented(this.marker,view);this.settled={model:m,marker:this.marker,fan:this.fan,camera:view.camera,zoom:view.zoom,sampler:view.groundView?.elevationSampler};\n }\n clear():void{\n  const view=this.view;this.nativeActive=false;this.fallback.clear();this.presented(false,view);\n  if(this.frame!=null)this.clock.cancel(this.frame);this.frame=null;this.fallbackFrame=null;\n  ++this.revision;if(this.layer){view?.map?.remove(this.layer);this.layer.destroy();}\n  this.layer=null;this.graphic=null;this.layerView=null;this.view=null;this.model=null;this.marker=false;this.fan=false;this.key='';this.scale=0;this.settled=null;\n }\n}\n"
    },
    {
      "file": "src/features/map-graphics/nativeCurrentImageMesh.ts",
      "content": "/** Thin, closed local-metre solids in one Mesh, with per-component materials. */\nexport function nativeCurrentImageMesh(lon:number,lat:number,z:number,scale:number,radius:number,spread:number,heading:number,marker:boolean,fan:boolean,color:number[]=[0,255,0,1]) {\n const position:number[]=[],components:any[]=[];\n const section=(inner:number,outer:number,start:number,end:number,n:number,rgba:number[],height:(r:number)=>number)=>{\n  const faces:number[]=[],base=position.length/3,full=Math.abs(end-start-360)<.001;\n  for(let i=0;i<=n;i++){\n   const a=(start+(end-start)*i/n)*Math.PI/180;\n   for(const [r,h]of[[inner,height(inner)],[outer,height(outer)],[inner,.1],[outer,.1]])position.push(scale*r*Math.sin(a),scale*r*Math.cos(a),scale*h);\n  }\n  for(let i=0;i<n;i++){\n   const a=base+i*4,b=a+4;\n   if(inner>0)faces.push(a,b,b+1,a,b+1,a+1,a+2,b+3,b+2,a+2,a+3,b+3,a,b+2,b,a,a+2,b+2);\n   else faces.push(a,b+1,a+1,a+2,a+3,b+3);\n   faces.push(a+1,b+1,a+3,b+1,b+3,a+3);\n  }\n  if(!full){const a=base,b=base+n*4;faces.push(a,a+1,a+2,a+1,a+3,a+2,b,b+2,b+1,b+1,b+2,b+3);}\n  components.push({faces,shading:'flat',material:{color:rgba,alphaMode:rgba[3]<1?'blend':'opaque',doubleSided:false}});\n };\n if(marker){section(0,6,0,360,32,color,()=>.65);section(6,8,0,360,32,[255,255,255,1],()=>.65);}\n if(fan)section(8.5,radius,heading-spread/2,heading+spread/2,20,[255,179,0,.7],r=>.35+Math.max(0,r-8.5)*.035);\n return {spatialReference:{wkid:4326},vertexSpace:{type:'local',origin:[lon,lat,z]},vertexAttributes:{position},components};\n}\n"
    },
    {
      "file": "tests/nativeCurrentImageMarker.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req=()=>({})){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),screen=load('ScreenDirectionCone.ts',()=>pulse),geometry=load('nativeCurrentImageMesh.ts'),{NativeCurrentImageMarker}=load('NativeCurrentImageMarker.ts',name=>name.includes('ScreenDirectionCone')?screen:name.includes('SelectionPulse')?pulse:geometry);\nfunction setup(){let frame,requests=0,cancels=0,meshes=0,projections=0;const layers=[],states=[],lv={visible:true,updating:false,suspended:false},parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},view={type:'3d',zoom:20,stationary:false,updating:true,camera:{},width:300,height:300,map:{ground:{layers:[]},add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},container:{ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},whenLayerView:()=>Promise.resolve(lv),ppm:5,toScreen:p=>(projections++,{x:150+p.longitude*111320*view.ppm,y:150-p.latitude*111320*view.ppm})};const factory={point:p=>({...p}),mesh:p=>(meshes++,p),graphic:p=>({...p}),layer:p=>({...p,visible:true,graphics:[],add(g){this.graphics.push(g)},destroy(){this.destroyed=true}}),element:()=>{const part=()=>({style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]}}),fan=part(),marker=part();return{style:{},offsetParent:parent,setAttribute(){},remove(){},querySelector:s=>s.includes('direction-fan')?fan:marker}}};const owner=new NativeCurrentImageMarker(factory,{request:cb=>(frame=cb,++requests),cancel:()=>cancels++},(v,view)=>states.push(v));return{owner,view,layers,states,lv,tick:t=>frame(t),stats:()=>({requests,cancels,meshes,projections})}}\ntest('single native mesh has valid bounded faces, local origin and green/white/orange materials',()=>{const m=geometry.nativeCurrentImageMesh(1,2,3,.1,32,60,45,true,true);assert.deepEqual(m.vertexSpace.origin,[1,2,3]);assert.equal(m.components.length,3);const n=m.vertexAttributes.position.length/3;assert(n<500);for(const c of m.components){assert.equal(c.faces.length%3,0);for(const i of c.faces)assert(Number.isInteger(i)&&i>=0&&i<n)}assert.deepEqual(m.components[0].material.color,[0,255,0,1]);assert.deepEqual(m.components[1].material.color,[255,255,255,1]);assert.equal(m.components[2].material.alphaMode,'blend');assert.equal(m.spatialReference.wkid,4326)});\ntest('native trial retains one Graphic, waits for layer readiness and updates geometry only on change',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,45,10,60);x.tick(0);assert.equal(x.layers.length,1);assert.equal(x.owner.nativeActive,false);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);const g=x.layers[0].graphics[0],symbol=g.symbol;assert.equal(g.geometry.components.length,3);const meshes=x.stats().meshes;x.tick(240);assert.equal(x.stats().meshes,meshes);x.view.ppm=10;x.tick(360);assert.equal(x.layers[0].graphics[0],g);assert.equal(g.symbol,symbol);assert.equal(x.stats().meshes,meshes+1);x.view.stationary=true;x.view.updating=false;x.tick(480);const projected=x.stats().projections;x.tick(600);assert.equal(x.stats().projections,projected);x.owner.clear();assert.equal(x.layers.length,0);assert.equal(x.owner.frame,null);assert.equal(x.stats().cancels,1)});\ntest('overview switches to SVG without a huge physical mesh, then native resumes',async()=>{const x=setup();x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.owner.show(x.view,0,0,0,10,60);x.tick(0);await Promise.resolve();x.tick(120);assert.equal(x.owner.nativeActive,true);x.view.zoom=2;x.tick(240);assert.equal(x.owner.nativeActive,false);assert.equal(x.layers[0].visible,false);assert(x.owner.fallback.element);assert.equal(x.states.at(-1),true);x.view.zoom=20;x.tick(360);assert.equal(x.owner.nativeActive,true);assert.equal(x.owner.fallback.element,null);x.owner.hideCone();x.tick(480);assert.equal(x.layers[0].graphics[0].geometry.components.length,2);x.owner.hideMarker();assert.equal(x.layers.length,0)});\ntest('late native layer-view resolution cannot revive cleared owner',async()=>{const x=setup();let resolve;x.view.whenLayerView=()=>new Promise(r=>resolve=r);x.owner.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);x.owner.clear();resolve(x.lv);await Promise.resolve();assert.equal(x.owner.layerView,null);assert.equal(x.layers.length,0)});\n"
    },
    {
      "file": "docs/NATIVE-CURRENT-IMAGE-TRIAL.md",
      "content": "# v6.88 experimental native mesh current-image marker\nRequires v6.87. Native SceneView trial: one retained Graphic/MeshSymbol3D with green disk, white rim and raised orange sector as closed mesh material components. Local east/north/up metre coordinates, absolute ground height sampled from rendered terrain or known flat ground, no always-visible override and no cast shadows. Native depth/building occlusion applies. Actual terrain mesh draping across the complete shape is not provided; it is a small local tangent-plane object.\n\nCamera scale is estimated from projected local east/north basis. Geometry changes at most ~10Hz and only when parameters/height or scale change; scale has 3% hysteresis. No pulsing or symbol replacement. Existing Graphic/image_id used by selection stays intact and hidden while the trial marker is presented. No FPS improvement promised. Native layer readiness is awaited while the existing SVG remains available. Zoom below10, unavailable terrain or needed world radius beyond ~250m switches automatically to v6.87 SVG, preserving readable overview without a kilometre-sized physical object. This is a hybrid native/overview experiment, not native at every zoom. One shared RAF scheduler services native checks and optional SVG fallback.\n\n2D unchanged. Cleanup removes native layer/Graphic and fallback SVG. Selection, hover/picking algorithms untouched. --uninstall restores v6.87 exactly. Rebuild/restart/hard-refresh after installing or uninstalling. This is a visual experiment; it does not establish a fix for the historical SDK flicker issue.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'native-current-image-trial-v6-88-';

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


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.88 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'native-current-image-trial-v6-88' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.88 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.88 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.88 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-native-current-image-trial-v6-88.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Native current image trial v6.88 is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
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
  const manifest = { installer: 'native-current-image-trial-v6-88', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Native current image trial v6.88 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
