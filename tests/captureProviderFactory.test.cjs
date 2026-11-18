const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const factorySource=fs.readFileSync(root+'/src/features/routing/captureProviderFactory.ts','utf8');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureProviderFactory.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const adapter=widget.members.find(n=>n.name?.getText(sf)==='createCaptureRoutingProvider').getText(sf);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const sdk=label=>Object.fromEntries(['route','networkService','RouteParameters','FeatureSet','Graphic','Point'].map(k=>[k,label+'-'+k]));
function setup(previous,{engine='world',config={},kind='user',reject,constructError,late=false,logError=false}={}){
 const events=[],gate=deferred();let made;
 const create=type=>options=>{events.push([type,options]);if(constructError)throw Error('factory failed');return made={kind:type,label:options.label};};
 const osrm=create('osrm'),arcgis=create('arcgis');let Fixture;
 if(previous)Fixture=new Function('createOSRMRoutingProvider','createArcGISRoutingProvider','PUBLIC_OSRM_BASE_URL',compile('return class Fixture{'+golden.method+'}'))(osrm,arcgis,'https://router.project-osrm.org');
 else {const m={exports:{}};new Function('require','module','exports',compile(factorySource))(id=>id.endsWith('osrmRoutingProvider')?{createOSRMRoutingProvider:osrm}:{createArcGISRoutingProvider:arcgis},m,m.exports);Fixture=new Function('createCaptureProvider',compile('return class Fixture{'+adapter+'}'))(m.exports.createCaptureProvider);}
 const w=new Fixture();w.props={config:Object.freeze({...config})};w.state={routeTravelMode:'drive'};w.ArcGISModules=sdk('initial');
 w.getEffectiveRoutingEngine=()=>{events.push(['engine']);return engine;};
 w.resolveRoutingProvider=()=>{events.push(['resolve']);return late?gate.promise:reject?Promise.reject(reject):Promise.resolve({kind,routeUrl:'https://route.example/service',apiKey:'dummy-key',label:'resolved'});};
 w.log=message=>{events.push(['log',message]);if(logError)throw Error('logger failed');};
 return {w,events,gate,get made(){return made;}};
}
async function compare(options){
 async function run(previous){const f=setup(previous,options);let result,error;const pending=f.w.createCaptureRoutingProvider();assert(pending instanceof Promise);try{result=await pending;}catch(e){error=e.message;}if(result)assert.equal(result,f.made);return {result,error,events:f.events};}
 const old=await run(true),actual=await run(false);assert.deepEqual(actual,old);return actual;
}
for(const mode of [undefined,'public','custom','unknown'])test('OSRM server mode '+mode,async()=>{
 const r=await compare({engine:'osrm',config:{osrmServerMode:mode,osrmServerUrl:' https://osrm.example/ '}});assert(!r.events.some(e=>e[0]==='resolve'));const options=r.events.find(e=>e[0]==='osrm')[1];assert.equal(options.profile,'driving');
});
for(const url of [undefined,'','  '])test('empty custom OSRM URL '+url,async()=>assert.equal((await compare({engine:'osrm',config:{osrmServerMode:'custom',osrmServerUrl:url}})).error,'Custom OSRM server URL is not configured.'));
for(const kind of ['api-key','user','portal','custom'])test('ArcGIS resolved kind '+kind,async()=>{
 const r=await compare({kind});const options=r.events.find(e=>e[0]==='arcgis')[1];assert.equal(options.apiKey,kind==='api-key'?'dummy-key':undefined);assert.equal(options.travelMode,'drive');assert(!r.events.some(e=>e[0]==='osrm'));
});
test('resolution failure avoids SDK construction and provider logs',async()=>{const r=await compare({reject:new Error('resolution failed')});assert.equal(r.error,'resolution failed');assert.deepEqual(r.events,[['engine'],['resolve']]);});
for(const engine of ['world','osrm'])test('constructor failure '+engine,()=>compare({engine,constructError:true}));
for(const engine of ['world','osrm'])test('logger failure '+engine,()=>compare({engine,logError:true}));
test('deferred resolution reads replacement SDK modules and travel mode after awaiting',async()=>{
 const outputs=[];
 for(const previous of [true,false]){const f=setup(previous,{late:true});let done=false;const pending=f.w.createCaptureRoutingProvider();pending.then(()=>done=true);await Promise.resolve();assert.equal(done,false);assert.deepEqual(f.events,[['engine'],['resolve']]);f.w.ArcGISModules=sdk('replacement');f.w.state.routeTravelMode='walk';f.gate.resolve({kind:'portal',routeUrl:'https://portal.example/route',label:'portal'});await pending;const options=f.events.find(e=>e[0]==='arcgis')[1];assert.equal(options.route,'replacement-route');assert.equal(options.travelMode,'walk');outputs.push(f.events);}
 assert.deepEqual(outputs[0],outputs[1]);
});
test('real factories construct provider objects without making solve or discovery requests',async()=>{
 const cache=new Map();function load(relative){if(cache.has(relative))return cache.get(relative);const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),m,m.exports);cache.set(relative,m.exports);return m.exports;}
 const {createCaptureProvider}=load('features/routing/captureProviderFactory');let calls=0;
 const fail=()=>{calls++;throw Error('unexpected SDK request');};const modules={route:{solve:fail},networkService:{fetchServiceDescription:fail},RouteParameters:fail,FeatureSet:fail,Graphic:fail,Point:fail};
 for(const engine of ['world','osrm']){const provider=await createCaptureProvider({routingEngine:engine,config:{},resolveArcGIS:async()=>({kind:'user',routeUrl:'https://route.example/service',label:'real'}),modules:()=>modules,travelMode:()=> 'drive',log(){}});assert.equal(typeof provider.solve,'function');}assert.equal(calls,0);
});
