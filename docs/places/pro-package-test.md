# ArcGIS Pro vector package feasibility test

Use this step after publishing the query layer and preparing `places-portal.geojson`. The administrator in this development session uses Enterprise 12.1 and has ArcGIS Pro. This tool is a local publishing investigation, not a replacement for a verified full-dataset publishing workflow.

## Run one small test

1. Keep the `tools/overture_places` directory together. Apply the GeoJSON exporter/converter update first: `places_geojson.py` and the shared category mapping are required.
2. Open a project in ArcGIS Pro. A new empty project is sufficient. Open **Analysis → Python → Python Window**.
3. Run the following, replacing the widget path with your actual folder. Paths containing spaces are supported.

   ```python
   import os, runpy
   os.chdir(r"C:\path\to\mapillary-explorer")
   probe = runpy.run_path("tools/overture_places/pro_places_package.py")
   probe.get("build_test")("places-portal.geojson", "data/places-pro-test", fresh_output=True)
   ```

4. Wait for Pro's Create Vector Tile Package tool to finish. `fresh_output=True` automatically chooses an unused numbered output folder when the base folder exists. The console prints the exact path before work starts. Earlier attempts are preserved. Without this option an existing folder is refused.
5. Review/share `data/places-pro-test/places-package-report.json`. It contains the Pro version, sampling counts, cache layout and retained property names/counts. It excludes property values, service URLs and credentials. Do not share the GeoJSON, geodatabase or package unless those source records are intended to be shared.

The test creates:

```text
data/places-pro-test/
  places-probe.geojson
  places-probe.gdb/
  places-attribute-probe.vtpk
  places-package-report.json
```

It selects up to 50 real places within two kilometres of the first source place, preferring varied categories, missing/known confidence and statuses when available. Input is a regional FeatureCollection with up to 100,000 records and at most 128 MiB. No synthetic place is inserted and no source file is changed. This small subset is not a complete tile counterpart of your existing query dataset.

The tool creates explicit nullable query-compatible fields in its own geodatabase, including Double confidence, so this test does not depend on GeoJSON's database-type inference. It projects the test feature class to Web Mercator Auxiliary Sphere (102100), adds it to a new map, then sets and verifies the map projection after the layer is added. It removes only that map's automatically added basemap, applies category symbology and name labels, sets a local extent, and calls Pro's genuine `CreateVectorTilePackage` tool with a flat cache at vector levels 14–17. Existing maps/layers are not edited and the project is not saved. The temporary map is removed afterward; any cleanup issue is recorded in the report. Outputs are retained if an ArcPy error occurs so the local error can be investigated.

No Portal login or publication is performed. Your existing hosted query layer and external Places service remain as they were. The resulting file is named `places-attribute-probe.vtpk` deliberately: review it before publishing; it is not yet a complete widget-ready dataset.

## What the report establishes

The inspector reads ZIP members without extraction and recognizes the documented Esri Compact Cache V2 bundle layout. It examines up to eight bundles and 32 tile payloads, with four samples per bundle, a 32 MiB bundle ceiling and a 4 MiB decoded-tile ceiling. It supports ordinary and gzip-compressed MVT payloads. It recognizes the documented capacity-count Compact V2 header and the populated-count variant verified in the supplied Pro 3.6 package. Tile index bounds and length prefixes are checked, and populated-count headers must agree with actual nonempty entries. Unknown variants are reported instead of guessed.

- `sourceLayers`: actual tile source-layer names, feature counts and attribute-name counts in the inspected sample.
- `requiredFieldsSeen`: whether the sample includes each widget filter/identity field.
- `uniqueMatchingExpectedRecords`: how many inspected records retain a source GERS ID and matching filter attributes. Missing/null source scores do not require an encoded tile property.
- `issues`: structural or inspection-budget problems requiring investigation.
- `sampleBudgetReached`: whether the sample coverage was limited; it does not claim every tile was examined.

`completeDatasetValidation` and `portalPublishingTested` always remain false. Attribute-name presence alone does not prove every record is complete, correctly rendered or globally searchable. Even a promising report needs full-data verification and a real Portal publishing/runtime test.

