#!/usr/bin/env node
'use strict';
/** Run all portable Node suites with explicit host/test dependencies; failures remain failures. */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

/** Resolve modules from a reviewed dependency directory without installing or changing the host. */
function resolveEnvironment(client, dependencies) {
  if (JSON.parse(fs.readFileSync(path.join(client, 'package.json'), 'utf8')).name !== 'exb-client') {
    throw Error('--client must name an Experience Builder client directory.');
  }
  const folders = [...new Set([dependencies, path.join(client, 'node_modules')].filter(Boolean))];
  const modules = {};
  for (const name of ['typescript', 'react', 'react-dom', 'react-test-renderer', 'jsdom', '@electric-sql/pglite', 'mapillary-js', 'pbf', '@mapbox/vector-tile', 'pako']) {
    try { modules[name] = require.resolve(name, { paths: folders.map(folder => path.dirname(folder)) }); }
    catch { throw Error('Missing test/runtime dependency: ' + name + '. See docs/development/portable-tests.md.'); }
  }
  const reactVersion = require(modules.react).version;
  const rendererVersion = JSON.parse(fs.readFileSync(require.resolve('react-test-renderer/package.json', { paths: folders.map(folder => path.dirname(folder)) }), 'utf8')).version;
  const dom = require(modules['react-dom']);
  if (rendererVersion !== reactVersion || dom.version !== reactVersion) {
    throw Error('React, React DOM and react-test-renderer must have matching versions.');
  }
  const rendererReact = require(require.resolve('react', { paths: [path.dirname(modules['react-test-renderer'])] }));
  const domReact = require(require.resolve('react', { paths: [path.dirname(modules['react-dom'])] }));
  if (rendererReact !== require(modules.react) || domReact !== require(modules.react)) {
    throw Error('React renderer dependencies resolve to different React instances; use one isolated test dependency directory.');
  }
  return { folders, modules, reactVersion };
}

/** Summarize TAP without treating execution errors as confirmed product defects or suppressing failures. */
function summarize(tap, exitCode) {
  const number = key => { const matches = [...tap.matchAll(new RegExp('^# ' + key + ' (\\d+)$', 'gm'))]; return matches.length ? Number(matches.at(-1)[1]) : null; };
  const failures = [...tap.matchAll(/^not ok \d+ - (.*)$/gm)].map((match, i, all) => {
    const block = tap.slice(match.index, all[i + 1]?.index ?? tap.length);
    const location = block.match(/^\s+location: ['"]([^'"\n]+)/m)?.[1];
    const reason = block.match(/^\s+(?:error|message):\s*(.*)$/m)?.[1] || '';
    const category = /Cannot find module/.test(block) ? 'missing-dependency' : /(?:ReferenceError|SyntaxError|TypeError)/.test(block) ? 'execution-error' : /ERR_ASSERTION|AssertionError/.test(block) ? 'assertion' : 'unclassified';
    return { name: match[1], location, category, reason, diagnostic: block.slice(0, 5000) };
  });
  return { exitCode, tests: number('tests'), passed: number('pass'), failed: number('fail'), skipped: number('skipped'), failures };
}

/** Preflight every dependency, then execute the complete portable suite; browser/Python/host builds are separate. */
function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log('node tools/check-portable-tests.cjs --client <ExB client> [--dependencies <node_modules>] [--report <new JSON file>] [--preflight]\nRuns every tests/*.test.cjs at concurrency 2. No installs or host edits. Failures produce a nonzero exit. See docs/development/portable-tests.md.');
    return;
  }
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--client', '--dependencies', '--report', '--preflight'].includes(key) || Object.hasOwn(options, key)) throw Error('Invalid/repeated option; use --help.');
    if (key === '--preflight') options[key] = true;
    else { const value = args[++i]; if (!value || value.startsWith('--')) throw Error('Missing option value; use --help.'); options[key] = value; }
  }
  if (!options['--client']) throw Error('--client is required.');
  const root = path.resolve(__dirname, '..');
  const client = fs.realpathSync(path.resolve(options['--client']));
  const dependencies = options['--dependencies'] ? fs.realpathSync(path.resolve(options['--dependencies'])) : undefined;
  const reportFile = options['--report'] && path.resolve(options['--report']);
  if (reportFile && (fs.existsSync(reportFile) || !fs.existsSync(path.dirname(reportFile)))) throw Error('--report must name a new file in an existing directory.');
  const environment = resolveEnvironment(client, dependencies);
  const tests = fs.readdirSync(path.join(root, 'tests')).filter(file => file.endsWith('.test.cjs')).sort().map(file => 'tests/' + file);
  if (!tests.length) throw Error('No portable test files found.');
  console.log('Dependency preflight passed; React ' + environment.reactVersion + '; ' + tests.length + ' portable test files.');
  if (options['--preflight']) return;
  const env = { ...process.env,
    NODE_PATH: [...environment.folders, process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
    MAPILLARY_TYPESCRIPT: environment.modules.typescript,
    MAPILLARY_REACT: environment.modules.react,
    MAPILLARY_REACT_TEST_RENDERER: environment.modules['react-test-renderer'],
    MAPILLARY_PGLITE: environment.modules['@electric-sql/pglite'],
  };
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--test-concurrency=2', ...tests], { cwd: root, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  const report = { scope: 'all-portable-node-suites', node: process.version, react: environment.reactVersion, files: tests.length,
    dependencies: environment.modules, ...summarize(result.stdout || '', result.status),
    limits: ['Failure categories are triage hints, not root-cause attribution.', 'No browser, Python, host typecheck or production-build acceptance.'] };
  if (reportFile) fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log('Tests: ' + report.tests + '; passed: ' + report.passed + '; failed: ' + report.failed + '.');
  for (const failure of report.failures.slice(0, 8)) console.log('FAIL [' + failure.category + '] ' + failure.name);
  if (reportFile) console.log('Report: ' + reportFile);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0 || !report.tests || report.failed !== 0) process.exitCode = 1;
}
module.exports = { resolveEnvironment, summarize };
if (require.main === module) { try { main(); } catch (error) { console.error('Portable check stopped: ' + error.message); process.exitCode = 1; } }
