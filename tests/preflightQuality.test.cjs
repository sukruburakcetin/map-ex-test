const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..'),cache=new Map();
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
function load(relative){if(cache.has(relative))return cache.get(relative);const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),m,m.exports);cache.set(relative,m.exports);return m.exports;}
const {classifyPreflightQuality}=load('features/routing/preflightQuality');
const {buildPreflightLegDiagnostics}=load('features/routing/preflightDiagnostics');
const baseline=JSON.parse(fs.readFileSync(__dirname+'/fixtures/preflightQuality.baseline.json'));
const result='return {pathologicalInternalLegs,networkQualityFits,qualityCleanupMode,pathologicalOwnerIds};';
const previous=new Function('preflightLegs','budgetFits',compile(baseline.body+result));
const widget=require('./helpers/captureExecutionSource.cjs').captureExecutionSource();
const start=widget.indexOf('            const { pathologicalInternalLegs, networkQualityFits, qualityCleanupMode, pathologicalOwnerIds } = classifyPreflightQuality('),end=widget.indexOf('            if (pathologicalInternalLegs.length)',start);assert(start>0&&end>start);
const adapter=new Function('preflightLegs','budgetFits','classifyPreflightQuality',compile(widget.slice(start,end)+result));
const leg=(fromOwner='A',toOwner=fromOwner,directMeters=450,durationMinutes=4.5)=>({fromStop:1,toStop:2,fromOwner,toOwner,directMeters,durationMinutes});
function compare(legs,budgetFits=true){
 legs.forEach(Object.freeze);Object.freeze(legs);const oldLogs=[],newLogs=[];
 const expected=previous.call({log:message=>oldLogs.push(message)},legs,budgetFits);
 const actual=adapter.call({log:message=>newLogs.push(message)},legs,budgetFits,classifyPreflightQuality);
 assert.deepEqual(actual,expected);assert.deepEqual(newLogs,oldLogs);assert.deepEqual(classifyPreflightQuality(legs,budgetFits),expected);
 for(const selected of actual.pathologicalInternalLegs)assert(legs.includes(selected));return actual;
}
test('inclusive threshold is pathological and permits cleanup only within budget',()=>{
 assert(compare([leg()]).qualityCleanupMode);assert(!compare([leg()],false).qualityCleanupMode);
});
for(const meters of [449,450,451])for(const minutes of [4.49,4.5,4.51])test('boundary '+meters+'m '+minutes+'min',()=>assert.equal(compare([leg('A','A',meters,minutes)]).networkQualityFits,!(meters<=450&&minutes>=4.5)));
for(const owner of ['START','END','UNKNOWN'])test('excludes sentinel '+owner,()=>assert(compare([leg(owner)]).networkQualityFits));
test('cross-owner transitions remain eligible even if expensive',()=>assert(compare([leg('A','B')]).networkQualityFits));
test('empty diagnostics fit quality regardless of budget',()=>{assert(compare([]).networkQualityFits);assert(!compare([],false).qualityCleanupMode);});
test('owner set preserves first occurrence order and deduplicates repeated owners',()=>{
 const r=compare([leg('B'),leg('A'),leg('B')]);assert.deepEqual([...r.pathologicalOwnerIds],['B','A']);assert.equal(r.pathologicalInternalLegs.length,3);
});
for(const value of [NaN,Infinity,-Infinity])test('nonfinite comparisons preserve prior rules '+value,()=>{compare([leg('A','A',value,4.5)]);compare([leg('A','A',450,value)]);});
test('main gate uses rounded durations from actual diagnostics, separately from raw trial checks',()=>{
 const stops=[[0,0],[.001,0],[.002,0],[.003,0]];
 const {preflightLegs}=buildPreflightLegDiagnostics([0,4.499,0],stops,['A','A']);
 assert.equal(preflightLegs[1].durationMinutes,4.5);assert(!compare(preflightLegs).networkQualityFits);
 const {hasBrokenTrialOpportunity}=load('features/routing/trialPreflightQuality');assert.equal(hasBrokenTrialOpportunity([0,4.499,0],stops,['A','A']),false);
});
test('deterministic varied owner/duration batches match the old gate',()=>{
 for(let i=0;i<80;i++)compare(Array.from({length:6},(_,j)=>leg(['A','B','START','UNKNOWN'][(i+j)%4],['A','B','START','UNKNOWN'][(i+j+(j%3===0?1:0))%4],440+(i+j)%22,4.4+((i*j)%22)/100)),i%2===0);
});
