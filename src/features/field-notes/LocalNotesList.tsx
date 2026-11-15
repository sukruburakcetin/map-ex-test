/** @jsx jsx */
/** Local note-list presentation. Persistence, server actions and clear-confirmation lifetime remain parent-owned. */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { LinkedDetectionNoteText } from '../detections/LinkedDetectionPreview';
import type { DetectionPreviewLoader } from '../detections/detectionPreview';
import { React, jsx } from 'jimu-core';
import { NotesSearchControls } from './NotesSearchControls';
import { filterNotes } from './noteSearch';
import { FIELD_NOTE_STATUSES } from '../../components/types';
import type { FieldNote } from '../../components/types';
import { noteListToolbarStyle, noteListToolbarActionsStyle, noteListImportStyle, noteListFileInputStyle, noteListExportStyle, noteListEmptyStyle, noteListCategoryStyle, noteListDeleteStyle, noteListShareStyle, getNoteStatusBadgeStyle, noteListResolutionStyle, noteListErrorStyle, noteListTextStyle } from '../../styles/fieldNotes';
import { noteListActionStyle } from '../../styles/fieldNotes';
import { notesSourceHintStyle, enterprisePanelStyle, enterpriseContentStyle, enterpriseRowsStyle, enterpriseRowStyle, enterpriseActionsStyle, notesRowHeadingStyle, notesRowHeaderContentStyle, notesWorkflowStatusStyle, notesRowMetaStyle, notesRowButtonsStyle, notesAttachmentHintStyle } from '../../styles/enterpriseNotes';

export interface LocalNotesListProps {onLoadDetectionPreview?:DetectionPreviewLoader;onLoadDetectionAttachment?:(note:FieldNote,id:string,signal:AbortSignal)=>Promise<string>;
  notes: FieldNote[];
  fileInputRef: { current: HTMLInputElement | null };
  isConfirmingClear: boolean;
  setIsConfirmingClear: (value: boolean) => void;
  sharingEnabled?: boolean;
  editorBusy?: boolean;
  attachmentsBusy?: boolean;
  onShareNote?: (id: string) => void;
  onEditNote?: (id: string) => void;
  onEditSharedNote?: (note: FieldNote) => void;
  onAttachments?: (note: FieldNote) => void;
  onDeleteNote: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onFocusNote: (note: FieldNote) => void;
}

