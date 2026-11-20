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

# Mapillary Explorer — refactoring milestone

Updated: **18 November 2026 (Asia/Riyadh)**. Resume point: **stage 46 — cumulative checkpoint v2 verified through stage 45**.

## Goal and current checkout

Extract bounded feature logic from `src/runtime/widget.tsx` while preserving exploration, request timing, cancellation, shared-map ownership and UI behavior. File organization does not establish a performance improvement; measure in the target host.

- Current working checkout: `/workspace/map-ex-current`, based on commit **`968375a5d0f09fd2a79d45dd7a70fcc41a579aeb`**, `updating current activities v12`. Stages 19–46 are accumulated **uncommitted** work, including new modules/tests. Preserve them; no commit, push or deployment was made.
- The earlier `/workspace/map-ex-synced` checkout retains accumulated local edits. Do not reset it or copy its older runtime over this checkout.
- Stages 1–14 and the geometry/solve-history runtime code are present in this commit. The previous handoff's stage 15 helper and stage 16 integration/build-check files were **absent from the baseline**. Stage 20 adds a newly implemented controlled integration suite; the build checker remains absent. Final-solve recovery was inline at that baseline; stage 22 now extracts it with fresh characterization and integration coverage.
- The user's client is Experience Builder **1.21**. Delivery of an installer does not confirm installation or browser validation. No commit, push or deployment was made during this continuation.

Read [architecture](docs/development/architecture.md), [routing validation](docs/development/routing-validation.md) and [solve history](docs/development/capture-solve-history.md). Preserve all local edits and untracked feature files.

## Completed stages

| Order | Stage | Main result | Installer |
| --- | --- | --- | --- |
| 1 | Widget lifecycle safety | Startup cancellation, deferred-work disposal, exact ownership of shared-map resources and stylesheet cleanup. | `apply-widget-lifecycle-safety.cjs` |
| 2 | Route generation safety | One active route run, stale-result guards and provider cancellation; older runs cannot overwrite newer UI state. | `apply-route-generation-safety.cjs` |
| 3 | Detection controller extraction | Traffic-sign/object layer creation, replacement, styling and disposal moved into `DetectionLayerController`. | `apply-detection-controller-refactor.cjs` |
| 4 | Pure route scoring extraction | Segment scoring, corridor decisions, stop ownership, diagnostics, target deduplication and summaries moved out of the widget. | `apply-route-scoring-refactor.cjs` |
| 5 | Routing defaults fix | Intentional behavior/configuration fixes: finite priorities, existing thresholds/caps enforced, complete stop-reason type. | `apply-routing-defaults-fix.cjs` |
| 6 | Adaptive corridor extraction | Synchronous corridor build/select loop moved into `adaptiveCaptureSelection`; widget reduced by 100 lines in this stage. | `apply-adaptive-corridor-refactor.cjs` |
| 7 | Final-solve batch-pruning extraction | Calibration, efficiency ranking and removal plan moved into `finalSolveBatchPruning`; widget reduced by 66 lines. | `apply-final-solve-pruning-refactor.cjs` |
| 8 | OSRM preflight batch-pruning extraction | Generic batch calibration and removal plan moved into `preflightBatchPruning`; widget reduced by another 51 lines. | `apply-preflight-pruning-refactor.cjs` |
| 9 | Preflight diagnostics extraction | Anchor ownership/snap ranking and leg construction/top-ten ranking moved into `preflightDiagnostics`; widget reduced by another 45 lines. | `apply-preflight-diagnostics-refactor.cjs` |
| 10 | Trial-preflight quality extraction | Three raw internal-traversal predicates consolidated into `trialPreflightQuality`; widget reduced by another 83 lines. | `apply-trial-preflight-quality-refactor.cjs` |
| 11 | Replacement-pair ranking extraction | Addition/removal candidate filtering, pairing and ranking moved into `replacementPairRanking`; widget reduced by another 68 lines. | `apply-replacement-pair-ranking-refactor.cjs` |
| 12 | Network-penalty scoring extraction | Leg-cost attribution, cleanup filtering and candidate ranking moved into `captureNetworkPenalties`; widget reduced by another 98 lines. | `apply-network-penalties-refactor.cjs` |
| 13 | Near-budget probe comparison extraction | Network/fitting/progress winner comparisons and result types moved into `budgetProbeComparison`; widget reduced by another 61 lines. | `apply-budget-probe-comparison-refactor.cjs` |
| 14 | Adaptive network-removal plan extraction | Overrun-based limits and ordered removal-ID planning moved into `adaptiveNetworkRemoval`; widget reduced by another 17 lines. | `apply-adaptive-network-removal-refactor.cjs` |
| 15 | Final solved-route selection extraction (historical report) | Not present in this commit; recovery remains inline in the widget. Do not assume this stage is installed. | `apply-final-capture-selection-refactor.cjs` |
| 16 | Routing integration verification (historical report) | Integration fixtures and bundle checker are absent from this commit; previous results cannot be reproduced here. | `apply-routing-integration-checks.cjs` |
| 17 | Route geometry safety fix | Validate geometry before clearing/loading route graphics or publishing malformed final results. Intentional behavior fix; valid styling, coordinate references and cancellation are retained. | `apply-route-geometry-safety-v2.cjs` (recommended; v1 also exists) |
| 18 | Best-solve bookkeeping | Route/time/opportunity snapshots consolidated in a run-local `CaptureSolveHistory`; strict ties and copying semantics preserved. | `apply-capture-solve-history.cjs` |
| 19 | Milestone reconciliation and geometry regressions | Correct checkout/status and validation instructions; add geometry/drawing checks. No production runtime changes. | `apply-milestone-reconciliation.cjs` |
| 20 | Controlled routing integration coverage | Actual widget methods with controlled provider promises; retry recovery, preflight pruning, cancellation and final summary ownership. No runtime changes. | `apply-route-integration-coverage.cjs` |
| 21 | Route-result assembly extraction | Pure typed result builder preserves legacy fields, numeric semantics and coordinate references; widget reduced by 85 lines. | `apply-route-data-refactor.cjs` |
| 22 | Final retry recovery extraction | Typed helper pairs the chosen solve and its opportunity snapshot; strict budget/improvement checks and warnings preserved. | `apply-final-selection-refactor.cjs` |
| 23 | Final coverage reporting extraction | Synchronous summary and 20 ordered diagnostics moved out of the widget; widget reduced by 54 lines. | `apply-coverage-report-refactor.cjs` |
| 24 | Main preflight quality extraction | Rounded-diagnostic classification, cleanup gating and owner set moved into a typed helper; raw trial checks remain separate. Widget reduced by 37 lines. | `apply-preflight-quality-refactor.cjs` |
| 25 | Replacement-probe winner extraction | Value-first/time tie-break and winner record moved into a typed helper; added complete replacement-path integration case. Widget reduced by 30 lines. | `apply-replacement-probe-refactor.cjs` |
| 26 | ArcGIS provider resolution extraction | World/auth, portal discovery branch and custom URL policy moved out of the widget; SDK/login ownership retained. Widget reduced by 122 lines. | `apply-provider-resolution-refactor.cjs` |
| 27 | Provider construction extraction | OSRM/ArcGIS factories, options and logs moved into a typed module; late SDK/mode reads preserved. Widget reduced by 77 lines. | `apply-provider-factory-refactor.cjs` |
| 28 | A/B marker construction extraction | Point geometry and 2D/3D symbol construction moved out; widget retains removal, ownership and stored references. Widget reduced by 27 lines. | `apply-route-marker-refactor.cjs` |
| 29 | Routing authentication helpers | Portal discovery and authentication-failure policy moved into a routing module; SDK/login/feedback ownership retained. Widget reduced by 29 lines. | `apply-routing-auth-refactor.cjs` |
| 30 | Runtime routing settings extraction | Pure engine/mode change plans preserve busy guards, OSRM drive coercion and generated-route invalidation. Widget reduced by 59 lines. | `apply-runtime-routing-refactor.cjs` |
| 31 | Legacy routing cleanup | Remove the unreferenced widget solve bridge and correct outdated provider/authentication comments. No new modules or behavior changes; widget reduced by 59 lines. | `apply-routing-legacy-cleanup.cjs` |
| 32 | Initial selection reporting extraction | Two reporting entry points preserve the empty-corridor/selection guards and diagnostics. Widget reduced by 22 lines; both early exits integration-tested. | `apply-selection-report-refactor.cjs` |
| 33 | Cumulative delivery checkpoint | Replay stages 19–32, test installed output and verify exact reverse rollback; supply a cumulative installer. No new runtime change. | `apply-refactoring-checkpoint.cjs` |
| 34 | Final route evaluation extraction | Synchronous geometry validation, target selection and both coverage evaluations moved together; widget reduced by 35 lines. | `apply-route-evaluation-refactor.cjs` |
| 35 | Main snap classification consolidation | Advisory/hard snap rules moved into the existing quality module; thresholds, owner exclusions and rejection flow preserved. | `apply-preflight-snaps-refactor.cjs` |
| 36 | Trial preparation consolidation | Three probe branches share pure ordered opportunity/stop/owner preparation; requests and run checks stay in the widget. Widget reduced by 15 lines. | `apply-trial-plan-refactor.cjs` |
| 37 | Guarded route renderer extraction | Drawing moves behind a typed live host; widget retains layer clearing/teardown. Existing async guards and partial-failure order preserved. Widget reduced by 29 lines. | `apply-route-renderer-refactor.cjs` |
| 38 | Unused Turbo renderer cleanup | Remove unreferenced widget renderer and unused import; native coverage styling unchanged. Widget reduced by 119 lines. | `apply-unused-turbo-renderer-cleanup.cjs` |
| 39 | Retired tile-cache cleanup | Remove unreferenced feature-layer pruning routine and seven bookkeeping maps; active native coverage unchanged. Widget reduced by 47 lines. | `apply-legacy-tile-cache-cleanup.cjs` |
| 40 | Minimap basemap-copy extraction | Standard-ID, JSON and existing fallback policy moved to a typed helper; map/view lifecycle retained. Widget reduced by 40 lines. | `apply-minimap-basemap-refactor.cjs` |
| 41 | Minimap layer construction extraction | Active style copies and native minimap coverage construction moved together; insertion/tracking order retained. Widget reduced by 68 lines. | `apply-minimap-layers-refactor.cjs` |
| 42 | Minimap click-selection extraction | Nearest-image math moved out; 5m/current-image guards and async handler retained. Added four actual click-handler cases. Widget reduced by 15 lines. | `apply-minimap-selection-refactor.cjs` |
| 43 | Minimap tracking regression checkpoint | Add 27 actual-method checks for graphic reuse, navigation deduplication, line replacement and teardown. Tests/documentation only. | `apply-minimap-tracking-tests.cjs` |
| 44 | Minimap click-handler extraction | Complete handler moved into existing selection module with live host adapters; requests, updates and error boundaries preserved. Widget reduced by 39 lines. | `apply-minimap-handler-refactor.cjs` |
| 45 | Minimap view-options extraction | Initial center/zoom and native options moved together; lookup/read order, constructor and lifecycle guards retained. Widget reduced by 12 lines. | `apply-minimap-options-refactor.cjs` |
| 46 | Cumulative checkpoint v2 | Replay stages 19–45, test installed output, audit relative imports and verify exact rollback; provide one cumulative installer. No new runtime changes. | `apply-refactoring-checkpoint-v2.cjs` |

