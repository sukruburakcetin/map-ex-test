#!/usr/bin/env node
'use strict';
/** Point-cloud result installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx point-cloud result application block 1",
          "before": "import { organizationFilterId } from \"../utils/organizationFilter\";\nimport { OrganizationNameLookup } from \"../features/coverage/organizationNameLookup\";\nimport { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudDisplayExpression, pointCloudCorridorCount, buildPointCloudPly, buildPointCloudLas } from \"../utils/pointCloudUtils\";\nimport { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\n",
          "after": "import { organizationFilterId } from \"../utils/organizationFilter\";\nimport { OrganizationNameLookup } from \"../features/coverage/organizationNameLookup\";\nimport { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudDisplayExpression, buildPointCloudPly, buildPointCloudLas } from \"../utils/pointCloudUtils\";\nimport { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 2",
          "before": "import { nativeCoverageOffsetMeters, nativeCoverageSourceFootprint } from '../features/coverage/nativeCoverageAlignment';\nimport { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudCrop } from '../features/point-cloud/PointCloudCrop';\nimport { PointCloudExport } from '../features/point-cloud/PointCloudExport';\n",
          "after": "import { nativeCoverageOffsetMeters, nativeCoverageSourceFootprint } from '../features/coverage/nativeCoverageAlignment';\nimport { NativeCoverageAlignmentDiagnostic } from '../features/coverage/NativeCoverageAlignmentDiagnostic';\nimport { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudResultApplication } from '../features/point-cloud/PointCloudResultApplication';\nimport { showPointCloudLoadedFeedback, showPointCloudProgressFeedback } from '../features/point-cloud/PointCloudResultFeedback';\nimport { PointCloudCrop } from '../features/point-cloud/PointCloudCrop';\nimport { PointCloudExport } from '../features/point-cloud/PointCloudExport';\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 3",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind crop state and viewer subset authority without retaining a second cloud copy. */\n  private _pointCloudCrop = new PointCloudCrop({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Apply accepted results without duplicating acquisition, scene edits or viewer ownership. */\n  private _pointCloudResult = new PointCloudResultApplication({\n    readState: () => this.state,\n    readAcquisition: () => this._pointCloudAcquisition,\n    readCamera: () => ({ lon: this._cameraLon, lat: this._cameraLat }),\n    setCamera: (lon, lat) => { this._cameraLon = lon; this._cameraLat = lat; },\n    readBearing: () => this.getStreetBearing(),\n    clearLasso: () => this.clearLasso(),\n    resetOffsets: () => { this._nudgeX = 0; this._nudgeY = 0; this._nudgeZ = 0; },\n    setBaseAltitude: altitude => { this._baseAlt = altitude; },\n    setState: patch => this.setState(patch),\n    renderMap: silent => this.renderPointCloudMapLayer(silent),\n    drawRings: radius => this.drawConcentricRings(radius),\n    setFilteredPoints: points => { this._filteredPointCloudPoints = points; },\n    readViewerRenderer: () => this._pointCloudViewerRenderer,\n    resizeViewer: () => this.mapillaryViewer?.resize(),\n    attachViewer: (result, imageId) => this.addViewerPointCloudRenderer(result, imageId),\n    recordIssue: (...args) => this.recordPointCloudIssue(...args),\n    notifyLoaded: (result, points) => showPointCloudLoadedFeedback((...args) => this.showToast(...args), result, points, this.state.pointCloudLength, this.state.pointCloudWidth),\n    config: POINT_CLOUD_CONFIG,\n  });\n  /** Bind crop state and viewer subset authority without retaining a second cloud copy. */\n  private _pointCloudCrop = new PointCloudCrop({\n"
        },
        {
          "label": "src/runtime/widget.tsx point-cloud result application block 4",
          "before": "    this._pointCloudAcquisition.load(isAutoLoading, forceDiscovery);\n\n  /** Apply a current load synchronously, preserving calibration, cropping and notification order.\n   * Acquisition owns the full result reference; map/viewer owners consume the existing subsets.\n   */\n  private acceptPointCloudResult(result: PointCloudResult | null, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {\n    const { imageId, sequenceImages, automatic: isAutoLoading } = session;\n    if (!result) { this.recordPointCloudIssue(\"Cloud unavailable for this image. Try the next image or retry.\", isAutoLoading); return; }\n    const targetImage = sequenceImages.find((img: any) => String(img.id) === String(imageId));\n    const targetLocation = targetImage || result.mapImageLocation || result.computedImageLocation;\n    if (isAutoLoading && this.state.pointCloudFollowImages && pointCloudCorridorCount(result, targetLocation.lon, targetLocation.lat, this.getStreetBearing(), this.state.pointCloudLength, this.state.pointCloudWidth, 100000) > 100000) {\n      this.recordPointCloudIssue(\"This scene corridor exceeds 100,000 points. Reduce length/width or load manually. The next image can still be followed.\", true);\n      return;\n    }\n    // Find the GPS position of the currently active image (The Car/the Person)\n    const activeImage = sequenceImages.find((img: any) => img.id === imageId);\n    this._cameraLon = activeImage ? activeImage.lon : (result.mapImageLocation || result.computedImageLocation).lon;\n    this._cameraLat = activeImage ? activeImage.lat : (result.mapImageLocation || result.computedImageLocation).lat;\n\n    const actualLength = pointCloudLengthExtent(result.points, this._cameraLon, this._cameraLat, POINT_CLOUD_CONFIG.FETCH_LENGTH);\n    const basis = pointCloudCorridorBasis(this.getStreetBearing());\n    const actualWidth = pointCloudWidthExtent(result.points, this._cameraLon, this._cameraLat, basis, POINT_CLOUD_CONFIG.FETCH_WIDTH);\n    this.setState({ pointCloudActualLength: actualLength, pointCloudActualWidth: actualWidth });\n\n    // Save the raw result so the T,F,G,H,R,C keys or UI cp calibration values can use it without re-downloading\n    const preserveCalibration = isAutoLoading && this._pointCloudAcquisition.result?.sfmClusterUrl.split(\"?\")[0] === result.sfmClusterUrl.split(\"?\")[0];\n    if (this._pointCloudAcquisition.result && this.state.isLassoMode) this.clearLasso();\n    this._pointCloudAcquisition.retain(result);\n\n    // Reset the nudge back to 0 for the new image\n    if (!preserveCalibration) { this._nudgeX = 0; this._nudgeY = 0; this._nudgeZ = 0; }\n\n    this.setState({ pointCloudMaxLength: POINT_CLOUD_CONFIG.LENGTH_MAX });\n\n    // Source-altitude floor is estimated without sorting or modifying retained points.\n    this._baseAlt = estimatePointCloudFloor(result.points, this._cameraLon, this._cameraLat);\n\n    // Draw the ArcGIS Map\n    this.renderPointCloudMapLayer(true);\n    this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);\n\n    // Draw the Mapillary Viewer Overlay\n\n    const currentLength = this.state.pointCloudLength;\n    const halfWidth = this.state.pointCloudWidth;\n\n    const initialPoints = filterPointCloudCorridor(result.points, this._cameraLon, this._cameraLat, basis, currentLength, halfWidth);\n\n    this._filteredPointCloudPoints = initialPoints;\n\n    // Pass a shallow copy of result with filtered points for the viewer\n    // The acquisition owner still holds the full unfiltered cloud\n    if (this._pointCloudViewerRenderer?.ready) {\n      this._pointCloudViewerRenderer.setHighlight(-1);\n      this._pointCloudViewerRenderer.updatePoints(initialPoints);\n      this.mapillaryViewer?.resize();\n    } else this.addViewerPointCloudRenderer({ ...result, points: initialPoints }, imageId);\n\n    this.setState({\n      pointCloudLoading: false,\n      pointCloudVisible: true,\n      pointCloudAvailable: true,\n      pointCloudPrevious: false, pointCloudAutoPaused: false,\n      pointCloudIncomplete: !!result.diagnostics?.partial,\n      pointCloudSummary: summarizePointCloud(result, initialPoints.length),\n    });\n\n    session.finishProgress();\n\n    const totalPoints = result.points.length;\n    const dupes = result.duplicatesRemoved;\n    const visiblePoints = initialPoints.length;\n\n    // Final success toast with dedup stats\n    this.showToast(\n      <span style={{ display: \"flex\", flexDirection: \"column\", gap: \"3px\" }}>\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" />\n          <b>Point cloud loaded:</b> {result.clusterCount} cluster{result.clusterCount !== 1 ? \"s\" : \"\"}\n        </span>\n        <span style={{ fontSize: \"11px\", color: \"rgba(255,255,255,0.75)\", paddingLeft: \"20px\" }}>\n          {totalPoints.toLocaleString()} pts total\n          {dupes > 0 ? ` \u00b7 ${dupes.toLocaleString()} dupes removed` : \"\"}\n        </span>\n        <span style={{ fontSize: \"11px\", color: \"rgba(255,255,255,0.6)\", paddingLeft: \"20px\" }}>\n          {visiblePoints.toLocaleString()} pts visible at {this.state.pointCloudLength}m \u00d7 {this.state.pointCloudWidth}m\n        </span>\n        <span style={{ fontSize: \"10px\", color: \"rgba(255,255,255,0.5)\", paddingLeft: \"20px\" }}>Use T, F, G, H, R, V to align or use calibration panel.</span>\n      </span>,\n      6000,\n    );\n    if (result.diagnostics?.partial) this.recordPointCloudIssue(\"Some cloud data could not be loaded for this image. \" + summarizePointCloud(result, initialPoints.length), isAutoLoading, \"Cloud partly loaded. Check the cloud status card for details and recovery.\");\n    else { this._pointCloudAcquisition.resetFailures(); this.setState({ pointCloudAutoPaused: false }); }\n  }\n\n  /** Present acquisition progress after the owner's current-request/progress guards pass. */\n  private showPointCloudProgress(status: string, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {\n    const loadingPrefix = session.automatic ? \"Auto-loading next segment\" : \"Downloading 3D Point Cloud\";\n    this.showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"8px\" }}>\n        <div\n          style={{\n            width: \"12px\",\n            height: \"12px\",\n            border: \"2px solid rgba(255,255,255,0.3)\",\n            borderTopColor: \"#fff\",\n            borderRadius: \"50%\",\n            animation: \"spin 1s linear infinite\",\n          }}\n        />\n        <span>\n          <b>{loadingPrefix}:</b> {status}\n        </span>\n      </span>,\n      15000,\n      \"point-cloud-progress\",\n    );\n  }\n\n",
          "after": "    this._pointCloudAcquisition.load(isAutoLoading, forceDiscovery);\n\n  /** Acquisition has validated request identity; apply its result synchronously through the feature. */\n  private acceptPointCloudResult(result: PointCloudResult | null, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {\n    this._pointCloudResult.apply(result, session);\n  }\n\n  /** Forward guarded acquisition progress with the original toast owner and duration. */\n  private showPointCloudProgress(status: string, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {\n    showPointCloudProgressFeedback((...args) => this.showToast(...args), status, session.automatic);\n  }\n\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudResultApplication",
        "showPointCloudLoadedFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudResultApplication",
          "count": 3
        },
        {
          "text": "showPointCloudLoadedFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "tests/pointCloudGeometry.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudGeometry.test.cjs point-cloud result application block 1",
          "before": "// The count helper also needs the same distance-independent candidate envelope.\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?metric:cloud,m,m.exports);const geometry=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return [...(kind==='working'?['_pointCloudCrop']:[]),'acceptPointCloudResult','renderPointCloudMapLayer','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(m=>m.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst policy={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(policy,policy.exports);\nconst crop={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudCrop.ts','utf8')))(()=>geometry,crop,crop.exports);\nconst globals={...crop.exports,...policy.exports,...geometry,...metric,...cloud,POINT_CLOUD_CONFIG:{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300,WIDTH_MAX:80,GROUND_MODE_HEIGHT_M:1.5},jsx:(tag,props,...children)=>({tag,props:props||{},children}),Icons:{Check:'check'}};\nconst Harness={};for(const kind of ['baseline','working'])Harness[kind]=new Function(...Object.keys(globals),compile('class Harness {'+methods(kind)+'};return Harness;'))(...Object.values(globals));\nconst clone=x=>structuredClone(x);\n",
          "after": "// The count helper also needs the same distance-independent candidate envelope.\nconst m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudGeometry.ts','utf8')))(id=>id.endsWith('/geoUtils')?metric:cloud,m,m.exports);const geometry=m.exports;\nfunction methods(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return [...(kind==='working'?['_pointCloudCrop','_pointCloudResult']:[]),'acceptPointCloudResult','renderPointCloudMapLayer','handlePointCloudLengthChange','handlePointCloudWidthChange'].map(name=>{const n=cl.members.find(m=>m.name?.getText(sf)===name);assert(n,name);return n.getText(sf)}).join('\\n')}\nconst policy={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/pointCloudMapPolicy.ts','utf8')))(policy,policy.exports);\nconst crop={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudCrop.ts','utf8')))(()=>geometry,crop,crop.exports);\nconst application={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudResultApplication.ts','utf8')))(id=>id==='./pointCloudGeometry'?geometry:cloud,application,application.exports);\nconst feedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudResultFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx:(tag,props,...children)=>({tag,props:props||{},children})}:{Check:'check'},feedback,feedback.exports);\nconst globals={...feedback.exports,...application.exports,...crop.exports,...policy.exports,...geometry,...metric,...cloud,POINT_CLOUD_CONFIG:{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300,WIDTH_MAX:80,GROUND_MODE_HEIGHT_M:1.5},jsx:(tag,props,...children)=>({tag,props:props||{},children}),Icons:{Check:'check'}};\nconst Harness={};for(const kind of ['baseline','working'])Harness[kind]=new Function(...Object.keys(globals),compile('class Harness {'+methods(kind)+'};return Harness;'))(...Object.values(globals));\nconst clone=x=>structuredClone(x);\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudResultApplication"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudResultApplication",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/pointCloudAcquisition.test.cjs",
      "blocks": [
        {
          "label": "tests/pointCloudAcquisition.test.cjs point-cloud result application block 1",
          "before": "const mod={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudAcquisition.ts','utf8')))(mod,mod.exports);\nconst {PointCloudAcquisition}=mod.exports,fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudAcquisition.baseline.json','utf8'));\nfunction members(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return (kind==='baseline'?['loadPointCloudLayer','performPointCloudLoad','checkAndLoadNextPointCloud','recordPointCloudIssue']:['_pointCloudAcquisition','loadPointCloudLayer','acceptPointCloudResult','showPointCloudProgress','checkAndLoadNextPointCloud','recordPointCloudIssue']).map(name=>{const m=cl.members.find(n=>n.name?.getText(sf)===name);assert(m,name);return m.getText(sf)}).join('\\n')}\n// Bind the same distance dependency as the baseline recording harness; map preparation\n// is covered by the map/geometry suites, so acquisition only needs the pure crop/floor API.\n",
          "after": "const mod={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudAcquisition.ts','utf8')))(mod,mod.exports);\nconst {PointCloudAcquisition}=mod.exports,fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudAcquisition.baseline.json','utf8'));\nfunction members(kind){const sf=ts.createSourceFile('widget.tsx',kind==='baseline'?fixture.source:fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');return (kind==='baseline'?['loadPointCloudLayer','performPointCloudLoad','checkAndLoadNextPointCloud','recordPointCloudIssue']:['_pointCloudResult','_pointCloudAcquisition','loadPointCloudLayer','acceptPointCloudResult','showPointCloudProgress','checkAndLoadNextPointCloud','recordPointCloudIssue']).map(name=>{const m=cl.members.find(n=>n.name?.getText(sf)===name);assert(m,name);return m.getText(sf)}).join('\\n')}\n// Bind the same distance dependency as the baseline recording harness; map preparation\n// is covered by the map/geometry suites, so acquisition only needs the pure crop/floor API.\n"
        },
        {
          "label": "tests/pointCloudAcquisition.test.cjs point-cloud result application block 2",
          "before": " const metric=(a,b,c,d)=>Math.hypot(a-c,b-d)*111320;\n const geometry={exports:{}};loadGeometry(id=>id.endsWith('/geoUtils')?{distanceMeters:metric}:{},geometry,geometry.exports);\n const Harness=new Function('PointCloudAcquisition','loadPointCloud','POINT_CLOUD_CONFIG','distanceMeters','pointCloudCorridorCount','summarizePointCloud','setTimeout','clearTimeout','jsx','Icons','console','geometry',compile('const {pointCloudCorridorBasis,pointCloudLengthExtent,pointCloudWidthExtent,estimatePointCloudFloor,filterPointCloudCorridor}=geometry; class Harness {'+members(kind)+'};return Harness;'))(PointCloudAcquisition,load,{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300},metric,r=>r.count||0,(r,n)=>'summary '+n,schedule,cancel,jsx,{Check:'check'},{warn:(...args)=>trace.push(['warn',...args.map(x=>x instanceof Error?x.message:x)])},geometry.exports);\n const w=new Harness(),view={type:'3d',map:{},destroyed:false};\n w.state={jimuMapView:{view},imageId:'A',sequenceId:'S',sequenceImages:[point('A')],isFullscreen:false,pointCloudVisible:false,pointCloudLoading:false,pointCloudFollowImages:true,pointCloudAutoPaused:false,pointCloudLength:0,pointCloudWidth:0,...state};\n",
          "after": " const metric=(a,b,c,d)=>Math.hypot(a-c,b-d)*111320;\n const geometry={exports:{}};loadGeometry(id=>id.endsWith('/geoUtils')?{distanceMeters:metric}:{},geometry,geometry.exports);\n const application={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudResultApplication.ts','utf8')))(id=>id==='./pointCloudGeometry'?geometry.exports:{pointCloudCorridorCount:r=>r.count||0,summarizePointCloud:(r,n)=>'summary '+n},application,application.exports);\n const feedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/PointCloudResultFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx}:{Check:'check'},feedback,feedback.exports);\n const Harness=new Function('PointCloudAcquisition','loadPointCloud','POINT_CLOUD_CONFIG','distanceMeters','pointCloudCorridorCount','summarizePointCloud','setTimeout','clearTimeout','jsx','Icons','console','geometry','application','feedback',compile('const {PointCloudResultApplication}=application; const {showPointCloudLoadedFeedback,showPointCloudProgressFeedback}=feedback; const {pointCloudCorridorBasis,pointCloudLengthExtent,pointCloudWidthExtent,estimatePointCloudFloor,filterPointCloudCorridor}=geometry; class Harness {'+members(kind)+'};return Harness;'))(PointCloudAcquisition,load,{FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300},metric,r=>r.count||0,(r,n)=>'summary '+n,schedule,cancel,jsx,{Check:'check'},{warn:(...args)=>trace.push(['warn',...args.map(x=>x instanceof Error?x.message:x)])},geometry.exports,application.exports,feedback.exports);\n const w=new Harness(),view={type:'3d',map:{},destroyed:false};\n w.state={jimuMapView:{view},imageId:'A',sequenceId:'S',sequenceImages:[point('A')],isFullscreen:false,pointCloudVisible:false,pointCloudLoading:false,pointCloudFollowImages:true,pointCloudAutoPaused:false,pointCloudLength:0,pointCloudWidth:0,...state};\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudResultApplication",
        "showPointCloudLoadedFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudResultApplication",
          "count": 2
        },
        {
          "text": "showPointCloudLoadedFeedback",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/POINT-CLOUD-OWNERSHIP.md",
      "blocks": [
        {
          "label": "docs/POINT-CLOUD-OWNERSHIP.md point-cloud result application block 1",
          "before": "\nThe coordinator owns no timer, listener, layer, retained cloud or duplicate subset state. Queued callbacks preserve the current scheduling policy. Function comments and the baseline-backed crop suite document clamping, capture timing, point identity, replacement/closure and callback ordering. The existing geometry suite still checks actual feature/confirmed-index order through the real runtime adapters.\n",
          "after": "\nThe coordinator owns no timer, listener, layer, retained cloud or duplicate subset state. Queued callbacks preserve the current scheduling policy. Function comments and the baseline-backed crop suite document clamping, capture timing, point identity, replacement/closure and callback ordering. The existing geometry suite still checks actual feature/confirmed-index order through the real runtime adapters.\n\n## Initial result application and presentation\n\n`PointCloudResultApplication.ts` synchronously applies an already-current acquisition result. Runtime supplies typed live state/acquisition/camera/viewer adapters; `PointCloudResultFeedback.tsx` owns existing success/progress JSX and toast timing. No request, timer, duplicate cloud store, SDK layer or GL renderer is transferred into this feature.\n\nThe full result remains acquisition-owned. Automatic preflight threshold, camera selection/fallbacks, extents/basis/floor calculations, same-cluster calibration retention, prior-lasso cleanup and initial subset order are retained. Map/rings precede renderer reuse/attachment; subset authority is assigned before upload. Status/finish-progress/success/partial issue ordering remains synchronous, including existing batched-state reads. The feature does not add current-request checks; acquisition supplies them before invoking it.\n\nFunction comments document degrees/meters, source altitude policy, strict versus string-normalized ID matching and authority/order boundaries. Baseline-backed tests verify real geometry/summary/count helpers plus feedback properties, ready/unready viewer behavior, null/empty/partial results and the automatic follow limit. Host validation still needs real initial/follow loads, calibration/lasso carryover, viewer recreation and progress cleanup.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudResultApplication",
        "## Initial result application and presentation"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudResultApplication",
          "count": 1
        },
        {
          "text": "## Initial result application and presentation",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md point-cloud result application block 1",
          "before": "Changed: runtime widget, contributor README, ownership document, this roadmap and the geometry test harness (binds the real crop coordinator; original assertions/fixture retained). Added: crop coordinator, 15 differential cases and immutable original-control fixture. Validation: 219 total point-cloud/playback cases, strict coordinator and actual runtime adapter checks using real viewer/point types, full TSX parse, structural preservation checks and guarded installer fixtures. Host checks remain rapid sliders/unlimited dimensions, cloud closure/replacement, viewer recreation and lasso alignment after cropping.\n\nNext: extract initial point-cloud result application and presentation, preserving camera/extents/floor preparation, same-cluster calibration retention, initial map/viewer ordering and existing progress/summary feedback.\n",
          "after": "Changed: runtime widget, contributor README, ownership document, this roadmap and the geometry test harness (binds the real crop coordinator; original assertions/fixture retained). Added: crop coordinator, 15 differential cases and immutable original-control fixture. Validation: 219 total point-cloud/playback cases, strict coordinator and actual runtime adapter checks using real viewer/point types, full TSX parse, structural preservation checks and guarded installer fixtures. Host checks remain rapid sliders/unlimited dimensions, cloud closure/replacement, viewer recreation and lasso alignment after cropping.\n\nInitial result application and presentation are completed below, with camera/extents/floor preparation, same-cluster calibration retention, initial map/viewer order and progress/summary feedback retained.\n\n## Initial point-cloud result application and feedback\n\nExtracted synchronous accepted-result orchestration into `src/features/point-cloud/PointCloudResultApplication.ts` and success/progress presentation into `PointCloudResultFeedback.tsx`. Runtime is now 13,537 lines (84 fewer). Its result/progress methods forward to feature entry points; explicit adapters bind current acquisition, camera, calibration, state, map, rings and viewer. Other existing runtime class members remain token-identical; geometry/acquisition/point-cloud utilities remain unchanged.\n\nFunction comments document full-result borrowing, subset identity, original preflight/ID/camera rules, source altitude units, query-insensitive same-cluster calibration retention and callback order. Acquisition still validates request identity before synchronous application and owns late progress suppression. No new scheduling, request, cloud store, SDK resource or UI behavior is introduced.\n\nChanged: runtime, contributor README, ownership document, roadmap and geometry/acquisition test harnesses (actual module binding only; original fixtures/assertions retained). Added: application module, feedback module, 15 baseline-backed cases and frozen original result/progress fixture. Validation: 234 point-cloud/playback cases; strict application/feedback/actual runtime boundary checks with actual ArcGIS session and viewer/point types plus local Jimu declarations; full TSX parse; structural preservation and guarded installer checks. Experience Builder smoke checks remain initial/automatic loading, calibration/lasso preservation, viewer replacement and partial/progress feedback.\n\nNext: review remaining point-cloud activation/clear lifecycle and tool deactivation coordination as a separate boundary, preserving teardown order, debounce cancellation and acquisition/map/viewer ownership. Avoid combining unrelated runtime features into a generic controller.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudResultApplication",
        "## Initial point-cloud result application and feedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudResultApplication",
          "count": 1
        },
        {
          "text": "## Initial point-cloud result application and feedback",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/point-cloud/README.md",
      "blocks": [
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 1",
          "before": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Crop length/width clamping and map/ring/viewer subset coordination | `PointCloudCrop.ts` |\n| Export single-flight flow, captured/live inputs and browser downloads | `PointCloudExport.ts` |\n",
          "after": "| Acquisition queue, cancellation, auto-follow and retained result | `PointCloudAcquisition.ts` |\n| Crop, extent/floor and calibrated plain-feature calculations | `pointCloudGeometry.ts` |\n| Accepted result application, calibration retention and initial subset/update order | `PointCloudResultApplication.ts` |\n| Loaded/progress toast wording, JSX, duration and ownership | `PointCloudResultFeedback.tsx` |\n| Crop length/width clamping and map/ring/viewer subset coordination | `PointCloudCrop.ts` |\n| Export single-flight flow, captured/live inputs and browser downloads | `PointCloudExport.ts` |\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 2",
          "before": "Shader source, coordinate conversion, point order/identity, color thresholds, alpha policy, attribute/depth ordering, GL deletion list and lasso attribute lookup/upload behavior are preserved. Changes to those policies belong in a separate behavior change. In particular, do not infer new lasso shader behavior or expanded buffer deletion from this structural extraction.\n\nRegistration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. `lassoProjection.ts` owns numerical lasso hit testing; runtime retains calibration/crop intent; `pointCloudGeometry.ts` prepares geometry; `PointCloudAcquisition` owns acquisition and follow scheduling. A broader cloud controller is still pending; do not move the whole widget into this renderer owner.\n\n## Verification\n",
          "after": "Shader source, coordinate conversion, point order/identity, color thresholds, alpha policy, attribute/depth ordering, GL deletion list and lasso attribute lookup/upload behavior are preserved. Changes to those policies belong in a separate behavior change. In particular, do not infer new lasso shader behavior or expanded buffer deletion from this structural extraction.\n\nRegistration now remembers the creating viewer so cleanup can still target it after the runtime viewer reference is replaced or cleared. The scene-layer owner retains confirmed features and ObjectID maps. `lassoProjection.ts` owns numerical lasso hit testing; `PointCloudCalibration.ts`/`PointCloudCrop.ts` coordinate calibration/crop intent; `pointCloudGeometry.ts` prepares geometry; `PointCloudAcquisition` owns acquisition and follow scheduling. Keep accepted-result application, activation/clear coordination and independent resource owners separate; do not move the whole widget into this renderer owner.\n\n## Verification\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 3",
          "before": "## Acquisition owner\n\nStart with `PointCloudAcquisition.ts` for load serialization, cancellation/deadlines, delayed follow, activation/failure intent and retained full-result identity. Start with `pointCloudGeometry.ts` for floor/crop/feature calculations and the runtime `acceptPointCloudResult` adapter for calibration intent and presentation. Cluster discovery, cache, download and decoding remain in their existing utilities/workers. Keep these boundaries separate when contributing.\n\n- `load(automatic, forceDiscovery)` waits for previous acquisition and scene edits; only the latest still-current queued start proceeds.\n",
          "after": "## Acquisition owner\n\nStart with `PointCloudAcquisition.ts` for load serialization, cancellation/deadlines, delayed follow, activation/failure intent and retained full-result identity. Start with `pointCloudGeometry.ts` for floor/crop/feature calculations and `PointCloudResultApplication.ts`/`PointCloudResultFeedback.tsx` for accepted-result orchestration and presentation. Cluster discovery, cache, download and decoding remain in their existing utilities/workers. Keep these boundaries separate when contributing.\n\n- `load(automatic, forceDiscovery)` waits for previous acquisition and scene edits; only the latest still-current queued start proceeds.\n"
        },
        {
          "label": "src/features/point-cloud/README.md point-cloud result application block 4",
          "before": "\nFunction comments spell out the deliberate length/width timing difference. `tests/pointCloudCrop.test.cjs` compares actual adapters with frozen original controls under immediate/batched state scheduling. Existing geometry tests bind the real crop module while retaining their baseline fixtures and assertions. Host smoke checks: rapid length/width changes, unlimited dimensions, cloud closure, viewer recreation, and lasso alignment after crop changes.\n",
          "after": "\nFunction comments spell out the deliberate length/width timing difference. `tests/pointCloudCrop.test.cjs` compares actual adapters with frozen original controls under immediate/batched state scheduling. Existing geometry tests bind the real crop module while retaining their baseline fixtures and assertions. Host smoke checks: rapid length/width changes, unlimited dimensions, cloud closure, viewer recreation, and lasso alignment after crop changes.\n\n## Initial result application and feedback\n\n`PointCloudResultApplication.ts` applies results synchronously after acquisition validates the current request. `PointCloudResultFeedback.tsx` presents loaded/progress feedback. Acquisition retains the full result and owns requests, deadlines and late-progress guards; the application feature owns no second cache, promise, timer, layer or renderer.\n\n- Automatic follow retains the original greater-than-100,000 corridor limit before state/retention changes. Preflight lookup normalizes IDs to strings; camera selection deliberately retains strict ID equality and map/computed-location fallbacks.\n- Extents use shifted WGS84 camera coordinates and meter limits. The basis is captured before width estimation and reused for initial viewer filtering. Floor estimation remains in the geometry helper with source altitude units/datum unchanged.\n- Compare cluster URLs without query strings for automatic calibration retention. Clear prior lasso selection before retaining the new full result. Other accepted loads reset all three meter offsets.\n- Preserve extents \u2192 retention/calibration \u2192 maximum length/floor \u2192 silent map rebuild \u2192 explicit rings \u2192 store viewer subset \u2192 update or attach renderer \u2192 status \u2192 finish progress \u2192 success toast \u2192 partial issue/failure reset order.\n- A ready viewer clears highlight before updating the same subset array, then resizes. An unready/absent renderer receives the existing shallow result wrapper with filtered points; acquisition still holds the full result.\n- Loaded feedback retains counts, duplicate text, dimensions and 6000 ms duration. Progress retains manual/automatic wording, 15000 ms duration and the `point-cloud-progress` toast owner. Partial results keep their recovery message and failure history.\n\nThe coordinator intentionally adds no asynchronous state callback or extra stale-result policy. Call it only through acquisition's guarded result callback. `tests/pointCloudResult.test.cjs` compares actual adapters/feedback with immutable original handlers and real geometry/count/summary helpers, including immediate/batched React state behavior, reuse/attachment, partial/null/empty results and auto-follow limits. The existing geometry and acquisition suites keep their original fixtures/assertions and now bind these modules. Host checks: initial/automatic loads, same-cluster calibration, lasso replacement, partial recovery, viewer recreation and progress completion.\n"
        }
      ],
      "absentAfterUninstall": [
        "PointCloudResultApplication",
        "## Initial result application and feedback"
      ],
      "requiredOccurrences": [
        {
          "text": "PointCloudResultApplication",
          "count": 3
        },
        {
          "text": "## Initial result application and feedback",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/point-cloud/PointCloudResultApplication.ts",
      "content": "import { pointCloudCorridorBasis, pointCloudLengthExtent, pointCloudWidthExtent, estimatePointCloudFloor, filterPointCloudCorridor } from './pointCloudGeometry';\nimport { pointCloudCorridorCount, summarizePointCloud } from '../../utils/pointCloudUtils';\nimport type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';\nimport type { PointCloudLoadSession } from './PointCloudAcquisition';\n\nexport interface PointCloudResultState {\n  pointCloudFollowImages?: boolean;\n  pointCloudLength: number;\n  pointCloudWidth: number;\n  pointCloudActualLength: number;\n  isLassoMode: boolean;\n}\nexport interface PointCloudResultPatch {\n  pointCloudActualLength?: number; pointCloudActualWidth?: number; pointCloudMaxLength?: number;\n  pointCloudLoading?: boolean; pointCloudVisible?: boolean; pointCloudAvailable?: boolean;\n  pointCloudPrevious?: boolean; pointCloudAutoPaused?: boolean; pointCloudIncomplete?: boolean; pointCloudSummary?: string;\n}\nexport interface PointCloudResultDependencies {\n  readState(): PointCloudResultState;\n  /** Full retained result stays acquisition-owned; no second full-cloud store is created. */\n  readAcquisition(): { result: PointCloudResult | null; retain(result: PointCloudResult): void; resetFailures(): void };\n  /** Shifted map camera position in WGS84 degrees. */\n  readCamera(): { lon: number; lat: number };\n  setCamera(lon: number, lat: number): void;\n  readBearing(): number;\n  clearLasso(): void;\n  resetOffsets(): void;\n  /** Source altitude meters; the original floor estimator supplies no datum conversion. */\n  setBaseAltitude(altitude: number): void;\n  setState(patch: PointCloudResultPatch): void;\n  renderMap(silent: boolean): void;\n  drawRings(radius: number): void;\n  setFilteredPoints(points: PointCloudPoint[]): void;\n  readViewerRenderer(): { readonly ready: boolean; setHighlight(index: number): void; updatePoints(points: PointCloudPoint[]): void } | null;\n  resizeViewer(): void;\n  attachViewer(result: PointCloudResult, imageId: string): void;\n  recordIssue(message: string, automatic: boolean, toast?: string): void;\n  notifyLoaded(result: PointCloudResult, points: PointCloudPoint[]): void;\n  config: { FETCH_LENGTH: number; FETCH_WIDTH: number; LENGTH_MAX: number };\n}\n\n/** Synchronously apply a result already validated by acquisition's current-request guard.\n * This feature owns no request, timer, cloud cache, SDK edit queue or GL renderer.\n * Preserve state/read order: extents, retention/calibration, floor, map/rings, viewer, status/feedback.\n */\nexport class PointCloudResultApplication {\n  constructor(private readonly dependencies: PointCloudResultDependencies) {}\n\n  /** Apply borrowed full-cloud points; initial viewer subset keeps their original order/identity.\n   * Automatic same-cluster loads preserve meter offsets, comparing URLs without query strings.\n   * The preflight uses string-normalized IDs while camera selection retains strict ID equality.\n   */\n  apply<V>(result: PointCloudResult | null, session: PointCloudLoadSession<V>): void {\n    const d = this.dependencies;\n    const { imageId, sequenceImages, automatic: isAutoLoading } = session;\n    if (!result) { d.recordIssue('Cloud unavailable for this image. Try the next image or retry.', isAutoLoading); return; }\n    const targetImage = sequenceImages.find(img => String(img.id) === String(imageId));\n    const targetLocation = targetImage || result.mapImageLocation || result.computedImageLocation;\n    if (isAutoLoading && d.readState().pointCloudFollowImages && pointCloudCorridorCount(result, targetLocation.lon, targetLocation.lat, d.readBearing(), d.readState().pointCloudLength, d.readState().pointCloudWidth, 100000) > 100000) {\n      d.recordIssue('This scene corridor exceeds 100,000 points. Reduce length/width or load manually. The next image can still be followed.', true);\n      return;\n    }\n    const activeImage = sequenceImages.find(img => img.id === imageId);\n    d.setCamera(activeImage ? activeImage.lon : (result.mapImageLocation || result.computedImageLocation).lon,\n      activeImage ? activeImage.lat : (result.mapImageLocation || result.computedImageLocation).lat);\n    let camera = d.readCamera();\n    const actualLength = pointCloudLengthExtent(result.points, camera.lon, camera.lat, d.config.FETCH_LENGTH);\n    const basis = pointCloudCorridorBasis(d.readBearing());\n    camera = d.readCamera();\n    const actualWidth = pointCloudWidthExtent(result.points, camera.lon, camera.lat, basis, d.config.FETCH_WIDTH);\n    d.setState({ pointCloudActualLength: actualLength, pointCloudActualWidth: actualWidth });\n    const preserveCalibration = isAutoLoading && d.readAcquisition().result?.sfmClusterUrl.split('?')[0] === result.sfmClusterUrl.split('?')[0];\n    if (d.readAcquisition().result && d.readState().isLassoMode) d.clearLasso();\n    d.readAcquisition().retain(result);\n    if (!preserveCalibration) d.resetOffsets();\n    d.setState({ pointCloudMaxLength: d.config.LENGTH_MAX });\n    camera = d.readCamera();\n    d.setBaseAltitude(estimatePointCloudFloor(result.points, camera.lon, camera.lat));\n    d.renderMap(true);\n    d.drawRings(d.readState().pointCloudLength <= 0 ? d.readState().pointCloudActualLength : d.readState().pointCloudLength);\n    const currentLength = d.readState().pointCloudLength;\n    const halfWidth = d.readState().pointCloudWidth;\n    camera = d.readCamera();\n    const initialPoints = filterPointCloudCorridor(result.points, camera.lon, camera.lat, basis, currentLength, halfWidth);\n    d.setFilteredPoints(initialPoints);\n    if (d.readViewerRenderer()?.ready) {\n      d.readViewerRenderer()!.setHighlight(-1);\n      d.readViewerRenderer()!.updatePoints(initialPoints);\n      d.resizeViewer();\n    } else d.attachViewer({ ...result, points: initialPoints }, imageId);\n    d.setState({ pointCloudLoading: false, pointCloudVisible: true, pointCloudAvailable: true,\n      pointCloudPrevious: false, pointCloudAutoPaused: false, pointCloudIncomplete: !!result.diagnostics?.partial,\n      pointCloudSummary: summarizePointCloud(result, initialPoints.length) });\n    session.finishProgress();\n    d.notifyLoaded(result, initialPoints);\n    if (result.diagnostics?.partial) d.recordIssue('Some cloud data could not be loaded for this image. ' + summarizePointCloud(result, initialPoints.length), isAutoLoading, 'Cloud partly loaded. Check the cloud status card for details and recovery.');\n    else { d.readAcquisition().resetFailures(); d.setState({ pointCloudAutoPaused: false }); }\n  }\n}\n"
    },
    {
      "file": "src/features/point-cloud/PointCloudResultFeedback.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { PointCloudResult } from '../../utils/pointCloudUtils';\ntype Toast = (content: React.ReactNode, duration?: number, owner?: 'point-cloud-progress') => void;\n\n/** Preserve loaded counts, crop dimensions, duplicate wording and the 6000 ms success feedback. */\nexport function showPointCloudLoadedFeedback(showToast: Toast, result: PointCloudResult, initialPoints: readonly unknown[], length: number, width: number): void {\n    const totalPoints = result.points.length;\n    const dupes = result.duplicatesRemoved;\n    const visiblePoints = initialPoints.length;\n\n    // Final success toast with dedup stats\n    showToast(\n      <span style={{ display: \"flex\", flexDirection: \"column\", gap: \"3px\" }}>\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" />\n          <b>Point cloud loaded:</b> {result.clusterCount} cluster{result.clusterCount !== 1 ? \"s\" : \"\"}\n        </span>\n        <span style={{ fontSize: \"11px\", color: \"rgba(255,255,255,0.75)\", paddingLeft: \"20px\" }}>\n          {totalPoints.toLocaleString()} pts total\n          {dupes > 0 ? ` \u00b7 ${dupes.toLocaleString()} dupes removed` : \"\"}\n        </span>\n        <span style={{ fontSize: \"11px\", color: \"rgba(255,255,255,0.6)\", paddingLeft: \"20px\" }}>\n          {visiblePoints.toLocaleString()} pts visible at {length}m \u00d7 {width}m\n        </span>\n        <span style={{ fontSize: \"10px\", color: \"rgba(255,255,255,0.5)\", paddingLeft: \"20px\" }}>Use T, F, G, H, R, V to align or use calibration panel.</span>\n      </span>,\n      6000,\n    );\n}\n\n/** Present only progress already accepted by acquisition's current-request guards.\n * Keep the progress owner and 15000 ms duration so completion can retire late progress.\n */\nexport function showPointCloudProgressFeedback(showToast: Toast, status: string, automatic: boolean): void {\n    const loadingPrefix = automatic ? \"Auto-loading next segment\" : \"Downloading 3D Point Cloud\";\n    showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"8px\" }}>\n        <div\n          style={{\n            width: \"12px\",\n            height: \"12px\",\n            border: \"2px solid rgba(255,255,255,0.3)\",\n            borderTopColor: \"#fff\",\n            borderRadius: \"50%\",\n            animation: \"spin 1s linear infinite\",\n          }}\n        />\n        <span>\n          <b>{loadingPrefix}:</b> {status}\n        </span>\n      </span>,\n      15000,\n      \"point-cloud-progress\",\n    );\n}\n"
    },
    {
      "file": "tests/pointCloudResult.test.cjs",
      "content": "/** Frozen original result/progress handlers versus actual runtime adapters and real feature math.\n * Recording state/viewer callbacks expose synchronous retention, calibration and feedback ordering.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nfunction functions(file,names,prefix=''){const sf=ts.createSourceFile(file,fs.readFileSync(root+'/src/utils/'+file,'utf8'),ts.ScriptTarget.Latest,true);return new Function(compile(prefix+names.map(name=>sf.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text===name).getText(sf).replace(/^export /,'')).join('\\n')+';return {'+names.join(',')+'};'))()}\nconst metric=functions('geoUtils.ts',['distanceMeters']);const cloud=functions('pointCloudUtils.ts',['pointCloudCandidates','pointCloudCorridorCount','summarizePointCloud'],'const corridorIndexes=new WeakMap();\\n');\nfunction load(file,require){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/point-cloud/'+file,'utf8')))(require,m,m.exports);return m.exports}\nconst geometry=load('pointCloudGeometry.ts',id=>id.endsWith('/geoUtils')?metric:cloud),application=load('PointCloudResultApplication.ts',id=>id==='./pointCloudGeometry'?geometry:cloud);\nconst jsx=(tag,props,...children)=>({tag,props:props||{},children});const Icons={Check:'check'};const feedback=load('PointCloudResultFeedback.tsx',id=>id==='jimu-core'?{jsx}:Icons);\nconst config={FETCH_LENGTH:300,FETCH_WIDTH:30,LENGTH_MAX:300};const fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/pointCloudResult.baseline.json','utf8'));\nconst sf=ts.createSourceFile('widget.tsx',fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const actual=['_pointCloudResult','acceptPointCloudResult','showPointCloudProgress'].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nconst globals={...geometry,...cloud,...application,...feedback,POINT_CLOUD_CONFIG:config,jsx,Icons};const classes={};for(const kind of ['baseline','working'])classes[kind]=new Function(...Object.keys(globals),compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(...Object.values(globals));\nconst point=(x=0,y=0,alt=12)=>({lon:x/111320,lat:y/111320,rawLon:x/111320,rawLat:y/111320,alt,r:100,g:150,b:200});\nfunction setup(kind,{batched=false}={}){\n const w=new classes[kind](),trace=[],pending=[],points=[point(),point(5,10),point(100,100)],result={imageId:'A',points,totalPoints:3,wasDownsampled:false,sfmClusterUrl:'cluster?new',clusterCount:2,duplicatesRemoved:4,computedImageLocation:{lon:0,lat:0},mapImageLocation:{lon:0,lat:0}};\n w.state={pointCloudFollowImages:false,pointCloudLength:20,pointCloudWidth:10,pointCloudActualLength:75,isLassoMode:false};w._cameraLon=0;w._cameraLat=0;w._nudgeX=1;w._nudgeY=-2;w._nudgeZ=3;w._baseAlt=0;w.bearing=30;\n w._pointCloudAcquisition={result:{sfmClusterUrl:'cluster?old'},retain:r=>{trace.push(['retain',r]);w._pointCloudAcquisition.result=r},resetFailures:()=>trace.push(['resetFailures'])};\n let onMap=()=>{};w.setState=patch=>{trace.push(['state',structuredClone(patch)]);const run=()=>Object.assign(w.state,patch);if(batched)pending.push(run);else run()};w.getStreetBearing=()=>{trace.push(['bearing',w.bearing]);return w.bearing};w.clearLasso=()=>trace.push(['lasso']);w.recordPointCloudIssue=(...args)=>trace.push(['issue',...args]);w.showToast=(...args)=>trace.push(['toast',...args]);w.renderPointCloudMapLayer=silent=>{trace.push(['map',silent]);onMap()};w.drawConcentricRings=radius=>trace.push(['rings',radius]);w._filteredPointCloudPoints=[];\n w._pointCloudViewerRenderer={ready:true,setHighlight:i=>trace.push(['highlight',i]),updatePoints:p=>{assert.strictEqual(p,w._filteredPointCloudPoints);trace.push(['points',p])}};w.mapillaryViewer={resize:()=>trace.push(['resize'])};w.addViewerPointCloudRenderer=(r,id)=>trace.push(['attach',r,id]);\n const session={imageId:'A',sequenceImages:[{id:'A',lon:0,lat:0}],automatic:false,finishProgress:()=>trace.push(['finish'])};\n return{w,trace,points,result,session,apply:()=>w.acceptPointCloudResult(result,session),flush:()=>pending.splice(0).forEach(fn=>fn()),onMap:fn=>onMap=fn};\n}\nfunction compare(run,options){const a=setup('baseline',options),b=setup('working',options);run(a);run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);assert.deepEqual([b.w._cameraLon,b.w._cameraLat,b.w._baseAlt,b.w._nudgeX,b.w._nudgeY,b.w._nudgeZ],[a.w._cameraLon,a.w._cameraLat,a.w._baseAlt,a.w._nudgeX,a.w._nudgeY,a.w._nudgeZ]);return b}\ntest('null result reports unavailable and does not mutate retained cloud or render',()=>{compare(h=>{h.w.acceptPointCloudResult(null,h.session);assert.deepEqual(h.trace,[['issue','Cloud unavailable for this image. Try the next image or retry.',false]])})});\ntest('ready renderer retains full result and ordered subset, clears highlight then uploads/resizes',()=>{compare(h=>{h.apply();assert.strictEqual(h.w._pointCloudAcquisition.result,h.result);assert.strictEqual(h.result.points,h.points);const names=h.trace.map(x=>x[0]);assert(names.indexOf('retain')<names.indexOf('map'));assert.deepEqual(names.slice(names.indexOf('highlight'),names.indexOf('highlight')+3),['highlight','points','resize']);assert(names.indexOf('finish')<names.indexOf('toast'))})});\ntest('unready/absent renderer attaches a shallow result with borrowed subset points',()=>{for(const missing of ['unready','absent'])compare(h=>{if(missing==='absent')h.w._pointCloudViewerRenderer=null;else h.w._pointCloudViewerRenderer.ready=false;h.apply();const attached=h.trace.find(x=>x[0]==='attach')[1];assert.notStrictEqual(attached,h.result);assert.strictEqual(attached.points,h.w._filteredPointCloudPoints);assert.strictEqual(h.w._pointCloudAcquisition.result.points,h.points)})});\ntest('automatic same-cluster query changes retain offsets; manual/changed clusters reset',()=>{for(const automatic of [false,true])for(const same of [false,true])compare(h=>{h.session.automatic=automatic;if(!same)h.w._pointCloudAcquisition.result.sfmClusterUrl='other';h.apply();assert.equal(h.w._nudgeX,automatic&&same?1:0)})});\ntest('existing lasso clears before retaining replacement, but not without prior result',()=>{for(const previous of [false,true])compare(h=>{h.w.state.isLassoMode=true;if(!previous)h.w._pointCloudAcquisition.result=null;h.apply();assert.equal(h.trace.some(x=>x[0]==='lasso'),previous);if(previous)assert(h.trace.findIndex(x=>x[0]==='lasso')<h.trace.findIndex(x=>x[0]==='retain'))})});\ntest('automatic followed corridor rejects only above 100000 before retention/render',()=>{for(const count of [100000,100001])compare(h=>{h.session.automatic=true;h.w.state.pointCloudFollowImages=true;h.result.points=Array(count).fill(point());h.apply();assert.equal(h.trace.some(x=>x[0]==='retain'),count===100000);if(count>100000)assert(!h.trace.some(x=>['map','finish','toast'].includes(x[0])))})});\ntest('manual and non-follow loads bypass automatic corridor rejection',()=>{for(const automatic of [false,true])compare(h=>{h.session.automatic=automatic;h.w.state.pointCloudFollowImages=false;h.apply();assert(h.trace.some(x=>x[0]==='retain'))})});\ntest('camera uses strict frame ID equality, then map location, then computed fallback',()=>{for(const mode of ['frame','numeric','map','computed'])compare(h=>{h.session.sequenceImages=mode==='frame'?[{id:'A',lon:.001,lat:.002}]:mode==='numeric'?[{id:1,lon:1,lat:2}]:[];if(mode==='numeric')h.session.imageId='1';if(mode==='computed')delete h.result.mapImageLocation;h.apply();assert.equal(h.w._cameraLon,mode==='frame'?.001:0)})});\ntest('initial bearing basis stays captured while post-map dimensions/camera remain live',()=>{compare(h=>{h.onMap(()=>{h.w.bearing=90;h.w.state.pointCloudLength=5;h.w.state.pointCloudWidth=3;h.w._cameraLon=2/111320});h.apply();assert.equal(h.trace.filter(x=>x[0]==='bearing').length,1);assert(h.trace.some(x=>x[0]==='rings'&&x[1]===5))})});\ntest('partial result reports after success feedback without resetting failure history',()=>{compare(h=>{h.result.diagnostics={partial:true};h.apply();assert(!h.trace.some(x=>x[0]==='resetFailures'));assert(h.trace.findIndex(x=>x[0]==='toast')<h.trace.findIndex(x=>x[0]==='issue'));assert.equal(h.w.state.pointCloudIncomplete,true)})});\ntest('complete result resets failure history after finish/success and clears pause',()=>{compare(h=>{h.apply();assert.deepEqual(h.trace.slice(-2).map(x=>x[0]),['resetFailures','state']);assert.equal(h.w.state.pointCloudAutoPaused,false)})});\ntest('batched state preserves synchronous retention, map/viewer and old-state reads',()=>{compare(h=>{h.w.state.pointCloudLength=0;h.apply();assert.strictEqual(h.w._pointCloudAcquisition.result,h.result);assert(h.trace.some(x=>x[0]==='rings'&&x[1]===75));h.flush();assert.equal(h.w.state.pointCloudVisible,true)},{batched:true})});\ntest('progress text/duration/owner match for manual and automatic loads',()=>{for(const automatic of [false,true])compare(h=>{h.session.automatic=automatic;h.w.showPointCloudProgress('700 / 10000',h.session);assert.equal(h.trace[0][2],15000);assert.equal(h.trace[0][3],'point-cloud-progress')})});\ntest('success feedback preserves cluster pluralization, duplicates, counts and 6000ms duration',()=>{for(const count of [1,2])for(const duplicates of [0,4])compare(h=>{h.result.clusterCount=count;h.result.duplicatesRemoved=duplicates;h.apply();assert.equal(h.trace.find(x=>x[0]==='toast')[2],6000)})});\ntest('empty/frozen source retains original floor behavior and never mutates point order',()=>{for(const empty of [false,true])compare(h=>{if(empty)h.result.points=[];const points=h.result.points;const before=structuredClone(points);points.forEach(Object.freeze);Object.freeze(points);h.apply();assert.deepEqual(points,before);if(empty)assert.equal(h.w._baseAlt,undefined)})});\n"
    },
    {
      "file": "tests/fixtures/pointCloudResult.baseline.json",
      "content": "{\n  \"handlers\": \"  /** Apply a current load synchronously, preserving calibration, cropping and notification order.\\n   * Acquisition owns the full result reference; map/viewer owners consume the existing subsets.\\n   */\\n  private acceptPointCloudResult(result: PointCloudResult | null, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {\\n    const { imageId, sequenceImages, automatic: isAutoLoading } = session;\\n    if (!result) { this.recordPointCloudIssue(\\\"Cloud unavailable for this image. Try the next image or retry.\\\", isAutoLoading); return; }\\n    const targetImage = sequenceImages.find((img: any) => String(img.id) === String(imageId));\\n    const targetLocation = targetImage || result.mapImageLocation || result.computedImageLocation;\\n    if (isAutoLoading && this.state.pointCloudFollowImages && pointCloudCorridorCount(result, targetLocation.lon, targetLocation.lat, this.getStreetBearing(), this.state.pointCloudLength, this.state.pointCloudWidth, 100000) > 100000) {\\n      this.recordPointCloudIssue(\\\"This scene corridor exceeds 100,000 points. Reduce length/width or load manually. The next image can still be followed.\\\", true);\\n      return;\\n    }\\n    // Find the GPS position of the currently active image (The Car/the Person)\\n    const activeImage = sequenceImages.find((img: any) => img.id === imageId);\\n    this._cameraLon = activeImage ? activeImage.lon : (result.mapImageLocation || result.computedImageLocation).lon;\\n    this._cameraLat = activeImage ? activeImage.lat : (result.mapImageLocation || result.computedImageLocation).lat;\\n\\n    const actualLength = pointCloudLengthExtent(result.points, this._cameraLon, this._cameraLat, POINT_CLOUD_CONFIG.FETCH_LENGTH);\\n    const basis = pointCloudCorridorBasis(this.getStreetBearing());\\n    const actualWidth = pointCloudWidthExtent(result.points, this._cameraLon, this._cameraLat, basis, POINT_CLOUD_CONFIG.FETCH_WIDTH);\\n    this.setState({ pointCloudActualLength: actualLength, pointCloudActualWidth: actualWidth });\\n\\n    // Save the raw result so the T,F,G,H,R,C keys or UI cp calibration values can use it without re-downloading\\n    const preserveCalibration = isAutoLoading && this._pointCloudAcquisition.result?.sfmClusterUrl.split(\\\"?\\\")[0] === result.sfmClusterUrl.split(\\\"?\\\")[0];\\n    if (this._pointCloudAcquisition.result && this.state.isLassoMode) this.clearLasso();\\n    this._pointCloudAcquisition.retain(result);\\n\\n    // Reset the nudge back to 0 for the new image\\n    if (!preserveCalibration) { this._nudgeX = 0; this._nudgeY = 0; this._nudgeZ = 0; }\\n\\n    this.setState({ pointCloudMaxLength: POINT_CLOUD_CONFIG.LENGTH_MAX });\\n\\n    // Source-altitude floor is estimated without sorting or modifying retained points.\\n    this._baseAlt = estimatePointCloudFloor(result.points, this._cameraLon, this._cameraLat);\\n\\n    // Draw the ArcGIS Map\\n    this.renderPointCloudMapLayer(true);\\n    this.drawConcentricRings(this.state.pointCloudLength <= 0 ? this.state.pointCloudActualLength : this.state.pointCloudLength);\\n\\n    // Draw the Mapillary Viewer Overlay\\n\\n    const currentLength = this.state.pointCloudLength;\\n    const halfWidth = this.state.pointCloudWidth;\\n\\n    const initialPoints = filterPointCloudCorridor(result.points, this._cameraLon, this._cameraLat, basis, currentLength, halfWidth);\\n\\n    this._filteredPointCloudPoints = initialPoints;\\n\\n    // Pass a shallow copy of result with filtered points for the viewer\\n    // The acquisition owner still holds the full unfiltered cloud\\n    if (this._pointCloudViewerRenderer?.ready) {\\n      this._pointCloudViewerRenderer.setHighlight(-1);\\n      this._pointCloudViewerRenderer.updatePoints(initialPoints);\\n      this.mapillaryViewer?.resize();\\n    } else this.addViewerPointCloudRenderer({ ...result, points: initialPoints }, imageId);\\n\\n    this.setState({\\n      pointCloudLoading: false,\\n      pointCloudVisible: true,\\n      pointCloudAvailable: true,\\n      pointCloudPrevious: false, pointCloudAutoPaused: false,\\n      pointCloudIncomplete: !!result.diagnostics?.partial,\\n      pointCloudSummary: summarizePointCloud(result, initialPoints.length),\\n    });\\n\\n    session.finishProgress();\\n\\n    const totalPoints = result.points.length;\\n    const dupes = result.duplicatesRemoved;\\n    const visiblePoints = initialPoints.length;\\n\\n    // Final success toast with dedup stats\\n    this.showToast(\\n      <span style={{ display: \\\"flex\\\", flexDirection: \\\"column\\\", gap: \\\"3px\\\" }}>\\n        <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n          <Icons.Check size={14} color=\\\"#37d582\\\" />\\n          <b>Point cloud loaded:</b> {result.clusterCount} cluster{result.clusterCount !== 1 ? \\\"s\\\" : \\\"\\\"}\\n        </span>\\n        <span style={{ fontSize: \\\"11px\\\", color: \\\"rgba(255,255,255,0.75)\\\", paddingLeft: \\\"20px\\\" }}>\\n          {totalPoints.toLocaleString()} pts total\\n          {dupes > 0 ? ` \\u00b7 ${dupes.toLocaleString()} dupes removed` : \\\"\\\"}\\n        </span>\\n        <span style={{ fontSize: \\\"11px\\\", color: \\\"rgba(255,255,255,0.6)\\\", paddingLeft: \\\"20px\\\" }}>\\n          {visiblePoints.toLocaleString()} pts visible at {this.state.pointCloudLength}m \\u00d7 {this.state.pointCloudWidth}m\\n        </span>\\n        <span style={{ fontSize: \\\"10px\\\", color: \\\"rgba(255,255,255,0.5)\\\", paddingLeft: \\\"20px\\\" }}>Use T, F, G, H, R, V to align or use calibration panel.</span>\\n      </span>,\\n      6000,\\n    );\\n    if (result.diagnostics?.partial) this.recordPointCloudIssue(\\\"Some cloud data could not be loaded for this image. \\\" + summarizePointCloud(result, initialPoints.length), isAutoLoading, \\\"Cloud partly loaded. Check the cloud status card for details and recovery.\\\");\\n    else { this._pointCloudAcquisition.resetFailures(); this.setState({ pointCloudAutoPaused: false }); }\\n  }\\n\\n  /** Present acquisition progress after the owner's current-request/progress guards pass. */\\n  private showPointCloudProgress(status: string, session: PointCloudLoadSession<__esri.MapView | __esri.SceneView>): void {\\n    const loadingPrefix = session.automatic ? \\\"Auto-loading next segment\\\" : \\\"Downloading 3D Point Cloud\\\";\\n    this.showToast(\\n      <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"8px\\\" }}>\\n        <div\\n          style={{\\n            width: \\\"12px\\\",\\n            height: \\\"12px\\\",\\n            border: \\\"2px solid rgba(255,255,255,0.3)\\\",\\n            borderTopColor: \\\"#fff\\\",\\n            borderRadius: \\\"50%\\\",\\n            animation: \\\"spin 1s linear infinite\\\",\\n          }}\\n        />\\n        <span>\\n          <b>{loadingPrefix}:</b> {status}\\n        </span>\\n      </span>,\\n      15000,\\n      \\\"point-cloud-progress\\\",\\n    );\\n  }\\n\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'point-cloud-result-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-point-cloud-result.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited result-application references remain)');
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
    console.log(uninstall ? 'Point-cloud result is already uninstalled. No files changed.' : 'Point-cloud result is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'point-cloud-result', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Point-cloud result ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Point-cloud result flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
