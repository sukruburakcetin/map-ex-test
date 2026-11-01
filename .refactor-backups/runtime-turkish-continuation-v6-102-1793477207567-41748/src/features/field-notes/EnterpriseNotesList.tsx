/** @jsx jsx */
/** Paged Enterprise records; mounted only for the open Enterprise tab. No automatic polling. */
import { React, jsx } from 'jimu-core';
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
      if (!controller.signal.aborted && (failure as Error)?.name !== 'AbortError') { setFailedOffset(offset); setError('Enterprise notes could not load. Check access or retry.'); }
    } finally {
      if (!controller.signal.aborted && request.current === controller) setBusy(false);
    }
  }, [props.loadPage]);
  React.useEffect(() => {
    setNotes([]); setHasMore(false); setNextOffset(0);
    void load(0);
    return () => { request.current?.abort(); };
  }, [load, props.context, props.layerUrl]);
  return <div role="tabpanel" aria-label="Enterprise notes" style={notesLocalPanelStyle}>
    <div style={enterpriseToolbarStyle}><span>{notes.length} Enterprise note{notes.length === 1 ? '' : 's'} loaded</span>
      <div><button type="button" style={noteActionStyle} disabled={busy} onClick={() => void load(0)}>Refresh</button>{' '}
      <button type="button" style={noteActionStyle} onClick={props.onClose} aria-label="Close notes list">Close</button></div>
    </div>
    <p style={notesSourceHintStyle}>Organization records · Refresh for latest. Clear local keeps these records.</p>
    {busy && <div role="status" style={notesSourceHintStyle}>Loading Enterprise notes…</div>}
    {error && <div role="alert" style={enterpriseErrorStyle}>{error} <button type="button" style={noteActionStyle} disabled={busy} onClick={() => void load(failedOffset)}>Retry</button></div>}
    {!busy && !error && notes.length === 0 && <div style={notesSourceHintStyle}>No Enterprise notes are available in this layer.</div>}
    <div style={enterpriseRowsStyle}>{notes.map(note => {
      const validPosition = Number.isFinite(note.lon) && Number.isFinite(note.lat);
      const canManage = !!note.sharedGlobalId && !!note.sharedLayerUrl;
      return <div key={note.id} style={enterpriseRowStyle}>
        <div style={notesRowHeadingStyle}><strong>{note.category}</strong><span style={notesRowMetaStyle}>{Number.isFinite(note.createdAt) && new Date(note.createdAt).toLocaleString()}</span></div>
        {note.note && <div>{note.note}</div>}{note.resolutionNote && <div>Resolution: {note.resolutionNote}</div>}
        <div style={enterpriseActionsStyle}>
          <span style={getNoteStatusBadgeStyle(note.status)}>{FIELD_NOTE_STATUSES.find(status => status.value === note.status)?.label || 'Open'}</span>
          <div style={notesRowButtonsStyle}>
          <button type="button" style={noteListActionStyle} disabled={!validPosition} onClick={() => props.onFocus(note)}>Show on map</button>
          {canManage && props.onEdit && <button type="button" style={noteListActionStyle} disabled={props.editorBusy} onClick={() => props.onEdit?.(note)}>Update shared</button>}
          {canManage && props.onAttachments && <button type="button" style={noteListActionStyle} disabled={props.attachmentsBusy} onClick={() => props.onAttachments?.(note)}>Attachments</button>}
          </div>
        </div>
        {!canManage && <div style={notesSourceHintStyle}>Read-only record. Shared actions require a GlobalID and an editable layer.</div>}
      </div>;
    })}</div>
    {hasMore && <button type="button" style={noteActionStyle} disabled={busy} onClick={() => void load(nextOffset)}>Load more</button>}
  </div>;
};
