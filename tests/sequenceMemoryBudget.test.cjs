const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function loader(overrides={}){
 const modules=new Map();
 return function load(relative){
  if(relative in overrides)return overrides[relative];if(modules.has(relative))return modules.get(relative);
  const module={exports:{}};modules.set(relative,module.exports);
  const source=fs.readFileSync(path.join(__dirname,'../src',relative+'.ts'),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
  new Function('require','module','exports',compiled)(name=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),name))),module,module.exports);
  modules.set(relative,module.exports);return module.exports;
 };
}
const load=loader();
const {SequenceMemoryCache,SEQUENCE_MEMORY_LIMITS,sequenceIndexWeight,retainSequenceRoute,readMemorySequenceRoute,validatedSequenceRoute,sequenceRouteMemoryStats}=load('features/imagery/sequenceMemoryBudget');
const {SequenceDemandData}=load('features/imagery/SequenceDemandData');
const point=(id='image')=>({id,lon:29,lat:41,heightDataVersion:2});
const route=(count=1,id='image')=>Array.from({length:count},()=>point(id));
const limits=(maxEntries=6,maxItems=100000,maxEstimatedBytes=16*1024*1024)=>({maxEntries,maxItems,maxEstimatedBytes});
const signal=()=>new AbortController().signal;
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('bounded cache evicts by retained items and touches hits as real LRU',()=>{
 const evicted=[],cache=new SequenceMemoryCache(limits(6,5,10000),value=>({items:value.length,estimatedBytes:value.length*10}),key=>evicted.push(key));
 cache.set('A',[1,2]);cache.set('B',[3,4]);assert.deepEqual(cache.get('A'),[1,2]);cache.set('C',[5,6]);
 assert.deepEqual(evicted,['B']);assert.equal(cache.get('B'),undefined);assert.equal(cache.stats.items,4);assert.equal(cache.stats.entries,2);
});
test('retention accounts for string data size and rejects an oversized value without truncation',()=>{
 const cache=new SequenceMemoryCache(limits(6,100,1200),sequenceIndexWeight);
 const small=['a','b'],large=['x'.repeat(1000)];assert.equal(cache.set('A',small),true);assert.equal(cache.set('B',large),false);
 assert.equal(cache.get('A'),small);assert.equal(cache.get('B'),undefined);assert.equal(large[0].length,1000);assert(cache.stats.estimatedBytes<=1200);
});
test('entry count is an additional bound and invalid budget arithmetic fails closed',()=>{
 const cache=new SequenceMemoryCache(limits(1,10,10000),value=>({items:1,estimatedBytes:1}));cache.set('A',{});cache.set('B',{});assert.equal(cache.stats.entries,1);assert.equal(cache.get('A'),undefined);
 assert.throws(()=>new SequenceMemoryCache(limits(1,NaN),()=>({items:1,estimatedBytes:1})),RangeError);
 const invalid=new SequenceMemoryCache(limits(),()=>({items:1,estimatedBytes:NaN}));assert.throws(()=>invalid.set('bad',{}),RangeError);assert.equal(invalid.stats.entries,0);
});
test('full route RAM cache retains six recent snapshots with actual LRU reads',()=>{
 const cache={};for(let i=0;i<6;i++)assert.equal(retainSequenceRoute(cache,String(i),route(2,String(i))),true);
 const first=cache['0'];assert.equal(readMemorySequenceRoute(cache,'0'),first);retainSequenceRoute(cache,'6',route(2,'6'));
 assert.equal(cache['1'],undefined);assert.equal(cache['0'],first);assert.equal(sequenceRouteMemoryStats(cache).entries,6);assert.equal(sequenceRouteMemoryStats(cache).items,12);
});
test('full route retention limits total point count independently of sequence count',()=>{
 const cache={},a=Array(50000).fill(point('')),b=Array(50000).fill(point(''));
 retainSequenceRoute(cache,'A',a);retainSequenceRoute(cache,'B',b);assert.equal(sequenceRouteMemoryStats(cache).items,100000);
 retainSequenceRoute(cache,'C',route(1,''));assert.equal(cache.A,undefined);assert.equal(cache.B,b);assert.equal(sequenceRouteMemoryStats(cache).items,50001);
});
test('large IDs can exceed the byte budget even with few points',()=>{
 const cache={},large=Array(1000).fill(point('x'.repeat(9000)));
 assert.equal(validatedSequenceRoute(large),large);assert.equal(retainSequenceRoute(cache,'large',large),false);assert.equal(cache.large,undefined);
 assert.deepEqual(sequenceRouteMemoryStats(cache),{entries:0,items:0,estimatedBytes:0});assert.equal(large.length,1000);
});
test('an oversized external route is returned intact once and removed from retained RAM',()=>{
 const large=Array(100001).fill(point('')),cache={large};assert.equal(readMemorySequenceRoute(cache,'large'),large);assert.equal(cache.large,undefined);
 assert.equal(readMemorySequenceRoute(cache,'large'),null);assert.equal(sequenceRouteMemoryStats(cache).entries,0);assert.equal(large.length,100001);
});
test('validated immutable warm route hits do not rescan any coordinate or length',()=>{
 let armed=false;const snapshot=new Proxy(route(4096),{get(target,key,receiver){if(armed&&(key===Symbol.iterator||key==='length'||/^\d+$/.test(String(key))))throw Error('warm snapshot traversed');return Reflect.get(target,key,receiver)}});
 const cache={};retainSequenceRoute(cache,'A',snapshot);armed=true;assert.equal(readMemorySequenceRoute(cache,'A'),snapshot);assert.equal(validatedSequenceRoute(snapshot),snapshot);assert.equal(sequenceRouteMemoryStats(cache).items,4096);
});
test('diagnostic snapshots never bootstrap, inspect or mutate untracked RAM records',()=>{
 const cache=new Proxy({}, {ownKeys(){throw Error('diagnostic scanned records')},get(){throw Error('diagnostic read route')}});
 assert.deepEqual(sequenceRouteMemoryStats(cache),{entries:0,items:0,estimatedBytes:0});
});
test('invalid external replacement releases an old retained reference and rejects the bad record',()=>{
 const cache={},old=route(3);retainSequenceRoute(cache,'A',old);cache.A=[{...point(),heightDataVersion:1}];assert.equal(readMemorySequenceRoute(cache,'A'),null);assert.equal(cache.A,undefined);assert.equal(sequenceRouteMemoryStats(cache).items,0);
 const replacement=route(4);retainSequenceRoute(cache,'A',old);cache.A=replacement;assert.equal(readMemorySequenceRoute(cache,'A'),replacement);assert.equal(sequenceRouteMemoryStats(cache).items,4);assert.equal(cache.A,replacement);
});

