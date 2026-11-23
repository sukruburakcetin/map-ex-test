<!-- panorama-hover-cone-stage138 -->
## Stage 138 — projected panorama hover cone

At individual panorama points and zoom 14 or higher, hover uses the same cyan projected fan as regular photos. The bearing for the matching open panorama tracks the existing confirmed viewer heading, with the same shared-link override as the yellow active-image fan. Other panoramas use capture bearing. Below zoom 14 the panorama cone stays hidden while the hover preview remains available.

Apply apply-panorama-hover-cone-fix.cjs to stage 133 through stage 137. Compare the open and a different panorama on north-up and rotated maps, and zoom out to verify that the cone hides. Live Experience Builder verification remains pending.

<!-- windows-browser-runner-stage137 -->
## Stage 137 — Windows browser fixture setup

The runner checks browser-test dependencies and the Chromium executable before starting fixtures. All fixtures honor the configured browser path when run through the runner. Windows can use the Playwright Chromium installation or CHROMIUM_PATH for an existing browser.

Follow docs/development/browser-fixtures.md for Windows Command Prompt setup. Browser test packages are installed outside Experience Builder. The installer changes browser tests and tooling only.

<!-- chromium-fixture-matrix-stage136 -->
## Stage 136 — complete isolated Chromium fixture run

The browser fixture runner discovers all .browser.cjs files, accepts individual fixture names and reports failures with a nonzero exit status. The Places panel uses the shared React loader. The localization fixture uses the installed React packages with controlled Builder bindings and exercises the current Places results and Builder disclosures.

Apply apply-chromium-fixture-matrix.cjs after stage 135. See docs/development/browser-fixtures.md for dependency setup and usage. The isolated matrix is distinct from live Experience Builder, ArcGIS and service acceptance. Widget runtime and styles are unchanged.

<!-- viewer-react-browser-stage135 -->
## Stage 135 — imagery and viewer browser fixtures with React 19

Six remaining UMD-dependent Chromium fixtures now use the shared React loader. Nearby now tests the actual ImageTray component and the widget's current JSX bindings. Its existing search, pointer feedback, loading and responsive assertions remain in place. The other fixtures cover linked detection previews, viewer panels, route preview, detection controls and image information.

Apply apply-viewer-react-browser-fixtures.cjs after stage 134. Use the same browser dependencies described in stage 130. Widget runtime and styles are unchanged. Live Experience Builder acceptance remains pending.

<!-- places-react-browser-stage134 -->
## Stage 134 — Places Chromium fixtures with React 19

Seven Places browser fixtures use the shared React loader. The harnesses now supply the current category picker, quality controls, selected-place note actions and tile normalization where used. Search and auto-update tests operate the current filter disclosure, and the selected-place test waits for the card update before measuring it.

Apply apply-places-react-browser-fixtures.cjs after stage 133. Use the same browser dependencies described in stage 130. These fixtures verify Places UI and controlled data flows in Chromium. Live Experience Builder and service-backed verification remain pending.

<!-- panorama-hover-close-zoom-stage133 -->
## Stage 133 — panorama hover bearing at close zoom

Panorama hover arrows are limited to individual image points at zoom 14 or closer. World and regional panorama previews retain their card and pulse. Zooming out hides an already-present arrow, and late preview metadata cannot draw one below the threshold. Ordinary photo hover bearings and the yellow active-image fan keep their existing behavior.

Apply apply-panorama-hover-close-zoom-fix.cjs after stage 127 or any of the subsequent validation stages through stage 132. Check the same panorama just below and at zoom 14 in Experience Builder while hovering. Confirm the card continues to work and the arrow disappears on zoom-out.

<!-- notes-react-browser-stage132 -->
## Stage 132 — notes Chromium fixtures with React 19

Six notes browser fixtures now use the shared React loader for search, compact sheets, Enterprise scrolling, detection crops, detection-to-note actions and Community Workspaces. The workspace fixture waits for the expanded geometry before measuring it and uses the same loader for its mobile page. Service responses remain fixture-controlled. Widget runtime and styles are unchanged.

Apply apply-notes-react-browser-fixtures.cjs after stage 131. Use the same browser dependencies described in stage 130. Live Experience Builder and service-backed acceptance remain pending.

<!-- shared-react-browser-stage131 -->
## Stage 131 — shared React loader for Chromium fixtures

The translated-controls, appearance, category picker, Builder disclosure and control feedback fixtures now share a React loader. The default bundles installed React and React DOM with esbuild. Explicit UMD overrides still work as a pair. Widget runtime and styles are unchanged.

Apply apply-shared-react-browser-fixtures.cjs after stage 130. Use the stage 130 browser dependencies and run the migrated tests from the widget root. These isolated Chromium fixtures leave live Experience Builder acceptance pending.

<!-- translated-controls-browser-stage130 -->
## Stage 130 — translated controls browser validation with React 19

The Chromium harness now bundles the installed React and React DOM packages through esbuild by default. Explicit React UMD overrides remain supported as a pair. The change is limited to the browser fixture and handoffs.

The full matrix passed 420 layout cases and measured 2,142 owned buttons across 13 shipped locales plus long-label stress. It covers RTL, notes, dialogs, tools, Places and Builder-style controls at 240, 393 and 1024 px. Live Experience Builder validation remains pending.

Apply apply-translated-controls-browser-validation.cjs after stage 129. To repeat the matrix, make React, React DOM, TypeScript, esbuild and Playwright available to Node, then run node tests/translatedButtons.browser.cjs from the widget root. Use MAPILLARY_PLAYWRIGHT for a custom Playwright module path and CHROMIUM_PATH for a custom Chromium executable.

<!-- panorama-hover-browser-stage129 -->
## Stage 129 — isolated Chromium validation

