/** Small, normalized metadata only. No thumbnails, reconstruction, detection or SDK image retention. */
export interface ImageInformation {
  id: string; capturedAt?: number | null; contributor?: string | null; organization?: string | null;
  make?: string | null; model?: string | null; projection?: string | null;
  width?: number | null; height?: number | null; onFoot?: boolean | null;
}
export const IMAGE_INFORMATION_FIELDS = 'id,captured_at,creator.username,organization.name,make,model,camera_type,width,height,on_foot';
const text = (v: unknown): string | null => typeof v === 'string' && v.trim() ? v.trim().slice(0, 256) : null;
const size = (v: unknown): number | null => typeof v === 'number' && Number.isSafeInteger(v) && v > 0 && v <= 100000 ? v : null;
const timestamp = (v: unknown): number | null => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 8640000000000000 ? v : null;
/** Project just requested scalar fields; absent properties do not erase an already loaded value. */
export function normalizeImageInformation(id: string, raw: any): ImageInformation {
  const out: ImageInformation = { id };
  if (!raw || typeof raw !== 'object' || raw.id != null && String(raw.id) !== id) return out;
  if ('captured_at' in raw) out.capturedAt = timestamp(raw.captured_at);
  if ('creator' in raw) out.contributor = text(raw.creator?.username);
  if ('organization' in raw) out.organization = text(raw.organization?.name);
  if ('make' in raw) out.make = text(raw.make);
  if ('model' in raw) out.model = text(raw.model);
  if ('camera_type' in raw) out.projection = text(raw.camera_type);
  if ('width' in raw) out.width = size(raw.width);
  if ('height' in raw) out.height = size(raw.height);
  if ('on_foot' in raw) out.onFoot = typeof raw.on_foot === 'boolean' ? raw.on_foot : null;
  return out;
}
export interface InformationViewerImage { id?: string | number; capturedAt?: number | null; creatorUsername?: string | null; cameraType?: string | null; }
/** Read public, already available SDK scalars only; original dimensions come from Graph. */
export function viewerImageInformation(image: InformationViewerImage): ImageInformation {
  const out: ImageInformation = { id: String(image.id) };
  if (timestamp(image.capturedAt) !== null) out.capturedAt = timestamp(image.capturedAt);
  if (text(image.creatorUsername)) out.contributor = text(image.creatorUsername);
  if (text(image.cameraType)) out.projection = text(image.cameraType);
  return out;
}
export interface InformationEvents { on(type: string, listener: (event: any) => void): unknown; off?(type: string, listener: (event: any) => void): unknown; }
export interface InformationViewer extends InformationEvents { getImage(): Promise<InformationViewerImage>; getComponent(name: string): InformationEvents; }
export interface ImageInformationHost {
  isPaused(): boolean; isVisible(): boolean; scope(): unknown;
  isCurrent(viewer: InformationViewer, id: string): boolean;
  seed(image: InformationViewerImage): ImageInformation;
  load(viewer: InformationViewer, id: string, signal: AbortSignal): Promise<ImageInformation>;
}
export interface ImageInformationView { kind: 'empty' | 'loading' | 'ready' | 'deferred' | 'error'; data?: ImageInformation; }
interface VisibilitySource { hidden?: boolean; addEventListener(type: string, fn: () => void): void; removeEventListener(type: string, fn: () => void): void; }
interface Clock { set(fn: () => void): ReturnType<typeof setTimeout>; clear(handle: ReturnType<typeof setTimeout>): void; }
/** Exists only after explicit expansion. At most one settled-image request and 16 scalar cache entries.
 * Playback frames return before reading metadata or publishing UI. Playback/loading/close abort
 * owned work; stop removes subscriptions but retains bounded successful data for reopening.
 */
