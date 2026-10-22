import { distanceMeters } from '../../utils/geoUtils';
import { elevationIndicatorStyles } from '../../styles/elevationIndicator';

/** Coordinates are WGS84 degrees; optional image altitude and displayed distances are metres. */
export interface ElevationIndicatorImage { id: string; lat: number; lon: number; alt?: number; }
export interface ElevationIndicatorWidget {
  container?: HTMLElement | string | null;
  viewModel?: { hoveredChartPosition: number };
}

/** Synchronize the existing profile chart with the active sequence frame.
 * Reuses the chart's needle/badge DOM, including its SVG bounds and margin fallback.
 * The profile widget owns these nodes and removes them during its existing teardown.
 * This synchronous presentation step performs no requests or map/camera navigation.
 */
export function updateElevationIndicator(widget: ElevationIndicatorWidget | null | undefined,
  sequenceImages: readonly ElevationIndicatorImage[] | null | undefined,
  imageId: string | null | undefined, enabled: boolean): void {
    if (!widget || !enabled) return;
    if (!sequenceImages || sequenceImages.length < 2 || !imageId) return;

    const activeIndex = sequenceImages.findIndex((img) => img.id === imageId);
    if (activeIndex === -1) return;

    // 1. Calculate cumulative distance along the street up to the active frame
    let totalDist = 0;
    let activeDist = 0;

    for (let i = 0; i < sequenceImages.length - 1; i++) {
      const segDist = distanceMeters(sequenceImages[i].lat, sequenceImages[i].lon, sequenceImages[i + 1].lat, sequenceImages[i + 1].lon);
      if (i < activeIndex) {
        activeDist += segDist;
      }
      totalDist += segDist;
    }

    if (totalDist <= 0) return;

    const progress = Math.min(Math.max(activeDist / totalDist, 0), 1);

    // 2. Sync the map marker via Esri ViewModel
    if (widget.viewModel) {
      try {
        widget.viewModel.hoveredChartPosition = progress;
      } catch (e) {}
    }

    // 3. Render Custom Needle & Tooltip Overlay on the Chart DOM
    const container = widget.container as HTMLElement;
    if (!container) return;

    const chartContainer = container.querySelector(".esri-elevation-profile__chart-container") as HTMLElement;
    if (!chartContainer) return;

    // Ensure chart container allows absolute positioning
    chartContainer.style.position = "relative";

    const profilePath = chartContainer.querySelector("path") as SVGPathElement;
    const chartRect = chartContainer.getBoundingClientRect();

    let targetPixelX = 0;
    let plotHeight = chartRect.height - 25; // Exclude bottom X-axis label space

    if (profilePath) {
      const pathRect = profilePath.getBoundingClientRect();
      targetPixelX = pathRect.left - chartRect.left + progress * pathRect.width;
      plotHeight = pathRect.height;
    } else {
      // Fallback: 45px left margin for Y-axis numbers, 15px right margin
      const leftMargin = 45;
      const plotWidth = Math.max(chartRect.width - leftMargin - 15, 10);
      targetPixelX = leftMargin + progress * plotWidth;
    }

    if (targetPixelX <= 0) return;

    // A. CREATE OR UPDATE NEEDLE (Vertical Line)
    let needle = chartContainer.querySelector("#mly-elevation-needle") as HTMLElement;
    if (!needle) {
      needle = document.createElement("div");
      needle.id = "mly-elevation-needle";
      Object.assign(needle.style, elevationIndicatorStyles.needle);
      chartContainer.appendChild(needle);
    }
    needle.style.left = `${targetPixelX}px`;
    needle.style.height = `${plotHeight + 8}px`;

    // B. CREATE OR UPDATE BADGE (Distance & Elevation Tag)
    let badge = chartContainer.querySelector("#mly-elevation-badge") as HTMLElement;
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "mly-elevation-badge";
      Object.assign(badge.style, elevationIndicatorStyles.badge);
      chartContainer.appendChild(badge);
    }
    badge.style.left = `${targetPixelX}px`;

    const alt = (sequenceImages[activeIndex] as any).alt;
    const elevText = alt ? ` · <span style="color:${elevationIndicatorStyles.altitudeColor};">${alt.toFixed(1)} m</span>` : "";

    badge.innerHTML = `${Math.round(activeDist)} m${elevText}`;
}
