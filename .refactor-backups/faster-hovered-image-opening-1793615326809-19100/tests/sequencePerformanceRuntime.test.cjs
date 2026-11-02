const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '..');
const compile = source => ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const modules = new Map();
function load(relative) {
  if (modules.has(relative)) return modules.get(relative);
  const module = { exports: {} };
  modules.set(relative, module.exports);
  new Function('require', 'module', 'exports', compile(fs.readFileSync(path.join(root, 'src', relative + '.ts'), 'utf8')))(
    name => load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), name))), module, module.exports);
  modules.set(relative, module.exports);
  return module.exports;
}
const { TimeTravelAvailability } = load('features/imagery/timeTravel');
const { CachedSequencePreview } = load('features/imagery/CachedSequencePreview');
const { GRAPH_API, LAYER_IDS } = load('utils/constants');
const { TURBO_LIMITS } = load('utils/turboCoverageUtils');
const { distanceMeters } = load('utils/geoUtils');
const source = fs.readFileSync(path.join(root, 'src/runtime/widget.tsx'), 'utf8');
const syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const widget = syntax.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'Widget');
const member = name => widget.members.find(node => node.name?.getText(syntax) === name).getText(syntax);
const Runtime = new Function('TimeTravelAvailability', 'CachedSequencePreview',
  compile('class Runtime {' + ['showCachedSequencePreview', 'checkForTimeTravel'].map(member).join('\n') + '}') + '; return Runtime;')(
  TimeTravelAvailability, CachedSequencePreview);
Runtime.prototype.runSequenceBackground=(work,signal)=>work(signal||new AbortController().signal);
function callback(expression, type) {
  let result;
  const visit = node => {
    if (ts.isCallExpression(node) && node.expression.getText(syntax) === expression && node.arguments[0]?.text === type) result = node.arguments[1];
    ts.forEachChild(node, visit);
  };
  visit(widget);
  assert(result, 'Actual widget callback must be available');
  return result;
}
function bindCallback(node, receiver, globals) {
  return new Function(...Object.keys(globals), compile('const factory = function () { return (' + node.getText(syntax) + '); };') + '; return factory;')(
    ...Object.values(globals)).call(receiver);
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve;
  return { promise: new Promise(done => resolve = done), resolve: value => resolve(value) };
}
function mockFetch(t, fetch) {
  const original = global.fetch;
  global.fetch = fetch;
  t.after(() => { global.fetch = original; });
}

for (const preview of [false, true]) test((preview ? 'hovered point snapshot' : 'fresh native point pick') + ': known sequence opens the clicked image without a Graph lookup or tooltip', async t => {
  let fetches = 0, pickCalls = 0, metadataReads = 0;
  mockFetch(t, async () => { fetches++; throw new Error('Unexpected sequence metadata request'); });
  const geometry = { type: 'point', longitude: 29, latitude: 41, spatialReference: { wkid: 3857 } };
  const view = { zoom: 18, destroyed: false, toMap: () => geometry, toScreen: () => ({ x: 10, y: 20 }),
    hitTest: async () => ({ results: [] }) };
  const opened = [], retained = [], graphic = { geometry, attributes: { image_id: 'image-1', sequence_id: 'sequence-A' } };
  const w = {
    props: {}, state: { turboModeActive: true, jimuMapView: { view } }, tooltipDiv: null,
    _turboRequestCount: 1, turboCoverageLayer: {}, _pointCloudHits: { route: () => false },
    _turboMetadataCache: { get: () => { metadataReads++; return undefined; } },
    _coverageSelectionTargets: {
      snapshot: () => preview ? { geometry, imageId: 'image-1', sequenceId: 'sequence-A' } : null,
      retain: (...args) => retained.push(args),
    },
    ArcGISModules: { Graphic: class { constructor(properties) { Object.assign(this, properties); } } },
    coverageSelectionContext: () => ({}), setState(patch) { Object.assign(this.state, patch); },
    pickMapFeature: async () => null,
    pickTurboGraphic: async () => { pickCalls++; return graphic; },
    pickTurboRepresentative: async () => { throw new Error('Exact image must not need a representative'); },
    getCoverageDisplayPosition: (id, lon, lat) => ({ lon, lat }), drawClickRipple: () => {},
    loadSequenceById: async (...args) => opened.push(args),
    updateTurboPickWarning: message => { throw new Error(message); },
  };
  const click = bindCallback(callback('view.on', 'click'), w, {
    view, GRAPH_API, LAYER_IDS, TURBO_LIMITS, distanceMeters,
    webMercatorUtils: { webMercatorToGeographic: point => point },
  });
  await click({ x: 10, y: 20 });
  assert.equal(opened.length,1);
  assert.deepEqual(opened[0].slice(0,5), ['sequence-A', 'image-1', { lon: 29, lat: 41 }, false, false]);
  assert(Number.isFinite(opened[0][5]), 'click timing begins before asynchronous hit testing');
  assert.equal(fetches, 0); assert.equal(metadataReads, 0); assert.equal(pickCalls, preview ? 0 : 1);
  assert.equal(retained.length, 1); assert.equal(retained[0][3], 'sequence-A');
});

