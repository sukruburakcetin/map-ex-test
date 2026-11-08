# POI feature parity contract

The existing GeoJSON → hosted FeatureServer POI workflow is the functional baseline. Vector tiles change dataset delivery and bulk rendering. They must preserve the existing POI experience before becoming the default. The current local tile harness is a feasibility prototype and does not yet satisfy this contract.

## Required baseline

| Existing behavior | Tile implementation requirement | Current local harness |
| --- | --- | --- |
| Normal Mapillary point/route navigation and hover | Use the widget's shared interaction dispatcher and preserve tool priority | Wired through the shared widget dispatcher; automated hit/miss and stale-click checks pass |
| Places enable/disable and panel open/close | Use existing controls and lifecycle | Wired to existing Places controls; console starts the local source |
| Search this area and automatic update preference | Reuse bounded PlacesController scheduling and preferences | Wired through existing bounded controller; automated manual/automatic checks pass |
| Category filters, statuses, retry and published-area navigation | Preserve the existing panel behavior | Wired to server predicates, existing statuses/retry and source extent |
| Loaded-place list and sorting/distance context | Reuse PlacesPanel and LoadedPlacesList with bounded queried results | Wired to the existing panel/list and selection flow; max 200 records |
| Map/list hover synchronization and overlap choices | Preserve identity, grouping and chooser behavior | Wired: bounded map hover, list outline/identity sync and existing overlap chooser; proximity limitations remain |
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

`ArcGISPlaces.openExternal` accepts one normalized tile selection and reuses the existing popup, SelectedPlace, selected state/card, camera link, imagery actions and configured note/contribution actions. Its external-selection mode never constructs the service FeatureLayer or a bulk POI GraphicsLayer. The external source adapter now enables PlacesController for bounded area queries without creating bulk graphics. Missing confidence remains null in the selected model rather than being converted to zero. Stopping the harness restores the prior Places enabled/panel state; the original renderer remains the default outside the harness.

The local adapter now supplies bounded panel results, area queries and automatic updates using the existing controller. The normal Places control can stop the harness. Map/list hover and native overlap choices are now wired by the hover/overlap milestone below. Review these gaps before using the harness as a replacement. Proximity selection and bounded-candidate limitations also remain.

## Bounded panel adapter

`apply-overture-poi-panel.cjs` adds local `/search` requests capped at 200 records plus one server-side lookahead. Point picking retains its separate 32-candidate limit. The existing PlacesController owns area intent, automatic movement updates, busy gates, cancellation, six-entry cache and estimated 512 KiB cache budget. An optional normalization hook preserves low/null confidence for this unfiltered source while leaving the hosted GeoJSON/FeatureServer path's normalization unchanged.

The tile source starts with the optional results panel closed. Opening it activates bounded list queries. Search this area, automatic update, category facets, statuses, retry, Go to data area, list sorting and selection reuse the existing UI. Source confidence/status/category changes disable and clear the old controller cache before enabling the new source. Tile, point-query and list-query URLs share the same predicates. Server-side category filtering precedes the cap, avoiding a falsely empty category caused by taking the first 200 across all groups.

All source categories remain available under All. Tile mode now offers the 28 sprite families; the hosted GeoJSON mode retains its five original broad groups. These are family filters, not a 298-item taxonomy picker. Source records outside those facets remain under All. Counts describe loaded records only. Tiles can represent more records than the list cap. No per-result Graphic or Point is constructed for list display. List queries retain a minimum zoom of 15. Tile rendering and interaction follow their own source style (zoom 12 for the local pilot), independently of the list controller.

Acceptance still requires live 2D/3D tests and all configured contribution actions. Hover synchronization and overlap choices are wired by the subsequent milestone; rendered-symbol identity remains a limitation.

## Hover and overlap interaction milestone

`apply-overture-poi-hover-overlap.cjs` adds one reusable hover-outline graphic, not a per-record overlay. List hover immediately highlights the corresponding loaded place. Map hover synchronizes the row when its GERS ID exists in the current bounded list; a place outside that list still gets its map tooltip/outline. One hover record is retained, independently of the selected place.

