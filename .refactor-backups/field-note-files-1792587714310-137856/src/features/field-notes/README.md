# Field-note contributor entry points

| Concern | Entry point |
| --- | --- |
| Local restore/delete/clear guards and state/storage/renderer order | `LocalNoteCollection.ts` |
| Local-clear feedback and Enterprise reminder | `LocalNoteCollectionFeedback.tsx` |
| Annotation activation, draft open/submit/cancel and save callback order | `FieldNoteDraft.ts` |
| Draft mode/saved-note toast wording, icons and durations | `FieldNoteDraftFeedback.tsx` |
| Annotation-mode cloud hits and local altitude estimation | `PointCloudAnnotationPicker.ts` |
| Controlled note panels, drafts and editor | `NoteToolsSection.tsx`, `NoteDraftForm.tsx`, `NoteEditor.tsx` |
| Local/shared lists and attachments | `LocalNotesList.tsx`, `EnterpriseNotesList.tsx`, `NoteAttachments.tsx`, `attachmentFiles.ts` |
| Local persistence and GeoJSON conversion | `localPersistence.ts`, `geoJson.ts` |
| Plain map graphic descriptors and pending marker | `mapGraphic.ts`, `PendingNoteMarker.ts` |
| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |
| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |
| Remaining edit/focus, import/export, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |

## Annotation cloud picking

`PointCloudAnnotationPicker.pick` runs the existing caller-supplied hitTest and resolves annotation coordinates. Runtime keeps route-pick precedence, the annotation-mode gate and its unconditional return, toMap/coverage fallback, and note draft/creation behavior. No event listener, cloud cache, layer, persistence or extra hit test is owned here.

Exact cloud hits resolve the current retained full-cloud point after hitTest settles. Keep first-layer-match semantics, originalIndex aliases and ObjectID arithmetic. Annotation ignores pointIndex and does not require the cloud to be visible. Raw longitude/latitude keep the existing truthy fallback to shifted coordinates; altitude remains the source value with no datum conversion.

If exact picking does not resolve a point, local estimation requires current visibility and a retained result. `estimateAnnotationCloudAltitude` keeps strict 0.00005-degree bbox and 3 m distance tests, numeric sorting of a temporary altitude list and sample index `floor(count * 0.1)`. It borrows points and preserves their order; no interpolation, sampling cap or new coordinate correction is introduced. No candidates returns undefined altitude. This synchronous full-cloud scan keeps its original computational behavior.

The original try/catch includes hitTest, index lookup and exact-hit annotation. Its warning remains unchanged; fallback annotation remains outside that catch. Result, visibility and fallback map-point reads stay live after await. The runtime adds no cancellation or mode recheck to this refactor.

Function comments document coordinate units, index policy, authority and catch boundaries. `tests/annotationCloudPicking.test.cjs` compares actual adapters against a frozen original branch with real distance math and held hitTests. It covers exact/fallback coordinates, aliases/visibility, percentile/bbox/radius behavior, cloud replacement, point mutation, errors and click interception. Host smoke checks: 2D/3D note placement on and off cloud points, hidden/empty cloud, sloped terrain and normal route/image/object/note navigation.

## Annotation activation and draft coordination

`FieldNoteDraft.ts` coordinates toggle/open/submit/cancel intent through existing React state, marker, storage, rendering and publication adapters. `FieldNoteDraftFeedback.tsx` keeps enable/disable and saved-note feedback together. There is no second draft state, note store, marker owner or publication queue.

- `toggle` uses React previous state, clears the pending draft and closes list/nearby flags. Its callback reads current annotation mode before feedback. It retains the original absence of an explicit marker-cleanup call on toggle.
- `open` draws the same amber ripple, places the existing pending marker, then captures the current image ID into `{lon, lat, alt, imageId}`. Coordinates are WGS84 degrees; optional altitude remains source meters. `PendingFieldNote` explicitly includes the altitude the runtime already reads/writes.
- `submit` snapshots the pending draft before clearing the marker. It retains manual-note fields, two Date.now reads and the rounded random ID suffix, then appends to the current local array. The React callback persists that captured array, refreshes map/viewer graphics, optionally starts existing publication without awaiting it, then shows saved feedback.
- `cancel` clears the marker before clearing draft state, preserving mode/list flags. Empty submit remains a no-op.

Persist return values, publication promise handling, exceptions and independent queued callbacks retain their original behavior. Note payload/storage schema, Enterprise auth/edit/retry paths and controlled form behavior are unchanged. Function comments explain callback phases, coordinate/image capture and owner boundaries.

`tests/fieldNoteDraft.test.cjs` compares actual runtime adapters/feedback against frozen original methods with recorded clocks/randomness, immediate/batched state, storage/marker/publication callbacks and exact payloads. Host checks: Add Note on/off, opening/cancelling, altitude/image association, local save/reload and optional sharing through the existing Enterprise configuration.

## Local collection updates

`LocalNoteCollection.ts` coordinates local restore/delete/clear only. Runtime retains the authoritative notes array and supplies existing persistence, shared-save/editor guards and renderer callbacks. `localPersistence.ts` still owns storage keys, parsing/interrupted-save normalization, serialization and quota recovery. No collection mirror, storage API, renderer, confirmation dialog or Enterprise deletion is owned by this coordinator.

- `load` applies the same restored array, then refreshes map/viewer in the React callback. It does not write the restored data again or change the helper's error scope.
- `remove(id)` checks only that ID's active shared save plus active editor saving. Other IDs' saves do not block deletion. Filter the current array and persist the captured filtered array after state commits, followed by map/viewer refresh. Unknown IDs and duplicate IDs keep their existing filter/refresh behavior.
- `clear` requires nonempty local notes, no shared saves at all and no editor save. The existing button owns confirmation. State and persistence receive their original separate empty arrays; the callback keeps persist → map → viewer → feedback order.
- Feedback reads the live sharing configuration after renderer callbacks and retains the 2000 ms local-only/Enterprise-reminder wording. Enterprise records are never deleted by these paths.

Persistence false returns, synchronous exceptions, queued callback behavior and accepted-operation guard timing are unchanged. Draft creation, imports and shared edits keep their own write paths and ownership. Function comments explain callback phases, array authority and guards.

`tests/localNoteCollection.test.cjs` compares actual adapters against frozen original methods using real persistence helpers with memory storage. Tests cover payloads/source identity, per-ID versus global guards, unknown/duplicate IDs, missing/malformed storage, interrupted shared saves, queued/live callbacks, storage/draw failures and clear feedback. Host checks: restore after refresh, individual delete, confirmed local clear, blocked save/editor actions and Enterprise-note preservation.
