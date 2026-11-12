# Preparing version 5.0

Version 5.0 is in development. These files are a living record, not a release announcement.

- [Draft release notes](5.0-draft.md): concise user-facing changes.
- [Change inventory](5.0-change-inventory.md): evidence, baseline distinctions, open work and publication checks.
- [Source comparison snapshot](5.0-source-comparison.json): file/configuration changes against the pinned 4.6 source. This is a dated snapshot, not an automatically maintained status report.

The baseline is public tag `v4.6.0`, commit `b143e7db9f67dc393c2b9eb85e131f6141aeca9f`, in `sukruburakcetin/mapillary-explorer`. Public main `97dc542831d1742544a86267cde5a7dcd306d817` changes three documentation files relative to that tag; the source is identical. Preserve those newer public documentation changes when preparing the release.

## Keep the record current

For every meaningful change, update its existing inventory row or add a stable ID. State the user-visible outcome, distinguish new functionality from changes to 4.6 functionality, link its current source/test owner, and record any remaining acceptance work. Update the short release draft only when the behavior is implemented and intended to ship. Keep internal refactors in the developer section.

Use descriptive future commits, for example:

```text
feat(places): add persistent regional dataset import
fix(imagery): preserve hovered capture identity during navigation
docs(release): update the 5.0 change inventory
```

These are examples for future work, not descriptions of commits that already exist. Existing development commits with generic titles remain useful snapshots; source comparison and the inventory recover the feature story without rewriting history.

## When development is finished

1. Decide which implemented features are ready to ship; complete the inventory's validation gates.
2. Refresh the comparison against the exact final development commit and record that commit. Include any remaining local edits in a reviewed commit first.
3. Merge the development implementation into the public repository while retaining its applicable license, security/community policies, workflows, branding and current deployment guidance. Do not replace the public repository blindly with the test repository.
4. Finalize the top-level `CHANGELOG.md` entry from the short draft. Remove pending items and replace development status with the actual release date.
5. Build and test the distributed widget. Publish the intended source/prebuilt artifacts and their setup instructions; verify manifest/package versions agree.
6. Create the actual release commit/tag `v5.0.0` and use the finalized short draft for GitHub's What's new/release body.

If importing the development code in one commit, use a title such as `release: prepare Mapillary Explorer 5.0` and a body summarizing feature groups, compatibility/configuration changes and validation. That single commit need not pretend to recreate the original sequence of development commits. Keep the detailed inventory as the durable record.
