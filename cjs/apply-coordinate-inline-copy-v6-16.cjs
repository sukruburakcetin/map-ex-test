#!/usr/bin/env node
'use strict';
/**
 * Inline coordinate copying v6.16. Compatible current v6 sources.
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
      "file": "src/components/info-box/StatusSummary.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/info-box/StatusSummary.tsx block 1",
              "before": "\n              {/* Coordinates */}\n              {currentImg && (\n                <details className=\"mly-image-coordinates\"><summary>Coordinates</summary>\n                  <div className=\"mly-coordinate-card\" role=\"group\" aria-label=\"Image coordinates in decimal degrees\">\n                    <div className=\"mly-coordinate-value\" aria-label={`Latitude ${currentImg.lat.toFixed(6)} degrees`}>\n                      <span>{Math.abs(currentImg.lat).toFixed(6)}<small>\u00b0</small></span>\n                      <span className=\"mly-coordinate-direction\">{currentImg.lat < 0 ? \"S\" : \"N\"}</span>\n                    </div>\n                    <div className=\"mly-coordinate-value\" aria-label={`Longitude ${currentImg.lon.toFixed(6)} degrees`}>\n                      <span>{Math.abs(currentImg.lon).toFixed(6)}<small>\u00b0</small></span>\n                      <span className=\"mly-coordinate-direction\">{currentImg.lon < 0 ? \"W\" : \"E\"}</span>\n                    </div>\n                    <button type=\"button\" className=\"mly-coordinate-copy\" disabled={!onCopyCoordinates}\n                      title=\"Copy latitude, longitude as signed decimal degrees\"\n                      aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`}\n                      onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)}>Copy coordinates</button>\n                  </div>\n                </details>\n              )}\n\n              {/* Locked creator tag */}\n",
              "after": "\n              {/* Coordinates */}\n              {currentImg && (\n                <details className=\"mly-image-coordinates\"><summary>Coordinates</summary>\n                  <button type=\"button\" className=\"mly-coordinate-card\" disabled={!onCopyCoordinates}\n                    title=\"Click or tap to copy latitude, longitude\"\n                    aria-label={`Copy coordinates ${currentImg.lat.toFixed(6)}, ${currentImg.lon.toFixed(6)}`}\n                    onClick={() => onCopyCoordinates?.(currentImg.lat, currentImg.lon)}>\n                    <span className=\"mly-coordinate-value\" aria-label={`Latitude ${currentImg.lat.toFixed(6)} degrees`}>\n                      <span>{Math.abs(currentImg.lat).toFixed(6)}<small>\u00b0</small></span>\n                      <span className=\"mly-coordinate-direction\">{currentImg.lat < 0 ? \"S\" : \"N\"}</span>\n                    </span>\n                    <span className=\"mly-coordinate-value\" aria-label={`Longitude ${currentImg.lon.toFixed(6)} degrees`}>\n                      <span>{Math.abs(currentImg.lon).toFixed(6)}<small>\u00b0</small></span>\n                      <span className=\"mly-coordinate-direction\">{currentImg.lon < 0 ? \"W\" : \"E\"}</span>\n                    </span>\n                  </button>\n                </details>\n              )}\n\n              {/* Locked creator tag */}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/infoBox.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/infoBox.ts block 1",
              "before": ".mly-info-panel .mly-info-more { margin-top: 0; }\n.mly-info-panel .mly-info-more > summary { padding: 5px 4px; font-size: 8px; }\n@media (hover:hover) { .mly-info-panel .mly-info-quick button:hover { background: #ffffff20; } }\n\n.mly-info-panel .mly-coordinate-card { margin: 0 0 4px; padding: 5px 4px 0; border: 1px solid #8ab89b2e; border-radius: 5px; background: linear-gradient(145deg,rgba(120,175,143,.09),rgba(10,23,17,.22)); }\n.mly-info-panel .mly-coordinate-value { display: flex; align-items: baseline; justify-content: space-between; gap: 2px; color: #e0eee5; font-size: 9px; line-height: 1.8; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.mly-info-panel .mly-coordinate-value small { font-size: 8px; opacity: .55; padding-left: 1px; }\n.mly-info-panel .mly-coordinate-direction { color: #8ed4ac; font-size: 8px; font-weight: 600; }\n.mly-info-panel .mly-coordinate-copy { width: 100%; margin-top: 3px; padding: 4px 0; border: 0; border-top: 1px solid #ffffff14; border-radius: 0; background: transparent; color: #9edabb; cursor: copy; font: inherit; font-size: 8px !important; min-height: 24px !important; }\n.mly-info-panel .mly-coordinate-copy:disabled { opacity: .45; cursor: default; }\n@media (hover:hover) { .mly-info-panel .mly-coordinate-copy:enabled:hover { color: #d8ffe8; background: #ffffff08; } }\n@media (max-width: 480px) {\n  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }\n  .mly-info-panel .info-box button { min-height: 24px; }\n}\n",
              "after": ".mly-info-panel .mly-info-more { margin-top: 0; }\n.mly-info-panel .mly-info-more > summary { padding: 5px 4px; font-size: 8px; }\n@media (hover:hover) { .mly-info-panel .mly-info-quick button:hover { background: #ffffff20; } }\n\n.mly-info-panel .mly-coordinate-card { width: 100%; box-sizing: border-box; text-align: left; cursor: copy; font: inherit; margin: 0 0 4px; padding: 5px 4px; border: 1px solid #8ab89b2e; border-radius: 5px; background: linear-gradient(145deg,rgba(120,175,143,.09),rgba(10,23,17,.22)); }\n.mly-info-panel .mly-coordinate-value { display: flex; align-items: baseline; justify-content: space-between; gap: 2px; color: #e0eee5; font-size: 9px; line-height: 1.8; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.mly-info-panel .mly-coordinate-value small { font-size: 8px; opacity: .55; padding-left: 1px; }\n.mly-info-panel .mly-coordinate-direction { color: #8ed4ac; font-size: 8px; font-weight: 600; }\n.mly-info-panel .mly-coordinate-card:disabled { opacity: .45; cursor: default; }\n@media (hover:hover) { .mly-info-panel .mly-coordinate-card:enabled:hover { border-color: #8ed4ac88; } }\n\n@media (max-width: 480px) {\n  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }\n  .mly-info-panel .info-box button { min-height: 24px; }\n}\n"
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
const prefix = 'coordinate-inline-copy-v6-16-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.16 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'coordinate-inline-copy-v6-16' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.16 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.16 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.16 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-coordinate-inline-copy-v6-16.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Coordinate copying v6.16 is already installed. No files changed.');
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
  const manifest = { installer: 'coordinate-inline-copy-v6-16', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Coordinate copying v6.16 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
