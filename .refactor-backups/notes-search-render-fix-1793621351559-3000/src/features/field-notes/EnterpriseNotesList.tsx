/** @jsx jsx */
/** Paged Enterprise records; mounted only for the open Enterprise tab. No automatic polling. */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { NoteSearch } from './NoteSearch';
import { filterNotes } from './noteSearch';
import { FIELD_NOTE_STATUSES } from '../../components/types';
import type { FieldNote } from '../../components/types';
import type { EnterpriseNotesLoader } from './enterpriseList';
import { noteActionStyle, noteListActionStyle, getNoteStatusBadgeStyle } from '../../styles/fieldNotes';
import { enterpriseToolbarStyle, enterpriseRowsStyle, enterpriseRowStyle, enterpriseActionsStyle, notesSourceHintStyle, enterpriseErrorStyle, notesLocalPanelStyle, notesRowHeadingStyle, notesRowMetaStyle, notesRowButtonsStyle } from '../../styles/enterpriseNotes';

export interface EnterpriseNotesListProps {
  loadPage: EnterpriseNotesLoader;
  context?: unknown;
  layerUrl?: string;
  editorBusy?: boolean;
  attachmentsBusy?: boolean;
  onFocus: (note: FieldNote) => void;
  onEdit?: (note: FieldNote) => void;
  onAttachments?: (note: FieldNote) => void;
  onClose: () => void;
}

/** Abort obsolete/unmounted requests and retain loaded rows when a subsequent page fails. */
export const EnterpriseNotesList: React.FC<EnterpriseNotesListProps> = props => {
 const { t, formatLocale:locale } = useWidgetLocale();

  const [notes, setNotes] = React.useState<FieldNote[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [nextOffset, setNextOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [failedOffset, setFailedOffset] = React.useState(0);
  const request = React.useRef<AbortController | null>(null);
  const load = React.useCallback(async (offset: number) => {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError('');
    try {
      const page = await props.loadPage(offset, controller.signal);
      if (controller.signal.aborted || request.current !== controller) return;
      setNotes(previous => offset === 0 ? page.notes : Array.from(new Map([...previous, ...page.notes].map(note => [note.id, note])).values()));
      setNextOffset(page.nextOffset); setHasMore(page.hasMore);
    } catch (failure) {
      if (!controller.signal.aborted && (failure as Error)?.name !== 'AbortError') { setFailedOffset(offset); setError('load'); }
    } finally {
      if (!controller.signal.aborted && request.current === controller) setBusy(false);
    }
  }, [props.loadPage]);
  React.useEffect(() => {
    setNotes([]); setHasMore(false); setNextOffset(0);
    void load(0);
    return () => { request.current?.abort(); };
  }, [load, props.context, props.layerUrl]);
  const [query, setQuery] = React.useState('');
  const visibleNotes = React.useMemo(() => filterNotes(notes, query, locale, {
    open: t('uiStatusOpen'), in_progress: t('uiStatusProgress'), completed: t('uiStatusCompleted'), dismissed: t('uiStatusDismissed'),
  }), [notes, query, locale, t]);
  return <div role="tabpanel" aria-label={t('uiEnterpriseNotes')} style={notesLocalPanelStyle}>
    <div style={enterpriseToolbarStyle}><span>{t(notes.length===1?'uiEnterpriseCountOne':'uiEnterpriseCountMany',{count:new Intl.NumberFormat(locale).format(notes.length)})} </span>
      <div><button type="button" style={noteActionStyle} disabled={busy} onClick={() => void load(0)}> {t('uiRefresh')} </button>{' '}
      <button type="button" style={noteActionStyle} onClick={props.onClose} aria-label={t('uiCloseNotesList')}> {t('uiClose')} </button></div>
    </div>
    <NoteSearch query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} loadedOnly />
    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={notesSourceHintStyle}>{t('notesSearchEmpty')}</div>}
    <p style={notesSourceHintStyle}> {t('uiOrganizationRecordsRefreshForLatestClearLocalKeeps')} </p>
    {busy && <div role="status" style={notesSourceHintStyle}> {t('uiLoadingEnterpriseNotes')} </div>}
    {error && <div role="alert" style={enterpriseErrorStyle}>{t('uiEnterpriseLoadError')} <button type="button" style={noteActionStyle} disabled={busy} onClick={() => void load(failedOffset)}> {t('uiRetry')} </button></div>}
    {!busy && !error && notes.length === 0 && <div style={notesSourceHintStyle}> {t('uiNoEnterpriseNotesAreAvailableInThisLayer')} </div>}
    <div style={enterpriseRowsStyle}>{visibleNotes.map(note => {
      const validPosition = Number.isFinite(note.lon) && Number.isFinite(note.lat);
      const canManage = !!note.sharedGlobalId && !!note.sharedLayerUrl;
      return <div key={note.id} style={enterpriseRowStyle}>
        <div style={notesRowHeadingStyle}><strong>{note.category}</strong><span style={notesRowMetaStyle}>{Number.isFinite(note.createdAt) && new Date(note.createdAt).toLocaleString(locale)}</span></div>
        {note.note && <div>{note.note}</div>}{note.resolutionNote && <div> {t('uiResolution')} {note.resolutionNote}</div>}
        <div style={enterpriseActionsStyle}>
          <span style={getNoteStatusBadgeStyle(note.status)}>{t(note.status==='in_progress'?'uiStatusProgress':note.status==='completed'?'uiStatusCompleted':note.status==='dismissed'?'uiStatusDismissed':'uiStatusOpen')}</span>
          <div style={notesRowButtonsStyle}>
          <button type="button" style={noteListActionStyle} disabled={!validPosition} onClick={() => props.onFocus(note)}> {t('uiShowOnMap')} </button>
          {canManage && props.onEdit && <button type="button" style={noteListActionStyle} disabled={props.editorBusy} onClick={() => props.onEdit?.(note)}> {t('uiUpdateShared')} </button>}
          {canManage && props.onAttachments && <button type="button" style={noteListActionStyle} disabled={props.attachmentsBusy} onClick={() => props.onAttachments?.(note)}> {t('uiAttachments')} </button>}
          </div>
        </div>
        {!canManage && <div style={notesSourceHintStyle}> {t('uiReadOnlyRecordSharedActionsRequireAGlobalid')} </div>}
      </div>;
    })}</div>
    {hasMore && <button type="button" style={noteActionStyle} disabled={busy} onClick={() => void load(nextOffset)}> {t('uiLoadMore')} </button>}
  </div>;
};
