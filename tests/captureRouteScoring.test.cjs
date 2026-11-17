const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(relative){
  if(cache.has(relative))return cache.get(relative);
  const module={exports:{}},result=ts.transpileModule(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8'),{
    fileName:relative+'.ts',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true,
  });
  assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);
  new Function('require','module','exports',result.outputText)(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),module,module.exports);
  cache.set(relative,module.exports);return module.exports;
}
const scoring=load('features/routing/captureRouteScoring');
const {CAPTURE_ROUTE_CONFIG}=load('utils/constants');
const golden=JSON.parse(fs.readFileSync(root+'/tests/fixtures/captureRouteScoring.baseline.json','utf8'),(key,value)=>value==='NaN'?NaN:value);
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
for(const example of golden.cases)test('target scoring matches previous widget: '+example.name,()=>{
  const segments=freeze(structuredClone(golden.segments)),tiers=freeze([...example.tiers]),center=structuredClone(example.center);
  if(center?.longitude==='NaN')center.longitude=NaN;
  const actual=scoring.scoreCaptureTargets(segments,tiers,center,example.bbox,{...CAPTURE_ROUTE_CONFIG,minimumUsefulSegmentLengthMeters:example.minimum,...('weight' in example?{centerDistanceWeight:example.weight}:{})});
  assert.deepEqual(actual,example.targets);
  for(const target of actual)assert.equal(target.seg,segments[target.index]);
});
test('stop mapping, diagnostics, coverage targets and totals match captured previous outputs',()=>{
  const input=freeze(structuredClone(golden.opportunities));
  assert.deepEqual(scoring.captureStopOwners(input,CAPTURE_ROUTE_CONFIG.maxFinalStops),golden.stopOwners);
  assert.deepEqual(scoring.captureStopOwners(input,2),golden.stopOwners.slice(0,2));
  assert.deepEqual(scoring.captureStopOwners(input,0),[]);
  assert.deepEqual(scoring.captureAnchorDistribution(input),golden.diagnostics.anchorDistribution);
  assert.deepEqual(scoring.captureThreeAnchorDiagnostics(input),golden.diagnostics.threeAnchorDiagnostics);
  assert.deepEqual(scoring.activeCaptureCoverageTargets(input),golden.coverageTargets);
  assert.deepEqual(scoring.summarizeCaptureOpportunities(input),golden.summary);
});
test('24 corridor decisions retain exact thresholds and stop-reason rules',()=>{
  for(const example of golden.expansion)assert.equal(scoring.shouldExpandCaptureCorridor(example.last,example.reason,example.estimated,example.budget,example.ratio),example.expected,JSON.stringify(example));
  assert.equal(scoring.shouldExpandCaptureCorridor(false,'exhausted',0,0,.85),false);
  assert.equal(scoring.shouldExpandCaptureCorridor(false,'exhausted',0,-1,.85),false);
});
for(const example of golden.anchorBoundaries)test('stop separation retains '+example.meters+'m boundary behavior',()=>{
  assert.deepEqual(scoring.captureStopOwners(example.opportunities,72),example.expected);
});
test('empty input retains empty diagnostics and zero totals',()=>{
  assert.deepEqual(scoring.scoreCaptureTargets([],[],null,null),[]);
  assert.deepEqual(scoring.captureStopOwners([],72),[]);
  assert.deepEqual(scoring.captureAnchorDistribution([]),{one:0,two:0,three:0});
  assert.deepEqual(scoring.captureThreeAnchorDiagnostics([]),[]);
  assert.deepEqual(scoring.activeCaptureCoverageTargets([]),[]);
  assert.deepEqual(scoring.summarizeCaptureOpportunities([]),{missingMeters:0,staleMeters:0,targetedCaptureMeters:0,finalSelectedNovelMeters:0,finalSelectedBaselineOverlapMeters:0,finalSelectedAnchorCount:0});
});
test('actual widget scoring adapter forwards analysis, center and configuration snapshots',()=>{
  const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
  const method=widget.members.find(n=>n.name?.getText(sf)==='buildCaptureTargetSegments').getText(sf);
  const Fixture=new Function('scoreCaptureTargets',ts.transpileModule('class Fixture{'+method+'};return Fixture;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText)(scoring.scoreCaptureTargets),w=new Fixture();
  Object.assign(w,{state:{jimuMapView:{view:{center:{longitude:0,latitude:0}}}},_coverageSegments:golden.segments,_coverageSegmentTiers:golden.cases[0].tiers,_coverageAnalysisBbox:null,CAPTURE_ROUTE_CONFIG});
  assert.deepEqual(w.buildCaptureTargetSegments(),golden.cases[0].targets);
});
