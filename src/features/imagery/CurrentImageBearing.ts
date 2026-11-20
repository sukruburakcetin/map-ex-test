export interface BearingViewer { getBearing(): Promise<number>; }
/** Image-scoped confirmation of the SDK's cached rendered-camera bearing. No timers or frame loop. */
export class CurrentImageBearing<V extends BearingViewer> {
  private viewer: V | null = null;
  private imageId: string | null = null;
  private bearing: number | undefined;
  private revision = 0;
  private pending: { revision: number; again: boolean } | null = null;
  constructor(private readonly changed: (viewer: V, imageId: string, bearing: number) => void) {}

  invalidate(): void {
    ++this.revision;
    this.viewer = null; this.imageId = null; this.bearing = undefined; this.pending = null;
  }

  select(viewer: V | null, imageId: string, unresolvedNearest = false): void {
    if (unresolvedNearest || this.viewer !== viewer || this.imageId !== imageId) this.invalidate();
  }

  image(viewer: V, imageId: string): void {
    if (this.viewer === viewer && this.imageId === imageId) return;
    this.invalidate(); this.viewer = viewer; this.imageId = imageId;
    this.refresh(viewer);
  }

  read(viewer: V, imageId: unknown): number | undefined {
    return this.viewer === viewer && imageId != null && this.imageId === String(imageId) ? this.bearing : undefined;
  }

  refresh(viewer: V): void {
    if (this.viewer !== viewer || !this.imageId) return;
    if (this.pending) { this.pending.again = true; return; }
    const imageId = this.imageId, task = { revision: this.revision, again: false };
    this.pending = task;
    const current = () => this.pending === task && this.revision === task.revision && this.viewer === viewer && this.imageId === imageId;
    // Image/render notifications share the SDK frame. Read after synchronous frame subscribers finish,
    // rather than reusing the bearing event payload (audited by the SDK) or delaying moveTo.
    void Promise.resolve().then(() => current() ? viewer.getBearing() : undefined).then(value => {
      if (!current() || typeof value !== 'number' || !Number.isFinite(value)) return;
      const bearing = ((value % 360) + 360) % 360;
      if (this.bearing === bearing) return;
      this.bearing = bearing;
      this.changed(viewer, imageId, bearing);
    }).catch(() => { /* Keep the indicator unconfirmed; later SDK events can retry. */ }).finally(() => {
      if (!current()) return;
      this.pending = null;
      if (task.again) this.refresh(viewer);
    });
  }
}
