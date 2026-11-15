/** @jsx jsx */
import { attachmentMetadata, readDetectionCrop, validSavedCrop } from './detectionImageAttachment';
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { readDetectionPreview, detectionPreviewLink, detectionPreviewFrame } from './detectionPreview';
import type { DetectionPreview, DetectionPreviewLoader } from './detectionPreview';
export function DetectionCrop({preview,load,alt}:{preview:Pick<DetectionPreview,'imageId'|'bounds'>&Partial<Pick<DetectionPreview,'detectionId'>>;load?:DetectionPreviewLoader;alt?:string}){
 const {owned:text}=useWidgetLocale();const [url,setUrl]=React.useState(''),[ratio,setRatio]=React.useState(2),[failed,setFailed]=React.useState(false);
 React.useEffect(()=>{setUrl('');setFailed(false);if(!load)return;const controller=new AbortController();load(preview.imageId,controller.signal).then(value=>{if(controller.signal.aborted)return;try{const uri=new URL(value);if(uri.protocol!=='https:')throw Error();setUrl(uri.href);}catch{setFailed(true);}},()=>{if(!controller.signal.aborted)setFailed(true);});return()=>controller.abort();},[preview.imageId,load]);
 const b=detectionPreviewFrame(preview.bounds,ratio);
 return <div style={{display:'grid',gap:4,minWidth:0,color:'#d3e2d9'}}>
  {url&&!failed?<div style={{position:'relative',width:'100%',aspectRatio:String(b.width*ratio/b.height),maxWidth:180*b.width*ratio/b.height,overflow:'hidden',background:'#102019',border:'1px solid #648b73',borderRadius:4}}><img alt={text(alt||'Linked detection preview')} src={url} referrerPolicy="no-referrer" onLoad={event=>{const img=event.currentTarget;if(img.naturalHeight)setRatio(img.naturalWidth/img.naturalHeight);}} onError={()=>setFailed(true)} style={{position:'absolute',width:`${100/b.width}%`,maxWidth:'none',height:'auto',left:`${-100*b.x/b.width}%`,top:`${-100*b.y/b.height}%`}}/></div>:<small role="status">{text(failed?'Preview unavailable.':load?'Loading linked preview…':'Image preview unavailable.')}</small>}

 </div>;
}
export type DetectionAttachmentLoader=(id:string,signal:AbortSignal)=>Promise<string>;
function SavedDetectionCrop({id,load,place}:{id:string;load?:DetectionAttachmentLoader;place?:boolean}){
 const {owned:text}=useWidgetLocale(),latest=React.useRef(load);latest.current=load;
 const [data,setData]=React.useState(''),[failed,setFailed]=React.useState(false);
 React.useEffect(()=>{const controller=new AbortController();setData('');setFailed(false);(latest.current?latest.current(id,controller.signal):readDetectionCrop(id)).then(value=>{if(!controller.signal.aborted){if(validSavedCrop(value))setData(value);else setFailed(true);}},()=>{if(!controller.signal.aborted)setFailed(true);});return()=>controller.abort();},[id]);
 return data?<img alt={text(place?'Saved place image':'Saved detection image')} src={data} style={{display:'block',maxWidth:'100%',maxHeight:220,width:'auto',height:'auto',borderRadius:5}}/>:<small role="status">{text(failed?'The saved image could not be loaded.':'Loading saved image…')}</small>;
}
export function LinkedDetectionNoteText({value,load,loadAttachment}:{value:string;load?:DetectionPreviewLoader;loadAttachment?:DetectionAttachmentLoader}){
 const {owned:text}=useWidgetLocale(),parsed=attachmentMetadata(value),[open,setOpen]=React.useState(false);
 return <div style={{display:'grid',gap:6,minWidth:0}}><div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{parsed.text}</div>{parsed.reference?.attachmentId&&<details onClick={event=>event.stopPropagation()} onToggle={event=>setOpen(event.currentTarget.open)}><summary style={{cursor:'pointer',color:'#b9ddc8',fontSize:11}}>{text(parsed.reference?.placeId?'Place image attachment':'Detection image attachment')}</summary>{open&&<SavedDetectionCrop id={parsed.reference.attachmentId} load={loadAttachment} place={!!parsed.reference.placeId}/>}</details>}
 {!parsed.reference?.attachmentId&&readDetectionPreview(value).preview&&<details onClick={event=>event.stopPropagation()} onToggle={event=>setOpen(event.currentTarget.open)}><summary style={{cursor:'pointer',color:'#b9ddc8',fontSize:11}}>{text('Detection preview')}</summary>{open&&<DetectionCrop preview={readDetectionPreview(value).preview!} load={load}/>}</details>}</div>;
}
