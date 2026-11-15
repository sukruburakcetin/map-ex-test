# Portable test baseline

Recorded 13 November 2026 against `43b7a4b` and the organizational cleanup, using Node 24.19.0, Python 3.12.14 and the available Experience Builder dependency directory. These environment versions are a record of this run, not a newly declared supported host matrix.

## Results

| Check | Result |
|---|---|
| All `tests/*.test.cjs`, concurrency 2 | 1,282 tests: 1,138 passed, 144 failed |
| Same Node command in untouched detached `43b7a4b` checkout | Identical totals and failing test names/counts |
| All 12 `tests/*.test.py` suites | 105 tests passed |
| TS/TSX syntax transpilation | 312 implementation files, zero errors |
| Localization catalogs | 1,174 runtime keys, 160 builder keys, 12 translation catalogs, zero catalog errors |
| Translation review CSV | Matches catalogs and language names |
| Markdown local links | Zero broken links |
| Repository hygiene | No tracked generated artifacts remaining |

Transpilation is not semantic type checking. No full Experience Builder production build, browser/GPU acceptance, licensed ArcGIS Pro run or authenticated Portal acceptance was performed in this cleanup.

## Reproduce the Node comparison

Run from the widget root with the host dependencies available. In this cloud environment:

```sh
MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript NODE_PATH=/workspace/experience-builder-1.20/client/node_modules node --test --test-concurrency=2 tests/*.test.cjs
```

The unmodified baseline was checked out separately at `/tmp/map-ex-test-baseline-43b7a4b` and run with the same environment and command. The failing test names/counts match, not merely the aggregate total. This provides evidence that the organizational cleanup did not introduce these failures; it does not establish that the product is release-ready.

## Existing failing suites

Counts below are failing test reports. A suite that fails during loading may report one failure even though its individual assertions never ran.

| Suite | Failing reports |
|---|---:|
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/collaborationWorkspaceMigration.test.cjs` | 1 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/communityWorkspaceDatabase.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionImageAttachmentsDatabase.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/directContributionsDatabase.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/pointCloudAcquisition.test.cjs` | 12 |
| `tests/pointCloudCalibration.test.cjs` | 11 |
| `tests/pointCloudExport.test.cjs` | 15 |
| `tests/pointCloudGeometry.test.cjs` | 5 |
| `tests/pointCloudHitRouting.test.cjs` | 1 |
| `tests/pointCloudMapLayer.test.cjs` | 1 |
| `tests/pointCloudResult.test.cjs` | 13 |
| `tests/pointCloudSight.test.cjs` | 6 |
| `tests/pointCloudTools.test.cjs` | 13 |
| `tests/pointCloudViewshed.test.cjs` | 5 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |
| `tests/workspaceContributionsDatabase.test.cjs` | 1 |
| `tests/workspaceDisplayNamesDatabase.test.cjs` | 1 |

## Failure classes and next work

- Database suites cannot load `@electric-sql/pglite` in the available environment. Establish the supported test dependency setup before judging their behavior.
- Some source-extraction/transpilation fixtures omit new imports or helpers (`require`, `englishPresentation`, `detectionThumbnailBounds`, Portal source helpers) or generate invalid extracted snippets. Repair these as test-harness work without weakening their behavioral assertions.
- Some comparison fixtures assert earlier localized feedback strings or old source patterns; review each against current intended behavior before changing expectations.
- React/locale fixture mismatches and UK catalog/marker sizing assertions also fail. These need individual diagnosis, not blanket rebaselining.

A green focused feature suite must not be described as a green repository-wide baseline. After dependency/fixture repairs, rerun the full set and update this record. Keep browser and deployment acceptance distinct.
