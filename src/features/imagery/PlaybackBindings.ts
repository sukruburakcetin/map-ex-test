/** Native Mapillary sequence events used by playback recovery. */
export interface PlaybackPlayingComponent {
  on(type: 'playing', callback: (event: { playing: boolean }) => void): unknown;
  off?(type: 'playing', callback: (event: { playing: boolean }) => void): unknown;
}
export interface PlaybackBindingsHost {
  isPaused(): boolean;
  setPaused(paused: boolean): void;
  getLastInteraction(): number;
  recordInteraction(time: number): void;
  onPlaying(): void;
  refreshNearbyAfterPause(): void;
  announceRecovery(): void;
  recover(): unknown;
  now(): number;
  schedule(callback: () => void, delay: number): ReturnType<typeof setTimeout>;
  cancel(handle: ReturnType<typeof setTimeout>): void;
}

/** Owns one native playing subscription, two capture listeners and pending recovery callbacks.
 * Preserves the 500 ms user-intent window and individual 400 ms recovery triggers;
 * no debounce or duplicate-halt suppression is introduced. Recovery policy stays separate.
 * Rebind/clear releases prior resources; a generation guard also ignores late SDK callbacks.
 */
export class PlaybackBindings {
  private readonly host: PlaybackBindingsHost;
  private component: PlaybackPlayingComponent | null = null;
  private playing: ((event: { playing: boolean }) => void) | null = null;
  private container: HTMLElement | null = null;
  private generation = 0;
  private readonly pending = new Set<ReturnType<typeof setTimeout>>();
  constructor(host: PlaybackBindingsHost) { this.host = host; }

  /** Keep pointer/keyboard intent filters identical to the runtime's previous controls policy. */
  private interaction = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (target instanceof HTMLCanvasElement || target?.tagName === 'CANVAS') return;
    if (event instanceof KeyboardEvent && event.code !== 'Space' && event.key !== ' ') return;
    if (event instanceof PointerEvent || event instanceof MouseEvent) {
      const sequenceControl = target?.closest?.('.mapillary-sequence-container, [class*="sequence"]');
      const button = target?.closest?.('button');
      if (!sequenceControl && !button) return;
    }
    this.host.recordInteraction(this.host.now());
    this.host.setPaused(true);
  };

  /** Replace prior bindings without changing current pause intent or interaction timestamp. */
  bind(component: PlaybackPlayingComponent | null | undefined, container: HTMLElement | null): void {
    this.clear();
    const generation = this.generation;
    if (component) {
      this.component = component;
      this.playing = event => {
        if (generation !== this.generation) return;
        if (event.playing) {
          this.host.setPaused(false);
          this.host.onPlaying();
        } else if (this.host.now() - this.host.getLastInteraction() < 500) {
          this.host.setPaused(true);
          this.host.refreshNearbyAfterPause();
        } else if (!this.host.isPaused()) {
          this.host.announceRecovery();
          const handle = this.host.schedule(() => {
            this.pending.delete(handle);
            if (generation === this.generation) this.host.recover();
          }, 400);
          this.pending.add(handle);
        }
      };
      component.on('playing', this.playing);
    }
    if (container) {
      this.container = container;
      container.addEventListener('pointerdown', this.interaction, true);
      container.addEventListener('keydown', this.interaction, true);
    }
  }

  /** Remove bindings from their original component/container and cancel delayed recovery.
   * Missing/throwing SDK off is tolerated; generation checks neutralize retained callbacks.
   * Does not stop native playback or change pause intent; runtime keeps that ordering explicit.
   */
  clear(): void {
    ++this.generation;
    try { if (this.component && this.playing) this.component.off?.('playing', this.playing); }
    catch { /* The viewer may already be disposed. */ }
    this.component = null; this.playing = null;
    if (this.container) {
      this.container.removeEventListener('pointerdown', this.interaction, true);
      this.container.removeEventListener('keydown', this.interaction, true);
    }
    this.container = null;
    this.pending.forEach(handle => this.host.cancel(handle));
    this.pending.clear();
  }
}
