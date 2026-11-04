/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { FieldNote } from '../../components/types';
import { WorkspaceCategoryEditor } from './WorkspaceCategoryEditor';
import { WorkspaceContributionTools } from './WorkspaceContributionTools';
import { useWorkspaceContributions } from './useWorkspaceContributions';
import { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation } from './communityWorkspace';
import type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';
import { workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button } from '../../styles/communityWorkspace';

interface Props { notes: readonly FieldNote[]; onFocus(note: FieldNote): void; onClose(): void;
  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }
const emptyRecords: CommunityRecord[] = [], emptyCategories: WorkspaceCategory[] = [];
const riskOptions = [['','Not assessed'],['high','High risk'],['low','Low risk'],['no_obvious_hazards','No obvious hazards observed']] as const;
const statusOptions = [['open','Open'],['in_progress','In progress'],['completed','Completed'],['dismissed','Dismissed']] as const;

/** Operator-owned collaboration, lazy-mounted for the Workspace source. Credentials
 * live in this mount only. No local note leaves the browser without Publish.
 * All database rights are verified by the operator's RLS, never by button visibility.
 */
export const CommunityWorkspacePanel: React.FC<Props> = ({notes,onFocus,onClose,onMapNotes}) => {
  const { owned: text, formatLocale } = useWidgetLocale();
  const client = React.useRef<CommunityWorkspaceClient|null>(null);
  const generation = React.useRef(0), running = React.useRef(false);
  const [connected,setConnected]=React.useState(false),[signedIn,setSignedIn]=React.useState(false),[busy,setBusy]=React.useState(false);
  const [endpoint,setEndpoint]=React.useState(''),[publicKey,setPublicKey]=React.useState(''),[accepted,setAccepted]=React.useState(false);
  const [email,setEmail]=React.useState(''),[password,setPassword]=React.useState(''),[invitation,setInvitation]=React.useState('');
  const [workspaces,setWorkspaces]=React.useState<CommunityWorkspace[]>([]),[active,setActive]=React.useState('');
  const [members,setMembers]=React.useState<WorkspaceMember[]>([]),[invites,setInvites]=React.useState<WorkspaceInvite[]>([]);
  const [error,setError]=React.useState(''),[message,setMessage]=React.useState('');
  const [name,setName]=React.useState(''),[contact,setContact]=React.useState(''),[joinCode,setJoinCode]=React.useState('');
  const [inviteRole,setInviteRole]=React.useState<'reader'|'contributor'>('contributor'),[inviteUses,setInviteUses]=React.useState(30),[shareText,setShareText]=React.useState('');
  const [localId,setLocalId]=React.useState(''),[publishCategory,setPublishCategory]=React.useState('');
  const [editing,setEditing]=React.useState(''),[reviewStatus,setReviewStatus]=React.useState('open'),[reviewCategory,setReviewCategory]=React.useState('');
  const [removal,setRemoval]=React.useState<{kind:'note'|'member';id:string}|null>(null);
  const workspace=workspaces.find(item=>item.id===active),owner=!!workspace&&workspace.owner_id===client.current?.userId;
  const canWrite=owner||members.some(member=>member.user_id===client.current?.userId&&member.role==='contributor');
  const contributions=useWorkspaceContributions(client.current,signedIn?active:'');
  const records=contributions.page?.notes||emptyRecords, categories=contributions.page?.categories||emptyCategories;
  const activeCategories=categories.filter(category=>!category.archived);
  const chosenCategory=activeCategories.some(category=>category.name===publishCategory)?publishCategory:activeCategories[0]?.name||'';
  React.useEffect(()=>{onMapNotes?.(records.map(note=>communityNoteTarget(note,categories,workspace?.name)),categories,workspace?.name||'');},[records,categories,workspace?.name,onMapNotes]);
  React.useEffect(()=>()=>onMapNotes?.([],[],''),[onMapNotes]);

  React.useEffect(()=>()=>{generation.current++;client.current?.dispose();client.current=null;},[]);

  /** Each task has a connection generation; disconnected/retired results cannot commit. */
  async function run<T>(work:()=>Promise<T>,done:(value:T)=>void):Promise<void>{
    if(running.current)return;
    running.current=true;setBusy(true);setError('');setMessage('');const revision=generation.current;
    try{const result=await work();if(revision===generation.current)done(result);}
    catch(failure){if(revision===generation.current&&(failure as Error)?.name!=='AbortError')setError((failure as Error)?.message||'Workspace request failed.');}
    finally{if(revision===generation.current){running.current=false;setBusy(false);}}
  }
  function disconnect(){generation.current++;client.current?.dispose();client.current=null;running.current=false;setBusy(false);setConnected(false);setSignedIn(false);setPassword('');setWorkspaces([]);setActive('');setMembers([]);setInvites([]);setShareText('');setError('');setMessage('');setAccepted(false);}
  function connect(){try{if(!accepted)throw new Error('Confirm the service operator before connecting.');client.current?.dispose();client.current=new CommunityWorkspaceClient({endpoint,publicKey});generation.current++;setConnected(true);setError('');}catch(failure){setError((failure as Error).message);}}
  function importInvitation(){try{const parsed=parseWorkspaceInvitation(invitation);setEndpoint(parsed.endpoint);setPublicKey(parsed.publicKey);setJoinCode(parsed.invitation);setAccepted(false);setInvitation('');setError('');}catch(failure){setError((failure as Error).message);}}
  /** Membership controls refresh separately from debounced contribution reads. */
  function loadPage(refresh=true){const api=client.current;if(!api||!active)return;if(refresh)contributions.refresh();void run(async()=>({members:await api.members(active),invites:owner?await api.invites(active):[]}),result=>{setMembers(result.members);setInvites(result.invites);});}
  React.useEffect(()=>{setMembers([]);setInvites([]);setShareText('');setEditing('');setRemoval(null);setPublishCategory('');if(signedIn&&active)loadPage(false);},[active,signedIn]);
  const action=(label:string,callback:()=>void,disabled=busy)=><button type="button" style={button} disabled={disabled} onClick={callback}>{text(label)}</button>;
  return <section role="tabpanel" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
    <div style={row}><strong>{text('Collaboration workspace')}</strong>{action('Close',onClose,false)}{connected&&action('Disconnect',disconnect,false)}</div>
    {!connected?<div style={card}>
      <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>
      <details><summary>{text('Have an invitation?')}</summary><label style={field}>{text('Invitation details')}<textarea aria-label={text('Invitation details')} style={input} value={invitation} onChange={event=>setInvitation(event.target.value)} /></label>{action('Use invitation details',importInvitation)}</details>
      <label style={field}>{text('Project URL')}<input style={input} type="url" value={endpoint} placeholder="https://your-project.supabase.co" onChange={event=>{setEndpoint(event.target.value);setAccepted(false);}} /></label>
      <label style={field}>{text('Public publishable or anon key')}<input style={input} value={publicKey} autoComplete="off" onChange={event=>{setPublicKey(event.target.value);setAccepted(false);}} /></label>
      <label><input type="checkbox" checked={accepted} onChange={event=>setAccepted(event.target.checked)} /> {text('I recognize this operator and choose to use its service.')}</label>
      {action('Connect',connect,!accepted)}
    </div>:<div style={card}>
      <span>{text('Data destination')}: {client.current?.connection.endpoint}</span>
      {!signedIn?<form style={{display:'grid',gap:6}} onSubmit={event=>{event.preventDefault();const api=client.current;if(!api)return;const secret=password;setPassword('');void run(async()=>{await api.signIn(email,secret);return api.workspaces();},list=>{setSignedIn(true);setWorkspaces(list);setActive(list[0]?.id||'');});}}>
        <p>{text('Use an account supplied by the workspace operator. No Esri Enterprise account is required.')}</p>
        <label style={field}>{text('Email')}<input style={input} type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} /></label>
        <label style={field}>{text('Password')}<input style={input} type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} /></label>
        <button type="submit" style={button} disabled={busy}>{text('Sign in')}</button>
      </form>:<React.Fragment>
        <label style={field}>{text('Workspace')}<select aria-label={text('Workspace')} style={input} disabled={busy} value={active} onChange={event=>setActive(event.target.value)}><option value="">{text('Choose a workspace')}</option>{workspaces.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {action('Refresh workspaces',()=>{const api=client.current!;void run(()=>api.workspaces(),list=>{setWorkspaces(list);if(!list.some(item=>item.id===active))setActive(list[0]?.id||'');});})}
        <details><summary>{text('Create or join a workspace')}</summary>
          {client.current?.canCreateWorkspace&&<React.Fragment><label style={field}>{text('Workspace name')}<input style={input} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>
          <label style={field}>{text('Operator contact')}<input style={input} maxLength={300} value={contact} onChange={event=>setContact(event.target.value)} /></label>
          {action('Create workspace',()=>{const api=client.current!;void run(async()=>{const id=await api.create(name,contact);return{id,list:await api.workspaces()};},result=>{setWorkspaces(result.list);setActive(result.id);setName('');setContact('');});})}</React.Fragment>}
          <label style={field}>{text('Invitation code')}<input style={input} value={joinCode} autoComplete="off" onChange={event=>setJoinCode(event.target.value)} /></label>
          {action('Join workspace',()=>{const api=client.current!;void run(async()=>{const id=await api.join(joinCode.trim());return{id,list:await api.workspaces()};},result=>{setWorkspaces(result.list);setActive(result.id);setJoinCode('');});})}
        </details>
      </React.Fragment>}
    </div>}
    {signedIn&&workspace&&<React.Fragment>
      <div style={card}><strong>{workspace.name}</strong><span>{text('Operator contact')}: {workspace.operator_contact}</span><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span>{action('Refresh notes',()=>loadPage())}</div>
      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}
        query={contributions.query} mine={contributions.mine} busy={contributions.busy} onQuery={contributions.setQuery} onMine={contributions.setMine} />
      {contributions.error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}
      {owner&&<WorkspaceCategoryEditor key={active} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>contributions.refresh());}} />}
      {!activeCategories.length&&!contributions.busy&&<p>{text('The owner must add an active workspace category before new contributions can be published.')}</p>}
      {canWrite&&<details style={card}><summary>{text('Publish a local note')}</summary>
        <p>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>
        <label style={field}>{text('Local note')}<select aria-label={text('Local note')} style={input} value={localId} onChange={event=>setLocalId(event.target.value)}><option value="">{text('Choose a local note')}</option>{notes.map(note=><option key={note.id} value={note.id}>{note.category}: {note.note.slice(0,80)}</option>)}</select></label>
        <label style={field}>{text('Contribution category')}<select aria-label={text('Contribution category')} style={input} value={chosenCategory} onChange={event=>setPublishCategory(event.target.value)}>{!chosenCategory&&<option value="">{text('No active categories')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>
        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!chosenCategory||!notes.some(note=>note.id===localId))}
      </details>}
      {owner&&<details style={card}><summary>{text('Manage invitations and members')}</summary>
        <label style={field}>{text('Invitation role')}<select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value="contributor">{text('Contributor')}</option><option value="reader">{text('Reader')}</option></select></label>
        <label style={field}>{text('Maximum joins')}<input style={input} type="number" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></label>
        {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}
        {shareText&&<label style={field}>{text('Share these invitation details')}<textarea aria-label={text('Share these invitation details')} style={input} readOnly value={shareText} onFocus={event=>event.currentTarget.select()} /></label>}
        {action('Refresh members and invitations',()=>loadPage())}
        {invites.map(item=><div key={item.id} style={card}><span>{item.role} · {item.uses}/{item.max_uses} · {item.expires_at}</span>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>)}
        {members.map(member=><div key={member.user_id} style={card}><span>{member.user_id} · {member.role}</span>{action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}{action('Remove member',()=>setRemoval({kind:'member',id:member.user_id}))}</div>)}
      </details>}
      <div style={row}><strong>{text('Loaded contributions')} ({records.length})</strong>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>
      {records.map(note=><article key={note.id} style={{...card,borderLeft:'4px solid '+(categories.find(category=>category.name===note.category)?.color||'#f5a623')}}><strong>{note.category}</strong><small>{text(note.author_id===client.current?.userId?'Your contribution':note.author_id===workspace.owner_id?'Owner’s contribution':'Member’s contribution')}</small><span style={{whiteSpace:'pre-wrap'}}>{note.note_text}</span>{note.resolution_note&&<span>{text('Resolution')}: {note.resolution_note}</span>}<small>{text('Last updated')}: {new Date(note.updated_at||note.created_at).toLocaleString(formatLocale)}</small><span>{text('Status')}: {text(statusOptions.find(([value])=>value===note.status)?.[1]||'Open')}</span>{note.risk_label&&<span>{text('Legacy risk assessment')}: {text(riskOptions.find(([value])=>value===note.risk_label)?.[1]||'Not assessed')}</span>}
        <div style={row}>{action('Show on map',()=>onFocus(communityNoteTarget(note,categories,workspace.name)),false)}{(owner||canWrite&&note.author_id===client.current?.userId)&&action('Update contribution',()=>{setEditing(note.id);setReviewStatus(note.status);setReviewCategory(note.category);})}{(owner||canWrite&&note.author_id===client.current?.userId)&&action('Remove shared note',()=>setRemoval({kind:'note',id:note.id}))}</div>
        {editing===note.id&&<div style={card}><label style={field}>{text('Status')}<select aria-label={text('Status')} style={input} value={reviewStatus} onChange={event=>setReviewStatus(event.target.value)}>{statusOptions.map(([value,label])=><option key={value} value={value}>{text(label)}</option>)}</select></label><label style={field}>{text('Contribution category')}<select aria-label={text('Edit contribution category')} style={input} value={reviewCategory} onChange={event=>setReviewCategory(event.target.value)}>{!activeCategories.some(category=>category.name===reviewCategory)&&<option value={reviewCategory}>{reviewCategory} · {text('Retired')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>{action('Save changes',()=>{const api=client.current!;void run(()=>api.review(active,note.id,reviewStatus,note.risk_label,reviewCategory),()=>{contributions.refresh();setEditing('');});})}{action('Cancel',()=>setEditing(''))}</div>}
      </article>)}
      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}
      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}
    </React.Fragment>}
    {removal&&<div role="group" aria-label={text('Confirm removal')} style={card}><span>{text(removal.kind==='note'?'Remove this shared note from the operator’s service?':'Remove this member’s workspace access?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{if(target.kind==='note')await api.removeNote(active,target.id);else await api.removeMember(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}
    {busy&&<span role="status">{text('Working with the selected workspace…')}</span>}
    {error&&<div role="alert" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(error)}</div>}
    {message&&<div role="status">{message}</div>}
  </section>;
};
