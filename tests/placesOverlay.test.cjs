const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const compile = (source, fileName) => ts.transpileModule(source, {
  fileName,
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
}).outputText;

const deps = {
  'jimu-core': { jsx: (type, props) => ({ type, props }) },
  '../../components/PlacesPanel': { PlacesPanel: 'panel' },
  '../../components/SelectedPlaceCard': { SelectedPlaceCard: 'card' },
};
const bindings = {};
new Function('exports', 'require', compile(read('src/features/places/PlacesOverlay.tsx'), 'PlacesOverlay.tsx'))(
  bindings, name => {
    assert.ok(Object.hasOwn(deps, name), name);
    return deps[name];
  },
);
const { PlacesOverlay } = bindings;

test('Places selects the panel or compact card without resolving a hidden panel origin', () => {
  const selection = { place: { id: 'place-1' }, link: false };
  let reads = 0;
  const localOrigin = { lon: 10, lat: 15, kind: 'map' };
  const props = {
    panelOpen: false, selection, panel: { status: { kind: 'ready', count: 1 } },
    getLocalOrigin: () => { reads++; return localOrigin; }, tileLayer: null, tileFamily: 'education',
  };
  assert.equal(PlacesOverlay({ ...props, selection: undefined }), null);
  assert.deepEqual(PlacesOverlay(props), { type: 'card', props: selection });
  assert.equal(reads, 0);
  const panel = PlacesOverlay({ ...props, panelOpen: true });
  assert.equal(panel.type, 'panel');
  assert.equal(panel.props.selection, selection);
  assert.equal(panel.props.origin, localOrigin);
  assert.equal(panel.props.tileFamily, 'all');
  assert.equal(reads, 1);
});

test('Places preserves tile result origin and gates quality and family controls by source capability', () => {
  const sourceOrigin = { lon: 20, lat: 30, kind: 'image' };
  const search = () => {}, quality = () => {}, family = () => {};
  const panel = { status: { kind: 'ready', resultOrigin: sourceOrigin }, onAreaSearch: search, onTileQuality: quality, onTileFamily: family };
  const props = { panelOpen: true, panel, tileFamily: 'education', getLocalOrigin: () => assert.fail('Unexpected local origin') };
  const noFilter = PlacesOverlay({ ...props, tileLayer: { supportsFamilyFilter: false } }).props;
  assert.equal(noFilter.origin, sourceOrigin);
  assert.equal(noFilter.onAreaSearch, search);
  assert.equal(noFilter.onTileQuality, undefined);
  assert.equal(noFilter.onTileFamily, undefined);
  assert.equal(noFilter.tileFamily, 'all');
  const tileQuality = { minimum: 0.75, hideClosed: true };
  const filtered = PlacesOverlay({ ...props, tileLayer: { supportsFamilyFilter: true, quality: tileQuality } }).props;
  assert.equal(filtered.tileQuality, tileQuality);
  assert.equal(filtered.tileFamily, 'education');
  assert.equal(filtered.onTileQuality, quality);
  assert.equal(filtered.onTileFamily, family);
  assert.equal(PlacesOverlay({ ...props, panel: { status: {} }, tileLayer: {} }).props.origin, null);
});

test('shared card actions retain live widget selection and controller dispatch', () => {
  const widget = ts.createSourceFile('widget.tsx', read('src/runtime/widget.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const method = widget.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'Widget')
    .members.find(node => node.name?.getText(widget) === 'getPlacesOverlaySelection');
  const Widget = new Function(compile('class Widget {' + method.getText(widget) + '}\nreturn Widget;', 'widget.ts'))();
  const w = new Widget();
  const trace = [];
  w.props = { config: { sharedFieldNotesEnabled: true, sharedFieldNotesUrl: '/notes' } };
  w.state = { selectedPlace: { id: 'original' }, placesShowLink: false, imageId: 'frame' };
  w.setState = patch => trace.push(['state', patch]);
  const selection = w.getPlacesOverlaySelection();
  assert.equal(selection.place.id, 'original');
  assert.equal(selection.enterpriseEnabled, true);
  assert.equal(selection.currentImageId, 'frame');
  w._places = { selection: { setLink: value => trace.push(['link', value]) },
    open: (...args) => trace.push(['open', ...args]), clearSelection: () => trace.push(['clear']) };
  w.state.selectedPlace = { id: 'current' };
  selection.onLink(true);
  selection.onImagery();
  selection.onDetails();
  selection.onClear();
  assert.deepEqual(trace, [
    ['state', { placesShowLink: true }], ['link', true],
    ['open', [], 'current', true, 'card'], ['open', [], 'current', false, 'card'], ['clear'],
  ]);
  w.state.selectedPlace = null;
  assert.equal(w.getPlacesOverlaySelection(), undefined);
});
