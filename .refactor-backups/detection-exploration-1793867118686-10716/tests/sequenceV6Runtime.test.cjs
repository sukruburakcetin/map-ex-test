const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '..');
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = new Map();
function load(relative) {
  if (loaded.has(relative)) return loaded.get(relative);
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compile(fs.readFileSync(path.join(root, 'src', relative + '.ts'), 'utf8')))(
    name => load(path.posix.normalize(path.posix.join(path.posix.dirname(relative), name))), module, module.exports);
  loaded.set(relative, module.exports); return module.exports;
}
const { SharedTileRequests } = load('features/coverage/SharedTileRequests');
const { SequenceTileIndex } = load('features/coverage/SequenceTileIndex');
const { BackgroundRequestQueue } = load('features/imagery/BackgroundRequestQueue');
const { SequencePerformance } = load('features/imagery/SequencePerformance');
const { SequenceDemandData } = load('features/imagery/SequenceDemandData');
const { sequenceRouteMemoryStats } = load('features/imagery/sequenceMemoryBudget');
const { TurboTileCache } = load('utils/turboCoverageUtils');
const source = fs.readFileSync(path.join(root, 'src/runtime/widget.tsx'), 'utf8');
const sf = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const widget = sf.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'Widget');
const names = ['getTurboTileBuffer', 'fetchTurboTileBuffer', 'getSequenceTileIndex', 'runSequenceBackground',
  'sequenceDiagnosticsSnapshot', 'buildCachedSequencePreview', 'loadSequenceById', 'waitForSequencePaint',
  'highlightSequenceOnVTL', 'clearSequenceCache', 'loadDetections', 'clearDetectionOverlays', 'updateNativeSequenceSelection',
  '_sequenceVisibilityChange'];
const member = name => widget.members.find(node => node.name?.getText(sf) === name).getText(sf);
let tileLayers = {}, decodes = 0;
const Runtime = new Function('VectorTile', 'Pbf', 'TILE_URLS', 'sequenceRouteMemoryStats', 'CACHE_KEYS', 'sequenceCacheStore', 'GRAPH_API',
  compile('class Runtime {' + names.map(member).join('\n') + '}') + '; return Runtime;')(
    class { constructor() { decodes++; this.layers = tileLayers; } }, class {},
    { COVERAGE: 'https://tiles.invalid/{z}/{x}/{y}' }, sequenceRouteMemoryStats,
    { SEQUENCE: 'test-sequence', GEO_PREFIX: 'test-geo:' }, { clear: async () => {} }, { BASE: 'https://graph.invalid' });
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
function mockFetch(t, fetch) { const previous = global.fetch; global.fetch = fetch; t.after(() => { global.fetch = previous; }); }
function setup() {
  let now = 100;
  const w = new Runtime();
  w.state = { isLoading: false, turboModeActive: true, sequenceImages: [], jimuMapView: { view: { type: '2d' } } };
  w.props = { config: {} }; w.accessToken = 'private-test-token'; w._tileRequestToken = null;
  w._sharedTileRequests = new SharedTileRequests(); w._sequenceTileIndex = new SequenceTileIndex();
  w._turboTileCache = new TurboTileCache(); w._backgroundRequests = new BackgroundRequestQueue(2);
  w._sequencePerformance = new SequencePerformance(() => now);
  w._nativeSequenceSelection = { select() {}, cancelPending() {} };
  w._turboIndexAbort = new AbortController(); w._turboIndexPending = new Map(); w._turboIndexCache = { clear() {} };
  w._sequenceDemand = { memoryStats: { entries: 0, items: 0, estimatedBytes: 0 } }; w.sequenceCoordsCache = {};
  return { w, setNow: value => { now = value; } };
}

