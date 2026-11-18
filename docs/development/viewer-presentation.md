# Viewer presentation boundary

Stage 48 extracts presentation from `src/runtime/widget.tsx`. It is based on commit
`609b81c` (v13) and adds no runtime dependencies.

## Responsibilities

| Module | Owns | Leaves with the runtime |
| --- | --- | --- |
| `src/components/ViewerSurface.tsx` | Viewer frame, lasso SVG and loading/empty-state overlays | Mapillary initialization, SDK DOM refs, measurement updates, pointer handlers and cancellation |
| `src/features/imagery/ImageTray.tsx` | Nearby/associated capture tabs, thumbnails, dates and detection outlines | Discovery requests, selection revisions, map highlights and retry ownership |
| `src/components/FullscreenViewer.tsx` | Fullscreen chrome, minimap frame, location and controls | Body portal, ArcGIS view lifecycle, minimap ref and coordinate actions |
| `src/runtime/widgetState.ts` | The existing runtime state contract | State changes and feature lifecycles |
| `src/styles/{viewerSurface,imageTray,fullscreenViewer}.ts` | Extracted style values and responsive CSS | No state, effects, timers or SDK calls |

The components reuse `ImageryLoading`, `FullscreenControls`, `Icons`, `OwnedMessage`
and shared glass/minimap style primitives. `NearbyCarousel` remains a separate
interface: its drawer/close-on-selection behavior does not match the two-tab tray.

Both tray panels stay mounted when switching tabs so independent scroll positions
survive. A pending nearby selection remains highlighted before the viewer confirms
its image. Hover transforms and map highlights retain their original event timing.
Associated-image retries read the current selection when clicked.

React overlays remain siblings of the empty Mapillary container. ArcGIS receives
an empty minimap container, with React controls outside it. Do not render React
children into either SDK-owned container or move lifecycle ownership into these
stateless views. The portal remains in the runtime.

## Validation and limits

`tests/viewerPresentation.test.cjs` compares the extracted components **and actual
widget adapters** against frozen pre-extraction JSX from `609b81c`. It covers DOM
structure, styles, loading/error states, localized dates, pending selection,
detection bounds, refs and action order/arguments. Existing SDK/control components
are stubbed consistently on both sides; this is not live SDK validation.

```sh
node --test tests/viewerPresentation.test.cjs
```

Use the installed client TypeScript via `MAPILLARY_TYPESCRIPT` if it is not resolved
from the widget. The milestone contains the broader regression command.

The available host is Experience Builder 1.20. The isolated bundle check does not
prove full 1.21 packaging or live behavior. In the target 1.21 client, run its normal
start/build workflow and check nearby/associated tray tabs and scrolling,
fullscreen/minimap expand-collapse, touch and RTL layouts, lasso/measurement,
loading cancellation and ordinary imagery playback. No performance improvement is
claimed from this organization change.

This is a cohesive presentation pass, not completion of the entire architecture
migration. The widget still contains extensive request, SDK and feature
orchestration. Continue extracting coherent controllers with explicit ownership
contracts and regression coverage; do not relocate the remaining monolith wholesale
or introduce a generic event bus to make the entry file appear smaller.

## Reversible installer

Save `apply-viewer-presentation-refactor.cjs` beside `manifest.json`, then run:

```sh
node apply-viewer-presentation-refactor.cjs --dry-run
node apply-viewer-presentation-refactor.cjs
```

It accepts the known v13 runtime/types sources (including BOM/CRLF) and the already
refactored output. It preflights every affected file, refuses unknown edits, saves
byte-exact backups and supports `--uninstall`. It appends documentation notes
without replacing existing milestone text. It does not install dependencies.
Restart the client and hard-refresh after application. Keep the backup directory;
uninstall refuses to overwrite edits made after installation.
