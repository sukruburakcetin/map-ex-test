/** One delayed status across overlapping pick, metadata and thumbnail work.
 * Tokens own their cleanup; a late completion cannot clear a newer request.
 */
export class DelayedHoverStatus {
  private pending = new Map<object, () => void>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private visible = false;
  private disposed = false;
  constructor(private changed: (visible: boolean) => void, private delay = 250,
    private schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout> = (callback, delay) => setTimeout(callback, delay),
    private cancel: (timer: ReturnType<typeof setTimeout>) => void = timer => clearTimeout(timer)) {}

  begin(signal: AbortSignal): () => void {
    if (this.disposed || signal.aborted) return () => {};
    const token = {};
    const finish = () => {
      signal.removeEventListener('abort', finish);
      if (!this.pending.delete(token)) return;
      if (!this.pending.size) {
        if (this.timer !== null) this.cancel(this.timer);
        this.timer = null; this.show(false);
      }
    };
    this.pending.set(token, finish);
    signal.addEventListener('abort', finish, { once: true });
    if (!this.visible && this.timer === null) this.timer = this.schedule(() => {
      this.timer = null;
      if (this.pending.size && !this.disposed) this.show(true);
    }, this.delay);
    if (signal.aborted) finish();
    return finish;
  }
  clear(): void { for (const finish of [...this.pending.values()]) finish(); }
  dispose(): void { this.disposed = true; this.clear(); }
  private show(visible: boolean): void {
    if (this.visible === visible) return;
    this.visible = visible;
    if (!this.disposed) this.changed(visible);
  }
}
