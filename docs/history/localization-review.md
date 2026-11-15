# Localization review record

Historical language review and delivery notes. For current instructions use the localization contribution guide and translation table.

## docs/history/localization-review.md

# Arabic v6.118

Requires v6.117. Adds Modern Standard Arabic (ar) to runtime and builder language choices. Names follow the current UI language, including Arabic and العربية. An explicit builder choice still overrides saved viewer preferences. App-language matching supports ar, ar-EG, ar-SA, ar-AE and other valid Arabic regional tags; explicit non-Arab scripts and malformed tags safely fall back to US English.

## Translation coverage and review status

The Arabic files explicitly cover all 1,070 runtime and 150 builder entries with matching placeholders and nonempty strings. The eager splash/heading subsets match those catalogs. The community table now has 1,233 rows (1,070 runtime, 150 settings, 13 language names) and an ar column.

Preparation used the public Google Translate endpoint as an offline scaffold for public English UI catalog text, with protected placeholders and brands. No user content, credentials or imagery was sent. The committed results were refined with terminology substitutions and contextual edits to core controls, startup copy, builder labels, routing, note counters, elevation profiles and point clouds. This is an assisted draft, not a native editorial certification. A native Arabic review of the full technical catalog and actual workflows remains needed; equal key counts do not prove fluent wording in every context.

Reviewed terminology includes الصورة (image), لقطة (capture), التغطية (coverage), سحابة النقاط (point cloud), منحنى الارتفاع (elevation profile), الملاحظات الميدانية (field notes) and معرّف المؤسسة (organization ID). Image-fit mode uses إظهار الصورة كاملة rather than the literal postbox translation of letterbox. Technical field/path names such as status, resolution_note, X, Y and tools/overture_places are preserved. Counters use label-first phrasing such as عدد الملاحظات المستوردة: {count}, avoiding an incorrect single generic numbered-noun form across Arabic's zero/one/two/few/many cases. This does not introduce a general six-form Arabic plural engine. Chinese and other existing catalog values are unchanged.

## Direction, dates and interactions

Runtime and fullscreen roots, builder settings, the language control, splash and portalled comparison/calendar UI receive explicit direction. Widget-owned place popups, note tables and imagery hover cards bind their direction to the owning presentation scope, including when the host map is outside the widget. Custom note text uses automatic direction, retaining its exact value. Numeric/URL inputs use LTR isolation where appropriate. Direction changes are local to the widget; no production document-wide dir change is made.

The Mapillary SDK viewport remains LTR. Comparison image clipping and its slider retain LTR physical coordinates and keyboard semantics. The filter strip retains LTR scrolling/scrollbar coordinates, with RTL text inside its Arabic groups. Existing left/right scrollbar geometry, map picking, hover identity, bearing calculations, cones and animation logic are not rewritten.

Testing revealed an existing bug where physical KeyboardEvent.key End was compared to translated end-label text. All three filter-strip key comparisons now use the literal End. A missing space between the owned Captured label and date was also corrected. The old Overture test loader was updated to resolve relative presentation imports so those regressions can run; these are display/test changes, not imagery-request changes.

Arabic formatting preserves a matching host region and explicitly uses Gregorian dates (for example ar-SA-u-ca-gregory). Without a matching host region, explicit Arabic uses ar-u-ca-gregory. This keeps the existing Gregorian date picker from mixing Saudi default Islamic calendar headings with Gregorian date values. Arabic regional numbers and week starts follow Intl; localized day/year digits and navigation glyphs agree with RTL calendar layout. Date values, ISO fields, stored identifiers, units and request data remain unchanged. Older browsers without Intl week metadata use a small region fallback, including Egyptian Saturday and Saudi Sunday starts.

## Downloads and validation

Full runtime and settings catalogs remain separate lazy chunks. Isolated optimized text estimates are 171,339 bytes / 25,068 gzip for runtime, and 31,642 bytes / 5,831 gzip for builder. Scoped bidi CSS is 827 bytes / 274 gzip. These are text estimates, not production app transfer measurements. No new runtime libraries, font files or font downloads are introduced. The translation service is not called by the widget or contributor import tool.

Validation includes catalog key/placeholder/source integrity; startup parity; Arabic script/region matching; thirteen explicit builder languages against saved preferences; Gregorian Saudi/Egyptian regional dates; regional week starts; Arabic-Indic parameter matching; literal user content; community-table parity/import protection; direction/hover and map/place interaction regressions. Focused localization/hover tests and the map/place regression suites pass, as do the Experience Builder development build and Chromium component fixtures.

Browser fixtures cover held Arabic download and immediate translated splash; RTL language controls, settings and owned popup direction; a portalled RTL comparison with an LTR slider whose End key still reveals 100%; thirteen-language comparison switches retaining the slider and avoiding extra fixture imagery loads; unchanged custom category and image ID text; LTR URL and ID isolation; Arabic Gregorian calendar headers; positive physical filter scrolling via End; switching back to LTR; compact place buttons and splash at 320 px; and no font-file requests. Arabic startup, narrow splash, narrow editor/places and builder screenshots were visually inspected using system fonts.

The fixtures use real components with mocked Experience Builder wrappers, not a full deployed RTL application. Calendar clicks are dispatched directly because fixture panels overlap; they do not certify production pointer layout. Host SDK controls, third-party content, every system font and every advanced panel still require deployed/native review. External host controls, arbitrary user notes and proper names are outside the catalog.

Install from widget root: node apply-arabic-language-v6-118.cjs. Undo: node apply-arabic-language-v6-118.cjs --uninstall. Guarded dry-run/install/reinstall, byte-exact rollback and conflict-before-writes are checked. Preserve later community edits before attempting rollback.


## docs/history/localization-review.md

# Builder language priority v6.106

Requires v6.105. An explicit builder language (English, Turkish or Spanish) now overrides every saved runtime preference, even when Allow Users To Change Language is enabled. The in-widget language selector displays that same configured value and is disabled. The setter also rejects programmatic attempts to override a builder language.

