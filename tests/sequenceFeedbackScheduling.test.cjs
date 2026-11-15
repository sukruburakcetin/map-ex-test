const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');
const syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const widget = syntax.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'Widget');
const method = widget.members.find(node => node.name?.getText(syntax) === 'prepareDemandSequence').getText(syntax);
function setup(complete = null) {
  let resolve, reject;
  const storage = new Promise((yes, no) => { resolve = yes; reject = no; });
  const trace = [], controller = new AbortController(), view = {};
  const Runtime = new Function('readCachedSequenceCoordinates', ts.transpileModule('class Runtime {' + method + '}; return Runtime;', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText)(() => { trace.push('storage'); return storage; });
  const w = new Runtime();
  w.state = { sequenceId: 'sequence', jimuMapView: { view } }; w._selectionRequestId = 1; w._localSequenceDeferredRequest = 1;
  w._liveSequenceFrames = { complete, finish(_id, route) { this.complete = route; trace.push('adopt route'); } };
  w.showCachedSequencePreview = async () => trace.push('preview');
  w.refreshLocalSequence = async () => trace.push('local window');
  w.refreshSequenceMarkerWindow = async () => trace.push('markers');
  w.renderLiveSequenceLine = async () => trace.push('full line');
  w.updateProfileIndicator = () => {};
  w.setState = (change, callback) => { Object.assign(w.state, typeof change === 'function' ? change() : change); callback?.(); };
  return { w, controller, trace, resolve, reject, run: () => w.prepareDemandSequence('sequence', 1, controller, view) };
}
test('faint cached preview starts while storage is unresolved, without starting duplicate local downloads', async () => {
  const x = setup(), work = x.run();
  assert.deepEqual(x.trace, ['preview', 'storage']);
  assert.equal(x.w._localSequenceDeferredRequest, 1);
  x.resolve(null); await work;
  assert.deepEqual(x.trace, ['preview', 'storage', 'local window', 'markers']);
});
test('a late complete route replaces provisional context without any nearby-window request', async () => {
  const x = setup(), route = [{ id: 'image', lon: 1, lat: 2 }], work = x.run();
  x.resolve(route); await work;
  assert.deepEqual(x.trace, ['preview', 'storage', 'adopt route', 'full line']);
  assert.equal(x.w._liveSequenceFrames.complete, route);
});
test('storage failure retains the preview and permits local browsing', async () => {
  const x = setup(), work = x.run(); x.reject(Error('storage unavailable')); await work;
  assert.deepEqual(x.trace, ['preview', 'storage', 'local window']);
});
test('cancellation or a newer selection prevents late storage from changing context', async () => {
  for (const cancel of [x => x.controller.abort(), x => x.w._selectionRequestId++]) {
    const x = setup(), work = x.run(); cancel(x); x.resolve([{ id: 'old' }]); await work;
    assert.deepEqual(x.trace, ['preview', 'storage']);
  }
});
test('complete live context does not start a redundant provisional preview', async () => {
  const route = [{ id: 'image' }], x = setup(route), work = x.run();
  assert.deepEqual(x.trace, ['storage']); x.resolve(route); await work;
  assert(!x.trace.includes('preview')); assert(!x.trace.includes('local window'));
});
test('an obsolete request performs no preview or storage work', async () => {
  const x = setup(); x.w._selectionRequestId++; await x.run(); assert.deepEqual(x.trace, []);
});
