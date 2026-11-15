# Restore attributes and prepare a Portal tile package

The native ArcGIS Pro 3.6 test package is readable and has valid Web Mercator tiles, but its feature attributes contain only `_name` and `_symbol`. The offline restoration tool adds the normalized Places attributes from the exact source GeoJSON while preserving feature geometry, native category styling, sprites, glyphs and other package resources.

The restoration algorithm has now been verified against both the earlier 50-place test package and the user-supplied full native Pro package with its exact 7,089-record source GeoJSON. An independent MVT decoder checked all 52 tiles and 14,933 feature instances against all nine source attributes. Geometry, native properties and resources are preserved. Hosted Portal acceptance remains a separate check; it is not claimed by this offline verification.

## Recommended next step: build the entire regional dataset

Your existing Portal query layer contains the entire dataset. Do not publish the 50-place diagnostic subset as its complete tile counterpart. Use the same original `places-portal.geojson` that was uploaded for that query layer.

After applying the restoration installer, rebuild/reload the widget because this update includes two Portal connection checks: declared source-record counts and cached tile levels. No full POI FeatureLayer is added to the map; the external service mode is unchanged.

In ArcGIS Pro's **Analysis → Python → Python Window**, run:

```python
import os, runpy
os.chdir(r"C:\path\to\mapillary-explorer")
pro = runpy.run_path("tools/overture_places/pro_places_package.py")
pro.get("build_portal_package")("places-portal.geojson", "data/places-portal-build", query_url="https://YOUR-PORTAL/server/rest/services/Hosted/OverturePlaces/FeatureServer/0")
```

Replace the widget folder and the **whole query URL** with your actual published `/FeatureServer/0` endpoint. Do not include tokens or other URL parameters. `fresh_output=True` is the default for this entry point, so an existing output folder produces a new numbered folder rather than an overwrite. The console prints its actual location.

The command:

1. Validates all source records (not the 50-record diagnostic sample).
2. Creates typed fields and projected data in a new geodatabase.
3. Uses ArcGIS Pro to create a genuine native vector tile package, with map metadata and Web Mercator checks.
4. Restores and verifies attributes in every cached tile, preserving original geometry and original internal renderer properties.
5. Requires every source GERS ID to appear in the package at least once.
6. Writes the paired style metadata automatically and publishes the **local files only** after all checks pass. It does not upload or change Portal content.

Expected outputs in the actual printed folder:

```text
places-probe.gdb/                   native Pro workspace
places-package-source.geojson      exact full source used for the package
places-native.vtpk                 original Pro output, retained
places-package-report.json         native cache inspection
places-portal.vtpk                 attribute-restored package for Portal testing
places-portal.restoration.json     complete source/geometry/resource verification
```

If restoration fails, the native files are retained for investigation and `places-restoration-error.json` contains a sanitized failure summary. An incomplete repaired package is not published. Never remove source records or adjust counts just to make verification pass.

Pro's Python session caches helper imports. The entry script refreshes its own inspector/restoration helpers on each `runpy` invocation so installed fixes are picked up without reopening the project. A helper loaded from a different tool folder is refused to avoid mixing installations.

## Publish and test the successful full-source output

1. Confirm the restoration report shows `completeSourceCoverageVerified`, `geometryPreserved` and `otherResourcesUnchanged` as true, and the expected source count (for example, 7,089).
2. In Portal, use **Content → New item → Your device**, upload **`places-portal.vtpk`**, and select creation/publication of a hosted vector tile layer. Follow the available publishing action for your Enterprise deployment and account privileges.
3. Share the tile layer for the same intended audience as the existing query layer. The package includes the pairing metadata; a separate manual style edit is not required for this builder.
4. Copy the published service URL ending in `/VectorTileServer` into the widget's **Vector tile service URL**. Retain the matching `/FeatureServer/0` in **Place query layer URL**.
5. Run **Test connection**. For restored packages, it compares the declared source count with a scalar REST count before sample-tile checks. It also respects `maxLOD`, because Pro can list higher scheme levels without actually caching tiles at those levels.
6. Check category, confidence and closure filters, a place outside the first 200 results, map picking, details, nearby imagery and field notes. Validate signed-in/anonymous permissions as appropriate and check the actual phone and 3D view.

