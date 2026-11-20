# Coverage zone properties — stage 77

coverageZoneProperties owns the coverage-analysis rectangle geometry and 2D/3D symbol properties. The widget keeps its context guards, existing-zone clear, Graphic constructor, __isCoverageZone marker, owned-resource attachment and reference assignment. The existing clearCoverageZone method remains unchanged. Widget is 28 lines shorter.

The helper receives the original four scalar bounds and dimension flag. Coordinate order, explicit ring closure, wkid 4326, colors, 2D/3D opacity and outline width remain. Property/ring/color objects are fresh for every call; no static mutable symbol is shared between draws. The instance-only marker is not inserted into constructor properties. No bounds normalization, validation, copy of an existing graphic, layer, timer, request or additional rendering work is introduced. No measured speedup is claimed.

Twenty-three tests compare the frozen original/current draw workflow and constructor/attachment traces for both dimensions, standard and unusual extents, missing context and clear/create/add failure boundaries. Fresh-property tests check object and nested-array independence. Strict TypeScript checks the standalone helper and literal type names. Actual ExB types/build and browser acceptance remain separate.

Requires stage 76. From widget root:

```sh
node apply-coverage-zone-refactor.cjs --dry-run
node apply-coverage-zone-refactor.cjs
# Undo only this stage:
node apply-coverage-zone-refactor.cjs --uninstall
```

Actual source is preflighted before writes; exact original bytes and local documentation history are preserved. Unsupported edits and rollback over later changes are refused. Backups live outside the widget; reverse newest first. Restart/hard-refresh, build in ExB 1.21 and check coverage-analysis extent appearance, replacing/clearing a region and 2D/3D styles. Continuation does not establish host installation/build acceptance.
