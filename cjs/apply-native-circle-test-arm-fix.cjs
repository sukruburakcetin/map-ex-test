#!/usr/bin/env node
'use strict';
// Standalone Node installer. Save beside the widget's manifest.json.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
const dry = args.includes('--dry-run');
const reverse = args.includes('--uninstall');
const root = fs.realpathSync(process.cwd());
const relative = 'src/features/coverage/NativeCoverageAlignmentDiagnostic.ts';
const file = path.join(root, ...relative.split('/'));
const normalize = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const disableBefore = `  async disable(): Promise<void> {
    this.enabled = false;
`;
const disableAfter = disableBefore + `    if (this.radiusState?.status === 'armed') this.radiusState = { ...this.radiusState, status: 'interrupted' };
`;
const stopBefore = `    if (this.radiusState && ['armed', 'waiting', 'running'].includes(this.radiusState.status)) this.radiusState = { ...this.radiusState, status: 'interrupted' };`;
const stopAfter = `    // New-hover setup clears old visuals before capture; preserve its pending arm.
    if (this.radiusState && ['waiting', 'running'].includes(this.radiusState.status)) this.radiusState = { ...this.radiusState, status: 'interrupted' };`;

/** Reject links in the source path before reading or replacing the file. */
function checkPath() {
  let current = root;
  const parts = relative.split('/');
  parts.forEach((part, index) => {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())) {
      throw new Error('Unsupported source path: ' + relative);
    }
  });
}

/** Accept either the original or installed state without duplicating edits. */
function change(text, label, before, after) {
  const from = reverse ? after : before;
  const to = reverse ? before : after;
  const installed = count(text, after);
  if (installed > 1 || (installed === 1 && count(text.replace(after, ''), before))) {
    throw new Error('Conflict in ' + label + '. No files changed.');
  }
  if (reverse ? installed === 0 : installed === 1) {
    if (count(text, reverse ? before : after) !== 1) throw new Error('Conflict in ' + label + '. No files changed.');
    return text;
  }
  if (count(text, from) !== 1) throw new Error('Conflict in ' + label + '. No files changed.');
  return text.replace(from, () => to);
}

let temporary;
try {
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Supported flags: --dry-run --skip-tests --uninstall');
  checkPath();
  const original = fs.readFileSync(file);
  const stat = fs.lstatSync(file);
  const raw = original.toString('utf8');
  const before = normalize(raw);
  if (!before.includes('  radiusTest(): void')) throw new Error('Install apply-native-circle-anchor-test.cjs first. No files changed.');
  if (before.includes("    if (this.radiusState?.status === 'armed')") && count(before, disableAfter) !== 1) {
    throw new Error('Conflict in locally edited arm cancellation. No files changed.');
  }
  let after = change(before, 'Keep the test armed through hover cleanup', stopBefore, stopAfter);
  after = change(after, 'Explicitly cancel an unused arm on disable', disableBefore, disableAfter);
  if (after === before) {
    console.log(reverse ? 'Arm fix is already removed. No files changed.' : 'Arm fix is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would update only: ' + relative);
    process.exit(0);
  }
  const content = Buffer.from((raw.startsWith('\uFEFF') ? '\uFEFF' : '') + (raw.includes('\r\n') ? after.replace(/\n/g, '\r\n') : after));
  const backups = path.join(root, '.refactor-backups');
  if (!fs.existsSync(backups)) fs.mkdirSync(backups);
  const backupStat = fs.lstatSync(backups);
  if (backupStat.isSymbolicLink() || !backupStat.isDirectory()) throw new Error('Unsupported backup folder. No source files changed.');
  const backup = fs.mkdtempSync(path.join(backups, 'native-circle-arm-'));
  fs.writeFileSync(path.join(backup, 'NativeCoverageAlignmentDiagnostic.ts'), original, { flag: 'wx' });
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ file: relative, reverse, originalSha256: sha(original), resultSha256: sha(content) }, null, 2) + '\n', { flag: 'wx' });
  temporary = file + '.radius-arm-' + process.pid + '-' + Date.now() + '.tmp';
  const descriptor = fs.openSync(temporary, 'wx', stat.mode & 0o777);
  try { fs.writeFileSync(descriptor, content); fs.fsyncSync(descriptor); }
  finally { fs.closeSync(descriptor); }
  checkPath();
  const latest = fs.lstatSync(file);
  if (latest.dev !== stat.dev || latest.ino !== stat.ino || !fs.readFileSync(file).equals(original)) {
    throw new Error('Source changed during installation. No source files changed by this installer.');
  }
  fs.renameSync(temporary, file);
  temporary = undefined;
  console.log(reverse ? 'Circle-test arm fix removed.' : 'Circle-test arm fix installed.');
  console.log('Backup: ' + path.relative(root, backup));
  console.log('Reload the preview and run window.__mlyCoverageAlignment.radiusTest() again.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (temporary) {
    try { fs.unlinkSync(temporary); } catch (_) {}
  }
}