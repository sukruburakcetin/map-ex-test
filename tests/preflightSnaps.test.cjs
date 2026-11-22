const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){return ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/preflightQuality.ts','utf8')))(m,m.exports);const {classifyPreflightSnaps}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/preflightSnaps.baseline.json'));
const result='return {badSnapDiagnostics,hardBadSnapOwners};';
const previous=new Function('snapDiagnostics','hardSnapRejectMeters',compile(golden.body+result));
const source=require('./helpers/captureExecutionSource.cjs').captureExecutionSource(),a=source.indexOf('            const { badSnapDiagnostics, hardBadSnapOwners } = classifyPreflightSnaps('),b=source.indexOf('            if (hardBadSnapOwners.size)',a);assert(a>0&&b>a);
const adapter=new Function('snapDiagnostics','hardSnapRejectMeters','classifyPreflightSnaps',compile(source.slice(a,b)+result));
const snap=(owner='A',snapDistanceMeters=60,stopIndex=1)=>Object.freeze({owner,snapDistanceMeters,stopIndex});
function compare(rows,threshold=60){Object.freeze(rows);const before=structuredClone(rows),oldLogs=[],newLogs=[];
 const old=previous.call({log:s=>oldLogs.push(s)},rows,threshold),actual=adapter.call({log:s=>newLogs.push(s)},rows,threshold,classifyPreflightSnaps);
 assert.deepEqual(actual,old);assert.deepEqual(newLogs,oldLogs);assert.deepEqual(rows,before);assert.deepEqual(classifyPreflightSnaps(rows,threshold),old);for(const r of actual.badSnapDiagnostics)assert(rows.includes(r));return actual;
}
for(const meters of [39.9,40,40.1,59.9,60,60.1])test('strict snap threshold '+meters,()=>{
 const r=compare([snap('A',meters)]);assert.equal(r.badSnapDiagnostics.length,meters>40?1:0);assert.equal(r.hardBadSnapOwners.has('A'),meters>60);
});
for(const owner of ['START','END','UNKNOWN','A'])test('owner '+owner,()=>assert.equal(compare([snap(owner,100)]).hardBadSnapOwners.has(owner),owner!=='START'&&owner!=='END'));
test('owner insertion order and advisory order retain original references',()=>{const rows=[snap('B',100),snap('A',90),snap('B',80)];const r=compare(rows);assert.deepEqual([...r.hardBadSnapOwners],['B','A']);assert.deepEqual(r.badSnapDiagnostics,rows);});
test('empty diagnostics preserve empty classifications',()=>assert.equal(compare([]).hardBadSnapOwners.size,0));
for(const value of [NaN,Infinity,-Infinity])test('numeric comparisons '+value,()=>{compare([snap('A',value)]);compare([snap('A',100)],value);});
test('actual diagnostic rounding precedes classification',()=>{
 const module={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/routing/preflightDiagnostics.ts','utf8')))(()=>({distanceMeters:()=>0}),module,module.exports);
 const rows=module.exports.buildPreflightSnapDiagnostics([0,60.04,0],3,['A']);assert.equal(rows[0].snapDistanceMeters,60);assert.equal(compare(rows).hardBadSnapOwners.size,0);
});
test('varied owners, values and thresholds match prior classifications and logs',()=>{for(let i=0;i<70;i++)compare(Array.from({length:6},(_,j)=>snap(['A','B','START','END','UNKNOWN'][(i+j)%5],39+(i*j)%40,j)),50+i%15);});
