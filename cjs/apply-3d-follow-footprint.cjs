#!/usr/bin/env node
'use strict';
/** 3D follow footprint installer. Plain source payload.
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
      "file": "src/features/imagery/imageFollowPolicy.ts",
      "blocks": [
        {
          "label": "src/features/imagery/imageFollowPolicy.ts 3D follow 1",
          "before": "/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */\nexport interface ImageFollowView {\n type: string; width: number; height: number; stationary?: boolean;\n toScreen(point: any): { x: number; y: number } | null | undefined;\n groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;\n}\n",
          "after": "/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */\nexport interface ImageFollowView {\n type: string; width: number; height: number; stationary?: boolean;\n toMap?(pixel: { x: number; y: number }): any;\n toScreen(point: any): { x: number; y: number } | null | undefined;\n groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;\n}\n"
        },
        {
          "label": "src/features/imagery/imageFollowPolicy.ts 3D follow 2",
          "before": " * Scene projection needs ground height because toScreen does not apply graphic-layer draping.\n * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or\n * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.\n */\nexport function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {\n if (locked) return true;\n",
          "after": " * Scene projection needs ground height because toScreen does not apply graphic-layer draping.\n * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or\n * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.\n * Missing sampler data falls back to the public toMap ground footprint.\n */\nexport function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {\n if (locked) return true;\n"
        },
        {
          "label": "src/features/imagery/imageFollowPolicy.ts 3D follow 3",
          "before": "  try {\n   const sampler = view.groundView?.elevationSampler;\n   const ground = sampler?.queryElevation(point);\n   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue) return false;\n   projection = ground;\n  } catch { return false; }\n }\n try {\n  // CSS-pixel inset: 24% of each dimension, capped at 128 px. Small/mobile\n",
          "after": "  try {\n   const sampler = view.groundView?.elevationSampler;\n   const ground = sampler?.queryElevation(point);\n   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue)\n    return outsideGroundFootprint(view, point) ?? false;\n   projection = ground;\n  } catch { return outsideGroundFootprint(view, point) ?? false; }\n }\n try {\n  // CSS-pixel inset: 24% of each dimension, capped at 128 px. Small/mobile\n"
        },
        {
          "label": "src/features/imagery/imageFollowPolicy.ts 3D follow 4",
          "before": "   pixel.x < insetX || pixel.y < insetY || pixel.x > view.width - insetX || pixel.y > view.height - insetY;\n } catch { return false; }\n}\n",
          "after": "   pixel.x < insetX || pixel.y < insetY || pixel.x > view.width - insetX || pixel.y > view.height - insetY;\n } catch { return false; }\n}\n\n/** Public SceneView ground-ray fallback when its rendered elevation sampler is unavailable.\n * Intersect eight inset perimeter rays with terrain and test horizontal image membership.\n * This uses the rotated/tilted ground footprint, not the axis-aligned map extent or a\n * sea-level projection. Skip sky rays; fewer than three usable ground hits defer follow.\n * No elevation requests, timers or retained geometries are introduced.\n */\nfunction outsideGroundFootprint(view: ImageFollowView, point: any): boolean | null {\n if (!view.toMap) return null;\n const geographic = (p: any): { lon: number; lat: number } | null => {\n  if (Number.isFinite(p?.longitude) && Number.isFinite(p?.latitude)) return { lon: p.longitude, lat: p.latitude };\n  const wkid = p?.spatialReference?.wkid;\n  if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) return null;\n  if (wkid === 4326) return { lon: p.x, lat: p.y };\n  if ([3857, 102100, 102113].includes(wkid)) return { lon: p.x / 6378137 * 180 / Math.PI,\n   lat: Math.atan(Math.sinh(p.y / 6378137)) * 180 / Math.PI };\n  return null;\n };\n const image = geographic(point);\n if (!image) return null;\n const x = Math.min(128, view.width * 0.24), y = Math.min(128, view.height * 0.24);\n const left = x, right = view.width - x, top = y, bottom = view.height - y;\n const pixels = [[left, top], [view.width / 2, top], [right, top], [right, view.height / 2],\n  [right, bottom], [view.width / 2, bottom], [left, bottom], [left, view.height / 2]];\n const polygon: { x: number; y: number }[] = [];\n for (const [x, y] of pixels) {\n  try {\n   const hit = geographic(view.toMap({ x, y }));\n   if (hit) polygon.push({ x: ((hit.lon - image.lon + 540) % 360) - 180, y: hit.lat - image.lat });\n  } catch { /* A sky/missing terrain ray must not invalidate other ground hits. */ }\n }\n if (polygon.length < 3) return null;\n let inside = false;\n for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {\n  const a = polygon[j], b = polygon[i];\n  const cross = a.x * b.y - b.x * a.y;\n  if (Math.abs(cross) < 1e-10 && a.x * b.x + a.y * b.y <= 0) return false;\n  if ((a.y > 0) !== (b.y > 0) && 0 < a.x + (b.x - a.x) * -a.y / (b.y - a.y)) inside = !inside;\n }\n return !inside;\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "function outsideGroundFootprint("
      ],
      "requiredOccurrences": [
        {
          "text": "function outsideGroundFootprint(",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/imageFollowPolicy.test.cjs",
      "blocks": [
        {
          "label": "tests/imageFollowPolicy.test.cjs 3D follow 1",
          "before": "test('insets scale for mobile and cap at 128 CSS pixels on large maps',()=>{const mobile={...view(),width:320,height:200};mobile.toScreen=()=>({x:76,y:100});assert.equal(follow(mobile,{},false),true);mobile.toScreen=()=>({x:78,y:100});assert.equal(follow(mobile,{},false),false);const large={...view(),width:2000,height:1200};large.toScreen=()=>({x:129,y:500});assert.equal(follow(large,{},false),false);large.toScreen=()=>({x:127,y:500});assert.equal(follow(large,{},false),true)});\ntest('automatic recenter glides during playback; locked tracking retains its original timing',()=>{for(const type of ['2d','3d'])for(const locked of [false,true]){const {w,v}=runtime(type,'center',locked);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.deepEqual(w.moves[0][2],locked?{animate:false,duration:0}:{animate:true,duration:450,easing:'ease-in-out'})}});\ntest('default follow does not restart a recenter during camera movement',()=>{const {w,v}=runtime();v.stationary=false;v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)});\n",
          "after": "test('insets scale for mobile and cap at 128 CSS pixels on large maps',()=>{const mobile={...view(),width:320,height:200};mobile.toScreen=()=>({x:76,y:100});assert.equal(follow(mobile,{},false),true);mobile.toScreen=()=>({x:78,y:100});assert.equal(follow(mobile,{},false),false);const large={...view(),width:2000,height:1200};large.toScreen=()=>({x:129,y:500});assert.equal(follow(large,{},false),false);large.toScreen=()=>({x:127,y:500});assert.equal(follow(large,{},false),true)});\ntest('automatic recenter glides during playback; locked tracking retains its original timing',()=>{for(const type of ['2d','3d'])for(const locked of [false,true]){const {w,v}=runtime(type,'center',locked);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.deepEqual(w.moves[0][2],locked?{animate:false,duration:0}:{animate:true,duration:450,easing:'ease-in-out'})}});\ntest('default follow does not restart a recenter during camera movement',()=>{const {w,v}=runtime();v.stationary=false;v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)});\n\nfunction footprintView(){return {type:'3d',width:100,height:100,toScreen(){throw Error('Must not project at sea level')},toMap:({x,y})=>({longitude:x/10,latitude:y/10})}}\ntest('3D without private terrain sampler follows before the inset edge using ground rays',()=>{const v=footprintView();assert.equal(follow(v,{longitude:5,latitude:5},false),false);for(const p of [{longitude:1,latitude:5},{longitude:9,latitude:5},{longitude:5,latitude:1},{longitude:5,latitude:9}])assert.equal(follow(v,p,false),true)});\ntest('3D no-data/throwing sampler uses public terrain intersections',()=>{const v=footprintView();v.groundView={elevationSampler:{noDataValue:-999,queryElevation:()=>({z:-999})}};assert.equal(follow(v,{longitude:9,latitude:5},false),true);v.groundView.elevationSampler.queryElevation=()=>{throw Error('Unavailable')};assert.equal(follow(v,{longitude:9,latitude:5},false),true)});\ntest('3D rotated ground footprint handles image positions inside and outside',()=>{const v=footprintView();v.toMap=({x,y})=>({longitude:5+(x-y)/10,latitude:5+(x+y-100)/10});assert.equal(follow(v,{longitude:5,latitude:5},false),false);assert.equal(follow(v,{longitude:10,latitude:10},false),true)});\ntest('sky rays and unavailable footprint defer rather than moving on unknown data',()=>{const v=footprintView();v.toMap=()=>null;assert.equal(follow(v,{longitude:9,latitude:5},false),false)});\ntest('public footprint fallback accepts Web Mercator anchors',()=>{const v=footprintView(),mercator=(lon,lat)=>({x:lon*Math.PI/180*6378137,y:Math.asinh(Math.tan(lat*Math.PI/180))*6378137,spatialReference:{wkid:3857}});assert.equal(follow(v,mercator(5,5),false),false);assert.equal(follow(v,mercator(9,5),false),true)});\n"
        }
      ],
      "absentAfterUninstall": [
        "3D without private terrain sampler follows"
      ],
      "requiredOccurrences": [
        {
          "text": "3D without private terrain sampler follows",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md 3D follow 1",
          "before": "## Closed mesh cone\n\nReplace separately triangulated 3D polygons with one explicitly indexed, closed mesh: shared apex/upper arc/lower arc, outward-wound top, walls and bottom. Use local metre vertex space anchored to the existing relative-to-ground layer. A retained line graphic draws only the top perimeter. Mesh component materials preserve translucent top/darker sides; transparency blending can still show overlaps and needs host validation. The runtime loads the SDK Mesh constructor with its existing module bundle. 2D geometry, projected sizing, grounded pulse and follow policies are unchanged. Standalone uninstaller restores the previous polygon-face implementation.\n",
          "after": "## Closed mesh cone\n\nReplace separately triangulated 3D polygons with one explicitly indexed, closed mesh: shared apex/upper arc/lower arc, outward-wound top, walls and bottom. Use local metre vertex space anchored to the existing relative-to-ground layer. A retained line graphic draws only the top perimeter. Mesh component materials preserve translucent top/darker sides; transparency blending can still show overlaps and needs host validation. The runtime loads the SDK Mesh constructor with its existing module bundle. 2D geometry, projected sizing, grounded pulse and follow policies are unchanged. Standalone uninstaller restores the previous polygon-face implementation.\n\n## 3D follow terrain fallback\n\nThe original follow policy deferred every check when the optional rendered-terrain sampler was absent or returned no data. Fall back to the public SceneView `toMap` intersections of eight inset-perimeter rays and test the image against that rotated/tilted ground footprint. Preserve 24%/128 px inset, existing easing, manual movement guards and explicit image lock. Skip sky rays; fewer than three ground intersections defer navigation. No extra watcher, timer or elevation service requests. Validate tilted views and edge following in the host.\n"
        }
      ],
      "absentAfterUninstall": [
        "## 3D follow terrain fallback"
      ],
      "requiredOccurrences": [
        {
          "text": "## 3D follow terrain fallback",
          "count": 1
        }
      ]
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = '3d-follow-footprint-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-3d-follow-footprint.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? '3D follow footprint is already uninstalled. No files changed.' : '3D follow footprint is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: '3d-follow-footprint', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('3D follow footprint ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. 3D follow now falls back to public ground intersections; inset and easing are unchanged.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
