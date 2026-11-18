const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
const moduleSource=fs.readFileSync(root+'/src/features/minimap/minimapSelection.ts','utf8');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/minimapClickHandler.baseline.json'));
const oldFactory=new Function('nearestMinimapSequenceImage','nearestMinimapDiscoveryImage','console',compile('return '+golden.callback+';'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),a=source.indexOf('      this.minimapView.on("click", createMinimapClickHandler({'),b=source.indexOf('      this.setState({ minimapView:',a);assert(a>0&&b>a);
const register=new Function('createMinimapClickHandler','console',compile(source.slice(a,b)));
const image=(id,lat=0,lon=0)=>({id,lat,lon});
const discovery=[{sequenceId:'found',images:[image('found-A',3),image('found-B',1)]}];
async function execute(old,{images=[image('B',1)],sequenceId='active',currentId='A',results=discovery,failDiscover=false,failJump=false,failLoad=false,invalidEvent=false,deferred=false,changeState=false}={}){
 const events=[];let resolve;const gate=new Promise(r=>resolve=r);
 const measure=(...args)=>{events.push(['distance',...args]);return Math.hypot(args[0]-args[2],args[1]-args[3]);};
 const m={exports:{}};new Function('require','module','exports',compile(moduleSource))(()=>({distanceMeters:measure}),m,m.exports);
 const w={state:{sequenceImages:images,sequenceId,imageId:currentId,isLoading:false,availableSequences:[{sequenceId:'previous'}]},accessToken:'test-token'};
 w.setState=patch=>{events.push(['state',patch]);Object.assign(w.state,patch);};
 w.showNoImageMessage=()=>events.push(['no-image']);
 w.getSequencesInBBox=async(...args)=>{events.push(['discover',...args]);if(failDiscover)throw Error('discovery failed');return deferred?gate:results;};
 w.loadSequenceById=async(...args)=>{events.push(['load',...args]);if(args.length===2&&failJump||args.length===3&&failLoad)throw Error('load failed');};
 const logging={error:(...args)=>events.push(['error',...args.map(v=>v instanceof Error?v.message:v)])};
 let handler;
 if(old)handler=oldFactory.call(w,m.exports.nearestMinimapSequenceImage,m.exports.nearestMinimapDiscoveryImage,logging);
 else {w.minimapView={on:(name,callback)=>{assert.equal(name,'click');handler=callback;}};register.call(w,m.exports.createMinimapClickHandler,logging);}
 let error;
 const pending=handler(invalidEvent?{}:{mapPoint:{longitude:0,latitude:0}});
 await Promise.resolve();
 const pendingEvents=events.slice();
 if(changeState)w.state={...w.state,imageId:'changed',sequenceId:'changed'};
 if(deferred)resolve(results);
 try{await pending;}catch(e){error=e.message;}
 return {events,pendingEvents,error,state:w.state};
}
async function compare(options){const old=await execute(true,options),actual=await execute(false,options);assert.deepEqual(actual,old);return actual;}
test('proximity jump retains two-argument loading without discovery or feedback',async()=>{const r=await compare();assert.deepEqual(r.events.filter(e=>e[0]!=='distance'),[['load','active','B']]);});
for(const n of [4.999,5,5.001])test('strict jump boundary '+n,()=>compare({images:[image('B',n)]}));
test('nearest current image retains discovery fallback',()=>compare({images:[image('A')]}));
test('missing sequence ID skips proximity jumping',()=>compare({sequenceId:null}));
test('empty current sequence retains discovery fallback',()=>compare({images:[]}));
test('discovery picks the nearest result and preserves final update',async()=>{const r=await compare({images:[]});assert(r.events.some(e=>e[0]==='load'&&e[1]==='found'&&e[2]==='found-B'&&e.length===4));assert.deepEqual(r.state.availableSequences,[]);assert.equal(r.state.isLoading,false);});
test('empty discovery retains no-image feedback and loading reset',async()=>{const r=await compare({images:[],results:[]});assert(r.events.some(e=>e[0]==='no-image'));assert.equal(r.state.isLoading,false);});
test('discovered sequences with no images retain no-image feedback',()=>compare({images:[],results:[{sequenceId:'empty',images:[]}]}));
test('jump loading failure propagates outside discovery catch',async()=>{const r=await compare({failJump:true});assert.equal(r.error,'load failed');assert(!r.events.some(e=>e[0]==='error'||e[0]==='state'));});
test('discovery failure is logged and resets loading',async()=>{const r=await compare({images:[],failDiscover:true});assert.equal(r.error,undefined);assert.equal(r.state.isLoading,false);assert(r.events.some(e=>e[0]==='error'));});
test('discovery load failure retains catch boundary and previous overlay state',async()=>{const r=await compare({images:[],failLoad:true});assert.equal(r.error,undefined);assert.deepEqual(r.state.availableSequences,[{sequenceId:'previous'}]);assert.equal(r.state.isLoading,false);});
test('invalid click point retains pre-request error propagation',async()=>{const r=await compare({invalidEvent:true});assert(r.error);assert.deepEqual(r.events,[]);});
test('deferred discovery publishes loading before request and awaits results',async()=>{const r=await compare({images:[],deferred:true});assert.deepEqual(r.pendingEvents.map(e=>e[0]),['state','discover']);assert.equal(r.state.isLoading,false);});
test('state replacement during discovery keeps live host update behavior',()=>compare({images:[],deferred:true,changeState:true}));
test('equal discovery distances retain the first candidate',async()=>{const r=await compare({images:[],results:[{sequenceId:'tie',images:[image('first',1),image('second',1)]}]});assert(r.events.some(e=>e[0]==='load'&&e[2]==='first'));});
