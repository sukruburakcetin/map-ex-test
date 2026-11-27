# Overture roads for Analyze Coverage

This proof of concept queries Overture Transportation GeoParquet by map extent. It uses the road query format already sent by Mapillary Explorer, so the widget needs no new runtime dependencies. Deploy one shared service for the published experience.

## Start the service

Extract the service archive on the service host and install Python and DuckDB there. DuckDB needs network access to its extension repository and Overture’s public release bucket.

```sh
python -m pip install -r requirements.txt
python roads_service.py --release YYYY-MM-DD.0 --origin https://maps.example.org
```

When working directly from the repository, use `tools/overture_places/requirements.txt` and `tools/overture_roads/roads_service.py` for those two commands.

Choose a published Transportation release and use the exact origin of your Experience Builder app. Repeat `--origin` for multiple approved origins. The process listens on `127.0.0.1:8766`. Expose it through your host’s HTTPS reverse proxy. Forward `/api/interpreter` and, if needed for monitoring, `/health`. Put request limits at the proxy for public deployments. The browser origin allowlist controls browser access and does not authenticate callers.

In Builder, set **Coverage defaults → Road data source → Coverage road service URL** to the exposed HTTPS URL ending in `/api/interpreter`.

## Test with local Experience Builder on Windows

From the widget folder, run this using the certificate and key from your trusted local Experience Builder server:

```bat
python tools\overture_roads\roads_service.py --release YYYY-MM-DD.0 --origin https://localhost:3001 --cert "..\..\..\..\server\cert\server.cert" --key "..\..\..\..\server\cert\server.key"
```

Keep the terminal open. Wait for **Overture road service ready**, then open `https://localhost:8766/health` in the same browser and check that the release JSON appears. Set **Coverage defaults → Road data source → Coverage road service URL** to `https://localhost:8766/api/interpreter`. Reload the experience and run **Analyze Coverage** on the map area. If startup stops while loading DuckDB or opening the release, read the terminal error before testing the widget.

## Acceptance

Start with the Atlanta extent that timed out. From the published experience, verify that a cold **Analyze Coverage** run yields classified streets. Check one street with known imagery and one without imagery under the active filters. Repeat the test on a dense area and record request duration, response size, and error rate before using this as a production source. For a larger local test, add `--max-roads 8000` to the service command. The default is 4,000 features per request and the 100,000-vertex limit still applies. The terminal prints query start, slot release, and result size and timing. If DuckDB stalls, the service stops its query worker at the request deadline and returns HTTP 504. The next request starts a fresh worker. HTTP 503 with a five-second retry delay means the single slot is busy. Use the browser to measure time until the street result appears.

The service accepts the widget’s bounded road query. Large extents, oversized results, incomplete data, or failed reads produce explicit errors. The proof of concept reads road class from Overture and uses the classifier’s ordinary thresholds. Mapping Overture direction restrictions to one-way thresholds is pending. Honor the applicable attribution and licensing for the release and its source data. [Overture Transportation guide](https://docs.overturemaps.org/guides/transportation/) · [Overture attribution](https://docs.overturemaps.org/attribution/)
