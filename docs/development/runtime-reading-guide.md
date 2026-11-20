<!-- sequence-transition-fix -->

## Fix — retire the previous sequence highlight at image-selection start (20 November 2026)

Paused refactoring for the reported transition mismatch: marker/cone cleared at selection start, but updateNativeSequenceSelection only cancelled pending highlight work while opening. Already-painted blue sequence graphics/layers remained until image confirmation selected the new sequence. loadSequenceById now clears the selected highlight role synchronously when Turbo navigation switches sequence IDs, alongside existing marker/cone clearing and before any await. Same-sequence navigation retains its valid highlight and fast route reuse.

Uses the existing select(null) owner operation without awaiting it. 2D removes selected presentation and cancels pending geometry; 3D hides cached selected layers. Geometry caches, base coverage and hover role remain; no style reload, prefetch, retry, new request or added opening wait. Existing failure/cancellation/readiness lifecycle restores the prior selection. No general legacy-overlay behavior change is claimed.

Eight new regressions cover synchronous pre-dispatch clearing, same-sequence retention, non-awaited clearing, failure/cancel restoration, late geometry and 2D/3D cache reuse. Existing assertions retained; two fixture owners are now bound. Workspace: 2,645 passing portable tests / 204 files, zero skipped. Installed payload: 2,626 / 203 files (19 standalone-profiler cases excluded). Syntax, hygiene, mutation and reversible installer checks pass. ExB 1.21 live visual/build acceptance remains pending; no measured latency improvement claimed.

Delivery: apply-sequence-transition-fix.cjs, requires stage 77. --dry-run/apply from widget root; exact backups and local documentation history retained, unknown edits refused. --uninstall reverses only this fix, newest first. No commit/push/deployment. Next host check: switch between different sequences in 2D/3D, retry/cancel/failure, rapid A/B/C clicks, same-sequence point changes and cold/warm image opening. Resume refactoring from this fixed checkpoint. See docs/development/sequence-transition.md.

<!-- coverage-zone-stage77 -->

## Stage 77 — coverage zone properties (20 November 2026)

Extracted coverageZoneProperties into src/features/coverage/coverageZoneProperties.ts. Widget retains guards, prior-zone clearing, Graphic construction, marker assignment, owned resource attachment and reference publication; it is 28 lines shorter. The original closed rectangle/wkid 4326, coordinate order, fill/outline colors, 2D/3D opacity/width and fresh nested property objects are preserved. No bounds normalization, validation, request, timer, layer, loop or cleanup change. No measured speedup claimed.

Twenty-three cases compare frozen original/current construction and ownership traces across 2D/3D extents, unusual numeric bounds, missing context and failure boundaries; fresh-property tests prevent cross-draw sharing. Workspace: 2,637 passing portable tests / 204 files, zero skipped. Installed payload: 2,618 / 203 files (19 standalone-profiler cases excluded). Strict module TypeScript, syntax, hygiene, mutation and reversible installer checks pass. Stage 76 host installation/acceptance is not inferred from continuation. ExB 1.21 build/browser acceptance remains pending.

Delivery: apply-coverage-zone-refactor.cjs, requires stage 76 warning timer source. --dry-run/apply from widget root; exact backups and local documentation histories preserved, unknown edits refused. --uninstall reverses this stage only, newest first. No commit/push/deployment. Next host smoke coverage-analysis region drawing, replacement/clear and 2D/3D styling, then inspect another bounded coordinator responsibility. See docs/development/coverage-zone-properties.md.

<!-- zoom-warning-stage76 -->

## Stage 76 — zoom warning timer (20 November 2026)

Extracted ZoomWarningTimer into src/features/coverage/ZoomWarningTimer.ts. Widget keeps warning state publication, the default duration and show/clear forwarding methods; timer ownership and resource-only teardown cancellation move into the feature. Widget is 18 lines shorter. Existing positive-duration scheduling, persistent nonpositive warnings, replacement cancellation, automatic message-only expiry, manual action/help reset and reusable cancellation are preserved. No new request, timer, animation or hover behavior. No speed improvement claimed.

Twenty new tests compare frozen original/current timer/state traces for default/explicit durations, persistence, replacement, expiry, action preservation, repeated clear/cancel and reuse; teardown checks retain cancellation at the original cleanup boundary. Workspace: 2,614 passing portable tests / 203 files, zero skipped. Installed payload: 2,595 / 202 files (19 standalone-profiler cases excluded). Strict module TypeScript, syntax, hygiene, mutation and reversible installer checks pass. Stage 75 installation/host acceptance is not inferred from continuation. ExB 1.21 build/browser acceptance remains pending.

Delivery: apply-zoom-warning-refactor.cjs, requires stage 75 image-download source. --dry-run/apply from widget root; exact backups and local documentation histories preserved, unknown edits refused. --uninstall reverses this stage only, newest first. No commit/push/deployment. Next host smoke timed/persistent warnings, warning actions, image opening and close/reopen, then inspect another bounded coordinator responsibility. See docs/development/zoom-warning-timer.md.

