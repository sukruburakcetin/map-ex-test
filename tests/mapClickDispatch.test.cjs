const test=require('node:test'),assert=require('node:assert/strict');
const {setup}=require('./helpers/mapClickFixture.cjs');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function trace(legacy,options,action){
 const f=setup({...options,legacy}),w=f.widget,effects=[];
 const set=w.setState;w.setState=patch=>{effects.push(['state',patch]);set.call(w,patch);};
 w._pendingCoverageHover={clear:()=>effects.push(['clearPending'])};
 w.drawClickRipple=(...args)=>effects.push(['ripple',...args]);
 w.updateTurboPickWarning=(...args)=>effects.push(['warning',...args]);
 w.showToast=(...args)=>effects.push(['toast',...args]);w._owned=s=>s;
 w._coverageSelectionTargets.retain=(_context,id,_geometry,sequence)=>effects.push(['retain',id,sequence]);
 await action(f,effects);
 return {trace:f.trace,effects,revision:w._mapClickRevision,featureAborted:w._mapFeatureClickAbort?.signal.aborted,coverageAborted:w._turboClickPickAbort?.signal.aborted};
}
const cases=[
 ['exact hover shortcut',{},async f=>{await f.handler();}],
 ['cloud precedence',{priority:'cloud'},async f=>{f.widget._pointCloudHits.route=()=>true;const work=f.handler();f.release({results:[]});await work;}],
 ['enterprise note precedence',{priority:'notes'},async(f,e)=>{f.view.openPopup=()=>e.push(['enterprisePopup']);const work=f.handler();f.release({results:[{layer:f.widget._sharedNotesLayer,graphic:{geometry:{}}}]});await work;}],
 ['local note selection',{priority:'notes'},async(f,e)=>{const note={id:'note',note:'text'},graphic={};f.widget._fieldNoteMap.noteForGraphic=g=>g===graphic?note:null;f.widget._fieldNoteMap.focusNote=async n=>e.push(['focus',n.id]);const work=f.handler();f.release({results:[{layer:{id:'notes'},graphic}]});await work;}],
 ['note/object explicit choice',{priority:'notes',detection:true},async(f,e)=>{f.widget.offerNoteObjectChoice=()=>{e.push(['choice']);return true;};f.view.openPopup=()=>{throw Error('choice must remain explicit');};const work=f.handler();f.release({results:[{layer:f.widget._sharedNotesLayer,graphic:{geometry:{}}}]});await work;}],
 ['direct POI precedes coverage',{priority:'places'},async(f,e)=>{f.widget.showPlacesHit=()=>{e.push(['place']);return true;};const work=f.handler();f.release({results:[]});await work;}],
 ['route pick before hit testing',{},async(f,e)=>{f.widget.state.routePickMode='end';f.widget.setRoutePoint=(...args)=>e.push(['route',...args]);await f.handler();}],
 ['annotation before hit testing',{},async(f,e)=>{f.widget.state.isAnnotationMode=true;f.widget._annotationCloudPick={pick:async(_hit,p)=>e.push(['annotate',p.longitude,p.latitude])};await f.handler();}],
 ['workspace location before imagery',{},async(f,e)=>{f.widget._workspaceNoteLocation={active:true,consume:(_view,p)=>e.push(['location',p])};await f.handler();}],
 ['closed widget',{},async f=>{f.widget.props.state='CLOSED';await f.handler();}],
 ['hidden widget',{},async f=>{f.widget.props.visible=false;await f.handler();}],
 ['route overlay exact image',{hovered:false,priority:'features',detection:true},async(f,e)=>{const work=f.handler();f.release({results:[{layer:{id:'route'},graphic:{__isActiveSequencePoint:true,attributes:{sequenceId:'route',image_id:'frame'},geometry:{type:'point'}}}]});await work;}],
 ['native detection precedes imagery',{detection:true},async(f,e)=>{f.widget.pickMapFeature=async()=>({graphic:{id:'detection'}});f.widget.openPickedMapDetection=()=>e.push(['detection']);await f.handler();}],
 ['no coverage mode hint',{hovered:false},async f=>{f.widget.state.turboModeActive=false;const work=f.handler();f.release({results:[]});await work;}],
 ['no matching coverage point',{},async f=>{f.widget._coverageSelectionTargets.snapshot=()=>null;f.widget.pickTurboGraphic=async()=>null;f.widget.pickTurboRepresentative=async()=>null;const work=f.handler();f.release({results:[]});await work;}],
];
for(const[name,options,action]of cases)test('frozen/current click dispatch: '+name,async()=>assert.deepEqual(await trace(false,options,action),await trace(true,options,action)));
for(const zoom of [16,19])test('native POI cluster at zoom '+zoom,async()=>{
 const action=async(f,e)=>{f.view.zoom=zoom;const owner={screenTarget:()=>null};f.widget._places=f.widget._placesTilesOwner=owner;f.widget._placesVectorLayer={cancelPick(){},resolve:async()=>({attributes:{cluster_count:3},geometry:{id:'cluster'}})};f.widget.placesBusy=()=>false;f.view.goTo=async target=>e.push(['zoom',target.zoom]);const work=f.handler();f.release({results:[]});await work;};
 assert.deepEqual(await trace(false,{hovered:false,priority:'places'},action),await trace(true,{hovered:false,priority:'places'},action));
});
for(const mode of ['choices','replacedOwner','busy'])test('native POI dispatch: '+mode,async()=>{
 const action=async(f,e)=>{const owner={screenTarget:()=>null,openChoices:places=>{e.push(['choices',places.map(p=>p.id)]);return true;}};f.widget._places=f.widget._placesTilesOwner=owner;f.widget.placesBusy=()=>mode==='busy';f.widget._placesVectorLayer={cancelPick(){},resolve:async()=>{e.push(['tileResolve']);if(mode==='replacedOwner')f.widget._places={};return{attributes:{gers_id:'gers-test',place_name:'Place'},geometry:{longitude:1,latitude:2}};}};const work=f.handler();f.release({results:[]});await work;};
 assert.deepEqual(await trace(false,{hovered:false,priority:'places'},action),await trace(true,{hovered:false,priority:'places'},action));
});
for(const loaded of [true,false])test('regional coverage uses '+(loaded?'loaded route':'nearby tile lookup'),async()=>{
 const action=async(f,e)=>{const w=f.widget;w._turboMetadataCache.get=()=>({sequence:'sequence'});w.getTurboOrganizationId=()=>undefined;w._liveSequenceFrames={complete:loaded};w.state.sequenceId=loaded?'sequence':'other';w.state.sequenceImages=[{id:'nearby-memory',lon:1,lat:2}];w.ensureCoverageFrameLookup=()=>({resolve:async(_view,seq,location)=>{e.push(['lookup',seq,location]);return 'nearby-tile';}});const work=f.handler();f.release({results:[]});await work;};
 assert.deepEqual(await trace(false,{regional:true},action),await trace(true,{regional:true},action));
});
for(const change of ['view','close','click','coverage'])test('SDK wait loses click ownership: '+change,async()=>{
 const action=async f=>{const work=f.handler();await flush();if(change==='view')f.widget.state.jimuMapView={view:{}};if(change==='close')f.widget.props.state='CLOSED';if(change==='click')f.widget._mapClickRevision++;if(change==='coverage')f.widget._turboRequestCount++;f.release({results:[]});await work;};
 assert.deepEqual(await trace(false,{priority:'notes'},action),await trace(true,{priority:'notes'},action));
});
test('loaded route geometry selects its nearest retained frame before native detection',async()=>{
 const action=async f=>{f.widget.sequenceCoordsCache={route:[{id:'route-frame',lon:1,lat:2}]};const work=f.handler();f.release({results:[{layer:{id:'route'},graphic:{__isSequenceOverlay:true,attributes:{sequenceId:'route'},geometry:{type:'polyline'}}}]});await work;};
 assert.deepEqual(await trace(false,{hovered:false,priority:'features',detection:true},action),await trace(true,{hovered:false,priority:'features',detection:true},action));
});
