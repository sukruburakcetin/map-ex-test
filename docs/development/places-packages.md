# Places package and query reference

For normal installation, start with [Places setup](../places/README.md). The administrator's `places_area.py build_portal` call already runs the complete pipeline. This reference is for maintaining tools, investigating an unsupported package or integrating a separate publishing pipeline.

## Query-layer schema

Use a dedicated point layer with these exact names. The exporter adds `icon_group` from the shared category mapping.

| Field | ArcGIS type |
|---|---|
| `gers_id` | String; unique source identity |
| `place_name` | String |
| `category` | String |
| `icon_group` | String |
| `confidence` | Nullable Double or Single, 0–1 |
| `operating_status` | Nullable String |
| `address` | Nullable String |
| `website` | Nullable String |
| `data_release` | String; pinned Overture release |

Keep an ordinary ArcGIS-managed numeric ObjectID, spatial index, Query capability, ordered pagination and `maxRecordCount >= 200`. Extents must be WGS84 or Web Mercator. Preserve IDs even for colocated places. Missing confidence/status remain null; do not invent records to influence type inference. All-null GeoJSON fields can require publishing with an explicit typed schema.

Current standardized queries use `UPPER`, `LIKE ... ESCAPE`, null/equality and numeric predicates. They do not require SQL `REPLACE`. Portal uses stable ObjectID paging and within-batch sorting; the external API can rank before slicing. SQL collation/accent behavior can differ.

## Complete build and output

`places_area.py:build_portal` sequences:

1. `pro_places_package.py:build_portal_package`: validate the whole source, create typed/projected data, export native Pro tiles and restore attributes.
2. `style_places_vtpk.py:style_package`: embed category sprites and replace the native circles with collision-managed icons.
3. `prepare_places_portal.py`: add overview aggregates and cached-parent fallback.

The final upload is **places-portal-overview.vtpk**. Retain the original source, native package, intermediate packages and reports. These local tools never upload to Portal; the optional publishing script is the separate explicit publishing entry point.

`build_portal` uses the currently open Pro project by default, creates its own map/workspace and does not save the project. A CLI alternative in Pro's environment accepts a project path:

```bat
python tools/overture_places/places_area.py build-portal --profile C:\Places\my-area.places-area.json --release 2026-10-21.0 --query-url https://portal.example.com/server/rest/services/Hosted/NEW_QUERY/FeatureServer/0 --project "C:\GIS\Project.aprx"
```

Use a short output path on Windows. Existing area build folders require a new `--build-name`; existing files are not overwritten.

## Identity and package preservation

The verified native Pro 3.6 export retained `_name` and `_symbol`, not the complete query attributes. Restoration uses the **exact source GeoJSON** and preserves geometry, native properties, ZIP resources and the distinction between native local/central ZIP metadata.

Matching requires exact name, renderer category and position within one MVT unit per axis plus a 0.1 mm Web Mercator rounding allowance. It never guesses a nearest place. Distinct-position ambiguities, stale attributes or missing source IDs fail.

Exactly coincident/name/category-equal source sets can be restored one-for-one only when anonymous native slots have identical geometry/properties and equal multiplicity. Different native IDs, metadata or counts are refused. Full source objects, including different scores/statuses, are retained.

Every repaired tile is read back against the source; complete source coverage and geometry/resource digests are checked. Null values stay absent in MVT; numeric zero stays zero. Growing tile payloads update bundle maximum-record-size headers.

Supported restoration is the verified single `places` layer, Pro circle/category renderer, 512-pixel Web Mercator grid and known Compact V2 variants. Budgets include 100,000 source records, 128 MiB source JSON, 512 MiB uncompressed package, 32 MiB bundle, 4 MiB tile and 20,000 features per inspected tile. Unsupported data fails explicitly.

## Style pairing contract

The complete builder embeds `metadata["mly:places"]` in the active root style. It identifies version `1`, exact query URL, pinned release, source layers, required fields and `sourceFeatureCount`. Overview preparation adds the cluster contract. Do not manually declare compatibility for a package missing real attributes.

The widget checks query schema, declared count, release and a real tile sample. This is a setup diagnostic, not a complete hosted audit. Filter updates use native styles, preserve source predicates and do not republish caches.

