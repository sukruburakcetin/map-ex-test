# Spanish v6.104

Requires v6.103. Adds Español to the runtime language choice and builder default-language selector. Both the widget and builder settings use Spanish, with the same translated surfaces and external-text limitations as v6.103.

The catalog explicitly translates all 1,070 runtime entries and 150 builder entries. Placeholder parity is checked against English. Brands, protocol identifiers and units remain intact. Spanish is an assisted translation draft; native editorial review has not been performed. Regional es-* app locales select the shared Spanish catalog; this release does not offer regional wording variants.

Spanish runtime and builder catalogs are separate dynamic imports. English users do not download Spanish; runtime users do not need the builder catalog. Isolated optimized catalog estimates: runtime 61,958 bytes / 18,813 gzip; builder 11,608 bytes / 4,626 gzip. These are text-only catalog estimates, not measured full-widget transfer deltas. No fonts, icons or translation framework were added.

The saved preference and builder-override policy now accept es. Existing en/tr/auto values retain their meaning. Unsupported languages continue to fall back to English. Builder help no longer describes obsolete pilot-only coverage. Request values, image IDs, category values, custom notes, layer data and map selection/hover algorithms are unchanged.

Validation: fourteen localization checks (catalog keys, placeholders, syntax, regional locale normalization, override policy, three-language notice translation); Chromium runtime test (lazy requests, English/Turkish/Spanish switching, persistent preference, es-MX automatic selection, locked builder policy, comparison state without image refetch, failed catalog download fallback and recovery after reload); Chromium builder test (Spanish headings, language round trips, routing settings and custom categories retained); Experience Builder development build passed.

A direct native-ES-module fixture caches a failed dynamic import until reload. Recovery after reload is tested; in-place retry after a failed download was not validated against the webpack application in this release. External ArcGIS/Mapillary controls, remote technical errors and user/service data may retain their original language. No production-app end-to-end or native editorial certification is claimed.

Install in the widget root: `node apply-spanish-language-v6-104.cjs`. Uninstall: `node apply-spanish-language-v6-104.cjs --uninstall`. The guarded installer checks conflicts before writing and supports exact rollback to v6.103.