test('actual tile transport shares one download across consumers and independent cancellation preserves the remaining caller', async t => {
  const { w, setNow } = setup(), body = deferred(), seen = [];
  mockFetch(t, async (url, options) => { seen.push({ url, signal: options.signal }); return { ok: true, status: 200, arrayBuffer: () => body.promise }; });
  const a = new AbortController(), b = new AbortController(), tile = [1, 2, 14];
  const first = w.getTurboTileBuffer(tile, a.signal), second = w.getTurboTileBuffer(tile, b.signal);
  await flush(); assert.equal(seen.length, 1); a.abort(); await assert.rejects(first, { name: 'AbortError' });
  assert.equal(seen[0].signal.aborted, false);
  const bytes = new ArrayBuffer(4); setNow(125); body.resolve(bytes); assert.equal(await second, bytes);
  assert.equal(await w.getTurboTileBuffer(tile, new AbortController().signal), bytes); assert.equal(seen.length, 1);
  const snapshot = w._sequencePerformance.snapshot();
  assert.equal(snapshot.counters.sharedTileRequests, 1); assert.equal(snapshot.counters.tileCacheHits, 1);
  assert.equal(snapshot.timings['tile-load'].count, 1); assert.equal(snapshot.timings['tile-load'].lastMs, 25);
});

test('a token change cancels old shared requests and cannot cache their late bytes', async t => {
  const { w } = setup(), oldBody = deferred(), seen = [], fresh = new ArrayBuffer(7);
  mockFetch(t, async (url, options) => {
    seen.push({ url, signal: options.signal });
    return { ok: true, status: 200, arrayBuffer: () => seen.length === 1 ? oldBody.promise : Promise.resolve(fresh) };
  });
  const old = w.getTurboTileBuffer([1, 2, 14], new AbortController().signal); await flush();
  w.accessToken = 'replacement-token'; const next = w.getTurboTileBuffer([1, 2, 14], new AbortController().signal);
  await assert.rejects(old, { name: 'AbortError' }); assert.equal(seen[0].signal.aborted, true);
  assert.equal(await next, fresh); oldBody.resolve(new ArrayBuffer(99)); await flush();
  assert.equal(w._turboTileCache.get('14/1/2'), fresh); assert.equal(w._turboTileCache.byteLength, 7);
  assert.equal(seen.length, 2); assert(seen[0].url.includes('private-test-token')); assert(seen[1].url.includes('replacement-token'));
});

test('final tile subscriber cancellation leaves no late cache entry even if the body ignores abort', async t => {
  const { w } = setup(), held = deferred(), caller = new AbortController(); let signal;
  mockFetch(t, async (url, options) => { signal = options.signal; return { ok: true, status: 200, arrayBuffer: () => held.promise }; });
  const work = w.getTurboTileBuffer([1, 2, 14], caller.signal); await flush(); caller.abort();
  await assert.rejects(work, { name: 'AbortError' }); assert.equal(signal.aborted, true);
  held.resolve(new ArrayBuffer(12)); await flush(); assert.equal(w._turboTileCache.size, 0);
  assert.equal(w._sequencePerformance.snapshot().timings['tile-load'].count, 0);
});

function navigation(w) {
  const events = [], moves = new Map();
  w._selectionRequestId = 0; w._liveSequenceFrames = { cancelPending() {}, beginSelection(id) { this.sequenceId = id; }, remember() {}, find() {}, current: null };
  w._liveFrameDetails = { clear() {} }; w._nearbyDiscovery = { cancel() {} };
  w.clearGreenPulse = w.clearConeGraphics = w.clearActiveSequenceLayer = () => {};
  w.drawPulsingPoint = () => ({}); w.drawCone = () => {}; w.coneLengths = w.coneSpreads = [1]; w.zoomStepIndex = 0;
  w.ensureImageViewer = () => {}; w.checkForTimeTravel = () => {}; w.prepareDemandSequence = async () => events.push('context');
  w.setState = (patch, callback) => { const next = typeof patch === 'function' ? patch(w.state) : patch; if (next) Object.assign(w.state, next); callback?.(); };
  w.mapillaryViewer = { moveTo: id => { events.push('move:' + id); const wait = deferred(); moves.set(id, wait); return wait.promise; } };
  return { events, moves };
}

test('actual image navigation starts while optional metadata is paused and resumes it after image confirmation', async () => {
  const { w, setNow } = setup(), { events, moves } = navigation(w); let metadataStarted = 0;
  setNow(100); const opening = w.loadSequenceById('A', '1', undefined, false, false, 40); await flush();
  const metadata = w.runSequenceBackground(async () => { metadataStarted++; return 'address'; });
  await flush(); assert(events.includes('move:1')); assert.equal(metadataStarted, 0); assert.equal(w._backgroundRequests.stats.queued, 1);
  setNow(160); moves.get('1').resolve({ id: '1', originalLngLat: { lng: 29, lat: 41 } }); await opening;
  assert.equal(await metadata, 'address'); assert.equal(metadataStarted, 1);
  const timing = w._sequencePerformance.snapshot().timings['click-image']; assert.equal(timing.count, 1); assert.equal(timing.lastMs, 120);
});

