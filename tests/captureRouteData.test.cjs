const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(source){const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/captureRouteData.ts','utf8')))(m,m.exports);
const {buildCaptureRouteData}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteData.baseline.json'));
const widget=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const a=widget.indexOf('      this.setState({\n        routeData: buildCaptureRouteData(');assert(a>0);
const b=widget.indexOf('\n      /*\n       * 10. USER FEEDBACK',a);assert(b>a);
const keys=['finalDistanceMeters','finalMinutes','combinedCoordinates','baselineMinutes','actualExtraMinutes','spareMinutes','activeRouteCoverageTargets','routeCoverage','incrementalCoverage','finalSelectedNovelMeters','finalSelectedBaselineOverlapMeters','activeOpportunities','finalSelectedAnchorCount','selectedCorridorWidth','selection'];
const previous=new Function(...keys,compile('return ('+golden.expression+');'));
const adapter=new Function('buildCaptureRouteData',...keys,compile(widget.slice(a,b)));
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function input(overrides={}){return {
 finalDistanceMeters:1234,finalMinutes:12.5,combinedCoordinates:[[0,0,7],[1,1,8]],baselineMinutes:10,actualExtraMinutes:2.5,spareMinutes:5,
 activeRouteCoverageTargets:[{index:0,tier:'none',start:[0,0],end:[1,1],lengthMeters:100},{index:1,tier:'stale',start:[1,1],end:[2,2],lengthMeters:200}],
 routeCoverage:{coveredTargetMeters:180,coveragePercent:60,touchedSegmentCount:2,fullyCoveredSegmentCount:1,segmentResults:[{},{}],totalTargetMeters:305},
 incrementalCoverage:{incrementalCoveredMeters:150,incrementalNoneMeters:100,incrementalStaleMeters:50},
 finalSelectedNovelMeters:220,finalSelectedBaselineOverlapMeters:80,selectedOpportunityCount:2,finalSelectedAnchorCount:4,selectedCorridorWidth:250,selectionStopReason:'exhausted',...overrides};}
function compare(value){
 freeze(value);const before=structuredClone(value);
 const legacy={...value,activeOpportunities:Array(value.selectedOpportunityCount).fill({}),selection:{stopReason:value.selectionStopReason}};
 const args=keys.map(k=>legacy[k]),expected=previous(...args),actual=buildCaptureRouteData(value);let published;
 adapter.call({setState:patch=>{assert.equal(published,undefined);published=patch;}},buildCaptureRouteData,...args);
 assert.deepEqual(actual,expected);assert.deepEqual(published,{routeData:expected});assert.deepEqual(value,before);
 assert.equal(actual.geojson.coordinates,value.combinedCoordinates);assert.equal(published.routeData.geojson.coordinates,value.combinedCoordinates);return actual;
}
test('all published and legacy fields match the previous widget expression',()=>{
 const r=compare(input());assert.equal(r.duration,750);assert.equal(r.targetedLengthMeters,300);assert.equal(r.totalTargetLengthMeters,305);assert.equal(r.remainingTargetLengthMeters,120);
 assert.equal(r.targetCoveragePercent,r.targetRealizationPercent);assert.equal(r.capturedTargetLengthMeters,r.coveredTargetLengthMeters);assert.equal(r.capturedSegmentCount,r.fullyCoveredSegmentCount);
});
test('empty selection and targets retain zero counts',()=>compare(input({activeRouteCoverageTargets:[],selectedOpportunityCount:0,finalSelectedAnchorCount:0})));
test('overreported coverage keeps the previous zero clamp',()=>{
 const value=input();value.routeCoverage.coveredTargetMeters=500;assert.equal(compare(value).remainingTargetLengthMeters,0);
});
for(const reason of ['budget','opportunity-cap','anchor-cap','exhausted'])test('preserves stop reason '+reason,()=>assert.equal(compare(input({selectionStopReason:reason})).selectionStopReason,reason));
for(const value of [0,-1,Infinity,-Infinity,NaN])test('preserves numeric semantics '+value,()=>compare(input({finalMinutes:value,actualExtraMinutes:value,finalDistanceMeters:value})));
test('deterministic varied results match prior mapping without mutating inputs',()=>{
 for(let i=0;i<50;i++){const value=input({finalMinutes:i/3,baselineMinutes:i/5,actualExtraMinutes:i/7,selectedOpportunityCount:i%4,finalSelectedNovelMeters:i*13});value.routeCoverage.coveredTargetMeters=i*11;compare(value);}
});
test('publication stays after drawing and its ownership check, before ready feedback',()=>{
 const draw=widget.lastIndexOf('await this.drawCaptureRoute(finalPaths, run.current);',a);
 const check=widget.indexOf('run.check();',draw);assert(draw>0&&check>draw&&check<a);assert(b>a);
});
