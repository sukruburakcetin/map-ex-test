/** @jsx jsx */
/** Attachment dialog presentation; authenticated uploads/downloads remain runtime-owned. */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
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
 const { t, locale } = useWidgetLocale();

  const fileInput = React.useRef<HTMLInputElement | null>(null);
  return (
<div role="dialog" aria-modal="true" aria-label={t('uiFieldNoteAttachments')} style={noteAttachmentDialogStyle}>
              <strong> {t('uiSharedNoteAttachments')} </strong>
              <p style={noteAttachmentHelpStyle}> {t('uiFilesAreStoredInYourOrganizationSLayer')} </p>
              <fieldset disabled={props.attachments.busy} style={{ ...noteAttachmentFieldsetStyle, opacity: props.attachments.busy ? 0.6 : 1 }}>
                <input ref={fileInput} type="file" aria-label={t('uiAttachADocumentOrPicture')} style={noteAttachmentInputStyle} onChange={event => { const file = event.target.files?.[0]; if (file) props.onUploadAttachment?.(file); event.target.value = ""; }} />
                <div style={noteAttachmentActionsStyle}>
                  <button className="mly-text-action" type="button" style={noteAttachmentButtonStyle} onClick={() => fileInput.current?.click()}> {t('uiChooseFile')} </button>
                  <button className="mly-text-action" type="button" style={noteAttachmentButtonStyle} disabled={!props.currentImageAvailable} title={t('uiAttachTheCurrentMapillaryPhotoAtUpTo')} onClick={() => props.onUploadAttachment?.(undefined, true)}> {t('uiAttachCurrentImage')} </button>
                </div>
                <div style={noteAttachmentListStyle}>{props.attachments.items.length ? props.attachments.items.map(item => <div key={item.id} style={noteAttachmentRowStyle}><button type="button" style={noteAttachmentButtonStyle} onClick={() => props.onDownloadAttachment?.(item.id)}>{item.name}</button>{item.size ? ` · ${Math.ceil(item.size / 1024)} KB` : ""}</div>) : t('uiNoAttachmentsYet')}</div>
                {props.attachments.message && <div role="status" style={noteAttachmentStatusStyle}>{<OwnedMessage source={String(props.attachments.message ?? "")}/>}</div>}
                {props.attachments.error && <div role="alert" style={noteErrorStyle}>{<OwnedMessage source={String(props.attachments.error ?? "")}/>}</div>}
                <div style={noteAttachmentFooterStyle}><button className="mly-text-action" type="button" style={noteAttachmentButtonStyle} onClick={props.onCloseAttachments}>{props.attachments.busy ? t('uiUploading') : t('uiClose')}</button></div>
              </fieldset>
            </div>
  );
};