export class ImageInformationController {
  private viewer: InformationViewer | null = null;
  private listener: ((value: ImageInformationView) => void) | null = null;
  private bindings: Array<() => void> = [];
  private request: AbortController | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private revision = 0;
  private cache = new Map<string, ImageInformation>();
  private cacheScope: unknown;
  private visibility: VisibilitySource | undefined;
  private loading = false;
  constructor(private host: ImageInformationHost, private clock: Clock = { set: fn => setTimeout(fn, 250), clear: handle => clearTimeout(handle) }) {}
  private allowed(): boolean { return this.host.isPaused() && this.host.isVisible() && !this.visibility?.hidden && !this.loading; }
  private emit(value: ImageInformationView): void { this.listener?.(value); }
  private cancel(): void { ++this.revision; if (this.timer !== null) this.clock.clear(this.timer); this.timer = null; this.request?.abort(); this.request = null; }
  private bind(events: InformationEvents, name: string, fn: (event: any) => void): void {
    events.on(name, fn); this.bindings.push(() => { try { events.off?.(name, fn); } catch { /* Removed SDK component. */ } });
  }
  start(viewer: InformationViewer, listener: (value: ImageInformationView) => void, visibility?: VisibilitySource): void {
    this.stop(); this.viewer = viewer; this.listener = listener; this.visibility = visibility; this.loading = false;
    const source = viewer;
    try {
      this.bind(viewer, 'image', event => { if (this.viewer === source && this.allowed()) this.accept(event.image); });
      this.bind(viewer, 'dataloading', event => { if (this.viewer !== source) return; const loading = event.loading === true; if (loading === this.loading) return; this.loading = loading; if (!this.host.isPaused()) return; this.cancel(); if (this.loading) this.emit({ kind: 'deferred' }); else this.refresh(); });
      const sequence = viewer.getComponent('sequence');
      this.bind(sequence, 'playing', event => { if (this.viewer !== source) return; this.cancel(); if (event.playing || !this.allowed()) this.emit({ kind: 'deferred' }); else this.refresh(); });
      const changed = () => { this.cancel(); if (this.allowed()) this.refresh(); else this.emit({ kind: 'deferred' }); };
      visibility?.addEventListener('visibilitychange', changed); this.bindings.push(() => visibility?.removeEventListener('visibilitychange', changed));
      this.refresh();
    } catch { this.stop(); listener({ kind: 'empty' }); }
  }
  refresh(): void {
    this.cancel(); const viewer = this.viewer, revision = this.revision;
    if (!viewer) return;
    if (!this.allowed()) { this.emit({ kind: 'deferred' }); return; }
    this.emit({ kind: 'loading' });
    void Promise.resolve().then(() => viewer.getImage()).then(image => { if (revision === this.revision && this.viewer === viewer && this.allowed()) this.accept(image); }, () => { if (revision === this.revision) this.emit({ kind: 'empty' }); });
  }
  private accept(image: InformationViewerImage | undefined): void {
    if (!image?.id || !this.viewer || !this.allowed()) return;
    const id = String(image.id), viewer = this.viewer;
    if (!this.host.isCurrent(viewer, id)) return;
    this.cancel(); const revision = this.revision;
    const scope = this.host.scope(); if (scope !== this.cacheScope) { this.cache.clear(); this.cacheScope = scope; }
    const cached = this.cache.get(id);
    if (cached) { this.cache.delete(id); this.cache.set(id, cached); this.emit({ kind: 'ready', data: cached }); return; }
    const seed = this.host.seed(image);
    if (['capturedAt', 'contributor', 'organization', 'make', 'model', 'projection', 'width', 'height', 'onFoot'].every(key => Object.prototype.hasOwnProperty.call(seed, key))) {
      this.remember(id, seed); this.emit({ kind: 'ready', data: seed }); return;
    }
    this.emit({ kind: 'loading', data: seed });
    this.timer = this.clock.set(() => {
      this.timer = null;
      if (!this.allowed() || revision !== this.revision || this.viewer !== viewer || !this.host.isCurrent(viewer, id)) return;
      const request = new AbortController(); this.request = request;
      void this.host.load(viewer, id, request.signal).then(data => {
        if (request.signal.aborted || revision !== this.revision || !this.allowed() || this.viewer !== viewer || !this.host.isCurrent(viewer, id) || scope !== this.host.scope() || data.id !== id) return;
        const merged = { ...seed, ...data }; this.remember(id, merged);
        this.emit({ kind: 'ready', data: merged });
      }, failure => {
        if (revision !== this.revision || request.signal.aborted) return;
        this.emit({ kind: failure?.name === 'AbortError' ? 'deferred' : 'error', data: seed });
      }).finally(() => { if (this.request === request) this.request = null; });
    });
  }
  private remember(id: string, data: ImageInformation): void {
    this.cache.set(id, data);
    while (this.cache.size > 16) this.cache.delete(this.cache.keys().next().value!);
  }
  stop(): void { this.listener = null; this.cancel(); this.bindings.splice(0).forEach(remove => remove()); this.viewer = null; this.visibility = undefined; }
  dispose(): void { this.stop(); this.cache.clear(); this.cacheScope = undefined; }
}
