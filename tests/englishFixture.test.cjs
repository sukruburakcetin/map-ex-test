const test = require('node:test'), assert = require('node:assert/strict');
const { englishFunction, bindEnglish, feedbackTrace, localizeJsx, OwnedMessage, OwnedNumber } = require('./helpers/englishFixture.cjs');
const jsx = localizeJsx((tag, props, ...children) => ({ tag, props, children }));
test('fixture uses actual English catalog and wrapper interpolation/number formatting', () => {
  const w = bindEnglish({}); assert.equal(typeof w._t('appLoadingFeatures'), 'string'); assert.throws(() => w._t('not-a-message-key'));
  assert.equal(jsx(OwnedMessage, { source: '{count} captures', values: { count: 1234 } }), '1,234 captures');
  assert.equal(jsx(OwnedNumber, { value: 1234 }), '1,234');
});
test('feedback comparison treats text fragments/wrappers as rendered text, preserving markup and props', () => {
  const a = [['toast', jsx('b', { style: { color: 'red' } }, '1,234 points'), 3000]];
  const b = [['toast', jsx('b', { style: { color: 'red' } }, ' ', jsx(OwnedNumber, { value: 1234 }), '  ', jsx(OwnedMessage, { source: 'points' }), ' '), 3000]];
  assert.deepEqual(feedbackTrace(a), feedbackTrace(b));
  for (const changed of [ [['toast', jsx('b', { style: { color: 'blue' } }, '1,234 points'), 3000]], [['toast', jsx('b', { style: { color: 'red' } }, '1,235 points'), 3000]], [['toast', a[0][1], 3001]], [['toast', jsx('i', { style: { color: 'red' } }, '1,234 points'), 3000]] ]) assert.notDeepEqual(feedbackTrace(a), feedbackTrace(changed));
});
test('non-toast event order, original object identity and preformatted whitespace are untouched', () => {
  const result = { points: [1, 2] }, event = ['retain', result], trace = [event, ['state', { loading: true }]];
  assert.equal(feedbackTrace(trace)[0], event); assert.equal(feedbackTrace(trace)[0][1], result);
  assert.notDeepEqual(feedbackTrace([['toast', jsx('pre', {}, 'a  b')]]), feedbackTrace([['toast', jsx('pre', {}, 'a b')]]));
  assert.notDeepEqual(feedbackTrace(trace), feedbackTrace([...trace].reverse()));
});
test('snippet bindings forward unrelated imports and leave unknown components recorded', () => {
  const evaluate = englishFunction('require', 'return [require("x"), require("../i18n/WidgetLocale").OwnedNumber({value: 1234})];');
  assert.deepEqual(evaluate(id => { assert.equal(id, 'x'); return 7; }), [7, '1,234']);
  const Icon = () => { throw Error('must not execute an SDK/icon component'); };
  assert.equal(jsx(Icon, { size: 14 }).tag, Icon);
});
