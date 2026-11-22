const {createHandler}=require('./viewerImageTrackingSource.cjs');
exports.flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve();};
exports.fixture=(legacy,options={})=>{
 const events=[],commits=[],details=[],frame={id:'new-image',sequenceId:options.lateral?'new-sequence':'sequence',lon:1,lat:2};
 const viewer={},view={id:'view'},previous={id:'old-image',lon:0,lat:0};let resolve,reject,valid=true;
 const metadata=new Promise((a,b)=>{resolve=a;reject=b;});
 const w={mapillaryViewer:viewer,props:{config:{syncMapWithImage:!!options.sync}},
  state:{imageId:'old-image',sequenceId:'sequence',selectedSequenceId:'sequence',sequenceImages:[previous],isLoading:!!options.loading,jimuMapView:options.noView?null:{view},detectionsActive:!!options.detections,isSolarMode:!!options.solar,isElevationProfileActive:!!options.profile},
  _selectionRequestId:4,_localSequenceDeferredRequest:null,_imageryOpeningRequest:options.opening?4:null,
  _selectionRetry:options.retry?{imageId:options.retry,sequenceId:'sequence'}:null,_userPaused:options.paused!==false,_isFlyInActive:!!options.flying,
  _isInitialImageLoad:!!options.initial,_profileConfirmedViewer:options.confirmed?viewer:null,_profileConfirmedImageId:null,_nearbySelectedId:'optimistic',
  _currentImageBearing:{image:(v,id)=>events.push(['bearing',v===viewer,id])},
  _placeNoteReview:{cancel:()=>events.push(['placeReviewCancel'])},_stopRoutePreview:()=>events.push(['stopRoute']),
  _detectionViewerMarkers:{dispose:()=>events.push(['disposeMarkers'])},_detectionImageData:{imageId:'old-image'},_panoramaDetectionLabels:{dispose:()=>events.push(['disposeLabels'])},
  _detectionAbort:new AbortController(),_selectionAbort:new AbortController(),
  _timeTravelAvailability:{cancelUnless:id=>events.push(['timeTravelCancel',id])},_nearbyDiscovery:{cancel:()=>events.push(['nearbyCancel'])},
  _places:options.places?{controller:{sync:()=>events.push(['placesSync'])}}:null,
  _sequencePerformance:{playbackFrame:(...args)=>events.push(['performance',...args])},_reverseAddressEnrichment:{cancel:()=>events.push(['addressCancel'])},_backgroundRequests:{setPaused:value=>events.push(['background',value])},
  _liveFrameDetails:{queue:work=>{events.push(['queueDetails']);details.push(work);}},
 };
 w._selectionAbort.signal.addEventListener('abort',()=>events.push(['abortSelection']));w._detectionAbort.signal.addEventListener('abort',()=>events.push(['abortDetections']));
 w._liveSequenceFrames={sequenceId:frame.sequenceId,resolve:image=>{events.push(['resolve',image.id]);return options.held?metadata:options.failure?Promise.reject(Error('metadata failed')):Promise.resolve(options.noFrame?null:frame);},isCurrent:f=>valid&&f===frame,visible:f=>{events.push(['visible',f.id]);return[f];}};
 w.setState=(update,after)=>{events.push(['commit',typeof update]);const run=()=>{const patch=typeof update==='function'?update():update;events.push(['state',patch]);if(patch)Object.assign(w.state,patch);after?.();};if(options.batched)commits.push(run);else run();};
 for(const name of ['highlightNearbyPin','updateProfileIndicator','applyCustomCameraAngle','cancelDetectionNoteLocation','clearPendingNoteGraphic','updatePlacesCamera','clearActiveSequenceLayer','checkAndLoadNextPointCloud','updateMinimapTracking','syncMapToImage','loadDetections','updateViewerFieldNoteMarkers','checkForTimeTravel','updateSolarGraphics','fetchReverseGeocode','updateUrlWithCurrentImage','fetchNearbyImages'])w[name]=(...args)=>events.push([name,...args.map(v=>v===view?'view':v)]);
 w.prepareDemandSequence=async(sequence,request,controller,v)=>events.push(['prepareDemand',sequence,request,controller.signal.aborted,v===view]);
 w.refreshSequenceMarkerWindow=async()=>events.push(['refreshMarkers']);w.refreshLocalSequence=async()=>events.push(['refreshLocal']);
 w.drawPulsingPoint=(...args)=>{events.push(['pulse',...args]);return{id:'marker'};};
 const cone=(...args)=>events.push(['cone',...args]);
 const handler=createHandler(w,viewer,cone,legacy,{console:{warn:(message,error)=>events.push(['warn',message,error.message])},document:options.hidden?{visibilityState:'hidden'}:undefined});
 const event={image:{id:'new-image',sequenceId:frame.sequenceId}};
 return{w,viewer,view,frame,event,events,commits,details,handler,resolve:()=>resolve(frame),reject:()=>reject(Error('metadata failed')),invalidate:()=>valid=false,
  flushCommits:()=>{for(const run of commits.splice(0))run();},flushDetails:()=>{for(const work of details.splice(0))work();},
  result:()=>({events,image:w.state.imageId,sequence:w.state.sequenceId,selected:w.state.selectedSequenceId,images:w.state.sequenceImages,request:w._selectionRequestId,opening:w._imageryOpeningRequest,retry:w._selectionRetry,deferred:w._localSequenceDeferredRequest,optimistic:w._nearbySelectedId,selection:w._lastSuccessfulSelection,confirmed:w._profileConfirmedImageId,marker:w.currentGreenGraphic,detached:{markers:w._detectionViewerMarkers===null,labels:w._panoramaDetectionLabels===null,image:w._detectionImageData===null}}),
 };
};
