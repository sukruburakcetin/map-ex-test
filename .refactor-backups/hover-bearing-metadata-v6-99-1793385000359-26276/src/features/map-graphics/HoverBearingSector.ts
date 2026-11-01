/** Optional bearing decoration driven by the existing brown pulse clock. No own RAF or requests. */
import { groundFanMatrix } from './ScreenDirectionCone';
export class HoverBearingSector {
 private element: HTMLDivElement | null = null;
 private bearing: number | null = null;
 private last = -Infinity;
 private cache: { view: any; geometry: any; camera: any; zoom: number; rotation: number; bearing: number; transform: string } | null = null;
 constructor(private readonly point: (properties: any) => any, private readonly create: () => HTMLDivElement) {}
 show(parent: HTMLElement, bearing: unknown, pano: boolean): void {
  if(pano || typeof bearing !== 'number' || !Number.isFinite(bearing)){this.clear();return;}
  const normalized=((bearing%360)+360)%360;
  if(this.element?.parentElement!==parent)this.clear();
  if(!this.element){
   const el=this.create();el.setAttribute('aria-hidden','true');
   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'60px',height:'60px',left:'50%',top:'50%',transform:'translate(-50%,-50%)',display:'none'});
   // The seven-pixel opening keeps the existing 6–11px brown pulse unobstructed.
   const a=25*Math.PI/180,r=24,inner=7,x=Math.sin(a),y=Math.cos(a);
   el.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><g><path d="M${30-inner*x} ${30-inner*y} L${30-r*x} ${30-r*y} A${r} ${r} 0 0 1 ${30+r*x} ${30-r*y} L${30+inner*x} ${30-inner*y} A${inner} ${inner} 0 0 0 ${30-inner*x} ${30-inner*y} Z" fill="#ffb300" fill-opacity="0.45" stroke="#d88c00" stroke-width="1"/></g></svg>`;
   parent.appendChild(el);this.element=el;
  }
  if(this.bearing!==normalized){this.cache=null;this.last=-Infinity;}
  this.bearing=normalized;
 }
 update(view: any, geometry: any, pixel: {x:number;y:number} | null | undefined, now: number): void {
  const el=this.element,bearing=this.bearing;if(!el||bearing===null)return;
  if(!pixel || !Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)){el.style.display='none';return;}
  if(now-this.last<32)return;this.last=now;
  try {
   const cached=this.cache;let orientation:string;
   if(cached&&cached.view===view&&cached.geometry===geometry&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.rotation===view.rotation&&cached.bearing===bearing&&view.stationary===true&&view.updating===false)orientation=cached.transform;
   else {
    const lon=geometry.longitude,lat=geometry.latitude;
    if(!Number.isFinite(lon)||!Number.isFinite(lat)){el.style.display='none';return;}
    const rad=bearing*Math.PI/180,d=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(lat*Math.PI/180));
    const project=(angle:number)=>view.toScreen(this.point({longitude:lon+Math.sin(angle)*d/(111320*cos),latitude:Math.max(-89,Math.min(89,lat+Math.cos(angle)*d/111320)),z:geometry.z||0,spatialReference:{wkid:4326}}));
    const front=project(rad),right=view.type==='3d'?project(rad+Math.PI/2):null;
    if(!front||!Number.isFinite(front.x)||!Number.isFinite(front.y)){el.style.display='none';return;}
    const dx=front.x-pixel.x,dy=front.y-pixel.y;
    orientation=view.type==='3d'&&right?groundFanMatrix({x:dx,y:dy},{x:right.x-pixel.x,y:right.y-pixel.y})||'':'';
    if(!orientation)orientation=`rotate(${Math.atan2(dx,-dy)*180/Math.PI})`;
    this.cache={view,geometry,camera:view.camera,zoom:view.zoom,rotation:view.rotation,bearing,transform:orientation};
   }
   const group=el.querySelector('g'),transform=`translate(30 30) ${orientation} translate(-30 -30)`;
   if(group?.getAttribute('transform')!==transform)group?.setAttribute('transform',transform);
   el.style.display='block';
  }catch{el.style.display='none';}
 }
 clear(): void {this.element?.remove();this.element=null;this.cache=null;this.bearing=null;this.last=-Infinity;}
}
