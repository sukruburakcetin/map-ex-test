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

# Portable test baseline — stage 65, 19 November 2026

This local checkpoint contains `609b81c` plus stages 47–65. Every portable suite
remains included. See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,265 passed, 0 failed**, all 186 files; zero skipped. Exit code 0. |
| Focused policy/display/label checks | **10 passed**, all existing assertions; no test changes or new cases. |
| Component scope | Six `mly-text-action` attributes added; stripping only those additions exactly reproduces prior source. |
| Negative control | Restoring the pre-change component fails the unchanged text-action policy audit. |
| Source/frozen scope | One component changed under `src/`; other 448 source/frozen files unchanged from stage 64. No dependencies changed. |
| Isolated bundle | Cloud ExB **1.20.0** passed; user-supplied **1.21.0** result also has zero errors/warnings. Transpile-only. |

The detection display menu's percentage, mode, overlap, label, reset and close
button sites now use the existing shared text-action layout. No new CSS policy,
observer, listener, request or dependency was introduced. Callback bodies, state,
ARIA attributes, popup lifecycle and existing inline styles are byte-identical.
Icon controls retain their own sizing. The audit is unchanged; no exemptions or
expectations were weakened to obtain this clean run.

## Acceptance limits and next checkpoint

This is a clean **default portable** baseline, not a publishing or live-host
acceptance claim. Optional Mapbox style-spec/browser suites are not represented
by these counts. Whole-project semantic types, normal ExB **1.21** build/start,
real SDK/browser/GPU/terrain, narrow translated/coarse-pointer/fullscreen menu
layout and deployed Enterprise/workspace permissions remain separate checks.

The user supplied a passing isolated 1.21.0 result and a general good browser
smoke-check report. See [checkpoint evidence](checkpoint-2026-11-19.md) for limits;
follow the existing routing/viewer/integration guides. Preserve all
stage files in the authorized local Git checkpoint; no push or deployment is included.

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.














---

# Historical stage-64 baseline — 19 November 2026

Current source is `609b81c` plus uncommitted stages 47–64. Every portable suite
remains included; the remaining failure still makes the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,264 passed, 1 failed**, all 186 files, zero skipped. |
| Focused SVG/native-marker checks | **26 passed**; no new cases. |
| Assertion migration | Two obsolete camera-facing assertions replaced by three projected-ground checks; other 86 calls retained exactly. |
| Negative controls | Flattening the 3D fan fails seven cases; separating the marker transform fails three. Temporary copies only. |
| Production/frozen scope | All 449 source/frozen files unchanged relative to stage 63. No dependency changes. |
| Failure comparison | Phone transform failure resolved; text-button sizing audit remains. No newly failing names. |

The legacy case expected a camera-facing `rotate(...)` fan and an untransformed
marker at zoom 21+. Current SVG fallback keeps both on the same ground plane;
the phone predicate controls native sampling rather than changing fallback mode.
The case now checks the independently specified linear projection's normalized
matrix `[1,0,0,0.1,0,0]` and identical marker/fan transforms at each close zoom.
Nominal geometry, visibility, one overlay and return-to-lower-zoom assertions remain.

This explicitly migrates the retired camera-facing expectation. It does not
change phone rendering or promise an unforeshortened 14-screen-pixel 3D circle.
The existing native-marker suite remains included. No cases or frozen JSON were
removed or added. No new bundle: production source is identical to stage 63,
whose isolated 1.20 bundle passed. Real mobile SDK/terrain/browser and ExB 1.21
acceptance remain separate.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.













---

# Historical stage-63 baseline — 19 November 2026

