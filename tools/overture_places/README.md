# Places data tools

Follow the [administrator guide](../../docs/places/administrator-guide.md) for Windows/Linux setup, export, HTTPS serving, widget connection, hosting and release updates.

| Tool or asset | Responsibility |
|---|---|
| `export_all_places.py` | Export a pinned area to `.geojson` for Portal or `.geojsonl` for the external service, including `icon_group`. |
| `convert_places_geojson.py` | Convert an existing exported GeoJSONL snapshot into a Portal-uploadable GeoJSON FeatureCollection without DuckDB or network access. |
| `pro_places_package.py` | Small Pro diagnostic or complete regional native export plus attribute restoration; no Portal upload. |
| `restore_places_vtpk.py` | Restore/verify the exact source attributes in a new copy of a Pro package; preserve geometry, refuse ambiguous identities and require full source coverage. |
| `inspect_places_vtpk.py` | Bounded offline inspection of package bundle/tile attributes, without extracting files or exposing attribute values. |
| `places_geojson.py` | Shared streaming validation, category normalization and exclusive complete-file publication. |
| `export_common.py` | Validate bbox and resolve release identifiers. |
| `places_service.py` | Import, inspect and serve a configured read-only SQLite database over HTTPS. |
| `places_store.py` | Validate source records, build indexes and atomically publish a versioned database. |
| `service.example.json` | Copy to your own service config; set database, URL, allowed origins and TLS paths. |
| `serve_places_local.py` | Shared native tile/query protocol and optional in-memory direct test. |
| `place_categories.py`, `basic_category_icons.csv` | Map source categories to shared icon families. |
| `places_sprite.py` | Generate shared sprite atlases. |
| `requirements.txt` | DuckDB dependency for offline export; serving uses standard-library Python. |

Keep the tool directory together. Import a regional snapshot once, then serve the persisted database without reading/reindexing source files at restart. The current tested import limit is 100,000 places. The [roadmap](../../docs/development/roadmap.md) tracks deployment and scale validation.

A [regional example pair](../../examples/places/README.md) is included. Preserve release attribution and `OVERTURE-EXPLORER-NOTICE.txt`. See the [service contract](../../docs/places/service-contract.md) for protocol details.

## Portal-ready GeoJSON

Convert an existing export from the widget root:

```sh
python tools/overture_places/convert_places_geojson.py --input places-all.geojsonl --output places-portal.geojson
```

Or export a new area directly:

```sh
python tools/overture_places/export_all_places.py --release 2026-10-21.0 --bbox=-86.16,39.75,-86.10,39.80 --format geojson --output places-portal.geojson
```

The `.geojson` output extension also selects FeatureCollection format automatically. Direct export keeps the existing DuckDB requirements, 25,000-record default and 100,000-record maximum. Conversion uses only standard-library Python and the included category mapping, with a 100,000-record ceiling. Both retain IDs, nulls, Unicode and distinct colocated records; neither silently truncates or overwrites output. The external service continues using `.geojsonl` plus its matching manifest.

Upload the resulting `.geojson` to Portal as query data. Follow the [Portal guide](../../docs/places/portal-administrator-guide.md) for field types, publishing and the separate vector tile service. GeoJSON itself is not a `.vtpk`.

## External service quick start with the included example

```sh
python tools/overture_places/places_service.py import --input examples/places/places-indianapolis.geojsonl --database data/places-2026-10-21.sqlite
python tools/overture_places/places_service.py inspect --database data/places-2026-10-21.sqlite
```

Copy `service.example.json` to `places-service.json` in the widget root and edit the certificate/key paths and app origin for your environment. Then:

```sh
python tools/overture_places/places_service.py serve --config places-service.json
```

Check `https://localhost:3444/health`, then configure the widget with `https://localhost:3444`. Retain dated databases for explicit stop/config-change/restart rollback. See the administrator guide for full platform and HTTPS hosting details.

For the pending tile-package workflow, run the [ArcGIS Pro feasibility test](../../docs/places/pro-package-test.md) before publishing a full package. Native Pro execution and Portal acceptance remain separate verification gates.

The next full-data Portal step is the [attribute-preserving full build](../../docs/places/attribute-restoration.md). It generates the pairing contract automatically and requires a real Pro/Portal acceptance test. Existing diagnostic packages can be repaired offline without another Pro run when their exact build-source GeoJSON is supplied.

## Saved-area maintenance

Start with the [area maintenance guide](../../docs/places/area-maintenance.md). `places_area.py` provides `init`, `releases`, `check`, `adopt`, `refresh`/`prepare`, `build-portal` and `mark-published`. Preparation and publication are separate: no command uploads Portal items or rewrites the running HTTPS service configuration. `places_releases.py` owns bounded public catalog discovery.

## Optional Portal publication

`publish_places_portal.py` runs only when an administrator explicitly invokes it from a signed-in ArcGIS Pro Python window. `create_plan` reads Portal/account metadata and writes a local plan; `publish_plan` creates a new private query/vector tile pair and reports both URLs for review. It never overwrites/deletes existing services, changes the experience or saves credentials. No toolbox is included. See [Optional publishing](../../docs/places/optional-publishing.md) for requirements, usage, retained partial results and the live acceptance-test boundary. Ordinary downloading and manual publishing do not require this optional script.
