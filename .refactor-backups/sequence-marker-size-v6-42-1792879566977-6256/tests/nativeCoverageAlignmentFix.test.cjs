const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const modules=new Map();function load(rel){if(modules.has(rel))return modules.get(rel);const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);modules.set(rel,m.exports);return m.exports;}
const {nativeCoverageOffsetMeters,nativeCircleSymbolMetrics}=load('features/coverage/nativeCoverageAlignment');
const {nativeImageAnchor}=load('features/coverage/nativeImageAnchor');
const {SequenceTileIndex}=load('features/coverage/SequenceTileIndex');
const {TileSequenceHighlights}=load('features/coverage/TileSequenceHighlights');
const {CoverageSelectionTargets}=load('features/coverage/CoverageSelectionTargets');
const {BackgroundRequestQueue}=load('features/imagery/BackgroundRequestQueue');
const {SelectionPulse}=load('features/map-graphics/SelectionPulse');
const {lonLatToWebMercator}=load('utils/geoUtils');
const {TurboTileCache}=load('utils/turboCoverageUtils');
const world=2*Math.PI*6378137,span=world/2**14,offset=world/2**14/4096/4;
const raw={x:2000/4096*span,y:-2048/4096*span},sourceTile=[8192,8192,14];
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function layers(){const items=[{id:'I1',sequence_id:'A',x:2000,y:2048},{id:'I2',sequence_id:'A',x:2001,y:2049}];return {image:{length:items.length,feature:i=>({extent:4096,properties:items[i],loadGeometry:()=>[[items[i]]]})},sequence:{length:1,feature:()=>({extent:4096,properties:{id:'A'},loadGeometry:()=>[[{x:2000,y:1900},{x:2000,y:2200}]]})}};}
const flush=()=>new Promise(r=>setImmediate(r));
function deferred(){let resolve;return{promise:new Promise(r=>resolve=r),resolve};}

for(const zoom of [18,23,24])for(const rotation of [0,37,120])test(`native circle footprint includes packed corners at zoom ${zoom}, rotation ${rotation}`,()=>{
 const resolution=156543.03392804097/2**zoom,r=2.5,s=1,p=r+s,d=offset/resolution;
 const a=rotation*Math.PI/180;
 // Two independent corner displacement vectors: CSS extrusion plus rotated tile packing.
 const vx=[p+d*Math.cos(a),d*Math.sin(a)],vy=[-d*Math.sin(a),p+d*Math.cos(a)];
 const expected=Math.sqrt(vx[0]**2+vx[1]**2),metrics=nativeCircleSymbolMetrics(r,s,14,resolution,rotation);
 near(Math.hypot(...vy),expected);near(metrics.size/.75/2+metrics.outlineWidth/.75/2,expected);near(metrics.outlineWidth/.75/expected,s/p);
});
test('invalid display resolution creates no speculative correction',()=>{for(const value of [undefined,NaN,0,-1,Infinity])assert.equal(nativeCircleSymbolMetrics(2.5,1,14,value),null);});

test('2D lines stay at raw tile coordinates while circles use native centers; shared symbols update without tile work',async()=>{
 let resolution=156543.03392804097/2**23,rotation=0,loads=0,decodes=0,created=0,symbols=0;const displayed={};const bytes=new ArrayBuffer(1),owner=new TileSequenceHighlights();
 owner.bind({tiles:()=>[sourceTile],zoom:()=>23,resolution:()=>resolution,rotation:()=>rotation,styles:[{id:'line',type:'line','source-layer':'sequence',paint:{'line-width':2}},{id:'point',type:'circle','source-layer':'image',paint:{'circle-radius':2.5,'circle-stroke-width':1}}],load:async()=>{loads++;return bytes;},decode:()=>{decodes++;return{layers:layers()};},symbol:p=>{symbols++;return p;},create:p=>{created++;return p;},replace:(role,graphics)=>displayed[role]=graphics,dispose(){},warn:e=>{throw e;}});
 await owner.select('A');const [line,first,second]=displayed.selected;near(line.geometry.paths[0][0][0],raw.x);near(first.geometry.x,raw.x+offset);near(first.geometry.y,raw.y-offset);assert.equal(first.symbol,second.symbol);assert.equal(symbols,1);
 const size=first.symbol.size;resolution/=2;rotation=37;owner.refreshSymbols();assert(first.symbol.size>size);assert.equal(first.symbol,second.symbol);assert.deepEqual([loads,decodes,created,symbols],[1,1,3,1]);
 await owner.hover('A');near(displayed.hover[0].geometry.paths[0][0][0],raw.x);assert.deepEqual([loads,decodes],[1,1]);owner.detach();
});

