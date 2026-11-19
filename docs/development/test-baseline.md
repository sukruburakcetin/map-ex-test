# Portable test baseline — stage 65, 19 November 2026

This local checkpoint contains `609b81c` plus stages 47–65. Every portable suite
remains included. See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,265 passed, 0 failed**, all 186 files; zero skipped. Exit code 0. |
| Focused policy/display/label checks | **10 passed**, all existing assertions; no test changes or new cases. |
| Component scope | Six `mly-text-action` attributes added; stripping only those additions exactly reproduces prior source. |
| Negative control | Restoring the pre-change component fails the unchanged text-action policy audit. |
| Source/frozen scope | One component changed under `src/`; other 448 source/frozen files unchanged from stage 64. No dependencies changed. |
| Isolated bundle | Cloud ExB **1.20.0** passed; user-supplied **1.21.0** result also has zero errors/warnings. Transpile-only. |

The detection display menu's percentage, mode, overlap, label, reset and close
button sites now use the existing shared text-action layout. No new CSS policy,
observer, listener, request or dependency was introduced. Callback bodies, state,
ARIA attributes, popup lifecycle and existing inline styles are byte-identical.
Icon controls retain their own sizing. The audit is unchanged; no exemptions or
expectations were weakened to obtain this clean run.

## Acceptance limits and next checkpoint

This is a clean **default portable** baseline, not a publishing or live-host
acceptance claim. Optional Mapbox style-spec/browser suites are not represented
by these counts. Whole-project semantic types, normal ExB **1.21** build/start,
real SDK/browser/GPU/terrain, narrow translated/coarse-pointer/fullscreen menu
layout and deployed Enterprise/workspace permissions remain separate checks.

The user supplied a passing isolated 1.21.0 result and a general good browser
smoke-check report. See [checkpoint evidence](checkpoint-2026-11-19.md) for limits;
follow the existing routing/viewer/integration guides. Preserve all
stage files in the authorized local Git checkpoint; no push or deployment is included.

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.














---

# Historical stage-64 baseline — 19 November 2026

Current source is `609b81c` plus uncommitted stages 47–64. Every portable suite
remains included; the remaining failure still makes the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,264 passed, 1 failed**, all 186 files, zero skipped. |
| Focused SVG/native-marker checks | **26 passed**; no new cases. |
| Assertion migration | Two obsolete camera-facing assertions replaced by three projected-ground checks; other 86 calls retained exactly. |
| Negative controls | Flattening the 3D fan fails seven cases; separating the marker transform fails three. Temporary copies only. |
| Production/frozen scope | All 449 source/frozen files unchanged relative to stage 63. No dependency changes. |
| Failure comparison | Phone transform failure resolved; text-button sizing audit remains. No newly failing names. |

The legacy case expected a camera-facing `rotate(...)` fan and an untransformed
marker at zoom 21+. Current SVG fallback keeps both on the same ground plane;
the phone predicate controls native sampling rather than changing fallback mode.
The case now checks the independently specified linear projection's normalized
matrix `[1,0,0,0.1,0,0]` and identical marker/fan transforms at each close zoom.
Nominal geometry, visibility, one overlay and return-to-lower-zoom assertions remain.

This explicitly migrates the retired camera-facing expectation. It does not
change phone rendering or promise an unforeshortened 14-screen-pixel 3D circle.
The existing native-marker suite remains included. No cases or frozen JSON were
removed or added. No new bundle: production source is identical to stage 63,
whose isolated 1.20 bundle passed. Real mobile SDK/terrain/browser and ExB 1.21
acceptance remain separate.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.













---

# Historical stage-63 baseline — 19 November 2026

Current source is `609b81c` plus uncommitted stages 47–63. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,263 passed, 2 failed**, all 186 files, zero skipped. |
| Focused locale/catalog checks | **59 passed**; no new cases. |
| Effective text equivalence | All **1,210 runtime and 171 settings** merged messages identical before/after. |
| Catalog cleanup | Remove 44 runtime and eight settings entries identical to US base; 41/19 genuine overrides remain. |
| Assertions | Replace two arbitrary size ceilings with three semantic inheritance checks; all other 47 assertion calls retained. |
| Negative controls | Reintroducing a redundant override or corrupting a placeholder each fails the regional contract. Temporary copies only. |
| Source scope | Only two UK catalog files changed under `src/`; other 447 source/frozen files unchanged. No dependency changes. |
| Isolated bundle | ExB **1.20.0** runtime/settings: zero errors, zero warnings. Not target 1.21 acceptance. |