Current source is `609b81c` plus uncommitted stages 47–63. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,263 passed, 2 failed**, all 186 files, zero skipped. |
| Focused locale/catalog checks | **59 passed**; no new cases. |
| Effective text equivalence | All **1,210 runtime and 171 settings** merged messages identical before/after. |
| Catalog cleanup | Remove 44 runtime and eight settings entries identical to US base; 41/19 genuine overrides remain. |
| Assertions | Replace two arbitrary size ceilings with three semantic inheritance checks; all other 47 assertion calls retained. |
| Negative controls | Reintroducing a redundant override or corrupting a placeholder each fails the regional contract. Temporary copies only. |
| Source scope | Only two UK catalog files changed under `src/`; other 447 source/frozen files unchanged. No dependency changes. |
| Isolated bundle | ExB **1.20.0** runtime/settings: zero errors, zero warnings. Not target 1.21 acceptance. |

The old runtime override ceiling failed at 85 entries. Replacing that ceiling
exposed 44 runtime overrides exactly equal to base text; eight settings overrides
were also redundant. Removing them preserves effective messages while restoring
the documented differences-only model. All keys, values, placeholders, metre
length units, meter devices, locale selection and regional formatting stay checked.

The partial-catalog contract now requires inherited messages, unchanged merged-key
coverage and exact inherited values; it does not encode arbitrary limits of 80/40.
Existing checks still reject unknown, unchanged or placeholder-incompatible
overrides. No frozen JSON was rewritten and no cases were removed or added.

The former regional failure is resolved and the two other failing names remain
unchanged. No live SDK/browser/RTL, semantic whole-project typecheck, multilingual
host or ExB 1.21 acceptance is claimed. The bundle checker is transpile-only.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.












---

# Historical stage-62 baseline — 19 November 2026

Current source is `609b81c` plus uncommitted stages 47–62. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,262 passed, 3 failed**, across all 186 files; zero skipped. |
| Focused preview/note/crop checks | **20 passed** across three suites. |
| Assertions | All 16 original linked-preview assertion calls retained; one current-format case adds 13 assertions. |
| Comparison with recorded stage 61 | Detection-preview failure resolved; other three failing names unchanged. No newly failing names. |
| Negative controls | Dropping saved attachment identity fails the current-format case; accepting zero-width crops fails the original validation case. Temporary copies only. |
| Production/frozen scope | All 449 files under `src/` and `tests/fixtures/` unchanged from stage 61. No production dependency changes. |

The old case expected `detectionNoteDescription` to emit a legacy HTTPS link.
Current descriptions serialize a `urn:mapillary-detection` reference; actual crop
capture remains separately gated by `includePreview` in the runtime. The legacy
case now explicitly calls its actual link producer, preserving round-trip and
credential/byte assertions. A separate case reads current descriptions with
`attachmentMetadata`, checking provenance, optional attachment identity, bounds,
legacy compatibility and absence of credentials/image bytes.

This is an explicit representation-contract migration, not a change to capture,
storage, publication or preview activation. No assertion calls or frozen JSON were
removed. One new case increases the total by one. The temporary test-dependency
directory was missing after resume and was recreated with the recorded package
versions; host packages were not modified. Counts are compared with the recorded
stage-61 baseline; the old ephemeral full report was unavailable after resume.

No new bundle, browser capture/IndexedDB, actual SDK/Enterprise upload,
ExB 1.21, multilingual or live service acceptance is claimed. Production source
is unchanged and the available host remains 1.20.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.











---

# Historical stage-61 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–61. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,264 tests: 2,260 passed, 4 failed**, across all 186 suite files. |
| Focused community client | **30 passed**, all existing client cases. |
| Existing assertions | All 96 assertion calls retained; one import-boundary assertion added. No new cases. |
| Comparison with stage 60 | Community client suite-load failure resolved; other four failing names unchanged. No newly failing names. |
| Negative controls | Cookie forwarding and exact-revision truncation each fail one existing case. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 60. No dependency changes. |

The old evaluator supplied no `require`; the current attachment-helper import
therefore prevented every client case from registering. The fixture now resolves
actual pure relative imports with cached module records, rejecting unexpected
non-relative dependencies. Each case still injects its transport and clock.
Loading or constructing the client makes no service connection.

