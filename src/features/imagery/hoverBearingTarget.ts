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

/** Small, view/route-owned hints for completed local scans; no new scans, requests or timers on read. */
export class HoverBearingHintCache {
 private entries=new Map<string,{frames:readonly unknown[];id:string;expires:number}>();
 private view:unknown;
 private useView(view:unknown):void {if(this.view!==view){this.entries.clear();this.view=view;}}
 peek(view:unknown,frames:readonly unknown[],key:string):string|undefined {
  this.useView(view);const entry=this.entries.get(key);
  if(!entry)return undefined;
  if(entry.frames!==frames||entry.expires<Date.now()){this.entries.delete(key);return undefined;}
  return entry.id;
 }
 remember(view:unknown,frames:readonly unknown[],key:string,id:string):void {
  this.useView(view);this.entries.delete(key);this.entries.set(key,{frames,id,expires:Date.now()+30000});
  while(this.entries.size>16)this.entries.delete(this.entries.keys().next().value!);
 }
}
