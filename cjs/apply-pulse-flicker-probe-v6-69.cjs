#!/usr/bin/env node
'use strict';
/**
 * Pulse flicker probe v6.69. Compatible current v6 sources.
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
              "label": "pulse flicker probe 1",
              "before": "export class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n",
              "after": "export class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private probe: PulseVisibilityProbe | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n"
            },
            {
              "label": "pulse flicker probe 2",
              "before": "      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 10,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n",
              "after": "      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 12,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    if (view.type === '3d') {\n      this.probe ??= new PulseVisibilityProbe();\n      this.probe.attach(view, layer, graphic);\n      return graphic; // Diagnostic: no size animation or animation frame in 3D.\n    }\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n"
            },
            {
              "label": "pulse flicker probe 3",
              "before": " }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n",
              "after": " }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.probe?.stop('owner-dispose');\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n"
            },
            {
              "label": "pulse flicker probe 4",
              "before": "    }\n    this.layer = null; this.view = null;\n  }\n}\n",
              "after": "    }\n    this.layer = null; this.view = null;\n  }\n}\n\n/** Temporary, event-driven diagnostic. Records no coordinates, image IDs or request URLs. */\nexport class PulseVisibilityProbe {\n private handles: { remove(): void }[] = [];\n private events: any[] = [];\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private revision = 0;\n private layerView: any = null;\n private inMap: boolean | undefined;\n private inLayer: boolean | undefined;\n private snapshot(): any {\n  const o = this.owner;\n  if (!o) return { active: false };\n  const symbol = o.graphic.symbol, icon = symbol?.symbolLayers?.getItemAt?.(0) || symbol?.symbolLayers?.[0];\n  return { active: true, viewType: o.view.type, viewDestroyed: !!o.view.destroyed,\n   graphicPresent: o.layer.graphics?.includes?.(o.graphic) ?? null,\n   layerPresent: o.view.map?.layers?.includes?.(o.layer) ?? null,\n   graphicVisible: o.graphic.visible ?? true, layerVisible: o.layer.visible ?? true,\n   layerOpacity: o.layer.opacity ?? 1, size: icon?.size ?? null,\n   stationary: o.view.stationary ?? null, viewUpdating: o.view.updating ?? null,\n   layerViewVisible: this.layerView?.visible ?? null, layerViewSuspended: this.layerView?.suspended ?? null };\n }\n private record(event: string, label?: string): void {\n  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  if (event !== 'geometry-change' && !event.startsWith('layer-view:')) console.info('[Mapillary pulse probe]', entry);\n }\n report = () => ({ mode: '3d-frozen-12pt', current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => this.record(event));\n  if (handle?.remove) this.handles.push(handle);\n }\n attach(view: any, layer: any, graphic: any): void {\n  this.stop('replaced'); this.owner = { view, layer, graphic }; const revision = ++this.revision;\n  if (typeof window !== 'undefined') (window as any).__mapillaryPulseProbe = { report: this.report, mark: this.mark, clear: this.clear };\n  this.watch(graphic, 'symbol', 'symbol-change'); this.watch(graphic, 'visible', 'graphic-visibility'); this.watch(graphic, 'geometry', 'geometry-change');\n  this.watch(layer, 'visible', 'layer-visibility'); this.watch(layer, 'opacity', 'layer-opacity'); this.watch(layer, 'destroyed', 'layer-destroyed');\n  const icon = graphic.symbol?.symbolLayers?.getItemAt?.(0) || graphic.symbol?.symbolLayers?.[0];\n  this.watch(icon, 'size', 'icon-size-change');\n  this.inMap = view.map?.layers?.includes?.(layer); this.inLayer = layer.graphics?.includes?.(graphic);\n  for (const [collection, kind] of [[view.map?.layers, 'map'], [layer.graphics, 'graphics']] as const) {\n   const handle = collection?.on?.('change', () => {\n    const present = kind === 'map' ? view.map?.layers?.includes?.(layer) : layer.graphics?.includes?.(graphic);\n    const previous = kind === 'map' ? this.inMap : this.inLayer;\n    if (present !== previous) { if (kind === 'map') this.inMap = present; else this.inLayer = present; this.record(kind === 'map' ? 'layer-membership' : 'graphic-membership'); }\n   });\n   if (handle?.remove) this.handles.push(handle);\n  }\n  this.record('attached-frozen');\n  try { if (view.whenLayerView) void Promise.resolve(view.whenLayerView(layer)).then(lv => {\n   if (revision !== this.revision || !this.owner) return;\n   this.layerView = lv; this.watch(lv, 'visible', 'layer-view:visible'); this.watch(lv, 'suspended', 'layer-view:suspended'); this.record('layer-view:attached');\n  }).catch(() => { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); });\n  } catch { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); }\n }\n stop(reason = 'stopped'): void {\n  if (this.owner) this.record(reason);\n  ++this.revision; this.handles.forEach(handle => handle.remove()); this.handles = []; this.owner = null; this.layerView = null;\n }\n}\n"
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
              "label": "pulse flicker probe 1",
              "before": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,add(){},remove(){},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame(now),counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('legacy whole-circle pulse preserves its anchor without a vertical lift',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:500}},1,2,[0,255,0,1],'A'),initial=g.symbol,anchor=g.geometry;x.tick(0);const first=g.symbol;assert.notEqual(first,initial);assert.equal(initial.symbolLayers[0].size,10);x.tick(16);assert.equal(g.symbol,first);x.tick(600);assert.notEqual(g.symbol,first);assert.equal(g.symbol.symbolLayers[0].size,14);x.tick(1200);assert.equal(g.symbol.symbolLayers[0].size,10);assert.equal(g.geometry,anchor);assert.equal(g.symbol.verticalOffset,undefined);assert.equal(x.layers.length,1)});\n",
              "after": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,add(){},remove(){},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame?.(now),counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,0)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('diagnostic 3D core stays at 12pt without scheduling frames or replacing its symbol',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),symbol=g.symbol;for(const now of [0,600,1200,5000])x.tick(now);assert.equal(g.symbol,symbol);assert.equal(g.symbol.symbolLayers[0].size,12);assert.equal(g._pulseFrame,undefined);const moved={x:3,y:4};assert.equal(x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A'),g);assert.equal(g.geometry,moved);assert.equal(x.layers.length,1);x.owner.dispose();assert.equal(x.counts().canceled,0)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/pulseVisibilityProbe.test.cjs",
      "content": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);const{PulseVisibilityProbe}=m.exports;\nfunction watchable(data={}){const callbacks=new Map();return Object.assign(data,{callbacks,watch(key,cb){callbacks.set(key,cb);return{remove:()=>callbacks.delete(key)}}})}\nfunction collection(items){const callbacks=new Set();return{items,callbacks,includes:x=>items.includes(x),on(event,cb){callbacks.add(cb);return{remove:()=>callbacks.delete(cb)}},remove(x){items.splice(items.indexOf(x),1);for(const cb of [...callbacks])cb()}}}\ntest('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n"
    },
    {
      "file": "docs/PULSE-FLICKER-PROBE.md",
      "content": "# Temporary frozen-marker diagnostic · v6.69\n\nApply after v6.68. This is a diagnostic comparison, not a permanent animation redesign or a flicker fix.\n\n3D keeps the same green circle/white outline, ground placement, occludedVisibility setting and exact tile-anchor recovery, but freezes at the legacy midpoint size of 12pt. No pulse animation frame is scheduled in 3D. 2D animation, brown hover, direction/next-frame animation, cone cap and selection/hover algorithms are unchanged.\n\nAn event-driven probe watches the frozen Graphic's symbol/visibility/geometry, its icon size, layer visibility/opacity/destruction, Graphic and map-layer membership, and the SDK LayerView's visible/suspended state when available. One bounded 200-event history is exposed as `window.__mapillaryPulseProbe`; it targets the most recently attached 3D pulse if multiple widgets exist. It records no image IDs, coordinates, access tokens or request URLs. There is no polling, timer or extra animation loop. Watchers are removed when the owner changes or disposes, including late LayerView resolution guards. History remains available after disposal for export.\n\n## Test\n\n1. Install, refresh, and open the same image in 3D. The green circle should be steady. Widget debug mode is not required.\n2. Repeat the gestures from the recording: stationary view, hover elsewhere, zoom/tilt, and next-frame interactions. Note whether the green core still disappears.\n3. In DevTools Console, choose the app's frame. Filter by `Mapillary pulse probe` if desired (Info messages must be enabled). Confirm `attached-frozen` exists.\n4. Optionally mark an observation:\n\n   ```js\n   window.__mapillaryPulseProbe.mark('blink observed')\n   ```\n\n5. Export the bounded history and send it with your observation/recording:\n\n   ```js\n   copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))\n   ```\n\nIf the global is undefined, confirm the app frame and that a current image was opened in 3D after the refresh. The probe only attaches to 3D green markers.\n\n## Interpret\n\n- A repeated disappearance of the frozen marker means size animation alone is not sufficient to explain the issue.\n- A `symbol-change` or `icon-size-change` is unexpected while this frozen comparison is idle; it identifies external modification.\n- `graphic-membership` or `layer-membership` becoming false identifies actual collection removal. `owner-dispose` records intentional pulse cleanup before its watchers are removed; a subsequent attach records recreation.\n- Visibility/opacity/LayerView events can explain an application- or SDK-visible suspension. A quiet log while the marker disappears is consistent with an unobserved rendering/occlusion issue, but is not proof of a GPU cause.\n- Absence of flicker on one run is not proof the animation caused it. Repeat warmed comparable runs with the legacy patch restored via uninstall.\n\nThis diagnostic can itself change timing slightly because it adds observers/logging. Remove it after the comparison:\n\n```sh\nnode apply-pulse-flicker-probe-v6-69.cjs --uninstall\n```\n\nRefresh after installation and rollback. Rollback restores the exact v6.68 files.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'pulse-flicker-probe-v6-69-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.69 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'pulse-flicker-probe-v6-69' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.69 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.69 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.69 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-pulse-flicker-probe-v6-69.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Pulse flicker probe v6.69 is already installed. No files changed.');
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
  const manifest = { installer: 'pulse-flicker-probe-v6-69', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Pulse flicker probe v6.69 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
