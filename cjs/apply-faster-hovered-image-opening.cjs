#!/usr/bin/env node
'use strict';
/**
 * Faster hovered-image opening. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Click opening optimization 1",
              "before": "import { CoverageHoverResume } from '../features/coverage/CoverageHoverResume';\nimport { hoverBearingImageId, HoverBearingHintCache } from '../features/imagery/hoverBearingTarget';\n/** @jsx jsx */\n",
              "after": "import { coverageClickHitTest } from '../features/coverage/coverageClickDispatch';\nimport { CoverageHoverResume } from '../features/coverage/CoverageHoverResume';\nimport { hoverBearingImageId, HoverBearingHintCache } from '../features/imagery/hoverBearingTarget';\n/** @jsx jsx */\n"
            },
            {
              "label": "Click opening optimization 2",
              "before": "    if (this.state.isElevationProfileActive && !reuseLoadedRoute) this.clearElevationProfile();\n\n    let imageOpened = false;\n    try {\n      // Fetch only the selected image first; full route loading must not block opening imagery.\n      // Lines need coordinate resolution; exact image points keep their fast opening path.\n",
              "after": "    if (this.state.isElevationProfileActive && !reuseLoadedRoute) this.clearElevationProfile();\n\n    let imageOpened = false;\n    let viewerTiming: ReturnType<SequencePerformance['begin']> | undefined;\n    try {\n      // Fetch only the selected image first; full route loading must not block opening imagery.\n      // Lines need coordinate resolution; exact image points keep their fast opening path.\n"
            },
            {
              "label": "Click opening optimization 3",
              "before": "      this.ensureImageViewer(startImageId);\n      const viewer = this.mapillaryViewer;\n      if (!viewer) throw new Error(\"Image viewer is not ready\");\n      const openedImage = previous?.imageId === startImageId ? await viewer.getImage() : await viewer.moveTo(startImageId);\n      if (!current() || this.mapillaryViewer !== viewer) return;\n      imageOpened = true;\n      // Give the confirmed image a visible browser frame before optional cache/metadata work.\n      this.setState({ isLoading: false, imageryRepresentative: false });\n",
              "after": "      this.ensureImageViewer(startImageId);\n      const viewer = this.mapillaryViewer;\n      if (!viewer) throw new Error(\"Image viewer is not ready\");\n      // Separate widget dispatch latency from the SDK's image-opening promise.\n      if (clickStartedAt !== undefined) this._sequencePerformance?.begin('click-dispatch', clickStartedAt).finish();\n      viewerTiming = this._sequencePerformance?.begin('viewer-open');\n      const openedImage = previous?.imageId === startImageId ? await viewer.getImage() : await viewer.moveTo(startImageId);\n      if (!current() || this.mapillaryViewer !== viewer) return;\n      viewerTiming?.finish();\n      imageOpened = true;\n      // Give the confirmed image a visible browser frame before optional cache/metadata work.\n      this.setState({ isLoading: false, imageryRepresentative: false });\n"
            },
            {
              "label": "Click opening optimization 4",
              "before": "      const unavailable = status === 401 || status === 403 || status === 404;\n      this.setState({ selectionError: unavailable ? this._owned(\"This image is unavailable. Choose another point.\") : this._owned(\"Image could not load. Check your connection, retry, or choose another point.\"), selectionCanRetry: !unavailable });\n    } finally {\n      imageTiming?.cancel();\n      if (this._imageSequenceTiming === imageTiming) this._imageSequenceTiming = undefined;\n      if (requestId === this._selectionRequestId) {\n",
              "after": "      const unavailable = status === 401 || status === 403 || status === 404;\n      this.setState({ selectionError: unavailable ? this._owned(\"This image is unavailable. Choose another point.\") : this._owned(\"Image could not load. Check your connection, retry, or choose another point.\"), selectionCanRetry: !unavailable });\n    } finally {\n      viewerTiming?.cancel();\n      imageTiming?.cancel();\n      if (this._imageSequenceTiming === imageTiming) this._imageSequenceTiming = undefined;\n      if (requestId === this._selectionRequestId) {\n"
            },
            {
              "label": "Click opening optimization 5",
              "before": "  private async prepareDemandSequence(sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {\n    const current = () => !controller.signal.aborted && requestId === this._selectionRequestId && this.state.sequenceId === sequenceId && this.state.jimuMapView?.view === view;\n    try {\n      const cached = await readCachedSequenceCoordinates(this.sequenceCoordsCache, sequenceId, controller.signal);\n      if (!current()) return;\n      if (this._localSequenceDeferredRequest === requestId) this._localSequenceDeferredRequest = null;\n",
              "after": "  private async prepareDemandSequence(sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {\n    const current = () => !controller.signal.aborted && requestId === this._selectionRequestId && this.state.sequenceId === sequenceId && this.state.jimuMapView?.view === view;\n    try {\n      if (!current()) return;\n      // Cached tile feedback is independent of optional persistent route storage.\n      // Local discovery still waits for cache adoption to avoid duplicate requests.\n      if (!this._liveSequenceFrames.complete)\n        void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);\n      const cached = await readCachedSequenceCoordinates(this.sequenceCoordsCache, sequenceId, controller.signal);\n      if (!current()) return;\n      if (this._localSequenceDeferredRequest === requestId) this._localSequenceDeferredRequest = null;\n"
            },
            {
              "label": "Click opening optimization 6",
              "before": "        });\n        await this.renderLiveSequenceLine(cached, sequenceId, requestId, controller, view);\n      } else if (!cached) {\n        void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);\n        void this.refreshLocalSequence();\n        void this.refreshSequenceMarkerWindow();\n      }\n",
              "after": "        });\n        await this.renderLiveSequenceLine(cached, sequenceId, requestId, controller, view);\n      } else if (!cached) {\n        void this.refreshLocalSequence();\n        void this.refreshSequenceMarkerWindow();\n      }\n"
            },
            {
              "label": "Click opening optimization 7",
              "before": "      this.setState({ clickLon: point.longitude, clickLat: point.latitude });\n\n      try {\n        const response = await view.hitTest(evt);\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n",
              "after": "      this.setState({ clickLon: point.longitude, clickLat: point.latitude });\n\n      try {\n        const response = await coverageClickHitTest(!!pointPreviewAtClick, {\n          sharedNotes: !!this._sharedNotesLayer,\n          pointCloud: !!this._pointCloudMapLayer?.layer,\n          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n        }, () => view.hitTest(evt));\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n"
            },
            {
              "label": "Click opening optimization 8",
              "before": "\n        this._mapFeatureClickAbort?.abort();\n        const featureController = new AbortController(); this._mapFeatureClickAbort = featureController;\n        const selectedFeature = featureHit || await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal);\n        if (featureController.signal.aborted) return;\n        if (selectedFeature && (selectedFeature as any).graphic) {\n          this._selectedMapFeature = selectedFeature;\n",
              "after": "\n        this._mapFeatureClickAbort?.abort();\n        const featureController = new AbortController(); this._mapFeatureClickAbort = featureController;\n        // Native detection tiles need a local pick only while a detection mode is active.\n        const selectedFeature = featureHit || (this.state.objectsActive || this.state.trafficSignsActive\n          ? await this.pickMapFeature({ x: evt.x, y: evt.y }, view, featureController.signal) : null);\n        if (featureController.signal.aborted) return;\n        if (selectedFeature && (selectedFeature as any).graphic) {\n          this._selectedMapFeature = selectedFeature;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/imagery/SequencePerformance.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Click opening optimization 1",
              "before": "export const SEQUENCE_PERFORMANCE_KINDS = [\n  'click-image', 'hover-highlight', 'context-ready', 'tile-load', 'sequence-index',\n] as const;\nexport type SequencePerformanceKind = typeof SEQUENCE_PERFORMANCE_KINDS[number];\nexport const SEQUENCE_PERFORMANCE_COUNTERS = [\n",
              "after": "export const SEQUENCE_PERFORMANCE_KINDS = [\n  'click-dispatch', 'viewer-open', 'click-image', 'hover-highlight', 'context-ready', 'tile-load', 'sequence-index',\n] as const;\nexport type SequencePerformanceKind = typeof SEQUENCE_PERFORMANCE_KINDS[number];\nexport const SEQUENCE_PERFORMANCE_COUNTERS = [\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/imageFirstSelection.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Click opening optimization 1",
              "before": " w.state.isLoading=false;await w.refreshLocalSequence();assert.equal(windows,0);\n moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await work;await w.refreshLocalSequence();assert.equal(windows,0);assert.equal(w._liveSequenceFrames.complete,cached);\n});\n",
              "after": " w.state.isLoading=false;await w.refreshLocalSequence();assert.equal(windows,0);\n moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await work;await w.refreshLocalSequence();assert.equal(windows,0);assert.equal(w._liveSequenceFrames.complete,cached);\n});\n\n// Real bounded metrics distinguish widget dispatch from the SDK opening promise.\nconst performanceModule={exports:{}};\nnew Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/imagery/SequencePerformance.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(performanceModule,performanceModule.exports);\ntest('click timing separates dispatch, SDK opening and total image readiness',async()=>{\n const {w,moves}=setup();let now=0;w._sequencePerformance=new performanceModule.exports.SequencePerformance(()=>now);\n const work=w.loadSequenceById('A','1',undefined,false,false,0);\n now=20;await flush();assert(moves.has('1'));\n now=80;moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await work;\n const timings=w._sequencePerformance.snapshot().timings;\n assert.equal(timings['click-dispatch'].lastMs,20);\n assert.equal(timings['viewer-open'].lastMs,60);\n assert.equal(timings['click-image'].lastMs,80);\n});\ntest('a superseded SDK opening does not record successful viewer latency',async()=>{\n const {w,moves}=setup();let now=0;w._sequencePerformance=new performanceModule.exports.SequencePerformance(()=>now);\n const first=w.loadSequenceById('A','1',undefined,false,false,0);await flush();\n now=10;const second=w.loadSequenceById('A','2',undefined,false,false,10);await flush();\n now=30;moves.get('1').resolve({id:'1',originalLngLat:{lng:1,lat:2}});await first;\n assert.equal(w._sequencePerformance.snapshot().timings['viewer-open'].count,0);\n now=50;moves.get('2').resolve({id:'2',originalLngLat:{lng:1,lat:2}});await second;\n assert.equal(w._sequencePerformance.snapshot().timings['viewer-open'].count,1);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/sequencePerformanceRuntime.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Click opening optimization 1",
              "before": "const { CachedSequencePreview } = load('features/imagery/CachedSequencePreview');\nconst { GRAPH_API, LAYER_IDS } = load('utils/constants');\nconst { TURBO_LIMITS } = load('utils/turboCoverageUtils');\nconst { distanceMeters } = load('utils/geoUtils');\nconst source = fs.readFileSync(path.join(root, 'src/runtime/widget.tsx'), 'utf8');\nconst syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);\n",
              "after": "const { CachedSequencePreview } = load('features/imagery/CachedSequencePreview');\nconst { GRAPH_API, LAYER_IDS } = load('utils/constants');\nconst { TURBO_LIMITS } = load('utils/turboCoverageUtils');\nconst { coverageClickHitTest } = load('features/coverage/coverageClickDispatch');\nconst { distanceMeters } = load('utils/geoUtils');\nconst source = fs.readFileSync(path.join(root, 'src/runtime/widget.tsx'), 'utf8');\nconst syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);\n"
            },
            {
              "label": "Click opening optimization 2",
              "before": "    updateTurboPickWarning: message => { throw new Error(message); },\n  };\n  const click = bindCallback(callback('view.on', 'click'), w, {\n    view, GRAPH_API, LAYER_IDS, TURBO_LIMITS, distanceMeters,\n    webMercatorUtils: { webMercatorToGeographic: point => point },\n  });\n  await click({ x: 10, y: 20 });\n",
              "after": "    updateTurboPickWarning: message => { throw new Error(message); },\n  };\n  const click = bindCallback(callback('view.on', 'click'), w, {\n    view, coverageClickHitTest, GRAPH_API, LAYER_IDS, TURBO_LIMITS, distanceMeters,\n    webMercatorUtils: { webMercatorToGeographic: point => point },\n  });\n  await click({ x: 10, y: 20 });\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/coverageClickDispatch.ts",
      "content": "/** Competing click owners must keep their existing SDK hit-test priority. */\nexport interface CoverageClickPriority {\n  sharedNotes: boolean;\n  pointCloud: boolean;\n  places: boolean;\n  detectionFeatures: boolean;\n}\n\n/** A validated individual hover already identifies the image under the pointer.\n * Skip the broad SDK hit test only when no higher-priority owner needs its results.\n * Unhovered points, regional lines and competing tools retain the original path.\n */\nexport function coverageClickHitTest<R extends { results: unknown[] }>(hasHoveredPoint: boolean, priority: CoverageClickPriority,\n  hitTest: () => Promise<R>): Promise<R | { results: [] }> {\n  if (hasHoveredPoint && !Object.values(priority).some(Boolean)) return Promise.resolve({ results: [] });\n  return hitTest();\n}\n"
    },
    {
      "file": "tests/coverageClickDispatch.test.cjs",
      "content": "const fs = require('node:fs');\nconst path = require('node:path');\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\nconst ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');\nconst compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;\nconst owner = { exports: {} };\nnew Function('module', 'exports', compile(fs.readFileSync(path.join(__dirname, '../src/features/coverage/coverageClickDispatch.ts'), 'utf8')))(owner, owner.exports);\nconst { coverageClickHitTest } = owner.exports;\nconst source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');\nconst syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);\nlet click;\nfunction visit(node) {\n  if (ts.isCallExpression(node) && node.expression.getText(syntax) === 'view.on' && node.arguments[0]?.text === 'click') click = node.arguments[1];\n  ts.forEachChild(node, visit);\n}\nvisit(syntax);\nconst flush = () => new Promise(resolve => setImmediate(resolve));\nfunction setup({ hovered = true, priority, detection = false, regional = false } = {}) {\n  let release;\n  const hits = new Promise(resolve => { release = resolve; });\n  const trace = [], geometry = { type: 'point', longitude: 1, latitude: 2 };\n  const view = { type: '3d', zoom: regional ? 8 : 19.9, stationary: true, destroyed: false,\n    toScreen: () => ({ x: 100, y: 100 }), toMap: () => geometry,\n    hitTest: () => { trace.push('SDK hit test'); return hits; } };\n  const widget = { props: { state: 'OPENED' }, state: { turboModeActive: true, jimuMapView: { view },\n    objectsActive: detection, placesActive: priority === 'places' },\n    turboCoverageLayer: {}, _turboRequestCount: 1,\n    _coverageSelectionTargets: { snapshot: () => hovered && !regional ? { imageId: 'exact-image', sequenceId: 'sequence', geometry } : null, retain() {} },\n    coverageSelectionContext: () => ({}), _pointCloudHits: { route: () => false },\n    _turboMetadataCache: { get: () => undefined },\n    ArcGISModules: { Graphic: class { constructor(properties) { Object.assign(this, properties); } } },\n    setState(update) { Object.assign(this.state, update); },\n    pickMapFeature: async () => { trace.push('native detection pick'); return null; },\n    pickTurboGraphic: async () => ({ geometry, attributes: { image_id: 'exact-image', sequence_id: 'sequence' } }),\n    getCoverageDisplayPosition: () => ({ lon: 1, lat: 2 }), drawClickRipple() {},\n    loadSequenceById: async (...args) => { trace.push(['open image', args[0], args[1]]); },\n    showPlacesHit: () => false, showToast() {}, _t: key => key, updateTurboPickWarning() {},\n  };\n  if (priority === 'notes') widget._sharedNotesLayer = {};\n  if (priority === 'cloud') widget._pointCloudMapLayer = { layer: {} };\n  if (priority === 'features') widget.mapillaryObjectsFeatureLayer = {};\n  if (regional) {\n    widget._turboHoverGraphic = { geometry };\n    widget._turboHoveredScreen = { x: 100, y: 100 };\n    widget._currentHoveredFeatureId = 'representative';\n  }\n  const handler = new Function('view', 'coverageClickHitTest', 'TURBO_LIMITS', 'LAYER_IDS', 'webMercatorUtils', 'distanceMeters', 'GRAPH_API', compile('return (' + click.getText(syntax) + ');')).call(widget, view, coverageClickHitTest,\n    { pickRadiusPx: 8 }, { OBJECTS_FL: 'objects', TRAFFIC_SIGNS_FL: 'signs', TURBO_COVERAGE: 'coverage' },\n    { webMercatorToGeographic: point => point }, () => 0, { BASE: 'unused' });\n  return { widget, view, trace, handler: () => handler({ x: 100, y: 100, stopPropagation() {} }), release };\n}\n\ntest('confirmed hovered point reaches image opening without SDK hit testing or inactive detection work', async () => {\n  const x = setup(); await x.handler();\n  assert.deepEqual(x.trace, [['open image', 'sequence', 'exact-image']]);\n});\nfor (const priority of ['notes', 'cloud', 'places', 'features']) test(`${priority} retains the existing awaited SDK priority`, async () => {\n  const x = setup({ priority }); const work = x.handler(); await flush();\n  assert.deepEqual(x.trace, ['SDK hit test']);\n  x.release({ results: [] }); await work;\n  assert.deepEqual(x.trace.at(-1), ['open image', 'sequence', 'exact-image']);\n});\ntest('active native detections still get their pick before imagery opens', async () => {\n  const x = setup({ detection: true }); await x.handler();\n  assert.deepEqual(x.trace, ['native detection pick', ['open image', 'sequence', 'exact-image']]);\n});\ntest('unhovered clicks retain the original SDK path', async () => {\n  const x = setup({ hovered: false }); const work = x.handler(); await flush();\n  assert.deepEqual(x.trace, ['SDK hit test']); x.release({ results: [] }); await work;\n  assert.deepEqual(x.trace.at(-1), ['open image', 'sequence', 'exact-image']);\n});\ntest('regional line previews never enter the exact-point shortcut', async () => {\n  let calls = 0;\n  const response = await coverageClickHitTest(false, { sharedNotes: false, pointCloud: false, places: false, detectionFeatures: false }, async () => { calls++; return { results: ['line'] }; });\n  assert.equal(calls, 1); assert.deepEqual(response.results, ['line']);\n});\ntest('a view/revision change while an SDK lookup waits cannot open a stale hovered image', async () => {\n  const x = setup({ priority: 'notes' }); const work = x.handler(); await flush();\n  x.widget._turboRequestCount++; x.release({ results: [] }); await work;\n  assert.deepEqual(x.trace, ['SDK hit test']);\n});\n\nfor (const priority of ['notes', 'cloud', 'places']) test(`${priority} can consume the click without opening the hovered image`, async () => {\n  const x = setup({ priority });\n  let results = [];\n  if (priority === 'notes') {\n    results = [{ layer: x.widget._sharedNotesLayer, graphic: { geometry: {} } }];\n    x.view.openPopup = () => x.trace.push('note popup');\n  } else if (priority === 'cloud') x.widget._pointCloudHits.route = () => true;\n  else x.widget.showPlacesHit = () => true;\n  const work = x.handler(); x.release({ results }); await work;\n  assert(!x.trace.some(event => Array.isArray(event) && event[0] === 'open image'));\n});\ntest('route picking still intercepts a hovered point before SDK or image work', async () => {\n  const x = setup(); x.widget.state.routePickMode = 'A';\n  x.widget.setRoutePoint = () => x.trace.push('route pick'); await x.handler();\n  assert.deepEqual(x.trace, ['route pick']);\n});\n"
    },
    {
      "file": "tests/sequenceFeedbackScheduling.test.cjs",
      "content": "const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');\nconst ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');\nconst source = fs.readFileSync(path.join(__dirname, '../src/runtime/widget.tsx'), 'utf8');\nconst syntax = ts.createSourceFile('widget.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);\nconst widget = syntax.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'Widget');\nconst method = widget.members.find(node => node.name?.getText(syntax) === 'prepareDemandSequence').getText(syntax);\nfunction setup(complete = null) {\n  let resolve, reject;\n  const storage = new Promise((yes, no) => { resolve = yes; reject = no; });\n  const trace = [], controller = new AbortController(), view = {};\n  const Runtime = new Function('readCachedSequenceCoordinates', ts.transpileModule('class Runtime {' + method + '}; return Runtime;', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText)(() => { trace.push('storage'); return storage; });\n  const w = new Runtime();\n  w.state = { sequenceId: 'sequence', jimuMapView: { view } }; w._selectionRequestId = 1; w._localSequenceDeferredRequest = 1;\n  w._liveSequenceFrames = { complete, finish(_id, route) { this.complete = route; trace.push('adopt route'); } };\n  w.showCachedSequencePreview = async () => trace.push('preview');\n  w.refreshLocalSequence = async () => trace.push('local window');\n  w.refreshSequenceMarkerWindow = async () => trace.push('markers');\n  w.renderLiveSequenceLine = async () => trace.push('full line');\n  w.updateProfileIndicator = () => {};\n  w.setState = (change, callback) => { Object.assign(w.state, typeof change === 'function' ? change() : change); callback?.(); };\n  return { w, controller, trace, resolve, reject, run: () => w.prepareDemandSequence('sequence', 1, controller, view) };\n}\ntest('faint cached preview starts while storage is unresolved, without starting duplicate local downloads', async () => {\n  const x = setup(), work = x.run();\n  assert.deepEqual(x.trace, ['preview', 'storage']);\n  assert.equal(x.w._localSequenceDeferredRequest, 1);\n  x.resolve(null); await work;\n  assert.deepEqual(x.trace, ['preview', 'storage', 'local window', 'markers']);\n});\ntest('a late complete route replaces provisional context without any nearby-window request', async () => {\n  const x = setup(), route = [{ id: 'image', lon: 1, lat: 2 }], work = x.run();\n  x.resolve(route); await work;\n  assert.deepEqual(x.trace, ['preview', 'storage', 'adopt route', 'full line']);\n  assert.equal(x.w._liveSequenceFrames.complete, route);\n});\ntest('storage failure retains the preview and permits local browsing', async () => {\n  const x = setup(), work = x.run(); x.reject(Error('storage unavailable')); await work;\n  assert.deepEqual(x.trace, ['preview', 'storage', 'local window']);\n});\ntest('cancellation or a newer selection prevents late storage from changing context', async () => {\n  for (const cancel of [x => x.controller.abort(), x => x.w._selectionRequestId++]) {\n    const x = setup(), work = x.run(); cancel(x); x.resolve([{ id: 'old' }]); await work;\n    assert.deepEqual(x.trace, ['preview', 'storage']);\n  }\n});\ntest('complete live context does not start a redundant provisional preview', async () => {\n  const route = [{ id: 'image' }], x = setup(route), work = x.run();\n  assert.deepEqual(x.trace, ['storage']); x.resolve(route); await work;\n  assert(!x.trace.includes('preview')); assert(!x.trace.includes('local window'));\n});\ntest('an obsolete request performs no preview or storage work', async () => {\n  const x = setup(); x.w._selectionRequestId++; await x.run(); assert.deepEqual(x.trace, []);\n});\n"
    },
    {
      "file": "docs/FASTER-HOVERED-IMAGE-OPENING.md",
      "content": "# Faster hovered-image opening\n\nA validated individual coverage hover captures the exact image identity before click processing. Previously that click still waited for an unrestricted ArcGIS hit test, and even inactive traffic-sign/object modes called the local detection picker.\n\n`features/coverage/coverageClickDispatch.ts` now bypasses that SDK wait only for a validated individual hover with no shared-note layer, point-cloud layer, active Places mode or legacy detection FeatureLayer. All competing owners retain the original hit test and ordering. Route and annotation interception remains ahead of this decision. Native object/sign modes still execute their local picker when active. Unhovered clicks and regional line previews retain the original SDK path. The captured point's existing view/revision checks remain authoritative.\n\nAfter the image opens, `prepareDemandSequence` starts its bounded cached-tile preview before awaiting persisted full-route storage. This reuses downloaded bytes; it does not fetch a sequence or start a second local-coordinate worker. Nearby discovery still waits for cache adoption, avoiding requests when a complete route is available. Existing preview guards prevent late provisional work from replacing a complete route or newer selection. Native blue selection remains independent of hover feedback.\n\nRegional frame lookup already shares successful hover/click resolution through CoverageFrameLookup. No second frame-selection policy or speculative image download was added.\n\n## Timing\n\nExisting debug diagnostics at `window.__mapillarySequencePerformance[widgetId].snapshot()` now include:\n\n- `click-dispatch`: click timestamp through viewer navigation dispatch, including priority checks and the state-commit wait. Recorded for explicit click timestamps.\n- `viewer-open`: the Mapillary SDK getImage/moveTo promise duration for a current, successful selection. This includes SDK processing, transport, decoding and transitions as represented by that promise; it is not a network-only or GPU-paint measurement.\n- `click-image`: existing click-through-browser-paint-gate timing, retained unchanged.\n\nThe diagnostics registry is available only with the widget's existing debug mode enabled. All timings use the existing bounded numeric collector; no image IDs, URLs, additional observers or network calls are introduced.\n\n## Validation and limits\n\n110 targeted checks pass: real click callback priority/dispatch tests, delayed-storage scheduling, image-first behavior, real-cache hover regressions, performance lifecycle and native selection/overview retention. Tests verify that an indefinitely pending SDK hit test is never invoked for an unopposed hovered point; notes/cloud/places can still consume a click; active detections precede image opening; obsolete selections cannot commit; pending storage does not delay provisional preview; and local discovery does not duplicate cached-route adoption. Fake-clock tests separate dispatch/SDK/total durations and exclude superseded SDK results.\n\nThese controlled tests establish removal of waits, not a measured millisecond improvement in a deployed Experience Builder scene. Actual image load time still depends on Mapillary/browser caching and connection conditions. No full host build or live-host benchmark was available here.\n\n## Install and rollback\n\nApply after the hover cache contract fix, from the widget root outside `src`:\n\n    node apply-faster-hovered-image-opening.cjs\n\nRebuild/reload Experience Builder. `--dry-run` checks compatibility without source writes. Tests and the host build do not run inside the installer. The standalone uninstaller restores the previous scheduling and tests while keeping the earlier hover cache crash fix. Edited installation blocks are refused instead of overwritten.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'faster-hovered-image-opening-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
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


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.121 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'faster-hovered-image-opening' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.121 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-faster-hovered-image-opening.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Faster hovered-image opening is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
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
  const manifest = { installer: 'faster-hovered-image-opening', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Faster hovered-image opening ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
