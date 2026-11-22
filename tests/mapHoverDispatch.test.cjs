const test=require('node:test'),assert=require('node:assert/strict');
const {fixture,flush}=require('./helpers/mapHoverFixture.cjs');
async function trace(legacy,options={},action=async f=>{f.move();await f.drain();}){const f=fixture(legacy,options);await action(f);await flush();return f.result();}
for(const[name,options]of [
 ['individual imagery',{}],['regional imagery',{zoom:8}],['coverage disabled',{turbo:false}],['no container',{noContainer:true}],
 ['optional detection failure',{featureFailure:true}],['detection owns label',{feature:true}],['POI owns label',{place:true}],
 ['native POI yields to imagery',{native:true}],['native POI after empty coverage',{native:true,emptyCoverage:true}],
 ['busy native POI',{native:true,emptyCoverage:true,busy:true}],['coverage failure',{coverageFailure:true}],
 ['cloud hover',{hits:[{layer:{id:'point-cloud-layer'},graphic:{attributes:{pointIndex:2}}}]}],
 ['cloud ObjectID fallback',{hits:[{layer:{id:'point-cloud-layer'},graphic:{attributes:{ObjectID:4}}}]}],
 ['SDK detection label',{hits:[{layer:{id:'mapillary-objects-fl'},graphic:{attributes:{name:'SDK object'}}}]}],
])test('frozen/current hover: '+name,async()=>assert.deepEqual(await trace(false,options),await trace(true,options)));
test('coverage paints while SDK hit testing is still pending',async()=>{
 const action=async f=>{f.move();const work=f.take();await flush();assert(f.events.some(e=>e[0]==='imagery'));assert(!f.events.some(e=>e[0]==='feature'));f.sdk.resolve({results:[]});await work;};
 assert.deepEqual(await trace(false,{heldSDK:true},action),await trace(true,{heldSDK:true},action));
});
for(const feature of [false,true])test('late coverage cannot replace '+(feature?'detection':'POI')+' label',async()=>{
 const action=async f=>{f.move();await f.take();f.coverage.resolve({attributes:{image_id:'late'}});await flush();assert(!f.events.some(e=>e[0]==='imagery'));};
 assert.deepEqual(await trace(false,{heldCoverage:true,feature,place:!feature},action),await trace(true,{heldCoverage:true,feature,place:!feature},action));
});
for(const change of ['owner','version','source'])test('native hover rejects changed '+change,async()=>{
 const action=async f=>{f.move();const work=f.take();await flush();assert(f.events.some(e=>e[0]==='native'));if(change==='owner')f.w._places={};if(change==='source')f.w._placesVectorLayer=null;if(change==='version')f.w._placesVectorLayer.version++;f.native.resolve({attributes:{gers_id:'old'},geometry:{x:1,y:2}});await work;assert(!f.events.some(e=>e[0]==='mapPlace'));};
 assert.deepEqual(await trace(false,{native:true,emptyCoverage:true,heldNative:true},action),await trace(true,{native:true,emptyCoverage:true,heldNative:true},action));
});
for(const actionName of ['coalesce','leave','cleanup','touch','location'])test('queued pointer ownership: '+actionName,async()=>{
 const action=async f=>{f.move();if(actionName==='coalesce')f.move({x:80,y:80});if(actionName==='leave')f.leave();if(actionName==='cleanup')f.w._turboMapLeaveCleanup();if(actionName==='touch'){f.fire(f.container,'pointerdown',{pointerType:'touch'});f.move();f.fire(f.doc,'pointerup',{pointerType:'touch'});}if(actionName==='location'){f.w._workspaceNoteLocation={active:true};f.move({x:90,y:90});}await f.drain();};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
for(const block of ['none','closed','hiddenDocument','movedContainer','dialog','outside','moving','view','layer','revision'])test('readiness replay guard: '+block,async()=>{
 const action=async f=>{f.move();await f.drain();const before=f.events.filter(e=>e[0]==='pointPick').length;
  if(block==='closed')f.w.props.state='CLOSED';if(block==='hiddenDocument')f.doc.visibilityState='hidden';if(block==='movedContainer')f.shift(100);if(block==='dialog')f.top({closest:()=>({})});if(block==='outside')f.top(null);if(block==='moving')f.view.interacting=true;if(block==='view')f.w.state.jimuMapView={view:{}};if(block==='layer')f.view.map.findLayerById=()=>null;
  f.w._coverageHoverResume.ready(f.view,block==='revision'?4:3);await f.drain();assert.equal(f.events.filter(e=>e[0]==='pointPick').length,before+(block==='none'?1:0));};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
test('cleanup of an old interaction preserves replacement owner slots',async()=>{
 const action=async f=>{f.move();const touch={},resume={},handler=()=>{};f.w._coverageTouchHover=touch;f.w._coverageHoverResume=resume;f.w._coverageHoverHandler=handler;f.w._turboMapLeaveCleanup();assert.equal(f.w._coverageTouchHover,touch);assert.equal(f.w._coverageHoverResume,resume);assert.equal(f.w._coverageHoverHandler,handler);await f.drain();};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
