const {createInteraction}=require('./mapHoverSource.cjs');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
exports.deferred=deferred;
exports.flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve();};
exports.fixture=(legacy,options={})=>{
 const events=[],jobs=new Map(),listeners=[];let serial=0,label='',left=0,top;
 const clock={schedule:(work,delay=0)=>{const id=++serial;jobs.set(id,work);events.push(['timer',id,delay]);return id;},cancel:id=>{events.push(['cancel',id]);jobs.delete(id);}};
 const doc=new EventTarget(),win=new EventTarget(),container=new EventTarget();doc.defaultView=win;doc.visibilityState='visible';
 top={closest:()=>null};doc.elementFromPoint=()=>top;
 Object.assign(container,{ownerDocument:doc,isConnected:true,getBoundingClientRect:()=>({left,top:0,right:400,bottom:300}),contains:node=>node===top});
 for(const [name,target]of [['container',container],['document',doc],['window',win]]){
  const add=target.addEventListener.bind(target),remove=target.removeEventListener.bind(target);
  target.addEventListener=(type,callback,opts)=>{listeners.push([name,type,'add']);add(type,callback,opts);};
  target.removeEventListener=(type,callback,opts)=>{listeners.push([name,type,'remove']);remove(type,callback,opts);};
 }
 const layer={id:'coverage'},view={type:'2d',zoom:options.zoom||18,stationary:true,interacting:false,destroyed:false,width:400,height:300,container:options.noContainer?null:container,map:{findLayerById:()=>layer}};
 const coverage=deferred(),sdk=deferred(),native=deferred();
 const place={id:'place',name:'Place',lon:1,lat:2};
 const owner={hit:()=>options.place?place:null,setHover:id=>events.push(['placeHover',id]),setMapHover:p=>events.push(['mapPlace',p?.id||null]),hoverLabel:(_p,count)=>'Place '+count};
 const renderer={selectedIndex:-1,setHighlight:index=>{events.push(['cloudHighlight',index]);renderer.selectedIndex=index;}};
 const w={state:{jimuMapView:{view},turboModeActive:options.turbo!==false},props:{state:'OPENED'},turboCoverageLayer:layer,_turboRequestCount:3,
  _places:owner,_placesTilesOwner:owner,_pointCloudViewerRenderer:renderer,_pointCloudMapLayer:{updating:false},mapillaryViewer:{resize:()=>events.push(['resize'])},
  tooltipDiv:{style:{}},_currentHoveredFeatureId:'old',_hoverTimeout:null,_turboHoveredScreen:options.hoveredScreen||null,
  _hoverPreviewStatus:{begin:()=>{events.push(['statusBegin']);return()=>events.push(['statusEnd']);}},
  _pendingCoverageHover:{begin:()=>{events.push(['pendingBegin']);return()=>events.push(['pendingEnd']);}},
  _coverageAlignmentDiagnostic:{pointer:(_view,p)=>events.push(['alignment',p])},
  hitTestHoverLayers:(_view,p)=>{events.push(['sdk',p]);return options.heldSDK?sdk.promise:Promise.resolve({results:options.hits||[]});},
  pickMapFeature:async()=>{events.push(['feature']);if(options.featureFailure)throw Error('feature');return options.feature?{graphic:{attributes:{name:'Detection'}}}:null;},
  clearTurboHoverDetails:()=>{events.push(['clear']);label='';},clearTurboHover:()=>events.push(['clearAnimation']),
  highlightSequenceOnVTL:id=>events.push(['sequenceHover',id]),updateTurboHover:(_g,x,y)=>{events.push(['imagery',x,y]);label='imagery';},
  placesBusy:()=>!!options.busy,log:message=>events.push(['debug',message]),_t:key=>key,updateTurboPickWarning:(...args)=>events.push(['warning',...args]),
 };
 const pick=(name,p,signal)=>{events.push([name,p]);signal.addEventListener('abort',()=>events.push(['abort']),{once:true});return options.heldCoverage?coverage.promise:options.coverageFailure?Promise.reject(Error('coverage')):Promise.resolve(options.emptyCoverage?null:{attributes:{image_id:'image'}});};
 w.pickTurboGraphic=(p,_v,s)=>pick('pointPick',p,s);w.pickTurboRepresentative=(p,_v,s)=>pick('linePick',p,s);
 if(options.native)w._placesVectorLayer={version:1,cancelHover:()=>events.push(['cancelPlace']),resolveHover:()=>{events.push(['native']);return options.heldNative?native.promise:Promise.resolve({attributes:{gers_id:'native-place',place_name:'Native'},geometry:{x:1,y:2},candidates:[{},{}]});}};
 const pointer=createInteraction(w,view,{setTimeout:clock.schedule,clearTimeout:clock.cancel,window:{innerWidth:400,innerHeight:300},renderMapFeatureHoverLabel:(_host,text,_bounds,x,y)=>{label=text;events.push(['label',text,x,y]);}},legacy);
 w._coverageHoverHandler=pointer;
 const fire=(target,type,props={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,props);target.dispatchEvent(event);if(event.defaultPrevented)throw Error('Hover consumed input');};
 return{w,view,container,doc,win,events,listeners,jobs,coverage,sdk,native,owner,place,
  move:(p={x:40,y:40,native:{clientX:40,clientY:40}})=>pointer(p),
  take:()=>{const[id,fn]=jobs.entries().next().value||[];if(!fn)return Promise.resolve();jobs.delete(id);return fn();},
  drain:async()=>{while(jobs.size){const[id,fn]=jobs.entries().next().value;jobs.delete(id);await fn();}},
  leave:()=>fire(container,'mouseleave'),fire,top:node=>top=node,shift:value=>left=value,
  result:()=>({events,listeners,label,cloud:renderer.selectedIndex,hovered:w._currentHoveredFeatureId,hasResume:!!w._coverageHoverResume,hasHandler:!!w._coverageHoverHandler,hasTouch:!!w._coverageTouchHover,queued:jobs.size,aborted:w._turboHoverPickAbort?.signal.aborted}),
 };
};
