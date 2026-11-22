const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/budgetProbeComparison.ts','utf8')))(m,m.exports);const helpers=m.exports;
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/budgetProbeComparison.baseline.json'));
const source=require('./helpers/captureExecutionSource.cjs').captureExecutionSource();
const names={network:['bestProbe','chooseNetworkBudgetProbe'],progress:['bestProgressProbe','chooseProgressBudgetProbe'],fitting:['bestFittingProbe','chooseFittingBudgetProbe']},versions={};
for(const [kind,[variable,helper]] of Object.entries(names)){
 const start=source.indexOf(variable+' = '+helper+'('),end=source.indexOf(');',start)+2;assert(start>0);
 const params=[variable,'trialExtraMinutes','projectedExtraMinutes','probeCandidate','candidate',helper];
 versions[kind]={old:new Function(...params,compile(fixture.blocks[kind]+'return '+variable+';')),adapter:new Function(...params,compile(source.slice(start,end)+'return '+variable+';'))};
}
function compare(kind,current=null,extra=5,value=100,projected=20){
 const beforeCurrent=structuredClone(current),item={opportunity:{id:'trial',valueMeters:value}};const [_,helper]=names[kind],params=[current,extra,projected,item,item,helpers[helper]];
 const old=versions[kind].old(...params),result=versions[kind].adapter(...params);assert.deepEqual(result,old);assert.deepEqual(current,beforeCurrent);assert.equal(result===current,old===current);return result;
}
const fitting=(kind,cost=10,extra=10)=>kind==='network'?{opportunityId:'old',extraMinutes:extra,valueLostMeters:100,reliefMinutes:10,valueLossPerReliefMinute:cost}:{opportunityId:'old',extraMinutes:extra,valueLost:100,reliefMinutes:10,costPerReliefMinute:cost};
for(const kind of ['network','fitting']){
 test(kind+' first candidate retains existing winner shape',()=>assert.equal(compare(kind).opportunityId,'trial'));
 for(const [cost,extra,wins] of [[9.4999,9,true],[9.5,9,false],[9.5,11,true],[10.5,11,true],[10.5001,11,false],[10,10,false],[10,11,true]])test(kind+' cost/extra boundary '+cost+'/'+extra,()=>{
  const result=compare(kind,fitting(kind),extra,cost*(30-extra),30);assert.equal(result.opportunityId,wins?'trial':'old');
 });
 test(kind+' relief floor and nonpositive relief preserve prior costs',()=>{
  for(const extra of [19.7499,19.75,19.7501,20,21]){const result=compare(kind,null,extra,1,20);assert.equal(result[kind==='network'?'valueLossPerReliefMinute':'costPerReliefMinute'],1/Math.max(.25,20-extra));}
 });
}
for(const [extra,wins] of [[19.8999,true],[19.9,false],[19.9001,false],[20,false]])test('progress strict 0.1-minute boundary '+extra,()=>assert.equal(compare('progress',null,extra)?.opportunityId==='trial',wins));
test('progress replaces only a strictly lower extra time, retaining first ties',()=>{
 const current={opportunityId:'old',extraMinutes:10,valueLost:100};assert.equal(compare('progress',current,9).opportunityId,'trial');assert.equal(compare('progress',current,10),current);assert.equal(compare('progress',current,11),current);
});
test('nonfinite comparisons preserve null/current and arithmetic behavior',()=>{
 for(const kind of Object.keys(names))for(const v of [NaN,Infinity,-Infinity]){compare(kind,null,v,v,v);compare(kind,kind==='progress'?{opportunityId:'old',extraMinutes:10,valueLost:100}:fitting(kind),v,v,v);}
});
test('frozen current winner is returned intact when no candidate wins',()=>{
 for(const kind of ['network','fitting']){const current=Object.freeze(fitting(kind));assert.equal(compare(kind,current,10,100,20),current);}
});
test('150 deterministic sequences match all three previous comparisons',()=>{
 let seed=617;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++){let network=null,progress=null,fitting=null;for(let i=0;i<8;i++){const extra=random()*30,value=random()*500-20,projected=20;network=compare('network',network,extra,value,projected);progress=compare('progress',progress,extra,value,projected);fitting=compare('fitting',fitting,extra,value,projected);}}
});
const start=source.lastIndexOf('if (trialHasBrokenOpportunity)',source.indexOf('bestProgressProbe = chooseProgressBudgetProbe('));
const end=source.indexOf('\n              }\n\n              /*',start);
const loopPrefix='let bestProgressProbe=null,bestFittingProbe=null;for(const candidate of candidates){const trialExtraMinutes=candidate.extra;const trialHasBrokenOpportunity=candidate.broken;';
const loopSuffix='}return {bestProgressProbe,bestFittingProbe,chosen:bestFittingProbe??bestProgressProbe};';
const genericOld=new Function('candidates','projectedExtraMinutes','nearBudgetAllowedExtraMinutes',compile(loopPrefix+'if(trialHasBrokenOpportunity)continue;'+fixture.blocks.progress+'if(trialExtraMinutes>nearBudgetAllowedExtraMinutes)continue;'+fixture.blocks.fitting+loopSuffix));
const genericNew=new Function('candidates','projectedExtraMinutes','nearBudgetAllowedExtraMinutes','chooseProgressBudgetProbe','chooseFittingBudgetProbe',compile(loopPrefix+source.slice(start,end)+loopSuffix));
function sequence(rows,allowed=12){
 const before=genericOld(rows,20,allowed),events=[];
 const wrap=name=>(...args)=>{events.push(name);return helpers[name](...args);};
 const after=genericNew(rows,20,allowed,wrap('chooseProgressBudgetProbe'),wrap('chooseFittingBudgetProbe'));assert.deepEqual(after,before);return {result:after,events};
}
const candidate=(id,extra,value=100,broken=false)=>({opportunity:{id,valueMeters:value},extra,broken});
test('generic adapter rejects bad quality before any comparison',()=>assert.deepEqual(sequence([candidate('bad',10,100,true)]).events,[]));
test('generic adapter retains progress above budget but skips fitting comparison',()=>{
 const {result,events}=sequence([candidate('progress',13)]);assert.deepEqual(events,['chooseProgressBudgetProbe']);assert.equal(result.chosen.opportunityId,'progress');
});
test('generic adapter prefers a fitting winner over better-time progress fallback',()=>{
 const {result}=sequence([candidate('short',8,500),candidate('near',11,10)]);assert.equal(result.bestProgressProbe.opportunityId,'short');assert.equal(result.chosen.opportunityId,'near');
});
test('generic adapter preserves equal-budget eligibility and NaN comparison semantics',()=>{
 sequence([candidate('at',12),candidate('above',12.001)]);sequence([candidate('nan',NaN)]);
});
