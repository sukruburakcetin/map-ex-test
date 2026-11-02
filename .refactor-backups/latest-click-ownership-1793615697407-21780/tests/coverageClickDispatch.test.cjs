const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const owner = { exports: {} };
new Function('module', 'exports', compile(fs.readFileSync(path.join(__dirname, '../src/features/coverage/coverageClickDispatch.ts'), 'utf8')))(owner, owner.exports);
const { coverageClickHitTest } = owner.exports;
const source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');
const syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let click;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(syntax) === 'view.on' && node.arguments[0]?.text === 'click') click = node.arguments[1];
  ts.forEachChild(node, visit);
}
visit(syntax);
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup({ hovered = true, priority, detection = false, regional = false } = {}) {
  let release;
  const hits = new Promise(resolve => { release = resolve; });
  const trace = [], geometry = { type: 'point', longitude: 1, latitude: 2 };
  const view = { type: '3d', zoom: regional ? 8 : 19.9, stationary: true, destroyed: false,
    toScreen: () => ({ x: 100, y: 100 }), toMap: () => geometry,
    hitTest: () => { trace.push('SDK hit test'); return hits; } };
  const widget = { props: { state: 'OPENED' }, state: { turboModeActive: true, jimuMapView: { view },
    objectsActive: detection, placesActive: priority === 'places' },
    turboCoverageLayer: {}, _turboRequestCount: 1,
    _coverageSelectionTargets: { snapshot: () => hovered && !regional ? { imageId: 'exact-image', sequenceId: 'sequence', geometry } : null, retain() {} },
    coverageSelectionContext: () => ({}), _pointCloudHits: { route: () => false },
    _turboMetadataCache: { get: () => undefined },
    ArcGISModules: { Graphic: class { constructor(properties) { Object.assign(this, properties); } } },
    setState(update) { Object.assign(this.state, update); },
    pickMapFeature: async () => { trace.push('native detection pick'); return null; },
    pickTurboGraphic: async () => ({ geometry, attributes: { image_id: 'exact-image', sequence_id: 'sequence' } }),
    getCoverageDisplayPosition: () => ({ lon: 1, lat: 2 }), drawClickRipple() {},
    loadSequenceById: async (...args) => { trace.push(['open image', args[0], args[1]]); },
    showPlacesHit: () => false, showToast() {}, _t: key => key, updateTurboPickWarning() {},
  };
  if (priority === 'notes') widget._sharedNotesLayer = {};
  if (priority === 'cloud') widget._pointCloudMapLayer = { layer: {} };
  if (priority === 'features') widget.mapillaryObjectsFeatureLayer = {};
  if (regional) {
    widget._turboHoverGraphic = { geometry };
    widget._turboHoveredScreen = { x: 100, y: 100 };
    widget._currentHoveredFeatureId = 'representative';
  }
  const handler = new Function('view', 'coverageClickHitTest', 'TURBO_LIMITS', 'LAYER_IDS', 'webMercatorUtils', 'distanceMeters', 'GRAPH_API', compile('return (' + click.getText(syntax) + ');')).call(widget, view, coverageClickHitTest,
    { pickRadiusPx: 8 }, { OBJECTS_FL: 'objects', TRAFFIC_SIGNS_FL: 'signs', TURBO_COVERAGE: 'coverage' },
    { webMercatorToGeographic: point => point }, () => 0, { BASE: 'unused' });
  return { widget, view, trace, handler: () => handler({ x: 100, y: 100, stopPropagation() {} }), release };
}

test('confirmed hovered point reaches image opening without SDK hit testing or inactive detection work', async () => {
  const x = setup(); await x.handler();
  assert.deepEqual(x.trace, [['open image', 'sequence', 'exact-image']]);
});
for (const priority of ['notes', 'cloud', 'places', 'features']) test(`${priority} retains the existing awaited SDK priority`, async () => {
  const x = setup({ priority }); const work = x.handler(); await flush();
  assert.deepEqual(x.trace, ['SDK hit test']);
  x.release({ results: [] }); await work;
  assert.deepEqual(x.trace.at(-1), ['open image', 'sequence', 'exact-image']);
});
test('active native detections still get their pick before imagery opens', async () => {
  const x = setup({ detection: true }); await x.handler();
  assert.deepEqual(x.trace, ['native detection pick', ['open image', 'sequence', 'exact-image']]);
});
test('unhovered clicks retain the original SDK path', async () => {
  const x = setup({ hovered: false }); const work = x.handler(); await flush();
  assert.deepEqual(x.trace, ['SDK hit test']); x.release({ results: [] }); await work;
  assert.deepEqual(x.trace.at(-1), ['open image', 'sequence', 'exact-image']);
});
test('regional line previews never enter the exact-point shortcut', async () => {
  let calls = 0;
  const response = await coverageClickHitTest(false, { sharedNotes: false, pointCloud: false, places: false, detectionFeatures: false }, async () => { calls++; return { results: ['line'] }; });
  assert.equal(calls, 1); assert.deepEqual(response.results, ['line']);
});
test('a view/revision change while an SDK lookup waits cannot open a stale hovered image', async () => {
  const x = setup({ priority: 'notes' }); const work = x.handler(); await flush();
  x.widget._turboRequestCount++; x.release({ results: [] }); await work;
  assert.deepEqual(x.trace, ['SDK hit test']);
});

for (const priority of ['notes', 'cloud', 'places']) test(`${priority} can consume the click without opening the hovered image`, async () => {
  const x = setup({ priority });
  let results = [];
  if (priority === 'notes') {
    results = [{ layer: x.widget._sharedNotesLayer, graphic: { geometry: {} } }];
    x.view.openPopup = () => x.trace.push('note popup');
  } else if (priority === 'cloud') x.widget._pointCloudHits.route = () => true;
  else x.widget.showPlacesHit = () => true;
  const work = x.handler(); x.release({ results }); await work;
  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));
});
test('route picking still intercepts a hovered point before SDK or image work', async () => {
  const x = setup(); x.widget.state.routePickMode = 'A';
  x.widget.setRoutePoint = () => x.trace.push('route pick'); await x.handler();
  assert.deepEqual(x.trace, ['route pick']);
});
