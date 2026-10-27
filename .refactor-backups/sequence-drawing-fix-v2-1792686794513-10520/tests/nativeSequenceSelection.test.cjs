/** Native filtered selection, minimap-only routes and actual runtime entry points. Run with MAPILLARY_TYPESCRIPT pointing to typescript.js. */
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
function load(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports}
const {NativeSequenceSelection}=load('features/coverage/NativeSequenceSelection'),{turboTileStyle,TURBO_LIMITS,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{nativeCoverageOffsetMeters,nativeCoverageSourceFootprint}=load('features/coverage/nativeCoverageAlignment');
const style=(filters={},date=false,hide=false)=>turboTileStyle('tiles/{z}/{x}/{y}',filters,date,['2024','2025'],[[255,0,0],[0,255,0]],hide);
class Layer {
 constructor(styles){this.styles=structuredClone(styles);this.calls=[]}
 getStyleLayerId(index){return this.styles[index]?.id??null}
 getStyleLayerIndex(id){return this.styles.findIndex(s=>s.id===id)}
 setStyleLayer(style,index){
  this.calls.push(style.id);
  // Match the SDK's append and out-of-range-index behavior.
  if(index!=null&&index>=this.styles.length)index=this.styles.length-1;
  const old=this.getStyleLayerIndex(style.id);
  if(old>=0){index=index||old;if(index===old){this.styles[old]=structuredClone(style);return}this.styles.splice(old,1)}
  if(!index||index>=this.styles.length)this.styles.push(structuredClone(style));
  else this.styles.splice(index,0,structuredClone(style));
 }
 deleteStyleLayer(id){this.styles.splice(this.getStyleLayerIndex(id),1)}
}

function match(f,p){if(!f)return true;const [op,key,val]=f;switch(op){case'all':return f.slice(1).every(x=>match(x,p));case'any':return f.slice(1).some(x=>match(x,p));case'in':return f.slice(2).includes(p[key]);case'!in':return !f.slice(2).includes(p[key]);case'has':return key in p;case'!has':return !(key in p);case'==':return p[key]===val;case'!=':return p[key]!==val;case'>=':return p[key]>=val;case'<=':return p[key]<=val;case'<':return p[key]<val;default:throw Error(op)}}
function color(expression,props){
 if(!Array.isArray(expression))return expression;
 const [op,...args]=expression;
 if(op==='get')return props[args[0]];
 if(op==='==')return color(args[0],props)===color(args[1],props);
 if(op==='case')return color(args[0],props)?color(args[1],props):color(args[2],props);
 if(op==='coalesce')return args.map(a=>color(a,props)).find(v=>v!=null);
 if(op==='step'){const value=color(args[0],props);let result=args[1];for(let i=2;i<args.length;i+=2)if(value>=args[i])result=args[i+1];return result}
 throw Error(op);
}
// Resolve visible styles, rather than just evaluating a paint expression in isolation.
function visible(styles, sourceLayer, props) {
 return styles.filter(s=>s['source-layer']===sourceLayer && match(s.filter,props));
}
for(const [name,filters,date] of [['normal',{},false],['dates',{},true],['quality',{qualityActive:true},false],['quality band',{qualityActive:true,qualityBand:'fair'},false],['ownership/travel/pano/date',{organizationId:123,creatorId:456,onFoot:false,isPano:false,startTime:1,endTime:9999999999999,selectedYear:'2024'},false]]) {
 test(name+': blue styles partition native features without changing nonselected paint or symbology',()=>{
  const base=style(filters,date).layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);owner.select('A');
  for(const original of base) {
   const actual=layer.styles.find(s=>s.id===original.id);
   if(original['source-layer']==='overview'){assert.deepEqual(actual,original);continue}
   assert.deepEqual(actual.paint,original.paint); // No constant-to-expression material changes.
   const blue=layer.styles.find(s=>s.id===original.id+'-sequence-blue');
   const key=original.type==='circle'?'circle-color':'line-color';
   assert.deepEqual({...blue,id:original.id,filter:original.filter,paint:original.paint},{...original,filter:original.filter});
   assert.deepEqual({...blue.paint,[key]:original.paint[key]},original.paint);
   assert.equal(blue.paint[key],'#0000ff');
   assert.equal(layer.getStyleLayerIndex(blue.id),layer.getStyleLayerIndex(original.id)+1);
   for(const id of ['A','B',undefined,null]) for(const quality of [.1,.5,.9]) {
    const props={id,sequence_id:id,captured_at:Date.UTC(2024,6,1),quality_score:quality,organization_id:123,organization_id_list:[123],creator_id:456,is_pano:false,foot:false};
    const originalVisible=match(original.filter,props);
    const partition=[actual,blue].filter(s=>match(s.filter,props));
    assert.equal(partition.length,originalVisible?1:0,'no duplicate or newly visible features');
    if(originalVisible)assert.equal(color(partition[0].paint[key],props),id==='A'?'#0000ff':color(original.paint[key],props));
   }
  }
  owner.select('B');assert(!JSON.stringify(layer.styles).includes('"A"'));
  owner.select(null);assert.deepEqual(layer.styles,base);
 });
}
test('hover preserves selection; leaving the point restores only its sequence',()=>{
 const base=style().layers,layer=new Layer(base),owner=new NativeSequenceSelection();owner.bind(layer,base);
 owner.select('A','B');
 for(const source of ['sequence','image'])for(const id of ['A','B','C',undefined]){
  const props={id,sequence_id:id};const drawn=visible(layer.styles,source,props);assert.equal(drawn.length,1);
  const key=source==='image'?'circle-color':'line-color';assert.equal(drawn[0].paint[key],id==='A'||id==='B'?'#0000ff':'#35AF6D');
 }
 owner.select('A',null);assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#35AF6D');
 owner.select(null,'B');assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');
 owner.select(null,null);assert.deepEqual(layer.styles,base);
});
test('style reload and view transfer bind current templates without retaining old layers',()=>{
 const a=new Layer(style().layers),b=new Layer(style({qualityActive:true}).layers),o=new NativeSequenceSelection();o.bind(a,a.styles);o.select('A');const calls=a.calls.length;
 o.bind(b,b.styles);o.select('A');assert.equal(a.calls.length,calls);assert(b.styles.some(s=>s.id.endsWith('-sequence-blue')));
 o.detach();const n=b.calls.length;o.select('B');assert.equal(b.calls.length,n);
});
test('same sequence during playback and duplicate hover IDs perform no style operations',()=>{
 const s=style(),l=new Layer(s.layers),o=new NativeSequenceSelection();o.bind(l,s.layers);o.select('A');const n=l.calls.length;
 for(let i=0;i<10000;i++)o.select('A',i%2?'A':null);assert.equal(l.calls.length,n);
});
test('native circles cannot be hidden by the retired hide-images argument',()=>{for(const filters of [{},{qualityActive:true}]){assert.deepEqual(style(filters,false,true),style(filters,false,false));assert(style(filters,false,true).layers.some(s=>s['source-layer']==='image'))}});
const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);
const method=name=>cl.members.find(m=>m.name?.getText(sf)===name).getText(sf);
const wanted=['refreshSequenceMarkerWindow','drawPointWithoutRemoving','renderLiveSequenceLine','showCachedSequencePreview','pickTurboGraphic','loadTurboCoverageLayer','updateNativeSequenceSelection','highlightSequenceOnVTL','clearTurboHoverDetails','updateTurboHover'];
let yieldSequenceWorkImpl=async()=>{};
const globals={Pbf:class{},VectorTile:class{constructor(){this.layers={sequence:{length:1,feature:()=>({properties:{id:"A"},extent:4096,loadGeometry:()=>[[{x:1,y:1},{x:2,y:2}]]})}}}},NativeSequenceSelection,TURBO_LIMITS,LIVE_SEQUENCE_LIMITS:{markerZoom:14},yieldSequenceWork:(...args)=>yieldSequenceWorkImpl(...args),ZOOM:{TILE_FETCH:14},LAYER_IDS:{COVERAGE_VT:'coverage',TURBO_COVERAGE:'old'},TILE_URLS:{COVERAGE:'tiles'},YEAR_COLOR_PALETTE:[[0,255,0]],nativeCoverageOffsetMeters,nativeCoverageSourceFootprint,turboFootprintBboxes,turboTileStyle,lonLatToWebMercator:(lon,lat)=>({x:lon,y:lat})};
const Harness=new Function(...Object.keys(globals),compile('class Harness{'+wanted.map(method).join('\n')+'};')+'return Harness;')(...Object.values(globals));
function setup(zoom=24,type='2d'){
 const w=new Harness(),layer=new Layer(style().layers),view={zoom,type,destroyed:false,stationary:true,map:{findLayerById:id=>id==='coverage'?layer:null},when:async()=>{},toMap:({x,y})=>({longitude:x,latitude:y,z:123}),toScreen:p=>({x:p.x,y:p.y})};let allocations=0;
 w.state={turboModeActive:true,sequenceId:'A',selectedSequenceId:'A',imageId:'1',jimuMapView:{view}};w.props={config:{}};w.turboCoverageLayer=layer;w._selectionRequestId=1;w._turboRequestCount=1;w._liveSequenceFrames={sequenceId:'A',markerWindow(){throw Error('Native selection must not enumerate markers')}};w._nativeSequenceSelection=new NativeSequenceSelection();w._nativeSequenceSelection.bind(layer,style().layers);w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.updateMinimapTracking=()=>{};w.showTurboInteractionHelp=()=>{};w.getTurboFilters=()=>({});
 w.ArcGISModules={Graphic:class{constructor(p){allocations++;Object.assign(this,p)}},Point:class{constructor(p){Object.assign(this,p)}clone(){return {...this}}}};
 w.ensureActiveSequenceLayer=()=>{if(!w._activeSequenceOverlay?.layer){const graphics=[];w._activeSequenceOverlay={view,points:new Map(),layer:{graphics:{toArray:()=>graphics.slice()},add:g=>graphics.push(g),removeMany:items=>items.forEach(g=>{const i=graphics.indexOf(g);if(i>=0)graphics.splice(i,1)})}}}return w._activeSequenceOverlay.layer};w.allocations=()=>allocations;
 return {w,view,layer};
}
test('native marker refresh disposes all legacy route graphics without losing minimap geometry',async()=>{
 const {w,view,layer}=setup(),abort=new AbortController();let disposed=0;const geometry={paths:[[[1,2],[3,4]]]};
 w._liveSequenceLine={sequenceId:'A',geometry};w._sequenceMarkerAbort=abort;
 w._activeSequenceOverlay={view,dispose(){disposed++}};
 await w.refreshSequenceMarkerWindow();assert(abort.signal.aborted);assert.equal(disposed,1);assert.equal(w.allocations(),0);
 assert.equal(w._liveSequenceLine.geometry,geometry);assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#0000ff');
});
test('runtime hover uses native blue styles without creating a separate green layer',()=>{
 const {w,layer}=setup();w.highlightSequenceOnVTL('B');assert.equal(w._hoveredNativeSequenceId,'B');
 assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');
 w.highlightSequenceOnVTL(null);assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#35AF6D');
 assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#0000ff');assert.equal(w._sequenceHoverHighlight,undefined);
});
test('moving between native images in the same hovered sequence does not rebuild styles',()=>{
 const {w,layer}=setup();
 w.clearTurboHover=()=>{};w.showTurboHover=()=>{};w.prepareCoverageFrameHover=()=>{};
 w.coverageSelectionContext=()=>({});w._coverageSelectionTargets={hover(){}};
 for(const id of ['1','2']){
  w.updateTurboHover({attributes:{image_id:id,sequence_id:'B'}},0,0);
  if(id==='1')w.firstHoverCalls=layer.calls.length;
 }
 assert.equal(layer.calls.length,w.firstHoverCalls);
 assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');
 w.clearTurboHoverDetails();
 assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#35AF6D');
 assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#0000ff');
});
test('direct point drawing cannot reintroduce sequence graphics in Turbo',()=>{const {w}=setup();w.drawPointWithoutRemoving(1,2,[0,0,255,1],'A','1');assert.equal(w.allocations(),0)});
for(const type of ['2d','3d'])test(type+': delayed complete route updates minimap geometry without drawing over native coverage',async()=>{
 const {w,view}=setup(24,type);let resume;const held=new Promise(r=>resume=r);yieldSequenceWorkImpl=()=>held;
 const route=Array.from({length:260},(_,i)=>({id:String(i),lon:i,lat:i}));
 try {
  const task=w.renderLiveSequenceLine(route,'A',1,new AbortController(),view);
  assert.equal(w._liveSequenceLine,undefined);assert.equal(w._activeSequenceOverlay,undefined);
  resume();await task;
  assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,260);
  assert.equal(w._activeSequenceOverlay,undefined,'no main-map GraphicsLayer');
 } finally {resume();yieldSequenceWorkImpl=async()=>{}}
});
test('a superseded background route cannot replace the minimap route or add an overview',async()=>{
 const {w,view}=setup();let resume;const held=new Promise(r=>resume=r);yieldSequenceWorkImpl=()=>held;
 try {
  const route=Array.from({length:260},(_,i)=>({id:String(i),lon:i,lat:i}));
  const task=w.renderLiveSequenceLine(route,'A',1,new AbortController(),view);
  w._selectionRequestId=2;w._liveSequenceLine={sequenceId:'B',geometry:{}};resume();await task;
  assert.equal(w._liveSequenceLine.sequenceId,'B');assert.equal(w._activeSequenceOverlay,undefined);
 } finally {resume();yieldSequenceWorkImpl=async()=>{}}
});
test('legacy coverage still draws its route',async()=>{
 const {w,view}=setup();w.state.turboModeActive=false;w._liveSequenceFrames.markerWindow=()=>null;
 await w.renderLiveSequenceLine([{id:'1',lon:1,lat:2},{id:'2',lon:2,lat:3}],'A',1,new AbortController(),view);
 assert.equal(w._activeSequenceOverlay.layer.graphics.toArray().length,1);
});
for(const type of ['2d','3d'])for(const zoom of [19,24,26])test(`native picking keeps corrected centers at zoom ${zoom} in ${type}`,async()=>{const {w,view}=setup(zoom,type),offset=nativeCoverageOffsetMeters(14);let visits=0;w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visits++;visit({lon:10,lat:20,imageId:'1'})};const result=await w.pickTurboGraphic({x:10+offset,y:20-offset},view,new AbortController().signal);assert(visits);assert.equal(result.attributes.image_id,'1');assert.equal(result.geometry.x,10+offset);assert.equal(result.geometry.y,20-offset);if(type==='3d')assert.equal(result.geometry.z,123)});
test('canceled native picking cannot commit a late result',async()=>{const {w,view}=setup(),abort=new AbortController();w.visitTurboPickCoverage=async(box,filter,signal,visit)=>{visit({lon:10,lat:20,imageId:'1'});abort.abort()};assert.equal(await w.pickTurboGraphic({x:10,y:20},view,abort.signal),null)});
test('coverage style commit uses the latest selection after an asynchronous style load',async()=>{const {w,layer,view}=setup();let finish;const held=new Promise(r=>finish=r);layer.loadStyle=async s=>{await held;layer.styles=structuredClone(s.layers)};w.canInitializeCoverage=()=>true;w.ensureArcGISModules=async()=>{};w.getTurboOrganizationId=()=>undefined;w._turboCoverageOriginalStyle={};w.waitForTurboCoverageReady=async()=>{};w.setState=p=>Object.assign(w.state,p);w.enforceMapillaryLayerOrder=()=>{};w.log=()=>{};w._turboTileCache={byteLength:0,size:0};w.accessToken='test';const task=w.loadTurboCoverageLayer(undefined,1,new AbortController());await new Promise(r=>setImmediate(r));w.state.sequenceId=w.state.selectedSequenceId='B';finish();await task;assert.equal(w._loadedTurboFiltersKey.includes('native'),true);assert.equal(visible(layer.styles,'image',{sequence_id:'B'})[0].paint['circle-color'],'#0000ff');assert.equal(visible(layer.styles,'image',{sequence_id:'A'})[0].paint['circle-color'],'#35AF6D')});
test('retired close renderer and hybrid pick branches are absent',()=>{assert(!cl.members.some(m=>['loadTurboCloseGraphics','releaseTurboCloseGraphics','refreshHybridSequenceMembership'].includes(m.name?.getText(sf))));assert(!method('pickTurboGraphic').includes('closeZoom'));assert(!source.includes('_turboClose'));assert(method('hydrateLiveSequence').includes('this.state.turboModeActive ||'));assert(method('componentDidUpdate').includes('this.updateNativeSequenceSelection()'))});

test('cached tile preview supplies minimap geometry without an extra main-map overview',async()=>{
 const {w}=setup();w._turboTileCache={snapshot:()=>[['14/1/2',new ArrayBuffer(1)]]};
 await w.showCachedSequencePreview('A',1,new AbortController().signal);
 assert.equal(w._liveSequenceLine.sequenceId,'A');assert.equal(w._liveSequenceLine.geometry.paths[0].length,2);assert.equal(w._activeSequenceOverlay,undefined);
});