test('an old image completion cannot record a successful click timing or resume a newer image queue', async () => {
  const { w, setNow } = setup(), { moves } = navigation(w);
  const first = w.loadSequenceById('A', '1'); await flush(); setNow(150);
  const second = w.loadSequenceById('B', '2'); await flush();
  moves.get('1').resolve({ id: '1', originalLngLat: { lng: 29, lat: 41 } }); await first;
  let started = false; const background = w.runSequenceBackground(async () => { started = true; }); await flush();
  assert.equal(started, false); assert.equal(w._sequencePerformance.snapshot().timings['click-image'].count, 0);
  setNow(200); moves.get('2').resolve({ id: '2', originalLngLat: { lng: 29, lat: 41 } }); await second; await background;
  const timing = w._sequencePerformance.snapshot().timings['click-image']; assert.equal(timing.count, 1); assert.equal(timing.lastMs, 50);
});

test('actual sequence-index and minimap paths inspect only the requested membership after the shared index is warm', async () => {
  const { w } = setup(), reads = { A: 0, B: 0 }; decodes = 0;
  const make = id => ({ extent: 4096, get properties() { reads[id]++; return { id }; }, loadGeometry: () => [[{ x: 10, y: 10 }, { x: 20, y: 20 }]] });
  const features = [make('A'), make('B'), make('B')];
  tileLayers = { sequence: { length: features.length, feature: index => features[index] } };
  const bytes = new ArrayBuffer(1), signal = new AbortController().signal;
  const index = await w.getSequenceTileIndex(bytes, signal); assert.deepEqual([...index.indices('sequence', 'A')], [0]);
  assert.equal(w._sequenceTileIndex.stats.builds, 1); assert.equal(reads.B, 2);
  w.state.sequenceId = 'A'; w._selectionRequestId = 1; w._liveSequenceFrames = { complete: null };
  w.ArcGISModules = { Graphic: class { constructor(properties) { Object.assign(this, properties); } } }; w.updateMinimapTracking = () => {};
  await w.buildCachedSequencePreview('A', 1, signal, [['14/1/2', bytes]]);
  assert.equal(reads.B, 2); assert.equal(reads.A, 2); assert.equal(w._liveSequenceLine.sequenceId, 'A');
  assert.equal(w._sequenceTileIndex.stats.builds, 1); assert.equal(w._sequencePerformance.snapshot().counters.indexHits, 1);
});

test('diagnostic snapshots expose numeric summaries without scanning legacy routes or including identities', () => {
  const { w } = setup();
  w.sequenceCoordsCache = new Proxy({}, { ownKeys() { throw Error('Diagnostics must not bootstrap route validation'); } });
  w._sequencePerformance.count('clicks'); const snapshot = w.sequenceDiagnosticsSnapshot();
  assert.deepEqual(snapshot.routes, { entries: 0, items: 0, estimatedBytes: 0 }); assert.equal(snapshot.counters.clicks, 1);
  assert.equal(snapshot.imageTiling, null); assert.equal(snapshot.tiles.cachedBytes, 0); assert.equal(snapshot.background.active, 0);
  const json = JSON.stringify(snapshot); for (const secret of ['private-test-token', 'image-1', 'https://', 'access_token']) assert(!json.includes(secret));
  snapshot.counters.clicks = 999; assert.equal(w.sequenceDiagnosticsSnapshot().counters.clicks, 1);
});

function browserFrames(t) {
  const previous = new Map(['document', 'requestAnimationFrame', 'cancelAnimationFrame'].map(name => [name, Object.getOwnPropertyDescriptor(global, name)]));
  const frames = new Map(); let serial = 0;
  Object.defineProperty(global, 'document', { configurable: true, writable: true, value: { visibilityState: 'visible' } });
  Object.defineProperty(global, 'requestAnimationFrame', { configurable: true, writable: true, value: callback => { const id = ++serial; frames.set(id, callback); return id; } });
  Object.defineProperty(global, 'cancelAnimationFrame', { configurable: true, writable: true, value: id => frames.delete(id) });
  t.after(() => { for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(global, name, descriptor); else delete global[name]; } });
  return { get pending() { return frames.size; }, paint() { const ready = [...frames.values()]; frames.clear(); for (const callback of ready) callback(); } };
}

