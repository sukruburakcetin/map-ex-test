const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const root=path.join(__dirname,'../src'),cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,id=>load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts'))));return m.exports;}
const api=load('features/places/placesApi.ts'),prefs=load('features/places/placePreferences.ts'),tiles=load('features/places/PlacesTilesPrototype.ts'),{TILE_CATEGORIES}=load('features/places/tileCategories.ts'),{tilePlace,normalizeTilePlaces}=load('features/places/tilePlace.ts');
const source=ts.createSourceFile('widget.tsx',fs.readFileSync(path.join(root,'runtime/widget.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=source.statements.find(n=>ts.isClassDeclaration(n)),names=new Set(['installPlacesTilesPrototype','syncPlaces','togglePlaces']);const members=widget.members.filter(m=>m.name&&names.has(m.name.getText(source))).map(m=>m.getText(source)).join('\n');
function setup(options={}){
 const saved={window:global.window,fetch:global.fetch},store=new Map(),requests=[],owners=[],layers=[],toasts=[];let release,releaseModules;
 global.window={location:{pathname:'/app'},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)}};
 const metadata={ready:true,bbox:[-87,39,-85,41],category_filter_version:1,paging_version:1,text_search_version:1,scale_display_version:1,supported_icon_families:TILE_CATEGORIES.map(([id])=>id)};
 global.fetch=(url,init={})=>{requests.push({url,init});const response={ok:true,json:async()=>url.includes('/status')?{...metadata,...options.metadata}:{features:[],offset:JSON.parse(init.body||'{}').offset,exceededTransferLimit:false}};if(options.hold&&url.includes('/status'))return new Promise((resolve,reject)=>{release=()=>resolve(response);init.signal?.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true})});return Promise.resolve(response)};
 class Owner{constructor(host){this.host=host;owners.push(this);this.controller={sync(){},setEnabled(){},setGroup(){},searchArea(){}}}dispose(){this.disposed=true}clearSelection(){}resetExternalResults(){}setExternalExtent(bbox){this.bbox=bbox}}
 class Layer{constructor(props){Object.assign(this,props);layers.push(this)}async load(){}destroy(){this.destroyed=true}}
 const makeView=()=>({ready:true,stationary:true,zoom:16,map:{items:[],add(layer){this.items.push(layer)},remove(layer){this.items=this.items.filter(value=>value!==layer)}},watch(){return{remove(){}}}});
 const m={exports:{}};new Function('exports','placesApiUrl','placesApiEndpoints','ArcGISPlaces','PlacesTilesPrototype','readTilePlacePreferences','tilePlacePreferenceKey','tilePlace','normalizeTilePlaces','webMercatorUtils',ts.transpileModule('export class Fixture{'+members+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,api.placesApiUrl,api.placesApiEndpoints,Owner,tiles.PlacesTilesPrototype,prefs.readTilePlacePreferences,prefs.tilePlacePreferenceKey,tilePlace,normalizeTilePlaces,{webMercatorToGeographic:x=>x});
 const w=new m.exports.Fixture();Object.assign(w,{props:{id:'w',config:{enablePlaces:true,placesApiUrl:options.url||'https://example.org/places'}},state:{placesActive:false,placesPanelOpen:false,placesAutoUpdate:true,placesTileCategory:'all',placesList:[],selectedPlace:null,jimuMapView:{view:makeView()}},ArcGISModules:{VectorTileLayer:Layer,Point:class{constructor(p){Object.assign(this,p)}},get FeatureLayer(){throw Error('Configured vector workflow must never construct a FeatureServer')}},_placesTilesStartRevision:0,_placeNoteReview:{cancel(){}},placesBusy:()=>false,placesPauseReason:()=>'',placesListOrigin:()=>({lon:-86,lat:40,kind:'map'}),_t:key=>key,showToast:message=>toasts.push(message),explorePlace:async()=>[],selectedPlaceChanged(){},ensureArcGISModules:()=>options.holdModules?new Promise(resolve=>releaseModules=resolve):Promise.resolve()});
 w.setState=(patch,done)=>{Object.assign(w.state,typeof patch==='function'?patch(w.state):patch);done?.()};w.installPlacesTilesPrototype();
 return{w,requests,owners,layers,toasts,store,makeView,release:()=>release?.(),releaseModules:()=>releaseModules?.(),tick:()=>new Promise(resolve=>setImmediate(resolve)),cleanup(){w._placesTilesControl.stop();global.window=saved.window;global.fetch=saved.fetch}};
}
test('saved API configuration stays off at startup, then enables full vector capabilities without console commands',async()=>{
 const h=setup();try{for(let i=0;i<20;i++)h.w.syncPlaces();assert.equal(h.requests.length,0);assert.equal(h.owners.length,0);
 h.w.togglePlaces();for(let i=0;i<20;i++)h.w.syncPlaces();await h.tick();assert.equal(h.requests.length,1);assert.equal(h.requests[0].url,'https://example.org/places/status');assert.equal(h.layers.length,1);assert.equal(h.w.state.placesActive,true);assert.equal(h.w.state.placesPanelOpen,true);assert.equal(h.owners[0].host.externalSelection,true);assert.equal(h.owners[0].host.manualSearch,true);assert(h.owners[0].host.queryExternal);assert.equal(h.w.state.jimuMapView.view.map.items.length,1);
 await h.owners[0].host.queryExternal([-87,39,-85,41],new AbortController().signal,{lon:-86,lat:40,kind:'map'},200,'coffee');assert.equal(h.requests.at(-1).url,'https://example.org/places/search');assert.equal(JSON.parse(h.requests.at(-1).init.body).text,'coffee');assert.equal(JSON.parse(h.requests.at(-1).init.body).offset,200);
 h.w.togglePlaces();await h.tick();assert.equal(h.w.state.placesActive,false);assert.equal(h.w.state.jimuMapView.view.map.items.length,0);
 }finally{h.cleanup()}
});
test('disabling during preparation cancels startup and cannot attach a late layer',async()=>{
 const h=setup({hold:true});try{h.w.togglePlaces();await h.tick();assert.equal(h.requests.length,1);h.w.togglePlaces();h.release();await h.tick();assert.equal(h.w.state.placesActive,false);assert.equal(h.w.state.jimuMapView.view.map.items.length,0);assert.equal(h.w._placesTilesPrototype,null);assert(h.layers.every(layer=>layer.destroyed));}finally{h.cleanup()}
});
test('URL and map changes retire the old source and preserve enabled intent',async()=>{
 const h=setup();try{h.w.togglePlaces();await h.tick();const old=h.layers[0];h.w.props.config.placesApiUrl='https://example.org/second';h.w.syncPlaces();await h.tick();assert(old.destroyed);assert.equal(h.requests.at(-1).url,'https://example.org/second/status');assert.equal(h.w.state.placesActive,true);
 const oldView=h.w.state.jimuMapView.view;h.w.state.jimuMapView={view:h.makeView()};h.w.syncPlaces();await h.tick();assert.equal(oldView.map.items.length,0);assert.equal(h.w.state.jimuMapView.view.map.items.length,1);
 h.w.props.config.enablePlaces=false;h.w.syncPlaces();await h.tick();assert.equal(h.w.state.placesActive,false);assert.equal(h.w.state.jimuMapView.view.map.items.length,0);
 }finally{h.cleanup()}
});
test('legacy FeatureServer settings show migration feedback without issuing data requests',async()=>{
 const h=setup();try{h.w.props.config={enablePlaces:true,placesServiceUrl:'https://example.org/FeatureServer/0'};h.w.syncPlaces();h.w.togglePlaces();await h.tick();assert.equal(h.requests.length,0);assert.equal(h.owners.length,0);assert.deepEqual(h.toasts,['uiPoiFeatureMigration']);assert.equal(h.w.state.placesActive,false)}finally{h.cleanup()}
});
test('preferences restore on enable and remain isolated by service path',async()=>{
 const h=setup();try{const key=prefs.tilePlacePreferenceKey('w','/app','https://example.org/places');prefs.saveTilePlacePreferences(()=>window.localStorage,key,{family:'cafe',minimum:.75,hideClosed:true,autoUpdate:false});h.w.togglePlaces();await h.tick();assert.equal(h.w.state.placesActive,true);assert.equal(h.w.state.placesTileCategory,'cafe');assert.equal(h.w.state.placesAutoUpdate,false);const url=new URL(h.layers[0].url);assert.equal(url.searchParams.get('family'),'cafe');assert.equal(url.searchParams.get('min_confidence'),'0.75');assert.equal(url.searchParams.get('hide_closed'),'1');assert.equal(h.owners[0].host.hybridSearch,false)}finally{h.cleanup()}
});

