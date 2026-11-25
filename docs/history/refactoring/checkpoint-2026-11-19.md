# Stage 65 working checkpoint — 19 November 2026

This local Git checkpoint preserves stages 47–65 and the installation/validation
guides, based on `609b81c5eacb542b7865d50a60bbca902b124137`. It includes the previously
untracked components, styles, state contract, test helpers/fixtures and tools.
Host package manifests and lockfiles on the user's Windows machine are outside
this widget repository. No push, publication or deployment is part of this checkpoint.

## Evidence

| Check | Result and provenance |
| --- | --- |
| Default portable suites | Last cloud run: 2,265 passed, zero failed/skipped; all 186 files |
| Isolated ExB 1.20.0 bundle | Cloud run: runtime/settings compiled with zero errors/warnings |
| Isolated ExB 1.21.0 bundle | User-supplied completed console output: 9,974 ms; zero errors/warnings |
| Target dependency set | User output: Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0, pako 2.2.0 |
| Target dependency lookup | Successful user check used `--client ../../..` without the ancestor-folder override |
| Browser smoke check | User reported the result was good after the browser checklist; user-reported, not independently observed |

The target build command was:

```sh
node tools/check-exb-build.cjs --client ../../..
```

Its output directory was named `mapillary-exb-check-HmaxDy`. The raw
`build-report.json` remains on the user's machine and has not been imported into
this repository. The recorded successful console output is:

```text
Experience Builder 1.21.0; dependencies: {"mapillary-js":"4.1.2","pbf":"5.1.2","@mapbox/vector-tile":"3.0.0","pako":"2.2.0"}
webpack compiled in 9974 ms
0 errors; 0 warnings.
```

## Scope limits

The isolated checker uses a transpile-only host loader and omits ordinary host
packaging plugins. It does not establish whole-project semantic type checking or
a production-package build. Browser confirmation is a general user report; no
per-device, per-locale, per-feature or automated browser report was collected.
It must not be expanded into certification of mobile/RTL, real terrain/GPU,
optional backend permissions, attachment persistence or every optional tool.

This is a stable working checkpoint, not a declaration that all release
acceptance is complete. Historical milestone/test reports remain for traceability;
their statements that stages were uncommitted or 1.21 had not been tested describe
those earlier moments. This checkpoint supersedes that current-status wording.

## Resume

Read [the milestone](REFACTORING-MILESTONE.md),
[the current portable baseline](test-baseline.md) and
[the target-host worksheet](../../development/exb-1.21-validation.md). Preserve the checkpoint and
compare any user-side changes before further extraction. Choose one cohesive
remaining responsibility in `widget.tsx`, characterize its active behavior and
keep request, cancellation and shared-map ownership explicit. Collect detailed
host/browser evidence where the next change depends on it.