Count, release and sample validation help detect a mismatched pair; equal counts are not proof that two arbitrary datasets are identical. Keep both services on the same immutable source release. The existing [Portal guide](portal-administrator-guide.md) describes schema, permissions, SQL/collation and within-batch closest-first behavior.

## Repair an existing package without rerunning Pro

Use this for the already generated diagnostic package, with the **`places-probe.geojson` beside it**, not the original 7,089-place input:

```sh
python tools/overture_places/restore_places_vtpk.py --input data/places-pro-test/places-attribute-probe.vtpk --source data/places-pro-test/places-probe.geojson --output data/places-pro-test/places-restored-test.vtpk
```

Replace the folder with the actual numbered folder from your run. This repair uses only standard-library Python and the included category mapping; ArcGIS Pro is not needed for this step. Original input/source files are unchanged. Existing output or report files are refused.

Without `--query-url`, no widget pairing is added: this is an offline restoration experiment. To pair a complete existing package with its matching query layer:

```sh
python tools/overture_places/restore_places_vtpk.py --input data/complete/places-native.vtpk --source data/complete/places-package-source.geojson --output data/complete/places-portal.vtpk --query-url https://portal.example.com/server/rest/services/Hosted/OverturePlaces/FeatureServer/0
```

Supplying a URL does not contact the service. Actual Portal dataset/authentication validation happens in the builder/runtime. The style records `sourceFeatureCount`; trying to pair the 50-place repaired test with a 7,089-place query layer is rejected by the updated widget.

## Identity and preservation rules

- Match exact `_name` to source name and the Pro `_symbol` style class to `icon_group`, then require point coordinates within one MVT unit on each axis plus a 0.1 mm Web Mercator projection-rounding allowance. This small metre-bounded allowance covers the observed full-package floating-point discrepancy; it is not a nearest-distance rule. The source spatial index is rebuilt only when zoom/extent changes; it does not scan every source record per feature.
- Never pick the nearest of ambiguous candidates. Duplicate IDs, an unmatched point, conflicting pre-existing restored values, missing source IDs, multipoints or unsupported geometry stop the operation. Multiple matches with distinct source positions remain an error.
- Distinct colocated places remain distinct when names/categories establish unique matches. For exactly identical source coordinates, rendered name and category, a complete set of source objects can also be restored one-for-one when the corresponding native features have identical geometry, identical existing properties, no native feature IDs and exactly the same multiplicity. Source IDs are ordered deterministically into those indistinguishable anonymous slots; every complete source object, score and status is retained. Different native IDs, positions, metadata, partial annotations or record counts are refused. No point or source record is added or deduplicated.
- Preserve original geometry commands, feature type and native feature ID fields. Preserve `_name`, `_symbol` and other internal properties. Append the nine normalized Places fields; null values stay absent because MVT has no null scalar. Zero confidence remains numeric zero.
- Read every repaired tile back against the complete source; compare geometry command digests and verify ZIP CRCs and unchanged resources before output publication. Reports contain counts/flags/hashes rather than place values or service URLs.
- Support only the verified single-layer `places` Pro circle/category renderer, standard 512-pixel Web Mercator grid and known Compact V2 headers. Unsupported renderer/package variants fail explicitly instead of being approximated.

Current regional bounds are 100,000 source records / 128 MiB source JSON, 512 MiB total uncompressed package, 32 MiB per bundle, 4 MiB encoded/decoded tile, and the inspector's 20,000-feature tile cap. These are offline-tool budgets, not a national/global hosting capacity claim. Ambiguity or a budget failure requires investigation or a deliberately smaller supported region; no successful but truncated package is produced.

## Verification

- `tests/placesVtpkRestoration.test.py`: source/geometry/resource round trips, null/zero/status/Unicode, ambiguous/missing/stale data, unsupported geometry/scheme, input preservation, late publication conflicts, repeated repair, helper-cache refresh and full-build orchestration fixtures.
- `tests/placesProPackage.test.py`: native-header parsing, sampling and Pro orchestration fixtures.
- `tests/portalPlacesSource.test.cjs`: restored source-count checks and native cached-LOD selection, alongside the existing bounded query/filter tests.
- User package verification: eight tiles, 104 feature instances and 50 unique source identities, independently decoded with `@mapbox/vector-tile` and `pbf`; geometry and native feature IDs unchanged.

