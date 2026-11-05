export type MapSpriteKind='signs'|'objects';
export type MapSpriteStatus='idle'|'loading'|'error';
interface Layer {destroyed?:boolean;load():Promise<unknown>}
interface LayerView {updating:boolean;watch(name:string,callback:(value:boolean)=>void):{remove():void}}
interface View {destroyed?:boolean;whenLayerView(layer:any):Promise<LayerView>}
/** One cancellable readiness observer per source. Reuses SDK loading; never fetches tiles itself. */
export class MapSpriteLoading {
 private entries=new Map<MapSpriteKind,{view:View;layer:Layer;frame:number;handle?:{remove():void}}>();
 private statuses=new Map<MapSpriteKind,MapSpriteStatus>();
 constructor(private report:(kind:MapSpriteKind,status:MapSpriteStatus)=>void,private frame:(callback:()=>void)=>number=callback=>requestAnimationFrame(callback),private cancelFrame:(id:number)=>void=id=>cancelAnimationFrame(id)){}
 private status(kind:MapSpriteKind,value:MapSpriteStatus){if(this.statuses.get(kind)!==value){this.statuses.set(kind,value);this.report(kind,value);}}
 clear(kind:MapSpriteKind,report=true){const entry=this.entries.get(kind);this.entries.delete(kind);entry?.handle?.remove();if(entry?.frame)this.cancelFrame(entry.frame);if(report)this.status(kind,'idle');}
 clearAll(){this.clear('signs');this.clear('objects');}
 start(kind:MapSpriteKind,view:View,layer:Layer){
  const previous=this.entries.get(kind);if(previous?.view===view&&previous.layer===layer)return;
  this.clear(kind,false);const entry={view,layer,frame:0,handle:undefined as {remove():void}|undefined};this.entries.set(kind,entry);this.status(kind,'loading');
  const current=()=>this.entries.get(kind)===entry&&!view.destroyed&&!layer.destroyed;
  const finish=(status:MapSpriteStatus)=>{if(!current())return;this.clear(kind,false);this.status(kind,status);};
  void (async()=>{try{await layer.load();if(!current())return;const layerView=await view.whenLayerView(layer);if(!current())return;
   const update=(updating:boolean)=>{if(!current())return;if(entry.frame)this.cancelFrame(entry.frame);entry.frame=0;if(updating)return;
    entry.frame=this.frame(()=>{entry.frame=0;if(!current()||layerView.updating)return;entry.frame=this.frame(()=>{entry.frame=0;if(current()&&!layerView.updating)finish('idle');});});};
   entry.handle=layerView.watch('updating',update);update(layerView.updating);
  }catch{finish('error');}})();
 }
}
