/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { noteSearchStyle, noteSearchRowStyle, noteSearchInputStyle, noteSearchClearStyle, noteSearchStatusStyle, noteSearchFooterStyle } from '../../styles/noteSearch';

interface Props { query: string; onChange(value: string): void; shown: number; total: number; loadedOnly?: boolean; help?: React.ReactNode }

/** Accessible local-list filtering controls. No storage, network, or map selection ownership. */
export const NotesSearchControls: React.FC<Props> = ({ query, onChange, shown, total, loadedOnly, help }) => {
  const { t, formatLocale } = useWidgetLocale();
  const input = React.useRef<HTMLInputElement>(null);
  const numbers = React.useMemo(() => new Intl.NumberFormat(formatLocale), [formatLocale]);
  return <div style={noteSearchStyle} onClick={event => event.stopPropagation()}
    onPointerDown={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
    <div style={noteSearchRowStyle}>
      <label style={{ display: 'grid', gap: 4, minWidth: 0 }}>{t('notesSearch')}
        <input ref={input} type="search" value={query} placeholder={t('notesSearchPlaceholder')}
          style={noteSearchInputStyle} onChange={event => onChange(event.target.value)}
          onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape' && query) { event.preventDefault(); onChange(''); } }} />
      </label>
        {query && <button type="button" style={{ ...noteSearchClearStyle, alignSelf: 'end' }} aria-label={t('notesClearSearch')}
          onClick={() => { onChange(''); input.current?.focus(); }}>✕</button>}
    </div>
    <div style={noteSearchFooterStyle}>
    <span role="status" aria-live="polite" style={noteSearchStatusStyle}>{t('notesSearchCount', { shown: numbers.format(shown), total: numbers.format(total) })}</span>
    {loadedOnly && <span style={noteSearchStatusStyle}>{t('notesSearchLoadedScope')}</span>}
    {help && <span style={noteSearchStatusStyle}>{help}</span>}
    </div>
  </div>;
};
