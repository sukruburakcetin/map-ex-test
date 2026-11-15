const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function load(rel){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src',rel+'.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}
const {NativeTileHighlightCache}=load('features/coverage/NativeTileHighlightCache'),{turboTileStyle}=load('utils/turboCoverageUtils');
function setup(filters={}){const layers=[],destroyed=[],base=turboTileStyle('tiles',filters,false,[],[]);const cache=new NativeTileHighlightCache({create:(style,id)=>({style,id,visible:true,destroy(){destroyed.push(this)}}),attach:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},base);return{cache,layers,destroyed,base}}
test('3D selection preserves native paints, filters and dimensions except blue color',()=>{
 const {cache,layers,base}=setup({organizationId:12,qualityActive:true}),before=structuredClone(base);cache.show('selected','A');const selected=layers[0].style.layers;assert.equal(selected.length,8);
 for(const original of base.layers.filter(s=>s['source-layer']!=='overview')){const next=selected.find(s=>s.id===original.id+'-selected');const prop=original.type==='line'?'line-color':'circle-color';assert.deepEqual({...next.paint,[prop]:original.paint[prop]},original.paint);assert.deepEqual(next.filter,['all',original.filter,['==',original.type==='line'?'id':'sequence_id','A']]);}
 assert.deepEqual(base,before);
});
test('3D hover is green and line-only, and never recolors base or selection',()=>{
 const {cache,layers,base}=setup();cache.show('selected','A');const selected=layers[0];cache.show('hover','B');const hover=layers[1];assert.equal(hover.style.layers.length,1);assert.equal(hover.style.layers[0].paint['line-color'],'#00ff88');assert.equal(hover.style.layers[0].paint['line-width'],6);assert.equal(selected.visible,true);assert.equal(base.layers[1].paint['line-color'],'#35AF6D');cache.show('hover',null);assert.equal(hover.visible,false);assert.equal(selected.visible,true);
});
test('recent targets reuse identical fixed-style layers without loadStyle or style mutations',()=>{
 const {cache,layers}=setup();cache.show('selected','A');const first=layers[0],style=structuredClone(first.style);cache.show('selected','B');cache.show('selected','A');assert.equal(layers.length,2);assert.equal(first.visible,true);assert.equal(layers[1].visible,false);assert.deepEqual(first.style,style);
});
test('GPU cache is bounded independently per role, with exact cleanup on eviction and view disposal',()=>{
 const {cache,layers,destroyed}=setup();for(const role of ['selected','hover'])for(const id of ['A','B','C'])cache.show(role,id);assert.equal(layers.length,4);assert.equal(destroyed.length,2);assert.equal(layers.filter(l=>l.visible).length,2);cache.dispose();assert.equal(layers.length,0);assert.equal(destroyed.length,6);cache.dispose();assert.equal(destroyed.length,6);
});
test('failed attachment disposes the unowned renderer and permits retry',()=>{
 let fail=true,destroyed=0;const cache=new NativeTileHighlightCache({create:()=>({visible:true,destroy:()=>destroyed++}),attach:()=>{if(fail)throw Error('attach')},remove:()=>{}},turboTileStyle('tiles',{},false,[],[]));assert.throws(()=>cache.show('selected','A'),/attach/);assert.equal(destroyed,1);fail=false;cache.show('selected','A');cache.dispose();assert.equal(destroyed,2);
});
