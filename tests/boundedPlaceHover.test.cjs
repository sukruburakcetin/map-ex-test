const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/places/BoundedPlaceHover.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);
const {BoundedPlaceHover}=m.exports,signal=()=>new AbortController().signal,turn=()=>new Promise(resolve=>setTimeout(resolve,5));
test('rapid pointer intents coalesce to the latest position',async()=>{
 const calls=[];const owner=new BoundedPlaceHover(async screen=>{calls.push(screen.x);return screen.x},0);
 const results=Array.from({length:40},(_,x)=>owner.lookup({x,y:0},signal()));await turn();
 assert.deepEqual(calls,[39]);assert.deepEqual(await Promise.all(results),[...Array(39).fill(null),39]);owner.clear();
});
test('one physical lookup survives an abort-ignoring transport and only the latest pending intent runs',async()=>{
 const calls=[];const owner=new BoundedPlaceHover((screen,abort)=>new Promise(resolve=>calls.push({screen,abort,resolve})),0);
 const first=owner.lookup({x:1,y:0},signal());await turn();
 const second=owner.lookup({x:2,y:0},signal());const third=owner.lookup({x:3,y:0},signal());await turn();
 assert.equal(calls.length,1);assert.equal(await second,null);assert(calls[0].abort.aborted);assert.deepEqual(owner.stats,{active:true,pending:true});
 calls[0].resolve('old');assert.equal(await first,null);await turn();assert.equal(calls.length,2);assert.equal(calls[1].screen.x,3);calls[1].resolve('new');assert.equal(await third,'new');await turn();assert.deepEqual(owner.stats,{active:false,pending:false});owner.clear();
});
test('aborted pending intent makes no request and clear suppresses active completion',async()=>{
 let release,calls=0;const owner=new BoundedPlaceHover(()=>{calls++;return new Promise(resolve=>release=resolve)},0);
 const controller=new AbortController(),pending=owner.lookup({x:0,y:0},controller.signal);controller.abort();assert.equal(await pending,null);await turn();assert.equal(calls,0);
 const active=owner.lookup({x:1,y:0},signal());await turn();owner.clear();release('stale');assert.equal(await active,null);owner.clear();
});
test('lookup errors stay local and a later hover can recover',async()=>{
 let calls=0;const owner=new BoundedPlaceHover(async()=>{if(++calls===1)throw Error('offline');return 'ok'},0);
 const a=owner.lookup({x:0,y:0},signal());await turn();assert.equal(await a,null);const b=owner.lookup({x:1,y:0},signal());await turn();assert.equal(await b,'ok');owner.clear();
});