When the builder selects App language (auto), viewer choice remains available if enabled. Saved viewer choices are retained for this mode, but cannot override an explicit builder language. If viewer choice is disabled, auto follows the application locale. Existing startup translation and lazy catalog behavior are retained.

Validation: sixteen localization checks, including all explicit builder languages against every saved preference with viewer choice enabled/disabled; Chromium tests stale stored Turkish versus builder Spanish, synchronized disabled selectors, programmatic change rejection, live builder changes across all three languages, Auto unlocking viewer choice, and preserved storage; Experience Builder development build. Installer dry-run, install, repeat install, byte-exact uninstall and conflict-before-writes passed.

Install from widget root: `node apply-builder-language-priority-v6-106.cjs`. Undo: `node apply-builder-language-priority-v6-106.cjs --uninstall`. No marker, hover, coverage or image-selection logic changes.


## docs/history/localization-review.md

# Community translation workflow v6.116

Requires v6.115. Consolidates all 1,070 Turkish runtime translations into locales/tr.ts. Removes locales/runtime-tr.ts and locales/completion-tr.ts after their imports are removed. The resulting catalog's complete key/value map was compared with v6.115 and is unchanged. English source modules and every other language catalog remain unchanged; Turkish builder settings remain separate.

Adds a UTF-8 CSV lookup table with 1,231 stable rows: all 1,070 runtime entries, 150 builder entries and 11 language-name entries. Every row includes scope, key, English and all ten translations. The root README links the contributor guide. The CSV and tooling are developer/documentation assets and do not enter runtime bundles.

The developer-only translation-table tool exports, checks and imports the table. Import is read-only by default and lists all proposed changes; --write explicitly applies reviewed changes. Preflight rejects unknown, missing and duplicate rows, incorrect columns, changed English, blank translations, placeholder drift and corrupt characters before any write. Applied edits update the affected runtime/settings catalog, eager startup subsets, language names and the checked-in CSV together. CSV supports BOM, quotes, commas, multiline text and row sorting. Catalogs remain the runtime source of truth. This workflow does not replace Git conflict review or native editorial review.

Validation includes unchanged Turkish key/value parity, all catalog QA, table/catalog parity, CSV round trips, actual fixture edits to Spanish runtime/settings/names, startup synchronization, unchanged other languages, repeat imports and invalid-input rejection without source changes. Existing runtime/builder browser switching and Experience Builder development build are checked. The installer supports guarded removal of the two obsolete Turkish source files, restores them on uninstall and refuses edited/conflicting targets before writing.

Install: node apply-community-translations-v6-116.cjs. Undo: node apply-community-translations-v6-116.cjs --uninstall. Uninstall refuses later edits; preserve community contributions and review their diff before rolling back.


## docs/history/localization-review.md

# Localization closure v6.103

Requires v6.102. Adds 457 bilingual presentation templates (1,070 runtime keys and 150 builder keys). Turkish remains a translation draft requiring native editorial review.

Owned React feedback, hover-card fallback text, place details, profile labels, legend labels, default note-category choices and built-in object labels now use the selected locale. Default category values, custom categories, user notes, proper names, request values and IDs remain unchanged. Date and number formatting uses Intl with the widget locale. Open owned DOM labels refresh without rebuilding imagery or map layers.

Validation: catalog parity and placeholders; ten localization checks; Chromium runtime and builder language switching; open Enterprise popup labels, status and date switching with literal user content; Experience Builder development build; installer dry-run, installation, repeat installation, exact rollback and conflict detection. The limited standalone name check leaves only existing SDK IHandle globals. This is not a full TypeScript typecheck or a GPU performance benchmark.

The repeat AST scan found zero remaining UI candidates and zero locale formatter candidates under its current rules (previously 185 and 22). That is not proof that every rendered string is translated. Error constructors remain English deliberately: cancellation, authorization and retry classification depend on them. Known error messages are translated at owned presentation boundaries; compound and remote server details can remain English and require scenario verification. Twenty-nine source label candidates and fifty taxonomy candidates are catalogued, but private layer titles and external taxonomy fallback names can remain unchanged. Host ArcGIS/Mapillary SDK controls, authentication pages, server-supplied data, custom categories and user content are outside this widget catalog.

The language remains a lazy-loaded text chunk; there are no translation libraries, icon assets or fonts added. Hover picking, image identities and animation algorithms are unchanged; the hover card receives only the presentation scope.

Install from the widget root: `node apply-localization-closure-v6-103.cjs`. Roll back: `node apply-localization-closure-v6-103.cjs --uninstall`.


## docs/history/localization-review.md

# v6.101: English / Turkish localization pilot

## Install and use

Requires v6.100. From the widget root run:

```
node apply-english-turkish-pilot-v6-101.cjs
```

Rebuild Experience Builder and refresh. In the builder, open **Language · pilot → Default widget language** and choose **App language**, **English** or **Türkçe**. The widget-owned settings panel immediately follows this choice, including routing help/statuses and placeholders. App language follows Experience Builder's supplied locale; tr and tr-TR select Turkish, while unsupported languages fall back to English.

**Allow users to change language** controls the viewer override. When enabled, users can open an image and choose **More image actions → Language → Türkçe**. **Widget default** inherits the builder choice. Manual English / Turkish choice is saved per widget in localStorage. When user overrides are disabled, saved choices are ignored and the runtime switcher is hidden. The builder always follows its configured language, never a viewer's saved choice. Storage restrictions do not prevent language switching.

This is the first localization slice, not a claim that the whole widget is translated. Covered surfaces: all widget-owned builder settings labels/help/placeholders/options and conditional statuses (150 messages), image utility actions and their tooltips/accessibility labels, coverage filter labels, filter scrolling controls, the shared date calendar and Time travel preview/comparison. Turkish calendars start on Monday; English calendars retain Sunday. Dates and distances use Intl formatters. Usernames, place names, IDs and external data remain intact.

