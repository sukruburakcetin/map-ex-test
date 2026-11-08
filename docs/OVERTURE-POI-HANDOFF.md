# Overture POI vector-tile migration — handoff

Updated: 9 November 2026 (Europe/Istanbul).

## Task and user intent

Continue improving the Mapillary Explorer widget for ArcGIS Experience Builder 1.20. We are migrating the Overture Maps Places/POI workflow from client-loaded GeoJSON/Esri Graphics to native vector tiles, retaining the useful features of the earlier workflow without copying patterns that only existed to work around Graphics rendering limits.

The user wants all matching POIs visible without forcing category or confidence filtering, including on modest devices. Avoid creating an Esri Graphic for every tile POI. Keep category icons clickable, the existing place details/imagery workflow, category and quality filters, and an optional nearby-results list. The user prefers concrete implementation and downloadable, reversible Node installers for their Windows development machine.

## Workspace and delivery

- Current cloud repository: `/workspace/map-ex-test-latest`.
- User's local widget folder: `C:\Users\BURAK\Desktop\arcgis-experience-builder-1.20\client\your-extensions\widgets\mapillary-explorer`.
- Numerous earlier migration edits are uncommitted in the cloud working tree. Preserve them; do not reset or assume HEAD contains the tile workflow.
- Latest installer for this handoff: `apply-overture-poi-nearest-results.cjs`.
- Download files are in `/workspace/shared/downloads`. Use absolute Markdown links to these files, not relative links.
- The installer is cumulative, supports earlier migration installers, creates backups, has `--dry-run` and `--uninstall`, and refuses conflicting edits. Run it from the widget folder, then rebuild/reload Experience Builder.

```sh
node apply-overture-poi-nearest-results.cjs --dry-run
node apply-overture-poi-nearest-results.cjs
```

**Restart the local Python POI server after this update.** The nearest-results change includes server code. Existing exports need no regeneration.

## Current data and rendering architecture

1. `tools/overture_places/export_all_places.py` produces `places-all.geojsonl` and `places-all.manifest.json` from Overture Places. These are already generated on the user's machine.
2. Local testing does not require ArcGIS Pro. `tools/overture_places/serve_places_local.py` reads the export into an in-memory SQLite database with an R-tree spatial index and serves HTTPS vector tiles, sprites, metadata and bounded details/list endpoints.
3. `src/features/places/PlacesTilesPrototype.ts` attaches an ArcGIS VectorTileLayer; POIs are rendered by native tiles, not per-feature Graphics.
4. `/query` returns at most 32 click/hover candidates. If truncated, selection asks the user to zoom rather than claiming a nearest result.
5. `/search` returns at most 200 optional list results plus a truncation flag. This cap is independent of tile rendering. Opening the list does not determine which map symbols exist.
6. A small reusable hover/selection overlay is retained; it does not recreate the dataset as Graphics.
7. Original GeoJSON/FeatureServer behavior remains available. The tile path is still opt-in prototype/test infrastructure, not a finished nationwide production tile service.

Start the local server using the existing certificate setup documented in `docs/OVERTURE-LOCAL-TEST.md`:

```sh
python tools/overture_places/serve_places_local.py --input places-all.geojsonl
```

In the browser console:

```js
const poiTest = Object.values(window.__mlyPlacesTiles)[0];
await poiTest.startLocal();
// Restore the regular setup:
poiTest.stop();
```

## Features already retained or added

- Static sprite atlas with 28 icon families, mapped from 298 Overture basic category labels; safe generic fallback for missing categories.
- The family picker has All + 28 localized options, local text search, keyboard navigation and a thin low-opacity themed scrollbar.
- Missing categories/confidence remain valid records. A real low-confidence example was “Adam Lambert Vfanpage”, category null, confidence about 0.305, suspicious address; a fallback icon is appropriate. Do not invent categories from place names.
- Category, confidence threshold and hide-permanently-closed predicates apply to tiles, click/hover candidates and list searches together.
- The integrated Places panel contains category selection, confidence controls and closed-status filtering.
- Confidence UI: All scores is the default and includes missing scores. Uncheck it to enable a 0–1 slider (0.01 steps) and editable numeric field. Dragging drafts locally; release/keyboard completion/blur applies once. All scores and Hide permanently closed have themed green checkboxes and keyboard focus styling. Numeric entry accepts arbitrary valid precision.
- The separate temporary quality toolbar is suppressed in the integrated widget; retained for standalone test-harness use.
- Auto-update and Search this area appear inside the loaded-results section. They control only that list; tiles load automatically as the map moves. Keep this distinction explicit.
- Closed list panel pauses area queries without clearing selected places/cached results. Native tile POIs remain independent.
- Existing place summary, notes, camera-distance/linking, suggested imagery, selected card and overlap chooser are reused. Overlap candidates are paginated (4/page).
- Coverage and notes/tools keep click/hover priority through the shared dispatcher. Do not regress Mapillary exploration when adding POI picking.