Original endpoint/public-key validation, cookie/redirect/bearer boundaries,
session expiry/disposal, invitation handling, edit whitelists, exact revision
matching and duplicate-draft checks now execute unchanged. No helper is replaced
with an empty mock and no frozen fixture was rewritten. One suite-level failure
becomes 30 passing existing cases, raising the total by 29 without adding cases.

No production defect was found or changed. Full-run PostgreSQL/RLS suites remain
included; these client tests do not establish deployed operator permissions,
service roles, browser attachment persistence or real transport behavior. No new
bundle, ExB 1.21, multilingual or live service acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.










---

# Historical stage-60 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–60. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,235 tests: 2,230 passed, 5 failed**, across all 186 suite files. |
| Focused time-travel/queue checks | **45 passed**: 24 availability, five preview and 16 background-queue cases. |
| Existing assertions | All 24 availability cases/61 assertion calls retained; one import-boundary assertion added. No new cases. |
| Comparison with stage 59 | Time-travel suite-load failure resolved; other five failing names unchanged. No newly failing names. |
| Negative controls | Removing stale-apply guards fails nine availability cases; removing the cached-result assignment fails one. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 59. No dependency changes. |

The old loader evaluated `geoUtils` without `require`; its current detection-label
and presentation imports therefore prevented all availability cases from loading.
The suite now follows actual pure-module relative imports with cached module
records and rejects unexpected non-relative dependencies. The background queue
uses the same loader. Test fetch/clock controls remain case-owned.

Existing rules, duplicate-call coalescing, image/token cancellation, retryable
failures, between-stage priority and physical slot retention through JSON
settlement now execute unchanged. No empty helper mocks or frozen fixture updates
were introduced. One suite-level load failure is replaced by 24 passing tests,
so the overall total rises by 23 without adding cases.

No production defect was found or changed. No new bundle, real Mapillary
availability/transport timing, SDK/browser/GPU, ExB 1.21, multilingual or Enterprise
acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.









---

# Historical stage-59 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–59. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,212 tests: 2,206 passed, 6 failed**, across all 186 suite files. |
| Focused API/area-profile checks | **13 passed**: four API cases and nine area-profile cases. |
| Existing assertions | All three original API cases/19 assertion calls retained; one teardown regression adds ten assertions. |
| Comparison with stage 58 | Previous API builder failure resolved; other six failing names unchanged. No newly failing names. |
| Negative controls | Removing unmount cancellation or preview cleanup fails the new teardown case. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 58. No dependency changes. |

The builder fixture invoked actual unmount without extracting its current
`clearPlacesArea` dependency. It now includes that method and the actual preview,
view and revision fields. Cleanup is exercised rather than replaced with a no-op.
Existing URL normalization, credential omission, capability validation, explicit
testing and changed-URL stale-result checks remain exact.

A held response that ignores cancellation verifies controller detachment before
abort, one preview destruction, cleared ownership and no late state updates.
Repeated unmount is safe. The broader area-profile suite retains its map-preview
and revision tests. No original assertion or frozen JSON was removed or rewritten.

No production defect was found or changed. One new case increases the total;
the repaired failure was a harness failure. No new bundle, real HTTP/CORS,
SDK builder rendering, ExB 1.21, multilingual or Portal-permission acceptance is
claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.








---

# Historical stage-58 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–58. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,211 tests: 2,204 passed, 7 failed**, across all 186 suite files. |
| Focused Places checks | **85 passed** across Overture Places, configured runtime and Portal-source suites. |
| Existing assertions | All 62 original Overture cases/387 assertion calls retained; two regressions add 17 assertions. |
| Comparison with stage 57 | Five previous Overture failure reports resolved; other seven failing names unchanged. No newly failing names. |
| Negative controls | A fixed source scope fails the source-change case; removing cache writes fails original reuse and new cache/ownership cases. The source-audit case also detects both deliberate source edits. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 57. No dependency changes. |

Five runtime fixtures omitted `placesSourceKey`, still supplying only the former
external URL helper. They now use the actual source-identity function. Both
imagery fixtures supply runtime configuration and reuse one local extracted-method
constructor. No production helper is mocked or rewritten for this repair.