The panorama hover browser fixture renders the production SVG owner with a controlled map projection. It checks rotation at world zoom, a changed bearing, a street-level projection, SVG reuse, missing bearing, hidden anchors, perspective switching and cleanup. The fixture makes zero browser requests.

Six retained Chromium harnesses passed on the same runtime: coverage bar startup, compact viewer controls, 432 info-box layout cases, five Spanish splash sizes, low-zoom feedback and hover thumbnail retention. These checks use isolated fixtures. The live Experience Builder acceptance matrix in docs/development/refactoring-remaining-work.md remains pending.

Apply apply-panorama-hover-browser-validation.cjs after stage 128. Run node tests/panoramaHoverPointer.browser.cjs with Chromium and playwright-core available, or set CHROMIUM_PATH and MAPILLARY_PLAYWRIGHT to their installed paths.

<!-- compact-coverage-button-stage128 -->
## Stage 128 — compact coverage button validation

The translated-button audit now recognizes the coverage bar's dedicated single-line layout. Its short label and ellipsis keep the fixed-height startup bar usable in narrow panes. Chromium checks ordinary and deliberately long labels at 240 and 393 px, including the full accessible name. Widget source and styles are unchanged.

Apply apply-compact-coverage-button-validation.cjs after stage 127. Live Experience Builder acceptance remains pending.

<!-- panorama-hover-reconciliation-stage127 -->
## Stage 127 — panorama hover bearing on the synced checkout

Commit 9e34b52 contained the stage 126 handoff and world-scale projection, but the widget still supplied capture bearing and invoked the perspective wedge for panoramas. This patch routes matching panorama previews to the existing arrow, uses the image-scoped confirmed viewer heading when available, and preserves the capture-bearing fallback. A regional preview of another frame cannot put its panorama arrow on the representative's anchor. No requests or timers were added.

Run apply-panorama-hover-reconciliation.cjs from the widget root at the supported 9e34b52 checkpoint. Use --dry-run before applying and --uninstall to roll back. Review the arrow on north-up and rotated maps at world and street zoom, with the same panorama open and with a different panorama open. Live Experience Builder acceptance remains pending.

# Continue Mapillary Explorer at stage 126

Apply `apply-open-panorama-bearing-fix.cjs` from the stage 125 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify hovering the open panorama and a different panorama on north-up and rotated maps.

## Stage 125 checkpoint history

Apply `apply-world-panorama-bearing-fix.cjs` from the stage 124 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the cyan panorama arrow at world zoom with a north-up and rotated 2D Web Mercator map.

## Stage 124 checkpoint history

Apply `apply-split-height-info-box.cjs` from the stage 123 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the expanded info box at the reported 502 × 615 split layout.

## Stage 123 checkpoint history

Apply `apply-single-line-coverage-label.cjs` from the stage 122 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify Analyze Coverage in the compact Spanish info box.

## Stage 122 checkpoint history

Apply `apply-compact-expanded-info-box.cjs` from the stage 121 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the collapsed title, expanded tools and keyboard scrolling in a short viewer pane.

## Stage 121 checkpoint history

Apply `apply-short-info-box.cjs` from the stage 120 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the collapsed title, expanded tools and keyboard scrolling in a short viewer pane.

## Stage 120 checkpoint history

Apply `apply-responsive-splash.cjs` from the stage 119 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the Start exploring action on a cold reload in a narrow, short viewer pane.

## Stage 119 checkpoint history

Apply `apply-compact-viewer-controls.cjs` from the stage 118 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the short and narrow image panes in Experience Builder with the utility dock expanded and collapsed and the image title visible.

## Stage 118 checkpoint history

Apply `apply-coverage-bar-startup-fix.cjs` from the stage 117 widget root. Run `--dry-run` first and use `--uninstall` for rollback. Verify the initial Spanish coverage bar in Experience Builder at 240 and 393 px during a cold reload.

## Stage 117 checkpoint history

Apply `apply-mobile-display-sizing.cjs` from the stage 116 widget root. Run with `--dry-run` first. Use `--uninstall` for rollback. In Experience Builder, compare the category picker and Display panel widths on mobile and check the percentage buttons at 240 and 393 px.

## Stage 116 checkpoint history

Stage 116 repairs the info-box browser fixture and narrow mobile category picker. Apply `apply-browser-validation-fixes.cjs` to stage 115. P12 still needs the [Experience Builder acceptance matrix](docs/development/refactoring-remaining-work.md#browser-acceptance-matrix). Keep recorded test evidence tied to its source checkpoint.

## Stage 115 source and installer history

Stage 115 completes the P11 architecture review. Continue with P12 validation using [the browser acceptance matrix](docs/development/refactoring-remaining-work.md#browser-acceptance-matrix), [portable test setup](docs/development/portable-tests.md) and [current runtime architecture](docs/development/architecture.md). Record the tested commit or source hash, SDK version and observed results. Experience Builder build and live browser evidence for this checkpoint are pending.

GitHub commit `7e25205` contains stage 111. On that source, the installer order is stage 112 `apply-point-cloud-keyboard-refactor.cjs`, stage 113 `apply-enterprise-attachment-refactor.cjs`, stage 114 `apply-image-follow-refactor.cjs` and stage 115 `apply-architecture-review.cjs`. Apply only the stages missing from the actual widget. From its root, run each installer with `--dry-run` before applying. Keep its backup directory and use `--uninstall` in reverse order for rollback.

Stage 115 widget SHA-256 with LF and no BOM is `c44c8bd75d7d2d9c3e0b73c9e413296e6aa3175891ae9268ee1e8d7c5e91d95d`. Bring your source folder and retain local changes. See [account history](ACCOUNT-HANDOFF.md) and [milestone history](REFACTORING-MILESTONE.md) for earlier checkpoints.
