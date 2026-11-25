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
import type { SharedComparison } from '../imagery/timeTravelPreview';
import { WorkspaceContributionCard } from './WorkspaceContributionCard';
import { WorkspaceCategoryEditor } from './WorkspaceCategoryEditor';
import { WorkspaceContributionTools } from './WorkspaceContributionTools';
import { sortNotes, type NoteSort } from '../field-notes/noteSort';
import { NotesSortControl } from '../field-notes/NotesSortControl';
import { useWorkspaceContributions } from './useWorkspaceContributions';
import { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation, formatWorkspaceContributor } from './communityWorkspace';
import type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';
import { workspaceReadabilityCss, workspaceConnectStyle, workspaceConnectPrimaryStyle, workspaceManualFieldsStyle, workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceHeadingStyle as headingStyle, workspaceSecondaryButtonStyle as secondary, workspaceDangerButtonStyle as danger } from '../../styles/communityWorkspace';

interface Props {onOpenLinkedImage?:(note:FieldNote)=>void;onOpenComparison?:(comparison:SharedComparison,href?:string)=>void;onDetectionDraftLocation?:(requestId:string,point:{lon:number;lat:number})=>void;onDetectionDraftFinished?:(requestId:string)=>void; onLoadDetectionPreview?:DetectionPreviewLoader; detectionDraft?:ExternalContributionSeed|null;onClearDetectionDraft?:(applied?:boolean)=>void; onPickLocation?:WorkspaceLocationRequest;currentImageId?:string|null;notes: readonly FieldNote[]; onFocus(note: FieldNote): void;
  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }
