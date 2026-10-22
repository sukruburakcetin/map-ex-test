/** Native scene-lighting snapshot and ShadowCast widget owner; solar position stays runtime-owned. */
export interface SolarLightingView {
  type: string;
  environment: { lighting: any };
  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };
}
export interface SolarShadowWidget {
  viewModel: { date: Date; visualizationType: string } | undefined;
  destroy(): void;
}
export type SolarShadowConstructor = new (properties: { view: SolarLightingView }) => SolarShadowWidget;

export class SolarSceneLighting {
  private originalLighting: any = null;
  private widget: SolarShadowWidget | null = null;
  private readonly loadWidget: () => Promise<SolarShadowConstructor[]>;
  private readonly reportError: (error: unknown) => void;

  constructor(loadWidget: () => Promise<SolarShadowConstructor[]>, reportError: (error: unknown) => void) {
    this.loadWidget = loadWidget; this.reportError = reportError;
  }

  /** Save native lighting once and apply the photo date without awaiting the optional widget.
   * The caller's live revision/view/mode predicate rejects late module results; the widget guard
   * also prevents duplicate creation when multiple module requests complete together.
   */
  update(view: SolarLightingView, photoDate: Date, isCurrent: () => boolean): void {
    if (!this.originalLighting && view.environment?.lighting) this.originalLighting = view.environment.lighting.clone();
    view.environment.lighting = { type: 'sun', date: photoDate, directShadowsEnabled: true };
    if (!this.widget) {
      this.loadWidget().then(([ShadowCast]) => {
        if (!isCurrent() || this.widget) return;
        try {
          this.widget = new ShadowCast({ view });
          this.widget.viewModel!.date = photoDate;
          this.widget.viewModel!.visualizationType = 'discrete';
          view.ui.add(this.widget, 'top-right');
        } catch (error) { this.reportError(error); }
      });
    } else if (this.widget.viewModel) {
      this.widget.viewModel.date = photoDate;
      this.widget.viewModel.visualizationType = 'discrete';
    }
  }

  /** Restore the supplied original scene's lighting and remove its widget after update invalidation.
   * The runtime invalidates the solar map revision before calling this operation.
   */
  restore(ownerView: { type: string } | undefined): void {
    if (ownerView?.type === '3d') {
      const view = ownerView as SolarLightingView;
      if (this.originalLighting) { view.environment.lighting = this.originalLighting; this.originalLighting = null; }
      if (this.widget) { view.ui.remove(this.widget); this.widget.destroy(); this.widget = null; }
    }
  }
}
