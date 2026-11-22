# Toast notification ownership (stage 80)

`src/features/notifications/ToastNotifications.ts` owns the current toast timer and optional `point-cloud-progress` owner. `widget.tsx` retains React rendering, string localization through `OwnedMessage`, state publication, the default duration and feature-specific callers. Point-cloud lifecycle cleanup delegates only progress dismissal.

`show` clears a truthy previous timer, assigns ownership, publishes the message, then schedules expiry for the supplied duration. Expiry publishes the hidden state before resetting ownership and timer. `dismiss` clears only matching progress: it cancels the timer and resets internal state before hiding the message. A newer unrelated toast survives cloud cleanup. These distinct orders, including synchronous publication/cancellation failures, match the original implementation.

The existing zoom-warning timer is intentionally not reused: it schedules only positive durations and has different reset semantics. Toasts continue to pass every duration to the native timeout API. There is no new timer, request, dependency, disposal hook or reset policy; this extraction does not claim a speed improvement.

## Verification

The comparison suite compiles frozen stage-79 toast methods and the actual extracted owner/widget adapter with a deterministic clock. It covers strings and React nodes, default/unusual durations, replacement, progress-only dismissal, repeated use, zero handles, queued state updates, publication failures, cancellation failures and an already-queued old expiry. The existing point-cloud lifecycle suite binds the actual owner and retains its assertions. Fixture-only aliases expose relocated state for comparison without changing the production interface.

Validation: 2,711 passing portable tests / 206 files in both the workspace and clean installer-produced copy, zero failures or skips. Twenty-nine new cases compare frozen stage-79 toast behavior with the actual extracted module/widget adapter. Both existing point-cloud harnesses bind the real toast owner and retain their assertions. Strict module TypeScript, isolated ExB 1.20 module-graph build (zero errors/warnings), mutation checks for owner matching/replacement cancellation/expiry reset, BOM/CRLF comparison tests and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict module TypeScript and the isolated ExB 1.20 module-graph build pass with zero build errors/warnings. The user supplied a successful stage-79 isolated ExB 1.21 build on 21 November 2026 (7,672 ms, zero errors/warnings). That result does not establish browser acceptance or a stage-80 ExB 1.21 build.

## Installation

From the widget root:

```sh
node apply-toast-notifications-refactor.cjs --dry-run
node apply-toast-notifications-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-79 widget source is required. BOM/CRLF variations are accepted; unknown edits are refused before writing. Local documentation histories are preserved. Keep `.refactor-backups/toast-notifications-stage80` for rollback. Repeating installation verifies the installed files; `--uninstall` restores exact original bytes and protects later edits/corrupted backups. Uninstall newer stages first. No package installation, commit or push occurs.

## Host smoke and next work

Trigger a normal notification and check expiry; replace it with another notification. Start/clear point-cloud loading, then check that clearing cloud progress preserves a newer unrelated notification. Recheck Nearby thumbnail navigation from stage 79. Continue with another bounded coordinator responsibility after reviewing this checkpoint.
