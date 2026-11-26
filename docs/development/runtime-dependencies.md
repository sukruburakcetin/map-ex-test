# Runtime JavaScript dependencies

Install these additional packages in the Experience Builder **client** directory, not inside the widget. Use the host-supported Node version and preserve its lockfile. Full host setup is in the [installation guide](../installation.md).

First follow the installation guide's [directory verification](../installation.md#confirm-the-directory-before-installing). The terminal must identify the intended `exb-client` package before running the install command. A working widget can otherwise hide packages resolved from a parent `node_modules`. Verify both direct declarations and resolution after installation; see [missing-dependency diagnosis](../installation.md#if-the-widget-works-but-dependencies-appear-missing).

**Experience Builder 1.21 (pnpm):**

```sh
pnpm add --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0 pako@2.2.0
```

If the client package is a pnpm workspace root, use the explicit workspace-root variant in the installation guide.

Use exact versions and keep the host lockfile so the installation is reproducible.

| Package | Role |
|---|---|
| `mapillary-js` | Imagery viewer, detection tags, geometry helpers and custom render passes. |
| `pbf` | Direct decoding of binary protobuf tile data. Version 5 separates `PbfReader` and `PbfWriter`. |
| `@mapbox/vector-tile` | Reads MVT layers, feature properties and geometry using the reader. Version 3 depends on pbf 5. |
| `pako` | Directly imported gzip/zlib fallback for SfM reconstruction decoding when browser worker decompression is unavailable. Install it directly; do not rely on the viewer or host hoisting it. |

Runtime and detection utilities import `PbfReader as Pbf`; the existing reader construction sites keep their behavior. There is no default `Pbf` export in pbf 5. Do not use the earlier pbf 4 setup command with this source. MapillaryJS 4.1.2 retains an internal pbf 3.3.0 dependency; allow pnpm to resolve that separately rather than forcing a global override.

## Validation

`tests/runtimeDependencies.test.cjs` exercises real protobuf/MVT decoding and the
actual point-cloud download/decompression fallback with the documented packages.
Run it through the [portable test runner](portable-tests.md), or with TypeScript
and these packages resolvable from your environment:

```sh
node --test tests/runtimeDependencies.test.cjs
```

Use the [host acceptance checklist](exb-1.21-validation.md) to verify the widget in Developer Edition.
