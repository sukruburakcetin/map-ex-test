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
 const element=tag=>({tag,children:[],style:{},textContent:'',appendChild(child){this.children.push(child)},setAttribute(){},querySelector(){return null}});
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
  assert.equal(owner.stats.loaded,0);assert.equal(owner.stats.rendered,0);assert.equal(owner.stats.cacheBytes,0);
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
 const owner={screenTarget:()=>null,openExternal:place=>{opened++;assert.equal(place.id,'poi');return true}};
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
 global.document={createElement:tag=>({tag,children:[],style:{},appendChild(c){this.children.push(c)},setAttribute(){}}),body:{},activeElement:null,addEventListener(){},removeEventListener(){}};global.window={};
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