test('runtime time-travel callers share pending and successful current-image work', async t => {
  const held = deferred(), fetched = [], applied = [];
  mockFetch(t, async (url, options) => { fetched.push({ url, signal: options.signal }); return held.promise; });
  const w = new Runtime(); w.accessToken = 'test'; w.state = { imageId: 'A' };
  w.setState = patch => { applied.push(patch); Object.assign(w.state, patch); };
  const first = w.checkForTimeTravel('A'), second = w.checkForTimeTravel('A');
  assert.equal(first, second); assert.equal(fetched.length, 1);
  held.resolve({ ok: true, json: async () => ({ computed_geometry: null }) }); await first;
  assert.deepEqual(applied, [{ hasTimeTravel: false }]);
  await w.checkForTimeTravel('A'); assert.equal(fetched.length, 1); assert.equal(applied.length, 2);
});

test('actual image event cancels obsolete enrichment without starting replacement requests', async t => {
  const held = deferred(), fetched = [], applied = [];
  mockFetch(t, async (url, options) => { fetched.push({ url, signal: options.signal }); return held.promise; });
  const viewer = {}, w = new Runtime(); w.accessToken = 'test'; w.mapillaryViewer = viewer;
  w.state = { imageId: 'A', isLoading: false, jimuMapView: { view: {} } };
  w.setState = patch => applied.push(patch); w.updateProfileIndicator = () => {};
  w._liveSequenceFrames = { resolve: async () => null };
  const pending = w.checkForTimeTravel('A');
  const image = bindCallback(callback('this.mapillaryViewer.on', 'image'), w, { profileEventViewer: viewer });
  await image({ image: { id: 'A' } }); assert.equal(fetched[0].signal.aborted, false); assert.equal(fetched.length, 1);
  await image({ image: { id: 'B' } }); assert.equal(fetched[0].signal.aborted, true); assert.equal(fetched.length, 1);
  held.resolve({ ok: true, json: async () => ({ computed_geometry: null }) }); await pending;
  assert.deepEqual(applied, []);
});