test('incompatible service fails once, clears resources and retries only on explicit enable',async()=>{
 const options={metadata:{text_search_version:0}},h=setup(options),warn=console.warn;console.warn=()=>{};
 try{h.w.togglePlaces();await h.tick();assert.equal(h.w.state.placesActive,false);assert.equal(h.w.state.jimuMapView.view.map.items.length,0);assert.equal(h.w._placesTilesPrototype,null);for(let i=0;i<20;i++)h.w.syncPlaces();assert.equal(h.requests.length,1);assert(h.toasts.includes('uiPoiSourceFailed'));
 options.metadata.text_search_version=1;h.w.togglePlaces();await h.tick();assert.equal(h.w.state.placesActive,true);assert.equal(h.requests.length,2);
 }finally{h.cleanup();console.warn=warn}
});
test('a not-yet-ready replacement view keeps intent without making premature requests',async()=>{
 const h=setup();try{h.w.togglePlaces();await h.tick();const next=h.makeView();next.ready=false;h.w.state.jimuMapView={view:next};h.w.syncPlaces();await h.tick();assert.equal(h.w.state.placesActive,true);assert.equal(h.requests.length,1);next.ready=true;h.w.syncPlaces();await h.tick();assert.equal(h.requests.length,2);assert.equal(next.map.items.length,1);
 h.w._places=null;h.w.syncPlaces();await h.tick();assert.equal(next.map.items.length,1);assert.equal(h.requests.length,3);
 }finally{h.cleanup()}
});

test('disabling before SDK modules finish loading prevents source construction entirely',async()=>{
 const h=setup({holdModules:true});try{h.w.togglePlaces();assert.equal(h.w.state.placesSourceLoading,true);h.w.togglePlaces();h.releaseModules();await h.tick();assert.equal(h.w.state.placesActive,false);assert.equal(h.w.state.placesSourceLoading,false);assert.equal(h.requests.length,0);assert.equal(h.owners.length,0);assert.equal(h.layers.length,0)}finally{h.cleanup()}
});
