/** Optional bearing decoration driven by the existing brown pulse clock. No own RAF or requests. */
import { groundFanMatrix } from './ScreenDirectionCone';
export class HoverBearingSector {
 private element: HTMLDivElement | null = null;
 private bearing: number | null = null;
 private panorama = false;
 private last = -Infinity;
 private cache: { view: any; geometry: any; camera: any; zoom: number; rotation: number; bearing: number; transform: string } | null = null;
 constructor(private readonly point: (properties: any) => any, private readonly create: () => HTMLDivElement) {}
 show(parent: HTMLElement, bearing: unknown, pano: boolean): void {
  const valid=typeof bearing === 'number' && Number.isFinite(bearing);
  if(!pano && !valid){this.clear();return;}
  const normalized=valid ? (((bearing as number)%360)+360)%360 : null;
  if(this.element?.parentElement!==parent || this.panorama!==pano)this.clear();
  this.panorama=pano;
  if(!this.element){
   const el=this.create();el.setAttribute('aria-hidden','true');
   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'60px',height:'60px',left:'50%',top:'50%',transform:'translate(-50%,-50%)',display:'none'});
   // The seven-pixel opening keeps the existing 6–11px brown pulse unobstructed.
   const a=25*Math.PI/180,r=24,inner=7,x=Math.sin(a),y=Math.cos(a);
   el.innerHTML=pano ? `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="18" fill="none" stroke="#22d3ee" stroke-opacity="0.75" stroke-width="3"/><g data-panorama-pointer="true" style="display:none"><path d="M30 3 L35 11 L25 11 Z" fill="#22d3ee" fill-opacity="0.9" stroke="#0f8f9d" stroke-width="1"/></g></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><g><path d="M${30-inner*x} ${30-inner*y} L${30-r*x} ${30-r*y} A${r} ${r} 0 0 1 ${30+r*x} ${30-r*y} L${30+inner*x} ${30-inner*y} A${inner} ${inner} 0 0 0 ${30-inner*x} ${30-inner*y} Z" fill="#22d3ee" fill-opacity="0.45" stroke="#0f8f9d" stroke-width="1"/></g></svg>`;
   parent.appendChild(el);this.element=el;
  }
  if(this.bearing!==normalized){this.cache=null;this.last=-Infinity;if(pano)this.element?.querySelector<SVGGElement>('g')?.style.setProperty('display','none');}
  this.bearing=normalized;
 }
 update(view: any, geometry: any, pixel: {x:number;y:number} | null | undefined, now: number): void {
  const el=this.element,bearing=this.bearing;if(!el)return;
  if(!pixel || !Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)){el.style.display='none';return;}
  const pointer=this.panorama ? el.querySelector<SVGGElement>('g') : null;
  if(this.panorama && el.style.display!=='block')el.style.display='block';
  if(bearing===null){if(pointer)pointer.style.display='none';return;}
  if(now-this.last<32)return;this.last=now;
  try {
   const cached=this.cache;let orientation:string;
   if(cached&&cached.view===view&&cached.geometry===geometry&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.rotation===view.rotation&&cached.bearing===bearing&&view.stationary===true&&view.updating===false)orientation=cached.transform;
   else {
    const lon=geometry.longitude,lat=geometry.latitude;
    if(!Number.isFinite(lon)||!Number.isFinite(lat)){if(pointer)pointer.style.display='none';else el.style.display='none';return;}
    const rad=bearing*Math.PI/180,d=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(lat*Math.PI/180));
    const project=(angle:number)=>view.toScreen(this.point({longitude:lon+Math.sin(angle)*d/(111320*cos),latitude:Math.max(-89,Math.min(89,lat+Math.cos(angle)*d/111320)),z:geometry.z||0,spatialReference:{wkid:4326}}));
    const front=project(rad),right=!this.panorama&&view.type==='3d'?project(rad+Math.PI/2):null;
    if(!front||!Number.isFinite(front.x)||!Number.isFinite(front.y)){if(pointer)pointer.style.display='none';else el.style.display='none';return;}
    const dx=front.x-pixel.x,dy=front.y-pixel.y;
    if(this.panorama && Math.hypot(dx,dy)<1e-6){if(pointer)pointer.style.display='none';return;}
    orientation=view.type==='3d'&&right?groundFanMatrix({x:dx,y:dy},{x:right.x-pixel.x,y:right.y-pixel.y})||'':'';
    if(!orientation)orientation=`rotate(${Math.atan2(dx,-dy)*180/Math.PI})`;
    this.cache={view,geometry,camera:view.camera,zoom:view.zoom,rotation:view.rotation,bearing,transform:orientation};
   }
   const group=pointer || el.querySelector('g'),transform=`translate(30 30) ${orientation} translate(-30 -30)`;
   if(group?.getAttribute('transform')!==transform)group?.setAttribute('transform',transform);
   if(pointer)pointer.style.display='block';
   el.style.display='block';
  }catch{if(pointer)pointer.style.display='none';else el.style.display='none';}
 }
 clear(): void {this.element?.remove();this.element=null;this.cache=null;this.bearing=null;this.panorama=false;this.last=-Infinity;}
}
