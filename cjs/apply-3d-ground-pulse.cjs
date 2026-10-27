#!/usr/bin/env node
'use strict';
/** 3D ground pulse installer. Plain source payload.
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
      "file": "src/features/map-graphics/SelectionPulse.ts",
      "blocks": [
        {
          "label": "3D ground pulse",
          "before": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\nexport interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }\nexport interface PulseView<G, L> {\n type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;\n map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n graphics: { remove(graphic: G): unknown };\n toScreen(geometry: any): { x: number; y: number } | null | undefined;\n updating?: boolean;\n stationary?: boolean;\n groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;\n   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;\n}\nexport interface PulseFactories<G, L> {\n point(properties: any): any;\n layer(properties: any): L;\n graphic(properties: any): G;\n overlay(): HTMLDivElement | null;\n}\n\nexport class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n private groundHandle: { remove(): void } | null = null;\n\n constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {\n  this.bindings = bindings; this.factories = factories; this.clock = clock;\n }\n\n /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.\n  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original\n  * 1200 ms pulse, screen projection and symbol fallback when a DOM overlay is unavailable.\n  */\n show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null): G {\n    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n    // Keep the geometry anchor independent from coverage rendering.\n    const layer = this.factories.layer({\n      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 10,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // Map graphics can be depth-occluded in SceneView and sit under view.graphics in 2D.\n    // A single screen-projected overlay keeps selection above both without offsetting its anchor.\n    const host = view.container as HTMLElement;\n    if (host && typeof host.appendChild === \"function\") {\n      const overlay = this.factories.overlay();\n      if (overlay) {\n      overlay.setAttribute(\"aria-hidden\", \"true\");\n      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));\n      host.appendChild(overlay); this.overlay = overlay;\n      layer.visible = false;\n      }\n    }\n    const started = this.clock.now();\n    let surfaceGeometry: any = null;\n    let surfacePoint: any = null;\n    let sampledAt = -Infinity;\n    if (view.type === '3d') {\n      this.groundHandle = view.groundView?.elevationSampler?.on?.('changed', () => { surfaceGeometry = null; }) || null;\n    }\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        let projection = graphic.geometry;\n        if (view.type === '3d') {\n          // GroundView samples the currently rendered terrain synchronously; no\n          // elevation request or second animation loop. Refresh while terrain/camera changes.\n          if (surfaceGeometry !== graphic.geometry || view.updating || view.stationary === false || (!surfacePoint && now - sampledAt >= 100)) {\n            sampledAt = now;\n            surfaceGeometry = graphic.geometry; surfacePoint = null;\n            try {\n              const sampler = view.groundView?.elevationSampler;\n              const point = sampler?.queryElevation(graphic.geometry);\n              if (point && Number.isFinite(point.z) && point.z !== sampler?.noDataValue) surfacePoint = point;\n            } catch (_) { /* Keep the accepted anchor height until terrain is available. */ }\n          }\n          projection = surfacePoint || projection;\n        }\n        const pixel = view.toScreen(projection);\n        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;\n        overlay.style.display = visible ? \"block\" : \"none\";\n        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        if (view.type === \"3d\") {\n          const icon = symbol.symbolLayers.getItemAt?.(0) || symbol.symbolLayers[0];\n          icon.size = size;\n        } else symbol.size = size;\n      }\n      (graphic as any)._pulseFrame = this.clock.request(animate);\n    };\n    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.groundHandle?.remove(); this.groundHandle = null;\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.\n      if (this.layer) this.layer.remove(this.bindings.graphic);\n      else this.view?.graphics?.remove(this.bindings.graphic);\n      this.bindings.graphic = null;\n    }\n    if (this.layer) {\n      this.view?.map?.remove(this.layer);\n      this.layer.destroy();\n    }\n    this.layer = null; this.view = null;\n  }\n}\n",
          "after": "/** Active-image pulse layer, screen overlay and animation owner; selection identity remains runtime-owned. */\nimport type { RippleClock } from './ClickRippleAnimations';\nimport { selectionPulseOverlayStyle } from '../../styles/mapGraphics';\n\nexport interface PulseGraphic { geometry: any; symbol: any; attributes: any; }\nexport interface PulseLayer<G> { elevationInfo: any; visible: boolean; add(graphic: G): unknown; remove(graphic: G): unknown; destroy(): void; }\nexport interface PulseView<G, L> {\n type: string; destroyed?: boolean; width: number; height: number; container?: HTMLElement | string | null;\n map?: { add(layer: L): unknown; remove(layer: L): unknown } | null;\n graphics: { remove(graphic: G): unknown };\n toScreen(geometry: any): { x: number; y: number } | null | undefined;\n updating?: boolean;\n stationary?: boolean;\n groundView?: { elevationSampler?: { queryElevation(geometry: any): any; noDataValue?: number | null;\n   on?(type: 'changed', callback: () => void): { remove(): void } } | null } | null;\n}\nexport interface PulseFactories<G, L> {\n point(properties: any): any;\n layer(properties: any): L;\n graphic(properties: any): G;\n overlay(): HTMLDivElement | null;\n}\n\nexport class SelectionPulse<G extends PulseGraphic, L extends PulseLayer<G>, V extends PulseView<G, L>> {\n layer: L | null = null;\n view: V | null = null;\n overlay: HTMLDivElement | null = null;\n private readonly bindings: { graphic: G | null };\n private readonly factories: PulseFactories<G, L>;\n private readonly clock: RippleClock & { clearInterval(handle: any): void };\n\n constructor(bindings: { graphic: G | null }, factories: PulseFactories<G, L>, clock: RippleClock & { clearInterval(handle: any): void }) {\n  this.bindings = bindings; this.factories = factories; this.clock = clock;\n }\n\n /** Reuse the same image/view pulse without restarting its phase; otherwise replace all owned resources.\n  * The caller supplies the WGS84 position and independent coverage anchor. Preserve the original\n  * 1200 ms pulse, screen projection and symbol fallback when a DOM overlay is unavailable.\n  */\n show(view: V, anchor: { geometry?: any }, lon: number, lat: number, baseColor: any, imageId: string | null): G {\n    // Viewer events and route hydration may redraw the same image. Preserve its pulse phase.\n    if (this.view === view && this.bindings.graphic &&\n        this.bindings.graphic.attributes?.image_id === String(imageId) && this.layer) {\n      this.bindings.graphic.geometry = anchor.geometry || this.factories.point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });\n      this.layer.elevationInfo = { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" };\n      return this.bindings.graphic;\n    }\n    this.dispose();\n    // Keep the geometry anchor independent from coverage rendering.\n    const layer = this.factories.layer({\n      id: \"mapillary-active-selection\", title: \"Mapillary Active Image\", listMode: \"hide\",\n      elevationInfo: { mode: view.type === '3d' ? 'on-the-ground' : anchor.geometry ? \"absolute-height\" : \"on-the-ground\" },\n    });\n    this.layer = layer; this.view = view;\n    view.map!.add(layer);\n    const graphic = this.factories.graphic({\n      geometry: anchor.geometry || { type: \"point\", longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } },\n      attributes: { image_id: String(imageId) },\n      symbol: view.type === \"3d\" ? {\n        type: \"point-3d\", disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: \"icon\", resource: { primitive: \"circle\" }, material: { color: baseColor }, size: 10,\n          outline: { color: \"white\", size: 2 }, occludedVisibility: { mode: \"visible\" } }],\n      } : { type: \"simple-marker\", style: \"circle\", color: baseColor, size: 10, outline: { color: \"white\", width: 2 } },\n    });\n    layer.add(graphic);\n    this.bindings.graphic = graphic;\n    // SceneView must render the on-the-ground Graphic itself. toScreen projects\n    // geometry Z directly and does not apply layer draping, so a DOM pulse can float\n    // above terrain. The native icon keeps the pulse aligned while terrain loads.\n    // In 2D, retain the overlay above view.graphics.\n    const host = view.container as HTMLElement;\n    if (view.type !== \"3d\" && host && typeof host.appendChild === \"function\") {\n      const overlay = this.factories.overlay();\n      if (overlay) {\n      overlay.setAttribute(\"aria-hidden\", \"true\");\n      Object.assign(overlay.style, selectionPulseOverlayStyle(baseColor));\n      host.appendChild(overlay); this.overlay = overlay;\n      layer.visible = false;\n      }\n    }\n    const started = this.clock.now();\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n        const visible = pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;\n        overlay.style.display = visible ? \"block\" : \"none\";\n        if (visible) { overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`; overlay.style.width = `${size}px`; overlay.style.height = `${size}px`; }\n      } else {\n        const symbol = graphic.symbol as any;\n        if (view.type === \"3d\") {\n          const icon = symbol.symbolLayers.getItemAt?.(0) || symbol.symbolLayers[0];\n          icon.size = size;\n        } else symbol.size = size;\n      }\n      (graphic as any)._pulseFrame = this.clock.request(animate);\n    };\n    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n      if (interval != null) this.clock.clearInterval(interval); // Compatibility with pre-update graphics.\n      if (this.layer) this.layer.remove(this.bindings.graphic);\n      else this.view?.graphics?.remove(this.bindings.graphic);\n      this.bindings.graphic = null;\n    }\n    if (this.layer) {\n      this.view?.map?.remove(this.layer);\n      this.layer.destroy();\n    }\n    this.layer = null; this.view = null;\n  }\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "SceneView must render the on-the-ground Graphic itself."
      ],
      "requiredOccurrences": [
        {
          "text": "SceneView must render the on-the-ground Graphic itself.",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "tests/selectionPulseGround.test.cjs",
      "content": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,add(){},remove(){},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:()=>frame(300),counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');assert.equal(x.layers[0].visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,12);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,1);assert.equal(x.layers[0].elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers[0].visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = '3d-ground-pulse-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-3d-ground-pulse.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited native selection references remain)');
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
    console.log(uninstall ? '3D ground pulse is already uninstalled. No files changed.' : '3D ground pulse is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: '3d-ground-pulse', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('3D ground pulse ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. The 3D pulse now uses native ground draping; 2D keeps its overlay.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
