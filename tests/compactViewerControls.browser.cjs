const { readFileSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const { chromium } = require(process.env.MAPILLARY_PLAYWRIGHT || 'playwright-core');

function load(file) {
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const m = { exports: {} };
  new Function('module', 'exports', 'require', outputText)(
    m, m.exports, name => load(resolve(dirname(file), name + '.ts')),
  );
  return m.exports;
}

async function main() {
  const { controlBarCompactCss, utilityDockCss, viewerCompactPlaybackCss } =
    load(resolve(__dirname, '../src/styles/controlPanels.ts'));
  const { viewerWorkspace } = load(resolve(__dirname, '../src/styles/widgetLayout.ts'));
  const { infoDetailsCss, infoPanelResponsiveCss, imageInformationCss, infoPanelShellStyle, infoControlsViewportStyle } =
    load(resolve(__dirname, '../src/styles/infoBox.ts'));
  const { overrideStyles } = load(resolve(__dirname, '../src/utils/styles.ts'));
  const sdkCss = readFileSync(require.resolve('mapillary-js/dist/mapillary.css'), 'utf8');
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    const railButtons = '<button class="mly-rail-button">A</button>'.repeat(10);
    await page.setContent(`<style>${sdkCss}${overrideStyles}${controlBarCompactCss}${utilityDockCss}${viewerCompactPlaybackCss}${infoPanelResponsiveCss}${infoDetailsCss}${imageInformationCss}</style>
      <main class="widget-mapillary jimu-widget" style="display:flex;flex-direction:column">
        <div class="mly-viewer-workspace">
          <div class="mapillary-sequence-container"><div class="mapillary-sequence-stepper" style="width:60px;height:17px">Playback</div></div>
          <div class="mly-info-panel">
            <div class="mly-info-header"><button class="mly-info-toggle">Vermilion</button></div>
            <div class="mly-info-body" hidden><div class="mly-info-scroll" tabindex="0">
              ${'<button style="min-height:24px">Tool</button>'.repeat(10)}
            </div></div>
          </div>
          <div class="glass-control-panel mly-control-rail">${railButtons}</div>
          <div class="glass-image-utility-panel mly-utility-dock" data-mobile="true">
            <button class="utility-button">Center</button><button class="utility-button mly-dock-collapse" aria-label="Hide tools">−</button>
          </div>
        </div>
      </main>`);
    await page.locator('.mly-viewer-workspace').evaluate((el, styles) => Object.assign(el.style, styles), viewerWorkspace);
    await page.locator('.mly-info-panel').evaluate((el, styles) => Object.assign(el.style, styles), infoPanelShellStyle(false));
    await page.locator('.mly-info-scroll').evaluate((el, styles) => Object.assign(el.style, styles), infoControlsViewportStyle(false));
    const rail = page.locator('.mly-rail-button').first();
    const dock = page.locator('.mly-utility-dock');
    const toggle = page.locator('.mly-dock-collapse');
    const resize = (width, height) => page.locator('main').evaluate((el, [w, h]) => {
      el.style.width = w + 'px';
      el.style.height = h + 'px';
    }, [width, height]);
    await resize(393, 260);
    assert.equal((await rail.boundingBox()).height, 28);
    for (const [width, height] of [[240, 260], [393, 160], [216, 160]]) {
      await resize(width, height);
      assert.equal((await rail.boundingBox()).height, 24);
      assert.equal((await toggle.boundingBox()).width, 20);
      const pane = await page.locator('.mly-viewer-workspace').boundingBox();
      const tools = await dock.boundingBox();
      assert(tools.x >= pane.x && tools.x + tools.width <= pane.x + pane.width);
      assert(tools.y >= pane.y && tools.y + tools.height <= pane.y + pane.height);
      if (width <= 280) {
        const title = await page.locator('.mly-info-panel').boundingBox();
        const playback = await page.locator('.mapillary-sequence-stepper').boundingBox();
        assert(title.y + title.height <= playback.y);
      }
      if (height <= 200) {
        const panel = page.locator('.mly-info-panel');
        const header = panel.getByRole('button', { name: 'Vermilion' });
        assert((await header.boundingBox()).height >= 34);
        await panel.evaluate(el => {
          el.classList.add('is-open');
          el.querySelector('.mly-info-body').hidden = false;
        });
        const expanded = await panel.boundingBox();
        assert(expanded.height <= height - (width <= 280 ? 64 : 50));
        if (width <= 280) {
          assert(expanded.width >= 84 && expanded.width < 96);
          assert(expanded.y + expanded.height < tools.y);
          await panel.evaluate(el => el.classList.add('is-wide'));
          assert.equal((await panel.boundingBox()).width, 144);
          await panel.evaluate(el => el.classList.remove('is-wide'));
        }
        const scroll = panel.locator('.mly-info-scroll');
        assert(await scroll.evaluate(el => el.clientHeight > 24 && el.scrollHeight > el.clientHeight));
        await scroll.focus();
        await page.keyboard.press('End');
        await page.waitForFunction(() => {
          const el = document.querySelector('.mly-info-scroll');
          return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        });
        assert((await header.boundingBox()).y >= pane.y);
        await panel.evaluate(el => {
          el.classList.remove('is-open');
          el.querySelector('.mly-info-body').hidden = true;
        });
      }
      await dock.evaluate(el => el.classList.add('is-collapsed'));
      assert.equal((await toggle.boundingBox()).width, 24);
      assert.equal(await dock.getByText('Center').isVisible(), false);
      await dock.evaluate(el => el.classList.remove('is-collapsed'));
    }
    // A 502 × 615 split experience can leave about 250 px for the viewer.
    await resize(502, 250);
    const panel = page.locator('.mly-info-panel');
    await panel.evaluate(el => {
      el.classList.add('is-open');
      el.querySelector('.mly-info-body').hidden = false;
      const footer = document.createElement('button');
      footer.style.cssText = 'flex:0 0 24px';
      footer.textContent = 'Más controles';
      el.querySelector('.mly-info-body').append(footer);
    });
    const splitPanel = await panel.boundingBox();
    assert(splitPanel.height <= 170 && splitPanel.height >= 150);
    assert(await panel.locator('.mly-info-scroll').evaluate(el =>
      el.clientHeight >= 96 && el.scrollHeight > el.clientHeight));
    await resize(700, 320);
    assert.equal((await rail.boundingBox()).height, 34);
    console.log('Viewer controls adapt to narrow and short panes with compact playback clearance.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
