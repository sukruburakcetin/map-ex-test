/** @jsx jsx */
import { WorkspaceFieldHelp } from "./WorkspaceFieldHelp";
import type { DetectionPreviewLoader } from '../detections/detectionPreview';
import type { ExternalContributionSeed } from '../places/placeNote';
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
import { sortNotes, type NoteSort } from '../field-notes/noteSort';
import { NotesSortControl } from '../field-notes/NotesSortControl';
import { useWorkspaceContributions } from './useWorkspaceContributions';
import { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation, formatWorkspaceContributor } from './communityWorkspace';
import type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';
import { workspaceReadabilityCss, workspaceConnectStyle, workspaceConnectPrimaryStyle, workspaceManualFieldsStyle, workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceHeadingStyle as headingStyle, workspaceSecondaryButtonStyle as secondary, workspaceDangerButtonStyle as danger } from '../../styles/communityWorkspace';

interface Props {onDetectionDraftLocation?:(requestId:string,point:{lon:number;lat:number})=>void;onDetectionDraftFinished?:(requestId:string)=>void; onLoadDetectionPreview?:DetectionPreviewLoader; detectionDraft?:ExternalContributionSeed|null;onClearDetectionDraft?:(applied?:boolean)=>void; onPickLocation?:WorkspaceLocationRequest;currentImageId?:string|null;notes: readonly FieldNote[]; onFocus(note: FieldNote): void;
  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }
const emptyRecords: CommunityRecord[] = [], emptyCategories: WorkspaceCategory[] = [];

/** Open guidance in the sheet flow so it stays reachable at narrow widths. */
function WorkspaceHelpHeading({title,label,children,actions}: {
  title: string; label: string; children: React.ReactNode; actions?: React.ReactNode;
}) {
  const [open,setOpen]=React.useState(false);
  const id=React.useId();
  return <div className="mly-workspace-help-heading">
    <div className="mly-workspace-help-title">
      <h3 style={headingStyle}>{title}</h3>
      <button className="mly-text-action mly-workspace-help-toggle" type="button"
        aria-label={label} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}><span aria-hidden="true">?</span></button>
      {actions && <span className="mly-workspace-help-actions">{actions}</span>}
    </div>
    <div id={id} className="mly-workspace-help-body" hidden={!open}>{children}</div>
  </div>;
}

/** Operator-owned collaboration, lazy-mounted for the Workspace source. Credentials
 * live in this mount only. No local note leaves the browser without Publish.
 * All database rights are verified by the operator's RLS, never by button visibility.
 */
