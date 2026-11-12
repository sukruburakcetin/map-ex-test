# Map interaction investigation record

Historical findings from intermediate experiments. These are not installation instructions or a list of supported rendering choices. Current ownership is described in the development guides. Historical patch scripts are retained by Git history, not shipped in the working tree.

## docs/history/map-interaction-investigations.md

# v6.89 beveled native marker visual trial
Requires v6.88. Geometry/material-only experiment: raised flat green center (2.2 nominal pixel units high), green sloped bevel down to1.15 units, white rim sloping to0.75. Base remains0.1: no pedestal, callout or extra vertical offset. Sector rises at a 0.2 local slope toward the outer arc (default about5.1 nominal pixel units, capped8.4) and adds a thin opaque amber edge. Orange body is85% opaque. Cast shadows remain disabled; shading comes from native geometry normals and SceneView lighting. One Mesh Graphic, four material components, bounded564 vertices at current tessellation. This increases mesh detail slightly; no performance improvement claimed.

Native owner, camera scaling/hysteresis, SVG overview fallback, 2D, selection/hover and cleanup unchanged. SVG overview appearance intentionally unchanged: this visual difference is visible only in close-up native mode. Rebuild/restart/hard-refresh. --uninstall restores v6.88; then uninstall v6.88 to return to v6.87. Rebuild/reload after rollbacks. Experimental visual comparison, not a production recommendation.


## docs/history/map-interaction-investigations.md

# Brief outline-only 3D halo · v6.67

Apply after v6.66. Retains v6.66's stable green centre, independent halo layer, zero vertical lift and fly-in anchor recovery.

The 3D halo now has a transparent fill and green outline only. It pulses for two existing 1200ms cycles (2.4 seconds total), then its Graphic/layer are removed and no further animation frame is scheduled. The opaque green/white centre remains unchanged and visible. A same-image anchor correction preserves the settled state; displaying a different image starts a new brief halo. During continuous playback, each newly displayed image uses this same rule; this release does not introduce a playback-specific animation mode.

The existing 2D DOM pulse is unchanged. No picking, hover, blue selection, bearing, cone or anchor-recovery code changes. This patch adds no timers, requests or extra animation loops.

## Verify

- Select an image in 3D: see two outline pulses, then only the steady centre.
- Wait or correct the same image's tile anchor: the halo should not restart.
- Select another image: the brief halo should play again.
- Zoom/tilt after settling: the centre stays ground-aligned; no removed halo should return.
- Toggle fullscreen or switch map modes and check cleanup.

The HTML/GIF preview illustrates the appearance, not actual SceneView rendering. The GIF loops for demonstration; the widget stops after the two cycles for each new image. Check live flickering on the target browser/device.


## docs/history/map-interaction-investigations.md

# v6.96: Brown hover bearing trial

Requires v6.95. Run `node apply-brown-hover-bearing-v6-96.cjs`, rebuild and reload.

Hovering an individual coverage circle keeps the existing brown pulse and adds a smaller translucent amber capture-bearing sector. The sector lives inside the brown overlay and shares its exact DOM center and existing animation clock. It does not add another RAF, viewer, hit test or metadata request. At most two extra orientation projections run when the camera/anchor changes; settled projections are cached and updates are limited to roughly 30 Hz. Existing pulse size, color, timing and selection logic are unchanged.

The existing delayed hover-card request now also requests computed_compass_angle, compass_angle and is_pano. Existing cancellation/identity guards apply before decoration is shown. Missing bearing, panoramic images and representative sequence points keep the brown pulse alone. Old cached metadata without bearing also keeps pulse-only feedback until refreshed normally. 2D and 3D use the sector; 3D follows the projected ground plane while staying centered on the existing pulse.

Validation: SDK build, strict helper compilation and four decoration tests pass. Visual appearance and FPS on the user's GPU remain to be checked.

Uninstall from the same widget folder: `node apply-brown-hover-bearing-v6-96.cjs --uninstall`, rebuild and reload. The installer restores the exact preceding runtime source and removes the trial helper, tests and this document. Uninstall before applying later patches that modify these files, or the guards will reject conflicting edits.


## docs/history/map-interaction-investigations.md

# v6.83 plain marker and readable overview cone
Requires v6.82. Rebuild/restart and hard-refresh. Removes CSS halo and its tracker/position conversion, SVG target and dark edge. Restores the fixed native 12pt green circle / white 2pt outline used in v6.79, retaining v6.81 flat-ground projection helper needed by cone sizing. No 3D animation, DOM marker overlays or symbol swapping; 2D animation unchanged.

The tiny overview cone was limited by the old 24× / 360m physical-radius ceiling (5m requested radius could enlarge only to 120m). Enlarge toward the existing 60 CSS-pixel centerline target with 2048× / 12km safety ceiling instead. Existing sampled 40–96px footprint cap remains authoritative. At zoom 12.6 this permits enough display radius for a cone comparable to 14.1. This is a directional display indicator, not an assertion of real visible distance. Exact size is not guaranteed at extreme perspective, distant overview or unavailable rendered terrain; existing safe hiding/fallback applies. No network elevation requests added; projection work remains bounded.

Affected SelectionPulse.ts, projectedConeRadius.ts and their two targeted tests. Runtime, cone geometry generation, coverage, sequence selection/hover algorithms unchanged. Uninstall restores v6.82 with its halo; rebuild/reload required.


## docs/history/map-interaction-investigations.md

# v6.90: Combined 2D current-image marker

Requires v6.89. Install with `node apply-combined-2d-marker-v6-90.cjs`, rebuild and reload.

2D uses the v6.87 SVG circle and direction sector, with a green center and white rim. There is no pulsing overlay or symbol animation. The existing native selection Graphic remains as a steady fallback and retains image identity. The SVG tracker reuses its element and caches settled projections. The current v6.89 native 3D appearance remains unchanged.

Rollback: `node apply-combined-2d-marker-v6-90.cjs --uninstall`, rebuild and reload.


## docs/history/map-interaction-investigations.md

# Cone screen footprint · v6.65

Standalone cone-only update based on GitHub `85c38df`. Does not include or require v6.64 playback scheduling; apply with v6.64 uninstalled.

The direction cone retains its configured size when it fits. At close zoom, it may shrink below the requested ground-metre radius to avoid covering a large part of the map. Its upper screen-footprint limit is 96 CSS pixels, reduced to a quarter of the shorter viewport dimension on smaller views (minimum 40px). A small sampling margin keeps normal footprints below that limit.

Local projection samples cover the wedge's arc, ground edges and upper surface, checking both screen width and height. Two bounded shrink corrections and a verification accommodate perspective without an unbounded solver. An unstable valid projection that cannot satisfy the cap hides the cone for that redraw; the selected image marker remains. Unavailable terrain/projection uses a conservative zoom-derived ground cap, which is an estimate rather than a precise 3D screen bound. No elevation query over the network is introduced.

Fixed vertical lift now scales down below a 10m cone radius. The existing radius-based rise also shrinks, preventing the close-view wedge from retaining an outsized vertical thickness. Both the mesh and perimeter use the same lift formula. The apex stays at the same native ground anchor; bearing/spread and mesh topology remain.

A 3D camera watcher requests a refresh when tilt/heading/position changes, sharing the existing pending cone animation frame with zoom/bearing work. It is removed with the existing view teardown/rebind. There is no new animation loop, timer, background request or sequence work. Projection work is bounded at 45 footprint samples per redraw, plus the existing centreline sizing work.

Selection/hover modules, picking methods, click/pointer-move/image callbacks and zoom-driven sequence sizing/refreshes are unchanged.

## Check in your app

- With v6.64 uninstalled, refresh after applying v6.65. Open an image and zoom from normal to very close in 2D and 3D.
- Tilt 3D toward ground level and rotate around the image. The cone should remain compact and its apex should stay at the image point.
- Change the viewer cone-size control and bearing. The requested size remains an upper request constrained by screen readability.
- Verify sequence hover/selection and blue coverage alignment as before, and confirm ordinary playback still advances.
- Missing terrain can temporarily use the estimated cap. Real ArcGIS rendering and low-end-device frame cost need verification in your running app; synthetic projection tests are not deployment measurements.


