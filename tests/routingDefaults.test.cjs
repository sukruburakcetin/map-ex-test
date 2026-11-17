const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(relative){
  if(cache.has(relative))return cache.get(relative);
  const module={exports:{}},result=ts.transpileModule(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8'),{fileName:relative+'.ts',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
  assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);
  new Function('require','module','exports',result.outputText)(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),module,module.exports);
  cache.set(relative,module.exports);return module.exports;
}
const {CAPTURE_ROUTE_CONFIG:config}=load('utils/constants');
const {scoreCaptureTargets}=load('features/routing/captureRouteScoring');
const {buildCaptureOpportunities,selectCaptureOpportunities}=load('utils/routeOptimizer');
function target(index,length=55,tier='none'){
  const lon=.001+index*.0015,start=[lon,.0008],end=[lon+length/6371000*180/Math.PI,.0008];
  return {seg:{start,end,lengthMeters:length,highwayType:'residential',isOneway:false},index,tier,midpoint:[(start[0]+end[0])/2,.0008],lengthMeters:length,distanceFromCenterMeters:0,priority:1,clusterId:-1};
}
test('default priorities are finite and retain missing/stale and length preference',()=>{
  const a=target(0),b=target(1,110),segments=[a.seg,a.seg,b.seg];
  const scores=scoreCaptureTargets(segments,['none','stale','none'],{longitude:0,latitude:0},null);
  assert.equal(scores.length,3);assert(scores.every(s=>Number.isFinite(s.priority)&&s.priority>0));
  assert.equal(scores[0].priority/scores[1].priority,config.nonePriority/config.stalePriority);
  assert(scores[2].priority>scores[0].priority);
  const far=scoreCaptureTargets(segments,['none','stale','none'],{longitude:1,latitude:1},null);
  assert.deepEqual(far.map(s=>s.priority),scores.map(s=>s.priority));
  assert.equal(config.centerDistanceWeight,0);
});
test('explicit nonzero center preference remains available to configuration',()=>{
  const segment=target(0).seg,custom={...config,centerDistanceWeight:.25};
  const near=scoreCaptureTargets([segment],['none'],{longitude:.001,latitude:.0008},null,custom)[0];
  const far=scoreCaptureTargets([segment],['none'],{longitude:1,latitude:1},null,custom)[0];
  assert(near.priority>far.priority);assert(Number.isFinite(near.priority));
});
test('opportunity length floor rejects a sub-threshold group',t=>{
  const messages=[];t.mock.method(console,'log',(...args)=>messages.push(args.join(' ')));
  const opportunities=buildCaptureOpportunities([target(0,config.minimumUsefulSegmentLengthMeters-.001)],[[0,0],[.15,0]],400);
  assert.equal(opportunities.length,0);
  assert(messages.some(s=>s.includes('Groups rejected by length: 1 groups')));
});
test('weighted-new-coverage floor rejects baseline-only opportunities',t=>{
  const messages=[];t.mock.method(console,'log',(...args)=>messages.push(args.join(' ')));
  const input=target(0,100,'stale');input.seg.start[1]=input.seg.end[1]=input.midpoint[1]=0;
  const opportunities=buildCaptureOpportunities([input],[[0,0],[.15,0]],400);
  assert.equal(opportunities.length,0);
  assert(messages.some(s=>s.includes('Groups rejected by value: 1 groups')));
});
test('an opportunity at the length/value threshold remains eligible',t=>{
  t.mock.method(console,'log',()=>{});
  const input=target(0,config.minimumUsefulSegmentLengthMeters,'stale');
  const opportunities=buildCaptureOpportunities([input],[[0,0],[.15,0]],400);
  assert.equal(opportunities.length,1);assert(Number.isFinite(opportunities[0].priority));
});
test('dense input respects the documented candidate and selection caps',t=>{
  t.mock.method(console,'log',()=>{});
  const opportunities=buildCaptureOpportunities(Array.from({length:60},(_,i)=>target(i)),[[0,0],[.15,0]],400);
  assert.equal(opportunities.length,config.maxOpportunityCandidates);assert.equal(opportunities.length,40);
  assert(opportunities.every(o=>Number.isFinite(o.priority)));
  for(let i=1;i<opportunities.length;i++)assert(opportunities[i-1].priority>=opportunities[i].priority);
  const selection=selectCaptureOpportunities(opportunities,10000);
  assert.equal(selection.opportunities.length,config.maxSelectedOpportunities);assert.equal(selection.stopReason,'opportunity-cap');
});
test('anchor-cap skips an oversized candidate and still considers a smaller one',()=>{
  const opportunity=(id,count,value)=>({id,routePoints:Array.from({length:count},(_,i)=>[i*.0002,0]),segments:[],valueMeters:value,estimatedDetourMinutes:1,lengthMeters:100,baselinePosition:0});
  const result=selectCaptureOpportunities([opportunity('too-many',config.maxFinalStops+1,1000),opportunity('fits',2,100)],10);
  assert.deepEqual(result.opportunities.map(o=>o.id),['fits']);assert.equal(result.stopReason,'anchor-cap');assert.equal(result.usedAnchorSlots,2);assert.equal(result.rejectedForAnchorCount,1);
});
test('empty candidates and exhausted time budgets retain their stop reasons',()=>{
  assert.equal(selectCaptureOpportunities([],10).stopReason,'exhausted');
  const candidate={id:'slow',valueMeters:100,estimatedDetourMinutes:2,routePoints:[[0,0]],segments:[],lengthMeters:100,baselinePosition:0};
  assert.equal(selectCaptureOpportunities([candidate],1).stopReason,'budget');
});
