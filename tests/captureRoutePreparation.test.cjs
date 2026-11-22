/** Full-run frozen/current routing traces: provider calls, cancellation, UI, geometry and result publication. */
const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict');
const {fixture,result,deferred,flush}=require('./helpers/captureRouteFixture.cjs');
const original=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRoutePreparation.baseline.json','utf8')).method;
const {compareCaptureRoute}=require('./helpers/captureRouteTrace.cjs');
const compare=(action,options)=>compareCaptureRoute(original,action,options);
for(const preflight of [false,true])test('fitting complete run retains '+(preflight?'OSRM-shaped preflight':'ArcGIS-shaped direct')+' trace',()=>compare(async f=>{
 const {pending}=await f.baseline();if(preflight){const p=f.preflights[0];p.resolve(f.fittingPreflight(p));await flush()}
 assert.equal(f.solves.length,2);f.solves[1].resolve(result(12,1));await pending;assert(f.w.state.routeData);
},{preflight}));
for(const minutes of [13,22])test('final retry retains selection/result pairing: '+minutes,()=>compare(async f=>{
 const {pending}=await f.baseline();f.solves[1].resolve(result(20,1));await flush();assert.equal(f.solves.length,3);f.solves[2].resolve(result(minutes,2));await pending;assert(f.w.state.routeData);
}));
for(const empty of ['emptyCorridor','emptySelection'])test(empty+' preserves reporting and early feedback before network work',()=>compare(async f=>{const {pending}=await f.baseline();await pending;assert.equal(f.solves.length,1);assert.equal(f.preflights.length,0);assert.equal(f.toasts.length,1)},{preflight:true,[empty]:true}));
test('no targets preserves early exit after baseline/camera restoration',()=>compare(async f=>{f.w.buildCaptureTargetSegments=()=>[];const {pending}=await f.baseline();await pending;assert.equal(f.solves.length,1);assert.equal(f.toasts.length,1)}));
test('empty baseline geometry retains error publication and cleanup',()=>compare(async f=>{const task=f.start();await flush();f.solves[0].resolve({...result(),paths:[]});await task;assert.equal(f.errors.length,1);assert.equal(f.solves.length,1);assert.equal(f.w.state.isGeneratingRoute,false)}));
test('hard snap removal retains ordered reduced stops and matching final output',()=>compare(async f=>{
 const {pending}=await f.baseline(),first=f.preflights[0],reply=f.fittingPreflight(first);reply.waypointSnapDistancesMeters[1]=100;first.resolve(reply);await flush();
 const next=f.preflights[1];assert(next);next.resolve(f.fittingPreflight(next));await flush();f.solves[1].resolve(result());await pending;assert.equal(f.w.state.routeData.selectedOpportunityCount,2);
},{preflight:true}));
test('over-budget preflight retains reduced-stop verification before final solve',()=>compare(async f=>{
 const {pending}=await f.baseline(),first=f.preflights[0];first.resolve({...f.fittingPreflight(first),durationMinutes:30});await flush();const next=f.preflights[1];assert(next.stops.length<first.stops.length);next.resolve(f.fittingPreflight(next));await flush();f.solves[1].resolve(result());await pending;
},{preflight:true}));
test('replacement probes retain provider request order, verification and publication',()=>compare(async f=>{
 const {pending}=await f.baseline();f.preflights[0].resolve(f.fittingPreflight(f.preflights[0]));await flush();
 for(let i=1;i<=3;i++){assert(f.preflights[i]);f.preflights[i].resolve(f.fittingPreflight(f.preflights[i]));await flush()}
 f.preflights[4].resolve(f.fittingPreflight(f.preflights[4]));await flush();f.solves[1].resolve(result());await pending;assert.deepEqual(f.coverage[0].targets.map(t=>t.index),[1,2,3]);
},{preflight:true,replacement:true}));
for(const phase of ['baseline','final','preflight'])for(const reason of ['clear','config'])test(phase+' cancellation after '+reason+' preserves full non-publication trace',()=>compare(async f=>{
 let task,request;if(phase==='baseline'){task=f.start();await flush();request=f.solves[0]}else{({pending:task}=await f.baseline());request=phase==='preflight'?f.preflights[0]:f.solves[1]}
 if(reason==='clear')f.w.clearCaptureRoute();else f.w.props.config={};request.resolve(phase==='preflight'?f.fittingPreflight(request):result());await task;assert.equal(f.draws.length,0);assert.equal(f.w.state.routeData,null);
},{preflight:phase==='preflight'}));
for(const phase of ['baseline','final','preflight'])test(phase+' provider failure preserves error/feedback/finally ordering',()=>compare(async f=>{
 let task,request;if(phase==='baseline'){task=f.start();await flush();request=f.solves[0]}else{({pending:task}=await f.baseline());request=phase==='preflight'?f.preflights[0]:f.solves[1]}
 request.reject(new Error('controlled failure'));await task;assert.equal(f.errors.length,1);assert.equal(f.w.state.isGeneratingRoute,false);
},{preflight:phase==='preflight'}));
test('drawing cancellation retains result publication guard',()=>compare(async f=>{const held=deferred();f.w.drawCaptureRoute=async()=>held.promise;const {pending}=await f.baseline();f.solves[1].resolve(result());await flush();f.w.clearCaptureRoute();held.resolve();await pending;assert.equal(f.w.state.routeData,null)}));
test('old response cannot finish over a replacement run',()=>compare(async f=>{const old=await f.baseline(),stale=f.solves[1];f.w.clearCaptureRoute();const next=f.start();await flush();stale.resolve(result());await old.pending;assert(f.w.state.isGeneratingRoute);f.solves[2].resolve(result(10,0));await flush();f.solves[3].resolve(result(12,3));await next;assert(f.w.state.routeData)}));

