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
