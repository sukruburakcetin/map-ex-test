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
    if (name.endsWith('/WidgetLocale')) return {};
    return load(resolve(dirname(file), name + '.ts'));
  });
  return m.exports;
}

async function main() {
  const { CoverageGuide } = load(resolve(root, 'src/features/coverage/CoverageGuide.tsx'));
  const { textButtonCss } = load(resolve(root, 'src/styles/textButtons.ts'));
  const full = 'Acercar a las imágenes';
  const short = 'Acercar el mapa';
  const render = (full, short) => renderToStaticMarkup(React.createElement(CoverageGuide, {
    visible: true,
    status: { text: 'Acerca el mapa para ver los puntos de cobertura', action: 'show', label: full },
    settings: [], mouseHint: 'Haz clic en una línea de cobertura', touchHint: '',
    t: key => key === 'appZoomCloser' ? short : key,
  }));
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    for (const width of [240, 393]) {
      for (const stress of [false, true]) {
        const fullLabel = stress ? full.repeat(12) : full;
        const shortLabel = stress ? short.repeat(12) : short;
        const html = render(fullLabel, shortLabel);
        await page.setContent(`<style>body{margin:0}${textButtonCss}</style><main style="container-type:inline-size;width:${width}px;padding-block-start:30px">${html}</main>`);
        const action = page.getByRole('button', { name: fullLabel, exact: true });
        assert.equal(await action.innerText(), width === 240 ? shortLabel : fullLabel);
        const bar = await page.locator('.mly-coverage-notice').boundingBox();
        const button = await action.boundingBox();
        assert(button.y >= bar.y && button.y + button.height <= bar.y + bar.height);
        assert(button.x >= bar.x && button.x + button.width <= bar.x + bar.width);
        const sizing = await action.evaluate(node => {
          const css = getComputedStyle(node);
          return { whiteSpace: css.whiteSpace, textOverflow: css.textOverflow, clipped: node.scrollWidth > node.clientWidth };
        });
        assert.equal(sizing.whiteSpace, 'nowrap');
        assert.equal(sizing.textOverflow, 'ellipsis');
        if (stress) assert(sizing.clipped, 'the long visible label must be clipped inside the button');
        assert.equal(bar.height, 24);
      }
    }
    console.log('Coverage startup bar passes four compact and long-label cases at 240 and 393 px.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
