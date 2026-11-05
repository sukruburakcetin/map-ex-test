/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { readDetectionPreview, detectionPreviewLink, detectionPreviewFrame } from './detectionPreview';
import type { DetectionPreview, DetectionPreviewLoader } from './detectionPreview';
export function DetectionCrop({preview,load}:{preview:DetectionPreview;load?:DetectionPreviewLoader}){
 const {owned:text}=useWidgetLocale();const [url,setUrl]=React.useState(''),[ratio,setRatio]=React.useState(2),[failed,setFailed]=React.useState(false);
 React.useEffect(()=>{setUrl('');setFailed(false);if(!load)return;const controller=new AbortController();load(preview.imageId,controller.signal).then(value=>{if(controller.signal.aborted)return;try{const uri=new URL(value);if(uri.protocol!=='https:')throw Error();setUrl(uri.href);}catch{setFailed(true);}},()=>{if(!controller.signal.aborted)setFailed(true);});return()=>controller.abort();},[preview.imageId,load]);
 const b=detectionPreviewFrame(preview.bounds,ratio);
 return <div style={{display:'grid',gap:4,minWidth:0,color:'#d3e2d9'}}>
  {url&&!failed?<div style={{position:'relative',width:'100%',aspectRatio:String(b.width*ratio/b.height),maxWidth:180*b.width*ratio/b.height,overflow:'hidden',background:'#102019',border:'1px solid #648b73',borderRadius:4}}><img alt={text('Linked detection preview')} src={url} referrerPolicy="no-referrer" onLoad={event=>{const img=event.currentTarget;if(img.naturalHeight)setRatio(img.naturalWidth/img.naturalHeight);}} onError={()=>setFailed(true)} style={{position:'absolute',width:`${100/b.width}%`,maxWidth:'none',height:'auto',left:`${-100*b.x/b.width}%`,top:`${-100*b.y/b.height}%`}}/></div>:<small role="status">{text(failed?'Preview unavailable. Open the original image.':load?'Loading linked preview…':'Open the original image to view this detection.')}</small>}
  <a href={detectionPreviewLink(preview).slice('[Mapillary detection preview]('.length,-1)} target="_blank" rel="noopener noreferrer" style={{color:'#a8dfbd',fontSize:10}}>{text('Open original image')}</a>
 </div>;
}
export function LinkedDetectionNoteText({value,load}:{value:string;load?:DetectionPreviewLoader}){
 const {owned:text}=useWidgetLocale();const parsed=readDetectionPreview(value),[open,setOpen]=React.useState(false);
 return <div style={{display:'grid',gap:6,minWidth:0}}><div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{parsed.text}</div>{parsed.preview&&<details onClick={event=>event.stopPropagation()} onToggle={event=>setOpen(event.currentTarget.open)}><summary style={{cursor:'pointer',color:'#b9ddc8',fontSize:11}}>{text('Linked detection preview')}</summary>{open&&<DetectionCrop preview={parsed.preview} load={load}/>}</details>}</div>;
}