New cases exercise external-to-Portal and Portal query-endpoint cache isolation,
plus overlapping imagery searches whose transport ignores cancellation. An older
completion cannot populate cache, clear the newer controller or resynchronize its
owner; the current completion still publishes and caches its own imagery.

Original category/confidence, cache budgets, manual search, click priority,
orientation and stale-response assertions remain exact. No frozen JSON was
rewritten. The total increases by two cases; five repaired failures were harness
failures, not five product fixes. No new bundle, live SDK/browser/Portal
permissions, real service scale, ExB 1.21 or multilingual acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.







---

# Historical stage-57 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–57. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,209 tests: 2,197 passed, 12 failed**, across all 186 suite files. |
| Focused Nearby checks | **30 passed** across runtime foreground, actual discovery owner and coverage-anchor suites. |
| Runtime assertions | Five original cases/15 assertion calls retained; two regressions plus a binding-count check add 17 assertions. |
| Comparison with stage 56 | Two previous Nearby runtime failure reports resolved; other 12 failing names unchanged. No newly failing names. |
| Negative controls | Removing Nearby eligibility or forcing every request immediate fails three cases each. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 56. No dependency changes. |

The foreground harness extracted a lifecycle prefix ending at a different
feature's guard. That prefix now includes route-generation reconciliation, so
it executed an unbound route owner. The fixture selects Nearby's exact four
statements by their declaration/assignment/visibility roles, retaining source
order and checking the count; unrelated route and analysis logic stays outside
this feature-specific harness.

Additional cases check object-tab/hidden-widget cancellation, pointer reset,
return-to-panel priority, playback suppression and paused-image scheduling with
one owner. Existing discovery tests execute the actual owner with controlled
transport/timers, retaining stale-response and physical background-slot checks.
The runtime's discovery adapter records schedules rather than issuing requests.

No production defect was found or changed. No original assertion or frozen JSON
was removed or rewritten. The total increases by two cases; two repaired
failures were harness failures. No new bundle, live SDK/browser/network timing,
ExB 1.21, multilingual or authenticated Enterprise acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.






---

# Historical stage-56 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–56. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,207 tests: 2,193 passed, 14 failed**, across all 186 suite files. |
| Focused alignment/pulse/mesh checks | **39 passed**: 24 native-alignment, six steady-pulse and nine closed-mesh cases. |
| Comparison with stage 55 | Five previous native-alignment failures resolved; other 14 failing names unchanged. No newly failing names. |
| Assertion migration | 43 assertion calls outside three migrated legacy cases retained exactly; no test suite removed. Two terrain edge cases added. |
| Negative controls | Speculative flat terrain fails three cases, lifted mesh apex fails one, ignoring the retained anchor fails two warm-playback cases. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 55. No dependency changes. |

Two playback failures came from an absent screen-direction owner in the fixture.
It now records that active runtime branch, preserving warm-byte/no-network,
native-center, cache, cancellation, revision and paint-gate checks.

Three legacy cases needed explicit migration rather than production changes:

| Previous expectation | Current tested contract |
| --- | --- |
| DOM pulse projects terrain updates every animation frame | `renderedGroundPoint` reads current rendered height when explicitly invoked, preserving the native anchor. |
| DOM pulse retries missing terrain on a timer | The projection helper defers unknown terrain and accepts later readiness; the steady SDK-draped pulse schedules no frames, as independently checked by the existing pulse suite. |
| Cone apex lives in polygon rings and a third separate face | Closed mesh local origin/vertices and the single perimeter preserve the same ground apex and lifted wedge. Existing mesh tests retain topology/membership coverage. |

The obsolete DOM retry scheduling assertion is intentionally retired with that
implementation. This does not restore DOM sampling or change terrain rendering.
Added cases cover explicit empty-ground fallback, unspecified ground, nonfinite,
no-data and throwing samples. Factory-call assertions run outside contained
callbacks so exception handling cannot swallow a failing test expectation.

