# Contributor-readiness roadmap

This supplements REFACTORING-PLAN.md with the remaining delivery order. It is a structural refactor of the existing ArcGIS Experience Builder/React widget, not a feature rewrite. Release configuration and CI remain a separate later task.

## Current position

Coverage algorithms, imagery requests/discovery, transport helpers, exports, style families and much of field-note presentation/validation now have feature modules. Field-note viewer rendering and the pending marker have explicit resource owners. These extractions are useful, but they do not finish the architecture: the runtime remains large, while InfoBox now composes controlled feature sections with centralized status, footer and shell styles. Runtime resource ownership remains the next focus; line counts are not completion criteria or performance measurements.

Small helpers have established tested boundaries. The next work should emphasize complete feature components and controllers rather than generating more one-function files. Existing helpers can be grouped further when their shared ownership becomes clear; do not consolidate merely to reduce file count.

## Current behavior baseline after the UI/performance updates

The supplied source now separates current-image tracking, ordered image IDs, bounded nearby coordinates and complete route demand. Ordinary browsing uses SDK/current-image coordinates and a nearby window; complete coordinates are requested for elevation or reused from cache. Preserve the 128-marker close-zoom bound, local-context limits, coalesced enrichment, recovery cancellation and independent current marker/cone updates during subsequent structural work.

Elevation uses explicit computed/reported altitude sources and confirmed-frame distance tracking. Its compact mobile profile lives in flow above imagery. Native coverage display alignment, organization lookup, compact filter controls, and the coverage loading/nearby-frame guide belong to this baseline too. Earlier extraction notes below describe their original scope; they are not a request to restore superseded behavior.

The supplied archive did not include the canonical test/tool directories referenced by older notes. This increment adds the renderer regression test and a limited pre-extraction fixture under `tests/`; it does not claim to restore every historical suite or to complete live-host validation.

## Function-commenting contract

Every new public operation and non-obvious SDK callback documents purpose, input units/index space, ownership and lifecycle behavior. Explain live readers, borrowed snapshots, cancellation, teardown ordering and intentional compatibility behavior where relevant. Keep comments beside the implementation they describe; avoid repeating every statement. Mechanical extractions preserve calculations, shaders, request/timer policy and user-facing behavior. Track behavioral fixes as separate work.

## Remaining phases

| Order | Work | Completion criterion |
| --- | --- | --- |
| 1 | Finish field-note ownership and split InfoBox feature sections | Notes presentation, schema/identity rules and resource owners are easy to locate. Enterprise reader/writer orchestration still needs an explicit controller boundary. InfoBox progressively composes controlled sections instead of owning unrelated feature JSX. Note controls are the first section; quality, nearby, cloud controls and routing follow where their dependencies permit. |
| 2 | Extract coverage, point-cloud and imagery controllers | Each controller owns its resources and disposal: layers, listeners, requests, aborts, workers, timers and caches. Runtime forwards user intent and state changes. Preserve stale-view rejection, cancellation, follow intent, playback scheduling and partial results. Move acquisition and cleanup together, one controller at a time. |
| 3 | Separate remaining map tools and analysis | Routing/coverage analysis, minimap/fullscreen, detections, solar/elevation and map graphics have clear feature entry points. Runtime remains the ExB lifecycle/state coordinator. Keep authentication/view restoration explicit across feature boundaries. |
| 4 | Consolidate styles/imports/docs and remove proven dead code | Feature styles and contracts have one authoritative home; global SDK selectors retain cascade order. Review unused code with static imports, callbacks, configuration and dynamic registration together. Remove compatibility exports only after consumers migrate. Contributor docs describe the implemented architecture. |
| 5 | Validate the complete refactor in Experience Builder | Regression checks pass and browser scenarios cover 2D/3D switching, mobile/fullscreen layout, long-sequence playback, cloud cancel/follow/export, nearby work and Enterprise note permissions/edit conflicts/attachments. Compare playback/network/memory behavior with a baseline; unit tests alone do not prove unchanged performance. |
| Later | Release configuration and CI | Begin only after the structural work and host validation are accepted. Do not introduce build/deployment policy as part of a mechanical extraction. |

## Safe increment contract

- Choose a cohesive responsibility and inventory its inputs, outputs, state and resource lifetime.
- Preserve values, ordering, callback identity requirements, error text and network behavior first. Keep bug fixes or behavior changes separate unless explicitly requested.
- Document non-obvious contracts above public functions/modules, including units, cancellation and ownership. Avoid repetitive line-by-line comments.
- Deliver a guarded CJS installer with dry-run, conflict rejection, backups, repeat safety and a complete affected-files table. Use the user's latest supplied source when a conflict reveals drift.
- Run focused checks and relevant regression suites. Distinguish tests with mocked SDK/GL contexts from live host validation.

## Definition of done

A contributor can locate a feature's UI, data rules and lifecycle owner without tracing unrelated widget sections. The main runtime contains assembly, host lifecycle and state coordination rather than feature implementations. No used feature is removed; performance and visual behavior are checked in the host. There is no fixed installer count or arbitrary maximum file size: completion is measured by ownership, navigation, cleanup correctness and verified behavior.

## Adaptive point-cloud display owner

`features/point-cloud/PointCloudAdaptiveDisplay.ts` owns the stationary watcher, movement state and 400 ms settle timer. The runtime supplies live layer/view/tool state and the existing display-expression policy. Cloud clearing and map-view transfer dispose this owner. It changes layer display expressions only; acquisition, retained points, geometry edits and exports remain runtime-owned. This is the first bounded point-cloud controller boundary, not completion of the broader controller phase. InfoBox now composes extracted feature sections with centralized shell styles.

## Active-sequence overlay owner

`features/imagery/ActiveSequenceOverlay.ts` owns the active-sequence layer, original owning view and marker index. Its ensure/dispose pair keeps layer attachment, ordering and graphics release together. Runtime still owns sequence loading and legacy marker batch scheduling. Turbo selection now belongs to the native style owner described below. This boundary adds no requests, timers or playback work.

## Click-ripple animation owner

`features/map-graphics/ClickRippleAnimations.ts` owns temporary ripple graphics and animation-frame handles. The runtime forwards intent and the host animation clock; existing view/widget cleanup calls dispose this owner. The four-ripple bound, 650 ms duration, easing, original-view removal and in-place symbol updates are preserved. This controller adds no image requests or playback scheduling.

## Active-image selection pulse owner

`features/map-graphics/SelectionPulse.ts` owns the active-image layer, DOM overlay and animation frame, including legacy interval cleanup. Runtime retains the current graphic as selection identity and resolves coverage anchors before forwarding draw intent. Same-image reuse keeps pulse phase; the original projection, 1200 ms period and symbol fallback remain unchanged. Host SDK/DOM/clock factories are bound once and used by the owner. Clear and view/widget cleanup dispose the original resources.

## Camera-cone graphics owner

`features/map-graphics/CameraConeGraphics.ts` owns the cone layer and main/side graphic membership. Runtime retains bearing, coverage anchoring, terrain-relative geometry, in-place graphic updates and selection-layer ordering. Layer ensure, membership clear and view-transfer disposal are separate owner operations, preserving existing lifecycle order and best-effort SDK teardown. No timers, requests or playback scheduling are added.

## Solar map-overlay owner

