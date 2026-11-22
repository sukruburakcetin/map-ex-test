/** Compare frozen Nearby navigation with the extracted owner using controlled viewer completions. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/nearbyImageSelection.baseline.json','utf8')).members;
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const flush=()=>new Promise(r=>setImmediate(r));
const poseModule={exports:{}};
new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/nearbyHighlight.ts','utf8')))(()=>({}),poseModule,poseModule.exports);
const {nearbyImagePose}=poseModule.exports;
const moduleFixture={exports:{}};
new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/NearbyImageSelection.ts','utf8')))(name=>{assert.equal(name,'./nearbyHighlight');return{nearbyImagePose}},moduleFixture,moduleFixture.exports);
const {NearbyImageSelection}=moduleFixture.exports;
function fixture(original){
 const Runtime=new Function('NearbyImageSelection','nearbyImagePose',compile('class Runtime{'+(original?baseline:member('_nearbyImageSelection')+'\n'+member('selectNearbyImage'))+'};return Runtime;'))(NearbyImageSelection,nearbyImagePose);
 const w=new Runtime(),trace=[],moves=[],reads=[];w.state={jimuMapView:{view:{id:'view-A'}}};w._selectionRequestId=1;
 w._nearbyDiscovery={cancel:()=>trace.push(['cancel'])};w.highlightNearbyPin=value=>trace.push(['preview',value]);
 w.forceUpdate=()=>trace.push(['force',w._nearbySelectedId]);w.requestConeRedraw=view=>trace.push(['redraw',view.id]);w.log=(...args)=>trace.push(['warn',...args]);
 const viewer={moveTo(id){trace.push(['move',id]);const d=deferred();moves.push(d);return d.promise},getImage(){trace.push(['get']);const d=deferred();reads.push(d);return d.promise},setCenter(center){trace.push(['center',center])}};
 w.mapillaryViewer=viewer;return{w,trace,moves,reads,viewer,open:img=>w.selectNearbyImage(img)};
}
const image={id:'A',geometry:{type:'Point',coordinates:[0,0]},compass_angle:90};
async function compare(action){const a=fixture(true),b=fixture(false);await action(a);await action(b);assert.deepEqual(b.trace,a.trace);assert.equal(b.w._lastBearing,a.w._lastBearing);assert.equal(b.w._nearbySelectedId,a.w._nearbySelectedId);return b;}
async function complete(f,img=image,confirmed={id:img.id,compassAngle:0}){const task=f.open(img);f.moves.at(-1).resolve();await flush();f.reads.at(-1).resolve(confirmed);await task;}
for(const [name,img,confirmed] of [
 ['normal',image,{id:'A',compassAngle:0}],['zero heading',{...image,compass_angle:0},{id:'A',compassAngle:90}],
 ['wrapped heading',{...image,compass_angle:450},{id:'A',compassAngle:720}],['missing image bearing',image,{id:'A'}],
 ['computed pose',{...image,computed_geometry:{coordinates:[1,2]},computed_compass_angle:180},{id:'A',compassAngle:90}],
 ['missing pose',{id:'A'},{id:'A'}],['missing heading',{...image,compass_angle:undefined},{id:'A'}],
 ['wrong confirmed image',image,{id:'B'}],['string identity',image,{id:'A',compassAngle:-90}],
])test(name+' preserves pose and publication trace',()=>compare(f=>complete(f,img,confirmed)));
test('no viewer starts no work',()=>compare(async f=>{f.w.mapillaryViewer=null;await f.open(image);assert.equal(f.trace.length,0)}));
test('no view still restores viewer center without drawing a cone',()=>compare(async f=>{f.w.state.jimuMapView=undefined;await complete(f)}));
for(const boundary of ['move','get'])for(const change of ['viewer','selection','view'])test(`${change} change during ${boundary} suppresses stale heading`,()=>compare(async f=>{
 const task=f.open(image);if(boundary==='get'){f.moves[0].resolve();await flush()}
 if(change==='viewer')f.w.mapillaryViewer={};else if(change==='selection')f.w._selectionRequestId++;else f.w.state.jimuMapView.view={id:'view-B'};
 if(boundary==='get')f.reads[0].resolve({id:'A',compassAngle:0});else {f.moves[0].resolve();await flush();assert.equal(f.reads.length,0)}await task;
 assert.equal(f.trace.some(e=>e[0]==='center'),false);assert.equal(f.reads.length,boundary==='get'?1:0);
}));
for(const boundary of ['move','get'])test(`superseded Nearby selection during ${boundary} cannot rotate the new image`,()=>compare(async f=>{
 const first=f.open(image);if(boundary==='get'){f.moves[0].resolve();await flush()}
 const second=f.open({...image,id:'B',compass_angle:180});f.moves[1].resolve();await flush();f.reads.at(-1).resolve({id:'B',compassAngle:0});await second;
 if(boundary==='get')f.reads[0].resolve({id:'A',compassAngle:0});else {f.moves[0].resolve();await flush();assert.equal(f.reads.length,1)}await first;assert.equal(f.trace.filter(e=>e[0]==='center').length,1);
}));
for(const boundary of ['move','get','center'])for(const stale of [false,true])test(`${boundary} rejection warning; stale=${stale}`,()=>compare(async f=>{
 const task=f.open(image);if(boundary!=='move'){f.moves[0].resolve();await flush()}
 if(stale)f.w._selectionRequestId++;
 if(boundary==='move')f.moves[0].reject('move failed');else if(boundary==='get')f.reads[0].reject('get failed');else{f.viewer.setCenter=()=>{throw 'center failed'};f.reads[0].resolve({id:'A',compassAngle:0})}
 await task;assert.equal(f.trace.filter(e=>e[0]==='warn').length,stale?0:1);
}));
test('discovery cancellation remains outside the navigation error boundary',()=>compare(async f=>{f.w._nearbyDiscovery.cancel=()=>{throw 'cancel failed'};await assert.rejects(f.open(image),e=>e==='cancel failed');assert.equal(f.moves.length,0)}));
test('preview publication remains outside the navigation error boundary',()=>compare(async f=>{f.w.highlightNearbyPin=()=>{throw 'preview failed'};await assert.rejects(f.open(image),e=>e==='preview failed');assert.equal(f.moves.length,0)}));
test('missing discovery owner is optional',()=>compare(async f=>{f.w._nearbyDiscovery=undefined;await complete(f)}));
test('successive completed selections reuse the same owner',()=>compare(async f=>{await complete(f);await complete(f,{...image,id:'B',compass_angle:180});assert.equal(f.trace.filter(e=>e[0]==='center').length,2)}));
test('widget forwards the exact owner promise',()=>{const f=fixture(false),promise=Promise.resolve();let selected;f.w._nearbyImageSelection={open:img=>{selected=img;return promise}};assert.equal(f.open(image),promise);assert.equal(selected,image)});