## Installer order and compatibility

**Latest cumulative option:** `apply-refactoring-checkpoint-v2.cjs` consolidates stages 19–45 plus this delivery milestone. It supports the committed `968375a` baseline and recognized per-file revisions from those incremental installers, including checkpoint v1 and a fully updated stage-45 checkout. Use dry-run first. Unknown edits in affected files are refused; unrelated files are untouched. Matching files are skipped.

```sh
node apply-refactoring-checkpoint-v2.cjs --dry-run
node apply-refactoring-checkpoint-v2.cjs
```

Keep the checkpoint backup folder. `--uninstall` restores the exact state immediately before v2 application, which may be partially updated rather than the Git baseline. Uninstall v2 before rolling back earlier installers. If runtime files were updated, restart the client and hard-refresh. On a stage-45 checkout, v2 only updates the delivery documentation. No dependency reinstall is needed.

The older `apply-refactoring-checkpoint.cjs` (stage 33/v1) covers stages 19–32 only. Its validation is retained below as history. Neither checkpoint is a complete widget release or a replacement for changes committed before `968375a`.

The previous handoff located stage 7–18 installers in `/workspace/shared/downloads/`; that location is not available in this continuation. Historical installer names are references, not proof that artifacts or installations are present. Stage 19 is delivered under `/workspace/artifacts/`. Save artifacts separately when changing environments. Stage 1–6 filenames above are historical references; their changes are already in the Git baseline. Do not reinstall stages already present in the user's source.

For an older checkout, verify actual source and required runtime prerequisites before using historical incremental installers; the table alone is not an installation recipe. Each installer is incremental; none is a complete release. Stage 16 adds checks/documentation only. Runtime changes require restarting the client and hard-refreshing; no dependency reinstall is needed for these source updates.

