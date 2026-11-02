#!/usr/bin/env node
/** Run the focused interaction suite with the caller's existing dependency paths. */
'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--browser')) {
  console.error('Usage: node tools/test-interaction-ux.cjs [--browser]');
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
const suites = ['hoverFailureIsolation','nearestLoadedFrame','coverageClickDispatch',
  'sequenceFeedbackScheduling','imageFirstSelection','sequencePerformance',
  'sequencePerformanceRuntime','hoverBearingRuntime','hoverBearingTarget',
  'hoverPreviewCache','coverageHoverRuntime','nativeTileHighlightCache','tileSequenceHighlights'];
let total = 0;
for (const suite of suites) {
  const result = spawnSync(process.execPath, ['--test-reporter=tap', 'tests/' + suite + '.test.cjs'], {
    cwd: root, env: process.env, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    console.error('FAIL: ' + suite);
    process.stderr.write(result.stdout || ''); process.stderr.write(result.stderr || '');
    if (result.error) console.error(result.error.message);
    process.exit(1);
  }
  const match = /^# tests (\d+)$/m.exec(result.stdout);
  if (!match) { console.error('Missing test summary: ' + suite); process.exit(1); }
  total += Number(match[1]);
  console.log('PASS: ' + suite + ' (' + match[1] + ')');
}
console.log(total + ' targeted tests passed.');
if (args.includes('--browser')) {
  const result = spawnSync(process.execPath, ['tests/hoverThumbnailRetention.browser.cjs'], {
    cwd: root, env: process.env, stdio: 'inherit',
  });
  if (result.error || result.status !== 0) { if (result.error) console.error(result.error.message); process.exit(1); }
} else console.log('Browser thumbnail checks: not run (add --browser).');
console.log('The full Experience Builder build and live-host visual checks are separate.');
