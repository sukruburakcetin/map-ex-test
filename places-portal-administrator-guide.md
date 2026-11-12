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

Start from one pinned Overture Places release and an explicitly chosen area. The exporter described in the [external-service guide, section 3](administrator-guide.md#3-export-a-regional-snapshot) can produce the source snapshot; its current 100,000-record regional export limit still applies. The Portal adapter does not certify national/global publishing or server capacity.

Import the point dataset into your publishing workspace. A GeoJSONL file is one feature per line; convert it to a GeoJSON FeatureCollection or your GIS import format before using tools that expect ordinary GeoJSON. Preserve WGS84 point coordinates and GERS identity. Do not truncate identifiers, turn missing confidence into zero or replace null operating status with permanent closure.

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

The source exporter does not add `icon_group`: derive it using `icon_group(category)` from [place_categories.py](../../tools/overture_places/place_categories.py), which supplies the same mapping used by the external service. Allowed family IDs are listed in [tileCategories.ts](../../src/features/places/tileCategories.ts); unmatched categories use `other`.

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

## 3. Publish a compatible vector tile service

Create a dedicated Places vector tile package using your tile publishing pipeline, then upload and publish it as a hosted vector tile layer. Use the standard 512-pixel Web Mercator vector tile scheme and include individual POIs at the operational zoom levels. Publish the required sprites/fonts and use readable icon/label collision rules. Overview display and label scales are properties of the published style; Portal does not automatically reproduce the external service's overview aggregates.

**Attribute retention is a publishing requirement.** Tiles must retain these actual properties on individual place features:

```text
 gers_id, place_name, icon_group, confidence, operating_status
```

Null properties may be omitted. Confidence must remain numeric. Property values must match the query service. These properties support consistent map filtering; details such as address and website come from bounded queries instead.

Standard ArcGIS Pro vector tile exports can omit attributes or encode renderer classes as internal properties. Merely having the fields in the input feature class does not prove that they survive in the tile. Inspect the generated MVT before accepting the package. If your export omits/renames these properties, adapt that publishing pipeline before connecting it. This repository does not yet provide an automatic GeoJSON-to-`.vtpk` converter, and cannot certify a generic ArcGIS Pro export as compatible.

Use the published service URL:

```text
https://portal.example.com/server/rest/services/Hosted/OverturePlacesTiles/VectorTileServer
```

Do not paste a `.vtpk` download URL, item page or a style JSON URL in the builder field.

## 4. Declare the pairing in the published style

In the vector tile item's active root style resource, preserve its existing sources, sprites, glyphs and style layers. Add the following top-level metadata through the authenticated item resource/style publishing workflow supported by your Portal version:

```json
{
  "metadata": {
    "mly:places": {
      "version": 1,
      "queryUrl": "https://portal.example.com/server/rest/services/Hosted/OverturePlaces/FeatureServer/0",
      "sourceLayers": ["places"],
      "fields": ["gers_id", "place_name", "icon_group", "confidence", "operating_status"],
      "release": "2026-10-21.0"
    }
  }
}
```

Replace `places` with the actual `source-layer` name used by the icon/label style layers. List every Places source-layer if more than one exists. This contract is read from the style loaded by the VectorTileServer URL, not an unrelated custom-style item. Both symbol and circle style layers are supported. Keep unrelated datasets out of this tile service.

This declaration does not add attributes to tiles. It links the two services and states the expected schema. The widget also inspects one real tile to check the sample place ID and attribute values. That is a setup diagnostic, not a full-dataset audit. Verify null scores, closed places and category examples throughout the package before publishing an experience.

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