**Geometry installer correction:** the user reported that v1 stopped with `Expected source block not found uniquely: src/runtime/widget.tsx`. That was a preflight failure: nothing changed. A reordered-import checkout reproduced this error. Prefer **`apply-route-geometry-safety-v2.cjs`**, which uses the installed client's TypeScript parser to recognize the affected methods, tolerates import order/formatting/BOM/CRLF and refuses unknown logic. It applies the runtime fix and updates recognized existing test fixtures; it does not reproduce v1's full documentation/test payload. If v1 already succeeded, the runtime fix does not need reinstalling.

Stage 18, **`apply-capture-solve-history.cjs`**, also uses method-based matching and supports v2 output. It preserves existing milestone text by appending a continuation note, rather than requiring an exact earlier documentation version. This consolidated milestone supersedes those appended handoff notes.

```sh
node apply-capture-solve-history.cjs --dry-run
node apply-capture-solve-history.cjs
```

The example assumes geometry safety and prior required runtime stages are present. Keep installer backups. Uninstall later changes first, using each installer's own `--uninstall`; rollback refuses subsequent local edits and corrupted backups. Do not force-patch unknown source.

## Boundaries to preserve

- [OwnedMapResources](src/features/map-graphics/OwnedMapResources.ts) tracks exact owned instances; unrelated, borrowed and same-ID resources must survive cleanup.
- [RouteGeneration](src/features/routing/RouteGeneration.ts) and [provider cancellation](src/utils/routingCancellation.ts) retain ownership checks after awaits. Old runs cannot publish, clear newer busy state, attach graphics or restore a stale camera.
- [DetectionLayerController](src/features/detections/DetectionLayerController.ts) owns detection layer lifecycle/appearance; widget state and cross-feature coordination remain in the widget.
- [Capture scoring](src/features/routing/captureRouteScoring.ts) and [adaptive selection](src/features/routing/adaptiveCaptureSelection.ts) remain synchronous local work. Provider calls, progress, toasts and cancellation remain with the widget.
- [Final-solve pruning](src/features/routing/finalSolveBatchPruning.ts) uses the existing **0.96** reserve; [preflight pruning](src/features/routing/preflightBatchPruning.ts) uses **0.85**. Preserve the 1–6 calibration clamp, 0.25-minute floors, stable ties, ID-based removals and A-to-B survivor ordering.
- [Preflight diagnostics](src/features/routing/preflightDiagnostics.ts) round values before main quality decisions. [Trial quality](src/features/routing/trialPreflightQuality.ts) uses **raw** values, inclusive 450m/4.5min thresholds and first-failure short-circuiting. Do not unify their precision rules.
- [Replacement ranking](src/features/routing/replacementPairRanking.ts) caps additions/removals at five **before** pairing, requires gain above 25, preserves current anchor accounting and returns at most five probe pairs.
- [Network penalties](src/features/routing/captureNetworkPenalties.ts) preserve full/split attribution, sentinel and cleanup exclusions, the 2–4 minute threshold, 100m denominator floor and stable ranking. [Removal planning](src/features/routing/adaptiveNetworkRemoval.ts) preserves 1/2/4/6 limits at overrun ratios 1.4/2/3 and ID-set count semantics.
- [Probe comparison](src/features/routing/budgetProbeComparison.ts) preserves the 0.25 relief floor, strict 0.5 cost advantage, inclusive 0.5 tie band, higher-extra-time tie preference and strict 0.1-minute progress threshold. Quality/fit gates and fitting-over-progress fallback remain in the widget.
- [Final recovery](src/features/routing/finalCaptureSelection.ts), newly extracted in stage 22, pairs a selected solved route with its own opportunities. [CaptureSolveHistory](src/features/routing/CaptureSolveHistory.ts) holds route/time/shallow snapshot together **per run**; strictly lower extra time wins, ties retain the first winner and losing solves do not copy selections.

## Intentional fixes, separate from extraction

Stage 5 explicitly sets neutral `centerDistanceWeight = 0`, enforces the existing 12m useful-length/weighted-new-coverage floors and 40-candidate limit, and shares the complete stop-reason type including `anchor-cap`. Do not silently retune these values.

Stage 17 fixes a reproduced exception: drawing an empty array could clear the existing route and then throw. [Geometry validation](src/features/routing/captureRouteGeometry.ts) now rejects empty, short, sparse, mixed or nonfinite paths before SDK layer loading/clearing and before final-route coverage evaluation/publication. Valid coordinates, altitude ordinates, references and purple-line styling remain intact. This was a behavior fix, not merely file extraction.

## Current verification (stage 46)

- All **47 available focused test files passed**, including 20 view-options comparisons, 17 full-handler comparisons, 27 tracking checks, 17 minimap-selection comparisons and four click-handler cases, 26 minimap-layer comparisons, 26 basemap comparisons, existing minimap lifecycle checks, 26 renderer comparisons, 14 trial-plan tests, 17 snap-classification tests, 17 final-evaluation tests, 13 selection-report tests, 21 runtime-settings tests, 30 authentication-helper tests, 18 marker tests, 18 provider factory tests, 23 provider-resolution tests, 17 replacement-comparison tests, 21 main-quality tests, 12 coverage-report tests, 14 final-selection tests, 14 result-assembly tests, 25 integration tests and the geometry regressions. The historical 24-file/405-test report below is not a current result.
- Strict TypeScript passed for minimap view options, minimap selection, minimap layers, minimap basemap policy, the renderer, trial preparation, main preflight quality/snap classification, final evaluation, selection reporting, runtime settings, routing authentication, the marker factory, provider construction, provider resolution, replacement-probe comparison, the main preflight classifier, coverage reporter, final-selection helper and result builder with their dependencies. Stages 19–20 did not change runtime files; stages 21–30 move result assembly, final selection, coverage reporting, main quality classification, replacement comparison, provider resolution/construction, markers, authentication helpers and runtime-settings policy.
- Documentation: 97 Markdown files, 343 local links, zero broken links. Repository layout: 805 source files, zero errors. `git diff --check` passed.
- The incremental installer passed eight checks across LF and BOM/CRLF inputs: dry-run, exact application, repeat/rollback and refusal to overwrite unknown edits.
- Full Experience Builder 1.21 build, browser routing integration and playback performance remain unverified.

## Cumulative delivery verification (stage 46)

All 27 installers from stages 19–45 passed dry-run, application and repeat application on an isolated copy of commit `968375a`. The resulting **70 affected files matched** the stage-45 workspace byte-for-byte. All **47 focused test files passed on that installed copy**. Reverse-order uninstall restored the entire committed baseline source tree exactly.

