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

<!-- coverage-first-startup -->

## Coverage-first view startup (20 November 2026)

User verified the previous low-zoom hover update visually. Inspection confirms coverage already starts independently of opening the Mapillary viewer. This bounded change starts the existing coverage task before optional graphics, Places and feature-layer restoration in the ready-view callback. The same task is awaited at the original completion boundary; errors are observed immediately even if optional restoration fails. Existing module readiness, restored camera, active view/revision and coverage filter/request gates remain.

No viewport-wide hover prefetch: native renderer coverage and raw hover tile caches are separate consumers. Preparing arbitrary low-zoom hover targets would require extra requests. This update adds no fetch, cache budget, concurrency, timer, viewer wait or map-visibility gate. It is a startup ordering improvement, not proof of faster remote responses or instant first hover. Seven production-callback tests cover readiness/camera gates, parallel restoration, stale views, optional failure, rejection observation and cancellation. Target ExB 1.21 build and live timing remain unverified.

Delivery: apply-coverage-first-startup.cjs; requires the preceding low-zoom-hover-responsiveness source. Dry-run/apply from widget root, restart/hard-refresh; --uninstall reverses this update with exact backups and later-edit protection. No commit/push/deployment. See docs/development/coverage-first-startup.md.

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

<!-- stage65-checkpoint-afca751 -->
> **Working checkpoint recorded: afca751 (19 November 2026).** All 2,265 portable tests pass. The user supplied a successful isolated ExB 1.21.0 build (zero errors/warnings) and reported browser smoke checks good. Detailed device/feature evidence, whole-project semantic types and production packaging remain separate. This file-based installer preserves your local history below and does not create/import Git commits or push anything. See docs/development/checkpoint-2026-11-19.md.

> **Local Git checkpoint update — 19 November 2026.** Stages 47–65 and guide updates are preserved in the authorized local checkpoint. The user supplied a successful isolated ExB 1.21.0 result (9,974 ms, zero errors/warnings, no ancestor override) and reported browser smoke checks good. Granular browser/device, semantic types and production-package acceptance remain separate. See `docs/development/checkpoint-2026-11-19.md`. No push, publish or deployment. Earlier uncommitted/pending statements below are historical. Resume from the actual checkpoint, not the obsolete stage-61 failure list.

<!-- detection-text-actions-stage65 -->
> **Checkpoint update — 19 November 2026: stage 65 completed.**
> This update supersedes the stage-61 resume point and failure inventory below; retain the rest as historical context.
> Current full portable baseline: **2,265/2,265 pass**, all 186 files, zero skipped. The former four failures are resolved through stages 62–65. Stage 62 reconciled preview metadata tests; stage 63 removed 52 redundant UK overrides with identical effective text; stage 64 reconciled phone fallback projection tests; stage 65 added six `mly-text-action` classes without changing callbacks/state. No test exclusions.
> Isolated runtime/settings bundle: **ExB 1.20.0, zero errors/warnings**. Target 1.21 normal build/browser, semantic typing, mobile/RTL/layout and live service permissions remain unverified.
> Stages **47–65 remain uncommitted** on `609b81c`; preserve source, untracked files and backups. No push, deployment or publish. Next: inspect actual installed stage, read current REFACTORING-MILESTONE.md and test-baseline.md, then establish target 1.21 acceptance before broader extraction. Do not resume the obsolete four-failure inventory below.
> Latest incremental installer: `apply-detection-text-actions.cjs`, after stage 64. Run `--dry-run` first, preserve backups, refresh the app; no dependency reinstall. The older file fingerprints below are historical and may differ after later stages. Markdown alone does not transfer code.

# Mapillary Explorer — account handoff

Prepared: **18 November 2026 (Europe/Istanbul)**. Last completed checkpoint: **stage 61**.

## Paste this into the next chat

> Continue the Mapillary Explorer V5 refactoring and release-readiness work from stage 61. Read this handoff, then inspect actual Git state and read REFACTORING-MILESTONE.md, docs/development/test-baseline.md, docs/development/portable-tests.md and the runtime reading guide. The last verified checkout is commit 609b81c5eacb542b7865d50a60bbca902b124137 plus UNCOMMITTED stages 47–61; do not assume GitHub contains them. Preserve local edits and untracked files. The full portable baseline is 2,264 tests: 2,260 pass, four fail, all 186 files included. The next planned step is stage 62: investigate detectionLinkedPreview.test.cjs, preserving opt-in previews, provenance and credential boundaries. Classify the failure before changing tests or production. Do not blanket-update expectations, discard assertions or resurrect retired rendering. Keep runtime behavior and performance intact. Deliver a reversible CJS installer, updated milestone/baseline and honest validation. The user's host is Experience Builder 1.21; cloud checks used 1.20, which is not 1.21 acceptance. Inspect the actual installation checkpoint before applying anything. No commit, push or deployment has been made for stages 47–61.

