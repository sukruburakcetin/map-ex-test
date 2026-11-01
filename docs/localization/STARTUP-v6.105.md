# Language startup correction v6.105

Requires v6.104. Catalog entry parity was accurate, but did not establish equivalent first-paint behavior. The provider always initialized with English and explicitly reset to English before fetching a non-English catalog. A splash screen could finish while the catalog was loading. This affected both Turkish and Spanish, particularly cold Spanish downloads.

A small eager startup catalog now supplies the complete splash copy and language controls for Turkish and Spanish on the first render. Full runtime and builder catalogs remain dynamic imports. Previously loaded immutable catalogs are reused on remount. Switching to an uncached language keeps the previous translation while the next catalog loads, instead of resetting to English. Failed loads still fall back to English. Saved runtime preferences and builder override policy retain their existing meaning.

Language names now follow the displayed UI language in both selectors: English shows English/Turkish/Spanish; Turkish shows İngilizce/Türkçe/İspanyolca; Spanish shows Inglés/Turco/Español. The previous native-language names were deliberate labels, not a missing Spanish translation, but did not match the requested presentation.

The eager subset also includes initial builder heading labels. Remaining non-startup controls may use English fallback on a cold load until their full catalog arrives; this patch does not eagerly bundle all 1,220 translations. External SDK/service text and compound technical errors retain the limitations documented in v6.103. Spanish wording has not received native editorial certification.

Validation: fifteen localization checks including startup/full-catalog consistency and localized language names; Chromium with Spanish and Turkish chunk downloads held pending verifies the translated splash before releasing either catalog; expanded Spanish controls and place counts, unchanged custom categories, English/Turkish/Spanish round trips, stored Spanish reload; builder routing/custom-category persistence and Spanish headings; Experience Builder development build; guarded installer dry-run/install/idempotence/exact uninstall/conflict-before-writes. No changes to runtime widget logic, hover picking, map graphics or imagery requests.

Install from widget root: `node apply-language-startup-v6-105.cjs`. Undo: `node apply-language-startup-v6-105.cjs --uninstall`.
