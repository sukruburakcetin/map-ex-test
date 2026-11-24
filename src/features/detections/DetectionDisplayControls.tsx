/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import ReactDOM from 'react-dom';
import { useWidgetLocale } from '../../i18n/WidgetLocale';

interface Props { appearanceStyle?: React.CSSProperties; zoom?: number; labels?: boolean; onLabels?(enabled:boolean):void; reduceOverlap?: boolean; onOverlap?(reduce:boolean):void; mode?: 'selected' | 'highlight'; onMode?(value: 'selected' | 'highlight'):void; label: string; scale: number; opacity: number; onScale(value: number): void; onOpacity(value: number): void; onReset(): void; }
/** User-opened local styling controls; no map listeners or data requests. */
export function DetectionDisplayControls({appearanceStyle,zoom,label,scale,opacity,onScale,onOpacity,onReset,mode='selected',onMode,reduceOverlap=false,onOverlap,labels=false,onLabels}: Props) {
  const {t,owned,direction,formatLocale}=useWidgetLocale();
  const [open,setOpen]=React.useState(false),[position,setPosition]=React.useState<React.CSSProperties>({});
  const anchor=React.useRef<HTMLButtonElement>(null),menu=React.useRef<HTMLDivElement>(null);
  const id=React.useId();
  const close=()=>{setOpen(false);anchor.current?.focus({preventScroll:true});};
  React.useEffect(()=>{
    if(!open)return;
    const doc=anchor.current!.ownerDocument,win=doc.defaultView!;
    const place=()=>{const viewport=win.visualViewport,left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,w=viewport?.width||win.innerWidth,h=viewport?.height||win.innerHeight;
      const rect=anchor.current!.closest('.mly-filter-group')!.getBoundingClientRect();
      const mobile=win.innerWidth<=600,width=mobile?w-16:Math.min(280,w-16);
      const menuLeft=mobile?left+8:Math.max(left+8,Math.min(rect.left,left+w-width-8));
      const above=rect.top-top-16,below=top+h-rect.bottom-16,opensAbove=above>=below,available=Math.max(above,below);
      const vertical:React.CSSProperties=available>=160 ? opensAbove?{bottom:win.innerHeight-rect.top+8}:{top:rect.bottom+8}:{top:top+8};
      setPosition({position:'fixed',left:menuLeft,...vertical,width,maxHeight:available>=160?available:h-16});};
    const outside=(event:Event)=>{if(event.target instanceof Node&&!menu.current?.contains(event.target)&&!anchor.current?.contains(event.target))setOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}};
    place();menu.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
    doc.addEventListener('pointerdown',outside,true);doc.addEventListener('focusin',outside);doc.addEventListener('keydown',escape,true);win.addEventListener('resize',place);win.visualViewport?.addEventListener('resize',place);win.visualViewport?.addEventListener('scroll',place);doc.addEventListener('scroll',place,true);
    return()=>{doc.removeEventListener('pointerdown',outside,true);doc.removeEventListener('focusin',outside);doc.removeEventListener('keydown',escape,true);win.removeEventListener('resize',place);win.visualViewport?.removeEventListener('resize',place);win.visualViewport?.removeEventListener('scroll',place);doc.removeEventListener('scroll',place,true);};
  },[open]);
  const percent=(v:number)=>new Intl.NumberFormat(formatLocale,{style:'percent',maximumFractionDigits:0}).format(v);
  const button:React.CSSProperties={minHeight:36,padding:'5px 7px',border:'1px solid var(--mly-theme-border, #648b7366)',borderRadius:5,color:'inherit',background:'var(--mly-theme-control, #244633)',font:'inherit',cursor:'pointer'};
  return <div onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} className="mly-detection-display" style={{flexShrink:0}}>
    <button ref={anchor} type="button" className="mly-text-action" aria-label={`${label}: ${owned('Display')}`} aria-expanded={open} aria-haspopup="dialog" aria-controls={open?id:undefined} onClick={()=>setOpen(!open)} style={{...button,minHeight:24,padding:'2px 6px',fontSize:10}}>{owned('Display')} ▾</button>
    {open&&ReactDOM.createPortal(<div id={id} ref={menu} role="dialog" aria-label={`${label}: ${owned('Display')}`} dir={direction} className="mly-detection-display-menu" style={{...appearanceStyle,...position,zIndex:2147483647,boxSizing:'border-box',padding:10,border:'1px solid var(--mly-theme-border, #648b73)',borderRadius:8,background:'var(--mly-theme-panel, #162b22)',color:'var(--mly-theme-text, #e0eee5)',font:'13px/1.35 "Segoe UI",sans-serif',overflowY:'auto',boxShadow:'0 5px 22px #0008'}}>
      <style>{`.mly-detection-display-menu button{font:inherit!important;min-width:0;white-space:normal;overflow-wrap:anywhere}.mly-detection-display-menu .mly-detection-size-options button{white-space:nowrap;overflow-wrap:normal;padding-inline:3px!important}.mly-detection-display-menu input{box-sizing:border-box;max-width:100%}@media(pointer:coarse){.mly-detection-display-menu button{min-height:44px!important}}`}</style>
      <strong>{label} · {owned('Display')}</strong>
      <div style={{marginTop:10}}>{t('size')}</div>
      <div role="group" aria-label={t('iconSize',{label})} className="mly-detection-size-options" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(48px,1fr))',gap:4,marginTop:4}}>{[.75,1,1.25,1.5,2].map(value=><button key={value} type="button" className="mly-text-action" aria-pressed={value===scale} onClick={()=>onScale(value)} style={{...button,background:value===scale?'var(--mly-theme-selected, #347852)':'var(--mly-theme-control, #244633)'}}>{percent(value)}</button>)}</div>
      <label style={{display:'block',marginTop:12}}>{owned('Opacity')} <output>{percent(opacity)}</output><input aria-label={`${label}: ${owned('Opacity')}`} type="range" min="20" max="100" step="5" value={Math.round(opacity*100)} onChange={event=>onOpacity(Number(event.target.value)/100)} style={{display:'block',width:'100%',minHeight:32,accentColor:'var(--mly-theme-check, #63c38e)'}}/></label>
      <div role="group" aria-label={owned('Category display')} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
        {(['selected','highlight'] as const).map(value=><button key={value} type="button" className="mly-text-action" aria-pressed={mode===value} onClick={()=>{try{if(sessionStorage.getItem('mlyDisplayDebug')==='1')console.info('[Mapillary display mode]',JSON.stringify({stage:'button',requested:value,current:mode,hasCallback:typeof onMode==='function'}));}catch{}onMode?.(value);}} style={{...button,background:mode===value?'var(--mly-theme-selected, #347852)':'var(--mly-theme-control, #244633)'}}>{owned(value==='selected'?'Selected only':'Highlight matches')}</button>)}
      </div>
      {mode==='highlight'&&<div style={{fontSize:11,opacity:.75,marginTop:6}}>{owned('Dimmed categories provide context. Only selected categories can be opened or exported.')}</div>}
      <div style={{marginTop:10}}>{owned('Icon overlap')}</div>
      <div role="group" aria-label={owned('Icon overlap')} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:4}}>
        {[false,true].map(reduce=><button key={String(reduce)} type="button" className="mly-text-action" aria-pressed={reduce===reduceOverlap} onClick={()=>onOverlap?.(reduce)} style={{...button,background:reduce===reduceOverlap?'var(--mly-theme-selected, #347852)':'var(--mly-theme-control, #244633)'}}>{owned(reduce?'Reduce overlap':'Show all icons')}</button>)}
      </div>
      <button type="button" className="mly-text-action" aria-pressed={labels} onClick={()=>onLabels?.(!labels)} style={{...button,width:'100%',marginTop:8,background:labels?'var(--mly-theme-selected, #347852)':'var(--mly-theme-control, #244633)'}}>{owned('Show labels at zoom 18+')}</button>
      {labels && (zoom === undefined || zoom < 18) && <div role="status" style={{fontSize:11,opacity:.8,marginTop:6}}>{owned('Zoom to 18+ to see labels.')}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}><button type="button" className="mly-text-action" onClick={onReset} style={button}>{owned('Reset all')}</button><button type="button" className="mly-text-action" onClick={close} style={button}>{owned('Close')}</button></div>
    </div>,anchor.current?.ownerDocument.fullscreenElement||anchor.current?.ownerDocument.body||document.body)}
  </div>;
}
