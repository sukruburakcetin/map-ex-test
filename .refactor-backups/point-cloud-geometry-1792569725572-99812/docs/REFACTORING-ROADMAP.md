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

`features/imagery/ActiveSequenceOverlay.ts` owns the active-sequence layer, original owning view and marker index. Its ensure/dispose pair keeps layer attachment, ordering and graphics release together. Runtime still owns sequence loading, batch scheduling, marker geometry and hybrid coverage symbol restoration. This boundary adds no requests, timers or playback work.

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

Next: extract pure crop/calibration preparation into a named geometry module with documented coordinate units and preserved ordering. Then move measurement/lasso/sight tool lifetimes as separate cohesive features. Avoid a catch-all controller or one file per trivial helper; contributors should find each behavior through a clear feature entry point.
