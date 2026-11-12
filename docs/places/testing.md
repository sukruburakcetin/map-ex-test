# Verify Places

Run tests from the widget root. Node tests require TypeScript available from the Experience Builder host or `MAPILLARY_TYPESCRIPT`; React DOM tests also require the host's compatible React, React DOM and jsdom dependencies. The repository is an Experience Builder widget, not a standalone npm app.

```sh
node --test tests/placesApi.test.cjs tests/placesConfiguredRuntime.test.cjs tests/placesVectorLayer.test.cjs tests/tilePlaceIntegration.test.cjs tests/placesTileParity.test.cjs tests/placesNoteActionIdentity.test.cjs
python tests/overtureAllPlacesExport.test.py
python tests/overturePlacesLocal.test.py
python tests/placesPersistentStore.test.py
python tests/placesServiceHttps.test.py
```

The export suite exercises its real DuckDB query when the tool requirements are installed. A skipped dependency test is not a passed export integration test. Python HTTP/TLS tests use loopback sockets. The HTTPS suite needs OpenSSL to generate a temporary certificate, trusts that certificate explicitly, and tests real CLI import/inspect/serve, restarts without source files, exact CORS origins, version changes and rollback. The store suite compares memory/disk tiles, picks, search and filters, checks read-only behavior and rejects partial/duplicate/racing imports. Follow [contributing](../../CONTRIBUTING.md) for the wider suites and environment requirements.

## Browser regression

```sh
node tests/placesPanel.browser.cjs
node tests/placesImagerySuggestions.browser.cjs
```

Install Playwright in your test environment. `MAPILLARY_PLAYWRIGHT` may point to its module, and `CHROMIUM_PATH` may select an existing Chromium executable. The panel fixture needs React 18 UMD scripts, resolved from the test environment or `REACT_UMD_PATH` / `REACT_DOM_UMD_PATH`. These tests use actual panel/controller/popup code with controlled API/host boundaries, covering 240px/393px layouts, manual/Auto refresh, area search, row actions, paging, minimization and imagery choices. They do not replace SDK host validation.

## Host acceptance

Verify in the actual Experience Builder 1.20 host, 2D/3D and each mobile layout:

1. Places off makes no source requests. Explicit enable loads metadata, style, sprites and visible tiles; disable during loading leaves no late layer.
2. Service/view changes retire old resources. A failed service shows retry feedback without a request loop.
3. Map icons/counts/names follow scale; family, score and closed filters agree across tiles, picks and results.
4. Map/list hover and selection agree, overlaps open the chooser, dense truncated picks ask for zoom, and ordinary Mapillary navigation remains responsive.
5. Area search finds a known match beyond the first 200 candidates. Batch paging keeps its area/origin; local four-row paging and minimizing preserve state.
6. Imagery suggestions open in the existing viewer; configured note destinations and optional attachments retain their intended explicit-save behavior.
7. Keyboard/focus, RTL, narrow panels, themed scrolling and every responsive widget instance work.
8. Inspect actual HTTPS/CORS/proxy routes, sprites, glyphs and POST/preflight requests from a second device. A metadata-only success does not establish tile/search functionality.

## Measure in the actual map

The cloud environment cannot open your localhost application. This workflow uses your running widget's existing diagnostics and manual browsing. It does not fetch data, poll, automate clicks or add observers. Enable widget **debug mode**, open the app and choose its frame in DevTools. Paste the contents of `tools/performance/places-audit.js` into the console once.

The script resets diagnostic counters at phase start, retains at most ten aggregate reports, and samples memory only at start/stop. It does not record URLs, coordinates, image identities or access tokens. Use `mapillaryPlacesAudit.cancel()` if you need to abandon a phase. Re-paste after a page reload.

## Compare the same work

1. Choose a dense part of the published area, with the same zoom/map mode, basemap and filters. Warm up a short imagery route, then pause. Keep the tab visible, network conditions stable and debug mode the same for both phases. Do not mix cold-refresh results with warm-cache results.
2. Turn Places off; wait for the map to settle. Run:

   ```js
   mapillaryPlacesAudit.start('places-off-warm')
   ```

3. Perform a repeatable 30–60 second pass: the same ten image clicks, several coverage hovers, the same pan/zoom gestures, then a short playback segment. Pause and wait for outstanding work before running:

   ```js
   mapillaryPlacesAudit.stop()
   ```

4. Turn Places on, wait for its results, and repeat the same pass:

   ```js
   mapillaryPlacesAudit.start('places-on-warm')
   // Perform the same actions, then:
   mapillaryPlacesAudit.stop()
   ```

5. Repeat off/on once more to expose network/cache variance. Also check one pass with **Show camera link** enabled. Repeat in 3D and on the actual phone; browser device emulation is not a phone performance measurement.
6. Inspect/export the aggregate reports:

   ```js
   mapillaryPlacesAudit.report()
   // Chrome DevTools helper: copy JSON to clipboard.
   copy(JSON.stringify(mapillaryPlacesAudit.report(), null, 2))
   ```

