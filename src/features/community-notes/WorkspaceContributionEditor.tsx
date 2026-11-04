/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { CommunityRecord, WorkspaceCategory, ContributionEditValues } from './communityWorkspace';
import { workspaceSectionStyle as section, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button,
  workspaceSecondaryButtonStyle as secondary, workspaceEditorActionsStyle as actions } from '../../styles/communityWorkspace';

const statuses=[['open','Open'],['in_progress','In progress'],['completed','Completed'],['dismissed','Dismissed']];
/** Keep the initial draft and version until explicit save/cancel. Background refresh
 * cannot silently replace text or the version used for optimistic conflict checks.
 * Parent owns authorization/transport; failed saves leave the draft intact.
 */
export function WorkspaceContributionEditor({note,categories,busy,error,onSave,onCancel}:{note:CommunityRecord;categories:readonly WorkspaceCategory[];busy:boolean;error:string;
 onSave(values:ContributionEditValues,expectedVersion:string):void;onCancel():void}) {
  const {owned:text}=useWidgetLocale();
  const [values,setValues]=React.useState<ContributionEditValues>(()=>({title:note.title||'',category:note.category,status:note.status,note:note.note_text,resolutionNote:note.resolution_note}));
  const version=React.useRef(note.updated_at||note.created_at),heading=React.useRef<HTMLHeadingElement>(null);
  React.useEffect(()=>{heading.current?.scrollIntoView({block:'nearest'});heading.current?.focus({preventScroll:true});},[]);
  const active=categories.filter(category=>!category.archived);
  return <form aria-label={text('Edit contribution')} style={{...section,borderColor:'#8bbba1'}} onSubmit={event=>{event.preventDefault();if(!busy)onSave(values,version.current);}}>
    <h4 ref={heading} tabIndex={-1} style={{margin:0}}>{text('Edit contribution')}</h4>
    <small>{text('Changes update this shared contribution. Its local copy stays unchanged.')}</small>
    <fieldset disabled={busy} style={{display:'grid',gap:10,border:0,padding:0,margin:0,minWidth:0}}>
      <label style={field}>{text('Title')}<input aria-label={text('Contribution title')} style={input} maxLength={160} value={values.title||''} onChange={event=>setValues({...values,title:event.target.value})} /></label>
      <small>{text('The category is used as the heading when the title is empty.')}</small>
      <label style={field}>{text('Description')}<textarea aria-label={text('Contribution description')} style={{...input,resize:'vertical',minHeight:90}} rows={4} maxLength={8000} value={values.note} onChange={event=>setValues({...values,note:event.target.value})} /></label>
      <label style={field}>{text('Status')}<select aria-label={text('Status')} style={input} value={values.status} onChange={event=>setValues({...values,status:event.target.value})}>{statuses.map(([value,label])=><option key={value} value={value}>{text(label)}</option>)}</select></label>
      <label style={field}>{text('Contribution category')}<select aria-label={text('Edit contribution category')} style={input} value={values.category} onChange={event=>setValues({...values,category:event.target.value})}>
        {!active.some(category=>category.name===values.category)&&<option value={values.category}>{values.category} · {text('Retired')}</option>}{active.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}
      </select></label>
      <label style={field}>{text('Outcome / follow-up (optional)')}<textarea aria-label={text('Outcome / follow-up (optional)')} style={{...input,resize:'vertical',minHeight:70}} rows={3} maxLength={8000} value={values.resolutionNote} onChange={event=>setValues({...values,resolutionNote:event.target.value})} /></label>
    </fieldset>
    <details><summary>{text('Location and image')}</summary><p style={{overflowWrap:'anywhere'}}>{text('Longitude')}: {note.lon} · {text('Latitude')}: {note.lat}<br/>{text('Image ID')}: {note.image_id||text('Not linked')}</p><small>{text('Location and image stay attached to this contribution. To change them, publish a new local note at the correct location or image.')}</small></details>
    {error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(error)}<p>{text('Your draft is kept. If the contribution changed, cancel and reopen after refreshing to review the latest version.')}</p></div>}
    <div style={actions}><button type="submit" style={button} disabled={busy}>{text(busy?'Saving…':'Save changes')}</button><button type="button" style={secondary} disabled={busy} onClick={onCancel}>{text('Cancel')}</button></div>
  </form>;
}
