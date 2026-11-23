/** Real extracted runtime JSX, independent of live SDK/network. */
const { loadReact } = require('./helpers/browserReact.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');
const rootDir = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(rootDir, file), 'utf8');
const source = read('src/runtime/widget.tsx');
const sf = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const trayBindings = [];
function visit(node) {
 if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sf) === 'ImageTray') trayBindings.push(node);
 ts.forEachChild(node, visit);
}
visit(sf);
assert.equal(trayBindings.length, 1, 'Use the actual ImageTray binding from the widget');
const compile = (source, fileName, jsxFactory) => ts.transpileModule(source, {
 fileName, compilerOptions: {
  jsx: ts.JsxEmit.React, jsxFactory, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
 },
}).outputText;
const files = {
 binding: compile('return function(){return ' + trayBindings[0].getText(sf) + '}', 'binding.tsx', 'React.createElement'),
 tray: compile(read('src/features/imagery/ImageTray.tsx'), 'ImageTray.tsx', 'jsx'),
 styles: compile(read('src/styles/imageTray.ts'), 'imageTray.ts'),
};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [240,393,900]){const page=await browser.newPage({viewport:{width:Math.max(width,393),height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<div id="root" style="position:relative;height:300px;width:'+width+'px;background:#314c3c"></div>');await loadReact(page);await page.evaluate(({binding,tray,styles})=>{const OwnedMessage=({source,values={}})=>React.createElement('span',null,source.replace(/\{(\w+)\}/g,(_,k)=>values[k]??'')),styleModule={},trayModule={};
 new Function('exports',styles)(styleModule);
 const dependencies={'jimu-core':{React,jsx:React.createElement},'../../i18n/WidgetLocale':{OwnedMessage},'../../styles/imageTray':styleModule};
 new Function('exports','require',tray)(trayModule,name=>{
  if (!Object.hasOwn(dependencies,name)) throw Error('Unexpected ImageTray dependency: '+name);
  return dependencies[name];
 });
 const render=new Function('React','ImageTray',binding)(React,trayModule.ImageTray),pixel='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';window.calls=[];window.w={state:{nearbyImages:[{id:'A',geometry:{coordinates:[1,2]},captured_at:1,thumb_256_url:pixel}],alternateImages:[],nearbyCanExpand:true,imageTrayTab:'nearby',nearbyLoading:false,nearbyStripOpen:true,imageId:'current',isFetchingAlternates:false,selectedFeatureMetadata:{id:'object'}},_t:key=>key,_owned:text=>text,highlightNearbyPin(){},revealDetectionTools(){},refreshNearbyAfterPause:(...args)=>calls.push(args),_nearbyDiscovery:{flush:()=>calls.push('flush')},setState(patch){Object.assign(this.state,patch);root.render(render.call(this))}};window.root=ReactDOM.createRoot(document.getElementById('root'));root.render(render.call(w));},files);
 await page.getByRole('button',{name:'Search more',exact:true}).waitFor();await page.getByRole('button',{name:'Search more',exact:true}).click();assert.deepEqual(await page.evaluate(()=>calls.filter(Array.isArray)),[[true,true]]);checks++;
 const list=page.getByRole('tabpanel',{name:'appNearbyImages',exact:true});await list.hover();assert.equal(await page.evaluate(()=>w._nearbyPointerInside),true);await page.mouse.move(0,0);assert.equal(await page.evaluate(()=>w._nearbyPointerInside),false);assert(await page.evaluate(()=>calls.includes('flush')));checks++;
 await page.evaluate(()=>w.setState({nearbyLoading:true,nearbyImages:[]}));await page.getByRole('status').filter({hasText:'Loading nearby captures…'}).waitFor();assert.equal(await page.getByRole('button',{name:'Search more',exact:true}).isDisabled(),true);checks++;
 assert.equal(await page.locator('.mapillary-image-tray').evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);assert.deepEqual(errors,[]);checks++;await page.close();}console.log(checks+' Nearby tray Chromium checks passed at240,393 and900px.');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
