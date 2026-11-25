/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';
import { WorkspaceFieldHelp } from './WorkspaceFieldHelp';
import type { WorkspaceCategory } from './communityWorkspace';
import { workspaceRowStyle as row, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceSecondaryButtonStyle as secondary, workspaceDangerButtonStyle as danger, workspaceCategoryEditorBodyStyle as body, workspaceCategoryEditorRowStyle as categoryRow, workspaceColorInputStyle as colorInput } from '../../styles/communityWorkspace';

interface Props {
  sectionRef?: React.RefObject<HTMLDetailsElement>;
  categories: readonly WorkspaceCategory[];
  busy: boolean;
  addRequest?: number;
  categoryCounts?: Readonly<Record<string,number>>;
  onDelete(name: string, onDeleted: () => void, onFailure: (message: string) => void): void;
  onSave(name: string, color: string, archived: boolean, onSaved?: () => void): void;
}

export function WorkspaceCategoryEditor({categories,busy,onSave,sectionRef,addRequest,categoryCounts,onDelete}: Props) {
  const {owned:text}=useWidgetLocale();
  const [draft,setDraft]=React.useState<{category:WorkspaceCategory|null;name:string;color:string}|null>(null);
  const [confirmDelete,setConfirmDelete]=React.useState<string|null>(null);
  const [deleteError,setDeleteError]=React.useState('');
  const confirmRef=React.useRef<HTMLDivElement>(null);
  React.useEffect(()=>{if(confirmDelete!==null)confirmRef.current?.focus();},[confirmDelete]);
  const field=React.useRef<HTMLInputElement>(null);
  const addButton=React.useRef<HTMLButtonElement>(null);
  const returnFocus=React.useRef<HTMLButtonElement|null>(null);
  const previousRequest=React.useRef(addRequest);
  React.useEffect(()=>{
    if(addRequest===previousRequest.current)return;
    previousRequest.current=addRequest;
    returnFocus.current=null;
    setDraft({category:null,name:'',color:'#f5a623'});
  },[addRequest]);
  const editingName=draft?.category?.name;
  const adding=draft!==null&&!draft.category;
  React.useEffect(()=>{
    if(adding||editingName!==undefined) {
      const frame=requestAnimationFrame(()=>field.current?.focus());
      return ()=>cancelAnimationFrame(frame);
    }
  },[adding,editingName]);

  function closeEditor() {
    setDraft(null);
    requestAnimationFrame(()=>(returnFocus.current?.isConnected?returnFocus.current:addButton.current)?.focus());
  }

  const duplicate=adding&&categories.some(category=>category.name===draft.name.trim());
  const editor=draft&&<form className="mly-workspace-category-form" onSubmit={event=>{
    event.preventDefault();
    if(!busy&&draft.name.trim()&&!duplicate)
      onSave(draft.name.trim(),draft.color,draft.category?.archived??false,closeEditor);
  }}>
    {!draft.category&&<WorkspaceFieldHelp label={text('Category name')} help={text('Use a name contributors will recognize.')}>
      <input ref={field} aria-label={text('Category name')} style={input} required maxLength={120} disabled={busy}
        value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})} />
    </WorkspaceFieldHelp>}
    <WorkspaceFieldHelp label={text('Category color')} help={text('This color appears beside the category and on the map.')}>
      <input ref={draft.category?field:undefined} aria-label={text('Category color')} type="color" style={colorInput}
        disabled={busy} value={draft.color} onChange={event=>setDraft({...draft,color:event.target.value})} />
    </WorkspaceFieldHelp>
    {duplicate&&<small role="status">{text('This name already exists. Use Edit color on the existing category.')}</small>}
    <div style={row}>
      <button className="mly-text-action" type="submit" style={button}
        disabled={busy||!draft.name.trim()||duplicate||draft.color===draft.category?.color}>{text(draft.category?'Save color':'Save category')}</button>
      <button className="mly-text-action" type="button" style={secondary} disabled={busy} onClick={closeEditor}>{text('Cancel')}</button>
    </div>
  </form>;

  function cancelDelete() {
    setConfirmDelete(null);
    setDeleteError('');
    requestAnimationFrame(()=>returnFocus.current?.focus());
  }

  return <details ref={sectionRef} className="mly-workspace-section" style={{...sectionStyle,display:'block'}}>
    <summary style={summaryStyle}>{text('Manage workspace categories')} <small className="mly-workspace-section-hint">{text('Add, recolor, retire, or delete categories')}</small></summary>
    <div style={body}>
      <div style={{...row,justifyContent:'space-between'}}>
        <small>{text('Retired categories can’t be selected for new notes. Existing notes keep them.')}</small>
        {!adding&&<button ref={addButton} className="mly-text-action" type="button" style={button} disabled={busy||!!draft||confirmDelete!==null}
          onClick={()=>{returnFocus.current=null;setDraft({category:null,name:'',color:'#f5a623'});}}>{text('Add a category')}</button>}
      </div>
      {adding&&editor}
      {!categories.length&&!adding&&<p style={{margin:0}}>{text('Add a category so members can publish notes.')}</p>}
      <div style={{display:'grid',gap:6,minWidth:0}}>
        {categories.map(category=>{
          const unused=categoryCounts!==undefined&&
            (!Object.prototype.hasOwnProperty.call(categoryCounts,category.name)||categoryCounts[category.name]===0);
          return <div key={category.name} className="mly-workspace-category-row" style={categoryRow}>
          <div style={{...row,justifyContent:'space-between'}}>
            <div style={row}><WorkspaceCategoryBadge name={category.name} color={category.color}/>
              {category.archived&&<small>{text('Retired')}</small>}
            </div>
            <div style={{...row,display:editingName===category.name?'none':'flex'}}>
              <button className="mly-text-action" type="button" style={secondary} disabled={busy||!!draft||confirmDelete!==null}
                onClick={event=>{returnFocus.current=event.currentTarget;setDraft({category,name:category.name,color:category.color});}}>{text('Edit color')}</button>
              <button className="mly-text-action" type="button" style={secondary} disabled={busy||!!draft||confirmDelete!==null}
                onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>
              {unused&&<button className="mly-text-action" type="button" style={secondary}
                disabled={busy||!!draft||confirmDelete!==null} onClick={event=>{
                  returnFocus.current=event.currentTarget;setDeleteError('');setConfirmDelete(category.name);
                }}>{text('Delete category')}</button>}
            </div>
          </div>
          {confirmDelete===category.name&&
            <div ref={confirmRef} tabIndex={-1} role="group" aria-label={text('Confirm category deletion')} style={{display:'grid',gap:8}}>
              <span>{text('Permanently delete this category?')}</span>
              {deleteError&&<span role="alert">{text(deleteError)}</span>}
              <div style={row}>
                <button className="mly-text-action" type="button" style={danger} disabled={busy}
                  onClick={()=>onDelete(category.name,()=>{setConfirmDelete(null);requestAnimationFrame(()=>addButton.current?.focus());},setDeleteError)}>
                  {text('Permanently delete category')}
                </button>
                <button className="mly-text-action" type="button" style={secondary} disabled={busy} onClick={cancelDelete}>{text('Cancel')}</button>
              </div>
            </div>}
          {editingName===category.name&&editor}
        </div>;})
      </div>
    </div>
  </details>;
}
