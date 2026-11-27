const { englishFunction, bindEnglish } = require('./helpers/englishFixture.cjs');
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{fileName:'fixture.tsx',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;const moduleRoads={exports:{}};englishFunction('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/coverage/fetchCoverageRoads.ts'),'utf8')))(moduleRoads,moduleRoads.exports);const{fetchCoverageRoads}=moduleRoads.exports;
const response=(status,data={elements:[]},retry)=>({status,ok:status===200,headers:{get:()=>retry},json:async()=>data});
function options(statuses){const o={calls:[],waits:[],retries:0,limits:[],async fetch(url,request){o.calls.push(request);return statuses.shift();},async delay(ms,signal){assert(!signal.aborted);o.waits.push(ms);},onRetry(){o.retries++;},onRateLimit(at){o.limits.push(at);}};return o;}
for(const status of [502,503,504])test(`${status} gets one delayed retry and recovers`,async()=>{const o=options([response(status),response(200)]);assert.deepEqual(await fetchCoverageRoads('roads',new AbortController().signal,o),{elements:[]});assert.equal(o.calls.length,2);assert.deepEqual(o.waits,[3000]);assert.equal(o.retries,1);});
for(const status of [502,503,504])test(`${status} retry remains bounded on repeated failure`,async()=>{const o=options([response(status),response(status)]);await assert.rejects(fetchCoverageRoads('roads',new AbortController().signal,o),new RegExp(String(status)));assert.equal(o.calls.length,2);});
test('429 respects Retry-After and never automatically retries',async()=>{const now=Date.now(),o=options([response(429,null,'7')]);await assert.rejects(fetchCoverageRoads('q',new AbortController().signal,o),/429/);assert.equal(o.calls.length,1);assert.equal(o.limits.length,1);assert(o.limits[0]>=now+7000);assert.deepEqual(o.waits,[]);});
test('nontransient HTTP errors do not retry',async()=>{const o=options([response(400)]);await assert.rejects(fetchCoverageRoads('q',new AbortController().signal,o),/400/);assert.equal(o.calls.length,1);});
test('cancellation during retry delay prevents the second HTTP request',async()=>{const c=new AbortController(),o=options([response(502),response(200)]);o.delay=async()=>{c.abort();};await assert.rejects(fetchCoverageRoads('q',c.signal,o),{name:'AbortError'});assert.equal(o.calls.length,1);});
test('cancellation aborts the active HTTP request',async()=>{const c=new AbortController(),o=options([]);o.fetch=async(url,request)=>new Promise((resolve,reject)=>{request.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')));c.abort();});await assert.rejects(fetchCoverageRoads('q',c.signal,o),{name:'AbortError'});});
test('pre-aborted sessions make no HTTP requests',async()=>{const c=new AbortController();c.abort();const o=options([]);await assert.rejects(fetchCoverageRoads('q',c.signal,o),{name:'AbortError'});assert.equal(o.calls.length,0);});
const src=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');const member=name=>widget.members.find(m=>m.name?.getText(sf)===name);const updateSource=require('./helpers/widgetUpdateSource.cjs');const guards=updateSource.phase('reconcileFeatureDemand').body.statements.filter(statement=>ts.isIfStatement(statement)&&statement.expression.getText(updateSource.ast)==='host.coverageAnalysisCurrent && !host.coverageAnalysisCurrent()');assert.equal(guards.length,1,'analysis-input guard must be identified by ownership rather than statement position');const methods=['_coverageAnalysis','runCoverageAnalysis','cancelCoverageAnalysis'].map(name=>member(name).getText(sf)).join('\n')+'\ncheckInputs(){runWidgetUpdate(this,this.state,this.props)}';
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};}
function fixture({classify=async()=>({segmentTiers:['fresh']}), roadRequest}={}) {
 const gate=deferred(),classifications=[];
 let roadCalls=0;
 const dependencies={
  '../../utils/constants':{OVERPASS_ROAD_QUERY:()=> 'query',STREET_COVERAGE_CONFIG:{}},
  '../../utils/geoUtils':{
   coverageAnalysisDelay:async()=>{},parseOverpassRoads:()=>[{id:1}],insetBbox:b=>b,segmentMidpointInBbox:()=>true,
   classifyCoverageAsync:async(...args)=>{classifications.push(args);return classify(...args);},
  },
  './fetchFeatureLayerRoads':{isRoadFeatureLayer:()=>false},
  './fetchCoverageRoads':{fetchCoverageRoads:async(...args)=>{roadCalls++;return roadRequest ? roadRequest(...args) : gate.promise;}},
 };
 const owner={};
 const ownerSource=fs.readFileSync(path.join(__dirname,'../src/features/coverage/CoverageAnalysisRun.ts'),'utf8');
 new Function('exports','require',compile(ownerSource))(owner,id=>{
  assert.ok(Object.hasOwn(dependencies,id),id);
  return dependencies[id];
 });
 const Runtime=englishFunction('runWidgetUpdate','CoverageAnalysisRun','webMercatorUtils',compile('class Runtime{'+methods+'}\nreturn Runtime;'))(
  (w,state,props)=>updateSource.run(guards,w,state,props),owner.CoverageAnalysisRun,{webMercatorToGeographic:e=>e});
 const w=bindEnglish(new Runtime()),watchers=[];
 const view={ready:true,destroyed:false,extent:{xmin:0,ymin:0,xmax:1,ymax:1},watch(property,callback){const watch={callback,removed:false,remove(){this.removed=true;}};watchers.push(watch);return watch;}};
 Object.assign(w,{
  state:{jimuMapView:{view},turboModeActive:true,turboFilterUsername:'',coverageAnalysisLoading:false},
  props:{config:{}},turboCoverageLayer:{},_turboRequestCount:1,_turboAbortController:new AbortController(),accessToken:'test',
  filters:{},toasts:[],toastCalls:[],visits:0,draws:0,setState(o,done){Object.assign(this.state,o);done?.();},
  showToast(s,...args){this.toasts.push(s);this.toastCalls.push([s,...args]);},getTurboFilters(){return this.filters;},
  log(){},stopCoverageRendering(){},drawCoverageZone(){},async drawCoverageSegments(){this.draws++;},
  async visitTurboCoverage(box,filters,signal,visit){assert(!signal.aborted);this.visits++;visit({lon:0,lat:0,capturedAt:null});},
 });
 return {w,view,gate,watchers,classifications,get roadCalls(){return roadCalls;}};
}
test('ordinary coverage reloads do not cancel a pending road analysis',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis();f.w._turboAbortController.abort();f.w._turboRequestCount++;f.w.checkInputs();assert.equal(f.w._coverageAnalysis.controller.signal.aborted,false);f.gate.resolve({elements:[]});await task;assert.equal(f.w.visits,1);assert.equal(f.w.state.coverageResult.segmentTiers[0],'fresh');assert(f.watchers[0].removed);});
test('area changes cancel obsolete analysis and explain why',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis(),signal=f.w._coverageAnalysis.controller.signal;f.view.extent={...f.view.extent,xmin:0.1};f.watchers[0].callback();assert(signal.aborted);assert(f.w.toasts.some(s=>s.includes('map area changed')));f.gate.resolve({elements:[]});await task;assert.equal(f.w.visits,0);assert(f.watchers[0].removed);});
test('filter changes cancel the input snapshot and preserve previous results',async()=>{const f=fixture();f.w.state.coverageResult={old:true};const task=f.w.runCoverageAnalysis(),signal=f.w._coverageAnalysis.controller.signal;f.w.filters={isPano:true};f.w.checkInputs();assert(signal.aborted);f.gate.resolve({elements:[]});await task;assert.deepEqual(f.w.state.coverageResult,{old:true});assert.equal(f.w.visits,0);});
test('explicit cancellation cannot commit results',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis();f.w.cancelCoverageAnalysis();f.gate.resolve({elements:[]});await task;assert.equal(f.w.visits,0);assert.equal(f.w.state.coverageAnalysisLoading,false);});
test('unready coverage gives actionable feedback without starting analysis',async()=>{const f=fixture();f.w.state.turboLoading=true;await f.w.runCoverageAnalysis();assert.equal(f.roadCalls,0);assert(f.w.toasts[0].includes('still loading'));});
test('rapid repeated activation does not restart an active analysis',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis();await f.w.runCoverageAnalysis();assert.equal(f.roadCalls,1);f.gate.resolve({elements:[]});await task;});

