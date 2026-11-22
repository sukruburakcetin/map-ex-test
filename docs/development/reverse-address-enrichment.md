# Reverse-address enrichment ownership (stage 78)

`src/features/imagery/ReverseAddressEnrichment.ts` owns the abort controller for optional image-address enrichment. `widget.tsx` binds live image/view access, the existing sequence background queue, address state publication and warning logging. `src/services/geocoding/reverseAddress.ts` remains responsible for the single HTTP lookup and address formatting.

`run(lat, lon)` cancels the previous lookup, captures the current image and view, and submits work through the existing queue. Results publish only while the queue signal is active and both captured identities still match. Old completions cannot detach a newer controller. Queue errors retain the existing warning boundary; service errors retain the service's existing fallback text.

`cancel()` aborts without detaching ownership. `clear()` aborts and detaches at reset/teardown. Both are reusable; the original five widget cancellation sites remain in their original order. This distinction intentionally preserves the previous implementation rather than changing cancellation policy during extraction.

There are no new dependencies, requests, timers, retries, prefetching or queue changes. The adapter is allocated once per widget. Performance has not been measured; this is a responsibility extraction, not a speed improvement.

## Verification

`tests/reverseAddressEnrichment.test.cjs` compares the frozen runtime method with the extracted implementation using controlled queue/transport completion. Cases cover stale image/view identity, cancellation, out-of-order completion, queue rejection, warning suppression, missing views and instance reuse. Five frozen lifecycle-body checks ensure only the original cancellation calls moved. Existing reverse-address service tests remain unchanged.

Validation: 2,652 passing portable tests / 204 files in both the workspace and clean installer-produced copy, zero failures or skips; strict extracted-module TypeScript and isolated ExB 1.20 module-graph build (zero errors/warnings). The fetched checkpoint independently passed 2,626 / 203. The prior handoff's extra 19 profiler cases were not tracked in origin `4064803`; current counts describe the fetched repository, not that separate workspace. The 26 added cases include five lifecycle-placement checks. Three method-only test harnesses now bind the extracted owner seam; their assertions remain unchanged. Mutation checks detect removed stale-image/abort guards and broken current-controller cleanup. Installer checks cover dry-run, repeat, BOM/CRLF, exact rollback, unknown/missing source, later edits, symlinks and corrupt backups.

The current stage passed the isolated ExB 1.20 module-graph build with zero errors/warnings. This does not establish a full host build or ExB 1.21 browser acceptance. On 21 November 2026 the user separately confirmed the preceding sequence-transition fix was applied and working; no wider visual matrix is inferred.

## Installer

From the widget root, use `apply-reverse-address-enrichment-refactor.cjs --dry-run`, then run it without arguments. It accepts the reviewed `4064803` widget source (stage 77 plus sequence-transition fix), allowing BOM/CRLF differences. Unknown source edits are refused before changes. Existing documentation history is retained by adding a stage note.

Backups live in `.refactor-backups/reverse-address-stage78`; keep that directory out of version control and retain it for rollback. Repeating installation verifies the installed files. `--uninstall` restores exact original bytes and refuses later edits or corrupted backups; uninstall newer stages first. No package installation, commit or push is performed.

## Next check

In ExB 1.21, open an image and inspect its address; switch images rapidly, switch active maps, clear selection and close/reopen the widget. Addresses should match the current image, with no stale updates after clearing. Continue with another bounded responsibility only after reviewing this checkpoint; do not add unrelated UX changes to the extraction.
