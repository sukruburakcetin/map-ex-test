# Capture-route warning fix and P01 review — stage 90

The stage-89 review flagged an existing `this.warn` call in the actual widget binding. No Widget.warn implementation is declared. Controlled routing fixtures supplied a mock, hiding the real-host failure.

The new regression cases remove that mock and reproduce `this.warn is not a function` when only one over-budget opportunity remains. The exception previously entered routing error handling and prevented publication. The production fix is one binding change: routing warnings use `console.warn`, consistent with the widget's other warning sinks.

This is a deliberate bug fix, separate from the preceding moves. It preserves the existing fallback route, actual extra-duration summary, stop ordering, signals, pruning, final selection and provider request count. It does not claim an over-budget route fits or add retries/budget adjustments. Cancelled results still cannot warn, draw or publish.

## Verification

Six new cases exercise the actual widget host without Widget.warn: direct over-budget and fitting single-opportunity results, pruning down to one, OSRM-shaped preflight, cancellation, and the standalone sink without debug logging. The test was run before the fix and reproduced the TypeError, then passed after the binding change. Existing routing comparisons and policy assertions remain unchanged.

Validation: 2,993 passing portable tests / 216 files in both workspace and clean installer-produced copy, zero failures or skips. Six new real-binding regressions pass after reproducing the TypeError before the fix; reverting the binding fails them again. Existing execution/preparation/policy comparisons remain unchanged. Isolated ExB 1.20 module-graph build has zero errors/warnings. BOM/CRLF regressions and reversible installer checks pass, including local plan preservation, missing-plan creation, unknown edits and exact rollback. Live-host/provider/browser acceptance remains pending.

The isolated ExB 1.20 module-graph build passes with zero errors/warnings. User-supplied ExB 1.21/live-provider/browser acceptance has not been supplied for stages 87–90. Tests use controlled providers rather than external services.

## P01 review decision

P01 implementation is complete across stages 88–90. The widget route entry is 42 lines, its per-run routing host is 54 lines, and execution is feature-owned with no widget/DOM/Jimu/SDK coupling. Its explicit ordered request loop is intentionally retained over existing pure helpers; a generic request framework or new per-probe await would add complexity. Legacy comment/source-anchor cleanup is tracked in P11. Host acceptance remains pending under P12; this is not full refactor/release completion.

The remaining plan has eleven packages (P02–P12), provisionally 18–29 reviewable changes including final validation/docs. Next: P02 active-view lifecycle, coordinating P03 interactions where needed.

## Installation and rollback

From the reviewed stage-89 widget root:

```sh
node apply-capture-route-warning-fix.cjs --dry-run
node apply-capture-route-warning-fix.cjs
node tools/check-exb-build.cjs --client ../../..
```

Unknown edits are refused before writing; BOM/CRLF variations are accepted. Local documentation history and unrelated plan text are preserved. Keep `.refactor-backups/capture-route-warning-stage90` for exact guarded `--uninstall`; uninstall later stages first. A missing plan receives reviewed current content. No dependency install, commit, push or external provider request occurs.

## Host smoke

With supported configured providers, check a fitting route and a route that leaves a single over-budget opportunity. The latter should retain its warning and existing fallback result/actual duration rather than a generic failure. Check cancellation and busy-state release. Record source/host/provider evidence before treating acceptance as complete.
