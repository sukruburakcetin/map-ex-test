<!-- architecture-stage115 -->
## Current checkpoint

Stages 103–111 delivered P06–P09. Stages 112–114 covered the P10 keyboard, Enterprise attachment and image follow boundaries. Stage 115 documents the retained responsibilities and completes the P11 review. P12 is next. Use the browser matrix below and record the exact tested source for each result. The estimates and progress entries below reflect the stages where they were written.

# Remaining refactoring work — stage 87 audit

Audited 21 November 2026 at stage 87; historical measurements below remain the baseline. **Current implementation progress: P01 completed in stages 88–90; P02 implementation completed in stages 91–93; P03 implementation complete in stages 94–96; P04 implementation complete in stages 97–99; P05 implementation complete in stages 100–102.** Live-host acceptance remains pending under P12. This plan supersedes open-ended tiny-helper continuation.

## Evidence and estimate

The audited working tree includes stages 78–87 on top of Git commit `40648033d0a4f6104cfc67340bc3fc22cc296138`. Those stages have not been committed/pushed here. The audited `src/runtime/widget.tsx` SHA-256 is `d97ad1f62e3ba56806362a486e03b75db5abc4334b1120196cb13931fa690010`.

A TypeScript AST inventory found:

| Measure | Stage 87 working tree |
| --- | ---: |
| Widget file lines | 12,037 |
| Class members, including fields and bindings | 702 |
| Method declarations | 215 |
| Property declarations, including arrow handlers | 482 |
| Class members spanning at least 100 lines | 17 |
| JSX element/self-closing nodes | 121 |
| JSX `style` attributes | 57 |

Counts include declarative bindings, comments and whitespace; they are not defect counts or completion percentages. JSX counts exclude fragment nodes. Member spans run from the first token through the last token; leading documentation comments are excluded. The three largest members occupy 2,493 lines, or 20.7% of the file.

| Responsibility | Current member | Lines | Start line at audit |
| --- | --- | ---: | ---: |
| Coverage-seeking route generation | `generateEsriDetourRoute` | 1,137 | 7088 |
| Active map transfer and interaction wiring | `onActiveViewChange` | 766 | 9998 |
| Main presentation composition | `renderLocalizedContent` | 590 | 11447 |
| Viewer event coordination | `bindMapillaryEvents` | 270 | 1795 |
| React update coordination | `componentDidUpdate` | 232 | 9677 |
| Base coverage initialization | `initMapillaryLayer` | 218 | 4493 |
| Environment cleanup | `cleanupWidgetEnvironment` | 196 | 3158 |
| Image/sequence opening | `loadSequenceById` | 188 | 2332 |
| Detection hover | `setupDetectionHover` | 178 | 3914 |
| Fullscreen transition | `toggleFullscreen` | 141 | 3616 |
| Shared-link restoration | `checkUrlForSharedState` | 140 | 5170 |
| Coverage-analysis run | `runCoverageAnalysis` | 136 | 6621 |

Line references are a measured snapshot; use member names after subsequent moves.

The prior 10–20-stage estimate was too optimistic for the requested minimal entry point. Stages 78–87 reduced this file from 12,205 to 12,037 lines: 168 lines, about 1.4%. They established useful ownership/tests, but do not demonstrate that most of the structural work is finished.

The finite plan below has **12 work packages**, provisionally **21–34 reviewable changes**, including final validation/documentation changes. This is a scope estimate, not a promise of a completion date or a percentage. The first large routing/view packages may expose coupling that changes the estimate. Update the affected package with evidence before expanding scope; do not silently add endless numbered helper stages.

## Working method

- Prefer feature-sized changes that remove a coherent responsibility. Do not choose the easiest tiny helper just to advance the stage number.
- Reuse existing owners first. A facade that simply exposes hundreds of widget members is not a completed extraction.
- Separate behavior fixes from moves. Preserve request order/count, cache bounds, selection identity, cancellation, map ownership, localization and explicit publication permissions.
- Test the observable behavior at the moved boundary. Retain existing assertions; update method-only harness bindings when necessary. Do not add tests merely to increase totals.
- Run appropriate focused checks and the required integration/build checks. Record the exact source/host/scope. Do not interpret a webpack module-graph build as browser acceptance.
- A short forwarding method or stable host binding can remain. A small numerical line target must not drive abstractions or hide a monolith in another file.

## Finite work packages

**P01 implementation is complete in stages 88–90, P02 in stages 91–93, P03 in stages 94–96, P04 in stages 97–99 and P05 in stages 100–102; live-host acceptance remains pending under P12. P06–P12 are not started.** P05 used three changes within its original allowance. The seven remaining packages provisionally require **10–17 further reviewable changes**, their original combined allowance. Original audit measurements remain historical.

