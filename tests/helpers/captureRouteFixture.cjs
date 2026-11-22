// Runs actual widget methods with controlled providers, coverage evaluation and rendering.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'../..'),cache=new Map();
function compile(source,fileName='fixture.tsx'){
 const r=ts.transpileModule(source,{fileName,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'},reportDiagnostics:true});
 assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;
}
function load(relative,overrides={},modules=cache){
 if(overrides[relative])return overrides[relative];
 if(modules.has(relative))return modules.get(relative);const m={exports:{}};
 new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8'),relative+'.ts'))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id)),overrides,modules),m,m.exports);
 modules.set(relative,m.exports);return m.exports;
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4);
const widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
function opportunity(index){
 const start=[.001+index*.002,.001],end=[start[0]+.001,.001];
 const seg={index,tier:'none',lengthMeters:100,seg:{start,end,lengthMeters:100,highwayType:'residential',isOneway:false}};
 return {id:'op-'+index,tier:'none',segments:[seg],lengthMeters:100,valueMeters:100*(index+1),priority:1,entryPoint:start,exitPoint:end,midpoint:start,baselinePosition:index,baselineDistanceMeters:100,estimatedDetourMeters:500,estimatedDetourMinutes:3,routePoints:[start,end],novelMeters:100,novelMissingMeters:100,novelStaleMeters:0,baselineOverlapMeters:0};
}
const result=(minutes=12,marker=1)=>({durationMinutes:minutes,distanceMeters:minutes*100,paths:[[[0,marker],[.02,marker]]]});
function fixture({preflight=false,replacement=false,emptyCorridor=false,emptySelection=false,methodSource=null,jsxTrace=false,opportunityCount=3}={}){
 const calls=[],solves=[],preflights=[],draws=[],coverage=[],errors=[],toasts=[],states=[],opportunities=Array.from({length:opportunityCount},(_,index)=>index).map(opportunity);
 const ctx={jsx:(tag,props,...children)=>jsxTrace?{tag:typeof tag==='function'?'OwnedMessage':tag,props,children}:null,OwnedMessage:()=>null,console:{log(){},warn:(...args)=>calls.push(['warning',...args]),error:(...args)=>errors.push(args)},setTimeout,clearTimeout};
 for(const name of ['captureTrialPlan','captureSelectionReport','replacementProbeComparison','preflightQuality','captureCoverageReport','finalCaptureSelection','captureRouteData','CaptureSolveHistory','captureRouteGeometry','RouteGeneration','captureRouteScoring','finalSolveBatchPruning','preflightBatchPruning','preflightDiagnostics','trialPreflightQuality','replacementPairRanking','captureNetworkPenalties','budgetProbeComparison','adaptiveNetworkRemoval'])Object.assign(ctx,load('features/routing/'+name));
 Object.assign(ctx,load('utils/routeOptimizer'),load('utils/geoUtils'));
 ctx.selectAdaptiveCaptureOpportunities=()=>({opportunities:emptyCorridor?[]:replacement?[...opportunities,opportunity(3)]:opportunities,selection:{opportunities:emptySelection?[]:opportunities,estimatedExtraMinutes:9,estimatedCaptureMeters:300,stopReason:'exhausted',usedAnchorSlots:6,rejectedForBudgetCount:0,rejectedForAnchorCount:0},selectedCorridorWidth:180});
 ctx.prepareCaptureRoute=load('features/routing/captureRoutePreparation',{'features/routing/adaptiveCaptureSelection':{selectAdaptiveCaptureOpportunities:ctx.selectAdaptiveCaptureOpportunities}},new Map()).prepareCaptureRoute;
 ctx.evaluateRouteCoverage=(paths,targets)=>{coverage.push({paths,targets});return {coveredTargetMeters:targets.length*100,noneCoveredMeters:targets.length*100,staleCoveredMeters:0,coveragePercent:100,touchedSegmentCount:targets.length,fullyCoveredSegmentCount:targets.length,segmentResults:targets,totalTargetMeters:targets.length*100};};
 ctx.evaluateIncrementalRouteCoverage=()=>({baselineCoveredMeters:0,finalCoveredMeters:100,sharedCoveredMeters:0,incrementalCoveredMeters:100,incrementalNoneMeters:100,incrementalStaleMeters:0,incrementalPercent:100});
 Object.assign(ctx,load('features/routing/captureRouteEvaluation',{'utils/geoUtils':{...load('utils/geoUtils'),evaluateRouteCoverage:ctx.evaluateRouteCoverage,evaluateIncrementalRouteCoverage:ctx.evaluateIncrementalRouteCoverage}},new Map()));
 ctx.executeCaptureRoute=load('features/routing/executeCaptureRoute',{'features/routing/captureRoutePreparation':{prepareCaptureRoute:ctx.prepareCaptureRoute},'features/routing/captureRouteEvaluation':{evaluateFinalCaptureRoute:ctx.evaluateFinalCaptureRoute}},new Map()).executeCaptureRoute;
 vm.createContext(ctx);vm.runInContext(compile('class Fixture{'+['_captureRoutePreparationHost','captureRouteExecutionHost','generateEsriDetourRoute','cancelCaptureRouteGeneration','releaseCaptureRouteLoginView','clearCaptureRoute'].map(name=>name==='generateEsriDetourRoute'&&methodSource?methodSource:member(name)).join('\n')+'};globalThis.Fixture=Fixture;'),ctx);
 const w=new ctx.Fixture(),view={map:{},destroyed:false};
 const api={kind:preflight?'osrm':'world',label:'controlled',solve:options=>{const d=deferred();solves.push({options,...d});return d.promise;}};
 if(preflight)api.preflightOrderedStops=(stops,signal)=>{const d=deferred();preflights.push({stops,signal,...d});return d.promise;};
 Object.assign(w,{_presentation:{number:value=>String(value)},_routeGeneration:new ctx.RouteGeneration(),_coverageSegments:[{}],_coverageSegmentTiers:['none'],_coverageAnalysisBbox:[0,0,1,1],props:{config:{},state:'OPENED',visible:true},state:{jimuMapView:{view},routeStartPoint:[0,0],routeEndPoint:[.02,0],routeSpareMinutes:5,routeTravelMode:'drive'},ArcGISModules:{},CAPTURE_ROUTE_CONFIG:load('utils/constants').CAPTURE_ROUTE_CONFIG,getEffectiveRoutingEngine:()=> 'osrm',createCaptureRoutingProvider:async()=>api,restoreRoutingLoginView:async()=>{},buildCaptureTargetSegments:()=>opportunities.flatMap(o=>o.segments),log:(...args)=>calls.push(args),warn:(...args)=>calls.push(args),isRoutingAuthenticationError:()=>false,_t:key=>key,showToast:(...args)=>toasts.push(args),setState(patch){states.push(patch);Object.assign(this.state,patch);},drawCaptureRoute:async(paths,current)=>{draws.push({paths,current});}});
 const start=()=>w.generateEsriDetourRoute(w.state.routeStartPoint,w.state.routeEndPoint,5);
 const baseline=async()=>{const pending=start();await flush();assert.equal(solves.length,1);solves[0].resolve(result(10,0));await flush();return {pending};};
 const fittingPreflight=entry=>({durationMinutes:12,waypointSnapDistancesMeters:entry.stops.map(()=>0),legDurationMinutes:entry.stops.slice(1).map(()=>.1)});
 return {w,view,api,context:ctx,calls,solves,preflights,draws,coverage,errors,toasts,states,opportunities,start,baseline,fittingPreflight};
}
module.exports={fixture,result,deferred,flush};