## docs/history/map-interaction-investigations.md

# v6.80 static current-image target
Requires v6.79. Install/rebuild/restart and refresh. Uses one SVG image in one IconSymbol3DLayer on the existing single Graphic/layer. Green center (supplied baseColor array or Color.toRgba), white ring, dark green outer edge, all centered. Icon 14pt with padding in 24×24 SVG; visible outer diameter approximately 17 CSS pixels at DPR1, close to the prior 16 CSS pixel icon. No additional graphics, stacked 3D icon layers, DOM overlay, animation, timer, symbol swaps, terrain requests or external image downloads. Occluded visibility and on-ground placement retained. 2D remains unchanged. SVG resource is generated only when creating the marker, not per frame. White/dark border remains opaque; center alpha follows supplied RGBA.

This is a visual trial based on the steady-marker strategy, not a claim the original flicker was fixed or that this new symbol is already validated on the user's GPU. Use --uninstall to return exactly to v6.79 if appearance/rendering is unsuitable, then rebuild/reload.

Affected source SelectionPulse.ts; tests selectionPulseGround.test.cjs; adds this document. Historical diagnostics remain inactive. Runtime, cone, sequence selection and hover algorithms unchanged.


## docs/history/map-interaction-investigations.md

# v6.100: Cyan preview cone

Requires v6.99. Install with `node apply-cyan-hover-cone-v6-100.cjs`, rebuild and refresh.

Coverage-circle hover uses a translucent cyan sector with a teal outline. Brown pulse styling, selected-image orange cone, navigation-arrow indicator and rendering behavior remain unchanged. This changes two SVG color values only.

Rollback: `node apply-cyan-hover-cone-v6-100.cjs --uninstall`, rebuild and refresh.


## docs/history/map-interaction-investigations.md

# v6.95: 3D navigation-target bearing cone

Requires v6.94. Run `node apply-direction-hover-bearing-v6-95.cjs`, rebuild and reload.

3D viewer-arrow hover shows a steady amber target and a smaller orange direction sector at the same exact coverage anchor. The sector uses computed_compass_angle, falling back to compass_angle. It shows the image capture heading, not the direction of travel from the current image. Missing bearings and panoramas keep a disk only.

The disk is drawn as soon as anchor resolution completes. One cancellable background metadata request enriches the hovered image's bearing. Up to 64 results are cached by image and token. Hover changes, mouseout and view/context changes suppress late results. The existing marker-only overlay now draws its sector too, sharing its element, projection cache and tracking loop. No pulse or second rendering loop is created. 2D rendering remains unchanged.

SDK build and 11 marker/anchor tests pass. Check the appearance and bearing in the user's scene after rebuilding. No frame-rate benchmark is claimed.

Rollback: `node apply-direction-hover-bearing-v6-95.cjs --uninstall`, rebuild and reload.


## docs/history/map-interaction-investigations.md

# v6.94: Exact coverage position for 3D arrow hover

Requires v6.93. Install with `node apply-exact-direction-anchor-v6-94.cjs`, rebuild and reload.

3D arrow hover resolves the target image's exact ID in coverage tile data before displaying its marker. Existing retained display anchors, cached bytes, shared tile transport and shared indexes are reused. A cache miss can request one tile through the existing background queue; neighbouring tiles are searched only when already cached. No nearest-point snapping or alternate-image selection occurs.

Leaving hover, changing target/view/token or changing coverage revision prevents late results from drawing. Resolved positions are retained in the existing bounded display-anchor cache. A missing exact match or lookup failure retains the original source position. 2D arrow rendering, discovery priority, sequence selection, picking and coverage loading are unchanged. Existing v6.93 steady 3D marker styling remains.

Five runtime-method tests cover exact IDs, cache reuse, cold requests, unmatched targets and stale/cancelled work. SDK build passes. A visual check is still needed in the user's 3D scene; this addresses coordinate mismatch, not every possible native-renderer projection offset.

Rollback: `node apply-exact-direction-anchor-v6-94.cjs --uninstall`, rebuild and reload.


## docs/history/map-interaction-investigations.md

# Faster hovered-image opening

A validated individual coverage hover captures the exact image identity before click processing. Previously that click still waited for an unrestricted ArcGIS hit test, and even inactive traffic-sign/object modes called the local detection picker.

`features/coverage/coverageClickDispatch.ts` now bypasses that SDK wait only for a validated individual hover with no shared-note layer, point-cloud layer, active Places mode or legacy detection FeatureLayer. All competing owners retain the original hit test and ordering. Route and annotation interception remains ahead of this decision. Native object/sign modes still execute their local picker when active. Unhovered clicks and regional line previews retain the original SDK path. The captured point's existing view/revision checks remain authoritative.

After the image opens, `prepareDemandSequence` starts its bounded cached-tile preview before awaiting persisted full-route storage. This reuses downloaded bytes; it does not fetch a sequence or start a second local-coordinate worker. Nearby discovery still waits for cache adoption, avoiding requests when a complete route is available. Existing preview guards prevent late provisional work from replacing a complete route or newer selection. Native blue selection remains independent of hover feedback.

Regional frame lookup already shares successful hover/click resolution through CoverageFrameLookup. No second frame-selection policy or speculative image download was added.

## Timing

Existing debug diagnostics at `window.__mapillarySequencePerformance[widgetId].snapshot()` now include:

- `click-dispatch`: click timestamp through viewer navigation dispatch, including priority checks and the state-commit wait. Recorded for explicit click timestamps.
- `viewer-open`: the Mapillary SDK getImage/moveTo promise duration for a current, successful selection. This includes SDK processing, transport, decoding and transitions as represented by that promise; it is not a network-only or GPU-paint measurement.
- `click-image`: existing click-through-browser-paint-gate timing, retained unchanged.

The diagnostics registry is available only with the widget's existing debug mode enabled. All timings use the existing bounded numeric collector; no image IDs, URLs, additional observers or network calls are introduced.

## Validation and limits

110 targeted checks pass: real click callback priority/dispatch tests, delayed-storage scheduling, image-first behavior, real-cache hover regressions, performance lifecycle and native selection/overview retention. Tests verify that an indefinitely pending SDK hit test is never invoked for an unopposed hovered point; notes/cloud/places can still consume a click; active detections precede image opening; obsolete selections cannot commit; pending storage does not delay provisional preview; and local discovery does not duplicate cached-route adoption. Fake-clock tests separate dispatch/SDK/total durations and exclude superseded SDK results.

These controlled tests establish removal of waits, not a measured millisecond improvement in a deployed Experience Builder scene. Actual image load time still depends on Mapillary/browser caching and connection conditions. No full host build or live-host benchmark was available here.

## Install and rollback

Apply after the hover cache contract fix, from the widget root outside `src`:

    node apply-faster-hovered-image-opening.cjs

Rebuild/reload Experience Builder. `--dry-run` checks compatibility without source writes. Tests and the host build do not run inside the installer. The standalone uninstaller restores the previous scheduling and tests while keeping the earlier hover cache crash fix. Edited installation blocks are refused instead of overwritten.


## docs/history/map-interaction-investigations.md

# v6.87 ground-facing combined marker
Requires v6.86. Applies the same normalized projected ground-plane transform to the SVG circle and cone. Circle becomes an ellipse at shallow camera angles; white outline follows that shape. Marker-only display also computes the ground basis after hiding the cone. At top-down view it remains circular. One shared anchor, existing radius caps, viewer zoom length/narrowing and overview visibility remain. No shadow, animation, native symbol swaps, map layout changes or new loops. Circle-only mode now needs the same three projection calls as fan mode when the cache changes, instead of one; settled cache avoids those calls.

This is a ground-facing SVG overlay, not an actual terrain mesh, and does not add building occlusion. Native Graphic remains hidden while SVG is presented, retaining identity/navigation/fallback behavior. Existing selection/hover algorithms and 2D presentation unchanged. Install/rebuild/restart/refresh; --uninstall restores v6.86 round screen-facing circle, then rebuild/reload.