Checkpoint v2 passed **32 safety checks** across baseline, stage-20, stage-33 and stage-45 file states with both LF and BOM/CRLF inputs: read-only dry-run, supported application, repeat/exact rollback and unknown-edit refusal. A static audit of **894 relative imports across 360 source files** found no missing local targets. This checks target existence, not named exports, SDK compatibility or bundling.

Stage 46 changes delivery documentation only. Full Experience Builder 1.21 build/browser verification and live playback measurements remain pending.

## Historical cumulative delivery verification (stage 33)

On an isolated copy of commit `968375a`, all 14 installers from stages 19–32 passed dry-run, application and repeat application. The resulting 41 affected files matched the working source byte-for-byte. All 34 focused test files passed on that installed copy. Uninstalling those stages in reverse order restored the entire original source tree exactly.

The cumulative checkpoint additionally passed 24 checks across baseline, stage-20 and stage-32 file states with LF and BOM/CRLF inputs: read-only dry-run, supported application, repeat application/exact rollback and refusal to overwrite unknown edits. These are delivery checks, not live Experience Builder validation. No runtime code was added or changed in stage 33.

## Historical validation report (not reproduced from this commit)

The table below preserves the previous handoff report. Missing integration/build files prevent reproducing it in this checkout. Do not present its 405-test or isolated-build results as current verification. See the current checks in [routing validation](docs/development/routing-validation.md).

| Check | Result and scope |
| --- | --- |
| Focused regressions | **405 tests across 24 files passed**, including 13 solve-history tests. This is not a full repository test pass. |
| Characterization | Previous calculations are frozen under `tests/fixtures/`; tests compare outputs, diagnostic/distance-call order, boundaries, ties, nonfinite inputs, snapshot identity and deterministic varied cases. |
| Route integration | Actual widget method with controlled provider promises and mocked view/rendering/coverage inputs: final/preflight cancellation, overlapping runs, drawing cancellation, worse/better retries and correct final opportunity summaries. |
| TypeScript | Strict checks passed for the extracted routing modules and dependencies; changed TS/TSX syntax checks passed. |
| Isolated bundle | Runtime and settings built with **Experience Builder 1.20.0 rules**, **zero errors and warnings**, using Mapillary JS **4.1.2**, pbf **5.1.2**, vector-tile **3.0.0**. |
| Installed output | Geometry v2 followed by solve-history installation on reordered-import source passed the same **405-test suite** and isolated bundle check. Reverse-order rollback restored original source. |
| Installer safety | Dry-run, apply, repeat application, exact rollback, BOM/CRLF, import order, formatting/comments, unrelated-edit preservation, unknown-code refusal and backup integrity checked. Earlier original installer stages were also replayed in sequence with reverse rollback; this is not confirmation of the user's installation. |
| Documentation/layout | Local Markdown links, repository layout and `git diff --check` passed. |

The isolated build checker uses host loader/external rules, disables the loader worker pool and writes temporary SystemJS bundles. It omits full host packaging and uses the host's **transpile-only** loader. The existing host widget link and dependency folder were left unchanged; documented dependency versions were installed separately for the check.

**Still unverified:** full Experience Builder **1.21** build, live ArcGIS/Mapillary behavior, mobile/RTL presentation and playback performance. Previously observed `coverageAnalysisReliability.test.cjs` failures also occurred on the baseline; the focused routing suite does not establish a clean full repository run.

## Reproduce checks

Use installed TypeScript, or set `MAPILLARY_TYPESCRIPT` to its location. This continuation used `/tmp/map-ex-validation/node_modules/typescript/lib/typescript.js` with TypeScript 5.9.3; that temporary path is not a portable dependency.

```sh
node --test tests/minimapViewOptions.test.cjs tests/minimapClickHandler.test.cjs tests/minimapTracking.test.cjs tests/minimapSelection.test.cjs tests/minimapLayers.test.cjs tests/minimapBasemap.test.cjs tests/minimapLifecycle.test.cjs tests/nativeSequenceSelection.test.cjs tests/coverageHoverRuntime.test.cjs tests/captureRouteRenderer.test.cjs tests/captureTrialPlan.test.cjs tests/preflightSnaps.test.cjs tests/captureRouteEvaluation.test.cjs tests/captureSelectionReport.test.cjs tests/runtimeRoutingSettings.test.cjs tests/routingAuthentication.test.cjs tests/routePointGraphic.test.cjs tests/captureProviderFactory.test.cjs tests/routingProviderResolution.test.cjs tests/replacementProbeComparison.test.cjs tests/preflightQuality.test.cjs tests/captureCoverageReport.test.cjs tests/finalCaptureSelection.test.cjs tests/captureRouteData.test.cjs tests/captureRouteIntegration.test.cjs tests/captureSolveHistory.test.cjs tests/captureRouteGeometry.test.cjs tests/adaptiveNetworkRemoval.test.cjs tests/budgetProbeComparison.test.cjs tests/captureNetworkPenalties.test.cjs tests/replacementPairRanking.test.cjs tests/trialPreflightQuality.test.cjs tests/preflightDiagnostics.test.cjs tests/preflightBatchPruning.test.cjs tests/finalSolveBatchPruning.test.cjs tests/adaptiveCaptureSelection.test.cjs tests/routingDefaults.test.cjs tests/captureRouteScoring.test.cjs tests/routeGeneration.test.cjs tests/routingCancellation.test.cjs tests/routePreviewSimulation.test.cjs tests/sequenceV6Runtime.test.cjs tests/detectionLayerController.test.cjs tests/ownedMapResources.test.cjs tests/startupDisposal.test.cjs tests/coverageClickDispatch.test.cjs tests/coverageStartup.test.cjs
npx --no-install tsc --strict --noEmit --target es2020 --lib es2020,dom src/features/minimap/minimapViewOptions.ts src/features/minimap/minimapSelection.ts src/features/minimap/minimapLayers.ts src/features/minimap/minimapBasemap.ts src/features/routing/captureRouteRenderer.ts src/features/routing/captureTrialPlan.ts src/features/routing/captureRouteEvaluation.ts src/features/routing/captureSelectionReport.ts src/features/routing/runtimeRoutingSettings.ts src/features/routing/routingAuthentication.ts src/features/routing/routePointGraphic.ts src/features/routing/captureProviderFactory.ts src/features/routing/routingProviderResolution.ts src/features/routing/replacementProbeComparison.ts src/features/routing/preflightQuality.ts src/features/routing/captureCoverageReport.ts src/features/routing/finalCaptureSelection.ts src/features/routing/captureRouteData.ts src/features/routing/CaptureSolveHistory.ts src/features/routing/captureRouteGeometry.ts src/features/routing/adaptiveNetworkRemoval.ts src/features/routing/budgetProbeComparison.ts src/features/routing/captureNetworkPenalties.ts src/features/routing/replacementPairRanking.ts src/features/routing/trialPreflightQuality.ts src/features/routing/preflightDiagnostics.ts src/features/routing/preflightBatchPruning.ts src/features/routing/finalSolveBatchPruning.ts
node tools/check-docs.cjs
node tools/check-repository.cjs
git diff --check
```

