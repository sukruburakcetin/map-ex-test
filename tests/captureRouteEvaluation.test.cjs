const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
function load(name,overrides={},cache=new Map()){
 if(overrides[name])return overrides[name];if(cache.has(name))return cache.get(name);const m={exports:{}};
 new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',name+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(name),id)),overrides,cache),m,m.exports);cache.set(name,m.exports);return m.exports;
}
const geo=load('utils/geoUtils'),scoring=load('features/routing/captureRouteScoring'),{normalizeCaptureRoutePaths}=load('features/routing/captureRouteGeometry');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteEvaluation.baseline.json'));
const rows=JSON.parse(fs.readFileSync(__dirname+'/fixtures/captureRouteScoring.baseline.json')).opportunities;
const result='return {finalPaths,activeRouteCoverageTargets,routeCoverage,incrementalCoverage,combinedCoordinates};';
const previous=new Function('finalRoute','baselinePaths','activeOpportunities','normalizeCaptureRoutePaths','activeCaptureCoverageTargets','evaluateRouteCoverage','evaluateIncrementalRouteCoverage',compile(golden.body+result));
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),a=source.indexOf('      const { finalPaths, activeRouteCoverageTargets, routeCoverage, incrementalCoverage, combinedCoordinates } = evaluateFinalCaptureRoute('),b=source.indexOf('      await this.drawCaptureRoute(finalPaths, run.current);',a);assert(a>0&&b>a);
const adapter=new Function('finalRoute','baselinePaths','activeOpportunities','evaluateFinalCaptureRoute',compile(source.slice(a,b)+result));
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function compare({paths=[[[0,0],[.001,0]]],baselinePaths=[[[0,0],[.001,0]]],opportunities=rows,tolerance=25,spacing=5,real=false,fail}={}){
 freeze(paths);freeze(baselinePaths);freeze(opportunities);const before=structuredClone({paths,baselinePaths,opportunities});
 function run(old){const events=[],wrap=(name,fn)=>(...args)=>{events.push([name,args]);if(fail===name)throw Error(name+' failed');return real?fn(...args):{kind:name};};
 const deps={...geo,evaluateRouteCoverage:wrap('coverage',geo.evaluateRouteCoverage),evaluateIncrementalRouteCoverage:wrap('incremental',geo.evaluateIncrementalRouteCoverage)};
 let value,error;try{const ctx={CAPTURE_ROUTE_CONFIG:{routeCoverageToleranceMeters:tolerance,coverageSampleSpacingMeters:spacing}};
 value=old?previous.call(ctx,{paths},baselinePaths,opportunities,normalizeCaptureRoutePaths,scoring.activeCaptureCoverageTargets,deps.evaluateRouteCoverage,deps.evaluateIncrementalRouteCoverage):adapter.call(ctx,{paths},baselinePaths,opportunities,load('features/routing/captureRouteEvaluation',{'utils/geoUtils':deps}).evaluateFinalCaptureRoute);
 }catch(e){error=e.message;}return {value,error,events};}
 const old=run(true),actual=run(false);assert.deepEqual(actual,old);assert.deepEqual({paths,baselinePaths,opportunities},before);
 if(actual.value){const normalized=normalizeCaptureRoutePaths(paths);for(let i=0;i<normalized.length;i++)assert.equal(actual.value.finalPaths[i],normalized[i]);
 assert.equal(actual.events[0][1][0],actual.value.finalPaths);assert.equal(actual.events[1][1][0],actual.value.finalPaths);assert.equal(actual.events[1][1][1],baselinePaths);assert.equal(actual.events[0][1][1],actual.value.activeRouteCoverageTargets);assert.equal(actual.events[1][1][2],actual.value.activeRouteCoverageTargets);assert.equal(actual.value.combinedCoordinates[0],normalized[0][0]);}
 return actual;
}
test('preserves call order, results and coordinate identity',()=>assert.deepEqual(compare().events.map(e=>e[0]),['coverage','incremental']));
for(const [name,paths] of [['flat',[[0,0],[1,1]]],['object',{coordinates:[[0,0],[1,1]]}],['3D',[[[0,0,7],[1,1,8]]]],['multipart',[[[0,0],[1,1]],[[2,2],[3,3]]]]])test('valid '+name,()=>compare({paths}));
for(const [i,paths] of [null,[],[[]],[[0,0]],[[0,0],[1,NaN]],[[[0,0],[1,1]],[]],new Array(2)].entries())test('invalid geometry '+i,()=>{const r=compare({paths});assert.equal(r.error,'Final route geometry is empty.');assert.deepEqual(r.events,[]);});
test('empty selection stays empty',()=>assert.deepEqual(compare({opportunities:[]}).value.activeRouteCoverageTargets,[]));
for(const fail of ['coverage','incremental'])test('failure propagation '+fail,()=>{const r=compare({fail});assert.equal(r.error,fail+' failed');assert.equal(r.events.length,fail==='coverage'?1:2);});
test('real calculations match the previous block',()=>{const seg=rows[0].segments[0].seg,paths=[[seg.start,seg.end]];for(const opportunities of [rows,rows.slice(0,1),[]])compare({paths,baselinePaths:paths,opportunities,real:true});});
test('tolerance and spacing remain forwarded',()=>{for(const [tolerance,spacing] of [[0,1],[-1,0],[25,5],[50,20]])compare({tolerance,spacing,real:true});});
