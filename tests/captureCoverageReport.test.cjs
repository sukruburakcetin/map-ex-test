const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..'),cache=new Map();
function compile(source){const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
function load(relative){if(cache.has(relative))return cache.get(relative);const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),m,m.exports);cache.set(relative,m.exports);return m.exports;}
const {reportCaptureRouteCoverage}=load('features/routing/captureCoverageReport');
const {summarizeCaptureOpportunities}=load('features/routing/captureRouteScoring');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureCoverageReport.baseline.json'));
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteScoring.baseline.json'));
const summaryKeys=['missingMeters','staleMeters','targetedCaptureMeters','finalSelectedNovelMeters','finalSelectedBaselineOverlapMeters','finalSelectedAnchorCount'];
const previous=new Function('activeOpportunities','routeCoverage','incrementalCoverage','summarizeCaptureOpportunities',compile(golden.body+'return {'+summaryKeys.join(',')+'};'));
const widget=require('./helpers/captureExecutionSource.cjs').captureExecutionSource();
const a=widget.indexOf('      const { finalSelectedNovelMeters, finalSelectedBaselineOverlapMeters, finalSelectedAnchorCount } = reportCaptureRouteCoverage('),b=widget.indexOf('      /*\n       * 9. STORE FINAL ROUTE RESULT',a);assert(a>0&&b>a);
const adapter=new Function('activeOpportunities','routeCoverage','incrementalCoverage','reportCaptureRouteCoverage',compile(widget.slice(a,b)+'return {finalSelectedNovelMeters,finalSelectedBaselineOverlapMeters,finalSelectedAnchorCount};'));
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function input(){return {activeOpportunities:structuredClone(fixture.opportunities),routeCoverage:{coveredTargetMeters:123.456,noneCoveredMeters:78.9,staleCoveredMeters:44.556,coveragePercent:67.85,touchedSegmentCount:2,fullyCoveredSegmentCount:1,segmentResults:[{},{},{}]},incrementalCoverage:{baselineCoveredMeters:17.5,finalCoveredMeters:24.9,sharedCoveredMeters:6.5,incrementalCoveredMeters:18.4,incrementalNoneMeters:10.25,incrementalStaleMeters:8.15,incrementalPercent:51.95}};}
function compare(value,throwAt=0){
 freeze(value);const before=structuredClone(value),oldLogs=[],newLogs=[],adapterLogs=[];
 function run(fn,logs){let result,error;const log=message=>{logs.push(message);if(throwAt&&logs.length===throwAt)throw Error('controlled logger failure');};try{result=fn(log);}catch(e){error=e.message;}return {result,error};}
 const old=run(log=>previous.call({log},value.activeOpportunities,value.routeCoverage,value.incrementalCoverage,summarizeCaptureOpportunities),oldLogs);
 const actual=run(log=>reportCaptureRouteCoverage({...value,log}),newLogs);
 const forwarded=run(log=>adapter.call({log},value.activeOpportunities,value.routeCoverage,value.incrementalCoverage,reportCaptureRouteCoverage),adapterLogs);
 assert.deepEqual(actual,old);assert.deepEqual(newLogs,oldLogs);assert.deepEqual(adapterLogs,oldLogs);assert.equal(forwarded.error,old.error);
 if(!old.error)assert.deepEqual(forwarded.result,Object.fromEntries(summaryKeys.slice(3).map(k=>[k,old.result[k]])));
 assert.deepEqual(value,before);return {summary:actual.result,logs:newLogs};
}
test('all 20 diagnostics retain exact strings, rounding and order',()=>{const r=compare(input());assert.equal(r.logs.length,20);assert.equal(r.logs[4],'[CaptureRoute] Actual targeted route coverage: 123 m');assert.equal(r.logs[7],'[CaptureRoute] Target realization: 67.8%');});
test('empty selection retains zero summary totals',()=>{const value=input();value.activeOpportunities=[];const r=compare(value);assert(Object.values(r.summary).every(n=>n===0));});
test('pruned selection reports only surviving opportunities',()=>{const value=input();value.activeOpportunities=value.activeOpportunities.slice(0,1);compare(value);});
for(const number of [0,-1,NaN,Infinity,-Infinity,99.95])test('numeric diagnostic semantics '+number,()=>{const value=input();for(const k of Object.keys(value.incrementalCoverage))value.incrementalCoverage[k]=number;value.routeCoverage.coveragePercent=number;value.routeCoverage.coveredTargetMeters=number;compare(value);});
test('deterministic varied reports retain original summaries and diagnostics',()=>{for(let i=0;i<40;i++){const value=input();value.activeOpportunities=value.activeOpportunities.slice(0,i%(value.activeOpportunities.length+1));value.routeCoverage.coveredTargetMeters=i*1.37;value.incrementalCoverage.incrementalPercent=i/3;compare(value);}});
test('logger failure preserves partial emission and exception propagation',()=>{for(const at of [1,5,20])compare(input(),at);});
test('reporting stays after drawing and run check, before state publication',()=>{const draw=widget.lastIndexOf('await this.drawCaptureRoute(finalPaths, run.current);',a),check=widget.indexOf('run.check();',draw),publish=widget.indexOf('routeData: buildCaptureRouteData(',a);assert(draw>0&&check>draw&&check<a&&publish>b);});
