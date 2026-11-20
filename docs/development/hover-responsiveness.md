# Hover responsiveness: audit, changes and evidence

The goal is immediate reliable feedback, smooth animation and no avoidable warm-preview loading flash. This is not a claim that the widget is globally “fastest”: the user's ExB application and live Mapillary latency cannot be profiled from this workspace.

## Audit findings

The current picker coalesces queued pointer events at zero delay, starts coverage picking independently of SDK/object hits, cancels obsolete pointer work and preserves feature/places ownership. It already shows a pulse before metadata, reuses completed nearest-frame hints and metadata, waits 150 ms only for cold details, isolates optional failures and retains same-image pending thumbnails through enrichment. Those policies stay unchanged. Cutting dwell would increase requests while moving across targets; this update does not do that.

Two avoidable costs were confirmed in source and controlled tests:

1. The pulse called view.toScreen and rewrote its anchor left/top on every animation frame at rest.
2. Metadata was warm on A → B → A, but clearing/rebuilding the card allocated another image element and assigned src again, leaving an asynchronous loading gap even when the browser had seen its thumbnail.

## Settled anchor projection

A feature-owned `HoverAnchorProjection` retains one finite pixel result only while stationary is explicitly true, updating explicitly false and interaction inactive. View/geometry/point-coordinates/spatial-reference/camera/extent/zoom/rotation/dimensions form its conservative cache key. Invalid or unknown states are projected live, and settling after movement performs a fresh projection. It retains only one entry per existing hover animation, not a growing history or additional scheduler. The pulse's width/height animation and frame cadence stay intact. Inline display/position writes are skipped when unchanged.

Actual baseline/current widget callback fixture, 600 ticks: projections **600 → 1**, left/top writes reduced by **1,198**, equal RAF counts. A moving view still projects on all 600 ticks. Camera, geometry, extent, size, zoom, rotation and invalid-result tests cover invalidation. This demonstrates reduced work under the settled contract; actual SDK object stability and total ExB frame time still require target profiling.

## Exact decoded thumbnail revisits

A host-owned WeakMap holds an LRU of at most four successfully loaded images, each at most 256×512 pixels. Lookup requires the currently supplied exact image ID and thumbnail URL. The metadata cache remains the authorization/expiry gate; there is no ID-only fallback, prefetch or new network path. A decoded node can be attached synchronously to a newly built card. Wrong image/same URL, changed URL, pending image, error and oversized-image cases cannot borrow it. Same-image pending retention remains supported.

The cache adds bounded decoded-image retention; browser backing-store allocation varies. It survives pointer leave for warm revisits and is explicitly cleared by widget cleanup, including callbacks. Tooltip hosts are isolated. Locale bindings and current-card callbacks are renewed normally; stale image callbacks cannot settle a replacement. The existing hover shell and live locale behavior remain intact.

Controlled real Chromium result:

| Check | Before | After |
| --- | --- | --- |
| A/B/A src assignments | 3 | 2 |
| A revisit src assignments | 1 | 0 |
| Pixels attached during revisit render | No | Yes |
| Forty further warm switches | — | 0 new src writes, pixels present |

These fixtures intercept local SVG routes; they do not measure production HTTP cache/network latency or FPS. Seven existing Chromium compatibility checks also pass, covering pending/decoded reuse, stale targets, URL changes, locale, errors and cleared-host exact revisits.

## Validation and reproduction

**2,448 passing portable tests, 194 files, zero skipped**. Twenty-one projection/runtime cases and eight decoded-revisit cases were added; previous fixtures remain unchanged and no suite is excluded. New baseline fixture freezes the pre-optimization showTurboHover method and hover-card source for work/browser comparisons. Strict TypeScript checks the helper/card dependency graph; widget/helper/card syntax and repository hygiene pass.

Browser checks require Chromium, TypeScript and a Playwright driver, separately from widget dependencies:

```sh
node tests/hoverThumbnailRetention.browser.cjs
node tests/hoverInteractionPerformance.browser.cjs
```

Supported overrides: `MAPILLARY_TYPESCRIPT`, `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH` and `MAPILLARY_WIDGET_ROOT`. Portable dependencies remain documented in portable-tests.md. No browser-test dependency is added to the widget runtime.

ExB 1.21 host build/browser/device acceptance is pending. In Chrome Performance/Network, compare first hover versus warm A/B/A at the same location; then fast traversal, moving/rotated/resized maps, regional versus individual points, feature/places precedence, fullscreen, RTL, minimize/reopen and cold request cancellation. Inspect scripting/render time, long tasks and request counts. Do not infer live API latency or total hover speed from the fixture results.

## Reversible delivery

Requires the previous panorama-hover-pointer update. From widget root:

```sh
node apply-hover-responsiveness-optimization.cjs --dry-run
node apply-hover-responsiveness-optimization.cjs
# Reverse only this optimization:
node apply-hover-responsiveness-optimization.cjs --uninstall
```

Preflight requires supported widget/card/browser-test source and prerequisite modules. Unknown edits are refused, local documentation history is preserved, LF/BOM/CRLF supported, and exact backups kept outside the widget. Rollback checks installed/backup hashes and protects later edits. Reverse newest update first. No changes to yellow bearing readiness, panorama pointer, picking policy, data filters, request budgets, image opening or playback.
