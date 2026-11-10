/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { TILE_CATEGORIES } from '../features/places/tileCategories';
import type { MessageKey } from '../i18n/messages';

/** Search only the small category menu; no dataset query until a choice is made. */
export function categoryOptions(text: (key: MessageKey) => string, locale: string, query: string) {
  const fold = (value: string) => value.toLocaleLowerCase(locale).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const options = [{ id: 'all', label: text('uiAll') }, ...TILE_CATEGORIES.map(([id, key]) => ({ id: String(id), label: text(key) }))
    .sort((a,b) => a.id === b.id ? 0 : a.id === 'other' ? 1 : b.id === 'other' ? -1 : a.label.localeCompare(b.label, locale))];
  const needle = fold(query.trim());
  return needle ? options.filter(option => fold(option.label).includes(needle) || fold(option.id).includes(needle)) : options;
}

export const TileCategoryPicker: React.FC<{ value: string; onChange?(value: string): void }> = props => {
  const { t, formatLocale: locale } = useWidgetLocale();
  const [open, setOpen] = React.useState(false), [query, setQuery] = React.useState(''), [active, setActive] = React.useState(0);
  const root = React.useRef<HTMLDivElement>(null), button = React.useRef<HTMLButtonElement>(null), input = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const options = React.useMemo(() => categoryOptions(t, locale, query), [t, locale, query]);
  const all = React.useMemo(() => categoryOptions(t, locale, ''), [t, locale]);
  const selected = all.find(option => option.id === props.value)?.label || t('uiAll');
  const current = Math.min(active, Math.max(0, options.length - 1));
  const close = (restore = false) => { setOpen(false); if (restore) button.current?.focus({ preventScroll: true }); };
  const choose = (value: string) => { if (value !== props.value) props.onChange?.(value); close(true); };
  React.useEffect(() => {
    if (!open || !props.onChange) { if (open) setOpen(false); return; }
    input.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, props.onChange]);
  React.useEffect(() => { if (open) root.current?.querySelector<HTMLElement>('[data-category-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [open, current, query]);
  const start = (last = false) => { if (!props.onChange) return; setQuery(''); setActive(last ? all.length - 1 : Math.max(0, all.findIndex(option => option.id === props.value))); setOpen(true); };
  const keys = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); setActive(options.length ? (current + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length : 0); }
    else if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); if (options[current]) choose(options[current].id); }
    else if (event.key === 'Home' && event.ctrlKey) { event.preventDefault(); event.stopPropagation(); setActive(0); }
    else if (event.key === 'End' && event.ctrlKey) { event.preventDefault(); event.stopPropagation(); setActive(Math.max(0, options.length - 1)); }
  };
  return <div ref={root} onPointerDown={event=>event.stopPropagation()} style={{ marginTop: 8 }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <span>{t('uiPlaceCategory')}</span>
    <button ref={button} type="button" disabled={!props.onChange} aria-label={`${t('uiPlaceCategory')}: ${selected}`} aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? `${id}-list` : undefined}
      onClick={event => { event.stopPropagation(); open ? close() : start(); }} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); start(event.key === 'ArrowUp'); } }}
      style={{ width:'100%',minHeight:34,display:'flex',alignItems:'center',gap:6,marginTop:4,padding:'6px 8px',background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:4,font:'inherit',cursor:props.onChange?'pointer':'default',opacity:props.onChange?1:.55 }}>
      <span title={selected} style={{ flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'start' }}>{selected}</span><span aria-hidden="true">▾</span>
    </button>
    {open && <div onWheel={event=>event.stopPropagation()} style={{ marginTop:4,padding:4,border:'1px solid #506b5a',borderRadius:5,background:'#142b22' }}>
      <input ref={input} type="search" role="combobox" aria-label={t('uiPlaceCategory')} aria-expanded={true} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={options[current] ? `${id}-${options[current].id}` : undefined}
        placeholder={t('uiSearch')} value={query} onChange={event=>{setQuery(event.target.value);setActive(0);}} onKeyDown={keys}
        style={{ boxSizing:'border-box',width:'100%',minWidth:0,minHeight:32,padding:'5px 7px',marginBottom:4,border:'1px solid #506b5a',borderRadius:4,background:'#192e25',color:'inherit',font:'inherit' }}/>
      <div id={`${id}-list`} role="listbox" aria-label={t('uiPlaceCategory')} className="mly-places-scroll" style={{ maxHeight:170,overflowY:'auto',overflowX:'hidden',overscrollBehavior:'contain' }}>
        {options.map((option,index)=><div key={option.id} id={`${id}-${option.id}`} role="option" aria-selected={option.id===props.value} data-category-active={index===current?'true':undefined}
          onMouseEnter={()=>setActive(index)} onMouseDown={event=>event.preventDefault()} onClick={event=>{event.stopPropagation();choose(option.id);}}
          style={{ padding:'7px 8px',minHeight:18,overflowWrap:'anywhere',borderRadius:3,cursor:'pointer',background:index===current?'#284b38':option.id===props.value?'#213c2e':'transparent',fontWeight:option.id===props.value?600:400 }}>
          {option.label}
        </div>)}
        {!options.length && <div role="status" style={{padding:8,opacity:.75}}>{t('uiNoResults')}</div>}
      </div>
    </div>}
  </div>;
};
