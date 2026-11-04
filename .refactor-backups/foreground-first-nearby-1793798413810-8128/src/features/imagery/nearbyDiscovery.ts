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
  update: (patch: { nearbyLoading?: boolean; nearbyImages?: NearbyImage[] }) => void;
  isPaused: () => boolean;
  getToken: () => string;
  isInitialLoad: () => boolean;
  markInitialLoadComplete: () => void;
  runBackground?: <T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal) => Promise<T>;
}

export class NearbyImageDiscovery {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private controller: AbortController | null = null;
  constructor(private readonly dependencies: NearbyDiscoveryDependencies) {}

  /**
   * Schedule idle enrichment, keeping previous thumbnails and rejecting stale image results.
   * @param lat Anchor latitude in WGS84 decimal degrees.
   * @param lon Anchor longitude in WGS84 decimal degrees.
   * @param imageId Active image ID, excluded from nearby suggestions.
   */
  schedule(lat: number, lon: number, imageId: string): void {
    this.controller?.abort(); this.controller = null;
    if (this.dependencies.getState().nearbyLoading) this.dependencies.update({ nearbyLoading: false });
    // Cancel previous pending timer, user is still navigating
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const doFetch = () => {
      this.timer = null;
      if (this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId) return;
      // Cancel any in-flight request from a previous stop
      this.controller?.abort();
      const ctrl = new AbortController();
      this.controller = ctrl;

      // Never clear existing images, keep stale thumbnails visible during fetch
      this.dependencies.update({ nearbyLoading: true });

      const url = GRAPH_API.nearbyImages(lat, lon, 50, 100) + `&access_token=${this.dependencies.getToken()}`;

      const request = async (signal: AbortSignal) => {
        if (signal.aborted || ctrl.signal.aborted || this.controller !== ctrl ||
          this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId)
          throw new DOMException('Cancelled', 'AbortError');
        const response = await fetch(url, { signal });
        if (signal.aborted || ctrl.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (!response.ok) throw new Error("Nearby images unavailable");
        const data = await response.json();
        if (signal.aborted || ctrl.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        return data;
      };
      const run = this.dependencies.runBackground || ((work: (signal: AbortSignal) => Promise<any>) => work(ctrl.signal));
      run(request, ctrl.signal)
        .then((data) => {
          if (ctrl.signal.aborted || this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId || this.controller !== ctrl) return;
          const images = nearestNearbyImages(Array.isArray(data.data)?data.data as NearbyImage[]:[],lat,lon,imageId);
          this.dependencies.update({ nearbyImages: images });
        })
        .catch(() => {
          // Aborted or network error, keep previous images
        })
        .finally(() => {
          if (this.controller !== ctrl) return;
          this.controller = null;
          if (!ctrl.signal.aborted) this.dependencies.update({ nearbyLoading: false });
        });
    };

    if (this.dependencies.isInitialLoad()) {
      // First image ever, wait for splash to finish then fetch immediately
      this.dependencies.markInitialLoadComplete();
      this.timer = setTimeout(doFetch, TIMING.SPLASH_FADE_MS + 300);
    } else {
      // Wait 1500ms after the user stops navigating before fetching
      this.timer = setTimeout(doFetch, 1500);
    }
  }

  /** Cancel owned work on navigation, playback or teardown; leave presentation state to the caller. */
  cancel(): void {
    this.cancelRequest();
    this.cancelTimer();
  }
  /** Clear pending idle work while preserving teardown ordering. */
  cancelTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /** Abort the current network request without acquiring new resources. */
  cancelRequest(): void {
    this.controller?.abort(); this.controller = null;
  }

}
