#!/usr/bin/env node
'use strict';
// Save beside manifest.json. Enlarges the hit area, preserving circle rendering.
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
const reverse = args.includes('--uninstall');
const dry = args.includes('--dry-run');
const root = fs.realpathSync(process.cwd());
const relative = 'src/utils/turboCoverageUtils.ts';
const file = path.join(root, ...relative.split('/'));

/** Preserve local files and reject links before reading or replacing source. */
function checkPath() {
  let current = root;
  relative.split('/').forEach((part, index, parts) => {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || (index === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())) {
      throw new Error('Unsupported source path: ' + relative);
    }
  });
}

let temporary;
try {
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Supported flags: --dry-run --skip-tests --uninstall');
  checkPath();
  const stat = fs.lstatSync(file);
  const original = fs.readFileSync(file);
  const raw = original.toString('utf8');
  const declarations = [...raw.matchAll(/export const TURBO_LIMITS\s*=\s*\{[^\r\n]*\}\s*as const;/g)];
  if (declarations.length !== 1) throw new Error('Conflict in TURBO_LIMITS declaration. No files changed.');
  const declaration = declarations[0][0];
  const fields = [...declaration.matchAll(/\bhoverRadiusPx\s*:\s*(\d+(?:\.\d+)?)\b/g)];
  const clicks = [...declaration.matchAll(/\bpickRadiusPx\s*:\s*(\d+(?:\.\d+)?)\b/g)];
  if (fields.length !== 1 || !['4', '8'].includes(fields[0][1]) || clicks.length !== 1 || Number(clicks[0][1]) < 8) {
    throw new Error('Custom hover/click radius found. No files changed; preserve local settings.');
  }
  const desired = reverse ? '4' : '8';
  if (fields[0][1] === desired) {
    console.log(reverse ? 'Original hover radius already present. No files changed.' : '8px hover radius already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would update only ' + relative + ': hoverRadiusPx ' + fields[0][1] + ' -> ' + desired);
    process.exit(0);
  }
  const changed = declaration.replace(/(\bhoverRadiusPx\s*:\s*)\d+(?:\.\d+)?\b/, (_, prefix) => prefix + desired);
  const content = Buffer.from(raw.slice(0, declarations[0].index) + changed + raw.slice(declarations[0].index + declaration.length));
  const backups = path.join(root, '.refactor-backups');
  if (!fs.existsSync(backups)) fs.mkdirSync(backups);
  const backupStat = fs.lstatSync(backups);
  if (backupStat.isSymbolicLink() || !backupStat.isDirectory()) throw new Error('Unsupported backup folder. No source files changed.');
  const backup = fs.mkdtempSync(path.join(backups, 'coverage-hover-radius-'));
  fs.writeFileSync(path.join(backup, 'turboCoverageUtils.ts'), original, { flag: 'wx' });
  temporary = file + '.hover-radius-' + process.pid + '-' + Date.now() + '.tmp';
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
  console.log('Updated ' + relative + ': hoverRadiusPx = ' + desired);
  console.log('Backup: ' + path.relative(root, backup));
  console.log('Rebuild/reload the preview and hover the visible circle outline.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (temporary) { try { fs.unlinkSync(temporary); } catch (_) {} }
}