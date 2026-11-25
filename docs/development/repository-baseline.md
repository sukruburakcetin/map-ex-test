# Repository baseline and layout

This is a development checkpoint, not a declaration that version 5.0 is ready to publish. The baseline starts at `43b7a4b1bc7da5f810b8ad8c05b65cdf175f6170` (13 November 2026). Runtime source, configuration, database behavior and feature availability are unchanged by the repository cleanup.

## Where files belong

| Location | Purpose |
|---|---|
| `manifest.json`, `config.json`, `icon.svg` | Experience Builder widget identity, defaults and icon; keep at the widget root. |
| `src/runtime/`, `src/setting/` | Host runtime and builder entry points. |
| `src/components/`, `src/features/`, `src/utils/`, `src/styles/`, `src/i18n/` | Current implementation, assets and lazy translation catalogs. Source colocation READMEs describe ownership. |
| `tests/` | Portable suites, browser harnesses and intentional fixtures. |
| `tools/` | Maintained contributor checks and translation tooling. |
| `tools/diagnostics/`, `tools/performance/` | Optional investigation and measurement tools. |
| `tools/overture_places/` | Places download, preparation, external hosting and optional Portal publishing code. Keep attribution/category resources and requirements together. |
| `tools/community-notes/` | Operator backend schema, ordered migrations and operational guides. These are active assets. |
| `docs/places/`, `docs/user-guide/`, `docs/administration/` | Current task-based guidance for users and administrators. |
| `docs/development/` | Maintainer contracts, technical references and this baseline. |
| `docs/localization/` | Contributor instructions, glossary and review CSV; source catalogs remain authoritative. |
| `docs/releases/` | Unreleased 5.0 inventory, draft, preparation steps and dated source comparison. |
| `docs/history/` | Continuing design decisions; Git retains earlier implementations. |
| `examples/places/` | Explicit attributed sample dataset and matching manifest. This is example data, not a production service. |
| Local `data/` or `places-data/` | Generated regional exports, databases, Pro packages and operational output; ignored by Git. |

The root README and CONTRIBUTING are entry points. A new checkout already contains the implementation; users must not apply a sequence of historical patch installers.

## Cleanup evidence

Before cleanup, Git tracked 4,229 files. The pass removes 3,591 tracked artifacts, approximately 310.14 MiB of file contents:

| Removed category | Files | Reason |
|---|---:|---|
| `.refactor-backups/` snapshots | 2,131 | Generated development backups; ignored files had remained tracked. |
| `cjs/` delivery scripts | 423 | Superseded patch installers and duplicate helpers. Maintained checks/diagnostics already exist in `tools/`; no current source/test entry imports the delivery scripts. |
| Windows virtual environment and Python caches | 865 | Recreate dependencies using requirements; compiled caches and interpreter binaries are machine-specific. |
| `places-data/` publication outputs | 82 | Generated regional data, VTPKs, geodatabase files and reports; not source or test fixtures. |
| Platform wheel, duplicate/local data and local settings | 8 | The attributed example pair remains in `examples/places/`; private deployment output stays local. |
| Superseded root guides/schema copies | 17 | Current guides and active database schema/migrations already live in `docs/` and `tools/community-notes/`. |
| Intermediate delivery/trial notes | 65 | Current owner documentation and continuing decisions supersede these installation-history records. |

Four release documents move from the root into `docs/releases/`. Three older Places technical document paths remain as compatibility pointers to `docs/development/`; useful package-test evidence is retained there. All retained Markdown links are checked from their actual locations. No `src/` file is removed or rewritten. A hash scan found no byte-identical TS/TSX source files.

Before removing anything, the cleanup created and read back a SHA-256-verified recovery archive outside the repository: `map-ex-test-cleanup-recovery-43b7a4b.tar.gz`, with a per-file inventory `map-ex-test-cleanup-inventory.json`. The archive includes removed files and original release-document paths. Git at the baseline commit also preserves the originals. Restore selected files into a separate directory for inspection; do not overlay old installers/schemas onto a current checkout indiscriminately. The earlier POI migration stash remains separate and untouched.

