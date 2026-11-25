# Mapillary Explorer — account handoff

Prepared: **18 November 2026 (Europe/Istanbul)**. Last completed checkpoint: **stage 61**.

## Paste this into the next chat

> Continue the Mapillary Explorer V5 refactoring and release-readiness work from stage 61. Read this handoff, then inspect actual Git state and read REFACTORING-MILESTONE.md, docs/development/test-baseline.md, docs/development/portable-tests.md and the runtime reading guide. The last verified checkout is commit 609b81c5eacb542b7865d50a60bbca902b124137 plus UNCOMMITTED stages 47–61; do not assume GitHub contains them. Preserve local edits and untracked files. The full portable baseline is 2,264 tests: 2,260 pass, four fail, all 186 files included. The next planned step is stage 62: investigate detectionLinkedPreview.test.cjs, preserving opt-in previews, provenance and credential boundaries. Classify the failure before changing tests or production. Do not blanket-update expectations, discard assertions or resurrect retired rendering. Keep runtime behavior and performance intact. Deliver a reversible CJS installer, updated milestone/baseline and honest validation. The user's host is Experience Builder 1.21; cloud checks used 1.20, which is not 1.21 acceptance. Inspect the actual installation checkpoint before applying anything. No commit, push or deployment has been made for stages 47–61.

## What we are doing

The broader goal is a maintainable, modular, nearly publishable Mapillary Explorer widget. `src/runtime/widget.tsx` should orchestrate features; feature implementation, presentation and styles should live in suitable existing components/modules. Preserve every working feature and avoid unnecessary dependencies or abstractions.

We temporarily prioritized trustworthy test/build foundations before further large extractions. Many failures came from old snippet harnesses that omitted current imports, JSX or localization. Repairing these tests is not evidence of an equivalent number of production bug fixes. The four remaining failures have **not yet been diagnosed or fixed**.

User priorities:

- Preserve exploration speed, request timing, cancellation, map/view ownership and low-budget/mobile behavior.
- Keep optional work opt-in; do not automatically open image info or start enrichment without demand.
- Preserve Overture vector POIs, categories, confidence controls, selection/imagery/note workflows. Do not copy the old GeoJSON/bbox/Graphic patterns automatically into vector rendering.
- No day/night feature now; it was deferred. NeRF was discussed, not the current task.
- Keep `widget.tsx` focused and documented; reuse existing feature modules and style conventions.
- Continue useful authorized work without unnecessary confirmation questions. The user normally says “next” to approve the next bounded step.
- Deliver a downloadable, reversible `.cjs` installer because downloading/replacing whole source trees has been difficult for the user.

## Repository and transfer warning

- GitHub remote recorded here: `https://github.com/sukruburakcetin/map-ex-test.git`.
- Last observed HEAD: `609b81c5eacb542b7865d50a60bbca902b124137` — `updating current activities v13`.
- Cloud checkout: `/workspace/map-ex-test-latest`.
- User's latest Windows widget path: `C:\Users\BURAK\Desktop\arcgis-experience-builder-1.21\client\your-extensions\widgets\mapillary-explorer`.
- Earlier testing used the analogous Experience Builder 1.20 path.
- Stages **47–61 are uncommitted** in this checkout. No commit, push or deployment was performed for them. There are modified tracked files and important untracked source/test/tool files; `.gitkeep` is intentionally deleted as part of stage 50.
- Older work was historically stashed before synchronization. Do not blindly replay stashes over the current source.

**This Markdown transfers context, not code.** A new account/session may not retain this filesystem, `/tmp` artifacts or previous downloads. Preserve the working widget tree, including untracked files, and relevant installers before leaving. A fresh clone at the recorded commit alone is not the stage-61 working tree. If files are missing, obtain the actual checkpoint/source or installer artifacts; do not reconstruct it by guessing from this document or claim it is synchronized.

At the start of the next session, run read-only checks such as:

```sh
git status --short
git log -1 --format="%H %s"
git remote -v
```

Compare actual files/checkpoint with this handoff. Do not reset, clean, overwrite unknown edits, or pull over the dirty checkout to “sync” it. The user has not confirmed which delivered stages are installed on their Windows machine.

## Current verified baseline

| Check | Last verified result |
| --- | --- |
| Full portable run | **2,264 total; 2,260 pass; four fail; zero skipped** |
| Scope | All **186** `tests/*.test.cjs` files included; nonzero exit is expected while failures remain |
| Last focused run | **30/30** community-workspace client cases pass |
| Stage 61 assertions | All 96 original assertion calls retained; one import-boundary assertion added; no new cases |
| Negative controls | Cookie forwarding or revision truncation each fails an existing client case in temporary copies |
| Installer checks | 16 pass, including installed-output tests, LF/BOM/CRLF, preflight, repeat apply, exact rollback and edit protection |
| Documentation | 101 Markdown files, 399 local links, zero broken links, before adding this handoff |
| Repository layout | 823 source files checked; zero errors |
| Production scope | Stages **52–61** changed tests/docs only. All 449 `src/` and frozen-fixture files unchanged within each of these stages |

