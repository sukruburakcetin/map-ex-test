# Search the notes panel

The Local and Enterprise tabs now include a search field, clear button and live matching count. Matching covers note text, category, resolution and raw/localized status, without requiring exact case or accents. All whitespace-separated terms must match; terms can occur in different fields. The input is literal text, not a regular expression or SQL query.

Local search covers the complete local collection. Enterprise search explicitly covers only records loaded in that tab. It does not search the entire organization service. Load more remains available even when the current pages have no matches; newly loaded pages join the same query. Typing never starts a server query, polls, changes map markers or mutates stored notes.

Use the clear button or Escape to reset the query. The clear button returns focus to the search input. Counts follow the active language's number formatting, with all new strings included in the existing 13 supported language choices (British English inherits the English strings). Search fields fit compact panels and inherit RTL direction.

## Preserve source actions

A filtered row still uses its original note object/ID for Show on map, editing, sharing, attachments and deletion. Export, Import and confirmed Clear Local continue to use the complete local collection. Search is display-only and must never become an authoritative collection. Query state is transient and resets when its list unmounts, including tab switches.

## Contributor owners

- `src/features/field-notes/noteSearch.ts`: normalization and pure matching.
- `src/features/field-notes/NotesSearchControls.tsx`: accessible controlled search UI.
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

## Case-insensitive module resolution correction

The first delivery used `NoteSearch.tsx` for the component and `noteSearch.ts` for matching. With case-insensitive filename lookup and `.ts` before `.tsx`, importing `./NoteSearch` could resolve to the matching helper, which has no component export. React then received undefined and raised error #130. The browser fixture originally preferred `.tsx` and did not expose this platform difference.

The component now lives at `NotesSearchControls.tsx`, distinctly named from the helper. Both lists import that exact module. A guarded hotfix removes the unchanged old component, creates the distinctly named replacement and updates imports. The browser fixture uses `.ts` before `.tsx` and supports `NOTE_SEARCH_CASE_INSENSITIVE=1`; all fourteen interaction checks pass under that simulated resolution policy. Three module-resolution checks reproduce the old misresolution and verify unique stems/current exports. No search behavior, localization or stored note data changes.

If the first search installer is already installed, apply `apply-notes-search-render-fix.cjs`, then rebuild/reload. For a fresh installation use `apply-notes-search-fixed.cjs`. Keep the corresponding uninstaller and backups. Reverse the render hotfix before trying to uninstall the older original search installer; guards intentionally refuse modified targets.

## Distinguish workflow state from actions

Local and Enterprise note rows now put the translated `Status` label and current workflow value on their own row. The value uses a compact, borderless, non-interactive pill; navigation and edit buttons occupy the next row and can wrap independently. This prevents `Open` from looking like an instruction to open imagery. Stored status values, filtering, service fields and action callbacks are unchanged. Existing language keys provide all wording; RTL and long status text can wrap within the panel.

Apply `apply-note-status-clarity.cjs` after the notes-search render fix, then rebuild/reload. Its standalone uninstaller restores only this presentation change. The expanded browser fixture passes 16 checks, including explicit status labels and non-interactive styling in both sources.
