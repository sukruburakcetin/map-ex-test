import type { Presentation } from './PresentationText';
/** Widget-owned field presentation; values and action IDs remain untouched. */
export function enterprisePopupContent(presentation:Presentation,workflow:boolean):(feature:any)=>HTMLElement {
 let previous:HTMLElement|null=null;
 return feature=>{
  presentation.release(previous);
  const table=document.createElement('table');table.className='esri-widget__table';previous=table;presentation.bind(table,'dir',()=>presentation.locale==='ar'?'rtl':'ltr');
  const attributes=feature?.graphic?.attributes || feature?.attributes || {};
  const rows=workflow?[['Category','category'],['Note','note_text'],['Status','status'],['Resolution','resolution_note'],['Created','created_at']]:[['Category','category'],['Note','note_text'],['Created','created_at'],['Mapillary image','image_id']];
  for(const[label,field]of rows){const row=document.createElement('tr'),heading=document.createElement('th'),value=document.createElement('td');heading.style.textAlign='start';heading.style.verticalAlign='top';value.style.whiteSpace='pre-wrap';
   presentation.bind(heading,'textContent',()=>presentation.text(label));
   if(field==='created_at'){const date=new Date(attributes[field]);presentation.bind(value,'textContent',()=>Number.isFinite(date.getTime())?presentation.date(date,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):presentation.text('Date unavailable'));}
   else if(field==='status'){const labels:Record<string,string>={open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'};presentation.bind(value,'textContent',()=>presentation.text(labels[attributes[field]]||String(attributes[field]??'')));}
   else {value.dir=field==='image_id'?'ltr':'auto';value.textContent=String(attributes[field]??'');}
   row.appendChild(heading);row.appendChild(value);table.appendChild(row);
  }
  return table;
 };
}
