# Latest map click owns pending selection

The click callback previously acquired cancellation ownership only after awaited SDK/feature work. Two SDK hit tests could complete in reverse order and open the older image last. Stale results could also open a shared-note popup or open imagery after the widget closed.

A monotonic click revision is now captured before the first await. A click may commit only while its revision, active view and open-widget state still match. A newer click immediately aborts pending native detection and coverage-frame picks. This also applies when the new click is consumed by a route tool rather than imagery. Current shared-note, point-cloud, Places and detection priority is unchanged.

Guards run after SDK hit testing, native detection picking, sequence-ID metadata and regional nearby-frame resolution. Obsolete errors are discarded before logging a user-facing warning. Full cleanup and view-handler replacement invalidate revisions, preventing stale work from surviving close/reopen or reattachment to the same view. SDK hit tests themselves are not abortable; their late results are ignored. Already accepted viewer navigation retains its existing selection-request cancellation mechanism.

The patch adds no timers, downloads, listeners or animation work. It does not change hover presentation, cached previews, selected-sequence styles, coordinate lookup policy or image IDs.

## Validation

Four new real-callback regressions first reproduced reversed click order, stale note popup, post-close image opening and late detection consumption; all failed on the preceding version. After the fix, 117 targeted checks pass, including seven new click-race cases, accurate hover, faint-sequence retention, cache adoption, image-first loading and timing. Additional cases exercise an SDK rejection after a newer click, a sequence-ID transport that ignores abort, and a late regional frame result. Runtime source parses successfully. These are controlled asynchronous traces, not a live-host performance benchmark or full Experience Builder build.

## Install

Apply after `apply-faster-hovered-image-opening.cjs`, from the widget root:

    node apply-latest-click-ownership.cjs

Rebuild/reload Experience Builder. Use `--dry-run` to check compatibility without source writes. Tests/builds are not run by the installer. The standalone uninstaller restores this patch only and retains the earlier hover crash fix and faster-opening changes. Conflicting source edits are refused.
