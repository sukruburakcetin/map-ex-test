import { renderedGroundPoint } from './SelectionPulse';

/** Convert screen coordinates to the existing absolute-positioning parent; never restyle the map. */
export function haloOverlayPosition(host: HTMLElement, element: HTMLElement, pixel: { x: number; y: number }, width: number, height: number): { x: number; y: number } | null {
 const parent = element.offsetParent as HTMLElement | null, win = host.ownerDocument.defaultView;
 if (!parent || !win || width <= 0 || height <= 0) return null;
 const box = host.getBoundingClientRect();
 if (!(box.width > 0 && box.height > 0)) return null;
 const x = box.left + pixel.x * box.width / width, y = box.top + pixel.y * box.height / height;
 const root = parent === host.ownerDocument.documentElement || (parent === host.ownerDocument.body && win.getComputedStyle(parent).position === 'static');
 if (root) return { x: x + win.scrollX, y: y + win.scrollY };
 const offset = parent.getBoundingClientRect();
 const sx = parent.offsetWidth > 0 ? offset.width / parent.offsetWidth : 1;
 const sy = parent.offsetHeight > 0 ? offset.height / parent.offsetHeight : 1;
 if (!(sx > 0 && sy > 0)) return null;
 return { x: (x - offset.left) / sx - parent.clientLeft + parent.scrollLeft,
  y: (y - offset.top) / sy - parent.clientTop + parent.scrollTop };
}


/** Local ground-plane projection, normalized so tilt cannot inflate the fan. */
export function groundFanMatrix(front: { x: number; y: number }, right: { x: number; y: number }): string | null {
 if (![front?.x,front?.y,right?.x,right?.y].every(Number.isFinite)) return null;
 const aa=right.x**2+right.y**2, bb=front.x**2+front.y**2, dot=right.x*front.x+right.y*front.y;
 const scale=Math.sqrt((aa+bb+Math.sqrt((aa-bb)**2+4*dot**2))/2);
 if(scale<.001)return null;
 const n=(value:number)=>Math.abs(value)<1e-8?0:Number(value.toFixed(6));
 return `matrix(${n(right.x/scale)},${n(right.y/scale)},${n(-front.x/scale)},${n(-front.y/scale)},0,0)`;
}

