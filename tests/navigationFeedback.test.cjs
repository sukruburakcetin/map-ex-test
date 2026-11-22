/** Frozen navigation handlers versus extracted feedback/style modules, recording JSX and side-effect order. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{fileName:'fixture.tsx',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/navigationFeedback.baseline.json','utf8')).methods;
const styleModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/styles/navigationFeedback.ts','utf8')))(styleModule,styleModule.exports);
function fixture(original,{zoom=12,imageId='A',missingView=false,missingImage=false,synced=false,queued=false,locale='en',fail=null}={}){
 const trace=[],pending=[],view={zoom},image={id:'A',lon:1,lat:2};const record=(name,...args)=>{trace.push([name,...args]);if(fail===name)throw 'failed '+name};
 const Icons={Crosshair:'Crosshair',CompassLocked:'CompassLocked',CompassUnlocked:'CompassUnlocked'},React={Fragment:'Fragment'};
 const jsx=(tag,props,...children)=>{const value={tag,props:props||{},children};record('jsx',structuredClone(value));return value};
 const ui={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/navigation/NavigationFeedback.tsx','utf8')))(id=>{if(id==='jimu-core')return{React,jsx};if(id.endsWith('/Icons'))return Icons;assert.equal(id,'../../styles/navigationFeedback');return styleModule.exports},ui,ui.exports);
 const methods=Object.keys(baseline).map(name=>original?baseline[name]:widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\n');
 const Runtime=new Function('React','jsx','Icons','mapCenteredFeedback','headingSyncFeedback',compile('class Runtime{'+methods+'};return Runtime;'))(React,jsx,Icons,ui.exports.mapCenteredFeedback,ui.exports.headingSyncFeedback);
 const w=new Runtime();w.state={imageId,sequenceImages:missingImage?[]:[image],jimuMapView:missingView?null:{view},syncHeading:synced};
 w._t=key=>{record('translate',key);return locale+':'+key};w.showToast=(...args)=>record('toast',structuredClone(args));
 w.navigateMapView=(v,target,options)=>{assert.equal(v,view);record('navigate',structuredClone(target),structuredClone(options))};
 w.setState=patch=>{record('state',structuredClone(patch));if(queued)pending.push(()=>Object.assign(w.state,patch));else Object.assign(w.state,patch)};
 return{w,trace,view,image,center:()=>w.handleCenterMap(),toggle:()=>w.handleToggleSyncHeading(),flush:()=>{while(pending.length)pending.shift()()}};
}
function compare(action,options){const a=fixture(true,options),b=fixture(false,options);action(a);action(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b;}
for(const zoom of [0,12,17,20,NaN])test('center feedback preserves target, options and presentation at zoom '+zoom,()=>compare(f=>{f.center();assert.equal(f.trace[0][0],'navigate');assert.equal(f.trace.at(-1)[0],'toast');assert.equal(f.trace.at(-1)[1].length,1)},{zoom}));
for(const options of [{imageId:null},{missingView:true},{missingImage:true},{imageId:1}])test('missing/mismatched center context publishes nothing '+JSON.stringify(options),()=>compare(f=>{f.center();assert.equal(f.trace.length,0)},options));
for(const synced of [false,true])for(const locale of ['en','tr'])test('heading feedback retains state/icon/translation branch '+synced+'/'+locale,()=>compare(f=>{f.toggle();assert.equal(f.w.state.syncHeading,!synced);assert.equal(f.trace[0][0],'state');assert.equal(f.trace.at(-1)[1].length,1)},{synced,locale}));
test('queued heading state still uses the click-time branch',()=>compare(f=>{f.toggle();assert.equal(f.w.state.syncHeading,false);f.flush();assert.equal(f.w.state.syncHeading,true)},{queued:true}));
test('repeated heading toggles retain alternating feedback and final state',()=>compare(f=>{f.toggle();f.toggle();assert.equal(f.w.state.syncHeading,false);assert.equal(f.trace.filter(e=>e[0]==='toast').length,2)}));
for(const fail of ['navigate','jsx','translate','toast'])test('center '+fail+' failure keeps the original side-effect boundary',()=>compare(f=>assert.throws(f.center,e=>e==='failed '+fail),{fail}));
for(const fail of ['state','jsx','translate','toast'])test('heading '+fail+' failure keeps the original state/publication boundary',()=>compare(f=>assert.throws(f.toggle,e=>e==='failed '+fail),{fail}));
test('feedback style factory preserves values and per-message object independence',()=>{const a=styleModule.exports.navigationFeedbackStyle(),b=styleModule.exports.navigationFeedbackStyle();assert.deepEqual(a,{display:'flex',alignItems:'center',gap:'6px'});assert.notEqual(a,b);a.gap='99px';assert.equal(b.gap,'6px')});
