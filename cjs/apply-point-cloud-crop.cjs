#!/usr/bin/env node
'use strict';
/** Point-cloud crop installer. Plain source payload.
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
          "before": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudExport } from '../features/point-cloud/PointCloudExport';\nimport { showPointCloudExportFeedback } from '../features/point-cloud/PointCloudExportFeedback';\n",
          "after": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudCrop } from '../features/point-cloud/PointCloudCrop';\nimport { PointCloudExport } from '../features/point-cloud/PointCloudExport';\nimport { showPointCloudExportFeedback } from '../features/point-cloud/PointCloudExportFeedback';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Export owns single-flight state; raw points are borrowed without crop/ground/lasso filtering. */\n  private _pointCloudExport = new PointCloudExport({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind crop state and viewer subset authority without retaining a second cloud copy. */\n  private _pointCloudCrop = new PointCloudCrop({\n    readState: () => this.state,\n    readResult: () => this._pointCloudAcquisition.result,\n    readCamera: () => ({ lon: this._cameraLon, lat: this._cameraLat }),\n    readBearing: () => this.getStreetBearing(),\n    readViewerRenderer: () => this._pointCloudViewerRenderer,\n    setState: (patch, callback) => this.setState(patch, callback),\n    setFilteredPoints: points => { this._filteredPointCloudPoints = points; },\n    renderMap: () => this.renderPointCloudMapLayer(),\n    drawRings: radius => this.drawConcentricRings(radius),\n    resizeViewer: () => { if (this.mapillaryViewer) this.mapillaryViewer.resize(); },\n    widthMax: POINT_CLOUD_CONFIG.WIDTH_MAX,\n  });\n  /** Export owns single-flight state; raw points are borrowed without crop/ground/lasso filtering. */\n  private _pointCloudExport = new PointCloudExport({\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 3",
          "before": "  private downloadPointCloud = async (format: \"csv\" | \"ply\" | \"las\" = \"csv\") => this._pointCloudExport.download(format);\n\n  /** Clamp the symmetric along-street crop length, then refresh map, rings and viewer.\n   * Bearing/width are captured before the state callback; point/camera reads remain live.\n   * @param newLength Half-length in meters; nonpositive values select unlimited length.\n   */\n  handlePointCloudLengthChange = (newLength: number) => {\n    const clamped = newLength <= 0 ? 0 : Math.min(newLength, this.state.pointCloudMaxLength);\n\n    // Capture before setState, matching the length control's existing callback timing.\n    const basis = pointCloudCorridorBasis(this.getStreetBearing());\n\n    // Width remains captured with the length control intent.\n    const halfWidth = this.state.pointCloudWidth;\n\n    this.setState({ pointCloudLength: clamped }, () => {\n      if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\n\n      // 1. Refresh points (WebGL Map)\n      this.renderPointCloudMapLayer();\n\n      // 2. Refresh rings (GraphicsLayer)\n      this.drawConcentricRings(clamped <= 0 ? this.state.pointCloudActualLength : clamped);\n\n      // 3. Refresh viewer renderer (WebGL Viewer)\n      if (this._pointCloudViewerRenderer) {\n        const allPoints = this._pointCloudAcquisition.result.points;\n\n        const filteredPoints = filterPointCloudCorridor(allPoints, this._cameraLon, this._cameraLat, basis, clamped, halfWidth);\n\n        this._filteredPointCloudPoints = filteredPoints;\n\n        this._pointCloudViewerRenderer.updatePoints(filteredPoints);\n        if (this.mapillaryViewer) this.mapillaryViewer.resize();\n      }\n    });\n  };\n\n  /** Clamp cross-street half-width and refresh the existing map/ring/viewer sequence.\n   * Bearing/length are read inside the state callback. Nonpositive width disables that axis.\n   */\n  private handlePointCloudWidthChange = (newWidth: number) => {\n    const clamped = newWidth <= 0 ? 0 : Math.max(5, Math.min(newWidth, POINT_CLOUD_CONFIG.WIDTH_MAX));\n\n    this.setState({ pointCloudWidth: clamped }, () => {\n      if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\n\n      // 1. Refresh points (WebGL Map)\n      this.renderPointCloudMapLayer();\n\n      // 2. Refresh rings (GraphicsLayer)\n      this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);\n\n      // 3. Refresh viewer renderer (WebGL Viewer)\n      if (this._pointCloudViewerRenderer) {\n        const allPoints = this._pointCloudAcquisition.result.points;\n        // Width changes read bearing inside the callback after the map/ring updates.\n        const basis = pointCloudCorridorBasis(this.getStreetBearing());\n        const currentLength = this.state.pointCloudLength;\n        const halfWidth = clamped;\n\n        const filteredPoints = filterPointCloudCorridor(allPoints, this._cameraLon, this._cameraLat, basis, currentLength, halfWidth);\n\n        this._filteredPointCloudPoints = filteredPoints;\n\n        this._pointCloudViewerRenderer.updatePoints(filteredPoints);\n        if (this.mapillaryViewer) this.mapillaryViewer.resize();\n      }\n    });\n  };\n\n  /** Bind the ring feature's live geometry and typed SDK factories once. */\n",
          "after": "  private downloadPointCloud = async (format: \"csv\" | \"ply\" | \"las\" = \"csv\") => this._pointCloudExport.download(format);\n\n  /** Forward meter half-length; the feature preserves pre-state bearing/width capture. */\n  handlePointCloudLengthChange = (newLength: number) => this._pointCloudCrop.changeLength(newLength);\n\n  /** Forward meter half-width; the feature reads bearing/length after map/ring updates. */\n  private handlePointCloudWidthChange = (newWidth: number) => this._pointCloudCrop.changeWidth(newWidth);\n\n  /** Bind the ring feature's live geometry and typed SDK factories once. */\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "tests/pointCloudGeometry.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudGeometry.test.cjs point-cloud calibration block 1",
          "before": "// The count helper also needs the same distance-independent candidate envelope.\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?metric:cloud,m,m.exports);const geometry=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return ['acceptPointCloudResult','renderPointCloudMapLayer','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(m=>m.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst policy={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(policy,policy.exports);\nconst globals={...policy.exports,...geometry,...metric,...cloud,POINT_CLOUD_CONFIG:{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300,WIDTH_MAX:80,GROUND_MODE_HEIGHT_M:1.5},jsx:(tag,props,...children)=>({tag,props:props||{},children}),Icons:{Check:'check'}};\nconst Harness={};for(const kind of ['baseline','working'])Harness[kind]=new Function(...Object.keys(globals),compile('class Harness {'+methods(kind)+'};return Harness;'))(...Object.values(globals));\nconst clone=x=>structuredClone(x);\n",
          "after": "// The count helper also needs the same distance-independent candidate envelope.\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?metric:cloud,m,m.exports);const geometry=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return [...(kind==='working'?['_pointCloudCrop']:[]),'acceptPointCloudResult','renderPointCloudMapLayer','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(m=>m.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst policy={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(policy,policy.exports);\nconst crop={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudCrop.ts','utf8')))(()=>geometry,crop,crop.exports);\nconst globals={...crop.exports,...policy.exports,...geometry,...metric,...cloud,POINT_CLOUD_CONFIG:{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300,WIDTH_MAX:80,GROUND_MODE_HEIGHT_M:1.5},jsx:(tag,props,...children)=>({tag,props:props||{},children}),Icons:{Check:'check'}};\nconst Harness={};for(const kind of ['baseline','working'])Harness[kind]=new Function(...Object.keys(globals),compile('class Harness {'+methods(kind)+'};return Harness;'))(...Object.values(globals));\nconst clone=x=>structuredClone(x);\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud calibration block 1",
          "before": "\nThe coordinator preserves the existing exception scopes: binary failures notify; CSV download failures log/notify; CSV writer failures propagate while `finally` releases busy/loading. CSV URL revocation is immediate; binary revocation keeps its 1000 ms grace period. Function comments document those deliberate boundaries. The baseline-backed export suite records feedback, writer inputs, browser operations, errors and held-writer races. Real downloads/file import remain host smoke checks.\n",
          "after": "\nThe coordinator preserves the existing exception scopes: binary failures notify; CSV download failures log/notify; CSV writer failures propagate while `finally` releases busy/loading. CSV URL revocation is immediate; binary revocation keeps its 1000 ms grace period. Function comments document those deliberate boundaries. The baseline-backed export suite records feedback, writer inputs, browser operations, errors and held-writer races. Real downloads/file import remain host smoke checks.\n\n## Crop/display coordination\n\n`PointCloudCrop.ts` owns length/width input orchestration. It borrows current state/result/camera/viewer readers and calls runtime state/map/ring/subset/upload adapters. Numerical filtering remains in `pointCloudGeometry.ts`; adaptive display and scene edit/confirmed-ID owners are unchanged.\n\nLength captures basis/width before setState; width reads basis/length after map/ring updates inside the callback. Both retain callback-time visibility/result guards and current camera/result reads. Store the ordered filtered array before viewer upload, then resize if available. The complete retained cloud remains authoritative for acquisition and export. Nonpositive dimensions disable the corresponding crop axis; rings retain actual-length fallback.\n\nThe coordinator owns no timer, listener, layer, retained cloud or duplicate subset state. Queued callbacks preserve the current scheduling policy. Function comments and the baseline-backed crop suite document clamping, capture timing, point identity, replacement/closure and callback ordering. The existing geometry suite still checks actual feature/confirmed-index order through the real runtime adapters.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud calibration block 1",
          "before": "Changed: runtime widget, CSV file header comment, point-cloud contributor README, ownership document and this roadmap. Added: export coordinator, export feedback module, 15 baseline-backed regression cases and immutable original-handler fixture. Validation: 204 total cases including existing point-cloud/playback suites; strict coordinator/feedback/actual runtime adapter/writer types using local Jimu/React declarations; full runtime TSX parsing; token checks for unaffected runtime members/writers; installer fixtures covering conflicts, line endings, local edits, rollback, installed tests and uninstall. Experience Builder build, real browser downloads and file import remain host checks.\n\nNext: extract point-cloud crop/display coordination (length/width controls, corridor subset updates and related feedback), keeping captured-versus-live bearing/dimension reads, clamping, map/ring/viewer order and confirmed-ID ownership intact.\n",
          "after": "Changed: runtime widget, CSV file header comment, point-cloud contributor README, ownership document and this roadmap. Added: export coordinator, export feedback module, 15 baseline-backed regression cases and immutable original-handler fixture. Validation: 204 total cases including existing point-cloud/playback suites; strict coordinator/feedback/actual runtime adapter/writer types using local Jimu/React declarations; full runtime TSX parsing; token checks for unaffected runtime members/writers; installer fixtures covering conflicts, line endings, local edits, rollback, installed tests and uninstall. Experience Builder build, real browser downloads and file import remain host checks.\n\nCrop/display coordination is completed below with captured-versus-live bearing/dimension reads, clamping, map/ring/viewer order and confirmed-ID ownership retained.\n\n## Point-cloud crop/display coordination\n\nExtracted length/width input and subset-update orchestration to `src/features/point-cloud/PointCloudCrop.ts`. Runtime is now 13,621 lines (48 fewer), with two forwarding control handlers and explicit state/viewer adapters. All other existing runtime members are token-identical; geometry, map-layer owner, adaptive display and point-cloud utilities are byte-identical.\n\nFunction comments explain half-dimension meter units, nonpositive/unlimited behavior, original clamps, deliberate length/width capture timing, live result/camera reads and subset assignment before upload. Map/ring/viewer order, callback guards and independent queued input behavior are unchanged. No timers, listeners, requests, SDK resources, full-cloud copies or new subset authority are introduced.\n\nChanged: runtime widget, contributor README, ownership document, this roadmap and the geometry test harness (binds the real crop coordinator; original assertions/fixture retained). Added: crop coordinator, 15 differential cases and immutable original-control fixture. Validation: 219 total point-cloud/playback cases, strict coordinator and actual runtime adapter checks using real viewer/point types, full TSX parse, structural preservation checks and guarded installer fixtures. Host checks remain rapid sliders/unlimited dimensions, cloud closure/replacement, viewer recreation and lasso alignment after cropping.\n\nNext: extract initial point-cloud result application and presentation, preserving camera/extents/floor preparation, same-cluster calibration retention, initial map/viewer ordering and existing progress/summary feedback.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud calibration block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Export single-flight flow, captured/live inputs and browser downloads | `PointCloudExport.ts` |\n| Export toast wording, visual feedback and durations | `PointCloudExportFeedback.tsx` |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Crop length/width clamping and map/ring/viewer subset coordination | `PointCloudCrop.ts` |\n| Export single-flight flow, captured/live inputs and browser downloads | `PointCloudExport.ts` |\n| Export toast wording, visual feedback and durations | `PointCloudExportFeedback.tsx` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud calibration block 2",
          "before": "\n`tests/pointCloudExport.test.cjs` compares actual runtime adapters against the frozen original handler with recording browser APIs and held writers. It covers default/all formats, point identity, guard/busy order, capture timing, live filename fallback, replacement/closure/disposal, retries, writer/browser failures and exact feedback/download/URL timing. Host smoke checks: download and open CSV/PLY/LAS, verify calibrated coordinates/filenames, repeated export clicks, and closing the cloud during preparation.\n",
          "after": "\n`tests/pointCloudExport.test.cjs` compares actual runtime adapters against the frozen original handler with recording browser APIs and held writers. It covers default/all formats, point identity, guard/busy order, capture timing, live filename fallback, replacement/closure/disposal, retries, writer/browser failures and exact feedback/download/URL timing. Host smoke checks: download and open CSV/PLY/LAS, verify calibrated coordinates/filenames, repeated export clicks, and closing the cloud during preparation.\n\n## Crop controls and viewer subsets\n\n`PointCloudCrop.ts` coordinates length/width controls. Geometry stays in `pointCloudGeometry.ts`, resource/confirmed-ID ownership stays in `PointCloudMapLayer.ts`, and adaptive display remains in `PointCloudAdaptiveDisplay.ts`. Runtime binds live state/result/camera/viewer readers and React state callbacks.\n\n- Length is a symmetric half-length in meters. Nonpositive values select unlimited length; positive values clamp to the current UI maximum. Bearing and width are captured before the state callback, while result and camera remain live.\n- Width is a symmetric half-width in meters. Nonpositive disables that axis; positive values clamp between 5 and the existing configured maximum. Width callbacks read bearing/length after map and rings work, and only if a viewer renderer exists.\n- Each state callback retains map rebuild \u2192 explicit rings \u2192 filter current retained points \u2192 store subset \u2192 viewer upload \u2192 optional resize order. A nonpositive ring length uses the current actual extent; no full-cloud/export input is changed.\n- Filtered arrays contain the original points in source order. The runtime subset field is assigned before upload so lasso/viewer index spaces remain consistent. No new point copies, cache, timer, listener or SDK layer is owned here.\n- Cloud visibility/result guards remain inside the React callback. Queued control changes retain their original independent captured inputs; this extraction adds no debouncing, coalescing or cancellation policy.\n\nFunction comments spell out the deliberate length/width timing difference. `tests/pointCloudCrop.test.cjs` compares actual adapters with frozen original controls under immediate/batched state scheduling. Existing geometry tests bind the real crop module while retaining their baseline fixtures and assertions. Host smoke checks: rapid length/width changes, unlimited dimensions, cloud closure, viewer recreation, and lasso alignment after crop changes.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudCrop.ts",
      "content": "import { filterPointCloudCorridor, pointCloudCorridorBasis } from './pointCloudGeometry';\nimport type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';\n\n/** Crop controls use symmetric half-length/half-width in meters. Nonpositive disables that axis. */\nexport interface PointCloudCropState {\n  pointCloudLength: number;\n  pointCloudWidth: number;\n  pointCloudMaxLength: number;\n  pointCloudActualLength: number;\n  pointCloudVisible?: boolean;\n}\nexport interface PointCloudCropDependencies {\n  /** Borrow current state on each read; never retain it across a queued React callback. */\n  readState(): PointCloudCropState;\n  readResult(): PointCloudResult | null;\n  /** Shifted map coordinates in WGS84 degrees, read at the existing filter boundary. */\n  readCamera(): { lon: number; lat: number };\n  readBearing(): number;\n  readViewerRenderer(): { updatePoints(points: PointCloudPoint[]): void } | null;\n  setState(patch: { pointCloudLength?: number; pointCloudWidth?: number }, callback: () => void): void;\n  /** Store this same ordered array before upload; lasso/viewer indices address this subset. */\n  setFilteredPoints(points: PointCloudPoint[]): void;\n  renderMap(): void;\n  drawRings(radius: number): void;\n  resizeViewer(): void;\n  widthMax: number;\n}\n\n/** Coordinate crop controls without owning React state, cloud acquisition, timers or SDK resources.\n * Geometry filtering stays in pointCloudGeometry; scene features/confirmed IDs stay with the map owner.\n * Each accepted state callback keeps the original order and live/captured inputs, even when batched.\n */\nexport class PointCloudCrop {\n  constructor(private readonly dependencies: PointCloudCropDependencies) {}\n\n  /** Clamp length using the current UI maximum, then capture bearing/width before setState.\n   * Callback reads current result/camera. A nonpositive length uses actual extent for rings only.\n   */\n  changeLength(newLength: number): void {\n    const d = this.dependencies;\n    const clamped = newLength <= 0 ? 0 : Math.min(newLength, d.readState().pointCloudMaxLength);\n    const basis = pointCloudCorridorBasis(d.readBearing());\n    const halfWidth = d.readState().pointCloudWidth;\n    d.setState({ pointCloudLength: clamped }, () => {\n      if (!d.readState().pointCloudVisible || !d.readResult()) return;\n      d.renderMap();\n      d.drawRings(clamped <= 0 ? d.readState().pointCloudActualLength : clamped);\n      if (d.readViewerRenderer()) {\n        const allPoints = d.readResult()!.points;\n        const camera = d.readCamera();\n        const points = filterPointCloudCorridor(allPoints, camera.lon, camera.lat, basis, clamped, halfWidth);\n        d.setFilteredPoints(points);\n        d.readViewerRenderer()!.updatePoints(points);\n        d.resizeViewer();\n      }\n    });\n  }\n\n  /** Clamp positive width to [5, configured maximum]; nonpositive disables cross-street cropping.\n   * Unlike length input, read bearing/length inside the callback, after map/ring work and only\n   * when a viewer renderer exists. Keep this asymmetry to preserve current interaction behavior.\n   */\n  changeWidth(newWidth: number): void {\n    const d = this.dependencies;\n    const clamped = newWidth <= 0 ? 0 : Math.max(5, Math.min(newWidth, d.widthMax));\n    d.setState({ pointCloudWidth: clamped }, () => {\n      if (!d.readState().pointCloudVisible || !d.readResult()) return;\n      d.renderMap();\n      d.drawRings(d.readState().pointCloudLength <= 0 ? d.readState().pointCloudActualLength : d.readState().pointCloudLength);\n      if (d.readViewerRenderer()) {\n        const allPoints = d.readResult()!.points;\n        const basis = pointCloudCorridorBasis(d.readBearing());\n        const currentLength = d.readState().pointCloudLength;\n        const camera = d.readCamera();\n        const points = filterPointCloudCorridor(allPoints, camera.lon, camera.lat, basis, currentLength, clamped);\n        d.setFilteredPoints(points);\n        d.readViewerRenderer()!.updatePoints(points);\n        d.resizeViewer();\n      }\n    });\n  }\n}\n"
    },
    {
      "file": "tests/pointCloudCrop.test.cjs",
      "content": "/** Compare actual crop adapters with frozen original controls, including queued state callbacks.\n * Real corridor math is compiled from its source; record map/ring/viewer order and point identity.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst geometrySource=ts.createSourceFile('geometry.ts',fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8'),ts.ScriptTarget.Latest,true);\nconst geometry=new Function(compile(['pointCloudCorridorBasis','filterPointCloudCorridor'].map(name=>geometrySource.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text===name).getText(geometrySource).replace(/^export /,'')).join('\\n')+';return {pointCloudCorridorBasis,filterPointCloudCorridor};'))();\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudCrop.ts','utf8')))(()=>geometry,m,m.exports);\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudCrop.baseline.json','utf8'));\nconst sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');\nconst actual=['_pointCloudCrop','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n');\nconst classes={};for(const kind of ['baseline','working'])classes[kind]=new Function('PointCloudCrop','pointCloudCorridorBasis','filterPointCloudCorridor','POINT_CLOUD_CONFIG',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.PointCloudCrop,geometry.pointCloudCorridorBasis,geometry.filterPointCloudCorridor,{WIDTH_MAX:80});\nconst point=(x,y,id)=>({lon:x/111320,lat:y/111320,rawLon:1,rawLat:1,alt:10,r:2,g:3,b:4,id});\nfunction setup(kind,{batched=false}={}){\n const w=new classes[kind](),trace=[],queue=[],points=[point(0,0,0),point(6,2,1),point(0,12,2),point(-4,-8,3),point(50,50,4)];\n w.state={pointCloudLength:20,pointCloudWidth:10,pointCloudMaxLength:300,pointCloudActualLength:75,pointCloudVisible:true};w._pointCloudAcquisition={result:{points}};w._cameraLon=0;w._cameraLat=0;w.bearing=0;w._filteredPointCloudPoints=[];\n let mapHook=()=>{},ringHook=()=>{};w.setState=(patch,callback)=>{trace.push(['state',structuredClone(patch)]);const run=()=>{Object.assign(w.state,patch);callback()};if(batched)queue.push(run);else run()};w.getStreetBearing=()=>{trace.push(['bearing',w.bearing]);return w.bearing};w.renderPointCloudMapLayer=()=>{trace.push(['map']);mapHook()};w.drawConcentricRings=radius=>{trace.push(['rings',radius]);ringHook()};\n const renderer={updatePoints:p=>{assert.strictEqual(p,w._filteredPointCloudPoints);trace.push(['points',p.map(p=>p.id)])}};w._pointCloudViewerRenderer=renderer;w.mapillaryViewer={resize:()=>trace.push(['resize'])};\n return{w,trace,points,renderer,queue,length:n=>w.handlePointCloudLengthChange(n),width:n=>w.handlePointCloudWidthChange(n),flush:()=>{while(queue.length)queue.shift()()},onMap:fn=>mapHook=fn,onRings:fn=>ringHook=fn};\n}\nfunction compare(run,options){const a=setup('baseline',options),b=setup('working',options);run(a);run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);assert.deepEqual(b.w._filteredPointCloudPoints,a.w._filteredPointCloudPoints);return b}\ntest('length clamps retain zero/unlimited, current max and numeric edge behavior',()=>{for(const n of [-Infinity,-1,0,.1,5,300,301,Infinity,NaN])compare(h=>{h.length(n);assert.equal(h.w.state.pointCloudLength,n<=0?0:Math.min(n,300))})});\ntest('positive width clamps to 5/config maximum while nonpositive disables the axis',()=>{for(const n of [-Infinity,-1,0,.1,4.99,5,80,81,Infinity,NaN])compare(h=>{h.width(n);assert.equal(h.w.state.pointCloudWidth,n<=0?0:Math.max(5,Math.min(n,80)))})});\ntest('batched controls do no map/ring/upload work before state callback',()=>{compare(h=>{h.length(10);h.width(8);assert(h.trace.every(x=>['bearing','state'].includes(x[0])));h.flush()},{batched:true})});\ntest('length captures bearing/width/max before callback while camera remains live',()=>{compare(h=>{h.length(12);h.w.bearing=90;h.w.state.pointCloudWidth=1;h.w.state.pointCloudMaxLength=1;h.w._cameraLon=4/111320;h.flush();assert.equal(h.w.state.pointCloudLength,12);assert.equal(h.trace.filter(x=>x[0]==='bearing').length,1)},{batched:true})});\ntest('width captures its clamp but reads bearing and length after map/rings',()=>{compare(h=>{h.width(8);h.onMap(()=>{h.w.state.pointCloudLength=0;h.w.state.pointCloudActualLength=99;h.w.bearing=45});h.onRings(()=>{h.w.state.pointCloudLength=5;h.w.bearing=90});h.flush();assert(h.trace.some(x=>x[0]==='rings'&&x[1]===99));assert(h.trace.some(x=>x[0]==='bearing'&&x[1]===90))},{batched:true})});\ntest('queued callback filters replacement result rather than captured cloud',()=>{compare(h=>{h.length(20);const next=[point(1,1,100),point(100,100,101)];h.w._pointCloudAcquisition.result={points:next};h.flush();assert.strictEqual(h.w._filteredPointCloudPoints[0],next[0]);assert.deepEqual(h.w._filteredPointCloudPoints.map(p=>p.id),[100])},{batched:true})});\ntest('hidden or missing cloud at callback skips map/rings/viewer but keeps state patch',()=>{for(const missing of ['visible','result'])compare(h=>{h.length(10);h.width(5);if(missing==='visible')h.w.state.pointCloudVisible=false;else h.w._pointCloudAcquisition.result=null;h.flush();assert(!h.trace.some(x=>['map','rings','points','resize'].includes(x[0])))},{batched:true})});\ntest('absent renderer keeps map/rings and skips width bearing/subset/resize',()=>{compare(h=>{h.w._pointCloudViewerRenderer=null;h.width(8);assert.deepEqual(h.trace.map(x=>x[0]),['state','map','rings']);h.length(20);assert.equal(h.trace.filter(x=>x[0]==='bearing').length,1)})});\ntest('renderer availability is read after map/rings and before subset upload',()=>{for(const initial of [true,false])compare(h=>{h.w._pointCloudViewerRenderer=initial?h.renderer:null;h.onRings(()=>{h.w._pointCloudViewerRenderer=initial?null:h.renderer});h.width(8);assert.equal(h.trace.some(x=>x[0]==='points'),!initial)})});\ntest('subset authority is assigned before upload and resize follows upload',()=>{compare(h=>{h.width(8);assert.deepEqual(h.trace.map(x=>x[0]),['state','map','rings','bearing','points','resize']);const subset=h.w._filteredPointCloudPoints;assert.notStrictEqual(subset,h.points);for(const p of subset)assert(h.points.includes(p))})});\ntest('length ring fallback reads actual extent after map; finite length keeps intent radius',()=>{for(const length of [0,-1,10])compare(h=>{h.onMap(()=>h.w.state.pointCloudActualLength=123);h.length(length);assert(h.trace.some(x=>x[0]==='rings'&&x[1]===(length<=0?123:length)))})});\ntest('alternating queued control callbacks preserve original independent captured intents',()=>{compare(h=>{h.length(10);h.width(7);h.w.bearing=90;h.length(3);h.width(0);h.flush();assert.equal(h.w.state.pointCloudLength,3);assert.equal(h.w.state.pointCloudWidth,0);assert.equal(h.trace.filter(x=>x[0]==='map').length,4)},{batched:true})});\ntest('empty/frozen point arrays preserve input order and raw point identity',()=>{for(const empty of [false,true])compare(h=>{if(empty)h.w._pointCloudAcquisition.result.points=[];const points=h.w._pointCloudAcquisition.result.points;const before=structuredClone(points);points.forEach(Object.freeze);Object.freeze(points);h.length(10);h.width(5);assert.deepEqual(points,before);for(const p of h.w._filteredPointCloudPoints)assert(points.includes(p))})});\ntest('viewer absence suppresses only resize and preserves subset upload',()=>{compare(h=>{h.w.mapillaryViewer=null;h.width(10);assert(h.trace.some(x=>x[0]==='points'));assert(!h.trace.some(x=>x[0]==='resize'))})});\ntest('map failure preserves original synchronous propagation without later updates',()=>{compare(h=>{h.onMap(()=>{throw Error('map failed')});assert.throws(()=>h.width(5),{message:'map failed'});assert.deepEqual(h.trace.map(x=>x[0]),['state','map'])})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudCrop.baseline.json",
      "content": "{\n  \"handlers\": \"  /** Clamp the symmetric along-street crop length, then refresh map, rings and viewer.\\n   * Bearing/width are captured before the state callback; point/camera reads remain live.\\n   * @param newLength Half-length in meters; nonpositive values select unlimited length.\\n   */\\n  handlePointCloudLengthChange = (newLength: number) => {\\n    const clamped = newLength <= 0 ? 0 : Math.min(newLength, this.state.pointCloudMaxLength);\\n\\n    // Capture before setState, matching the length control's existing callback timing.\\n    const basis = pointCloudCorridorBasis(this.getStreetBearing());\\n\\n    // Width remains captured with the length control intent.\\n    const halfWidth = this.state.pointCloudWidth;\\n\\n    this.setState({ pointCloudLength: clamped }, () => {\\n      if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\\n\\n      // 1. Refresh points (WebGL Map)\\n      this.renderPointCloudMapLayer();\\n\\n      // 2. Refresh rings (GraphicsLayer)\\n      this.drawConcentricRings(clamped <= 0 ? this.state.pointCloudActualLength : clamped);\\n\\n      // 3. Refresh viewer renderer (WebGL Viewer)\\n      if (this._pointCloudViewerRenderer) {\\n        const allPoints = this._pointCloudAcquisition.result.points;\\n\\n        const filteredPoints = filterPointCloudCorridor(allPoints, this._cameraLon, this._cameraLat, basis, clamped, halfWidth);\\n\\n        this._filteredPointCloudPoints = filteredPoints;\\n\\n        this._pointCloudViewerRenderer.updatePoints(filteredPoints);\\n        if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n      }\\n    });\\n  };\\n\\n  /** Clamp cross-street half-width and refresh the existing map/ring/viewer sequence.\\n   * Bearing/length are read inside the state callback. Nonpositive width disables that axis.\\n   */\\n  private handlePointCloudWidthChange = (newWidth: number) => {\\n    const clamped = newWidth <= 0 ? 0 : Math.max(5, Math.min(newWidth, POINT_CLOUD_CONFIG.WIDTH_MAX));\\n\\n    this.setState({ pointCloudWidth: clamped }, () => {\\n      if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) return;\\n\\n      // 1. Refresh points (WebGL Map)\\n      this.renderPointCloudMapLayer();\\n\\n      // 2. Refresh rings (GraphicsLayer)\\n      this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);\\n\\n      // 3. Refresh viewer renderer (WebGL Viewer)\\n      if (this._pointCloudViewerRenderer) {\\n        const allPoints = this._pointCloudAcquisition.result.points;\\n        // Width changes read bearing inside the callback after the map/ring updates.\\n        const basis = pointCloudCorridorBasis(this.getStreetBearing());\\n        const currentLength = this.state.pointCloudLength;\\n        const halfWidth = clamped;\\n\\n        const filteredPoints = filterPointCloudCorridor(allPoints, this._cameraLon, this._cameraLat, basis, currentLength, halfWidth);\\n\\n        this._filteredPointCloudPoints = filteredPoints;\\n\\n        this._pointCloudViewerRenderer.updatePoints(filteredPoints);\\n        if (this.mapillaryViewer) this.mapillaryViewer.resize();\\n      }\\n    });\\n  };\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-crop-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-crop.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited crop references remain)');
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
    console.log(uninstall ? 'Point-cloud crop is already uninstalled. No files changed.' : 'Point-cloud crop is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-crop', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud crop ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Point-cloud crop flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