## What we are doing

The broader goal is a maintainable, modular, nearly publishable Mapillary Explorer widget. `src/runtime/widget.tsx` should orchestrate features; feature implementation, presentation and styles should live in suitable existing components/modules. Preserve every working feature and avoid unnecessary dependencies or abstractions.

We temporarily prioritized trustworthy test/build foundations before further large extractions. Many failures came from old snippet harnesses that omitted current imports, JSX or localization. Repairing these tests is not evidence of an equivalent number of production bug fixes. The four remaining failures have **not yet been diagnosed or fixed**.

User priorities:

- Preserve exploration speed, request timing, cancellation, map/view ownership and low-budget/mobile behavior.
- Keep optional work opt-in; do not automatically open image info or start enrichment without demand.
- Preserve Overture vector POIs, categories, confidence controls, selection/imagery/note workflows. Do not copy the old GeoJSON/bbox/Graphic patterns automatically into vector rendering.
- No day/night feature now; it was deferred. NeRF was discussed, not the current task.
- Keep `widget.tsx` focused and documented; reuse existing feature modules and style conventions.
- Continue useful authorized work without unnecessary confirmation questions. The user normally says “next” to approve the next bounded step.
- Deliver a downloadable, reversible `.cjs` installer because downloading/replacing whole source trees has been difficult for the user.

## Repository and transfer warning

- GitHub remote recorded here: `https://github.com/sukruburakcetin/map-ex-test.git`.
- Last observed HEAD: `609b81c5eacb542b7865d50a60bbca902b124137` — `updating current activities v13`.
- Cloud checkout: `/workspace/map-ex-test-latest`.
- User's latest Windows widget path: `C:\Users\BURAK\Desktop\arcgis-experience-builder-1.21\client\your-extensions\widgets\mapillary-explorer`.
- Earlier testing used the analogous Experience Builder 1.20 path.
- Stages **47–61 are uncommitted** in this checkout. No commit, push or deployment was performed for them. There are modified tracked files and important untracked source/test/tool files; `.gitkeep` is intentionally deleted as part of stage 50.
- Older work was historically stashed before synchronization. Do not blindly replay stashes over the current source.

**This Markdown transfers context, not code.** A new account/session may not retain this filesystem, `/tmp` artifacts or previous downloads. Preserve the working widget tree, including untracked files, and relevant installers before leaving. A fresh clone at the recorded commit alone is not the stage-61 working tree. If files are missing, obtain the actual checkpoint/source or installer artifacts; do not reconstruct it by guessing from this document or claim it is synchronized.

At the start of the next session, run read-only checks such as:

```sh
git status --short
git log -1 --format="%H %s"
git remote -v
```

Compare actual files/checkpoint with this handoff. Do not reset, clean, overwrite unknown edits, or pull over the dirty checkout to “sync” it. The user has not confirmed which delivered stages are installed on their Windows machine.

## Current verified baseline

| Check | Last verified result |
| --- | --- |
| Full portable run | **2,264 total; 2,260 pass; four fail; zero skipped** |
| Scope | All **186** `tests/*.test.cjs` files included; nonzero exit is expected while failures remain |
| Last focused run | **30/30** community-workspace client cases pass |
| Stage 61 assertions | All 96 original assertion calls retained; one import-boundary assertion added; no new cases |
| Negative controls | Cookie forwarding or revision truncation each fails an existing client case in temporary copies |
| Installer checks | 16 pass, including installed-output tests, LF/BOM/CRLF, preflight, repeat apply, exact rollback and edit protection |
| Documentation | 101 Markdown files, 399 local links, zero broken links, before adding this handoff |
| Repository layout | 823 source files checked; zero errors |
| Production scope | Stages **52–61** changed tests/docs only. All 449 `src/` and frozen-fixture files unchanged within each of these stages |

The early stages do contain runtime changes; do not describe all uncommitted work as test-only. No new bundle was needed for the later test-only stages. An earlier isolated 1.20 bundle passed, but semantic type checking and live ExB **1.21** acceptance remain outstanding. Browser/SDK/GPU, real service scale, multilingual rendering and deployed Enterprise/workspace permissions require their own validation.

## Four remaining failures — investigate individually

