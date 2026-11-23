const { readFileSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const { chromium } = require(process.env.MAPILLARY_PLAYWRIGHT || 'playwright-core');

const root = resolve(__dirname, '..');
function load(file) {
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React, jsxFactory: 'jsx',
    },
  });
  const m = { exports: {} };
  new Function('module', 'exports', 'require', outputText)(m, m.exports, name => {
    if (name === 'react') return React;
    if (name === 'jimu-core') return { React, jsx: React.createElement };
    if (name.endsWith('/WidgetLocale')) return { useWidgetLocale: () => ({
      locale: 'es', direction: 'ltr',
      t: key => ({
        uiFindYourPointOfView: 'Encuentra tu punto de vista.',
        uiStreetImageryConnectedByTheMap: 'Imágenes de calle conectadas por el mapa.',
        uiStartExploring: 'Empezar a explorar',
        uiPreparingYourTools: 'Preparando tus herramientas',
      })[key] || 'Mapillary Explorer',
    }) };
    return load(resolve(dirname(file), name + '.ts'));
  });
  return m.exports;
}

async function main() {
  const { SplashScreen } = load(resolve(root, 'src/components/SplashScreen.tsx'));
  const { textButtonCss } = load(resolve(root, 'src/styles/textButtons.ts'));
  const html = renderToStaticMarkup(React.createElement(SplashScreen, {
    showIntro: true, filtersLoaded: false, onDismiss() {},
  }));
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    for (const [width, height] of [[216, 150], [240, 180], [280, 200], [393, 280], [700, 480]]) {
      await page.setContent(`<style>body{margin:0}${textButtonCss}</style><main style="position:relative;width:${width}px;height:${height}px">${html}</main>`);
      const button = page.getByRole('button', { name: 'Empezar a explorar' });
      const bounds = await button.boundingBox();
      const card = await page.locator('.mly-intro-layout').boundingBox();
      assert(bounds && card && bounds.y + bounds.height <= card.y + card.height,
        JSON.stringify({ width, height, bounds, card }));
      assert(bounds.x >= card.x && bounds.x + bounds.width <= card.x + card.width);
      await button.click({ trial: true });
      assert.equal(await page.locator('.mly-intro-scene > svg').isVisible(), height > 240);
      assert.equal(await page.getByRole('status').isVisible(), true);
    }
    console.log('Spanish splash start action fits without scrolling in all five tested pane sizes.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
