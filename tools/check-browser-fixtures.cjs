#!/usr/bin/env node
'use strict';

const { existsSync, readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const suffix = '.browser.cjs';
const available = readdirSync(path.join(root, 'tests'))
  .filter(file => file.endsWith(suffix))
  .map(file => file.slice(0, -suffix.length))
  .sort();
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--list') {
  console.log(available.join('\n'));
  process.exit(0);
}
const selected = args.length ? [...new Set(args)] : available;
const unknown = selected.filter(name => !available.includes(name));
if (!selected.length || unknown.length) {
  console.error(unknown.length ? 'Unknown browser fixtures: ' + unknown.join(', ') : 'No browser fixtures found.');
  process.exit(1);
}

const dependencies = [
  ['TypeScript', process.env.MAPILLARY_TYPESCRIPT || 'typescript'],
  ['React', 'react'],
  ['React DOM', 'react-dom'],
  ['React DOM client', 'react-dom/client'],
  ['esbuild', 'esbuild', process.env.MAPILLARY_BROWSER_TOOLS],
  ['Playwright', 'playwright'],
  ['Playwright Core', process.env.MAPILLARY_PLAYWRIGHT || 'playwright-core', process.env.MAPILLARY_BROWSER_TOOLS],
];
const missing = [];
const resolved = new Map();
for (const [label, name, location] of dependencies) {
  try {
    resolved.set(label, require.resolve(name, location ? { paths: [location] } : undefined));
  } catch {
    missing.push(label + ' (' + name + ')');
  }
}
if (missing.length) {
  console.error('Browser fixtures could not start. Missing dependencies: ' + missing.join(', '));
  console.error('Install the isolated browser-test dependencies and set NODE_PATH as shown in docs/development/browser-fixtures.md.');
  process.exit(1);
}

const systemChromium = '/usr/bin/chromium';
const chromium = process.env.CHROMIUM_PATH || (process.platform === 'linux' && existsSync(systemChromium)
  ? systemChromium
  : require(resolved.get('Playwright')).chromium.executablePath());
if (!existsSync(chromium)) {
  console.error('Chromium executable not found: ' + chromium);
  console.error('Install Playwright Chromium or set CHROMIUM_PATH to an existing Chromium executable. See docs/development/browser-fixtures.md.');
  process.exit(1);
}
const env = {
  ...process.env,
  CHROMIUM_PATH: chromium,
  MAPILLARY_CHROMIUM: process.env.MAPILLARY_CHROMIUM || chromium,
  PLAYWRIGHT_CHROMIUM_EXECUTABLE: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium,
};
const failed = [];
for (const name of selected) {
  console.log('\n' + name);
  const file = path.join('tests', name + suffix);
  const result = spawnSync(process.execPath, [file], { cwd: root, env, stdio: 'inherit', timeout: 240000 });
  if (result.status === 0) continue;
  failed.push(name);
  console.error(result.error?.message || 'Fixture exited with ' + (result.signal || result.status));
}
console.log('\n' + (selected.length - failed.length) + '/' + selected.length + ' browser fixtures passed.');
if (failed.length) {
  console.error('Failed browser fixtures: ' + failed.join(', '));
  process.exitCode = 1;
}
