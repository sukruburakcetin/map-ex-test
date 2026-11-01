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
