import { TILE_URLS, STYLE_SOURCE_IDS, STYLE_LAYER_IDS } from '../../utils/constants';

/** SDK boundary used by the existing sequence-hover layer. */
export interface SequenceHighlightLayer {
  visible: boolean;
  style: any;
  loadStyle?: (style: any) => unknown;
  destroy(): void;
}
export interface SequenceHighlightView<L> {
  map: {
    layers: { includes(layer: L): boolean; indexOf(layer: L): number; length: number };
    add(layer: L, index: number): unknown;
    remove(layer: L): unknown;
  };
}

/** Owns the lazily-created vector highlight layer and last hovered sequence identity.
 * The line-only tile style stays beside its owner. No Graph requests or timers are added.
 * Identical hover IDs are ignored; mouseout hides the layer for reuse rather than rebuilding it.
 */
export class SequenceHoverHighlight<L extends SequenceHighlightLayer> {
  layer: L | null = null;
  private sequenceId: string | null = null;

  /** Preserve the existing coverage-relative insertion, hot style update and SDK fallback.
   * Token and view are supplied by the host at each call; source configuration stays host-owned.
   */
  update(sequenceId: string | null, view: SequenceHighlightView<L> | null | undefined,
    coverageLayer: L | null | undefined, accessToken: string,
    createLayer?: (properties: any) => L): void {
    // Guard clause: Prevent redundant WebGL updates if the hovered sequence hasn't changed.
    if (this.sequenceId === sequenceId) return;
    this.sequenceId = sequenceId;

    if (!view || !createLayer) return;

    // FAST CLEAR: If no sequence is provided (mouse off), simply hide the layer.
    // Bypassing layer destruction preserves the WebGL context and eliminates GC overhead.
    if (!sequenceId) {
      if (this.layer) {
        this.layer.visible = false;
      }
      return;
    }


    try {
      const vectorTileSourceUrl = `${TILE_URLS.COVERAGE}?access_token=${accessToken}`;

      // Define the Mapbox GL Style specification dynamically.
      const highlightStyle = {
        version: 8,
        sources: {
          [STYLE_SOURCE_IDS.MAPILLARY]: {
            type: "vector",
            tiles: [vectorTileSourceUrl],
            minzoom: 0,
            maxzoom: 14,
          },
        },
        layers: [
          {
            id: "sequence-highlight",
            source: STYLE_SOURCE_IDS.MAPILLARY,
            "source-layer": STYLE_LAYER_IDS.SEQUENCE,
            type: "line",
            filter: ["==", ["get", "id"], sequenceId], // Target the specific sequence
            paint: {
              "line-color": "#00ff88",
              "line-width": 6,
              "line-opacity": 1.0,
              // Override default ArcGIS fade animations to ensure
              // the highlight snaps instantly when jumping between points.
              "line-opacity-transition": { duration: 0 },
              "line-color-transition": { duration: 0 },
              "line-width-transition": { duration: 0 },
            },
          },
        ],
      };

      // LAZY INITIALIZATION: Create the layer only on the very first hover event.
      if (!this.layer) {
        this.layer = createLayer({
          style: highlightStyle,
          opacity: 1,
          id: "mapillary-sequence-highlight",
          listMode: "hide",
        });

        // Z-Index Management: Ensure the highlight sits visually above the base
        // coverage lines, but beneath interactive feature dots (Turbo/Objects).
        const turboIndex = coverageLayer ? view.map.layers.indexOf(coverageLayer) : view.map.layers.length;

        view.map.add(this.layer, Math.max(0, turboIndex));
      } else {
        // CONTEXT RECOVERY: If the view was swapped (e.g., transitioning between
        // 2D and 3D maps), the layer may have been detached. Reattach it safely.
        if (!view.map.layers.includes(this.layer)) {
          const turboIndex = coverageLayer ? view.map.layers.indexOf(coverageLayer) : view.map.layers.length;
          view.map.add(this.layer, Math.max(0, turboIndex));
        }

        // FAST UPDATE: Utilize `loadStyle()` to hot-swap the style object.
        // This updates the filter in the GPU immediately without tearing down the layer.
        if (typeof this.layer.loadStyle === "function") {
          this.layer.loadStyle(highlightStyle);
        } else {
          // Fallback for older ArcGIS JS API versions
          this.layer.style = highlightStyle;
        }

        // Ensure the layer is unhidden if it was previously cleared via the FAST CLEAR logic.
        this.layer.visible = true;
      }
    } catch (e) {
      console.warn("highlightSequenceOnVTL failed:", e);
    }
  }

  /** Existing widget teardown detaches without destroying; leave hover identity unchanged. */
  detach(view: SequenceHighlightView<L> | null | undefined): void {
    if (this.layer) { view?.map?.remove(this.layer); this.layer = null; }
  }

  /** Existing view-transfer policy removes if attached and best-effort destroys the SDK layer.
   * Reset hover identity so the same sequence can highlight in the replacement view.
   */
  reset(view: SequenceHighlightView<L>): void {
    if (this.layer) {
      try {
        const map = view.map;
        if (map && map.layers.includes(this.layer)) map.remove(this.layer);
        this.layer.destroy();
      } catch (error) {}
      this.layer = null;
    }
    this.sequenceId = null;
  }
}
