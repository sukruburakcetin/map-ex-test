#!/usr/bin/env node
'use strict';
/**
 * Inline note workflow status. Compatible current v6 sources.
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
      "file": "src/styles/enterpriseNotes.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Inline workflow state 1",
              "before": "export const enterpriseToolbarStyle: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', fontSize: 10, color: '#b2cbbc' };\nexport const enterpriseRowsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' };\nexport const enterpriseRowStyle: React.CSSProperties = { padding: '5px 8px', flexShrink: 0, borderRadius: 6, background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #35b7c4', color: '#d3e2d9', fontSize: 11 };\n/** Workflow state occupies its own row, separate from navigation/edit actions. */\nexport const enterpriseActionsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6, marginTop: 3 };\nexport const notesWorkflowStatusStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, minWidth: 0, fontSize: 10, color: '#acc8b8' };\nexport const notesRowButtonsStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 };\nexport const notesAttachmentHintStyle: React.CSSProperties = { fontSize: 9, color: '#a0ada5', marginTop: 3 };\nexport const notesSourceHintStyle: React.CSSProperties = { fontSize: 10, color: '#a6c6b4', margin: '2px 0' };\nexport const enterpriseErrorStyle: React.CSSProperties = { color: '#ffb8a6', fontSize: 11 };\n",
              "after": "export const enterpriseToolbarStyle: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', fontSize: 10, color: '#b2cbbc' };\nexport const enterpriseRowsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' };\nexport const enterpriseRowStyle: React.CSSProperties = { padding: '5px 8px', flexShrink: 0, borderRadius: 6, background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #35b7c4', color: '#d3e2d9', fontSize: 11 };\n/** Explicit workflow state shares a wrapping row with actions to conserve panel height. */\nexport const enterpriseActionsStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 3 };\nexport const notesWorkflowStatusStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, minWidth: 0, fontSize: 10, color: '#acc8b8' };\n// Preserve the grouping element without reserving a separate flex item for all buttons.\nexport const notesRowButtonsStyle: React.CSSProperties = { display: 'contents' };\nexport const notesAttachmentHintStyle: React.CSSProperties = { fontSize: 9, color: '#a0ada5', marginTop: 3 };\nexport const notesSourceHintStyle: React.CSSProperties = { fontSize: 10, color: '#a6c6b4', margin: '2px 0' };\nexport const enterpriseErrorStyle: React.CSSProperties = { color: '#ffb8a6', fontSize: 11 };\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/fieldNotes.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Inline workflow state 1",
              "before": "export const noteListCategoryStyle: React.CSSProperties = { fontSize: \"11px\", fontWeight: 600, color: \"#fff\" };\nexport const noteListDeleteStyle: React.CSSProperties = { fontSize: \"11px\", color: \"rgba(255,255,255,0.4)\" };\nexport const noteListShareStyle: React.CSSProperties = { marginLeft: 6, background: \"transparent\", border: \"1px solid #436052\", borderRadius: 4, color: \"#b5edcf\", cursor: \"pointer\" };\n/** Compact non-interactive workflow pill; action buttons remain in their own row. */\nexport const noteListStatusStyle: React.CSSProperties = { maxWidth: \"100%\", minWidth: 0, minHeight: 18, boxSizing: \"border-box\",\n  display: \"inline-flex\", alignItems: \"center\", textAlign: \"start\", padding: \"1px 7px\",\n  fontSize: 10, lineHeight: \"16px\", borderRadius: 9, border: \"none\", whiteSpace: \"normal\", overflowWrap: \"anywhere\", cursor: \"default\" };\n",
              "after": "export const noteListCategoryStyle: React.CSSProperties = { fontSize: \"11px\", fontWeight: 600, color: \"#fff\" };\nexport const noteListDeleteStyle: React.CSSProperties = { fontSize: \"11px\", color: \"rgba(255,255,255,0.4)\" };\nexport const noteListShareStyle: React.CSSProperties = { marginLeft: 6, background: \"transparent\", border: \"1px solid #436052\", borderRadius: 4, color: \"#b5edcf\", cursor: \"pointer\" };\n/** Compact non-interactive workflow pill; its explicit status label distinguishes it from actions. */\nexport const noteListStatusStyle: React.CSSProperties = { maxWidth: \"100%\", minWidth: 0, minHeight: 18, boxSizing: \"border-box\",\n  display: \"inline-flex\", alignItems: \"center\", textAlign: \"start\", padding: \"1px 7px\",\n  fontSize: 10, lineHeight: \"16px\", borderRadius: 9, border: \"none\", whiteSpace: \"normal\", overflowWrap: \"anywhere\", cursor: \"default\" };\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/NOTES-SEARCH.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Inline workflow state 1",
              "before": "\n## Distinguish workflow state from actions\n\nLocal and Enterprise note rows now put the translated `Status` label and current workflow value on their own row. The value uses a compact, borderless, non-interactive pill; navigation and edit buttons occupy the next row and can wrap independently. This prevents `Open` from looking like an instruction to open imagery. Stored status values, filtering, service fields and action callbacks are unchanged. Existing language keys provide all wording; RTL and long status text can wrap within the panel.\n\nApply `apply-note-status-clarity.cjs` after the notes-search render fix, then rebuild/reload. Its standalone uninstaller restores only this presentation change. The expanded browser fixture passes 16 checks, including explicit status labels and non-interactive styling in both sources.\n",
              "after": "\n## Distinguish workflow state from actions\n\nLocal and Enterprise note rows put the translated `Status` label and current workflow value inline with navigation/edit actions. The value uses a compact, borderless, non-interactive pill; the row wraps as needed in compact panels. The button wrapper uses display: contents so each action can wrap independently instead of forcing the whole button group onto another line. This prevents `Open` from looking like an instruction to open imagery. Stored status values, filtering, service fields and action callbacks are unchanged. Existing language keys provide all wording; RTL and long status text can wrap within the panel.\n\nApply `apply-note-status-clarity.cjs` after the notes-search render fix, then rebuild/reload. Its standalone uninstaller restores only this presentation change. The expanded browser fixture passes 16 checks, including explicit status labels and non-interactive styling in both sources.\n\nApply `apply-inline-note-status.cjs` after the status-clarity update to use the compact inline layout. The matching uninstaller restores the separate-row layout. Verified at 480 px and 240 px alongside the existing note-search browser checks.\n"
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
const prefix = 'inline-note-status-';

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
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed inline note workflow status installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'inline-note-status' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after inline note workflow status installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after inline note workflow status installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed inline note workflow status installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-inline-note-status.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Inline note workflow status is already installed. No files changed.');
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
  const manifest = { installer: 'inline-note-status', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Inline note workflow status ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
