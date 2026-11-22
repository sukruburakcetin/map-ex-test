const test=require('node:test'),assert=require('node:assert/strict');
const {fixture,flush}=require('./helpers/viewerImageTrackingFixture.cjs');
async function trace(legacy,options={},action=async f=>{await f.handler(f.event);f.flushCommits();f.flushDetails();}){const f=fixture(legacy,options);await action(f);await flush();return f.result();}
for(const[name,options]of [['same sequence',{}],['cross sequence',{lateral:true}],['initial viewer image',{initial:true}],['already confirmed viewer',{initial:true,confirmed:true}],['current places camera',{places:true}],['profile and map sync',{profile:true,sync:true}],['playing detail gates',{paused:false,detections:true,solar:true}],['paused secondary details',{detections:true,solar:true}],['fly-in URL protection',{flying:true}],['hidden-document playback',{hidden:true,paused:false}],['missing view',{noView:true}],['missing frame',{noFrame:true}],['metadata failure',{failure:true}],['deferred React updates',{batched:true,lateral:true}]])test('frozen/current image tracking: '+name,async()=>assert.deepEqual(await trace(false,options),await trace(true,options)));
for(const draft of ['none','note','workspace','marker'])test('detection selection cleanup with '+draft+' draft',async()=>{
 const action=async f=>{f.w.state.viewerDetectionNote={imageId:'old-image'};if(draft==='note')f.w.state.pendingFieldNote={};if(draft==='workspace')f.w.state.detectionWorkspaceDraft={};if(draft==='marker')f.w._detectionWorkspaceMarkerOwner={};await f.handler(f.event);assert.equal(f.events.some(e=>e[0]==='clearPendingNoteGraphic'),draft==='none');f.flushDetails();};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
for(const opening of ['loading','opening'])test('obsolete SDK image cannot cancel '+opening+' selection',async()=>{
 const action=async f=>{await f.handler(f.event);assert.equal(f.events.length,0);assert.equal(f.w._selectionAbort.signal.aborted,false);};
 assert.deepEqual(await trace(false,{[opening]:true,retry:'newer-image'},action),await trace(true,{[opening]:true,retry:'newer-image'},action));
});
for(const change of ['viewer','view','frame'])test('pending metadata rejects changed '+change,async()=>{
 const action=async f=>{const work=f.handler(f.event);if(change==='viewer')f.w.mapillaryViewer={};if(change==='view')f.w.state.jimuMapView={view:{}};if(change==='frame')f.invalidate();f.resolve();await work;assert(!f.events.some(e=>e[0]==='commit'));assert.equal(f.details.length,0);};
 assert.deepEqual(await trace(false,{held:true,lateral:true},action),await trace(true,{held:true,lateral:true},action));
});
for(const change of ['viewer','view','frame'])test('deferred React effects reject changed '+change,async()=>{
 const action=async f=>{await f.handler(f.event);if(change==='viewer')f.w.mapillaryViewer={};if(change==='view')f.w.state.jimuMapView={view:{}};if(change==='frame')f.invalidate();f.flushCommits();f.flushDetails();assert(!f.events.some(e=>e[0]==='pulse'));assert(!f.events.some(e=>e[0]==='loadDetections'));};
 assert.deepEqual(await trace(false,{batched:true,lateral:true,detections:true},action),await trace(true,{batched:true,lateral:true,detections:true},action));
});
test('secondary details read the current pause state and cannot delay frame publication',async()=>{
 const action=async f=>{await f.handler(f.event);assert(f.events.some(e=>e[0]==='pulse'));assert(!f.events.some(e=>e[0]==='loadDetections'));f.w._userPaused=false;f.flushDetails();assert(f.events.some(e=>e[0]==='loadDetections'));assert(!f.events.some(e=>e[0]==='fetchNearbyImages'));};
 assert.deepEqual(await trace(false,{detections:true},action),await trace(true,{detections:true},action));
});
test('late queued details cannot publish after a newer frame',async()=>{
 const action=async f=>{await f.handler(f.event);f.invalidate();f.flushDetails();assert(!f.events.some(e=>e[0]==='loadDetections'));};
 assert.deepEqual(await trace(false,{detections:true,solar:true},action),await trace(true,{detections:true,solar:true},action));
});
test('obsolete metadata rejection stays silent after viewer replacement',async()=>{
 const action=async f=>{const work=f.handler(f.event);f.w.mapillaryViewer={};f.reject();await work;assert(!f.events.some(e=>e[0]==='warn'));};
 assert.deepEqual(await trace(false,{held:true},action),await trace(true,{held:true},action));
});
