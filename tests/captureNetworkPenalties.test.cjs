const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureNetworkPenalties.ts','utf8')))(m,m.exports);
const {scoreCaptureNetworkPenalties}=m.exports;
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureNetworkPenalties.baseline.json'));
const parameters=['preflightLegs','activeOpportunities','spareMinutes','qualityCleanupMode','pathologicalOwnerIds'];
const old=new Function(...parameters,compile(fixture.body+'return {badLegThresholdMinutes,networkPenaltyByOpportunity,networkPruneCandidates};'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),start=source.indexOf('            const { networkPruneCandidates } = scoreCaptureNetworkPenalties('),end=source.indexOf('\n            /*\n             * Do not batch-delete',start);assert(start>0&&end>start);
const adapter=new Function(...parameters,'scoreCaptureNetworkPenalties',compile(source.slice(start,end)+'return networkPruneCandidates;'));
const opportunity=(id,valueMeters=100)=>({id,valueMeters});
const leg=(fromOwner,toOwner,durationMinutes)=>({fromOwner,toOwner,durationMinutes});
function compare(legs=[],active=[opportunity('A'),opportunity('B')],budget=25,cleanup=false,pathological=new Set()){
 const original=structuredClone({legs,active,pathological});
 const previous=old(legs,active,budget,cleanup,pathological);
 const result=scoreCaptureNetworkPenalties({preflightLegs:legs,activeOpportunities:active,spareMinutes:budget,qualityCleanupMode:cleanup,pathologicalOwnerIds:pathological});
 assert.deepEqual(result,previous);assert.deepEqual([...result.networkPenaltyByOpportunity],[...previous.networkPenaltyByOpportunity]);
 assert.deepEqual(adapter(legs,active,budget,cleanup,pathological,scoreCaptureNetworkPenalties),previous.networkPruneCandidates);
 assert.deepEqual({legs,active,pathological},original);
 for(const candidate of result.networkPruneCandidates)assert(active.includes(candidate.opportunity));
 return result;
}
test('same-owner excess receives the full penalty',()=>assert.equal(compare([leg('A','A',5)]).networkPenaltyByOpportunity.get('A'),3));
test('cross-opportunity excess is split equally and repeated costs accumulate',()=>{
 const result=compare([leg('A','B',6),leg('A','A',3),leg('B','A',4)]);assert.deepEqual([...result.networkPenaltyByOpportunity],[['A',4],['B',3]]);
});
test('endpoint and unknown transitions assign the full excess to the opportunity',()=>{
 for(const endpoint of ['START','END','UNKNOWN'])for(const row of [leg(endpoint,'A',5),leg('A',endpoint,5)])assert.equal(compare([row]).networkPenaltyByOpportunity.get('A'),3);
});
test('sentinel-only legs do not create penalty entries',()=>{
 const values=['START','END','UNKNOWN'];for(const a of values)for(const b of values)assert.equal(compare([leg(a,b,5)]).networkPenaltyByOpportunity.size,0);
});
test('empty owner keeps the previous split-before-skip behavior',()=>assert.deepEqual([...compare([leg('','A',6)]).networkPenaltyByOpportunity],[['A',2]]));
for(const [budget,expected] of [[-1,2],[0,2],[24.999,2],[25,2],[30,2.4],[50,4],[51,4]])test('adaptive threshold boundary '+budget,()=>assert.equal(compare([],undefined,budget).badLegThresholdMinutes,expected));
test('excess equal to threshold is ignored and positive excess is retained',()=>{
 assert.equal(compare([leg('A','A',2)]).networkPruneCandidates.length,0);assert.equal(compare([leg('A','A',2.001)]).networkPruneCandidates.length,1);
});
test('quality cleanup excludes START/END access but retains UNKNOWN transitions',()=>{
 const result=compare([leg('START','A',8),leg('A','END',8),leg('UNKNOWN','A',5)],undefined,25,true,new Set(['A']));assert.equal(result.networkPenaltyByOpportunity.get('A'),3);assert.equal(result.networkPruneCandidates.length,1);
});
test('cleanup keeps only pathological owners as candidates, without discarding other penalty totals',()=>{
 const result=compare([leg('A','B',6)],undefined,25,true,new Set(['B']));assert.deepEqual([...result.networkPenaltyByOpportunity],[['A',2],['B',2]]);assert.deepEqual(result.networkPruneCandidates.map(x=>x.opportunity.id),['B']);
});
test('ranking uses penalty per value with a 100m floor, then total penalty',()=>{
 const result=compare([leg('A','A',4),leg('B','B',6),leg('C','C',5)],[opportunity('A',10),opportunity('B',200),opportunity('C',100)]);assert.deepEqual(result.networkPruneCandidates.map(x=>x.opportunity.id),['C','B','A']);
});
test('full ties retain active order and all candidates remain available',()=>{
 const active=Array.from({length:12},(_,i)=>opportunity('id-'+i)),legs=active.map(x=>leg(x.id,x.id,3));const result=compare(legs,active);assert.deepEqual(result.networkPruneCandidates.map(x=>x.opportunity.id),active.map(x=>x.id));
});
test('unknown active IDs, duplicate IDs and empty arrays retain prior behavior',()=>{
 compare([leg('absent','absent',5)],[opportunity('A')]);assert.equal(compare([leg('A','A',4)],[opportunity('A'),opportunity('A')]).networkPruneCandidates.length,2);compare([],[]);
});
test('nonfinite budgets, leg costs and values retain previous arithmetic/filter ordering',()=>{
 for(const v of [NaN,Infinity,-Infinity]){compare([leg('A','B',v)],undefined,v);compare([leg('A','A',5)],[opportunity('A',v)]);}
});
test('frozen arrays and records are not mutated',()=>{
 const legs=Object.freeze([Object.freeze(leg('A','A',5))]),active=Object.freeze([Object.freeze(opportunity('A'))]);const result=scoreCaptureNetworkPenalties({preflightLegs:legs,activeOpportunities:active,spareMinutes:25,qualityCleanupMode:false,pathologicalOwnerIds:new Set()});assert.equal(result.networkPruneCandidates[0].opportunity,active[0]);
});
test('150 deterministic varied batches match maps, insertion order, candidate ranking and adapter',()=>{
 let seed=4201;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++){
  const active=Array.from({length:Math.floor(random()*15)},(_,i)=>opportunity('id-'+i,Math.floor(random()*1000)-20));const owners=['START','END','UNKNOWN','',...active.map(x=>x.id)];
  const legs=Array.from({length:Math.floor(random()*35)},()=>leg(owners[Math.floor(random()*owners.length)],owners[Math.floor(random()*owners.length)],random()*12));compare(legs,active,random()*80-5,random()<.5,new Set(active.filter(()=>random()<.5).map(x=>x.id)));
 }
});
const guardStart=source.lastIndexOf('if (activeOpportunities.length <= 1)',start);
const guarded=new Function(...parameters,'scoreCaptureNetworkPenalties',compile('do {\n'+source.slice(guardStart,end)+'return networkPruneCandidates;\n} while(false);return null;'));
test('actual widget singleton guard prevents penalty aggregation',()=>{
 let calls=0;const score=()=>{calls++;return {networkPruneCandidates:[]};};for(const active of [[],[opportunity('A')]])assert.equal(guarded([],active,25,false,new Set(),score),null);assert.equal(calls,0);assert.deepEqual(guarded([],[opportunity('A'),opportunity('B')],25,false,new Set(),score),[]);assert.equal(calls,1);
});
