#!/usr/bin/env node
'use strict';
/**
 * Workspace invitation and member spacing. Compatible current v6 sources.
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
      "file": "src/features/community-notes/CommunityWorkspacePanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Invitation and member layout 1",
              "before": "        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!chosenCategory||!notes.some(note=>note.id===localId))}\n        </div>\n      </details>}\n      {owner&&<details style={sectionStyle}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>\n        <label style={field}>{text('Invitation role')}<select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value=\"contributor\">{text('Contributor')}</option><option value=\"reader\">{text('Reader')}</option></select></label>\n        <label style={field}>{text('Maximum joins')}<input style={input} type=\"number\" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></label>\n        {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}\n        {shareText&&<label style={field}>{text('Share these invitation details')}<textarea aria-label={text('Share these invitation details')} style={input} readOnly value={shareText} onFocus={event=>event.currentTarget.select()} /></label>}\n        {action('Refresh members and invitations',()=>loadPage())}\n        {invites.map(item=><div key={item.id} style={card}><span>{item.role} \u00b7 {item.uses}/{item.max_uses} \u00b7 {item.expires_at}</span>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>)}\n        {members.map(member=><div key={member.user_id} style={card}><span>{member.user_id} \u00b7 {member.role}</span>{action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}{action('Remove member',()=>setRemoval({kind:'member',id:member.user_id}))}</div>)}\n      </details>}\n      <div ref={resultsRef} tabIndex={-1} role=\"region\" aria-label={text('Loaded contributions')} style={row}><h3 style={headingStyle}>{text('Loaded contributions')} ({records.length})</h3>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>\n      {contributionCards}\n      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n",
              "after": "        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!chosenCategory||!notes.some(note=>note.id===localId))}\n        </div>\n      </details>}\n      {owner&&<details style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>\n        {/* Give disclosure content an explicit inner layout and logical indentation. */}\n        <div style={{display:'grid',gap:16,minWidth:0,paddingTop:10,paddingInlineStart:8,borderInlineStart:'2px solid #496052'}}>\n          <div style={{...card,gap:12}}>\n            <strong>{text('Create invitation')}</strong>\n            <div style={{display:'grid',gap:12,minWidth:0,gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 220px), 1fr))'}}>\n              <label style={field}>{text('Invitation role')}<select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value=\"contributor\">{text('Contributor')}</option><option value=\"reader\">{text('Reader')}</option></select></label>\n              <label style={field}>{text('Maximum joins')}<input style={input} type=\"number\" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></label>\n            </div>\n            {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}\n            {shareText&&<label style={{...field,gap:6}}>{text('Share these invitation details')}<textarea aria-label={text('Share these invitation details')} style={{...input,minHeight:96,resize:'vertical',fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',fontSize:11,lineHeight:1.5}} readOnly value={shareText} onFocus={event=>event.currentTarget.select()} /></label>}\n          </div>\n          <div style={row}>{action('Refresh members and invitations',()=>loadPage())}</div>\n          {!!invites.length&&<div style={{display:'grid',gap:8,minWidth:0}}>\n            <strong>{text('Invitations')}</strong>\n            {invites.map(item=><div key={item.id} style={{...card,gap:10}}>\n              <span>{item.role} \u00b7 {item.uses}/{item.max_uses} \u00b7 {item.expires_at}</span>\n              <div style={row}>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>\n            </div>)}\n          </div>}\n          {!!members.length&&<div style={{display:'grid',gap:8,minWidth:0}}>\n            <strong>{text('Members')}</strong>\n            {members.map(member=><div key={member.user_id} style={{...card,gap:10}}>\n              <span style={{overflowWrap:'anywhere'}}>{member.user_id} \u00b7 {text(member.role==='reader'?'Reader':'Contributor')}</span>\n              <div style={{...row,gap:8}}>\n                {action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}\n                {action('Remove member',()=>setRemoval({kind:'member',id:member.user_id}))}\n              </div>\n            </div>)}\n          </div>}\n        </div>\n      </details>}\n\n      <div ref={resultsRef} tabIndex={-1} role=\"region\" aria-label={text('Loaded contributions')} style={row}><h3 style={headingStyle}>{text('Loaded contributions')} ({records.length})</h3>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>\n      {contributionCards}\n      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n"
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
const prefix = 'workspace-member-spacing-';

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
    if (manifest.installer !== 'workspace-member-spacing' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-member-spacing.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace invitation and member spacing is already installed. No files changed.');
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
  const manifest = { installer: 'workspace-member-spacing', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Workspace invitation and member spacing ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
