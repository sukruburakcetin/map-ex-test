#!/usr/bin/env node
'use strict';
/** Point-cloud export installer. Plain source payload.
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
          "before": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudCalibration } from '../features/point-cloud/PointCloudCalibration';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\n",
          "after": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudExport } from '../features/point-cloud/PointCloudExport';\nimport { showPointCloudExportFeedback } from '../features/point-cloud/PointCloudExportFeedback';\nimport { PointCloudCalibration } from '../features/point-cloud/PointCloudCalibration';\nimport { PointCloudRings } from '../features/point-cloud/PointCloudRings';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  private _pointCloudExportBusy = false;\n  private _groundMode: boolean = false;\n  private _lasso: PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Export owns single-flight state; raw points are borrowed without crop/ground/lasso filtering. */\n  private _pointCloudExport = new PointCloudExport({\n    canExport: () => !!this.state.pointCloudVisible && !!this._pointCloudAcquisition.result,\n    readResult: () => this._pointCloudAcquisition.result!,\n    readVerticalOffset: () => this._nudgeZ,\n    readHorizontalContext: () => ({ x: this._nudgeX, y: this._nudgeY, latitude: this._cameraLat }),\n    readImageId: () => this.state.imageId,\n    isDisposed: () => this._sharedNotesDisposed,\n    setLoading: loading => this.setState({ pointCloudExportLoading: loading }),\n    notify: notice => showPointCloudExportFeedback((...args) => this.showToast(...args), notice),\n    writers: { csv: buildPointCloudCsv, ply: buildPointCloudPly, las: buildPointCloudLas },\n    logError: error => console.error(\"Point Cloud download failed\", error),\n  });\n  private _groundMode: boolean = false;\n  private _lasso: PointCloudLasso<__esri.FeatureLayer, __esri.MapView | __esri.SceneView> | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud calibration block 3",
          "before": "  private checkAndLoadNextPointCloud = (newImageId: string) => this._pointCloudAcquisition.onImage(newImageId);\n\n  /**\n   * Extracts the currently loaded point cloud, applies the user's Nudge calibrations,\n   * and downloads it as a standard .CSV file for CAD/ArcGIS Pro import.\n   */\n  private downloadPointCloud = async (format: \"csv\" | \"ply\" | \"las\" = \"csv\") => {\n    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) { this.showToast(\"No point cloud available to export.\"); return; }\n    if (this._pointCloudExportBusy) return;\n    this._pointCloudExportBusy = true; this.setState({ pointCloudExportLoading: true });\n    const exportResult = this._pointCloudAcquisition.result, exportNudgeZ = this._nudgeZ;\n    try {\n      if (format === \"ply\" || format === \"las\") {\n        this.showToast(`Preparing ${format.toUpperCase()} export\u2026`, 10000);\n        try {\n          const writer = format === \"las\" ? buildPointCloudLas : buildPointCloudPly;\n          const blob = await writer(exportResult.points, this._nudgeX, this._nudgeY, exportNudgeZ, this._cameraLat);\n          const url = URL.createObjectURL(blob), link = document.createElement(\"a\");\n          link.href = url; link.download = `mapillary_3d_scan_${exportResult.imageId || this.state.imageId}.${format}`;\n          document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);\n          this.showToast(format === \"las\" ? \"LAS exported with WGS84 UTM coordinates and RGB. Source height datum is unverified.\" : \"PLY exported: local metric XYZ and RGB. Origin is recorded in the file.\");\n        } catch (_) { this.showToast(`${format.toUpperCase()} export failed. Check that the cloud has valid coordinates${format === \"las\" ? \" within UTM coverage\" : \"\"}.`); }\n        return;\n      }\n    this.showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n        <div\n          style={{\n            width: \"12px\",\n            height: \"12px\",\n            border: \"2px solid rgba(255,255,255,0.3)\",\n            borderTopColor: \"#fff\",\n            borderRadius: \"50%\",\n            animation: \"spin 1s linear infinite\",\n          }}\n        />\n        Preparing CSV Export...\n      </span>,\n      2000,\n    );\n\n    const csvContent = await buildPointCloudCsv(exportResult.points, this._nudgeX, this._nudgeY, exportNudgeZ, this._cameraLat);\n\n    // 4. Trigger the Browser Download\n    try {\n      const blob = new Blob([csvContent], { type: \"text/csv;charset=utf-8;\" });\n      const url = URL.createObjectURL(blob);\n      const link = document.createElement(\"a\");\n      link.setAttribute(\"href\", url);\n      link.setAttribute(\"download\", `mapillary_3d_scan_${exportResult.imageId || this.state.imageId}.csv`);\n      document.body.appendChild(link);\n      link.click();\n      document.body.removeChild(link);\n      URL.revokeObjectURL(url);\n\n      this.showToast(\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" />\n          Point Cloud Exported!\n        </span>,\n        3000,\n      );\n    } catch (err) {\n      console.error(\"Point Cloud download failed\", err);\n      this.showToast(\"Export failed.\");\n    }\n    } finally { this._pointCloudExportBusy = false; if (!this._sharedNotesDisposed) this.setState({ pointCloudExportLoading: false }); }\n\n  };\n\n  /** Clamp the symmetric along-street crop length, then refresh map, rings and viewer.\n",
          "after": "  private checkAndLoadNextPointCloud = (newImageId: string) => this._pointCloudAcquisition.onImage(newImageId);\n\n  /** Export the retained full cloud; the owner preserves calibration reads and download timing. */\n  private downloadPointCloud = async (format: \"csv\" | \"ply\" | \"las\" = \"csv\") => this._pointCloudExport.download(format);\n\n  /** Clamp the symmetric along-street crop length, then refresh map, rings and viewer.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/point-cloud/csvExport.ts",
      "blocks": [
        {
          "label": "src/features/point-cloud/csvExport.ts point-cloud calibration block 1",
          "before": "/** Retained point-cloud CSV encoding; UI feedback and downloads remain runtime-owned. */\nimport type { PointCloudPoint } from '../../utils/pointCloudUtils';\n\n",
          "after": "/** Retained point-cloud CSV encoding; UI feedback and downloads belong to the export coordinator. */\nimport type { PointCloudPoint } from '../../utils/pointCloudUtils';\n\n"
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
          "before": "\nContributors changing these callbacks must keep unit and ordering comments current and run `tests/pointCloudCalibration.test.cjs`. Its frozen baseline compares actual runtime handlers rather than a second implementation of the new coordinator. Clear/teardown continues cancelling the widget debounce; the coordinator has no disposal work.\n",
          "after": "\nContributors changing these callbacks must keep unit and ordering comments current and run `tests/pointCloudCalibration.test.cjs`. Its frozen baseline compares actual runtime handlers rather than a second implementation of the new coordinator. Clear/teardown continues cancelling the widget debounce; the coordinator has no disposal work.\n\n## Export orchestration\n\n`PointCloudExport.ts` owns the single-flight busy flag and accepted export flow; `PointCloudExportFeedback.tsx` owns existing toast text, JSX and duration. Runtime binds live source/calibration readers, state and actual format writers. CSV/PLY/LAS writer algorithms remain unchanged.\n\nExport borrows the complete retained result rather than display/crop/ground/lasso subsets. The result and vertical offset are captured at acceptance, while horizontal offsets/latitude are read after preparation feedback. Source ID/fallback resolution and the format-specific browser operations retain their original order. Accepted work is not cancelled by cloud closure or replacement; widget disposal suppresses only final loading-state mutation. No point copy, new request, worker or cancellation resource is added.\n\nThe coordinator preserves the existing exception scopes: binary failures notify; CSV download failures log/notify; CSV writer failures propagate while `finally` releases busy/loading. CSV URL revocation is immediate; binary revocation keeps its 1000 ms grace period. Function comments document those deliberate boundaries. The baseline-backed export suite records feedback, writer inputs, browser operations, errors and held-writer races. Real downloads/file import remain host smoke checks.\n"
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
          "before": "Changed files: runtime widget; point-cloud contributor README; ownership document; this roadmap. Added: calibration coordinator, 16 differential regression cases, and immutable original-handler fixture. Validation: 189 regression cases across existing suites and new calibration cases; strict coordinator/runtime-boundary TypeScript; full runtime TSX parsing; guarded installer fixtures for conflicts, rollback, line endings, local edits, install/uninstall and installed tests. The checks do not replace Experience Builder smoke testing of keyboard/Shift, typing guards, joystick, reset, color/ground shortcuts and clearing during pending movement.\n\nNext: extract point-cloud export orchestration while preserving calibrated coordinate inputs, format writer selection, cancellation/error handling, downloads and existing UI feedback.\n",
          "after": "Changed files: runtime widget; point-cloud contributor README; ownership document; this roadmap. Added: calibration coordinator, 16 differential regression cases, and immutable original-handler fixture. Validation: 189 regression cases across existing suites and new calibration cases; strict coordinator/runtime-boundary TypeScript; full runtime TSX parsing; guarded installer fixtures for conflicts, rollback, line endings, local edits, install/uninstall and installed tests. The checks do not replace Experience Builder smoke testing of keyboard/Shift, typing guards, joystick, reset, color/ground shortcuts and clearing during pending movement.\n\nExport orchestration is completed below with calibrated input reads, writer selection, existing error/cleanup scopes, downloads and feedback retained.\n\n## Point-cloud export orchestration\n\nExtracted the single-flight export flow and browser download operations to `src/features/point-cloud/PointCloudExport.ts`; preparation/success/failure messages and JSX live in `PointCloudExportFeedback.tsx`. Runtime is now 13,669 lines (51 fewer). All other existing runtime class members and all format-writer tokens remain unchanged. The old busy field is replaced by a per-widget export coordinator and its explicit live-state/writer adapters.\n\nFunction comments document full-result borrowing, meter/degree units, captured versus live calibration inputs, feedback order, filename fallback timing, original CSV/binary error boundaries, disposal behavior and format-specific URL cleanup. No new filtering, cancellation, worker, point copies or file format change is introduced.\n\nChanged: runtime widget, CSV file header comment, point-cloud contributor README, ownership document and this roadmap. Added: export coordinator, export feedback module, 15 baseline-backed regression cases and immutable original-handler fixture. Validation: 204 total cases including existing point-cloud/playback suites; strict coordinator/feedback/actual runtime adapter/writer types using local Jimu/React declarations; full runtime TSX parsing; token checks for unaffected runtime members/writers; installer fixtures covering conflicts, line endings, local edits, rollback, installed tests and uninstall. Experience Builder build, real browser downloads and file import remain host checks.\n\nNext: extract point-cloud crop/display coordination (length/width controls, corridor subset updates and related feedback), keeping captured-versus-live bearing/dimension reads, clamping, map/ring/viewer order and confirmed-ID ownership intact.\n"
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
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Calibration keyboard/joystick math and ordered commit callbacks | `PointCloudCalibration.ts` |\n| Picking, UI coordination and remaining feature adapters | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Export single-flight flow, captured/live inputs and browser downloads | `PointCloudExport.ts` |\n| Export toast wording, visual feedback and durations | `PointCloudExportFeedback.tsx` |\n| Calibration keyboard/joystick math and ordered commit callbacks | `PointCloudCalibration.ts` |\n| Picking, UI coordination and remaining feature adapters | Point-cloud region in `../../runtime/widget.tsx` (remaining extractions) |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud calibration block 2",
          "before": "\n`tests/pointCloudCalibration.test.cjs` compares actual runtime adapters with the immutable pre-extraction handlers, including exact offsets, toast elements, event prevention, 150 ms scheduling, release coalescing, reset and callback order. Run with `MAPILLARY_TYPESCRIPT` pointing to the host TypeScript module if it is not on the module path. Host checks: keyboard/Shift/typing, joystick steps, reset, RGB/elevation and ground shortcuts, and clear during a pending nudge.\n",
          "after": "\n`tests/pointCloudCalibration.test.cjs` compares actual runtime adapters with the immutable pre-extraction handlers, including exact offsets, toast elements, event prevention, 150 ms scheduling, release coalescing, reset and callback order. Run with `MAPILLARY_TYPESCRIPT` pointing to the host TypeScript module if it is not on the module path. Host checks: keyboard/Shift/typing, joystick steps, reset, RGB/elevation and ground shortcuts, and clear during a pending nudge.\n\n## Export orchestration\n\n`PointCloudExport.ts` owns the per-widget busy flag and CSV/PLY/LAS flow. `PointCloudExportFeedback.tsx` keeps the exact preparation/success/failure feedback together. Runtime supplies current-cloud/calibration readers, real writers, loading state and feedback adapters.\n\n- `download` checks availability before the busy guard. It exports every point in the retained result, independently of crop, display subsets, lasso and ground filtering. Point arrays are borrowed, never cloned.\n- The accepted result and vertical offset are captured after enabling loading state. Horizontal offsets and camera latitude are read after preparation feedback, before invoking a writer. Offsets are meters and latitude is degrees; the writer owns coordinate encoding and height policy.\n- The source image ID remains authoritative for filenames. A missing source ID falls back to the then-current UI image ID at the original post-write anchor boundary.\n- CSV constructs its existing MIME Blob, uses anchor attributes/body removal, and revokes the URL immediately. PLY/LAS use their writer-produced Blob, anchor properties/removal, and the original 1000 ms URL grace period.\n- Accepted work completes even after cloud replacement or closure. Disposal suppresses the final loading-state update only. No new cancellation, background worker, retained point copy or download policy is introduced.\n- Binary errors keep their format-specific toast. CSV browser-download errors are logged/toasted; CSV writer errors propagate through the original `finally`. The busy flag is released in the same scope.\n\nFormat math, output precision, RGB handling and yielding remain in `csvExport.ts` and `../../utils/pointCloudUtils.ts`. Existing writer tokens are unchanged. To modify feedback, start with the feedback file; to modify LAS/PLY coordinates, start with their writers rather than this coordinator.\n\n`tests/pointCloudExport.test.cjs` compares actual runtime adapters against the frozen original handler with recording browser APIs and held writers. It covers default/all formats, point identity, guard/busy order, capture timing, live filename fallback, replacement/closure/disposal, retries, writer/browser failures and exact feedback/download/URL timing. Host smoke checks: download and open CSV/PLY/LAS, verify calibrated coordinates/filenames, repeated export clicks, and closing the cloud during preparation.\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudExport.ts",
      "content": "import type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';\n\nexport type PointCloudExportFormat = 'csv' | 'ply' | 'las';\nexport type PointCloudExportNotice = { kind: 'unavailable' } |\n  { kind: 'preparing' | 'complete' | 'failed'; format: PointCloudExportFormat };\ntype Writer<T> = (points: PointCloudPoint[], east: number, north: number, up: number, cameraLatitude: number) => Promise<T>;\nexport interface PointCloudExportDependencies {\n  canExport(): boolean;\n  /** Read after loading feedback is enabled; borrow the complete retained result, never a filtered copy. */\n  readResult(): PointCloudResult;\n  readVerticalOffset(): number;\n  /** East/north are meters; latitude is degrees. Read after preparation feedback, before the writer. */\n  readHorizontalContext(): { x: number; y: number; latitude: number };\n  readImageId(): string | null | undefined;\n  isDisposed(): boolean;\n  setLoading(loading: boolean): void;\n  notify(notice: PointCloudExportNotice): void;\n  writers: { csv: Writer<string>; ply: Writer<Blob>; las: Writer<Blob> };\n  logError(error: unknown): void;\n}\n\n/** Own single-flight export coordination; writers retain format math, chunking and height policy.\n * No acquisition, crop, lasso, ground filter, cancellation or point copies are introduced.\n * An accepted export finishes with its captured result even if the current cloud changes.\n */\nexport class PointCloudExport {\n  private busy = false;\n  constructor(private readonly dependencies: PointCloudExportDependencies) {}\n\n  /** Preserve guard/feedback order and the original exception boundaries.\n   * Capture result/up after loading state, then read horizontal context after preparation feedback.\n   * Binary failures become notices; CSV writer failures propagate, with busy/loading released in finally.\n   * Teardown suppresses only the final loading-state update, not an already accepted download.\n   */\n  async download(format: PointCloudExportFormat = 'csv'): Promise<void> {\n    const d = this.dependencies;\n    if (!d.canExport()) { d.notify({ kind: 'unavailable' }); return; }\n    if (this.busy) return;\n    this.busy = true; d.setLoading(true);\n    const result = d.readResult(), up = d.readVerticalOffset();\n    try {\n      if (format === 'ply' || format === 'las') {\n        d.notify({ kind: 'preparing', format });\n        try {\n          const writer = format === 'las' ? d.writers.las : d.writers.ply;\n          const horizontal = d.readHorizontalContext();\n          const blob = await writer(result.points, horizontal.x, horizontal.y, up, horizontal.latitude);\n          this.downloadBinary(blob, () => `mapillary_3d_scan_${result.imageId || d.readImageId()}.${format}`);\n          d.notify({ kind: 'complete', format });\n        } catch (_) { d.notify({ kind: 'failed', format }); }\n        return;\n      }\n      d.notify({ kind: 'preparing', format: 'csv' });\n      const horizontal = d.readHorizontalContext();\n      const content = await d.writers.csv(result.points, horizontal.x, horizontal.y, up, horizontal.latitude);\n      try {\n        this.downloadCsv(content, () => `mapillary_3d_scan_${result.imageId || d.readImageId()}.csv`);\n        d.notify({ kind: 'complete', format: 'csv' });\n      } catch (error) {\n        d.logError(error);\n        d.notify({ kind: 'failed', format: 'csv' });\n      }\n    } finally {\n      this.busy = false;\n      if (!d.isDisposed()) d.setLoading(false);\n    }\n  }\n\n  /** Download a writer-produced Blob. Keep anchor removal and the 1000 ms URL grace period.\n   * Browser objects are created only on accepted export, never during module/widget initialization.\n   */\n  private downloadBinary(blob: Blob, filename: () => string): void {\n    const url = URL.createObjectURL(blob), link = document.createElement('a');\n    link.href = url; link.download = filename();\n    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);\n  }\n\n  /** Preserve CSV MIME, attribute setters, body removal and immediate URL revocation.\n   * Resolve the filename after Blob/URL/anchor creation, at its original browser-operation boundary.\n   */\n  private downloadCsv(content: string, filename: () => string): void {\n    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });\n    const url = URL.createObjectURL(blob);\n    const link = document.createElement('a');\n    link.setAttribute('href', url);\n    link.setAttribute('download', filename());\n    document.body.appendChild(link);\n    link.click();\n    document.body.removeChild(link);\n    URL.revokeObjectURL(url);\n  }\n}\n"
    },
    {
      "file": "src/features/point-cloud/PointCloudExportFeedback.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { PointCloudExportNotice } from './PointCloudExport';\n\n/** Keep export wording, visual feedback and toast duration together, separate from format writers.\n * The callback is synchronous; preparation feedback still precedes calibration reads/writer execution.\n */\nexport function showPointCloudExportFeedback(showToast: (content: React.ReactNode, duration?: number) => void, notice: PointCloudExportNotice): void {\n  if (notice.kind === 'unavailable') { showToast('No point cloud available to export.'); return; }\n  const format = notice.format;\n  if (notice.kind === 'preparing') {\n    if (format !== 'csv') { showToast(`Preparing ${format.toUpperCase()} export\u2026`, 10000); return; }\n    showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n        <div\n          style={{\n            width: \"12px\",\n            height: \"12px\",\n            border: \"2px solid rgba(255,255,255,0.3)\",\n            borderTopColor: \"#fff\",\n            borderRadius: \"50%\",\n            animation: \"spin 1s linear infinite\",\n          }}\n        />\n        Preparing CSV Export...\n      </span>,\n      2000,\n    );\n    return;\n  }\n  if (notice.kind === 'complete') {\n    if (format !== 'csv') {\n      showToast(format === \"las\" ? \"LAS exported with WGS84 UTM coordinates and RGB. Source height datum is unverified.\" : \"PLY exported: local metric XYZ and RGB. Origin is recorded in the file.\");\n      return;\n    }\n    showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n        <Icons.Check size={14} color=\"#37d582\" />\n        Point Cloud Exported!\n      </span>,\n      3000,\n    );\n    return;\n  }\n  showToast(format === 'csv' ? 'Export failed.' : `${format.toUpperCase()} export failed. Check that the cloud has valid coordinates${format === \"las\" ? \" within UTM coverage\" : \"\"}.`);\n}\n"
    },
    {
      "file": "tests/pointCloudExport.test.cjs",
      "content": "/** Compare actual runtime export adapters and browser operations with the frozen original handler.\n * Held writers expose single-flight, live/captured values and teardown timing without real downloads.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudExport.baseline.json','utf8'));\nconst sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');\nconst current=['_pointCloudExport','downloadPointCloud'].map(name=>{const n=cl.members.find(n=>n.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n');\nconst deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};\nconst flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};\nfunction setup(kind,{hold=false,failAt=null}={}){\n const trace=[],pending=[],timers=[];let throwAt=failAt;let onToast=()=>{},onBrowser=()=>{};\n function event(name,...args){trace.push([name,...args]);onBrowser(name);if(name===throwAt)throw Error('injected '+name)}\n const URL={createObjectURL:blob=>{event('url',blob);return 'blob:export'},revokeObjectURL:url=>event('revoke',url)};\n const document={createElement:tag=>{event('anchor',tag);return{set href(value){event('href',value)},set download(value){event('filename',value)},setAttribute:(name,value)=>event('attribute',name,value),click:()=>event('click'),remove:()=>event('link-remove')}},body:{appendChild:()=>event('append'),removeChild:()=>event('body-remove')}};\n class Blob{constructor(parts,options){this.parts=parts;this.options=options;event('blob',parts,options)}}\n const setTimeout=(fn,ms)=>{event('timer',ms);timers.push(fn)};\n const jsx=(type,props,...children)=>({type:typeof type==='string'?type:'check',props,children});const Icons={Check:()=>{}};\n const ui={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudExportFeedback.tsx','utf8')))(name=>name==='jimu-core'?{React:{},jsx}:Icons,ui,ui.exports);\n const owner={exports:{}};new Function('module','exports','URL','document','Blob','setTimeout',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudExport.ts','utf8')))(owner,owner.exports,URL,document,Blob,setTimeout);\n function writer(format){return (...args)=>{event('writer',format,...args);const p=deferred();pending.push(p);if(!hold)p.resolve(format==='csv'?'csv-content':{binary:format});return p.promise}}\n const csv=writer('csv'),ply=writer('ply'),las=writer('las');const console={error:(label,error)=>trace.push(['error',label,error.message])};\n const Harness=new Function('PointCloudExport','showPointCloudExportFeedback','buildPointCloudCsv','buildPointCloudPly','buildPointCloudLas','URL','document','Blob','setTimeout','jsx','Icons','console',compile('class Widget{'+(kind==='baseline'?fixture.handler:current)+'};return Widget;'))(owner.exports.PointCloudExport,ui.exports.showPointCloudExportFeedback,csv,ply,las,URL,document,Blob,setTimeout,jsx,Icons,console);\n const w=new Harness();w.state={pointCloudVisible:true,imageId:'current',pointCloudExportLoading:false};const points=[{lon:1,lat:2,altitude:3}];const result={imageId:'source',points};w._pointCloudAcquisition={result};w._pointCloudExportBusy=false;w._sharedNotesDisposed=false;w._nudgeX=1;w._nudgeY=-2;w._nudgeZ=3;w._cameraLat=45;\n w.setState=values=>{Object.assign(w.state,values);trace.push(['state',values])};w.showToast=(...args)=>{trace.push(['toast',...args]);onToast(...args)};\n return{w,trace,pending,timers,result,points,setThrow:value=>throwAt=value,onToast:fn=>onToast=fn,onBrowser:fn=>onBrowser=fn,run:format=>w.downloadPointCloud(format),revoke:()=>timers.splice(0).forEach(fn=>fn())};\n}\nasync function compare(run,options){const a=setup('baseline',options),b=setup('working',options);await run(a);await run(b);assert.deepEqual(structuredClone(b.trace),structuredClone(a.trace));assert.deepEqual(b.w.state,a.w.state);return b}\ntest('CSV/PLY/LAS and default retain writer args, feedback, filename and browser-operation order',async()=>{for(const format of [undefined,'csv','ply','las'])await compare(async h=>{await h.run(format);const call=h.trace.find(x=>x[0]==='writer');assert.strictEqual(call[2],h.points);assert.deepEqual(call.slice(3),[1,-2,3,45]);h.revoke()})});\ntest('exports borrow the full result regardless of crop, ground and lasso settings',async()=>{await compare(async h=>{h.w.state.pointCloudLength=10;h.w.state.isLassoMode=true;h.w._groundMode=true;h.w._filteredPointCloudPoints=[];await h.run('csv');assert.strictEqual(h.trace.find(x=>x[0]==='writer')[2],h.points)})});\ntest('hidden or absent cloud reports unavailable without busy/loading/writer work',async()=>{for(const missing of ['visible','result'])await compare(async h=>{if(missing==='visible')h.w.state.pointCloudVisible=false;else h.w._pointCloudAcquisition.result=null;await h.run('las');assert.deepEqual(h.trace,[['toast','No point cloud available to export.']])})});\ntest('single-flight ignores concurrent exports and accepts another after completion',async()=>{await compare(async h=>{const p=h.run('ply');await h.run('csv');assert.equal(h.pending.length,1);h.pending[0].resolve({binary:'ply'});await p;const q=h.run('las');assert.equal(h.pending.length,2);h.pending[1].resolve({binary:'las'});await q},{hold:true})});\ntest('availability feedback still precedes busy guard while another export is running',async()=>{await compare(async h=>{const p=h.run('las');h.w.state.pointCloudVisible=false;await h.run('csv');assert.equal(h.trace.at(-1)[1],'No point cloud available to export.');h.pending[0].resolve({binary:'las'});await p},{hold:true})});\ntest('capture result and up before preparing feedback; horizontal values stay live until writer invocation',async()=>{for(const format of ['csv','ply'])await compare(async h=>{h.onToast(()=>{h.w._pointCloudAcquisition.result={imageId:'other',points:[]};h.w._nudgeX=8;h.w._nudgeY=9;h.w._nudgeZ=99;h.w._cameraLat=60});await h.run(format);const call=h.trace.find(x=>x[0]==='writer');assert.strictEqual(call[2],h.points);assert.deepEqual(call.slice(3),[8,9,3,60])})});\ntest('cloud replacement while writing does not change accepted points or source filename',async()=>{for(const format of ['csv','las'])await compare(async h=>{const p=h.run(format);h.w._pointCloudAcquisition.result={imageId:'new',points:[]};h.w.state.imageId='new';h.w._nudgeZ=500;h.pending[0].resolve(format==='csv'?'csv-content':{binary:format});await p;assert(h.trace.some(x=>JSON.stringify(x).includes('mapillary_3d_scan_source.')))},{hold:true})});\ntest('missing source ID falls back to current image ID after writer completion',async()=>{for(const format of ['csv','ply'])await compare(async h=>{h.result.imageId='';const p=h.run(format);h.w.state.imageId='later';h.pending[0].resolve(format==='csv'?'csv-content':{binary:format});await p;assert(h.trace.some(x=>JSON.stringify(x).includes('mapillary_3d_scan_later.')))},{hold:true})});\ntest('filename fallback retains its original anchor-creation boundary',async()=>{for(const format of ['csv','ply'])await compare(async h=>{h.result.imageId='';h.onBrowser(name=>{if(name==='anchor')h.w.state.imageId='anchor-time'});await h.run(format);assert(h.trace.some(x=>JSON.stringify(x).includes('mapillary_3d_scan_anchor-time.')))})});\ntest('CSV writer rejection propagates while releasing busy/loading for retry',async()=>{await compare(async h=>{const p=h.run('csv');h.pending[0].reject(Error('writer offline'));await assert.rejects(p,{message:'writer offline'});assert.equal(h.w.state.pointCloudExportLoading,false);assert(!h.trace.some(x=>x[0]==='error'));const q=h.run('csv');h.pending[1].resolve('retry');await q},{hold:true})});\ntest('PLY/LAS writer rejection becomes original format-specific feedback and permits retry',async()=>{for(const format of ['ply','las'])await compare(async h=>{const p=h.run(format);h.pending[0].reject(Error('writer failed'));await p;assert(h.trace.some(x=>x[0]==='toast'&&typeof x[1]==='string'&&x[1].includes('export failed.')));const q=h.run(format);h.pending[1].resolve({binary:format});await q},{hold:true})});\ntest('browser download failures preserve catch/log behavior for each format',async()=>{for(const format of ['csv','ply','las'])for(const failAt of ['url','anchor','append','click',format==='csv'?'body-remove':'link-remove'])await compare(async h=>{await h.run(format);assert.equal(h.w.state.pointCloudExportLoading,false);assert.equal(h.trace.filter(x=>x[0]==='error').length,format==='csv'?1:0)},{failAt})});\ntest('CSV revokes immediately; binary revokes after the original 1000 ms grace period',async()=>{for(const format of ['csv','ply','las'])await compare(async h=>{await h.run(format);assert.equal(h.trace.filter(x=>x[0]==='revoke').length,format==='csv'?1:0);assert.equal(h.trace.filter(x=>x[0]==='timer'&&x[1]===1000).length,format==='csv'?0:1);h.revoke();assert.equal(h.trace.filter(x=>x[0]==='revoke').length,1)})});\ntest('disposal during writing suppresses final setState while preserving accepted download/feedback',async()=>{for(const format of ['csv','las'])await compare(async h=>{const p=h.run(format);h.w._sharedNotesDisposed=true;h.pending[0].resolve(format==='csv'?'csv-content':{binary:format});await p;assert.equal(h.trace.filter(x=>x[0]==='state').length,1);assert(h.trace.some(x=>x[0]==='click'))},{hold:true})});\ntest('clearing/hiding cloud during writing does not cancel an accepted export',async()=>{await compare(async h=>{const p=h.run('ply');h.w._pointCloudAcquisition.result=null;h.w.state.pointCloudVisible=false;h.pending[0].resolve({binary:'ply'});await p;assert(h.trace.some(x=>x[0]==='click'));assert.equal(h.w.state.pointCloudExportLoading,false)},{hold:true})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudExport.baseline.json",
      "content": "{\n  \"handler\": \"  private downloadPointCloud = async (format: \\\"csv\\\" | \\\"ply\\\" | \\\"las\\\" = \\\"csv\\\") => {\\n    if (!this.state.pointCloudVisible || !this._pointCloudAcquisition.result) { this.showToast(\\\"No point cloud available to export.\\\"); return; }\\n    if (this._pointCloudExportBusy) return;\\n    this._pointCloudExportBusy = true; this.setState({ pointCloudExportLoading: true });\\n    const exportResult = this._pointCloudAcquisition.result, exportNudgeZ = this._nudgeZ;\\n    try {\\n      if (format === \\\"ply\\\" || format === \\\"las\\\") {\\n        this.showToast(`Preparing ${format.toUpperCase()} export\\u2026`, 10000);\\n        try {\\n          const writer = format === \\\"las\\\" ? buildPointCloudLas : buildPointCloudPly;\\n          const blob = await writer(exportResult.points, this._nudgeX, this._nudgeY, exportNudgeZ, this._cameraLat);\\n          const url = URL.createObjectURL(blob), link = document.createElement(\\\"a\\\");\\n          link.href = url; link.download = `mapillary_3d_scan_${exportResult.imageId || this.state.imageId}.${format}`;\\n          document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);\\n          this.showToast(format === \\\"las\\\" ? \\\"LAS exported with WGS84 UTM coordinates and RGB. Source height datum is unverified.\\\" : \\\"PLY exported: local metric XYZ and RGB. Origin is recorded in the file.\\\");\\n        } catch (_) { this.showToast(`${format.toUpperCase()} export failed. Check that the cloud has valid coordinates${format === \\\"las\\\" ? \\\" within UTM coverage\\\" : \\\"\\\"}.`); }\\n        return;\\n      }\\n    this.showToast(\\n      <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n        <div\\n          style={{\\n            width: \\\"12px\\\",\\n            height: \\\"12px\\\",\\n            border: \\\"2px solid rgba(255,255,255,0.3)\\\",\\n            borderTopColor: \\\"#fff\\\",\\n            borderRadius: \\\"50%\\\",\\n            animation: \\\"spin 1s linear infinite\\\",\\n          }}\\n        />\\n        Preparing CSV Export...\\n      </span>,\\n      2000,\\n    );\\n\\n    const csvContent = await buildPointCloudCsv(exportResult.points, this._nudgeX, this._nudgeY, exportNudgeZ, this._cameraLat);\\n\\n    // 4. Trigger the Browser Download\\n    try {\\n      const blob = new Blob([csvContent], { type: \\\"text/csv;charset=utf-8;\\\" });\\n      const url = URL.createObjectURL(blob);\\n      const link = document.createElement(\\\"a\\\");\\n      link.setAttribute(\\\"href\\\", url);\\n      link.setAttribute(\\\"download\\\", `mapillary_3d_scan_${exportResult.imageId || this.state.imageId}.csv`);\\n      document.body.appendChild(link);\\n      link.click();\\n      document.body.removeChild(link);\\n      URL.revokeObjectURL(url);\\n\\n      this.showToast(\\n        <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n          <Icons.Check size={14} color=\\\"#37d582\\\" />\\n          Point Cloud Exported!\\n        </span>,\\n        3000,\\n      );\\n    } catch (err) {\\n      console.error(\\\"Point Cloud download failed\\\", err);\\n      this.showToast(\\\"Export failed.\\\");\\n    }\\n    } finally { this._pointCloudExportBusy = false; if (!this._sharedNotesDisposed) this.setState({ pointCloudExportLoading: false }); }\\n\\n  };\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-export-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-export.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited export references remain)');
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
    console.log(uninstall ? 'Point-cloud export is already uninstalled. No files changed.' : 'Point-cloud export is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-export', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud export ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Point-cloud export flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