The previously documented `tools/check-exb-build.cjs` is absent. Use the target client's normal build/start workflow; see [routing validation](docs/development/routing-validation.md) for the current scope and host checks.

## Next session

1. Inspect actual Git state, installed modules and local edits. Preserve untracked modules and backups; do not reset or replay stashes blindly.
2. Confirm the actual local source and whether cumulative or incremental installers were used. The checkpoint supports recognized stage 19–32 revisions; never force an unsupported preflight. Confirm whether geometry v2 and solve history were applied on the user's machine. If preflight fails, inspect the specific unsupported code; never bypass protection with a forced overwrite.
3. Prioritize the target **1.21** normal build and browser checks: budget-fit/pruned/recovered routes, cancellation during requests/drawing, view/map changes, coverage/detection controls and ordinary imagery playback.
4. Review remaining orchestration for one cohesive extraction using the restored integration suite and focused characterization. See the routing-validation guide for coverage limits. Keep provider awaits, run checks, UI and graphics ownership with the current owner. Any next extraction needs prior-output characterization and one reviewable installer.
5. Treat adjacent behavior fixes separately: generic OSRM preflight still logs its summary twice; `maxFinalStops` documentation includes endpoints while some intermediate-anchor accounting uses the full limit. Neither was changed by the later extractions.

Suggested resume prompt:

> Read REFACTORING-MILESTONE.md and the routing-validation/solve-history guides. Inspect and preserve actual local changes. Resume after stage 46; use the newly extracted final-selection helper; the historically reported build checker is still absent. Use the restored stage 20 controlled integration suite. Verify the user's geometry-v2 and solve-history installation, prioritize Experience Builder 1.21 host checks, and review remaining orchestration before proposing another bounded extraction. Preserve behavior, cancellation and resource ownership; deliver a reversible installer for any code change.

<!-- isolated-build-check-stage47 -->
## Stage 47 — isolated build verification

The source checkpoint is `609b81c` (v13). The isolated runtime/settings checker is restored at `tools/check-exb-build.cjs`; no runtime source changes are introduced. Current-source verification passed 855 tests across 47 focused files, strict extracted-module TypeScript, and an isolated Experience Builder 1.20.0 build with zero errors/warnings using Mapillary JS 4.1.2, pbf 5.1.2 and vector-tile 3.0.0.

This does not establish full target 1.21 packaging/browser compatibility or performance. Run the target client's normal build and the remaining live scenarios. See [checker usage and limits](docs/development/isolated-build-check.md). The tooling installer is additive, preserves existing notes and does not require a runtime restart.

<!-- viewer-presentation-stage48 -->
## Stage 48 — viewer presentation boundary

Extracted viewer surface, nearby/associated image tray, fullscreen/minimap chrome, styles and the runtime state contract. Requests, portals, SDK DOM ownership and selection timing stay with the runtime. The widget is reduced from 12,915 to 12,371 lines and still requires further controller extraction before it becomes a minimal entry. No runtime dependencies were added.

885 focused tests passed across 48 files, including 30 before/after presentation checks. Chromium passed 14 controlled layout/identity checks (desktop/mobile, LTR/RTL, tray scroll and SDK child retention) with SDK/control stubs. New presentation/style/state modules have no strict diagnostics; existing dependency/repository diagnostics prevent claiming a clean full typecheck. No additional widget diagnostics were introduced relative to the baseline. Isolated ExB 1.20 runtime/settings bundles passed with zero errors/warnings; target 1.21 normal build/live behavior/performance remain unverified.

See [presentation architecture and validation](docs/development/viewer-presentation.md). Installer: `apply-viewer-presentation-refactor.cjs`. It preflights known v13 runtime/types sources, refuses unknown edits and supports exact rollback. Restart the client and hard-refresh after application; no dependency reinstall. Continue with coherent controller boundaries rather than moving the remaining monolith wholesale.

<!-- widget-documentation-stage49 -->
## Stage 49 — runtime contributor documentation

Documentation-only audit after stage 48: reviewed 82 member descriptions and eight startup/request ownership counters. Corrected obsolete CDN startup, fullscreen, export, associated-image and sprite-preload descriptions; removed duplicate legacy preambles. See [runtime reading guide](docs/development/runtime-reading-guide.md) for entry points, ownership rules and comment conventions.

The full runtime syntax tree is unchanged, and emitted JavaScript with comments removed is byte-identical to the stage-48 input. All 885 focused regressions pass; all 47 JSDoc parameter names match signatures. Documentation links and repository layout checks pass. No runtime behavior, dependencies or fullscreen fixes are introduced. Existing full-repository type diagnostics and target 1.21/live-SDK validation remain separate.

Installer: `apply-widget-documentation.cjs` (known stage-48 runtime; BOM/CRLF supported). Preflight refuses unknown edits; backups support exact rollback. Uninstall stage 49 before rolling back stage 48. Continue refactoring from the presentation boundary with these lifecycle/request contracts.

<!-- v5-phase1-foundation-stage50 -->
## Stage 50 — Version 5.0 phase-1 foundation

Added a complete portable runner/preflight/report and test-environment guide. Six new runner/real-codec checks pass. With complete test dependencies, 185 Node files report **2,175 tests: 2,034 pass, 141 fail**; the pre-cleanup stage-49 application source under the same environment reproduces identical totals and failing names. No failures are suppressed or automatically accepted. See [baseline and failure inventory](docs/development/test-baseline.md) and [reproduction guide](docs/development/portable-tests.md).

Removed five unused imports, the token-value debug log and the empty root `.gitkeep`. Emitted runtime code changes only by removal of that debug log. Token-source behavior and saved config fields are preserved. Docs now match manifest ExB 1.21 and document directly imported pako 2.2.0. The isolated ExB 1.20 runtime/settings build passes with zero errors/warnings; target 1.21 production/live SDK acceptance remains outstanding. No host packages, credentials or license choices were changed.

