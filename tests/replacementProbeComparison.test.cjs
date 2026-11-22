const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function compile(s){const r=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});assert.equal(r.diagnostics.filter(d=>d.category===1).length,0);return r.outputText;}
const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/routing/replacementProbeComparison.ts','utf8')))(m,m.exports);
const {chooseCaptureReplacementProbe}=m.exports;
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/replacementProbeComparison.baseline.json'));
const previous=new Function('bestReplacement','pair','trialOpportunities','trialExtraMinutes',compile(golden.body+'return bestReplacement;'));
const widget=require('./helpers/captureExecutionSource.cjs').captureExecutionSource();
const a=widget.indexOf('                  bestReplacement = chooseCaptureReplacementProbe('),b=widget.indexOf('\n                }',a);assert(a>0&&b>a);
const adapter=new Function('chooseCaptureReplacementProbe','bestReplacement','pair','trialOpportunities','trialExtraMinutes',compile(widget.slice(a,b)+'return bestReplacement;'));
const current=()=>Object.freeze({opportunities:Object.freeze([{id:'old'}]),addId:'old-add',removeId:'old-remove',extraMinutes:3,valueGain:100});
function compare(best,gain=100,extra=3){
 const pair=Object.freeze({add:Object.freeze({id:'new-add'}),remove:Object.freeze({id:'new-remove'}),valueGain:gain}),rows=Object.freeze([Object.freeze({id:'trial'})]);
 const expected=previous(best,pair,rows,extra),actual=adapter(chooseCaptureReplacementProbe,best,pair,rows,extra);
 assert.deepEqual(actual,expected);assert.equal(actual.opportunities,expected.opportunities);
 if(expected===best)assert.equal(actual,best);else {assert.notEqual(actual,best);assert.equal(actual.opportunities,rows);}
 return actual;
}
test('first accepted candidate becomes the winner',()=>compare(null));
for(const gain of [99,100,101])for(const extra of [2.999,3,3.001])test('gain '+gain+' extra '+extra,()=>compare(current(),gain,extra));
for(const n of [NaN,Infinity,-Infinity])test('nonfinite values preserve comparison semantics '+n,()=>{compare(current(),n,3);compare(current(),100,n);compare(null,n,n);});
test('exact ties retain the first candidate identity',()=>assert.equal(compare(current()).addId,'old-add'));
test('sequential accepted candidates preserve gain-first and strict time tie-breaking',()=>{
 let old=null,actual=null;
 for(let i=0;i<100;i++){const pair={add:{id:'add-'+i},remove:{id:'remove-'+i},valueGain:i%11},rows=[{id:i}],extra=i%7;old=previous(old,pair,rows,extra);actual=chooseCaptureReplacementProbe(actual,pair,rows,extra);assert.deepEqual(actual,old);assert.equal(actual.opportunities,old.opportunities);}
});
test('nonwinning candidates do not enumerate trial selections',()=>{const rows=new Proxy([],{get(target,key){if(key===Symbol.iterator)throw Error('unexpected copy');return Reflect.get(target,key);}}),best=current();assert.equal(chooseCaptureReplacementProbe(best,{valueGain:1},rows,5),best);});
test('comparison remains after quality and budget rejection gates',()=>{const guard=widget.lastIndexOf('if (trialHasBadSnap || trialHasBrokenOpportunity)',a),budget=widget.lastIndexOf('if (!trialFits)',a);assert(guard>0&&budget>guard&&budget<a);});