<!-- image-download-stage75 -->

## Stage 75 — image file download (20 November 2026)

Extracted downloadImageFile into src/features/imagery/downloadImageFile.ts. Widget keeps image/state capture, loading state, localized JSX feedback and error handling; it is 24 lines shorter. Helper owns the existing metadata/image fetches, optional UTC date filename, Blob URL, anchor click/removal and URL revocation. Missing image URL returns false to the existing warning branch. Strict ID matching, date truthiness, request options and failure behavior remain unchanged. No additional request, retry, preload, timer or hover work; no speed improvement claimed.

Twenty-one tests compare frozen original/extracted full widget workflows including state/toast/error/fetch/DOM traces, filenames and changed selection during download. Chromium checks real Blob download bytes, filename, URL revocation, removed anchor, missing-image result and zero remote requests. Workspace: 2,594 passing portable tests / 202 files, zero skipped. Installed payload: 2,575 / 201 files (19 standalone-profiler cases excluded). Strict module TypeScript, syntax, hygiene, mutation and reversible installer checks pass. Stage 74 host acceptance is not established by continuation. ExB 1.21 build/browser acceptance remains pending.

Delivery: apply-image-download-refactor.cjs, requires stage 74 target-selection source. --dry-run/apply from widget root; exact backups and local documentation history preserved, unknown edits refused. --uninstall reverses this stage only, newest first. No commit/push/deployment. Next host smoke image download, dated filenames, unavailable-image feedback and ordinary hover, then inspect another bounded coordinator responsibility. See docs/development/image-file-download.md.

<!-- zoom-target-stage74 -->

## Stage 74 — zoom-to-images target (20 November 2026)

Extracted zoomToImagesTarget to src/features/navigation/zoomToImagesTarget.ts. Widget retains live state bindings and the existing ArcGIS forwarding method and is 15 lines shorter. Selected-image/current-sequence/fallback/graphic precedence, valid-coordinate bounds, sky-to-ground sampling at 0.5/0.65/0.8, view.center fallback, zoom<14 representative lookup, 32..160 radius clamp and failure fallback are preserved. Stable adapter allocated once per widget; no new request, timer, prefetch, hover work or concurrency change.

Thirty-one cases compare frozen original/extracted outcomes and map/projection/pick traces, plus widget argument/promise/adapter identity checks. Workspace: 2,573 passing portable tests / 201 files, zero skipped. Installed payload: 2,554 / 200 files (19 standalone-profiler cases excluded). Strict module TypeScript, syntax, hygiene, mutation and reversible installer checks pass. Stage 73 host acceptance is not inferred from a continuation request. ExB 1.21 build/browser remain pending; no measured speedup claimed.

Delivery: apply-zoom-target-refactor.cjs, requires stage 73 diagnostics source. --dry-run/apply from widget root; exact backups and local documentation history preserved, unsupported edits refused. --uninstall reverses only this stage, newest first. No commit/push/deployment. Next host smoke zoom-to-images with/without a selected image, tilted 3D sky, missing coverage and view switching, then inspect another bounded coordinator section. See docs/development/zoom-to-images-target.md.

<!-- sequence-diagnostics-stage73 -->

## Stage 73 — sequence diagnostics lifecycle (20 November 2026)

Extracted SequenceDiagnostics into src/features/imagery/SequenceDiagnostics.ts. This owner holds the optional browser registry entry and PerformanceObserver; widget keeps snapshot assembly, stable callbacks and two forwarding methods. Widget is 9 lines shorter. Debug/closed/no-window gates, registry identity checks, long-task capability detection, buffered:false observation, live snapshot/reset callbacks and repeated cleanup behavior are preserved. No new network, timers or subscriptions; debug-off creates no observer.

Nineteen new cases compare frozen original/extracted registry and observer traces, supported/unsupported environments, resets, resync, repeated cleanup and replacement/other-widget preservation; a widget integration case verifies current gates and lazy callbacks. Workspace: 2,542 passing portable tests / 200 files, zero skipped. Installed payload: 2,523 / 199 files (19 standalone-profiler cases excluded). Strict module TypeScript, syntax, hygiene, mutation and reversible installer checks pass. Stage 72 host acceptance is not established by a continuation request. ExB 1.21 build/browser checks remain pending; no measured speedup claimed.

Delivery: apply-sequence-diagnostics-refactor.cjs, requires stage 72 coverage transport source. Use --dry-run/apply from widget root; exact backups and local documentation histories retained, unknown edits refused. --uninstall reverses only this stage, newest first. No commit/push/deployment. Next host smoke debug toggle, close/reopen, cleanup and hover, then inspect another bounded coordinator responsibility. See docs/development/sequence-diagnostics.md.

<!-- coverage-transport-stage72 -->

## Stage 72 — coverage tile transport (20 November 2026)

