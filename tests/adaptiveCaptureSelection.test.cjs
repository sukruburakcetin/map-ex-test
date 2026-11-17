const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..');
function compile(source,fileName){
  const result=ts.transpileModule(source,{fileName,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
  assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);
  return result.outputText;
}
function load(relative,overrides={},cache=new Map()){
  if(overrides[relative])return overrides[relative];
  if(cache.has(relative))return cache.get(relative);
  const module={exports:{}};
  new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8'),relative+'.ts'))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id)),overrides,cache),module,module.exports);
  cache.set(relative,module.exports);return module.exports;
}
const {CAPTURE_ROUTE_CONFIG}=load('utils/constants');
const {shouldExpandCaptureCorridor}=load('features/routing/captureRouteScoring');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/adaptiveCaptureSelection.baseline.json')));
const oldLoop=new Function('optimizerTargets','baselineCoordinates','baselineSpeedMetersPerMinute','spareMinutes','buildCaptureOpportunities','selectCaptureOpportunities','shouldExpandCaptureCorridor',compile(baseline.body,'baseline.ts'));
function compare({passes,budget=20,config=CAPTURE_ROUTE_CONFIG,real=false}){
  const targets=[{seg:{start:[.001,.0008],end:[.002,.0008],lengthMeters:110,highwayType:'residential',isOneway:false},index:0,tier:'none',midpoint:[.0015,.0008],lengthMeters:110,distanceFromCenterMeters:0,priority:220,clusterId:-1}];
  const coordinates=[[0,0],[.02,0]],speed=270;
  function execute(previous){
    const events=[];let index=0;
    const optimizer=load('utils/routeOptimizer');
    const deps={
      buildCaptureOpportunities:(...args)=>{events.push(['build',structuredClone(args)]);return real?optimizer.buildCaptureOpportunities(...args):[{id:'pass-'+index}];},
      selectCaptureOpportunities:(...args)=>{events.push(['select',structuredClone(args)]);return real?optimizer.selectCaptureOpportunities(...args):{opportunities:args[0],...passes[index++]};},
    };
    const log=(...args)=>events.push(['log',...args]);
    let value,error;
    try{
      value=previous?oldLoop.call({CAPTURE_ROUTE_CONFIG:config,log},targets,coordinates,speed,budget,deps.buildCaptureOpportunities,deps.selectCaptureOpportunities,shouldExpandCaptureCorridor):
        load('features/routing/adaptiveCaptureSelection',{'utils/routeOptimizer':deps}).selectAdaptiveCaptureOpportunities({targets,baselineCoordinates:coordinates,baselineSpeedMetersPerMinute:speed,spareMinutes:budget,config,log});
    }catch(e){error=e.message;}
    return {value,error,events};
  }
  const before=execute(true),after=execute(false);
  assert.deepEqual(after,before);
  return after;
}
for(const reason of ['budget','anchor-cap','opportunity-cap'])test(reason+' stops at the first corridor with identical calls and logs',()=>{
  const result=compare({passes:[{stopReason:reason,estimatedExtraMinutes:1}]});
  assert.equal(result.value.selectedCorridorWidth,180);
  assert.equal(result.events.filter(e=>e[0]==='build').length,1);
});
test('exhaustion expands through all three widths and returns the last pass',()=>{
  const result=compare({passes:[1,2,3].map(n=>({stopReason:'exhausted',estimatedExtraMinutes:n}))});
  assert.equal(result.value.selectedCorridorWidth,350);
  assert.equal(result.value.opportunities[0].id,'pass-2');
});
test('expansion stops when a later pass reaches budget',()=>{
  assert.equal(compare({passes:[{stopReason:'exhausted',estimatedExtraMinutes:1},{stopReason:'budget',estimatedExtraMinutes:19}]}).value.selectedCorridorWidth,250);
});
for(const estimate of [16.999,17,17.001])test('budget-use boundary '+estimate,()=>{
  const result=compare({passes:[{stopReason:'exhausted',estimatedExtraMinutes:estimate},{stopReason:'budget',estimatedExtraMinutes:19}]});
  assert.equal(result.value.selectedCorridorWidth,estimate<17?250:180);
});
for(const budget of [0,-1])test('nonpositive budget '+budget+' preserves stop behavior',()=>{
  assert.equal(compare({budget,passes:[{stopReason:'exhausted',estimatedExtraMinutes:0}]}).value.selectedCorridorWidth,180);
});
test('empty corridor list preserves the explicit failure',()=>{
  assert.equal(compare({config:{...CAPTURE_ROUTE_CONFIG,captureCorridorWidthsMeters:[]}}).error,'Capture opportunity selection failed.');
});
test('real optimizer produces identical results and diagnostics',t=>{
  t.mock.method(console,'log',()=>{});
  const result=compare({real:true});
  assert.ok(result.value.selection.opportunities.length>0);
});
test('widget forwards current inputs once and retains UI validation after selection',()=>{
  const widget=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8');
  assert.match(widget,/const \{ opportunities, selection, selectedCorridorWidth \} = selectAdaptiveCaptureOpportunities\(\{\s*targets: optimizerTargets,\s*baselineCoordinates,\s*baselineSpeedMetersPerMinute,\s*spareMinutes,\s*config: this.CAPTURE_ROUTE_CONFIG,\s*log: \(\.\.\.args\) => this.log\(\.\.\.args\),\s*\}\);/);
  assert.ok(!widget.includes('for (let corridorIndex ='));
  assert.ok(widget.includes('if (!selection.opportunities.length)'));
});
