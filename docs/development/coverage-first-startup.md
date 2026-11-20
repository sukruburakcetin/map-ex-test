# Coverage-first startup

Coverage already runs independently of opening an image viewer. The ready-view callback now starts the existing coverage task before restoring optional graphics, Places and feature layers. These tasks overlap; a failure restoring an optional tool no longer prevents coverage from starting. Coverage errors are observed immediately. The existing completion boundary still awaits coverage before binding the URL watcher.

Module readiness, restored login camera and current-view checks remain ahead of coverage. Original filtering, shared-link map-type gates, pending-request reuse, cancellation and request limits remain. No hidden map, delayed viewer, new fetch/prefetch, timer, module import or cache budget is introduced.

Visible native coverage and raw hover picking use separate data paths. Starting coverage earlier does not mean all low-zoom hover targets are cached. Remote responses and an immediate first hover can still wait. This change is deliberately limited to ordering existing work; no measured live speedup is claimed.

Seven tests execute the production ready-view callback with deferred module/camera/coverage promises. They verify startup gates, optional restoration while coverage is pending, stale view rejection, continued coverage after optional failure, observed errors and quiet cancellation. Portable suite and syntax checks are recorded at delivery; ExB 1.21 host build and live browser acceptance are pending.

Requires the previous low-zoom hover responsiveness update. From widget root:

```sh
node apply-coverage-first-startup.cjs --dry-run
node apply-coverage-first-startup.cjs
# Undo only this update:
node apply-coverage-first-startup.cjs --uninstall
```

The installer checks actual source fingerprints, preserves documentation histories and exact original bytes outside the widget, and refuses unknown changes. Reverse newest first. Restart the ExB client and hard-refresh. Check initial coverage with no image open, creator/date/panorama presets, shared-link startup, 2D/3D switching, hover and normal image opening. Compare timing under the same conditions before asserting an improvement.
