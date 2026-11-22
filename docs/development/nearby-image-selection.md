# Nearby image selection (stage 79)

`src/features/imagery/NearbyImageSelection.ts` owns Nearby tray navigation and the revision that identifies its latest request. `widget.tsx` supplies live viewer, image-selection and map-view identity, discovery cancellation, preview/selection presentation, cone redraw and logging. The existing `nearbyImagePose` helper remains the single source of capture pose.

`open(img)` returns immediately when no viewer exists. Otherwise it cancels discovery, captures the current context and clears the preview before opening the capture. It retains the original two awaits: `moveTo`, then `getImage`. After each await, only the latest request with unchanged viewer/selection/view may continue. The confirmed image ID must match before its capture heading is restored. Missing pose/heading still opens the capture without inventing a bearing.

Preview publication and discovery cancellation remain outside the navigation error boundary. Opening/reading/centering failures are logged only for the current context. The owner is allocated once and reused; there is no new reset/cancellation policy, request, timer, dependency or extra await. This is an architecture extraction; speed has not been measured.

## Verification

The new comparison suite runs frozen stage-78 methods and the real extracted owner with the real pose helper, recording viewer calls, presentation, heading and warning traces. It covers zero/computed/wrapped headings, missing pose/view/viewer, wrong confirmed ID, changes at each await, superseded clicks, failures and reuse. The existing object/Nearby lifecycle harness now binds the actual extracted owner; its assertions are unchanged.

Validation: 2,682 passing portable tests / 205 files in the workspace and clean installer-produced copy, zero failures or skips. Thirty new cases compare frozen original/current navigation traces; the existing object/Nearby lifecycle assertions are unchanged and use the actual owner. Strict isolated TypeScript (actual NearbyImage/pose declarations), isolated ExB 1.20 module-graph build (zero errors/warnings), mutation checks for revision/selection/confirmed-image guards, and BOM/CRLF comparison tests pass. Reversible installer checks cover dry-run, repeat verification, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

Strict isolated TypeScript checking uses the actual NearbyImage interface and pose declaration. The isolated ExB 1.20 module-graph build passes with zero errors/warnings. The user separately supplied a successful stage-78 ExB 1.21 module-graph build on 21 November 2026; stage-78 browser smoke and stage-79 ExB 1.21 checks remain unconfirmed.

## Installation and rollback

From the widget root:

```sh
node apply-nearby-image-selection-refactor.cjs --dry-run
node apply-nearby-image-selection-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

The installer requires reviewed stage-78 source, accepts BOM/CRLF variations, and refuses unknown source edits before writing. Existing documentation histories are retained. Keep `.refactor-backups/nearby-selection-stage79` for exact rollback. Repeat installation verifies installed files; `--uninstall` restores original bytes and refuses later edits or corrupted backups. Uninstall newer stages first. No dependency installation or Git operation is performed.

## Host smoke check and next work

Open several Nearby thumbnails quickly and check that the final confirmed capture keeps its own heading. Switch the main image or active map while a Nearby image opens. Check captures with missing heading and close/reopen the widget. Then review another bounded widget responsibility without folding unrelated behavior changes into the refactor.
