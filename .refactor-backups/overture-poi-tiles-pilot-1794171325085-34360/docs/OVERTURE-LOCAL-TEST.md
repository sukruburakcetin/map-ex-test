# Test POI vector tiles at home without ArcGIS Pro

This local harness reads the existing `places-all.geojsonl` and manifest. It serves actual MVT point tiles and a bounded click-query endpoint using Python's standard library. It requires no ArcGIS Pro, Enterprise access, new Python packages or external hosting. It is an experiment for a small area, not an Enterprise replacement or national-scale backend.

## Start the server

Install the local-test installer, rebuild/reload Experience Builder, then open a terminal in your widget folder. Keep both exported files together and run:

```sh
python tools/overture_places/serve_places_local.py --input places-all.geojsonl
```

The script searches parent folders for Experience Builder's existing `server/cert/server.cert` and `server/cert/server.key`. If your widget is outside the Experience Builder installation, specify the paths:

```sh
python tools/overture_places/serve_places_local.py --input places-all.geojsonl --cert "C:/ExperienceBuilder/server/cert/server.cert" --key "C:/ExperienceBuilder/server/cert/server.key"
```

Replace `C:/ExperienceBuilder` with your installation directory. Certificate files stay on your computer. The server binds only to `127.0.0.1:3444`. No source files or data are uploaded. If your app origin differs from `https://localhost:3001`, pass its exact origin with `--origin`, for example `--origin https://localhost:3002`.

Open **https://localhost:3444/status** in the same browser. Resolve any local development-certificate warning as you normally do for Experience Builder. The response should show `ready: true`, the record count and release. Leave the terminal running.

## Display tiles in the widget

Open your widget's map, turn off the existing Nearby Places overlay, and navigate into the bounding box used for the export. For the Indianapolis example, use approximately longitude **-86.13**, latitude **39.775**, at zoom **15–17**.

Open the browser developer console in the frame containing the widget and run:

```js
const controls = window.__mlyPlacesTiles;
Object.keys(controls); // available widget IDs
const poiTest = controls[Object.keys(controls)[0]];
await poiTest.startLocal();
```

You should see category icons with white outlines, drawn from a shared PNG sprite atlas through native vector tiles. Click close to an icon to display its details and an explicit nearby-imagery search button. The test style has 28 icon families: airports, bars, education, convenience stores, fuel, golf, groceries, healthcare, lodging, parks, parking, public transport, restaurants, shops, stadiums, cafés, bakeries, banks, government, worship, entertainment, beauty, fitness, automotive, offices, landmarks, services and a neutral fallback. These are visual families, not dataset filters; unknown or missing categories use the fallback. No per-POI GraphicsLayer is created. To restore normal map clicks:

```js
poiTest.stop();
```

Stop the server with Ctrl+C. After switching between 2D and 3D, start the harness again. If `window.__mlyPlacesTiles` is undefined, check that the latest installer was applied, the widget build finished, the browser was reloaded, and the console is in the widget's frame.

## What this tests

- The local server indexes records in SQLite R-tree. Browser requests load visible point tiles; the widget does not download or construct a graphics collection for the dataset.
- The server provides 1× and 2× sprite atlases without additional Python packages. Basic categories are classified once during server startup using an explicit lookup plus conservative word rules. Existing exports do not contain the full taxonomy hierarchy, so this remains a visual approximation rather than exhaustive taxonomy classification.
- Tiles are available at zooms 12–16 and can overzoom beyond 16. A tile containing more than 5,000 points is rejected rather than silently dropping records. A 64-entry tile cache is held on the local server.
- All source categories, confidence values and operating statuses remain eligible. Collision/visual overlap does not remove records from the source.
- Click queries return at most 32 nearby candidates. Dense/truncated candidates require zooming in. Picking is based on proximity, not rendered-symbol identity; it can select overlapping or visually obscured points.
- The test server loads a maximum of 100,000 records on the desktop. This is not a nationwide data server. The exporter still defaults to a 25,000-record test area.

The server binds to loopback, so a separate phone cannot access it directly. First verify functionality on your home computer. Mobile/network exposure and production deployment require a separate setup. Passing local tests does not establish Enterprise compatibility or low-end-device performance.

## Updating the circle test to category icons

Apply `apply-overture-poi-tiles-icons.cjs` from the widget root with `--dry-run`, then without flags. It supports the previous local-test installation and includes backups/uninstall. Stop the Python server with Ctrl+C and run the same server command again. In the widget console, call `poiTest.stop()` and `await poiTest.startLocal()` to fetch the new style and sprites. Existing exports do not need regeneration. The local-only icon update does not require rebuilding the widget if the local-test controls already work.

