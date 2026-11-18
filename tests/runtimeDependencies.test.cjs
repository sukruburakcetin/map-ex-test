/** Real installed codecs, including the runtime's no-Worker SfM decompression path. */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const { PbfReader, PbfWriter } = require('pbf');
const { VectorTile } = require('@mapbox/vector-tile');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', source)(id => id.startsWith('.') ? load(path.resolve(path.dirname(file), id) + '.ts') : require(id), module, module.exports);
  return module.exports;
}
test('pbf 5 reader and vector-tile decode real feature identity and geometry', () => {
  const writer = new PbfWriter();
  writer.writeMessage(3, (_, layer) => {
    layer.writeVarintField(15, 2); layer.writeStringField(1, 'image'); layer.writeVarintField(5, 4096);
    layer.writeMessage(2, (_, feature) => {
      feature.writeVarintField(1, 42); feature.writeVarintField(3, 1);
      feature.writePackedVarint(4, [9, 20, 40]);
    }, null);
  }, null);
  const layer = new VectorTile(new PbfReader(writer.finish())).layers.image;
  assert.equal(layer.length, 1); assert.equal(layer.extent, 4096);
  const feature = layer.feature(0); assert.equal(feature.id, 42);
  assert.deepEqual(feature.loadGeometry().map(ring => ring.map(p => [p.x, p.y])), [[[10, 20]]]);
});
test('actual runtime decompresses gzip and zlib clusters without Worker support', async () => {
  const cloud = load(path.join(root, 'src/utils/pointCloudUtils.ts'));
  const originalFetch = global.fetch, originalWorker = global.Worker;
  const record = [{ reference_lla: { latitude: 1, longitude: 2, altitude: 3 }, points: { p: { coordinates: [4, 5, 6], color: [7, 8, 9] } }, shots: {} }];
  try {
    global.Worker = undefined;
    for (const bytes of [zlib.gzipSync(JSON.stringify(record)), zlib.deflateSync(JSON.stringify(record))]) {
      global.fetch = async () => new Response(bytes, { status: 200 });
      const decoded = await cloud.downloadAndDecompress('https://example.test/cluster');
      assert.equal(decoded.length, 1); assert.deepEqual(decoded[0].refLla, record[0].reference_lla);
      assert.deepEqual(decoded[0].rawPoints, [{ x: 4, y: 5, z: 6, r: 7, g: 8, b: 9 }]);
    }
  } finally { global.fetch = originalFetch; global.Worker = originalWorker; }
});
test('actual runtime retains caller cancellation before cluster transport', async () => {
  const cloud = load(path.join(root, 'src/utils/pointCloudUtils.ts'));
  const previous = global.fetch, controller = new AbortController(); controller.abort();
  let calls = 0;
  try { global.fetch = async () => { calls++; throw Error('unexpected fetch'); };
    await assert.rejects(cloud.downloadAndDecompress('https://example.test/cluster', controller.signal), { name: 'AbortError' }); assert.equal(calls, 0);
  } finally { global.fetch = previous; }
});
