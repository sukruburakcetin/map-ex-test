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
5. Keep every unresolved assertion listed in the [test baseline](test-baseline.md).

The isolated bundle checker validates exports/module resolution, using the
available host's transpile-only loader. It cannot replace semantic type checking
or live ExB 1.21, Mapillary, 2D/3D, mobile/RTL and Portal acceptance.

## Localized snippet fixtures

`tests/helpers/englishFixture.cjs` supplies actual English messages/formatters and
the shipped text-only wrappers to isolated runtime snippets. Suites still own
their clocks, browser I/O, SDK mocks and transport. Its toast comparator retains
wording/counts, markup/styles, durations and non-toast object identity/order; it
only groups text nodes and collapses ordinary rendering whitespace.

The field-note file fixture predates localization and contains Turkish notices.
Its adapter translates only four known historical alerts and the counted import
notice into the explicit current English contract. It never translates stored
note content, payloads, browser operations or errors. Exact zero/singular/plural
and duplicate-count checks complement the historical comparisons. A temporary
control that increments the displayed duplicate count must fail these tests.

No baseline JSON fixture is rewritten to match current output. Changes to real
payloads, clocks, save guards, exception propagation or callback order remain
failures requiring diagnosis. These fixtures do not substitute for multilingual
React rendering, live browser I/O or authenticated Enterprise permission checks.

## Coverage-analysis runtime fixture

The coverage reliability suite compiles extracted runtime methods as TSX and
uses the shared actual English bindings, including cooldown feedback wrappers.
Its lifecycle guard is selected by its analysis-input condition, rather than
assuming it is the first statement in `componentDidUpdate`.

Controlled classifier promises exercise cancellation during classification, late
progress, old completion while a newer analysis is pending, map-view replacement
and rate-limit cooldown. Removing only the post-classification ownership check
in a temporary source copy must fail the three late-result tests. These checks
cover orchestration and state/resource ownership; the classifier is stubbed and
they do not validate classification accuracy, real road servers or GPU rendering.

## AI viewer label fixture

`aiLabelToggle.test.cjs` provides the geometry-helper binding required by the
current hover setup. Like the existing detection-exploration fixture, its bounds
adapter is explicitly inert: these tests check label behavior, not crop geometry.
The suite controls outline constructors, timers, hit responses and viewer events.

Existing text-toggle, target-flash and pre-load checks remain. Additional cases
verify the panorama-label visibility bridge, focus/all mode, viewer-removal
cleanup and out-of-order pointer hits. Temporary controls removing visibility
forwarding or hover ownership checks must fail the relevant cases. No real SDK
rendering, browser pointer interaction or WebGL performance claim follows from
these controlled tests.

## Info-panel footer fixture

`infoBoxFooter.test.cjs` loads the actual footer and styles with an explicit
`useWidgetLocale` adapter backed by the shared English catalog. Other imports
remain explicitly bound or rejected; the locale provider/React hook lifecycle is
not emulated. Each case restores the original global `window` descriptor.

Scroll spies check the live ref/height and reduced-motion preference at click
time, including viewport replacement, unmounted targets and absent matchMedia.
Temporary changes to the relative distance or reduced-motion handling must fail
the relevant cases. These are component-contract checks; real focus, keyboard
activation, browser layout and assistive technology still need host validation.

## Native alignment and terrain contracts

The native-alignment suite now supplies the screen-direction owner used by
`drawCone`. Existing warm-byte/no-network, cache, late-index, image/view revision
and paint-gate assertions remain. The screen owner is recorded, not rendered.

Three legacy cases are explicitly migrated: the retired 3D DOM-pulse projection
and retry timer assertions move to `renderedGroundPoint` (current rendered height,
unknown-terrain deferral and subsequent readiness); polygon-face apex assertions
move to the current closed mesh local origin/vertices and top perimeter. Bounded
DOM-pulse retries are not current behavior: `selectionPulseGround.test.cjs`
separately verifies SDK ground draping and zero 3D animation frames. Existing
`closedMeshCone.test.cjs` covers topology, retained graphics and 2D preservation.

