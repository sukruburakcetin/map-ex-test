const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8');
const sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');
const body=['loadSequenceById','refreshLocalSequence'].map(name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\n');
const Harness=new Function(ts.transpileModule('class Harness{'+body+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText+';return Harness;')();
const flush=()=>new Promise(r=>setImmediate(r));
function setup(){
 const w=new Harness(),events=[],moves=new Map();w.state={sequenceImages:[],jimuMapView:{view:{}},isLoading:false,turboModeActive:true};w.sequenceCoordsCache={};w._selectionRequestId=0;
 w._liveSequenceFrames={cancelPending(){},beginSelection(id){this.sequenceId=id;events.push('seed')},finish(){},remember(){},find(){},current:null};w._liveFrameDetails={clear(){}};w._nearbyDiscovery={cancel(){}};
 w.clearGreenPulse=w.clearConeGraphics=w.clearActiveSequenceLayer=()=>{};w.drawPulsingPoint=()=>({});w.drawCone=()=>{};w.coneLengths=[1];w.coneSpreads=[1];w.zoomStepIndex=0;w.checkForTimeTravel=()=>{};w.ensureImageViewer=()=>events.push('viewer');
 w.setState=(patch,callback)=>{const next=typeof patch==='function'?patch(w.state):patch;if(next)Object.assign(w.state,next);if(next?.isLoading===false)events.push('loading-cleared');callback?.()};
 w.mapillaryViewer={moveTo(id){events.push('move:'+id);return new Promise((resolve,reject)=>moves.set(id,{resolve,reject}))},getImage:async()=>({id:w.state.imageId,originalLngLat:{lng:1,lat:2}})};
 w.getSelectedImageCoords=async()=>{events.push('metadata');throw new Error('Unexpected coordinate query')};
 w.updateNativeSequenceSelection=()=>events.push('selection');w.refreshSequenceMarkerWindow=async()=>{};w.showCachedSequencePreview=async()=>events.push('preview');w.prepareDemandSequence=async()=>events.push('route');
 return {w,events,moves};
}
test('clicked image navigation begins before coordinate queries, styling or route preparation',async()=>{
 const {w,events,moves}=setup(),task=w.loadSequenceById('A','1');await flush();assert(events.includes('move:1'));assert(!events.includes('metadata'));assert(!events.includes('preview'));assert(!events.includes('route'));assert.equal(w.state.isLoading,true);
 events.push('image-shown');moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2},capturedAt:123});await task;
 assert.equal(w.state.isLoading,false);assert(events.indexOf('image-shown')<events.indexOf('loading-cleared'));assert(events.indexOf('image-shown')<events.indexOf('route'));assert(!events.includes('metadata'));assert.equal(w._lastSuccessfulSelection.imageId,'1');
});
test('optional metadata cannot keep the image loading indicator active after the image opens',async()=>{
 const {w,events,moves}=setup();let resume;w.getSelectedImageCoords=()=>new Promise(r=>resume=r);const task=w.loadSequenceById('A','1');await flush();moves.get('1').resolve({id:'1'});await flush();assert.equal(w.state.isLoading,false);assert(!events.includes('route'));resume({id:'1',lon:1,lat:2});await task;assert(events.includes('route'));
});
test('a completed old click cannot overwrite a newer clicked image or restart its route',async()=>{
 const {w,events,moves}=setup(),a=w.loadSequenceById('A','1');await flush();const b=w.loadSequenceById('B','2');await flush();moves.get('2').resolve({id:'2',originalLngLat:{lng:3,lat:4}});await b;moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await a;assert.equal(w.state.imageId,'2');assert.equal(w.state.sequenceId,'B');assert.equal(w._lastSuccessfulSelection.imageId,'2');assert.equal(events.filter(e=>e==='route').length,1);
});
test('metadata failure after opening does not roll back the displayed image',async()=>{
 const {w,moves}=setup(),task=w.loadSequenceById('A','1');await flush();moves.get('1').resolve({id:'1'});await task;assert.equal(w.state.imageId,'1');assert.equal(w.state.isLoading,false);assert.match(w.state.selectionError,/Image is open/);
});
test('an older viewer image event cannot cancel a newer click while it is opening',async()=>{
 let callback;function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(sf)==='this.mapillaryViewer.on'&&node.arguments[0]?.text==='image')callback=node.arguments[1];ts.forEachChild(node,visit)}visit(widget);assert(callback);
 const code=ts.transpileModule('const factory=function(){return ('+callback.getText(sf)+')}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
 const viewer={},factory=new Function('profileEventViewer',code+';return factory;')(viewer);
 const state={mapillaryViewer:viewer,state:{isLoading:true},_selectionRetry:{imageId:'new'}};
 const handler=factory.call(state);await handler({image:{id:'old'}});assert.equal(state._profileConfirmedImageId,undefined);assert.equal(state._selectionRetry.imageId,'new');
});

