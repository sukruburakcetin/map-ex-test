const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const moduleObject = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(path.join(__dirname,
  '../src/features/imagery/CachedSequencePreview.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText)(moduleObject, moduleObject.exports);
const { CachedSequencePreview } = moduleObject.exports;
const flush = () => new Promise(resolve => setImmediate(resolve));
const key = (changes = {}) => ({ sequenceId: 'A', requestId: 1, view: {},
  tiles: [['14/1/2', new ArrayBuffer(1)], ['14/1/3', new ArrayBuffer(2)]], ...changes });
function trackedSignal() {
  const controller = new AbortController(), signal = controller.signal;
  const add = signal.addEventListener.bind(signal), remove = signal.removeEventListener.bind(signal);
  const counts = { added: 0, removed: 0 };
  signal.addEventListener = (...args) => { if (args[0] === 'abort') counts.added++; return add(...args); };
  signal.removeEventListener = (...args) => { if (args[0] === 'abort') counts.removed++; return remove(...args); };
  return { controller, signal, counts };
}
test('concurrent duplicate snapshots share one pending job despite tile ordering', async () => {
  const owner = new CachedSequencePreview(), snapshot = key(), { signal, counts } = trackedSignal();
  let calls = 0, resume;
  const first = owner.run(snapshot, signal, async () => { calls++; await new Promise(resolve => resume = resolve); });
  const second = owner.run({ ...snapshot, tiles: snapshot.tiles.slice().reverse() }, signal, async () => calls++);
  assert.equal(second, first);
  await flush(); assert.equal(calls, 1); resume(); await first;
  assert.deepEqual(counts, { added: 1, removed: 1 });
});
test('successful previews are reused without rerunning decoding or accumulating listeners', async () => {
  const owner = new CachedSequencePreview(), snapshot = key(), { signal, counts } = trackedSignal(); let calls = 0;
  const first = owner.run(snapshot, signal, async () => { calls++; }); await first;
  const second = owner.run(snapshot, signal, async () => { calls++; }); await second;
  assert.equal(second, first); assert.equal(calls, 1); assert.deepEqual(counts, { added: 1, removed: 1 });
});
test('a replaced same-key buffer, changed request, view, or sequence invalidates the single retained result', async () => {
  const owner = new CachedSequencePreview(), signal = new AbortController().signal;
  let snapshot = key(), calls = 0; const work = async () => { calls++; };
  await owner.run(snapshot, signal, work);
  for (const changes of [
    { tiles: [[snapshot.tiles[0][0], new ArrayBuffer(1)], snapshot.tiles[1]] },
    { requestId: 2 }, { view: {} }, { sequenceId: 'B' },
  ]) { snapshot = { ...snapshot, ...changes }; await owner.run(snapshot, signal, work); }
  assert.equal(calls, 5);
});
test('superseding work aborts the old internal signal and old completion cannot clear the new job', async () => {
  const owner = new CachedSequencePreview(), signal = new AbortController().signal, snapshot = key();
  let oldSignal, resume, calls = 0;
  const old = owner.run(snapshot, signal, async s => { oldSignal = s; await new Promise(resolve => resume = resolve); });
  const rejected = assert.rejects(old, { name: 'AbortError' }); await flush();
  const currentKey = { ...snapshot, sequenceId: 'B' };
  const current = owner.run(currentKey, signal, async () => { calls++; }); await current;
  assert.equal(oldSignal.aborted, true); await rejected; resume(); await flush();
  assert.equal(owner.run(currentKey, signal, async () => { calls++; }), current); assert.equal(calls, 1);
});
test('selection abort rejects promptly and cleans listeners even if optional work ignores cancellation', async () => {
  const owner = new CachedSequencePreview(), snapshot = key(), { controller, signal, counts } = trackedSignal();
  let internal, resume;
  const task = owner.run(snapshot, signal, async s => { internal = s; await new Promise(resolve => resume = resolve); });
  const rejected = assert.rejects(task, { name: 'AbortError' }); await flush(); controller.abort(); await rejected;
  assert.equal(internal.aborted, true); assert.deepEqual(counts, { added: 1, removed: 1 }); resume(); await flush();
  const next = new AbortController().signal; let calls = 0; await owner.run(snapshot, next, async () => { calls++; }); assert.equal(calls, 1);
});
test('failure is not memoized and can be retried with the same snapshot', async () => {
  const owner = new CachedSequencePreview(), snapshot = key(), { signal, counts } = trackedSignal(); let calls = 0;
  await assert.rejects(owner.run(snapshot, signal, async () => { calls++; throw new Error('decode failure'); }), /decode failure/);
  await owner.run(snapshot, signal, async () => { calls++; }); assert.equal(calls, 2); assert.deepEqual(counts, { added: 2, removed: 2 });
});
test('clear cancels pending work, releases a completed result, and permits fresh empty-snapshot work', async () => {
  const owner = new CachedSequencePreview(), snapshot = key({ tiles: [] }), signal = new AbortController().signal; let calls = 0;
  await owner.run(snapshot, signal, async () => { calls++; }); owner.clear();
  await owner.run(snapshot, signal, async () => { calls++; }); assert.equal(calls, 2);
  const pending = owner.run({ ...snapshot, requestId: 2 }, signal, async () => new Promise(() => {}));
  const rejected = assert.rejects(pending, { name: 'AbortError' }); owner.clear(); await rejected; owner.clear();
});
test('aborted callers never start a preview and independent selection signals do not share cancellation', async () => {
  const owner = new CachedSequencePreview(), snapshot = key(), aborted = new AbortController(); aborted.abort(); let calls = 0;
  await assert.rejects(owner.run(snapshot, aborted.signal, async () => { calls++; }), { name: 'AbortError' }); assert.equal(calls, 0);
  await owner.run(snapshot, new AbortController().signal, async () => { calls++; });
  await owner.run(snapshot, new AbortController().signal, async () => { calls++; }); assert.equal(calls, 2);
});
