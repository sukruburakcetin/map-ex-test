import { GRAPH_API } from '../../utils/constants';
import { organizationFilterId } from '../../utils/organizationFilter';

interface CachedName { name: string | null; expires: number }
interface PendingName { controller: AbortController; promise: Promise<string | null> }

/** Small per-widget metadata cache. No map, tile, sequence or rendering work. */
export class OrganizationNameLookup {
  private readonly cache = new Map<string, CachedName>();
  private readonly pending = new Map<string, PendingName>();
  private disposed = false;
  constructor(private readonly request: typeof fetch = fetch, private readonly now: () => number = Date.now,
    private readonly timeoutMs = 5000) {}

  resolve(value: string, token: string): Promise<string | null> {
    const id = organizationFilterId(value);
    if (this.disposed || id === undefined || id < 1 || !token) return Promise.resolve(null);
    const key = String(id), cached = this.cache.get(key);
    if (cached && cached.expires > this.now()) {
      this.cache.delete(key); this.cache.set(key, cached);
      return Promise.resolve(cached.name);
    }
    this.cache.delete(key);
    const shared = this.pending.get(key);
    if (shared) return shared.promise;
    if (this.pending.size >= 16) return Promise.resolve(null);
    const controller = new AbortController();
    const promise = this.load(key, token, controller).then(name => {
      if (!this.disposed) {
        while (this.cache.size >= 16) this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(key, { name, expires: this.now() + (name ? 10 * 60 * 1000 : 30000) });
      }
      return name;
    }).finally(() => { this.pending.delete(key); });
    this.pending.set(key, { controller, promise });
    return promise;
  }

  private async load(id: string, token: string, controller: AbortController): Promise<string | null> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let abort: (() => void) | undefined;
    try {
      const cancelled = new Promise<never>((_resolve, reject) => {
        abort = () => reject(new DOMException('Cancelled', 'AbortError'));
        controller.signal.addEventListener('abort', abort, { once: true });
      });
      timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const work = (async () => {
        const response = await this.request(`${GRAPH_API.BASE}/${id}?fields=name`, {
          headers: { Authorization: `OAuth ${token}` }, signal: controller.signal,
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (organizationFilterId(data?.id) !== Number(id) || typeof data?.name !== 'string') return null;
        const name = data.name.trim();
        return name && name.length <= 512 ? name : null;
      })();
      return await Promise.race([work, cancelled]);
    } catch {
      // The existing numeric badge remains useful when optional metadata is unavailable.
      return null;
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      if (abort) controller.signal.removeEventListener('abort', abort);
    }
  }

  dispose(): void {
    this.disposed = true;
    for (const entry of this.pending.values()) entry.controller.abort();
    this.pending.clear(); this.cache.clear();
  }
}
