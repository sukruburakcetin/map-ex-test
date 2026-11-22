const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/features/coverage/CoverageGuide.tsx'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  fileName: 'CoverageGuide.tsx',
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
});
const jsx = (type, props, ...children) => ({ type, props: props || {}, children });
const dependencies = {
  'jimu-core': { React: { Fragment: 'fragment' }, jsx },
  '../../i18n/WidgetLocale': { OwnedMessage: 'OwnedMessage' },
  '../../utils/mapillary-image-base64': { MAPILLARY_IMAGE: 'logo-fixture' },
  '../../utils/styles': { coverageNoticeStyles: {} },
};
const stylesSource = fs.readFileSync(path.join(__dirname, '../src/styles/coverageGuide.ts'), 'utf8');
const styles = ts.transpileModule(stylesSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const guideStyles = {};
new Function('exports', 'require', styles)(guideStyles, name => {
  assert.equal(name, '../utils/styles');
  return dependencies['../../utils/styles'];
});
dependencies['../../styles/coverageGuide'] = guideStyles;
const bindings = {};
new Function('exports', 'require', outputText)(bindings, name => {
  assert.ok(Object.hasOwn(dependencies, name), name);
  return dependencies[name];
});

function nodes(root) {
  if (Array.isArray(root)) return root.flatMap(nodes);
  return root?.type ? [root, ...nodes(root.children)] : [];
}

function render(overrides) {
  const calls = [];
  const record = name => (...args) => calls.push([name, ...args]);
  const props = {
    t: key => key, visible: true, status: { text: 'Coverage', busy: true, action: 'tilt', label: 'Reduce tilt' },
    settings: ['Creator', 'Panoramas'], mouseHint: 'Click', touchHint: 'Tap', helpOpen: true, helpId: 'instance-coverage-help',
    helpButtonRef: { current: null }, helpPanelRef: () => {}, travelMethodFiltered: true, turboActive: true,
    warningVisible: true, warningMessage: 'Warning', noticesHidden: false, selectionError: 'Image error', canRetry: true,
    onAction: record('action'), onToggleHelp: record('toggle'), onCloseHelp: record('close'), onHideNotices: record('hide'),
    onRetryImage: record('retry'), onDismissImageError: record('dismiss'), ...overrides,
  };
  const tree = nodes(bindings.CoverageGuide(props));
  return { props, tree, calls, find: (key, value) => tree.find(node => node.props[key] === value) };
}

test('coverage guide retains live status, input hints, focus bindings and action dispatch', () => {
  const { props, tree, calls, find } = render();
  const status = find('role', 'status');
  assert.equal(status.props['aria-live'], 'polite');
  assert.equal(status.props['aria-atomic'], 'true');
  assert.ok(nodes(status).some(node => node.type === 'animateTransform'));
  assert.deepEqual(find('className', 'mly-coverage-mouse-hint').children, ['Click']);
  assert.deepEqual(find('className', 'mly-coverage-touch-hint').children, ['Tap']);
  assert.equal(find('className', 'mly-coverage-filter-hint').props.title, 'Creator · Panoramas');

  const help = find('className', 'mly-coverage-help-button');
  const dialog = find('role', 'dialog');
  assert.equal(help.props['aria-controls'], dialog.props.id);
  assert.equal(help.props['aria-expanded'], true);
  assert.equal(help.props.ref, props.helpButtonRef);
  assert.equal(dialog.props.ref, props.helpPanelRef);
  help.props.onClick();
  dialog.props.onKeyDown({ key: 'Enter' });
  dialog.props.onKeyDown({ key: 'Escape' });
  find('aria-label', 'appCloseCoverageHelp').props.onClick();
  const checkbox = find('type', 'checkbox');
  assert.equal(checkbox.props.checked, false);
  checkbox.props.onChange({ currentTarget: { checked: false } });
  checkbox.props.onChange({ currentTarget: { checked: true } });
  tree.find(node => node.type === 'button' && node.children.includes('Reduce tilt')).props.onClick();

  const alert = find('role', 'alert');
  assert.ok(nodes(alert).some(node => node.type === 'OwnedMessage' && node.props.source === 'Image error'));
  nodes(alert).find(node => node.type === 'button' && node.children.includes('appRetryImage')).props.onClick();
  find('aria-label', 'appDismissImageError').props.onClick();
  assert.deepEqual(calls, [['toggle'], ['close'], ['close'], ['hide'], ['action', 'tilt'], ['retry'], ['dismiss']]);
});

test('image error can render independently of the guide, with retry gated by availability', () => {
  const { tree, find } = render({ visible: false, canRetry: false });
  assert.equal(find('role', 'status'), undefined);
  assert.equal(find('role', 'dialog'), undefined);
  assert.ok(find('role', 'alert'));
  assert.equal(tree.filter(node => node.type === 'button').length, 1);
  const closed = render({ helpOpen: false, selectionError: undefined });
  assert.equal(closed.find('role', 'dialog'), undefined);
  assert.equal(closed.find('role', 'alert'), undefined);
  assert.equal(closed.find('className', 'mly-coverage-help-button').props['aria-expanded'], false);
});
