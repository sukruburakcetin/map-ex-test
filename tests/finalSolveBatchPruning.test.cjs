const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/finalSolveBatchPruning.ts','utf8')))(m,m.exports);
const {planFinalSolveBatchPruning}=m.exports;
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/finalSolveBatchPruning.baseline.json'));
const widget=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const start=widget.indexOf('        const pruning = planFinalSolveBatchPruning('),end=widget.indexOf('\n      }',start);
assert(start>0&&end>start);
const oldResult=`return {opportunities:activeOpportunities,activeEstimatedMinutes,correctionFactor,targetEstimatedMinutes,estimatedMinutesToRemove,removeIds,removedEstimatedMinutes};`;
const newResult=`return {opportunities:activeOpportunities,activeEstimatedMinutes:pruning.activeEstimatedMinutes,correctionFactor:pruning.correctionFactor,targetEstimatedMinutes:pruning.targetEstimatedMinutes,estimatedMinutesToRemove:pruning.estimatedMinutesToRemove,removeIds:pruning.removeIds,removedEstimatedMinutes:pruning.removedEstimatedMinutes};`;
const params=['activeOpportunities','actualExtraMinutes','spareMinutes','budgetTolerance','planFinalSolveBatchPruning'];
const previous=new Function(...params,compile(baseline.body+'\n'+oldResult));
const adapter=new Function(...params,compile(widget.slice(start,end)+'\n'+newResult));
const opportunity=(id,minutes=1,value=100,position=0)=>({id,estimatedDetourMinutes:minutes,valueMeters:value,baselinePosition:position,routePoints:[[position,0]],segments:[]});
function compare(opportunities,{actual=20,budget=5,tolerance=.25}={}){
 const original=structuredClone(opportunities),oldLogs=[],newLogs=[];
 const before=previous.call({log:(...args)=>oldLogs.push(args)},opportunities,actual,budget,tolerance,planFinalSolveBatchPruning);
 const after=adapter.call({log:(...args)=>newLogs.push(args)},opportunities,actual,budget,tolerance,planFinalSolveBatchPruning);
 assert.deepEqual(after,before);assert.deepEqual(newLogs,oldLogs);assert.deepEqual(opportunities,original);
 const plan=planFinalSolveBatchPruning({opportunities,actualExtraMinutes:actual,spareMinutes:budget,budgetTolerance:tolerance});
 for(const survivor of plan.opportunities)assert(opportunities.includes(survivor));
 for(const removal of plan.removals)assert(opportunities.includes(removal));
 return {after,plan,logs:newLogs};
}
test('ordinary overrun preserves removal plan, diagnostics and A-to-B survivor ordering',()=>{
 const rows=[opportunity('C',2,100,30),opportunity('A',3,600,10),opportunity('B',1,100,20),opportunity('D',4,400,40)];
 const {plan}=compare(rows);assert.deepEqual(plan.removals.map(x=>x.id),['C','B','D']);assert.deepEqual(plan.opportunities.map(x=>x.id),['A']);
});
for(const actual of [-10,0,.25,1,2,6,6.001,50])test('calibration clamp boundary '+actual,()=>{
 const {plan}=compare([opportunity('A',.5),opportunity('B',.5)],{actual,budget:.2});
 assert.equal(plan.correctionFactor,Math.min(6,Math.max(1,actual)));
});
test('stable efficiency ties preserve original removal order',()=>{
 const {plan}=compare([opportunity('B',1,100,2),opportunity('A',2,200,1),opportunity('C',3,300,3)],{actual:30,budget:0});
 assert.deepEqual(plan.removals.map(x=>x.id),['B','A']);assert.equal(plan.opportunities[0].id,'C');
});
test('remaining opportunities sort by baseline position, preserving tied order',()=>{
 const {plan}=compare([opportunity('remove',1,0,4),opportunity('C',1,200,3),opportunity('B',1,300,2),opportunity('A',1,400,2)],{actual:4,budget:100});
 assert.deepEqual(plan.opportunities.map(x=>x.id),['B','A','C']);assert.equal(plan.estimatedMinutesToRemove,.25);
});
for(const rows of [[],[opportunity('only',5)],[opportunity('A',0),opportunity('B',0)],[opportunity('A',-3),opportunity('B',-.5),opportunity('C',0)]])test('empty, singleton and nonpositive costs: '+rows.map(x=>x.estimatedDetourMinutes),()=>{
 const {plan}=compare(rows,{actual:60,budget:-1});assert(plan.opportunities.length>=Math.min(1,rows.length));
});
test('duplicate IDs retain the previous ID-set semantics',()=>compare([opportunity('same'),opportunity('same'),opportunity('other')],{budget:0}));
test('nonfinite inputs retain previous arithmetic and diagnostic behavior',()=>{
 for(const v of [NaN,Infinity,-Infinity])compare([opportunity('A',v,10),opportunity('B',2,5),opportunity('C',1,20)],{actual:v,budget:0});
});
test('deterministic varied batches match previous calculation and log order',()=>{
 let seed=1741;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++){
  const rows=Array.from({length:2+Math.floor(random()*20)},(_,i)=>opportunity(String(i),random()*15-.2,Math.round(random()*500),Math.floor(random()*6)));
  compare(rows,{actual:random()*120,budget:random()*40,tolerance:random()*.5});
 }
});
test('frozen inputs stay untouched and retained objects preserve identity',()=>{
 const rows=Object.freeze([Object.freeze(opportunity('A',1,10,3)),Object.freeze(opportunity('B',2,100,1)),Object.freeze(opportunity('C',3,200,2))]);
 const plan=planFinalSolveBatchPruning({opportunities:rows,actualExtraMinutes:12,spareMinutes:5,budgetTolerance:.25});
 assert(plan.opportunities.every(x=>rows.includes(x)));assert(plan.removals.every(x=>rows.includes(x)));
});
