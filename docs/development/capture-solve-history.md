# Capture solve history

[CaptureSolveHistory](../../src/features/routing/CaptureSolveHistory.ts) keeps the best authoritative solve as one run-local record: route, extra minutes and the matching shallow opportunity snapshot. The initial record remains null/empty/Infinity. A strictly lower extra time replaces it; ties, worse values and NaN retain the existing winner. Snapshot copying happens only for a winning solve, preserving route and opportunity-object identities.

The widget still owns provider calls, cancellation checks, baseline subtraction, budget checks, final recovery, warnings and drawing. Recording happens after the authoritative solve's existing ownership check. Final recovery uses `finalCaptureSelection.ts` (stage 22) with its existing strict budget/improvement rule; this extraction does not tune route selection or add requests.

## Verification

[Characterization tests](../../tests/captureSolveHistory.test.cjs) compare each update through the actual widget adapter against the [previous declarations/update](../../tests/fixtures/captureSolveHistory.baseline.json). They cover initial state, improving/tied/worse and nonfinite values, shallow snapshots, run isolation, frozen inputs, avoiding copies for losing solves and 150 varied sequences. [Route-generation tests](../../tests/routeGeneration.test.cjs) cover run invalidation and stale drawing/camera work. [Controlled integration tests](../../tests/captureRouteIntegration.test.cjs), restored in stage 20, exercise final/preflight requests, retry recovery, cancellation and matching final opportunity/coverage publication. These use mocked provider/rendering/coverage boundaries and do not replace host verification. [Geometry tests](../../tests/captureRouteGeometry.test.cjs) exercise validation and actual drawing-method resource/cancellation behavior.

## Installer

After applying the route-geometry safety fix (v2 is supported), run from the widget root:

```sh
node apply-capture-solve-history.cjs --dry-run
node apply-capture-solve-history.cjs
```

The installer uses the installed client's TypeScript parser, matches the affected method rather than import order, preserves formatting/comments elsewhere, preflights all changes and refuses unknown bookkeeping. Existing test fixtures are updated only when recognized. This guide is added and a continuation note is appended to an existing refactoring milestone; other documentation is left intact. Keep the backup folder for rollback and restart the client after installation. No dependency reinstall is required.

```sh
node apply-capture-solve-history.cjs --uninstall
```

The isolated runtime/settings check using Experience Builder 1.20 rules does not replace a full 1.21 build, live browser verification or performance measurement. See [routing validation](routing-validation.md).
