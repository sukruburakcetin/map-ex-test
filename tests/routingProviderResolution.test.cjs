const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/routingProviderResolution.ts','utf8')))(m,m.exports);
const {resolveCaptureRoutingProvider}=m.exports;
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/routingProviderResolution.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const method=widget.members.find(n=>n.name?.getText(sf)==='resolveRoutingProvider').getText(sf);
const url='https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';
const Old=new Function('ARCGIS_LOCATION_ROUTE_URL',compile('return class Fixture{'+fixture.method+'}'))(url);
const Current=new Function('resolveCaptureRoutingProvider',compile('return class Fixture{'+method+'}'))(resolveCaptureRoutingProvider);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
async function compare({engine='world',config={},portal='https://portal.example/route',reject,engineError=false}={}){
 const frozen=Object.freeze({...config});
 async function run(Type){const calls=[],w=new Type();w.props={config:frozen};w.getEffectiveRoutingEngine=()=>{calls.push('engine');if(engineError)throw Error('engine failed');return engine;};w.resolvePortalRouteService=()=>{calls.push('portal');return reject?Promise.reject(reject):Promise.resolve(portal);};
 let result,error;let pending;assert.doesNotThrow(()=>pending=w.resolveRoutingProvider());assert(pending instanceof Promise);try{result=await pending;}catch(e){error=e.message;}return {result,error,calls};}
 const old=await run(Old),actual=await run(Current);assert.deepEqual(actual,old);return actual;
}
for(const mode of [undefined,'auto','api-key','user','unexpected'])for(const key of ['', '  demo-key  '])test('World auth '+mode+' key '+Boolean(key),async()=>{
 const r=await compare({config:{routingAuthMode:mode,routingApiKey:key}});assert.deepEqual(r.calls,['engine']);
 if(mode==='api-key'&&!key)assert.equal(r.error,'Routing API key is not configured.');
 if(r.result){assert.equal(r.result.routeUrl,url);assert(!r.result.routeUrl.includes('demo-key'));}
});
for(const portal of ['https://portal.example/route','',null])test('portal result '+portal,async()=>{
 const r=await compare({engine:'portal',portal,config:{routingApiKey:'ignored'}});assert.deepEqual(r.calls,['engine','portal']);if(!portal)assert.equal(r.error,'No routing service is configured for this ArcGIS portal.');
});
test('portal discovery failure preserves its error',()=>compare({engine:'portal',reject:new Error('discovery failed')}));
for(const custom of [undefined,'','  ',' https://custom.example/route '])test('custom URL '+custom,async()=>{const r=await compare({engine:'custom',config:{routingServiceUrl:custom}});assert.deepEqual(r.calls,['engine']);if(r.result)assert.equal(r.result.routeUrl,'https://custom.example/route');});
for(const engine of ['osrm','unsupported'])test('unsupported resolver engine '+engine,async()=>assert.equal((await compare({engine})).error,'Unsupported routing configuration.'));
test('engine failure remains an asynchronous rejection from the widget adapter',()=>compare({engineError:true}));
test('portal discovery starts once, remains pending and preserves returned URL',async()=>{
 for(const Type of [Old,Current]){const gate=deferred(),w=new Type();let calls=0,settled=false;w.props={config:{}};w.getEffectiveRoutingEngine=()=> 'portal';w.resolvePortalRouteService=()=>{calls++;return gate.promise;};const pending=w.resolveRoutingProvider();pending.then(()=>settled=true);assert.equal(calls,1);await Promise.resolve();assert.equal(settled,false);gate.resolve('https://portal.example/route');assert.equal((await pending).routeUrl,'https://portal.example/route');assert.equal(calls,1);}
});
test('non-portal branches never call portal discovery',async()=>{
 for(const engine of ['world','custom']){const result=await resolveCaptureRoutingProvider({routingEngine:engine,config:{routingServiceUrl:'https://custom.example/route'},discoverPortalRouteService:()=>{throw Error('unneeded discovery');}});assert(result.routeUrl);}
});