## docs/history/map-interaction-investigations.md

# v6.82 halo layout correction
Install over v6.80 or v6.81. No need to reinstall v6.81 if already rolled back. This includes the v6.81 flat-ground cone projection correction and CSS halo, but removes every map container CSS positioning write. Halo coordinates convert to the existing offset parent, including scrolling, borders and scaling. Setup/tracking failures disable the optional decoration without disposing the static native marker. No changes to coverage readiness timeout or its error handling. Requires a full reload to clear live v6.81 container styling.

The reported Coverage readiness timed out warning is not a root-cause diagnosis. The container mutation is a concrete integration risk addressed here, not a proven explanation of the white screen. If the scene still blanks, rollback and do not extend coverage timeouts to conceal it. --uninstall restores whichever supported version was present before installation; rebuild/reload afterward.

Browser and regression checks cover zero host position mutation, screen alignment, scroll/scale conversion, failure cleanup and native marker identity. They cannot reproduce the user's complete Experience Builder configuration. Selection/hover algorithms remain unchanged.


## docs/history/map-interaction-investigations.md

# v6.99: Refresh incomplete hover bearing metadata

Requires v6.98. Install with `node apply-hover-bearing-metadata-v6-99.cjs`, rebuild and reload.

Old hover-card cache entries without bearing fields receive one complete metadata refresh through the existing delayed, abortable request path. A successfully completed lookup is marked even when the service has no bearing, avoiding repeated requests. Optional refresh failure preserves the cached hover card. Enrichment must match the hovered image ID; existing cancellation guards prevent late decoration or cache updates.

The computed bearing is preferred, with a finite compass_angle fallback. Panorama cones are now allowed: use capture heading when available, otherwise the current viewer heading as a preview direction. This is not a panorama field-of-view footprint and does not imply the entire panorama faces one way. Non-panoramic captures without usable heading remain pulse-only. The fixed-size cone anchor, brown pulse, hover picking and sequence selection are unchanged.

SDK build and 13 focused tests pass, including real runtime-method tests for enrichment reuse and stale-response cancellation. A user's SceneView visual check remains needed.

Rollback: `node apply-hover-bearing-metadata-v6-99.cjs --uninstall`, rebuild and reload. Restores v6.98 source and removes the new helper/tests/document.


## docs/history/map-interaction-investigations.md

# Hover metadata cache contract fix

The v6.120 warm-preview check called `TurboMetadataCache.has`, but the production cache implements `get`, `set`, `size` and `clear`. A truthy preview image ID therefore triggered a synchronous TypeError before preview scheduling, including cold individual-point hovers. The pointer callback caught that error and removed the new hover feedback. A user trace at 2D zoom 16.2 contains ten successful point picks followed by ten updateTurboHover TypeErrors, with no metadata entries or visible preview.

Use the existing TTL-aware `get` contract to check availability. This also rejects expired entries instead of bypassing cache expiry. Accurate nearby-image bearings, cold dwell, cancellation, image IDs, click behavior, selected sequence overview and rendering remain unchanged.

The runtime test now instantiates the production cache class instead of Map. With those realistic fixtures the previous implementation fails 12 of 16 cases with `this._turboMetadataCache.has is not a function`; the fix passes all 16. Tests include 2D and 3D zooms 16.2/19.9, cold points, immediate warm revisits, partial cards, expired entries, regional bearings, stale-response cancellation and active-route hints.

Apply from the widget root: `node apply-hover-cache-contract-fix.cjs`. Rebuild and reload Experience Builder. The installer does not run tests or a build. `--dry-run` checks targets without source writes; `--uninstall` reverses only unchanged installed blocks. A standalone uninstaller is also provided. This narrowly fixes the reproduced crash; it does not claim to eliminate all cold network latency or validate live SDK terrain projection.


## docs/history/map-interaction-investigations.md

# Isolate optional detection-hover failures

Imagery coverage picking and object/sign picking run independently inside the shared pointer callback. Previously a rejected native detection lookup reached the outer catch, which cleared the imagery pulse/card/highlight and could display an imagery lookup warning even after coverage picking succeeded.

The detection lookup now handles its own rejected promise, returning no feature. The existing imagery result and Places branch can proceed. A successful SDK or native detection hit retains its original priority and clears/replaces the transient imagery tooltip as before. Current-view/current-pointer guards remain in place. An optional failure is logged only through the existing debug logger, with no error object, credentials or source URL included. Coverage misses remain misses; no placeholder image identity is invented.

The change adds no downloads, retries, timers, polling, or renderer work. It does not change click handling, hover bearing selection, thumbnail retention, selected sequence overview or native circle geometry.

## Validation

Eight real pointer-callback tests cover successful coverage before and after an optional failure, both 2D and 3D, native/SDK detection priority, coverage misses, cancellation and view replacement. Five of those tests fail on the previous implementation; all eight pass with isolation. Together with existing click, preview, bearing, cache and selected-sequence checks, 133 targeted tests pass. These are controlled asynchronous fixtures; a full Experience Builder build/live-host visual check was not available in this workspace.

## Install

From the widget root outside `src`:

    node apply-hover-failure-isolation.cjs

Rebuild and reload Experience Builder. `--dry-run` checks targets without writing source. A standalone uninstaller reverts only this change and its added test/documentation. Earlier hover/click improvements remain. Edited source blocks are refused. Tests and builds are not run inside the installer.


## docs/history/map-interaction-investigations.md

# Hover resumes after coverage readiness v6.121

Requires v6.120. A successful current coverage refresh queues one recheck at the last observed map-pointer position. The recheck calls the widget's existing pointer-hover handler directly; it does not emit a synthetic event to the host map or introduce another picker.

This covers two cases: a pointer reaches a green line while the map is still moving, and the delayed zoom-end refresh clears a hover that appeared just before it began. Once the native coverage refresh completes, a stationary pointer can resume hover without a mouse nudge. Cold local tile data may still need loading through the existing picker. The map's moving-state guard, coverage debounce and data-readiness requirements remain intact.

The owner stores only primitive pointer coordinates, coalesces one queued callback per successful refresh revision and yields to newer real pointer input. Mouse leave and click forget the position. View replacement, handler cleanup and widget teardown dispose queued work. Failed, stale or detached refreshes do not trigger replay. Checks suppress replay for moving/interacting views, closed or disabled widgets, hidden documents, detached containers, changed revisions, out-of-bounds points, overlaid forms/popups and a shifted container. No polling loop, interval or additional native pointer listener is added.

Picking, click resolution, nearby-frame choice, cached-preview enrichment and brown-pulse/cone algorithms are unchanged. The existing click and pointer callbacks gain only last-pointer bookkeeping; successful coverage completion gains the one-shot notification. Metadata preview behavior from v6.120 remains in place.

Validation: 172 targeted checks passed, including controlled 2D and 3D traces using the real coverage-refresh method and hover callback. They verify movement-blocked hover resumes on readiness, refresh-cleared hover is restored, repeated readiness does not duplicate picks, newer input supersedes replay, clicking/leaving/disposal cancels it, failed loads do not poll, and view/revision/UI/DOM guards prevent stale hover. Existing coverage startup, cached preview, correct bearing, native selection, point identity, direction-hover anchor/pulse, image-first loading and Overture place-priority tests also pass. The Experience Builder development build passed with local SDK 5.0.4.

These are source-method/controller tests with controlled data, not a live rendering or network-latency benchmark. The user's localhost previewer was not opened from this environment. Verify by zooming out, moving onto a green line during the transition and holding the pointer still until coverage is ready. The brown hover should appear without a nudge when the pointer remains over selectable map content. Loading delays can still occur; the fix removes the need for another pointer event after readiness.

Install from widget root: node apply-hover-readiness-v6-121.cjs. Undo: node apply-hover-readiness-v6-121.cjs --uninstall. Guarded dry-run, install, repeated install, byte-exact rollback and edited-target refusal are checked. Preserve later source edits before rollback.


## docs/history/map-interaction-investigations.md

# Retain thumbnails during same-image hover enrichment

