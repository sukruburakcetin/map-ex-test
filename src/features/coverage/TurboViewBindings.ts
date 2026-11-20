import { TIMING } from "../../utils/constants";

interface Removable { remove(): void; }
export interface TurboBindingView {
  map?: unknown;
  destroyed?: boolean;
  type: string;
  watch(property: string | string[], callback: (value: any) => void): Removable;
}
export interface TurboViewHost<V> {
  currentView(): V | null | undefined;
  active(): boolean;
  username(): string;
  configuredCreator(): string | undefined;
  debounce(callback: (stationary: boolean) => Promise<void>, milliseconds: number): (stationary: boolean) => void;
  enableCoverage(creator?: string): Promise<unknown>;
  refreshPulse(view: V): void;
  resumePreview(): void;
  refreshSymbols(): void;
  showHelp(): void;
}

/** Own Turbo watcher handles; retain the existing debounced callback lifetime. */
export class TurboViewBindings<V extends TurboBindingView> {
  private stationary: Removable | null = null;
  private zoom: Removable | null = null;
  constructor(private readonly host: TurboViewHost<V>) {}

  clear(): void {
    if (this.stationary) { this.stationary.remove(); this.stationary = null; }
    if (this.zoom) { this.zoom.remove(); this.zoom = null; }
  }

  bind(view: V): void {
    if (this.stationary) this.stationary.remove();
    this.stationary = view.watch("stationary", this.host.debounce(async isStationary => {
      if (this.host.currentView() !== view || !view.map || view.destroyed) return;
      if (isStationary && this.host.active()) {
        const stateFilter = this.host.username().trim();
        const configFilter = this.host.configuredCreator() || "";
        const effectiveFilter = stateFilter || configFilter;
        if (effectiveFilter) await this.host.enableCoverage(effectiveFilter);
        else await this.host.enableCoverage();
        this.host.refreshPulse(view);
        this.host.resumePreview();
      }
    }, TIMING.TURBO_DEBOUNCE_MS));
    if (this.zoom) this.zoom.remove();
    this.zoom = view.watch(view.type === "2d" ? ["zoom", "rotation"] : "zoom", () => {
      if (this.host.currentView() !== view || !view.map || view.destroyed) return;
      this.host.refreshSymbols();
      if (this.host.active()) this.host.showHelp();
    });
  }
}
