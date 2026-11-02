# Responsive clicks on large loaded routes

Two click paths scanned all cached coordinates in one synchronous task: clicking a blue route polyline without an explicit image ID, and clicking a regional representative from the active completed sequence. These paths could prevent a newer click or map interaction from being handled until the entire scan ended.

`features/coverage/nearestLoadedFrame.ts` retains the existing nearest-distance policy, visits every frame and preserves first-match ties. Short inexpensive scans start without a timer. A scan yields after each 4,096 frames, or when an eight-millisecond budget is exceeded at a 256-frame checkpoint. These are cooperative budgets, not a guaranteed frame-time bound. The helper checks click/route ownership after yielding and before returning. It adds no network work, coordinate downloads, route sampling, persistent cache or spatial index.

The runtime's two callers retain captured array references and stop if the selection or route changes. Regional discovery still follows existing filter policy; exact individual image clicks keep their earlier fast path. Hover bearing, sequence styles and faint overview ownership are unchanged.

## Validation

125 targeted checks pass. Deterministic helper tests cover 10,000 frames, last-frame selection, ties, small scans without timers, expensive distance functions, cancellation, obsolete arrays and empty/invalid-distance results. A real-click callback regression fails on the previous synchronous implementation: the old image opens before the next click can interrupt it. It passes after the cooperative scan is installed. Existing hover, click priority, latest-click ownership, sequence retention, storage scheduling and image-first checks also pass. The runtime parses and the helper passes a standalone strict TypeScript check.

This improves main-thread responsiveness during a long scan. It is not a claim of reduced download latency or a live FPS benchmark. Timer scheduling may extend a long scan's wall-clock duration in exchange for handling input between slices. A full Experience Builder build and live-host visual check were not available in this workspace.

## Install

Apply after the latest-click ownership update, from the widget root outside `src`:

    node apply-responsive-loaded-route-clicks.cjs

Rebuild and reload Experience Builder. Use `--dry-run` to check compatibility. The standalone uninstaller restores only this scan implementation and its tests, retaining previous hover and click fixes. Installer tests do not invoke a host build. Edited blocks are refused rather than overwritten.
