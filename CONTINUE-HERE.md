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
