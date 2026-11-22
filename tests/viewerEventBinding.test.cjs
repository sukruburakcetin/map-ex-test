const test=require('node:test'),assert=require('node:assert/strict');
const {fixture}=require('./helpers/viewerEventsFixture.cjs');
async function trace(legacy,options={},action=()=>{}){const f=fixture(legacy,options);await action(f);return f.result();}
for(const[name,options]of [['normal registration',{}],['absent viewer',{noViewer:true}],['absent view',{noView:true}],['absent container',{noContainer:true}],['absent components',{componentsMissing:true}],['reused playback owner',{existingPlayback:true}],['no selected sequence',{noSelection:true}],['no active frame',{noFrame:true}]])test('frozen/current viewer load: '+name,async()=>{
 const action=f=>{f.emit('load');f.runTimers(500);};assert.deepEqual(await trace(false,options,action),await trace(true,options,action));
});
for(const step of [0,2,3])test('wheel and SDK zoom bounds at step '+step,async()=>{
 const action=f=>{f.emit('load');f.zoom(1);f.zoom(-1);f.wheel(-1);f.wheel(1);f.wheel(0);};
 assert.deepEqual(await trace(false,{step},action),await trace(true,{step},action));
});
for(const[name,options]of [['confirmed camera',{}],['explicit shared zero',{shared:0}],['unready camera',{camera:undefined}],['absent bearing owner',{noBearing:true}],['fly-in heading protection',{flying:true}],['no image URL',{noImage:true}],['no route cone',{noSelection:true}],['no frame',{noFrame:true}]])test('frozen/current bearing: '+name,async()=>{
 const action=f=>{f.emit('bearing',{bearing:45});f.emit('bearing',{bearing:60});assert.equal(f.rafs.size,1);f.runRaf();f.runTimers(600);};
 assert.deepEqual(await trace(false,options,action),await trace(true,options,action));
});
for(const options of [{sync:true},{sync:true,locked:true},{sync:true,moving:true},{sync:true,moving:true,locked:true},{sync:true,heading:false},{sync:true,flying:true},{sync:true,type:'2d'},{sync:true,locked:true,noFrame:true}])test('3D map-heading policy '+JSON.stringify(options),async()=>{
 const action=f=>{f.emit('bearing',{bearing:45});f.runRaf();f.runTimers(600);};assert.deepEqual(await trace(false,options,action),await trace(true,options,action));
});
test('URL debounce reads the latest image and honors cancel through the existing widget slot',async()=>{
 const action=f=>{f.emit('bearing',{bearing:40});f.emit('bearing',{bearing:50});f.w.state.imageId='new-image';f.runTimers(600);assert(f.events.some(e=>e[0]==='updateUrlWithCurrentImage'&&e[1]==='new-image'));f.emit('bearing',{bearing:60});f.w._debouncedBearingUrlUpdate.cancel();f.runTimers(600);};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
test('retired viewer bearing/image callbacks are ignored while load retains its original live viewer reads',async()=>{
 const action=async f=>{f.replaceViewer();f.emit('load');const before=f.events.length;f.emit('bearing',{bearing:45});await f.emit('image',{image:{id:'image'}});assert.equal(f.events.length,before);assert(f.events.some(e=>e[0]==='component'&&e[1]==='B'));};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
test('image handler reuses one capability host for repeated SDK emissions',async()=>{
 const action=async f=>{await f.emit('image',{image:{id:'image'}});await f.emit('image',{image:{id:'next'}});assert.equal(f.result().imageHosts,1);};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});
test('load repetition reuses playback ownership without changing registration or subscription counts',async()=>{
 const action=f=>{f.emit('load');f.emit('load');assert.equal(f.events.filter(e=>e[0]==='playbackCreate').length,1);assert.equal(f.events.filter(e=>e[0]==='playbackBind').length,2);};
 assert.deepEqual(await trace(false,{},action),await trace(true,{},action));
});

test('registered image events retain explicit-coordinate cone publication through real tracking',async()=>{
 async function run(legacy){
  const f=require('./helpers/viewerImageTrackingFixture.cjs').fixture(false),callbacks=new Map(),w=f.w;
  Object.assign(f.viewer,{on:(name,fn)=>callbacks.set(name,fn),getComponent:()=>null});
  w.viewerContainer={current:null};w.coneLengths=[10];w.coneSpreads=[60];w.zoomStepIndex=0;w._lastBearing=77;
  w.clearGreenPulse=()=>f.events.push(['clearPulse']);w.clearConeGraphics=()=>f.events.push(['clearCone']);w.drawCone=(...args)=>f.events.push(['drawCone',...args]);
  w._currentImageBearing.invalidate=()=>{};w._liveSequenceFrames.current=f.frame;w._liveSequenceFrames.find=()=>f.frame;
  require('./helpers/viewerEventsSource.cjs').install(w,{},legacy);w.bindMapillaryEvents();
  await callbacks.get('image')(f.event);f.flushDetails();
  assert(f.events.some(e=>e[0]==='drawCone'&&e[1]===1&&e[2]===2&&e[3]===77));assert.equal(w.state.imageId,'new-image');
  return f.result();
 }
 assert.deepEqual(await run(false),await run(true));
});
