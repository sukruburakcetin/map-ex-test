# Continue Mapillary Explorer at stage 111

## Prompt for the next AI session

> Read this handoff and inspect my actual Mapillary Explorer widget folder before editing. The latest delivered checkpoint is stage 111. Verify which installers I have applied and preserve my local changes. If stage 111 is present, begin P10 with one bounded, behavior-preserving extraction. Inspect the existing point-cloud calibration owner and `handleNudgeKeyDown` first, then choose a coherent boundary that reuses existing code. Deliver the change as a reversible, standalone `.cjs` installer that runs from the widget root beside `manifest.json`. Include dry-run, exact rollback, focused validation and updated Markdown handoffs.

## What to bring

- This file and your **actual widget source folder**, preferably the one where you ran the latest installer. The folder should contain `manifest.json`, `src/`, `tests/` and `docs/`. Preserve local source changes and retain `.refactor-backups/` if you want to roll back.
- If you are taking a fresh checkout instead, bring the needed installers separately. The reference checkout here is `sukruburakcetin/map-ex-test` at commit `e02562bfd792556935ebfeb4f3b0539b9f28d57c`; it contains stage 102 source. Stages 103–111 were delivered as separate installer files outside the tracked source at that commit. This README does not contain those changes.
- In the receiving workspace, verify whether the source is already at stage 111 before applying any installer. The stage 111 `src/runtime/widget.tsx` SHA-256 is `d0c47e13816696fca7db62d54945c878b59e411204e93539dd5d160547f31270` when encoded as UTF-8 with LF and no BOM. Also check for `src/features/coverage/nativeCoverageStyle.ts`, `nativeCoverageLayers.ts` in the same folder and the stage 111 entries in both handoff files. A different hash can indicate local changes or a different checkpoint. Inspect the differences before proceeding.

### Installer order from stage 102

Run only the stages your destination still needs, in order. For each file, run `node <installer>.cjs --dry-run` before applying with `node <installer>.cjs`. Run these commands from the widget root.

| Stage | Installer |
| --- | --- |
| 103 | `apply-widget-fullscreen-refactor.cjs` |
| 104 | `apply-widget-viewer-resize-refactor.cjs` |
| 105 | `apply-coverage-guide-refactor.cjs` |
| 106 | `apply-places-overlay-refactor.cjs` |
| 107 | `apply-field-notes-overlay-refactor.cjs` |
| 108 | `apply-widget-layout-styles-refactor.cjs` |
| 109 | `apply-widget-feedback-styles-refactor.cjs` |
| 110 | `apply-coverage-analysis-refactor.cjs` |
| 111 | `apply-native-coverage-layer-refactor.cjs` |

## Where to resume

- **P10 is next.** Its scope is point-cloud keyboard policy, shared-note synchronization and write/edit/attachment commands, map-to-image synchronization, and residual cone policy. Start with one bounded extraction. For the suggested keyboard pass, inspect `src/features/point-cloud/PointCloudCalibration.ts` and use `tests/pointCloudCalibration.test.cjs` to compare offsets, feedback, debounce behavior and side-effect order. Keep explicit shared-note write authorization and live map/image identity guards when moving later commands.
- **P11 and P12 follow.** P11 covers architecture and documentation cleanup. P12 is exact-source integration, browser and handoff validation. The package scope and acceptance matrix are in the [refactoring plan](docs/development/refactoring-remaining-work.md). Its original progress header predates stages 103–111, so use the latest entries in [ACCOUNT-HANDOFF.md](ACCOUNT-HANDOFF.md) and [REFACTORING-MILESTONE.md](REFACTORING-MILESTONE.md) for checkpoint status when available.
- **Open validation.** Stage 111 passed 3,369 portable Node tests with zero failures or skips. The coverage extraction matched stage 110 across 120 controlled style, replacement and layer-ordering traces. The installer passed repeat application and byte-for-byte rollback. Full Experience Builder build, live browser acceptance and road-server verification remain open. Fullscreen still recreates the viewer, and viewer retention and loading-flash behavior remain open.

## Delivery and verification

Keep refactors behavior-preserving, preserve local edits, and use the existing feature owners. Keep requests, timers, cancellation, action ordering and side effects stable. Continue delivering one standalone `.cjs` per step with checkpoint checks, `--dry-run`, backups and `--uninstall`. Test the installer on a copy of the actual prior checkpoint and verify the installed source, repeat application and rollback before delivery.

Use the [portable test setup](docs/development/portable-tests.md) and [Experience Builder installation guide](docs/installation.md). The prior cloud test environment used Node 24 and isolated dependencies outside the widget source. A new workspace may need to recreate those dependencies. Run focused tests first, then the complete portable suite against an installer-produced copy. Record build or browser results only for the source and host you actually verified.
