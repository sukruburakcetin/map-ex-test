const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '..');
function compile(source) {
  const result = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }, reportDiagnostics: true });
  assert.equal(result.diagnostics.filter(d => d.category === 1).length, 0);
  return result.outputText;
}
const constants = { exports: {} };
new Function('module', 'exports', compile(fs.readFileSync(root + '/src/utils/constants.ts', 'utf8')))(constants, constants.exports);
const ownerModule = { exports: {} };
new Function('require', 'module', 'exports', compile(fs.readFileSync(root + '/src/features/navigation/ViewZoomBindings.ts', 'utf8')))(() => constants.exports, ownerModule, ownerModule.exports);
const { ViewZoomBindings } = ownerModule.exports;
const baseline = JSON.parse(fs.readFileSync(__dirname + '/fixtures/viewZoomBindings.baseline.json'));
const source = fs.readFileSync(root + '/src/runtime/widget.tsx', 'utf8');
const sf = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const widget = sf.statements.find(n => ts.isClassDeclaration(n) && n.name?.text === 'Widget');
const field = widget.members.find(n => n.name?.getText(sf) === '_viewZoomBindings').getText(sf);
const oldClass = new Function('debounceUtil', 'ZOOM', compile('return class Harness {' + baseline.defaults + '\nbind(view){' + baseline.bind + '}\nclear(){' + baseline.clear + '}}'));
const newClass = new Function('ViewZoomBindings', 'debounceUtil', compile('return class Harness {' + field + '\nbind(view){this._viewZoomBindings.bind(view);}\nclear(){this._viewZoomBindings.clear();}}'));
function fixture(previous, { cancel = true, quality = false } = {}) {
  const events = [], debounces = [], watches = [];
  function debounce(callback, delay) {
    const id = debounces.length; let pending = false;
    const fn = () => { pending = true; events.push(['schedule', id]); };
    if (cancel) fn.cancel = () => { pending = false; events.push(['cancel', id]); };
    fn.flush = (force = false) => { if (!pending && !force) return; pending = false; events.push(['fire', id]); callback(); };
    debounces.push(fn); events.push(['debounce', id, delay]); return fn;
  }
  const Type = previous ? oldClass(debounce, constants.exports.ZOOM) : newClass(ViewZoomBindings, debounce);
  const w = new Type();
  Object.assign(w, {
    state: { jimuMapView: null, imageId: 'A', qualityViewActive: quality }, _isFlyInActive: false,
    setState(patch) { events.push(['state', patch]); Object.assign(this.state, patch); },
    updateUrlWithCurrentImage(id) { events.push(['url', id]); },
    refreshActivePulseAnchor(view) { events.push(['pulse', view.name]); },
    refreshSequenceMarkerWindow() { events.push(['markers']); return Promise.resolve(); },
    requestConeRedraw(view) { events.push(['cone', view.name]); },
    showZoomWarning(message, duration) { events.push(['warning', message, duration]); },
    clearZoomWarning() { events.push(['clear-warning']); },
  });
  function view(name, type = '2d', zoom = 15) {
    return { name, type, zoom, map: {}, destroyed: false, watch(property, callback) {
      const id = watches.length, record = { property, callback, view: name, removed: false };
      watches.push(record); events.push(['watch', name, property]);
      return { remove() { record.removed = true; events.push(['remove', name, property, id]); } };
    } };
  }
  function bind(v) { w.state.jimuMapView = { view: v }; w.bind(v); }
  function emit(v, property, value) { const record = watches.findLast(r => r.view === v.name && r.property === property); assert(record); record.callback(value); }
  return { w, events, debounces, watches, view, bind, emit };
}
async function compare(actions, options) {
  const results = [];
  for (const previous of [true, false]) {
    const f = fixture(previous, options); await actions(f);
    results.push({ events: f.events, zoom: f.w.state.currentZoom, watches: f.watches.map(({ callback, ...rest }) => rest) });
  }
  assert.deepEqual(results[1], results[0]); return results[1];
}
for (const type of ['2d', '3d']) {
  test(`preserves ${type} initial registration and zoom publication`, () => compare(f => f.bind(f.view('one', type))));
  test(`preserves ${type} zoom effects and delayed URL`, () => compare(f => { const v=f.view('one',type); f.bind(v); f.emit(v,'zoom',18); f.debounces[0].flush(); }));
  test(`replaces ${type} bindings and cancels pending writes`, () => compare(f => { const v=f.view('one',type); f.bind(v); f.emit(v,'zoom',17); f.bind(f.view('two','3d')); f.debounces[0].flush(); }));
}
for (const zoom of [0, constants.exports.ZOOM.TILE_FETCH - 1, constants.exports.ZOOM.TILE_FETCH, 24]) {
  test(`preserves quality warning boundary at zoom ${zoom}`, () => compare(f => { const v=f.view('one'); f.bind(v); f.emit(v,'zoom',zoom); }, {quality:true}));
}
for (const reason of ['different view','missing map','destroyed view']) {
  const invalidate = (f,v) => { if(reason==='different view') f.w.state.jimuMapView={view:f.view('other')}; else if(reason==='missing map') v.map=null; else v.destroyed=true; };
  test(`ignores late zoom from ${reason}`, () => compare(f => {const v=f.view('one');f.bind(v);invalidate(f,v);f.emit(v,'zoom',19);}));
  test(`ignores queued URL from ${reason}`, () => compare(f => {const v=f.view('one');f.bind(v);f.emit(v,'zoom',19);invalidate(f,v);f.debounces[0].flush(true);}));
}
for (const id of ['latest',null,undefined,'']) {
  test(`reads current image ID ${String(id)} at URL execution`, () => compare(f => {const v=f.view('one');f.bind(v);f.emit(v,'zoom',19);f.w.state.imageId=id;f.debounces[0].flush();}));
}
test('fly-in suppresses only URL writes', () => compare(f => {const v=f.view('one');f.bind(v);f.w._isFlyInActive=true;f.emit(v,'zoom',19);f.debounces[0].flush();f.w._isFlyInActive=false;f.emit(v,'zoom',20);f.debounces[0].flush();}));
test('clear removes both watchers and cancels pending write', () => compare(f => {const v=f.view('one','3d');f.bind(v);f.emit(v,'zoom',19);f.w.clear();f.debounces[0].flush();f.w.clear();}));
test('clear before first bind remains safe', () => compare(f => {f.w.clear();f.w.clear();f.bind(f.view('one'));}));
test('debouncer without cancel remains supported', () => compare(f => {const v=f.view('one');f.bind(v);f.emit(v,'zoom',19);f.w.clear();f.debounces[0].flush();},{cancel:false}));
test('retains existing camera callback behavior after replacement', () => compare(f => {const v=f.view('one','3d');f.bind(v);f.bind(f.view('two'));f.emit(v,'camera',{});}));
test('quality activation is read on each zoom', () => compare(f => {const v=f.view('one');f.bind(v);f.emit(v,'zoom',1);f.w.state.qualityViewActive=true;f.emit(v,'zoom',1);f.w.state.qualityViewActive=false;f.emit(v,'zoom',20);}));
test('rebinding the same view follows replacement lifecycle', () => compare(f => {const v=f.view('one','3d');f.bind(v);f.bind(v);f.emit(v,'zoom',20);f.emit(v,'camera',{});}));