export const CommunityWorkspacePanel: React.FC<Props> = ({notes,onFocus,onMapNotes,onPickLocation,currentImageId,detectionDraft,onClearDetectionDraft,onLoadDetectionPreview,onDetectionDraftFinished,onDetectionDraftLocation}) => {
  const { owned: text, formatLocale } = useWidgetLocale();
  const [sort, setSort] = React.useState<NoteSort>('date-desc');
  const [connectionOpen,setConnectionOpen]=React.useState(true);
  const manageRef=React.useRef<HTMLDetailsElement>(null);
  const [deleteConfirmation,setDeleteConfirmation]=React.useState<{id:string;name:string}|null>(null);
  const [deleteName,setDeleteName]=React.useState('');
  const [setupMode,setSetupMode]=React.useState<'create'|'join'|undefined>();
  const [manualOpen,setManualOpen]=React.useState(false);
  const [invitationReady,setInvitationReady]=React.useState(false);
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
  const sortedRecords=React.useMemo(()=>sortNotes(records,sort,formatLocale,note=>({name:note.title?.trim()||note.category,date:note.created_at,status:note.status})),[records,sort,formatLocale]);
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
  function disconnect(){generation.current++;client.current?.dispose();client.current=null;running.current=false;setBusy(false);setConnected(false);setSignedIn(false);setPassword('');setWorkspaces([]);setActive('');setMembers([]);setInvites([]);setShareText('');setError('');setMessage('');setAccepted(false);setInvitationReady(false);setManualOpen(false);setJoinCode('');setSetupMode(undefined);setDeleteConfirmation(null);setDeleteName('');}
  function connect(){try{if(!accepted)throw new Error('Confirm the service operator before connecting.');client.current?.dispose();client.current=new CommunityWorkspaceClient({endpoint,publicKey});generation.current++;setConnected(true);setError('');}catch(failure){setError((failure as Error).message);}}
  function importInvitation(){try{const parsed=parseWorkspaceInvitation(invitation);setEndpoint(parsed.endpoint);setPublicKey(parsed.publicKey);setJoinCode(parsed.invitation);setAccepted(false);setInvitation('');setError('');setManualOpen(false);setInvitationReady(true);}catch(failure){setError((failure as Error).message);}}
  /** Membership controls refresh separately from debounced contribution reads. */
  function loadPage(refresh=true){const api=client.current;if(!api||!active)return;if(refresh)contributions.refresh();void run(async()=>({members:await api.members(active),invites:owner?await api.invites(active):[]}),result=>{setMembers(result.members);setInvites(result.invites);});}
  React.useEffect(()=>{setMembers([]);setInvites([]);setShareText('');setEditing('');setEditError('');setAliasError('');setRemoval(null);setDeleteConfirmation(null);setDeleteName('');setPublishCategory('');setCreateError('');if(signedIn&&active)loadPage(false);},[active,signedIn]);
  const action=(label:string,callback:()=>void,disabled=busy)=><button className="mly-text-action" type="button" style={button} disabled={disabled} onClick={callback}>{text(label)}</button>;
  const canCreate = client.current?.canCreateWorkspace === true;
  const creatingWorkspace = canCreate && (setupMode ?? (joinCode ? 'join' : 'create')) === 'create';

  function signIn() {
    const api=client.current;
    if (!api || busy || !email.trim() || !password) return;
    const secret=password;
    setPassword('');
    void run(async()=>{
      await api.signIn(email,secret);
      return api.workspaces();
    },list=>{
      setSignedIn(true);setSetupMode(undefined);setWorkspaces(list);setActive(list[0]?.id||'');
    });
  }

  function submitWorkspace() {
    const api=client.current;
    if (!api || busy) return;
    const ready = creatingWorkspace ? name.trim() && contact.trim() && ownerAlias.trim() : joinCode.trim() && joinAlias.trim();
    if (!ready) return;
    void run(async()=>{
      const id=creatingWorkspace ? await api.create(name,contact,ownerAlias) : await api.join(joinCode.trim(),joinAlias);
      return {id,list:await api.workspaces()};
    },({id,list})=>{
      setWorkspaces(list);setActive(id);
      if (creatingWorkspace) {setName('');setContact('');setOwnerAlias('');}
      else {setJoinCode('');setJoinAlias('');}
    });
  }
  function deleteWorkspace() {
    const api=client.current, target=deleteConfirmation;
    if (!api || busy || !owner || !workspace || target?.id !== workspace.id ||
        target.name !== workspace.name || deleteName !== target.name) return;
    void run(()=>api.deleteWorkspace(target.id,target.name),()=>{
      const remaining=workspaces.filter(item=>item.id!==target.id);
      setWorkspaces(remaining);setActive(remaining[0]?.id||'');
      setDeleteConfirmation(null);setDeleteName('');
      setMessage(text('Workspace deleted.'));
    });
  }
  // Retain the card element tree while typing; large loaded lists must not
  // re-render descriptions/editors for every search-input character.
  const contributionCards=React.useMemo(()=>workspace?sortedRecords.map(note=><WorkspaceContributionCard onLoadDetectionAttachment={(id,signal)=>client.current!.noteImage(note.id,id,signal)} onLoadDetectionPreview={onLoadDetectionPreview} key={note.id} note={note} color={categories.find(category=>category.name===note.category)?.color||'#f5a623'}
        busy={busy} own={note.author_id===client.current?.userId} ownerContribution={note.author_id===workspace.owner_id}
        canEdit={owner||canWrite&&note.author_id===client.current?.userId} canRemove={owner||canWrite&&note.author_id===client.current?.userId}
        onShow={()=>onFocus(communityNoteTarget(note,categories,workspace.name))}
        onEdit={()=>{setEditing(note.id);setEditError('');}}
        onRemove={()=>setRemoval({kind:'note',id:note.id})}>
        {editing===note.id&&<WorkspaceContributionEditor key={note.id} note={note} categories={categories} busy={busy} error={editError}
          onCancel={()=>{setEditing('');setEditError('');}}
          onSave={(values,version)=>{const api=client.current!;setEditError('');void run(()=>api.editContribution(active,note.id,values,version),()=>{contributions.refresh();setEditing('');setMessage(text('Contribution updated.'));},setEditError);}} />}

      </WorkspaceContributionCard>):[],[sortedRecords,categories,busy,owner,canWrite,editing,editError,onFocus,active,workspace,run,contributions.refresh,text,onLoadDetectionPreview]);
  return <section className="mly-notes-scroll mly-workspace-scroll" role="tabpanel" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
    <style>{workspaceReadabilityCss}</style>
    {detectionDraft&&!canWrite&&<div role="status" style={card}><strong>{detectionDraft.title}</strong><span>{text('Note draft ready. Connect, sign in and choose a workspace where you can contribute.')}</span>{action('Discard incoming draft',()=>onClearDetectionDraft?.(),false)}</div>}
    {!connected ? <section style={workspaceConnectStyle} aria-label={text('Join a workspace')}>
      <WorkspaceHelpHeading title={text('Join a workspace')} label={text('Workspace setup guide')}>
        <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>
        <ol>
          <li>{text('Paste an invitation from your workspace operator. If you manage the service, use Connect manually.')}</li>
          <li>{text('Verify the data destination and sign in with the account created for you in that project.')}</li>
          <li>{text('Join with your invitation code or create a workspace if your account has permission.')}</li>
        </ol>
      </WorkspaceHelpHeading>
      {!invitationReady && <React.Fragment>
        <WorkspaceFieldHelp label={text('Invitation details')} help={text("Paste the full invitation JSON sent by the workspace owner. It fills in the project URL, public key, and join code.")}>
          <textarea rows={3} maxLength={12000} aria-label={text('Invitation details')} style={input} value={invitation}
            onChange={event=>setInvitation(event.target.value)} />
        </WorkspaceFieldHelp>
        <button type="button" className="mly-text-action mly-workspace-connect-primary" style={workspaceConnectPrimaryStyle}
          disabled={!invitation.trim() || busy} onClick={importInvitation}>{text('Use invitation details')}</button>
      </React.Fragment>}
      <details open={manualOpen} onToggle={event=>setManualOpen(event.currentTarget.open)}>
        <summary style={summaryStyle}>{text('Connect manually')}</summary>
        <div style={workspaceManualFieldsStyle}>
          <WorkspaceFieldHelp label={text('Project URL')} help={text("Copy the HTTPS Project URL from the Supabase project that hosts your workspace. Use the base origin without a path.")}><input style={input} type="url" value={endpoint} placeholder="https://your-project.supabase.co"
            onChange={event=>{setEndpoint(event.target.value);setAccepted(false);setInvitationReady(false);setJoinCode('');}} /></WorkspaceFieldHelp>
          <WorkspaceFieldHelp label={text('Public publishable or anon key')} help={text("Copy the publishable key or legacy anon key from that project’s API Keys page. Never paste a secret or service-role key.")}><input style={input} value={publicKey} autoComplete="off"
            onChange={event=>{setPublicKey(event.target.value);setAccepted(false);setInvitationReady(false);setJoinCode('');}} /></WorkspaceFieldHelp>
        </div>
      </details>
      {(invitationReady || manualOpen) && <React.Fragment>
        {invitationReady && <React.Fragment>
          <div role="status" style={{overflowWrap:'anywhere'}}>{text('Data destination')}: <strong>{endpoint}</strong></div>
          <button type="button" className="mly-text-action" style={secondary} onClick={()=>{
            setInvitationReady(false);setAccepted(false);setEndpoint('');setPublicKey('');setJoinCode('');
          }}>{text('Use a different invitation')}</button>
        </React.Fragment>}
        <WorkspaceFieldHelp label={text('I recognize this operator and choose to use its service.')}
          help={text('Check the project URL against the information supplied by your operator. Connect enables sign-in to that service.')}>
          <input type="checkbox" checked={accepted} onChange={event=>setAccepted(event.target.checked)} />
        </WorkspaceFieldHelp>
        <button type="button" className="mly-text-action mly-workspace-connect-primary" style={workspaceConnectPrimaryStyle}
          disabled={busy || !accepted || !endpoint.trim() || !publicKey.trim()} onClick={connect}>{text('Connect')}</button>
      </React.Fragment>}
    </section> : !signedIn ? <section style={workspaceConnectStyle} aria-label={text('Sign in to workspace')}>
      <WorkspaceHelpHeading title={text('Sign in to workspace')} label={text('Sign-in help')}
        actions={action('Disconnect',disconnect,false)}>
        <p>{text('Use an account supplied by the workspace operator. No Esri Enterprise account is required.')}</p>
      </WorkspaceHelpHeading>
      <span style={{overflowWrap:'anywhere'}}>{text('Data destination')}: {client.current?.connection.endpoint}</span>
      <form style={workspaceManualFieldsStyle} onSubmit={event=>{event.preventDefault();signIn();}}>
        <WorkspaceFieldHelp label={text('Email')} help={text("Use the email created for you under Authentication → Users in the project shown as Data destination.")}><input style={input} type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} /></WorkspaceFieldHelp>
        <WorkspaceFieldHelp label={text('Password')} help={text("Enter the password for that workspace service account. Ask the operator for help if you need to reset it.")}><input style={input} type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} /></WorkspaceFieldHelp>
        <button className="mly-text-action mly-workspace-connect-primary" type="submit" style={workspaceConnectPrimaryStyle} disabled={busy||!email.trim()||!password}>{text('Sign in')}</button>
      </form>
    </section> : <React.Fragment>
      <div className="mly-workspace-section" style={sectionStyle}>
        <WorkspaceHelpHeading title={text('Collaboration workspace')} label={text('Workspace picker help')}>
          <p>{text('Choose a workspace to see its shared notes. Use Refresh workspaces after a membership change.')}</p>
        </WorkspaceHelpHeading>
        {workspaces.length > 0 && <WorkspaceFieldHelp label={text('Workspace')} help={text("Choose which workspace to view. This changes the shared notes and actions shown below.")}>
          <select aria-label={text('Workspace')} style={input} disabled={busy} value={active} onChange={event=>setActive(event.target.value)}>
            <option value="">{text('Choose a workspace')}</option>
            {workspaces.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </WorkspaceFieldHelp>}
        {action('Refresh workspaces',()=>{const api=client.current!;void run(()=>api.workspaces(),list=>{setWorkspaces(list);if(!list.some(item=>item.id===active))setActive(list[0]?.id||'');});})}
        <details>
          <summary style={summaryStyle}>{text('Connection settings')}</summary>
          <div style={workspaceManualFieldsStyle}>
            <span style={{overflowWrap:'anywhere'}}>{text('Data destination')}: {client.current?.connection.endpoint}</span>
            <WorkspaceHelpHeading title={text('Service connection')} label={text('Connection settings help')}
              actions={action('Disconnect',disconnect,false)}>
              <p>{text('Data destination is the project that stores shared workspace notes. Disconnect signs out of this widget session and leaves saved notes in the service.')}</p>
            </WorkspaceHelpHeading>
          </div>
        </details>
      </div>
      <details open={!workspace || connectionOpen} onToggle={event=>setConnectionOpen(event.currentTarget.open)}
        className="mly-workspace-section" style={sectionStyle}>
        <summary style={summaryStyle}>{text('Create or join a workspace')}</summary>
        <section style={workspaceManualFieldsStyle} aria-label={text('Workspace setup')}>
          <WorkspaceHelpHeading title={text('Workspace setup')} label={text('Create or join help')}>
            {creatingWorkspace && <p>{text('Enter an email or other contact that workspace members can use to reach you.')}</p>}
            <p>{text('Choose an unverified alias for this workspace. Other members will see it with an ID tag, not your email address.')}</p>
          </WorkspaceHelpHeading>
          {canCreate && <div role="group" aria-label={text('Workspace setup')} style={row}>
            <button type="button" className="mly-text-action mly-workspace-setup-choice" style={secondary} disabled={busy}
              aria-pressed={creatingWorkspace} onClick={()=>setSetupMode('create')}>{text('Create a workspace')}</button>
            <button type="button" className="mly-text-action mly-workspace-setup-choice" style={secondary} disabled={busy}
              aria-pressed={!creatingWorkspace} onClick={()=>setSetupMode('join')}>{text('Join with an invitation')}</button>
          </div>}
          {!canCreate && <h3 style={headingStyle}>{text('Join with an invitation')}</h3>}
          <form style={workspaceManualFieldsStyle} onSubmit={event=>{event.preventDefault();submitWorkspace();}}>
            {creatingWorkspace ? <React.Fragment>
              <WorkspaceFieldHelp label={text('Workspace name')} help={text("Enter a name that members will recognize, such as Road Survey Test.")}><input style={input} required maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></WorkspaceFieldHelp>
              <WorkspaceFieldHelp label={text('Operator contact')} help={text("Enter the email address or other contact members should use to reach the workspace operator. Members can see it.")}><input style={input} required maxLength={300} value={contact} onChange={event=>setContact(event.target.value)} /></WorkspaceFieldHelp>
              <WorkspaceFieldHelp label={text('Your display name in the new workspace')} help={text("Choose how members will see your name. This display name is specific to the workspace.")}><input style={input} required maxLength={60} value={ownerAlias} autoComplete="off" onChange={event=>setOwnerAlias(event.target.value)} /></WorkspaceFieldHelp>
            </React.Fragment> : <React.Fragment>
              <WorkspaceFieldHelp label={text('Invitation code')} help={text("Paste the join code supplied by the owner. Using full invitation details on the connection screen fills this in automatically.")}><input style={input} required value={joinCode} autoComplete="off" onChange={event=>setJoinCode(event.target.value)} /></WorkspaceFieldHelp>
              <WorkspaceFieldHelp label={text('Your display name when joining')} help={text("Enter the name this workspace’s members will see beside your contributions.")}><input style={input} required maxLength={60} value={joinAlias} autoComplete="off" onChange={event=>setJoinAlias(event.target.value)} /></WorkspaceFieldHelp>
            </React.Fragment>}
            <button type="submit" className="mly-text-action mly-workspace-connect-primary" style={workspaceConnectPrimaryStyle}
              disabled={busy || (creatingWorkspace ? !name.trim() || !contact.trim() || !ownerAlias.trim() : !joinCode.trim() || !joinAlias.trim())}>
              {text(creatingWorkspace?'Create workspace':'Join workspace')}
            </button>
          </form>
        </section>
      </details>
    </React.Fragment>}
    {signedIn&&workspace&&<React.Fragment>
      <div className="mly-workspace-section" style={sectionStyle}><div style={{...row,justifyContent:'space-between'}}><WorkspaceHelpHeading title={workspace.name} label={text('Workspace actions help')}>
          <p>{text('Read shared observations, add a contribution, or publish an existing local draft. The actions available depend on your role.')}</p>
        </WorkspaceHelpHeading><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span></div>
        <small>{text('Operator contact')}: {workspace.operator_contact}</small>
        <nav aria-label={text('Workspace actions')} style={row}>
          <button className="mly-text-action" type="button" style={button} onClick={()=>goToSection(resultsRef)}>{text('Read contributions')}</button>
          {canWrite&&<button className="mly-text-action" type="button" style={button} onClick={()=>goToSection(createRef)}>{text('Create contribution')}</button>}
          {canWrite&&<button className="mly-text-action" type="button" style={secondary} onClick={()=>goToSection(publishRef)}>{text('Publish a local draft')}</button>}
          {owner&&<button className="mly-text-action" type="button" style={secondary} onClick={()=>goToSection(categoriesRef)}>{text('Edit categories')}</button>}
          {owner&&<button className="mly-text-action" type="button" style={secondary} onClick={()=>goToSection(manageRef)}>{text('Manage workspace')}</button>}
          {action('Refresh notes',()=>loadPage())}
        </nav>
      </div>
      {contributions.page&&client.current?.userId&&<WorkspaceDisplayNameEditor key={'profile:'+active} value={contributions.page.my_display_name} userId={client.current.userId} busy={busy} error={aliasError}
        onSave={(value,onSaved)=>{const api=client.current!;setAliasError('');void run(async()=>{await api.setDisplayName(active,value);return api.members(active);},members=>{setMembers(members);contributions.refresh();setMessage(text('Workspace display name saved.'));onSaved();},setAliasError);}} />}
      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}
        query={contributions.query} mine={contributions.mine} busy={contributions.busy} waiting={contributions.waiting} onComposition={contributions.setComposing} onSubmit={contributions.submitSearch} onClear={contributions.clearSearch} onQuery={contributions.setQuery} onMine={contributions.setMine} />
      {contributions.error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}
      <div ref={resultsRef} tabIndex={-1} role="region" aria-label={text('Loaded contributions')} aria-busy={contributions.busy} style={{display:'grid',gap:10,minWidth:0,scrollMarginTop:10}}><div style={{...row,justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #567363'}}><WorkspaceHelpHeading title={text('Search results')} label={text('Search and export help')}>
          <p>{text('Use search and sorting to find contributions. Export loaded notes saves the records currently loaded in this view.')}</p>
        </WorkspaceHelpHeading>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',title:note.title||'',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,authorDisplayName:note.author_display_name||null,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>
      {!contributions.busy&&contributions.page&&<p style={{margin:0,color:'#d3e2d9'}}>{text('Showing')} {records.length} {text('of')} {contributions.page.statistics.matching} {text('matching contributions')}{contributions.query.trim()?` · “${contributions.query.trim()}”`:''}{contributions.mine?` · ${text('Only my contributions')}`:''}</p>}
      {contributions.busy&&<p role="status" style={{margin:0}}>{text(contributions.waiting?'Waiting for you to finish typing…':'Updating results…')}{records.length>0&&' '+text('Previous results remain visible until the search finishes.')}</p>}
      <NotesSortControl value={sort} onChange={setSort} loadedOnly />
      {contributionCards}
      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}
      {!contributions.busy&&!contributions.error&&!records.length&&<div style={{...card,padding:16}}><strong>{text('No contributions match the current filters.')}</strong><span>{text('Try a different search or turn off Only my contributions.')}</span>{(contributions.query||contributions.mine)&&<button className="mly-text-action" type="button" style={secondary} onClick={()=>{contributions.clearSearch();contributions.setMine(false);}}>{text('Show all contributions')}</button>}</div>}
      </div>
      {owner&&<WorkspaceCategoryEditor key={'categories:'+active} sectionRef={categoriesRef} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>{contributions.refresh();setMessage(text('Workspace category saved.'));});}} />}
      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}
      {canWrite&&<WorkspaceContributionDraft onDetectionDraftLocation={onDetectionDraftLocation} onDetectionDraftFinished={onDetectionDraftFinished} detectionDraft={detectionDraft} onClearDetectionDraft={onClearDetectionDraft} key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}
        onPublish={(values,onSaved)=>{const api=client.current!;setCreateError('');void run(()=>api.createContribution(active,values),created=>{contributions.clearSearch();contributions.refresh();setMessage(text(created?'Contribution published.':'This draft was already published; no duplicate was created.'));onSaved();goToSection(resultsRef);},setCreateError);}} />}
      {canWrite&&<details ref={publishRef} className="mly-workspace-section" style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Publish a local note')}</summary>
        <div style={{display:'grid',gap:12,minWidth:0,paddingTop:8}}>
        <p style={{margin:0}}>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>
        <WorkspaceHelpHeading title={text('Share an existing note')} label={text('Publish a local note help')}>
          <p>{text('Select one local note, give the shared copy a title and category, then publish it. Your local copy stays in Local notes.')}</p>
        </WorkspaceHelpHeading>
        <LocalNotePicker notes={notes} value={localId} onSelect={id=>{setLocalId(id);setPublishTitle(notes.find(note=>note.id===id)?.title||'');}} onPreview={onFocus} />
        <WorkspaceFieldHelp label={text('Title for selected local note')} help={text("Give the shared contribution a short title. This leaves your original local note unchanged.")}><input aria-label={text('Title for selected local note')} style={input} maxLength={160} value={publishTitle} onChange={event=>setPublishTitle(event.target.value)} /></WorkspaceFieldHelp>
        <WorkspaceFieldHelp label={text('Contribution category')} help={text("Choose an active workspace category for the note you are publishing.")}><select aria-label={text('Contribution category')} style={input} value={chosenCategory} onChange={event=>setPublishCategory(event.target.value)}>{!chosenCategory&&<option value="">{text('No active categories')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></WorkspaceFieldHelp>
        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,title:publishTitle.trim(),category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!publishTitle.trim()||!chosenCategory||!notes.some(note=>note.id===localId))}
        </div>
      </details>}
      {owner&&<details className="mly-workspace-section" style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>
        <WorkspaceHelpHeading title={text('Member access')} label={text('Invitations and members help')}>
          <p>{text('Invite readers to view notes or contributors to add their own. Invitations expire after seven days and can be revoked here.')}</p>
          <p>{text('Refresh members and invitations to see changes. Making a member read-only keeps their access to existing notes. Removing a member ends their workspace access.')}</p>
        </WorkspaceHelpHeading>
        {/* Give disclosure content an explicit inner layout and logical indentation. */}
        <div style={{display:'grid',gap:16,minWidth:0,paddingTop:10,paddingInlineStart:8,borderInlineStart:'2px solid #496052'}}>
          <div style={{...card,gap:12}}>
            <strong>{text('Create invitation')}</strong>
            <div style={{display:'grid',gap:12,minWidth:0,gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 220px), 1fr))'}}>
              <WorkspaceFieldHelp label={text('Invitation role')} help={text("A Reader can view shared notes. A Contributor can also add and edit their own contributions.")}><select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value="contributor">{text('Contributor')}</option><option value="reader">{text('Reader')}</option></select></WorkspaceFieldHelp>
              <WorkspaceFieldHelp label={text('Maximum joins')} help={text("Set how many times this invitation can be redeemed. It also expires after seven days.")}><input style={input} type="number" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></WorkspaceFieldHelp>
            </div>
            {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}
            {shareText&&<WorkspaceFieldHelp label={text('Share these invitation details')} help={text("Copy the entire block to the person you want to invite. They still need their own service account.")}><textarea aria-label={text('Share these invitation details')} style={{...input,minHeight:96,resize:'vertical',fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',fontSize:11,lineHeight:1.5}} readOnly value={shareText} onFocus={event=>event.currentTarget.select()} /></WorkspaceFieldHelp>}
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


      {owner&&<details ref={manageRef} className="mly-workspace-section" style={sectionStyle}>
        <summary style={summaryStyle}>{text('Workspace management')}</summary>
        <WorkspaceHelpHeading title={text('Delete a workspace')} label={text('Workspace deletion help')}>
          <p>{text('Only the owner can delete a workspace. Use Export loaded notes first if you need a copy of the visible contributions.')}</p>
        </WorkspaceHelpHeading>
        <p>{text('Deleting this workspace permanently removes its shared notes, attachments, members, and invitations. Local notes and user accounts remain.')}</p>
        {deleteConfirmation?.id !== workspace.id ? <button type="button" className="mly-text-action" style={danger} disabled={busy}
          onClick={()=>{setDeleteName('');setDeleteConfirmation({id:workspace.id,name:workspace.name});}}>{text('Delete workspace')}</button> :
          <form style={workspaceManualFieldsStyle} onSubmit={event=>{event.preventDefault();deleteWorkspace();}}>
            <WorkspaceFieldHelp label={text('Type the workspace name to confirm deletion')} help={text("Enter the name exactly as shown to confirm the selected workspace. This check prevents deleting the wrong workspace.")}>
              <strong dir="auto">{workspace.name}</strong>
              <input style={input} autoComplete="off" value={deleteName} onChange={event=>setDeleteName(event.target.value)} />
            </WorkspaceFieldHelp>
            <div style={row}>
              <button type="button" className="mly-text-action" style={secondary} disabled={busy}
                onClick={()=>{setDeleteConfirmation(null);setDeleteName('');}}>{text('Cancel')}</button>
              <button type="submit" className="mly-text-action" style={danger}
                disabled={busy || deleteName !== workspace.name || deleteConfirmation.name !== workspace.name}>{text('Permanently delete workspace')}</button>
            </div>
          </form>}
      </details>}
    </React.Fragment>}
    {removal?.kind==='note'&&<div role="group" aria-label={text('Confirm removal')} style={card}><span>{text('Remove this shared note from the operator’s service?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{await api.removeNote(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}
    {busy&&<span role="status">{text('Working with the selected workspace…')}</span>}
    {error&&<div role="alert" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(error)}</div>}
    {message&&<div role="status">{message}</div>}
  </section>;
};
