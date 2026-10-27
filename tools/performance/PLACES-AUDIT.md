# Measure Places in your actual map

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
