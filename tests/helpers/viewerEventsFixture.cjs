const fs=require('node:fs'),path=require('node:path');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');
const {install}=require('./viewerEventsSource.cjs');
const root=path.resolve(__dirname,'../..');
const sf=ts.createSourceFile('geo.ts',fs.readFileSync(root+'/src/utils/geoUtils.ts','utf8'),99,true,3);
const debounce=sf.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='debounce').getText(sf).replace(/^export /,'');
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
exports.fixture=(legacy,options={})=>{
 const events=[],timers=new Map(),rafs=new Map(),zoomListeners=[];let serial=0,imageHosts=0,camera=Object.prototype.hasOwnProperty.call(options,'camera')?options.camera:222;
 const record=(name,...args)=>events.push([name,...args]);
 const schedule=(work,ms)=>{const id=++serial;timers.set(id,{work,ms});record('timer',id,ms);return id;};
 const cancel=id=>{record('cancelTimer',id);timers.delete(id);};
 const realDebounce=new Function('setTimeout','clearTimeout',compile(debounce+';return debounce;'))(schedule,cancel);
 const view={type:options.type||'3d',stationary:options.moving?false:true},container={id:'container',onwheel:null};
 function makeViewer(id){const callbacks=new Map();return{id,callbacks,on(type,fn){record('on',id,type);callbacks.set(type,fn);},getComponent(name){record('component',id,name);if(options.componentsMissing)return null;if(name==='zoom')return{_zoomDelta$:{subscribe:fn=>{record('zoomSubscribe',id);zoomListeners.push(fn);}}};if(name==='keyboard')return{keyZoom:{disable:()=>record('keyboardDisable',id)}};return{id:'sequence'};}};}
 const viewer=makeViewer('A'),frame={id:'image',lon:1,lat:2};
 const w={mapillaryViewer:options.noViewer?null:viewer,viewerContainer:{current:options.noContainer?null:container},props:{config:{syncMapWithImage:!!options.sync}},
  state:{imageId:options.noImage?null:'image',sequenceImages:options.noFrame?[]:[frame],selectedSequenceId:options.noSelection?null:'sequence',turboModeActive:options.turbo!==false,syncHeading:options.heading!==false,lockToImage:!!options.locked,jimuMapView:options.noView?null:{view},detectionsActive:false,isLoading:false},
  _lastBearing:10,_sharedStartupBearing:options.shared===undefined?null:options.shared,_isFlyInActive:!!options.flying,_coneRedrawRaf:null,zoomStepIndex:options.step||0,coneLengths:[10,15,20,30],coneSpreads:[60,40,30,20],_playbackBindingsHost:{id:'playback-host'},
  _currentImageBearing:options.noBearing?null:{invalidate:()=>record('invalidate'),read:(v,id)=>{record('bearingRead',v?.id,id);return camera;},refresh:v=>record('bearingRefresh',v?.id),image:(v,id)=>record('bearingImage',v?.id,id)},
  _liveSequenceFrames:{current:options.noFrame?null:frame,find:id=>{record('findFrame',id);return options.noFrame?undefined:frame;},resolve:async image=>{record('resolve',image.id);return null;}},
 };
 for(const name of ['clearGreenPulse','clearConeGraphics','updateUrlWithCurrentImage','drawCone','setupDirectionHover','updateMinimapTracking','highlightNearbyPin','updateProfileIndicator'])w[name]=(...args)=>record(name,...args);
 w.navigateMapView=(v,target,opts)=>record('navigate',v===view,target,opts);
 class Playback{constructor(host){record('playbackCreate',host?.id);}bind(sequence,c){record('playbackBind',sequence?.id,c?.id);}}
 if(options.existingPlayback)w._playbackBindings=new Playback(w._playbackBindingsHost);
 install(w,{debounceUtil:realDebounce,setTimeout:schedule,requestAnimationFrame:work=>{const id=++serial;rafs.set(id,work);record('raf',id);return id;},PlaybackBindings:Playback},legacy);
 const imageHost=w.viewerImageTrackingHost;w.viewerImageTrackingHost=function(){imageHosts++;record('imageHost');return imageHost.call(w);};
 w.bindMapillaryEvents();
 return{w,viewer,view,container,events,timers,rafs,zoomListeners,
  emit:(type,payload)=>viewer.callbacks.get(type)?.(payload),wheel:delta=>container.onwheel?.({deltaY:delta,preventDefault:()=>record('preventWheel')}),
  zoom:delta=>zoomListeners.forEach(fn=>fn(delta)),
  runTimers:ms=>{for(const[id,timer]of[...timers])if(timer.ms===ms){timers.delete(id);timer.work();}},
  runRaf:()=>{for(const[id,work]of[...rafs]){rafs.delete(id);work();}},replaceViewer:()=>w.mapillaryViewer=makeViewer('B'),camera:value=>camera=value,
  result:()=>({events,step:w.zoomStepIndex,bearing:w._lastBearing,raf:w._coneRedrawRaf,timers:[...timers].map(([id,t])=>[id,t.ms]),frames:rafs.size,wheel:typeof container.onwheel==='function',imageHosts}),
 };
};
