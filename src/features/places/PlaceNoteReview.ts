import type { Place } from './placesModel';
import type { PlaceNoteDestination,PlaceNoteOptions,PlaceNoteImage,PlaceContributionSeed } from './placeNote';
import { placeNoteDescription } from './placeNote';
import { validDetectionBounds } from '../detections/detectionPreview';
interface Context {place:Place|null;view:{destroyed?:boolean}|null;imageId:string|null;enabled:boolean}
export class PlaceNoteReview {
 private revision=0;private abort:AbortController|null=null;private pickCancel:(()=>void)|null=null;private crop:string|null=null;private context:Context|null=null;
 constructor(private host:{context():Context;blocked(destination:PlaceNoteDestination):boolean;capture(image:PlaceNoteImage,signal:AbortSignal):Promise<string>;remove(id:string):Promise<void>;pick(picked:(p:{lon:number;lat:number})=>void,cancelled:()=>void):()=>void;draw(p:{lon:number;lat:number}):void;clear():void;open(seed:PlaceContributionSeed,destination:PlaceNoteDestination):void;phase(value:'idle'|'capturing'|'picking'):void;error(message:string):void}){}
 cancel():void {const active=!!(this.context||this.abort||this.pickCancel||this.crop);++this.revision;this.abort?.abort();this.abort=null;const pick=this.pickCancel;this.pickCancel=null;pick?.();const crop=this.crop;this.crop=null;if(crop)void this.host.remove(crop).catch(()=>{});if(this.context)this.host.clear();this.context=null;if(active)this.host.phase('idle');}
 contextChanged():void {const c=this.context,next=this.host.context();if(c&&(c.place!==next.place||c.view!==next.view||!next.enabled||c.imageId!==next.imageId))this.cancel();}
 async begin(destination:PlaceNoteDestination,options:PlaceNoteOptions={}):Promise<void>{
  if(this.host.blocked(destination))return;this.cancel();const c=this.host.context(),place=c.place;
  if(!place||!c.enabled||!c.view||c.view.destroyed||![place.lon,place.lat].every(Number.isFinite))return;
  const image=options.image;
  if(image&&(!/^\d+$/.test(image.imageId)||image.imageId!==c.imageId||!validDetectionBounds(image.bounds))){this.host.error('The viewed image changed. Review the crop again.');return;}
  this.context=c;const revision=this.revision,abort=new AbortController();this.abort=abort;
  const current=()=>{const next=this.host.context();return revision===this.revision&&!abort.signal.aborted&&next.enabled&&!next.view?.destroyed&&next.place===place&&next.view===c.view&&(!image||next.imageId===image.imageId);};
  const finish=(point:{lon:number;lat:number})=>{
   this.pickCancel=null;if(!current()){this.cancel();return;}
   if(![point.lon,point.lat].every(Number.isFinite)||Math.abs(point.lon)>180||Math.abs(point.lat)>90){this.cancel();return;}
   const description=placeNoteDescription(place,image)+(options.pickLocation?'\nLocation: adjusted on map.':'\nLocation: mapped Overture place.')+`\nNote location: ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`;
   const seed:PlaceContributionSeed={requestId:crypto.randomUUID(),placeId:place.id,title:place.name,description,lon:point.lon,lat:point.lat,imageId:image?.imageId||null,...(image?{bounds:image.bounds,attachmentId:this.crop||undefined}:{})};
   try{this.host.open(seed,destination);this.crop=null;this.context=null;this.abort=null;this.host.phase('idle');}catch{this.host.error('The place note could not be opened. Please retry.');this.cancel();}
  };
  try{
   if(image){this.host.phase('capturing');const id=await this.host.capture(image,abort.signal);if(!current()){await this.host.remove(id);if(revision===this.revision)this.cancel();return;}this.crop=id;}
   if(!current()){this.cancel();return;}this.host.draw(place);
   if(options.pickLocation){this.host.phase('picking');const cancel=this.host.pick(finish,()=>{this.pickCancel=null;this.cancel();});if(current()&&this.context)this.pickCancel=cancel;else cancel();}
   else finish(place);
  }catch(error){if(current()){this.host.error('The place note could not be prepared. Retry or turn off the image attachment.');this.cancel();}else if(revision===this.revision)this.cancel();}
 }
}
