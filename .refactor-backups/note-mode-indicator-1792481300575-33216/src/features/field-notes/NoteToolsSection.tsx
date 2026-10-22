/** @jsx jsx */
/** InfoBox note controls only. Annotation state, lists and all SDK work remain parent-owned. */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { InfoBoxProps } from '../../components/types';
import { noteToolsSectionStyle, noteToolsAddButtonStyle, noteToolsListButtonStyle, noteToolsCountStyle, getNoteToolsLabelStyle, getNoteToolsChevronStyle } from '../../styles/fieldNotes';

export type NoteToolsSectionProps = Pick<InfoBoxProps, 'fieldNotesCount' | 'isAnnotationMode' | 'fieldNotesListOpen' | 'onToggleAnnotationMode' | 'onToggleFieldNotesList'>;

/** Forward note-mode/list actions without adding wrappers, effects, state or subscriptions. */
export const NoteToolsSection: React.FC<NoteToolsSectionProps> = props => {
  const { fieldNotesCount, isAnnotationMode, fieldNotesListOpen, onToggleAnnotationMode, onToggleFieldNotesList } = props;
  return (
<div
                style={noteToolsSectionStyle}
              >
                <button
                  onClick={onToggleAnnotationMode}
                  title={isAnnotationMode ? "Disable note mode" : "Add field note"}
                  style={noteToolsAddButtonStyle}
                >
                  <span
                    style={getNoteToolsLabelStyle(isAnnotationMode)}
                  >
                    <Icons.Notes size={10} />
                    {isAnnotationMode ? "NOTE MODE ON" : "ADD NOTE"}
                  </span>
                </button>

                {
                  <button
                    onClick={onToggleFieldNotesList}
                    title="Show field notes"
                    style={noteToolsListButtonStyle}
                  >
                    <span
                      style={getNoteToolsLabelStyle(fieldNotesListOpen)}
                    >
                      NOTES
                      {(fieldNotesCount ?? 0) > 0 && (
                        <span style={noteToolsCountStyle}>
                          {fieldNotesCount}
                        </span>
                      )}
                    </span>
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 10 10"
                      fill="white"
                      style={getNoteToolsChevronStyle(fieldNotesListOpen)}
                    >
                      <path d="M1 3l4 4 4-4" />
                    </svg>
                  </button>
                }
              </div>
  );
};
