# Viewer event binding — stage 98 / P04 part 2

`src/features/imagery/viewerEventBinding.ts` owns viewer load/bearing/image registration and the existing cone, zoom/wheel, URL and direction scheduling policy. The widget retains a short entry and a live typed host. The coordinator reuses stage-97 image tracking and the existing bearing/playback owners; it creates the image capability host once per binding.

Binding order remains bearing invalidation, pulse/cone clearing, fresh URL debounce, load registration, delayed direction setup, bearing registration and image registration. Load keeps zoom-delta subscription, keyboard zoom disabling, wheel handling, initial cone redraw and playback binding in the same order. Playback owner construction still precedes SDK sequence-component lookup; comparison tests exposed and prevented an argument-evaluation reorder during extraction.

Bearing events still reject retired viewers, use shared/current-image cached heading for cones, refresh image bearing readiness and coalesce redraw/minimap work through one animation-frame slot. URL updates keep the 600ms debounce and live image lookup. Direction setup keeps the 500ms delay. 3D map-heading sync retains its original event-bearing, fly-in, lock and stationary policy, including wheel/zoom bounds. Native SDK legacy zoom/keyboard component capabilities remain dynamically typed at the boundary.

Existing widget, bearing and playback owners keep cancellation slots and teardown. The coordinator preserves load callbacks' live viewer reads and bearing/image callbacks' captured-viewer guards. This move adds no subscription, timer, request, dependency or unsubscribe policy. It does not add a new viewer, playback or frame store.

Thirty-two frozen/current comparisons exercise actual entry/host/coordinator behavior: registration, load/zoom/wheel, missing components/container/viewer/frame, shared zero heading, unready bearing, RAF coalescing, URL cancel/live reads, 2D/3D lock/movement gates, viewer replacement, repeated load and real image-tracking cone publication. Existing bearing, image-first, pulse/fullscreen, map-follow, performance and lifecycle assertions remain active through production-source harnesses.

P04 remains in progress after two changes. Explicit `loadSequenceById` opening/transition orchestration still needs its final extraction/review. Widget size is 10,258 lines (115 fewer than stage 97; 146 fewer across P04 so far). One final P04 change is planned within its original 2–3-change allowance. P04–P12 remain nine packages, provisionally 13–21 further changes: one P04 plus the original 12–20 allowance for P05–P12.

Validation: 3,219 passing portable tests / 224 files in workspace and clean installer-produced copy, zero failures or skips. Strict feature-module and real Mapillary Viewer contract checks pass. Isolated ExB 1.20 module-graph build: zero errors/warnings. BOM/CRLF, targeted mutation and reversible installer checks pass. Full ExB 1.21/browser acceptance remains pending under P12.

Type-check scope is the feature module/imported contracts and a real Mapillary Viewer compatibility witness, not a full host/whole-project strict typecheck. The build checks the ExB 1.20 webpack module graph; real ExB 1.21 viewer, browser and service behavior still requires the acceptance matrix.

Install after stage 97 from the widget root:

```sh
node apply-viewer-event-binding-refactor.cjs --dry-run
node apply-viewer-event-binding-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/viewer-event-binding-stage98` for `node apply-viewer-event-binding-refactor.cjs --uninstall`. Unknown source edits stop installation before writes; unrelated documentation history is retained. Preserve the backup for guarded exact rollback and uninstall later stages first.

Real-host checks: repeated viewer creation/fullscreen, image/bearing changes, mouse wheel and SDK zoom controls, map lock/follow in 2D/3D, playback pause/intent, direction hover after startup, and close/reopen. Verify pulse/cone restoration, true cached heading, URL stability during fly-in and normal cleanup. Portable checks do not establish these browser observations or performance measurements.

Next: finish P04 with explicit sequence-opening orchestration through current selection/frame/request owners, keeping image-first opening, bounded cached/local route reuse and late-result rejection. Review P04 completion against its original criteria before proceeding to P05 React lifecycle/teardown.
