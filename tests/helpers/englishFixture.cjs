/** English bindings for isolated runtime snippets; no React, SDK, requests or production overrides. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '../..');
const cache = new Map();
const compile = source => ts.transpileModule(source, { fileName: 'fixture.tsx', compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, jsxFactory: 'jsx',
} }).outputText;

/** Load actual pure localization modules so messages/formatters cannot drift into a second test catalog. */
function loadPure(relative) {
  const file = path.join(root, relative);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  new Function('require', 'module', 'exports', compile(fs.readFileSync(file, 'utf8')))(id => {
    if (!id.startsWith('.')) throw Error('Unexpected localization dependency: ' + id);
    return loadPure(path.relative(root, path.resolve(path.dirname(file), id) + '.ts'));
  }, module, module.exports);
  return module.exports;
}
const { englishPresentation } = loadPure('src/i18n/PresentationText.ts');
const { en } = loadPure('src/i18n/messages.ts');
const { message } = loadPure('src/i18n/core.ts');
const locale = { owned: englishPresentation.text, formatLocale: 'en-US' };

// Evaluate the shipped wrapper bodies with deterministic memo/context adapters.
// Wrapper identity stays explicit; unknown functional components are not rendered by the recorder.
const source = fs.readFileSync(path.join(root, 'src/i18n/WidgetLocale.tsx'), 'utf8');
const ast = ts.createSourceFile('WidgetLocale.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declarations = ast.statements.filter(n => ts.isVariableStatement(n) && n.declarationList.declarations.some(d => ['OwnedMessage', 'OwnedNumber'].includes(d.name.getText(ast))));
assert.equal(declarations.length, 2);
const fragment = Symbol('fixture-fragment');
const React = { Fragment: fragment, useMemo: factory => factory() };
const fragmentJsx = (type, props, ...children) => { assert.equal(type, fragment); return children.length === 1 ? children[0] : children; };
const wrappers = { exports: {} };
new Function('React', 'jsx', 'useWidgetLocale', 'exports', compile(declarations.map(n => n.getText(ast)).join('\n')))(React, fragmentJsx, () => locale, wrappers.exports);
const { OwnedMessage, OwnedNumber } = wrappers.exports;

/** Resolve only known text-only localization wrappers; preserve ordinary recorded elements and icons. */
function localizeJsx(record) {
  return (type, props, ...children) => type === OwnedMessage || type === OwnedNumber
    ? type(props || {}) : record(type, props, ...children);
}
const jsx = localizeJsx((tag, props, ...children) => ({ tag, props: props || {}, children }));

/** Supply a real English host to isolated widget methods; fail unknown keys instead of masking omissions. */
function bindEnglish(widget) {
  widget._t = (key, values) => { assert(Object.hasOwn(en, key), 'Unknown fixture message key: ' + key); return message(en, key, values); };
  widget._owned = englishPresentation.text;
  widget._presentation = englishPresentation;
  widget._runtimeLocale = { locale: 'en', formatLocale: 'en-US', direction: 'ltr' };
  return widget;
}

/** Intercept the localization boundary only; unrelated imports must use each suite's explicit mock. */
function localeRequire(fallback) {
  return id => id.endsWith('/WidgetLocale') ? { OwnedMessage, OwnedNumber }
    : id.endsWith('/PresentationText') ? { englishPresentation }
    : id === 'jimu-core' ? (() => { const value = fallback(id); return { ...value, ...(value.jsx ? { jsx: localizeJsx(value.jsx) } : {}) }; })()
    : fallback(id);
}

/** Evaluate existing snippets with explicit locale globals; preserve their supplied clocks/SDK/writers. */
function englishFunction(...parameters) {
  const body = parameters.pop();
  const globals = { OwnedMessage, OwnedNumber, englishPresentation, jsx };
  const names = Object.keys(globals).filter(name => !parameters.includes(name));
  const evaluate = new Function(...names, ...parameters, body);
  return (...values) => evaluate(...names.map(name => globals[name]), ...values.map((value, i) => {
    if (parameters[i] === 'require') return localeRequire(value);
    if (parameters[i] === 'jsx') return localizeJsx(value);
    if (parameters[i] === 'React') return { ...value, createElement: localizeJsx(value.createElement) };
    return value;
  }));
}

/** Canonicalize only rendered toast text nodes; retain elements, props/styles, values and all non-toast events. */
function feedbackTrace(trace) {
  function element(node) {
    if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return node;
    const children = []; let text = '';
    const preformatted = /^(pre|pre-wrap|break-spaces)$/.test(node.props?.style?.whiteSpace || '') || (node.tag || node.type) === 'pre';
    const flush = () => { const rendered = preformatted ? text : text.replace(/[ \t\r\n]+/g, ' ').trim(); if (rendered) children.push(rendered); text = ''; };
    for (const child of node.children.flat(Infinity)) {
      if (typeof child === 'string' || typeof child === 'number') text += String(child);
      else if (child !== null && child !== undefined && typeof child !== 'boolean') { flush(); children.push(element(child)); }
    }
    flush(); return { ...node, children };
  }
  return trace.map(event => event[0] === 'toast' ? [event[0], element(event[1]), ...event.slice(2)] : event);
}
module.exports = { englishFunction, bindEnglish, feedbackTrace, localizeJsx, OwnedMessage, OwnedNumber, englishPresentation };