// Local preparation comparison isolates geometry/speed/reporting edge cases from provider behavior.
const path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=s=>ts.transpileModule(s,{fileName:'fixture.tsx',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;
const widgetSource=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),sf=ts.createSourceFile('widget.tsx',widgetSource,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
const oldSegment=original.slice(original.indexOf('      const baselineMinutes ='),original.indexOf('      let activeOpportunities ='));
function localFixture(old,{stop=null,fail=null}={}){
 const trace=[],config={maxFinalStops:18},targets=[{id:'target'}],opportunities=stop==='corridor'?[]:[{id:'op'}],selection={opportunities:stop==='budget'?[]:opportunities,estimatedExtraMinutes:1.5};let input;
 const record=(...args)=>{trace.push(args);if(fail===args[0])throw 'failed '+fail};
 const adaptive=value=>{record('adaptive',{...value,log:typeof value.log});input=value;value.log('[local adaptive]');assert.equal(value.config,config);return{opportunities,selection,selectedCorridorWidth:180}};
 const reports={reportCaptureCorridor:(...args)=>record('corridor',args[0],args[1]),reportCaptureSelection:(...args)=>record('selection',args[0],args[1])};
 const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureRoutePreparation.ts','utf8')))(id=>id==='./adaptiveCaptureSelection'?{selectAdaptiveCaptureOpportunities:adaptive}:reports,m,m.exports);
 const host=widget.members.find(n=>n.name?.getText(sf)==='_captureRoutePreparationHost').getText(sf);
 const body=old?'run(baselineRoute,spareMinutes){'+oldSegment+'return {baselineMinutes,baselinePaths,opportunities,selection,selectedCorridorWidth};}':host+'\nrun(baselineRoute,spareMinutes){return prepareCaptureRoute(baselineRoute,spareMinutes,this._captureRoutePreparationHost);}';
 const Runtime=new Function('prepareCaptureRoute','selectAdaptiveCaptureOpportunities','reportCaptureCorridor','reportCaptureSelection','jsx','OwnedMessage',compile('class Runtime{'+body+'};return Runtime;'))(m.exports.prepareCaptureRoute,adaptive,reports.reportCaptureCorridor,reports.reportCaptureSelection,(tag,props)=>({tag,props}),'OwnedMessage');
 const w=new Runtime();w.CAPTURE_ROUTE_CONFIG=config;w.log=(...args)=>record('log',...args);w.buildCaptureTargetSegments=()=>{record('targets');return stop==='targets'?[]:targets};w._t=key=>key;w.showToast=(...args)=>record('toast',...args);w.setState=patch=>record('state',patch);
 return{w,trace,input:()=>input,opportunities,selection};
}
function compareLocal(route,budget=5,options){const a=localFixture(true,options),b=localFixture(false,options);let ar,br,ae,be;try{ar=a.w.run(route,budget)}catch(e){ae=e}try{br=b.w.run(route,budget)}catch(e){be=e}assert.deepEqual(b.trace,a.trace);assert.equal(be?.message||be,ae?.message||ae);assert.deepEqual(br||null,ar||null);if(br){assert.equal(br.baselinePaths,route.paths);assert.equal(br.opportunities,b.opportunities);assert.equal(br.selection,b.selection);assert.equal(b.input().baselineCoordinates[0],route.paths[0][0])}return{a,b,result:br,error:be};}
for(const durationMinutes of [10,0,-1,NaN])test('local baseline speed/identity preserves duration '+durationMinutes,()=>{const {b}=compareLocal({durationMinutes,distanceMeters:1000,paths:[[[0,0],[1,1]]]});assert.equal(b.input().baselineSpeedMetersPerMinute,durationMinutes>0?1000/durationMinutes:400)});
test('multipart geometry preserves flatten order and coordinate identity',()=>{const {b}=compareLocal({durationMinutes:10,distanceMeters:1000,paths:[[[0,0]],[[1,1],[2,2]]]});assert.deepEqual(b.input().baselineCoordinates,[[0,0],[1,1],[2,2]])});
for(const paths of [[],[[]],[[[0,0]]]])test('insufficient baseline geometry fails before local work '+JSON.stringify(paths),()=>{const {b,error}=compareLocal({durationMinutes:10,distanceMeters:1000,paths});assert.equal(error.message,'Baseline route geometry is empty.');assert.equal(b.trace.length,0)});
for(const stop of ['targets','corridor','budget'])test('local '+stop+' stop retains report/feedback boundaries',()=>{const {result,b}=compareLocal({durationMinutes:10,distanceMeters:1000,paths:[[[0,0],[1,1]]]},0,{stop});assert.equal(result,null);assert.equal(b.trace.at(-1)[0],'toast')});
for(const fail of ['targets','adaptive','corridor','selection','state'])test('local '+fail+' failure preserves partial effects',()=>{const {error}=compareLocal({durationMinutes:10,distanceMeters:1000,paths:[[[0,0],[1,1]]]},5,{fail});assert.equal(error,'failed '+fail)});