// These promises hold the classifier after roads/imagery have completed, exposing
// ownership boundaries that a road-fetch-only cancellation fixture cannot reach.
async function untilClassification(f,count=1){
 for(let i=0;i<40;i++){if(f.classifications.length>=count)return;await Promise.resolve();}
 assert.fail('classification did not start');
}
test('cancellation during classification suppresses late progress and preserves previous results',async()=>{
 const classification=deferred(),f=fixture({classify:()=>classification.promise}),previous={old:true};
 f.w.state.coverageResult=previous;const task=f.w.runCoverageAnalysis();f.gate.resolve({elements:[]});await untilClassification(f);
 const options=f.classifications[0][6];f.w.cancelCoverageAnalysis();assert(options.signal.aborted);
 const progress=f.w.state.coverageAnalysisProgress;options.onProgress(1,1);assert.equal(f.w.state.coverageAnalysisProgress,progress);
 classification.resolve({segmentTiers:['fresh']});await task;
 assert.strictEqual(f.w.state.coverageResult,previous);assert(f.watchers[0].removed);assert.equal(f.w.state.coverageAnalysisLoading,false);
});
test('old classifier completion cannot publish over or clear a newer pending analysis',async()=>{
 const first=deferred(),second=deferred();let calls=0;const f=fixture({classify:()=>++calls===1?first.promise:second.promise});
 const previous={old:true};f.w.state.coverageResult=previous;const oldTask=f.w.runCoverageAnalysis();f.gate.resolve({elements:[]});await untilClassification(f);
 f.w.cancelCoverageAnalysis();const newTask=f.w.runCoverageAnalysis();await untilClassification(f,2);const controller=f.w._coverageAnalysis.controller;
 first.resolve({segmentTiers:['stale']});await oldTask;
 assert.strictEqual(f.w.state.coverageResult,previous);assert.strictEqual(f.w._coverageAnalysis.controller,controller);assert(!controller.signal.aborted);
 assert.equal(f.w.state.coverageAnalysisLoading,true);assert(f.watchers[0].removed);assert.equal(f.watchers[1].removed,false);
 const accepted={segmentTiers:['fresh']};second.resolve(accepted);await newTask;
 assert.strictEqual(f.w.state.coverageResult,accepted);assert.equal(f.w.state.coverageAnalysisLoading,false);assert(f.watchers[1].removed);
});
test('view replacement while classification is pending prevents late publication without a watcher callback',async()=>{
 const classification=deferred(),f=fixture({classify:()=>classification.promise}),previous={old:true};f.w.state.coverageResult=previous;
 const task=f.w.runCoverageAnalysis();f.gate.resolve({elements:[]});await untilClassification(f);f.w.state.jimuMapView={view:{...f.view}};
 classification.resolve({segmentTiers:['fresh']});await task;
 assert.strictEqual(f.w.state.coverageResult,previous);assert(f.watchers[0].removed);assert.equal(f.w.state.coverageAnalysisLoading,false);
});
test('rate-limit cooldown renders actionable localized feedback without road or classification work',async()=>{
 const f=fixture();f.w._coverageAnalysis.retryAt=Date.now()+60000;await f.w.runCoverageAnalysis();
 assert.equal(f.roadCalls,0);assert.equal(f.classifications.length,0);assert.equal(f.watchers.length,0);
 assert.match(f.w.toasts[0],/Road server is rate-limited.*Try again in \d+ seconds/);assert.equal(f.w.toastCalls[0][1],5000);
});

