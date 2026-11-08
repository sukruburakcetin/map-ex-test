/** One physical lookup and one latest intent; never queue pointer movements. */
export class BoundedPlaceHover<T> {
  private pending: { screen: { x: number; y: number }; signal: AbortSignal; done(value: T | null): void; abort(): void; ready: boolean } | null = null;
  private active: AbortController | null = null;
  private physical: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private revision = 0;
  constructor(private request: (screen: { x: number; y: number }, signal: AbortSignal) => Promise<T | null>, private delay = 80) {}
  get stats() { return { active: !!this.physical, pending: !!this.pending }; }
  lookup(screen: { x: number; y: number }, signal: AbortSignal): Promise<T | null> {
    this.clear();
    if (signal.aborted) return Promise.resolve(null);
    return new Promise(done => {
      const intent = { screen: { ...screen }, signal, done, ready: false, abort: () => { if (this.pending === intent) this.clear(); } };
      this.pending = intent; signal.addEventListener('abort', intent.abort, { once: true });
      this.timer = setTimeout(() => { this.timer = null; if (this.pending === intent) { intent.ready = true; this.drain(); } }, this.delay);
    });
  }
  clear(): void {
    ++this.revision;
    if (this.timer !== null) clearTimeout(this.timer); this.timer = null;
    if (this.pending) { const intent = this.pending; this.pending = null; intent.signal.removeEventListener('abort', intent.abort); intent.done(null); }
    this.active?.abort(); this.active = null;
  }
  private drain(): void {
    const intent = this.pending;
    if (this.physical || !intent?.ready) return;
    this.pending = null; intent.signal.removeEventListener('abort', intent.abort);
    if (intent.signal.aborted) { intent.done(null); return; }
    const controller = this.active = new AbortController(), revision = this.revision;
    const cancel = () => controller.abort(); intent.signal.addEventListener('abort', cancel, { once: true });
    this.physical = Promise.resolve().then(() => this.request(intent.screen, controller.signal)).then(
      result => intent.done(controller.signal.aborted || revision !== this.revision ? null : result),
      () => intent.done(null),
    ).finally(() => {
      intent.signal.removeEventListener('abort', cancel);
      if (this.active === controller) this.active = null;
      this.physical = null; this.drain();
    });
  }
}
