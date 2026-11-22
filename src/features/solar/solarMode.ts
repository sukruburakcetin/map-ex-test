/** Only the mode flags consulted by the original functional updater. */
export interface SolarModeState {
  isSolarMode: boolean;
  isMeasureMode: boolean;
  isSightMode: boolean;
  isViewshedMode: boolean;
  isLassoMode: boolean;
}

/** React scheduling, resource cleanup and localized UI stay host-bound. */
export interface SolarModeHost {
  enabled(): boolean;
  setState(updater: (previous: SolarModeState) => { isSolarMode: boolean }, callback: () => void): void;
  active(): boolean;
  clearMeasurement(): void;
  clearSight(): void;
  clearViewshed(): void;
  clearLasso(): void;
  notifyEnabled(): void;
  update(): void;
  clear(): void;
}

/** Toggle solar mode using the original updater-side cleanup and live callback branch.
 * Do not await rendering or move cleanup outside the updater; React retains scheduling ownership.
 */
export async function toggleSolarMode(host: SolarModeHost): Promise<void> {
  if (!host.enabled()) return;
  host.setState(previous => {
    const nextMode = !previous.isSolarMode;
    if (nextMode) {
      if (previous.isMeasureMode) host.clearMeasurement();
      if (previous.isSightMode) host.clearSight();
      if (previous.isViewshedMode) host.clearViewshed();
      if (previous.isLassoMode) host.clearLasso();
    }
    return { isSolarMode: nextMode };
  }, () => {
    if (host.active()) {
      host.notifyEnabled();
      host.update();
    } else {
      host.clear();
    }
  });
}
