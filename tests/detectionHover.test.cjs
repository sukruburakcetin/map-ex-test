const test=require('node:test'),assert=require('node:assert/strict');
const {fixture,flush}=require('./helpers/detectionHoverFixture.cjs');
async function trace(legacy,options={},action=f=>f.refresh()){const f=fixture(legacy,options);await action(f);await flush();const result=f.result();f.cleanup();return result;}
for(const[name,options]of [['all labels',{}],['focus labels',{mode:'focus'}],['labels hidden',{labels:false}],['target focus',{target:'stop',mode:'focus'}],['zero color fallback',{zeroColor:true}],['individual tag failure',{throwTag:'stop'}],['no viewer container',{noContainer:true}]])test('frozen/current detection binding: '+name,async()=>assert.deepEqual(await trace(false,options),await trace(true,options)));
for(const mode of ['all','focus'])test('hover and persistent selection in '+mode+' mode',async()=>{
 const action=async f=>{f.component.ids=['pole'];f.move();await flush();f.flushTimers();assert.equal(f.component.tags.find(t=>t.id==='pole').options.lineWidth,3);f.click();await flush();f.leave();assert.equal(f.component.tags.find(t=>t.id==='pole').options.lineWidth,3);f.component.ids=[];f.click();await flush();assert.equal(f.w.state.viewerDetectionNote,null);};
 assert.deepEqual(await trace(false,{mode},action),await trace(true,{mode},action));
});
test('target flashing preserves hidden text and empty outline fill',async()=>{
 const action=f=>{f.refresh();const target=f.component.tags.find(t=>t.id==='stop');assert.equal(target.options.lineWidth,4);assert.equal(target.options.fillOpacity,0);f.tick();f.w.state.showAiTags=false;f.refresh();f.tick();assert(f.component.tags.every(t=>t.options.text===''));f.w.state.showAiTags=true;f.refresh();};
 assert.deepEqual(await trace(false,{target:'stop'},action),await trace(true,{target:'stop'},action));
});
for(const draft of ['none','note','workspace','marker'])test('verified feature location and existing '+draft+' draft',async()=>{
 const action=async f=>{Object.assign(f.w.state,{selectedFeatureMetadata:{id:'feature'},selectedFeatureLocation:{lon:0,lat:0},alternateImages:[{id:'image',detectionId:'pole'}]});if(draft==='note')f.w.state.pendingFieldNote={};if(draft==='workspace')f.w.state.detectionWorkspaceDraft={};if(draft==='marker')f.w._detectionWorkspaceMarkerOwner={};f.component.ids=['pole'];f.click();await flush();assert.deepEqual(f.w.state.viewerDetectionNote.location,{lon:0,lat:0,featureId:'feature'});assert.equal(f.events.some(e=>e[0]==='marker'),draft==='none');};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
for(const kind of ['unverified','unknown','empty','noCanvas'])test('detection click: '+kind,async()=>{
 const action=async f=>{f.component.ids=kind==='unknown'?['unknown']:kind==='empty'?[]:['pole'];f.click();await flush();if(kind!=='noCanvas')assert(!f.w.state.viewerDetectionNote?.location);};
 assert.deepEqual(await trace(false,{noCanvas:kind==='noCanvas'},action),await trace(true,{noCanvas:kind==='noCanvas'},action));
});
for(const change of ['viewer','image','disabled','cleanup','leave'])test('pending detection click rejects '+change,async()=>{
 const action=async f=>{f.click();await flush();if(change==='viewer')f.w.mapillaryViewer={};if(change==='image')f.w.state.imageId='other';if(change==='disabled')f.w.state.detectionsActive=false;if(change==='cleanup')f.cleanup();if(change==='leave')f.leave();f.pending[0].resolve(['pole']);await flush();f.flushTimers();assert(!f.events.some(e=>e[0]==='state'));};
 assert.deepEqual(await trace(false,{heldHits:true},action),await trace(true,{heldHits:true},action));
});
test('newer hit wins when queries complete in reverse order',async()=>{
 const action=async f=>{f.move();f.move();f.pending[1].resolve(['stop']);await flush();f.flushTimers();const tags=f.component.tags;f.pending[0].resolve(['pole']);await flush();f.flushTimers();assert.equal(f.component.tags,tags);assert.equal(f.component.tags.find(t=>t.id==='stop').options.lineWidth,3);};
 assert.deepEqual(await trace(false,{heldHits:true,mode:'focus'},action),await trace(true,{heldHits:true,mode:'focus'},action));
});
for(const ending of ['leave','cleanup','remove'])test('pending hover is retired by '+ending,async()=>{
 const action=async f=>{f.move();if(ending==='leave')f.leave();if(ending==='cleanup')f.cleanup();if(ending==='remove')f.viewerEvents.get('remove')();f.pending[0].resolve(['pole']);await flush();f.flushTimers();assert.equal(f.component.tags.length,0);};
 assert.deepEqual(await trace(false,{heldHits:true,target:'stop'},action),await trace(true,{heldHits:true,target:'stop'},action));
});
test('failed tag hit schedules the existing 50ms clear and preserves selection',async()=>{
 const action=async f=>{f.refresh();f.move();await flush();assert([...f.events].some(e=>e[0]==='timeout'&&e[2]===50));f.flushTimers();f.click();await flush();assert.equal(f.w.state.viewerDetectionNote,undefined);};
 assert.deepEqual(await trace(false,{failedHit:true},action),await trace(true,{failedHit:true},action));
});
test('cleanup is idempotent and clears queued work without detaching a replacement viewer',async()=>{
 const action=async f=>{f.move();await flush();assert.equal(f.timeouts.size,1);const replacement={};f.w.mapillaryViewer=replacement;f.cleanup();f.cleanup();assert.equal(f.timeouts.size,0);assert.equal(f.intervals.size,0);assert.equal(f.viewerEvents.size,0);assert.equal(f.component._refreshDetectionLabels,undefined);assert.equal(f.w.mapillaryViewer,replacement);};
 assert.deepEqual(await trace(false,{target:'stop'},action),await trace(true,{target:'stop'},action));
});
