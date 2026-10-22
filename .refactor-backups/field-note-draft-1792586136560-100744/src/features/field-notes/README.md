# Field-note contributor entry points

| Concern | Entry point |
| --- | --- |
| Annotation-mode cloud hits and local altitude estimation | `PointCloudAnnotationPicker.ts` |
| Controlled note panels, drafts and editor | `NoteToolsSection.tsx`, `NoteDraftForm.tsx`, `NoteEditor.tsx` |
| Local/shared lists and attachments | `LocalNotesList.tsx`, `EnterpriseNotesList.tsx`, `NoteAttachments.tsx`, `attachmentFiles.ts` |
| Local persistence and GeoJSON conversion | `localPersistence.ts`, `geoJson.ts` |
| Plain map graphic descriptors and pending marker | `mapGraphic.ts`, `PendingNoteMarker.ts` |
| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |
| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |
| Remaining activation, draft, SDK and persistence orchestration | Field-note region in `../../runtime/widget.tsx` |

## Annotation cloud picking

`PointCloudAnnotationPicker.pick` runs the existing caller-supplied hitTest and resolves annotation coordinates. Runtime keeps route-pick precedence, the annotation-mode gate and its unconditional return, toMap/coverage fallback, and note draft/creation behavior. No event listener, cloud cache, layer, persistence or extra hit test is owned here.

Exact cloud hits resolve the current retained full-cloud point after hitTest settles. Keep first-layer-match semantics, originalIndex aliases and ObjectID arithmetic. Annotation ignores pointIndex and does not require the cloud to be visible. Raw longitude/latitude keep the existing truthy fallback to shifted coordinates; altitude remains the source value with no datum conversion.

If exact picking does not resolve a point, local estimation requires current visibility and a retained result. `estimateAnnotationCloudAltitude` keeps strict 0.00005-degree bbox and 3 m distance tests, numeric sorting of a temporary altitude list and sample index `floor(count * 0.1)`. It borrows points and preserves their order; no interpolation, sampling cap or new coordinate correction is introduced. No candidates returns undefined altitude. This synchronous full-cloud scan keeps its original computational behavior.

The original try/catch includes hitTest, index lookup and exact-hit annotation. Its warning remains unchanged; fallback annotation remains outside that catch. Result, visibility and fallback map-point reads stay live after await. The runtime adds no cancellation or mode recheck to this refactor.

Function comments document coordinate units, index policy, authority and catch boundaries. `tests/annotationCloudPicking.test.cjs` compares actual adapters against a frozen original branch with real distance math and held hitTests. It covers exact/fallback coordinates, aliases/visibility, percentile/bbox/radius behavior, cloud replacement, point mutation, errors and click interception. Host smoke checks: 2D/3D note placement on and off cloud points, hidden/empty cloud, sloped terrain and normal route/image/object/note navigation.
