# Localization quality pass v6.115

Requires v6.114. Keeps one English catalog. This is an automated completeness/integrity audit and a focused switching and terminology pass, not a native editorial certification of ten languages.

## Findings and fixes

A cold language change previously retained the previous runtime catalog until the requested download completed, while the selector already showed the new language. The settings provider could similarly retain headings from the previous language while its catalog downloaded. Both now immediately use the newly requested startup subset, falling back to English for entries outside that subset until the full catalog arrives. No previous-language catalog is deliberately kept under a new selection. Successfully loaded settings catalogs are cached, as runtime catalogs already were, so returning to a loaded language can immediately display its full text. The existing active-request guard prevents late results from changing a newer selection. Download failures retain the existing explicit English fallback and retry UI; failure state is scoped to the request that failed.

Two Chinese messages with the identical English meaning, “Zoom closer for travel-method coverage”, had inconsistent translations across the toolbar/feedback surfaces. Each Chinese catalog now consistently uses its existing complete217 wording in appZoomCloserForTravelMethodCoverage. Counts and placeholders are unchanged. Other wording was left intact where automated evidence does not establish an error.

## Catalog audit

The new read-only tools/check-localization-catalogs.cjs checks runtime and builder key parity, nonempty strings, placeholder names and multiplicity, source syntax, duplicate object properties, replacement characters, invalid standalone surrogates, unexpected control characters, startup/full catalog parity and nonempty language labels. It reports unchanged English and contextual variants for human review rather than treating them as errors or mechanically rewriting them.

| Language | Runtime | Builder | Identical to English: runtime / builder | Differing translations of identical English runtime text |
|---|---:|---:|---:|---:|
| Turkish | 1,070 | 150 | 24 / 5 | 0 |
| Spanish | 1,070 | 150 | 39 / 7 | 1 |
| French | 1,070 | 150 | 40 / 5 | 1 |
| German | 1,070 | 150 | 43 / 5 | 0 |
| Portuguese (Brazil) | 1,070 | 150 | 38 / 5 | 1 |
| Italian | 1,070 | 150 | 36 / 4 | 1 |
| Japanese | 1,070 | 150 | 23 / 3 | 0 |
| Korean | 1,070 | 150 | 25 / 3 | 0 |
| Chinese (Simplified) | 1,070 | 150 | 18 / 1 | 0 |
| Chinese (Traditional, Taiwan) | 1,070 | 150 | 18 / 1 | 0 |

All 12,200 translated entries pass the structural checks. Identical strings include brands (Mapillary Explorer, Enterprise, Esri World Route), units, formats, axis letters and vocabulary shared with English (for example French Image, Source and Description). They are review information, not counts of untranslated defects. The remaining contextual variants are All → Todos/Todas, Tous/Toutes, Todos/Todas and Tutti/Tutte in Spanish, French, Brazilian Portuguese and Italian respectively. Direct keyed UI translations preserve their grammatical distinctions; source-only imperative matching cannot infer every grammatical context.

The source AST inventory scanned 190 TypeScript sources and 24 CSS sources. It found zero new UI candidates and zero locale-formatter candidates under its current rules. All 29 label-review and 50 taxonomy templates match existing catalog entries. One uncatalogued Turkish exception remains in geoJson.ts: it is logged internally and caught by FieldNoteFiles, whose visible invalid-import feedback is already translated. Changing internal error classification or logging is unnecessary for this UI pass. Other catalogued error constructors intentionally remain canonical internally. An AST inventory and matching catalog counts are not proof that every rendered scenario is translated.

## Validation

53 localization tests passed, including the existing locale/priority/Unicode checks and new cross-catalog QA, injected defects (missing/extra keys, broken placeholders and corrupt Unicode) and valid contextual-grammar/brand examples. Experience Builder development build passed with local SDK 5.0.4. The user's separately deployed SDK version was not changed.

The committed tests/localizationQuality.browser.cjs renders real widget/settings components with mocked Experience Builder UI wrappers. The cold-switch regression fails against isolated v6.114 providers (the German language label never appears while its download is held), and passes with the fix. Chromium checks passed for held-download first paint; immediate requested-language labels and fallback controls during a cold switch; late old response after selecting another language; delayed settings download; builder priority over saved Spanish; eleven-language comparison switching without extra load calls or slider resets; edited-note/category preservation; saved Traditional preference after navigation; Chinese script/region selection; English fallback after download failure and recovery on reload; all eleven builder languages with retained OSRM engine, custom URL and category values; compact place-button widths and splash heading at 320 px. No runtime font downloads were observed. Browser fonts and mocked wrappers do not certify every deployed layout. In-place retry after a failed ES module import is not certified against production webpack.

Run catalog QA from the widget root (TypeScript must resolve, or set MAPILLARY_TYPESCRIPT to its module path):

```sh
node tools/check-localization-catalogs.cjs --out catalog-review.json
node tests/localizationCatalog.test.cjs
```

For the browser fixture, install/use esbuild and playwright-core as development tools and point EXPERIENCE_BUILDER_CLIENT at the local Experience Builder client directory. MAPILLARY_BROWSER_TOOLS optionally identifies the directory containing these modules; CHROMIUM_PATH selects a Chromium executable (default /usr/bin/chromium). MAPILLARY_SCREENSHOTS optionally preserves screenshots in a chosen directory; otherwise fixture artifacts are temporary.

```sh
EXPERIENCE_BUILDER_CLIENT=/path/to/experience-builder/client node tests/localizationQuality.browser.cjs
```

## Editorial review still required

For each language, a native reviewer should examine screenshots and actual flows for splash, builder headings/help, filters, hover previews, Time travel comparison, place details, field-note create/import/share/errors, routing and advanced point-cloud/elevation tools. Confirm capture versus image terminology, bearing versus map heading, singular/plural counters, compact label fit, date/number conventions and grammatical form in context. Particular care is needed for technical errors assembled with remote details, which may retain their source language. External ArcGIS/Mapillary controls, server data, proper names and arbitrary user content are outside this widget's translation catalogs.

No new runtime packages, fonts or eagerly loaded full catalogs are added. The checker, fixtures and documentation are developer files. No map selection, hover, cone, marker, coverage-fetching or imagery-request algorithm is changed.

Install from the widget root: node apply-localization-quality-v6-115.cjs. Undo: node apply-localization-quality-v6-115.cjs --uninstall. Guarded dry-run, installation, repeat installation, exact uninstall and conflict-before-writes are validated.
