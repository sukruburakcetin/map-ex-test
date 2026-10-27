const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function load(rel){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src',rel+'.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}
const {TileSequenceHighlights,matchesTileFilter,clipTilePath}=load('features/coverage/TileSequenceHighlights');
const {turboTileStyle}=load('utils/turboCoverageUtils');
const style=(filters={})=>turboTileStyle('test',filters,false,[],[]).layers;
const feature=(id,source,coords,extra={})=>({extent:4096,properties:{[source==='image'?'sequence_id':'id']:id,captured_at:Date.UTC(2024,0,1),...extra},loadGeometry:()=>coords});
function setup(options={}){
 const state={selected:[],hover:[],loads:0,decodes:0,created:0,disposed:0,warnings:[],tiles:[[8192,8192,14]],zoom:18};
 const features={sequence:[feature('A','sequence',[[{x:100,y:100},{x:200,y:200}]]),feature('B','sequence',[[{x:300,y:100},{x:400,y:200}]])],image:[feature('A','image',[[{x:100,y:100}]]),feature('B','image',[[{x:300,y:100}]]),feature('A','image',[[{x:-1,y:100}]])]};
 const owner=new TileSequenceHighlights();const host={styles:options.styles||style(),tiles:()=>state.tiles,zoom:()=>state.zoom,load:async(tile,signal)=>{state.loads++;return options.load?options.load(tile,signal):new ArrayBuffer(1)},decode:()=>{state.decodes++;return{layers:Object.fromEntries(Object.entries(features).map(([key,f])=>[key,{length:f.length,feature:i=>f[i]}]))}},create:p=>{state.created++;return p},replace:(role,g)=>state[role]=g.slice(),dispose:()=>state.disposed++,warn:e=>state.warnings.push(e)};owner.bind(host);return{owner,state,features,host};
}
test('only selected native line and canonical point turn blue; no tile renderer is involved',async()=>{
 const {owner,state,features}=setup();await owner.select('A');assert.equal(state.selected.length,2);assert.equal(state.hover.length,0);assert(state.selected.every(g=>g.attributes.sequenceId==='A'));assert.deepEqual(state.selected[0].symbol.color,[0,0,255,.8]);assert.equal(state.selected[0].symbol.width,1.5);assert.equal(state.selected[1].symbol.size,3.75);assert.equal(state.selected[1].symbol.outline.width,.75);assert.deepEqual(features.sequence[0].loadGeometry(),[[{x:100,y:100},{x:200,y:200}]]);
});
test('hover stays neon green, uses native lines, and caches geometry across image changes',async()=>{
 const {owner,state}=setup();await owner.select('A');const selected=state.selected.slice();await owner.hover('A');assert.deepEqual(state.hover[0].symbol.color,[0,255,136,1]);assert.equal(state.hover[0].symbol.width,4.5);assert.equal(state.hover.length,1);assert.equal(state.loads,1);assert.equal(state.decodes,1);assert.equal(state.selected[0],selected[0]);await owner.hover('B');await owner.hover('A');assert.equal(state.loads,2);assert.equal(state.decodes,2);await owner.hover(null);assert.equal(state.hover.length,0);assert.equal(state.selected[0],selected[0]);
});
test('filter-hidden native features are not resurrected by either overlay',async()=>{
 const {owner,state}=setup({styles:style({organizationId:12})});await owner.select('A');await owner.hover('A');assert.equal(state.selected.length,0);assert.equal(state.hover.length,0);
});
test('zoom changes remove circles below their native visibility threshold',async()=>{
 const {owner,state}=setup();await owner.select('A');state.zoom=13;state.tiles=[[4096,4096,13]];await owner.refresh();assert.equal(state.selected.length,1);assert.equal(state.selected[0].geometry.type,'polyline');
});
test('rapid targets and mouseout cancel late completions',async()=>{
 const resolves=[];const {owner,state}=setup({load:()=>new Promise(r=>resolves.push(r))});const a=owner.hover('A');const b=owner.hover('B');resolves[1](new ArrayBuffer(1));await b;assert.equal(state.hover[0].attributes.sequenceId,'B');resolves[0](new ArrayBuffer(1));await a;assert.equal(state.hover[0].attributes.sequenceId,'B');owner.cancelPending();const c=owner.hover('A');await owner.hover(null);resolves[2](new ArrayBuffer(1));await c;assert.equal(state.hover.length,0);
});
test('view disposal cancels pending work and releases layers and caches',async()=>{
 let resume;const {owner,state}=setup({load:()=>new Promise(r=>resume=r)});const task=owner.select('A');owner.detach();resume(new ArrayBuffer(1));await task;assert.equal(state.disposed,1);assert.equal(state.selected.length,0);assert.equal(state.decodes,0);
});
test('tile clipping removes duplicate buffered segments without connecting paths',()=>{
 assert.deepEqual(clipTilePath([{x:-10,y:10},{x:20,y:10},{x:50,y:10}],40),[[{x:0,y:10},{x:20,y:10},{x:40,y:10}]]);assert.deepEqual(clipTilePath([{x:-10,y:10},{x:-5,y:30}],40),[]);assert.deepEqual(clipTilePath([{x:10,y:-20},{x:10,y:60}],40),[[{x:10,y:0},{x:10,y:40}]]);
});
test('native filter evaluator handles quality, year, pano and missing values and fails closed',()=>{
 for(const [filter,props,result] of [[['all',['>=','quality_score',.45],['<','quality_score',.7]],{quality_score:.5},true],[['any',['!has','quality_score'],['<','quality_score',.1]],{},true],[['==','is_pano',true],{is_pano:1},false],[['unknown','id','A'],{id:'A'},false]])assert.equal(matchesTileFilter(filter,props),result);
});
test('failed work is retryable and never clears or changes unrelated base coverage',async()=>{
 let fail=true;const {owner,state}=setup({load:async()=>{if(fail)throw Error('offline');return new ArrayBuffer(1)}});await owner.select('A');assert.equal(state.warnings.length,1);fail=false;await owner.select('A');assert.equal(state.selected.length,2);
});

test('cached pointer geometry is displayed before a later visible tile finishes loading',async()=>{
 let resume;const {owner,state}=setup({load:tile=>tile[0]===8192?Promise.resolve(new ArrayBuffer(1)):new Promise(r=>resume=r)});
 await owner.select('A');const existing=state.selected[0];state.tiles.push([8193,8192,14]);const work=owner.refresh();await new Promise(r=>setImmediate(r));assert.equal(state.selected[0],existing);assert.equal(state.selected.length,2);resume(new ArrayBuffer(0));await work;assert.equal(state.selected[0],existing);
});
test('geometry cache evicts old targets instead of growing with continued exploration',async()=>{
 const {owner,state}=setup();await owner.select('A');for(let i=0;i<65;i++)await owner.select('uncached-'+i);const before=state.loads;await owner.select('A');assert.equal(state.loads,before+1);assert.equal(state.selected.length,2);
});