The old runtime override ceiling failed at 85 entries. Replacing that ceiling
exposed 44 runtime overrides exactly equal to base text; eight settings overrides
were also redundant. Removing them preserves effective messages while restoring
the documented differences-only model. All keys, values, placeholders, metre
length units, meter devices, locale selection and regional formatting stay checked.

The partial-catalog contract now requires inherited messages, unchanged merged-key
coverage and exact inherited values; it does not encode arbitrary limits of 80/40.
Existing checks still reject unknown, unchanged or placeholder-incompatible
overrides. No frozen JSON was rewritten and no cases were removed or added.

The former regional failure is resolved and the two other failing names remain
unchanged. No live SDK/browser/RTL, semantic whole-project typecheck, multilingual
host or ExB 1.21 acceptance is claimed. The bundle checker is transpile-only.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.












---

# Historical stage-62 baseline — 19 November 2026

Current source is `609b81c` plus uncommitted stages 47–62. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,265 tests: 2,262 passed, 3 failed**, across all 186 files; zero skipped. |
| Focused preview/note/crop checks | **20 passed** across three suites. |
| Assertions | All 16 original linked-preview assertion calls retained; one current-format case adds 13 assertions. |
| Comparison with recorded stage 61 | Detection-preview failure resolved; other three failing names unchanged. No newly failing names. |
| Negative controls | Dropping saved attachment identity fails the current-format case; accepting zero-width crops fails the original validation case. Temporary copies only. |
| Production/frozen scope | All 449 files under `src/` and `tests/fixtures/` unchanged from stage 61. No production dependency changes. |

The old case expected `detectionNoteDescription` to emit a legacy HTTPS link.
Current descriptions serialize a `urn:mapillary-detection` reference; actual crop
capture remains separately gated by `includePreview` in the runtime. The legacy
case now explicitly calls its actual link producer, preserving round-trip and
credential/byte assertions. A separate case reads current descriptions with
`attachmentMetadata`, checking provenance, optional attachment identity, bounds,
legacy compatibility and absence of credentials/image bytes.

This is an explicit representation-contract migration, not a change to capture,
storage, publication or preview activation. No assertion calls or frozen JSON were
removed. One new case increases the total by one. The temporary test-dependency
directory was missing after resume and was recreated with the recorded package
versions; host packages were not modified. Counts are compared with the recorded
stage-61 baseline; the old ephemeral full report was unavailable after resume.

No new bundle, browser capture/IndexedDB, actual SDK/Enterprise upload,
ExB 1.21, multilingual or live service acceptance is claimed. Production source
is unchanged and the available host remains 1.20.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.











---

# Historical stage-61 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–61. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,264 tests: 2,260 passed, 4 failed**, across all 186 suite files. |
| Focused community client | **30 passed**, all existing client cases. |
| Existing assertions | All 96 assertion calls retained; one import-boundary assertion added. No new cases. |
| Comparison with stage 60 | Community client suite-load failure resolved; other four failing names unchanged. No newly failing names. |
| Negative controls | Cookie forwarding and exact-revision truncation each fail one existing case. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 60. No dependency changes. |

The old evaluator supplied no `require`; the current attachment-helper import
therefore prevented every client case from registering. The fixture now resolves
actual pure relative imports with cached module records, rejecting unexpected
non-relative dependencies. Each case still injects its transport and clock.
Loading or constructing the client makes no service connection.

Original endpoint/public-key validation, cookie/redirect/bearer boundaries,
session expiry/disposal, invitation handling, edit whitelists, exact revision
matching and duplicate-draft checks now execute unchanged. No helper is replaced
with an empty mock and no frozen fixture was rewritten. One suite-level failure
becomes 30 passing existing cases, raising the total by 29 without adding cases.

No production defect was found or changed. Full-run PostgreSQL/RLS suites remain
included; these client tests do not establish deployed operator permissions,
service roles, browser attachment persistence or real transport behavior. No new
bundle, ExB 1.21, multilingual or live service acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.










---

