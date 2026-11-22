const fs = require('node:fs');
const path = require('node:path');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');

const source = fs.readFileSync(path.join(__dirname, '../../src/features/lifecycle/viewerResize.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;

module.exports = function loadViewerResize(platform = {}) {
  const exports = {};
  new Function('exports', ...Object.keys(platform), compiled)(exports, ...Object.values(platform));
  return exports;
};
