# Sequence opening — stage 99 / P04 completion

`src/features/imagery/sequenceOpening.ts` coordinates one foreground capture selection. `widget.tsx` forwards the original `loadSequenceById` arguments and binds a fresh typed capability host with live state/owner getters. Existing `LiveSequenceFrames`, bearing, performance, native selection, presentation, request, cache and background owners retain their lifetimes. Map animation and concrete GIS overlay visibility stay in the adapter.

The coordinator preserves cancellation before reuse checks; immediate retirement of a different native selected highlight; cached route identity/index reuse; nearest/local coordinate fallback for line picks; exact-image opening before optional metadata or route work; and the existing visible-paint wait before confirmed-image bearing publication. Request, view and viewer guards retain their original positions. Failed SDK opens recover the previous selection; metadata failure after a successful image retains that image and exposes tracking retry. Finally cleanup cannot release a newer selection's pause. Optional route preparation stays fire-and-forget.

The state-write contract models the existing optional UI fields and nullable failed-open identities. It remains independent of React and GIS types. The widget adapter forwards commits directly into React without extra state snapshots or another queue. A key-specific type assertion bridges TypeScript's generic subset/Pick limitation; a targeted check verifies the feature state writes against the concrete widget state under the installed host conventions. No functionality, request policy, public API, feature store, dependency, subscription or visual styling changes are intended.

Thirty-three comparisons run both the frozen stage-98 method and the production forwarding method/adapter/coordinator, asserting traces and final state. Coverage includes same/cross-sequence, native/GIS warm route identity, missing overlay, nearest and minimum-distance fallback, invalid coordinates, getImage versus moveTo, status-specific errors, cached/partial prior recovery, metadata failures, supersession at SDK/metadata/paint boundaries, map/viewer replacement, shared startup, hidden documents, confirmed bearing, abort during commit and pending optional routes. Five mutations exercise stale selection, route reuse, viewer identity, post-open recovery and premature bearing confirmation. Existing image-first, pulse/fullscreen, sequence performance, Nearby and cancellation-wide checks keep their assertions through production-source adapters.

Validation: 3,252 passing tests / 225 files, zero failures/skips in workspace and clean installer-produced copy. Strict feature-module and actual Mapillary Viewer compatibility checks pass. A targeted host type check covers the new adapter under installed ExB 1.20 types; it is not a claim of whole-project strict typing. Isolated ExB 1.20 webpack module-graph build reports zero errors/warnings. BOM/CRLF and guarded installer checks pass. ExB 1.21/full-browser acceptance remains pending under P12.

P04 implementation is complete across stages 97–99. Viewer construction/fullscreen remains P06, lifecycle/disposal P05 and coverage/analysis P09. Widget size is 10,155 lines (103 fewer than stage 98, 249 fewer across P04). Eight packages P05–P12 remain, provisionally 12–20 further changes.

Install after stage 98 from the widget root:

```sh
node apply-sequence-opening-refactor.cjs --dry-run
node apply-sequence-opening-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/sequence-opening-stage99`. For guarded exact rollback, run `node apply-sequence-opening-refactor.cjs --uninstall` after uninstalling later stages. Unknown source edits or prerequisites stop preflight before writes. Documentation notes preserve unrelated history and local additions; an unknown plan block stops rather than being replaced.

Real-host checks: same/cross-sequence point clicks and low-zoom line selection, warm route reuse, quick successive clicks, failed/unavailable captures and retry, map replacement during opening, playback interruption, visible pulse/cone and selected highlight, fullscreen and map follow. Verify imagery opens without automatic image-info disclosure. Portable checks do not establish browser service behavior or performance measurements.
