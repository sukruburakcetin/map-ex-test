#!/usr/bin/env node
'use strict';
/**
 * Notes panel search. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/features/field-notes/LocalNotesList.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import { OwnedMessage } from '../../i18n/WidgetLocale';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\nimport { noteListToolbarStyle, noteListToolbarActionsStyle, noteListImportStyle, noteListFileInputStyle, noteListExportStyle, noteListCloseStyle, noteListEmptyStyle, noteListCategoryStyle, noteListDeleteStyle, noteListShareStyle, getNoteStatusBadgeStyle, noteListResolutionStyle, noteListErrorStyle, noteListTextStyle } from '../../styles/fieldNotes';\n",
              "after": "import { OwnedMessage } from '../../i18n/WidgetLocale';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { NoteSearch } from './NoteSearch';\nimport { filterNotes } from './noteSearch';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\nimport { noteListToolbarStyle, noteListToolbarActionsStyle, noteListImportStyle, noteListFileInputStyle, noteListExportStyle, noteListCloseStyle, noteListEmptyStyle, noteListCategoryStyle, noteListDeleteStyle, noteListShareStyle, getNoteStatusBadgeStyle, noteListResolutionStyle, noteListErrorStyle, noteListTextStyle } from '../../styles/fieldNotes';\n"
            },
            {
              "label": "Notes search 2",
              "before": " const { t, formatLocale:locale } = useWidgetLocale();\n\n  const { notes, fileInputRef, isConfirmingClear, setIsConfirmingClear, onDeleteNote, onClearAll, onExport, onImportFile, onFocusNote, onCloseList } = props;\n  return (\n<div role=\"tabpanel\" aria-label={t('uiLocalNotes')} style={notesLocalPanelStyle}>\n                    {/* Fixed Header: Actions remain visible at all times */}\n",
              "after": " const { t, formatLocale:locale } = useWidgetLocale();\n\n  const { notes, fileInputRef, isConfirmingClear, setIsConfirmingClear, onDeleteNote, onClearAll, onExport, onImportFile, onFocusNote, onCloseList } = props;\n  const [query, setQuery] = React.useState('');\n  const visibleNotes = React.useMemo(() => filterNotes(notes, query, locale, {\n    open: t('uiStatusOpen'), in_progress: t('uiStatusProgress'), completed: t('uiStatusCompleted'), dismissed: t('uiStatusDismissed'),\n  }), [notes, query, locale, t]);\n  return (\n<div role=\"tabpanel\" aria-label={t('uiLocalNotes')} style={notesLocalPanelStyle}>\n                    {/* Fixed Header: Actions remain visible at all times */}\n"
            },
            {
              "label": "Notes search 3",
              "before": "                        </div>\n                    </div>\n\n                    {isConfirmingClear && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLocalRecordsWillBeRemovedEnterpriseNotesWill')} </div>}\n                    <div style={enterpriseRowsStyle}>\n                        {notes.length === 0 && (\n                            <div style={noteListEmptyStyle}>\n                                 {t('uiYouCanGetStartedByImportingAGeojson')} </div>\n                        )}\n                        {notes.slice().reverse().map(n => (\n                            <div\n                                key={n.id}\n                                style={{\n",
              "after": "                        </div>\n                    </div>\n\n                    <NoteSearch query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} />\n                    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={noteListEmptyStyle}>{t('notesSearchEmpty')}</div>}\n                    {isConfirmingClear && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLocalRecordsWillBeRemovedEnterpriseNotesWill')} </div>}\n                    <div style={enterpriseRowsStyle}>\n                        {notes.length === 0 && (\n                            <div style={noteListEmptyStyle}>\n                                 {t('uiYouCanGetStartedByImportingAGeojson')} </div>\n                        )}\n                        {visibleNotes.slice().reverse().map(n => (\n                            <div\n                                key={n.id}\n                                style={{\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/EnterpriseNotesList.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "/** Paged Enterprise records; mounted only for the open Enterprise tab. No automatic polling. */\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\nimport type { EnterpriseNotesLoader } from './enterpriseList';\n",
              "after": "/** Paged Enterprise records; mounted only for the open Enterprise tab. No automatic polling. */\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { NoteSearch } from './NoteSearch';\nimport { filterNotes } from './noteSearch';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\nimport type { EnterpriseNotesLoader } from './enterpriseList';\n"
            },
            {
              "label": "Notes search 2",
              "before": "    void load(0);\n    return () => { request.current?.abort(); };\n  }, [load, props.context, props.layerUrl]);\n  return <div role=\"tabpanel\" aria-label={t('uiEnterpriseNotes')} style={notesLocalPanelStyle}>\n    <div style={enterpriseToolbarStyle}><span>{t(notes.length===1?'uiEnterpriseCountOne':'uiEnterpriseCountMany',{count:new Intl.NumberFormat(locale).format(notes.length)})} </span>\n      <div><button type=\"button\" style={noteActionStyle} disabled={busy} onClick={() => void load(0)}> {t('uiRefresh')} </button>{' '}\n      <button type=\"button\" style={noteActionStyle} onClick={props.onClose} aria-label={t('uiCloseNotesList')}> {t('uiClose')} </button></div>\n    </div>\n    <p style={notesSourceHintStyle}> {t('uiOrganizationRecordsRefreshForLatestClearLocalKeeps')} </p>\n    {busy && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLoadingEnterpriseNotes')} </div>}\n    {error && <div role=\"alert\" style={enterpriseErrorStyle}>{t('uiEnterpriseLoadError')} <button type=\"button\" style={noteActionStyle} disabled={busy} onClick={() => void load(failedOffset)}> {t('uiRetry')} </button></div>}\n    {!busy && !error && notes.length === 0 && <div style={notesSourceHintStyle}> {t('uiNoEnterpriseNotesAreAvailableInThisLayer')} </div>}\n    <div style={enterpriseRowsStyle}>{notes.map(note => {\n      const validPosition = Number.isFinite(note.lon) && Number.isFinite(note.lat);\n      const canManage = !!note.sharedGlobalId && !!note.sharedLayerUrl;\n      return <div key={note.id} style={enterpriseRowStyle}>\n",
              "after": "    void load(0);\n    return () => { request.current?.abort(); };\n  }, [load, props.context, props.layerUrl]);\n  const [query, setQuery] = React.useState('');\n  const visibleNotes = React.useMemo(() => filterNotes(notes, query, locale, {\n    open: t('uiStatusOpen'), in_progress: t('uiStatusProgress'), completed: t('uiStatusCompleted'), dismissed: t('uiStatusDismissed'),\n  }), [notes, query, locale, t]);\n  return <div role=\"tabpanel\" aria-label={t('uiEnterpriseNotes')} style={notesLocalPanelStyle}>\n    <div style={enterpriseToolbarStyle}><span>{t(notes.length===1?'uiEnterpriseCountOne':'uiEnterpriseCountMany',{count:new Intl.NumberFormat(locale).format(notes.length)})} </span>\n      <div><button type=\"button\" style={noteActionStyle} disabled={busy} onClick={() => void load(0)}> {t('uiRefresh')} </button>{' '}\n      <button type=\"button\" style={noteActionStyle} onClick={props.onClose} aria-label={t('uiCloseNotesList')}> {t('uiClose')} </button></div>\n    </div>\n    <NoteSearch query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} loadedOnly />\n    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={notesSourceHintStyle}>{t('notesSearchEmpty')}</div>}\n    <p style={notesSourceHintStyle}> {t('uiOrganizationRecordsRefreshForLatestClearLocalKeeps')} </p>\n    {busy && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLoadingEnterpriseNotes')} </div>}\n    {error && <div role=\"alert\" style={enterpriseErrorStyle}>{t('uiEnterpriseLoadError')} <button type=\"button\" style={noteActionStyle} disabled={busy} onClick={() => void load(failedOffset)}> {t('uiRetry')} </button></div>}\n    {!busy && !error && notes.length === 0 && <div style={notesSourceHintStyle}> {t('uiNoEnterpriseNotesAreAvailableInThisLayer')} </div>}\n    <div style={enterpriseRowsStyle}>{visibleNotes.map(note => {\n      const validPosition = Number.isFinite(note.lon) && Number.isFinite(note.lat);\n      const canManage = !!note.sharedGlobalId && !!note.sharedLayerUrl;\n      return <div key={note.id} style={enterpriseRowStyle}>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/messages.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import { runtimeEn } from './runtimeMessages';\n/** English fallback catalog. Message keys stay stable when wording changes. */\nexport const en = {\n ...completionEn,\n ...runtimeEn,\n date:'Date', today:'Today', previousYear:'Previous year', nextYear:'Next year', previousMonth:'Previous month', nextMonth:'Next month',\n",
              "after": "import { runtimeEn } from './runtimeMessages';\n/** English fallback catalog. Message keys stay stable when wording changes. */\nexport const en = {\n  \"notesSearch\": \"Search notes\",\n  \"notesSearchPlaceholder\": \"Text, category, resolution or status\",\n  \"notesClearSearch\": \"Clear note search\",\n  \"notesSearchCount\": \"{shown} of {total} notes\",\n  \"notesSearchEmpty\": \"No notes match your search.\",\n  \"notesSearchLoadedScope\": \"Search covers loaded records. Load more to include additional notes.\",\n\n ...completionEn,\n ...runtimeEn,\n date:'Date', today:'Today', previousYear:'Previous year', nextYear:'Next year', previousMonth:'Previous month', nextMonth:'Next month',\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/README.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "- Read-only `group`, `layer` and `visible` accessors support existing Enterprise grouping and pending-marker visibility. Do not create a second authority in runtime. The old post-clear local-layer cleanup block was unreachable because clear unconditionally nulls that reference; it has been removed.\n\nThe owner adds no cloud/note cache, viewer update, timer, query, SDK-load sharing policy or draw cancellation/version rule. Function comments document borrowed resources, live/captured data and lifecycle boundaries. `tests/fieldNoteMap.test.cjs` compares actual adapters with frozen original methods and real descriptors across 2D/3D, concurrent loads, clear/replacement, visibility, suppression and failures. Host checks: local/shared grouping, group visibility, 2D/3D switches, pending marker visibility, repeated clear/reopen and local/shared graphic display.\n",
              "after": "- Read-only `group`, `layer` and `visible` accessors support existing Enterprise grouping and pending-marker visibility. Do not create a second authority in runtime. The old post-clear local-layer cleanup block was unreachable because clear unconditionally nulls that reference; it has been removed.\n\nThe owner adds no cloud/note cache, viewer update, timer, query, SDK-load sharing policy or draw cancellation/version rule. Function comments document borrowed resources, live/captured data and lifecycle boundaries. `tests/fieldNoteMap.test.cjs` compares actual adapters with frozen original methods and real descriptors across 2D/3D, concurrent loads, clear/replacement, visibility, suppression and failures. Host checks: local/shared grouping, group visibility, 2D/3D switches, pending marker visibility, repeated clear/reopen and local/shared graphic display.\n\n## Notes panel search\n\n`NoteSearch.tsx` owns only the controlled search field, clear/Escape behavior, live result count and loaded-record scope label. `noteSearch.ts` owns literal locale-aware, accent-insensitive matching across text, category, resolution and raw/localized status. All whitespace-separated terms must match, including across fields. The original records and their ordering remain unchanged; LocalNotesList retains newest-first rendering.\n\nBoth list components own transient query state and memoize their visible rows. Search never writes storage, changes map/viewer markers or starts a service request. Local search includes the complete local array. Enterprise search includes only pages loaded in that tab; its scope is explicit, paging remains available while filtering, and new pages participate automatically. Refresh, retry and context cancellation stay with the existing Enterprise list owner. Switching/unmounting a list resets its query.\n\nEdit/delete/focus/attachments still receive the original note ID/object. Import/export and confirmed Clear Local still operate on the complete local collection, not a filtered subset. Do not reuse the filtered rows as authoritative data. Search controls stop map-click propagation without preventing input focus or normal text editing. Strings use the shared translation catalogs and community CSV.\n\nVerification: `tests/noteSearch.test.cjs` checks matching and identity; `tests/noteSearch.browser.cjs` mounts the actual Local/Enterprise lists in Chromium with React to cover interactions, paging, compact layout and Arabic direction. No full Experience Builder host is needed for these focused tests. See `docs/NOTES-SEARCH.md` for dependency paths and limits.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "# Contributor-readiness roadmap\n\nThis supplements REFACTORING-PLAN.md with the remaining delivery order. It is a structural refactor of the existing ArcGIS Experience Builder/React widget, not a feature rewrite. Release configuration and CI remain a separate later task.\n\n## Current position\n\n",
              "after": "# Contributor-readiness roadmap\n\nThis supplements REFACTORING-PLAN.md with the remaining delivery order. It is a structural refactor of the existing ArcGIS Experience Builder/React widget, not a feature rewrite. Release configuration and CI remain a separate later task.\n\n## Notes panel search\n\nAdd feature-owned, localized search controls and pure matching for Local/Enterprise note lists. Search filters display rows only; source data, map/viewer markers, import/export/clear operations and authenticated Enterprise paging remain unchanged. Enterprise scope is explicitly limited to loaded records, with Load more retained. Text, category, resolution and raw/localized status support literal locale-aware matching. New function comments and `features/field-notes/README.md` document ownership. Browser coverage checks real controls, actions, paging and narrow/RTL layout. Runtime orchestration is untouched.\n\n## Current position\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/tr.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Turkish presentation catalog. Community edits: docs/localization/CONTRIBUTING.md. */\nconst tr: Messages = {\n  \"complete001\": \"Se\u00e7in\u2026\",\n  \"complete002\": \"En yak\u0131n kare bulunuyor{value0}\",\n  \"complete003\": \"{value0} \u00b7 Kurulu\u015f kimli\u011fi: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Turkish presentation catalog. Community edits: docs/localization/CONTRIBUTING.md. */\nconst tr: Messages = {\n  \"notesSearch\": \"Notlarda ara\",\n  \"notesSearchPlaceholder\": \"Metin, kategori, \u00e7\u00f6z\u00fcm veya durum\",\n  \"notesClearSearch\": \"Not aramas\u0131n\u0131 temizle\",\n  \"notesSearchCount\": \"{total} nottan {shown} tanesi\",\n  \"notesSearchEmpty\": \"Araman\u0131zla e\u015fle\u015fen not bulunamad\u0131.\",\n  \"notesSearchLoadedScope\": \"Arama y\u00fcklenen kay\u0131tlar\u0131 kapsar. Di\u011fer notlar\u0131 dahil etmek i\u00e7in daha fazla y\u00fckleyin.\",\n\n  \"complete001\": \"Se\u00e7in\u2026\",\n  \"complete002\": \"En yak\u0131n kare bulunuyor{value0}\",\n  \"complete003\": \"{value0} \u00b7 Kurulu\u015f kimli\u011fi: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/ar.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Modern Standard Arabic. Assisted draft; community native review is welcome. */\nconst ar: Messages = {\n  \"complete001\": \"\u062d\u062f\u062f...\",\n  \"complete002\": \"\u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u0642\u0631\u0628 \u0625\u0637\u0627\u0631{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u0638\u0645\u0629: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Modern Standard Arabic. Assisted draft; community native review is welcome. */\nconst ar: Messages = {\n  \"notesSearch\": \"\u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a\",\n  \"notesSearchPlaceholder\": \"\u0627\u0644\u0646\u0635 \u0623\u0648 \u0627\u0644\u0641\u0626\u0629 \u0623\u0648 \u0627\u0644\u062d\u0644 \u0623\u0648 \u0627\u0644\u062d\u0627\u0644\u0629\",\n  \"notesClearSearch\": \"\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a\",\n  \"notesSearchCount\": \"{shown} \u0645\u0646 {total} \u0645\u0644\u0627\u062d\u0638\u0629\",\n  \"notesSearchEmpty\": \"\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u062a\u0637\u0627\u0628\u0642 \u0628\u062d\u062b\u0643.\",\n  \"notesSearchLoadedScope\": \"\u064a\u0634\u0645\u0644 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0645\u062d\u0645\u0651\u0644\u0629. \u062d\u0645\u0651\u0644 \u0627\u0644\u0645\u0632\u064a\u062f \u0644\u062a\u0636\u0645\u064a\u0646 \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629.\",\n\n  \"complete001\": \"\u062d\u062f\u062f...\",\n  \"complete002\": \"\u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u0642\u0631\u0628 \u0625\u0637\u0627\u0631{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u0638\u0645\u0629: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/it.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Italian presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst it: Messages = {\n  \"complete001\": \"Seleziona\u2026\",\n  \"complete002\": \"Ricerca del fotogramma pi\u00f9 vicino{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID organizzazione: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Italian presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst it: Messages = {\n  \"notesSearch\": \"Cerca nelle note\",\n  \"notesSearchPlaceholder\": \"Testo, categoria, risoluzione o stato\",\n  \"notesClearSearch\": \"Cancella ricerca nelle note\",\n  \"notesSearchCount\": \"{shown} di {total} note\",\n  \"notesSearchEmpty\": \"Nessuna nota corrisponde alla ricerca.\",\n  \"notesSearchLoadedScope\": \"La ricerca include i record caricati. Caricane altri per includere ulteriori note.\",\n\n  \"complete001\": \"Seleziona\u2026\",\n  \"complete002\": \"Ricerca del fotogramma pi\u00f9 vicino{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID organizzazione: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/ja.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Japanese presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst ja: Messages = {\n  \"complete001\": \"\u9078\u629e\u2026\",\n  \"complete002\": \"\u6700\u3082\u8fd1\u3044\u30d5\u30ec\u30fc\u30e0\u3092\u691c\u7d22\u4e2d{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u7d44\u7e54ID: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Japanese presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst ja: Messages = {\n  \"notesSearch\": \"\u30e1\u30e2\u3092\u691c\u7d22\",\n  \"notesSearchPlaceholder\": \"\u672c\u6587\u3001\u30ab\u30c6\u30b4\u30ea\u3001\u5bfe\u5fdc\u5185\u5bb9\u3001\u30b9\u30c6\u30fc\u30bf\u30b9\",\n  \"notesClearSearch\": \"\u30e1\u30e2\u306e\u691c\u7d22\u3092\u30af\u30ea\u30a2\",\n  \"notesSearchCount\": \"{total} \u4ef6\u4e2d {shown} \u4ef6\",\n  \"notesSearchEmpty\": \"\u691c\u7d22\u306b\u4e00\u81f4\u3059\u308b\u30e1\u30e2\u306f\u3042\u308a\u307e\u305b\u3093\u3002\",\n  \"notesSearchLoadedScope\": \"\u8aad\u307f\u8fbc\u307f\u6e08\u307f\u306e\u30e1\u30e2\u3092\u691c\u7d22\u3057\u307e\u3059\u3002\u8ffd\u52a0\u306e\u30e1\u30e2\u3092\u542b\u3081\u308b\u306b\u306f\u3001\u3055\u3089\u306b\u8aad\u307f\u8fbc\u3093\u3067\u304f\u3060\u3055\u3044\u3002\",\n\n  \"complete001\": \"\u9078\u629e\u2026\",\n  \"complete002\": \"\u6700\u3082\u8fd1\u3044\u30d5\u30ec\u30fc\u30e0\u3092\u691c\u7d22\u4e2d{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u7d44\u7e54ID: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/pt-br.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Brazilian Portuguese presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst ptBR: Messages = {\n  \"complete001\": \"Selecionar\u2026\",\n  \"complete002\": \"Buscando o quadro mais pr\u00f3ximo{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID da organiza\u00e7\u00e3o: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Brazilian Portuguese presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst ptBR: Messages = {\n  \"notesSearch\": \"Pesquisar notas\",\n  \"notesSearchPlaceholder\": \"Texto, categoria, resolu\u00e7\u00e3o ou status\",\n  \"notesClearSearch\": \"Limpar pesquisa de notas\",\n  \"notesSearchCount\": \"{shown} de {total} notas\",\n  \"notesSearchEmpty\": \"Nenhuma nota corresponde \u00e0 pesquisa.\",\n  \"notesSearchLoadedScope\": \"A pesquisa abrange os registros carregados. Carregue mais para incluir outras notas.\",\n\n  \"complete001\": \"Selecionar\u2026\",\n  \"complete002\": \"Buscando o quadro mais pr\u00f3ximo{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID da organiza\u00e7\u00e3o: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/zh-cn.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Simplified Chinese presentation catalog; stored values and protocol identifiers remain unchanged. */\nconst zhCN: Messages = {\n  \"complete001\": \"\u9009\u62e9\u2026\",\n  \"complete002\": \"\u6b63\u5728\u67e5\u627e\u6700\u8fd1\u7684\u5e27{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u7ec4\u7ec7 ID\uff1a{value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Simplified Chinese presentation catalog; stored values and protocol identifiers remain unchanged. */\nconst zhCN: Messages = {\n  \"notesSearch\": \"\u641c\u7d22\u5907\u6ce8\",\n  \"notesSearchPlaceholder\": \"\u6587\u672c\u3001\u7c7b\u522b\u3001\u89e3\u51b3\u8bf4\u660e\u6216\u72b6\u6001\",\n  \"notesClearSearch\": \"\u6e05\u9664\u5907\u6ce8\u641c\u7d22\",\n  \"notesSearchCount\": \"\u5171 {total} \u6761\uff0c\u663e\u793a {shown} \u6761\",\n  \"notesSearchEmpty\": \"\u6ca1\u6709\u4e0e\u641c\u7d22\u5339\u914d\u7684\u5907\u6ce8\u3002\",\n  \"notesSearchLoadedScope\": \"\u4ec5\u641c\u7d22\u5df2\u52a0\u8f7d\u7684\u8bb0\u5f55\u3002\u52a0\u8f7d\u66f4\u591a\u4ee5\u5305\u542b\u5176\u4ed6\u5907\u6ce8\u3002\",\n\n  \"complete001\": \"\u9009\u62e9\u2026\",\n  \"complete002\": \"\u6b63\u5728\u67e5\u627e\u6700\u8fd1\u7684\u5e27{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u7ec4\u7ec7 ID\uff1a{value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/fr.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** French presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst fr: Messages = {\n  \"complete001\": \"S\u00e9lectionner\u2026\",\n  \"complete002\": \"Recherche de l\u2019image la plus proche{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID de l\u2019organisation : {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** French presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst fr: Messages = {\n  \"notesSearch\": \"Rechercher des notes\",\n  \"notesSearchPlaceholder\": \"Texte, cat\u00e9gorie, r\u00e9solution ou statut\",\n  \"notesClearSearch\": \"Effacer la recherche de notes\",\n  \"notesSearchCount\": \"{shown} sur {total} notes\",\n  \"notesSearchEmpty\": \"Aucune note ne correspond \u00e0 votre recherche.\",\n  \"notesSearchLoadedScope\": \"La recherche porte sur les enregistrements charg\u00e9s. Chargez-en davantage pour inclure d\u2019autres notes.\",\n\n  \"complete001\": \"S\u00e9lectionner\u2026\",\n  \"complete002\": \"Recherche de l\u2019image la plus proche{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID de l\u2019organisation : {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/zh-tw.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Traditional Chinese (Taiwan) presentation catalog; stored values and protocol identifiers remain unchanged. */\nconst zhTW: Messages = {\n  \"complete001\": \"\u9078\u53d6\u2026\",\n  \"complete002\": \"\u6b63\u5728\u5c0b\u627e\u6700\u8fd1\u7684\u5f71\u683c{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u7d44\u7e54 ID\uff1a{value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Traditional Chinese (Taiwan) presentation catalog; stored values and protocol identifiers remain unchanged. */\nconst zhTW: Messages = {\n  \"notesSearch\": \"\u641c\u5c0b\u5099\u8a3b\",\n  \"notesSearchPlaceholder\": \"\u6587\u5b57\u3001\u985e\u5225\u3001\u89e3\u6c7a\u8aaa\u660e\u6216\u72c0\u614b\",\n  \"notesClearSearch\": \"\u6e05\u9664\u5099\u8a3b\u641c\u5c0b\",\n  \"notesSearchCount\": \"\u5171 {total} \u7b46\uff0c\u986f\u793a {shown} \u7b46\",\n  \"notesSearchEmpty\": \"\u6c92\u6709\u7b26\u5408\u641c\u5c0b\u7684\u5099\u8a3b\u3002\",\n  \"notesSearchLoadedScope\": \"\u50c5\u641c\u5c0b\u5df2\u8f09\u5165\u7684\u8a18\u9304\u3002\u8f09\u5165\u66f4\u591a\u4ee5\u5305\u542b\u5176\u4ed6\u5099\u8a3b\u3002\",\n\n  \"complete001\": \"\u9078\u53d6\u2026\",\n  \"complete002\": \"\u6b63\u5728\u5c0b\u627e\u6700\u8fd1\u7684\u5f71\u683c{value0}\",\n  \"complete003\": \"{value0} \u00b7 \u7d44\u7e54 ID\uff1a{value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/es.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Spanish presentation catalog. Persisted values and protocol identifiers are unchanged. */\nconst es: Messages = {\n  \"complete001\": \"Seleccionar\u2026\",\n  \"complete002\": \"Buscando el fotograma m\u00e1s cercano{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID de organizaci\u00f3n: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Spanish presentation catalog. Persisted values and protocol identifiers are unchanged. */\nconst es: Messages = {\n  \"notesSearch\": \"Buscar notas\",\n  \"notesSearchPlaceholder\": \"Texto, categor\u00eda, resoluci\u00f3n o estado\",\n  \"notesClearSearch\": \"Borrar b\u00fasqueda de notas\",\n  \"notesSearchCount\": \"{shown} de {total} notas\",\n  \"notesSearchEmpty\": \"Ninguna nota coincide con la b\u00fasqueda.\",\n  \"notesSearchLoadedScope\": \"La b\u00fasqueda abarca los registros cargados. Cargue m\u00e1s para incluir otras notas.\",\n\n  \"complete001\": \"Seleccionar\u2026\",\n  \"complete002\": \"Buscando el fotograma m\u00e1s cercano{value0}\",\n  \"complete003\": \"{value0} \u00b7 ID de organizaci\u00f3n: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/ko.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** Korean presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst ko: Messages = {\n  \"complete001\": \"\uc120\ud0dd\u2026\",\n  \"complete002\": \"\uac00\uc7a5 \uac00\uae4c\uc6b4 \ud504\ub808\uc784 \uac80\uc0c9 \uc911{value0}\",\n  \"complete003\": \"{value0} \u00b7 \uc870\uc9c1 ID: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** Korean presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst ko: Messages = {\n  \"notesSearch\": \"\uba54\ubaa8 \uac80\uc0c9\",\n  \"notesSearchPlaceholder\": \"\ub0b4\uc6a9, \ubc94\uc8fc, \ud574\uacb0 \ub0b4\uc6a9 \ub610\ub294 \uc0c1\ud0dc\",\n  \"notesClearSearch\": \"\uba54\ubaa8 \uac80\uc0c9 \uc9c0\uc6b0\uae30\",\n  \"notesSearchCount\": \"\uba54\ubaa8 {total}\uac1c \uc911 {shown}\uac1c\",\n  \"notesSearchEmpty\": \"\uac80\uc0c9\uacfc \uc77c\uce58\ud558\ub294 \uba54\ubaa8\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.\",\n  \"notesSearchLoadedScope\": \"\ubd88\ub7ec\uc628 \uae30\ub85d\ub9cc \uac80\uc0c9\ud569\ub2c8\ub2e4. \uba54\ubaa8\ub97c \ub354 \ud3ec\ud568\ud558\ub824\uba74 \ucd94\uac00\ub85c \ubd88\ub7ec\uc624\uc138\uc694.\",\n\n  \"complete001\": \"\uc120\ud0dd\u2026\",\n  \"complete002\": \"\uac00\uc7a5 \uac00\uae4c\uc6b4 \ud504\ub808\uc784 \uac80\uc0c9 \uc911{value0}\",\n  \"complete003\": \"{value0} \u00b7 \uc870\uc9c1 ID: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/de.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "import type { Messages } from '../messages';\n/** German presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst de: Messages = {\n  \"complete001\": \"Ausw\u00e4hlen\u2026\",\n  \"complete002\": \"N\u00e4chstgelegenes Bild wird gesucht{value0}\",\n  \"complete003\": \"{value0} \u00b7 Organisations-ID: {value1}\",\n",
              "after": "import type { Messages } from '../messages';\n/** German presentation catalog; persisted values and protocol identifiers remain unchanged. */\nconst de: Messages = {\n  \"notesSearch\": \"Notizen durchsuchen\",\n  \"notesSearchPlaceholder\": \"Text, Kategorie, L\u00f6sung oder Status\",\n  \"notesClearSearch\": \"Notizensuche l\u00f6schen\",\n  \"notesSearchCount\": \"{shown} von {total} Notizen\",\n  \"notesSearchEmpty\": \"Keine Notizen entsprechen Ihrer Suche.\",\n  \"notesSearchLoadedScope\": \"Die Suche umfasst geladene Datens\u00e4tze. Laden Sie weitere Notizen, um sie einzubeziehen.\",\n\n  \"complete001\": \"Ausw\u00e4hlen\u2026\",\n  \"complete002\": \"N\u00e4chstgelegenes Bild wird gesucht{value0}\",\n  \"complete003\": \"{value0} \u00b7 Organisations-ID: {value1}\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/localizationCatalog.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "test('ten-language notices preserve Chinese parameter order, user text and Intl formatting',()=>{const catalogs=[en,tr,es,fr,de,ptBR,it,ja,ko,zhCN],translations=['2 notes imported','2 not i\u00e7e aktar\u0131ld\u0131','2 notas importadas','2 notes import\u00e9es','2 Notizen importiert','2 notas importadas','2 note importate','\u30ce\u30fc\u30c8\u30922\u4ef6\u30a4\u30f3\u30dd\u30fc\u30c8\u3057\u307e\u3057\u305f','\uba54\ubaa8 2\uac1c\ub97c \uac00\uc838\uc654\uc2b5\ub2c8\ub2e4','\u5df2\u5bfc\u51652\u6761\u7b14\u8bb0'];for(let i=0;i<catalogs.length;i++){const format=presentationFormatter(en,catalogs[i],catalogs);for(const source of translations)assert.equal(format(source),translations[i]);assert.equal(format('My custom category'),'My custom category');assert.equal(format('\u6211\u7684\u4e2a\u4eba\u5907\u6ce8'),'\u6211\u7684\u4e2a\u4eba\u5907\u6ce8');assert.equal(format('Mapillary Explorer'),'Mapillary Explorer')}assert.equal(presentationFormatter(en,en,[zhCN])('\u56fe\u50cf7\u7684 Graph API 403'),'Graph API 403 for image 7');const p=new PresentationText();p.update('zh-CN',presentationFormatter(en,zhCN));assert.equal(p.number(12345.5),'12,345.5');assert.equal(p.date(new Date('2026-11-01T12:00:00Z'),{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}),'2026\u5e7411\u67081\u65e5')});\n\nconst zhTW=load('locales/zh-tw.ts').default;\ntest('Traditional Chinese Taiwan covers every runtime and builder key/placeholder with valid syntax',()=>{const settings=load('locales/settings-zh-tw.ts').default,{settingsEn}=load('settingsMessages.ts'),tokens=s=>[...s.matchAll(/\\{([a-zA-Z][a-zA-Z0-9_]*)\\}/g)].map(x=>x[1]).sort();for(const[base,translated]of[[en,zhTW],[settingsEn,settings]]){assert.deepEqual(Object.keys(translated).sort(),Object.keys(base).sort());for(const key of Object.keys(base)){assert(translated[key].trim(),key);assert.deepEqual(tokens(translated[key]),tokens(base[key]),key)}}for(const file of ['locales/zh-tw.ts','locales/settings-zh-tw.ts'])assert.deepEqual(ts.createSourceFile(file,fs.readFileSync(path.join(__dirname,'../src/i18n',file),'utf8'),ts.ScriptTarget.Latest,true).parseDiagnostics,[]);assert.equal(Object.keys(zhTW).length,1070);assert.equal(Object.keys(settings).length,150);assert.equal(zhTW.uiFindYourPointOfView,'\u627e\u5230\u4f60\u7684\u8996\u89d2\u3002');assert.equal(settings.defaultWidgetLanguage,'\u9810\u8a2d\u5c0f\u5de5\u5177\u8a9e\u8a00');assert.equal(zhTW.uiSave,'\u5132\u5b58')});\ntest('Chinese script overrides region and all eleven explicit builder choices override saved preferences',()=>{for(const locale of ['zh-TW','ZH_tw','zh-HK','zh-MO','zh-Hant','zh-Hant-CN','zh-Hant-SG','zh-Hant-TW-u-ca-chinese','zh-HK-u-ca-gregory'])assert.equal(languageOf(locale),'zh-TW',locale);for(const locale of ['zh','zh-CN','zh-SG','zh-Hans-TW','zh-Hans-MO','zh-CN-u-rg-twzzzz'])assert.equal(languageOf(locale),'zh-CN',locale);for(const locale of ['zh-Latn-TW','zh-Latn-CN','zh-!!!','zh--TW','tw'])assert.equal(languageOf(locale),'en',locale);assert.equal(preferenceOf('zh-TW'),'zh-TW');assert.equal(preferenceOf('zh-tw'),'auto');const{requestedLanguage}=load('core.ts',()=>({en})),languages=['en','tr','es','fr','de','pt-BR','it','ja','ko','zh-CN','zh-TW'];for(const builder of languages)for(const saved of ['auto',...languages])for(const allowed of [true,false])assert.equal(requestedLanguage('zh-Hans-TW',builder,saved,allowed),builder);assert.equal(requestedLanguage('zh-Hant-TW','auto','auto',true),'zh-TW');assert.equal(requestedLanguage('en','auto','zh-TW',true),'zh-TW');assert.equal(requestedLanguage('zh-Hans','auto','zh-TW',false),'zh-CN')});\ntest('Taiwan startup text matches full catalogs and language names follow every displayed language',()=>{const{startupMessages,startupSettings,languageName}=load('startupMessages.ts'),settings=load('locales/settings-zh-tw.ts').default;for(const[key,value]of Object.entries(startupMessages['zh-TW']))assert.equal(value,zhTW[key],key);for(const[key,value]of Object.entries(startupSettings['zh-TW']))assert.equal(value,settings[key],key);assert.equal(languageName('en','zh-TW'),'Chinese (Traditional, Taiwan)');assert.equal(languageName('zh-TW','zh-TW'),'\u7e41\u9ad4\u4e2d\u6587\uff08\u53f0\u7063\uff09');assert.equal(languageName('zh-TW','zh-CN'),'\u7c21\u9ad4\u4e2d\u6587');assert.equal(languageName('zh-CN','zh-TW'),'\u7e41\u4f53\u4e2d\u6587\uff08\u53f0\u6e7e\uff09');assert.equal(languageName('ja','zh-TW'),'\u4e2d\u56fd\u8a9e\uff08\u7e41\u4f53\u5b57\u30fb\u53f0\u6e7e\uff09');assert.equal(languageName('ko','zh-TW'),'\uc911\uad6d\uc5b4(\ubc88\uccb4, \ub300\ub9cc)')});\ntest('eleven-language notices preserve Taiwan parameters, user text and Gregorian Intl formats',()=>{const catalogs=[en,tr,es,fr,de,ptBR,it,ja,ko,zhCN,zhTW],translations=['2 notes imported','2 not i\u00e7e aktar\u0131ld\u0131','2 notas importadas','2 notes import\u00e9es','2 Notizen importiert','2 notas importadas','2 note importate','\u30ce\u30fc\u30c8\u30922\u4ef6\u30a4\u30f3\u30dd\u30fc\u30c8\u3057\u307e\u3057\u305f','\uba54\ubaa8 2\uac1c\ub97c \uac00\uc838\uc654\uc2b5\ub2c8\ub2e4','\u5df2\u5bfc\u51652\u6761\u7b14\u8bb0','\u5df2\u532f\u51652\u5247\u7b46\u8a18'];for(let i=0;i<catalogs.length;i++){const format=presentationFormatter(en,catalogs[i],catalogs);for(const source of translations)assert.equal(format(source),translations[i]);assert.equal(format('My custom category'),'My custom category');assert.equal(format('\u6211\u7684\u79c1\u4eba\u7b46\u8a18'),'\u6211\u7684\u79c1\u4eba\u7b46\u8a18');assert.equal(format('Mapillary Explorer'),'Mapillary Explorer')}assert.equal(presentationFormatter(en,en,[zhTW])('\u5f71\u50cf7\u7684 Graph API 403'),'Graph API 403 for image 7');const p=new PresentationText();p.update('zh-TW',presentationFormatter(en,zhTW));assert.equal(p.number(12345.5),'12,345.5');assert.equal(p.date(new Date('2026-11-01T12:00:00Z'),{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}),'2026\u5e7411\u67081\u65e5')});\ntest('Taiwan catalog keeps reviewed regional terminology without scaffold artifacts',()=>{const settings=load('locales/settings-zh-tw.ts').default;assert.equal(zhTW.uiMapControls,'\u5730\u5716\u63a7\u5236\u9805');assert.equal(zhTW.uiEditLocalNote,'\u7de8\u8f2f\u672c\u6a5f\u7b46\u8a18');assert.equal(settings.generalSettings,'\u4e00\u822c\u8a2d\u5b9a');assert.equal(settings.advancedSettings,'\u9032\u968e\u8a2d\u5b9a');const all=JSON.stringify([zhTW,settings]);for(const term of ['\u5f71\u50cf','\u5716\u78da','\u672c\u6a5f','\u54c1\u8cea','\u532f\u5165','\u9810\u8a2d'])assert(all.includes(term),term);for(const term of ['\u6309\u4e00\u4e0b\u64c7','\u6db5\u84cb\u7bc4\u570d\u7bc4\u570d','\u5f71\u8c61','\u8cea\u91cf','\u81ea\u5b9a\u7fa9','\u8a31\u53ef\u6b0a','\u5f8c\u8a2d\u8cc7\u6599','\u5fae\u4ef6','\u5f8c\u81fa','\u5e40'])assert(!all.includes(term),term)});\n\ntest('catalog QA scans all translated catalogs, startup subsets and source properties',()=>{const{run}=require('../tools/check-localization-catalogs.cjs'),report=run(path.resolve(__dirname,'..'),ts);assert.equal(report.summary.translatedLanguages,12);assert.equal(report.summary.runtimeKeys,1070);assert.equal(report.summary.builderKeys,150);assert.equal(report.summary.errors,0,JSON.stringify(report));for(const entry of Object.values(report.languages)){assert.equal(entry.runtime.entries,1070);assert.equal(entry.builder.entries,150)}});\ntest('catalog QA rejects dropped/extra keys, changed placeholder multiplicity and corrupt text',()=>{const{auditCatalog}=require('../tools/check-localization-catalogs.cjs'),base={notice:'{count} notes for {name}',twice:'{count} of {count}',missing:'Missing',blank:'Blank',corrupt:'Corrupt',surrogate:'Surrogate'},bad={notice:'{name} notlar\u0131: {total}',twice:'{count}',blank:' ',corrupt:'Text\\uFFFD',surrogate:'Text\\uD800',extra:'Extra'};assert.deepEqual(auditCatalog(base,bad).errors.map(e=>[e.key,e.issue]),[['extra','extra-key'],['notice','placeholder-mismatch'],['twice','placeholder-mismatch'],['missing','missing-or-empty'],['blank','missing-or-empty'],['corrupt','invalid-or-hidden-character'],['surrogate','invalid-or-hidden-character']]);assert.deepEqual(auditCatalog({notice:'{count} notes for {name}'},{notice:'{name}: {count}\u5247\u7b46\u8a18'}).errors,[])});\ntest('catalog QA keeps valid shared vocabulary and contextual grammar as review information',()=>{const{auditCatalog}=require('../tools/check-localization-catalogs.cjs'),report=auditCatalog({brand:'Mapillary Explorer',a:'All',b:'All',emoji:'Ready'},{brand:'Mapillary Explorer',a:'Todos',b:'Todas',emoji:'Listo \ud83d\uddfa\ufe0f'});assert.deepEqual(report.errors,[]);assert.deepEqual(report.identicalEnglish,[{key:'brand',text:'Mapillary Explorer'}]);assert.equal(report.contextVariants.length,1);assert.deepEqual(report.contextVariants[0].translations,{a:'Todos',b:'Todas'})});\n",
              "after": "test('ten-language notices preserve Chinese parameter order, user text and Intl formatting',()=>{const catalogs=[en,tr,es,fr,de,ptBR,it,ja,ko,zhCN],translations=['2 notes imported','2 not i\u00e7e aktar\u0131ld\u0131','2 notas importadas','2 notes import\u00e9es','2 Notizen importiert','2 notas importadas','2 note importate','\u30ce\u30fc\u30c8\u30922\u4ef6\u30a4\u30f3\u30dd\u30fc\u30c8\u3057\u307e\u3057\u305f','\uba54\ubaa8 2\uac1c\ub97c \uac00\uc838\uc654\uc2b5\ub2c8\ub2e4','\u5df2\u5bfc\u51652\u6761\u7b14\u8bb0'];for(let i=0;i<catalogs.length;i++){const format=presentationFormatter(en,catalogs[i],catalogs);for(const source of translations)assert.equal(format(source),translations[i]);assert.equal(format('My custom category'),'My custom category');assert.equal(format('\u6211\u7684\u4e2a\u4eba\u5907\u6ce8'),'\u6211\u7684\u4e2a\u4eba\u5907\u6ce8');assert.equal(format('Mapillary Explorer'),'Mapillary Explorer')}assert.equal(presentationFormatter(en,en,[zhCN])('\u56fe\u50cf7\u7684 Graph API 403'),'Graph API 403 for image 7');const p=new PresentationText();p.update('zh-CN',presentationFormatter(en,zhCN));assert.equal(p.number(12345.5),'12,345.5');assert.equal(p.date(new Date('2026-11-01T12:00:00Z'),{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}),'2026\u5e7411\u67081\u65e5')});\n\nconst zhTW=load('locales/zh-tw.ts').default;\ntest('Traditional Chinese Taiwan covers every runtime and builder key/placeholder with valid syntax',()=>{const settings=load('locales/settings-zh-tw.ts').default,{settingsEn}=load('settingsMessages.ts'),tokens=s=>[...s.matchAll(/\\{([a-zA-Z][a-zA-Z0-9_]*)\\}/g)].map(x=>x[1]).sort();for(const[base,translated]of[[en,zhTW],[settingsEn,settings]]){assert.deepEqual(Object.keys(translated).sort(),Object.keys(base).sort());for(const key of Object.keys(base)){assert(translated[key].trim(),key);assert.deepEqual(tokens(translated[key]),tokens(base[key]),key)}}for(const file of ['locales/zh-tw.ts','locales/settings-zh-tw.ts'])assert.deepEqual(ts.createSourceFile(file,fs.readFileSync(path.join(__dirname,'../src/i18n',file),'utf8'),ts.ScriptTarget.Latest,true).parseDiagnostics,[]);assert.equal(Object.keys(zhTW).length,Object.keys(en).length);assert.equal(Object.keys(settings).length,150);assert.equal(zhTW.uiFindYourPointOfView,'\u627e\u5230\u4f60\u7684\u8996\u89d2\u3002');assert.equal(settings.defaultWidgetLanguage,'\u9810\u8a2d\u5c0f\u5de5\u5177\u8a9e\u8a00');assert.equal(zhTW.uiSave,'\u5132\u5b58')});\ntest('Chinese script overrides region and all eleven explicit builder choices override saved preferences',()=>{for(const locale of ['zh-TW','ZH_tw','zh-HK','zh-MO','zh-Hant','zh-Hant-CN','zh-Hant-SG','zh-Hant-TW-u-ca-chinese','zh-HK-u-ca-gregory'])assert.equal(languageOf(locale),'zh-TW',locale);for(const locale of ['zh','zh-CN','zh-SG','zh-Hans-TW','zh-Hans-MO','zh-CN-u-rg-twzzzz'])assert.equal(languageOf(locale),'zh-CN',locale);for(const locale of ['zh-Latn-TW','zh-Latn-CN','zh-!!!','zh--TW','tw'])assert.equal(languageOf(locale),'en',locale);assert.equal(preferenceOf('zh-TW'),'zh-TW');assert.equal(preferenceOf('zh-tw'),'auto');const{requestedLanguage}=load('core.ts',()=>({en})),languages=['en','tr','es','fr','de','pt-BR','it','ja','ko','zh-CN','zh-TW'];for(const builder of languages)for(const saved of ['auto',...languages])for(const allowed of [true,false])assert.equal(requestedLanguage('zh-Hans-TW',builder,saved,allowed),builder);assert.equal(requestedLanguage('zh-Hant-TW','auto','auto',true),'zh-TW');assert.equal(requestedLanguage('en','auto','zh-TW',true),'zh-TW');assert.equal(requestedLanguage('zh-Hans','auto','zh-TW',false),'zh-CN')});\ntest('Taiwan startup text matches full catalogs and language names follow every displayed language',()=>{const{startupMessages,startupSettings,languageName}=load('startupMessages.ts'),settings=load('locales/settings-zh-tw.ts').default;for(const[key,value]of Object.entries(startupMessages['zh-TW']))assert.equal(value,zhTW[key],key);for(const[key,value]of Object.entries(startupSettings['zh-TW']))assert.equal(value,settings[key],key);assert.equal(languageName('en','zh-TW'),'Chinese (Traditional, Taiwan)');assert.equal(languageName('zh-TW','zh-TW'),'\u7e41\u9ad4\u4e2d\u6587\uff08\u53f0\u7063\uff09');assert.equal(languageName('zh-TW','zh-CN'),'\u7c21\u9ad4\u4e2d\u6587');assert.equal(languageName('zh-CN','zh-TW'),'\u7e41\u4f53\u4e2d\u6587\uff08\u53f0\u6e7e\uff09');assert.equal(languageName('ja','zh-TW'),'\u4e2d\u56fd\u8a9e\uff08\u7e41\u4f53\u5b57\u30fb\u53f0\u6e7e\uff09');assert.equal(languageName('ko','zh-TW'),'\uc911\uad6d\uc5b4(\ubc88\uccb4, \ub300\ub9cc)')});\ntest('eleven-language notices preserve Taiwan parameters, user text and Gregorian Intl formats',()=>{const catalogs=[en,tr,es,fr,de,ptBR,it,ja,ko,zhCN,zhTW],translations=['2 notes imported','2 not i\u00e7e aktar\u0131ld\u0131','2 notas importadas','2 notes import\u00e9es','2 Notizen importiert','2 notas importadas','2 note importate','\u30ce\u30fc\u30c8\u30922\u4ef6\u30a4\u30f3\u30dd\u30fc\u30c8\u3057\u307e\u3057\u305f','\uba54\ubaa8 2\uac1c\ub97c \uac00\uc838\uc654\uc2b5\ub2c8\ub2e4','\u5df2\u5bfc\u51652\u6761\u7b14\u8bb0','\u5df2\u532f\u51652\u5247\u7b46\u8a18'];for(let i=0;i<catalogs.length;i++){const format=presentationFormatter(en,catalogs[i],catalogs);for(const source of translations)assert.equal(format(source),translations[i]);assert.equal(format('My custom category'),'My custom category');assert.equal(format('\u6211\u7684\u79c1\u4eba\u7b46\u8a18'),'\u6211\u7684\u79c1\u4eba\u7b46\u8a18');assert.equal(format('Mapillary Explorer'),'Mapillary Explorer')}assert.equal(presentationFormatter(en,en,[zhTW])('\u5f71\u50cf7\u7684 Graph API 403'),'Graph API 403 for image 7');const p=new PresentationText();p.update('zh-TW',presentationFormatter(en,zhTW));assert.equal(p.number(12345.5),'12,345.5');assert.equal(p.date(new Date('2026-11-01T12:00:00Z'),{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}),'2026\u5e7411\u67081\u65e5')});\ntest('Taiwan catalog keeps reviewed regional terminology without scaffold artifacts',()=>{const settings=load('locales/settings-zh-tw.ts').default;assert.equal(zhTW.uiMapControls,'\u5730\u5716\u63a7\u5236\u9805');assert.equal(zhTW.uiEditLocalNote,'\u7de8\u8f2f\u672c\u6a5f\u7b46\u8a18');assert.equal(settings.generalSettings,'\u4e00\u822c\u8a2d\u5b9a');assert.equal(settings.advancedSettings,'\u9032\u968e\u8a2d\u5b9a');const all=JSON.stringify([zhTW,settings]);for(const term of ['\u5f71\u50cf','\u5716\u78da','\u672c\u6a5f','\u54c1\u8cea','\u532f\u5165','\u9810\u8a2d'])assert(all.includes(term),term);for(const term of ['\u6309\u4e00\u4e0b\u64c7','\u6db5\u84cb\u7bc4\u570d\u7bc4\u570d','\u5f71\u8c61','\u8cea\u91cf','\u81ea\u5b9a\u7fa9','\u8a31\u53ef\u6b0a','\u5f8c\u8a2d\u8cc7\u6599','\u5fae\u4ef6','\u5f8c\u81fa','\u5e40'])assert(!all.includes(term),term)});\n\ntest('catalog QA scans all translated catalogs, startup subsets and source properties',()=>{const{run}=require('../tools/check-localization-catalogs.cjs'),report=run(path.resolve(__dirname,'..'),ts);assert.equal(report.summary.translatedLanguages,12);assert.equal(report.summary.runtimeKeys,Object.keys(en).length);assert.equal(report.summary.builderKeys,150);assert.equal(report.summary.errors,0,JSON.stringify(report));for(const entry of Object.values(report.languages)){assert.equal(entry.runtime.entries,Object.keys(en).length);assert.equal(entry.builder.entries,150)}});\ntest('catalog QA rejects dropped/extra keys, changed placeholder multiplicity and corrupt text',()=>{const{auditCatalog}=require('../tools/check-localization-catalogs.cjs'),base={notice:'{count} notes for {name}',twice:'{count} of {count}',missing:'Missing',blank:'Blank',corrupt:'Corrupt',surrogate:'Surrogate'},bad={notice:'{name} notlar\u0131: {total}',twice:'{count}',blank:' ',corrupt:'Text\\uFFFD',surrogate:'Text\\uD800',extra:'Extra'};assert.deepEqual(auditCatalog(base,bad).errors.map(e=>[e.key,e.issue]),[['extra','extra-key'],['notice','placeholder-mismatch'],['twice','placeholder-mismatch'],['missing','missing-or-empty'],['blank','missing-or-empty'],['corrupt','invalid-or-hidden-character'],['surrogate','invalid-or-hidden-character']]);assert.deepEqual(auditCatalog({notice:'{count} notes for {name}'},{notice:'{name}: {count}\u5247\u7b46\u8a18'}).errors,[])});\ntest('catalog QA keeps valid shared vocabulary and contextual grammar as review information',()=>{const{auditCatalog}=require('../tools/check-localization-catalogs.cjs'),report=auditCatalog({brand:'Mapillary Explorer',a:'All',b:'All',emoji:'Ready'},{brand:'Mapillary Explorer',a:'Todos',b:'Todas',emoji:'Listo \ud83d\uddfa\ufe0f'});assert.deepEqual(report.errors,[]);assert.deepEqual(report.identicalEnglish,[{key:'brand',text:'Mapillary Explorer'}]);assert.equal(report.contextVariants.length,1);assert.deepEqual(report.contextVariants[0].translations,{a:'Todos',b:'Todas'})});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/arabicLocale.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nfunction load(file){const module={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/i18n',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>load(path.posix.join(path.posix.dirname(file),id+'.ts')),module,module.exports);return module.exports;}\nconst {en}=load('messages.ts'),ar=load('locales/ar.ts').default,settings=load('locales/settings-ar.ts').default,core=load('core.ts');\ntest('Arabic covers runtime/settings/startup and keeps every placeholder and source identifier',()=>{const {settingsEn}=load('settingsMessages.ts'),{auditCatalog}=require('../tools/check-localization-catalogs.cjs');assert.equal(Object.keys(ar).length,1070);assert.equal(Object.keys(settings).length,150);assert.deepEqual(auditCatalog(en,ar).errors,[]);assert.deepEqual(auditCatalog(settingsEn,settings).errors,[]);const {startupMessages,startupSettings,languageName}=load('startupMessages.ts');for(const[k,v]of Object.entries(startupMessages.ar))assert.equal(v,ar[k]);for(const[k,v]of Object.entries(startupSettings.ar))assert.equal(v,settings[k]);assert.equal(languageName('en','ar'),'Arabic');assert.equal(languageName('ar','ar'),'\u0627\u0644\u0639\u0631\u0628\u064a\u0629');assert.equal(languageName('ar','en-GB'),'\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)');assert(settings.requiresAPublishedPilotLayerPreparedWithToolsOverture.includes('tools/overture_places'));assert(ar.complete294.includes('resolution_note'));assert.equal(settings.x,'X:');assert.equal(settings.y,'Y:')});\ntest('Arabic regional selection and builder priority cover thirteen language choices',()=>{for(const tag of ['ar','ar-EG','ar-SA','AR_ae','ar-Arab-MA','ar-LB-u-ca-islamic'])assert.equal(core.languageOf(tag),'ar',tag);for(const tag of ['arabic','ar--SA','ar-Latn-EG','fa-IR','ur-PK'])assert.equal(core.languageOf(tag),'en',tag);assert.equal(core.preferenceOf('ar'),'ar');assert.equal(core.directionOf('ar'),'rtl');const languages=['en','en-GB','ar','tr','es','fr','de','pt-BR','it','ja','ko','zh-CN','zh-TW'];for(const builder of languages)for(const saved of ['auto',...languages])for(const allowed of [true,false]){assert.equal(core.requestedLanguage('ar-SA',builder,saved,allowed),builder);assert.equal(core.directionOf(builder),builder==='ar'?'rtl':'ltr')}assert.equal(core.requestedLanguage('en','auto','ar',true),'ar');assert.equal(core.requestedLanguage('en','auto','ar',false),'en')});\ntest('Saudi and Egyptian formats keep Gregorian dates and retain regional numbers/weeks',()=>{for(const tag of ['ar-EG','ar-SA','ar-AE']){const locale=core.formattingLocale(tag,'auto','auto',true);assert.equal(new Intl.DateTimeFormat(locale).resolvedOptions().calendar,'gregory');const parts=new Intl.DateTimeFormat(locale,{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'UTC'}).formatToParts(new Date('2026-11-01T12:00:00Z'));assert(parts.find(p=>p.type==='year').value.includes('\u0662\u0660\u0662\u0666')||parts.find(p=>p.type==='year').value==='2026')}assert.equal(core.formattingLocale('ar-SA','en','auto',true),'en-US');assert.equal(core.formattingLocale('en','ar','auto',false),'ar-u-ca-gregory');assert.equal(core.firstWeekday('ar-EG-u-ca-gregory'),6);assert.equal(core.firstWeekday('ar-SA-u-ca-gregory'),0)});\ntest('Arabic notices round-trip including Arabic-Indic counts and literal personal content',()=>{const {presentationFormatter}=load('PresentationText.ts'),english=presentationFormatter(en,en,[ar]),arabic=presentationFormatter(en,ar,[ar]);assert.equal(arabic('2 notes imported'),'\u0639\u062f\u062f \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u0631\u062f\u0629: 2');assert.equal(english('\u0639\u062f\u062f \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u0631\u062f\u0629: \u0662'),'\u0662 notes imported');for(const text of ['My custom category','\u0645\u0644\u0627\u062d\u0638\u062a\u064a \u0627\u0644\u062e\u0627\u0635\u0629','abc_123','Mapillary Explorer'])assert.equal(arabic(text),text);for(const count of [0,1,2,3,11,100])assert.equal(core.message(ar,'complete447',{count}),`\u0639\u062f\u062f \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u0631\u062f\u0629: ${count}`)});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nfunction load(file){const module={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/i18n',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(id=>load(path.posix.join(path.posix.dirname(file),id+'.ts')),module,module.exports);return module.exports;}\nconst {en}=load('messages.ts'),ar=load('locales/ar.ts').default,settings=load('locales/settings-ar.ts').default,core=load('core.ts');\ntest('Arabic covers runtime/settings/startup and keeps every placeholder and source identifier',()=>{const {settingsEn}=load('settingsMessages.ts'),{auditCatalog}=require('../tools/check-localization-catalogs.cjs');assert.equal(Object.keys(ar).length,Object.keys(en).length);assert.equal(Object.keys(settings).length,150);assert.deepEqual(auditCatalog(en,ar).errors,[]);assert.deepEqual(auditCatalog(settingsEn,settings).errors,[]);const {startupMessages,startupSettings,languageName}=load('startupMessages.ts');for(const[k,v]of Object.entries(startupMessages.ar))assert.equal(v,ar[k]);for(const[k,v]of Object.entries(startupSettings.ar))assert.equal(v,settings[k]);assert.equal(languageName('en','ar'),'Arabic');assert.equal(languageName('ar','ar'),'\u0627\u0644\u0639\u0631\u0628\u064a\u0629');assert.equal(languageName('ar','en-GB'),'\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 (\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629)');assert(settings.requiresAPublishedPilotLayerPreparedWithToolsOverture.includes('tools/overture_places'));assert(ar.complete294.includes('resolution_note'));assert.equal(settings.x,'X:');assert.equal(settings.y,'Y:')});\ntest('Arabic regional selection and builder priority cover thirteen language choices',()=>{for(const tag of ['ar','ar-EG','ar-SA','AR_ae','ar-Arab-MA','ar-LB-u-ca-islamic'])assert.equal(core.languageOf(tag),'ar',tag);for(const tag of ['arabic','ar--SA','ar-Latn-EG','fa-IR','ur-PK'])assert.equal(core.languageOf(tag),'en',tag);assert.equal(core.preferenceOf('ar'),'ar');assert.equal(core.directionOf('ar'),'rtl');const languages=['en','en-GB','ar','tr','es','fr','de','pt-BR','it','ja','ko','zh-CN','zh-TW'];for(const builder of languages)for(const saved of ['auto',...languages])for(const allowed of [true,false]){assert.equal(core.requestedLanguage('ar-SA',builder,saved,allowed),builder);assert.equal(core.directionOf(builder),builder==='ar'?'rtl':'ltr')}assert.equal(core.requestedLanguage('en','auto','ar',true),'ar');assert.equal(core.requestedLanguage('en','auto','ar',false),'en')});\ntest('Saudi and Egyptian formats keep Gregorian dates and retain regional numbers/weeks',()=>{for(const tag of ['ar-EG','ar-SA','ar-AE']){const locale=core.formattingLocale(tag,'auto','auto',true);assert.equal(new Intl.DateTimeFormat(locale).resolvedOptions().calendar,'gregory');const parts=new Intl.DateTimeFormat(locale,{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'UTC'}).formatToParts(new Date('2026-11-01T12:00:00Z'));assert(parts.find(p=>p.type==='year').value.includes('\u0662\u0660\u0662\u0666')||parts.find(p=>p.type==='year').value==='2026')}assert.equal(core.formattingLocale('ar-SA','en','auto',true),'en-US');assert.equal(core.formattingLocale('en','ar','auto',false),'ar-u-ca-gregory');assert.equal(core.firstWeekday('ar-EG-u-ca-gregory'),6);assert.equal(core.firstWeekday('ar-SA-u-ca-gregory'),0)});\ntest('Arabic notices round-trip including Arabic-Indic counts and literal personal content',()=>{const {presentationFormatter}=load('PresentationText.ts'),english=presentationFormatter(en,en,[ar]),arabic=presentationFormatter(en,ar,[ar]);assert.equal(arabic('2 notes imported'),'\u0639\u062f\u062f \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u0631\u062f\u0629: 2');assert.equal(english('\u0639\u062f\u062f \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u0631\u062f\u0629: \u0662'),'\u0662 notes imported');for(const text of ['My custom category','\u0645\u0644\u0627\u062d\u0638\u062a\u064a \u0627\u0644\u062e\u0627\u0635\u0629','abc_123','Mapillary Explorer'])assert.equal(arabic(text),text);for(const count of [0,1,2,3,11,100])assert.equal(core.message(ar,'complete447',{count}),`\u0639\u062f\u062f \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0648\u0631\u062f\u0629: ${count}`)});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/localization/translations.csv",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "\"scope\",\"key\",\"en\",\"en-GB\",\"ar\",\"tr\",\"es\",\"fr\",\"de\",\"pt-BR\",\"it\",\"ja\",\"ko\",\"zh-CN\",\"zh-TW\"\n\"runtime\",\"complete001\",\"Select\u2026\",\"Select\u2026\",\"\u062d\u062f\u062f...\",\"Se\u00e7in\u2026\",\"Seleccionar\u2026\",\"S\u00e9lectionner\u2026\",\"Ausw\u00e4hlen\u2026\",\"Selecionar\u2026\",\"Seleziona\u2026\",\"\u9078\u629e\u2026\",\"\uc120\ud0dd\u2026\",\"\u9009\u62e9\u2026\",\"\u9078\u53d6\u2026\"\n\"runtime\",\"complete002\",\"Finding nearest frame{value0}\",\"Finding nearest frame{value0}\",\"\u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u0642\u0631\u0628 \u0625\u0637\u0627\u0631{value0}\",\"En yak\u0131n kare bulunuyor{value0}\",\"Buscando el fotograma m\u00e1s cercano{value0}\",\"Recherche de l\u2019image la plus proche{value0}\",\"N\u00e4chstgelegenes Bild wird gesucht{value0}\",\"Buscando o quadro mais pr\u00f3ximo{value0}\",\"Ricerca del fotogramma pi\u00f9 vicino{value0}\",\"\u6700\u3082\u8fd1\u3044\u30d5\u30ec\u30fc\u30e0\u3092\u691c\u7d22\u4e2d{value0}\",\"\uac00\uc7a5 \uac00\uae4c\uc6b4 \ud504\ub808\uc784 \uac80\uc0c9 \uc911{value0}\",\"\u6b63\u5728\u67e5\u627e\u6700\u8fd1\u7684\u5e27{value0}\",\"\u6b63\u5728\u5c0b\u627e\u6700\u8fd1\u7684\u5f71\u683c{value0}\"\n\"runtime\",\"complete003\",\"{value0} \u00b7 Organization ID: {value1}\",\"{value0} \u00b7 Organisation ID: {value1}\",\"{value0} \u00b7 \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u0638\u0645\u0629: {value1}\",\"{value0} \u00b7 Kurulu\u015f kimli\u011fi: {value1}\",\"{value0} \u00b7 ID de organizaci\u00f3n: {value1}\",\"{value0} \u00b7 ID de l\u2019organisation : {value1}\",\"{value0} \u00b7 Organisations-ID: {value1}\",\"{value0} \u00b7 ID da organiza\u00e7\u00e3o: {value1}\",\"{value0} \u00b7 ID organizzazione: {value1}\",\"{value0} \u00b7 \u7d44\u7e54ID: {value1}\",\"{value0} \u00b7 \uc870\uc9c1 ID: {value1}\",\"{value0} \u00b7 \u7ec4\u7ec7 ID\uff1a{value1}\",\"{value0} \u00b7 \u7d44\u7e54 ID\uff1a{value1}\"\n",
              "after": "\"scope\",\"key\",\"en\",\"en-GB\",\"ar\",\"tr\",\"es\",\"fr\",\"de\",\"pt-BR\",\"it\",\"ja\",\"ko\",\"zh-CN\",\"zh-TW\"\n\"runtime\",\"notesSearch\",\"Search notes\",\"Search notes\",\"\u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a\",\"Notlarda ara\",\"Buscar notas\",\"Rechercher des notes\",\"Notizen durchsuchen\",\"Pesquisar notas\",\"Cerca nelle note\",\"\u30e1\u30e2\u3092\u691c\u7d22\",\"\uba54\ubaa8 \uac80\uc0c9\",\"\u641c\u7d22\u5907\u6ce8\",\"\u641c\u5c0b\u5099\u8a3b\"\n\"runtime\",\"notesSearchPlaceholder\",\"Text, category, resolution or status\",\"Text, category, resolution or status\",\"\u0627\u0644\u0646\u0635 \u0623\u0648 \u0627\u0644\u0641\u0626\u0629 \u0623\u0648 \u0627\u0644\u062d\u0644 \u0623\u0648 \u0627\u0644\u062d\u0627\u0644\u0629\",\"Metin, kategori, \u00e7\u00f6z\u00fcm veya durum\",\"Texto, categor\u00eda, resoluci\u00f3n o estado\",\"Texte, cat\u00e9gorie, r\u00e9solution ou statut\",\"Text, Kategorie, L\u00f6sung oder Status\",\"Texto, categoria, resolu\u00e7\u00e3o ou status\",\"Testo, categoria, risoluzione o stato\",\"\u672c\u6587\u3001\u30ab\u30c6\u30b4\u30ea\u3001\u5bfe\u5fdc\u5185\u5bb9\u3001\u30b9\u30c6\u30fc\u30bf\u30b9\",\"\ub0b4\uc6a9, \ubc94\uc8fc, \ud574\uacb0 \ub0b4\uc6a9 \ub610\ub294 \uc0c1\ud0dc\",\"\u6587\u672c\u3001\u7c7b\u522b\u3001\u89e3\u51b3\u8bf4\u660e\u6216\u72b6\u6001\",\"\u6587\u5b57\u3001\u985e\u5225\u3001\u89e3\u6c7a\u8aaa\u660e\u6216\u72c0\u614b\"\n\"runtime\",\"notesClearSearch\",\"Clear note search\",\"Clear note search\",\"\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a\",\"Not aramas\u0131n\u0131 temizle\",\"Borrar b\u00fasqueda de notas\",\"Effacer la recherche de notes\",\"Notizensuche l\u00f6schen\",\"Limpar pesquisa de notas\",\"Cancella ricerca nelle note\",\"\u30e1\u30e2\u306e\u691c\u7d22\u3092\u30af\u30ea\u30a2\",\"\uba54\ubaa8 \uac80\uc0c9 \uc9c0\uc6b0\uae30\",\"\u6e05\u9664\u5907\u6ce8\u641c\u7d22\",\"\u6e05\u9664\u5099\u8a3b\u641c\u5c0b\"\n\"runtime\",\"notesSearchCount\",\"{shown} of {total} notes\",\"{shown} of {total} notes\",\"{shown} \u0645\u0646 {total} \u0645\u0644\u0627\u062d\u0638\u0629\",\"{total} nottan {shown} tanesi\",\"{shown} de {total} notas\",\"{shown} sur {total} notes\",\"{shown} von {total} Notizen\",\"{shown} de {total} notas\",\"{shown} di {total} note\",\"{total} \u4ef6\u4e2d {shown} \u4ef6\",\"\uba54\ubaa8 {total}\uac1c \uc911 {shown}\uac1c\",\"\u5171 {total} \u6761\uff0c\u663e\u793a {shown} \u6761\",\"\u5171 {total} \u7b46\uff0c\u986f\u793a {shown} \u7b46\"\n\"runtime\",\"notesSearchEmpty\",\"No notes match your search.\",\"No notes match your search.\",\"\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u062a\u0637\u0627\u0628\u0642 \u0628\u062d\u062b\u0643.\",\"Araman\u0131zla e\u015fle\u015fen not bulunamad\u0131.\",\"Ninguna nota coincide con la b\u00fasqueda.\",\"Aucune note ne correspond \u00e0 votre recherche.\",\"Keine Notizen entsprechen Ihrer Suche.\",\"Nenhuma nota corresponde \u00e0 pesquisa.\",\"Nessuna nota corrisponde alla ricerca.\",\"\u691c\u7d22\u306b\u4e00\u81f4\u3059\u308b\u30e1\u30e2\u306f\u3042\u308a\u307e\u305b\u3093\u3002\",\"\uac80\uc0c9\uacfc \uc77c\uce58\ud558\ub294 \uba54\ubaa8\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.\",\"\u6ca1\u6709\u4e0e\u641c\u7d22\u5339\u914d\u7684\u5907\u6ce8\u3002\",\"\u6c92\u6709\u7b26\u5408\u641c\u5c0b\u7684\u5099\u8a3b\u3002\"\n\"runtime\",\"notesSearchLoadedScope\",\"Search covers loaded records. Load more to include additional notes.\",\"Search covers loaded records. Load more to include additional notes.\",\"\u064a\u0634\u0645\u0644 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0645\u062d\u0645\u0651\u0644\u0629. \u062d\u0645\u0651\u0644 \u0627\u0644\u0645\u0632\u064a\u062f \u0644\u062a\u0636\u0645\u064a\u0646 \u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629.\",\"Arama y\u00fcklenen kay\u0131tlar\u0131 kapsar. Di\u011fer notlar\u0131 dahil etmek i\u00e7in daha fazla y\u00fckleyin.\",\"La b\u00fasqueda abarca los registros cargados. Cargue m\u00e1s para incluir otras notas.\",\"La recherche porte sur les enregistrements charg\u00e9s. Chargez-en davantage pour inclure d\u2019autres notes.\",\"Die Suche umfasst geladene Datens\u00e4tze. Laden Sie weitere Notizen, um sie einzubeziehen.\",\"A pesquisa abrange os registros carregados. Carregue mais para incluir outras notas.\",\"La ricerca include i record caricati. Caricane altri per includere ulteriori note.\",\"\u8aad\u307f\u8fbc\u307f\u6e08\u307f\u306e\u30e1\u30e2\u3092\u691c\u7d22\u3057\u307e\u3059\u3002\u8ffd\u52a0\u306e\u30e1\u30e2\u3092\u542b\u3081\u308b\u306b\u306f\u3001\u3055\u3089\u306b\u8aad\u307f\u8fbc\u3093\u3067\u304f\u3060\u3055\u3044\u3002\",\"\ubd88\ub7ec\uc628 \uae30\ub85d\ub9cc \uac80\uc0c9\ud569\ub2c8\ub2e4. \uba54\ubaa8\ub97c \ub354 \ud3ec\ud568\ud558\ub824\uba74 \ucd94\uac00\ub85c \ubd88\ub7ec\uc624\uc138\uc694.\",\"\u4ec5\u641c\u7d22\u5df2\u52a0\u8f7d\u7684\u8bb0\u5f55\u3002\u52a0\u8f7d\u66f4\u591a\u4ee5\u5305\u542b\u5176\u4ed6\u5907\u6ce8\u3002\",\"\u50c5\u641c\u5c0b\u5df2\u8f09\u5165\u7684\u8a18\u9304\u3002\u8f09\u5165\u66f4\u591a\u4ee5\u5305\u542b\u5176\u4ed6\u5099\u8a3b\u3002\"\n\"runtime\",\"complete001\",\"Select\u2026\",\"Select\u2026\",\"\u062d\u062f\u062f...\",\"Se\u00e7in\u2026\",\"Seleccionar\u2026\",\"S\u00e9lectionner\u2026\",\"Ausw\u00e4hlen\u2026\",\"Selecionar\u2026\",\"Seleziona\u2026\",\"\u9078\u629e\u2026\",\"\uc120\ud0dd\u2026\",\"\u9009\u62e9\u2026\",\"\u9078\u53d6\u2026\"\n\"runtime\",\"complete002\",\"Finding nearest frame{value0}\",\"Finding nearest frame{value0}\",\"\u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0623\u0642\u0631\u0628 \u0625\u0637\u0627\u0631{value0}\",\"En yak\u0131n kare bulunuyor{value0}\",\"Buscando el fotograma m\u00e1s cercano{value0}\",\"Recherche de l\u2019image la plus proche{value0}\",\"N\u00e4chstgelegenes Bild wird gesucht{value0}\",\"Buscando o quadro mais pr\u00f3ximo{value0}\",\"Ricerca del fotogramma pi\u00f9 vicino{value0}\",\"\u6700\u3082\u8fd1\u3044\u30d5\u30ec\u30fc\u30e0\u3092\u691c\u7d22\u4e2d{value0}\",\"\uac00\uc7a5 \uac00\uae4c\uc6b4 \ud504\ub808\uc784 \uac80\uc0c9 \uc911{value0}\",\"\u6b63\u5728\u67e5\u627e\u6700\u8fd1\u7684\u5e27{value0}\",\"\u6b63\u5728\u5c0b\u627e\u6700\u8fd1\u7684\u5f71\u683c{value0}\"\n\"runtime\",\"complete003\",\"{value0} \u00b7 Organization ID: {value1}\",\"{value0} \u00b7 Organisation ID: {value1}\",\"{value0} \u00b7 \u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u0638\u0645\u0629: {value1}\",\"{value0} \u00b7 Kurulu\u015f kimli\u011fi: {value1}\",\"{value0} \u00b7 ID de organizaci\u00f3n: {value1}\",\"{value0} \u00b7 ID de l\u2019organisation : {value1}\",\"{value0} \u00b7 Organisations-ID: {value1}\",\"{value0} \u00b7 ID da organiza\u00e7\u00e3o: {value1}\",\"{value0} \u00b7 ID organizzazione: {value1}\",\"{value0} \u00b7 \u7d44\u7e54ID: {value1}\",\"{value0} \u00b7 \uc870\uc9c1 ID: {value1}\",\"{value0} \u00b7 \u7ec4\u7ec7 ID\uff1a{value1}\",\"{value0} \u00b7 \u7d44\u7e54 ID\uff1a{value1}\"\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/translationTable.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Notes search 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst {columns,tableFile,csv,parseCSV,read,rowsFor,exportTable,planImport,apply}=require('../tools/translation-table.cjs'),{run}=require('../tools/check-localization-catalogs.cjs'),root=path.resolve(__dirname,'..');\nfunction fixture(fn){const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'mapillary-translations-'));try{fs.cpSync(path.join(root,'src/i18n'),path.join(temporary,'src/i18n'),{recursive:true});fs.mkdirSync(path.join(temporary,'docs/localization'),{recursive:true});fs.copyFileSync(path.join(root,tableFile),path.join(temporary,tableFile));return fn(temporary);}finally{fs.rmSync(temporary,{recursive:true,force:true});}}\ntest('community table includes every current runtime, settings and language-name translation',()=>{const actual=fs.readFileSync(path.join(root,tableFile),'utf8'),expected=exportTable(root,ts),rows=parseCSV(actual);assert.deepEqual(rows,parseCSV(expected));assert.deepEqual(rows[0],columns);assert.equal(rows.length,1234);assert.equal(rows.filter(r=>r[0]==='runtime').length,1070);assert.equal(rows.filter(r=>r[0]==='settings').length,150);assert.equal(rows.filter(r=>r[0]==='names').length,13);assert.equal(planImport(root,ts,actual).changes.length,0)});\ntest('CSV preserves quotes, commas, Unicode, line breaks and spreadsheet BOM',()=>{const rows=[['scope','key','en'],['runtime','example','First, \"quoted\" line\\r\\n\u7b2c\u4e8c\u884c \ud83d\uddfa\ufe0f'],['settings','blank',''],['names','space',' leading and trailing ']];assert.deepEqual(parseCSV(csv(rows)),rows);assert.deepEqual(parseCSV('\"a\",\"b\"\\n\"c\",\"d\"'),[['a','b'],['c','d']]);for(const input of ['\"unclosed','\"closed\"x','in\"side'])assert.throws(()=>parseCSV(input),/quot/)});\ntest('review edits update only intended catalogs, eager subsets, names and the lookup table',()=>fixture(temp=>{const rows=rowsFor(read(temp,ts)),es=columns.indexOf('es'),find=(scope,key)=>rows.find(r=>r[0]===scope&&r[1]===key);find('runtime','uiFindYourPointOfView')[es]='Encuentra tu propia perspectiva.';find('settings','generalSettings')[es]='Ajustes Generales';find('names','zh-TW')[es]='Chino tradicional (Taiw\u00e1n)';const text=csv(rows),before=exportTable(temp,ts),untouched=fs.readFileSync(path.join(temp,'src/i18n/locales/tr.ts'),'utf8'),plan=planImport(temp,ts,text);assert.equal(plan.changes.length,3);assert.equal(exportTable(temp,ts),before,'planning is read-only');apply(temp,plan);const data=read(temp,ts);assert.equal(data.runtime.es.uiFindYourPointOfView,'Encuentra tu propia perspectiva.');assert.equal(data.startup.startupMessages.es.uiFindYourPointOfView,data.runtime.es.uiFindYourPointOfView);assert.equal(data.settings.es.generalSettings,'Ajustes Generales');assert.equal(data.startup.startupSettings.es.generalSettings,data.settings.es.generalSettings);assert.equal(data.names.es['zh-TW'],'Chino tradicional (Taiw\u00e1n)');assert.equal(fs.readFileSync(path.join(temp,'src/i18n/locales/tr.ts'),'utf8'),untouched);assert.equal(run(temp,ts).summary.errors,0);assert.deepEqual(parseCSV(fs.readFileSync(path.join(temp,tableFile),'utf8')),parseCSV(exportTable(temp,ts)));assert.equal(planImport(temp,ts,text).changes.length,0)}));\ntest('bad review edits are rejected before any catalog or table changes',()=>fixture(temp=>{const before=exportTable(temp,ts),base=rowsFor(read(temp,ts)),find=rows=>rows.find(r=>r[0]==='runtime'&&r[1]==='captureOption'),es=columns.indexOf('es'),cases=[rows=>rows.pop(),rows=>rows.push(rows[1]),rows=>rows[1][1]='unknown-key',rows=>rows[1][2]='Changed English',rows=>find(rows)[es]='{date} only',rows=>rows[1][es]=' ',rows=>rows[1][es]='broken\\uFFFD',rows=>rows[0][3]='unsupported'];for(const edit of cases){const rows=base.map(row=>[...row]);rows[2][es]='A valid edit before the invalid entry';edit(rows);assert.throws(()=>planImport(temp,ts,csv(rows)));assert.equal(exportTable(temp,ts),before);assert.deepEqual(parseCSV(fs.readFileSync(path.join(temp,tableFile),'utf8')),base)}}));\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst {columns,tableFile,csv,parseCSV,read,rowsFor,exportTable,planImport,apply}=require('../tools/translation-table.cjs'),{run}=require('../tools/check-localization-catalogs.cjs'),root=path.resolve(__dirname,'..');\nfunction fixture(fn){const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'mapillary-translations-'));try{fs.cpSync(path.join(root,'src/i18n'),path.join(temporary,'src/i18n'),{recursive:true});fs.mkdirSync(path.join(temporary,'docs/localization'),{recursive:true});fs.copyFileSync(path.join(root,tableFile),path.join(temporary,tableFile));return fn(temporary);}finally{fs.rmSync(temporary,{recursive:true,force:true});}}\ntest('community table includes every current runtime, settings and language-name translation',()=>{const actual=fs.readFileSync(path.join(root,tableFile),'utf8'),expected=exportTable(root,ts),rows=parseCSV(actual);assert.deepEqual(rows,parseCSV(expected));assert.deepEqual(rows[0],columns);assert.equal(rows.length,rowsFor(read(root,ts)).length);assert.equal(rows.filter(r=>r[0]==='runtime').length,Object.keys(read(root,ts).runtime.en).length);assert.equal(rows.filter(r=>r[0]==='settings').length,150);assert.equal(rows.filter(r=>r[0]==='names').length,13);assert.equal(planImport(root,ts,actual).changes.length,0)});\ntest('CSV preserves quotes, commas, Unicode, line breaks and spreadsheet BOM',()=>{const rows=[['scope','key','en'],['runtime','example','First, \"quoted\" line\\r\\n\u7b2c\u4e8c\u884c \ud83d\uddfa\ufe0f'],['settings','blank',''],['names','space',' leading and trailing ']];assert.deepEqual(parseCSV(csv(rows)),rows);assert.deepEqual(parseCSV('\"a\",\"b\"\\n\"c\",\"d\"'),[['a','b'],['c','d']]);for(const input of ['\"unclosed','\"closed\"x','in\"side'])assert.throws(()=>parseCSV(input),/quot/)});\ntest('review edits update only intended catalogs, eager subsets, names and the lookup table',()=>fixture(temp=>{const rows=rowsFor(read(temp,ts)),es=columns.indexOf('es'),find=(scope,key)=>rows.find(r=>r[0]===scope&&r[1]===key);find('runtime','uiFindYourPointOfView')[es]='Encuentra tu propia perspectiva.';find('settings','generalSettings')[es]='Ajustes Generales';find('names','zh-TW')[es]='Chino tradicional (Taiw\u00e1n)';const text=csv(rows),before=exportTable(temp,ts),untouched=fs.readFileSync(path.join(temp,'src/i18n/locales/tr.ts'),'utf8'),plan=planImport(temp,ts,text);assert.equal(plan.changes.length,3);assert.equal(exportTable(temp,ts),before,'planning is read-only');apply(temp,plan);const data=read(temp,ts);assert.equal(data.runtime.es.uiFindYourPointOfView,'Encuentra tu propia perspectiva.');assert.equal(data.startup.startupMessages.es.uiFindYourPointOfView,data.runtime.es.uiFindYourPointOfView);assert.equal(data.settings.es.generalSettings,'Ajustes Generales');assert.equal(data.startup.startupSettings.es.generalSettings,data.settings.es.generalSettings);assert.equal(data.names.es['zh-TW'],'Chino tradicional (Taiw\u00e1n)');assert.equal(fs.readFileSync(path.join(temp,'src/i18n/locales/tr.ts'),'utf8'),untouched);assert.equal(run(temp,ts).summary.errors,0);assert.deepEqual(parseCSV(fs.readFileSync(path.join(temp,tableFile),'utf8')),parseCSV(exportTable(temp,ts)));assert.equal(planImport(temp,ts,text).changes.length,0)}));\ntest('bad review edits are rejected before any catalog or table changes',()=>fixture(temp=>{const before=exportTable(temp,ts),base=rowsFor(read(temp,ts)),find=rows=>rows.find(r=>r[0]==='runtime'&&r[1]==='captureOption'),es=columns.indexOf('es'),cases=[rows=>rows.pop(),rows=>rows.push(rows[1]),rows=>rows[1][1]='unknown-key',rows=>rows[1][2]='Changed English',rows=>find(rows)[es]='{date} only',rows=>rows[1][es]=' ',rows=>rows[1][es]='broken\\uFFFD',rows=>rows[0][3]='unsupported'];for(const edit of cases){const rows=base.map(row=>[...row]);rows[2][es]='A valid edit before the invalid entry';edit(rows);assert.throws(()=>planImport(temp,ts,csv(rows)));assert.equal(exportTable(temp,ts),before);assert.deepEqual(parseCSV(fs.readFileSync(path.join(temp,tableFile),'utf8')),base)}}));\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/noteSearch.ts",
      "content": "import type { FieldNote } from '../../components/types';\n\n/** Normalize user text for literal, accent-insensitive matching in the active locale. */\nexport function normalizeNoteSearch(value: string, locale: string): string {\n  return value.normalize('NFKC').toLocaleLowerCase(locale).normalize('NFD').replace(/\\p{M}/gu, '');\n}\n\n/** Filter the supplied records only, preserving their identity/order and all source actions.\n * Every whitespace-separated term must occur in note text, category, resolution,\n * or raw/localized status. No regular expressions are built from user input.\n */\nexport function filterNotes(notes: readonly FieldNote[], query: string, locale: string,\n  statusLabels: Readonly<Record<string, string>>): readonly FieldNote[] {\n  const terms = normalizeNoteSearch(query, locale).trim().split(/\\s+/u).filter(Boolean);\n  if (!terms.length) return notes;\n  return notes.filter(note => {\n    const status = note.status || 'open';\n    const text = normalizeNoteSearch([note.note, note.category, note.resolutionNote,\n      status.replace(/_/g, ' '), statusLabels[status]].filter(Boolean).join(' '), locale);\n    return terms.every(term => text.includes(term));\n  });\n}\n"
    },
    {
      "file": "src/features/field-notes/NoteSearch.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { noteSearchStyle, noteSearchRowStyle, noteSearchInputStyle, noteSearchClearStyle, noteSearchStatusStyle } from '../../styles/noteSearch';\n\ninterface Props { query: string; onChange(value: string): void; shown: number; total: number; loadedOnly?: boolean }\n\n/** Accessible local-list filtering controls. No storage, network, or map selection ownership. */\nexport const NoteSearch: React.FC<Props> = ({ query, onChange, shown, total, loadedOnly }) => {\n  const { t, formatLocale } = useWidgetLocale();\n  const input = React.useRef<HTMLInputElement>(null);\n  const numbers = React.useMemo(() => new Intl.NumberFormat(formatLocale), [formatLocale]);\n  return <div style={noteSearchStyle} onClick={event => event.stopPropagation()}\n    onPointerDown={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>\n    <div style={noteSearchRowStyle}>\n      <label style={{ display: 'grid', gap: 4, minWidth: 0 }}>{t('notesSearch')}\n        <input ref={input} type=\"search\" value={query} placeholder={t('notesSearchPlaceholder')}\n          style={noteSearchInputStyle} onChange={event => onChange(event.target.value)}\n          onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape' && query) { event.preventDefault(); onChange(''); } }} />\n      </label>\n        {query && <button type=\"button\" style={{ ...noteSearchClearStyle, alignSelf: 'end' }} aria-label={t('notesClearSearch')}\n          onClick={() => { onChange(''); input.current?.focus(); }}>\u2715</button>}\n    </div>\n    <span role=\"status\" aria-live=\"polite\" style={noteSearchStatusStyle}>{t('notesSearchCount', { shown: numbers.format(shown), total: numbers.format(total) })}</span>\n    {loadedOnly && <span style={noteSearchStatusStyle}>{t('notesSearchLoadedScope')}</span>}\n  </div>;\n};\n"
    },
    {
      "file": "src/styles/noteSearch.ts",
      "content": "import type { React } from 'jimu-core';\n/** Fixed search controls; only the existing notes list scrolls. */\nexport const noteSearchStyle: React.CSSProperties = { display: 'grid', gap: 4, flexShrink: 0, minWidth: 0, width: '100%', fontSize: 11, color: '#d3e2d9' };\nexport const noteSearchRowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 6, minWidth: 0 };\nexport const noteSearchInputStyle: React.CSSProperties = { width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '6px 8px', border: '1px solid #526e60', borderRadius: 5, background: '#14251d', color: '#f2f7f4', font: 'inherit' };\nexport const noteSearchClearStyle: React.CSSProperties = { padding: '4px 8px', border: '1px solid #526e60', borderRadius: 5, background: '#214233', color: '#e4f2ea', cursor: 'pointer', font: 'inherit' };\nexport const noteSearchStatusStyle: React.CSSProperties = { fontSize: 10, color: '#acc8b8', overflowWrap: 'anywhere' };\n"
    },
    {
      "file": "tests/noteSearch.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst moduleObject={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/field-notes/noteSearch.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(moduleObject,moduleObject.exports);\nconst {filterNotes}=moduleObject.exports;\nconst notes=[{id:'a',category:'Caf\u00e9 Road',note:'Broken sidewalk',resolutionNote:'Crew assigned',status:'in_progress'}, {id:'b',category:'Sign',note:'Repaired bridge',status:'completed'}, {id:'c',category:'Other',note:'Literal [x] 100% _'}, {id:'d',category:'Other',note:'\u0130STANBUL'}];\nconst labels={open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'};\nconst ids=(query,locale='en-US')=>filterNotes(notes,query,locale,labels).map(n=>n.id);\ntest('blank searches reuse the complete array without changing order',()=>{assert.equal(filterNotes(notes,'  \\n ','en-US',labels),notes);});\ntest('note text, category, resolution and raw/localized statuses are searchable',()=>{assert.deepEqual(ids('sidewalk'),['a']);assert.deepEqual(ids('cafe'),['a']);assert.deepEqual(ids('crew'),['a']);assert.deepEqual(ids('progress'),['a']);assert.deepEqual(ids('completed'),['b']);assert.deepEqual(ids('open'),['c','d']);assert.deepEqual(filterNotes(notes,'En cours','fr',{...labels,in_progress:'En cours'}).map(n=>n.id),['a']);});\ntest('multiple terms may match across fields and all must match',()=>{assert.deepEqual(ids('ROAD assigned'),['a']);assert.deepEqual(ids('ROAD bridge'),[]);});\ntest('matching uses literal input instead of wildcard or regular expression syntax',()=>{assert.deepEqual(ids('[x]'),['c']);assert.deepEqual(ids('100% _'),['c']);assert.deepEqual(ids('.*'),[]);});\ntest('locale-aware case folding handles Turkish dotted I',()=>{assert.deepEqual(ids('istanbul','tr-TR'),['d']);});\ntest('filtering preserves note identity and never mutates source records',()=>{const copy=JSON.stringify(notes),result=filterNotes(notes,'bridge','en-US',labels);assert.equal(result[0],notes[1]);assert.equal(JSON.stringify(notes),copy);});\ntest('newly loaded notes immediately participate in the same query',()=>{assert.equal(filterNotes(notes,'new','en-US',labels).length,0);assert.equal(filterNotes([...notes,{id:'new',note:'New record'}],'new','en-US',labels).length,1);});\n"
    },
    {
      "file": "tests/noteSearch.browser.cjs",
      "content": "/** Mount actual note lists with real React/Chromium; only host SDK and locale context are fixtures. */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=path.resolve(__dirname,'..'),modules={};\nfunction add(file){const key=path.relative(root,file).replace(/\\\\/g,'/');if(modules[key])return key;const source=fs.readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;modules[key]={code,deps:{}};for(const match of code.matchAll(/require\\(\"([^\"]+)\"\\)/g)){const id=match[1];if(id==='jimu-core'||id.endsWith('WidgetLocale'))continue;let resolved=path.resolve(path.dirname(file),id);if(!path.extname(resolved))resolved=fs.existsSync(resolved+'.tsx')?resolved+'.tsx':resolved+'.ts';modules[key].deps[id]=add(resolved);}return key;}\nconst local=add(path.join(root,'src/features/field-notes/LocalNotesList.tsx')),enterprise=add(path.join(root,'src/features/field-notes/EnterpriseNotesList.tsx')),en=add(path.join(root,'src/i18n/messages.ts')),ar=add(path.join(root,'src/i18n/locales/ar.ts'));\nconst bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};window.Context=React.createContext(null);function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>React.useContext(Context),OwnedMessage:({source,values={}})=>source.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}')} :load(entry.deps[id]),m,m.exports);return m.exports;}\nconst Local=load(${JSON.stringify(local)}).LocalNotesList,Enterprise=load(${JSON.stringify(enterprise)}).EnterpriseNotesList,catalogs={en:load(${JSON.stringify(en)}).en,ar:load(${JSON.stringify(ar)}).default};\nwindow.events=[];window.loads=[];window.rows=[{id:'A',category:'Caf\u00e9 Road',note:'Broken sidewalk',resolutionNote:'Crew assigned',status:'in_progress',createdAt:1700000000000,lon:1,lat:2,source:'manual',imageId:null},{id:'B',category:'Sign',note:'Repaired bridge',status:'completed',createdAt:1700000000001,lon:3,lat:4,source:'manual',imageId:null},{id:'C',category:'Other',note:'Literal [x] 100% _',createdAt:1700000000002,lon:5,lat:6,source:'manual',imageId:null}];\nconst loadPage=async(offset,signal)=>{loads.push(offset);return offset===0?{notes:rows.slice(0,2),nextOffset:2,hasMore:true}:{notes:[{...rows[2],note:'New additional note'}],nextOffset:3,hasMore:false};};\nlet currentRoot;window.mount=(kind='local',width=320)=>{currentRoot?.unmount();document.body.innerHTML='<div id=\"root\"></div>';const target=document.getElementById('root');Object.assign(target.style,{width:width+'px',height:'300px',display:'flex',flexDirection:'column',background:'#14251d',padding:'8px',boxSizing:'border-box'});function Fixture(){const[notes,setNotes]=React.useState(rows),[confirm,setConfirm]=React.useState(false),[language,setLanguage]=React.useState('en');window.setLanguage=setLanguage;const input=React.useRef(null);const value=React.useMemo(()=>({locale:language,formatLocale:language==='ar'?'ar':'en-US',t:(key,values={})=>(catalogs[language][key]||key).replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}')}),[language]);return React.createElement(Context.Provider,{value},React.createElement('div',{dir:language==='ar'?'rtl':'ltr',style:{display:'flex',flexDirection:'column',minHeight:0,flex:1}},kind==='local'?React.createElement(Local,{notes,fileInputRef:input,isConfirmingClear:confirm,setIsConfirmingClear:setConfirm,onDeleteNote:id=>{events.push(['delete',id]);setNotes(previous=>previous.filter(note=>note.id!==id))},onClearAll:()=>{events.push(['clear',notes.length]);setNotes([])},onExport:()=>events.push(['export',notes.length]),onImportFile:()=>{},onFocusNote:note=>events.push(['focus',note.id]),onEditNote:id=>events.push(['edit',id]),onCloseList:()=>events.push(['close'])}):React.createElement(Enterprise,{loadPage,onFocus:note=>events.push(['focus',note.id]),onClose:()=>{}})));}currentRoot=ReactDOM.createRoot(target);currentRoot.render(React.createElement(Fixture));};})();`;\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));let checks=0;\ntry{\n await page.setContent('<html><body></body></html>');\n await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/note-search-react/package/umd/react.development.js'});\n await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/note-search-react-dom/package/umd/react-dom.development.js'});\n await page.addScriptTag({content:bootstrap});\n await page.evaluate(()=>mount());const search=page.getByRole('searchbox',{name:'Search notes'});await search.waitFor();\n assert.equal(await page.getByRole('status').textContent(),'3 of 3 notes');checks++;\n await search.fill('ROAD assigned');await page.getByText('1 of 3 notes',{exact:true}).waitFor();assert.equal(await page.getByText('Repaired bridge',{exact:true}).count(),0);assert.equal(await page.getByText('Broken sidewalk',{exact:true}).count(),1);checks++;\n await page.getByRole('button',{name:'Clear note search'}).click();assert.equal(await search.inputValue(),'');assert.equal(await search.evaluate(node=>document.activeElement===node),true);await page.getByText('3 of 3 notes',{exact:true}).waitFor();checks++;\n await search.fill('bridge');await search.press('Escape');assert.equal(await search.inputValue(),'');await page.getByText('3 of 3 notes',{exact:true}).waitFor();checks++;\n await search.fill('[x]');await page.getByText('1 of 3 notes',{exact:true}).waitFor();assert.equal(await page.getByText('Literal [x] 100% _',{exact:true}).count(),1);checks++;\n await search.fill('no match');await page.getByText('No notes match your search.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Show on map',exact:true}).count(),0);checks++;\n await search.fill('bridge');await page.getByRole('button',{name:'Show on map',exact:true}).click();await page.getByRole('button',{name:'Edit local',exact:true}).click();await page.getByRole('button',{name:'Export',exact:true}).click();assert.deepEqual(await page.evaluate(()=>events),[['focus','B'],['edit','B'],['export',3]]);checks++;\n await page.getByRole('button',{name:'Delete local note'}).click();await page.getByText('0 of 2 notes',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>events.at(-1)),['delete','B']);checks++;\n await page.evaluate(()=>mount('enterprise'));await page.getByText('2 of 2 notes',{exact:true}).waitFor();await page.getByRole('searchbox').fill('new');await page.getByText('0 of 2 notes',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>loads),[0]);assert.equal(await page.getByText('Search covers loaded records. Load more to include additional notes.',{exact:true}).count(),1);checks++;\n await page.getByRole('button',{name:'Load more',exact:true}).click();await page.getByText('1 of 3 notes',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>loads),[0,2]);assert.equal(await page.getByText('New additional note',{exact:true}).count(),1);checks++;\n await page.getByRole('searchbox').fill('bridge');await page.getByText('1 of 3 notes',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>loads),[0,2]);checks++;\n await page.evaluate(()=>mount('local',240));await page.getByRole('searchbox').fill('bridge');assert.equal(await page.getByRole('searchbox').evaluate(node=>{const input=node.getBoundingClientRect(),host=document.getElementById('root').getBoundingClientRect();return input.left>=host.left&&input.right<=host.right;}),true);checks++;\n await page.evaluate(()=>{window.mapClicks=0;document.addEventListener('click',()=>window.mapClicks++);});await page.getByRole('searchbox').click();await page.getByRole('button',{name:'Clear note search'}).click();assert.equal(await page.evaluate(()=>window.mapClicks),0);checks++;\n await page.getByRole('searchbox').fill('bridge');\n await page.evaluate(()=>setLanguage('ar'));await page.getByRole('searchbox',{name:'\u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a'}).waitFor();assert.equal(await page.getByRole('searchbox').inputValue(),'bridge');assert.equal(await page.getByRole('searchbox').evaluate(node=>getComputedStyle(node).direction),'rtl');checks++;\n assert.deepEqual(errors,[]);console.log(checks+' real React/Chromium note-search checks passed.');\n}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});\n"
    },
    {
      "file": "docs/NOTES-SEARCH.md",
      "content": "# Search the notes panel\n\nThe Local and Enterprise tabs now include a search field, clear button and live matching count. Matching covers note text, category, resolution and raw/localized status, without requiring exact case or accents. All whitespace-separated terms must match; terms can occur in different fields. The input is literal text, not a regular expression or SQL query.\n\nLocal search covers the complete local collection. Enterprise search explicitly covers only records loaded in that tab. It does not search the entire organization service. Load more remains available even when the current pages have no matches; newly loaded pages join the same query. Typing never starts a server query, polls, changes map markers or mutates stored notes.\n\nUse the clear button or Escape to reset the query. The clear button returns focus to the search input. Counts follow the active language's number formatting, with all new strings included in the existing 13 supported language choices (British English inherits the English strings). Search fields fit compact panels and inherit RTL direction.\n\n## Preserve source actions\n\nA filtered row still uses its original note object/ID for Show on map, editing, sharing, attachments and deletion. Export, Import and confirmed Clear Local continue to use the complete local collection. Search is display-only and must never become an authoritative collection. Query state is transient and resets when its list unmounts, including tab switches.\n\n## Contributor owners\n\n- `src/features/field-notes/noteSearch.ts`: normalization and pure matching.\n- `src/features/field-notes/NoteSearch.tsx`: accessible controlled search UI.\n- `src/styles/noteSearch.ts`: compact layout and theme styling.\n- LocalNotesList/EnterpriseNotesList: query state and memoized visible rows; existing mutations/paging remain with their owners.\n- `src/i18n/messages.ts`, language catalogs and community translation CSV: shared translations.\n\nNo runtime/widget.tsx change is required.\n\n## Validation\n\nSeven matching tests cover blank input, case/accents, multi-field terms, literal punctuation, Turkish case folding, default/localized statuses, identity/order preservation and new pages. Fourteen real React/Chromium checks cover local results, keyboard/clear focus, empty results, original-row actions, full-source export, deletion under a query, Enterprise scope/paging with no request per keystroke, a 240 px host, Arabic switching and map-click isolation.\n\nThe language/catalog/table tests verify keys, placeholders and translation-table round trips. Four older localNoteCollection clear-feedback fixture tests fail identically on the untouched GitHub baseline because their frozen JSX expectations predate OwnedMessage localization; this feature does not change that owner. Do not claim the full repository test suite passes. A full Experience Builder build and live-host layout check remain separate.\n\nRun from the widget root, with TypeScript available:\n\n    node tests/noteSearch.test.cjs\n\nFor a nonstandard compiler path, set `MAPILLARY_TYPESCRIPT=/path/to/typescript.js`. The browser fixture additionally needs Playwright, Chromium and React 18 UMD files:\n\n    REACT_UMD_PATH=/path/to/react.development.js REACT_DOM_UMD_PATH=/path/to/react-dom.development.js node tests/noteSearch.browser.cjs\n\nOptional browser tool paths: `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`. Fixtures use synthetic records and controlled page loading, not an authenticated Enterprise service.\n\n## Install and rollback\n\nFrom the widget root outside `src`:\n\n    node apply-notes-search.cjs\n\nRebuild and reload Experience Builder. `--dry-run` checks compatibility without writing source. The installer does not run tests or a host build. The standalone uninstaller restores the exact pre-install files and removes newly created search helpers/tests/docs. It refuses changed targets rather than overwriting later edits. Existing hover/click fixes remain untouched.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'notes-search-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed notes search installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'notes-search' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after notes search installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after notes search installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed notes search installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-notes-search.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Notes panel search is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'notes-search', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Notes panel search ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
