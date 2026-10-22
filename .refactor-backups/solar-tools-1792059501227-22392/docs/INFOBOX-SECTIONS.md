# InfoBox feature sections

InfoBox owns the scroll container, overflow discovery, floating UI and overall composition. Feature sections receive controlled values and callbacks; they do not own the widget, SDK views, requests or playback scheduling.

| Section | Presentation | Styles | Parent-owned behavior |
| --- | --- | --- | --- |
| Field notes | `src/features/field-notes/NoteToolsSection.tsx` | `src/styles/fieldNotes.ts` | Annotation mode, note count, list visibility and all local/Enterprise operations |
| Nearby captures | `src/features/imagery/NearbyToolsSection.tsx` | `src/styles/nearbyTools.ts` | Image-selected visibility, loading/count state, tray toggle, discovery and playback coordination |
| Quality coverage | `src/features/coverage/QualityToolsSection.tsx` | `src/styles/qualityTools.ts` | Visibility guard, quality mode, selected band, coverage rebuilds and band-toggle semantics |
| Coverage-analysis launch | `src/features/coverage/CoverageAnalysisTrigger.tsx` | `src/styles/coverageAnalysis.ts` | Turbo/visibility guard, minimum zoom default, analysis execution, cancellation and results |
| Coverage progress/results | `src/features/coverage/CoverageAnalysisResults.tsx` | `src/styles/coverageAnalysis.ts` | Visibility guard, result data, cancellation, dismissal, segment visibility and routing controls |
| Routing controls | `src/features/routing/RouteControls.tsx` | `src/styles/routing.ts` | Route services/scoring, waypoint selection, result/progress state, export and reset callbacks |
| Preserved A/B points | `RoutePointControls` in `src/features/routing/RouteControls.tsx` | `src/styles/routing.ts` | Visibility after results clear, retained waypoint state and reset callback |
| Cloud adaptive/status | `src/features/point-cloud/PointCloudStatusSection.tsx` | `src/styles/pointCloudControls.ts` | Independent visibility guards, sampling state, diagnostics, retry/resume, loading and follow state |

Nearby controls retain the existing `imageId` visibility guard in InfoBox. Loading text takes precedence over the count; zero/missing/nonpositive counts remain hidden. The section only forwards the original toggle callback. No effect, timer, listener, discovery request or additional DOM wrapper is introduced.

Cloud corridor/calibration controls and other sections still have inline presentation in InfoBox. Extract them as cohesive controlled sections after inventorying their local state and event handlers; do not move only half of an interaction or duplicate state in a child.

## Working on a section

Keep its presentation in the owning feature folder and its styles in the named style family. Reuse shared style tokens only when values are proven identical and belong to the same visual contract. Preserve host/SDK cascade order, callback semantics, disabled states, tooltips and conditional placement during mechanical moves.

Focused checks are `tests/noteToolsSection.test.cjs`, `tests/nearbyToolsSection.test.cjs`, `tests/qualityToolsSection.test.cjs`, `tests/coverageAnalysisTrigger.test.cjs`, `tests/coverageAnalysisResults.test.cjs`, `tests/routeControls.test.cjs`, `tests/routePointControls.test.cjs` and `tests/pointCloudStatusSection.test.cjs`. They exercise presentation and action forwarding with a lightweight JSX harness; they are not browser layout or playback performance measurements. Check InfoBox scrolling, narrow/mobile layouts and the associated controls in Experience Builder after applying an extraction.

The analysis launch component preserves the current zoom/points/loading gates and forwards the original run callback only when ready. InfoBox still applies `turboMinZoom = 16` and the turbo/hide visibility conditions; result UI and cancellation remain separate. The extraction does not add a native disabled attribute or change hover behavior.

The results component renders progress and tier statistics without running analysis or owning routing state. Its `renderRoutingControls` callback is evaluated only in ready results, after the map toggle. InfoBox retains the original segment-visibility routing guard inside that callback, preserving conditional evaluation and routing position. InfoBox now composes `RouteControls` inside that callback; the existing visibility guard is retained.

`RouteControls` owns routing presentation and the existing `ExtraTimePicker` class. Its preset-menu state, DOM references, portal target, viewport positioning and listener cleanup move together unchanged. Routing-control styles live in `styles/routing.ts`; the picker retains its own existing internal/position-dependent styles for a later focused styling pass. The component starts no route requests and owns no map layers. InfoBox keeps the persistent A/B visibility guard and composes `RoutePointControls` from the same routing module. The lifecycle suite reads the picker from its new feature file to retain its existing focus, touch-size and teardown checks.

Cloud adaptive controls remain guarded by `pointCloudVisible`, while diagnostics remain independently guarded by a nonempty `pointCloudSummary`. The new presentation exports add no effects, polling or requests. Raw diagnostics, corridor-count text, previous-image indication and Retry/Resume/loading priority are preserved. Acquisition budgets, adaptive sampling, follow intent and resume behavior remain runtime responsibilities.

### Point-cloud corridor controls

`features/point-cloud/PointCloudCorridorControls.tsx` groups length and width controls. `styles/pointCloudControls.ts` owns their presentation. InfoBox retains both draft values so visibility changes preserve their lifetime. Dragging updates only the draft; mouse/touch release applies the value through the existing runtime callback. Zero remains the FULL sentinel. This component adds no effects, requests or timers.

### Point-cloud export controls

`features/point-cloud/PointCloudExportControls.tsx` owns the format selector and download presentation. InfoBox keeps the selected format when controls are hidden. The runtime callback still owns CSV, PLY and LAS generation; rendering and selection do not generate files. Styles live beside the other point-cloud controls in `styles/pointCloudControls.ts`.