| ID | Package and concrete scope | Reuse before adding modules | Completion criterion | Changes |
| --- | --- | --- | --- | ---: |
| P01 | Routing orchestration: baseline solve, opportunity selection, ordered preflight/pruning/replacement, final solve/publication from `generateEsriDetourRoute` | `RouteGeneration`, `CaptureSolveHistory`, provider/evaluation/scoring/trial/report/renderer helpers | Widget starts/cancels a run and binds host UI; provider algorithms and iterative optimization are feature-owned, with identical request/result traces | 3–5 |
| P02 | Active-view lifecycle: detach/transfer, guarded view startup, owned attachments in `onActiveViewChange` | Current presentation/map-resource, field-note, point-cloud and coverage owners | One lifecycle owner coordinates transfer and startup; widget binds the active map; old views receive no late resources | 2–3 |
| P03 | Map interaction dispatch: click and pointer ladders nested in view setup, plus detection hover | `coverageClickDispatch`, native coverage targets, Places tile hits, hover/cancellation owners | Named interaction handlers are outside view setup; coverage/feature precedence and stale-hit guards remain independently reviewable | 2–3 |
| P04 | Viewer/image coordination: `bindMapillaryEvents`, `loadSequenceById`, image context transitions | `LiveSequenceFrames`, opening/details/preview owners, native selection and current-image presentation | Feature coordinators own event/selection policy; image-first opening and late-result rejection are preserved | 2–3 |
| P05 | React lifecycle and teardown: mount/update effects, `cleanupWidgetEnvironment`, shared-link sequencing | Startup guards, existing owner disposal APIs, Places lifecycle, shared-link restoration | Lifecycle methods dispatch named feature effects and a defined teardown sequence; disposal order and reusable reopening remain explicit | 2–3 |
| P06 | Fullscreen/resize transition policy and DOM/viewer transfers | `FullscreenViewer`, viewer surface/tiling/playback/minimap owners | Widget binds refs/state/portal location; transition implementation has one owner and no extra viewer recreation or cover flash | 1–2 |
| P07 | Presentation composition and inline event policies in `renderLocalizedContent` | Existing viewer, utility, Places, note, coverage, routing and detection components | Remaining large control/overlay groups and feature handlers are feature-owned; widget composes state/locale/refs without a large UI tree | 2–3 |
| P08 | Remaining inline styles and theme boundaries | Existing `src/styles` files and feature styles | Repeated/large widget style objects are relocated without visual, portal, scroll, contrast or mobile regressions; dynamic styles remain narrowly bound | 1–2 |
| P09 | Coverage setup/analysis coordination: `initMapillaryLayer`, layer rebuild/order, `runCoverageAnalysis`, analysis invalidation | Existing coverage transport/readiness/analysis helpers and feature controllers | Coverage policy runs through feature owners while preserving date/filter behavior, native tile rendering and analysis cancellation | 1–2 |
| P10 | Remaining cross-feature policy: `handleNudgeKeyDown`, shared-note synchronization/publication/edit/attachment commands, `syncMapToImage` and residual cone policy | Existing point-cloud tools, field-note commands/files/Enterprise owners, camera/presentation owners | Only bindings and genuine cross-feature coordination remain; explicit remote-write authorization and image/map identity protections are retained | 2–3 |
| P11 | Final architecture/comment/import review and documentation consolidation | Existing architecture, guides, history, test fixtures and repository checks | No duplicate owners, dead imports or speculative cleanup; current architecture/continuation docs are concise, historical stage notes are clearly separated; public behavior and dependencies unchanged | 1–2 |
| P12 | Checkpoint validation and handoff | Existing portable tests, isolated build checker and browser harnesses | Browser matrix below is completed with evidence for the exact source; remaining limitations are named; installer/rollback and user/contributor instructions are reviewable | 2–3 |

Total: 21–34 changes. Some can be combined when the existing boundaries make that safe. P02/P03 may be interleaved; P07 should reuse the policy boundaries established in P03/P04/P09/P10. P08 follows component movement. P11/P12 close the checkpoint rather than opening a new feature backlog.

## Definition of the checkpoint

The checkpoint is complete when **all twelve packages meet their criteria**, not when another stage number is reached:

