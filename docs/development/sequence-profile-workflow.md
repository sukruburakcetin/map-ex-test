# Sequence profile workflow (stage 82)

`src/features/elevation/updateSequenceProfile.ts` prepares the active sequence route for the existing elevation-profile controller. `widget.tsx` supplies a stable host binding for live context, full-route demand, short-route UI, controller access, indicator publication and logging. `ElevationProfileController` retains chart, SDK resource and cancellation ownership.

The workflow captures view/sequence/activity, checks feature eligibility, and demands a complete route only when missing. After route loading, the original sequence/view/activity checks reject stale work. A route with fewer than two images clears the profile, disables the tool and shows the existing localized message in that order. Valid input is borrowed directly by the controller.

The controller receives the original live config/activity/view predicate. It intentionally does not acquire a new sequence check. Indicator publication still follows controller completion without a new outer stale check. These are existing boundaries, preserved during extraction; tightening them would be a separate behavior change.

Initial context/config failures remain outside the workflow warning boundary. Route acquisition, controller work and short-route publication errors retain the original warning. There is no new route request, timer, revision counter, cache, dependency, traversal or awaited step. Performance has not been measured.

## Verification

The comparison suite runs frozen stage-81 widget logic and the actual extracted workflow/widget host against controlled route/controller completion. It records state/config/route reads and side effects to check guard order, warnings, short-route publication and completion behavior. It also verifies borrowed route identity and stable widget host/promise forwarding. Existing profile controller/indicator suites are unchanged.

Validation: 2,776 passing portable tests / 208 files in both the workspace and clean installer-produced copy, zero failures or skips. Thirty-three new comparisons cover route demand, stale context, short-route UI, controller eligibility, completion/error boundaries and stable host forwarding; existing elevation tests are unchanged. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), stale-sequence/short-route/controller-predicate mutation checks, BOM/CRLF comparison tests and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-81 isolated ExB 1.21 build on 21 November 2026 (8,933 ms, zero errors/warnings). Browser acceptance and stage-82 ExB 1.21 validation remain unconfirmed.

## Installation and rollback

Run from the widget root:

```sh
node apply-sequence-profile-workflow-refactor.cjs --dry-run
node apply-sequence-profile-workflow-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-81 source is required; BOM/CRLF variations are accepted. Unknown source edits are refused before writing, and local documentation histories are preserved. Keep `.refactor-backups/sequence-profile-stage82` for rollback. Repeat installation verifies installed files; `--uninstall` restores exact original bytes and protects later edits or corrupt backups. Uninstall newer stages first. No dependency installation or Git operation occurs.

## Host smoke and next work

Enable the elevation profile on a warm and a previously unopened sequence. Change sequence/map or turn the tool off while route data loads. Check the short-route message and the chart's active-image indicator. Then continue with another bounded widget responsibility.