/** Render newest-first local copies and forward actions; clearing never deletes Enterprise records. */
export const LocalNotesList: React.FC<LocalNotesListProps> = props => {
 const { t, formatLocale:locale } = useWidgetLocale();

  const { notes, fileInputRef, isConfirmingClear, setIsConfirmingClear, onDeleteNote, onClearAll, onExport, onImportFile, onFocusNote } = props;
  const [query, setQuery] = React.useState('');
  const visibleNotes = React.useMemo(() => filterNotes(notes, query, locale, {
    open: t('uiStatusOpen'), in_progress: t('uiStatusProgress'), completed: t('uiStatusCompleted'), dismissed: t('uiStatusDismissed'),
  }), [notes, query, locale, t]);
  return (
<div role="tabpanel" aria-label={t('uiLocalNotes')} className="mly-notes-scroll" tabIndex={0} style={enterprisePanelStyle}>
                    <div style={enterpriseContentStyle}>
                    {/* Tools and cards share one viewport so every local copy remains reachable. */}
                    <div style={noteListToolbarStyle}>
                        <span>{notes.length > 0 ? <OwnedMessage source={notes.length === 1 ? "{count} local note" : "{count} local notes"} values={{count:notes.length}}/> : t('uiNoLocalNotes')}</span>
                        <div style={noteListToolbarActionsStyle}>
                            {/* Import Button */}
                            <button className="mly-text-action"
                                onClick={() => fileInputRef.current?.click()}
                                style={noteListImportStyle}
                                    > {t('uiImport')} </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.geojson,application/json,application/geo+json"
                                style={noteListFileInputStyle}
                                onChange={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    const file = target.files?.[0];
                                    if (file) onImportFile(file);
                                    target.value = ""; // Reset input so same file can be reselected
                                }}
                            />
                            {/* Export Button */}
                            <button className="mly-text-action"
                                onClick={onExport}
                                style={noteListExportStyle}
                                > {t('uiExport')} </button>
                            {notes.length > 0 && (
                                <button className="mly-text-action"
                                    onClick={() => {
                                        if (notes.some(note => note.sharedStatus === "saving")) return;
                                        if (isConfirmingClear) {
                                            onClearAll();
                                            setIsConfirmingClear(false);
                                        } else {
                                            setIsConfirmingClear(true);
                                            // Reset back to "Clear All" after 3 seconds if not confirmed
                                            setTimeout(() => setIsConfirmingClear(false), 3000);
                                        }
                                    }}
                                    disabled={notes.some(note => note.sharedStatus === "saving")}
                                    title={isConfirmingClear ? t('uiClickAgainToConfirmRemovalOfLocalCopies') : t('uiClearLocalNotesSharedNotesRemainInThe')}
                                    style={{
                                        fontSize: "10px",
                                        padding: "3px 8px",
                                        borderRadius: "5px",
                                        border: isConfirmingClear ? "1px solid #ff4444" : "1px solid rgba(255, 75, 75, 0.35)",
                                        background: isConfirmingClear ? "#ff4444" : "rgba(255, 50, 50, 0.15)",
                                        color: isConfirmingClear ? "#ffffff" : "#ff8888",
                                        fontWeight: isConfirmingClear ? 700 : 400,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    {isConfirmingClear ? t('uiConfirmClearLocal') : t('uiClearLocal')}
                                </button>
                            )}
                        </div>
                    </div>

                    <NotesSearchControls query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} />
                    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={noteListEmptyStyle}>{t('notesSearchEmpty')}</div>}
                    {isConfirmingClear && <div role="status" style={notesSourceHintStyle}> {t('uiLocalRecordsWillBeRemovedEnterpriseNotesWill')} </div>}
                    <div style={enterpriseRowsStyle}>
                        {notes.length === 0 && (
                            <div style={noteListEmptyStyle}>
                                 {t('uiYouCanGetStartedByImportingAGeojson')} </div>
                        )}
                        {visibleNotes.slice().reverse().map(n => (
                            <div
                                key={n.id}
                                style={{ ...enterpriseRowStyle, borderLeft: `3px solid ${n.source === 'manual' ? '#f5a623' : '#35AF6D'}` }}
                            >
                                <div style={notesRowHeadingStyle}>
                                    <div style={notesRowHeaderContentStyle}>
                                      <span style={noteListCategoryStyle}>{n.category}</span>
                                      <span style={notesRowMetaStyle}>{new Date(n.createdAt).toLocaleString(locale)}</span>
                                <span style={{ fontSize: 10, color: n.sharedStatus === "failed" ? "#ffb8a6" : "#9ed9df" }}>{n.sharedStatus === "saving" ? t('uiSavingToOrganization') : n.sharedStatus === "shared" ? t('uiSharedLocalCopy') : n.sharedStatus === "failed" ? t('uiShareFailedLocalDraftPreserved') : t('uiLocalDraft')}
                                  {props.sharingEnabled && n.sharedStatus !== "shared" && <button className="mly-text-action" type="button" disabled={n.sharedStatus === "saving"} onClick={event => { event.stopPropagation(); props.onShareNote?.(n.id); }} title={n.sharedStatus === "failed" ? t('uiRetrySavingThisLocalDraftToYourOrganization') : t('uiSaveThisLocalNoteToYourOrganizationS')} style={noteListShareStyle}>{n.sharedStatus === "failed" ? t('uiRetrySharing') : t('uiShare')}</button>}
                                </span>
                                    </div>
                                    <button type="button" aria-label={n.sharedStatus === "shared" ? t('uiRemoveLocalCopyEnterpriseNoteRemains') : t('uiDeleteLocalNote')}
                                        onClick={(e) => { e.stopPropagation(); onDeleteNote(n.id); }}
                                        style={noteListDeleteStyle}
                                        title={n.sharedStatus === "shared" ? t('uiRemoveLocalCopyEnterpriseNoteRemains') : t('uiDeleteLocalNote')}
                                    ><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></svg></button>
                                </div>
                                <div style={enterpriseActionsStyle}>
                                  <div style={notesWorkflowStatusStyle}><span>{t('uiStatus')}:</span><span style={getNoteStatusBadgeStyle(n.status)}>{t(n.status==='in_progress'?'uiStatusProgress':n.status==='completed'?'uiStatusCompleted':n.status==='dismissed'?'uiStatusDismissed':'uiStatusOpen')}</span></div>
                                  <div style={notesRowButtonsStyle}>
                                  <button className="mly-text-action" type="button" style={noteListActionStyle} disabled={!Number.isFinite(n.lon) || !Number.isFinite(n.lat)} onClick={() => onFocusNote(n)}> {t('uiShowOnMap')} </button>
                                  <button className="mly-text-action" type="button" disabled={n.sharedStatus === "saving" || !!props.editorBusy} onClick={event => { event.stopPropagation(); props.onEditNote?.(n.id); }} style={{ ...noteListActionStyle, opacity: n.sharedStatus === "saving" || props.editorBusy ? 0.45 : 1 }}> {t('uiEditLocal')} </button>
                                  {props.sharingEnabled && n.sharedStatus === "shared" && <button className="mly-text-action" type="button" disabled={!!props.editorBusy} onClick={event => { event.stopPropagation(); props.onEditSharedNote?.(n); }} style={{ ...noteListActionStyle, opacity: props.editorBusy ? 0.45 : 1 }}> {t('uiUpdateShared')} </button>}
                                  {props.sharingEnabled && n.sharedStatus === "shared" && <button className="mly-text-action" type="button" disabled={!!props.attachmentsBusy} style={{ ...noteListActionStyle, opacity: props.attachmentsBusy ? 0.45 : 1 }} onClick={event => { event.stopPropagation(); props.onAttachments?.(n); }}> {t('uiAttachments')} </button>}
                                  </div>
                                </div>
                                {n.sharedStatus !== "shared" && props.sharingEnabled && <div style={notesAttachmentHintStyle}> {t('uiShareFirstToAttachFiles')} </div>}
                                {n.note && <div style={noteListTextStyle}><LinkedDetectionNoteText value={n.note} loadAttachment={props.onLoadDetectionAttachment?(id,signal)=>props.onLoadDetectionAttachment!(n,id,signal):undefined} load={props.onLoadDetectionPreview}/></div>}
                                {n.resolutionNote && <div style={noteListResolutionStyle}> {t('uiResolution')} {n.resolutionNote}</div>}
                                {n.sharedError && <div style={noteListErrorStyle}>{<OwnedMessage source={String(n.sharedError ?? "")}/>}</div>}


                            </div>
                        ))}
                    </div>
                    </div>
                    </div>
  );
};
