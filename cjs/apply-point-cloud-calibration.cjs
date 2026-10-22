#!/usr/bin/env node
'use strict';
/** Point-cloud calibration installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud calibration block 1",
          "before": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\n",
          "after": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudCalibration } from '../features/point-cloud/PointCloudCalibration';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 2",
          "before": "  private _rings: PointCloudRings<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView, PointCloudResult> | null = null;\n\n  // Nude Tool Variables\n  private _nudgeX: number = 0; // East/West offset in meters\n  private _nudgeY: number = 0; // North/South offset in meters\n",
          "after": "  private _rings: PointCloudRings<__esri.Graphic, __esri.GraphicsLayer, __esri.MapView | __esri.SceneView, PointCloudResult> | null = null;\n\n  // Calibration offsets and live runtime adapters\n  /** Borrow current meter offsets; input guards and debounce cancellation stay with widget lifecycle. */\n  private _pointCloudCalibration = new PointCloudCalibration({\n    readOffsets: () => ({ x: this._nudgeX, y: this._nudgeY, z: this._nudgeZ }),\n    writeOffsets: offset => { this._nudgeX = offset.x; this._nudgeY = offset.y; this._nudgeZ = offset.z; },\n    readBearing: () => this._lastBearing,\n    readStep: () => this.state.nudgeStep,\n    requestRender: () => this._debouncedNudgeRender(),\n    renderMap: () => this.renderPointCloudMapLayer(),\n    drawRings: () => this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength),\n    updateViewer: () => {\n      if (this._pointCloudViewerRenderer) {\n        this._pointCloudViewerRenderer.updateColors();\n        if (this.mapillaryViewer) this.mapillaryViewer.resize();\n      }\n    },\n  });\n\n  private _nudgeX: number = 0; // East/West offset in meters\n  private _nudgeY: number = 0; // North/South offset in meters\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 3",
          "before": "    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;\n\n    let handled = false;\n    const step = e.shiftKey ? 1.0 : 0.2;\n\n    const bearingRad = (this._lastBearing * Math.PI) / 180;\n    const cosB = Math.cos(bearingRad);\n    const sinB = Math.sin(bearingRad);\n\n    switch (e.key.toLowerCase()) {\n      case \"t\": // Move FORWARD\n        this._nudgeY += step * cosB;\n        this._nudgeX += step * sinB;\n        handled = true;\n        break;\n\n      case \"g\": // Move BACKWARD\n        this._nudgeY -= step * cosB;\n        this._nudgeX -= step * sinB;\n        handled = true;\n        break;\n\n      case \"f\": // Move LEFT\n        this._nudgeY += step * sinB;\n        this._nudgeX -= step * cosB;\n        handled = true;\n        break;\n\n      case \"h\": // Move RIGHT\n        this._nudgeY -= step * sinB;\n        this._nudgeX += step * cosB;\n        handled = true;\n        break;\n\n      case \"r\": // Move UP\n        this._nudgeZ += step;\n        handled = true;\n        break;\n      case \"v\": // Move DOWN\n        this._nudgeZ -= step;\n        handled = true;\n        break;\n\n      // THE Z-SLICER (GROUND MODE)\n      case \"x\":\n",
          "after": "    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;\n\n    const handled = this._pointCloudCalibration.keyDown(e.key, e.shiftKey);\n\n    switch (e.key.toLowerCase()) {\n      // THE Z-SLICER (GROUND MODE)\n      case \"x\":\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 4",
          "before": "\n  /**\n   * 2. KEY UP: Triggers the actual map redraw ONLY when the user releases the key.\n   */\n  private handleNudgeKeyUp = (e: KeyboardEvent) => {\n",
          "after": "\n  /**\n   * Schedule movement-key commits on release through the shared trailing debounce.\n   */\n  private handleNudgeKeyUp = (e: KeyboardEvent) => {\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 5",
          "before": "    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;\n\n    const key = e.key.toLowerCase();\n\n    // If they released T, F, G, H, R or V apply the final location to the map!\n    if ([\"t\", \"f\", \"h\", \"g\", \"r\", \"v\"].includes(key)) {\n      // We use the debounced version just in case they release two keys (like T and H)\n      // at the exact same millisecond, preventing double-renders.\n      this._debouncedNudgeRender();\n    }\n  };\n\n",
          "after": "    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;\n\n    this._pointCloudCalibration.keyUp(e.key);\n  };\n\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 6",
          "before": "    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\n\n    const step = this.state.nudgeStep * direction;\n    const bearingRad = (this._lastBearing * Math.PI) / 180;\n    const cosB = Math.cos(bearingRad);\n    const sinB = Math.sin(bearingRad);\n\n    if (axis === \"y\") {\n      // Forward / Backward\n      this._nudgeY += step * cosB;\n      this._nudgeX += step * sinB;\n    } else if (axis === \"x\") {\n      // Left / Right\n      this._nudgeY -= step * sinB;\n      this._nudgeX += step * cosB;\n    } else if (axis === \"z\") {\n      // Up / Down\n      this._nudgeZ += step;\n    }\n\n    // Show instant feedback toast\n    this.showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n        <Icons.Crosshair size={14} />\n        <b>Offset:</b> X:{this._nudgeX.toFixed(1)}m, Y:{this._nudgeY.toFixed(1)}m, Z:{this._nudgeZ.toFixed(1)}m\n      </span>,\n      1000,\n    );\n\n    // Instantly redraw the map\n    this._debouncedNudgeRender();\n  };\n\n  /**\n   * Instantly resets the cloud back to the ground and clears the X/Y drift offset.\n   */\n  private resetCalibration = () => {\n    this._nudgeX = 0;\n    this._nudgeY = 0;\n    this._nudgeZ = 0;\n    this.showToast(\"Cloud reset to Mapillary coordinates.\", 2000);\n    this.renderPointCloudMapLayer();\n  };\n\n",
          "after": "    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\n\n    this._pointCloudCalibration.joystick(axis, direction, () => {\n      // Show instant feedback toast\n      this.showToast(\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Crosshair size={14} />\n          <b>Offset:</b> X:{this._nudgeX.toFixed(1)}m, Y:{this._nudgeY.toFixed(1)}m, Z:{this._nudgeZ.toFixed(1)}m\n        </span>,\n        1000,\n      );\n    });\n  };\n\n  /**\n   * Reset east/north/up offsets and rebuild the map immediately; no terrain resampling.\n   */\n  private resetCalibration = () => {\n    this._pointCloudCalibration.reset(() => this.showToast(\"Cloud reset to Mapillary coordinates.\", 2000));\n  };\n\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 7",
          "before": "  };\n\n  // The debounced function to redraw the layer when you stop pressing keys\n  private _debouncedNudgeRender = debounceUtil(() => {\n    // Redraw Esri Map (this also calls drawConcentricRings internally,\n    // but we call it explicitly here too to clear stale rings immediately\n    // before the heavier layer rebuild finishes)\n    this.renderPointCloudMapLayer();\n    this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);\n\n    // Update colors in the viewer (in case they shifted up/down)\n    if (this._pointCloudViewerRenderer) {\n      this._pointCloudViewerRenderer.updateColors();\n      if (this.mapillaryViewer) this.mapillaryViewer.resize();\n    }\n  }, 150);\n\n  /** Bind the SceneView-only SDK constructor and live point/state adapters once. */\n",
          "after": "  };\n\n  /** Keep the original trailing 150 ms debounce and clearPointCloud cancellation boundary. */\n  private _debouncedNudgeRender = debounceUtil(() => this._pointCloudCalibration.commit(), 150);\n\n  /** Bind the SceneView-only SDK constructor and live point/state adapters once. */\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudCalibration"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudCalibration",
          "count": 3
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud calibration block 1",
          "before": "\n`tests/pointCloudMapPolicy.test.cjs` compares the original renderer/schema expressions with the new functions and verifies SDK mutation cannot contaminate subsequent metadata. Existing map/geometry comparisons execute the actual policy module with unchanged fixtures/assertions. Development checks assign results to the actual ArcGIS 4.33.12 renderer-property union and FeatureLayerProperties; map-owner algorithm tokens remain unchanged after normalizing the extracted schema call. Host validation still needs real map rendering/popups and layer reuse/replacement.\n",
          "after": "\n`tests/pointCloudMapPolicy.test.cjs` compares the original renderer/schema expressions with the new functions and verifies SDK mutation cannot contaminate subsequent metadata. Existing map/geometry comparisons execute the actual policy module with unchanged fixtures/assertions. Development checks assign results to the actual ArcGIS 4.33.12 renderer-property union and FeatureLayerProperties; map-owner algorithm tokens remain unchanged after normalizing the extracted schema call. Host validation still needs real map rendering/popups and layer reuse/replacement.\n\n## Calibration coordination\n\n`src/features/point-cloud/PointCloudCalibration.ts` contains keyboard/joystick movement math and commit ordering. The widget remains the authority for meter offsets, eligibility, feedback and its existing 150 ms trailing debounce. This separation adds no listeners, timers, cloud copies or SDK ownership.\n\nAccepted keyboard input accumulates without rendering until key release. Joystick input applies the UI step, emits feedback, then schedules. Reset emits feedback and rebuilds the map immediately without cancelling the previous pending debounce. A normal commit keeps map rebuild \u2192 explicit rings \u2192 viewer colors/resize order. Ground/color shortcuts and acquisition's same-cluster calibration preservation stay unchanged.\n\nContributors changing these callbacks must keep unit and ordering comments current and run `tests/pointCloudCalibration.test.cjs`. Its frozen baseline compares actual runtime handlers rather than a second implementation of the new coordinator. Clear/teardown continues cancelling the widget debounce; the coordinator has no disposal work.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudCalibration",
        "## Calibration coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudCalibration",
          "count": 1
        },
        {
          "text": "## Calibration coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud calibration block 1",
          "before": "Validation: 9 policy cases plus the existing 164 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/rings/playback cases (173 total). Policy outputs assign to actual ArcGIS 4.33.12 simple/unique-value renderer properties and FeatureLayerProperties; owner/runtime adapters pass strict TypeScript and full runtime TSX parses. Existing map/geometry tests verify SDK calls, confirmed IDs, edits, feature ordering and callbacks. Host smoke checks still need RGB/elevation, popup fields, hidden-layer carryover, ground filtering, crop/calibration and repeated clear/load/view switches.\n\nNext: centralize calibration input/update coordination (keyboard, joystick and reset), preserving nudge units, debounce timing and map/viewer update order. Keep export orchestration as its own later boundary, separate from format writers and worker lifetimes.\n",
          "after": "Validation: 9 policy cases plus the existing 164 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/rings/playback cases (173 total). Policy outputs assign to actual ArcGIS 4.33.12 simple/unique-value renderer properties and FeatureLayerProperties; owner/runtime adapters pass strict TypeScript and full runtime TSX parses. Existing map/geometry tests verify SDK calls, confirmed IDs, edits, feature ordering and callbacks. Host smoke checks still need RGB/elevation, popup fields, hidden-layer carryover, ground filtering, crop/calibration and repeated clear/load/view switches.\n\nCalibration input/update coordination is completed below with nudge units, debounce timing and map/viewer update order retained. Export orchestration remains a separate boundary from format writers and worker lifetimes.\n\n## Point-cloud calibration coordination\n\nExtracted accepted keyboard/joystick movement and map/rings/viewer commit order into `src/features/point-cloud/PointCloudCalibration.ts`, with function comments covering meters, live bearing, feedback timing, offset authority and timer ownership. Runtime keeps input eligibility, UI toasts, panel state, ground/color shortcuts and the original cancellable 150 ms debounce.\n\n`widget.tsx` now has 13720 lines (62 fewer). All 535 other existing class members are token-identical, including acquisition reset/preservation, export reads, geometry, teardown and keyboard listener wiring. Only the four input handlers and debounce delegation changed; a callback adapter binds live runtime state. No new resources or cached data are retained.\n\nChanged files: runtime widget; point-cloud contributor README; ownership document; this roadmap. Added: calibration coordinator, 16 differential regression cases, and immutable original-handler fixture. Validation: 189 regression cases across existing suites and new calibration cases; strict coordinator/runtime-boundary TypeScript; full runtime TSX parsing; guarded installer fixtures for conflicts, rollback, line endings, local edits, install/uninstall and installed tests. The checks do not replace Experience Builder smoke testing of keyboard/Shift, typing guards, joystick, reset, color/ground shortcuts and clearing during pending movement.\n\nNext: extract point-cloud export orchestration while preserving calibrated coordinate inputs, format writer selection, cancellation/error handling, downloads and existing UI feedback.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudCalibration",
        "## Point-cloud calibration coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudCalibration",
          "count": 1
        },
        {
          "text": "## Point-cloud calibration coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud calibration block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Calibration intent, picking, UI coordination and remaining feature adapters | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |\n| Discovery, cluster cache, decoding, worker and format utilities | `../../utils/pointCloudUtils.ts` |\n| Status, corridor, tools, calibration and export controls | Controlled components in this directory |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Calibration keyboard/joystick math and ordered commit callbacks | `PointCloudCalibration.ts` |\n| Picking, UI coordination and remaining feature adapters | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |\n| Discovery, cluster cache, decoding, worker and format utilities | `../../utils/pointCloudUtils.ts` |\n| Status, corridor, tools, calibration and export controls | Controlled components in this directory |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud calibration block 2",
          "before": "\nUse the same Node/TypeScript setup. The new immutable fixture contains the original renderer block and layer-property expression. Tests compare exact properties and popup bytes, visibility/mode fallback and fresh-object isolation. Existing map/geometry tests now bind the real policy module; their original fixtures and assertions remain intact. Strict SDK checks assign outputs to the actual simple/unique-value renderer and FeatureLayer property types. In Experience Builder check RGB/elevation, ground filtering, popup fields, hidden-layer reuse/replacement, crop/calibration and clear/load/view switching. No live GPU or performance claim follows from property recordings.\n",
          "after": "\nUse the same Node/TypeScript setup. The new immutable fixture contains the original renderer block and layer-property expression. Tests compare exact properties and popup bytes, visibility/mode fallback and fresh-object isolation. Existing map/geometry tests now bind the real policy module; their original fixtures and assertions remain intact. Strict SDK checks assign outputs to the actual simple/unique-value renderer and FeatureLayer property types. In Experience Builder check RGB/elevation, ground filtering, popup fields, hidden-layer reuse/replacement, crop/calibration and clear/load/view switching. No live GPU or performance claim follows from property recordings.\n\n## Calibration coordination\n\n`PointCloudCalibration.ts` handles accepted movement input and the commit sequence. The runtime guards cloud visibility/result readiness and input/textarea targets, displays existing toasts, and keeps the color/ground shortcuts and panel state. Callback comments document meter units, camera-relative directions and feedback timing.\n\n- `keyDown` updates live east/north/up offsets; T/G, F/H and R/V retain their 0.2 m or Shift 1 m steps. Key repeat does not redraw the map.\n- `keyUp` schedules the widget-owned trailing 150 ms debounce for movement keys only.\n- `joystick` uses the current UI step and viewer bearing; feedback runs synchronously before scheduling.\n- `reset` clears all three offsets, shows feedback and immediately rebuilds the map. It retains the existing pending-debounce behavior.\n- `commit` rebuilds the map, explicitly refreshes rings, then updates viewer colors and resizes when available. The map rebuild's own ring request remains intentional.\n\nOffsets remain widget-authoritative because geometry, exports, rings and viewer appearance read them live. The coordinator owns no state snapshots, event listeners, network work, SDK resources or timers. Keep the existing `clearPointCloud` debounce cancellation and keyboard listener removal in runtime teardown. Acquisition still resets offsets only when the existing same-cluster preservation rule requires it.\n\n`tests/pointCloudCalibration.test.cjs` compares actual runtime adapters with the immutable pre-extraction handlers, including exact offsets, toast elements, event prevention, 150 ms scheduling, release coalescing, reset and callback order. Run with `MAPILLARY_TYPESCRIPT` pointing to the host TypeScript module if it is not on the module path. Host checks: keyboard/Shift/typing, joystick steps, reset, RGB/elevation and ground shortcuts, and clear during a pending nudge.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudCalibration",
        "## Calibration coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudCalibration",
          "count": 2
        },
        {
          "text": "## Calibration coordination",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudCalibration.ts",
      "content": "/** World-space calibration offsets in meters: east, north, and up. No datum conversion. */\nexport interface PointCloudCalibrationOffset { x: number; y: number; z: number; }\nexport interface PointCloudCalibrationDependencies {\n  readOffsets(): PointCloudCalibrationOffset;\n  writeOffsets(offset: PointCloudCalibrationOffset): void;\n  /** Viewer bearing in degrees; read on each input, never retained across frames. */\n  readBearing(): number;\n  readStep(): number;\n  /** Borrow the widget's trailing debounce; the widget owns its 150 ms timer and cancellation. */\n  requestRender(): void;\n  renderMap(): void;\n  drawRings(): void;\n  updateViewer(): void;\n}\n\n/** Coordinates accepted calibration inputs without owning clouds, SDK resources, DOM events or timers.\n * The widget guards visibility, result readiness and typing targets before forwarding input.\n * Offsets remain authoritative in the widget because geometry, viewer and exports read them live.\n */\nexport class PointCloudCalibration {\n  constructor(private readonly dependencies: PointCloudCalibrationDependencies) {}\n\n  /** Accumulate T/G forward/back, F/H left/right and R/V vertical motion only.\n   * Keyboard steps are 0.2 m or 1 m with Shift. Rendering waits for key release.\n   * Keep the original operation order for coordinate precision and repeated-key behavior.\n   */\n  keyDown(key: string, shift: boolean): boolean {\n    const offset = this.dependencies.readOffsets();\n    const step = shift ? 1.0 : 0.2;\n    const bearingRad = (this.dependencies.readBearing() * Math.PI) / 180;\n    const cosB = Math.cos(bearingRad);\n    const sinB = Math.sin(bearingRad);\n    switch (key.toLowerCase()) {\n      case 't': offset.y += step * cosB; offset.x += step * sinB; break;\n      case 'g': offset.y -= step * cosB; offset.x -= step * sinB; break;\n      case 'f': offset.y += step * sinB; offset.x -= step * cosB; break;\n      case 'h': offset.y -= step * sinB; offset.x += step * cosB; break;\n      case 'r': offset.z += step; break;\n      case 'v': offset.z -= step; break;\n      default: return false;\n    }\n    this.dependencies.writeOffsets(offset);\n    return true;\n  }\n\n  /** Schedule only movement-key releases; simultaneous releases share the existing debounce. */\n  keyUp(key: string): void {\n    if (['t', 'f', 'h', 'g', 'r', 'v'].includes(key.toLowerCase())) this.dependencies.requestRender();\n  }\n\n  /** Apply the UI-selected meter step relative to live bearing, then feedback, then debounce.\n   * The feedback callback is synchronous so the toast still precedes render scheduling.\n   */\n  joystick(axis: 'x' | 'y' | 'z', direction: 1 | -1, feedback: () => void): void {\n    const offset = this.dependencies.readOffsets();\n    const step = this.dependencies.readStep() * direction;\n    const bearingRad = (this.dependencies.readBearing() * Math.PI) / 180;\n    const cosB = Math.cos(bearingRad);\n    const sinB = Math.sin(bearingRad);\n    if (axis === 'y') { offset.y += step * cosB; offset.x += step * sinB; }\n    else if (axis === 'x') { offset.y -= step * sinB; offset.x += step * cosB; }\n    else if (axis === 'z') offset.z += step;\n    this.dependencies.writeOffsets(offset);\n    feedback();\n    this.dependencies.requestRender();\n  }\n\n  /** Reset all offsets, notify, and rebuild the map immediately, as before.\n   * Does not cancel a pending debounce or add viewer updates; cleanup remains with the widget.\n   */\n  reset(feedback: () => void): void {\n    this.dependencies.writeOffsets({ x: 0, y: 0, z: 0 });\n    feedback();\n    this.dependencies.renderMap();\n  }\n\n  /** Commit using current state: map rebuild, explicit ring refresh, then viewer colors/resize.\n   * Map rebuild also requests rings; the explicit second refresh intentionally preserves timing.\n   */\n  commit(): void {\n    this.dependencies.renderMap();\n    this.dependencies.drawRings();\n    this.dependencies.updateViewer();\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudCalibration.test.cjs",
      "content": "/** Run original and extracted runtime handlers with identical input and a controlled trailing timer.\n * Compare offsets, feedback elements and side-effect ordering, including intentionally deferred work.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudCalibration.baseline.json','utf8'));\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudCalibration.ts','utf8')))(m,m.exports);\nconst sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');\nconst names=['_pointCloudCalibration','handleNudgeKeyDown','handleNudgeKeyUp','toggleCalibrationPanel','handleJoystickNudge','resetCalibration','_debouncedNudgeRender'];\nconst current=names.map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n');\nclass Input{}class Textarea{}\nfunction setup(kind){\n const trace=[],timers=[];const debounce=(fn,delay)=>{const f=()=>{trace.push(['schedule',delay]);f.pending=true};f.cancel=()=>{trace.push(['cancel']);f.pending=false};f.flush=()=>{if(f.pending){f.pending=false;fn()}};timers.push(f);return f};\n const React={createElement:(type,props,...children)=>({type:typeof type==='string'?type:'icon',props,children})};const Icons={Crosshair:()=>{},GroundGrid:()=>{}};\n const Harness=new Function('PointCloudCalibration','debounceUtil','React','Icons','HTMLInputElement','HTMLTextAreaElement','POINT_CLOUD_CONFIG',compile('class Widget{'+(kind==='baseline'?fixture.handlers+fixture.debounce:current)+'};return Widget;'))(m.exports.PointCloudCalibration,debounce,React,Icons,Input,Textarea,{GROUND_MODE_HEIGHT_M:1.5});\n const w=new Harness();w.state={pointCloudVisible:true,nudgeStep:.5,pointCloudLength:50,pointCloudActualLength:75,pointCloudColorMode:'rgb',showCalibrationPanel:false};w._pointCloudAcquisition={result:{id:'A'}};w._nudgeX=1.25;w._nudgeY=-2.75;w._nudgeZ=.3;w._lastBearing=30;w._groundMode=false;w._pointCloudMapLayer={layer:{}};w.showToast=(...args)=>trace.push(['toast',...args]);w.renderPointCloudMapLayer=()=>trace.push(['map',w._nudgeX,w._nudgeY,w._nudgeZ]);w.drawConcentricRings=n=>trace.push(['rings',n]);w.updatePointCloudDisplay=()=>trace.push(['display']);w._pointCloudViewerRenderer={updateColors:()=>trace.push(['colors'])};w.mapillaryViewer={resize:()=>trace.push(['resize']),getCenter:()=>Promise.resolve([.5,.5]),setCenter:c=>trace.push(['center',c])};w.setState=(updater,cb)=>{Object.assign(w.state,typeof updater==='function'?updater(w.state):updater);trace.push(['state',structuredClone(w.state)]);cb?.()};\n return {w,trace,timers,event:(key,extra={})=>({key,shiftKey:false,target:null,preventDefault:()=>trace.push(['prevent']),...extra}),flush:()=>timers[0].flush(),offset:()=>[w._nudgeX,w._nudgeY,w._nudgeZ]};\n}\nasync function compare(run){const a=setup('baseline'),b=setup('working');await run(a);await run(b);assert.deepEqual(b.offset(),a.offset());assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b}\ntest('all keyboard directions, case variants, Shift steps and bearings match exact baseline offsets/toasts',async()=>{for(const bearing of [-180,0,30,90,359.9])for(const key of ['t','g','f','h','r','v','T','H'])for(const shiftKey of [false,true])await compare(h=>{h.w._lastBearing=bearing;h.w.handleNudgeKeyDown(h.event(key,{shiftKey}));assert(!h.trace.some(x=>x[0]==='schedule'||x[0]==='map'))})});\ntest('repeated keydown accumulates but renders only after release and controlled debounce',async()=>{await compare(h=>{for(let i=0;i<20;i++)h.w.handleNudgeKeyDown(h.event('t'));h.w.handleNudgeKeyUp(h.event('t'));assert.equal(h.trace.at(-1)[0],'schedule');h.flush();assert.deepEqual(h.trace.slice(-4).map(x=>x[0]),['map','rings','colors','resize'])})});\ntest('two movement releases retain 150 ms trailing coalescing',async()=>{await compare(h=>{h.w.handleNudgeKeyDown(h.event('t'));h.w.handleNudgeKeyDown(h.event('h'));h.w.handleNudgeKeyUp(h.event('t'));h.w.handleNudgeKeyUp(h.event('h'));assert.equal(h.trace.filter(x=>x[0]==='schedule'&&x[1]===150).length,2);h.flush();h.flush();assert.equal(h.trace.filter(x=>x[0]==='map').length,1)})});\ntest('unrelated and color/ground key releases do not schedule movement renders',async()=>{for(const key of ['q','x','c','Shift','ArrowUp'])await compare(h=>{h.w.handleNudgeKeyUp(h.event(key));assert.equal(h.trace.length,0)})});\ntest('unrecognized keydown leaves offsets, feedback and scheduling untouched',async()=>{await compare(h=>{h.w.handleNudgeKeyDown(h.event('q'));assert.equal(h.trace.length,0)})});\ntest('typing in input or textarea suppresses keyboard down/up',async()=>{for(const target of [new Input(),new Textarea()])await compare(h=>{h.w.handleNudgeKeyDown(h.event('t',{target}));h.w.handleNudgeKeyUp(h.event('t',{target}));assert.equal(h.trace.length,0)})});\ntest('hidden or unavailable cloud guards all movement adapters',async()=>{for(const missing of ['visible','result'])await compare(h=>{if(missing==='visible')h.w.state.pointCloudVisible=false;else h.w._pointCloudAcquisition.result=null;h.w.handleNudgeKeyDown(h.event('t'));h.w.handleNudgeKeyUp(h.event('t'));h.w.handleJoystickNudge('x',1);assert.equal(h.trace.length,0)})});\ntest('every joystick axis/direction uses selected step and live bearing exactly',async()=>{for(const axis of ['x','y','z'])for(const direction of [-1,1])for(const bearing of [0,45,180,300])for(const step of [.1,.5,2])await compare(h=>{h.w._lastBearing=bearing;h.w.state.nudgeStep=step;h.w.handleJoystickNudge(axis,direction);assert.deepEqual(h.trace.map(x=>x[0]),['toast','schedule']);h.flush()})});\ntest('bearing and step changes are read on each input',async()=>{await compare(h=>{h.w.handleJoystickNudge('y',1);h.w._lastBearing=140;h.w.state.nudgeStep=3;h.w.handleJoystickNudge('x',-1);h.w.handleNudgeKeyDown(h.event('f'));h.flush()})});\ntest('reset zeroes offsets before feedback and immediately rebuilds map only',async()=>{await compare(h=>{h.w.resetCalibration();assert.deepEqual(h.offset(),[0,0,0]);assert.deepEqual(h.trace.map(x=>x[0]),['toast','map'])})});\ntest('reset retains original pending debounce and later reads reset offsets',async()=>{await compare(h=>{h.w.handleJoystickNudge('z',1);h.w.resetCalibration();h.flush();assert.deepEqual(h.trace.filter(x=>x[0]==='map').map(x=>x.slice(1)),[[0,0,0],[0,0,0]])})});\ntest('cancelled pending debounce performs no map/ring/viewer work',async()=>{await compare(h=>{h.w.handleJoystickNudge('x',1);h.timers[0].cancel();h.flush();assert(!h.trace.some(x=>x[0]==='map'))})});\ntest('commit uses live corridor extent and viewer availability at timer execution',async()=>{for(const mode of ['actual','no-renderer','no-viewer'])await compare(h=>{h.w.handleJoystickNudge('z',1);h.w.state.pointCloudLength=0;h.w.state.pointCloudActualLength=123;if(mode==='no-renderer')h.w._pointCloudViewerRenderer=null;if(mode==='no-viewer')h.w.mapillaryViewer=null;h.flush();assert(h.trace.some(x=>x[0]==='rings'&&x[1]===123))})});\ntest('color shortcut keeps state, toast, map and viewer ordering unchanged',async()=>{await compare(h=>{h.w.handleNudgeKeyDown(h.event('c'));h.w.handleNudgeKeyDown(h.event('C'));assert.equal(h.w.state.pointCloudColorMode,'rgb')})});\ntest('ground shortcut keeps color updates, asynchronous viewer refresh and preventDefault',async()=>{await compare(async h=>{h.w.handleNudgeKeyDown(h.event('x'));await Promise.resolve();assert.equal(h.w._groundMode,true)})});\ntest('calibration panel remains a state-only toggle',async()=>{await compare(h=>{h.w.toggleCalibrationPanel();h.w.toggleCalibrationPanel();assert.equal(h.w.state.showCalibrationPanel,false)})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudCalibration.baseline.json",
      "content": "{\n  \"handlers\": \"  private handleNudgeKeyDown = (e: KeyboardEvent) => {\\n    // Only allow nudging if the point cloud is currently visible\\n    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\\n\\n    // Ignore keystrokes if the user is typing in a text box\\n    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;\\n\\n    let handled = false;\\n    const step = e.shiftKey ? 1.0 : 0.2;\\n\\n    const bearingRad = (this._lastBearing * Math.PI) / 180;\\n    const cosB = Math.cos(bearingRad);\\n    const sinB = Math.sin(bearingRad);\\n\\n    switch (e.key.toLowerCase()) {\\n      case \\\"t\\\": // Move FORWARD\\n        this._nudgeY += step * cosB;\\n        this._nudgeX += step * sinB;\\n        handled = true;\\n        break;\\n\\n      case \\\"g\\\": // Move BACKWARD\\n        this._nudgeY -= step * cosB;\\n        this._nudgeX -= step * sinB;\\n        handled = true;\\n        break;\\n\\n      case \\\"f\\\": // Move LEFT\\n        this._nudgeY += step * sinB;\\n        this._nudgeX -= step * cosB;\\n        handled = true;\\n        break;\\n\\n      case \\\"h\\\": // Move RIGHT\\n        this._nudgeY -= step * sinB;\\n        this._nudgeX += step * cosB;\\n        handled = true;\\n        break;\\n\\n      case \\\"r\\\": // Move UP\\n        this._nudgeZ += step;\\n        handled = true;\\n        break;\\n      case \\\"v\\\": // Move DOWN\\n        this._nudgeZ -= step;\\n        handled = true;\\n        break;\\n\\n      // THE Z-SLICER (GROUND MODE)\\n      case \\\"x\\\":\\n        this._groundMode = !this._groundMode;\\n        if (this._pointCloudMapLayer?.layer) {\\n          // Instantly hide any point taller than 1.5 meters\\n          this.updatePointCloudDisplay();\\n        }\\n\\n        if (this._pointCloudViewerRenderer) {\\n          this._pointCloudViewerRenderer.updateColors();\\n\\n          // FORCE REDRAW: The microscopic camera hack instantly applies the visual change\\n          if (this.mapillaryViewer) {\\n            this.mapillaryViewer\\n              .getCenter()\\n              .then((c: number[]) => {\\n                this.mapillaryViewer.setCenter([c[0] + 0.000001, c[1]]);\\n              })\\n              .catch(() => {});\\n          }\\n        }\\n\\n        this.showToast(\\n          <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n            <Icons.GroundGrid size={14} />\\n            <b>Ground Mode:</b> {this._groundMode ? `ON (Buildings > ${POINT_CLOUD_CONFIG.GROUND_MODE_HEIGHT_M}m Hidden)` : \\\"OFF (Full Cloud)\\\"}\\n          </span>,\\n          3000,\\n        );\\n        e.preventDefault();\\n        return;\\n\\n      case \\\"c\\\":\\n        this.setState(\\n          (prev) => ({\\n            pointCloudColorMode: prev.pointCloudColorMode === \\\"rgb\\\" ? \\\"elevation\\\" : \\\"rgb\\\",\\n          }),\\n          () => {\\n            this.showToast(\\n              <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n                <b>Color Mode:</b> {this.state.pointCloudColorMode === \\\"elevation\\\" ? \\\"Elevation Heatmap\\\" : \\\"True RGB\\\"}\\n              </span>,\\n              3000,\\n            );\\n\\n            // 1. Redraw Esri Map\\n            this.renderPointCloudMapLayer();\\n\\n            // 2. Redraw Mapillary Viewer\\n            if (this._pointCloudViewerRenderer) {\\n              this._pointCloudViewerRenderer.updateColors();\\n              if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n            }\\n          },\\n        );\\n        e.preventDefault();\\n        return;\\n    }\\n\\n    if (handled) {\\n      e.preventDefault();\\n      this.showToast(\\n        <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n          <Icons.Crosshair size={14} />\\n          <b>Total Offset:</b>\\n          {Math.abs(this._nudgeX).toFixed(1)}m {this._nudgeX > 0 ? \\\"E\\\" : \\\"W\\\"},{Math.abs(this._nudgeY).toFixed(1)}m {this._nudgeY > 0 ? \\\"N\\\" : \\\"S\\\"}\\n          {Math.abs(this._nudgeZ).toFixed(1)}m {this._nudgeZ > 0 ? \\\"Up\\\" : \\\"Dn\\\"}\\n        </span>,\\n        1000,\\n      );\\n    }\\n  };\\n\\n  /**\\n   * 2. KEY UP: Triggers the actual map redraw ONLY when the user releases the key.\\n   */\\n  private handleNudgeKeyUp = (e: KeyboardEvent) => {\\n    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\\n    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;\\n\\n    const key = e.key.toLowerCase();\\n\\n    // If they released T, F, G, H, R or V apply the final location to the map!\\n    if ([\\\"t\\\", \\\"f\\\", \\\"h\\\", \\\"g\\\", \\\"r\\\", \\\"v\\\"].includes(key)) {\\n      // We use the debounced version just in case they release two keys (like T and H)\\n      // at the exact same millisecond, preventing double-renders.\\n      this._debouncedNudgeRender();\\n    }\\n  };\\n\\n  /**\\n   * Toggles the Calibration UI Panel\\n   */\\n  private toggleCalibrationPanel = () => {\\n    this.setState((prev) => ({ showCalibrationPanel: !prev.showCalibrationPanel }));\\n  };\\n\\n  /**\\n   * Triggers when the user clicks an on-screen Joystick Arrow.\\n   * Maps directional clicks to the camera's current viewing angle.\\n   */\\n  private handleJoystickNudge = (axis: \\\"x\\\" | \\\"y\\\" | \\\"z\\\", direction: 1 | -1) => {\\n    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\\n\\n    const step = this.state.nudgeStep * direction;\\n    const bearingRad = (this._lastBearing * Math.PI) / 180;\\n    const cosB = Math.cos(bearingRad);\\n    const sinB = Math.sin(bearingRad);\\n\\n    if (axis === \\\"y\\\") {\\n      // Forward / Backward\\n      this._nudgeY += step * cosB;\\n      this._nudgeX += step * sinB;\\n    } else if (axis === \\\"x\\\") {\\n      // Left / Right\\n      this._nudgeY -= step * sinB;\\n      this._nudgeX += step * cosB;\\n    } else if (axis === \\\"z\\\") {\\n      // Up / Down\\n      this._nudgeZ += step;\\n    }\\n\\n    // Show instant feedback toast\\n    this.showToast(\\n      <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n        <Icons.Crosshair size={14} />\\n        <b>Offset:</b> X:{this._nudgeX.toFixed(1)}m, Y:{this._nudgeY.toFixed(1)}m, Z:{this._nudgeZ.toFixed(1)}m\\n      </span>,\\n      1000,\\n    );\\n\\n    // Instantly redraw the map\\n    this._debouncedNudgeRender();\\n  };\\n\\n  /**\\n   * Instantly resets the cloud back to the ground and clears the X/Y drift offset.\\n   */\\n  private resetCalibration = () => {\\n    this._nudgeX = 0;\\n    this._nudgeY = 0;\\n    this._nudgeZ = 0;\\n    this.showToast(\\\"Cloud reset to Mapillary coordinates.\\\", 2000);\\n    this.renderPointCloudMapLayer();\\n  };\\n\\n\",\n  \"debounce\": \"  private _debouncedNudgeRender = debounceUtil(() => {\\n    // Redraw Esri Map (this also calls drawConcentricRings internally,\\n    // but we call it explicitly here too to clear stale rings immediately\\n    // before the heavier layer rebuild finishes)\\n    this.renderPointCloudMapLayer();\\n    this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);\\n\\n    // Update colors in the viewer (in case they shifted up/down)\\n    if (this._pointCloudViewerRenderer) {\\n      this._pointCloudViewerRenderer.updateColors();\\n      if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n    }\\n  }, 150);\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-calibration-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-calibration.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited calibration references remain)');
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
    console.log(uninstall ? 'Point-cloud calibration is already uninstalled. No files changed.' : 'Point-cloud calibration is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-calibration', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud calibration ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Calibration inputs and ordered render callbacks now have one documented coordinator. Offsets, input guards, 150 ms debounce and UI feedback are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
