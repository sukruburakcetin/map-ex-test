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
                  type="button"
                  onClick={onToggleAnnotationMode}
                  aria-pressed={!!isAnnotationMode}
                  aria-label={isAnnotationMode ? "Add note mode on. Stop placing notes" : "Add note mode off. Enable note placement"}
                  title={isAnnotationMode ? "Note placement is on. Click the map to add a note, or click here to turn it off." : "Turn on note placement, then click the map to add a note."}
                  style={{ ...noteToolsAddButtonStyle,
                    padding: "4px 5px", boxSizing: "border-box", borderRadius: "4px", gap: "4px",
                    background: isAnnotationMode ? "rgba(245,166,35,0.14)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isAnnotationMode ? "rgba(245,166,35,0.65)" : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  <span
                    style={getNoteToolsLabelStyle(isAnnotationMode)}
                  >
                    <Icons.Notes size={10} />
                    {isAnnotationMode ? "Stop adding notes" : "Add note"}
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
                      View notes
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