- [ ] Routing optimization, hit-test ladders and feature-specific selection logic are outside `widget.tsx`.
- [ ] Active-view startup/transfer, fullscreen transitions and teardown have explicit ownership/order.
- [ ] Main UI composition and repeated/large styles live in the existing component/feature/style structure.
- [ ] Widget retains React state/props, refs, lifecycle entry points and small dependency bindings; it does not merely proxy a second god object.
- [ ] No new dependencies or user-visible behavior changes were folded into the refactor.
- [ ] Required tests/builds pass and the exact-source browser matrix has evidence.
- [ ] Current architecture and continuation docs explain ownership, validation scope, known limitations and how to extend a feature.

There is no arbitrary maximum widget line count. Review remaining substantial implementations against the ownership criteria. If a responsibility cannot move safely, name its retained boundary and reason; do not declare the original minimal-entry-point goal met merely because tests pass.

This checkpoint is not public-release approval. National-scale Places delivery, deployment/authentication hardening, new product features and broader host compatibility claims remain separate roadmap work.

## Browser acceptance matrix

Portable tests and isolated webpack checks are prerequisites, not substitutes for these observations. Record source hash/commit, ExB/dependency versions, date, scenario and result.

| Scenario | Required observation | Recorded host evidence |
| --- | --- | --- |
| Cold/warm startup, close/reopen, active-map replacement during loading | No late listeners/layers/DOM on retired views; normal reopening | Pending current-source acceptance |
| Low-zoom hover, rapid pan/zoom, cold/warm tile lookup, touch | Responsive picking, truthful loading feedback, no stale thumbnail | Pending |
| Rapid A/B/C image selection, same/different sequences, error/cancel | Image-first opening; marker/cone/selected-sequence consistency | Only the earlier sequence-transition fix was reported working; full matrix pending |
| Fullscreen enter/exit and repeated resize | Same viewer/pose; no new dispose-cover flash or lost controls | Pending |
| Traffic-sign/object filters and labels at zoom 18+ | Same labels, hit precedence and disabled-source cancellation | Pending |
| Places filters/categories/confidence, dense view and POI imagery links | Native tile behavior, matching hit/selection/filter results | Pending |
| Routing with supported providers, cancellation and changed context | Same outputs, budgets, provider calls and late-result protection | Pending |
| Point-cloud tools, solar and elevation in 2D/3D | Same cleanup, feedback, geometry and current-image tracking | Pending |
| Field notes, attachments and configured remote publishing | Same local persistence; no implicit or duplicated remote writes | Pending |
| Mobile/narrow layout, keyboard and locale, fullscreen portals | Usable controls, scrolling/focus and readable translated content | Pending |

At the stage-87 audit, the latest user-supplied isolated ExB 1.21 build confirmation covered stage 86 (7,800 ms, zero errors/warnings). Stage 87 has 2,932 passing portable tests / 213 files in workspace and installer copy plus an isolated ExB 1.20 build; its ExB 1.21 build/browser confirmation has not been supplied. Historical stage-65 browser observations do not validate this source.

## P01 progress — stage 88

Part 1 extracts synchronous baseline geometry/local opportunity preparation into `src/features/routing/captureRoutePreparation.ts`, reusing adaptive selection and reporting helpers. Provider loading, baseline solving, camera restoration, checks and awaits retain their positions in the widget, avoiding an added async boundary. Typed host bindings preserve feedback and progress publication. The widget is 11,928 lines (109 fewer); `generateEsriDetourRoute` is 1,016 lines (121 fewer). Stage-87 audit metrics above remain the historical baseline.

The new suite compares frozen original and current full-run provider/UI/geometry/publication traces for direct and OSRM-shaped preflight paths, retries, pruning, replacement, empty results, failures, cancellation and superseded runs. Local comparisons cover baseline speed/geometry, identity and early/reporting boundaries. Existing assertions remain in force; boundary-location assertions/harness bindings follow the extraction.

P01 is **not complete**: ordered preflight, pruning, replacement and final-solve orchestration still occupy the remaining large method. No other package is marked complete by this step.

Validation: 2,970 portable passes / 214 files in workspace and installer copy; isolated ExB 1.20 module-graph build has zero errors/warnings. See [the preparation checkpoint](../../development/capture-route-preparation.md) for scope and limits.

## P01 progress — stage 89

Part 2 moves the complete owned asynchronous execution into `src/features/routing/executeCaptureRoute.ts`: provider/baseline loading, preflight, pruning/replacement, final solving/selection, drawing/publication sequencing and finalization. The widget retains entry guards/run snapshots and a narrow per-run host for UI, camera and ownership operations; no widget state/props/DOM or SDK objects are exposed to the workflow. The entry forwards the execution promise directly and preserves rejected promises for pre-run synchronous failures.

