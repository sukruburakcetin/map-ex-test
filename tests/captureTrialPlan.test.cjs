const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..'),cache=new Map();
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
function load(name){if(cache.has(name))return cache.get(name);const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',name+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(name),id))),m,m.exports);cache.set(name,m.exports);return m.exports;}
const {prepareCaptureTrial}=load('features/routing/captureTrialPlan'),{buildFinalRouteStops}=load('utils/routeOptimizer'),{captureStopOwners}=load('features/routing/captureRouteScoring');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureTrialPlan.baseline.json'));
const rows=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteScoring.baseline.json')).opportunities;
const source=require('./helpers/captureExecutionSource.cjs').captureExecutionSource(),starts=[...source.matchAll(/const \{ trialOpportunities, trialCaptureOwners, trialStops \} = prepareCaptureTrial\(/g)];assert.equal(starts.length,3);
const keys=['activeOpportunities','pair','probeCandidate','candidate','startPt','endPt','buildFinalRouteStops','buildCaptureStopOwners'];
const result='return {trialOpportunities,trialCaptureOwners,trialStops};';
const previous=golden.blocks.map(b=>new Function(...keys,compile(b+result)));
const adapters=starts.map(({index})=>new Function(...keys,'prepareCaptureTrial',compile(source.slice(index,source.indexOf('const trialPreflight = await',index))+result)));
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function compare(activeOpportunities=rows,{removeId=rows[0].id,add=rows.at(-1),cap=72}={}){
 freeze(activeOpportunities);freeze(add);const startPt=Object.freeze([-1,-1]),endPt=Object.freeze([1,1]),before=structuredClone(activeOpportunities);
 for(let i=0;i<3;i++){
  const args=[activeOpportunities,{remove:{id:removeId},add},{opportunity:{id:removeId}},{opportunity:{id:removeId}},startPt,endPt,buildFinalRouteStops,opps=>captureStopOwners(opps,cap)];
  const expected=previous[i](...args),actual=adapters[i].call({CAPTURE_ROUTE_CONFIG:{maxFinalStops:cap}},...args,prepareCaptureTrial);
  assert.deepEqual(actual,expected);assert.equal(actual.trialStops[0],startPt);assert.equal(actual.trialStops.at(-1),endPt);
  for(const op of actual.trialOpportunities)assert(activeOpportunities.includes(op)||op===add);
  for(let j=1;j<actual.trialStops.length-1;j++)assert.equal(actual.trialStops[j],expected.trialStops[j]);
 }
 assert.deepEqual(activeOpportunities,before);
}
test('all three trial adapters match prior ordered stops and owners',()=>compare());
test('empty input retains endpoint-only trials',()=>compare([]));
test('missing removal ID preserves survivors',()=>compare(rows,{removeId:'missing'}));
test('duplicate removal IDs are all removed',()=>compare([...rows,{...rows[0]}]));
test('equal baseline positions keep stable input order',()=>compare(rows.map(r=>({...r,baselinePosition:0}))));
test('unsorted inputs are sorted without mutation',()=>compare([...rows].reverse()));
for(const cap of [0,1,2,3,72])test('owner cap '+cap+' retains the separate existing stop/owner limits',()=>compare(rows,{cap}));
test('varied frozen trial selections retain prior behavior',()=>{for(let i=0;i<30;i++)compare(rows.slice(0,i%(rows.length+1)),{removeId:rows[i%rows.length].id,cap:i%8});});
test('stop construction precedes owner construction and propagates failure',()=>{
 const helperSource=fs.readFileSync(root+'/src/features/routing/captureTrialPlan.ts','utf8');
 for(const fail of [null,'stops','owners']){
  const calls=[],m={exports:{}};
  new Function('require','module','exports',compile(helperSource))(id=>id.endsWith('routeOptimizer')?{buildFinalRouteStops:()=>{calls.push('stops');if(fail==='stops')throw Error('stops failed');return [];}}:{captureStopOwners:()=>{calls.push('owners');if(fail==='owners')throw Error('owners failed');return [];}},m,m.exports);
  const run=()=>m.exports.prepareCaptureTrial({activeOpportunities:[],removeId:'missing',startPt:[0,0],endPt:[1,1],maxFinalStops:72});
  if(fail)assert.throws(run,new RegExp(fail+' failed'));else run();assert.deepEqual(calls,fail==='stops'?['stops']:['stops','owners']);
 }
});
test('each provider await remains followed immediately by the existing run check',()=>{
 for(const {index} of starts){const request=source.indexOf('const trialPreflight = await',index),check=source.indexOf('run.check();',request),quality=source.indexOf('const trialExtraMinutes',request);assert(request>index&&check>request&&quality>check);}
});
