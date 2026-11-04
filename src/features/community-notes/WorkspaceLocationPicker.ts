export interface WorkspaceMapLocation { lon: number; lat: number }
export type WorkspaceLocationRequest = (onPicked:(point:WorkspaceMapLocation)=>void,onCancelled:()=>void)=>()=>void;

/** One-shot map intent, independent of notes/auth/SDK. Invalid clicks stay in pick
 * mode. Cancellation, replacement and view changes retire the previous callback.
 * No timers, requests or persistent coordinates are introduced.
 */
export class WorkspaceLocationPicker<V extends {destroyed?:boolean}> {
  private pending: {view:V;picked:(point:WorkspaceMapLocation)=>void;cancelled:()=>void}|null=null;
  get active():boolean{return !!this.pending;}
  begin(view:V,onPicked:(point:WorkspaceMapLocation)=>void,onCancelled:()=>void):()=>void {
    this.cancel();if(view.destroyed){onCancelled();return()=>{};}
    const request={view,picked:onPicked,cancelled:onCancelled};this.pending=request;
    return()=>{if(this.pending===request)this.cancel();};
  }
  /** Return true whenever the pick owns this click, without opening imagery/tools. */
  consume(view:V,point:WorkspaceMapLocation|null):boolean {
    const request=this.pending;if(!request)return false;
    if(request.view!==view||view.destroyed){this.cancel();return false;}
    if(!point||!Number.isFinite(point.lon)||!Number.isFinite(point.lat)||Math.abs(point.lon)>180||Math.abs(point.lat)>90)return true;
    this.pending=null;request.picked(point);return true;
  }
  cancel():void{const request=this.pending;this.pending=null;request?.cancelled();}
}
