# Sequence performance and diagnostics (v6)

V6 shares application tile work, gives image opening priority over optional metadata, and bounds retained sequence data. Main-map base coverage stays unchanged during highlighting. Blue selection and neon-green hover keep the v5 rendering and cancellation behavior.

## Shared tile work

`SharedTileRequests` shares an in-flight coverage-tile producer across the widget's picking, highlight, preview and analysis consumers. Each subscriber has its own cancellation signal; leaving one consumer does not abort another. The final subscriber cancels the producer. Successful bytes enter the existing raw-tile LRU; failed or cancelled work is retryable. The runtime scopes requests to the current access token and invalidates dependent caches when that scope changes.

`SequenceTileIndex` scans source properties once per immutable `ArrayBuffer` and retains compact sequence-to-feature indices for the native `sequence` and `image` source layers. Later sequence highlights and previews visit matching feature positions rather than rescanning every image/sequence property. The same scan also retains a budgeted image-ID-to-feature lookup for active-image alignment. It retains no decoded feature objects or geometry. Different buffers invalidate membership by identity; pending builds are shared, cancellable, and yield between batches.

This sharing covers application-issued requests and decoding. ArcGIS native vector-tile layers and MapillaryJS imagery retain their own network/cache/rendering lifecycles. A source style filter limits displayed geometry; it does not turn the underlying native tile download into a sequence-sized response.

## Image priority and background work

MapillaryJS image navigation and required selected-image tracking metadata stay outside `BackgroundRequestQueue`. Local sequence context, nearby suggestions, hover details, optional complete-route metadata, image detections, time-travel checks and reverse-address requests use the queue. Superseded image detection requests are cancelled instead of accumulating during playback.

New background jobs wait while an image opens. In a visible tab, the queue remains paused through SDK image confirmation and two following animation-frame callbacks. It allows one optional job during playback and two while playback is paused. FIFO scheduling preserves order; changing the limit or pausing does not preempt a job already running. Obsolete selections/enrichment jobs have separate abort signals. An aborted operation that ignores cancellation still occupies its physical slot until it settles, preventing hidden oversubscription.

The viewer event can cancel old enrichment immediately without starting replacement checks for every played image. Secondary frame details retain their existing coalescing. Queue priority is application scheduling, not browser-level priority control over ArcGIS or MapillaryJS traffic.

## Retained data budgets

Limits below constrain managed caches. A valid oversized result remains complete for its caller and is not admitted to the corresponding cache; no route, index or geometry is truncated to fit.

| Owner | Default retention limit | Accounting |
| --- | --- | --- |
| Raw coverage tiles (`TurboTileCache`) | 8 MiB; 64 entries | Retained buffer bytes, including bounded empty responses. |
| Pointer spatial indices (`TurboIndexCache`) | 24 MiB; 8 entries | Source buffer plus allocated coordinate, linked-list and grid typed-array bytes. |
| Compact sequence membership (`SequenceTileIndex`) | 8 MiB; 16 entries | Estimated buffer, typed-index, string and map bookkeeping. |
| Complete-route RAM cache | 16 MiB; 100,000 points; 6 routes | Estimated point/reference/ID data; true LRU. |
| Ordered sequence-ID indices | 16 MiB; 100,000 IDs; 6 sequences | Estimated ID/reference/position-map data; true LRU. |
| Decoded highlight geometry | 100,000 vertices; 64 sequence/tile entries | Vertex and entry counts, not a heap-byte estimate. |
| 3D native highlight renderers | 2 cached targets per role; 4 total, at most 2 visible | Renderer count; SDK/GPU bytes are not measured or budgeted here. |

Byte estimates deliberately charge strings/bookkeeping conservatively. Shared buffers can appear in more than one owner's accounting; adding these figures does not produce unique heap usage. Active viewer/tool routes, pending results and persistence queues have separate lifetimes. ArcGIS/MapillaryJS caches, JavaScript object overhead beyond estimates, textures and GPU allocations are outside these budgets. The application/process therefore has no claimed global memory ceiling.

Validated route arrays are immutable snapshots. Reusing an identical snapshot avoids repeated validation/indexing. External assignments are validated on actual cache access; invalid replacements release old managed entries. Route diagnostic reads observe existing bookkeeping only: zero before first managed use does not mean an externally populated record contains no data.

## Reading local diagnostics

Enable **Debug Mode** in the widget settings (`debugMode: true`), open the widget, and use the browser console:

```js
Object.keys(window.__mapillarySequencePerformance || {})
const monitor = window.__mapillarySequencePerformance['<widget-id>']
const report = monitor.snapshot()
console.table(report.timings)
console.log(report.tiles, report.sequenceIndex, report.background, report.routes, report.nearby)
monitor.reset()
```

The registry is keyed by widget ID; select the intended widget when several are present. Disabling Debug Mode or closing/removing the widget unregisters its entry and disconnects its observer. Diagnostics send no telemetry and persist no history. Snapshots contain numeric summaries, view type and the actual current viewer's tiling mode, without image IDs, request URLs or credentials.