No production behavior defect was found or changed. No frozen fixture was
rewritten. The total increases by two cases. No new bundle or real SDK terrain,
projection/browser/GPU, multilingual, ExB 1.21 or Enterprise acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.





---

# Historical stage-55 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–55. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,205 tests: 2,186 passed, 19 failed**, across all 186 suite files. |
| Focused footer/shared-fixture checks | **10 passed**: six footer cases and four English fixture checks. |
| Existing assertions | All four original footer cases/eight assertions retained; two regressions/four assertions added. |
| Comparison with stage 54 | All four targeted footer failure reports resolved; other 19 failing names unchanged. No newly failing names. |
| Negative controls | Changing relative scroll distance fails three cases; forcing smooth motion fails two cases. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 54. No dependency changes. |

The footer fixture previously returned styles for every non-host import, omitting
`useWidgetLocale`. An explicit adapter now uses the actual shared English catalog
and rejects unknown imports. Cases restore the original global `window`
descriptor. Scroll spies check a replacement viewport/current height, live motion
preferences, absent matchMedia and an unmounted target alongside original button
labels, available actions and minimum/relative distance.

No production defect was found or changed. No original assertion or frozen JSON
was removed or rewritten. The total increases by two new cases; four repaired
failures were harness failures, not four product fixes. Negative controls reject
incorrect distance and motion handling rather than merely checking callbacks run.

These are controlled component-contract checks, not React-provider lifecycle,
real keyboard/focus, browser layout, screen-reader or live ExB 1.21 acceptance.
No new bundle, SDK/GPU, multilingual or authenticated Enterprise acceptance is
claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.




---

# Historical stage-54 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–54. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,203 tests: 2,180 passed, 23 failed**, across all 186 suite files. |
| Focused detection checks | **20 passed** across AI-label toggle, detection exploration, map labels and display suites. |
| AI-label suite | All three retained cases and four new regressions pass; 15 original assertion calls retained and 22 added. |
| Comparison with stage 53 | Three targeted failure reports resolved; the other 23 failing names unchanged. No newly failing names. |
| Negative controls | Removing panorama visibility forwarding fails two cases; removing hover ownership checks fails the out-of-order hit case. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 53. No dependency changes. |

The AI-label fixture omitted `detectionThumbnailBounds`, now required when hover
setup records tag configurations. It now provides an explicitly inert bounds
adapter, matching the existing detection-exploration test: crop geometry remains
outside this label-only suite. Timer, hit-response and viewer-event controls let
the suite check text toggling, target outlines, focus/all mode, panorama-label
visibility, cleanup after viewer removal and newer-pointer ownership.

No production defect was found or changed. No original assertion or frozen JSON
was removed or rewritten. The total increases by four new cases; the three
repaired failures were harness failures, not three product fixes. Negative
controls confirm the added cases reject missing forwarding and stale hits.

No new bundle or live ExB 1.21/SDK/browser, multilingual, mobile/GPU or licensed
Enterprise acceptance is claimed. Optional Mapbox style-spec checks were not
configured; the listed portable counts cover the default test environment.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.



---

# Historical stage-53 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–53. Every portable suite
remains included; the runner exits nonzero while unresolved failures remain.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,199 tests: 2,173 passed, 26 failed**, across all 186 suite files. |
| Coverage-analysis reliability | **21 tests passed**: 17 retained cases and four new classifier/cooldown regressions. |
| Shared English fixture checks | Four tests passed; combined focused result is **25 passed, zero failed**. |
| Comparison with stage 52 | All six targeted failure reports resolved; the other 26 failing names are unchanged. No newly failing names. |
| Negative stale-result control | Removing only the post-classification ownership guard in a temporary source copy makes the three late-result cases fail. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 52; no dependency changes. |

The test harness now compiles runtime snippets as TSX and reuses actual English
bindings for translated messages and cooldown JSX. The analysis-input guard is
selected by its condition rather than statement position. Existing assertions
remain; four extra cases hold classification pending to check late progress,
obsolete completion, newer-run ownership, view replacement and cooldown feedback.