/** One SVG anchor: current-image circle and fan share the ground-plane orientation. */
export class ScreenDirectionCone {
 private element: HTMLDivElement | null = null;
 private view: any = null;
 private frame: number | null = null;
 private projectionCache: any = null;
 private model: { lon: number; lat: number; heading: number; radius: number; spread: number } | null = null;
 private fanVisible=false;
 private markerVisible=false;
 private markerId: string | null=null;
 private markerFill='#00ff00';
 private markerOpacity='1';
 private geometryKey='';
 constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,
  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void },
  private onMarkerPresented?: (presented: boolean, view: any) => void) {}
 show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {
  if(view!==this.view)this.clear();
  this.fanVisible=true;
  const radius=Math.min(52,Math.max(18,32*Math.sqrt(metres/10))),angle=Math.min(120,Math.max(15,spread));
  this.setModel(lon,lat,heading,radius,angle);
  if(this.ensureElement(view)){this.syncParts();this.start(view);}
 }
 showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void {
  if(view!==this.view)this.clear();
  if(this.markerId!==String(imageId))this.fanVisible=false;
  this.markerId=String(imageId);this.markerVisible=true;
  const rgba=Array.isArray(color)?color:color?.toRgba?.();
  const channel=(v:any,f:number)=>Number.isFinite(v)?Math.max(0,Math.min(255,v)):f;
  this.markerFill=rgba?`rgb(${channel(rgba[0],0)},${channel(rgba[1],255)},${channel(rgba[2],0)})`:'#00ff00';
  this.markerOpacity=rgba&&Number.isFinite(rgba[3])?String(Math.max(0,Math.min(1,rgba[3]))):'1';
  const m=this.model;this.setModel(lon,lat,m?.heading||0,m?.radius||32,m?.spread||60);
  if(this.ensureElement(view)){this.syncParts();this.start(view);}
 }
 hideCone(): void { this.fanVisible=false;this.syncParts();if(!this.markerVisible)this.clear(); }
 hideMarker(): void { this.markerVisible=false;this.markerId=null;this.syncParts();this.onMarkerPresented?.(false,this.view);if(!this.fanVisible)this.clear(); }
 private setModel(lon:number,lat:number,heading:number,radius:number,spread:number):void {
  const p=this.model;
  if(!p||p.lon!==lon||p.lat!==lat||p.heading!==heading||p.radius!==radius||p.spread!==spread)this.model={lon,lat,heading,radius,spread};
 }
 private ensureElement(view:any):boolean {
  if(!this.element){
   const host=view.container;if(!host||typeof host.appendChild!=='function')return false;
   const el=this.createElement();el.setAttribute('aria-hidden','true');
   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'120px',height:'120px',zIndex:'8',display:'none',transformOrigin:'50% 50%',transform:'translate(-50%, -50%)'});
   host.appendChild(el);this.element=el;this.view=view;
  }
  const m=this.model!,key=`${m.radius}/${m.spread}`;
  if(this.geometryKey!==key){
   const a=m.spread*Math.PI/360,inner=9,x=Math.sin(a),y=Math.cos(a),r=m.radius;
   const left=`${60-r*x} ${60-r*y}`,right=`${60+r*x} ${60-r*y}`,start=`${60-inner*x} ${60-inner*y}`,end=`${60+inner*x} ${60-inner*y}`;
   this.element.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><g data-direction-fan="true"><path d="M${start} L${left} A${r} ${r} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z" fill="#ffb300" fill-opacity="0.55" stroke="#ff9800" stroke-width="1.25" stroke-linejoin="round"/></g><circle data-current-image-marker="true" cx="60" cy="60" r="7" fill="#00ff00" stroke="#ffffff" stroke-width="2"/></svg>`;
   this.geometryKey=key;
  }
  return true;
 }
 private syncParts():void {
  const fan=this.element?.querySelector('[data-direction-fan]') as SVGElement|null;
  const marker=this.element?.querySelector('[data-current-image-marker]') as SVGElement|null;
  if(fan)fan.style.display=this.fanVisible?'':'none';
  if(marker){marker.style.display=this.markerVisible?'':'none';marker.setAttribute('fill',this.markerFill);marker.setAttribute('fill-opacity',this.markerOpacity);}
 }
 private start(view:any):void {
  if(this.frame!=null)return;
  let last=-Infinity;
  const track=(now:number)=>{
   if(this.view!==view||!this.element||view.destroyed){this.clear();return;}
   if(now-last>=32){last=now;try{this.position();}catch{this.element.style.display='none';this.onMarkerPresented?.(false,view);}}
   this.frame=this.clock.request(track);
  };
  this.frame=this.clock.request(track);
 }
 private position():void {
  const view=this.view,element=this.element,m=this.model;if(!view||!element||!m)return;
  const hide=()=>{element.style.display='none';this.onMarkerPresented?.(false,view);};
  if(view.container.ownerDocument?.visibilityState==='hidden'){hide();return;}
  let pixel:any,orientation:string;
  const cache=this.projectionCache;
  if(cache&&cache.model===m&&cache.fanVisible===this.fanVisible&&cache.markerVisible===this.markerVisible&&cache.camera===view.camera&&cache.zoom===view.zoom&&cache.rotation===view.rotation&&cache.width===view.width&&cache.height===view.height&&view.stationary===true&&view.updating===false){pixel=cache.pixel;orientation=cache.orientation;}
  else {
   const source=this.point({longitude:m.lon,latitude:m.lat,spatialReference:{wkid:4326}});
   let ground=view.type==='3d'?renderedGroundPoint(view,source,this.point):source;
   if(!ground&&view.zoom<14)ground=this.point({longitude:m.lon,latitude:m.lat,z:0,spatialReference:{wkid:4326}});
   pixel=ground&&view.toScreen(ground);
   if(!pixel||!Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)||pixel.x<0||pixel.y<0||pixel.x>view.width||pixel.y>view.height){hide();return;}
   orientation='rotate(0)';
   if(this.fanVisible||(view.type==='3d'&&this.markerVisible)){
    const radians=m.heading*Math.PI/180,distance=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(m.lat*Math.PI/180));
    const tip=this.point({longitude:m.lon+Math.sin(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}});
    const projected=view.toScreen(tip),dx=projected?.x-pixel.x,dy=projected?.y-pixel.y;
    const bearing=Number.isFinite(dx)&&Number.isFinite(dy)&&Math.hypot(dx,dy)>.001?Math.atan2(dx,-dy)*180/Math.PI:m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);
    orientation=`rotate(${bearing})`;
    if(view.type==='3d'){
     const side=this.point({longitude:m.lon+Math.cos(radians)*distance/(111320*cos),latitude:Math.max(-89,Math.min(89,m.lat-Math.sin(radians)*distance/111320)),z:ground.z||0,spatialReference:{wkid:4326}}),q=view.toScreen(side);
     const matrix=q&&groundFanMatrix({x:dx,y:dy},{x:q.x-pixel.x,y:q.y-pixel.y});if(matrix)orientation=matrix;
    }
   }
   this.projectionCache={model:m,fanVisible:this.fanVisible,markerVisible:this.markerVisible,pixel,orientation,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};
  }
  element.style.display='block';
  const position=haloOverlayPosition(view.container,element,pixel,view.width,view.height);if(!position){hide();return;}
  const left=`${position.x}px`,top=`${position.y}px`;
  if(element.style.left!==left)element.style.left=left;if(element.style.top!==top)element.style.top=top;
  const fan=element.querySelector('[data-direction-fan]'),transform=`translate(60 60) ${orientation} translate(-60 -60)`;
  if(fan&&fan.getAttribute('transform')!==transform)fan.setAttribute('transform',transform);
  const marker=element.querySelector('[data-current-image-marker]'),markerTransform=view.type==='3d'?transform:'';
  if(marker&&marker.getAttribute('transform')!==markerTransform)marker.setAttribute('transform',markerTransform);
  this.onMarkerPresented?.(this.markerVisible,view);
 }
 clear():void {
  this.onMarkerPresented?.(false,this.view);
  if(this.frame!=null)this.clock.cancel(this.frame);
  this.frame=null;this.element?.remove();this.element=null;this.view=null;this.model=null;this.projectionCache=null;this.geometryKey='';this.markerVisible=false;this.fanVisible=false;this.markerId=null;
 }
}
