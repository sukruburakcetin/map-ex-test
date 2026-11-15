# Places tools

**[Start with the Places setup guide](../../docs/places/README.md).** It leads from selecting an area to downloading, publishing and updating it. Keep this tool directory together; run relative commands from the widget root.

| Task | Entry point | Environment |
|---|---|---|
| Save/import an area, check releases, download, compare and record deployment | `places_area.py` | Ordinary Python 3.10+; downloader requirements installed |
| Build the full Portal package, including attributes, icons and counts | `places_area.py:build_portal` | ArcGIS Pro |
| Optionally publish a new private Portal pair from Pro sign-in | `publish_places_portal.py` | Pro Python window; explicit plan then publish |
| Run the external HTTPS alternative | `places_service.py` | Ordinary Python with SQLite R-tree; server/certificate configuration |

## Normal guides

- [Download and update](../../docs/places/area-maintenance.md)
- [Manual Portal publishing](../../docs/places/portal-administrator-guide.md)
- [Optional publishing script](../../docs/places/optional-publishing.md)
- [External HTTPS service](../../docs/places/external-service.md)
- [Troubleshooting](../../docs/places/troubleshooting.md)

## Developer helpers

`export_all_places.py`, `convert_places_geojson.py`, `places_geojson.py` and `export_common.py` export/normalize data. `places_releases.py` reads the public release catalog. `pro_places_package.py`, `restore_places_vtpk.py`, `style_places_vtpk.py`, `prepare_places_portal.py` and `inspect_places_vtpk.py` build or inspect packages. The complete area build runs the required stages together.

`places_store.py`, `serve_places_local.py`, `service.example.json`, `place_categories.py` and `places_sprite.py` support the external service and shared category resources. The direct in-memory server is a developer test path; the normal external workflow uses a prepared SQLite file.

See [package/schema reference](../../docs/development/places-packages.md), [external API/hosting reference](../../docs/development/places-service-contract.md) and [tests](../../docs/development/places-testing.md). An [example dataset](../../examples/places/README.md) is included. Preserve its manifest, [Overture attribution](https://docs.overturemaps.org/attribution/) and `OVERTURE-EXPLORER-NOTICE.txt`.

Preparation never changes the live experience. Only the optional publisher uploads Portal content when explicitly called; it creates new private items. Service switching and recording publication remain administrator actions.