function hoverClock(t, initial = 100) {
  const previous = Object.getOwnPropertyDescriptor(global, 'performance'); let now = initial;
  Object.defineProperty(global, 'performance', { configurable: true, value: { now: () => now } });
  t.after(() => { if (previous) Object.defineProperty(global, 'performance', previous); else delete global.performance; });
  return value => { now = value; };
}

test('a confirmed image keeps optional metadata paused until its visible browser paint completes', async t => {
  const frames = browserFrames(t), { w, setNow } = setup(), { moves } = navigation(w); const started = [], roles = [];
  w._nativeSequenceSelection = { select: id => roles.push(['select', id]), cancelPending: role => roles.push(['cancel', role]) };
  const opening = w.loadSequenceById('A', '1', undefined, false, false, 40); await flush();
  w.updateNativeSequenceSelection(); assert.deepEqual(roles, [['cancel', 'selected']]);
  moves.get('1').resolve({ id: '1', originalLngLat: { lng: 29, lat: 41 } }); await flush();
  assert.equal(w.state.isLoading, false); assert.equal(frames.pending, 1); assert.equal(w._imageryOpeningRequest, 1);
  w.updateNativeSequenceSelection(); assert.deepEqual(roles, [['cancel', 'selected'], ['cancel', 'selected']]);
  const address = w.runSequenceBackground(async () => { started.push('address'); return 'address'; });
  const context = w.runSequenceBackground(async () => { started.push('context'); return 'context'; });
  await flush(); assert.deepEqual(started, []); assert.equal(w._backgroundRequests.stats.queued, 2);
  assert.equal(w._sequencePerformance.snapshot().timings['click-image'].count, 0);
  frames.paint(); await flush(); assert.deepEqual(started, []); assert.equal(frames.pending, 1);
  assert.equal(roles.some(([kind]) => kind === 'select'), false);
  setNow(200); frames.paint(); await opening; assert.deepEqual(await Promise.all([address, context]), ['address', 'context']);
  assert.deepEqual(started, ['address', 'context']); assert.equal(w._imageryOpeningRequest, null);
  assert.deepEqual(roles.filter(([kind]) => kind === 'select'), [['select', 'A']]);
  const timing = w._sequencePerformance.snapshot().timings['click-image']; assert.equal(timing.count, 1); assert.equal(timing.lastMs, 160);
});

test('superseding an image awaiting paint cancels its gate and cannot resume metadata for the next selection', async t => {
  const frames = browserFrames(t), { w, setNow } = setup(), { moves } = navigation(w);
  const first = w.loadSequenceById('A', '1'); await flush(); moves.get('1').resolve({ id: '1', originalLngLat: { lng: 29, lat: 41 } }); await flush();
  assert.equal(w.state.isLoading, false); assert.equal(frames.pending, 1);
  setNow(150); const second = w.loadSequenceById('B', '2'); await flush(); await first;
  assert.equal(frames.pending, 0); assert.equal(w._imageryOpeningRequest, 2);
  let started = false; const metadata = w.runSequenceBackground(async () => { started = true; }); await flush();
  assert.equal(started, false); assert.equal(w._sequencePerformance.snapshot().timings['click-image'].count, 0);
  moves.get('2').resolve({ id: '2', originalLngLat: { lng: 29, lat: 41 } }); await flush();
  assert.equal(w.state.isLoading, false); assert.equal(w._imageryOpeningRequest, 2); assert.equal(started, false);
  frames.paint(); await flush(); assert.equal(started, false);
  setNow(220); frames.paint(); await second; await metadata;
  assert.equal(started, true); assert.equal(w._imageryOpeningRequest, null);
  const timing = w._sequencePerformance.snapshot().timings['click-image']; assert.equal(timing.count, 1); assert.equal(timing.lastMs, 70);
});