# Historical stage-60 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–60. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,235 tests: 2,230 passed, 5 failed**, across all 186 suite files. |
| Focused time-travel/queue checks | **45 passed**: 24 availability, five preview and 16 background-queue cases. |
| Existing assertions | All 24 availability cases/61 assertion calls retained; one import-boundary assertion added. No new cases. |
| Comparison with stage 59 | Time-travel suite-load failure resolved; other five failing names unchanged. No newly failing names. |
| Negative controls | Removing stale-apply guards fails nine availability cases; removing the cached-result assignment fails one. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 59. No dependency changes. |

The old loader evaluated `geoUtils` without `require`; its current detection-label
and presentation imports therefore prevented all availability cases from loading.
The suite now follows actual pure-module relative imports with cached module
records and rejects unexpected non-relative dependencies. The background queue
uses the same loader. Test fetch/clock controls remain case-owned.

Existing rules, duplicate-call coalescing, image/token cancellation, retryable
failures, between-stage priority and physical slot retention through JSON
settlement now execute unchanged. No empty helper mocks or frozen fixture updates
were introduced. One suite-level load failure is replaced by 24 passing tests,
so the overall total rises by 23 without adding cases.

No production defect was found or changed. No new bundle, real Mapillary
availability/transport timing, SDK/browser/GPU, ExB 1.21, multilingual or Enterprise
acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.









---

# Historical stage-59 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–59. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,212 tests: 2,206 passed, 6 failed**, across all 186 suite files. |
| Focused API/area-profile checks | **13 passed**: four API cases and nine area-profile cases. |
| Existing assertions | All three original API cases/19 assertion calls retained; one teardown regression adds ten assertions. |
| Comparison with stage 58 | Previous API builder failure resolved; other six failing names unchanged. No newly failing names. |
| Negative controls | Removing unmount cancellation or preview cleanup fails the new teardown case. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 58. No dependency changes. |

The builder fixture invoked actual unmount without extracting its current
`clearPlacesArea` dependency. It now includes that method and the actual preview,
view and revision fields. Cleanup is exercised rather than replaced with a no-op.
Existing URL normalization, credential omission, capability validation, explicit
testing and changed-URL stale-result checks remain exact.

A held response that ignores cancellation verifies controller detachment before
abort, one preview destruction, cleared ownership and no late state updates.
Repeated unmount is safe. The broader area-profile suite retains its map-preview
and revision tests. No original assertion or frozen JSON was removed or rewritten.

No production defect was found or changed. One new case increases the total;
the repaired failure was a harness failure. No new bundle, real HTTP/CORS,
SDK builder rendering, ExB 1.21, multilingual or Portal-permission acceptance is
claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.








---

# Historical stage-58 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–58. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,211 tests: 2,204 passed, 7 failed**, across all 186 suite files. |
| Focused Places checks | **85 passed** across Overture Places, configured runtime and Portal-source suites. |
| Existing assertions | All 62 original Overture cases/387 assertion calls retained; two regressions add 17 assertions. |
| Comparison with stage 57 | Five previous Overture failure reports resolved; other seven failing names unchanged. No newly failing names. |
| Negative controls | A fixed source scope fails the source-change case; removing cache writes fails original reuse and new cache/ownership cases. The source-audit case also detects both deliberate source edits. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 57. No dependency changes. |

Five runtime fixtures omitted `placesSourceKey`, still supplying only the former
external URL helper. They now use the actual source-identity function. Both
imagery fixtures supply runtime configuration and reuse one local extracted-method
constructor. No production helper is mocked or rewritten for this repair.

New cases exercise external-to-Portal and Portal query-endpoint cache isolation,
plus overlapping imagery searches whose transport ignores cancellation. An older
completion cannot populate cache, clear the newer controller or resynchronize its
owner; the current completion still publishes and caches its own imagery.

Original category/confidence, cache budgets, manual search, click priority,
orientation and stale-response assertions remain exact. No frozen JSON was
rewritten. The total increases by two cases; five repaired failures were harness
failures, not five product fixes. No new bundle, live SDK/browser/Portal
permissions, real service scale, ExB 1.21 or multilingual acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.







---

