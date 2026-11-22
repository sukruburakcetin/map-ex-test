/** Compare pre-extraction execution with the feature workflow, including public promise/finalizer boundaries. */
const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict');
const {compareCaptureRoute}=require('./helpers/captureRouteTrace.cjs');
const {result,deferred,flush}=require('./helpers/captureRouteFixture.cjs');
const original=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteExecution.baseline.json','utf8')).method;
const compare=(action,options)=>compareCaptureRoute(original,action,options);
for(const kind of ['view','destroyed','coverage','modules','busy'])test('entry guard '+kind+' retains promise and feedback',()=>compare(async f=>{
 if(kind==='view')f.w.state.jimuMapView=null;if(kind==='destroyed')f.view.destroyed=true;if(kind==='coverage')f.w._coverageSegments=[];if(kind==='modules')f.w.ArcGISModules=null;if(kind==='busy')f.w.state.isGeneratingRoute=true;
 let task;assert.doesNotThrow(()=>task=f.start());assert.equal(typeof task.then,'function');await task;assert.equal(f.solves.length,0);
}));
test('pre-run synchronous failure remains a rejected promise with original partial ownership',()=>compare(async f=>{
 const setState=f.w.setState;f.w.setState=()=>{throw new Error('busy publication failed')};let task;assert.doesNotThrow(()=>task=f.start());await assert.rejects(task,/busy publication failed/);assert(f.w._routeGeneration.pending);f.w.setState=setState;f.w.cancelCaptureRouteGeneration();
}));
for(const preflight of [false,true])test('normalized provider '+(preflight?'preflight':'direct')+' retains complete execution/finalizer trace',()=>compare(async f=>{
 const {pending}=await f.baseline();if(preflight){const p=f.preflights[0];p.resolve(f.fittingPreflight(p));await flush()}
 f.solves[1].resolve(result());await pending;assert(f.w.state.routeData);assert(!f.w._routeGeneration.pending);assert.equal(f.w.state.isGeneratingRoute,false);
},{preflight}));
test('baseline camera restoration still precedes preparation and final requests',()=>compare(async f=>{
 const gate=deferred();let count=0;f.w.restoreRoutingLoginView=()=>++count===1?gate.promise:Promise.resolve();const pending=f.start();await flush();f.solves[0].resolve(result(10,0));await flush();assert.equal(f.solves.length,1);gate.resolve();await flush();assert.equal(f.solves.length,2);f.solves[1].resolve(result());await pending;assert.equal(count,2);
}));
test('cancellation while baseline camera waits prevents further provider work',()=>compare(async f=>{
 const gate=deferred();f.w.restoreRoutingLoginView=()=>gate.promise;const pending=f.start();await flush();f.solves[0].resolve(result(10,0));await flush();f.w.clearCaptureRoute();gate.resolve();await pending;assert.equal(f.solves.length,1);assert.equal(f.draws.length,0);
}));
test('final camera restoration rejection still releases ownership and rejects the public promise',()=>compare(async f=>{
 let calls=0;f.w.restoreRoutingLoginView=()=>++calls===1?Promise.resolve():Promise.reject(new Error('final camera failed'));const {pending}=await f.baseline();f.solves[1].resolve(result());await assert.rejects(pending,/final camera failed/);assert(f.w.state.routeData);assert.equal(f.w.state.isGeneratingRoute,false);assert(!f.w._routeGeneration.pending);
}));
test('error-feedback failure still executes finally and releases busy state',()=>compare(async f=>{
 f.w.showToast=()=>{throw new Error('feedback failed')};const {pending}=await f.baseline();f.solves[1].reject(new Error('provider failed'));await assert.rejects(pending,/feedback failed/);assert.equal(f.w.state.isGeneratingRoute,false);assert(!f.w._routeGeneration.pending);
}));
for(const replacement of [false,true])test('post-login timer preserves snapshot identity; replacement='+replacement,()=>compare(async f=>{
 const timers=[],snapshot={id:'login-A'};f.context.setTimeout=(callback,ms)=>{timers.push({callback,ms});return 7};f.w._routingLoginView=snapshot;
 const {pending}=await f.baseline();f.solves[1].resolve(result());await pending;assert.equal(timers.length,1);assert.equal(timers[0].ms,15000);assert.equal(f.w._routingLoginExpiry,7);
 const nextSnapshot={id:'login-B'};if(replacement)f.w._routingLoginView=nextSnapshot;timers[0].callback();assert.equal(f.w._routingLoginView,replacement?nextSnapshot:null);if(replacement)assert.equal(f.w._routingLoginView.id,'login-B');assert.equal(f.w._routingLoginExpiry,null);
}));
test('a newer pending run keeps its busy state when the old execution settles',()=>compare(async f=>{
 const old=await f.baseline(),stale=f.solves[1];f.w.clearCaptureRoute();const next=f.start();await flush();stale.resolve(result());await old.pending;assert(f.w.state.isGeneratingRoute);
 f.solves[2].resolve(result(10,0));await flush();f.solves[3].resolve(result(12,3));await next;assert.equal(f.w.state.routeData.geojson.coordinates[0][1],3);
}));

test('workflow preserves all operational await expressions without a per-probe handoff',()=>{
 const path=require('node:path'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
 function awaits(text,kind){const sf=ts.createSourceFile(kind,text,99,true,kind.endsWith('tsx')?4:3),values=[];function visit(n){if(ts.isAwaitExpression(n))values.push(n.expression.getText(sf).replace(/\s+/g,' '));ts.forEachChild(n,visit)}visit(sf);return values}
 const before=awaits('class Original{'+original+'}','original.tsx');
 const current=fs.readFileSync(root+'/src/features/routing/executeCaptureRoute.ts','utf8').replaceAll('host.createProvider()','this.createCaptureRoutingProvider()').replaceAll('host.restoreCamera(run.current)','this.restoreRoutingLoginView(routeView, run.current)').replaceAll('host.draw(','this.drawCaptureRoute(');
 assert.deepEqual(awaits(current,'execution.ts'),before);
});
test('healthy widget entry returns the exact execution promise without another async wrapper',()=>{
 const {fixture}=require('./helpers/captureRouteFixture.cjs'),f=fixture(),promise=Promise.resolve();f.context.executeCaptureRoute=()=>promise;
 assert.equal(f.start(),promise);assert.equal(f.solves.length,0);f.w.cancelCaptureRouteGeneration();
});
