#!/usr/bin/env node
'use strict';
/**
 * Direction hover bearing cone v6.95. Compatible current v6 sources.
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
              "label": "direction hover forwarding 0",
              "before": "  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _directionAnchorAbort: AbortController | null = null;\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n",
              "after": "  private _selectionPulse: SelectionPulse<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeImageAnchorAbort: AbortController | null = null;\n  private _nativeImageAnchorKey = '';\n  private _directionAnchorAbort: AbortController | null = null;\n  private _directionBearings = new Map<string, { token: string; bearing?: number }>();\n  private _clickRippleAnimations: ClickRippleAnimations<__esri.Graphic, __esri.MapView | __esri.SceneView> | null = null;\n  private _nativeCurrentImageMarker: NativeCurrentImageMarker | null = null;\n  private _screenDirectionCone: ScreenDirectionCone | null = null;\n  private _cameraCone: CameraConeGraphics<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView> | null = null;\n"
            },
            {
              "label": "direction hover forwarding 1",
              "before": "    } finally {\n      if (current()) {\n        const anchor = this.getCoverageDisplayPosition(image.id, lon, lat);\n        this.ensureDirectionHoverMarker().draw(view, { id: image.id, lon: anchor.lon, lat: anchor.lat });\n      }\n      if (this._directionAnchorAbort === controller) this._directionAnchorAbort = null;\n    }\n  }\n",
              "after": "    } finally {\n      if (current()) {\n        const anchor = this.getCoverageDisplayPosition(image.id, lon, lat);\n        this.ensureDirectionHoverMarker().draw(view, { id: image.id, lon: anchor.lon, lat: anchor.lat });\n        // Draw the aligned disk immediately; enrich its cone only while this hover remains current.\n        try {\n          let metadata = this._directionBearings.get(image.id);\n          if (!metadata || metadata.token !== token) {\n            const data = await this.runSequenceBackground(signal => this.fetchMapillaryJson(\n              `${GRAPH_API.BASE}/${encodeURIComponent(image.id)}?fields=computed_compass_angle,compass_angle,is_pano`, token, signal), controller.signal);\n            if (!current()) return;\n            const angle = data.computed_compass_angle ?? data.compass_angle;\n            metadata = { token, bearing: !data.is_pano && Number.isFinite(angle) ? angle : undefined };\n            this._directionBearings.delete(image.id); this._directionBearings.set(image.id, metadata);\n            if (this._directionBearings.size > 64) this._directionBearings.delete(this._directionBearings.keys().next().value!);\n          }\n          if (current() && metadata.bearing !== undefined)\n            this.ensureDirectionHoverMarker().draw(view, { id: image.id, lon: anchor.lon, lat: anchor.lat, bearing: metadata.bearing });\n        } catch (error) {\n          if (current() && (error as any)?.name !== 'AbortError') this.log('[Mapillary] Direction bearing unavailable:', error);\n        }\n      }\n      if (this._directionAnchorAbort === controller) this._directionAnchorAbort = null;\n    }\n  }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/DirectionHoverMarker.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady ground target",
              "before": "/** Ground-aligned navigation target; 3D is steady, 2D retains its existing pulse. */\nexport interface DirectionMarkerGraphic { symbol: any; geometry?: any; visible?: boolean; }\nexport interface DirectionMarkerView<G> {\n type: string;\n graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };\n}\nexport interface DirectionMarkerMinimap<G> {\n graphics: { forEach(callback: (graphic: G) => void): void };\n add(graphic: G): unknown; remove(graphic: G): unknown;\n}\ninterface GroundMarker {\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void;\n clear(): void;\n}\nexport interface DirectionMarkerHost<G> {\n getView(): DirectionMarkerView<G> | null | undefined;\n getMinimap(): DirectionMarkerMinimap<G> | null;\n createGraphic(properties: any): G;\n createGroundMarker?(presented: (visible: boolean) => void): GroundMarker;\n setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;\n clearInterval(handle: ReturnType<typeof setInterval>): void;\n}\nexport class DirectionHoverMarker<G extends DirectionMarkerGraphic> {\n graphic: G | null = null;\n private view: DirectionMarkerView<G> | null = null;\n private minimap: DirectionMarkerMinimap<G> | null = null;\n private minimapGraphic: G | null = null;\n private ground: GroundMarker | null = null;\n private timer: ReturnType<typeof setInterval> | null = null;\n constructor(private readonly host: DirectionMarkerHost<G>) {}\n draw(view: DirectionMarkerView<G>, image: {id: string; lon: number; lat: number}): void {\n  const geometry={type:'point',longitude:image.lon,latitude:image.lat,spatialReference:{wkid:4326}};\n  const symbol=(size:number)=>view.type==='3d'?{\n   type:'point-3d',symbolLayers:[{type:'icon',resource:{primitive:'circle'},material:{color:[255,193,7,1]},size:12,\n    outline:{color:'white',size:2},occludedVisibility:{mode:'visible'}}]\n  }:{type:'simple-marker',style:'circle',color:[255,255,0,.8],size,outline:{color:[255,165,0,1],width:3}};\n  // Reposition the existing 3D target without rebuilding its Graphic or display owner.\n  if(this.view===view && view.type==='3d' && this.graphic){\n   this.graphic.geometry=geometry;\n   if(this.minimapGraphic)this.minimapGraphic.geometry=geometry;\n   this.ground?.showMarker(view,image.lon,image.lat,[255,193,7,1],image.id);\n   return;\n  }\n  this.clear();this.view=view;\n  const graphic=this.host.createGraphic({geometry,symbol:symbol(16)});\n  this.graphic=graphic;view.graphics.add(graphic);\n  this.minimap=this.host.getMinimap();\n  if(this.minimap){\n   this.minimapGraphic=this.host.createGraphic({geometry,symbol:{type:'simple-marker',style:'circle',color:[255,255,0,.85],size:12,outline:{color:[255,165,0,1],width:2}}});\n   (this.minimapGraphic as any).__isDirectionHover=true;this.minimap.add(this.minimapGraphic);\n  }\n  if(view.type==='3d'){\n   // ScreenDirectionCone uses rendered terrain, bounded ground projection and settled caching.\n   // Keep a steady native fallback until the overlay has a valid screen anchor.\n   try {\n    this.ground=this.host.createGroundMarker?.(presented=>{if(this.graphic===graphic)graphic.visible=!presented})||null;\n    this.ground?.showMarker(view,image.lon,image.lat,[255,193,7,1],image.id);\n   } catch {this.ground?.clear();this.ground=null;graphic.visible=true;}\n   return;\n  }\n  let growing=true,size=16;\n  this.timer=this.host.setInterval(()=>{\n   if(this.graphic!==graphic)return;\n   size+=growing ? .5 : -.5;if(size>=20)growing=false;if(size<=16)growing=true;\n   graphic.symbol=symbol(size);\n  },60);\n }\n clear(): void {\n  if(this.timer!==null)this.host.clearInterval(this.timer);this.timer=null;\n  this.ground?.clear();this.ground=null;\n  if(this.graphic)this.view?.graphics.remove(this.graphic);\n  if(this.minimapGraphic)this.minimap?.remove(this.minimapGraphic);\n  this.graphic=null;this.minimapGraphic=null;this.minimap=null;this.view=null;\n }\n}\n",
              "after": "/** Ground-aligned navigation target; 3D is steady, 2D retains its existing pulse. */\nexport interface DirectionMarkerGraphic { symbol: any; geometry?: any; visible?: boolean; }\nexport interface DirectionMarkerView<G> {\n type: string;\n graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };\n}\nexport interface DirectionMarkerMinimap<G> {\n graphics: { forEach(callback: (graphic: G) => void): void };\n add(graphic: G): unknown; remove(graphic: G): unknown;\n}\ninterface GroundMarker {\n showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void;\n show?(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void;\n hideCone?(): void;\n clear(): void;\n}\nexport interface DirectionMarkerHost<G> {\n getView(): DirectionMarkerView<G> | null | undefined;\n getMinimap(): DirectionMarkerMinimap<G> | null;\n createGraphic(properties: any): G;\n createGroundMarker?(presented: (visible: boolean) => void): GroundMarker;\n setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;\n clearInterval(handle: ReturnType<typeof setInterval>): void;\n}\nexport class DirectionHoverMarker<G extends DirectionMarkerGraphic> {\n graphic: G | null = null;\n private view: DirectionMarkerView<G> | null = null;\n private minimap: DirectionMarkerMinimap<G> | null = null;\n private minimapGraphic: G | null = null;\n private ground: GroundMarker | null = null;\n private timer: ReturnType<typeof setInterval> | null = null;\n constructor(private readonly host: DirectionMarkerHost<G>) {}\n draw(view: DirectionMarkerView<G>, image: {id: string; lon: number; lat: number; bearing?: number}): void {\n  const geometry={type:'point',longitude:image.lon,latitude:image.lat,spatialReference:{wkid:4326}};\n  const symbol=(size:number)=>view.type==='3d'?{\n   type:'point-3d',symbolLayers:[{type:'icon',resource:{primitive:'circle'},material:{color:[255,193,7,1]},size:12,\n    outline:{color:'white',size:2},occludedVisibility:{mode:'visible'}}]\n  }:{type:'simple-marker',style:'circle',color:[255,255,0,.8],size,outline:{color:[255,165,0,1],width:3}};\n  // Reposition the existing 3D target without rebuilding its Graphic or display owner.\n  if(this.view===view && view.type==='3d' && this.graphic){\n   this.graphic.geometry=geometry;\n   if(this.minimapGraphic)this.minimapGraphic.geometry=geometry;\n   this.showGroundTarget(view,image);\n   return;\n  }\n  this.clear();this.view=view;\n  const graphic=this.host.createGraphic({geometry,symbol:symbol(16)});\n  this.graphic=graphic;view.graphics.add(graphic);\n  this.minimap=this.host.getMinimap();\n  if(this.minimap){\n   this.minimapGraphic=this.host.createGraphic({geometry,symbol:{type:'simple-marker',style:'circle',color:[255,255,0,.85],size:12,outline:{color:[255,165,0,1],width:2}}});\n   (this.minimapGraphic as any).__isDirectionHover=true;this.minimap.add(this.minimapGraphic);\n  }\n  if(view.type==='3d'){\n   // ScreenDirectionCone uses rendered terrain, bounded ground projection and settled caching.\n   // Keep a steady native fallback until the overlay has a valid screen anchor.\n   try {\n    this.ground=this.host.createGroundMarker?.(presented=>{if(this.graphic===graphic)graphic.visible=!presented})||null;\n    this.showGroundTarget(view,image);\n   } catch {this.ground?.clear();this.ground=null;graphic.visible=true;}\n   return;\n  }\n  let growing=true,size=16;\n  this.timer=this.host.setInterval(()=>{\n   if(this.graphic!==graphic)return;\n   size+=growing ? .5 : -.5;if(size>=20)growing=false;if(size<=16)growing=true;\n   graphic.symbol=symbol(size);\n  },60);\n }\n private showGroundTarget(view: DirectionMarkerView<G>, image: {id: string; lon: number; lat: number; bearing?: number}): void {\n  this.ground?.showMarker(view,image.lon,image.lat,[255,193,7,1],image.id);\n  if(Number.isFinite(image.bearing)) this.ground?.show?.(view,image.lon,image.lat,((image.bearing!%360)+360)%360,6,50);\n  else this.ground?.hideCone?.();\n }\n clear(): void {\n  if(this.timer!==null)this.host.clearInterval(this.timer);this.timer=null;\n  this.ground?.clear();this.ground=null;\n  if(this.graphic)this.view?.graphics.remove(this.graphic);\n  if(this.minimapGraphic)this.minimap?.remove(this.minimapGraphic);\n  this.graphic=null;this.minimapGraphic=null;this.minimap=null;this.view=null;\n }\n}\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "tests/directionHoverStable.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady ground target",
              "before": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst m={exports:{}};new Function('exports','module',ts.transpileModule(fs.readFileSync(__dirname+'/../src/features/map-graphics/DirectionHoverMarker.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m);const{DirectionHoverMarker}=m.exports;\nfunction setup(type='3d'){const graphics=[],mini=[],timers=new Map(),calls=[];let cb,clears=0;const view={type,graphics:{add:g=>graphics.push(g),remove:g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)}}},minimap={graphics:{forEach:fn=>mini.forEach(fn)},add:g=>mini.push(g),remove:g=>{const i=mini.indexOf(g);if(i>=0)mini.splice(i,1)}};const host={getView:()=>view,getMinimap:()=>minimap,createGraphic:p=>({...p}),setInterval:fn=>{timers.set(1,fn);return 1},clearInterval:id=>timers.delete(id),createGroundMarker:fn=>{cb=fn;return{showMarker:(...args)=>calls.push(args),clear:()=>clears++}}};return{owner:new DirectionHoverMarker(host),view,graphics,mini,timers,calls,present:v=>cb(v),clears:()=>clears}}\ntest('3D uses one steady ground marker with no lift, callout or timer',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2});const g=x.owner.graphic,s=g.symbol;assert.equal(x.timers.size,0);assert.equal(s.verticalOffset,undefined);assert.equal(s.callout,undefined);x.present(true);assert.equal(g.visible,false);x.owner.draw(x.view,{id:'B',lon:3,lat:4});assert.equal(x.owner.graphic,g);assert.equal(g.symbol,s);assert.equal(x.graphics.length,1);assert.equal(x.mini.length,1);assert.equal(g.geometry.longitude,3);assert.equal(x.calls.length,2);x.present(false);assert.equal(g.visible,true);x.owner.clear();assert.equal(x.graphics.length,0);assert.equal(x.mini.length,0);assert.equal(x.clears(),1)});\ntest('cleanup uses original view and minimap and tolerates repeated clear',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2});const other={type:'3d',graphics:{add(){},remove(){throw Error('wrong view')}}};x.owner.host.getView=()=>other;x.owner.clear();x.owner.clear();assert.equal(x.graphics.length,0);assert.equal(x.mini.length,0)});\ntest('2D retains its original bounded pulse and cancels it on cleanup',()=>{const x=setup('2d');x.owner.draw(x.view,{id:'A',lon:1,lat:2});assert.equal(x.timers.size,1);assert.equal(x.calls.length,0);for(let i=0;i<100;i++){x.timers.get(1)();assert(x.owner.graphic.symbol.size>=16&&x.owner.graphic.symbol.size<=20)}x.owner.clear();assert.equal(x.timers.size,0)});\n",
              "after": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst m={exports:{}};new Function('exports','module',ts.transpileModule(fs.readFileSync(__dirname+'/../src/features/map-graphics/DirectionHoverMarker.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m);const{DirectionHoverMarker}=m.exports;\nfunction setup(type='3d'){const graphics=[],mini=[],timers=new Map(),calls=[];let cb,clears=0;const view={type,graphics:{add:g=>graphics.push(g),remove:g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)}}},minimap={graphics:{forEach:fn=>mini.forEach(fn)},add:g=>mini.push(g),remove:g=>{const i=mini.indexOf(g);if(i>=0)mini.splice(i,1)}};const host={getView:()=>view,getMinimap:()=>minimap,createGraphic:p=>({...p}),setInterval:fn=>{timers.set(1,fn);return 1},clearInterval:id=>timers.delete(id),createGroundMarker:fn=>{cb=fn;return{showMarker:(...args)=>calls.push(args),show:(...args)=>calls.push(['cone',...args]),hideCone:()=>calls.push(['hide-cone']),clear:()=>clears++}}};return{owner:new DirectionHoverMarker(host),view,graphics,mini,timers,calls,present:v=>cb(v),clears:()=>clears}}\ntest('3D uses one steady ground marker with no lift, callout or timer',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2});const g=x.owner.graphic,s=g.symbol;assert.equal(x.timers.size,0);assert.equal(s.verticalOffset,undefined);assert.equal(s.callout,undefined);x.present(true);assert.equal(g.visible,false);x.owner.draw(x.view,{id:'B',lon:3,lat:4});assert.equal(x.owner.graphic,g);assert.equal(g.symbol,s);assert.equal(x.graphics.length,1);assert.equal(x.mini.length,1);assert.equal(g.geometry.longitude,3);assert.equal(x.calls.filter(args=>args[0]===x.view).length,2);x.present(false);assert.equal(g.visible,true);x.owner.clear();assert.equal(x.graphics.length,0);assert.equal(x.mini.length,0);assert.equal(x.clears(),1)});\ntest('cleanup uses original view and minimap and tolerates repeated clear',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2});const other={type:'3d',graphics:{add(){},remove(){throw Error('wrong view')}}};x.owner.host.getView=()=>other;x.owner.clear();x.owner.clear();assert.equal(x.graphics.length,0);assert.equal(x.mini.length,0)});\ntest('2D retains its original bounded pulse and cancels it on cleanup',()=>{const x=setup('2d');x.owner.draw(x.view,{id:'A',lon:1,lat:2});assert.equal(x.timers.size,1);assert.equal(x.calls.length,0);for(let i=0;i<100;i++){x.timers.get(1)();assert(x.owner.graphic.symbol.size>=16&&x.owner.graphic.symbol.size<=20)}x.owner.clear();assert.equal(x.timers.size,0)});\n\ntest('3D target bearing adds a bounded ground cone without replacing graphic or starting pulse',()=>{const x=setup();x.owner.draw(x.view,{id:'A',lon:1,lat:2,bearing:370});const graphic=x.owner.graphic,cone=x.calls.find(args=>args[0]==='cone');assert.deepEqual(cone,['cone',x.view,1,2,10,6,50]);assert.equal(x.timers.size,0);x.owner.draw(x.view,{id:'A',lon:1,lat:2});assert.equal(x.owner.graphic,graphic);assert.deepEqual(x.calls.at(-1),['hide-cone']);x.owner.clear()});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "tests/directionHoverAnchor.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady ground target",
              "before": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(__dirname+'/../src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['resolveDirectionHoverAnchor','clearDirectionHighlight'];const code=ts.transpileModule('class Runtime{'+names.map(name=>cls.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n')+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction setup({warm=true,match=true}={}){const calls=[],draws=[],anchors=new Map(),view={type:'3d'},context={view,layer:{},revision:1,enabled:true,individual:true},buffer=new ArrayBuffer(1);let downloads=0;const Runtime=new Function('ZOOM','nativeImageAnchor','VectorTile','Pbf',code+';return Runtime')({TILE_FETCH:14},(b,i,decode,tile,id)=>{calls.push(id);return match?{longitude:5,latitude:6}:null},class{},class{}),w=new Runtime();w.state={jimuMapView:{view}};w.accessToken='token';w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};w.coverageSelectionContext=()=>context;w._coverageSelectionTargets={anchor:(c,id)=>anchors.get(id),retain:(c,id,g)=>anchors.set(id,g)};w.getCoverageDisplayPosition=(id,lon,lat)=>anchors.has(id)?{lon:anchors.get(id).longitude,lat:anchors.get(id).latitude}:{lon,lat};w._turboTileCache={snapshot:()=>[],get:()=>warm?buffer:undefined};w._sequenceTileIndex={has:()=>true};w.getSequenceTileIndex=async()=>({});w.runSequenceBackground=(fn,signal)=>fn(signal);w.getTurboTileBuffer=async()=>{downloads++;return buffer};w.ensureDirectionHoverMarker=()=>({draw:(v,img)=>draws.push(img)});w.log=()=>{};return{w,view,context,calls,draws,anchors,buffer,downloads:()=>downloads}}\ntest('exact hovered ID uses cached tile anchor instead of raw API coordinates, then reuses retained anchor',async()=>{const x=setup();await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.calls,['A']);assert.deepEqual(x.draws,[{id:'A',lon:5,lat:6}]);assert.equal(x.downloads(),0);await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(x.calls.length,1)});\ntest('unmatched exact ID preserves source position and never picks a nearby image',async()=>{const x=setup({match:false});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.calls,['A']);assert.deepEqual(x.draws,[{id:'A',lon:1,lat:2}]);assert.equal(x.anchors.size,0)});\ntest('cold target makes one shared tile request',async()=>{const x=setup({warm:false});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(x.downloads(),1);assert.equal(x.draws[0].lon,5)});\ntest('leaving hover aborts pending work and late response cannot recreate marker',async()=>{const x=setup({warm:false});let release;x.w.getTurboTileBuffer=()=>new Promise(resolve=>release=resolve);const pending=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});const controller=x.w._directionAnchorAbort;x.w.clearDirectionHighlight();release(x.buffer);await pending;assert(controller.signal.aborted);assert.equal(x.draws.length,0);assert.equal(x.anchors.size,0)});\ntest('new target cancels old result; revision change suppresses stale marker',async()=>{const x=setup({warm:false});let release;x.w.getTurboTileBuffer=()=>new Promise(resolve=>release=resolve);const old=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});x.w._turboTileCache.get=()=>x.buffer;await x.w.resolveDirectionHoverAnchor(x.view,{id:'B',lon:1,lat:2});release(x.buffer);await old;assert.deepEqual(x.draws.map(p=>p.id),['B']);x.w.getSequenceTileIndex=async()=>{x.context.revision++;return{}};await x.w.resolveDirectionHoverAnchor(x.view,{id:'C',lon:1,lat:2});assert.equal(x.draws.length,1)});\n",
              "after": "const fs=require('fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(__dirname+'/../src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['resolveDirectionHoverAnchor','clearDirectionHighlight'];const code=ts.transpileModule('class Runtime{'+names.map(name=>cls.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n')+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction setup({warm=true,match=true}={}){const calls=[],draws=[],anchors=new Map(),view={type:'3d'},context={view,layer:{},revision:1,enabled:true,individual:true},buffer=new ArrayBuffer(1);let downloads=0;const Runtime=new Function('ZOOM','nativeImageAnchor','VectorTile','Pbf','const GRAPH_API={BASE:\"https://example.com\"};'+code+';return Runtime')({TILE_FETCH:14},(b,i,decode,tile,id)=>{calls.push(id);return match?{longitude:5,latitude:6}:null},class{},class{}),w=new Runtime();w.state={jimuMapView:{view}};w.accessToken='token';w._directionBearings=new Map();w.fetchMapillaryJson=async()=>({is_pano:true});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};w.coverageSelectionContext=()=>context;w._coverageSelectionTargets={anchor:(c,id)=>anchors.get(id),retain:(c,id,g)=>anchors.set(id,g)};w.getCoverageDisplayPosition=(id,lon,lat)=>anchors.has(id)?{lon:anchors.get(id).longitude,lat:anchors.get(id).latitude}:{lon,lat};w._turboTileCache={snapshot:()=>[],get:()=>warm?buffer:undefined};w._sequenceTileIndex={has:()=>true};w.getSequenceTileIndex=async()=>({});w.runSequenceBackground=(fn,signal)=>fn(signal);w.getTurboTileBuffer=async()=>{downloads++;return buffer};w.ensureDirectionHoverMarker=()=>({draw:(v,img)=>draws.push(img)});w.log=()=>{};return{w,view,context,calls,draws,anchors,buffer,downloads:()=>downloads}}\ntest('exact hovered ID uses cached tile anchor instead of raw API coordinates, then reuses retained anchor',async()=>{const x=setup();await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.calls,['A']);assert.deepEqual(x.draws,[{id:'A',lon:5,lat:6}]);assert.equal(x.downloads(),0);await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(x.calls.length,1)});\ntest('unmatched exact ID preserves source position and never picks a nearby image',async()=>{const x=setup({match:false});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.calls,['A']);assert.deepEqual(x.draws,[{id:'A',lon:1,lat:2}]);assert.equal(x.anchors.size,0)});\ntest('cold target makes one shared tile request',async()=>{const x=setup({warm:false});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(x.downloads(),1);assert.equal(x.draws[0].lon,5)});\ntest('leaving hover aborts pending work and late response cannot recreate marker',async()=>{const x=setup({warm:false});let release;x.w.getTurboTileBuffer=()=>new Promise(resolve=>release=resolve);const pending=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});const controller=x.w._directionAnchorAbort;x.w.clearDirectionHighlight();release(x.buffer);await pending;assert(controller.signal.aborted);assert.equal(x.draws.length,0);assert.equal(x.anchors.size,0)});\ntest('new target cancels old result; revision change suppresses stale marker',async()=>{const x=setup({warm:false});let release;x.w.getTurboTileBuffer=()=>new Promise(resolve=>release=resolve);const old=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});x.w._turboTileCache.get=()=>x.buffer;await x.w.resolveDirectionHoverAnchor(x.view,{id:'B',lon:1,lat:2});release(x.buffer);await old;assert.deepEqual(x.draws.map(p=>p.id),['B']);x.w.getSequenceTileIndex=async()=>{x.context.revision++;return{}};await x.w.resolveDirectionHoverAnchor(x.view,{id:'C',lon:1,lat:2});assert.equal(x.draws.length,1)});\n\ntest('bearing enrichment preserves aligned position and reuses cached metadata',async()=>{const x=setup();let queries=0;x.w.fetchMapillaryJson=async()=>{queries++;return{computed_compass_angle:0,compass_angle:120,is_pano:false}};await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.deepEqual(x.draws.at(-1),{id:'A',lon:5,lat:6,bearing:0});await x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});assert.equal(queries,1)});\ntest('late bearing cannot revive a cleared target',async()=>{const x=setup();let release;x.w.fetchMapillaryJson=()=>new Promise(resolve=>release=resolve);const work=x.w.resolveDirectionHoverAnchor(x.view,{id:'A',lon:1,lat:2});while(!release)await new Promise(r=>setImmediate(r));x.w.clearDirectionHighlight();release({computed_compass_angle:30});await work;assert.equal(x.draws.length,1);assert.equal(x.w._directionBearings.size,0)});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/DIRECTION-HOVER-BEARING.md",
      "content": "# v6.95: 3D navigation-target bearing cone\n\nRequires v6.94. Run `node apply-direction-hover-bearing-v6-95.cjs`, rebuild and reload.\n\n3D viewer-arrow hover shows a steady amber target and a smaller orange direction sector at the same exact coverage anchor. The sector uses computed_compass_angle, falling back to compass_angle. It shows the image capture heading, not the direction of travel from the current image. Missing bearings and panoramas keep a disk only.\n\nThe disk is drawn as soon as anchor resolution completes. One cancellable background metadata request enriches the hovered image's bearing. Up to 64 results are cached by image and token. Hover changes, mouseout and view/context changes suppress late results. The existing marker-only overlay now draws its sector too, sharing its element, projection cache and tracking loop. No pulse or second rendering loop is created. 2D rendering remains unchanged.\n\nSDK build and 11 marker/anchor tests pass. Check the appearance and bearing in the user's scene after rebuilding. No frame-rate benchmark is claimed.\n\nRollback: `node apply-direction-hover-bearing-v6-95.cjs --uninstall`, rebuild and reload.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'direction-hover-bearing-v6-95-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.95 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'direction-hover-bearing-v6-95' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.95 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.95 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.95 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-direction-hover-bearing-v6-95.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Direction hover bearing cone v6.95 is already installed. No files changed.');
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
  const manifest = { installer: 'direction-hover-bearing-v6-95', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Direction hover bearing cone v6.95 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
