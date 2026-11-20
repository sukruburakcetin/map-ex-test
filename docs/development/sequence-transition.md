# Sequence transition presentation fix

Previously a new selection cleared the green marker/cone immediately, but the opening guard only cancelled pending selected-highlight jobs. Cancellation did not remove already-painted blue graphics or hide native cached layers. The old sequence therefore stayed until image confirmation updated the selected role.

loadSequenceById now calls the existing selected-role select(null) synchronously after cone clearing when Turbo navigation switches sequence IDs. The call is not awaited. Same-sequence changes keep their valid selection highlight and cached-route fast path. No base coverage/hover role or geometry cache is cleared. 2D presentation removal and 3D cached-layer hiding use existing owner behavior; no style reload or extra tile/image request is introduced. The existing state/readiness lifecycle restores selection after a failure/cancel and stale tasks remain aborted. Legacy non-Turbo overlay behavior is unchanged.

Eight new cases exercise real selection entry points and highlight owners: pre-dispatch removal, same-sequence retention, a never-resolving clear promise that must not delay moveTo, failure/cancel restoration, late pending geometry, and cache/layer reuse in 2D/3D. Existing image-first, timing, pulse and request assertions remain. No live latency improvement or host acceptance is inferred from portable tests. The only production change is the guarded call in loadSequenceById; tile/selection owners and request code are unchanged.

Requires stage 77. From widget root:

```sh
node apply-sequence-transition-fix.cjs --dry-run
node apply-sequence-transition-fix.cjs
# Undo only this fix:
node apply-sequence-transition-fix.cjs --uninstall
```

Actual source/test fingerprints are preflighted before writes. Exact bytes and local documentation histories are preserved; unsupported changes and rollback over later edits are refused. Backups live outside the widget. Restart/hard-refresh, build in ExB 1.21 and verify different-sequence transitions, 2D/3D, cancellation/failure, rapid selections and same-sequence navigation. The change advances presentation cleanup rather than delaying image opening.
