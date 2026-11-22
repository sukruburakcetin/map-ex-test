const {install}=require('./detectionHoverSource.cjs');
exports.flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
exports.fixture=(legacy,options={})=>{
 const events=[],timeouts=new Map(),intervals=new Map(),viewerEvents=new Map(),pending=[];let serial=0;
 class Geometry{constructor(polygon){this.polygon=polygon;}}
 class Tag{constructor(id,geometry,settings){if(options.throwTag===id)throw Error('tag failed');Object.assign(this,{id,geometry,options:settings});}}
 const container=new EventTarget();container.querySelector=()=>options.noCanvas?null:{getBoundingClientRect:()=>({left:10,top:20})};
 const add=container.addEventListener.bind(container),remove=container.removeEventListener.bind(container);
 container.addEventListener=(type,fn)=>{events.push(['listen',type]);add(type,fn);};container.removeEventListener=(type,fn)=>{events.push(['unlisten',type]);remove(type,fn);};
 const viewer={on:(type,fn)=>{events.push(['viewerOn',type]);viewerEvents.set(type,fn);},off:(type,fn)=>{events.push(['viewerOff',type]);if(viewerEvents.get(type)===fn)viewerEvents.delete(type);}};
 const component={ids:[],tags:[],getTagIdsAt:point=>{events.push(['hit',point]);if(options.heldHits)return new Promise((resolve,reject)=>pending.push({resolve,reject}));if(options.failedHit)return Promise.reject(Error('hit failed'));return Promise.resolve(component.ids);},removeAll:()=>{events.push(['removeTags']);component.tags=[];},add:tags=>{events.push(['tags',tags.map(t=>({id:t.id,options:t.options,polygon:t.geometry.polygon}))]);component.tags.push(...tags);}};
 const w={viewerContainer:{current:options.noContainer?null:container},mapillaryViewer:viewer,
  state:{imageId:'image',targetDetectionId:options.target||null,detectionExplorer:{labelMode:options.mode||'all'},showAiTags:options.labels!==false,detectionsActive:true},
  getDetectionValueFromTagId:id=>'object--support--'+id,
  _panoramaDetectionLabels:{setActive:ids=>events.push(['active',ids?[...ids]:null])},
  cancelDetectionNoteLocation:()=>events.push(['cancelLocation']),drawPendingNoteGraphic:(...args)=>events.push(['marker',...args]),clearPendingNoteGraphic:()=>events.push(['clearMarker']),
  setState:patch=>{events.push(['state',patch]);Object.assign(w.state,patch);},
 };
 const clock={setTimeout:(fn,ms)=>{const id=++serial;events.push(['timeout',id,ms]);timeouts.set(id,fn);return id;},clearTimeout:id=>{events.push(['cancelTimeout',id]);timeouts.delete(id);},setInterval:(fn,ms)=>{const id=++serial;events.push(['interval',id,ms]);intervals.set(id,fn);return id;},clearInterval:id=>{events.push(['cancelInterval',id]);intervals.delete(id);}};
 install(w,{PolygonGeometry:Geometry,OutlineTag:Tag,getDetectionColor:()=>options.zeroColor?0:0x00ff00,detectionThumbnailBounds:()=>({x:.1,y:.2,width:.3,height:.4}),console:{warn:(message,id,error)=>events.push(['warn',message,id,error.message])},...clock},legacy);
 const sourceTags=['pole','stop'].map(id=>({id,geometry:new Geometry([[.1,.2],[.4,.2],[.4,.6]])}));
 w.setupDetectionHover(component,sourceTags);
 const fire=type=>container.dispatchEvent(Object.assign(new Event(type),{clientX:30,clientY:40}));
 return{w,component,container,viewer,viewerEvents,pending,events,sourceTags,timeouts,intervals,
  move:()=>fire('mousemove'),click:()=>fire('click'),leave:()=>fire('mouseleave'),refresh:()=>component._refreshDetectionLabels?.(),
  tick:()=>{for(const fn of [...intervals.values()])fn();},
  flushTimers:()=>{const work=[...timeouts.values()];timeouts.clear();for(const fn of work)fn();},
  cleanup:()=>component._detectionHoverCleanup?.(),
  result:()=>({events,tags:component.tags.map(t=>({id:t.id,options:t.options,polygon:t.geometry.polygon})),timeouts:timeouts.size,intervals:intervals.size,viewerListeners:viewerEvents.size,hasRefresh:!!component._refreshDetectionLabels,selection:w.state.viewerDetectionNote,picking:w.state.detectionNotePicking}),
 };
};
