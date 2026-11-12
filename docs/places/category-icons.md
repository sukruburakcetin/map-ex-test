# Category icons for Portal vector tiles

The native Pro package uses category-colored circles. A successful connection validates the data contract; it does not add icon artwork. The offline styling tool embeds the same category atlas used by the external Places service, at normal and double pixel density.

From the widget root, after restoring the complete native package and configuring its query URL:

```sh
python tools/overture_places/style_places_vtpk.py --input data/places-portal-full/places-portal-v2.vtpk --output data/places-portal-full/places-portal-icons.vtpk
```

Use your actual restored input filename if different. Ordinary Python is sufficient; no new ArcGIS Pro export is needed. Input files remain unchanged and existing output files are refused.

Publish the new package as a separately named hosted vector tile layer and wait for publication/cache import to finish. Test it in Map Viewer, then enter its actual VectorTileServer URL in builder settings. Keep the matching FeatureServer query URL. Publishing the package changes only its hosted style resources; no widget rebuild is needed for this offline tool.

The tool changes category circle layers into collision-managed symbol layers, replaces the four native sprite resources, and retains text layers, filters, zoom bounds, source identity and query pairing. All tile bundles and unrelated resources retain their original CRC and byte count; native local/central ZIP metadata is preserved. Dense areas may hide some icons through normal collision placement. Cached min/max zoom coverage is unchanged.

Verification includes normal/retina sprite resolution, unchanged label/filter/contract checks, refusal of unsupported/already styled packages, and full uploaded-package resource verification. A local ArcGIS SDK rendering check tests extracted resources; hosted acceptance remains a separate deployment check.

## Map readability in the widget

The Portal adapter hides Places text-only style layers and removes text from combined icon/text layers at runtime. Hidden text no longer reserves collision space. Names remain available in the place selection panel. This also applies to already-published icon packages: rebuild/reload the widget, without republishing data. Basemap labels are unaffected. Icon collision handling and published zoom coverage remain in effect, so dense areas do not display every icon simultaneously; zoom or filter to reduce crowding.

For overview counts and native cache fallback at close zooms, continue with [Portal clusters and zoom coverage](portal-clusters-and-zoom.md).
