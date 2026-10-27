#!/usr/bin/env node
'use strict';
/** Clearer 3D cone installer. Plain source payload.
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
      "file": "src/features/map-graphics/projectedConeRadius.ts",
      "blocks": [
        {
          "label": "src/features/map-graphics/projectedConeRadius.ts clearer cone 1",
          "before": "/** Size a 3D direction indicator from its projected ground length in CSS pixels.\n * Keep the requested close-view radius; enlarge toward 28 px at distance, bounded\n * by 8x and 120 ground metres. Hide an indicator shorter than 6 px at that cap.\n * Projection uses the current camera/terrain, not SceneView's zoom number.\n * A missing/invalid terrain projection returns null so the caller can use its fallback.\n */\n",
          "after": "/** Size a 3D direction indicator from its projected ground length in CSS pixels.\n * Keep the requested close-view radius; enlarge toward 44 px at distance, bounded\n * by 24x and 360 ground metres. Hide an indicator shorter than 6 px at that cap.\n * Projection uses the current camera/terrain, not SceneView's zoom number.\n * A missing/invalid terrain projection returns null so the caller can use its fallback.\n */\n"
        },
        {
          "label": "src/features/map-graphics/projectedConeRadius.ts clearer cone 2",
          "before": " if (!valid(start) || !valid(tip)) return null;\n const length = Math.hypot(tip!.x - start!.x, tip!.y - start!.y);\n if (length < 0.001) return null;\n const cap = Math.max(radius, Math.min(radius * 8, 120));\n let result = Math.max(radius, Math.min(cap, radius * 28 / length));\n const projected = project(result);\n if (!valid(projected)) return null;\n const actual = Math.hypot(projected!.x - start!.x, projected!.y - start!.y);\n if (actual < 6 && result >= cap) return 0;\n // One bounded correction accommodates perspective without iterative layout work.\n if (actual > 0) result = Math.max(radius, Math.min(cap, result * 28 / actual));\n return result;\n}\n",
          "after": " if (!valid(start) || !valid(tip)) return null;\n const length = Math.hypot(tip!.x - start!.x, tip!.y - start!.y);\n if (length < 0.001) return null;\n const cap = Math.max(radius, Math.min(radius * 24, 360));\n let result = Math.max(radius, Math.min(cap, radius * 44 / length));\n const projected = project(result);\n if (!valid(projected)) return null;\n const actual = Math.hypot(projected!.x - start!.x, projected!.y - start!.y);\n if (actual < 6 && result >= cap) return 0;\n // One bounded correction accommodates perspective without iterative layout work.\n if (actual > 0) result = Math.max(radius, Math.min(cap, result * 44 / actual));\n return result;\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "toward 44 px"
      ],
      "requiredOccurrences": [
        {
          "text": "toward 44 px",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/projectedConeRadius.test.cjs",
      "blocks": [
        {
          "label": "tests/projectedConeRadius.test.cjs clearer cone 1",
          "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/projectedConeRadius.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const size=m.exports.projectedConeRadius;const projection=scale=>d=>({x:10+d*scale,y:20});\ntest('grounded marker-sized views gain a readable cone length',()=>assert.equal(size(10,projection(.5)),56));\ntest('same ground projection yields same cone independently of zoom labels',()=>{assert.equal(size(10,projection(.5)),size(10,projection(.5)));assert.equal(size(30,projection(.5)),56)});\ntest('close-view requested radius is preserved',()=>assert.equal(size(10,projection(10)),10));\ntest('relative and absolute ground-distance caps remain bounded',()=>{assert.equal(size(10,projection(.1)),80);assert.equal(size(30,projection(.1)),120)});\ntest('overview hides a cone too small at its cap',()=>assert.equal(size(10,projection(.01)),0));\ntest('unavailable terrain/projection retains caller fallback',()=>{assert.equal(size(10,()=>null),null);assert.equal(size(10,()=>({x:NaN,y:1})),null);assert.equal(size(10,()=>({x:0,y:0})),null)});\ntest('projection work stays bounded even under perspective',()=>{let count=0;const r=size(10,d=>(count++,{x:d/(1+d*.01),y:0}));assert.equal(count,3);assert(r>=10&&r<=80)});\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(sf.parseDiagnostics.length,0);const cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(n=>n.name?.getText(sf)==='drawCone').getText(sf);const Runtime=new Function('projectedConeRadius','coneDisplayRadius','lonLatToWebMercator',ts.transpileModule('class Runtime{'+method+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'return Runtime;')(size,(r,z)=>z<12?0:z>=17?r:Math.min(r*2**(17-z),r*8,120),()=>({x:0,y:0}));\nfunction draw(type,zoom,terrain=true){const w=new Runtime(),pulse={unchanged:true};let queries=0,radius;const v={type,zoom,toScreen:p=>({x:p.x*.5,y:p.y*.5}),groundView:{elevationSampler:{queryElevation:p=>(queries++,terrain?{...p,z:30}:null)}}};w.state={imageId:'A',jimuMapView:{view:v}};w.currentGreenGraphic=pulse;w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};w.getCoverageDisplayPosition=()=>({lon:1,lat:0});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(...args)=>(radius=args[5],{})});w.clearConeGraphics=()=>radius=0;w.drawCone(1,0,90,10,60);assert.equal(w.currentGreenGraphic,pulse);return {radius,queries}}\ntest('actual runtime sizes 3D from projection at different zoom labels, preserving pulse',()=>{assert.equal(draw('3d',15.6).radius,56);assert.equal(draw('3d',11).radius,56);assert.equal(draw('3d',15.6).queries,3)});\ntest('actual runtime leaves 2D unchanged without terrain queries',()=>{assert.equal(draw('2d',15).radius,40);assert.equal(draw('2d',15).queries,0)});\ntest('actual runtime retains old fallback while terrain is unavailable',()=>assert.equal(draw('3d',15,false).radius,40));\n",
          "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/projectedConeRadius.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const size=m.exports.projectedConeRadius;const projection=scale=>d=>({x:10+d*scale,y:20});\ntest('grounded marker-sized views gain a readable cone length',()=>assert.equal(size(10,projection(.5)),88));\ntest('same ground projection yields same cone independently of zoom labels',()=>{assert.equal(size(10,projection(.5)),size(10,projection(.5)));assert.equal(size(30,projection(.5)),88)});\ntest('close-view requested radius is preserved',()=>assert.equal(size(10,projection(10)),10));\ntest('relative and absolute ground-distance caps remain bounded',()=>{assert.equal(size(10,projection(.1)),240);assert.equal(size(30,projection(.1)),360)});\ntest('overview hides a cone too small at its cap',()=>assert.equal(size(10,projection(.01)),0));\ntest('unavailable terrain/projection retains caller fallback',()=>{assert.equal(size(10,()=>null),null);assert.equal(size(10,()=>({x:NaN,y:1})),null);assert.equal(size(10,()=>({x:0,y:0})),null)});\ntest('projection work stays bounded even under perspective',()=>{let count=0;const r=size(10,d=>(count++,{x:d/(1+d*.01),y:0}));assert.equal(count,3);assert(r>=10&&r<=240)});\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(sf.parseDiagnostics.length,0);const cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(n=>n.name?.getText(sf)==='drawCone').getText(sf);const Runtime=new Function('projectedConeRadius','coneDisplayRadius','lonLatToWebMercator',ts.transpileModule('class Runtime{'+method+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'return Runtime;')(size,(r,z)=>z<12?0:z>=17?r:Math.min(r*2**(17-z),r*8,120),()=>({x:0,y:0}));\nfunction draw(type,zoom,terrain=true){const w=new Runtime(),pulse={unchanged:true};let queries=0,radius;const v={type,zoom,toScreen:p=>({x:p.x*.5,y:p.y*.5}),groundView:{elevationSampler:{queryElevation:p=>(queries++,terrain?{...p,z:30}:null)}}};w.state={imageId:'A',jimuMapView:{view:v}};w.currentGreenGraphic=pulse;w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};w.getCoverageDisplayPosition=()=>({lon:1,lat:0});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(...args)=>(radius=args[5],{})});w.clearConeGraphics=()=>radius=0;w.drawCone(1,0,90,10,60);assert.equal(w.currentGreenGraphic,pulse);return {radius,queries}}\ntest('actual runtime sizes 3D from projection at different zoom labels, preserving pulse',()=>{assert.equal(draw('3d',15.6).radius,88);assert.equal(draw('3d',11).radius,88);assert.equal(draw('3d',15.6).queries,3)});\ntest('actual runtime leaves 2D unchanged without terrain queries',()=>{assert.equal(draw('2d',15).radius,40);assert.equal(draw('2d',15).queries,0)});\ntest('actual runtime retains old fallback while terrain is unavailable',()=>assert.equal(draw('3d',15,false).radius,40));\n\ntest('distant views can extend the cone beyond a fixed-size pulse without exceeding caps',()=>{const radius=size(10,projection(.15));assert.equal(radius,240);assert.equal(radius*.15,36);assert(radius*.15>28)});\n"
        }
      ],
      "absentAfterUninstall": [
        "distant views can extend the cone"
      ],
      "requiredOccurrences": [
        {
          "text": "distant views can extend the cone",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md clearer cone 1",
          "before": "## Projected 3D cone proportions\n\n`projectedConeRadius.ts` enlarges the 3D direction cone toward a 28 CSS-pixel ground length using current-camera projections. Requested close-view radius, 8x/120 m caps and grounded pulse remain intact. Rendered-terrain sampling is synchronous, bounded to three samples per draw; missing terrain retains the previous zoom-based fallback. A cone shorter than 6 px at the cap is hidden. Existing stationary handling refreshes after tilt/orbit. 2D sizing is unchanged. Host checks: compare ground-distance views with differing zoom labels, tilted camera headings, close views and overview limits.\n",
          "after": "## Projected 3D cone proportions\n\n`projectedConeRadius.ts` enlarges the 3D direction cone toward a 28 CSS-pixel ground length using current-camera projections. Requested close-view radius, 8x/120 m caps and grounded pulse remain intact. Rendered-terrain sampling is synchronous, bounded to three samples per draw; missing terrain retains the previous zoom-based fallback. A cone shorter than 6 px at the cap is hidden. Existing stationary handling refreshes after tilt/orbit. 2D sizing is unchanged. Host checks: compare ground-distance views with differing zoom labels, tilted camera headings, close views and overview limits.\n\n### Clearer 3D cone beyond the pulse\n\nIncrease the projected target to 44 CSS px and relax the ground caps to 24x/360 m; the earlier 8x/120 m caps could prevent a distant cone from extending beyond the fixed-screen pulse. Requested close-view radius and the 6 px overview cutoff remain. Marker placement, pulse size, cone height and 2D geometry remain unchanged. This is a direction indicator, not an image footprint.\n"
        }
      ],
      "absentAfterUninstall": [
        "### Clearer 3D cone beyond the pulse"
      ],
      "requiredOccurrences": [
        {
          "text": "### Clearer 3D cone beyond the pulse",
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
const prefix = 'clearer-3d-cone-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-clearer-3d-cone.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Clearer 3D cone is already uninstalled. No files changed.' : 'Clearer 3D cone is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'clearer-3d-cone', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Clearer 3D cone ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. The 3D cone targets 44 CSS pixels with relaxed distance caps; marker and 2D sizing are unchanged. Use --uninstall to revert.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
