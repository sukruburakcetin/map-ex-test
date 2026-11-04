#!/usr/bin/env node
'use strict';
/**
 * Workspace search results layout confirmation. Compatible current v6 sources.
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
              "label": "Workspace search results layout 1",
              "before": "      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}\n        query={contributions.query} mine={contributions.mine} busy={contributions.busy} waiting={contributions.waiting} onComposition={contributions.setComposing} onSubmit={contributions.submitSearch} onClear={contributions.clearSearch} onQuery={contributions.setQuery} onMine={contributions.setMine} />\n      {contributions.error&&<div role=\"alert\" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}\n      {owner&&<WorkspaceCategoryEditor key={'categories:'+active} sectionRef={categoriesRef} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>{contributions.refresh();setMessage(text('Workspace category saved.'));});}} />}\n      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}\n      {canWrite&&<WorkspaceContributionDraft key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}\n",
              "after": "      <WorkspaceContributionTools statistics={contributions.page?.statistics||null} categories={categories} loaded={records.length}\n        query={contributions.query} mine={contributions.mine} busy={contributions.busy} waiting={contributions.waiting} onComposition={contributions.setComposing} onSubmit={contributions.submitSearch} onClear={contributions.clearSearch} onQuery={contributions.setQuery} onMine={contributions.setMine} />\n      {contributions.error&&<div role=\"alert\" style={{color:'#ffb8a6'}}>{text(contributions.error)} {text('Ask the operator to apply workspace migration 003 if this service has not been upgraded.')}</div>}\n      <div ref={resultsRef} tabIndex={-1} role=\"region\" aria-label={text('Loaded contributions')} aria-busy={contributions.busy} style={{display:'grid',gap:10,minWidth:0,scrollMarginTop:10}}><div style={{...row,justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #567363'}}><h3 style={headingStyle}>{text('Search results')}</h3>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',title:note.title||'',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,authorDisplayName:note.author_display_name||null,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>\n      {!contributions.busy&&contributions.page&&<p style={{margin:0,color:'#d3e2d9'}}>{text('Showing')} {records.length} {text('of')} {contributions.page.statistics.matching} {text('matching contributions')}{contributions.query.trim()?` \u00b7 \u201c${contributions.query.trim()}\u201d`:''}{contributions.mine?` \u00b7 ${text('Only my contributions')}`:''}</p>}\n      {contributions.busy&&<p role=\"status\" style={{margin:0}}>{text(contributions.waiting?'Waiting for you to finish typing\u2026':'Updating results\u2026')}{records.length>0&&' '+text('Previous results remain visible until the search finishes.')}</p>}\n      {contributionCards}\n      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n      {!contributions.busy&&!contributions.error&&!records.length&&<div style={{...card,padding:16}}><strong>{text('No contributions match the current filters.')}</strong><span>{text('Try a different search or turn off Only my contributions.')}</span>{(contributions.query||contributions.mine)&&<button type=\"button\" style={secondary} onClick={()=>{contributions.clearSearch();contributions.setMine(false);}}>{text('Show all contributions')}</button>}</div>}\n      </div>\n      {owner&&<WorkspaceCategoryEditor key={'categories:'+active} sectionRef={categoriesRef} categories={categories} busy={busy} onSave={(name,color,archived)=>{const api=client.current!;void run(()=>api.setCategory(active,name,color,archived),()=>{contributions.refresh();setMessage(text('Workspace category saved.'));});}} />}\n      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}\n      {canWrite&&<WorkspaceContributionDraft key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}\n"
            },
            {
              "label": "Workspace search results layout 2",
              "before": "        </div>\n      </details>}\n\n      <div ref={resultsRef} tabIndex={-1} role=\"region\" aria-label={text('Loaded contributions')} style={row}><h3 style={headingStyle}>{text('Loaded contributions')} ({records.length})</h3>{action('Export loaded notes',()=>{const data={type:'FeatureCollection',features:records.map(note=>({type:'Feature',geometry:{type:'Point',coordinates:[note.lon,note.lat]},properties:{id:`workspace:${note.id}`,source:'manual',title:note.title||'',category:note.category,categoryColor:categories.find(category=>category.name===note.category)?.color||'#f5a623',note:note.note_text,resolutionNote:note.resolution_note,status:note.status,risk_label:note.risk_label,imageId:note.image_id,workspaceId:note.workspace_id,authorId:note.author_id,authorDisplayName:note.author_display_name||null,createdAt:note.created_at,updatedAt:note.updated_at}}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/geo+json'}));const link=document.createElement('a');link.href=url;link.download='workspace-notes.geojson';link.click();URL.revokeObjectURL(url);},busy||!records.length)}</div>\n      {contributionCards}\n      {contributions.hasMore&&action('Load more notes',contributions.loadMore,contributions.busy)}\n      {!contributions.busy&&!records.length&&<p>{text('No contributions match the current filters.')}</p>}\n    </React.Fragment>}\n    {removal?.kind==='note'&&<div role=\"group\" aria-label={text('Confirm removal')} style={card}><span>{text('Remove this shared note from the operator\u2019s service?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{await api.removeNote(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}\n    {busy&&<span role=\"status\">{text('Working with the selected workspace\u2026')}</span>}\n",
              "after": "        </div>\n      </details>}\n\n\n    </React.Fragment>}\n    {removal?.kind==='note'&&<div role=\"group\" aria-label={text('Confirm removal')} style={card}><span>{text('Remove this shared note from the operator\u2019s service?')}</span>{action('Confirm removal',()=>{const api=client.current!,target=removal;void run(async()=>{await api.removeNote(active,target.id);return api.members(active);},members=>{contributions.refresh();setMembers(members);setRemoval(null);});})}{action('Cancel',()=>setRemoval(null))}</div>}\n    {busy&&<span role=\"status\">{text('Working with the selected workspace\u2026')}</span>}\n"
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
              "label": "Workspace search results layout 1",
              "before": "    </details></React.Fragment>}\n    <label style={field}>{text('Search contributions')}<input aria-label={text('Search contributions')} style={input} type=\"search\" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} onCompositionStart={()=>onComposition(true)} onCompositionEnd={event=>{onQuery(event.currentTarget.value);onComposition(false);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();onSubmit();}}} placeholder={text('Title, category, description, status or follow-up')} /></label>\n    {query&&<button type=\"button\" style={button} onClick={onClear}>{text('Clear search')}</button>}\n    <label><input type=\"checkbox\" checked={mine} onChange={event=>onMine(event.target.checked)} /> {text('Only my contributions')}</label>\n    <span role=\"status\">{waiting?text('Search starts after you stop typing. Press Enter to search now.'):busy?text('Loading contributions\u2026'):statistics?`${loaded} / ${statistics.matching} ${text('matching contributions loaded on map')}`:text('Contributions have not loaded.')}</span>\n    {statistics&&loaded<statistics.matching&&<small>{text('The map shows loaded results. Load more to display the remaining matches.')}</small>}\n  </div>;\n}\n",
              "after": "    </details></React.Fragment>}\n    <label style={field}>{text('Search contributions')}<input aria-label={text('Search contributions')} style={input} type=\"search\" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} onCompositionStart={()=>onComposition(true)} onCompositionEnd={event=>{onQuery(event.currentTarget.value);onComposition(false);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();onSubmit();}}} placeholder={text('Title, category, description, status or follow-up')} /></label>\n    {query&&<button type=\"button\" style={button} onClick={onClear}>{text('Clear search')}</button>}\n    <label style={{display:'flex',alignItems:'center',gap:8}}><input style={{margin:0,flexShrink:0}} type=\"checkbox\" checked={mine} onChange={event=>onMine(event.target.checked)} /> {text('Only my contributions')}</label>\n    <span role=\"status\" aria-live=\"polite\" style={{padding:'8px 10px',background:'#ffffff0a',borderInlineStart:'3px solid #88b39e',borderRadius:4}}>{waiting?text('Search starts after you stop typing. Press Enter to search now.'):busy?text('Loading contributions\u2026'):statistics?`${statistics.matching} ${text('matching contributions')} \u00b7 ${text('Results are directly below.')}`:text('Contributions have not loaded.')}</span>\n    {statistics&&loaded<statistics.matching&&<small>{text('The list and map show the same loaded results. Use Load more notes below to see more matches.')}</small>}\n  </div>;\n}\n"
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
              "label": "Workspace search results layout 1",
              "before": "  assert.equal(await page.getByLabel('Risk opinion',{exact:true}).count(),0);await page.getByRole('button',{name:'Publish selected note',exact:true}).click();await page.getByText('Note published.',{exact:true}).waitFor();assert.equal(records.length,1);assert.equal(records[0].category,'Inspection');assert.equal(records[0].risk_label,null);checks++;\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes[0].workspace.color),'#e53935');assert.equal(await page.evaluate(()=>focused.length),0);checks++;\n  assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes[0].workspace.authorName),'Alex');assert.equal(await page.getByText('Alex \u00b7 #1000\u20260001',{exact:true}).count(),2);checks++;\n  const beforeRenameVersion=records[0].updated_at||records[0].created_at;\n  await page.getByRole('button',{name:'Edit display name',exact:true}).click();await page.getByLabel('Workspace display name',{exact:true}).fill('Alex Owner');await page.getByRole('button',{name:'Save display name',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes[0]?.workspace.authorName==='Alex Owner');assert.equal(records[0].updated_at||records[0].created_at,beforeRenameVersion);checks++;\n  await page.getByRole('button',{name:'Read contributions',exact:true}).click();assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Loaded contributions');checks++;\n",
              "after": "  assert.equal(await page.getByLabel('Risk opinion',{exact:true}).count(),0);await page.getByRole('button',{name:'Publish selected note',exact:true}).click();await page.getByText('Note published.',{exact:true}).waitFor();assert.equal(records.length,1);assert.equal(records[0].category,'Inspection');assert.equal(records[0].risk_label,null);checks++;\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes[0].workspace.color),'#e53935');assert.equal(await page.evaluate(()=>focused.length),0);checks++;\n  assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes[0].workspace.authorName),'Alex');assert.equal(await page.getByText('Alex \u00b7 #1000\u20260001',{exact:true}).count(),2);checks++;\n  assert.equal(await page.getByRole('region',{name:'Loaded contributions',exact:true}).evaluate(node=>{\n    const search=document.querySelector('[aria-label=\"Search contributions\"]');\n    const section=search.closest('.mly-workspace-section');\n    return section.nextElementSibling===node&&node.querySelector('article')!==null;\n  }),true);checks++;\n  const beforeRenameVersion=records[0].updated_at||records[0].created_at;\n  await page.getByRole('button',{name:'Edit display name',exact:true}).click();await page.getByLabel('Workspace display name',{exact:true}).fill('Alex Owner');await page.getByRole('button',{name:'Save display name',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes[0]?.workspace.authorName==='Alex Owner');assert.equal(records[0].updated_at||records[0].created_at,beforeRenameVersion);checks++;\n  await page.getByRole('button',{name:'Read contributions',exact:true}).click();assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Loaded contributions');checks++;\n"
            },
            {
              "label": "Workspace search results layout 2",
              "before": "  await page.getByRole('button',{name:'Update contribution',exact:true}).click();await edit.getByLabel('Contribution title',{exact:true}).fill('Updated observation title');await edit.getByLabel('Contribution description',{exact:true}).fill('Edited visibility report');await edit.getByLabel('Outcome / follow-up (optional)',{exact:true}).fill('Inspected on site; follow-up scheduled.');await edit.getByLabel('Status',{exact:true}).selectOption('completed');\n  // At a short controller height, actions remain inside the scroll viewport.\n  await page.evaluate(()=>{document.getElementById('root').style.height='360px';});\n  await page.getByRole('tabpanel',{name:'Workspace notes',exact:true}).evaluate(node=>node.scrollTop=node.scrollHeight);\n  assert.equal(await edit.getByRole('button',{name:'Cancel',exact:true}).evaluate(node=>{const r=node.getBoundingClientRect(),p=node.closest('[role=\"tabpanel\"]').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom;}),true);checks++;\n  assert.equal(await page.locator('.mly-notes-sheet').evaluate(node=>node.scrollHeight<=node.clientHeight+1),true);assert.equal(await page.getByRole('tabpanel',{name:'Workspace notes',exact:true}).evaluate(node=>getComputedStyle(node).scrollbarWidth),'thin');checks++;\n  await page.evaluate(()=>{document.getElementById('root').style.height='600px';});await edit.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByText('Status: Completed',{exact:true}).waitFor();assert.equal(records[0].risk_label,'high');assert.equal(records[0].note_text,'Edited visibility report');assert.equal(records[0].title,'Updated observation title');assert.equal(records[0].resolution_note,'Inspected on site; follow-up scheduled.');assert.equal(await page.evaluate(()=>panelProps.notes[0].note),'Review visibility');checks++;\n",
              "after": "  await page.getByRole('button',{name:'Update contribution',exact:true}).click();await edit.getByLabel('Contribution title',{exact:true}).fill('Updated observation title');await edit.getByLabel('Contribution description',{exact:true}).fill('Edited visibility report');await edit.getByLabel('Outcome / follow-up (optional)',{exact:true}).fill('Inspected on site; follow-up scheduled.');await edit.getByLabel('Status',{exact:true}).selectOption('completed');\n  // At a short controller height, actions remain inside the scroll viewport.\n  await page.evaluate(()=>{document.getElementById('root').style.height='360px';});\n  await edit.getByRole('button',{name:'Cancel',exact:true}).scrollIntoViewIfNeeded();\n  assert.equal(await edit.getByRole('button',{name:'Cancel',exact:true}).evaluate(node=>{const r=node.getBoundingClientRect(),p=node.closest('[role=\"tabpanel\"]').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom;}),true);checks++;\n  assert.equal(await page.locator('.mly-notes-sheet').evaluate(node=>node.scrollHeight<=node.clientHeight+1),true);assert.equal(await page.getByRole('tabpanel',{name:'Workspace notes',exact:true}).evaluate(node=>getComputedStyle(node).scrollbarWidth),'thin');checks++;\n  await page.evaluate(()=>{document.getElementById('root').style.height='600px';});await edit.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByText('Status: Completed',{exact:true}).waitFor();assert.equal(records[0].risk_label,'high');assert.equal(records[0].note_text,'Edited visibility report');assert.equal(records[0].title,'Updated observation title');assert.equal(records[0].resolution_note,'Inspected on site; follow-up scheduled.');assert.equal(await page.evaluate(()=>panelProps.notes[0].note),'Review visibility');checks++;\n"
            },
            {
              "label": "Workspace search results layout 3",
              "before": "  assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeTyping);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes.length),56);checks++;\n  await page.clock.runFor(400);await page.clock.resume();\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1&&mapSnapshots.at(-1)?.notes[0].note==='Hidden match beyond first page');assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeTyping+1);assert.equal(await page.getByRole('button',{name:'Show on map',exact:true}).count(),1);assert.equal(await page.getByText('Total contributions: 56',{exact:true}).count(),1);checks++;\n  const beforeComposition=requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length;\n  await page.getByLabel('Search contributions',{exact:true}).dispatchEvent('compositionstart');await page.getByLabel('Search contributions',{exact:true}).fill('Other observation');await page.waitForTimeout(850);assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeComposition);checks++;\n  await page.getByLabel('Search contributions',{exact:true}).dispatchEvent('compositionend',{data:'Other observation'});await page.getByLabel('Search contributions',{exact:true}).press('Enter');await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50&&mapSnapshots.at(-1).notes.every(note=>note.note.startsWith('Other observation')));checks++;\n",
              "after": "  assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeTyping);assert.equal(await page.evaluate(()=>mapSnapshots.at(-1).notes.length),56);checks++;\n  await page.clock.runFor(400);await page.clock.resume();\n  await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===1&&mapSnapshots.at(-1)?.notes[0].note==='Hidden match beyond first page');assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeTyping+1);assert.equal(await page.getByRole('button',{name:'Show on map',exact:true}).count(),1);assert.equal(await page.getByText('Total contributions: 56',{exact:true}).count(),1);checks++;\n  assert.equal(await page.getByLabel('Search contributions',{exact:true}).evaluate(node=>document.activeElement===node),true);\n  await page.getByRole('region',{name:'Loaded contributions',exact:true}).getByText('Showing 1 of 1 matching contributions \u00b7 \u201cHidden match\u201d',{exact:true}).waitFor();checks++;\n  await page.getByLabel('Search contributions',{exact:true}).fill('no-such-observation-xyz');await page.getByLabel('Search contributions',{exact:true}).press('Enter');\n  await page.getByText('No contributions match the current filters.',{exact:true}).waitFor();assert.equal(await page.getByRole('region',{name:'Loaded contributions',exact:true}).getByRole('button',{name:'Show all contributions',exact:true}).count(),1);checks++;\n  await page.getByRole('button',{name:'Show all contributions',exact:true}).click();await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50);checks++;\n  const beforeComposition=requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length;\n  await page.getByLabel('Search contributions',{exact:true}).dispatchEvent('compositionstart');await page.getByLabel('Search contributions',{exact:true}).fill('Other observation');await page.waitForTimeout(850);assert.equal(requests.filter(item=>item.path==='/rest/v1/rpc/mly_workspace_contributions').length,beforeComposition);checks++;\n  await page.getByLabel('Search contributions',{exact:true}).dispatchEvent('compositionend',{data:'Other observation'});await page.getByLabel('Search contributions',{exact:true}).press('Enter');await page.waitForFunction(()=>mapSnapshots.at(-1)?.notes.length===50&&mapSnapshots.at(-1).notes.every(note=>note.note.startsWith('Other observation')));checks++;\n"
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
const prefix = 'workspace-search-results-layout-';

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
    if (manifest.installer !== 'workspace-search-results-layout' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-search-results-layout.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace search results layout confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'workspace-search-results-layout', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Workspace search results layout confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
