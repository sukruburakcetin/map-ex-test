/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { CommunityRecord } from './communityWorkspace';
import { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';
import { workspaceContributionCardStyle as card, workspaceRowStyle as row, workspaceButtonStyle as button,
  workspaceSecondaryButtonStyle as secondary, workspaceDangerButtonStyle as danger, workspaceStatusBadgeStyle as statusBadge } from '../../styles/communityWorkspace';

interface Props {busy:boolean;note:CommunityRecord;color:string;own:boolean;ownerContribution:boolean;canEdit:boolean;canRemove:boolean;
 onShow():void;onEdit():void;onRemove():void;children?:React.ReactNode}
const statuses:Record<string,string>={open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'};
const legacy:Record<string,string>={high:'High risk',low:'Low risk',no_obvious_hazards:'No obvious hazards observed'};

/** Separate category/status, author/date, readable content and next actions.
 * Ownership changes permissions and labels, never the marker's appearance.
 */
export function WorkspaceContributionCard({note,color,own,ownerContribution,canEdit,canRemove,onShow,onEdit,onRemove,children,busy}:Props){
 const {owned:text,formatLocale}=useWidgetLocale();
 return <article style={{...card,borderInlineStart:'4px solid '+color}}>
  <div style={{...row,justifyContent:'space-between'}}><WorkspaceCategoryBadge name={note.category} color={color}/><span style={statusBadge}>{text('Status')}: {text(statuses[note.status]||note.status)}</span></div>
  <div style={{...row,fontSize:10,color:'#bdd0c5'}}><span>{text(own?'Your contribution':ownerContribution?'Owner’s contribution':'Member’s contribution')}</span><span>{text('Last updated')}: {new Date(note.updated_at||note.created_at).toLocaleString(formatLocale)}</span></div>
  <p style={{margin:0,fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{note.note_text}</p>
  {note.resolution_note&&<div style={{fontSize:12,lineHeight:1.5}}><strong>{text('Outcome / follow-up')}: </strong>{note.resolution_note}</div>}
  {note.risk_label&&<small>{text('Legacy risk assessment')}: {text(legacy[note.risk_label]||note.risk_label)}</small>}
  <div style={{...row,borderTop:'1px solid #496052',paddingTop:8}}>
   <button type="button" style={button} onClick={onShow}>{text('Show on map')}</button>
   {canEdit&&<button type="button" style={secondary} disabled={busy} onClick={onEdit}>{text('Update contribution')}</button>}
   {canRemove&&<button type="button" style={danger} disabled={busy} onClick={onRemove}>{text('Remove shared note')}</button>}
  </div>
  {children}
 </article>;
}