`renderImageryHoverCard` previously created a new image element and assigned its thumbnail URL each time cached metadata was enriched. Even when the browser reused downloaded bytes, this replaced already visible pixels with a loading placeholder until the new element loaded.

A WeakMap now retains one current image element per tooltip host. Reuse requires the same nonempty image ID, identical URL, an attached current preview, a visible card and either a pending image or a successfully loaded image. A loaded image is attached synchronously to the rebuilt metadata card; a pending image retains its request and receives the current card's callbacks. No second src assignment occurs during same-image enrichment.

Target/URL changes create a new element. Late load/error callbacks must match both the current WeakMap entry and attached preview before changing content. Failed images can be retried by later renders; hidden/cleared cards do not reuse prior thumbnails. Language bindings are refreshed for the retained image. The helper does not prefetch imagery or retain a history of hovered thumbnails.

## Validation

Seven Chromium checks exercise real image loading and the production card, styles and presentation owner: loaded-image identity and src-write count; pending-image reuse; stale target isolation; changed URLs; Arabic direction/alt text while retaining pixels; failed-image retry; and cleared-card isolation. The previous implementation fails the first case with a different image element and two src writes; the new implementation passes all seven. This demonstrates removal of DOM replacement/reload scheduling, not a measured reduction in network requests, GPU time or SDK image-opening latency.

No map picker, bearing policy, sequence overview, click handler or viewer code changes in this patch. A full Experience Builder host build and visual validation remain local-host checks.

## Install and rollback

From the widget root, outside `src`:

    node apply-hover-thumbnail-retention.cjs

Rebuild and reload Experience Builder. `--dry-run` checks targets without writing source. The installer does not run browser tests/builds. The standalone uninstaller restores this card change and removes its added test/documentation, retaining previous hover and click fixes. Conflicting edits are refused.

Run the browser fixture from the widget root with TypeScript, Playwright and Chromium available:

    MAPILLARY_TYPESCRIPT=/path/to/typescript.js node tests/hoverThumbnailRetention.browser.cjs

Optional paths: `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`, `MAPILLARY_WIDGET_ROOT`.


## docs/history/map-interaction-investigations.md

# Latest map click owns pending selection

The click callback previously acquired cancellation ownership only after awaited SDK/feature work. Two SDK hit tests could complete in reverse order and open the older image last. Stale results could also open a shared-note popup or open imagery after the widget closed.

A monotonic click revision is now captured before the first await. A click may commit only while its revision, active view and open-widget state still match. A newer click immediately aborts pending native detection and coverage-frame picks. This also applies when the new click is consumed by a route tool rather than imagery. Current shared-note, point-cloud, Places and detection priority is unchanged.

Guards run after SDK hit testing, native detection picking, sequence-ID metadata and regional nearby-frame resolution. Obsolete errors are discarded before logging a user-facing warning. Full cleanup and view-handler replacement invalidate revisions, preventing stale work from surviving close/reopen or reattachment to the same view. SDK hit tests themselves are not abortable; their late results are ignored. Already accepted viewer navigation retains its existing selection-request cancellation mechanism.

The patch adds no timers, downloads, listeners or animation work. It does not change hover presentation, cached previews, selected-sequence styles, coordinate lookup policy or image IDs.

## Validation

Four new real-callback regressions first reproduced reversed click order, stale note popup, post-close image opening and late detection consumption; all failed on the preceding version. After the fix, 117 targeted checks pass, including seven new click-race cases, accurate hover, faint-sequence retention, cache adoption, image-first loading and timing. Additional cases exercise an SDK rejection after a newer click, a sequence-ID transport that ignores abort, and a late regional frame result. Runtime source parses successfully. These are controlled asynchronous traces, not a live-host performance benchmark or full Experience Builder build.

## Install

Apply after `apply-faster-hovered-image-opening.cjs`, from the widget root:

    node apply-latest-click-ownership.cjs

Rebuild/reload Experience Builder. Use `--dry-run` to check compatibility without source writes. Tests/builds are not run by the installer. The standalone uninstaller restores this patch only and retains the earlier hover crash fix and faster-opening changes. Conflicting source edits are refused.


## docs/history/map-interaction-investigations.md

# Legacy whole-circle pulse · v6.68

Restores the original continuously breathing green circle with white outline. In 3D the whole symbol changes between size 10 and 14 points on the original 1200ms cycle, with updates bounded to approximately 30Hz. No separate halo, no two-cycle stop and no opacity fading. The 2D path remains the existing DOM pulse.

This is a visual comparison patch, not a claim that the intermittent flicker is fixed. It deliberately restores the legacy animation mechanism so the user can reproduce/compare it. Retains the zero vertical lift and v6.66 current-image anchor recovery; it does not undo v6.65 cone sizing. Brown hover, next-frame animation, selection, blue highlighting and playback are unchanged. No v6.64 scheduling is included.

Supports the exact v6.66 or v6.67 pulse/test sources. The guarded installer records the actual before bytes; uninstall returns to whichever of those versions was present.

After applying and refreshing, compare the same scene with a warm map/imagery cache: stationary, zooming/tilting, and playback. If flicker recurs, distinguish the whole green marker disappearing from normal size change, and note whether the brown/next-frame marker disappears at the same time. A short recording is useful. No diagnostic listeners or logging are introduced by this patch.


## docs/history/map-interaction-investigations.md

# Regional hover bearing consistency v6.119

Requires v6.118. Regional coverage lines carry a representative image ID. At zooms 6 through 14 (exclusive), clicking a line resolves a nearby frame, which can be a different image with a different capture heading. Hover metadata now resolves that same nearby-frame policy before showing the preview card and bearing, instead of drawing the representative image's heading beside the click target.

The existing CoverageFrameLookup shares nearby tile work between dwell and click. The metadata request is made for the resolved image and its result stays in the image-ID cache. When moving along one line, a changed local lookup target cancels only stale metadata and clears its bearing decoration; the brown pulse identity, animation and physical anchor remain with their existing owner. Late responses cannot replace the current target. A missing frame does not borrow an unrelated representative heading or capture date. A complete active sequence uses the same in-memory nearest-frame policy as click; long scans yield every 4,096 frames and honor cancellation. Organization-filtered contexts retain their existing lookup path.

Individual image points keep their exact identity. Overview points below zoom 6 retain the existing representative policy, except for the already-established active-loaded-sequence nearest-frame case. No full-route downloads are added. The nearby lookup is already warmed by the existing regional hover owner, and the metadata/card now describe the resolved frame.

Panorama previews prefer the current viewer's viewing direction, with capture metadata as fallback when no finite viewer direction is available. A panorama has no unique viewing direction; the orange selected cone follows the viewer's actual bearing, which can change with user rotation or SDK transitions. Flat-image metadata retains computed-compass-first precedence. This change does not promise identical panorama cones after arbitrary viewer movement.

Click picking, accepted click resolution, sequence identity, native selection, nearestCoverageImage, prepareCoverageFrameHover, brown-pulse methods and cone projection methods are unchanged. No new animation loop, map interaction handler or projection transform is introduced. A malformed duplicate comma in the elevation-profile factory argument list was also removed after the strict source parse check exposed it; its intended four arguments remain unchanged. The image-first unit fixture supplies its English presentation stub so error-path checks exercise current localized runtime code.

Validation covers 2D zoom 7 and 3D zoom 8—the reported paths—with a representative and resolved image deliberately given different bearings. Tests verify the metadata request/cache/card use the resolved ID while pointer identity stays unchanged; moving along a single representative invalidates stale work; complete-route selection is local; filtered and missing/cancelled cases remain safe; and long scans yield before completing after cancellation. Existing bearing/projection, native selection, click identity, direction-hover anchor/pulse and image-first loading checks pass. Experience Builder development build passes with local SDK 5.0.4. Installer dry-run, install, repeated install, exact uninstall and edited-target refusal are validated.

The supplied localhost pages are on the user's machine and were not opened from this environment. These checks exercise extracted real runtime methods and helpers with controlled data, not the live Mapillary metadata or full deployed scene. Verify the two reported previewer URLs after applying the patch. No GPU performance benchmark or claim of exact SDK panorama transition behavior is made.

