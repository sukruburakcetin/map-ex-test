# Zoom warning timer — stage 76

ZoomWarningTimer owns the existing single warning timeout. Widget keeps the three distinct state-publication callbacks, its original default duration, forwarding methods and lifecycle call sites. Widget is 18 lines shorter. No warning content or locale keys change.

Showing first cancels a pending timeout, publishes the new message and resets its action/help state, then schedules only when duration > 0. Expiry clears only the message, preserving any action/help state set by other warning presentation. Manual clear cancels and resets message/action/help. Unmount calls resource-only cancel at the same end-of-cleanup position without publishing state. Cancellation is idempotent and reusable, with the original truthiness and callback order preserved. No permanent disposed policy or late-event behavior change is added. No new request, timer, animation or performance claim.

Twenty tests execute frozen original and current widget/owner bindings with a deterministic clock and compare timer/state traces: default and explicit delays, persistent warnings, replacements, expiry, action preservation, repeated clear/cancel and reuse. The teardown boundary is checked separately. All existing suites remain. Strict TypeScript checks the standalone owner; ExB semantic typing/build and live browser acceptance are separate.

Requires stage 75. From widget root:

```sh
node apply-zoom-warning-refactor.cjs --dry-run
node apply-zoom-warning-refactor.cjs
# Undo only this stage:
node apply-zoom-warning-refactor.cjs --uninstall
```

Source fingerprints are checked before writes. Exact original bytes and local documentation history are preserved; unsupported source edits and rollback over later changes are refused. Backups are outside the widget. Reverse newest first, restart/hard-refresh, build in ExB 1.21 and smoke timed/persistent warnings, warning actions, close/reopen and normal hover/image opening. Continuation does not establish host installation/build acceptance.
