# Version 5.0 change inventory

Status: **in development; not released**. Reviewed on 2026-11-10.

## Comparison anchors

- Public baseline: [`v4.6.0`](https://github.com/sukruburakcetin/mapillary-explorer/tree/v4.6.0), commit `b143e7db9f67dc393c2b9eb85e131f6141aeca9f`.
- Public main checked: `97dc542831d1742544a86267cde5a7dcd306d817`. Only README, CONTRIBUTING and COMPATIBILITY differ from the tag; implementation files are identical.
- Development history: `map-ex-test` commit `62425b7`, plus the current local Places/repository cleanup on `chore/places-and-documentation-cleanup`. The cleanup and these release documents are not yet a committed final release.
- The source comparison JSON records file hashes and configuration-key changes for this working-tree snapshot. A file addition is evidence of code organization, not by itself proof of a new product capability.

## Already present in 4.6

Source review confirms existing map/viewer synchronization, shareable state, fullscreen/minimap, nearby captures, Turbo coverage/date/panorama/quality filtering, AI outlines/labels and detection layers, street coverage analysis, basic capture-route generation and GPX export, Local field notes/GeoJSON, point-cloud viewing/calibration/ground/color controls, measurement, lasso, line-of-sight, viewshed and CSV export.

The 4.6 README does not describe every implemented capability; the runtime and components were also checked. In particular, routing/GPX and local notes must be described as expanded workflows, not invented as new 5.0 features.

## Implemented candidates for the release

“Implemented” means source is present. Each item still needs the final acceptance appropriate to its service/host. This table is a development inventory, not a promise that all rows will ship.

| ID | Area and proposed claim | Difference from 4.6 | Current evidence / owner | Remaining acceptance |
|---|---|---|---|---|
| V5-01 | Built-in optional Overture Places context | New feature | `src/features/places/`, [architecture](../places/architecture.md), `PlacesPanel.tsx` | Persistent import/inspect/configured HTTPS are implemented; real hosted capacity and 2D/3D/mobile acceptance remain. |
| V5-02 | Places full-area search, bounded paging and Auto/manual list updates | New feature within Places | `PlacesController.ts`, `PlacesVectorLayer.ts`, `placesTileParity.test.cjs`, `placesPanel.browser.cjs` | Dense/large regional data and actual deployment latency. Tiles and list have separate loading semantics. |
| V5-03 | Places imagery and note integration; minimizable compact panel | New feature within Places | `PlacesCoordinator.ts`, `PlaceNoteReview.ts`, `SelectedPlaceCard.tsx`, note identity/review tests | Actual Mapillary results and all configured note destinations. Nearby does not guarantee an entrance is visible. |
| V5-04 | 13 language/locale choices, localized builder/viewer and Arabic RTL | New localization system | `src/i18n/`, language settings, catalog/table tests | Native-language review and long-text/RTL checks in the published app. Includes US/UK English and two Chinese variants. |
| V5-05 | Optional Enterprise shared field notes | New shared backend path; Local notes existed | `enterpriseEndpoint.ts`, `enterpriseEdit.ts`, `EnterpriseNotesList.tsx`, [service setup](../administration/enterprise-notes.md) | Real portal capabilities, roles, GlobalIDs, edit/attachment retries and upgrade behavior. |
| V5-06 | Operator-managed collaboration workspaces | New shared workflow | `src/features/community-notes/`, [operator kit](../../tools/community-notes/README.md), SQL migrations 002–006 | Real provider/accounts; membership/RLS, invitations, moderation/retention and deployment configuration. No default hosted service is supplied. |
| V5-07 | Workspace categories, aliases, search/statistics and direct contributions | New workflow within workspaces | `WorkspaceCategoryEditor.tsx`, `useWorkspaceContributions.ts`, workspace guides and SQL migrations | Multiple real accounts and narrow/RTL presentation; identity/role enforcement remains ID-based. |
| V5-08 | Note statuses, resolution fields and source-aware search | Expanded Local/Enterprise note workflows | `noteSearch.ts`, `NotesSearchControls.tsx`, note forms/types, [search guide](../user-guide/notes-search.md) | Persistence/import compatibility. Local search covers the collection; Enterprise search covers loaded records. |
| V5-09 | AI-detection note preparation with optional cropped attachment | Expanded note/detection integration | `detectionNote.ts`, `DetectionNoteAction.tsx`, `detectionImageAttachment.ts`, field-note draft/viewer owners | Check position/provenance, explicit attachment choice, saved crop lifetime and supported destinations in the live app. |
| V5-10 | Image-first opening and on-demand sequence context | Improved existing imagery navigation | `src/features/imagery/`, `SequencePerformance.ts`, `nearbyDiscovery.ts`, interaction regression suites | Cold/warm click-to-image measurements, rapid navigation, playback and slow-network behavior. No fixed speed multiplier claimed. |
| V5-11 | Closest-first nearby browsing and clearer hover/selection feedback | Improved existing nearby tray | `nearbyDiscovery.ts`, hover target/card owners, shared dispatcher | Confirm thumbnail/point/cone identity in 2D/3D. Ranking is within returned captures, not guaranteed globally nearest. |
| V5-12 | Native coverage selection, marker/cone and follow behavior | Improved existing coverage/map synchronization | `src/features/coverage/`, `src/features/map-graphics/`, `imageFollowPolicy.ts`, [interaction guide](../development/interaction-ux.md) | Live terrain/GPU alignment, map-edge movement, view switching, filter preservation and long routes. |
| V5-13 | Organization-aware coverage filters | New filter dimension | `organizationFilter.ts`, filter controls and runtime organization lookup | Real organization IDs/names, combined predicates, empty/error cases and service access. |
| V5-14 | More reliable spherical AI labels and detection exploration | Improved existing AI overlays | `PanoramaDetectionLabels.ts`, `detectionExploration.ts`, `DetectionExplorerControls.tsx`, `MapSpriteLoading.ts` | Spherical/flat captures, clipping, category modes, loading feedback and default readability. Source data availability still matters. |
| V5-15 | A/B capture planning, provider selection and time-budget controls | Expanded existing route/GPX workflow | `routeOptimizer.ts`, `arcgisRoutingProvider.ts`, `osrmRoutingProvider.ts`, `RouteControls.tsx` | Actual providers/authentication, travel-mode availability, budgets and output route semantics. |
| V5-16 | A-to-B route preview simulation | New route preview; not live navigation | `RoutePreviewSimulation.ts`, `RoutePreviewControls.tsx` | Play/pause/resume/stop, speed, follow and cleanup after route/view changes. Show controls only with a generated route. |
| V5-17 | Sequence elevation profile with confirmed-image tracking | New analysis feature | `ElevationProfileController.ts`, `profileIndicator.ts`, [feature contract](../../src/features/elevation/README.md) | Terrain/service queries and live playback. Computed/reported camera heights are estimates, not surveyed road elevations. |
| V5-18 | Capture-time solar visualization and scene lighting | New optional analysis feature | `src/features/solar/`, [feature contract](../../src/features/solar/README.md) | Timestamp/location validity, night/day cases, GPU display and restoring native scene lighting. |
| V5-19 | PLY and LAS point-cloud exports alongside CSV | New export formats; CSV/cloud tools existed | `PointCloudExportControls.tsx`, `PointCloudExport.ts`, export/format helpers and tests | Open exports in target GIS/CAD software; verify calibration, coordinate systems, metadata and retained point counts. |
| V5-20 | Point-cloud lifecycle, adaptive display and selection consistency | Improvements/refactoring of existing tools | [point-cloud owners](../development/point-cloud.md), `PointCloudAcquisition.ts`, `PointCloudMapLayer.ts` | Large real clusters, partial edits, cancel/retry, view transfer, lasso and measured export behavior. Do not announce existing lasso/measurement as new. |
| V5-21 | In-widget Time travel thumbnail comparison | Expanded existing Time travel action | `TimeTravelPreview.tsx`, [viewer guide](../user-guide/time-travel.md) | Real capture thumbnails, dates, keyboard/mobile behavior and cancellation. Comparison is static thumbnails, not two synchronized viewers. |
| V5-22 | Compact panels, themed scrolling and focus improvements | Improvements to existing desktop/mobile UI | InfoBox feature sections, styles, Places/browser checks, [InfoBox guide](../development/info-box.md) | Every published responsive widget instance and browser; no blanket device-compatibility claim. |
| V5-23 | Feature ownership, cancellation and test infrastructure | Developer improvements | `src/features/`, `src/services/`, `tests/`, [architecture](../development/architecture.md) | Full host build/smoke environment. Extracted files are not independently new user features. |
| V5-24 | Task-based documentation and repository hygiene | Administrator/contributor improvements | [documentation index](../README.md), `tools/check-docs.cjs`, current cleanup | Preserve public project policies and supported deployment instructions during integration. Cleanup is currently a local working-tree change. |
| V5-25 | Regional Places service with import-once persistent SQLite, config-based HTTPS, health and release rollback | New backend delivery within Places | `tools/overture_places/places_service.py`, `places_store.py`, store and real-HTTPS CLI tests | Process-supervisor/proxy deployment and measured regional capacity; current import limit remains 100,000. |

## Work that is not complete / not an announcement yet

- Places deployment/capacity acceptance: persistent SQLite import/indexes, configuration-based HTTPS startup, health and explicit release rollback are now implemented and covered by store/real-TLS tests. Process-supervisor/reverse-proxy deployment and larger workloads still need actual-host validation; this is not a national-service capacity claim.
- Final choice of shipping features and defaults. Implementation presence does not substitute for owner acceptance.
- Reproducible final Experience Builder build and actual 2D/3D/mobile/service verification for the package that will be distributed.
- Release date, final commit/tag, compiled artifact, final compatibility matrix and any remaining bug fixes.

## Publication checks

- Refresh this inventory and the short draft against the final committed tree; remove unfinished features from the announcement or label their availability accurately.
- Keep public `LICENSE`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github` configuration, branding and current deployment guidance when integrating. These are absent from the development snapshot and should not disappear through a folder replacement.
- Resolve the existing licensing metadata discrepancy explicitly: the public repository's license text/README identify MIT, while its manifest points to Apache 2.0. The development manifest retains that Apache URL. Do not silently pick a new license as part of a feature merge.
- The 4.6 manifest targets ExB 1.18; the development manifest targets 1.20. Validate the intended target environments and update compatibility instructions rather than infer support from badges or source syntax checks.
- Document new optional service configuration: Places, routing providers, Enterprise notes and collaboration workspace provisioning. Avoid embedding private credentials in distributed configuration.
- Record final automated checks and live-host observations. The recent cleanup's targeted passes are not certification of every 5.0 capability.
- Use user-visible outcomes for release highlights; keep source moves, test fixture changes, intermediate installers and abandoned experiments out of the headline feature list.

## How to continue

Update this table when work changes, using the stable IDs above. Track implementation and live acceptance separately. At release time, derive GitHub's release body and CHANGELOG from the accepted rows, and use a descriptive release-import commit body if the public repository receives the development work in one commit. See [release preparation](README.md).