Installer: `apply-v5-phase1-foundation.cjs`, targeting the known stage-49 source. Keep backups for exact rollback; uninstall stage 50 before older stages. From the target client, install the documented direct pako dependency if needed, then restart. Legacy files, migrations and assets remain. Next work: individually diagnose the 141 remaining loader/assertion failures without weakening requirements or blanket rebaselining.

<!-- point-cloud-fixture-repair-stage51 -->
## Stage 51 — point-cloud fixture repair

All 257 point-cloud tests across 17 suites plus four English fixture checks pass (261 focused). Full suite: **2,194 tests, 2,135 pass, 59 fail**, all 186 files included. The former 82 point-cloud failure reports are resolved; the other failing names are unchanged. This corrects the earlier conversational count of 92. Fourteen extra map-layer cases now execute instead of one module-load failure; five new fixture/format checks also execute.

Shared bindings use actual English catalogs, formatters and shipped text-only wrappers. SDK/clocks/writers and side-effect assertions remain suite-owned. Only rendered-toast text grouping/ordinary whitespace is canonicalized; props/styles, wording, counts, duration, state/order and non-toast identity stay checked. Calibration explicitly adapts historical compact-unit/XYZ spacing and separately asserts exact current feedback. No frozen fixtures or existing assertions were removed.

A real feedback typo was fixed: one JSX space separated `cluster` from `s`. No other production source changed. Restoring that old space in a temporary control makes 13 result tests fail. The isolated ExB 1.20 bundle passes with zero errors/warnings; target 1.21/live SDK acceptance remains separate. A guide's reference to absent worker-thread tests is corrected, not treated as evidence.

See [full baseline](docs/development/test-baseline.md) and [point-cloud notes](docs/development/point-cloud.md). Installer: `apply-point-cloud-fixture-repair.cjs` after stage 50; preserve backups for exact rollback and uninstall newer stages first. No package reinstall. Next: individually diagnose the other 59 failures, starting with field-note locale bindings, without weakening assertions.

<!-- field-note-fixture-repair-stage52 -->
## Stage 52 — field-note fixture repair

All 46 draft/file/collection tests plus four shared English fixture checks pass (50 focused). Full portable run: **2,195 tests, 2,163 pass, 32 fail**, all 186 files included. The former 27 target failure reports are resolved; remaining failing names are unchanged. One new exact count-feedback case executes.

The three suites reuse actual English bindings. Only four historical Turkish alerts and counted import wording are adapted on the frozen comparison side; note data, error objects, clocks, identities, storage/FileReader/publication operations and save/editor guards remain exact. Zero/singular/plural import and duplicate counts have explicit assertions. A temporary wrong duplicate-count control fails three file tests. No frozen JSON or original assertion calls were removed.

All production source files and dependencies are unchanged relative to stage 51. This is test/documentation work; it does not establish live SDK, multilingual or authenticated Enterprise permission acceptance. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-field-note-fixture-repair.cjs`, after stage 51. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 32 failures individually, starting with coverage-analysis bindings; do not force a green run by discarding tests or blanket-updating snapshots.

<!-- coverage-analysis-fixture-repair-stage53 -->
## Stage 53 — coverage-analysis fixture repair

The reliability suite now compiles runtime snippets as TSX and uses the existing actual English bindings. Its lifecycle guard is identified by analysis-input ownership instead of statement position. All 17 existing cases and assertions remain, with four new cases covering pending-classifier cancellation, late progress/results, newer-run ownership, replaced views and rate-limit cooldown feedback.

Focused result: **25 passed** (21 reliability tests plus four shared-fixture checks). Complete portable run: **2,199 tests, 2,173 pass, 26 fail**, across all 186 files. The six previous coverage-analysis failures are resolved, with no newly failing names. Removing only the post-classification stale-result guard in a temporary copy makes three new late-result tests fail.

All 449 production-source/frozen-fixture files remain unchanged from stage 52; no dependencies changed. The classifier is stubbed: this validates orchestration, not classification accuracy or real server/GPU behavior. No new bundle or live ExB 1.21 acceptance is claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-coverage-analysis-fixture-repair.cjs`, after stage 52. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 26 failures individually, starting with detection-label fixture bindings; retain every suite and behavior assertion.

<!-- detection-label-fixture-repair-stage54 -->
## Stage 54 — detection-label fixture repair

The AI viewer label fixture now explicitly supplies its missing bounds adapter, matching the existing detection-exploration fixture. Bounds are inert in this label-only harness. Controlled timers, pointer hits and viewer events retain all three original cases/15 assertions and add four regressions/22 assertions for panorama visibility, focus/all mode, viewer-removal cleanup and out-of-order hover hits.

Focused result: **20 passed** across AI-label toggle, exploration, map-label and display suites (seven AI-label cases). Full portable run: **2,203 tests, 2,180 pass, 23 fail**, across all 186 files. The three previous AI-label failure reports are resolved, with no newly failing names. Removing visibility forwarding in a temporary copy fails two cases; removing hover ownership checks fails the newer-pointer case.

All 449 production-source/frozen-fixture files remain unchanged from stage 53. No dependencies or production behavior changed. These tests use controlled SDK substitutes and do not establish live pointer/WebGL or ExB 1.21 acceptance. Optional Mapbox style-spec checks were not configured. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-detection-label-fixture-repair.cjs`, after stage 53. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 23 failures individually, starting with the info-panel footer fixture bindings; keep every suite and behavior assertion.

<!-- info-footer-fixture-repair-stage55 -->
## Stage 55 — info-panel footer fixture repair

The footer fixture now explicitly binds `useWidgetLocale` to the shared actual English catalog instead of returning styles for every unknown import. Unknown imports fail clearly and each case restores the original global `window` descriptor. All four original cases/eight assertions remain; two regressions/four assertions check replacement viewport/current height, live reduced-motion preferences and absent matchMedia.

Focused result: **10 passed** (six footer cases plus four English fixture checks). Complete portable run: **2,205 tests, 2,186 pass, 19 fail**, across all 186 files. Four previous footer failure reports resolved, with no newly failing names. Temporary relative-distance and forced-smooth-motion controls fail three and two cases respectively.

All 449 production-source/frozen-fixture files remain unchanged from stage 54. No dependencies or production behavior changed. Controlled component checks do not establish React-provider lifecycle, keyboard/focus, browser layout, screen-reader or live ExB 1.21 acceptance. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-info-footer-fixture-repair.cjs`, after stage 54. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: individually diagnose the remaining 19 failures, starting with native coverage alignment/terrain ownership; distinguish harness failures from production behavior defects and preserve all assertions.

<!-- native-alignment-fixture-repair-stage56 -->
## Stage 56 — native alignment / current terrain contracts

