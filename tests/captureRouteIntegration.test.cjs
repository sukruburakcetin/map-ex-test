const test=require('node:test'),assert=require('node:assert/strict');
const {fixture,result,deferred,flush}=require('./helpers/captureRouteFixture.cjs');
function published(f){return f.states.filter(p=>p.routeData).map(p=>p.routeData);}
function success(f,count,marker){
 assert.equal(f.errors.length,0,f.errors.map(args=>args.map(e=>e?.stack||String(e)).join(" ")).join("\n"));assert.equal(published(f).length,1);
 assert.equal(f.w.state.routeData.selectedOpportunityCount,count);assert.equal(f.coverage.at(-1).targets.length,count);
 assert.equal(f.w.state.routeData.geojson.coordinates[0][1],marker);assert.equal(f.draws.at(-1).paths[0][0][1],marker);
 assert.equal(f.w.state.isGeneratingRoute,false);assert.equal(f.w._routeGeneration.pending,false);
}
test('fitting final solve publishes its matching route, coverage and selection',async()=>{
 const f=fixture(),{pending}=await f.baseline();assert.equal(f.solves.length,2);f.solves[1].resolve(result(12,1));await pending;success(f,3,1);
 const opts=f.solves[1].options;assert(opts.preserveEndpoints&&opts.preserveStopOrder);assert.equal(opts.stops.length,8);assert.equal(opts.signal,f.solves[0].options.signal);
});
test('better retry publishes pruned opportunities and retry geometry',async()=>{
 const f=fixture(),{pending}=await f.baseline();f.solves[1].resolve(result(20,1));await flush();assert.equal(f.solves.length,3);assert(f.solves[2].options.stops.length<8);
 f.solves[2].resolve(result(13,2));await pending;success(f,1,2);assert.equal(f.coverage[0].targets[0].index,2);assert.equal(f.w.state.routeData.selectedNovelTargetMeters,100);
});
test('worse retry restores the best route together with its original opportunity snapshot',async()=>{
 const f=fixture(),{pending}=await f.baseline();f.solves[1].resolve(result(20,1));await flush();f.solves[2].resolve(result(22,2));await pending;success(f,3,1);assert.equal(f.w.state.routeData.extraDurationMinutes,10);assert.equal(f.w.state.routeData.selectedNovelTargetMeters,300);
});
for(const phase of ['final','preflight'])for(const reason of ['clear','view','map','config','hidden'])test(phase+' response cannot publish after '+reason,async()=>{
 const f=fixture({preflight:phase==='preflight'}),{pending}=await f.baseline();
 const request=phase==='preflight'?f.preflights[0]:f.solves[1];assert(request);
 if(reason==='clear')f.w.clearCaptureRoute();if(reason==='view')f.w.state.jimuMapView={view:{map:{}}};if(reason==='map')f.view.map={};if(reason==='config')f.w.props.config={};if(reason==='hidden')f.w.props.visible=false;
 request.resolve(phase==='preflight'?f.fittingPreflight(request):result());await pending;
 assert.equal(published(f).length,0);assert.equal(f.draws.length,0);assert.equal(f.toasts.length,0);assert.equal(f.errors.length,0);assert.equal(f.w.state.isGeneratingRoute,false);
 assert((phase==='preflight'?request.signal:request.options.signal).aborted);
});
test('fitting preflight precedes the authoritative solve and shares its run signal',async()=>{
 const f=fixture({preflight:true}),{pending}=await f.baseline();assert.equal(f.solves.length,1);const p=f.preflights[0];p.resolve(f.fittingPreflight(p));await flush();assert.equal(f.solves.length,2);assert.equal(f.solves[1].options.signal,p.signal);f.solves[1].resolve(result());await pending;success(f,3,1);
});
test('hard-snap rejection removes the affected opportunity before final solve and summary',async()=>{
 const f=fixture({preflight:true}),{pending}=await f.baseline();const p=f.preflights[0],reply=f.fittingPreflight(p);reply.waypointSnapDistancesMeters[1]=100;p.resolve(reply);await flush();
 const next=f.preflights[1];assert(next);next.resolve(f.fittingPreflight(next));await flush();assert.equal(f.solves[1].options.stops.length,6);f.solves[1].resolve(result());await pending;success(f,2,1);assert.deepEqual(f.coverage[0].targets.map(t=>t.index),[1,2]);
});
for(const phase of ['final','preflight'])test(phase+' provider failure releases busy state without publishing',async()=>{
 const f=fixture({preflight:phase==='preflight'}),{pending}=await f.baseline();(phase==='preflight'?f.preflights[0]:f.solves[1]).reject(new Error('controlled provider failure'));await pending;
 assert.equal(published(f).length,0);assert.equal(f.draws.length,0);assert.equal(f.errors.length,1);assert.equal(f.toasts.length,1);assert.equal(f.w.state.isGeneratingRoute,false);
});
test('older final response cannot finish or publish over a newer pending run',async()=>{
 const f=fixture(),old=await f.baseline(),stale=f.solves[1];f.w.clearCaptureRoute();const next=f.start();await flush();assert.equal(f.solves.length,3);
 stale.resolve(result());await old.pending;assert(f.w.state.isGeneratingRoute);assert.equal(published(f).length,0);assert(stale.options.signal.aborted);
 f.solves[2].resolve(result(10,0));await flush();f.solves[3].resolve(result(12,3));await next;success(f,3,3);
});
test('cancellation during drawing prevents final state publication',async()=>{
 const f=fixture(),gate=deferred();f.w.drawCaptureRoute=async()=>gate.promise;
 const {pending}=await f.baseline();f.solves[1].resolve(result());await flush();assert.equal(f.coverage.length,1);f.w.clearCaptureRoute();gate.resolve();await pending;assert.equal(published(f).length,0);assert.equal(f.toasts.length,0);
});
test('malformed final geometry fails before coverage, drawing or publication',async()=>{
 const f=fixture(),{pending}=await f.baseline();f.solves[1].resolve({...result(),paths:[]});await pending;assert.equal(f.coverage.length,0);assert.equal(f.draws.length,0);assert.equal(published(f).length,0);assert.equal(f.errors.length,1);assert.equal(f.w.state.isGeneratingRoute,false);
});
test('equal-time retry keeps the latest solved selection under the strict recovery rule',async()=>{
 const f=fixture(),{pending}=await f.baseline();f.solves[1].resolve(result(20,1));await flush();f.solves[2].resolve(result(20,2));await pending;success(f,1,2);
});
test('over-budget preflight prunes and rebuilds ordered stops before authoritative solving',async()=>{
 const f=fixture({preflight:true}),{pending}=await f.baseline();const first=f.preflights[0];first.resolve({...f.fittingPreflight(first),durationMinutes:30});await flush();
 const next=f.preflights[1];assert(next,'a reduced set must be preflighted');assert(next.stops.length<first.stops.length);assert(next.stops.length>=4);assert.equal(f.solves.length,1);
 next.resolve(f.fittingPreflight(next));await flush();f.solves[1].resolve(result());await pending;success(f,(next.stops.length-2)/2,1);
});
test('replacement probes choose the greatest value gain and publish its matching selection',async()=>{
 const f=fixture({preflight:true,replacement:true}),{pending}=await f.baseline();
 f.preflights[0].resolve(f.fittingPreflight(f.preflights[0]));await flush();
 for(let i=1;i<=3;i++){assert(f.preflights[i],'replacement probe '+i);f.preflights[i].resolve(f.fittingPreflight(f.preflights[i]));await flush();}
 const verification=f.preflights[4];assert(verification,'chosen replacement must be verified');verification.resolve(f.fittingPreflight(verification));await flush();
 assert.equal(f.solves.length,2);f.solves[1].resolve(result());await pending;success(f,3,1);
 assert.deepEqual(f.coverage[0].targets.map(t=>t.index),[1,2,3]);
 assert(f.calls.some(args=>String(args[0]).includes('OSRM chosen replacement: remove op-0 / add op-3')));
});
for(const empty of ['emptyCorridor','emptySelection'])test(empty+' retains feedback and stops before final/preflight requests',async()=>{
 const f=fixture({preflight:true,[empty]:true}),{pending}=await f.baseline();await pending;
 assert.equal(f.solves.length,1);assert.equal(f.preflights.length,0);assert.equal(f.draws.length,0);assert.equal(published(f).length,0);assert.equal(f.toasts.length,1);assert.equal(f.errors.length,0);assert.equal(f.w.state.isGeneratingRoute,false);
 const logs=f.calls.map(args=>String(args[0]));assert(logs.some(s=>s.includes('Selected corridor:')));assert.equal(logs.some(s=>s.includes('Selected opportunities:')),empty==='emptySelection');
});
