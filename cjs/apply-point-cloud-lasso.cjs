#!/usr/bin/env node
'use strict';
/** Point-cloud lasso installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud lasso block 1",
          "before": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudMeasurement } from '../features/point-cloud/PointCloudMeasurement';\nimport type { MeasurementPoint } from '../features/point-cloud/MeasurementViewerRenderer';\n",
          "after": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudLasso } from '../features/point-cloud/PointCloudLasso';\nimport { selectLassoIndices } from '../features/point-cloud/lassoProjection';\nimport { PointCloudMeasurement } from '../features/point-cloud/PointCloudMeasurement';\nimport type { MeasurementPoint } from '../features/point-cloud/MeasurementViewerRenderer';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 2",
          "before": "  private _groundMode: boolean = false;\n  private _ringGeneration: number = 0; // Incremented on every ring redraw to cancel stale async draws\n  private _lassoHighlightHandle: __esri.Handle | null = null; // Holds the ArcGIS highlight reference so we can clear it when redrawing\n  private _isDrawingLasso: boolean = false;\n  private measureLabelRef = React.createRef<HTMLDivElement>();\n\n",
          "after": "  private _groundMode: boolean = false;\n  private _ringGeneration: number = 0; // Incremented on every ring redraw to cancel stale async draws\n  private _lasso: PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;\n  private measureLabelRef = React.createRef<HTMLDivElement>();\n\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 3",
          "before": "        this._playbackBindings?.clear();\n        try {\n          this._measurement?.detachViewer();\n          this.mapillaryViewer.remove();\n",
          "after": "        this._playbackBindings?.clear();\n        try {\n          this._lasso?.cancelGesture();\n          this._measurement?.detachViewer();\n          this.mapillaryViewer.remove();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 4",
          "before": "    if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);\n    this._routingLoginExpiry = null; this._routingLoginView = null;\n    this._measurement?.dispose();\n    this._pointCloudAcquisition.cancel('cleanup');\n",
          "after": "    if (this._routingLoginExpiry) clearTimeout(this._routingLoginExpiry);\n    this._routingLoginExpiry = null; this._routingLoginView = null;\n    this._lasso?.clear();\n    this._measurement?.dispose();\n    this._pointCloudAcquisition.cancel('cleanup');\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 5",
          "before": "    if (this.mapillaryViewer) {\n      try {\n        this._measurement?.detachViewer();\n        this.mapillaryViewer.remove();\n",
          "after": "    if (this.mapillaryViewer) {\n      try {\n        this._lasso?.cancelGesture();\n        this._measurement?.detachViewer();\n        this.mapillaryViewer.remove();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 6",
          "before": "\n        this._playbackBindings?.clear();\n        this._measurement?.detachViewer();\n        this.mapillaryViewer.remove();\n",
          "after": "\n        this._playbackBindings?.clear();\n        this._lasso?.cancelGesture();\n        this._measurement?.detachViewer();\n        this.mapillaryViewer.remove();\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 7",
          "before": "    // DEACTIVATE ALL POINT-CLOUD-DEPENDENT TOOLS\n    // Release measurement resources before asynchronous state-reset callbacks.\n    this._measurement?.dispose();\n    // Measure mode\n",
          "after": "    // DEACTIVATE ALL POINT-CLOUD-DEPENDENT TOOLS\n    // Release measurement resources before asynchronous state-reset callbacks.\n    this._lasso?.clear();\n    this._measurement?.dispose();\n    // Measure mode\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 8",
          "before": "  private clearLasso = () => {\n    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });\n    // 1. Clear ArcGIS Scene highlight\n    if (this._lassoHighlightHandle) {\n      this._lassoHighlightHandle.remove();\n      this._lassoHighlightHandle = null;\n    }\n    if (this._pointCloudViewerRenderer) {\n      this._pointCloudViewerRenderer.updateLasso([]);\n",
          "after": "  private clearLasso = () => {\n    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });\n    this._lasso?.clear();\n    if (this._pointCloudViewerRenderer) {\n      this._pointCloudViewerRenderer.updateLasso([]);\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 9",
          "before": "  };\n\n  // Starts the SVG polygon path when the user clicks or touches the viewer\n  private handleLassoStart = (e: React.PointerEvent<SVGSVGElement>) => {\n    e.preventDefault();\n    this._isDrawingLasso = true;\n    const rect = e.currentTarget.getBoundingClientRect();\n    this.setState({\n      lassoPolygon: [[e.clientX - rect.left, e.clientY - rect.top]],\n    });\n\n    if (e.currentTarget.setPointerCapture) {\n      try {\n        e.currentTarget.setPointerCapture(e.pointerId);\n      } catch (err) {}\n    }\n  };\n\n  // Adds points to the polygon path as the finger/mouse moves\n  private handleLassoMove = (e: React.PointerEvent<SVGSVGElement>) => {\n    // Fix: Use internal boolean flag instead of checking `e.buttons !== 1`\n    // (e.buttons is 0 on many mobile touch browsers)\n    if (!this._isDrawingLasso) return;\n    e.preventDefault();\n\n    const rect = e.currentTarget.getBoundingClientRect();\n    const x = e.clientX - rect.left;\n    const y = e.clientY - rect.top;\n\n    this.setState((prev) => ({\n      lassoPolygon: [...prev.lassoPolygon, [x, y]],\n    }));\n  };\n\n  // Completes the polygon and triggers the 3D math calculation\n  private handleLassoEnd = (e: React.PointerEvent<SVGSVGElement>) => {\n    if (!this._isDrawingLasso) return;\n    this._isDrawingLasso = false;\n\n    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {\n      try {\n        e.currentTarget.releasePointerCapture(e.pointerId);\n      } catch (err) {}\n    }\n    this.calculateLassoSelection();\n  };\n\n  // Applies the calculated ObjectIDs to the ArcGIS 3D Scene LayerView\n  private highlightLassoInArcGIS() {\n    const layer = this._pointCloudMapLayer?.layer;\n    if (!this.state.jimuMapView || !layer) return;\n\n    this.state.jimuMapView.view\n      .whenLayerView(layer)\n      .then((layerView: __esri.FeatureLayerView) => {\n        if (this._lassoHighlightHandle) {\n          this._lassoHighlightHandle.remove();\n          this._lassoHighlightHandle = null;\n        }\n        if (this.state.lassoSelectedObjectIds.length > 0) {\n          this._lassoHighlightHandle = layerView.highlight(this.state.lassoSelectedObjectIds);\n        }\n      })\n      .catch(() => {});\n  }\n\n  /** Map filtered viewer indices to confirmed SDK ObjectIDs, omitting unconfirmed points. */\n",
          "after": "  };\n\n  /** Bind pointer/polygon and map highlight adapters; selected samples remain in React state. */\n  private ensureLassoOwner() {\n    return this._lasso ??= new PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView>({\n      startPolygon: point => this.setState({ lassoPolygon: [point] }),\n      appendPoint: point => this.setState(prev => ({ lassoPolygon: [...prev.lassoPolygon, point] })),\n      complete: () => this.calculateLassoSelection(),\n      readObjectIds: () => this.state.lassoSelectedObjectIds,\n      readTarget: () => {\n        const view = this.state.jimuMapView?.view, owner = this._pointCloudMapLayer;\n        return view && owner?.view === view && owner.layer ? { view, layer: owner.layer } : null;\n      },\n      whenLayerView: (view, layer) => view.whenLayerView(layer) as Promise<__esri.FeatureLayerView>,\n    });\n  }\n\n  /** Forward SVG CSS-pixel pointer events without retaining React events. */\n  private handleLassoStart = (event: React.PointerEvent<SVGSVGElement>) => this.ensureLassoOwner().start(event);\n  private handleLassoMove = (event: React.PointerEvent<SVGSVGElement>) => this._lasso?.move(event);\n  private handleLassoEnd = (event: React.PointerEvent<SVGSVGElement>) => this._lasso?.end(event);\n  /** Touch cancellation releases capture without completing an unfinished selection. */\n  private handleLassoCancel = () => this._lasso?.cancelGesture();\n\n  /** Highlight only on the current owning view/layer after asynchronous layer-view readiness. */\n  private highlightLassoInArcGIS() { this.ensureLassoOwner().highlight(); }\n\n  /** Map filtered viewer indices to confirmed SDK ObjectIDs, omitting unconfirmed points. */\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 10",
          "before": "\n  /** Project raw WGS84 points with the last viewer matrices, then update map/viewer selection.\n   * The map owner resolves confirmed ObjectIDs; the original lasso hit-test math stays here.\n   */\n  private calculateLassoSelection = () => {\n",
          "after": "\n  /** Project raw WGS84 points with the last viewer matrices, then update map/viewer selection.\n   * Pure projection preserves the existing math; the map owner resolves confirmed SDK ObjectIDs.\n   */\n  private calculateLassoSelection = () => {\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 11",
          "before": "    const height = canvas.clientHeight;\n\n    const viewMat = projection.viewMatrix;\n    const projMat = projection.projectionMatrix;\n    const ref = projection.reference;\n\n    const selectedIndices: number[] = [];\n\n    // Manual 4x4 Matrix by 4x1 Vector multiplication (Required for WebGL coordinate projection)\n    const transform = (m: Float32Array, v: number[]) => {\n      return [\n        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],\n        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],\n        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],\n        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],\n      ];\n    };\n\n    // Ray-casting algorithm for Point in Polygon check\n    const pointInPolygon = (point: number[], vs: [number, number][]) => {\n      let x = point[0],\n        y = point[1];\n      let inside = false;\n      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {\n        let xi = vs[i][0],\n          yi = vs[i][1];\n        let xj = vs[j][0],\n          yj = vs[j][1];\n        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;\n        if (intersect) inside = !inside;\n      }\n      return inside;\n    };\n\n    // Mathematically project all 3D map points back onto the 2D Screen\n    this._filteredPointCloudPoints.forEach((p, idx) => {\n      // 1. Convert WGS84 to local ENU (East-North-Up) relative to the camera\n      const enuCoords = geodeticToEnu(p.rawLon, p.rawLat, p.alt, ref.lng, ref.lat, ref.alt);\n      // 2. Project into camera view space\n      const vView = transform(viewMat, [enuCoords[0], enuCoords[1], enuCoords[2], 1.0]);\n      // 3. Project into clip space\n      const vClip = transform(projMat, vView);\n\n      // If W (vClip[3]) is negative, the point is physically behind the camera's FOV\n      if (vClip[3] <= 0) return; // Point is behind camera\n\n      // 4. Perspective Divide to get Normalized Device Coordinates (NDC: -1.0 to 1.0)\n      const ndcX = vClip[0] / vClip[3];\n      const ndcY = vClip[1] / vClip[3];\n\n      // Reject points way off screen (slight padding allowed for edge-drawing)\n      if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) return;\n\n      // 5. Convert NDC to actual screen pixels\n      const screenX = ((ndcX + 1) * width) / 2;\n      const screenY = ((1 - ndcY) * height) / 2;\n\n      // 6. Test if screen pixel is inside the user's drawn shape\n      if (pointInPolygon([screenX, screenY], lassoPolygon)) {\n        selectedIndices.push(idx);\n      }\n    });\n\n    // Stable IDs belong to original points, not their position in a cropped viewer buffer.\n",
          "after": "    const height = canvas.clientHeight;\n\n    const selectedIndices = selectLassoIndices(this._filteredPointCloudPoints, lassoPolygon, projection, width, height, geodeticToEnu);\n\n    // Stable IDs belong to original points, not their position in a cropped viewer buffer.\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 12",
          "before": "      this.state.jimuMapView?.view === view && view.map === startupMap && !view.destroyed;\n    this._pointCloudAdaptiveDisplay?.dispose();\n    this._measurement?.onViewChange(view);\n    this._pointCloudAcquisition.cancel('view-transfer');\n",
          "after": "      this.state.jimuMapView?.view === view && view.map === startupMap && !view.destroyed;\n    this._pointCloudAdaptiveDisplay?.dispose();\n    this._lasso?.clear();\n    this._measurement?.onViewChange(view);\n    this._pointCloudAcquisition.cancel('view-transfer');\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud lasso block 13",
          "before": "            onPointerUp={this.handleLassoEnd}\n            onPointerLeave={this.handleLassoEnd}\n          >\n            {this.state.lassoPolygon.length > 0 && (\n",
          "after": "            onPointerUp={this.handleLassoEnd}\n            onPointerLeave={this.handleLassoEnd}\n            onPointerCancel={this.handleLassoCancel}\n          >\n            {this.state.lassoPolygon.length > 0 && (\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLasso",
        "selectLassoIndices",
        "ensureLassoOwner"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLasso",
          "count": 4
        },
        {
          "text": "selectLassoIndices",
          "count": 2
        },
        {
          "text": "ensureLassoOwner",
          "count": 3
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud lasso block 1",
          "before": "| Measurement scene/view lifetime, pending creation and cleanup | `src/features/point-cloud/PointCloudMeasurement.ts` |\n| Measurement viewer registration, GL state and label projection | `src/features/point-cloud/MeasurementViewerRenderer.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n",
          "after": "| Measurement scene/view lifetime, pending creation and cleanup | `src/features/point-cloud/PointCloudMeasurement.ts` |\n| Measurement viewer registration, GL state and label projection | `src/features/point-cloud/MeasurementViewerRenderer.ts` |\n| Lasso pointer/capture and current/pending map highlight | `src/features/point-cloud/PointCloudLasso.ts` |\n| Lasso numerical projection and filtered-viewer index selection | `src/features/point-cloud/lassoProjection.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud lasso block 2",
          "before": "\nThe intentional improvements address lifecycle gaps in the pre-extraction implementation: stale layer attachment after awaits, duplicate initial layers, old-map overlays, renderer active state across viewer replacement and unhandled current SDK loading failures. Normal graphics, metric math, picking and tool UX remain unchanged. `tests/pointCloudMeasurement.test.cjs` distinguishes baseline rendering comparisons from these lifecycle tests. Strict development checks use actual ArcGIS 4.33.12 and Mapillary 4.1.2 boundaries; host smoke checks remain required.\n",
          "after": "\nThe intentional improvements address lifecycle gaps in the pre-extraction implementation: stale layer attachment after awaits, duplicate initial layers, old-map overlays, renderer active state across viewer replacement and unhandled current SDK loading failures. Normal graphics, metric math, picking and tool UX remain unchanged. `tests/pointCloudMeasurement.test.cjs` distinguishes baseline rendering comparisons from these lifecycle tests. Strict development checks use actual ArcGIS 4.33.12 and Mapillary 4.1.2 boundaries; host smoke checks remain required.\n\n## Lasso selection and feedback\n\n`PointCloudLasso.ts` owns active pointer ID/target, capture release, highlight request revision and current map highlight handle. Runtime retains polygon/selected-ID React state, tool intent/exclusion, canvas/projection readers, viewer flag uploads and redraw calls. Its typed target adapter requires the current map-layer owner's view to match the live view; the owner also checks layer/view/map identity and destroyed state after layer-view readiness.\n\n`lassoProjection.ts` borrows raw WGS84 coordinates/source altitude, the last viewer matrices/reference and canvas CSS dimensions. It does not allocate point-cloud copies, mutate matrices or change the existing ENU/matrix/ray-casting algorithm. Its output addresses the filtered viewer array. Runtime still translates those indices through the map owner's confirmed ObjectIDs, omitting unconfirmed entries, and preserves the state/viewer/map feedback order. Logical originalIndex + 1 IDs remain separate from assigned SDK IDs.\n\nA new highlight request supersedes pending callbacks without immediately removing current feedback; only the latest valid callback can replace its handle. Clear invalidates pending work before removing the handle, so late layer-view results cannot resurrect map feedback or remove a newer highlight. Host teardown/rejected readiness is contained locally. Clear, cloud/widget teardown and view replacement release the original handle; viewer removal cancels unfinished gestures without completing them.\n\nNormal single-pointer mouse/touch behavior, coordinate units, CSS projection, padding, polygon tests and index mappings are preserved. Lifecycle corrections add pointer cancellation/capture cleanup, active-pointer isolation, pending-request guards and safe repeated cleanup. No shader-policy, tool-toggle, selection-math or UI-layout change is included. Existing renderer tests retain their immutable baseline and compare the moved math and unchanged commit; `tests/pointCloudLasso.test.cjs` separately compares normal behavior and exercises cancellation/stale callbacks. Physical-device touch and actual SDK rendering still need host smoke checks.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLasso",
        "## Lasso selection and feedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLasso",
          "count": 2
        },
        {
          "text": "## Lasso selection and feedback",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud lasso block 1",
          "before": "Validation: 18 measurement cases plus the existing 83 geometry/acquisition/map/viewer/playback cases (101 total). Both new owners and the actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12 and Mapillary 4.1.2. Host validation still needs measurement picking, panorama label movement, fullscreen, 2D/3D switching and clear/close/reopen; recordings do not demonstrate actual GPU appearance or performance.\n\nNext: extract lasso resource ownership and its index/projection contract as a cohesive feature. Keep candidate picking, logical IDs, filtered viewer indices and confirmed SDK ObjectIDs explicit; do not change selection math while moving its lifecycle. Leave sight/viewshed and renderer policy as separate later boundaries.\n",
          "after": "Validation: 18 measurement cases plus the existing 83 geometry/acquisition/map/viewer/playback cases (101 total). Both new owners and the actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12 and Mapillary 4.1.2. Host validation still needs measurement picking, panorama label movement, fullscreen, 2D/3D switching and clear/close/reopen; recordings do not demonstrate actual GPU appearance or performance.\n\nLasso resource ownership and its index/projection contract are completed below. Keep candidate picking, logical IDs, filtered viewer indices and confirmed SDK ObjectIDs explicit; do not change selection math while moving its lifecycle. Leave sight/viewshed and renderer policy as separate later boundaries.\n\n## Lasso lifetime and pure projection\n\n`PointCloudLasso.ts` now owns pointer/capture and current/pending map highlight resources. `lassoProjection.ts` owns the unchanged pure ENU/matrix/polygon calculation. Runtime forwards events/SDK operations, retains polygon/selection state and viewer feedback, and continues mapping filtered indices through confirmed map-owner ObjectIDs. The drawing flag and highlight-handle fields are removed without mirrors.\n\nThe extraction preserves normal pointer/touch paths, functional polygon appends, batched state timing, raw coordinates, last-rendered matrices, NDC padding, ray casting, selected index order and state/viewer/map feedback order. Intentional lifecycle corrections are active-pointer isolation, SVG cancellation, capture release on clear/viewer teardown, stale layer-view rejection and safe original-handle cleanup. No shader/buffer or tool-toggle policy changes are included.\n\nFunction comments define CSS pixel versus WGS84/altitude inputs, borrowed matrix/point identity, filtered indices versus logical/confirmed IDs, capture ownership and async request validity. No timers, additional point traversal, matrix copies or network requests are introduced. Runtime shrinks by 94 lines to 14,047. Another 277 method/callback bodies, including tool toggles, picking and confirmed-ID resolution, remain token-identical.\n\n| File | Change |\n| --- | --- |\n| `src/runtime/widget.tsx` | Typed lasso factory, pure projection adapter, pointer/cancel and cleanup hooks |\n| `src/features/point-cloud/PointCloudLasso.ts` | Pointer/capture and guarded highlight lifetime |\n| `src/features/point-cloud/lassoProjection.ts` | Documented pure numerical selection in filtered-viewer index space |\n| `src/features/point-cloud/README.md` | Lasso contributor entry points, contracts and checks |\n| `docs/POINT-CLOUD-OWNERSHIP.md` | Lasso lifetime, ID mapping and intentional corrections |\n| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |\n| `tests/pointCloudLasso.test.cjs` | Baseline projection/pointer/feedback and lifetime regressions |\n| `tests/fixtures/pointCloudLasso.baseline.json` | Immutable pre-extraction runtime lasso methods |\n| `tests/pointCloudViewerRenderer.test.cjs` | Moved math token comparison and unchanged commit assertion; original fixture retained |\n\nValidation: 15 lasso cases plus the existing 101 geometry/acquisition/map/viewer/measurement/playback cases (116 total). The owner, pure projection and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; SVG targets satisfy the pointer boundary. Tests verify mathematical tokens against the original renderer fixture, numerical selection across shapes/poses, CSS dimensions, sparse confirmed IDs, batched input, feedback order, cancellation, out-of-order requests, replacement and teardown. Host smoke checks still require mouse/touch drawing, clear/cancel, crop/calibration, fullscreen, 2D/3D and close/reopen.\n\nNext: move line-of-sight analysis resource ownership and cancellation as its own tool feature. Keep viewshed separate, preserve tool exclusion and distinguish SDK view-model ownership from React tool intent. Continue reducing runtime coordination only when its feature contracts and validation remain clear.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLasso",
        "## Lasso lifetime and pure projection"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLasso",
          "count": 2
        },
        {
          "text": "## Lasso lifetime and pure projection",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud lasso block 1",
          "before": "| Measurement scene/viewer lifetime and asynchronous layer acquisition | `PointCloudMeasurement.ts` |\n| Measurement shaders, ENU uploads and floating-label projection | `MeasurementViewerRenderer.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n",
          "after": "| Measurement scene/viewer lifetime and asynchronous layer acquisition | `PointCloudMeasurement.ts` |\n| Measurement shaders, ENU uploads and floating-label projection | `MeasurementViewerRenderer.ts` |\n| Lasso pointer capture and asynchronous map highlight lifetime | `PointCloudLasso.ts` |\n| Lasso raw-point projection, ray casting and viewer-index selection | `lassoProjection.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud lasso block 2",
          "before": "Shader source, coordinate conversion, point order/identity, color thresholds, alpha policy, attribute/depth ordering, GL deletion list and lasso attribute lookup/upload behavior are preserved. Changes to those policies belong in a separate behavior change. In particular, do not infer new lasso shader behavior or expanded buffer deletion from this structural extraction.\n\nRegistration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. Runtime retains lasso hit testing and calibration/crop intent; `pointCloudGeometry.ts` prepares geometry; `PointCloudAcquisition` owns acquisition and follow scheduling. A broader cloud controller is still pending; do not move the whole widget into this renderer owner.\n\n## Verification\n",
          "after": "Shader source, coordinate conversion, point order/identity, color thresholds, alpha policy, attribute/depth ordering, GL deletion list and lasso attribute lookup/upload behavior are preserved. Changes to those policies belong in a separate behavior change. In particular, do not infer new lasso shader behavior or expanded buffer deletion from this structural extraction.\n\nRegistration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. `lassoProjection.ts` owns numerical lasso hit testing; runtime retains calibration/crop intent; `pointCloudGeometry.ts` prepares geometry; `PointCloudAcquisition` owns acquisition and follow scheduling. A broader cloud controller is still pending; do not move the whole widget into this renderer owner.\n\n## Verification\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud lasso block 3",
          "before": "\nUse the same Node/TypeScript setup as the other suites. The immutable test-only fixture contains the original scene/viewer methods. Tests compare exact graphics, metric labels, shaders, ENU arguments and GL operations, plus replacement/disposal races. In Experience Builder check first/second/third picks, clear/retry, vertical measurements, label visibility while panning the panorama, fullscreen, 2D/3D switching, cloud clear and widget close/reopen. Recording tests do not establish actual GPU appearance or frame rate.\n",
          "after": "\nUse the same Node/TypeScript setup as the other suites. The immutable test-only fixture contains the original scene/viewer methods. Tests compare exact graphics, metric labels, shaders, ENU arguments and GL operations, plus replacement/disposal races. In Experience Builder check first/second/third picks, clear/retry, vertical measurements, label visibility while panning the panorama, fullscreen, 2D/3D switching, cloud clear and widget close/reopen. Recording tests do not establish actual GPU appearance or frame rate.\n\n## Lasso feature\n\n`PointCloudLasso.ts` owns the active SVG pointer/capture and one asynchronous ArcGIS highlight handle. It owns no polygon, selection, point buffer or React state. Runtime adapters keep polygon/selected-ID state, viewer feedback, confirmed-ID resolution, tool toggles and tool exclusion. `lassoProjection.ts` is the pure numerical entry point.\n\n- `start`, `move`, `end` use SVG-local CSS pixels. Pointer capture is released before completion. The active pointer ID/target prevents unrelated pointers and duplicate ends from appending/completing a gesture. Touch does not depend on the browser's `buttons` value.\n- `cancelGesture()` releases capture without completing selection. Runtime forwards SVG pointer cancellation and cancels before viewer removal.\n- `highlight()` waits for a layer view while preserving current feedback, then applies current confirmed SDK ObjectIDs. Request revision, view/layer/map identity and destroyed checks reject stale callbacks. The runtime target adapter requires the layer's owning view to match the live view.\n- `clear()` invalidates pending highlights, cancels capture and removes the current handle. Cloud/widget teardown and view changes call it; repeated clear is safe. Normal clear still resets React state and viewer flags through the existing runtime adapter.\n\n`selectLassoIndices` borrows raw WGS84 degrees/source altitude, last-rendered matrices/reference, polygon and canvas CSS dimensions. It preserves ENU conversion, matrix multiplication, perspective divide, behind-camera rejection, 1.2 NDC padding and ray casting. It returns indices in the filtered viewer buffer, in source order. These are not logical IDs or SDK ObjectIDs: `pointCloudObjectIds` continues to resolve confirmed IDs through `PointCloudMapLayer`.\n\nThe renderer test now verifies the moved mathematical core token-for-token against its original fixture and still checks the unchanged selection commit. No GL lasso shader/buffer behavior changes in this extraction. Intentional corrections are limited to capture cleanup/cancellation, unrelated-pointer isolation, stale async highlight rejection and cleanup from the original handle.\n\n```sh\nnode tests/pointCloudLasso.test.cjs\n```\n\nUse the existing Node/TypeScript setup. Tests compare real old/new runtime adapters for projection, polygon input, sparse IDs, feedback order and batched updates; held layer-view promises cover stale results and cleanup. In Experience Builder test mouse/touch drawing, clear during drawing, cancel gestures, repeated selection, crop/calibration, view switches, fullscreen, cloud clear and widget close/reopen. Recording tests do not establish browser/GPU performance or touch behavior on physical devices.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudLasso",
        "selectLassoIndices",
        "## Lasso feature"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudLasso",
          "count": 2
        },
        {
          "text": "selectLassoIndices",
          "count": 1
        },
        {
          "text": "## Lasso feature",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/pointCloudViewerRenderer.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudViewerRenderer.test.cjs point-cloud lasso block 1",
          "before": "test('add failure does not claim active registration; removal failure remains best effort',()=>{compare(h=>{h.w.mapillaryViewer.throwAdd=true;h.w.addViewerPointCloudRenderer({points},'image');assert.equal(h.owner,null);h.w.mapillaryViewer.throwAdd=false;h.w.addViewerPointCloudRenderer({points},'image');h.w.mapillaryViewer.throwRemove=true;h.w.removeViewerPointCloudRenderer();h.w.removeViewerPointCloudRenderer();assert.equal(h.ready(),false)})});\ntest('owner removes the registration from its creating viewer when host reference changes/disappears',()=>{for(const replacement of ['other','missing']){const h=setup('working');h.run(()=>{h.w.addViewerPointCloudRenderer({points},'image');const original=h.w.mapillaryViewer;h.w.mapillaryViewer=replacement==='other'?h.viewer():null;h.w.removeViewerPointCloudRenderer();assert.equal(original.removes,1);assert.equal(original.renderer,null);assert.equal(h.owner.ready,false);assert.equal(h.w.mapillaryViewer?.removes||0,0)})}});\ntest('runtime has typed renderer access only and unchanged lasso projection/index math',()=>{const after=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');assert(!after.includes('_pointCloudRendererActive'));assert(!/renderer\\._|_pointCloudViewerRenderer\\?*\\._/.test(after));const old=runtimeMethods('baseline',['calculateLassoSelection']),next=runtimeMethods('working',['calculateLassoSelection']);const tail=s=>s.slice(s.indexOf('    const selectedIndices:')).replace(/\\r\\n/g,'\\n');assert.equal(tail(next),tail(old));assert(after.includes('private _pointCloudViewerRenderer: PointCloudViewerRenderer | null'))});\n",
          "after": "test('add failure does not claim active registration; removal failure remains best effort',()=>{compare(h=>{h.w.mapillaryViewer.throwAdd=true;h.w.addViewerPointCloudRenderer({points},'image');assert.equal(h.owner,null);h.w.mapillaryViewer.throwAdd=false;h.w.addViewerPointCloudRenderer({points},'image');h.w.mapillaryViewer.throwRemove=true;h.w.removeViewerPointCloudRenderer();h.w.removeViewerPointCloudRenderer();assert.equal(h.ready(),false)})});\ntest('owner removes the registration from its creating viewer when host reference changes/disappears',()=>{for(const replacement of ['other','missing']){const h=setup('working');h.run(()=>{h.w.addViewerPointCloudRenderer({points},'image');const original=h.w.mapillaryViewer;h.w.mapillaryViewer=replacement==='other'?h.viewer():null;h.w.removeViewerPointCloudRenderer();assert.equal(original.removes,1);assert.equal(original.renderer,null);assert.equal(h.owner.ready,false);assert.equal(h.w.mapillaryViewer?.removes||0,0)})}});\ntest('runtime retains typed renderer access, identical pure lasso math and unchanged selection commit',()=>{\n const after=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8');assert(!after.includes('_pointCloudRendererActive'));assert(!/renderer\\._|_pointCloudViewerRenderer\\?*\\._/.test(after));\n const old=runtimeMethods('baseline',['calculateLassoSelection']),next=runtimeMethods('working',['calculateLassoSelection']);\n const projection=fs.readFileSync(root+'/src/features/point-cloud/lassoProjection.ts','utf8');\n const tokens=s=>{const scan=ts.createScanner(ts.ScriptTarget.Latest,true,ts.LanguageVariant.Standard,s),out=[];while(scan.scan()!==ts.SyntaxKind.EndOfFileToken)out.push(scan.getTokenText());return out};\n const core=s=>s.slice(s.indexOf('    const selectedIndices: number[] ='),s.indexOf('    // Stable IDs belong')).replaceAll('this._filteredPointCloudPoints','points').replaceAll('geodeticToEnu(', 'toEnu(');\n const moved=projection.slice(projection.indexOf('    const selectedIndices: number[] ='),projection.indexOf('    return selectedIndices;'));\n assert.deepEqual(tokens(moved),tokens(core(old)));\n const commit=s=>s.slice(s.indexOf('    // Stable IDs belong')).replace(/\\r\\n/g,'\\n');assert.equal(commit(next),commit(old));\n assert(after.includes('private _pointCloudViewerRenderer: PointCloudViewerRenderer | null'));\n});\n"
        }
      ],
      "absentAfterUninstall": [
        "root+'/src/features/point-cloud/lassoProjection.ts'"
      ],
      "requiredOccurrences": [
        {
          "text": "root+'/src/features/point-cloud/lassoProjection.ts'",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudLasso.ts",
      "content": "import type { LassoVertex } from './lassoProjection';\n\nexport interface LassoPointerTarget {\n  getBoundingClientRect(): { left: number; top: number };\n  setPointerCapture?(pointerId: number): void;\n  hasPointerCapture?(pointerId: number): boolean;\n  releasePointerCapture?(pointerId: number): void;\n}\nexport interface LassoPointerEvent {\n  currentTarget: LassoPointerTarget;\n  pointerId: number;\n  clientX: number;\n  clientY: number;\n  preventDefault(): void;\n}\nexport interface LassoHighlightHandle { remove(): void; }\nexport interface LassoView { destroyed?: boolean; map?: unknown; }\nexport interface LassoLayer { destroyed?: boolean; }\nexport interface PointCloudLassoDependencies<L, V> {\n  startPolygon(point: LassoVertex): void;\n  appendPoint(point: LassoVertex): void;\n  complete(): void;\n  readTarget(): { layer: L; view: V } | null;\n  readObjectIds(): number[];\n  whenLayerView(view: V, layer: L): PromiseLike<{ highlight(ids: number[]): LassoHighlightHandle }>;\n}\n\n/** Owns an SVG pointer gesture and one asynchronous map highlight, without React state,\n * GL state or point-array copies. Polygon/selection state and viewer feedback stay in\n * the runtime adapters; numerical projection has its own pure feature entry point.\n */\nexport class PointCloudLasso<L extends LassoLayer, V extends LassoView> {\n  private gesture: { target: LassoPointerTarget; pointerId: number } | null = null;\n  private handle: LassoHighlightHandle | null = null;\n  private revision = 0;\n  /** Bind live readers/SDK operations once; construction performs no work. */\n  constructor(private readonly dependencies: PointCloudLassoDependencies<L, V>) {}\n\n  /** Begin a pointer gesture in SVG CSS pixels; touch does not depend on e.buttons. */\n  start(event: LassoPointerEvent): void {\n    event.preventDefault();\n    this.cancelGesture();\n    this.gesture = { target: event.currentTarget, pointerId: event.pointerId };\n    const rect = event.currentTarget.getBoundingClientRect();\n    this.dependencies.startPolygon([event.clientX - rect.left, event.clientY - rect.top]);\n    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch (_) {}\n  }\n\n  /** Append only events belonging to the active pointer; React performs the functional append. */\n  move(event: LassoPointerEvent): void {\n    if (!this.gesture || this.gesture.pointerId !== event.pointerId || this.gesture.target !== event.currentTarget) return;\n    event.preventDefault();\n    const rect = event.currentTarget.getBoundingClientRect();\n    this.dependencies.appendPoint([event.clientX - rect.left, event.clientY - rect.top]);\n  }\n\n  /** Release capture before computing selection. Duplicate/up-leave events cannot complete twice. */\n  end(event: LassoPointerEvent): void {\n    if (!this.gesture || this.gesture.pointerId !== event.pointerId || this.gesture.target !== event.currentTarget) return;\n    this.cancelGesture(); this.dependencies.complete();\n  }\n\n  /** Cancel on clear/viewer replacement/teardown without committing an unfinished polygon. */\n  cancelGesture(): void {\n    const gesture = this.gesture; this.gesture = null;\n    if (!gesture) return;\n    try {\n      if (gesture.target.hasPointerCapture?.(gesture.pointerId)) gesture.target.releasePointerCapture?.(gesture.pointerId);\n    } catch (_) {}\n  }\n\n  /** Release the previous handle once; view destruction may already have removed it. */\n  private releaseHighlight(): void {\n    const handle = this.handle; this.handle = null;\n    try { handle?.remove(); } catch (_) {}\n  }\n\n  /** Apply current confirmed SDK ObjectIDs after layer-view readiness.\n   * New requests/clear/dispose invalidate pending callbacks. View, map and layer identity\n   * checks reject replacements; a stale promise cannot remove newer feedback.\n   */\n  highlight(): void {\n    const revision = ++this.revision;\n    const target = this.dependencies.readTarget();\n    if (!target || target.view.destroyed || target.layer.destroyed || !target.view.map) { this.releaseHighlight(); return; }\n    const { view, layer } = target, map = view.map;\n    try {\n      void Promise.resolve(this.dependencies.whenLayerView(view, layer)).then(layerView => {\n        const live = this.dependencies.readTarget();\n        if (revision !== this.revision || !live || live.view !== view || live.layer !== layer || view.destroyed || layer.destroyed || view.map !== map) return;\n        this.releaseHighlight();\n        const ids = this.dependencies.readObjectIds();\n        if (ids.length) this.handle = layerView.highlight(ids);\n      }).catch(() => {});\n    } catch (_) { /* Host view/layer may be destroyed before whenLayerView starts. */ }\n  }\n\n  /** Reusable clear invalidates pending highlight before removing its current handle. */\n  clear(): void { ++this.revision; this.cancelGesture(); this.releaseHighlight(); }\n}\n"
    },
    {
      "file": "src/features/point-cloud/lassoProjection.ts",
      "content": "import type { PointCloudProjection } from './PointCloudViewerRenderer';\n\n/** SVG lasso vertices use canvas CSS pixels, not device pixels. */\nexport type LassoVertex = [number, number];\nexport interface LassoProjectedPoint { rawLon: number; rawLat: number; alt: number; }\nexport type LassoToEnu = (lon: number, lat: number, altitude: number, referenceLon: number, referenceLat: number, referenceAltitude: number) => number[];\n\n/** Return indices in the filtered viewer array without mutating points, polygon or matrices.\n * Raw WGS84 degrees/source altitude become ENU using the last rendered reference.\n * The existing matrix/ray-casting math, behind-camera test and 1.2 NDC padding are\n * preserved. Map IDs must be resolved separately through confirmed map-owner mappings.\n */\nexport function selectLassoIndices(points: readonly LassoProjectedPoint[], lassoPolygon: LassoVertex[], projection: PointCloudProjection, width: number, height: number, toEnu: LassoToEnu): number[] {\n    const viewMat = projection.viewMatrix;\n    const projMat = projection.projectionMatrix;\n    const ref = projection.reference;\n    const selectedIndices: number[] = [];\n\n    // Manual 4x4 Matrix by 4x1 Vector multiplication (Required for WebGL coordinate projection)\n    const transform = (m: Float32Array, v: number[]) => {\n      return [\n        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],\n        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],\n        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],\n        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],\n      ];\n    };\n\n    // Ray-casting algorithm for Point in Polygon check\n    const pointInPolygon = (point: number[], vs: [number, number][]) => {\n      let x = point[0],\n        y = point[1];\n      let inside = false;\n      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {\n        let xi = vs[i][0],\n          yi = vs[i][1];\n        let xj = vs[j][0],\n          yj = vs[j][1];\n        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;\n        if (intersect) inside = !inside;\n      }\n      return inside;\n    };\n\n    // Mathematically project all 3D map points back onto the 2D Screen\n    points.forEach((p, idx) => {\n      // 1. Convert WGS84 to local ENU (East-North-Up) relative to the camera\n      const enuCoords = toEnu(p.rawLon, p.rawLat, p.alt, ref.lng, ref.lat, ref.alt);\n      // 2. Project into camera view space\n      const vView = transform(viewMat, [enuCoords[0], enuCoords[1], enuCoords[2], 1.0]);\n      // 3. Project into clip space\n      const vClip = transform(projMat, vView);\n\n      // If W (vClip[3]) is negative, the point is physically behind the camera's FOV\n      if (vClip[3] <= 0) return; // Point is behind camera\n\n      // 4. Perspective Divide to get Normalized Device Coordinates (NDC: -1.0 to 1.0)\n      const ndcX = vClip[0] / vClip[3];\n      const ndcY = vClip[1] / vClip[3];\n\n      // Reject points way off screen (slight padding allowed for edge-drawing)\n      if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) return;\n\n      // 5. Convert NDC to actual screen pixels\n      const screenX = ((ndcX + 1) * width) / 2;\n      const screenY = ((1 - ndcY) * height) / 2;\n\n      // 6. Test if screen pixel is inside the user's drawn shape\n      if (pointInPolygon([screenX, screenY], lassoPolygon)) {\n        selectedIndices.push(idx);\n      }\n    });\n\n    return selectedIndices;\n}\n"
    },
    {
      "file": "tests/pointCloudLasso.test.cjs",
      "content": "/** Compare real runtime adapters and pure projection with the original lasso implementation.\n * Held layer-view promises test ownership independently of the renderer/index recordings.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudLasso.baseline.json','utf8'));\nfunction load(name){const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/'+name+'.ts','utf8')))(m,m.exports);return m.exports}\nconst {PointCloudLasso}=load('PointCloudLasso'),{selectLassoIndices}=load('lassoProjection');\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return (kind==='baseline'?['clearLasso','handleLassoStart','handleLassoMove','handleLassoEnd','highlightLassoInArcGIS','pointCloudObjectIds','calculateLassoSelection']:['ensureLassoOwner','clearLasso','handleLassoStart','handleLassoMove','handleLassoEnd','handleLassoCancel','highlightLassoInArcGIS','pointCloudObjectIds','calculateLassoSelection']).map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudLasso','selectLassoIndices','geodeticToEnu',compile('class Harness {'+methods(kind)+'};return Harness;'));\nconst identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}},flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve()};\nconst rectangle=(x=0,y=0,w=200,h=100)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];\nfunction setup(kind,{hold=false,batched=false}={}){\n const trace=[],requests=[],enu=[],pending=[],handles=[],views=[];const toEnu=(...args)=>{enu.push(args);return[args[0]-args[3],args[1]-args[4],args[2]-args[5]]};const w=new (classes[kind](PointCloudLasso,selectLassoIndices,toEnu))();\n const layerView={highlight(ids){const h={id:handles.length,remove(){trace.push(['removeHighlight',this.id])}};handles.push(h);trace.push(['highlight',ids.slice(),h.id]);return h}};\n function view(){const v={map:{},destroyed:false,whenLayerView(layer){const d=deferred();requests.push({...d,view:v,layer});trace.push(['whenLayerView',views.indexOf(v),layer.id]);if(!hold)d.resolve(layerView);return d.promise}};views.push(v);return v}\n const v=view();w.state={jimuMapView:{view:v},lassoPolygon:rectangle(),lassoSelectedObjectIds:[]};w._lasso=null;w._isDrawingLasso=false;w._lassoHighlightHandle=null;\n w.projection={viewMatrix:identity(),projectionMatrix:identity(),reference:{lng:0,lat:0,alt:0}};w._filteredPointCloudPoints=[{rawLon:0,rawLat:0,alt:0},{rawLon:.5,rawLat:.5,alt:0},{rawLon:-.5,rawLat:-.5,alt:0},{rawLon:2,rawLat:0,alt:0}];\n w._pointCloudMapLayer={view:v,layer:{id:'A',destroyed:false},objectIds:indices=>{trace.push(['objectIds',indices.slice()]);return indices.map(i=>[701,undefined,19,440][i]).filter(Number.isFinite)}};\n w._pointCloudViewerRenderer={getProjection:()=>w.projection,updateLasso:indices=>trace.push(['viewerLasso',indices.slice()])};w.mapillaryViewer={resize:()=>trace.push(['resize'])};w.viewerContainer={current:{querySelector:()=>({clientWidth:200,clientHeight:100})}};\n w.setState=(update,callback)=>{const run=()=>{const patch=typeof update==='function'?update(w.state):update;Object.assign(w.state,patch);trace.push(['state',structuredClone(patch)]);callback?.()};if(batched)pending.push(run);else run()};w.flush=()=>{while(pending.length)pending.shift()()};\n const captured=new Set(),target={getBoundingClientRect:()=>({left:10,top:20}),setPointerCapture(id){captured.add(id);trace.push(['capture',id])},hasPointerCapture:id=>captured.has(id),releasePointerCapture(id){captured.delete(id);trace.push(['release',id])}};\n const event=(x,y,pointerId=1)=>({currentTarget:target,clientX:x+10,clientY:y+20,pointerId,buttons:0,preventDefault(){trace.push(['preventDefault'])}});\n return {kind,w,trace,requests,handles,layerView,view,views,enu,target,captured,event,calculate:()=>w.calculateLassoSelection(),highlight:()=>w.highlightLassoInArcGIS(),clear:()=>w.clearLasso(),owner:()=>w.ensureLassoOwner()};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);await flush();assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.enu,a.enu);assert.deepEqual([b.w.state.lassoPolygon,b.w.state.lassoSelectedObjectIds],[a.w.state.lassoPolygon,a.w.state.lassoSelectedObjectIds]);return{a,b}}\ntest('projection preserves selected viewer indices, confirmed sparse SDK IDs and feedback order',async()=>{await compare(async h=>{h.calculate();await flush();assert.deepEqual(h.w.state.lassoSelectedObjectIds,[701,19]);assert.deepEqual(h.trace.find(x=>x[0]==='viewerLasso')[1],[0,1,2])})});\ntest('pointer/touch path uses SVG-local CSS pixels, functional append and release-before-selection',async()=>{await compare(async h=>{h.w.handleLassoStart(h.event(0,0));h.w.handleLassoMove(h.event(200,0));h.w.handleLassoMove(h.event(200,100));h.w.handleLassoMove(h.event(0,100));h.w.handleLassoEnd(h.event(0,100));h.w.handleLassoEnd(h.event(0,100));await flush();assert(!h.captured.size);assert.equal(h.trace.filter(x=>x[0]==='objectIds').length,1)})});\ntest('batched polygon appends and selection commits retain original React timing',async()=>{await compare(async h=>{h.w.handleLassoStart(h.event(0,0));h.w.flush();h.w.handleLassoMove(h.event(200,0));h.w.handleLassoMove(h.event(200,100));h.w.handleLassoMove(h.event(0,100));h.w.flush();h.w.handleLassoEnd(h.event(0,100));h.w.flush();await flush()},{batched:true})});\ntest('small/concave/reversed polygons preserve ray-casting and source-order indices',async()=>{for(const polygon of [rectangle(80,20,50,60),[[0,0],[200,0],[100,30],[200,100],[0,100]],rectangle().reverse(),[[0,0],[100,0],[100,100]]])await compare(async h=>{h.w.state.lassoPolygon=polygon;h.calculate();await flush()})});\ntest('perspective divide, behind-camera rejection and padded NDC edges match baseline',async()=>{for(const mode of ['behind','perspective','padding','rotated'])await compare(async h=>{h.w.state.lassoPolygon=rectangle(-40,-20,280,140);if(mode==='behind')h.w.projection.projectionMatrix[15]=-1;if(mode==='perspective')h.w.projection.projectionMatrix[15]=2;if(mode==='padding')h.w._filteredPointCloudPoints=[{rawLon:1.19,rawLat:0,alt:0},{rawLon:1.21,rawLat:0,alt:0}];if(mode==='rotated'){h.w.projection.viewMatrix[0]=0;h.w.projection.viewMatrix[1]=1;h.w.projection.viewMatrix[4]=-1;h.w.projection.viewMatrix[5]=0}h.calculate();await flush()})});\ntest('missing polygon/projection/canvas gates do not overwrite existing selection',async()=>{for(const gate of ['polygon','projection','canvas'])await compare(async h=>{h.w.state.lassoSelectedObjectIds=[99];if(gate==='polygon')h.w.state.lassoPolygon=[[0,0],[1,1]];if(gate==='projection')h.w.projection=null;if(gate==='canvas')h.w.viewerContainer.current=null;h.calculate();assert.deepEqual(h.w.state.lassoSelectedObjectIds,[99]);assert.equal(h.trace.length,0)})});\ntest('raw coordinates and captured renderer reference determine ENU; shifted positions do not',async()=>{await compare(async h=>{h.w._filteredPointCloudPoints=h.w._filteredPointCloudPoints.map(p=>({...p,lon:999,lat:-999}));h.w.projection.reference={lng:.1,lat:.2,alt:.3};h.calculate();await flush();assert.deepEqual(h.enu[0],[0,0,0,.1,.2,.3])})});\ntest('ordinary clear releases the current map handle and resets viewer flags with one redraw',async()=>{await compare(async h=>{h.calculate();await flush();h.clear();await flush();assert.deepEqual(h.w.state.lassoPolygon,[]);assert.deepEqual(h.w.state.lassoSelectedObjectIds,[]);assert.equal(h.trace.filter(x=>x[0]==='removeHighlight').length,1)})});\ntest('clear invalidates pending highlight and pointer capture without allowing gesture completion',async()=>{const h=setup('working',{hold:true});h.w.handleLassoStart(h.event(0,0));h.w.state.lassoSelectedObjectIds=[19];h.highlight();h.clear();h.requests[0].resolve(h.layerView);h.w.handleLassoMove(h.event(100,100));h.w.handleLassoEnd(h.event(100,100));await flush();assert.equal(h.handles.length,0);assert(!h.captured.size);assert(!h.trace.some(x=>x[0]==='objectIds'))});\ntest('only latest layer-view request may replace current highlight when promises settle out of order',async()=>{const h=setup('working',{hold:true});h.w.state.lassoSelectedObjectIds=[701];h.highlight();h.w.state.lassoSelectedObjectIds=[19];h.highlight();h.requests[1].resolve(h.layerView);await flush();h.requests[0].resolve(h.layerView);await flush();assert.equal(h.handles.length,1);assert(!h.trace.some(x=>x[0]==='removeHighlight'));assert.deepEqual(h.trace.find(x=>x[0]==='highlight')[1],[19])});\ntest('view/layer/map replacement and destroyed targets reject stale layer-view results',async()=>{for(const mode of ['view','layer','map','view-destroyed','layer-destroyed']){const h=setup('working',{hold:true});h.w.state.lassoSelectedObjectIds=[701];h.highlight();if(mode==='view'){const v=h.view();h.w.state.jimuMapView={view:v};h.w._pointCloudMapLayer.view=v}if(mode==='layer')h.w._pointCloudMapLayer.layer={id:'B'};if(mode==='map')h.w.state.jimuMapView.view.map={};if(mode==='view-destroyed')h.w.state.jimuMapView.view.destroyed=true;if(mode==='layer-destroyed')h.w._pointCloudMapLayer.layer.destroyed=true;h.requests[0].resolve(h.layerView);await flush();assert.equal(h.handles.length,0)}});\ntest('new selection is read at layer-view completion; empty selection removes prior handle',async()=>{await compare(async h=>{h.w.state.lassoSelectedObjectIds=[701];h.highlight();h.requests[0].resolve(h.layerView);await flush();h.highlight();h.w.state.lassoSelectedObjectIds=[];h.requests[1].resolve(h.layerView);await flush();assert.equal(h.handles.length,1);assert.equal(h.trace.filter(x=>x[0]==='removeHighlight').length,1)},{hold:true})});\ntest('cancellation, duplicate end and unrelated pointer cannot append or finish an active gesture',()=>{const h=setup('working');h.w.handleLassoStart(h.event(0,0));h.w.handleLassoMove(h.event(100,100,2));h.w.handleLassoEnd(h.event(100,100,2));assert(h.captured.has(1));h.w.handleLassoCancel();h.w.handleLassoEnd(h.event(0,0));assert(!h.captured.size);assert.deepEqual(h.w.state.lassoPolygon,[[0,0]]);assert(!h.trace.some(x=>x[0]==='objectIds'))});\ntest('layer-view rejection and synchronous host teardown errors are contained; subsequent calls retry',async()=>{const h=setup('working',{hold:true});h.highlight();h.requests[0].reject(Error('cancelled'));await flush();const v=h.w.state.jimuMapView.view,original=v.whenLayerView;v.whenLayerView=()=>{throw Error('destroyed')};h.highlight();v.whenLayerView=original;h.w.state.lassoSelectedObjectIds=[19];h.highlight();h.requests[1].resolve(h.layerView);await flush();assert.equal(h.handles.length,1)});\ntest('capture/highlight removal failures cannot prevent reusable cleanup',async()=>{const h=setup('working');h.w.state.lassoSelectedObjectIds=[19];h.highlight();await flush();h.handles[0].remove=()=>{throw Error('already destroyed')};h.w.handleLassoStart(h.event(0,0));h.target.hasPointerCapture=()=>{throw Error('detached SVG')};h.owner().clear();h.owner().clear();h.w.handleLassoEnd(h.event(10,10));assert(!h.trace.some(x=>x[0]==='objectIds'))});\n"
    },
    {
      "file": "tests/fixtures/pointCloudLasso.baseline.json",
      "content": "{\n  \"description\": \"Immutable pre-extraction lasso gesture, projection, ID and highlight methods; test-only.\",\n  \"source\": \"class Widget {\\nprivate clearLasso = () => {\\n    this.setState({ lassoPolygon: [], lassoSelectedObjectIds: [] });\\n    // 1. Clear ArcGIS Scene highlight\\n    if (this._lassoHighlightHandle) {\\n      this._lassoHighlightHandle.remove();\\n      this._lassoHighlightHandle = null;\\n    }\\n    if (this._pointCloudViewerRenderer) {\\n      this._pointCloudViewerRenderer.updateLasso([]);\\n      if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n    }\\n  };\\nprivate handleLassoStart = (e: React.PointerEvent<SVGSVGElement>) => {\\n    e.preventDefault();\\n    this._isDrawingLasso = true;\\n    const rect = e.currentTarget.getBoundingClientRect();\\n    this.setState({\\n      lassoPolygon: [[e.clientX - rect.left, e.clientY - rect.top]],\\n    });\\n\\n    if (e.currentTarget.setPointerCapture) {\\n      try {\\n        e.currentTarget.setPointerCapture(e.pointerId);\\n      } catch (err) {}\\n    }\\n  };\\nprivate handleLassoMove = (e: React.PointerEvent<SVGSVGElement>) => {\\n    // Fix: Use internal boolean flag instead of checking `e.buttons !== 1`\\n    // (e.buttons is 0 on many mobile touch browsers)\\n    if (!this._isDrawingLasso) return;\\n    e.preventDefault();\\n\\n    const rect = e.currentTarget.getBoundingClientRect();\\n    const x = e.clientX - rect.left;\\n    const y = e.clientY - rect.top;\\n\\n    this.setState((prev) => ({\\n      lassoPolygon: [...prev.lassoPolygon, [x, y]],\\n    }));\\n  };\\nprivate handleLassoEnd = (e: React.PointerEvent<SVGSVGElement>) => {\\n    if (!this._isDrawingLasso) return;\\n    this._isDrawingLasso = false;\\n\\n    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {\\n      try {\\n        e.currentTarget.releasePointerCapture(e.pointerId);\\n      } catch (err) {}\\n    }\\n    this.calculateLassoSelection();\\n  };\\nprivate highlightLassoInArcGIS() {\\n    const layer = this._pointCloudMapLayer?.layer;\\n    if (!this.state.jimuMapView || !layer) return;\\n\\n    this.state.jimuMapView.view\\n      .whenLayerView(layer)\\n      .then((layerView: __esri.FeatureLayerView) => {\\n        if (this._lassoHighlightHandle) {\\n          this._lassoHighlightHandle.remove();\\n          this._lassoHighlightHandle = null;\\n        }\\n        if (this.state.lassoSelectedObjectIds.length > 0) {\\n          this._lassoHighlightHandle = layerView.highlight(this.state.lassoSelectedObjectIds);\\n        }\\n      })\\n      .catch(() => {});\\n  }\\nprivate pointCloudObjectIds(indices: readonly number[]): number[] {\\n    return this._pointCloudMapLayer?.objectIds(indices) || [];\\n  }\\nprivate calculateLassoSelection = () => {\\n    const { lassoPolygon } = this.state;\\n    if (lassoPolygon.length < 3) return; // Need at least a triangle\\n\\n    // Borrow the last rendered matrices/reference without exposing GL callback internals.\\n    const projection = this._pointCloudViewerRenderer?.getProjection();\\n    if (!projection) return;\\n\\n    const canvas = this.viewerContainer.current?.querySelector(\\\"canvas\\\");\\n    if (!canvas) return;\\n    const width = canvas.clientWidth;\\n    const height = canvas.clientHeight;\\n\\n    const viewMat = projection.viewMatrix;\\n    const projMat = projection.projectionMatrix;\\n    const ref = projection.reference;\\n\\n    const selectedIndices: number[] = [];\\n\\n    // Manual 4x4 Matrix by 4x1 Vector multiplication (Required for WebGL coordinate projection)\\n    const transform = (m: Float32Array, v: number[]) => {\\n      return [\\n        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],\\n        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],\\n        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],\\n        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],\\n      ];\\n    };\\n\\n    // Ray-casting algorithm for Point in Polygon check\\n    const pointInPolygon = (point: number[], vs: [number, number][]) => {\\n      let x = point[0],\\n        y = point[1];\\n      let inside = false;\\n      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {\\n        let xi = vs[i][0],\\n          yi = vs[i][1];\\n        let xj = vs[j][0],\\n          yj = vs[j][1];\\n        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;\\n        if (intersect) inside = !inside;\\n      }\\n      return inside;\\n    };\\n\\n    // Mathematically project all 3D map points back onto the 2D Screen\\n    this._filteredPointCloudPoints.forEach((p, idx) => {\\n      // 1. Convert WGS84 to local ENU (East-North-Up) relative to the camera\\n      const enuCoords = geodeticToEnu(p.rawLon, p.rawLat, p.alt, ref.lng, ref.lat, ref.alt);\\n      // 2. Project into camera view space\\n      const vView = transform(viewMat, [enuCoords[0], enuCoords[1], enuCoords[2], 1.0]);\\n      // 3. Project into clip space\\n      const vClip = transform(projMat, vView);\\n\\n      // If W (vClip[3]) is negative, the point is physically behind the camera's FOV\\n      if (vClip[3] <= 0) return; // Point is behind camera\\n\\n      // 4. Perspective Divide to get Normalized Device Coordinates (NDC: -1.0 to 1.0)\\n      const ndcX = vClip[0] / vClip[3];\\n      const ndcY = vClip[1] / vClip[3];\\n\\n      // Reject points way off screen (slight padding allowed for edge-drawing)\\n      if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) return;\\n\\n      // 5. Convert NDC to actual screen pixels\\n      const screenX = ((ndcX + 1) * width) / 2;\\n      const screenY = ((1 - ndcY) * height) / 2;\\n\\n      // 6. Test if screen pixel is inside the user's drawn shape\\n      if (pointInPolygon([screenX, screenY], lassoPolygon)) {\\n        selectedIndices.push(idx);\\n      }\\n    });\\n\\n    // Stable IDs belong to original points, not their position in a cropped viewer buffer.\\n    const objectIds = this.pointCloudObjectIds(selectedIndices);\\n\\n    this.setState({ lassoSelectedObjectIds: objectIds }, () => {\\n      if (this._pointCloudViewerRenderer) {\\n        // Update the viewer instantly\\n        this._pointCloudViewerRenderer.updateLasso(selectedIndices);\\n        if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n      }\\n      // Update the map asynchronously\\n      this.highlightLassoInArcGIS();\\n    });\\n  };\\n}\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-lasso-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-lasso.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited lasso references remain)');
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
    console.log(uninstall ? 'Point-cloud lasso is already uninstalled. No files changed.' : 'Point-cloud lasso is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-lasso', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud lasso ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Lasso pointer/highlight lifetime and pure projection now have documented feature entry points. Normal math, IDs and feedback are preserved; stale requests and cancellation are guarded. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