This establishes local attribute restoration for the verified sample and uploaded full dataset. It does not establish full native Pro execution for other datasets, hosted-package acceptance, permissions, phone/GPU performance or global-scale publication. Complete the real full-build and Portal test above before treating that deployment as verified.

## Full dataset recovery after the coincident-record error

The uploaded full package contained three pairs (six GERS identities) with the same name/category/coordinates and different scores or statuses. Each pair was present as two otherwise identical anonymous native point features at both cached levels. The updated set-based rule restored all six objects without altering or dropping a native feature. A separate point exceeded the old positional tolerance by about six micrometres in projected coordinates; the bounded 0.1 mm projection-rounding allowance resolves that numerical discrepancy.

Verified result: 7,089 source identities, 14,933 feature instances, 52 tiles, matching original/restored geometry command digests, unchanged other resources, and all nine attributes independently checked against the exact uploaded source. A restoration report records coincident group/instance/identity counts without exposing place values.

The original full native export can be repaired without rerunning Pro. From the widget root, after applying `apply-places-coincident-restoration-fix.cjs`:

```sh
python tools/overture_places/restore_places_vtpk.py --input data/places-portal-full/places-native.vtpk --source data/places-portal-full/places-package-source.geojson --output data/places-portal-full/places-portal.vtpk --query-url https://portal.example.com/server/rest/services/Hosted/Places/FeatureServer/0
```

Use your own service URL when following this recipe in another deployment. The command makes no network request. The source and native files remain unchanged; the new package/report must not already exist. This fix changes offline Python tools only and needs no widget rebuild. The earlier Portal source-count/cached-level update must remain installed in the widget.

## Native ZIP container layout and hosted publication checks

The first repaired ZIP copied Pro's central-directory NTFS metadata into local headers as well. Although its extracted resources and MVTs were readable and rendered in the ArcGIS SDK, that changed the native container layout. The writer now reads original local-header extra fields separately from central-directory extra fields and preserves that distinction. An untouched archive copied through the production writer reproduces the supplied Pro package byte-for-byte, including its SHA-256. Restored archives verify both sets of extra fields after writing.

The native-layout package retains all 7,089 source records, all 52 tile payloads, geometry and resources. MVT payloads and other resources are unchanged from the previously verified repaired package. Bundle headers now also declare the correct maximum record size: attribute enrichment grew the largest tile to 167,410 bytes, exceeding the original 131,092-byte declaration. The writer raises that maximum when needed; the inspector rejects understated declarations. This removes a known layout difference, but does not prove that it caused a particular Portal publishing failure. Hosted acceptance still needs a real publication test.

Apply `apply-places-native-container-fix.cjs`, then generate a NEW output from the original native package (ordinary Python; no Pro rebuild):

```sh
python tools/overture_places/restore_places_vtpk.py --input data/places-portal-full/places-native.vtpk --source data/places-portal-full/places-package-source.geojson --output data/places-portal-full/places-portal-v2.vtpk --query-url https://portal.example.com/server/rest/services/Hosted/Places/FeatureServer/0
```

Use your real query URL. Publish this package as a separately named hosted vector tile layer for the acceptance test and wait for publishing/cache import to finish. Copy its actual service URL from the new item. Keep the existing query service. Rebuild/reload the widget to pick up the included connection diagnostics.

A raw REST response with code 499 means an ArcGIS token is required; normal private access is through the application's configured ArcGIS identity. A signed-in response that lists only capabilities/minLOD/maxLOD but lacks `tileInfo` and style references is insufficient for the tested ArcGIS SDK to load the layer. The connection test now reports the missing tile definition explicitly before native layer loading. `exportTilesAllowed:false` limits export operations; it does not by itself prohibit normal map viewing.

If the newly published service still returns incomplete metadata, publish the unmodified `places-native.vtpk` as a separate control layer. If that control also fails, investigate the Enterprise publishing/cache import job and hosting storage/services. If the original works but the repaired package fails, the package compatibility gate is still unresolved; retain both files and the publish error for investigation. The widget cannot repair an incomplete hosted cache merely by changing its URL or authentication settings. Do not put tokens into configuration or diagnostic reports.
