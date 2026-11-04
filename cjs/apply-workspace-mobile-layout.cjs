#!/usr/bin/env node
'use strict';
/**
 * Workspace mobile layout confirmation. Compatible current v6 sources.
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
      "file": "src/styles/communityWorkspace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace mobile layout 1",
              "before": "import type { React } from 'jimu-core';\n/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */\nexport const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:10,flex:'1 1 0',minHeight:0,minWidth:0,boxSizing:'border-box',paddingInline:8,paddingBottom:'max(20px, env(safe-area-inset-bottom, 0px))',scrollPaddingBottom:48,overscrollBehavior:'contain',overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};\nexport const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:10,background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};\nexport const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};\nexport const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};\nexport const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};\nexport const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:32,justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};\n\n/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */\nexport const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'var(--mly-workspace-surface, #13251e)',borderColor:'#49695a'};\nexport const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};\nexport const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};\nexport const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};\nexport const workspaceHeadingStyle: React.CSSProperties = {fontSize:14,fontWeight:700,lineHeight:1.4,margin:0,color:'#f0f7f3'};\nexport const workspaceContributionCardStyle: React.CSSProperties = {...workspaceCardStyle,padding:12,gap:9,background:'#1b3027',borderColor:'#567363'};\nexport const workspaceStatusBadgeStyle: React.CSSProperties = {display:'inline-flex',padding:'3px 7px',borderRadius:5,fontSize:11,fontWeight:600,background:'#303f38',color:'#ecf3ef'};\n/** Pair category color with readable text; long names wrap at controller widths. */\nexport const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,\n",
              "after": "import type { React } from 'jimu-core';\n/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */\nexport const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:10,flex:'1 1 0',minHeight:0,minWidth:0,boxSizing:'border-box',paddingInline:'var(--mly-workspace-inset, 8px)',paddingBottom:'max(20px, env(safe-area-inset-bottom, 0px))',scrollPaddingBottom:48,overscrollBehavior:'contain',overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};\nexport const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:'var(--mly-workspace-card-padding, 10px)',background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};\nexport const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};\nexport const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};\nexport const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',fontSize:'var(--mly-workspace-input-size, 12px)',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};\nexport const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:'var(--mly-workspace-target-height, 32px)',justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};\n\n/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */\nexport const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'var(--mly-workspace-surface, #13251e)',borderColor:'#49695a'};\nexport const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};\nexport const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};\nexport const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};\nexport const workspaceHeadingStyle: React.CSSProperties = {fontSize:'var(--mly-workspace-heading-size, 14px)',fontWeight:700,lineHeight:1.4,margin:0,color:'#f0f7f3'};\nexport const workspaceContributionCardStyle: React.CSSProperties = {...workspaceCardStyle,padding:'var(--mly-workspace-card-padding, 12px)',gap:9,background:'#1b3027',borderColor:'#567363'};\nexport const workspaceStatusBadgeStyle: React.CSSProperties = {display:'inline-flex',padding:'3px 7px',borderRadius:5,fontSize:11,fontWeight:600,background:'#303f38',color:'#ecf3ef'};\n/** Pair category color with readable text; long names wrap at controller widths. */\nexport const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,\n"
            },
            {
              "label": "Workspace mobile layout 2",
              "before": "\n/** Neutral bands help scanning without competing with semantic category colors. */\nexport const workspaceReadabilityCss = `\n.mly-workspace-scroll > .mly-workspace-section:nth-child(even) { --mly-workspace-surface: #172b23; }\n.mly-workspace-scroll > .mly-workspace-section:nth-child(odd) { --mly-workspace-surface: #102019; }\n.mly-workspace-scroll .mly-workspace-section { flex-shrink: 0; }\n",
              "after": "\n/** Neutral bands help scanning without competing with semantic category colors. */\nexport const workspaceReadabilityCss = `\n/* Scope browser text inflation control to this UI; preserve browser/pinch zoom. */\n.mly-workspace-scroll { container: mly-workspace / inline-size; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }\n.mly-workspace-scroll button { white-space: normal; overflow-wrap: anywhere; line-height: 1.35; }\n.mly-workspace-scroll input, .mly-workspace-scroll select, .mly-workspace-scroll textarea { max-width: 100%; }\n@container mly-workspace (max-width: 480px) {\n .mly-workspace-scroll > * {\n  --mly-workspace-card-padding: 8px;\n  --mly-workspace-heading-size: 13px;\n  --mly-workspace-title-size: 14px;\n  --mly-workspace-description-size: 12px;\n }\n .mly-workspace-scroll p { margin-block: 6px; }\n .mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 2px; }\n .mly-workspace-scroll details.mly-workspace-section > summary { padding-block: 6px; }\n .mly-workspace-scroll details.mly-workspace-section[open] > summary { margin-bottom: 6px; }\n}\n/* Coarse-pointer users retain comfortable tap targets and 16px inputs to avoid\n * iOS focus zoom; compact text is never implemented by scaling the whole UI. */\n@media (pointer: coarse) {\n .mly-workspace-scroll { --mly-workspace-target-height: 44px; --mly-workspace-input-size: 16px; }\n .mly-workspace-scroll label:has(input[type=checkbox]), .mly-workspace-scroll summary { min-height: 44px; box-sizing: border-box; }\n .mly-workspace-scroll input:not([type=checkbox]):not([type=radio]):not([type=color]),\n .mly-workspace-scroll select { min-height: 44px; }\n}\n\n.mly-workspace-scroll > .mly-workspace-section:nth-child(even) { --mly-workspace-surface: #172b23; }\n.mly-workspace-scroll > .mly-workspace-section:nth-child(odd) { --mly-workspace-surface: #102019; }\n.mly-workspace-scroll .mly-workspace-section { flex-shrink: 0; }\n"
            },
            {
              "label": "Workspace mobile layout 3",
              "before": ".mly-workspace-scroll .mly-workspace-category-row:nth-child(odd) { background: #00000014; }\n.mly-workspace-scroll .mly-workspace-category-row:focus-within { outline: 2px solid #a5c9b6; outline-offset: 1px; }\n.mly-workspace-scroll .mly-workspace-category-row:hover { border-color: #86a694; }\n@media (max-width: 480px) {\n .mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 4px; }\n}\n`;\n",
              "after": ".mly-workspace-scroll .mly-workspace-category-row:nth-child(odd) { background: #00000014; }\n.mly-workspace-scroll .mly-workspace-category-row:focus-within { outline: 2px solid #a5c9b6; outline-offset: 1px; }\n.mly-workspace-scroll .mly-workspace-category-row:hover { border-color: #86a694; }\n`;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceContributionCard.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace mobile layout 1",
              "before": " const {owned:text,formatLocale}=useWidgetLocale();\n return <article style={{...card,borderInlineStart:'4px solid '+color}}>\n  <div style={{...row,justifyContent:'space-between'}}><WorkspaceCategoryBadge name={note.category} color={color}/><span style={statusBadge}>{text('Status')}: {text(statuses[note.status]||note.status)}</span></div>\n  <h3 style={{margin:0,fontSize:15,lineHeight:1.4,overflowWrap:'anywhere'}}>{note.title?.trim()||note.category}</h3>\n  <div style={{...row,fontSize:10,color:'#bdd0c5'}}><bdi style={{fontWeight:600,overflowWrap:'anywhere'}}>{formatWorkspaceContributor(note.author_id,note.author_display_name,text('Contributor'))}</bdi><span>{text(own?'Your contribution':ownerContribution?'Owner\u2019s contribution':'Member\u2019s contribution')}</span><span>{text('Last updated')}: {new Date(note.updated_at||note.created_at).toLocaleString(formatLocale)}</span></div>\n  <p style={{margin:0,fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{note.note_text}</p>\n  {note.resolution_note&&<div style={{fontSize:12,lineHeight:1.5}}><strong>{text('Outcome / follow-up')}: </strong>{note.resolution_note}</div>}\n  {note.risk_label&&<small>{text('Legacy risk assessment')}: {text(legacy[note.risk_label]||note.risk_label)}</small>}\n  <div style={{...row,borderTop:'1px solid #496052',paddingTop:8}}>\n",
              "after": " const {owned:text,formatLocale}=useWidgetLocale();\n return <article style={{...card,borderInlineStart:'4px solid '+color}}>\n  <div style={{...row,justifyContent:'space-between'}}><WorkspaceCategoryBadge name={note.category} color={color}/><span style={statusBadge}>{text('Status')}: {text(statuses[note.status]||note.status)}</span></div>\n  <h3 style={{margin:0,fontSize:'var(--mly-workspace-title-size, 15px)',lineHeight:1.4,overflowWrap:'anywhere'}}>{note.title?.trim()||note.category}</h3>\n  <div style={{...row,fontSize:10,color:'#bdd0c5'}}><bdi style={{fontWeight:600,overflowWrap:'anywhere'}}>{formatWorkspaceContributor(note.author_id,note.author_display_name,text('Contributor'))}</bdi><span>{text(own?'Your contribution':ownerContribution?'Owner\u2019s contribution':'Member\u2019s contribution')}</span><span>{text('Last updated')}: {new Date(note.updated_at||note.created_at).toLocaleString(formatLocale)}</span></div>\n  <p style={{margin:0,fontSize:'var(--mly-workspace-description-size, 13px)',lineHeight:1.6,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{note.note_text}</p>\n  {note.resolution_note&&<div style={{fontSize:12,lineHeight:1.5}}><strong>{text('Outcome / follow-up')}: </strong>{note.resolution_note}</div>}\n  {note.risk_label&&<small>{text('Legacy risk assessment')}: {text(legacy[note.risk_label]||note.risk_label)}</small>}\n  <div style={{...row,borderTop:'1px solid #496052',paddingTop:8}}>\n"
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
              "label": "Workspace mobile layout 1",
              "before": "  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n  const beforeFault=requests.length;await page.evaluate(()=>{root.unmount();window.failWorkspaceImport=true;});await page.addScriptTag({content:bootstrap});await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('alert').filter({hasText:'Workspace controls could not load'}).waitFor();assert(await page.evaluate(()=>window.workspaceImportAttempts>=3));assert.equal(await page.getByRole('alert').evaluate(node=>getComputedStyle(node).color),'rgb(211, 226, 217)');checks++;await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(requests.length,beforeFault);checks++;\n  console.log(checks+' real React/Chromium workspace checks passed.');\n }finally{if(process.env.WORKSPACE_TEST_DEBUG)console.log('DEBUG',errors,await page.locator('body').innerText(),requests);await browser.close();}\n})().catch(error=>{console.error(error);process.exitCode=1});\n",
              "after": "  await page.evaluate(()=>mount(true));await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Workspaces',exact:true}).count(),1);checks++;\n  assert.deepEqual(errors,[]);\n  const beforeFault=requests.length;await page.evaluate(()=>{root.unmount();window.failWorkspaceImport=true;});await page.addScriptTag({content:bootstrap});await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('alert').filter({hasText:'Workspace controls could not load'}).waitFor();assert(await page.evaluate(()=>window.workspaceImportAttempts>=3));assert.equal(await page.getByRole('alert').evaluate(node=>getComputedStyle(node).color),'rgb(211, 226, 217)');checks++;await page.getByRole('tab',{name:'Local (1)',exact:true}).click();await page.getByRole('tabpanel',{name:'Local notes',exact:true}).getByText('Review visibility',{exact:true}).waitFor();assert.equal(requests.length,beforeFault);checks++;\n  // Real mobile context: CSS-pixel typography, coarse-pointer targets, no horizontal overflow.\n  const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});\n  await phone.setContent('<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>body{margin:0}</style><body></body>');\n  await phone.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/note-search-react/package/umd/react.development.js'});await phone.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/note-search-react-dom/package/umd/react-dom.development.js'});await phone.addScriptTag({content:bootstrap});\n  await phone.evaluate(()=>Object.assign(document.getElementById('root').style,{width:'100%',height:'844px'}));\n  await phone.getByRole('tab',{name:'Workspaces',exact:true}).click();await phone.getByText('Collaboration workspace',{exact:true}).waitFor();\n  for(const width of [320,390]){\n    await phone.setViewportSize({width,height:844});\n    assert.equal(await phone.getByRole('tabpanel',{name:'Workspace notes',exact:true}).evaluate(node=>{const style=getComputedStyle(node);return style.fontSize==='12px'&&style.webkitTextSizeAdjust==='100%'&&node.scrollWidth<=node.clientWidth+1;}),true);\n    assert.equal(await phone.getByRole('button',{name:'Close',exact:true}).evaluate(node=>node.getBoundingClientRect().height>=44),true);\n    assert.equal(await phone.getByLabel('Project URL',{exact:true}).evaluate(node=>{const r=node.getBoundingClientRect();return getComputedStyle(node).fontSize==='16px'&&r.height>=44&&r.right<=innerWidth;}),true);\n    assert.equal(await phone.getByText('Connection and workspace settings',{exact:true}).evaluate(node=>getComputedStyle(node).fontSize==='12px'),true);checks++;\n  }\n  await phone.close();\n  console.log(checks+' real React/Chromium workspace checks passed.');\n }finally{if(process.env.WORKSPACE_TEST_DEBUG)console.log('DEBUG',errors,await page.locator('body').innerText(),requests);await browser.close();}\n})().catch(error=>{console.error(error);process.exitCode=1});\n"
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
const prefix = 'workspace-mobile-layout-';

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
    if (manifest.installer !== 'workspace-mobile-layout' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-mobile-layout.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace mobile layout confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'workspace-mobile-layout', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Workspace mobile layout confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
