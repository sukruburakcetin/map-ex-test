import { ScreenDirectionCone } from './ScreenDirectionCone';
import { renderedGroundPoint } from './SelectionPulse';
import { nativeCurrentImageMesh } from './nativeCurrentImageMesh';

/** Experimental native mesh close up, existing SVG at overview or unavailable geometry. */
export class NativeCurrentImageMarker {
 private view:any=null;private layer:any=null;private graphic:any=null;private layerView:any=null;
 private frame:number|null=null;private fallbackFrame:FrameRequestCallback|null=null;private revision=0;
 private model:any=null;private marker=false;private fan=false;private nativeActive=false;private key='';private scale=0;private warned=false;
 private fallback:ScreenDirectionCone;private settled:any=null;
 constructor(private factory:{point:(p:any)=>any;layer:(p:any)=>any;graphic:(p:any)=>any;mesh:(p:any)=>any;element:()=>HTMLDivElement},
  private clock:{request:(cb:FrameRequestCallback)=>number;cancel:(id:number)=>void},private presented:(active:boolean,view:any)=>void){
  this.fallback=new ScreenDirectionCone(factory.point,factory.element,{request:cb=>{this.fallbackFrame=cb;return 1},cancel:()=>{this.fallbackFrame=null}},(active,view)=>{if(!this.nativeActive)this.presented(active,view)});
 }
 private useView(view:any):void{if(this.view!==view){this.clear();this.view=view;}}
 showMarker(view:any,lon:number,lat:number,color:any,id:string):void{
  this.useView(view);if(this.model?.id!==String(id))this.fan=false;
  this.marker=true;this.model={...this.model,lon,lat,color:Array.isArray(color)?color:[0,255,0,1],id:String(id)};this.start();
 }
 show(view:any,lon:number,lat:number,heading:number,metres:number,spread:number):void{
  this.useView(view);this.fan=true;this.model={...this.model,lon,lat,heading,metres,spread};this.start();
 }
 hideCone():void{this.fan=false;this.key='';this.fallback.hideCone();if(!this.marker)this.clear();}
 hideMarker():void{this.marker=false;this.key='';this.fallback.hideMarker();this.presented(false,this.view);if(!this.fan)this.clear();}
 private start():void{
  if(this.frame!=null)return;const ownerView=this.view;let last=-Infinity;
  const tick=(now:number)=>{
   if(this.view!==ownerView)return;
   if(!this.view||this.view.destroyed){this.clear();return;}
   if(now-last>=100){last=now;try{this.update();}catch(error){if(!this.warned){this.warned=true;console.warn('[Mapillary] Native marker trial using SVG fallback',error);}this.showFallback(true);}}
   const callback=this.fallbackFrame;this.fallbackFrame=null;if(callback)callback(now);
   if(this.view)this.frame=this.clock.request(tick);
  };this.frame=this.clock.request(tick);
 }
 private showFallback(hideMesh:boolean):void{
  const view=this.view,m=this.model;if(!view||!m)return;
  const wasNative=this.nativeActive;this.nativeActive=false;
  if(hideMesh&&this.layer)this.layer.visible=false;
  if(wasNative)this.presented(false,view);
  if(this.marker)this.fallback.showMarker(view,m.lon,m.lat,m.color,m.id||'');else this.fallback.hideMarker();
  if(this.fan)this.fallback.show(view,m.lon,m.lat,m.heading||0,m.metres||10,m.spread||60);else this.fallback.hideCone();
 }
 private update():void{
  const view=this.view,m=this.model;if(!view||!m)return;
  const cached=this.settled;
  if(this.nativeActive&&view.stationary===true&&view.updating===false&&cached?.model===m&&cached.marker===this.marker&&cached.fan===this.fan&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.sampler===view.groundView?.elevationSampler)return;
  // Readability at globe/overview scale remains the validated SVG representation.
  if(view.zoom<10){this.showFallback(true);return;}
  const source=this.factory.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}}),ground=renderedGroundPoint(view,source,this.factory.point);
  if(!ground){this.showFallback(true);return;}
  const origin=view.toScreen(ground),d=10,cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));
  const east=view.toScreen(this.factory.point({longitude:m.lon+d/(111320*cos),latitude:m.lat,z:ground.z,spatialReference:{wkid:4326}}));
  const north=view.toScreen(this.factory.point({longitude:m.lon,latitude:m.lat+d/111320,z:ground.z,spatialReference:{wkid:4326}}));
  if(![origin?.x,origin?.y,east?.x,east?.y,north?.x,north?.y].every(Number.isFinite)){this.showFallback(true);return;}
  const ex=(east.x-origin.x)/d,ey=(east.y-origin.y)/d,nx=(north.x-origin.x)/d,ny=(north.y-origin.y)/d;
  const aa=ex*ex+ey*ey,bb=nx*nx+ny*ny,dot=ex*nx+ey*ny,px=Math.sqrt((aa+bb+Math.sqrt((aa-bb)**2+4*dot*dot))/2);
  if(!(px>.0001)){this.showFallback(true);return;}
  let scale=1/px;const radius=Math.min(52,Math.max(18,32*Math.sqrt((m.metres||10)/10))),extent=(this.fan?radius:8)*scale;
  if(extent>(this.nativeActive?275:225)){this.showFallback(true);return;}
  if(this.scale&&Math.abs(scale/this.scale-1)<.03)scale=this.scale;
  const height=Math.round(ground.z/Math.max(.005,scale*.05))*Math.max(.005,scale*.05);
  const key=JSON.stringify([m.lon,m.lat,height,scale,m.heading||0,radius,m.spread||60,this.marker,this.fan,m.color,m.id]);
  if(!this.layer){
   const layer=this.factory.layer({id:'mapillary-current-image-native-trial',title:'Current image native 3D trial',listMode:'hide',elevationInfo:{mode:'absolute-height'}});
   view.map.add(layer);this.layer=layer;const revision=++this.revision;
   Promise.resolve(view.whenLayerView?.(layer)).then(lv=>{if(this.view===view&&this.layer===layer&&this.revision===revision)this.layerView=lv;}).catch(()=>{});
  }
  this.layer.visible=true;
  if(key!==this.key){
   const geometry=this.factory.mesh(nativeCurrentImageMesh(m.lon,m.lat,height,scale,radius,m.spread||60,m.heading||0,this.marker,this.fan,m.color));
   if(this.graphic){this.graphic.geometry=geometry;this.graphic.attributes={image_id:m.id||''};}
   else {this.graphic=this.factory.graphic({geometry,attributes:{image_id:m.id||''},symbol:{type:'mesh-3d',symbolLayers:[{type:'fill',castShadows:false}]}});this.layer.add(this.graphic);}
   this.key=key;this.scale=scale;
  }
  const ready=this.layerView&&!this.layerView.suspended&&this.layerView.visible!==false&&(this.nativeActive||!this.layerView.updating);
  if(!ready){this.showFallback(false);return;}
  this.nativeActive=true;this.fallback.clear();this.presented(this.marker,view);this.settled={model:m,marker:this.marker,fan:this.fan,camera:view.camera,zoom:view.zoom,sampler:view.groundView?.elevationSampler};
 }
 clear():void{
  const view=this.view;this.nativeActive=false;this.fallback.clear();this.presented(false,view);
  if(this.frame!=null)this.clock.cancel(this.frame);this.frame=null;this.fallbackFrame=null;
  ++this.revision;if(this.layer){view?.map?.remove(this.layer);this.layer.destroy();}
  this.layer=null;this.graphic=null;this.layerView=null;this.view=null;this.model=null;this.marker=false;this.fan=false;this.key='';this.scale=0;this.settled=null;
 }
}
