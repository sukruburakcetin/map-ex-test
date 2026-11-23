/** Exercise the production SVG owner in Chromium with controlled map projections. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const { chromium } = require(process.env.MAPILLARY_PLAYWRIGHT || 'playwright-core');

const folder = path.join(__dirname, '../src/features/map-graphics');
const compile = name => ts.transpileModule(fs.readFileSync(path.join(folder, name + '.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      requests.push(route.request().url());
      return route.abort();
    });
    await page.setContent('<div id="anchor" style="position:relative;width:60px;height:60px"></div>');
    const result = await page.evaluate(({ coneCode, hoverCode }) => {
      const cone = {};
      new Function('exports', 'require', coneCode)(cone, name => {
        if (name === './SelectionPulse') return { renderedGroundPoint: () => { throw Error('Unexpected ground lookup'); } };
        throw Error('Unexpected dependency: ' + name);
      });
      const hover = {};
      new Function('exports', 'require', hoverCode)(hover, name => {
        if (name === './ScreenDirectionCone') return cone;
        throw Error('Unexpected dependency: ' + name);
      });
      const anchor = document.getElementById('anchor');
      const owner = new hover.HoverBearingSector(properties => properties, () => document.createElement('div'));
      const geometry = { longitude: 0, latitude: 0 };
      const pixel = { x: 100, y: 100 };
      let projections = 0;
      let liveBearing;
      const view = {
        type: '2d', zoom: 13.99, rotation: 0, stationary: true, updating: false,
        toScreen(point) {
          projections++;
          const radians = view.rotation * Math.PI / 180;
          const east = point.longitude * 1000, north = point.latitude * 1000;
          return {
            x: 100 + east * Math.cos(radians) + north * Math.sin(radians),
            y: 100 + east * Math.sin(radians) - north * Math.cos(radians),
          };
        },
      };
      const results = {};
      const visibility = () => getComputedStyle(anchor.firstElementChild).display;
      const angle = () => {
        const { a, b } = anchor.querySelector('g').transform.baseVal.consolidate().matrix;
        return Math.round(((Math.atan2(b, a) * 180 / Math.PI) + 360) % 360) % 360;
      };
      owner.show(anchor, 90, 14, () => liveBearing);
      owner.update(view, geometry, pixel, 0);
      results.overview = visibility();
      results.overviewProjections = projections;
      view.zoom = 14;
      owner.update(view, geometry, pixel, 10);
      const svg = anchor.querySelector('svg');
      const fan = svg.querySelector('path').getAttribute('d');
      results.close = visibility();
      results.capture = angle();
      results.arc = fan.includes(' A24 24 ');
      liveBearing = 0;
      owner.update(view, geometry, pixel, 50);
      results.open = angle();
      view.rotation = 45;
      owner.update(view, geometry, pixel, 90);
      results.rotated = angle();
      liveBearing = undefined;
      owner.update(view, geometry, pixel, 130);
      results.fallback = angle();
      results.reused = anchor.querySelector('svg') === svg;
      owner.update(view, geometry, pixel, 170);
      results.cachedProjections = projections;
      view.zoom = 13.99;
      owner.update(view, geometry, pixel, 180);
      results.zoomedOut = visibility();
      owner.show(anchor, 90);
      owner.update(view, geometry, pixel, 190);
      results.regularConeMatches = anchor.querySelector('path').getAttribute('d') === fan;
      results.regularVisible = visibility();
      owner.clear();
      results.remainingChildren = anchor.childElementCount;
      return results;
    }, { coneCode: compile('ScreenDirectionCone'), hoverCode: compile('HoverBearingSector') });
    assert.deepEqual(result, {
      overview: 'none', overviewProjections: 0, close: 'block', capture: 90, arc: true,
      open: 0, rotated: 45, fallback: 135, reused: true, cachedProjections: 4,
      zoomedOut: 'none', regularConeMatches: true, regularVisible: 'block', remainingChildren: 0,
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    console.log('Panorama hover cone passed zoom, heading and rotation checks with zero browser requests.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