| Suite | Exact failing case / observed symptom |
| --- | --- |
| `tests/detectionLinkedPreview.test.cjs` | “preview is opt-in and portable across existing note text without credentials or file bytes”; parsed reference is `null`, expected image/detection IDs and `{x:0.2,y:0.3,width:0.1,height:0.4}`. **Next task.** |
| `tests/regionalLocales.test.cjs` | “UK catalogs are sparse, inherit US text and keep meter devices distinct from length units”; `assert(Object.keys(gb).length < 80)` fails. Determine whether the numeric ceiling is outdated while preserving locale semantics. |
| `tests/screenDirectionCone.test.cjs` | “phone close zoom keeps a 14px circle and uncompressed fan from zoom 21 onward”; expected fan transform to include `rotate(`. Inspect the actual transform contract before changing implementation or expectations. |
| `tests/textButtons.test.cjs` | “owned translated actions use the shared policy; icon controls retain their own sizing”; reports missing `mly-text-action` at `src/features/detections/DetectionDisplayControls.tsx` lines 39, 44, 46, 48 (line 48 twice). Recheck current line numbers and distinguish text actions from icon controls. |

These are diagnostic observations, not conclusions that all four are harness problems. Do not weaken privacy, accessibility, formatting, crop validation, opt-in behavior or current display contracts merely to make them pass.

For stage 62, inspect the preview suite and its actual attachment serialization/parsing helpers first. Retain useful existing tests; if a representation was intentionally replaced, map the old intent to the active owner explicitly and document the reason. No stage-62 edits have been started.

## Completed stages and delivery order

Stages are incremental. Existing local files, not the conversation alone, determine which installer can safely apply. Run a dry run and respect unknown-edit refusal. A refusal is a reason to inspect differences, never to force an overwrite. Retain `.refactor-backups` and uninstall newer stages before older ones.

| Stage | Completed work | Installer filename |
| --- | --- | --- |
| 47 | Restore bounded isolated build checker | `apply-isolated-build-check.cjs` |
| 48 | Stateless viewer surface/fullscreen/tray; style separation and runtime state contract | `apply-viewer-presentation-refactor.cjs` |
| 49 | Runtime ownership/function documentation and contributor reading guide | `apply-widget-documentation.cjs` |
| 50 | Portable runner/dependency setup, baseline reconciliation, small approved cleanup | `apply-v5-phase1-foundation.cjs` |
| 51 | Point-cloud fixture bindings/TSX; fix one `cluster s` feedback space | `apply-point-cloud-fixture-repair.cjs` |
| 52 | Field-note draft/file/collection English bindings and counted feedback | `apply-field-note-fixture-repair.cjs` |
| 53 | Coverage-analysis TSX/localization and late-classifier ownership checks | `apply-coverage-analysis-fixture-repair.cjs` |
| 54 | AI-label bounds binding, focus/visibility/cleanup/stale-hover tests | `apply-detection-label-fixture-repair.cjs` |
| 55 | Footer locale hook and live viewport/reduced-motion tests | `apply-info-footer-fixture-repair.cjs` |
| 56 | Align native-anchor fixture and retired terrain/polygon assertions with current owners | `apply-native-alignment-fixture-repair.cjs` |
| 57 | Isolate Nearby lifecycle statements from unrelated route logic | `apply-nearby-foreground-fixture-repair.cjs` |
| 58 | Actual Places source identity; cache/source and overlapping-search checks | `apply-overture-places-fixture-repair.cjs` |
| 59 | Builder API teardown dependency and unmount ownership checks | `apply-places-api-fixture-repair.cjs` |
| 60 | Time-travel pure dependency loading; restore 24 original availability cases | `apply-time-travel-fixture-repair.cjs` |
| 61 | Community client pure dependency loading; restore 30 original cases | `apply-community-client-fixture-repair.cjs` |

Latest delivery, **only after the matching stage-60 source**:

```sh
node apply-community-client-fixture-repair.cjs --dry-run
node apply-community-client-fixture-repair.cjs
```

Rollback uses `--uninstall`; preflight rollback with `--uninstall --dry-run`. Stage 61 requires neither restart nor dependency reinstall. Each installer supplies exact file backups, recognizes its known baseline, protects later edits and appends a milestone note. There is no new cumulative stages-47–61 installer. Historical checkpoint v2 covers earlier stages; do not assume it includes these later repairs.

### Important implementation decisions already settled

