#!/usr/bin/env node
'use strict';
/** Point-cloud map policy installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud map policy block 1",
          "before": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\n",
          "after": "import { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\nimport { PointCloudViewshed } from '../features/point-cloud/PointCloudViewshed';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud map policy block 2",
          "before": "\n  /** Bind scene SDK operations and current UI callbacks once for this widget.\n   * Plain feature properties cross the SDK boundary only in applyEdits. Crop/color\n   * calculations and stable original-point ordering stay in the render adapter.\n   */\n  private ensurePointCloudMapLayerOwner() {\n",
          "after": "\n  /** Bind scene SDK operations and current UI callbacks once for this widget.\n   * Plain feature properties cross the SDK boundary only in applyEdits. Geometry and\n   * display policy come from feature helpers; this adapter keeps UI/SDK callback order.\n   */\n  private ensurePointCloudMapLayerOwner() {\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud map policy block 3",
          "before": "    });\n\n    const uniqueValueInfos = colors.map((hex) => ({\n      value: hex,\n      symbol: {\n        type: \"point-3d\",\n        symbolLayers: [\n          {\n            type: \"icon\",\n            resource: { primitive: \"circle\" },\n            material: { color: hex },\n            size: 2.0,\n            outline: { size: 0 },\n          },\n        ],\n      },\n    }));\n\n    // Construct renderer based on selected color mode\n    let activeRenderer: __esri.Renderer;\n\n    if (this.state.pointCloudColorMode === \"elevation\") {\n      activeRenderer = {\n        type: \"simple\",\n        symbol: {\n          type: \"point-3d\",\n          symbolLayers: [\n            {\n              type: \"icon\",\n              resource: { primitive: \"circle\" },\n              material: { color: \"white\" },\n              size: 2.0,\n              outline: { size: 0 },\n            },\n          ],\n        },\n        visualVariables: [\n          {\n            type: \"color\",\n            field: \"relativeHeight\",\n            stops: [\n              { value: -0.5, color: \"#0000FF\" },\n              { value: 0.0, color: \"#00FFFF\" },\n              { value: 2.5, color: \"#00FF00\" },\n              { value: 7.0, color: \"#FFFF00\" },\n              { value: 15.0, color: \"#FF0000\" },\n            ],\n          },\n        ],\n      } as any;\n    } else {\n      activeRenderer = {\n        type: \"unique-value\",\n        field: \"colorCode\",\n        uniqueValueInfos: uniqueValueInfos,\n      } as any;\n    }\n\n    owner.update({ request: renderRequest, view, result, features, renderer: activeRenderer, silent,\n",
          "after": "    });\n\n    const activeRenderer = pointCloudMapRenderer(this.state.pointCloudColorMode, colors);\n\n    owner.update({ request: renderRequest, view, result, features, renderer: activeRenderer, silent,\n"
        }
      ],
      "absentAfterUninstall": [
        "pointCloudMapRenderer"
      ],
      "requiredOccurrences": [
        {
          "text": "pointCloudMapRenderer",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/point-cloud/PointCloudMapLayer.ts",
      "blocks": [
        {
          "label": "src/features/point-cloud/PointCloudMapLayer.ts point-cloud map policy block 1",
          "before": "import type { PointCloudFeature } from '../../utils/pointCloudUtils';\n\n",
          "after": "import { pointCloudMapLayerProperties } from './pointCloudMapPolicy';\nimport type { PointCloudFeature } from '../../utils/pointCloudUtils';\n\n"
        },
        {
          "label": "src/features/point-cloud/PointCloudMapLayer.ts point-cloud map policy block 2",
          "before": "\n/** Owns scene-layer identity, serialized SDK edits and confirmed point-ID maps.\n * Runtime prepares the same crop/renderer policy and owns adaptive watchers, rings,\n * lasso intent, acquisition and viewer rendering. This owner adds no requests or\n * independent scheduling: the existing zero-delay yield remains one per edit chunk.\n */\n",
          "after": "\n/** Owns scene-layer identity, serialized SDK edits and confirmed point-ID maps.\n * Geometry and display policy are prepared by separate feature helpers. Adaptive,\n * ring, acquisition and viewer resources have independent owners. This owner adds no requests or\n * independent scheduling: the existing zero-delay yield remains one per edit chunk.\n */\n"
        },
        {
          "label": "src/features/point-cloud/PointCloudMapLayer.ts point-cloud map policy block 3",
          "before": "    // 1. Initialize layer completely EMPTY to prevent UI lockup\n    const reuse = this.currentLayer && !this.currentLayer.destroyed && this.currentResult === result && this.currentView === view;\n    const layer: L = reuse ? this.currentLayer as L : this.dependencies.createLayer({\n      id: \"point-cloud-layer\", legendEnabled: false, title: \"Mapillary Point Cloud\", visible: this.currentLayer?.visible ?? true,\n      source: [],\n      objectIdField: \"ObjectID\",\n      geometryType: \"point\",\n      hasZ: true,\n      spatialReference: { wkid: 4326 },\n      elevationInfo: { mode: \"relative-to-ground\", offset: 0.5 },\n      fields: [\n        { name: \"ObjectID\", type: \"oid\" },\n        { name: \"pointIndex\", type: \"integer\" },\n        { name: \"originalIndex\", type: \"integer\" },\n        { name: \"colorCode\", type: \"string\", alias: \"Hex Color\" },\n        { name: \"relativeHeight\", type: \"double\", alias: \"Height Above Road (m)\" },\n        { name: \"absoluteAltitude\", type: \"double\", alias: \"Sea-level Altitude (m)\" },\n        { name: \"distanceFromCamera\", type: \"double\", alias: \"Distance from Car (m)\" },\n      ],\n      outFields: [\"*\"],\n      popupEnabled: true,\n      popupTemplate: {\n        title: \"Point Cloud Node\",\n        content: `\n                    <div style=\"font-size: 13px; line-height: 1.5;\">\n                        <b>Horizontal Distance:</b> {distanceFromCamera} m<br/>\n                        <span style=\"font-size: 10px; color: #888; display: block; margin-top: -4px; margin-bottom: 4px;\">\n                            (From camera GPS origin)\n                        </span>\n                        <b>Height Above Road:</b> {relativeHeight} m<br/>\n                        <b>Absolute Altitude:</b> {absoluteAltitude} m<br/>\n                        <span style=\"display:none;\">{originalIndex}</span>\n                    </div>\n                `,\n      },\n      renderer: activeRenderer,\n      definitionExpression: input.definitionExpression,\n    });\n\n    layer.legendEnabled = false;\n",
          "after": "    // 1. Initialize layer completely EMPTY to prevent UI lockup\n    const reuse = this.currentLayer && !this.currentLayer.destroyed && this.currentResult === result && this.currentView === view;\n    const layer: L = reuse ? this.currentLayer as L : this.dependencies.createLayer(pointCloudMapLayerProperties(activeRenderer, input.definitionExpression, this.currentLayer?.visible));\n\n    layer.legendEnabled = false;\n"
        }
      ],
      "absentAfterUninstall": [
        "pointCloudMapLayerProperties"
      ],
      "requiredOccurrences": [
        {
          "text": "pointCloudMapLayerProperties",
          "count": 2
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud map policy block 1",
          "before": "| Viewshed pending observer creation, fixed policy and original collection cleanup | `src/features/point-cloud/PointCloudViewshed.ts` |\n| Ring/grid layer, shared readiness, ellipse/label geometry and creating-map cleanup | `src/features/point-cloud/PointCloudRings.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n",
          "after": "| Viewshed pending observer creation, fixed policy and original collection cleanup | `src/features/point-cloud/PointCloudViewshed.ts` |\n| Ring/grid layer, shared readiness, ellipse/label geometry and creating-map cleanup | `src/features/point-cloud/PointCloudRings.ts` |\n| Map renderer, layer/schema/popup properties | `src/features/point-cloud/pointCloudMapPolicy.ts` |\n| Status, corridor, tools, calibration, export and elevation-key presentation | Controlled components under `src/features/point-cloud/` |\n\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud map policy block 2",
          "before": "## Scene-layer edit owner\n\n`PointCloudMapLayer.ts` owns layer/result/view identity, the edit promise chain, confirmed features, original-point-to-viewer indices and viewer-to-ObjectID lookup. The runtime now uses `pointCloudGeometry.ts` for crop geometry, calibrated heights and popup attribute values; RGB/elevation renderer policy remains in the runtime adapter. No point acquisition, worker, viewer rendering, adaptive watcher or ring layer moves into this owner.\n\n`beginUpdate()` marks map picking busy before feature preparation. `update()` reuses only a live layer for the identical result object and creating view. A replacement retains visibility and removes/destroys the original layer before attaching the new one. The source stays initially empty. Summary notification and adaptive-display application retain their previous ordering.\n",
          "after": "## Scene-layer edit owner\n\n`PointCloudMapLayer.ts` owns layer/result/view identity, the edit promise chain, confirmed features, original-point-to-viewer indices and viewer-to-ObjectID lookup. The runtime now uses `pointCloudGeometry.ts` for crop geometry, calibrated heights and popup attribute values; RGB/elevation renderer and schema/popup policy now live in `pointCloudMapPolicy.ts`. No point acquisition, worker, viewer rendering, adaptive watcher or ring layer moves into this owner.\n\n`beginUpdate()` marks map picking busy before feature preparation. `update()` reuses only a live layer for the identical result object and creating view. A replacement retains visibility and removes/destroys the original layer before attaching the new one. The source stays initially empty. Summary notification and adaptive-display application retain their previous ordering.\n"
        },
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud map policy block 3",
          "before": "\n`tests/pointCloudRings.test.cjs` records exact old/new SDK properties, geometry, labels and operation order, including readiness/coalescing and post-load state reads. Separate cases cover stale work, context replacement, partial attachment, constructor changes and cleanup failures. The immutable map regression fixture retains its clear/order assertions through a test-only owner bridge. Strict checks use the actual ArcGIS 4.33.12 factory boundary; live terrain/scene rendering remains a host check.\n",
          "after": "\n`tests/pointCloudRings.test.cjs` records exact old/new SDK properties, geometry, labels and operation order, including readiness/coalescing and post-load state reads. Separate cases cover stale work, context replacement, partial attachment, constructor changes and cleanup failures. The immutable map regression fixture retains its clear/order assertions through a test-only owner bridge. Strict checks use the actual ArcGIS 4.33.12 factory boundary; live terrain/scene rendering remains a host check.\n\n## Map display policy\n\n`pointCloudMapPolicy.ts` owns plain RGB/elevation renderer properties and layer schema/popup construction. Its typed functions introduce no SDK instances, scheduling, requests or state ownership. Runtime prepares geometry, requests the renderer and forwards the existing update. `PointCloudMapLayer` calls the schema builder only in the new-layer branch; reuse, original-view teardown, confirmed ID maps and serialized edit behavior are unchanged.\n\nRenderer colors retain input order, including the existing fallback for every mode except `elevation`. Point size/outline/material, relativeHeight color stops, legend settings and schema/popup values are preserved. Metadata arrays/objects are fresh per call for SDK autocasting; the renderer is passed by reference, as before. Existing field aliases and popup wording/whitespace remain exact; they do not introduce altitude-datum guarantees.\n\nThe schema still creates an empty source, WGS84 point geometry with z, relative-to-ground offset 0.5, the same field/ID casing, outFields and popup template. Visibility carries false across layer replacement and defaults nullish values to true. Geometry preparation, adaptive/ground expressions and edit reconciliation stay with their existing helpers/owners.\n\n`tests/pointCloudMapPolicy.test.cjs` compares the original renderer/schema expressions with the new functions and verifies SDK mutation cannot contaminate subsequent metadata. Existing map/geometry comparisons execute the actual policy module with unchanged fixtures/assertions. Development checks assign results to the actual ArcGIS 4.33.12 renderer-property union and FeatureLayerProperties; map-owner algorithm tokens remain unchanged after normalizing the extracted schema call. Host validation still needs real map rendering/popups and layer reuse/replacement.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Map display policy"
      ],
      "requiredOccurrences": [
        {
          "text": "## Map display policy",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud map policy block 1",
          "before": "Validation: 16 ring cases plus the existing 148 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/playback cases (164 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover exact vertices/labels/colors, intervals/fallbacks, latitude/rotation/calibration, duplicate draws, shared readiness/live state, clear/replacement, errors/retry, constructor-side replacement and original-map cleanup. Host smoke checks still need terrain placement, crop/calibration, repeated clear/load, map switches and close/reopen.\n\nNext: move point-cloud map renderer/schema policy into a documented feature module while retaining geometry, confirmed-ID ownership and SDK edit order. Then review calibration/export coordination for a separate cohesive boundary. Prefer explicit contributor entry points over a generic catch-all controller.\n",
          "after": "Validation: 16 ring cases plus the existing 148 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/playback cases (164 total). The owner and actual runtime SDK factory pass strict TypeScript against ArcGIS 4.33.12; full runtime TSX parses. Tests cover exact vertices/labels/colors, intervals/fallbacks, latitude/rotation/calibration, duplicate draws, shared readiness/live state, clear/replacement, errors/retry, constructor-side replacement and original-map cleanup. Host smoke checks still need terrain placement, crop/calibration, repeated clear/load, map switches and close/reopen.\n\nMap renderer/schema policy is completed below with geometry, confirmed-ID ownership and SDK edit order retained. Then review calibration/export coordination for a separate cohesive boundary. Prefer explicit contributor entry points over a generic catch-all controller.\n\n## Point-cloud map display policy\n\n`pointCloudMapPolicy.ts` now contains typed plain-property builders for RGB/elevation renderer policy and the empty-source layer schema/popup. Runtime retains geometry/update orchestration; `PointCloudMapLayer` retains resource lifetime, confirmed-ID authority and serialized edits. The schema builder runs only for new layers, and renderer identity remains borrowed.\n\nSymbols, color stops/order, mode fallback, source/fields, ID casing, aliases, popup bytes, legend settings, visibility carryover, spatial reference and height policy are unchanged. Fresh nested metadata preserves SDK autocasting without shared mutable state. Function comments document borrowed renderer identity, new-layer allocation, unknown-mode/visibility fallback and separation from geometry/adaptive/ground policy. No UI, lifecycle, request, scheduling or edit-order change is included.\n\nRuntime shrinks by 53 lines to 13,782; the map owner shrinks by 34 lines. Another 292 runtime method/callback bodies remain token-identical. Map-owner tokens are identical after replacing the extracted metadata expression with its helper call, preserving lifecycle, chunks, queue, confirmations and callback order.\n\n| File | Change |\n| --- | --- |\n| `src/runtime/widget.tsx` | Typed renderer-policy call in existing render adapter |\n| `src/features/point-cloud/PointCloudMapLayer.ts` | Schema-builder call only in new-layer branch |\n| `src/features/point-cloud/pointCloudMapPolicy.ts` | Typed plain renderer, schema and popup properties |\n| `src/features/point-cloud/README.md` | Policy contributor entry point and verification |\n| `docs/POINT-CLOUD-OWNERSHIP.md` | Display policy versus geometry/resource ownership |\n| `docs/REFACTORING-ROADMAP.md` | Completed boundary and next feature work |\n| `tests/pointCloudMapPolicy.test.cjs` | Exact baseline properties, popup bytes and object-isolation checks |\n| `tests/fixtures/pointCloudMapPolicy.baseline.json` | Immutable pre-extraction renderer/schema expressions |\n| `tests/pointCloudMapLayer.test.cjs` | Bind actual policy module; existing assertions/fixture unchanged |\n| `tests/pointCloudGeometry.test.cjs` | Bind actual renderer helper; existing assertions/fixture unchanged |\n\nValidation: 9 policy cases plus the existing 164 geometry/acquisition/map/viewer/measurement/lasso/sight/viewshed/rings/playback cases (173 total). Policy outputs assign to actual ArcGIS 4.33.12 simple/unique-value renderer properties and FeatureLayerProperties; owner/runtime adapters pass strict TypeScript and full runtime TSX parses. Existing map/geometry tests verify SDK calls, confirmed IDs, edits, feature ordering and callbacks. Host smoke checks still need RGB/elevation, popup fields, hidden-layer carryover, ground filtering, crop/calibration and repeated clear/load/view switches.\n\nNext: centralize calibration input/update coordination (keyboard, joystick and reset), preserving nudge units, debounce timing and map/viewer update order. Keep export orchestration as its own later boundary, separate from format writers and worker lifetimes.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Point-cloud map display policy"
      ],
      "requiredOccurrences": [
        {
          "text": "## Point-cloud map display policy",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud map policy block 1",
          "before": "| Viewshed observer policy, pending click and original-analysis collection lifetime | `PointCloudViewshed.ts` |\n| Distance-ring layer/readiness, ellipse geometry and labels | `PointCloudRings.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Renderer policy, calibration intent, picking, UI coordination and remaining geometry tools | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |\n| Discovery, cluster cache, decoding, worker and format utilities | `../../utils/pointCloudUtils.ts` |\n| Status, corridor, tools, calibration and export controls | Controlled components in this directory |\n",
          "after": "| Viewshed observer policy, pending click and original-analysis collection lifetime | `PointCloudViewshed.ts` |\n| Distance-ring layer/readiness, ellipse geometry and labels | `PointCloudRings.ts` |\n| Map RGB/elevation renderer, layer schema and popup policy | `pointCloudMapPolicy.ts` |\n| Map movement watcher and settle timer | `PointCloudAdaptiveDisplay.ts` |\n| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Calibration intent, picking, UI coordination and remaining feature adapters | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |\n| Discovery, cluster cache, decoding, worker and format utilities | `../../utils/pointCloudUtils.ts` |\n| Status, corridor, tools, calibration and export controls | Controlled components in this directory |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud map policy block 2",
          "before": "## Scene-layer owner\n\n`PointCloudMapLayer` owns one layer/result/view identity and its SDK edit queue. Bind the SDK factory, `applyEdits`, live view reader, existing diff policy, yield function and UI notifications once. Runtime calls `pointCloudGeometry.ts` and prepares renderer policy before forwarding an update; the owner does not read React state or modify crop policy.\n\n- `beginUpdate()` sets busy state before synchronous feature preparation and returns a generation token.\n",
          "after": "## Scene-layer owner\n\n`PointCloudMapLayer` owns one layer/result/view identity and its SDK edit queue. Bind the SDK factory, `applyEdits`, live view reader, existing diff policy, yield function and UI notifications once. Runtime calls `pointCloudGeometry.ts` and `pointCloudMapPolicy.ts` before forwarding an update; the owner does not read React state or modify crop policy.\n\n- `beginUpdate()` sets busy state before synchronous feature preparation and returns a generation token.\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud map policy block 3",
          "before": "## Geometry calculations\n\nUse `pointCloudGeometry.ts` for pure numerical preparation shared by initial load, map rendering and crop controls. Keep UI state, SDK constructors/edits and viewer refreshes in their adapters.\n\n- `pointCloudCorridorBasis(bearingDegrees)` captures clockwise-from-north street axes once, at the caller's existing state/callback timing.\n",
          "after": "## Geometry calculations\n\nUse `pointCloudGeometry.ts` for pure numerical preparation shared by initial load, map rendering and crop controls. Keep UI state, SDK constructors/edits and viewer refreshes in their adapters; map display metadata belongs to `pointCloudMapPolicy.ts`.\n\n- `pointCloudCorridorBasis(bearingDegrees)` captures clockwise-from-north street axes once, at the caller's existing state/callback timing.\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud map policy block 4",
          "before": "\nUse the existing Node/TypeScript setup. Tests compare exact old/new layer properties, graphic/vertex/label values, bearing reads, readiness/coalescing and live-state read timing. Held module loads cover clear, context replacement, failures/retry and cleanup. The map test uses a test-only bridge for its original ring fixture; its original teardown assertions remain intact, while the ring suite exercises the real owner. In Experience Builder check initial cloud load, crop controls, calibration, long/narrow/full dimensions, repeated clear/load, map switches and widget close/reopen. Recordings cannot establish actual terrain placement or browser frame rate.\n",
          "after": "\nUse the existing Node/TypeScript setup. Tests compare exact old/new layer properties, graphic/vertex/label values, bearing reads, readiness/coalescing and live-state read timing. Held module loads cover clear, context replacement, failures/retry and cleanup. The map test uses a test-only bridge for its original ring fixture; its original teardown assertions remain intact, while the ring suite exercises the real owner. In Experience Builder check initial cloud load, crop controls, calibration, long/narrow/full dimensions, repeated clear/load, map switches and widget close/reopen. Recordings cannot establish actual terrain placement or browser frame rate.\n\n## Map display policy\n\n`pointCloudMapPolicy.ts` is the contributor entry point for the point-cloud map renderer, empty-source layer schema and popup content. It produces plain typed properties without creating SDK resources, reading React state, loading modules or editing geometry. `PointCloudMapLayer` retains resource identity, visibility carryover, ID authority and its edit queue; runtime retains the existing preparation/callback order.\n\n- `pointCloudMapRenderer(colorMode, colors)` returns fresh RGB unique-value or elevation color-variable properties. Only `elevation` selects the existing relative-height stops; all other values retain the RGB fallback. Colors retain supplied order. Point symbols, sizes, outlines and thresholds are unchanged.\n- `pointCloudMapLayerProperties(renderer, definitionExpression, previousVisible)` returns fresh schema/popup/source metadata only when the owner needs a new layer. False visibility is preserved; nullish visibility defaults to true. Renderer identity is borrowed, not cloned.\n\nFresh mutable nested objects preserve SDK autocasting without sharing metadata between layers. Field names/types/aliases, ObjectID casing, popup whitespace/text/placeholders, legend policy, WGS84 and relative-ground height settings remain exact. Existing altitude labels are retained; this structural extraction does not change source datums or convert heights. Geometry quantization, adaptive sampling/ground expressions and SDK edits remain separate responsibilities.\n\n```sh\nnode tests/pointCloudMapPolicy.test.cjs\nnode tests/pointCloudMapLayer.test.cjs\nnode tests/pointCloudGeometry.test.cjs\n```\n\nUse the same Node/TypeScript setup. The new immutable fixture contains the original renderer block and layer-property expression. Tests compare exact properties and popup bytes, visibility/mode fallback and fresh-object isolation. Existing map/geometry tests now bind the real policy module; their original fixtures and assertions remain intact. Strict SDK checks assign outputs to the actual simple/unique-value renderer and FeatureLayer property types. In Experience Builder check RGB/elevation, ground filtering, popup fields, hidden-layer reuse/replacement, crop/calibration and clear/load/view switching. No live GPU or performance claim follows from property recordings.\n"
        }
      ],
      "absentAfterUninstall": [
        "pointCloudMapRenderer",
        "pointCloudMapLayerProperties",
        "## Map display policy"
      ],
      "requiredOccurrences": [
        {
          "text": "pointCloudMapRenderer",
          "count": 1
        },
        {
          "text": "pointCloudMapLayerProperties",
          "count": 1
        },
        {
          "text": "## Map display policy",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/pointCloudMapLayer.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudMapLayer.test.cjs point-cloud map policy block 1",
          "before": "const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/pointCloudMapLayer.baseline.json'),'utf8'));\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudMapLayer.ts','utf8')))(m,m.exports);const {PointCloudMapLayer}=m.exports;\nfunction methods(folder,names){const source=ts.createSourceFile('widget.tsx',folder==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return names.map(name=>widget.members.find(n=>n.name?.getText(source)===name).getText(source)).join('\\n')}\nfunction util(file,names,prefix=''){const source=ts.createSourceFile(file,fs.readFileSync(root+'/src/utils/'+file,'utf8'),ts.ScriptTarget.Latest,true);const code=names.map(name=>source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text===name).getText(source).replace(/^export /,''));return new Function(compile(prefix+code.join('\\n')+';return {'+names.join(',')+'};'))()}\nconst funcs=util('pointCloudUtils.ts',['diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud'],'const corridorIndexes = new WeakMap();\\n');const geo=util('geoUtils.ts',['distanceMeters']);\nconst geometry={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?geo:funcs,geometry,geometry.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudMapLayer','diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud','distanceMeters','POINT_CLOUD_CONFIG','setTimeout','geometry',compile('const {preparePointCloudMapGeometry,pointCloudCorridorBasis}=geometry; class Harness {'+methods(kind,kind==='working'?['ensurePointCloudMapLayerOwner','renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud']:['renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud'])+'};return Harness;'));\nconst copy=x=>structuredClone(x),tick=()=>new Promise(r=>setImmediate(r));async function until(f){for(let i=0;i<50;i++){if(f())return;await tick()}throw Error('Timed out')}\nfunction setup(kind,{count=12,manual=false,points, state={}}={}){\n const trace=[],layers=[],calls=[],views=[];let h;\n class Layer{constructor(properties){Object.assign(this,properties);this.destroyed=false;this.data=new Map();this.next=1000;this.number=layers.length;layers.push(this);trace.push(['create',copy(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.number])}applyEdits(edits){trace.push(['edits',this.number,copy(edits)]);let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});const call={edits,layer:this,resolve,reject,finish:(custom)=>{const results={};for(const [kind,features]of Object.entries(edits)){const confirmations=[];for(let i=0;i<features.length;i++){const f=features[i],confirmation=custom?custom(f,i,kind):{objectId:kind==='addFeatures'?++this.next:f.attributes.ObjectID};confirmations.push(confirmation);if(confirmation&&!confirmation.error&&Number.isFinite(confirmation.objectId)){if(kind==='deleteFeatures')this.data.delete(f.attributes.ObjectID);else this.data.set(confirmation.objectId,{...copy(f),attributes:{...copy(f.attributes),ObjectID:confirmation.objectId}})}}results[kind==='deleteFeatures'?'deleteFeatureResults':kind==='updateFeatures'?'updateFeatureResults':'addFeatureResults']=confirmations}resolve(results)}};calls.push(call);if(!manual)call.finish();return promise}}\n const Harness=classes[kind](PointCloudMapLayer,funcs.diffPointCloudFeatures,funcs.pointCloudCandidates,funcs.summarizePointCloud,geo.distanceMeters,{GROUND_MODE_HEIGHT_M:1.5},(fn,ms)=>{trace.push(['yield',ms]);queueMicrotask(fn);return 1},geometry.exports);\n function view(){const v={destroyed:false,map:{add(layer){trace.push(['add',views.indexOf(v),layer.number])},remove(layer){trace.push(['remove',views.indexOf(v),layer.number])}}};views.push(v);return v}\n const w=new Harness();const pts=points||Array.from({length:count},(_,i)=>({lon:i/100000,lat:i/200000,rawLon:i/100000+.001,rawLat:i/200000+.001,alt:i/10,r:i%2?.5:80,g:i%2?.25:90,b:i%2?1:100}));\n",
          "after": "const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/pointCloudMapLayer.baseline.json'),'utf8'));\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst policy={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(policy,policy.exports);\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudMapLayer.ts','utf8')))(id=>{assert.equal(id,'./pointCloudMapPolicy');return policy.exports},m,m.exports);const {PointCloudMapLayer}=m.exports;\nfunction methods(folder,names){const source=ts.createSourceFile('widget.tsx',folder==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return names.map(name=>widget.members.find(n=>n.name?.getText(source)===name).getText(source)).join('\\n')}\nfunction util(file,names,prefix=''){const source=ts.createSourceFile(file,fs.readFileSync(root+'/src/utils/'+file,'utf8'),ts.ScriptTarget.Latest,true);const code=names.map(name=>source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text===name).getText(source).replace(/^export /,''));return new Function(compile(prefix+code.join('\\n')+';return {'+names.join(',')+'};'))()}\nconst funcs=util('pointCloudUtils.ts',['diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud'],'const corridorIndexes = new WeakMap();\\n');const geo=util('geoUtils.ts',['distanceMeters']);\nconst geometry={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?geo:funcs,geometry,geometry.exports);\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudMapLayer','diffPointCloudFeatures','pointCloudCandidates','summarizePointCloud','distanceMeters','POINT_CLOUD_CONFIG','setTimeout','geometry','policy',compile('const {preparePointCloudMapGeometry,pointCloudCorridorBasis}=geometry; const {pointCloudMapRenderer}=policy; class Harness {'+methods(kind,kind==='working'?['ensurePointCloudMapLayerOwner','renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud']:['renderPointCloudMapLayer','pointCloudObjectIds','clearPointCloud'])+'};return Harness;'));\nconst copy=x=>structuredClone(x),tick=()=>new Promise(r=>setImmediate(r));async function until(f){for(let i=0;i<50;i++){if(f())return;await tick()}throw Error('Timed out')}\nfunction setup(kind,{count=12,manual=false,points, state={}}={}){\n const trace=[],layers=[],calls=[],views=[];let h;\n class Layer{constructor(properties){Object.assign(this,properties);this.destroyed=false;this.data=new Map();this.next=1000;this.number=layers.length;layers.push(this);trace.push(['create',copy(properties)])}destroy(){this.destroyed=true;trace.push(['destroy',this.number])}applyEdits(edits){trace.push(['edits',this.number,copy(edits)]);let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});const call={edits,layer:this,resolve,reject,finish:(custom)=>{const results={};for(const [kind,features]of Object.entries(edits)){const confirmations=[];for(let i=0;i<features.length;i++){const f=features[i],confirmation=custom?custom(f,i,kind):{objectId:kind==='addFeatures'?++this.next:f.attributes.ObjectID};confirmations.push(confirmation);if(confirmation&&!confirmation.error&&Number.isFinite(confirmation.objectId)){if(kind==='deleteFeatures')this.data.delete(f.attributes.ObjectID);else this.data.set(confirmation.objectId,{...copy(f),attributes:{...copy(f.attributes),ObjectID:confirmation.objectId}})}}results[kind==='deleteFeatures'?'deleteFeatureResults':kind==='updateFeatures'?'updateFeatureResults':'addFeatureResults']=confirmations}resolve(results)}};calls.push(call);if(!manual)call.finish();return promise}}\n const Harness=classes[kind](PointCloudMapLayer,funcs.diffPointCloudFeatures,funcs.pointCloudCandidates,funcs.summarizePointCloud,geo.distanceMeters,{GROUND_MODE_HEIGHT_M:1.5},(fn,ms)=>{trace.push(['yield',ms]);queueMicrotask(fn);return 1},geometry.exports,policy.exports);\n function view(){const v={destroyed:false,map:{add(layer){trace.push(['add',views.indexOf(v),layer.number])},remove(layer){trace.push(['remove',views.indexOf(v),layer.number])}}};views.push(v);return v}\n const w=new Harness();const pts=points||Array.from({length:count},(_,i)=>({lon:i/100000,lat:i/200000,rawLon:i/100000+.001,rawLat:i/200000+.001,alt:i/10,r:i%2?.5:80,g:i%2?.25:90,b:i%2?1:100}));\n"
        }
      ],
      "absentAfterUninstall": [
        "pointCloudMapRenderer",
        "const policy={exports:{}}"
      ],
      "requiredOccurrences": [
        {
          "text": "pointCloudMapRenderer",
          "count": 1
        },
        {
          "text": "const policy={exports:{}}",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/pointCloudGeometry.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudGeometry.test.cjs point-cloud map policy block 1",
          "before": "const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?metric:cloud,m,m.exports);const geometry=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return ['acceptPointCloudResult','renderPointCloudMapLayer','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(m=>m.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst globals={...geometry,...metric,...cloud,POINT_CLOUD_CONFIG:{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300,WIDTH_MAX:80,GROUND_MODE_HEIGHT_M:1.5},jsx:(tag,props,...children)=>({tag,props:props||{},children}),Icons:{Check:'check'}};\nconst Harness={};for(const kind of ['baseline','working'])Harness[kind]=new Function(...Object.keys(globals),compile('class Harness {'+methods(kind)+'};return Harness;'))(...Object.values(globals));\nconst clone=x=>structuredClone(x);\n",
          "after": "const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?metric:cloud,m,m.exports);const geometry=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return ['acceptPointCloudResult','renderPointCloudMapLayer','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(m=>m.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst policy={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(policy,policy.exports);\nconst globals={...policy.exports,...geometry,...metric,...cloud,POINT_CLOUD_CONFIG:{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300,WIDTH_MAX:80,GROUND_MODE_HEIGHT_M:1.5},jsx:(tag,props,...children)=>({tag,props:props||{},children}),Icons:{Check:'check'}};\nconst Harness={};for(const kind of ['baseline','working'])Harness[kind]=new Function(...Object.keys(globals),compile('class Harness {'+methods(kind)+'};return Harness;'))(...Object.values(globals));\nconst clone=x=>structuredClone(x);\n"
        }
      ],
      "absentAfterUninstall": [
        "const policy={exports:{}}"
      ],
      "requiredOccurrences": [
        {
          "text": "const policy={exports:{}}",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/pointCloudMapPolicy.ts",
      "content": "/** Plain ArcGIS-compatible display properties; no SDK constructors or live resources. */\nexport interface PointCloudMapSymbol {\n  type: 'point-3d';\n  symbolLayers: { type: 'icon'; resource: { primitive: 'circle' }; material: { color: string }; size: number; outline: { size: number } }[];\n}\nexport interface PointCloudUniqueValue { value: string; symbol: PointCloudMapSymbol; }\nexport type PointCloudMapRenderer =\n  | { type: 'unique-value'; field: string; uniqueValueInfos: PointCloudUniqueValue[] }\n  | { type: 'simple'; symbol: PointCloudMapSymbol; visualVariables: { type: 'color'; field: string; stops: { value: number; color: string }[] }[] };\nexport type PointCloudLayerProperties<R> = {\n  id: string; legendEnabled: boolean; title: string; visible: boolean; source: [];\n  objectIdField: string; geometryType: 'point'; hasZ: boolean;\n  spatialReference: { wkid: number }; elevationInfo: { mode: 'relative-to-ground'; offset: number };\n  fields: { name: string; type: 'oid' | 'integer' | 'string' | 'double'; alias?: string }[];\n  outFields: string[]; popupEnabled: boolean; popupTemplate: { title: string; content: string };\n  renderer: R; definitionExpression: string;\n};\n\n/** Build fresh mutable renderer properties for SDK autocasting; colors retain supplied order.\n * Only 'elevation' chooses the existing relativeHeight color-variable stops. All other\n * modes retain the RGB unique-value fallback. Point size, outline and thresholds stay\n * unchanged. Geometry quantization and adaptive/ground expressions are separate policy.\n */\nexport function pointCloudMapRenderer(colorMode: string, colors: readonly string[]): PointCloudMapRenderer {\n  const uniqueValueInfos: PointCloudUniqueValue[] = colors.map((hex) => ({\n    value: hex,\n    symbol: {\n      type: \"point-3d\",\n      symbolLayers: [\n        {\n          type: \"icon\",\n          resource: { primitive: \"circle\" },\n          material: { color: hex },\n          size: 2.0,\n          outline: { size: 0 },\n        },\n      ],\n    },\n  }));\n\n  // Construct renderer based on selected color mode\n  let activeRenderer: PointCloudMapRenderer;\n\n  if (colorMode === \"elevation\") {\n    activeRenderer = {\n      type: \"simple\",\n      symbol: {\n        type: \"point-3d\",\n        symbolLayers: [\n          {\n            type: \"icon\",\n            resource: { primitive: \"circle\" },\n            material: { color: \"white\" },\n            size: 2.0,\n            outline: { size: 0 },\n          },\n        ],\n      },\n      visualVariables: [\n        {\n          type: \"color\",\n          field: \"relativeHeight\",\n          stops: [\n            { value: -0.5, color: \"#0000FF\" },\n            { value: 0.0, color: \"#00FFFF\" },\n            { value: 2.5, color: \"#00FF00\" },\n            { value: 7.0, color: \"#FFFF00\" },\n            { value: 15.0, color: \"#FF0000\" },\n          ],\n        },\n      ],\n    };\n  } else {\n    activeRenderer = {\n      type: \"unique-value\",\n      field: \"colorCode\",\n      uniqueValueInfos: uniqueValueInfos,\n    };\n  }\n\n  return activeRenderer;\n}\n\n/** Build the existing empty-source layer schema/popup only when a new SDK layer is needed.\n * Each call owns fresh metadata arrays/objects; the renderer itself is borrowed by identity.\n * Visibility retains the previous layer's false value and defaults nullish values to true.\n * Existing field names, aliases, popup text/whitespace and height policy are preserved;\n * the absolute-altitude alias does not establish a source datum or perform conversion.\n */\nexport function pointCloudMapLayerProperties<R>(activeRenderer: R, definitionExpression: string, previousVisible?: boolean): PointCloudLayerProperties<R> {\n  return {\n    id: \"point-cloud-layer\", legendEnabled: false, title: \"Mapillary Point Cloud\", visible: previousVisible ?? true,\n    source: [],\n    objectIdField: \"ObjectID\",\n    geometryType: \"point\",\n    hasZ: true,\n    spatialReference: { wkid: 4326 },\n    elevationInfo: { mode: \"relative-to-ground\", offset: 0.5 },\n    fields: [\n      { name: \"ObjectID\", type: \"oid\" },\n      { name: \"pointIndex\", type: \"integer\" },\n      { name: \"originalIndex\", type: \"integer\" },\n      { name: \"colorCode\", type: \"string\", alias: \"Hex Color\" },\n      { name: \"relativeHeight\", type: \"double\", alias: \"Height Above Road (m)\" },\n      { name: \"absoluteAltitude\", type: \"double\", alias: \"Sea-level Altitude (m)\" },\n      { name: \"distanceFromCamera\", type: \"double\", alias: \"Distance from Car (m)\" },\n    ],\n    outFields: [\"*\"],\n    popupEnabled: true,\n    popupTemplate: {\n      title: \"Point Cloud Node\",\n      content: `\n                    <div style=\"font-size: 13px; line-height: 1.5;\">\n                        <b>Horizontal Distance:</b> {distanceFromCamera} m<br/>\n                        <span style=\"font-size: 10px; color: #888; display: block; margin-top: -4px; margin-bottom: 4px;\">\n                            (From camera GPS origin)\n                        </span>\n                        <b>Height Above Road:</b> {relativeHeight} m<br/>\n                        <b>Absolute Altitude:</b> {absoluteAltitude} m<br/>\n                        <span style=\"display:none;\">{originalIndex}</span>\n                    </div>\n                `,\n    },\n    renderer: activeRenderer,\n    definitionExpression: definitionExpression,\n  };\n}\n"
    },
    {
      "file": "tests/pointCloudMapPolicy.test.cjs",
      "content": "/** Exact plain-property comparisons with immutable pre-extraction runtime/owner policy.\n * The map suite separately checks actual SDK call order, edits and confirmed IDs.\n */\nconst fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudMapPolicy.baseline.json','utf8'));\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(m,m.exports);const {pointCloudMapRenderer:renderer,pointCloudMapLayerProperties:properties}=m.exports;\nconst baselineRenderer=new Function(compile('return function(colors,colorMode){'+fixture.renderer.replaceAll('this.state.pointCloudColorMode','colorMode')+';return activeRenderer;}'))();\nconst baselineProperties=new Function(compile('return function(activeRenderer,input){return '+fixture.properties+';}'))();\nconst oldProperties=(r,expression,visible)=>baselineProperties.call({currentLayer:visible===undefined?null:{visible}},r,{definitionExpression:expression});\ntest('RGB renderer preserves unique-value field, colors/order, symbol size/outline and empty palette',()=>{for(const colors of [[],['#000000'],['#aabbcc','#00ff00','#aabbcc'],['rgb(1,2,3)','#ffffff']]){const r=renderer('rgb',colors);assert.deepEqual(r,baselineRenderer(colors,'rgb'));assert.deepEqual(r.uniqueValueInfos.map(v=>v.value),colors);for(const item of r.uniqueValueInfos){assert.equal(item.symbol.symbolLayers[0].size,2);assert.deepEqual(item.symbol.symbolLayers[0].outline,{size:0})}}});\ntest('elevation renderer preserves every color stop, field, symbol and white material',()=>{for(const colors of [[],['#aabbcc','#112233']]){const r=renderer('elevation',colors);assert.deepEqual(r,baselineRenderer(colors,'elevation'));assert.deepEqual(r.visualVariables[0].stops.map(s=>s.value),[-.5,0,2.5,7,15]);assert.equal(r.visualVariables[0].field,'relativeHeight');assert.equal(r.symbol.symbolLayers[0].material.color,'white')}});\ntest('unknown and nullish mode values retain existing RGB fallback behavior',()=>{for(const mode of ['RGB','',undefined,null,'future-mode'])assert.deepEqual(renderer(mode,['#123456']),baselineRenderer(['#123456'],mode))});\ntest('complete layer/schema/popup property graph matches baseline for modes, visibility and expressions',()=>{for(const mode of ['rgb','elevation'])for(const visible of [false,true,undefined,null])for(const expression of ['1=1','relativeHeight < 1.5','relativeHeight < 0']){const r=renderer(mode,['#123456']);const value=properties(r,expression,visible);assert.deepEqual(value,oldProperties(r,expression,visible));assert.equal(value.renderer,r);assert.equal(value.visible,visible??true);assert.equal(value.source.length,0);assert.equal(value.legendEnabled,false)}});\ntest('popup string remains byte-identical, including whitespace and original-index placeholder',()=>{const value=properties(renderer('rgb',[]),'1=1'),old=oldProperties(value.renderer,'1=1');assert.equal(value.popupTemplate.content,old.popupTemplate.content);assert(value.popupTemplate.content.includes('{originalIndex}'));assert.equal(value.popupTemplate.title,'Point Cloud Node')});\ntest('field names/types/aliases and meter/height metadata remain exact without renaming IDs',()=>{const value=properties(renderer('rgb',[]),'1=1');assert.deepEqual(value.fields,oldProperties(value.renderer,'1=1').fields);assert.deepEqual(value.fields.slice(0,3),[{name:'ObjectID',type:'oid'},{name:'pointIndex',type:'integer'},{name:'originalIndex',type:'integer'}]);assert.deepEqual(value.elevationInfo,{mode:'relative-to-ground',offset:.5});assert.equal(value.objectIdField,'ObjectID');assert.equal(value.geometryType,'point');assert.equal(value.hasZ,true);assert.deepEqual(value.outFields,['*'])});\ntest('each renderer call owns mutable nested properties, protecting later layers from SDK autocasting',()=>{for(const mode of ['rgb','elevation']){const a=renderer(mode,['#123456']),b=renderer(mode,['#123456']);if(mode==='rgb'){a.uniqueValueInfos[0].symbol.symbolLayers[0].material.color='changed';a.uniqueValueInfos.push({})}else{a.symbol.symbolLayers[0].size=100;a.visualVariables[0].stops[0].color='changed'}assert.deepEqual(b,baselineRenderer(['#123456'],mode));assert.notEqual(a,b)}});\ntest('new layer metadata is independent while renderer identity remains borrowed',()=>{const r=renderer('rgb',['#123456']),a=properties(r,'1=1'),b=properties(r,'1=1');a.fields[0].name='changed';a.source.push({});a.outFields.push('extra');a.popupTemplate.content='changed';a.spatialReference.wkid=999;a.elevationInfo.offset=99;assert.deepEqual(b,oldProperties(r,'1=1'));assert.equal(a.renderer,r);assert.equal(b.renderer,r)});\ntest('color inputs are neither mutated nor retained as a shared mutable palette array',()=>{const colors=Object.freeze(['#00ff00','#ff0000']),before=[...colors],r=renderer('rgb',colors);assert.deepEqual(colors,before);r.uniqueValueInfos[0].value='changed';assert.deepEqual(colors,before)});\n"
    },
    {
      "file": "tests/fixtures/pointCloudMapPolicy.baseline.json",
      "content": "{\n  \"description\": \"Immutable pre-extraction renderer block and layer properties from runtime/map owner; test-only.\",\n  \"renderer\": \"    const uniqueValueInfos = colors.map((hex) => ({\\n      value: hex,\\n      symbol: {\\n        type: \\\"point-3d\\\",\\n        symbolLayers: [\\n          {\\n            type: \\\"icon\\\",\\n            resource: { primitive: \\\"circle\\\" },\\n            material: { color: hex },\\n            size: 2.0,\\n            outline: { size: 0 },\\n          },\\n        ],\\n      },\\n    }));\\n\\n    // Construct renderer based on selected color mode\\n    let activeRenderer: __esri.Renderer;\\n\\n    if (this.state.pointCloudColorMode === \\\"elevation\\\") {\\n      activeRenderer = {\\n        type: \\\"simple\\\",\\n        symbol: {\\n          type: \\\"point-3d\\\",\\n          symbolLayers: [\\n            {\\n              type: \\\"icon\\\",\\n              resource: { primitive: \\\"circle\\\" },\\n              material: { color: \\\"white\\\" },\\n              size: 2.0,\\n              outline: { size: 0 },\\n            },\\n          ],\\n        },\\n        visualVariables: [\\n          {\\n            type: \\\"color\\\",\\n            field: \\\"relativeHeight\\\",\\n            stops: [\\n              { value: -0.5, color: \\\"#0000FF\\\" },\\n              { value: 0.0, color: \\\"#00FFFF\\\" },\\n              { value: 2.5, color: \\\"#00FF00\\\" },\\n              { value: 7.0, color: \\\"#FFFF00\\\" },\\n              { value: 15.0, color: \\\"#FF0000\\\" },\\n            ],\\n          },\\n        ],\\n      } as any;\\n    } else {\\n      activeRenderer = {\\n        type: \\\"unique-value\\\",\\n        field: \\\"colorCode\\\",\\n        uniqueValueInfos: uniqueValueInfos,\\n      } as any;\\n    }\\n\",\n  \"properties\": \"{\\n      id: \\\"point-cloud-layer\\\", legendEnabled: false, title: \\\"Mapillary Point Cloud\\\", visible: this.currentLayer?.visible ?? true,\\n      source: [],\\n      objectIdField: \\\"ObjectID\\\",\\n      geometryType: \\\"point\\\",\\n      hasZ: true,\\n      spatialReference: { wkid: 4326 },\\n      elevationInfo: { mode: \\\"relative-to-ground\\\", offset: 0.5 },\\n      fields: [\\n        { name: \\\"ObjectID\\\", type: \\\"oid\\\" },\\n        { name: \\\"pointIndex\\\", type: \\\"integer\\\" },\\n        { name: \\\"originalIndex\\\", type: \\\"integer\\\" },\\n        { name: \\\"colorCode\\\", type: \\\"string\\\", alias: \\\"Hex Color\\\" },\\n        { name: \\\"relativeHeight\\\", type: \\\"double\\\", alias: \\\"Height Above Road (m)\\\" },\\n        { name: \\\"absoluteAltitude\\\", type: \\\"double\\\", alias: \\\"Sea-level Altitude (m)\\\" },\\n        { name: \\\"distanceFromCamera\\\", type: \\\"double\\\", alias: \\\"Distance from Car (m)\\\" },\\n      ],\\n      outFields: [\\\"*\\\"],\\n      popupEnabled: true,\\n      popupTemplate: {\\n        title: \\\"Point Cloud Node\\\",\\n        content: `\\n                    <div style=\\\"font-size: 13px; line-height: 1.5;\\\">\\n                        <b>Horizontal Distance:</b> {distanceFromCamera} m<br/>\\n                        <span style=\\\"font-size: 10px; color: #888; display: block; margin-top: -4px; margin-bottom: 4px;\\\">\\n                            (From camera GPS origin)\\n                        </span>\\n                        <b>Height Above Road:</b> {relativeHeight} m<br/>\\n                        <b>Absolute Altitude:</b> {absoluteAltitude} m<br/>\\n                        <span style=\\\"display:none;\\\">{originalIndex}</span>\\n                    </div>\\n                `,\\n      },\\n      renderer: activeRenderer,\\n      definitionExpression: input.definitionExpression,\\n    }\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-map-policy-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-map-policy.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited map-policy references remain)');
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
    console.log(uninstall ? 'Point-cloud map policy is already uninstalled. No files changed.' : 'Point-cloud map policy is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-map-policy', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud map policy ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Map renderer/schema/popup properties now have one typed display-policy entry point. Geometry, layer lifetime, IDs and edit ordering are preserved. Contributor docs and baseline tests are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