## Expanded category mapping

Apply `apply-overture-poi-categories.cjs` with `--dry-run`, then without flags, to upgrade an existing icon test. Restart the Python server and restart `poiTest` as above. No new export or widget rebuild is needed when the local controls already work.

The lookup lives in `tools/overture_places/place_categories.py`. Its initial groups adapt Overture Explorer's mappings; additions cover common categories. Exact matches take priority over word rules, so a coffee shop gets a cup and a barber shop gets scissors. No confidence threshold is applied. Unknown categories retain the neutral icon.

Visit `/status` to see `icon_counts`, the number of source records assigned to each family before collision handling. Counts sum to the source record count, not the number of visible symbols. Generic Overture categories such as `professional_services` share an office icon because more specific information is absent in the current flattened export.

Explorer mapping attribution and its MIT notice are included in `tools/overture_places/OVERTURE-EXPLORER-NOTICE.txt`. Sprite artwork is independently drawn; no Explorer SVG artwork is copied. The 1× and 2× atlases are generated once at server startup. Additional icon families do not add per-POI image downloads or browser graphics objects. Device performance still needs measurement.

## Complete current basic-category coverage

`basic_category_icons.csv` explicitly assigns all **298 basic categories in release 2026-10-21.0** to the shared icon families. The earlier small lookup recognized only 108 of those labels. The mapping uses the published hierarchy, so broad categories such as `casual_eatery`, `health_care` and `services_and_business` receive appropriate family icons. All 298 mapping targets are validated against the sprite atlas. Missing categories and unknown future labels can still use the neutral fallback.

Source: https://labs.overturemaps.org/web-tools/taxonomy-explorer/taxonomy/2026-10-21.0/basic_categories.csv

To upgrade, apply `apply-overture-poi-category-coverage.cjs`, restart the Python server and restart `poiTest`. Existing exports remain usable. `/status` now also lists the top 20 `unmapped_categories`, including a separate `(missing category)` entry. Those counts identify what the actual local export lacks; the screenshot alone cannot distinguish missing source categories from missing mapping entries. Classification runs once at startup, with no added browser work or new sprite downloads.

Contributors can review `basic_category`, `icon_group` and the official `taxonomy` path in the CSV. Edit the assigned group, keeping it within the sprite families, and restart the server. This is a pinned release lookup; future Overture taxonomy changes must be reviewed rather than assumed covered.

## Confidence control

Apply `apply-overture-poi-confidence.cjs` (`--dry-run` first), **rebuild/reload the widget**, restart the Python server, then start `poiTest` again. This update changes widget code as well as the local server; restarting Python alone will not display the new control. No new export is required.

A small **POI confidence** control appears at the top right of the map in local test mode. Choose **All records**, a preset minimum of 0.5 / 0.75 / 0.9 / 0.95, or enter a custom value from 0 to 1 and press **Apply**. Blank custom input restores all records. All records remains the default; no preferred threshold is silently selected.

The same `min_confidence` parameter is applied to tile requests and click queries. Filtering happens in the server's spatial query **before** record limits, so hidden low-score points cannot be selected. A threshold includes scores equal to its value and excludes missing confidence; a threshold of zero still excludes missing confidence. All records includes missing scores. Switching filters cancels outstanding click work, closes the test popup, replaces the tile layer and removes the old test control. Filtered variants share the same bounded 64-entry server tile cache.

The popup now shows the actual category, confidence and operating status. Confidence is not a calibrated probability. A confidence threshold does not guarantee validity. Operating status is controlled separately: a permanently closed place can have a score above the chosen threshold. Category icons remain independent of confidence.

This control is for the opt-in local harness. Production builder settings, localization, persistent preferences, Enterprise filtering is not connected by this update. `/status` icon and unmatched-category counts describe the full loaded source dataset, even when a tile style is filtered.

## Permanently closed places

Apply `apply-overture-poi-status.cjs` with `--dry-run` first, then without flags. Rebuild/reload the widget and restart the local Python server. Reuse the existing export; start `poiTest` as usual.

The confidence control now also has **Hide permanently closed**. It starts unchecked, preserving the default complete-data view. Check it to exclude exactly `operating_status = permanently_closed` from both tiles and click queries. Unknown/null statuses and temporary closures remain eligible. This does not mean all retained places are confirmed open.