function liveOwner(){const mod={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/imagery/LiveSequenceFrames.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(mod,mod.exports);return new mod.exports.LiveSequenceFrames(async()=>{throw Error('unnecessary metadata')})}
test('a long warm route reuses its indices and never traverses the route during an exact image click',async()=>{
 const {w,events,moves}=setup();let armed=false;const points=Array.from({length:4096},(_,i)=>({id:String(i+1),lon:1,lat:2}));
 const route=new Proxy(points,{get(target,key,receiver){if(armed&&(key===Symbol.iterator||key==='some'||key==='forEach'||key==='find'||/^[0-9]+$/.test(String(key))))throw Error('warm route traversed');return Reflect.get(target,key,receiver)}});
 w._liveSequenceFrames=liveOwner();w._liveSequenceFrames.begin('A',[]);w._liveSequenceFrames.finish('A',route);w.state.sequenceId=w.state.selectedSequenceId='A';w.state.sequenceImages=route;w._liveSequenceLine={sequenceId:'A'};w._lastSuccessfulSelection={sequenceImages:route,sequenceId:'A',imageId:'old'};w.sequenceCoordsCache.A=route;armed=true;
 const work=w.loadSequenceById('A','2');await flush();assert(events.includes('move:2'));assert.equal(w._liveSequenceFrames.complete,route);moves.get('2').resolve({id:'2',originalLngLat:{lng:1,lat:2}});await work;assert.equal(w.state.imageId,'2');assert.equal(w._liveSequenceFrames.complete,route);assert(!w.state.selectionError);assert(!events.includes('route'));
});
test('a different sequence cached route is untouched until the requested image opens',async()=>{
 const {w,events,moves}=setup();const route=new Proxy([{id:'1',lon:1,lat:2}],{get(target,key,receiver){if(key===Symbol.iterator||key==='forEach'||key==='some'||/^[0-9]+$/.test(String(key)))assert(events.includes('image-shown'),'route visited before image');return Reflect.get(target,key,receiver)}});w.sequenceCoordsCache.A=route;w._liveSequenceFrames=liveOwner();
 w.prepareDemandSequence=async id=>{events.push('route');w._liveSequenceFrames.finish(id,w.sequenceCoordsCache[id])};const work=w.loadSequenceById('A','1');await flush();assert(events.includes('move:1'));assert.equal(w._liveSequenceFrames.complete,null);events.push('image-shown');moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await work;assert.equal(w._liveSequenceFrames.complete,route);
});

test('viewer events during opening cannot start local enumeration before cached context is adopted',async()=>{
 const {w,events,moves}=setup();let windows=0;w._liveSequenceFrames=liveOwner();w._sequenceDemand={window:async()=>{windows++;throw Error('unnecessary local request')}};
 const cached=[{id:'1',lon:1,lat:2}];w.sequenceCoordsCache.A=cached;w.prepareDemandSequence=async id=>{w._liveSequenceFrames.finish(id,cached);w._localSequenceDeferredRequest=null};
 const work=w.loadSequenceById('A','1');await flush();await w.refreshLocalSequence();assert.equal(windows,0);
 // A viewer state callback may run after the image loader clears but while cache adoption is pending.
 w.state.isLoading=false;await w.refreshLocalSequence();assert.equal(windows,0);
 moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await work;await w.refreshLocalSequence();assert.equal(windows,0);assert.equal(w._liveSequenceFrames.complete,cached);
});