Operational await expressions and run checks retain their order. Existing preparation and policy helpers are reused. Existing full-run traces and policy assertions remain; fixture host syntax is adapted without replacing algorithm/guard text. Widget size is 11,007 lines (921 fewer than stage 88). The feature coordinator remains substantial, so **P01 is not complete**: review/decompose its remaining probe/decision orchestration and finish targeted validation rather than moving directly to P02.

Validation: 2,987 passing portable tests / 215 files in both workspace and clean installer-produced copy, zero failures or skips. Seventeen new execution cases augment the retained 38 preparation/full-run comparisons and existing policy/integration suites. Strict feature-module TypeScript and the isolated ExB 1.20 module-graph build pass with zero errors/warnings. Ordered-stop/post-draw/finalization mutation checks, 55-case BOM/CRLF comparison and reversible installer checks pass; local plan edits and missing-plan creation are covered. No live provider/browser acceptance is inferred.

See [execution details and limits](../../development/capture-route-execution.md), including the retained pre-existing warning-hook boundary to validate.

## P01 completion review — stage 90

Implementation criteria are met: the widget starts/cancels the run and binds presentation/lifetime callbacks; routing algorithms and iterative provider execution are feature-owned. The entry is 42 lines and its typed per-run host is 54 lines. Execution imports only routing/utilities and contains no widget state/props, DOM, Jimu or SDK coupling. Existing scoring/reporting helpers and full-run trace comparisons remain active.

A real pre-existing warning defect was reproduced without the fixture-only Widget.warn stub: a single remaining over-budget opportunity threw `this.warn is not a function` instead of publishing the existing fallback result. The widget warning binding now uses `console.warn`. Six focused cases cover the binding, fitting/over-budget routes, pruning to one, preflight and cancellation. This deliberate behavior fix changes no budget threshold, route selection, retry policy or provider call.

Review decision: keep the explicit ordered provider loop inside the routing feature, rather than adding generator/request frameworks or extra per-probe async handoffs merely to reduce file size. It is a routing-specific coordinator over existing pure helpers, not a second widget facade. Verbose legacy comments/source-anchor cleanup belongs to P11. No live-provider/browser or ExB 1.21 acceptance is claimed; those remain recorded in the matrix/P12.

Validation: 2,993 passing portable tests / 216 files in both workspace and clean installer-produced copy, zero failures or skips. Six new real-binding regressions pass after reproducing the TypeError before the fix; reverting the binding fails them again. Existing execution/preparation/policy comparisons remain unchanged. Isolated ExB 1.20 module-graph build has zero errors/warnings. BOM/CRLF regressions and reversible installer checks pass, including local plan preservation, missing-plan creation, unknown edits and exact rollback. Live-host/provider/browser acceptance remains pending.

See [the warning fix/review checkpoint](../../development/capture-route-warning.md) for evidence and acceptance limits.

## P02 progress — stage 91

Part 1 extracts committed-view startup into `src/features/navigation/activeViewStartup.ts`. The widget supplies typed operations for scale/camera, coverage and optional resource restoration. The workflow preserves await/check order and starts coverage before optional tools, while shared-link restoration starts independently in the caller. New frozen/current comparisons exercise the actual widget thunk/host. Existing coverage-first assertions remain active. Widget size is 10,947 lines (60 fewer).

P02 is **not complete**: transfer invalidation, detach/teardown, view commitment and owned attachments remain for the next part. Interaction ladders remain under P03; no package is complete merely because one callback moved.

Validation: 3,017 passing portable tests / 217 files in the workspace and clean installer-produced copy; zero failures or skips. Strict feature-module TypeScript and the isolated ExB 1.20 module-graph build pass with zero errors/warnings. Reversible installer checks cover dry-run, repeat application, BOM/CRLF source, local documentation history, unknown edits and exact guarded rollback. Live ExB 1.21/browser acceptance remains pending.

See [the startup checkpoint](../../development/active-view-startup.md) for ownership, installation and acceptance limits.

## P02 progress — stage 92

Part 2 introduces `ActiveViewTransfer`, the single owner of transfer revisions and synchronous transfer order. Its typed host binds existing resource owners without exposing widget state/props/DOM. It preserves route/hover prelude behavior for invalid views, terrain/reset timing, tool/interaction teardown, camera capture, dimension-specific analysis, presentation/request cleanup and presentation claim before React commitment. Full cleanup invalidates the same owner. Startup/shared-link guards still check revision, active view, captured map identity and destruction.

Twenty-nine new cases exercise the actual production entry and host against the frozen transfer prefix, token ownership, full-cleanup wiring and teardown ordering. Lifecycle-wide cancellation assertions retain their checks by accounting for the reviewed delegation; route tests now follow the transfer host. Existing startup comparisons and coverage-first assertions remain active. Widget size is 10,926 lines (21 fewer).

