#!/usr/bin/env node
/** Dependency-free source-checkout hygiene check. Does not inspect Git history. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const candidates = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const errors = [];
const files = [...new Set(candidates)].filter(file => fs.existsSync(path.join(root, file)));
for (const file of files) {
  const parts = file.split('/');
  if (parts.some(part => part === '.refactor-backups' || part === '__pycache__' || part.startsWith('.venv')) ||
      /^(?:cjs|places-data)\//.test(file) || /\.(?:py[co]|whl|vtpk)$/.test(file) || parts.some(part => part.endsWith('.gdb')) ||
      ['places-all.geojsonl', 'places-all.manifest.json', 'places-portal.geojson', 'places-service.json', 'places-service.json.bak', 'test.places-area.json'].includes(file)) {
    errors.push(`Generated or local-only file: ${file}`);
  }
}
for (const file of ['README.md', 'CONTRIBUTING.md', 'manifest.json', 'config.json', 'icon.svg', 'src/runtime/widget.tsx', 'src/setting/setting.tsx']) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing widget entry: ${file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
console.log(`${files.length} source files checked; ${errors.length} repository layout errors.`);
