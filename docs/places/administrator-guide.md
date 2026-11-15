# Overture Places: from source data to a working widget

This guide covers **Source → External Places service**. For the default Portal source, use the [Portal administrator guide](portal-administrator-guide.md). Both are supported configurations.


This guide is for the person preparing and serving Places data. Places is a built-in, optional widget feature. Once configured, viewers click Places and use the map, filters, search, imagery and field-note tools; they do not import data or enter service addresses.

## 1. Understand what you are setting up

```text
Overture release → GeoJSONL + manifest → import → SQLite → Places service
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

**Service workflow:** export a regional snapshot, import it once into a versioned SQLite database, then start the HTTPS service from one JSON configuration file. The service opens the database read-only. Restarting does not read the original GeoJSONL or rebuild its spatial index. No PostGIS, ArcGIS Pro, Enterprise publisher account or external database server is required. DuckDB is needed only to export source data; import and serving use Python's standard library.

**Capacity and hosting:** this service package retains the tested regional limit of 100,000 records. It supplies persistent storage, atomic import, inspection, HTTPS serving and health checks. Public hosting still needs your domain/certificates, process supervision, access/rate policy and capacity testing. Section 9 covers deployment; a successful regional test is not a national-scale capacity claim.

## 2. Gather prerequisites

Use a widget source tree containing:

- `tools/overture_places/export_all_places.py`
- `tools/overture_places/export_common.py` (shared release and geographic validation)
- `tools/overture_places/requirements.txt`
- `tools/overture_places/places_service.py` (import, inspect and HTTPS startup)
- `tools/overture_places/places_store.py` (persistent storage and validation)
- `tools/overture_places/serve_places_local.py` (shared protocol/query implementation and optional direct local test)
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

Use a new output name for each attempt: the exporter refuses to overwrite existing data or a manifest. The 100,000-record ceiling is the current regional import/export limit, not a recommendation to export a whole country. Each database represents one exported snapshot; the service does not merge separate areas automatically.

If you already have a compatible Overture Parquet file, add `--input-parquet path/to/places.parquet`. That file must contain the expected release schema. This option still requires DuckDB's spatial extension. Do not substitute arbitrary GeoJSON or Parquet from another schema.

Inspect a sample in a GIS or text/data inspection tool: names, locations, categories, addresses and closed places. Compare a few records with known locations. Preserve GERS identifiers and release information. Review [Overture attribution requirements](https://docs.overturemaps.org/attribution/) and applicable source notices before distributing the data.

## 6. Import once and start the HTTPS service

Import the exported file and its matching manifest into a **new** database:

```sh
python tools/overture_places/places_service.py import --input data/places/places-indianapolis-2026-10-21.geojsonl --database data/places-2026-10-21.sqlite
```

The importer validates records, release, bbox and count, then builds the spatial/category indexes. It publishes the SQLite file only after the complete import and integrity check succeed. Existing database files are never overwritten, including if two imports race. Use a new dated filename for each dataset. Atomic publication needs a filesystem supporting hard links (standard local NTFS/Linux filesystems); do not assume a cloud-sync/network mount has those semantics.

To try the included example instead, use `--input examples/places/places-indianapolis.geojsonl` with the same database output path. It contains 7,089 records.

Inspect the database without starting a server:

```sh
python tools/overture_places/places_service.py inspect --database data/places-2026-10-21.sqlite
```

Check the count, release, bbox, schema version, source SHA-256/import timestamp and `storage: sqlite`. Keep source exports/manifests for provenance and future imports; serving/restarting no longer depends on them.

Copy `tools/overture_places/service.example.json` to `places-service.json` in the widget root. PowerShell:

```powershell
Copy-Item tools/overture_places/service.example.json places-service.json
```

macOS/Linux:

```sh
cp tools/overture_places/service.example.json places-service.json
```

Edit that copy as UTF-8 JSON (use forward slashes in Windows paths, as below):

```json
{
  "database": "data/places-2026-10-21.sqlite",
  "public_url": "https://localhost:3444",
  "host": "127.0.0.1",
  "port": 3444,
  "origins": ["https://localhost:3001"],
  "tls": {
    "cert": "C:/ExperienceBuilder/server/cert/server.cert",
    "key": "C:/ExperienceBuilder/server/cert/server.key"
  }
}
```

Replace certificate paths with your actual trusted Experience Builder development certificate/key. On Linux/macOS use your actual local paths. Relative database/certificate paths resolve from the **configuration file's directory**, independently of the shell's working directory. Keep the config and private keys on the service host; they do not go into public widget configuration. Local service config and SQLite output are ignored by Git.

`origins` contains exact HTTPS application origins, with no page path: scheme, host and port must match. You may list both builder and published-app origins. These CORS settings are not authentication. `host` is the local IPv4 bind address; loopback is the default.

Start and keep the terminal running:

```sh
python tools/overture_places/places_service.py serve --config places-service.json
```

Open these in the same browser as your app:

```text
https://localhost:3444/health
https://localhost:3444/status
```

The browser must trust the certificate and its hostname; use your normal development trust procedure, without disabling TLS checks. Health should report `ready: true`, `storage: sqlite` and the release. Status adds the count, extent and widget capabilities. Opening a URL checks connectivity/TLS; the widget's Test connection also checks browser CORS access.

Stop with Ctrl+C. Restart with the same `serve --config` command: no import is needed unless the source data changes. Serving uses read-only SQLite, bounded workers/socket waits and the existing bounded tile/pick/list protocol. It does not write a journal or update the dataset from viewer actions.

### Optional direct local test

For a quick disposable test, the direct helper can still read a GeoJSONL/manifest pair into memory:

```sh
python tools/overture_places/serve_places_local.py --input examples/places/places-indianapolis.geojsonl
```

That helper finds Experience Builder's certificate in parent folders, or accepts `--cert` and `--key`; `--origin` sets its single app origin. It rebuilds an in-memory index per restart. Use the imported-database service above for the repeatable operational workflow.

## 7. Connect the widget

### In Experience Builder

1. Open the widget's settings and find **Nearby Places · Overture**.
2. Enable **Offer Places layer**.
3. Select **Source → External Places service**, then set **Places service URL** to `https://localhost:3444`.
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
  "placesSource": "external",
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