Remaining English surfaces include the main control bar, splash screen, info/details, nearby places, routes, field notes, coverage notices, download content and taxonomy option names supplied by other code. Mapillary and ArcGIS SDK-owned UI require their respective locale support. Host-owned builder controls, such as the Esri map-widget chooser, and native browser date popups may follow the host/browser language independently. User-entered field-note category names are data and are not rewritten. Do not advertise complete Turkish support until these are extracted and reviewed.

## Loading and size

English fallback and a small React context use the existing host React runtime; no localization framework or live translation API is added. Turkish is loaded with dynamic import only when requested. Builder-only catalogs are outside the runtime dependency graph. The actual SDK development build emits `dist/widgets/chunks/mapillary-locale-tr.js` separately: 13,637 bytes in this build, including development overhead. The Turkish runtime catalog is absent from the main widget bundle. Builder Turkish is a second, builder-only `mapillary-settings-tr.js` chunk (36,750 development bytes); runtime users do not load it. This is not a production compressed-size comparison.

Deploy the complete Experience Builder build output, including shared `widgets/chunks` assets. Copying only the widget's runtime JS can omit the language file. Same-origin chunk loading uses the normal deployment/CSP rules. If loading fails, English remains usable and a retry action appears in the language selector. New language choices must not trigger imagery reloads or mutate map/selection owners.

## Translation workflow

Runtime English source and stable keys: `src/i18n/messages.ts`. Runtime Turkish: `src/i18n/locales/tr.ts`. Builder-only catalogs: `src/i18n/settingsMessages.ts` and `src/i18n/locales/settings-tr.ts`. Each catalog must have all keys and identical named placeholders. Use complete messages, not translated sentence fragments; do not concatenate grammar-sensitive strings. Values are rendered as React text, never HTML. Keep dates/numbers in Intl formatters. Future pluralized messages need Intl.PluralRules or the host message formatter rather than English suffix rules.

The current Turkish catalog is an assisted draft. A native Turkish reviewer should check screenshots and actual UI, especially domain terms, truncation, keyboard operation and technical accuracy. Reviewers should run at 360px and desktop widths, in fullscreen, and with loading/error/empty states. Preserve a glossary and review terminology changes across all surfaces. Additional languages need a catalog, loader choice and native review; right-to-left languages also need a separate layout audit.

## Validation

- Catalog key/placeholder parity, fallback, parameter substitution and locale normalization tests pass.
- Strict TypeScript compilation passes for catalogs/core.
- SDK development build passes and emits a separate Turkish chunk.
- Browser fixture checks cover lazy loading (no Turkish request while English is used), Turkish utility/filter/Time travel controls, portal context, comparison-state preservation, saved preference, app locale, blocked download fallback, disabled storage and mobile menu bounds.
- Builder browser checks cover language switching, translated conditional routing states and preservation of service values and custom category data. The settings audit found no remaining hardcoded widget-owned labels or JSX text, except intentional URL examples. All 39 existing settings handlers/state members are unchanged.
- All 599 pre-existing runtime class members except render remain byte-identical to v6.100. The existing render body is moved behind a context provider without a DOM wrapper.

The catalogs/contexts themselves do not add a map, playback or animation loop. No FPS benchmark is claimed.

## Uninstall

```
node apply-english-turkish-pilot-v6-101.cjs --uninstall
```

Rebuild and refresh. This restores the exact prior source and removes pilot files. Guards reject rollback if later edits conflict. The dormant localStorage language preference is harmless and may be removed manually if desired.


## docs/history/localization-review.md

# French v6.107

Requires v6.106. Adds French to both language selectors. Language names follow the displayed language: French / Fransızca / Francés / Français. The shared French catalog covers fr, fr-FR, fr-CA, fr-BE and other fr-* app locales; separate regional wording variants are not provided.

French contains all 1,070 runtime entries and 150 builder entries, matching the English, Turkish and Spanish catalog keys and placeholders. Includes controls, hints, feedback, default category labels, object vocabulary, profile and point-cloud labels. French wording is an assisted translation draft; native editorial review has not been performed. Equal catalog counts do not prove every external screen is translated. The external SDK/service, user-data and compound technical-error limitations documented in v6.103 remain.

The full runtime and builder catalogs are separate lazy imports. Isolated optimized catalog estimates: runtime 67,110 bytes / 19,419 gzip; builder 12,650 bytes / 4,762 gzip. These are text-only catalog estimates, not full-widget production transfer measurements. The eager startup bundle now totals 3,741 bytes / 1,473 gzip across all supported non-English languages and language names. No translation library, font or icon assets were added.

The v6.105 startup behavior is preserved: French splash text and language controls are available before the full catalog downloads. Other non-startup controls may briefly use fallback text on a cold load. The v6.106 builder policy is preserved: an explicit builder language wins over every stored viewer choice, and the runtime selector shows that value disabled. In App language mode, allowed viewer choices can override the app locale.

Validation: 20 localization tests, covering catalog completeness, placeholders, syntax, startup parity, locale normalization, every builder language against every saved preference, four-language notice translation and Intl dates/numbers. Chromium runtime and builder fixtures use the actual components with Experience Builder UI mocks. The runtime fixture holds the French download pending and verifies French splash text before releasing it; checks conflicting stored Spanish versus builder French, disabled selector and blocked viewer override, four-language comparison state without image refetch, edited-note and custom-category preservation, saved French reload, automatic fr-CA, failed catalog fallback and reload recovery. The builder fixture verifies lazy French settings, translated headings, Spanish/French round trip, retained OSRM URL and canonical route value, and literal custom categories. Experience Builder development build passed.

These are focused component/browser fixtures, not a full deployed Experience Builder application test. Recovery from a failed dynamic import is validated after reload; in-place retry is not certified against the production webpack application. Map rendering, picking, hover algorithms and imagery requests are not modified.

Install from the widget root: `node apply-french-language-v6-107.cjs`. Undo: `node apply-french-language-v6-107.cjs --uninstall`. Guarded dry-run, install, repeat install, exact uninstall and conflict-before-writes are checked.


## docs/history/localization-review.md

# German v6.108

