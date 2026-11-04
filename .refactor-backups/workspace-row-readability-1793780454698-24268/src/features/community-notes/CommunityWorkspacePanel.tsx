/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { FieldNote } from '../../components/types';
import { WorkspaceContributionDraft } from './WorkspaceContributionDraft';
import type { WorkspaceLocationRequest } from './WorkspaceLocationPicker';
import { WorkspaceDisplayNameEditor } from './WorkspaceDisplayNameEditor';
import { LocalNotePicker } from './LocalNotePicker';
import { WorkspaceContributionEditor } from './WorkspaceContributionEditor';
import { WorkspaceContributionCard } from './WorkspaceContributionCard';
import { WorkspaceCategoryEditor } from './WorkspaceCategoryEditor';
import { WorkspaceContributionTools } from './WorkspaceContributionTools';
import { useWorkspaceContributions } from './useWorkspaceContributions';
import { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation, formatWorkspaceContributor } from './communityWorkspace';
import type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';
import { workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceHeadingStyle as headingStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';

interface Props { onPickLocation?:WorkspaceLocationRequest;currentImageId?:string|null;notes: readonly FieldNote[]; onFocus(note: FieldNote): void; onClose(): void;
  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }
const emptyRecords: CommunityRecord[] = [], emptyCategories: WorkspaceCategory[] = [];

/** Operator-owned collaboration, lazy-mounted for the Workspace source. Credentials
 * live in this mount only. No local note leaves the browser without Publish.
 * All database rights are verified by the operator's RLS, never by button visibility.
 */
export const CommunityWorkspacePanel: React.FC<Props> = ({notes,onFocus,onClose,onMapNotes,onPickLocation,currentImageId}) => {
  const { owned: text } = useWidgetLocale();
  const [connectionOpen,setConnectionOpen]=React.useState(true);
  const resultsRef=React.useRef<HTMLDivElement>(null),createRef=React.useRef<HTMLDetailsElement>(null),publishRef=React.useRef<HTMLDetailsElement>(null),categoriesRef=React.useRef<HTMLDetailsElement>(null);
  /** Open the requested task and move focus without stealing normal list scrolling. */
  function goToSection(ref: React.RefObject<HTMLElement>){
    const node=ref.current;if(!node)return;
    if(node.tagName==='DETAILS')(node as HTMLDetailsElement).open=true;
    node.scrollIntoView({block:'start',behavior:'smooth'});
    const target=node.querySelector<HTMLElement>('summary')||node;
    target.focus({preventScroll:true});
  }
  const client = React.useRef<CommunityWorkspaceClient|null>(null);
  const generation = React.useRef(0), running = React.useRef(false);
  const [connected,setConnected]=React.useState(false),[signedIn,setSignedIn]=React.useState(false),[busy,setBusy]=React.useState(false);
  const [endpoint,setEndpoint]=React.useState(''),[publicKey,setPublicKey]=React.useState(''),[accepted,setAccepted]=React.useState(false);
  const [email,setEmail]=React.useState(''),[password,setPassword]=React.useState(''),[invitation,setInvitation]=React.useState('');
  const [workspaces,setWorkspaces]=React.useState<CommunityWorkspace[]>([]),[active,setActive]=React.useState('');
  const [members,setMembers]=React.useState<WorkspaceMember[]>([]),[invites,setInvites]=React.useState<WorkspaceInvite[]>([]);
  const [error,setError]=React.useState(''),[message,setMessage]=React.useState('');
  const [name,setName]=React.useState(''),[contact,setContact]=React.useState(''),[joinCode,setJoinCode]=React.useState('');
  const [ownerAlias,setOwnerAlias]=React.useState(''),[joinAlias,setJoinAlias]=React.useState(''),[aliasError,setAliasError]=React.useState('');
  const [inviteRole,setInviteRole]=React.useState<'reader'|'contributor'>('contributor'),[inviteUses,setInviteUses]=React.useState(30),[shareText,setShareText]=React.useState('');
  const [localId,setLocalId]=React.useState(''),[publishCategory,setPublishCategory]=React.useState(''),[publishTitle,setPublishTitle]=React.useState(''),[createError,setCreateError]=React.useState('');
  const [editing,setEditing]=React.useState(''),[editError,setEditError]=React.useState('');
  const [removal,setRemoval]=React.useState<{kind:'note'|'member';id:string}|null>(null);
  const [removalError,setRemovalError]=React.useState('');
  const removalRef=React.useRef<HTMLDivElement>(null);
  React.useEffect(()=>{if(removal?.kind==='member'){removalRef.current?.scrollIntoView({block:'nearest'});removalRef.current?.focus({preventScroll:true});}},[removal]);
  const workspace=workspaces.find(item=>item.id===active),owner=!!workspace&&workspace.owner_id===client.current?.userId;
  const canWrite=owner||members.some(member=>member.user_id===client.current?.userId&&member.role==='contributor');
  React.useEffect(()=>setConnectionOpen(!(signedIn&&workspace)),[signedIn,workspace?.id]);
  const contributions=useWorkspaceContributions(client.current,signedIn?active:'');
  const records=contributions.page?.notes||emptyRecords, categories=contributions.page?.categories||emptyCategories;
  const activeCategories=categories.filter(category=>!category.archived);
  const chosenCategory=activeCategories.some(category=>category.name===publishCategory)?publishCategory:activeCategories[0]?.name||'';
  React.useEffect(()=>{onMapNotes?.(records.map(note=>communityNoteTarget(note,categories,workspace?.name)),categories,workspace?.name||'');},[records,categories,workspace?.name,onMapNotes]);
  React.useEffect(()=>()=>onMapNotes?.([],[],''),[onMapNotes]);

  React.useEffect(()=>()=>{generation.current++;client.current?.dispose();client.current=null;},[]);

  /** Each task has a connection generation; disconnected/retired results cannot commit. */
  const run=React.useCallback(async <T,>(work:()=>Promise<T>,done:(value:T)=>void,onFailure?:(message:string)=>void):Promise<void>=>{
    if(running.current)return;
    running.current=true;setBusy(true);setError('');setMessage('');const revision=generation.current;
    try{const result=await work();if(revision===generation.current)done(result);}
    catch(failure){if(revision===generation.current&&(failure as Error)?.name!=='AbortError')(onFailure||setError)((failure as Error)?.message||'Workspace request failed.');}
    finally{if(revision===generation.current){running.current=false;setBusy(false);}}
  },[]);
  function disconnect(){generation.current++;client.current?.dispose();client.current=null;running.current=false;setBusy(false);setConnected(false);setSignedIn(false);setPassword('');setWorkspaces([]);setActive('');setMembers([]);setInvites([]);setShareText('');setError('');setMessage('');setAccepted(false);}
  function connect(){try{if(!accepted)throw new Error('Confirm the service operator before connecting.');client.current?.dispose();client.current=new CommunityWorkspaceClient({endpoint,publicKey});generation.current++;setConnected(true);setError('');}catch(failure){setError((failure as Error).message);}}
  function importInvitation(){try{const parsed=parseWorkspaceInvitation(invitation);setEndpoint(parsed.endpoint);setPublicKey(parsed.publicKey);setJoinCode(parsed.invitation);setAccepted(false);setInvitation('');setError('');}catch(failure){setError((failure as Error).message);}}
  /** Membership controls refresh separately from debounced contribution reads. */
  function loadPage(refresh=true){const api=client.current;if(!api||!active)return;if(refresh)contributions.refresh();void run(async()=>({members:await api.members(active),invites:owner?await api.invites(active):[]}),result=>{setMembers(result.members);setInvites(result.invites);});}
  React.useEffect(()=>{setMembers([]);setInvites([]);setShareText('');setEditing('');setEditError('');setAliasError('');setRemoval(null);setPublishCategory('');setCreateError('');if(signedIn&&active)loadPage(false);},[active,signedIn]);
  const action=(label:string,callback:()=>void,disabled=busy)=><button type="button" style={button} disabled={disabled} onClick={callback}>{text(label)}</button>;
  // Retain the card element tree while typing; large loaded lists must not
  // re-render descriptions/editors for every search-input character.
  const contributionCards=React.useMemo(()=>workspace?records.map(note=><WorkspaceContributionCard key={note.id} note={note} color={categories.find(category=>category.name===note.category)?.color||'#f5a623'}
        busy={busy} own={note.author_id===client.current?.userId} ownerContribution={note.author_id===workspace.owner_id}
        canEdit={owner||canWrite&&note.author_id===client.current?.userId} canRemove={owner||canWrite&&note.author_id===client.current?.userId}
        onShow={()=>onFocus(communityNoteTarget(note,categories,workspace.name))}
        onEdit={()=>{setEditing(note.id);setEditError('');}}
        onRemove={()=>setRemoval({kind:'note',id:note.id})}>
        {editing===note.id&&<WorkspaceContributionEditor key={note.id} note={note} categories={categories} busy={busy} error={editError}
          onCancel={()=>{setEditing('');setEditError('');}}
          onSave={(values,version)=>{const api=client.current!;setEditError('');void run(()=>api.editContribution(active,note.id,values,version),()=>{contributions.refresh();setEditing('');setMessage(text('Contribution updated.'));},setEditError);}} />}

      </WorkspaceContributionCard>):[],[records,categories,busy,owner,canWrite,editing,editError,onFocus,active,workspace,run,contributions.refresh,text]);
  return <section className="mly-notes-scroll mly-workspace-scroll" role="tabpanel" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
    <div style={row}><strong>{text('Collaboration workspace')}</strong>{action('Close',onClose,false)}{connected&&action('Disconnect',disconnect,false)}</div>
    <details open={connectionOpen} onToggle={event=>setConnectionOpen(event.currentTarget.open)} style={sectionStyle}><summary style={summaryStyle}>{text('Connection and workspace settings')}</summary>
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
          <label style={field}>{text('Your display name in the new workspace')}<input aria-label={text('Your display name in the new workspace')} style={input} maxLength={120} value={ownerAlias} autoComplete="off" onChange={event=>setOwnerAlias(event.target.value)} /></label>
          {action('Create workspace',()=>{const api=client.current!;void run(async()=>{const id=await api.create(name,contact,ownerAlias);return{id,list:await api.workspaces()};},result=>{setWorkspaces(result.list);setActive(result.id);setName('');setContact('');setOwnerAlias('');});},busy||!ownerAlias.trim())}</React.Fragment>}
          <label style={field}>{text('Invitation code')}<input style={input} value={joinCode} autoComplete="off" onChange={event=>setJoinCode(event.target.value)} /></label>
          <label style={field}>{text('Your display name when joining')}<input aria-label={text('Your display name when joining')} style={input} maxLength={120} value={joinAlias} autoComplete="off" onChange={event=>setJoinAlias(event.target.value)} /></label>
          <small>{text('Choose an unverified alias for this workspace. Other members will see it with an ID tag, not your email address.')}</small>
          {action('Join workspace',()=>{const api=client.current!;void run(async()=>{const id=await api.join(joinCode.trim(),joinAlias);return{id,list:await api.workspaces()};},result=>{setWorkspaces(result.list);setActive(result.id);setJoinCode('');setJoinAlias('');});},busy||!joinAlias.trim())}
        </details>
      </React.Fragment>}
    </div>}
    </details>
    {signedIn&&workspace&&<React.Fragment>
      <div style={sectionStyle}><div style={{...row,justifyContent:'space-between'}}><h3 style={headingStyle}>{workspace.name}</h3><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span></div>
        <small>{text('Operator contact')}: {workspace.operator_contact}</small>
        <nav aria-label={text('Workspace actions')} style={row}>
          <button type="button" style={button} onClick={()=>goToSection(resultsRef)}>{text('Read contributions')}</button>
          {canWrite&&<button type="button" style={button} onClick={()=>goToSection(createRef)}>{text('Create contribution')}</button>}
          {canWrite&&<button type="button" style={secondary} onClick={()=>goToSection(publishRef)}>{text('Publish a local draft')}</button>}
          {owner&&<button type="button" style={secondary} onClick={()=>goToSection(categoriesRef)}>{text('Edit categories')}</button>}
          {action('Refresh notes',()=>loadPage())}
        </nav>
      </div>
      {contributions.page&&client.current?.userId&&<WorkspaceDisplayNameEditor key={'profile:'+active} value={contributions.page.my_display_name} userId={client.current.userId} busy={busy} error={aliasError}
        onSave={(value,onSaved)=>{const api=client.current!;setAliasError('');void run(async()=>{await api.setDisplayName(active,value);return api.members(active);},members=>{setMembers(members);contributions.refresh();setMessage(text('Workspace display name saved.'));onSaved();},setAliasError);}} />}
      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}
        query={contributions.query} mine={contributions.mine} busy={contributions.busy} waiting={contributions.waiting} onComposition={contributions.setComposing} onSubmit={contributions.submitSearch} onClear={contributions.clearSearch} onQuery={contributions.setQuery} onMine={contributions.setMine} />
      {contributions.error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}
      {owner&&<WorkspaceCategoryEditor key={'categories:'+active} sectionRef={categoriesRef} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>{contributions.refresh();setMessage(text('Workspace category saved.'));});}} />}
      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}
      {canWrite&&<WorkspaceContributionDraft key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}
        onPublish={(values,onSaved)=>{const api=client.current!;setCreateError('');void run(()=>api.createContribution(active,values),created=>{contributions.clearSearch();contributions.refresh();setMessage(text(created?'Contribution published.':'This draft was already published; no duplicate was created.'));onSaved();goToSection(resultsRef);},setCreateError);}} />}
      {canWrite&&<details ref={publishRef} style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Publish a local note')}</summary>
        <div style={{display:'grid',gap:12,minWidth:0,paddingTop:8}}>
        <p style={{margin:0}}>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>
        <LocalNotePicker notes={notes} value={localId} onSelect={id=>{setLocalId(id);setPublishTitle(notes.find(note=>note.id===id)?.title||'');}} onPreview={onFocus} />
        <label style={field}>{text('Title for selected local note')}<input aria-label={text('Title for selected local note')} style={input} maxLength={160} value={publishTitle} onChange={event=>setPublishTitle(event.target.value)} /></label>
        <label style={field}>{text('Contribution category')}<select aria-label={text('Contribution category')} style={input} value={chosenCategory} onChange={event=>setPublishCategory(event.target.value)}>{!chosenCategory&&<option value="">{text('No active categories')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>
        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,title:publishTitle.trim(),category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!publishTitle.trim()||!chosenCategory||!notes.some(note=>note.id===localId))}
        </div>
      </details>}
      {owner&&<details style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>
        {/* Give disclosure content an explicit inner layout and logical indentation. */}
        <div style={{display:'grid',gap:16,minWidth:0,paddingTop:10,paddingInlineStart:8,borderInlineStart:'2px solid #496052'}}>
          <div style={{...card,gap:12}}>
            <strong>{text('Create invitation')}</strong>
            <div style={{display:'grid',gap:12,minWidth:0,gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 220px), 1fr))'}}>
              <label style={field}>{text('Invitation role')}<select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value="contributor">{text('Contributor')}</option><option value="reader">{text('Reader')}</option></select></label>
              <label style={field}>{text('Maximum joins')}<input style={input} type="number" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></label>
            </div>
            {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}
            {shareText&&<label style={{...field,gap:6}}>{text('Share these invitation details')}<textarea aria-label={text('Share these invitation details')} style={{...input,minHeight:96,resize:'vertical',fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',fontSize:11,lineHeight:1.5}} readOnly value={shareText} onFocus={event=>event.currentTarget.select()} /></label>}
          </div>
          <div style={row}>{action('Refresh members and invitations',()=>loadPage())}</div>
          {!!invites.length&&<div style={{display:'grid',gap:8,minWidth:0}}>
            <strong>{text('Invitations')}</strong>
            {invites.map(item=><div key={item.id} style={{...card,gap:10}}>
              <span>{item.role} · {item.uses}/{item.max_uses} · {item.expires_at}</span>
              <div style={row}>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>
            </div>)}
          </div>}
          {!!members.length&&<div style={{display:'grid',gap:8,minWidth:0}}>
            <strong>{text('Members')}</strong>
            {members.map(member=><div key={member.user_id} style={{...card,gap:10}}>
              <div style={{...row,justifyContent:'space-between'}}><bdi style={{fontWeight:600,overflowWrap:'anywhere'}}>{formatWorkspaceContributor(member.user_id,member.display_name,text('Contributor'))}</bdi><span>{text(member.role==='reader'?'Reader':'Contributor')}</span></div>
              <details><summary>{text('Contributor ID')}</summary><code dir="ltr" style={{overflowWrap:'anywhere'}}>{member.user_id}</code></details>
              <div style={{...row,gap:8}}>
                {action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}
                {action('Remove member',()=>{setRemovalError('');setRemoval({kind:'member',id:member.user_id});})}
              </div>
              {removal?.kind==='member'&&removal.id===member.user_id&&<div ref={removalRef} tabIndex={-1} role="group" aria-label={text('Confirm member removal')} style={{...card,borderColor:'#b38270'}}>
                <strong>{text('Remove workspace access for')}: {formatWorkspaceContributor(member.user_id,member.display_name,text('Contributor'))}</strong>
                <span>{text('Existing contributions and their authorship will remain. Revoke active invitations if this person must not rejoin.')}</span>
                <div style={row}>{action('Confirm removal',()=>{const api=client.current!;setRemovalError('');void run(async()=>{await api.removeMember(active,member.user_id);return api.members(active);},members=>{setMembers(members);contributions.refresh();setRemoval(null);setMessage(text('Member access removed. Existing contributions were retained.'));},setRemovalError);})}{action('Cancel removal',()=>{setRemoval(null);setRemovalError('');})}</div>
                {removalError&&<div role="alert" style={{color:'#ffb8a6'}}>{text(removalError)}</div>}
              </div>}

            </div>)}
          </div>}
        </div>
      </details>}

      <div ref={resultsRef} tabIndex={-1} role="region" aria-label={text('Loaded contributions')} style={row}><h3 style={headingStyle}>{text('Loaded contributions')} ({records.length})</h3>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',title:note.title||'',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,authorDisplayName:note.author_display_name||null,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>
      {contributionCards}
      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}
      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}
    </React.Fragment>}
    {removal?.kind==='note'&&<div role="group" aria-label={text('Confirm removal')} style={card}><span>{text('Remove this shared note from the operator’s service?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{await api.removeNote(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}
    {busy&&<span role="status">{text('Working with the selected workspace…')}</span>}
    {error&&<div role="alert" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(error)}</div>}
    {message&&<div role="status">{message}</div>}
  </section>;
};
