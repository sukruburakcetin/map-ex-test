#!/usr/bin/env node
'use strict';
/**
 * Inline member removal confirmation. Compatible current v6 sources.
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
      "file": "src/features/community-notes/CommunityWorkspacePanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Inline member removal 1",
              "before": "  const [localId,setLocalId]=React.useState(''),[publishCategory,setPublishCategory]=React.useState('');\n  const [editing,setEditing]=React.useState(''),[editError,setEditError]=React.useState('');\n  const [removal,setRemoval]=React.useState<{kind:'note'|'member';id:string}|null>(null);\n  const workspace=workspaces.find(item=>item.id===active),owner=!!workspace&&workspace.owner_id===client.current?.userId;\n  const canWrite=owner||members.some(member=>member.user_id===client.current?.userId&&member.role==='contributor');\n  React.useEffect(()=>setConnectionOpen(!(signedIn&&workspace)),[signedIn,workspace?.id]);\n",
              "after": "  const [localId,setLocalId]=React.useState(''),[publishCategory,setPublishCategory]=React.useState('');\n  const [editing,setEditing]=React.useState(''),[editError,setEditError]=React.useState('');\n  const [removal,setRemoval]=React.useState<{kind:'note'|'member';id:string}|null>(null);\n  const [removalError,setRemovalError]=React.useState('');\n  const removalRef=React.useRef<HTMLDivElement>(null);\n  React.useEffect(()=>{if(removal?.kind==='member'){removalRef.current?.scrollIntoView({block:'nearest'});removalRef.current?.focus({preventScroll:true});}},[removal]);\n  const workspace=workspaces.find(item=>item.id===active),owner=!!workspace&&workspace.owner_id===client.current?.userId;\n  const canWrite=owner||members.some(member=>member.user_id===client.current?.userId&&member.role==='contributor');\n  React.useEffect(()=>setConnectionOpen(!(signedIn&&workspace)),[signedIn,workspace?.id]);\n"
            },
            {
              "label": "Inline member removal 2",
              "before": "              <details><summary>{text('Contributor ID')}</summary><code dir=\"ltr\" style={{overflowWrap:'anywhere'}}>{member.user_id}</code></details>\n              <div style={{...row,gap:8}}>\n                {action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}\n                {action('Remove member',()=>setRemoval({kind:'member',id:member.user_id}))}\n              </div>\n            </div>)}\n          </div>}\n        </div>\n",
              "after": "              <details><summary>{text('Contributor ID')}</summary><code dir=\"ltr\" style={{overflowWrap:'anywhere'}}>{member.user_id}</code></details>\n              <div style={{...row,gap:8}}>\n                {action(member.role==='reader'?'Allow contributions':'Make read-only',()=>{const api=client.current!;void run(async()=>{await api.setMemberRole(active,member.user_id,member.role==='reader'?'contributor':'reader');return api.members(active);},setMembers);})}\n                {action('Remove member',()=>{setRemovalError('');setRemoval({kind:'member',id:member.user_id});})}\n              </div>\n              {removal?.kind==='member'&&removal.id===member.user_id&&<div ref={removalRef} tabIndex={-1} role=\"group\" aria-label={text('Confirm member removal')} style={{...card,borderColor:'#b38270'}}>\n                <strong>{text('Remove workspace access for')}: {formatWorkspaceContributor(member.user_id,member.display_name,text('Contributor'))}</strong>\n                <span>{text('Existing contributions and their authorship will remain. Revoke active invitations if this person must not rejoin.')}</span>\n                <div style={row}>{action('Confirm removal',()=>{const api=client.current!;setRemovalError('');void run(async()=>{await api.removeMember(active,member.user_id);return api.members(active);},members=>{setMembers(members);contributions.refresh();setRemoval(null);setMessage(text('Member access removed. Existing contributions were retained.'));},setRemovalError);})}{action('Cancel removal',()=>{setRemoval(null);setRemovalError('');})}</div>\n                {removalError&&<div role=\"alert\" style={{color:'#ffb8a6'}}>{text(removalError)}</div>}\n              </div>}\n\n            </div>)}\n          </div>}\n        </div>\n"
            },
            {
              "label": "Inline member removal 3",
              "before": "      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}\n    </React.Fragment>}\n    {removal&&<div role=\"group\" aria-label={text('Confirm removal')} style={card}><span>{text(removal.kind==='note'?'Remove this shared note from the operator\u2019s service?':'Remove this member\u2019s workspace access?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{if(target.kind==='note')await api.removeNote(active,target.id);else await api.removeMember(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}\n    {busy&&<span role=\"status\">{text('Working with the selected workspace\u2026')}</span>}\n    {error&&<div role=\"alert\" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(error)}</div>}\n    {message&&<div role=\"status\">{message}</div>}\n",
              "after": "      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}\n    </React.Fragment>}\n    {removal?.kind==='note'&&<div role=\"group\" aria-label={text('Confirm removal')} style={card}><span>{text('Remove this shared note from the operator\u2019s service?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{await api.removeNote(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}\n    {busy&&<span role=\"status\">{text('Working with the selected workspace\u2026')}</span>}\n    {error&&<div role=\"alert\" style={{color:'#ffb8a6',overflowWrap:'anywhere'}}>{text(error)}</div>}\n    {message&&<div role=\"status\">{message}</div>}\n"
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
              "label": "Inline member removal 1",
              "before": "const bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};let catalog;const owned=(text,values={})=>text.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}');const locale={locale:'en',formatLocale:'en-US',owned,t:(key,values)=>owned(catalog[key]||key,values)};function load(key){if(key.endsWith('/CommunityWorkspacePanel.tsx'))window.workspaceImportAttempts=(window.workspaceImportAttempts||0)+1;if(window.failWorkspaceImport&&key.endsWith('/CommunityWorkspacePanel.tsx'))throw Error('Fixture workspace chunk unavailable');if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>locale,OwnedMessage:({source,values})=>owned(source,values)}:load(entry.deps[id]),m,m.exports);return m.exports;}catalog=load(${JSON.stringify(en)}).en;const Panel=load(${JSON.stringify(panel)}).FieldNotesPanel;window.focused=[];window.mapSnapshots=[];window.mount=(enterpriseEnabled=false)=>{window.root?.unmount();document.body.innerHTML='<div id=\"root\"></div>';Object.assign(document.getElementById('root').style,{width:'480px',height:'600px',position:'relative',background:'#14251d'});const note={id:'local-1',source:'manual',category:'Crossing',note:'Review visibility',lon:1,lat:2,imageId:'123',createdAt:1700000000000};window.root=ReactDOM.createRoot(document.getElementById('root'));window.panelProps={notes:[note],isAnnotationMode:false,pendingNote:null,listOpen:true,enterpriseEnabled,onLoadEnterpriseNotes:async()=>({notes:[],nextOffset:0,hasMore:false}),onSubmitNote(){},onCancelPending(){},onDeleteNote(){},onClearAll(){},onExport(){},onImportFile(){},onFocusNote:note=>focused.push(note),onWorkspaceMapChange:(notes,categories,name)=>mapSnapshots.push({notes,categories,name}),onCloseList(){}};window.setPanelNotes=notes=>{window.panelProps={...window.panelProps,notes};root.render(React.createElement(Panel,panelProps));};window.setListOpen=value=>root.render(React.createElement(Panel,{...panelProps,listOpen:value}));root.render(React.createElement(Panel,panelProps));};mount();})();`;\nconst owner='10000000-0000-4000-8000-000000000001',member='10000000-0000-4000-8000-000000000002',workspace='20000000-0000-4000-8000-000000000001',id='30000000-0000-4000-8000-000000000001',inviteId='40000000-0000-4000-8000-000000000001';\n(async()=>{\n const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();page.setDefaultTimeout(10000);const errors=[],requests=[],records=[],members=[],invitations=[],categories=[],aliases=new Map();let created=false,joined=false,invitationRole='contributor',editRevision=0;page.on('pageerror',error=>errors.push(error.message));\n const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type,prefer','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'};\n await page.route('https://demo.test/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));\n await page.route('https://workspace.test/**',async route=>{\n",
              "after": "const bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};let catalog;const owned=(text,values={})=>text.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}');const locale={locale:'en',formatLocale:'en-US',owned,t:(key,values)=>owned(catalog[key]||key,values)};function load(key){if(key.endsWith('/CommunityWorkspacePanel.tsx'))window.workspaceImportAttempts=(window.workspaceImportAttempts||0)+1;if(window.failWorkspaceImport&&key.endsWith('/CommunityWorkspacePanel.tsx'))throw Error('Fixture workspace chunk unavailable');if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>locale,OwnedMessage:({source,values})=>owned(source,values)}:load(entry.deps[id]),m,m.exports);return m.exports;}catalog=load(${JSON.stringify(en)}).en;const Panel=load(${JSON.stringify(panel)}).FieldNotesPanel;window.focused=[];window.mapSnapshots=[];window.mount=(enterpriseEnabled=false)=>{window.root?.unmount();document.body.innerHTML='<div id=\"root\"></div>';Object.assign(document.getElementById('root').style,{width:'480px',height:'600px',position:'relative',background:'#14251d'});const note={id:'local-1',source:'manual',category:'Crossing',note:'Review visibility',lon:1,lat:2,imageId:'123',createdAt:1700000000000};window.root=ReactDOM.createRoot(document.getElementById('root'));window.panelProps={notes:[note],isAnnotationMode:false,pendingNote:null,listOpen:true,enterpriseEnabled,onLoadEnterpriseNotes:async()=>({notes:[],nextOffset:0,hasMore:false}),onSubmitNote(){},onCancelPending(){},onDeleteNote(){},onClearAll(){},onExport(){},onImportFile(){},onFocusNote:note=>focused.push(note),onWorkspaceMapChange:(notes,categories,name)=>mapSnapshots.push({notes,categories,name}),onCloseList(){}};window.setPanelNotes=notes=>{window.panelProps={...window.panelProps,notes};root.render(React.createElement(Panel,panelProps));};window.setListOpen=value=>root.render(React.createElement(Panel,{...panelProps,listOpen:value}));root.render(React.createElement(Panel,panelProps));};mount();})();`;\nconst owner='10000000-0000-4000-8000-000000000001',member='10000000-0000-4000-8000-000000000002',workspace='20000000-0000-4000-8000-000000000001',id='30000000-0000-4000-8000-000000000001',inviteId='40000000-0000-4000-8000-000000000001';\n(async()=>{\n const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();page.setDefaultTimeout(10000);const errors=[],requests=[],records=[],members=[],invitations=[],categories=[],aliases=new Map();let created=false,joined=false,invitationRole='contributor',editRevision=0,denyRemovalOnce=false;page.on('pageerror',error=>errors.push(error.message));\n const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type,prefer','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'};\n await page.route('https://demo.test/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'}));\n await page.route('https://workspace.test/**',async route=>{\n"
            },
            {
              "label": "Inline member removal 2",
              "before": "  else if(url.pathname==='/rest/v1/rpc/mly_workspace_members_named')result=(user===owner?members:members.filter(item=>item.user_id===user)).map(item=>({...item,display_name:aliases.get(item.user_id)||null}));\n  else if(url.pathname==='/rest/v1/rpc/mly_create_workspace_invite'){invitationRole=body.p_role;invitations.push({id:inviteId,role:body.p_role,uses:0,max_uses:body.p_max_uses,expires_at:'2026-12-01'});result='a'.repeat(72);}\n  else if(url.pathname==='/rest/v1/rpc/mly_join_workspace_named'){joined=true;members.push({user_id:member,role:invitationRole});aliases.set(user,body.p_display_name);result=workspace;}\n  else if(url.pathname==='/rest/v1/mly_workspace_members')result=user===owner?members:members.filter(item=>item.user_id===user);\n  else if(url.pathname==='/rest/v1/mly_workspace_invites')result=invitations;\n  else if(url.pathname==='/rest/v1/mly_workspace_notes'){\n   if(method==='POST'){if(records.some(item=>item.source_id===body.source_id&&item.author_id===body.author_id))result=[];else{const note={...body,id,created_at:'2026-01-01T00:00:00Z'};records.push(note);result=[note];}}\n",
              "after": "  else if(url.pathname==='/rest/v1/rpc/mly_workspace_members_named')result=(user===owner?members:members.filter(item=>item.user_id===user)).map(item=>({...item,display_name:aliases.get(item.user_id)||null}));\n  else if(url.pathname==='/rest/v1/rpc/mly_create_workspace_invite'){invitationRole=body.p_role;invitations.push({id:inviteId,role:body.p_role,uses:0,max_uses:body.p_max_uses,expires_at:'2026-12-01'});result='a'.repeat(72);}\n  else if(url.pathname==='/rest/v1/rpc/mly_join_workspace_named'){joined=true;members.push({user_id:member,role:invitationRole});aliases.set(user,body.p_display_name);result=workspace;}\n  else if(url.pathname==='/rest/v1/mly_workspace_members'){if(method==='DELETE'){if(denyRemovalOnce){denyRemovalOnce=false;return route.fulfill({status:403,headers,contentType:'application/json',body:'{}'});}const target=url.searchParams.get('user_id').slice(3),index=members.findIndex(item=>item.user_id===target);result=index<0?[]:members.splice(index,1);}else result=user===owner?members:members.filter(item=>item.user_id===user);}\n  else if(url.pathname==='/rest/v1/mly_workspace_invites')result=invitations;\n  else if(url.pathname==='/rest/v1/mly_workspace_notes'){\n   if(method==='POST'){if(records.some(item=>item.source_id===body.source_id&&item.author_id===body.author_id))result=[];else{const note={...body,id,created_at:'2026-01-01T00:00:00Z'};records.push(note);result=[note];}}\n"
            },
            {
              "label": "Inline member removal 3",
              "before": "  await page.evaluate(()=>setListOpen(false));assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),0);await page.evaluate(()=>setListOpen(true));await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.getByRole('button',{name:'Disconnect',exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Connect',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('owner@example.test');await page.getByLabel('Password',{exact:true}).fill('not-stored');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByText('Your role: Owner',{exact:true}).waitFor();\n  await page.getByText('Manage invitations and members',{exact:true}).click();await page.getByText('Manage invitations and members',{exact:true}).locator('..').getByText('Alex Reader \u00b7 #1000\u20260002',{exact:true}).waitFor();checks++;\n  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n  const beforeFault=requests.length;await page.evaluate(()=>{root.unmount();window.failWorkspaceImport=true;});await page.addScriptTag({content:bootstrap});await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('alert').filter({hasText:'Workspace controls could not load'}).waitFor();assert(await page.evaluate(()=>window.workspaceImportAttempts>=3));assert.equal(await page.getByRole('alert').evaluate(node=>getComputedStyle(node).color),'rgb(211, 226, 217)');checks++;await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(requests.length,beforeFault);checks++;\n",
              "after": "  await page.evaluate(()=>setListOpen(false));assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),0);await page.evaluate(()=>setListOpen(true));await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.getByRole('button',{name:'Disconnect',exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Connect',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('owner@example.test');await page.getByLabel('Password',{exact:true}).fill('not-stored');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByText('Your role: Owner',{exact:true}).waitFor();\n  await page.getByText('Manage invitations and members',{exact:true}).click();await page.getByText('Manage invitations and members',{exact:true}).locator('..').getByText('Alex Reader \u00b7 #1000\u20260002',{exact:true}).waitFor();checks++;\n  const beforeRemovalNotes=records.length,beforeRemovalRequests=requests.filter(item=>item.path==='/rest/v1/mly_workspace_members'&&item.method==='DELETE').length;\n  await page.getByRole('button',{name:'Remove member',exact:true}).click();const confirmation=page.getByRole('group',{name:'Confirm member removal',exact:true});await confirmation.waitFor();assert.equal(await confirmation.evaluate(node=>node.parentElement.textContent.includes('Alex Reader')),true);assert.equal(await confirmation.evaluate(node=>document.activeElement===node),true);assert.equal(requests.filter(item=>item.path==='/rest/v1/mly_workspace_members'&&item.method==='DELETE').length,beforeRemovalRequests);checks++;\n  await confirmation.getByRole('button',{name:'Cancel removal',exact:true}).click();assert.equal(members.length,1);assert.equal(await confirmation.count(),0);checks++;\n  denyRemovalOnce=true;await page.getByRole('button',{name:'Remove member',exact:true}).click();await confirmation.getByRole('button',{name:'Confirm removal',exact:true}).click();await confirmation.getByRole('alert').waitFor();assert.equal(members.length,1);checks++;\n  await confirmation.getByRole('button',{name:'Confirm removal',exact:true}).click();await page.getByText('Member access removed. Existing contributions were retained.',{exact:true}).waitFor();assert.equal(members.length,0);assert.equal(records.length,beforeRemovalNotes);assert.equal(await page.getByRole('button',{name:'Remove member',exact:true}).count(),0);checks++;\n  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n  const beforeFault=requests.length;await page.evaluate(()=>{root.unmount();window.failWorkspaceImport=true;});await page.addScriptTag({content:bootstrap});await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('alert').filter({hasText:'Workspace controls could not load'}).waitFor();assert(await page.evaluate(()=>window.workspaceImportAttempts>=3));assert.equal(await page.getByRole('alert').evaluate(node=>getComputedStyle(node).color),'rgb(211, 226, 217)');checks++;await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(requests.length,beforeFault);checks++;\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'member-removal-confirmation-';

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
    if (manifest.installer !== 'member-removal-confirmation' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-member-removal-confirmation.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Inline member removal confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'member-removal-confirmation', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Inline member removal confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