Requires v6.107. Adds German to the widget and builder language selectors. The language name follows the displayed UI language: German / Almanca / Alemán / Allemand / Deutsch. App locale variants de-DE, de-AT, de-CH and other de-* variants use the shared German catalog; regional wording variants are not provided.

The German catalogs explicitly cover all 1,070 runtime and 150 builder entries with identical keys and placeholders. Brands, request values, saved note categories, user content and service data are preserved. The v6.105 startup subset includes German splash and language controls on first paint. The v6.106 policy remains: explicit builder language overrides saved viewer preferences and disables the matching runtime selector; viewer choice is available in App language mode if allowed.

Full runtime and builder catalogs are separately lazy-loaded. Isolated optimized text estimates: German runtime 63,021 bytes / 19,283 gzip; builder 11,578 bytes / 4,722 gzip. The total eager startup subset for all non-English languages and localized language names is 4,932 bytes / 1,874 gzip. These are catalog estimates, not measured full application transfer changes. No language framework, fonts or icon assets are added.

Validation: 24 localization checks, including all German catalog keys/placeholders/syntax, startup consistency, regional locale normalization, builder priority for all five languages against every saved preference, five-language notice conversion and German Intl formatting. Chromium fixtures verify German first paint with the runtime download held pending; saved Spanish versus builder German; synchronized disabled selector; five-language comparison position without image refetch; edited-note and custom-category preservation; saved German after navigation; automatic de-AT; lazy runtime and settings chunks; failed download fallback and recovery after reload; translated builder headings, Spanish/German round trip, retained OSRM URL and canonical route value. Compact place buttons have no horizontal text overflow and the German splash heading stays within the viewport at 320 px. No layout changes were needed for those tested controls. Experience Builder development build passed.

Browser fixtures render actual widget components with mocked Experience Builder UI wrappers, not a complete deployed Experience Builder application. The narrow checks cover the tested place buttons and splash, not every possible panel. In-place retry after a failed dynamic import is not certified; reload recovery is tested. German is an assisted translation draft without native editorial certification. External SDK/service text and compound technical errors can retain their original language, as documented in v6.103. Equal key counts are not proof that every externally rendered string is translated.

No map selection, hover, marker, coverage or imagery-request algorithms are changed.

Install from widget root: `node apply-german-language-v6-108.cjs`. Undo: `node apply-german-language-v6-108.cjs --uninstall`. Guarded dry-run, install, repeat install, exact uninstall and conflict-before-writes are checked.


## docs/history/localization-review.md

# Italian v6.110

Requires v6.109. Adds Italian to both language selectors with configured/saved value it. Language names follow the displayed UI language: Italian / İtalyanca / Italiano / Italien / Italienisch / Italiano / Italiano. App locales it, it-IT, it-CH and other it-* variants use the shared Italian catalog; separate regional variants are not provided.

The catalogs explicitly cover all 1,070 runtime and 150 builder entries with matching keys and placeholders. Includes controls, tooltips, feedback, field notes, routing, profiles, point-cloud tools and built-in object labels. Brands, protocol identifiers, request values, stored category values and arbitrary user content remain unchanged. Catalog parity does not prove all external screens are translated. External SDK/service text and compound technical errors retain the limitations documented in v6.103. Italian is an assisted translation draft without native editorial certification.

The translated splash and language controls are available before the full runtime catalog downloads. An explicit builder language overrides every stored runtime preference, with the matching runtime selector disabled. In App language mode, allowed viewers can choose Italian and retain it across navigation/reload. Other non-startup controls may briefly use fallback text during a cold catalog download.

Full runtime and builder catalogs remain separate lazy imports. Isolated optimized text estimates: runtime 61,861 bytes / 18,783 gzip; builder 11,537 bytes / 4,609 gzip. The eager startup bundle for all supported non-English languages and localized names totals 7,566 bytes / 2,523 gzip. These are catalog estimates, not full production application transfer measurements. No localization library, font or icon assets were added.

Validation: 32 localization checks, including all Italian runtime/builder keys/placeholders/syntax, startup parity, regional locale normalization, all seven explicit builder languages against every saved preference, seven-language notice conversion and Italian Intl number/date formatting. Chromium component fixtures verify Italian splash before a deliberately held download completes; conflicting saved Spanish versus builder Italian, synchronized disabled selector and blocked viewer override; seven-language comparison position without image refetch; edited-note and custom-category preservation; saved Italian after navigation; automatic it-CH; lazy runtime/settings downloads; failed download fallback and recovery after reload; translated builder headings, Spanish/Italian round trip, retained OSRM URL and canonical route setting. Tested compact place buttons have no horizontal text overflow and the splash heading stays within the viewport at 320 px. Experience Builder development build passed.

Fixtures use real widget components with mocked Experience Builder UI wrappers, not a full deployed app. Narrow checks cover tested place buttons and splash, not every panel. Recovery after reload is tested; in-place retry after a failed native dynamic import is not certified against the production webpack application. No map graphics, hover picking, coverage, animation or imagery-request algorithms are changed.

Install from widget root: `node apply-italian-language-v6-110.cjs`. Undo: `node apply-italian-language-v6-110.cjs --uninstall`. Guarded dry-run, install, repeat install, exact rollback and conflict-before-writes are checked.


## docs/history/localization-review.md

# Japanese v6.111

Requires v6.110. Adds Japanese with the canonical configured and saved value ja. App locales ja and ja-JP select this catalog; jp is not treated as a language code. Localized selector names include Japanese, Japonca, Japonés, Japonais, Japanisch, Japonês, Giapponese and 日本語.

The catalogs explicitly cover all 1,070 runtime and 150 builder entries with matching keys and placeholders. Includes controls, feedback, hints, field notes, routing, profile and point-cloud tools, and built-in object labels. Japanese has no title/lowercase distinction. Stored enum/category values, user notes, proper names, request values and protocol identifiers remain unchanged. External SDK/service text and compound technical errors retain the limits documented in v6.103. Equal key counts are not proof that all externally rendered text is translated. Japanese is an assisted translation draft without native editorial certification.

