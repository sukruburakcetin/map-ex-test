# Portal clusters and Places zoom coverage

The prepared package provides native vector tile overview counts from source level 12 through 15, then individual category icons. Source levels use the service's 512-pixel grid; a map's displayed zoom can differ. The widget uses service scale information for cluster picking.

## Apply and prepare

Apply `apply-places-clusters-and-zoom.cjs` from the widget root:

```sh
node apply-places-clusters-and-zoom.cjs
```

Rebuild/reload Experience Builder for the source adapter, cluster click handling and overview visibility update. The installer backs up exact files outside the widget and refuses unknown local edits. `--dry-run` previews; `--uninstall` restores this installation if its files have not since changed.

Starting with the complete, attribute-restored, icon-styled package:

```sh
python tools/overture_places/prepare_places_portal.py --input data/places-portal-full/places-portal-icons.vtpk --source data/places-portal-full/places-package-source.geojson --output data/places-portal-full/places-portal-overview.vtpk
```

Use the exact GeoJSON that built the native package. Ordinary Python is sufficient; no Pro export is required. The tool verifies every original source ID and relevant attributes, refuses unsupported inputs, and never overwrites input or existing output. If you have only the restored package, first run the [category icon tool](category-icons.md).

Publish the new package as a separately named hosted vector tile layer, wait for cache import, then test it in Map Viewer. Use the new item's actual VectorTileServer URL in builder settings; retain the same query-layer URL. The restored query pairing/release/count contract remains intact. Filters update cluster counts in the widget; Map Viewer alone displays the package's default all-place totals.

## What changes

- Add actual aggregate features in `places_clusters`, with counts from the complete source rather than a 200-result page. Fixed 64-pixel grid cells have one owning tile per level. Duplicated native tile buffers never double-count a place.
- Preserve original point-layer protobuf bytes, geometry, IDs and attributes; append cluster layers to existing tiles and create overview-only bundles for missing levels 12/13. Keep the icon atlas and existing native ZIP header conventions.
- Store exact confidence histograms, including separate category and non-permanently-closed totals. Runtime count expressions honor category, confidence and closed-place filters. Null confidence is excluded whenever a minimum is set; scores are never rounded. Blocks of 32 score values bound expression size. Up to 8,192 distinct source scores are supported; larger histograms fail explicitly.
- Keep numbered cluster labels while removing normal place-name text layers. Cluster clicks, including count-one cells, zoom toward the cell. They cannot become field notes. Zoom to the individual icon to select the actual place/location and use notes/details/nearby imagery.
- Add a native tile index so detailed views can reuse cached parent tiles. Display levels extend to 24, while actual cached data levels remain explicit; source scale limits no longer hide the layer at street detail. This improves display continuity, not the original point coordinates' quantization precision.
- Allow bounded vector tile browsing from zoom 12 instead of the former shared zoom-15 gate. The feature/graphic-backed controller path retains its original minimum. Below the supported overview range, or outside the published region, an empty map remains expected.

The query FeatureServer continues to supply bounded records only and is never added as a FeatureLayer. No continuous viewport feature downloads or browser-wide point collection are introduced. Cluster picking reads at most four tiles per request, retains at most sixteen decoded tiles under a 512 KiB estimated JSON-size cache budget and uses the same aggregate fields as the map's count expression.

## External HTTPS service

The included external service now advertises and accepts levels 12–22. The adapter clears an inherited maximum display-scale restriction and clamps bounded picks to the same range. Restart your existing service with its existing command/configuration after applying the installer, then reload the experience. There is no data reimport or certificate change for this update. A third-party service must actually support its advertised range; the widget does not fabricate missing tiles.

## Verification and limits

Regression coverage includes exact threshold/category/status counts, binary grid/count read-back, native tile-index fallback, count-one cluster selection, unsupported cluster metadata, bounded tile picking/cache reuse, overview visibility and zoom-22 HTTP tile requests. The full uploaded dataset was verified at 7,089 source places per cached aggregate level, with the original individual layers preserved.

Local Chromium checks use ArcGIS SDK 4.33.12 and a controlled HTTP fixture. They exercise real native layer loading/rendering with overview counts and street-level icons. They do not certify Enterprise's package importer or 3D/device performance: complete the actual publication, filter/count, cluster click, 2D/3D and mobile tests on your deployment.
