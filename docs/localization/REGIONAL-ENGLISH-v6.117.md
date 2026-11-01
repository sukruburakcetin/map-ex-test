# Regional English and formatting v6.117

Requires v6.116. The language lists now show English (US) and English (UK) in both runtime and builder settings, with names translated into each UI language. App language still follows Experience Builder; no existing widget is forced to English. Unsupported or malformed host languages fall back to US English. An explicit builder language continues to override any saved viewer preference. Viewer choice remains available only with App language and permission enabled.

## Catalogs and compatibility

The base English catalog uses US spelling, including analyze, color/colored and meters. Historic message IDs containing Analyse or Colour remain unchanged. British English has 40 runtime and 19 builder overrides, merged with the base after their separate lazy downloads. This avoids duplicating 1,220 English entries. British spelling includes centre/centred, colour/coloured, metres/millimetre, analyse, organisation and normalised. Parking Meter remains Parking Meter: a parking device is not a unit of length. No measurement-unit preference or conversion changes.

The existing internal/saved ID en remains the US catalog ID for backward compatibility. The resolver also accepts en-US as an explicit preference alias. UK uses the BCP 47 tag en-GB, not en-UK. Existing saved en selections remain US; explicit UK selections persist as en-GB. No storage migration is required. Valid host tags are parsed with Intl.Locale, accepting underscores as legacy separators; matching distinguishes Chinese scripts and the UK region. Unsupported scripts/malformed tags retain safe fallback.

The previously shipped mixed-English source phrases are retained in a tiny legacyEnglish presentation alias map. It lets old widget-owned imperative messages resolve to the new US canonical English and to other translations without changing internal errors, request values, taxonomy IDs or imagery algorithms. These aliases are developer compatibility data, not additional contributor messages.

## Translation versus regional formatting

LocaleValue.locale identifies the catalog. LocaleValue.formatLocale identifies dates/numbers; PresentationText caches formatters by this resolved locale and refreshes owned bindings on a region-only change. Direct React date/number surfaces, Time travel, sequences, nearby captures, field notes, place counters, date pickers and associated-image dates now use the formatting locale. The picker aligns weekday headers and its day grid using regional week metadata.

Examples:

| Policy / host | Catalog | Formatting |
|---|---|---|
| App language / en-US | US English | en-US |
| App language / en-GB | UK English | en-GB |
| App language / en-AU | US base wording | en-AU |
| App language / es-MX | Spanish | es-MX |
| App language / fr-CA | French | fr-CA |
| App language / pt-PT | available Brazilian Portuguese wording | pt-PT |
| App language / zh-Hant-HK | available Taiwan Traditional wording | zh-Hant-HK |
| App language / ru-RU or malformed tag | US English | en-US |
| Explicit US / any host | US English | en-US |
| Explicit UK / any host | UK English | en-GB |
| Explicit Spanish / es-MX | Spanish | es-MX |
| Explicit Spanish / unrelated host | Spanish | es default |

Explicit catalog choices that include a region (UK, Brazilian Portuguese and the Chinese variants, plus the US base) use that region. Generic language choices preserve a matching supported host region; otherwise they use that language's default Intl formatting. Host Unicode extensions are not activated: formatting uses the base locale, and the existing date picker remains Gregorian. Non-Gregorian calendar support is outside this change. Current message counter/plural structures remain unchanged; this does not claim a universal CLDR message/plural engine.

## Community workflow and downloads

The CSV now has 1,232 rows: 1,070 runtime messages, 150 builder messages and 12 language names. Its en column is US source text; en-GB is an editable UK column. All other language values are preserved. The importer resolves UK inheritance for review, writes only differing UK values, removes an override when a reviewed value equals US English, and synchronizes eager labels as before. Old CSV exports whose English source differs must be refreshed.

Isolated optimized UK text estimates: runtime 2,946 bytes / 1,224 gzip; settings 1,861 bytes / 880 gzip. The small eager legacy alias map is 493 bytes / 295 gzip. These are text-module estimates, not full production transfer measurements. No translation framework, fonts, imagery requests or new runtime packages are added. Contributor CSV and tooling remain outside runtime chunks.

## Validation

63 unit/catalog/community checks passed, covering US/UK sparse inheritance, unchanged placeholders, parking meter terminology, saved en and en-US alias compatibility, twelve builder languages against saved preferences, supported regional matching, malformed/unsupported fallback, number/date formatting, open binding refresh, calendar week starts, legacy English notice matching, table parity and sparse UK contribution imports.

Chromium component fixtures cover twelve runtime/builder choices, delayed downloads and stale-response guards, US/UK names and actual wording, UK date-picker dates and Monday week start, explicit US overriding a UK host, es-MX to es-ES formatting changes without catalog requests, unsupported-host US fallback, persisted UK selection, failed UK download US fallback and recovery on reload, and comparison slider/edited-note/route-setting preservation without extra fixture imagery loads. Calendar interaction is dispatched directly because the combined mock fixture panels overlap; it is not a production pointer-layout assertion. Experience Builder development build passed with local SDK 5.0.4.

These fixtures use real components with mocked builder wrappers, not a full deployed app or GPU benchmark. Regional week data and fonts can differ on older browsers; a small week-start fallback covers the offered locales when Intl week metadata is unavailable. External SDK/service controls and arbitrary user text remain outside widget translation catalogs. Native editorial review still applies to existing assisted translations.

Install from widget root: node apply-regional-english-v6-117.cjs. Undo: node apply-regional-english-v6-117.cjs --uninstall. Guarded dry-run, install, repeat install, exact rollback and conflict-before-writes are checked. Preserve later community edits before attempting rollback; edited targets are refused.
