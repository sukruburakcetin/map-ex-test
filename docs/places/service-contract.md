# External Places service contract

In **External Places service** mode, the widget accepts one credential-free HTTPS service base, such as `https://maps.example.com/places`, in `placesApiUrl`. `enablePlaces` offers the tool; activation remains an explicit viewer action. Configuration and hosting steps belong to the [administrator guide](administrator-guide.md).

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

The current regional importer has a 100,000-record input ceiling. It persists the spatial/category indexes in a new SQLite file; the configured service opens that file read-only. A direct in-memory helper remains available for disposable tests. That limit is separate from the browser's bounded request batches. It is not a national-service capacity claim. See [architecture](architecture.md) and [testing](testing.md).

For multiple configured app origins, responses reflect only a matching exact origin and include `Vary: Origin`. CORS does not authenticate requests. Service workers are bounded to 16 and socket waits to 15 seconds; deployment still needs a suitable supervisor/proxy and capacity testing.

Portal mode uses a separate [publishing and schema contract](portal-administrator-guide.md); its URLs are not passed to this external API.
