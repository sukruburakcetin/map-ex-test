# Mapillary Explorer — resume from this checkpoint

Checkpoint: **20 November 2026 — stage 77 plus sequence-transition fix**.

## Paste this into the next account/session

> Read CONTINUE-HERE.md, ACCOUNT-HANDOFF.md and REFACTORING-MILESTONE.md. Verify the actual source and installer application status; preserve all local changes. The latest checkpoint is stage 77 plus apply-sequence-transition-fix.cjs, with 2,645 passing portable workspace tests and 2,626 passing installed-package tests. The latest fix has not yet been user-verified in ExB. Do not claim zero browsing-speed impact: it adds no requests/style reloads or awaited clearing, but moves a small synchronous presentation operation before navigation. First verify the fix/checkpoint, then continue with the next bounded widget.tsx refactoring step and deliver a reversible CJS installer. Stage 78 has not started.

## Bring these to the new account

- This Markdown file and the **current widget source/project**, including uncommitted changes and tests.
- ACCOUNT-HANDOFF.md, REFACTORING-MILESTONE.md and docs/development.
- The latest installer, apply-sequence-transition-fix.cjs, and earlier installers if the target source is behind.
- Keep installer backup folders beside the installed widget for exact rollback.

A different account may not have this execution workspace or its /tmp files. This document does not contain the source. A Git checkout of the recorded HEAD alone will **not** reproduce this checkpoint: the work below is uncommitted. Verify what is actually available before continuing.

## Workspace and checkpoint identity

- Working repository: /workspace/map-ex-stage65.
- Recorded Git HEAD: **0264ff5**. Later refactors and fixes are local changes; no commit, push or deployment was performed.
- Preserve other worktrees and existing edits. Do not reset, clean or overwrite them to match HEAD.
- Installers: /workspace/artifacts. A downloaded installer can run from the Windows widget root without build dependencies.
- Latest runtime widget SHA-256 (LF bytes):
  `60e1b459ab5cd3c98625bb626942a4578c306fa928fbebdef8507b067bfcc9c9`
- Latest installer SHA-256:
  `27e477f8b8f898d664aabd392d24fdcb9cbdca90b90e7838d790f1586aee82f1`

Hashes describe this checkpoint, not proof of installation. BOM/CRLF changes alter raw hashes; installer source checks normalize them. Inspect diffs rather than discarding legitimate differences.

## Latest user issue and fix

The user observed that selecting another point removed the green marker and cone immediately, while the old blue sequence stayed briefly until the new image loaded.

Cause: selection-start cleanup cancelled pending highlight work but retained already-painted selected graphics/native cached layers. updateNativeSequenceSelection deferred the next selected role until image confirmation.

The only production change is in **loadSequenceById** in src/runtime/widget.tsx, immediately after its existing cone clear:

```ts
if (this.state.turboModeActive && this.state.sequenceId && this.state.sequenceId !== sequenceId)
  void this._nativeSequenceSelection.select(null);
```

The actual source includes a short explanatory comment. This uses the existing owner API; TileSequenceHighlights and NativeTileHighlightCache were not changed.

- Actual cross-sequence Turbo navigation clears the old selected role before the first await.
- First load with no previous sequence and same-sequence point changes retain their original paths.
- Clearing is not awaited. No additional image/tile request, style reload, retry, prefetch or timer is introduced.
- 2D clears selected presentation while keeping geometry caches; 3D hides the selected cached layer and retains it for reuse.
- Hover/base coverage remain; late cancelled geometry cannot repaint the old selection.
- Existing readiness/failure/cancel lifecycle restores the previous selection. Legacy non-Turbo overlay behavior was not changed.

Eight regressions were added to existing suites. Existing assertions were preserved; two fixtures received their missing owner bindings. An initial unnecessary clear on first load failed an existing paint-priority assertion; the final previous-sequence guard corrected this without weakening that assertion.

### Performance statement given to the user

The fix does not add network requests, decoding, style reloads or an awaited highlight-clear step. It moves a small synchronous presentation operation before navigation. Tests preserve image-first dispatch and paint-priority behavior, but **live ExB browsing speed was not measured**. Do not promise zero impact or claim the fastest possible browsing state.

## Validation and host acceptance

Final results, all passing with zero skips:

| Scope | Tests | Files |
| --- | ---: | ---: |
| Portable workspace | 2,645 | 204 |
| Exact installed package | 2,626 | 203 |

The 19-test difference is standalone hover-profiler diagnostics excluded from the runtime installer. It is not a missing/failing runtime suite.

Additional checks passed: widget syntax, repository hygiene (892 source files), regressions rejecting the old transition/awaited clearing/same-sequence clearing, LF and BOM/CRLF installation, read-only dry run, local documentation preservation, edit protection, idempotence, corrupted-backup refusal, exact rollback, and reverse rollback through the complete update chain.

There is no ExB SDK/client host here and no connection to the user's Windows localhost. The latest fix's **actual application, live visual result, host build and speed acceptance are unconfirmed**. “Next” does not establish installation or acceptance. Historical stage-65 isolated ExB 1.21.0 zero-error/zero-warning build evidence does not validate this later checkpoint.

