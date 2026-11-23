# Isolated Chromium fixtures

Run the fixtures from the widget root. They use controlled host and service inputs. Use the [browser acceptance matrix](refactoring-remaining-work.md#browser-acceptance-matrix) for live Experience Builder, ArcGIS rendering, and service checks.

## Windows Command Prompt

Use Node 24. Install the test tools in a temporary folder outside the widget and Experience Builder:

```bat
set "MAPILLARY_BROWSER_DEPS=%TEMP%\mapillary-browser-deps"
npm install --prefix "%MAPILLARY_BROWSER_DEPS%" --save-exact --no-audit --no-fund typescript@5.9.3 react@19.2.3 react-dom@19.2.3 esbuild@0.25.12 playwright@1.57.0
node "%MAPILLARY_BROWSER_DEPS%\node_modules\playwright\cli.js" install chromium
set "NODE_PATH=%MAPILLARY_BROWSER_DEPS%\node_modules"
node tools/check-browser-fixtures.cjs coverageBarStartup
node tools/check-browser-fixtures.cjs
```

Use the same Command Prompt window for the install and test commands. In a new window, set `MAPILLARY_BROWSER_DEPS` and `NODE_PATH` again. The browser download is needed once per Playwright installation. For an existing Chrome or Chromium installation, you can set `CHROMIUM_PATH` to the full path of its executable before running the tests.

## Linux

```sh
deps="$(mktemp -d)"
npm install --prefix "$deps" --save-exact --no-audit --no-fund \
  typescript@5.9.3 react@19.2.3 react-dom@19.2.3 esbuild@0.25.12 playwright@1.57.0
export NODE_PATH="$deps/node_modules${NODE_PATH:+:$NODE_PATH}"
node tools/check-browser-fixtures.cjs
```

The runner uses `/usr/bin/chromium` if it exists. Otherwise it resolves the browser installed by Playwright. Install it with `node "$deps/node_modules/playwright/cli.js" install chromium` or set `CHROMIUM_PATH` to your browser executable.

## Selecting fixtures

Run `node tools/check-browser-fixtures.cjs --list` to list browser fixtures. Pass names without the `.browser.cjs` suffix to run a subset:

```sh
node tools/check-browser-fixtures.cjs localizationQuality hoverPreviewStatus placesPanel
```

The runner checks dependencies and the browser before starting fixtures. Each selected fixture runs in a separate process. Any fixture failure makes the runner exit nonzero. Set `EXPERIENCE_BUILDER_CLIENT` if you want the localization fixture to resolve React from a particular client while continuing to use controlled host inputs.

For the Node suite and dependency pins, see [portable test setup](portable-tests.md). Keep fixture evidence tied to the exact widget source and browser version tested.
