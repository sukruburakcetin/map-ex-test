/** Last-pointer bookkeeping only. Replays this widget's existing hover callback once per ready refresh. */
export interface HoverPointerSnapshot { x:number; y:number; native?:{clientX?:number;clientY?:number;buttons?:number} }
type Timer=ReturnType<typeof setTimeout>;
export class CoverageHoverResume {
 private point:HoverPointerSnapshot|null=null;
 private version=0;
 private lastReady:number|null=null;
 private timer:Timer|null=null;
 private disposed=false;
 constructor(private readonly view:unknown,
  private readonly canReplay:(revision:number,point:HoverPointerSnapshot)=>boolean,
  private readonly replay:(point:HoverPointerSnapshot)=>void,
  private readonly clock:{request(callback:()=>void):Timer;cancel(timer:Timer):void}={request:callback=>setTimeout(callback,0),cancel:timer=>clearTimeout(timer)}){}
 move(point:HoverPointerSnapshot):void {
  if(this.disposed)return;
  this.leave();
  if(!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
  this.point={x:point.x,y:point.y,native:point.native?{clientX:point.native.clientX,clientY:point.native.clientY,buttons:point.native.buttons}:undefined};
 }
 ready(view:unknown,revision:number):void {
  if(this.disposed||view!==this.view||(this.lastReady!==null&&revision<=this.lastReady))return;
  this.lastReady=revision;
  if(this.timer!==null)this.clock.cancel(this.timer);
  this.timer=null;
  const point=this.point,version=this.version;
  if(!point)return;
  this.timer=this.clock.request(()=>{
   this.timer=null;
   if(this.disposed||version!==this.version||!this.canReplay(revision,point))return;
   this.replay(point);
  });
 }
 leave():void {++this.version;this.point=null;if(this.timer!==null)this.clock.cancel(this.timer);this.timer=null;}
 dispose():void {this.leave();this.disposed=true;}
}