Two warm-playback fixture failures lacked the screen-direction owner now used by `drawCone`; that branch is explicitly recorded. Three legacy cases are migrated: retired DOM-pulse terrain projection/retry assumptions now exercise current `renderedGroundPoint` height/readiness safety, and old polygon-face apex assertions use mesh local vertices/origin and the current perimeter. The bounded DOM retry expectation is retired with its implementation; existing pulse tests independently require SDK draping and zero 3D frames. Mesh topology/reuse stays covered by the existing closed-mesh suite.

Focused result: **39 passed** (24 native-alignment, six pulse, nine mesh cases). Full portable run: **2,207 tests, 2,193 pass, 14 fail**, across all 186 files. Five previous alignment failure reports resolved; no newly failing names. All 43 assertion calls outside the three migrated cases remain exact. Two new cases check flat-ground/reference and invalid/throwing terrain samples. Factory calls are asserted outside contained callbacks. Temporary speculative-flat, lifted-apex and ignored-anchor mutations fail three, one and two cases respectively.

All 449 production-source/frozen-fixture files remain unchanged from stage 55; no dependency or production behavior changes. No new bundle or live SDK terrain/projection, browser/GPU or ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) for the explicit old-to-current assertion mapping and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-native-alignment-fixture-repair.cjs`, after stage 55. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: individually diagnose the remaining 14 failures, starting with Nearby foreground/runtime bindings; preserve request ownership, opt-in behavior and all active-path assertions.

<!-- nearby-foreground-fixture-repair-stage57 -->
## Stage 57 — Nearby foreground fixture repair

The foreground harness now selects only Nearby's four lifecycle statements (visibility declarations, demand assignment and visibility branch) instead of a prefix ending at another feature's guard. The old prefix had begun executing unbound route-generation reconciliation. A count assertion protects the boundary; original statement order remains.

Focused result: **30 passed** across foreground runtime, actual discovery-owner and coverage-anchor suites. All five original runtime cases/15 assertions remain; two regressions and the binding-count check add 17 assertions. New cases cover tab/hidden-widget demand, pointer reset, priority and paused/playback image transitions. Existing real-owner tests retain cancellation, stale-publication and background-slot checks. Temporary eligibility-removal and forced-immediate controls fail three cases each.

Full portable run: **2,209 tests, 2,197 pass, 12 fail**, across all 186 files. Both previous Nearby runtime failure reports resolved; no newly failing names. All 449 production-source/frozen-fixture files remain unchanged from stage 56, with no dependency changes. No new bundle or live SDK/browser/network timing/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-nearby-foreground-fixture-repair.cjs`, after stage 56. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining 12 failures individually, starting with Overture Places/runtime bindings; preserve category, confidence, caching, request ownership and opt-in behavior.

<!-- overture-places-fixture-repair-stage58 -->
## Stage 58 — Overture Places source-identity fixture repair

Five runtime fixtures now bind actual `placesSourceKey` instead of only the former external API URL helper. Both imagery fixtures supply runtime configuration and share one local extracted-method constructor. All 62 existing Overture cases/387 assertions remain exact; two new source-scope/overlapping-search regressions add 17 assertions.

Focused result: **85 passed** across Overture Places, configured runtime and Portal-source suites. New cases verify external/Portal/query-endpoint cache isolation and prevent an old completion from caching, clearing a newer controller or resynchronizing its owner. Temporary fixed-source and cache-write-removal controls fail the relevant assertions; the source-audit test also detects these deliberate edits.

Full portable run: **2,211 tests, 2,204 pass, 7 fail**, across all 186 files. Five previous Overture failures resolved; other failing names unchanged. All 449 production-source/frozen-fixture files remain unchanged from stage 57; no dependencies changed. No new bundle or live SDK/Portal permissions/service-scale/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-overture-places-fixture-repair.cjs`, after stage 57. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the seven remaining failures individually, starting with the Places API fixture; preserve source validation, category/confidence contracts and active behavior assertions.

<!-- places-api-fixture-repair-stage59 -->
## Stage 59 — Places API builder teardown fixture repair

The builder fixture now extracts actual `clearPlacesArea` and its preview/view/revision fields, required by current unmount. All three original API cases/19 assertions remain. A held abort-ignoring response regression adds ten assertions for controller detachment-before-abort, one preview destruction, cleared ownership, repeated unmount and no post-unmount state write. Temporary removal of cancellation or preview cleanup fails this case.

Focused result: **13 passed** across API and area-profile suites (four API and nine area cases). Complete portable run: **2,212 tests, 2,206 pass, 6 fail**, across all 186 files. Previous API builder failure resolved; no newly failing names. All 449 production-source/frozen-fixture files unchanged from stage 58; no dependencies changed. No new bundle, real HTTP/CORS, SDK builder rendering or ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-places-api-fixture-repair.cjs`, after stage 58. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining six failures individually, starting with the time-travel suite loading failure; preserve cancellation, stale-result guards and all active-path assertions.

<!-- time-travel-fixture-repair-stage60 -->
## Stage 60 — time-travel dependency fixture repair

The availability loader now follows actual pure-module relative dependencies with cached module records; the background queue shares that loader. Previously `geoUtils` was evaluated without `require`, so its current detection-label/presentation imports prevented all availability cases from registering. No helper is replaced with an empty mock.

All 24 original availability cases/61 assertion calls remain, with one import-boundary assertion added and no new cases. Focused result: **45 passed** (24 availability, five preview, 16 background queue). Temporary stale-apply-guard removal fails nine cases; removing cached-result assignment fails one. Cancellation, retry/coalescing and physical slot retention through JSON settlement remain checked.

Full portable run: **2,235 tests, 2,230 pass, 5 fail**, across all 186 files. The suite-load failure is replaced by 24 passing tests, raising the total by 23. Other five failing names unchanged. All 449 production-source/frozen-fixture files unchanged from stage 59; no dependencies changed. No new bundle or live Mapillary/SDK/browser/network-timing/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-time-travel-fixture-repair.cjs`, after stage 59. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the five remaining failures individually, starting with community-workspace client loading; preserve credential boundaries, cancellation and active-path assertions.

<!-- community-client-fixture-repair-stage61 -->
## Stage 61 — community-workspace client dependency fixture repair

The client fixture now follows its actual pure relative dependency graph, including attachment helpers, with cached module records and a non-relative import rejection. Previously the evaluator omitted `require`, so attachment support prevented all client cases from registering. Transport and clocks remain explicitly injected; no service connection is made.

All 30 existing cases/96 assertions remain unchanged; one import-boundary assertion added, no new cases. Focused result: **30 passed**. Temporary cookie-forwarding and exact-revision-truncation controls each fail an original case. Credential/key/endpoint boundaries, session expiry/disposal, invitations, whitelists and duplicate/revision checks remain active.

Full portable run: **2,264 tests, 2,260 pass, 4 fail**, across all 186 files. The suite-load failure becomes 30 passing existing cases, raising the total by 29. Other four failing names unchanged. All 449 production-source/frozen-fixture files unchanged from stage 60; no dependencies changed. No new bundle, deployed operator permissions, browser attachment persistence or live ExB 1.21 acceptance claimed. Full-run PostgreSQL/RLS suites remain included. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-community-client-fixture-repair.cjs`, after stage 60. Keep backups and uninstall newer stages first. No restart or dependency reinstall. Next: diagnose the remaining four failures individually, starting with detection-linked preview; preserve opt-in behavior, provenance and credential boundaries.

