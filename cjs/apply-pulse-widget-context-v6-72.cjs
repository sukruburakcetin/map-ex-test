#!/usr/bin/env node
'use strict';
/**
 * Widget pulse context v6.72. Compatible current v6 sources.
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
              "before": " private pooledAssignments = 0;\n private unexpectedAssignments = 0;\n private pool: Set<any> | null = null;\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private revision = 0;\n private layerView: any = null;\n private inMap: boolean | undefined;\n private inLayer: boolean | undefined;\n",
              "after": " private pooledAssignments = 0;\n private unexpectedAssignments = 0;\n private pool: Set<any> | null = null;\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private contextCounts: Record<string, number> = {};\n private contextLast: Record<string, number> = {};\n private attachments = 0;\n private geometryPrevious: any = null;\n private context(event: string): void {\n  this.contextCounts[event] = (this.contextCounts[event] || 0) + 1;\n  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();\n  // Preserve bounded history without logging every graphics update during playback.\n  if (now - (this.contextLast[event] ?? -Infinity) >= 250) {\n   this.contextLast[event] = now; this.record(event);\n  }\n }\n private revision = 0;\n private layerView: any = null;\n private inMap: boolean | undefined;\n private inLayer: boolean | undefined;\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": "   ++this.unexpectedAssignments;\n  }\n  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  if (event !== 'geometry-change' && !event.startsWith('layer-view:')) console.info('[Mapillary pulse probe]', entry);\n }\n report = () => ({ mode: '3d-cached-symbols', animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => this.record(event));\n  if (handle?.remove) this.handles.push(handle);\n }\n attach(view: any, layer: any, graphic: any, pool?: readonly any[]): void {\n  this.stop('replaced'); this.owner = { view, layer, graphic }; this.pool = pool ? new Set(pool) : null; const revision = ++this.revision;\n  if (typeof window !== 'undefined') (window as any).__mapillaryPulseProbe = { report: this.report, mark: this.mark, clear: this.clear };\n  this.watch(graphic, 'symbol', 'symbol-change'); this.watch(graphic, 'visible', 'graphic-visibility'); this.watch(graphic, 'geometry', 'geometry-change');\n  this.watch(layer, 'visible', 'layer-visibility'); this.watch(layer, 'opacity', 'layer-opacity'); this.watch(layer, 'destroyed', 'layer-destroyed');\n  const icon = graphic.symbol?.symbolLayers?.getItemAt?.(0) || graphic.symbol?.symbolLayers?.[0];\n  const sizeHandle = icon?.watch?.('size', () => {\n   ++this.sizeUpdates; if (Number.isFinite(icon.size)) { this.minSize = Math.min(this.minSize, icon.size); this.maxSize = Math.max(this.maxSize, icon.size); }\n",
              "after": "   ++this.unexpectedAssignments;\n  }\n  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  // Export history on demand; console logging can itself disturb animation timing.\n }\n report = () => ({ mode: '3d-widget-context-v72', context: { attachments: this.attachments, counts: { ...this.contextCounts } }, animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.contextCounts = {}; this.contextLast = {}; this.attachments = this.owner ? 1 : 0; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => this.record(event));\n  if (handle?.remove) this.handles.push(handle);\n }\n attach(view: any, layer: any, graphic: any, pool?: readonly any[]): void {\n  this.stop('replaced'); this.owner = { view, layer, graphic }; ++this.attachments; this.geometryPrevious = graphic.geometry?.clone?.() ?? graphic.geometry; this.pool = pool ? new Set(pool) : null; const revision = ++this.revision;\n  if (typeof window !== 'undefined') (window as any).__mapillaryPulseProbe = { report: this.report, mark: this.mark, clear: this.clear };\n  this.watch(graphic, 'symbol', 'symbol-change'); this.watch(graphic, 'visible', 'graphic-visibility'); const geometryHandle = graphic.watch?.('geometry', () => {\n   const previous = this.geometryPrevious, current = graphic.geometry;\n   const equal = previous === current || (typeof previous?.equals === 'function' && previous.equals(current));\n   this.geometryPrevious = current?.clone?.() ?? current;\n   this.context(equal ? 'geometry-reassigned-equal' : 'geometry-position-change');\n  });\n  if (geometryHandle?.remove) this.handles.push(geometryHandle);\n  this.watch(layer, 'elevationInfo', 'elevation-info-change');\n  for (const property of ['stationary', 'updating', 'interacting', 'animation']) this.watch(view, property, 'view:' + property);\n  // Watch collection churn only, never inspect or modify selection/hover contents.\n  const watched = new Set<any>();\n  const observeCollection = (collection: any, event: string) => {\n   if (!collection?.on || watched.has(collection)) return;\n   watched.add(collection);\n   const handle = collection.on('change', () => this.context(event));\n   if (handle?.remove) this.handles.push(handle);\n  };\n  observeCollection(view.graphics, 'view-graphics-change');\n  const observeLayers = () => {\n   const layers = view.map?.allLayers || view.map?.layers;\n   layers?.forEach?.((other: any) => {\n    if (other !== layer) observeCollection(other.graphics, 'other-graphics-change');\n   });\n  };\n  observeLayers();\n  const layerHandle = (view.map?.allLayers || view.map?.layers)?.on?.('change', () => {\n   this.context('map-layers-change'); observeLayers();\n  });\n  if (layerHandle?.remove) this.handles.push(layerHandle);\n  this.watch(layer, 'visible', 'layer-visibility'); this.watch(layer, 'opacity', 'layer-opacity'); this.watch(layer, 'destroyed', 'layer-destroyed');\n  const icon = graphic.symbol?.symbolLayers?.getItemAt?.(0) || graphic.symbol?.symbolLayers?.[0];\n  const sizeHandle = icon?.watch?.('size', () => {\n   ++this.sizeUpdates; if (Number.isFinite(icon.size)) { this.minSize = Math.min(this.minSize, icon.size); this.maxSize = Math.max(this.maxSize, icon.size); }\n"
            },
            {
              "label": "cached pulse symbols 3",
              "before": "  } catch { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); }\n }\n stop(reason = 'stopped'): void {\n  if (this.owner) this.record(reason);\n  ++this.revision; this.handles.forEach(handle => handle.remove()); this.handles = []; this.owner = null; this.layerView = null; this.pool = null;\n }\n}\n",
              "after": "  } catch { if (revision === this.revision && this.owner) this.record('layer-view:unavailable'); }\n }\n stop(reason = 'stopped'): void {\n  if (this.owner) this.record(reason);\n  ++this.revision; this.handles.forEach(handle => handle.remove()); this.handles = []; this.owner = null; this.layerView = null; this.pool = null; this.geometryPrevious = null;\n }\n}\n"
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
              "before": "test('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();icon.size=14;icon.callbacks.get('size')();assert.equal(probe.report().animation.sizeUpdates,2);assert.equal(probe.report().animation.symbolReplacements,1);assert.equal(probe.report().animation.maxSize,14);layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n\ntest('known cached assignments aggregate without filling history; unknown symbols remain explicit',()=>{const log=console.info;console.info=()=>{};try{const a={symbolLayers:[{size:10}]},b={symbolLayers:[{size:14}]},g=watchable({symbol:a}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,g,[a,b]);for(let i=0;i<500;i++){g.symbol=i%2?a:b;g.callbacks.get('symbol')()}let report=probe.report();assert.equal(report.animation.pooledSymbolAssignments,500);assert.equal(report.animation.unexpectedSymbolAssignments,0);assert.equal(report.animation.poolSize,2);assert.equal(report.events.length,1);assert.equal(report.animation.minSize,10);assert.equal(report.animation.maxSize,14);g.symbol={symbolLayers:[{size:12}]};g.callbacks.get('symbol')();assert.equal(probe.report().animation.unexpectedSymbolAssignments,1);assert.equal(probe.report().events.at(-1).event,'symbol-change');probe.stop()}finally{console.info=log}});\n",
              "after": "test('probe records real symbol/visibility/membership events without retaining coordinates or image IDs',()=>{const log=console.info;console.info=()=>{};try{const icon=watchable({size:12}),graphic=watchable({visible:true,symbol:{symbolLayers:[icon]},geometry:{longitude:123},attributes:{image_id:'private'}}),layer=watchable({visible:true,opacity:1,graphics:collection([graphic])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,graphic);assert.equal(probe.report().current.graphicPresent,true);graphic.visible=false;graphic.callbacks.get('visible')();graphic.callbacks.get('symbol')();icon.size=14;icon.callbacks.get('size')();assert.equal(probe.report().animation.sizeUpdates,2);assert.equal(probe.report().animation.symbolReplacements,1);assert.equal(probe.report().animation.maxSize,14);layer.graphics.remove(graphic);view.map.layers.remove(layer);const report=probe.report();assert(report.events.some(e=>e.event==='symbol-change'));assert(report.events.some(e=>e.event==='graphic-visibility'&&!e.graphicVisible));assert(report.events.some(e=>e.event==='graphic-membership'&&!e.graphicPresent));assert(report.events.some(e=>e.event==='layer-membership'&&!e.layerPresent));assert(!JSON.stringify(report).includes('private'));assert(!JSON.stringify(report).includes('longitude'));for(let i=0;i<250;i++)probe.mark('test');assert.equal(probe.report().events.length,200);probe.stop();assert.equal(graphic.callbacks.size,0);assert.equal(icon.callbacks.size,0);assert.equal(layer.graphics.callbacks.size,0);assert.equal(view.map.layers.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\ntest('late layer-view attachment cannot recreate watchers after stop',async()=>{const log=console.info;console.info=()=>{};try{let resolve;const lv=watchable({visible:true,suspended:false}),g=watchable({symbol:{symbolLayers:[watchable({size:12})]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])},whenLayerView:()=>new Promise(r=>resolve=r)},probe=new PulseVisibilityProbe();probe.attach(view,layer,g);probe.stop();resolve(lv);await new Promise(r=>setImmediate(r));assert.equal(lv.callbacks.size,0);assert.equal(probe.report().current.active,false)}finally{console.info=log}});\n\ntest('known cached assignments aggregate without filling history; unknown symbols remain explicit',()=>{const log=console.info;console.info=()=>{};try{const a={symbolLayers:[{size:10}]},b={symbolLayers:[{size:14}]},g=watchable({symbol:a}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},probe=new PulseVisibilityProbe();probe.attach(view,layer,g,[a,b]);for(let i=0;i<500;i++){g.symbol=i%2?a:b;g.callbacks.get('symbol')()}let report=probe.report();assert.equal(report.animation.pooledSymbolAssignments,500);assert.equal(report.animation.unexpectedSymbolAssignments,0);assert.equal(report.animation.poolSize,2);assert.equal(report.events.length,1);assert.equal(report.animation.minSize,10);assert.equal(report.animation.maxSize,14);g.symbol={symbolLayers:[{size:12}]};g.callbacks.get('symbol')();assert.equal(probe.report().animation.unexpectedSymbolAssignments,1);assert.equal(probe.report().events.at(-1).event,'symbol-change');probe.stop()}finally{console.info=log}});\n\ntest('context separates equal anchors, bounds churn history and releases context watchers',()=>{const point=x=>({x,clone(){return point(x)},equals(other){return other?.x===x}});const g=watchable({geometry:point(1),symbol:{symbolLayers:[{size:12}]}}),other={graphics:collection([])},layers=collection([]);layers.forEach=cb=>layers.items.forEach(cb);const layer=watchable({graphics:collection([g])});layers.items.push(layer,other);const view=watchable({type:'3d',graphics:collection([]),map:{layers}}),probe=new PulseVisibilityProbe();probe.attach(view,layer,g);g.geometry=point(1);g.callbacks.get('geometry')();g.geometry=point(2);g.callbacks.get('geometry')();for(let i=0;i<1000;i++)for(const cb of other.graphics.callbacks)cb();const report=probe.report();assert.equal(report.context.counts['geometry-reassigned-equal'],1);assert.equal(report.context.counts['geometry-position-change'],1);assert.equal(report.context.counts['other-graphics-change'],1000);assert(report.events.length<20);assert.equal(report.context.attachments,1);probe.clear();assert.deepEqual(probe.report().context.counts,{});probe.stop();assert.equal(other.graphics.callbacks.size,0);assert.equal(view.callbacks.size,0);assert.equal(layers.callbacks.size,0)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/PULSE-WIDGET-CONTEXT.md",
      "content": "# Widget pulse context diagnostic (v6.72)\n\nRequires v6.71 installed. No animation, selection, hover, or routing changes.\nRecords marker geometry reassignment versus position changes (SDK geometry.equals), elevation settings, view transitions, map layer collection changes and graphics collection churn. Other-graphics events aggregate across layers; they do not identify an individual layer or prove causation. Property mutations inside other graphics are not monitored. Counts include every collection event; history for each context event is limited to one per 250 ms and 200 entries overall. No per-frame console logging. Geometry snapshots remain private and are never exported. No coordinates, image identifiers or service URLs are included.\n\nAfter applying and rebuilding, reproduce with one selected image first. In Chrome Console run:\n\n```js\nwindow.__mapillaryPulseProbe.clear()\n```\n\nWhen a blink occurs, run promptly:\n\n```js\nwindow.__mapillaryPulseProbe.mark('blink')\ncopy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))\n```\n\nPaste the report. Repeat with smooth pulsing for comparison. Image selection legitimately creates new owners; first keep the selected image fixed. The report cannot detect disappearing pixels by itself. This is temporary instrumentation, not a flicker fix. Uninstall with the same installer and --uninstall, then rebuild.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'pulse-widget-context-v6-72-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.72 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'pulse-widget-context-v6-72' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.72 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.72 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.72 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-pulse-widget-context-v6-72.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Widget pulse context v6.72 is already installed. No files changed.');
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
  const manifest = { installer: 'pulse-widget-context-v6-72', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Widget pulse context v6.72 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