Install from the widget root: node apply-regional-hover-bearing-v6-119.cjs. Undo: node apply-regional-hover-bearing-v6-119.cjs --uninstall. Preserve later source edits before rolling back; edited targets are refused.


## docs/history/map-interaction-investigations.md

# v6.98: Preview capture bearing at low zoom

Requires v6.97. Run `node apply-low-zoom-hover-bearing-v6-98.cjs`, rebuild and reload.

Remove the representative-point exclusion for the hover sector. A low-zoom hover that already has an image preview can now show that capture's bearing. Metadata ID must exactly match the current hovered image ID. This is the preview image's heading, not a heading for the whole sequence or group. No additional requests or picking changes are introduced. Missing bearing and panoramic images remain pulse-only. The fixed anchor and original brown pulse remain unchanged.

Rollback: `node apply-low-zoom-hover-bearing-v6-98.cjs --uninstall`, rebuild and reload.


## docs/history/map-interaction-investigations.md

# v6.88 experimental native mesh current-image marker
Requires v6.87. Native SceneView trial: one retained Graphic/MeshSymbol3D with green disk, white rim and raised orange sector as closed mesh material components. Local east/north/up metre coordinates, absolute ground height sampled from rendered terrain or known flat ground, no always-visible override and no cast shadows. Native depth/building occlusion applies. Actual terrain mesh draping across the complete shape is not provided; it is a small local tangent-plane object.

Camera scale is estimated from projected local east/north basis. Geometry changes at most ~10Hz and only when parameters/height or scale change; scale has 3% hysteresis. No pulsing or symbol replacement. Existing Graphic/image_id used by selection stays intact and hidden while the trial marker is presented. No FPS improvement promised. Native layer readiness is awaited while the existing SVG remains available. Zoom below10, unavailable terrain or needed world radius beyond ~250m switches automatically to v6.87 SVG, preserving readable overview without a kilometre-sized physical object. This is a hybrid native/overview experiment, not native at every zoom. One shared RAF scheduler services native checks and optional SVG fallback.

2D unchanged. Cleanup removes native layer/Graphic and fallback SVG. Selection, hover/picking algorithms untouched. --uninstall restores v6.87 exactly. Rebuild/restart/hard-refresh after installing or uninstalling. This is a visual experiment; it does not establish a fix for the historical SDK flicker issue.


## docs/history/map-interaction-investigations.md

# Current-image anchor recovery and 3D pulse stability · v6.66

Apply after v6.65, with v6.64 uninstalled. This update contains no playback scheduling or hover/selection algorithm changes.

Refresh/shared-link fly-in can start below zoom 14, where native individual-image anchor resolution intentionally does no work. Previously, the eventual zoom/stationary callbacks did not retry that resolution, leaving the pulse at provisional image/API coordinates until a later image event or exact marker click. The existing resolver now gets a current-image-only retry when the view settles, when zoom callbacks occur in an already stationary eligible view, and after stationary coverage style work finishes. Its existing cache, one-image tile lookup, in-flight deduplication and stale view/image/revision checks remain unchanged. Warm tile bytes are reused; the existing optional missing-tile download may be needed. No sequence enumeration or different-image selection is introduced.

The green 3D centre is now an immutable opaque icon on its own ground-draped layer. A separate, independently owned ground-draped layer carries the animated halo, keeping its symbol replacement away from the centre's render resources. The former small vertical offset is removed, so the centre uses the same ground position as the cone/accepted image anchor. The halo retains the existing 1200ms rhythm and one bounded animation callback; there is no second animation loop. Same-image anchor correction updates both geometries without replacing the core, recreating layers or resetting the pulse phase. View/image changes and disposal release both layers.

2D keeps its existing DOM pulse. Picking, accepted hover/click positions, blue styling and native alignment formulas are unchanged. The core can initially use provisional API coordinates while the current image's tile anchor is being resolved; after successful resolution it moves to the exact tile presentation point without requiring a hover/click.

## Local verification

1. Refresh a shared image link that begins zoomed out, let fly-in finish, then zoom closely in 3D. After the tile anchor resolves, the cone apex, green centre and selected tile point should coincide without hovering first.
2. Hover/click the same image afterward: it should not produce another apparent centre correction. Selecting a different image should still work exactly as before.
3. Observe the green core through several pulse cycles, terrain loading, rotation/tilt and playback. The centre should stay solid while its halo pulses. Check 2D as well.
4. Toggle fullscreen and 2D/3D, then close/reopen the widget. No old pulse/halo layers should remain.

Actual ArcGIS objects were exercised in a Node check across 1000 animation ticks, confirming a stable core symbol, shared corrected geometry and cleanup. This verifies SDK object semantics, not live GPU rendering or a complete deployed fly-in. Verify the reported flicker/alignment behavior in your running app.


## docs/history/map-interaction-investigations.md

# Cached legacy pulse experiment · v6.71

Apply after v6.70. Uses the public Graphic.symbol setter to notify SceneView, but reuses a finite set of 17 symbols rather than constructing/cloning one on every animation update. The first symbol is the initial marker; 16 additional symbols are built once per newly displayed image at quarter-point sizes from 10 to 14. The original 1200ms breathing cycle remains, with assignments bounded to roughly 30Hz and skipped when the quantized size is unchanged.

No per-animation symbol cloning. The same Graphic, geometry anchor and layer remain through a cycle; same-image corrections preserve phase and pool. Different images create their own bounded pool. Cleanup cancels the animation and releases its owned graphics/layer as before. No halo, opacity fading or vertical lift is introduced. 2D, anchor recovery, cone sizing, brown/next-frame hover, selection and blue highlights stay unchanged.

This tests whether repeated construction contributes to the interruptions. It still assigns different symbol references to request the supported redraw; that assignment itself could still trigger flicker. Actual animation and stable visibility must be checked in the app.

## Verify

1. Refresh after installation and open the same image in 3D.
2. Confirm the green circle visibly breathes. Repeat the stationary, hover and camera gestures from the recording.
3. Export:

   ```js
   copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
   ```

The mode is `3d-cached-symbols`. While active, `animation.poolSize` should be 17 and `unexpectedSymbolAssignments` normally zero. `pooledSymbolAssignments` and `symbolReplacements` increasing is expected here: the change is reuse, not elimination of assignments. Size updates include observed assignment values; they do not measure rendered FPS. Expected cached assignments are aggregated, avoiding per-frame Console messages/history entries. Visibility/removal and unknown-symbol events remain explicit.

Report both visual breathing and whether disappearance persists. A correct report alone does not prove the GPU rendered the animation smoothly.

## Roll back

```sh
node apply-cached-pulse-symbols-v6-71.cjs --uninstall
```

This restores v6.70. To return all the way to the deliberately frozen v6.69 comparison, also uninstall v6.70 afterward:

```sh
node apply-pulse-icon-animation-v6-70.cjs --uninstall
```

Refresh after each installed-state change. Both rollbacks preserve the alignment/cone fixes. No changes to hover algorithms are needed for this experiment.


## docs/history/map-interaction-investigations.md

# Temporary frozen-marker diagnostic · v6.69

Apply after v6.68. This is a diagnostic comparison, not a permanent animation redesign or a flicker fix.

3D keeps the same green circle/white outline, ground placement, occludedVisibility setting and exact tile-anchor recovery, but freezes at the legacy midpoint size of 12pt. No pulse animation frame is scheduled in 3D. 2D animation, brown hover, direction/next-frame animation, cone cap and selection/hover algorithms are unchanged.

An event-driven probe watches the frozen Graphic's symbol/visibility/geometry, its icon size, layer visibility/opacity/destruction, Graphic and map-layer membership, and the SDK LayerView's visible/suspended state when available. One bounded 200-event history is exposed as `window.__mapillaryPulseProbe`; it targets the most recently attached 3D pulse if multiple widgets exist. It records no image IDs, coordinates, access tokens or request URLs. There is no polling, timer or extra animation loop. Watchers are removed when the owner changes or disposes, including late LayerView resolution guards. History remains available after disposal for export.

