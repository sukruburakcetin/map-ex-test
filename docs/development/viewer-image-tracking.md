# Viewer image tracking — stage 97 / P04 part 1

`src/features/imagery/viewerImageTracking.ts` owns the complete SDK image-event workflow. The widget still registers the event and supplies its cone redraw callback. It creates a live typed capability host once per viewer binding; the event thunk directly returns the feature promise. The workflow receives no widget, React state/props object, SDK service or new frame store. Viewer/view identities are generic opaque references.

The handler keeps the existing initial viewer/opening-request gates, bearing/profile confirmation, custom-angle timing and old-image detection/note cleanup. It then resolves the displayed frame through the existing `LiveSequenceFrames` owner and retains the original viewer/view/current-frame checks. A cross-sequence event performs the same cancellation, state updates and bounded demand-sequence preparation. Confirmed image publication, pulse/cone, minimap/local-window refresh and optional map sync keep their order.

Secondary detection, note markers, time travel, solar, reverse-address, URL and nearby work still use `LatestFrameDetails`, with current-frame guards and live pause/fly-in gates. The workflow adds no wait for full sequence enumeration or optional details, no async handoff, request, timer, cache or dependency. State updater/callback timing and each original guard scope remain unchanged, including the narrower request/abort/sequence/view guard on lateral route preparation.

The generic commit contract permits only tracking-owned state keys and preserves React's generic partial-update typing; it does not expose the widget's state object. Concrete resource disposal, marker assignment and last-selection snapshot storage remain small host bindings. Their reads stay at the same points in the workflow, rather than caching state before awaits.

Twenty-nine new frozen/current comparisons exercise the actual event thunk, host and workflow with controlled frame resolution, React commits and detail queues. Same/cross sequence, first-image confirmation, map/profile/Places effects, draft-note cleanup, playing/hidden/fly-in gates, obsolete opening events, late metadata, deferred state and superseded detail work are covered. Existing image-first, bearing, selection-pulse/fullscreen, sequence-performance and lifecycle cancellation assertions remain active through the production-source harness.

P04 is in progress. `bindMapillaryEvents` still owns load/bearing registration, wheel/zoom handling and delayed direction setup; explicit `loadSequenceById` opening/transition coordination remains in the widget. Those boundaries need the remaining P04 review/extraction. Widget size is 10,373 lines (31 fewer); explicit host bindings are retained instead of an untyped widget proxy. No other package is declared complete by this move.

Validation: 3,187 passing portable tests / 223 files in workspace and clean installer-produced copy, zero failures or skips. Strict feature-module checking and a React-style generic commit-contract check pass. Isolated ExB 1.20 module-graph build: zero errors/warnings. BOM/CRLF comparisons, targeted mutation and reversible installer checks pass. Full ExB 1.21/provider/browser acceptance remains pending under P12.

Type-check scope is the feature module and its imported contracts, plus a targeted React-style partial-commit compatibility probe. This is not a full host/whole-project strict typecheck. The build checks the ExB 1.20 webpack module graph, not a full ExB 1.21 application or real viewer/browser acceptance.

Install after stage 96 from the widget root:

```sh
node apply-viewer-image-tracking-refactor.cjs --dry-run
node apply-viewer-image-tracking-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/viewer-image-tracking-stage97` for `node apply-viewer-image-tracking-refactor.cjs --uninstall`. Unknown edits stop installation before writes. Unrelated documentation history is retained; preserve the backup for guarded exact rollback and uninstall later stages first.

Real-host checks: rapid A/B/C selections, same/different sequences, viewer replacement/fullscreen, absent/late metadata, active map replacement, playback pause/resume, visible pulse/cone and optional detail panels. Confirm old SDK emissions cannot supersede a newer image opening, normal same-sequence surfing stays immediate, and image information still opens only by the user's action.

Next: complete the remaining load/bearing/event lifetime boundary and explicit sequence-opening orchestration, reusing existing bearing, playback, frame, request and presentation owners. Keep P04 within its original 2–3-change allowance unless concrete coupling justifies revising it. P04–P12 remain nine packages, provisionally 13–22 further changes after this first P04 change.