const workspaceViews = ['notes','members','settings'] as const;
type WorkspaceView = typeof workspaceViews[number];
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
export const CommunityWorkspacePanel: React.FC<Props> = ({notes,onFocus,onOpenLinkedImage,onMapNotes,onOpenComparison,onPickLocation,currentImageId,detectionDraft,onClearDetectionDraft,onLoadDetectionPreview,onDetectionDraftFinished,onDetectionDraftLocation}) => {
  const { owned: text, formatLocale } = useWidgetLocale();
  const [sort, setSort] = React.useState<NoteSort>('date-desc');
  const workspaceTabId=React.useId();
  const composerHeading=React.useRef<HTMLHeadingElement>(null);
  const [workspaceView,setWorkspaceView]=React.useState<WorkspaceView>('notes');
  const [composer,setComposer]=React.useState<'new'|'local'|null>(null);
  const [connectionOpen,setConnectionOpen]=React.useState(true);
  const manageRef=React.useRef<HTMLDetailsElement>(null);
  const [deleteConfirmation,setDeleteConfirmation]=React.useState<{id:string;name:string}|null>(null);
  const [deleteName,setDeleteName]=React.useState('');
  const setupChoiceName=React.useId();
  const [setupMode,setSetupMode]=React.useState<'create'|'join'|undefined>();
  const [manualOpen,setManualOpen]=React.useState(false);
  const [invitationReady,setInvitationReady]=React.useState(false);
  const [setupError,setSetupError]=React.useState('');
  const [savedSource,setSavedSource]=React.useState<string|null>(null);
  const setupHeading=React.useRef<HTMLDivElement>(null);
  const joinedWorkspace=React.useRef('');
  const resultsRef=React.useRef<HTMLDivElement>(null),createRef=React.useRef<HTMLDetailsElement>(null),categoriesRef=React.useRef<HTMLDetailsElement>(null);
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

  const setupStage=invitationReady?(signedIn?3:connected?2:1):0;
  React.useEffect(()=>{
    if(setupStage)setupHeading.current?.focus();
  },[setupStage]);
  React.useEffect(()=>setSavedSource(null),[active]);
  const savedNote=savedSource?records.find(note=>note.source_id===savedSource&&note.author_id===client.current?.userId):undefined;
  const setupAlert=setupError&&<p role="alert" style={{color:'#ffb8a6',margin:0}}>{text(setupError)}</p>;

  /** Each task has a connection generation; disconnected/retired results cannot commit. */
  const run=React.useCallback(async <T,>(work:()=>Promise<T>,done:(value:T)=>void,onFailure?:(message:string)=>void):Promise<void>=>{
    if(running.current)return;
    running.current=true;setBusy(true);setError('');setMessage('');setSavedSource(null);const revision=generation.current;
    try{const result=await work();if(revision===generation.current)done(result);}
    catch(failure){if(revision===generation.current&&(failure as Error)?.name!=='AbortError')(onFailure||setError)((failure as Error)?.message||'Workspace request failed.');}
    finally{if(revision===generation.current){running.current=false;setBusy(false);}}
  },[]);
  function disconnect(){joinedWorkspace.current='';generation.current++;client.current?.dispose();client.current=null;running.current=false;setBusy(false);setConnected(false);setSignedIn(false);setPassword('');setWorkspaces([]);setActive('');setMembers([]);setInvites([]);setShareText('');setError('');setMessage('');setAccepted(false);setInvitationReady(false);setSetupError('');setJoinAlias('');setManualOpen(false);setJoinCode('');setSetupMode(undefined);setDeleteConfirmation(null);setDeleteName('');}
  function connect(){try{if(!accepted)throw new Error('Confirm the service operator before connecting.');client.current?.dispose();client.current=new CommunityWorkspaceClient({endpoint,publicKey});generation.current++;setConnected(true);setSetupError('');}catch(failure){setSetupError((failure as Error).message);}}
  function importInvitation(){try{const parsed=parseWorkspaceInvitation(invitation);setEndpoint(parsed.endpoint);setPublicKey(parsed.publicKey);setJoinCode(parsed.invitation);setAccepted(false);setInvitation('');setSetupError('');setManualOpen(false);setInvitationReady(true);}catch(failure){setSetupError((failure as Error).message);}}
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
    setSetupError('');
    void run(async()=>{
      await api.signIn(email,secret);
      return invitationReady?[]:api.workspaces();
    },list=>{
      setSignedIn(true);setSetupMode(undefined);setWorkspaces(list);setActive(invitationReady?'':list[0]?.id||'');
    },setSetupError);
  }

  function submitWorkspace() {
    const api=client.current;
    if (!api || busy) return;
    const create = creatingWorkspace&&!invitationReady;
    const ready = create ? name.trim() && contact.trim() && ownerAlias.trim() : joinCode.trim() && joinAlias.trim();
    if (!ready&&!joinedWorkspace.current) return;
    setSetupError('');
    void run(async()=>{
      const id=create ? await api.create(name,contact,ownerAlias) :
        joinedWorkspace.current || await api.join(joinCode.trim(),joinAlias);
      if(!create&&client.current===api)joinedWorkspace.current=id;
      return {id,list:await api.workspaces()};
    },({id,list})=>{
      setWorkspaces(list);setActive(id);
      if (create) {setName('');setContact('');setOwnerAlias('');}
      else {
        joinedWorkspace.current='';
        setJoinCode('');setJoinAlias('');setInvitationReady(false);setSetupMode(undefined);
      }
    },setSetupError);
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
  React.useEffect(()=>{
    setWorkspaceView('notes');
    setComposer(null);
  },[active]);
  React.useEffect(()=>{
    if (detectionDraft && canWrite) {setWorkspaceView('notes');setComposer('new');}
  },[active,canWrite,detectionDraft?.requestId]);
  function openComposer() {
    setComposer('new');
    requestAnimationFrame(()=>composerHeading.current?.focus());
  }
  const noSharedNotes=contributions.page?.statistics.total===0;
  const canAddNote=canWrite && activeCategories.length>0;
  const showFirstCategory=owner && !!contributions.page && !activeCategories.length;
  const [categoryAddRequest,requestCategoryAdd]=React.useState(0);
  const firstCategory=(add=false)=>{
    if(add)requestCategoryAdd(value=>value+1);
    setWorkspaceView('settings');
    requestAnimationFrame(()=>goToSection(categoriesRef));
  };
  const contributionCards=React.useMemo(()=>workspace?sortedRecords.map(note=><WorkspaceContributionCard onLoadDetectionAttachment={(id,signal)=>client.current!.noteImage(note.id,id,signal)} key={note.id} onLoadDetectionPreview={onLoadDetectionPreview} onOpenComparison={onOpenComparison} note={note} color={categories.find(category=>category.name===note.category)?.color||'#f5a623'}
        busy={busy} own={note.author_id===client.current?.userId} ownerContribution={note.author_id===workspace.owner_id}
        canEdit={owner||canWrite&&note.author_id===client.current?.userId} canRemove={owner||canWrite&&note.author_id===client.current?.userId}
        onShow={()=>onFocus(communityNoteTarget(note,categories,workspace.name))}
        onOpenLinkedImage={note.image_id&&onOpenLinkedImage?()=>onOpenLinkedImage(communityNoteTarget(note,categories,workspace.name)):undefined}
        onEdit={()=>{setEditing(note.id);setEditError('');}}
        onRemove={()=>setRemoval({kind:'note',id:note.id})}>
        {editing===note.id&&<WorkspaceContributionEditor key={note.id} note={note} categories={categories} busy={busy} error={editError}
          onCancel={()=>{setEditing('');setEditError('');}}
          onSave={(values,version)=>{const api=client.current!;setEditError('');void run(()=>api.editContribution(active,note.id,values,version),()=>{contributions.refresh();setEditing('');setMessage(text('Contribution updated.'));},setEditError);}} />}

      </WorkspaceContributionCard>):[],[sortedRecords,categories,busy,owner,canWrite,editing,editError,onFocus,onOpenLinkedImage,active,workspace,run,contributions.refresh,text,onLoadDetectionPreview,onOpenComparison]);
  return <section className="mly-notes-scroll mly-workspace-scroll" role="tabpanel" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>
    <style>{workspaceReadabilityCss}</style>
    {detectionDraft&&!canWrite&&<div role="status" style={card}><strong>{detectionDraft.title}</strong><span>{text('Note draft ready. Connect, sign in and choose a workspace where you can contribute.')}</span>{action('Discard incoming draft',()=>onClearDetectionDraft?.(),false)}</div>}
    {!connected ? <section style={workspaceConnectStyle} aria-label={text('Join a workspace')}>
      <div ref={setupHeading} tabIndex={-1}>
      <WorkspaceHelpHeading title={text('Join a workspace')} label={text('Workspace setup guide')}>
        <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>
        <ol>
          <li>{text('Paste an invitation from your workspace operator. If you manage the service, use Connect manually.')}</li>
          <li>{text('Verify the data destination and sign in with the account created for you in that project.')}</li>
          <li>{text('Join with your invitation code or create a workspace if your account has permission.')}</li>
        </ol>
      </WorkspaceHelpHeading>
      </div>
      {!invitationReady && <React.Fragment>
        <WorkspaceFieldHelp label={text('Invitation details')} help={text("Paste the full invitation JSON sent by the workspace owner. It fills in the project URL, public key, and join code.")}>
          <textarea rows={3} maxLength={12000} aria-label={text('Invitation details')} style={input} value={invitation}
            onChange={event=>setInvitation(event.target.value)} />
        </WorkspaceFieldHelp>
        <button type="button" className="mly-text-action mly-workspace-connect-primary" style={workspaceConnectPrimaryStyle}
          disabled={!invitation.trim() || busy} onClick={importInvitation}>{text('Use invitation details')}</button>
      </React.Fragment>}
      {!invitationReady&&<details open={manualOpen} onToggle={event=>setManualOpen(event.currentTarget.open)}>
        <summary style={summaryStyle}>{text('Connect manually')}</summary>
        <div style={workspaceManualFieldsStyle}>
          <WorkspaceFieldHelp label={text('Project URL')} help={text("Copy the HTTPS Project URL from the Supabase project that hosts your workspace. Use the base origin without a path.")}><input style={input} type="url" value={endpoint} placeholder="https://your-project.supabase.co"
            onChange={event=>{setEndpoint(event.target.value);setAccepted(false);setInvitationReady(false);setJoinCode('');}} /></WorkspaceFieldHelp>
          <WorkspaceFieldHelp label={text('Public publishable or anon key')} help={text("Copy the publishable key or legacy anon key from that project’s API Keys page. Never paste a secret or service-role key.")}><input style={input} value={publicKey} autoComplete="off"
            onChange={event=>{setPublicKey(event.target.value);setAccepted(false);setInvitationReady(false);setJoinCode('');}} /></WorkspaceFieldHelp>
        </div>
      </details>}
      {setupAlert}
      {(invitationReady || manualOpen) && <React.Fragment>
        {invitationReady && <React.Fragment>
          <small>{text('Step 1 of 3 · Review invitation')}</small>
          <div style={{overflowWrap:'anywhere'}}>{text('Data destination')}: <strong>{endpoint}</strong></div>
          <button type="button" className="mly-text-action" style={secondary} onClick={()=>{
            setInvitationReady(false);setAccepted(false);setEndpoint('');setPublicKey('');setJoinCode('');setSetupError('');
          }}>{text('Use a different invitation')}</button>
        </React.Fragment>}
        <WorkspaceFieldHelp label={text('I recognize this operator and choose to use its service.')}
          help={text('Check the project URL against the information supplied by your operator. Connect enables sign-in to that service.')}>
          <input type="checkbox" checked={accepted} onChange={event=>setAccepted(event.target.checked)} />
        </WorkspaceFieldHelp>
        <button type="button" className="mly-text-action mly-workspace-connect-primary" style={workspaceConnectPrimaryStyle}
          disabled={busy || !accepted || !endpoint.trim() || !publicKey.trim()} onClick={connect}>{text(invitationReady?'Continue to sign in':'Connect')}</button>
      </React.Fragment>}
    </section> : !signedIn ? <section style={workspaceConnectStyle} aria-label={text('Sign in to workspace')}>
      <div ref={setupHeading} tabIndex={-1}>
      {invitationReady&&<small>{text('Step 2 of 3 · Sign in')}</small>}
      <WorkspaceHelpHeading title={text('Sign in to workspace')} label={text('Sign-in help')}
        actions={action('Disconnect',disconnect,false)}>
        <p>{text('Use an account supplied by the workspace operator. No Esri Enterprise account is required.')}</p>
      </WorkspaceHelpHeading>
      </div>
      <span style={{overflowWrap:'anywhere'}}>{text('Data destination')}: {client.current?.connection.endpoint}</span>
      <form style={workspaceManualFieldsStyle} onSubmit={event=>{event.preventDefault();signIn();}}>
        <WorkspaceFieldHelp label={text('Email')} help={text("Use the email created for you under Authentication → Users in the project shown as Data destination.")}><input style={input} type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} /></WorkspaceFieldHelp>
        <WorkspaceFieldHelp label={text('Password')} help={text("Enter the password for that workspace service account. Ask the operator for help if you need to reset it.")}><input style={input} type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} /></WorkspaceFieldHelp>
        {setupAlert}
        <button className="mly-text-action mly-workspace-connect-primary" type="submit" style={workspaceConnectPrimaryStyle} disabled={busy||!email.trim()||!password}>{text('Sign in')}</button>
      </form>
    </section> : invitationReady ? <section style={workspaceConnectStyle} aria-label={text('Complete workspace invitation')}>
      <div ref={setupHeading} tabIndex={-1}>
        <small>{text('Step 3 of 3 · Join workspace')}</small>
        <h3 style={headingStyle}>{text('Join the workspace')}</h3>
      </div>
      <form style={workspaceManualFieldsStyle} onSubmit={event=>{event.preventDefault();submitWorkspace();}}>
        {!joinedWorkspace.current&&<React.Fragment>
        <WorkspaceFieldHelp label={text('Your display name when joining')} help={text('Members see this name alongside your notes.')}>
          <input style={input} required maxLength={60} autoComplete="off" value={joinAlias} onChange={event=>setJoinAlias(event.target.value)} />
        </WorkspaceFieldHelp>
        <details>
          <summary style={summaryStyle}>{text('Use a replacement invitation code')}</summary>
          <WorkspaceFieldHelp label={text('Invitation code')} help={text('Use a replacement code from the same service. For a different service, start with a new invitation.')}>
            <input style={input} autoComplete="off" value={joinCode} onChange={event=>{setJoinCode(event.target.value);setSetupError('');}} />
          </WorkspaceFieldHelp>
        </details>
        </React.Fragment>}
        {setupAlert}
        <div style={row}>
          {action('Start with a new invitation',disconnect)}
          <button className="mly-text-action mly-workspace-connect-primary" type="submit" style={workspaceConnectPrimaryStyle}
            disabled={busy||(!joinedWorkspace.current&&(!joinAlias.trim()||!joinCode.trim()))}>{text(joinedWorkspace.current?'Retry opening workspace':'Join workspace')}</button>
        </div>
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
          {canCreate && <div role="radiogroup" aria-label={text('Workspace setup method')} className="mly-workspace-setup-options">
            <label>
              <input type="radio" name={setupChoiceName} checked={creatingWorkspace} disabled={busy}
                onChange={()=>setSetupMode('create')} />
              <span>{text('Create new')}</span>
            </label>
            <label>
              <input type="radio" name={setupChoiceName} checked={!creatingWorkspace} disabled={busy}
                onChange={()=>setSetupMode('join')} />
              <span>{text('Join existing')}</span>
            </label>
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
            {setupAlert}
            <button type="submit" className="mly-text-action mly-workspace-connect-primary" style={workspaceConnectPrimaryStyle}
              disabled={busy || (creatingWorkspace ? !name.trim() || !contact.trim() || !ownerAlias.trim() : !joinCode.trim() || !joinAlias.trim())}>
              {text(creatingWorkspace?'Create workspace':'Join workspace')}
            </button>
          </form>
        </section>
      </details>
    </React.Fragment>}
    {signedIn&&workspace&&<React.Fragment>
      <div className="mly-workspace-section mly-workspace-overview" style={sectionStyle}><div style={{...row,justifyContent:'space-between'}}><WorkspaceHelpHeading title={workspace.name} label={text('Workspace actions help')}>
          <p>{text('Read shared observations, add a contribution, or publish an existing local draft. The actions available depend on your role.')}</p>
        </WorkspaceHelpHeading><span className="mly-workspace-role">{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span></div>
        <small className="mly-workspace-contact">{text('Operator contact')}: <bdi>{workspace.operator_contact}</bdi></small>
        <div role="tablist" aria-label={text('Workspace views')} className="mly-workspace-view-tabs"
          onKeyDown={event=>{
            const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
            const index=buttons.indexOf(event.target as HTMLButtonElement);
            const rtl=getComputedStyle(event.currentTarget).direction==='rtl';
            const step=event.key==='ArrowRight'?(rtl?-1:1):event.key==='ArrowLeft'?(rtl?1:-1):0;
            if (index<0 || (!step && event.key!=='Home' && event.key!=='End')) return;
            event.preventDefault();
            const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+step+buttons.length)%buttons.length;
            setWorkspaceView(workspaceViews[next]);buttons[next]?.focus();
          }}>
          {workspaceViews.map((view,index)=><button key={view} type="button" role="tab"
            id={`${workspaceTabId}-${view}-tab`} aria-controls={`${workspaceTabId}-${view}`}
            aria-labelledby={`${workspaceTabId}-${view}-label`} aria-describedby={`${workspaceTabId}-${view}-hint`}
            aria-selected={workspaceView===view} tabIndex={workspaceView===view?0:-1} onClick={()=>setWorkspaceView(view)}>
            <span id={`${workspaceTabId}-${view}-label`}>{text(['Notes','Members','Settings'][index])}</span>
            <small id={`${workspaceTabId}-${view}-hint`}>{text(view==='notes'
              ? canWrite?'Find and add notes':'Find shared notes'
              : view==='members' ? owner?'People and invitations':'Your access'
              : owner?'Profile and categories':'Your display name')}</small>
          </button>)}
        </div>
      </div>
      <section id={`${workspaceTabId}-notes`} role="tabpanel" aria-labelledby={`${workspaceTabId}-notes-label`}
        className="mly-workspace-tab-content" hidden={workspaceView!=='notes'}>
      {!noSharedNotes&&contributions.page&&!activeCategories.length&&canWrite&&
        (owner?action('Manage categories',()=>firstCategory()):<p>{text('Ask the workspace owner to add a category so you can publish notes.')}</p>)}
      {showFirstCategory&&noSharedNotes&&<div style={row}>
        <span>{text('Add a category before publishing your first note.')}</span>
        {action('Add the first category',()=>firstCategory(true))}
      </div>}
      {canAddNote&&!composer&&action(noSharedNotes?'Add the first note':'Add a note',openComposer)}
      {message&&savedSource&&<div style={row}>
        <span role="status">{message}</span>
        {savedNote&&action('Show saved note on map',()=>onFocus(communityNoteTarget(savedNote,categories,workspace.name)),false)}
      </div>}
      {canWrite&&<section className="mly-workspace-tab-content" style={sectionStyle} hidden={!composer} aria-label={text('Add a note')}>
        <div style={row}>
          <h3 ref={composerHeading} tabIndex={-1} style={headingStyle}>{text('Add a note')}</h3>
          {action('Close note form',()=>setComposer(null),busy)}
        </div>
        <div role="group" aria-label={text('How to add a note')} style={row}>
          <button type="button" className="mly-text-action" aria-pressed={composer==='new'} style={composer==='new'?button:secondary}
            disabled={busy} onClick={()=>setComposer('new')}>{text('Write a new note')}</button>
          <button type="button" className="mly-text-action" aria-pressed={composer==='local'} style={composer==='local'?button:secondary}
            disabled={busy} onClick={()=>setComposer('local')}>{text('Share a note from Local')}</button>
        </div>
        <div className="mly-workspace-tab-content" hidden={composer!=='new'}>
      {canWrite&&<WorkspaceContributionDraft embedded onClose={()=>setComposer(null)} onDetectionDraftLocation={onDetectionDraftLocation} onDetectionDraftFinished={onDetectionDraftFinished} detectionDraft={detectionDraft} onClearDetectionDraft={onClearDetectionDraft} key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}
        onPublish={(values,onSaved)=>{const api=client.current!;setCreateError('');void run(()=>api.createContribution(active,values),created=>{setSavedSource(values.sourceId);contributions.clearSearch();contributions.refresh();setMessage(text(created?'Contribution published.':'This draft was already published; no duplicate was created.'));onSaved();setComposer(null);goToSection(resultsRef);},setCreateError);}} />}
        </div>
        <div className="mly-workspace-tab-content" hidden={composer!=='local'}>
        <div style={{display:'grid',gap:12,minWidth:0,paddingTop:8}}>
        <p style={{margin:0}}>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>
        <WorkspaceHelpHeading title={text('Share an existing note')} label={text('Publish a local note help')}>
          <p>{text('Select one local note, give the shared copy a title and category, then publish it. Your local copy stays in Local notes.')}</p>
        </WorkspaceHelpHeading>
        <LocalNotePicker notes={notes} value={localId} onSelect={id=>{setLocalId(id);setPublishTitle(notes.find(note=>note.id===id)?.title||'');}} onPreview={onFocus} />
        <WorkspaceFieldHelp label={text('Title for selected local note')} help={text("Give the shared contribution a short title. This leaves your original local note unchanged.")}><input aria-label={text('Title for selected local note')} style={input} maxLength={160} value={publishTitle} onChange={event=>setPublishTitle(event.target.value)} /></WorkspaceFieldHelp>
        <WorkspaceFieldHelp label={text('Contribution category')} help={text("Choose an active workspace category for the note you are publishing.")}><select aria-label={text('Contribution category')} style={input} value={chosenCategory} onChange={event=>setPublishCategory(event.target.value)}>{!chosenCategory&&<option value="">{text('No active categories')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></WorkspaceFieldHelp>
        {action('Publish note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,title:publishTitle.trim(),category:chosenCategory},null),created=>{if(created)setSavedSource(note.id);contributions.clearSearch();contributions.refresh();setComposer(null);setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!publishTitle.trim()||!chosenCategory||!notes.some(note=>note.id===localId))}
        </div>
        </div>
      </section>}
      <WorkspaceContributionTools moreActions={<React.Fragment>
          <NotesSortControl value={sort} onChange={setSort} loadedOnly />
          <div style={row}>{action('Refresh notes',()=>loadPage())}{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',title:note.title||'',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,authorDisplayName:note.author_display_name||null,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>
        </React.Fragment>} statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}
        query={contributions.query} mine={contributions.mine} busy={contributions.busy} waiting={contributions.waiting} onComposition={contributions.setComposing} onSubmit={contributions.submitSearch} onClear={contributions.clearSearch} onQuery={contributions.setQuery} onMine={contributions.setMine} />
      {contributions.error&&<div role="alert" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}
      <div ref={resultsRef} tabIndex={-1} role="region" aria-label={text('Loaded contributions')} aria-busy={contributions.busy} style={{display:'grid',gap:10,minWidth:0,scrollMarginTop:10}}><div style={{...row,justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #567363'}}><WorkspaceHelpHeading title={text('Search results')} label={text('Search and export help')}>
          <p>{text('Use search and sorting to find contributions. Export loaded notes saves the records currently loaded in this view.')}</p>
        </WorkspaceHelpHeading></div>
      {!contributions.busy&&contributions.page&&<p style={{margin:0,color:'#d3e2d9'}}>{text('Showing')} {records.length} {text('of')} {contributions.page.statistics.matching} {text('matching contributions')}{contributions.query.trim()?` · “${contributions.query.trim()}”`:''}{contributions.mine?` · ${text('Only my contributions')}`:''}</p>}
      {contributions.busy&&<p role="status" style={{margin:0}}>{text(contributions.waiting?'Waiting for you to finish typing…':'Updating results…')}{records.length>0&&' '+text('Previous results remain visible until the search finishes.')}</p>}
      {contributionCards}
      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}
      {!contributions.busy&&!contributions.error&&contributions.page&&!records.length&&<div style={{...card,padding:16}}>
        {noSharedNotes?<React.Fragment>
          <strong>{text('No shared notes yet.')}</strong>
          {!owner&&canWrite&&!activeCategories.length&&<span>{text('Ask the workspace owner to add a category so you can publish notes.')}</span>}
        </React.Fragment>:<React.Fragment>
          <strong>{text('No notes match these filters.')}</strong>
          {(contributions.query||contributions.mine)&&action('Show all notes',()=>{contributions.clearSearch();contributions.setMine(false);},false)}
        </React.Fragment>}
      </div>}
      </div>
      </section>
      <section id={`${workspaceTabId}-members`} role="tabpanel" aria-labelledby={`${workspaceTabId}-members-label`}
        className="mly-workspace-tab-content" hidden={workspaceView!=='members'}>
      {!owner&&<div style={sectionStyle}>
        <h3 style={headingStyle}>{text('Your workspace access')}</h3>
        <p style={{margin:0}}>{text(canWrite?'You can read shared notes and add or edit your own.':'You can read shared notes and show them on the map.')}</p>
        <small>{text('Contact the workspace operator to request a change to your access.')}</small>
      </div>}
      {owner&&<div style={sectionStyle}>
        <div style={{...row,justifyContent:'space-between'}}>
          <WorkspaceHelpHeading title={text('People and invitations')} label={text('Invitations and members help')}>
            <p>{text('Invite readers to view notes or contributors to add their own. Invitations expire after seven days and can be revoked here.')}</p>
            <p>{text('Making a member read-only keeps their access to existing notes. Removing a member ends their workspace access.')}</p>
          </WorkspaceHelpHeading>
          {action('Refresh members and invitations',()=>loadPage(false))}
        </div>
        <div className="mly-workspace-member-layout">
          <div style={{...card,gap:12}}>
            <strong>{text('Create invitation')}</strong>
            <div style={{display:'grid',gap:12,minWidth:0,gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 220px), 1fr))'}}>
              <WorkspaceFieldHelp label={text('Invitation role')} help={text("A Reader can view shared notes. A Contributor can also add and edit their own contributions.")}><select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value="contributor">{text('Contributor')}</option><option value="reader">{text('Reader')}</option></select></WorkspaceFieldHelp>
              <WorkspaceFieldHelp label={text('Maximum joins')} help={text("Set how many times this invitation can be redeemed. It also expires after seven days.")}><input style={input} type="number" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></WorkspaceFieldHelp>
            </div>
            <p style={{margin:0}}>{text(inviteRole==='reader'?'Readers can view shared notes.':'Contributors can view shared notes and add or edit their own.')}</p>
            {action('Create seven-day invitation',()=>{const api=client.current!;void run(async()=>{
              const invitation=await api.invite(active,inviteRole,inviteUses);
              const updatedInvites=await api.invites(active).catch(()=>null);
              return {invitation,updatedInvites};
            },({invitation,updatedInvites})=>{
              setShareText(JSON.stringify(invitation));
              if(updatedInvites)setInvites(updatedInvites);
              setMessage(text('Share the invitation only with intended participants.'));
            });})}
            {shareText&&<WorkspaceFieldHelp label={text('Share these invitation details')} help={text("Copy the entire block to the person you want to invite. They still need their own service account.")}><textarea aria-label={text('Share these invitation details')} style={{...input,minHeight:96,resize:'vertical',fontFamily:'ui-monospace, SFMono-Regular, Consolas, monospace',fontSize:11,lineHeight:1.5}} readOnly value={shareText} onFocus={event=>event.currentTarget.select()} /></WorkspaceFieldHelp>}
          </div>
          <div className="mly-workspace-access-list">
          <div style={{display:'grid',gap:8,minWidth:0}}>
            <strong>{text('Invitations')}</strong>
            {!busy&&!invites.length&&<small>{text('No invitations to review.')}</small>}
            {invites.map(item=><div key={item.id} style={{...card,gap:10}}>
              <strong>{text(item.role==='reader'?'Reader':'Contributor')}</strong>
              <span>{text('Joins')}: {item.uses}/{item.max_uses} · {text('Expires')}: {Number.isNaN(Date.parse(item.expires_at))?item.expires_at:new Intl.DateTimeFormat(formatLocale,{dateStyle:'medium'}).format(new Date(item.expires_at))}</span>
              <div style={row}>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>
            </div>)}
          </div>
          <div style={{display:'grid',gap:8,minWidth:0}}>
            <strong>{text('Members')}</strong>
            {!busy&&!members.length&&<small>{text('No one else has joined this workspace yet.')}</small>}
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
          </div>
          </div>
        </div>
      </div>}
      </section>
      <section id={`${workspaceTabId}-settings`} role="tabpanel" aria-labelledby={`${workspaceTabId}-settings-label`}
        className="mly-workspace-tab-content" hidden={workspaceView!=='settings'}>
      {contributions.page&&client.current?.userId&&<WorkspaceDisplayNameEditor key={'profile:'+active} value={contributions.page.my_display_name} userId={client.current.userId} busy={busy} error={aliasError}
        onSave={(value,onSaved)=>{const api=client.current!;setAliasError('');void run(async()=>{await api.setDisplayName(active,value);return api.members(active);},members=>{setMembers(members);contributions.refresh();setMessage(text('Workspace display name saved.'));onSaved();},setAliasError);}} />}
      {owner&&<WorkspaceCategoryEditor key={'categories:'+active} sectionRef={categoriesRef} addRequest={categoryAddRequest} categories={categories} busy={busy}
        categoryCounts={contributions.page?.statistics.by_category} onDelete={(name,onDeleted,onFailure)=>{
          const api=client.current!;
          void run(()=>api.deleteCategory(active,name),()=>{
            contributions.refresh();setMessage(text('Workspace category deleted.'));onDeleted();
          },onFailure);
        }} onSave={(name,color,archived,onSaved)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>{contributions.refresh();setMessage(text('Workspace category saved.'));onSaved?.();});}} />}
      {owner&&<details ref={manageRef} className="mly-workspace-section" style={sectionStyle}>
        <summary style={summaryStyle}>{text('Workspace management')} <small className="mly-workspace-section-hint">{text('Delete this workspace')}</small></summary>
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
      </section>
    </React.Fragment>}
    {removal?.kind==='note'&&<div role="group" aria-label={text('Confirm removal')} style={card}><span>{text('Remove this shared note from the operator’s service?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{await api.removeNote(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}
    {busy&&<span role="status">{text('Working with the selected workspace…')}</span>}
    {error&&<div role="alert" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(error)}</div>}
    {message&&!savedSource&&<div role="status">{message}</div>}

  </section>;
};
