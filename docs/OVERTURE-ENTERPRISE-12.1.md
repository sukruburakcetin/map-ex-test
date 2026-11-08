# All-places tile pilot on ArcGIS Enterprise 12.1

Enterprise 12.1 can host vector tile layers and queryable feature layers. Use ArcGIS Pro to author a small test area, then publish both representations from the same imported feature class. GeoParquet remains the upstream source; direct Portal GeoParquet ingestion is not required for this workflow.

This pilot includes every POI record whose point is in the requested bounding box, across categories, confidence values (including missing confidence), names (including unnamed places), and operating statuses (including permanently closed). It preserves colocated records. It selects useful scalar attributes rather than every nested Overture property. It is complete relative to the selected release and box, not a guarantee of real-world completeness.

## 1. Export a small area

On an administrator's workstation/build host with Python and internet access:

```sh
python -m venv .venv-overture
# Activate the environment using your platform's normal command.
python -m pip install -r tools/overture_places/requirements.txt
python tools/overture_places/export_all_places.py \
  --release latest \
  --bbox=-86.16,39.75,-86.10,39.80 \
  --output /YOUR/PUBLISHING/DIRECTORY/places-all.geojsonl
```

The example uses the existing Indianapolis pilot area so the new and existing approaches can be compared. `latest` resolves once and is recorded as a dated release in every row and in `places-all.manifest.json`. For a later rerun, use that dated release for reproducibility. Optional `--input-parquet` reads a local snapshot.

The default safety limit is 25,000 records, with an explicit ceiling of 100,000. An oversized area fails without publishing a truncated snapshot. Split the area instead of raising limits indefinitely. Results stream to disk in 512-row batches; the SQL engine has a 1 GB memory setting. This setting does not cap total process memory. No server-side nationwide export is claimed.

`.geojsonl` is a line-delimited intermediate file, **not** a Portal upload or an ArcGIS JSON To Features input. Keep its manifest alongside it.

## 2. Import in ArcGIS Pro

Run this in ArcGIS Pro's Python environment, using absolute paths appropriate to your workstation:

```sh
python tools/overture_places/prepare_all_places_arcpy.py \
  --input /YOUR/PUBLISHING/DIRECTORY/places-all.geojsonl \
  --geodatabase /YOUR/PUBLISHING/DIRECTORY/overture.gdb \
  --name places_all_pilot
```

The script creates a WGS84 point feature class with explicit nullable fields, a GERS attribute index and a spatial index. Explicit fields preserve confidence as numeric even when the first record has a null value. It validates the manifest count, IDs, release and field lengths. It rejects duplicates or overlong values instead of silently dropping records or truncating text. It cleans up an incomplete feature class on failure and never overwrites an existing one.

Review the imported count against the manifest. Ensure low-confidence, unnamed and uncategorized records were retained if present in this test area. These scripts do not require or use Enterprise credentials.

## 3. Author and publish

1. Sign in to the Enterprise 12.1 portal from a compatible ArcGIS Pro installation. Publishing requires the appropriate portal privileges and a configured hosting server.
2. Add the feature class to a **2D map** using the ArcGIS Online/Bing Maps/Google Maps-compatible Web Mercator tiling scheme. Use an explicit reference scale and a simple, centered point symbol suitable for vector tiles. Begin with one neutral symbol; category sprites can follow once alignment is validated.
3. Apply **no definition query**, confidence threshold, category exclusion or operating-status exclusion. Set an explicit layer visibility range, initially matching the current nearby-places zoom range. Low-zoom collision handling is a visualization choice, not a source-record filter. Do not describe collision suppression as clustering or complete visible counts.
4. Publish a read-only hosted feature layer from this feature class. Keep `gers_id`, `place_name`, `category`, `confidence`, `operating_status`, `address`, `website` and `data_release`. Disable editing and sync. Confirm querying works, GERS IDs remain strings and the service honors a 32-record request cap.
5. Publish a hosted vector tile layer from the same map/source, using **Share As Web Layer → Vector Tile / Copy all data**, or create a `.vtpk` with **Create Vector Tile Package**, add it to Portal and publish it. Use the package route if the associated-feature options in your installed Pro version differ. Configure source attribution in the tile map/service.
6. ArcGIS Pro can offer an associated feature layer when sharing vector tiles. If available in your compatible Pro/Enterprise combination, it can replace the separately published details layer; verify its schema, permissions and query limits. A vector tile package alone does not create a queryable POI details service.
7. Keep tile and details services on the same dated release. Use matching sharing/access settings supported by the widget. Record the vector tile style URL and the actual feature sublayer URL ending in `/FeatureServer/<layer-id>`.

The Pro UI and associated-layer choices vary with Pro version. Run Share's analyzer and resolve errors before publishing. This repository cannot publish to your Enterprise installation without access to it, and ArcPy is not available in the Linux development environment.

## 4. Connect and verify

Follow [the prototype run instructions](OVERTURE-TILES-PROTOTYPE.md). Its runtime accepts an ArcGIS vector tile style/service URL and a FeatureServer sublayer URL. It does not accept a raw GeoParquet or PMTiles URL.

First verify the 2D map, then switch to 3D and start the harness again. Check centered icons, terrain, overlaps, rapid clicks and cancellation. The prototype uses proximity picking, not rendered-symbol identity; it can select a record whose icon was hidden by collision handling. A dense, truncated candidate query intentionally produces no selection.

Compare memory, network traffic and responsiveness with the test mode off/on on a low-end phone. Until those checks pass, keep the existing production POI path unchanged. Hover, existing imagery details, low-zoom aggregation and monthly publishing automation are later integration steps.

## Release updates

Export each new release to a new artifact and import to a new feature class. Validate both tile and detail services before switching the pair in the application. Do not update only one representation: geometry changes can otherwise make picking disagree with icons. Service replacement and cache invalidation need their own deployment design; these scripts do not schedule updates.

## Official documentation

- [Enterprise 12.1: Publish hosted vector tile layers](https://enterprise.arcgis.com/en/portal/12.1/use/publish-vector-tiles.htm)
- [Enterprise 12.1: Publish hosted feature layers](https://enterprise.arcgis.com/en/portal/12.1/use/publish-features.htm)
- [ArcGIS Pro: Share a vector tile layer](https://pro.arcgis.com/en/pro-app/latest/help/sharing/overview/vector-tile-layer.htm)
- [ArcGIS Pro: Create Vector Tile Package](https://pro.arcgis.com/en/pro-app/latest/tool-reference/data-management/create-vector-tile-package.htm)
- [Overture cloud delivery and production tile caveats](https://docs.overturemaps.org/getting-data/cloud-sources/)