# Historical stage-57 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–57. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,209 tests: 2,197 passed, 12 failed**, across all 186 suite files. |
| Focused Nearby checks | **30 passed** across runtime foreground, actual discovery owner and coverage-anchor suites. |
| Runtime assertions | Five original cases/15 assertion calls retained; two regressions plus a binding-count check add 17 assertions. |
| Comparison with stage 56 | Two previous Nearby runtime failure reports resolved; other 12 failing names unchanged. No newly failing names. |
| Negative controls | Removing Nearby eligibility or forcing every request immediate fails three cases each. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 56. No dependency changes. |

The foreground harness extracted a lifecycle prefix ending at a different
feature's guard. That prefix now includes route-generation reconciliation, so
it executed an unbound route owner. The fixture selects Nearby's exact four
statements by their declaration/assignment/visibility roles, retaining source
order and checking the count; unrelated route and analysis logic stays outside
this feature-specific harness.

Additional cases check object-tab/hidden-widget cancellation, pointer reset,
return-to-panel priority, playback suppression and paused-image scheduling with
one owner. Existing discovery tests execute the actual owner with controlled
transport/timers, retaining stale-response and physical background-slot checks.
The runtime's discovery adapter records schedules rather than issuing requests.

No production defect was found or changed. No original assertion or frozen JSON
was removed or rewritten. The total increases by two cases; two repaired
failures were harness failures. No new bundle, live SDK/browser/network timing,
ExB 1.21, multilingual or authenticated Enterprise acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.






---

# Historical stage-56 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–56. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,207 tests: 2,193 passed, 14 failed**, across all 186 suite files. |
| Focused alignment/pulse/mesh checks | **39 passed**: 24 native-alignment, six steady-pulse and nine closed-mesh cases. |
| Comparison with stage 55 | Five previous native-alignment failures resolved; other 14 failing names unchanged. No newly failing names. |
| Assertion migration | 43 assertion calls outside three migrated legacy cases retained exactly; no test suite removed. Two terrain edge cases added. |
| Negative controls | Speculative flat terrain fails three cases, lifted mesh apex fails one, ignoring the retained anchor fails two warm-playback cases. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 55. No dependency changes. |

Two playback failures came from an absent screen-direction owner in the fixture.
It now records that active runtime branch, preserving warm-byte/no-network,
native-center, cache, cancellation, revision and paint-gate checks.

Three legacy cases needed explicit migration rather than production changes:

| Previous expectation | Current tested contract |
| --- | --- |
| DOM pulse projects terrain updates every animation frame | `renderedGroundPoint` reads current rendered height when explicitly invoked, preserving the native anchor. |
| DOM pulse retries missing terrain on a timer | The projection helper defers unknown terrain and accepts later readiness; the steady SDK-draped pulse schedules no frames, as independently checked by the existing pulse suite. |
| Cone apex lives in polygon rings and a third separate face | Closed mesh local origin/vertices and the single perimeter preserve the same ground apex and lifted wedge. Existing mesh tests retain topology/membership coverage. |

The obsolete DOM retry scheduling assertion is intentionally retired with that
implementation. This does not restore DOM sampling or change terrain rendering.
Added cases cover explicit empty-ground fallback, unspecified ground, nonfinite,
no-data and throwing samples. Factory-call assertions run outside contained
callbacks so exception handling cannot swallow a failing test expectation.

No production behavior defect was found or changed. No frozen fixture was
rewritten. The total increases by two cases. No new bundle or real SDK terrain,
projection/browser/GPU, multilingual, ExB 1.21 or Enterprise acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.





---

# Historical stage-55 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–55. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,205 tests: 2,186 passed, 19 failed**, across all 186 suite files. |
| Focused footer/shared-fixture checks | **10 passed**: six footer cases and four English fixture checks. |
| Existing assertions | All four original footer cases/eight assertions retained; two regressions/four assertions added. |
| Comparison with stage 54 | All four targeted footer failure reports resolved; other 19 failing names unchanged. No newly failing names. |
| Negative controls | Changing relative scroll distance fails three cases; forcing smooth motion fails two cases. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 54. No dependency changes. |

The footer fixture previously returned styles for every non-host import, omitting
`useWidgetLocale`. An explicit adapter now uses the actual shared English catalog
and rejects unknown imports. Cases restore the original global `window`
descriptor. Scroll spies check a replacement viewport/current height, live motion
preferences, absent matchMedia and an unmounted target alongside original button
labels, available actions and minimum/relative distance.

