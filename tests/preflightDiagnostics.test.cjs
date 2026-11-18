const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=source=>{const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);return result.outputText;};
function load(relative,overrides={},cache=new Map()){
 if(overrides[relative])return overrides[relative];if(cache.has(relative))return cache.get(relative);
 const m={exports:{}};cache.set(relative,m.exports);
 new Function('require','module','exports',compile(fs.readFileSync(root+'/src/'+relative+'.ts','utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id)),overrides,cache),m,m.exports);cache.set(relative,m.exports);return m.exports;
}
const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/preflightDiagnostics.baseline.json'));
const oldSnap=new Function('preflight','preflightStops','captureStopOwners',compile(fixture.owner+fixture.snap+'return snapDiagnostics;'));
const oldLegs=new Function('preflight','preflightStops','captureStopOwners','distanceMeters',compile(fixture.owner+fixture.legs+'return {preflightLegs,worstPreflightLegs};'));
const widget=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');
const snapStart=widget.indexOf('            const snapDiagnostics = buildPreflightSnapDiagnostics('),snapEnd=widget.indexOf('            const { badSnapDiagnostics, hardBadSnapOwners } =',snapStart);
const legStart=widget.indexOf('            const { preflightLegs, worstPreflightLegs } = buildPreflightLegDiagnostics('),legEnd=widget.indexOf('\n            this.log(',legStart);
assert(snapStart>0&&legStart>snapStart);
const snapAdapter=new Function('preflight','preflightStops','captureStopOwners','buildPreflightSnapDiagnostics',compile(widget.slice(snapStart,snapEnd)+'return snapDiagnostics;'));
const legAdapter=new Function('preflight','preflightStops','captureStopOwners','buildPreflightLegDiagnostics',compile(widget.slice(legStart,legEnd)+'return {preflightLegs,worstPreflightLegs};'));
const helpers=load('features/routing/preflightDiagnostics');
const realDistance=load('utils/geoUtils').distanceMeters;
function compare({distances,durations=[],stops=[],owners=[],direct}={}){
 const preflight={waypointSnapDistancesMeters:distances,legDurationMinutes:durations};
 const original=structuredClone({preflight,stops,owners}),oldCalls=[],newCalls=[];
 const distance=calls=>(...args)=>{calls.push(args);return direct===undefined?realDistance(...args):direct;};
 const local=load('features/routing/preflightDiagnostics',{'utils/geoUtils':{distanceMeters:distance(newCalls)}});
 const beforeSnap=oldSnap(preflight,stops,owners),beforeLegs=oldLegs(preflight,stops,owners,distance(oldCalls));
 const afterSnap=snapAdapter(preflight,stops,owners,local.buildPreflightSnapDiagnostics),afterLegs=legAdapter(preflight,stops,owners,local.buildPreflightLegDiagnostics);
 assert.deepEqual(afterSnap,beforeSnap);assert.deepEqual(afterLegs,beforeLegs);assert.deepEqual(newCalls,oldCalls);assert.deepEqual({preflight,stops,owners},original);
 return {snap:afterSnap,...afterLegs};
}
test('ordinary anchors retain owners, distances, ranking and adapter outputs',()=>{
 const result=compare({distances:[999,41,80,999],durations:[1,5,2],stops:[[0,0],[.001,0],[.002,0],[.003,0]],owners:['A','A']});
 assert.deepEqual(result.snap.map(x=>[x.stopIndex,x.owner]),[[2,'A'],[1,'A']]);
 assert.deepEqual(result.preflightLegs.map(x=>[x.fromOwner,x.toOwner]),[['START','A'],['A','A'],['A','END']]);
 assert.equal(result.worstPreflightLegs[0].fromStop,1);
});
for(const distances of [undefined,null,[]])test('missing or empty snap arrays: '+String(distances),()=>assert.deepEqual(compare({distances}).snap,[]));
test('snap rounding precedes the 40m warning threshold',()=>{
 const result=compare({distances:[0,40.04,40.06,0],stops:[[0,0],[0,0],[0,0],[0,0]],owners:['A','B']});
 assert.deepEqual(result.snap.map(x=>x.snapDistanceMeters),[40.1,40]);assert.equal(result.snap.filter(x=>x.snapDistanceMeters>40).length,1);
});
test('equal rounded snaps retain input order',()=>{
 const result=compare({distances:[0,41.01,41.02,41.03,0],stops:Array(5).fill([0,0]),owners:['C','B','A']});assert.deepEqual(result.snap.map(x=>x.owner),['C','B','A']);
});
test('ownership follows owner-list length even with mismatched stop counts',()=>{
 const result=compare({distances:[0,1,2,3,4,5],durations:[1,2,3,4,5],stops:Array(6).fill([0,0]),owners:['A']});
 assert.deepEqual(result.snap.map(x=>x.owner),['UNKNOWN','UNKNOWN','END','A']);
});
test('missing leg coordinates skip distance calls and keep zero direct distance',()=>{
 const result=compare({durations:[1,2,3,4],stops:[[0,0],[1,1]],owners:[]});assert.deepEqual(result.preflightLegs.map(x=>x.directMeters),[157249,0,0,0]);
});
for(const [direct,duration,expectedDistance,expectedDuration] of [[450.49,4.496,450,4.5],[450.51,4.494,451,4.49]])test('quality rounding boundary '+direct+'/'+duration,()=>{
 const result=compare({durations:[duration],stops:[[0,0],[1,1]],owners:['A'],direct});assert.equal(result.preflightLegs[0].directMeters,expectedDistance);assert.equal(result.preflightLegs[0].durationMinutes,expectedDuration);
});
test('worst-leg list is capped at ten without reordering the full list',()=>{
 const result=compare({durations:Array(14).fill(2),stops:Array(15).fill([0,0]),owners:Array(13).fill('A')});assert.equal(result.preflightLegs.length,14);assert.deepEqual(result.worstPreflightLegs.map(x=>x.fromStop),Array.from({length:10},(_,i)=>i));
 for(const leg of result.worstPreflightLegs)assert(result.preflightLegs.includes(leg));
});
test('nonfinite values retain previous arithmetic and sort behavior',()=>compare({distances:[0,NaN,Infinity,-Infinity,0],durations:[NaN,Infinity,-Infinity,0],stops:Array(5).fill([0,0]),owners:['A','A','B'],direct:NaN}));
test('real coordinates across the antimeridian retain distance argument order',()=>compare({durations:[3,4],stops:[[179.9,35],[-179.9,35],[-179.8,35.1]],owners:['A']}));
test('frozen input arrays remain untouched',()=>{
 const stops=Object.freeze([Object.freeze([0,0]),Object.freeze([1,1])]),owners=Object.freeze(['A']),values=Object.freeze([0,40.06,0]);
 assert.equal(helpers.buildPreflightSnapDiagnostics(values,3,owners)[0].snapDistanceMeters,40.1);assert.equal(helpers.buildPreflightLegDiagnostics(Object.freeze([1]),stops,owners).preflightLegs.length,1);
});
test('150 deterministic varied snapshots match previous outputs and distance calls',()=>{
 let seed=8675;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
 for(let n=0;n<150;n++){
  const count=Math.floor(random()*25),stops=Array.from({length:count},()=>[random()*360-180,random()*160-80]);
  compare({distances:Array.from({length:count+2},()=>random()*100),durations:Array.from({length:count+1},()=>random()*15),stops,owners:Array.from({length:Math.max(0,count-2)},(_,i)=>'owner-'+Math.floor(i/2))});
 }
});
