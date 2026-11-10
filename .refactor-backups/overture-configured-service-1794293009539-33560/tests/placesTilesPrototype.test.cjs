const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};
const hoverModule={exports:{}},categoryModule={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/tileCategories.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(categoryModule.exports);
new Function('exports',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/BoundedPlaceHover.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(hoverModule.exports);
new Function('exports','require',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/PlacesTilesPrototype.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,name=>name.endsWith('tileCategories')?categoryModule.exports:hoverModule.exports);
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
 global.fetch=async(url,options={})=>{requests.push({url:new URL(url),options});return{ok:true,json:async()=>new URL(url).pathname==='/status'?{bbox:[-87,39,-85,41],category_filter_version:1,paging_version:1,text_search_version:1,scale_display_version:1,supported_icon_families:categoryModule.exports.TILE_CATEGORIES.map(([id])=>id)}:{features:[{attributes:{gers_id:'area',confidence:null},geometry:{x:-86,y:40}}],exceededTransferLimit:false}}};
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
test('all modern families validate and family changes replace legacy groups without dropping quality filters',async()=>{
 const saved=global.fetch,requests=[];
 global.fetch=async(url,options={})=>{requests.push(new URL(url));return{ok:true,json:async()=>new URL(url).pathname==='/status'?{bbox:[-87,39,-85,41],category_filter_version:1,paging_version:1,text_search_version:1,scale_display_version:1,supported_icon_families:categoryModule.exports.TILE_CATEGORIES.map(([id])=>id)}:{features:[]}}};
 try{const h=setup(async()=>({features:[]}));h.p.host.sourceReady=()=>{};
 await h.p.start('https://localhost:3444/style.json?group=education&min_confidence=0.75&hide_closed=1','https://localhost:3444/query?group=education&min_confidence=0.75&hide_closed=1',true);
 await h.p.setFamily('restaurant');await h.p.queryArea([-87,39,-85,41],new AbortController().signal);const request=requests.at(-1);assert.equal(request.searchParams.get('family'),'restaurant');assert.equal(request.searchParams.has('group'),false);assert.equal(request.searchParams.get('min_confidence'),'0.75');assert.equal(request.searchParams.get('hide_closed'),'1');
 await assert.rejects(h.p.setFamily('not-a-category'),/Invalid/);await h.p.setFamily('all');await h.p.queryArea([-87,39,-85,41],new AbortController().signal);assert.equal(requests.at(-1).searchParams.has('family'),false);h.p.stop();
 }finally{global.fetch=saved}
});
test('widget metadata handshake rejects a stale server rather than silently ignoring category filters',async()=>{
 const saved=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({bbox:[-87,39,-85,41]})});
 try{const h=setup(async()=>({features:[]}));h.p.host.sourceReady=()=>{};await assert.rejects(h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true),/Restart the updated/);assert(!h.events.includes('add'))}finally{global.fetch=saved}
});

test('panel quality changes preserve family and apply equally to tiles, clicks and area results',async()=>{
 const h=setup(async()=>({features:[]})),requests=[],original=global.fetch;
 global.fetch=async url=>{requests.push(new URL(url));return{ok:true,json:async()=>({features:[]})}};
 try{
  await h.p.start('https://localhost:3444/style.json?family=cafe','https://localhost:3444/query?family=cafe',true);
  await h.p.setQuality(.73,true);assert.deepEqual(h.p.quality,{minimum:.73,hideClosed:true});
  assert.equal(new URL(h.p.source.style).searchParams.get('min_confidence'),'0.73');
  await h.p.queryArea([-87,39,-85,41],new AbortController().signal);await h.p.resolve({x:0,y:0});
  for(const url of requests){assert.equal(url.searchParams.get('family'),'cafe');assert.equal(url.searchParams.get('min_confidence'),'0.73');assert.equal(url.searchParams.get('hide_closed'),'1')}
  await assert.rejects(h.p.setQuality(1.1,false),/Invalid/);
  await h.p.setQuality(null,false);assert.deepEqual(h.p.quality,{minimum:null,hideClosed:false});
  assert(!new URL(h.p.source.style).searchParams.has('min_confidence'));assert(!new URL(h.p.source.details).searchParams.has('hide_closed'));
 }finally{h.p.stop();global.fetch=original}
});

 test('area query forwards the image or map distance origin to the server',async()=>{
 const h=setup(async()=>({features:[]})),original=global.fetch;let payload;
 global.fetch=async(url,options)=>{payload=JSON.parse(options.body);return{ok:true,json:async()=>({features:[]})}};
 try{await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);await h.p.queryArea([-87,39,-85,41],new AbortController().signal,{lon:-86.13,lat:39.77});assert.deepEqual(payload.origin,{lon:-86.13,lat:39.77});}finally{h.p.stop();global.fetch=original}
 });

