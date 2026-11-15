# Publish Places through ArcGIS Portal

Start after **[downloading your area](area-maintenance.md)**. You need its saved profile, prepared release, Portal publishing permissions and ArcGIS Pro. Hosting uses your organization's Portal infrastructure and HTTPS.

This is the **manual** workflow. The [optional script](optional-publishing.md) can perform the upload/build/publish steps instead; you do not need to follow both routes.

## 1. Publish the query data

1. Open the release folder printed by `refresh`. Find **places.geojson**.
2. Sign into Portal. Go to **Content → New item → Your device**.
3. Upload that GeoJSON and choose to create a **hosted feature layer**. Give it a unique name, such as `Places_MyArea_20261021_Query`.
4. Wait for publication. Open the item, open its point layer and copy the REST URL ending in **`/FeatureServer/0`** (or its actual numeric layer ID).

Example:

```text
https://portal.example.com/server/rest/services/Hosted/Places_MyArea_20261021_Query/FeatureServer/0
```

Use the layer URL, not the Portal item page or the FeatureServer root. Keep **Query** available; editing is not required. Your hosting server must support ordered pagination with batches of at least 200.

This layer supplies small search/picking/detail responses. **The widget does not add it to the map as a FeatureLayer.**

## 2. Build the complete tile package in Pro

Open a project in ArcGIS Pro, then open its **Python window**. Run:

```python
import os, runpy
os.chdir(r"C:\path\to\mapillary-explorer")
workflow = runpy.run_path("tools/overture_places/places_area.py")
built = workflow["build_portal"](
    r"C:\Places\my-area.places-area.json",
    "2026-10-21.0",
    "https://portal.example.com/server/rest/services/Hosted/Places_MyArea_20261021_Query/FeatureServer/0"
)
print(built["folder"])
```

Replace the **widget folder, profile path, release and query URL** with your actual values. Use the release from `refresh` and the query layer you just published from that same data. Do not include tokens in the URL.

This single call builds the native vector tiles, restores required attributes, adds category icons and prepares overview counts/zoom coverage. Keep Pro open until it completes. It creates a separate workspace without saving changes to your project or publishing anything to Portal.

In the printed build folder, the final file is:

```text
places-portal-overview.vtpk
```

**Publish this final file.** The native/restored/icon-only packages beside it are intermediate files; keep them and the reports for investigation, but do not upload them for this workflow.

If the build folder already exists, retain it and add `build_name="portal-build-2"` to the call. See [troubleshooting](troubleshooting.md#files-or-names-already-exist).

## 3. Publish the tile package

1. In Portal, choose **Content → New item → Your device**.
2. Upload **places-portal-overview.vtpk** and choose the available action to publish it as a **hosted vector tile layer**. Menus depend on your Portal version and permissions.
3. Use a unique item/service name, such as `Places_MyArea_20261021_Tiles`. Wait for publication/cache import to finish.
4. Open the vector tile item in **Map Viewer**. Go inside your downloaded area and check overview counts and individual icons as you zoom.
5. Copy the item's actual service URL ending in **`/VectorTileServer`**.

Example:

```text
https://portal.example.com/server/rest/services/Hosted/Places_MyArea_20261021_Tiles/VectorTileServer
```

Both services must come from the **same prepared release**. Do not infer URLs from filenames; copy them from the published items.

## 4. Share and connect the two services

1. Share **both service items** with the intended experience audience. Restricted services need an authorized ArcGIS sign-in; anonymous viewers need access to both services.
2. In Experience Builder, open **Nearby Places · Overture** and enable **Offer Places layer**.
3. Select **ArcGIS Portal (recommended)**.
4. In **Vector tile service URL**, paste the `VectorTileServer` URL.
5. In **Place query layer URL**, paste the numeric `FeatureServer` layer URL.
6. Click **Test connection**. Confirm the connected release matches your download.

The connected release name, such as `2026-10-21.0`, comes from the Overture data's `data_release`; it is not an app version.

Configure each responsive widget instance you publish. Desktop and mobile layouts may use different instances/settings. The app's normal Portal authentication must already be configured; never paste a token into these fields.

**No Builder access?** Update the correct widget instance's `config` object in the compiled app's served configuration, then redeploy it:

```json
{
  "enablePlaces": true,
  "placesSource": "portal",
  "placesPortalTilesUrl": "https://portal.example.com/server/rest/services/Hosted/NEW_TILES/VectorTileServer",
  "placesPortalQueryUrl": "https://portal.example.com/server/rest/services/Hosted/NEW_QUERY/FeatureServer/0"
}
```

Back up the served configuration and preserve its other properties. Exported apps differ, so check which config file the browser actually loads. Editing widget-source `config.json` alone does not change a compiled app. These per-instance values do not belong in `manifest.json`.

## 5. Check before publishing the experience

In the preview and final app:

- Enable Places inside your downloaded area. Check overview counts, close-zoom icons and selection.
- Try categories, a minimum confidence, closed-place filtering and a known text search. Search includes matches beyond the first 200; **Load more** fetches another batch.
- Open place details, nearby imagery and a field-note draft. Note saving remains an explicit action.
- Check the actual phone/mobile layout and 2D/3D views you offer, using an ordinary viewer account. Test signed-out access too if the app is public.

Portal's **Closest first** sorts the returned batch; it does not guarantee the nearest 200 across the entire area. Dense icons can be hidden by collision handling; filter or zoom in. Places names remain in the panel so they do not crowd the map.

When the new pair works, publish the experience. Then run the `mark-published` command in the [update guide](area-maintenance.md#update-your-data-later). Keep the previous pair for rollback.

For an error, open [troubleshooting](troubleshooting.md). Field/schema and package internals are in the [developer reference](../development/places-packages.md); they are not extra normal publishing steps.
