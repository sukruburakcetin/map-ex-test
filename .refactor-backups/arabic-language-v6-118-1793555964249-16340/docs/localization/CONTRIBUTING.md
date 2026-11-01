# Help improve Mapillary Explorer translations

You can review translations without editing TypeScript. Open [translations.csv](translations.csv) in Excel, LibreOffice Calc, Google Sheets or a UTF-8 text editor. It contains **1,232 rows** with US English and all eleven translated/UK variants alongside one another:

- `runtime`: 1,070 messages used by the widget.
- `settings`: 150 builder labels and help messages.
- `names`: 12 language names as shown in each UI language.

Filter by `scope`, search the English wording, and edit the language column you know. The locale columns are `en-GB`, `tr`, `es`, `fr`, `de`, `pt-BR`, `it`, `ja`, `ko`, `zh-CN` and `zh-TW`. The `en` column is the US English source/reference wording. UK English inherits it with small overrides. The legacy `en` source ID remains stable; the language list labels it English (US).

## For reviewers

1. Download or open the latest table from the branch you are reviewing. When opening a spreadsheet, import it as **UTF-8, comma separated**, with **all columns treated as text**. The export has a UTF-8 BOM for spreadsheet compatibility. Keep identifiers, placeholders, leading symbols and line breaks intact.
2. Edit only your language's translation cells. Keep `scope`, `key`, `en`, language column headers and every row. Sorting complete rows is supported; sorting a single language column separately would misalign translations. Keep the complete table when saving.
3. Preserve placeholders exactly, including braces and spelling: `{count}`, `{date}`, `{value0}`, etc. You may reorder them for natural grammar, but do not remove, add or rename them. Preserve technical identifiers and units where appropriate.
4. Save as **CSV UTF-8**, not XLSX or a semicolon-separated regional CSV variant. Quotes, commas and multiline text are supported by the import tool. Do not invent new message keys in a translation edit.
5. Submit a pull request with the edited table, the language reviewed, a brief reason for the changes and relevant screenshots or steps. If you do not use Git, attach the edited CSV to an issue so a maintainer can import the corrections. Never include private notes, access tokens or user data in examples.

Example: the row `runtime,timeTravel` controls the Time travel label. `settings,generalSettings` controls the General Settings heading. `names,zh-TW` controls the name of Traditional Chinese (Taiwan) in every UI language. The same English word may have different keys because grammatical context differs; review it in the actual UI.

Use the [glossary](GLOSSARY.md) as a starting point and describe terminology changes in the PR. Language fluency and in-product context matter more than literal word substitution. Distinguish images/captures, sequences/routes, image bearing/map heading, active selections/previews and local/shared notes. Preserve Mapillary, Overture Maps and other proper names. Chinese `zh-TW` uses Taiwan wording; `zh-CN` uses Simplified Chinese. Do not translate arbitrary user notes, custom categories or place names.

## For maintainers

Catalogs in `src/i18n/locales` remain the runtime source of truth. The CSV is a tracked review/export artifact, never imported by the widget bundle. TypeScript must be resolvable by Node for the developer tools. If necessary, set `MAPILLARY_TYPESCRIPT` to the installed TypeScript module path, such as `/path/to/node_modules/typescript`.

First inspect a contributor's changes without writing files:

```sh
node tools/translation-table.cjs import path/to/reviewed.csv
```

The command prints each changed scope/key/language with before/after text. It checks the entire table before writing anything: known unique rows, exact columns, complete row coverage, unchanged English source, nonempty translations, placeholder parity and text integrity. English source changes cause rejection, so request a refreshed table if the English text has changed since export. Translation conflicts on other columns still need normal Git/PR review; this is not a three-way merge tool.

Apply the reviewed changes:

```sh
node tools/translation-table.cjs import path/to/reviewed.csv --write
node tools/check-localization-catalogs.cjs
node --test tests/localizationCatalog.test.cjs tests/translationTable.test.cjs tests/regionalLocales.test.cjs
```

The importer preserves UK files as sparse overrides: a UK cell equal to the US source inherits it without storing a duplicate. Other languages retain complete catalogs. The importer updates only changed locale catalogs, the tracked CSV, and any affected startup labels or language names in `startupMessages.ts`. This keeps the first-paint splash and builder headings synchronized. It does not publish, commit or fetch anything. All semantic validation runs before writes, and the tool attempts to restore originals if a filesystem write fails. Use a clean branch and review the resulting source diff before merging. The CSV-only contribution needs this import step before the consistency check will pass.

When changing catalogs directly or adding English source text, regenerate and check the table:

```sh
node tools/translation-table.cjs export docs/localization/translations.csv
node tools/translation-table.cjs check docs/localization/translations.csv
```

English/runtime source messages are in `messages.ts`, `runtimeMessages.ts` and `completionMessages.ts`; builder source is `settingsMessages.ts`. For UI context, search the key in `src`, or search its English phrase for text routed through owned presentation helpers. The historical `completeNNN` IDs are stable message IDs, not a separate application feature. Do not renumber them. New languages need their catalogs, locale registration, startup subset, language names and tests added before table export.

Non-English runtime catalogs use one main file per language (`tr.ts`, `es.ts`, `de.ts`, etc.). Builder catalogs remain separate (`settings-tr.ts`, `settings-es.ts`, etc.). Turkish's former `runtime-tr.ts` and `completion-tr.ts` were merged into `tr.ts` without changing any message value. Full catalogs stay lazy-loaded; no translation table, contribution tooling, documentation or extra fonts are shipped in runtime chunks.

## Review checklist

Check the splash and language selector; builder labels/help; compact filters and dates; hover previews; Time travel comparison; nearby place details; field-note create/import/share/error flows; routing; and point-cloud/elevation tools. Look for truncation, awkward grammar, inconsistent terminology, counters and accessibility labels. Confirm edited fields, custom categories and image selections survive switching languages. Validate on the deployed app as well as component fixtures when possible. External SDK/server text and arbitrary user content are not part of this table.

Catalog parity and automated checks do not certify native fluency. Keep the PR's review scope and remaining uncertainties explicit.