Each timing kind retains the latest **128 completed samples**. `count` is the total completed count since reset; `retained`, p50, p95, maximum and last duration describe the retained window. Percentiles use nearest rank. Cancelled/superseded measurements do not become completed samples. Hiding the tab cancels an in-progress click/hover timing sample so suspended frames cannot inflate it; navigation can continue. `reset()` clears these timing summaries and diagnostic counters; it does not empty application/browser/SDK caches or reset the separate lifetime counters shown by cache/queue owners.

| Measurement | Boundary and interpretation |
| --- | --- |
| `click-image` | Main-map click timestamp includes hit testing and required target resolution, then navigation/SDK confirmation and, in a visible tab, two animation-frame callbacks. Other entry points start at navigation. It is an end-to-end readiness/paint-opportunity proxy; it does not isolate Mapillary download or image decode time. |
| `hover-highlight` | Requested hover through application highlight work; 3D also waits for the native layer view's SDK readiness, then two animation-frame callbacks. This is not pixel-level proof of visibility or GPU completion. |
| `context-ready` | A local coordinate-window request until nonempty context is available. Cached full-route adoption and first image display are separate events. |
| `tile-load` | One application tile producer, including body download and any retry delay; raw cache hits create no load-duration sample. |
| `sequence-index` | A new compact membership build, not an ordinary index hit. |
| `playbackFrameGaps` | Intervals between confirmed viewer-image events during continuous playback in a visible tab. Pause/hidden transitions reset the interval boundary. These gaps are not GPU frame times or definitive stall counts. |
| `longTasks` | Durations from the optional browser `longtask` observer while Debug Mode is enabled. Entries cover the page/main thread, including other widgets; they are not attribution to this widget alone. Unsupported browsers leave the summary empty. |

Compare timing counts with cache/source counters: a shared application producer is not an additional producer download, and one producer can include an HTTP retry. DevTools Network/Performance traces are needed to separate server time, image download, decode, browser paint and SDK work.

## Tiled versus untiled imagery

**Load imagery in tiles** controls `config.imageTiling`; its default is **false**, preserving the existing viewer configuration. It applies when a viewer is created, including recreation after fullscreen transitions. Reopen/reload the viewer after changing it. `report.imageTiling` records the mode used by the actual viewer (`null` if no viewer has been created); changing settings alone does not modify an existing instance.

For a fair comparison:

1. Keep browser, device, viewport, network profile, map zoom/tilt and optional feature settings fixed. Compare the same ordinary images and panoramas in both 2D and 3D.
2. Separate initial viewer creation from navigation in an already initialized viewer. Use a fresh test browser profile/session for comparable cold-image runs; test revisits separately for warm behavior. Resetting diagnostics alone does not create a cold run.
3. Run comparable batches in each mode, alternating test order. Keep the tab visible, collect enough completed samples to interpret p50/p95, and record sample counts and snapshots before more than 128 samples replace the intended window.
4. Record click/highlight/context durations, image bytes/request counts and Network/Performance traces. Check playback image-event gaps and long tasks alongside visible behavior. Do not infer a decode-only speedup from `click-image`.

Neither tiling mode is inherently faster for all images, panoramas or connections. The setting and measurements enable comparison; v6 makes no empirical live-data speedup claim without those runs.

## Sustained-browsing memory checks

Record a baseline snapshot after startup, then repeatedly visit many different sequences, pan across tile boundaries, switch 2D/3D and revisit recent targets under a fixed workload. Sample managed cache entries/items/bytes and queue active/queued counts at consistent checkpoints; confirm they respect their limits after operations settle. Repeat with a long sequence and an explicitly requested complete route so oversized active results are represented.

Use the browser's memory/heap and performance tools alongside the managed figures. Look for continuing growth after comparable work and cleanup, while allowing for SDK/browser pooling and active/persisting results. Close/reopen the widget and confirm diagnostics registration, pending work and managed cache ownership are released as intended. Record GPU/renderer behavior separately; renderer counts and estimated RAM bytes cannot establish GPU memory usage or a process-wide plateau.

## Alignment work

Native image anchors reuse the shared tile cache and index. Warm ID lookup does not scan a sequence or make a request. One absent expected source tile can be downloaded as optional work; it does not block image navigation. Cached neighboring source tiles are checked without downloading a neighborhood. The 64-entry display-anchor owner remains view/filter scoped, and the new ID lookup is charged to the existing 8 MiB estimated index budget.

2D circle symbols are shared per style/source zoom and updated for view resolution/rotation. Zoom/rotation changes mutate those existing symbols without new Graphics, tile reads, decoding or native renderers. The 3D pulse uses the GroundView's current cached elevation sample while the view updates; no separate elevation service request or animation loop is added. These are bounded work reductions/constraints, not a measured production frame-rate guarantee.
