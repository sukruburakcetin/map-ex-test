# Reading the widget runtime

Start with [the architecture overview](architecture.md), then use this guide to
navigate [widget.tsx](../../src/runtime/widget.tsx). The runtime is still a large
coordinator; the presentation extraction does not complete its modularization.

## Read in this order

| Question | Runtime entry points | Related ownership |
| --- | --- | --- |
| How does startup attach resources? | `componentDidMount`, `ensureArcGISModules`, `onActiveViewChange` | Startup abort/revisions, active-view revision, ArcGIS SDK factories |
| What happens after selecting imagery? | `loadSequenceById`, `ensureImageViewer`, `bindMapillaryEvents` | Foreground selection, viewer instance, live sequence frame window |
| Where does optional work run? | `runSequenceBackground`, `fetchReverseGeocode`, `fetchNearbyImages` | Background queue and demand-driven metadata/discovery |
| How are coverage picks resolved? | `pickTurboRepresentative`, `pickTurboGraphic`, `updateTurboHover`, `coverageSelectionContext` | Raw tile requests/cache, exact image identity, pointer/request ownership |
| How do places and detections interact? | `syncPlaces`, `explorePlace`, `fetchAlternateImages`, `_handleSelectAlternateImage` | Places service, selected-feature detail/navigation requests and detection controller |
| How is analysis converted to a route? | `runCoverageAnalysis`, `generateCaptureRoute`, `generateEsriDetourRoute` | Analysis snapshot, `RouteGeneration`, provider cancellation and guarded rendering |
| What changes between layouts? | `toggleFullscreen`, `createMinimap`, `destroyMinimap` | Mapillary recreation, React body portal, separate ArcGIS minimap |
| What releases resources? | `cleanupWidgetEnvironment`, `disposeStartupResources`, `componentWillUnmount` | Instance listeners/timers, feature owners and registered shared-map resources |
| Where is the UI composed? | `render`, `renderLocalizedContent` | [Stateless viewer views](viewer-presentation.md), existing panels and localization |

The shared React state contract is in `src/runtime/widgetState.ts`. Feature views
consume narrow presentation props; do not pass the widget itself into them.

## Ownership rules to preserve

An asynchronous result needs more than valid data: it must still belong to the
request, image, feature, view and source that requested it. Read the local
`current()` predicate and the corresponding invalidation path before editing an
await or adding a state update. Different operations deliberately have different
owners; do not replace their guards with one global loading flag.

- Startup revisions and `_startupAbort` prevent late startup attachment after disposal.
- Active-view startup checks reject work from a replaced view/map.
- `_selectionRequestId` and selection cancellation protect foreground image changes.
- Selected-feature detail and alternate-navigation requests have separate revisions/controllers.
- Coverage analysis has its own abort, revision and input snapshot checks.
- `RouteGeneration` owns a route run, its provider requests and authority to publish or clear busy state.

Aborting transport does not replace identity checks: some SDK operations can finish
after cancellation. Conversely, a stale-result check alone does not release an
abortable network request or an event listener.

Optional metadata must not delay foreground imagery or take ownership of its
selection. Reuse existing background/discovery owners rather than starting a new
fetch or timer in a render function or presentation component.

Shared ArcGIS maps can contain unrelated widgets' layers and graphics. Use the
existing ownership helpers and feature disposal paths; removing by a broad ID or
clearing `view.graphics` can affect another widget. Keep SDK-owned viewer/minimap
DOM nodes empty from React's perspective, with overlays and controls as siblings.

## Fullscreen is a lifecycle transition

The current implementation removes and recreates the Mapillary viewer when
switching between embedded and fullscreen layouts. It preserves image/bearing,
then rebinds integrations. It is not merely a resize. Mapillary JS initialization
can pass through its internal cover-loading state even with `cover: false`.

Restoration runs in an asynchronous `setState` callback. Awaiting
`toggleFullscreen()` does **not** establish that this callback, image rendering or
minimap startup has finished. A future transition redesign needs explicit
completion semantics and live SDK validation; this documentation pass changes none
of that behavior.

## Comment conventions

Use JSDoc on substantial entry points to describe intent, ownership and side
effects. Document coordinate order/units, cancellation, return semantics and failure
behavior when callers need that information. Keep short delegating callbacks
simple; do not add comments that merely translate an assignment into prose.

Keep inline comments that explain why ordering or a guard matters. Remove stale
version notes, contradictory claims and repeated narration. Reference constants
such as `LIMITS.ALTERNATE_IMAGES` rather than copying values into comments. When
moving code, check that its documentation moves to the actual implementation,
not an adjacent property or getter.

## Validation scope

Stage 49 changes comments and contributor documentation only. It does not fix the
fullscreen transition, change request timing, add dependencies or claim improved
performance. Verification compares the full runtime syntax tree and emitted
JavaScript (with comments removed) against the stage-48 input, then runs the
focused regression suite and documentation checks. Existing repository-wide
strict type errors and target Experience Builder 1.21/live-SDK checks remain
separate work.

The reversible `apply-widget-documentation.cjs` installer targets the known
stage-48 runtime, tolerates BOM/CRLF, preflights all affected files and refuses
unknown edits. It preserves existing milestone/architecture text by appending
notes. Keep its backups for `--uninstall`; no dependency installation is required.
