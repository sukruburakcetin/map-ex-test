const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const moduleObject = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(path.join(__dirname,
  '../src/features/imagery/BackgroundRequestQueue.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText)(moduleObject, moduleObject.exports);
const { BackgroundRequestQueue } = moduleObject.exports;
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function trackedSignal() {
  const controller = new AbortController(), signal = controller.signal;
  const add = signal.addEventListener.bind(signal), remove = signal.removeEventListener.bind(signal);
  const counts = { added: 0, removed: 0 };
  signal.addEventListener = (...args) => { if (args[0] === 'abort') counts.added++; return add(...args); };
  signal.removeEventListener = (...args) => { if (args[0] === 'abort') counts.removed++; return remove(...args); };
  return { controller, signal, counts };
}

test('physical work stays bounded and pending metadata starts in FIFO order', async () => {
  const queue = new BackgroundRequestQueue(2), waits = Array.from({ length: 4 }, deferred), started = [];
  const tasks = waits.map((wait, i) => queue.run(async () => { started.push(i); return wait.promise; }));
  await flush(); assert.deepEqual(started, [0, 1]); assert.deepEqual(queue.stats, { active: 2, queued: 2, completed: 0, aborted: 0 });
  waits[1].resolve('one'); await tasks[1]; await flush(); assert.deepEqual(started, [0, 1, 2]);
  waits[0].resolve('zero'); await tasks[0]; await flush(); assert.deepEqual(started, [0, 1, 2, 3]);
  waits[2].resolve('two'); waits[3].resolve('three');
  assert.deepEqual(await Promise.all(tasks), ['zero', 'one', 'two', 'three']);
  assert.deepEqual(queue.stats, { active: 0, queued: 0, completed: 4, aborted: 0 });
});

test('pausing delays optional requests while foreground work remains independent', async () => {
  const queue = new BackgroundRequestQueue(), events = [];
  queue.setPaused(true);
  const optional = queue.run(async () => { events.push('metadata'); return 1; });
  await Promise.resolve().then(() => events.push('foreground image'));
  assert.deepEqual(events, ['foreground image']); assert.equal(queue.stats.queued, 1); assert.equal(queue.stats.active, 0);
  queue.setPaused(false); assert.equal(await optional, 1); assert.deepEqual(events, ['foreground image', 'metadata']);
});

test('pausing preserves running work and completion does not start a queued request', async () => {
  const queue = new BackgroundRequestQueue(1), wait = deferred(); let internal, secondStarted = false;
  const first = queue.run(signal => { internal = signal; return wait.promise; });
  const second = queue.run(async () => { secondStarted = true; }); await flush();
  queue.setPaused(true); assert.equal(internal.aborted, false); wait.resolve(); await first; await flush();
  assert.equal(secondStarted, false); assert.deepEqual(queue.stats, { active: 0, queued: 1, completed: 1, aborted: 0 });
  queue.setPaused(false); await second; assert.equal(secondStarted, true);
});

test('an aborted queued caller is removed promptly and never starts work', async () => {
  const queue = new BackgroundRequestQueue(), { controller, signal, counts } = trackedSignal(); let started = false;
  queue.setPaused(true);
  const task = queue.run(async () => { started = true; }, signal), rejected = assert.rejects(task, { name: 'AbortError' });
  controller.abort(); await rejected; assert.equal(queue.stats.queued, 0); assert.deepEqual(counts, { added: 1, removed: 1 });
  queue.setPaused(false); await flush(); assert.equal(started, false); assert.equal(queue.stats.aborted, 1);
});

test('running cancellation rejects promptly but ignored abort retains its physical slot', async () => {
  const queue = new BackgroundRequestQueue(1), wait = deferred(), controller = new AbortController(); let internal, secondStarted = false;
  const first = queue.run(signal => { internal = signal; return wait.promise; }, controller.signal);
  const rejected = assert.rejects(first, { name: 'AbortError' });
  const second = queue.run(async () => { secondStarted = true; return 'next'; }); await flush();
  controller.abort(); await rejected; await flush();
  assert.equal(internal.aborted, true); assert.equal(secondStarted, false); assert.deepEqual(queue.stats, { active: 1, queued: 1, completed: 0, aborted: 1 });
  wait.resolve('stale'); await flush(); assert.equal(await second, 'next');
  assert.deepEqual(queue.stats, { active: 0, queued: 0, completed: 1, aborted: 1 });
});

test('clear rejects queued and running callers, preserves capacity, and permits reuse', async () => {
  const queue = new BackgroundRequestQueue(1), old = deferred(); let internal, oldQueuedStarted = false, replacementStarted = false;
  const first = queue.run(signal => { internal = signal; return old.promise; });
  const second = queue.run(async () => { oldQueuedStarted = true; });
  const rejected = [assert.rejects(first, { name: 'AbortError' }), assert.rejects(second, { name: 'AbortError' })]; await flush();
  queue.clear(); await Promise.all(rejected); assert.equal(internal.aborted, true); assert.equal(queue.stats.queued, 0);
  const replacement = queue.run(async () => { replacementStarted = true; return 3; }); await flush();
  assert.equal(replacementStarted, false); assert.equal(queue.stats.active, 1);
  old.resolve('late old result'); assert.equal(await replacement, 3); assert.equal(oldQueuedStarted, false);
  assert.deepEqual(queue.stats, { active: 0, queued: 0, completed: 1, aborted: 2 });
});

test('clear preserves explicit pause intent until the caller resumes', async () => {
  const queue = new BackgroundRequestQueue(); queue.setPaused(true);
  const old = queue.run(async () => 1), rejected = assert.rejects(old, { name: 'AbortError' }); queue.clear(); await rejected;
  let started = false; const next = queue.run(async () => { started = true; return 2; }); await flush();
  assert.equal(started, false); queue.setPaused(false); assert.equal(await next, 2);
});

test('failed requests and synchronous throws release capacity for the next job', async () => {
  const queue = new BackgroundRequestQueue(1);
  const failure = queue.run(async () => { throw new Error('offline'); });
  const thrown = queue.run(() => { throw new Error('sync failure'); });
  const next = queue.run(async () => 'healthy');
  await assert.rejects(failure, /offline/); await assert.rejects(thrown, /sync failure/); assert.equal(await next, 'healthy');
  assert.deepEqual(queue.stats, { active: 0, queued: 0, completed: 3, aborted: 0 });
});

test('pre-aborted requests start no work and leave no listeners or queue entries', async () => {
  const queue = new BackgroundRequestQueue(), { controller, signal, counts } = trackedSignal(); controller.abort(); let calls = 0;
  await assert.rejects(queue.run(async () => calls++, signal), { name: 'AbortError' });
  assert.equal(calls, 0); assert.deepEqual(counts, { added: 0, removed: 0 });
  assert.deepEqual(queue.stats, { active: 0, queued: 0, completed: 0, aborted: 0 });
});

test('finished requests remove caller listeners and later aborts cannot change counters', async () => {
  const queue = new BackgroundRequestQueue(), { controller, signal, counts } = trackedSignal();
  assert.equal(await queue.run(async () => 'done', signal), 'done'); assert.deepEqual(counts, { added: 1, removed: 1 });
  controller.abort(); assert.deepEqual(queue.stats, { active: 0, queued: 0, completed: 1, aborted: 0 });
});

test('cancelling before the reserved microtask prevents user work from starting', async () => {
  const queue = new BackgroundRequestQueue(1), controller = new AbortController(); let calls = 0;
  const task = queue.run(async () => calls++, controller.signal), rejected = assert.rejects(task, { name: 'AbortError' });
  controller.abort(); await rejected; await flush(); assert.equal(calls, 0); assert.equal(queue.stats.active, 0);
});

test('invalid limits fail immediately instead of silently starving metadata', () => {
  for (const value of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => new BackgroundRequestQueue(value), RangeError);
});


test('lowering concurrency keeps active work and starts no replacements until below the new limit', async () => {
  const queue = new BackgroundRequestQueue(2), waits = Array.from({ length: 4 }, deferred), started = [], signals = [];
  const tasks = waits.map((wait, i) => queue.run(async signal => { started.push(i); signals.push(signal); return wait.promise; }));
  await flush(); assert.deepEqual(started, [0, 1]); queue.setLimit(1); assert.equal(queue.concurrency, 1);
  assert(signals.every(signal => !signal.aborted)); waits[0].resolve(0); await tasks[0]; await flush();
  assert.deepEqual(started, [0, 1]); assert.equal(queue.stats.active, 1); assert.equal(queue.stats.queued, 2);
  waits[1].resolve(1); await tasks[1]; await flush(); assert.deepEqual(started, [0, 1, 2]);
  waits[2].resolve(2); await tasks[2]; await flush(); assert.deepEqual(started, [0, 1, 2, 3]);
  waits[3].resolve(3); assert.deepEqual(await Promise.all(tasks), [0, 1, 2, 3]);
});

test('raising concurrency drains additional FIFO work immediately without restarting active requests', async () => {
  const queue = new BackgroundRequestQueue(1), waits = Array.from({ length: 3 }, deferred), started = [];
  const tasks = waits.map((wait, i) => queue.run(async () => { started.push(i); return wait.promise; }));
  await flush(); assert.deepEqual(started, [0]); queue.setLimit(3); await flush(); assert.equal(queue.concurrency, 3);
  assert.deepEqual(started, [0, 1, 2]); assert.equal(queue.stats.active, 3); assert.equal(queue.stats.queued, 0);
  waits.forEach((wait, i) => wait.resolve(i)); assert.deepEqual(await Promise.all(tasks), [0, 1, 2]);
});

test('changing concurrency preserves explicit pause and resumes with the latest limit', async () => {
  const queue = new BackgroundRequestQueue(1), waits = Array.from({ length: 3 }, deferred), started = [];
  queue.setPaused(true); const tasks = waits.map((wait, i) => queue.run(async () => { started.push(i); return wait.promise; }));
  queue.setLimit(3); await flush(); assert.deepEqual(started, []); assert.equal(queue.stats.active, 0);
  queue.setLimit(2); queue.setPaused(false); await flush(); assert.deepEqual(started, [0, 1]);
  waits[0].resolve(0); await tasks[0]; await flush(); assert.deepEqual(started, [0, 1, 2]);
  waits[1].resolve(1); waits[2].resolve(2); assert.deepEqual(await Promise.all(tasks), [0, 1, 2]);
});

test('invalid dynamic concurrency leaves prior capacity and pending work unchanged', async () => {
  const queue = new BackgroundRequestQueue(2); queue.setPaused(true);
  const task = queue.run(async () => 'metadata');
  for (const value of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => queue.setLimit(value), RangeError);
  assert.equal(queue.concurrency, 2); assert.equal(queue.stats.queued, 1); queue.setPaused(false);
  assert.equal(await task, 'metadata');
});