`features/solar/SolarMapOverlay.ts` owns the solar map layer, its creating view and update revision. Runtime SDK loading keeps the original await order and stale-result guards, reading the owner revision. Clearing invalidates pending work and returns the creating view for runtime lighting/ShadowCast cleanup. A redundant second layer-disposal block after clear was removed. Viewer renderer registration and native lighting now have separate solar owners; solar geometry and mode orchestration remain runtime-owned.

## Solar viewer-renderer owner

`features/solar/SolarViewerRenderer.ts` owns custom-renderer registration and the existing sun shader/buffer callbacks. Runtime forwards computed azimuth/altitude and host render-pass/pixel-ratio readers. Viewer replacement keeps the original registration reset; solar clearing detaches the renderer before restoring native lighting. Shader code and GL lifecycle order are unchanged. Native lighting and ShadowCast are owned by `SolarSceneLighting.ts`.

## Solar native-lighting owner

`features/solar/SolarSceneLighting.ts` owns the saved native lighting and ShadowCast widget. Runtime supplies the photo date, original scene for restoration and unchanged revision/view/mode predicate. SDK widget loading remains nonblocking; late or duplicate completions cannot attach a stale widget. Solar clearing invalidates the map revision, detaches the viewer renderer, then restores native lighting in the same order. Solar position/vector calculations and mode orchestration remain runtime responsibilities.

## Elevation-profile indicator presentation

`features/elevation/profileIndicator.ts` groups sequence-distance progress, SDK chart hover synchronization, and needle/badge DOM updates. Static overlay styles live in `styles/elevationIndicator.ts`. Runtime forwards the existing active frame and profile state; profile acquisition, independent terrain source, cancellation and teardown remain runtime-owned. This extraction adds no playback scheduling or camera navigation and preserves the existing distance scan and chart-bound fallbacks.

## Elevation-profile lifecycle owner

`features/elevation/ElevationProfileController.ts` owns the chart, independent query terrain source, SDK construction and asynchronous update revision. Runtime binds SDK factories, forwards the sequence snapshot and supplies live configuration/view/mode checks. Ordinary clear and view-transfer teardown retain their existing ordering and error handling. Chart presentation remains in `profileIndicator.ts`; this boundary adds no timers, requests beyond existing SDK/profile loading, playback scheduling or camera changes.

## Sequence-hover highlight owner

`features/coverage/SequenceHoverHighlight.ts` groups the hovered sequence identity, reusable vector-tile highlight layer, line-only style and existing cleanup policies. Runtime forwards the live view, coverage layer, token and SDK factory. Identical IDs do no work; mouseout hides the layer; subsequent hovers hot-update the style, with the existing property fallback for older SDKs. View transfer resets identity and best-effort destroys the layer; ordinary widget cleanup retains the existing detach-only policy. No requests beyond the existing highlight tile source, timers or playback scheduling are added.

## Camera-cone rendering consolidation

`features/map-graphics/CameraConeGraphics.ts` now groups sector/wedge geometry, symbols, retained main/side graphic updates and existing layer lifetime in the same owner. Runtime retains input validation, exact coverage-anchor resolution, projection and selection-layer ordering. The 2D sector, 3D raised wedge and ground outline retain their original geometry, symbols and graphic identity. This consolidation adds no files for individual geometry helpers, timers, requests or playback scheduling.

## Direction-hover marker owner

`features/map-graphics/DirectionHoverMarker.ts` groups the yellow navigation-target marker, tagged minimap marker, 2D/3D symbols and pulse interval. Runtime retains hover identity, sequence/cache lookup, API fallback and the existing live view/minimap cleanup policy. The owner preserves the 60 ms interval and 16–20 px pulse, replacing the previous marker/timer before drawing a new target. No additional requests, listeners or playback scheduling are added.

## Direction-hover coordinate discovery owner

`features/imagery/DirectionHoverDiscovery.ts` groups navigation-target identity, active/other-sequence lookup, coordinate cache and minimal Graph fallback. Runtime retains direction events, SDK readiness and marker callbacks. Cache lifetime, lookup priority, request behavior and late-result checks are preserved; no debounce, retries, cancellation, cache eviction or playback scheduling are introduced. The private runtime fetch wrapper is removed after its sole caller migrates into the owner.

## Direction-hover event binding owner

`features/imagery/DirectionHoverBindings.ts` owns the existing Mapillary direction subscription and three passive touch listeners. Runtime forwards hover/log callbacks and viewer/container references. Touch-to-mousemove payloads, multitouch behavior and touch-end clearing remain unchanged. Rebinding releases previous bindings; teardown now removes the original container’s listeners as well as the subscription, closing the previously missing touch cleanup. No timers, requests or playback scheduling are added.

## Map-symbol legend owner

`features/map-graphics/MapSymbolLegend.ts` groups the empty renderer-only legend layer, six symbol entries and original-view cleanup. Runtime retains SDK readiness and hideLegend checks. Repeated synchronization reuses the layer; a new view removes and destroys the original legend before creating another. Host layer titles/renderers remain untouched, and point clouds remain excluded. The owner adds no feature copies, requests, timers or watchers.

## Solar map-vector rendering consolidation

`features/solar/SolarMapOverlay.ts` now groups beam/shadow vector geometry, labels and symbols with the existing solar layer lifetime and update revision. Runtime retains mode conflicts, astronomical position, horizon/timestamp checks, SDK loading, cancellation and viewer/native-lighting coordination. The five-graphic order, per-update creation, 6 m clearance and existing distance clamps are preserved. No new geometry helper files, timers or requests are introduced.

## Browser URL synchronization boundary

`features/navigation/browserUrlState.ts` groups bookmark parameter serialization, coordinate projection fallback, framed parent-window selection and history/error handling. Runtime binds live map/browser/bearing readers once. The current URL format, parameter order, six-decimal coordinates, one-decimal zoom/bearing, map-only bearing and hash removal are preserved. Legacy image-coordinate arguments remain accepted but unused because bookmarks follow the map centre. Shared-state restoration remains runtime-owned. This module creates no listeners, timers, requests, caches or navigation events.

## Share-link browser operation consolidation

`features/navigation/browserUrlState.ts` now groups copying the synchronized URL with URL writing. Copying preserves the current parent/top-level href, secure clipboard path, offscreen textarea fallback and browser error handling. Runtime retains the image-selection guard and original toast markup/wording, binding host callbacks once. It does not regenerate the URL or change shared-state restoration. No new source files, timers or network calls are added.

## Shared-link query and camera restoration boundary

`features/navigation/sharedLinkRestoration.ts` groups parent/child query reading, the initial 2D/3D map flight and viewer-bearing restoration. Runtime retains one-time map switching, initialization/fly-in flags, Graph metadata loading, sequence loading and both existing delays. Map zoom remains an ArcGIS level and is never applied as viewer zoom. The live viewer reader, warning paths, URL update order, 60-degree scene tilt and flight durations are preserved. This module creates no timers, listeners or requests; orchestration and delayed-work lifetime remain runtime-owned.

## Sequence playback-recovery policy boundary

`features/imagery/playbackRecovery.ts` groups forward recovery from unavailable frames and safe native-player stopping. Runtime retains playing events, user-interaction tracking, the 400 ms trigger and pause intent. Recovery captures the same sequence snapshot, checks live pause state, tries candidates in order and resumes the current native sequence component after success. Safe stop records pause before stopping and retains paused nearby refresh. No timers, requests beyond existing moveTo attempts, retries, prefetching or normal-playback work are added. Pending native moveTo operations are not aborted; pause prevents subsequent candidates/resumption after they settle.

## Playback event-binding owner

