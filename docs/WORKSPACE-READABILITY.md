# Consistent note markers and workspace readability

Apply `apply-workspace-readability.cjs` from the widget root after the contribution update, then rebuild and reload. This is a client-only change: it does not require another SQL migration or change existing category assignments, risks, author rights, or stored coordinates. The contribution backend still requires migration 003 from the earlier update.

## Marker contract

`buildNoteSymbol` in `features/field-notes/mapGraphic.ts` supplies screen-facing PointSymbol3D icon layers for 3D and the existing SimpleMarker diamond for 2D. Local, Workspace and Enterprise notes use the same factory. Category/source color remains independent of ownership. Icons add no vertical offset, callout or volumetric geometry. The existing point/layer determines location. Selection remains ArcGIS's native layer-view highlight.

Workspace/ordinary selection layers anchor notes on the ground. If a selected local note has a genuinely measured altitude, the focus layer switches to absolute-height placement and preserves that point's Z instead of discarding it. Changing who is signed in does not alter rendering orientation.

## Search contract

`useWorkspaceContributions.ts` waits 700 ms after the last input change. Ordinary typing pauses no longer trigger the old 250 ms request cycle. Composition events suspend submission until IME input finishes. Enter submits immediately outside composition; Clear search resets immediately. Aborts and read generations still prevent retired responses from taking ownership.

Existing results and map markers remain visible while the same workspace searches or refreshes. A waiting/loading message distinguishes pending input from applied results; errors, disconnection and workspace/session changes cannot retain another workspace's results. Pages and server-wide totals keep their existing meaning. Backend query semantics are unchanged.

## Panel contract and contributor entry points

Connection/workspace settings collapse after workspace selection and remain available in a labelled disclosure. The workspace action bar exposes Read contributions, Publish a note (writers), Edit categories (owners), and Refresh notes. Shortcuts open the correct section, scroll it into view and move keyboard focus there.

- `WorkspaceContributionCard.tsx`: category badge, separate workflow badge, author/date, readable description, resolution, legacy assessment and distinct view/edit/remove actions. The panel still owns mutations/permissions.
- `WorkspaceCategoryBadge.tsx`: labelled colored badges shared by cards and category editing; information never depends on color alone.
- `WorkspaceCategoryEditor.tsx`: explicit editing context and Add a new category. Existing names are read-only while editing their color; saving a retired category's color preserves retirement.
- `WorkspaceContributionTools.tsx`: Find contributions heading, count chips, composition/Enter-aware search and pending feedback.
- `styles/communityWorkspace.ts`: separate control sections, contribution cards, badges and primary/secondary/destructive actions. Buttons fit their labels instead of stretching across the full desktop sheet; rows wrap at narrow widths.

No request starts on preload, no note is automatically published, and no new service/provider dependency is introduced.

## Verification and rollback

Tests cover 3D icon descriptors, source/category colors, unchanged coordinates and measured-Z selection; real React/Chromium tests exercise normal typing at 110 ms between characters, a pause shorter than the debounce, a full idle search, IME input, Enter, stable map results, navigation/focus and narrow controls. SQL/transport behavior is unchanged. Actual ArcGIS SceneView appearance still needs live Experience Builder verification; browser tests use service fixtures and recording map objects.

`uninstall-workspace-readability.cjs` restores exact pre-install source, including prior styling/search/marker behavior. It does not touch database data or undo preceding installers.
