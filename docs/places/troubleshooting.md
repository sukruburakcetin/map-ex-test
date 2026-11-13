# Places troubleshooting

Start with the row matching your problem. Keep the current working services/data until the replacement passes its checks.

## Download and local files

| Problem | What to do |
|---|---|
| `python` is not found | Install Python 3.10+ or use its full executable path. |
| `No module named duckdb` | Activate your downloader environment and install `tools/overture_places/requirements.txt` with that same Python. |
| Cannot find the area profile | Use its full path. The profile does not belong inside the venv. |
| Where did the files go? | Use `folder`, `source_path` and `changes_report` printed by `refresh`. Output is beside the profile under `places-data`, not inside the script or venv folder. |
| `published_release: null` | Normal for a new profile. Record publication only after the experience uses that release. |
| Catalog/download fails | Check network/proxy access to Overture and DuckDB extension hosts. A catalog fallback is described below. |
| Too many places | Reduce the area, or deliberately increase profile `max_features` up to 100000. No incomplete export is published. |
| Source schema is unsupported | Check the selected release and tool version. Do not rename fields or edit counts to bypass validation. |

The catalog is `https://stac.overturemaps.org/catalog.json`. If your browser can reach it but Python cannot, save it as `catalog.json` and add `--catalog C:\Places\catalog.json` to `check` or `refresh`. This only replaces release discovery; source data and extensions still need access. Run `python tools/overture_places/places_area.py releases` to list dated releases directly.

## Files or names already exist

**Pro build folder exists:** keep it and select a new build name:

```python
built = workflow["build_portal"](
    r"C:\Places\my-area.places-area.json",
    "2026-10-21.0",
    "https://portal.example.com/server/rest/services/Hosted/NEW_QUERY/FeatureServer/0",
    build_name="portal-build-2"
)
```

Use your actual release/query URL. Publish `places-portal-overview.vtpk` from the newly printed folder.

**Portal says the upload/item/service name exists:** use a unique new name. You do not need to rebuild just to change an upload name. If Portal needs a different local filename, copy the final package to a uniquely named `.vtpk`; keep the generated original and reports in the build folder.

**A direct export/import output exists:** choose a new output path. Tools preserve existing files. The saved-area helper reuses a verified completed snapshot of the same release.

## Portal connection and publishing

| Problem | What to do |
|---|---|
| `499 Token Required` | The service is restricted. Use the app's normal authorized ArcGIS sign-in, or share **both** services for the intended audience. Never paste a token into settings. |
| `Unable to add layer` in Map Viewer | Check the Portal publication/cache-import job first. A usable service needs `tileInfo` and style resources, not only capabilities/minLOD/maxLOD. |
| Connection rejects fields or pairing | Use the exact GeoJSON and final package from the same release. Preserve required field names/types. See the [schema reference](../development/places-packages.md#query-layer-schema). |
| Connection reports unsupported SQL | The current adapter uses `UPPER`, `LIKE ... ESCAPE` and ordinary predicates; it does **not** require `REPLACE`. Confirm you deployed the current widget and retry. |
| Only colored points, missing icons or no overview counts | Publish the final **places-portal-overview.vtpk**, not the intermediate native/restored package. |
| A name/location match is ambiguous while building | Keep source/native files and reports. Do not remove records or guess an identity. Check that current tools and the exact build source are being used. |
| Works for owner but not viewer | Check sharing/access to both services, the app's Portal authentication and HTTPS/network access from the final app origin. |
| Optional script stops | Inspect its publication report and known item IDs. A server job may still finish; review Portal before creating a new plan. See [optional publishing](optional-publishing.md#if-a-run-fails). |

## Map and panel

| Problem | What to do |
|---|---|
| Places button absent on mobile | Enable Places and configure the URLs on that responsive widget instance; settings may differ from desktop. |
| Connected but map empty | Enable Places, go inside the published area, clear filters and zoom into supported scales. Inspect tile/sprite requests if still empty. |
| Not every icon is visible | Collision handling can hide dense symbols. Zoom/filter, or use area search. Search is not limited to visible symbols. |
| Places disappear at close zoom | Use current tools and the final overview package, which includes cached-tile fallback. For a third-party service, check its advertised zoom range. |
| No places far outside the area | Only downloaded/published coverage is available. Prepare a separate area or deliberately expand coverage. |
| Search/list count is below the dataset total | Check searched area, filters, text and batch/page. The source total is not the current match count. |
| New release is not visible | Verify **both** service URLs (or the external database path), connected release and served app configuration. Reload after switching. |

## External HTTPS service

| Problem | What to do |
|---|---|
| Database does not exist | Use the database produced by the external profile's `refresh`. Existing GeoJSONL must be imported first. |
| TLS certificate/key not found | Replace both sample paths with actual local files. Relative paths resolve from the service JSON folder. Ask your server administrator for deployment certificates. |
| TLS trust error | Correct certificate trust and hostname on the client/server; do not disable verification. |
| Port in use | Stop the other process or choose a different port and update the configured address consistently. |
| Health opens, widget test fails | Check exact app-origin/CORS settings and browser Network failures, including style, sprites, tiles and POST search/picking routes. |
| Phone or another domain cannot reach it | Replace localhost with a service address reachable from that device; check DNS, HTTPS, routing and firewall. |
| Public style advertises localhost | Correct `public_url`, restart and reload the app. |
| Proxy gives 404/405 or preflight failure | Route the whole service prefix; preserve GET/POST/OPTIONS and request bodies. |

Return to [Places setup](README.md).
