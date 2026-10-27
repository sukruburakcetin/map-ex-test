#!/usr/bin/env node
'use strict';
/**
 * Places popup buttons v6.51. Compatible current v6 sources.
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
      "file": "src/features/places/placePopupStyles.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/placePopupStyles.ts block 1",
              "before": "/** Scope the SDK shell by its owned content; never recolor unrelated map popups. */\nexport const PLACE_POPUP_CSS = `\n.esri-popup__main-container:has(.mly-place-popup){\n  --calcite-color-background:#172b23;--calcite-color-foreground-1:#1b3128;--calcite-color-foreground-2:#243f32;\n  --calcite-color-foreground-3:#2c4b3b;--calcite-color-text-1:#edf3e7;--calcite-color-text-2:#b8cdbd;\n  --calcite-color-text-3:#a4bcae;--calcite-color-border-1:#49685a;--calcite-color-border-2:#395448;\n  --calcite-color-brand:#b5dbb9;--calcite-color-brand-hover:#c6e6c8;--calcite-color-text-inverse:#14271f;\n  background:#1b3128;color:#edf3e7;border:1px solid #49685a;border-radius:10px;\n  box-shadow:0 8px 24px #08170f40;overflow:hidden;\n}\n.esri-popup__main-container:has(.mly-place-popup) .esri-popup__header,\n.esri-popup__main-container:has(.mly-place-popup) .esri-popup__footer{background:#172b23;color:#edf3e7}\n.esri-popup__main-container:has(.mly-place-popup) .esri-popup__header-title{font-size:12px;font-weight:600;letter-spacing:.01em}\n.esri-popup__main-container:has(.mly-place-popup) .esri-popup__button,\n.esri-popup__main-container:has(.mly-place-popup) .esri-popup__action{color:#c4dccb}\n.esri-popup__main-container:has(.mly-place-popup) .esri-popup__content{margin:10px 12px}\n:is(.esri-popup,arcgis-popup):has(.mly-place-popup) .esri-popup__pointer-direction{background:#1b3128}\n.mly-place-popup{box-sizing:border-box;min-width:0;color:#edf3e7;background:#1b3128;font-family:inherit;font-size:12px;line-height:1.45;overflow-wrap:anywhere;color-scheme:dark}\n.mly-place-popup .mly-place-name{display:block;font-size:16px;font-weight:650;line-height:1.3;color:#f3eedb;margin:0 0 5px}\n.mly-place-popup .mly-place-category{display:inline-block;font-size:10px;line-height:1.3;text-transform:capitalize;color:#c4dccb;background:#294537;border:1px solid #49685a;border-radius:4px;padding:3px 6px;margin:0 0 6px}\n.mly-place-popup .mly-place-address{font-size:11px;color:#b8cdbd;margin:3px 0 8px}\n.mly-place-popup .mly-place-website{display:inline-block;font-size:11px;color:#b8e3d2;text-decoration:underline;text-underline-offset:3px;margin:0 0 5px}\n.mly-place-popup .mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #61846e;border-radius:6px;background:#284b38;color:#edf3e7;font-family:inherit;font-weight:600;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer;transition:background .12s}\n.mly-place-popup .mly-place-open-primary{background:#b5dbb9;color:#173426;border-color:#b5dbb9}\n.mly-place-popup .mly-place-open:hover{background:#365d44}\n.mly-place-popup .mly-place-open-primary:hover{background:#c6e6c8;color:#142b20}\n.mly-place-popup .mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup :is(button,a):focus-visible{outline:2px solid #ffda74;outline-offset:2px}\n.mly-place-popup .mly-place-meta{font-size:10px;line-height:1.5;color:#b8cdbd;margin:5px 2px 9px}\n.mly-place-popup .mly-place-source{font-size:10px;line-height:1.5;color:#a4bcae;border-top:1px solid #49685a80;padding-top:8px;margin:11px 0 0}\n@media(prefers-reduced-motion:reduce){.mly-place-popup .mly-place-open{transition:none}}\n`;\n",
              "after": "/** Style only imagery buttons; the popup shell and all other content use SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n`;\n"
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
              "before": "\nThe Places popup uses the widget's dark green palette, a prominent place name, category badge, mint primary imagery action, compact alternative actions, muted metadata and a separated source footer. The style applies only to `.mly-place-popup` and an SDK popup shell containing that owned content (`:has`). ArcGIS/Calcite color variables are scoped to the same shell. Other feature, note and map popups retain their normal theme. Native popup controls and actions remain available.\n\nThe theme uses no assets, requests or new SDK modules. Names/addresses/websites/options continue to use safe DOM text and validated links. Keyboard focus remains visible and the small hover transition respects reduced motion. Popup wrapping and full-width buttons avoid horizontal overflow on narrow layouts. Shell compatibility should be checked against the deployed SDK; browser checks use an SDK-shaped local harness rather than a live portal.\n",
              "after": "\nThe Places popup uses the widget's dark green palette, a prominent place name, category badge, mint primary imagery action, compact alternative actions, muted metadata and a separated source footer. The style applies only to `.mly-place-popup` and an SDK popup shell containing that owned content (`:has`). ArcGIS/Calcite color variables are scoped to the same shell. Other feature, note and map popups retain their normal theme. Native popup controls and actions remain available.\n\nThe theme uses no assets, requests or new SDK modules. Names/addresses/websites/options continue to use safe DOM text and validated links. Keyboard focus remains visible and the small hover transition respects reduced motion. Popup wrapping and full-width buttons avoid horizontal overflow on narrow layouts. Shell compatibility should be checked against the deployed SDK; browser checks use an SDK-shaped local harness rather than a live portal.\n\n\n## Neutral imagery buttons (v6.51)\n\nRemoves the v6.50 popup shell, Calcite token, content, category, link and footer theme. Only the imagery buttons are styled: neutral light backgrounds, subtle borders, compact full-width layout, hover/disabled states and keyboard focus. The SDK's normal popup header/content appearance is restored. Refresh and reopen the popup so an already-open v6.50 DOM stylesheet is replaced.\n"
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
const prefix = 'places-popup-buttons-v6-51-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.51 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-popup-buttons-v6-51' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.51 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.51 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.51 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-popup-buttons-v6-51.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places popup buttons v6.51 is already installed. No files changed.');
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
  const manifest = { installer: 'places-popup-buttons-v6-51', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places popup buttons v6.51 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
