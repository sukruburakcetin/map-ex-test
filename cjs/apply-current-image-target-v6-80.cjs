#!/usr/bin/env node
'use strict';
/**
 * Current image target v6.80. Compatible current v6 sources.
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
      "file": "src/features/map-graphics/SelectionPulse.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup src/features/map-graphics/SelectionPulse.ts",
              "before": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\nexport interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }\nexport interface PulseView<G, L> {\n type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;\n map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n graphics: { remove(graphic: G): unknown };\n toScreen(geometry: any): { x: number; y: number } | null | undefined;\n updating?: boolean;\n stationary?: boolean;\n groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;\n   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;\n}\nexport interface PulseFactories<G, L> {\n point(properties: any): any;\n layer(properties: any): L;\n graphic(properties: any): G;\n overlay(): HTMLDivElement | null;\n}\n\nexport class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {\n  this.bindings = bindings; this.factories = factories; this.clock = clock;\n }\n\n /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.\n  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original\n  * 1200 ms 2D pulse, screen projection and symbol fallback; 3D uses a steady 12 pt icon.\n  */\n show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null): G {\n    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n    // Keep the geometry anchor independent from coverage rendering.\n    const layer = this.factories.layer({\n      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 12,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // Stable 3D baseline validated during diagnostics: no animation or symbol swaps.\n    if (view.type === '3d') return graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n    const host = view.container as HTMLElement;\n    if (view.type !== \"3d\" && host && typeof host.appendChild === \"function\") {\n      const overlay = this.factories.overlay();\n      if (overlay) {\n      overlay.setAttribute(\"aria-hidden\", \"true\");\n      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));\n      host.appendChild(overlay); this.overlay = overlay;\n      layer.visible = false;\n      }\n    }\n    const started = this.clock.now();\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;\n        overlay.style.display = visible ? \"block\" : \"none\";\n        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        symbol.size = size;\n      }\n      (graphic as any)._pulseFrame = this.clock.request(animate);\n    };\n    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.\n      if (this.layer) this.layer.remove(this.bindings.graphic);\n      else this.view?.graphics?.remove(this.bindings.graphic);\n      this.bindings.graphic = null;\n    }\n    if (this.layer) {\n      this.view?.map?.remove(this.layer);\n      this.layer.destroy();\n    }\n    this.layer = null; this.view = null;\n  }\n}\n\n",
              "after": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\nexport interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }\nexport interface PulseView<G, L> {\n type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;\n map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n graphics: { remove(graphic: G): unknown };\n toScreen(geometry: any): { x: number; y: number } | null | undefined;\n updating?: boolean;\n stationary?: boolean;\n groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;\n   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;\n}\nexport interface PulseFactories<G, L> {\n point(properties: any): any;\n layer(properties: any): L;\n graphic(properties: any): G;\n overlay(): HTMLDivElement | null;\n}\n\n/** One static image avoids stacking independently rendered 3D icon layers. */\nexport function currentImageTargetResource(baseColor: any): string {\n const rgba = Array.isArray(baseColor) ? baseColor : baseColor?.toRgba?.();\n const channel = (value: any, fallback: number) => Number.isFinite(value) ? Math.max(0, Math.min(255, value)) : fallback;\n const color = rgba ? `rgb(${channel(rgba[0], 0)},${channel(rgba[1], 255)},${channel(rgba[2], 0)})` : '#00ff00';\n const alpha = rgba && Number.isFinite(rgba[3]) ? Math.max(0, Math.min(1, rgba[3])) : 1;\n const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#142c24\"/><circle cx=\"12\" cy=\"12\" r=\"9.5\" fill=\"#ffffff\"/><circle cx=\"12\" cy=\"12\" r=\"6.5\" fill=\"${color}\" fill-opacity=\"${alpha}\"/></svg>`;\n return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);\n}\n\nexport class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {\n  this.bindings = bindings; this.factories = factories; this.clock = clock;\n }\n\n /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.\n  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original\n  * 1200 ms 2D pulse, screen projection and symbol fallback; 3D uses a static 14 pt camera target.\n  */\n show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null): G {\n    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n    // Keep the geometry anchor independent from coverage rendering.\n    const layer = this.factories.layer({\n      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { href: currentImageTargetResource(baseColor) }, size: 14,\n          occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // Stable 3D baseline validated during diagnostics: no animation or symbol swaps.\n    if (view.type === '3d') return graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n    const host = view.container as HTMLElement;\n    if (view.type !== \"3d\" && host && typeof host.appendChild === \"function\") {\n      const overlay = this.factories.overlay();\n      if (overlay) {\n      overlay.setAttribute(\"aria-hidden\", \"true\");\n      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));\n      host.appendChild(overlay); this.overlay = overlay;\n      layer.visible = false;\n      }\n    }\n    const started = this.clock.now();\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;\n        overlay.style.display = visible ? \"block\" : \"none\";\n        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        symbol.size = size;\n      }\n      (graphic as any)._pulseFrame = this.clock.request(animate);\n    };\n    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.\n      if (this.layer) this.layer.remove(this.bindings.graphic);\n      else this.view?.graphics?.remove(this.bindings.graphic);\n      this.bindings.graphic = null;\n    }\n    if (this.layer) {\n      this.view?.map?.remove(this.layer);\n      this.layer.destroy();\n    }\n    this.layer = null; this.view = null;\n  }\n}\n\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "tests/selectionPulseGround.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady 3D cleanup tests/selectionPulseGround.test.cjs",
              "before": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0,requests=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,add(){},remove(){},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(requests++,frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame?.(now),counts:()=>({overlays,projections,canceled,requests})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0,requests:0});x.owner.dispose();assert.equal(x.counts().canceled,0)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D steady marker schedules no frames, never swaps symbols and preserves same-image anchor updates',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),symbol=g.symbol;for(let i=0;i<600;i++)x.tick(i*16);assert.equal(g.symbol,symbol);assert.equal(symbol.symbolLayers[0].size,12);assert.equal(x.counts().requests,0);const moved={x:3,y:4};assert.equal(x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A'),g);assert.equal(g.geometry,moved);assert.equal(g.symbol,symbol);assert.equal(x.layers.length,1);x.owner.dispose();assert.equal(x.counts().canceled,0)});\ntest('2D still breathes over 1200ms and cancels animation on dispose',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick(0);assert.equal(x.owner.overlay.style.width,'10px');x.tick(600);assert.equal(x.owner.overlay.style.width,'14px');x.tick(1200);assert.equal(x.owner.overlay.style.width,'10px');assert.equal(x.counts().requests,4);x.owner.dispose();assert.equal(x.counts().canceled,1)});\n",
              "after": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0,requests=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,add(){},remove(){},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(requests++,frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame?.(now),counts:()=>({overlays,projections,canceled,requests})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,14);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0,requests:0});x.owner.dispose();assert.equal(x.counts().canceled,0)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D steady marker schedules no frames, never swaps symbols and preserves same-image anchor updates',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),symbol=g.symbol;for(let i=0;i<600;i++)x.tick(i*16);assert.equal(g.symbol,symbol);assert.equal(symbol.symbolLayers[0].size,14);assert.equal(x.counts().requests,0);const moved={x:3,y:4};assert.equal(x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A'),g);assert.equal(g.geometry,moved);assert.equal(g.symbol,symbol);assert.equal(x.layers.length,1);x.owner.dispose();assert.equal(x.counts().canceled,0)});\ntest('2D still breathes over 1200ms and cancels animation on dispose',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick(0);assert.equal(x.owner.overlay.style.width,'10px');x.tick(600);assert.equal(x.owner.overlay.style.width,'14px');x.tick(1200);assert.equal(x.owner.overlay.style.width,'10px');assert.equal(x.counts().requests,4);x.owner.dispose();assert.equal(x.counts().canceled,1)});\n\ntest('3D target is one centered SVG with green center, white ring and dark edge; 2D keeps primitive style',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),icons=g.symbol.symbolLayers;assert.equal(icons.length,1);assert.equal(icons[0].size,14);assert.equal(icons[0].material,undefined);assert.equal(icons[0].outline,undefined);assert.equal(icons[0].occludedVisibility.mode,'visible');const svg=decodeURIComponent(icons[0].resource.href.split(',').slice(1).join(','));assert(svg.includes('fill=\"#142c24\"'));assert(svg.includes('fill=\"#ffffff\"'));assert(svg.includes('fill=\"rgb(0,255,0)\"'));assert.equal((svg.match(/cx=\"12\" cy=\"12\"/g)||[]).length,3);assert(!svg.includes('<animate'));const y=setup('2d'),flat=y.owner.show(y.view,{},1,2,[0,255,0,1],'A');assert.equal(flat.symbol.type,'simple-marker');assert.equal(flat.symbol.outline.color,'white');assert.equal(y.counts().requests,1)});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/CURRENT-IMAGE-TARGET-3D.md",
      "content": "# v6.80 static current-image target\nRequires v6.79. Install/rebuild/restart and refresh. Uses one SVG image in one IconSymbol3DLayer on the existing single Graphic/layer. Green center (supplied baseColor array or Color.toRgba), white ring, dark green outer edge, all centered. Icon 14pt with padding in 24×24 SVG; visible outer diameter approximately 17 CSS pixels at DPR1, close to the prior 16 CSS pixel icon. No additional graphics, stacked 3D icon layers, DOM overlay, animation, timer, symbol swaps, terrain requests or external image downloads. Occluded visibility and on-ground placement retained. 2D remains unchanged. SVG resource is generated only when creating the marker, not per frame. White/dark border remains opaque; center alpha follows supplied RGBA.\n\nThis is a visual trial based on the steady-marker strategy, not a claim the original flicker was fixed or that this new symbol is already validated on the user's GPU. Use --uninstall to return exactly to v6.79 if appearance/rendering is unsuitable, then rebuild/reload.\n\nAffected source SelectionPulse.ts; tests selectionPulseGround.test.cjs; adds this document. Historical diagnostics remain inactive. Runtime, cone, sequence selection and hover algorithms unchanged.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'current-image-target-v6-80-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.80 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'current-image-target-v6-80' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.80 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.80 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.80 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-current-image-target-v6-80.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Current image target v6.80 is already installed. No files changed.');
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
  const manifest = { installer: 'current-image-target-v6-80', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Current image target v6.80 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
