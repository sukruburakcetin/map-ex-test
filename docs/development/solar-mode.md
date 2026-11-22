# Solar mode coordination (stage 85)

`src/features/solar/solarMode.ts` owns solar enable/disable policy. Widget binds React scheduling, current solar activity, existing conflicting-tool cleanup, localized feedback and solar update/clear. Rendering remains in `updateSolarModel` and its existing resource owners.

The feature checks config once, then submits the original functional state updater. Only enabling clears active measure, sight, viewshed and lasso tools, in that order, using updater-time previous state. Cleanup intentionally remains inside the updater, including its replay behavior. The completion callback branches on live solar activity rather than a captured next value: active mode shows the original message for 3000 ms then starts rendering; inactive mode clears solar resources.

The async toggle returns after React scheduling. It does not await queued callbacks or rendering. No new config recheck, cleanup policy, revision counter, dependency, request or timer is introduced. This extraction preserves existing React timing rather than changing updater side effects. No speed improvement is claimed.

## Verification

The comparison suite executes frozen stage-84 widget logic and the actual feature/widget host with separate updater/callback queues. It covers all conflicting-tool flag combinations, config eligibility, live previous/callback state, replay, repeated queued toggles, unawaited rendering and immediate versus delayed failure boundaries. Existing solar tests are unchanged.

Validation: 2,881 passing portable tests / 211 files in both the workspace and clean installer-produced copy, zero failures or skips. Forty-one new comparisons cover conflicting-tool flags, strict config, updater/callback state and timing, replay, unawaited rendering, failures and stable host forwarding; existing solar suites remain unchanged. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), previous-state/callback/cleanup mutation checks, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-84 isolated ExB 1.21 build on 21 November 2026 (7,781 ms, zero errors/warnings). Browser acceptance and stage-85 ExB 1.21 validation remain unconfirmed.

## Installation

Run from the widget root:

```sh
node apply-solar-mode-refactor.cjs --dry-run
node apply-solar-mode-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-84 source is required; BOM/CRLF variations are accepted. Unknown edits are refused before writing and local documentation histories are retained. Keep `.refactor-backups/solar-mode-stage85` for rollback. Repeat installation verifies installed files; `--uninstall` restores exact original bytes and protects later edits or corrupt backups. Uninstall newer stages first. No package installation or Git operation occurs.

## Host smoke and next work

Where solar is enabled, turn it on/off, including while measure, sight, viewshed or lasso is active. Check cleanup, the existing notification and solar presentation. Recheck cold/warm solar rendering in 2D/3D from stage 84. Continue with another bounded widget responsibility.