Extracted fetchCoverageTile to src/features/coverage/coverageTileTransport.ts. Widget retains shared request/token/cache ownership, a stable adapter and forwarding method; widget.tsx is 28 lines shorter. The original two-attempt budget, 200-ms delay, HTTP handling (204/404 empty), body reads, abort/token checks and metrics finish/cancel order are preserved. No prefetch, cache/concurrency change, extra retry or fetch is introduced; adapter closures are allocated once per widget, not per tile.

Twenty-two differential tests compare the frozen original and extracted outcome/request/retry/cache/metrics traces. Existing sequence runtime tests keep all assertions; only the extracted module and stable adapter bindings are supplied by the fixture. Workspace: 2,523 passing portable tests / 199 files, zero skipped. Installed payload: 2,504 / 198 files (19 standalone profiler cases excluded). Strict module TypeScript, syntax, hygiene, mutation checks and reversible installer validation pass. Stage 71 installation/host acceptance is not inferred from a continuation request. ExB 1.21 host build/browser remain pending; no measured speedup is claimed.

Delivery: apply-coverage-transport-refactor.cjs; requires stage-71 coverage readiness source. --dry-run/apply from widget root; exact backups and documentation histories preserved, unknown edits refused. Reverse with --uninstall, newest first. No commit/push/deployment. Next: host smoke cold/warm hover, cancellation and view/token transfer, then inspect another bounded coordinator section. See docs/development/coverage-tile-transport.md.

<!-- coverage-readiness-stage71 -->

## Stage 71 — coverage readiness (20 November 2026)

Resumed bounded widget refactoring after user-positive coverage-first startup feedback. Extracted waitForCoverageReady into src/features/coverage/coverageReadiness.ts; widget keeps ArcGIS view/layer selection and a forwarding method and is 19 lines shorter. The original 15-second timeout, pre-abort behavior, one updating watcher, immediate-ready check, error propagation and settle-once cleanup are preserved. No added request, timer, subscription, prefetch or UI change. Coverage-first ordering, hover responsiveness and cone fixes remain unchanged.

Thirteen new tests compare original/extracted results and timer/listener/watcher call order across readiness, updating, pre-abort, pending/watching cancellation, timeout, layer failure and late completion; the widget forwarding case preserves argument and promise identity. Portable workspace: 2,501 passing tests / 198 files, zero skipped (includes 19 diagnostic-profiler tests); installed payload: 2,482 / 197 files. Strict module TypeScript, syntax, hygiene and reversible installer checks pass. ExB 1.21 host build remains pending; no measured speedup is claimed.

Delivery: apply-coverage-readiness-refactor.cjs, requires coverage-first-startup source. Preflight actual source using --dry-run, apply from widget root, restart/hard-refresh. Exact backups and local history are preserved; unknown source edits are refused. --uninstall reverses this stage only, newest first. No commit/push/deployment. Next: host smoke ready coverage, quick view switches, cancellation and retry, then inspect another bounded coordinator responsibility. See docs/development/coverage-readiness.md.

<!-- low-zoom-hover-responsiveness -->

## Low-zoom hover responsiveness (20 November 2026)

Implemented a bounded response to the user's low-zoom exploration captures, without assuming repeatable identical-image hover. Existing raw/index caches already share work; no early approximate winner, increased cache budgets, speculative tile prefetch or changed tie/filter/radius policy is introduced. Remote coverage latency itself remains external; no claim that a 4–5 second tile now downloads instantly.

Three changes: (1) unresolved low-zoom picks can show a neutral passive three-dot hint driven by the EXISTING delayed hover status, without claiming an image/location; finishes hide it before the real pulse, and leave/click/view/feature ownership/cleanup clears it. It uses no own timer/RAF/animation, is offset/clamped inside the map, and is created only when delayed status is visible. (2) after the EXISTING details dwell, an unresolved representative/nearby-frame lookup shows a localized loading card before awaiting identity; no image/date is invented. Known cached preview IDs keep their immediate path; unavailable identities settle correctly. (3) hover metadata is promoted ahead of queued optional background jobs within the existing 1/2 physical concurrency; active work is not preempted, normal FIFO remains default, and a waiting normal job gets a turn after a hover promotion to prevent starvation.

Validation: **2,481/2,481 portable workspace tests, 196 files, zero skipped** (includes 19 standalone-profiler tests). Installed runtime payload: **2,462 tests, 195 files**, excluding diagnostic-only profiler files not shipped by this installer. Added four queue, seven pending-feedback and three actual metadata/identity callback cases; existing request/cancellation/selection suites retained. Chromium feedback fixture confirms no new requests, no fast-path hint from idle status, delayed neutral reveal, placeholder/no invented image, unavailable result and cleanup. Strict owner/queue TypeScript, syntax and repository hygiene pass. Target ExB 1.21 build/browser and latency measurements remain pending.

