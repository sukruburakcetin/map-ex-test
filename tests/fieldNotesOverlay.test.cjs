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
const bindings = {};
const dependencies = {
  'jimu-core': { React: { Fragment: 'fragment' }, jsx: (type, props, ...children) => ({ type, props, children }) },
  '../../components/FieldNotesPanel': { FieldNotesPanel: 'notes' },
  '../detections/DetectionNoteAction': { DetectionNoteAction: 'detection' },
};
new Function('exports', 'require', compile(read('src/features/field-notes/FieldNotesOverlay.tsx'), 'FieldNotesOverlay.tsx'))(
  bindings, name => {
    assert.ok(Object.hasOwn(dependencies, name), name);
    return dependencies[name];
  },
);

test('notes overlay keeps the panel mounted and keys the prompt to the active detection', () => {
  const selection = { imageId: 'frame', detectionId: 'object' };
  const preview = () => {}, choose = () => {}, pending = {};
  const panelActions = { onLoadDetectionPreview: preview };
  const detectionActions = { onChoose: choose };
  const state = { detectionsActive: true, viewerDetectionNote: selection, detectionNoteCapturing: true,
    detectionNotePicking: true, nearbyStripOpen: true, imageId: 'frame', pendingFieldNote: pending };
  const render = () => bindings.FieldNotesOverlay({ state, settings: {}, panelActions, detectionActions }).children;
  const [prompt, notes] = render();
  assert.equal(prompt.type, 'detection');
  assert.equal(prompt.props.key, 'frame:object');
  assert.equal(prompt.props.selection, selection);
  assert.equal(prompt.props.onLoadPreview, preview);
  assert.equal(prompt.props.onChoose, choose);
  assert.equal(prompt.props.busy && prompt.props.picking && prompt.props.hasTray, true);
  assert.equal(notes.type, 'notes');
  assert.equal(notes.props.pendingNote, pending);
  assert.equal(notes.props.currentImageAvailable, true);
  state.detectionsActive = false;
  state.imageId = null;
  const [hidden, retained] = render();
  assert.equal(hidden, false);
  assert.equal(retained.type, 'notes');
  assert.equal(retained.props.currentImageAvailable, false);
});

test('shared notes keep read-only availability distinct from sharing and detection publishing', () => {
  const categories = Object.freeze(['inspection']);
  const view = {};
  const state = { detectionsActive: true, viewerDetectionNote: { imageId: 'A', detectionId: 'B' },
    jimuMapView: { view }, sharedNotesMessage: 'Available' };
  const render = settings => bindings.FieldNotesOverlay({ state, settings, panelActions: {}, detectionActions: {} }).children;
  const [prompt, notes] = render({ sharedFieldNotesEnabled: true, sharedFieldNotesReadUrl: '/read', fieldNoteCategories: categories });
  assert.equal(notes.props.enterpriseEnabled, true);
  assert.equal(notes.props.enterpriseContext, view);
  assert.equal(notes.props.enterpriseLayerUrl, '/read');
  assert.equal(notes.props.enterpriseWriteUrl, '');
  assert.equal(notes.props.sharedMessage, 'Available');
  assert.equal(notes.props.sharingEnabled, false);
  assert.equal(prompt.props.enterpriseEnabled, false);
  assert.deepEqual(notes.props.categories, categories);
  assert.notEqual(notes.props.categories, categories);
  const [writePrompt, writeNotes] = render({ sharedFieldNotesEnabled: true, sharedFieldNotesUrl: '/write' });
  assert.equal(writeNotes.props.enterpriseLayerUrl, '/write');
  assert.equal(writeNotes.props.enterpriseWriteUrl, '/write');
  assert.equal(writeNotes.props.sharingEnabled, true);
  assert.equal(writePrompt.props.enterpriseEnabled, true);
  const [disabledPrompt, disabledNotes] = render({ sharedFieldNotesUrl: '/write' });
  assert.equal(disabledNotes.props.sharedMessage, undefined);
  assert.equal(disabledPrompt.props.enterpriseEnabled, false);
});

test('clearing a workspace draft releases only an unapplied marker before clearing state', () => {
  const widget = ts.createSourceFile('widget.tsx', read('src/runtime/widget.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const member = widget.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'Widget')
    .members.find(node => node.name?.getText(widget) === 'clearDetectionWorkspaceDraft');
  const Widget = new Function(compile('class Widget {' + member.getText(widget) + '}\nreturn Widget;', 'widget.ts'))();
  const w = new Widget();
  const calls = [];
  w.state = { detectionWorkspaceDraft: { requestId: 'current' } };
  w.finishDetectionWorkspaceMarker = id => calls.push(id);
  w.setState = patch => { calls.push(patch); Object.assign(w.state, patch); };
  w.clearDetectionWorkspaceDraft(false);
  assert.deepEqual(calls, ['current', { detectionWorkspaceDraft: null }]);
  calls.length = 0;
  w.state.detectionWorkspaceDraft = { requestId: 'applied' };
  w.clearDetectionWorkspaceDraft(true);
  assert.deepEqual(calls, [{ detectionWorkspaceDraft: null }]);
});
