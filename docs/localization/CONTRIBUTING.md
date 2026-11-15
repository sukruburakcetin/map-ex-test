# Contributing translations

Help improve Mapillary Explorer's widget and builder settings in your language. You can review and correct translations using a spreadsheet, without editing TypeScript.

## Supported languages

| Language | Translation table column |
|---|---|
| English (US) - source language | `en` |
| English (UK) | `en-GB` |
| Arabic - Modern Standard Arabic | `ar` |
| Turkish | `tr` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |
| Portuguese (Brazil) | `pt-BR` |
| Italian | `it` |
| Japanese | `ja` |
| Korean | `ko` |
| Chinese (Simplified) | `zh-CN` |
| Chinese (Traditional, Taiwan) | `zh-TW` |

Both the widget and builder settings support these languages. Arabic uses right-to-left text. Regional date and number formatting follows the resolved locale. App language follows Experience Builder; unsupported app languages fall back to English (US). An explicit builder language takes priority over viewer preferences.

## Find and edit a translation

Open [translations.csv](translations.csv) in Excel, LibreOffice Calc, Google Sheets or a UTF-8 text editor. The table contains **1,233 message rows**, with US English and every supported translation side by side:

| Scope | Contents | Rows |
|---|---|---:|
| `runtime` | Widget messages and controls | 1,070 |
| `settings` | Builder labels and help text | 150 |
| `names` | Language names displayed in each UI language | 13 |

Each row has a `scope`, a stable `key`, the English source in `en`, and a column for each other language. Filter by scope or search the English wording to find a message.

1. Open the latest table from the branch you are reviewing. Import it as **UTF-8, comma-separated**, with **all columns treated as text**.
2. Edit only the translation cells for your language. Keep the column headers, `scope`, `key`, English source and all rows intact. Sort complete rows only; sorting one column separately would misalign translations.
3. Preserve placeholders such as `{count}`, `{date}` and `{value0}` exactly. You may reorder them for natural grammar, but do not add, remove or rename them. Preserve technical identifiers, paths and units where required.
4. Save the complete table as **CSV UTF-8**, using commas as separators. Quoted text, commas within cells and multiline text are supported.
5. Submit a pull request with the edited table, the language reviewed, a brief explanation of the corrections and relevant screenshots or reproduction steps. You can also attach the edited CSV to an issue for a maintainer to import. Use examples without private notes, access tokens or personal data.

For example, `runtime,timeTravel` identifies the Time travel label, `settings,generalSettings` identifies the General Settings heading, and `names,zh-TW` identifies the displayed name of Traditional Chinese (Taiwan).

To suggest an English correction, identify the scope and key in your issue or pull request. Maintainers update the English source catalogs and regenerate the table.

## Translation guidance

Use natural wording suited to the actual interface. The same English word may have different keys because its meaning or grammatical context differs. Consult the [glossary](GLOSSARY.md) and explain terminology changes in your pull request.

- Distinguish images from captures, sequences from routes, image bearing from map heading, previews from active selections, and local notes from shared notes.
- Keep Mapillary, Overture Maps and other proper names unchanged. Do not translate user notes, custom categories or place names.
- Keep labels concise, while preserving their meaning and accessibility. Check longer wording in narrow panels.
- Use Modern Standard Arabic for `ar`. Review right-to-left layout, counters and mixed Arabic/Latin content in context.
- Use Simplified Chinese for `zh-CN` and Taiwan terminology for `zh-TW`.
- Review English (UK) spelling in context. For example, a length unit is a metre, while a parking device is a meter.

## Maintainer workflow

The source catalogs are authoritative; the CSV is the contributor review table. It is not loaded by the widget. The developer tools require TypeScript to be resolvable by Node. If necessary, set `MAPILLARY_TYPESCRIPT` to its installed module path, such as `/path/to/node_modules/typescript`.

### Validate proposed edits

```sh
node tools/translation-table.cjs import path/to/reviewed.csv
```

This command lists each proposed change with its scope, key, language and before/after text, without modifying files. Validation checks the complete table for known unique rows, correct columns, complete coverage, unchanged English source, nonempty translations, matching placeholders and text integrity.

If the English source has changed since export, ask the contributor to refresh their table. Review translation conflicts through the normal Git and pull-request process.

### Apply reviewed edits

```sh
node tools/translation-table.cjs import path/to/reviewed.csv --write
node tools/check-localization-catalogs.cjs
node --test tests/localizationCatalog.test.cjs tests/translationTable.test.cjs tests/regionalLocales.test.cjs tests/arabicLocale.test.cjs
```

The importer updates the affected catalogs, language names, startup text and checked-in CSV together. English (UK) stores only differences from US English; a UK cell equal to the source inherits the US text. Other translated catalogs contain every message explicitly.

Validation completes before writing. The tool attempts to restore original files if a filesystem write fails. Apply changes on a clean branch and inspect the source diff before merging. A CSV-only contribution needs this import step before the table consistency check will pass.

### Regenerate the review table

After editing catalogs directly or changing English source text:

```sh
node tools/translation-table.cjs export docs/localization/translations.csv
node tools/translation-table.cjs check docs/localization/translations.csv
```

### Locate source text

Runtime catalogs are in [src/i18n/locales](../../src/i18n/locales), with one file per language and separate `settings-*.ts` files for builder text. English source messages are in `messages.ts`, `runtimeMessages.ts` and `completionMessages.ts`; builder source text is in `settingsMessages.ts`. Startup labels and language names are in `startupMessages.ts`.

Search a key in `src` to locate its usage. For messages translated through presentation helpers, search the English phrase as well. Keep all existing message IDs, including `completeNNN` keys, unchanged.

To add a language, provide its runtime and builder catalogs, register its locale and language names, add its startup subset and tests, then regenerate the table. Account for regional formatting and text direction where applicable. Full translation catalogs are lazy-loaded.

## Review checklist

Check translations in the running application, including:

- Splash screen and language selector.
- Builder labels and help text.
- Compact filters, counters, dates and numbers.
- Hover previews, Time travel comparisons and place details.
- Field-note creation, editing, importing, sharing and error messages.
- Routing, elevation and point-cloud tools.
- Accessibility labels, keyboard controls and right-to-left layouts.

Look for clipping, awkward grammar, inconsistent terminology and incorrect grammatical forms. Confirm that switching languages preserves edited fields, custom categories and image selections. Describe the flows you reviewed and any remaining uncertainties in the pull request.

Automated checks verify catalog integrity; native reviewers assess wording and fluency. External SDK controls, server-supplied text and arbitrary user content are outside this translation table.
