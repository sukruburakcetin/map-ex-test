const assert = require('node:assert/strict');
const path = require('node:path');

async function loadReact(page) {
 const reactUmd = process.env.REACT_UMD_PATH;
 const reactDomUmd = process.env.REACT_DOM_UMD_PATH;
 if (reactUmd || reactDomUmd) {
  assert(reactUmd && reactDomUmd, 'Set both React UMD paths or omit both to bundle installed React.');
  await page.addScriptTag({ path: reactUmd });
  await page.addScriptTag({ path: reactDomUmd });
  return;
 }
 const esbuild = require('esbuild');
 const source = [
  'import React from ' + JSON.stringify(require.resolve('react')) + ';',
  'import ReactDOM from ' + JSON.stringify(require.resolve('react-dom')) + ';',
  'import { createRoot } from ' + JSON.stringify(require.resolve('react-dom/client')) + ';',
  'Object.assign(window, { React, ReactDOM: { ...ReactDOM, createRoot } });',
 ].join('\n');
 const bundled = await esbuild.build({
  stdin: { contents: source, sourcefile: 'translated-buttons-react.js', resolveDir: path.resolve(__dirname, '../..') },
  bundle: true, write: false, platform: 'browser',
  define: { 'process.env.NODE_ENV': JSON.stringify('development') },
 });
 await page.addScriptTag({ content: bundled.outputFiles[0].text });
}
module.exports = { loadReact };
