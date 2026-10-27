const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8');
const sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');
const body=widget.members.find(n=>n.name?.getText(sf)==='loadSequenceById').getText(sf);
const Harness=new Function(ts.transpileModule('class Harness{'+body+'}',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText+';return Harness;')();
const flush=()=>new Promise(r=>setImmediate(r));
function setup(){
 const w=new Harness(),events=[],moves=new Map();w.state={sequenceImages:[],jimuMapView:{view:{}},isLoading:false,turboModeActive:true};w.sequenceCoordsCache={};w._selectionRequestId=0;
 w._liveSequenceFrames={cancelPending(){},begin(id){this.sequenceId=id;events.push('seed')},finish(){},remember(){},find(){},current:null};w._liveFrameDetails={clear(){}};w._nearbyDiscovery={cancel(){}};
 w.clearGreenPulse=w.clearConeGraphics=w.clearActiveSequenceLayer=()=>{};w.drawPulsingPoint=()=>({});w.drawCone=()=>{};w.coneLengths=[1];w.coneSpreads=[1];w.zoomStepIndex=0;w.checkForTimeTravel=()=>{};w.ensureImageViewer=()=>events.push('viewer');
 w.setState=(patch,callback)=>{const next=typeof patch==='function'?patch(w.state):patch;if(next)Object.assign(w.state,next);if(next?.isLoading===false)events.push('loading-cleared');callback?.()};
 w.mapillaryViewer={moveTo(id){events.push('move:'+id);return new Promise((resolve,reject)=>moves.set(id,{resolve,reject}))},getImage:async()=>({id:w.state.imageId,originalLngLat:{lng:1,lat:2}})};
 w.getSelectedImageCoords=async()=>{events.push('metadata');throw new Error('Unexpected coordinate query')};
 w.showCachedSequencePreview=async()=>events.push('preview');w.prepareDemandSequence=async()=>events.push('route');
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
