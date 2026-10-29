#!/usr/bin/env node
'use strict';
/**
 * Pulse anchor stability v6.66. Compatible current v6 sources.
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
              "label": "pulse anchor stability 1",
              "before": "  /** Match selection visuals to the accepted tile point; API coordinates remain unchanged. */\n  private getCoverageDisplayPosition(imageId: string, lon: number, lat: number): { lon: number; lat: number; geometry?: __esri.Point } {\n    const selected = this._coverageSelectionTargets.anchor(this.coverageSelectionContext(), String(imageId));\n    return selected ? { lon: selected.lon, lat: selected.lat, geometry: selected.geometry } : { lon, lat };\n  }\n\n  /** Resolve only the current image, after opening. Warm bytes/index hits do no\n   * network work; a missing tile shares one optional download. API data stays intact.\n",
              "after": "  /** Match selection visuals to the accepted tile point; API coordinates remain unchanged. */\n  private getCoverageDisplayPosition(imageId: string, lon: number, lat: number): { lon: number; lat: number; geometry?: __esri.Point } {\n    const selected = this._coverageSelectionTargets.anchor(this.coverageSelectionContext(), String(imageId));\n    return selected ? { lon: selected.lon, lat: selected.lat, geometry: selected.geometry } : { lon, lat };\n  }\n\n  /** Revisit presentation anchoring after startup zoom/style settles; never pick another image. */\n  private refreshActivePulseAnchor(view: __esri.MapView | __esri.SceneView): void {\n    if (this.state.jimuMapView?.view !== view || view.destroyed || view.stationary === false || !this.state.turboModeActive || view.zoom < 14) return;\n    const id = String(this.state.imageId || '');\n    const image = this._liveSequenceFrames.find(id) || this.state.sequenceImages?.find(frame => String(frame.id) === id);\n    if (id && image && Number.isFinite(image.lon) && Number.isFinite(image.lat)) void this.resolveNativeImageAnchor(id, image.lon, image.lat);\n  }\n\n  /** Resolve only the current image, after opening. Warm bytes/index hits do no\n   * network work; a missing tile shares one optional download. API data stays intact.\n"
            },
            {
              "label": "pulse anchor stability 2",
              "before": "            if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n              return;\n            }\n\n            if (this._isFlyInActive) {\n              return;\n            }\n\n",
              "after": "            if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n              return;\n            }\n\n            this.refreshActivePulseAnchor(view);\n            if (this._isFlyInActive) {\n              return;\n            }\n\n"
            },
            {
              "label": "pulse anchor stability 3",
              "before": "      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n        return;\n      }\n\n      this.setState({\n        currentZoom: newZoom,\n      });\n\n",
              "after": "      if (this.state.jimuMapView?.view !== view || !view.map || view.destroyed) {\n        return;\n      }\n\n      this.refreshActivePulseAnchor(view);\n      this.setState({\n        currentZoom: newZoom,\n      });\n\n"
            },
            {
              "label": "pulse anchor stability 4",
              "before": "              await this.enableTurboCoverageLayer(effectiveFilter);\n            } else {\n              await this.enableTurboCoverageLayer();\n            }\n            if (this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)\n              void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);\n          }\n        }, TIMING.TURBO_DEBOUNCE_MS),\n",
              "after": "              await this.enableTurboCoverageLayer(effectiveFilter);\n            } else {\n              await this.enableTurboCoverageLayer();\n            }\n            this.refreshActivePulseAnchor(view);\n            if (this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)\n              void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);\n          }\n        }, TIMING.TURBO_DEBOUNCE_MS),\n"
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
              "label": "pulse anchor stability 1",
              "before": "export class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n",
              "after": "export class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private halo: G | null = null;\n private haloLayer: L | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n"
            },
            {
              "label": "pulse anchor stability 2",
              "before": "    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n",
              "after": "    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      if (this.halo) this.halo.geometry = this.bindings.graphic.geometry;\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n"
            },
            {
              "label": "pulse anchor stability 3",
              "before": "      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        // A tiny, capped display lift keeps the icon clear of the cone apex.\n        verticalOffset: { screenLength: 2, minWorldLength: 0, maxWorldLength: 0.1 },\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 10,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n",
              "after": "      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 10,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    if (view.type === '3d') {\n      const rgb = Array.isArray(baseColor) ? baseColor.slice(0, 3) : [0, 255, 0];\n      this.halo = this.factories.graphic({ geometry: graphic.geometry, symbol: {\n        type: 'point-3d', disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [...rgb, 0.08] }, size: 14,\n          outline: { color: [...rgb, 0.6], size: 1 }, occludedVisibility: { mode: 'visible' } }],\n      } });\n      this.haloLayer = this.factories.layer({ id: 'mapillary-active-selection-halo', title: 'Mapillary Pulse Halo', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      view.map!.add(this.haloLayer); this.haloLayer.add(this.halo);\n    }\n    view.map!.add(layer); layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n"
            },
            {
              "label": "pulse anchor stability 4",
              "before": "        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        if (view.type === \"3d\") {\n          // Graphic redraws reliably when its symbol is reassigned. Mutating a\n          // nested icon alone can leave SceneView displaying the initial size.\n          // Keep the same Graphic/anchor and bound symbol updates to ~30 Hz.\n          const nextSize = Math.round(size * 10) / 10;\n          if (now - lastSymbolUpdate >= 32 && nextSize !== lastSymbolSize) {\n            const next = typeof symbol.clone === \"function\" ? symbol.clone()\n              : { ...symbol, symbolLayers: symbol.symbolLayers.map((icon: any) => ({ ...icon })) };\n            const icon = next.symbolLayers.getItemAt?.(0) || next.symbolLayers[0];\n            icon.size = nextSize;\n            graphic.symbol = next;\n            lastSymbolUpdate = now; lastSymbolSize = nextSize;\n          }\n        } else symbol.size = size;\n      }\n",
              "after": "        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        if (view.type === \"3d\") {\n          // Keep the opaque image-centre icon immutable; animate only a separate halo.\n          // Native symbol replacement can briefly rebuild a SceneView render resource.\n          const halo = this.halo, haloSymbol = halo?.symbol as any;\n          const nextSize = Math.round((size + 4) * 10) / 10;\n          if (halo && haloSymbol && now - lastSymbolUpdate >= 32 && nextSize !== lastSymbolSize) {\n            const next = typeof haloSymbol.clone === 'function' ? haloSymbol.clone()\n              : { ...haloSymbol, symbolLayers: haloSymbol.symbolLayers.map((icon: any) => ({ ...icon })) };\n            const icon = next.symbolLayers.getItemAt?.(0) || next.symbolLayers[0];\n            icon.size = nextSize;\n            halo.symbol = next;\n            lastSymbolUpdate = now; lastSymbolSize = nextSize;\n          }\n        } else symbol.size = size;\n      }\n"
            },
            {
              "label": "pulse anchor stability 5",
              "before": "\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n",
              "after": "\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.halo) { this.haloLayer?.remove(this.halo); this.halo = null; }\n    if (this.haloLayer) { this.view?.map?.remove(this.haloLayer); this.haloLayer.destroy(); this.haloLayer = null; }\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n"
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
              "label": "pulse anchor stability 1",
              "before": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,add(){},remove(){},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame(now),counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D pulse reassigns the symbol, preserving the anchor and a capped lift',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:500}},1,2,[0,255,0,1],'A'),initial=g.symbol,anchor=g.geometry;x.tick(0);const first=g.symbol;assert.notEqual(first,initial);assert.equal(initial.symbolLayers[0].size,10);x.tick(16);assert.equal(g.symbol,first);x.tick(600);assert.notEqual(g.symbol,first);assert.equal(g.symbol.symbolLayers[0].size,14);x.tick(1200);assert.equal(g.symbol.symbolLayers[0].size,10);assert.equal(g.geometry,anchor);assert.deepEqual(g.symbol.verticalOffset,{screenLength:2,minWorldLength:0,maxWorldLength:0.1});assert.equal(x.layers.length,1)});\n",
              "after": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,items:[],add(g){this.items.push(g)},remove(g){this.items=this.items.filter(x=>x!==g)},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame(now),counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').elevationInfo.mode,'on-the-ground');assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,10);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,2);assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D keeps an immutable centred core and animates only the retained halo',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:500}},1,2,[0,255,0,1],'A'),initial=g.symbol,anchor=g.geometry,halo=x.layers.find(l=>l.id==='mapillary-active-selection-halo').items[0];assert.notEqual(halo,g);x.tick(0);const first=halo.symbol;x.tick(16);assert.equal(halo.symbol,first);x.tick(600);assert.notEqual(halo.symbol,first);assert.equal(halo.symbol.symbolLayers[0].size,18);x.tick(1200);assert.equal(halo.symbol.symbolLayers[0].size,14);assert.equal(g.symbol,initial);assert.equal(g.geometry,anchor);assert.equal(g.symbol.verticalOffset,undefined);const moved={x:3,y:4,z:60};x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A');assert.equal(g.geometry,moved);assert.equal(halo.geometry,moved);assert.equal(g.symbol,initial);assert.equal(x.layers.length,2);assert.equal(x.layers[0].items.length,1);assert.equal(x.layers[1].items.length,1);x.owner.dispose();assert.equal(x.layers[0].items.length,0);assert.equal(x.layers[1].items.length,0)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/pulseAnchorRecovery.test.cjs",
      "content": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(m=>m.name?.getText(sf)==='refreshActivePulseAnchor').getText(sf);const Runtime=new Function(ts.transpileModule('class Runtime{'+method+'}; return Runtime;',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)();\ntest('refresh/fly-in below 14 can resolve its exact current-image anchor after settling above 14',()=>{const w=new Runtime(),view={zoom:12,stationary:true,map:{}},image={id:'A',lon:-86.13,lat:39.78};w.state={imageId:'A',turboModeActive:true,jimuMapView:{view},sequenceImages:[image]};w._liveSequenceFrames={find:()=>image};w._isFlyInActive=true;const calls=[];w.resolveNativeImageAnchor=(...args)=>calls.push(args);w.refreshActivePulseAnchor(view);assert.equal(calls.length,0);view.zoom=22;view.stationary=false;w.refreshActivePulseAnchor(view);assert.equal(calls.length,0);view.stationary=true;w.refreshActivePulseAnchor(view);assert.deepEqual(calls,[['A',image.lon,image.lat]]);assert.equal(w.state.imageId,'A');w.state.jimuMapView.view={};w.refreshActivePulseAnchor(view);assert.equal(calls.length,1)});\ntest('anchor recovery never chooses a different image or acts with Places/imagery metadata alone',()=>{const w=new Runtime(),view={zoom:21,stationary:true,map:{}};w.state={imageId:'new',turboModeActive:true,jimuMapView:{view},sequenceImages:[]};w._liveSequenceFrames={find:()=>null};w.resolveNativeImageAnchor=()=>{throw Error('no image coords')};w.refreshActivePulseAnchor(view);w.state.turboModeActive=false;w.refreshActivePulseAnchor(view)});\n"
    },
    {
      "file": "docs/PULSE-ANCHOR-STABILITY.md",
      "content": "# Current-image anchor recovery and 3D pulse stability · v6.66\n\nApply after v6.65, with v6.64 uninstalled. This update contains no playback scheduling or hover/selection algorithm changes.\n\nRefresh/shared-link fly-in can start below zoom 14, where native individual-image anchor resolution intentionally does no work. Previously, the eventual zoom/stationary callbacks did not retry that resolution, leaving the pulse at provisional image/API coordinates until a later image event or exact marker click. The existing resolver now gets a current-image-only retry when the view settles, when zoom callbacks occur in an already stationary eligible view, and after stationary coverage style work finishes. Its existing cache, one-image tile lookup, in-flight deduplication and stale view/image/revision checks remain unchanged. Warm tile bytes are reused; the existing optional missing-tile download may be needed. No sequence enumeration or different-image selection is introduced.\n\nThe green 3D centre is now an immutable opaque icon on its own ground-draped layer. A separate, independently owned ground-draped layer carries the animated halo, keeping its symbol replacement away from the centre's render resources. The former small vertical offset is removed, so the centre uses the same ground position as the cone/accepted image anchor. The halo retains the existing 1200ms rhythm and one bounded animation callback; there is no second animation loop. Same-image anchor correction updates both geometries without replacing the core, recreating layers or resetting the pulse phase. View/image changes and disposal release both layers.\n\n2D keeps its existing DOM pulse. Picking, accepted hover/click positions, blue styling and native alignment formulas are unchanged. The core can initially use provisional API coordinates while the current image's tile anchor is being resolved; after successful resolution it moves to the exact tile presentation point without requiring a hover/click.\n\n## Local verification\n\n1. Refresh a shared image link that begins zoomed out, let fly-in finish, then zoom closely in 3D. After the tile anchor resolves, the cone apex, green centre and selected tile point should coincide without hovering first.\n2. Hover/click the same image afterward: it should not produce another apparent centre correction. Selecting a different image should still work exactly as before.\n3. Observe the green core through several pulse cycles, terrain loading, rotation/tilt and playback. The centre should stay solid while its halo pulses. Check 2D as well.\n4. Toggle fullscreen and 2D/3D, then close/reopen the widget. No old pulse/halo layers should remain.\n\nActual ArcGIS objects were exercised in a Node check across 1000 animation ticks, confirming a stable core symbol, shared corrected geometry and cleanup. This verifies SDK object semantics, not live GPU rendering or a complete deployed fly-in. Verify the reported flicker/alignment behavior in your running app.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'pulse-anchor-stability-v6-66-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.66 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'pulse-anchor-stability-v6-66' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.66 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.66 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.66 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-pulse-anchor-stability-v6-66.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Pulse anchor stability v6.66 is already installed. No files changed.');
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
  const manifest = { installer: 'pulse-anchor-stability-v6-66', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Pulse anchor stability v6.66 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
