/** One bounded timer for nonessential zoom UI during playback. No selection/hover ownership. */
export class PlaybackZoomUi<View> {
  private pending: { view: View; zoom: number; at: number } | null = null;
  private timer: any = null;
  private generation = 0;
  constructor(private host: {
    current(view: View): boolean;
    readout(view: View, zoom: number): void;
    cone(view: View): void;
    now(): number;
    timer(work: () => void, delay: number): any;
    cancel(handle: any): void;
  }, private readonly interval = 120) {}
  push(view: View, zoom: number, playing: boolean): void {
    if (!Number.isFinite(zoom) || !this.host.current(view)) return;
    if (!playing) { this.cancel(); this.host.readout(view, zoom); this.host.cone(view); return; }
    if (this.pending && this.pending.view !== view) this.cancel();
    this.pending = { view, zoom, at: this.host.now() };
    this.schedule();
  }
  private schedule(): void {
    if (this.timer !== null) return;
    const generation = this.generation;
    this.timer = this.host.timer(() => {
      if (generation !== this.generation) return;
      this.timer = null;
      const pending = this.pending;
      if (!pending || !this.host.current(pending.view)) { this.cancel(); return; }
      this.host.readout(pending.view, pending.zoom);
      if (this.host.now() - pending.at >= this.interval) {
        this.cancel(); this.host.cone(pending.view);
      } else this.schedule();
    }, this.interval);
  }
  cancel(): void {
    ++this.generation;
    if (this.timer !== null) this.host.cancel(this.timer);
    this.timer = null; this.pending = null;
  }
}
