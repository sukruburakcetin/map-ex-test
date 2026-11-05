/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { DetectionNoteSelection, DetectionNoteDestination } from './detectionNote';
export function DetectionNoteAction({selection,enterpriseEnabled,picking,onChoose,onCancel,onClose,hasTray}:{selection:DetectionNoteSelection;enterpriseEnabled:boolean;picking:boolean;hasTray?:boolean;onChoose:(destination:DetectionNoteDestination)=>void;onCancel:()=>void;onClose:()=>void}){
 const {owned:text}=useWidgetLocale();const [expanded,setExpanded]=React.useState(false),[destination,setDestination]=React.useState<DetectionNoteDestination>('local');
 React.useEffect(()=>{if(!picking)return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onCancel();}};window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[picking,onCancel]);
 const control:React.CSSProperties={fontSize:11,lineHeight:1.3,color:'#e1eee5',background:'#214233',border:'1px solid #648b73',borderRadius:5,padding:'6px 8px',minHeight:30,boxSizing:'border-box'};
 return <section className={'mly-detection-note-action'+(hasTray?' has-tray':'')} aria-label={text('Selected detection')} onPointerDown={event=>event.stopPropagation()} onClick={event=>event.stopPropagation()} style={{position:'absolute',left:8,bottom:38,maxHeight:'calc(100% - 64px)',overflowY:'auto',zIndex:999999993,maxWidth:'min(300px,calc(100% - 16px))',boxSizing:'border-box',padding:8,display:'grid',gap:6,background:'#13251ef5',color:'#e1eee5',border:'1px solid #648b73',borderRadius:6,fontSize:11,lineHeight:1.35}}>
  <style>{`.mly-detection-note-action.has-tray {bottom:214px !important;} @media(max-width:600px),(max-height:500px){.mly-detection-note-action.has-tray {bottom:186px !important;}}`}</style>
  <div style={{display:'flex',alignItems:'start',gap:8}}><strong style={{flex:1,overflowWrap:'anywhere',color:'#e1eee5'}}>{selection.title}</strong><button type="button" aria-label={text('Dismiss selected detection')} style={{...control,minHeight:24,padding:'1px 5px'}} onClick={onClose}>×</button></div>
  {picking?<React.Fragment><span role="status">{text('Click the map to place this note. Escape cancels.')}</span><button type="button" style={control} onClick={onCancel}>{text('Cancel location picking')}</button></React.Fragment>:expanded?<React.Fragment>
   <label style={{display:'grid',gap:3,color:'#e1eee5',fontSize:11,margin:0}}>{text('Save to')}<select aria-label={text('Field note destination')} value={destination} onChange={event=>setDestination(event.target.value as DetectionNoteDestination)} style={{...control,width:'100%'}}><option value="local">{text('Local')}</option><option value="enterprise" disabled={!enterpriseEnabled}>{text(enterpriseEnabled?'Enterprise':'Enterprise (not configured)')}</option><option value="workspace">{text('Workspace')}</option></select></label>
   <small style={{fontSize:10,color:'#b7cabe'}}>{text('Choose the object’s location on the map next.')}</small><button type="button" style={control} onClick={()=>onChoose(destination)}>{text('Choose note location')}</button>
  </React.Fragment>:<button type="button" style={control} onClick={()=>setExpanded(true)}>{text('Add field note')}</button>}
 </section>;
}
