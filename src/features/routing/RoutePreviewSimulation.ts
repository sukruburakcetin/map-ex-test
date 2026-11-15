/** Local geometry/time simulation only: no GPS, imagery or routing requests. */
export interface RoutePreviewHost {view:any;interactionElement?:HTMLElement|null;registerStop?:(stop:()=>void)=>()=>void;createLayer(properties:any):any;createGraphic(properties:any):any;}
export type PreviewState='idle'|'playing'|'paused'|'finished';
export interface PreviewProgress {state:PreviewState;progress:number;}
export function prepareRoutePreview(geojson:any){
 const geometry=geojson?.type==='Feature'?geojson.geometry:geojson;
 if(geometry?.type!=='LineString'||!Array.isArray(geometry.coordinates)||geometry.coordinates.length<2)throw new Error('A valid A-to-B route is required.');
 const points=geometry.coordinates.map((p:any)=>{
  if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>90)throw new Error('Route contains invalid coordinates.');
  return [p[0],p[1]] as [number,number];
 });
 const distances:number[]=[0];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],r=Math.PI/180,h=Math.sin((b[1]-a[1])*r/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin((b[0]-a[0])*r/2)**2;
  distances.push(distances[i-1]+12742000*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h)))));
 }
 const length=distances[distances.length-1];if(!(length>0))throw new Error('Route has no travel distance.');
 return {length,sample(progress:number){
  const distance=Math.max(0,Math.min(1,progress))*length;
  let low=1,high=points.length-1;while(low<high){const mid=(low+high)>>1;if(distances[mid]<distance)low=mid+1;else high=mid;}
  while(low<points.length-1&&distances[low]===distances[low-1])low++;
  const a=points[low-1],b=points[low],span=distances[low]-distances[low-1],fraction=span>0?(distance-distances[low-1])/span:1;
  const delta=((b[0]-a[0]+540)%360)-180,r=Math.PI/180;
  const bearing=(Math.atan2(Math.sin(delta*r)*Math.cos(b[1]*r),Math.cos(a[1]*r)*Math.sin(b[1]*r)-Math.sin(a[1]*r)*Math.cos(b[1]*r)*Math.cos(delta*r))*180/Math.PI+360)%360;
  return {lon:((a[0]+delta*fraction+540)%360)-180,lat:a[1]+(b[1]-a[1])*fraction,bearing};
 }};
}
export class RoutePreviewSimulation {
 private plan:ReturnType<typeof prepareRoutePreview>;
 private map:any=null;private layer:any=null;private graphic:any=null;private frame:number|null=null;private handles:any[]=[];
 private elapsed=0;private last:number|null=null;private lastDraw=-Infinity;private lastFollow=-Infinity;
 private state:PreviewState='idle';private duration:number;
 speed=10;follow=true;
 constructor(private host:RoutePreviewHost,geojson:any,duration:number,private notify:(progress:PreviewProgress)=>void,
  private clock={request:(callback:FrameRequestCallback)=>requestAnimationFrame(callback),cancel:(id:number)=>cancelAnimationFrame(id)}){
  this.plan=prepareRoutePreview(geojson);this.duration=Number.isFinite(duration)&&duration>0?duration:this.plan.length/13.89;
 }
 private emit(){this.notify({state:this.state,progress:Math.min(1,this.elapsed/this.duration)});}
 play():void {
  if(this.state==='playing')return;
  const view=this.host.view;if(!view?.map||view.destroyed)throw new Error('Map is not ready for preview.');
  if(this.layer&&this.map!==view.map)this.stop();
  if(this.state==='finished')this.elapsed=0;
  if(!this.layer){
   try{
    this.map=view.map;
    this.layer=this.host.createLayer({id:'mapillary-route-simulation',title:'Route simulation',listMode:'hide',elevationInfo:{mode:'on-the-ground'}});
    const p=this.plan.sample(this.elapsed/this.duration);
    this.graphic=this.host.createGraphic({geometry:{type:'point',longitude:p.lon,latitude:p.lat,spatialReference:{wkid:4326}},
     symbol:view.type==='3d'?{type:'point-3d',symbolLayers:[{type:'icon',resource:{primitive:'circle'},material:{color:'#35c9ed'},size:12,outline:{color:'white',size:2}}]}:
      {type:'simple-marker',style:'triangle',color:'#35c9ed',size:14,angle:p.bearing,outline:{color:'white',width:1.5}}});
    this.layer.add(this.graphic);view.map.add(this.layer);
    for(const event of ['pointer-down','drag','mouse-wheel']){const handle=view.on?.(event,()=>this.pause());if(handle)this.handles.push(handle);}
    if(this.host.registerStop)this.handles.push({remove:this.host.registerStop(()=>this.stop())});
    if(this.host.interactionElement){const element=this.host.interactionElement,interact=()=>this.pause();element.addEventListener('pointerdown',interact,{passive:true});this.handles.push({remove:()=>element.removeEventListener('pointerdown',interact)});}
    const document=view.container?.ownerDocument;
    if(document){const hidden=()=>{if(document.visibilityState==='hidden')this.pause();};document.addEventListener('visibilitychange',hidden);this.handles.push({remove:()=>document.removeEventListener('visibilitychange',hidden)});}
   }catch(error){this.stop();throw error;}
  }
  this.state='playing';this.last=null;this.lastDraw=-Infinity;this.lastFollow=-Infinity;this.emit();
  const tick=(now:number)=>{
   this.frame=null;if(this.state!=='playing')return;
   if(view.destroyed||view.map!==this.map||!this.layer){this.stop();return;}
   if(this.last!==null)this.elapsed=Math.min(this.duration,this.elapsed+Math.min(250,Math.max(0,now-this.last))/1000*this.speed);
   this.last=now;
   if(now-this.lastDraw>=100||this.elapsed>=this.duration){
    this.lastDraw=now;const p=this.plan.sample(this.elapsed/this.duration);
    this.graphic.geometry={type:'point',longitude:p.lon,latitude:p.lat,spatialReference:{wkid:4326}};
    if(view.type==='2d'){const symbol=this.graphic.symbol.clone?.()??{...this.graphic.symbol};symbol.angle=p.bearing;this.graphic.symbol=symbol;}
    if(this.follow&&now-this.lastFollow>=250){
     this.lastFollow=now;
     try{const move=view.goTo(view.type==='3d'?{center:[p.lon,p.lat],heading:p.bearing}:{center:[p.lon,p.lat]},{animate:false});Promise.resolve(move).catch(()=>{});}catch{/* A map interaction can cancel following. */}
    }
    this.emit();
   }
   if(this.state!=='playing')return;
   if(this.elapsed>=this.duration){this.state='finished';this.emit();return;}
   this.frame=this.clock.request(tick);
  };
  this.frame=this.clock.request(tick);
 }
 pause():void {if(this.state!=='playing')return;this.state='paused';if(this.frame!==null)this.clock.cancel(this.frame);this.frame=null;this.last=null;this.emit();}
 stop():void {
  if(this.frame!==null)this.clock.cancel(this.frame);this.frame=null;
  for(const handle of this.handles)handle.remove();this.handles=[];
  if(this.layer){try{this.map?.remove(this.layer);}catch{}try{this.layer.destroy();}catch{}}
  this.map=null;this.layer=null;this.graphic=null;this.elapsed=0;this.last=null;this.state='idle';this.emit();
 }
}