The early stages do contain runtime changes; do not describe all uncommitted work as test-only. No new bundle was needed for the later test-only stages. An earlier isolated 1.20 bundle passed, but semantic type checking and live ExB **1.21** acceptance remain outstanding. Browser/SDK/GPU, real service scale, multilingual rendering and deployed Enterprise/workspace permissions require their own validation.

## Four remaining failures — investigate individually

| Suite | Exact failing case / observed symptom |
| --- | --- |
| `tests/detectionLinkedPreview.test.cjs` | “preview is opt-in and portable across existing note text without credentials or file bytes”; parsed reference is `null`, expected image/detection IDs and `{x:0.2,y:0.3,width:0.1,height:0.4}`. **Next task.** |
| `tests/regionalLocales.test.cjs` | “UK catalogs are sparse, inherit US text and keep meter devices distinct from length units”; `assert(Object.keys(gb).length < 80)` fails. Determine whether the numeric ceiling is outdated while preserving locale semantics. |
| `tests/screenDirectionCone.test.cjs` | “phone close zoom keeps a 14px circle and uncompressed fan from zoom 21 onward”; expected fan transform to include `rotate(`. Inspect the actual transform contract before changing implementation or expectations. |
| `tests/textButtons.test.cjs` | “owned translated actions use the shared policy; icon controls retain their own sizing”; reports missing `mly-text-action` at `src/features/detections/DetectionDisplayControls.tsx` lines 39, 44, 46, 48 (line 48 twice). Recheck current line numbers and distinguish text actions from icon controls. |

These are diagnostic observations, not conclusions that all four are harness problems. Do not weaken privacy, accessibility, formatting, crop validation, opt-in behavior or current display contracts merely to make them pass.

For stage 62, inspect the preview suite and its actual attachment serialization/parsing helpers first. Retain useful existing tests; if a representation was intentionally replaced, map the old intent to the active owner explicitly and document the reason. No stage-62 edits have been started.

## Completed stages and delivery order

Stages are incremental. Existing local files, not the conversation alone, determine which installer can safely apply. Run a dry run and respect unknown-edit refusal. A refusal is a reason to inspect differences, never to force an overwrite. Retain `.refactor-backups` and uninstall newer stages before older ones.

| Stage | Completed work | Installer filename |
| --- | --- | --- |
| 47 | Restore bounded isolated build checker | `apply-isolated-build-check.cjs` |
| 48 | Stateless viewer surface/fullscreen/tray; style separation and runtime state contract | `apply-viewer-presentation-refactor.cjs` |
| 49 | Runtime ownership/function documentation and contributor reading guide | `apply-widget-documentation.cjs` |
| 50 | Portable runner/dependency setup, baseline reconciliation, small approved cleanup | `apply-v5-phase1-foundation.cjs` |
| 51 | Point-cloud fixture bindings/TSX; fix one `cluster s` feedback space | `apply-point-cloud-fixture-repair.cjs` |
| 52 | Field-note draft/file/collection English bindings and counted feedback | `apply-field-note-fixture-repair.cjs` |
| 53 | Coverage-analysis TSX/localization and late-classifier ownership checks | `apply-coverage-analysis-fixture-repair.cjs` |
| 54 | AI-label bounds binding, focus/visibility/cleanup/stale-hover tests | `apply-detection-label-fixture-repair.cjs` |
| 55 | Footer locale hook and live viewport/reduced-motion tests | `apply-info-footer-fixture-repair.cjs` |
| 56 | Align native-anchor fixture and retired terrain/polygon assertions with current owners | `apply-native-alignment-fixture-repair.cjs` |
| 57 | Isolate Nearby lifecycle statements from unrelated route logic | `apply-nearby-foreground-fixture-repair.cjs` |
| 58 | Actual Places source identity; cache/source and overlapping-search checks | `apply-overture-places-fixture-repair.cjs` |
| 59 | Builder API teardown dependency and unmount ownership checks | `apply-places-api-fixture-repair.cjs` |
| 60 | Time-travel pure dependency loading; restore 24 original availability cases | `apply-time-travel-fixture-repair.cjs` |
| 61 | Community client pure dependency loading; restore 30 original cases | `apply-community-client-fixture-repair.cjs` |

Latest delivery, **only after the matching stage-60 source**:

```sh
node apply-community-client-fixture-repair.cjs --dry-run
node apply-community-client-fixture-repair.cjs
```

