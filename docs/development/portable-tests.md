# Portable test environment

Run portable checks against an explicit Experience Builder client and a reviewed
set of test dependencies. The widget has no standalone application package; do
not replace the host's React, SDK, package-manager configuration or lockfile just
to run tests. Browser suites, Python tools, semantic typechecks and full host
builds are separate checks.

## Check an existing test environment

From the widget root:

```sh
node tools/check-portable-tests.cjs --client "C:\path\to\experience-builder\client" --preflight
node tools/check-portable-tests.cjs --client "C:\path\to\experience-builder\client" --report "C:\temp\portable-results.json"
```

The report must be a new file in an existing directory. Every `tests/*.test.cjs`
file runs at concurrency 2; no failed suite is excluded or automatically accepted
as a baseline failure. A failing run exits nonzero. The report gives totals and
failure names/triage hints, not proof that a failure is a product defect.

Preflight checks TypeScript, React, React DOM, react-test-renderer, jsdom, PGlite
and the four directly imported widget packages. React, React DOM and the renderer
must have matching versions and share the same React instance. Missing modules
stop before tests run; the command never installs packages.

## Use isolated test-only dependencies

If the host lacks database or renderer tooling, prepare a separate directory
outside the widget and host. The checked environment on 18 November 2026 used:

```sh
npm install --prefix C:\temp\mapillary-test-deps --save-exact typescript@5.9.3 jsdom@26.1.0 react@19.2.3 react-dom@19.2.3 react-test-renderer@19.2.3 @electric-sql/pglite@0.5.16 mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0 pako@2.2.0
```

This is a test environment, not an instruction to install another React into
Experience Builder. Match the React/DOM/renderer trio to the target host when
validating that host; the versions above record this check. Keep that temporary
package manifest/lockfile if reproducing its results. The executed cloud run used
host-provided TypeScript/jsdom and the isolated directory for the other packages.

```sh
node tools/check-portable-tests.cjs --client "C:\path\to\experience-builder\client" --dependencies "C:\temp\mapillary-test-deps\node_modules" --preflight
node tools/check-portable-tests.cjs --client "C:\path\to\experience-builder\client" --dependencies "C:\temp\mapillary-test-deps\node_modules" --report "C:\temp\portable-results.json"
```

The runner sets portable module paths and the existing `MAPILLARY_TYPESCRIPT`,
`MAPILLARY_REACT`, `MAPILLARY_REACT_TEST_RENDERER` and `MAPILLARY_PGLITE` overrides
for child tests. Existing module overrides should not be used to mix incompatible
React instances. Runtime packages must still be installed separately in the host
client for normal development/builds; see [installation](../installation.md).

## Triage, do not rebaseline blindly

1. Resolve missing dependencies before attributing failures to application code.
2. Inspect execution errors in snippet loaders/import bindings before changing
   production behavior to satisfy a broken fixture.
3. Compare assertions with current intended behavior, preserving cancellation,
   resource ownership, identity and compatibility requirements.
4. Move useful coverage from retired implementations to active owners before
   retiring either their code or tests.

The isolated bundle checker validates exports/module resolution, using the
available host's transpile-only loader. It cannot replace semantic type checking
or live ExB 1.21, Mapillary, 2D/3D, mobile/RTL and Portal acceptance.
