/** World-space calibration offsets in meters: east, north, and up. No datum conversion. */
export interface PointCloudCalibrationOffset { x: number; y: number; z: number; }
export interface PointCloudCalibrationDependencies {
  readOffsets(): PointCloudCalibrationOffset;
  writeOffsets(offset: PointCloudCalibrationOffset): void;
  /** Viewer bearing in degrees; read on each input, never retained across frames. */
  readBearing(): number;
  readStep(): number;
  /** Borrow the widget's trailing debounce; the widget owns its 150 ms timer and cancellation. */
  requestRender(): void;
  renderMap(): void;
  drawRings(): void;
  updateViewer(): void;
}

/** Coordinates accepted calibration inputs without owning clouds, SDK resources, DOM events or timers.
 * The widget guards visibility, result readiness and typing targets before forwarding input.
 * Offsets remain authoritative in the widget because geometry, viewer and exports read them live.
 */
export class PointCloudCalibration {
  constructor(private readonly dependencies: PointCloudCalibrationDependencies) {}

  /** Accumulate T/G forward/back, F/H left/right and R/V vertical motion only.
   * Keyboard steps are 0.2 m or 1 m with Shift. Rendering waits for key release.
   * Keep the original operation order for coordinate precision and repeated-key behavior.
   */
  keyDown(key: string, shift: boolean): boolean {
    const offset = this.dependencies.readOffsets();
    const step = shift ? 1.0 : 0.2;
    const bearingRad = (this.dependencies.readBearing() * Math.PI) / 180;
    const cosB = Math.cos(bearingRad);
    const sinB = Math.sin(bearingRad);
    switch (key.toLowerCase()) {
      case 't': offset.y += step * cosB; offset.x += step * sinB; break;
      case 'g': offset.y -= step * cosB; offset.x -= step * sinB; break;
      case 'f': offset.y += step * sinB; offset.x -= step * cosB; break;
      case 'h': offset.y -= step * sinB; offset.x += step * cosB; break;
      case 'r': offset.z += step; break;
      case 'v': offset.z -= step; break;
      default: return false;
    }
    this.dependencies.writeOffsets(offset);
    return true;
  }

  /** Schedule only movement-key releases; simultaneous releases share the existing debounce. */
  keyUp(key: string): void {
    if (['t', 'f', 'h', 'g', 'r', 'v'].includes(key.toLowerCase())) this.dependencies.requestRender();
  }

  /** Apply the UI-selected meter step relative to live bearing, then feedback, then debounce.
   * The feedback callback is synchronous so the toast still precedes render scheduling.
   */
  joystick(axis: 'x' | 'y' | 'z', direction: 1 | -1, feedback: () => void): void {
    const offset = this.dependencies.readOffsets();
    const step = this.dependencies.readStep() * direction;
    const bearingRad = (this.dependencies.readBearing() * Math.PI) / 180;
    const cosB = Math.cos(bearingRad);
    const sinB = Math.sin(bearingRad);
    if (axis === 'y') { offset.y += step * cosB; offset.x += step * sinB; }
    else if (axis === 'x') { offset.y -= step * sinB; offset.x += step * cosB; }
    else if (axis === 'z') offset.z += step;
    this.dependencies.writeOffsets(offset);
    feedback();
    this.dependencies.requestRender();
  }

  /** Reset all offsets, notify, and rebuild the map immediately, as before.
   * Does not cancel a pending debounce or add viewer updates; cleanup remains with the widget.
   */
  reset(feedback: () => void): void {
    this.dependencies.writeOffsets({ x: 0, y: 0, z: 0 });
    feedback();
    this.dependencies.renderMap();
  }

  /** Commit using current state: map rebuild, explicit ring refresh, then viewer colors/resize.
   * Map rebuild also requests rings; the explicit second refresh intentionally preserves timing.
   */
  commit(): void {
    this.dependencies.renderMap();
    this.dependencies.drawRings();
    this.dependencies.updateViewer();
  }
}
