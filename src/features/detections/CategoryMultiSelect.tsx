/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import ReactDOM from 'react-dom';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { FilterOption } from '../../components/types';
import { categorySearchIndex, rankCategoryMatches } from './categorySearch';
import { sameCategorySelection, type CategorySelection } from './categorySelection';
const PAGE_SIZE = 40;
interface Props { appearanceStyle?: React.CSSProperties; label: string; allLabel: string; options: readonly FilterOption[]; selected: CategorySelection; onChange(value: CategorySelection): void; }
/** Local draft + explicit Apply: checkbox/search/page changes never touch map layers.
 * Search covers the full catalog; only 40 rows/images are mounted per page.
 */
export const CategoryMultiSelect = React.memo(function CategoryMultiSelect({ appearanceStyle, label, allLabel, options, selected, onChange }: Props) {
  const { t, formatLocale, direction } = useWidgetLocale();
  const trigger = React.useRef<HTMLButtonElement>(null), menu = React.useRef<HTMLDivElement>(null), search = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const [open, setOpen] = React.useState(false), [query, setQuery] = React.useState(''), [page, setPage] = React.useState(0);
  const [draft, setDraft] = React.useState<ReadonlySet<string> | null>(null);
  const [position, setPosition] = React.useState<React.CSSProperties>({});
  const rows = React.useMemo(() => {
    const catalog = options.filter(option => !!option.code), labels = new Map<string,number>();
    catalog.forEach(option => labels.set(option.label,(labels.get(option.label)||0)+1));
    return catalog.map(option => ({ option, code: option.code!, duplicate: (labels.get(option.label)||0)>1, index: categorySearchIndex(option.label,option.code!,formatLocale) }));
  }, [options, formatLocale]);
  const matches = React.useMemo(() => rankCategoryMatches(rows,query,formatLocale), [rows,query,formatLocale]);
  const numbers = React.useMemo(() => new Intl.NumberFormat(formatLocale), [formatLocale]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(matches.length / PAGE_SIZE) - 1)), offset = currentPage * PAGE_SIZE;
  const selection: CategorySelection = draft === null ? null : [...draft];
  const dirty = !sameCategorySelection(selected, selection);
  const summary = selected === null ? allLabel : selected.length ? t('featureSelectedCount',{count:numbers.format(selected.length)}) : t('featureNoneSelected');
  const close = React.useCallback((focus = false) => { setOpen(false); if (focus) trigger.current?.focus({preventScroll:true}); }, []);
  const place = React.useCallback(() => {
    const anchor = trigger.current; if (!anchor) return;
    const win = anchor.ownerDocument.defaultView || window, viewport = win.visualViewport;
    const leftBound = viewport?.offsetLeft || 0, topBound = viewport?.offsetTop || 0, width = viewport?.width || win.innerWidth, height = viewport?.height || win.innerHeight;
    const rect = (anchor.closest('.mly-filter-group--features') || anchor).getBoundingClientRect();
    if (win.innerWidth <= 600) {
      const bottomEdge = rect.top-topBound >= 276 ? Math.min(topBound+height-8,rect.top-8) : topBound+height-8;
      const sheetHeight = Math.min(480, bottomEdge-topBound-8, Math.max(260, height * .64));
      setPosition({position:'fixed',left:leftBound+8,top:bottomEdge-sheetHeight,width:width-16,height:sheetHeight,maxHeight:height-16});
      return;
    }
    const above = rect.top - topBound - 16, below = topBound + height - rect.bottom - 16;
    const available = Math.max(above, below), opensAbove = above >= below;
    const vertical: React.CSSProperties = available >= 220
      ? opensAbove ? {bottom:win.innerHeight-rect.top+8} : {top:rect.bottom+8}
      : {top:topBound+8};
    setPosition({position:'fixed',left:Math.max(leftBound+8, Math.min(rect.left,leftBound+width-Math.min(rect.width,width-16)-8)),...vertical,width:Math.min(rect.width,width-16),maxHeight:Math.max(80,Math.min(420,available>=220?available:height-16))});
  }, []);
  const show = () => { setDraft(selected === null ? null : new Set(selected)); setQuery(''); setPage(0); place(); setOpen(true); };
  React.useEffect(() => {
    if (!open) return;
    const doc = trigger.current?.ownerDocument || document, win = doc.defaultView || window;
    const contains = (target: EventTarget | null) => target instanceof Node && (menu.current?.contains(target) || trigger.current?.contains(target));
    const outside = (event: Event) => { if (!contains(event.target)) close(); };
    const scrolled = (event: Event) => {
      if (event.target instanceof Node && menu.current?.contains(event.target)) return;
      // Native focus/RTL scrolling can move the trigger strip while opening.
      // Keep the portal anchored instead of dismissing the new dialog.
      if (event.target instanceof Node && trigger.current && event.target.contains(trigger.current)) place();
      else close();
    };
    const key = (event: KeyboardEvent) => { if (event.key==='Escape') { event.preventDefault(); event.stopPropagation(); close(true); } };
    doc.addEventListener('pointerdown',outside,true); doc.addEventListener('focusin',outside); doc.addEventListener('scroll',scrolled,true); doc.addEventListener('keydown',key,true);
    win.addEventListener('resize',place); win.visualViewport?.addEventListener('resize',place); win.visualViewport?.addEventListener('scroll',place); if(win.innerWidth>600) search.current?.focus();
    return () => { doc.removeEventListener('pointerdown',outside,true);doc.removeEventListener('focusin',outside);doc.removeEventListener('scroll',scrolled,true);doc.removeEventListener('keydown',key,true);win.removeEventListener('resize',place);win.visualViewport?.removeEventListener('resize',place);win.visualViewport?.removeEventListener('scroll',place); };
  }, [open,close,place]);
  const toggle = (code: string) => setDraft(previous => { const next = new Set(previous ?? rows.map(row=>row.code)); next.has(code) ? next.delete(code) : next.add(code); return next.size===rows.length ? null : next; });
  const action: React.CSSProperties = {font:'inherit',padding:'4px 7px',border:'1px solid var(--mly-theme-border, #648b7366)',borderRadius:4,background:'var(--mly-theme-control, #244633)',color:'var(--mly-theme-text, #e0eee5)',cursor:'pointer'};
  return <div dir={direction} className="mly-category-select" style={{minWidth:0,flexShrink:0}} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
    <button ref={trigger} className="mly-text-action mly-category-trigger" type="button" aria-label={`${label}: ${summary}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?id:undefined} title={`${label}: ${summary}`}
      style={{...action,fontSize:10,minHeight:24,maxWidth:180}} onClick={()=>open?close(true):show()} onKeyDown={event=>{if(!open&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();show();}}}>{summary} <span aria-hidden="true">▾</span></button>
    {open && ReactDOM.createPortal(<div ref={menu} id={id} dir={direction} lang={formatLocale} role="dialog" aria-label={label} className={`mly-category-menu${Number(position.height)<260?' mly-category-menu--short':''}`} style={{...appearanceStyle,...position,zIndex:2147483647,boxSizing:'border-box',background:'var(--mly-theme-panel, #162b22)',color:'var(--mly-theme-text, #e0eee5)',border:'1px solid var(--mly-theme-border, #648b73)',borderRadius:7,boxShadow:'0 5px 22px #0008',padding:8,display:'flex',flexDirection:'column',gap:6,overflowY:'auto',font:'11px/1.35 "Segoe UI",sans-serif'}} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
      <style>{`
.mly-category-menu *{box-sizing:border-box}
.mly-category-menu label{color:var(--mly-theme-text, #e0eee5)!important;font:inherit!important}
.mly-category-menu input[type=checkbox]{appearance:none!important;-webkit-appearance:none!important;display:inline-grid!important;place-items:center;position:static!important;opacity:1!important;margin:0!important;width:15px!important;height:15px!important;border:1px solid var(--mly-theme-border, #87b89a88)!important;border-radius:3px!important;background:var(--mly-theme-input, #10241c)!important;flex-shrink:0;justify-self:center;cursor:pointer}
.mly-category-menu input[type=checkbox]::after{content:'';width:8px;height:5px;border-left:2px solid var(--mly-theme-input, #10271b);border-bottom:2px solid var(--mly-theme-input, #10271b);transform:translateY(-1px) rotate(-45deg);opacity:0}
.mly-category-menu input[type=checkbox]:checked{background:var(--mly-theme-check, #63c38e)!important;border-color:var(--mly-theme-check, #63c38e)!important}
.mly-category-menu input[type=checkbox]:checked::after{opacity:1}
.mly-category-menu button{font:inherit}
.mly-category-menu button:disabled{opacity:.45;cursor:default}
.mly-category-menu button:focus-visible,.mly-category-menu input:focus-visible{outline:2px solid var(--mly-theme-accent, #b4f3ca);outline-offset:1px}
.mly-category-menu img{flex-shrink:0}
.mly-category-menu .mly-category-option{display:grid;grid-template-columns:16px 24px minmax(0,1fr);align-items:center;gap:8px;margin:0;padding:5px 0;min-height:32px;border-bottom:1px solid var(--mly-theme-border, #ffffff12);cursor:pointer;overflow-wrap:anywhere}
.mly-category-menu .mly-category-icon{display:flex;align-items:center;justify-content:center;width:24px;height:20px}
.mly-category-menu .mly-category-icon img{object-fit:contain}
@media(max-width:600px){
.mly-category-menu{font:13px/1.3 "Segoe UI",sans-serif!important;-webkit-text-size-adjust:100%;text-size-adjust:100%;padding:8px!important;border-radius:12px!important;overflow-y:auto!important;gap:4px!important}
.mly-category-menu button{font:13px/1.25 "Segoe UI",sans-serif!important;min-height:44px!important;padding:4px 6px!important}
.mly-category-menu input[type=search]{min-height:44px!important;height:44px!important;line-height:1.25!important;padding:6px!important}
.mly-category-menu .mly-category-selection-bar{margin-top:6px; margin-bottom:2px}
.mly-category-menu>strong{font-size:14px!important;line-height:20px!important}
.mly-category-menu .mly-category-pagination small{font-size:11px!important;line-height:1.2!important}
.mly-category-menu .mly-category-actions{padding-top:4px!important}
.mly-category-menu input[type=search]{font-size:16px!important;box-sizing:border-box}
.mly-category-menu .mly-category-option{min-height:44px;padding:4px 0;box-sizing:border-box}
.mly-category-menu .mly-category-options{min-height:44px!important;max-height:none!important}
}
@media(max-width:600px){
.mly-category-menu--short{font-size:12px!important;padding:6px!important;gap:3px!important;overflow-y:auto!important}
.mly-category-menu--short button,.mly-category-menu--short input[type=search]{min-height:36px!important}
}
.mly-category-menu,.mly-category-options{scrollbar-width:thin;scrollbar-color:rgba(169,201,181,.28) transparent}
@supports selector(::-webkit-scrollbar){
  .mly-category-menu,.mly-category-options{scrollbar-width:auto!important;scrollbar-color:auto!important}
  .mly-category-menu::-webkit-scrollbar,.mly-category-options::-webkit-scrollbar{width:4px;height:4px}
  .mly-category-menu::-webkit-scrollbar-track,.mly-category-options::-webkit-scrollbar-track{background:transparent}
  .mly-category-menu::-webkit-scrollbar-thumb,.mly-category-options::-webkit-scrollbar-thumb{background:rgba(169,201,181,.28);border-radius:4px}
  .mly-category-menu::-webkit-scrollbar-thumb:hover,.mly-category-options::-webkit-scrollbar-thumb:hover{background:rgba(169,201,181,.5)}
  .mly-category-menu::-webkit-scrollbar-button,.mly-category-options::-webkit-scrollbar-button{display:none;width:0;height:0}
}
@media(forced-colors:active){
  .mly-category-menu input[type=checkbox]{appearance:auto!important;-webkit-appearance:checkbox!important;background:Canvas!important;border-color:ButtonText!important}
  .mly-category-menu input[type=checkbox]::after{display:none}
  .mly-category-menu input[type=checkbox]:checked{background:Highlight!important;border-color:Highlight!important}
  .mly-category-menu,.mly-category-options{scrollbar-color:auto!important}
}
`}</style>
      <strong style={{flexShrink:0}}>{label}</strong>
      <input ref={search} type="search" maxLength={256} aria-label={t('featureSearchCategories')} placeholder={t('featureSearchCategories')} value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{flexShrink:0,minWidth:0,width:'100%',padding:6,border:'1px solid var(--mly-theme-border, #648b73)',borderRadius:4,background:'var(--mly-theme-input, #0e2118)',color:'inherit',font:'inherit'}}/>
      <div className="mly-category-selection-bar" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',alignItems:'stretch',gap:6,flexShrink:0}}>
        <button type="button" className="mly-text-action" style={action} disabled={!rows.length} title={t('featureSelectAllHint')} onClick={()=>setDraft(null)}>{t('featureSelectAll')}</button>
        <button type="button" className="mly-text-action" style={action} disabled={!rows.length} onClick={()=>setDraft(new Set())}>{t('featureClearSelection')}</button>
        <span role="status" style={{display:'flex',alignItems:'center',justifyContent:'flex-end',textAlign:'end',minWidth:0,overflowWrap:'anywhere'}}>{draft===null?allLabel:t('featureSelectedCount',{count:numbers.format(draft.size)})}</span>
      </div>
      <div className="mly-category-options" role="group" aria-label={label} style={{overflowY:'auto',overscrollBehavior:'contain',minHeight:48,maxHeight:220,flex:'1 1 auto',scrollbarWidth:'thin',scrollbarGutter:'stable',paddingInlineEnd:4}} onKeyDown={event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){const inputs=Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>('input[type=checkbox]')),index=inputs.indexOf(event.target as HTMLInputElement);if(index>=0){event.preventDefault();inputs[event.key==='Home'?0:event.key==='End'?inputs.length-1:Math.max(0,Math.min(inputs.length-1,index+(event.key==='ArrowDown'?1:-1)))]?.focus();}}}}>
        {!rows.length ? <span role="status">{t('featureLoadingCategories')}</span> : !matches.length ? <span role="status">{t('featureNoCategoryMatches')}</span> : matches.slice(offset,offset+PAGE_SIZE).map(row=><label className="mly-category-option" key={row.code} title={row.code}>
          <input type="checkbox" aria-label={row.duplicate?`${row.option.label} (${row.code})`:row.option.label} checked={draft===null || draft.has(row.code)} onChange={()=>toggle(row.code)}/>
          <span className="mly-category-icon" aria-hidden="true">{row.option.iconUrl && <img src={row.option.iconUrl} alt="" width="20" height="20"/>}</span><span className="mly-category-option-text" style={{minWidth:0}}>{row.option.label}{row.duplicate && <small style={{display:'block',fontSize:9,opacity:.7}}>{row.code}</small>}</span>
        </label>)}
      </div>
      <div className="mly-category-pagination" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto minmax(0,1fr)',alignItems:'stretch',gap:6,flexShrink:0}}>
        <button type="button" className="mly-text-action" style={action} disabled={currentPage===0} onClick={()=>{setPage(currentPage-1);if(menu.current)menu.current.querySelector('.mly-category-options')!.scrollTop=0;}}>{t('featurePreviousPage')}</button>
        <small style={{display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center'}}>{t('featureCategoryPage',{start:numbers.format(matches.length?offset+1:0),end:numbers.format(Math.min(offset+PAGE_SIZE,matches.length)),total:numbers.format(matches.length)})}</small>
        <button type="button" className="mly-text-action" style={action} disabled={offset+PAGE_SIZE>=matches.length} onClick={()=>{setPage(currentPage+1);if(menu.current)menu.current.querySelector('.mly-category-options')!.scrollTop=0;}}>{t('featureNextPage')}</button>
      </div>
      <div className="mly-category-actions" style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6,paddingTop:6,borderTop:'1px solid var(--mly-theme-border, #ffffff18)',flexShrink:0}}>
        <button type="button" className="mly-text-action" style={action} onClick={()=>close(true)}>{t('uiCancel')}</button>
        <button type="button" className="mly-text-action" style={{...action,background:'var(--mly-theme-selected, #286744)',opacity:dirty?1:.55}} disabled={!dirty} onClick={()=>{onChange(selection===null?null:Object.freeze([...selection]));close(true);}}>{t('featureApplySelection')}</button>
      </div>
    </div>,trigger.current?.ownerDocument.fullscreenElement || trigger.current?.ownerDocument.body || document.body)}
  </div>;
});
