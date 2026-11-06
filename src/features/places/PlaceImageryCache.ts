import type { Place } from './placesModel';
import type { PlaceImagery } from './nearbyPlaceImagery';
/** Per-widget, memory-only LRU. No timers, persistence, requests or shared pending promises. */
export class PlaceImageryCache {
 private entries=new Map<string,{images:PlaceImagery[];expires:number;bytes:number}>();
 private view:object|null=null;
 private credential='';
 private service='';
 private bytes=0;
 constructor(private readonly now:()=>number=()=>Date.now()){}
 scope(view:object,credential:string,service:string):void {
  if(view!==this.view||credential!==this.credential||service!==this.service){this.clear();this.view=view;this.credential=credential;this.service=service;}
 }
 private key(place:Pick<Place,'id'|'lon'|'lat'|'release'>,radius:number):string {return JSON.stringify([place.id,place.lon,place.lat,place.release,radius]);}
 private remove(key:string):void {const entry=this.entries.get(key);if(entry)this.bytes-=entry.bytes;this.entries.delete(key);}
 private prune():void {for(const[key,entry]of this.entries)if(entry.expires<=this.now())this.remove(key);}
 get(place:Place,radius:number):PlaceImagery[]|undefined {
  this.prune();const key=this.key(place,radius),entry=this.entries.get(key);if(!entry)return undefined;
  this.entries.delete(key);this.entries.set(key,entry);return entry.images.map(image=>({...image}));
 }
 put(place:Place,radius:number,images:readonly PlaceImagery[]):void {
  this.prune();const key=this.key(place,radius);this.remove(key);
  const copy=images.slice(0,3).map(image=>({...image})),bytes=2*(key.length+JSON.stringify(copy).length);
  if(bytes>65536)return;
  this.entries.set(key,{images:copy,expires:this.now()+(copy.length?120000:20000),bytes});this.bytes+=bytes;
  while(this.entries.size>12||this.bytes>65536)this.remove(this.entries.keys().next().value!);
 }
 clear():void {this.entries.clear();this.bytes=0;this.view=null;this.credential='';this.service='';}
 get stats(){this.prune();return{entries:this.entries.size,bytes:this.bytes};}
}
