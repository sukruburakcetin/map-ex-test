# Nearby places · Overture pilot (v6.36)

Places is optional map context, independent of Mapillary coverage, sequence highlighting, traffic signs, objects and panorama overlays. Both the author setting and user layer start off. No service construction, Places request, timer or graphics allocation occurs while off. Only enable it after publishing a small, reviewed area of interest.

## Prepare Enterprise data

Follow [the exporter and Enterprise publishing workflow](../tools/overture_places/README.md). This prepares GeoJSON plus a release manifest outside Experience Builder; publishing is an explicit administrator operation. Nothing in this change uploads data or changes your portal. Configure the resulting HTTPS `/FeatureServer/<layer index>` URL in widget settings and enable **Offer Places layer**. Users then turn on **Nearby places** in the control rail. Existing ArcGIS authentication handles private services; never embed tokens in the configured URL.

The pilot includes curated health, education, parks, landmarks and everyday-service categories. Inspect the mapping in the exporter against each release. Its current schema uses `basic_category` and `taxonomy`, not the removed `categories` property. Confidence >=0.95 is an existence threshold, not a guarantee of positional accuracy or a correct entrance. Duplicate or outdated places may remain. Preserve Overture/source license notices, stable GERS IDs and the dated release.

## Interaction and scheduling

Places appear at zoom 15 and closer. This is a pilot density/performance policy, independent of Mapillary's object/sign interaction thresholds. Category filters and loading/error messages appear in a compact panel. Closing the filters leaves the layer on; the Places control turns it off. Hover shows a name; selecting a point opens source details, a safe website link when available, and an explicit **Explore nearby imagery** action. The action checks at most 40 Mapillary candidates within 250 metres and uses existing image/sequence loading. A nearby image may not show the place or its entrance.

The service FeatureLayer is query-only and never added to the map. One owned GraphicsLayer below the Mapillary layers displays up to 200 points. Existing Mapillary picking takes priority; Places reuses the existing hover/click hit-test path. Enabling Places adds bounded querying/rendering/hit-test work; it cannot honestly be described as free.

Updates wait for a stationary map, a 650 ms debounce and an idle callback. Loading imagery, playback, fullscreen imagery, a hidden document or a closed widget pauses optional work. Foreground activity aborts optional requests and obsolete results cannot replace current data. One unsettled transport occupies the controller's request slot even if it ignores cancellation. Requests time out after 12 seconds, with manual retry and no automatic retry loop. Previous displayed points remain during an update, except when hidden below the zoom threshold, changing category/view, or turning the layer off.

The cache holds at most six entries, charged against an **estimated** 512 KiB retained-payload budget. Entries expire on revisit after two minutes; there is no background refresh. Displayed SDK graphics, response objects and SDK/network buffers are outside that estimate. The layer requests a maximum of 200 records; configure Enterprise's record cap and field lengths as described in the publishing workflow. Large or unbounded custom services are outside this pilot contract.

## Validation and deployment limits

Controller tests cover zero activity while off, debounce, busy gating, abort-ignoring transports, stale results, zoom, category/view changes, cache budgets, timeout, retry and disposal. Adapter tests verify query-only service ownership, bounded query parameters, text-only popup content and cleanup. Export tests check schema mapping, bounding boxes, release validation, output deduplication and SQL over a local Parquet fixture. The SQL fixture substitutes geometry functions; it is not a live cloud extraction.

This environment could not download DuckDB spatial/httpfs extensions (extension host returned HTTP 403). Install them from an allowed official extension host in your publishing environment before running the real export. No live Enterprise service has been published or benchmarked here.

Before production rollout, measure the same AOI with Places off/on on a representative phone and desktop: click-to-image, hover latency, playback stalls, request count and memory during sustained browsing in 2D/3D. Test sharing/authentication, source attribution, empty areas, service errors, limited results and switching map views. These measurements are necessary to quantify real deployment overhead.

References: [Overture Places](https://docs.overturemaps.org/guides/places/), [getting data](https://docs.overturemaps.org/getting-data/), [attribution](https://docs.overturemaps.org/attribution/).
