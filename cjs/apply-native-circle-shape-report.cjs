#!/usr/bin/env node
'use strict';
// Save as apply-native-circle-shape-report.cjs beside manifest.json.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
const dry = args.includes('--dry-run');
const reverse = args.includes('--uninstall');
const root = fs.realpathSync(process.cwd());
const relative = 'src/features/coverage/nativeCircleMeasurement.ts';
const file = path.join(root, ...relative.split('/'));
const normalize = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const blocks = [
  { label: "Report exact shape checks", before: `  if (bounds.width < 3 || bounds.height < 3 || bounds.width > 12 || bounds.height > 12 || bounds.width / bounds.height < 0.5 || bounds.width / bounds.height > 2 ||
      fillFraction < 0.4 || Math.abs(centerDelta.x) > 1 || Math.abs(centerDelta.y) > 1) fail('invalid-circle-shape');
  return { pixelCount: c.count, centroid, bounds,
    quality: { components: 1, areaCssPixels: c.count / sx / sy, fillFraction, boundsCenterMinusCentroid: centerDelta },
    readback: { width, height, scaleX: sx, scaleY: sy, area } };`,
    after: `  const aspectRatio = bounds.width / bounds.height;
  const failedChecks: string[] = [];
  if (bounds.width < 3 || bounds.width > 12) failedChecks.push('width-outside-3-12-css-pixels');
  if (bounds.height < 3 || bounds.height > 12) failedChecks.push('height-outside-3-12-css-pixels');
  if (aspectRatio < 0.5 || aspectRatio > 2) failedChecks.push('aspect-ratio-outside-0.5-2');
  if (fillFraction < 0.4) failedChecks.push('fill-fraction-below-0.4');
  if (Math.abs(centerDelta.x) > 1 || Math.abs(centerDelta.y) > 1) failedChecks.push('centroid-asymmetry-over-1-css-pixel');
  return { pixelCount: c.count, centroid, bounds,
    quality: { components: 1, areaCssPixels: c.count / sx / sy, fillFraction, aspectRatio,
      boundsCenterMinusCentroid: centerDelta, failedChecks },
    readback: { width, height, scaleX: sx, scaleY: sy, area } };` },
  { label: "Discard stale rejected candidates", before: `        if (result.status === 'measured') result = { status: error instanceof MeasurementFailure ? error.code : 'sdk-failed' };`,
    after: `        if (result.status === 'measured' || result.status === 'invalid-circle-shape') result = { status: error instanceof MeasurementFailure ? error.code : 'sdk-failed' };` },
  { label: "Keep unaccepted candidate measurements", before: `    result = { status: 'measured', ...measured, projected: origin, basis: { x: xBasis, y: yBasis, determinant },
      deltaPixels, deltaTileUnits, pose: Object.fromEntries(Object.entries(pose).filter(([, value]) => finite(value))),
      tile: tile.slice(), raw: { x: raw.x, y: raw.y }, extent, stylesAdded: owned.length };`,
    after: `    const details = { ...measured, projected: origin, basis: { x: xBasis, y: yBasis, determinant },
      deltaPixels, deltaTileUnits, pose: Object.fromEntries(Object.entries(pose).filter(([, value]) => finite(value))),
      tile: tile.slice(), raw: { x: raw.x, y: raw.y }, extent, stylesAdded: owned.length };
    // Preserve rejected candidates for investigation without reporting a trusted measurement.
    result = measured.quality.failedChecks.length
      ? { status: 'invalid-circle-shape', candidate: details }
      : { status: 'measured', ...details };` },
];

/** Validate every path component before replacing the existing helper. */
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

/** Recognize the original and installed state without duplicating an edit. */
function change(text, block) {
  const { before, after, label } = block;
  const installed = count(text, after);
  if (installed > 1 || (installed === 1 && count(text.replace(after, ''), before))) {
    throw new Error('Conflict in ' + label + '. No files changed.');
  }
  if (installed === 1) return reverse ? text.replace(after, () => before) : text;
  if (count(text, before) !== 1) throw new Error('Conflict in ' + label + '. No files changed.');
  return reverse ? text : text.replace(before, () => after);
}

let temporary;
try {
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Supported flags: --dry-run --skip-tests --uninstall');
  checkPath();
  const stat = fs.lstatSync(file);
  const original = fs.readFileSync(file);
  const raw = original.toString('utf8');
  const before = normalize(raw);
  let after = before;
  for (const block of reverse ? [...blocks].reverse() : blocks) after = change(after, block);
  if (after === before) {
    console.log(reverse ? 'Shape report is already removed. No files changed.' : 'Shape report is already installed. No files changed.');
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
  const backup = fs.mkdtempSync(path.join(backups, 'native-circle-shape-'));
  fs.writeFileSync(path.join(backup, 'nativeCircleMeasurement.ts'), original, { flag: 'wx' });
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ file: relative, reverse, originalSha256: sha(original), resultSha256: sha(content) }, null, 2) + '\n', { flag: 'wx' });
  temporary = file + '.shape-report-' + process.pid + '-' + Date.now() + '.tmp';
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
  console.log(reverse ? 'Shape report removed.' : 'Shape report installed.');
  console.log('Updated: ' + relative);
  console.log('Backup: ' + path.relative(root, backup));
  console.log('Rebuild/reload the preview, then repeat the same measurement at the higher zoom.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (temporary) {
    try { fs.unlinkSync(temporary); } catch (_) {}
  }
}