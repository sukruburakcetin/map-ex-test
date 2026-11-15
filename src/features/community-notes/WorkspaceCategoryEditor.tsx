/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { WorkspaceCategory } from './communityWorkspace';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceSecondaryButtonStyle as secondary, workspaceCategoryEditorBodyStyle as body, workspaceCategoryEditorRowStyle as categoryRow, workspaceColorInputStyle as colorInput } from '../../styles/communityWorkspace';

/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring
 * a category preserves its old assignments/color while preventing new use.
 * RLS and the operator RPC enforce ownership even when UI controls are bypassed.
 */
export function WorkspaceCategoryEditor({categories,busy,onSave,sectionRef}:{sectionRef?:React.RefObject<HTMLDetailsElement>;categories:readonly WorkspaceCategory[];busy:boolean;onSave(name:string,color:string,archived:boolean):void}) {
  const {owned:text}=useWidgetLocale();
  const [editing,setEditing]=React.useState(false);
  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');
  return <details ref={sectionRef} className="mly-workspace-section" style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>
    {/* Details content needs its own layout container; grid on details itself is inconsistent across browsers. */}
    <div style={body}>
    <p style={{margin:0}}>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>
    <div style={{...row,gap:12,justifyContent:'space-between'}}>
    {editing&&<strong style={{minWidth:0,overflowWrap:'anywhere'}}>{text('Editing category')}: {name}</strong>}
    <button className="mly-text-action" type="button" style={secondary} onClick={()=>{setEditing(false);setName('');setColor('#f5a623');}}>{text('Add a new category')}</button>
    </div>
    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} readOnly={editing} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>
    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type="color" style={colorInput} value={color} onChange={event=>setColor(event.target.value)} /></label>
    <button className="mly-text-action" type="button" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>
    <div style={{display:'grid',gap:8,minWidth:0}}>
    {categories.map(category=><div key={category.name} className="mly-workspace-category-row" style={categoryRow}>
      <div style={{...row,flex:'1 1 140px'}}>
      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}
      </div>
      <div style={{...row,gap:8}}>
      <button className="mly-text-action" type="button" style={button} disabled={busy} onClick={()=>{setEditing(true);setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>
      <button className="mly-text-action" type="button" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>
      </div>
    </div>)}
    </div>
    </div>
  </details>;
}
