#!/usr/bin/env node
'use strict';
/**
 * Screen direction fan v6.84. Compatible current v6 sources.
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
              "before": "import { SequencePerformance } from \"../features/imagery/SequencePerformance\";\nimport { sequenceRouteMemoryStats } from \"../features/imagery/sequenceMemoryBudget\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\nimport { coneDisplayRadius } from \"../features/map-graphics/coneDisplayRadius\";\n",
              "after": "import { SequencePerformance } from \"../features/imagery/SequencePerformance\";\nimport { sequenceRouteMemoryStats } from \"../features/imagery/sequenceMemoryBudget\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { ScreenDirectionCone } from '../features/map-graphics/ScreenDirectionCone';\nimport { SelectionPulse, renderedGroundPoint } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\nimport { coneDisplayRadius } from \"../features/map-graphics/coneDisplayRadius\";\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n  private _turboIndexCache = new TurboIndexCache();\n",
              "after": "  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _turboMetadataCache = new TurboMetadataCache<any>();\n  private _turboTileCache = new TurboTileCache();\n  private _turboIndexCache = new TurboIndexCache();\n"
            },
            {
              "label": "cached pulse symbols 3",
              "before": "\n    // clearSolarGraphics above already releases the solar map layer through its owner.\n    this._elevationProfile?.clear(view, true);\n\n    this._cameraCone?.dispose(view);\n\n    this._nativeSequenceSelection.detach();\n    this._sharedTileRequests.clear(); this._sequenceTileIndex.clear();\n",
              "after": "\n    // clearSolarGraphics above already releases the solar map layer through its owner.\n    this._elevationProfile?.clear(view, true);\n\n    this._screenDirectionCone?.clear();\n    this._cameraCone?.dispose(view);\n\n    this._nativeSequenceSelection.detach();\n    this._sharedTileRequests.clear(); this._sequenceTileIndex.clear();\n"
            },
            {
              "label": "cached pulse symbols 4",
              "before": "   * Removes ALL graphics tagged __isCone from the view.\n   * Must be called instead of (or before) view.graphics.remove(this.currentConeGraphic).\n   */\n  private clearConeGraphics() {\n    this.ensureCameraConeOwner().clear(this.state.jimuMapView?.view);\n  }\n\n  /** Ensures the camera cone layer exists and hugs the terrain at any elevation */\n  private ensureConeLayer(): __esri.GraphicsLayer | null {\n    const { jimuMapView } = this.state;\n    if (!jimuMapView || !this.ArcGISModules?.GraphicsLayer) return null;\n    return this.ensureCameraConeOwner().ensure(jimuMapView.view);\n  }\n\n  /** Bind the SDK factory once; clearing before SDK readiness does not construct a layer. */\n  private ensureCameraConeOwner(): CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {\n",
              "after": "   * Removes ALL graphics tagged __isCone from the view.\n   * Must be called instead of (or before) view.graphics.remove(this.currentConeGraphic).\n   */\n  private clearConeGraphics() {\n    this._screenDirectionCone?.clear();\n    this.ensureCameraConeOwner().clear(this.state.jimuMapView?.view);\n  }\n\n  /** Ensures the camera cone layer exists and hugs the terrain at any elevation */\n  private ensureConeLayer(): __esri.GraphicsLayer | null {\n    const { jimuMapView } = this.state;\n    if (!jimuMapView || !this.ArcGISModules?.GraphicsLayer) return null;\n    return this.ensureCameraConeOwner().ensure(jimuMapView.view);\n  }\n\n  private ensureScreenDirectionCone(): ScreenDirectionCone | null {\n    if (typeof document === 'undefined') return null;\n    return this._screenDirectionCone ??= new ScreenDirectionCone(\n      properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),\n      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) });\n  }\n\n  /** Bind the SDK factory once; clearing before SDK readiness does not construct a layer. */\n  private ensureCameraConeOwner(): CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> {\n"
            },
            {
              "label": "cached pulse symbols 5",
              "before": "\n  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    let displayRadius = coneDisplayRadius(radiusMeters, view.zoom);\n    const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n    const center = lonLatToWebMercator(anchor.lon, anchor.lat);\n    if (!center) return null;\n",
              "after": "\n  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    const screenCone = this.ensureScreenDirectionCone();\n    if (screenCone) {\n      const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n      if (this._cameraCone?.graphic || this._cameraCone?.parts.length) this._cameraCone.clear(view);\n      try { screenCone.show(view, anchor.lon, anchor.lat, heading, radiusMeters, spreadDeg); }\n      catch (error) { screenCone.clear(); console.warn('[Mapillary] Direction fan unavailable', error); }\n      return null;\n    }\n    // Non-DOM fallback retains the bounded native ground indicator.\n    let displayRadius = coneDisplayRadius(radiusMeters, view.zoom);\n    const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n    const center = lonLatToWebMercator(anchor.lon, anchor.lat);\n    if (!center) return null;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/projectedConeRadius.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup tests/projectedConeRadius.test.cjs",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/projectedConeRadius.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const size=m.exports.projectedConeRadius;const projection=scale=>d=>({x:10+d*scale,y:20});\ntest('grounded marker-sized views gain a readable cone length',()=>assert.equal(size(10,projection(.5)),120));\ntest('same ground projection yields same cone independently of zoom labels',()=>{assert.equal(size(10,projection(.5)),size(10,projection(.5)));assert.equal(size(30,projection(.5)),120)});\ntest('close-view requested radius is preserved',()=>assert.equal(size(10,projection(10)),10));\ntest('relative and absolute ground-distance caps remain bounded',()=>{assert.equal(size(1,projection(.01)),2048);assert.equal(size(10,projection(.001)),12000)});\ntest('overview hides a cone too small at its cap',()=>assert.equal(size(10,projection(.0002)),0));\ntest('unavailable terrain/projection retains caller fallback',()=>{assert.equal(size(10,()=>null),null);assert.equal(size(10,()=>({x:NaN,y:1})),null);assert.equal(size(10,()=>({x:0,y:0})),null)});\ntest('projection work stays bounded even under perspective',()=>{let count=0;const r=size(10,d=>(count++,{x:d/(1+d*.01),y:0}));assert.equal(count,3);assert(r>=10&&r<=240)});\nconst cm={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/capConeFootprint.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(cm,cm.exports);const cap=cm.exports.capConeFootprint;\nconst pm={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),pm,pm.exports);\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(sf.parseDiagnostics.length,0);const cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(n=>n.name?.getText(sf)==='drawCone').getText(sf);const Runtime=new Function('renderedGroundPoint','capConeFootprint','projectedConeRadius','coneDisplayRadius','lonLatToWebMercator',ts.transpileModule('class Runtime{'+method+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'return Runtime;')(pm.exports.renderedGroundPoint,cap,size,(r,z)=>z<12?0:z>=17?r:Math.min(r*2**(17-z),r*8,120),()=>({x:0,y:0}));\nfunction draw(type,zoom,terrain=true,scale=.5,flat=false){const w=new Runtime(),pulse={unchanged:true};let queries=0,radius;const v={type,zoom,map:flat?{ground:{layers:[]}}:undefined,toScreen:p=>({x:p.x*scale,y:p.y*scale}),groundView:{elevationSampler:{queryElevation:p=>(queries++,terrain?{...p,z:30}:null)}}};w.state={imageId:'A',jimuMapView:{view:v}};w.currentGreenGraphic=pulse;w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};w.getCoverageDisplayPosition=()=>({lon:1,lat:0});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(...args)=>(radius=args[5],{})});w.clearConeGraphics=()=>radius=0;w.drawCone(1,0,90,10,60);assert.equal(w.currentGreenGraphic,pulse);return {radius,queries}}\ntest('actual runtime sizes 3D from projection at different zoom labels, preserving pulse',()=>{assert.equal(draw('3d',15.6).radius,120);assert.equal(draw('3d',11).radius,120);assert(draw('3d',15.6).queries<=33)});\ntest('actual runtime leaves 2D unchanged without terrain queries',()=>{assert.equal(draw('2d',15).radius,40);assert.equal(draw('2d',15).queries,0)});\ntest('actual runtime retains old fallback while terrain is unavailable',()=>assert.equal(draw('3d',15,false).radius,40));\n\ntest('distant views can extend the cone beyond a fixed-size pulse without exceeding caps',()=>{const radius=size(10,projection(.15));assert.equal(radius,400);assert.equal(radius*.15,60);assert(radius*.15>28)});\n\ntest('actual close-view runtime shrinks the cone in both modes while retaining the image pulse',()=>{for(const type of ['2d','3d']){const value=draw(type,24,true,1000);assert(value.radius>0&&value.radius<.1);assert(value.queries<=48)}});\n\ntest('flat-ground runtime responds to camera projection even when zoom does not change',()=>{const near=draw('3d',20,false,1,true),far=draw('3d',20,false,.25,true);assert.equal(near.radius,60);assert(far.radius>near.radius);assert(far.radius<=240);assert(far.radius*.25<=96)});\n\ntest('zoom 12.6 and 14.1 projections preserve the same readable apparent cone length',()=>{const nearScale=.18,farScale=nearScale/2**(14.1-12.6);const near=size(5,projection(nearScale)),far=size(5,projection(farScale));assert(Math.abs(near*nearScale-60)<.01);assert(Math.abs(far*farScale-60)<.01);assert(far>near);assert(far<=12000)});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/projectedConeRadius.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const size=m.exports.projectedConeRadius;const projection=scale=>d=>({x:10+d*scale,y:20});\ntest('grounded marker-sized views gain a readable cone length',()=>assert.equal(size(10,projection(.5)),120));\ntest('same ground projection yields same cone independently of zoom labels',()=>{assert.equal(size(10,projection(.5)),size(10,projection(.5)));assert.equal(size(30,projection(.5)),120)});\ntest('close-view requested radius is preserved',()=>assert.equal(size(10,projection(10)),10));\ntest('relative and absolute ground-distance caps remain bounded',()=>{assert.equal(size(1,projection(.01)),2048);assert.equal(size(10,projection(.001)),12000)});\ntest('overview hides a cone too small at its cap',()=>assert.equal(size(10,projection(.0002)),0));\ntest('unavailable terrain/projection retains caller fallback',()=>{assert.equal(size(10,()=>null),null);assert.equal(size(10,()=>({x:NaN,y:1})),null);assert.equal(size(10,()=>({x:0,y:0})),null)});\ntest('projection work stays bounded even under perspective',()=>{let count=0;const r=size(10,d=>(count++,{x:d/(1+d*.01),y:0}));assert.equal(count,3);assert(r>=10&&r<=240)});\nconst cm={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/capConeFootprint.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(cm,cm.exports);const cap=cm.exports.capConeFootprint;\nconst pm={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),pm,pm.exports);\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(sf.parseDiagnostics.length,0);const cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(n=>n.name?.getText(sf)==='drawCone').getText(sf);const Runtime=new Function('renderedGroundPoint','capConeFootprint','projectedConeRadius','coneDisplayRadius','lonLatToWebMercator',ts.transpileModule('class Runtime{'+method+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'return Runtime;')(pm.exports.renderedGroundPoint,cap,size,(r,z)=>z<12?0:z>=17?r:Math.min(r*2**(17-z),r*8,120),()=>({x:0,y:0}));\nfunction draw(type,zoom,terrain=true,scale=.5,flat=false){const w=new Runtime(),pulse={unchanged:true};let queries=0,radius;const v={type,zoom,map:flat?{ground:{layers:[]}}:undefined,toScreen:p=>({x:p.x*scale,y:p.y*scale}),groundView:{elevationSampler:{queryElevation:p=>(queries++,terrain?{...p,z:30}:null)}}};w.state={imageId:'A',jimuMapView:{view:v}};w.ensureScreenDirectionCone=()=>null;w.currentGreenGraphic=pulse;w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};w.getCoverageDisplayPosition=()=>({lon:1,lat:0});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(...args)=>(radius=args[5],{})});w.clearConeGraphics=()=>radius=0;w.drawCone(1,0,90,10,60);assert.equal(w.currentGreenGraphic,pulse);return {radius,queries}}\ntest('actual runtime sizes 3D from projection at different zoom labels, preserving pulse',()=>{assert.equal(draw('3d',15.6).radius,120);assert.equal(draw('3d',11).radius,120);assert(draw('3d',15.6).queries<=33)});\ntest('actual runtime leaves 2D unchanged without terrain queries',()=>{assert.equal(draw('2d',15).radius,40);assert.equal(draw('2d',15).queries,0)});\ntest('actual runtime retains old fallback while terrain is unavailable',()=>assert.equal(draw('3d',15,false).radius,40));\n\ntest('distant views can extend the cone beyond a fixed-size pulse without exceeding caps',()=>{const radius=size(10,projection(.15));assert.equal(radius,400);assert.equal(radius*.15,60);assert(radius*.15>28)});\n\ntest('actual close-view runtime shrinks the cone in both modes while retaining the image pulse',()=>{for(const type of ['2d','3d']){const value=draw(type,24,true,1000);assert(value.radius>0&&value.radius<.1);assert(value.queries<=48)}});\n\ntest('flat-ground runtime responds to camera projection even when zoom does not change',()=>{const near=draw('3d',20,false,1,true),far=draw('3d',20,false,.25,true);assert.equal(near.radius,60);assert(far.radius>near.radius);assert(far.radius<=240);assert(far.radius*.25<=96)});\n\ntest('zoom 12.6 and 14.1 projections preserve the same readable apparent cone length',()=>{const nearScale=.18,farScale=nearScale/2**(14.1-12.6);const near=size(5,projection(nearScale)),far=size(5,projection(farScale));assert(Math.abs(near*nearScale-60)<.01);assert(Math.abs(far*farScale-60)<.01);assert(far>near);assert(far<=12000)});\n\ntest('runtime uses screen cone at full overview without creating a ground wedge',()=>{const w=new Runtime();let displayed;w.state={imageId:'A',jimuMapView:{view:{type:'3d',zoom:0}}};w.ArcGISModules={};w.ensureScreenDirectionCone=()=>({show:(...args)=>displayed=args});w.getCoverageDisplayPosition=()=>({lon:1,lat:2});assert.equal(w.drawCone(1,2,45,5,60),null);assert.equal(displayed[1],1);assert.equal(displayed[2],2);assert.equal(displayed[4],5)});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/ScreenDirectionCone.ts",
      "content": "import { renderedGroundPoint } from './SelectionPulse';\n\n/** Convert screen coordinates to the existing absolute-positioning parent; never restyle the map. */\nexport function haloOverlayPosition(host: HTMLElement, element: HTMLElement, pixel: { x: number; y: number }, width: number, height: number): { x: number; y: number } | null {\n const parent = element.offsetParent as HTMLElement | null, win = host.ownerDocument.defaultView;\n if (!parent || !win || width <= 0 || height <= 0) return null;\n const box = host.getBoundingClientRect();\n if (!(box.width > 0 && box.height > 0)) return null;\n const x = box.left + pixel.x * box.width / width, y = box.top + pixel.y * box.height / height;\n const root = parent === host.ownerDocument.documentElement || (parent === host.ownerDocument.body && win.getComputedStyle(parent).position === 'static');\n if (root) return { x: x + win.scrollX, y: y + win.scrollY };\n const offset = parent.getBoundingClientRect();\n const sx = parent.offsetWidth > 0 ? offset.width / parent.offsetWidth : 1;\n const sy = parent.offsetHeight > 0 ? offset.height / parent.offsetHeight : 1;\n if (!(sx > 0 && sy > 0)) return null;\n return { x: (x - offset.left) / sx - parent.clientLeft + parent.scrollLeft,\n  y: (y - offset.top) / sy - parent.clientTop + parent.scrollTop };\n}\n\n\n/** Fixed CSS-pixel direction fan; no terrain mesh and no zoom visibility threshold. */\nexport class ScreenDirectionCone {\n private element: HTMLDivElement | null = null;\n private view: any = null;\n private frame: number | null = null;\n private projectionCache: any = null;\n private model: { lon: number; lat: number; heading: number; radius: number; spread: number } | null = null;\n constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,\n  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void }) {}\n show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {\n  if (view !== this.view) this.clear();\n  const radius = Math.min(32, Math.max(18, 24 * Math.sqrt(metres / 5))), angle = Math.min(120, Math.max(15, spread));\n  const previous = this.model;\n  if (!previous || previous.lon!==lon || previous.lat!==lat || previous.heading!==heading || previous.radius!==radius || previous.spread!==angle) this.model = { lon, lat, heading, radius, spread: angle };\n  if (!this.element) {\n   const host = view.container;\n   if (!host || typeof host.appendChild !== 'function') return;\n   const element = this.createElement(); element.setAttribute('aria-hidden', 'true');\n   Object.assign(element.style, { position: 'absolute', pointerEvents: 'none', width: '72px', height: '72px', zIndex: '8', display: 'none', transformOrigin: '50% 50%' });\n   host.appendChild(element); this.element = element; this.view = view;\n  }\n  if (!previous || previous.radius !== radius || previous.spread !== angle || !this.element.firstChild) {\n   const a = angle * Math.PI / 360, inner = 9;\n   const x = Math.sin(a), y = Math.cos(a), left = `${36-radius*x} ${36-radius*y}`, right = `${36+radius*x} ${36-radius*y}`;\n   const start = `${36-inner*x} ${36-inner*y}`, end = `${36+inner*x} ${36-inner*y}`;\n   // A clear central hole leaves the native green circle and white outline uncovered.\n   this.element.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"72\" height=\"72\" viewBox=\"0 0 72 72\"><path d=\"M${start} L${left} A${radius} ${radius} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z\" fill=\"#ffb300\" fill-opacity=\"0.55\" stroke=\"#ff9800\" stroke-width=\"1.25\" stroke-linejoin=\"round\"/></svg>`;\n  }\n  if (this.frame == null) {\n   let last = -Infinity;\n   const track = (now: number) => {\n    if (this.view !== view || !this.element || view.destroyed) { this.clear(); return; }\n    if (now-last >= 32) { last = now; try { this.position(); } catch { this.element.style.display = 'none'; } }\n    this.frame = this.clock.request(track);\n   };\n   this.frame = this.clock.request(track);\n  }\n }\n private position(): void {\n  const view = this.view, element = this.element, m = this.model;\n  if (!view || !element || !m) return;\n  if (view.container.ownerDocument?.visibilityState === 'hidden') { element.style.display = 'none'; return; }\n  let pixel: any, bearing: number;\n  const cache = this.projectionCache;\n  if(cache && cache.model===m && cache.camera===view.camera && cache.zoom===view.zoom && cache.rotation===view.rotation && cache.width===view.width && cache.height===view.height && view.stationary===true && view.updating===false) { pixel=cache.pixel; bearing=cache.bearing; }\n  else {\n  const source = this.point({ longitude: m.lon, latitude: m.lat, spatialReference: { wkid: 4326 } });\n  let ground = view.type === '3d' ? renderedGroundPoint(view, source, this.point) : source;\n  // At overview scale, missing terrain height has negligible screen displacement.\n  if (!ground && view.zoom < 14) ground = this.point({ longitude:m.lon, latitude:m.lat, z:0, spatialReference:{wkid:4326} });\n  pixel = ground && view.toScreen(ground);\n  if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) || pixel.x < 0 || pixel.y < 0 || pixel.x > view.width || pixel.y > view.height) { element.style.display = 'none'; return; }\n  const radians = m.heading*Math.PI/180, distance = Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40));\n  const tip = this.point({ longitude: m.lon + Math.sin(radians)*distance/(111320*Math.max(.01,Math.cos(m.lat*Math.PI/180))), latitude: Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)), z: ground.z || 0, spatialReference:{wkid:4326} });\n  const projected = view.toScreen(tip), dx = projected?.x-pixel.x, dy = projected?.y-pixel.y;\n  bearing = Number.isFinite(dx) && Number.isFinite(dy) && Math.hypot(dx,dy)>.001 ? Math.atan2(dx,-dy)*180/Math.PI : m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);\n  this.projectionCache={model:m,pixel,bearing,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};\n  }\n  element.style.display = 'block';\n  const position = haloOverlayPosition(view.container,element,pixel,view.width,view.height);\n  if (!position) { element.style.display = 'none'; return; }\n  const left=`${position.x}px`,top=`${position.y}px`,transform=`translate(-50%, -50%) rotate(${bearing}deg)`;\n  if(element.style.left!==left)element.style.left=left;\n  if(element.style.top!==top)element.style.top=top;\n  if(element.style.transform!==transform)element.style.transform=transform;\n }\n clear(): void {\n  if(this.frame!=null)this.clock.cancel(this.frame);\n  this.frame=null;this.element?.remove();this.element=null;this.view=null;this.model=null;this.projectionCache=null;\n }\n}\n"
    },
    {
      "file": "tests/screenDirectionCone.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),{ScreenDirectionCone}=load('ScreenDirectionCone.ts',()=>pulse);\nfunction setup(){let frame,requests=0,cancels=0,removed=0,projections=0;const elements=[],parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},host={style:{position:''},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300}),ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){}},view={type:'3d',zoom:14.1,width:300,height:300,stationary:true,updating:false,rotation:0,camera:{heading:0},container:host,map:{ground:{layers:[]}},toScreen:p=>(projections++,{x:150+p.longitude,y:150-p.latitude})};const cone=new ScreenDirectionCone(p=>({...p}),()=>{const element={offsetParent:parent,style:{},setAttribute(){},remove(){removed++},innerHTML:'',firstChild:null};elements.push(element);return element},{request:cb=>(frame=cb,++requests),cancel:()=>cancels++});return{cone,view,elements,tick:t=>frame(t),stats:()=>({requests,cancels,removed,projections})}}\ntest('fan keeps pixel dimensions at zoom 14.1, 12.6 and full overview, with no animation',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);const el=x.elements[0],svg=el.innerHTML;assert.equal(el.style.width,'72px');assert.equal(el.style.display,'block');assert(svg.includes('A24 24'));assert(svg.includes('A9 9'));assert(!svg.includes('<animate'));assert.equal(el.style.transform,'translate(-50%, -50%) rotate(0deg)');let time=40;for(const zoom of[12.6,0]){x.view.zoom=zoom;x.tick(time);time+=40;assert.equal(el.innerHTML,svg);assert.equal(el.style.display,'block')}assert.equal(x.view.container.style.position,'');x.cone.clear()});\ntest('idle projection is cached; updates preserve element and cleanup cancels tracker',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.stats().projections,2);x.tick(40);assert.equal(x.stats().projections,2);x.cone.show(x.view,0,0,90,5,60);x.tick(80);assert.equal(x.elements.length,1);assert(x.elements[0].style.transform.includes('rotate(90deg)'));x.cone.clear();assert.equal(x.stats().cancels,1);assert.equal(x.stats().removed,1);const n=x.stats().requests;x.tick(120);assert.equal(x.stats().requests,n)});\ntest('unknown near terrain hides fan, but overview still projects on globe surface',()=>{const x=setup();x.view.map.ground.layers=[{}];x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');x.view.zoom=0;x.tick(40);assert.equal(x.elements[0].style.display,'block');x.cone.clear()});\ntest('offscreen anchor hides fan and style is pointer transparent',()=>{const x=setup();x.cone.show(x.view,1000,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');assert.equal(x.elements[0].style.pointerEvents,'none');x.cone.clear()});\n"
    },
    {
      "file": "docs/SCREEN-DIRECTION-CONE.md",
      "content": "# v6.84 screen-sized direction fan\nRequires v6.83. Keeps the fixed green circle/white outline and no pulse. Browser path replaces the metre-sized native wedge with one pointer-transparent SVG fan anchored in screen coordinates. Default radius 24 CSS pixels, relative length setting bounded 18–32px; central 9px opening keeps the marker unobscured. No minimum zoom threshold: remains visible at overview/globe zoom while its anchor is in the viewport and can be projected. Heading uses projected local ground direction, with camera/rotation fallback. It indicates direction, not a true physical field-of-view footprint. Extreme/offscreen/unknown near terrain can hide the fan safely. No animation, marker symbol swaps, camera mutation or container positioning writes.\n\nOne owned RAF tracker caps positioning to ~30Hz; at most two projections per update and one rendered-height query, no network elevation fetches. Existing native cone graphics are cleared on transition, not every frame. Cleanup handles selection clear and view transfer. Ground renderer remains as non-DOM fallback (legacy helper tests still cover it). An SVG overlay intentionally stays readable rather than flattening into terrain at shallow tilt.\n\nFiles: new ScreenDirectionCone.ts; runtime cone dispatch/lifecycle; tests projectedConeRadius.test.cjs plus new screenDirectionCone.test.cjs. --uninstall returns to v6.83 metre-sized cone. Rebuild/reload after installation/uninstall.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'screen-direction-fan-v6-84-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.84 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'screen-direction-fan-v6-84' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.84 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.84 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.84 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-screen-direction-fan-v6-84.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Screen direction fan v6.84 is already installed. No files changed.');
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
  const manifest = { installer: 'screen-direction-fan-v6-84', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Screen direction fan v6.84 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