P02 remains **in progress**. Concrete feature cleanup bindings still live in the widget; committed-view startup registration and owned non-interaction attachments need their final coordinated lifecycle boundary. Do not add a second revision owner or move click/pointer policy under a generic widget facade.

Validation: 3,046 passing portable tests / 218 files in both workspace and clean installer-produced copy, with zero failures or skips. Strict transfer-module TypeScript and the isolated ExB 1.20 module-graph build pass; the build has zero errors/warnings. Reversible installer and BOM/CRLF checks pass. Live ExB 1.21/browser acceptance remains pending.

See [the transfer checkpoint](../../development/active-view-transfer.md) for boundaries, installation and acceptance limits.

## P02 implementation review — stage 93

Part 3 moves React-committed startup/readiness registration and non-interaction attachments into `ActiveViewTransfer.attach`. Together with `begin` and `invalidate`, this is one coordinator for active-map handoffs. The stage-91 restoration workflow and current feature owners are reused. Widget bindings retain concrete SDK/React operations; the coordinator receives no widget state/props/DOM. Coverage-first loading, independent shared-link restoration, direct promise forwarding, error handling and attachment order retain their existing behavior, including deferred React commits.

P02 implementation criteria are met across three changes. Transfer revision/map identity, old-resource retirement, startup and zoom/Turbo/layer-order registration are coordinated outside the widget entry. Existing owners retain handles/resources. Nested click/pointer dispatch is explicitly P03. Feature-specific cleanup bindings still live in the widget, as dependency wiring; no claim is made that the entire widget is now minimal or that live-host acceptance passed.

Twenty new actual-binding attachment cases augment retained transfer/startup/coverage-first comparisons. Lifecycle-wide assertions account for the reviewed delegation without dropping cancellation-placement checks. Widget size is 10,911 lines (15 fewer than stage 92, 96 fewer across P02).

Validation: 3,066 passing portable tests / 219 files in both workspace and clean installer-produced copy, zero failures or skips. Strict navigation-module TypeScript and the isolated ExB 1.20 module-graph build pass; the build has zero errors/warnings. Reversible installer, BOM/CRLF and targeted mutation checks pass. Live ExB 1.21/browser acceptance remains pending under P12.

See [the attachment checkpoint](../../development/active-view-attachment.md) for scope, installation and acceptance limits.

## P03 progress — stage 94

Part 1 moves ordered map-click dispatch into `mapClickDispatch.ts`. The widget binds the event thunk, captures click/preview identity synchronously and supplies live typed feature capabilities. The dispatcher imports existing pure hit-test/nearest-frame/Places/note helpers and has no widget/state/props dependency. It preserves tool/note/cloud/POI/sequence/detection/coverage precedence, original awaits and ownership checks, local versus regional imagery resolution and user-visible feedback. No async handoff, dependency, timer or request is added.

Twenty-seven frozen/current comparisons exercise the actual prepare/host/thunk/dispatch chain. Existing coverage and POI assertions remain, including synchronous propagation stopping, newer-click cancellation, ignored-abort transport and stale error suppression. Lifecycle-wide cancellation placement is still checked after accounting for the reviewed callback delegation. Widget size is 10,704 lines (207 fewer).

P03 remains **in progress**: pointer/hover dispatch, touch/container/resume ownership and detection hover still need extraction/review. Concrete preview preparation and SDK/owner bindings remain in the widget; these are not grounds to claim full-widget completion.

Validation: 3,093 passing portable tests / 220 files in both workspace and clean installer-produced copy, zero failures or skips. The isolated ExB 1.20 module-graph build has zero errors/warnings. Targeted SDK-aware click-module type checking, BOM/CRLF comparisons, mutation checks and reversible installer checks pass. Live ExB 1.21/browser acceptance remains pending under P12.

See [the click checkpoint](../../development/map-click-dispatch.md) for validation scope, temporary external type aliases and installation/acceptance limits.

## P03 progress — stage 95

Part 2 extracts pointer dispatch plus its container/touch/resume lifecycle into `createMapHoverHandler`. One local timer is shared by move coalescing and leave/touch cleanup. Existing hover-resume/touch/status/Places owners are reused. The widget binds live capability getters and retains click-before-pointer registration. Independent coverage picking, optional detection failure isolation, native POI ownership/version checks, tooltip priority and captured coordinates preserve original ordering and cancellation.

Thirty-six full-factory frozen/current comparisons supplement the retained hover/replay/touch/POI assertions. Harnesses now follow actual production bindings and the returned callback; no algorithm is replaced. Widget size is 10,557 lines (147 fewer than stage 94; 354 fewer across P03 so far).

