const assert = require('node:assert/strict');
const test = require('node:test');
const loadViewerResize = require('./helpers/viewerResizeSource.cjs');

test('browser fullscreen and window resize preserve their separate camera and error policies', () => {
  const events = [];
  const owner = loadViewerResize({ console: { warn: message => events.push(message) } });
  const viewer = { resize() { assert.equal(this, viewer); events.push('resize'); } };
  const camera = () => events.push('camera');
  owner.resizeForBrowserFullscreen(viewer);
  owner.resizeForWindow(viewer, camera);
  owner.resizeForWindow(null, camera);
  owner.resizeForWindow({}, camera);
  viewer.resize = () => { throw Error('viewer destroyed'); };
  owner.resizeForWindow(viewer, camera);
  owner.resizeForBrowserFullscreen(viewer);
  assert.deepEqual(events, ['resize', 'resize', 'camera', 'Viewer resize suppressed during fullscreen toggle']);
});
