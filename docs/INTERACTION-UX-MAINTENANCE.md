# Interaction UX: contributor map and consolidated delivery

The hover/click optimization work is complete at the controlled-test level. Keep the existing first-glance behavior: immediate hover feedback, correct image identity and bearing, a retained thumbnail during same-image enrichment, and a selected faint sequence overview independent of transient hover failures. Avoid changing UX while reorganizing ownership.

## Find the owner

| Responsibility | Owner |
| --- | --- |
| Skip unnecessary SDK checks only when no competing owner needs them | `src/features/coverage/coverageClickDispatch.ts` |
| Responsive nearest-image scan of a fully loaded route | `src/features/coverage/nearestLoadedFrame.ts` |
| Regional frame discovery shared by hover and click | `src/features/coverage/CoverageFrameLookup.ts` |
| Correct hovered image identity and bounded local hints | `src/features/imagery/hoverBearingTarget.ts` |
| Thumbnail element retention, safe card construction and positioning | `src/features/imagery/hoverCard.ts` |
| Production metadata cache contract and expiry | `TurboMetadataCache` in `src/utils/turboCoverageUtils.ts` |
| Selected/hover native coverage roles | `src/features/coverage/TileSequenceHighlights.ts` and `NativeTileHighlightCache.ts` |
| Bounded local dispatch/SDK/image-ready timing | `src/features/imagery/SequencePerformance.ts` |
| Wiring, request identity and priority dispatch | `src/runtime/widget.tsx`: map click/pointer callbacks, `loadSequenceById`, `prepareDemandSequence` |

The runtime still owns significant orchestration. This update does not claim the larger runtime refactor is finished. Once host validation is complete, extract click/pointer orchestration in a separate behavior-preserving refactor, retaining these helpers and regression tests.

## Invariants for reviews

- Route/annotation tools, shared notes, point-cloud tools, Places and successful detection hits retain their priority.
- The latest click owns pending selection. Late SDK, feature or metadata results cannot open stale imagery/popups or report stale errors.
- Individual points keep exact image identity. Regional nearest-frame work must not substitute a representative's bearing.
- `TurboMetadataCache` is not a JavaScript Map: use its TTL-aware public methods. Runtime fixtures must use the real cache class where that contract matters.
- Ordinary browsing opens the image before optional route context. Do not restore full-sequence coordinate enumeration as a prerequisite.
- Hover and selected sequence roles remain independent. An optional detection failure cannot dismiss valid imagery feedback.
- Same-image enrichment may retain a thumbnail. Different image IDs, changed URLs and cleared cards cannot borrow stale pixels.
- Long loaded-route scans inspect every frame cooperatively; no sampling or spatial approximation may change the chosen image.

## Focused verification

With TypeScript available, run from the widget root:

    node tools/test-interaction-ux.cjs

If TypeScript is installed outside normal Node resolution:

    MAPILLARY_TYPESCRIPT=/absolute/path/to/typescript.js node tools/test-interaction-ux.cjs

Add `--browser` to include real Chromium thumbnail tests. Those require Playwright and Chromium; optional overrides are `MAPILLARY_PLAYWRIGHT` and `CHROMIUM_PATH`. The runner forwards the caller's environment, executes each test directly, stops on failure and reports browser checks separately. It does not build Experience Builder or pretend the entire repository test suite is green.

Current focused results: 133 tests plus seven Chromium checks. Earlier reproduction tests demonstrate the metadata cache crash, stale click ordering, synchronous long-scan interruption, same-image element replacement and optional-hover error propagation before their fixes.

For host validation, check 2D and tilted 3D, cold/warm hover, rapid clicks in reverse response order, active competing tools, a 10,000-frame cached route, thumbnail loading, close/reopen and preserved selected faint overview. Existing debug-mode metrics distinguish click-dispatch, SDK viewer-open and total click-image time. A controlled test is not a deployed FPS/latency benchmark. The previously discussed terrain-projection hypothesis has not been established as a live failure after the confirmed cache crash was fixed; do not change terrain picking based on that hypothesis alone.

## Consolidated installer

`apply-interaction-ux-bundle.cjs` includes the six completed fixes and this contributor/test documentation. It accepts the original reviewed GitHub source and the supported sequential intermediate installer states. Already-current sources are kept; conflicting source blocks are refused. Run outside `src` from the widget root:

    node apply-interaction-ux-bundle.cjs --dry-run
    node apply-interaction-ux-bundle.cjs

Rebuild/reload Experience Builder after applying code changes. If all individual patches are already installed, the bundle adds the maintenance guide, roadmap checkpoint and focused test runner; it does not intentionally change further runtime behavior. Do not reapply the old individual installers over the bundle: their older test payloads may conflict with newer fixtures.

The standalone bundle uninstaller restores the exact pre-bundle state of files actually changed by the bundle. Therefore it preserves individual patches that were installed beforehand. On a clean original baseline it reverses the entire bundle. It refuses files edited after installation. Keep `.refactor-backups` for rollback; do not commit installer backups into the repository.
