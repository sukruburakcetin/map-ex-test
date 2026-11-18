const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/viewerPresentation.baseline.json')));
const widget = fs.readFileSync(path.join(root, 'src/runtime/widget.tsx'), 'utf8');
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, jsxFactory: 'jsx' } }).outputText;
const jsx = (type, props, ...children) => typeof type === 'function' ? type({ ...props, children: children.length === 1 ? children[0] : children }) : ({ type, props: { ...props, children: children.flat() } });
const stub = name => props => ({ type: name, props });
const Icons = new Proxy({}, { get: (_, name) => stub('Icon.' + name) });
const OwnedMessage = stub('OwnedMessage'), ImageryLoading = stub('ImageryLoading'), FullscreenControls = stub('FullscreenControls');
const cache = new Map();
function load(file) {
  file = path.resolve(file); if (cache.has(file)) return cache.get(file);
  const module = { exports: {} }; cache.set(file, module.exports);
  const requireModule = id => {
    if (id === 'jimu-core') return { React: { Fragment: 'Fragment' }, jsx };
    if (id === 'react') return {};
    if (id.endsWith('/Icons')) return Icons;
    if (id.endsWith('/WidgetLocale')) return { OwnedMessage };
    if (id.endsWith('/ImageryLoading')) return { ImageryLoading };
    if (id.endsWith('/FullscreenControls')) return { FullscreenControls };
    const base = path.resolve(path.dirname(file), id);
    return load(['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync));
  };
  new Function('require', 'module', 'exports', compile(fs.readFileSync(file, 'utf8')))(requireModule, module, module.exports);
  return module.exports;
}
const components = {
  ...load(root + '/src/components/ViewerSurface.tsx'),
  ...load(root + '/src/components/FullscreenViewer.tsx'),
  ...load(root + '/src/features/imagery/ImageTray.tsx')
};
const sharedStyles = load(root + '/src/utils/styles.ts');
const names = ['jsx', 'React', 'Icons', 'OwnedMessage', 'ImageryLoading', 'FullscreenControls', 'glassStyles', 'fullscreenOverlayStyle', 'getMinimapContainerStyle', 'children', 'viewerArea', 'fullscreenImage', ...Object.keys(components)];
function evaluate(expression, owner, image) {
  const module = { exports: {} };
  const values = [jsx, { Fragment: 'Fragment' }, Icons, OwnedMessage, ImageryLoading, FullscreenControls, sharedStyles.glassStyles, sharedStyles.fullscreenOverlayStyle, sharedStyles.getMinimapContainerStyle, 'content', 'content', image, ...Object.values(components)];
  new Function(...names, 'exports', compile('export function render() { return (' + expression + '); }'))(...values, module.exports);
  return module.exports.render.call(owner);
}
const ast = ts.createSourceFile('widget.tsx', widget, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function adapter(name) {
  let found;
  function visit(n) {
    if (ts.isJsxSelfClosingElement(n) && n.tagName.getText(ast) === name) found = n.getText(ast);
    if (ts.isJsxElement(n) && n.openingElement.tagName.getText(ast) === name) found = n.openingElement.getText(ast) + '{children}</' + name + '>';
    ts.forEachChild(n, visit);
  }
  visit(ast); assert(found, 'runtime adapter for ' + name); return found;
}
const adapters = { imageTray: adapter('ImageTray'), surface: adapter('ViewerSurface'), fullscreen: adapter('FullscreenViewer').replace('{children}', '{viewerArea}') };
function owner(overrides = {}) {
  const events = [], state = { imageId: null, alternateImages: [], nearbyImages: [], isFetchingAlternates: false, isLoading: false, noImageMessageVisible: false, lassoPolygon: [], showMinimap: true, ...overrides };
  const w = { state, props: { config: {} }, _runtimeLocale: { direction: 'ltr', formatLocale: 'en-US' }, _nearbySelectedId: null, _nearbyPointerInside: false,
    viewerContainer: { current: null }, measureLabelRef: { current: null }, minimapContainer: { current: null },
    _t: key => key, _owned: (source, values) => source + (values ? JSON.stringify(values) : ''),
    setState(patch) { const result = typeof patch === 'function' ? patch(this.state) : patch; events.push(['state', result]); Object.assign(this.state, result); },
    _nearbyDiscovery: { flush: () => events.push(['flush']) }
  };
  for (const name of ['highlightNearbyPin', 'revealDetectionTools', 'refreshNearbyAfterPause', 'selectNearbyImage', '_handleSelectAlternateImage', 'fetchAlternateImages', 'toggleFullscreen', 'copyImageCoordinates', 'cancelNearestFrameSelection', 'handleLassoStart', 'handleLassoMove', 'handleLassoEnd', 'handleLassoCancel']) w[name] = (...args) => events.push([name, ...args]);
  return { w, events };
}
function normalize(node) {
  if (typeof node === 'function') return '<callback>';
  if (Array.isArray(node)) return node.map(normalize);
  if (!node || typeof node !== 'object') return node;
  return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, normalize(v)]));
}
function compare(section, overrides, setup, image) {
  const a = owner(overrides), b = owner(overrides); setup?.(a.w); setup?.(b.w);
  const previous = evaluate(fixture[section], a.w, image), current = evaluate(adapters[section], b.w, image);
  assert.deepEqual(normalize(current), normalize(previous));
  return { previous, current, a, b };
}
function nodes(tree, match) {
  const result = []; function walk(n) { if (Array.isArray(n)) return n.forEach(walk); if (!n || typeof n !== 'object') return; if (match(n)) result.push(n); walk(n.props?.children); } walk(tree); return result;
}
const nearby = { id: 'nearby', captured_at: 1600000000000, thumb_512_url: 'nearby.jpg', creator: { username: 'tester' } };
const associated = { id: 'associated', thumbUrl: 'associated.jpg', capturedAt: 1600000000000, detectionLabel: 'Sign', detectionBounds: { x: .1, y: .2, width: .3, height: .4 } };
for (const tab of [undefined, 'nearby', 'object']) for (const loading of [false, true]) test(`tray structure/styles: ${tab}, loading=${loading}`, () => compare('imageTray', { imageTrayTab: tab, nearbyLoading: loading, nearbyCanExpand: true, selectedFeatureMetadata: { id: 'sign' }, nearbyImages: [nearby], alternateImages: [associated], isFetchingAlternates: loading }));
test('tray error/retry and no-results retain output', () => { compare('imageTray', { alternateImagesError: 'failed' }); compare('imageTray', {}); });
test('pending selection and localized dates retain output', () => compare('imageTray', { nearbyImages: [nearby], alternateImages: [{ ...associated, capturedAt: NaN }], imageId: 'associated' }, w => { w._nearbySelectedId = 'nearby'; w._runtimeLocale.formatLocale = 'tr-TR'; }));
test('both tray panels remain present when tabs change', () => {
  for (const imageTrayTab of ['nearby', 'object']) { const { current } = compare('imageTray', { imageTrayTab, selectedFeatureMetadata: { id: 'sign' } }); assert.equal(nodes(current, n => n.props?.role === 'tabpanel').length, 2); }
});
test('tray actions preserve callback arguments and order', () => {
  const { previous, current, a, b } = compare('imageTray', { nearbyImages: [nearby], alternateImages: [associated], alternateImagesError: 'failed', nearbyCanExpand: true, selectedFeatureMetadata: { id: 'sign' }, selectedFeatureLocation: { lat: 2, lon: 3 } });
  const run = (tree, w) => {
    nodes(tree, n => n.props?.role === 'tab')[1].props.onClick();
    nodes(tree, n => n.props?.title === w._owned('Search a larger sample and show the nearest 20 captures'))[0].props.onClick();
    const panel = nodes(tree, n => n.props?.['aria-label'] === 'appNearbyImages')[0];
    for (const pointerType of ['touch', 'mouse', 'pen']) { panel.props.onPointerEnter({ pointerType }); assert.equal(w._nearbyPointerInside, pointerType !== 'touch'); panel.props.onPointerLeave(); assert.equal(w._nearbyPointerInside, false); }
    const card = nodes(tree, n => n.type === 'div' && !!n.props?.onClick)[0]; const event = { currentTarget: { style: {} } };
    card.props.onMouseEnter(event); assert.equal(event.currentTarget.style.transform, 'scale(1.04)'); card.props.onMouseLeave(event); card.props.onClick();
    nodes(tree, n => n.props?.['aria-label']?.startsWith('Open associated image'))[0].props.onClick();
    const retry = nodes(tree, n => n.type === 'button' && n.props?.children.includes('appRetry'))[0]; retry.props.onClick();
    // Retry reads current selection rather than retaining the selection from render.
    w.state.selectedFeatureMetadata = { id: 'new' }; w.state.selectedFeatureLocation = { lat: 4, lon: 5 }; retry.props.onClick();
  };
  run(previous, a.w); run(current, b.w); assert.deepEqual(b.events, a.events);
});
for (const isLoading of [false, true]) for (const imageId of [null, 'image']) for (const noImageMessageVisible of [false, true]) test(`surface output ${isLoading}/${imageId}/${noImageMessageVisible}`, () => compare('surface', { isLoading, imageId, noImageMessageVisible, featuresLoading: true, isLassoMode: true, lassoPolygon: [[1, 2], [3, 4]], coverageFrameResolving: true, sequenceRouteProgress: 'progress' }, w => { w._lastSuccessfulSelection = {}; w._selectionRetry = { nearestToClick: true }; }));
test('viewer and measurement refs remain empty SDK-owned nodes', () => {
  const { current, b } = compare('surface', {});
  for (const ref of [b.w.viewerContainer, b.w.measureLabelRef]) { const node = nodes(current, n => n.props?.ref === ref)[0]; assert(node); assert.equal(node.props.children.length, 0); }
});
for (const expanded of [false, true]) for (const showMinimap of [false, true]) for (const hideInfoBox of [false, true]) test(`fullscreen ${expanded}/${showMinimap}/${hideInfoBox}`, () => compare('fullscreen', { minimapExpanded: expanded, showMinimap, address: 'Location' }, w => { w.props.config.hideInfoBox = hideInfoBox; w._runtimeLocale.direction = 'rtl'; }, { lat: 1.23456, lon: 7.123456 }));
test('fullscreen empty image and locale fallback retain output', () => compare('fullscreen', {}, w => { w._runtimeLocale = undefined; }));
test('fullscreen controls retain coordinates, toggles and SDK-owned minimap node', () => {
  const { previous, current, a, b } = compare('fullscreen', { minimapExpanded: true, showMinimap: true }, null, { lat: 1, lon: 2 });
  for (const [tree, w] of [[previous, a.w], [current, b.w]]) {
    const controls = nodes(tree, n => n.type === 'FullscreenControls')[0]; controls.props.onExit(); controls.props.onToggleMinimap();
    nodes(tree, n => n.props?.['aria-label'] === 'appCollapseMinimap')[0].props.onClick();
    nodes(tree, n => n.props?.['aria-label'] === 'appCopyCurrentImageCoordinates')[0].props.onClick();
    assert.equal(nodes(tree, n => n.props?.ref === w.minimapContainer)[0].props.children.length, 0);
  }
  assert.deepEqual(b.events, a.events);
});
test('presentation introduces no effects, requests or SDK lifecycle owners', () => {
  for (const file of ['src/components/ViewerSurface.tsx', 'src/components/FullscreenViewer.tsx', 'src/features/imagery/ImageTray.tsx']) {
    const source = fs.readFileSync(root + '/' + file, 'utf8'); assert(!/\b(?:fetch|setTimeout|setInterval|useEffect|useLayoutEffect|createPortal)\s*\(/.test(source)); assert(!/style=\{\{/.test(source));
  }
});