test('shared membership builds one ID lookup and resolves only the requested image geometry',async()=>{
 const bytes=new ArrayBuffer(10),owner=new SequenceTileIndex(),signal=new AbortController().signal;let geometries=0,properties=0;
 const source=layers(),decode=()=>({layers:{image:{length:2,feature:i=>{const f=source.image.feature(i);return{extent:f.extent,get properties(){properties++;return f.properties;},loadGeometry(){geometries++;return f.loadGeometry();}};}}}});
 const index=await owner.get(bytes,decode,signal);assert.equal(geometries,0);assert.equal(properties,2);assert.equal(index.imageIndex('I2'),1);assert.equal(index.imageIndex('missing'),undefined);
 const point=nativeImageAnchor(bytes,index,decode,sourceTile,'I1');near(point.x,raw.x+offset);near(point.y,raw.y-offset);assert.equal(geometries,1);assert.equal(properties,3);
 assert.equal(nativeImageAnchor(bytes,index,decode,sourceTile,'missing'),null);assert.equal(geometries,1);assert.equal(await owner.get(bytes,decode,signal),index);assert.equal(properties,3);assert(index.estimatedBytes>10+2*112);
});

test('buffered duplicate image points are not accepted as canonical anchors',async()=>{
 const bytes=new ArrayBuffer(1),decode=()=>({layers:{image:{length:1,feature:()=>({properties:{id:'I1',sequence_id:'A'},extent:4096,loadGeometry:()=>[[{x:-1,y:2}]]})}}});const index=await new SequenceTileIndex().get(bytes,decode,new AbortController().signal);
 assert.equal(nativeImageAnchor(bytes,index,decode,sourceTile,'I1'),null);
});

const source=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');
const member=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);
const Runtime=new Function('nativeImageAnchor','VectorTile','Pbf','ZOOM','lonLatToWebMercator',compile('class Runtime{'+['coverageSelectionContext','getCoverageDisplayPosition','resolveNativeImageAnchor','clearGreenPulse','drawCone'].map(member).join('\n')+'}')+';return Runtime;')(nativeImageAnchor,class{constructor(){this.layers=layers();}},class{},{TILE_FETCH:14},lonLatToWebMercator);
class Point{constructor(p){Object.assign(this,p);this.type='point';}get longitude(){return this.x/6378137*180/Math.PI;}get latitude(){return Math.atan(Math.sinh(this.y/6378137))*180/Math.PI;}clone(){return new Point({...this});}}
function setup(type='2d'){
 const w=new Runtime(),view={type,zoom:23,destroyed:false,map:{reorder(){},layers:[]}};w.state={jimuMapView:{view},turboModeActive:true,imageId:'I1',sequenceId:'A'};w._nativeSequenceSelection={};w._coverageSelectionTargets=new CoverageSelectionTargets();w._turboRequestCount=1;w.accessToken='test';w.ArcGISModules={Point};w._turboTileCache=new TurboTileCache();w._index=new SequenceTileIndex();w._sequenceTileIndex=w._index;w.getSequenceTileIndex=(bytes,signal)=>w._index.get(bytes,()=>({layers:layers()}),signal);w._backgroundRequests=new BackgroundRequestQueue(1);w.runSequenceBackground=(job,signal)=>w._backgroundRequests.run(job,signal);w._nativeImageAnchorKey='';w.coneLengths=[5];w.coneSpreads=[60];w.zoomStepIndex=0;w._poses=[];w.drawPulsingPoint=(lon,lat,color,id)=>w._poses.push(w.getCoverageDisplayPosition(id,lon,lat));w.log=()=>{};w.ensureSelectionPulseOwner=()=>({dispose(){}});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(view,layer,center)=>{w._cone=center;return{};}});return w;
}
const api={lon:raw.x/6378137*180/Math.PI,lat:Math.atan(Math.sinh(raw.y/6378137))*180/Math.PI};
for(const type of ['2d','3d'])test(`${type}: playback resolves native circle and cone center from warm bytes without fetching or changing API coordinates`,async()=>{
 const w=setup(type);w._turboTileCache.set('14/8192/8192',new ArrayBuffer(1));w.getTurboTileBuffer=()=>{throw Error('Warm alignment must not fetch');};
 await w.resolveNativeImageAnchor('I1',api.lon,api.lat);assert.equal(w._poses.length,1);near(w._poses[0].geometry.x,raw.x+offset);near(w._poses[0].geometry.y,raw.y-offset);near(w._cone.x,raw.x+offset);near(w._cone.y,raw.y-offset);assert.equal(w._index.stats.builds,1);
 await w.resolveNativeImageAnchor('I1',api.lon,api.lat);assert.equal(w._poses.length,1);assert.equal(w._index.stats.builds,1);
 w.state.imageId='I2';await w.resolveNativeImageAnchor('I2',api.lon,api.lat);assert.equal(w._index.stats.builds,1);assert.equal(w._poses.length,2);assert.equal(w._backgroundRequests.stats.completed,1);
});

