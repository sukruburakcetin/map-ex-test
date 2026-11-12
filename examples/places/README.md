# Regional Places example

`places-indianapolis.geojsonl` and `places-indianapolis.manifest.json` are a matching 7,089-record regional snapshot from Overture release `2026-10-21.0`. The manifest records bbox, source and attribution. Keep the pair together. This is example data, not a current completeness or location-quality claim.

For the persistent service, follow the [import/config/start steps](../../docs/places/administrator-guide.md#6-import-once-and-start-the-https-service).

For a disposable in-memory test, from the widget root:

```sh
python tools/overture_places/serve_places_local.py --input examples/places/places-indianapolis.geojsonl
```

Use your trusted development certificate and app origin as explained in the [administrator guide](../../docs/places/administrator-guide.md). Prepare your own pinned regional export for your deployment. Preserve [Overture attribution](https://docs.overturemaps.org/attribution/).
