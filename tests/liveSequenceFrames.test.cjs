const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/features/imagery/LiveSequenceFrames.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const moduleValue = { exports: {} };
new Function('module', 'exports', compiled)(moduleValue, moduleValue.exports);
const { LiveSequenceFrames, LIVE_SEQUENCE_LIMITS } = moduleValue.exports;
const point = id => ({ id: String(id), lon: Number(id) / 10000, lat: 1 });
const unavailable = () => { throw new Error('Unexpected metadata request'); };

test('same-route begin and finish preserve indexed data without reading the route again', () => {
  let sealed = false;
  const route = new Proxy(Array.from({ length: 4096 }, (_, i) => point(i)), {
    get(target, key, receiver) {
      if (sealed && (key === Symbol.iterator || key === 'forEach' || key === 'length' || /^\d+$/.test(String(key)))) {
        throw new Error('Warm route was traversed again');
      }
      return Reflect.get(target, key, receiver);
    },
  });
  const frames = new LiveSequenceFrames(unavailable);
  frames.beginSelection('A');
  assert.equal(frames.finish('A', route), true);
  const known = frames.find('2048');
  sealed = true;
  frames.begin('A', route);
  assert.equal(frames.finish('A', route), true);
  frames.beginSelection('A');
  assert.equal(frames.complete, route);
  assert.equal(frames.find('2048'), known);
  sealed = false;
  assert(frames.markerWindow('2048').points.includes(known));
});

test('cheap selection preserves completed route indices while resetting confirmed image identity', async () => {
  const frames = new LiveSequenceFrames(unavailable);
  const route = Array.from({ length: 300 }, (_, i) => point(i));
  frames.beginSelection('A'); frames.finish('A', route);
  const current = await frames.resolve({ id: '160', sequenceId: 'A' });
  assert.equal(frames.isCurrent(current), true);
  const window = frames.markerWindow('160');
  frames.beginSelection('A');
  assert.equal(frames.current, null);
  assert.equal(frames.isCurrent(current), false);
  assert.equal(frames.complete, route);
  assert.deepEqual(frames.markerWindow('160'), window);
  assert.equal(frames.visible(point(160)), route);
});

test('switching sequence clears old route and local metadata before new route adoption', () => {
  const frames = new LiveSequenceFrames(unavailable);
  frames.beginSelection('A'); frames.setLocal('A', [point(1), point(2)]); frames.finish('A', [point(1), point(2)]);
  frames.beginSelection('B');
  assert.equal(frames.sequenceId, 'B');
  assert.equal(frames.complete, null);
  assert.equal(frames.find('1'), undefined);
  assert.deepEqual(frames.local, []);
  assert.equal(frames.markerWindow('1'), null);
  assert.equal(frames.finish('A', [point(1)]), false);
  const next = [point(3), point(4)];
  assert.equal(frames.finish('B', next), true);
  assert.equal(frames.find('4'), next[1]);
});

test('new selection invalidates a delayed previous image resolution even when metadata ignores abort', async () => {
  let finish;
  let signal;
  const frames = new LiveSequenceFrames((id, requestSignal) => {
    signal = requestSignal;
    return new Promise(resolve => { finish = resolve; });
  });
  frames.beginSelection('A');
  const pending = frames.resolve({ id: '1', sequenceId: 'A' });
  frames.beginSelection('B');
  assert.equal(signal.aborted, true);
  finish({ geometry: { coordinates: [1, 2] }, sequence: 'A' });
  assert.equal(await pending, null);
  assert.equal(frames.sequenceId, 'B');
  assert.equal(frames.current, null);
  assert.equal(frames.find('1'), undefined);
});

test('same completed snapshot does not overwrite newer confirmed frame metadata', async () => {
  const frames = new LiveSequenceFrames(unavailable), route = [point(1), point(2)];
  frames.beginSelection('A'); frames.finish('A', route);
  const current = await frames.resolve({ id: '1', sequenceId: 'A' });
  frames.begin('A', route); frames.finish('A', route);
  assert.equal(frames.find('1'), current);
  assert.equal(frames.complete, route);
});

test('a different completed route snapshot rebuilds the relevant marker indices', () => {
  const frames = new LiveSequenceFrames(unavailable);
  const first = Array.from({ length: 300 }, (_, i) => point(i));
  const replacement = first.slice().reverse();
  frames.beginSelection('A'); frames.finish('A', first);
  const firstWindow = frames.markerWindow('20');
  assert.equal(frames.finish('A', replacement), true);
  const nextWindow = frames.markerWindow('20');
  assert.notEqual(nextWindow.key, firstWindow.key);
  assert.equal(frames.complete, replacement);
  assert(nextWindow.points.some(p => p.id === '20'));
});

test('partial windows remain bounded and survive a same-sequence cheap selection', () => {
  const frames = new LiveSequenceFrames(unavailable);
  frames.beginSelection('A');
  for (let start = 0; start < 700; start += 100) {
    frames.setLocal('A', Array.from({ length: 100 }, (_, i) => point(start + i)));
  }
  assert(frames.points().length <= 384);
  const local = frames.local;
  frames.beginSelection('A');
  assert.equal(frames.local, local);
  assert.equal(frames.markerWindow('650').points.length, Math.min(local.length, LIVE_SEQUENCE_LIMITS.markerCount));
  frames.clear();
  assert.equal(frames.complete, null);
  assert.equal(frames.sequenceId, null);
  assert.deepEqual(frames.points(), []);
});
