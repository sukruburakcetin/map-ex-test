/** Controlled React callback and creator-lookup boundaries around the complete actual update coordinator. */
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(legacy=false,{deferState=false}={}){
 const events=[],callbacks=[],observers=[],creator=deferred();const log=(name,...args)=>events.push([name,...args]);
 const view={key:'view'},map={view};
 const w={props:{config:{},state:'OPENED',visible:true},state:{jimuMapView:map,sequenceImages:[],imageId:'A',sequenceId:'S',selectedSequenceId:'S',turboModeActive:true,isLoading:false,nearbyStripOpen:false,imageTrayTab:'nearby',isFullscreen:false,turboFilterOrganization:'',turboFilterStartDate:'old-start',turboFilterEndDate:'old-end',isSolarMode:false,isElevationProfileActive:false},
  _nearbyDemandVisible:false,_nearbyPointerInside:false,_nearbyDiscovery:{cancel:()=>log('nearby-cancel')},_routeGeneration:{pending:false,current:()=>true},_coverageAnalysisCurrent:null,_placesVectorLayer:null,_imageryOpeningRequest:null,_backgroundRequests:{setPaused:value=>log('background',value)},_detectionLayers:{reset:kind=>log('reset-detections',kind)},
  mapillaryVTLayer:{},mapillaryTrafficSignsLayer:{},mapillaryObjectsLayer:{},viewerContainer:{current:{key:'container'}},resizeObserver:{disconnect:()=>log('old-observer-disconnect')},
  mapillaryViewer:{resize:()=>log('viewer-resize'),activateComponent:name=>log('activate',name),deactivateComponent:name=>log('deactivate',name)},nearbyPanelVisible:()=>!!w.visibleNearby,
  getTurboOrganizationId:()=>undefined,_t:key=>'translated:'+key,log:message=>log('log',message),showToast:(...args)=>log('toast',...args)};
 const platform={ResizeObserver:class{constructor(callback){this.callback=callback;observers.push(this);log('new-observer')}observe(target){log('observe',target.key)}disconnect(){log('new-observer-disconnect')}}};
 for(const name of ['refreshNearbyAfterPause','cancelCaptureRouteGeneration','cancelCoverageAnalysis','syncPlaces','syncSequenceDiagnostics','updateNativeSequenceSelection','announceNearbyFrames','updateElevationProfile','updateProfileIndicator','syncSceneTerrain','scheduleOrganizationName','updatePointCloudDisplay','syncSharedFieldNotes','drawFieldNoteGraphics','clearSolarGraphics','clearElevationProfile','syncMapLegendLayer','cleanupWidgetEnvironment','claimCurrentImagePresentation','initMapillaryTrafficSignsLayer','initMapillaryObjectsLayer','enableTurboCoverageLayer','disableTurboCoverageLayer','onActiveViewChange','initMapillaryLayer','toggleMapillaryTrafficSigns','toggleMapillaryObjects','resetOrganizationSelection'])w[name]=(...args)=>log(name,...args.map(value=>value===view?'view':value===map?'map':value));
 w.getUserIdFromUsername=username=>{log('creator',username);return creator.promise};
 w.debouncedTurboFilter=()=>log('filter');w.debouncedTurboFilter.cancel=()=>log('filter-cancel');
 w.setState=(patch,after)=>{Object.assign(w.state,patch);log('state',patch);if(after){if(deferState)callbacks.push(after);else after()}};
 require('./widgetUpdateSource.cjs').install(w,platform,legacy);
 const previous=()=>({props:{...w.props,config:{...w.props.config}},state:{...w.state}});
 const update=before=>w.componentDidUpdate(before.props,before.state);
 const drain=()=>{while(callbacks.length)callbacks.shift()()};
 const result=()=>({events,state:{...w.state,jimuMapView:w.state.jimuMapView?.view?.key,sequenceImages:w.state.sequenceImages},props:w.props,nearbyDemand:w._nearbyDemandVisible,nearbyPointer:w._nearbyPointerInside,callbacks:callbacks.length,observers:observers.length});
 return {w,view,map,events,callbacks,observers,creator,log,previous,update,drain,result,flush};
}
exports.fixture=fixture;exports.deferred=deferred;exports.flush=flush;
