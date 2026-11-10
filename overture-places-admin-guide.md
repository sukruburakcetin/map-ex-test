# Overture Places: from source data to a working widget

This guide is for the person preparing and serving Places data. Places is a built-in, optional widget feature. Once configured, viewers click Places and use the map, filters, search, imagery and field-note tools; they do not import data or enter service addresses.

## 1. Understand what you are setting up

```text
Overture release → regional GeoJSONL + manifest → Places service
                                                     ↓ HTTPS
                                  widget: tiles + picking + search
```

There are three roles, which can all be the same person:

| Role | Responsibility |
|---|---|
| Administrator | Select an area, export data, run/host the service, update releases. |
| Builder author or app administrator | Enable the tool, enter the service URL, test and publish the app. |
| Viewer | Turn Places on and explore. |

The service is separate from Experience Builder. An ArcGIS hosted feature layer, a static GeoJSON file or a standalone vector tile URL does not supply this widget's complete Places API. The API combines vector tiles with metadata, spatial picking and area-wide paged text search.

**What works today:** the included Python helper serves a bounded regional dataset locally. It builds an in-memory SQLite spatial index at startup and supports up to 100,000 records. No PostGIS, ArcGIS Pro, Enterprise publisher account or external database is required for this workflow. Exporting uses DuckDB; serving uses Python's standard library.

**Hosting scope:** the same helper can be placed behind an HTTPS reverse proxy for a controlled evaluation. It is a development server, without a packaged production deployment or durable indexed database. Section 9 explains this distinction and the hosting requirements. Completing a local test does not establish capacity for a national dataset or a public audience.

## 2. Gather prerequisites

Use a widget source tree containing:

- `tools/overture_places/export_all_places.py`
- `tools/overture_places/export_places.py` (a shared dependency of the exporter)
- `tools/overture_places/requirements.txt`
- `tools/overture_places/serve_places_local.py`
- `tools/overture_places/place_categories.py`
- `tools/overture_places/places_sprite.py`
- `tools/overture_places/basic_category_icons.csv`

Keep the `tools/overture_places` directory together. The widget must include the Places service URL setting and its vector-service integration.

Install Python 3.10 or later with SQLite support. Python 3.12 is a suitable choice. For export, allow access to Overture's public data and DuckDB's official extension downloads. No Overture API key is required. Keep your existing widget/Mapillary configuration working independently.

For local HTTPS, use the trusted development certificate from your Experience Builder installation. For hosted HTTPS, arrange a domain, a valid certificate and a host reachable by your viewers.

All relative commands below run from the **widget root**, the directory containing `src` and `tools`. Paths and hostnames are examples: replace them with your own.

## 3. Create a Python environment

### Windows PowerShell

```powershell
python --version
python -m venv .venv-places
.\.venv-places\Scripts\python.exe -m pip install -r tools/overture_places/requirements.txt
New-Item -ItemType Directory -Force data/places
```

Use the environment's Python directly; activation is optional. In subsequent commands, replace `python` with `.\.venv-places\Scripts\python.exe`.

### macOS or Linux

```sh
python3 --version
python3 -m venv .venv-places
.venv-places/bin/python -m pip install -r tools/overture_places/requirements.txt
mkdir -p data/places
```

In subsequent commands, replace `python` with `.venv-places/bin/python`.

The requirements file installs DuckDB for data export. The serving process does not import DuckDB or download source data during a viewer request.

## 4. Choose a release and an area

