# Repository maintenance

The source tree is the implementation. Git history retains prior deliveries; sequential patch installers and their generated backups are not required for a current checkout. Maintained checks and diagnostics live under `tools/`. Database upgrades remain under `tools/community-notes/migrations/`.

Use one document per current task/contract. Update the documentation index when adding a guide, and check links from the file's actual directory. Keep language review material separate from current translation instructions. Feature READMEs should link to architectural owners rather than duplicate administrator setup.

The runtime remains a large coordinator. Continue feature extraction only with behavioral evidence: preserve request ownership, cancellation, busy gates, bounded cache/graphics counts and note publication semantics. Do not infer a rendering improvement from fewer files or lines.

Generated Python caches, local environments and installer backups are ignored. The explicit example Places dataset is kept with its manifest/attribution; deployments should generate data outside tracked source. A normal removal commit does not remove old objects from Git history.

The repository relies on an Experience Builder host for dependencies/building. Portable tests, protocol checks and source syntax validation supplement a real host build and live 2D/3D/mobile acceptance; they do not replace them. See [contributing](../../CONTRIBUTING.md) and the [roadmap](roadmap.md).
