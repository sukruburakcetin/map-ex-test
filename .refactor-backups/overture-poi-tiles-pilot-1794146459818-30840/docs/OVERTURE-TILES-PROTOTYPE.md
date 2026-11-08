# Overture POI tile feasibility prototype

This opt-in development harness renders an ArcGIS-compatible vector tile style without constructing a POI GraphicsLayer. It is a feasibility test, not a replacement for Nearby Places. No new widget dependency, automatic download, or production service is enabled. The local test server can render category sprites from a shared atlas; the Enterprise style remains authored separately.

For the export, ArcGIS Pro import and service publication steps, see [the Enterprise 12.1 workflow](OVERTURE-ENTERPRISE-12.1.md).

For home testing without ArcGIS Pro or Enterprise access, use [the local test server](OVERTURE-LOCAL-TEST.md).

## Run

Publish a small test area before testing nationwide data. Supply two HTTPS endpoints from the **same Overture release and area**:

1. An ArcGIS-compatible vector tile style/service using sprite symbols and retaining POI positions. Configure attribution, zoom visibility and collision rules in the published style. A PMTiles archive URL is not an interchangeable endpoint.
2. A queryable ArcGIS FeatureServer layer with point geometries and `gers_id`; `place_name` supplies the preview name. Publish all source categories and confidence values for a complete-data experiment. The current curated pilot export is insufficient for this purpose.

Open the browser console with the widget and map ready:

```js
const controls = window.__mlyPlacesTiles;
Object.keys(controls); // widget IDs
const prototype = controls[Object.keys(controls)[0]];
await prototype.start(
  'https://YOUR-HOST/VectorTileServer/resources/styles/root.json',
  'https://YOUR-HOST/FeatureServer/0'
);
// Click near a symbol to open its name. Restore normal click handling:
prototype.stop();
```

Use trusted endpoints. They need appropriate CORS/access configuration. Keep the existing Nearby Places overlay off during comparison. Test mode owns map clicks; stop it before normal imagery exploration. Changing the widget's map view, closing it, or unmounting stops the experiment.

## Picking and limits

ArcGIS native tile rendering remains independent of picking. On click, a 24-pixel screen box is projected to map coordinates and queried with `where: 1=1`, requesting at most 32 candidate records. The nearest candidate within 12 screen pixels opens a plain-text popup. The Enterprise harness applies no confidence/category filtering. The local harness has an optional confidence control applied consistently to tile and query requests. Neither path performs full-bbox paging, pointer-move fetching or persistent candidate caching. Map movement and subsequent clicks cancel stale work.

This is **proximity picking**, not tile-symbol hit testing. Collision-hidden places can be selected; ties and dense areas remain an interaction design issue. Truncated candidate sets are rejected with a console message rather than selecting an arbitrary result. No cluster interaction or complete-result listing is implemented. The details service must honor the request limit; deployment validation must check that explicitly.

The current popup displays a name only; the existing imagery/details workflow is not connected. It does not create a selection graphic. No claim of production 2D/3D correctness or performance is made from unit tests.

## Acceptance checks before adopting

- In both MapView and SceneView, verify sprite placement, terrain projection, click alignment, overlap behavior, attribution and service compatibility.
- Compare identical areas with the harness off/on on a low-memory phone: browser memory, responsiveness, frame pacing, network bytes and repeated pan/zoom behavior.
- Verify cancellation on movement, rapid clicks, view replacement, widget close and service errors.
- Test a dense area: truncated picking must request zooming rather than choose an incomplete result.
- Check a low-confidence and uncategorized record are present in the published backend and eligible for picking. Data missing from the backend cannot be recovered by removing runtime filters.
- Keep tile and detail releases coordinated. Define low-zoom aggregation and complete-search/download behavior separately before national deployment.

The next infrastructure step is a versioned tile/details publishing pipeline from unfiltered GeoParquet, with a small reproducible test area first. The test-area exporter and ArcGIS Pro importer are available in `tools/overture_places`; this repository does not yet provide a national ingestion pipeline or host those services. Do not use Overture Explorer's demonstration PMTiles as a production backend.