test('missing tile waits for imagery priority, is shared per active image and clear cancels queued alignment',async()=>{
 const w=setup();w._backgroundRequests.setPaused(true);let fetches=0;w.getTurboTileBuffer=async()=>{fetches++;return new ArrayBuffer(1);};
 const first=w.resolveNativeImageAnchor('I1',api.lon,api.lat);await w.resolveNativeImageAnchor('I1',api.lon,api.lat);await flush();assert.equal(w._backgroundRequests.stats.queued,1);assert.equal(fetches,0);
 w.clearGreenPulse();await first;w._backgroundRequests.setPaused(false);await flush();assert.equal(fetches,0);assert.equal(w._poses.length,0);
 await w.resolveNativeImageAnchor('I1',api.lon,api.lat);assert.equal(fetches,1);assert.equal(w._poses.length,1);
});

test('late index resolution cannot move a new image or transfer an anchor into another view',async()=>{
 for(const change of ['image','view','revision']){const w=setup(),held=deferred();w._turboTileCache.set('14/8192/8192',new ArrayBuffer(1));w.getSequenceTileIndex=()=>held.promise;
 const work=w.resolveNativeImageAnchor('I1',api.lon,api.lat);await flush();if(change==='image')w.state.imageId='I2';if(change==='view')w.state.jimuMapView={view:{type:'3d',zoom:23}};if(change==='revision')w._turboRequestCount++;
 held.resolve({imageIndex:()=>0});await work;assert.equal(w._poses.length,0);assert.equal(w._coverageSelectionTargets.anchor(w.coverageSelectionContext(),'I1'),null);}
});

test('3D pulse projects the currently rendered terrain height, refreshing without network or another animation loop',()=>{
 const callbacks=new Map();let serial=0,height=100,samples=0,projected,groundChanged,groundRemoved=0;const overlay={style:{},setAttribute(){},remove(){}};const layer={visible:true,add(){},remove(){},destroy(){}};
 const view={type:'3d',width:900,height:700,updating:false,stationary:true,container:{appendChild(){}},map:{add(){},remove(){}},graphics:{remove(){}},groundView:{elevationSampler:{noDataValue:-999,on:(event,callback)=>{assert.equal(event,'changed');groundChanged=callback;return{remove(){groundRemoved++;}};},queryElevation:p=>{samples++;return {...p,z:height};}}},toScreen:p=>{projected=p;return{x:450,y:350};}};
 const clock={now:()=>0,request:callback=>{callbacks.set(++serial,callback);return serial;},cancel:id=>callbacks.delete(id),clearInterval(){}};const owner=new SelectionPulse({graphic:null},{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>overlay},clock);
 const frame=t=>{const jobs=[...callbacks.values()];callbacks.clear();jobs.forEach(job=>job(t));};
 owner.show(view,{geometry:{x:raw.x+offset,y:raw.y-offset,z:0}},api.lon,api.lat,[0,255,0,1],'I1');frame(16);assert.equal(projected.z,100);assert.equal(overlay.style.display,'block');assert.equal(callbacks.size,1);frame(32);assert.equal(samples,1);
 view.updating=true;height=140;frame(48);assert.equal(projected.z,140);assert.equal(samples,2);assert.equal(callbacks.size,1);view.updating=false;height=150;groundChanged();frame(64);assert.equal(projected.z,150);assert.equal(samples,3);owner.dispose();assert.equal(callbacks.size,0);assert.equal(groundRemoved,1);
});