`features/imagery/PlaybackBindings.ts` owns native playing events, capture-phase pointer/keyboard listeners and pending 400 ms recovery triggers. Runtime supplies pause intent, interaction timestamps, nearby enrichment and the unchanged recovery toast. The 500 ms user-intent boundary, Space shortcut and canvas/control filtering remain unchanged; individual halt triggers are preserved without debounce. Rebinding and all three viewer-removal paths release bindings and cancel pending work. Optional SDK off failures are contained and generation checks reject late SDK callbacks. Recovery policy remains in `playbackRecovery.ts`; no listeners or timers are added to the normal per-image path.

## Point-cloud viewer-renderer owner

`features/point-cloud/PointCloudViewerRenderer.ts` owns custom-renderer registration, callback/GL state, ordered point/color uploads, lasso flags and highlight state. Runtime supplies typed live appearance readers and the existing Mapillary conversion/render-pass functions. Runtime no longer reads `_gl`, `_currentReference`, `_lastViewMatrix`, `_lastProjMatrix` or `_selectedIndex`; readiness, projection snapshots and selected index are explicit contracts.

The extraction preserves shader strings, point identity/order, raw-coordinate ENU conversion, color/ground thresholds, depth/attribute order, callback buffer operations, cached matrix copying and caller-owned resize scheduling. It adds no requests, timers or render-frame work. Detach now addresses the viewer that accepted registration, so replacing/clearing the host viewer reference cannot target the wrong viewer. Normal same-view removal and warning behavior remain unchanged. The retained post-detach snapshot policy matches the old cached-renderer lifetime.

The owner deliberately retains the previous GL release list and lasso attribute/shader behavior; GPU policy changes remain separate from this structural move. Acquisition, map layers/applyEdits, cropping policy, calibration intent, lasso hit testing and auto-follow remain runtime-owned. Point-cloud map-layer ownership is completed in the next recorded increment below.

### Affected files

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed renderer adapter and accessor migration; renderer implementation removed |
| `src/features/point-cloud/PointCloudViewerRenderer.ts` | Registration, shader/callback state and documented renderer API |
| `src/features/point-cloud/README.md` | Contributor entry points, contracts and verification |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Current resource-owner map |
| `docs/REFACTORING-ROADMAP.md` | Baseline, comment standards and completed extraction |
| `tests/pointCloudViewerRenderer.test.cjs` | Standalone baseline comparison and ownership regression tests |
| `tests/fixtures/pointCloudViewerRenderer.baseline.json` | Immutable renderer/lasso comparison fixture from the supplied source |

The GL recording tests compare the new owner against the supplied pre-extraction implementation. They also exercise original-viewer cleanup, failed registration/removal and pre-initialization behavior. These checks are not a real Mapillary/Experience Builder GPU session; complete the feature smoke checks in the point-cloud README before accepting host behavior/performance.

## Point-cloud scene-layer owner

`features/point-cloud/PointCloudMapLayer.ts` now owns the empty source layer, result/view reuse identity, serialized edit chain, successful feature confirmations, stable ObjectIDs and filtered viewer-index lookup. Runtime forwards live view and UI callbacks through a typed SDK adapter. Original map removal/destruction and edit invalidation moved with resource acquisition; adaptive display and viewer rendering keep their separate owners.

The extraction preserves crop/color geometry preparation, feature order, renderer/schema/popup properties, visibility carryover, 5,000-feature edit chunks, delete/update/add order and the existing zero-delay yield. In-flight same-layer confirmations still reconcile after supersession; new jobs diff against confirmed state. Layer/view replacement rejects stale results. Pending SDK edits remain a barrier across clear and view transfer. Summary, lasso, toast and error timing stay with the existing latest-job rules.

Function comments explain preparation versus ownership, non-abortable SDK edits, original-view cleanup, the queue barrier and the difference between logical IDs, viewer indices and assigned ObjectIDs. There is one authoritative owner for these fields; no runtime mirrors were introduced.

### Affected files

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed SDK/host adapter, map-owner readers and lifecycle forwarding |
| `src/features/point-cloud/PointCloudMapLayer.ts` | Layer lifetime, serialized edits, confirmed feature/index authority |
| `src/features/point-cloud/README.md` | Contributor entry points and map-edit contracts |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Updated resource ownership and verification |
| `docs/REFACTORING-ROADMAP.md` | Completed extraction and next boundary |
| `tests/pointCloudMapLayer.test.cjs` | Baseline comparison, queue/ID/lifecycle regressions |
| `tests/fixtures/pointCloudMapLayer.baseline.json` | Pre-extraction map renderer/ID/clear fixture |

Recording tests cover layer reuse/replacement, ObjectID reassignment, invalid/partial confirmations, failures/retry, queued supersession, mid-chunk supersession, clear during SDK work, view transfer, visibility, geometry/renderer properties, lasso callbacks and chunk/yield counts. Existing viewer-renderer and playback regression checks remain relevant. Host checks still need map picking/lasso, crop/calibration, adaptive movement, repeated clear/load, 2D/3D/fullscreen and long-sequence playback. No FPS/memory claim follows from the structural move.

Acquisition/follow orchestration was the next boundary and is completed below. Crop preparation and measurement/lasso/sight tools remain explicit later feature work; do not fold them into the scene-layer owner.

## Point-cloud acquisition and follow owner

`features/point-cloud/PointCloudAcquisition.ts` now owns load serialization, request/queue revisions, cancellation/deadline, follow scheduling, mode/failure intent and the full retained result reference. Runtime adapters retain existing transport options, geometry preparation, synchronous UI commit and scene/viewer update order. Eight former runtime fields have one owner, with no mirrors. This increment removes another 78 runtime lines, leaving 14,665; boundary clarity takes priority over raw line count.

Function comments document borrowed versus retained data, lazy construction, commit timing, timeout/error guards and distinct cancellation scopes. Renderer, map-edit, adaptive-display and transport/cache owners remain independent. Runtime still coordinates React state and feature interactions.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Acquisition adapter, synchronous result/progress adapters and lifecycle forwarding |
| `src/features/point-cloud/PointCloudAcquisition.ts` | Typed queue, request/deadline, follow and result owner |
| `src/features/point-cloud/README.md` | Contributor entry points, API contracts and checks |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Current resource boundaries and cancellation/commit ordering |
| `docs/REFACTORING-ROADMAP.md` | Completed extraction and next boundary |
| `tests/pointCloudAcquisition.test.cjs` | Controlled-clock/transport baseline comparisons and race regressions |
| `tests/fixtures/pointCloudAcquisition.baseline.json` | Immutable pre-extraction acquisition/follow/issue methods |
| `tests/pointCloudMapLayer.test.cjs` | Test-only retained-result accessor adapter; original regression assertions retained |

Validation includes 19 acquisition cases, the existing 15 map-owner and 10 viewer cases, and 23 runtime playback/dependency cases. The new owner and actual runtime SDK adapter pass strict TypeScript checks against ArcGIS 4.33.12. Another 278 runtime method/callback bodies are unchanged after normalizing the retained-result accessor. Host smoke validation remains necessary; no browser FPS or memory improvement is claimed by this structural extraction.

Crop/calibration preparation is completed below. Measurement/lasso/sight tool lifetimes remain separate cohesive feature work. Avoid a catch-all controller or one file per trivial helper; contributors should find each behavior through a clear feature entry point.

## Point-cloud geometry preparation