Rollback uses `--uninstall`; preflight rollback with `--uninstall --dry-run`. Stage 61 requires neither restart nor dependency reinstall. Each installer supplies exact file backups, recognizes its known baseline, protects later edits and appends a milestone note. There is no new cumulative stages-47–61 installer. Historical checkpoint v2 covers earlier stages; do not assume it includes these later repairs.

### Important implementation decisions already settled

- `tests/helpers/englishFixture.cjs` provides real English catalog/formatting bindings for isolated snippets. Suites retain explicit SDK/network/clock controls. Do not invent a second translated catalog or blanket-normalize payloads.
- Historical field-note Turkish notices are adapted only on the frozen comparison side; stored note content/error objects remain exact.
- Do not revive old 3D DOM-pulse sampling/retry loops. Current `SelectionPulse` delegates steady 3D placement to SDK ground draping and schedules no 3D animation frames; 2D retains its separate behavior.
- Current cone fallback uses a closed mesh and one perimeter. Stage 56 explicitly migrated obsolete polygon-face assertions; existing topology/reuse tests remain.
- Unknown terrain is deferred; only explicitly empty ground supports the flat fallback. Assert recorded factory effects outside contained callbacks, since callback assertion exceptions can otherwise be swallowed.
- Nearby foreground tests now isolate four actual lifecycle statements; unrelated route-generation reconciliation must not leak into this harness.
- Overture imagery caching uses actual `placesSourceKey`, including Portal/source identity. Older imagery completion must not replace a newer controller or publish stale cache/results.
- The time-travel and community client failures were suite-loading failures. Restoring their original cases increased totals without creating new cases; do not confuse that with extra production fixes.

## Read these project files

1. `REFACTORING-MILESTONE.md` — current resume point and stage history.
2. `docs/development/test-baseline.md` — current four-failure inventory and historical results.
3. `docs/development/portable-tests.md` — complete runner, dependencies, harness conventions and scope limits.
4. `docs/development/runtime-reading-guide.md`, `architecture.md`, `routing-validation.md`, `capture-solve-history.md`, `viewer-presentation.md` — all under `docs/development/`.
5. `CONTRIBUTING.md`, `docs/installation.md`, `docs/development/runtime-dependencies.md`, `docs/development/isolated-build-check.md`.

Important untracked files must be preserved: viewer presentation components/styles, `src/runtime/widgetState.ts`, `tests/helpers/englishFixture.cjs`, the viewer fixture/tests, portable runner/tests, and isolated build checker. Use `git status` to get the complete current list.

## Reproduce checks

The widget is hosted inside Experience Builder; it is not a standalone npm app. Do not replace host React, SDK, lockfiles or package-manager settings merely to run tests.

Previously available cloud paths (ephemeral, recheck):

- ExB client: `/workspace/experience-builder-1.20/client`
- Isolated test dependencies: `/tmp/mapillary-v5-test-deps/node_modules`
- Node 24.19.0; TypeScript 5.9.3; React/DOM/renderer 19.2.3; jsdom 26.1.0; PGlite 0.5.16.
- Tested runtime dependencies: Mapillary JS 4.1.2, pbf 5.1.2, `@mapbox/vector-tile` 3.0.0, pako 2.2.0. Refer to the installation guide for host-specific commands; React compatibility is a host constraint, not a pbf dependency.

Full portable run from widget root; the report path must be NEW and its parent directory must exist:

```sh
node tools/check-portable-tests.cjs --client /workspace/experience-builder-1.20/client --dependencies /tmp/mapillary-v5-test-deps/node_modules --preflight
node tools/check-portable-tests.cjs --client /workspace/experience-builder-1.20/client --dependencies /tmp/mapillary-v5-test-deps/node_modules --report /tmp/portable-next-report.json
```

Focused next-case example in the same cloud environment:

```sh
NODE_PATH=/tmp/mapillary-v5-test-deps/node_modules:/workspace/experience-builder-1.20/client/node_modules MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript node --test tests/detectionLinkedPreview.test.cjs
```

On Windows use the runner with your actual client/dependency paths; do not paste POSIX environment-variable syntax into CMD. Follow `portable-tests.md` if rebuilding isolated test dependencies. Database tests need PGlite; missing dependencies are not grounds to exclude suites.

Routine repository checks:

```sh
node tools/check-docs.cjs
node tools/check-repository.cjs
git diff --check
```

Run target ExB 1.21 host builds/browser checks separately when available. The isolated bundle checker is transpile-only and does not prove semantic type safety.

## Workflow for the next bounded stage