If several widgets are active, pass the correct ID as the second `start` argument. List them with `Object.keys(window.__mapillarySequencePerformance)`.

## Interpret carefully

- Compare `timings['click-image']` and `timings['hover-highlight']` p50/p95 with comparable sample counts; fewer than ten samples is a weak comparison. These are existing widget timings, not isolated Places renderer timings.
- `playbackFrameGaps` describes gaps between confirmed images, not GPU frames or proof of a playback stall. Compare its distribution and what you observe.
- `longTasks` covers the page while debug diagnostics are enabled; other widgets/basemap work can contribute.
- Places snapshot counts show loaded records, rendered/group counts, bounded symbol cache and selected-overlay graphic count. They contain counts only. Places-off should have no owned active controller/graphics. A link-enabled selection now retains at most four graphics: selected badge, two strokes and distance label.
- `allPageHeap*` is Chromium's optional whole-page JS heap, not per-widget memory; other browsers may return null. It excludes GPU/decoded-image allocations. Sustained memory should be assessed over several minutes, not one delta. A higher retained cache is not by itself a leak.
- To inspect pan/zoom rendering, record comparable traces in DevTools **Performance** and inspect frames/long tasks. This snapshot tool does not measure FPS. Check Network for duplicated requests with off/on; it deliberately does not export request URLs.

There is no measured deployment result until you run this comparison locally. Small one-run differences can be noise. If Places-on repeatedly worsens image latency/playback, share the aggregate reports and the matching trace so the cause can be narrowed down.

## Portal adapter checks

Run `tests/portalPlacesSource.test.cjs` and `tests/portalPlacesBuilder.test.cjs` with the existing TypeScript test setup. They cover default/compatibility source selection, URL restrictions, schema and style pairing, actual binary MVT attribute inspection, bounded REST queries, SQL literal escaping, pagination, native-only rendering, filter replacement, dense picks, cancellation and builder temporary-layer cleanup. Existing configured-service tests cover external compatibility.

These use a controlled Portal protocol fixture, not a live Enterprise deployment. Complete the publishing, authenticated/anonymous, 2D/3D, update and phone checks in the [Portal guide](portal-administrator-guide.md) before claiming deployment readiness. A contract declaration alone cannot substitute for attributes in the package.

## ArcGIS Pro package feasibility

`tests/placesProPackage.test.py` checks the standalone MVT/Compact V2 inspector, bounded nearby sampling, sanitized reports and mocked ArcPy orchestration. It does not establish native ArcGIS Pro behavior. Run the [small Pro package test](pro-package-test.md), review its real report and establish attribute preservation before building/publishing the full dataset.

## Attribute restoration

Use `tests/placesVtpkRestoration.test.py` for complete source coverage, unambiguous identity, geometry/resource preservation, null/zero confidence, unsupported data and publication-conflict handling. Portal fixtures also check scalar source counts and `maxLOD` rather than scheme-only levels. See the [restoration/full-build guide](attribute-restoration.md) for independently decoded user-package evidence and the real Pro/Portal acceptance boundary.

The restoration regression suite also covers exact coincident sets with equal native/source multiplicity, preservation of different scores/statuses, refusal of native-ID/metadata/cardinality mismatches, distinct nearby positions, and the metre-bounded projection-rounding allowance. Independent validation of the supplied full package checks all 52 tiles, 14,933 instances and 7,089 source IDs with no geometry/native-property changes. This does not substitute for a hosted Portal acceptance test.

Additional publication checks preserve separate local/central ZIP extra fields and reproduce an unmodified native Pro archive byte-for-byte using the production member writer. The full native and repaired resources both loaded and rendered through ArcGIS SDK 4.33.12 in Chromium using a local HTTP service simulator (six visible tile requests each, no missing resources/errors). This tests rendering of extracted resources, not Esri's hosted VTPK importer. Portal metadata tests cover capabilities-only/incomplete definitions and sanitized 499/404 diagnostics; real hosted acceptance remains required.

Growing-tile regression coverage verifies that bundle maximum-record-size headers increase when restored payloads exceed the native floor, and that understated maxima fail validation. The supplied full package now declares 167,410 bytes for its largest bundle record. A capabilities-only service simulation reproduces the SDK layer-load failure; neither this simulation nor local rendering verifies Enterprise cache import.

## Portal clusters and zoom coverage

See [Portal clusters and zoom coverage](portal-clusters-and-zoom.md). Run the cluster histogram Python suite, Portal source/vector adapter fixtures, overview controller suite and external HTTP service tests.

Five older tests in `tests/overturePlaces.test.cjs` currently fail because their extracted widget-method fixtures omit `placesSourceKey`/related Portal imports. The focused overview regression lives separately in `tests/placesOverviewZoom.test.cjs`; the older unrelated fixtures were left unchanged.
