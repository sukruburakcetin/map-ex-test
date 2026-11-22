# Active-view attachment — stage 93 / P02 implementation review

`ActiveViewTransfer.attach` now coordinates committed-view startup registration and the existing non-interaction attachments. `begin`, `attach` and `invalidate` form one handoff boundary: retire the old view, ask the widget to commit the new view, start guarded restoration after commitment, and bind existing view owners at their original positions.

`Widget.activeViewAttachmentHost` supplies React commitment, SDK readiness, the existing `restoreActiveView` workflow, independent shared-link restoration and zoom/Turbo/layer-order operations. The host binds closures without starting work. There is no new request, timer, dependency or async function; the readiness callback directly forwards the restoration promise.

The commit request precedes zoom/Turbo binding. If React defers the callback, those bindings still run immediately, as before. Once committed, readiness registration precedes shared-link restoration; shared links do not wait for SDK readiness, coverage or optional tools. Startup errors warn only for the current token and exclude AbortError. Layer-order readiness errors are still ignored and its identity/liveness guard remains intentionally separate from the stricter startup revision/map guard. This extraction does not change those policies.

P02 implementation criteria are met across stages 91–93: one coordinator owns transfer revisions/order and startup/attachment registration, while existing feature owners retain resources and the startup workflow preserves coverage-first loading. The widget retains concrete feature/SDK bindings, React state commitment and interaction setup. Nested click/pointer dispatch belongs to P03, not a hidden completion claim. P02 browser acceptance remains pending under P12.

Twenty new attachment cases exercise the actual production entry, host and coordinator against the frozen stage-92 block, or assert independent startup timing and direct promise forwarding. Deferred commits, readiness/restoration failures, AbortError, stale contexts, destroyed/replaced maps and isolated layer-order failures are covered. Existing transfer, coverage-first, startup and lifecycle assertions remain active; their harness now follows the real host/readiness/startup chain. The widget is 10,911 lines (15 fewer than stage 92); this is not a claim that the minimal-core goal is complete.

Validation: 3,066 passing portable tests / 219 files in both workspace and clean installer-produced copy, zero failures or skips. Strict navigation-module TypeScript and the isolated ExB 1.20 module-graph build pass; the build has zero errors/warnings. Reversible installer, BOM/CRLF and targeted mutation checks pass. Live ExB 1.21/browser acceptance remains pending under P12.

Install after stage 92 from the widget root:

```sh
node apply-active-view-attachment-refactor.cjs --dry-run
node apply-active-view-attachment-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/active-view-attachment-stage93` for `node apply-active-view-attachment-refactor.cjs --uninstall`. Unknown source edits stop installation before writes. Unrelated documentation history is retained. Uninstall later stages first; preserve the backup for exact guarded rollback.

On the real host, check cold/warm startup, rapid active-map replacement while loading, close/reopen, 2D/3D switching, shared links, coverage and cone restoration. Confirm URL/zoom/Turbo bindings and enabled optional tools follow the current view. Portable tests and the isolated module graph do not constitute these browser observations.

Next is P03: extract map click/pointer dispatch, retaining coverage/detection/Places precedence, current-image ownership, cancellation and lazy transport. Start with the concrete click ladder rather than unrelated tiny helpers. P03–P12 comprise ten remaining packages, provisionally 16–26 further reviewable changes.
