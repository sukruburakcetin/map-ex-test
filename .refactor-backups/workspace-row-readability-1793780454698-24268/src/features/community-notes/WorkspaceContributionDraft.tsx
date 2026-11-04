/** @jsx jsx */
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
export function WorkspaceContributionDraft({categories,busy,error,onPickLocation,onPublish,sectionRef,currentImageId}:{categories:readonly WorkspaceCategory[];busy:boolean;error:string;onPickLocation?:WorkspaceLocationRequest;
 onPublish(values:DirectContributionValues,onSaved:()=>void):void;sectionRef:React.RefObject<HTMLDetailsElement>;currentImageId?:string|null}) {
 const {owned:text}=useWidgetLocale();
 const [title,setTitle]=React.useState(''),[description,setDescription]=React.useState(''),[category,setCategory]=React.useState('');
 const [point,setPoint]=React.useState<WorkspaceMapLocation|null>(null),[picking,setPicking]=React.useState(false),[attach,setAttach]=React.useState<string|null>(null);
 const locationStatus=React.useRef<HTMLSpanElement>(null);
 React.useEffect(()=>{if(point){locationStatus.current?.scrollIntoView({block:'nearest'});locationStatus.current?.focus({preventScroll:true});}},[point]);
 const source=React.useRef(''),cancel=React.useRef<(()=>void)|null>(null);
 React.useEffect(()=>()=>{cancel.current?.();},[]);
 React.useEffect(()=>{if(!category){const first=categories.find(item=>!item.archived);if(first)setCategory(first.name);}},[categories,category]);
 const active=categories.filter(item=>!item.archived),validCategory=active.some(item=>item.name===category);
 function reset(){cancel.current?.();cancel.current=null;source.current='';setTitle('');setDescription('');setPoint(null);setPicking(false);setAttach(null);}
 function chooseLocation(){if(!onPickLocation)return;cancel.current?.();setPicking(true);cancel.current=onPickLocation(location=>{cancel.current=null;setPoint(location);setPicking(false);},()=>{cancel.current=null;setPicking(false);});}
 return <details ref={sectionRef} style={{...section,display:'block'}}><summary style={summary}>{text('Create contribution')}</summary>
  <form aria-label={text('Create contribution')} style={{display:'grid',gap:10,minWidth:0,paddingTop:8}} onSubmit={event=>{event.preventDefault();if(busy||!point||!validCategory||!title.trim())return;if(!source.current)source.current='community:'+crypto.randomUUID();onPublish({sourceId:source.current,title:title.trim(),description,category,lon:point.lon,lat:point.lat,imageId:attach},reset);}}>
   <p style={{margin:0}}>{text('Choose a map location and use this workspace’s categories. No local draft or Builder access is required.')}</p>
   <button type="button" style={secondary} disabled={busy||!onPickLocation} onClick={chooseLocation}>{text(point?'Choose another map location':'Choose location on map')}</button>
   <span ref={locationStatus} tabIndex={-1} role="status">{picking?text('Click the map to place this contribution.'):point?`${text('Selected location')}: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`:text('Select a location before publishing.')}</span>
   <label style={field}>{text('Title')}<input aria-label={text('New contribution title')} style={input} required maxLength={160} disabled={busy} value={title} onChange={event=>setTitle(event.target.value)}/></label>
   <label style={field}>{text('Workspace category')}<select aria-label={text('New contribution category')} style={input} disabled={busy} value={category} onChange={event=>setCategory(event.target.value)}>{!validCategory&&<option value={category}>{category||text('No active categories')}</option>}{active.map(item=><option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
   {category&&!validCategory&&<small>{text('This category is no longer active. Choose another before publishing.')}</small>}
   <label style={field}>{text('Description')}<textarea aria-label={text('New contribution description')} style={{...input,resize:'vertical',minHeight:90}} rows={4} maxLength={8000} disabled={busy} value={description} onChange={event=>setDescription(event.target.value)}/></label>
   {currentImageId&&<label><input type="checkbox" disabled={busy} checked={attach===currentImageId} onChange={event=>setAttach(event.target.checked?currentImageId:null)}/> {text('Attach the currently viewed image')} ({currentImageId})<small style={{display:'block'}}>{text('Attach it only if it shows the selected location.')}</small></label>}
   {attach&&<div><small>{text('Attached image')}: {attach}</small><button type="button" style={secondary} disabled={busy} onClick={()=>setAttach(null)}>{text('Clear attached image')}</button></div>}
   {error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(error)}</div>}
   <div style={actions}><button type="submit" style={button} disabled={busy||!point||!validCategory||!title.trim()}>{text('Publish contribution')}</button><button type="button" style={secondary} disabled={busy} onClick={()=>{reset();if(sectionRef.current)sectionRef.current.open=false;}}>{text('Cancel draft')}</button></div>
  </form>
 </details>;
}
