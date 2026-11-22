/** Controlled SDK/metadata/paint boundaries around the actual pre/post extraction opener. */
const fs=require('node:fs'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const frames={exports:{}};new Function('exports',ts.transpileModule(fs.readFileSync(__dirname+'/../../src/features/imagery/LiveSequenceFrames.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(frames.exports);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};};
const flush=()=>new Promise(r=>setImmediate(r));
function fixture(legacy=false,options={}){
 const events=[],moves=new Map(),metadata=deferred(),paint=deferred();
 const log=(name,...args)=>events.push([name,...args]);
 const view={map:{layers:{includes:layer=>layer===overlay}},animation:{stop:()=>log('animation-stop')}};const overlay={};
 const w={state:{sequenceImages:[],imageId:null,sequenceId:null,selectedSequenceId:null,jimuMapView:{view},turboModeActive:true,sequenceRouteLoading:false,isLoading:false,isElevationProfileActive:false},
  _selectionRequestId:0,_selectionAbort:null,sequenceCoordsCache:{},_lastBearing:37,coneLengths:[4],coneSpreads:[5],zoomStepIndex:0,
  _liveFrameDetails:{clear:()=>log('details-clear')},_nearbyDiscovery:{cancel:()=>log('nearby-cancel')},_cachedSequencePreview:{clear:()=>log('preview-clear')},
  _timeTravelAvailability:{clear:()=>log('availability-clear')},_reverseAddressEnrichment:{cancel:()=>log('address-cancel')},_nativeSequenceSelection:{select:id=>log('native-select',id)},
  _placesExploreAbort:{abort:()=>log('places-abort')},_places:{controller:{sync:()=>log('places-sync')}},_detectionAbort:{abort:()=>log('detection-abort')},
  _backgroundRequests:{setPaused:value=>log('background',value)},_stopRoutePreview:()=>log('route-stop'),highlightNearbyPin:value=>log('nearby-pin',value),
  _currentImageBearing:{select:(_v,id,nearest)=>log('bearing-select',id,nearest),image:(_v,id)=>log('bearing-image',id)},
  _sequencePerformance:{begin:(name,start)=>{log('timing',name,start);return {finish:()=>log('finish',name),cancel:()=>log('cancel',name)}},count:name=>log('count',name)},
  clearGreenPulse:()=>log('pulse-clear'),clearConeGraphics:()=>log('cone-clear'),clearElevationProfile:()=>log('profile-clear'),
  drawPulsingPoint:(lon,lat,color,id)=>{log('pulse',lon,lat,color,id);return {attributes:{image_id:id}}},drawCone:(...args)=>log('cone',...args),
  drawPoint:(...args)=>log('point',...args),updateProfileIndicator:()=>log('profile-indicator'),
  clearActiveSequenceGraphics:(...args)=>log('graphics-clear',...args),clearActiveSequenceLayer:()=>log('layer-clear'),
  updateNativeSequenceSelection:()=>log('native-update'),checkForTimeTravel:id=>log('time-travel',id),ensureImageViewer:id=>log('ensure-viewer',id),
  refreshSequenceMarkerWindow:async()=>log('markers'),prepareDemandSequence:async(id,request)=>log('route',id,request),
  nearestCoverageImage:async()=>{log('nearest');return options.nearest===undefined?'resolved':options.nearest},
  getSequencesInBBox:async()=>{log('bbox');return options.candidates||[]},getSelectedImageCoords:async(s,id)=>{log('metadata',s,id);return metadata.promise},
  waitForSequencePaint:async()=>{log('paint');return paint.promise},_owned:message=>message,accessToken:'fixture',
 };
 w._liveSequenceFrames=new frames.exports.LiveSequenceFrames(async()=>{throw Error('unexpected frame metadata')});
 w.setState=(patch,after)=>{const next=typeof patch==='function'?patch():patch;if(next){Object.assign(w.state,next);log('state',JSON.parse(JSON.stringify(next)))}after?.()};
 const viewer={moveTo:id=>{log('move',id);const gate=deferred();moves.set(id,gate);return gate.promise},getImage:async()=>{log('get-image');return {id:w.state.imageId,originalLngLat:{lng:1,lat:2}}}};w.mapillaryViewer=viewer;
 const platform=options.visible?{document:{visibilityState:'visible'},requestAnimationFrame:()=>1}:options.hidden?{document:{visibilityState:'hidden'}}:{};
 require('./sequenceOpeningSource.cjs').install(w,legacy,platform);
 const open=(sequence='A',id='1',point,representative=false,nearest=false,start)=>w.loadSequenceById(sequence,id,point,representative,nearest,start);
 const complete=async(id='1',image={id,originalLngLat:{lng:1,lat:2},capturedAt:100})=>{await flush();moves.get(id).resolve(image);await flush()};
 const warm=(normal=false)=>{const points=[{id:'1',lon:1,lat:2},{id:'2',lon:3,lat:4}];w._liveSequenceFrames.begin('A',points);w._liveSequenceFrames.finish('A',points);w._liveSequenceLine={sequenceId:'A'};Object.assign(w.state,{sequenceImages:points,sequenceId:'A',selectedSequenceId:'A',imageId:'old',turboModeActive:!normal});w._lastSuccessfulSelection={sequenceImages:points,sequenceId:'A',selectedSequenceId:'A',imageId:'old'};w.sequenceCoordsCache.A=points;if(normal)w._activeSequenceOverlay={view,layer:overlay};return points};
 const result=()=>({events,state:{...w.state,jimuMapView:undefined},retry:w._selectionRetry,last:w._lastSuccessfulSelection,request:w._selectionRequestId,deferred:w._localSequenceDeferredRequest,opening:w._imageryOpeningRequest,aborted:w._selectionAbort?.signal.aborted,shared:[w._sharedStartupImageId,w._sharedStartupBearing,w._isFlyInActive],frames:{sequence:w._liveSequenceFrames.sequenceId,complete:w._liveSequenceFrames.complete,current:w._liveSequenceFrames.current},pulse:w.currentGreenGraphic});
 return {w,events,moves,metadata,paint,view,viewer,open,complete,warm,result,flush,log};
}
exports.fixture=fixture;exports.flush=flush;
