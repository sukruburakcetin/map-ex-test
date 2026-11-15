# External Places service contract

In **External Places service** mode, the widget accepts one credential-free HTTPS service base, such as `https://maps.example.com/places`, in `placesApiUrl`. `enablePlaces` offers the tool; activation remains an explicit viewer action. Configuration and hosting steps belong to the [administrator guide](../places/external-service.md).

Do not put endpoint suffixes, credentials, query strings or fragments in the configured base. A standalone vector style, FeatureServer or VectorTileServer URL does not supply this API. A path prefix must survive every metadata, filter, tile and search request.

## Routes

| Method / route relative to base | Contract |
|---|---|
| GET `/health` | Database readability, readiness and release; HTTP 503 when unavailable. |
| GET `/status` | Dataset metadata, capabilities, bbox, release and count; optional storage diagnostics. |
| GET `/style.json` | ArcGIS-compatible vector style with public tile/sprite references. |
| GET `/tiles/{z}/{x}/{y}.pbf` | Native vector tiles; helper supports zoom 12–22. |
| GET `/sprites/places.json`, `.png` and `@2x` variants | Shared icon atlas and metadata. |
| POST `/query` | Spatial pick/hover candidates, at most 32; explicit truncation. |
| POST `/search` | Area text search, ranked before slicing, at most 200 results per batch. |

The service also accepts unprefixed routes for proxies that strip a configured prefix. Config `public_url` controls advertised links, not listener binding or TLS. Config `host` defaults to `127.0.0.1`; TLS certificate/key paths and app origins are supplied in the same file. Persistent serving opens SQLite read-only and never imports source records at startup.

## Capability handshake

`/status` publishes `category_filter_version`, `paging_version`, `scale_display_version` and `text_search_version`, each `1`, plus `supported_icon_families` containing every category in `src/features/places/tileCategories.ts`, and a valid WGS84 bbox within Web Mercator latitude bounds. It also publishes `ready`, `count`, `release`, `style`, `query` and `search`. The client validates version fields, family support and extent through `placesApi.ts`; missing or incompatible metadata prevents activation.

Test connection is a separate explicit metadata request. Saving configuration or leaving Places off does not start source loading. Requests omit credentials; authenticated private-service access requires a separate integration.

## Query and response