No production behavior defect was found or changed. Road retries/abort handling
use controlled HTTP responses; classification is stubbed to test orchestration,
not classification accuracy or real server/GPU behavior. No baseline JSON was
rewritten. The temporary guard-removal control demonstrates the new assertions
reject stale publication rather than merely checking that a promise settles.

The total increases by four new cases; six repaired failures were harness
failures, not six product fixes. No new bundle or target ExB 1.21/live SDK,
multilingual, mobile/GPU or licensed Enterprise acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.


---

# Historical stage-52 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–52. The complete portable
runner still includes every suite and exits nonzero while unresolved failures
remain. See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,195 tests: 2,163 passed, 32 failed**, across all 186 suite files. |
| Field-note draft/file/collection suites | **46 tests passed** across three suites (45 existing cases and one new counted-feedback case). |
| Shared English fixture checks | Four tests passed; combined focused result is **50 passed, zero failed**. |
| Comparison with stage 51 | All 27 targeted failure reports resolved; other 32 failing names unchanged. No newly failing names. |
| Negative duplicate-count control | Incrementing only the displayed skipped count in a temporary copy makes three of 16 file-suite tests fail. |
| Assertions and immutable fixtures | Existing assertion calls retained; two additional file-feedback assertions. No files under `tests/fixtures/` rewritten. |
| Production scope | All `src/` files unchanged relative to stage 51, including controllers, transport, styles and localization catalogs. No dependency changes. |

The three suites now receive the same actual English/localization bindings used
by the repaired point-cloud fixtures. Their clocks, FileReaders, storage, marker
callbacks and publication dependencies remain explicitly controlled. Comparisons
still check note payloads, identities, timestamps, state/order, shared-save/editor
guards, errors and feedback duration/markup.

The frozen file fixture predates localization and uses Turkish notices. Only its
four known alerts and counted import notice are adapted to the current explicit
English wording. Note content, payloads and error objects are never translated or
normalized. Exact current zero/singular/plural import and duplicate counts have an
additional assertion. No production behavior defect was found or changed here.

The full total increases by one because the file suite gains a regression case.
This does not mean 27 product defects were fixed. New bundle/browser acceptance is
not claimed: production source is identical to stage 51, whose isolated 1.20
bundle passed. Target ExB 1.21 packaging, semantic types, live SDK/browser/GPU,
multilingual presentation and licensed Pro/Portal acceptance remain separate.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.

---

# Historical stage-51 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–51. Use the
[complete portable runner](portable-tests.md); failing suites remain included and
the full run still exits nonzero.

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,194 tests: 2,135 passed, 59 failed**, all 186 suite files. |
| Point-cloud suites | **257 tests passed across 17 suites**, including the 15 map-layer tests previously hidden by a parse-time failure. |
| English fixture contract | Four tests passed, including checks that changed text/counts/styles/timing/order still fail comparison. |
| Full-suite comparison to stage 50 | All 82 old point-cloud failure reports are gone; the other 59 failing test names are unchanged. No newly failing names. |
| Original plural-spacing control | Restoring only the old `cluster s` JSX in a temporary copy causes 13 of 15 result tests to fail. |
| Immutable fixtures | No files under `tests/fixtures/` changed. Existing assertion-call counts are preserved, with two additional calls in calibration. |
| Production scope | Only one JSX space removed in `PointCloudResultFeedback.tsx`; no runtime/controller/SDK logic changes. |
| Isolated runtime/settings bundle | Available ExB 1.20, zero errors/warnings; full target 1.21 acceptance remains pending. |

The full total increases by 19: 14 additional map-layer tests now execute instead
of one module-load failure, plus four fixture-contract tests and one exact
calibration-format test. This is not a claim that 82 product bugs were fixed.

