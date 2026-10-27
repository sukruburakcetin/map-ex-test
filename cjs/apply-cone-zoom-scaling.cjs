#!/usr/bin/env node
'use strict';
/** Cone zoom scaling installer. Plain source payload.
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
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "cone zoom scaling 1",
          "before": "import { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { SelectionPulse } from '../features/map-graphics/SelectionPulse';\nimport { CameraConeGraphics } from '../features/map-graphics/CameraConeGraphics';\nimport { MapSymbolLegend } from '../features/map-graphics/MapSymbolLegend';\nimport { syncBrowserUrl, copyBrowserShareLink } from '../features/navigation/browserUrlState';\n",
          "after": "import { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { SelectionPulse } from '../features/map-graphics/SelectionPulse';\nimport { coneDisplayRadius } from \"../features/map-graphics/coneDisplayRadius\";\nimport { CameraConeGraphics } from '../features/map-graphics/CameraConeGraphics';\nimport { MapSymbolLegend } from '../features/map-graphics/MapSymbolLegend';\nimport { syncBrowserUrl, copyBrowserShareLink } from '../features/navigation/browserUrlState';\n"
        },
        {
          "label": "cone zoom scaling 2",
          "before": "      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      /*\n       * Keep quality hint behavior.\n       */\n",
          "after": "      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      // Share the existing cone frame: zoom events never rebuild imagery or add timers.\n      if (this._coneRedrawRaf == null) this._coneRedrawRaf = requestAnimationFrame(() => {\n        this._coneRedrawRaf = null;\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n        if (image && String(image.id) === String(this.state.imageId))\n          this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n      });\n\n      /*\n       * Keep quality hint behavior.\n       */\n"
        },
        {
          "label": "cone zoom scaling 3",
          "before": "  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n    const center = lonLatToWebMercator(anchor.lon, anchor.lat);\n    if (!center) return null;\n    const layer = this.ensureConeLayer();\n    if (!layer) return null;\n    const graphic = this.ensureCameraConeOwner().render(view, layer, center, anchor.lat,\n      heading, radiusMeters, spreadDeg, view.type === \"3d\", properties => new this.ArcGISModules.Graphic(properties));\n\n    // Keep selection above the cone without removing/readding animated graphics.\n    if (this._selectionPulse?.layer && this._selectionPulse?.view === view) view.map.reorder(this._selectionPulse?.layer, view.map.layers.length - 1);\n",
          "after": "  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    const displayRadius = coneDisplayRadius(radiusMeters, view.zoom);\n    if (!displayRadius) { this.clearConeGraphics(); return null; }\n    const anchor = this.getCoverageDisplayPosition(String(this.state.imageId), lon, lat);\n    const center = lonLatToWebMercator(anchor.lon, anchor.lat);\n    if (!center) return null;\n    const layer = this.ensureConeLayer();\n    if (!layer) return null;\n    const graphic = this.ensureCameraConeOwner().render(view, layer, center, anchor.lat,\n      heading, displayRadius, spreadDeg, view.type === \"3d\", properties => new this.ArcGISModules.Graphic(properties));\n\n    // Keep selection above the cone without removing/readding animated graphics.\n    if (this._selectionPulse?.layer && this._selectionPulse?.view === view) view.map.reorder(this._selectionPulse?.layer, view.map.layers.length - 1);\n"
        }
      ],
      "absentAfterUninstall": [
        "coneDisplayRadius"
      ],
      "requiredOccurrences": [
        {
          "text": "coneDisplayRadius",
          "count": 3
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/map-graphics/coneDisplayRadius.ts",
      "content": "/** Direction indicator display radius in ground metres, not a camera footprint.\n * Preserve the requested close-view radius from zoom 17 onward. Below that,\n * double per zoom level, capped at eight times the request and 120 metres.\n * Below zoom 12 show only the current-image pulse to avoid overview clutter.\n */\nexport function coneDisplayRadius(radiusMeters: number, zoom: number): number {\n  if (!Number.isFinite(zoom)) return radiusMeters;\n  if (zoom < 12) return 0;\n  if (zoom >= 17) return radiusMeters;\n  return Math.max(radiusMeters, Math.min(radiusMeters * 2 ** (17 - zoom), radiusMeters * 8, 120));\n}\n"
    },
    {
      "file": "tests/coneDisplayRadius.test.cjs",
      "content": "const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/map-graphics/coneDisplayRadius.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const radius=m.exports.coneDisplayRadius;\ntest('close zooms preserve all existing viewer radius choices',()=>{for(const r of [10,15,20,30])for(const z of [17,19,23])assert.equal(radius(r,z),r)});\ntest('zooming out gradually enlarges the direction indicator',()=>{assert.equal(radius(10,16),20);assert.equal(radius(10,15),40);assert(radius(10,16.5)>10&&radius(10,16.5)<20)});\ntest('enlargement is bounded by both relative and absolute caps',()=>{assert.equal(radius(10,12),80);assert.equal(radius(30,12),120);assert.equal(radius(150,12),150)});\ntest('overview hides the cone without changing the selected image marker',()=>{assert.equal(radius(10,11.99),0);assert.equal(radius(10,12),80)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'cone-zoom-scaling-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-cone-zoom-scaling.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Cone zoom scaling is already uninstalled. No files changed.' : 'Cone zoom scaling is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'cone-zoom-scaling', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Cone zoom scaling ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Cone zoom scaling experiment; use --uninstall to roll back only this change.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
