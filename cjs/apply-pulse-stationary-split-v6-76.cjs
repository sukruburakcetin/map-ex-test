#!/usr/bin/env node
'use strict';
/**
 * Stationary split diagnostic v6.76. Compatible current v6 sources.
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
              "before": "    return graphic;\n }\n\n /** Temporary opt-in diagnostic; never changes selection or hover decisions. */\n diagnosticBlocks(view: V, kind: 'cone' | 'settled'): boolean {\n  return this.probe?.blocksSceneWork(view, kind) ?? false;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n",
              "after": "    return graphic;\n }\n\n /** Temporary opt-in diagnostic; never changes selection or hover decisions. */\n diagnosticBlocks(view: V, kind: 'cone' | 'settled' | 'coverage' | 'anchor' | 'preview'): boolean {\n  return this.probe?.blocksSceneWork(view, kind) ?? false;\n }\n\n /** Remove the overlay, cancel animation/legacy interval and destroy the layer in its original view. */\n"
            },
            {
              "label": "cached pulse symbols 2",
              "before": " private pooledAssignments = 0;\n private unexpectedAssignments = 0;\n private pool: Set<any> | null = null;\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private scenePause: 'off' | 'cone' | 'settled' | 'both' = 'off';\n pauseSceneWork = (mode: 'off' | 'cone' | 'settled' | 'both' = 'both') => {\n  if (!['off', 'cone', 'settled', 'both'].includes(mode)) throw new Error('Use off, cone, settled or both');\n  this.scenePause = mode; this.record('scene-work-pause', mode); return mode;\n };\n blocksSceneWork(view: any, kind: 'cone' | 'settled'): boolean {\n  if (this.owner?.view !== view || (this.scenePause !== 'both' && this.scenePause !== kind)) return false;\n  this.context('skipped:' + kind); return true;\n }\n private factories: PulseFactories<any, any> | null = null;\n",
              "after": " private pooledAssignments = 0;\n private unexpectedAssignments = 0;\n private pool: Set<any> | null = null;\n private owner: { view: any; layer: any; graphic: any } | null = null;\n private scenePause: 'off' | 'cone' | 'settled' | 'both' | 'coverage' | 'anchor' | 'preview' = 'off';\n pauseSceneWork = (mode: 'off' | 'cone' | 'settled' | 'both' | 'coverage' | 'anchor' | 'preview' = 'both') => {\n  if (!['off', 'cone', 'settled', 'both', 'coverage', 'anchor', 'preview'].includes(mode)) throw new Error('Use off, cone, settled, both, coverage, anchor or preview');\n  this.scenePause = mode; this.record('scene-work-pause', mode); return mode;\n };\n blocksSceneWork(view: any, kind: 'cone' | 'settled' | 'coverage' | 'anchor' | 'preview'): boolean {\n  if (this.owner?.view !== view || (this.scenePause !== 'both' && this.scenePause !== kind)) return false;\n  this.context('skipped:' + kind); return true;\n }\n private factories: PulseFactories<any, any> | null = null;\n"
            },
            {
              "label": "cached pulse symbols 3",
              "before": "  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  // Export history on demand; console logging can itself disturb animation timing.\n }\n report = () => ({ mode: '3d-scene-work-v75', sceneWorkPause: this.scenePause, comparison: this.comparisonReport(), isolation: this.isolationReport(), context: { attachments: this.attachments, counts: { ...this.contextCounts } }, animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.contextCounts = {}; this.contextLast = {}; this.attachments = this.owner ? 1 : 0; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => event === 'view:updating' ? this.context(event) : this.record(event));\n",
              "after": "  const entry = { timeMs: Math.round(typeof performance !== 'undefined' ? performance.now() : Date.now()), event, ...(label ? { label: label.slice(0, 80) } : {}), ...this.snapshot() };\n  this.events.push(entry); if (this.events.length > 200) this.events.shift();\n  // Export history on demand; console logging can itself disturb animation timing.\n }\n report = () => ({ mode: '3d-stationary-split-v76', sceneWorkPause: this.scenePause, comparison: this.comparisonReport(), isolation: this.isolationReport(), context: { attachments: this.attachments, counts: { ...this.contextCounts } }, animation: { sizeUpdates: this.sizeUpdates, minSize: Number.isFinite(this.minSize) ? this.minSize : null, maxSize: Number.isFinite(this.maxSize) ? this.maxSize : null, symbolReplacements: this.symbolReplacements, pooledSymbolAssignments: this.pooledAssignments, unexpectedSymbolAssignments: this.unexpectedAssignments, poolSize: this.pool?.size ?? 0 }, current: this.snapshot(), events: this.events.map(event => ({ ...event })) });\n mark = (label = 'blink observed') => { this.record('manual-mark', String(label)); };\n clear = () => { this.events = []; this.contextCounts = {}; this.contextLast = {}; this.attachments = this.owner ? 1 : 0; this.sizeUpdates = 0; this.minSize = Infinity; this.maxSize = -Infinity; this.symbolReplacements = 0; this.pooledAssignments = 0; this.unexpectedAssignments = 0; this.record('cleared'); };\n private watch(target: any, property: string, event: string): void {\n  const handle = target?.watch?.(property, () => event === 'view:updating' ? this.context(event) : this.record(event));\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "cached pulse symbols 1",
              "before": "            const stateFilter = this.state.turboFilterUsername.trim();\n            const configFilter = this.props.config.turboCreator || \"\";\n            const effectiveFilter = stateFilter || configFilter;\n\n            if (effectiveFilter) {\n              await this.enableTurboCoverageLayer(effectiveFilter);\n            } else {\n              await this.enableTurboCoverageLayer();\n            }\n            this.refreshActivePulseAnchor(view);\n            if (this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)\n              void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);\n          }\n        }, TIMING.TURBO_DEBOUNCE_MS),\n      );\n",
              "after": "            const stateFilter = this.state.turboFilterUsername.trim();\n            const configFilter = this.props.config.turboCreator || \"\";\n            const effectiveFilter = stateFilter || configFilter;\n\n            if (!this._selectionPulse?.diagnosticBlocks(view, 'coverage')) {\n              if (effectiveFilter) {\n                await this.enableTurboCoverageLayer(effectiveFilter);\n              } else {\n                await this.enableTurboCoverageLayer();\n              }\n            }\n            if (!this._selectionPulse?.diagnosticBlocks(view, 'anchor')) this.refreshActivePulseAnchor(view);\n            if (!this._selectionPulse?.diagnosticBlocks(view, 'preview') && this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)\n              void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);\n          }\n        }, TIMING.TURBO_DEBOUNCE_MS),\n      );\n"
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
              "before": "\ntest('fresh comparison clones its own symbols, omits source Z and restores on disposal',()=>{const g=watchable({geometry:{longitude:1,latitude:2,z:300},symbol:{symbolLayers:[{size:12}]}}),layer=watchable({visible:true,graphics:collection([g])}),layers=collection([layer]);layers.add=x=>layers.items.push(x);const view={type:'3d',map:{layers,add:x=>layers.add(x),remove:x=>layers.remove(x)}};let fresh,created;function symbol(size){return {symbolLayers:[{size}],clone(){return symbol(this.symbolLayers[0].size)}}}const factories={point:p=>p,layer:p=>(created={...p,visible:true,graphics:collection([]),add(g){this.graphics.items.push(g)},destroy(){this.destroyed=true}}),graphic:p=>(fresh={...p,symbol:symbol(10)})};const probe=new PulseVisibilityProbe();probe.attach(view,layer,g,undefined,factories,()=>0);probe.compare();assert.equal(layer.visible,false);assert.equal(fresh.geometry.z,undefined);assert.equal(fresh.attributes,undefined);assert.equal(layers.includes(created),true);assert.equal(probe.tickComparison(600),true);assert.equal(fresh.symbol.symbolLayers[0].size,14);assert.equal(g.symbol.symbolLayers[0].size,12);assert.equal(probe.report().comparison.assignments,1);probe.restore();assert.equal(layer.visible,true);assert.equal(created.destroyed,true);assert.equal(layers.includes(created),false);assert.equal(probe.tickComparison(700),false);probe.compare();probe.stop();assert.equal(layer.visible,true);assert.equal(created.destroyed,true);assert.equal(probe.report().comparison.active,false)});\n\ntest('scene pause is opt-in, owner-scoped, counted and cleared by restore/disposal',()=>{const g=watchable({symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},p=new PulseVisibilityProbe();p.attach(view,layer,g);assert.equal(p.blocksSceneWork(view,'cone'),false);p.pauseSceneWork('cone');assert.equal(p.blocksSceneWork(view,'cone'),true);assert.equal(p.blocksSceneWork(view,'settled'),false);assert.equal(p.blocksSceneWork({},'cone'),false);assert.equal(p.report().context.counts['skipped:cone'],1);p.pauseSceneWork();assert.equal(p.blocksSceneWork(view,'settled'),true);p.restore();assert.equal(p.blocksSceneWork(view,'cone'),false);p.pauseSceneWork('both');p.stop();assert.equal(p.report().sceneWorkPause,'off');assert.throws(()=>p.pauseSceneWork('invalid'))});\n",
              "after": "\ntest('fresh comparison clones its own symbols, omits source Z and restores on disposal',()=>{const g=watchable({geometry:{longitude:1,latitude:2,z:300},symbol:{symbolLayers:[{size:12}]}}),layer=watchable({visible:true,graphics:collection([g])}),layers=collection([layer]);layers.add=x=>layers.items.push(x);const view={type:'3d',map:{layers,add:x=>layers.add(x),remove:x=>layers.remove(x)}};let fresh,created;function symbol(size){return {symbolLayers:[{size}],clone(){return symbol(this.symbolLayers[0].size)}}}const factories={point:p=>p,layer:p=>(created={...p,visible:true,graphics:collection([]),add(g){this.graphics.items.push(g)},destroy(){this.destroyed=true}}),graphic:p=>(fresh={...p,symbol:symbol(10)})};const probe=new PulseVisibilityProbe();probe.attach(view,layer,g,undefined,factories,()=>0);probe.compare();assert.equal(layer.visible,false);assert.equal(fresh.geometry.z,undefined);assert.equal(fresh.attributes,undefined);assert.equal(layers.includes(created),true);assert.equal(probe.tickComparison(600),true);assert.equal(fresh.symbol.symbolLayers[0].size,14);assert.equal(g.symbol.symbolLayers[0].size,12);assert.equal(probe.report().comparison.assignments,1);probe.restore();assert.equal(layer.visible,true);assert.equal(created.destroyed,true);assert.equal(layers.includes(created),false);assert.equal(probe.tickComparison(700),false);probe.compare();probe.stop();assert.equal(layer.visible,true);assert.equal(created.destroyed,true);assert.equal(probe.report().comparison.active,false)});\n\ntest('scene pause is opt-in, owner-scoped, counted and cleared by restore/disposal',()=>{const g=watchable({symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},p=new PulseVisibilityProbe();p.attach(view,layer,g);assert.equal(p.blocksSceneWork(view,'cone'),false);p.pauseSceneWork('cone');assert.equal(p.blocksSceneWork(view,'cone'),true);assert.equal(p.blocksSceneWork(view,'settled'),false);assert.equal(p.blocksSceneWork({},'cone'),false);assert.equal(p.report().context.counts['skipped:cone'],1);p.pauseSceneWork();assert.equal(p.blocksSceneWork(view,'settled'),true);p.restore();assert.equal(p.blocksSceneWork(view,'cone'),false);p.pauseSceneWork('both');p.stop();assert.equal(p.report().sceneWorkPause,'off');assert.throws(()=>p.pauseSceneWork('invalid'))});\n\ntest('stationary stage pauses block only the named stage',()=>{const g=watchable({symbol:{symbolLayers:[{size:12}]}}),layer=watchable({graphics:collection([g])}),view={type:'3d',map:{layers:collection([layer])}},p=new PulseVisibilityProbe();p.attach(view,layer,g);for(const stage of ['coverage','anchor','preview']){p.pauseSceneWork(stage);for(const kind of ['cone','settled','coverage','anchor','preview'])assert.equal(p.blocksSceneWork(view,kind),kind===stage)}p.restore();for(const kind of ['coverage','anchor','preview'])assert.equal(p.blocksSceneWork(view,kind),false);p.stop()});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/PULSE-STATIONARY-SPLIT.md",
      "content": "# v6.76 stationary stage diagnostic\nRequires v6.75, rebuild/restart and hard-refresh. Mode: 3d-stationary-split-v76.\nAdds pauseSceneWork('coverage'), ('anchor'), ('preview'). Only the named stage in the Turbo stationary callback is skipped; cone remains enabled. These controls do not suppress calls to these functions from other paths, or cancel already-running work. Default off, automatically reset by restore/disposal. No production fix or selection/hover algorithm changes.\n\nFor each test start fresh: isolate(), compare(), pauseSceneWork('anchor'), clear(). Keep the same image selected, playback stopped. Rotate camera to prior problematic angle and wait stationary 30 seconds. Export report and observation. Then restart with isolate(), compare(), pauseSceneWork('coverage'), clear(). Label reports anchor paused / coverage paused. These fresh comparison cycles prevent carrying over an already flickering temporary marker. Do not use restore between command setup and camera test; it resets the pause.\n\nThird stage preview is independently pausable if neither result isolates the problem; it is not silently grouped with coverage or anchor. Use restore() afterward. Report skipped:<stage> counts verify guard execution; skipped counts do not prove a graphics operation would have been necessary or caused the blink. Coverage refresh may have internal effects beyond its name, so a successful test identifies a call path, not yet the exact rendering fault.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'pulse-stationary-split-v6-76-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.76 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'pulse-stationary-split-v6-76' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.76 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.76 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.76 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-pulse-stationary-split-v6-76.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Stationary split diagnostic v6.76 is already installed. No files changed.');
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
  const manifest = { installer: 'pulse-stationary-split-v6-76', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Stationary split diagnostic v6.76 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