## Latest change: nearest results before the cap

Previously, the server selected up to 200 matching records without distance ordering, then the client sorted only those records. Thus a closer POI could be omitted while the list said Closest first.

Now the widget sends the same distance origin used by the list: selected image location when available, otherwise map center. `/search` validates the WGS84 origin and ranks all matching records in the requested extent by a great-circle distance key in SQLite **before LIMIT 201**. It returns the nearest 200 and uses the extra record to detect truncation. Equal distances are resolved by stable GERS ID. Direct `/search` clients without an origin default to the extent center. Category/quality predicates run before ranking. Tile queries and click candidate limits are unchanged.

These are the nearest matching places **inside the queried visible extent at search time**, not the globally nearest places. List name sorting still sorts only the loaded subset. The 200 cap protects the list/browser; the server evaluates distance over matching extent records without sending all of them to JavaScript.

Main files changed for this step:

- `tools/overture_places/serve_places_local.py`: distance function, optional validated search origin, ordering before limit.
- `src/features/places/PlacesTilesPrototype.ts`: forwards origin in `/search` body.
- `src/runtime/widget.tsx`: supplies `placesListOrigin()`.
- `tests/overturePlacesLocal.test.py`: >200 records, opposite origins, filtering before rank, invalid origins.
- `tests/placesTilesPrototype.test.cjs`: origin forwarding.

## Localization

The widget and builder are localized with lazy-loaded catalogs. Base application English is US; UK English is also offered. Other languages: Arabic, Turkish, Spanish, French, German, Brazilian Portuguese, Italian, Japanese, Korean, Simplified Chinese and Traditional Chinese (Taiwan). Builder language choice overrides the internal widget choice. Preserve this behavior.

New user-visible labels must use the catalogs, and update `docs/localization/translations.csv`, the contributor lookup table. Do not put unreleased implementation history into contributor-facing documentation. Catalog checks currently cover 1,110 runtime keys and 150 builder keys with 12 translation catalogs (including UK).

## Validation and useful commands

TypeScript is available at `/workspace/experience-builder-1.20/client/node_modules/typescript`; the repo requires this override in the cloud environment:

```sh
MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript node --test tests/overturePlaces.test.cjs tests/placeNoteReview.test.cjs tests/placesTilesPrototype.test.cjs tests/tilePlaceIntegration.test.cjs tests/placesPanelRendering.test.cjs tests/boundedPlaceHover.test.cjs tests/tileCategoryPicker.test.cjs tests/placeQualityControls.test.cjs
python3 tests/overturePlacesLocal.test.py
MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript node cjs/check-localization-catalogs.cjs
MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript node cjs/translation-table.cjs check docs/localization/translations.csv
git diff --check
```

This step's expected totals: 130 JavaScript tests and 14 Python tests. Installer tests cover clean installation, idempotence, conflict rejection, old-version upgrades and byte-exact rollback. UI tests use JSX/hook harnesses; they do not replace an actual Experience Builder browser test.

Installer build/test helpers in this cloud environment: `/tmp/build-overture-nearest-results-installer.py` and `/tmp/test-overture-nearest-results-installer.py`. Prior installer snapshots `/tmp/overture-v1-installer.cjs` through `/tmp/overture-v17-installer.cjs` support upgrade testing. These temporary helpers will not necessarily exist in another account: the delivered installer and source files are the durable artifacts.

## Known limitations and next checks

- The local harness is capped at 100,000 imported POIs, and refuses a tile above 5,000 points. It is not an entire-USA production backend. Plan prebuilt/hosted vector tiles and a bounded indexed details/search service for production and monthly releases.
- Native local tiles start at zoom 12; list area queries require zoom 15. A list zoom message must not imply all map tile rendering is disabled.
- Proximity picking does not prove that a collision-hidden symbol was drawn; 3D terrain/picking parity still needs real browser validation.
- Existing “Loaded places: 200+ / Counts are for loaded places” wording is still awkward in tile mode. A clearer localized message should say the list contains the nearest 200 matching places in this area, and invite zooming in. Do not call it the total map count.
- A new search uses the current origin; an already loaded list may become stale when navigation/image selection changes until refreshed. Verify the desired refresh behavior in the real widget before adding extra requests.
- Manually verify slider mouse/touch/keyboard behavior, themed checkboxes, map/list filter parity, selected-image origin vs map-center origin, and normal Mapillary surfing in Experience Builder.

## What to tell the next assistant

“Read this handoff and inspect the current working tree before editing. We are preserving the original Overture POI feature workflow while replacing mass Graphics rendering with native vector tiles. The latest task made the optional list fetch the nearest 200 matching places before limiting. Continue with clear list wording and real-widget verification; preserve lazy localization, shared coverage interaction, bounded queries and reversible installer delivery.”
