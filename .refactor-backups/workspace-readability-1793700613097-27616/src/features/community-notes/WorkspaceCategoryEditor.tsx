/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { WorkspaceCategory } from './communityWorkspace';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button } from '../../styles/communityWorkspace';

/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring
 * a category preserves its old assignments/color while preventing new use.
 * RLS and the operator RPC enforce ownership even when UI controls are bypassed.
 */
export function WorkspaceCategoryEditor({categories,busy,onSave}:{categories:readonly WorkspaceCategory[];busy:boolean;onSave(name:string,color:string,archived:boolean):void}) {
  const {owned:text}=useWidgetLocale();
  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');
  return <details style={card}><summary>{text('Manage workspace categories')}</summary>
    <p>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>
    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>
    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type="color" value={color} onChange={event=>setColor(event.target.value)} /></label>
    <button type="button" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>
    {categories.map(category=><div key={category.name} style={row}>
      <span aria-hidden="true" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5',flexShrink:0}} />
      <span style={{overflowWrap:'anywhere'}}>{category.name}{category.archived?` · ${text('Retired')}`:''}</span>
      <button type="button" style={button} disabled={busy} onClick={()=>{setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>
      <button type="button" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>
    </div>)}
  </details>;
}
