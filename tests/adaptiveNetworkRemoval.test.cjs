const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/adaptiveNetworkRemoval.ts','utf8')))(m,m.exports);const {planAdaptiveNetworkRemoval}=m.exports;
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/adaptiveNetworkRemoval.baseline.json'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),start=source.indexOf('              const { targetedRemovalLimit, networkRemoveIds, removals } = planAdaptiveNetworkRemoval('),end=source.indexOf('\n              if (networkRemoveIds.size)',start),fullEnd=source.indexOf('\n            }\n\n            /*',end);assert(start>0&&fullEnd>end);
const params=['networkPruneCandidates','activeOpportunities','overrunRatio','projectedExtraMinutes','allowedExtraMinutes','planAdaptiveNetworkRemoval'];
const previous=new Function(...params,compile(baseline.body+'return {targetedRemovalLimit,networkRemoveIds};'));
const adapter=new Function(...params,compile(source.slice(start,end)+'return {targetedRemovalLimit,networkRemoveIds};'));
const candidate=(id,i=0)=>({opportunity:{id,baselinePosition:i,routePoints:[[i,0]]},networkPenaltyMinutes:i+1,penaltyPer100Meters:i+.5});
function compare(candidates,activeCount=10,ratio=2){
 const original=structuredClone(candidates),active=Array.from({length:activeCount},(_,i)=>({id:'active-'+i}));
 function execute(fn){const logs=[];const value=fn.call({log:(...args)=>logs.push(args)},candidates,active,ratio,30,10,planAdaptiveNetworkRemoval);return {value,logs};}
 const before=execute(previous),after=execute(adapter);assert.deepEqual(after,before);assert.deepEqual([...after.value.networkRemoveIds],[...before.value.networkRemoveIds]);assert.deepEqual(candidates,original);
 const plan=planAdaptiveNetworkRemoval(candidates,activeCount,ratio);for(const removal of plan.removals)assert(candidates.includes(removal));return plan;
}
for(const [ratio,limit] of [[0,1],[1.3999,1],[1.4,2],[1.9999,2],[2,4],[2.9999,4],[3,6],[10,6],[NaN,1],[Infinity,6],[-Infinity,1]])test('overrun boundary '+ratio,()=>{const plan=compare(Array.from({length:10},(_,i)=>candidate(String(i))),12,ratio);assert.equal(plan.targetedRemovalLimit,limit);assert.equal(plan.networkRemoveIds.size,limit);});
for(const count of [0,1,2,3,5])test('retains the existing minimum for active count '+count,()=>assert.equal(compare(Array.from({length:10},(_,i)=>candidate(String(i))),count,10).networkRemoveIds.size,Math.max(0,count-1)));
test('does not reorder candidates and preserves ID insertion order',()=>assert.deepEqual([...compare(['C','A','B','D','E'].map(candidate),10,2).networkRemoveIds],['C','A','B','D']));
test('empty candidate list produces no removal',()=>assert.equal(compare([]).networkRemoveIds.size,0));
test('duplicate IDs preserve cardinality limits and repeated removal diagnostics',()=>{const plan=compare(['A','A','B','C'].map(candidate),10,1.4);assert.deepEqual([...plan.networkRemoveIds],['A','B']);assert.deepEqual(plan.removals.map(x=>x.opportunity.id),['A','A','B']);});
test('frozen candidate records preserve identity',()=>{const row=Object.freeze(candidate('A')),rows=Object.freeze([row]);assert.equal(planAdaptiveNetworkRemoval(rows,2,1).removals[0],row);});
test('150 deterministic varied plans match prior limits, ID order and diagnostic order',()=>{
 let seed=741;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++)compare(Array.from({length:Math.floor(random()*20)},(_,i)=>candidate('id-'+Math.floor(random()*8),i)),Math.floor(random()*18),random()*5);
});
const applicationParams=[...params,'qualityCleanupMode','permanentlyRejectedOpportunityIds','captureStops','captureStopOwners','buildFinalRouteStops','buildCaptureStopOwners','events'];
const suffix='events.push(["fallthrough"]); } return {activeOpportunities,captureStops,captureStopOwners,permanentlyRejectedOpportunityIds};';
const oldApplication=new Function(...applicationParams,compile('for(let pass=0;pass<1;pass++){'+baseline.application+suffix));
const newApplication=new Function(...applicationParams,compile('for(let pass=0;pass<1;pass++){'+source.slice(start,fullEnd)+suffix));
function apply({quality=false,empty=false,candidates=['C','A','B'].map(candidate),ratio=1.4}={}){
 function execute(fn){
  const events=[],active=['C','A','B'].map((id,i)=>candidate(id,3-i).opportunity),rejected=new Set(['prior']);
  const build=rows=>{events.push(['stops',rows.map(x=>x.id)]);return empty?[]:rows.flatMap(x=>x.routePoints);};
  const owners=rows=>{events.push(['owners',rows.map(x=>x.id)]);return rows.map(x=>x.id);};
  const value=fn.call({log:(...args)=>events.push(['log',...args])},candidates,active,ratio,30,10,planAdaptiveNetworkRemoval,quality,rejected,[[99,0]],['initial'],build,owners,events);
  return {value,events};
 }
 const before=execute(oldApplication),after=execute(newApplication);assert.deepEqual(after,before);assert.deepEqual([...after.value.permanentlyRejectedOpportunityIds],[...before.value.permanentlyRejectedOpportunityIds]);return after;
}
test('widget preserves cleanup rejection, survivor order, anchor rebuild and retry path',()=>{const result=apply({quality:true});assert.deepEqual([...result.value.permanentlyRejectedOpportunityIds],['prior','C','A']);assert.deepEqual(result.value.activeOpportunities.map(x=>x.id),['B']);assert(!result.events.some(x=>x[0]==='fallthrough'));assert.deepEqual(result.events.slice(-3).map(x=>x[0]),['stops','owners','log']);});
test('ordinary pruning does not permanently reject owners',()=>assert.deepEqual([...apply().value.permanentlyRejectedOpportunityIds],['prior']));
test('empty rebuilt stops retain break and diagnostic behavior',()=>assert.deepEqual(apply({empty:true}).value.captureStops,[]));
test('no-removal path skips rebuilds and falls through unchanged',()=>{const result=apply({candidates:[]});assert.deepEqual(result.value.captureStops,[[99,0]]);assert.equal(result.events.at(-1)[0],'fallthrough');assert(!result.events.some(x=>x[0]==='stops'));});