test('replacement retains the committed source until preparation succeeds and preserves selection',async()=>{
 const h=setup(async()=>({features:[]}));h.p.host.sharedClicks=true;
 const changes=[],loading=[];h.p.host.sourceChanging=preserve=>changes.push(preserve);h.p.host.loading=active=>loading.push(active);
 await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);
 const original=h.p.layer;let release;h.p.host.modules.VectorTileLayer=class{load(){return new Promise(r=>release=r)}destroy(){}};
 const pending=h.p.setFamily('cafe');assert.equal(h.p.layer,original);assert.equal(h.p.changing,true);assert.equal(h.events.includes('remove'),false);
 release();await pending;assert.notEqual(h.p.layer,original);assert.equal(changes.at(-1),true);assert.equal(h.p.changing,false);assert.equal(loading.at(-1),false);h.p.stop();
});
test('failed filter preparation retains working tiles and the committed filter',async()=>{
 const h=setup(async()=>({features:[]}));h.p.host.sharedClicks=true;await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);
 const original=h.p.layer,source=h.p.source;h.p.host.modules.VectorTileLayer=class{load(){return Promise.reject(Error('offline'))}destroy(){}};
 await assert.rejects(h.p.setFamily('cafe'),/offline/);assert.equal(h.p.layer,original);assert.equal(h.p.source,source);assert.equal(h.p.visible,true);assert.equal(h.p.changing,false);assert.equal(h.errors.at(-1).code,'filter');h.p.stop();
});
test('a superseded replacement cannot overwrite a newer filter',async()=>{
 const h=setup(async()=>({features:[]}));h.p.host.sharedClicks=true;await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);
 const releases=[],destroyed=[];h.p.host.modules.VectorTileLayer=class{constructor(p){this.url=p.url}load(){return new Promise(r=>releases.push(r))}destroy(){destroyed.push(this.url)}};
 const first=h.p.setFamily('cafe'),second=h.p.setFamily('education');releases[1]();await second;releases[0]();await first;
 assert.equal(new URL(h.p.source.style).searchParams.get('family'),'education');assert(destroyed.some(url=>url.includes('family=cafe')));h.p.stop();
});
test('complete results at both exact caps remain usable; truncation is explicit',async()=>{
 const h=setup(async()=>({features:Array.from({length:32},(_,i)=>({attributes:{gers_id:String(i)},geometry:{x:1,y:1}})),exceededTransferLimit:false}));
 await start(h);const hit=await h.p.resolve({x:0,y:0});assert.equal(hit.candidates.length,32);assert.equal(h.errors.length,0);h.p.stop();
 const saved=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({features:Array.from({length:200},()=>({})),exceededTransferLimit:false})});
 try{await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);assert.equal((await h.p.queryArea([0,0,1,1],new AbortController().signal)).limited,false);h.p.stop()}finally{global.fetch=saved}
});
test('selection eligibility follows committed family, confidence and closure filters',async()=>{
 const h=setup(async()=>({features:[]}));h.p.host.sharedClicks=true;await h.p.start('https://localhost:3444/style.json?family=cafe&min_confidence=0.75&hide_closed=1','https://localhost:3444/query?family=cafe&min_confidence=0.75&hide_closed=1',true);
 const place={group:'cafe',confidence:.8,operatingStatus:'open'};assert.equal(h.p.matches(place),true);for(const changed of [{group:'education'},{confidence:null},{confidence:.5},{operatingStatus:'permanently_closed'}])assert.equal(h.p.matches({...place,...changed}),false);assert.equal(h.p.matches({...place,operatingStatus:null}),true);h.p.stop();
});
test('native query carries rendering zoom and paging carries offset with the frozen origin',async()=>{
 const saved=global.fetch,requests=[];global.fetch=async(url,options)=>{requests.push({url:new URL(url),payload:JSON.parse(options.body)});return{ok:true,json:async()=>({features:[],exceededTransferLimit:false,offset:requests.at(-1).payload.offset})}};
 try{const h=setup(async()=>({features:[]}));h.p.host.view.zoom=14.8;h.p.host.sharedClicks=true;await h.p.start('https://localhost:3444/style.json','https://localhost:3444/query',true);
 await h.p.resolve({x:0,y:0});assert.equal(requests.at(-1).payload.zoom,14);
 await h.p.queryArea([0,0,1,1],new AbortController().signal,{lon:.2,lat:.3},200);assert.equal(requests.at(-1).payload.offset,200);assert.deepEqual(requests.at(-1).payload.origin,{lon:.2,lat:.3});
 await assert.rejects(h.p.queryArea([0,0,1,1],new AbortController().signal,null,1),/offset/);h.p.stop();}finally{global.fetch=saved}
});
