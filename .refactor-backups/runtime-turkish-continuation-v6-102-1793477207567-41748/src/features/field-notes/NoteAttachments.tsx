/** @jsx jsx */
/** Attachment dialog presentation; authenticated uploads/downloads remain runtime-owned. */
import { React, jsx } from 'jimu-core';
import type { FieldNoteAttachments } from '../../components/types';
import { noteErrorStyle, noteAttachmentDialogStyle, noteAttachmentHelpStyle, noteAttachmentFieldsetStyle, noteAttachmentInputStyle, noteAttachmentListStyle, noteAttachmentRowStyle, noteAttachmentStatusStyle, noteAttachmentFooterStyle, noteAttachmentButtonStyle, noteAttachmentActionsStyle } from '../../styles/fieldNotes';

export interface NoteAttachmentsProps {
  attachments: FieldNoteAttachments;
  currentImageAvailable?: boolean;
  onUploadAttachment?: (file?: File, currentImage?: boolean) => void;
  onDownloadAttachment?: (id: number) => void;
  onCloseAttachments?: () => void;
}

/** Render attachment state and forward actions; file input is reset after each selection. */
export const NoteAttachments: React.FC<NoteAttachmentsProps> = props => {
  const fileInput = React.useRef<HTMLInputElement | null>(null);
  return (
<div role="dialog" aria-modal="true" aria-label="Field note attachments" style={noteAttachmentDialogStyle}>
              <strong>Shared note attachments</strong>
              <p style={noteAttachmentHelpStyle}>Files are stored in your organization's layer. Maximum 20 MB per file; server limits and permissions apply.</p>
              <fieldset disabled={props.attachments.busy} style={{ ...noteAttachmentFieldsetStyle, opacity: props.attachments.busy ? 0.6 : 1 }}>
                <input ref={fileInput} type="file" aria-label="Attach a document or picture" style={noteAttachmentInputStyle} onChange={event => { const file = event.target.files?.[0]; if (file) props.onUploadAttachment?.(file); event.target.value = ""; }} />
                <div style={noteAttachmentActionsStyle}>
                  <button type="button" style={noteAttachmentButtonStyle} onClick={() => fileInput.current?.click()}>Choose file…</button>
                  <button type="button" style={noteAttachmentButtonStyle} disabled={!props.currentImageAvailable} title="Attach the current Mapillary photo at up to 2048 pixels; this is not a screenshot of the viewer" onClick={() => props.onUploadAttachment?.(undefined, true)}>Attach current image</button>
                </div>
                <div style={noteAttachmentListStyle}>{props.attachments.items.length ? props.attachments.items.map(item => <div key={item.id} style={noteAttachmentRowStyle}><button type="button" style={noteAttachmentButtonStyle} onClick={() => props.onDownloadAttachment?.(item.id)}>{item.name}</button>{item.size ? ` · ${Math.ceil(item.size / 1024)} KB` : ""}</div>) : "No attachments yet."}</div>
                {props.attachments.message && <div role="status" style={noteAttachmentStatusStyle}>{props.attachments.message}</div>}
                {props.attachments.error && <div role="alert" style={noteErrorStyle}>{props.attachments.error}</div>}
                <div style={noteAttachmentFooterStyle}><button type="button" style={noteAttachmentButtonStyle} onClick={props.onCloseAttachments}>{props.attachments.busy ? "Uploading…" : "Close"}</button></div>
              </fieldset>
            </div>
  );
};