Choose an available release from [Overture's release information](https://docs.overturemaps.org/release/) and record its exact identifier. A pinned release makes it possible to reproduce and review the dataset. The example below uses `2026-10-21.0`; confirm it is available before running it.

Choose a bounding box in WGS84 longitude/latitude, in this order:

```text
west,south,east,north
```

For example, `-86.16,39.75,-86.10,39.80` covers a small Indianapolis area. These are degrees, not projected map coordinates. Begin with a small area; the exporter defaults to a maximum of 25,000 features. Use a normal rectangle that does not cross the antimeridian.

The area defines the **published coverage**, not a per-viewer download. Viewers navigate inside it and request tiles for their current view. Panning outside the exported area cannot retrieve places that were never exported.

## 5. Export all place categories

Run this single-line command on either platform, using your environment's Python:

```sh
python tools/overture_places/export_all_places.py --release 2026-10-21.0 --bbox=-86.16,39.75,-86.10,39.80 --output data/places/places-indianapolis-2026-10-21.geojsonl
```

The `--bbox=` form is intentional: a negative first longitude must not be interpreted as another command option.

Expected files:

```text
data/places/
  places-indianapolis-2026-10-21.geojsonl
  places-indianapolis-2026-10-21.manifest.json
```

GeoJSONL stores one GeoJSON feature per line. It is not a single GeoJSON FeatureCollection. The manifest records the release, bbox, record count and source information. Keep both files together with matching basenames. Do not rename one without the other or edit the manifest count to force loading.

This exporter retains all categories, confidence values and operating statuses in the selected area. It does not deduplicate source records. Unknown categories receive a fallback icon; missing confidence remains eligible when All scores is selected in the widget.

If the area exceeds the export limit, the tool refuses to silently publish an incomplete snapshot. Reduce the area, or explicitly raise the limit within the helper's supported range:

```sh
python tools/overture_places/export_all_places.py --release 2026-10-21.0 --bbox=-86.16,39.75,-86.10,39.80 --max-features 100000 --output data/places/places-indianapolis-larger-2026-10-21.geojsonl
```

Use a new output name for each attempt: the exporter refuses to overwrite existing data or a manifest. The 100,000-record ceiling is a helper limit, not a recommendation to export a whole country. This helper serves one matched file pair; it does not merge multiple regional services automatically.

If you already have a compatible Overture Parquet file, add `--input-parquet path/to/places.parquet`. That file must contain the expected release schema. This option still requires DuckDB's spatial extension. Do not substitute arbitrary GeoJSON or Parquet from another schema.

Inspect a sample in a GIS or text/data inspection tool: names, locations, categories, addresses and closed places. Compare a few records with known locations. Preserve GERS identifiers and release information. Review [Overture attribution requirements](https://docs.overturemaps.org/attribution/) and applicable source notices before distributing the data.

## 6. Start the local HTTPS service

Keep the terminal running:

```sh
python tools/overture_places/serve_places_local.py --input data/places/places-indianapolis-2026-10-21.geojsonl
```

The helper searches parent directories for Experience Builder's `server/cert/server.cert` and `server/cert/server.key`. If it cannot find them, specify both paths:

```sh
python tools/overture_places/serve_places_local.py --input data/places/places-indianapolis-2026-10-21.geojsonl --cert "C:/ExperienceBuilder/server/cert/server.cert" --key "C:/ExperienceBuilder/server/cert/server.key"
```

Use real paths from your installation. Keep private keys on the server; never put them in widget configuration or publish them with an app.

The default listener is `127.0.0.1:3444`. The default allowed application origin is `https://localhost:3001`. If your app uses another origin, pass its exact scheme, host and port:

```sh
python tools/overture_places/serve_places_local.py --input data/places/places-indianapolis-2026-10-21.geojsonl --origin https://localhost:3002
```

An origin has no page path or trailing slash. `https://localhost:3001` and `https://127.0.0.1:3001` are different origins. The helper accepts one configured origin; builder and published apps at different origins need an appropriate hosting/CORS arrangement or separate test runs.

Open this address in the same browser used for the app:

```text
https://localhost:3444/status
```

The browser must trust the certificate and its hostname. Use your normal development certificate trust procedure; do not disable TLS verification. The response should contain `ready: true`, the expected count, bbox and release, and version `1` for the four capability fields. Opening this URL checks reachability and TLS; the widget connection test also checks the app's cross-origin access.

Startup reads the files, validates the pair and builds the in-memory index. Requests do not re-read the full GeoJSONL. Restarting rebuilds the index. Stop with Ctrl+C.

## 7. Connect the widget

### In Experience Builder

1. Open the widget's settings and find **Nearby Places · Overture**.
2. Enable **Offer Places layer**.
3. Set **Places service URL** to `https://localhost:3444`.
4. Click **Test connection**. Confirm the dataset information matches your export.
5. Save and preview the experience.
6. Navigate to the exported area and click Places in the viewer toolbar.

Enter the **base URL**, without `/status`, `/style.json`, `/query` or `/search`. Do not paste a FeatureServer or VectorTileServer URL. Do not include credentials, query parameters or fragments.

The setting offers the tool; it does not turn the layer on automatically when a viewer opens the app. Saving a URL does not fetch the dataset. Test connection intentionally requests metadata; the viewer's Places action starts the layer.

### In an already compiled application

The same widget configuration properties are:

```json
{
  "enablePlaces": true,
  "placesApiUrl": "https://maps.example.com/places"
}
```

Update these properties **inside the correct widget's configuration object**, preserving all other configuration. Locate the widget ID and inspect which application configuration file is actually requested by the deployed app. Export layouts differ, so there is no universal filename or root location to edit.

Back up that configuration, edit the served copy, redeploy it and invalidate its cache as appropriate. Editing the widget source's `config.json` alone does not update an already compiled instance. `manifest.json` is not the place for these values. No service secret belongs in these public properties.

The service can be independent of Esri hosting. The surrounding Experience Builder app's own licensing, access and authentication requirements still apply.

## 8. Verify the complete experience

Check these behaviors with your dataset:

- At overview scales, counts summarize places. Around zoom 15 and above, inspect individual icons; names appear from zoom 17. Symbol collision can hide a label or icon without deleting its source record.
- Click a place, inspect its name/category/address and explicitly request nearby imagery. Image proximity does not guarantee that the object or entrance is visible.
- Open results and search for a known place. Text search runs against matching records in the searched area **before** the service returns a page of up to 200. It is not limited to the already displayed page.
- Try category, confidence and permanently closed filters. Tiles, picking and results should agree. Confidence is not a calibrated probability; missing scores are excluded by a numeric threshold.
- Test list paging and additional batches, selection, Show on map and the configured field-note actions.
- Try manual Search this area and Auto list refresh. These control list requests; map tiles continue following the viewport.
- Minimize the panel and confirm the layer remains visible.
- Test both 2D/3D and the mobile layout you publish. Builder responsive layouts can have separate widget settings: check each configured instance/format.

In browser Network tools, expect `/status`, `/style.json`, sprites, visible `.pbf` tiles, small `/query` picking requests and `/search` when results are requested. The browser should not download the source GeoJSONL. A successful metadata test alone does not prove that tile, sprite and POST routes work.

## 9. Make the service reachable beyond your computer

`localhost` means the **device opening the app**. A phone or another person's browser cannot use your desktop's `https://localhost:3444`. The helper always binds to loopback. `--public-url` changes advertised links; it does not expose a network listener, register a domain or create a certificate.

For a controlled hosted evaluation, an administrator can run the helper and a reverse proxy on the same host:

```text
viewer → https://maps.example.com/places → HTTPS reverse proxy
                                              ↓
                                  https://localhost:3444
                                              ↓
                                  GeoJSONL + manifest
```

Prepare the host with the same tool directory and file pair. Use a dedicated account, Python, a trusted upstream certificate valid for `localhost`, and a public certificate valid for `maps.example.com` on the proxy. Then start the helper with absolute paths, for example:

```sh
python /srv/places/tools/overture_places/serve_places_local.py --input /srv/places/data/places-indianapolis-2026-10-21.geojsonl --cert /srv/places/tls/localhost.crt --key /srv/places/tls/localhost.key --origin https://explore.example.com --public-url https://maps.example.com/places
```

The certificates in this example are prerequisites, not files generated by the command. The helper does not have a plain-HTTP upstream mode.

Example Nginx location inside an existing TLS server block for `maps.example.com`:

```nginx
location /places/ {
    proxy_pass https://localhost:3444;
    proxy_ssl_server_name on;
    proxy_ssl_name localhost;
    proxy_ssl_verify on;
    proxy_ssl_trusted_certificate /etc/nginx/places-upstream-ca.pem;
    proxy_set_header Host $proxy_host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This is a routing example, not a complete Nginx or certificate installation. The trusted CA file must validate the helper's upstream certificate, whose hostname must match `localhost`. Do not turn upstream verification off. The example preserves `/places/...`; the helper supports that prefix. Configure the actual external TLS server and DNS through your hosting administrator.

Route **all** descendants of `/places/`, including GET and POST, OPTIONS preflight, tiles and sprites. Preserve filter query strings and request bodies. Let the helper supply its configured CORS headers; avoid adding conflicting duplicates at the proxy. The current helper advertises `Cache-Control: no-store`; this example does not add a CDN cache.

Validate from another device:

1. Open `https://maps.example.com/places/status` and verify the dataset.
2. Inspect `/places/style.json`: its tile and sprite URLs must use the public domain and prefix, never the host's localhost.
3. Use the published app at the origin allowed by `--origin`; verify tiles, sprites, labels, picking and search in its Network panel.
4. Configure the widget with `https://maps.example.com/places` and run Test connection.

The style currently references ArcGIS-hosted font glyphs. Those requests must also be reachable for count/name text; hosting the Places API does not make every map resource self-contained.

For a sustained production deployment, complete the backend packaging work before treating this helper as a public service: durable spatially indexed storage, repeatable imports, process supervision, health monitoring, resource/concurrency limits, release replacement/rollback and capacity testing. A small HTTPS service with an embedded spatial database can remain the initial architecture; PostGIS is not a prerequisite. Do not increase the helper's record cap or expose it publicly as a substitute for that work.

The current widget uses credential-free Places requests. CORS restricts browser access from other origins; it is not authentication and does not prevent direct downloads by another client. A private authenticated API needs a deliberately implemented authentication integration, not a token pasted into this URL.

## 10. Update the dataset

1. Choose and record the next available Overture release.
2. Export to a **new dated file pair**, using the same intended area and a supported limit.
3. Review the count, coverage, fields, taxonomy/icon fallback counts and required notices. Source schema changes may require exporter changes; do not bypass its validation.
4. Stop the local service and restart it pointing at the new file. Keep the previous pair intact.
5. Check `/status`, run Test connection, then reload the app and repeat the key map/search/selection checks. Existing sessions can contain cached results from the earlier release.
6. If validation fails, stop and restart using the previous pair, then reload clients.

The helper has no hot-import or zero-downtime swap command. Stop/restart briefly interrupts the service. Keep release artifacts and your startup parameters backed up; do not back up only the in-memory index.

## 11. Troubleshooting

| Symptom | Check / action |
|---|---|
| `python` not found | Install Python or use its absolute executable path; Windows may use the `py` launcher. |
| `No module named duckdb` | Install requirements with the same environment Python used to export. |
| DuckDB extension/S3 download fails | Check internet/proxy policy and official extension/data host access. A compatible local Parquet file avoids S3 reads but still needs spatial. |
| Source schema changed | Review the chosen release and exporter together; do not rename fields blindly. |
| Export exceeds limit | Reduce bbox or explicitly raise `--max-features` up to 100000; use a new output name. |
| Manifest missing, empty data or count mismatch | Restore the original matching GeoJSONL/manifest pair, or export again. |
| Cannot find certificate | Supply both `--cert` and `--key`; verify the files and trust chain. |
| Address already in use | Stop the other process, or pass `--port 3445` and update the configured base URL. |
| `/status` opens but Test connection fails | Check exact app origin/CORS, app frame origin, TLS trust and the browser Network error. |
| Test passes but map is empty | Turn Places on, go inside the published bbox, zoom in, clear filters, then inspect style/tile/sprite requests. |
| Icons work but text does not | Check glyph requests, zoom, collisions and the style's font endpoint. |
| Search finds fewer than the source count | Check the searched bbox, filters, search text and page/batch state. Dataset count is not the current area's match count. |
| Another device cannot connect | Replace localhost with a publicly reachable hosted URL; verify DNS, proxy and TLS from that device. |
| Public style contains localhost links | Restart with the correct `--public-url`; verify its prefix and reload the app. |
| HTTP 404/405 or failed preflight behind proxy | Route the whole service prefix, preserve OPTIONS/POST and request bodies, and check CORS headers. |
| Places absent in one responsive layout | Check that layout's widget configuration and service URL; do not assume another instance's settings carry over. |
| New release not visible | Verify the process's input and `/status` release, then reload the app and check configuration/cache delivery. |

For technical contract details, see [Places service configuration](OVERTURE-PLACES-SERVICE.md). For everyday use, see [Nearby places](OVERTURE-PLACES.md).