## 9. Host beyond your computer

`localhost` means the device opening the app. A phone cannot use your desktop's `https://localhost:3444`. Host the service at an HTTPS address reachable by the viewer.

A simple deployment uses the service plus an HTTPS reverse proxy on the same host:

```text
viewer → https://maps.example.com/places → reverse proxy → https://localhost:3444
                                                                ↓
                                                        read-only SQLite
```

Copy the tool directory and your completed SQLite database to the host. Keep the previous database for rollback. Configure the host's service file with:

- `database`: its local SQLite path.
- `public_url`: `https://maps.example.com/places` (the externally visible service base).
- `origins`: the actual published app and, if needed, builder origin.
- `host`: `127.0.0.1` behind a same-host proxy; `port`: the local upstream port.
- `tls`: a trusted upstream certificate/key valid for `localhost`.

Start with `python /srv/places/tools/overture_places/places_service.py serve --config /srv/places/places-service.json`, substituting your installation paths. `public_url` controls advertised links; it does not register DNS, create certificates or change the bind interface. To serve directly on a network interface instead, configure an appropriate IPv4 `host`, trusted domain certificate and firewall; validate the resulting HTTPS endpoint from another device.

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

This is a routing example, not a complete proxy/certificate installation. The CA file must validate the service's upstream certificate and hostname; do not disable verification. Preserve the entire prefix, GET/POST/OPTIONS, request bodies and filter query strings. Let the service set CORS headers; avoid conflicting proxy duplicates. Filtered/multi-origin responses use `Vary: Origin`; no public CDN cache policy is introduced here.

Validate from a second device: `/places/health`, `/places/status`, public style/sprite/tile links, and actual picking/search in the app. Configure the widget with `https://maps.example.com/places`. The current style also uses ArcGIS-hosted font glyphs; hosting the API alone does not make all map resources self-contained.

