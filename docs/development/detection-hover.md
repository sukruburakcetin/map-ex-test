# Detection hover — stage 96 / P03 implementation review

`src/features/detections/detectionHover.ts` owns one tag component's pointer/click listeners, delayed tag updates, target flashing, label emphasis and cleanup. The widget retains the small `setupDetectionHover` entry and a typed live host for viewer/image identity, labels and draft-marker operations. The existing component cleanup/refresh hooks and captured-viewer removal listener are preserved, so disable, tag replacement and viewer removal release the same work.

The workflow keeps the original 50ms pointer update and 500ms target-flash timings. Newer hits, leave and cleanup invalidate old tag queries. Click selection checks captured viewer/image identity and detection activation before changing a draft. Verified detection-to-feature associations still supply marker locations; camera coordinates are not substituted. Existing drafts retain their markers. There is no implicit note save or remote publication, service request, new dependency or asynchronous handoff.

`PanoramaDetectionLabels`, Mapillary OutlineTag/PolygonGeometry, detection colors/bounds and verified-location helpers are reused. Focus/all label modes, target priority, selected/hovered outlines, empty clicks and failure scopes retain their original behavior. Concrete component/viewer hooks are retained instead of introducing a second listener framework.

Twenty-nine frozen/current comparisons exercise the actual entry and live host with controlled tag hits/timers. They cover text/style states, target flashing, verified/unverified locations, existing drafts, malformed/empty choices, stale viewer/image/activation, reverse hit order, leave, failures and cleanup. The original label-toggle, detection-exploration and linked-preview assertions now follow the production binding; their geometry/color fixture boundaries remain explicit.

P03 implementation is complete across stages 94–96. Map click dispatch, pointer/container/touch/resume dispatch and detection hover are feature-owned, with independent precedence/cancellation tests. `onActiveViewChange` now binds the lifecycle and named handlers. Live-host acceptance remains pending under P12.

Retained boundary: `prepareMapClick` is a synchronous, approximately 60-line widget identity/capability binding. It joins the shared startup/workspace-note state, shared click revision, presentation ownership and coverage preview owners before any await. The existing exact/regional preview, route/annotation interception and cancellation comparisons cover it. Keeping that explicit binding avoids another broad mutable-resource facade merely to reduce line count. Async dispatch, feature priority, transport and imagery opening remain outside it. P10/P11 can review residual cross-feature policy as planned; this is not a claim that the entire widget is minimal.

Widget size: 10,404 lines (153 fewer than stage 95; 507 fewer across P03). P04 viewer/image coordination is next. P04–P12 comprise nine remaining packages, provisionally 14–23 further reviewable changes.

Validation: 3,158 passing portable tests / 222 files in workspace and clean installer-produced copy, zero failures or skips. Strict detection-hover module checking against the installed Mapillary/PBF/vector-tile declarations passes without temporary type aliases. Isolated ExB 1.20 module-graph build: zero errors/warnings. BOM/CRLF, targeted mutation and reversible installer checks pass. Full ExB 1.21/browser acceptance remains pending under P12.

Type-check scope is the moved feature module and its imported contracts, not a full host/whole-project strict typecheck. The isolated build is an ExB 1.20 webpack module graph, not a full ExB 1.21 application build or browser matrix. The workspace reconnect preserved source and delivered installers but cleared temporary dependencies; the test environment was rebuilt outside the repository using the same reviewed versions. No host dependency, manifest, lockfile or Git operation was changed.

Install after stage 95 from the widget root:

```sh
node apply-detection-hover-refactor.cjs --dry-run
node apply-detection-hover-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/detection-hover-stage96` for `node apply-detection-hover-refactor.cjs --uninstall`. Unknown source edits stop installation before writes; unrelated documentation history is preserved. Keep the backup for guarded exact rollback and uninstall later stages first.

Real-host checks: AI labels off/on, all/focus modes, target flashing, quick hover/tap changes, image/viewer changes while picking, note selection with and without existing drafts, viewer removal and close/reopen. Confirm outline/label emphasis, draft marker provenance and cleanup. Portable checks do not establish those browser observations.
