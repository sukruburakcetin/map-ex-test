/** @jsx jsx */
import type { DetectionContributionSeed } from '../detections/detectionNote';
import { detectionNoteDescription } from '../detections/detectionNote';
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { WorkspaceLocationRequest, WorkspaceMapLocation } from './WorkspaceLocationPicker';
import type { DirectContributionValues, WorkspaceCategory } from './communityWorkspace';
import { workspaceSectionStyle as section, workspaceSummaryStyle as summary, workspaceFieldStyle as field, workspaceInputStyle as input,
  workspaceButtonStyle as button, workspaceSecondaryButtonStyle as secondary, workspaceEditorActionsStyle as actions } from '../../styles/communityWorkspace';

/** A workspace draft is never a Local note. Only explicit Publish sends it.
 * Its source ID survives failed submissions; location changes are explicit and
 * unmount/cancel cleans map intent. Existing drafts retain their category choice.
 */
export function WorkspaceContributionDraft({categories,busy,error,onPickLocation,onPublish,sectionRef,currentImageId,detectionDraft,onClearDetectionDraft}:{categories:readonly WorkspaceCategory[];busy:boolean;error:string;onPickLocation?:WorkspaceLocationRequest;
 onPublish(values:DirectContributionValues,onSaved:()=>void):void;sectionRef:React.RefObject<HTMLDetailsElement>;currentImageId?:string|null;detectionDraft?:DetectionContributionSeed|null;onClearDetectionDraft?:()=>void}) {
 const {owned:text}=useWidgetLocale();
 const [title,setTitle]=React.useState(''),[description,setDescription]=React.useState(''),[category,setCategory]=React.useState('');
 const [point,setPoint]=React.useState<WorkspaceMapLocation|null>(null),[picking,setPicking]=React.useState(false),[attach,setAttach]=React.useState<string|null>(null);
 const locationStatus=React.useRef<HTMLSpanElement>(null);
 React.useEffect(()=>{if(point){locationStatus.current?.scrollIntoView({block:'nearest'});locationStatus.current?.focus({preventScroll:true});}},[point]);
 const source=React.useRef(''),cancel=React.useRef<(()=>void)|null>(null);
 React.useEffect(()=>()=>{cancel.current?.();},[]);
 React.useEffect(()=>{if(!category){const first=categories.find(item=>!item.archived);if(first)setCategory(first.name);}},[categories,category]);
 const appliedDetection=React.useRef('');
 function applyDetection(){
  if(!detectionDraft||busy)return;
  cancel.current?.();cancel.current=null;source.current='';setPicking(false);
  setTitle(detectionDraft.title.slice(0,160));setDescription(detectionNoteDescription(detectionDraft));
  setPoint({lon:detectionDraft.lon,lat:detectionDraft.lat});setAttach(detectionDraft.imageId);
  appliedDetection.current=detectionDraft.requestId;
  if(sectionRef.current){sectionRef.current.open=true;sectionRef.current.scrollIntoView({block:'nearest'});}
  onClearDetectionDraft?.();
 }
 React.useEffect(()=>{if(detectionDraft&&appliedDetection.current!==detectionDraft.requestId){if(sectionRef.current){sectionRef.current.open=true;sectionRef.current.scrollIntoView({block:'nearest'});}if(!point&&!title&&!description&&!busy)applyDetection();}},[detectionDraft,busy]);
 const active=categories.filter(item=>!item.archived),validCategory=active.some(item=>item.name===category);
 function reset(){cancel.current?.();cancel.current=null;source.current='';setTitle('');setDescription('');setPoint(null);setPicking(false);setAttach(null);}
 function chooseLocation(){if(!onPickLocation)return;cancel.current?.();setPicking(true);cancel.current=onPickLocation(location=>{cancel.current=null;setPoint(location);setPicking(false);},()=>{cancel.current=null;setPicking(false);});}
 return <details ref={sectionRef} className="mly-workspace-section" style={{...section,display:'block'}}><summary style={summary}>{text('Create contribution')}</summary>
  {detectionDraft&&appliedDetection.current!==detectionDraft.requestId&&<div role="status" style={{display:'grid',gap:6,paddingTop:8}}><strong>{detectionDraft.title}</strong><span>{text('A contribution draft is already open. Replace it with this detection?')}</span><button type="button" style={secondary} disabled={busy} onClick={applyDetection}>{text('Use detected object')}</button><button type="button" style={secondary} disabled={busy} onClick={()=>onClearDetectionDraft?.()}>{text('Keep current draft')}</button></div>}
  <form aria-label={text('Create contribution')} style={{display:'grid',gap:10,minWidth:0,paddingTop:8}} onSubmit={event=>{event.preventDefault();if(busy||!point||!validCategory||!title.trim())return;if(!source.current)source.current='community:'+crypto.randomUUID();onPublish({sourceId:source.current,title:title.trim(),description,category,lon:point.lon,lat:point.lat,imageId:attach},reset);}}>
   <p style={{margin:0}}>{text('Choose a map location and use this workspace’s categories. No local draft or Builder access is required.')}</p>
   <button type="button" style={secondary} disabled={busy||!onPickLocation} onClick={chooseLocation}>{text(point?'Choose another map location':'Choose location on map')}</button>
   <span ref={locationStatus} tabIndex={-1} role="status">{picking?text('Click the map to place this contribution.'):point?`${text('Selected location')}: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`:text('Select a location before publishing.')}</span>
   <label style={field}>{text('Title')}<input aria-label={text('New contribution title')} style={input} required maxLength={160} disabled={busy} value={title} onChange={event=>setTitle(event.target.value)}/></label>
   <label style={field}>{text('Workspace category')}<select aria-label={text('New contribution category')} style={input} disabled={busy} value={category} onChange={event=>setCategory(event.target.value)}>{!validCategory&&<option value={category}>{category||text('No active categories')}</option>}{active.map(item=><option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
   {category&&!validCategory&&<small>{text('This category is no longer active. Choose another before publishing.')}</small>}
   <label style={field}>{text('Description')}<textarea aria-label={text('New contribution description')} style={{...input,resize:'vertical',minHeight:90}} rows={4} maxLength={8000} disabled={busy} value={description} onChange={event=>setDescription(event.target.value)}/></label>
   {currentImageId&&<label style={{display:'grid',gridTemplateColumns:'18px minmax(0, 1fr)',columnGap:8,rowGap:3,alignItems:'start',minWidth:0}}><input style={{margin:'3px 0 0',width:16,height:16}} type="checkbox" disabled={busy} checked={attach===currentImageId} onChange={event=>setAttach(event.target.checked?currentImageId:null)}/><span style={{minWidth:0,overflowWrap:'anywhere'}}>{text('Attach the currently viewed image')} ({currentImageId})</span><small style={{gridColumn:2,minWidth:0}}>{text('Attach it only if it shows the selected location.')}</small></label>}
   {attach&&<div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px 12px',minWidth:0,paddingInlineStart:26}}><small style={{minWidth:0,overflowWrap:'anywhere'}}>{text('Attached image')}: {attach}</small><button type="button" style={secondary} disabled={busy} onClick={()=>setAttach(null)}>{text('Clear attached image')}</button></div>}
   {error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(error)}</div>}
   <div style={actions}><button type="submit" style={button} disabled={busy||!point||!validCategory||!title.trim()}>{text('Publish contribution')}</button><button type="button" style={secondary} disabled={busy} onClick={()=>{reset();if(sectionRef.current)sectionRef.current.open=false;}}>{text('Cancel draft')}</button></div>
  </form>
 </details>;
}
