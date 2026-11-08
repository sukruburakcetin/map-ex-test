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

You should see category icons with white outlines, drawn from a shared PNG sprite atlas through native vector tiles. Click close to a circle to display its name or GERS ID. The test style has 28 icon families: airports, bars, education, convenience stores, fuel, golf, groceries, healthcare, lodging, parks, parking, public transport, restaurants, shops, stadiums, cafés, bakeries, banks, government, worship, entertainment, beauty, fitness, automotive, offices, landmarks, services and a neutral fallback. These are visual families, not dataset filters; unknown or missing categories use the fallback. No per-POI GraphicsLayer is created. To restore normal map clicks:

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