function storageModules(t,persisted,legacy){
 const calls={reads:0,queued:[],removed:[]},original=global.localStorage;
 global.localStorage={getItem:()=>legacy,removeItem:key=>calls.removed.push(key)};
 t.after(()=>{if(original===undefined)delete global.localStorage;else global.localStorage=original});
 const localLoad=loader({'features/imagery/sequenceCacheStore':{sequenceCacheStore:{read:async()=>{calls.reads++;return persisted},queue:(...args)=>calls.queued.push(args)}}});
 return{...localLoad('features/imagery/sequenceCoordinates'),calls,localLoad};
}
test('persisted routes are validated independently of admission; oversized routes remain usable',async t=>{
 const large=Array(100001).fill(point('')),{readCachedSequenceCoordinates,calls}=storageModules(t,large,null),cache={};
 const found=await readCachedSequenceCoordinates(cache,'A');assert.equal(found,large);assert.equal(cache.A,undefined);assert.equal(calls.reads,1);
 assert.equal(await readCachedSequenceCoordinates(cache,'A'),large);assert.equal(calls.reads,2);assert.equal(cache.A,undefined);
});
test('invalid RAM and persisted rows cannot bypass validation or become successful route entries',async t=>{
 const bad=[{...point(),lon:NaN}],{readCachedSequenceCoordinates}=storageModules(t,bad,null),cache={A:bad};
 assert.equal(await readCachedSequenceCoordinates(cache,'A'),null);assert.equal(cache.A,undefined);
});
test('legacy storage migration validates data before queuing and rejects old height metadata',async t=>{
 const stored=route(3),{readCachedSequenceCoordinates,calls}=storageModules(t,undefined,JSON.stringify(stored)),cache={};
 const found=await readCachedSequenceCoordinates(cache,'A');assert.deepEqual(found,stored);assert.equal(cache.A,found);assert.equal(calls.queued.length,1);
});
test('invalid legacy storage is removed and never queued',async t=>{
 const {readCachedSequenceCoordinates,calls}=storageModules(t,undefined,JSON.stringify([{...point(),heightDataVersion:1}]));
 assert.equal(await readCachedSequenceCoordinates({},'A'),null);assert.equal(calls.queued.length,0);assert.equal(calls.removed.length,1);
});
test('cancellation during persisted reads prevents RAM admission and local fallback',async t=>{
 const controller=new AbortController(),cache={};storageModules(t,undefined,JSON.stringify(route(1)));
 // A fresh loader replaces the storage boundary while retaining actual route logic.
 const actual=loader({'features/imagery/sequenceCacheStore':{sequenceCacheStore:{read:async()=>{controller.abort();return route(1)},queue:()=>{throw Error('cancelled storage queued')}}}})('features/imagery/sequenceCoordinates');
 await assert.rejects(actual.readCachedSequenceCoordinates(cache,'A',controller.signal),{name:'AbortError'});assert.equal(cache.A,undefined);
});
test('full route fetching preserves API order despite differently ordered batch responses',async t=>{
 const {fetchSequenceCoordinates,calls}=storageModules(t,undefined,null),ids=Array.from({length:55},(_,i)=>String(i)),cache={};let active=0,maxActive=0;
 const coordinates=await fetchSequenceCoordinates({cache,getIds:async()=>ids,getSelectedImageId:()=> '54',getKnown:()=>undefined,isStorageDisabled:()=>false,disableStorage:()=>{},fetchJson:async url=>{active++;maxActive=Math.max(maxActive,active);await flush();const wanted=new URL(url).searchParams.get('ids').split(',');active--;return Object.fromEntries(wanted.reverse().map(id=>[id,{geometry:{coordinates:[29+Number(id)/10000,41]},computed_altitude:100}]))}},'A','token',signal());
 assert.deepEqual(coordinates.map(p=>p.id),ids);assert.equal(coordinates.length,55);assert.equal(cache.A,coordinates);assert.equal(calls.queued.length,1);assert.equal(maxActive,2);
});


