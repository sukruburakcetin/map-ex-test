# Nearby places · Overture pilot (v6.36)

Places is optional map context, independent of Mapillary coverage, sequence highlighting, traffic signs, objects and panorama overlays. Both the author setting and user layer start off. No service construction, Places request, timer or graphics allocation occurs while off. Only enable it after publishing a small, reviewed area of interest.

## Prepare Enterprise data

Follow [the exporter and Enterprise publishing workflow](../tools/overture_places/README.md). This prepares GeoJSON plus a release manifest outside Experience Builder; publishing is an explicit administrator operation. Nothing in this change uploads data or changes your portal. Configure the resulting HTTPS `/FeatureServer/<layer index>` URL in widget settings and enable **Offer Places layer**. Users then turn on **Nearby places** in the control rail. Existing ArcGIS authentication handles private services; never embed tokens in the configured URL.

The pilot includes curated health, education, parks, landmarks and everyday-service categories. Inspect the mapping in the exporter against each release. Its current schema uses `basic_category` and `taxonomy`, not the removed `categories` property. Confidence >=0.95 is an existence threshold, not a guarantee of positional accuracy or a correct entrance. Duplicate or outdated places may remain. Preserve Overture/source license notices, stable GERS IDs and the dated release.

## Interaction and scheduling

Places appear at zoom 15 and closer. This is a pilot density/performance policy, independent of Mapillary's object/sign interaction thresholds. Category filters and loading/error messages appear in a compact panel. Closing the filters leaves the layer on; the Places control turns it off. Hover shows a name; selecting a point opens source details, a safe website link when available, and an explicit **Explore nearby imagery** action. The first search checks at most 40 Mapillary candidates within 75 metres. It shows the distance and requires a separate Open click before using existing image/sequence loading. If empty, a separate Search farther button offers a 250-metre search (again capped at 40 results); it never widens automatically. Ranking covers only the returned page, not every Mapillary image. Camera headings now rank facing images (within 35 degrees) first, using 15-degree angle bands and then distance; panoramas follow, then unknown direction, sideways and away-facing fallbacks. The matching computed heading/position pair is preferred when available; otherwise the original pair is used. Very close points (under 3 m) have uncertain bearing. Labels describe direction estimates, never confirmed visibility. Both original and computed positions, when available, must lie within the chosen radius. The displayed distance conservatively uses the larger of those distances. A nearby image may not show the place or its entrance. A panorama is turned toward the place after opening only when the loaded image reports panorama/heading metadata and the current selection/viewer still matches. Flat images are not rotated; failed or missing orientation leaves the opened image usable. This adds heading fields to the existing request, not another network search.

The service FeatureLayer is query-only and never added to the map. One owned GraphicsLayer below the Mapillary layers displays up to 200 points. Direct hits on visible Places markers open local details before sequence/coverage/object picking. Route/annotation modes, shared notes and point-cloud tools retain priority. Places reuses the existing hover/click hit-test path; clicks outside its markers continue through normal Mapillary picking. Enabling Places adds bounded querying/rendering/hit-test work; it cannot honestly be described as free.

Updates wait for a stationary map, a 650 ms debounce and an idle callback. Loading imagery, playback, fullscreen imagery, a hidden document or a closed widget pauses optional work. Foreground activity aborts optional requests and obsolete results cannot replace current data. Already-displayed Places details remain clickable during imagery loading or playback; this local popup does not start a Places request. One unsettled transport occupies the controller's request slot even if it ignores cancellation. Requests time out after 12 seconds, with manual retry and no automatic retry loop. Previous displayed points remain during an update, except when hidden below the zoom threshold, changing category/view, or turning the layer off.

The cache holds at most six entries, charged against an **estimated** 512 KiB retained-payload budget. Entries expire on revisit after two minutes; there is no background refresh. Displayed SDK graphics, response objects and SDK/network buffers are outside that estimate. The layer requests a maximum of 200 records; configure Enterprise's record cap and field lengths as described in the publishing workflow. Large or unbounded custom services are outside this pilot contract.

