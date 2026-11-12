/** Browser fixtures compile current feature modules; only host/locale boundaries are controlled. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const { chromium } = require(process.env.MAPILLARY_PLAYWRIGHT || 'playwright');
const sourceRoot = path.resolve(__dirname, '../../src');
function bundle(entries) {
  const modules = {};
  function add(file) {
    if (modules[file]) return;
    const code = ts.transpileModule(fs.readFileSync(path.join(sourceRoot, file), 'utf8'), {
      fileName: file,
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, jsxFactory: 'jsx' }
    }).outputText;
    const definition = modules[file] = { code, dependencies: {} };
    for (const [, name] of code.matchAll(/require\(["']([^"']+)["']\)/g)) {
      if (name === 'jimu-core' || name.endsWith('WidgetLocale')) continue;
      if (!name.startsWith('.')) throw new Error(`Unsupported fixture dependency: ${name}`);
      const stem = path.posix.normalize(path.posix.join(path.posix.dirname(file), name));
      const target = ['.ts', '.tsx'].map(extension => stem + extension).find(candidate => fs.existsSync(path.join(sourceRoot, candidate)));
      if (!target) throw new Error(`Missing source dependency: ${stem}`);
      definition.dependencies[name] = target;
      add(target);
    }
  }
  entries.forEach(add);
  return modules;
}
function reactScript(name, environment) {
  const file = process.env[environment] || path.join(path.dirname(require.resolve(name + '/package.json')), 'umd', name + '.development.js');
  if (!fs.existsSync(file)) throw new Error(`Set ${environment} to the React 18 UMD development script`);
  return file;
}
async function launch() {
  return chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--no-sandbox'] });
}
async function addReact(page) {
  await page.addScriptTag({ path: reactScript('react', 'REACT_UMD_PATH') });
  await page.addScriptTag({ path: reactScript('react-dom', 'REACT_DOM_UMD_PATH') });
}
module.exports = { bundle, launch, addReact };
