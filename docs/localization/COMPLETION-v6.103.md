# Localization closure v6.103

Requires v6.102. Adds 457 bilingual presentation templates (1,070 runtime keys and 150 builder keys). Turkish remains a translation draft requiring native editorial review.

Owned React feedback, hover-card fallback text, place details, profile labels, legend labels, default note-category choices and built-in object labels now use the selected locale. Default category values, custom categories, user notes, proper names, request values and IDs remain unchanged. Date and number formatting uses Intl with the widget locale. Open owned DOM labels refresh without rebuilding imagery or map layers.

Validation: catalog parity and placeholders; ten localization checks; Chromium runtime and builder language switching; open Enterprise popup labels, status and date switching with literal user content; Experience Builder development build; installer dry-run, installation, repeat installation, exact rollback and conflict detection. The limited standalone name check leaves only existing SDK IHandle globals. This is not a full TypeScript typecheck or a GPU performance benchmark.

The repeat AST scan found zero remaining UI candidates and zero locale formatter candidates under its current rules (previously 185 and 22). That is not proof that every rendered string is translated. Error constructors remain English deliberately: cancellation, authorization and retry classification depend on them. Known error messages are translated at owned presentation boundaries; compound and remote server details can remain English and require scenario verification. Twenty-nine source label candidates and fifty taxonomy candidates are catalogued, but private layer titles and external taxonomy fallback names can remain unchanged. Host ArcGIS/Mapillary SDK controls, authentication pages, server-supplied data, custom categories and user content are outside this widget catalog.

The language remains a lazy-loaded text chunk; there are no translation libraries, icon assets or fonts added. Hover picking, image identities and animation algorithms are unchanged; the hover card receives only the presentation scope.

Install from the widget root: `node apply-localization-closure-v6-103.cjs`. Roll back: `node apply-localization-closure-v6-103.cjs --uninstall`.
