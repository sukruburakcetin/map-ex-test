/** Ground-aligned navigation target; 3D is steady, 2D retains its existing pulse. */
export interface DirectionMarkerGraphic { symbol: any; geometry?: any; visible?: boolean; }
export interface DirectionMarkerView<G> {
 type: string;
 graphics: { add(graphic: G): unknown; remove(graphic: G): unknown };
}
export interface DirectionMarkerMinimap<G> {
 graphics: { forEach(callback: (graphic: G) => void): void };
 add(graphic: G): unknown; remove(graphic: G): unknown;
}
interface GroundMarker {
 showMarker(view: any, lon: number, lat: number, color: any, imageId: string): void;
 show?(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void;
 hideCone?(): void;
 clear(): void;
}
export interface DirectionMarkerHost<G> {
 getView(): DirectionMarkerView<G> | null | undefined;
 getMinimap(): DirectionMarkerMinimap<G> | null;
 createGraphic(properties: any): G;
 createGroundMarker?(presented: (visible: boolean) => void): GroundMarker;
 setInterval(callback: () => void, milliseconds: number): ReturnType<typeof setInterval>;
 clearInterval(handle: ReturnType<typeof setInterval>): void;
}
export class DirectionHoverMarker<G extends DirectionMarkerGraphic> {
 graphic: G | null = null;
 private view: DirectionMarkerView<G> | null = null;
 private minimap: DirectionMarkerMinimap<G> | null = null;
 private minimapGraphic: G | null = null;
 private ground: GroundMarker | null = null;
 private timer: ReturnType<typeof setInterval> | null = null;
 constructor(private readonly host: DirectionMarkerHost<G>) {}
 draw(view: DirectionMarkerView<G>, image: {id: string; lon: number; lat: number; bearing?: number}): void {
  const geometry={type:'point',longitude:image.lon,latitude:image.lat,spatialReference:{wkid:4326}};
  const symbol=(size:number)=>view.type==='3d'?{
   type:'point-3d',symbolLayers:[{type:'icon',resource:{primitive:'circle'},material:{color:[255,193,7,1]},size:12,
    outline:{color:'white',size:2},occludedVisibility:{mode:'visible'}}]
  }:{type:'simple-marker',style:'circle',color:[255,255,0,.8],size,outline:{color:[255,165,0,1],width:3}};
  // Reposition the existing 3D target without rebuilding its Graphic or display owner.
  if(this.view===view && view.type==='3d' && this.graphic){
   this.graphic.geometry=geometry;
   if(this.minimapGraphic)this.minimapGraphic.geometry=geometry;
   this.showGroundTarget(view,image);
   return;
  }
  this.clear();this.view=view;
  const graphic=this.host.createGraphic({geometry,symbol:symbol(16)});
  this.graphic=graphic;view.graphics.add(graphic);
  this.minimap=this.host.getMinimap();
  if(this.minimap){
   this.minimapGraphic=this.host.createGraphic({geometry,symbol:{type:'simple-marker',style:'circle',color:[255,255,0,.85],size:12,outline:{color:[255,165,0,1],width:2}}});
   (this.minimapGraphic as any).__isDirectionHover=true;this.minimap.add(this.minimapGraphic);
  }
  if(view.type==='3d'){
   // ScreenDirectionCone uses rendered terrain, bounded ground projection and settled caching.
   // Keep a steady native fallback until the overlay has a valid screen anchor.
   try {
    this.ground=this.host.createGroundMarker?.(presented=>{if(this.graphic===graphic)graphic.visible=!presented})||null;
    this.showGroundTarget(view,image);
   } catch {this.ground?.clear();this.ground=null;graphic.visible=true;}
   return;
  }
  let growing=true,size=16;
  this.timer=this.host.setInterval(()=>{
   if(this.graphic!==graphic)return;
   size+=growing ? .5 : -.5;if(size>=20)growing=false;if(size<=16)growing=true;
   graphic.symbol=symbol(size);
  },60);
 }
 private showGroundTarget(view: DirectionMarkerView<G>, image: {id: string; lon: number; lat: number; bearing?: number}): void {
  this.ground?.showMarker(view,image.lon,image.lat,[255,193,7,1],image.id);
  if(Number.isFinite(image.bearing)) this.ground?.show?.(view,image.lon,image.lat,((image.bearing!%360)+360)%360,6,50);
  else this.ground?.hideCone?.();
 }
 clear(): void {
  if(this.timer!==null)this.host.clearInterval(this.timer);this.timer=null;
  this.ground?.clear();this.ground=null;
  if(this.graphic)this.view?.graphics.remove(this.graphic);
  if(this.minimapGraphic)this.minimap?.remove(this.minimapGraphic);
  this.graphic=null;this.minimapGraphic=null;this.minimap=null;this.view=null;
 }
}