Map lookups wait 80 ms after pointer movement and keep one physical request plus one latest pending intent. Rapid moves coalesce; pointer leave, movement, filter/source changes and clicks cancel obsolete work. Hover uses its own cancellation slot and cannot cancel the authoritative click lookup. Coverage previews remain authoritative, so an already resolved Mapillary image hover is not delayed by a POI query. Selected-place overlays participate in the existing SDK hit test.

A complete, bounded query returns candidates inside the 12-pixel selection footprint. If more than one candidate overlaps that footprint, click opens the existing localized four-row-per-page chooser. It can select candidates outside the loaded 200-row list and retains at most 32 candidate records. Truncated/dense query results are rejected rather than arbitrarily selecting an incomplete candidate set. No native cluster-count bubbles or server aggregation are added.

The maximum overlay is one reusable hover graphic plus the existing selected marker/link/distance graphics. No animation loop or per-POI DOM/image download is introduced. The exact rendered-symbol identity caveat remains: proximity queries can include collision-hidden symbols. Validate real 2D/3D terrain and pitch, tool priority, keyboard/touch behavior and low-memory performance before declaring full production parity.

## Rendering independent of result-list queries

`apply-overture-poi-rendering.cjs` removes the remaining list-to-renderer coupling. The list controller no longer hides the native tile layer, and the local source starts with its optional list panel closed. Native rendering, point picking, overlap choices, selection, camera links and imagery remain available without an area-result query.

The optional `consumerActive` callback pauses only native-source list requests while the panel is closed. It cancels pending/in-flight list work without clearing the selected place or loaded cache and without calling renderer visibility hooks. Reopening uses the existing manual/automatic preference; manual mode still requires explicit area intent. The hosted FeatureServer/Graphics implementation does not use this callback, so its default behavior is preserved.

Bounding boxes have three intentional remaining uses: the offline pilot's extraction boundary, capped interactive list searches, and tiny click/hover candidate queries. Native bulk rendering uses the SDK's viewport tile requests. The extraction boundary is a data-availability limit, not the future production service's required per-user workflow. A broader indexed/tiled backend can serve users without manual re-export as they pan.

The panel caption uses existing localized Loaded places text and reports a capped list as 200+, not the number of map symbols. The list's zoom prompt also identifies loaded results. No new locale catalog is introduced. Map point visibility follows the tile style; the list's zoom/bbox limits cannot hide native icons or prevent their interactions.

Acceptance check: with the panel closed, pan to new tiles and confirm icons keep rendering with zero `/search` requests. Hover/click candidate requests remain intentional. Open the panel to load at most 200 records; close it during a pending request and verify cancellation without clearing selection. Change filters while it is closed and verify the tiles update without loading the list. Validate in both 2D and 3D.

## Native category selector

`apply-overture-poi-category-panel.cjs` replaces the legacy five-group controls **in tile mode** with All plus all 28 icon families. Categories are sorted by the current locale, with Other / uncategorized last. The original GeoJSON/hosted-feature workflow retains its original controls and preference IDs.

Native category state uses `placesTileCategory` and the `family` request parameter. It does not overwrite the legacy Places group preference. Changing family removes a stale legacy group predicate, retains confidence/status predicates, invalidates list caches and selection, and updates tile, list, click and hover URLs together. Filtering happens before record limits. No synthetic zero counts are shown for families absent from the current 200-record page.

List rows, chooser rows and the selected badge now use the same family identity as native tiles, via a shared bounded SVG cache (28 families × normal/selected states). There are no per-POI image requests. Native bulk rendering remains the sprite atlas. Missing/unknown data still uses Other.

The new category labels are in the existing lazy-loaded language catalogs, with UK English inheriting the base labels. The community translation CSV includes all new keys. The local server advertises category-filter support; an old running process is rejected with a restart message rather than silently ignoring a category. Rebuild/reload and restart Python after applying the installer. No export regeneration is needed.

The two obsolete foundation-test fixtures were updated to provide the real auto-update helper and exercise the current PlaceNoteReview path. This is a test correction, not a change to note-saving behavior.