No production defect was found or changed. No original assertion or frozen JSON
was removed or rewritten. The total increases by two new cases; four repaired
failures were harness failures, not four product fixes. Negative controls reject
incorrect distance and motion handling rather than merely checking callbacks run.

These are controlled component-contract checks, not React-provider lifecycle,
real keyboard/focus, browser layout, screen-reader or live ExB 1.21 acceptance.
No new bundle, SDK/GPU, multilingual or authenticated Enterprise acceptance is
claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.




---

# Historical stage-54 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–54. Every portable suite
remains included; unresolved failures still make the runner exit nonzero.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,203 tests: 2,180 passed, 23 failed**, across all 186 suite files. |
| Focused detection checks | **20 passed** across AI-label toggle, detection exploration, map labels and display suites. |
| AI-label suite | All three retained cases and four new regressions pass; 15 original assertion calls retained and 22 added. |
| Comparison with stage 53 | Three targeted failure reports resolved; the other 23 failing names unchanged. No newly failing names. |
| Negative controls | Removing panorama visibility forwarding fails two cases; removing hover ownership checks fails the out-of-order hit case. Temporary copies only. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 53. No dependency changes. |

The AI-label fixture omitted `detectionThumbnailBounds`, now required when hover
setup records tag configurations. It now provides an explicitly inert bounds
adapter, matching the existing detection-exploration test: crop geometry remains
outside this label-only suite. Timer, hit-response and viewer-event controls let
the suite check text toggling, target outlines, focus/all mode, panorama-label
visibility, cleanup after viewer removal and newer-pointer ownership.

No production defect was found or changed. No original assertion or frozen JSON
was removed or rewritten. The total increases by four new cases; the three
repaired failures were harness failures, not three product fixes. Negative
controls confirm the added cases reject missing forwarding and stale hits.

No new bundle or live ExB 1.21/SDK/browser, multilingual, mobile/GPU or licensed
Enterprise acceptance is claimed. Optional Mapbox style-spec checks were not
configured; the listed portable counts cover the default test environment.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.



---

# Historical stage-53 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–53. Every portable suite
remains included; the runner exits nonzero while unresolved failures remain.
See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,199 tests: 2,173 passed, 26 failed**, across all 186 suite files. |
| Coverage-analysis reliability | **21 tests passed**: 17 retained cases and four new classifier/cooldown regressions. |
| Shared English fixture checks | Four tests passed; combined focused result is **25 passed, zero failed**. |
| Comparison with stage 52 | All six targeted failure reports resolved; the other 26 failing names are unchanged. No newly failing names. |
| Negative stale-result control | Removing only the post-classification ownership guard in a temporary source copy makes the three late-result cases fail. |
| Production and frozen fixtures | All 449 files under `src/` and `tests/fixtures/` unchanged relative to stage 52; no dependency changes. |

The test harness now compiles runtime snippets as TSX and reuses actual English
bindings for translated messages and cooldown JSX. The analysis-input guard is
selected by its condition rather than statement position. Existing assertions
remain; four extra cases hold classification pending to check late progress,
obsolete completion, newer-run ownership, view replacement and cooldown feedback.

No production behavior defect was found or changed. Road retries/abort handling
use controlled HTTP responses; classification is stubbed to test orchestration,
not classification accuracy or real server/GPU behavior. No baseline JSON was
rewritten. The temporary guard-removal control demonstrates the new assertions
reject stale publication rather than merely checking that a promise settles.

The total increases by four new cases; six repaired failures were harness
failures, not six product fixes. No new bundle or target ExB 1.21/live SDK,
multilingual, mobile/GPU or licensed Enterprise acceptance is claimed.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.


---

# Historical stage-52 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–52. The complete portable
runner still includes every suite and exits nonzero while unresolved failures
remain. See [reproduction and fixture conventions](portable-tests.md).

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,195 tests: 2,163 passed, 32 failed**, across all 186 suite files. |
| Field-note draft/file/collection suites | **46 tests passed** across three suites (45 existing cases and one new counted-feedback case). |
| Shared English fixture checks | Four tests passed; combined focused result is **50 passed, zero failed**. |
| Comparison with stage 51 | All 27 targeted failure reports resolved; other 32 failing names unchanged. No newly failing names. |
| Negative duplicate-count control | Incrementing only the displayed skipped count in a temporary copy makes three of 16 file-suite tests fail. |
| Assertions and immutable fixtures | Existing assertion calls retained; two additional file-feedback assertions. No files under `tests/fixtures/` rewritten. |
| Production scope | All `src/` files unchanged relative to stage 51, including controllers, transport, styles and localization catalogs. No dependency changes. |

