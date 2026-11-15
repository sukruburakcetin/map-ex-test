/** Overlapping map targets need explicit intent; do not fetch detection tiles merely to open a note. */
export function createNoteObjectChoice(document:Document,text:(source:string)=>string,openNote:()=>void,explore:()=>Promise<boolean>,current:()=>boolean):HTMLElement {
 const root=document.createElement('div');Object.assign(root.style,{display:'grid',gap:'8px',fontSize:'12px',lineHeight:'1.4'});
 root.onpointerdown=event=>event.stopPropagation();
 const status=document.createElement('span');status.setAttribute('role','status');status.textContent=text('A note is at this location. Choose what to open.');root.appendChild(status);
 const button=(label:string)=>{const element=document.createElement('button');element.type='button';element.className='mly-text-action';element.textContent=text(label);Object.assign(element.style,{padding:'7px 10px',minHeight:'32px',border:'1px solid #648b73',borderRadius:'5px',background:'#214233',color:'#e1eee5',fontSize:'12px',cursor:'pointer',textAlign:'start'});root.appendChild(element);return element;};
 const note=button('Open field note'),object=button('Explore sign/object here');
 note.onclick=event=>{event.preventDefault();event.stopPropagation();if(current())openNote();};
 object.onclick=async event=>{event.preventDefault();event.stopPropagation();if(!current()||object.disabled)return;object.disabled=true;status.textContent=text('Finding sign/object…');try{const found=await explore();if(current()&&!found)status.textContent=text('No active sign or object was found here. You can still open the note.');}catch{if(current())status.textContent=text('The sign/object could not be opened. Try again.');}finally{object.disabled=false;}};
 return root;
}
/** Keep the SDK's automatic popup from replacing the chooser after async hit testing.
 * ArcGIS 4.33+ supports event.defer; unrelated layer clicks keep normal propagation. */
export function deferNoteObjectPopup<R>(event:{defer?:(work:()=>Promise<void>)=>void;stopPropagation:()=>void},response:Promise<R>,hasNote:(hit:R)=>boolean,current:()=>boolean):void {
 if(typeof event.defer!=='function')return;
 event.defer(async()=>{try{const hit=await response;if(current()&&hasNote(hit))event.stopPropagation();}catch{/* The main click handler owns hit-test errors. */}});
}