P03 remains **in progress**: `setupDetectionHover` and retained click-preview preparation need their final extraction/review. One final P03 change is planned, within its original 2–3-change allowance. Current browser acceptance still requires the exact-source ExB matrix.

Validation: 3,129 passing portable tests / 221 files in workspace and clean installer-produced copy, zero failures or skips. Isolated ExB 1.20 module-graph build: zero errors/warnings. Targeted SDK-aware module checking, BOM/CRLF comparisons, mutation and reversible installer checks pass. Native Chromium confirms low-zoom hover status appears/clears and the preview opens in the isolated harness. Full ExB 1.21/browser acceptance remains pending under P12.

See [the hover checkpoint](../../development/map-hover-dispatch.md) for module/type-check and isolated-browser limits, installation and acceptance steps.

## P03 implementation review — stage 96

The final change moves `setupDetectionHover` implementation into a detection-feature binding: pointer/click listeners, 50ms updates, 500ms target flashing, focus/all labels, selected/target outlines, note-selection guards and cleanup. Existing labels, Mapillary geometry/tag classes and verified-location helpers are reused. Widget entry and live host bind viewer/label/draft capabilities without exposing the full widget state or adding requests, dependencies, publication or async handoffs.

P03 criteria are met: click dispatch, pointer/container/touch/resume dispatch and detection hover are feature-owned, with reviewable precedence and stale-result guards. The active-view entry binds lifecycle and named handlers. The synchronous `prepareMapClick` remains an approximately 60-line identity/capability boundary joining shared startup/workspace state, click revision, current-image ownership and coverage preview owners before any await. Existing exact/regional preview, interception and cancellation comparisons cover it. An additional broad mutable-resource adapter solely for line count was rejected; P10/P11 retain their planned residual cross-feature review.

Twenty-nine frozen/current detection comparisons supplement retained label-toggle/exploration/linked-preview assertions. Widget size is 10,404 lines (153 fewer than stage 95; 507 fewer across P03). P03 live-host acceptance remains pending; implementation completion is not full-widget or public-release approval.

Validation: 3,158 passing portable tests / 222 files in workspace and clean installer-produced copy, zero failures or skips. Strict detection-hover module checking against the installed Mapillary/PBF/vector-tile declarations passes without temporary type aliases. Isolated ExB 1.20 module-graph build: zero errors/warnings. BOM/CRLF, targeted mutation and reversible installer checks pass. Full ExB 1.21/browser acceptance remains pending under P12.

See [the detection-hover review](../../development/detection-hover.md) for installation, retained boundaries and precise validation scope.

## P04 progress — stage 97

Part 1 extracts the complete SDK image-event workflow into `viewerImageTracking.ts`. The widget registers the direct promise-forwarding thunk, supplies cone redraw and creates live capability bindings once per viewer binding. The feature coordinates displayed-frame resolution, cross-sequence updates, confirmed presentation and latest-frame-only secondary work using existing frame/detail/request owners. No widget state/props object, SDK service or parallel frame store is exposed.

Initial viewer/opening guards, profile/bearing/custom-angle behavior, note/detection cleanup, original awaits, React updater/callback order, route preparation guard scope and pause/fly-in gates remain unchanged. A generic commit contract retains React-style partial-state typing. Twenty-nine frozen/current traces supplement retained bearing, image-first, pulse/fullscreen, performance and lifecycle assertions. Widget size is 10,373 lines (31 fewer); host bindings are deliberately explicit.

P04 remains **in progress**: load/bearing/wheel/zoom/direction registration and explicit `loadSequenceById` opening/transition coordination still need extraction/review. No other package is marked complete.

Validation: 3,187 passing portable tests / 223 files in workspace and clean installer-produced copy, zero failures or skips. Strict feature-module checking and a React-style generic commit-contract check pass. Isolated ExB 1.20 module-graph build: zero errors/warnings. BOM/CRLF comparisons, targeted mutation and reversible installer checks pass. Full ExB 1.21/provider/browser acceptance remains pending under P12.

See [the image-tracking checkpoint](../../development/viewer-image-tracking.md) for ownership, type/build scope and installation/acceptance limits.

## P04 progress — stage 98

Part 2 extracts viewer event registration, load/zoom/wheel policy, bearing/cone/URL coordination and delayed direction setup into `viewerEventBinding.ts`. Stage-97 image tracking and existing bearing/playback owners are reused. Widget entry/host retain concrete SDK and owner bindings without exposing state/props or adding requests, subscriptions, timers, viewers or cleanup policy.

