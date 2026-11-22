import { OutlineTag, PolygonGeometry, type TagComponent, type Viewer } from 'mapillary-js';
import { getDetectionColor } from '../../utils/mapillaryDetections';
import { detectionThumbnailBounds } from '../../utils/turboCoverageUtils';
import type { DetectionNoteSelection } from './detectionNote';
import type { DetectionLabelMode } from './detectionExploration';
import type { PanoramaDetectionLabels } from './PanoramaDetectionLabels';

/** Existing component hooks are retained so tag replacement/disable and viewer removal use the same cleanup. */
export type DetectionHoverComponent = Pick<TagComponent, 'removeAll' | 'add' | 'getTagIdsAt'> & {
  _refreshDetectionLabels?: () => void;
  _detectionHoverCleanup?: () => void;
};

/** Live viewer/draft capabilities; listener, timer and tag-update lifetime belongs to this feature binding. */
export interface DetectionHoverHost {
  container(): HTMLElement | null;
  viewer(): Pick<Viewer, 'on' | 'off'> | null;
  imageId(): string | null;
  value(tagId: string): string;
  targetId(): string | null;
  labelMode(): DetectionLabelMode;
  labels(): Pick<PanoramaDetectionLabels, 'setActive'> | null;
  showLabels(): boolean;
  detectionsActive(): boolean;
  cancelLocation(): void;
  mappedLocation(selection: DetectionNoteSelection): DetectionNoteSelection['location'];
  hasDraft(): boolean;
  drawPending(lon: number, lat: number): void;
  clearPending(): void;
  select(selection: DetectionNoteSelection | null): void;
}

/** Bind detection hover/click selection, label repaint and existing target flashing for one tag component.
 * Async hits retain revision/viewer/image guards. Component hooks and viewer removal release this binding's work.
 */
