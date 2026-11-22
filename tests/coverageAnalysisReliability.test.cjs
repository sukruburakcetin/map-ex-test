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
function fixture({classify=async()=>({segmentTiers:['fresh']})}={}) {
 const gate=deferred(),classifications=[];
 let roadCalls=0;
 const dependencies={
  '../../utils/constants':{OVERPASS_ROAD_QUERY:()=> 'query',STREET_COVERAGE_CONFIG:{}},
  '../../utils/geoUtils':{
   coverageAnalysisDelay:async()=>{},parseOverpassRoads:()=>[{id:1}],insetBbox:b=>b,segmentMidpointInBbox:()=>true,
   classifyCoverageAsync:async(...args)=>{classifications.push(args);return classify(...args);},
  },
  './fetchCoverageRoads':{fetchCoverageRoads:async()=>{roadCalls++;return gate.promise;}},
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
  filters:{},toasts:[],toastCalls:[],visits:0,setState(o){Object.assign(this.state,o);},
  showToast(s,...args){this.toasts.push(s);this.toastCalls.push([s,...args]);},getTurboFilters(){return this.filters;},
  log(){},stopCoverageRendering(){},drawCoverageZone(){},
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
