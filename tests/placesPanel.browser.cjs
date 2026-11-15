/** Current Places panel at narrow widths: real controls/controller, controlled API responses. */
const assert = require('node:assert/strict');
const { bundle, launch, addReact } = require('./helpers/placesBrowser.cjs');
(async () => {
  const modules = bundle(['components/PlacesPanel.tsx', 'features/places/PlacesController.ts']);
  const browser = await launch();
  let checks = 0;
  try {
    for (const width of [240, 393]) {
      const page = await browser.newPage({ viewport: { width, height: 760 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setContent('<div id="root" style="position:relative;width:100%;height:700px;background:#172920;color:white"></div>');
      await addReact(page);
      await page.evaluate(definitions => {
        const cache = {};
        const labels = { uiNearbyPlaces: 'Nearby places', uiPoiMinimizePanel: 'Minimize places', uiPoiRestorePanel: 'Restore places', uiPoiFilterPlaces: 'Filter places', uiPoiAutoShort: 'Auto', uiPoiSearchAreaPlaces: 'Find a place in this area', uiPoiResultRange: 'Places {start}–{end}', uiPoiRestoreCount: 'Places · {count}' };
        const locale = { useWidgetLocale: () => ({ formatLocale: 'en-US', owned: value => value, t: (key, args = {}) => (labels[key] || key).replace(/\{(\w+)\}/g, (_, token) => args[token] ?? token) }) };
        function load(name) {
          if (cache[name]) return cache[name];
          const module = { exports: {} }; cache[name] = module.exports;
          const definition = definitions[name];
          new Function('require', 'module', 'exports', definition.code)(id => id === 'jimu-core' ? { React, jsx: React.createElement } : id.endsWith('WidgetLocale') ? locale : load(definition.dependencies[id]), module, module.exports);
          return module.exports;
        }
        const Panel = load('components/PlacesPanel.tsx').PlacesPanel;
        const Controller = load('features/places/PlacesController.ts').PlacesController;
        window.root = ReactDOM.createRoot(document.getElementById('root'));
        window.requests = []; window.busy = false;
        window.viewState = { token: {}, bbox: [0, 0, 1, 1], zoom: 16, stationary: true };
        const source = Array.from({ length: 12 }, (_, index) => ({ attributes: { gers_id: 'p' + index, place_name: 'Place ' + index, category: 'school', icon_group: 'education', confidence: .8 }, geometry: { x: .1 + index * .01, y: .5 } }));
        let places = [], status = { kind: 'off', count: 0 }, auto = false;
        const render = () => root.render(React.createElement(Panel, {
          places, status, origin: {lon: 0, lat: .5, kind: 'map'}, autoUpdate: auto, tileFamily: 'all', tileQuality: { minimum: null, hideClosed: false },
          onTileFamily() {}, onTileQuality() {}, onSelect: id => { window.selected = id; },
          onHover() {}, onShowOnMap: id => { window.located = id; },
          onAreaSearch: text => owner.setSearchText(text), onSearch: () => owner.searchArea(),
          onAutoUpdate: value => { auto = value; render(); owner.setAutoUpdate(value); },
          onRetry: () => owner.retry(), onClose: () => { window.closed = true; }
        }));
        window.owner = new Controller({
          manualSearch: true, paged: true, hybridSearch: false, view: () => viewState, busy: () => busy,
          query: async (bbox, signal, origin, offset, text) => { requests.push({ bbox, offset, text }); return { features: source.filter(row => !text || row.attributes.place_name === text), limited: false }; },
          display: rows => { places = rows; render(); }, status: value => { status = value; window.latestStatus = value; render(); },
          visible() {}, clear() {}, timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),
          idle: work => setTimeout(work, 0), cancelIdle: handle => clearTimeout(handle), now: () => Date.now()
        });
        render(); owner.setEnabled(true);
      }, modules);
      const search = page.getByRole('button', { name: 'Search this area', exact: true });
      await search.waitFor();
      assert.equal(await page.evaluate(() => requests.length), 0); checks++;
      await search.click();
      await page.waitForFunction(() => latestStatus.kind === 'ready');
      assert.equal(await page.locator('[data-place-id]').count(), 4); checks++;
      await page.locator('[data-place-id="p1"]').click();
      assert.equal(await page.evaluate(() => selected), 'p1'); checks++;
      await page.getByRole('button', { name: /uiShowOnMap: Place 1/ }).click();
      assert.equal(await page.evaluate(() => located), 'p1'); checks++;
      await page.getByRole('button', { name: 'uiNextPlaces' }).click();
      assert.equal(await page.locator('[data-place-id]').first().getAttribute('data-place-id'), 'p4'); checks++;
      const field = page.getByRole('searchbox', { name: 'Find a place in this area' });
      await field.fill('Place 11');
      assert.equal(await page.evaluate(() => requests.length), 1); checks++;
      await field.press('Enter');
      await page.waitForFunction(() => requests.length === 2 && latestStatus.kind === 'ready');
      assert.equal(await page.locator('[data-place-id]').count(), 1); checks++;
      await page.getByRole('button', { name: 'Minimize places' }).click();
      assert(await page.getByRole('button', { name: 'Restore places' }).isVisible());
      assert.equal(await page.evaluate(() => !!window.closed), false); checks++;
      await page.getByRole('button', { name: 'Restore places' }).click();
      assert.equal(await field.inputValue(), 'Place 11'); checks++;
      await page.evaluate(() => { viewState.stationary = false; owner.sync(); viewState.bbox = [.3, 0, 1.3, 1]; viewState.stationary = true; owner.sync(); });
      await page.waitForTimeout(750);
      assert.equal(await page.evaluate(() => requests.length), 2); checks++;
      await page.locator('.mly-place-filters > summary').click();
      const toggle = page.getByRole('switch', { name: 'Auto-update places' });
      await toggle.check();
      await page.waitForFunction(() => requests.length === 3 && latestStatus.kind === 'ready'); checks++;
      await toggle.uncheck();
      await page.evaluate(() => { viewState.stationary = false; owner.sync(); viewState.bbox = [.6, 0, 1.6, 1]; viewState.stationary = true; owner.sync(); });
      await page.waitForTimeout(750);
      assert.equal(await page.evaluate(() => requests.length), 3); checks++;
      await search.focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => requests.length === 4 && latestStatus.kind === 'ready'); checks++;
      assert.equal(await page.locator('.mly-places-scroll').evaluate(element => element.scrollWidth <= element.clientWidth), true); checks++;
      await page.evaluate(() => owner.dispose());
      assert.deepEqual(errors, []); checks++;
      await page.close();
    }
    console.log(`${checks} Places panel Chromium checks passed at 240px and 393px.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
