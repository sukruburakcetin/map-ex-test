/** Instance-owned idle nearby enrichment; playback and UI remain runtime-owned. */
import { GRAPH_API, TIMING } from '../../utils/constants';
import type { NearbyImage } from '../../components/types';

/** Rank one bounded API batch by geodesic distance before choosing the visible20.
 * Stable ties and unknown coordinates retain server order; source data is untouched. */
export function nearestNearbyImages(images:readonly NearbyImage[],lat:number,lon:number,imageId:string,limit=20):NearbyImage[] {
 const valid=(p:any)=>Array.isArray(p)&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90;
 const seen=new Set<string>();
 return images.filter(image=>{const id=String(image.id||'');if(!id||id===String(imageId)||seen.has(id))return false;seen.add(id);return true;})
  .map((image,index)=>{
   const p=valid(image.computed_geometry?.coordinates)?image.computed_geometry!.coordinates:image.geometry?.coordinates;
   let distance=Infinity;
   if(valid(p)&&Number.isFinite(lat)&&Number.isFinite(lon)){
    const radians=Math.PI/180,a=Math.sin((p[1]-lat)*radians/2)**2+Math.cos(lat*radians)*Math.cos(p[1]*radians)*Math.sin((p[0]-lon)*radians/2)**2;
    distance=12742000*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));
   }
   return {image,index,distance};
  }).sort((a,b)=>a.distance===b.distance?a.index-b.index:a.distance-b.distance).slice(0,Math.max(0,limit)).map(item=>item.image);
}

export interface NearbyDiscoveryDependencies {
  getState: () => { imageId: string | null; nearbyLoading?: boolean };
  update: (patch: { nearbyLoading?: boolean; nearbyImages?: NearbyImage[]; nearbyCanExpand?: boolean }) => void;
  isPaused: () => boolean;
  isVisible?: () => boolean;
  isInteracting?: () => boolean;
  now?: () => number;
  getToken: () => string;
  isInitialLoad: () => boolean;
  markInitialLoadComplete: () => void;
  runBackground?: <T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal) => Promise<T>;
}

/** Demand-driven optional enrichment. A small, token-scoped cache never owns
 * foreground image opening or route work. Metadata only; no thumbnail blobs. */
export class NearbyImageDiscovery {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private controller: AbortController | null = null;
  private identity='';
  private pendingApply:(()=>void)|null=null;
  private cacheToken:string|null=null;
  private cache=new Map<string,{at:number;limit:number;images:NearbyImage[]}>();
  private metrics={requests:0,cacheHits:0,cancelledWork:0,responseBytes:0,sizedResponses:0,completedRequests:0,totalRequestMs:0,lastRequestMs:0};
  constructor(private readonly dependencies: NearbyDiscoveryDependencies) {}
  private now():number{return this.dependencies.now?.()??Date.now();}
  get stats(){return {...this.metrics,cachedAreas:this.cache.size,inFlight:!!this.controller,waiting:!!this.timer,waitingForPointer:!!this.pendingApply};}
  resetStats():void{for(const key of Object.keys(this.metrics) as (keyof typeof this.metrics)[])this.metrics[key]=0;}
  flush():void{if(this.dependencies.isInteracting?.())return;const apply=this.pendingApply;this.pendingApply=null;apply?.();}
  private visible():boolean{return this.dependencies.isVisible?.()!==false;}

