/** @jsx jsx */
/** Local/shared note editor UI. Persistence, authorization and publication remain parent-owned. */
import { React, jsx } from 'jimu-core';
import { FIELD_NOTE_STATUSES } from '../../components/types';
import type { FieldNoteEditor } from '../../components/types';
import { noteEditorInputStyle, noteEditorDialogStyle, noteEditorTitleStyle, noteEditorScopeStyle, noteEditorFieldsetStyle, noteEditorLabelStyle, noteErrorStyle, noteEditorActionsStyle, getNoteEditorCancelStyle, getNoteEditorSaveStyle } from '../../styles/fieldNotes';

export interface NoteEditorProps {
  editor: FieldNoteEditor;
  categories: string[];
  onSave: (values: { category: string; note: string; status: string; resolutionNote: string }) => void;
  onCancel: () => void;
}

/** Render the existing draft and report save/cancel intent without owning storage or requests. */
export const NoteEditor: React.FC<NoteEditorProps> = ({ editor, categories, onSave, onCancel }) => {
    const [values, setValues] = React.useState({ category: editor.category, note: editor.note, status: editor.status as string, resolutionNote: editor.resolutionNote });
    const inputStyle: React.CSSProperties = noteEditorInputStyle;
    return <div role="dialog" aria-modal="true" aria-label={editor.globalId ? "Update shared note" : "Edit local note"} style={noteEditorDialogStyle}>
      <strong style={noteEditorTitleStyle}>{editor.globalId ? "Update shared note" : "Edit local note"}</strong>
      <div style={noteEditorScopeStyle}>{editor.globalId ? "Changes are saved to your organization's layer." : "Changes affect this browser's local copy only."}</div>
      <fieldset disabled={editor.saving} style={noteEditorFieldsetStyle}>
        <label style={noteEditorLabelStyle}>Category<select style={inputStyle} value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}>{Array.from(new Set([editor.category, ...categories])).map(c => <option key={c}>{c}</option>)}</select></label>
        <label style={noteEditorLabelStyle}>Description<textarea rows={3} maxLength={2000} style={inputStyle} value={values.note} onChange={e => setValues({ ...values, note: e.target.value })} /></label>
        <label style={noteEditorLabelStyle}>Status<select style={inputStyle} value={values.status} onChange={e => setValues({ ...values, status: e.target.value })}>{FIELD_NOTE_STATUSES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label style={noteEditorLabelStyle}>Resolution note (optional)<textarea rows={2} maxLength={2000} style={inputStyle} value={values.resolutionNote} onChange={e => setValues({ ...values, resolutionNote: e.target.value })} /></label>
        {editor.error && <div role="alert" style={noteErrorStyle}>{editor.error}</div>}
        <div style={noteEditorActionsStyle}><button type="button" style={getNoteEditorCancelStyle(editor.saving)} onClick={onCancel}>Cancel</button><button type="button" style={getNoteEditorSaveStyle(editor.saving)} onClick={() => onSave(values)}>{editor.saving ? "Saving…" : editor.globalId ? "Update shared note" : "Save locally"}</button></div>
      </fieldset>
    </div>;
};