test('runtime optional metadata uses one physical slot during playback and two while paused', async () => {
  const { w } = setup(), waits = [], started = [];
  const job = id => w.runSequenceBackground(async () => { started.push(id); const wait = deferred(); waits.push(wait); await wait.promise; return id; });
  w._userPaused = false; const a = job('a'), b = job('b'), c = job('c'); await flush();
  assert.deepEqual(started, ['a']); assert.equal(w._backgroundRequests.concurrency, 1); assert.equal(w._backgroundRequests.stats.active, 1);
  w._userPaused = true; const d = job('d'); await flush();
  assert.deepEqual(started, ['a', 'b']); assert.equal(w._backgroundRequests.concurrency, 2); assert.equal(w._backgroundRequests.stats.active, 2);
  waits[0].resolve(); waits[1].resolve(); await flush();
  assert.deepEqual(started, ['a', 'b', 'c', 'd']); assert.equal(w._backgroundRequests.stats.active, 2);
  waits[2].resolve(); waits[3].resolve(); assert.deepEqual(await Promise.all([a, b, c, d]), ['a', 'b', 'c', 'd']);
});

test('an imagery paint gate blocks optional starts even when the loading UI is already false', async () => {
  const { w } = setup(), started = [], waits = [];
  const job = id => w.runSequenceBackground(async () => { started.push(id); const wait = deferred(); waits.push(wait); await wait.promise; return id; });
  w.state.isLoading = false; w._userPaused = true; w._imageryOpeningRequest = 7;
  const a = job('a'), b = job('b'); await flush(); assert.deepEqual(started, []); assert.equal(w._backgroundRequests.stats.active, 0); assert.equal(w._backgroundRequests.stats.queued, 2);
  w._imageryOpeningRequest = null; const c = job('c'); await flush(); assert.deepEqual(started, ['a', 'b']);
  waits[0].resolve(); waits[1].resolve(); await flush(); assert.deepEqual(started, ['a', 'b', 'c']);
  waits[2].resolve(); assert.deepEqual(await Promise.all([a, b, c]), ['a', 'b', 'c']);
});

test('loading imagery pauses queued metadata before increasing optional concurrency', async () => {
  const { w } = setup(), waits = new Map(), started = [];
  const job = id => w.runSequenceBackground(async () => { started.push(id); const wait = deferred(); waits.set(id, wait); await wait.promise; return id; });
  w._userPaused = false; const a = job('a'), b = job('b'); await flush();
  assert.deepEqual(started, ['a']); assert.equal(w._backgroundRequests.stats.queued, 1);
  // Image navigation pauses playback and opens the loading UI in the same turn.
  // Raising the optional limit first would reserve b before the queue is paused.
  w.state.isLoading = true; w._userPaused = true; const c = job('c'); await flush();
  assert.deepEqual(started, ['a']); assert.equal(w._backgroundRequests.stats.active, 1); assert.equal(w._backgroundRequests.stats.queued, 2);
  waits.get('a').resolve(); await a; await flush();
  assert.deepEqual(started, ['a']); assert.equal(w._backgroundRequests.stats.active, 0);
  w.state.isLoading = false; const d = job('d'); await flush();
  assert.deepEqual(started, ['a', 'b', 'c']);
  waits.get('b').resolve(); waits.get('c').resolve(); await flush(); assert.deepEqual(started, ['a', 'b', 'c', 'd']);
  waits.get('d').resolve(); assert.deepEqual(await Promise.all([b, c, d]), ['b', 'c', 'd']);
});

test('repeated hover notifications reuse pending and completed work through both paint frames', async t => {
  const frames = browserFrames(t), clock = hoverClock(t), { w, setNow } = setup(), work = deferred(); let calls = 0;
  w._nativeSequenceSelection = { hover: () => { calls++; return work.promise; } };
  const first = w.highlightSequenceOnVTL('A');
  assert.equal(w.highlightSequenceOnVTL('A'), first); assert.equal(w._sequencePerformance.snapshot().counters.hoverRequests, 1);
  work.resolve(); await flush(); assert.equal(frames.pending, 1);
  assert.equal(w.highlightSequenceOnVTL('A'), first); assert.equal(frames.pending, 1);
  frames.paint(); await flush(); assert.equal(frames.pending, 1);
  assert.equal(w.highlightSequenceOnVTL('A'), first); assert.equal(frames.pending, 1);
  clock(160); setNow(160); frames.paint(); await first;
  assert.equal(frames.pending, 0); assert.equal(w.highlightSequenceOnVTL('A'), first); await flush();
  assert.equal(frames.pending, 0); assert.equal(calls, 5);
  const snapshot = w._sequencePerformance.snapshot(); assert.equal(snapshot.counters.hoverRequests, 1);
  assert.equal(snapshot.timings['hover-highlight'].count, 1); assert.equal(snapshot.timings['hover-highlight'].lastMs, 60);
});

