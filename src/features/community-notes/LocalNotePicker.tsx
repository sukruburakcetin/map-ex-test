/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { FieldNote } from '../../components/types';
import { indexLocalNotes, findLocalNotes } from './localNoteChoices';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input,
  workspaceSecondaryButtonStyle as button, workspacePickerResultsStyle as results } from '../../styles/communityWorkspace';

/** Native radios preserve keyboard selection without thousands of option nodes.
 * Search is browser-only across the complete indexed collection; rendering grows
 * in explicit batches of 30. Filtering never silently changes the selected note.
 */
export function LocalNotePicker({notes,value,onSelect,onPreview}:{notes:readonly FieldNote[];value:string;onSelect(id:string):void;onPreview(note:FieldNote):void}) {
  const {owned:text,formatLocale}=useWidgetLocale();
  const group=React.useId(),[query,setQuery]=React.useState(''),[limit,setLimit]=React.useState(30);
  const index=React.useMemo(()=>indexLocalNotes(notes,formatLocale),[notes,formatLocale]);
  const matching=React.useMemo(()=>findLocalNotes(index,query,formatLocale),[index,query,formatLocale]);
  const selected=notes.find(note=>note.id===value);
  function updateQuery(value:string){setQuery(value);setLimit(30);}
  return <div style={{display:'grid',gap:8,minWidth:0}}>
    <label style={field}>{text('Search local notes')}<input aria-label={text('Search local notes')} type="search" style={input} maxLength={200} value={query} onChange={event=>updateQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape')updateQuery('');}} placeholder={text('Category, description, follow-up or image ID')} /></label>
    <small role="status">{text('Matching local notes')}: {matching.length} / {notes.length}</small>
    <div role="group" aria-label={text('Local notes to publish')} className="mly-notes-scroll" style={results}>
      {matching.slice(0,limit).map(({note})=><label key={note.id} style={{...row,alignItems:'flex-start',padding:8,border:'1px solid '+(value===note.id?'#9fd7b9':'#496052'),borderRadius:4,background:value===note.id?'#294c39':'transparent',cursor:'pointer'}}>
        <input type="radio" name={group} value={note.id} checked={value===note.id} onChange={()=>onSelect(note.id)} aria-label={`${note.category}: ${note.note.slice(0,160)}`} />
        <span style={{display:'grid',gap:3,minWidth:0,flex:'1 1 0'}}><strong>{note.category}</strong><span style={{overflowWrap:'anywhere'}}>{note.note.slice(0,200)}</span><small>{Number.isFinite(note.createdAt)?new Date(note.createdAt).toLocaleString(formatLocale):note.id}</small></span>
      </label>)}
      {!matching.length&&<p style={{margin:4}}>{text(notes.length?'No local notes match this search.':'There are no local notes in this browser. Create a local note first.')}</p>}
    </div>
    {matching.length>limit&&<button type="button" style={button} onClick={()=>setLimit(value=>value+30)}>{text('Show more local notes')} ({Math.min(limit,matching.length)}/{matching.length})</button>}
    {selected?<div style={card}><strong>{text('Selected local note')}: {selected.category}</strong><span style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{selected.note.slice(0,300)}</span>
      {!matching.some(choice=>choice.note.id===value)&&<small>{text('Your selected note is outside the current search results.')}</small>}
      <div style={row}><button type="button" style={button} onClick={()=>onPreview(selected)}>{text('Show local note on map')}</button><button type="button" style={button} onClick={()=>onSelect('')}>{text('Clear selection')}</button></div>
    </div>:<small>{text('Select one local note to publish.')}</small>}
  </div>;
}
