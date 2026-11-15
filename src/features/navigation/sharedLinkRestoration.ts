/** Browser query access required by the shared-link reader, without a full Window dependency. */
export interface SharedLinkWindow {
  self: unknown;
  top: unknown;
  parent?: { location: { search: string } } | null;
  location: { search: string };
}
export interface SharedLinkMapView {
  type: string;
  zoom?: number;
  center?: { longitude?: number; latitude?: number };
  when(): PromiseLike<unknown>;
  goTo(target: any, options: any): PromiseLike<unknown>;
}
export interface SharedLinkViewer {
  getImage(): PromiseLike<{ id?: string; compassAngle?: number | null }>;
  setCenter(center: [number, number]): unknown;
}
export interface SharedViewerBearingHost {
  getViewer(): SharedLinkViewer | null | undefined;
  onBearing(bearing: number): void;
  updateUrl(imageId: string, latitude: number, longitude: number): void;
  warn(error: unknown): void;
}

/** Read the parent's query when framed, retaining child-query fallback on access failure.
 * Returns raw parameters; defaults, one-time map switching and Graph loading stay runtime-owned.
 */
export function readSharedLinkParameters(getWindow: () => SharedLinkWindow = () => window): URLSearchParams {
  const browser = getWindow();
  let search = browser.location.search;
  try {
    if (browser.self !== browser.top && browser.parent) search = browser.parent.location.search;
  } catch (error) { console.warn('Cannot access parent window params, using widget params'); }
  return new URLSearchParams(search);
}

/** Duration reflects travel distance/zoom change, while SDK reduced-motion
 * preferences remain authoritative. Inputs may omit a geographic center. */
export function sharedMapFlightDuration(view: SharedLinkMapView, coordinates: readonly number[], zoom: number): number {
 const scene=view.type==='3d',delta=Number.isFinite(view.zoom)?Math.abs(zoom-view.zoom!):6;
 const lon=view.center?.longitude,lat=view.center?.latitude;
 let distance=0;
 if(Number.isFinite(lon)&&Number.isFinite(lat)){
  const r=Math.PI/180,dlat=(coordinates[1]-lat!)*r,dlon=(coordinates[0]-lon!)*r;
  const a=Math.sin(dlat/2)**2+Math.cos(lat!*r)*Math.cos(coordinates[1]*r)*Math.sin(dlon/2)**2;
  distance=12742*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));
 }
 return Math.round(Math.min(scene?5000:4000,Math.max(scene?2000:1400,(scene?2000:1400)+delta*220+Math.log2(1+distance)*150)));
}

/** Await view readiness and camera completion; cancelled startup work never
 * starts a new flight. No fixed post-flight delay is added. */
export async function restoreSharedMapCamera(view: SharedLinkMapView, coordinates: readonly number[],
  bearing: number, mapZoom: number, createPoint: (properties: any) => any, current:()=>boolean=()=>true): Promise<void> {
  await view.when();
  if(!current())return;
  const targetPoint=createPoint({longitude:coordinates[0],latitude:coordinates[1],spatialReference:{wkid:4326}});
  const target=view.type==='3d'?{target:targetPoint,heading:bearing,tilt:60,zoom:mapZoom}:{target:targetPoint,zoom:mapZoom};
  await view.goTo(target,{animate:true,duration:sharedMapFlightDuration(view,coordinates,mapZoom),easing:'ease-in-out'});
}

/** Restore viewer bearing through normalized centre coordinates, without calling setZoom.
 * Apply as soon as the requested image is ready. A replacement viewer, different
 * image or cancelled startup cannot receive late center/bearing/URL writes.
 */
export async function restoreSharedViewerBearing(imageId: string, coordinates: readonly number[],
  bearing: number, host: SharedViewerBearingHost, current:()=>boolean=()=>true): Promise<boolean> {
  const viewer=host.getViewer();
  if(!viewer||!current())return false;
  try {
    const image=await viewer.getImage();
    if(!current()||host.getViewer()!==viewer||(image.id!=null&&String(image.id)!==String(imageId)))return false;
    const diff=bearing-(image.compassAngle??0);
    viewer.setCenter([(((0.5+diff/360)%1)+1)%1,0.5]);
    host.onBearing(bearing);
    host.updateUrl(imageId,coordinates[1],coordinates[0]);
    return true;
  } catch(error){if(current()&&host.getViewer()===viewer)host.warn(error);return false;}
}
