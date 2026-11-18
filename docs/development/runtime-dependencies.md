# Runtime JavaScript dependencies

Install these additional packages in the Experience Builder **client** directory, not inside the widget. Use the host-supported Node version and preserve its lockfile. Full host setup is in the [installation guide](../installation.md).

**Experience Builder 1.20 (npm):**

```sh
npm install --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0 pako@2.2.0
```

**Experience Builder 1.21 (pnpm):**

```sh
pnpm add --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0 pako@2.2.0
```

If the client package is a pnpm workspace root, use the explicit workspace-root variant in the installation guide. Do not run the npm install command in the 1.21 host. The package versions are unchanged; the package manager follows the host version. Full 1.21 widget acceptance remains pending.

The viewer/decoder versions were checked on 14 November 2026; pako 2.2.0 was added explicitly on 18 November 2026. This is a tested set, not a promise that every pin is currently the latest release. Exact versions keep installations reproducible; a future `latest` tag must be evaluated before changing these instructions.

| Package | Role |
|---|---|
| `mapillary-js` | Imagery viewer, detection tags, geometry helpers and custom render passes. |
| `pbf` | Direct decoding of binary protobuf tile data. Version 5 separates `PbfReader` and `PbfWriter`. |
| `@mapbox/vector-tile` | Reads MVT layers, feature properties and geometry using the reader. Version 3 depends on pbf 5. |
| `pako` | Directly imported gzip/zlib fallback for SfM reconstruction decoding when browser worker decompression is unavailable. Install it directly; do not rely on the viewer or host hoisting it. |

Runtime and detection utilities import `PbfReader as Pbf`; the existing reader construction sites keep their behavior. There is no default `Pbf` export in pbf 5. Do not use the earlier pbf 4 setup command with this source. MapillaryJS 4.1.2 retains an internal pbf 3.3.0 dependency; allow npm to resolve that separately rather than forcing a global override.

## Validation

`tests/runtimeDependencies.test.cjs` exercises real protobuf/MVT decoding and the
actual point-cloud download/decompression fallback with the documented packages.
Run it through the [portable test runner](portable-tests.md), or with TypeScript
and these packages resolvable from your environment:

```sh
node --test tests/runtimeDependencies.test.cjs
```

The earlier `vectorTileDecoding.test.cjs` report referred to a test file not present
in this checkout. It must not be used as evidence of current validation. The new
suite replaces that missing validation entry point; it does not claim a complete
live viewer or GPU test.

The isolated runtime/settings build uses the available ExB 1.20 host rules and
transpile-only loader. Full ExB 1.21 packaging/browser acceptance remains separate.
See the [current test baseline](test-baseline.md) for full-suite limitations.

## Updating existing installations

A current checkout already contains the supported imports. New installations do
not need historical source-patch installers. Follow the host-specific installation
commands above, keep the host lockfile, and rebuild/restart after dependency
changes. Do not force one pbf version across the viewer's internal dependency tree.

Reversible source installers restore widget files only. Host package/lockfile
updates remain separate and must be reviewed or rolled back through the host's
package manager/source control.