The small eager startup catalog includes Japanese splash copy and language controls. Full runtime and builder catalogs remain separate dynamic imports. An explicit builder language overrides saved viewer choices and the runtime selector matches it while disabled. In App language mode, allowed users can choose Japanese and retain the choice. Other non-startup controls may briefly show fallback text during a cold catalog download.

The owned-notice matcher now counts Unicode letters rather than only Latin letters. The previous gate rejected parameterized Japanese templates when translating already-generated notices back into another language. A regression test fails before the change and passes afterward, including parameter reordering. Exact lookup, the minimum static-letter guard, bounded cache and maximum matching length remain. Matching is still used only at widget-owned presentation boundaries; arbitrary note content is not translated.

Uses existing browser/system font fallback; no Japanese font is bundled or downloaded by this patch. The test environment has Noto CJK fonts installed. Rendering can differ by operating system. Isolated optimized text estimates: Japanese runtime 115,506 bytes / 21,504 gzip; builder 20,116 bytes / 5,467 gzip. The total eager startup bundle for supported non-English languages and localized names is 9,677 bytes / 3,204 gzip. These are catalog estimates, not full production app transfer measurements.

Validation: 37 localization checks, including key/placeholder/syntax coverage, startup parity, ja-JP selection, builder priority for all eight languages against every saved preference, eight-language notice conversion, parameter reordering, literal user text and Japanese Intl formatting. Chromium fixtures verify Japanese splash before releasing a held download, saved Spanish versus builder Japanese, synchronized disabled selector and blocked viewer override, eight-language comparison state without image refetch, edited-note and custom-category preservation, stored Japanese after navigation, automatic ja-JP, lazy runtime/settings downloads, failed download fallback and reload recovery. Builder checks verify Japanese headings, Spanish/Japanese round trip, retained OSRM URL and canonical route selection. Compact place buttons have no horizontal overflow and the splash heading stays within the 320 px viewport. The narrow Japanese screenshot was visually inspected with installed CJK fonts. No font-file requests occurred in the runtime fixture. Experience Builder development build passed.

Fixtures use actual components with mocked Experience Builder UI wrappers, not a full deployed app. Narrow checks cover tested place buttons and splash rather than every panel or operating-system font. Reload recovery is tested; in-place retry of a failed dynamic import is not certified against the production webpack app. No map graphics, hover selection, marker, coverage, animation or imagery-request algorithms are changed.

Install in widget root: `node apply-japanese-language-v6-111.cjs`. Undo: `node apply-japanese-language-v6-111.cjs --uninstall`. Guarded dry-run, install, repeat install, byte-exact uninstall and conflict-before-writes are checked.


## docs/history/localization-review.md

# Korean v6.112

Requires v6.111. Adds Korean with the canonical configured and saved language value ko. App locales ko, ko-KR and equivalent case/underscore forms select Korean; kr is not a language code. Localized selector names are Korean, Korece, Coreano, Coréen, Koreanisch, Coreano, Coreano, 韓国語 and 한국어.

The Korean catalogs explicitly cover all 1,070 runtime and 150 builder entries with matching keys and placeholders. Includes controls, feedback, hints, field notes, routing, profiles, point-cloud tools and built-in object names. Hangul has no title/lowercase distinction. Stored enum/category values, arbitrary user notes, proper names, request values and protocol identifiers remain unchanged. The external SDK/service and compound technical-error boundaries documented in v6.103 remain. Equal key counts do not prove every externally rendered string is translated. Korean is an assisted translation draft without native editorial certification.

The eager startup subset provides Korean splash copy and language controls before the full catalog downloads. Full runtime and builder catalogs remain separate lazy imports. Explicit builder language overrides every stored viewer preference and is shown by the disabled runtime selector. Allowed viewer choice is available when the builder uses App language. Non-startup controls may briefly use fallback copy during a cold catalog download. The Unicode-aware owned-notice matcher from v6.111 handles Korean without a new matching algorithm.

Uses existing browser/system font fallback; no bundled or downloaded Korean font. The browser test environment already has Noto CJK fonts installed. Font metrics and rendering can differ by operating system. Isolated optimized text estimates: Korean runtime 100,251 bytes / 20,307 gzip; builder 17,059 bytes / 5,154 gzip. The total eager startup bundle for all supported non-English languages and localized names is 11,485 bytes / 3,809 gzip. These are text catalog estimates, not full production application transfer measurements.

Validation: 41 localization checks including all Korean keys/placeholders/syntax, startup parity, ko-KR matching, builder priority across nine languages and every saved preference, nine-language notice conversion, reordered Korean parameters, literal user text, and Korean Intl date/number formatting. Chromium fixtures verify Korean splash while a catalog download is held pending; conflicting saved Spanish versus builder Korean, synchronized disabled selector and rejected viewer override; nine-language comparison state without image refetch; edited-note/custom-category preservation; saved Korean after navigation; automatic ko-KR; lazy runtime/settings downloads; failed download fallback and reload recovery; Korean builder headings, Spanish/Korean round trip, retained OSRM URL and canonical route value. Tested compact place buttons have no horizontal overflow and the splash heading fits at 320 px. The narrow Korean screenshot was visually inspected with installed CJK fonts. No font-file requests occurred in the runtime fixture. Experience Builder development build passed.

Fixtures use actual components with mocked Experience Builder UI wrappers, not a full deployed application. Narrow checks cover tested place buttons and splash, not every panel or system font. Reload recovery is tested; in-place retry after a failed dynamic import is not certified against the production webpack application. No map graphics, picking, hover, markers, coverage, animation or imagery-request algorithms are changed.

Install from widget root: `node apply-korean-language-v6-112.cjs`. Undo: `node apply-korean-language-v6-112.cjs --uninstall`. Guarded dry-run, install, repeat install, byte-exact uninstall and conflict-before-writes are checked.


## docs/history/localization-review.md

# Brazilian Portuguese v6.109