## Test

1. Install, refresh, and open the same image in 3D. The green circle should be steady. Widget debug mode is not required.
2. Repeat the gestures from the recording: stationary view, hover elsewhere, zoom/tilt, and next-frame interactions. Note whether the green core still disappears.
3. In DevTools Console, choose the app's frame. Filter by `Mapillary pulse probe` if desired (Info messages must be enabled). Confirm `attached-frozen` exists.
4. Optionally mark an observation:

   ```js
   window.__mapillaryPulseProbe.mark('blink observed')
   ```

5. Export the bounded history and send it with your observation/recording:

   ```js
   copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
   ```

If the global is undefined, confirm the app frame and that a current image was opened in 3D after the refresh. The probe only attaches to 3D green markers.

## Interpret

- A repeated disappearance of the frozen marker means size animation alone is not sufficient to explain the issue.
- A `symbol-change` or `icon-size-change` is unexpected while this frozen comparison is idle; it identifies external modification.
- `graphic-membership` or `layer-membership` becoming false identifies actual collection removal. `owner-dispose` records intentional pulse cleanup before its watchers are removed; a subsequent attach records recreation.
- Visibility/opacity/LayerView events can explain an application- or SDK-visible suspension. A quiet log while the marker disappears is consistent with an unobserved rendering/occlusion issue, but is not proof of a GPU cause.
- Absence of flicker on one run is not proof the animation caused it. Repeat warmed comparable runs with the legacy patch restored via uninstall.

This diagnostic can itself change timing slightly because it adds observers/logging. Remove it after the comparison:

```sh
node apply-pulse-flicker-probe-v6-69.cjs --uninstall
```

Refresh after installation and rollback. Rollback restores the exact v6.68 files.


## docs/history/map-interaction-investigations.md

# v6.74 fresh marker comparison
Requires v6.73. Rebuild/restart and refresh; report mode must be 3d-fresh-comparison-v74.

Select a single image, stop playback, hold camera still. Run `window.__mapillaryPulseProbe.compare()` in Chrome Console. This hides the original pulse and pauses its symbol assignments. A fresh Graphic/GraphicsLayer uses standalone-equivalent public settings: WGS84 XY without source Z, ground draping, green circle/white outline, visible occlusion, cloned symbols at 10–14pt over 1200ms, 32ms update limit. Uses existing SDK factories/autocasting, not a second SDK. No unsupported depth-test property, image attributes or coverage anchor. Terrain/basemap/camera unchanged. May appear at a different position if coverage anchoring had shifted the original. Comparison uses the existing animation scheduler and SceneView, so these are not isolated. It compares a bundle of configuration differences, not one causal variable.

Observe 20 seconds and report smooth/flicker; run `copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))`. Main current/animation fields describe original hidden pulse; comparison field describes temporary marker and assignments.

Run `window.__mapillaryPulseProbe.restore()` to remove comparison and resume original. Changing images or disposing the pulse cleans it up automatically. You can first isolate other layers, then compare; restore returns all original visibility. Do not isolate after compare (isolate resets comparison). No selection or hover algorithms modified. Diagnostic only, not a production fix.


## docs/history/map-interaction-investigations.md

# Legacy pulse with in-place icon sizing · v6.70

Apply after the v6.69 frozen-marker diagnostic. Restores the original continuously breathing green circle/white outline: 10–14pt over 1200ms, with 3D updates bounded to about 30Hz. The existing IconSymbol3DLayer Accessor's `size` changes directly. The Graphic, symbol and icon objects are retained; the animation performs no symbol cloning or reassignment.

No halo, opacity fading or vertical lift. Current-image anchor recovery and cone sizing remain. Same-image corrections move geometry without restarting phase. Existing 2D pulse, brown hover, next-frame animation, picking/selection and blue highlights are unchanged.

The probe remains available as `window.__mapillaryPulseProbe`. Its report mode is now `3d-inplace-icon-size`. Frequent size notifications are aggregated instead of logged individually:

```js
copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
```

`animation.sizeUpdates` counts observed SDK property notifications. `minSize`/`maxSize` describe observed values, normally reaching 10 and 14 after a full cycle. `symbolReplacements` should remain zero during normal same-image animation. These counters are not visual frame measurements and do not prove that SceneView visibly animates. Rare symbol, visibility/removal and LayerView events remain in the bounded history; no per-frame Console logging is added. `clear()` resets both history and animation counters.

## Check both behavior and stability

1. Refresh after installation and open the same image in 3D.
2. Confirm the circle actually breathes. If it stays frozen despite increasing size counters, report that explicitly: the SDK object updates would be reaching the Accessor but not appearing in the renderer.
3. Repeat the recorded stationary/hover/zoom/tilt interactions. Does the green marker still disappear?
4. Export the report above. Zero symbol replacements plus visible breathing without flicker is the desired result; it is not assumed from the object-level tests.

Rollback to the frozen v6.69 diagnostic:

```sh
node apply-pulse-icon-animation-v6-70.cjs --uninstall
```

This remains a browser-verification candidate, not a proven universal flicker fix. Actual ArcGIS object checks verify in-place Accessor updates, identity, notifications and cleanup; target GPU rendering must be observed in the running app.


## docs/history/map-interaction-investigations.md

# v6.78 live visibility isolation diagnostic
Requires v6.77. Rebuild/restart and hard refresh. Mode 3d-live-isolation-v78.

Fixes snapshot-only isolation: existing top-level operational layers and view graphics are hidden; after-add captures new ones; public reactiveUtils.watch with sync:true re-hides visibility reactivation. Basemap and ground unchanged, groups hidden via parent. Original pulse and temporary comparison layer exempt. No RAF polling or selection/hover algorithm changes. Background requests, layer loading and layout still run; hidden resources remain loaded. This is visibility isolation, not removal/unloading or proof against every render interaction. Hidden parent cannot suppress a DOM overlay.

Install then select one image, playback stopped. Run isolate(), compare(), clear() in that order, with no pauseSceneWork calls. Allow coverage to finish, rotate camera and observe 30 seconds. Report observed smooth/flicker plus report(). Verify isolationStatus.active true and unexpectedVisible 0. lateEntries and suppressions show what was caught. Counts include initial hides; alone they do not prove a late reactivation. Original pulse current.layerVisible false is expected during comparison.

show(index) explicitly exempts one captured entry from the lock, restoring captured visibility. Fresh isolate() removes all exceptions. restore() removes locks before returning captured visibility; changing image/disposing owner also cleans up. New entries restore their visibility as captured on insertion; external visibility changes during test are overwritten by restore. Removed/destroyed objects do not get re-added, created or resurrected. No mutation unless isolate() explicitly enabled. Use only for a brief diagnostic with fixed image.

The settings export remains separate, normal reports contain no service URLs/coordinates. History remains bounded. This patch corrects diagnostic coverage; it is not a flicker fix.


## docs/history/map-interaction-investigations.md

# v6.73 temporary rendering isolation
Requires v6.72. Pulse animation and selection/hover code unchanged.

Install, rebuild/restart, refresh. Confirm report mode 3d-render-isolation-v73.
Select one image, leave playback stopped, keep camera still, and run:

```js
console.table(window.__mapillaryPulseProbe.isolate())
```

This temporarily hides existing top-level operational layers and existing view.graphics, leaving the pulse, basemap and ground intact. It does not remove or destroy them. Group layers appear as a single entry. DOM overlays, basemap layers, and graphics created afterward are not isolated. Do not select other images or interact with hidden coverage during the test.

Observe for 20 seconds and report smooth/flickering. Export:

```js
window.__mapillaryPulseProbe.mark('isolated smooth') // or isolated blink
copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
```

Only if isolation is smooth, bring back one originally visible entry using show(index), for example show(0). Entries are additive; repeat isolate() to start each independent comparison. For nested groups this does not isolate their children separately.

```js
window.__mapillaryPulseProbe.show(0)
```

Restore original visibility when done:

```js
window.__mapillaryPulseProbe.restore()
```