`tests/helpers/englishFixture.cjs` supplies the actual English catalog,
PresentationText fallback and shipped OwnedMessage/OwnedNumber bodies to isolated
snippets. It intercepts localization imports only and retains explicit suite-owned
SDK/clock/writer dependencies. Rendered-toast comparisons join adjacent text nodes
and collapse ordinary ASCII whitespace, while retaining markup, props/styles,
values, durations and non-toast events/object identity. Preformatted whitespace is
preserved. The calibration suite explicitly adapts only historical compact units
and XYZ label spacing; the current SI-formatted text has an exact assertion.

The genuine UI defect was a stray JSX space separating `cluster` from its plural
suffix. Removing that space preserves the existing message source and all other
feedback formatting. No translation catalogs, transport or feature behavior were
changed. Browser/GPU performance and live SDK behavior were not measured.

## Remaining failures

These are unresolved reports requiring individual diagnosis, not accepted failures
or confirmed product defects. Some files fail during loading. Do not rebaseline or
remove them merely to make the suite green.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

The environment remains Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0 and PGlite 0.5.16; runtime packages are Mapillary JS 4.1.2, pbf 5.1.2,
vector-tile 3.0.0 and pako 2.2.0. Test-only dependencies remain isolated from the
host and widget. Full semantic TypeScript, production packaging, target 1.21,
mobile/RTL/live Mapillary and licensed Pro/Portal acceptance remain separate.

---

# Phase-1 baseline — historical stage 50

This is the current phase-1 baseline for `609b81c` plus uncommitted stages 47–50.
It supersedes the old aggregate below; it is not a declaration of release readiness.
Use the [portable runner and dependency setup](portable-tests.md) rather than a
hand-selected green subset.

| Check | Current result and scope |
| --- | --- |
| Complete portable Node run | **2,175 tests: 2,034 passed, 141 failed**, across all 185 `tests/*.test.cjs` files; nonzero exit retained. |
| New runner/real-codec checks | Six tests passed: report/preflight handling, real pbf/MVT decoding, actual gzip/zlib cluster fallback and cancellation. |
| Test environment | Node 24.19.0, TypeScript 5.9.3, React/React DOM/test renderer 19.2.3, jsdom 26.1.0, PGlite 0.5.16. Test-only packages were installed outside the host and widget. |
| Runtime package resolution | Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0, pako 2.2.0. |
| Isolated runtime/settings bundle | ExB **1.20.0**, zero errors/warnings; host transpile-only rules, not full packaging/typechecking. |
| Previous analysis run, incomplete dependencies | 2,109 reports: 1,957 passed, 152 failed. Missing renderer/PGlite prevented some tests from running, so totals are not directly interchangeable. |
| Python analysis baseline | 105 tests passed across 12 suites before this phase; no Python source changes in phase 1. |

A controlled run using the **pre-cleanup stage-49 application source**, the same
185 suites and the same complete dependency environment reproduced identical
totals and all 141 failing test names. The new six checks were included on both
sides. This attributes no failure to a root cause, but found no new failing test
names from the cleanup.

The current remaining failure triage hints are **58 execution errors, 80 assertions
and 3 unclassified reports**. These are report categories, not root causes. For
example, a snippet loader can raise a ReferenceError because its injected imports
are incomplete; an assertion can indicate either outdated expectations or an
actual behavior defect. Diagnose individually. Do not delete failed tests, blanket
rebaseline their expectations, or count a missing-dependency failure as an executed
database permission test.

## Remaining failure inventory