<!-- detection-preview-fixture-repair-stage62 -->
## Stage 62 — detection preview representation fixture

The legacy round-trip case now explicitly uses `detectionPreviewLink`; current `detectionNoteDescription` emits URN attachment metadata. A separate case validates that metadata through `attachmentMetadata`: IDs/bounds, absent attachment by default, optional saved identity, compatibility and no URLs/credentials/image bytes. Actual crop capture remains separately gated by `includePreview` in the runtime; it was not changed.

All 16 original assertion calls retained; one new current-format case adds 13 assertions. Focused result: **20 passed** across linked preview, field-note and crop-ownership suites. Dropped attachment identity and accepted zero-width controls each fail the relevant case in temporary source copies.

Full portable run: **2,265 tests, 2,262 pass, 3 fail**, all 186 files, zero skipped. Compared with recorded stage 61, the preview failure is resolved and other failing names unchanged. Temporary dependency packages were restored at their recorded versions after resume; the previous ephemeral full report was unavailable. All 449 production-source/frozen-fixture files unchanged; no production dependency changes. No new bundle or real browser/IndexedDB/SDK/Enterprise/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-detection-preview-fixture-repair.cjs`, after stage 61. Keep backups and uninstall newer stages first. No app restart or host dependency reinstall. Next: diagnose the three remaining failures individually, starting with regional locales; preserve semantic locale fallback and units rather than blindly updating a numeric ceiling.

<!-- regional-catalog-cleanup-stage63 -->
## Stage 63 — UK override deduplication / semantic regional contract

Removed 44 runtime and eight settings UK entries byte-for-byte equal to their US base. Effective merged text is exactly unchanged for all 1,210 runtime and 171 settings messages; 41/19 genuine overrides remain. Two arbitrary size ceilings are replaced by inheritance/key-coverage/value checks. All other 47 assertion calls, including placeholders, unit/device distinction, regional selection and formatting, remain. No cases added or removed.

Focused result: **59 passed**. Temporary redundant-override and corrupted-placeholder controls each fail. Complete portable run: **2,265 tests, 2,263 pass, 2 fail**, all 186 files, zero skipped; no newly failing names. Only the two UK catalog files changed under `src/`; other 447 source/frozen files unchanged. No dependencies changed.

Isolated Experience Builder **1.20.0** runtime/settings bundle passed with zero errors/warnings. This is transpile-only, not whole-project semantic checking or live ExB 1.21/browser/RTL acceptance. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-regional-catalog-cleanup.cjs`, after stage 62. Keep backups and uninstall newer stages first. No host dependency reinstall. Next: diagnose the remaining screen-direction-cone and text-button failures individually, starting with the phone close-zoom transform contract; preserve marker dimensions, projection/ground alignment and shared text-action sizing.

<!-- phone-cone-fixture-repair-stage64 -->
## Stage 64 — phone SVG-fallback ground-plane fixture

Replaced two obsolete camera-facing expectations in the close-zoom case with three ground-plane assertions: independently specified normalized projection `[1,0,0,0.1,0,0]` and shared marker/fan transform. Other 86 assertion calls remain exact, including nominal geometry, visibility, one overlay and zoom-return checks. The mobile predicate controls native sampling; it does not select a flat SVG mode. No production rendering changed or 14-screen-pixel unforeshortened 3D circle promised.

Focused result: **26 passed** across SVG fallback/native-marker suites; no new cases. Temporary flat-fan and separate-marker controls fail seven and three cases. Complete portable run: **2,265 tests, 2,264 pass, 1 fail**, all 186 files, zero skipped. The phone failure is resolved; text-button audit remains; no new failing names.

All 449 source/frozen files unchanged from stage 63, no dependency changes. No new bundle; stage 63's isolated 1.20 result still applies to this byte-identical production source. No live mobile/SDK/terrain/ExB 1.21 acceptance claimed. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-phone-cone-fixture-repair.cjs`, after stage 63. Keep backups and uninstall newer stages first. No app restart or host dependency reinstall. Next: diagnose the remaining shared text-action sizing audit in DetectionDisplayControls; distinguish text actions from icons and preserve control behavior.

<!-- detection-text-actions-stage65 -->
## Stage 65 — detection menu shared text-action sizing / clean portable baseline

Added `mly-text-action` to six existing text-button JSX sites: percentage presets, mode, overlap, label toggle, reset and close. Removing only those six additions exactly reproduces prior source, including callbacks, state, ARIA, styles and lifecycle. No new CSS policy/dependency or test changes. Restoring the prior component in a temporary copy fails the unchanged policy audit.

Focused result: **10 passed**. Complete portable run: **2,265 tests, 2,265 pass, 0 fail**, all 186 files, zero skipped, exit 0. The former final failure is resolved. Only DetectionDisplayControls changed under `src/`; other 448 source/frozen files unchanged from stage 64.

Isolated Experience Builder **1.20.0** runtime/settings bundle passed with zero errors/warnings. This is transpile-only; not target 1.21 normal host/build/browser, whole-project semantic or narrow translated/coarse-pointer/fullscreen portal acceptance. No publish/deployment or live permissions acceptance is implied. See [current baseline](docs/development/test-baseline.md) and [fixture conventions](docs/development/portable-tests.md).

Installer: `apply-detection-text-actions.cjs`, after stage 64. Keep backups and uninstall newer stages first. Refresh the running app; no host dependency reinstall. Optional existing ACCOUNT-HANDOFF receives a checkpoint banner without replacing its history. Next: establish target ExB 1.21 normal build/browser acceptance, checkpoint the actual reviewed tree when authorized, then choose the next cohesive extraction. Preserve requests, cancellation and shared-view ownership; do not equate a clean portable run with release readiness.
