# Runtime JavaScript dependencies

Install these additional packages in the Experience Builder **client** directory, not inside the widget. Use the host-supported Node version and preserve its lockfile. Full host setup is in the [installation guide](../installation.md).

**Experience Builder 1.20 (npm):**

```sh
npm install --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0
```

**Experience Builder 1.21 (pnpm):**

```sh
pnpm add --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0
```

If the client package is a pnpm workspace root, use the explicit workspace-root variant in the installation guide. Do not run the npm install command in the 1.21 host. The package versions are unchanged; the package manager follows the host version. Full 1.21 widget acceptance remains pending.

These were npm's latest releases checked on 14 November 2026. Exact versions keep installations reproducible; a future `latest` tag must be evaluated before changing these instructions.

| Package | Role |
|---|---|
| `mapillary-js` | Imagery viewer, detection tags, geometry helpers and custom render passes. |
| `pbf` | Direct decoding of binary protobuf tile data. Version 5 separates `PbfReader` and `PbfWriter`. |
| `@mapbox/vector-tile` | Reads MVT layers, feature properties and geometry using the reader. Version 3 depends on pbf 5. |

Runtime and detection utilities import `PbfReader as Pbf`; the existing reader construction sites keep their behavior. There is no default `Pbf` export in pbf 5. Do not use the earlier pbf 4 setup command with this source. MapillaryJS 4.1.2 retains an internal pbf 3.3.0 dependency; allow npm to resolve that separately rather than forcing a global override.

## Validation

`tests/vectorTileDecoding.test.cjs` uses the installed packages and actual encoded binary tiles, not mocked decoders. It verifies image identity/heading/coordinates, normalized detection polygons, missing detection layers, sequence membership, native anchors and cache reuse. Run it with the runtime dependencies and TypeScript available from the host:

```sh
node --test tests/vectorTileDecoding.test.cjs
```

The upgrade was also checked using a browser-target production-mode webpack bundle of the current detection utility and required viewer/decoder exports. The smoke build disables minimization and is not a widget bundle-size measurement. The focused TypeScript import/export check passes with the adopted reader import.

The affected portable suites reported 122 tests: 117 passed and 5 failed. The five failures in `nativeCoverageAlignmentFix.test.cjs` reproduce with the original `43b7a4b` source; the three newly added real-decoder tests pass. This does not replace the broader [existing test baseline](test-baseline.md).

This upgrade does not claim improved rendering performance or image quality. A full Experience Builder 1.20 host build and real desktop/mobile 2D/3D checks remain deployment acceptance work, especially for coverage hover/click, direction cones, sequence navigation, detection overlays and custom viewer renderers.

## Optional source installer

`apply-latest-runtime-dependencies.cjs` updates widget imports, setup documentation and the real-decoder regression suite. Run it from the widget root with `--dry-run` first. It makes source backups, supports `--uninstall`, and refuses unexpected edits. It does not run npm or modify the host package files. After applying it, run the command for your host version above in the host client directory and rebuild/restart Experience Builder.

Uninstall restores widget files only. Host dependency and lockfile changes are managed separately by npm/source control; retain their previous state if a package rollback may be needed.
