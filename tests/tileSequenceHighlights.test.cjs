const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
function load(rel){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src',rel+'.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}
const {TileSequenceHighlights,matchesTileFilter,clipTilePath}=load('features/coverage/TileSequenceHighlights');
const {turboTileStyle}=load('utils/turboCoverageUtils');
const style=(filters={})=>turboTileStyle('test',filters,false,[],[]).layers;
const feature=(id,source,coords,extra={})=>({extent:4096,properties:{[source==='image'?'sequence_id':'id']:id,captured_at:Date.UTC(2024,0,1),...extra},loadGeometry:()=>coords});
function setup(options={}){
 const state={selected:[],hover:[],loads:0,decodes:0,created:0,disposed:0,warnings:[],commits:[],tiles:[[8192,8192,14]],zoom:18};
 const features={sequence:[feature('A','sequence',[[{x:100,y:100},{x:200,y:200}]]),feature('B','sequence',[[{x:300,y:100},{x:400,y:200}]])],image:[feature('A','image',[[{x:100,y:100}]]),feature('B','image',[[{x:300,y:100}]]),feature('A','image',[[{x:-1,y:100}]])]};
 const owner=new TileSequenceHighlights();const host={styles:options.styles||style(),tiles:()=>state.tiles,zoom:()=>state.zoom,load:async(tile,signal)=>{state.loads++;return options.load?options.load(tile,signal):new ArrayBuffer(1)},decode:()=>{state.decodes++;return{layers:Object.fromEntries(Object.entries(features).map(([key,f])=>[key,{length:f.length,feature:i=>f[i]}]))}},create:p=>{state.created++;return p},replace:(role,g)=>{state[role]=g.slice();state.commits.push({role,graphics:g.slice()})},dispose:()=>state.disposed++,warn:e=>state.warnings.push(e)};owner.bind(host);return{owner,state,features,host};
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

test('loading an unrelated hover never replaces or shrinks a completed multi-tile blue selection',async()=>{
 let resume,hold=false;const {owner,state}=setup({load:tile=>hold&&tile[0]===8193?new Promise(r=>resume=r):Promise.resolve(new ArrayBuffer(1))});
 state.tiles.push([8193,8192,14]);await owner.select('A');const selected=state.selected.slice(),commits=state.commits.filter(c=>c.role==='selected').length;
 assert.equal(selected.length,4);hold=true;const hover=owner.hover('B');await new Promise(r=>setImmediate(r));
 assert.equal(state.hover.length,1);assert.deepEqual(state.selected,selected);assert.equal(state.commits.filter(c=>c.role==='selected').length,commits);
 resume(new ArrayBuffer(1));await hover;assert.equal(state.hover.length,2);assert.deepEqual(state.selected,selected);assert.equal(state.commits.filter(c=>c.role==='selected').length,commits);
});
test('extending a viewport retains every displayed route fragment while another tile is pending',async()=>{
 let resume;const {owner,state}=setup({load:tile=>tile[0]===8194?new Promise(r=>resume=r):Promise.resolve(new ArrayBuffer(1))});
 state.tiles.push([8193,8192,14]);await owner.select('A');const selected=state.selected.slice();state.tiles.push([8194,8192,14]);
 const work=owner.refresh();await new Promise(r=>setImmediate(r));assert.deepEqual(state.selected,selected);resume(new ArrayBuffer(1));await work;assert.equal(state.selected.length,6);assert(selected.every(g=>state.selected.includes(g)));
});
test('selection-only cancellation preserves a hover subscriber to the same pending geometry',async()=>{
 let resume,producerSignal;const {owner,state}=setup({load:(tile,signal)=>{producerSignal=signal;return new Promise(r=>resume=r)}});
 const selected=owner.select('A'),hover=owner.hover('A');assert.equal(state.loads,1);owner.cancelPending('selected');assert.equal(producerSignal.aborted,false);
 resume(new ArrayBuffer(1));await Promise.all([selected,hover]);assert.equal(state.selected.length,0);assert.equal(state.hover.length,1);assert.equal(state.decodes,1);
});
test('mouseout cannot cancel a pending selection or overwrite its completed graphics',async()=>{
 const waits=[];const {owner,state}=setup({load:(tile,signal)=>new Promise(r=>waits.push({resolve:r,signal}))});
 const selected=owner.select('A'),hover=owner.hover('B');await owner.hover(null);assert.equal(waits[0].signal.aborted,false);assert.equal(waits[1].signal.aborted,true);
 waits[0].resolve(new ArrayBuffer(1));waits[1].resolve(new ArrayBuffer(1));await Promise.all([selected,hover]);assert.equal(state.selected.length,2);assert.equal(state.hover.length,0);
});
test('native role changes touch only that role and viewport refresh reuses their identities',async()=>{
 const {owner,host,state}=setup(),calls=[];host.native=(role,id)=>calls.push([role,id]);await owner.select('A');await owner.hover('B');
 assert.deepEqual(calls,[['selected','A'],['hover','B']]);await owner.hover(null);assert.deepEqual(calls.at(-1),['hover',null]);
 await owner.refresh();assert.equal(calls.filter(c=>c[0]==='selected').length,1);assert.equal(state.loads,0);assert.equal(state.created,0);
});

test('hover-only viewport refresh does not restart canceled selection work or mutate blue graphics',async()=>{
 const waits=[];let hold=false;const {owner,state}=setup({load:(tile,signal)=>hold?new Promise(r=>waits.push({resolve:r,signal})):Promise.resolve(new ArrayBuffer(1))});
 await owner.select('A');await owner.hover('B');const selected=state.selected.slice();state.tiles.push([8193,8192,14]);hold=true;
 const selection=owner.refresh('selected');await new Promise(r=>setImmediate(r));assert.equal(waits.length,1);owner.cancelPending('selected');assert.equal(waits[0].signal.aborted,true);
 const commits=state.commits.filter(c=>c.role==='selected').length,hover=owner.refresh('hover');await new Promise(r=>setImmediate(r));assert.equal(waits.length,2);
 assert.deepEqual(state.selected,selected);assert.equal(state.commits.filter(c=>c.role==='selected').length,commits);
 waits[0].resolve(new ArrayBuffer(1));waits[1].resolve(new ArrayBuffer(1));await Promise.all([selection,hover]);
 assert.deepEqual(state.selected,selected);assert.equal(state.commits.filter(c=>c.role==='selected').length,commits);assert.equal(state.hover.length,2);assert.equal(state.loads,4);
});

test('different sequence targets reuse one tile membership scan and inspect only matching features',async()=>{
 const {owner,host,state,features}=setup(),buffer=new ArrayBuffer(64);let propertiesRead=0,geometriesRead=0;
 host.load=async()=>{state.loads++;return buffer};
 host.decode=()=>{state.decodes++;return{layers:Object.fromEntries(Object.entries(features).map(([name,items])=>[name,{length:items.length,feature:i=>({
   extent:items[i].extent,get properties(){propertiesRead++;return items[i].properties},loadGeometry(){geometriesRead++;return items[i].loadGeometry()},
 })}]))}};
 await owner.select('A');const firstReads=propertiesRead;assert.equal(firstReads,8);assert.equal(geometriesRead,3);
 await owner.hover('B');assert.equal(propertiesRead-firstReads,2,'warm tile must inspect B matches only, not rescan every A feature');assert.equal(state.hover.length,1);
 const before=propertiesRead;await owner.select('B');assert.equal(propertiesRead,before,'selection reuses geometry prepared for the same hover target');assert.equal(state.selected.length,2);assert.equal(state.warnings.length,0);
});

test('a supplied membership index serves highlights without scanning unrelated tile features',async()=>{
 const {owner,host,state,features}=setup(),buffer=new ArrayBuffer(64);let accessed=[];
 host.load=async()=>buffer;
 host.index=async()=>({estimatedBytes:64,indices:(source,id)=>new Uint32Array(id==='B'?[source==='sequence'?1:1]:[])});
 host.decode=()=>({layers:Object.fromEntries(Object.entries(features).map(([name,items])=>[name,{length:items.length,feature:i=>{accessed.push([name,i]);assert.equal(i,1);return items[i]}}]))});
 await owner.select('B');assert.deepEqual(accessed,[['sequence',1],['image',1]]);assert.equal(state.selected.length,2);assert.equal(state.warnings.length,0);
});

test('zoom-out explicitly invalidates every retained circle renderer without geometry or tile work',async()=>{
 const {owner,host,state}=setup();let resolution=156543.03392804097/2**23,assignments=0,symbols=0;
 host.resolution=()=>resolution;host.rotation=()=>0;host.symbol=p=>{symbols++;return p;};
 host.create=p=>{state.created++;let symbol=p.symbol;const g={...p,renderedSize:symbol.size,renderedOutline:symbol.outline?.width};Object.defineProperty(g,'symbol',{get:()=>symbol,set:value=>{symbol=value;g.renderedSize=value.size;g.renderedOutline=value.outline?.width;assignments++;}});return g;};
 state.tiles.push([8193,8192,14]);await owner.select('A');const retained=state.selected.slice(),circles=retained.filter(g=>g.geometry.type==='point'),initial=circles[0].renderedSize,counts=[state.loads,state.decodes,state.created,state.commits.length];assert.equal(circles.length,2);const previousSymbol=circles[0].symbol;
 resolution*=64;owner.refreshSymbols();assert(circles.every(g=>g.renderedSize<initial));assert(circles.every(g=>g.symbol===circles[0].symbol));assert.notEqual(circles[0].symbol,previousSymbol);assert.equal(previousSymbol.size,initial,'old symbols remain immutable');assert.equal(assignments,2);assert.equal(symbols,2);assert.deepEqual(state.selected,retained);assert.deepEqual([state.loads,state.decodes,state.created,state.commits.length],counts);
 owner.refreshSymbols();assert.equal(assignments,2);assert.equal(symbols,2,'same camera does not allocate more symbols');resolution/=64;owner.refreshSymbols();assert(circles.every(g=>g.renderedSize===initial));assert.equal(assignments,4);owner.detach();
});

test('zoom-out resizes old and newly committed fragments while a later tile is pending',async()=>{
 let resolve;const {owner,host,state}=setup({load:tile=>tile[0]===8194?new Promise(r=>resolve=r):Promise.resolve(new ArrayBuffer(1))});let resolution=156543.03392804097/2**23;host.resolution=()=>resolution;await owner.select('A');const old=state.selected.find(g=>g.geometry.type==='point'),initial=old.symbol.size;
 state.tiles.push([8193,8192,14],[8194,8192,14]);const work=owner.refresh();await new Promise(r=>setImmediate(r));const counts=[state.loads,state.decodes,state.created];resolution*=32;owner.refreshSymbols();assert(old.symbol.size<initial);const visible=state.selected.filter(g=>g.geometry.type==='point');assert.equal(visible.length,2);assert(visible.every(g=>g.symbol.size===old.symbol.size));assert.deepEqual([state.loads,state.decodes,state.created],counts);resolve(new ArrayBuffer(1));await work;assert(state.selected.filter(g=>g.geometry.type==='point').every(g=>g.symbol.size===old.symbol.size));
});
