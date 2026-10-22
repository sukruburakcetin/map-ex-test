# Field-note contributor entry points

| Concern | Entry point |
| --- | --- |
| Annotation activation, draft open/submit/cancel and save callback order | `FieldNoteDraft.ts` |
| Draft mode/saved-note toast wording, icons and durations | `FieldNoteDraftFeedback.tsx` |
| Annotation-mode cloud hits and local altitude estimation | `PointCloudAnnotationPicker.ts` |
| Controlled note panels, drafts and editor | `NoteToolsSection.tsx`, `NoteDraftForm.tsx`, `NoteEditor.tsx` |
| Local/shared lists and attachments | `LocalNotesList.tsx`, `EnterpriseNotesList.tsx`, `NoteAttachments.tsx`, `attachmentFiles.ts` |
| Local persistence and GeoJSON conversion | `localPersistence.ts`, `geoJson.ts` |
| Plain map graphic descriptors and pending marker | `mapGraphic.ts`, `PendingNoteMarker.ts` |
| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |
| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |
| Remaining edit/delete/clear/focus, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |

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
