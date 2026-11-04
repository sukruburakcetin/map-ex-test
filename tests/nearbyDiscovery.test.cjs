const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const root=path.join(__dirname,'../src');
const nearModule={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/nearbyDiscovery.ts'),'utf8')))(()=>({GRAPH_API:{nearbyImages:(lat,lon,radius,limit)=>`https://example.invalid/nearby?lat=${lat}&lon=${lon}&limit=${limit}`},TIMING:{SPLASH_FADE_MS:200}}),nearModule,nearModule.exports);
const queueModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/BackgroundRequestQueue.ts'),'utf8')))(queueModule,queueModule.exports);
const {NearbyImageDiscovery,nearestNearbyImages}=nearModule.exports,{BackgroundRequestQueue}=queueModule.exports;
const flush=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;return{promise:new Promise((a,b)=>{resolve=a;reject=b}),resolve:value=>resolve(value),reject:error=>reject(error)}};
function setup(t,{queue,initial=false,visible=true}={}){
 const timers=new Map(),delays=[],updates=[],state={imageId:'A',nearbyLoading:false,nearbyImages:[{id:'existing'}]},flags={paused:true,initial,visible,token:'test',now:1000,interacting:false};let serial=0;
 const beforeSet=global.setTimeout,beforeClear=global.clearTimeout,beforeFetch=global.fetch;
 global.setTimeout=(work,delay)=>{const id=++serial;timers.set(id,work);delays.push(delay);return id};global.clearTimeout=id=>timers.delete(id);
 t.after(()=>{global.setTimeout=beforeSet;global.clearTimeout=beforeClear;global.fetch=beforeFetch});
 const owner=new NearbyImageDiscovery({getState:()=>state,update:patch=>{updates.push(patch);Object.assign(state,patch)},isPaused:()=>flags.paused,isVisible:()=>flags.visible,isInteracting:()=>flags.interacting,now:()=>flags.now,getToken:()=>flags.token,isInitialLoad:()=>flags.initial,markInitialLoadComplete:()=>{flags.initial=false},runBackground:queue?(work,signal)=>queue.run(work,signal):undefined});
 const idle=()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(work=>work())};
 return{owner,state,flags,updates,timers,delays,idle};
}
test('default nearby behavior waits for idle, preserves thumbnails, excludes active image and caps suggestions',async t=>{
 const {owner,state,updates,delays,idle}=setup(t);let calls=0;global.fetch=async()=>{calls++;assert.deepEqual(state.nearbyImages,[{id:'existing'}]);return{ok:true,json:async()=>({data:[{id:'A'},...Array.from({length:25},(_,i)=>({id:String(i)}))]})}};
 owner.schedule(41,29,'A');assert.deepEqual(delays,[1500]);assert.equal(calls,0);idle();assert.equal(calls,1);await flush();
 assert.equal(state.nearbyImages.length,20);assert(!state.nearbyImages.some(image=>image.id==='A'));assert.equal(state.nearbyLoading,false);assert.equal(updates[0].nearbyLoading,true);
});
test('initial nearby request retains splash delay and cancellation removes pending idle timer',async t=>{
 const {owner,flags,timers,delays,idle}=setup(t,{initial:true});let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>({data:[]})}};
 owner.schedule(41,29,'A');assert.equal(flags.initial,false);assert.deepEqual(delays,[500]);owner.cancel();assert.equal(timers.size,0);idle();await flush();assert.equal(calls,0);
});
test('idle callback defers transport while background queue is paused and resumes once',async t=>{
 const queue=new BackgroundRequestQueue(1);queue.setPaused(true);const {owner,state,idle}=setup(t,{queue});let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>({data:[{id:'B'}]})}};
 owner.schedule(41,29,'A');idle();await flush();assert.equal(calls,0);assert.equal(queue.stats.queued,1);assert.equal(state.nearbyLoading,true);
 queue.setPaused(false);await flush();assert.equal(calls,1);assert.deepEqual(state.nearbyImages,[{id:'B'}]);assert.equal(state.nearbyLoading,false);
});
test('cancelling queued nearby work prevents transport when capacity resumes',async t=>{
 const queue=new BackgroundRequestQueue(1);queue.setPaused(true);const {owner,idle}=setup(t,{queue});let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>({data:[]})}};
 owner.schedule(41,29,'A');idle();await flush();owner.cancel();await flush();assert.equal(queue.stats.queued,0);queue.setPaused(false);await flush();assert.equal(calls,0);
});
test('nearby JSON decoding retains its physical background slot through ignored cancellation',async t=>{
 const queue=new BackgroundRequestQueue(1),body=deferred();const {owner,idle,updates}=setup(t,{queue});let otherStarted=false,signal;
 global.fetch=async(url,options)=>{signal=options.signal;return{ok:true,json:()=>body.promise}};owner.schedule(41,29,'A');idle();await flush();
 const other=queue.run(async()=>{otherStarted=true});await flush();assert.equal(queue.stats.active,1);assert.equal(otherStarted,false);owner.cancel();await flush();assert.equal(signal.aborted,true);assert.equal(otherStarted,false);
 body.resolve({data:[{id:'late'}]});await other;await flush();assert.equal(otherStarted,true);assert(!updates.some(patch=>patch.nearbyImages));
});
test('older response cannot overwrite new suggestions or clear the new request loader',async t=>{
 const {owner,state,updates,idle}=setup(t),old=deferred(),latest=deferred();let calls=0;
 global.fetch=async()=>calls++?latest.promise:old.promise;
 owner.schedule(41,29,'A');idle();state.imageId='B';owner.schedule(41,29,'B');idle();assert.equal(state.nearbyLoading,true);
 old.resolve({ok:true,json:async()=>({data:[{id:'old-result'}]})});await flush();assert.equal(state.nearbyLoading,true);assert(!updates.some(patch=>patch.nearbyImages));
 latest.resolve({ok:true,json:async()=>({data:[{id:'new-result'}]})});await flush();assert.deepEqual(state.nearbyImages,[{id:'new-result'}]);assert.equal(state.nearbyLoading,false);
});
test('queued nearby work rechecks image and paused state before using network',async t=>{
 const queue=new BackgroundRequestQueue(1);queue.setPaused(true);const {owner,state,flags,idle}=setup(t,{queue});let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>({data:[]})}};
 owner.schedule(41,29,'A');idle();state.imageId='B';queue.setPaused(false);await flush();assert.equal(calls,0);assert.equal(state.nearbyLoading,false);
 state.imageId='A';queue.setPaused(true);owner.schedule(41,29,'A');idle();flags.paused=false;queue.setPaused(false);await flush();assert.equal(calls,0);
});
test('ordinary nearby request failure keeps existing thumbnails and clears only its own loader',async t=>{
 const {owner,state,idle}=setup(t);global.fetch=async()=>({ok:false});owner.schedule(41,29,'A');idle();await flush();assert.deepEqual(state.nearbyImages,[{id:'existing'}]);assert.equal(state.nearbyLoading,false);
});


