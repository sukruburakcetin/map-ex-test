/** Compact Enterprise sheet: real React/Chromium geometry and scrolling; service calls are fixtures. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),modules={};
function add(file){const key=path.relative(root,file).replace(/\\/g,'/');if(modules[key])return key;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;modules[key]={code,deps:{}};for(const match of code.matchAll(/require\(["']([^"']+)["']\)/g)){const id=match[1];if(id==='jimu-core'||id.endsWith('WidgetLocale'))continue;let resolved=path.resolve(path.dirname(file),id);if(!path.extname(resolved)){const names=fs.readdirSync(path.dirname(resolved));let name;for(const extension of ['.ts','.tsx']){name=names.find(name=>name.toLowerCase()===(path.basename(resolved)+extension).toLowerCase());if(name)break;}if(!name)throw Error('Unresolved '+resolved);resolved=path.join(path.dirname(resolved),name);}modules[key].deps[id]=add(resolved);}return key;}
const panel=add(path.join(root,'src/components/FieldNotesPanel.tsx')),en=add(path.join(root,'src/i18n/messages.ts'));
const bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};let catalog;
const owned=(text,values={})=>text.replace(/\\{(\\w+)\\}/g,(_,key)=>values[key]??'{'+key+'}');
const locale={locale:'en',formatLocale:'en-US',owned,t:(key,values)=>owned(catalog[key]||key,values)};
function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>locale,OwnedMessage:({source,values})=>owned(source,values)}:load(entry.deps[id]),m,m.exports);return m.exports;}
catalog=load(${JSON.stringify(en)}).en;const Panel=load(${JSON.stringify(panel)}).FieldNotesPanel;
window.mount=(width=393,height=480)=>{window.root?.unmount();document.body.innerHTML='<div id="root"></div>';const host=document.getElementById('root');Object.assign(host.style,{width:width+'px',height:height+'px',position:'relative',background:'#14251d'});window.loads=[];window.actions=[];
const notes=Array.from({length:19},(_,i)=>({id:'enterprise-'+(i+1),category:'Observation '+(i+1),note:'Enterprise record '+(i+1)+' with a description that wraps on narrow screens.',createdAt:1700000000000+i,source:'manual',lon:1,lat:2,status:'in_progress',sharedGlobalId:'record-'+i,sharedLayerUrl:'https://example.test/FeatureServer/0'}));
const loadPage=async(offset,signal)=>{loads.push(offset);return offset===0?{notes,nextOffset:19,hasMore:true}:{notes:[{...notes[0],id:'enterprise-20',category:'Observation 20',note:'Additional loaded record'}],nextOffset:20,hasMore:false};};
window.root=ReactDOM.createRoot(host);window.panelProps={notes:notes.slice(0,4).map((n,i)=>({...n,id:"local-"+(i+1),category:"Local observation "+(i+1),sharedStatus:"shared"})),pendingNote:null,isAnnotationMode:false,listOpen:true,enterpriseEnabled:true,sharingEnabled:true,sharedMessage:'Enterprise map · updates every 15 seconds',onLoadEnterpriseNotes:loadPage,onFocusNote:note=>actions.push(['focus',note.id]),onEditSharedNote:note=>actions.push(['edit',note.id]),onAttachments:note=>actions.push(['attachments',note.id]),onSubmitNote:()=>{},onCancelPending:()=>{},onDeleteNote:id=>actions.push(['remove',id]),onClearAll:()=>{},onExport:()=>{},onImportFile:()=>{},onCloseList:()=>{actions.push(['close']);window.setListOpen(false);}};window.setListOpen=value=>root.render(React.createElement(Panel,{...panelProps,listOpen:value}));window.setListOpen(true);};})();`;
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1700,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));let checks=0;
try{
 await page.setContent('<html><head><style>label, input, summary, p, button { font-size:19px; line-height:2; }</style></head><body style="margin:0"></body></html>');
 await page.addScriptTag({path:process.env.REACT_UMD_PATH||path.join(path.dirname(require.resolve('react/package.json')),'umd/react.development.js')});
 await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||path.join(path.dirname(require.resolve('react-dom/package.json')),'umd/react-dom.development.js')});
 await page.addScriptTag({content:bootstrap});
 for(const [width,height] of [[1566,650],[393,480],[240,480],[393,300]]){
  await page.evaluate(([w,h])=>mount(w,h),[width,height]);await page.getByRole('tab',{name:'Enterprise',exact:true}).click();
  await page.getByText('Observation 19',{exact:true}).waitFor();
  const content=page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}),handle=page.getByRole('button',{name:'Expand notes panel',exact:true});
  assert.equal(await handle.getAttribute('aria-expanded'),'false');
  assert.equal(await content.evaluate(node=>node.clientHeight>30&&node.scrollHeight>node.clientHeight&&getComputedStyle(node).overflowY==='auto'),true,`${width}x${height}: compact content must have a usable viewport`);checks++;
  assert.equal(await content.evaluate(node=>{const rows=node.querySelector('strong').parentElement.parentElement.parentElement;return getComputedStyle(rows).overflowY!=='auto'&&getComputedStyle(rows).overflowY!=='scroll'&&rows.scrollHeight<=rows.clientHeight+1;}),true,'cards must not be squeezed into a nested scrollbar');checks++;
  const footer=page.getByText('19 of 19 notes',{exact:true}).locator('..');
  assert.equal(await footer.evaluate(n=>getComputedStyle(n).display==='flex'&&n.scrollWidth<=n.clientWidth+1),true);assert.equal(await footer.locator('span').count(),3);checks++;
  if(width===1566){const tops=await footer.locator('span').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));assert(Math.max(...tops)-Math.min(...tops)<2,'wide Enterprise guidance should be inline');checks++;}
  const fixed=await handle.boundingBox();await content.focus();await page.keyboard.press('PageDown');await page.waitForFunction(()=>document.querySelector('[role="tabpanel"][aria-label="Enterprise notes"]').scrollTop>0);checks++;
  await content.hover();await page.mouse.wheel(0,600);await page.waitForTimeout(150);assert.deepEqual(await handle.boundingBox(),fixed);assert.equal(await page.locator('.mly-notes-sheet').evaluate(n=>n.scrollHeight<=n.clientHeight+1),true);checks++;
  await page.getByText('Observation 19',{exact:true}).scrollIntoViewIfNeeded();const last=content.locator('strong').filter({hasText:/^Observation 19$/}).locator('../../..');
  await last.getByRole('button',{name:'Show on map',exact:true}).click();await last.getByRole('button',{name:'Update shared',exact:true}).click();await last.getByRole('button',{name:'Attachments',exact:true}).click();assert.deepEqual(await page.evaluate(()=>actions),[['focus','enterprise-19'],['edit','enterprise-19'],['attachments','enterprise-19']]);checks++;
  await page.getByRole('button',{name:'Load more',exact:true}).click();await page.getByText('Observation 20',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>loads),[0,19]);checks++;
  await content.evaluate(n=>{n.scrollTop=0});await page.getByRole('searchbox').fill('Additional');await page.getByText('1 of 20 notes',{exact:true}).waitFor();assert.equal(await content.locator('strong').count(),1);assert.deepEqual(await page.evaluate(()=>loads),[0,19]);checks++;
  await page.getByRole('button',{name:'Clear note search'}).click();await page.getByText('20 of 20 notes',{exact:true}).waitFor();await handle.click();await page.getByRole('button',{name:'Collapse notes panel'}).waitFor();assert.equal(await content.locator('strong').count(),20);assert.deepEqual(await page.evaluate(()=>loads),[0,19]);checks++;
 }
 for(const [width,height] of [[1566,650],[393,480],[240,480],[393,300]]){
  await page.evaluate(([w,h])=>mount(w,h),[width,height]);
  const content=page.getByRole('tabpanel',{name:'Local notes',exact:true});await page.getByText('4 of 4 notes',{exact:true}).waitFor();
  assert.equal(await content.getByRole('button',{name:'Show on map',exact:true}).count(),4);assert.equal(await content.evaluate(n=>getComputedStyle(n).overflowY==='auto'&&n.scrollHeight>n.clientHeight),true);checks++;
  await content.focus();await page.keyboard.press('PageDown');await page.waitForFunction(()=>document.querySelector('[role="tabpanel"][aria-label="Local notes"]').scrollTop>0);checks++;
  await page.getByText('Local observation 1',{exact:false}).scrollIntoViewIfNeeded();const row=content.locator('div').filter({has:page.getByText('Local observation 1',{exact:false})}).filter({has:page.getByRole('button',{name:'Show on map',exact:true})}).last();
  await row.getByRole('button',{name:'Show on map',exact:true}).click();assert.deepEqual(await page.evaluate(()=>actions.at(-1)),['focus','local-1']);assert.equal(await page.getByRole('button',{name:'Expand notes panel'}).getAttribute('aria-expanded'),'false');checks++;
  await content.evaluate(n=>{n.scrollTop=0});await page.getByRole('searchbox').fill('Enterprise record 2');await page.getByText('1 of 4 notes',{exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>loads),[]);checks++;
  await page.getByRole('button',{name:'Clear note search'}).click();await page.getByText('4 of 4 notes',{exact:true}).waitFor();assert.equal(await content.getByRole('button',{name:'Show on map',exact:true}).count(),4);checks++;
 }
 for(const [width,height] of [[1566,650],[393,480],[240,480]]){
  await page.evaluate(([w,h])=>mount(w,h),[width,height]);await page.getByRole('searchbox').waitFor();
  const localSize=await page.getByRole('searchbox').evaluate(n=>getComputedStyle(n).fontSize);assert.equal(localSize,'11px');
  await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByRole('tabpanel',{name:'Enterprise notes',exact:true}).waitFor();assert.equal(await page.getByRole('searchbox').evaluate(n=>getComputedStyle(n).fontSize),localSize);checks++;
  await page.getByRole('tab',{name:'Workspaces',exact:true}).click();const workspace=page.getByRole('tabpanel',{name:'Workspace notes',exact:true});await workspace.waitFor();
  assert.equal(await workspace.getByLabel('Project URL',{exact:true}).evaluate(n=>getComputedStyle(n).fontSize),localSize);assert.equal(await workspace.locator('summary').first().evaluate(n=>getComputedStyle(n).fontSize),localSize);assert.equal(await workspace.locator('p').first().evaluate(n=>getComputedStyle(n).fontSize),localSize);assert.equal(await page.getByRole('button',{name:'Close notes list',exact:true}).evaluate(n=>getComputedStyle(n).fontSize),localSize);checks++;
  assert.equal(await workspace.evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);checks++;
 }
 for(const width of [1566,393,240])for(const source of ['Local','Enterprise','Workspaces']){
  await page.evaluate(w=>mount(w,480),width);
  if(source!=='Local')await page.getByRole('tab',{name:source,exact:true}).click();
  if(source==='Workspaces')await page.getByLabel('Project URL',{exact:true}).fill('https://remember.test');
  const close=page.getByRole('button',{name:'Close notes list',exact:true});await close.waitFor();assert.equal(await close.count(),1);assert.equal(await page.getByRole('button',{name:'Close',exact:true}).count(),0);checks++;
  const fixed=await close.boundingBox(),sheet=await page.locator('.mly-notes-sheet').boundingBox();assert(fixed.y>=sheet.y&&fixed.y-sheet.y<12&&sheet.x+sheet.width-fixed.x-fixed.width<12);assert(fixed.width>=32&&fixed.height>=32);checks++;
  const content=page.getByRole('tabpanel');await content.evaluate(n=>{n.scrollTop=n.scrollHeight});assert.deepEqual(await close.boundingBox(),fixed);checks++;
  await close.focus();if(width===1566)await page.keyboard.press('Enter');else if(width===393)await page.keyboard.press('Space');else await close.click();
  await page.locator('.mly-notes-sheet').waitFor({state:'hidden'});assert.deepEqual(await page.evaluate(()=>actions),[['close']]);checks++;
  await page.evaluate(()=>setListOpen(true));await close.waitFor();
  if(source==='Workspaces')assert.equal(await page.getByLabel('Project URL',{exact:true}).inputValue(),'https://remember.test');checks++;
 }
 await page.evaluate(()=>mount());const remove=page.getByRole('button',{name:'Remove local copy; enterprise note remains',exact:true}).first();await remove.waitFor();assert.equal(await remove.locator('svg').count(),1);assert.equal(await remove.textContent(),'');await remove.focus();await page.keyboard.press('Space');assert.deepEqual(await page.evaluate(()=>actions),[['remove','local-4']]);assert.equal(await page.getByRole('button',{name:'Close notes list'}).isVisible(),true);checks++;
 // Like-for-like desktop records use the same header/action/body spacing.
 await page.evaluate(()=>mount(1566,650));const localContent=page.getByRole('tabpanel',{name:'Local notes',exact:true});
 await page.getByText('Local observation 1',{exact:true}).waitFor();const localHeader=page.getByText('Local observation 1',{exact:true}).locator('..');
 assert.equal(await localHeader.getByText('Shared · local copy',{exact:true}).count(),1);
 const titleBox=await page.getByText('Local observation 1',{exact:true}).boundingBox(),stateBox=await localHeader.getByText('Shared · local copy',{exact:true}).boundingBox();assert(Math.abs(titleBox.y-stateBox.y)<3);checks++;
 const localCard=localHeader.locator('../..');const localHeight=(await localCard.boundingBox()).height;
 await page.getByRole('tab',{name:'Enterprise',exact:true}).click();await page.getByText('Observation 1',{exact:true}).waitFor();const enterpriseCard=page.getByText('Observation 1',{exact:true}).locator('../../..');
 assert(Math.abs((await enterpriseCard.boundingBox()).height-localHeight)<2,'equivalent Local/Enterprise records should have equal desktop height');checks++;
 await page.evaluate(()=>mount(240,480));await page.getByText('Local observation 1',{exact:true}).waitFor();
 assert.equal(await page.getByRole('tabpanel',{name:'Local notes',exact:true}).evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);assert.equal(await page.getByText('Shared · local copy',{exact:true}).count(),4);checks++;
 assert.deepEqual(errors,[]);console.log(checks+' unified notes closing, removal, typography and compact scrolling checks passed at desktop, mobile, narrow and short heights; no panel expansion required.');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