`features/point-cloud/pointCloudGeometry.ts` now centralizes the pure numerical preparation used by initial cloud commit, map features and both crop-size controls. It owns corridor filtering, extent/floor calculations and calibrated plain feature properties. SDK/resource ownership, UI state, renderer policy and operation timing remain in the existing adapters/owners. No new asynchronous work or full-cloud copy is added.

Function comments define degrees versus meters, shifted versus raw coordinates, radial extent versus along-street crop, borrowed point identity/order, calibration-after-crop, floor sampling and logical versus assigned ObjectIDs. State callback capture points are documented and preserved. This increment removes 151 runtime lines, leaving 14,514. Exactly four runtime methods changed; another 285 method/callback bodies remain token-identical.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Geometry adapters for initial commit, map preparation and both size controls |
| `src/features/point-cloud/pointCloudGeometry.ts` | Typed crop, extent/floor and calibrated feature calculations |
| `src/features/point-cloud/README.md` | Geometry entry points, coordinate contracts and test command |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Geometry responsibility and state/callback contracts |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |
| `tests/pointCloudGeometry.test.cjs` | Exact baseline comparisons, geometry edge cases and batched callbacks |
| `tests/fixtures/pointCloudGeometry.baseline.json` | Immutable pre-extraction runtime geometry/control methods |
| `tests/pointCloudAcquisition.test.cjs` | Geometry binding in existing acquisition recording harness |
| `tests/pointCloudMapLayer.test.cjs` | Geometry binding in existing map recording harness |

Validation: 16 new geometry cases plus 19 acquisition, 15 map-owner, 10 viewer and 23 playback/dependency cases (83 total). The geometry module and all four actual runtime adapters pass strict TypeScript against ArcGIS 4.33.12. Tests compare real geographic calculations and candidate enumeration, exact properties, point/index order, calibration, colors, floor thresholds, empty clouds, sentinels, rotated origins and batched callbacks. This structural change does not establish live browser FPS or SDK rendering; run the point-cloud host smoke checks.

Measurement ownership is completed below. Other point-cloud tools remain separate future boundaries. Keep lasso, line-of-sight and viewshed as separate boundaries. Continue removing runtime coordination only when feature ownership and contributor entry points remain clear.

## Measurement scene/viewer owners

Measurement resource lifetime now lives in `PointCloudMeasurement.ts` with a dedicated `MeasurementViewerRenderer.ts`. Runtime keeps typed SDK/DOM adapters, picked samples, picking, state/toggles and tool exclusion. The old map-layer field and renderer/active fields are removed without mirrors. Three viewer-destruction sites detach from the original viewer; cloud/widget teardown disposes resources; view readiness restores active measurement.

Normal scene graphics, distance/slope math, shader bytes, ENU conversion, GL upload/draw/state/deletion order, text rounding and label projection are preserved. This increment also corrects directly related lifetime gaps: shared initial layer loading, newest-only pending redraw, stale view/map rejection, original map/viewer cleanup, replacement restoration, contained SDK failures and no empty-layer recreation after teardown. These intentional corrections are tested separately from baseline rendering equivalence.

Function comments document raw versus shifted degrees, relative map z versus source altitude, meter units, lazy adapters, original-owner cleanup, synchronous redraw versus pending module work and reusable disposal. There are no new timers, animation loops, point-cloud requests or point-array copies. Runtime shrinks by 373 lines to 14,141; 281 other method/callback bodies, including picking and tool toggles, remain token-identical.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed measurement factory, scene/viewer forwarding, resource cleanup/restore hooks |
| `src/features/point-cloud/PointCloudMeasurement.ts` | Scene lifetime, shared SDK load, drawing and disposal |
| `src/features/point-cloud/MeasurementViewerRenderer.ts` | Typed measurement point, GL/viewer lifetime and label projection |
| `src/features/point-cloud/README.md` | Measurement entry points, contracts and verification |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Measurement ownership and intentional lifecycle corrections |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next tool work |
| `tests/pointCloudMeasurement.test.cjs` | Baseline graphics/GL comparisons and lifetime/race regressions |
| `tests/fixtures/pointCloudMeasurement.baseline.json` | Immutable pre-extraction scene/viewer methods |

Validation: 18 measurement cases plus the existing 83 geometry/acquisition/map/viewer/playback cases (101 total). Both new owners and the actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12 and Mapillary 4.1.2. Host validation still needs measurement picking, panorama label movement, fullscreen, 2D/3D switching and clear/close/reopen; recordings do not demonstrate actual GPU appearance or performance.

Lasso resource ownership and its index/projection contract are completed below. Keep candidate picking, logical IDs, filtered viewer indices and confirmed SDK ObjectIDs explicit; do not change selection math while moving its lifecycle. Leave sight/viewshed and renderer policy as separate later boundaries.

## Lasso lifetime and pure projection

`PointCloudLasso.ts` now owns pointer/capture and current/pending map highlight resources. `lassoProjection.ts` owns the unchanged pure ENU/matrix/polygon calculation. Runtime forwards events/SDK operations, retains polygon/selection state and viewer feedback, and continues mapping filtered indices through confirmed map-owner ObjectIDs. The drawing flag and highlight-handle fields are removed without mirrors.

The extraction preserves normal pointer/touch paths, functional polygon appends, batched state timing, raw coordinates, last-rendered matrices, NDC padding, ray casting, selected index order and state/viewer/map feedback order. Intentional lifecycle corrections are active-pointer isolation, SVG cancellation, capture release on clear/viewer teardown, stale layer-view rejection and safe original-handle cleanup. No shader/buffer or tool-toggle policy changes are included.

Function comments define CSS pixel versus WGS84/altitude inputs, borrowed matrix/point identity, filtered indices versus logical/confirmed IDs, capture ownership and async request validity. No timers, additional point traversal, matrix copies or network requests are introduced. Runtime shrinks by 94 lines to 14,047. Another 277 method/callback bodies, including tool toggles, picking and confirmed-ID resolution, remain token-identical.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed lasso factory, pure projection adapter, pointer/cancel and cleanup hooks |
| `src/features/point-cloud/PointCloudLasso.ts` | Pointer/capture and guarded highlight lifetime |
| `src/features/point-cloud/lassoProjection.ts` | Documented pure numerical selection in filtered-viewer index space |
| `src/features/point-cloud/README.md` | Lasso contributor entry points, contracts and checks |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Lasso lifetime, ID mapping and intentional corrections |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |
| `tests/pointCloudLasso.test.cjs` | Baseline projection/pointer/feedback and lifetime regressions |
| `tests/fixtures/pointCloudLasso.baseline.json` | Immutable pre-extraction runtime lasso methods |
| `tests/pointCloudViewerRenderer.test.cjs` | Moved math token comparison and unchanged commit assertion; original fixture retained |

Validation: 15 lasso cases plus the existing 101 geometry/acquisition/map/viewer/measurement/playback cases (116 total). The owner, pure projection and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; SVG targets satisfy the pointer boundary. Tests verify mathematical tokens against the original renderer fixture, numerical selection across shapes/poses, CSS dimensions, sparse confirmed IDs, batched input, feedback order, cancellation, out-of-order requests, replacement and teardown. Host smoke checks still require mouse/touch drawing, clear/cancel, crop/calibration, fullscreen, 2D/3D and close/reopen.

Line-of-sight ownership and pending-load guards are completed below. Keep viewshed separate, preserve tool exclusion and distinguish SDK view-model ownership from React tool intent. Continue reducing runtime coordination only when its feature contracts and validation remain clear.

