#!/usr/bin/env node
'use strict';
/**
 * Places camera link v6.47. Compatible current v6 sources.
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
      "file": "src/features/places/SelectedPlace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/SelectedPlace.ts block 1",
              "before": "  private layer: any = null;\n  private view: any = null;\n  private ring: any = null;\n  private line: any = null;\n  private camera: [number, number] | null = null;\n  private link = false;\n  constructor(private host: { id: string; modules: any; view(): any; changed?(place: Place | null): void }) {}\n  select(place: Place): void {\n",
              "after": "  private layer: any = null;\n  private view: any = null;\n  private ring: any = null;\n  private line: any = null;\n  private lineUnderlay: any = null;\n  private camera: [number, number] | null = null;\n  private link = false;\n  constructor(private host: { id: string; modules: any; view(): any; changed?(place: Place | null): void }) {}\n  select(place: Place): void {\n"
            },
            {
              "label": "src/features/places/SelectedPlace.ts block 2",
              "before": "    this.renderLink();\n  }\n  private renderLink(): void {\n    if (!this.layer || !this.place) return;\n    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; return; }\n    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };\n    if (this.line) { this.line.geometry = geometry; this.line.visible = true; }\n    else { this.line = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [255, 228, 163, .8], width: 1.25, style: 'dash' } }); this.layer.addMany([this.line]); }\n  }\n  private removeLayer(): void {\n    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }\n    this.layer = null; this.view = null; this.ring = null; this.line = null;\n  }\n}\n",
              "after": "    this.renderLink();\n  }\n  private renderLink(): void {\n    if (!this.layer || !this.place) return;\n    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; if (this.lineUnderlay) this.lineUnderlay.visible = false; return; }\n    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };\n    if (this.line) {\n      this.line.geometry = geometry; this.line.visible = true;\n      this.lineUnderlay.geometry = geometry; this.lineUnderlay.visible = true;\n    } else {\n      this.lineUnderlay = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [13, 38, 43, .75], width: 2.5, style: 'solid' } });\n      this.line = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [64, 224, 240, 1], width: 1.25, style: 'dash' } });\n      this.layer.addMany([this.lineUnderlay, this.line]);\n      // Keep the selected badge above both strokes where they meet the place.\n      this.layer.graphics?.reorder?.(this.ring, this.layer.graphics.length - 1);\n    }\n  }\n  private removeLayer(): void {\n    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }\n    this.layer = null; this.view = null; this.ring = null; this.line = null; this.lineUnderlay = null;\n  }\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/overturePlaces.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/overturePlaces.test.cjs block 1",
              "before": " class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);assert.equal(ring.symbol.width,21);selection.setLink(true);const line=layer.items[1];assert.equal(created,2);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,2);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],line);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:23,y:10}),'p');assert.equal(selection.screenTarget({x:25,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\ntest('bundled category icons are distinct, self-contained and reject arbitrary category markup',()=>{\n const icons=load('placeIcons'),groups=['health','education','parks','landmarks','services'];const urls=groups.map(g=>icons.placeCategoryIcon(g));assert.equal(new Set(urls).size,5);\n",
              "after": " class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);assert.equal(ring.symbol.width,21);selection.setLink(true);const underlay=layer.items[1],line=layer.items[2];assert.equal(created,3);assert.deepEqual(line.symbol.color,[64,224,240,1]);assert.equal(line.symbol.width,1.25);assert.equal(line.symbol.style,'dash');assert.equal(underlay.symbol.style,'solid');assert(underlay.symbol.width>line.symbol.width);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,3);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],underlay);assert.equal(layer.items[2],line);assert.deepEqual(underlay.geometry.paths,line.geometry.paths);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:23,y:10}),'p');assert.equal(selection.screenTarget({x:25,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);assert.equal(underlay.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);assert.equal(underlay.visible,true);assert.deepEqual(underlay.geometry.paths,line.geometry.paths);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\ntest('bundled category icons are distinct, self-contained and reject arbitrary category markup',()=>{\n const icons=load('placeIcons'),groups=['health','education','parks','landmarks','services'];const urls=groups.map(g=>icons.placeCategoryIcon(g));assert.equal(new Set(urls).size,5);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/OVERTURE-PLACES.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "docs/OVERTURE-PLACES.md block 1",
              "before": "\nThe adapter reuses the first SDK-autocast picture symbol per category for subsequent records and viewport updates; it releases this bounded cache on disposal. The screen-space click footprints match the larger presentation: 9 CSS px for normal markers and 14 px for selection. The existing single selection graphic is reused rather than adding another halo graphic. Selection/link behavior, data queries and sequence loading are unchanged. Picture-marker decoding/rendering adds a small bounded local cost compared with plain dots; live mobile rendering should still be checked in dense areas.\n\nThese are application symbols, not an official Overture icon set. Health means a general health category; the cross is not an emergency-service guarantee.\n",
              "after": "\nThe adapter reuses the first SDK-autocast picture symbol per category for subsequent records and viewport updates; it releases this bounded cache on disposal. The screen-space click footprints match the larger presentation: 9 CSS px for normal markers and 14 px for selection. The existing single selection graphic is reused rather than adding another halo graphic. Selection/link behavior, data queries and sequence loading are unchanged. Picture-marker decoding/rendering adds a small bounded local cost compared with plain dots; live mobile rendering should still be checked in dense areas.\n\nThese are application symbols, not an official Overture icon set. Health means a general health category; the cross is not an emergency-service guarantee.\n\n\n## Camera link contrast (v6.47)\n\nThe optional camera link now uses cyan dashes (the existing 1.25 pt width/dash style) over a thin dark solid underlay (2.5 pt). Both strokes reuse their graphics on image changes and toggle off together. The selected badge stays above the strokes. This adds just one underlay Graphic while the link is used, with no extra network, timer or animation work. The overlay budget is now one selected badge plus two link strokes; a camera link still does not assert visibility or routing.\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-camera-link-v6-47-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.47 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-camera-link-v6-47' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.47 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.47 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.47 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-camera-link-v6-47.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places camera link v6.47 is already installed. No files changed.');
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
  const manifest = { installer: 'places-camera-link-v6-47', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places camera link v6.47 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