test('changing the hovered sequence cancels its pending paint and records only the replacement', async t => {
  const frames = browserFrames(t), clock = hoverClock(t), { w, setNow } = setup(), a = deferred(), b = deferred();
  w._nativeSequenceSelection = { hover: id => id === 'A' ? a.promise : b.promise };
  const first = w.highlightSequenceOnVTL('A'); a.resolve(); await flush(); assert.equal(frames.pending, 1);
  clock(130); setNow(130); const second = w.highlightSequenceOnVTL('B'); await first;
  assert.notEqual(first, second); assert.equal(frames.pending, 0);
  b.resolve(); await flush(); frames.paint(); await flush(); assert.equal(w._sequencePerformance.snapshot().timings['hover-highlight'].count, 0);
  clock(180); setNow(180); frames.paint(); await second;
  const snapshot = w._sequencePerformance.snapshot(); assert.equal(snapshot.counters.hoverRequests, 2);
  assert.equal(snapshot.timings['hover-highlight'].count, 1); assert.equal(snapshot.timings['hover-highlight'].lastMs, 50);
});

test('renewed native hover work for the same sequence gets a new paint timing', async t => {
  const frames = browserFrames(t), clock = hoverClock(t), { w, setNow } = setup(), old = deferred(), renewed = deferred(); let work = old.promise;
  w._nativeSequenceSelection = { hover: () => work };
  const first = w.highlightSequenceOnVTL('A'); old.resolve(); await flush(); assert.equal(frames.pending, 1);
  clock(125); setNow(125); work = renewed.promise; const second = w.highlightSequenceOnVTL('A'); await first;
  assert.notEqual(first, second); assert.equal(frames.pending, 0);
  renewed.resolve(); await flush(); frames.paint(); await flush(); clock(175); setNow(175); frames.paint(); await second;
  const snapshot = w._sequencePerformance.snapshot(); assert.equal(snapshot.counters.hoverRequests, 2);
  assert.equal(snapshot.timings['hover-highlight'].count, 1); assert.equal(snapshot.timings['hover-highlight'].lastMs, 50);
});

test('moving the same hover work to another view cancels the old view paint sample', async t => {
  const frames = browserFrames(t), clock = hoverClock(t), { w, setNow } = setup(), work = Promise.resolve();
  w._nativeSequenceSelection = { hover: () => work };
  const first = w.highlightSequenceOnVTL('A'); await flush(); assert.equal(frames.pending, 1);
  w.state.jimuMapView = { view: { type: '2d' } }; clock(120); setNow(120);
  const second = w.highlightSequenceOnVTL('A'); await first; await flush();
  assert.notEqual(first, second); assert.equal(frames.pending, 1);
  frames.paint(); await flush(); clock(150); setNow(150); frames.paint(); await second;
  const snapshot = w._sequencePerformance.snapshot(); assert.equal(snapshot.counters.hoverRequests, 2);
  assert.equal(snapshot.timings['hover-highlight'].count, 1); assert.equal(snapshot.timings['hover-highlight'].lastMs, 30);
});

