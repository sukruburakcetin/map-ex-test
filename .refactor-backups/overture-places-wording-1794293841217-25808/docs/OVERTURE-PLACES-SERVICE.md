# Configure the Overture Places vector service

Places remains optional context for Mapillary exploration. All configured POI rendering now uses native vector tiles. The same service supplies bounded picking, details and paged text search. There is no FeatureServer-only rendering fallback in the configured widget.

## Local test without console commands

1. Start the existing development server:

   ```sh
   python tools/overture_places/serve_places_local.py --input places-all.geojsonl
   ```

2. In widget settings, find **Nearby Places · Overture**.
3. Enable **Offer Places layer** and enter **Places service URL**:

   ```text
   https://localhost:3444
   ```

4. Click **Test connection**. This explicitly requests metadata and checks the protocol, extent, filters, paging and text-search capabilities. Success can display the dataset count and release.
5. Save/publish or preview the application. Click Places in the viewer toolbar.

No console startup is required. Saving the URL or opening the app does not automatically enable the layer or fetch data. The viewer's explicit Places action starts it. The builder connection test is a separate, intentional metadata request.

The service certificate must be trusted by the browser, and its CORS origin must match the builder/published app. For another app origin, pass `--origin https://your-app.example` to the development server. Do not bypass HTTPS certificate checks.

## Saved widget configuration

```json
{
  "enablePlaces": true,
  "placesApiUrl": "https://maps.example.com/places"
}
```

These are widget configuration properties, not manifest metadata. `enablePlaces` offers the tool; it does not restore viewer activation on page load. Use a base HTTPS service URL without credentials, query parameters or a fragment. Do not supply `/style.json`, `/query`, `/status`, a FeatureServer URL or a VectorTileServer URL.

Builder authors edit these values in settings. A compiled-app administrator edits the same widget configuration object in the file the deployed application actually loads, then redeploys/invalidates its configuration cache. Export layouts vary: do not assume that changing the widget's source `config.json` updates an already-exported application instance. Locate its widget ID and existing `enablePlaces` property in the loaded application configuration, or inspect the app's configuration requests. Do not modify `manifest.json` for this purpose.

## Service contract and URL prefixes

For `https://maps.example.com/places`, the adapter uses:

- `GET /places/status`: protocol capabilities, published bbox, optional record count and release.
- `GET /places/style.json`: the vector style, with its tile and sprite references.
- `POST /places/query`: at most 32 pick candidates; truncation is explicit.
- `POST /places/search`: at most 200 matches per page, ranked before slicing; supports origin, offset and text.

The status response must advertise version 1 for `category_filter_version`, `paging_version`, `scale_display_version` and `text_search_version`, all supported icon families, and a valid Web Mercator-compatible geographic bbox. The widget validates the same metadata for builder testing and source startup. These routes describe our Places API contract; an arbitrary third-party tile URL is not enough to provide search and picking.

Path prefixes are retained during metadata, filter and list requests. For a prefixed development test:

```sh
python tools/overture_places/serve_places_local.py --input places-all.geojsonl --public-url https://localhost:3444/places
```

Then configure `https://localhost:3444/places`. The helper serves the prefixed routes and advertises matching URLs; it also accepts unprefixed routes when a reverse proxy strips the prefix. `--public-url` controls advertised links, not the listening interface or TLS certificate.

The service must be reachable from the viewer browser. This initial adapter uses credential-free requests and does not add a private-service authentication flow. No credentials should be embedded in public widget configuration.

## Migration and retained behavior

The old `placesServiceUrl` field is recognized only to display a migration message. It is not reinterpreted as a tile service or used to fetch/render POIs. Enter the new API root under `placesApiUrl`; the application does not publish or convert old FeatureServer data automatically.

Category/quality controls, scale-aware summaries, closest-first pages, full-area text search, selection, hover, imagery, camera links and all note destinations reuse the existing vector workflow. Service startup is revision guarded: disabling, URL changes, map replacement and widget closure cannot let an obsolete load attach later. Existing service preferences are isolated by app, widget and service path; the localhost root retains its prior preference identity.

The developer console hook remains available for explicit diagnostics. It is no longer the normal integration path. The configured workflow does not offer an unfinished ArcGIS tile/FeatureServer backend option.

## Current delivery boundary

This change implements saved configuration, protocol validation and lifecycle integration. The Python server remains a local development harness with an in-memory dataset and a 100,000-record cap. It is not being relabeled as a production deployment. The next backend phase is a separately packaged service with durable indexed storage and documented import/update/start operations. No PostGIS, managed database or new hosting subscription is introduced here.

Checks cover metadata/URL validation, root and prefixed routes, explicit builder testing, no requests while off, startup cancellation, failure retry, URL/map replacement, migration feedback and preference scoping. Full Experience Builder compilation, published HTTPS hosting and live 2D/3D interaction must still be verified in the target environment.
