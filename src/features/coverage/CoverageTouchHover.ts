/** Touch has no persistent hover position. Retire previews and readiness replays
 * without cancelling the tap/click that opens imagery. Mouse/pen hover is retained. */
export class CoverageTouchHover {
 private touching=false;
 private until=0;
 private disposed=false;
 private removers:Array<()=>void>=[];
 constructor(container:HTMLElement, dismiss:()=>void, private now:()=>number=Date.now){
  const document=container.ownerDocument;
  const listen=(target:EventTarget|null|undefined,type:string,callback:(event:any)=>void)=>{
   if(!target)return;
   target.addEventListener(type,callback,{capture:true,passive:true});
   this.removers.push(()=>target.removeEventListener(type,callback,{capture:true}));
  };
  const start=()=>{this.touching=true;this.until=this.now()+800;dismiss();};
  const end=(remaining=false)=>{if(!this.touching)return;this.touching=remaining;this.until=this.now()+800;dismiss();};
  listen(container,'pointerdown',event=>{if(event.pointerType==='touch')start();});
  listen(document,'pointerup',event=>{if(event.pointerType==='touch')end();});
  listen(document,'pointercancel',event=>{if(event.pointerType==='touch')end();});
  // Also cover touch-only embedded browsers. No preventDefault/stopPropagation.
  listen(container,'touchstart',start);
  listen(document,'touchend',event=>end(event.touches?.length>0));
  listen(document,'touchcancel',()=>end());
  listen(document.defaultView,'blur',()=>end());
 }
 shouldIgnore(event:{pointerType?:string;native?:{pointerType?:string}}):boolean {
  return !this.disposed&&(event.pointerType==='touch'||event.native?.pointerType==='touch'||this.touching||this.now()<this.until);
 }
 dispose():void {this.disposed=true;this.touching=false;for(const remove of this.removers)remove();this.removers=[];}
}