POST JSON includes `geometry`: an envelope with `xmin`, `ymin`, `xmax`, `ymax` and `spatialReference` (`wkid:4326` or the helper's supported Web Mercator reference). Picking also supplies rendering `zoom` so overview count symbols and candidates agree.

Search additionally accepts `origin: {lon,lat}`, `offset` and `text`. Offsets are multiples of 200 within the helper's supported range. Origin is the selected-image location, or map center, captured for that search. Text is trimmed and bounded to 120 characters by the widget. Filtering and text matching occur before ranking and page slicing; results are not restricted to the already loaded batch.

Responses contain `features` with `attributes` and point `geometry`, `exceededTransferLimit`, and search `offset`. The widget rejects oversized responses or a mismatched search offset. An exact batch of 200 or 32 candidates is usable when the explicit truncation flag is false.

Individual attributes include `gers_id`, `place_name`, `category`, `icon_group`, `confidence`, `operating_status`, `address`, `website` and `data_release`. Preserve GERS identity across tile, query and list responses. Unknown categories and missing confidence remain valid. Overview aggregates include `cluster_count`; they are not normal individual-place records.

## Shared filters and display

Filter query parameters are `family`, optional `min_confidence` (0–1) and `hide_closed=1`. Apply identical predicates before all tile, pick and list limits. All scores omits the confidence predicate; a threshold excludes missing scores. Closed filtering removes only explicit permanent closure.

The helper displays aggregate counts at overview zooms, individual icons from zoom 15 and names from zoom 17. Collisions can hide symbols without removing source records. Picking is bounded proximity selection, not proof that a particular icon was rendered. A truncated candidate response requires zooming in.

The current regional importer has a 100,000-record input ceiling. It persists the spatial/category indexes in a new SQLite file; the configured service opens that file read-only. A direct in-memory helper remains available for disposable tests. That limit is separate from the browser's bounded request batches. It is not a national-service capacity claim. See [architecture](places-architecture.md) and [testing](places-testing.md).

For multiple configured app origins, responses reflect only a matching exact origin and include `Vary: Origin`. CORS does not authenticate requests. Service workers are bounded to 16 and socket waits to 15 seconds; deployment still needs a suitable supervisor/proxy and capacity testing.

Portal mode uses a separate [publishing and schema contract](../places/portal-administrator-guide.md); its URLs are not passed to this external API.

## Import an existing export

The saved-area external `refresh` already imports its database. For an existing unfiltered GeoJSONL/manifest pair, import once into a new file:

```sh
python tools/overture_places/places_service.py import --input examples/places/places-indianapolis.geojsonl --database data/places-example.sqlite
python tools/overture_places/places_service.py inspect --database data/places-example.sqlite
```

Keep matching basenames and attribution. Existing database files are refused. Atomic publication requires a filesystem with hard-link support; verify network/cloud-sync mounts before using them. SQLite R-tree support is required. The included sample has 7,089 records and is not a current coverage claim.

## Hosting reference


`localhost` means the device opening the app. A phone cannot use your desktop's `https://localhost:3444`. Host the service at an HTTPS address reachable by the viewer.

A simple deployment uses the service plus an HTTPS reverse proxy on the same host:

```text
viewer → https://maps.example.com/places → reverse proxy → https://localhost:3444
                                                                ↓
                                                        read-only SQLite
```

Copy the tool directory and your completed SQLite database to the host. Keep the previous database for rollback. Configure the host's service file with:

- `database`: its local SQLite path.
- `public_url`: `https://maps.example.com/places` (the externally visible service base).
- `origins`: the actual published app and, if needed, builder origin.
- `host`: `127.0.0.1` behind a same-host proxy; `port`: the local upstream port.
- `tls`: a trusted upstream certificate/key valid for `localhost`.

Start with `python /srv/places/tools/overture_places/places_service.py serve --config /srv/places/places-service.json`, substituting your installation paths. `public_url` controls advertised links; it does not register DNS, create certificates or change the bind interface. To serve directly on a network interface instead, configure an appropriate IPv4 `host`, trusted domain certificate and firewall; validate the resulting HTTPS endpoint from another device.

Example Nginx location inside an existing TLS server block for `maps.example.com`:

```nginx
location /places/ {
    proxy_pass https://localhost:3444;
    proxy_ssl_server_name on;
    proxy_ssl_name localhost;
    proxy_ssl_verify on;
    proxy_ssl_trusted_certificate /etc/nginx/places-upstream-ca.pem;
    proxy_set_header Host $proxy_host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This is a routing example, not a complete proxy/certificate installation. The CA file must validate the service's upstream certificate and hostname; do not disable verification. Preserve the entire prefix, GET/POST/OPTIONS, request bodies and filter query strings. Let the service set CORS headers; avoid conflicting proxy duplicates. Filtered/multi-origin responses use `Vary: Origin`; no public CDN cache policy is introduced here.

Validate from a second device: `/places/health`, `/places/status`, public style/sprite/tile links, and actual picking/search in the app. Configure the widget with `https://maps.example.com/places`. The current style also uses ArcGIS-hosted font glyphs; hosting the API alone does not make all map resources self-contained.

For sustained hosting, run the command under your platform's process supervisor, retain database/config backups, monitor health/logs, and configure proxy resource/rate limits for your audience. The service currently limits simultaneous workers to 16 and socket waits to 15 seconds; SQLite reads are serialized. Measure realistic regional workloads before increasing scope. This package does not provision a host, promise zero downtime or establish national-scale throughput. No separate database server is needed for this phase.

The widget uses credential-free Places requests. CORS is not authentication: private authenticated service access needs an intentional client/server integration, not a secret token in a public URL.