test('3D cone apex stays on the image ground point while the rest of its wedge remains lifted',()=>{
 const {CameraConeGraphics}=load('features/map-graphics/CameraConeGraphics');const included=new Set(),layer={graphics:{includes:g=>included.has(g)},add:g=>included.add(g),removeAll:()=>included.clear()},view={graphics:{forEach(){},remove(){}}};const owner=new CameraConeGraphics(()=>layer);
 const graphic=owner.render(view,layer,raw,0,0,5,60,true,p=>p);
 assert.deepEqual(graphic.geometry.rings[0][0],[raw.x,raw.y,0]);assert.equal(owner.parts[2].geometry.paths[0][0][2],0);assert(graphic.geometry.rings[0].slice(1,-1).some(p=>p[2]>0));
});

test('missing scene terrain is retried at a bounded rate even after the view becomes stationary',()=>{
 const callbacks=new Map();let serial=0,samples=0,ready=false,projection;const layer={visible:true,add(){},remove(){},destroy(){}},overlay={style:{},setAttribute(){},remove(){}};
 const view={type:'3d',width:900,height:700,updating:false,stationary:true,container:{appendChild(){}},map:{add(){},remove(){}},graphics:{remove(){}},groundView:{elevationSampler:{noDataValue:-999,queryElevation:p=>{samples++;return {...p,z:ready?1000:-999};}}},toScreen:p=>{projection=p;return{x:450,y:350};}};
 const owner=new SelectionPulse({graphic:null},{point:p=>p,layer:()=>layer,graphic:p=>p,overlay:()=>overlay},{now:()=>0,request:f=>{callbacks.set(++serial,f);return serial;},cancel:id=>callbacks.delete(id),clearInterval(){}});
 const frame=t=>{const jobs=[...callbacks.values()];callbacks.clear();jobs.forEach(f=>f(t));};owner.show(view,{geometry:{x:1,y:2,z:0}},0,0,[0,255,0,1],'I1');frame(16);assert.equal(samples,1);frame(32);assert.equal(samples,1);ready=true;frame(120);assert.equal(samples,2);assert.equal(projection.z,1000);frame(136);assert.equal(samples,2);owner.dispose();
});

test('image ID lookup respects the existing estimated byte budget without truncating oversized results',async()=>{
 const owner=new SequenceTileIndex(1000),bytes=new ArrayBuffer(1),items=Array.from({length:20},(_,i)=>({id:'image-'+i,sequence_id:'A'}));
 const index=await owner.get(bytes,()=>({layers:{image:{length:items.length,feature:i=>({properties:items[i]})}}}),new AbortController().signal);
 assert.equal(owner.stats.entries,0);assert.equal(owner.stats.bytes,0);assert.equal(index.imageIndex('image-19'),19);assert.equal(index.indices('image','A').length,20);
});


test('warm bytes cannot start alignment indexing before the current image paint gate releases',async()=>{
 const w=setup();w._turboTileCache.set('14/8192/8192',new ArrayBuffer(1));w.state.isLoading=false;w._imageryOpeningRequest=7;w._backgroundRequests.setPaused(true);let builds=0;const get=w.getSequenceTileIndex;w.getSequenceTileIndex=(...args)=>{builds++;return get(...args);};
 const work=w.resolveNativeImageAnchor('I1',api.lon,api.lat);await flush();assert.equal(builds,0);assert.equal(w._poses.length,0);assert.equal(w._backgroundRequests.stats.queued,1);w._imageryOpeningRequest=null;w._backgroundRequests.setPaused(false);await work;assert.equal(builds,1);assert.equal(w._poses.length,1);
});