  /** Explicit panel opening can request immediately; passive frame updates wait
   * for idle. Expansion is user-requested only, never automatic pagination. */
  schedule(lat:number,lon:number,imageId:string,immediate=false,expanded=false):void {
    if(!this.visible()||!this.dependencies.isPaused()){this.cancel();return;}
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){this.cancel();return;}
    const token=this.dependencies.getToken(),limit=expanded?100:40,key=`${lat.toFixed(6)}:${lon.toFixed(6)}`;
    if(this.cacheToken!==token){this.cache.clear();this.cacheToken=token;}
    const identity=`${imageId}:${key}:${limit}`;
    if(identity===this.identity&&(this.timer!==null||this.controller))return;
    this.cancel();this.identity=identity;
    const first=this.dependencies.isInitialLoad();if(first)this.dependencies.markInitialLoadComplete();
    const current=()=>this.identity===identity&&this.dependencies.getState().imageId===imageId&&this.dependencies.getToken()===token&&this.visible()&&this.dependencies.isPaused();
    const apply=(images:NearbyImage[],candidateLimit:number)=>{
      const publish=()=>{if(current())this.dependencies.update({nearbyImages:nearestNearbyImages(images,lat,lon,imageId),nearbyLoading:false,nearbyCanExpand:candidateLimit<100&&images.length>=candidateLimit});};
      if(this.dependencies.isInteracting?.()){this.pendingApply=publish;this.dependencies.update({nearbyLoading:false});}
      else {this.pendingApply=null;publish();}
    };
    const cached=this.cache.get(key);
    if(cached&&this.now()-cached.at<120000&&cached.limit>=limit&&current()){
      ++this.metrics.cacheHits;this.cache.delete(key);this.cache.set(key,cached);apply(cached.images,cached.limit);return;
    }
    if(cached&&this.now()-cached.at>=120000)this.cache.delete(key);
    const doFetch=()=>{
      this.timer=null;if(!current())return;
      const ctrl=new AbortController();this.controller=ctrl;
      this.dependencies.update({nearbyLoading:true});
      const url=GRAPH_API.nearbyImages(lat,lon,50,limit)+`&access_token=${token}`;
      const request=async(signal:AbortSignal)=>{
        if(signal.aborted||ctrl.signal.aborted||this.controller!==ctrl||!current())throw new DOMException('Cancelled','AbortError');
        const start=this.now();++this.metrics.requests;
        try{
          const response=await fetch(url,{signal,priority:'low'} as RequestInit & {priority:'low'});
          if(signal.aborted||ctrl.signal.aborted)throw new DOMException('Cancelled','AbortError');
          if(!response.ok)throw new Error('Nearby images unavailable');
          const size=response.headers?.get('content-length');
          if(size!=null&&Number.isFinite(Number(size))&&Number(size)>=0){this.metrics.responseBytes+=Number(size);++this.metrics.sizedResponses;}
          const data=await response.json();
          if(signal.aborted||ctrl.signal.aborted)throw new DOMException('Cancelled','AbortError');
          return data;
        }finally{
          const elapsed=Math.max(0,this.now()-start);this.metrics.lastRequestMs=elapsed;this.metrics.totalRequestMs+=elapsed;++this.metrics.completedRequests;
        }
      };
      const run=this.dependencies.runBackground||((work:(signal:AbortSignal)=>Promise<any>)=>work(ctrl.signal));
      run(request,ctrl.signal).then(data=>{
        if(ctrl.signal.aborted||this.controller!==ctrl||!current())return;
        const images=(Array.isArray(data.data)?data.data as NearbyImage[]:[]).slice(0,limit);
        this.cache.delete(key);this.cache.set(key,{at:this.now(),limit,images});
        for(const [cacheKey,entry]of this.cache)if(this.now()-entry.at>=120000)this.cache.delete(cacheKey);
        while(this.cache.size>12)this.cache.delete(this.cache.keys().next().value!);
        apply(images,limit);
      }).catch(()=>{/* Optional failure retains loaded thumbnails. */}).finally(()=>{
        if(this.controller!==ctrl)return;this.controller=null;
        if(!ctrl.signal.aborted)this.dependencies.update({nearbyLoading:false});
      });
    };
    if(immediate){doFetch();return;}
    this.timer=setTimeout(doFetch,first?TIMING.SPLASH_FADE_MS+300:1500);
  }
  cancel():void{this.pendingApply=null;this.cancelRequest();this.cancelTimer();if(this.dependencies.getState().nearbyLoading)this.dependencies.update({nearbyLoading:false});}
  cancelTimer():void{this.pendingApply=null;if(this.timer!==null)clearTimeout(this.timer);this.timer=null;this.identity='';}
  cancelRequest():void{if(this.controller&&!this.controller.signal.aborted){++this.metrics.cancelledWork;this.controller.abort();}this.controller=null;this.identity='';}
}
