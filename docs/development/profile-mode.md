# Elevation profile mode (stage 86)

`src/features/elevation/profileMode.ts` coordinates the profile toggle and its cone redraw. Widget binds React state, route-failure reset, existing profile update/clear, feedback and cone drawing. Existing profile and map-graphics owners retain resource lifetime.

The toggle checks config once, captures the next active value at click time, and submits the same state patch. Its callback uses that captured target even if current state/config changes before React invokes it. Enabling clears the route failure, starts profile work without awaiting it, then reads completion for the existing 2500 ms feedback. Disabling clears profile resources.

After either branch, cone redraw uses the current matching sequence frame. Length/spread are captured before clearing the old cone; bearing is read afterward with the original `|| 0` fallback. No new normalization, validation, stale check, config recheck, request, timer, dependency or await is added. No speed improvement is claimed.

## Verification

The comparison suite executes frozen stage-85 widget logic and the actual feature/widget host. It checks route-readiness messages including empty completed arrays, durations, captured toggle targets, live callback frame/settings, dimension/bearing timing, missing IDs, unawaited profile generation and immediate/delayed errors. Existing elevation suites are unchanged.

Validation: 2,916 passing portable tests / 212 files in both the workspace and clean installer-produced copy, zero failures or skips. Thirty-five new comparisons cover route feedback, captured targets, callback state, cone dimensions/bearing order, absent frames, unawaited work, failures and stable host forwarding; existing elevation suites are unchanged. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), captured-target/reset/bearing mutation checks, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-85 isolated ExB 1.21 build on 21 November 2026 (7,574 ms, zero errors/warnings). Browser acceptance and stage-86 ExB 1.21 validation remain unconfirmed.

## Installation

Run from the widget root:

```sh
node apply-profile-mode-refactor.cjs --dry-run
node apply-profile-mode-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-85 source is required; BOM/CRLF variations are accepted. Unknown source edits are refused before writing and local documentation histories are retained. Keep `.refactor-backups/profile-mode-stage86` for rollback. Repeat installation verifies installed files; `--uninstall` restores exact original bytes and protects later edits or corrupted backups. Uninstall newer stages first. No package installation or Git operation occurs.

## Host smoke and next work

Toggle the elevation profile on/off with a warm and a cold route. Check the existing messages and cone redraw, including after changing the current image or cone size. Then continue with another bounded widget responsibility.