Thirty-two frozen/current cases cover actual registration and callbacks, including SDK/playback construction order, cached versus event heading policy, zero shared bearing, RAF/debounce behavior, live viewer reads, missing resources and integrated image/cone publication. Existing map-follow/bearing/image-first/pulse/fullscreen/performance/lifecycle checks retain their assertions through the moved source. Widget size is 10,258 lines (115 fewer than stage 97; 146 fewer across P04).

P04 remains **in progress**. `loadSequenceById` opening/transition orchestration requires the final planned extraction/review. Keep that change within the original 2–3 allowance; disposal continues through current owners and the later P05/P06 scope rather than adding behavior changes to this move.

Validation: 3,219 passing portable tests / 224 files in workspace and clean installer-produced copy, zero failures or skips. Strict feature-module and real Mapillary Viewer contract checks pass. Isolated ExB 1.20 module-graph build: zero errors/warnings. BOM/CRLF, targeted mutation and reversible installer checks pass. Full ExB 1.21/browser acceptance remains pending under P12.

See [the viewer-event checkpoint](../../development/viewer-event-binding.md) for registration/guard/cleanup contracts, installation and acceptance limits.

## P04 completion — stage 99

`sequenceOpening.ts` owns explicit selection policy previously in `loadSequenceById`: early cancellation and highlight retirement, bounded same-route reuse, nearest/local lookup, SDK opening before optional metadata/route work, stale result rejection, presentation-confirmed bearing, retry/recovery and finally cleanup. The concrete adapter binds existing frames, request counters, presentation and caches; GIS overlay/animation operations stay at that boundary.

Thirty-three frozen/current cases compare traces and final state through real entry/host/coordinator execution. They cover exact/line picks, same/cross-sequence route reuse in native/GIS modes, SDK and metadata recovery, superseded clicks, map/viewer replacement, shared startup, visibility and presentation waits, aborted commits and fire-and-forget route work. Retained pulse/fullscreen, image-first, Nearby, sequence performance and cancellation-placement assertions remain active. Widget: 10,155 lines (103 fewer than stage 98; 249 fewer across P04).

P04 implementation is complete within its three-change allowance. This is the viewer/image coordination boundary, not completion of all imagery code: viewer creation/fullscreen is P06; React lifecycle/disposal is P05; coverage/analysis remains P09. Existing demand-route and frame/detail helpers remain reused. No cache/store/subscription/dependency or behavioral policy was added. Full host/browser acceptance remains P12.

Validation: 3,252 passing portable tests / 225 files in both workspace and installer-produced copy, zero failures/skips; strict feature/real SDK compatibility and targeted adapter checks; isolated ExB 1.20 zero errors/warnings; BOM/CRLF, mutation and reversible installer checks. Full ExB 1.21/browser acceptance remains pending.

## P05 progress — stage 100

`widgetStartup.ts` coordinates mount initialization and startup invalidation. It preserves revision/abort checks after awaits, preset-before-layer ordering, failure continuation, cache/note restoration, resize/listener/tooltip setup, deferred sprites and injected stylesheet. Existing instance slots remain the single lifetime boundary; disposal still invalidates startup before the rest of unmount. The initial tooltip shell reuses the existing imagery style module.

Twenty-two frozen/current comparisons cover complete traces, creator/preset values, setup errors, disposal while modules/creator lookup are pending, overlapping/repeated mounts, abort renewal after disposal, late preload callbacks, live viewer/container reads and instance-only timer/stylesheet removal. Fourteen retained startup/sprite-disposal cases still execute their actual production methods. Widget: 10,088 lines (67 fewer than stage 99).

P05 remains in progress after one change. Update/reopen/configuration dispatch and full cleanup/unmount orchestration remain within the original 2–3-change allowance. No new resource owner, lifetime guard, request, listener, timer, dependency or behavior fix was added. Startup invalidation intentionally does not replace full unmount cleanup.

Validation: 3,274 passing portable tests / 226 files in workspace and installer-produced copy, zero failures/skips; strict module/actual SDK resize compatibility and targeted installed-host adapter checks; isolated ExB 1.20 zero errors/warnings; mutation, BOM/CRLF and guarded installer checks. Full ExB 1.21/browser acceptance remains pending under P12.

## P05 progress — stage 101

`widgetUpdate.ts` coordinates updates through ordered feature-demand, visibility/reopen and configuration phases. The widget binds live props/state and feature capabilities. Named UI setters keep exact state patches and callback order at the React boundary without broad state casts. Source identity and organization parsing reuse existing helpers. Fullscreen observer reattachment is relocated in order; transition policy remains P06.