test('full route fetching returns every available coordinate even when the complete result exceeds retention',async t=>{
 const {fetchSequenceCoordinates,calls}=storageModules(t,undefined,null),ids=Array.from({length:100001},(_,i)=>String(i)),cache={};
 const coordinates=await fetchSequenceCoordinates({cache,getIds:async()=>ids,getSelectedImageId:()=> '100000',isStorageDisabled:()=>false,disableStorage:()=>{},fetchJson:async url=>Object.fromEntries(new URL(url).searchParams.get('ids').split(',').map(id=>[id,{geometry:{coordinates:[29+Number(id)/1000000,41]}}]))},'huge','token',signal());
 assert.equal(coordinates.length,100001);assert.equal(coordinates[0].id,'0');assert.equal(coordinates[100000].id,'100000');assert.equal(cache.huge,undefined);assert.equal(calls.queued[0][1],coordinates);
});

const indexFetch=(counts,values)=>async url=>{const id=new URL(url).searchParams.get('sequence_id');counts.push(id);return{data:values[id].map(id=>({id}))}};
test('sequence ID indices obey aggregate count budgets and LRU without truncating order',async()=>{
 const counts=[],values={A:['a1','a2'],B:['b1','b2'],C:['c1','c2']},owner=new SequenceDemandData(indexFetch(counts,values),limits(6,4,10000));
 assert.deepEqual(await owner.ids('A',signal()),values.A);await owner.ids('B',signal());await owner.ids('A',signal());await owner.ids('C',signal());assert.equal(owner.memoryStats.items,4);
 await owner.ids('A',signal());assert.deepEqual(counts,['A','B','C']);await owner.ids('B',signal());assert.deepEqual(counts,['A','B','C','B']);assert(owner.memoryStats.items<=4);
});
test('oversized ID index remains complete for its caller but is not retained',async()=>{
 const counts=[],values={A:['first','middle','last']},owner=new SequenceDemandData(indexFetch(counts,values),limits(6,2,10000));
 assert.deepEqual(await owner.ids('A',signal()),values.A);assert.equal(owner.memoryStats.entries,0);assert.deepEqual(await owner.ids('A',signal()),values.A);assert.deepEqual(counts,['A','A']);
});
test('ID string size participates in retention budget independently of index item count',async()=>{
 const counts=[],values={A:['x'.repeat(1000)]},owner=new SequenceDemandData(indexFetch(counts,values),limits(6,100,1024));
 assert.equal((await owner.ids('A',signal()))[0].length,1000);assert.equal(owner.memoryStats.entries,0);assert.equal(owner.memoryStats.estimatedBytes,0);
});
test('sequence index subscribers cancel independently and clear invalidates pending enumeration',async()=>{
 let resume,producer;const counts=[],owner=new SequenceDemandData((url,requestSignal)=>{counts.push(url);producer=requestSignal;return new Promise(resolve=>resume=resolve)}),a=new AbortController(),b=new AbortController();
 const first=owner.ids('A',a.signal),second=owner.ids('A',b.signal);a.abort();await assert.rejects(first,{name:'AbortError'});assert.equal(producer.aborted,false);resume({data:[{id:'one'},{id:'two'}]});assert.deepEqual(await second,['one','two']);assert.equal(counts.length,1);
 let unblock;const stale=new SequenceDemandData(()=>new Promise(resolve=>unblock=resolve));const pending=stale.ids('B',signal());stale.clear();unblock({data:[{id:'late'}]});await assert.rejects(pending,{name:'AbortError'});assert.equal(stale.memoryStats.entries,0);
});