Delivery: `apply-low-zoom-hover-responsiveness.cjs`, requires hover-responsiveness-optimization (not an installation of the standalone DevTools profiler). Dry-run from widget root, then apply. Preserves exact backups and local documentation history, refuses unknown source/test edits; `--uninstall` reverses only this update, newest first. No commit/push/deployment. Next host check: low-zoom traversal with slow tiles, cold regional lookup and cached revisits, object/places precedence, leave/click/view switching and image opening; distinguish earlier feedback/queue dispatch from actual network completion. See docs/development/low-zoom-hover-responsiveness.md.

<!-- hover-responsiveness-optimization -->

## Hover responsiveness optimization (20 November 2026)

Audited picking, pulse rendering, details dwell, metadata, thumbnail presentation and localization. Preserved the zero-delay pointer coalescer, immediate coverage feedback, feature/places precedence, 150 ms cold-details dwell, cancellation, shared nearest-frame lookup and metadata limits. Identified two avoidable costs: settled pulse projection/position writes on every RAF, and fresh thumbnail elements/loading gaps on exact decoded revisits.

`HoverAnchorProjection` caches only a settled, non-updating/non-interacting view's latest geometry/view/camera/extent/zoom/rotation/size projection. Moving or unknown states always project live; geometry/coordinate/view changes and invalid projections cannot borrow an anchor. The actual pulse still runs at its existing cadence; unchanged anchor display/position values are not rewritten; numeric pixel comparison also avoids CSS fractional-value serialization churn. Controlled original/current runtime comparison: **600 stationary ticks, 600 → 1 projections and 1,198 fewer left/top writes**, with equal RAF counts. Motion retains 600 projections/600 ticks. These are work counts, not ExB FPS measurements.

Hover cards retain up to **four already-loaded small thumbnails per host** (max 256×512 each), keyed by exact image ID plus URL. Fresh metadata is still required; missing/expired metadata cannot pull pixels by ID alone. No prefetch or pending-request history. Completed exact revisits display synchronously without setting src again. Oversized/failed entries are not retained; LRU eviction and cleanup release callbacks, and widget cleanup clears history. Existing same-image pending retention, stale-result guards, localization and failure retry remain. Yellow cones, panorama pointer and click/image-opening logic are unchanged.

Chromium comparison: A/B/A image-source writes **3 → 2**, revisit source writes **1 → 0**, revisit pixels asynchronous → synchronous. Forty additional warm switches: **zero source writes**, decoded pixels present. Seven existing Chromium compatibility cases pass. Routes are controlled fixtures; these results do not measure Mapillary latency, total ExB hover time or FPS.

Validation: **2,448/2,448 portable tests in 194 files, zero skipped**, including 21 projection/runtime cases and eight decoded-revisit/ownership/eviction cases. Strict TypeScript passes for new projection helper and hover card graph; syntax/repository hygiene pass. No widget dependencies, network fields, dwell reductions, timers, listeners or loops added. There is a small bounded decoded-image memory trade-off, not an absolute zero-cost guarantee. ExB 1.21 build/device/profile acceptance still pending.

Delivery: `apply-hover-responsiveness-optimization.cjs`, requires the panorama-hover-pointer update. Run `--dry-run` then apply from widget root; exact backups/history preserved and unexpected edits refused. Reverse only this update with `--uninstall`, newest first. No commit/push/deployment. Next host check: first/warm hover, A/B/A, rapid movement, regional nearest picks, map motion/resize, RTL, fullscreen and minimize/reopen; capture Chrome Performance/Network traces before deciding whether picking or cold network dominates. See `docs/development/hover-responsiveness.md`.

<!-- panorama-hover-pointer -->

## UI — panorama hover ring with capture-direction pointer (20 November 2026)

User requested this change **only while hovering**. The cyan 360-degree panorama ring now includes a small outward cyan pointer for the capture's computed compass bearing, falling back to original compass metadata through the existing helper. The circle stays round; only the pointer rotates with the map projection. A missing bearing or failed projection hides only the pointer. Perspective wedges and the yellow current-image cone/readiness remain unchanged.

Performance: no new requests, timers, listeners, animation loops, metadata fields or image-opening waits. Reuses the existing hover clock and orientation cache; a known panorama bearing uses one direction projection when cache invalidates, in 2D and 3D. Settled cached updates do no projections. Ring-only panoramas still do zero. No measured frame-rate guarantee is claimed.

Validation: **2,419/2,419 portable tests across all 192 files, zero skipped**. Three additional sector cases cover 2D/3D pointer direction/cache reuse, missing metadata, projection failure/recovery and element reuse. Existing ring-only, perspective, bearing readiness and image-first suites remain included; tests previously assuming all panoramas are direction-free now use missing metadata explicitly. Sector strict TypeScript and repository hygiene pass. Target ExB 1.21 build/browser confirmation remains pending.