- `tests/helpers/englishFixture.cjs` provides real English catalog/formatting bindings for isolated snippets. Suites retain explicit SDK/network/clock controls. Do not invent a second translated catalog or blanket-normalize payloads.
- Historical field-note Turkish notices are adapted only on the frozen comparison side; stored note content/error objects remain exact.
- Do not revive old 3D DOM-pulse sampling/retry loops. Current `SelectionPulse` delegates steady 3D placement to SDK ground draping and schedules no 3D animation frames; 2D retains its separate behavior.
- Current cone fallback uses a closed mesh and one perimeter. Stage 56 explicitly migrated obsolete polygon-face assertions; existing topology/reuse tests remain.
- Unknown terrain is deferred; only explicitly empty ground supports the flat fallback. Assert recorded factory effects outside contained callbacks, since callback assertion exceptions can otherwise be swallowed.
- Nearby foreground tests now isolate four actual lifecycle statements; unrelated route-generation reconciliation must not leak into this harness.
- Overture imagery caching uses actual `placesSourceKey`, including Portal/source identity. Older imagery completion must not replace a newer controller or publish stale cache/results.
- The time-travel and community client failures were suite-loading failures. Restoring their original cases increased totals without creating new cases; do not confuse that with extra production fixes.

## Read these project files

1. `REFACTORING-MILESTONE.md` — current resume point and stage history.
2. `docs/development/test-baseline.md` — current four-failure inventory and historical results.
3. `docs/development/portable-tests.md` — complete runner, dependencies, harness conventions and scope limits.
4. `docs/development/runtime-reading-guide.md`, `architecture.md`, `routing-validation.md`, `capture-solve-history.md`, `viewer-presentation.md` — all under `docs/development/`.
5. `CONTRIBUTING.md`, `docs/installation.md`, `docs/development/runtime-dependencies.md`, `docs/development/isolated-build-check.md`.

Important untracked files must be preserved: viewer presentation components/styles, `src/runtime/widgetState.ts`, `tests/helpers/englishFixture.cjs`, the viewer fixture/tests, portable runner/tests, and isolated build checker. Use `git status` to get the complete current list.

## Reproduce checks

The widget is hosted inside Experience Builder; it is not a standalone npm app. Do not replace host React, SDK, lockfiles or package-manager settings merely to run tests.

Previously available cloud paths (ephemeral, recheck):

- ExB client: `/workspace/experience-builder-1.20/client`
- Isolated test dependencies: `/tmp/mapillary-v5-test-deps/node_modules`
- Node 24.19.0; TypeScript 5.9.3; React/DOM/renderer 19.2.3; jsdom 26.1.0; PGlite 0.5.16.
- Tested runtime dependencies: Mapillary JS 4.1.2, pbf 5.1.2, `@mapbox/vector-tile` 3.0.0, pako 2.2.0. Refer to the installation guide for host-specific commands; React compatibility is a host constraint, not a pbf dependency.

Full portable run from widget root; the report path must be NEW and its parent directory must exist:

```sh
node tools/check-portable-tests.cjs --client /workspace/experience-builder-1.20/client --dependencies /tmp/mapillary-v5-test-deps/node_modules --preflight
node tools/check-portable-tests.cjs --client /workspace/experience-builder-1.20/client --dependencies /tmp/mapillary-v5-test-deps/node_modules --report /tmp/portable-next-report.json
```

Focused next-case example in the same cloud environment:

```sh
NODE_PATH=/tmp/mapillary-v5-test-deps/node_modules:/workspace/experience-builder-1.20/client/node_modules MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript node --test tests/detectionLinkedPreview.test.cjs
```

On Windows use the runner with your actual client/dependency paths; do not paste POSIX environment-variable syntax into CMD. Follow `portable-tests.md` if rebuilding isolated test dependencies. Database tests need PGlite; missing dependencies are not grounds to exclude suites.

Routine repository checks:

```sh
node tools/check-docs.cjs
node tools/check-repository.cjs
git diff --check
```

Run target ExB 1.21 host builds/browser checks separately when available. The isolated bundle checker is transpile-only and does not prove semantic type safety.

## Workflow for the next bounded stage

1. Confirm actual stage/source and preserve edits; inspect applicable project instructions.
2. Reproduce the focused failure with complete dependencies. Inspect current production contracts before classifying it.
3. Repair a missing binding/loader if that is the cause. If it is a product defect, make the smallest behavior-preserving fix and state the scope clearly.
4. Preserve active assertions and frozen fixtures. Document any intentional migration from a retired representation; never silently rebaseline.
5. Run focused checks and meaningful deliberate-fault controls where useful; use temporary source copies for controls.
6. Run the complete portable suite and compare failing names against stage 61. Keep every suite included and report remaining failures honestly.
7. Update milestone/baseline and produce one reviewable, reversible CJS installer. Test preflight, apply, repeat, rollback, BOM/CRLF, unknown edits and installed output.
8. Summarize changed behavior (or test-only scope), results, limits and exact install commands. Do not claim performance/live host acceptance from controlled tests.