Explicit empty-ground and invalid/throwing-sample cases complement this migration.
Factory calls are recorded and asserted after projection: throwing assertions
inside the helper's contained callback would hide a failing expectation.
Temporary speculative-ground, lifted-apex and ignored-native-anchor mutations
must fail. No production source or frozen fixture is changed; these checks do not
prove real terrain, SDK projection or browser performance.

## Nearby foreground lifecycle fixture

`nearbyForegroundRuntime.test.cjs` selects only Nearby's visibility declarations,
demand assignment and visibility branch from `componentDidUpdate`. It no longer
extracts an arbitrary prefix ending at a different feature's guard; that prefix
had begun executing route-generation checks without their owner. The exact four
Nearby statements remain in source order, with a unique-count assertion.

The recording discovery adapter checks eligibility and schedule priority without
transport. Existing `nearbyDiscovery.test.cjs` separately runs the actual owner
with controlled fetch/timers for cancellation, stale results and background-slot
ownership; `nearbyCoverageAnchor.test.cjs` checks display anchoring. Additional
runtime cases cover object-tab/hidden-widget transitions, pointer reset, playback
suppression and idle-priority image changes. Removing eligibility or forcing all
requests immediate in temporary source copies must fail. No real browser/SDK or
network timing is inferred from this fixture.

## Overture Places runtime fixture

The Overture suite binds the actual `placesSourceKey` helper used by current
runtime synchronization, explicit activation and imagery-cache scoping. It no
longer injects only the former external API URL helper. The two imagery fixtures
share one local extracted-method constructor and supply the runtime configuration
read by source identity. No production adapter or dependency is replaced.

Original category/confidence, bounded caches, manual search, click priority and
stale-result assertions remain. New cases check external/Portal/query-endpoint
cache invalidation and overlapping imagery searches: an older completion may
neither cache results nor clear the newer controller or resynchronize its owner.
Temporary fixed-source and removed-cache-write controls must fail. Configured
service and Portal suites complement these checks with controlled SDK/HTTP
adapters; live Portal permissions, rendering and service scale remain separate.

## Places API builder teardown fixture

The API builder fixture includes the actual `clearPlacesArea` method and its
preview/view/revision fields because current `componentWillUnmount` invokes that
cleanup. It does not replace teardown with a no-op. Existing URL validation,
capability checks, credential omission, explicit testing and late-URL guards
remain. The area-profile suite supplies broader preview/map cleanup coverage.

An abort-ignoring held response checks that unmount first detaches its pending
controller, then aborts it, destroys the preview once and permits no later state
write. The case releases its response even after an assertion failure. Removing
unmount abort or preview cleanup in temporary copies must fail. SDK builder
rendering, real HTTP/CORS and Portal permissions remain host acceptance checks.

## Time-travel dependency fixture

The availability suite loads the actual pure-module dependency graph from
`timeTravel.ts` and `BackgroundRequestQueue.ts`, caching module records and
rejecting non-relative dependencies. Its previous loader evaluated `geoUtils`
without `require`, so new detection-label/presentation imports prevented all
availability cases from registering. No dependency is replaced by an empty mock.

The 24 original availability cases are unchanged, including cancellation between
request stages, image/token invalidation, successful-result reuse, retryable
failures and physical background-slot retention through JSON decoding. Their
fetch/timer controls remain case-owned. Temporary stale-apply-guard and
cache-result-write removals must fail. Preview and background-queue suites run
alongside these checks; live Mapillary/SDK timing remains separate.

## Community workspace client dependency fixture

The client suite loads its actual pure relative dependency graph, including
`detectionImageAttachment`, with cached module records and an explicit rejection
of non-relative dependencies. The old import-free evaluator prevented all 30
client cases from registering after attachment support was added. The transport
and clock remain injected into each client; no service connection is made.

Original public-key/endpoint validation, bearer/cookie/redirect boundaries,
session expiry/disposal, invitation parsing, editable-field whitelists, exact
revision matching and duplicate-draft checks remain unchanged. Deliberate cookie
credential forwarding or revision truncation in temporary copies must fail.
These client checks complement the shipped PostgreSQL/RLS suites in the full run;
they do not establish deployed operator roles, real service permissions or browser
attachment persistence.
