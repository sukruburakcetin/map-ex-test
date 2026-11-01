/** @jsx jsx */
/** New-note draft presentation; draft state, reset timing and submission remain parent-owned. */
import { React, jsx } from 'jimu-core';
import { noteDraftDialogStyle, noteDraftTitleStyle, noteDraftSelectStyle, noteDraftTextStyle, noteDraftShareStyle, noteDraftActionsStyle, noteDraftCancelStyle, noteDraftSaveStyle } from '../../styles/fieldNotes';

export interface NoteDraftFormProps {
  categories: string[];
  category: string;
  noteText: string;
  share: boolean;
  sharingEnabled?: boolean;
  setCategory: (value: string) => void;
  setNoteText: (value: string) => void;
  setShare: (value: boolean) => void;
  onSubmitNote: (category: string, note: string, share?: boolean) => void;
  onCancelPending: () => void;
}

/** Forward controlled values and actions without owning effects, persistence or network work. */
export const NoteDraftForm: React.FC<NoteDraftFormProps> = props => {
  const { categories, category, noteText, share, setCategory, setNoteText, setShare, onSubmitNote, onCancelPending } = props;
  return (
<div style={noteDraftDialogStyle}>
                    <div style={noteDraftTitleStyle}>New Field Note</div>
                    <select
                        value={category}
                        onChange={(e) => setCategory((e.target as HTMLSelectElement).value)}
                        style={noteDraftSelectStyle}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText((e.target as HTMLTextAreaElement).value)}
                        placeholder="Description (optional)"
                        rows={3}
                        style={noteDraftTextStyle}
                    />
                    {props.sharingEnabled && <label style={noteDraftShareStyle}><input type="checkbox" checked={share} onChange={event => setShare(event.target.checked)} />Also share with your organization</label>}
                    <div style={noteDraftActionsStyle}>
                        <button
                            onClick={onCancelPending}
                            style={noteDraftCancelStyle}
                        >Cancel</button>
                        <button
                            onClick={() => onSubmitNote(category, noteText, props.sharingEnabled && share)}
                            style={noteDraftSaveStyle}
                        >Save</button>
                    </div>
                </div>
  );
};
