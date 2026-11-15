/** Adaptive scene-display resource owner. Source points and geometry edits remain with the runtime. */
export interface AdaptiveDisplayView {
  destroyed?: boolean;
  stationary?: boolean;
  watch?: (property: string, callback: (stationary: boolean) => void) => { remove(): void };
}
export interface AdaptiveDisplayState {
  layer: { destroyed?: boolean; definitionExpression?: string } | null;
  view: AdaptiveDisplayView | null | undefined;
  ownerView: AdaptiveDisplayView | null;
  count: number;
  adaptive: boolean;
  toolsActive: boolean;
  groundHeight?: number;
}
export type DisplayExpression = (count: number, adaptive: boolean, moving: boolean, toolsActive: boolean, groundHeight?: number) => string;

export class PointCloudAdaptiveDisplay {
  private watch: { remove(): void } | null = null;
  private view: AdaptiveDisplayView | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private moving = false;

  private readonly read: () => AdaptiveDisplayState;
  private readonly expression: DisplayExpression;

  constructor(read: () => AdaptiveDisplayState, expression: DisplayExpression) {
    this.read = read;
    this.expression = expression;
  }

  /** Apply the existing sampling policy to the owned live layer and bind one stationary watcher.
   * Re-read state on callbacks so replaced views and disabled adaptive mode cannot receive old events.
   * Active tools retain full detail; the supplied expression policy also preserves ground filtering.
   */
  update(): void {
    const state = this.read(), { layer, view } = state;
    if (!layer || layer.destroyed || !view || view.destroyed || view !== state.ownerView) return;
    const expression = this.expression(state.count, state.adaptive, this.moving, state.toolsActive, state.groundHeight);
    if (layer.definitionExpression !== expression) layer.definitionExpression = expression;
    if (!state.adaptive) { this.dispose(); return; }
    if (this.view !== view && typeof view.watch === 'function') {
      this.watch?.remove();
      if (this.timer) clearTimeout(this.timer); this.timer = null;
      this.view = view;
      this.moving = view.stationary === false;
      this.watch = view.watch('stationary', (stationary: boolean) => {
        const current = this.read();
        if (current.view !== view || !current.adaptive) return;
        if (this.timer) clearTimeout(this.timer); this.timer = null;
        if (!stationary) { this.moving = true; this.update(); }
        else this.timer = setTimeout(() => { this.timer = null; this.moving = false; this.update(); }, 400);
      });
      this.update();
    }
  }

  /** Release both owned resources and reset movement state on cloud clear, view transfer or mode disable. */
  dispose(): void {
    this.watch?.remove(); this.watch = null; this.view = null;
    if (this.timer) clearTimeout(this.timer); this.timer = null; this.moving = false;
  }
}
