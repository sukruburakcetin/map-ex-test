const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const moduleObject={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/coverage/SequenceTileIndex.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(moduleObject,moduleObject.exports);
const {SequenceTileIndex}=moduleObject.exports;
const signal=()=>new AbortController().signal;
function decoder(sources){const state={decodes:0,reads:0,geometry:0};return{state,decode:()=>{state.decodes++;return{layers:Object.fromEntries(Object.entries(sources).map(([source,values])=>[source,{length:values.length,feature:i=>{state.reads++;return{properties:{[source==='sequence'?'id':'sequence_id']:values[i]},loadGeometry(){state.geometry++;throw Error('index must not decode geometry')}}}}]))}}}}
const flush=()=>new Promise(r=>setImmediate(r));
test('membership index reads each source once, returns typed source positions and never loads geometry',async()=>{
 const owner=new SequenceTileIndex(),buffer=new ArrayBuffer(256),{state,decode}=decoder({sequence:['A','B','A',null,''],image:['B','A','B',undefined,12]});
 const index=await owner.get(buffer,decode,signal());assert.deepEqual(Array.from(index.indices('sequence','A')),[0,2]);assert.deepEqual(Array.from(index.indices('image','B')),[0,2]);assert.deepEqual(Array.from(index.indices('image','12')),[4]);assert.equal(index.indices('sequence','absent').length,0);assert(index.indices('image','A') instanceof Uint32Array);assert.equal(state.reads,10);assert.equal(state.geometry,0);
 assert(index.estimatedBytes>=buffer.byteLength+6*4);assert.equal(owner.stats.bytes,index.estimatedBytes);assert.equal(owner.stats.entries,1);
 const same=await owner.get(buffer,decode,signal());assert.equal(same,index);assert.equal(state.decodes,1);assert.equal(state.reads,10);assert.equal(owner.stats.hits,1);
});
test('buffer identity invalidates replaced bytes even when tile contents and length are equal',async()=>{
 const owner=new SequenceTileIndex(),{state,decode}=decoder({sequence:['A']});const a=await owner.get(new ArrayBuffer(1),decode,signal()),b=await owner.get(new ArrayBuffer(1),decode,signal());assert.notEqual(a,b);assert.equal(state.decodes,2);assert.equal(owner.stats.builds,2);assert.equal(owner.stats.entries,2);
});
test('empty tiles and absent source layers have complete empty membership without decoding geometry',async()=>{
 const owner=new SequenceTileIndex();let decodes=0;const a=await owner.get(new ArrayBuffer(0),()=>{decodes++;throw Error('empty')},signal());assert.equal(decodes,0);assert.equal(a.indices('image','A').length,0);
 const b=await owner.get(new ArrayBuffer(1),()=>({layers:{}}),signal());assert.equal(b.indices('sequence','A').length,0);
});
test('pending callers share one producer and cancelling one keeps the other subscription alive',async()=>{
 const owner=new SequenceTileIndex(),buffer=new ArrayBuffer(8),controller=new AbortController(),{state,decode}=decoder({sequence:Array.from({length:2000},(_,i)=>i%2?'B':'A')});
 const a=owner.get(buffer,decode,controller.signal),b=owner.get(buffer,decode,signal());controller.abort();await assert.rejects(a,{name:'AbortError'});const result=await b;assert.equal(result.indices('sequence','A').length,1000);assert.equal(state.decodes,1);assert.equal(owner.stats.builds,1);assert.equal(owner.stats.entries,1);assert.equal(owner.stats.active,0);
});
test('final cancellation prevents a late completed build from entering the cache and permits retry',async()=>{
 const owner=new SequenceTileIndex(),buffer=new ArrayBuffer(8),controller=new AbortController(),{state,decode}=decoder({sequence:Array.from({length:2000},()=> 'A')});const a=owner.get(buffer,decode,controller.signal);controller.abort();await assert.rejects(a,{name:'AbortError'});await flush();assert.equal(owner.stats.entries,0);
 const b=await owner.get(buffer,decode,signal());assert.equal(b.indices('sequence','A').length,2000);assert.equal(owner.stats.builds,2);assert.equal(state.decodes,2);
});
test('clear cancels pending users, releases retained bytes and rejects work that ignored lifecycle cancellation',async()=>{
 const owner=new SequenceTileIndex(),buffer=new ArrayBuffer(8),{decode}=decoder({sequence:Array.from({length:3000},()=> 'A')});const a=owner.get(buffer,decode,signal()),b=owner.get(buffer,decode,signal());owner.clear();await Promise.all([assert.rejects(a,{name:'AbortError'}),assert.rejects(b,{name:'AbortError'})]);await flush();assert.equal(owner.stats.entries,0);assert.equal(owner.stats.bytes,0);assert.equal(owner.stats.active,0);
 await owner.get(buffer,decode,signal());assert.equal(owner.stats.entries,1);owner.clear();assert.equal(owner.stats.bytes,0);
});
test('decode failures do not poison the cache and a subsequent caller can retry',async()=>{
 const owner=new SequenceTileIndex(),buffer=new ArrayBuffer(8);let failed=true;const decode=()=>{if(failed)throw Error('bad PBF');return{layers:{}}};await assert.rejects(owner.get(buffer,decode,signal()),/bad PBF/);assert.equal(owner.stats.entries,0);assert.equal(owner.stats.active,0);failed=false;await owner.get(buffer,decode,signal());assert.equal(owner.stats.entries,1);assert.equal(owner.stats.builds,2);
});
test('estimated byte budget evicts old buffers and keeps frequently reused entries',async()=>{
 const {decode}=decoder({sequence:['A','A'],image:['A']});const probe=await new SequenceTileIndex().get(new ArrayBuffer(16),decode,signal());const owner=new SequenceTileIndex(probe.estimatedBytes*2,16),a=new ArrayBuffer(16),b=new ArrayBuffer(16),c=new ArrayBuffer(16);
 await owner.get(a,decode,signal());await owner.get(b,decode,signal());await owner.get(a,decode,signal());await owner.get(c,decode,signal());assert.equal(owner.stats.entries,2);assert(owner.stats.bytes<=probe.estimatedBytes*2);const before=owner.stats.builds;await owner.get(a,decode,signal());assert.equal(owner.stats.builds,before);await owner.get(b,decode,signal());assert.equal(owner.stats.builds,before+1);
});
test('entry count is bounded independently of bytes, including empty response tiles',async()=>{
 const owner=new SequenceTileIndex(100000,2),{decode}=decoder({});for(let i=0;i<5;i++)await owner.get(new ArrayBuffer(0),decode,signal());assert.equal(owner.stats.entries,2);assert.equal(owner.stats.bytes,512);
});
test('oversized indices expose every matching feature but are not retained',async()=>{
 const owner=new SequenceTileIndex(128,16),buffer=new ArrayBuffer(32),{state,decode}=decoder({sequence:Array.from({length:1000},()=> 'A')});const result=await owner.get(buffer,decode,signal());assert.equal(result.indices('sequence','A').length,1000);assert.equal(result.indices('sequence','A')[999],999);assert.equal(owner.stats.entries,0);assert.equal(owner.stats.bytes,0);await owner.get(buffer,decode,signal());assert.equal(state.decodes,2);
});
test('pre-aborted subscribers create no producer and retain no buffer',async()=>{
 const owner=new SequenceTileIndex(),controller=new AbortController();controller.abort();await assert.rejects(owner.get(new ArrayBuffer(1),()=>{throw Error('must not decode')},controller.signal),{name:'AbortError'});assert.deepEqual(owner.stats,{hits:0,builds:0,bytes:0,entries:0,active:0});
});