## Line-of-sight SDK owner

`PointCloudSight.ts` now owns line-of-sight view-model creation, pending activation, observer/target SDK mutation, creating-view/map identity, clear and destroy. Runtime retains React tool intent, typed ArcGIS point state, picking, toasts and tool exclusion through a typed lazy factory. The old `any` view-model field is removed without a mirror.

Normal observer/target geometry and state-before-SDK order, clear/reuse, module path, toasts and tool exclusion are preserved. Intentional lifecycle corrections prevent construction after clear/disable/replacement, share current activation, enforce SceneView-only construction, destroy the original model on teardown, reject picks against old views and restore retained samples after readiness without duplicate React targets. Current SDK errors are contained/retryable; stale failures are ignored. The SDK still performs all visibility analysis.

Function comments document borrowed map geometry/z/spatial reference, React intent versus SDK authority, constructor-factory guards, sample restoration, clear versus dispose and failure handling. No timers, animation loops, geometry math or point-cloud requests are added. Runtime is 14,050 lines: this small boundary adds three net lines because typed SDK/state adapters replace implicit `any` operations. Clear feature ownership takes priority over reducing every increment's line count. Another 283 method/callback bodies remain token-identical.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed sight factory/state, SDK mutation forwarding, view readiness and cleanup hooks |
| `src/features/point-cloud/PointCloudSight.ts` | SDK model and guarded activation/view-map lifetime |
| `src/features/point-cloud/README.md` | Sight entry point, SDK contracts and test command |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Sight authority, lifecycle corrections and validation limits |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |
| `tests/pointCloudSight.test.cjs` | Real runtime toggle/hit/adapter comparisons and lifetime regressions |
| `tests/fixtures/pointCloudSight.baseline.json` | Immutable pre-extraction toggles/clear and actual hit branch |

