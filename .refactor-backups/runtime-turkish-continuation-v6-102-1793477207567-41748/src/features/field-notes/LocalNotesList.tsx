/** @jsx jsx */
/** Local note-list presentation. Persistence, server actions and clear-confirmation lifetime remain parent-owned. */
import { React, jsx } from 'jimu-core';
import { FIELD_NOTE_STATUSES } from '../../components/types';
import type { FieldNote } from '../../components/types';
import { noteListToolbarStyle, noteListToolbarActionsStyle, noteListImportStyle, noteListFileInputStyle, noteListExportStyle, noteListCloseStyle, noteListEmptyStyle, noteListCategoryStyle, noteListDeleteStyle, noteListShareStyle, getNoteStatusBadgeStyle, noteListResolutionStyle, noteListErrorStyle, noteListTextStyle } from '../../styles/fieldNotes';
import { noteListActionStyle } from '../../styles/fieldNotes';
import { notesSourceHintStyle, notesLocalPanelStyle, enterpriseRowsStyle, enterpriseActionsStyle, notesRowHeadingStyle, notesRowMetaStyle, notesRowButtonsStyle, notesAttachmentHintStyle } from '../../styles/enterpriseNotes';

export interface LocalNotesListProps {
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
  onCloseList: () => void;
}

/** Render newest-first local copies and forward actions; clearing never deletes Enterprise records. */
export const LocalNotesList: React.FC<LocalNotesListProps> = props => {
  const { notes, fileInputRef, isConfirmingClear, setIsConfirmingClear, onDeleteNote, onClearAll, onExport, onImportFile, onFocusNote, onCloseList } = props;
  return (
<div role="tabpanel" aria-label="Local notes" style={notesLocalPanelStyle}>
                    {/* Fixed Header: Actions remain visible at all times */}
                    <div style={noteListToolbarStyle}>
                        <span>{notes.length > 0 ? `${notes.length} local note${notes.length > 1 ? 's' : ''}` : 'No local notes'}</span>
                        <div style={noteListToolbarActionsStyle}>
                            {/* Import Button */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={noteListImportStyle}
                                    >Import
                                </button>
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
                            <button
                                onClick={onExport}
                                style={noteListExportStyle}
                                >Export
                            </button>
                            {notes.length > 0 && (
                                <button
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
                                    title={isConfirmingClear ? "Click again to confirm removal of local copies" : "Clear local notes; shared notes remain in the enterprise layer"}
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
                                    {isConfirmingClear ? "Confirm clear local" : "Clear local"}
                                </button>
                            )}
                            {/* Close Button */}
                            <button
                                onClick={onCloseList}
                                style={noteListCloseStyle}
                            >✕</button>
                        </div>
                    </div>

                    {isConfirmingClear && <div role="status" style={notesSourceHintStyle}>Local records will be removed. Enterprise notes will remain.</div>}
                    <div style={enterpriseRowsStyle}>
                        {notes.length === 0 && (
                            <div style={noteListEmptyStyle}>
                                You can get started by importing a GeoJSON file.
                            </div>
                        )}
                        {notes.slice().reverse().map(n => (
                            <div
                                key={n.id}
                                style={{
                                    padding: "5px 8px", borderRadius: "6px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderLeft: `3px solid ${n.source === 'manual' ? '#f5a623' : '#35AF6D'}`,
                                    flexShrink: 0
                                }}
                            >
                                <div style={notesRowHeadingStyle}>
                                    <span style={noteListCategoryStyle}>{n.category} <span style={notesRowMetaStyle}>{new Date(n.createdAt).toLocaleString()}</span></span>
                                    <span role="button" tabIndex={0} aria-label={n.sharedStatus === "shared" ? "Remove local copy; enterprise note remains" : "Delete local note"}
                                        onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onDeleteNote(n.id); } }}
                                        onClick={(e) => { e.stopPropagation(); onDeleteNote(n.id); }}
                                        style={noteListDeleteStyle}
                                    >✕</span>
                                </div>
                                <div style={{ fontSize: 10, marginTop: 3, color: n.sharedStatus === "failed" ? "#ffb8a6" : "#9ed9df" }}>{n.sharedStatus === "saving" ? "Saving to organization…" : n.sharedStatus === "shared" ? "Shared · local copy" : n.sharedStatus === "failed" ? "Share failed · local draft preserved" : "Local draft"}
                                  {props.sharingEnabled && n.sharedStatus !== "shared" && <button type="button" disabled={n.sharedStatus === "saving"} onClick={event => { event.stopPropagation(); props.onShareNote?.(n.id); }} title={n.sharedStatus === "failed" ? "Retry saving this local draft to your organization’s field-notes layer. The local copy is kept." : "Save this local note to your organization’s field-notes layer so others with access can view it. The local copy is kept."} style={noteListShareStyle}>{n.sharedStatus === "failed" ? "Retry sharing" : "Share"}</button>}
                                </div>
                                <div style={enterpriseActionsStyle}>
                                  <span style={getNoteStatusBadgeStyle(n.status)}>{FIELD_NOTE_STATUSES.find(item => item.value === (n.status || "open"))?.label || "Open"}</span>
                                  <div style={notesRowButtonsStyle}>
                                  <button type="button" style={noteListActionStyle} disabled={!Number.isFinite(n.lon) || !Number.isFinite(n.lat)} onClick={() => onFocusNote(n)}>Show on map</button>
                                  <button type="button" disabled={n.sharedStatus === "saving" || !!props.editorBusy} onClick={event => { event.stopPropagation(); props.onEditNote?.(n.id); }} style={{ ...noteListActionStyle, opacity: n.sharedStatus === "saving" || props.editorBusy ? 0.45 : 1 }}>Edit local</button>
                                  {props.sharingEnabled && n.sharedStatus === "shared" && <button type="button" disabled={!!props.editorBusy} onClick={event => { event.stopPropagation(); props.onEditSharedNote?.(n); }} style={{ ...noteListActionStyle, opacity: props.editorBusy ? 0.45 : 1 }}>Update shared</button>}
                                  {props.sharingEnabled && n.sharedStatus === "shared" && <button type="button" disabled={!!props.attachmentsBusy} style={{ ...noteListActionStyle, opacity: props.attachmentsBusy ? 0.45 : 1 }} onClick={event => { event.stopPropagation(); props.onAttachments?.(n); }}>Attachments</button>}
                                  </div>
                                </div>
                                {n.sharedStatus !== "shared" && props.sharingEnabled && <div style={notesAttachmentHintStyle}>Share first to attach files.</div>}
                                {n.resolutionNote && <div style={noteListResolutionStyle}>Resolution: {n.resolutionNote}</div>}
                                {n.sharedError && <div style={noteListErrorStyle}>{n.sharedError}</div>}
                                {n.note && <div style={noteListTextStyle}>{n.note}</div>}

                            </div>
                        ))}
                    </div>
                    </div>
  );
};
