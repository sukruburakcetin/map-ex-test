const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const moduleObject = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(path.join(__dirname,
  '../src/features/coverage/SharedTileRequests.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText)(moduleObject, moduleObject.exports);
const { SharedTileRequests } = moduleObject.exports;
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  return { promise: new Promise((yes, no) => { resolve = yes; reject = no; }),
    resolve: value => resolve(value), reject: error => reject(error) };
}
function trackedSignal() {
  const controller = new AbortController(), signal = controller.signal;
  const add = signal.addEventListener.bind(signal), remove = signal.removeEventListener.bind(signal);
  const counts = { added: 0, removed: 0 };
  signal.addEventListener = (...args) => { if (args[0] === 'abort') counts.added++; return add(...args); };
  signal.removeEventListener = (...args) => { if (args[0] === 'abort') counts.removed++; return remove(...args); };
  return { controller, signal, counts };
}

test('independent tile consumers share one producer and the same immutable bytes', async () => {
  const owner = new SharedTileRequests(), first = trackedSignal(), second = trackedSignal(), held = deferred();
  let loads = 0, internal;
  const load = signal => { loads++; internal = signal; return held.promise; };
  const a = owner.get('scope/tile', first.signal, load);
  const b = owner.get('scope/tile', second.signal, () => { throw Error('duplicate transport'); });
  await flush(); assert.equal(loads, 1); assert.deepEqual(owner.stats, { started: 1, shared: 1, aborted: 0, active: 1 });
  const bytes = new ArrayBuffer(5); held.resolve(bytes);
  assert.deepEqual(await Promise.all([a, b]), [bytes, bytes]);
  assert.equal(internal.aborted, false); assert.equal(owner.stats.active, 0);
  assert.deepEqual(first.counts, { added: 1, removed: 1 }); assert.deepEqual(second.counts, { added: 1, removed: 1 });
});

test('one caller cancellation never aborts another subscriber or its producer', async () => {
  const owner = new SharedTileRequests(), first = trackedSignal(), second = trackedSignal(), held = deferred(); let internal;
  const a = owner.get('tile', first.signal, signal => { internal = signal; return held.promise; });
  const b = owner.get('tile', second.signal, () => { throw Error('duplicate'); });
  const rejected = assert.rejects(a, { name: 'AbortError' }); await flush(); first.controller.abort(); await rejected;
  assert.equal(internal.aborted, false); assert.equal(owner.stats.active, 1);
  const bytes = new ArrayBuffer(1); held.resolve(bytes); assert.equal(await b, bytes);
  assert.equal(owner.stats.aborted, 0); assert.deepEqual(first.counts, { added: 1, removed: 1 });
  assert.deepEqual(second.counts, { added: 1, removed: 1 });
});

test('last caller abort immediately retires the producer and prevents late success', async () => {
  const owner = new SharedTileRequests(), caller = trackedSignal(), held = deferred(); let internal;
  const a = owner.get('tile', caller.signal, signal => { internal = signal; return held.promise; });
  const rejected = assert.rejects(a, { name: 'AbortError' }); await flush(); caller.controller.abort(); await rejected;
  assert.equal(internal.aborted, true); assert.deepEqual(owner.stats, { started: 1, shared: 0, aborted: 1, active: 0 });
  held.resolve(new ArrayBuffer(1)); await flush(); assert.equal(owner.stats.active, 0);
  const current = new ArrayBuffer(2); assert.equal(await owner.get('tile', new AbortController().signal, async () => current), current);
  assert.equal(owner.stats.started, 2); assert.deepEqual(caller.counts, { added: 1, removed: 1 });
});

test('all remaining subscribers reject promptly on clear even if transport ignores cancellation', async () => {
  const owner = new SharedTileRequests(), one = trackedSignal(), two = trackedSignal(), held = deferred(); let internal;
  const a = owner.get('tile', one.signal, signal => { internal = signal; return held.promise; });
  const b = owner.get('tile', two.signal, () => { throw Error('duplicate'); });
  const rejected = [assert.rejects(a, { name: 'AbortError' }), assert.rejects(b, { name: 'AbortError' })];
  await flush(); owner.clear(); await Promise.all(rejected); owner.clear();
  assert.equal(internal.aborted, true); assert.equal(owner.stats.aborted, 1); assert.equal(owner.stats.active, 0);
  assert.deepEqual(one.counts, { added: 1, removed: 1 }); assert.deepEqual(two.counts, { added: 1, removed: 1 });
  held.resolve(new ArrayBuffer(1)); await flush(); assert.equal(owner.stats.active, 0);
});

test('failed loads share rejection, clear listeners and remain retryable', async () => {
  const owner = new SharedTileRequests(), one = trackedSignal(), two = trackedSignal(), held = deferred();
  const failure = new Error('offline');
  const a = owner.get('tile', one.signal, () => held.promise), b = owner.get('tile', two.signal, () => held.promise);
  const rejected = [assert.rejects(a, error => error === failure), assert.rejects(b, error => error === failure)];
  held.reject(failure); await Promise.all(rejected); assert.equal(owner.stats.active, 0);
  const bytes = new ArrayBuffer(1); assert.equal(await owner.get('tile', one.signal, async () => bytes), bytes);
  assert.equal(owner.stats.started, 2); assert.equal(owner.stats.aborted, 0);
  assert.deepEqual(one.counts, { added: 2, removed: 2 }); assert.deepEqual(two.counts, { added: 1, removed: 1 });
});

test('stale completion cannot delete or satisfy a replacement producer for the same key', async () => {
  const owner = new SharedTileRequests(), old = deferred(), current = deferred(), signal = new AbortController().signal;
  const a = owner.get('tile', signal, () => old.promise), rejected = assert.rejects(a, { name: 'AbortError' });
  await flush(); owner.clear(); await rejected;
  const b = owner.get('tile', signal, () => current.promise); await flush();
  old.resolve(new ArrayBuffer(1)); await flush(); assert.equal(owner.stats.active, 1);
  const c = owner.get('tile', signal, () => { throw Error('replacement must remain shared'); });
  const bytes = new ArrayBuffer(3); current.resolve(bytes); assert.deepEqual(await Promise.all([b, c]), [bytes, bytes]);
  assert.deepEqual(owner.stats, { started: 2, shared: 1, aborted: 1, active: 0 });
});

test('different scope or tile keys never share requests', async () => {
  const owner = new SharedTileRequests(), signal = new AbortController().signal;
  const one = deferred(), two = deferred(); let loads = 0;
  const a = owner.get('scope-A/tile', signal, () => { loads++; return one.promise; });
  const b = owner.get('scope-B/tile', signal, () => { loads++; return two.promise; });
  await flush(); assert.equal(loads, 2); assert.equal(owner.stats.active, 2);
  one.resolve(new ArrayBuffer(1)); two.resolve(new ArrayBuffer(2)); await Promise.all([a, b]); assert.equal(owner.stats.shared, 0);
});

test('pre-aborted and same-turn cancelled callers never invoke transport', async () => {
  const owner = new SharedTileRequests(), aborted = new AbortController(); aborted.abort(); let loads = 0;
  await assert.rejects(owner.get('tile', aborted.signal, async () => { loads++; return new ArrayBuffer(1); }), { name: 'AbortError' });
  assert.deepEqual(owner.stats, { started: 0, shared: 0, aborted: 0, active: 0 });
  const caller = new AbortController(); const pending = owner.get('tile', caller.signal, async () => { loads++; return new ArrayBuffer(1); });
  const rejected = assert.rejects(pending, { name: 'AbortError' }); caller.abort(); await rejected; await flush(); assert.equal(loads, 0);
});

test('synchronous loader failures reject callers instead of escaping or poisoning later calls', async () => {
  const owner = new SharedTileRequests(), signal = new AbortController().signal;
  await assert.rejects(owner.get('tile', signal, () => { throw Error('sync transport failure'); }), /sync transport failure/);
  const bytes = new ArrayBuffer(1); assert.equal(await owner.get('tile', signal, async () => bytes), bytes);
  assert.equal(owner.stats.active, 0); assert.equal(owner.stats.started, 2);
});

test('clear while a retrying producer waits aborts its retry lifetime and later rejection stays handled', async () => {
  const owner = new SharedTileRequests(), signal = new AbortController().signal, firstAttempt = deferred(), retry = deferred(); let attempts = 0, internal;
  const pending = owner.get('tile', signal, async source => {
    internal = source; attempts++; await firstAttempt.promise;
    await retry.promise;
    if (source.aborted) throw new DOMException('Cancelled', 'AbortError');
    attempts++; return new ArrayBuffer(1);
  });
  const rejected = assert.rejects(pending, { name: 'AbortError' }); await flush(); firstAttempt.resolve(); await flush();
  owner.clear(); await rejected; assert.equal(internal.aborted, true);
  retry.resolve(); await flush(); assert.equal(attempts, 1); assert.equal(owner.stats.active, 0);
});

test('clear handles multiple active tiles and stats snapshots cannot expose or mutate owner data', async () => {
  const owner = new SharedTileRequests(), signal = new AbortController().signal;
  const a = owner.get('secret-scope-A', signal, async () => new Promise(() => {}));
  const b = owner.get('secret-scope-B', signal, async () => new Promise(() => {}));
  const rejected = [assert.rejects(a, { name: 'AbortError' }), assert.rejects(b, { name: 'AbortError' })];
  const snapshot = owner.stats; snapshot.active = 999;
  assert.equal(owner.stats.active, 2); assert.deepEqual(Object.keys(snapshot).sort(), ['aborted', 'active', 'shared', 'started']);
  assert(!JSON.stringify(snapshot).includes('secret')); owner.clear(); await Promise.all(rejected);
  assert.deepEqual(owner.stats, { started: 2, shared: 0, aborted: 2, active: 0 });
});

test('arbitrary rejection values remain failures rather than becoming successful empty tiles', async () => {
  const owner = new SharedTileRequests(), signal = new AbortController().signal;
  for (const failure of [undefined, null, 'offline']) {
    let rejected = false;
    await owner.get('tile', signal, () => Promise.reject(failure)).then(
      () => assert.fail('A rejected transport must not resolve a tile'),
      error => { rejected = true; assert.equal(error, failure); });
    assert.equal(rejected, true); assert.equal(owner.stats.active, 0);
  }
  assert.equal(owner.stats.started, 3);
});
