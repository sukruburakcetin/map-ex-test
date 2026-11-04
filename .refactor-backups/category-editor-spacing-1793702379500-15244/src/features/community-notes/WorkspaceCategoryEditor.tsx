/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { WorkspaceCategory } from './communityWorkspace';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';

/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring
 * a category preserves its old assignments/color while preventing new use.
 * RLS and the operator RPC enforce ownership even when UI controls are bypassed.
 */
export function WorkspaceCategoryEditor({categories,busy,onSave,sectionRef}:{sectionRef?:React.RefObject<HTMLDetailsElement>;categories:readonly WorkspaceCategory[];busy:boolean;onSave(name:string,color:string,archived:boolean):void}) {
  const {owned:text}=useWidgetLocale();
  const [editing,setEditing]=React.useState(false);
  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');
  return <details ref={sectionRef} style={sectionStyle}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>
    <p>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>
    {editing&&<strong>{text('Editing category')}: {name}</strong>}
    <button type="button" style={secondary} onClick={()=>{setEditing(false);setName('');setColor('#f5a623');}}>{text('Add a new category')}</button>
    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} readOnly={editing} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>
    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type="color" value={color} onChange={event=>setColor(event.target.value)} /></label>
    <button type="button" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>
    {categories.map(category=><div key={category.name} style={row}>
      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}
      <button type="button" style={button} disabled={busy} onClick={()=>{setEditing(true);setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>
      <button type="button" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>
    </div>)}
  </details>;
}