## Icons, labels and overview counts

The icon tool embeds the shared normal/retina sprite atlas while preserving tile data and unrelated resources. The widget removes ordinary Places names from the map; names remain in the panel. Collision placement may hide icons in dense areas.

Overview preparation adds `places_clusters` with complete-source counts in fixed 64-pixel cells. Counts use exact confidence histograms plus category/non-permanently-closed totals. Thresholds exclude null scores. Expressions use blocks of 32 scores, with up to 8,192 distinct source scores.

Cluster clicks zoom toward their cell; aggregates cannot become field notes. Picking is bounded to four tiles, with at most sixteen decoded tiles under a 512 KiB estimated cache budget.

Native cached-parent fallback keeps detailed display available without pretending new source precision. Display levels extend to 24; actual cache levels remain explicit. Portal overview browsing begins at level 12. The external helper supports levels 12–22. Outside supported scales/coverage, an empty map can be expected. ArcGIS vector levels and displayed map zoom can differ.

## Repair or inspect an existing native package

These are maintenance operations, not additional beginner steps. Use ordinary Python with the exact build-source GeoJSON. Choose unused output filenames:

```bat
python tools/overture_places/restore_places_vtpk.py --input data/places-native.vtpk --source data/places-package-source.geojson --output data/places-restored.vtpk --query-url https://portal.example.com/server/rest/services/Hosted/QUERY/FeatureServer/0
python tools/overture_places/style_places_vtpk.py --input data/places-restored.vtpk --output data/places-icons.vtpk
python tools/overture_places/prepare_places_portal.py --input data/places-icons.vtpk --source data/places-package-source.geojson --output data/places-overview.vtpk
```

Publish the last output only, then test it against the matching query service. These commands do not contact Portal or fix an incomplete hosted import.

For bounded inspection without extracting ZIP members:

```bat
python tools/overture_places/inspect_places_vtpk.py --input data/places-native.vtpk --report data/inspection.json
```

`pro_places_package.py:build_test` remains a developer-only subset diagnostic, up to 50 places. Its package is **not** a full counterpart of a regional query layer and is not required by the normal workflow.

## Register an existing snapshot

To establish a saved-area baseline from an existing complete export, retain its original manifest:

```bat
python tools/overture_places/places_area.py init --profile C:\Places\my-area.places-area.json --name "My area" --manifest places-all.manifest.json --source portal
python tools/overture_places/places_area.py adopt --profile C:\Places\my-area.places-area.json --input places-portal.geojson --manifest places-all.manifest.json --published
```

`--published` records your declaration that this exact snapshot is deployed; it does not inspect or publish services. Omit it for local adoption only. The helper verifies source identities, unfiltered state, bbox, count and release. If the manifest is missing, prepare a new snapshot rather than guessing its original bounds. For GeoJSONL conversion, keep the original manifest even if its basename differs.

## Existing exports and conversion

The normal saved-area guide downloads the correct format directly. For an existing matching export:

```bat
python tools/overture_places/convert_places_geojson.py --input places-all.geojsonl --output places-portal.geojson
```

Conversion uses standard-library Python, preserves IDs/nulls/colocated records, adds icon groups and refuses existing outputs. Retain the original manifest and attribution; conversion does not invent a new manifest. Direct `export_all_places.py` accepts `.geojson`/`--format geojson` for Portal and `.geojsonl` for the external service, with a 25,000 default / 100,000 maximum record limit.

## Verification boundary

The supplied full native/restored package was independently decoded: 7,089 source identities, 14,933 feature instances and 52 tiles, preserving geometry/native properties and checking all nine attributes. Local SDK/Chromium checks rendered extracted resources and overview/icon styles. These do not establish Enterprise's importer, authenticated publishing, 3D/phone performance or country/global capacity.

See [Places tests](places-testing.md). Native tooling documentation: [Create Vector Tile Package](https://pro.arcgis.com/en/pro-app/latest/tool-reference/data-management/create-vector-tile-package.htm) and [Compact V2 indexing](https://github.com/Esri/raster-tiles-compactcache/blob/60dc253921be873289238e62bdf6425bc29c95e0/CompactCacheV2.md). The raster `.tpkx` specification is not a substitute for `.vtpk` compatibility.
