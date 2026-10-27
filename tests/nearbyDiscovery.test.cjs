const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const root=path.join(__dirname,'../src');
const nearModule={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/nearbyDiscovery.ts'),'utf8')))(()=>({GRAPH_API:{nearbyImages:(lat,lon)=>`https://example.invalid/nearby?lat=${lat}&lon=${lon}`},TIMING:{SPLASH_FADE_MS:200}}),nearModule,nearModule.exports);
const queueModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/BackgroundRequestQueue.ts'),'utf8')))(queueModule,queueModule.exports);
const {NearbyImageDiscovery}=nearModule.exports,{BackgroundRequestQueue}=queueModule.exports;
const flush=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;return{promise:new Promise((a,b)=>{resolve=a;reject=b}),resolve:value=>resolve(value),reject:error=>reject(error)}};
function setup(t,{queue,initial=false}={}){
 const timers=new Map(),delays=[],updates=[],state={imageId:'A',nearbyLoading:false,nearbyImages:[{id:'existing'}]},flags={paused:true,initial};let serial=0;
 const beforeSet=global.setTimeout,beforeClear=global.clearTimeout,beforeFetch=global.fetch;
 global.setTimeout=(work,delay)=>{const id=++serial;timers.set(id,work);delays.push(delay);return id};global.clearTimeout=id=>timers.delete(id);
 t.after(()=>{global.setTimeout=beforeSet;global.clearTimeout=beforeClear;global.fetch=beforeFetch});
 const owner=new NearbyImageDiscovery({getState:()=>state,update:patch=>{updates.push(patch);Object.assign(state,patch)},isPaused:()=>flags.paused,getToken:()=> 'test',isInitialLoad:()=>flags.initial,markInitialLoadComplete:()=>{flags.initial=false},runBackground:queue?(work,signal)=>queue.run(work,signal):undefined});
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
