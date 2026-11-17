const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const module = {exports:{}};
  const result = ts.transpileModule(fs.readFileSync(path.join(root,'src',relative+'.ts'),'utf8'), {
    fileName:relative+'.ts', compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}, reportDiagnostics:true,
  });
  assert.equal(result.diagnostics.filter(d=>d.category===1).length,0);
  new Function('require','module','exports',result.outputText)(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id))),module,module.exports);
  cache.set(relative,module.exports);
  return module.exports;
}
const {DetectionLayerController} = load('features/detections/DetectionLayerController');
const {LAYER_IDS,STYLE_LAYER_IDS,STYLE_SOURCE_IDS} = load('utils/constants');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function map() {
  const items=[];
  return {items,layers:{includes:l=>items.includes(l)},findLayerById:id=>items.find(l=>l.id===id),
    add(l){items.push(l);},remove(l){const i=items.indexOf(l);if(i>=0)items.splice(i,1);}};
}
class Layer {
  constructor(properties){Object.assign(this,properties);this.opacity=1;this.visible=true;this.destroyed=false;this.writes=[];this.loads=0;}
  async load(){this.loads++;if(this.pending)return await this.pending.promise;}
  getLayoutProperties(id){return this.style.layers.find(l=>l.id===id).layout;}
  setLayoutProperties(id,value){this.writes.push([id,value]);this.style.layers.find(l=>l.id===id).layout=value;}
  destroy(){this.destroyed=true;}
}
function fixture() {
  const settings={signs:{scale:1,opacity:1,reduceOverlap:false,labels:false,mode:'selected'},objects:{scale:1,opacity:1,reduceOverlap:false,labels:false,mode:'selected'}};
  const state={view:{map:map(),destroyed:false},disposed:false,selection:{signs:null,objects:null}};
  const created=[],loading=[],errors=[],cleared=[],owned=[];
  const controller=new DetectionLayerController({view:()=>state.view,disposed:()=>state.disposed,
    appearance:kind=>settings[kind],selection:kind=>state.selection[kind],codes:kind=>kind==='signs'?['regulatory--stop--g1','regulatory--stop--g2','warning--curve--g1']:['construction--flat--flat-driveway'],
    source:kind=>({tiles:`https://tiles.test/${kind}/{z}/{x}/{y}?access_token=fixture`,sprite:`https://widget.test/${kind}`}),
    create:properties=>{const layer=new Layer(properties);created.push(layer);return layer;},own:l=>owned.push(l),
    loading:(...args)=>loading.push(args),clearLoading:kind=>cleared.push(kind),error:(...args)=>errors.push(args)});
  return {controller,state,settings,created,loading,errors,cleared,owned};
}
for(const kind of ['signs','objects']) test(kind+' retains native source, sprites, size and independent settings',async()=>{
  const f=fixture();f.settings[kind].scale=1.5;f.settings[kind].opacity=.6;
  const layer=f.controller.initialize(kind),source=kind==='signs'?STYLE_SOURCE_IDS.TRAFFIC_SIGNS:STYLE_SOURCE_IDS.OBJECTS;
  assert.equal(f.state.view.map.items.length,0);assert(f.owned.includes(layer));
  assert.equal(layer.style.sprite,`https://widget.test/${kind}`);assert.equal(layer.style.sources[source].minzoom,14);assert.equal(layer.style.sources[source].maxzoom,14);
  assert(layer.style.sources[source].tiles[0].includes('access_token=fixture'));assert(!layer.style.sprite.includes('fixture'));
  assert.equal(layer.style.layers[0]['source-layer'],kind==='signs'?'traffic_sign':'point');assert.equal(layer.style.layers[0].layout['icon-size'],.75);
  f.controller.sync(kind,true);await flush();assert(f.state.view.map.items.includes(layer));assert.equal(layer.opacity,.6);assert.equal(f.loading.at(-1)[2],layer);
  assert.equal(f.controller.layer(kind==='signs'?'objects':'signs'),null);
});
test('filter replacement preserves source data and retires only the old owned renderer',async()=>{
  const f=fixture();f.controller.sync('signs',true);const old=f.controller.layer('signs');old.style.metadata={custom:'preserve'};
  f.state.selection.signs=Object.freeze(['regulatory--stop--g1']);f.settings.signs.mode='highlight';f.settings.signs.labels=true;
  const layer=f.controller.filter('signs');await flush();assert(old.destroyed);assert.deepEqual(f.state.view.map.items,[layer]);assert.deepEqual(layer.style.metadata,{custom:'preserve'});
  assert.equal(layer.style.layers[0].filter,undefined);assert.deepEqual(layer.style.layers[0].paint['icon-opacity'],['case',['==',['get','value'],'regulatory--stop--g1'],1,.2]);
  assert.deepEqual(layer.style.layers[1].filter,['==',['get','value'],'regulatory--stop--g1']);assert.equal(layer.style.layers[1].minzoom,18);
  assert.deepEqual(f.state.selection.signs,['regulatory--stop--g1']);assert.equal(f.errors.length,0);
});
test('All, None and multiple categories remain distinct through toggling and view transfer',()=>{
  const f=fixture();f.controller.sync('objects',true);f.state.selection.objects=[];const none=f.controller.filter('objects');assert.deepEqual(none.style.layers[0].filter,['in',['get','value'],['literal',[]]]);
  f.controller.sync('objects',false);assert.equal(f.state.view.map.items.length,0);f.controller.sync('objects',true);assert.deepEqual(f.controller.layer('objects').style.layers[0].filter,['in',['get','value'],['literal',[]]]);
  f.state.selection.objects=['A','B'];f.controller.filter('objects');const oldMap=f.state.view.map,old=f.controller.layer('objects');f.state.view={map:map(),destroyed:false};f.controller.sync('objects',true);
  assert(old.destroyed);assert.equal(oldMap.items.length,0);assert.deepEqual(f.controller.layer('objects').style.layers[0].filter,['in',['get','value'],['literal',['A','B']]]);
  f.state.selection.objects=null;f.controller.filter('objects');assert.equal(f.controller.layer('objects').style.layers[0].filter,undefined);
});
for(const reason of ['replacement','view','map','reset','disabled','disposed']) test('late appearance work is ignored after '+reason,async()=>{
  const f=fixture(),layer=f.controller.initialize('signs');layer.pending=deferred();const pending=f.controller.applyAppearance('signs');
  if(reason==='replacement')f.controller.initialize('signs');if(reason==='view')f.state.view={map:map()};if(reason==='map')f.state.view.map=map();if(reason==='reset')f.controller.reset('signs');if(reason==='disabled')f.controller.sync('signs',false);if(reason==='disposed')f.state.disposed=true;
  layer.pending.resolve();await pending;assert.equal(layer.writes.length,0);assert.equal(f.errors.length,0);
});
test('appearance reads latest settings after load without rebuilding or touching the other type',async()=>{
  const f=fixture(),sign=f.controller.initialize('signs'),object=f.controller.initialize('objects');sign.pending=deferred();const pending=f.controller.applyAppearance('signs');f.settings.signs.scale=2;f.settings.signs.reduceOverlap=true;f.settings.signs.opacity=.4;f.controller.setOpacity('signs',.4);sign.pending.resolve();await pending;
  assert.equal(sign.opacity,.4);assert.equal(object.opacity,1);assert.equal(object.writes.length,0);assert.equal(f.created.length,2);assert.equal(sign.writes[0][1]['icon-size'],1);assert.equal(sign.writes[0][1]['icon-allow-overlap'],false);assert.equal(sign.writes[0][1]['icon-ignore-placement'],false);
});
test('clear preserves borrowed layers and supports a fresh reopen',()=>{
  const f=fixture(),borrowed=new Layer({id:LAYER_IDS.TRAFFIC_SIGNS_VT,style:{layers:[]}});f.state.view.map.add(borrowed);f.controller.sync('signs',true);f.controller.sync('objects',true);const own=f.controller.layer('objects');f.controller.clear();assert(!borrowed.destroyed);assert(own.destroyed);assert.deepEqual(f.state.view.map.items,[borrowed]);assert.equal(f.controller.layer('signs'),null);f.state.view.map.remove(borrowed);f.controller.sync('signs',true);assert(f.controller.layer('signs'));assert.notEqual(f.controller.layer('signs'),borrowed);
});
test('failed replacement retains the old layer and reports one error',()=>{
  const f=fixture();f.controller.sync('signs',true);const old=f.controller.layer('signs'),map=f.state.view.map,add=map.add;let failed=false;map.add=function(layer){if(layer!==old&&!failed){failed=true;throw Error('add failed');}return add.call(this,layer);};
  assert.equal(f.controller.filter('signs'),null);assert.equal(f.controller.layer('signs'),old);assert(!old.destroyed);assert.deepEqual(map.items,[old]);assert(f.created.at(-1).destroyed);assert.equal(f.errors.length,1);
});
test('actual widget adapter supplies the correct sprite and native tile source for each kind',async()=>{
  const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,99,true,4),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');
  const names=['_detectionLayers','mapillaryTrafficSignsLayer','mapillaryObjectsLayer','initMapillaryTrafficSignsLayer','initMapillaryObjectsLayer'];
  const members=widget.members.filter(n=>n.name&&names.includes(n.name.getText(sf))).map(n=>n.getText(sf)).join('\n');
  const constants=load('utils/constants'),module={exports:{}};
  new Function('DetectionLayerController','TILE_URLS','objectNameMap','module','exports',ts.transpileModule('export class Fixture{'+members+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(DetectionLayerController,constants.TILE_URLS,{},module,module.exports);
  const w=new module.exports.Fixture(),view={map:map()},loading=[];
  Object.assign(w,{state:{jimuMapView:{view},signSpriteScale:1.5,objectSpriteScale:.75},ArcGISModules:{VectorTileLayer:Layer},accessToken:'fixture-token',spriteUrls:{TRAFFIC_SIGNS:'https://widget.test/signs',OBJECTS:'https://widget.test/objects'},_mapFeatureFilterCodes:new Map(),_detectionSignCodes:new Set(),_ownedMapResources:{ownLayer(){}},_mapSpriteLoading:{start:(...args)=>loading.push(args),clear(){}},_t:key=>key,showToast:()=>assert.fail('unexpected toast')});
  w.initMapillaryTrafficSignsLayer();w.initMapillaryObjectsLayer();
  assert.equal(w.mapillaryTrafficSignsLayer.style.sprite,w.spriteUrls.TRAFFIC_SIGNS);assert.equal(w.mapillaryObjectsLayer.style.sprite,w.spriteUrls.OBJECTS);
  assert.equal(w.mapillaryTrafficSignsLayer.style.sources[STYLE_SOURCE_IDS.TRAFFIC_SIGNS].tiles[0],constants.TILE_URLS.TRAFFIC_SIGNS+'?access_token=fixture-token');
  assert.equal(w.mapillaryObjectsLayer.style.sources[STYLE_SOURCE_IDS.OBJECTS].tiles[0],constants.TILE_URLS.OBJECTS+'?access_token=fixture-token');
  assert.equal(w.mapillaryTrafficSignsLayer.style.layers[0].layout['icon-size'],.75);assert.equal(w.mapillaryObjectsLayer.style.layers[0].layout['icon-size'],.375);
  w._detectionLayers.sync('signs',true);await flush();assert.equal(loading[0][0],'signs');assert.equal(loading[0][1],view);assert.equal(loading[0][2],w.mapillaryTrafficSignsLayer);
});