Disposing/replacing the pulse also restores it automatically. Changes made by other code to these same visibility flags during isolation can be overwritten by restore; use only for this short stationary test. No identifiers, layer titles, coordinates or URLs are exported. Histories remain bounded; view.updating is now counted and recorded at most every 250ms. This test does not change rendering configuration, animation timing, selection or hover algorithms and is not a production flicker fix.


## docs/history/map-interaction-investigations.md

# v6.77 read-only SceneView settings export
Requires v6.76. Rebuild/restart, hard-refresh. Mode: 3d-scene-settings-v77. Adds sceneSettings() to existing probe, no automatic serialization or map mutation. No animation/selection/hover/render configuration changes.

Restore diagnostic modes first, select one image, rotate to a problematic camera angle, release camera. Run:

```js
window.__mapillaryPulseProbe.restore()
copy(JSON.stringify(window.__mapillaryPulseProbe.sceneSettings(), null, 2))
```

This separate export includes camera and marker coordinates, basemap/ground definitions and service addresses to construct a matched standalone test. URL query strings/fragments/userinfo and credential-like keys are removed. Other JSON metadata including portal item IDs/service hostnames remain; review before sharing. Normal report() remains free of coordinates/URLs. Missing settings are null rather than inferred. Private service URLs/portal IDs do not guarantee anonymous access in the standalone app; no credentials or authentication flows are copied. Operational layers are summarized without service URLs, labels, geometry or attributes.

Known standalone baseline: SDK 5.0.10 selected, public SceneView, qualityProfile high, no basemap, explicit beige ground, optional WorldElevation3D, atmosphere/stars off, green point in WGS84 XY draped on-ground. Host SceneView settings must be observed rather than assumed. Widget solar tool can change scene lighting while active; snapshot captures current environment only. A snapshot does not expose private render state or establish the flicker cause. Next step is building a matched standalone test from the exported settings, not permanently changing production settings.


## docs/history/map-interaction-investigations.md

# v6.75 scene callback diagnostic
Requires v6.74; rebuild/restart and refresh. No callbacks suppressed by default.

Camera changes still call drawCone and can reorder the hidden original pulse above a temporary marker. The stationary Turbo callback still enables coverage, resolves the pulse anchor and may request sequence preview. Visibility isolation alone does not stop those paths. This establishes candidate activity, not a cause of flickering.

Select one image, stop playback. Run in order:

```js
window.__mapillaryPulseProbe.isolate()
window.__mapillaryPulseProbe.compare()
window.__mapillaryPulseProbe.pauseSceneWork('both')
window.__mapillaryPulseProbe.clear()
```

Wait briefly, rotate to the angle that triggered flicker, stop moving and observe for 30 seconds. Export report. The pause skips future cone rendering and the stationary Turbo callback, not in-flight tasks, unrelated handlers or all layer reordering. Comparison keeps animating normally. No selection, hit testing or hover decisions changed. Do not use playback/change images during this test; coverage refresh and cone display are intentionally paused. Pause is opt-in and tied to current pulse owner; restore or changing images resets it.

`pauseSceneWork('cone')` or `pauseSceneWork('settled')` can isolate each path later. Skipped counts confirm whether the guards ran. Use `window.__mapillaryPulseProbe.restore()` afterward to remove test marker, restore visibility, resume original animation and re-enable callbacks. No forced coverage/cone refresh runs on restore; next normal camera change triggers it.

This patch is diagnostic, not a fix. Installer --uninstall restores v6.74 exactly. Public SceneView rendering/environment settings belong to the host Experience Builder map; this widget does not create that SceneView. Standalone uses a different basemap/ground setup, which remains another hypothesis.


## docs/history/map-interaction-investigations.md

# v6.76 stationary stage diagnostic
Requires v6.75, rebuild/restart and hard-refresh. Mode: 3d-stationary-split-v76.
Adds pauseSceneWork('coverage'), ('anchor'), ('preview'). Only the named stage in the Turbo stationary callback is skipped; cone remains enabled. These controls do not suppress calls to these functions from other paths, or cancel already-running work. Default off, automatically reset by restore/disposal. No production fix or selection/hover algorithm changes.

For each test start fresh: isolate(), compare(), pauseSceneWork('anchor'), clear(). Keep the same image selected, playback stopped. Rotate camera to prior problematic angle and wait stationary 30 seconds. Export report and observation. Then restart with isolate(), compare(), pauseSceneWork('coverage'), clear(). Label reports anchor paused / coverage paused. These fresh comparison cycles prevent carrying over an already flickering temporary marker. Do not use restore between command setup and camera test; it resets the pause.

Third stage preview is independently pausable if neither result isolates the problem; it is not silently grouped with coverage or anchor. Use restore() afterward. Report skipped:<stage> counts verify guard execution; skipped counts do not prove a graphics operation would have been necessary or caused the blink. Coverage refresh may have internal effects beyond its name, so a successful test identifies a call path, not yet the exact rendering fault.


## docs/history/map-interaction-investigations.md

# v6.79 steady 3D active-image marker
Requires v6.78. Install from widget root, rebuild/restart Experience Builder and reload the page. This removes active pulse diagnostics and their runtime callback guards; no console commands are required afterward. Reload is necessary to clear previously running isolation/comparison objects. Historical diagnostic docs/installers remain for audit/rollback but their commands no longer exist in this build.

3D uses a steady 12 pt green icon with a white 2 pt outline, on-ground placement and occludedVisibility visible. It returns before any RAF scheduling or symbol pool setup. Same-image anchor updates and ownership/cleanup remain intact. This is the fixed-size strategy the user previously confirmed did not blink in v6.69, not a claim that the underlying renderer issue was identified or fixed for every scene. 2D retains its 1200 ms breathing overlay/fallback.

No changes to sequence selection, hovering, coverage completion logic, cone size or anchor recovery. Diagnostic guards revert exactly to the pre-v6.75 runtime. Source changes: SelectionPulse.ts, runtime/widget.tsx. Tests: selectionPulseGround.test.cjs and pulseVisibilityProbe.test.cjs (now asserts diagnostic removal). Added this document.

Dry-run with --dry-run. Installer is idempotent and checks conflicts before writing. --uninstall restores v6.78, including its diagnostics, rather than uninstalling all historical patches. Apply/uninstall requires rebuilding and reloading. No need to run earlier diagnostic uninstallers.


## docs/history/map-interaction-investigations.md

# Widget pulse context diagnostic (v6.72)

Requires v6.71 installed. No animation, selection, hover, or routing changes.
Records marker geometry reassignment versus position changes (SDK geometry.equals), elevation settings, view transitions, map layer collection changes and graphics collection churn. Other-graphics events aggregate across layers; they do not identify an individual layer or prove causation. Property mutations inside other graphics are not monitored. Counts include every collection event; history for each context event is limited to one per 250 ms and 200 entries overall. No per-frame console logging. Geometry snapshots remain private and are never exported. No coordinates, image identifiers or service URLs are included.

After applying and rebuilding, reproduce with one selected image first. In Chrome Console run:

```js
window.__mapillaryPulseProbe.clear()
```

When a blink occurs, run promptly:

```js
window.__mapillaryPulseProbe.mark('blink')
copy(JSON.stringify(window.__mapillaryPulseProbe.report(), null, 2))
```

Paste the report. Repeat with smooth pulsing for comparison. Image selection legitimately creates new owners; first keep the selected image fixed. The report cannot detect disappearing pixels by itself. This is temporary instrumentation, not a flicker fix. Uninstall with the same installer and --uninstall, then rebuild.


## docs/history/map-interaction-investigations.md

# Responsive accurate hover previews v6.120

Requires v6.119. Correct regional previews now bypass the artificial dwell when both the frame mapping and its metadata are cached. This keeps the resolved-frame bearing policy while restoring immediate presentation for warm targets.

## Behavior

The brown pulse and picking still run before metadata work. A completed nearby-frame hint is read through CoverageFrameLookup.peek, which does not start a producer, acquire a consumer, extend expiry or change the accepted click's resolver. If its image metadata is ready, the card and cone are presented in the same hover handler without a timer or repeated tile/Graph request.

