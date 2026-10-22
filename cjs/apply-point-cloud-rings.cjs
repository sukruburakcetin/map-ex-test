#!/usr/bin/env node
'use strict';
/** Point-cloud rings installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 1",
          "before": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\nimport { PointCloudSight } from '../features/point-cloud/PointCloudSight';\n",
          "after": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\nimport { PointCloudSight } from '../features/point-cloud/PointCloudSight';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 2",
          "before": "  private _pointCloudExportBusy = false;\n  private _groundMode: boolean = false;\n  private _ringGeneration: number = 0; // Incremented on every ring redraw to cancel stale async draws\n  private _lasso: PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private measureLabelRef = React.createRef<HTMLDivElement>();\n",
          "after": "  private _pointCloudExportBusy = false;\n  private _groundMode: boolean = false;\n  private _lasso: PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private measureLabelRef = React.createRef<HTMLDivElement>();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 3",
          "before": "  private _sight: PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point> | null = null;\n  private _viewshed: PointCloudViewshed<__esri.ViewshedAnalysis, __esri.MapView | __esri.SceneView> | null = null;\n  private _gridLayer: __esri.GraphicsLayer | null = null;\n  private _gridLayerReady: Promise<void> | null = null;\n\n  // Nude Tool Variables\n",
          "after": "  private _sight: PointCloudSight<__esri.LineOfSightViewModel, __esri.MapView | __esri.SceneView, __esri.Point> | null = null;\n  private _viewshed: PointCloudViewshed<__esri.ViewshedAnalysis, __esri.MapView | __esri.SceneView> | null = null;\n  private _rings: PointCloudRings<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView, PointCloudResult> | null = null;\n\n  // Nude Tool Variables\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 4",
          "before": "    this._lasso?.clear();\n    this._measurement?.dispose();\n    this._pointCloudAcquisition.cancel('cleanup');\n    if (fullRemove) { this.clearPointCloud(true); this._pointCloudCache.clear(); }\n",
          "after": "    this._lasso?.clear();\n    this._measurement?.dispose();\n    this._rings?.clear();\n    this._pointCloudAcquisition.cancel('cleanup');\n    if (fullRemove) { this.clearPointCloud(true); this._pointCloudCache.clear(); }\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 5",
          "before": "      this.setState({ toastMessage: undefined });\n    }\n    const { jimuMapView } = this.state;\n    const ownerView = this._pointCloudMapLayer?.view || jimuMapView?.view;\n    this._pointCloudAdaptiveDisplay?.dispose();\n    this._debouncedNudgeRender?.cancel?.();\n",
          "after": "      this.setState({ toastMessage: undefined });\n    }\n    this._pointCloudAdaptiveDisplay?.dispose();\n    this._debouncedNudgeRender?.cancel?.();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 6",
          "before": "    }\n\n    // Lidar Grid Rings\n    if (this._gridLayer) {\n      const { jimuMapView } = this.state;\n      try {\n        ownerView?.map?.remove(this._gridLayer);\n        this._gridLayer.destroy();\n      } catch (e) {\n        // ignore if view already torn down\n      }\n      this._gridLayer = null;\n    }\n\n    this._gridLayerReady = null;\n\n    // Cancel any in-flight async ring-draw from before the clear\n    this._ringGeneration++;\n\n    // Calibration panel\n",
          "after": "    }\n\n    // Ring resources belong to their original map, independent of the feature layer.\n    this._rings?.clear();\n\n    // Calibration panel\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 7",
          "before": "  };\n\n  private async ensureGridLayer(): Promise<boolean> {\n    const view = this.state.jimuMapView?.view;\n    const result = this._pointCloudAcquisition.result;\n    if (!view?.map || view.destroyed || !result) return false;\n    if (this._gridLayer?.destroyed) this._gridLayer = null;\n    if (this._gridLayerReady) {\n      await this._gridLayerReady;\n      return !!this._gridLayer;\n    }\n\n    this._gridLayerReady = (async () => {\n      if (!this._gridLayer) {\n        const [GraphicsLayer] = await loadArcGISJSAPIModules([\"esri/layers/GraphicsLayer\"]);\n        if (this.state.jimuMapView?.view !== view || this._pointCloudAcquisition.result !== result || view.destroyed || !view.map) return;\n        if (!this._gridLayer) {\n          this._gridLayer = new GraphicsLayer({\n            id: \"pc-grid-layer\", title: \"Point Cloud Distance Rings\",\n            elevationInfo: { mode: \"relative-to-ground\", offset: 0.5 },\n          });\n        }\n      }\n      try {\n        if (this.state.jimuMapView?.view !== view || this._pointCloudAcquisition.result !== result || view.destroyed) return;\n        const map = view.map;\n        if (map && !map.layers.includes(this._gridLayer)) {\n          map.add(this._gridLayer);\n        }\n      } catch (e) {\n        // View mid-teardown, ignore\n      }\n    })();\n\n    await this._gridLayerReady;\n    this._gridLayerReady = null;\n    return !!this._gridLayer;\n  }\n\n  /**\n   * Draws concentric distance rings around the camera to provide spatial scale.\n   */\n  private async drawConcentricRings(currentRadius: number) {\n    if (!this.state.jimuMapView || !this.ArcGISModules) return;\n\n    const myGeneration = ++this._ringGeneration;\n    const layerReady = await this.ensureGridLayer();\n    if (!layerReady || myGeneration !== this._ringGeneration) return;\n\n    this._gridLayer.removeAll();\n\n    const { Graphic } = this.ArcGISModules;\n\n    const nudgeLat = this._nudgeY / 111320;\n    const nudgeLon = this._nudgeX / (111320 * Math.cos((this._cameraLat * Math.PI) / 180));\n    const centerLon = this._cameraLon + nudgeLon;\n    const centerLat = this._cameraLat + nudgeLat;\n    const mPerDegLat = 111320;\n    const mPerDegLon = 111320 * Math.cos((centerLat * Math.PI) / 180);\n\n    const halfWidth = this.state.pointCloudWidth;\n\n    const effectiveLength = currentRadius > 0 ? currentRadius : (this.state.pointCloudActualLength ?? 100);\n    const effectiveWidth = halfWidth > 0 ? halfWidth : (this.state.pointCloudActualWidth ?? 100);\n    const effectiveMax = Math.max(effectiveLength, effectiveWidth);\n\n    // Base step on the LARGER dimension so long corridors don't get flooded with rings.\n    // Then clamp to a minimum of 10m so we never draw rings every 5m.\n    const rawStep = effectiveMax / 6;\n    const niceSteps = [10, 25, 50, 100, 200, 500];\n    const step = Math.max(niceSteps.find((s) => s >= rawStep) ?? niceSteps[niceSteps.length - 1], 10);\n\n    const allIntervals = new Set<number>();\n    for (let r = step; r < effectiveMax; r += step) allIntervals.add(Math.round(r));\n    allIntervals.add(effectiveLength);\n    allIntervals.add(effectiveWidth);\n\n    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);\n\n    sortedIntervals.forEach((radius) => {\n      const isLengthBoundary = radius === effectiveLength;\n      const isWidthBoundary = radius === effectiveWidth;\n\n      const isBoundary = isLengthBoundary || isWidthBoundary;\n      const bearing = this.getStreetBearing();\n      const radB = (bearing * Math.PI) / 180;\n      const sinB = Math.sin(radB);\n      const cosB = Math.cos(radB);\n\n      const ringCoords: number[][] = [];\n\n      // Draw as a true ellipse scaled to the corridor proportions.\n      // Each ring's semi-axis = radius scaled by how far the corridor\n      // extends in that direction, capped at the corridor boundary.\n      const semiForward = Math.min(radius, effectiveLength);\n      const semiRight = Math.min(radius, effectiveWidth);\n\n      for (let i = 0; i <= 360; i += 3) {\n        const rad = (i * Math.PI) / 180;\n        const forward = semiForward * Math.cos(rad);\n        const right = semiRight * Math.sin(rad);\n\n        // Project back to lat/lon\n        const finalDx = right * cosB + forward * sinB;\n        const finalDy = -right * sinB + forward * cosB;\n\n        ringCoords.push([centerLon + finalDx / mPerDegLon, centerLat + finalDy / mPerDegLat, 0]);\n      }\n\n      // Draw as a closed loop (connecting end back to start)\n      const ringGraphic = new Graphic({\n        geometry: {\n          type: \"polyline\",\n          paths: [[...ringCoords, ringCoords[0]]],\n          hasZ: true,\n          spatialReference: { wkid: 4326 },\n        },\n        symbol: {\n          type: \"simple-line\",\n          color: isLengthBoundary\n            ? [255, 165, 0, 0.9] // orange for length\n            : isWidthBoundary\n              ? [255, 215, 0, 0.9] // gold for width\n              : [0, 255, 255, 0.4], // cyan for intermediate\n          width: isLengthBoundary || isWidthBoundary ? 3 : 1.5,\n          style: \"solid\",\n        } as any,\n      });\n      this._gridLayer!.add(ringGraphic);\n\n      // Place labels at the most Forward, Backward, Left and Right points\n      let bestFrontPt: number[] = ringCoords[0];\n      let bestBackPt: number[] = ringCoords[0];\n      let bestRightPt: number[] = ringCoords[0];\n      let bestLeftPt: number[] = ringCoords[0];\n      let maxFwd = -Infinity,\n        minFwd = Infinity;\n      let maxRgt = -Infinity,\n        minRgt = Infinity;\n\n      ringCoords.forEach((c: number[]) => {\n        const dy = (c[1] - centerLat) * 111320;\n        const dx = (c[0] - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180);\n        const fwd = dx * sinB + dy * cosB;\n        const rgt = dx * cosB - dy * sinB;\n\n        if (fwd > maxFwd) {\n          maxFwd = fwd;\n          bestFrontPt = c;\n        }\n        if (fwd < minFwd) {\n          minFwd = fwd;\n          bestBackPt = c;\n        }\n        if (rgt > maxRgt) {\n          maxRgt = rgt;\n          bestRightPt = c;\n        }\n        if (rgt < minRgt) {\n          minRgt = rgt;\n          bestLeftPt = c;\n        }\n      });\n\n      // Draw labels: length axis shows \"Xm\", width axis shows \"Xm\" in a different color\n      const drawLabel = (pt: number[], text: string, isWidth: boolean) => {\n        const label = new Graphic({\n          geometry: { type: \"point\", longitude: pt[0], latitude: pt[1], z: 0, hasZ: true, spatialReference: { wkid: 4326 } },\n          symbol: {\n            type: \"text\",\n            text,\n            color: isBoundary ? (isWidth ? [255, 200, 0, 1] : [255, 255, 255, 1]) : isWidth ? [255, 200, 0, 0.85] : [0, 255, 255, 0.9],\n            haloColor: [0, 0, 0, 0.8],\n            haloSize: 1.5,\n            font: { size: 10, weight: \"bold\" },\n          } as any,\n        });\n        this._gridLayer!.add(label);\n      };\n\n      const lengthLabel = `${Math.round(semiForward)}m`;\n      const widthLabel = `${Math.round(semiRight)}m`;\n\n      // Length axis labels (front + back): cyan / white\n      if (maxFwd - minFwd > 10) {\n        drawLabel(bestFrontPt, lengthLabel, false);\n        drawLabel(bestBackPt, lengthLabel, false);\n      } else {\n        drawLabel(bestFrontPt, lengthLabel, false);\n      }\n\n      // Width axis labels (left + right), yellow/amber\n      // Only show if the ellipse is meaningfully wider than it is tall\n      if (maxRgt - minRgt > 10 && Math.abs(semiRight - semiForward) > 5) {\n        drawLabel(bestRightPt, widthLabel, true);\n        drawLabel(bestLeftPt, widthLabel, true);\n      }\n    });\n  }\n\n  /**\n",
          "after": "  };\n\n  /** Bind the ring feature's live geometry and typed SDK factories once. */\n  private ensureRingsOwner() {\n    return this._rings ??= new PointCloudRings<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView, PointCloudResult>({\n      readContext: () => ({ view: this.state.jimuMapView?.view, result: this._pointCloudAcquisition.result, graphicsReady: !!this.ArcGISModules }),\n      readGeometry: () => ({ cameraLon: this._cameraLon, cameraLat: this._cameraLat, nudgeX: this._nudgeX, nudgeY: this._nudgeY,\n        halfWidth: this.state.pointCloudWidth, actualLength: this.state.pointCloudActualLength, actualWidth: this.state.pointCloudActualWidth }),\n      readBearing: () => this.getStreetBearing(),\n      loadFactory: async () => {\n        const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer']);\n        return properties => new GraphicsLayer(properties as __esri.GraphicsLayerProperties) as __esri.GraphicsLayer;\n      },\n      createGraphic: properties => new this.ArcGISModules.Graphic(properties as __esri.GraphicProperties),\n      warn: (...args) => console.warn(...args),\n    });\n  }\n\n  /** Forward the captured meter radius; the owner reads live dimensions after SDK readiness. */\n  private async drawConcentricRings(currentRadius: number) { await this.ensureRingsOwner().draw(currentRadius); }\n\n  /**\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud rings block 8",
          "before": "    this._pointCloudAcquisition.cancel('view-transfer');\n    this._pointCloudMapLayer?.invalidate();\n    if (this._gridLayer) { this._pointCloudMapLayer?.view?.map?.remove(this._gridLayer); this._gridLayer.destroy(); this._gridLayer = null; }\n    this._gridLayerReady = null; ++this._ringGeneration;\n\n    // Remove click / hover handlers from the previous active view\n",
          "after": "    this._pointCloudAcquisition.cancel('view-transfer');\n    this._pointCloudMapLayer?.invalidate();\n    this._rings?.onViewChange(view);\n\n    // Remove click / hover handlers from the previous active view\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudRings",
        "ensureRingsOwner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudRings",
          "count": 4
        },
        {
          "text": "ensureRingsOwner",
          "count": 2
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud rings block 1",
          "before": "| Line-of-sight model, pending activation and creating-view/map lifetime | `src/features/point-cloud/PointCloudSight.ts` |\n| Viewshed pending observer creation, fixed policy and original collection cleanup | `src/features/point-cloud/PointCloudViewshed.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n",
          "after": "| Line-of-sight model, pending activation and creating-view/map lifetime | `src/features/point-cloud/PointCloudSight.ts` |\n| Viewshed pending observer creation, fixed policy and original collection cleanup | `src/features/point-cloud/PointCloudViewshed.ts` |\n| Ring/grid layer, shared readiness, ellipse/label geometry and creating-map cleanup | `src/features/point-cloud/PointCloudRings.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud rings block 2",
          "before": "Logical IDs are `originalIndex + 1`; confirmed SDK ObjectIDs can differ. `objectIds()` returns finite confirmed IDs for supplied filtered viewer indices and omits unconfirmed entries. Preserve this distinction when modifying lasso, crop or hover behavior.\n\n`invalidate()` cancels future queued work during view transfer. `clear()` invalidates again safely, removes the layer from its original view, destroys it and clears indexes while retaining the pending queue barrier. Runtime continues to dispose adaptive watchers, preserve the original view for ring cleanup, cancel acquisition and detach the viewer in the existing order.\n\n`tests/pointCloudMapLayer.test.cjs` includes an immutable pre-extraction fixture. It compares geometry, schema, popup/renderer properties, SDK edit calls, assigned IDs, partial confirmations, errors and UI callback order, including 12,001-point chunking and supersession between chunks. The SDK adapter is also checked against ArcGIS 4.33.12 declarations during development. These tests use a recording SDK, not the live scene renderer.\n",
          "after": "Logical IDs are `originalIndex + 1`; confirmed SDK ObjectIDs can differ. `objectIds()` returns finite confirmed IDs for supplied filtered viewer indices and omits unconfirmed entries. Preserve this distinction when modifying lasso, crop or hover behavior.\n\n`invalidate()` cancels future queued work during view transfer. `clear()` invalidates again safely, removes the layer from its original view, destroys it and clears indexes while retaining the pending queue barrier. Runtime continues to dispose adaptive watchers, cancel acquisition and detach the viewer in the existing order. Rings now own their creating-map identity and independent cleanup through `PointCloudRings`.\n\n`tests/pointCloudMapLayer.test.cjs` includes an immutable pre-extraction fixture. It compares geometry, schema, popup/renderer properties, SDK edit calls, assigned IDs, partial confirmations, errors and UI callback order, including 12,001-point chunking and supersession between chunks. The SDK adapter is also checked against ArcGIS 4.33.12 declarations during development. These tests use a recording SDK, not the live scene renderer.\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud rings block 3",
          "before": "\n`tests/pointCloudViewshed.test.cjs` distinguishes normal policy/toggle comparisons from intentional destruction/race/error improvements. It executes the actual hit branch and SDK adapter with recording constructors/collections. Strict checks use ArcGIS 4.33.12; live host checks must still verify real SDK visibility and scene/terrain behavior.\n",
          "after": "\n`tests/pointCloudViewshed.test.cjs` distinguishes normal policy/toggle comparisons from intentional destruction/race/error improvements. It executes the actual hit branch and SDK adapter with recording constructors/collections. Strict checks use ArcGIS 4.33.12; live host checks must still verify real SDK visibility and scene/terrain behavior.\n\n## Ring / grid lifetime and drawing\n\n`PointCloudRings.ts` owns the layer, creating view/map, shared readiness promise, load revision and draw revision. Its runtime factory binds GraphicsLayer/Graphic constructors and live geometry/bearing readers. No raw ring-layer, ready-promise or generation mirrors remain in runtime. Ring geometry stays in this cohesive feature; point-cloud acquisition, feature edits and renderer policy remain separate.\n\nReadiness captures view, map and retained-result identity. Same-context requests share loading, while result/view/map replacement or clear rejects stale construction. Identity-aware promise cleanup cannot erase a newer task. Existing-layer readiness remains asynchronous; duplicate callers coalesce under the latest draw revision. Geometry is read after readiness, while the radius argument stays captured at the original caller. The bearing reader retains its per-radius placement in emission order.\n\nThe original layer properties, meter-to-degree/nudge conversion, interval selection, ellipse caps, sampling, closure, boundary/color priority and label policies are unchanged. Inputs are shifted WGS84 degrees plus east/north meter offsets; lengths/half-widths are meters. Ring z remains zero on a relative-to-ground layer at 0.5 m offset. There is no floor/source-altitude conversion or point-cloud copy.\n\nClear invalidates pending work before removing from the original map and attempting destruction independently. Cloud clear keeps its existing place in teardown; widget cleanup also clears pending/current rings. View changes release old resources directly, independently of the point-cloud feature-layer view. Current SDK/graphic failures are contained and retryable; stale load failures remain silent. These lifetime corrections are distinct from preserved numerical drawing policy.\n\n`tests/pointCloudRings.test.cjs` records exact old/new SDK properties, geometry, labels and operation order, including readiness/coalescing and post-load state reads. Separate cases cover stale work, context replacement, partial attachment, constructor changes and cleanup failures. The immutable map regression fixture retains its clear/order assertions through a test-only owner bridge. Strict checks use the actual ArcGIS 4.33.12 factory boundary; live terrain/scene rendering remains a host check.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudRings",
        "## Ring / grid lifetime and drawing"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudRings",
          "count": 3
        },
        {
          "text": "## Ring / grid lifetime and drawing",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud rings block 1",
          "before": "Validation: 15 viewshed cases plus the existing 133 geometry/acquisition/map/viewer/measurement/lasso/sight/playback cases (148 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover construction values/order, conditional exclusion, batched state, newest-click wins, clear/off/view/map/collection replacement, original-collection cleanup, failures/retry, partial attachment and constructor-side replacement. Host smoke checks still need real visibility results, repeated observer clicks, clear/toggle, other tools, 2D/3D and close/reopen.\n\nNext: extract ring/grid map-resource lifetime and its asynchronous readiness/generation contract. Keep distance/corridor drawing policy and original-view cleanup explicit. Renderer-policy extraction remains a separate later boundary; avoid combining unrelated controllers simply to reduce runtime line count.\n",
          "after": "Validation: 15 viewshed cases plus the existing 133 geometry/acquisition/map/viewer/measurement/lasso/sight/playback cases (148 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover construction values/order, conditional exclusion, batched state, newest-click wins, clear/off/view/map/collection replacement, original-collection cleanup, failures/retry, partial attachment and constructor-side replacement. Host smoke checks still need real visibility results, repeated observer clicks, clear/toggle, other tools, 2D/3D and close/reopen.\n\nRing/grid resource lifetime and its readiness/generation contract are completed below. Keep distance/corridor drawing policy and original-view cleanup explicit. Renderer-policy extraction remains a separate later boundary; avoid combining unrelated controllers simply to reduce runtime line count.\n\n## Distance-ring / grid feature owner\n\n`PointCloudRings.ts` now owns the GraphicsLayer, original view/map, shared readiness task, load/draw revisions and the existing ellipse/label drawing implementation. Runtime retains a typed lazy factory, live dimension/calibration/bearing readers and the existing draw call sites. Raw layer/readiness/generation fields are removed without mirrors; cleanup no longer derives the ring map from the feature-layer owner.\n\nNumerical drawing policy is preserved: shifted degrees with meter nudges, 111320/cosine conversion, actual-dimension fallbacks, nice intervals, per-radius bearing reads, 3-degree ellipse sampling/caps, closure, boundary colors, label extrema/thresholds and graphic order. Readiness remains asynchronous for existing layers and coalesces duplicate draws. Geometry reads stay after readiness, while the radius stays captured at the caller.\n\nIntentional lifetime corrections reject stale view/map/result/SDK loading, preserve newer pending-task identity, remove/destroy on the creating map, contain current SDK/graphic failures, retry after failure and invalidate pending widget teardown. There are no extra point traversals/copies, timers, watchers, point-cloud requests or animation loops. Function comments document authority, meter/degree/height units, async guards, cleanup and numerical policy.\n\nRuntime shrinks by 196 lines to 13,835. Another 288 method/callback bodies, including geometry callers, street-bearing policy and tool toggles, remain token-identical.\n\n| File | Change |\n| --- | --- |\n| `src/runtime/widget.tsx` | Typed ring factory, draw forwarding and original-resource cleanup/view hooks |\n| `src/features/point-cloud/PointCloudRings.ts` | Layer/readiness/draw lifetime and preserved ring/label geometry |\n| `src/features/point-cloud/README.md` | Ring feature entry point, contracts and verification |\n| `docs/POINT-CLOUD-OWNERSHIP.md` | Independent ring authority and deliberate lifetime corrections |\n| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |\n| `tests/pointCloudRings.test.cjs` | Exact baseline geometry/order comparisons and lifetime regressions |\n| `tests/fixtures/pointCloudRings.baseline.json` | Immutable pre-extraction readiness and drawing methods |\n| `tests/pointCloudMapLayer.test.cjs` | Test-only ring bridge; original teardown assertions retained |\n\nValidation: 16 ring cases plus the existing 148 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/playback cases (164 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover exact vertices/labels/colors, intervals/fallbacks, latitude/rotation/calibration, duplicate draws, shared readiness/live state, clear/replacement, errors/retry, constructor-side replacement and original-map cleanup. Host smoke checks still need terrain placement, crop/calibration, repeated clear/load, map switches and close/reopen.\n\nNext: move point-cloud map renderer/schema policy into a documented feature module while retaining geometry, confirmed-ID ownership and SDK edit order. Then review calibration/export coordination for a separate cohesive boundary. Prefer explicit contributor entry points over a generic catch-all controller.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudRings",
        "## Distance-ring / grid feature owner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudRings",
          "count": 2
        },
        {
          "text": "## Distance-ring / grid feature owner",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud rings block 1",
          "before": "| Line-of-sight SDK model, activation, observer/target mutation and teardown | `PointCloudSight.ts` |\n| Viewshed observer policy, pending click and original-analysis collection lifetime | `PointCloudViewshed.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n",
          "after": "| Line-of-sight SDK model, activation, observer/target mutation and teardown | `PointCloudSight.ts` |\n| Viewshed observer policy, pending click and original-analysis collection lifetime | `PointCloudViewshed.ts` |\n| Distance-ring layer/readiness, ellipse geometry and labels | `PointCloudRings.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud rings block 2",
          "before": "\nUse the existing Node/TypeScript setup. Tests execute the actual observer-hit branch and typed SDK factory, compare construction policy with the immutable baseline, and assert destruction separately as an intentional correction. Held module loads test newest-click behavior, clear/off/replacement, failures and retry. In Experience Builder check observer placement, repeated clicks, clear/toggle, other tools, 2D/3D and widget close/reopen with actual visibility results. Recorded SDK calls do not establish real scene/terrain occlusion or browser performance.\n",
          "after": "\nUse the existing Node/TypeScript setup. Tests execute the actual observer-hit branch and typed SDK factory, compare construction policy with the immutable baseline, and assert destruction separately as an intentional correction. Held module loads test newest-click behavior, clear/off/replacement, failures and retry. In Experience Builder check observer placement, repeated clicks, clear/toggle, other tools, 2D/3D and widget close/reopen with actual visibility results. Recorded SDK calls do not establish real scene/terrain occlusion or browser performance.\n\n## Distance rings / grid\n\n`PointCloudRings.ts` owns the GraphicsLayer, creating view/map, shared SDK readiness task, load revision and latest-draw revision. It also contains the existing ellipse/label drawing policy so contributors can find the whole distance-ring behavior in one feature. Runtime retains radius/dimension/calibration intent and forwards the existing draw calls.\n\n- `draw(radiusMeters)` keeps the caller's captured half-length and reads live geometry after asynchronous readiness. Same-context first draws share loading; only the newest draw commits. Existing-layer redraw remains asynchronous so duplicate caller draws coalesce.\n- `onViewChange(nextView)` invalidates/releases attached or pending resources belonging to another view/map. The normal map/cloud restoration paths retain their existing drawing calls.\n- `clear()` invalidates pending work before removing from the original map and destroying the layer. Repeated clear is safe. Widget teardown clears even pending creation; ring cleanup no longer guesses its map from the point-cloud feature layer.\n\n`RingGeometryInput` documents shifted WGS84 degrees, east/north meter nudges, meter half-width and actual-extent fallbacks. The original 111320 meters/degree and latitude-cosine conversions remain unchanged. Rings stay at z=0 on the relative-to-ground layer with 0.5 m offset. Bearing is read at the same point once per radius. Nice steps, 3-degree sampling, ellipse caps, boundary color priority, closure, label extrema/thresholds and emitted graphic order are unchanged.\n\nIntentional lifetime corrections are captured-map cleanup, view/map/result/SDK guards around loading, newest-request rejection, pending-task identity checks, destruction after partial attachment and contained retryable SDK/draw failures. No point-cloud traversal/copy, timer, watcher or new animation loop is added. The existing clear order in the runtime is preserved.\n\n```sh\nnode tests/pointCloudRings.test.cjs\n```\n\nUse the existing Node/TypeScript setup. Tests compare exact old/new layer properties, graphic/vertex/label values, bearing reads, readiness/coalescing and live-state read timing. Held module loads cover clear, context replacement, failures/retry and cleanup. The map test uses a test-only bridge for its original ring fixture; its original teardown assertions remain intact, while the ring suite exercises the real owner. In Experience Builder check initial cloud load, crop controls, calibration, long/narrow/full dimensions, repeated clear/load, map switches and widget close/reopen. Recordings cannot establish actual terrain placement or browser frame rate.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudRings",
        "## Distance rings / grid"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudRings",
          "count": 2
        },
        {
          "text": "## Distance rings / grid",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/pointCloudMapLayer.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudMapLayer.test.cjs point-cloud rings block 1",
          "before": " w._pointCloudLayer=null;w._pointCloudLayerView=null;w._pointCloudLayerResult=null;w._pointCloudRenderRequest=0;w._pointCloudMapUpdating=false;w._pointCloudEditTask=Promise.resolve();w._pointCloudFeatures=new Map();w._pointCloudIndexByOriginal=new Map();w._pointCloudViewerObjectIds=[];w._pointCloudMapLayer=null;\n w.setState=(p,callback)=>{Object.assign(w.state,p);callback?.();trace.push(['state',copy(p)])};w.updatePointCloudDisplay=()=>trace.push(['adaptive']);w.drawConcentricRings=n=>trace.push(['rings',n]);w.calculateLassoSelection=()=>trace.push(['lasso']);w.highlightLassoInArcGIS=()=>trace.push(['highlightLasso']);w.showToast=(...args)=>trace.push(['toast',...args]);w._pointCloudRequest=0;w._pointCloudAdaptiveDisplay={dispose:()=>trace.push(['disposeAdaptive'])};w.removeViewerPointCloudRenderer=()=>trace.push(['detachViewer']);\n h={kind,w,trace,layers,calls,views,view,render:silent=>w.renderPointCloudMapLayer(silent),pending:()=>kind==='working'?w._pointCloudMapLayer?.pending:w._pointCloudEditTask,busy:()=>kind==='working'?!!w._pointCloudMapLayer?.updating:w._pointCloudMapUpdating,layer:()=>kind==='working'?w._pointCloudMapLayer?.layer:w._pointCloudLayer,invalidate:()=>{if(kind==='working')w._pointCloudMapLayer?.invalidate();else ++w._pointCloudRenderRequest},clear:()=>{if(kind==='working')w._pointCloudMapLayer?.clear();else{++w._pointCloudRenderRequest;if(w._pointCloudLayer){w._pointCloudLayerView?.map?.remove(w._pointCloudLayer);w._pointCloudLayer.destroy();w._pointCloudLayer=null}w._pointCloudFeatures.clear();w._pointCloudIndexByOriginal.clear();w._pointCloudViewerObjectIds=[];w._pointCloudMapUpdating=false;w._pointCloudLayerResult=null;w._pointCloudLayerView=null}}};return h;\n}\n",
          "after": " w._pointCloudLayer=null;w._pointCloudLayerView=null;w._pointCloudLayerResult=null;w._pointCloudRenderRequest=0;w._pointCloudMapUpdating=false;w._pointCloudEditTask=Promise.resolve();w._pointCloudFeatures=new Map();w._pointCloudIndexByOriginal=new Map();w._pointCloudViewerObjectIds=[];w._pointCloudMapLayer=null;\n w.setState=(p,callback)=>{Object.assign(w.state,p);callback?.();trace.push(['state',copy(p)])};w.updatePointCloudDisplay=()=>trace.push(['adaptive']);w.drawConcentricRings=n=>trace.push(['rings',n]);w.calculateLassoSelection=()=>trace.push(['lasso']);w.highlightLassoInArcGIS=()=>trace.push(['highlightLasso']);w.showToast=(...args)=>trace.push(['toast',...args]);w._pointCloudRequest=0;w._pointCloudAdaptiveDisplay={dispose:()=>trace.push(['disposeAdaptive'])};w.removeViewerPointCloudRenderer=()=>trace.push(['detachViewer']);\n // Test-only bridge for the original ring fixture: keep its teardown assertions\n // while the current runtime delegates to the independently tested ring owner.\n w._rings={layer:null,map:views[0].map,clear(){const layer=this.layer;this.layer=null;if(layer){this.map.remove(layer);layer.destroy()}}};\n Object.defineProperty(w,'_gridLayer',{get(){return this._rings.layer},set(layer){this._rings.layer=layer}});\n h={kind,w,trace,layers,calls,views,view,render:silent=>w.renderPointCloudMapLayer(silent),pending:()=>kind==='working'?w._pointCloudMapLayer?.pending:w._pointCloudEditTask,busy:()=>kind==='working'?!!w._pointCloudMapLayer?.updating:w._pointCloudMapUpdating,layer:()=>kind==='working'?w._pointCloudMapLayer?.layer:w._pointCloudLayer,invalidate:()=>{if(kind==='working')w._pointCloudMapLayer?.invalidate();else ++w._pointCloudRenderRequest},clear:()=>{if(kind==='working')w._pointCloudMapLayer?.clear();else{++w._pointCloudRenderRequest;if(w._pointCloudLayer){w._pointCloudLayerView?.map?.remove(w._pointCloudLayer);w._pointCloudLayer.destroy();w._pointCloudLayer=null}w._pointCloudFeatures.clear();w._pointCloudIndexByOriginal.clear();w._pointCloudViewerObjectIds=[];w._pointCloudMapUpdating=false;w._pointCloudLayerResult=null;w._pointCloudLayerView=null}}};return h;\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "w._rings={layer:null"
      ],
      "requiredOccurrences": [
        {
          "text": "w._rings={layer:null",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudRings.ts",
      "content": "export interface RingGeometryInput {\n  /** Shifted WGS84 degrees, before east/north calibration. */\n  cameraLon: number; cameraLat: number;\n  /** Calibration offsets in meters; ring z remains zero on its relative-to-ground layer. */\n  nudgeX: number; nudgeY: number;\n  /** Meter half-width; nonpositive selects the actual-width fallback. */\n  halfWidth: number;\n  actualLength: number | null | undefined;\n  actualWidth: number | null | undefined;\n}\nexport interface RingLayer<G> { destroyed?: boolean; add(graphic: G): unknown; removeAll(): void; destroy(): void; }\nexport interface RingMap<L> { layers: { includes(layer: L): boolean }; add(layer: L): unknown; remove(layer: L): unknown; }\nexport interface RingView<L> { destroyed?: boolean; map?: RingMap<L> | null; }\nexport interface PointCloudRingsDependencies<G, L, V, R> {\n  readContext(): { view: V | null | undefined; result: R | null; graphicsReady: boolean };\n  readGeometry(): RingGeometryInput;\n  /** Read once per radius, at the same point in graphic emission as the original draw. */\n  readBearing(): number;\n  loadFactory(): Promise<(properties: Record<string, unknown>) => L>;\n  createGraphic(properties: Record<string, unknown>): G;\n  warn(...args: unknown[]): void;\n}\n\n/** Owns distance-ring layer/view/map, shared loading and newest-draw generations.\n * Geometry stays with this feature; the runtime supplies live dimensions/calibration.\n * No point-cloud copy, independent timer, watcher or animation loop is introduced.\n */\nexport class PointCloudRings<G, L extends RingLayer<G>, V extends RingView<L>, R> {\n  private layer: L | null = null;\n  private view: V | null = null;\n  private map: RingMap<L> | null = null;\n  private revision = 0;\n  private drawRevision = 0;\n  private pending: { view: V; map: RingMap<L>; result: R; promise: Promise<L | null> } | null = null;\n  /** Bind live state/SDK readers lazily, without loading modules or drawing. */\n  constructor(private readonly dependencies: PointCloudRingsDependencies<G, L, V, R>) {}\n\n  /** Invalidate old work before removing from the original map and destroying the layer. */\n  clear(): void {\n    ++this.revision; ++this.drawRevision; this.pending = null;\n    const layer = this.layer, map = this.map;\n    this.layer = null; this.view = null; this.map = null;\n    if (!layer) return;\n    try { map?.remove(layer); } catch (error) { this.dependencies.warn('Could not remove point-cloud rings:', error); }\n    try { layer.destroy(); } catch (error) { this.dependencies.warn('Could not destroy point-cloud rings:', error); }\n  }\n\n  /** Release an attached/pending layer when its creating view or map is replaced. */\n  onViewChange(view: V): void {\n    if ((this.view && (this.view !== view || this.map !== view.map)) || (this.pending && (this.pending.view !== view || this.pending.map !== view.map))) this.clear();\n  }\n\n  /** Share same-context readiness; stale constructor loads never attach to another map.\n   * Keep readiness asynchronous for existing layers too, so repeated caller redraws coalesce.\n   */\n  private async ensureLayer(view: V, map: RingMap<L>, result: R): Promise<L | null> {\n    if (this.pending?.view === view && this.pending.map === map && this.pending.result === result) return await this.pending.promise;\n    const revision = this.revision;\n    const current = () => {\n      const live = this.dependencies.readContext();\n      return revision === this.revision && live.graphicsReady && live.view === view && live.result === result && !view.destroyed && view.map === map;\n    };\n    const promise = (async () => {\n      let created: L | null = null;\n      try {\n        if (!this.layer) {\n          const factory = await this.dependencies.loadFactory();\n          if (!current()) return null;\n          created = factory({ id: 'pc-grid-layer', title: 'Point Cloud Distance Rings', elevationInfo: { mode: 'relative-to-ground', offset: 0.5 } });\n          if (!current()) { created.destroy(); return null; }\n          this.layer = created; this.view = view; this.map = map;\n        }\n        if (!current()) return null;\n        const layer = this.layer;\n        if (layer && !map.layers.includes(layer)) map.add(layer);\n        return layer;\n      } catch (error) {\n        const report = current();\n        if (created && this.layer === created) this.clear();\n        if (report) this.dependencies.warn('Could not prepare point-cloud rings:', error);\n        return null;\n      }\n    })();\n    const pending = { view, map, result, promise }; this.pending = pending;\n    try { return await promise; } finally { if (this.pending === pending) this.pending = null; }\n  }\n\n  /** Draw only the newest request using live geometry after layer readiness.\n   * Radius is the caller's captured meter half-length; nonpositive uses actual length.\n   * The original interval, ellipse, nudge, boundary-color and label policies are retained.\n   */\n  async draw(currentRadius: number): Promise<void> {\n    const { view, result, graphicsReady } = this.dependencies.readContext();\n    if (!view || !graphicsReady) return;\n    this.onViewChange(view);\n    if (this.layer?.destroyed || (this.pending && this.pending.result !== result)) this.clear();\n    const drawRevision = ++this.drawRevision;\n    if (!view.map || view.destroyed || !result) return;\n    const map = view.map;\n    const layer = await this.ensureLayer(view, map, result);\n    const live = this.dependencies.readContext();\n    if (!layer || !live.graphicsReady || drawRevision !== this.drawRevision || live.view !== view || live.result !== result || view.destroyed || view.map !== map) return;\n    try { layer.removeAll(); this.drawGeometry(layer, currentRadius); }\n    catch (error) { this.dependencies.warn('Could not draw point-cloud rings:', error); }\n  }\n\n  /** Emit the existing ring and label graphics in order, using WGS84 degree positions.\n   * Meter-to-degree conversion remains 111320 with latitude cosine. Bearing is clockwise\n   * from north; z=0 and layer offset 0.5 m retain the existing map-relative height policy.\n   */\n  private drawGeometry(layer: L, currentRadius: number): void {\n    const geometry = this.dependencies.readGeometry();\n\n    const nudgeLat = geometry.nudgeY / 111320;\n    const nudgeLon = geometry.nudgeX / (111320 * Math.cos((geometry.cameraLat * Math.PI) / 180));\n    const centerLon = geometry.cameraLon + nudgeLon;\n    const centerLat = geometry.cameraLat + nudgeLat;\n    const mPerDegLat = 111320;\n    const mPerDegLon = 111320 * Math.cos((centerLat * Math.PI) / 180);\n\n    const halfWidth = geometry.halfWidth;\n\n    const effectiveLength = currentRadius > 0 ? currentRadius : (geometry.actualLength ?? 100);\n    const effectiveWidth = halfWidth > 0 ? halfWidth : (geometry.actualWidth ?? 100);\n    const effectiveMax = Math.max(effectiveLength, effectiveWidth);\n\n    // Base step on the LARGER dimension so long corridors don't get flooded with rings.\n    // Then clamp to a minimum of 10m so we never draw rings every 5m.\n    const rawStep = effectiveMax / 6;\n    const niceSteps = [10, 25, 50, 100, 200, 500];\n    const step = Math.max(niceSteps.find((s) => s >= rawStep) ?? niceSteps[niceSteps.length - 1], 10);\n\n    const allIntervals = new Set<number>();\n    for (let r = step; r < effectiveMax; r += step) allIntervals.add(Math.round(r));\n    allIntervals.add(effectiveLength);\n    allIntervals.add(effectiveWidth);\n\n    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);\n\n    sortedIntervals.forEach((radius) => {\n      const isLengthBoundary = radius === effectiveLength;\n      const isWidthBoundary = radius === effectiveWidth;\n\n      const isBoundary = isLengthBoundary || isWidthBoundary;\n      const bearing = this.dependencies.readBearing();\n      const radB = (bearing * Math.PI) / 180;\n      const sinB = Math.sin(radB);\n      const cosB = Math.cos(radB);\n\n      const ringCoords: number[][] = [];\n\n      // Draw as a true ellipse scaled to the corridor proportions.\n      // Each ring's semi-axis = radius scaled by how far the corridor\n      // extends in that direction, capped at the corridor boundary.\n      const semiForward = Math.min(radius, effectiveLength);\n      const semiRight = Math.min(radius, effectiveWidth);\n\n      for (let i = 0; i <= 360; i += 3) {\n        const rad = (i * Math.PI) / 180;\n        const forward = semiForward * Math.cos(rad);\n        const right = semiRight * Math.sin(rad);\n\n        // Project back to lat/lon\n        const finalDx = right * cosB + forward * sinB;\n        const finalDy = -right * sinB + forward * cosB;\n\n        ringCoords.push([centerLon + finalDx / mPerDegLon, centerLat + finalDy / mPerDegLat, 0]);\n      }\n\n      // Draw as a closed loop (connecting end back to start)\n      const ringGraphic = this.dependencies.createGraphic({\n        geometry: {\n          type: \"polyline\",\n          paths: [[...ringCoords, ringCoords[0]]],\n          hasZ: true,\n          spatialReference: { wkid: 4326 },\n        },\n        symbol: {\n          type: \"simple-line\",\n          color: isLengthBoundary\n            ? [255, 165, 0, 0.9] // orange for length\n            : isWidthBoundary\n              ? [255, 215, 0, 0.9] // gold for width\n              : [0, 255, 255, 0.4], // cyan for intermediate\n          width: isLengthBoundary || isWidthBoundary ? 3 : 1.5,\n          style: \"solid\",\n        },\n      });\n      layer.add(ringGraphic);\n\n      // Place labels at the most Forward, Backward, Left and Right points\n      let bestFrontPt: number[] = ringCoords[0];\n      let bestBackPt: number[] = ringCoords[0];\n      let bestRightPt: number[] = ringCoords[0];\n      let bestLeftPt: number[] = ringCoords[0];\n      let maxFwd = -Infinity,\n        minFwd = Infinity;\n      let maxRgt = -Infinity,\n        minRgt = Infinity;\n\n      ringCoords.forEach((c: number[]) => {\n        const dy = (c[1] - centerLat) * 111320;\n        const dx = (c[0] - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180);\n        const fwd = dx * sinB + dy * cosB;\n        const rgt = dx * cosB - dy * sinB;\n\n        if (fwd > maxFwd) {\n          maxFwd = fwd;\n          bestFrontPt = c;\n        }\n        if (fwd < minFwd) {\n          minFwd = fwd;\n          bestBackPt = c;\n        }\n        if (rgt > maxRgt) {\n          maxRgt = rgt;\n          bestRightPt = c;\n        }\n        if (rgt < minRgt) {\n          minRgt = rgt;\n          bestLeftPt = c;\n        }\n      });\n\n      // Draw labels: length axis shows \"Xm\", width axis shows \"Xm\" in a different color\n      const drawLabel = (pt: number[], text: string, isWidth: boolean) => {\n        const label = this.dependencies.createGraphic({\n          geometry: { type: \"point\", longitude: pt[0], latitude: pt[1], z: 0, hasZ: true, spatialReference: { wkid: 4326 } },\n          symbol: {\n            type: \"text\",\n            text,\n            color: isBoundary ? (isWidth ? [255, 200, 0, 1] : [255, 255, 255, 1]) : isWidth ? [255, 200, 0, 0.85] : [0, 255, 255, 0.9],\n            haloColor: [0, 0, 0, 0.8],\n            haloSize: 1.5,\n            font: { size: 10, weight: \"bold\" },\n          },\n        });\n        layer.add(label);\n      };\n\n      const lengthLabel = `${Math.round(semiForward)}m`;\n      const widthLabel = `${Math.round(semiRight)}m`;\n\n      // Length axis labels (front + back): cyan / white\n      if (maxFwd - minFwd > 10) {\n        drawLabel(bestFrontPt, lengthLabel, false);\n        drawLabel(bestBackPt, lengthLabel, false);\n      } else {\n        drawLabel(bestFrontPt, lengthLabel, false);\n      }\n\n      // Width axis labels (left + right), yellow/amber\n      // Only show if the ellipse is meaningfully wider than it is tall\n      if (maxRgt - minRgt > 10 && Math.abs(semiRight - semiForward) > 5) {\n        drawLabel(bestRightPt, widthLabel, true);\n        drawLabel(bestLeftPt, widthLabel, true);\n      }\n    });\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudRings.test.cjs",
      "content": "/** Compare actual runtime ring adapter/owner with the original loader and drawing method.\n * Exact graphics/ordering are recorded; held module promises control lifetime races.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudRings.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudRings.ts','utf8')))(m,m.exports);const {PointCloudRings}=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return (kind==='baseline'?['ensureGridLayer','drawConcentricRings']:['ensureRingsOwner','drawConcentricRings']).map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudRings','loadArcGISJSAPIModules','console',compile('class Harness{'+methods(kind)+'};return Harness;'));\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}},flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve()};\nfunction setup(kind,{hold=false,state={}}={}){\n const trace=[],layers=[],views=[],loads=[],warnings=[];let throwGraphic=false;\n class Graphic{constructor(properties){if(throwGraphic)throw Error('graphic failed');Object.assign(this,properties)}}\n class Layer{constructor(properties){Object.assign(this,properties);this.idNumber=layers.length;this.graphics=[];layers.push(this);trace.push(['create',structuredClone(properties)])}add(g){this.graphics.push(g);trace.push(['graphic',structuredClone(g)])}removeAll(){this.graphics=[];trace.push(['removeAll',this.idNumber])}destroy(){this.destroyed=true;trace.push(['destroy',this.idNumber])}}\n const load=names=>{trace.push(['load',names]);const d=deferred();loads.push(d);if(!hold)d.resolve([Layer]);return d.promise};const Harness=classes[kind](PointCloudRings,load,{warn:(...args)=>warnings.push(args.map(x=>x instanceof Error?x.message:x))});const w=new Harness();\n function view(){const v={destroyed:false};const items=[];v.map={layers:{includes:layer=>items.includes(layer)},add(layer){items.push(layer);trace.push(['add',views.indexOf(v),layer.idNumber])},remove(layer){const i=items.indexOf(layer);if(i>=0)items.splice(i,1);trace.push(['remove',views.indexOf(v),layer.idNumber])}};views.push(v);return v}\n w.state={jimuMapView:{view:view()},pointCloudWidth:20,pointCloudActualLength:100,pointCloudActualWidth:30,...state};w._pointCloudAcquisition={result:{imageId:'A'}};w.ArcGISModules={Graphic};w._cameraLon=10;w._cameraLat=20;w._nudgeX=1.2;w._nudgeY=-2.3;w.bearing=30;w._gridLayer=null;w._gridLayerReady=null;w._ringGeneration=0;w._rings=null;w.getStreetBearing=()=>{trace.push(['bearing',w.bearing]);return w.bearing};\n return{kind,w,trace,layers,views,loads,warnings,view,Layer,draw:radius=>w.drawConcentricRings(radius),owner:()=>w.ensureRingsOwner(),setGraphicFailure:value=>{throwGraphic=value}};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.warnings,a.warnings);assert.deepEqual(b.layers.map(l=>l.graphics.map(g=>structuredClone(g))),a.layers.map(l=>l.graphics.map(g=>structuredClone(g))));return{a,b}}\ntest('layer properties, ellipse vertices, graphic/label values and bearing reads match baseline exactly',async()=>{await compare(async h=>{await h.draw(100);assert.equal(h.layers.length,1);assert(h.layers[0].graphics.some(g=>g.symbol.type==='text'));assert(h.layers[0].graphics.filter(g=>g.geometry.type==='polyline').every(g=>g.geometry.paths[0].length===122))})});\ntest('dimensions, interval steps and boundary/label colors match across narrow, equal and large corridors',async()=>{for(const [length,width]of [[5,5],[20,20],[100,25],[25,100],[1000,30],[5000,5000],[0,0]])await compare(async h=>{await h.draw(length);assert(h.layers[0].graphics.every(g=>g.geometry.spatialReference.wkid===4326))},{state:{pointCloudWidth:width}})});\ntest('nonpositive dimensions use actual extents; nullish extents keep 100-meter fallback',async()=>{for(const extents of [[123,47],[0,0],[null,undefined]])await compare(async h=>{await h.draw(0)},{state:{pointCloudWidth:0,pointCloudActualLength:extents[0],pointCloudActualWidth:extents[1]}})});\ntest('negative/positive coordinates, rotated bearing and calibration retain exact label/vertex precision',async()=>{for(const latitude of [-75,0,67,85])for(const bearing of [0,90,180,359.9])await compare(async h=>{h.w._cameraLat=latitude;h.w._cameraLon=-170;h.w._nudgeX=-4.2;h.w._nudgeY=3.1;h.w.bearing=bearing;await h.draw(60)})});\ntest('existing layer reuses readiness and remains asynchronous while newest duplicate draw wins',async()=>{await compare(async h=>{await h.draw(100);const before=h.trace.filter(x=>x[0]==='removeAll').length;const a=h.draw(50),b=h.draw(75);assert.equal(h.trace.filter(x=>x[0]==='removeAll').length,before);await Promise.all([a,b]);assert.equal(h.layers.length,1);assert.equal(h.trace.filter(x=>x[0]==='removeAll').length,before+1)})});\ntest('concurrent first draws share loading and use latest dimensions/bearing after readiness',async()=>{await compare(async h=>{const a=h.draw(100),b=h.draw(200);assert.equal(h.loads.length,1);h.w._cameraLon=12;h.w.state.pointCloudWidth=40;h.w.bearing=90;h.loads[0].resolve([h.Layer]);await Promise.all([a,b]);assert.equal(h.layers.length,1);assert.equal(h.trace.filter(x=>x[0]==='removeAll').length,1)},{hold:true})});\ntest('missing view, cloud or SDK readiness does not load or draw rings',async()=>{for(const missing of ['view','result','sdk','map','destroyed'])await compare(async h=>{if(missing==='view')h.w.state.jimuMapView=null;if(missing==='result')h.w._pointCloudAcquisition.result=null;if(missing==='sdk')h.w.ArcGISModules=null;if(missing==='map')h.w.state.jimuMapView.view.map=null;if(missing==='destroyed')h.w.state.jimuMapView.view.destroyed=true;await h.draw(100);assert.equal(h.loads.length,0)})});\ntest('clear during loading prevents layer construction and stale drawing',async()=>{const h=setup('working',{hold:true}),p=h.draw(100);h.owner().clear();h.loads[0].resolve([h.Layer]);await p;assert.equal(h.layers.length,0)});\ntest('view/map/result/SDK changes during loading reject old construction before attachment',async()=>{for(const change of ['view','map','result','sdk','destroyed']){const h=setup('working',{hold:true}),p=h.draw(100);if(change==='view')h.w.state.jimuMapView={view:h.view()};if(change==='map')h.w.state.jimuMapView.view.map=h.view().map;if(change==='result')h.w._pointCloudAcquisition.result={imageId:'B'};if(change==='sdk')h.w.ArcGISModules=null;if(change==='destroyed')h.w.state.jimuMapView.view.destroyed=true;h.loads[0].resolve([h.Layer]);await p;assert.equal(h.layers.length,0)}});\ntest('clear removes/destroys on the original map after host reference replacement, once',async()=>{const h=setup('working');await h.draw(100);h.w.state.jimuMapView={view:h.view()};h.owner().clear();h.owner().clear();assert(h.layers[0].destroyed);assert(h.trace.some(x=>x[0]==='remove'&&x[1]===0));assert(!h.trace.some(x=>x[0]==='remove'&&x[1]===1));assert.equal(h.trace.filter(x=>x[0]==='destroy').length,1)});\ntest('new view/result load survives older pending completion and attaches only its current layer',async()=>{for(const change of ['view','result']){const h=setup('working',{hold:true}),old=h.draw(100);if(change==='view'){const v=h.view();h.owner().onViewChange(v);h.w.state.jimuMapView={view:v}}else h.w._pointCloudAcquisition.result={imageId:'B'};const next=h.draw(200);assert.equal(h.loads.length,2);h.loads[0].resolve([h.Layer]);await old;h.loads[1].resolve([h.Layer]);await next;assert.equal(h.layers.length,1);assert.equal(h.trace.filter(x=>x[0]==='removeAll').length,1)}});\ntest('module rejection is contained/retryable and stale rejection after clear remains silent',async()=>{for(const stale of [false,true]){const h=setup('working',{hold:true}),p=h.draw(100);if(stale)h.owner().clear();h.loads[0].reject(Error('SDK load failed'));await p;assert.equal(h.warnings.length,stale?0:1);const next=h.draw(100);h.loads[1].resolve([h.Layer]);await next;assert.equal(h.layers.length,1)}});\ntest('partial attachment failure removes/destroys new layer; subsequent draw retries',async()=>{const h=setup('working'),map=h.views[0].map,add=map.add;map.add=function(layer){add.call(this,layer);throw Error('map add failed')};await h.draw(100);assert(h.layers[0].destroyed);assert.equal(h.warnings.length,1);map.add=add;await h.draw(100);assert(h.layers[1].graphics.length>0)});\ntest('failed removal does not skip destruction or break reusable clear',async()=>{const h=setup('working');await h.draw(100);h.views[0].map.remove=()=>{throw Error('view disposed')};h.owner().clear();h.owner().clear();assert(h.layers[0].destroyed);assert.equal(h.warnings.length,1)});\ntest('externally destroyed layer and temporarily failing graphic factory recover on subsequent draw',async()=>{const h=setup('working');await h.draw(100);h.layers[0].destroyed=true;await h.draw(80);assert.equal(h.layers.length,2);h.setGraphicFailure(true);await h.draw(60);assert.equal(h.warnings.length,1);h.setGraphicFailure(false);await h.draw(40);assert(h.layers[1].graphics.length>0)});\ntest('constructor failure retries and constructor-triggered replacement destroys detached layer',async()=>{for(const mode of ['throw','switch']){const h=setup('working',{hold:true}),p=h.draw(100);class Layer extends h.Layer{constructor(properties){if(mode==='throw')throw Error('constructor failed');super(properties);h.w.state.jimuMapView={view:h.view()}}}h.loads[0].resolve([Layer]);await p;if(mode==='switch'){assert(h.layers[0].destroyed);assert(!h.trace.some(x=>x[0]==='add'))}else assert.equal(h.warnings.length,1);const next=h.draw(100);h.loads[1].resolve([h.Layer]);await next;assert(h.layers.at(-1).graphics.length>0)}});\n"
    },
    {
      "file": "tests/fixtures/pointCloudRings.baseline.json",
      "content": "{\n  \"description\": \"Immutable pre-extraction ring-layer readiness and geometry drawing; test-only.\",\n  \"source\": \"class Widget{\\nprivate async ensureGridLayer(): Promise<boolean> {\\n    const view = this.state.jimuMapView?.view;\\n    const result = this._pointCloudAcquisition.result;\\n    if (!view?.map || view.destroyed || !result) return false;\\n    if (this._gridLayer?.destroyed) this._gridLayer = null;\\n    if (this._gridLayerReady) {\\n      await this._gridLayerReady;\\n      return !!this._gridLayer;\\n    }\\n\\n    this._gridLayerReady = (async () => {\\n      if (!this._gridLayer) {\\n        const [GraphicsLayer] = await loadArcGISJSAPIModules([\\\"esri/layers/GraphicsLayer\\\"]);\\n        if (this.state.jimuMapView?.view !== view || this._pointCloudAcquisition.result !== result || view.destroyed || !view.map) return;\\n        if (!this._gridLayer) {\\n          this._gridLayer = new GraphicsLayer({\\n            id: \\\"pc-grid-layer\\\", title: \\\"Point Cloud Distance Rings\\\",\\n            elevationInfo: { mode: \\\"relative-to-ground\\\", offset: 0.5 },\\n          });\\n        }\\n      }\\n      try {\\n        if (this.state.jimuMapView?.view !== view || this._pointCloudAcquisition.result !== result || view.destroyed) return;\\n        const map = view.map;\\n        if (map && !map.layers.includes(this._gridLayer)) {\\n          map.add(this._gridLayer);\\n        }\\n      } catch (e) {\\n        // View mid-teardown, ignore\\n      }\\n    })();\\n\\n    await this._gridLayerReady;\\n    this._gridLayerReady = null;\\n    return !!this._gridLayer;\\n  }\\nprivate async drawConcentricRings(currentRadius: number) {\\n    if (!this.state.jimuMapView || !this.ArcGISModules) return;\\n\\n    const myGeneration = ++this._ringGeneration;\\n    const layerReady = await this.ensureGridLayer();\\n    if (!layerReady || myGeneration !== this._ringGeneration) return;\\n\\n    this._gridLayer.removeAll();\\n\\n    const { Graphic } = this.ArcGISModules;\\n\\n    const nudgeLat = this._nudgeY / 111320;\\n    const nudgeLon = this._nudgeX / (111320 * Math.cos((this._cameraLat * Math.PI) / 180));\\n    const centerLon = this._cameraLon + nudgeLon;\\n    const centerLat = this._cameraLat + nudgeLat;\\n    const mPerDegLat = 111320;\\n    const mPerDegLon = 111320 * Math.cos((centerLat * Math.PI) / 180);\\n\\n    const halfWidth = this.state.pointCloudWidth;\\n\\n    const effectiveLength = currentRadius > 0 ? currentRadius : (this.state.pointCloudActualLength ?? 100);\\n    const effectiveWidth = halfWidth > 0 ? halfWidth : (this.state.pointCloudActualWidth ?? 100);\\n    const effectiveMax = Math.max(effectiveLength, effectiveWidth);\\n\\n    // Base step on the LARGER dimension so long corridors don't get flooded with rings.\\n    // Then clamp to a minimum of 10m so we never draw rings every 5m.\\n    const rawStep = effectiveMax / 6;\\n    const niceSteps = [10, 25, 50, 100, 200, 500];\\n    const step = Math.max(niceSteps.find((s) => s >= rawStep) ?? niceSteps[niceSteps.length - 1], 10);\\n\\n    const allIntervals = new Set<number>();\\n    for (let r = step; r < effectiveMax; r += step) allIntervals.add(Math.round(r));\\n    allIntervals.add(effectiveLength);\\n    allIntervals.add(effectiveWidth);\\n\\n    const sortedIntervals = Array.from(allIntervals).sort((a, b) => a - b);\\n\\n    sortedIntervals.forEach((radius) => {\\n      const isLengthBoundary = radius === effectiveLength;\\n      const isWidthBoundary = radius === effectiveWidth;\\n\\n      const isBoundary = isLengthBoundary || isWidthBoundary;\\n      const bearing = this.getStreetBearing();\\n      const radB = (bearing * Math.PI) / 180;\\n      const sinB = Math.sin(radB);\\n      const cosB = Math.cos(radB);\\n\\n      const ringCoords: number[][] = [];\\n\\n      // Draw as a true ellipse scaled to the corridor proportions.\\n      // Each ring's semi-axis = radius scaled by how far the corridor\\n      // extends in that direction, capped at the corridor boundary.\\n      const semiForward = Math.min(radius, effectiveLength);\\n      const semiRight = Math.min(radius, effectiveWidth);\\n\\n      for (let i = 0; i <= 360; i += 3) {\\n        const rad = (i * Math.PI) / 180;\\n        const forward = semiForward * Math.cos(rad);\\n        const right = semiRight * Math.sin(rad);\\n\\n        // Project back to lat/lon\\n        const finalDx = right * cosB + forward * sinB;\\n        const finalDy = -right * sinB + forward * cosB;\\n\\n        ringCoords.push([centerLon + finalDx / mPerDegLon, centerLat + finalDy / mPerDegLat, 0]);\\n      }\\n\\n      // Draw as a closed loop (connecting end back to start)\\n      const ringGraphic = new Graphic({\\n        geometry: {\\n          type: \\\"polyline\\\",\\n          paths: [[...ringCoords, ringCoords[0]]],\\n          hasZ: true,\\n          spatialReference: { wkid: 4326 },\\n        },\\n        symbol: {\\n          type: \\\"simple-line\\\",\\n          color: isLengthBoundary\\n            ? [255, 165, 0, 0.9] // orange for length\\n            : isWidthBoundary\\n              ? [255, 215, 0, 0.9] // gold for width\\n              : [0, 255, 255, 0.4], // cyan for intermediate\\n          width: isLengthBoundary || isWidthBoundary ? 3 : 1.5,\\n          style: \\\"solid\\\",\\n        } as any,\\n      });\\n      this._gridLayer!.add(ringGraphic);\\n\\n      // Place labels at the most Forward, Backward, Left and Right points\\n      let bestFrontPt: number[] = ringCoords[0];\\n      let bestBackPt: number[] = ringCoords[0];\\n      let bestRightPt: number[] = ringCoords[0];\\n      let bestLeftPt: number[] = ringCoords[0];\\n      let maxFwd = -Infinity,\\n        minFwd = Infinity;\\n      let maxRgt = -Infinity,\\n        minRgt = Infinity;\\n\\n      ringCoords.forEach((c: number[]) => {\\n        const dy = (c[1] - centerLat) * 111320;\\n        const dx = (c[0] - centerLon) * 111320 * Math.cos((centerLat * Math.PI) / 180);\\n        const fwd = dx * sinB + dy * cosB;\\n        const rgt = dx * cosB - dy * sinB;\\n\\n        if (fwd > maxFwd) {\\n          maxFwd = fwd;\\n          bestFrontPt = c;\\n        }\\n        if (fwd < minFwd) {\\n          minFwd = fwd;\\n          bestBackPt = c;\\n        }\\n        if (rgt > maxRgt) {\\n          maxRgt = rgt;\\n          bestRightPt = c;\\n        }\\n        if (rgt < minRgt) {\\n          minRgt = rgt;\\n          bestLeftPt = c;\\n        }\\n      });\\n\\n      // Draw labels: length axis shows \\\"Xm\\\", width axis shows \\\"Xm\\\" in a different color\\n      const drawLabel = (pt: number[], text: string, isWidth: boolean) => {\\n        const label = new Graphic({\\n          geometry: { type: \\\"point\\\", longitude: pt[0], latitude: pt[1], z: 0, hasZ: true, spatialReference: { wkid: 4326 } },\\n          symbol: {\\n            type: \\\"text\\\",\\n            text,\\n            color: isBoundary ? (isWidth ? [255, 200, 0, 1] : [255, 255, 255, 1]) : isWidth ? [255, 200, 0, 0.85] : [0, 255, 255, 0.9],\\n            haloColor: [0, 0, 0, 0.8],\\n            haloSize: 1.5,\\n            font: { size: 10, weight: \\\"bold\\\" },\\n          } as any,\\n        });\\n        this._gridLayer!.add(label);\\n      };\\n\\n      const lengthLabel = `${Math.round(semiForward)}m`;\\n      const widthLabel = `${Math.round(semiRight)}m`;\\n\\n      // Length axis labels (front + back): cyan / white\\n      if (maxFwd - minFwd > 10) {\\n        drawLabel(bestFrontPt, lengthLabel, false);\\n        drawLabel(bestBackPt, lengthLabel, false);\\n      } else {\\n        drawLabel(bestFrontPt, lengthLabel, false);\\n      }\\n\\n      // Width axis labels (left + right), yellow/amber\\n      // Only show if the ellipse is meaningfully wider than it is tall\\n      if (maxRgt - minRgt > 10 && Math.abs(semiRight - semiForward) > 5) {\\n        drawLabel(bestRightPt, widthLabel, true);\\n        drawLabel(bestLeftPt, widthLabel, true);\\n      }\\n    });\\n  }\\n}\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-rings-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-rings.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited ring references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Point-cloud rings is already uninstalled. No files changed.' : 'Point-cloud rings is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-rings', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Point-cloud rings ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Ring layer/loading/draw lifetime and preserved ellipse/label geometry now have one typed feature owner. Original-map cleanup and stale-load guards are explicit. Regression files and contributor docs are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
