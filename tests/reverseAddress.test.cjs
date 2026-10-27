const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/services/geocoding/reverseAddress.ts'),'utf8')))(()=>({GEOCODE_URL:'https://example.invalid/reverse'}),mod,mod.exports);
const {fetchReverseAddress}=mod.exports;
const deferred=()=>{let resolve;return{promise:new Promise(done=>resolve=done),resolve:value=>resolve(value)}};
function mock(t,fetch){const before=global.fetch;global.fetch=fetch;t.after(()=>{global.fetch=before})}
test('reverse address keeps the existing address fragment and missing-address fallback',async t=>{
 const values=[];let calls=0;mock(t,async()=>({json:async()=>calls++?{}:{address:{LongLabel:'First, Second, Third'}}}));
 await fetchReverseAddress(41,29,value=>values.push(value));await fetchReverseAddress(41,29,value=>values.push(value));assert.deepEqual(values,['Second','Address not found']);
});
test('reverse address passes its signal and pre-aborted calls perform no work',async t=>{
 const controller=new AbortController(),signals=[],values=[];mock(t,async(url,options)=>{signals.push(options.signal);return{json:async()=>({address:{LongLabel:'Full label'}})}});
 await fetchReverseAddress(41,29,value=>values.push(value),controller.signal);controller.abort();await fetchReverseAddress(41,29,value=>values.push(value),controller.signal);
 assert.deepEqual(signals,[controller.signal]);assert.deepEqual(values,['Full label']);
});
test('reverse address cancellation after response skips JSON decoding and UI updates',async t=>{
 const controller=new AbortController(),values=[];let decoded=false;mock(t,async()=>{controller.abort();return{json:async()=>{decoded=true;return{}}}});
 await fetchReverseAddress(41,29,value=>values.push(value),controller.signal);assert.equal(decoded,false);assert.deepEqual(values,[]);
});
test('reverse address cancellation during JSON ignores late decoded results',async t=>{
 const controller=new AbortController(),body=deferred(),values=[];mock(t,async()=>({json:()=>body.promise}));const pending=fetchReverseAddress(41,29,value=>values.push(value),controller.signal);
 await new Promise(r=>setImmediate(r));controller.abort();body.resolve({address:{LongLabel:'Late address'}});await pending;assert.deepEqual(values,[]);
});
test('reverse address aborted transport never logs or applies its error fallback',async t=>{
 const controller=new AbortController(),values=[],logs=[],before=console.error;console.error=(...args)=>logs.push(args);t.after(()=>{console.error=before});mock(t,async()=>{controller.abort();throw new DOMException('Cancelled','AbortError')});
 await fetchReverseAddress(41,29,value=>values.push(value),controller.signal);assert.deepEqual(values,[]);assert.deepEqual(logs,[]);
});
test('reverse address ordinary network failure retains its existing error fallback',async t=>{
 const values=[],logs=[],before=console.error;console.error=(...args)=>logs.push(args);t.after(()=>{console.error=before});mock(t,async()=>{throw Error('offline')});await fetchReverseAddress(41,29,value=>values.push(value));
 assert.deepEqual(values,['Failed to fetch address']);assert.equal(logs.length,1);
});
