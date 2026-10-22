# Contributor-readiness roadmap

This supplements REFACTORING-PLAN.md with the remaining delivery order. It is a structural refactor of the existing ArcGIS Experience Builder/React widget, not a feature rewrite. Release configuration and CI remain a separate later task.

## Current position

Coverage algorithms, imagery requests/discovery, transport helpers, exports, style families and much of field-note presentation/validation now have feature modules. Field-note viewer rendering and the pending marker have explicit resource owners. These extractions are useful, but they do not finish the architecture: the runtime remains large, while InfoBox now composes controlled feature sections with centralized status, footer and shell styles. Runtime resource ownership remains the next focus; line counts are not completion criteria or performance measurements.

Small helpers have established tested boundaries. The next work should emphasize complete feature components and controllers rather than generating more one-function files. Existing helpers can be grouped further when their shared ownership becomes clear; do not consolidate merely to reduce file count.

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
