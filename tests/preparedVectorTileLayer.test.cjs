const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const m={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/coverage/PreparedVectorTileLayer.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);
const {prepareVectorTileLayer}=m.exports;
function setup(){
 let resume,reject;const held=new Promise((a,b)=>{resume=a;reject=b});const previous={id:'displayed',visible:true,style:'original'},candidate={id:'pending'};const events=[];
 const host={create(){events.push('create');return candidate},attach(){events.push('attach')},ready(layer,signal){events.push('prepare');return held},commit(layer,old){assert.equal(old,previous);events.push('commit');previous.visible=false;candidate.visible=true},discard(){events.push('discard')}};
 return {host,previous,candidate,events,resume,reject};
}
test('displayed tiles are untouched until replacement readiness resolves',async()=>{
 const h=setup(),task=prepareVectorTileLayer(h.host,{},h.previous,new AbortController().signal);
 assert.deepEqual(h.events,['create','attach','prepare']);assert.equal(h.previous.visible,true);assert.equal(h.previous.style,'original');
 h.resume();assert.equal(await task,h.candidate);assert.deepEqual(h.events,['create','attach','prepare','commit']);
});
test('failed preparation discards only the candidate and keeps displayed tiles',async()=>{
 const h=setup(),task=prepareVectorTileLayer(h.host,{},h.previous,new AbortController().signal);h.reject(new Error('tile failure'));
 await assert.rejects(task,/tile failure/);assert.equal(h.previous.visible,true);assert.equal(h.events.at(-1),'discard');assert(!h.events.includes('commit'));
});
test('superseded preparation cannot replace displayed tiles',async()=>{
 const h=setup(),controller=new AbortController(),task=prepareVectorTileLayer(h.host,{},h.previous,controller.signal);
 controller.abort();h.resume();await assert.rejects(task,{name:'AbortError'});assert.equal(h.previous.visible,true);assert.equal(h.events.at(-1),'discard');
});
test('already-cancelled work creates no renderer',async()=>{
 const h=setup(),controller=new AbortController();controller.abort();await assert.rejects(prepareVectorTileLayer(h.host,{},h.previous,controller.signal),{name:'AbortError'});assert.deepEqual(h.events,[]);
});
test('attachment and commit failures dispose the uncommitted candidate',async()=>{
 for(const stage of ['attach','commit']){const h=setup();h.host[stage]=()=>{throw new Error(stage)};const task=prepareVectorTileLayer(h.host,{},h.previous,new AbortController().signal);h.resume();await assert.rejects(task,new RegExp(stage));assert.equal(h.previous.visible,true);assert.equal(h.events.at(-1),'discard')}
});
