/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import ReactDOM from 'react-dom';
import type { TravelPreview } from '../features/imagery/timeTravelPreview';
interface Props { imageId: string; load: (id: string, signal: AbortSignal) => Promise<TravelPreview>; onClose: () => void; onExternal: () => void; }
const date = (value: number) => Number.isFinite(value) ? new Date(value).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : 'Date unavailable';
export const TimeTravelPreview: React.FC<Props> = ({imageId,load,onClose,onExternal}) => {
 const [data,setData]=React.useState<TravelPreview|null>(null),[error,setError]=React.useState(''),[retry,setRetry]=React.useState(0);
 const [selected,setSelected]=React.useState(0),[compare,setCompare]=React.useState(false),[split,setSplit]=React.useState(50),[failed,setFailed]=React.useState<string[]>([]);
 const dialog=React.useRef<HTMLDivElement>(null),titleId=React.useId();
 React.useEffect(()=>{
  const controller=new AbortController();setData(null);setError('');setSelected(0);setCompare(false);setFailed([]);
  load(imageId,controller.signal).then(result=>{if(!controller.signal.aborted)setData(result)}).catch(()=>{if(!controller.signal.aborted)setError('Time travel could not load. Please try again.')});
  return ()=>controller.abort();
 },[imageId,load,retry]);
 React.useEffect(()=>{
  const previous=document.activeElement as HTMLElement;dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
   if(event.key==='Tab'){
    const items=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select,input,a[href]')||[]),first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
   }
  };document.addEventListener('keydown',key,true);
  return ()=>{document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus()};
 },[onClose]);
 const candidate=data?.alternatives[selected];
 const image=(url:string,label:string)=>failed.includes(url)?<div className="mly-travel-missing">Preview unavailable</div>:<img src={url} alt={label} decoding="async" onError={()=>setFailed(old=>old.includes(url)?old:[...old,url])}/>;
 return ReactDOM.createPortal(<div className="mly-travel-backdrop" onClick={event=>{if(event.target===event.currentTarget)onClose()}}>
  <style>{`
.mly-travel-backdrop{position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.48);display:flex;align-items:center;justify-content:center;padding:16px}
.mly-travel-dialog{box-sizing:border-box;width:min(660px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;color:#26312e;border-radius:12px;box-shadow:0 16px 56px #0005;padding:20px;font:14px/1.5 system-ui,sans-serif}
.mly-travel-dialog header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.mly-travel-dialog h2{font-size:20px;margin:0}.mly-travel-dialog button{font:inherit;cursor:pointer;border:1px solid #c6d2cc;border-radius:6px;padding:8px 12px;background:#fff;color:#26312e}.mly-travel-dialog button:focus-visible,.mly-travel-dialog select:focus-visible,.mly-travel-dialog input:focus-visible{outline:3px solid #2e9165;outline-offset:2px}.mly-travel-dialog button:disabled{opacity:.5;cursor:default}.mly-travel-dialog .mly-travel-primary{background:#248454;border-color:#248454;color:#fff}.mly-travel-dialog select{width:100%;font:inherit;padding:8px;margin:6px 0 12px;background:white;color:#26312e;border:1px solid #c6d2cc;border-radius:6px}
.mly-travel-frame{position:relative;aspect-ratio:16/9;background:#16201d;overflow:hidden;border-radius:7px}.mly-travel-frame img{display:block;width:100%;height:100%;object-fit:contain}.mly-travel-layer{position:absolute;inset:0;background:#16201d}.mly-travel-line{position:absolute;top:0;bottom:0;width:2px;background:white;box-shadow:0 0 3px #000}.mly-travel-dates{display:flex;justify-content:space-between;gap:12px;margin:8px 0}.mly-travel-dialog p{margin:10px 0;color:#59655f}.mly-travel-dialog footer{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.mly-travel-slider{width:100%;accent-color:#248454}.mly-travel-missing{display:grid;place-items:center;height:100%;color:white}.mly-travel-status{min-height:100px;display:grid;place-items:center}
`}</style>
  <div ref={dialog} className="mly-travel-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
   <header><h2 id={titleId}>Time travel</h2><button type="button" aria-label="Close time travel" onClick={onClose}>✕</button></header>
   {!data&&!error&&<div role="status" className="mly-travel-status">Loading related captures…</div>}
   {error&&<div role="alert"><p>{error}</p><button type="button" onClick={()=>setRetry(v=>v+1)}>Retry</button></div>}
   {data&&!candidate&&<p>No comparable captures are available nearby.</p>}
   {data&&candidate&&<React.Fragment>
    <label>Related capture<select value={selected} onChange={event=>{setSelected(Number(event.target.value));setSplit(50)}}>{data.alternatives.map((item,index)=><option value={index} key={item.id}>{date(item.capturedAt)} · {Math.round(item.distance)} m away{item.pano?' · Panorama':''}</option>)}</select></label>
    <div className="mly-travel-frame">
     {compare? <React.Fragment>{image(data.current.url,'Current capture')}<div className="mly-travel-layer" style={{clipPath:`inset(0 ${100-split}% 0 0)`}}>{image(candidate.url,'Related capture')}</div><div className="mly-travel-line" style={{left:`${split}%`}}/></React.Fragment>:image(candidate.url,'Related capture')}
    </div>
    <div className="mly-travel-dates"><span>Related: {date(candidate.capturedAt)}</span>{compare&&<span>Current: {date(data.current.capturedAt)}</span>}</div>
    {compare&&<label>Slide to compare<input className="mly-travel-slider" type="range" min="0" max="100" value={split} onChange={event=>setSplit(Number(event.target.value))} aria-label="Reveal related capture"/></label>}
    <p>Nearby captures may differ in position and direction. Previews are not geometrically aligned.{(candidate.pano||data.current.pano)?' Panorama previews may use a different projection.':''}</p>
    <button type="button" className="mly-travel-primary" disabled={failed.includes(candidate.url)||failed.includes(data.current.url)} onClick={()=>{setCompare(value=>!value);setSplit(50)}}>{compare?'Show preview only':'Compare with current image'}</button>
   </React.Fragment>}
   <footer><button type="button" onClick={onExternal}>Explore on Mapillary ↗</button></footer>
  </div>
 </div>,document.fullscreenElement||document.body);
};