A partial cached card can display immediately while its missing bearing metadata waits for the remaining hover pause. A cold target retains one pause before resolving; resolution time counts toward that pause, so it does not add another full delay before requesting metadata. The regional minimum remains 150 ms for cold work (or the configured details dwell if longer). Leaving or changing target cancels pending enrichment through the existing owner and signal guards. An incorrect representative cone is not displayed while the correct frame is unknown.

The active loaded sequence has a different click policy from the tile hint path. Its completed local scan results use a separate bounded hint cache tied to the view, exact location/sequence key and immutable route-array reference. Entries expire after 30 seconds, at most 16 are retained, and a view or route change invalidates reuse. Cold long-route scans still wait for dwell and yield cooperatively; a cache read does not scan the route. Tile hints never override active-route selection policy.

Cached identity is checked against the metadata entry before rendering. Resolved images do not borrow a different representative's capture date. Missing/expired hints and failed lookups cannot produce an immediate bearing. Existing panorama direction handling, click selection, coordinate anchors, brown-pulse animation and cone projection remain unchanged.

## Validation

90 targeted regression checks passed. Fake-clock fixtures using the real extracted runtime method verify synchronous warm card/cone presentation with no metadata timer, lookup or Graph request; immediate partial cards followed by delayed enrichment; one cold dwell; leave cancellation; and loaded-route cache isolation. Cache tests cover pending versus settled hints, TTL expiry without refresh/refetch, view ownership, misses/errors, reuse by clicks, route-reference invalidation and bounded local retention. Existing nearby-frame correctness, stale-response, native selection, identity, direction-anchor/pulse and image-first checks also pass. Runtime source comparison confirms selection, nearest-frame and pulse methods are unchanged. Experience Builder development build passed using local SDK 5.0.4.

These checks establish scheduling and cache behavior, not a deployed-app latency or FPS benchmark. Cold tile/metadata downloads, first thumbnail loads, browser decoding and the existing cone animation frame cadence can still affect perceived response. A different uncached position is a cold target even if another nearby position has been previewed. The user's localhost pages were not opened from this environment; verify the same zoom-7/zoom-8 cases in the previewer after installation.

Install from the widget root: node apply-responsive-hover-previews-v6-120.cjs. Undo: node apply-responsive-hover-previews-v6-120.cjs --uninstall. Guarded dry-run, install, repeat install, byte-exact rollback and edited-target refusal are checked. Preserve later source edits before rollback.


## docs/history/map-interaction-investigations.md

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


## docs/history/map-interaction-investigations.md

# v6.84 screen-sized direction fan
Requires v6.83. Keeps the fixed green circle/white outline and no pulse. Browser path replaces the metre-sized native wedge with one pointer-transparent SVG fan anchored in screen coordinates. Default radius 24 CSS pixels, relative length setting bounded 18–32px; central 9px opening keeps the marker unobscured. No minimum zoom threshold: remains visible at overview/globe zoom while its anchor is in the viewport and can be projected. Heading uses projected local ground direction, with camera/rotation fallback. It indicates direction, not a true physical field-of-view footprint. Extreme/offscreen/unknown near terrain can hide the fan safely. No animation, marker symbol swaps, camera mutation or container positioning writes.

One owned RAF tracker caps positioning to ~30Hz; at most two projections per update and one rendered-height query, no network elevation fetches. Existing native cone graphics are cleared on transition, not every frame. Cleanup handles selection clear and view transfer. Ground renderer remains as non-DOM fallback (legacy helper tests still cover it). An SVG overlay intentionally stays readable rather than flattening into terrain at shallow tilt.

Files: new ScreenDirectionCone.ts; runtime cone dispatch/lifecycle; tests projectedConeRadius.test.cjs plus new screenDirectionCone.test.cjs. --uninstall returns to v6.83 metre-sized cone. Rebuild/reload after installation/uninstall.


## docs/history/map-interaction-investigations.md

# v6.93: Ground-aligned 3D navigation-arrow hover

Apply over the latest GitHub sources plus v6.92: `node apply-stable-direction-hover-v6-93.cjs`, rebuild and reload.

The viewer-arrow hover target in 3D is a steady amber disk with a white rim. It has no lifted callout, pulse interval or repeated symbol replacement. A marker-only ScreenDirectionCone projects it onto rendered ground and caches settled projections. Only one overlay/tracker exists while a target is hovered; clearing hover disposes it. The existing coverage display anchor is used where available. No image lookup, sequence selection, picking or coverage pipeline changes are included.

A steady native icon remains as the fallback when the projected overlay is unavailable. The matching minimap marker remains. 2D keeps the existing yellow pulse. Graphic identity is reused when changing 3D targets. Cleanup removes graphics from the original view and minimap even after the active view changes.

Validation: 3 target lifecycle tests, 15 shared ground-projection tests and strict owner compilation pass. This removes the lifted symbol and animated 3D symbol replacements; alignment and flicker still require a visual check on the user's SceneView/GPU.

Rollback: `node apply-stable-direction-hover-v6-93.cjs --uninstall`, rebuild and reload.


## docs/history/map-interaction-investigations.md

# v6.97: Steady bearing cone around a pulsing brown point

Requires v6.96. Run `node apply-steady-hover-cone-v6-97.cjs`, rebuild and reload.

The brown pulse and bearing sector are siblings inside a fixed 60px anchor. Only the brown disk changes dimensions; the cone's parent center no longer depends on its pulse size. Both share the original map position and RAF clock. Pulse timing, dimensions, color, metadata loading and picking remain unchanged.

SDK build passed. A real Chromium test exercised the actual hover runtime methods and sector helper with fixture map projection: cone bounds remained fixed across two 1200ms pulse cycles at a fractional-pixel anchor, pulse width varied from 6 to 11px, one RAF remained scheduled and cleanup removed the wrapper. User SceneView visual validation remains appropriate.

Uninstall: `node apply-steady-hover-cone-v6-97.cjs --uninstall`, rebuild and reload. This restores the exact v6.96 runtime and removes this document.


## docs/history/map-interaction-investigations.md

# v6.86 unified current-image marker
Install directly over v6.85 (no separate tilt patch needed). One SVG/DOM element anchors a round green circle with white outline plus the direction fan. The fan alone uses projected ground-plane tilt/shear normalized against enlargement. The circle remains screen-facing and fixed 16px outer diameter. Viewer zoom still lengthens/narrows the fan; map zoom has no cutoff. No pulse, dark rim or shadow.

Native Graphic/image_id/geometry and layer ownership remain as state and fallback. While the combined SVG marker is actually positioned/visible, the native 3D layer is hidden, so two visible markers are not rendered. Projection/DOM failure restores native visibility. This removes duplicate visible rendering, not every native allocation; no FPS improvement promised. Existing selection/hover/picking algorithms unchanged. 2D retains its existing native/DOM pulse and shows only the fan portion in this SVG.

Cone visibility and marker visibility are independent: clearing cone keeps circle and tracker, clearing circle can retain cone, clearing both or transferring view removes element/tracker. New image hides old fan until direction updates. Static marker fields and navigation continue reading the retained Graphic. One projection when circle-only; at most three when fan/camera projection changes, cached while settled. No elevation network requests or map-container CSS writes. --uninstall restores v6.85 separate native circle and fan. Rebuild/restart/reload after install/uninstall.


## docs/history/map-interaction-investigations.md

# v6.85 viewer zoom length
Requires v6.84. Fixes the 32px radius ceiling that was reached by the first real viewer step (length=10). Viewer steps [10,15,20,30] now map to fan radii [32,39.19,45.25,52] CSS pixels while existing spreads [60,40,30,20] narrow. Initial size stays 32px; map zoom does not affect it. SVG canvas grows to 120px with its anchor at center60 to prevent clipping; transparent padding does not intercept input. Native marker/white outline, bearing projection and central opening unchanged. Same element/tracker reused, no animation, symbol swaps or callback changes. Upper radius remains 52px. --uninstall restores v6.84, then rebuild/reload.
