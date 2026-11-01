/** @jsx jsx */
/** New-note draft presentation; draft state, reset timing and submission remain parent-owned. */
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { noteDraftDialogStyle, noteDraftTitleStyle, noteDraftSelectStyle, noteDraftTextStyle, noteDraftShareStyle, noteDraftActionsStyle, noteDraftCancelStyle, noteDraftSaveStyle } from '../../styles/fieldNotes';

export interface NoteDraftFormProps {
  categories: string[];
  translateDefaultCategories?: boolean;
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
 const { t, locale, owned } = useWidgetLocale();

  const { categories, category, noteText, share, setCategory, setNoteText, setShare, onSubmitNote, onCancelPending } = props;
  return (
<div style={noteDraftDialogStyle}>
                    <div style={noteDraftTitleStyle}> {t('uiNewFieldNote')} </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory((e.target as HTMLSelectElement).value)}
                        style={noteDraftSelectStyle}
                    >
                        {categories.map(c => <option key={c} value={c}>{props.translateDefaultCategories ? owned(c) : c}</option>)}
                    </select>
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText((e.target as HTMLTextAreaElement).value)}
                        placeholder={t('uiDescriptionOptional')}
                        rows={3}
                        style={noteDraftTextStyle}
                    />
                    {props.sharingEnabled && <label style={noteDraftShareStyle}><input type="checkbox" checked={share} onChange={event => setShare(event.target.checked)} /> {t('uiAlsoShareWithYourOrganization')} </label>}
                    <div style={noteDraftActionsStyle}>
                        <button
                            onClick={onCancelPending}
                            style={noteDraftCancelStyle}
                        > {t('uiCancel')} </button>
                        <button
                            onClick={() => onSubmitNote(category, noteText, props.sharingEnabled && share)}
                            style={noteDraftSaveStyle}
                        > {t('uiSave')} </button>
                    </div>
                </div>
  );
};