Delivery: `apply-panorama-hover-pointer.cjs`, after `apply-cone-readiness-and-panorama-fix.cjs`. Run `--dry-run` then apply from widget root. Source/prerequisite fingerprints are checked before writes; preserves local edits/history and exact backups. Reverse only this update with `--uninstall`, before reversing older updates. No commit/push/deployment. Next: check panorama hover at low zoom, map rotation and 3D tilt, perspective switching and missing-bearing previews; yellow cone behavior should be unchanged. See `docs/development/panorama-hover-pointer.md`.

<!-- cone-readiness-panorama-fix -->

## Fix — current-image cone readiness and panorama indicator (20 November 2026)

The earlier metadata-only preview fix did not address the live yellow cone's startup readiness or panorama ambiguity. The SDK 4.1.2 source confirms image and bearing events are separate, bearing events are audited at 100 ms and near-identical headings may suppress an event. The yellow cone now requires a finite bearing scoped to the current viewer/image. `CurrentImageBearing` reads the SDK's local cached bearing in a microtask after the accepted image notification; stale image/viewer/revision results cannot publish. Selection of another image invalidates old readiness; the same confirmed image reuses it; unresolved regional nearest picks invalidate it even when the representative ID matches. `moveTo()` resolution alone never confirms rendering. The old unscoped load-time bearing query is removed, and delayed event payloads cannot overwrite confirmed heading. Shared-link heading remains explicit after image confirmation.

Panoramic hover previews now show a cyan 360-degree ring, including when compass metadata is absent. Perspective previews retain their directional wedge. This supersedes the previous panorama capture-direction wedge policy; the ring makes no claim to match the current viewer direction. It uses the existing pulse update/anchor, has no own animation and performs zero orientation projections.

Performance: no added network requests, timers, RAF loops, event listeners, image-opening waits or metadata fields. Added work is a bounded local cached SDK read per changed image/existing bearing notification, deferred independently of opening and coalesced while pending; duplicate image events reuse readiness. The existing cone redraw scheduler is reused. Camera transitions may still rotate a confirmed cone to follow the actual rendered camera; the fix suppresses unconfirmed default/previous-image headings, not genuine camera motion. No blanket frame-rate guarantee or measured speed improvement is claimed.

Validation: **2,416/2,416 portable tests across all 192 files, zero skipped**, including 31 new readiness/runtime cases and three added panorama cases. Negative controls for image ownership, stale snapshots, after-frame sampling and the central cone gate each fail. New owner strict TypeScript and widget/module syntax pass; repository hygiene passes. Existing image-first selection, cancellation, point-cloud and hover suites remain included. Host build/browser confirmation remains pending; stages 66–67 user acceptance and the isolated ExB 1.21.0 stage-65 build remain separate evidence.

Incremental delivery: `apply-cone-readiness-and-panorama-fix.cjs`, requires stage 70 and the prior preview fix. Run `--dry-run`, then apply from widget root. Exact backups/history are preserved, unsupported edits refused; `--uninstall` reverses only this fix, before older updates. No commit, push or deployment. Next host checks: fresh low-zoom load, rapid A/B clicks, same-image reselection, unresolved regional nearest picks, perspective/panorama hovers, rotate viewer, 2D/3D transfer, fullscreen, minimize/reopen, shared-link heading and browser network/performance comparison. See `docs/development/cone-bearing-readiness.md`.

<!-- street-bearing-stage70 -->

## Stage 70 — point-cloud street bearing (20 November 2026)

Resumed bounded refactoring after the panorama preview-bearing fix, preserving that fix unchanged. Moved the sequence street-direction algorithm into `src/features/point-cloud/streetBearing.ts`. `widget.tsx` keeps image/context selection and a forwarding method and is **29 lines shorter**. No change to corridor/ring callers, the 15-metre look-ahead/backward search, neighbour fallback, ID comparison or live-bearing fallback.

Validation: **2,382/2,382 portable tests across all 191 files, zero skipped**, including 23 new original-versus-extracted cases with 250 deterministic generated routes. Comparisons include distance/bearing call order/count and input immutability, not only results. Threshold, backward-orientation and immediate-neighbour mutations each fail. Strict TypeScript passes for the new module and its imported dependency graph; widget/module syntax and repository hygiene pass. No extra requests, timers, subscriptions, route copies or geometry calculations; no measured speed improvement claimed.

Delivery: `apply-street-bearing-refactor.cjs`, requires stage 69 plus the preview-bearing startup fix. Preflight actual source with `--dry-run`, then apply from widget root. Preserves local edits/history and exact-byte backups; reverse with `--uninstall`, newest update first. No commit, push or deployment.

Host evidence remains separate: stages 66–67 were user-tested. Installation/host acceptance of stages 68–69, preview-bearing fix and stage 70 is not confirmed by a continuation request. The user-verified isolated ExB 1.21.0 stage-65 build remains baseline evidence; whole-project types and production packaging remain separate. Next: build/smoke stage 70 in ExB 1.21, checking point-cloud corridors/rings at route middle/end and preserving the fresh-load panorama fix. See `docs/development/street-bearing.md`.