Final result files, if this same environment remains available:

- /tmp/sequence-transition-final-portable-results/report.json
- /tmp/sequence-transition-final-installed-results/report.json
- /tmp/sequence-transition-installer-final-checks/installed — exact installed source/test snapshot

## Latest installer

Requires stage 77. From the actual widget root:

```sh
node apply-sequence-transition-fix.cjs --dry-run
node apply-sequence-transition-fix.cjs
# Reverse only this fix, before reversing older stages:
node apply-sequence-transition-fix.cjs --uninstall
```

Restart the ExB client and hard-refresh after application. The installer preflights source/tests before writes, preserves exact bytes and documentation history, backs up outside the widget, and refuses unsupported edits or rollback over later edits. Never force past a mismatch: inspect it and preserve local work.

This standalone handoff was created after the installer. Existing installer-managed handoff/history files were left unchanged, so creating it did not invalidate their rollback hashes. The installer does not install this standalone file.

## Recent refactoring history

| Stage | Responsibility moved out of widget.tsx | Installer |
| --- | --- | --- |
| 71 | Coverage readiness/timeout/watcher lifecycle | apply-coverage-readiness-refactor.cjs |
| 72 | Coverage tile transport/retry mechanics | apply-coverage-transport-refactor.cjs |
| 73 | Optional sequence diagnostics registry/observer | apply-sequence-diagnostics-refactor.cjs |
| 74 | Zoom-to-images navigation target selection | apply-zoom-target-refactor.cjs |
| 75 | Image-file download mechanics | apply-image-download-refactor.cjs |
| 76 | Zoom-warning timer lifecycle | apply-zoom-warning-refactor.cjs |
| 77 | Coverage-zone geometry/style properties | apply-coverage-zone-refactor.cjs |

Earlier cone-readiness, panorama hover pointer, hover responsiveness and coverage-first startup changes are preserved. Their details and evidence remain in the milestone/history files. Low-zoom multi-second remote tile waits were not claimed to be eliminated; visible coverage and raw hover tile caches are separate data paths.

### Installer order from the stage-65 baseline

Use only installers needed by the actual source. Do not blindly replay this list over a newer or locally edited widget.

1. apply-view-zoom-bindings-refactor.cjs
2. apply-turbo-view-bindings-refactor.cjs
3. apply-stationary-url-bindings-refactor.cjs
4. apply-sequence-paint-refactor.cjs
5. apply-preview-bearing-startup-fix.cjs
6. apply-street-bearing-refactor.cjs
7. apply-cone-readiness-and-panorama-fix.cjs
8. apply-panorama-hover-pointer.cjs
9. apply-hover-responsiveness-optimization.cjs
10. apply-low-zoom-hover-responsiveness.cjs
11. apply-coverage-first-startup.cjs
12. apply-coverage-readiness-refactor.cjs
13. apply-coverage-transport-refactor.cjs
14. apply-sequence-diagnostics-refactor.cjs
15. apply-zoom-target-refactor.cjs
16. apply-image-download-refactor.cjs
17. apply-zoom-warning-refactor.cjs
18. apply-coverage-zone-refactor.cjs
19. apply-sequence-transition-fix.cjs

## Continue from here

1. Read the source/history and inspect Git status/diffs. Establish whether this is the fixed checkpoint or an earlier/modified host copy.
2. Verify application of the transition fix. Host checks: different sequences in 2D/3D; old blue highlight clears with marker/cone; same-sequence changes; rapid A/B/C clicks; cancellation/failure/retry; cold/warm image opening.
3. If available, measure live dispatch/opening timings before making a browsing-speed claim. Preserve existing request, cache and concurrency limits.
4. Resume the next bounded refactor as **stage 78**, retaining the fix. No next extraction has been selected or implemented yet. Inspect for a cohesive responsibility; avoid a broad rewrite of selection/viewer lifecycle code.
5. Preserve assertions and test relevant behavior, including stale work and cancellation. Keep SDK-host acceptance separate from portable/syntax checks. Deliver a reversible, source-preflighted CJS installer and update the milestone/handoff.

## Local verification tooling (environment-specific)

If these /tmp tools/dependencies survive, portable tests use /tmp/run-portable-cases.py ROOT RESULTS_DIRECTORY. It runs each tests/*.test.cjs directly with TAP, avoiding Node 24 outer-runner file-only counts. It exits nonzero for failures, missing counts or skips.

Dependencies: /tmp/mapillary-stage66-test-deps/node_modules, with TypeScript, React, react-test-renderer and @electric-sql/pglite. If unavailable in the new account, reconstruct the test setup from repository documentation rather than assuming these paths exist.

Installer build/check helpers for the latest fix are in /tmp/build-sequence-transition-installer.py, /tmp/check-sequence-transition-installer-final.py, /tmp/check-sequence-transition-final-regressions.py and /tmp/check-sequence-transition-final-chain.py. These helpers are environment conveniences; the delivered CJS installer is self-contained. Use fresh scratch directories when rerunning chain checks.