Requires v6.108. Adds Portuguese (Brazil) to both language selectors with the canonical configured and saved value pt-BR. Localized language names distinguish the variant: Portuguese (Brazil), Portekizce (Brezilya), Portugués (Brasil), Portugais (Brésil), Portugiesisch (Brasilien), Português (Brasil).

The Brazilian Portuguese catalogs explicitly cover all 1,070 runtime and 150 builder entries with matching keys and placeholders. Uses Brazilian terminology such as arquivo, tela, usuário and salvar. Brands, protocol identifiers, request values, persisted categories and arbitrary user/service data remain intact. The same external SDK/service and compound-error limitations documented in v6.103 apply; equal key counts are not proof that every external screen is translated. Native editorial review has not been performed.

Automatic language matching maps pt, pt-BR and other pt-* app locales to this Brazilian catalog as the available Portuguese fallback. This includes pt-PT until a separate European Portuguese catalog is added. It is not a European Portuguese translation. Selected builder language always overrides saved runtime preferences. In App language mode, allowed users can select and retain pt-BR. Startup copy is available before the full catalog downloads. Other non-startup controls may briefly use fallback text on a cold load.

Full runtime and builder catalogs remain separate dynamic imports. Isolated optimized catalog estimates: runtime 62,655 bytes / 18,881 gzip; builder 11,700 bytes / 4,687 gzip. The eager startup bundle for all non-English languages and localized names totals 6,296 bytes / 2,193 gzip. These are text catalog estimates, not full production application transfer measurements. No localization framework, font or icon assets were added.

Validation: 28 localization checks including all Portuguese runtime/builder keys, placeholders and syntax; startup parity; Portuguese locale matching; all six explicit builder languages against every saved preference; six-language notice conversion; Brazilian number and date formatting. Chromium component fixtures verify a translated splash while the catalog download is held pending; saved Spanish versus builder Portuguese, matching disabled selector and blocked viewer override; six-language comparison state without image refetch; edited-note and custom-category preservation; persisted pt-BR after navigation; automatic pt-BR; lazy runtime/settings downloads; failed download fallback and reload recovery; builder headings, Spanish/Portuguese round trip, preserved OSRM URL and canonical route choice. Compact place buttons have no horizontal text overflow and the splash heading remains within a 320 px viewport. Experience Builder development build passed.

The fixtures use real widget components with mocked Experience Builder UI wrappers, not a full deployed application. Narrow checks cover tested place buttons and splash, not every possible panel. Recovery after reload is tested; in-place retry after a failed dynamic import is not certified against the production webpack app. No map graphics, hover picking, coverage, animation or imagery-request algorithms are changed.

Install from widget root: `node apply-brazilian-portuguese-v6-109.cjs`. Undo: `node apply-brazilian-portuguese-v6-109.cjs --uninstall`. Guarded dry-run, install, repeat install, exact rollback and conflict-before-writes are checked.


## docs/history/localization-review.md

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


## docs/history/localization-review.md

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


## docs/history/localization-review.md

# v6.102: Runtime translation continuation and settings Title Case

Requires v6.101. Run `node apply-runtime-turkish-continuation-v6-102.cjs`, rebuild and refresh. Builder language policy and viewer language choice work as before.

## Changes

The continuation adds 516 English/Turkish messages. It covers splash/intro text, map controls and tooltips, fullscreen controls, image details, legends, nearby imagery and sequence labels, nearby-place lists/counts/categories, field-note forms/status labels/actions, routing controls, coverage/quality analysis, detection controls, elevation/solar controls, point-cloud controls, common loading/empty states, coverage notices and help/guide labels. Existing user-entered note categories, descriptions, usernames, place names, service identifiers, enum values and coordinates are not translated or rewritten. Filter default-option display labels are translated while their underlying values stay unchanged; mapping is memoized.

52 settings section/row/bold-field headings now use Title Case in English and Turkish. Turkish casing handles i → İ and ı → I. Help sentences and user content retain sentence case.

Runtime-owned React text and common imperative notices use the same per-widget locale. A render bridge updates the widget instance's translator without changing map/viewer owners. Components use context directly, including PureComponent-based details/dropdowns. There is no document-wide language switch or DOM text replacement. Dates and note counts use the selected locale. Full count messages avoid attaching an English plural suffix to Turkish text.

## Scope still to audit

This is a broad continuation, not certification that every possible string is translated. Remaining work includes generated HTML/ArcGIS popups, some specialized asynchronous feedback/errors and export-content labels. Existing in-flight status strings may retain the language in which they were produced until their operation updates. Service-provided taxonomy names and server error text also need a deliberate display policy; user content must remain intact. SDK-owned Mapillary/Esri controls and native browser dialogs can follow their host/browser locale. Turkish copy remains subject to native review.

## Size and verification

No localization framework, remote translation API, extra animation loop or imagery request is introduced. Turkish remains on-demand. The isolated minified full Turkish runtime catalog measured 38,705 bytes uncompressed and 11,890 gzip bytes in the check; this is a catalog measurement, not a full production-widget size delta. Builder translations remain in a separate builder-only chunk.

Catalog key/placeholder parity, settings policy/casing and runtime message checks pass. The SDK build passes. Browser fixtures checked Turkish splash, map rail, class-based details, places counts, note status labels, user-data preservation and builder language switching/routing values. Eight existing pulse, hover, cone and coverage-anchor runtime methods remain byte-identical to v6.101. No FPS benchmark is claimed.

## Uninstall

```
node apply-runtime-turkish-continuation-v6-102.cjs --uninstall
```

Rebuild and reload. Guards restore the exact prior source and remove continuation files. Uninstall before later conflicting edits.


## docs/history/localization-review.md

# Simplified Chinese v6.113

Requires v6.112. Adds Chinese (Simplified), configured and saved as zh-CN, to both language selectors. Names follow the current UI language, including Chinese (Simplified), Çince (Basitleştirilmiş), Chino (simplificado), Chinois (simplifié), Chinesisch (vereinfacht), Chinês (simplificado), Cinese (semplificato), 中国語（簡体字）, 중국어(간체), and 简体中文.