1. Confirm actual stage/source and preserve edits; inspect applicable project instructions.
2. Reproduce the focused failure with complete dependencies. Inspect current production contracts before classifying it.
3. Repair a missing binding/loader if that is the cause. If it is a product defect, make the smallest behavior-preserving fix and state the scope clearly.
4. Preserve active assertions and frozen fixtures. Document any intentional migration from a retired representation; never silently rebaseline.
5. Run focused checks and meaningful deliberate-fault controls where useful; use temporary source copies for controls.
6. Run the complete portable suite and compare failing names against stage 61. Keep every suite included and report remaining failures honestly.
7. Update milestone/baseline and produce one reviewable, reversible CJS installer. Test preflight, apply, repeat, rollback, BOM/CRLF, unknown edits and installed output.
8. Summarize changed behavior (or test-only scope), results, limits and exact install commands. Do not claim performance/live host acceptance from controlled tests.

## Evidence and artifact locations

These locations belong to this session and may not exist on the next account:

- Last full report: `/tmp/v5-community-full-report.json`; full log: `/tmp/v5-community-full.log`.
- Stage 61 source/frozen hash snapshot: `/tmp/v5-community-source-before.json` (449 entries).
- Safety/negative checks: `/tmp/v5-community-installer-checks.json`, `/tmp/v5-community-controls.json`, `/tmp/v5-community-assertions.json`.
- Installer test output: `/tmp/v5-community-installed-tests.log`.
- Delivered installers and validation JSON: `/workspace/shared/downloads/`.
- Latest validation: `community-client-fixture-repair-validation.json` in that directory.
- Builder/safety helper scripts under `/tmp/` are session scratch files, not a supported repository build system. If lost, preserve the reviewed installer engine/behavior instead of assuming these scripts are committed.

## Delivered fixture installer fingerprints

Use these to identify existing downloads, not to bypass baseline checks. Earlier non-fixture stage installers are listed above but not fingerprinted here.

| File | SHA-256 |
| --- | --- |
| `apply-community-client-fixture-repair.cjs` | `264e829d75f0810b90554a31d87fb16d843435562ca1fd1c5bde010d2f4e3b85` |
| `apply-coverage-analysis-fixture-repair.cjs` | `c408293b9ab0ecc780c6d9f92cf5f51c32e591c057354626a4088368eeeed801` |
| `apply-detection-label-fixture-repair.cjs` | `2b130e1bc98d7d24066718d584a637d74e61d0e3bc888a0122b31730a11ba307` |
| `apply-field-note-fixture-repair.cjs` | `315eedef9718d92d17ad222625b55e401a8671364d44faf8f7acc8d5ba87c2e8` |
| `apply-info-footer-fixture-repair.cjs` | `707f86062c485db1c20c9557653e61697e19e3782d5ba89e72c305786b9d5883` |
| `apply-native-alignment-fixture-repair.cjs` | `e9dfb6185cadbb0feba56efcbc84efa84bfeca84de5d8ceb8ff3351a8f34975b` |
| `apply-nearby-foreground-fixture-repair.cjs` | `be47ef2218c3031a28050de7137435cca6cbb372e57113b89ffee819a669928a` |
| `apply-overture-places-fixture-repair.cjs` | `f09ebd4f3c1719a7b112725982df1cbd07dc5281282231a8a05e3eff3729a3a8` |
| `apply-places-api-fixture-repair.cjs` | `9a5402b7922ae54919c53a1c5b6b3f8cbf0801eab562530a7d71e21a8c724b3b` |
| `apply-point-cloud-fixture-repair.cjs` | `c1e27306866c7a2f4e98aea10aee222c9eea540006010d3a0744453116ecad96` |
| `apply-time-travel-fixture-repair.cjs` | `db03951a383485236c65b8c8ed98d2112b8f5aac51b088ae3844f19f2775475f` |

## Selected working-file fingerprints at handoff

These identify this working tree, not the committed GitHub versions. A mismatch requires inspection, not overwriting.

| File | SHA-256 |
| --- | --- |
| `src/runtime/widget.tsx` | `520ef354463135214186fbdd7d8a26c6fc4bf507ae0ee94ad03417c68a701780` |
| `src/runtime/widgetState.ts` | `230ff45ecd68b68997a4c2e5da1c31235acd277766bcfcc9b3af63191c84bd65` |
| `tests/helpers/englishFixture.cjs` | `747898ad711de0ffde919a3aa29020292b443d214585b8ae04cacfc7837c47fc` |
| `tests/communityWorkspaceClient.test.cjs` | `07d79ee97eddbee6ddb603c7a12922f85593910e1dc6199a038f3bfc703e6f94` |
| `tests/detectionLinkedPreview.test.cjs` | `758986f7c60ec1174d3f8ba4d7530e07e0d9053ee448cf58c0530b551945647e` |
| `docs/development/test-baseline.md` | `5772926a2b11989915c610faeb16f0ab00ebd26122ad0efd5bdd780b904fc724` |
| `REFACTORING-MILESTONE.md` | `d1479485ae0b09cd6ff17a2f3361ed835c42292a8c365d5b2a7295d55bc3d2c7` |