test('clearing the sequence cache during image paint cancels optional jobs and permits new work without an old timing', async t => {
  const frames = browserFrames(t), { w, setNow } = setup(), { moves, events } = navigation(w), started = [];
  const previous = Object.getOwnPropertyDescriptor(global, 'localStorage');
  Object.defineProperty(global, 'localStorage', { configurable: true, value: { removeItem() {} } });
  t.after(() => { if (previous) Object.defineProperty(global, 'localStorage', previous); else delete global.localStorage; });
  w.state.jimuMapView.view.graphics = { removeAll() {}, remove() {} }; w.log = () => {};
  w._liveSequenceFrames.clear = () => {}; w.mapillaryViewer.remove = () => events.push('remove');
  w._sequenceDemand = new SequenceDemandData((url, signal) => w.runSequenceBackground(async () => { started.push('old-demand'); return { data: [{ id: '1' }] }; }, signal));
  w._sequenceDemand.seed('A', [{ id: '1', lon: 29, lat: 41 }]);
  const opening = w.loadSequenceById('A', '1'); await flush();
  moves.get('1').resolve({ id: '1', originalLngLat: { lng: 29, lat: 41 } }); await flush();
  assert.equal(w.state.isLoading, false); assert.equal(frames.pending, 1); assert.equal(w._imageryOpeningRequest, 1);
  const demand = assert.rejects(w._sequenceDemand.ids('A', new AbortController().signal), { name: 'AbortError' });
  const address = assert.rejects(w.runSequenceBackground(async () => { started.push('old-address'); }), { name: 'AbortError' });
  await flush(); assert.equal(w._backgroundRequests.stats.queued, 2);
  setNow(150); w.clearSequenceCache(); await opening; await Promise.all([demand, address]);
  assert.equal(frames.pending, 0); assert.equal(w._imageryOpeningRequest, null); assert.equal(w.state.sequenceId, null);
  assert.equal(w._sequenceDemand.find('A', '1'), undefined); assert.equal(w._backgroundRequests.stats.queued, 0);
  assert.equal(w._sequencePerformance.snapshot().timings['click-image'].count, 0); assert(events.includes('remove')); assert(!events.includes('context'));
  assert.equal(await w.runSequenceBackground(async () => { started.push('new'); return 'ready'; }), 'ready');
  assert.deepEqual(started, ['new']); assert.equal(w._backgroundRequests.stats.aborted, 2);
});

function detectionViewer(w, imageId) {
  const calls = { images: 0, removed: 0, added: 0, cleaned: 0 };
  const tags = { removeAll: () => { calls.removed++; }, add: () => { calls.added++; },
    _detectionHoverCleanup: () => { calls.cleaned++; }, _refreshDetectionLabels() {} };
  const viewer = { getImage: async () => { calls.images++; return { id: imageId }; }, getComponent: () => tags };
  Object.assign(w.state, { detectionsActive: true, trafficSignsActive: true, imageId });
  w._detectionLoadRequest ??= 0; w.detectionTagMap ??= new Map(); w.mapillaryViewer = viewer;
  return { calls, tags, viewer };
}

test('detections wait behind an imagery paint gate and clearing overlays cancels the queued HTTP work', async t => {
  const { w } = setup(), { calls, tags } = detectionViewer(w, '1'); let requests = 0;
  mockFetch(t, async () => { requests++; return { ok: true, json: async () => ({ data: [] }) }; });
  w.detectionTagMap.set('old', 'old-tag'); w._pendingDetectionFocus = { imageId: '1' }; w._imageryOpeningRequest = 3;
  const loading = w.loadDetections('1'); await flush();
  assert.equal(requests, 0); assert.equal(w._backgroundRequests.stats.queued, 1); assert.equal(calls.removed, 0);
  w.clearDetectionOverlays(); await loading;
  assert.equal(requests, 0); assert.equal(w._backgroundRequests.stats.queued, 0); assert.equal(w._backgroundRequests.stats.aborted, 1);
  assert.equal(w._detectionAbort, null); assert.equal(w._pendingDetectionFocus, null); assert.equal(w.detectionTagMap.size, 0);
  assert.equal(calls.removed, 1); assert.equal(calls.cleaned, 1); assert.equal(tags._detectionHoverCleanup, undefined); assert.equal(tags._refreshDetectionLabels, undefined);
});

test('a new image click cancels detections queued for the previous frame before any HTTP request starts', async t => {
  const { w } = setup(); navigation(w); detectionViewer(w, '1'); let requests = 0;
  mockFetch(t, async () => { requests++; return { ok: true, json: async () => ({ data: [] }) }; });
  w._imageryOpeningRequest = 5; const detections = w.loadDetections('1'); await flush();
  assert.equal(w._backgroundRequests.stats.queued, 1); const controller = w._detectionAbort;
  // Use the real navigation method: cancelling the old detection owner belongs
  // to starting a click, even before the replacement viewer has an image.
  const nextImage = deferred(); w.mapillaryViewer.moveTo = () => nextImage.promise;
  const opening = w.loadSequenceById('B', '2'); await flush(); await detections;
  assert.equal(controller.signal.aborted, true); assert.equal(requests, 0); assert.equal(w._backgroundRequests.stats.queued, 0);
  nextImage.resolve({ id: '2', originalLngLat: { lng: 29, lat: 41 } }); await opening;
  assert.equal(requests, 0);
});