test('Nearby ranks the whole batch before taking20, excluding active and duplicate captures',()=>{
 const image=(id,d)=>({id,geometry:{coordinates:[d,0]}});
 const batch=[image('current',0),...Array.from({length:25},(_,i)=>image(String(i),.0025-i*.0001)),image('closest',.000001),image('closest',.000002)];
 const before=JSON.stringify(batch),ranked=nearestNearbyImages(batch,0,0,'current');
 assert.equal(ranked.length,20);assert.equal(ranked[0].id,'closest');assert.equal(ranked[1].id,'24');assert(!ranked.some(image=>image.id==='current'));assert.equal(JSON.stringify(batch),before);
});
test('Nearby uses computed positions for distance and retains stable ties/unknown points last',()=>{
 const batch=[{id:'unknown'},{id:'far',geometry:{coordinates:[1,0]}},{id:'computed',geometry:{coordinates:[2,0]},computed_geometry:{coordinates:[0,0]}},{id:'same',geometry:{coordinates:[0,0]}}];
 assert.deepEqual(nearestNearbyImages(batch,0,0,'main').map(image=>image.id),['computed','same','far','unknown']);
});
test('Nearby distance sorting handles the antimeridian',()=>{
 const batch=[{id:'far',geometry:{coordinates:[179,0]}},{id:'across',geometry:{coordinates:[-179.999,0]}}];assert.equal(nearestNearbyImages(batch,0,179.999,'main')[0].id,'across');
});