test('a stalled road request times out, retries once, and recovers', async t => {
 t.mock.timers.enable({apis:['setTimeout']});
 const o=options([]);
 o.fetch=(url,request)=>{
  o.calls.push(request);
  if(o.calls.length>1) return Promise.resolve(response(200));
  return new Promise((_,reject)=>request.signal.addEventListener('abort',()=>reject(new DOMException('Timed out','AbortError')),{once:true}));
 };
 const pending=fetchCoverageRoads('q',new AbortController().signal,o);
 t.mock.timers.tick(14000);
 assert.equal(o.calls.length,1);
 assert.equal(o.calls[0].signal.aborted,false);
 t.mock.timers.tick(21000);
 assert.deepEqual(await pending,{elements:[]});
 assert.equal(o.calls.length,2);
 assert.equal(o.retries,1);
});

test('an Overpass timeout remark is retried without publishing incomplete data', async () => {
 const o=options([response(200,{remark:'runtime error: Query timed out',elements:[{}]}),response(200)]);
 assert.deepEqual(await fetchCoverageRoads('q',new AbortController().signal,o),{elements:[]});
 assert.equal(o.calls.length,2);
});

test('uses the configured road service and identifies the retry cause', async () => {
 const o=options([]);
 const urls=[], reasons=[];
 o.endpoint='https://roads.example.org/api/interpreter';
 o.onRetry=reason=>reasons.push(reason);
 o.fetch=async url=>{
  urls.push(url);
  if(urls.length===1) throw new TypeError('Network failure');
  return response(200);
 };
 await fetchCoverageRoads('q',new AbortController().signal,o);
 assert.deepEqual(urls,[o.endpoint,o.endpoint]);
 assert.deepEqual(reasons,['network']);
 o.endpoint='http://roads.example.org/api/interpreter';
 await assert.rejects(fetchCoverageRoads('q',new AbortController().signal,o),/valid HTTPS/);
 assert.equal(urls.length,2);
});

