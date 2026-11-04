/** Bounded thumbnail preview using the image's own pose, never a direction to
 * the current camera. Missing heading shows a point without inventing a cone. */
import { ScreenDirectionCone } from '../map-graphics/ScreenDirectionCone';
import type { NearbyImage } from '../../components/types';
export function nearbyImagePose(img:NearbyImage):{lon:number;lat:number;heading:number|null}|null {
 const valid=(p:any)=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90;
 const computed=valid(img.computed_geometry?.coordinates)&&Number.isFinite(img.computed_compass_angle);
 const coordinates=computed?img.computed_geometry!.coordinates:img.geometry?.coordinates;
 if(!valid(coordinates))return null;
 const heading=computed?img.computed_compass_angle:img.compass_angle;
 return {lon:coordinates[0],lat:coordinates[1],heading:Number.isFinite(heading)?((heading!%360)+360)%360:null};
}
export class NearbyImageHighlight<G> {
 private pin:G|null=null;
 private view:any=null;
 private screen:ScreenDirectionCone|null=null;
 clear():void {this.screen?.clear();if(this.pin)this.view?.graphics?.remove(this.pin);this.pin=null;this.view=null;}
 update(view:any,modules:{Graphic:new(p:any)=>G;Point?:new(p:any)=>any}|null,state:{imageId:string|null},img:NearbyImage|null,anchor?:{lon:number;lat:number}):void {
  this.clear();
  if(!view||!modules||!img||String(img.id)===String(state.imageId))return;
  const original=nearbyImagePose(img);if(!original)return;
  const pose={...original,...anchor};
  this.view=view;
  const document=view.container?.ownerDocument;
  if(document?.createElement&&modules.Point){
   this.screen??=new ScreenDirectionCone(p=>new modules.Point!(p),()=>document.createElement('div'),
    {request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)},undefined,
    {fill:'#2bb83f',opacity:'0.35',stroke:'#ffc800',markerRadius:5});
   this.screen.showMarker(view,pose.lon,pose.lat,[255,200,0,1],String(img.id));
   if(pose.heading!==null)this.screen.show(view,pose.lon,pose.lat,pose.heading,4,50);
   return;
  }
  this.pin=new modules.Graphic({geometry:{type:'point',longitude:pose.lon,latitude:pose.lat,spatialReference:{wkid:4326}},
   symbol:{type:'simple-marker',style:'circle',color:[255,200,0,1],size:8,outline:{color:'white',width:1.5}}});
  view.graphics.add(this.pin);
 }
}
