const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;};
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/trialPreflightQuality.baseline.json'));
const helperFactory=new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/routing/trialPreflightQuality.ts','utf8')));
function helper(distanceMeters){const m={exports:{}};helperFactory(()=>({distanceMeters}),m,m.exports);return m.exports.hasBrokenTrialOpportunity;}
const oldPredicates=baseline.blocks.map(b=>new Function('trialPreflight','trialStops','trialCaptureOwners','distanceMeters',compile(b.owner+b.predicate+'return trialHasBrokenOpportunity;')));
const widget=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const starts=[...widget.matchAll(/const trialHasBrokenOpportunity = hasBrokenTrialOpportunity\(/g)];assert.equal(starts.length,3);
const adapters=starts.map(({index})=>new Function('trialPreflight','trialStops','trialCaptureOwners','hasBrokenTrialOpportunity',compile(widget.slice(index,widget.indexOf(');',index)+2)+'return trialHasBrokenOpportunity;')));
const row=(durations=[0,5,0],stops=[[0,0],[.001,0],[.002,0],[.003,0]],owners=['A','A'],direct=100)=>({durations,stops,owners,direct});
function compare(input){
 const original=structuredClone(input);let final;
 for(let i=0;i<3;i++){
  const oldCalls=[],newCalls=[];const measure=calls=>(...args)=>{calls.push(args);return input.direct;};
  const before=oldPredicates[i]({legDurationMinutes:input.durations},input.stops,input.owners,measure(oldCalls));
  const after=adapters[i]({legDurationMinutes:input.durations},input.stops,input.owners,helper(measure(newCalls)));
  assert.equal(after,before);assert.deepEqual(newCalls,oldCalls);assert.deepEqual(input,original);final={value:after,calls:newCalls};
 }
 return final;
}
test('all three adapters detect same-owner internal detours',()=>{const result=compare(row());assert.equal(result.value,true);assert.deepEqual(result.calls,[[0,.001,0,.002]]);});
for(const [distance,duration,broken] of [[450,4.5,true],[450.0001,4.5,false],[449.9999,4.4999,false],[450.49,4.496,false],[449,4.5001,true]])test('raw boundary '+distance+'/'+duration,()=>assert.equal(compare(row([0,duration,0],undefined,undefined,distance)).value,broken));
test('endpoint legs never trigger the quality failure',()=>{const result=compare(row([99,99],[[0,0],[1,1],[2,2]],['A']));assert.equal(result.value,false);assert.equal(result.calls.length,0);});
test('transitions between distinct owners skip distance work',()=>{const result=compare(row([99,99,99],undefined,['A','B']));assert.equal(result.value,false);assert.equal(result.calls.length,0);});
test('missing and sentinel owners are excluded',()=>{
 for(const owners of [[],['UNKNOWN','UNKNOWN'],['START','START'],['END','END']])assert.equal(compare(row([99,99,99],undefined,owners)).value,false);
});
test('missing coordinates skip only the affected legs',()=>{
 const result=compare(row([0,99,0],[[0,0],[1,1]],['A','A']));assert.equal(result.value,false);assert.equal(result.calls.length,0);
});
test('owner indexing uses owner count even if stop count differs',()=>compare(row([99,99,99,99,99],Array(6).fill([0,0]),['A','A'])));
test('first failure short-circuits later internal distance calls',()=>{const result=compare(row([0,5,5,5,0],Array(6).fill([0,0]),['A','A','A','A']));assert.equal(result.value,true);assert.equal(result.calls.length,1);});
test('passing and slow-failing legs keep previous evaluation order',()=>{const result=compare(row([0,1,2,5,0],Array(6).fill([0,0]),['A','A','A','A']));assert.equal(result.value,true);assert.equal(result.calls.length,3);});
test('empty durations and nonfinite values retain previous behavior',()=>{
 assert.equal(compare(row([])).value,false);
 for(const value of [NaN,Infinity,-Infinity])compare(row([0,value,0],undefined,undefined,value));
});
test('frozen inputs are accepted without mutation',()=>{
 const durations=Object.freeze([0,5,0]),stops=Object.freeze(Array.from({length:4},()=>Object.freeze([0,0]))),owners=Object.freeze(['A','A']);assert(helper(()=>1)(durations,stops,owners));
});
test('150 deterministic varied inputs match all original probes and distance-call order',()=>{
 let seed=472;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++){
  const count=Math.floor(random()*12);compare(row(Array.from({length:count+1},()=>random()*10),Array.from({length:count},()=>[random()*360-180,random()*160-80]),Array.from({length:Math.max(0,count-2)},()=>['A','B','UNKNOWN'][Math.floor(random()*3)]),random()*900));
 }
});
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const probeParams=['trialStops','trialCaptureOwners','routingProvider','run','baselineMinutes','allowedExtraMinutes','hardSnapRejectMeters','distanceMeters','hasBrokenTrialOpportunity'];
const probeResult=i=>'return {trialExtraMinutes,trialHasBrokenOpportunity'+(i<2?',trialFits':'')+(i===0?',trialHasBadSnap':'')+'};';
const oldProbes=baseline.blocks.map((b,i)=>new AsyncFunction(...probeParams,compile(b.probe+probeResult(i))));
const newProbes=starts.map(({index},i)=>{const start=widget.lastIndexOf('const trialPreflight = await',index),end=widget.indexOf('this.log(',index);return new AsyncFunction(...probeParams,compile(widget.slice(start,end)+probeResult(i)));});
async function compareProbe(i,{cancel=false,reject=false,direct=100}={}){
 async function execute(fn){
  const events=[],signal=new AbortController().signal,stops=[[0,0],[1,1],[2,2],[3,3]],owners=['A','A'];
  const distance=(...args)=>{events.push(['distance',...args]);return direct;};
  const provider={preflightOrderedStops:async(points,receivedSignal)=>{assert.equal(receivedSignal,signal);assert.equal(points,stops);events.push(['request']);if(reject)throw Error('provider rejected');return {durationMinutes:25,legDurationMinutes:[0,5,0],waypointSnapDistancesMeters:[0,61,0,0]};}};
  const run={signal,check(){events.push(['check']);if(cancel)throw Error('cancelled');}};
  let value,error;try{value=await fn(stops,owners,provider,run,10,20,60,distance,helper(distance));}catch(e){error=e.message;}
  return {value,error,events};
 }
 const before=await execute(oldProbes[i]),after=await execute(newProbes[i]);assert.deepEqual(after,before);return after;
}
for(let i=0;i<3;i++){
 test('probe '+i+' retains request, ownership check and raw evaluation order',async()=>{const result=await compareProbe(i);assert.deepEqual(result.events.map(x=>x[0]),['request','check','distance']);});
 test('probe '+i+' cancellation prevents quality evaluation',async()=>{const result=await compareProbe(i,{cancel:true});assert.equal(result.error,'cancelled');assert.deepEqual(result.events.map(x=>x[0]),['request','check']);});
 test('probe '+i+' provider rejection prevents ownership and quality work',async()=>{const result=await compareProbe(i,{reject:true});assert.equal(result.error,'provider rejected');assert.deepEqual(result.events.map(x=>x[0]),['request']);});
}
