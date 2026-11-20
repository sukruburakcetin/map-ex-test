# Zoom-to-images target — stage 74

zoomToImagesTarget owns navigation target selection. The widget keeps live state access through one stable adapter and its ArcGIS-typed forwarding method. Widget is 15 lines shorter. The helper does not participate in pointer hover or image opening.

Precedence remains: matching current/fallback image with finite valid longitude/latitude; matching point graphic; looked-at ground; view.center. Ground sampling tries the original 0.5/0.65/0.8 height fractions and catches sky/projection failures. At zoom below 14, coverage can refine ground using the same representative picker with preferImages=false and radius min(160,max(32,min(width,height)*0.15)). Missing/nonpoint/failed picks fall back to ground. Original cancellation behavior is retained, including no new post-pick cancellation policy. No new network, timers, prefetch or concurrency is introduced. No speed improvement is claimed.

Thirty-one tests compare the frozen original with the extracted helper for results and map/projection/pick traces. Cases include valid/boundary/invalid coordinates, current/fallback precedence, graphics, first/second/third sky samples, missing ground, zoom boundary, radius clamps, lookup failure and cancellation. Widget integration checks live state, stable adapter identity, view/signal identity and unchanged picker arguments. Strict TypeScript checks the independent generic module; actual ExB semantic typing and browser checks remain separate.

Requires stage 73. From widget root:

```sh
node apply-zoom-target-refactor.cjs --dry-run
node apply-zoom-target-refactor.cjs
# Undo only this stage:
node apply-zoom-target-refactor.cjs --uninstall
```

The installer preflights actual source, preserves exact original bytes and local documentation history, and refuses unsupported edits. Backups live outside the widget; reverse newest first. Restart/hard-refresh, build in ExB 1.21 and smoke zoom-to-images with/without an active selection, 2D/3D transfer, globe sky and missing coverage. Continuation does not establish host installation/build acceptance.
