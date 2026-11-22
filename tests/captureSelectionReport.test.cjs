const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..'),cache=new Map();
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
function load(relative){if(cache.has(relative))return cache.get(relative);const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),m,m.exports);cache.set(relative,m.exports);return m.exports;}
const reports=load('features/routing/captureSelectionReport'),scoring=load('features/routing/captureRouteScoring');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureSelectionReport.baseline.json'));
const opportunities=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteScoring.baseline.json')).opportunities;
const oldCorridor=new Function('opportunities','selectedCorridorWidth',compile(golden.corridor));
const oldSelection=new Function('selection','captureAnchorDistribution','captureThreeAnchorDiagnostics',compile(golden.selection));
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function compare({rows=opportunities,width=250,estimate=2.55,capture=123.5,reason='exhausted',cap=72,throwAt=0}={}){
 const selection=freeze({opportunities:structuredClone(rows),estimatedExtraMinutes:estimate,estimatedCaptureMeters:capture,stopReason:reason,usedAnchorSlots:5,rejectedForBudgetCount:2,rejectedForAnchorCount:1}),old=[],actual=[];
 const ctx={CAPTURE_ROUTE_CONFIG:{maxFinalStops:cap}};
 const execute=(newCode,logs)=>{let error;const log=message=>{logs.push(message);if(throwAt===logs.length)throw Error('logger failed');};try{if(newCode){reports.reportCaptureCorridor(selection.opportunities,width,log);reports.reportCaptureSelection(selection,cap,log);}else{oldCorridor.call({...ctx,log},selection.opportunities,width);oldSelection.call({...ctx,log},selection,scoring.captureAnchorDistribution,scoring.captureThreeAnchorDiagnostics);}}catch(e){error=e.message;}return error;};
 assert.equal(execute(true,actual),execute(false,old));assert.deepEqual(actual,old);return actual;
}
test('all diagnostics preserve text, numeric rounding and JSON layout',()=>{const logs=compare();assert.equal(logs.length,12);assert.equal(logs[0],'[CaptureRoute] Selected corridor: 250 m');assert(logs[9].startsWith('[CaptureRoute] 3-anchor detail:\n'));});
test('empty corridor/selection can be reported independently',()=>compare({rows:[]}));
for(const reason of ['budget','opportunity-cap','anchor-cap','exhausted'])test('stop reason '+reason,()=>compare({reason}));
for(const value of [NaN,Infinity,-Infinity,0])test('numeric semantics '+value,()=>compare({estimate:value,capture:value,width:value}));
test('logger failure retains partial emission and propagation',()=>{for(const throwAt of [1,4,10,12])compare({throwAt});});
test('varied selections retain ordering and anchor diagnostics',()=>{for(let i=0;i<40;i++)compare({rows:opportunities.slice(0,i%(opportunities.length+1)),estimate:i/3,cap:i});});
test('preparation workflow retains guards and feedback between report calls',()=>{
 const source=fs.readFileSync(root+'/src/features/routing/captureRoutePreparation.ts','utf8');
 const corridor=source.indexOf('reportCaptureCorridor(opportunities, selectedCorridorWidth, message => host.log(message));'),guard=source.indexOf('if (!opportunities.length)',corridor),selection=source.indexOf('reportCaptureSelection(selection, host.config().maxFinalStops, message => host.log(message));',guard),empty=source.indexOf('if (!selection.opportunities.length)',selection),progress=source.indexOf('host.progress(selection.estimatedExtraMinutes, spareMinutes)',empty);
 assert(corridor>0&&guard>corridor&&selection>guard&&empty>selection&&progress>empty);
});