If Pro retains only internal fields such as `_symbol` or `_name`, record that result. Do not rename those fields in a style and assume the missing values exist. The actual package layout and report will guide the next attribute-preservation step. We do not hide JSON/identifiers in labels, add fake POIs, change the widget's validation to accept missing attributes, or turn on a bulk feature renderer.

## Running outside the Python window

Use the ArcGIS Pro Python command prompt and provide an existing project template:

```sh
python tools/overture_places/pro_places_package.py --input places-portal.geojson --output-dir data/places-pro-test --fresh-output --project "C:/GIS/EmptyProject/EmptyProject.aprx"
```

The tool uses the project in memory and does not call `save()`. Ordinary system Python without ArcPy cannot create the package. The standalone inspector can run with ordinary Python on an existing package:

```sh
python tools/overture_places/inspect_places_vtpk.py --input data/places-pro-test/places-attribute-probe.vtpk --report data/places-pro-test/inspection-only.json
```

## Verification boundary

The repository's `tests/placesProPackage.test.py` checks protobuf/gzip parsing, documented compact-bundle offsets, malformed inputs, sample limits, report redaction and orchestration against an ArcPy fixture. This is not execution of ArcGIS Pro. The native tool, label-engine compatibility, package layout and actual retained attributes still require the local Pro run above.

Format sources reviewed:

- [Esri Compact Cache V2 technical description](https://github.com/Esri/raster-tiles-compactcache/blob/60dc253921be873289238e62bdf6425bc29c95e0/CompactCacheV2.md). Describes bundle indexing, including its use for vector tiles; it is not a complete VTPK specification.
- [Esri Tile Package Specification](https://github.com/Esri/tile-package-spec/tree/5276322c7bdf1208568b67de241a5535f213d319). Describes raster `.tpkx`, not a claim that renaming a raster package produces `.vtpk`.
- [ArcGIS Pro Create Vector Tile Package](https://pro.arcgis.com/en/pro-app/latest/tool-reference/data-management/create-vector-tile-package.htm).

## Observed Pro 3.6 package result — 2026-11-11

The supplied native test package contains two bundles and eight nonempty MVT tiles. Its Compact V2 header uses a populated-entry count (3 or 5), rather than 16,384, at offset 4; it retains the full 16,384-slot, 131,072-byte index. The reader now recognizes this observed variant without weakening its offset, size or payload-prefix checks.

All eight tiles were decoded without parsing errors. They contain 104 feature instances across zooms/borders, with only `_name` and `_symbol`. These are not 104 distinct places. The required raw `gers_id`, `place_name`, `icon_group`, `confidence` and `operating_status` properties were not retained by this particular publishing configuration.

A separate read-only matching investigation matched all 104 tile instances unambiguously to 50 distinct records in the included Indianapolis reference snapshot, using exact name/category and position within one MVT coordinate unit. This is evidence for an attribute-restoration prototype, not a general identity guarantee. The guarded offline restoration tool is now implemented and locally verified on this sample; full Pro/Portal acceptance remains pending. Distinct-position ambiguities still fail rather than selecting a nearest GERS ID. The full-dataset rule for strictly identical coincident objects is documented in the restoration guide.

The current native Pro export is therefore a valid display package, but not yet compatible with the widget's complete filter/identity contract. Do not remove validation to accept it. The [attribute-preserving packaging step](attribute-restoration.md) is now implemented with full-source coverage checks. Run its full-data Pro/Portal publishing test next. The existing external service remains the working fallback.

To inspect every tile in this small existing package without rerunning Pro:

```sh
python tools/overture_places/inspect_places_vtpk.py --input data/places-pro-test/places-attribute-probe.vtpk --report data/places-pro-test/inspection-pro36.json --tiles-per-bundle 16
```

Use the actual output-folder path from your run. The report filename must be new. `--tiles-per-bundle` raises only the per-bundle sample; the total 32-tile CLI budget remains in place. Reports now flag skipped per-bundle tiles as limited sampling, even when the overall tile budget is not reached.

The subsequent full upload was restored successfully: see [full dataset recovery](attribute-restoration.md#full-dataset-recovery-after-the-coincident-record-error). That verification used the uploaded full native package and exact 7,089-record source, not the earlier reference-only subset. Hosted Portal acceptance remains pending.