test('an area timeout falls back to two smaller queries and deduplicates shared ways', async () => {
 const shared={type:'way',id:5}, distinct={type:'way',id:9};
 const o=options([response(504),response(200,{elements:[shared]}),response(200,{elements:[shared,distinct]})]);
 o.splitQueries=['half-west','half-east'];
 assert.deepEqual(await fetchCoverageRoads('full',new AbortController().signal,o),{elements:[shared,distinct]});
 assert.deepEqual(o.calls.map(item=>item.body.get('data')),['full','half-west','half-east']);
});

test('a failed second half cannot return incomplete road coverage', async () => {
 const o=options([response(504),response(200,{elements:[{type:'way',id:5}]}),response(200,{remark:'timeout',elements:[]})]);
 o.splitQueries=['half-west','half-east'];
 await assert.rejects(fetchCoverageRoads('full',new AbortController().signal,o),/timed out/);
 assert.equal(o.calls.length,3);
});

test('reuses complete roads for the same extent while analyzing imagery with the current filters', async () => {
 const f=fixture();
 const first=f.w.runCoverageAnalysis();
 f.gate.resolve({elements:[]});
 await first;
 f.w.filters={isPano:true};
 await f.w.runCoverageAnalysis();
 assert.equal(f.roadCalls,1);
 assert.equal(f.w.visits,2);
 f.view.extent={...f.view.extent,xmin:0.1};
 await f.w.runCoverageAnalysis();
 assert.equal(f.roadCalls,2);
});

test('Overpass queries use the standard URL-encoded data field', async () => {
 const o=options([response(200)]);
 const query='[out:json]; way["highway"](1,2,3,4); out body geom;';
 await fetchCoverageRoads(query,new AbortController().signal,o);
 const request=new Request('https://overpass-api.de/api/interpreter',o.calls[0]);
 assert.match(request.headers.get('content-type'),/^application\/x-www-form-urlencoded/i);
 assert.equal((await request.formData()).get('data'),query);
});

test('a full queue stops the split fallback and respects Retry-After', async () => {
 const full={...response(502,null,'45'),text:async()=> 'All query workers are busy and the request queue is full.'};
 const o=options([response(504),full]);
 o.splitQueries=['west','east'];
 const start=Date.now();
 await assert.rejects(fetchCoverageRoads('full',new AbortController().signal,o),/at capacity.*45 seconds/);
 assert.equal(o.calls.length,2);
 assert(o.limits[0]>=start+45000);
});