<!-- preview-bearing-startup-fix -->

## Fix — panorama hover bearing at startup (20 November 2026)

Paused refactoring to fix the user-reported low-zoom fresh-load bearing mismatch. Panorama hover cones used the shared live viewer heading, initialized to 0 degrees and later updated asynchronously, even for another image. Preview direction now uses the preview image's computed compass angle, falling back to original compass angle; without valid metadata it clears the directional decoration. The live viewer cone still follows viewer heading. Panorama thumbnails remain full panoramas, not heading-cropped views.

Performance contract: no new requests, timers, subscriptions, metadata fields, waits or rendering loops. Existing cold dwell/enrichment and immediate warm-cache paths remain unchanged. Five new runtime tests failed before the fix and pass afterward; they cover 2D/3D low zooms, cold metadata and warm revisits with changing viewer heading. Five additional helper cases cover zero, normalization, compass fallback and missing metadata. Full portable validation: **2,359/2,359 tests in all 190 files, zero skipped**. Helper strict TypeScript, widget/helper syntax and repository hygiene pass. No browser reproduction/host acceptance of this fix yet; this is source diagnosis plus controlled regression evidence.

Incremental installer: `apply-preview-bearing-startup-fix.cjs`, requires stage 69 source. Run `--dry-run` then apply from widget root; rollback with `--uninstall` before reversing older stages. Local edits/history and exact-byte backups are preserved. No commit, push or deployment. General user acceptance remains recorded for stages 66–67; stages 68–69 installation/host testing is unconfirmed.

Next host check: fresh-load a low-zoom panorama hover, move away/revisit, open/rotate another image and repeat. Preview capture bearing should remain stable; live viewer cone should rotate as before. Verify missing-bearing panoramas show no invented northward cone. See `docs/development/preview-bearing-startup.md`.

<!-- sequence-paint-stage69 -->

## Stage 69 — sequence paint scheduling (20 November 2026)

Moved the two-animation-frame presentation wait into `src/features/imagery/sequencePaint.ts`. `widget.tsx` keeps the same method signature and callers and is **8 lines shorter**. Entry visibility checks, AbortError shape, two-frame ordering, pending-frame cancellation and listener cleanup retain their original behavior. No additional frames, timers, requests, UI or dependencies.

Validation: **2,349/2,349 portable tests across all 190 files, zero skipped**, including 12 new comparisons against the frozen stage-68 method. Negative controls for frame count, visibility, pending-frame cancellation and abort-listener cleanup each fail. Strict TypeScript passes for the helper; syntax/transpilation and repository hygiene pass. The existing sequenceV6Runtime harness now imports/injects the extracted helper; no assertions or expectations were removed and existing fixtures were unchanged.

