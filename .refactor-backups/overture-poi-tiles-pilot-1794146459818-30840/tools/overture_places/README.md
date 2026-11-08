# Prepare and publish the Overture Places pilot

This runs outside Experience Builder. Nothing is uploaded/published automatically, and no credentials are requested or stored by this exporter.

1. Create a publishing environment:

   ```sh
   python -m venv .venv-places
   # Activate it using your platform's normal venv activation command.
   python -m pip install -r tools/overture_places/requirements.txt
   ```

2. Export a small AOI using a **pinned** Overture release. Example Indianapolis pilot:

   ```sh
   python tools/overture_places/export_places.py --release 2026-10-21.0 --bbox=-86.16,39.75,-86.10,39.80 --output places-indianapolis.geojson
   ```

   Example Istanbul pilot:

   ```sh
   python tools/overture_places/export_places.py --release 2026-10-21.0 --bbox=28.95,41.00,29.03,41.06 --output places-istanbul.geojson
   ```

   These AOIs are examples, not coverage-quality claims. `--release latest` resolves STAC's latest release and records the actual version. The tool uses cloud GeoParquet, spatial/bbox predicates, confidence >=0.95, a small category allowlist and a hard export limit. It refuses to silently truncate. Category mappings are explicit in `export_places.py`; review them when changing release/schema. The exporter does not collect all business categories. Confidence describes existence, not accurate entrance location. Exact duplicate IDs/name-location pairs are removed; nearby duplicates may remain.

   DuckDB needs its official `spatial` extension and, for S3, `httpfs`. Allow their official download host in the publishing environment. An already downloaded current-schema file can be supplied with `--input-parquet path/to/places.parquet`; this still needs the spatial extension. The exporter is separate from the widget bundle.

3. Inspect the GeoJSON in ArcGIS Pro/QGIS. Compare a sample of points with local authoritative data. Retain the manifest and applicable release/source license notices from https://docs.overturemaps.org/attribution/ . Places licensing differs from ODbL buildings/transportation. Preserve the original GERS identifier and release; Enterprise ObjectIDs are not stable place identities.

4. In your Enterprise portal's Content page, add the GeoJSON and publish a **hosted feature layer** (your deployment must support GeoJSON publishing). If that is unavailable, use ArcGIS Pro: JSON To Features -> check WGS84 point geometry -> share as a hosted feature layer. Do not enable editing or sync for this read-only context layer. Record all fields below; do not rename them. Configure the service's `maxRecordCount` to **200** where supported (the widget also requests at most 200), and retain server-side spatial querying, record limits and standard JSON queries. An administrator can add a `place_group`/`confidence` attribute index for larger pilots. Ensure geometry has a spatial index.

5. Configure sharing with the intended app audience. Private layers can use the existing ArcGIS sign-in session; test CORS/authentication for the Experience Builder origin. Do not put tokens into the URL. Add Overture release and required notices to the item description/attribution; a map attribution link is also shown by the widget.

6. Copy the **layer** URL ending in `/FeatureServer/0` (or its actual numeric layer index). In widget settings, enable **Offer Places layer**, enter that HTTPS URL, save/publish your app, and let a user turn on Nearby places. This does not make Places load on startup.

Required query fields:

| Field | Type / maximum exported text length |
|---|---|
| `gers_id` | text / 160 |
| `place_name` | text / 120 |
| `category` | text / 80 |
| `place_group` | text: health, education, parks, landmarks, services |
| `confidence` | double / 0..1 |
| `address` | text / 180 |
| `website` | text / 500 |
| `data_release` | text / 40 |

Test one sample `/query` using the portal REST interface: geometry envelope, inSR=4326, outSR=4326, spatialRel=esriSpatialRelIntersects, resultRecordCount=200, returnGeometry=true, outFields=the fields above. Verify fields, bounded results and WGS84 point coordinates. The widget uses SDK authentication, not a separate token parameter.

## Refreshing data

Prepare a new dated export and inspect it outside the application. Back up the hosted item and its sharing/settings before replacing its data through your normal Enterprise publishing process. Preserve field names and schema; GERS IDs link place identity across releases. Existing sessions retain at most six two-minute cache entries; reload after replacing a release. Test each updated release's category taxonomy and geographic coverage before production use.

## Unfiltered vector tile experiment (Enterprise 12.1)

The separate `export_all_places.py` and `prepare_all_places_arcpy.py` tools retain all POI categories, confidence values and operating statuses in a bounded test area. They do not change the curated pilot exporter above. See [the Enterprise 12.1 workflow](../../docs/OVERTURE-ENTERPRISE-12.1.md) for export, ArcGIS Pro import, tile/details publishing and acceptance checks.

For home testing without ArcGIS Pro, use `serve_places_local.py` with the already generated GeoJSONL and manifest. See [local tile testing](../../docs/OVERTURE-LOCAL-TEST.md). It uses standard-library Python and your existing Experience Builder HTTPS certificate.

The local style supports 28 shared sprite families. Edit `place_categories.py` to review visual classification; see `OVERTURE-EXPLORER-NOTICE.txt` for upstream mapping attribution. `/status` reports `icon_counts` so fallback coverage can be inspected without excluding POIs.

`basic_category_icons.csv` maps all 298 published basic categories from release `2026-10-21.0` to the shared atlas. `/status` includes the top 20 `unmapped_categories` to distinguish unknown values from missing source categories. Review the CSV against future releases; it is not a live taxonomy subscription.

The local harness supports an optional confidence control in the widget: All records, preset thresholds or a custom minimum. Tile and click queries use the same server filter before limits. All records remains the default and includes missing confidence. See the local testing guide; the confidence installer requires a widget rebuild/reload.

The local status installer adds Hide permanently closed, independent of confidence. It hides only explicit `permanently_closed` records from tiles and picking. Unknown and temporary statuses remain eligible. Rebuild/reload the widget and restart the local server after applying it.