This reduces the current source checkout and source archives. It does not shrink existing Git history, and it makes no claim about runtime bundle size or rendering speed. No history rewrite is part of the cleanup.

## Prevent recurrence

```sh
node tools/check-repository.cjs
node tools/check-docs.cjs
node tools/check-localization-catalogs.cjs
node tools/translation-table.cjs check docs/localization/translations.csv
```

The repository check examines tracked files even when `.gitignore` matches them, and includes new nonignored files. It rejects generated delivery trees, local environments, caches, downloaded wheels and publication outputs in source control. Ignore rules alone never untrack files already committed.

Use the Experience Builder host for dependencies and builds. There is deliberately no standalone application package manifest or invented dependency lockfile. See [Contributing](../../CONTRIBUTING.md) for environment setup and feature checks.

## Source candidates retained for separate review

An older maintenance note identified `src/components/Legend.tsx`, `NearbyCarousel.tsx`, `SequencePicker.tsx` and `src/utils/useNearbyImages.ts` as potentially unused. They are retained. Static reachability alone is not proof that a component has no external/dynamic consumer, and this cleanup does not change runtime behavior. Review imports, external usage and actual host bundle evidence before a separate source-removal change.

## Validation

- Repository/layout and Markdown link checks pass (zero broken local links).
- All 105 Python tests across 12 suites pass.
- All 312 implementation TS/TSX files transpile without syntax errors.
- Catalog checks pass: 1,174 runtime keys, 160 builder keys, 12 translation catalogs; the CSV matches.
- The full portable Node run has 1,282 tests: 1,138 pass and 144 fail. A separate untouched checkout of `43b7a4b` produces the same totals and identical failing test names/counts. These are existing baseline failures, not a green release gate.

See the [test baseline and failing-suite inventory](../history/refactoring/test-baseline.md) for commands, environment and next work. Portable tests and transpilation are distinct from full host type checking, a production build, or licensed ArcGIS Pro/Portal/browser acceptance.

## Remaining publication gates

- Complete the [5.0 inventory's acceptance work](../releases/5.0-change-inventory.md) and refresh its dated comparison against the final reviewed commit.
- Establish a reproducible Experience Builder 1.20 host build and actual desktop/mobile 2D/3D browser acceptance. This checkout does not contain a standalone app or a certified deployment.
- Address the development Mapillary token binding in `manifest.json` and review runtime debug logging before creating public distribution artifacts. No token/configuration was changed during organizational cleanup.
- Reconcile the declared Apache-2.0 license with the intended public repository's actual license, ownership, attribution and distribution files; a root LICENSE is absent in this development checkout. Preserve Overture notices/sample metadata and applicable SDK/data requirements.
- Decide and document source/prebuilt distribution contents. Widget runtime source/assets differ from optional operator tooling, tests and example data; do not assume a smaller checkout proves the host excludes them from a published app.
- Resolve or explicitly track baseline test-fixture failures and unavailable integration dependencies. Keep them separate from deployment acceptance evidence.
- Avoid treating a manifest version of 5.0.0 as a release/tag. Commit the reviewed baseline when ready; do not publish or rewrite history as an incidental cleanup step.

## Apply the cleanup to an existing checkout

The optional one-time `apply-repository-cleanup-v2.cjs` reproduces this organizational change; it is not a feature-patch installation sequence. Save it at the widget root and stop local development/Places processes before running:

```sh
node apply-repository-cleanup-v2.cjs --dry-run
node apply-repository-cleanup-v2.cjs
```

It validates expected file hashes (allowing CRLF for text) and refuses symlinks or conflicting edits to scripts/documentation. Recognized generated data, local settings backups, installer backups and environment/cache files may differ from Git: their exact local bytes are archived before removal, never replaced with repository copies. Every affected original is backed up before mutation; unrelated local files are left alone. Backups and rollback state live under `.repository-cleanup-backups/baseline-43b7a4b/`; keep that folder outside source control. It does not stage, commit, push, publish or change runtime source/configuration. Rollback refuses to discard edits made after cleanup:

```sh
node apply-repository-cleanup-v2.cjs --uninstall --dry-run
node apply-repository-cleanup-v2.cjs --uninstall
```