The catalogs explicitly cover all 1,070 runtime and 150 builder entries with matching keys and placeholders. Includes controls, feedback, field notes, routing, high-level profile and point-cloud tools, and built-in object vocabulary. Chinese has no title/lowercase distinction. Brands, protocol identifiers, stored enum/category values, arbitrary user notes and request values remain unchanged. Equal key counts do not prove every externally rendered string is translated. The external SDK/service and compound technical-error boundaries documented in v6.103 remain. Simplified Chinese is an assisted translation draft without native editorial certification.

Automatic locale detection uses Intl.Locale to distinguish script and region. zh, zh-CN, zh-SG and explicit zh-Hans variants select zh-CN. An explicit Hans script takes precedence over region, including zh-Hans-HK. Explicit Hant, TW, HK and MO app locales are not silently mapped to Simplified; they fall back to English until Traditional Chinese is supplied. A user or builder can still explicitly select zh-CN. Unicode extensions do not change script classification, malformed Chinese tags fall back safely, and explicit unsupported scripts such as Latn do not select Simplified.

Startup splash text and language controls are available before the full catalog downloads. Full runtime and builder catalogs remain separate lazy imports. Builder-selected language overrides all saved viewer preferences; the inside selector displays it disabled. Allowed viewers can choose a language in App language mode. Other non-startup controls may briefly use fallback text on a cold download. Unicode-aware matching from v6.111 supports Chinese notice translation in both directions.

Uses installed system/browser fonts, with no bundled fonts or font downloads. The test machine has Noto CJK fonts. Font metrics can differ by operating system. Isolated optimized text estimates: runtime 78,260 bytes / 19,417 gzip; builder 14,397 bytes / 4,966 gzip. The total eager startup subset for supported non-English languages and localized names is 13,397 bytes / 4,407 gzip. These are catalog estimates, not full production app transfer measurements.

Validation: 45 localization checks for key/placeholder/syntax coverage, startup parity, Simplified/Traditional script and region behavior, builder priority across ten languages and every saved preference, ten-language notice round trips, reordered Chinese parameters, literal user text and Chinese Intl date/number formatting. Chromium fixtures verify Chinese splash before releasing a held download, saved Spanish versus builder Chinese, matching disabled selector and blocked viewer override, ten-language comparison state without image refetch, edited-note and custom-category preservation, persisted zh-CN after navigation, automatic zh-Hans-CN, lazy runtime/settings downloads, failed download fallback/reload, builder headings and Spanish/Chinese round trip with retained OSRM URL and canonical routing setting. A zh-Hant-TW browser starts in English and does not request Simplified until the builder explicitly selects it. Compact place buttons have no horizontal overflow, and the splash heading fits at 320 px. The narrow screenshot was visually inspected with installed CJK fonts. No runtime font-file requests occurred. Experience Builder development build passed.

Fixtures render real components with mocked Experience Builder UI wrappers, not a full deployed app. Narrow checks cover tested place buttons and splash, not every panel or system font. Recovery after reload is tested; in-place retry after a failed dynamic import is not certified against the production webpack app. No map graphics, picking, hover, marker, coverage, animation or imagery-request algorithms change.

Install from widget root: `node apply-simplified-chinese-v6-113.cjs`. Undo: `node apply-simplified-chinese-v6-113.cjs --uninstall`. Guarded dry-run, install, repeat install, byte-exact uninstall and conflict-before-writes are checked.


## docs/history/localization-review.md

# Spanish v6.104

Requires v6.103. Adds Español to the runtime language choice and builder default-language selector. Both the widget and builder settings use Spanish, with the same translated surfaces and external-text limitations as v6.103.

The catalog explicitly translates all 1,070 runtime entries and 150 builder entries. Placeholder parity is checked against English. Brands, protocol identifiers and units remain intact. Spanish is an assisted translation draft; native editorial review has not been performed. Regional es-* app locales select the shared Spanish catalog; this release does not offer regional wording variants.

Spanish runtime and builder catalogs are separate dynamic imports. English users do not download Spanish; runtime users do not need the builder catalog. Isolated optimized catalog estimates: runtime 61,958 bytes / 18,813 gzip; builder 11,608 bytes / 4,626 gzip. These are text-only catalog estimates, not measured full-widget transfer deltas. No fonts, icons or translation framework were added.

The saved preference and builder-override policy now accept es. Existing en/tr/auto values retain their meaning. Unsupported languages continue to fall back to English. Builder help no longer describes obsolete pilot-only coverage. Request values, image IDs, category values, custom notes, layer data and map selection/hover algorithms are unchanged.

Validation: fourteen localization checks (catalog keys, placeholders, syntax, regional locale normalization, override policy, three-language notice translation); Chromium runtime test (lazy requests, English/Turkish/Spanish switching, persistent preference, es-MX automatic selection, locked builder policy, comparison state without image refetch, failed catalog download fallback and recovery after reload); Chromium builder test (Spanish headings, language round trips, routing settings and custom categories retained); Experience Builder development build passed.

A direct native-ES-module fixture caches a failed dynamic import until reload. Recovery after reload is tested; in-place retry after a failed download was not validated against the webpack application in this release. External ArcGIS/Mapillary controls, remote technical errors and user/service data may retain their original language. No production-app end-to-end or native editorial certification is claimed.

Install in the widget root: `node apply-spanish-language-v6-104.cjs`. Uninstall: `node apply-spanish-language-v6-104.cjs --uninstall`. The guarded installer checks conflicts before writing and supports exact rollback to v6.103.


## docs/history/localization-review.md

# Language startup correction v6.105

Requires v6.104. Catalog entry parity was accurate, but did not establish equivalent first-paint behavior. The provider always initialized with English and explicitly reset to English before fetching a non-English catalog. A splash screen could finish while the catalog was loading. This affected both Turkish and Spanish, particularly cold Spanish downloads.