The checkbox and confidence threshold operate independently. Choosing All records in the confidence dropdown removes the score filter; uncheck Hide permanently closed as well to restore the full source dataset. Neither control removes source data or changes category icons. Filter parameters are included in tile cache keys, and both predicates apply before result limits. Control selections remain local to the current test session and reset when starting a new test.

## Open nearby Mapillary imagery from a tiled POI

Apply `apply-overture-poi-imagery.cjs` with `--dry-run` first, then without flags. **Rebuild/reload the widget**, keep the local tile server running, and start `poiTest` again. No source export or server configuration change is required.

Click an icon to open its name, category, confidence, operating status, address and safe website link when available. **Find imagery within 75 m** makes one explicit, bounded search using the widget's existing Mapillary API access and ranking logic. Nothing is searched automatically when clicking a place. If the first area has no candidate, **Search within 250 m** offers a wider search only after another click.

A successful search shows a suggested view plus at most two alternatives, with direction, approximate distance and capture date. Click a suggestion to open it in the existing viewer. Imagery is near the place; visibility and entrance location are not guaranteed. Existing panorama orientation logic is reused.

Closing/replacing the popup, changing a quality filter, stopping the prototype or switching views cancels pending popup search work. Stale results are discarded. This uses one popup, no POI graphics collection or background imagery downloads. The existing widget must already have working Mapillary access. Full imagery opening still needs validation in your live 2D/3D app; automated tests cover popup state, cancellation and wiring, not a live Mapillary session.

## Shared POI selection and normal coverage navigation

Apply `apply-overture-poi-shared-selection.cjs` with `--dry-run` first, then without flags. **Rebuild/reload the widget**, keep the local server running, then start `poiTest` again. No new export is required.

The tile test now uses the widget's shared click handler. Clicking a POI opens the existing foundation popup and selected-place card. The card's Back to place, camera link/distance, nearby imagery and configured note/contribution actions use the existing implementation. Only the selected marker and optional camera link use a small graphics overlay; bulk POIs remain vector tiles. Clicking coverage points again uses normal imagery navigation. A validated coverage hover preview keeps its existing fast path, so hover a visible image dot to navigate it when POIs overlap nearby.

The test no longer uses `TilesPlacePopup`; it remains in the repository only as an earlier isolated harness component. The shared foundation popup retains its original layout rather than the test popup's raw metadata table. Selected data retains confidence and operating status, and the quality controls remain available.

Click priority is inherited from the widget: active tools and notes, point-cloud interaction, existing selected POI, native POI candidate, then coverage. The candidate lookup is bounded and aborted on another click/movement/quality change. The local request timeout is 1.5 seconds; a failed or missed lookup continues existing click handling. Exact rendered-symbol identity is still not guaranteed by proximity picking.

The panel and hover/overlap adapters below now supply bounded results, area search and hover/chooser behavior; exact rendered-symbol identity and live parity validation remain open. See the feature-parity contract before replacing the default workflow. The shared selection milestone makes the existing card actions available; it does not certify every configured contribution destination without a live app test.

## Existing Places panel with a tiled source

Apply `apply-overture-poi-panel.cjs` with `--dry-run` first, then without flags. **Rebuild/reload the widget and restart the Python server**, then start `poiTest` as usual. No export regeneration is needed. Restarting the server is required because this adapter adds the `/search` endpoint and group filtering.

The normal Places panel is available for the local tile source; the source starts with the panel closed. Open it using the existing Places panel control. Use **Search this area**, the existing automatic-update preference, category facets, result sorting, retry, Go to data area and list selection. List selection opens the same details, selected card, imagery and configured note actions as map selection. Manual mode retains the prior loaded list while panning until an explicit search; automatic mode uses the existing significant-movement rules and settles before querying.

The interactive list loads at most **200** records. A limit warning is shown for a capped result. This does not limit the records represented by tiles or imply a complete total for the area. The source keeps the same six-entry, estimated 512 KiB list-cache budget. The list requires zoom 15, while native POIs follow the tile style independently (zoom 12 in the local pilot).

Category-family, confidence and operating-status controls apply consistently to tiles, clicks and list queries. All includes every source category. The native selector now offers 28 icon families; it is not a 298-item taxonomy picker. Explicit filter changes clear old list caches and selection before refreshing. Missing-confidence records are preserved when All records is selected.

The subsequent hover/overlap adapter connects list/map feedback and the existing chooser. This installer does not create a graphics layer for the list and does not change the original hosted FeatureServer mode outside the test. Run a live test in both 2D and 3D before considering it a default replacement.

