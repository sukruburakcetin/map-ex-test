/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { RoutePreviewSimulation } from './RoutePreviewSimulation';
import type { RoutePreviewHost, PreviewProgress } from './RoutePreviewSimulation';
import type { RouteData } from '../../components/types';
const button:React.CSSProperties={font:'inherit',fontSize:9,padding:'4px 6px',minHeight:26,border:'1px solid #648b73',borderRadius:4,background:'#214233',color:'#e1eee5',cursor:'pointer'};
export function RoutePreviewControls({route,host}:{route:RouteData;host?:RoutePreviewHost}){
 const {owned:text}=useWidgetLocale(),controller=React.useRef<RoutePreviewSimulation|null>(null),mounted=React.useRef(true);
 const [progress,setProgress]=React.useState<PreviewProgress>({state:'idle',progress:0}),[error,setError]=React.useState(''),[speed,setSpeed]=React.useState(10),[follow,setFollow]=React.useState(true);
 React.useLayoutEffect(()=>{
  mounted.current=true;setProgress({state:'idle',progress:0});setError('');
  return()=>{mounted.current=false;controller.current?.stop();controller.current=null;};
 },[route,host?.view]);
 const play=()=>{if(!host)return;try{
  if(!controller.current)controller.current=new RoutePreviewSimulation(host,route.geojson,route.duration,value=>{if(mounted.current)setProgress(value);});
  controller.current.speed=speed;controller.current.follow=follow;controller.current.play();setError('');
 }catch(error){controller.current?.stop();controller.current=null;setError((error as Error).message);}};
 const active=progress.state!=='idle';
 return <div className="mly-route-preview" role="group" aria-label={text('Route simulation')} style={{display:'grid',gap:5,paddingTop:7,marginTop:7,borderTop:'1px solid #49695a',color:'#d3e2d9',fontSize:9,minWidth:0}}>
  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
   <button type="button" style={{...button,flex:'1 1 auto'}} disabled={!host} onClick={progress.state==='playing'?()=>controller.current?.pause():play}>{text(progress.state==='playing'?'Pause':progress.state==='paused'?'Resume':progress.state==='finished'?'Replay A → B':'Preview A → B')}</button>
   {active&&<button type="button" style={button} onClick={()=>controller.current?.stop()}>{text('Stop')}</button>}
  </div>
  {active&&<div style={{display:'grid',gap:3}}>
   <span role="status">{text(progress.state==='playing'?'Playing':progress.state==='paused'?'Paused':'Finished')} · {Math.round(progress.progress*100)}%</span>
   <progress aria-label={text('Route progress')} max={1} value={progress.progress} style={{width:'100%',height:5}}/>
  </div>}
  <details>
   <summary style={{cursor:'pointer',padding:'3px 0'}}>{text('Options')}</summary>
   <div style={{display:'grid',gap:5,paddingTop:4}}>
    <label style={{display:'grid',gap:3}}>{text('Preview speed')}<select aria-label={text('Preview speed')} style={{...button,width:'100%',minWidth:0}} value={speed} onChange={event=>{const value=Number(event.target.value);setSpeed(value);if(controller.current)controller.current.speed=value;}}>{[1,5,10,25,50].map(value=><option key={value} value={value}>{value}×</option>)}</select></label>
    <label style={{display:'flex',gap:4,alignItems:'center'}}><input type="checkbox" style={{margin:0,flexShrink:0}} checked={follow} onChange={event=>{setFollow(event.target.checked);if(controller.current)controller.current.follow=event.target.checked;}}/>{text('Follow on map')}</label>
    <small>{text('Preview only · no GPS')}</small>
   </div>
  </details>
  {error&&<span role="alert">{text(error)}</span>}
 </div>;
}
