# InfoBox feature sections

InfoBox owns the scroll container, overflow discovery, floating UI and overall composition. Feature sections receive controlled values and callbacks; they do not own the widget, SDK views, requests or playback scheduling.

| Section | Presentation | Styles | Parent-owned behavior |
| --- | --- | --- | --- |
| Field notes | `src/features/field-notes/NoteToolsSection.tsx` | `src/styles/fieldNotes.ts` | Annotation mode, note count, list visibility and all local/Enterprise operations |
| Nearby captures | `src/features/imagery/NearbyToolsSection.tsx` | `src/styles/nearbyTools.ts` | Image-selected visibility, loading/count state, tray toggle, discovery and playback coordination |
| Quality coverage | `src/features/coverage/QualityToolsSection.tsx` | `src/styles/qualityTools.ts` | Visibility guard, quality mode, selected band, coverage rebuilds and band-toggle semantics |
| Coverage-analysis launch | `src/features/coverage/CoverageAnalysisTrigger.tsx` | `src/styles/coverageAnalysis.ts` | Turbo/visibility guard, minimum zoom default, analysis execution, cancellation and results |

Nearby controls retain the existing `imageId` visibility guard in InfoBox. Loading text takes precedence over the count; zero/missing/nonpositive counts remain hidden. The section only forwards the original toggle callback. No effect, timer, listener, discovery request or additional DOM wrapper is introduced.

Cloud controls, routing and other sections still have inline presentation in InfoBox. Extract them as cohesive controlled sections after inventorying their local state and event handlers; do not move only half of an interaction or duplicate state in a child.

## Working on a section

Keep its presentation in the owning feature folder and its styles in the named style family. Reuse shared style tokens only when values are proven identical and belong to the same visual contract. Preserve host/SDK cascade order, callback semantics, disabled states, tooltips and conditional placement during mechanical moves.

Focused checks are `tests/noteToolsSection.test.cjs`, `tests/nearbyToolsSection.test.cjs`, `tests/qualityToolsSection.test.cjs` and `tests/coverageAnalysisTrigger.test.cjs`. They exercise presentation and action forwarding with a lightweight JSX harness; they are not browser layout or playback performance measurements. Check InfoBox scrolling, narrow/mobile layouts and the associated controls in Experience Builder after applying an extraction.

The analysis launch component preserves the current zoom/points/loading gates and forwards the original run callback only when ready. InfoBox still applies `turboMinZoom = 16` and the turbo/hide visibility conditions; result UI and cancellation remain separate. The extraction does not add a native disabled attribute or change hover behavior.
