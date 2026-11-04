#!/usr/bin/env node
'use strict';
/**
 * Workspace readability. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/features/field-notes/mapGraphic.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "/** Note graphic descriptors only; FieldNoteMap owns layer coordination; runtime supplies SDK factories. */\nimport type { FieldNote } from '../../components/types';\n\n/**\n * Build a source/category-colored diamond, WGS84 point and structured note popup.\n",
              "after": "/** Note graphic descriptors only; FieldNoteMap owns layer coordination; runtime supplies SDK factories. */\nimport type { FieldNote } from '../../components/types';\n\n/** Screen-facing 3D icons stay readable at every camera angle. Position/elevation\n * belong to the point/layer; this adds no height, callout or volumetric geometry.\n * The same symbol factory serves Local, Workspace and Enterprise notes.\n */\nexport function buildNoteSymbol(color: string | number[], is3D: boolean): any {\n  return is3D ? {\n    type: 'point-3d',\n    symbolLayers: [{ type: 'icon', resource: { primitive: 'kite' }, anchor: 'center',\n      material: { color }, size: 13, outline: { color: 'white', size: 1.5 } }]\n  } : { type: 'simple-marker', style: 'diamond', color, size: 13, outline: { color: 'white', width: 1.5 } };\n}\n\n/**\n * Build a source/category-colored diamond, WGS84 point and structured note popup.\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "export function buildLocalNoteGraphic(note: FieldNote, is3D: boolean): __esri.GraphicProperties {\n  const color = note.workspace?.color || (note.source === \"manual\" ? [245, 166, 35, 1] : [53, 175, 109, 1]);\n\n  const symbol = {\n    type: \"simple-marker\",\n    style: \"diamond\",\n    color,\n    size: 13,\n    outline: { color: \"white\", width: 1.5 },\n  };\n\n  return {\n    geometry: {\n",
              "after": "export function buildLocalNoteGraphic(note: FieldNote, is3D: boolean): __esri.GraphicProperties {\n  const color = note.workspace?.color || (note.source === \"manual\" ? [245, 166, 35, 1] : [53, 175, 109, 1]);\n\n  const symbol = buildNoteSymbol(color,is3D);\n\n  return {\n    geometry: {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "import { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\nimport { startNoteHighlight } from '../features/field-notes/nativeNoteHighlight';\nimport { buildLocalNoteGraphic } from '../features/field-notes/mapGraphic';\nimport { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';\nimport { createFieldNoteViewerRenderer } from '../features/field-notes/viewerRenderer';\nimport { selectViewerFieldNotes } from '../features/field-notes/viewerSelection';\n",
              "after": "import { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\nimport { startNoteHighlight } from '../features/field-notes/nativeNoteHighlight';\nimport { buildLocalNoteGraphic, buildNoteSymbol } from '../features/field-notes/mapGraphic';\nimport { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';\nimport { createFieldNoteViewerRenderer } from '../features/field-notes/viewerRenderer';\nimport { selectViewerFieldNotes } from '../features/field-notes/viewerSelection';\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "      const { Graphic } = this.ArcGISModules;\n      return (note, is3D) => new Graphic(buildLocalNoteGraphic(note, is3D));\n    },\n    highlightNote: (view, layer, graphic, current) => startNoteHighlight(view, layer, graphic, current),\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n",
              "after": "      const { Graphic } = this.ArcGISModules;\n      return (note, is3D) => new Graphic(buildLocalNoteGraphic(note, is3D));\n    },\n    configureFocusLayer: (layer, measured) => { layer.elevationInfo = { mode: measured ? 'absolute-height' : 'on-the-ground' }; },\n    highlightNote: (view, layer, graphic, current) => startNoteHighlight(view, layer, graphic, current),\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n"
            },
            {
              "label": "Workspace contributions 3",
              "before": "    this.clearSharedNotesView();\n    const revision = this._sharedNotesRevision;\n    const layer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url, id: \"mapillary-shared-field-notes\", title: \"Enterprise Field Notes\", outFields: [\"category\", \"note_text\", \"image_id\", \"created_at\"], refreshInterval: 0,\n      elevationInfo: { mode: \"on-the-ground\" }, renderer: { type: \"simple\", symbol: { type: \"simple-marker\", style: \"diamond\", color: \"#35b7c4\", size: 12, outline: { color: \"white\", width: 1 } } },\n      popupTemplate: { title: this._owned(\"Enterprise Field Note\"), content: [{ type: \"fields\", fieldInfos: [{ fieldName: \"category\", label: this._owned(\"Category\") }, { fieldName: \"note_text\", label: this._owned(\"Note\") }, { fieldName: \"created_at\", label: this._owned(\"Created\"), format: { dateFormat: \"short-date-short-time\" } }, { fieldName: \"image_id\", label: this._owned(\"Mapillary image\") }] }] } });\n    this._sharedNotesLayer = layer; this._sharedNotesView = view;\n    this.setState({ sharedNotesMessage: this._owned(\"Loading enterprise notes\u2026\") });\n",
              "after": "    this.clearSharedNotesView();\n    const revision = this._sharedNotesRevision;\n    const layer: __esri.FeatureLayer = new this.ArcGISModules.FeatureLayer({ url, id: \"mapillary-shared-field-notes\", title: \"Enterprise Field Notes\", outFields: [\"category\", \"note_text\", \"image_id\", \"created_at\"], refreshInterval: 0,\n      elevationInfo: { mode: \"on-the-ground\" }, renderer: { type: \"simple\", symbol: buildNoteSymbol(\"#35b7c4\", view.type === \"3d\") },\n      popupTemplate: { title: this._owned(\"Enterprise Field Note\"), content: [{ type: \"fields\", fieldInfos: [{ fieldName: \"category\", label: this._owned(\"Category\") }, { fieldName: \"note_text\", label: this._owned(\"Note\") }, { fieldName: \"created_at\", label: this._owned(\"Created\"), format: { dateFormat: \"short-date-short-time\" } }, { fieldName: \"image_id\", label: this._owned(\"Mapillary image\") }] }] } });\n    this._sharedNotesLayer = layer; this._sharedNotesView = view;\n    this.setState({ sharedNotesMessage: this._owned(\"Loading enterprise notes\u2026\") });\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/useWorkspaceContributions.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "  const generation = React.useRef(0), inFlight = React.useRef(false);\n  const pending = React.useRef<AbortController|null>(null);\n  const nextOffset = React.useRef(0);\n  const [loadedWorkspace,setLoadedWorkspace] = React.useState('');\n  React.useEffect(()=>{const timer=setTimeout(()=>setSearch(query.trim()),250);return()=>clearTimeout(timer);},[query]);\n  React.useEffect(()=>{setQuery('');setSearch('');setMine(false);},[workspace]);\n  React.useEffect(()=>{\n    const current=++generation.current; pending.current?.abort();nextOffset.current=0;inFlight.current=false;setPage(null);setError('');setLoadedWorkspace('');\n    if(!api||!workspace){setBusy(false);return;}\n    const abort=new AbortController();pending.current=abort;\n    inFlight.current=true;setBusy(true);\n    void api.contributions(workspace,search,mine,0,abort.signal).then(result=>{if(current===generation.current){nextOffset.current=result.notes.length;setPage(result);setLoadedWorkspace(workspace);}},failure=>{\n      if(current===generation.current)setError((failure as Error).message||'Contributions could not load.');\n    }).finally(()=>{if(current===generation.current){setBusy(false);inFlight.current=false;}});\n    return()=>{++generation.current;pending.current?.abort();};\n  },[api,workspace,search,mine,revision]);\n",
              "after": "  const generation = React.useRef(0), inFlight = React.useRef(false);\n  const pending = React.useRef<AbortController|null>(null);\n  const nextOffset = React.useRef(0);\n  const source = React.useRef<{api: CommunityWorkspaceClient; workspace: string}|null>(null);\n  const [composing,setComposing] = React.useState(false);\n  // Wait through ordinary pauses and IME composition; Enter can apply immediately.\n  React.useEffect(()=>{if(composing)return;const timer=setTimeout(()=>setSearch(query.trim()),700);return()=>clearTimeout(timer);},[query,composing]);\n  React.useEffect(()=>{setQuery('');setSearch('');setMine(false);},[workspace]);\n  React.useEffect(()=>{\n    const current=++generation.current; pending.current?.abort();nextOffset.current=0;inFlight.current=false;setError('');\n    // Preserve readable results while the same workspace searches/refreshes.\n    if(source.current?.api!==api||source.current?.workspace!==workspace)setPage(null);\n    if(!api||!workspace){setBusy(false);return;}\n    const abort=new AbortController();pending.current=abort;\n    inFlight.current=true;setBusy(true);\n    void api.contributions(workspace,search,mine,0,abort.signal).then(result=>{if(current===generation.current){nextOffset.current=result.notes.length;source.current={api,workspace};setPage(result);}},failure=>{\n      if(current===generation.current){setPage(null);setError((failure as Error).message||'Contributions could not load.');}\n    }).finally(()=>{if(current===generation.current){setBusy(false);inFlight.current=false;}});\n    return()=>{++generation.current;pending.current?.abort();};\n  },[api,workspace,search,mine,revision]);\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "      .finally(()=>{if(current===generation.current){setBusy(false);inFlight.current=false;}});\n  }\n  // Prevent a previous workspace's rows appearing during the render before effect cleanup.\n  const visible = loadedWorkspace===workspace ? page : null;\n  return {query,setQuery,mine,setMine,page:visible,busy:busy||query.trim()!==search,error,hasMore:!!visible&&nextOffset.current<visible.statistics.matching,loadMore,refresh:()=>setRevision(value=>value+1)};\n}\n",
              "after": "      .finally(()=>{if(current===generation.current){setBusy(false);inFlight.current=false;}});\n  }\n  // Prevent a previous workspace's rows appearing during the render before effect cleanup.\n  const visible = source.current?.api===api&&source.current?.workspace===workspace ? page : null;\n  const waiting=composing||query.trim()!==search;\n  return {query,setQuery,mine,setMine,page:visible,busy:busy||waiting,waiting,setComposing,submitSearch:()=>{if(!composing)setSearch(query.trim());},clearSearch:()=>{setQuery('');setSearch('');},error,hasMore:!!visible&&nextOffset.current<visible.statistics.matching,loadMore,refresh:()=>setRevision(value=>value+1)};\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/CommunityWorkspacePanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "import { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { FieldNote } from '../../components/types';\nimport { WorkspaceCategoryEditor } from './WorkspaceCategoryEditor';\nimport { WorkspaceContributionTools } from './WorkspaceContributionTools';\nimport { useWorkspaceContributions } from './useWorkspaceContributions';\nimport { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation } from './communityWorkspace';\nimport type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';\nimport { workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button } from '../../styles/communityWorkspace';\n\ninterface Props { notes: readonly FieldNote[]; onFocus(note: FieldNote): void; onClose(): void;\n  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }\nconst emptyRecords: CommunityRecord[] = [], emptyCategories: WorkspaceCategory[] = [];\nconst riskOptions = [['','Not assessed'],['high','High risk'],['low','Low risk'],['no_obvious_hazards','No obvious hazards observed']] as const;\nconst statusOptions = [['open','Open'],['in_progress','In progress'],['completed','Completed'],['dismissed','Dismissed']] as const;\n\n/** Operator-owned collaboration, lazy-mounted for the Workspace source. Credentials\n",
              "after": "import { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { FieldNote } from '../../components/types';\nimport { WorkspaceContributionCard } from './WorkspaceContributionCard';\nimport { WorkspaceCategoryEditor } from './WorkspaceCategoryEditor';\nimport { WorkspaceContributionTools } from './WorkspaceContributionTools';\nimport { useWorkspaceContributions } from './useWorkspaceContributions';\nimport { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation } from './communityWorkspace';\nimport type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';\nimport { workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceHeadingStyle as headingStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';\n\ninterface Props { notes: readonly FieldNote[]; onFocus(note: FieldNote): void; onClose(): void;\n  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }\nconst emptyRecords: CommunityRecord[] = [], emptyCategories: WorkspaceCategory[] = [];\nconst statusOptions = [['open','Open'],['in_progress','In progress'],['completed','Completed'],['dismissed','Dismissed']] as const;\n\n/** Operator-owned collaboration, lazy-mounted for the Workspace source. Credentials\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": " * All database rights are verified by the operator's RLS, never by button visibility.\n */\nexport const CommunityWorkspacePanel: React.FC<Props> = ({notes,onFocus,onClose,onMapNotes}) => {\n  const { owned: text, formatLocale } = useWidgetLocale();\n  const client = React.useRef<CommunityWorkspaceClient|null>(null);\n  const generation = React.useRef(0), running = React.useRef(false);\n  const [connected,setConnected]=React.useState(false),[signedIn,setSignedIn]=React.useState(false),[busy,setBusy]=React.useState(false);\n",
              "after": " * All database rights are verified by the operator's RLS, never by button visibility.\n */\nexport const CommunityWorkspacePanel: React.FC<Props> = ({notes,onFocus,onClose,onMapNotes}) => {\n  const { owned: text } = useWidgetLocale();\n  const [connectionOpen,setConnectionOpen]=React.useState(true);\n  const resultsRef=React.useRef<HTMLDivElement>(null),publishRef=React.useRef<HTMLDetailsElement>(null),categoriesRef=React.useRef<HTMLDetailsElement>(null);\n  /** Open the requested task and move focus without stealing normal list scrolling. */\n  function goToSection(ref: React.RefObject<HTMLElement>){\n    const node=ref.current;if(!node)return;\n    if(node.tagName==='DETAILS')(node as HTMLDetailsElement).open=true;\n    node.scrollIntoView({block:'start',behavior:'smooth'});\n    const target=node.querySelector<HTMLElement>('summary')||node;\n    target.focus({preventScroll:true});\n  }\n  const client = React.useRef<CommunityWorkspaceClient|null>(null);\n  const generation = React.useRef(0), running = React.useRef(false);\n  const [connected,setConnected]=React.useState(false),[signedIn,setSignedIn]=React.useState(false),[busy,setBusy]=React.useState(false);\n"
            },
            {
              "label": "Workspace contributions 3",
              "before": "  const [removal,setRemoval]=React.useState<{kind:'note'|'member';id:string}|null>(null);\n  const workspace=workspaces.find(item=>item.id===active),owner=!!workspace&&workspace.owner_id===client.current?.userId;\n  const canWrite=owner||members.some(member=>member.user_id===client.current?.userId&&member.role==='contributor');\n  const contributions=useWorkspaceContributions(client.current,signedIn?active:'');\n  const records=contributions.page?.notes||emptyRecords, categories=contributions.page?.categories||emptyCategories;\n  const activeCategories=categories.filter(category=>!category.archived);\n",
              "after": "  const [removal,setRemoval]=React.useState<{kind:'note'|'member';id:string}|null>(null);\n  const workspace=workspaces.find(item=>item.id===active),owner=!!workspace&&workspace.owner_id===client.current?.userId;\n  const canWrite=owner||members.some(member=>member.user_id===client.current?.userId&&member.role==='contributor');\n  React.useEffect(()=>setConnectionOpen(!(signedIn&&workspace)),[signedIn,workspace?.id]);\n  const contributions=useWorkspaceContributions(client.current,signedIn?active:'');\n  const records=contributions.page?.notes||emptyRecords, categories=contributions.page?.categories||emptyCategories;\n  const activeCategories=categories.filter(category=>!category.archived);\n"
            },
            {
              "label": "Workspace contributions 4",
              "before": "  const action=(label:string,callback:()=>void,disabled=busy)=><button type=\"button\" style={button} disabled={disabled} onClick={callback}>{text(label)}</button>;\n  return <section role=\"tabpanel\" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>\n    <div style={row}><strong>{text('Collaboration workspace')}</strong>{action('Close',onClose,false)}{connected&&action('Disconnect',disconnect,false)}</div>\n    {!connected?<div style={card}>\n      <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>\n      <details><summary>{text('Have an invitation?')}</summary><label style={field}>{text('Invitation details')}<textarea aria-label={text('Invitation details')} style={input} value={invitation} onChange={event=>setInvitation(event.target.value)} /></label>{action('Use invitation details',importInvitation)}</details>\n",
              "after": "  const action=(label:string,callback:()=>void,disabled=busy)=><button type=\"button\" style={button} disabled={disabled} onClick={callback}>{text(label)}</button>;\n  return <section role=\"tabpanel\" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>\n    <div style={row}><strong>{text('Collaboration workspace')}</strong>{action('Close',onClose,false)}{connected&&action('Disconnect',disconnect,false)}</div>\n    <details open={connectionOpen} onToggle={event=>setConnectionOpen(event.currentTarget.open)} style={sectionStyle}><summary style={summaryStyle}>{text('Connection and workspace settings')}</summary>\n    {!connected?<div style={card}>\n      <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>\n      <details><summary>{text('Have an invitation?')}</summary><label style={field}>{text('Invitation details')}<textarea aria-label={text('Invitation details')} style={input} value={invitation} onChange={event=>setInvitation(event.target.value)} /></label>{action('Use invitation details',importInvitation)}</details>\n"
            },
            {
              "label": "Workspace contributions 5",
              "before": "        </details>\n      </React.Fragment>}\n    </div>}\n    {signedIn&&workspace&&<React.Fragment>\n      <div style={card}><strong>{workspace.name}</strong><span>{text('Operator contact')}: {workspace.operator_contact}</span><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span>{action('Refresh notes',()=>loadPage())}</div>\n      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}\n        query={contributions.query} mine={contributions.mine} busy={contributions.busy} onQuery={contributions.setQuery} onMine={contributions.setMine} />\n      {contributions.error&&<div role=\"alert\" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}\n      {owner&&<WorkspaceCategoryEditor key={active} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>contributions.refresh());}} />}\n      {!activeCategories.length&&!contributions.busy&&<p>{text('The owner must add an active workspace category before new contributions can be published.')}</p>}\n      {canWrite&&<details style={card}><summary>{text('Publish a local note')}</summary>\n        <p>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>\n        <label style={field}>{text('Local note')}<select aria-label={text('Local note')} style={input} value={localId} onChange={event=>setLocalId(event.target.value)}><option value=\"\">{text('Choose a local note')}</option>{notes.map(note=><option key={note.id} value={note.id}>{note.category}: {note.note.slice(0,80)}</option>)}</select></label>\n        <label style={field}>{text('Contribution category')}<select aria-label={text('Contribution category')} style={input} value={chosenCategory} onChange={event=>setPublishCategory(event.target.value)}>{!chosenCategory&&<option value=\"\">{text('No active categories')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>\n        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!chosenCategory||!notes.some(note=>note.id===localId))}\n      </details>}\n      {owner&&<details style={card}><summary>{text('Manage invitations and members')}</summary>\n        <label style={field}>{text('Invitation role')}<select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value=\"contributor\">{text('Contributor')}</option><option value=\"reader\">{text('Reader')}</option></select></label>\n        <label style={field}>{text('Maximum joins')}<input style={input} type=\"number\" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></label>\n        {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}\n",
              "after": "        </details>\n      </React.Fragment>}\n    </div>}\n    </details>\n    {signedIn&&workspace&&<React.Fragment>\n      <div style={sectionStyle}><div style={{...row,justifyContent:'space-between'}}><h3 style={headingStyle}>{workspace.name}</h3><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span></div>\n        <small>{text('Operator contact')}: {workspace.operator_contact}</small>\n        <nav aria-label={text('Workspace actions')} style={row}>\n          <button type=\"button\" style={button} onClick={()=>goToSection(resultsRef)}>{text('Read contributions')}</button>\n          {canWrite&&<button type=\"button\" style={button} onClick={()=>goToSection(publishRef)}>{text('Publish a note')}</button>}\n          {owner&&<button type=\"button\" style={secondary} onClick={()=>goToSection(categoriesRef)}>{text('Edit categories')}</button>}\n          {action('Refresh notes',()=>loadPage())}\n        </nav>\n      </div>\n      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}\n        query={contributions.query} mine={contributions.mine} busy={contributions.busy} waiting={contributions.waiting} onComposition={contributions.setComposing} onSubmit={contributions.submitSearch} onClear={contributions.clearSearch} onQuery={contributions.setQuery} onMine={contributions.setMine} />\n      {contributions.error&&<div role=\"alert\" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}\n      {owner&&<WorkspaceCategoryEditor key={active} sectionRef={categoriesRef} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>{contributions.refresh();setMessage(text('Workspace category saved.'));});}} />}\n      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}\n      {canWrite&&<details ref={publishRef} style={sectionStyle}><summary style={summaryStyle}>{text('Publish a local note')}</summary>\n        <p>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>\n        <label style={field}>{text('Local note')}<select aria-label={text('Local note')} style={input} value={localId} onChange={event=>setLocalId(event.target.value)}><option value=\"\">{text('Choose a local note')}</option>{notes.map(note=><option key={note.id} value={note.id}>{note.category}: {note.note.slice(0,80)}</option>)}</select></label>\n        <label style={field}>{text('Contribution category')}<select aria-label={text('Contribution category')} style={input} value={chosenCategory} onChange={event=>setPublishCategory(event.target.value)}>{!chosenCategory&&<option value=\"\">{text('No active categories')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>\n        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!chosenCategory||!notes.some(note=>note.id===localId))}\n      </details>}\n      {owner&&<details style={sectionStyle}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>\n        <label style={field}>{text('Invitation role')}<select aria-label={text('Invitation role')} style={input} value={inviteRole} onChange={event=>setInviteRole(event.target.value as 'reader'|'contributor')}><option value=\"contributor\">{text('Contributor')}</option><option value=\"reader\">{text('Reader')}</option></select></label>\n        <label style={field}>{text('Maximum joins')}<input style={input} type=\"number\" min={1} max={1000} value={inviteUses} onChange={event=>setInviteUses(Number(event.target.value))} /></label>\n        {action('Create seven-day invitation',()=>{const api=client.current!;void run(()=>api.invite(active,inviteRole,inviteUses),value=>{setShareText(JSON.stringify(value));setMessage(text('Share the invitation only with intended participants.'));});})}\n"
            },
            {
              "label": "Workspace contributions 6",
              "before": "        {invites.map(item=><div key={item.id} style={card}><span>{item.role} \u00b7 {item.uses}/{item.max_uses} \u00b7 {item.expires_at}</span>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>)}\n        {members.map(member=><div key={member.user_id} style={card}><span>{member.user_id} \u00b7 {member.role}</span>{action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}{action('Remove member',()=>setRemoval({kind:'member',id:member.user_id}))}</div>)}\n      </details>}\n      <div style={row}><strong>{text('Loaded contributions')} ({records.length})</strong>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>\n      {records.map(note=><article key={note.id} style={{...card,borderLeft:'4px solid '+(categories.find(category=>category.name===note.category)?.color||'#f5a623')}}><strong>{note.category}</strong><small>{text(note.author_id===client.current?.userId?'Your contribution':note.author_id===workspace.owner_id?'Owner\u2019s contribution':'Member\u2019s contribution')}</small><span style={{whiteSpace:'pre-wrap'}}>{note.note_text}</span>{note.resolution_note&&<span>{text('Resolution')}: {note.resolution_note}</span>}<small>{text('Last updated')}: {new Date(note.updated_at||note.created_at).toLocaleString(formatLocale)}</small><span>{text('Status')}: {text(statusOptions.find(([value])=>value===note.status)?.[1]||'Open')}</span>{note.risk_label&&<span>{text('Legacy risk assessment')}: {text(riskOptions.find(([value])=>value===note.risk_label)?.[1]||'Not assessed')}</span>}\n        <div style={row}>{action('Show on map',()=>onFocus(communityNoteTarget(note,categories,workspace.name)),false)}{(owner||canWrite&&note.author_id===client.current?.userId)&&action('Update contribution',()=>{setEditing(note.id);setReviewStatus(note.status);setReviewCategory(note.category);})}{(owner||canWrite&&note.author_id===client.current?.userId)&&action('Remove shared note',()=>setRemoval({kind:'note',id:note.id}))}</div>\n        {editing===note.id&&<div style={card}><label style={field}>{text('Status')}<select aria-label={text('Status')} style={input} value={reviewStatus} onChange={event=>setReviewStatus(event.target.value)}>{statusOptions.map(([value,label])=><option key={value} value={value}>{text(label)}</option>)}</select></label><label style={field}>{text('Contribution category')}<select aria-label={text('Edit contribution category')} style={input} value={reviewCategory} onChange={event=>setReviewCategory(event.target.value)}>{!activeCategories.some(category=>category.name===reviewCategory)&&<option value={reviewCategory}>{reviewCategory} \u00b7 {text('Retired')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>{action('Save changes',()=>{const api=client.current!;void run(()=>api.review(active,note.id,reviewStatus,note.risk_label,reviewCategory),()=>{contributions.refresh();setEditing('');});})}{action('Cancel',()=>setEditing(''))}</div>}\n      </article>)}\n      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}\n    </React.Fragment>}\n",
              "after": "        {invites.map(item=><div key={item.id} style={card}><span>{item.role} \u00b7 {item.uses}/{item.max_uses} \u00b7 {item.expires_at}</span>{action('Revoke invitation',()=>{const api=client.current!;void run(async()=>{await api.revokeInvite(active,item.id);return api.invites(active);},setInvites);})}</div>)}\n        {members.map(member=><div key={member.user_id} style={card}><span>{member.user_id} \u00b7 {member.role}</span>{action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}{action('Remove member',()=>setRemoval({kind:'member',id:member.user_id}))}</div>)}\n      </details>}\n      <div ref={resultsRef} tabIndex={-1} role=\"region\" aria-label={text('Loaded contributions')} style={row}><h3 style={headingStyle}>{text('Loaded contributions')} ({records.length})</h3>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>\n      {records.map(note=><WorkspaceContributionCard key={note.id} note={note} color={categories.find(category=>category.name===note.category)?.color||'#f5a623'}\n        busy={busy} own={note.author_id===client.current?.userId} ownerContribution={note.author_id===workspace.owner_id}\n        canEdit={owner||canWrite&&note.author_id===client.current?.userId} canRemove={owner||canWrite&&note.author_id===client.current?.userId}\n        onShow={()=>onFocus(communityNoteTarget(note,categories,workspace.name))}\n        onEdit={()=>{setEditing(note.id);setReviewStatus(note.status);setReviewCategory(note.category);}}\n        onRemove={()=>setRemoval({kind:'note',id:note.id})}>\n        {editing===note.id&&<div role=\"group\" aria-label={text('Edit contribution')} style={{...sectionStyle,borderColor:'#8bbba1'}}><strong>{text('Edit contribution')}</strong><label style={field}>{text('Status')}<select aria-label={text('Status')} style={input} value={reviewStatus} onChange={event=>setReviewStatus(event.target.value)}>{statusOptions.map(([value,label])=><option key={value} value={value}>{text(label)}</option>)}</select></label><label style={field}>{text('Contribution category')}<select aria-label={text('Edit contribution category')} style={input} value={reviewCategory} onChange={event=>setReviewCategory(event.target.value)}>{!activeCategories.some(category=>category.name===reviewCategory)&&<option value={reviewCategory}>{reviewCategory} \u00b7 {text('Retired')}</option>}{activeCategories.map(category=><option key={category.name} value={category.name}>{category.name}</option>)}</select></label>{action('Save changes',()=>{const api=client.current!;void run(()=>api.review(active,note.id,reviewStatus,note.risk_label,reviewCategory),()=>{contributions.refresh();setEditing('');});})}{action('Cancel',()=>setEditing(''))}</div>}\n      </WorkspaceContributionCard>)}\n      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}\n    </React.Fragment>}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceCategoryEditor.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { WorkspaceCategory } from './communityWorkspace';\nimport { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button } from '../../styles/communityWorkspace';\n\n/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring\n * a category preserves its old assignments/color while preventing new use.\n * RLS and the operator RPC enforce ownership even when UI controls are bypassed.\n */\nexport function WorkspaceCategoryEditor({categories,busy,onSave}:{categories:readonly WorkspaceCategory[];busy:boolean;onSave(name:string,color:string,archived:boolean):void}) {\n  const {owned:text}=useWidgetLocale();\n  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');\n  return <details style={card}><summary>{text('Manage workspace categories')}</summary>\n    <p>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>\n    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>\n    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type=\"color\" value={color} onChange={event=>setColor(event.target.value)} /></label>\n    <button type=\"button\" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>\n    {categories.map(category=><div key={category.name} style={row}>\n      <span aria-hidden=\"true\" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5',flexShrink:0}} />\n      <span style={{overflowWrap:'anywhere'}}>{category.name}{category.archived?` \u00b7 ${text('Retired')}`:''}</span>\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>{setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>\n    </div>)}\n  </details>;\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { WorkspaceCategory } from './communityWorkspace';\nimport { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';\n\n/** Owner-only taxonomy editor. Existing names are never renamed/deleted: retiring\n * a category preserves its old assignments/color while preventing new use.\n * RLS and the operator RPC enforce ownership even when UI controls are bypassed.\n */\nexport function WorkspaceCategoryEditor({categories,busy,onSave,sectionRef}:{sectionRef?:React.RefObject<HTMLDetailsElement>;categories:readonly WorkspaceCategory[];busy:boolean;onSave(name:string,color:string,archived:boolean):void}) {\n  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(false);\n  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');\n  return <details ref={sectionRef} style={sectionStyle}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>\n    <p>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>\n    {editing&&<strong>{text('Editing category')}: {name}</strong>}\n    <button type=\"button\" style={secondary} onClick={()=>{setEditing(false);setName('');setColor('#f5a623');}}>{text('Add a new category')}</button>\n    <label style={field}>{text('Category name')}<input aria-label={text('Category name')} style={input} readOnly={editing} maxLength={120} value={name} onChange={event=>setName(event.target.value)} /></label>\n    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type=\"color\" value={color} onChange={event=>setColor(event.target.value)} /></label>\n    <button type=\"button\" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>\n    {categories.map(category=><div key={category.name} style={row}>\n      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>{setEditing(true);setName(category.name);setColor(category.color);}}>{text('Edit color')}</button>\n      <button type=\"button\" style={button} disabled={busy} onClick={()=>onSave(category.name,category.color,!category.archived)}>{text(category.archived?'Restore category':'Retire category')}</button>\n    </div>)}\n  </details>;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceContributionTools.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "import { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { ContributionStatistics, WorkspaceCategory } from './communityWorkspace';\nimport { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button } from '../../styles/communityWorkspace';\n\n/** Exact server totals and explicit loaded-result scope; color is paired with text.\n * Search runs on the service, including contributions outside the loaded page.\n */\nexport function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,onQuery,onMine}:{statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;onQuery(value:string):void;onMine(value:boolean):void}) {\n  const {owned:text}=useWidgetLocale();\n  return <div style={card}>\n    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>\n      <span>{text('Total contributions')}: {statistics.total}</span><span>{text('My contributions')}: {statistics.mine}</span><span>{text('Contributors')}: {statistics.contributors}</span>\n    </div><details><summary>{text('Category and status statistics')}</summary>\n      {categories.map(category=><div key={category.name} style={row}><span aria-hidden=\"true\" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5'}} />{category.name}: {statistics.by_category[category.name]||0}</div>)}\n      {Object.entries(statistics.by_status).map(([status,count])=><span key={status} style={{display:'block'}}>{text(({open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'} as Record<string,string>)[status]||status)}: {count}</span>)}\n    </details></React.Fragment>}\n    <label style={field}>{text('Search contributions')}<input aria-label={text('Search contributions')} style={input} type=\"search\" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} placeholder={text('Category, description, status or resolution')} /></label>\n    {query&&<button type=\"button\" style={button} onClick={()=>onQuery('')}>{text('Clear search')}</button>}\n    <label><input type=\"checkbox\" checked={mine} onChange={event=>onMine(event.target.checked)} /> {text('Only my contributions')}</label>\n    <span role=\"status\">{busy?text('Loading contributions\u2026'):statistics?`${loaded} / ${statistics.matching} ${text('matching contributions loaded on map')}`:text('Contributions have not loaded.')}</span>\n    {statistics&&loaded<statistics.matching&&<small>{text('The map shows loaded results. Load more to display the remaining matches.')}</small>}\n  </div>;\n}\n",
              "after": "import { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { ContributionStatistics, WorkspaceCategory } from './communityWorkspace';\nimport { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceHeadingStyle as headingStyle, workspaceSummaryStyle as summaryStyle } from '../../styles/communityWorkspace';\n\n/** Exact server totals and explicit loaded-result scope; color is paired with text.\n * Search runs on the service, including contributions outside the loaded page.\n */\nexport function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,waiting,onComposition,onSubmit,onClear,onQuery,onMine}:{statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;waiting:boolean;onComposition(value:boolean):void;onSubmit():void;onClear():void;onQuery(value:string):void;onMine(value:boolean):void}) {\n  const {owned:text}=useWidgetLocale();\n  return <div style={sectionStyle}>\n    <h3 style={headingStyle}>{text('Find contributions')}</h3>\n    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>\n      <span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Total contributions')}: {statistics.total}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('My contributions')}: {statistics.mine}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Contributors')}: {statistics.contributors}</span>\n    </div><details><summary style={summaryStyle}>{text('Category and status statistics')}</summary>\n      {categories.map(category=><div key={category.name} style={row}><span aria-hidden=\"true\" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5'}} />{category.name}: {statistics.by_category[category.name]||0}</div>)}\n      {Object.entries(statistics.by_status).map(([status,count])=><span key={status} style={{display:'block'}}>{text(({open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'} as Record<string,string>)[status]||status)}: {count}</span>)}\n    </details></React.Fragment>}\n    <label style={field}>{text('Search contributions')}<input aria-label={text('Search contributions')} style={input} type=\"search\" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} onCompositionStart={()=>onComposition(true)} onCompositionEnd={event=>{onQuery(event.currentTarget.value);onComposition(false);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();onSubmit();}}} placeholder={text('Category, description, status or resolution')} /></label>\n    {query&&<button type=\"button\" style={button} onClick={onClear}>{text('Clear search')}</button>}\n    <label><input type=\"checkbox\" checked={mine} onChange={event=>onMine(event.target.checked)} /> {text('Only my contributions')}</label>\n    <span role=\"status\">{waiting?text('Search starts after you stop typing. Press Enter to search now.'):busy?text('Loading contributions\u2026'):statistics?`${loaded} / ${statistics.matching} ${text('matching contributions loaded on map')}`:text('Contributions have not loaded.')}</span>\n    {statistics&&loaded<statistics.matching&&<small>{text('The map shows loaded results. Load more to display the remaining matches.')}</small>}\n  </div>;\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/communityWorkspace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "import type { React } from 'jimu-core';\n/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */\nexport const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:8,minHeight:0,overflowY:'auto',overflowX:'hidden',fontSize:11,color:'#d3e2d9'};\nexport const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:6,padding:8,border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};\nexport const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};\nexport const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};\nexport const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};\nexport const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'5px 8px',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};\n",
              "after": "import type { React } from 'jimu-core';\n/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */\nexport const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:8,minHeight:0,overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};\nexport const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:10,background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};\nexport const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};\nexport const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};\nexport const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};\nexport const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:32,justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};\n\n/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */\nexport const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'#13251e',borderColor:'#49695a'};\nexport const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};\nexport const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};\nexport const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};\nexport const workspaceHeadingStyle: React.CSSProperties = {fontSize:14,fontWeight:700,lineHeight:1.4,margin:0,color:'#f0f7f3'};\nexport const workspaceContributionCardStyle: React.CSSProperties = {...workspaceCardStyle,padding:12,gap:9,background:'#1b3027',borderColor:'#567363'};\nexport const workspaceStatusBadgeStyle: React.CSSProperties = {display:'inline-flex',padding:'3px 7px',borderRadius:5,fontSize:11,fontWeight:600,background:'#303f38',color:'#ecf3ef'};\n/** Pair category color with readable text; long names wrap at controller widths. */\nexport const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,\n  padding:'4px 8px',borderRadius:5,border:'1px solid '+color,background:color+'26',color:'#f3f8f5',fontWeight:700,fontSize:12,minWidth:0,maxWidth:'100%',overflowWrap:'anywhere'});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/fieldNoteMap.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": " return{w,trace,groups,layers,loads,views,view,Group,Layer,draw:()=>w.drawFieldNoteGraphics(),ensure:v=>w.ensureFieldNotesGroup(v||w.state.jimuMapView.view),clear:()=>w.clearFieldNotesGroup(),group:()=>kind==='baseline'?w._fieldNotesGroup:w._fieldNoteMap.group,layer:()=>kind==='baseline'?w._fieldNotesLayer:w._fieldNoteMap.layer,visible:()=>kind==='baseline'?w._fieldNotesGroupVisible:w._fieldNoteMap.visible,resolve:i=>loads[i].resolve([loads[i].kind==='group'?Group:Layer]),graphicFailure:value=>graphicFailure=value};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);// Popups intentionally gain structured fields; geometry/symbol/lifecycle stay frozen.\n const normalize=g=>({...structuredClone(g),attributes:{id:g.attributes.id,category:g.attributes.category,note:g.attributes.note},popupTemplate:undefined});\n const trace=items=>items.map(item=>item[0]==='graphic'?[item[0],item[1],normalize(item[2])]:item);\n assert.deepEqual(trace(b.trace),trace(a.trace));assert.deepEqual(b.layers.map(l=>l.graphics.map(normalize)),a.layers.map(l=>l.graphics.map(normalize)));assert.equal(b.visible(),a.visible());return b}\ntest('2D/3D exact local descriptors, group/layer properties, child attachment and drawing order match',async()=>{for(const type of ['2d','3d'])await compare(async h=>{await h.draw();assert.equal(h.groups.length,1);assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics.length,2);assert.equal(h.layers[0].graphics[0].geometry.hasZ,type==='3d')},{type})});\ntest('repeated draws reuse layer/group and rebuild current notes without duplicate attachment',async()=>{await compare(async h=>{await h.draw();h.w.state.fieldNotes=[note('new')];await h.draw();assert.equal(h.layers.length,1);assert.equal(h.groups.length,1);assert.equal(h.trace.filter(x=>x[0]==='child-add').length,1);assert.equal(h.layers[0].graphics.length,1)})});\ntest('concurrent first draws retain original graphics loads and shared group acquisition',async()=>{await compare(async h=>{const a=h.draw(),b=h.draw();assert.equal(h.loads.length,2);h.resolve(0);h.resolve(1);await flush();assert.equal(h.loads.length,3);h.resolve(2);await Promise.all([a,b]);assert.equal(h.layers.length,1);assert.equal(h.groups.length,1)},{hold:true})});\ntest('missing/destroyed map or SDK readiness skips draw module loading',async()=>{for(const mode of ['view','map','destroyed','sdk'])await compare(async h=>{if(mode==='view')h.w.state.jimuMapView=null;if(mode==='map')h.views[0].map=null;if(mode==='destroyed')h.views[0].destroyed=true;if(mode==='sdk')h.w.ArcGISModules=null;await h.draw();assert.equal(h.loads.length,0)})});\n",
              "after": " return{w,trace,groups,layers,loads,views,view,Group,Layer,draw:()=>w.drawFieldNoteGraphics(),ensure:v=>w.ensureFieldNotesGroup(v||w.state.jimuMapView.view),clear:()=>w.clearFieldNotesGroup(),group:()=>kind==='baseline'?w._fieldNotesGroup:w._fieldNoteMap.group,layer:()=>kind==='baseline'?w._fieldNotesLayer:w._fieldNoteMap.layer,visible:()=>kind==='baseline'?w._fieldNotesGroupVisible:w._fieldNoteMap.visible,resolve:i=>loads[i].resolve([loads[i].kind==='group'?Group:Layer]),graphicFailure:value=>graphicFailure=value};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);// Popups intentionally gain structured fields; geometry/symbol/lifecycle stay frozen.\n const normalize=g=>({...structuredClone(g),symbol:g.symbol.type==='point-3d'?{type:'simple-marker',style:'diamond',color:g.symbol.symbolLayers[0].material.color,size:g.symbol.symbolLayers[0].size,outline:{color:'white',width:1.5}}:g.symbol,attributes:{id:g.attributes.id,category:g.attributes.category,note:g.attributes.note},popupTemplate:undefined});\n const trace=items=>items.map(item=>item[0]==='graphic'?[item[0],item[1],normalize(item[2])]:item);\n assert.deepEqual(trace(b.trace),trace(a.trace));assert.deepEqual(b.layers.map(l=>l.graphics.map(normalize)),a.layers.map(l=>l.graphics.map(normalize)));assert.equal(b.visible(),a.visible());return b}\ntest('local geometry, source colors, group/layer properties and drawing order preserve legacy behavior',async()=>{for(const type of ['2d','3d'])await compare(async h=>{await h.draw();assert.equal(h.groups.length,1);assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics.length,2);assert.equal(h.layers[0].graphics[0].geometry.hasZ,type==='3d')},{type})});\ntest('repeated draws reuse layer/group and rebuild current notes without duplicate attachment',async()=>{await compare(async h=>{await h.draw();h.w.state.fieldNotes=[note('new')];await h.draw();assert.equal(h.layers.length,1);assert.equal(h.groups.length,1);assert.equal(h.trace.filter(x=>x[0]==='child-add').length,1);assert.equal(h.layers[0].graphics.length,1)})});\ntest('concurrent first draws retain original graphics loads and shared group acquisition',async()=>{await compare(async h=>{const a=h.draw(),b=h.draw();assert.equal(h.loads.length,2);h.resolve(0);h.resolve(1);await flush();assert.equal(h.loads.length,3);h.resolve(2);await Promise.all([a,b]);assert.equal(h.layers.length,1);assert.equal(h.groups.length,1)},{hold:true})});\ntest('missing/destroyed map or SDK readiness skips draw module loading',async()=>{for(const mode of ['view','map','destroyed','sdk'])await compare(async h=>{if(mode==='view')h.w.state.jimuMapView=null;if(mode==='map')h.views[0].map=null;if(mode==='destroyed')h.views[0].destroyed=true;if(mode==='sdk')h.w.ArcGISModules=null;await h.draw();assert.equal(h.loads.length,0)})});\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "});\n\ntest('native highlight is released on another click while its normal marker stays selectable',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusNote(note('workspace:a'));const event=h.trace.find(x=>x[0]==='native-highlight');assert(event);h.w._fieldNoteMap.clearHighlight();assert.equal(event[2].removed,true);assert.equal(h.layers[0].graphics.length,1);assert.equal(h.layers[0].graphics[0].symbol.size,13);\n});\ntest('clearing while SDK loads prevents a late highlight or popup',async()=>{\n const h=setup('working',{hold:true});const pending=h.w._fieldNoteMap.focusNote(note('workspace:a'));h.resolve(0);await flush();h.w._fieldNoteMap.clearHighlight();h.resolve(1);await pending;assert.equal(h.trace.filter(x=>x[0]==='native-highlight').length,0);\n",
              "after": "});\n\ntest('native highlight is released on another click while its normal marker stays selectable',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusNote(note('workspace:a'));const event=h.trace.find(x=>x[0]==='native-highlight');assert(event);h.w._fieldNoteMap.clearHighlight();assert.equal(event[2].removed,true);assert.equal(h.layers[0].graphics.length,1);assert.equal(h.layers[0].graphics[0].symbol.symbolLayers[0].size,13);\n});\ntest('clearing while SDK loads prevents a late highlight or popup',async()=>{\n const h=setup('working',{hold:true});const pending=h.w._fieldNoteMap.focusNote(note('workspace:a'));h.resolve(0);await flush();h.w._fieldNoteMap.clearHighlight();h.resolve(1);await pending;assert.equal(h.trace.filter(x=>x[0]==='native-highlight').length,0);\n"
            },
            {
              "label": "Workspace contributions 3",
              "before": "test('all loaded workspace contributions appear without Show on map and selection reuses a real marker',async()=>{\n const h=setup('working');h.w.state.fieldNotes=[];const one=note('workspace:owner',{workspace:{id:'w',name:'Survey',authorId:'owner',color:'#e53935'}}),two=note('workspace:peer',{workspace:{id:'w',name:'Survey',authorId:'peer',color:'#1565c0'}});\n await h.w._fieldNoteMap.setWorkspaceNotes([one,two],[{name:'Other',color:'#e53935'}],'Survey');\n const layer=h.layers.find(l=>l.id==='workspace-contributions');assert.equal(layer.graphics.length,2);assert.equal(layer.graphics[0].symbol.color,'#e53935');assert.equal(layer.graphics[1].symbol.color,'#1565c0');\n await h.w._fieldNoteMap.focusNote(two);assert.equal(h.layers.length,1);assert.equal(h.trace.filter(e=>e[0]==='native-highlight').length,1);\n assert.equal(h.w._fieldNoteMap.noteForGraphic({layer,attributes:{id:two.id}}),two);assert.equal(h.w.state.fieldNotes.length,0);\n await h.w._fieldNoteMap.setWorkspaceNotes([],[],'');assert.equal(layer.graphics.length,0);assert.equal(h.w._fieldNoteMap.hasPickTargets,false);\n",
              "after": "test('all loaded workspace contributions appear without Show on map and selection reuses a real marker',async()=>{\n const h=setup('working');h.w.state.fieldNotes=[];const one=note('workspace:owner',{workspace:{id:'w',name:'Survey',authorId:'owner',color:'#e53935'}}),two=note('workspace:peer',{workspace:{id:'w',name:'Survey',authorId:'peer',color:'#1565c0'}});\n await h.w._fieldNoteMap.setWorkspaceNotes([one,two],[{name:'Other',color:'#e53935'}],'Survey');\n const layer=h.layers.find(l=>l.id==='workspace-contributions');assert.equal(layer.graphics.length,2);assert.equal(layer.graphics[0].symbol.symbolLayers[0].material.color,'#e53935');assert.equal(layer.graphics[1].symbol.symbolLayers[0].material.color,'#1565c0');\n await h.w._fieldNoteMap.focusNote(two);assert.equal(h.layers.length,1);assert.equal(h.trace.filter(e=>e[0]==='native-highlight').length,1);\n assert.equal(h.w._fieldNoteMap.noteForGraphic({layer,attributes:{id:two.id}}),two);assert.equal(h.w.state.fieldNotes.length,0);\n await h.w._fieldNoteMap.setWorkspaceNotes([],[],'');assert.equal(layer.graphics.length,0);assert.equal(h.w._fieldNoteMap.hasPickTargets,false);\n"
            },
            {
              "label": "Workspace contributions 4",
              "before": " const props=descriptor.exports.buildLocalNoteGraphic(note('workspace:a',{status:'in_progress',workspace:{name:'Survey',color:'#1565c0',authorId:'peer'}}),false);\n assert.equal(props.attributes.status,'In progress');const fields=props.popupTemplate.content[0].fieldInfos.map(field=>field.fieldName);for(const field of ['category','status','note','workspace','author'])assert(fields.includes(field));\n});\n",
              "after": " const props=descriptor.exports.buildLocalNoteGraphic(note('workspace:a',{status:'in_progress',workspace:{name:'Survey',color:'#1565c0',authorId:'peer'}}),false);\n assert.equal(props.attributes.status,'In progress');const fields=props.popupTemplate.content[0].fieldInfos.map(field=>field.fieldName);for(const field of ['category','status','note','workspace','author'])assert(fields.includes(field));\n});\n\ntest('all note sources use screen-facing icons in 3D and retain their real anchor/altitude',()=>{\n for(const extra of [{},{workspace:{name:'Survey',color:'#1565c0',authorId:'peer'}}]){\n const target=note('note',extra),symbol=descriptor.exports.buildLocalNoteGraphic(target,true);\n assert.equal(symbol.symbol.type,'point-3d');assert.equal(symbol.symbol.symbolLayers[0].type,'icon');assert.equal(symbol.symbol.symbolLayers[0].anchor,'center');assert.equal(symbol.symbol.symbolLayers[0].resource.primitive,'kite');assert.equal(symbol.geometry.z,3);assert.equal(symbol.geometry.hasZ,true);\n const flat=descriptor.exports.buildLocalNoteGraphic(target,false);assert.equal(flat.symbol.type,'simple-marker');assert.equal(flat.symbol.style,'diamond');\n }\n});\n\ntest('selected notes use ground placement unless a real altitude is stored',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusNote(note('workspace:ground',{alt:undefined}));assert.equal(h.layers[0].elevationInfo.mode,'on-the-ground');\n await h.w._fieldNoteMap.focusNote(note('local:measured',{alt:123}));assert.equal(h.layers[0].elevationInfo.mode,'absolute-height');assert.equal(h.layers[0].graphics[0].geometry.z,123);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/communityWorkspace.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "  await page.getByLabel('Workspace name',{exact:true}).fill('Survey project');await page.getByLabel('Operator contact',{exact:true}).fill('Project contact');await page.getByRole('button',{name:'Create workspace',exact:true}).click();await page.getByText('Your role: Owner',{exact:true}).waitFor();checks++;\n  assert.equal(requests.filter(item=>item.path==='/rest/v1/mly_workspace_notes'&&item.method==='POST').length,0);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);checks++;\n  await page.getByText('Publish a local note',{exact:true}).click();await page.getByLabel('Local note',{exact:true}).selectOption('local-1');assert.equal(await page.getByRole('button',{name:'Publish selected note',exact:true}).isEnabled(),false);checks++;\n  await page.getByText('Manage workspace categories',{exact:true}).click();await page.getByLabel('Category name',{exact:true}).fill('Inspection');await page.getByLabel('Category color',{exact:true}).fill('#e53935');await page.getByRole('button',{name:'Save category',exact:true}).click();await page.getByRole('option',{name:'Inspection',exact:true}).waitFor({state:'attached'});checks++;\n  assert.equal(await page.getByLabel('Risk opinion',{exact:true}).count(),0);await page.getByRole('button',{name:'Publish selected note',exact:true}).click();await page.getByText('Note published.',{exact:true}).waitFor();assert.equal(records.length,1);assert.equal(records[0].category,'Inspection');assert.equal(records[0].risk_label,null);checks++;\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes[0].workspace.color),'#e53935');assert.equal(await page.evaluate(()=>focused.length),0);checks++;\n  await page.getByRole('button',{name:'Show on map',exact:true}).click();assert.equal(await page.evaluate(()=>focused[0].imageId),'123');checks++;\n  records[0].risk_label='high';await page.getByRole('button',{name:'Refresh notes',exact:true}).click();await page.getByText('Legacy risk assessment: High risk',{exact:true}).waitFor();\n  await page.getByRole('button',{name:'Update contribution',exact:true}).click();await page.getByLabel('Status',{exact:true}).selectOption('completed');await page.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByText('Status: Completed',{exact:true}).waitFor();assert.equal(records[0].risk_label,'high');checks++;\n",
              "after": "  await page.getByLabel('Workspace name',{exact:true}).fill('Survey project');await page.getByLabel('Operator contact',{exact:true}).fill('Project contact');await page.getByRole('button',{name:'Create workspace',exact:true}).click();await page.getByText('Your role: Owner',{exact:true}).waitFor();checks++;\n  assert.equal(requests.filter(item=>item.path==='/rest/v1/mly_workspace_notes'&&item.method==='POST').length,0);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);checks++;\n  await page.getByText('Publish a local note',{exact:true}).click();await page.getByLabel('Local note',{exact:true}).selectOption('local-1');assert.equal(await page.getByRole('button',{name:'Publish selected note',exact:true}).isEnabled(),false);checks++;\n  assert.equal(await page.getByText('Connection and workspace settings',{exact:true}).evaluate(node=>node.parentElement.open),false);checks++;\n  await page.getByRole('button',{name:'Edit categories',exact:true}).click();assert.equal(await page.getByText('Manage workspace categories',{exact:true}).evaluate(node=>node.parentElement.open),true);checks++; await page.getByLabel('Category name',{exact:true}).fill('Inspection');await page.getByLabel('Category color',{exact:true}).fill('#e53935');await page.getByRole('button',{name:'Save category',exact:true}).click();await page.getByRole('option',{name:'Inspection',exact:true}).waitFor({state:'attached'});checks++;\n  assert.equal(await page.getByLabel('Risk opinion',{exact:true}).count(),0);await page.getByRole('button',{name:'Publish selected note',exact:true}).click();await page.getByText('Note published.',{exact:true}).waitFor();assert.equal(records.length,1);assert.equal(records[0].category,'Inspection');assert.equal(records[0].risk_label,null);checks++;\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes[0].workspace.color),'#e53935');assert.equal(await page.evaluate(()=>focused.length),0);checks++;\n  await page.getByRole('button',{name:'Read contributions',exact:true}).click();assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Loaded contributions');checks++;\n  await page.getByRole('button',{name:'Show on map',exact:true}).click();assert.equal(await page.evaluate(()=>focused[0].imageId),'123');checks++;\n  records[0].risk_label='high';await page.getByRole('button',{name:'Refresh notes',exact:true}).click();await page.getByText('Legacy risk assessment: High risk',{exact:true}).waitFor();\n  await page.getByRole('button',{name:'Update contribution',exact:true}).click();await page.getByLabel('Status',{exact:true}).selectOption('completed');await page.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByText('Status: Completed',{exact:true}).waitFor();assert.equal(records[0].risk_label,'high');checks++;\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "  for(let i=0;i<55;i++)records.push({...records[0],id:'50000000-0000-4000-8000-'+String(i).padStart(12,'0'),source_id:'extra-'+i,author_id:i===54?member:owner,note_text:i===54?'Hidden match beyond first page':'Other observation '+i});\n  await page.getByRole('button',{name:'Refresh notes',exact:true}).click();await page.getByText('Total contributions: 56',{exact:true}).waitFor();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50);assert.equal(await page.getByText('My contributions: 1',{exact:true}).count(),1);checks++;\n  await page.getByRole('button',{name:'Load more notes',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===56);checks++;\n  await page.getByLabel('Search contributions',{exact:true}).fill('Hidden match');await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1&&mapSnapshots.at(-1)?.notes[0].note==='Hidden match beyond first page');assert.equal(await page.getByRole('button',{name:'Show on map',exact:true}).count(),1);assert.equal(await page.getByText('Total contributions: 56',{exact:true}).count(),1);checks++;\n  await page.getByRole('button',{name:'Clear search',exact:true}).click();await page.getByLabel('Only my contributions',{exact:true}).check();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1&&mapSnapshots.at(-1)?.notes[0].workspace.authorId==='10000000-0000-4000-8000-000000000002');checks++;\n  await page.getByLabel('Only my contributions',{exact:true}).uncheck();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50);checks++;\n  records.unshift({...records[0],id:'60000000-0000-4000-8000-000000000001',source_id:'concurrent',note_text:'New contribution while paging'});\n  await page.getByRole('button',{name:'Load more notes',exact:true}).click();await page.getByText('Total contributions: 57',{exact:true}).waitFor();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes[0]?.note==='New contribution while paging');\n  await page.getByRole('button',{name:'Load more notes',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===57);checks++;\n\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(await page.getByText('1 of 1 notes',{exact:true}).count(),1);await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.evaluate(()=>{document.getElementById('root').style.width='240px';});assert.equal(await page.getByRole('combobox',{name:'Workspace',exact:true}).evaluate(node=>{const r=node.getBoundingClientRect(),p=document.getElementById('root').getBoundingClientRect();return r.left>=p.left&&r.right<=p.right;}),true);checks++;\n  await page.evaluate(()=>setListOpen(false));assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),0);await page.evaluate(()=>setListOpen(true));await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n",
              "after": "  for(let i=0;i<55;i++)records.push({...records[0],id:'50000000-0000-4000-8000-'+String(i).padStart(12,'0'),source_id:'extra-'+i,author_id:i===54?member:owner,note_text:i===54?'Hidden match beyond first page':'Other observation '+i});\n  await page.getByRole('button',{name:'Refresh notes',exact:true}).click();await page.getByText('Total contributions: 56',{exact:true}).waitFor();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50);assert.equal(await page.getByText('My contributions: 1',{exact:true}).count(),1);checks++;\n  await page.getByRole('button',{name:'Load more notes',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===56);checks++;\n  const beforeTyping=requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length;\n  await page.getByLabel('Search contributions',{exact:true}).pressSequentially('Hidden match',{delay:110});await page.waitForTimeout(350);\n  assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeTyping);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes.length),56);checks++;\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1&&mapSnapshots.at(-1)?.notes[0].note==='Hidden match beyond first page');assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeTyping+1);assert.equal(await page.getByRole('button',{name:'Show on map',exact:true}).count(),1);assert.equal(await page.getByText('Total contributions: 56',{exact:true}).count(),1);checks++;\n  const beforeComposition=requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length;\n  await page.getByLabel('Search contributions',{exact:true}).dispatchEvent('compositionstart');await page.getByLabel('Search contributions',{exact:true}).fill('Other observation');await page.waitForTimeout(850);assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeComposition);checks++;\n  await page.getByLabel('Search contributions',{exact:true}).dispatchEvent('compositionend',{data:'Other observation'});await page.getByLabel('Search contributions',{exact:true}).press('Enter');await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50&&mapSnapshots.at(-1).notes.every(note=>note.note.startsWith('Other observation')));checks++;\n  await page.getByRole('button',{name:'Clear search',exact:true}).click();await page.getByLabel('Only my contributions',{exact:true}).check();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1&&mapSnapshots.at(-1)?.notes[0].workspace.authorId==='10000000-0000-4000-8000-000000000002');checks++;\n  await page.getByLabel('Only my contributions',{exact:true}).uncheck();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50);checks++;\n  records.unshift({...records[0],id:'60000000-0000-4000-8000-000000000001',source_id:'concurrent',note_text:'New contribution while paging'});\n  await page.getByRole('button',{name:'Load more notes',exact:true}).click();await page.getByText('Total contributions: 57',{exact:true}).waitFor();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes[0]?.note==='New contribution while paging');\n  await page.getByRole('button',{name:'Load more notes',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===57);checks++;\n\n  if(process.env.WORKSPACE_CAPTURE_PATH){await page.evaluate(()=>{Object.assign(document.getElementById('root').style,{width:'600px',height:'900px'});});await page.getByRole('button',{name:'Expand notes panel',exact:true}).click();await page.getByRole('tabpanel',{name:'Workspace notes',exact:true}).evaluate(node=>node.scrollTop=0);await page.screenshot({path:process.env.WORKSPACE_CAPTURE_PATH,fullPage:true});}\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(await page.getByText('1 of 1 notes',{exact:true}).count(),1);await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.evaluate(()=>{document.getElementById('root').style.width='240px';});assert.equal(await page.getByLabel('Search contributions',{exact:true}).evaluate(node=>{const r=node.getBoundingClientRect(),p=document.getElementById('root').getBoundingClientRect();return r.left>=p.left&&r.right<=p.right;}),true);checks++;\n  await page.evaluate(()=>setListOpen(false));assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),0);await page.evaluate(()=>setListOpen(true));await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/WORKSPACE-CONTRIBUTIONS.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "\n**Total contributions**, **My contributions**, **Contributors**, and category/status counts cover the entire authorized workspace. Contributors means distinct authors who have published, including the owner. These totals do not change meaning when filters are active. The matching count reflects the current search/mine filter.\n\nSearch is a literal case-insensitive substring across category, description, workflow status values and resolution. It runs on the service, including records outside the loaded page. Typing is debounced 250 ms; retired reads are aborted and late responses cannot replace current results. Only my contributions is also server-filtered.\n\nResults load 50 at a time. The map and list show the same loaded matching records, not an invisible cap presented as the workspace total. **Load more notes** adds the remaining matching pages. Exact totals and a loaded/matching message explain the distinction. Export includes the loaded matching records. Refresh notes retrieves updates from other members; this release does not add real-time polling or background synchronization.\n\n",
              "after": "\n**Total contributions**, **My contributions**, **Contributors**, and category/status counts cover the entire authorized workspace. Contributors means distinct authors who have published, including the owner. These totals do not change meaning when filters are active. The matching count reflects the current search/mine filter.\n\nSearch is a literal case-insensitive substring across category, description, workflow status values and resolution. It runs on the service, including records outside the loaded page. Typing is debounced 700 ms with composition-aware input and Enter to search immediately; retired reads are aborted and late responses cannot replace current results. Only my contributions is also server-filtered.\n\nResults load 50 at a time. The map and list show the same loaded matching records, not an invisible cap presented as the workspace total. **Load more notes** adds the remaining matching pages. Exact totals and a loaded/matching message explain the distinction. Export includes the loaded matching records. Refresh notes retrieves updates from other members; this release does not add real-time polling or background synchronization.\n\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "Targeted tests use actual PostgreSQL through PGlite, React/Chromium service fixtures, and recording ArcGIS objects. No real service deployment or full Experience Builder build is performed here. Live provider/SDK checks remain part of operator testing.\n\n`uninstall-workspace-contributions.cjs` restores the exact pre-install source. It intentionally leaves backend data and migration 003 in place. The older client still must honor the backend's active-category rules: its local-note category must match an active workspace category to publish. Do not remove operator tables/triggers or downgrade schemas automatically to work around a client rollback.\n",
              "after": "Targeted tests use actual PostgreSQL through PGlite, React/Chromium service fixtures, and recording ArcGIS objects. No real service deployment or full Experience Builder build is performed here. Live provider/SDK checks remain part of operator testing.\n\n`uninstall-workspace-contributions.cjs` restores the exact pre-install source. It intentionally leaves backend data and migration 003 in place. The older client still must honor the backend's active-category rules: its local-note category must match an active workspace category to publish. Do not remove operator tables/triggers or downgrade schemas automatically to work around a client rollback.\n\nSee `docs/WORKSPACE-READABILITY.md` for consistent screen-facing 3D icons, stable search results, category badges and task navigation.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/README.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "\n## General contribution discovery\n\nMigration 003 adds owner-defined, colored categories and exact workspace queries/statistics. `useWorkspaceContributions.ts` owns independent, abortable read generations and 250 ms server-search debounce. `WorkspaceCategoryEditor.tsx` and `WorkspaceContributionTools.tsx` keep taxonomy and discovery UI separate from auth/member/write orchestration. The panel sends authorized loaded results through `onMapNotes` to the existing map owner; credentials never cross that callback. All loaded authors are drawn automatically. Map/list paging is explicit (50 records), with accurate full-workspace totals and matching counts. Existing risks are legacy read-only data in the UI; normal assignments use owner categories.\n\nSee `docs/WORKSPACE-CONTRIBUTIONS.md` for installation, semantics, limits and the complete contributor map. Refresh is explicit; this does not add polling or ambient service traffic. Category authorization/retirement and statistics membership remain server-enforced.\n",
              "after": "\n## General contribution discovery\n\nMigration 003 adds owner-defined, colored categories and exact workspace queries/statistics. `useWorkspaceContributions.ts` owns independent, abortable read generations and 700 ms server-search debounce. `WorkspaceCategoryEditor.tsx` and `WorkspaceContributionTools.tsx` keep taxonomy and discovery UI separate from auth/member/write orchestration. The panel sends authorized loaded results through `onMapNotes` to the existing map owner; credentials never cross that callback. All loaded authors are drawn automatically. Map/list paging is explicit (50 records), with accurate full-workspace totals and matching counts. Existing risks are legacy read-only data in the UI; normal assignments use owner categories.\n\nSee `docs/WORKSPACE-CONTRIBUTIONS.md` for installation, semantics, limits and the complete contributor map. Refresh is explicit; this does not add polling or ambient service traffic. Category authorization/retirement and statistics membership remain server-enforced.\n\nSee `docs/WORKSPACE-READABILITY.md` for consistent screen-facing 3D icons, stable search results, category badges and task navigation.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/FieldNoteMap.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace contributions 1",
              "before": "  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n  highlightNote?(view: V, layer: L, graphic: A, current: () => boolean): Promise<{ remove(): void }>;\n}\n\n",
              "after": "  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n  configureFocusLayer?(layer: L, hasMeasuredAltitude: boolean): void;\n  highlightNote?(view: V, layer: L, graphic: A, current: () => boolean): Promise<{ remove(): void }>;\n}\n\n"
            },
            {
              "label": "Workspace contributions 2",
              "before": "    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    const graphic = d.readGraphicFactory()(note, view.type === '3d');\n    layer.add(graphic);\n    if (d.highlightNote) {\n",
              "after": "    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    // Screen-facing symbols add no lift; honor only a genuinely stored altitude.\n    d.configureFocusLayer?.(layer,Number.isFinite(note.alt));\n    const graphic = d.readGraphicFactory()(note, view.type === '3d');\n    layer.add(graphic);\n    if (d.highlightNote) {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceCategoryBadge.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { getWorkspaceCategoryBadgeStyle } from '../../styles/communityWorkspace';\n\n/** A category remains recognizable by its label as well as its assigned color. */\nexport function WorkspaceCategoryBadge({name,color}:{name:string;color:string}) {\n  return <span style={getWorkspaceCategoryBadgeStyle(color)}><span aria-hidden=\"true\" style={{width:9,height:9,background:color,border:'1px solid #d8e8df',borderRadius:2,flexShrink:0}} />{name}</span>;\n}\n"
    },
    {
      "file": "src/features/community-notes/WorkspaceContributionCard.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport type { CommunityRecord } from './communityWorkspace';\nimport { WorkspaceCategoryBadge } from './WorkspaceCategoryBadge';\nimport { workspaceContributionCardStyle as card, workspaceRowStyle as row, workspaceButtonStyle as button,\n  workspaceSecondaryButtonStyle as secondary, workspaceDangerButtonStyle as danger, workspaceStatusBadgeStyle as statusBadge } from '../../styles/communityWorkspace';\n\ninterface Props {busy:boolean;note:CommunityRecord;color:string;own:boolean;ownerContribution:boolean;canEdit:boolean;canRemove:boolean;\n onShow():void;onEdit():void;onRemove():void;children?:React.ReactNode}\nconst statuses:Record<string,string>={open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'};\nconst legacy:Record<string,string>={high:'High risk',low:'Low risk',no_obvious_hazards:'No obvious hazards observed'};\n\n/** Separate category/status, author/date, readable content and next actions.\n * Ownership changes permissions and labels, never the marker's appearance.\n */\nexport function WorkspaceContributionCard({note,color,own,ownerContribution,canEdit,canRemove,onShow,onEdit,onRemove,children,busy}:Props){\n const {owned:text,formatLocale}=useWidgetLocale();\n return <article style={{...card,borderInlineStart:'4px solid '+color}}>\n  <div style={{...row,justifyContent:'space-between'}}><WorkspaceCategoryBadge name={note.category} color={color}/><span style={statusBadge}>{text('Status')}: {text(statuses[note.status]||note.status)}</span></div>\n  <div style={{...row,fontSize:10,color:'#bdd0c5'}}><span>{text(own?'Your contribution':ownerContribution?'Owner\u2019s contribution':'Member\u2019s contribution')}</span><span>{text('Last updated')}: {new Date(note.updated_at||note.created_at).toLocaleString(formatLocale)}</span></div>\n  <p style={{margin:0,fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{note.note_text}</p>\n  {note.resolution_note&&<div style={{fontSize:12,lineHeight:1.5}}><strong>{text('Resolution')}: </strong>{note.resolution_note}</div>}\n  {note.risk_label&&<small>{text('Legacy risk assessment')}: {text(legacy[note.risk_label]||note.risk_label)}</small>}\n  <div style={{...row,borderTop:'1px solid #496052',paddingTop:8}}>\n   <button type=\"button\" style={button} onClick={onShow}>{text('Show on map')}</button>\n   {canEdit&&<button type=\"button\" style={secondary} disabled={busy} onClick={onEdit}>{text('Update contribution')}</button>}\n   {canRemove&&<button type=\"button\" style={danger} disabled={busy} onClick={onRemove}>{text('Remove shared note')}</button>}\n  </div>\n  {children}\n </article>;\n}\n"
    },
    {
      "file": "docs/WORKSPACE-READABILITY.md",
      "content": "# Consistent note markers and workspace readability\n\nApply `apply-workspace-readability.cjs` from the widget root after the contribution update, then rebuild and reload. This is a client-only change: it does not require another SQL migration or change existing category assignments, risks, author rights, or stored coordinates. The contribution backend still requires migration 003 from the earlier update.\n\n## Marker contract\n\n`buildNoteSymbol` in `features/field-notes/mapGraphic.ts` supplies screen-facing PointSymbol3D icon layers for 3D and the existing SimpleMarker diamond for 2D. Local, Workspace and Enterprise notes use the same factory. Category/source color remains independent of ownership. Icons add no vertical offset, callout or volumetric geometry. The existing point/layer determines location. Selection remains ArcGIS's native layer-view highlight.\n\nWorkspace/ordinary selection layers anchor notes on the ground. If a selected local note has a genuinely measured altitude, the focus layer switches to absolute-height placement and preserves that point's Z instead of discarding it. Changing who is signed in does not alter rendering orientation.\n\n## Search contract\n\n`useWorkspaceContributions.ts` waits 700 ms after the last input change. Ordinary typing pauses no longer trigger the old 250 ms request cycle. Composition events suspend submission until IME input finishes. Enter submits immediately outside composition; Clear search resets immediately. Aborts and read generations still prevent retired responses from taking ownership.\n\nExisting results and map markers remain visible while the same workspace searches or refreshes. A waiting/loading message distinguishes pending input from applied results; errors, disconnection and workspace/session changes cannot retain another workspace's results. Pages and server-wide totals keep their existing meaning. Backend query semantics are unchanged.\n\n## Panel contract and contributor entry points\n\nConnection/workspace settings collapse after workspace selection and remain available in a labelled disclosure. The workspace action bar exposes Read contributions, Publish a note (writers), Edit categories (owners), and Refresh notes. Shortcuts open the correct section, scroll it into view and move keyboard focus there.\n\n- `WorkspaceContributionCard.tsx`: category badge, separate workflow badge, author/date, readable description, resolution, legacy assessment and distinct view/edit/remove actions. The panel still owns mutations/permissions.\n- `WorkspaceCategoryBadge.tsx`: labelled colored badges shared by cards and category editing; information never depends on color alone.\n- `WorkspaceCategoryEditor.tsx`: explicit editing context and Add a new category. Existing names are read-only while editing their color; saving a retired category's color preserves retirement.\n- `WorkspaceContributionTools.tsx`: Find contributions heading, count chips, composition/Enter-aware search and pending feedback.\n- `styles/communityWorkspace.ts`: separate control sections, contribution cards, badges and primary/secondary/destructive actions. Buttons fit their labels instead of stretching across the full desktop sheet; rows wrap at narrow widths.\n\nNo request starts on preload, no note is automatically published, and no new service/provider dependency is introduced.\n\n## Verification and rollback\n\nTests cover 3D icon descriptors, source/category colors, unchanged coordinates and measured-Z selection; real React/Chromium tests exercise normal typing at 110 ms between characters, a pause shorter than the debounce, a full idle search, IME input, Enter, stable map results, navigation/focus and narrow controls. SQL/transport behavior is unchanged. Actual ArcGIS SceneView appearance still needs live Experience Builder verification; browser tests use service fixtures and recording map objects.\n\n`uninstall-workspace-readability.cjs` restores exact pre-install source, including prior styling/search/marker behavior. It does not touch database data or undo preceding installers.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'workspace-readability-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'workspace-readability' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-readability.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace readability is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'workspace-readability', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Workspace readability ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