The three suites now receive the same actual English/localization bindings used
by the repaired point-cloud fixtures. Their clocks, FileReaders, storage, marker
callbacks and publication dependencies remain explicitly controlled. Comparisons
still check note payloads, identities, timestamps, state/order, shared-save/editor
guards, errors and feedback duration/markup.

The frozen file fixture predates localization and uses Turkish notices. Only its
four known alerts and counted import notice are adapted to the current explicit
English wording. Note content, payloads and error objects are never translated or
normalized. Exact current zero/singular/plural import and duplicate counts have an
additional assertion. No production behavior defect was found or changed here.

The full total increases by one because the file suite gains a regression case.
This does not mean 27 product defects were fixed. New bundle/browser acceptance is
not claimed: production source is identical to stage 51, whose isolated 1.20
bundle passed. Target ExB 1.21 packaging, semantic types, live SDK/browser/GPU,
multilingual presentation and licensed Pro/Portal acceptance remain separate.

## Remaining failures

Reports below remain unresolved; diagnose each rather than dropping tests or
blanket-rebaselining expectations. Some failures occur during module loading.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Environment unchanged: Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0, PGlite 0.5.16, Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and
pako 2.2.0. Test-only packages remain outside the host and widget.

---

# Historical stage-51 baseline — 18 November 2026

Current source is `609b81c` plus uncommitted stages 47–51. Use the
[complete portable runner](portable-tests.md); failing suites remain included and
the full run still exits nonzero.

| Check | Result and scope |
| --- | --- |
| Complete portable Node run | **2,194 tests: 2,135 passed, 59 failed**, all 186 suite files. |
| Point-cloud suites | **257 tests passed across 17 suites**, including the 15 map-layer tests previously hidden by a parse-time failure. |
| English fixture contract | Four tests passed, including checks that changed text/counts/styles/timing/order still fail comparison. |
| Full-suite comparison to stage 50 | All 82 old point-cloud failure reports are gone; the other 59 failing test names are unchanged. No newly failing names. |
| Original plural-spacing control | Restoring only the old `cluster s` JSX in a temporary copy causes 13 of 15 result tests to fail. |
| Immutable fixtures | No files under `tests/fixtures/` changed. Existing assertion-call counts are preserved, with two additional calls in calibration. |
| Production scope | Only one JSX space removed in `PointCloudResultFeedback.tsx`; no runtime/controller/SDK logic changes. |
| Isolated runtime/settings bundle | Available ExB 1.20, zero errors/warnings; full target 1.21 acceptance remains pending. |

The full total increases by 19: 14 additional map-layer tests now execute instead
of one module-load failure, plus four fixture-contract tests and one exact
calibration-format test. This is not a claim that 82 product bugs were fixed.

`tests/helpers/englishFixture.cjs` supplies the actual English catalog,
PresentationText fallback and shipped OwnedMessage/OwnedNumber bodies to isolated
snippets. It intercepts localization imports only and retains explicit suite-owned
SDK/clock/writer dependencies. Rendered-toast comparisons join adjacent text nodes
and collapse ordinary ASCII whitespace, while retaining markup, props/styles,
values, durations and non-toast events/object identity. Preformatted whitespace is
preserved. The calibration suite explicitly adapts only historical compact units
and XYZ label spacing; the current SI-formatted text has an exact assertion.

The genuine UI defect was a stray JSX space separating `cluster` from its plural
suffix. Removing that space preserves the existing message source and all other
feedback formatting. No translation catalogs, transport or feature behavior were
changed. Browser/GPU performance and live SDK behavior were not measured.

## Remaining failures

These are unresolved reports requiring individual diagnosis, not accepted failures
or confirmed product defects. Some files fail during loading. Do not rebaseline or
remove them merely to make the suite green.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

