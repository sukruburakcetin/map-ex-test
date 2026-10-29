#!/usr/bin/env node
'use strict';
/**
 * Cached pulse symbols v6.71. Compatible current v6 sources.
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
              "label": "cached pulse symbols 1",
              "before": "      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    if (view.type === '3d') {\n      this.probe ??= new PulseVisibilityProbe();\n      this.probe.attach(view, layer, graphic);\n    }\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n",
              "after": "      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // Prebuild a bounded set once per displayed image; never clone during animation.\n    const symbolFrames = view.type === '3d' ? Array.from({ length: 17 }, (_, index) => {\n      if (index === 0) return graphic.symbol;\n      const initial = graphic.symbol as any;\n      const frame = typeof initial.clone === 'function' ? initial.clone()\n        : { ...initial, symbolLayers: initial.symbolLayers.map((icon: any) => ({ ...icon })) };\n      (frame.symbolLayers.getItemAt?.(0) || frame.symbolLayers[0]).size = 10 + index / 4;\n      return frame;\n    }) : null;\n    if (view.type === '3d') {\n      this.probe ??= new PulseVisibilityProbe();\n      this.probe.attach(view, layer, graphic, symbolFrames || undefined);\n    }\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        if (view.type === \"3d\") {\n          // Animate the existing SDK icon Accessor. Do not replace the Graphic's symbol.\n          const nextSize = Math.round(size * 10) / 10;\n          if (now - lastSymbolUpdate >= 32 && nextSize !== lastSymbolSize) {\n            const icon = symbol.symbolLayers.getItemAt?.(0) || symbol.symbolLayers[0];\n            icon.size = nextSize;\n            lastSymbolUpdate = now; lastSymbolSize = nextSize;\n          }\n        } else symbol.size = size;\n      }\n",
              "after": "        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        if (view.type === \"3d\") {\n          // Public symbol assignment notifies SceneView; reuse the prebuilt finite set.\n          const frameIndex = Math.max(0, Math.min(16, Math.round((size - 10) * 4)));\n          const nextSize = 10 + frameIndex / 4;\n          if (now - lastSymbolUpdate >= 32 && nextSize !== lastSymbolSize) {\n            const next = symbolFrames![frameIndex];\n            if (graphic.symbol !== next) graphic.symbol = next;\n            lastSymbolUpdate = now; lastSymbolSize = nextSize;\n          }\n        } else symbol.size = size;\n      }\n"
            },
            {
              "label": "cached pulse symbols 3",
              "before": " private sizeUpdates = 0;\n private minSize = Infinity;\n private maxSize = -Infinity;\n private symbolReplacements = 0;\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private revision = 0;\n private layerView: any = null;\n private inMap: boolean | undefined;\n",
              "after": " private sizeUpdates = 0;\n private minSize = Infinity;\n private maxSize = -Infinity;\n private symbolReplacements = 0;\n private pooledAssignments = 0;\n private unexpectedAssignments = 0;\n private pool: Set<any> | null = null;\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private revision = 0;\n private layerView: any = null;\n private inMap: boolean | undefined;\n"
            },
            {
              "label": "cached pulse symbols 4",
              "before": "   stationary: o.view.stationary ?? null, viewUpdating: o.view.updating ?? null,\n   layerViewVisible: this.layerView?.visible ?? null, layerViewSuspended: this.layerView?.suspended ?? null };\n }\n private record(event: string, label?: string): void {\n  if (event === 'symbol-change') ++this.symbolReplacements;\n  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  if (event !== 'geometry-change' && !event.startsWith('layer-view:')) console.info('[Mapillary pulse probe]', entry);\n }\n report = () => ({ mode: '3d-inplace-icon-size', animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => this.record(event));\n  if (handle?.remove) this.handles.push(handle);\n }\n attach(view: any, layer: any, graphic: any): void {\n  this.stop('replaced'); this.owner = { view, layer, graphic }; const revision = ++this.revision;\n  if (typeof window !== 'undefined') (window as any).__mapillaryPulseProbe = { report: this.report, mark: this.mark, clear: this.clear };\n  this.watch(graphic, 'symbol', 'symbol-change'); this.watch(graphic, 'visible', 'graphic-visibility'); this.watch(graphic, 'geometry', 'geometry-change');\n  this.watch(layer, 'visible', 'layer-visibility'); this.watch(layer, 'opacity', 'layer-opacity'); this.watch(layer, 'destroyed', 'layer-destroyed');\n  const icon = graphic.symbol?.symbolLayers?.getItemAt?.(0) || graphic.symbol?.symbolLayers?.[0];\n",
              "after": "   stationary: o.view.stationary ?? null, viewUpdating: o.view.updating ?? null,\n   layerViewVisible: this.layerView?.visible ?? null, layerViewSuspended: this.layerView?.suspended ?? null };\n }\n private record(event: string, label?: string): void {\n  if (event === 'symbol-change') {\n   ++this.symbolReplacements;\n   const size = this.snapshot().size;\n   ++this.sizeUpdates; if (Number.isFinite(size)) { this.minSize = Math.min(this.minSize, size); this.maxSize = Math.max(this.maxSize, size); }\n   if (this.pool?.has(this.owner?.graphic.symbol)) { ++this.pooledAssignments; return; }\n   ++this.unexpectedAssignments;\n  }\n  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  if (event !== 'geometry-change' && !event.startsWith('layer-view:')) console.info('[Mapillary pulse probe]', entry);\n }\n report = () => ({ mode: '3d-cached-symbols', animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => this.record(event));\n  if (handle?.remove) this.handles.push(handle);\n }\n attach(view: any, layer: any, graphic: any, pool?: readonly any[]): void {\n  this.stop('replaced'); this.owner = { view, layer, graphic }; this.pool = pool ? new Set(pool) : null; const revision = ++this.revision;\n  if (typeof window !== 'undefined') (window as any).__mapillaryPulseProbe = { report: this.report, mark: this.mark, clear: this.clear };\n  this.watch(graphic, 'symbol', 'symbol-change'); this.watch(graphic, 'visible', 'graphic-visibility'); this.watch(graphic, 'geometry', 'geometry-change');\n  this.watch(layer, 'visible', 'layer-visibility'); this.watch(layer, 'opacity', 'layer-opacity'); this.watch(layer, 'destroyed', 'layer-destroyed');\n  const icon = graphic.symbol?.symbolLayers?.getItemAt?.(0) || graphic.symbol?.symbolLayers?.[0];\n"
            },
            {
              "label": "cached pulse symbols 5",
              "before": "    if (present !== previous) { if (kind === 'map') this.inMap = present; else this.inLayer = present; this.record(kind === 'map' ? 'layer-membership' : 'graphic-membership'); }\n   });\n   if (handle?.remove) this.handles.push(handle);\n  }\n  this.record('attached-inplace-animation');\n  try { if (view.whenLayerView) void Promise.resolve(view.whenLayerView(layer)).then(lv => {\n   if (revision !== this.revision || !this.owner) return;\n   this.layerView = lv; this.watch(lv, 'visible', 'layer-view:visible'); this.watch(lv, 'suspended', 'layer-view:suspended'); this.record('layer-view:attached');\n  }).catch(() => { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); });\n  } catch { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); }\n }\n stop(reason = 'stopped'): void {\n  if (this.owner) this.record(reason);\n  ++this.revision; this.handles.forEach(handle => handle.remove()); this.handles = []; this.owner = null; this.layerView = null;\n }\n}\n",
              "after": "    if (present !== previous) { if (kind === 'map') this.inMap = present; else this.inLayer = present; this.record(kind === 'map' ? 'layer-membership' : 'graphic-membership'); }\n   });\n   if (handle?.remove) this.handles.push(handle);\n  }\n  this.record('attached-cached-animation');\n  try { if (view.whenLayerView) void Promise.resolve(view.whenLayerView(layer)).then(lv => {\n   if (revision !== this.revision || !this.owner) return;\n   this.layerView = lv; this.watch(lv, 'visible', 'layer-view:visible'); this.watch(lv, 'suspended', 'layer-view:suspended'); this.record('layer-view:attached');\n  }).catch(() => { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); });\n  } catch { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); }\n }\n stop(reason = 'stopped'): void {\n  if (this.owner) this.record(reason);\n  ++this.revision; this.handles.forEach(handle => handle.remove()); this.handles = []; this.owner = null; this.layerView = null; this.pool = null;\n }\n}\n"
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
              "label": "cached pulse symbols 1",
              "before": "test('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D breathing changes only the existing icon size, preserving symbol, anchor and phase',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),symbol=g.symbol,icon=symbol.symbolLayers[0];x.tick(0);assert.equal(icon.size,10);x.tick(16);assert.equal(icon.size,10);x.tick(600);assert.equal(icon.size,14);const moved={x:3,y:4};assert.equal(x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A'),g);assert.equal(g.geometry,moved);x.tick(1200);assert.equal(icon.size,10);assert.equal(g.symbol,symbol);assert.equal(g.symbol.symbolLayers[0],icon);assert.equal(x.layers.length,1);assert.equal(x.counts().projections,0);x.owner.dispose();assert.equal(x.counts().canceled,1)});\n",
              "after": "test('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D reuses a bounded immutable symbol pool across cycles, preserving graphic, anchor and phase',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),first=g.symbol,anchor=g.geometry,seen=new Set();for(let i=0;i<=600;i++){x.tick(i*16);seen.add(g.symbol);assert.equal(g.geometry,anchor)}assert(seen.size<=17);assert(seen.size>10);for(const symbol of seen)assert.equal((symbol.symbolLayers[0].size-10)*4,Math.round((symbol.symbolLayers[0].size-10)*4));x.tick(10200);assert.equal(g.symbol.symbolLayers[0].size,14);const moved={x:3,y:4};assert.equal(x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A'),g);assert.equal(g.geometry,moved);x.tick(10800);assert.equal(g.symbol,first);assert.equal(x.layers.length,1);assert.equal(x.counts().projections,0);x.owner.dispose();assert.equal(x.counts().canceled,1)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/pulseVisibilityProbe.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "cached pulse symbols 1",
              "before": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);const{PulseVisibilityProbe}=m.exports;\nfunction watchable(data={}){const callbacks=new Map();return Object.assign(data,{callbacks,watch(key,cb){callbacks.set(key,cb);return{remove:()=>callbacks.delete(key)}}})}\nfunction collection(items){const callbacks=new Set();return{items,callbacks,includes:x=>items.includes(x),on(event,cb){callbacks.add(cb);return{remove:()=>callbacks.delete(cb)}},remove(x){items.splice(items.indexOf(x),1);for(const cb of [...callbacks])cb()}}}\ntest('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();icon.size=14;icon.callbacks.get('size')();assert.equal(probe.report().animation.sizeUpdates,1);assert.equal(probe.report().animation.symbolReplacements,1);assert.equal(probe.report().animation.maxSize,14);layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n",
              "after": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);const{PulseVisibilityProbe}=m.exports;\nfunction watchable(data={}){const callbacks=new Map();return Object.assign(data,{callbacks,watch(key,cb){callbacks.set(key,cb);return{remove:()=>callbacks.delete(key)}}})}\nfunction collection(items){const callbacks=new Set();return{items,callbacks,includes:x=>items.includes(x),on(event,cb){callbacks.add(cb);return{remove:()=>callbacks.delete(cb)}},remove(x){items.splice(items.indexOf(x),1);for(const cb of [...callbacks])cb()}}}\ntest('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();icon.size=14;icon.callbacks.get('size')();assert.equal(probe.report().animation.sizeUpdates,2);assert.equal(probe.report().animation.symbolReplacements,1);assert.equal(probe.report().animation.maxSize,14);layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n\ntest('known cached assignments aggregate without filling history; unknown symbols remain explicit',()=>{const log=console.info;console.info=()=>{};try{const a={symbolLayers:[{size:10}]},b={symbolLayers:[{size:14}]},g=watchable({symbol:a}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,g,[a,b]);for(let i=0;i<500;i++){g.symbol=i%2?a:b;g.callbacks.get('symbol')()}let report=probe.report();assert.equal(report.animation.pooledSymbolAssignments,500);assert.equal(report.animation.unexpectedSymbolAssignments,0);assert.equal(report.animation.poolSize,2);assert.equal(report.events.length,1);assert.equal(report.animation.minSize,10);assert.equal(report.animation.maxSize,14);g.symbol={symbolLayers:[{size:12}]};g.callbacks.get('symbol')();assert.equal(probe.report().animation.unexpectedSymbolAssignments,1);assert.equal(probe.report().events.at(-1).event,'symbol-change');probe.stop()}finally{console.info=log}});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/PULSE-CACHED-SYMBOLS.md",
      "content": "# Cached legacy pulse experiment · v6.71\n\nApply after v6.70. Uses the public Graphic.symbol setter to notify SceneView, but reuses a finite set of 17 symbols rather than constructing/cloning one on every animation update. The first symbol is the initial marker; 16 additional symbols are built once per newly displayed image at quarter-point sizes from 10 to 14. The original 1200ms breathing cycle remains, with assignments bounded to roughly 30Hz and skipped when the quantized size is unchanged.\n\nNo per-animation symbol cloning. The same Graphic, geometry anchor and layer remain through a cycle; same-image corrections preserve phase and pool. Different images create their own bounded pool. Cleanup cancels the animation and releases its owned graphics/layer as before. No halo, opacity fading or vertical lift is introduced. 2D, anchor recovery, cone sizing, brown/next-frame hover, selection and blue highlights stay unchanged.\n\nThis tests whether repeated construction contributes to the interruptions. It still assigns different symbol references to request the supported redraw; that assignment itself could still trigger flicker. Actual animation and stable visibility must be checked in the app.\n\n## Verify\n\n1. Refresh after installation and open the same image in 3D.\n2. Confirm the green circle visibly breathes. Repeat the stationary, hover and camera gestures from the recording.\n3. Export:\n\n   ```js\n   copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))\n   ```\n\nThe mode is `3d-cached-symbols`. While active, `animation.poolSize` should be 17 and `unexpectedSymbolAssignments` normally zero. `pooledSymbolAssignments` and `symbolReplacements` increasing is expected here: the change is reuse, not elimination of assignments. Size updates include observed assignment values; they do not measure rendered FPS. Expected cached assignments are aggregated, avoiding per-frame Console messages/history entries. Visibility/removal and unknown-symbol events remain explicit.\n\nReport both visual breathing and whether disappearance persists. A correct report alone does not prove the GPU rendered the animation smoothly.\n\n## Roll back\n\n```sh\nnode apply-cached-pulse-symbols-v6-71.cjs --uninstall\n```\n\nThis restores v6.70. To return all the way to the deliberately frozen v6.69 comparison, also uninstall v6.70 afterward:\n\n```sh\nnode apply-pulse-icon-animation-v6-70.cjs --uninstall\n```\n\nRefresh after each installed-state change. Both rollbacks preserve the alignment/cone fixes. No changes to hover algorithms are needed for this experiment.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'cached-pulse-symbols-v6-71-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.71 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'cached-pulse-symbols-v6-71' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.71 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.71 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.71 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-cached-pulse-symbols-v6-71.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Cached pulse symbols v6.71 is already installed. No files changed.');
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
  const manifest = { installer: 'cached-pulse-symbols-v6-71', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Cached pulse symbols v6.71 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
