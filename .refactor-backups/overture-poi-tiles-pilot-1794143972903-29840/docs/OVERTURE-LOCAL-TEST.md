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

You should see brown circles with white outlines, drawn as native vector tiles. Click close to a circle to display its name or GERS ID. This first style uses circles, not category sprites. No per-POI GraphicsLayer is created. To restore normal map clicks:

```js
poiTest.stop();
```

Stop the server with Ctrl+C. After switching between 2D and 3D, start the harness again. If `window.__mlyPlacesTiles` is undefined, check that the latest installer was applied, the widget build finished, the browser was reloaded, and the console is in the widget's frame.

## What this tests

- The local server indexes records in SQLite R-tree. Browser requests load visible point tiles; the widget does not download or construct a graphics collection for the dataset.
- Tiles are available at zooms 12–16 and can overzoom beyond 16. A tile containing more than 5,000 points is rejected rather than silently dropping records. A 64-entry tile cache is held on the local server.
- All source categories, confidence values and operating statuses remain eligible. Collision/visual overlap does not remove records from the source.
- Click queries return at most 32 nearby candidates. Dense/truncated candidates require zooming in. Picking is based on proximity, not rendered-symbol identity; it can select overlapping or visually obscured points.
- The test server loads a maximum of 100,000 records on the desktop. This is not a nationwide data server. The exporter still defaults to a 25,000-record test area.

The server binds to loopback, so a separate phone cannot access it directly. First verify functionality on your home computer. Mobile/network exposure and production deployment require a separate setup. Passing local tests does not establish Enterprise compatibility or low-end-device performance.
