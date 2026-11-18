const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/finalCaptureSelection.ts','utf8')))(m,m.exports);
const {selectFinalCaptureRoute}=m.exports;
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/finalCaptureSelection.baseline.json'));
const keys=['finalRoute','finalRouteOpportunities','bestRoute','bestRouteOpportunities','bestActualExtraMinutes','baselineMinutes','spareMinutes','finalBudgetTolerance'];
const previous=new Function('console',...keys,compile(baseline.body+'return {route:finalRoute,opportunities:finalRouteOpportunities,lastRouteExtraMinutes};'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const start=source.indexOf('      const finalSelection = selectFinalCaptureRoute('),end=source.indexOf('      /*\n       * From here onward',start);assert(start>0&&end>start);
const adapter=new Function('console','selectFinalCaptureRoute',...keys,compile(source.slice(start,end)+'return {...finalSelection,route:finalRoute,opportunities:finalRouteOpportunities};'));
function value(overrides={}){return {finalRoute:Object.freeze({durationMinutes:20,id:'last'}),finalRouteOpportunities:Object.freeze([{id:'last-selection'}]),bestRoute:Object.freeze({durationMinutes:18,id:'best'}),bestRouteOpportunities:Object.freeze([{id:'best-selection'}]),bestActualExtraMinutes:8,baselineMinutes:10,spareMinutes:5,finalBudgetTolerance:1,...overrides};}
function compare(input){
 const oldLogs=[],newLogs=[],args=keys.map(k=>input[k]),before=structuredClone(input);
 const expected=previous({warn:(...v)=>oldLogs.push(v)},...args);
 const actual=adapter({warn:(...v)=>newLogs.push(v)},selectFinalCaptureRoute,...args);
 assert.equal(actual.route,expected.route);assert.deepEqual(actual.opportunities,expected.opportunities);assert.equal(actual.lastRouteExtraMinutes,expected.lastRouteExtraMinutes);assert.equal(actual.recovered,oldLogs.length>0);assert.deepEqual(newLogs,oldLogs);assert.deepEqual(input,before);
 if(actual.recovered){assert.notEqual(actual.opportunities,input.bestRouteOpportunities);assert.equal(actual.opportunities[0],input.bestRouteOpportunities[0]);}
 else assert.equal(actual.opportunities,input.finalRouteOpportunities);
 return actual;
}
test('worse over-budget final restores paired best solve and copies its selection',()=>assert.equal(compare(value()).route.id,'best'));
for(const minutes of [15.999,16,16.001])test('strict budget boundary '+minutes,()=>{
 const actual=compare(value({finalRoute:{durationMinutes:minutes},bestActualExtraMinutes:1}));assert.equal(actual.recovered,minutes>16);
});
for(const extra of [9.999,10,10.001])test('strict improvement boundary '+extra,()=>assert.equal(compare(value({bestActualExtraMinutes:extra})).recovered,extra<10));
test('missing best route keeps latest selection',()=>assert.equal(compare(value({bestRoute:null})).recovered,false));
test('fitting final stays selected even when an earlier solve was faster',()=>assert.equal(compare(value({finalRoute:{durationMinutes:12},bestActualExtraMinutes:1})).recovered,false));
for(const n of [NaN,Infinity,-Infinity])test('nonfinite comparisons retain old semantics '+n,()=>compare(value({bestActualExtraMinutes:n})));
test('non-recovery never enumerates the best opportunity snapshot',()=>{
 const input=value({bestActualExtraMinutes:10,bestRouteOpportunities:new Proxy([],{get(target,key){if(key===Symbol.iterator)throw Error('unexpected copy');return Reflect.get(target,key);}})});
 assert.equal(selectFinalCaptureRoute(input).opportunities,input.finalRouteOpportunities);
});
test('deterministic varied candidates match previous results and warning order',()=>{
 for(let i=0;i<100;i++)compare(value({finalRoute:{durationMinutes:i/3},bestActualExtraMinutes:(i%17)-3,spareMinutes:i%9,finalBudgetTolerance:(i%4)/4}));
});
