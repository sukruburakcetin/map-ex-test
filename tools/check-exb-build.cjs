#!/usr/bin/env node
'use strict';
/** Isolated module-graph check using an installed Experience Builder client's rules. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function main() {
  const args = process.argv.slice(2), options = {};
  if (args.includes('--help')) {
    console.log('node tools/check-exb-build.cjs --client <Experience Builder client directory> [--dependencies <node_modules directory>] [--out <new directory>]\nBuilds runtime/settings into a temporary directory by default. Does not install packages or change the host widget link. Warnings fail the check. This is not a full host build or a browser test.');
    return;
  }
  for (let i = 0; i < args.length; i += 2) {
    if (!['--client', '--dependencies', '--out'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw Error('Invalid arguments; use --help.');
    if (options[args[i]]) throw Error('Repeated option: ' + args[i]);
    options[args[i]] = args[i + 1];
  }
  if (!options['--client']) throw Error('--client is required; use --help.');
  const client = fs.realpathSync(path.resolve(options['--client']));
  const root = path.resolve(__dirname, '..');
  if (JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')).name !== 'mapillary-explorer') throw Error('Run the checker from the Mapillary Explorer source checkout.');
  const clientPackage = JSON.parse(fs.readFileSync(path.join(client, 'package.json'), 'utf8'));
  if (clientPackage.name !== 'exb-client') throw Error('--client must point to an Experience Builder client directory.');
  const modules = options['--dependencies'] ? fs.realpathSync(path.resolve(options['--dependencies'])) : path.join(client, 'node_modules');
  const dependencies = {};
  for (const name of ['mapillary-js', 'pbf', '@mapbox/vector-tile', 'pako']) {
    const candidates = [...new Set([modules, path.join(client, 'node_modules')])];
    const packageFile = candidates.map(folder => path.join(folder, name, 'package.json')).find(file => fs.existsSync(file));
    if (!packageFile) throw Error('Missing ' + name + '; install the documented widget dependencies in your client first.');
    dependencies[name] = JSON.parse(fs.readFileSync(packageFile, 'utf8')).version;
  }
  const webpack = require(path.join(client, 'node_modules', 'webpack'));
  process.env.NODE_ENV = 'development';
  const common = require(path.join(client, 'webpack', 'webpack.common')).getCommon();
  if (options['--out'] && fs.existsSync(path.resolve(options['--out']))) throw Error('--out must be a new directory.');
  const output = options['--out'] ? path.resolve(options['--out']) : fs.mkdtempSync(path.join(os.tmpdir(), 'mapillary-exb-check-'));
  fs.mkdirSync(output, { recursive: true });
  const rules = common.getModuleRules().map(rule => {
    const next = { ...rule };
    if (next.use) {
      // Keep host transforms; avoid spawning one loader worker per CPU in this isolated check.
      next.use = (Array.isArray(next.use) ? next.use : [next.use])
        .filter(item => (typeof item === 'string' ? item : item.loader) !== 'thread-loader')
        .map(item => typeof item === 'object' && item.loader === 'ts-loader'
          ? { ...item, options: { ...item.options, configFile: path.join(client, 'tsconfig.json'), context: client } } : item);
    }
    return next;
  });
  const config = {
    mode: 'development', context: client, devtool: false, parallelism: 2,
    entry: { runtime: path.join(root, 'src/runtime/widget.tsx'), setting: path.join(root, 'src/setting/setting.tsx') },
    output: { path: output, filename: '[name].js', libraryTarget: 'system' },
    resolve: { alias: common.moduleAlias, extensions: common.extensions, mainFields: common.resolveMainFields,
      modules: [...new Set([modules, path.join(client, 'node_modules'), 'node_modules'])] },
    resolveLoader: { modules: [path.join(client, 'node_modules')] },
    module: { rules }, externals: [common.externalFunction],
    optimization: { minimize: false, splitChunks: false }, performance: false, stats: 'errors-warnings',
  };
  console.log('Experience Builder ' + clientPackage.version + '; dependencies: ' + JSON.stringify(dependencies));
  console.log('Output: ' + output);
  const compiler = webpack(config);
  compiler.run((error, stats) => {
    if (error) { console.error(error); process.exitCode = 1; }
    else {
      const result = stats.toJson({ all: false, errors: true, warnings: true, timings: true });
      fs.writeFileSync(path.join(output, 'build-report.json'), JSON.stringify({ scope: 'isolated-runtime-settings-module-graph', sourceRoot: root, clientVersion: clientPackage.version, dependencies, entries: ['src/runtime/widget.tsx', 'src/setting/setting.tsx'], limits: ['transpile-only host loader', 'no host packaging plugins', 'no browser execution', 'no performance measurement'], ...result }, null, 2));
      console.log(stats.toString({ all: false, errors: true, warnings: true, timings: true }));
      console.log(result.errors.length + ' errors; ' + result.warnings.length + ' warnings.');
      if (stats.hasErrors() || stats.hasWarnings()) process.exitCode = 1;
    }
    compiler.close(closeError => { if (closeError) { console.error(closeError); process.exitCode = 1; } });
  });
}
try { main(); } catch (error) { console.error('Build check stopped: ' + error.message); process.exitCode = 1; }
