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


/** Fixed CSS-pixel direction fan; no terrain mesh and no zoom visibility threshold. */
export class ScreenDirectionCone {
 private element: HTMLDivElement | null = null;
 private view: any = null;
 private frame: number | null = null;
 private projectionCache: any = null;
 private model: { lon: number; lat: number; heading: number; radius: number; spread: number } | null = null;
 constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,
  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void }) {}
 show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {
  if (view !== this.view) this.clear();
  const radius = Math.min(52, Math.max(18, 32 * Math.sqrt(metres / 10))), angle = Math.min(120, Math.max(15, spread));
  const previous = this.model;
  if (!previous || previous.lon!==lon || previous.lat!==lat || previous.heading!==heading || previous.radius!==radius || previous.spread!==angle) this.model = { lon, lat, heading, radius, spread: angle };
  if (!this.element) {
   const host = view.container;
   if (!host || typeof host.appendChild !== 'function') return;
   const element = this.createElement(); element.setAttribute('aria-hidden', 'true');
   Object.assign(element.style, { position: 'absolute', pointerEvents: 'none', width: '120px', height: '120px', zIndex: '8', display: 'none', transformOrigin: '50% 50%' });
   host.appendChild(element); this.element = element; this.view = view;
  }
  if (!previous || previous.radius !== radius || previous.spread !== angle || !this.element.firstChild) {
   const a = angle * Math.PI / 360, inner = 9;
   const x = Math.sin(a), y = Math.cos(a), left = `${60-radius*x} ${60-radius*y}`, right = `${60+radius*x} ${60-radius*y}`;
   const start = `${60-inner*x} ${60-inner*y}`, end = `${60+inner*x} ${60-inner*y}`;
   // A clear central hole leaves the native green circle and white outline uncovered.
   this.element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><path d="M${start} L${left} A${radius} ${radius} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z" fill="#ffb300" fill-opacity="0.55" stroke="#ff9800" stroke-width="1.25" stroke-linejoin="round"/></svg>`;
  }
  if (this.frame == null) {
   let last = -Infinity;
   const track = (now: number) => {
    if (this.view !== view || !this.element || view.destroyed) { this.clear(); return; }
    if (now-last >= 32) { last = now; try { this.position(); } catch { this.element.style.display = 'none'; } }
    this.frame = this.clock.request(track);
   };
   this.frame = this.clock.request(track);
  }
 }
 private position(): void {
  const view = this.view, element = this.element, m = this.model;
  if (!view || !element || !m) return;
  if (view.container.ownerDocument?.visibilityState === 'hidden') { element.style.display = 'none'; return; }
  let pixel: any, bearing: number;
  const cache = this.projectionCache;
  if(cache && cache.model===m && cache.camera===view.camera && cache.zoom===view.zoom && cache.rotation===view.rotation && cache.width===view.width && cache.height===view.height && view.stationary===true && view.updating===false) { pixel=cache.pixel; bearing=cache.bearing; }
  else {
  const source = this.point({ longitude: m.lon, latitude: m.lat, spatialReference: { wkid: 4326 } });
  let ground = view.type === '3d' ? renderedGroundPoint(view, source, this.point) : source;
  // At overview scale, missing terrain height has negligible screen displacement.
  if (!ground && view.zoom < 14) ground = this.point({ longitude:m.lon, latitude:m.lat, z:0, spatialReference:{wkid:4326} });
  pixel = ground && view.toScreen(ground);
  if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) || pixel.x < 0 || pixel.y < 0 || pixel.x > view.width || pixel.y > view.height) { element.style.display = 'none'; return; }
  const radians = m.heading*Math.PI/180, distance = Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40));
  const tip = this.point({ longitude: m.lon + Math.sin(radians)*distance/(111320*Math.max(.01,Math.cos(m.lat*Math.PI/180))), latitude: Math.max(-89,Math.min(89,m.lat+Math.cos(radians)*distance/111320)), z: ground.z || 0, spatialReference:{wkid:4326} });
  const projected = view.toScreen(tip), dx = projected?.x-pixel.x, dy = projected?.y-pixel.y;
  bearing = Number.isFinite(dx) && Number.isFinite(dy) && Math.hypot(dx,dy)>.001 ? Math.atan2(dx,-dy)*180/Math.PI : m.heading-(view.type==='3d'?view.camera?.heading||0:view.rotation||0);
  this.projectionCache={model:m,pixel,bearing,camera:view.camera,zoom:view.zoom,rotation:view.rotation,width:view.width,height:view.height};
  }
  element.style.display = 'block';
  const position = haloOverlayPosition(view.container,element,pixel,view.width,view.height);
  if (!position) { element.style.display = 'none'; return; }
  const left=`${position.x}px`,top=`${position.y}px`,transform=`translate(-50%, -50%) rotate(${bearing}deg)`;
  if(element.style.left!==left)element.style.left=left;
  if(element.style.top!==top)element.style.top=top;
  if(element.style.transform!==transform)element.style.transform=transform;
 }
 clear(): void {
  if(this.frame!=null)this.clock.cancel(this.frame);
  this.frame=null;this.element?.remove();this.element=null;this.view=null;this.model=null;this.projectionCache=null;
 }
}
