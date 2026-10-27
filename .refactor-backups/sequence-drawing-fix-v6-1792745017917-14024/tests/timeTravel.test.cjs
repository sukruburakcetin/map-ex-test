const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const constantsModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/utils/constants.ts'),'utf8')))(constantsModule,constantsModule.exports);
const geoModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/utils/geoUtils.ts'),'utf8')))(geoModule,geoModule.exports);
const moduleValue={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/imagery/timeTravel.ts'),'utf8')))(id=>id.endsWith('constants')?constantsModule.exports:geoModule.exports,moduleValue,moduleValue.exports);
const {checkTimeTravelAvailability,TimeTravelAvailability}=moduleValue.exports;
const current={id:'A',sequence:'drive-A',captured_at:'2020-01-01',geometry:{coordinates:[29,41]},computed_geometry:{coordinates:[29,41]},computed_compass_angle:359};
const candidate={id:'other',sequence:'drive-B',captured_at:'2021-01-01',geometry:{coordinates:[29,41]},computed_geometry:{coordinates:[29,41]},computed_compass_angle:1};
const response=(data,ok=true)=>({ok,json:async()=>data});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const flush=()=>new Promise(r=>setImmediate(r));
function mock(t,fn){const original=global.fetch;global.fetch=fn;t.after(()=>global.fetch=original)}
test('existing rules preserve different-date/sequence proximity and circular angle match',async t=>{
 let calls=0;mock(t,async()=>response(calls++?{data:[candidate]}:current));const values=[];await checkTimeTravelAvailability('A',()=> 'test',v=>values.push(v));assert.deepEqual(values,[true]);assert.equal(calls,2);
});
test('existing missing reconstruction, no current image and non-OK policies remain',async t=>{
 const values=[];mock(t,async()=>response({...current,computed_geometry:null}));await checkTimeTravelAvailability('A',()=> 'test',v=>values.push(v));await checkTimeTravelAvailability('',()=> 'test',v=>values.push(v));global.fetch=async()=>response({},false);await checkTimeTravelAvailability('A',()=> 'test',v=>values.push(v));assert.deepEqual(values,[false,false]);
});
test('aborting after current-image JSON prevents the candidate lookup and fallback update',async t=>{
 const controller=new AbortController(),values=[];let calls=0;mock(t,async()=>{calls++;return{ok:true,json:async()=>{controller.abort();return current}}});await checkTimeTravelAvailability('A',()=> 'test',v=>values.push(v),controller.signal);assert.equal(calls,1);assert.deepEqual(values,[]);
});
test('both fetches receive cancellation and an aborted candidate response cannot update',async t=>{
 const controller=new AbortController(),values=[],signals=[];let calls=0;mock(t,async(url,options)=>{signals.push(options.signal);if(calls++)return{ok:true,json:async()=>{controller.abort();return{data:[candidate]}}};return response(current)});await checkTimeTravelAvailability('A',()=> 'test',v=>values.push(v),controller.signal);assert.deepEqual(signals,[controller.signal,controller.signal]);assert.deepEqual(values,[]);
});
test('preaborted availability work performs no request and no fallback',async t=>{
 const controller=new AbortController();controller.abort();let calls=0;const values=[];mock(t,async()=>{calls++;return response(current)});await checkTimeTravelAvailability('A',()=> 'test',v=>values.push(v),controller.signal);assert.equal(calls,0);assert.deepEqual(values,[]);
});
test('duplicate latest-image callers share one chain and reuse its successful result',async t=>{
 const held=deferred(),values=[];let calls=0;mock(t,async()=>{if(calls++===0)return held.promise;return response({data:[candidate]})});const owner=new TimeTravelAvailability(()=> 'test',(id,value)=>values.push([id,value]));const a=owner.update('A'),b=owner.update('A');assert.equal(a,b);assert.equal(calls,1);held.resolve(response(current));await a;assert.equal(calls,2);assert.deepEqual(values,[['A',true]]);await owner.update('A');assert.equal(calls,2);assert.deepEqual(values,[['A',true],['A',true]]);
});
test('a new image aborts old work and ignores late responses even if transport ignores abort',async t=>{
 const old=deferred(),values=[],signals=[];mock(t,async(url,options)=>{signals.push(options.signal);if(url.includes('/A?'))return old.promise;if(url.includes('/B?'))return response({...current,id:'B'});return response({data:[candidate]})});const owner=new TimeTravelAvailability(()=> 'test',(id,value)=>values.push([id,value]));const a=owner.update('A');await owner.update('B');assert.equal(signals[0].aborted,true);old.resolve(response(current));await a;assert.deepEqual(values,[['B',true]]);assert.equal(signals.length,3);
});
test('clear cancels pending work and permits a fresh same-image request',async t=>{
 const old=deferred(),values=[];let calls=0;mock(t,async()=>{if(calls++===0)return old.promise;return response({...current,computed_geometry:null})});const owner=new TimeTravelAvailability(()=> 'test',(id,value)=>values.push([id,value]));const a=owner.update('A');owner.clear();await owner.update('A');old.resolve(response(current));await a;assert.equal(calls,2);assert.deepEqual(values,[['A',false]]);
});
test('token changes invalidate same-image cache and suppress older-token callbacks',async t=>{
 const held=deferred(),values=[];let token='one',calls=0;mock(t,async()=>{if(calls++===0)return held.promise;return response({...current,computed_geometry:null})});const owner=new TimeTravelAvailability(()=>token,(id,value)=>values.push([id,value]));const a=owner.update('A');token='two';await owner.update('A');held.resolve(response(current));await a;assert.deepEqual(values,[['A',false]]);assert.equal(calls,2);
});
test('transient failures and non-OK responses are retryable instead of becoming cached availability',async t=>{
 const values=[];let calls=0;mock(t,async()=>{calls++;if(calls===1)throw Error('offline');if(calls===2)return response({},false);return response({...current,computed_geometry:null})});const owner=new TimeTravelAvailability(()=> 'test',(id,value)=>values.push([id,value]));await owner.update('A');await owner.update('A');await owner.update('A');assert.equal(calls,3);assert.deepEqual(values,[['A',false],['A',false]]);await owner.update('A');assert.equal(calls,3);
});
test('latest-image cancellation while candidate lookup is pending produces no stale apply',async t=>{
 const held=deferred(),values=[];let calls=0;mock(t,async(url)=>{calls++;if(url.includes('/A?'))return response(current);if(url.includes('/B?'))return response({...current,computed_geometry:null});return held.promise});const owner=new TimeTravelAvailability(()=> 'test',(id,value)=>values.push([id,value]));const a=owner.update('A');await flush();await owner.update('B');held.resolve(response({data:[candidate]}));await a;assert.deepEqual(values,[['B',false]]);assert.equal(calls,3);
});

for(const [name,change,expected] of [
 ['same image',{id:'A'},false],['same sequence',{sequence:'drive-A'},false],['same day',{captured_at:'2020-01-01T03:00:00Z'},false],
 ['unreconstructed',{computed_geometry:null},false],['outside radius',{computed_geometry:{coordinates:[29.001,41]}},false],
 ['wrong facing angle',{computed_compass_angle:90},false],['panorama facing exception',{is_pano:true,computed_compass_angle:90},true],
])test('native availability rule: '+name,async t=>{
 let calls=0;const values=[];mock(t,async()=>response(calls++?{data:[{...candidate,...change}]}:current));await checkTimeTravelAvailability('A',()=> 'test',value=>values.push(value));assert.deepEqual(values,[expected]);
});

test('cancelUnless preserves matching work and aborts obsolete work without starting a new request',async t=>{
 const held=deferred(),values=[],signals=[];let calls=0;mock(t,async(url,options)=>{calls++;signals.push(options.signal);return calls===1?held.promise:response({...current,id:'B',computed_geometry:null})});
 const owner=new TimeTravelAvailability(()=> 'test',(id,value)=>values.push([id,value]));const a=owner.update('A');owner.cancelUnless('A');assert.equal(signals[0].aborted,false);assert.equal(owner.update('A'),a);assert.equal(calls,1);
 owner.cancelUnless('B');assert.equal(signals[0].aborted,true);assert.equal(calls,1);held.resolve(response(current));await a;assert.deepEqual(values,[]);assert.equal(calls,1);
 await owner.update('B');assert.equal(calls,2);assert.deepEqual(values,[['B',false]]);owner.cancelUnless('B');await owner.update('B');assert.equal(calls,2);
});
test('cancelUnless invalidates a matching image when token changes',async t=>{
 const held=deferred(),values=[];let token='one',signal,calls=0;mock(t,async(url,options)=>{calls++;signal=options.signal;return held.promise});const owner=new TimeTravelAvailability(()=>token,(id,value)=>values.push([id,value]));const task=owner.update('A');token='two';owner.cancelUnless('A');assert.equal(signal.aborted,true);assert.equal(calls,1);held.resolve(response(current));await task;assert.deepEqual(values,[]);
});
