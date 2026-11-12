# Publish Places through ArcGIS Portal

Portal is the default source for a new Places configuration. The external HTTPS Places service is also a supported source; select it in the same settings section. Existing apps with an external service URL retain that source until an author changes it.

## What is hosted

Publish two services from the same pinned Overture snapshot:

| Service | Widget usage |
|---|---|
| Hosted vector tile service | Native ArcGIS `VectorTileLayer` renders icons and labels. |
| Hosted feature service, numeric point-layer endpoint | REST queries return bounded records for hover/picking, search, details and field notes. The widget never constructs or adds a `FeatureLayer` for these records. |

The hosting server and ArcGIS Data Store manage storage behind Portal. This workflow does not run the repository's Python service, SQLite server or a separate Places HTTPS endpoint. Your existing Enterprise HTTPS, hosting capacity, publishing permissions and authentication configuration still apply. Portal sign-in alone does not create hosting capabilities.

A `.vtpk` provides display tiles. A `.vtpk` alone cannot provide complete area search or query paging. Uploading GeoJSON does not convert it directly into this two-service setup.

## 1. Prepare the dataset

Start from one pinned Overture Places release and an explicitly chosen area. The exporter described in the [external-service guide, section 5](administrator-guide.md#5-export-all-place-categories) can produce the source snapshot; its current 100,000-record regional export limit still applies. The Portal adapter does not certify national/global publishing or server capacity.

For an existing exported `places-all.geojsonl`, run from the widget root:

```sh
python tools/overture_places/convert_places_geojson.py --input places-all.geojsonl --output places-portal.geojson
```

This creates a standard GeoJSON FeatureCollection. It needs Python and the included tool directory only: no DuckDB, database, network or Portal login. It streams the input, adds the shared `icon_group` classification, preserves null values and retains colocated places with different GERS IDs. The source file is unchanged. Existing output files are never overwritten. Conversion supports up to 100,000 records and rejects incomplete/invalid snapshots.

For a new export, write Portal-ready GeoJSON directly:

```sh
python tools/overture_places/export_all_places.py --release 2026-10-21.0 --bbox=-86.16,39.75,-86.10,39.80 --format geojson --output places-portal.geojson
```

Replace the bbox/release with your chosen area and available pinned release. Direct export uses the existing DuckDB publishing requirements, defaults to 25,000 records and supports `--max-features 100000`. The `.geojson` extension also selects this format when `--format` is omitted. Export additionally writes `places-portal.manifest.json` for release/attribution records; upload the `.geojson` file, not the manifest. Conversion does not manufacture a new manifest: retain your source manifest and attribution separately.

In Portal, open **Content → New item → Your device**, upload `places-portal.geojson` and choose to create a hosted feature layer. Availability and file-size limits depend on your Enterprise version and publishing permissions. Alternatively import this GeoJSON into your GIS publishing workspace. Preserve WGS84 point coordinates and GERS identity. Do not truncate identifiers, turn missing confidence into zero or replace null operating status with permanent closure.

GeoJSON does not declare database field types. Check the published schema below: if every confidence value is null, for example, automatic Portal type inference may need correction through a publishing workspace with an explicit Double field. Do not insert fake place records just to influence inference. These tools prepare query records; they do not generate a `.vtpk` or guarantee which attributes a later tile export retains.

The query layer must have these exact field names and types:

| Field | ArcGIS type | Purpose |
|---|---|---|
| `gers_id` | String | Unique Overture identifier, preserved across both services |
| `place_name` | String | Place name |
| `category` | String | Detailed category |
| `icon_group` | String | Widget category family |
| `confidence` | Double or Single, nullable | Score from 0 to 1; unknown stays null |
| `operating_status` | String, nullable | Including `permanently_closed` where applicable |
| `address` | String, nullable | Formatted address |
| `website` | String, nullable | Website URL |
| `data_release` | String | Pinned Overture release |

The exporter and converter add `icon_group` automatically using `icon_group(category)` from [place_categories.py](../../tools/overture_places/place_categories.py), which supplies the same mapping used by the external service. Allowed family IDs are listed in [tileCategories.ts](../../src/features/places/tileCategories.ts); unmatched categories use `other`.

Use an ordinary numeric object-ID field managed by ArcGIS, plus a spatial index. Index `gers_id`, `icon_group` and confidence/status fields where supported. GERS IDs must remain unique even when multiple places have identical coordinates. Publish only the attributes needed by Places; use appropriate string lengths for names, addresses and URLs.

## 2. Publish the query service

Publish a hosted point feature layer using your organization's normal ArcGIS publishing workflow. Enable Query; editing is not needed. Confirm:

- `geometryType` is `esriGeometryPoint`.
- `advancedQueryCapabilities.supportsPagination` and `supportsOrderBy` are true.
- `maxRecordCount` is at least 200.
- The layer extent is WGS84 (4326) or Web Mercator (3857/102100/102113).
- Standardized SQL supports the connection test's `UPPER`, `REPLACE`, `LIKE ... ESCAPE`, null, equality and numeric predicates.
- All required fields retain the exact names and types above.

Copy the numeric layer REST URL, for example:

```text
https://portal.example.com/server/rest/services/Hosted/OverturePlaces/FeatureServer/0
```

Do not copy the Portal item page or only the FeatureServer root. Keep both services on the same snapshot during updates.

## 3. Build the full attribute-preserving vector tile package

Use the [attribute-restoration and full-build guide](attribute-restoration.md). The small Pro test confirmed that default Pro 3.6 export kept only `_name` and `_symbol`; the full builder now follows the native export with a guarded restoration pass from the exact source GeoJSON.

Run `build_portal_package` in Pro with your complete original `places-portal.geojson`, a new output folder and the published query-layer URL. It uses every source record, retains the original native package, restores and verifies attributes, and writes **`places-portal.vtpk`** plus a restoration report. It preserves geometry and native style resources, refuses ambiguous/missing matches and never publishes an incomplete output. This regional pipeline has been locally verified on the supplied 50-place test package; the first full-data Pro/Portal deployment still needs the acceptance checks in the guide.

Upload the successful full-source `places-portal.vtpk` to Portal and publish it as a hosted vector tile layer. Do not use the 50-place diagnostic package as the counterpart of your full query layer. Pro's export and the offline restoration step do not themselves upload or modify Portal content.

Copy the published service URL:

```text
https://portal.example.com/server/rest/services/Hosted/OverturePlacesTiles/VectorTileServer
```

Use the service URL, not a package download/item/style page. The map remains native vector tiles; a visible bulk FeatureLayer is not added. Tile overview/label behavior follows the package style. Current Pro output uses circle category symbols; this is not a guarantee of the same sprite artwork or overview aggregates as the external service.

## 4. Pairing metadata (generated automatically by the full builder)

The full builder writes the following contract into the package's active root style. A manual style edit is unnecessary for that path. For a separately implemented compatible publishing pipeline, preserve its existing sources/resources/layers and supply equivalent metadata:

```json
{
  "metadata": {
    "mly:places": {
      "version": 1,
      "queryUrl": "https://portal.example.com/server/rest/services/Hosted/OverturePlaces/FeatureServer/0",
      "sourceLayers": ["places"],
      "fields": ["gers_id", "place_name", "icon_group", "confidence", "operating_status"],
      "release": "2026-10-21.0",
      "sourceFeatureCount": 7089
    }
  }
}
```

Replace `places` with the actual `source-layer` name used by the icon/label style layers. List every Places source-layer if more than one exists. This contract is read from the style loaded by the VectorTileServer URL, not an unrelated custom-style item. Both symbol and circle style layers are supported. Keep unrelated datasets out of this tile service.

The offline restoration tool adds and verifies actual attributes before writing this declaration. A declaration alone does not add attributes to tiles. It links the two services and states the expected schema. The widget compares a declared `sourceFeatureCount` with a scalar query-layer count, then inspects one real cached tile to check the sample place ID and attribute values. That is a setup diagnostic, not a full-dataset audit. Verify null scores, closed places and category examples throughout the package before publishing an experience.

Keep the published style filters for ordinary symbol selection. The widget combines category/confidence/closure predicates with them through native `setStyleLayer`; it does not alter the item or publish new tile caches when a viewer changes filters.

## 5. Connect in Experience Builder

1. Open the widget settings and find **Nearby Places · Overture**.
2. Enable **Offer Places layer**.
3. Leave **Source** set to **ArcGIS Portal (recommended)**.
4. Paste the VectorTileServer URL into **Vector tile service URL**.
5. Paste the FeatureServer numeric layer URL into **Place query layer URL**.
6. Click **Test connection**. Saving or typing URLs does not start data queries.
7. Resolve any schema, permission, style-pairing or tile-attribute error. Test connection creates a temporary native layer without adding it to the map, then destroys it.
8. Publish and check the actual viewer experience in each responsive widget instance.

The test checks query metadata, native style loading, the pairing contract, one real sample tile, and a bounded query exercising category, confidence, closure and text predicates. It does not benchmark the entire service or prove that anonymous viewers have permission just because an author does.

For a compiled experience, edit the widget instance's served app configuration under its normal `config` object:

```json
{
  "enablePlaces": true,
  "placesSource": "portal",
  "placesPortalTilesUrl": "https://portal.example.com/server/rest/services/Hosted/OverturePlacesTiles/VectorTileServer",
  "placesPortalQueryUrl": "https://portal.example.com/server/rest/services/Hosted/OverturePlaces/FeatureServer/0"
}
```

Redeploy/invalidate configuration caches as needed. `manifest.json` does not hold per-instance settings. Never include passwords or tokens in these fields.

## 6. Permissions, authentication and HTTPS

Portal-mode metadata, sample tiles and queries use the ArcGIS SDK request/identity mechanism. Native tile rendering uses the SDK as well. Public services can be anonymous; restricted services require the viewer's permitted ArcGIS session. Configure the Experience Builder application's Portal/OAuth integration and trusted service origins through the normal platform workflow. The widget does not introduce another login, save service tokens or bypass layer permissions.

Share both items for the intended audience. A public tile layer paired with a private query layer cannot provide anonymous search/details. Test signed-in and signed-out access from the final app origin, including its actual browser/network/CORS rules. Existing HTTPS certificates are reused; invalid Enterprise certificates still need to be corrected by the administrator.

## 7. What viewers can do

The same Places panel supports categories, quality filters, bounded picking/hover, full-area server-side text filtering, batches of 200, four-row list pages, Auto/manual refresh, details, imagery and field notes. The main map uses native vector tiles, with only small selected/hover/link overlays.

Portal batches use stable object-ID ordering to support deterministic paging. **Closest first sorts the returned batch; it does not promise the globally nearest 200 across a larger area.** The external service can rank by distance before paging. Portal's supported standardized query API does not supply the equivalent universal distance ordering. Text matching also follows Portal SQL/collation rules; it is not a guarantee of identical accent folding to the external service. These differences do not require loading the full dataset in the browser.

Switching source preserves each source's own saved filters and Auto preference. Sources do not silently fail over to one another, and neither starts until the viewer enables Places.

## 8. Validate updates and performance

Prepare and test a matching pair of services for each release. Prefer new versioned services, test them together, then update both widget URLs. Keep the previous pair for rollback; never point old tiles at a new query dataset while updating.

Test at least:

- Signed-in and intended anonymous access, then a real phone.
- Missing confidence, thresholds, permanent closure and each published category.
- More than 200 matching records: search for a place outside the first batch, load the next batch and go back.
- Dense colocated picks, cancellation during map movement and a source switch during loading.
- Details, nearby imagery, local/workspace/Enterprise note preparation and minimize/restore.
- Mapillary picking/playback with Places off/on, following the [performance testing guide](testing.md).

Local contract and lifecycle tests do not replace a real Enterprise test. No live Portal publishing or GPU/mobile performance result is claimed by this adapter's automated fixtures.

## Connection failures after publishing

The builder distinguishes query metadata, query/count requests, vector tile metadata, native style/resources and the sample tile. Request errors show a fixed stage and safe status (for example 499/403/404), without displaying SDK URLs, raw messages or token-bearing request details. Query and native tile requests continue using ArcGIS SDK authentication (`authMode:auto`); this update does not add a token setting or make private services public.

For a private service, opening a bare REST URL may return `499 Token Required`; check the authenticated request in the application's Network Response tab. An HTTP 200 response can contain an ArcGIS error. Do not share request headers or token-bearing URLs.

A successful authenticated response consisting only of service capabilities and cached-level limits, without `tileInfo`, is an incomplete tile definition for this adapter. Confirm publishing/cache import completed. The updated builder reports this before attempting native style loading. If Map Viewer also cannot add the layer, establish the hosted service's health before debugging widget UI. `exportTilesAllowed:false` is not itself a block on normal viewing.

The [native-container acceptance procedure](attribute-restoration.md#native-zip-container-layout-and-hosted-publication-checks) preserves Pro's local/central ZIP header layout and describes a native-package control test. Local ArcGIS rendering and ZIP/payload verification do not replace a hosted Enterprise publication test.

For category icon artwork instead of native colored circles, follow [Category icons](category-icons.md) after attribute restoration.

For real filtered overview counts and close-zoom visibility, prepare the icon package using [Portal clusters and zoom coverage](portal-clusters-and-zoom.md).

For map-based area selection, first downloads, registering an existing snapshot and later release refreshes, use the [area maintenance guide](area-maintenance.md). The helper sequences all package preparation steps; publication remains explicit.

## Optional Pro-session publisher

The [optional publishing script](optional-publishing.md) stages a new private query/vector tile pair using the administrator's Pro Portal session. It returns validated URLs for review without replacing existing services, broadening sharing or editing the experience. The manual publication workflow remains available, and the script requires a real deployment acceptance test.
