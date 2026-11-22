# Map hover dispatch — stage 95 / P03 part 2

`src/features/navigation/mapHoverDispatch.ts` owns the shared pointer timer, map-leave cleanup, touch suppression and hover-resume wiring, and returns the pointer dispatcher. `Widget.mapHoverHost` binds live hover-only capabilities. The widget creates the interaction, registers click, then installs the returned pointer handler into the SDK and current hover slot, preserving listener order.

The factory reuses `CoverageHoverResume`, `CoverageTouchHover`, pending/delayed status, Places and hover-label helpers. It retires the prior container cleanup, creates the replay/touch owners and installs map-leave cleanup in the original order. Leave/touch cancellation shares the same queued pointer task. Cleanup disposes its own touch/replay instances and clears their widget slots only if those slots still refer to those instances; a retired cleanup cannot erase replacement owners.

Pointer work retains zero-delay coalescing, captured screen coordinates and the same abort controller. Coverage begins before the SDK hit test and completes independently; failed optional detection lookup does not dismiss successful imagery. Cloud highlighting, detection/POI tooltip priority and native POI fallback retain their original order. Native Places owner/source/version and view guards remain live after awaits. No new delay, polling, request, dependency or async handoff is added.

Thirty-six frozen/current comparisons exercise the full factory, actual live bindings and returned handler, with controlled timers and recording event targets. They cover independent SDK/coverage timing, late label results, native owner/version/source changes, queue replacement, leave/touch/cleanup, location picking and replay eligibility. Existing hover failure-isolation, low-zoom replay, touch, POI and lifecycle cancellation assertions remain active through updated production-source harnesses. The native browser harness follows the moved callback rather than a frozen implementation.

P03 remains in progress after two changes. `onActiveViewChange` now orchestrates transfer, attachment and named click/pointer bindings, but `setupDetectionHover` and the remaining click-preview preparation still need the final P03 review. The widget is 10,557 lines (147 fewer than stage 94; 354 fewer across P03 so far). Concrete SDK/feature binding getters remain explicit.

Validation: 3,129 passing portable tests / 221 files in workspace and clean installer-produced copy, zero failures or skips. Isolated ExB 1.20 module-graph build: zero errors/warnings. Targeted SDK-aware module checking, BOM/CRLF comparisons, mutation and reversible installer checks pass. Native Chromium confirms low-zoom hover status appears/clears and the preview opens in the isolated harness. Full ExB 1.21/browser acceptance remains pending under P12.

Type-check scope: strict TypeScript for the moved module with real ArcGIS SDK declarations, using the same small temporary type-only JimuMapView/pako aliases as stage 94 for unrelated imports reached through existing shared types. This is not a full host/whole-project strict typecheck. The Chromium result is an isolated native-timer/status test, not the full widget/ArcGIS acceptance matrix or a performance benchmark.

Install after stage 94 from the widget root:

```sh
node apply-map-hover-dispatch-refactor.cjs --dry-run
node apply-map-hover-dispatch-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/map-hover-dispatch-stage95` for `node apply-map-hover-dispatch-refactor.cjs --uninstall`. Unknown source edits stop installation before writes. Unrelated documentation history is retained. Preserve the backup for guarded exact rollback; uninstall later stages first.

Real-host checks: low-zoom hover while panning/zooming and after tiles become ready, quick pointer movement, leave/re-enter, touch/tap, overlapping coverage/POIs/detections, active-map replacement and close/reopen. Verify current thumbnails/status and target priority, without stale labels or duplicate requests.

Next: extract/review detection hover and retained click-preview capture, then assess P03 against its original 2–3-change allowance. One final P03 change is planned; P04–P12 retain their original scope.
