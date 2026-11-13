/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { formatWorkspaceContributor, validateWorkspaceDisplayName } from './communityWorkspace';
import { workspaceSectionStyle as section, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input,
  workspaceButtonStyle as button, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';

/** Workspace-specific, self-managed alias; identity/roles remain server-controlled.
 * Existing unnamed members can continue reading with short-ID labels. Names are
 * never derived from login email or client-editable auth profile metadata.
 */
export function WorkspaceDisplayNameEditor({value,userId,busy,error,onSave}:{value:string|null|undefined;userId:string;busy:boolean;error:string;
 onSave(name:string,onSaved:()=>void):void}) {
  const {owned:text}=useWidgetLocale();
  const [editing,setEditing]=React.useState(!value),[draft,setDraft]=React.useState(value||''),[validation,setValidation]=React.useState('');
  React.useEffect(()=>setDraft(value||''),[value]);
  return <div className="mly-workspace-section" style={section}>
    <div style={{...row,justifyContent:'space-between'}}><strong>{text('Your workspace display name')}</strong><bdi style={{overflowWrap:'anywhere'}}>{formatWorkspaceContributor(userId,value,text('Not set'))}</bdi>
      {!editing&&<button className="mly-text-action" type="button" style={secondary} onClick={()=>{setDraft(value||'');setValidation('');setEditing(true);}}>{text('Edit display name')}</button>}
    </div>
    {editing&&<form style={{display:'grid',gap:8,minWidth:0}} onSubmit={event=>{event.preventDefault();if(busy)return;try{const name=validateWorkspaceDisplayName(draft);setValidation('');onSave(name,()=>setEditing(false));}catch(failure){setValidation((failure as Error).message);}}}>
      <label style={field}>{text('Workspace display name')}<input aria-label={text('Workspace display name')} style={input} maxLength={120} value={draft} disabled={busy} onChange={event=>setDraft(event.target.value)} autoComplete="off" /></label>
      <small>{text('Use an alias you are comfortable sharing with this workspace. Names are unverified and may be duplicated; ID tags distinguish contributors.')}</small>
      <div style={row}><button className="mly-text-action" type="submit" style={button} disabled={busy||!draft.trim()}>{text('Save display name')}</button>{value&&<button className="mly-text-action" type="button" style={secondary} disabled={busy} onClick={()=>setEditing(false)}>{text('Cancel name edit')}</button>}</div>
      {(validation||error)&&<div role="alert" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(validation||error)}</div>}
    </form>}
  </div>;
}