The environment remains Node 24.19.0, TypeScript 5.9.3, React/DOM/renderer 19.2.3,
jsdom 26.1.0 and PGlite 0.5.16; runtime packages are Mapillary JS 4.1.2, pbf 5.1.2,
vector-tile 3.0.0 and pako 2.2.0. Test-only dependencies remain isolated from the
host and widget. Full semantic TypeScript, production packaging, target 1.21,
mobile/RTL/live Mapillary and licensed Pro/Portal acceptance remain separate.

---

# Phase-1 baseline — historical stage 50

This is the current phase-1 baseline for `609b81c` plus uncommitted stages 47–50.
It supersedes the old aggregate below; it is not a declaration of release readiness.
Use the [portable runner and dependency setup](portable-tests.md) rather than a
hand-selected green subset.

| Check | Current result and scope |
| --- | --- |
| Complete portable Node run | **2,175 tests: 2,034 passed, 141 failed**, across all 185 `tests/*.test.cjs` files; nonzero exit retained. |
| New runner/real-codec checks | Six tests passed: report/preflight handling, real pbf/MVT decoding, actual gzip/zlib cluster fallback and cancellation. |
| Test environment | Node 24.19.0, TypeScript 5.9.3, React/React DOM/test renderer 19.2.3, jsdom 26.1.0, PGlite 0.5.16. Test-only packages were installed outside the host and widget. |
| Runtime package resolution | Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0, pako 2.2.0. |
| Isolated runtime/settings bundle | ExB **1.20.0**, zero errors/warnings; host transpile-only rules, not full packaging/typechecking. |
| Previous analysis run, incomplete dependencies | 2,109 reports: 1,957 passed, 152 failed. Missing renderer/PGlite prevented some tests from running, so totals are not directly interchangeable. |
| Python analysis baseline | 105 tests passed across 12 suites before this phase; no Python source changes in phase 1. |

A controlled run using the **pre-cleanup stage-49 application source**, the same
185 suites and the same complete dependency environment reproduced identical
totals and all 141 failing test names. The new six checks were included on both
sides. This attributes no failure to a root cause, but found no new failing test
names from the cleanup.

The current remaining failure triage hints are **58 execution errors, 80 assertions
and 3 unclassified reports**. These are report categories, not root causes. For
example, a snippet loader can raise a ReferenceError because its injected imports
are incomplete; an assertion can indicate either outdated expectations or an
actual behavior defect. Diagnose individually. Do not delete failed tests, blanket
rebaseline their expectations, or count a missing-dependency failure as an executed
database permission test.

## Remaining failure inventory

Counts are failing test reports. Some files fail during loading before their
individual tests execute. The runner JSON gives names, locations and bounded
diagnostics when available.

| Suite | Failing reports |
| --- | ---: |
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/nearbyForegroundRuntime.test.cjs` | 2 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/pointCloudAcquisition.test.cjs` | 12 |
| `tests/pointCloudCalibration.test.cjs` | 11 |
| `tests/pointCloudExport.test.cjs` | 15 |
| `tests/pointCloudGeometry.test.cjs` | 5 |
| `tests/pointCloudHitRouting.test.cjs` | 1 |
| `tests/pointCloudMapLayer.test.cjs` | 1 |
| `tests/pointCloudResult.test.cjs` | 13 |
| `tests/pointCloudSight.test.cjs` | 6 |
| `tests/pointCloudTools.test.cjs` | 13 |
| `tests/pointCloudViewshed.test.cjs` | 5 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/textButtons.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |

Repair the loader/import issues without weakening behavior assertions, then review
remaining UI/localization/geometry expectations against intended behavior. Preserve
ownership, cancellation, bounded work and database permissions. Target ExB 1.21
production build, semantic typecheck, live browser/GPU, licensed Pro and
authenticated Portal acceptance remain separate release gates.

---

# Historical portable baseline — 13 November 2026

Recorded 13 November 2026 against `43b7a4b` and the organizational cleanup, using Node 24.19.0, Python 3.12.14 and the available Experience Builder dependency directory. These environment versions are a record of this run, not a newly declared supported host matrix.

## Results

