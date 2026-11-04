#!/usr/bin/env node
'use strict';
/**
 * Responsive loaded-route clicks. Compatible current v6 sources.
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
              "label": "Cooperative loaded-route click 1",
              "before": "import { coverageClickHitTest } from '../features/coverage/coverageClickDispatch';\nimport { CoverageHoverResume } from '../features/coverage/CoverageHoverResume';\nimport { hoverBearingImageId, HoverBearingHintCache } from '../features/imagery/hoverBearingTarget';\n",
              "after": "import { nearestLoadedFrame } from '../features/coverage/nearestLoadedFrame';\nimport { coverageClickHitTest } from '../features/coverage/coverageClickDispatch';\nimport { CoverageHoverResume } from '../features/coverage/CoverageHoverResume';\nimport { hoverBearingImageId, HoverBearingHintCache } from '../features/imagery/hoverBearingTarget';\n"
            },
            {
              "label": "Cooperative loaded-route click 2",
              "before": "          let imageId = attrs.image_id ? String(attrs.image_id) : undefined;\n          if (!imageId) {\n            const images = this.sequenceCoordsCache[seqId];\n            let closest = Infinity;\n            for (const image of images || []) {\n              const distance = distanceMeters(image.lat, image.lon, point.latitude, point.longitude);\n              if (distance < closest) { closest = distance; imageId = String(image.id); }\n            }\n          }\n          if (!imageId) {\n",
              "after": "          let imageId = attrs.image_id ? String(attrs.image_id) : undefined;\n          if (!imageId) {\n            const images = this.sequenceCoordsCache[seqId];\n            if (images?.length) {\n              const routeCurrent = () => clickCurrent() && this.sequenceCoordsCache[seqId] === images;\n              imageId = await nearestLoadedFrame(images, { lon: point.longitude, lat: point.latitude }, distanceMeters, routeCurrent);\n              if (!routeCurrent()) return;\n            }\n          }\n          if (!imageId) {\n"
            },
            {
              "label": "Cooperative loaded-route click 3",
              "before": "                  // Coverage hit tests can miss the thin active route at regional zooms.\n                  // For that same loaded sequence, resolve the click entirely in memory.\n                  if (attrs.turbo_representative && this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !!this._liveSequenceFrames.complete) {\n                    let closest = Infinity;\n                    for (const image of this.state.sequenceImages) {\n                      const distance = distanceMeters(image.lat, image.lon, point.latitude, point.longitude);\n                      if (distance < closest) { closest = distance; imageId = String(image.id); }\n                    }\n                  }\n                  const regionalLine = !!attrs.turbo_representative && view.zoom >= 6 && view.zoom < 14;\n                  // A sequence tile's image_id represents the whole line, not its clicked location.\n",
              "after": "                  // Coverage hit tests can miss the thin active route at regional zooms.\n                  // For that same loaded sequence, resolve the click entirely in memory.\n                  if (attrs.turbo_representative && this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !!this._liveSequenceFrames.complete) {\n                    const images = this.state.sequenceImages;\n                    const routeCurrent = () => coverageClickCurrent() && !pickController.signal.aborted &&\n                      this.state.sequenceId === seqId && this.state.sequenceImages === images && !!this._liveSequenceFrames.complete;\n                    const nearest = await nearestLoadedFrame(images, { lon: point.longitude, lat: point.latitude }, distanceMeters, routeCurrent);\n                    if (!routeCurrent()) return;\n                    if (nearest) imageId = nearest;\n                  }\n                  const regionalLine = !!attrs.turbo_representative && view.zoom >= 6 && view.zoom < 14;\n                  // A sequence tile's image_id represents the whole line, not its clicked location.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/coverageClickDispatch.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Cooperative loaded-route click 1",
              "before": "const owner = { exports: {} };\nnew Function('module', 'exports', compile(fs.readFileSync(path.join(__dirname, '../src/features/coverage/coverageClickDispatch.ts'), 'utf8')))(owner, owner.exports);\nconst { coverageClickHitTest } = owner.exports;\nconst source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');\nconst syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);\nlet click;\n",
              "after": "const owner = { exports: {} };\nnew Function('module', 'exports', compile(fs.readFileSync(path.join(__dirname, '../src/features/coverage/coverageClickDispatch.ts'), 'utf8')))(owner, owner.exports);\nconst { coverageClickHitTest } = owner.exports;\nconst nearestModule = { exports: {} };\nnew Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/coverage/nearestLoadedFrame.ts'),'utf8')))(nearestModule,nearestModule.exports);\nconst { nearestLoadedFrame } = nearestModule.exports;\nconst source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');\nconst syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);\nlet click;\n"
            },
            {
              "label": "Cooperative loaded-route click 2",
              "before": "    widget._turboHoveredScreen = { x: 100, y: 100 };\n    widget._currentHoveredFeatureId = 'representative';\n  }\n  const handler = new Function('view', 'coverageClickHitTest', 'TURBO_LIMITS', 'LAYER_IDS', 'webMercatorUtils', 'distanceMeters', 'GRAPH_API', compile('return (' + click.getText(syntax) + ');')).call(widget, view, coverageClickHitTest,\n    { pickRadiusPx: 8 }, { OBJECTS_FL: 'objects', TRAFFIC_SIGNS_FL: 'signs', TURBO_COVERAGE: 'coverage' },\n    { webMercatorToGeographic: point => point }, () => 0, { BASE: 'unused' });\n  return { widget, view, trace, handler: () => handler({ x: 100, y: 100, stopPropagation() {} }), release };\n",
              "after": "    widget._turboHoveredScreen = { x: 100, y: 100 };\n    widget._currentHoveredFeatureId = 'representative';\n  }\n  const handler = new Function('view', 'coverageClickHitTest', 'nearestLoadedFrame', 'TURBO_LIMITS', 'LAYER_IDS', 'webMercatorUtils', 'distanceMeters', 'GRAPH_API', compile('return (' + click.getText(syntax) + ');')).call(widget, view, coverageClickHitTest, nearestLoadedFrame,\n    { pickRadiusPx: 8 }, { OBJECTS_FL: 'objects', TRAFFIC_SIGNS_FL: 'signs', TURBO_COVERAGE: 'coverage' },\n    { webMercatorToGeographic: point => point }, () => 0, { BASE: 'unused' });\n  return { widget, view, trace, handler: () => handler({ x: 100, y: 100, stopPropagation() {} }), release };\n"
            },
            {
              "label": "Cooperative loaded-route click 3",
              "before": "  release('late-image'); await older;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\n",
              "after": "  release('late-image'); await older;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\n\ntest('a loaded regional route can be superseded while its cooperative scan yields', async () => {\n  const x = setup({ regional: true });\n  const route = Array.from({ length: 10000 }, (_,i) => ({ id: String(i), lon: i, lat: 0 }));\n  x.widget._coverageFrameHoverTarget = { sequenceId: 'sequence' };\n  x.widget.getTurboOrganizationId = () => undefined;\n  x.widget.state.sequenceId = 'sequence'; x.widget.state.sequenceImages = route;\n  x.widget._liveSequenceFrames = { complete: route };\n  const older = x.handler(); x.release({ results: [] });\n  // Drain callback microtasks until the long scan reaches its first timer yield.\n  for (let i=0;i<12;i++) await Promise.resolve();\n  x.widget.state.routePickMode = 'A'; x.widget.setRoutePoint = () => {};\n  await x.handler(); await older;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\ntest('a blue-route polyline uses the same first nearest frame without a full route download', async () => {\n  const x = setup({ hovered: false });\n  x.widget.sequenceCoordsCache = { sequence: [{ id: 'first', lon: 1, lat: 2 },{ id: 'second',lon:2,lat:2 }] };\n  const work = x.handler();\n  x.release({ results: [{ layer: { id: 'overlay' }, graphic: { __isSequenceOverlay: true, geometry: { type: 'polyline' }, attributes: { sequenceId: 'sequence' } } }] });\n  await work; assert.deepEqual(x.trace.at(-1), ['open image','sequence','first']);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/nearestLoadedFrame.ts",
      "content": "export interface LoadedFramePoint { id: string; lon: number; lat: number }\n\n/** Match the existing nearest-frame policy without monopolizing a long browser task.\n * Small routes scan without timers. Large scans yield after 4,096 frames or an\n * eight-millisecond slice, retaining source order and first-match tie behavior.\n * The caller owns selection/view/route identity; obsolete scans return no result.\n * This helper performs no requests, sampling, indexing or persistent caching.\n */\nexport async function nearestLoadedFrame(frames: readonly LoadedFramePoint[],\n  location: { lon: number; lat: number },\n  distance: (lat1: number, lon1: number, lat2: number, lon2: number) => number,\n  current: () => boolean): Promise<string | undefined> {\n  if (!current()) return undefined;\n  let nearest: string | undefined, best = Infinity;\n  let deadline = performance.now() + 8;\n  for (let index = 0; index < frames.length; index++) {\n    if (index && (index % 4096 === 0 || (index % 256 === 0 && performance.now() >= deadline))) {\n      await new Promise<void>(resolve => setTimeout(resolve, 0));\n      if (!current()) return undefined;\n      deadline = performance.now() + 8;\n    }\n    const frame = frames[index];\n    const value = distance(frame.lat, frame.lon, location.lat, location.lon);\n    if (value < best) { best = value; nearest = String(frame.id); }\n  }\n  return current() ? nearest : undefined;\n}\n"
    },
    {
      "file": "tests/nearestLoadedFrame.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compiled=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/coverage/nearestLoadedFrame.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction setup(){let now=0,yields=0;const jobs=[],m={exports:{}};new Function('module','exports','performance','setTimeout',compiled)(m,m.exports,{now:()=>now},fn=>{yields++;jobs.push(fn)});return{nearest:m.exports.nearestLoadedFrame,jobs,yields:()=>yields,time:ms=>now=ms,async flush(){while(jobs.length){jobs.shift()();await Promise.resolve();}}};}\nconst frames=count=>Array.from({length:count},(_,i)=>({id:String(i),lon:i,lat:0}));\nconst distance=(_lat,lon,_targetLat,targetLon)=>Math.abs(lon-targetLon);\ntest('short routes have no timer and preserve nearest identity and first-match ties',async()=>{const x=setup();assert.equal(await x.nearest(frames(10),{lon:4.5,lat:0},distance,()=>true),'4');assert.equal(x.yields(),0);});\ntest('a 10,000-frame route yields and still considers the last frame',async()=>{const x=setup();let scans=0;const result=x.nearest(frames(10000),{lon:9999,lat:0},(...args)=>{scans++;return distance(...args)},()=>true);assert.equal(scans,4096);await x.flush();assert.equal(await result,'9999');assert.equal(scans,10000);assert.equal(x.yields(),2);});\ntest('expensive distance work yields on the time budget before the frame-count budget',async()=>{const x=setup();let scans=0;const result=x.nearest(frames(1000),{lon:999,lat:0},(...args)=>{scans++;x.time(scans);return distance(...args)},()=>true);assert.equal(scans,256);await x.flush();assert.equal(await result,'999');assert(x.yields()>0);});\ntest('a superseded click stops at its next yield without returning a partial nearest image',async()=>{const x=setup();let current=true,scans=0;const result=x.nearest(frames(10000),{lon:9999,lat:0},(...args)=>{scans++;return distance(...args)},()=>current);current=false;await x.flush();assert.equal(await result,undefined);assert.equal(scans,4096);});\ntest('obsolete routes are rejected before reading any frame',async()=>{const x=setup();const route=new Proxy([],{get(){throw Error('obsolete array accessed')}});assert.equal(await x.nearest(route,{lon:0,lat:0},distance,()=>false),undefined);});\ntest('empty routes and unusable distances have no invented nearest result',async()=>{const x=setup();assert.equal(await x.nearest([],{lon:0,lat:0},distance,()=>true),undefined);assert.equal(await x.nearest(frames(3),{lon:0,lat:0},()=>NaN,()=>true),undefined);});\n"
    },
    {
      "file": "docs/RESPONSIVE-LOADED-ROUTE-CLICKS.md",
      "content": "# Responsive clicks on large loaded routes\n\nTwo click paths scanned all cached coordinates in one synchronous task: clicking a blue route polyline without an explicit image ID, and clicking a regional representative from the active completed sequence. These paths could prevent a newer click or map interaction from being handled until the entire scan ended.\n\n`features/coverage/nearestLoadedFrame.ts` retains the existing nearest-distance policy, visits every frame and preserves first-match ties. Short inexpensive scans start without a timer. A scan yields after each 4,096 frames, or when an eight-millisecond budget is exceeded at a 256-frame checkpoint. These are cooperative budgets, not a guaranteed frame-time bound. The helper checks click/route ownership after yielding and before returning. It adds no network work, coordinate downloads, route sampling, persistent cache or spatial index.\n\nThe runtime's two callers retain captured array references and stop if the selection or route changes. Regional discovery still follows existing filter policy; exact individual image clicks keep their earlier fast path. Hover bearing, sequence styles and faint overview ownership are unchanged.\n\n## Validation\n\n125 targeted checks pass. Deterministic helper tests cover 10,000 frames, last-frame selection, ties, small scans without timers, expensive distance functions, cancellation, obsolete arrays and empty/invalid-distance results. A real-click callback regression fails on the previous synchronous implementation: the old image opens before the next click can interrupt it. It passes after the cooperative scan is installed. Existing hover, click priority, latest-click ownership, sequence retention, storage scheduling and image-first checks also pass. The runtime parses and the helper passes a standalone strict TypeScript check.\n\nThis improves main-thread responsiveness during a long scan. It is not a claim of reduced download latency or a live FPS benchmark. Timer scheduling may extend a long scan's wall-clock duration in exchange for handling input between slices. A full Experience Builder build and live-host visual check were not available in this workspace.\n\n## Install\n\nApply after the latest-click ownership update, from the widget root outside `src`:\n\n    node apply-responsive-loaded-route-clicks.cjs\n\nRebuild and reload Experience Builder. Use `--dry-run` to check compatibility. The standalone uninstaller restores only this scan implementation and its tests, retaining previous hover and click fixes. Installer tests do not invoke a host build. Edited blocks are refused rather than overwritten.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'responsive-loaded-route-clicks-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.121 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'responsive-loaded-route-clicks' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.121 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-responsive-loaded-route-clicks.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Responsive loaded-route clicks is already installed. No files changed.');
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
  const manifest = { installer: 'responsive-loaded-route-clicks', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Responsive loaded-route clicks ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
