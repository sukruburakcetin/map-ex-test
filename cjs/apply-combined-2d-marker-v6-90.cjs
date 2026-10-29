#!/usr/bin/env node
'use strict';
/**
 * Combined 2D current-image marker v6.90. Compatible current v6 sources.
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
              "before": "  private drawPulsingPoint(lon: number, lat: number, baseColor: any = [0, 255, 0, 1], imageId = this.state.imageId) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;\n    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);\n    const graphic = this.ensureSelectionPulseOwner().show(view, anchor, lon, lat, baseColor, imageId);\n    if (view.type === '3d') {\n      try { this.ensureScreenDirectionCone()?.showMarker(view, anchor.lon, anchor.lat, baseColor, String(imageId)); }\n      catch (error) { console.warn('[Mapillary] Combined marker unavailable; using native marker', error); }\n    }\n    if (this.state.turboModeActive && imageId) void this.resolveNativeImageAnchor(String(imageId), lon, lat);\n",
              "after": "  private drawPulsingPoint(lon: number, lat: number, baseColor: any = [0, 255, 0, 1], imageId = this.state.imageId) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;\n    const anchor = this.getCoverageDisplayPosition(String(imageId), lon, lat);\n    const graphic = this.ensureSelectionPulseOwner().show(view, anchor, lon, lat, baseColor, imageId, false);\n    {\n      try { this.ensureScreenDirectionCone()?.showMarker(view, anchor.lon, anchor.lat, baseColor, String(imageId)); }\n      catch (error) { console.warn('[Mapillary] Combined marker unavailable; using native marker', error); }\n    }\n    if (this.state.turboModeActive && imageId) void this.resolveNativeImageAnchor(String(imageId), lon, lat);\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "    return this._screenDirectionCone ??= new ScreenDirectionCone(\n      properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),\n      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },\n      (presented, view) => {\n        if (view?.type === '3d' && this._selectionPulse?.view === view && this._selectionPulse.layer) {\n          const visible = !presented;\n          if (this._selectionPulse.layer.visible !== visible) this._selectionPulse.layer.visible = visible;\n        }\n      });\n",
              "after": "    return this._screenDirectionCone ??= new ScreenDirectionCone(\n      properties => new this.ArcGISModules.Point(properties), () => document.createElement('div'),\n      { request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame) },\n      (presented, view) => {\n        if (this._selectionPulse?.view === view && this._selectionPulse.layer) {\n          const visible = !presented;\n          if (this._selectionPulse.layer.visible !== visible) this._selectionPulse.layer.visible = visible;\n        }\n      });\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/SelectionPulse.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup src/features/map-graphics/SelectionPulse.ts",
              "before": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\nexport interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }\nexport interface PulseView<G, L> {\n type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;\n map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n graphics: { remove(graphic: G): unknown };\n toScreen(geometry: any): { x: number; y: number } | null | undefined;\n updating?: boolean;\n stationary?: boolean;\n groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;\n   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;\n}\nexport interface PulseFactories<G, L> {\n point(properties: any): any;\n layer(properties: any): L;\n graphic(properties: any): G;\n overlay(): HTMLDivElement | null;\n}\n\n/** Project only rendered terrain; an explicitly empty Ground is the flat z=0 plane. */\nexport function renderedGroundPoint(view: any, geometry: any, createPoint: (properties: any) => any): any | null {\n try {\n  const sampler = view.groundView?.elevationSampler, ground = sampler?.queryElevation(geometry);\n  if (ground && Number.isFinite(ground.z) && ground.z !== sampler?.noDataValue) return ground;\n  if (view.map?.ground?.layers?.length !== 0) return null;\n  const xy = Number.isFinite(geometry.x) && Number.isFinite(geometry.y)\n   ? { x: geometry.x, y: geometry.y } : { longitude: geometry.longitude, latitude: geometry.latitude };\n  return createPoint({ ...xy, z: 0, spatialReference: geometry.spatialReference });\n } catch { return null; }\n}\n\nexport class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {\n  this.bindings = bindings; this.factories = factories; this.clock = clock;\n }\n\n /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.\n  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original\n  * 1200 ms 2D pulse, screen projection and symbol fallback; 3D uses a steady 12 pt icon.\n  */\n show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null): G {\n    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n    // Keep the geometry anchor independent from coverage rendering.\n    const layer = this.factories.layer({\n      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 12,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // Stable 3D baseline validated during diagnostics: no animation or symbol swaps.\n    if (view.type === '3d') return graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n    const host = view.container as HTMLElement;\n    if (view.type !== \"3d\" && host && typeof host.appendChild === \"function\") {\n      const overlay = this.factories.overlay();\n      if (overlay) {\n      overlay.setAttribute(\"aria-hidden\", \"true\");\n      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));\n      host.appendChild(overlay); this.overlay = overlay;\n      layer.visible = false;\n      }\n    }\n    const started = this.clock.now();\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;\n        overlay.style.display = visible ? \"block\" : \"none\";\n        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        symbol.size = size;\n      }\n      (graphic as any)._pulseFrame = this.clock.request(animate);\n    };\n    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.\n      if (this.layer) this.layer.remove(this.bindings.graphic);\n      else this.view?.graphics?.remove(this.bindings.graphic);\n      this.bindings.graphic = null;\n    }\n    if (this.layer) {\n      this.view?.map?.remove(this.layer);\n      this.layer.destroy();\n    }\n    this.layer = null; this.view = null;\n  }\n}\n\n",
              "after": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\nexport interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }\nexport interface PulseView<G, L> {\n type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;\n map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n graphics: { remove(graphic: G): unknown };\n toScreen(geometry: any): { x: number; y: number } | null | undefined;\n updating?: boolean;\n stationary?: boolean;\n groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;\n   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;\n}\nexport interface PulseFactories<G, L> {\n point(properties: any): any;\n layer(properties: any): L;\n graphic(properties: any): G;\n overlay(): HTMLDivElement | null;\n}\n\n/** Project only rendered terrain; an explicitly empty Ground is the flat z=0 plane. */\nexport function renderedGroundPoint(view: any, geometry: any, createPoint: (properties: any) => any): any | null {\n try {\n  const sampler = view.groundView?.elevationSampler, ground = sampler?.queryElevation(geometry);\n  if (ground && Number.isFinite(ground.z) && ground.z !== sampler?.noDataValue) return ground;\n  if (view.map?.ground?.layers?.length !== 0) return null;\n  const xy = Number.isFinite(geometry.x) && Number.isFinite(geometry.y)\n   ? { x: geometry.x, y: geometry.y } : { longitude: geometry.longitude, latitude: geometry.latitude };\n  return createPoint({ ...xy, z: 0, spatialReference: geometry.spatialReference });\n } catch { return null; }\n}\n\nexport class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {\n  this.bindings = bindings; this.factories = factories; this.clock = clock;\n }\n\n /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.\n  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original\n  * 1200 ms 2D pulse, screen projection and symbol fallback; 3D uses a steady 12 pt icon.\n  */\n show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null, animate2D = true): G {\n    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n    // Keep the geometry anchor independent from coverage rendering.\n    const layer = this.factories.layer({\n      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 12,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // Stable 3D baseline validated during diagnostics: no animation or symbol swaps.\n    if (view.type === '3d' || !animate2D) return graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n    const host = view.container as HTMLElement;\n    if (view.type !== \"3d\" && host && typeof host.appendChild === \"function\") {\n      const overlay = this.factories.overlay();\n      if (overlay) {\n      overlay.setAttribute(\"aria-hidden\", \"true\");\n      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));\n      host.appendChild(overlay); this.overlay = overlay;\n      layer.visible = false;\n      }\n    }\n    const started = this.clock.now();\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;\n        overlay.style.display = visible ? \"block\" : \"none\";\n        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        symbol.size = size;\n      }\n      (graphic as any)._pulseFrame = this.clock.request(animate);\n    };\n    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.\n      if (this.layer) this.layer.remove(this.bindings.graphic);\n      else this.view?.graphics?.remove(this.bindings.graphic);\n      this.bindings.graphic = null;\n    }\n    if (this.layer) {\n      this.view?.map?.remove(this.layer);\n      this.layer.destroy();\n    }\n    this.layer = null; this.view = null;\n  }\n}\n\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "tests/screenDirectionCone.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup tests/screenDirectionCone.test.cjs",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),{ScreenDirectionCone,groundFanMatrix}=load('ScreenDirectionCone.ts',()=>pulse);\nfunction setup(){let frame,requests=0,cancels=0,removed=0,projections=0;const elements=[],parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},host={style:{position:''},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300}),ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){}},view={type:'3d',zoom:14.1,width:300,height:300,stationary:true,updating:false,rotation:0,camera:{heading:0},container:host,map:{ground:{layers:[]}},toScreen:p=>(projections++,{x:150+p.longitude,y:150-p.latitude})};const cone=new ScreenDirectionCone(p=>({...p}),()=>{const part=()=>({style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]}}),fan=part(),marker=part();const element={fan,marker,querySelector:selector=>selector==='[data-direction-fan]'?fan:marker,offsetParent:parent,style:{},setAttribute(){},remove(){removed++},innerHTML:'',firstChild:null};elements.push(element);return element},{request:cb=>(frame=cb,++requests),cancel:()=>cancels++});return{cone,view,elements,tick:t=>frame(t),stats:()=>({requests,cancels,removed,projections})}}\ntest('fan keeps pixel dimensions at zoom 14.1, 12.6 and full overview, with no animation',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);const el=x.elements[0],svg=el.innerHTML;assert.equal(el.style.width,'120px');assert.equal(el.style.display,'block');assert(svg.includes('A9 9'));assert(!svg.includes('<animate'));assert.equal(el.fan.getAttribute('transform'),'translate(60 60) matrix(1,0,0,1,0,0) translate(-60 -60)');assert.equal(el.style.transform,'translate(-50%, -50%)');let time=40;for(const zoom of[12.6,0]){x.view.zoom=zoom;x.tick(time);time+=40;assert.equal(el.innerHTML,svg);assert.equal(el.style.display,'block')}assert.equal(x.view.container.style.position,'');x.cone.clear()});\ntest('idle projection is cached; updates preserve element and cleanup cancels tracker',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.stats().projections,3);x.tick(40);assert.equal(x.stats().projections,3);x.cone.show(x.view,0,0,90,5,60);x.tick(80);assert.equal(x.elements.length,1);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(0,1,-1,0,0,0)'));x.cone.clear();assert.equal(x.stats().cancels,1);assert.equal(x.stats().removed,1);const n=x.stats().requests;x.tick(120);assert.equal(x.stats().requests,n)});\ntest('unknown near terrain hides fan, but overview still projects on globe surface',()=>{const x=setup();x.view.map.ground.layers=[{}];x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');x.view.zoom=0;x.tick(40);assert.equal(x.elements[0].style.display,'block');x.cone.clear()});\ntest('offscreen anchor hides fan and style is pointer transparent',()=>{const x=setup();x.cone.show(x.view,1000,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');assert.equal(x.elements[0].style.pointerEvents,'none');x.cone.clear()});\n\ntest('all four actual viewer zoom steps lengthen while narrowing, reusing one element and tracker',()=>{const x=setup(),radii=[];for(const [length,spread]of[[10,60],[15,40],[20,30],[30,20]]){x.cone.show(x.view,0,0,0,length,spread);const svg=x.elements[0].innerHTML,radius=Number(svg.match(/ A([0-9.]+) /)[1]);radii.push(radius);assert(radius<=52);assert(svg.includes('viewBox=\"0 0 120 120\"'))}assert.equal(radii[0],32);for(let i=1;i<radii.length;i++)assert(radii[i]>radii[i-1]);assert.equal(radii[3],52);assert.equal(x.elements.length,1);assert.equal(x.stats().requests,1);x.cone.show(x.view,0,0,0,1000,20);assert.equal(Number(x.elements[0].innerHTML.match(/ A([0-9.]+) /)[1]),52);x.cone.clear()});\n\ntest('3D fan follows ground foreshortening instead of remaining a camera-facing sector',()=>{assert.equal(groundFanMatrix({x:0,y:-1},{x:1,y:0}),'matrix(1,0,0,1,0,0)');assert.equal(groundFanMatrix({x:0,y:-.25},{x:1,y:0}),'matrix(1,0,0,0.25,0,0)');assert.equal(groundFanMatrix({x:NaN,y:0},{x:1,y:0}),null);assert.equal(groundFanMatrix({x:0,y:0},{x:0,y:0}),null);const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));x.cone.clear()});\ntest('oblique ground projection cannot stretch the fan beyond its requested radius',()=>{const matrix=groundFanMatrix({x:2,y:-.1},{x:2,y:.1}),[a,b,c,d]=matrix.slice(7,-1).split(',').map(Number);for(let i=0;i<360;i++){const x=Math.cos(i*Math.PI/180),y=Math.sin(i*Math.PI/180);assert(Math.hypot(a*x+c*y,b*x+d*y)<=1.000002)}});\ntest('2D keeps the screen-facing fan without ground tilt',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('rotate(0)'));x.cone.clear()});\n\ntest('combined circle and fan share one anchor and the same ground-plane transform',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);const el=x.elements[0];assert.equal(x.elements.length,1);assert(el.innerHTML.includes('data-current-image-marker'));assert(el.innerHTML.includes('r=\"7\"'));assert(el.innerHTML.includes('stroke=\"#ffffff\"'));assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('fill'),'rgb(0,255,0)');assert(el.fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.marker.getAttribute('transform'),el.fan.getAttribute('transform'));assert.equal(el.style.transform,'translate(-50%, -50%)');x.cone.hideCone();assert.equal(el.fan.style.display,'none');assert.equal(el.marker.style.display,'');assert.equal(x.stats().removed,0);x.cone.hideMarker();assert.equal(x.stats().removed,1);assert.equal(x.stats().cancels,1)});\ntest('new image updates anchor without duplicating component and clears stale fan',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);x.cone.showMarker(x.view,1,2,[0,255,0,1],'B');x.tick(40);assert.equal(x.elements.length,1);assert.equal(x.elements[0].style.left,'151px');assert.equal(x.elements[0].fan.style.display,'none');x.cone.clear()});\ntest('cone-only 2D use does not draw a second current-image circle',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert.equal(x.elements[0].marker.style.display,'none');x.cone.clear()});\ntest('native fallback is enabled whenever combined marker cannot be presented',()=>{const x=setup(),states=[];x.cone.onMarkerPresented=(visible,view)=>states.push(visible);x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);assert.equal(states.at(-1),true);const project=x.view.toScreen;x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.view.toScreen=project;x.tick(80);assert.equal(states.at(-1),true);x.cone.clear()});\n\ntest('marker-only display remains ground-oriented after hiding the cone',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);const el=x.elements[0];assert(el.marker.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.fan.style.display,'none');x.cone.show(x.view,0,0,0,10,60);x.tick(40);x.cone.hideCone();x.tick(80);assert.equal(el.marker.getAttribute('transform'),el.fan.getAttribute('transform'));assert.equal(el.marker.style.display,'');x.cone.clear()});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');function load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(req,m,m.exports);return m.exports}const pulse=load('SelectionPulse.ts',()=>({selectionPulseOverlayStyle:()=>({})})),{ScreenDirectionCone,groundFanMatrix}=load('ScreenDirectionCone.ts',()=>pulse);\nfunction setup(){let frame,requests=0,cancels=0,removed=0,projections=0;const elements=[],parent={offsetWidth:300,offsetHeight:300,clientLeft:0,clientTop:0,scrollLeft:0,scrollTop:0,getBoundingClientRect:()=>({left:0,top:0,width:300,height:300})},host={style:{position:''},getBoundingClientRect:()=>({left:0,top:0,width:300,height:300}),ownerDocument:{visibilityState:'visible',defaultView:{scrollX:0,scrollY:0,getComputedStyle:()=>({position:'relative'})}},appendChild(){}},view={type:'3d',zoom:14.1,width:300,height:300,stationary:true,updating:false,rotation:0,camera:{heading:0},container:host,map:{ground:{layers:[]}},toScreen:p=>(projections++,{x:150+p.longitude,y:150-p.latitude})};const cone=new ScreenDirectionCone(p=>({...p}),()=>{const part=()=>({style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]}}),fan=part(),marker=part();const element={fan,marker,querySelector:selector=>selector==='[data-direction-fan]'?fan:marker,offsetParent:parent,style:{},setAttribute(){},remove(){removed++},innerHTML:'',firstChild:null};elements.push(element);return element},{request:cb=>(frame=cb,++requests),cancel:()=>cancels++});return{cone,view,elements,tick:t=>frame(t),stats:()=>({requests,cancels,removed,projections})}}\ntest('fan keeps pixel dimensions at zoom 14.1, 12.6 and full overview, with no animation',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);const el=x.elements[0],svg=el.innerHTML;assert.equal(el.style.width,'120px');assert.equal(el.style.display,'block');assert(svg.includes('A9 9'));assert(!svg.includes('<animate'));assert.equal(el.fan.getAttribute('transform'),'translate(60 60) matrix(1,0,0,1,0,0) translate(-60 -60)');assert.equal(el.style.transform,'translate(-50%, -50%)');let time=40;for(const zoom of[12.6,0]){x.view.zoom=zoom;x.tick(time);time+=40;assert.equal(el.innerHTML,svg);assert.equal(el.style.display,'block')}assert.equal(x.view.container.style.position,'');x.cone.clear()});\ntest('idle projection is cached; updates preserve element and cleanup cancels tracker',()=>{const x=setup();x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.stats().projections,3);x.tick(40);assert.equal(x.stats().projections,3);x.cone.show(x.view,0,0,90,5,60);x.tick(80);assert.equal(x.elements.length,1);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(0,1,-1,0,0,0)'));x.cone.clear();assert.equal(x.stats().cancels,1);assert.equal(x.stats().removed,1);const n=x.stats().requests;x.tick(120);assert.equal(x.stats().requests,n)});\ntest('unknown near terrain hides fan, but overview still projects on globe surface',()=>{const x=setup();x.view.map.ground.layers=[{}];x.cone.show(x.view,0,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');x.view.zoom=0;x.tick(40);assert.equal(x.elements[0].style.display,'block');x.cone.clear()});\ntest('offscreen anchor hides fan and style is pointer transparent',()=>{const x=setup();x.cone.show(x.view,1000,0,0,5,60);x.tick(0);assert.equal(x.elements[0].style.display,'none');assert.equal(x.elements[0].style.pointerEvents,'none');x.cone.clear()});\n\ntest('all four actual viewer zoom steps lengthen while narrowing, reusing one element and tracker',()=>{const x=setup(),radii=[];for(const [length,spread]of[[10,60],[15,40],[20,30],[30,20]]){x.cone.show(x.view,0,0,0,length,spread);const svg=x.elements[0].innerHTML,radius=Number(svg.match(/ A([0-9.]+) /)[1]);radii.push(radius);assert(radius<=52);assert(svg.includes('viewBox=\"0 0 120 120\"'))}assert.equal(radii[0],32);for(let i=1;i<radii.length;i++)assert(radii[i]>radii[i-1]);assert.equal(radii[3],52);assert.equal(x.elements.length,1);assert.equal(x.stats().requests,1);x.cone.show(x.view,0,0,0,1000,20);assert.equal(Number(x.elements[0].innerHTML.match(/ A([0-9.]+) /)[1]),52);x.cone.clear()});\n\ntest('3D fan follows ground foreshortening instead of remaining a camera-facing sector',()=>{assert.equal(groundFanMatrix({x:0,y:-1},{x:1,y:0}),'matrix(1,0,0,1,0,0)');assert.equal(groundFanMatrix({x:0,y:-.25},{x:1,y:0}),'matrix(1,0,0,0.25,0,0)');assert.equal(groundFanMatrix({x:NaN,y:0},{x:1,y:0}),null);assert.equal(groundFanMatrix({x:0,y:0},{x:0,y:0}),null);const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));x.cone.clear()});\ntest('oblique ground projection cannot stretch the fan beyond its requested radius',()=>{const matrix=groundFanMatrix({x:2,y:-.1},{x:2,y:.1}),[a,b,c,d]=matrix.slice(7,-1).split(',').map(Number);for(let i=0;i<360;i++){const x=Math.cos(i*Math.PI/180),y=Math.sin(i*Math.PI/180);assert(Math.hypot(a*x+c*y,b*x+d*y)<=1.000002)}});\ntest('2D keeps the screen-facing fan without ground tilt',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert(x.elements[0].fan.getAttribute('transform').includes('rotate(0)'));x.cone.clear()});\n\ntest('combined circle and fan share one anchor and the same ground-plane transform',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);const el=x.elements[0];assert.equal(x.elements.length,1);assert(el.innerHTML.includes('data-current-image-marker'));assert(el.innerHTML.includes('r=\"7\"'));assert(el.innerHTML.includes('stroke=\"#ffffff\"'));assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('fill'),'rgb(0,255,0)');assert(el.fan.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.marker.getAttribute('transform'),el.fan.getAttribute('transform'));assert.equal(el.style.transform,'translate(-50%, -50%)');x.cone.hideCone();assert.equal(el.fan.style.display,'none');assert.equal(el.marker.style.display,'');assert.equal(x.stats().removed,0);x.cone.hideMarker();assert.equal(x.stats().removed,1);assert.equal(x.stats().cancels,1)});\ntest('new image updates anchor without duplicating component and clears stale fan',()=>{const x=setup();x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.cone.show(x.view,0,0,0,10,60);x.tick(0);x.cone.showMarker(x.view,1,2,[0,255,0,1],'B');x.tick(40);assert.equal(x.elements.length,1);assert.equal(x.elements[0].style.left,'151px');assert.equal(x.elements[0].fan.style.display,'none');x.cone.clear()});\ntest('cone-only 2D use does not draw a second current-image circle',()=>{const x=setup();x.view.type='2d';x.cone.show(x.view,0,0,0,10,60);x.tick(0);assert.equal(x.elements[0].marker.style.display,'none');x.cone.clear()});\ntest('native fallback is enabled whenever combined marker cannot be presented',()=>{const x=setup(),states=[];x.cone.onMarkerPresented=(visible,view)=>states.push(visible);x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);assert.equal(states.at(-1),true);const project=x.view.toScreen;x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.view.toScreen=project;x.tick(80);assert.equal(states.at(-1),true);x.cone.clear()});\n\ntest('marker-only display remains ground-oriented after hiding the cone',()=>{const x=setup();x.view.toScreen=p=>({x:150+p.longitude,y:150-p.latitude*.25});x.cone.showMarker(x.view,0,0,[0,255,0,1],'A');x.tick(0);const el=x.elements[0];assert(el.marker.getAttribute('transform').includes('matrix(1,0,0,0.25,0,0)'));assert.equal(el.fan.style.display,'none');x.cone.show(x.view,0,0,0,10,60);x.tick(40);x.cone.hideCone();x.tick(80);assert.equal(el.marker.getAttribute('transform'),el.fan.getAttribute('transform'));assert.equal(el.marker.style.display,'');x.cone.clear()});\n\ntest('2D combined marker stays round, shares fan anchor and restores fallback on projection failure',()=>{const x=setup(),states=[];x.view.type='2d';x.cone.onMarkerPresented=(shown)=>states.push(shown);x.cone.showMarker(x.view,1,2,[0,255,0,1],'A');x.cone.show(x.view,1,2,90,10,60);x.tick(0);const el=x.elements[0];assert.equal(el.marker.style.display,'');assert.equal(el.marker.getAttribute('transform'),'');assert.equal(el.style.left,'151px');assert.equal(el.style.top,'148px');assert.equal(states.at(-1),true);x.view.toScreen=()=>null;x.view.updating=true;x.tick(40);assert.equal(states.at(-1),false);x.cone.clear();assert.equal(x.stats().cancels,1)});\ntest('steady selection placeholder starts no animation or overlay in 2D',()=>{let requests=0,overlays=0;const bindings={graphic:null},layer={visible:true,add(){},remove(){},destroy(){}},owner=new pulse.SelectionPulse(bindings,{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>{overlays++;return null}},{request:()=>++requests,cancel(){},now:()=>0,clearInterval(){}}),view={type:'2d',map:{add(){},remove(){}},graphics:{remove(){}}};const graphic=owner.show(view,{},1,2,[0,255,0,1],'A',false);assert.equal(requests,0);assert.equal(overlays,0);assert.equal(graphic.attributes.image_id,'A');assert.equal(owner.show(view,{},3,4,[0,255,0,1],'A',false),graphic);assert.equal(requests,0);owner.dispose();assert.equal(bindings.graphic,null)});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/COMBINED-2D-CURRENT-IMAGE.md",
      "content": "# v6.90: Combined 2D current-image marker\n\nRequires v6.89. Install with `node apply-combined-2d-marker-v6-90.cjs`, rebuild and reload.\n\n2D uses the v6.87 SVG circle and direction sector, with a green center and white rim. There is no pulsing overlay or symbol animation. The existing native selection Graphic remains as a steady fallback and retains image identity. The SVG tracker reuses its element and caches settled projections. The current v6.89 native 3D appearance remains unchanged.\n\nRollback: `node apply-combined-2d-marker-v6-90.cjs --uninstall`, rebuild and reload.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'combined-2d-marker-v6-90-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.90 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'combined-2d-marker-v6-90' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.90 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.90 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.90 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-combined-2d-marker-v6-90.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Combined 2D current-image marker v6.90 is already installed. No files changed.');
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
  const manifest = { installer: 'combined-2d-marker-v6-90', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Combined 2D current-image marker v6.90 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