test('a stale cross-sequence image event cannot replace the clicked image while its paint gate is pending', async () => {
  const viewer = {}, view = {}, selection = new AbortController(), resolved = [], cancelled = [], queueChanges = [];
  const w = {
    mapillaryViewer: viewer,
    state: { imageId: 'clicked-image', sequenceId: 'clicked-sequence', isLoading: false, jimuMapView: { view } },
    _imageryOpeningRequest: 7, _selectionRequestId: 7, _selectionAbort: selection,
    _selectionRetry: { sequenceId: 'clicked-sequence', imageId: 'clicked-image' },
    _timeTravelAvailability: { cancelUnless: id => cancelled.push(id) },
    _liveSequenceFrames: { resolve: async image => { resolved.push(image.id); return null; } },
    _backgroundRequests: { setPaused: paused => queueChanges.push(paused) },
    updateProfileIndicator() {},
    setState() { throw new Error('An obsolete event must not update the current selection'); },
  };
  const image = bindCallback(callback('this.mapillaryViewer.on', 'image'), w, { profileEventViewer: viewer });
  await image({ image: { id: 'previous-image', sequenceId: 'previous-sequence' } });
  assert.deepEqual(resolved, []); assert.deepEqual(cancelled, []); assert.deepEqual(queueChanges, []);
  assert.equal(selection.signal.aborted, false); assert.equal(w._selectionRequestId, 7);
  assert.equal(w._imageryOpeningRequest, 7); assert.equal(w._profileConfirmedImageId, undefined);
  assert.equal(w.state.imageId, 'clicked-image'); assert.equal(w.state.sequenceId, 'clicked-sequence');

  await image({ image: { id: 'clicked-image', sequenceId: 'clicked-sequence' } });
  assert.deepEqual(resolved, ['clicked-image']); assert.deepEqual(cancelled, ['clicked-image']);
  assert.equal(selection.signal.aborted, false); assert.equal(w._imageryOpeningRequest, 7);
});

function previewRuntime() {
  const view = {}, state = { snapshots: 0, builds: [], tiles: [['14/1/2', new ArrayBuffer(1)]] };
  const w = new Runtime();
  w.state = { turboModeActive: true, sequenceId: 'A', jimuMapView: { view } };
  w._turboTileCache = { snapshot: () => { state.snapshots++; return state.tiles.slice(); } };
  w.buildCachedSequencePreview = async (...args) => { state.builds.push(args); };
  return { w, state };
}
test('Turbo preview returns before tile scanning when the minimap is absent or destroyed', async () => {
  const { w, state } = previewRuntime(), signal = new AbortController().signal;
  await w.showCachedSequencePreview('A', 1, signal);
  w.minimapView = { destroyed: true }; w.minimapGraphicsLayer = {};
  await w.showCachedSequencePreview('A', 1, signal);
  assert.equal(state.snapshots, 0); assert.equal(state.builds.length, 0); assert.equal(w._cachedSequencePreview, undefined);
});
test('runtime preview coalesces pending/complete snapshots and rebuilds replaced tile buffers', async () => {
  const { w, state } = previewRuntime(), held = deferred(), signal = new AbortController().signal;
  w.minimapView = {}; w.minimapGraphicsLayer = {};
  w.buildCachedSequencePreview = async (...args) => { state.builds.push(args); await held.promise; };
  const first = w.showCachedSequencePreview('A', 1, signal), second = w.showCachedSequencePreview('A', 1, signal);
  await flush(); assert.equal(state.builds.length, 1); held.resolve(); await Promise.all([first, second]);
  await w.showCachedSequencePreview('A', 1, signal); assert.equal(state.builds.length, 1);
  state.tiles = [['14/1/2', new ArrayBuffer(1)]];
  await w.showCachedSequencePreview('A', 1, signal); assert.equal(state.builds.length, 2);
  assert.equal(state.builds[1][3][0][1], state.tiles[0][1]);
});
test('runtime preview failure stays optional and retries an identical snapshot', async () => {
  const { w, state } = previewRuntime(), signal = new AbortController().signal;
  w.minimapView = {}; w.minimapGraphicsLayer = {};
  w.buildCachedSequencePreview = async (...args) => { state.builds.push(args); if (state.builds.length === 1) throw new Error('decode failed'); };
  await w.showCachedSequencePreview('A', 1, signal);
  await w.showCachedSequencePreview('A', 1, signal);
  assert.equal(state.builds.length, 2);
});
