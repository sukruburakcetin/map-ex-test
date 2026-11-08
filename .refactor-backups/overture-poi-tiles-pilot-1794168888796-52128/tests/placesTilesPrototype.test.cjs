const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
const hoverModule={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/BoundedPlaceHover.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(hoverModule.exports);
new Function('exports','require',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/PlacesTilesPrototype.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,()=>hoverModule.exports);
function setup(query){
 const events=[],chosen=[];let watcher;
 class Tiles{load(){return Promise.resolve()}destroy(){events.push('destroy-tiles')}}
 class Service{fields=[{name:'gers_id'}];load(){return Promise.resolve()}queryFeatures(q,o){events.push(q);return query(q,o)}destroy(){events.push('destroy-service')}}
 const view={ready:true,stationary:true,map:{add(){events.push('add')},remove(){events.push('remove')}},watch(_,fn){watcher=fn;return{remove(){}}},on(){return{remove(){events.push('remove-click')}}},toMap:p=>({...p,spatialReference:{wkid:3857}}),toScreen:p=>p};
 const errors=[];const p=new m.exports.PlacesTilesPrototype({view,modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected:a=>chosen.push(a.gers_id),error:e=>errors.push(e)});
 return {p,events,chosen,errors,move:()=>watcher(false)};
}
const start=h=>h.p.start('https://example.org/VectorTileServer/resources/styles/root.json','https://example.org/FeatureServer/0');
test('native tiles are attached and click query is bounded and unfiltered',async()=>{
 const h=setup(async()=>({features:[{attributes:{gers_id:'a'},geometry:{x:1,y:2}}]}));await start(h);await h.p.pick({x:0,y:0});
 assert.deepEqual(h.chosen,['a']);const q=h.events.find(e=>e.num);assert.equal(q.num,32);assert.equal(q.where,'1=1');h.p.stop();assert(h.events.includes('remove-click'));
});
test('truncated candidates never select an arbitrary nearest place',async()=>{
 const h=setup(async()=>({exceededTransferLimit:true,features:[{attributes:{gers_id:'a'},geometry:{x:0,y:0}}]}));await start(h);await h.p.pick({x:0,y:0});assert.deepEqual(h.chosen,[]);assert.equal(h.errors.length,1);h.p.stop();
});
test('moving or stopping discards an outstanding click',async()=>{
 for(const action of ['move','stop']){let resolve;const h=setup(()=>new Promise(r=>resolve=r));await start(h);const pending=h.p.pick({x:0,y:0});action==='move'?h.move():h.p.stop();resolve({features:[{attributes:{gers_id:'late'},geometry:{x:0,y:0}}]});await pending;assert.deepEqual(h.chosen,[]);h.p.stop();}
});
test('failed service preparation removes resources without attaching tiles',async()=>{
 const h=setup(async()=>({features:[]}));await assert.rejects(h.p.start('http://example.org/style.json','https://example.org/FeatureServer/0'),/HTTPS/);assert(!h.events.includes('add'));
});
test('stopping during service preparation prevents later layer attachment',async()=>{
 let release;const events=[];
 class Tiles{load(){return new Promise(r=>release=r)}destroy(){events.push('destroy')}}
 class Service{fields=[{name:'gers_id'}];load(){return Promise.resolve()}destroy(){}}
 const p=new m.exports.PlacesTilesPrototype({view:{ready:true,map:{add(){events.push('add')},remove(){}}},modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected(){},error(){}});
 const pending=p.start('https://example.org/style.json','https://example.org/FeatureServer/0');p.stop();release();await pending;assert.deepEqual(events,['destroy']);
});
test('service load failure destroys the candidate layer',async()=>{
 const events=[];
 class Tiles{load(){return Promise.resolve()}destroy(){events.push('destroy')}}
 class Service{load(){return Promise.reject(new Error('offline'))}destroy(){events.push('service-destroy')}}
 const p=new m.exports.PlacesTilesPrototype({view:{ready:true,map:{add(){events.push('add')},remove(){}}},modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected(){},error(){}});
 await assert.rejects(p.start('https://example.org/style.json','https://example.org/FeatureServer/0'),/offline/);assert.deepEqual(events,['destroy','service-destroy']);
});
test('local adapter posts a bounded geometry query and constructs SDK Points',async()=>{
 const originalFetch=global.fetch;let payload;
 global.fetch=async(url,options)=>{payload=JSON.parse(options.body);return{ok:true,json:async()=>({features:[{attributes:{gers_id:'local'},geometry:{x:1,y:2}}]})}};
 try{
  const h=setup(async()=>{throw Error('FeatureLayer must not query local data')});
  // The adapter constructs Points before calling view.toScreen.
  h.p.host.modules.Point=class{constructor(properties){Object.assign(this,properties)}};
  await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);
  await h.p.pick({x:0,y:0});assert(payload.geometry);assert.deepEqual(h.chosen,['local']);h.p.stop();
 }finally{global.fetch=originalFetch}
});
test('local adapter rejects non-loopback endpoints',async()=>{
 const h=setup(async()=>({features:[]}));await assert.rejects(h.p.start('https://example.org/style.json','https://example.org/query',true),/loopback/);
});
test('quality control changes tile and query URLs together, validates input and removes its UI',async()=>{
 const saved=global.document;
 function element(){return{children:[],style:{},validity:{badInput:false},value:'',appendChild(child){this.children.push(child)},setAttribute(){},setCustomValidity(message){this.message=message},reportValidity(){this.reported=true},remove(){this.removed=true}}}
 global.document={createElement:element};
 try{
  const h=setup(async()=>({features:[]})),calls=[],panels=[];
  h.p.host.view.ui={add:panel=>panels.push(panel),remove:panel=>assert.equal(panel,panels.at(-1))};
  h.p.start=async(...args)=>calls.push(args);
  h.p.addQualityControls('https://localhost:3444/style.json','https://localhost:3444/query');
  let panel=panels.at(-1),select=panel.children[0].children[0],custom=panel.children[1],apply=panel.children[2];
  select.value='0.75';select.onchange();
  assert.equal(new URL(calls[0][0]).searchParams.get('min_confidence'),'0.75');assert.equal(new URL(calls[0][1]).searchParams.get('min_confidence'),'0.75');
  custom.value='1.2';apply.onclick();assert.equal(calls.length,1);assert(custom.reported);
  h.p.stop();assert(panel.removed);
  h.p.addQualityControls(calls[0][0],calls[0][1]);
  panel=panels.at(-1);select=panel.children[0].children[0];select.value='';select.onchange();
  assert.equal(new URL(calls[1][0]).searchParams.has('min_confidence'),false);assert.equal(new URL(calls[1][1]).searchParams.has('min_confidence'),false);
  h.p.stop();
  h.p.addQualityControls('https://localhost:3444/style.json?min_confidence=0.75','https://localhost:3444/query?min_confidence=0.75');
  panel=panels.at(-1);select=panel.children[0].children[0];const closed=panel.children[3].children[0];
  closed.checked=true;closed.onchange();
  for(const url of calls.at(-1).slice(0,2)){assert.equal(new URL(url).searchParams.get('min_confidence'),'0.75');assert.equal(new URL(url).searchParams.get('hide_closed'),'1')}
  select.value='';select.onchange();
  for(const url of calls.at(-1).slice(0,2)){assert.equal(new URL(url).searchParams.has('min_confidence'),false);assert.equal(new URL(url).searchParams.get('hide_closed'),'1')}
  closed.checked=false;closed.onchange();
  for(const url of calls.at(-1).slice(0,2))assert.equal(new URL(url).searchParams.has('hide_closed'),false);
  h.p.stop();
 }finally{global.document=saved}
});
test('shared click mode installs no competing listener and resolves without selecting',async()=>{
 const h=setup(async()=>({features:[{attributes:{gers_id:'tile'},geometry:{x:1,y:2}}]}));
 h.p.host.sharedClicks=true;h.p.host.view.on=()=>{throw Error('Competing click listener')};
 await start(h);const hit=await h.p.resolve({x:0,y:0});assert.equal(hit.attributes.gers_id,'tile');assert.deepEqual(h.chosen,[]);
 h.p.host.busy=()=>true;assert.equal(await h.p.resolve({x:0,y:0}),null);h.p.stop();
});
test('shared dispatcher can cancel an obsolete tile pick without destroying the layer',async()=>{
 let release;const h=setup(()=>new Promise(resolve=>release=resolve));h.p.host.sharedClicks=true;await start(h);
 const pending=h.p.resolve({x:0,y:0});h.p.cancelPick();release({features:[{attributes:{gers_id:'late'},geometry:{x:0,y:0}}]});assert.equal(await pending,null);assert(!h.events.includes('remove'));h.p.stop();
});
test('area adapter and group changes preserve quality filters and invalidate the source lifecycle',async()=>{
 const saved=global.fetch,requests=[],ready=[];let changing=0;
 global.fetch=async(url,options={})=>{requests.push({url:new URL(url),options});return{ok:true,json:async()=>new URL(url).pathname==='/status'?{bbox:[-87,39,-85,41]}:{features:[{attributes:{gers_id:'area',confidence:null},geometry:{x:-86,y:40}}],exceededTransferLimit:false}}};
 try{
  const h=setup(async()=>({features:[]}));h.p.host.sourceReady=bbox=>ready.push(bbox);h.p.host.sourceChanging=()=>changing++;
  await h.p.start('https://localhost:3444/style.json?min_confidence=0.75&hide_closed=1','https://localhost:3444/query?min_confidence=0.75&hide_closed=1',true);
  assert.deepEqual(ready,[[-87,39,-85,41]]);
  await h.p.setGroup('education');assert.equal(changing,2);assert.equal(ready.length,2);
  const result=await h.p.queryArea([-87,39,-85,41],new AbortController().signal);assert.equal(result.features.length,1);
  const request=requests.at(-1);assert.equal(request.url.pathname,'/search');assert.equal(request.url.searchParams.get('group'),'education');assert.equal(request.url.searchParams.get('hide_closed'),'1');assert.equal(request.url.searchParams.get('min_confidence'),'0.75');assert.equal(JSON.parse(request.options.body).geometry.spatialReference.wkid,4326);
  h.p.stop();assert.equal(changing,3);await assert.rejects(h.p.queryArea([-87,39,-85,41],new AbortController().signal),/unavailable/);
 }finally{global.fetch=saved}
});
test('area adapter rejects oversized responses before normalization',async()=>{
 const saved=global.fetch;
 global.fetch=async()=>({ok:true,json:async()=>({features:Array.from({length:201},()=>({}))})});
 try{const h=setup(async()=>({features:[]}));await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);await assert.rejects(h.p.queryArea([0,0,1,1],new AbortController().signal),/limit/);h.p.stop()}finally{global.fetch=saved}
});
test('hover has an independent lookup slot and overlapping click candidates are retained',async()=>{
 const h=setup(async()=>({features:[{attributes:{gers_id:'a'},geometry:{x:1,y:0}},{attributes:{gers_id:'b'},geometry:{x:3,y:0}},{attributes:{gers_id:'far'},geometry:{x:100,y:100}}]}));
 h.p.hover.delay=0;await start(h);const hit=await h.p.resolveHover({x:0,y:0},new AbortController().signal);assert.deepEqual(hit.candidates.map(p=>p.attributes.gers_id),['a','b']);assert.deepEqual(h.chosen,[]);
 const clicked=await h.p.resolve({x:0,y:0});assert.equal(clicked.attributes.gers_id,'a');h.p.stop();
});
test('SDK-style candidate accessors are preserved without object spreading',async()=>{
 const feature={};Object.defineProperty(feature,'attributes',{get:()=>({gers_id:'sdk'})});Object.defineProperty(feature,'geometry',{get:()=>({x:1,y:0})});
 const h=setup(async()=>({features:[feature]}));await start(h);const hit=await h.p.resolve({x:0,y:0});assert.equal(hit.attributes.gers_id,'sdk');assert.deepEqual(hit.geometry,{x:1,y:0});h.p.stop();
});
test('native rendering and picking use tile zoom limits independently of result-list limits',async()=>{
 const saved=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({features:[{attributes:{gers_id:'native'},geometry:{x:1,y:0}}]})});
 try{const h=setup(async()=>({features:[]}));h.p.host.modules.Point=class{constructor(p){Object.assign(this,p)}};h.p.host.view.zoom=12;await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);
 assert.equal(h.p.visible,true);assert.equal((await h.p.resolve({x:0,y:0})).attributes.gers_id,'native');h.p.host.view.zoom=11;assert.equal(h.p.visible,false);assert.equal(await h.p.resolve({x:0,y:0}),null);h.p.stop();}finally{global.fetch=saved}
});
