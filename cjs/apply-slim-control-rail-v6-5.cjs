#!/usr/bin/env node
'use strict';
/**
 * Slim glass control rail v6.5. Compatible current v6 sources.
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
      "file": "src/components/ControlBar.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/ControlBar.tsx block 1",
              "before": "        const label = kind === \"signs\" ? \"Traffic signs\" : \"Objects\";\n        return <div className=\"mly-rail-group\" role=\"group\" aria-label={label} key={kind}>\n            <button type=\"button\" className=\"mly-rail-button\" title={label}\n                aria-label={label} aria-pressed={active} onClick={toggle}>\n                <svg aria-hidden=\"true\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.7\" strokeLinejoin=\"round\" strokeLinecap=\"round\">\n                    {kind === \"signs\" ? <React.Fragment><path d=\"M12 3 21 18H3Z\"/><path d=\"M12 8v4m0 3h.01M12 18v4\"/></React.Fragment>\n                        : <React.Fragment><path d=\"m12 3 9 5v9l-9 5-9-5V8Z\"/><path d=\"m3 8 9 5 9-5M12 13v9m-4.5-16.5 9 5\"/></React.Fragment>}\n                </svg>\n                {active && <span className=\"mly-rail-check\" aria-hidden=\"true\">\u2713</span>}\n            </button>\n            {active && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\"\n                title={`Filter ${label.toLowerCase()}`} aria-label={`Filter ${label.toLowerCase()}`}\n",
              "after": "        const label = kind === \"signs\" ? \"Traffic signs\" : \"Objects\";\n        return <div className=\"mly-rail-group\" role=\"group\" aria-label={label} key={kind}>\n            <button type=\"button\" className=\"mly-rail-button\" title={label}\n                aria-label={label} aria-pressed={active} onClick={toggle}>\n                {kind === \"signs\" ? <Icons.AllMapillaryTrafficSigns size={18}/> : <Icons.AllMapillaryObjects size={18}/>}\n                {active && <span className=\"mly-rail-check\" aria-hidden=\"true\">\u2713</span>}\n            </button>\n            {active && <button type=\"button\" className=\"mly-rail-button mly-rail-filter\"\n                title={`Filter ${label.toLowerCase()}`} aria-label={`Filter ${label.toLowerCase()}`}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/controlPanels.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/controlPanels.ts block 1",
              "before": "\n/** Scoped rail rules override legacy sidebar sizing without affecting viewer utilities. */\nexport const controlBarCompactCss = `\n.glass-control-panel.mly-control-rail {\n  --mly-rail-target: 40px;\n  position: absolute; top: 4px; z-index: 10003;\n  display: flex; flex-direction: column; align-items: center;\n  width: calc(var(--mly-rail-target) + 10px); box-sizing: border-box;\n  max-height: calc(100% - 8px) !important; overflow-y: auto; overflow-x: hidden;\n  gap: 4px !important; padding: 4px; scrollbar-width: thin;\n  scrollbar-color: #6c9c83 transparent; overscroll-behavior: contain;\n  border: 1px solid #416756; border-radius: 12px;\n  background: rgba(19,39,31,.96); color: #e7f3ec;\n  box-shadow: 0 3px 12px rgba(0,0,0,.24);\n}\n.glass-control-panel.mly-control-rail::-webkit-scrollbar { display: block; width: 3px; }\n.glass-control-panel.mly-control-rail::-webkit-scrollbar-thumb { background: #6c9c83; border-radius: 3px; }\n.mly-control-rail > *, .mly-control-rail .mly-rail-button { flex-shrink: 0; }\n.mly-control-rail .mly-rail-group { gap: 4px; padding: 0; }\n.mly-control-rail .mly-rail-divider { height: 1px; width: 26px; margin: 2px 0; background: #416756; }\n.mly-control-rail .mly-rail-button {\n  position: relative; width: var(--mly-rail-target); height: var(--mly-rail-target);\n  min-width: var(--mly-rail-target); min-height: var(--mly-rail-target);\n  box-sizing: border-box; display: flex; align-items: center; justify-content: center;\n  padding: 0; margin: 0; border: 1px solid transparent; border-radius: 8px;\n  background: transparent; color: #d8e9df; cursor: pointer; touch-action: manipulation;\n}\n.mly-control-rail .mly-rail-button[aria-pressed=\"true\"],\n.mly-control-rail .mly-rail-button[aria-expanded=\"true\"] {\n  background: #2e6247; border-color: #78bc94; color: #fff;\n}\n.mly-control-rail .mly-rail-button:disabled { opacity: .4; cursor: default; }\n.mly-control-rail .mly-rail-button:focus-visible { outline: 2px solid #c1ffda; outline-offset: -3px; }\n.mly-control-rail .mly-rail-button svg { width: 22px !important; height: 22px !important; pointer-events: none; }\n.mly-control-rail .mly-rail-filter svg { width: 18px !important; height: 18px !important; }\n.mly-control-rail .mly-rail-check { position: absolute; right: 2px; bottom: 0; font-size: 11px; line-height: 14px; font-weight: 700; pointer-events: none; }\n@media (hover: hover) and (pointer: fine) {\n  .mly-control-rail .mly-rail-button:enabled:hover { background: #355744; }\n}\n/* Touch targets grow on phones, tablets and hybrid devices, including narrow embedded widgets. */\n@media (any-pointer: coarse), (max-width: 480px) {\n  .glass-control-panel.mly-control-rail { --mly-rail-target: 44px; }\n}\n@container (max-width: 480px) {\n  .glass-control-panel.mly-control-rail { --mly-rail-target: 44px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .mly-control-rail button[class] { transition: none !important; }\n}\n",
              "after": "\n/** Scoped rail rules override legacy sidebar sizing without affecting viewer utilities. */\nexport const controlBarCompactCss = `\n.glass-control-panel.mly-control-rail {\n  --mly-rail-target: 34px;\n  --mly-rail-height: 34px;\n  position: absolute; top: 4px; z-index: 10003;\n  display: flex; flex-direction: column; align-items: center;\n  width: calc(var(--mly-rail-target) + 6px); box-sizing: border-box;\n  max-height: calc(100% - 8px) !important; overflow-y: auto; overflow-x: hidden;\n  gap: 2px !important; padding: 2px; scrollbar-width: thin;\n  scrollbar-color: #6c9c83 transparent; overscroll-behavior: contain;\n  border: 1px solid rgba(170,205,188,.24); border-radius: 10px;\n  background: rgba(18,31,27,.68);\n  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #e7f3ec;\n  box-shadow: 0 3px 12px rgba(0,0,0,.24);\n}\n.glass-control-panel.mly-control-rail::-webkit-scrollbar { display: block; width: 3px; }\n.glass-control-panel.mly-control-rail::-webkit-scrollbar-thumb { background: #6c9c83; border-radius: 3px; }\n.mly-control-rail > *, .mly-control-rail .mly-rail-button { flex-shrink: 0; }\n.mly-control-rail .mly-rail-group { gap: 1px; padding: 0; }\n.mly-control-rail .mly-rail-divider { height: 1px; width: 18px; margin: 2px 0; background: rgba(170,205,188,.25); }\n.mly-control-rail .mly-rail-button {\n  position: relative; width: var(--mly-rail-target); height: var(--mly-rail-height);\n  min-width: var(--mly-rail-target); min-height: var(--mly-rail-height);\n  box-sizing: border-box; display: flex; align-items: center; justify-content: center;\n  padding: 0; margin: 0; border: 1px solid transparent; border-radius: 8px;\n  background: transparent; color: #d8e9df; cursor: pointer; touch-action: manipulation;\n}\n.mly-control-rail .mly-rail-button[aria-pressed=\"true\"],\n.mly-control-rail .mly-rail-button[aria-expanded=\"true\"] {\n  background: rgba(77,142,103,.23); border-color: rgba(150,210,174,.32); color: #fff;\n}\n.mly-control-rail .mly-rail-button:disabled { opacity: .4; cursor: default; }\n.mly-control-rail .mly-rail-button:focus-visible { outline: 2px solid #c1ffda; outline-offset: -3px; }\n.mly-control-rail .mly-rail-button svg { width: 18px !important; height: 18px !important; pointer-events: none; }\n.mly-control-rail .mly-rail-filter svg { width: 14px !important; height: 14px !important; }\n.mly-control-rail .mly-rail-check { position: absolute; right: 1px; bottom: 0; font-size: 9px; line-height: 14px; font-weight: 700; pointer-events: none; }\n@media (hover: hover) and (pointer: fine) {\n  .mly-control-rail .mly-rail-button:enabled:hover { background: rgba(129,180,149,.18); }\n}\n/* Keep mobile controls compact without shrinking icons or removing filter actions. */\n@media (any-pointer: coarse), (max-width: 480px) {\n  .glass-control-panel.mly-control-rail { --mly-rail-height: 38px; }\n}\n@container (max-width: 480px) {\n  .glass-control-panel.mly-control-rail { --mly-rail-height: 38px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .mly-control-rail button[class] { transition: none !important; }\n}\n"
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
const prefix = 'slim-control-rail-v6-5-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.5 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'slim-control-rail-v6-5' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.5 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.5 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.5 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-slim-control-rail-v6-5.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Slim control rail v6.5 is already installed. No files changed.');
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
  const manifest = { installer: 'slim-control-rail-v6-5', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Slim control rail v6.5 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
