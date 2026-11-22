/** Real widget warning binding: no fixture-only Widget.warn may hide the over-budget failure. */
const test=require('node:test'),assert=require('node:assert/strict');
const {fixture,result,flush}=require('./helpers/captureRouteFixture.cjs');
function realBinding(options){const f=fixture(options);delete f.w.warn;assert.equal(typeof f.w.warn,'undefined');return f;}
function published(f,selected,extra){assert.equal(f.errors.length,0,f.errors.map(args=>String(args[1])).join('\n'));assert(f.w.state.routeData);assert.equal(f.w.state.routeData.selectedOpportunityCount,selected);assert.equal(f.w.state.routeData.extraDurationMinutes,extra);assert.equal(f.w.state.isGeneratingRoute,false);assert(!f.w._routeGeneration.pending)}
const warnings=f=>f.calls.filter(args=>args[0]==='warning');
test('single over-budget opportunity warns and publishes its existing result without Widget.warn',async()=>{
 const f=realBinding({opportunityCount:1}),{pending}=await f.baseline();f.solves[1].resolve(result(20,1));await pending;
 published(f,1,10);assert.equal(f.solves.length,2);assert.equal(warnings(f).length,1);assert.equal(warnings(f)[0][1],'[CaptureRoute] Route still exceeds budget after pruning limit.');assert.equal(f.solves[0].options.signal,f.solves[1].options.signal);assert.equal(f.toasts.length,1);
});
test('fitting single-opportunity route retains publication without the over-budget warning',async()=>{
 const f=realBinding({opportunityCount:1}),{pending}=await f.baseline();f.solves[1].resolve(result(12,1));await pending;published(f,1,2);assert.equal(warnings(f).length,0);assert.equal(f.solves.length,2);
});
test('pruning down to one over-budget opportunity still publishes matching retry geometry',async()=>{
 const f=realBinding(),{pending}=await f.baseline();f.solves[1].resolve(result(20,1));await flush();assert.equal(f.solves.length,3);f.solves[2].resolve(result(20,2));await pending;
 published(f,1,10);assert.equal(f.w.state.routeData.geojson.coordinates[0][1],2);assert.equal(warnings(f).filter(args=>String(args[1]).includes('after pruning limit')).length,1);
});
test('OSRM-shaped over-budget single opportunity retains preflight and final-solve order',async()=>{
 const f=realBinding({opportunityCount:1,preflight:true}),{pending}=await f.baseline(),p=f.preflights[0];p.resolve({...f.fittingPreflight(p),durationMinutes:20});await flush();assert.equal(f.solves.length,2);f.solves[1].resolve(result(20,1));await pending;
 published(f,1,10);assert.equal(f.preflights.length,1);assert.equal(warnings(f).length,1);assert.equal(p.signal,f.solves[1].options.signal);
});
test('cancelled over-budget response cannot warn, draw or publish',async()=>{
 const f=realBinding({opportunityCount:1}),{pending}=await f.baseline();f.w.clearCaptureRoute();f.solves[1].resolve(result(20,1));await pending;
 assert.equal(warnings(f).length,0);assert.equal(f.errors.length,0);assert.equal(f.draws.length,0);assert.equal(f.w.state.routeData,null);assert.equal(f.w.state.isGeneratingRoute,false);
});
test('routing warning sink works without a Widget.warn or debug logger',()=>{
 const f=realBinding();f.w.log=()=>assert.fail('warning must not depend on debug logging');f.w.captureRouteExecutionHost(f.view).warn('controlled routing warning');assert.deepEqual(warnings(f),[['warning','controlled routing warning']]);
});
