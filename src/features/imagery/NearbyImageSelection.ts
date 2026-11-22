import type { NearbyImage } from '../../components/types';
import { nearbyImagePose } from './nearbyHighlight';

/** Minimal viewer operations used when opening a Nearby capture. */
export interface NearbySelectionViewer {
  moveTo(id: string): Promise<unknown>;
  getImage(): Promise<{ id: string; compassAngle?: number }>;
  setCenter(center: number[]): void;
}

/** Keep live widget identity, presentation and logging outside navigation ownership. */
export interface NearbyImageSelectionHost<View> {
  viewer(): NearbySelectionViewer | null | undefined;
  selection(): number;
  view(): View | undefined;
  cancelDiscovery(): void;
  select(id: string): void;
  heading(heading: number, view: View | undefined): void;
  warn(error: unknown): void;
}

/** Open Nearby captures; only the latest unchanged viewer/selection/view may restore heading. */
export class NearbyImageSelection<View> {
  private revision = 0;
  constructor(private readonly host: NearbyImageSelectionHost<View>) {}

  /** Clear the preview immediately, then restore pose after the requested image is confirmed.
   * Preserve the existing two awaits, identity guards and current-request-only warning boundary.
   */
  async open(img: NearbyImage): Promise<void> {
    const viewer = this.host.viewer(); if (!viewer) return;
    this.host.cancelDiscovery();
    const request = ++this.revision;
    const selection = this.host.selection(), view = this.host.view();
    const current = () => request === this.revision && this.host.viewer() === viewer && this.host.selection() === selection && this.host.view() === view;
    this.host.select(img.id);
    try {
      await viewer.moveTo(img.id); if (!current()) return;
      const image = await viewer.getImage(); if (!current() || String(image.id) !== String(img.id)) return;
      const pose = nearbyImagePose(img);
      if (pose?.heading !== null && pose?.heading !== undefined) {
        const x = (((.5 + (pose.heading - (image.compassAngle ?? 0)) / 360) % 1) + 1) % 1;
        viewer.setCenter([x, .5]); this.host.heading(pose.heading, view);
      }
    } catch (error) { if (current()) this.host.warn(error); }
  }
}