test('repeated capacity responses back off without losing existing results', async () => {
 const delays=[];
 const f=fixture({roadRequest:async (_query,_signal,options)=>{
  delays.push(options.capacityBackoffMs);
  options.onRateLimit(Date.now()+options.capacityBackoffMs,'capacity');
  throw new Error('Road service is at capacity.');
 }});
 const previous={existing:true};
 f.w.state.coverageResult=previous;
 await f.w.runCoverageAnalysis();
 await f.w.runCoverageAnalysis();
 assert.equal(f.roadCalls,1);
 assert.match(f.w.toasts.at(-1),/at capacity/);
 for(let i=0;i<3;i++){
  f.w._coverageAnalysis.retryAt=0;
  await f.w.runCoverageAnalysis();
 }
 assert.deepEqual(delays,[15000,30000,60000,60000]);
 assert.strictEqual(f.w.state.coverageResult,previous);
});

test('ArcGIS roads use an extent ID query and reject missing geometry instead of publishing partial coverage', async () => {
 const adapter={};
 const file=path.join(__dirname,'../src/features/coverage/fetchFeatureLayerRoads.ts');
 new Function('exports','require',compile(fs.readFileSync(file,'utf8')))(adapter,()=>({distanceMeters:()=>12}));
 const endpoint='https://roads.example.org/arcgis/rest/services/Roads/FeatureServer/0';
 const requests=[];
 const read=(omit=0)=>async url=>{
  const query=new URL(url).searchParams;
  requests.push(query);
  const metadata={geometryType:'esriGeometryPolyline',maxRecordCount:1,fields:[{name:'highway'}]};
  const ids={objectIdFieldName:'ID',objectIds:[1,2]};
  const id=Number(query.get('objectIds'));
  const features={features:id===omit?[]:[{attributes:{ID:id,highway:'primary'},geometry:{paths:[[[1,2],[1,3]]]}}]};
  return response(200,id?features:query.has('returnIdsOnly')?ids:metadata);
 };
 assert(adapter.isRoadFeatureLayer(endpoint));
 const signal=new AbortController().signal;
 const roads=await adapter.fetchFeatureLayerRoads(endpoint,[1,2,3,4],signal,read());
 assert.equal(requests[1].get('geometry'),'1,2,3,4');
 assert.equal(requests[2].get('outSR'),'4326');
 assert.deepEqual(roads.map(road=>road.highwayType),['primary','primary']);
 await assert.rejects(adapter.fetchFeatureLayerRoads(endpoint,[1,2,3,4],signal,read(2)),/incomplete geometry/);
});

test('an Overture area limit splits once and preserves the zoom message when a half is still too dense', async () => {
 const limit=response(422,{error:'Road area contains too many segments. Zoom in and try again.'});
 const road={type:'way',id:5};
 const recovered=options([limit,response(200,{elements:[road]}),response(200)]);
 recovered.splitQueries=['west','east'];
 assert.deepEqual(await fetchCoverageRoads('full',new AbortController().signal,recovered),{elements:[road]});
 assert.equal(recovered.calls.length,3);
 assert.deepEqual(recovered.waits,[]);
 const tooDense=options([limit,limit]);
 tooDense.splitQueries=['west','east'];
 await assert.rejects(fetchCoverageRoads('full',new AbortController().signal,tooDense),/too many segments.*Zoom in/);
 assert.equal(tooDense.calls.length,2);
});

test('Analyze Coverage publishes the summary and shows classified streets without a separate click', async () => {
 const f=fixture();
 const task=f.w.runCoverageAnalysis();
 f.gate.resolve({elements:[]});
 await task;
 assert.equal(f.w.state.coverageResult.segmentTiers[0],'fresh');
 assert.equal(f.w.state.coverageSegmentsVisible,true);
 assert.equal(f.w.draws,1);
});
