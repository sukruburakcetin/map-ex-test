/** @jsx jsx */
/** Local/shared note editor UI. Persistence, authorization and publication remain parent-owned. */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { FIELD_NOTE_STATUSES } from '../../components/types';
import type { FieldNoteEditor } from '../../components/types';
import { noteEditorInputStyle, noteEditorDialogStyle, noteEditorTitleStyle, noteEditorScopeStyle, noteEditorFieldsetStyle, noteEditorLabelStyle, noteErrorStyle, noteEditorActionsStyle, getNoteEditorCancelStyle, getNoteEditorSaveStyle } from '../../styles/fieldNotes';

export interface NoteEditorProps {
  editor: FieldNoteEditor;
  categories: string[];
  translateDefaultCategories?: boolean;
  onSave: (values: { category: string; note: string; status: string; resolutionNote: string }) => void;
  onCancel: () => void;
}

/** Render the existing draft and report save/cancel intent without owning storage or requests. */
export const NoteEditor: React.FC<NoteEditorProps> = ({ editor, categories, onSave, onCancel, translateDefaultCategories }) => {
 const { t, locale, owned } = useWidgetLocale();

    const [values, setValues] = React.useState({ category: editor.category, note: editor.note, status: editor.status as string, resolutionNote: editor.resolutionNote });
    const inputStyle: React.CSSProperties = noteEditorInputStyle;
    return <div role="dialog" aria-modal="true" aria-label={editor.globalId ? t('uiUpdateSharedNote') : t('uiEditLocalNote')} style={noteEditorDialogStyle}>
      <strong style={noteEditorTitleStyle}>{editor.globalId ? t('uiUpdateSharedNote') : t('uiEditLocalNote')}</strong>
      <div style={noteEditorScopeStyle}>{editor.globalId ? t('uiChangesAreSavedToYourOrganizationSLayer') : t('uiChangesAffectThisBrowserSLocalCopyOnly')}</div>
      <fieldset disabled={editor.saving} style={noteEditorFieldsetStyle}>
        <label style={noteEditorLabelStyle}> {t('uiCategory')} <select style={inputStyle} value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}>{Array.from(new Set([editor.category, ...categories])).map(c => <option key={c} value={c}>{translateDefaultCategories && categories.includes(c) ? owned(c) : c}</option>)}</select></label>
        <label style={noteEditorLabelStyle}> {t('uiDescription')} <textarea dir="auto" rows={3} maxLength={2000} style={inputStyle} value={values.note} onChange={e => setValues({ ...values, note: e.target.value })} /></label>
        <label style={noteEditorLabelStyle}> {t('uiStatus')} <select style={inputStyle} value={values.status} onChange={e => setValues({ ...values, status: e.target.value })}>{FIELD_NOTE_STATUSES.map(item => <option key={item.value} value={item.value}>{t(item.value==='in_progress'?'uiStatusProgress':item.value==='completed'?'uiStatusCompleted':item.value==='dismissed'?'uiStatusDismissed':'uiStatusOpen')}</option>)}</select></label>
        <label style={noteEditorLabelStyle}> {t('uiResolutionNoteOptional')} <textarea dir="auto" rows={2} maxLength={2000} style={inputStyle} value={values.resolutionNote} onChange={e => setValues({ ...values, resolutionNote: e.target.value })} /></label>
        {editor.error && <div role="alert" style={noteErrorStyle}>{<OwnedMessage source={String(editor.error ?? "")}/>}</div>}
        <div style={noteEditorActionsStyle}><button className="mly-text-action" type="button" style={getNoteEditorCancelStyle(editor.saving)} onClick={onCancel}> {t('uiCancel')} </button><button className="mly-text-action" type="button" style={getNoteEditorSaveStyle(editor.saving)} onClick={() => onSave(values)}>{editor.saving ? t('uiSaving') : editor.globalId ? t('uiUpdateSharedNote') : t('uiSaveLocally')}</button></div>
      </fieldset>
    </div>;
};
