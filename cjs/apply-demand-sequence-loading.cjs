#!/usr/bin/env node
'use strict';
/** Demand sequence loading installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
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
          "label": "src/runtime/widget.tsx demand sequence block 1",
          "before": "import { objectDateNotice, lookupImageDetection } from '../features/detections/metadata';\nimport { findSequenceCandidates } from '../features/imagery/sequenceCandidates';\nimport { fetchSequenceCoordinates } from '../features/imagery/sequenceCoordinates';\nimport { LiveSequenceFrames, LatestFrameDetails, LIVE_SEQUENCE_LIMITS, yieldSequenceWork } from '../features/imagery/LiveSequenceFrames';\nimport type { LiveSequenceFrame } from '../features/imagery/LiveSequenceFrames';\n",
          "after": "import { objectDateNotice, lookupImageDetection } from '../features/detections/metadata';\nimport { findSequenceCandidates } from '../features/imagery/sequenceCandidates';\nimport { SequenceDemandData } from '../features/imagery/SequenceDemandData';\nimport { fetchSequenceCoordinates, readCachedSequenceCoordinates } from '../features/imagery/sequenceCoordinates';\nimport { LiveSequenceFrames, LatestFrameDetails, LIVE_SEQUENCE_LIMITS, yieldSequenceWork } from '../features/imagery/LiveSequenceFrames';\nimport type { LiveSequenceFrame } from '../features/imagery/LiveSequenceFrames';\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 2",
          "before": "  private zoomDisplayHandle: __esri.WatchHandle | null = null;\n  private _sequenceRequests = new SharedSequenceRequests((id, token, signal, progress) => this.fetchSequenceWithCoords(id, token, signal, progress));\n  private _liveSequenceFrames = new LiveSequenceFrames((id, signal) => this.fetchMapillaryJson(`${GRAPH_API.BASE}/${id}?fields=id,sequence,geometry`, this.accessToken, signal));\n  private _liveFrameDetails = new LatestFrameDetails();\n",
          "after": "  private zoomDisplayHandle: __esri.WatchHandle | null = null;\n  private _sequenceRequests = new SharedSequenceRequests((id, token, signal, progress) => this.fetchSequenceWithCoords(id, token, signal, progress));\n  private _sequenceDemand = new SequenceDemandData((url, signal) => this.fetchMapillaryJson(url, this.accessToken, signal));\n  private _localSequenceTask: { key: string; request: number; signal: AbortSignal; promise: Promise<void> } | null = null;\n  private _pointCloudSequenceContext: { imageId: string; points: SequenceCoordinate[] } | null = null;\n  private _localSequenceKey = '';\n  private _fullRouteFailure = '';\n  private _localSequenceBackoff: { request: number; until: number } | null = null;\n  private _fullRouteTask: { sequenceId: string; request: number; controller: AbortController; promise: Promise<void> } | null = null;\n  private _liveSequenceFrames = new LiveSequenceFrames((id, signal) => this.fetchMapillaryJson(`${GRAPH_API.BASE}/${id}?fields=id,sequence,geometry`, this.accessToken, signal));\n  private _liveFrameDetails = new LatestFrameDetails();\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 3",
          "before": "      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n        // A true sequence change starts background hydration; tracking never awaits it.\n        const routeRequestId = ++this._selectionRequestId; this._selectionAbort?.abort();\n        const controller = new AbortController(); this._selectionAbort = controller;\n        this.clearActiveSequenceLayer();\n        this.setState(() => !this._liveSequenceFrames.isCurrent(frame) || this.state.jimuMapView?.view !== view || this.mapillaryViewer !== profileEventViewer ? null : ({ sequenceId: frame.sequenceId, selectedSequenceId: frame.sequenceId,\n          sequenceImages: [frame], sequenceRouteLoading: true, sequenceRouteProgress: undefined,\n          imageryRepresentative: false, selectionError: undefined, selectionCanRetry: false }), () => {\n          if (routeRequestId === this._selectionRequestId && !controller.signal.aborted && this._liveSequenceFrames.sequenceId === frame.sequenceId && this.state.jimuMapView?.view === view)\n            void this.hydrateLiveSequence(frame.sequenceId, routeRequestId, controller, view);\n        });\n      }\n",
          "after": "      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n        // A sequence change starts only cache reuse and a nearby window; tracking never awaits it.\n        const routeRequestId = ++this._selectionRequestId; this._selectionAbort?.abort();\n        const controller = new AbortController(); this._selectionAbort = controller;\n        this.clearActiveSequenceLayer();\n        this.setState(() => !this._liveSequenceFrames.isCurrent(frame) || this.state.jimuMapView?.view !== view || this.mapillaryViewer !== profileEventViewer ? null : ({ sequenceId: frame.sequenceId, selectedSequenceId: frame.sequenceId,\n          sequenceImages: [frame], sequenceRouteLoading: false, sequenceRouteProgress: undefined,\n          imageryRepresentative: false, selectionError: undefined, selectionCanRetry: false }), () => {\n          if (routeRequestId === this._selectionRequestId && !controller.signal.aborted && this._liveSequenceFrames.sequenceId === frame.sequenceId && this.state.jimuMapView?.view === view)\n            void this.prepareDemandSequence(frame.sequenceId, routeRequestId, controller, view);\n        });\n      }\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 4",
          "before": "      // Update State with New ID\n      this.setState(() => !this._liveSequenceFrames.isCurrent(frame) || this.state.jimuMapView?.view !== view || this.mapillaryViewer !== profileEventViewer ? null : ({ imageId: newId,\n        sequenceImages: this._liveSequenceFrames.complete || [frame] }), () => {\n        if (this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(frame)) return;\n        this._nearbySelectedId = null; // real imageId is now in state, clear the optimistic selection\n",
          "after": "      // Update State with New ID\n      this.setState(() => !this._liveSequenceFrames.isCurrent(frame) || this.state.jimuMapView?.view !== view || this.mapillaryViewer !== profileEventViewer ? null : ({ imageId: newId,\n        sequenceImages: this._liveSequenceFrames.visible(frame) }), () => {\n        if (this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(frame)) return;\n        this._nearbySelectedId = null; // real imageId is now in state, clear the optimistic selection\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 5",
          "before": "          this.updateMinimapTracking();\n          void this.refreshSequenceMarkerWindow();\n\n          // 3. Map Synchronization Logic (With Offset)\n",
          "after": "          this.updateMinimapTracking();\n          void this.refreshSequenceMarkerWindow();\n          void this.refreshLocalSequence();\n\n          // 3. Map Synchronization Logic (With Offset)\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 6",
          "before": "  // Handles loading, drawing, caching and clearing sequence overlays.\n  // Load a specific sequence by ID and image\n  // Fetches all image coordinates in the sequence,\n  // updates the viewer, re-draws map markers,\n  // and attaches Mapillary event listeners for bearing/image changes.\n",
          "after": "  // Handles loading, drawing, caching and clearing sequence overlays.\n  // Load a specific sequence by ID and image\n  // Resolves the selected image independently of optional complete route data,\n  // updates the viewer, re-draws map markers,\n  // and attaches Mapillary event listeners for bearing/image changes.\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 7",
          "before": "    const live = this._liveSequenceFrames.sequenceId === sequenceId ? this._liveSequenceFrames.find(imageId) : undefined;\n    if (live) return live;\n    const cached: {id:string;lon:number;lat:number;captured_at?:number}[] = this.sequenceCoordsCache[sequenceId] || (this.state.sequenceId === sequenceId ? this.state.sequenceImages : []);\n    const found = cached.find(p => String(p.id) === String(imageId));\n",
          "after": "    const live = this._liveSequenceFrames.sequenceId === sequenceId ? this._liveSequenceFrames.find(imageId) : undefined;\n    if (live) return live;\n    const nearby = this._sequenceDemand.find(sequenceId, String(imageId)); if (nearby) return nearby;\n    const cached: {id:string;lon:number;lat:number;captured_at?:number}[] = this.sequenceCoordsCache[sequenceId] || (this.state.sequenceId === sequenceId ? this.state.sequenceImages : []);\n    const found = cached.find(p => String(p.id) === String(imageId));\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 8",
          "before": "\n  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false) {\n    // Reuse only a completed route in its current view; previews and interrupted builds\n    // must still hydrate normally. Frame navigation must not recreate thousands of markers.\n    const loadedSequence = this.state.sequenceImages;\n    const reuseLoadedRoute = !nearestToClick && !!this.mapillaryViewer &&\n",
          "after": "\n  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false) {\n    // Reuse completed geometry in its current view. Other selections open first,\n    // then reuse cached geometry or request only a nearby coordinate window.\n    const loadedSequence = this.state.sequenceImages;\n    const reuseLoadedRoute = !nearestToClick && !!this.mapillaryViewer &&\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 9",
          "before": "    }\n    this._nearbyDiscovery?.cancel();\n    this.setState({ nearbyLoading: false, isLoading: true, imageryRepresentative: representative && !nearestToClick, sequenceRouteProgress: undefined, sequenceRouteLoading: !reuseLoadedRoute, selectionError: undefined, selectionCanRetry: false });\n\n    if (this.state.isElevationProfileActive && !reuseLoadedRoute) {\n      this.updateElevationProfile();\n    }\n\n    try {\n",
          "after": "    }\n    this._nearbyDiscovery?.cancel();\n    this.setState({ nearbyLoading: false, isLoading: true, imageryRepresentative: representative && !nearestToClick, sequenceRouteProgress: undefined, sequenceRouteLoading: false, selectionError: undefined, selectionCanRetry: false });\n\n    if (this.state.isElevationProfileActive && !reuseLoadedRoute) this.clearElevationProfile();\n\n    try {\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 10",
          "before": "        if (!current()) return;\n        if (!nearest) {\n          // A missing/slow local tile must not silently open the sequence start.\n          const complete = await this.getSequenceWithCoords(sequenceId, this.accessToken, controller.signal, (_points, _batch, loaded, total) => {\n            if (current()) this.setState({ sequenceRouteProgress: `${loaded.toLocaleString()}/${total.toLocaleString()}` });\n          });\n          if (!current()) return;\n          let best = Infinity;\n          for (let i = 0; i < complete.length; i++) {\n            if (i > 0 && i % 4096 === 0) await new Promise(resolve => setTimeout(resolve, 0));\n            if (!current()) return;\n            const image = complete[i];\n            const distance = distanceMeters(clickPoint.lat, clickPoint.lon, image.lat, image.lon);\n            if (distance < best) { best = distance; nearest = String(image.id); }\n          }\n        }\n        if (!nearest) throw new Error(\"No image coordinates are available for this sequence\");\n",
          "after": "        if (!current()) return;\n        if (!nearest) {\n          // Resolve only this location; ordinary clicks never enumerate a route.\n          const nearby = await this.getSequencesInBBox(clickPoint.lon, clickPoint.lat, this.accessToken);\n          if (!current()) return;\n          const candidates = nearby.find(candidate => String(candidate.sequenceId) === String(sequenceId))?.images || [];\n          nearest = candidates.reduce((best, image) => !best || image.dist < best.dist ? image : best, undefined as typeof candidates[number] | undefined)?.id;\n\n        }\n        if (!nearest) throw new Error(\"No image coordinates are available for this sequence\");\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 11",
          "before": "\n      this._liveSequenceFrames.begin(sequenceId, updatedSequence);\n\n      // Commit coordinates before moveTo can emit its image event.\n",
          "after": "\n      this._liveSequenceFrames.begin(sequenceId, updatedSequence);\n      if (this.sequenceCoordsCache[sequenceId] === updatedSequence) this._liveSequenceFrames.finish(sequenceId, updatedSequence);\n\n      // Commit coordinates before moveTo can emit its image event.\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 12",
          "before": "      }\n      this._lastSuccessfulSelection = { sequenceImages: updatedSequence, imageId: active.id, sequenceId, selectedSequenceId: sequenceId };\n      void this.hydrateLiveSequence(sequenceId, requestId, controller, jimuMapView.view);\n    } catch (err) {\n      if (!current()) return;\n",
          "after": "      }\n      this._lastSuccessfulSelection = { sequenceImages: updatedSequence, imageId: active.id, sequenceId, selectedSequenceId: sequenceId };\n      void this.prepareDemandSequence(sequenceId, requestId, controller, jimuMapView.view);\n    } catch (err) {\n      if (!current()) return;\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 13",
          "before": "  private async fetchMapillaryJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {\n    return fetchGraphJson(url, accessToken, signal);\n  }\n\n",
          "after": "  private async fetchMapillaryJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {\n    return fetchGraphJson(url, accessToken, signal);\n  }\n\n  /** Cache reuse and local context never initiate complete coordinate downloads. */\n  private async prepareDemandSequence(sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {\n    const current = () => !controller.signal.aborted && requestId === this._selectionRequestId && this.state.sequenceId === sequenceId && this.state.jimuMapView?.view === view;\n    try {\n      const cached = await readCachedSequenceCoordinates(this.sequenceCoordsCache, sequenceId, controller.signal);\n      if (!current()) return;\n      if (cached) {\n        this._liveSequenceFrames.finish(sequenceId, cached);\n        this.setState(() => !current() ? null : ({ sequenceImages: cached, sequenceRouteLoading: false, sequenceRouteProgress: undefined }), () => {\n          if (!current()) return;\n          this._lastSuccessfulSelection = { sequenceImages: cached, imageId: this.state.imageId, sequenceId, selectedSequenceId: sequenceId };\n          this.updateProfileIndicator();\n        });\n        await this.renderLiveSequenceLine(cached, sequenceId, requestId, controller, view);\n      } else if (!cached) {\n        void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);\n        void this.refreshLocalSequence();\n        void this.refreshSequenceMarkerWindow();\n      }\n      if (current() && this.state.isElevationProfileActive) void this.updateElevationProfile();\n    } catch (error) {\n      if (!current()) return;\n      // Browser storage is optional. Local browsing must still work.\n      void this.refreshLocalSequence();\n      if (this.state.isElevationProfileActive) void this.updateElevationProfile();\n    }\n  }\n\n  /** A single nearby worker, refreshed only when crossing a 32-frame boundary. */\n  private async refreshLocalSequence(): Promise<void> {\n    const { sequenceId, imageId, jimuMapView } = this.state;\n    const controller = this._selectionAbort, request = this._selectionRequestId, view = jimuMapView?.view;\n    if (!sequenceId || !imageId || !controller || controller.signal.aborted || !view || this._liveSequenceFrames.complete) return;\n    if (this._localSequenceBackoff?.request === request && performance.now() < this._localSequenceBackoff.until) return;\n    const key = `${request}:${this._sequenceDemand.windowKey(sequenceId, imageId)}`;\n    if (key === this._localSequenceKey) return;\n    if (this._localSequenceTask?.request === request && this._localSequenceTask.signal === controller.signal) return;\n    const current = () => !controller.signal.aborted && this._selectionRequestId === request && this.state.sequenceId === sequenceId && this.state.jimuMapView?.view === view && !this._liveSequenceFrames.complete;\n    const entry = { key, request, signal: controller.signal, promise: Promise.resolve() };\n    this._localSequenceTask = entry;\n    entry.promise = (async () => {\n      try {\n        const known = this._liveSequenceFrames.find(imageId); if (known) this._sequenceDemand.seed(sequenceId, [known]);\n        const points = await this._sequenceDemand.window(sequenceId, imageId, controller.signal);\n        if (!current() || !points.length) return;\n        this._localSequenceBackoff = null;\n        this._localSequenceKey = `${request}:${this._sequenceDemand.windowKey(sequenceId, imageId)}`;\n        this._liveSequenceFrames.setLocal(sequenceId, points);\n        this.setState(() => {\n          if (!current()) return null;\n          const active = this._liveSequenceFrames.find(this.state.imageId);\n          return active ? { sequenceImages: this._liveSequenceFrames.visible(active) } : null;\n        }, () => { if (current()) void this.refreshSequenceMarkerWindow(); });\n      } catch (error) {\n        if (current()) { this._localSequenceBackoff = { request, until: performance.now() + 5000 }; console.warn('[Mapillary sequence] Nearby context unavailable; current image tracking remains active:', error); }\n      } finally {\n        if (this._localSequenceTask === entry) {\n          this._localSequenceTask = null;\n          // Catch up to a newer confirmed frame once, without retry loops on failure.\n          if (current() && this.state.imageId !== imageId) void this.refreshLocalSequence();\n        }\n      }\n    })();\n    return entry.promise;\n  }\n\n  /** The profile is the explicit consumer of complete route metadata. */\n  private ensureFullSequenceRoute(): Promise<void> {\n    const { sequenceId, jimuMapView } = this.state, selection = this._selectionAbort;\n    if (!sequenceId || !jimuMapView || !selection || selection.signal.aborted || this._liveSequenceFrames.complete) return Promise.resolve();\n    const request = this._selectionRequestId, active = this._fullRouteTask;\n    if (this._fullRouteFailure === `${request}:${sequenceId}`) return Promise.resolve();\n    if (active?.sequenceId === sequenceId && active.request === request && !active.controller.signal.aborted) return active.promise;\n    active?.controller.abort();\n    const controller = new AbortController(), abort = () => controller.abort();\n    selection.signal.addEventListener('abort', abort, { once: true });\n    const entry = { sequenceId, request, controller, promise: Promise.resolve() };\n    this._fullRouteTask = entry;\n    this.setState({ sequenceRouteLoading: true, sequenceRouteProgress: undefined });\n    entry.promise = this.hydrateLiveSequence(sequenceId, request, controller, jimuMapView.view).finally(() => {\n      selection.signal.removeEventListener('abort', abort);\n      if (!controller.signal.aborted && this.state.sequenceId === sequenceId && !this._liveSequenceFrames.complete) this._fullRouteFailure = `${request}:${sequenceId}`;\n      if (this._fullRouteTask === entry) this._fullRouteTask = null;\n    });\n    return entry.promise;\n  }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 14",
          "before": "      fetchJson: (url, token, requestSignal) => this.fetchMapillaryJson(url, token, requestSignal),\n      getSelectedImageId: () => this.state.imageId,\n      isStorageDisabled: () => this._sequenceStorageDisabled,\n      disableStorage: () => { this._sequenceStorageDisabled = true; },\n",
          "after": "      fetchJson: (url, token, requestSignal) => this.fetchMapillaryJson(url, token, requestSignal),\n      getSelectedImageId: () => this.state.imageId,\n      getIds: (id, signal) => this._sequenceDemand.ids(id, signal),\n      getKnown: id => this._sequenceDemand.find(sequenceId, id),\n      isStorageDisabled: () => this._sequenceStorageDisabled,\n      disableStorage: () => { this._sequenceStorageDisabled = true; },\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 15",
          "before": "    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    const current = () => !signal.aborted && requestId === this._selectionRequestId && this.state.jimuMapView?.view === view && this.state.sequenceRouteLoading;\n    const paths: number[][][] = [];\n    let vertices = 0;\n",
          "after": "    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    const current = () => !signal.aborted && requestId === this._selectionRequestId && this.state.jimuMapView?.view === view && this.state.sequenceId === sequenceId && !this._liveSequenceFrames.complete;\n    const paths: number[][][] = [];\n    let vertices = 0;\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 16",
          "before": "      }\n      if (!current() || !paths.length) return;\n      this.ensureActiveSequenceLayer(view).add(new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n        symbol: { type: \"simple-line\", color: [0, 0, 255, 0.65], width: 3 },\n        attributes: { sequenceId, sequence_preview: true },\n      }));\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n  }\n",
          "after": "      }\n      if (!current() || !paths.length) return;\n      const layerOwner = this.ensureActiveSequenceLayer(view);\n      layerOwner.removeMany(layerOwner.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview));\n      const previewGraphic = new this.ArcGISModules.Graphic({\n        geometry: { type: \"polyline\", paths, spatialReference: { wkid: 4326 } },\n        symbol: { type: \"simple-line\", color: [0, 0, 255, 0.65], width: 3 },\n        attributes: { sequenceId, sequence_preview: true },\n      });\n      (previewGraphic as any).__isSequenceOverlay = true; layerOwner.add(previewGraphic);\n      this._liveSequenceLine = { sequenceId, geometry: previewGraphic.geometry }; this.updateMinimapTracking();\n    } catch { /* Preview is optional; the complete API route remains authoritative. */ }\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 17",
          "before": "  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._liveSequenceFrames.clear(); this._liveFrameDetails.clear();\n    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();\n    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);\n",
          "after": "  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._liveSequenceFrames.clear(); this._liveFrameDetails.clear(); this._sequenceDemand.clear();\n    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();\n    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 18",
          "before": "      const requestId = this._selectionRequestId;\n      this._selectionAbort?.abort(); const controller = new AbortController(); this._selectionAbort = controller;\n      if (this.state.sequenceRouteLoading) void this.hydrateLiveSequence(selectedSequenceId, requestId, controller, view);\n      else { this._liveSequenceFrames.finish(selectedSequenceId, sequenceImages); void this.renderLiveSequenceLine(sequenceImages, selectedSequenceId, requestId, controller, view); }\n    }\n\n",
          "after": "      const requestId = this._selectionRequestId;\n      this._selectionAbort?.abort(); const controller = new AbortController(); this._selectionAbort = controller;\n      const complete = this.sequenceCoordsCache[selectedSequenceId];\n      if (complete) { this._liveSequenceFrames.finish(selectedSequenceId, complete); void this.renderLiveSequenceLine(complete, selectedSequenceId, requestId, controller, view); }\n      else { this.setState({ sequenceRouteLoading: false, sequenceRouteProgress: undefined }); void this.prepareDemandSequence(selectedSequenceId, requestId, controller, view); }\n    }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 19",
          "before": "          }\n\n          // Fetch full coords for each nearby sequence\n          const fullSeqs = await Promise.all(\n            nearbySeqs.map(async (seq) => {\n              const allImages = await this.getSequenceWithCoords(seq.sequenceId, this.accessToken);\n              return { ...seq, images: allImages };\n            }),\n          );\n\n          // Find the image closest to the click across all returned sequences\n          let globalClosest: { seqId: string; imgId: string; dist: number } | null = null;\n",
          "after": "          }\n\n          const fullSeqs = nearbySeqs; // Discovery already includes the local image coordinates.\n          // Find the image closest to the click across all returned sequences\n          let globalClosest: { seqId: string; imgId: string; dist: number } | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 20",
          "before": "      let progressEnabled = true;\n\n      const result = await loadPointCloud(imageId, this.accessToken, {\n        signal: controller.signal, cache: this._pointCloudCache, forceDiscovery,\n",
          "after": "      let progressEnabled = true;\n\n      let localCorridor = this._liveSequenceFrames.complete || sequenceImages;\n      if (!this._liveSequenceFrames.complete && this.state.sequenceId) {\n        try {\n          const nearby = await this._sequenceDemand.corridor(this.state.sequenceId, imageId, controller.signal,\n            (a, b) => distanceMeters(a.lat, a.lon, b.lat, b.lon));\n          if (nearby.length) localCorridor = nearby;\n        } catch (error) {\n          if (!current()) return;\n          console.warn('[Mapillary cloud] Nearby sequence context unavailable; using known image positions:', error);\n        }\n      }\n      if (!current()) return;\n      this._pointCloudSequenceContext = { imageId, points: localCorridor };\n      const result = await loadPointCloud(imageId, this.accessToken, {\n        signal: controller.signal, cache: this._pointCloudCache, forceDiscovery,\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 21",
          "before": "        cropLengthMeters: POINT_CLOUD_CONFIG.FETCH_LENGTH,\n        cropWidthMeters: POINT_CLOUD_CONFIG.FETCH_WIDTH,\n        sequenceImages: this.state.sequenceImages.map((img: any) => ({\n          id: img.id,\n          lon: img.lon,\n",
          "after": "        cropLengthMeters: POINT_CLOUD_CONFIG.FETCH_LENGTH,\n        cropWidthMeters: POINT_CLOUD_CONFIG.FETCH_WIDTH,\n        sequenceImages: localCorridor.map((img: any) => ({\n          id: img.id,\n          lon: img.lon,\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 22",
          "before": "    }\n    this._pointCloudFeatures.clear(); this._pointCloudIndexByOriginal.clear(); this._pointCloudViewerObjectIds = []; this._pointCloudMapUpdating = false; this._pointCloudLayerResult = null; this._pointCloudLayerView = null;\n    this._currentPointCloudResult = null;\n    this.removeViewerPointCloudRenderer();\n\n",
          "after": "    }\n    this._pointCloudFeatures.clear(); this._pointCloudIndexByOriginal.clear(); this._pointCloudViewerObjectIds = []; this._pointCloudMapUpdating = false; this._pointCloudLayerResult = null; this._pointCloudLayerView = null;\n    this._currentPointCloudResult = null; this._pointCloudSequenceContext = null;\n    this.removeViewerPointCloudRenderer();\n\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 23",
          "before": "   */\n  private getStreetBearing(): number {\n    const { sequenceImages, imageId } = this.state;\n    if (!sequenceImages || !imageId) return this._lastBearing || 0;\n\n",
          "after": "   */\n  private getStreetBearing(): number {\n    const { imageId } = this.state;\n    const sequenceImages = this._pointCloudSequenceContext?.imageId === imageId ? this._pointCloudSequenceContext.points : this.state.sequenceImages;\n    if (!sequenceImages || !imageId) return this._lastBearing || 0;\n\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 24",
          "before": "    // If the note has an associated image, jump the viewer there too\n    if (note.imageId && note.imageId !== this.state.imageId) {\n      const img = this.state.sequenceImages.find((s) => s.id === note.imageId);\n      if (img && this.mapillaryViewer) {\n        this.mapillaryViewer.moveTo(note.imageId).catch(() => {});\n      }\n",
          "after": "    // If the note has an associated image, jump the viewer there too\n    if (note.imageId && note.imageId !== this.state.imageId) {\n      if (this.mapillaryViewer) {\n        this.mapillaryViewer.moveTo(note.imageId).catch(() => {});\n      }\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 25",
          "before": "    this.setState({ isElevationProfileActive: next }, () => {\n      if (next) {\n        this.updateElevationProfile();\n        this.showToast(\"Elevation Profile generated along sequence.\", 2500);\n      } else {\n        this.clearElevationProfile();\n",
          "after": "    this.setState({ isElevationProfileActive: next }, () => {\n      if (next) {\n        this._fullRouteFailure = '';\n        this.updateElevationProfile();\n        this.showToast(this._liveSequenceFrames.complete ? \"Elevation profile enabled.\" : \"Loading route for elevation profile\u2026\", 2500);\n      } else {\n        this.clearElevationProfile();\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 26",
          "before": "\nprivate clearElevationProfile = () => {\n    this._elevationProfile?.clear(this.state.jimuMapView?.view);\n  };\n",
          "after": "\nprivate clearElevationProfile = () => {\n    this._fullRouteTask?.controller.abort(); this._fullRouteTask = null;\n    if (!this._liveSequenceFrames.complete && this.state.sequenceId) this._liveSequenceFrames.setLocal(this.state.sequenceId, this._liveSequenceFrames.local);\n    if (this.state.sequenceRouteLoading) this.setState({ sequenceRouteLoading: false, sequenceRouteProgress: undefined });\n    this._elevationProfile?.clear(this.state.jimuMapView?.view);\n  };\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 27",
          "before": "  /** Feeds the active Mapillary sequence polyline into Esri's ElevationProfile widget */\nprivate updateElevationProfile = async () => {\n    const { jimuMapView, sequenceImages, isElevationProfileActive } = this.state;\n    if (this.props.config.enableElevationProfile !== true || !isElevationProfileActive || !jimuMapView) return;\n    if (!sequenceImages || sequenceImages.length < 2) { this.clearElevationProfile(); return; }\n    const view = jimuMapView.view;\n    try {\n      await this.ensureElevationProfileOwner().update(view, sequenceImages, () =>\n        this.props.config.enableElevationProfile === true && this.state.isElevationProfileActive && this.state.jimuMapView?.view === view);\n",
          "after": "  /** Feeds the active Mapillary sequence polyline into Esri's ElevationProfile widget */\nprivate updateElevationProfile = async () => {\n    const { jimuMapView, sequenceId, isElevationProfileActive } = this.state;\n    if (this.props.config.enableElevationProfile !== true || !isElevationProfileActive || !jimuMapView || !sequenceId) return;\n    const view = jimuMapView.view;\n    try {\n      if (!this._liveSequenceFrames.complete) await this.ensureFullSequenceRoute();\n      if (this.state.sequenceId !== sequenceId || this.state.jimuMapView?.view !== view || !this.state.isElevationProfileActive) return;\n      const sequenceImages = this._liveSequenceFrames.complete;\n      if (!sequenceImages) return;\n      if (sequenceImages.length < 2) {\n        this.clearElevationProfile(); this.setState({ isElevationProfileActive: false });\n        this.showToast(\"This sequence needs at least two located images for a profile.\", 3000); return;\n      }\n      await this.ensureElevationProfileOwner().update(view, sequenceImages, () =>\n        this.props.config.enableElevationProfile === true && this.state.isElevationProfileActive && this.state.jimuMapView?.view === view);\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 28",
          "before": "   * loops forward until it finds a healthy image, and resumes native playback.\n   */\nprivate forceSkipNext = async () => {\n    await skipUnavailableSequenceFrames(this._playbackRecoveryHost);\n  };\n\n",
          "after": "   * loops forward until it finds a healthy image, and resumes native playback.\n   */\n  private _playbackRecoveryTask: { owner: AbortController | null; promise: Promise<void> } | null = null;\nprivate forceSkipNext = async () => {\n    const owner = this._selectionAbort;\n    if (this._playbackRecoveryTask?.owner === owner) return this._playbackRecoveryTask.promise;\n    const entry = { owner, promise: skipUnavailableSequenceFrames(this._playbackRecoveryHost) };\n    this._playbackRecoveryTask = entry;\n    try { await entry.promise; } finally { if (this._playbackRecoveryTask === entry) this._playbackRecoveryTask = null; }\n  };\n\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 29",
          "before": "  /** Bind live playback intent and viewer readers once; recovery snapshots sequence data per attempt. */\n  private readonly _playbackRecoveryHost: PlaybackRecoveryHost = {\n    getState: () => this.state,\n    getViewer: () => this.mapillaryViewer,\n    isPaused: () => this._userPaused,\n",
          "after": "  /** Bind live playback intent and viewer readers once; recovery snapshots sequence data per attempt. */\n  private readonly _playbackRecoveryHost: PlaybackRecoveryHost = {\n    getState: () => ({ sequenceImages: this.state.sequenceImages, imageId: this.state.imageId, sequenceId: this.state.sequenceId, recoveryKey: this._selectionAbort }),\n    getOrderedImages: async () => {\n      const id = this.state.sequenceId, signal = this._selectionAbort?.signal;\n      if (!id || !signal) return [];\n      const ids = await this._sequenceDemand.ids(id, signal);\n      return ids.map(imageId => ({ id: imageId }));\n    },\n    getViewer: () => this.mapillaryViewer,\n    isPaused: () => this._userPaused,\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 30",
          "before": "              await this.enableTurboCoverageLayer();\n            }\n          }\n        }, TIMING.TURBO_DEBOUNCE_MS),\n",
          "after": "              await this.enableTurboCoverageLayer();\n            }\n            if (this.state.sequenceId && this._selectionAbort && !this._liveSequenceFrames.complete)\n              void this.showCachedSequencePreview(this.state.sequenceId, this._selectionRequestId, this._selectionAbort.signal);\n          }\n        }, TIMING.TURBO_DEBOUNCE_MS),\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 31",
          "before": "          let imageId = attrs.image_id ? String(attrs.image_id) : undefined;\n          if (!imageId) {\n            const images = this._liveSequenceFrames.sequenceId === seqId ? this._liveSequenceFrames.points()\n              : this.state.sequenceId === seqId && this.state.sequenceImages.length ? this.state.sequenceImages : this.sequenceCoordsCache[seqId];\n            let closest = Infinity;\n            for (const image of images || []) {\n",
          "after": "          let imageId = attrs.image_id ? String(attrs.image_id) : undefined;\n          if (!imageId) {\n            const images = this.sequenceCoordsCache[seqId];\n            let closest = Infinity;\n            for (const image of images || []) {\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 32",
          "before": "              if (distance < closest) { closest = distance; imageId = String(image.id); }\n            }\n          }\n          if (imageId) {\n",
          "after": "              if (distance < closest) { closest = distance; imageId = String(image.id); }\n            }\n          }\n          if (!imageId) {\n            const request = this._selectionRequestId;\n            try { imageId = await this.nearestCoverageImage(seqId, { lon: point.longitude, lat: point.latitude }, this._selectionAbort?.signal || new AbortController().signal); }\n            catch { return; }\n            if (request !== this._selectionRequestId || !coverageClickCurrent()) return;\n          }\n          if (imageId) {\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 33",
          "before": "                  // Coverage hit tests can miss the thin active route at regional zooms.\n                  // For that same loaded sequence, resolve the click entirely in memory.\n                  if (attrs.turbo_representative && this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !this.state.sequenceRouteLoading) {\n                    let closest = Infinity;\n                    for (const image of this.state.sequenceImages) {\n",
          "after": "                  // Coverage hit tests can miss the thin active route at regional zooms.\n                  // For that same loaded sequence, resolve the click entirely in memory.\n                  if (attrs.turbo_representative && this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !!this._liveSequenceFrames.complete) {\n                    let closest = Infinity;\n                    for (const image of this.state.sequenceImages) {\n"
        },
        {
          "label": "src/runtime/widget.tsx demand sequence block 34",
          "before": "                  // A sequence tile's image_id represents the whole line, not its clicked location.\n                  // Resolve only nearby image tiles; never enumerate the full sequence to open it.\n                  if (regionalLine && !(this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !this.state.sequenceRouteLoading && this.state.sequenceImages.length)) {\n                    const geometry = safeGraphic.geometry as __esri.Point;\n                    const geographic = geometry?.spatialReference?.isWGS84 || geometry?.spatialReference?.wkid === 4326\n",
          "after": "                  // A sequence tile's image_id represents the whole line, not its clicked location.\n                  // Resolve only nearby image tiles; never enumerate the full sequence to open it.\n                  if (regionalLine && !(this.getTurboOrganizationId() === undefined && this.state.sequenceId === seqId && !!this._liveSequenceFrames.complete)) {\n                    const geometry = safeGraphic.geometry as __esri.Point;\n                    const geographic = geometry?.spatialReference?.isWGS84 || geometry?.spatialReference?.wkid === 4326\n"
        }
      ],
      "absentAfterUninstall": [
        "SequenceDemandData",
        "prepareDemandSequence",
        "ensureFullSequenceRoute",
        "getOrderedImages",
        "readCachedSequenceCoordinates",
        "setLocal",
        "recoveryKey"
      ],
      "requiredOccurrences": [
        {
          "text": "SequenceDemandData",
          "count": 3
        },
        {
          "text": "prepareDemandSequence",
          "count": 4
        },
        {
          "text": "ensureFullSequenceRoute",
          "count": 2
        },
        {
          "text": "getOrderedImages",
          "count": 1
        },
        {
          "text": "readCachedSequenceCoordinates",
          "count": 2
        },
        {
          "text": "setLocal",
          "count": 2
        },
        {
          "text": "recoveryKey",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/imagery/sequenceCoordinates.ts",
      "blocks": [
        {
          "label": "src/features/imagery/sequenceCoordinates.ts demand sequence block 1",
          "before": "  isStorageDisabled: () => boolean;\n  disableStorage: () => void;\n}\n\n",
          "after": "  isStorageDisabled: () => boolean;\n  disableStorage: () => void;\n  getKnown?: (imageId: string) => SequenceCoordinate | undefined;\n  getIds?: (sequenceId: string, signal: AbortSignal) => Promise<readonly string[]>;\n}\n\n"
        },
        {
          "label": "src/features/imagery/sequenceCoordinates.ts demand sequence block 2",
          "before": " */\nexport async function fetchSequenceCoordinates(dependencies: SequenceCoordinateDependencies, sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {\n    const valid = (value: any) => Array.isArray(value) && value.length > 0 && value.every(p => p && p.id != null && p.heightDataVersion === 2 && Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90);\n    const ram = dependencies.cache[sequenceId];\n    if (valid(ram)) return ram;\n    const cacheKey = `${CACHE_KEYS.GEO_PREFIX}height-v2:${sequenceId}`;\n    const persisted = await sequenceCacheStore.read(cacheKey);\n    if (signal?.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n    if (valid(persisted)) {\n      dependencies.cache[sequenceId] = persisted as SequenceCoordinate[];\n      while (Object.keys(dependencies.cache).length > 6) delete dependencies.cache[Object.keys(dependencies.cache)[0]];\n      return persisted as SequenceCoordinate[];\n    }\n    try {\n      const stored = localStorage.getItem(cacheKey);\n      if (stored) { const parsed = JSON.parse(stored); if (valid(parsed)) { dependencies.cache[sequenceId] = parsed; while (Object.keys(dependencies.cache).length > 6) delete dependencies.cache[Object.keys(dependencies.cache)[0]]; sequenceCacheStore.queue(cacheKey, parsed); return parsed; } localStorage.removeItem(cacheKey); }\n    } catch { /* Storage is optional; continue using the network/RAM. */ }\n    const ids: string[] = [];\n    const visited = new Set<string>();\n    let next = `${GRAPH_API.BASE}/image_ids?sequence_id=${encodeURIComponent(sequenceId)}`;\n    while (next) {\n      if (visited.has(next)) throw new Error(\"Mapillary sequence pagination repeated\");\n",
          "after": " */\nexport async function fetchSequenceCoordinates(dependencies: SequenceCoordinateDependencies, sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {\n    const cached = await readCachedSequenceCoordinates(dependencies.cache, sequenceId, signal);\n    if (cached) return cached;\n    const cacheKey = `${CACHE_KEYS.GEO_PREFIX}height-v2:${sequenceId}`;\n    const ids: string[] = [];\n    const visited = new Set<string>();\n    let next = `${GRAPH_API.BASE}/image_ids?sequence_id=${encodeURIComponent(sequenceId)}`;\n    if (dependencies.getIds) {\n      for (const id of await dependencies.getIds(sequenceId, signal || new AbortController().signal)) ids.push(id); next = \"\";\n    }\n    while (next) {\n      if (visited.has(next)) throw new Error(\"Mapillary sequence pagination repeated\");\n"
        },
        {
          "label": "src/features/imagery/sequenceCoordinates.ts demand sequence block 3",
          "before": "      while (nextBatch < results.length && !workers.signal.aborted) {\n        const index = batches[nextBatch++], batch = unique.slice(index * 50, index * 50 + 50);\n        const data = await dependencies.fetchJson(`${GRAPH_API.BASE}/?ids=${batch.join(\",\")}&fields=id,geometry,captured_at,computed_altitude,altitude`, accessToken, workers.signal);\n        results[index] = [];\n        for (const id of batch) {\n          const value = data[id], xy = value?.geometry?.coordinates;\n          if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) || Math.abs(xy[0]) > 180 || Math.abs(xy[1]) > 90) continue;\n",
          "after": "      while (nextBatch < results.length && !workers.signal.aborted) {\n        const index = batches[nextBatch++], batch = unique.slice(index * 50, index * 50 + 50);\n        const known = new Map<string, SequenceCoordinate>();\n        for (const id of batch) {\n          const point = dependencies.getKnown?.(id);\n          if (point?.heightDataVersion === 2 && Number.isFinite(point.lon) && Number.isFinite(point.lat)) known.set(id, point);\n        }\n        const missing = batch.filter(id => !known.has(id));\n        const data = missing.length ? await dependencies.fetchJson(`${GRAPH_API.BASE}/?ids=${missing.join(\",\")}&fields=id,geometry,captured_at,computed_altitude,altitude`, accessToken, workers.signal) : {};\n        results[index] = [];\n        for (const id of batch) {\n          const cached = known.get(id); if (cached) { results[index].push(cached); continue; }\n          const value = data[id], xy = value?.geometry?.coordinates;\n          if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) || Math.abs(xy[0]) > 180 || Math.abs(xy[1]) > 90) continue;\n"
        },
        {
          "label": "src/features/imagery/sequenceCoordinates.ts demand sequence block 4",
          "before": "    return coords;\n  }\n",
          "after": "    return coords;\n  }\n\n/** Read an existing complete route without starting any network work. */\nexport async function readCachedSequenceCoordinates(cache: Record<string, SequenceCoordinate[]>, sequenceId: string, signal?: AbortSignal): Promise<SequenceCoordinate[] | null> {\n    const valid = (value: any) => Array.isArray(value) && value.length > 0 && value.every(p => p && p.id != null && p.heightDataVersion === 2 && Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90);\n    const ram = cache[sequenceId];\n    if (valid(ram)) return ram;\n    const cacheKey = `${CACHE_KEYS.GEO_PREFIX}height-v2:${sequenceId}`;\n    const persisted = await sequenceCacheStore.read(cacheKey);\n    if (signal?.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n    if (valid(persisted)) {\n      cache[sequenceId] = persisted as SequenceCoordinate[];\n      while (Object.keys(cache).length > 6) delete cache[Object.keys(cache)[0]];\n      return persisted as SequenceCoordinate[];\n    }\n    try {\n      const stored = localStorage.getItem(cacheKey);\n      if (stored) { const parsed = JSON.parse(stored); if (valid(parsed)) { cache[sequenceId] = parsed; while (Object.keys(cache).length > 6) delete cache[Object.keys(cache)[0]]; sequenceCacheStore.queue(cacheKey, parsed); return parsed; } localStorage.removeItem(cacheKey); }\n    } catch { /* Storage is optional; continue using the network/RAM. */ }\n    return null;\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "readCachedSequenceCoordinates"
      ],
      "requiredOccurrences": [
        {
          "text": "readCachedSequenceCoordinates",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/imagery/LiveSequenceFrames.ts",
      "blocks": [
        {
          "label": "src/features/imagery/LiveSequenceFrames.ts demand sequence block 1",
          "before": "  current: LiveSequenceFrame | null = null;\n  complete: SequenceCoordinate[] | null = null;\n  private known = new Map<string, SequenceCoordinate>();\n  private ordinals = new Map<string, number>();\n",
          "after": "  current: LiveSequenceFrame | null = null;\n  complete: SequenceCoordinate[] | null = null;\n  local: SequenceCoordinate[] = [];\n  private localRevision = 0;\n  private known = new Map<string, SequenceCoordinate>();\n  private ordinals = new Map<string, number>();\n"
        },
        {
          "label": "src/features/imagery/LiveSequenceFrames.ts demand sequence block 2",
          "before": "  begin(sequenceId: string, points: readonly SequenceCoordinate[]): void {\n    this.cancelPending();\n    if (this.sequenceId !== sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; }\n    this.sequenceId = sequenceId; this.current = null; this.remember(sequenceId, points);\n  }\n",
          "after": "  begin(sequenceId: string, points: readonly SequenceCoordinate[]): void {\n    this.cancelPending();\n    if (this.sequenceId !== sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; this.local = []; }\n    this.sequenceId = sequenceId; this.current = null; this.remember(sequenceId, points);\n  }\n"
        },
        {
          "label": "src/features/imagery/LiveSequenceFrames.ts demand sequence block 3",
          "before": "    if (sequenceId !== this.sequenceId) return;\n    for (const point of points) if (point.id != null && valid(point.lon, point.lat)) this.known.set(String(point.id), point);\n  }\n  finish(sequenceId: string, points: SequenceCoordinate[]): boolean {\n",
          "after": "    if (sequenceId !== this.sequenceId) return;\n    for (const point of points) if (point.id != null && valid(point.lon, point.lat)) this.known.set(String(point.id), point);\n  }\n  setLocal(sequenceId: string, points: SequenceCoordinate[]): void {\n    if (sequenceId !== this.sequenceId || this.complete) return;\n    this.local = points; ++this.localRevision; this.remember(sequenceId, points);\n    // Partial metadata must not grow with every image played.\n    if (this.known.size > 384) {\n      const keep = new Set(points.map(point => String(point.id)));\n      if (this.current) keep.add(this.current.id);\n      for (const id of this.known.keys()) if (!keep.has(id)) this.known.delete(id);\n    }\n  }\n  visible(frame: SequenceCoordinate): SequenceCoordinate[] {\n    return this.complete || (this.local.some(point => String(point.id) === String(frame.id)) ? this.local : [frame]);\n  }\n  finish(sequenceId: string, points: SequenceCoordinate[]): boolean {\n"
        },
        {
          "label": "src/features/imagery/LiveSequenceFrames.ts demand sequence block 4",
          "before": "  isCurrent(frame: LiveSequenceFrame): boolean { return this.current === frame; }\n  markerWindow(id: string): { key: number; points: readonly SequenceCoordinate[] } | null {\n    if (!this.complete) return null;\n    const ordinal = this.ordinals.get(id); if (ordinal === undefined) return null;\n    const count = LIVE_SEQUENCE_LIMITS.markerCount, step = LIVE_SEQUENCE_LIMITS.markerStep;\n",
          "after": "  isCurrent(frame: LiveSequenceFrame): boolean { return this.current === frame; }\n  markerWindow(id: string): { key: number; points: readonly SequenceCoordinate[] } | null {\n    if (!this.complete) return this.local.length ? { key: -this.localRevision - 1, points: this.local.slice(0, LIVE_SEQUENCE_LIMITS.markerCount) } : null;\n    const ordinal = this.ordinals.get(id); if (ordinal === undefined) return null;\n    const count = LIVE_SEQUENCE_LIMITS.markerCount, step = LIVE_SEQUENCE_LIMITS.markerStep;\n"
        },
        {
          "label": "src/features/imagery/LiveSequenceFrames.ts demand sequence block 5",
          "before": "    }\n    if (revision !== this.revision || !point || !sequenceId) return null;\n    if (sequenceId !== this.sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; this.sequenceId = sequenceId; }\n    const frame = { ...point, id, sequenceId };\n    this.known.set(id, frame); this.current = frame; return frame;\n  }\n  cancelPending(): void { ++this.revision; this.pending?.abort(); this.pending = null; this.current = null; }\n  clear(): void { this.cancelPending(); this.sequenceId = null; this.current = null; this.complete = null; this.known.clear(); this.ordinals.clear(); }\n}\n\n",
          "after": "    }\n    if (revision !== this.revision || !point || !sequenceId) return null;\n    if (sequenceId !== this.sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; this.sequenceId = sequenceId; this.local = []; }\n    const frame = { ...point, id, sequenceId };\n    this.known.set(id, frame); this.current = frame;\n    if (!this.complete && this.known.size > 384) {\n      const oldest = this.known.keys().next().value; if (oldest !== undefined && oldest !== id) this.known.delete(oldest);\n    }\n    return frame;\n  }\n  cancelPending(): void { ++this.revision; this.pending?.abort(); this.pending = null; this.current = null; }\n  clear(): void { this.cancelPending(); this.sequenceId = null; this.current = null; this.complete = null; this.local = []; this.known.clear(); this.ordinals.clear(); }\n}\n\n"
        }
      ],
      "absentAfterUninstall": [
        "setLocal"
      ],
      "requiredOccurrences": [
        {
          "text": "setLocal",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/imagery/playbackRecovery.ts",
      "blocks": [
        {
          "label": "src/features/imagery/playbackRecovery.ts demand sequence block 1",
          "before": "  sequenceImages: readonly { id: string }[] | null | undefined;\n  imageId: string | null | undefined;\n}\nexport interface PlaybackRecoveryViewer {\n",
          "after": "  sequenceImages: readonly { id: string }[] | null | undefined;\n  imageId: string | null | undefined;\n  sequenceId?: string | null;\n  recoveryKey?: unknown;\n}\nexport interface PlaybackRecoveryViewer {\n"
        },
        {
          "label": "src/features/imagery/playbackRecovery.ts demand sequence block 2",
          "before": "export interface PlaybackRecoveryHost {\n  getState(): PlaybackRecoveryState;\n  getViewer(): PlaybackRecoveryViewer | null | undefined;\n  isPaused(): boolean;\n",
          "after": "export interface PlaybackRecoveryHost {\n  getState(): PlaybackRecoveryState;\n  getOrderedImages?(): Promise<readonly { id: string }[]>;\n  getViewer(): PlaybackRecoveryViewer | null | undefined;\n  isPaused(): boolean;\n"
        },
        {
          "label": "src/features/imagery/playbackRecovery.ts demand sequence block 3",
          "before": "export async function skipUnavailableSequenceFrames(host: PlaybackRecoveryHost): Promise<void> {\n  if (host.isPaused()) return;\n  const { sequenceImages, imageId } = host.getState();\n  if (!sequenceImages || !imageId) return;\n  const currentIndex = sequenceImages.findIndex(image => image.id === imageId);\n  if (currentIndex === -1 || currentIndex >= sequenceImages.length - 1) {\n",
          "after": "export async function skipUnavailableSequenceFrames(host: PlaybackRecoveryHost): Promise<void> {\n  if (host.isPaused()) return;\n  const initial = host.getState(), viewer = host.getViewer();\n  const imageId = initial.imageId;\n  if (!imageId || !viewer) return;\n  const current = () => !host.isPaused() && host.getViewer() === viewer &&\n    host.getState().sequenceId === initial.sequenceId && host.getState().recoveryKey === initial.recoveryKey;\n  let sequenceImages: readonly { id: string }[] | null | undefined;\n  try { sequenceImages = host.getOrderedImages ? await host.getOrderedImages() : initial.sequenceImages; }\n  catch (error) {\n    if (current() && host.getState().imageId === imageId) { host.warn('[Auto-Skip] Image order unavailable:', error); host.setPaused(true); }\n    return;\n  }\n  if (!current() || host.getState().imageId !== imageId || !sequenceImages) return;\n  const currentIndex = sequenceImages.findIndex(image => image.id === imageId);\n  if (currentIndex === -1 || currentIndex >= sequenceImages.length - 1) {\n"
        },
        {
          "label": "src/features/imagery/playbackRecovery.ts demand sequence block 4",
          "before": "  let targetIndex = currentIndex + 1;\n  let success = false;\n  while (!success && targetIndex < sequenceImages.length && !host.isPaused()) {\n    const candidateImg = sequenceImages[targetIndex];\n    try {\n      await host.getViewer()!.moveTo(candidateImg.id);\n      success = true;\n    } catch (error) {\n      host.warn(`[Auto-Skip] Frame ${candidateImg.id} is dead. Skipping to next...`);\n      targetIndex++;\n    }\n  }\n  if (success && !host.isPaused()) {\n    const sequenceComponent = host.getViewer()?.getComponent('sequence');\n    if (sequenceComponent) sequenceComponent.configure({ playing: true });\n  } else host.setPaused(true);\n",
          "after": "  let targetIndex = currentIndex + 1;\n  let success = false;\n  while (!success && targetIndex < sequenceImages.length && current()) {\n    if (host.getState().imageId !== imageId) return;\n    const candidateImg = sequenceImages[targetIndex];\n    try {\n      await viewer.moveTo(candidateImg.id);\n      success = true;\n    } catch (error) {\n      if (!current()) return;\n      host.warn(`[Auto-Skip] Frame ${candidateImg.id} is dead. Skipping to next...`);\n      targetIndex++;\n    }\n  }\n  if (!current()) return;\n  if (success) {\n    const sequenceComponent = viewer.getComponent('sequence');\n    if (sequenceComponent) sequenceComponent.configure({ playing: true });\n  } else host.setPaused(true);\n"
        }
      ],
      "absentAfterUninstall": [
        "getOrderedImages",
        "recoveryKey"
      ],
      "requiredOccurrences": [
        {
          "text": "getOrderedImages",
          "count": 3
        },
        {
          "text": "recoveryKey",
          "count": 3
        }
      ]
    },
    {
      "file": "src/components/InfoBox.tsx",
      "blocks": [
        {
          "label": "src/components/InfoBox.tsx demand sequence block 1",
          "before": "\n          {/* ELEVATION PROFILE WIDGET TOGGLE */}\n          {this.props.enableElevationProfile === true && sequenceImages && sequenceImages.length > 1 && (\n            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />\n          )}\n",
          "after": "\n          {/* ELEVATION PROFILE WIDGET TOGGLE */}\n          {this.props.enableElevationProfile === true && !!imageId && (\n            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />\n          )}\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    }
  ],
  "modules": [
    {
      "file": "src/features/imagery/SequenceDemandData.ts",
      "content": "import { GRAPH_API } from '../../utils/constants';\nimport { imageAltitudeFields } from '../../utils/imageAltitude';\nimport type { SequenceCoordinate } from './sequenceCoordinates';\n\nexport const SEQUENCE_DEMAND_LIMITS = { radius: 64, step: 32, retained: 384 } as const;\ntype Index = { ids: string[]; positions: Map<string, number> };\nconst cancelled = () => new DOMException('Cancelled', 'AbortError');\nconst check = (signal: AbortSignal) => { if (signal.aborted) throw cancelled(); };\nconst valid = (p: SequenceCoordinate) => Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90;\n\n/** Ordered IDs are cheap navigation data. Coordinates are a separate, bounded cache.\n * All network operations belong to a selection/tool signal; failed/aborted work\n * never becomes a successful cache entry. Full routes live in the existing store.\n */\nexport class SequenceDemandData {\n  private indices = new Map<string, Index>();\n  private points = new Map<string, Map<string, SequenceCoordinate>>();\n  private pendingIds = new Map<string, { controller: AbortController; users: number; promise: Promise<Index> }>();\n  constructor(private readonly fetchJson: (url: string, signal: AbortSignal) => Promise<any>) {}\n  private async index(sequenceId: string, signal: AbortSignal): Promise<Index> {\n    check(signal);\n    const cached = this.indices.get(sequenceId); if (cached) return cached;\n    let entry = this.pendingIds.get(sequenceId);\n    if (!entry || entry.controller.signal.aborted) {\n      const controller = new AbortController(), requestSignal = controller.signal;\n      const promise = (async () => {\n        const ids = new Set<string>(), visited = new Set<string>();\n        let next = `${GRAPH_API.BASE}/image_ids?sequence_id=${encodeURIComponent(sequenceId)}`;\n        while (next) {\n          check(requestSignal);\n          if (visited.has(next)) throw new Error('Mapillary sequence pagination repeated');\n          visited.add(next);\n          const data = await this.fetchJson(next, requestSignal); check(requestSignal);\n          if (!Array.isArray(data.data)) throw new Error('Mapillary returned invalid sequence data');\n          for (const image of data.data) if (image.id != null) ids.add(String(image.id));\n          next = data.paging?.next || '';\n          if (next && new URL(next).origin !== new URL(GRAPH_API.BASE).origin) throw new Error('Unexpected sequence pagination host');\n        }\n        if (!ids.size) throw new Error('This sequence has no available images');\n        const ordered = Array.from(ids), index = { ids: ordered, positions: new Map(ordered.map((id, i) => [id, i])) };\n        check(requestSignal); this.indices.set(sequenceId, index);\n        while (this.indices.size > 6) { const oldest = this.indices.keys().next().value!; this.indices.delete(oldest); this.points.delete(oldest); }\n        return index;\n      })();\n      entry = { controller, promise, users: 0 }; this.pendingIds.set(sequenceId, entry);\n      const task = entry;\n      const cleanup = () => { if (this.pendingIds.get(sequenceId) === task) this.pendingIds.delete(sequenceId); };\n      promise.then(cleanup, cleanup);\n    }\n    const task = entry; ++task.users;\n    return new Promise<Index>((resolve, reject) => {\n      let settled = false;\n      const release = () => { signal.removeEventListener('abort', abort); if (--task.users === 0) task.controller.abort(); };\n      const abort = () => { if (settled) return; settled = true; release(); reject(cancelled()); };\n      signal.addEventListener('abort', abort, { once: true });\n      task.promise.then(index => { if (!settled) { settled = true; release(); resolve(index); } }, error => { if (!settled) { settled = true; release(); reject(error); } });\n      if (signal.aborted) abort();\n    });\n  }\n\n  async ids(sequenceId: string, signal: AbortSignal): Promise<readonly string[]> { return (await this.index(sequenceId, signal)).ids; }\n  seed(sequenceId: string, values: readonly SequenceCoordinate[]): void {\n    const cache = this.points.get(sequenceId) || new Map<string, SequenceCoordinate>(); this.points.set(sequenceId, cache);\n    for (const point of values) if (point.id != null && valid(point)) { cache.delete(String(point.id)); cache.set(String(point.id), point); }\n    while (cache.size > SEQUENCE_DEMAND_LIMITS.retained) cache.delete(cache.keys().next().value!);\n    while (this.points.size > 6) this.points.delete(this.points.keys().next().value!);\n  }\n  find(sequenceId: string, id: string): SequenceCoordinate | undefined { return this.points.get(sequenceId)?.get(id); }\n  private async range(sequenceId: string, index: Index, start: number, end: number, signal: AbortSignal): Promise<SequenceCoordinate[]> {\n    check(signal);\n    const cache = this.points.get(sequenceId), ids = index.ids.slice(start, end);\n    const found = new Map<string, SequenceCoordinate>();\n    for (const id of ids) { const p = cache?.get(id); if (p) found.set(id, p); }\n    const missing = ids.filter(id => !found.has(id));\n    // One worker, at most 50 images per request. Nearby metadata cannot saturate\n    // the connection used by MapillaryJS imagery and interactive map tiles.\n    for (let i = 0; i < missing.length; i += 50) {\n      const batch = missing.slice(i, i + 50);\n      const data = await this.fetchJson(`${GRAPH_API.BASE}/?ids=${batch.join(',')}&fields=id,geometry,captured_at,computed_altitude,altitude`, signal); check(signal);\n      for (const id of batch) {\n        const value = data[id], xy = value?.geometry?.coordinates;\n        if (!xy) continue;\n        const point = { id, lon: xy[0], lat: xy[1], ...imageAltitudeFields(value), captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined };\n        if (valid(point)) found.set(id, point);\n      }\n    }\n    check(signal); const result = ids.flatMap(id => found.has(id) ? [found.get(id)!] : []); this.seed(sequenceId, result); return result;\n  }\n  windowKey(sequenceId: string, imageId: string): string {\n    const at = this.indices.get(sequenceId)?.positions.get(imageId);\n    return `${sequenceId}:${at === undefined ? imageId : Math.floor(at / SEQUENCE_DEMAND_LIMITS.step)}`;\n  }\n  async window(sequenceId: string, imageId: string, signal: AbortSignal): Promise<SequenceCoordinate[]> {\n    const index = await this.index(sequenceId, signal); check(signal);\n    const position = index.positions.get(imageId); if (position === undefined) return [];\n    const center = Math.floor(position / SEQUENCE_DEMAND_LIMITS.step) * SEQUENCE_DEMAND_LIMITS.step;\n    return this.range(sequenceId, index, Math.max(0, center - SEQUENCE_DEMAND_LIMITS.radius), Math.min(index.ids.length, center + SEQUENCE_DEMAND_LIMITS.radius + 1), signal);\n  }\n  /** Point-cloud discovery needs anchors up to 200 m in both directions, not\n   * an arbitrary number of frames. Expand locally until that distance or an end.\n   * Keep the tool's result separately so bounded browsing-cache eviction is safe.\n   */\n  async corridor(sequenceId: string, imageId: string, signal: AbortSignal, distance: (a: SequenceCoordinate, b: SequenceCoordinate) => number): Promise<SequenceCoordinate[]> {\n    const index = await this.index(sequenceId, signal), at = index.positions.get(imageId);\n    if (at === undefined) return [];\n    const first = await this.range(sequenceId, index, at, at + 1, signal), current = first[0]; if (!current) return [];\n    const result = new Map<string, SequenceCoordinate>([[imageId, current]]);\n    for (const direction of [-1, 1]) {\n      let cursor = at + direction, done = false;\n      while (!done && cursor >= 0 && cursor < index.ids.length) {\n        const start = direction < 0 ? Math.max(0, cursor - 63) : cursor;\n        const end = direction < 0 ? cursor + 1 : Math.min(index.ids.length, cursor + 64);\n        const batch = await this.range(sequenceId, index, start, end, signal);\n        if (direction < 0) batch.reverse();\n        for (const point of batch) { result.set(point.id, point); if (distance(current, point) > 200) { done = true; break; } }\n        cursor = direction < 0 ? start - 1 : end;\n      }\n    }\n    check(signal); return Array.from(result.values()).sort((a, b) => index.positions.get(a.id)! - index.positions.get(b.id)!);\n  }\n  clear(): void { this.pendingIds.forEach(task => task.controller.abort()); this.indices.clear(); this.points.clear(); this.pendingIds.clear(); }\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'demand-sequence-loading-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-demand-sequence-loading.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited organization filter references remain)');
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
    console.log(uninstall ? 'Demand sequence loading is already uninstalled. No files changed.' : 'Demand sequence loading is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'demand-sequence-loading', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Demand sequence loading ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Ordinary browsing resolves nearby coordinates only. Elevation requests the complete route. Ordered IDs, point-cloud context, notes and cached routes keep separate loading lifetimes.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
