/** Pending-note projected DOM marker. One owner keeps animation acquisition and cleanup together. */
export interface PendingNoteMarkerView {
  destroyed?: boolean;
  width: number;
  height: number;
  toScreen: (point: any) => { x: number; y: number } | null | undefined;
}
export interface PendingNoteMarkerEnvironment {
  createElement: () => HTMLDivElement;
  createPoint: (geometry: any) => any;
  now: () => number;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (handle: number) => void;
  isVisible: () => boolean;
}

/**
 * Own one projected overlay and its scheduled frame. Visibility is read live; the pulse and viewport
 * clipping preserve the existing behavior. stop releases both resources and makes queued callbacks inert.
 * The caller owns map selection, WGS84/altitude geometry and when to start or stop the marker.
 */
export class PendingNoteMarker {
  private overlay: HTMLDivElement | null = null;
  private view: PendingNoteMarkerView | null = null;
  private frame: number | null = null;
  private readonly environment: PendingNoteMarkerEnvironment;

  constructor(environment: PendingNoteMarkerEnvironment) {
    this.environment = environment;
  }

  /** Attach before projecting, then schedule the existing 1.4-second pulse without replacing SDK symbols. */
  start(view: PendingNoteMarkerView, host: HTMLElement, geometry: any): void {
    this.stop();
    const overlay = this.environment.createElement();
    overlay.setAttribute("aria-hidden", "true");
    Object.assign(overlay.style, { position: "absolute", pointerEvents: "none", zIndex: "11", width: "16px", height: "16px", border: "2px solid white", borderRadius: "50%", background: "#f5a623", boxSizing: "border-box", display: "none", transform: "translate(-50%, -50%)" });
    host.appendChild(overlay); this.overlay = overlay; this.view = view;
    const point = this.environment.createPoint(geometry);
    const started = this.environment.now();
    const animate = (now: number) => {
      if (this.overlay !== overlay || this.view !== view || view.destroyed) return;
      const pixel = view.toScreen(point);
      const visible = this.environment.isVisible() && pixel && Number.isFinite(pixel.x) && Number.isFinite(pixel.y) && pixel.x >= 0 && pixel.y >= 0 && pixel.x <= view.width && pixel.y <= view.height;
      overlay.style.display = visible ? "block" : "none";
      if (visible) {
        overlay.style.left = `${pixel.x}px`; overlay.style.top = `${pixel.y}px`;
        overlay.style.transform = `translate(-50%, -50%) scale(${1 + 0.15 * Math.sin((now - started) * Math.PI * 2 / 1400)})`;
      }
      this.frame = this.environment.requestFrame(animate);
    };
    this.frame = this.environment.requestFrame(animate);
  }

  /** Cancel the latest frame and remove the owned overlay; repeated cleanup is safe. */
  stop(): void {
    if (this.frame != null) this.environment.cancelFrame(this.frame);
    this.frame = null;
    this.overlay?.remove(); this.overlay = null; this.view = null;
  }
}
