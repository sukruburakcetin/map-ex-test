const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(relative){const file=path.resolve(root,relative),m={exports:{}};if(cache.has(file))return cache.get(file);cache.set(file,m.exports);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(id=>load(path.relative(root,path.resolve(path.dirname(file),id+'.ts'))),m,m.exports);return m.exports;}
const {tilePlace}=load('src/features/places/tilePlace.ts'),{ArcGISPlaces}=load('src/features/places/ArcGISPlaces.ts');
test('one selected tile record preserves missing confidence and validates coordinates and URLs',()=>{
 const point={longitude:-86.13,latitude:39.775};let place=tilePlace({gers_id:'id',confidence:null,category:null,website:'javascript:bad()'},point);
 assert.equal(place.confidence,null);assert.equal(place.website,'');assert.equal(place.name,'id');assert.equal(place.group,'other');
 assert.equal(tilePlace({gers_id:'id'},{x:1e8,y:0}),null);assert.equal(tilePlace({},point),null);
 place=tilePlace({gers_id:'id',confidence:.305,operating_status:'permanently_closed'},point);assert.equal(place.confidence,.305);assert.equal(place.operatingStatus,'permanently_closed');
});
test('tile selection uses the foundation popup and selection overlay without a service or bulk graphics',async()=>{
 const originalDocument=global.document,originalWindow=global.window;
 const element=tag=>({tag,children:[],style:{},textContent:'',appendChild(child){this.children.push(child)},replaceChildren(){this.children=[]},setAttribute(){},querySelector(){return null}});
 global.document={createElement:element,body:element('body'),activeElement:null,addEventListener(){},removeEventListener(){}};global.window={};
 const layers=[],changed=[];let created=0,services=0,queries=0;
 class Value{constructor(props){Object.assign(this,props)}}
 class Graphic extends Value{constructor(props){super(props);created++}}
 class Layer extends Value{constructor(props){super(props);this.items=[];this.graphics={length:0,reorder(){}}}addMany(items){this.items.push(...items);this.graphics.length=this.items.length}destroy(){this.destroyed=true}}
 const view={ready:true,stationary:true,map:{add:layer=>layers.push(layer),remove:layer=>layers.splice(layers.indexOf(layer),1)},watch(){return{remove(){}}},openPopup(options){this.popup={...options,visible:true}},closePopup(){this.popup=null},toScreen(){return{x:10,y:10}}};
 const owner=new ArcGISPlaces({externalSelection:true,id:'tiles',url:'',view:()=>view,modules:{GraphicsLayer:Layer,Graphic,Point:Value,FeatureLayer:class{constructor(){services++}}},geographic:x=>x,busy:()=>false,status(){},selected:place=>changed.push(place),explore:async()=>{queries++;return[]},openImagery(){}});
 try{
  const place=tilePlace({gers_id:'poi',place_name:'Selected place',category:'cafe',confidence:null},{x:-86.13,y:39.775});
  assert(owner.openExternal(place));assert.equal(owner.selection.place.id,'poi');assert.equal(view.popup.title,'Nearby place');assert.equal(queries,0);assert.equal(services,0);assert.equal(created,1);assert.equal(layers.length,1);
  assert.equal(owner.stats.loaded,0);assert.equal(owner.stats.rendered,0);assert.equal(owner.stats.cacheBytes,0);assert.equal(owner.hoverLayers.length,1);assert.equal(owner.hit([{layer:layers[0],graphic:owner.selection.ring}]).id,'poi');
  assert(owner.open([],place.id,false,'card'));assert.equal(created,1);assert.equal(changed.at(-1).id,'poi');
  owner.selection.updateCamera(-86.12,39.77);owner.selection.setLink(true);assert.equal(owner.selection.stats.graphics,4);assert.equal(layers.length,1);
  await Promise.resolve();owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(layers.length,0);
 }finally{owner.dispose();global.document=originalDocument;global.window=originalWindow}
});
const widget=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',widget,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let callback;function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(sf)==='view.on'&&node.arguments[0]?.text==='click')callback=node.arguments[1];ts.forEachChild(node,visit)}visit(sf);assert(callback);
const compiled=ts.transpileModule('return '+callback.getText(sf),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const {coverageClickHitTest}=load('src/features/coverage/coverageClickDispatch.ts');
function dispatch(resolve){
 let opened=0,coverage=0,stopped=0,cancelled=0;
 const owner={screenTarget:()=>null,openExternalChoices:places=>{opened++;assert.equal(places[0].id,'poi');return true}};
 const tiles={resolve,cancelPick(){cancelled++}};
 const route={graphic:{__isSequenceOverlay:true,geometry:{type:'point'},attributes:{sequenceId:'sequence',image_id:'image'}}};
 const view={destroyed:false,toMap:()=>({longitude:1,latitude:1}),hitTest:async()=>({results:[route]})};
 const w={_fieldNoteMap:{clearHighlight(){},hasPickTargets:false,noteForGraphic(){return null}},props:{state:'OPENED'},state:{jimuMapView:{view},turboModeActive:true,placesActive:true},_places:owner,_placesTilesOwner:owner,_placesTilesPrototype:tiles,
 _coverageSelectionTargets:{snapshot:()=>null},coverageSelectionContext:()=>({}),_sharedNotesLayer:null,_pointCloudHits:{route:()=>false},setState(){},showPlacesHit:()=>false,placesBusy:()=>false,loadSequenceById:async()=>{coverage++}};
 const handler=new Function('view','TURBO_LIMITS','coverageClickHitTest','tilePlace',compiled).call(w,view,{pickRadiusPx:10},coverageClickHitTest,tilePlace);
 return{handler,w,event:{x:10,y:10,stopPropagation(){stopped++}},get stats(){return{opened,coverage,stopped,cancelled}}};
}
test('actual widget dispatcher opens POI hits once and sends misses through existing sequence navigation',async()=>{
 const hit={attributes:{gers_id:'poi'},geometry:{x:-86.13,y:39.775}};
 const a=dispatch(async()=>hit);await a.handler(a.event);assert.equal(a.stats.opened,1);assert.equal(a.stats.coverage,0);
 const b=dispatch(async()=>null);await b.handler(b.event);assert.equal(b.stats.opened,0);assert.equal(b.stats.coverage,1);assert.equal(b.stats.stopped,0);
});
test('new map click invalidates an outstanding POI lookup before it can open a popup',async()=>{
 let release,calls=0;const a=dispatch(()=>++calls===1?new Promise(resolve=>release=resolve):Promise.resolve(null));
 const pending=a.handler(a.event);await new Promise(resolve=>setImmediate(resolve));await a.handler(a.event);
 release({attributes:{gers_id:'poi'},geometry:{x:-86.13,y:39.775}});await pending;
 assert.equal(a.stats.opened,0);assert.equal(a.stats.coverage,1);assert.equal(a.stats.cancelled,2);
});
test('native area records populate the existing list without graphics and retain low/missing confidence',async()=>{
 const savedDocument=global.document,savedWindow=global.window;
 global.document={createElement:tag=>({tag,children:[],style:{},appendChild(c){this.children.push(c)},replaceChildren(){this.children=[]},setAttribute(){}}),body:{},activeElement:null,addEventListener(){},removeEventListener(){}};global.window={};
 const {normalizeTilePlaces}=load('src/features/places/tilePlace.ts');let graphics=0,services=0;const listed=[],layers=[],visibility=[];
 class Value{constructor(p){Object.assign(this,p)}}class Graphic extends Value{constructor(p){super(p);graphics++}}
 class Layer extends Value{constructor(p){super(p);this.graphics={length:0,reorder(){}}}addMany(items){this.graphics.length+=items.length}destroy(){}}
 const view={ready:true,stationary:true,watch(){return{remove(){}}},map:{add:layer=>layers.push(layer),remove(){}},openPopup(options){this.popup={...options,visible:true}},closePopup(){this.popup=null}};
 const rows=Array.from({length:250},(_,i)=>({attributes:{gers_id:'p'+i,place_name:'Place '+i,place_group:'education',confidence:i===0?.1:null},geometry:{x:.5,y:.5}}));
 const owner=new ArcGISPlaces({externalSelection:true,id:'area',url:'',view:()=>view,modules:{Graphic,GraphicsLayer:Layer,Point:Value,FeatureLayer:class{constructor(){services++}}},queryExternal:async()=>({features:rows.slice(0,200),limited:true}),normalizeExternal:normalizeTilePlaces,externalVisible:v=>visibility.push(v),geographic:x=>x,busy:()=>false,status(){},list:places=>listed.push(places),explore:async()=>[],openImagery(){}});
 try{
  const page=await owner.controller.host.query([0,0,1,1],'all',new AbortController().signal);const normalized=owner.controller.host.normalize(page.features,[0,0,1,1]);owner.display(normalized,view);
  assert.equal(normalized.length,200);assert.equal(normalized[0].confidence,.1);assert.equal(normalized[1].confidence,null);assert.equal(listed.at(-1).length,200);assert.equal(graphics,0);assert.equal(services,0);assert.equal(layers.length,0);assert.equal(owner.stats.loaded,200);assert.equal(owner.stats.rendered,0);
  assert(owner.open([],'p1',false,'list'));assert.equal(owner.selection.place.id,'p1');assert.equal(graphics,1);
  owner.controller.host.visible(false);assert.equal(listed.at(-1).length,0);assert.equal(visibility.at(-1),false);
  assert.equal(normalizeTilePlaces([...rows,{attributes:{gers_id:'outside'},geometry:{x:10,y:10}}],[0,0,1,1]).length,200);
 }finally{owner.dispose();global.document=savedDocument;global.window=savedWindow}
});
test('native-source normalization preserves manual area intent and automatic-update preferences',async()=>{
 const {PlacesController}=load('src/features/places/PlacesController.ts'),{normalizeTilePlaces}=load('src/features/places/tilePlace.ts');
 let now=0,id=0;const timers=new Map(),idle=new Map(),calls=[],shown=[];const view={token:{},bbox:[0,0,1,1],zoom:16,stationary:true};
 const host={manualSearch:true,hybridSearch:false,view:()=>view,busy:()=>false,query:(bbox,group,signal)=>new Promise(resolve=>calls.push({bbox,signal,resolve})),normalize:normalizeTilePlaces,display:places=>shown.push(places),visible(){},clear(){},status(){},timer:(work,ms)=>{const key=++id;timers.set(key,{work,at:now+ms});return key},cancelTimer:key=>timers.delete(key),idle:work=>{const key=++id;idle.set(key,work);return key},cancelIdle:key=>idle.delete(key),now:()=>now};
 const controller=new PlacesController(host),flush=()=>new Promise(resolve=>setImmediate(resolve));
 const advance=async()=>{now+=650;for(const[key,timer]of [...timers])if(timer.at<=now){timers.delete(key);timer.work()}for(const[key,work]of [...idle]){idle.delete(key);work()}await flush()};
 try{
  controller.setEnabled(true);await advance();assert.equal(calls.length,0);
  controller.searchArea();await advance();assert.equal(calls.length,1);calls[0].resolve({features:[{attributes:{gers_id:'unknown',confidence:null},geometry:{x:.5,y:.5}}],limited:false});await flush();assert.equal(shown.at(-1)[0].confidence,null);
  view.bbox=[2,2,3,3];controller.sync();await advance();assert.equal(calls.length,1);
  controller.setAutoUpdate(true);await advance();assert.equal(calls.length,2);calls[1].resolve({features:[],limited:false});await flush();
  controller.setEnabled(false);assert.equal(controller.stats.cacheBytes,0);assert.equal(controller.stats.entries,0);
 }finally{controller.dispose()}
});
test('map/list hover uses one outline and the existing chooser handles unloaded overlaps and paging',async()=>{
 const savedDocument=global.document,savedWindow=global.window;
 const element=tag=>({tag,children:[],style:{},appendChild(c){this.children.push(c)},replaceChildren(){this.children=[]},setAttribute(){},querySelector(){return null}});
 global.document={createElement:element,body:{},activeElement:null,addEventListener(){},removeEventListener(){}};global.window={};
 let graphics=0,queries=0;const layers=[],hovered=[];
 class Value{constructor(p){Object.assign(this,p)}}class Graphic extends Value{constructor(p){super(p);graphics++}}
 class Layer extends Value{constructor(p){super(p);this.graphics={length:0,reorder(){}}}addMany(items){this.graphics.length+=items.length}destroy(){}}
 const view={ready:true,stationary:true,watch(){return{remove(){}}},map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},openPopup(options){this.popup={...options,visible:true}},closePopup(){this.popup=null},toScreen:()=>({x:10,y:10})};
 const owner=new ArcGISPlaces({externalSelection:true,id:'hover',url:'',view:()=>view,externalMapVisible:()=>true,modules:{Graphic,GraphicsLayer:Layer,Point:Value},geographic:x=>x,busy:()=>false,status(){},hovered:id=>hovered.push(id),explore:async()=>{queries++;return[]},openImagery(){}});
 const place=id=>({id,name:'Place '+id,category:'cafe',group:'other',confidence:null,lon:-86.13,lat:39.775,address:'',website:'',release:'2026-10-21.0'});
 try{
  owner.display([place('loaded-1'),place('loaded-2')],view);owner.setHover('loaded-1');for(let i=0;i<30;i++)owner.setHover('loaded-1');
  assert.equal(graphics,1);assert.equal(owner.stats.hoverGraphics,1);assert.deepEqual(hovered,['loaded-1']);owner.setHover('loaded-2');assert.equal(graphics,1);assert.equal(hovered.at(-1),'loaded-2');
  owner.setHover(null);owner.setExternalHover(place('outside-list'));assert.equal(graphics,1);assert.equal(hovered.at(-1),'outside-list');
  const members=Array.from({length:6},(_,i)=>place('choice-'+i));assert(owner.openExternalChoices(members));assert.equal(owner.stats.externalChoices,6);assert.equal(owner.stats.rendered,0);assert.equal(queries,0);assert.equal(view.popup.title,'Nearby places');
  let list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);list.children[0].onclick();assert.equal(owner.selection.place.id,'choice-4');assert.equal(graphics,2);
  owner.setExternalHover(place('stale-preview'));owner.display([place('new-page')],view);assert.equal(owner.selection.place.id,'choice-4');assert.equal(owner.nativeHover.stats.visible,false);assert.equal(hovered.at(-1),null);
  owner.controller.host.visible(false);owner.setExternalHover(place('map-only'));assert.equal(hovered.at(-1),'map-only');assert.equal(graphics,2);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:tile:'));assert(owner.open([],target));list=view.popup.content.children[2];list.children[1].onclick();assert.equal(owner.selection.place.id,'choice-5');assert.equal(graphics,2);
  assert(!owner.openExternalChoices(Array.from({length:33},(_,i)=>place('x'+i))));assert.equal(owner.stats.externalChoices,6);
  owner.clear();assert.equal(owner.stats.externalChoices,0);
 }finally{owner.dispose();assert.equal(layers.length,0);global.document=savedDocument;global.window=savedWindow}
});
const hoverStart=widget.indexOf('          let place = this._places?.hit(hit.results);'),hoverEnd=widget.indexOf('          if (place && !hoverController.signal.aborted)',hoverStart);
assert(hoverStart>=0&&hoverEnd>hoverStart);
const hoverCompiled=ts.transpileModule('return async () => {'+widget.slice(hoverStart,hoverEnd)+'; return { place, nativeNearbyCount }; }',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
function hoverDispatch(coverage,resolveHover){
 const changes=[],view={};let requests=0;
 const owner={hit:()=>null,setExternalHover:place=>changes.push(place?.id||null)};
 const source={version:1,resolveHover:(...args)=>{requests++;return resolveHover(...args)}};
 const w={_places:owner,_placesTilesOwner:owner,_placesTilesPrototype:source,state:{jimuMapView:{view}},placesBusy:()=>false};
 const run=new Function('view','coverage','hoverController','screenPoint','hit','tilePlace',hoverCompiled).call(w,view,coverage,new AbortController(),{x:0,y:0},{results:[]},tilePlace);
 return{run,w,source,changes,get requests(){return requests}};
}
test('actual hover pipeline keeps coverage preview authoritative and rejects ownership changes',async()=>{
 const coverageOwner=hoverDispatch(Promise.resolve({image:'coverage'}),async()=>{throw Error('Must not query POIs')});await coverageOwner.run();assert.equal(coverageOwner.requests,0);
 let release;const stopped=hoverDispatch(new Promise(resolve=>release=resolve),async()=>null);const pending=stopped.run();stopped.w._placesTilesPrototype=null;release(null);assert.equal(await pending,undefined);assert.equal(stopped.requests,0);assert.deepEqual(stopped.changes,[]);
 let finish;const changed=hoverDispatch(Promise.resolve(null),()=>new Promise(resolve=>finish=resolve));const query=changed.run();await new Promise(resolve=>setImmediate(resolve));changed.source.version++;finish({attributes:{gers_id:'old'},geometry:{x:-86,y:40}});assert.equal(await query,undefined);assert.deepEqual(changed.changes,[]);
});
test('actual hover pipeline forwards the hovered identity and overlap count',async()=>{
 const h=hoverDispatch(Promise.resolve(null),async()=>({attributes:{gers_id:'hovered'},geometry:{x:-86,y:40},candidates:[{},{}]}));const result=await h.run();assert.equal(result.place.id,'hovered');assert.equal(result.nativeNearbyCount,2);assert.deepEqual(h.changes,['hovered']);
});
test('closed result panel makes no area requests, preserves selection/results and resumes on demand',async()=>{
 const {PlacesController}=load('src/features/places/PlacesController.ts'),{normalizeTilePlaces}=load('src/features/places/tilePlace.ts');
 let now=0,id=0,open=false,clears=0,visibility=0;const timers=new Map(),idle=new Map(),calls=[],shown=[];
 const view={token:{},bbox:[0,0,1,1],zoom:16,stationary:true};
 const host={manualSearch:true,hybridSearch:true,consumerActive:()=>open,view:()=>view,busy:()=>false,query:(bbox,group,signal)=>new Promise(resolve=>calls.push({bbox,signal,resolve})),normalize:normalizeTilePlaces,display:places=>shown.push(places),visible(){visibility++},clear(){clears++},status(){},timer:(work,ms)=>{const key=++id;timers.set(key,{work,at:now+ms});return key},cancelTimer:key=>timers.delete(key),idle:work=>{const key=++id;idle.set(key,work);return key},cancelIdle:key=>idle.delete(key),now:()=>now};
 const controller=new PlacesController(host),flush=()=>new Promise(resolve=>setImmediate(resolve));
 const advance=async()=>{now+=650;for(const[key,timer]of [...timers])if(timer.at<=now){timers.delete(key);timer.work()}for(const[key,work]of [...idle]){idle.delete(key);work()}await flush()};
 try{
  controller.setEnabled(true);controller.searchArea();for(let i=0;i<5;i++){controller.sync();await advance()}assert.equal(calls.length,0);assert.equal(visibility,0);assert.equal(clears,0);
  open=true;controller.sync();await advance();assert.equal(calls.length,1);calls[0].resolve({features:[{attributes:{gers_id:'kept',confidence:null},geometry:{x:.5,y:.5}}],limited:false});await flush();assert.equal(shown.at(-1)[0].id,'kept');
  const bytes=controller.stats.cacheBytes;open=false;controller.sync();view.bbox=[2,2,3,3];controller.sync();await advance();assert.equal(calls.length,1);assert.equal(clears,0);assert.equal(controller.stats.cacheBytes,bytes);assert.equal(shown.at(-1)[0].id,'kept');
  open=true;controller.sync();await advance();assert.equal(calls.length,2);open=false;controller.sync();assert(calls[1].signal.aborted);calls[1].resolve({features:[{attributes:{gers_id:'obsolete'},geometry:{x:2.5,y:2.5}}],limited:false});await flush();assert.equal(shown.at(-1)[0].id,'kept');assert.equal(clears,0);
 }finally{controller.dispose()}
});
test('native DTOs and bounded UI icon caches preserve all current icon families',()=>{
 const {TILE_CATEGORIES}=load('src/features/places/tileCategories.ts'),{placeCategoryIcon}=load('src/features/places/placeIcons.ts');
 assert.equal(TILE_CATEGORIES.length,28);const unknown=placeCategoryIcon('unknown');
 for(const [id]of TILE_CATEGORIES){const place=tilePlace({gers_id:id,icon_group:id,place_group:'other',confidence:null},{x:-86,y:40});assert.equal(place.group,id);const icon=placeCategoryIcon(place.group);assert.equal(icon,placeCategoryIcon(place.group));if(id!=='other')assert.notEqual(icon,unknown)}
});
