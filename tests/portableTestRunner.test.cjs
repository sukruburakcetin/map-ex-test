const test = require('node:test'), assert = require('node:assert/strict');
const { summarize, resolveEnvironment } = require('../tools/check-portable-tests.cjs');
test('portable report preserves a failing suite and categorizes errors without accepting them', () => {
  const report = summarize("not ok 1 - broken harness\n  error: 'require is not defined'\n  name: ReferenceError\nnot ok 2 - behavior\n  error: expected value\n  code: ERR_ASSERTION\n# tests 3\n# pass 1\n# fail 2\n# skipped 0\n", 1);
  assert(report.failures[0].diagnostic.includes('require is not defined'));
  assert.equal(report.failed, 2); assert.equal(report.exitCode, 1); assert.equal(report.passed, 1);
  assert.deepEqual(report.failures.map(f => f.category), ['execution-error', 'assertion']);
});
test('missing TAP summary is not interpreted as a passing test run', () => {
  const report = summarize('', 0); assert.equal(report.tests, null); assert.equal(report.failed, null);
});
test('test preflight refuses a missing or non-host client', () => {
  assert.throws(() => resolveEnvironment('/path/that/does/not/exist'), /ENOENT/);
});
