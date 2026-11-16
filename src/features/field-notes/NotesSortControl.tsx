/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { NOTE_SORT_OPTIONS, type NoteSort } from './noteSort';
import { noteSearchInputStyle } from '../../styles/noteSearch';
const keys = { 'date-desc': 'notesSortNewest', 'date-asc': 'notesSortOldest', 'name-asc': 'notesSortNameAZ', 'name-desc': 'notesSortNameZA', 'status-asc': 'notesSortStatusFirst', 'status-desc': 'notesSortStatusLast' } as const;
export const NotesSortControl: React.FC<{ value: NoteSort; onChange(value: NoteSort): void; loadedOnly?: boolean; compact?: boolean }> = ({ value, onChange, loadedOnly, compact }) => {
  const { t } = useWidgetLocale();
  return <div className="mly-notes-sort" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '3px 8px', minWidth: 0, font: 'inherit', fontSize: 11, color: '#d3e2d9' }} onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: '100%' }}>{t('notesSortLabel')}
      <select value={value} title={loadedOnly ? t('notesSortLoaded') : undefined} style={{ ...noteSearchInputStyle, width: 'auto', maxWidth: '100%', padding: '3px 6px' }} onChange={event => { const next = event.target.value as NoteSort; if (NOTE_SORT_OPTIONS.includes(next)) onChange(next); }}>
        {NOTE_SORT_OPTIONS.map(option => <option key={option} value={option}>{t(keys[option])}</option>)}
      </select>
    </label>
    {loadedOnly && !compact && <small style={{ fontSize: 10, color: '#acc8b8', overflowWrap: 'anywhere' }}>{t('notesSortLoaded')}</small>}
  </div>;
};
