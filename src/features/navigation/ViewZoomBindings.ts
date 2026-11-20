import { ZOOM } from "../../utils/constants";

interface Removable { remove(): void; }
type UrlUpdate = (() => void) & { cancel?: () => void };
export interface ZoomBindingView {
  map?: unknown;
  destroyed?: boolean;
  zoom: number;
  type: string;
  watch(property: string, callback: (value: any) => void): Removable;
}
export interface ViewZoomHost<V> {
  currentView(): V | null | undefined;
  flyIn(): boolean;
  imageId(): string | null | undefined;
  qualityActive(): boolean;
  debounce(callback: () => void, milliseconds: number): UrlUpdate;
  updateUrl(imageId: string | undefined): void;
  publishZoom(zoom: number): void;
  refreshPulse(view: V): void;
  refreshMarkers(): unknown;
  redrawCone(view: V): void;
  showWarning(message: string, duration: number): void;
  clearWarning(): void;
}

/** Own only zoom/camera watch handles and their URL debounce for one widget instance. */
export class ViewZoomBindings<V extends ZoomBindingView> {
  private cameraHandle: Removable | null = null;
  private zoomHandle: Removable | null = null;
  private writeUrl: UrlUpdate = Object.assign(() => {}, { cancel: () => {} });

  constructor(private readonly host: ViewZoomHost<V>) {}

  clear(): void {
    this.cameraHandle?.remove(); this.cameraHandle = null;
    if (this.zoomHandle) { this.zoomHandle.remove(); this.zoomHandle = null; }
    this.writeUrl.cancel?.();
  }

  bind(view: V): void {
    this.clear();
    this.writeUrl = this.host.debounce(() => {
      if (this.host.currentView() !== view || !view.map || view.destroyed) return;
      if (this.host.flyIn()) return;
      this.host.updateUrl(this.host.imageId() ?? undefined);
    }, 600);
    this.host.publishZoom(view.zoom);
    this.zoomHandle = view.watch("zoom", (newZoom: number) => {
      if (this.host.currentView() !== view || !view.map || view.destroyed) return;
      this.host.refreshPulse(view);
      this.host.publishZoom(newZoom);
      this.writeUrl();
      void this.host.refreshMarkers();
      this.host.redrawCone(view);
      if (this.host.qualityActive()) {
        if (newZoom < ZOOM.TILE_FETCH) {
          this.host.showWarning("Quality bands are based on sequence-level averages until you zoom in further.", 0);
        } else this.host.clearWarning();
      }
    });
    if (view.type === "3d") this.cameraHandle = view.watch("camera", () => this.host.redrawCone(view));
  }
}
