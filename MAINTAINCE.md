# Maintenance audit and staged cleanup

## Findings from this checkout

The pre-documentation runtime has **16,598 lines**; `InfoBox.tsx` has **2,691**, and `styles.ts` has **1,416**. These are responsibility-concentration indicators, not proof of poor algorithms or slow rendering. The runtime mixes view/SDK ownership, selection, caches, networking, cloud tools, notes, routing and presentation. That makes safe changes harder even when individual paths are performant.

The original README was only a title. Current guidance was mixed with historical implementation notes, including obsolete zoom20 thresholds and old test counts. This pass adds contributor documentation and function-level contracts, separates historical/Enterprise material, and corrects those thresholds without changing application behavior.

`tools/audit-source.cjs` follows static local imports from the conventional runtime and settings entry points. It finds these unreachable modules:

| Candidate | Evidence and likely replacement | Safe next step |
|---|---|---|
| `components/Legend.tsx` | Not imported by either entry graph; runtime uses the host/native legend integration | Check external consumers and historical API use, then remove in an isolated PR |
| `components/NearbyCarousel.tsx` | Not imported; runtime renders the current nearby/object image tray | Confirm no external consumer before removal |
| `components/SequencePicker.tsx` | No static import from the entry graph | Confirm whether it is an intended public/experimental component before removal |
| `utils/useNearbyImages.ts` | Unreferenced legacy hook; runtime uses playback-aware `fetchNearbyImages` | Remove only after external-consumer confirmation; do not substitute it for the newer request path |

Nothing was deleted in this pass. Static reachability does not detect every external consumer or dynamic registration. Type declarations, manifest/config files, embedded image assets, SDK compatibility paths, and both routing providers are not redundant merely because they are small, large or similarly named.

Removing unreachable files may reduce repository clutter. It need not reduce the current production bundle, since unimported modules may already be excluded. Verify the host bundle before claiming a download/runtime improvement.

## Release engineering gaps

- No standalone dependency manifest/lockfile or checked-in CI workflow exists. The widget relies on an ExB host. Document and pin the actual tested host/library matrix before shipping a public release; do not fabricate a standalone application setup.
- The configured manifest contains a development application-token binding. Publish a configuration template rather than a deployed token. Runtime debug logging currently passes that token to `log` when debug mode is enabled; a separate focused redaction patch should remove credential values from logs. This documentation pass does not modify configuration or runtime logging.
- The manifest declares Apache2.0; this pass supplies its matching LICENSE text. Review third-party package/data attributions and repository ownership before release.
- Adapter tests are useful but are not a host build, real browser terrain/GPU validation or portal integration test. Add CI around the reproducible standalone suites first, then a compatible host build/smoke workflow.

## Compact structure without behavior changes

Keep the current coordinator initially. Extract one boundary per PR, preserving method behavior, request generations, caches and tests. Suggested order:

1. **Pure export and metadata helpers.** Move encoding/formatting helpers with explicit inputs and outputs. Preserve CSV columns, binary LAS/PLY contracts, units and retained point counts. Avoid changing alignment math in the same PR.
2. **Coverage controller.** Own raw/index/metadata caches, the current view/layer, loading generations and hover/picking resources in one controller. Keep style/predicate agreement and native fallback semantics. It should expose a small attach/update/detach API to the widget.
3. **Selection and nearby controller.** Own viewer listeners, shared sequence downloads, independent subscriber cancellation and idle nearby discovery. Keep image-first opening and complete sequence order. Detach must abort every owned request/listener.
4. **Enterprise notes controller.** Separate local storage, shared edits and attachment operations while keeping explicit publish semantics, visibility state and portal permission enforcement.
5. **Point-cloud controller.** Own discovery/cache/worker queues, retained cloud identity, scene edits, auto-follow state and cancellation. Move existing code first; renderer migration, GPU picking or changed sampling/budgets are separate performance projects.
6. **Routing/analysis controller.** Keep pure geography/optimization modules and the common provider contract. Extract runtime orchestration without merging the distinct ArcGIS/OSRM service semantics.
7. **InfoBox sections.** Extract controlled sections for coverage, notes, cloud tools, route planning and advanced tools. Keep scroll observation/footer behavior, stable menu portals and accessible labels. Avoid copying runtime-owned state into every section.
8. **Style families.** Split constants/layout/theme rules by component only after checking injected CSS ordering, selector specificity, portal styles and mobile container queries. A line-count reduction can still introduce hover or fullscreen regressions if cascade order changes.

Each controller should have one resource owner and a deterministic disposal method. Avoid replacing the large class with a large global store plus duplicated state in many hooks. Lazy-load optional code only after measuring bundle/build behavior and verifying host module compatibility.

## Acceptance for each extraction

Require token/AST-level equivalence where the PR is a pure move, relevant regression tests, a compatible ExB build and real-browser smoke cases for the affected subsystem. Compare request counts, cancellation, retained memory and measured latency using the same scenario. Keep the old and new implementation comparison reviewable; broaden tests when a changed boundary warrants it, not simply to inflate counts.

These stages make the code easier to contribute to. They do not by themselves claim improved FPS, lower memory or release readiness.
