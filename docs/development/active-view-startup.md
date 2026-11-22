# Active-view startup — stage 91 / P02 part 1

`src/features/navigation/activeViewStartup.ts` owns committed-view restoration order. `Widget.activeViewStartupHost` binds SDK/resource operations for that view; it does not start work while constructing the binding. The caller retains `view.when`, its error handler and the independently started shared-link restoration.

The workflow preserves scale on dimension changes, awaits SDK modules and restored camera, then starts coverage before restoring graphics, Places, optional tools and detection layers. Coverage errors are observed immediately. After coverage settles, the current-view guard gates presentation and stationary URL binding. Optional tool promises remain unawaited, as before. No request, timer or dependency is added.

Identity/revision/map guards retain their original positions, including the narrower identity/liveness guard immediately after scale transfer. Do not replace that guard with the full current predicate as incidental cleanup. This step deliberately preserves behavior.

The production ready-view thunk and host are exercised against the frozen pre-extraction callback in 24 new cases. Existing seven coverage-first tests now use the actual extracted workflow and retain all assertions. Comparisons cover scale, center, 2D/3D tools, image/cone/URL identity, shared-link/fly-in states, cancellation and failure ordering. The frozen fixture is test-only and must not become runtime code.

P02 remains in progress: transfer invalidation, teardown, view commitment and owned attachments still need a cohesive lifecycle boundary. Click/pointer ladders remain for P03. Widget size is 10,947 lines, 60 fewer than stage 90; line count is evidence of movement, not a completion criterion.

Validation: 3,017 passing portable tests / 217 files in the workspace and clean installer-produced copy; zero failures or skips. Strict feature-module TypeScript and the isolated ExB 1.20 module-graph build pass with zero errors/warnings. Reversible installer checks cover dry-run, repeat application, BOM/CRLF source, local documentation history, unknown edits and exact guarded rollback. Live ExB 1.21/browser acceptance remains pending.

Install from the widget root after stage 90:

```sh
node apply-active-view-startup-refactor.cjs --dry-run
node apply-active-view-startup-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Keep `.refactor-backups/active-view-startup-stage91` for `node apply-active-view-startup-refactor.cjs --uninstall`. Later source edits are protected; uninstall later stages first. Source edits outside the reviewed baseline stop installation before any writes. Documentation notes outside targeted plan blocks are preserved.

On the real host, check cold/warm startup, rapid active-map replacement while loading, 2D/3D switching, shared links and close/reopen. Verify coverage, cone, optional tools and URL watchers remain on the current view only. Portable tests and the isolated module graph do not establish those browser observations.
