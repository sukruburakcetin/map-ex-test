# POI feature parity contract

The existing GeoJSON → hosted FeatureServer POI workflow is the functional baseline. Vector tiles change dataset delivery and bulk rendering. They must preserve the existing POI experience before becoming the default. The current local tile harness is a feasibility prototype and does not yet satisfy this contract.

## Required baseline

| Existing behavior | Tile implementation requirement | Current local harness |
| --- | --- | --- |
| Normal Mapillary point/route navigation and hover | Use the widget's shared interaction dispatcher and preserve tool priority | Wired through the shared widget dispatcher; automated hit/miss and stale-click checks pass |
| Places enable/disable and panel open/close | Use existing controls and lifecycle | Gap: console controls are separate |
| Search this area and automatic update preference | Reuse bounded PlacesController scheduling and preferences | Gap |
| Category filters, statuses, retry and published-area navigation | Preserve the existing panel behavior | Gap |
| Loaded-place list and sorting/distance context | Reuse PlacesPanel and LoadedPlacesList with bounded queried results | Gap |
| Map/list hover synchronization and overlap choices | Preserve identity, grouping and chooser behavior | Gap: proximity-only single selection |
| Selected-place card, clear, back-to-place and persistent selection | Reuse selected-place state and SelectedPlaceCard | Wired to the foundation selected-place owner and card; live validation required |
| Camera-to-place link and distance | Reuse SelectedPlace's bounded selection overlay | Wired to the existing bounded overlay; automated four-graphics maximum check passes |
| Place details and safe website links | Use the existing detail workflow and locale support | Wired to the existing popup/presentation/focus owner |
| Nearby imagery search, alternatives and viewer opening | Reuse existing search/ranking/viewer logic | Reuses the existing foundation popup/search/viewer; live app verification required |
| Existing note/contribution actions and imagery attachment preparation | Keep PlaceNoteActions, PlaceNoteReview and existing configured destinations | Selected tile records feed existing state and configured note actions; live verification required |
| Localization, focus/keyboard behavior and responsive UI | Preserve existing components and presentation bindings | Partial: prototype controls are development UI |
| Busy/foreground-work gates, cancellation, cache limits and view rebinding | Apply existing lifecycle protections to the new source | Partial: harness has its own cancellation, not all existing foreground gates |

## Integration architecture

Keep the shared application feature owners:

- PlacesController: query scheduling, search-area state, bounded result/cache handling.
- ArcGISPlaces: place details, overlap selection, hover/list relationships and selected-place ownership.
- PlacesPanel / LoadedPlacesList / SelectedPlaceCard: the existing user interface.
- SelectedPlace: one selected marker and optional camera link/distance overlay.
- The widget's click/hover dispatcher: existing notes/tools/POIs/coverage priority.
- Existing nearby imagery ranking, opening, note preparation and locale machinery.

Introduce a tile-capable data/rendering adapter rather than maintain a second complete POI product. It supplies bounded viewport/list queries, bounded pointer candidates, GERS-based detail lookup, dataset release and extent, filter state, and the tile layer. Bulk display remains native vector tiles, with no per-record Graphics collection. Reuse only the small existing selection/link overlay.

Do not assume native ArcGIS tile-symbol picking is available. Proximity picking must retain explicit limitations until rendered-symbol identity is validated or an equivalent bounded picking mechanism is implemented. It must not silently pick hidden/overlapping records or misrepresent a partial candidate set as complete.

## Interaction migration first

Remove the harness's unconditional click ownership as part of shared-dispatch integration. Notes, drawing/annotation and other tools keep their current priority. A resolved POI hit opens the existing POI workflow; a miss proceeds through normal coverage navigation. An asynchronous lookup must not cause both actions to fire. Preserve click-generation and view-revision checks, including fast clicks and view changes. Do not replay synthetic map clicks as a fallthrough mechanism.

## Additions retained

- All records remains available independently of presentation limits.
- Optional confidence threshold, with explicit missing-score behavior.
- Optional hiding of known permanently closed records, independent of confidence.
- Expanded category sprites and unknown-category fallback.
- Matching predicates for visible tiles, selection queries and result lists.
- Clear distinction between best-facing and nearest available imagery. Existing bounded API results cannot establish the globally nearest image; do not silently change the current ranking semantics.

Server aggregation and complete-result export/search are separate from the bounded interactive list. A list capped at 200 records is not the full set represented by the tiles, and local overlap counts must not be presented as complete-area totals.

## Acceptance gate

Before changing the default renderer, verify the full matrix against the existing workflow in 2D and 3D. Include notes/contribution destinations supported by the configured app, imagery attachments, map/list hover, overlap choices, selected camera links, locale switching, keyboard focus, cancel/retry/off/on behavior, rapid interaction and view switching. Compare the same area on a low-memory device with the old and new display paths. Keep the existing renderer available until parity and performance checks pass.

No default renderer switch or feature-parity claim is made by this document. The local server proves a delivery approach; Enterprise publication, coordinated release updates and complete integration remain separate implementation work.

## Shared selection milestone

`apply-overture-poi-shared-selection.cjs` removes the local harness's independent click listener and separate popup from the active widget path. The widget's current dispatcher resolves a native tile candidate after existing higher-priority tools and the foundation selected marker, and before coverage fallback. A validated coverage hover preview keeps its normal fast path. A tile miss proceeds to existing coverage/sequence handling without synthetic click replay. Click generations invalidate stale lookups; quality changes clear the selection and invalidate pending map clicks.

`ArcGISPlaces.openExternal` accepts one normalized tile selection and reuses the existing popup, SelectedPlace, selected state/card, camera link, imagery actions and configured note/contribution actions. Its external-selection mode never constructs the service FeatureLayer or a bulk POI GraphicsLayer. The disabled PlacesController does not perform area queries. Missing confidence remains null in the selected model rather than being converted to zero. Stopping the harness restores the prior Places enabled/panel state; the original renderer remains the default outside the harness.

This milestone deliberately does **not** claim results-panel, area-query, automatic-update or hover/overlap parity. Those still require a bounded tile-source adapter. The normal Places control can stop the harness; the results panel is not yet populated by native tiles. Review these gaps before using the harness as a replacement. Proximity selection and bounded-candidate limitations also remain.
