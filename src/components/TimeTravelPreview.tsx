/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../i18n/WidgetLocale';
import ReactDOM from 'react-dom';
import { Maximize, Minimize } from './Icons';
import type { SharedComparison, TravelPreview } from '../features/imagery/timeTravelPreview';
interface Props { imageId: string; load: (id: string, signal: AbortSignal, comparison?: SharedComparison) => Promise<TravelPreview>; onClose: () => void; onExternal?: () => void; noteLink?: {href?: string}; appearanceStyle?: React.CSSProperties; comparison?: SharedComparison; onShare?(comparison: SharedComparison): Promise<boolean>; onAddNote?(comparison: SharedComparison,title:string,description:string): boolean; }

export const TimeTravelPreview: React.FC<Props> = ({imageId,load,onClose,onExternal,noteLink,appearanceStyle,comparison,onShare,onAddNote}) => {
 const {t,owned,formatLocale:locale,direction} = useWidgetLocale();
 const date = (value:number) => Number.isFinite(value) ? new Intl.DateTimeFormat(locale,{year:'numeric',month:'short',day:'numeric'}).format(value) : t('dateUnavailable');
 const [data,setData]=React.useState<TravelPreview|null>(null),[error,setError]=React.useState(''),[retry,setRetry]=React.useState(0);
 const [selected,setSelected]=React.useState(1),[compare,setCompare]=React.useState(false),[split,setSplit]=React.useState(50),[failed,setFailed]=React.useState<string[]>([]);
 const [start,setStart]=React.useState(0);
 const [noteBlocked,setNoteBlocked]=React.useState(false);
 const [copyStatus,setCopyStatus]=React.useState<'pending'|'copied'|'failed'|null>(null);
 const [expanded,setExpanded]=React.useState(false);
 const [nativeFullscreen,setNativeFullscreen]=React.useState(false);
 const [portalHost]=React.useState(()=>document.fullscreenElement||document.body);
 const backdrop=React.useRef<HTMLDivElement>(null),dialog=React.useRef<HTMLDivElement>(null),titleId=React.useId();

 React.useEffect(()=>{
  const update=()=>setNativeFullscreen(document.fullscreenElement===backdrop.current);
  document.addEventListener('fullscreenchange',update);
  return ()=>document.removeEventListener('fullscreenchange',update);
 },[]);

 function toggleFullscreen() {
  const node=backdrop.current;
  if(document.fullscreenElement===node){void document.exitFullscreen().catch(()=>{});return;}
  if(expanded){setExpanded(false);return;}
  if(node?.requestFullscreen){
   void node.requestFullscreen().catch(()=>{if(node.isConnected)setExpanded(true);});
  }else setExpanded(true);
 }
 React.useEffect(()=>{
  const controller=new AbortController();setData(null);setError('');setSelected(1);setStart(0);setSplit(50);setCompare(false);setFailed([]);
  load(imageId,controller.signal,comparison).then(result=>{
   if(controller.signal.aborted)return;
   if(comparison){
    const captures=[result.current,...result.alternatives];
    const baseline=captures.findIndex(capture=>capture.id===comparison.startId);
    const related=captures.findIndex(capture=>capture.id===comparison.compareId);
    if(baseline<0||related<0){setError('load');return;}
    setStart(baseline);setSelected(related);setSplit(comparison.split);setCompare(true);
   }
   setData(result);
  }).catch(()=>{if(!controller.signal.aborted)setError('load')});
  return ()=>controller.abort();
 },[imageId,load,retry,comparison]);
 React.useEffect(()=>{
  const previous=document.activeElement as HTMLElement;dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
  return ()=>{if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[]);
 React.useEffect(()=>{
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){
     if(document.fullscreenElement===backdrop.current)return;
     event.preventDefault();event.stopPropagation();
     if(expanded)setExpanded(false);else onClose();
   }
   if(event.key==='Tab'){
    const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select,input,a[href]')||[]),first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
   }
  };document.addEventListener('keydown',key,true);
  return ()=>document.removeEventListener('keydown',key,true);
 },[onClose,expanded]);
 const captures=data?[data.current,...data.alternatives]:[];
 const starting=captures[start],candidate=captures[selected];
 const fullscreen=expanded||nativeFullscreen;
 const fullscreenLabel=fullscreen?t('travelExitFullscreen'):t('travelEnterFullscreen');
 const FullscreenIcon=fullscreen?Minimize:Maximize;
 const externalAction=noteLink
  ? noteLink.href&&<a className="mly-travel-external" href={noteLink.href} target="_blank" rel="noopener noreferrer">{owned('Open in new tab')} ↗</a>
  : onExternal&&<button className="mly-travel-external" type="button" onClick={onExternal}>{t('exploreMapillary')}</button>;
 const image=(url:string,label:string)=>failed.includes(url)?<div className="mly-travel-missing">{t('previewUnavailable')} </div>:<img src={url} alt={label} decoding="async" onError={()=>setFailed(old=>old.includes(url)?old:[...old,url])}/>;
 return ReactDOM.createPortal(<div ref={backdrop} dir={direction} style={appearanceStyle} className={fullscreen?"mly-travel-backdrop mly-travel-expanded":"mly-travel-backdrop"} onClick={event=>{if(event.target===event.currentTarget)onClose()}}>
  <style>{`
.mly-travel-backdrop{box-sizing:border-box;position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.48);display:flex;align-items:center;justify-content:center;padding:16px}
.mly-travel-dialog{box-sizing:border-box;width:min(660px,100%);max-height:calc(100dvh - 32px);overflow:auto;overscroll-behavior:contain;background:var(--mly-theme-panel,#182b22);color:var(--mly-theme-text,#edf7f0);border:1px solid var(--mly-theme-border,#648b73);border-radius:12px;box-shadow:0 16px 56px #0005;padding:clamp(10px,2.5vw,20px);font:14px/1.5 system-ui,sans-serif;color-scheme:var(--mly-theme-color-scheme,dark)}
.mly-travel-expanded,.mly-travel-backdrop:fullscreen{padding:0;background:var(--mly-theme-panel,#182b22)}
.mly-travel-expanded .mly-travel-dialog,.mly-travel-backdrop:fullscreen .mly-travel-dialog{width:100%;height:100%;max-height:100%;border-radius:0;display:flex;flex-direction:column}
.mly-travel-dialog header,.mly-travel-dialog footer,.mly-travel-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.mly-travel-dialog header{justify-content:space-between;margin-bottom:12px}
.mly-travel-dialog h2{font-size:20px;margin:0}
.mly-travel-dialog button,.mly-travel-dialog select,.mly-travel-dialog a.mly-travel-external{font:inherit;border:1px solid var(--mly-theme-border,#648b73);border-radius:6px;padding:6px 10px;background:var(--mly-theme-input,#14281f);color:inherit}
.mly-travel-dialog button{cursor:pointer}
.mly-travel-dialog .mly-travel-fullscreen{display:grid;place-items:center;width:36px;height:36px;padding:0}
.mly-travel-dialog a.mly-travel-external{text-decoration:none}
.mly-travel-dialog :is(button,select,input,a):focus-visible{outline:2px solid var(--mly-theme-accent,#c5f6d6);outline-offset:2px}
.mly-travel-dialog button:disabled{opacity:.55;cursor:default}
.mly-travel-dialog .mly-travel-primary{background:var(--mly-theme-selected,#31543d)}
.mly-travel-captures{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));align-items:start;gap:8px 12px;margin-block-end:12px}
.mly-travel-dialog .mly-travel-field{display:grid;gap:4px;min-width:0;margin:0}
.mly-travel-field > span{font-size:.9em;color:var(--mly-theme-muted,#b5ccbf)}
.mly-travel-dialog .mly-travel-field select,.mly-travel-start-date{box-sizing:border-box;display:block;width:100%;min-width:0;min-height:36px;margin:0}
.mly-travel-use-capture{justify-self:start;max-width:100%;overflow-wrap:anywhere;text-align:start}
.mly-travel-start-date{padding:6px 10px;border:1px solid var(--mly-theme-border,#648b73);border-radius:6px}
.mly-travel-dialog .mly-travel-slider-field{margin-block:8px 0}
.mly-travel-dialog .mly-travel-slider-field input{box-sizing:border-box;width:100%;max-width:none;margin:0}
.mly-travel-actions .mly-travel-external{margin-inline-start:auto}
@media(max-width:480px){.mly-travel-actions .mly-travel-external{margin-inline-start:0}}
.mly-travel-dialog option{background:var(--mly-theme-input,#14281f);color:var(--mly-theme-text,#edf7f0)}
.mly-travel-frame{position:relative;aspect-ratio:16/9;background:#16201d;overflow:hidden;border-radius:7px}
.mly-travel-expanded .mly-travel-frame{flex:1 0 min(32dvh,220px);aspect-ratio:auto}
.mly-travel-frame img{display:block;width:100%;height:100%;object-fit:contain}
.mly-travel-layer{position:absolute;inset:0;background:#16201d}
.mly-travel-line{position:absolute;top:0;bottom:0;width:2px;background:white;box-shadow:0 0 0 1px #0009}
.mly-travel-dates{display:flex;justify-content:space-between;gap:12px;margin:8px 0;flex-wrap:wrap}
.mly-travel-dialog p{margin:10px 0;color:var(--mly-theme-muted,#b5ccbf)}
.mly-travel-dialog footer{margin-top:14px}
.mly-travel-slider{display:block;width:100%;accent-color:var(--mly-theme-accent,#8bdbb7)}
.mly-travel-missing,.mly-travel-status{display:grid;place-items:center}
.mly-travel-missing{height:100%;color:white}
.mly-travel-status{min-height:100px}
`}</style>
  <div lang={locale} ref={dialog} className="mly-travel-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
   <header><h2 id={titleId}>{t('timeTravel')}</h2><div className="mly-travel-actions">
    {candidate&&<button type="button" className="mly-travel-fullscreen" aria-label={fullscreenLabel} title={fullscreenLabel} onClick={toggleFullscreen}>
     <FullscreenIcon size={20} color="currentColor" aria-hidden="true" focusable="false"/>
    </button>}
    {noteLink?<button type="button" onClick={onClose}>{owned('Back to note')}</button>:
     <button type="button" aria-label={t('closeTravel')} onClick={onClose}>✕</button>}
   </div></header>
   {!data&&!error&&<div role="status" className="mly-travel-status">{t('loadingCaptures')} </div>}
   {error&&<div role="alert"><p>{comparison?t('travelSharedError'):t('travelError')}</p><button className="mly-text-action" type="button" onClick={()=>setRetry(v=>v+1)}>{t('retry')} </button></div>}
   {data&&!candidate&&<p>{t('noCaptures')} </p>}
   {starting&&candidate&&<React.Fragment>
    <div className="mly-travel-captures">
     {compare&&<div className="mly-travel-field">
      <span>{t('travelStartingImage')}</span><div className="mly-travel-start-date">{date(starting.capturedAt)}</div>
     </div>}
     <div className="mly-travel-field">
     <label className="mly-travel-field"><span>{compare?t('travelCompareTo'):t('relatedCapture')}</span>
     <select value={selected} onChange={event=>setSelected(Number(event.target.value))}>
      {captures.map((item,index)=>index!==start&&<option value={index} key={item.id}>
       {index===0?t('travelViewerImageDate',{date:date(item.capturedAt)}):!Number.isFinite(item.distance)?date(item.capturedAt):
        t('captureOption',{date:date(item.capturedAt),distance:new Intl.NumberFormat(locale,{maximumFractionDigits:0}).format(item.distance)})}
       {item.pano?' · '+t('panorama'):''}
      </option>)}
     </select>
     </label>
     <button type="button" className="mly-travel-use-capture" disabled={failed.includes(candidate.url)}
      onClick={()=>{setStart(selected);setSelected(start);setCompare(true);}}>
      {t('travelUseStartingImage',{date:date(candidate.capturedAt)})}
     </button>
     </div>
    </div>
    <div dir="ltr" className="mly-travel-frame">
     {compare?<React.Fragment>
      {image(starting.url,t('travelStartingImage'))}
      <div className="mly-travel-layer" style={{clipPath:`inset(0 ${100-split}% 0 0)`}}>{image(candidate.url,t('travelComparisonImage'))}</div>
      <div className="mly-travel-line" style={{left:`clamp(0px, ${split}%, calc(100% - 2px))`}}/>
     </React.Fragment>:image(candidate.url,t('relatedCapture'))}
    </div>
    <div dir="ltr" className="mly-travel-dates">
     <span dir={direction}>{t('relatedDate',{date:date(candidate.capturedAt)})}</span>
     {compare&&<span dir={direction}>{t('travelStartingImageDate',{date:date(starting.capturedAt)})}</span>}
    </div>
    {compare&&<label className="mly-travel-field mly-travel-slider-field"><span>{t('slideCompare')}</span><input dir="ltr" className="mly-travel-slider" type="range" min="0" max="100" value={split} onChange={event=>setSplit(Number(event.target.value))} aria-label={t('revealRelated')}/></label>}
    <p>{t('compareNote')} {(candidate.pano||starting.pano)?' '+t('panoramaNote'):''}</p>
    <div className="mly-travel-actions">
     <button type="button" className="mly-travel-primary" disabled={!compare&&(failed.includes(candidate.url)||failed.includes(starting.url))} onClick={()=>setCompare(value=>!value)}>{compare?t('previewOnly'):start===0?t('compareCurrent'):t('travelCompareImages')}</button>
     {compare&&onShare&&<button type="button" disabled={failed.includes(starting.url)||failed.includes(candidate.url)}
      onClick={async()=>{
       setCopyStatus('pending');
       try {setCopyStatus(await onShare({imageId,startId:starting.id,compareId:candidate.id,split})?'copied':'failed');}
       catch {setCopyStatus('failed');}
      }}>{t('travelCopyLink')}</button>}
     {compare&&onAddNote&&<button type="button" disabled={failed.includes(starting.url)||failed.includes(candidate.url)} onClick={()=>{
      const pair={imageId,startId:starting.id,compareId:candidate.id,split};
      const details=[t('travelStartingImageDate',{date:date(starting.capturedAt)}),t('relatedDate',{date:date(candidate.capturedAt)})].join('\n');
      if(onAddNote(pair,t('timeTravel'),details))onClose();else setNoteBlocked(true);
     }}>{owned('Add to workspace note')}</button>}
     {externalAction}
    </div>
    {noteBlocked&&<p role="alert">{owned('Could not open a workspace draft. Finish any open note draft and check that the current capture has a map location.')}</p>}
    {copyStatus&&<p role="status">{t(copyStatus==='pending'?'travelCopyingLink':copyStatus==='copied'?'travelLinkCopied':'travelLinkCopyFailed')}</p>}
   </React.Fragment>}
   {!candidate&&externalAction&&<footer>{externalAction}</footer>}
  </div>
 </div>,portalHost);
};
