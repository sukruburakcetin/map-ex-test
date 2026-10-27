#!/usr/bin/env node
'use strict';
/** Single-face cone installer. Plain source payload.
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
      "file": "src/features/map-graphics/CameraConeGraphics.ts",
      "blocks": [
        {
          "label": "src/features/map-graphics/CameraConeGraphics.ts single face 1",
          "before": "    return this.layer;\n  }\n\n  /** Build or update the existing 2D sector / 3D wedge without replacing retained graphics.\n   * Center is Web Mercator; latitude is degrees; heading/spread are degrees clockwise\n   * from north; radius is ground metres. Geometry stays relative to the layer terrain.\n   * The runtime resolves coverage anchoring and selection-layer ordering before/after this call.\n",
          "after": "    return this.layer;\n  }\n\n  /** Build or update one 2D sector / translucent 3D wedge face, reusing its graphic.\n   * Center is Web Mercator; latitude is degrees; heading/spread are degrees clockwise\n   * from north; radius is ground metres. Geometry stays relative to the layer terrain.\n   * The runtime resolves coverage anchoring and selection-layer ordering before/after this call.\n"
        },
        {
          "label": "src/features/map-graphics/CameraConeGraphics.ts single face 2",
          "before": "      } : { type: \"simple-fill\", color: [255, 165, 0, 0.28], outline: { color: [255, 140, 0, 0.95], width: 1.5 } } });\n      (graphic as any).__isCone = true; layer.add(graphic!); this.graphic = graphic;\n    }\n    if (scene) {\n      const tip = ring[0], left = ring[1], right = ring[ring.length - 2];\n      const leftGround = [left[0], left[1], z], rightGround = [right[0], right[1], z];\n      const sides = [[tip, leftGround, left, tip], [tip, right, rightGround, tip]];\n      const ground = ring.map((p, i) => [p[0], p[1], i === 0 || i === ring.length - 1 ? 0 : z]);\n      const geometries = sides.map(side => ({ type: \"polygon\", rings: [side], hasZ: true, spatialReference: { wkid: 3857 } }));\n      geometries.push({ type: \"polyline\", paths: [ground], hasZ: true, spatialReference: { wkid: 3857 } } as any);\n      for (let i = 0; i < geometries.length; i++) {\n        if (this.parts[i]) this.parts[i].geometry = geometries[i] as any;\n        else {\n          const part = createGraphic({ geometry: geometries[i], symbol: i < 2 ? {\n            type: \"polygon-3d\", symbolLayers: [{ type: \"fill\", castShadows: false, material: { color: [255, 165, 0, 0.12] }, outline: { color: [255, 140, 0, 0.8], size: 1 } }],\n          } : { type: \"line-3d\", symbolLayers: [{ type: \"line\", size: 1, material: { color: [255, 140, 0, 0.65] } }] } });\n          (part as any).__isCone = true; layer.add(part); this.parts.push(part);\n        }\n      }\n    }\n    return graphic!;\n  }\n\n",
          "after": "      } : { type: \"simple-fill\", color: [255, 165, 0, 0.28], outline: { color: [255, 140, 0, 0.95], width: 1.5 } } });\n      (graphic as any).__isCone = true; layer.add(graphic!); this.graphic = graphic;\n    }\n    // A single sloped face supplies the silhouette and outer outline. Side faces\n    // and the lower perimeter duplicated edges at oblique camera angles.\n    return graphic!;\n  }\n\n"
        }
      ],
      "absentAfterUninstall": [
        "A single sloped face supplies the silhouette"
      ],
      "requiredOccurrences": [
        {
          "text": "A single sloped face supplies the silhouette",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md single face 1",
          "before": "Increase the projected target to 44 CSS px and relax the ground caps to 24x/360 m; the earlier 8x/120 m caps could prevent a distant cone from extending beyond the fixed-screen pulse. Requested close-view radius and the 6 px overview cutoff remain. Marker placement, pulse size, cone height and 2D geometry remain unchanged. This is a direction indicator, not an image footprint.\n\nThe projected 3D cone target is now 60 CSS px, retaining the 24x/360 m caps, grounded pulse and existing 2D sizing.\n",
          "after": "Increase the projected target to 44 CSS px and relax the ground caps to 24x/360 m; the earlier 8x/120 m caps could prevent a distant cone from extending beyond the fixed-screen pulse. Requested close-view radius and the 6 px overview cutoff remain. Marker placement, pulse size, cone height and 2D geometry remain unchanged. This is a direction indicator, not an image footprint.\n\nThe projected 3D cone target is now 60 CSS px, retaining the 24x/360 m caps, grounded pulse and existing 2D sizing.\n\n## Single-face 3D cone experiment\n\nKeep the current projected radius, sloped wedge face, orange outer outline and translucent fill. Remove the two side faces and lower perimeter graphic to avoid wireframe-like overlapping edges at oblique viewing angles. The cone owner reuses one graphic; its public parts array remains empty for runtime compatibility. Grounded pulse, 2D geometry and follow policies are unchanged. A standalone uninstall script restores the previous multi-face cone.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Single-face 3D cone experiment"
      ],
      "requiredOccurrences": [
        {
          "text": "## Single-face 3D cone experiment",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "tests/singleFaceCone.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/CameraConeGraphics.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);\nfunction setup(){const layers=[],legacy=[],view={map:{findLayerById:()=>null,layers:{includes:l=>layers.includes(l)},add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},graphics:{forEach:f=>legacy.slice().forEach(f),remove:g=>legacy.splice(legacy.indexOf(g),1)}};let created=0;const owner=new m.exports.CameraConeGraphics(p=>{const items=[];return{...p,items,graphics:{includes:g=>items.includes(g)},add:g=>items.push(g),removeAll:()=>items.splice(0),destroy(){this.destroyed=true}}});const layer=owner.ensure(view);return{owner,view,layer,legacy,draw:(scene=true,heading=0)=>owner.render(view,layer,{x:100,y:200},0,heading,60,60,scene,p=>(created++,{...p})),count:()=>created}}\ntest('3D draws one translucent face with a single outer outline and no side/lower graphics',()=>{const x=setup(),g=x.draw();assert.equal(x.layer.items.length,1);assert.equal(x.owner.parts.length,0);assert.equal(g.symbol.type,'polygon-3d');assert.equal(g.symbol.symbolLayers.length,1);assert.equal(g.symbol.symbolLayers[0].material.color[3],.25);assert(g.symbol.symbolLayers[0].outline);assert.equal(g.geometry.rings.length,1)});\ntest('turning during playback reuses the same graphic',()=>{const x=setup(),g=x.draw(),old=g.geometry;for(let h=1;h<=180;h++)assert.equal(x.draw(true,h),g);assert.notEqual(g.geometry,old);assert.equal(x.count(),1);assert.equal(x.layer.items.length,1)});\ntest('apex remains grounded and wedge rise stays bounded',()=>{const x=setup(),ring=x.draw().geometry.rings[0];assert.deepEqual(ring[0],[100,200,0]);assert.deepEqual(ring.at(-1),ring[0]);assert(ring.slice(1,-1).every(p=>p[2]>0&&p[2]<=1.58))});\ntest('2D retains a flat simple fill and its existing outline',()=>{const x=setup(),g=x.draw(false);assert.equal(g.symbol.type,'simple-fill');assert.equal(g.symbol.outline.width,1.5);assert(g.geometry.rings[0].every(p=>p[2]===0));assert.equal(x.layer.items.length,1)});\ntest('clear releases the face and removes tagged legacy cone graphics',()=>{const x=setup();x.draw();const keep={};x.legacy.push({__isCone:true},keep);x.owner.clear(x.view);assert.equal(x.layer.items.length,0);assert.equal(x.owner.graphic,null);assert.deepEqual(x.owner.parts,[]);assert.deepEqual(x.legacy,[keep])});\ntest('recreating and disposing the layer keep one cone resource',()=>{const x=setup();x.draw();x.owner.clear(x.view);x.draw();assert.equal(x.layer.items.length,1);x.owner.dispose(x.view);assert.equal(x.layer.destroyed,true);assert.equal(x.owner.layer,null)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'single-face-cone-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-single-face-cone.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Single-face cone is already uninstalled. No files changed.' : 'Single-face cone is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'single-face-cone', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Single-face cone ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Single-face 3D cone experiment; use uninstall-single-face-cone.cjs to restore the previous shape.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