## Validation and deployment limits

Controller tests cover zero activity while off, debounce, busy gating, abort-ignoring transports, stale results, zoom, category/view changes, cache budgets, timeout, retry and disposal. Adapter tests verify query-only service ownership, bounded query parameters, text-only popup content and cleanup. Export tests check schema mapping, bounding boxes, release validation, output deduplication and SQL over a local Parquet fixture. The SQL fixture substitutes geometry functions; it is not a live cloud extraction.

This environment could not download DuckDB spatial/httpfs extensions (extension host returned HTTP 403). Install them from an allowed official extension host in your publishing environment before running the real export. No live Enterprise service has been published or benchmarked here.

Before production rollout, measure the same AOI with Places off/on on a representative phone and desktop: click-to-image, hover latency, playback stalls, request count and memory during sustained browsing in 2D/3D. Test sharing/authentication, source attribution, empty areas, service errors, limited results and switching map views. These measurements are necessary to quantify real deployment overhead.

References: [Overture Places](https://docs.overturemaps.org/guides/places/), [getting data](https://docs.overturemaps.org/getting-data/), [attribution](https://docs.overturemaps.org/attribution/).


## Persistent place selection (v6.45)

Clicking a place keeps one selection ring and a compact name/category card after the details popup closes, including when imagery opens. The card is integrated into the filters while those are open and remains as a separate compact card when they close. Click the name to reopen details; Clear removes the selection and its owned popup/search. The selection survives viewport queries, zooming out below the normal Places density threshold, and a direct 2D/3D view rebind. Turning Places off, changing its service URL, or choosing a category that excludes it clears selection. No local-storage persistence is added.

**Show camera link** is optional and starts off. It connects the current loaded camera coordinate to the selected place with one dashed line. It is a spatial relationship, not a route, sightline analysis or evidence that the place is visible. The line updates only from existing image events; one retained line is reused. Neither selecting a place nor drawing the link adds a query, timer or animation loop. Selection retains one place outside the viewport's 200-record page and one ring plus at most one link graphic. Changing to a new active map transfers this tiny overlay and removes the old layer.

Overture's [Places guide](https://docs.overturemaps.org/guides/places/) and [place schema](https://docs.overturemaps.org/schema/reference/places/place/) document category taxonomy/basic categories for map iconography, not an official icon asset pack. This integration keeps its existing dots. A local SVG symbol set could later map those categories without remote icon requests; such icons would be application styling, not Overture-supplied data.


## Bundled category icons and stronger selection (v6.46)

The five pilot groups now use application-owned SVG badges: a medical cross, book, tree, museum and shop. Unrecognized groups use a generic place pin; data-provided category strings never become SVG markup. Icons are data URLs generated from static local strings, with no external font, icon CDN or remote image requests. Regular icons are 16 CSS px (12 ArcGIS points), and the selected badge is 28 CSS px (21 points), with a gold fill, dark halo and category glyph. The selected card repeats the category icon. No pulsing or animation is added.

The adapter reuses the first SDK-autocast picture symbol per category for subsequent records and viewport updates; it releases this bounded cache on disposal. The screen-space click footprints match the larger presentation: 9 CSS px for normal markers and 14 px for selection. The existing single selection graphic is reused rather than adding another halo graphic. Selection/link behavior, data queries and sequence loading are unchanged. Picture-marker decoding/rendering adds a small bounded local cost compared with plain dots; live mobile rendering should still be checked in dense areas.

These are application symbols, not an official Overture icon set. Health means a general health category; the cross is not an emergency-service guarantee.


## Camera link contrast (v6.47)

The optional camera link now uses cyan dashes (the existing 1.25 pt width/dash style) over a thin dark solid underlay (2.5 pt). Both strokes reuse their graphics on image changes and toggle off together. The selected badge stays above the strokes. This adds just one underlay Graphic while the link is used, with no extra network, timer or animation work. The overlay budget is now one selected badge plus two link strokes; a camera link still does not assert visibility or routing.


## Loaded places list and camera distance (v6.48)

**Browse places** is collapsed initially. It shows only the already-loaded map results, sorted alphabetically. Local search matches name/category; paging renders four rows at a time rather than 200 DOM rows. Selecting a row uses the existing selection/details path and does not fetch more places or open imagery automatically. Limited results remain labelled by the existing 200-record message. The panel scrolls within its available height on short viewers. Below the Places zoom threshold or after clearing a viewport/category, the list is cleared/hidden along with normal points; a persistent selected place may remain independently.

The selected-place summary shows the approximate straight-line distance to the current loaded image's camera coordinate. Both the integrated filter summary and compact selected card show it. Existing image events update the label; there is no metadata request, timer or polling. Equal formatted distances do not cause another label-state update. Without a loaded camera position the card says to open an image. Distance is not walking distance and does not establish visibility. The list reuses references to the bounded loaded records rather than duplicating records or introducing another query/cache.


## Imagery choices and capture dates (v6.49)

A POI imagery search now offers up to three unique image IDs from the same bounded 40-record page. Every option shows its direction estimate, distance and capture date; missing/invalid timestamps say Capture date unknown. Ranking retains direction bands and distance, using recency only to break equal rank/distance ties. Results may be adjacent images from the same sequence; this is not an exhaustive best-view search.

The existing request adds `captured_at`. There are no additional searches, thumbnail downloads or automatic image opens. The first result and alternatives each require an explicit Open click. The 75 m initial search, explicit 250 m expansion, timeout, cancellation and original/computed-coordinate checks remain. Closing/replacing the popup makes old option buttons inert. Dates are displayed using the browser locale with UTC capture day to avoid timezone day shifts.


## Scoped Places popup styling (v6.50)

The Places popup uses the widget's dark green palette, a prominent place name, category badge, mint primary imagery action, compact alternative actions, muted metadata and a separated source footer. The style applies only to `.mly-place-popup` and an SDK popup shell containing that owned content (`:has`). ArcGIS/Calcite color variables are scoped to the same shell. Other feature, note and map popups retain their normal theme. Native popup controls and actions remain available.

The theme uses no assets, requests or new SDK modules. Names/addresses/websites/options continue to use safe DOM text and validated links. Keyboard focus remains visible and the small hover transition respects reduced motion. Popup wrapping and full-width buttons avoid horizontal overflow on narrow layouts. Shell compatibility should be checked against the deployed SDK; browser checks use an SDK-shaped local harness rather than a live portal.


## Neutral imagery buttons (v6.51)

Removes the v6.50 popup shell, Calcite token, content, category, link and footer theme. Only the imagery buttons are styled: neutral light backgrounds, subtle borders, compact full-width layout, hover/disabled states and keyboard focus. The SDK's normal popup header/content appearance is restored. Refresh and reopen the popup so an already-open v6.50 DOM stylesheet is replaced.


## Published extent feedback (v6.52)

The query-only service's normal first eligible load provides `fullExtent`. A wholly non-overlapping viewport then shows Outside this layer’s published Places area and an explicit Go to covered area button. That first outside load skips querying features; later outside pans use the retained metadata without querying or reloading it. No metadata request is added while Places is off or waiting below the normal zoom threshold. If metadata has not loaded yet, ordinary zoom/idle instructions remain.

The button fits padded extent corners through the existing guarded map navigation path and never navigates automatically. A large extent may fit below zoom 15; the existing zoom-closer instruction then applies. Normal POI markers/list are hidden outside, while a selected place may persist. Returning inside resumes the existing cache/query flow. Metadata errors retain normal error handling; missing, unsupported or invalid extents do not invent an outside classification. Geographic and Web Mercator metadata are supported.

`fullExtent` is the layer's bounding envelope, not the export AOI polygon or guaranteed complete coverage. Partial overlap, touching edges, holes between points and category-empty areas remain normal queries/zero results. Metadata can be stale after republishing; reload the app after updating the hosted dataset. No per-pan extent query or secondary feature-count query is introduced.
