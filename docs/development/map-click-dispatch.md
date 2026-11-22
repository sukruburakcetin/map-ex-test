# Map click dispatch — stage 94 / P03 part 1

`src/features/navigation/mapClickDispatch.ts` owns the ordered map-click dispatch workflow. `onActiveViewChange` binds a small event thunk that directly returns its promise. `Widget.prepareMapClick` captures preview identity, revisions and location before asynchronous picking; `mapClickDispatchHost` supplies click-only capabilities through live getters and narrow feature operations. The dispatcher receives no widget, React state or props object.

Priority is preserved: workspace location selection, route picking, annotation, shared/local notes, point-cloud tools, direct/native Places, selected sequence, detections and coverage imagery. The existing `coverageClickHitTest`, nearest-frame, Places normalization, note-popup and attachment helpers are reused. The workflow retains native tile transport, local loaded-route selection and regional nearby-frame lookup rather than enumerating a sequence.

Live getters are deliberate: Places owner/source, active view, filter revision, request controllers and loaded-route identity are rechecked after the same original awaits. Mutable controller/highlight slots remain bound to their existing widget owners so later clicks, map transfer and cleanup cancel the same work. Preview capture remains synchronous beside its current owners. The dispatcher is the sole asynchronous click function; the event thunk and host bindings add no asynchronous handoff, timer, service request or dependency.

Twenty-seven new frozen/current comparisons cover priority, early modes, native POI clusters/choices/source replacement, loaded routes, regional imagery, empty hits and stale SDK results. The original 22 coverage-click tests, POI stop-propagation assertions and lifecycle-wide cancellation checks remain active through a production-source harness. The shared fixture exercises both the frozen callback and actual dispatch/prepare/host/thunk chain; it does not substitute the dispatch algorithm.

P03 remains in progress: pointer/hover dispatch, hover-resume/touch/container wiring and detection hover still need review/extraction. Preview preparation and concrete SDK/owner bindings remain in the widget. Widget size is 10,704 lines, 207 fewer than stage 93. The feature workflow remains explicit rather than a generic handler framework; legacy comment consolidation belongs to P11.

Validation: 3,093 passing portable tests / 220 files in both workspace and clean installer-produced copy, zero failures or skips. The isolated ExB 1.20 module-graph build has zero errors/warnings. Targeted SDK-aware click-module type checking, BOM/CRLF comparisons, mutation checks and reversible installer checks pass. Live ExB 1.21/browser acceptance remains pending under P12.

Type-check scope: the moved module is checked with strict TypeScript and real ArcGIS SDK declarations, with small temporary type-only aliases for unrelated JimuMapView/pako imports reached through existing shared types. This is not a full Experience Builder or whole-project strict typecheck. SDK-specific projection stays in the host; module SDK types are erased at runtime. Existing coordinate assumptions/casts are preserved rather than introducing validation or geometry changes during the move.

Install after stage 93 from the widget root:

```sh
node apply-map-click-dispatch-refactor.cjs --dry-run
node apply-map-click-dispatch-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/map-click-dispatch-stage94` for `node apply-map-click-dispatch-refactor.cjs --uninstall`. Unknown source edits stop installation before writes; unrelated documentation history is retained. Preserve the backup for exact guarded rollback and uninstall later stages first.

Real-host checks remain necessary: fast alternating clicks, low-zoom representatives, overlapping notes/detections/POIs, route/annotation/location modes, native POI clusters, map replacement and close during picking. Confirm one intended target opens, old results cannot replace it, and metadata/image information still respects user intent. Portable tests and the isolated module graph do not establish browser acceptance or measured performance.

Next: move pointer/hover dispatch and its container/touch/resume lifecycle into named interaction modules, reusing existing coverage/Places/detection owners and preserving independent coverage picking. Then review P03 completion against its original 2–3-change allowance.
