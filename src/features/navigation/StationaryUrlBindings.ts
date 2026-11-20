interface Removable { remove(): void; }
export interface StationaryUrlView {
  map?: unknown;
  destroyed?: boolean;
  watch(property: string, callback: (stationary: boolean) => void): Removable;
}
export interface StationaryUrlHost<V> {
  currentView(): V | null | undefined;
  flyIn(): boolean;
  imageId(): string | null | undefined;
  refreshPulse(view: V): void;
  updateUrl(imageId: string | undefined): void;
}

/** Own the persistent stationary URL watcher without changing its startup attachment point. */
export class StationaryUrlBindings<V extends StationaryUrlView> {
  private handle: Removable | null = null;
  constructor(private readonly host: StationaryUrlHost<V>) {}

  clear(): void {
    if (this.handle) { this.handle.remove(); this.handle = null; }
  }

  bind(view: V): void {
    this.clear();
    this.handle = view.watch("stationary", stationary => {
      if (!stationary) return;
      if (this.host.currentView() !== view || !view.map || view.destroyed) return;
      this.host.refreshPulse(view);
      if (this.host.flyIn()) return;
      this.host.updateUrl(this.host.imageId() ?? undefined);
    });
  }
}