| Check | Result |
|---|---|
| All `tests/*.test.cjs`, concurrency 2 | 1,282 tests: 1,138 passed, 144 failed |
| Same Node command in untouched detached `43b7a4b` checkout | Identical totals and failing test names/counts |
| All 12 `tests/*.test.py` suites | 105 tests passed |
| TS/TSX syntax transpilation | 312 implementation files, zero errors |
| Localization catalogs | 1,174 runtime keys, 160 builder keys, 12 translation catalogs, zero catalog errors |
| Translation review CSV | Matches catalogs and language names |
| Markdown local links | Zero broken links |
| Repository hygiene | No tracked generated artifacts remaining |

Transpilation is not semantic type checking. No full Experience Builder production build, browser/GPU acceptance, licensed ArcGIS Pro run or authenticated Portal acceptance was performed in this cleanup.

## Reproduce the Node comparison

Run from the widget root with the host dependencies available. In this cloud environment:

```sh
MAPILLARY_TYPESCRIPT=/workspace/experience-builder-1.20/client/node_modules/typescript NODE_PATH=/workspace/experience-builder-1.20/client/node_modules node --test --test-concurrency=2 tests/*.test.cjs
```

The unmodified baseline was checked out separately at `/tmp/map-ex-test-baseline-43b7a4b` and run with the same environment and command. The failing test names/counts match, not merely the aggregate total. This provides evidence that the organizational cleanup did not introduce these failures; it does not establish that the product is release-ready.

## Existing failing suites

Counts below are failing test reports. A suite that fails during loading may report one failure even though its individual assertions never ran.

| Suite | Failing reports |
|---|---:|
| `tests/aiLabelToggle.test.cjs` | 3 |
| `tests/collaborationWorkspaceMigration.test.cjs` | 1 |
| `tests/communityWorkspaceClient.test.cjs` | 1 |
| `tests/communityWorkspaceDatabase.test.cjs` | 1 |
| `tests/coverageAnalysisReliability.test.cjs` | 6 |
| `tests/detectionImageAttachmentsDatabase.test.cjs` | 1 |
| `tests/detectionLinkedPreview.test.cjs` | 1 |
| `tests/directContributionsDatabase.test.cjs` | 1 |
| `tests/fieldNoteDraft.test.cjs` | 11 |
| `tests/fieldNoteFiles.test.cjs` | 12 |
| `tests/infoBoxFooter.test.cjs` | 4 |
| `tests/localNoteCollection.test.cjs` | 4 |
| `tests/nativeCoverageAlignmentFix.test.cjs` | 5 |
| `tests/overturePlaces.test.cjs` | 5 |
| `tests/placesApi.test.cjs` | 1 |
| `tests/pointCloudAcquisition.test.cjs` | 12 |
| `tests/pointCloudCalibration.test.cjs` | 11 |
| `tests/pointCloudExport.test.cjs` | 15 |
| `tests/pointCloudGeometry.test.cjs` | 5 |
| `tests/pointCloudHitRouting.test.cjs` | 1 |
| `tests/pointCloudMapLayer.test.cjs` | 1 |
| `tests/pointCloudResult.test.cjs` | 13 |
| `tests/pointCloudSight.test.cjs` | 6 |
| `tests/pointCloudTools.test.cjs` | 13 |
| `tests/pointCloudViewshed.test.cjs` | 5 |
| `tests/regionalLocales.test.cjs` | 1 |
| `tests/screenDirectionCone.test.cjs` | 1 |
| `tests/timeTravel.test.cjs` | 1 |
| `tests/workspaceContributionsDatabase.test.cjs` | 1 |
| `tests/workspaceDisplayNamesDatabase.test.cjs` | 1 |

## Failure classes and next work

- Database suites cannot load `@electric-sql/pglite` in the available environment. Establish the supported test dependency setup before judging their behavior.
- Some source-extraction/transpilation fixtures omit new imports or helpers (`require`, `englishPresentation`, `detectionThumbnailBounds`, Portal source helpers) or generate invalid extracted snippets. Repair these as test-harness work without weakening their behavioral assertions.
- Some comparison fixtures assert earlier localized feedback strings or old source patterns; review each against current intended behavior before changing expectations.
- React/locale fixture mismatches and UK catalog/marker sizing assertions also fail. These need individual diagnosis, not blanket rebaselining.

A green focused feature suite must not be described as a green repository-wide baseline. After dependency/fixture repairs, rerun the full set and update this record. Keep browser and deployment acceptance distinct.
