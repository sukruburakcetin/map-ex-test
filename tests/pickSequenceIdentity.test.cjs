const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
function load(relative) {
  const file = path.join(__dirname, '../src', relative + '.ts');
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(
    id => load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), id))), module, module.exports);
  return module.exports;
}
const { visitTurboImageLayer, TurboSpatialIndex } = load('utils/turboCoverageUtils');
const tile = [8192, 8192, 14];
const bbox = [0, -1, 1, 0];
function imageLayer(properties) {
  const features = properties.map((props, i) => ({
    extent: 4096,
    properties: { id: String(i + 1), captured_at: Date.UTC(2024, 0, 1), quality_score: .8, foot: false, ...props },
    loadGeometry: () => [[{ x: 1024 + i * 16, y: 1024 }]],
  }));
  return { length: features.length, feature: i => features[i] };
}
async function visitBoth(layer, filters = {}) {
  const signal = new AbortController().signal;
  const regular = [];
  await visitTurboImageLayer(layer, tile, bbox, filters, signal, point => regular.push(point));
  const index = new TurboSpatialIndex(new ArrayBuffer(1), tile, layer.length);
  await index.build(layer, signal);
  const indexed = [];
  await index.visit(layer, bbox, filters, signal, point => indexed.push(point));
  const sort = points => points.sort((a, b) => Number(a.imageId) - Number(b.imageId));
  return { regular: sort(regular), indexed: sort(indexed) };
}
test('native sequence IDs survive both direct and indexed point visitation', async () => {
  const { regular, indexed } = await visitBoth(imageLayer([
    { sequence_id: 'native-A' }, { sequence_id: 'native-B' }, { sequence_id: 'native-A' },
  ]));
  assert.deepEqual(regular.map(point => point.sequenceId), ['native-A', 'native-B', 'native-A']);
  assert.deepEqual(indexed, regular);
  assert(regular.every(point => point.imageId && Number.isFinite(point.lon) && Number.isFinite(point.lat)));
});
test('missing, empty and malformed sequence properties never become placeholder IDs', async () => {
  const invalid = [undefined, null, '', '  ', 'undefined', 'null', false, true, {}, [], NaN, Infinity, -1, 0, 1.5];
  const { regular, indexed } = await visitBoth(imageLayer(invalid.map(sequence_id => ({ sequence_id }))));
  assert.equal(regular.length, invalid.length);
  assert(regular.every(point => point.sequenceId === undefined));
  assert.deepEqual(indexed, regular);
});
test('sequence identities normalize safe scalar values without modifying tile properties', async () => {
  const layer = imageLayer([{ sequence_id: '  native-A  ' }, { sequence_id: 123 }]);
  const { regular, indexed } = await visitBoth(layer);
  assert.deepEqual(regular.map(point => point.sequenceId), ['native-A', '123']);
  assert.deepEqual(indexed, regular);
  assert.equal(layer.feature(0).properties.sequence_id, '  native-A  ');
  assert.equal(layer.feature(1).properties.sequence_id, 123);
});
test('carrying identity preserves filters and existing point metadata', async () => {
  const { regular, indexed } = await visitBoth(imageLayer([
    { sequence_id: 'A', organization_id: 12, quality_score: .9 },
    { sequence_id: 'B', organization_id: 13, quality_score: .5 },
  ]), { organizationId: 12 });
  assert.equal(regular.length, 1);
  assert.equal(regular[0].sequenceId, 'A');
  assert.equal(regular[0].imageId, '1');
  assert.equal(regular[0].capturedAt, Date.UTC(2024, 0, 1));
  assert.equal(regular[0].year, '2024');
  assert.equal(regular[0].qualityScore, .9);
  assert.equal(regular[0].onFoot, false);
  assert.deepEqual(indexed, regular);
});
test('buffered duplicate points remain excluded when identity is present', async () => {
  const layer = imageLayer([{ sequence_id: 'A' }, { sequence_id: 'B' }]);
  const duplicate = layer.feature(1);
  duplicate.loadGeometry = () => [[{ x: 4096, y: 1024 }]];
  const { regular, indexed } = await visitBoth(layer);
  assert.equal(regular.length, 1);
  assert.equal(regular[0].sequenceId, 'A');
  assert.deepEqual(indexed, regular);
});
test('aborted visits cannot emit identity or position from a stale request', async () => {
  const layer = imageLayer([{ sequence_id: 'A' }]);
  const controller = new AbortController();
  const index = new TurboSpatialIndex(new ArrayBuffer(1), tile, layer.length);
  await index.build(layer, controller.signal);
  controller.abort();
  let emitted = false;
  await assert.rejects(visitTurboImageLayer(layer, tile, bbox, {}, controller.signal, () => emitted = true), { name: 'AbortError' });
  await assert.rejects(index.visit(layer, bbox, {}, controller.signal, () => emitted = true), { name: 'AbortError' });
  assert.equal(emitted, false);
});
