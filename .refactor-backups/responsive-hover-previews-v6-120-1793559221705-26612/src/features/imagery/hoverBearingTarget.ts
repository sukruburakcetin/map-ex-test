/** Select preview metadata only. Pointer picking, pulse anchors and accepted clicks stay with their existing owners. */
export interface HoverBearingTarget {
 imageId:string; sequenceId?:string; representative:boolean; zoom:number;
 location?:{lon:number;lat:number}; activeSequence?:string|null; loadedRoute:boolean;
 frames:readonly {id:string;lon:number;lat:number}[]; organizationId?:number;
 signal:AbortSignal;
 distance:(lat1:number,lon1:number,lat2:number,lon2:number)=>number;
 lookup:(sequence:string,location:{lon:number;lat:number},signal:AbortSignal)=>Promise<string|undefined>;
}
/** Mirror existing representative-click resolution without changing its selection policy. */
export async function hoverBearingImageId(target:HoverBearingTarget):Promise<string|undefined> {
 const check=()=>{if(target.signal.aborted)throw new DOMException('Cancelled','AbortError');};check();
 if(!target.representative||!target.sequenceId)return target.imageId;
 const location=target.location;
 if(!location||!Number.isFinite(location.lon)||!Number.isFinite(location.lat))return undefined;
 if(target.organizationId===undefined&&target.activeSequence===target.sequenceId&&target.loadedRoute){
  let nearest=target.imageId,best=Infinity;
  for(let index=0;index<target.frames.length;index++){
   // Match the existing local lookup's cooperative budget on long loaded routes.
   if(index&&index%4096===0){await new Promise<void>(resolve=>setTimeout(resolve,0));check();}
   const frame=target.frames[index],d=target.distance(frame.lat,frame.lon,location.lat,location.lon);
   if(d<best){best=d;nearest=String(frame.id);}
  }
  return nearest;
 }
 if(target.zoom>=6&&target.zoom<14){const id=await target.lookup(target.sequenceId,location,target.signal);check();return id;}
 return target.imageId;
}
