const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/replacementPairRanking.ts','utf8')))(m,m.exports);
const {rankCaptureReplacementPairs}=m.exports;
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/replacementPairRanking.baseline.json'));
const old=new Function('activeOpportunities','replacementCandidatePool','permanentlyRejectedOpportunityIds',compile(fixture.body+'return probePairs;'));
const source=require('./helpers/captureExecutionSource.cjs').captureExecutionSource(),start=source.indexOf('                const probePairs = rankCaptureReplacementPairs('),end=source.indexOf('\n                let bestReplacement:',start);assert(start>0&&end>start);
const adapter=new Function('activeOpportunities','replacementCandidatePool','permanentlyRejectedOpportunityIds','rankCaptureReplacementPairs',compile(source.slice(start,end)+'return probePairs;'));
const opportunity=(id,value=100,position=0,anchors=1)=>({id,valueMeters:value,baselinePosition:position,routePoints:Array.from({length:anchors},(_,i)=>[i,0])});
function compare(active=[],pool=[],rejected=new Set(),max=10){
 const original=structuredClone({active,pool,rejected}),host={CAPTURE_ROUTE_CONFIG:{maxFinalStops:max}};
 const before=old.call(host,active,pool,rejected),after=adapter.call(host,active,pool,rejected,rankCaptureReplacementPairs);
 assert.deepEqual(after,before);assert.deepEqual({active,pool,rejected},original);
 for(const pair of after){assert(active.includes(pair.remove));assert(pool.includes(pair.add));}
 return after;
}
test('ordinary ranking preserves gain-first and baseline-gap tie ordering',()=>{
 const result=compare([opportunity('old',20,0)],[opportunity('far',100,10),opportunity('close',100,1),opportunity('best',120,100)]);
 assert.deepEqual(result.map(x=>x.add.id),['best','close','far']);
});
test('active and permanently rejected IDs are excluded, with nonpositive additions',()=>{
 const result=compare([opportunity('active')],[opportunity('active',500),opportunity('reject',400),opportunity('zero',0),opportunity('negative',-1),opportunity('valid',200)],new Set(['reject']));assert.deepEqual(result.map(x=>x.add.id),['valid']);
});
for(const gain of [24.999,25,25.001])test('meaningful-gain boundary '+gain,()=>assert.equal(compare([opportunity('A',100)],[opportunity('B',100+gain)]).length,gain>25?1:0));
for(const cap of [2,3,4])test('replacement anchor-cap boundary '+cap,()=>assert.equal(compare([opportunity('A',100,0,2),opportunity('C',200,0,1)],[opportunity('B',150,0,2)],new Set(),cap).length,cap>=3?1:0));
test('addition candidate cap is applied before pair eligibility',()=>{
 const pool=Array.from({length:5},(_,i)=>opportunity('too-many-'+i,200-i,0,8)).concat(opportunity('sixth-valid',150));
 assert.deepEqual(compare([opportunity('old',10)],pool,new Set(),2),[]);
});
test('removal candidate cap is applied before anchor eligibility',()=>{
 const active=Array.from({length:5},(_,i)=>opportunity('small-'+i,10+i)).concat(opportunity('sixth-large',100,0,10));
 assert.deepEqual(compare(active,[opportunity('new',200,0,2)],new Set(),7),[]);
});
test('stable full ties preserve pool order and then active order',()=>{
 const result=compare([opportunity('old-b',10),opportunity('old-a',10)],[opportunity('new-b',100),opportunity('new-a',100)]);
 assert.deepEqual(result.map(x=>[x.add.id,x.remove.id]),[['new-b','old-b'],['new-b','old-a'],['new-a','old-b'],['new-a','old-a']]);
});
test('only five pairs are returned and sources remain in original order',()=>{
 const result=compare(Array.from({length:8},(_,i)=>opportunity('old-'+i,i)),Array.from({length:8},(_,i)=>opportunity('new-'+i,100+i)));
 assert.equal(result.length,5);assert.equal(result[0].add.id,'new-7');assert.equal(result[0].remove.id,'old-0');
});
test('empty active, empty pool and duplicate-ID behavior remain unchanged',()=>{
 assert.deepEqual(compare([],[]),[]);assert.deepEqual(compare([opportunity('A')],[]),[]);
 const pair=opportunity('duplicate',200);assert.equal(compare([opportunity('A',10)],[pair,pair]).length,2);
});
test('zero-anchor opportunities and nonfinite scores retain prior arithmetic',()=>{
 compare([opportunity('old',0,NaN,0)],[opportunity('new',100,Infinity,0)],new Set(),0);
 for(const v of [NaN,Infinity,-Infinity])compare([opportunity('old',v,v)],[opportunity('new',200,v)],new Set(),v);
});
test('frozen opportunities and arrays retain object identity',()=>{
 const active=Object.freeze([Object.freeze(opportunity('old',1))]),pool=Object.freeze([Object.freeze(opportunity('new',100))]);
 const result=rankCaptureReplacementPairs({activeOpportunities:active,replacementCandidatePool:pool,permanentlyRejectedOpportunityIds:new Set(),maxFinalStops:10});assert.equal(result[0].add,pool[0]);assert.equal(result[0].remove,active[0]);
});
test('150 deterministic varied pools match original ranking without mutation',()=>{
 let seed=704;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++){
  const make=(prefix)=>Array.from({length:Math.floor(random()*15)},(_,i)=>opportunity(prefix+i,Math.floor(random()*500)-5,Math.floor(random()*10),Math.floor(random()*5)));
  const active=make('a'),pool=make('p');if(active.length&&random()>.5)pool.push(active[0]);compare(active,pool,new Set(pool.filter(()=>random()<.2).map(x=>x.id)),Math.floor(random()*25));
 }
});
const guardStart=source.lastIndexOf('if (osrmReplacementPassesUsed < maxOsrmReplacementPasses)',start);
const guarded=new Function('activeOpportunities','replacementCandidatePool','permanentlyRejectedOpportunityIds','osrmReplacementPassesUsed','maxOsrmReplacementPasses','spareMinutes','preflightTolerance','rankCaptureReplacementPairs',compile(source.slice(guardStart,end)+'return probePairs;\n}\nreturn null;'));
test('actual widget pass limit skips local ranking when no replacement pass remains',()=>{
 let calls=0;const rank=()=>{calls++;return [];};const host={CAPTURE_ROUTE_CONFIG:{maxFinalStops:10}};
 for(const used of [1,2])assert.equal(guarded.call(host,[],[],new Set(),used,1,10,.25,rank),null);
 assert.equal(calls,0);assert.deepEqual(guarded.call(host,[],[],new Set(),0,1,10,.25,rank),[]);assert.equal(calls,1);
});
