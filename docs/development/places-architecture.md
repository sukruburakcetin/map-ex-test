# Places architecture and behavior

Places supplies optional context for the existing Mapillary experience. Portal mode pairs a native vector tile service with bounded REST record queries. External mode uses the configured Places API. Both share the panel, coordinator, paging and selection owners. The query layer is never added to the map as a FeatureLayer. No bulk POI Graphics collection is created.

| Responsibility | Owner |
|---|---|
| Source choice and safe URL validation | `placesSource.ts` |
| Portal schema/style pairing, bounded SDK-authenticated REST queries and sample MVT inspection | `PortalPlacesSource.ts`, `portalTileProperties.ts` |
| External URL validation, endpoint derivation, capability handshake | `src/features/places/placesApi.ts` |
| Native layer, filters, transactional replacement, bounded picking | `PlacesVectorLayer.ts` |
| List/hover relationships, overlap chooser, details, imagery callbacks | `PlacesCoordinator.ts` |
| Debounce, foreground gates, list consumption, cache, paging and stale-result guards | `PlacesController.ts` |
| Bounded selection marker, optional camera line and distance | `SelectedPlace.ts` |
| One reusable hover outline and request coalescing | `PlaceHover.ts`, `BoundedPlaceHover.ts` |
| Shared model and API result normalization | `placesModel.ts`, `tilePlace.ts` |
| App/widget/service-scoped filter and Auto preferences | `placePreferences.ts` |
| Result list, minimizable panel, category/quality controls and selected card | `src/components/PlacesPanel.tsx`, `LoadedPlacesList.tsx`, `SelectedPlaceCard.tsx` |
| Imagery ranking/cache, panorama orientation, note preparation | `nearbyPlaceImagery.ts`, `PlaceImageryCache.ts`, `panoramaPlaceCenter.ts`, `PlaceNoteReview.ts` |
| Configured lifecycle and shared map interaction dispatch | `src/runtime/widget.tsx` |

## Required invariants

- The layer starts only after an explicit Places action. Turning it off, closing the widget, changing service or replacing the view invalidates pending startup and disposes owned resources.
- Filter replacement prepares the new source before retiring working tiles. Failed or superseded work cannot replace the committed source. Preserve a selected place if it still qualifies; otherwise clear it with feedback.
- Existing annotation, notes, point-cloud and coverage interaction priorities remain. A POI miss can fall through to coverage without synthetic click replay; a stale click cannot open a popup.
- Native tiles stream independently of result-list requests. Nobody consuming the list means no background area search. Auto refresh waits for meaningful settled movement; manual refresh needs explicit intent.
- Keep one physical list request, cancellation/revision checks and bounded caches (six entries, 512 KiB, two-minute TTL). Closing/minimizing controls must preserve the intended layer and selection state.
- Server batches contain at most 200 records. Local four-row pagination does not cap full-area text search. Paging retains the searched extent and origin.
- Pick candidates are at most 32. Reject incomplete dense candidate sets. Overview aggregates zoom rather than inventing a place identity. Colocated distinct GERS IDs remain distinct.
- Hover, selected marker and camera links are small reusable overlays. They are separate from bulk native rendering and should not force another dataset request.
- Imagery and note preparation remain explicit. Keep configured destinations, attachment confirmation, current-image ownership, focus restoration, localization, keyboard use and mobile layout.

## Data preparation and service

`places_area.py` saves/prepares regional releases and comparisons. `export_all_places.py` exports a pinned area as Portal GeoJSON or external GeoJSONL with its manifest. `export_common.py` owns shared validation. `places_store.py` validates that pair and atomically publishes a versioned SQLite database containing the R-tree, category index and dataset metadata. `places_service.py` imports/inspects databases and starts HTTPS from one config file. Serving opens the database read-only; restart performs metadata/schema checks, not source import or reindexing. `serve_places_local.py` supplies the shared protocol/query implementation and a disposable in-memory test path. Icon families are assigned during import; shared sprites are generated once at service startup. Release notices remain with the tools/data.

Database filenames are immutable release artifacts: import never overwrites an existing file, including a publication race. An invalid import leaves the current served database intact. Update/rollback stops the service, selects another dated database in config and restarts, followed by client reload. The API remains the same [service contract](places-service-contract.md). Process-supervisor deployment and measured capacity remain separate operational checks; no PostGIS dependency is introduced.

See [testing](places-testing.md) before changing these boundaries.

## Portal source

See the [Portal publishing contract](../places/portal-administrator-guide.md). New empty configurations choose Portal; configurations without a source selector but with a valid external API URL retain external mode. No credentials are persisted in configuration. SDK requests handle Portal authentication. Saving settings does not activate Places. Native style filter changes and source replacements are transactional, with stale preparation cancelled. A tile sample must match the corresponding query record before the source can activate. Only one sample is inspected per source instance, not on every map movement or filter change.

Query results are capped at 32 candidates for picking/hover and 200 for area searches, with explicit transfer-limit handling. Portal uses stable object-ID order across batches; the common list performs its selected sort within that batch. Global nearest-first ranking and accent folding are not claimed to be identical to the external service. Overview tile aggregates depend on the published Portal style.
