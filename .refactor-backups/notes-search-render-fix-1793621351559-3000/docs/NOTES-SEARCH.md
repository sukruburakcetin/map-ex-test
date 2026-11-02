# Search the notes panel

The Local and Enterprise tabs now include a search field, clear button and live matching count. Matching covers note text, category, resolution and raw/localized status, without requiring exact case or accents. All whitespace-separated terms must match; terms can occur in different fields. The input is literal text, not a regular expression or SQL query.

Local search covers the complete local collection. Enterprise search explicitly covers only records loaded in that tab. It does not search the entire organization service. Load more remains available even when the current pages have no matches; newly loaded pages join the same query. Typing never starts a server query, polls, changes map markers or mutates stored notes.

Use the clear button or Escape to reset the query. The clear button returns focus to the search input. Counts follow the active language's number formatting, with all new strings included in the existing 13 supported language choices (British English inherits the English strings). Search fields fit compact panels and inherit RTL direction.

## Preserve source actions

A filtered row still uses its original note object/ID for Show on map, editing, sharing, attachments and deletion. Export, Import and confirmed Clear Local continue to use the complete local collection. Search is display-only and must never become an authoritative collection. Query state is transient and resets when its list unmounts, including tab switches.

## Contributor owners

- `src/features/field-notes/noteSearch.ts`: normalization and pure matching.
- `src/features/field-notes/NoteSearch.tsx`: accessible controlled search UI.
- `src/styles/noteSearch.ts`: compact layout and theme styling.
- LocalNotesList/EnterpriseNotesList: query state and memoized visible rows; existing mutations/paging remain with their owners.
- `src/i18n/messages.ts`, language catalogs and community translation CSV: shared translations.

No runtime/widget.tsx change is required.

## Validation

Seven matching tests cover blank input, case/accents, multi-field terms, literal punctuation, Turkish case folding, default/localized statuses, identity/order preservation and new pages. Fourteen real React/Chromium checks cover local results, keyboard/clear focus, empty results, original-row actions, full-source export, deletion under a query, Enterprise scope/paging with no request per keystroke, a 240 px host, Arabic switching and map-click isolation.

The language/catalog/table tests verify keys, placeholders and translation-table round trips. Four older localNoteCollection clear-feedback fixture tests fail identically on the untouched GitHub baseline because their frozen JSX expectations predate OwnedMessage localization; this feature does not change that owner. Do not claim the full repository test suite passes. A full Experience Builder build and live-host layout check remain separate.

Run from the widget root, with TypeScript available:

    node tests/noteSearch.test.cjs

For a nonstandard compiler path, set `MAPILLARY_TYPESCRIPT=/path/to/typescript.js`. The browser fixture additionally needs Playwright, Chromium and React 18 UMD files:

    REACT_UMD_PATH=/path/to/react.development.js REACT_DOM_UMD_PATH=/path/to/react-dom.development.js node tests/noteSearch.browser.cjs

Optional browser tool paths: `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`. Fixtures use synthetic records and controlled page loading, not an authenticated Enterprise service.

## Install and rollback

From the widget root outside `src`:

    node apply-notes-search.cjs

Rebuild and reload Experience Builder. `--dry-run` checks compatibility without writing source. The installer does not run tests or a host build. The standalone uninstaller restores the exact pre-install files and removes newly created search helpers/tests/docs. It refuses changed targets rather than overwriting later edits. Existing hover/click fixes remain untouched.
