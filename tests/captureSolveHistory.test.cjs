const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=s=>{const result=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);return result.outputText;};
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/CaptureSolveHistory.ts','utf8')))(m,m.exports);const {CaptureSolveHistory}=m.exports;
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureSolveHistory.baseline.json'));
const previous=new Function(compile(fixture.initialize+'return {record(finalRoute,solvedOpportunities,actualExtraMinutes){'+fixture.update+'},get best(){return {route:bestRoute,opportunities:bestRouteOpportunities,extraMinutes:bestActualExtraMinutes};}};'));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),match=source.match(/captureSolveHistory\.record\([^;]+;/);assert(match);
const adapter=new Function('captureSolveHistory','finalRoute','solvedOpportunities','actualExtraMinutes',compile(match[0]));
function compare(sequence){
 const old=previous(),history=new CaptureSolveHistory();assert.deepEqual(history.best,old.best);
 for(const {route,opportunities,extra} of sequence){const original=opportunities.slice(),prior=history.best;old.record(route,opportunities,extra);adapter(history,route,opportunities,extra);assert.deepEqual(history.best,old.best);assert.equal(history.best.route,old.best.route);assert.deepEqual(opportunities,original);assert.equal(history.best.opportunities===opportunities,old.best.opportunities===opportunities);if(!(extra<prior.extraMinutes))assert.equal(history.best,prior);}
 return history;
}
const solve=(id,extra)=>({route:{id},opportunities:[{id:'selection-'+id}],extra});
test('initial state matches the previous null/empty/infinite state',()=>compare([]));
test('improving solves update route, extra time and matching selection together',()=>{const history=compare([solve('A',20),solve('B',10),solve('C',5)]);assert.equal(history.best.route.id,'C');assert.equal(history.best.opportunities[0].id,'selection-C');});
test('ties and worse solves retain the first matching winner',()=>{const history=compare([solve('A',10),solve('B',10),solve('C',11)]);assert.equal(history.best.route.id,'A');});
for(const value of [NaN,Infinity,-Infinity,-1,0])test('numeric edge '+value,()=>compare([solve('A',value),solve('B',10),solve('C',value)]));
test('winning opportunity arrays are snapshots with original element identities',()=>{const route={id:'A'},item={id:'point'},rows=[item],history=compare([{route,opportunities:rows,extra:1}]);assert.notEqual(history.best.opportunities,rows);assert.equal(history.best.opportunities[0],item);rows.length=0;assert.equal(history.best.opportunities.length,1);assert.equal(history.best.route,route);});
test('nonwinning solves do not enumerate or copy their opportunity arrays',()=>{const history=new CaptureSolveHistory();history.record({id:'A'},[],1);const input=new Proxy([],{get(target,key){if(key===Symbol.iterator)throw Error('unneeded copy');return Reflect.get(target,key);}});history.record({id:'B'},input,2);assert.equal(history.best.route.id,'A');});
test('separate runs do not share stored solves',()=>{const first=new CaptureSolveHistory(),second=new CaptureSolveHistory();first.record({id:'A'},[],1);assert.equal(second.best.route,null);assert.equal(second.best.extraMinutes,Infinity);});
test('frozen input snapshots remain untouched',()=>{const rows=Object.freeze([Object.freeze({id:'A'})]),history=new CaptureSolveHistory();history.record(Object.freeze({id:'route'}),rows,1);assert.equal(history.best.opportunities[0],rows[0]);});
test('150 deterministic solve sequences match prior state after every record',()=>{let seed=619;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);for(let n=0;n<150;n++)compare(Array.from({length:8},(_,i)=>solve(String(i),Math.floor(random()*40)-5)));});
