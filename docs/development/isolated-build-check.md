# Isolated Experience Builder bundle check

This check compiles this checkout's runtime and settings entries using an installed Experience Builder client's webpack loader and external-module rules. It checks bundling and named exports, complementing the static relative-import audit and controlled tests.

## Run from the widget folder

Install the widget's [documented dependencies](runtime-dependencies.md) in the Experience Builder client first. The checker does not install packages.

```sh
node tools/check-exb-build.cjs --client "C:\path\to\arcgis-experience-builder-1.21\client"
```

It prints a new temporary output directory and writes `build-report.json` there, recording client/dependency versions, entry points, errors, warnings and scope limits. Errors or warnings fail the check.

Optional arguments:

- `--dependencies <node_modules directory>` supplies a separate dependency installation; the client's own dependencies remain available as fallback. It can also diagnose an existing parent-folder installation. The checker checks these selected folders, not every ancestor searched by Node; a package can therefore resolve in Node while the checker reports it missing. Use the installation guide's [declaration/resolution checks](../installation.md#if-the-widget-works-but-dependencies-appear-missing) before reinstalling. Declare the widget packages in the intended client for a reproducible setup.
- `--out <new directory>` selects a new output directory. Existing directories are refused.
- `--help` prints usage.

The [checker](../../tools/check-exb-build.cjs) changes neither the host widget link nor its dependency or distribution folders. It disables the loader worker pool to bound concurrency, emits unminified SystemJS bundles and omits host packaging plugins. It uses the client's **transpile-only** TypeScript loader; use the milestone's strict routing-module check separately.

## Stage 47 verification

Checked against source baseline `609b81c` plus this verification tool:

| Item | Result |
| --- | --- |
| Available client | Experience Builder 1.20.0 |
| Dependencies | Mapillary JS 4.1.2; pbf 5.1.2; @mapbox/vector-tile 3.0.0 |
| Runtime/settings bundle | Zero errors and zero warnings |
| Focused regression suite | 855 tests passed across the 47 milestone files |
| Strict extracted-module TypeScript | Passed |

Dependencies were installed in a separate temporary folder; the host installation was left unchanged. Stage 47 adds verification tooling/documentation and does not alter runtime source.

This is **not** a full Experience Builder build, browser test, live API test or performance measurement. The target 1.21 client has not been checked in this environment. Run its normal build/start workflow and the scenarios in [routing validation](routing-validation.md), including routing cancellation/recovery, minimap lifecycle, ordinary image playback, detection controls and mobile/RTL presentation.
