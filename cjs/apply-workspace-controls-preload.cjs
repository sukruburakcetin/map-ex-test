#!/usr/bin/env node
'use strict';
/**
 * Workspace controls preload. Compatible current v6 sources.
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
      "file": "src/components/FieldNotesPanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace preload 1",
              "before": "    onCloseList: () => void;\n}\n\n// No workspace service or credentials are initialized until its tab is opened.\nconst CommunityWorkspacePanel = React.lazy(() => import('../features/community-notes/CommunityWorkspacePanel').then(module => ({ default: module.CommunityWorkspacePanel })));\n\n// NoteEditor is feature-owned; this panel composes it with lists and attachments.\n\n",
              "after": "    onCloseList: () => void;\n}\n\nlet workspaceControlsPromise: Promise<{ default: typeof import('../features/community-notes/CommunityWorkspacePanel').CommunityWorkspacePanel }> | undefined;\n\n/** Share the code download between Notes preloading and the workspace tab.\n * Importing does not mount controls, create a client, or contact the service.\n * A failed preload is discarded so opening the tab can attempt a fresh load.\n */\nfunction loadWorkspaceControls() {\n    if (!workspaceControlsPromise) {\n        workspaceControlsPromise = import('../features/community-notes/CommunityWorkspacePanel')\n            .then(module => ({ default: module.CommunityWorkspacePanel }))\n            .catch(error => { workspaceControlsPromise = undefined; throw error; });\n    }\n    return workspaceControlsPromise;\n}\nconst CommunityWorkspacePanel = React.lazy(loadWorkspaceControls);\nconst workspaceFeedbackStyle: React.CSSProperties = {\n    color: '#d3e2d9', background: '#14251d', padding: 12,\n    fontSize: 13, lineHeight: 1.5, overflowWrap: 'anywhere'\n};\n\n// NoteEditor is feature-owned; this panel composes it with lists and attachments.\n\n"
            },
            {
              "label": "Workspace preload 2",
              "before": "    const [noteSource, setNoteSource] = React.useState<\"local\" | \"enterprise\" | \"workspace\">(\"local\");\n    const enterpriseAvailable = !!props.enterpriseEnabled && !!props.onLoadEnterpriseNotes;\n    const activeSource = noteSource === \"enterprise\" && !enterpriseAvailable ? \"local\" : noteSource;\n    const [workspaceVisited, setWorkspaceVisited] = React.useState(false);\n    React.useEffect(() => { if (listOpen && activeSource === 'workspace') setWorkspaceVisited(true); }, [listOpen, activeSource]);\n    const sources: Array<\"local\" | \"enterprise\" | \"workspace\"> = enterpriseAvailable ? [\"local\", \"enterprise\", \"workspace\"] : [\"local\", \"workspace\"];\n",
              "after": "    const [noteSource, setNoteSource] = React.useState<\"local\" | \"enterprise\" | \"workspace\">(\"local\");\n    const enterpriseAvailable = !!props.enterpriseEnabled && !!props.onLoadEnterpriseNotes;\n    const activeSource = noteSource === \"enterprise\" && !enterpriseAvailable ? \"local\" : noteSource;\n    // Warm only the interface code while the user reads Local/Enterprise notes.\n    React.useEffect(() => { if (listOpen) void loadWorkspaceControls().catch(() => {}); }, [listOpen]);\n    const [workspaceVisited, setWorkspaceVisited] = React.useState(false);\n    React.useEffect(() => { if (listOpen && activeSource === 'workspace') setWorkspaceVisited(true); }, [listOpen, activeSource]);\n    const sources: Array<\"local\" | \"enterprise\" | \"workspace\"> = enterpriseAvailable ? [\"local\", \"enterprise\", \"workspace\"] : [\"local\", \"workspace\"];\n"
            },
            {
              "label": "Workspace preload 3",
              "before": "                        Local/Enterprise lists still unmount on close/source changes. */}\n                    {(workspaceVisited || activeSource === 'workspace') && <div hidden={activeSource !== 'workspace'}\n                      style={{ display: activeSource === 'workspace' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, flex: '1 1 0' }}>\n                      <WorkspaceBoundary fallback={<div role=\"alert\">{owned('Workspace controls could not load. Local notes remain available; reload the page to retry.')}</div>}>\n                        <React.Suspense fallback={<div role=\"status\">{owned('Loading workspace controls\u2026')}</div>}>\n                          <CommunityWorkspacePanel notes={notes} onFocus={onFocusNote} onClose={onCloseList} />\n                        </React.Suspense>\n                      </WorkspaceBoundary>\n",
              "after": "                        Local/Enterprise lists still unmount on close/source changes. */}\n                    {(workspaceVisited || activeSource === 'workspace') && <div hidden={activeSource !== 'workspace'}\n                      style={{ display: activeSource === 'workspace' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, flex: '1 1 0' }}>\n                      <WorkspaceBoundary fallback={<div role=\"alert\" style={workspaceFeedbackStyle}>{owned('Workspace controls could not load. Local notes remain available; reload the page to retry.')}</div>}>\n                        <React.Suspense fallback={<div role=\"status\" style={workspaceFeedbackStyle}>{owned('Loading workspace controls\u2026')}</div>}>\n                          <CommunityWorkspacePanel notes={notes} onFocus={onFocusNote} onClose={onCloseList} />\n                        </React.Suspense>\n                      </WorkspaceBoundary>\n"
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
              "label": "Workspace preload 1",
              "before": "const root=path.resolve(__dirname,'..'),modules={};\nfunction add(file){const key=path.relative(root,file).replace(/\\\\/g,'/');if(modules[key])return key;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;modules[key]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(id==='jimu-core'||id.endsWith('WidgetLocale'))continue;let resolved=path.resolve(path.dirname(file),id);if(!path.extname(resolved)){const names=fs.readdirSync(path.dirname(resolved));let name;for(const extension of ['.ts','.tsx']){name=names.find(name=>name.toLowerCase()===(path.basename(resolved)+extension).toLowerCase());if(name)break;}if(!name)throw Error('Unresolved '+resolved);resolved=path.join(path.dirname(resolved),name);}modules[key].deps[id]=add(resolved);}return key;}\nconst panel=add(path.join(root,'src/components/FieldNotesPanel.tsx')),en=add(path.join(root,'src/i18n/messages.ts'));\nconst bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};let catalog;const owned=(text,values={})=>text.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}');const locale={locale:'en',formatLocale:'en-US',owned,t:(key,values)=>owned(catalog[key]||key,values)};function load(key){if(window.failWorkspaceImport&&key.endsWith('/CommunityWorkspacePanel.tsx'))throw Error('Fixture workspace chunk unavailable');if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>locale,OwnedMessage:({source,values})=>owned(source,values)}:load(entry.deps[id]),m,m.exports);return m.exports;}catalog=load(${JSON.stringify(en)}).en;const Panel=load(${JSON.stringify(panel)}).FieldNotesPanel;window.focused=[];window.mount=(enterpriseEnabled=false)=>{window.root?.unmount();document.body.innerHTML='<div id=\"root\"></div>';Object.assign(document.getElementById('root').style,{width:'480px',height:'600px',position:'relative',background:'#14251d'});const note={id:'local-1',source:'manual',category:'Crossing',note:'Review visibility',lon:1,lat:2,imageId:'123',createdAt:1700000000000};window.root=ReactDOM.createRoot(document.getElementById('root'));window.panelProps={notes:[note],isAnnotationMode:false,pendingNote:null,listOpen:true,enterpriseEnabled,onLoadEnterpriseNotes:async()=>({notes:[],nextOffset:0,hasMore:false}),onSubmitNote(){},onCancelPending(){},onDeleteNote(){},onClearAll(){},onExport(){},onImportFile(){},onFocusNote:note=>focused.push(note),onCloseList(){}};window.setListOpen=value=>root.render(React.createElement(Panel,{...panelProps,listOpen:value}));root.render(React.createElement(Panel,panelProps));};mount();})();`;\nconst owner='10000000-0000-4000-8000-000000000001',member='10000000-0000-4000-8000-000000000002',workspace='20000000-0000-4000-8000-000000000001',id='30000000-0000-4000-8000-000000000001',inviteId='40000000-0000-4000-8000-000000000001';\n(async()=>{\n const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();page.setDefaultTimeout(10000);const errors=[],requests=[],records=[],members=[],invitations=[];let created=false,joined=false,invitationRole='contributor';page.on('pageerror',error=>errors.push(error.message));\n",
              "after": "const root=path.resolve(__dirname,'..'),modules={};\nfunction add(file){const key=path.relative(root,file).replace(/\\\\/g,'/');if(modules[key])return key;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;modules[key]={code,deps:{}};for(const match of code.matchAll(/require\\([\"']([^\"']+)[\"']\\)/g)){const id=match[1];if(id==='jimu-core'||id.endsWith('WidgetLocale'))continue;let resolved=path.resolve(path.dirname(file),id);if(!path.extname(resolved)){const names=fs.readdirSync(path.dirname(resolved));let name;for(const extension of ['.ts','.tsx']){name=names.find(name=>name.toLowerCase()===(path.basename(resolved)+extension).toLowerCase());if(name)break;}if(!name)throw Error('Unresolved '+resolved);resolved=path.join(path.dirname(resolved),name);}modules[key].deps[id]=add(resolved);}return key;}\nconst panel=add(path.join(root,'src/components/FieldNotesPanel.tsx')),en=add(path.join(root,'src/i18n/messages.ts'));\nconst bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};let catalog;const owned=(text,values={})=>text.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}');const locale={locale:'en',formatLocale:'en-US',owned,t:(key,values)=>owned(catalog[key]||key,values)};function load(key){if(key.endsWith('/CommunityWorkspacePanel.tsx'))window.workspaceImportAttempts=(window.workspaceImportAttempts||0)+1;if(window.failWorkspaceImport&&key.endsWith('/CommunityWorkspacePanel.tsx'))throw Error('Fixture workspace chunk unavailable');if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>locale,OwnedMessage:({source,values})=>owned(source,values)}:load(entry.deps[id]),m,m.exports);return m.exports;}catalog=load(${JSON.stringify(en)}).en;const Panel=load(${JSON.stringify(panel)}).FieldNotesPanel;window.focused=[];window.mount=(enterpriseEnabled=false)=>{window.root?.unmount();document.body.innerHTML='<div id=\"root\"></div>';Object.assign(document.getElementById('root').style,{width:'480px',height:'600px',position:'relative',background:'#14251d'});const note={id:'local-1',source:'manual',category:'Crossing',note:'Review visibility',lon:1,lat:2,imageId:'123',createdAt:1700000000000};window.root=ReactDOM.createRoot(document.getElementById('root'));window.panelProps={notes:[note],isAnnotationMode:false,pendingNote:null,listOpen:true,enterpriseEnabled,onLoadEnterpriseNotes:async()=>({notes:[],nextOffset:0,hasMore:false}),onSubmitNote(){},onCancelPending(){},onDeleteNote(){},onClearAll(){},onExport(){},onImportFile(){},onFocusNote:note=>focused.push(note),onCloseList(){}};window.setListOpen=value=>root.render(React.createElement(Panel,{...panelProps,listOpen:value}));root.render(React.createElement(Panel,panelProps));};mount();})();`;\nconst owner='10000000-0000-4000-8000-000000000001',member='10000000-0000-4000-8000-000000000002',workspace='20000000-0000-4000-8000-000000000001',id='30000000-0000-4000-8000-000000000001',inviteId='40000000-0000-4000-8000-000000000001';\n(async()=>{\n const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();page.setDefaultTimeout(10000);const errors=[],requests=[],records=[],members=[],invitations=[];let created=false,joined=false,invitationRole='contributor';page.on('pageerror',error=>errors.push(error.message));\n"
            },
            {
              "label": "Workspace preload 2",
              "before": " try{\n  await page.goto('https://demo.test/');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/note-search-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/note-search-react-dom/package/umd/react-dom.development.js'});await page.addScriptTag({content:bootstrap});\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).focus();await page.keyboard.press('End');await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);await page.getByRole('tab',{name:'Workspaces',exact:true}).focus();await page.keyboard.press('Home');await page.getByRole('searchbox').waitFor();checks++;\n  await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('heading').count();await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n  await page.getByLabel('Project URL',{exact:true}).fill('https://workspace.test');await page.getByLabel('Public publishable or anon key',{exact:true}).fill('sb_publishable_fixturePublic123');assert.equal(await page.getByRole('button',{name:'Connect',exact:true}).isEnabled(),false);checks++;\n",
              "after": " try{\n  await page.goto('https://demo.test/');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/note-search-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/note-search-react-dom/package/umd/react-dom.development.js'});await page.addScriptTag({content:bootstrap});\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n  await page.waitForFunction(()=>window.workspaceImportAttempts===1);assert.equal(await page.getByText('Collaboration workspace',{exact:true}).count(),0);assert.equal(requests.length,0);checks++;\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).focus();await page.keyboard.press('End');await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);await page.getByRole('tab',{name:'Workspaces',exact:true}).focus();await page.keyboard.press('Home');await page.getByRole('searchbox').waitFor();checks++;\n  await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('heading').count();await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n  await page.getByLabel('Project URL',{exact:true}).fill('https://workspace.test');await page.getByLabel('Public publishable or anon key',{exact:true}).fill('sb_publishable_fixturePublic123');assert.equal(await page.getByRole('button',{name:'Connect',exact:true}).isEnabled(),false);checks++;\n"
            },
            {
              "label": "Workspace preload 3",
              "before": "  await page.evaluate(()=>setListOpen(false));assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),0);await page.evaluate(()=>setListOpen(true));await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n  const beforeFault=requests.length;await page.evaluate(()=>{root.unmount();window.failWorkspaceImport=true;});await page.addScriptTag({content:bootstrap});await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('alert').filter({hasText:'Workspace controls could not load'}).waitFor();await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(requests.length,beforeFault);checks++;\n  console.log(checks+' real React/Chromium workspace checks passed.');\n }finally{if(process.env.WORKSPACE_TEST_DEBUG)console.log('DEBUG',errors,await page.locator('body').innerText(),requests);await browser.close();}\n})().catch(error=>{console.error(error);process.exitCode=1});\n",
              "after": "  await page.evaluate(()=>setListOpen(false));assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),0);await page.evaluate(()=>setListOpen(true));await page.getByText('Your role: Reader',{exact:true}).waitFor();assert.equal(requests.filter(item=>item.path==='/auth/v1/token').length,2);checks++;\n  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n  const beforeFault=requests.length;await page.evaluate(()=>{root.unmount();window.failWorkspaceImport=true;});await page.addScriptTag({content:bootstrap});await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('alert').filter({hasText:'Workspace controls could not load'}).waitFor();assert(await page.evaluate(()=>window.workspaceImportAttempts>=3));assert.equal(await page.getByRole('alert').evaluate(node=>getComputedStyle(node).color),'rgb(211, 226, 217)');checks++;await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(requests.length,beforeFault);checks++;\n  console.log(checks+' real React/Chromium workspace checks passed.');\n }finally{if(process.env.WORKSPACE_TEST_DEBUG)console.log('DEBUG',errors,await page.locator('body').innerText(),requests);await browser.close();}\n})().catch(error=>{console.error(error);process.exitCode=1});\n"
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
const prefix = 'workspace-controls-preload-';

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
    if (manifest.installer !== 'workspace-controls-preload' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-controls-preload.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace controls preload is already installed. No files changed.');
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
  const manifest = { installer: 'workspace-controls-preload', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Workspace controls preload ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
