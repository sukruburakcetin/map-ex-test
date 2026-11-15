/** A layout/HMR remount may leave an old widget alive on the same map. Share
 * presentation ownership across module copies, scoped by map and widget ID. */
type Entry={retire:()=>void};
type Registry=WeakMap<object,Map<string,Entry>>;
const key=Symbol.for('mapillary-explorer.current-image-presentations.v1');
const scope=globalThis as unknown as Record<symbol,Registry>;
const registry:Registry=scope[key]||(scope[key]=new WeakMap());
export class CurrentImagePresentationOwner {
 private map:object|null=null;
 private widgetId='';
 private entry:Entry|null=null;
 activate(map:object,widgetId:string,retire:()=>void):void {
  if(this.owns(map)&&this.widgetId===widgetId)return;
  this.release();
  let owners=registry.get(map);if(!owners){owners=new Map();registry.set(map,owners);}
  const previous=owners.get(widgetId),entry={retire};
  this.map=map;this.widgetId=widgetId;this.entry=entry;
  // Publish the new owner before retiring the old one. Its cleanup/callbacks
  // cannot delete or redraw the replacement's resources.
  owners.set(widgetId,entry);
  if(previous)previous.retire();
 }
 owns(map:object):boolean {return !!this.entry&&this.map===map&&registry.get(map)?.get(this.widgetId)===this.entry;}
 release():void {
  if(this.map&&this.entry){const owners=registry.get(this.map);if(owners?.get(this.widgetId)===this.entry){owners.delete(this.widgetId);if(!owners.size)registry.delete(this.map);}}
  this.map=null;this.entry=null;
 }
}
