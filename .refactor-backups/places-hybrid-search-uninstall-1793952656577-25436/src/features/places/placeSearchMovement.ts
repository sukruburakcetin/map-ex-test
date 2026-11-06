import type { PlaceBbox } from './placesModel';
import { distanceMeters } from '../../utils/geoUtils';
export interface PlaceSearchArea { bbox:PlaceBbox; zoom:number; token:object; }
/** Compare with the last completed/failed search, so small pans accumulate. No timers or requests. */
export function significantPlaceMovement(previous:PlaceSearchArea|null,next:PlaceSearchArea):boolean {
 if(!previous||previous.token!==next.token)return true;
 if(Math.abs(next.zoom-previous.zoom)>=.5)return true;
 const a=previous.bbox,b=next.bbox;
 const width=Math.max(.000001,a[2]-a[0]),height=Math.max(.000001,a[3]-a[1]);
 const nextWidth=Math.max(.000001,b[2]-b[0]),nextHeight=Math.max(.000001,b[3]-b[1]);
 // Include scene tilt, rotation and container resizing that change visible area without a zoom change.
 if(Math.max(nextWidth/width,width/nextWidth,nextHeight/height,height/nextHeight)>=1.35)return true;
 const ax=(a[0]+a[2])/2,ay=(a[1]+a[3])/2,bx=(b[0]+b[2])/2,by=(b[1]+b[3])/2;
 const longitudeShift=Math.abs(((bx-ax+540)%360)-180);
 return (longitudeShift>=width*.25||Math.abs(by-ay)>=height*.25)&&distanceMeters(ay,ax,by,bx)>=25;
}
