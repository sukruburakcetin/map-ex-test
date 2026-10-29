#!/usr/bin/env node
'use strict';
/**
 * Brief outline halo v6.67. Compatible current v6 sources.
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
              "label": "brief outline halo 1",
              "before": "    if (view.type === '3d') {\n      const rgb = Array.isArray(baseColor) ? baseColor.slice(0, 3) : [0, 255, 0];\n      this.halo = this.factories.graphic({ geometry: graphic.geometry, symbol: {\n        type: 'point-3d', disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [...rgb, 0.08] }, size: 14,\n          outline: { color: [...rgb, 0.6], size: 1 }, occludedVisibility: { mode: 'visible' } }],\n      } });\n      this.haloLayer = this.factories.layer({ id: 'mapillary-active-selection-halo', title: 'Mapillary Pulse Halo', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      view.map!.add(this.haloLayer); this.haloLayer.add(this.halo);\n",
              "after": "    if (view.type === '3d') {\n      const rgb = Array.isArray(baseColor) ? baseColor.slice(0, 3) : [0, 255, 0];\n      this.halo = this.factories.graphic({ geometry: graphic.geometry, symbol: {\n        type: 'point-3d', disableDepthTestDistance: Number.POSITIVE_INFINITY,\n        symbolLayers: [{ type: 'icon', resource: { primitive: 'circle' }, material: { color: [...rgb, 0] }, size: 14,\n          outline: { color: [...rgb, 0.6], size: 1 }, occludedVisibility: { mode: 'visible' } }],\n      } });\n      this.haloLayer = this.factories.layer({ id: 'mapillary-active-selection-halo', title: 'Mapillary Pulse Halo', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      view.map!.add(this.haloLayer); this.haloLayer.add(this.halo);\n"
            },
            {
              "label": "brief outline halo 2",
              "before": "    let lastSymbolUpdate = -Infinity;\n    let lastSymbolSize = NaN;\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n",
              "after": "    let lastSymbolUpdate = -Infinity;\n    let lastSymbolSize = NaN;\n    const animate = (now: number) => {\n      if (this.bindings.graphic !== graphic || this.view !== view || view.destroyed) return;\n      if (view.type === '3d' && now - started >= 2400) {\n        this.clearHalo();\n        (graphic as any)._pulseFrame = null;\n        return;\n      }\n      const size = 12 - 2 * Math.cos((now - started) * Math.PI * 2 / 1200);\n      const overlay = this.overlay;\n      if (overlay) {\n        const pixel = view.toScreen(graphic.geometry);\n"
            },
            {
              "label": "brief outline halo 3",
              "before": "    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    if (this.halo) { this.haloLayer?.remove(this.halo); this.halo = null; }\n    if (this.haloLayer) { this.view?.map?.remove(this.haloLayer); this.haloLayer.destroy(); this.haloLayer = null; }\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n",
              "after": "    (graphic as any)._pulseFrame = this.clock.request(animate);\n    return graphic;\n }\n\n /** End only the transient halo; preserve the centre and its corrected anchor. */\n private clearHalo(): void {\n    if (this.halo) { this.haloLayer?.remove(this.halo); this.halo = null; }\n    if (this.haloLayer) { this.view?.map?.remove(this.haloLayer); this.haloLayer.destroy(); this.haloLayer = null; }\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n dispose(): void {\n    this.overlay?.remove(); this.overlay = null;\n    this.clearHalo();\n    if (this.bindings.graphic) {\n      const frame = (this.bindings.graphic as any)._pulseFrame;\n      if (frame != null) this.clock.cancel(frame);\n      const interval = (this.bindings.graphic as any)._pulseInterval;\n"
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
              "label": "brief outline halo 1",
              "before": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,items:[],add(g){this.items.push(g)},remove(g){this.items=this.items.filter(x=>x!==g)},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame(now),counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').elevationInfo.mode,'on-the-ground');assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,10);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,2);assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D keeps an immutable centred core and animates only the retained halo',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:500}},1,2,[0,255,0,1],'A'),initial=g.symbol,anchor=g.geometry,halo=x.layers.find(l=>l.id==='mapillary-active-selection-halo').items[0];assert.notEqual(halo,g);x.tick(0);const first=halo.symbol;x.tick(16);assert.equal(halo.symbol,first);x.tick(600);assert.notEqual(halo.symbol,first);assert.equal(halo.symbol.symbolLayers[0].size,18);x.tick(1200);assert.equal(halo.symbol.symbolLayers[0].size,14);assert.equal(g.symbol,initial);assert.equal(g.geometry,anchor);assert.equal(g.symbol.verticalOffset,undefined);const moved={x:3,y:4,z:60};x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A');assert.equal(g.geometry,moved);assert.equal(halo.geometry,moved);assert.equal(g.symbol,initial);assert.equal(x.layers.length,2);assert.equal(x.layers[0].items.length,1);assert.equal(x.layers[1].items.length,1);x.owner.dispose();assert.equal(x.layers[0].items.length,0);assert.equal(x.layers[1].items.length,0)});\n",
              "after": "/** Verify the actual pulse owner delegates 3D terrain placement to the SDK. */\nconst fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/SelectionPulse.ts'),'utf8');const m={exports:{}};\nnew Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({selectionPulseOverlayStyle:()=>({})}),m,m.exports);\nfunction setup(type){let frame,overlays=0,projections=0,canceled=0,requests=0;const bindings={graphic:null},layers=[];const owner=new m.exports.SelectionPulse(bindings,{point:p=>({...p}),graphic:p=>({...p}),layer:p=>({...p,visible:true,items:[],add(g){this.items.push(g)},remove(g){this.items=this.items.filter(x=>x!==g)},destroy(){this.destroyed=true}}),overlay:()=>{overlays++;return{style:{},setAttribute(){},remove(){}}}},{now:()=>0,request:cb=>(requests++,frame=cb,1),cancel:()=>canceled++,clearInterval(){}});const view={type,width:100,height:100,map:{add:l=>layers.push(l),remove(){}},graphics:{remove(){}},container:{appendChild(){}},toScreen:()=>{projections++;return{x:50,y:50}},groundView:{elevationSampler:{queryElevation(){throw Error('No per-frame terrain sampling')}}}};return{owner,bindings,view,layers,tick:(now=300)=>frame(now),requests:()=>requests,counts:()=>({overlays,projections,canceled})}}\ntest('3D uses visible ground-draped pulse even with an elevated coverage anchor',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:100000}},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').elevationInfo.mode,'on-the-ground');assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').visible,true);assert.equal(x.owner.overlay,null);assert.equal(g.symbol.symbolLayers[0].size,10);assert.deepEqual(x.counts(),{overlays:0,projections:0,canceled:0});x.owner.dispose();assert.equal(x.counts().canceled,1)});\ntest('same-image updates keep 3D ground placement and reuse the pulse',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A');assert.equal(x.owner.show(x.view,{geometry:{z:50000}},1,2,[0,255,0,1],'A'),g);assert.equal(x.layers.length,2);assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').elevationInfo.mode,'on-the-ground');x.tick();assert.equal(x.counts().projections,0)});\ntest('2D keeps its screen overlay and pulse projection',()=>{const x=setup('2d');x.owner.show(x.view,{},1,2,[0,255,0,1],'A');x.tick();assert.equal(x.layers.find(l=>l.id==='mapillary-active-selection').visible,false);assert.equal(x.counts().overlays,1);assert.equal(x.counts().projections,1);assert.equal(x.owner.overlay.style.left,'50px')});\n\ntest('3D keeps an immutable centred core and animates only the retained halo',()=>{const x=setup('3d'),g=x.owner.show(x.view,{geometry:{x:1,y:2,z:500}},1,2,[0,255,0,1],'A'),initial=g.symbol,anchor=g.geometry,halo=x.layers.find(l=>l.id==='mapillary-active-selection-halo').items[0];assert.notEqual(halo,g);x.tick(0);const first=halo.symbol;x.tick(16);assert.equal(halo.symbol,first);x.tick(600);assert.notEqual(halo.symbol,first);assert.equal(halo.symbol.symbolLayers[0].size,18);x.tick(1200);assert.equal(halo.symbol.symbolLayers[0].size,14);assert.equal(g.symbol,initial);assert.equal(g.geometry,anchor);assert.equal(g.symbol.verticalOffset,undefined);const moved={x:3,y:4,z:60};x.owner.show(x.view,{geometry:moved},1,2,[0,255,0,1],'A');assert.equal(g.geometry,moved);assert.equal(halo.geometry,moved);assert.equal(g.symbol,initial);assert.equal(x.layers.length,2);assert.equal(x.layers[0].items.length,1);assert.equal(x.layers[1].items.length,1);x.owner.dispose();assert.equal(x.layers[0].items.length,0);assert.equal(x.layers[1].items.length,0)});\n\ntest('outline-only 3D halo ends after two cycles, releases its layer and never restarts for same-image corrections',()=>{const x=setup('3d'),g=x.owner.show(x.view,{},1,2,[0,255,0,1],'A'),symbol=g.symbol,haloLayer=x.layers.find(l=>l.id==='mapillary-active-selection-halo'),halo=haloLayer.items[0];assert.equal(halo.symbol.symbolLayers[0].material.color[3],0);x.tick(2399);assert.equal(haloLayer.destroyed,undefined);const requests=x.requests();x.tick(2400);assert.equal(x.requests(),requests);assert.equal(haloLayer.destroyed,true);assert.equal(haloLayer.items.length,0);assert.equal(g.symbol,symbol);assert.equal(g._pulseFrame,null);const corrected={x:3,y:4};assert.equal(x.owner.show(x.view,{geometry:corrected},1,2,[0,255,0,1],'A'),g);assert.equal(g.geometry,corrected);assert.equal(x.requests(),requests);assert.equal(x.layers.length,2);x.owner.show(x.view,{},3,4,[0,255,0,1],'B');assert.equal(x.requests(),requests+1);assert.equal(x.layers.length,4);x.owner.dispose()});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/BRIEF-OUTLINE-HALO.md",
      "content": "# Brief outline-only 3D halo · v6.67\n\nApply after v6.66. Retains v6.66's stable green centre, independent halo layer, zero vertical lift and fly-in anchor recovery.\n\nThe 3D halo now has a transparent fill and green outline only. It pulses for two existing 1200ms cycles (2.4 seconds total), then its Graphic/layer are removed and no further animation frame is scheduled. The opaque green/white centre remains unchanged and visible. A same-image anchor correction preserves the settled state; displaying a different image starts a new brief halo. During continuous playback, each newly displayed image uses this same rule; this release does not introduce a playback-specific animation mode.\n\nThe existing 2D DOM pulse is unchanged. No picking, hover, blue selection, bearing, cone or anchor-recovery code changes. This patch adds no timers, requests or extra animation loops.\n\n## Verify\n\n- Select an image in 3D: see two outline pulses, then only the steady centre.\n- Wait or correct the same image's tile anchor: the halo should not restart.\n- Select another image: the brief halo should play again.\n- Zoom/tilt after settling: the centre stays ground-aligned; no removed halo should return.\n- Toggle fullscreen or switch map modes and check cleanup.\n\nThe HTML/GIF preview illustrates the appearance, not actual SceneView rendering. The GIF loops for demonstration; the widget stops after the two cycles for each new image. Check live flickering on the target browser/device.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'brief-outline-halo-v6-67-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.67 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'brief-outline-halo-v6-67' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.67 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.67 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.67 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-brief-outline-halo-v6-67.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Brief outline halo v6.67 is already installed. No files changed.');
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
  const manifest = { installer: 'brief-outline-halo-v6-67', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Brief outline halo v6.67 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