For sustained hosting, run the command under your platform's process supervisor, retain database/config backups, monitor health/logs, and configure proxy resource/rate limits for your audience. The service currently limits simultaneous workers to 16 and socket waits to 15 seconds; SQLite reads are serialized. Measure realistic regional workloads before increasing scope. This package does not provision a host, promise zero downtime or establish national-scale throughput. No separate database server is needed for this phase.

The widget uses credential-free Places requests. CORS is not authentication: private authenticated service access needs an intentional client/server integration, not a secret token in a public URL.

## 10. Update and roll back a release

1. Export a new dated source pair and review coverage, counts, schema and notices.
2. Import into a **different dated SQLite file**, while the current service keeps reading its existing file. Import failure leaves that served release intact.
3. Inspect the new database with `inspect`; retain both databases and their provenance. If you change category-mapping rules, import a new database too: its icon families are assigned during import, not startup.
4. Stop the service, change only `database` in the service config to the new file, then restart with the same command. The public URL and widget settings can stay the same.
5. Check health/status and reload the app to clear old in-session tiles/list caches. Verify filtering, search, selection and imagery.
6. To roll back, stop, point `database` back to the previous file and restart; reload clients again.

There is no automatic hot swap or destructive overwrite command. Stop/restart causes a brief interruption. Do not modify a database in place while it is being served. Back up the SQLite files, service config, source manifests and required notices; private keys require your normal protected backup process.

## 11. Troubleshooting

| Symptom | Check / action |
|---|---|
| `python` not found | Install Python or use its absolute executable path; Windows may use the `py` launcher. |
| SQLite reports no R-tree module | Use a Python build with SQLite R-tree support; import requires that standard SQLite extension. |
| `No module named duckdb` | Install requirements with the same environment Python used to export. |
| DuckDB extension/S3 download fails | Check internet/proxy policy and official extension/data host access. A compatible local Parquet file avoids S3 reads but still needs spatial. |
| Source schema changed | Review the chosen release and exporter together; do not rename fields blindly. |
| Export exceeds limit | Reduce bbox or explicitly raise `--max-features` up to 100000; use a new output name. |
| Import validation fails | Check the matched source pair, count, pinned release, Point geometry, unique GERS IDs and coverage bbox; no incomplete database is published. |
| Database already exists | Choose a new dated output path; imports never overwrite an existing release. |
| Database/schema unsupported | Inspect with the matching service tools; import a new database instead of changing version metadata manually. |
| Hard-link publication fails | Use a supported local filesystem for the database import; cloud-sync/network filesystem behavior must be verified. |
| TLS certificate/key not found | Correct `tls.cert` and `tls.key` in the service config; relative paths are resolved from that config file. |
| Address already in use | Stop the other process, or set `port` to 3445 and update `public_url` and the widget URL as appropriate. |
| `/status` opens but Test connection fails | Check exact app origin/CORS, app frame origin, TLS trust and the browser Network error. |
| Test passes but map is empty | Turn Places on, go inside the published bbox, zoom in, clear filters, then inspect style/tile/sprite requests. |
| Icons work but text does not | Check glyph requests, zoom, collisions and the style's font endpoint. |
| Search finds fewer than the source count | Check the searched bbox, filters, search text and page/batch state. Dataset count is not the current area's match count. |
| Another device cannot connect | Replace localhost with a publicly reachable hosted URL; verify DNS, proxy and TLS from that device. |
| Public style contains localhost links | Restart with the correct `public_url`; verify its prefix and reload the app. |
| HTTP 404/405 or failed preflight behind proxy | Route the whole service prefix, preserve OPTIONS/POST and request bodies, and check CORS headers. |
| Places absent in one responsive layout | Check that layout's widget configuration and service URL; do not assume another instance's settings carry over. |
| New release not visible | Verify the configured database and `/status` release, then reload the app and check configuration/cache delivery. |

For technical contract details, see [Places service configuration](service-contract.md). For everyday use, see [Nearby places](README.md).

## Saved areas and release refreshes

Use the [area maintenance guide](area-maintenance.md) to save a map rectangle, download its public Overture data, compare releases and prepare a versioned database. Keep your existing service configuration and certificate; switch its database only after reviewing/testing the new snapshot.
