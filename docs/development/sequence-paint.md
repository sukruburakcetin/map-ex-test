# Sequence paint scheduling — stage 69

`waitForSequencePaint` in `src/features/imagery/sequencePaint.ts` isolates the existing browser scheduling contract used by sequence presentation timing. The widget keeps a forwarding method, preserving both callers and its signature. This is a small extraction, reducing the core file by eight lines.

## Contract

Reject an already-aborted signal, missing document or document not visible at entry with DOMException `AbortError` / `Cancelled`. Otherwise listen for abort, request the first animation frame and then the second. Resolve only after the second frame, remove the abort listener and cancel the recorded frame handle during cleanup. Abort before/between frames cancels the pending frame and rejects. The final aborted check protects cancellation during registration. Visibility is intentionally checked at entry only, exactly as before; no new visibility observer or scheduling policy is introduced.

There are no additional timers, animation frames, network requests or UI changes. No performance improvement is claimed. The helper reads browser globals at execution time, preserving existing runtime behavior.

## Evidence

Twelve tests compare the actual widget forwarder/helper against the frozen stage-68 method using controlled browser frames and abort delivery. They cover two-frame completion, hidden/missing document, cancellation before/between/after frames, repeated abort, listener registration races, entry-only visibility and pre-aborted signals. Deliberately broken frame count, visibility, frame cancellation and listener cleanup each fail.

All **2,349 portable tests in 190 files pass**, zero skipped, in isolated per-file TAP processes at concurrency two with documented dependency overrides. Strict TypeScript passes for the helper; widget/helper syntax/transpilation and repository hygiene pass. The existing sequenceV6Runtime snippet harness now loads and injects the production helper; its assertions/expected behavior are unchanged. Previous fixtures remain unchanged.

The user accepted general testing of stages 66–67. Stage 68 application was not confirmed, and neither stage 68 nor 69 has fresh host build/browser evidence here. The earlier user-verified isolated ExB 1.21.0 stage-65 build remains baseline evidence. No ExB client is installed in this workspace; whole-project semantic typing and production packaging remain separate.

## Reversible installation

Apply stage 68 first. From the widget root:

```sh
node apply-sequence-paint-refactor.cjs --dry-run
node apply-sequence-paint-refactor.cjs
# Reverse stage 69 only:
node apply-sequence-paint-refactor.cjs --uninstall
```

The installer checks matching source/harness and prerequisite owner modules, rejects unexpected edits, preserves documentation history and supports LF/BOM/CRLF files. Backups outside the widget retain exact original bytes. Rollback verifies installed files and backups and refuses later edits; reverse newest stage first. Restart client and hard-refresh, then smoke-check image selection, hover-highlight presentation, cancellation/view transfer and background-tab behavior.