## Hover feedback and overlapping places

Apply `apply-overture-poi-hover-overlap.cjs` with `--dry-run` first, then without flags. **Rebuild/reload the widget**, restart the local server and start `poiTest` again. Reuse the existing exports.

Hover a result row to draw one light outline around its location. Hover a POI on the map to show its name/category and synchronize the matching loaded row. Map hover waits briefly for the pointer to settle; continuous motion does not create a request queue. POIs outside the loaded list can still be previewed, but there is no row to highlight until they are loaded. A valid Mapillary coverage hover takes priority and remains responsive.

When multiple complete query candidates fall inside the clicked footprint, the original paginated **Nearby places** chooser opens. Select a row to open the foundation popup/card and its imagery/note actions. No automatic imagery search is made. Ambiguous candidates can be outside the 200-row result list. The selected badge can reopen its chooser, including after zooming below normal POI visibility. More than 32 candidates or a truncated response requires zooming in instead of choosing arbitrarily.

The hover ring is a **single reusable graphic**, separate from the existing selected-place overlay. Bulk places stay native tiles. Candidates are based on proximity and may include collision-hidden symbols; this is not a claim of exact rendered-symbol picking. These changes do not add tile clusters or count bubbles. Test the live behavior in 2D and 3D, including terrain/pitch, keyboard focus and touch, before considering the default workflow replaceable.

## Native rendering without unnecessary area queries

Apply `apply-overture-poi-rendering.cjs` with `--dry-run` first, then without flags. **Rebuild/reload the widget**, keep the local server running and start `poiTest` again. No new export is needed; the backend protocol is unchanged from the panel adapter.

The test now starts with the Places results panel **closed**. Icons stream through native tiles as you pan. No `/search` area query runs just to draw icons. Click/hover, selected-place actions and quality/category filtering remain independent of result-list consumption. One small metadata request still loads the dataset extent/release for source information and Go to data area.

Open the Places results panel when you want the existing capped list, sorting and Search this area. Automatic updates apply to this list while the panel is open; they do not control tile streaming. Closing the panel cancels list work and retains the selected place and bounded cache. Reopening respects the existing manual/automatic preference. List captions explicitly say Loaded places and do not describe the map's total POIs.

The offline bbox still determines what is present in this local exported snapshot. It is not required as a per-user production rendering step. A nationwide source would need a wider published tile/details backend, not a nationwide browser graphics collection.

For a quick check, close the panel and pan while watching browser Network: tile requests may appear, but `/search` should not. Point picking still uses small `/query` requests. Then open the panel and verify that a bounded `/search` can populate the list. The list's zoom-15 requirement does not hide icons that the tile style allows at zoom 12.

## Current category controls

Apply `apply-overture-poi-category-panel.cjs` with `--dry-run` first, then without flags. **Rebuild/reload the widget and restart the Python server**, then start `poiTest`. Keep the same GeoJSONL and manifest.

Open the Places panel. In tile mode, Category now contains **All plus 28 families**, including restaurants, cafés, shopping, accommodation, business/offices and Other / uncategorized. Labels are localized and sorted in the active language. The old five-category controls remain only for the original hosted-feature mode. No counts are attached to the family options because the loaded page is not an area-wide total.

Choose a family and verify that map icons, loaded results and click/hover candidates all follow it. Confidence and permanently-closed settings remain independent and are retained when switching family. Clear the category with All. The hidden-results-panel rule is preserved: categories can change tile rendering without causing a background `/search` when no list is consumed.

List and chooser thumbnails and the selected badge use the family icon as well. They reuse a bounded SVG cache; bulk points stay native tiles. This covers the 28 visual families, not every basic or detailed taxonomy label individually.

The server must be restarted: an older process does not implement the new `family` parameter. The widget checks support and reports a restart error rather than presenting an unfiltered map under a selected category.

The family selector is enabled only for an adapter that supports these filters. A custom native tile/FeatureServer prototype without that capability keeps it disabled rather than pretending to filter. The standard hosted-feature mode retains its existing category controls.

### Search the category menu

Open the category picker and type to filter its localized labels or category IDs. Typing searches the menu locally; choosing a different category applies the filter to tiles, picking, and the optional results list. The menu supports arrow keys, Enter, and Escape, with a thin, low-opacity themed scrollbar.

Search this area and auto-update control only the bounded results list. Map tiles load automatically with navigation regardless of these controls. Existing exports and the running local server need no changes for this menu update.
