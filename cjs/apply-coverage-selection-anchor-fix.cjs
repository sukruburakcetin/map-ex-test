#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const patchData = [
'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',
'G/ai+xmx+6p/5Q5zsDHoTd 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',
'XwAA',
].join('');
const payload = JSON.parse(zlib.gunzipSync(Buffer.from(patchData, 'base64')).toString('utf8'));
const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'coverage-selection-anchor-';
function conflict(label) {
throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}
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
if (reverse) {
const installedCount = count(text, after);
if (installedCount === 1) return text.replace(after, () => before);
if (installedCount > 1) conflict(block.label);
if (count(text, before) === 1) {
if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited selection fix)');
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
if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-coverage-selection-anchor-fix.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
conflict(entry.file + ' (edited selection fix references remain)');
}
if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
conflict(entry.file + ' (selection fix references differ)');
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
if (skipTests) console.log('Test file writes/removals skipped. Existing tests are preserved; tests are not run by this installer.');
if (!writes.length) {
console.log(uninstall ? 'Selection fix is already uninstalled. No files changed.' : 'Selection fix is already installed. No files changed.');
process.exit(0);
}
if (dry) {
console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
process.exit(0);
}
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
fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'coverage-selection-anchor-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
console.log('Coverage selection anchor fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
console.log('Backup: ' + backupRelative);
console.log('Rebuild/reload Experience Builder before testing. Check that an individual hovered image opens and its green marker stays at the picked tile point.');
} catch (error) {
console.error(error.message);
process.exitCode = 1;
}