Stages 66–67 remain user-tested (“all good, I've tested”). Stage 68 installation/host acceptance has not been confirmed; do not infer it from “next.” Stages 68–69 still need target ExB 1.21 build/browser checks. The recorded isolated ExB 1.21.0 stage-65 build remains baseline evidence; whole-project semantic typing and production packaging remain separate.

Incremental delivery: `apply-sequence-paint-refactor.cjs`, after stage 68. From widget root run with `--dry-run`, then without flags. Checks actual stage-68 widget, required owner modules and existing harness before writes; preserves local edits/history and exact-byte backups. Rollback with `--uninstall`, newest stage first. No commit, push or deployment.

Resume: verify image selection and hover-highlight timing, cancellation/view transfer and hidden-document behavior in ExB 1.21. Then inspect another bounded feature responsibility. See `docs/development/sequence-paint.md`.

<!-- stationary-url-bindings-stage68 -->

## Stage 68 — stationary URL bindings (20 November 2026)

Acceptance update: the user reported **“all good, I've tested”** after stages 66–67. Record those changes as user-tested; the older pending general host-check statements below are historical. No additional compiler log or detailed device/feature matrix was supplied, so do not invent those details. The earlier user-verified isolated ExB 1.21.0 stage-65 build evidence remains recorded.

Extracted the persistent stationary URL watch handle into `src/features/navigation/StationaryUrlBindings.ts`. `widget.tsx` is another **23 lines shorter**. Early old-view detachment and late startup registration stay at their original positions. Stationary/view guards, pulse-before-fly-in ordering and live image-ID reads are unchanged. No UI, timers, requests or dependencies added.

Validation: **2,337/2,337 portable tests across all 189 files, zero skipped**, including 19 new trace comparisons against the frozen stage-67 code. Four negative controls (stale-view guard, stationary gate, fly-in suppression and watcher removal) each fail. The new module passes strict TypeScript; widget/module syntax/transpilation and repository hygiene pass. Stage 68 still needs its own ExB 1.21 host build/browser check; whole-project semantic types and production packaging remain separate.

Delivery: `apply-stationary-url-bindings-refactor.cjs`, incremental after stage 67. Run from widget root with `--dry-run`, then without flags. Preflight requires actual matching stage-67 widget and stage-66/67 owner modules; local edits are preserved. Keep sibling backups; `--uninstall` reverses this stage only, refusing later edits. Reverse stages newest first. No commit, push or deployment.

Resume: verify stationary URL updates with/without an image, moving/fly-in suppression and 2D/3D view transfer in ExB 1.21. Then inspect the next bounded coordinator section. See `docs/development/stationary-url-bindings.md`.

<!-- turbo-view-bindings-stage67 -->

## Stage 67 — Turbo view bindings (20 November 2026)

Extracted the stationary and zoom/rotation watcher handles into `src/features/coverage/TurboViewBindings.ts`. `widget.tsx` keeps Turbo activation, style invalidation and the existing preview adapter, and is another **23 lines shorter**. Binding and full-removal cleanup remain in the original lifecycle positions.

Preserved the 300 ms debounce, trimmed username-over-config precedence, 2D zoom/rotation versus 3D zoom subscriptions, stale-view checks and pulse/preview ordering after awaited coverage. Deliberately retained existing queued/in-flight completion semantics: this extraction does not introduce debounce cancellation or an extra post-await guard. No UI, requests or dependencies added.

Validation: **2,318/2,318 portable tests across all 188 files, zero skipped**, including 26 new original-versus-extracted trace cases. Negative controls for stale-view guarding, filter precedence, debounce interval and handle removal each fail. Strict TypeScript passes for the new module; syntax/transpilation and repository hygiene checks pass. Existing stage-66 source/tests/docs remain preserved beneath this update. The user-verified isolated ExB 1.21.0 build applies to stage 65; stages 66–67 still need a fresh target-host build/browser check. Whole-project semantic typing and production packaging remain separate.

Incremental delivery: `apply-turbo-view-bindings-refactor.cjs`, **requires stage 66**. From widget root run with `--dry-run`, then without flags. Keep sibling backups; `--uninstall` restores this stage only and refuses later edits. Windows checkpoint-v3 and stage-66 application have not been confirmed here. The preflight checks actual stage-66 runtime source rather than assuming installation. No commit, push or deployment.

Next: perform target ExB 1.21 build and smoke checks for 2D/3D zoom/rotation, stationary coverage, creator-filter precedence, view replacement and teardown. Then inspect another bounded `onActiveViewChange` section. See `docs/development/turbo-view-bindings.md`.

<!-- view-zoom-bindings-stage66 -->

## Stage 66 — view zoom bindings (20 November 2026)

Extracted zoom/camera watcher ownership and the existing 600 ms URL debounce into `src/features/navigation/ViewZoomBindings.ts`. `widget.tsx` retains the host callbacks and calls bind/clear at the original lifecycle positions; it is 78 lines shorter. No UI, requests, debounce intervals, quality thresholds or camera semantics changed.

Checkpoint provenance: inspected actual remote commit `0264ff5`, containing stage 65. The clean stage-65 portable baseline was independently rerun: **2,265/2,265 tests, all 186 files, zero skipped**. The user-verified isolated ExB **1.21.0** baseline build (zero errors/warnings) remains valid baseline evidence. The checkpoint **v3 installer and its Windows application evidence were unavailable here**; installation is unconfirmed, not presumed successful. This incremental installer requires matching stage-65 runtime source and refuses unexpected edits.

Stage-66 validation: **2,292/2,292 portable tests, all 187 files, zero skipped**; 27 new trace comparisons execute the actual widget adapter against frozen stage-65 blocks. Negative controls removing the stale-URL guard, cancellation or 600 ms delay each fail. The extracted module passes strict TypeScript; whole-project semantic typing and a fresh target-host build/browser check remain pending. No ExB client is installed in this workspace. Tests used isolated per-file TAP processes with the documented dependency overrides, concurrency two.

Deliverable: `apply-view-zoom-bindings-refactor.cjs`. From the widget root run `node apply-view-zoom-bindings-refactor.cjs --dry-run`, then the same command without flags. Keep its sibling backup folder. Roll back with `--uninstall`; later edits are protected. Documentation notes are prepended to preserve local history. No Git commit, push or deployment performed.

Resume: verify installed source with the dry-run and run the target ExB 1.21 build/browser smoke checks (2D/3D zoom, quality warning threshold, URL update after 600 ms, view switch/unmount). Then inspect the next bounded section of `onActiveViewChange`; avoid broad lifecycle rewrites. See `docs/development/view-zoom-bindings.md` for the contract.

# Reading the widget runtime

Start with [the architecture overview](architecture.md), then use this guide to
navigate [widget.tsx](../../src/runtime/widget.tsx). The runtime is still a large
coordinator; the presentation extraction does not complete its modularization.

## Read in this order

| Question | Runtime entry points | Related ownership |
| --- | --- | --- |
| How does startup attach resources? | `componentDidMount`, `ensureArcGISModules`, `onActiveViewChange` | Startup abort/revisions, active-view revision, ArcGIS SDK factories |
| What happens after selecting imagery? | `loadSequenceById`, `ensureImageViewer`, `bindMapillaryEvents` | Foreground selection, viewer instance, live sequence frame window |
| Where does optional work run? | `runSequenceBackground`, `fetchReverseGeocode`, `fetchNearbyImages` | Background queue and demand-driven metadata/discovery |
| How are coverage picks resolved? | `pickTurboRepresentative`, `pickTurboGraphic`, `updateTurboHover`, `coverageSelectionContext` | Raw tile requests/cache, exact image identity, pointer/request ownership |
| How do places and detections interact? | `syncPlaces`, `explorePlace`, `fetchAlternateImages`, `_handleSelectAlternateImage` | Places service, selected-feature detail/navigation requests and detection controller |
| How is analysis converted to a route? | `runCoverageAnalysis`, `generateCaptureRoute`, `generateEsriDetourRoute` | Analysis snapshot, `RouteGeneration`, provider cancellation and guarded rendering |
| What changes between layouts? | `toggleFullscreen`, `createMinimap`, `destroyMinimap` | Mapillary recreation, React body portal, separate ArcGIS minimap |
| What releases resources? | `cleanupWidgetEnvironment`, `disposeStartupResources`, `componentWillUnmount` | Instance listeners/timers, feature owners and registered shared-map resources |
| Where is the UI composed? | `render`, `renderLocalizedContent` | [Stateless viewer views](viewer-presentation.md), existing panels and localization |

The shared React state contract is in `src/runtime/widgetState.ts`. Feature views
consume narrow presentation props; do not pass the widget itself into them.

## Ownership rules to preserve

An asynchronous result needs more than valid data: it must still belong to the
request, image, feature, view and source that requested it. Read the local
`current()` predicate and the corresponding invalidation path before editing an
await or adding a state update. Different operations deliberately have different
owners; do not replace their guards with one global loading flag.

- Startup revisions and `_startupAbort` prevent late startup attachment after disposal.
- Active-view startup checks reject work from a replaced view/map.
- `_selectionRequestId` and selection cancellation protect foreground image changes.
- Selected-feature detail and alternate-navigation requests have separate revisions/controllers.
- Coverage analysis has its own abort, revision and input snapshot checks.
- `RouteGeneration` owns a route run, its provider requests and authority to publish or clear busy state.

Aborting transport does not replace identity checks: some SDK operations can finish
after cancellation. Conversely, a stale-result check alone does not release an
abortable network request or an event listener.

Optional metadata must not delay foreground imagery or take ownership of its
selection. Reuse existing background/discovery owners rather than starting a new
fetch or timer in a render function or presentation component.

Shared ArcGIS maps can contain unrelated widgets' layers and graphics. Use the
existing ownership helpers and feature disposal paths; removing by a broad ID or
clearing `view.graphics` can affect another widget. Keep SDK-owned viewer/minimap
DOM nodes empty from React's perspective, with overlays and controls as siblings.

## Fullscreen is a lifecycle transition

The current implementation removes and recreates the Mapillary viewer when
switching between embedded and fullscreen layouts. It preserves image/bearing,
then rebinds integrations. It is not merely a resize. Mapillary JS initialization
can pass through its internal cover-loading state even with `cover: false`.

Restoration runs in an asynchronous `setState` callback. Awaiting
`toggleFullscreen()` does **not** establish that this callback, image rendering or
minimap startup has finished. A future transition redesign needs explicit
completion semantics and live SDK validation; this documentation pass changes none
of that behavior.

## Comment conventions

Use JSDoc on substantial entry points to describe intent, ownership and side
effects. Document coordinate order/units, cancellation, return semantics and failure
behavior when callers need that information. Keep short delegating callbacks
simple; do not add comments that merely translate an assignment into prose.

Keep inline comments that explain why ordering or a guard matters. Remove stale
version notes, contradictory claims and repeated narration. Reference constants
such as `LIMITS.ALTERNATE_IMAGES` rather than copying values into comments. When
moving code, check that its documentation moves to the actual implementation,
not an adjacent property or getter.

## Validation scope

Stage 49 changes comments and contributor documentation only. It does not fix the
fullscreen transition, change request timing, add dependencies or claim improved
performance. Verification compares the full runtime syntax tree and emitted
JavaScript (with comments removed) against the stage-48 input, then runs the
focused regression suite and documentation checks. Existing repository-wide
strict type errors and target Experience Builder 1.21/live-SDK checks remain
separate work.

The reversible `apply-widget-documentation.cjs` installer targets the known
stage-48 runtime, tolerates BOM/CRLF, preflights all affected files and refuses
unknown edits. It preserves existing milestone/architecture text by appending
notes. Keep its backups for `--uninstall`; no dependency installation is required.