A small eager startup catalog now supplies the complete splash copy and language controls for Turkish and Spanish on the first render. Full runtime and builder catalogs remain dynamic imports. Previously loaded immutable catalogs are reused on remount. Switching to an uncached language keeps the previous translation while the next catalog loads, instead of resetting to English. Failed loads still fall back to English. Saved runtime preferences and builder override policy retain their existing meaning.

Language names now follow the displayed UI language in both selectors: English shows English/Turkish/Spanish; Turkish shows İngilizce/Türkçe/İspanyolca; Spanish shows Inglés/Turco/Español. The previous native-language names were deliberate labels, not a missing Spanish translation, but did not match the requested presentation.

The eager subset also includes initial builder heading labels. Remaining non-startup controls may use English fallback on a cold load until their full catalog arrives; this patch does not eagerly bundle all 1,220 translations. External SDK/service text and compound technical errors retain the limitations documented in v6.103. Spanish wording has not received native editorial certification.

Validation: fifteen localization checks including startup/full-catalog consistency and localized language names; Chromium with Spanish and Turkish chunk downloads held pending verifies the translated splash before releasing either catalog; expanded Spanish controls and place counts, unchanged custom categories, English/Turkish/Spanish round trips, stored Spanish reload; builder routing/custom-category persistence and Spanish headings; Experience Builder development build; guarded installer dry-run/install/idempotence/exact uninstall/conflict-before-writes. No changes to runtime widget logic, hover picking, map graphics or imagery requests.

Install from widget root: `node apply-language-startup-v6-105.cjs`. Undo: `node apply-language-startup-v6-105.cjs --uninstall`.


## docs/history/localization-review.md

# Traditional Chinese (Taiwan) v6.114

Requires v6.113. Adds Chinese (Traditional, Taiwan), configured and saved as zh-TW, to the runtime and builder language selectors. Language names follow the displayed language, including 繁體中文（台灣） and English Chinese (Traditional, Taiwan).

Catalog scope: all 1,070 runtime and 150 builder entries have corresponding nonempty translations and matching placeholders. Coverage matches the existing Turkish and Simplified Chinese catalog key sets. Startup splash and small builder heading subsets are available before the full lazy downloads. Catalog parity does not prove every externally rendered string is translated: external SDK/service strings, arbitrary user content and compound technical-error boundaries remain as documented in v6.103.

Translation preparation used an offline OpenCC s2twp scaffold followed by contextual terminology review and per-message edits against the English source. Taiwan wording includes 影像, 影格, 圖磚, 圖徵, 本機, 伺服器, 預設, 品質, 匯入 and 中繼資料. Navigation, map controls, local storage, note counters, route-service settings and startup copy received contextual edits. This is an assisted translation without native editorial certification; a Taiwan native-speaker review is recommended before claiming professional translation quality. No converter or conversion dependency is shipped. Stored enums, categories, user notes, protocol identifiers, brands and request values are preserved. Chinese has no Title Case distinction.

Automatic locale detection: explicit Hant selects zh-TW, explicit Hans selects zh-CN, and script wins over region (zh-Hans-TW remains Simplified; zh-Hant-CN uses Traditional). Without a script, TW/HK/MO use the Taiwan catalog; bare zh, CN and SG retain Simplified. The Traditional fallback uses Taiwan wording, not separately localized Hong Kong or Macao terminology. Unicode extensions do not override script classification. Unsupported explicit scripts and malformed Chinese tags safely fall back to English. Canonical stored preferences are zh-TW and zh-CN. Both catalogs stay separate and lazy loaded.

An explicit builder language always overrides saved viewer preferences and disables the inside selector at the same value. Viewer choice is available only when the builder uses App language and permits it. Startup strings appear immediately; other non-startup controls may briefly use English fallback during a cold download. Failed downloads retain the existing English fallback. The Unicode notice matcher supports all eleven languages, including parameter reordering and language switches.

Uses system/browser fonts; no font files are bundled or downloaded. The test machine has Noto CJK fonts. Font metrics differ by platform. Isolated optimized text estimates: Taiwan runtime 80,290 bytes / 19,535 gzip; builder 14,819 bytes / 5,031 gzip. The eager startup module across all supported languages and localized language names is 15,547 bytes / 4,896 gzip, an incremental 2,150 bytes / 489 gzip over v6.113. These are catalog estimates, not production app transfer measurements.

Validation: 50 localization tests passed, covering all keys/placeholders and TypeScript syntax; startup/full catalog parity; script/region precedence; unsupported and malformed locale fallback; eleven builder choices against every saved preference and choice policy; eleven-language notice round trips; reordered Chinese parameters; literal user data; Taiwan Gregorian date/number formatting; and regional terminology safeguards. Experience Builder development build passed (local SDK 5.0.4).

Chromium component fixtures passed: translated first paint while the Taiwan catalog download is held; builder Taiwan overriding saved Spanish and a blocked viewer override; eleven-language comparison switching with unchanged slider state and no extra imagery load calls; edited-note and custom-category preservation; saved zh-TW after navigation; automatic zh-Hant-TW; explicit Hans-TW requesting Simplified without Taiwan until the builder overrides it; separate lazy runtime and settings imports; failed download English fallback and recovery after reload; builder headings and Spanish/Taiwan round trip preserving OSRM setting, URL and category data. Compact place buttons have no horizontal overflow and the splash heading fits at 320 px. The narrow screenshot was visually inspected. No runtime font-file requests occurred.

These fixtures render real components with mocked Experience Builder UI wrappers, not a fully deployed application. Narrow checks cover tested place buttons and splash, not every panel or system font. Reload recovery is tested; in-place retry after a failed module import is not certified against production webpack. Existing full Simplified Chinese catalogs remain byte-identical. No map graphics, picking, hover, marker, coverage, animation or imagery-request algorithms change.

Install from widget root: `node apply-traditional-chinese-taiwan-v6-114.cjs`. Undo: `node apply-traditional-chinese-taiwan-v6-114.cjs --uninstall`. Guarded dry-run, installation, repeat installation, byte-exact uninstall and conflict-before-writes are checked. Preserve the preceding v6.113 installation before applying this patch.