test('closed Nearby panel schedules no optional work',async t=>{const x=setup(t,{visible:false});let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>({data:[]})}};x.owner.schedule(41,29,'A',true);assert.equal(x.timers.size,0);await flush();assert.equal(calls,0);assert.equal(x.owner.stats.requests,0)});
test('repeat demand shares one request and reopening reuses cached metadata',async t=>{const x=setup(t),body=deferred();let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:()=>body.promise}};x.owner.schedule(41,29,'A',true);x.owner.schedule(41,29,'A',true);assert.equal(calls,1);body.resolve({data:[{id:'B'}]});await flush();x.owner.cancel();x.owner.schedule(41,29,'A',true);await flush();assert.equal(calls,1);assert.equal(x.owner.stats.cacheHits,1);assert.deepEqual(x.state.nearbyImages,[{id:'B'}])});
test('first demand requests40; only explicit expansion requests100 and reveals at most20',async t=>{const x=setup(t),limits=[];global.fetch=async url=>{const limit=Number(new URL(url).searchParams.get('limit'));limits.push(limit);return{ok:true,json:async()=>({data:Array.from({length:limit},(_,i)=>({id:'capture-'+i,geometry:{coordinates:[29+i*.00001,41]}}))})}};x.owner.schedule(41,29,'A',true);await flush();assert.deepEqual(limits,[40]);assert.equal(x.state.nearbyCanExpand,true);assert.equal(x.state.nearbyImages.length,20);x.owner.schedule(41,29,'A',true,true);await flush();assert.deepEqual(limits,[40,100]);assert.equal(x.state.nearbyCanExpand,false);assert.equal(x.state.nearbyImages.length,20);x.owner.schedule(41,29,'A',true);await flush();assert.deepEqual(limits,[40,100]);assert.equal(x.owner.stats.cacheHits,1)});
test('cache expires and credentials do not share cached results',async t=>{const x=setup(t);let calls=0;global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'capture-'+(++calls)}]})});x.owner.schedule(41,29,'A',true);await flush();x.flags.now+=120001;x.owner.schedule(41,29,'A',true);await flush();assert.equal(calls,2);x.flags.token='different-secret';x.owner.schedule(41,29,'A',true);await flush();assert.equal(calls,3);assert.equal(x.owner.stats.cachedAreas,1);assert(!JSON.stringify(x.owner.stats).includes('different-secret'))});
test('cache stays bounded to12 areas',async t=>{const x=setup(t);global.fetch=async()=>({ok:true,json:async()=>({data:[]})});for(let i=0;i<15;i++){x.owner.schedule(41,29+i*.001,'A',true);await flush();}assert.equal(x.owner.stats.cachedAreas,12)});
test('closing demand aborts transport and late responses never reorder the loaded strip',async t=>{const x=setup(t),body=deferred();let signal;global.fetch=async(url,options)=>{signal=options.signal;return{ok:true,json:()=>body.promise}};x.owner.schedule(41,29,'A',true);x.flags.visible=false;x.owner.cancel();assert.equal(signal.aborted,true);assert.equal(x.state.nearbyLoading,false);body.resolve({data:[{id:'late'}]});await flush();assert.deepEqual(x.state.nearbyImages,[{id:'existing'}]);assert.equal(x.owner.stats.cachedAreas,0)});
test('local metrics measure request/JSON time and reported bytes without storing identities',async t=>{const x=setup(t);global.fetch=async()=>{x.flags.now+=10;return{ok:true,headers:{get:()=> '2048'},json:async()=>{x.flags.now+=15;return{data:[]}}}};x.owner.schedule(41,29,'A',true);await flush();const stats=x.owner.stats;assert.equal(stats.requests,1);assert.equal(stats.lastRequestMs,25);assert.equal(stats.responseBytes,2048);assert.equal(stats.sizedResponses,1);x.owner.resetStats();assert.equal(x.owner.stats.requests,0);assert.equal(x.owner.stats.cachedAreas,1)});


test('completed results do not move thumbnails under a hovering pointer',async t=>{const x=setup(t);x.flags.interacting=true;global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'new'}]})});x.owner.schedule(41,29,'A',true);await flush();assert.deepEqual(x.state.nearbyImages,[{id:'existing'}]);assert.equal(x.state.nearbyLoading,false);x.flags.interacting=false;x.owner.flush();assert.deepEqual(x.state.nearbyImages,[{id:'new'}])});
test('cancelled deferred results cannot replace a new image list',async t=>{const x=setup(t);x.flags.interacting=true;global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'old'}]})});x.owner.schedule(41,29,'A',true);await flush();x.owner.cancel();x.state.imageId='B';x.flags.interacting=false;x.owner.flush();assert.deepEqual(x.state.nearbyImages,[{id:'existing'}])});