Forty-eight frozen/current comparisons retain complete effect/state traces: Nearby demand, route/analysis cancellation, Places source/view/loading/panel triggers, background pause, profile/point-tool/note effects, observer changes, minimize/full-close distinction, presentation reclamation, existing/recreated coverage reopen, creator success/zero/failure, live post-await values, deferred callbacks, detection filters and SDK controls. Retained feature assertions run against the moved phase/adapter; no suite is dropped. Widget: 9,933 lines (155 fewer than stage 100; 222 fewer across P05).

P05 remains in progress. Full cleanup/unmount coordination is the third and final planned P05 change. Async reopen still uses its original dispatch and live-read semantics; no new lifecycle policy or fix is bundled into this relocation. Existing startup invalidation, request counters and resource ownership remain unchanged.

Validation: 3,322 passing tests / 227 files in workspace and installer-produced copy, zero failures/skips; strict feature/actual SDK control compatibility and targeted installed-host adapter checks; isolated ExB 1.20 zero errors/warnings; mutation, BOM/CRLF and guarded installer checks. ExB 1.21/full-browser acceptance remains pending under P12.

## P05 completion — stage 102

`widgetTeardown.ts` defines ordered common cleanup and final unmount over existing owners. The widget keeps short lifecycle/cleanup entries and typed concrete resource/slot bindings. Partial cleanup retains reusable map handlers/layers; full cleanup invalidates view/pick work and removes only owned graphics/layers. Viewer removal keeps its narrow catch boundary. Selection reset data is feature-owned and recreated per call. Startup invalidation still precedes final teardown, with observer/DOM/listener release and warning cancellation at their original boundary.

The readiness gate for shared links moved into the existing `activeViewStartup.ts`: wait for view, check current/restored, await modules, check again, dispatch existing shared URL/image/camera restoration. URL parsing and cross-feature SDK bindings keep using the existing navigation helpers; no startup, reopen or error policy was added.

Twenty-nine frozen/current teardown comparisons cover all reset/full combinations, owner order, foreign map/popup preservation, counter-before-abort delivery, viewer-catch versus other-owner errors, missing resources, timer zero/null semantics, repeated cleanup/unmount, fresh reset arrays, rebuilt viewers, live view replacement, crop cleanup, observer/listener order, cancelled late consumers and actual SDK-startup disposal. Nine readiness comparisons cover complete/stale/failed waits and warning policy. Existing shared-link image/camera tests and 109 retained cleanup/ownership/startup checks remain active. Widget: 9,854 lines (79 fewer than stage 101; 301 fewer across P05).

P05 implementation is complete across its three planned changes: mount/invalidation, update/reopen effects, and teardown/readiness sequencing. Existing counters, stores, queues and cancellation/disposal APIs remain reused. No dependency, subscription, request, timer, blanket catch or behavior fix was added. Full browser/service acceptance remains P12; this is not completion of P06 fullscreen transition policy or P10 residual cross-feature behavior.

Validation: 3,360 passing tests / 229 files in workspace and installer-produced copy, zero failures/skips; strict modules/actual SDK compatibility and targeted installed-host adapter/readiness checks; isolated ExB 1.20 zero errors/warnings; mutation, BOM/CRLF and guarded installer checks. Full ExB 1.21/browser acceptance remains pending under P12.

## Immediate next implementation

1. Confirm stage-102 source and preserve local edits. Run the user-side ExB build and minimize/close/reopen, unmount during startup/selection, shared-map isolation, shared-link readiness and fullscreen smoke checks.
2. Start P06 fullscreen/resize transition policy. Reuse existing viewer surface/fullscreen/playback/minimap/presentation owners and the completed lifecycle boundaries.
3. Preserve viewer creation/reuse, playback intent, pulse/cone restoration and cover timing. Compare entering/leaving fullscreen, rapid transitions, resize and disposal during transitions.
4. Keep intentional visual or timing fixes distinct from relocation; complete P06 within its original 1–2-change allowance before P07 composition.

P01–P05 are implementation-complete. P06–P12 remain seven packages with a provisional 10–17-change allowance. Exact-source live-host acceptance and the overall minimal-entry-point checkpoint remain pending.

## Documentation installer

`apply-refactoring-roadmap-audit.cjs --dry-run`, then run without arguments from the widget root. It changes documentation only, preserves local history/out-of-block roadmap text, and makes no runtime-version assertion or dependency/Git change. The audit provenance above still describes the stage-87 working tree, not a fresh inspection of a user's local source. Keep `.refactor-backups/refactoring-audit-20261121` for exact guarded `--uninstall`; uninstall later documentation stages first.
