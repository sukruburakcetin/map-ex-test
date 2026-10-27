const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const mod = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync(path.join(__dirname,
  '../src/features/imagery/SequencePerformance.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText)(mod, mod.exports);
const { SequencePerformance, SEQUENCE_PERFORMANCE_KINDS, SEQUENCE_PERFORMANCE_COUNTERS } = mod.exports;
function fixture() { let time = 0; return { owner: new SequencePerformance(() => time), set: value => { time = value; } }; }
function record(owner, set, kind, duration) { set(0); const measure = owner.begin(kind); set(duration); measure.finish(); }

test('empty snapshot exposes fixed anonymous summaries and no timing values', () => {
  const { owner } = fixture(), snapshot = owner.snapshot();
  assert.deepEqual(Object.keys(snapshot.timings), SEQUENCE_PERFORMANCE_KINDS);
  assert.deepEqual(Object.keys(snapshot.counters), SEQUENCE_PERFORMANCE_COUNTERS);
  for (const summary of [...Object.values(snapshot.timings), snapshot.playbackFrameGaps, snapshot.longTasks]) {
    assert.deepEqual(summary, { count: 0, retained: 0, p50Ms: null, p95Ms: null, maxMs: null, lastMs: null });
  }
});
test('completed durations produce deterministic nearest-rank summaries', () => {
  const { owner, set } = fixture();
  for (let i = 1; i <= 20; i++) record(owner, set, 'click-image', i * 10);
  assert.deepEqual(owner.snapshot().timings['click-image'], {
    count: 20, retained: 20, p50Ms: 100, p95Ms: 190, maxMs: 200, lastMs: 200,
  });
  assert.equal(owner.snapshot().timings['hover-highlight'].count, 0);
});
test('each kind retains only its latest 128 samples while keeping a completed count', () => {
  const { owner, set } = fixture();
  for (let i = 1; i <= 300; i++) record(owner, set, 'tile-load', i);
  const summary = owner.snapshot().timings['tile-load'];
  assert.deepEqual(summary, { count: 300, retained: 128, p50Ms: 236, p95Ms: 294, maxMs: 300, lastMs: 300 });
  for (let i = 0; i < 128; i++) record(owner, set, 'tile-load', 1);
  assert.equal(owner.snapshot().timings['tile-load'].maxMs, 1);
});
test('measurements finish once and cancelled/reset/disposed measurements never report late results', () => {
  const { owner, set } = fixture();
  const first = owner.begin('context-ready'); set(5); first.finish(); set(50); first.finish(); first.cancel();
  assert.equal(owner.snapshot().timings['context-ready'].count, 1);
  const cancelled = owner.begin('context-ready'); cancelled.cancel(); set(100); cancelled.finish();
  const reset = owner.begin('click-image'); owner.reset(); set(1000); reset.finish();
  assert.equal(owner.snapshot().timings['context-ready'].count, 0);
  assert.equal(owner.snapshot().timings['click-image'].count, 0);
  const disposed = owner.begin('tile-load'); owner.dispose(); set(2000); disposed.finish();
  const ignored = owner.begin('click-image'); set(2100); ignored.finish();
  owner.count('clicks'); owner.playbackFrame(true); owner.recordLongTask(100);
  assert.equal(owner.snapshot().timings['tile-load'].count, 0);
  assert.equal(owner.snapshot().timings['click-image'].count, 0);
  assert.equal(owner.snapshot().counters.clicks, 0);
  assert.equal(owner.snapshot().longTasks.count, 0);
  owner.reset(); record(owner, set, 'click-image', 4); assert.equal(owner.snapshot().timings['click-image'].lastMs, 4);
});
test('snapshot objects and counters cannot mutate retained measurements', () => {
  const { owner, set } = fixture(); record(owner, set, 'hover-highlight', 8); owner.count('hoverRequests');
  const snapshot = owner.snapshot(); snapshot.timings['hover-highlight'].maxMs = 900; snapshot.counters.hoverRequests = 800;
  snapshot.playbackFrameGaps.count = 100; snapshot.longTasks.count = 100;
  const fresh = owner.snapshot(); assert.equal(fresh.timings['hover-highlight'].maxMs, 8);
  assert.equal(fresh.counters.hoverRequests, 1); assert.equal(fresh.playbackFrameGaps.count, 0); assert.equal(fresh.longTasks.count, 0);
});
test('counter names are fixed and invalid deltas cannot create external keys or corrupt counts', () => {
  const { owner } = fixture();
  owner.count('clicks'); owner.count('clicks', 2); owner.count('tileRequests', 3.5);
  for (const name of ['image-id-A', 'https://example.test/private', '__proto__', 'constructor']) owner.count(name);
  for (const value of [-1, 0, NaN, Infinity]) owner.count('clicks', value);
  const counters = owner.snapshot().counters;
  assert.equal(counters.clicks, 3); assert.equal(counters.tileRequests, 3);
  assert.deepEqual(Object.keys(counters), SEQUENCE_PERFORMANCE_COUNTERS);
  owner.count('clicks', Number.MAX_VALUE); assert.equal(owner.snapshot().counters.clicks, Number.MAX_SAFE_INTEGER);
});
test('confirmed playback frame gaps exclude paused and hidden periods', () => {
  const { owner, set } = fixture();
  set(0); owner.playbackFrame(true); set(100); owner.playbackFrame(true);
  set(200); owner.playbackFrame(false); set(10000); owner.playbackFrame(true); set(10120); owner.playbackFrame(true);
  set(10200); owner.playbackFrame(true, false); set(20000); owner.playbackFrame(true, true); set(20150); owner.playbackFrame(true);
  const summary = owner.snapshot().playbackFrameGaps;
  assert.deepEqual(summary, { count: 3, retained: 3, p50Ms: 120, p95Ms: 150, maxMs: 150, lastMs: 150 });
});
test('invalid clocks and durations are ignored instead of creating negative or nonfinite timings', () => {
  const { owner, set } = fixture();
  set(10); const backward = owner.begin('click-image'); set(9); backward.finish();
  set(NaN); const invalid = owner.begin('click-image'); set(20); invalid.finish();
  owner.recordLongTask(-1); owner.recordLongTask(NaN); owner.recordLongTask(Infinity);
  owner.recordLongTask(0); owner.recordLongTask(75);
  set(10); owner.playbackFrame(true); set(9); owner.playbackFrame(true); set(NaN); owner.playbackFrame(true);
  set(1000); owner.playbackFrame(true);
  assert.equal(owner.snapshot().timings['click-image'].count, 0);
  assert.equal(owner.snapshot().playbackFrameGaps.count, 0);
  assert.deepEqual(owner.snapshot().longTasks, { count: 2, retained: 2, p50Ms: 0, p95Ms: 75, maxMs: 75, lastMs: 75 });
});
test('long-task durations and confirmed-frame gaps use independently bounded windows', () => {
  const { owner, set } = fixture();
  for (let i = 0; i <= 200; i++) { set(i * 10); owner.playbackFrame(true); owner.recordLongTask(i); }
  const snapshot = owner.snapshot();
  assert.equal(snapshot.playbackFrameGaps.count, 200); assert.equal(snapshot.playbackFrameGaps.retained, 128);
  assert.equal(snapshot.playbackFrameGaps.p95Ms, 10);
  assert.equal(snapshot.longTasks.count, 201); assert.equal(snapshot.longTasks.retained, 128); assert.equal(snapshot.longTasks.lastMs, 200);
});


test('an earlier event timestamp includes work before navigation timing begins', () => {
  const { owner, set } = fixture();
  set(100); const measure = owner.begin('click-image', 25);
  set(175); measure.finish();
  assert.deepEqual(owner.snapshot().timings['click-image'], {
    count: 1, retained: 1, p50Ms: 150, p95Ms: 150, maxMs: 150, lastMs: 150,
  });
});
test('invalid, negative or future event timestamps fall back to the current clock', () => {
  const { owner, set } = fixture();
  for (const startedAt of [undefined, NaN, Infinity, -Infinity, -1, 101, null, '0']) {
    set(100); const measure = owner.begin('click-image', startedAt);
    set(125); measure.finish();
  }
  const summary = owner.snapshot().timings['click-image'];
  assert.equal(summary.count, 8); assert.equal(summary.p50Ms, 25);
  assert.equal(summary.maxMs, 25); assert.equal(summary.lastMs, 25);
  set(0); const zero = owner.begin('click-image', 0); set(30); zero.finish();
  assert.equal(owner.snapshot().timings['click-image'].lastMs, 30);
});
test('an invalid owner clock cannot be rescued by an externally supplied start timestamp', () => {
  const { owner, set } = fixture();
  set(NaN); const invalid = owner.begin('click-image', 0);
  set(100); invalid.finish();
  set(Infinity); const infinite = owner.begin('click-image', 0);
  set(200); infinite.finish();
  assert.equal(owner.snapshot().timings['click-image'].count, 0);
});
