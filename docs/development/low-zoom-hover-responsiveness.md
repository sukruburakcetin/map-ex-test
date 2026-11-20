# Low-zoom hover responsiveness

The user's live exploration captures showed quick median pulses but occasional multi-second coverage waits. At low zoom, small movements can resolve different representative/nearest captures, so subsequent exploration is not an identical-image cache benchmark. This change improves feedback and interactive queue dispatch without assuming repeatable targets or fabricating a fast selected image.

## Existing selection and request contracts retained

The representative picker still examines all necessary bounded candidate tiles and applies original filters, radius, vertex/segment order and tie policy before publishing the actual pulse. Existing raw/index/nearest-frame cache ownership and cancellation remain. Cache budgets, tile concurrency, query fields, decoded-thumbnail history, image opening, yellow bearing readiness and cyan panorama pointer are unchanged. There is no speculative prefetch, approximate early winner or increased number of requests. A slow unseen remote tile can still take seconds.

## Earlier honest feedback

`PendingCoverageHover` is a feature owner for a neutral three-dot pill beside the pointer. It is active only for unresolved low-zoom coverage picking and uses the existing DelayedHoverStatus publisher. It creates no timer, RAF or animation; it makes no geographic/capture claim and is passive/aria-hidden alongside the existing localized status. View/closed/form/abort ownership prevents revival, and edge clamping keeps it inside the map. The owner hides the pill before the accepted pulse, or on leave/click/feature precedence/view change/cleanup. Old completion tokens cannot hide newer work.

Fast lookups completing before an initially idle delayed status create no element. An already-visible shared loading status can show the hint immediately for a new pending pick; no separate dwell is added. The DOM element is reused until cleared. This changes perceived feedback during a wait, not the network duration.

When the existing 150 ms details dwell expires and the actual regional/nearby frame is still unresolved, the card shows the existing localized loading state before the lookup is awaited. This skeleton contains no invented creator, date, image or direction. Known completed hints avoid it. A missing identity becomes unavailable rather than leaving an indefinite loading placeholder. Existing metadata/thumb ownership and stale response guards still apply.

## Fair hover metadata priority

BackgroundRequestQueue keeps normal FIFO by default. Only hover-card metadata passes the new hover priority through runSequenceBackground. Promoted queued work takes the next available slot, without cancelling or preempting running jobs. Physical concurrency remains the existing one during playback/two while paused and existing pause behavior remains. If both classes wait, one promoted hover is followed by a normal job, retaining FIFO order within each class. Cancelled queued work makes no request, and aborted physical work holds its slot until settlement as before. Foreground image opening remains outside this optional queue. Default normal dispatch follows its original shift path; priority insertion happens on hover enqueue.

## Evidence and limits

Four new queue cases verify promotion, fairness, queued cancellation and unchanged max concurrency. Seven pending-owner cases verify no fast DOM allocation, neutral passive/static rendering, abort and token ownership, teardown, view gating, invalid points and edge clamping. Three production updateTurboHover cases verify the skeleton appears before deferred frame identity, unavailable settlement and explicit hover metadata priority. All previous tests remain included; no expectations were discarded.

Portable workspace: **2,481 passing tests, 196 files**, no skips. The exact installed runtime payload has **2,462 passing tests in 195 files**; standalone profiler-only files/tests are not copied by this installer. Strict TypeScript passes for the new owner and scheduler, with widget/owner/queue syntax and source hygiene checks. Chromium tests the real delayed-status/feedback/card modules and confirms zero requests in its controlled pending/skeleton fixture. This is not proof of a faster live API response. An ExB 1.21 build/browser check and a subsequent low-zoom exploration capture remain necessary.

## Reversible installation

Requires the preceding hover responsiveness optimization. From widget root:

```sh
node apply-low-zoom-hover-responsiveness.cjs --dry-run
node apply-low-zoom-hover-responsiveness.cjs
# Reverse this update only:
node apply-low-zoom-hover-responsiveness.cjs --uninstall
```

Preflight actual widget/queue/tests and prerequisite modules. Unknown edits are preserved. LF/BOM/CRLF and local documentation history are supported; exact original bytes are backed up outside the widget. Rollback checks installed/backup hashes and refuses later edits. Reverse newest update first. Restart/hard-refresh. Check slow coverage, unresolved regional identity, cached hints, feature/places precedence, leave/click, view transfer/minimize/fullscreen and normal image/playback behavior. Compare feedback appearance and request completion separately; don't interpret low-zoom warm labels as same-image cache hits.
