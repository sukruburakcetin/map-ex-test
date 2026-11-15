/** Exercise real selection and fullscreen lifecycles with an already confirmed viewer frame. */
const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '..');
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const source = fs.readFileSync(process.env.PULSE_WIDGET_SOURCE || path.join(root, 'src/runtime/widget.tsx'), 'utf8');
const sf = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const widget = sf.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'Widget');
const members = ['loadSequenceById', 'clearActiveSequenceGraphics', 'prepareDemandSequence', 'toggleFullscreen', 'bindMapillaryEvents'];
const member = name => widget.members.find(node => node.name?.getText(sf) === name).getText(sf);
const moduleFor = file => { const m = { exports: {} }; new Function('module', 'exports', compile(fs.readFileSync(file, 'utf8')))(m, m.exports); return m.exports; };
const { LiveSequenceFrames } = moduleFor(path.join(root, 'src/features/imagery/LiveSequenceFrames.ts'));
const immediateTimer = callback => { queueMicrotask(callback); return 1; };
const newViewerEvents = [];
class Viewer {
  constructor(options) { this.options = options; this.events = new Map(); newViewerEvents.push(this); }
  on(name, callback) { this.events.set(name, callback); }
}
const Runtime = new Function('Viewer', 'readCachedSequenceCoordinates', 'debounceUtil', 'setTimeout',
  compile('class Runtime {' + members.map(member).join('\n') + '}') + '; return Runtime;')(
  Viewer, async (cache, id) => cache[id] || null, callback => callback, immediateTimer);
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve; return { promise: new Promise(done => { resolve = done; }), resolve: value => resolve(value) }; }
function setup(type = '2d') {
  const w = new Runtime(), events = [], moves = new Map(), graphics = [];
  const view = { type, graphics: { forEach: callback => graphics.slice().forEach(callback), remove: graphic => { const index = graphics.indexOf(graphic); if (index >= 0) graphics.splice(index, 1); }, add: graphic => graphics.push(graphic) }, goTo: async () => {} };
  const oldImage = { id: 'old-image', lon: 29, lat: 41 };
  w.state = { sequenceImages: [oldImage], imageId: oldImage.id, sequenceId: 'old-sequence', selectedSequenceId: 'old-sequence',
    jimuMapView: { view }, isLoading: false, turboModeActive: true, availableSequences: [], isFullscreen: false };
  w.props = { config: {} }; w.accessToken = 'test'; w.sequenceCoordsCache = {}; w._selectionRequestId = 0;
  w._lastSuccessfulSelection = { sequenceImages: [oldImage], imageId: oldImage.id, sequenceId: 'old-sequence', selectedSequenceId: 'old-sequence' };
  w._liveSequenceFrames = new LiveSequenceFrames(async () => { throw Error('Unexpected Graph lookup'); });
  w._liveSequenceFrames.begin('old-sequence', [oldImage]);
  w._liveFrameDetails = { clear() {} }; w._nearbyDiscovery = { cancel() {} };
  w.clearGreenPulse = () => { events.push('clear-pulse'); if (w.currentGreenGraphic) w.currentGreenGraphic.removed = true; w.currentGreenGraphic = null; };
  w.clearConeGraphics = () => { events.push('clear-cone'); if (w.currentCone) view.graphics.remove(w.currentCone); w.currentCone = null; };
  w.drawPulsingPoint = (lon, lat, color, imageId = w.state.imageId) => {
    const marker = { attributes: { image_id: String(imageId) }, lon, lat, removed: false };
    events.push('pulse:' + imageId); w.currentGreenGraphic = marker; return marker;
  };
  w.drawCone = () => { w.clearConeGraphics(); const cone = { __isCone: true, geometry: { type: 'polygon' } }; w.currentCone = cone; graphics.push(cone); events.push('cone'); };
  w.clearActiveSequenceLayer = () => events.push('clear-route-layer');
  w.coneLengths = w.coneSpreads = [1]; w.zoomStepIndex = 0;
  w.ensureImageViewer = () => {}; w.checkForTimeTravel = () => {}; w.updateNativeSequenceSelection = () => {};
  w.refreshSequenceMarkerWindow = w.showCachedSequencePreview = w.refreshLocalSequence = async () => {};
  w.updateProfileIndicator = () => {}; w.renderLiveSequenceLine = async () => events.push('route-ready');
  w.stateCallbacks = [];
  w.setState = (patch, callback) => { const next = typeof patch === 'function' ? patch(w.state) : patch; if (next) Object.assign(w.state, next); const work = callback?.(); if (work?.then) w.stateCallbacks.push(work); };
  w.mapillaryViewer = { moveTo: id => { const wait = deferred(); moves.set(id, wait); return wait.promise; }, getBearing: async () => 37, remove: () => events.push('viewer-remove') };
  w.viewerContainer = { current: {} }; w._pointCloudAcquisition = { cancel() {}, result: null };
  w.applyCustomCameraAngle = w.setupDirectionHover = w.createMinimap = w.destroyMinimap = w.log = () => {};
  w.drawPulsingPoint(oldImage.lon, oldImage.lat, [], oldImage.id);
  return { w, events, moves, graphics, view };
}

