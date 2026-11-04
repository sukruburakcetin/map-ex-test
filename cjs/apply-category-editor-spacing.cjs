#!/usr/bin/env node
'use strict';
/**
 * Category editor spacing. Compatible current v6 sources.
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
      "file": "src/features/community-notes/WorkspaceCategoryEditor.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Category editor spacing 1",
              "before": "import { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { WorkspaceCategory } from './communityWorkspace';\nimport { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';\n\n/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring\n * a category preserves its old assignments/color while preventing new use.\n",
              "after": "import { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { WorkspaceCategory } from './communityWorkspace';\nimport { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceSecondaryButtonStyle as secondary, workspaceCategoryEditorBodyStyle as body, workspaceCategoryEditorRowStyle as categoryRow, workspaceColorInputStyle as colorInput } from '../../styles/communityWorkspace';\n\n/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring\n * a category preserves its old assignments/color while preventing new use.\n"
            },
            {
              "label": "Category editor spacing 2",
              "before": "  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(false);\n  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');\n  return <details ref={sectionRef} style={sectionStyle}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>\n    <p>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>\n    {editing&&<strong>{text('Editing category')}: {name}</strong>}\n    <button type=\"button\" style={secondary} onClick={()=>{setEditing(false);setName('');setColor('#f5a623');}}>{text('Add a new category')}</button>\n    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} readOnly={editing} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>\n    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type=\"color\" value={color} onChange={event=>setColor(event.target.value)} /></label>\n    <button type=\"button\" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>\n    {categories.map(category=><div key={category.name} style={row}>\n      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>{setEditing(true);setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>\n    </div>)}\n  </details>;\n}\n",
              "after": "  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(false);\n  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');\n  return <details ref={sectionRef} style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>\n    {/* Details content needs its own layout container; grid on details itself is inconsistent across browsers. */}\n    <div style={body}>\n    <p style={{margin:0}}>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>\n    <div style={{...row,gap:12,justifyContent:'space-between'}}>\n    {editing&&<strong style={{minWidth:0,overflowWrap:'anywhere'}}>{text('Editing category')}: {name}</strong>}\n    <button type=\"button\" style={secondary} onClick={()=>{setEditing(false);setName('');setColor('#f5a623');}}>{text('Add a new category')}</button>\n    </div>\n    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} readOnly={editing} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>\n    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type=\"color\" style={colorInput} value={color} onChange={event=>setColor(event.target.value)} /></label>\n    <button type=\"button\" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>\n    <div style={{display:'grid',gap:8,minWidth:0}}>\n    {categories.map(category=><div key={category.name} style={categoryRow}>\n      <div style={{...row,flex:'1 1 140px'}}>\n      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}\n      </div>\n      <div style={{...row,gap:8}}>\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>{setEditing(true);setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>\n      </div>\n    </div>)}\n    </div>\n    </div>\n  </details>;\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/communityWorkspace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Category editor spacing 1",
              "before": "/** Pair category color with readable text; long names wrap at controller widths. */\nexport const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,\n  padding:'4px 8px',borderRadius:5,border:'1px solid '+color,background:color+'26',color:'#f3f8f5',fontWeight:700,fontSize:12,minWidth:0,maxWidth:'100%',overflowWrap:'anywhere'});\n",
              "after": "/** Pair category color with readable text; long names wrap at controller widths. */\nexport const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,\n  padding:'4px 8px',borderRadius:5,border:'1px solid '+color,background:color+'26',color:'#f3f8f5',fontWeight:700,fontSize:12,minWidth:0,maxWidth:'100%',overflowWrap:'anywhere'});\n\n/** Explicit inner layout keeps disclosure content spaced in browsers where\n * details does not establish a grid for its anonymous content wrapper. */\nexport const workspaceCategoryEditorBodyStyle: React.CSSProperties = {display:'grid',gap:12,minWidth:0,paddingTop:8};\nexport const workspaceCategoryEditorRowStyle: React.CSSProperties = {...workspaceRowStyle,gap:12,padding:8,border:'1px solid #496052',borderRadius:5};\nexport const workspaceColorInputStyle: React.CSSProperties = {display:'block',width:56,height:36,maxWidth:'100%',boxSizing:'border-box',padding:3,background:'#14251d',border:'1px solid #718d7d',borderRadius:4,cursor:'pointer'};\n"
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
const prefix = 'category-editor-spacing-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'category-editor-spacing' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-category-editor-spacing.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Category editor spacing is already installed. No files changed.');
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
  const manifest = { installer: 'category-editor-spacing', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Category editor spacing ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