Validation: 17 sight cases plus the existing 116 geometry/acquisition/map/viewer/measurement/lasso/playback cases (133 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover normal state/SDK ordering and geometry identity, exclusion, batched updates, failures/retry, concurrent activation, clear/disable during loading, constructor-side replacement, restoration, cleanup errors and old-view pick rejection. Host smoke checks still need observer/multiple targets, clear/toggle, other tools, 2D/3D and close/reopen with real visibility results.

Viewshed resource ownership and guarded async creation are completed below. Keep its observer-height, angle, distance and SDK analysis policy unchanged, with explicit original-view cleanup and stale-load rejection. Then review the remaining point-cloud renderer-policy and ring/grid responsibilities for cohesive contributor entry points.

## Viewshed SDK owner

`PointCloudViewshed.ts` now owns pending observer-click revision, fixed observer specification, SDK analysis and original view/map/collection lifetime. Runtime keeps mode, picked geometry, conditional tool exclusion, toasts and a typed lazy SDK factory. The raw `any` analysis field and MapView analysis-collection cast are removed without mirrors.

Normal module paths, constructor properties, observer read timing, replacement-before-load, toasts and toggle rules are preserved. Intentional corrections reject stale/out-of-order creation, enforce SceneView-only construction, remove from the original collection, destroy analyses, invalidate pending widget/view teardown and contain current SDK failures while ignoring stale failures. Analysis policy remains picked map z +1.5 m, range 150 m, fields 360/90 degrees and heading/tilt 0/0; the SDK continues visibility calculation.

Function comments define shifted degrees versus map-relative z, meter/degree policy, pending-request validity, original-collection cleanup and removal versus destruction. No timers, animation loops, point-cloud requests or alternative analysis math are added. Runtime shrinks by 19 lines to 14,031; 289 other method/callback bodies, including tool toggles, remain token-identical.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed viewshed factory, hit forwarding, clear and view/widget cleanup hooks |
| `src/features/point-cloud/PointCloudViewshed.ts` | Fixed observer policy and guarded SDK analysis lifetime |
| `src/features/point-cloud/README.md` | Viewshed contributor entry point, contracts and checks |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Viewshed authority, original context and intentional corrections |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |
| `tests/pointCloudViewshed.test.cjs` | Actual hit/factory/toggle policy comparisons and lifetime regressions |
| `tests/fixtures/pointCloudViewshed.baseline.json` | Immutable pre-extraction clear/toggles and observer-hit branch |

Validation: 15 viewshed cases plus the existing 133 geometry/acquisition/map/viewer/measurement/lasso/sight/playback cases (148 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover construction values/order, conditional exclusion, batched state, newest-click wins, clear/off/view/map/collection replacement, original-collection cleanup, failures/retry, partial attachment and constructor-side replacement. Host smoke checks still need real visibility results, repeated observer clicks, clear/toggle, other tools, 2D/3D and close/reopen.

Ring/grid resource lifetime and its readiness/generation contract are completed below. Keep distance/corridor drawing policy and original-view cleanup explicit. Renderer-policy extraction remains a separate later boundary; avoid combining unrelated controllers simply to reduce runtime line count.

## Distance-ring / grid feature owner

`PointCloudRings.ts` now owns the GraphicsLayer, original view/map, shared readiness task, load/draw revisions and the existing ellipse/label drawing implementation. Runtime retains a typed lazy factory, live dimension/calibration/bearing readers and the existing draw call sites. Raw layer/readiness/generation fields are removed without mirrors; cleanup no longer derives the ring map from the feature-layer owner.

Numerical drawing policy is preserved: shifted degrees with meter nudges, 111320/cosine conversion, actual-dimension fallbacks, nice intervals, per-radius bearing reads, 3-degree ellipse sampling/caps, closure, boundary colors, label extrema/thresholds and graphic order. Readiness remains asynchronous for existing layers and coalesces duplicate draws. Geometry reads stay after readiness, while the radius stays captured at the caller.

Intentional lifetime corrections reject stale view/map/result/SDK loading, preserve newer pending-task identity, remove/destroy on the creating map, contain current SDK/graphic failures, retry after failure and invalidate pending widget teardown. There are no extra point traversals/copies, timers, watchers, point-cloud requests or animation loops. Function comments document authority, meter/degree/height units, async guards, cleanup and numerical policy.

Runtime shrinks by 196 lines to 13,835. Another 288 method/callback bodies, including geometry callers, street-bearing policy and tool toggles, remain token-identical.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed ring factory, draw forwarding and original-resource cleanup/view hooks |
| `src/features/point-cloud/PointCloudRings.ts` | Layer/readiness/draw lifetime and preserved ring/label geometry |
| `src/features/point-cloud/README.md` | Ring feature entry point, contracts and verification |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Independent ring authority and deliberate lifetime corrections |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |
| `tests/pointCloudRings.test.cjs` | Exact baseline geometry/order comparisons and lifetime regressions |
| `tests/fixtures/pointCloudRings.baseline.json` | Immutable pre-extraction readiness and drawing methods |
| `tests/pointCloudMapLayer.test.cjs` | Test-only ring bridge; original teardown assertions retained |

Validation: 16 ring cases plus the existing 148 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/playback cases (164 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover exact vertices/labels/colors, intervals/fallbacks, latitude/rotation/calibration, duplicate draws, shared readiness/live state, clear/replacement, errors/retry, constructor-side replacement and original-map cleanup. Host smoke checks still need terrain placement, crop/calibration, repeated clear/load, map switches and close/reopen.

Map renderer/schema policy is completed below with geometry, confirmed-ID ownership and SDK edit order retained. Then review calibration/export coordination for a separate cohesive boundary. Prefer explicit contributor entry points over a generic catch-all controller.

## Point-cloud map display policy

`pointCloudMapPolicy.ts` now contains typed plain-property builders for RGB/elevation renderer policy and the empty-source layer schema/popup. Runtime retains geometry/update orchestration; `PointCloudMapLayer` retains resource lifetime, confirmed-ID authority and serialized edits. The schema builder runs only for new layers, and renderer identity remains borrowed.

Symbols, color stops/order, mode fallback, source/fields, ID casing, aliases, popup bytes, legend settings, visibility carryover, spatial reference and height policy are unchanged. Fresh nested metadata preserves SDK autocasting without shared mutable state. Function comments document borrowed renderer identity, new-layer allocation, unknown-mode/visibility fallback and separation from geometry/adaptive/ground policy. No UI, lifecycle, request, scheduling or edit-order change is included.

Runtime shrinks by 53 lines to 13,782; the map owner shrinks by 34 lines. Another 292 runtime method/callback bodies remain token-identical. Map-owner tokens are identical after replacing the extracted metadata expression with its helper call, preserving lifecycle, chunks, queue, confirmations and callback order.

| File | Change |
| --- | --- |
| `src/runtime/widget.tsx` | Typed renderer-policy call in existing render adapter |
| `src/features/point-cloud/PointCloudMapLayer.ts` | Schema-builder call only in new-layer branch |
| `src/features/point-cloud/pointCloudMapPolicy.ts` | Typed plain renderer, schema and popup properties |
| `src/features/point-cloud/README.md` | Policy contributor entry point and verification |
| `docs/POINT-CLOUD-OWNERSHIP.md` | Display policy versus geometry/resource ownership |
| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |
| `tests/pointCloudMapPolicy.test.cjs` | Exact baseline properties, popup bytes and object-isolation checks |
| `tests/fixtures/pointCloudMapPolicy.baseline.json` | Immutable pre-extraction renderer/schema expressions |
| `tests/pointCloudMapLayer.test.cjs` | Bind actual policy module; existing assertions/fixture unchanged |
| `tests/pointCloudGeometry.test.cjs` | Bind actual renderer helper; existing assertions/fixture unchanged |

Validation: 9 policy cases plus the existing 164 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/rings/playback cases (173 total). Policy outputs assign to actual ArcGIS 4.33.12 simple/unique-value renderer properties and FeatureLayerProperties; owner/runtime adapters pass strict TypeScript and full runtime TSX parses. Existing map/geometry tests verify SDK calls, confirmed IDs, edits, feature ordering and callbacks. Host smoke checks still need RGB/elevation, popup fields, hidden-layer carryover, ground filtering, crop/calibration and repeated clear/load/view switches.

Calibration input/update coordination is completed below with nudge units, debounce timing and map/viewer update order retained. Export orchestration remains a separate boundary from format writers and worker lifetimes.

## Point-cloud calibration coordination

Extracted accepted keyboard/joystick movement and map/rings/viewer commit order into `src/features/point-cloud/PointCloudCalibration.ts`, with function comments covering meters, live bearing, feedback timing, offset authority and timer ownership. Runtime keeps input eligibility, UI toasts, panel state, ground/color shortcuts and the original cancellable 150 ms debounce.

`widget.tsx` now has 13720 lines (62 fewer). All 535 other existing class members are token-identical, including acquisition reset/preservation, export reads, geometry, teardown and keyboard listener wiring. Only the four input handlers and debounce delegation changed; a callback adapter binds live runtime state. No new resources or cached data are retained.

Changed files: runtime widget; point-cloud contributor README; ownership document; this roadmap. Added: calibration coordinator, 16 differential regression cases, and immutable original-handler fixture. Validation: 189 regression cases across existing suites and new calibration cases; strict coordinator/runtime-boundary TypeScript; full runtime TSX parsing; guarded installer fixtures for conflicts, rollback, line endings, local edits, install/uninstall and installed tests. The checks do not replace Experience Builder smoke testing of keyboard/Shift, typing guards, joystick, reset, color/ground shortcuts and clearing during pending movement.

Export orchestration is completed below with calibrated input reads, writer selection, existing error/cleanup scopes, downloads and feedback retained.

## Point-cloud export orchestration

Extracted the single-flight export flow and browser download operations to `src/features/point-cloud/PointCloudExport.ts`; preparation/success/failure messages and JSX live in `PointCloudExportFeedback.tsx`. Runtime is now 13,669 lines (51 fewer). All other existing runtime class members and all format-writer tokens remain unchanged. The old busy field is replaced by a per-widget export coordinator and its explicit live-state/writer adapters.

Function comments document full-result borrowing, meter/degree units, captured versus live calibration inputs, feedback order, filename fallback timing, original CSV/binary error boundaries, disposal behavior and format-specific URL cleanup. No new filtering, cancellation, worker, point copies or file format change is introduced.

Changed: runtime widget, CSV file header comment, point-cloud contributor README, ownership document and this roadmap. Added: export coordinator, export feedback module, 15 baseline-backed regression cases and immutable original-handler fixture. Validation: 204 total cases including existing point-cloud/playback suites; strict coordinator/feedback/actual runtime adapter/writer types using local Jimu/React declarations; full runtime TSX parsing; token checks for unaffected runtime members/writers; installer fixtures covering conflicts, line endings, local edits, rollback, installed tests and uninstall. Experience Builder build, real browser downloads and file import remain host checks.

Crop/display coordination is completed below with captured-versus-live bearing/dimension reads, clamping, map/ring/viewer order and confirmed-ID ownership retained.

## Point-cloud crop/display coordination

Extracted length/width input and subset-update orchestration to `src/features/point-cloud/PointCloudCrop.ts`. Runtime is now 13,621 lines (48 fewer), with two forwarding control handlers and explicit state/viewer adapters. All other existing runtime members are token-identical; geometry, map-layer owner, adaptive display and point-cloud utilities are byte-identical.

Function comments explain half-dimension meter units, nonpositive/unlimited behavior, original clamps, deliberate length/width capture timing, live result/camera reads and subset assignment before upload. Map/ring/viewer order, callback guards and independent queued input behavior are unchanged. No timers, listeners, requests, SDK resources, full-cloud copies or new subset authority are introduced.

Changed: runtime widget, contributor README, ownership document, this roadmap and the geometry test harness (binds the real crop coordinator; original assertions/fixture retained). Added: crop coordinator, 15 differential cases and immutable original-control fixture. Validation: 219 total point-cloud/playback cases, strict coordinator and actual runtime adapter checks using real viewer/point types, full TSX parse, structural preservation checks and guarded installer fixtures. Host checks remain rapid sliders/unlimited dimensions, cloud closure/replacement, viewer recreation and lasso alignment after cropping.

Initial result application and presentation are completed below, with camera/extents/floor preparation, same-cluster calibration retention, initial map/viewer order and progress/summary feedback retained.

## Initial point-cloud result application and feedback

Extracted synchronous accepted-result orchestration into `src/features/point-cloud/PointCloudResultApplication.ts` and success/progress presentation into `PointCloudResultFeedback.tsx`. Runtime is now 13,537 lines (84 fewer). Its result/progress methods forward to feature entry points; explicit adapters bind current acquisition, camera, calibration, state, map, rings and viewer. Other existing runtime class members remain token-identical; geometry/acquisition/point-cloud utilities remain unchanged.

Function comments document full-result borrowing, subset identity, original preflight/ID/camera rules, source altitude units, query-insensitive same-cluster calibration retention and callback order. Acquisition still validates request identity before synchronous application and owns late progress suppression. No new scheduling, request, cloud store, SDK resource or UI behavior is introduced.

Changed: runtime, contributor README, ownership document, roadmap and geometry/acquisition test harnesses (actual module binding only; original fixtures/assertions retained). Added: application module, feedback module, 15 baseline-backed cases and frozen original result/progress fixture. Validation: 234 point-cloud/playback cases; strict application/feedback/actual runtime boundary checks with actual ArcGIS session and viewer/point types plus local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Experience Builder smoke checks remain initial/automatic loading, calibration/lasso preservation, viewer replacement and partial/progress feedback.

Activation/clear coordination is completed below with teardown order, debounce cancellation and acquisition/map/viewer ownership retained. Tool activation/mutual-exclusion policy remains a separate boundary.

## Point-cloud activation and clear coordination

Extracted clear/toggle orchestration to `src/features/point-cloud/PointCloudLifecycle.ts`. Runtime is now 13,489 lines (48 fewer), with two forwarding methods and lazy owner/UI adapters. All other existing runtime members are token-identical; acquisition, map, viewer, adaptive, lasso, measurement, sight, viewshed and ring owners are byte-identical.

Function comments explain reset-versus-reload behavior, original teardown order, cloud-owned progress dismissal, pending nudge cancellation, measurement callback live-view gating and distinct early/late lasso cleanup. No resource lifetime, callback coalescing, exception policy, timer, request, point copy or UI behavior is introduced.

Changed: runtime, contributor README, ownership document, roadmap and map test harness (feature binding only; original test bodies and fixture retained). Added: lifecycle coordinator, 15 baseline-backed cases and frozen original clear/toggle fixture. Validation: 249 point-cloud/playback cases; strict actual adapter checks against existing owner and ArcGIS types; full TSX parse; structural/owner-file preservation and guarded installer checks. Host smoke checks remain loading/following toggles, rapid off/on/reload, active-tool clearing, unrelated toast preservation and pending calibration cancellation.

Tool activation/exclusion coordination is completed below, including lasso, with individual owners, state callbacks, hit handling and feedback retained.

## Point-cloud tool activation and exclusion coordination

Extracted four toggle policies to `src/features/point-cloud/PointCloudTools.ts` and their existing instructions/JSX to `PointCloudToolFeedback.tsx`. Runtime is now 13,362 lines (127 fewer), with typed lazy callbacks and forwarding toggle methods. The other 540 runtime members are token-identical; tool owners, clear methods, hit handling and cloud lifecycle are unchanged.

Function comments document previous-state versus callback-time reads, updater-side cleanup, observer/selection resets, original return/await behavior and asymmetric exclusion rules. No symmetric policy redesign, resource ownership change, callback coalescing, error handling, request, timer or point copy is introduced.

Changed: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (actual feature bindings only; original fixtures/test bodies retained). Added: tool coordinator, feedback module, 15 baseline-backed cases and frozen original toggles. Validation: 264 point-cloud/playback cases; strict policy/feedback/actual runtime boundary checks with actual sight/ArcGIS types and local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Host validation remains per-tool activation/clear, switching with analyses present, rapid sight activation, lasso and cloud teardown.

Cloud-hit routing is completed below with hit-test order, geometry handling, tool precedence, viewer highlighting and image navigation retained.

## Point-cloud hit routing and tool dispatch

Extracted the normal cloud-hit branch into `src/features/point-cloud/PointCloudHitRouting.ts`. Runtime is now 13,302 lines (60 fewer), with typed live owner/state adapters and one consumed-click call. HitTest, annotation picking, enterprise-note precedence, route/object/coverage navigation and the surrounding error handler remain in runtime. Structural checks prove the click-host member is token-identical after normalizing only the extracted branch; all other existing members are token-identical.

Function comments document full-cloud versus filtered-viewer indices, SDK shape assertions, original alias/fallback rules, measurement/sight/viewshed precedence, synchronous consumption and async viewer-center refresh. Tool/map/viewer owners are unchanged. No hit-test invocation, event listener, resource, cloud copy or navigation policy is introduced.

Changed: runtime, contributor README, ownership document, roadmap and sight/viewshed test harnesses (route synthetic hits through the new feature; original fixtures/test bodies retained). Added: hit router, 15 baseline-backed cases and frozen original branch. Validation: 279 point-cloud/playback cases; strict routing/actual adapter checks with real SDK hit result and tool/viewer/point types; full TSX parse; structural preservation and guarded installer checks. Host smoke checks remain per-tool cloud clicks, updating-display feedback, highlight/miss behavior, crop/measurement index alignment and ordinary note/object/image navigation.

Annotation-mode cloud picking and local altitude estimation are completed below as a separate field-note boundary.

## Field-note annotation cloud picking and local altitude

Extracted annotation resolution to `src/features/field-notes/PointCloudAnnotationPicker.ts` with a pure local-altitude helper in the same module. Runtime is now 13,251 lines (51 fewer). Typed lazy adapters bind current full-cloud authority, visibility, note callback and the original warning. Runtime retains route/annotation gates, click interception, map-point setup and all subsequent navigation.

Function comments document degree/meter units, annotation-specific originalIndex/ObjectID lookup, raw-coordinate truthiness fallback, live post-hitTest reads, strict bbox/radius tests, low-percentile selection and original catch scope. Normal cloud-tool routing and utility math are unchanged. No new request, cancellation, event listener, retained cloud, note persistence or scan optimization is introduced.

Changed: runtime, point-cloud contributor README, ownership document and roadmap. Added: annotation picker/helper, field-note contributor README, 15 baseline-backed cases and frozen original annotation branch. Validation: 294 point-cloud/annotation/playback cases; strict actual adapter/SDK hitTest checks; full TSX parse; surrounding click-host token preservation; guarded installer checks. Host validation remains annotation placement in 2D/3D, exact/off-cloud/hidden-cloud picks, slopes, empty data and normal route/image/object/note navigation.

Field-note annotation activation and draft coordination are completed below, with panel state, captured coordinates, local/shared paths and persistence ownership retained.

## Field-note activation and draft coordination

Extracted annotation toggle/open/submit/cancel coordination to `src/features/field-notes/FieldNoteDraft.ts`; existing enable/disable/saved JSX and durations live in `FieldNoteDraftFeedback.tsx`. Runtime is now 13,200 lines (51 fewer), with four forwarding methods and explicit live state/marker/storage/render/publication adapters. Other existing class members remain token-identical; pending marker, persistence, Enterprise helper, controlled form, shared FieldNote type and annotation picker remain byte-identical.

A typed `PendingFieldNote` now includes optional altitude, matching the object already created/read by the runtime; no serialized schema changes. Function comments cover degrees/meters, capture timing, marker-before-state order, two-clock/random note IDs, captured-array persistence and unawaited optional publication. State ownership, callback timing, return/error behavior and existing queued submission semantics are preserved.

Changed: runtime, field-note contributor README and roadmap. Added: draft coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 309 point-cloud/field-note/playback cases; strict draft/feedback/actual adapter checks using the real FieldNote type and local Jimu declarations; full runtime TSX parse; unaffected member/resource preservation and guarded installer checks. Host smoke checks remain mode toggling, open/cancel, note altitude/image association, local save/reload and optional Enterprise sharing.

Local field-note collection updates are completed below, with storage payloads, delete/clear guards, confirmation ownership and local/shared separation retained.

## Local field-note collection coordination

Extracted restore/delete/clear orchestration to `src/features/field-notes/LocalNoteCollection.ts` and existing clear feedback to `LocalNoteCollectionFeedback.tsx`. Runtime is now 13,184 lines (16 fewer), with three forwarding methods and live state/guard/persistence/renderer adapters. Other existing class members are token-identical; storage helpers, shared FieldNote types, draft coordinator, controlled list and Enterprise helpers remain byte-identical.

Function comments document current-array borrowing, per-ID versus all-save guards, captured callback payloads, restore error scope, original separate empty arrays, confirmation ownership and local-only behavior. No storage schema, quota recovery, shared-note operation, callback scheduling/error policy, duplicate store, request or SDK resource is introduced. The runtime clear comment now accurately describes persisting an empty array rather than removing the storage key.

Changed: runtime, field-note contributor README and roadmap. Added: collection coordinator, clear-feedback module, 15 baseline-backed cases and frozen original methods. Validation: 324 point-cloud/field-note/playback cases; strict actual collection/persistence/feedback boundary checks with real FieldNote/Editor types and local Jimu declarations; full runtime TSX parse; unaffected member/helper preservation and guarded installer checks. Host smoke checks remain restore/delete/confirmed local clear, shared-save/editor guards and Enterprise record preservation.

Field-note GeoJSON import/export orchestration is completed below, with conversion, duplicate-ID rules, browser I/O and persistence/feedback order retained.

## Field-note GeoJSON file coordination

Extracted file orchestration to `src/features/field-notes/FieldNoteFiles.ts` and existing messages/JSX to `FieldNoteFileFeedback.tsx`. Runtime is now 13,128 lines (56 fewer), with two forwarding methods and live collection/state/persistence/render/log adapters. Other existing members are token-identical; converter, storage, draft, collection and shared FieldNote code tokens are unchanged. Only the converter header now identifies its file-coordination owner.

Function comments document exact export URI/format/download order, conversion-before-catch behavior, reader setup/onload/onerror boundaries, live completion-time ID lookup, original within-file duplicate acceptance and captured merged-array callbacks. No new cancellation, validation, size policy, storage schema, publication path, resource ownership or error handling is introduced.

Changed: runtime, converter header comment, field-note contributor README and roadmap. Added: file coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 339 point-cloud/field-note/playback cases; strict actual adapter/browser/feedback checks with real DOM/FieldNote types and local Jimu declarations; full runtime TSX parse; unaffected token preservation and guarded installer checks. Host smoke checks remain actual GeoJSON export/import, metadata/altitudes, duplicates and invalid/empty files, plus persistence after reload.

Field-note map rendering ownership is completed below with grouping, existing guards and viewer ordering retained.

## Field-note map group and local graphic ownership

Extracted group/local map state and draw/ensure/clear methods to `src/features/field-notes/FieldNoteMap.ts`. Runtime is now 13,083 lines (45 fewer). Six runtime fields are replaced by one typed feature owner; Enterprise child-layer removal and pending-marker visibility borrow read-only accessors. Map/SDK/group wrappers remain explicit.

Function comments document group load sharing, original revision/live-view/disposal checks, creating-view cleanup, visibility carryover, 2D/3D capture, live note/shared-layer reads and local-copy suppression. Descriptors remain unchanged. No new load-sharing, draw supersession, cancellation, error policy, query, viewer update, timer or note cache is introduced. A redundant map-switch branch after clear was removed: clear always nulled the local-layer reference before its condition.

Changed: runtime, descriptor header comment, field-note contributor README and roadmap. Added: map owner, 16 baseline-backed cases and frozen original lifecycle methods/redundant cleanup block. Validation: 355 point-cloud/field-note/playback cases; strict actual owner/SDK factory/grouping boundary checks against ArcGIS 4.33.12; full runtime TSX parse; 538 existing member bodies token-identical and three others normalized only for owner accessors/dead cleanup; unchanged helper tokens and guarded installer checks. Host smoke checks remain local/shared grouping, visibility, 2D/3D switches, pending marker display and repeated clear/reopen.

Next: extract field-note viewer registration and marker synchronization, preserving renderer attach/update/remove behavior, relevant-note selection, raw-coordinate/source-height policy and viewer reference callbacks.

## Native coverage selection; refactoring checkpoint

Refactoring is paused after the field-note map resource owner. Resume the queued viewer registration work after validating this coverage change in the host.

`features/coverage/NativeSequenceSelection.ts` owns selected-sequence style partitions. Turbo always renders native vector circles and sequence lines; selection colors their original geometry blue without creating sequence point Graphics. Image membership uses `sequence_id`; sequence lines use `id`. Base quality/date/travel/ownership filters apply to both partitions, and clearing selection restores the original paints and filters. Frame changes within a sequence do not update the style. Bind after each committed style load and release references when retiring a view.

The close-zoom Graphics renderer and its pick gate are removed. `TURBO_LIMITS.closeZoom` remains a legacy diagnostic value only; editing it cannot enable point replacement. Native offset correction and on-demand tile picking are preserved at all image zooms. Active-image pulse, camera cone and hover feedback remain independent. Complete route geometry remains available to elevation/minimap consumers without a second main-map route overlay in Turbo. Legacy non-Turbo route markers retain their bounded window. The coverage guide describes selected native circles rather than nearby downloaded frames.

Host validation: compare circle centers, radius and outline before/after selection at zooms 14, 19, 21 and 23+; switch sequences, clear selection, apply date/quality/organization filters, and repeat in 2D/3D and during playback/profile loading. GPU appearance and native SDK rendering require the Experience Builder host.

## Native selection correction and overview restoration

The first native selection installer produced blue circles across unrelated sequences in the host; its portable filter tests did not establish actual renderer behavior. Replace incremental style-layer partitions with per-feature `case` color expressions on the existing styles through `setPaintProperties`. No selected style layers, membership filters or point Graphics are added. Only a matching sequence ID receives blue; other/missing IDs use the original quality/date color. All base filters and circle dimensions remain unchanged.

Restore the existing cached faint overview and complete route line on the main map. Native marker refresh removes only legacy point graphics, preserving that overview. Full-coordinate route loading remains on demand for elevation. The earlier statement about suppressing the main-map overview is superseded. Refactoring remains paused at the field-note map checkpoint.

## Viewport-aware image follow

`features/imagery/imageFollowPolicy.ts` owns the movement decision. Synchronization now defaults to keeping the current image visible: no position update while its projected ground point remains in the viewport. Explicit `Lock to image` restores continuous following and uses the existing directional recenter settings. The lock is session state, initially off; manual Center and heading follow remain separate. 3D bearing updates move the center only while position lock is enabled. Rendered-terrain sampling is synchronous and adds no elevation requests. Missing terrain defers automatic repositioning. The runtime's `syncMapToImage` adapter is shared by confirmed image updates and immediate lock activation. Validate panning, rotated/tilted views, every configured recenter position and playback in the host.

### Smooth follow before the viewport edge

The default follow safe area now has a 12% CSS-pixel inset per axis, capped at 64 px. Entering this band triggers a 450 ms ease-in-out recenter even during playback, retaining zoom/scale and configured positioning. Default follow waits while the view moves; heading-only updates also defer so they cannot cancel the recenter or a user gesture. Explicit image lock retains its former timing. No additional timer, watcher or request is added. Validate camera easing and mobile edge spacing in the host.
