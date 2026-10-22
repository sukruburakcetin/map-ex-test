#!/usr/bin/env node
'use strict';
/** Collapsed profile elevations installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
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
      "file": "src/features/elevation/profileIndicator.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileIndicator.ts collapsed elevation block 1",
          "before": ".mly-profile-mobile .mly-profile-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; min-height: 44px; flex: 1 1 0; padding: 0 8px; border: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 600; line-height: 1.3; font-family: inherit; cursor: pointer; text-align: start; }\n.mly-profile-mobile:not(.mly-profile-collapsed) .mly-profile-summary span:first-child { white-space: normal; }\n.mly-profile-summary span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-mobile .mly-profile-body { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 6px; }\n.mly-profile-mobile.mly-profile-collapsed .mly-profile-body { display: none; }\n",
          "after": ".mly-profile-mobile .mly-profile-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; min-height: 44px; flex: 1 1 0; padding: 0 8px; border: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 600; line-height: 1.3; font-family: inherit; cursor: pointer; text-align: start; }\n.mly-profile-mobile:not(.mly-profile-collapsed) .mly-profile-summary span:first-child { white-space: normal; }\n.mly-profile-summary > span:first-child { display: flex; flex-direction: column; gap: 2px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-summary-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-mobile:not(.mly-profile-collapsed) .mly-profile-summary-label { white-space: normal; }\n.mly-profile-summary-values { font-size: 10px; font-weight: 400; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-mobile:not(.mly-profile-collapsed) .mly-profile-summary-values { display: none; }\n.mly-profile-mobile .mly-profile-body { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 6px; }\n.mly-profile-mobile.mly-profile-collapsed .mly-profile-body { display: none; }\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts collapsed elevation block 2",
          "before": "  private mobileExpanded = false;\n  private mobileSummary: HTMLSpanElement | null = null;\n  private summaryButton: HTMLButtonElement | null = null;\n  private mobileAltitudes: HTMLDivElement | null = null;\n",
          "after": "  private mobileExpanded = false;\n  private mobileSummary: HTMLSpanElement | null = null;\n  private mobileReadout: HTMLSpanElement | null = null;\n  private summaryButton: HTMLButtonElement | null = null;\n  private mobileAltitudes: HTMLDivElement | null = null;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts collapsed elevation block 3",
          "before": "    summary.setAttribute('aria-label', 'Expand or collapse elevation profile');\n    const summaryText = doc.createElement('span'); this.mobileSummary = summaryText;\n    const chevron = doc.createElement('span'); chevron.textContent = '\u2303'; chevron.setAttribute('aria-hidden', 'true');\n    summary.append(summaryText, chevron);\n    summary.addEventListener('click', () => {\n      this.mobileExpanded = !this.mobileExpanded; this.layout?.setExpanded(this.mobileExpanded);\n",
          "after": "    summary.setAttribute('aria-label', 'Expand or collapse elevation profile');\n    const summaryText = doc.createElement('span'); this.mobileSummary = summaryText;\n    summaryText.className = 'mly-profile-summary-label';\n    const summaryValues = doc.createElement('span'); this.mobileReadout = summaryValues;\n    summaryValues.className = 'mly-profile-summary-values';\n    const summaryStack = doc.createElement('span'); summaryStack.append(summaryText, summaryValues);\n    const chevron = doc.createElement('span'); chevron.textContent = '\u2303'; chevron.setAttribute('aria-hidden', 'true');\n    summary.append(summaryStack, chevron);\n    summary.addEventListener('click', () => {\n      this.mobileExpanded = !this.mobileExpanded; this.layout?.setExpanded(this.mobileExpanded);\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts collapsed elevation block 4",
          "before": "    for (const [line, check] of this.layerChecks) check.checked = line.visible;\n    this.summaryButton?.setAttribute('aria-busy', String(this.widget.viewModel.progress < 1));\n    if (this.mobile && !this.mobileExpanded) return;\n    // SVG viewBox coordinates use local CSS pixels, not transformed screen pixels.\n    const measured = this.svg.clientWidth || this.svg.getBoundingClientRect().width;\n",
          "after": "    for (const [line, check] of this.layerChecks) check.checked = line.visible;\n    this.summaryButton?.setAttribute('aria-busy', String(this.widget.viewModel.progress < 1));\n    if (this.mobile && !this.mobileExpanded) { this.updateFrame(); return; }\n    // SVG viewBox coordinates use local CSS pixels, not transformed screen pixels.\n    const measured = this.svg.clientWidth || this.svg.getBoundingClientRect().width;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts collapsed elevation block 5",
          "before": "      ? `${this.mobileExpanded ? 'Frame ' + frame.ordinal.toLocaleString() : 'Profile \u00b7 Frame ' + frame.ordinal.toLocaleString() + '/' + this.index.images.length.toLocaleString()} \u00b7 ${frame.distance >= 1000 ? (frame.distance / 1000).toFixed(2) + ' km' : Math.round(frame.distance) + ' m'}`\n      : 'Profile \u00b7 Waiting for current image';\n    if (this.mobileAltitudes && this.mobile && this.mobileExpanded) {\n      const chips: HTMLSpanElement[] = [];\n",
          "after": "      ? `${this.mobileExpanded ? 'Frame ' + frame.ordinal.toLocaleString() : 'Profile \u00b7 Frame ' + frame.ordinal.toLocaleString() + '/' + this.index.images.length.toLocaleString()} \u00b7 ${frame.distance >= 1000 ? (frame.distance / 1000).toFixed(2) + ' km' : Math.round(frame.distance) + ' m'}`\n      : 'Profile \u00b7 Waiting for current image';\n    if (this.mobileReadout && this.mobile && !this.mobileExpanded) {\n      if (!frame) {\n        this.mobileReadout.textContent = 'Waiting for current image';\n        this.mobileReadout.removeAttribute('title');\n      } else {\n        const terrain = this.widget.profiles.toArray().find(line => line.title === 'Terrain Surface');\n        const ground = sampledElevation(terrain?.samples || [], frame.distance);\n        const terrainText = ground === null ? (this.widget.viewModel.progress < 1 ? 'Terrain: sampling\u2026' : 'Terrain: no data') : `Terrain ${ground.toFixed(1)} m`;\n        const camera = frame.computedAltitude ?? frame.reportedAltitude;\n        const cameraSource = frame.computedAltitude !== undefined ? 'Calc. camera' : 'Reported camera';\n        this.mobileReadout.textContent = `${terrainText} \u00b7 ${camera === undefined ? 'Camera: no data' : cameraSource + ' ' + camera.toFixed(1) + ' m'}`;\n        this.mobileReadout.title = `Current image ${frame.id}. Terrain is interpolated at this frame's route distance. ` +\n          `Computed camera altitude: ${frame.computedAltitude === undefined ? 'no data' : frame.computedAltitude.toFixed(1) + ' m'}. ` +\n          `Reported camera altitude: ${frame.reportedAltitude === undefined ? 'no data' : frame.reportedAltitude.toFixed(1) + ' m'}.`;\n      }\n    }\n    if (this.mobileAltitudes && this.mobile && this.mobileExpanded) {\n      const chips: HTMLSpanElement[] = [];\n"
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
const prefix = 'collapsed-profile-elevations-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-collapsed-profile-elevations.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited organization filter references remain)');
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
    console.log(uninstall ? 'Collapsed profile elevations is already uninstalled. No files changed.' : 'Collapsed profile elevations is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'collapsed-profile-elevations', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Collapsed profile elevations ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. On phones, the profile occupies its own section above imagery. The map stays unobstructed; collapse the row to return space to the image. Desktop retains bottom-leading placement.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