Counts are failing test reports. Some files fail during loading before their
individual tests execute. The runner JSON gives names, locations and bounded
diagnostics when available.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/pointCloudAcquisition.test.cjs` | 12 |
| `tests/pointCloudCalibration.test.cjs` | 11 |
| `tests/pointCloudExport.test.cjs` | 15 |
| `tests/pointCloudGeometry.test.cjs` | 5 |
| `tests/pointCloudHitRouting.test.cjs` | 1 |
| `tests/pointCloudMapLayer.test.cjs` | 1 |
| `tests/pointCloudResult.test.cjs` | 13 |
| `tests/pointCloudSight.test.cjs` | 6 |
| `tests/pointCloudTools.test.cjs` | 13 |
| `tests/pointCloudViewshed.test.cjs` | 5 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Repair the loader/import issues without weakening behavior assertions, then review
remaining UI/localization/geometry expectations against intended behavior. Preserve
ownership, cancellation, bounded work and database permissions. Target ExB 1.21
production build, semantic typecheck, live browser/GPU, licensed Pro and
authenticated Portal acceptance remain separate release gates.

---

# Historical portable baseline — 13 November 2026

Recorded 13 November 2026 against `43b7a4b` and the organizational cleanup, using Node 24.19.0, Python 3.12.14 and the available Experience Builder dependency directory. These environment versions are a record of this run, not a newly declared supported host matrix.

## Results

| Check | Result |
|---|---|
| All `tests/*.test.cjs`, concurrency 2 | 1,282 tests: 1,138 passed, 144 failed |
| Same Node command in untouched detached `43b7a4b` checkout | Identical totals and failing test names/counts |
| All 12 `tests/*.test.py` suites | 105 tests passed |
| TS/TSX syntax transpilation | 312 implementation files, zero errors |
| Localization catalogs | 1,174 runtime keys, 160 builder keys, 12 translation catalogs, zero catalog errors |
| Translation review CSV | Matches catalogs and language names |
| Markdown local links | Zero broken links |
| Repository hygiene | No tracked generated artifacts remaining |

Transpilation is not semantic type checking. No full Experience Builder production build, browser/GPU acceptance, licensed ArcGIS Pro run or authenticated Portal acceptance was performed in this cleanup.

## Reproduce the Node comparison

Run from the widget root with the host dependencies available. In this cloud environment:

```sh
MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript NODE_PATH=/workspace/experience-builder-1.20/client/node_modules node --test --test-concurrency=2 tests/*.test.cjs
```

The unmodified baseline was checked out separately at `/tmp/map-ex-test-baseline-43b7a4b` and run with the same environment and command. The failing test names/counts match, not merely the aggregate total. This provides evidence that the organizational cleanup did not introduce these failures; it does not establish that the product is release-ready.

## Existing failing suites

Counts below are failing test reports. A suite that fails during loading may report one failure even though its individual assertions never ran.

| Suite | Failing reports |
|---|---:|
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/collaborationWorkspaceMigration.test.cjs` | 1 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/communityWorkspaceDatabase.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionImageAttachmentsDatabase.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/directContributionsDatabase.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/pointCloudAcquisition.test.cjs` | 12 |
| `tests/pointCloudCalibration.test.cjs` | 11 |
| `tests/pointCloudExport.test.cjs` | 15 |
| `tests/pointCloudGeometry.test.cjs` | 5 |
| `tests/pointCloudHitRouting.test.cjs` | 1 |
| `tests/pointCloudMapLayer.test.cjs` | 1 |
| `tests/pointCloudResult.test.cjs` | 13 |
| `tests/pointCloudSight.test.cjs` | 6 |
| `tests/pointCloudTools.test.cjs` | 13 |
| `tests/pointCloudViewshed.test.cjs` | 5 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |
| `tests/workspaceContributionsDatabase.test.cjs` | 1 |
| `tests/workspaceDisplayNamesDatabase.test.cjs` | 1 |

## Failure classes and next work

- Database suites cannot load `@electric-sql/pglite` in the available environment. Establish the supported test dependency setup before judging their behavior.
- Some source-extraction/transpilation fixtures omit new imports or helpers (`require`, `englishPresentation`, `detectionThumbnailBounds`, Portal source helpers) or generate invalid extracted snippets. Repair these as test-harness work without weakening their behavioral assertions.
- Some comparison fixtures assert earlier localized feedback strings or old source patterns; review each against current intended behavior before changing expectations.
- React/locale fixture mismatches and UK catalog/marker sizing assertions also fail. These need individual diagnosis, not blanket rebaselining.

A green focused feature suite must not be described as a green repository-wide baseline. After dependency/fixture repairs, rerun the full set and update this record. Keep browser and deployment acceptance distinct.