for (const type of ['2d', '3d']) for (const cached of [false, true]) test(type + ': switching sequences preserves the confirmed image pulse through ' + (cached ? 'cached route adoption' : 'fresh context preparation'), async () => {
  const { w, moves, graphics } = setup(type);
  const retiredPoint = { __isSequenceOverlay: true, attributes: { sequenceId: 'old-sequence' }, geometry: { type: 'point' }, symbol: { type: 'simple-marker' } };
  const unrelatedPoint = { __isSequenceOverlay: true, attributes: { sequenceId: 'other-sequence' }, geometry: { type: 'point' }, symbol: { type: 'simple-marker' } };
  graphics.push(retiredPoint, unrelatedPoint);
  const route = [{ id: 'new-image', lon: 29.01, lat: 41.01 }, { id: 'next-image', lon: 29.02, lat: 41.02 }];
  if (cached) w.sequenceCoordsCache['new-sequence'] = route;
  // Capture the real background method's completion; loadSequence intentionally doesn't await it.
  const prepare = w.prepareDemandSequence.bind(w); let context;
  w.prepareDemandSequence = (...args) => context = prepare(...args);
  const opening = w.loadSequenceById('new-sequence', 'new-image'); await flush();
  const image = { id: 'new-image', sequenceId: 'new-sequence', originalLngLat: { lng: 29.01, lat: 41.01 } };
  // Normal Mapillary order: the image event establishes current tracking before moveTo resolves.
  const frame = await w._liveSequenceFrames.resolve(image);
  assert.equal(frame.id, 'new-image');
  w.drawPulsingPoint(frame.lon, frame.lat, [], frame.id); w.drawCone();
  const confirmedCone = w.currentCone;
  moves.get('new-image').resolve(image); await opening; await context;
  assert.equal(w.state.selectionError, undefined);
  assert(w.currentGreenGraphic, 'previous-sequence cleanup must not remove the new active pulse');
  assert.equal(w.currentGreenGraphic.attributes.image_id, 'new-image'); assert.equal(w.currentGreenGraphic.removed, false);
  assert.equal(w.currentCone, confirmedCone, 'previous-sequence cleanup must not remove the confirmed image cone');
  assert(graphics.includes(confirmedCone)); assert(!graphics.includes(retiredPoint)); assert(graphics.includes(unrelatedPoint));
  assert.equal(w._lastSuccessfulSelection.imageId, 'new-image');
  if (cached) { assert.equal(w.state.sequenceImages, route); assert.equal(w._liveSequenceFrames.complete, route); }
  else assert.equal(w._localSequenceDeferredRequest, null);
});

test('explicit active-sequence cleanup still removes its pulse and cone', () => {
  const { w, graphics } = setup(); w.drawCone(); const pulse = w.currentGreenGraphic, cone = w.currentCone;
  w.clearActiveSequenceGraphics('old-sequence');
  assert.equal(w.currentGreenGraphic, null); assert.equal(pulse.removed, true);
  assert.equal(w.currentCone, null); assert(!graphics.includes(cone));
});

for (const entering of [true, false]) test('fullscreen ' + (entering ? 'entry' : 'exit') + ' restores the pulse after actual event binding clears stale graphics', async () => {
  const { w } = setup('3d'); w.state.isFullscreen = !entering;
  const currentImageId = w.state.imageId;
  await w.toggleFullscreen(); await Promise.all(w.stateCallbacks); await flush();
  assert.equal(w.state.isFullscreen, entering); assert(w.mapillaryViewer instanceof Viewer);
  assert.deepEqual([...w.mapillaryViewer.events.keys()], ['load', 'bearing', 'image']);
  assert(w.currentGreenGraphic, 'binding the recreated viewer must not erase its restored active pulse');
  assert.equal(w.currentGreenGraphic.attributes.image_id, currentImageId); assert.equal(w.currentGreenGraphic.removed, false);
  assert(w.currentCone, 'binding the recreated viewer must not erase its restored cone');
});