test('cancelled detection JSON retains its physical queue slot and cannot mutate the replacement viewer', async t => {
  const { w } = setup(), old = detectionViewer(w, '1'), oldBody = deferred(), currentBody = deferred(), requests = [];
  w._userPaused = false;
  mockFetch(t, async (url, options) => {
    requests.push({ url, signal: options.signal });
    return { ok: true, json: () => requests.length === 1 ? oldBody.promise : currentBody.promise };
  });
  const first = w.loadDetections('1'); await flush(); assert.equal(requests.length, 1); assert.equal(w._backgroundRequests.stats.active, 1);
  const current = detectionViewer(w, '2'); const second = w.loadDetections('2'); await first; await flush();
  assert.equal(requests[0].signal.aborted, true); assert.equal(requests.length, 1);
  assert.equal(w._backgroundRequests.stats.active, 1); assert.equal(w._backgroundRequests.stats.queued, 1);
  assert.deepEqual([old.calls.images, old.calls.removed, current.calls.images, current.calls.removed], [0, 0, 0, 0]);
  // The JSON reader deliberately ignores abort; its slot is released only when
  // the body settles, while the stale loader has already returned.
  oldBody.resolve({ data: [] }); await flush();
  assert.equal(requests.length, 2); assert.equal(w._backgroundRequests.stats.active, 1);
  assert.deepEqual([old.calls.images, old.calls.removed, current.calls.images, current.calls.removed], [0, 0, 0, 0]);
  assert.equal(w.mapillaryViewer, current.viewer);
  currentBody.resolve({ data: [] }); await second;
  assert.deepEqual([old.calls.images, old.calls.removed, current.calls.images, current.calls.removed], [0, 0, 1, 1]);
  assert.equal(w._backgroundRequests.stats.active, 0); assert.equal(w._detectionAbort, null);
});

test('a successful empty detection response removes the previous tags and hover listeners exactly once', async t => {
  const { w } = setup(), { calls, tags } = detectionViewer(w, '1');
  mockFetch(t, async () => ({ ok: true, json: async () => ({ data: [] }) }));
  await w.loadDetections('1');
  assert.deepEqual(calls, { images: 1, removed: 1, added: 0, cleaned: 1 });
  assert.equal(tags._detectionHoverCleanup, undefined); assert.equal(w._detectionAbort, null);
});

test('hiding during image paint cancels the click sample while navigation and optional work resume after visible paint', async t => {
  const frames = browserFrames(t), { w, setNow } = setup(), { moves, events } = navigation(w); let enriched = false;
  const opening = w.loadSequenceById('A', '1'); await flush();
  moves.get('1').resolve({ id: '1', originalLngLat: { lng: 29, lat: 41 } }); await flush();
  assert.equal(frames.pending, 1); assert.equal(w._imageryOpeningRequest, 1); assert(w._imageSequenceTiming);
  const metadata = w.runSequenceBackground(async () => { enriched = true; return 'address'; }); await flush();
  document.visibilityState = 'hidden'; w._sequenceVisibilityChange();
  assert.equal(w._selectionAbort.signal.aborted, false); assert.equal(frames.pending, 1); assert.equal(enriched, false);
  document.visibilityState = 'visible'; w._sequenceVisibilityChange();
  frames.paint(); await flush(); assert.equal(enriched, false); assert.equal(frames.pending, 1);
  setNow(300); frames.paint(); await opening; assert.equal(await metadata, 'address');
  assert.equal(enriched, true); assert.equal(w.state.imageId, '1'); assert.equal(w.state.sequenceId, 'A'); assert(events.includes('context'));
  assert.equal(w._imageryOpeningRequest, null); assert.equal(w._imageSequenceTiming, undefined);
  const snapshot = w._sequencePerformance.snapshot(); assert.equal(snapshot.counters.clicks, 1); assert.equal(snapshot.timings['click-image'].count, 0);
});