## Evidence and artifact locations

These locations belong to this session and may not exist on the next account:

- Last full report: `/tmp/v5-community-full-report.json`; full log: `/tmp/v5-community-full.log`.
- Stage 61 source/frozen hash snapshot: `/tmp/v5-community-source-before.json` (449 entries).
- Safety/negative checks: `/tmp/v5-community-installer-checks.json`, `/tmp/v5-community-controls.json`, `/tmp/v5-community-assertions.json`.
- Installer test output: `/tmp/v5-community-installed-tests.log`.
- Delivered installers and validation JSON: `/workspace/shared/downloads/`.
- Latest validation: `community-client-fixture-repair-validation.json` in that directory.
- Builder/safety helper scripts under `/tmp/` are session scratch files, not a supported repository build system. If lost, preserve the reviewed installer engine/behavior instead of assuming these scripts are committed.

## Delivered fixture installer fingerprints

Use these to identify existing downloads, not to bypass baseline checks. Earlier non-fixture stage installers are listed above but not fingerprinted here.

| File | SHA-256 |
| --- | --- |
| `apply-community-client-fixture-repair.cjs` | `264e829d75f0810b90554a31d87fb16d843435562ca1fd1c5bde010d2f4e3b85` |
| `apply-coverage-analysis-fixture-repair.cjs` | `c408293b9ab0ecc780c6d9f92cf5f51c32e591c057354626a4088368eeeed801` |
| `apply-detection-label-fixture-repair.cjs` | `2b130e1bc98d7d24066718d584a637d74e61d0e3bc888a0122b31730a11ba307` |
| `apply-field-note-fixture-repair.cjs` | `315eedef9718d92d17ad222625b55e401a8671364d44faf8f7acc8d5ba87c2e8` |
| `apply-info-footer-fixture-repair.cjs` | `707f86062c485db1c20c9557653e61697e19e3782d5ba89e72c305786b9d5883` |
| `apply-native-alignment-fixture-repair.cjs` | `e9dfb6185cadbb0feba56efcbc84efa84bfeca84de5d8ceb8ff3351a8f34975b` |
| `apply-nearby-foreground-fixture-repair.cjs` | `be47ef2218c3031a28050de7137435cca6cbb372e57113b89ffee819a669928a` |
| `apply-overture-places-fixture-repair.cjs` | `f09ebd4f3c1719a7b112725982df1cbd07dc5281282231a8a05e3eff3729a3a8` |
| `apply-places-api-fixture-repair.cjs` | `9a5402b7922ae54919c53a1c5b6b3f8cbf0801eab562530a7d71e21a8c724b3b` |
| `apply-point-cloud-fixture-repair.cjs` | `c1e27306866c7a2f4e98aea10aee222c9eea540006010d3a0744453116ecad96` |
| `apply-time-travel-fixture-repair.cjs` | `db03951a383485236c65b8c8ed98d2112b8f5aac51b088ae3844f19f2775475f` |

## Selected working-file fingerprints at handoff

These identify this working tree, not the committed GitHub versions. A mismatch requires inspection, not overwriting.

| File | SHA-256 |
| --- | --- |
| `src/runtime/widget.tsx` | `520ef354463135214186fbdd7d8a26c6fc4bf507ae0ee94ad03417c68a701780` |
| `src/runtime/widgetState.ts` | `230ff45ecd68b68997a4c2e5da1c31235acd277766bcfcc9b3af63191c84bd65` |
| `tests/helpers/englishFixture.cjs` | `747898ad711de0ffde919a3aa29020292b443d214585b8ae04cacfc7837c47fc` |
| `tests/communityWorkspaceClient.test.cjs` | `07d79ee97eddbee6ddb603c7a12922f85593910e1dc6199a038f3bfc703e6f94` |
| `tests/detectionLinkedPreview.test.cjs` | `758986f7c60ec1174d3f8ba4d7530e07e0d9053ee448cf58c0530b551945647e` |
| `docs/development/test-baseline.md` | `5772926a2b11989915c610faeb16f0ab00ebd26122ad0efd5bdd780b904fc724` |
| `REFACTORING-MILESTONE.md` | `d1479485ae0b09cd6ff17a2f3361ed835c42292a8c365d5b2a7295d55bc3d2c7` |