export function bindDetectionHover(tagComponent: DetectionHoverComponent, tags: OutlineTag[], host: DetectionHoverHost): void {

  if (!host.container()) return;

  const container = host.container()!;
  const detectionViewer = host.viewer();
  const detectionImageId = String(host.imageId());

  const tagConfigs = new Map<string, { text: string; color: number; bounds?: { x: number; y: number; width: number; height: number } }>();
  tags.forEach((tag) => {
    const detectionValue = host.value(tag.id);
    const labelFull = detectionValue
      .split("--")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "))
      .join(" ");
    const color = getDetectionColor(detectionValue) || 0x72b8dc;

    tagConfigs.set(tag.id, { text: labelFull, color, bounds: detectionThumbnailBounds((tag.geometry as PolygonGeometry).polygon) });
  });

  let currentHoveredId: string | null = null;
  let selectedId: string | null = null;
  let disposed = false;
  let hitRevision = 0;
  let updateTimeout: ReturnType<typeof setTimeout> | null = null;

  let flashState = true;
  let flashInterval: ReturnType<typeof setInterval> | null = null;

  /** Repaint emphasis and label visibility; flash ticks repaint even when hover identity is unchanged. */
  const updateTags = (hoveredId: string | null, isFlashUpdate: boolean = false) => {
    if (currentHoveredId === hoveredId && !isFlashUpdate) return;
    currentHoveredId = hoveredId;

    if (disposed) return;
    const activeIds = new Set([hoveredId, selectedId, host.targetId()].filter(Boolean) as string[]);
    const allLabels = host.labelMode() === 'all';
    host.labels()?.setActive(allLabels ? null : activeIds);
    tagComponent.removeAll();

    const updatedTags: OutlineTag[] = [];
    tags.forEach((tag) => {
      const config = tagConfigs.get(tag.id);
      if (!config) return;

      const isHovered = tag.id === hoveredId;
      const isTarget = tag.id === host.targetId();

      const shouldShowText = host.showLabels() && (allLabels || activeIds.has(tag.id));

      let lineColor = config.color;
      let fillColor = config.color;
      let fillOpacity = 0;
      let lineWidth = 1;

      // 1. Target Priority (Flashing Empty Box)
      if (isTarget) {
        lineColor = flashState ? 0xffff00 : 0xff3333; // Flash Yellow <-> Bright Red
        fillOpacity = 0.0; // Completely empty inside
        lineWidth = 4; // Thick border to show vertices clearly
      }
      // 2. Hover State (More solid fill)
      else if (isHovered || tag.id === selectedId) {
        fillOpacity = 0.15;
        lineWidth = 3;
      }

      try {
        const geometry = new PolygonGeometry((tag.geometry as PolygonGeometry).polygon);
        const newTag = new OutlineTag(tag.id, geometry, {
          text: shouldShowText ? config.text : "",
          textColor: isTarget ? 0xffff00 : 0xffffff,
          lineColor: lineColor,
          lineWidth: lineWidth,
          lineOpacity: isTarget || isHovered || tag.id === selectedId ? 1 : 0.65,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
        });
        updatedTags.push(newTag);
      } catch (err) {
        console.warn("Error updating tag", tag.id, err);
      }
    });

    if (updatedTags.length > 0) {
      tagComponent.add(updatedTags);
    }
  };

  (tagComponent as any)._refreshDetectionLabels = () => updateTags(currentHoveredId, true);

  // If a target exists, start the flashing animation loop
  if (host.targetId()) {
    flashInterval = setInterval(() => {
      flashState = !flashState; // Toggle flash color
      updateTags(currentHoveredId, true); // Force update tags
    }, 500); // Flashes every half second
  }

  /** Resolve a pointer hit without accepting an older query after a newer gesture. */
  const handleMouseMove = async (event: MouseEvent) => {
    if (!host.viewer()) return;

    const revision = ++hitRevision;
    try {
      const canvas = container.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pixelPoint = [event.clientX - rect.left, event.clientY - rect.top];

      const tagIds = await tagComponent.getTagIdsAt(pixelPoint);
      if (disposed || revision !== hitRevision) return;
      const hoveredTagId = tagIds.length > 0 ? tagIds[0] : null;

      if (updateTimeout) clearTimeout(updateTimeout);

      updateTimeout = setTimeout(() => {
        updateTags(hoveredTagId, false);
      }, 50);
    } catch (err) {
      if (disposed || revision !== hitRevision) return;
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => updateTags(null, false), 50);
    }
  };

  /** Retire queued pointer hits before removing hover emphasis. */
  const handleMouseLeave = () => {
    ++hitRevision;
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTags(null, false);
  };

  /** Select only for the captured viewer/image; update draft state without publishing a note. */
  const handleClick = async (event: MouseEvent) => {
    const revision = ++hitRevision;
    try {
      const canvas = container.querySelector('canvas'); if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ids = await tagComponent.getTagIdsAt([event.clientX - rect.left, event.clientY - rect.top]);
      if (disposed || revision !== hitRevision || host.viewer() !== detectionViewer || String(host.imageId()) !== detectionImageId || !host.detectionsActive()) return;
      selectedId = ids[0] || null;
      const config = selectedId ? tagConfigs.get(selectedId) : null;
      host.cancelLocation();
      const selection: DetectionNoteSelection | null = config && selectedId ? { imageId: detectionImageId, detectionId: selectedId, title: config.text, bounds: config.bounds } : null;
      if (selection) selection.location = host.mappedLocation(selection);
      if (!host.hasDraft()) {
        if (selection?.location) host.drawPending(selection.location.lon, selection.location.lat);
        else host.clearPending();
      }
      host.select(selection);
      updateTags(currentHoveredId, true);
    } catch { /* A failed pick leaves the existing selection intact. */ }
  };
  // Click includes touch taps; this listener never consumes viewer gestures.
  container.addEventListener('click', handleClick);
  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", handleMouseLeave);

  /** Release this binding's timers, listeners and refresh hook once. */
  const cleanup = () => {
    if (disposed) return;
    disposed = true; ++hitRevision;
    detectionViewer?.off?.('remove', cleanup);
    container.removeEventListener('click', handleClick);
    if (updateTimeout) clearTimeout(updateTimeout);
    if (flashInterval) clearInterval(flashInterval); // Kill the flashing interval
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", handleMouseLeave);
    delete (tagComponent as any)._refreshDetectionLabels;
    tagConfigs.clear();
  };
  (tagComponent as any)._detectionHoverCleanup = cleanup;
  detectionViewer?.on?.('remove', cleanup);

}
