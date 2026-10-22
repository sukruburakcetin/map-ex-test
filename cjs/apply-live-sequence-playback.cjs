#!/usr/bin/env node
'use strict';
/** Live sequence playback installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx live sequence playback block 1",
          "before": "import { findSequenceCandidates } from '../features/imagery/sequenceCandidates';\nimport { fetchSequenceCoordinates } from '../features/imagery/sequenceCoordinates';\nimport { SharedSequenceRequests } from '../features/imagery/sharedSequenceRequests';\nimport { sequenceCacheStore } from '../features/imagery/sequenceCacheStore';\n",
          "after": "import { findSequenceCandidates } from '../features/imagery/sequenceCandidates';\nimport { fetchSequenceCoordinates } from '../features/imagery/sequenceCoordinates';\nimport { LiveSequenceFrames, LatestFrameDetails, LIVE_SEQUENCE_LIMITS, yieldSequenceWork } from '../features/imagery/LiveSequenceFrames';\nimport type { LiveSequenceFrame } from '../features/imagery/LiveSequenceFrames';\nimport { SharedSequenceRequests } from '../features/imagery/sharedSequenceRequests';\nimport { sequenceCacheStore } from '../features/imagery/sequenceCacheStore';\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 2",
          "before": "  private zoomDisplayHandle: __esri.WatchHandle | null = null;\n  private _sequenceRequests = new SharedSequenceRequests((id, token, signal, progress) => this.fetchSequenceWithCoords(id, token, signal, progress));\n  private _nearbyDiscovery: NearbyImageDiscovery | null = null;\n  private _turboAbortController: AbortController | null = null;\n",
          "after": "  private zoomDisplayHandle: __esri.WatchHandle | null = null;\n  private _sequenceRequests = new SharedSequenceRequests((id, token, signal, progress) => this.fetchSequenceWithCoords(id, token, signal, progress));\n  private _liveSequenceFrames = new LiveSequenceFrames((id, signal) => this.fetchMapillaryJson(`${GRAPH_API.BASE}/${id}?fields=id,sequence,geometry`, this.accessToken, signal));\n  private _liveFrameDetails = new LatestFrameDetails();\n  private _sequenceMarkerKey = '';\n  private _sequenceMarkerAbort: AbortController | null = null;\n  private _liveSequenceLine: { sequenceId: string; geometry: __esri.Geometry } | null = null;\n  private _minimapTrackingOwner: __esri.GraphicsLayer | null = null;\n  private _minimapFrameDot: __esri.Graphic | null = null;\n  private _minimapFrameCone: __esri.Graphic | null = null;\n  private _minimapSequenceLine: __esri.Graphic | null = null;\n  private _minimapSequenceGeometry: __esri.Geometry | null = null;\n  private _minimapFrameId: string | null = null;\n\n  private _nearbyDiscovery: NearbyImageDiscovery | null = null;\n  private _turboAbortController: AbortController | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 3",
          "before": "      const { imageId, sequenceImages } = this.state;\n      if (!imageId) return;\n      const img = sequenceImages.find((s) => s.id === imageId);\n      if (img) this.updateUrlWithCurrentImage(imageId, img.lat, img.lon);\n    }, 600);\n\n    // Define local redraw helper, pass specific coordinates\n    const redrawCone = async (lon?: number, lat?: number) => {\n      const view = this.state.jimuMapView?.view;\n      if (!view) return;\n",
          "after": "      const { imageId, sequenceImages } = this.state;\n      if (!imageId) return;\n      const img = this._liveSequenceFrames.find(imageId) || sequenceImages.find((s) => s.id === imageId);\n      if (img) this.updateUrlWithCurrentImage(imageId, img.lat, img.lon);\n    }, 600);\n\n    // Define local redraw helper, pass specific coordinates\n    const redrawCone = (lon?: number, lat?: number) => {\n      const view = this.state.jimuMapView?.view;\n      if (!view) return;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 4",
          "before": "        const currentId = this.state.imageId;\n        if (!currentId) return;\n        const img = this.state.sequenceImages.find((s) => s.id === currentId);\n        if (!img) return;\n        lon = img.lon;\n",
          "after": "        const currentId = this.state.imageId;\n        if (!currentId) return;\n        const img = this._liveSequenceFrames.current || this._liveSequenceFrames.find(currentId);\n        if (!img) return;\n        lon = img.lon;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 5",
          "before": "      }\n\n      // Get bearing from viewer or fallback\n      let bearing = this._lastBearing || 0;\n      try {\n        const b = await this.mapillaryViewer.getBearing();\n        if (typeof b === \"number\") {\n          bearing = b;\n          this._lastBearing = bearing;\n        }\n      } catch (e) {\n        /* ignore */\n      }\n\n      const length = this.coneLengths[this.zoomStepIndex];\n",
          "after": "      }\n\n      // Bearing events already supply the latest bearing. Never await per redraw.\n      const bearing = this._lastBearing || 0;\n\n      const length = this.coneLengths[this.zoomStepIndex];\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 6",
          "before": "    // 2. Bearing Change Event\n    this.mapillaryViewer.on(\"bearing\", (event: any) => {\n      this._lastBearing = event.bearing;\n\n",
          "after": "    // 2. Bearing Change Event\n    this.mapillaryViewer.on(\"bearing\", (event: any) => {\n      if (this.mapillaryViewer !== profileEventViewer) return;\n      this._lastBearing = event.bearing;\n\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 7",
          "before": "\n          redrawCone();\n        });\n      }\n\n      // Keep existing minimap behavior unchanged for now\n      this.updateMinimapTracking();\n\n      // Debounced URL update\n",
          "after": "\n          redrawCone();\n          this.updateMinimapTracking();\n        });\n      }\n\n      // Debounced URL update\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 8",
          "before": "\n      if (view && view.type === \"3d\" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading) {\n        const activeImg = this.state.sequenceImages.find((s) => s.id === this.state.imageId);\n\n        if (activeImg) {\n",
          "after": "\n      if (view && view.type === \"3d\" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading) {\n        const activeImg = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n\n        if (activeImg) {\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 9",
          "before": "    this.mapillaryViewer.on(\"image\", async (event: any) => {\n      if (this.mapillaryViewer !== profileEventViewer) return;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n",
          "after": "    this.mapillaryViewer.on(\"image\", async (event: any) => {\n      if (this.mapillaryViewer !== profileEventViewer) return;\n      const firstImageForViewer = this._profileConfirmedViewer !== profileEventViewer;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 10",
          "before": "      // Apply custom angle if set in config\n      // Only apply custom angle on the initial load, not during sequence navigation\n      if (this._isInitialImageLoad) {\n        this.applyCustomCameraAngle();\n      }\n      const newId = event.image.id;\n      const view = this.state.jimuMapView?.view;\n      if (!view) return;\n\n      // Check if this image is in our current sequence\n      let newImg = this.state.sequenceImages.find((s) => s.id === newId);\n      let didLateralJump = false; // Track if we jumped to a new sequence\n\n      // If not found (lateral movement to different sequence), fetch the new sequence\n      if (!newImg) {\n        this.log(\"Image not in current sequence, fetching new sequence data...\");\n        didLateralJump = true; // Mark that we're doing a lateral jump\n\n        try {\n          // Fetch the sequence ID for this image\n          const resp = await fetch(`${GRAPH_API.BASE}/${newId}?fields=sequence,geometry`, {\n            headers: { Authorization: `OAuth ${this.accessToken}` },\n          });\n\n          if (resp.ok) {\n            const data = await resp.json();\n            const newSeqId = data.sequence;\n            const coords = data.geometry?.coordinates;\n\n            if (newSeqId && coords) {\n              // Fetch full sequence coordinates\n              const newSequenceImages = await this.getSequenceWithCoords(newSeqId, this.accessToken);\n\n              // Update state with new sequence\n              this.setState({\n                sequenceId: newSeqId,\n                selectedSequenceId: newSeqId,\n                sequenceImages: newSequenceImages,\n              });\n\n              // Save to cache\n              this.saveSequenceCache(newSeqId, newSequenceImages);\n\n              // Find the new image in the updated sequence\n              newImg = newSequenceImages.find((s) => s.id === newId);\n\n              // Redraw sequence graphics\n              if (newImg) {\n                // Clear green pulse first\n                this.clearGreenPulse();\n\n                // Clear ALL old graphics (including old sequence overlay)\n                const toRemove: __esri.Graphic[] = [];\n                view.graphics.forEach((g) => {\n                  toRemove.push(g);\n                });\n                toRemove.forEach((g) => view.graphics.remove(g));\n\n                // Draw new sequence polyline\n                if (newSequenceImages.length > 1) {\n                  const { Graphic } = this.ArcGISModules;\n                  const paths = newSequenceImages.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });\n\n                  const polylineGraphic = new Graphic({\n                    geometry: { type: \"polyline\", paths: [paths], spatialReference: { wkid: 4326 } },\n                    symbol: { type: \"simple-line\", color: [0, 0, 255, 0.8], width: 3 },\n                    attributes: { sequenceId: newSeqId },\n                  });\n                  (polylineGraphic as any).__isSequenceOverlay = true;\n                  view.graphics.add(polylineGraphic);\n                }\n\n                // Draw new sequence points\n                newSequenceImages.forEach((img) => {\n                  if (img.id !== newId) {\n                    const position = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat);\n          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], newSeqId, img.id);\n                  }\n                });\n              }\n            }\n          }\n        } catch (err) {\n          console.error(\"Failed to fetch lateral sequence:\", err);\n          return; // Exit if we can't load the new sequence\n        }\n      }\n\n      if (!newImg) {\n        console.warn(\"Could not locate image coordinates\");\n        return;\n      }\n\n      // Turn previous active into static blue point ONLY if staying in same sequence\n      if (this.state.imageId && this.state.imageId !== newId && !didLateralJump) {\n        const prevImg = this.state.sequenceImages.find((s) => s.id === this.state.imageId);\n        if (prevImg) {\n          this.clearGreenPulse();\n          const previousPosition = this.getCoverageDisplayPosition(String(prevImg.id), prevImg.lon, prevImg.lat);\n          this.drawPointWithoutRemoving(previousPosition.lon, previousPosition.lat, [0, 0, 255, 1], this.state.sequenceId!, prevImg.id);\n        }\n      }\n\n      // Update State with New ID\n      this.setState({ imageId: newId }, () => {\n        this._nearbySelectedId = null; // real imageId is now in state, clear the optimistic selection\n\n        // 1. FRESH LOOKUP: Ensure we have the exact coordinates for the active ID\n        // This guarantees the graphics are drawn exactly where the new image is.\n        const activeImg = this.state.sequenceImages.find((s) => s.id === newId);\n        this.checkAndLoadNextPointCloud(newId);\n        // GUARD: Only access coordinates if activeImg was found!\n",
          "after": "      // Apply custom angle if set in config\n      // Only apply custom angle on the initial load, not during sequence navigation\n      if (this._isInitialImageLoad && firstImageForViewer) {\n        this.applyCustomCameraAngle();\n      }\n      const newId = String(event.image.id);\n      const view = this.state.jimuMapView?.view;\n      if (!view) return;\n      let newImg: LiveSequenceFrame | null;\n      try { newImg = await this._liveSequenceFrames.resolve(event.image); }\n      catch (error) {\n        if (this.mapillaryViewer === profileEventViewer) console.warn('[Mapillary tracking] Current image metadata unavailable:', error);\n        return;\n      }\n      if (!newImg || this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(newImg)) return;\n      const frame = newImg;\n      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n        // A true sequence change starts background hydration; tracking never awaits it.\n        const routeRequestId = ++this._selectionRequestId; this._selectionAbort?.abort();\n        const controller = new AbortController(); this._selectionAbort = controller;\n        this.clearActiveSequenceLayer();\n        this.setState(() => !this._liveSequenceFrames.isCurrent(frame) || this.state.jimuMapView?.view !== view || this.mapillaryViewer !== profileEventViewer ? null : ({ sequenceId: frame.sequenceId, selectedSequenceId: frame.sequenceId,\n          sequenceImages: [frame], sequenceRouteLoading: true, sequenceRouteProgress: undefined,\n          imageryRepresentative: false, selectionError: undefined, selectionCanRetry: false }), () => {\n          if (routeRequestId === this._selectionRequestId && !controller.signal.aborted && this._liveSequenceFrames.sequenceId === frame.sequenceId && this.state.jimuMapView?.view === view)\n            void this.hydrateLiveSequence(frame.sequenceId, routeRequestId, controller, view);\n        });\n      }\n\n      // Update State with New ID\n      this.setState(() => !this._liveSequenceFrames.isCurrent(frame) || this.state.jimuMapView?.view !== view || this.mapillaryViewer !== profileEventViewer ? null : ({ imageId: newId,\n        sequenceImages: this._liveSequenceFrames.complete || [frame] }), () => {\n        if (this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(frame)) return;\n        this._nearbySelectedId = null; // real imageId is now in state, clear the optimistic selection\n\n        // 1. FRESH LOOKUP: Ensure we have the exact coordinates for the active ID\n        // This guarantees the graphics are drawn exactly where the new image is.\n        const activeImg = frame;\n        this.checkAndLoadNextPointCloud(newId);\n        // GUARD: Only access coordinates if activeImg was found!\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 11",
          "before": "          this._lastSuccessfulSelection = { sequenceImages: this.state.sequenceImages, imageId: newId, sequenceId: this.state.sequenceId, selectedSequenceId: this.state.selectedSequenceId };\n\n          this.checkForTimeTravel(newId);\n\n          if (this.state.isSolarMode) {\n            this.updateSolarGraphics();\n          }\n\n          this.mapillaryViewer\n            .getBearing()\n            .then((b: number) => {\n              if (typeof b === \"number\") {\n                this._lastBearing = b;\n              }\n              redrawCone(activeImg.lon, activeImg.lat);\n            })\n            .catch(() => {\n              redrawCone(activeImg.lon, activeImg.lat);\n            });\n\n          // 3. Map Synchronization Logic (With Offset)\n",
          "after": "          this._lastSuccessfulSelection = { sequenceImages: this.state.sequenceImages, imageId: newId, sequenceId: this.state.sequenceId, selectedSequenceId: this.state.selectedSequenceId };\n\n\n          redrawCone(activeImg.lon, activeImg.lat);\n          this.updateMinimapTracking();\n          void this.refreshSequenceMarkerWindow();\n\n          // 3. Map Synchronization Logic (With Offset)\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 12",
          "before": "            if (view.type === \"3d\") {\n              const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);\n              if (camera) this.navigateMapView(view, camera, { animate: true, duration: 300 });\n            }\n            // 2D MAP MODE\n",
          "after": "            if (view.type === \"3d\") {\n              const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);\n              if (camera) this.navigateMapView(view, camera, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n            }\n            // 2D MAP MODE\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 13",
          "before": "              // Standard Center\n              if (position === \"center\") {\n                this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: true, duration: 300 });\n              }\n              // Offset Logic\n",
          "after": "              // Standard Center\n              if (position === \"center\") {\n                this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n              }\n              // Offset Logic\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 14",
          "before": "                    });\n\n                    this.navigateMapView(view, { center: newCenter, scale: followScale }, { animate: true, duration: 300 });\n                  } else {\n                    this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: true, duration: 300 });\n                  }\n                } catch (e) {\n                  this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: true, duration: 300 });\n                }\n              }\n",
          "after": "                    });\n\n                    this.navigateMapView(view, { center: newCenter, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n                  } else {\n                    this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n                  }\n                } catch (e) {\n                  this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n                }\n              }\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 15",
          "before": "      });\n\n      if (this.state.detectionsActive) {\n        this.loadDetections(event.image.id);\n      }\n      this.updateViewerFieldNoteMarkers();\n      // Reverse geocode\n      this.fetchReverseGeocode(newImg.lat, newImg.lon);\n      // Update minimap tracking\n      this.updateMinimapTracking();\n      if (!this._isFlyInActive) {\n        this.updateUrlWithCurrentImage(newId, newImg.lat, newImg.lon);\n      }\n\n      this.fetchNearbyImages(newImg.lat, newImg.lon, newId);\n    });\n  }\n",
          "after": "      });\n\n      // Secondary work is latest-frame-only and capped; it cannot delay tracking.\n      this._liveFrameDetails.queue(() => {\n        if (this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(frame)) return;\n        if (this.state.detectionsActive) this.loadDetections(newId);\n        this.updateViewerFieldNoteMarkers();\n        this.checkForTimeTravel(newId);\n        if (this.state.isSolarMode) this.updateSolarGraphics();\n        this.fetchReverseGeocode(frame.lat, frame.lon);\n        if (!this._isFlyInActive) this.updateUrlWithCurrentImage(newId, frame.lat, frame.lon);\n        if (this._userPaused) this.fetchNearbyImages(frame.lat, frame.lon, newId);\n      });\n    });\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 16",
          "before": "  // and attaches Mapillary event listeners for bearing/image changes.\n  private async getSelectedImageCoords(sequenceId: string, imageId: string, signal: AbortSignal): Promise<{id:string;lon:number;lat:number;captured_at?:number}> {\n    const cached: {id:string;lon:number;lat:number;captured_at?:number}[] = this.sequenceCoordsCache[sequenceId] || (this.state.sequenceId === sequenceId ? this.state.sequenceImages : []);\n    const found = cached.find(p => String(p.id) === String(imageId));\n",
          "after": "  // and attaches Mapillary event listeners for bearing/image changes.\n  private async getSelectedImageCoords(sequenceId: string, imageId: string, signal: AbortSignal): Promise<{id:string;lon:number;lat:number;captured_at?:number}> {\n    const live = this._liveSequenceFrames.sequenceId === sequenceId ? this._liveSequenceFrames.find(imageId) : undefined;\n    if (live) return live;\n    const cached: {id:string;lon:number;lat:number;captured_at?:number}[] = this.sequenceCoordsCache[sequenceId] || (this.state.sequenceId === sequenceId ? this.state.sequenceImages : []);\n    const found = cached.find(p => String(p.id) === String(imageId));\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 17",
          "before": "    // must still hydrate normally. Frame navigation must not recreate thousands of markers.\n    const loadedSequence = this.state.sequenceImages;\n    const previousImageId = this.state.imageId;\n    const reuseLoadedRoute = !nearestToClick && !!this.mapillaryViewer &&\n      this.state.sequenceId === sequenceId && !this.state.sequenceRouteLoading &&\n",
          "after": "    // must still hydrate normally. Frame navigation must not recreate thousands of markers.\n    const loadedSequence = this.state.sequenceImages;\n    const reuseLoadedRoute = !nearestToClick && !!this.mapillaryViewer &&\n      this.state.sequenceId === sequenceId && !this.state.sequenceRouteLoading &&\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 18",
          "before": "      !!this._activeSequenceOverlay?.layer &&\n      this.state.jimuMapView?.view.map?.layers.includes(this._activeSequenceOverlay.layer) &&\n      this._activeSequenceOverlay.points.size >= loadedSequence.length - 1 &&\n      loadedSequence.some(image => String(image.id) === String(startImageId));\n    const requestId = ++this._selectionRequestId;\n    this._selectionAbort?.abort();\n    const controller = new AbortController(); this._selectionAbort = controller;\n    const previous = this.mapillaryViewer ? this._lastSuccessfulSelection : null;\n",
          "after": "      !!this._activeSequenceOverlay?.layer &&\n      this.state.jimuMapView?.view.map?.layers.includes(this._activeSequenceOverlay.layer) &&\n      this._liveSequenceFrames.complete === loadedSequence && this._liveSequenceLine?.sequenceId === sequenceId &&\n      loadedSequence.some(image => String(image.id) === String(startImageId));\n    const requestId = ++this._selectionRequestId;\n    this._selectionAbort?.abort(); this._liveSequenceFrames.cancelPending(); this._liveFrameDetails.clear();\n    const controller = new AbortController(); this._selectionAbort = controller;\n    const previous = this.mapillaryViewer ? this._lastSuccessfulSelection : null;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 19",
          "before": "      if (!updatedSequence.some(img => String(img.id) === String(startImageId))) throw Object.assign(new Error(\"Selected image coordinates are unavailable\"), { status: 404 });\n\n      // Commit coordinates before moveTo can emit its image event.\n      await new Promise<void>(resolve => {\n        const cancelled = () => resolve(); controller.signal.addEventListener(\"abort\", cancelled, { once: true });\n        this.setState({ sequenceImages: updatedSequence, imageId: startImageId, sequenceId, selectedSequenceId: sequenceId, hasTimeTravel: false }, () => {\n          controller.signal.removeEventListener(\"abort\", cancelled); resolve();\n        });\n",
          "after": "      if (!updatedSequence.some(img => String(img.id) === String(startImageId))) throw Object.assign(new Error(\"Selected image coordinates are unavailable\"), { status: 404 });\n\n      this._liveSequenceFrames.begin(sequenceId, updatedSequence);\n\n      // Commit coordinates before moveTo can emit its image event.\n      await new Promise<void>(resolve => {\n        const cancelled = () => resolve(); controller.signal.addEventListener(\"abort\", cancelled, { once: true });\n        this.setState(() => !current() ? null : ({ sequenceImages: updatedSequence, imageId: startImageId, sequenceId, selectedSequenceId: sequenceId, hasTimeTravel: false }), () => {\n          controller.signal.removeEventListener(\"abort\", cancelled); resolve();\n        });\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 20",
          "before": "\n      if (reuseLoadedRoute) {\n        // Restore only the former active point; the remaining route and cache are unchanged.\n        const former = loadedSequence.find(image => String(image.id) === String(previousImageId));\n        if (former && String(former.id) !== String(startImageId)) {\n          const position = this.getCoverageDisplayPosition(String(former.id), former.lon, former.lat);\n          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], sequenceId, former.id);\n        }\n        this.setState({ isLoading: false, imageryRepresentative: false });\n        if (clickPoint) this.drawPoint(clickPoint.lon, clickPoint.lat);\n        if (this.state.isElevationProfileActive) this.updateProfileIndicator();\n        try { this._lastBearing = await this.mapillaryViewer.getBearing(); } catch { /* Retain last known bearing. */ }\n        if (!current()) return;\n        // A newer viewer image event can win while bearing resolves; never jump it back.\n        const active = loadedSequence.find(image => String(image.id) === String(this.state.imageId));\n        if (active) this.drawCone(active.lon, active.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n        this._lastSuccessfulSelection = { sequenceImages: loadedSequence, imageId: this.state.imageId, sequenceId, selectedSequenceId: sequenceId };\n        this._selectionRetry = null;\n",
          "after": "\n      if (reuseLoadedRoute) {\n        void this.refreshSequenceMarkerWindow();\n        this.setState({ isLoading: false, imageryRepresentative: false });\n        if (clickPoint) this.drawPoint(clickPoint.lon, clickPoint.lat);\n        if (this.state.isElevationProfileActive) this.updateProfileIndicator();\n        const active = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n        if (active && String(active.id) === String(this.state.imageId)) this.drawCone(active.lon, active.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n        this._lastSuccessfulSelection = { sequenceImages: loadedSequence, imageId: this.state.imageId, sequenceId, selectedSequenceId: sequenceId };\n        this._selectionRetry = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 21",
          "before": "      void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);\n      this.setState({ isLoading: false });\n      this.drawPulsingPoint(selected.lon, selected.lat, [0, 255, 0, 1], selected.id);\n      try { this._lastBearing = await this.mapillaryViewer.getBearing(); } catch { /* Retain last known bearing. */ }\n      if (!current()) return;\n      this.drawCone(selected.lon, selected.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n      this._lastSuccessfulSelection = { sequenceImages: [selected], imageId: startImageId, sequenceId, selectedSequenceId: sequenceId };\n      try { updatedSequence = await this.getSequenceWithCoords(sequenceId, this.accessToken, controller.signal, (points, batch, loaded, total) => {\n        if (!current()) return;\n        this.setState({ sequenceRouteProgress: `${loaded.toLocaleString()}/${total.toLocaleString()}` });\n        if (points.length < 2 || !this.ArcGISModules?.Graphic) return;\n        const layer = this.ensureActiveSequenceLayer(jimuMapView.view);\n        layer.add(new this.ArcGISModules.Graphic({ geometry: { type: \"polyline\", paths: [points.map(p => { const display = this.getCoverageDisplayPosition(p.id, p.lon, p.lat); return [display.lon, display.lat]; })], spatialReference: { wkid: 4326 } }, symbol: { type: \"simple-line\", color: [0,0,255,0.65], width: 3 }, attributes: { sequence_preview: true, sequence_batch: batch, sequenceId } }));\n      }); }\n      catch (error) {\n        if (current()) this.setState({ sequenceRouteLoading: false, selectionError: \"Image is open, but its sequence route could not load. Retry or choose another point.\", selectionCanRetry: true });\n        return;\n      }\n      if (!current()) return;\n      this.setState({ sequenceRouteLoading: false });\n      if (this._activeSequenceOverlay?.layer) {\n        const previews = this._activeSequenceOverlay?.layer.graphics.toArray().filter(g => g.attributes?.sequence_preview);\n        this._activeSequenceOverlay?.layer.removeMany(previews);\n      }\n      // Viewer navigation may have changed the active image while the route loaded.\n      if (this.state.imageId !== startImageId) { if (this.state.sequenceId === sequenceId) this.setState({ sequenceImages: updatedSequence }); return; }\n      this.setState({ sequenceImages: updatedSequence });\n      currentImg = updatedSequence.find(img => String(img.id) === String(startImageId)) || selected;\n      this.saveSequenceCache(sequenceId, updatedSequence);\n\n\n      // Clear old map graphics (except overlay)\n      const toRemove: __esri.Graphic[] = [];\n      jimuMapView.view.graphics.forEach((g: __esri.Graphic) => {\n        if (!(g as any).__isSequenceOverlay && !(g as any).__isClickRipple) {\n          toRemove.push(g);\n        }\n      });\n      toRemove.forEach((g) => jimuMapView.view.graphics.remove(g));\n\n      // Draw Polyline FIRST so it stays BEHIND points\n      const { Graphic } = this.ArcGISModules;\n\n      const hasPolyline = jimuMapView.view.graphics.some((g: __esri.Graphic) => (g as any).__isSequenceOverlay && g.geometry?.type === \"polyline\" && g.attributes?.sequenceId === sequenceId);\n\n      if (!hasPolyline && updatedSequence.length > 1) {\n        const paths = updatedSequence.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });\n\n        const polylineGraphic = new Graphic({\n          geometry: { type: \"polyline\", paths: [paths], spatialReference: { wkid: 4326 } },\n          symbol: { type: \"simple-line\", color: [0, 0, 255, 0.8], width: 3 },\n          attributes: { sequenceId: sequenceId },\n        });\n        (polylineGraphic as any).__isSequenceOverlay = true;\n        jimuMapView.view.graphics.add(polylineGraphic);\n      }\n\n      // Draw Blue Dots (Active Sequence), Now they render ON TOP of the line\n      let markerBatch: __esri.Graphic[] = [];\n      let markerDeadline = performance.now() + 8;\n      for (const img of updatedSequence) {\n        if (!current()) return;\n        if (img.id !== startImageId && img.id !== this.state.imageId) {\n          const position = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat);\n          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], sequenceId, img.id, markerBatch);\n        }\n        if (markerBatch.length >= 64 || performance.now() >= markerDeadline) {\n          if (markerBatch.length) this.ensureActiveSequenceLayer(jimuMapView.view).addMany(markerBatch);\n          markerBatch = [];\n          await new Promise(resolve => setTimeout(resolve, 0)); markerDeadline = performance.now() + 8;\n        }\n      }\n      if (markerBatch.length) this.ensureActiveSequenceLayer(jimuMapView.view).addMany(markerBatch);\n      if (this.state.imageId !== startImageId) return;\n\n\n      // Draw active Green Pulse - Topmost\n      if (currentImg) {\n        this.currentGreenGraphic = this.drawPulsingPoint(currentImg.lon, currentImg.lat, [0, 255, 0, 1], currentImg.id);\n      }\n\n      // Redraw clicked location marker if exists\n      // Use passed point (fresh) or fallback to state (if no new click passed)\n      const targetLon = clickPoint ? clickPoint.lon : this.state.clickLon;\n      const targetLat = clickPoint ? clickPoint.lat : this.state.clickLat;\n\n      if (targetLon != null && targetLat != null) {\n        this.drawPoint(targetLon, targetLat);\n      }\n      if (currentImg) {\n        try { this._lastBearing = await this.mapillaryViewer.getBearing(); } catch { /* Use last known bearing. */ }\n        if (!current()) return;\n        this.drawCone(currentImg.lon, currentImg.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n      }\n      this._lastSuccessfulSelection = { sequenceImages: updatedSequence, imageId: startImageId, sequenceId, selectedSequenceId: sequenceId };\n      this._selectionRetry = null;\n    } catch (err) {\n      if (!current()) return;\n",
          "after": "      void this.showCachedSequencePreview(sequenceId, requestId, controller.signal);\n      this.setState({ isLoading: false });\n      const active = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || selected;\n      if (!this._liveSequenceFrames.current && String(active.id) === String(this.state.imageId)) {\n        this.drawPulsingPoint(active.lon, active.lat, [0, 255, 0, 1], active.id);\n        this.drawCone(active.lon, active.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n      }\n      this._lastSuccessfulSelection = { sequenceImages: updatedSequence, imageId: active.id, sequenceId, selectedSequenceId: sequenceId };\n      void this.hydrateLiveSequence(sequenceId, requestId, controller, jimuMapView.view);\n    } catch (err) {\n      if (!current()) return;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 22",
          "before": "      this.clearGreenPulse(); this.clearConeGraphics();\n      if (previous) {\n        this.setState(previous, () => {\n          if (!current()) return;\n",
          "after": "      this.clearGreenPulse(); this.clearConeGraphics();\n      if (previous) {\n        if (previous.sequenceId) {\n          this._liveSequenceFrames.begin(previous.sequenceId, previous.sequenceImages);\n          if (this.sequenceCoordsCache[previous.sequenceId] === previous.sequenceImages) this._liveSequenceFrames.finish(previous.sequenceId, previous.sequenceImages);\n        }\n        this.setState(previous, () => {\n          if (!current()) return;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 23",
          "before": "  private async fetchMapillaryJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {\n    return fetchGraphJson(url, accessToken, signal);\n  }\n\n",
          "after": "  private async fetchMapillaryJson(url: string, accessToken: string, signal?: AbortSignal): Promise<any> {\n    return fetchGraphJson(url, accessToken, signal);\n  }\n\n  /** Complete route metadata in the background without owning the current viewer frame. */\n  private async hydrateLiveSequence(sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {\n    const current = () => requestId === this._selectionRequestId && !controller.signal.aborted &&\n      this.state.jimuMapView?.view === view && !view.destroyed && this._liveSequenceFrames.sequenceId === sequenceId;\n    let lastProgress = -Infinity, previewCount = 0;\n    try {\n      const route = await this.getSequenceWithCoords(sequenceId, this.accessToken, controller.signal, (points, batch, loaded, total) => {\n        if (!current()) return;\n        this._liveSequenceFrames.remember(sequenceId, points);\n        if (performance.now() - lastProgress >= LIVE_SEQUENCE_LIMITS.progressInterval || loaded === total) {\n          lastProgress = performance.now(); this.setState(() => !current() ? null : ({ sequenceRouteProgress: `${loaded.toLocaleString()}/${total.toLocaleString()}` }));\n        }\n        // Bound preview graphics; busy playback/panning takes priority over previews.\n        if (!this._userPaused || view.stationary === false || points.length < 2 || previewCount >= LIVE_SEQUENCE_LIMITS.previewSegments || !this.ArcGISModules?.Graphic) return;\n        ++previewCount;\n        const paths = points.map(p => { const display = this.getCoverageDisplayPosition(p.id, p.lon, p.lat); return [display.lon, display.lat]; });\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [paths], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.65], width: 3 }, attributes: { sequence_preview: true, sequence_batch: batch, sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; this.ensureActiveSequenceLayer(view).add(graphic);\n      });\n      if (!current()) return;\n      this._liveSequenceFrames.finish(sequenceId, route);\n      this.setState(() => !current() ? null : ({ sequenceImages: route, sequenceRouteLoading: false, sequenceRouteProgress: undefined }), () => {\n        if (!current()) return;\n        this._lastSuccessfulSelection = { sequenceImages: route, imageId: this.state.imageId, sequenceId, selectedSequenceId: sequenceId };\n        this.updateProfileIndicator();\n      });\n      this.saveSequenceCache(sequenceId, route); this._selectionRetry = null;\n      await this.renderLiveSequenceLine(route, sequenceId, requestId, controller, view);\n    } catch (error) {\n      if (!current()) return;\n      const retryImageId = this._liveSequenceFrames.current?.id || this.state.imageId;\n      if (retryImageId) this._selectionRetry = { sequenceId, imageId: retryImageId };\n      this.setState({ sequenceRouteLoading: false, sequenceRouteProgress: undefined,\n        selectionError: 'Image tracking is active, but the sequence route could not load. Retry or choose another point.', selectionCanRetry: true });\n      console.warn('[Mapillary sequence] Background route unavailable:', error);\n    }\n  }\n\n  private async renderLiveSequenceLine(route: readonly SequenceCoordinate[], sequenceId: string, requestId: number, controller: AbortController, view: __esri.MapView | __esri.SceneView) {\n    const current = () => requestId === this._selectionRequestId && !controller.signal.aborted && this.state.jimuMapView?.view === view && !view.destroyed && this._liveSequenceFrames.sequenceId === sequenceId;\n    try {\n      // Prepare one route line in short cancellable slices. Never clear the pulse/cone.\n      const path: number[][] = [];\n      let deadline = performance.now() + 3;\n      for (let i = 0; i < route.length; i++) {\n        if (!current()) return;\n        const point = route[i], display = this.getCoverageDisplayPosition(String(point.id), point.lon, point.lat);\n        path.push([display.lon, display.lat]);\n        if ((i & 127) === 127 || performance.now() >= deadline) { await yieldSequenceWork(controller.signal); deadline = performance.now() + 3; }\n      }\n      if (!current() || !this.ArcGISModules?.Graphic) return;\n      const layer = this.ensureActiveSequenceLayer(view);\n      const previews = layer.graphics.toArray().filter(graphic => graphic.attributes?.sequence_preview);\n      layer.removeMany(previews);\n      if (path.length > 1) {\n        const graphic = new this.ArcGISModules.Graphic({ geometry: { type: 'polyline', paths: [path], spatialReference: { wkid: 4326 } },\n          symbol: { type: 'simple-line', color: [0,0,255,.8], width: 3 }, attributes: { sequenceId } });\n        (graphic as any).__isSequenceOverlay = true; layer.add(graphic);\n        this._liveSequenceLine = { sequenceId, geometry: graphic.geometry }; this.updateMinimapTracking();\n      }\n      void this.refreshSequenceMarkerWindow();\n    } catch (error) { if (current()) console.warn('[Mapillary sequence] Route line unavailable:', error); }\n  }\n\n  /** At close zoom only, reuse a bounded 128-frame marker window, shifting every 32 frames. */\n  private async refreshSequenceMarkerWindow() {\n    const view = this.state.jimuMapView?.view, sequenceId = this.state.sequenceId;\n    if (!view || view.destroyed || !sequenceId || this._liveSequenceFrames.sequenceId !== sequenceId) return;\n    const window = view.zoom >= LIVE_SEQUENCE_LIMITS.markerZoom ? this._liveSequenceFrames.markerWindow(String(this.state.imageId)) : null;\n    const key = `${sequenceId}:${window?.key ?? 'line-only'}`;\n    if (key === this._sequenceMarkerKey && this._activeSequenceOverlay?.view === view) return;\n    // Create/transfer the layer before owning a new marker job: layer cleanup aborts its former job.\n    if (window) this.ensureActiveSequenceLayer(view);\n    this._sequenceMarkerAbort?.abort(); const controller = new AbortController(); this._sequenceMarkerAbort = controller;\n    this._sequenceMarkerKey = key;\n    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && this._liveSequenceFrames.sequenceId === sequenceId;\n    try {\n      const overlay = this._activeSequenceOverlay;\n      if (overlay?.view === view && overlay.layer) {\n        const points = Array.from(overlay.points.values());\n        points.forEach(marker => { const close = this._turboCloseGraphics.get(String(marker.attributes?.image_id)); if (close && (close as any).__turboBaseSymbol) close.symbol = (close as any).__turboBaseSymbol; });\n        overlay.layer.removeMany(points); overlay.points.clear();\n      }\n      if (!window) return;\n      let batch: __esri.Graphic[] = [], deadline = performance.now() + 3;\n      for (const image of window.points) {\n        if (!current()) return;\n        const p = this.getCoverageDisplayPosition(String(image.id), image.lon, image.lat);\n        this.drawPointWithoutRemoving(p.lon, p.lat, [0,0,255,1], sequenceId, image.id, batch);\n        if (batch.length >= 16 || performance.now() >= deadline) {\n          if (batch.length) this.ensureActiveSequenceLayer(view).addMany(batch); batch = [];\n          await yieldSequenceWork(controller.signal); deadline = performance.now() + 3;\n        }\n      }\n      if (current() && batch.length) this.ensureActiveSequenceLayer(view).addMany(batch);\n    } catch (error) { if (current()) console.warn('[Mapillary sequence] Could not draw nearby route markers:', error); }\n  }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 24",
          "before": "    }\n    ++this._selectionRequestId;\n    this._selectionAbort?.abort(); this._selectionAbort = null;\n    this._selectionRetry = null;\n",
          "after": "    }\n    ++this._selectionRequestId;\n    this._liveSequenceFrames.cancelPending(); this._liveFrameDetails.clear();\n    this._selectionAbort?.abort(); this._selectionAbort = null;\n    this._selectionRetry = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 25",
          "before": "    this._selectionAbort?.abort(); this._selectionAbort = null;\n    this._sequenceRequests?.dispose(); this.sequenceCoordsCache = {}; this._selectionRetry = null;\n    void sequenceCacheStore.clear();\n    try {\n",
          "after": "    this._selectionAbort?.abort(); this._selectionAbort = null;\n    this._sequenceRequests?.dispose(); this.sequenceCoordsCache = {}; this._selectionRetry = null;\n    this._liveSequenceFrames.clear(); this._liveFrameDetails.clear(); this.clearActiveSequenceLayer();\n    void sequenceCacheStore.clear();\n    try {\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 26",
          "before": "  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();\n    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);\n",
          "after": "  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._liveSequenceFrames.clear(); this._liveFrameDetails.clear();\n    this._turboClickPickAbort?.abort(); this._coverageFrameLookup?.clear();\n    if (this._coverageFrameHoverTimer) clearTimeout(this._coverageFrameHoverTimer);\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 27",
          "before": "    // Legacy nearby-sequence revolver overlays are deprecated.\n\n    // 3. Restore Active Sequence (Blue line & dots)\n    if (selectedSequenceId && sequenceImages && sequenceImages.length > 0) {\n      const { Graphic } = this.ArcGISModules;\n\n      // Blue Polyline\n      if (sequenceImages.length > 1) {\n        const paths = sequenceImages.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });\n        const polylineGraphic = new Graphic({\n          geometry: { type: \"polyline\", paths: [paths], spatialReference: { wkid: 4326 } },\n          symbol: { type: \"simple-line\", color: [0, 0, 255, 0.8], width: 3 },\n          attributes: { sequenceId: selectedSequenceId },\n        });\n        (polylineGraphic as any).__isSequenceOverlay = true;\n        view.graphics.add(polylineGraphic);\n      }\n\n      // Blue Dots\n      sequenceImages.forEach((img) => {\n        if (img.id !== imageId) {\n          const position = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat);\n          this.drawPointWithoutRemoving(position.lon, position.lat, [0, 0, 255, 1], selectedSequenceId, img.id);\n        }\n      });\n    }\n\n",
          "after": "    // Legacy nearby-sequence revolver overlays are deprecated.\n\n    // 3. Restore the route independently, with the same bounded marker window.\n    if (selectedSequenceId && sequenceImages.length) {\n      this._liveSequenceFrames.begin(selectedSequenceId, sequenceImages);\n      const requestId = this._selectionRequestId;\n      this._selectionAbort?.abort(); const controller = new AbortController(); this._selectionAbort = controller;\n      if (this.state.sequenceRouteLoading) void this.hydrateLiveSequence(selectedSequenceId, requestId, controller, view);\n      else { this._liveSequenceFrames.finish(selectedSequenceId, sequenceImages); void this.renderLiveSequenceLine(sequenceImages, selectedSequenceId, requestId, controller, view); }\n    }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 28",
          "before": "        const spread = this.coneSpreads[this.zoomStepIndex];\n\n        if (this.mapillaryViewer) {\n          this.mapillaryViewer\n            .getBearing()\n            .then((b: number) => {\n              if (typeof b === \"number\") this._lastBearing = b;\n              this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing, length, spread);\n            })\n            .catch(() => {\n              this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);\n            });\n        } else {\n          this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);\n        }\n      }\n    }\n",
          "after": "        const spread = this.coneSpreads[this.zoomStepIndex];\n\n        this.drawCone(activeImg.lon, activeImg.lat, this._lastBearing || 0, length, spread);\n      }\n    }\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 29",
          "before": "   */\n  private destroyMinimap() {\n    this.log(\"Destroying minimap...\");\n\n",
          "after": "   */\n  private destroyMinimap() {\n    this._minimapTrackingOwner = null; this._minimapFrameDot = null; this._minimapFrameCone = null;\n    this._minimapSequenceLine = null; this._minimapSequenceGeometry = null; this._minimapFrameId = null;\n    this.log(\"Destroying minimap...\");\n\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 30",
          "before": "   */\n  private updateMinimapTracking() {\n    // Guard: view must exist AND not have been destroyed.\n    // After destroyMinimap() sets container=null, the view object lingers briefly\n    // before this.minimapView is nulled, check destroyed flag to close that window.\n    if (!this.minimapGraphicsLayer || !this.state.imageId || !this.ArcGISModules || !this.minimapView) return;\n    if ((this.minimapView as any).destroyed) return;\n\n    const currentImg = this.state.sequenceImages.find((img) => img.id === this.state.imageId);\n    if (!currentImg) return;\n\n    const { Graphic } = this.ArcGISModules;\n\n    // Clearing previous tracking graphics\n    try {\n      this.minimapGraphicsLayer.removeAll();\n    } catch {\n      return;\n    }\n\n    // Center the minimap on the current frame.\n    // goTo() returns a Promise; use .catch() not try/catch so the\n    // async rejection (\"Cannot read properties of undefined: animation\")\n    // is silently swallowed when the view is destroyed mid-flight.\n    if (this.minimapView && !(this.minimapView as any).destroyed) {\n      this.minimapView\n        .goTo(\n          {\n            center: [currentImg.lon, currentImg.lat],\n            zoom: Math.max(14, Math.min(18, this.minimapView.zoom || 15)),\n          },\n          { animate: false },\n        )\n        .catch(() => {\n          /* view destroyed mid-flight, ignore */\n        });\n    }\n\n    // Re-check view is still alive before adding graphics\n    if (!this.minimapGraphicsLayer || !this.minimapView || (this.minimapView as any).destroyed) return;\n\n    // Adding pulsing tracking dot\n    const trackingDot = new Graphic({\n      geometry: {\n        type: \"point\",\n        longitude: currentImg.lon,\n        latitude: currentImg.lat,\n        spatialReference: { wkid: 4326 },\n      },\n      symbol: {\n        type: \"simple-marker\",\n        color: \"#00ff00\",\n        size: 10,\n        outline: {\n          color: [255, 255, 255],\n          width: 2,\n        },\n      },\n    });\n\n    try {\n      this.minimapGraphicsLayer.add(trackingDot);\n    } catch {\n      return;\n    }\n\n    // Adding direction cone on minimap\n    if (this._lastBearing !== undefined && this.minimapGraphicsLayer && !(this.minimapView as any)?.destroyed) {\n      try {\n        const coneMini = new Graphic({\n          geometry: createConeGeometry(currentImg.lon, currentImg.lat, this._lastBearing, 30, 60),\n          symbol: {\n            type: \"simple-fill\",\n            color: [255, 165, 0, 0.6],\n            outline: {\n              color: [255, 165, 0, 1],\n              width: 1,\n            },\n          },\n        });\n        this.minimapGraphicsLayer.add(coneMini);\n      } catch {\n        return;\n      }\n    }\n\n    // Optionally, adding the sequence polyline\n    if (this.state.sequenceImages.length > 1 && this.minimapGraphicsLayer && !(this.minimapView as any)?.destroyed) {\n      try {\n        const paths = this.state.sequenceImages.map((img) => { const p = this.getCoverageDisplayPosition(String(img.id), img.lon, img.lat); return [p.lon, p.lat]; });\n        const sequenceLine = new Graphic({\n          geometry: {\n            type: \"polyline\",\n            paths: [paths],\n            spatialReference: { wkid: 4326 },\n          },\n          symbol: {\n            type: \"simple-line\",\n            color: [0, 0, 255, 0.8],\n            width: 2,\n          },\n        });\n        this.minimapGraphicsLayer.add(sequenceLine);\n      } catch {\n        return;\n      }\n    }\n  }\n",
          "after": "   */\n  private updateMinimapTracking() {\n    const layer = this.minimapGraphicsLayer, view = this.minimapView;\n    if (!layer || !view || (view as any).destroyed || !this.ArcGISModules || !this.state.imageId) return;\n    const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || this.state.sequenceImages.find(p => String(p.id) === String(this.state.imageId));\n    if (!image) return;\n    if (this._minimapTrackingOwner !== layer) {\n      this._minimapTrackingOwner = layer; this._minimapFrameDot = null; this._minimapFrameCone = null;\n      this._minimapSequenceLine = null; this._minimapSequenceGeometry = null; this._minimapFrameId = null;\n    }\n    const { Graphic } = this.ArcGISModules;\n    const point = { type: 'point', longitude: image.lon, latitude: image.lat, spatialReference: { wkid: 4326 } };\n    if (!this._minimapFrameDot) {\n      this._minimapFrameDot = new Graphic({ geometry: point, symbol: { type: 'simple-marker', color: '#00ff00', size: 10, outline: { color: 'white', width: 2 } } });\n      layer.add(this._minimapFrameDot!);\n    } else if (this._minimapFrameId !== String(image.id)) this._minimapFrameDot.geometry = point as any;\n    const cone = createConeGeometry(image.lon, image.lat, this._lastBearing || 0, 30, 60);\n    if (!this._minimapFrameCone) {\n      this._minimapFrameCone = new Graphic({ geometry: cone, symbol: { type: 'simple-fill', color: [255,165,0,.6], outline: { color: [255,165,0,1], width: 1 } } });\n      layer.add(this._minimapFrameCone!);\n    } else this._minimapFrameCone.geometry = cone;\n    const route = this._liveSequenceLine?.sequenceId === this.state.sequenceId ? this._liveSequenceLine.geometry : null;\n    if (route !== this._minimapSequenceGeometry) {\n      if (this._minimapSequenceLine) layer.remove(this._minimapSequenceLine);\n      this._minimapSequenceGeometry = route; this._minimapSequenceLine = null;\n      if (route) {\n        this._minimapSequenceLine = new Graphic({ geometry: route, symbol: { type: 'simple-line', color: [0,0,255,.8], width: 2 } });\n        layer.add(this._minimapSequenceLine!); layer.graphics.reorder(this._minimapSequenceLine!, 0);\n      }\n    }\n    if (this._minimapFrameId !== String(image.id)) {\n      this._minimapFrameId = String(image.id);\n      void view.goTo({ center: [image.lon, image.lat], zoom: Math.max(14, Math.min(18, view.zoom || 15)) }, { animate: false }).catch(error => {\n        if (!(view as any).destroyed && this.minimapView === view && (error as any)?.name !== 'AbortError') console.warn('[Mapillary minimap] Tracking unavailable:', error);\n      });\n    }\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 31",
          "before": "\n      this._debouncedZoomUrlUpdate();\n\n      /*\n",
          "after": "\n      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      /*\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 32",
          "before": "          let imageId = attrs.image_id ? String(attrs.image_id) : undefined;\n          if (!imageId) {\n            const images = this.state.sequenceId === seqId && this.state.sequenceImages.length\n              ? this.state.sequenceImages : this.sequenceCoordsCache[seqId];\n            let closest = Infinity;\n            for (const image of images || []) {\n",
          "after": "          let imageId = attrs.image_id ? String(attrs.image_id) : undefined;\n          if (!imageId) {\n            const images = this._liveSequenceFrames.sequenceId === seqId ? this._liveSequenceFrames.points()\n              : this.state.sequenceId === seqId && this.state.sequenceImages.length ? this.state.sequenceImages : this.sequenceCoordsCache[seqId];\n            let closest = Infinity;\n            for (const image of images || []) {\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 33",
          "before": "\n  private clearActiveSequenceLayer() {\n    this._turboCloseGraphics.forEach(g => { if ((g as any).__turboBaseSymbol) g.symbol = (g as any).__turboBaseSymbol; });\n    this._activeSequenceOverlay?.dispose();\n",
          "after": "\n  private clearActiveSequenceLayer() {\n    this._sequenceMarkerAbort?.abort(); this._sequenceMarkerAbort = null; this._sequenceMarkerKey = ''; this._liveSequenceLine = null;\n    this._turboCloseGraphics.forEach(g => { if ((g as any).__turboBaseSymbol) g.symbol = (g as any).__turboBaseSymbol; });\n    this._activeSequenceOverlay?.dispose();\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 34",
          "before": "  // into a readable address displayed in the info box.\n  private fetchReverseGeocode = async (lat: number, lon: number) => {\n    return fetchReverseAddress(lat, lon, address => this.setState({ address }));\n  };\n\n",
          "after": "  // into a readable address displayed in the info box.\n  private fetchReverseGeocode = async (lat: number, lon: number) => {\n    const imageId = this.state.imageId, view = this.state.jimuMapView?.view;\n    return fetchReverseAddress(lat, lon, address => { if (this.state.imageId === imageId && this.state.jimuMapView?.view === view) this.setState({ address }); });\n  };\n\n"
        },
        {
          "label": "src/runtime/widget.tsx live sequence playback block 35",
          "before": "   */\n  private checkForTimeTravel = async (currentImageId: string) => {\n    return checkTimeTravelAvailability(currentImageId, () => this.accessToken, hasTimeTravel => this.setState({ hasTimeTravel }));\n  };\n\n",
          "after": "   */\n  private checkForTimeTravel = async (currentImageId: string) => {\n    return checkTimeTravelAvailability(currentImageId, () => this.accessToken, hasTimeTravel => { if (String(this.state.imageId) === String(currentImageId)) this.setState({ hasTimeTravel }); });\n  };\n\n"
        }
      ],
      "absentAfterUninstall": [
        "LiveSequenceFrames",
        "LatestFrameDetails",
        "_liveSequenceFrames",
        "hydrateLiveSequence",
        "renderLiveSequenceLine",
        "refreshSequenceMarkerWindow"
      ],
      "requiredOccurrences": [
        {
          "text": "LiveSequenceFrames",
          "count": 4
        },
        {
          "text": "LatestFrameDetails",
          "count": 2
        },
        {
          "text": "_liveSequenceFrames",
          "count": 43
        },
        {
          "text": "hydrateLiveSequence",
          "count": 4
        },
        {
          "text": "renderLiveSequenceLine",
          "count": 3
        },
        {
          "text": "refreshSequenceMarkerWindow",
          "count": 5
        }
      ]
    },
    {
      "file": "src/features/imagery/sequenceCoordinates.ts",
      "blocks": [
        {
          "label": "src/features/imagery/sequenceCoordinates.ts live sequence playback block 1",
          "before": "    const focus = Math.floor(Math.max(0, unique.indexOf(String(dependencies.getSelectedImageId()))) / 50);\n    const batches = Array.from({ length: results.length }, (_, i) => i).sort((a, b) => Math.abs(a - focus) - Math.abs(b - focus));\n    let nextBatch = 0;\n    const workers = new AbortController();\n    const abort = () => workers.abort();\n",
          "after": "    const focus = Math.floor(Math.max(0, unique.indexOf(String(dependencies.getSelectedImageId()))) / 50);\n    const batches = Array.from({ length: results.length }, (_, i) => i).sort((a, b) => Math.abs(a - focus) - Math.abs(b - focus));\n    let nextBatch = 0, loadedCount = 0;\n    const workers = new AbortController();\n    const abort = () => workers.abort();\n"
        },
        {
          "label": "src/features/imagery/sequenceCoordinates.ts live sequence playback block 2",
          "before": "          results[index].push({ id, lon: xy[0], lat: xy[1], ...imageAltitudeFields(value), captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined });\n        }\n        onProgress?.(results[index], index, results.reduce((count, points) => count + (points?.length || 0), 0), unique.length);\n      }\n    };\n",
          "after": "          results[index].push({ id, lon: xy[0], lat: xy[1], ...imageAltitudeFields(value), captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined });\n        }\n        loadedCount += results[index].length;\n        onProgress?.(results[index], index, loadedCount, unique.length);\n      }\n    };\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/imagery/sequenceCacheStore.ts",
      "blocks": [
        {
          "label": "src/features/imagery/sequenceCacheStore.ts live sequence playback block 1",
          "before": "/** Optional persistent sequence coordinates. No tokens, imagery pixels or field notes enter this database. */\nexport class SequenceCacheStore {\n  private opening: Promise<IDBDatabase | undefined> | undefined;\n",
          "after": "/** Optional sequence metadata persistence. Chunked cloning never owns playback state. */\nexport class SequenceCacheStore {\n  private opening: Promise<IDBDatabase | undefined> | undefined;\n"
        },
        {
          "label": "src/features/imagery/sequenceCacheStore.ts live sequence playback block 2",
          "before": "  private scheduled = false;\n  private writing = false;\n  private generation = 0;\n  private factory: () => IDBFactory | undefined;\n  private schedule: (work: () => void) => unknown;\n  constructor(factory: () => IDBFactory | undefined = () => typeof indexedDB === 'undefined' ? undefined : indexedDB,\n    schedule: (work: () => void) => unknown = work => typeof requestIdleCallback === 'function' ? requestIdleCallback(work, { timeout: 2000 }) : setTimeout(work, 32)) {\n    this.factory = factory; this.schedule = schedule;\n  }\n  /** Bound database opening so blocked/denied browser storage cannot stall navigation. */\n  private open(): Promise<IDBDatabase | undefined> {\n    if (this.opening) return this.opening;\n",
          "after": "  private scheduled = false;\n  private writing = false;\n  private writingEntry: { key: string; data: unknown; generation: number } | null = null;\n  private generation = 0;\n  private serial = 0;\n  private readonly chunkSize = 256;\n  constructor(private readonly factory: () => IDBFactory | undefined = () => typeof indexedDB === 'undefined' ? undefined : indexedDB,\n    private readonly schedule: (work: () => void) => unknown = work => typeof requestIdleCallback === 'function' ? requestIdleCallback(work, { timeout: 2000 }) : setTimeout(work, 32)) {}\n  private open(): Promise<IDBDatabase | undefined> {\n    if (this.opening) return this.opening;\n"
        },
        {
          "label": "src/features/imagery/sequenceCacheStore.ts live sequence playback block 3",
          "before": "      const timer = setTimeout(() => finish(), 150);\n      try {\n        const request = factory.open('mly_sequence_coordinates_v1', 1);\n        request.onupgradeneeded = () => { const store = request.result.createObjectStore('sequences', { keyPath: 'key' }); store.createIndex('updated', 'updated'); };\n        request.onerror = request.onblocked = () => finish();\n        request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); this.opening = undefined; }; finish(db); };\n",
          "after": "      const timer = setTimeout(() => finish(), 150);\n      try {\n        const request = factory.open('mly_sequence_coordinates_v1', 2);\n        request.onupgradeneeded = () => {\n          const db = request.result;\n          if (!db.objectStoreNames.contains('sequences')) { const store = db.createObjectStore('sequences', { keyPath: 'key' }); store.createIndex('updated', 'updated'); }\n          if (!db.objectStoreNames.contains('parts')) db.createObjectStore('parts', { keyPath: 'key' });\n        };\n        request.onerror = request.onblocked = () => finish();\n        request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); this.opening = undefined; }; finish(db); };\n"
        },
        {
          "label": "src/features/imagery/sequenceCacheStore.ts live sequence playback block 4",
          "before": "    return this.opening;\n  }\n  /** Read asynchronously; incomplete/invalid records are validated by the sequence downloader. */\n  async read(key: string): Promise<unknown> {\n    if (this.pending.has(key)) return this.pending.get(key);\n    const generation = this.generation, db = await this.open();\n    if (!db || generation !== this.generation) return undefined;\n    return new Promise(resolve => {\n      let settled = false;\n      const finish = (value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); resolve(generation === this.generation ? value : undefined); };\n      const timer = setTimeout(() => finish(), 150);\n      try { const request = db.transaction('sequences', 'readonly').objectStore('sequences').get(key); request.onsuccess = () => finish(request.result?.data); request.onerror = () => finish(); }\n      catch { finish(); }\n    });\n  }\n  /** Coalesce writes and yield until idle. IndexedDB stores structured data without JSON.stringify/setItem. */\n  queue(key: string, data: unknown): void {\n    try { if (!this.factory()) return; } catch { return; }\n",
          "after": "    return this.opening;\n  }\n  /** Legacy v1 records remain readable. New records are committed manifests plus small parts. */\n  async read(key: string): Promise<unknown> {\n    if (this.pending.has(key)) return this.pending.get(key);\n    if (this.writingEntry?.key === key && this.writingEntry.generation === this.generation) return this.writingEntry.data;\n    const generation = this.generation, db = await this.open();\n    if (!db || generation !== this.generation) return undefined;\n    const record = await new Promise<any>(resolve => {\n      let settled = false;\n      const finish = (value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); resolve(value); };\n      const timer = setTimeout(() => finish(), 150);\n      try { const request = db.transaction('sequences', 'readonly').objectStore('sequences').get(key); request.onsuccess = () => finish(request.result); request.onerror = () => finish(); }\n      catch { finish(); }\n    });\n    if (!record || generation !== this.generation) return undefined;\n    if (!Array.isArray(record.parts)) return record.data;\n    return new Promise(resolve => {\n      let settled = false;\n      const finish = (value?: unknown) => { if (settled) return; settled = true; clearTimeout(timer); resolve(generation === this.generation ? value : undefined); };\n      const timer = setTimeout(() => finish(), 500);\n      try {\n        const transaction = db.transaction('parts', 'readonly'), store = transaction.objectStore('parts');\n        const chunks: unknown[][] = new Array(record.parts.length);\n        record.parts.forEach((part: string, i: number) => { const request = store.get(part); request.onsuccess = () => { chunks[i] = request.result?.data; }; request.onerror = () => finish(); });\n        transaction.onerror = transaction.onabort = () => finish();\n        transaction.oncomplete = () => {\n          if (chunks.length !== record.parts.length || chunks.some(chunk => !Array.isArray(chunk))) { finish(); return; }\n          const points: unknown[] = []; for (const chunk of chunks) { if (!chunk) { finish(); return; } points.push(...chunk); }\n          finish(points.length === record.length ? points : undefined);\n        };\n      } catch { finish(); }\n    });\n  }\n  queue(key: string, data: unknown): void {\n    try { if (!this.factory()) return; } catch { return; }\n"
        },
        {
          "label": "src/features/imagery/sequenceCacheStore.ts live sequence playback block 5",
          "before": "  private kick(): void {\n    if (this.scheduled || this.writing || !this.pending.size) return;\n    this.scheduled = true;\n    this.schedule(() => { this.scheduled = false; void this.flush(); });\n  }\n  private async flush(): Promise<void> {\n",
          "after": "  private kick(): void {\n    if (this.scheduled || this.writing || !this.pending.size) return;\n    this.scheduled = true; this.schedule(() => { this.scheduled = false; void this.flush(); });\n  }\n  private idle(): Promise<void> { return new Promise(resolve => { this.schedule(resolve); }); }\n  private transaction(db: IDBDatabase, stores: string[], work: (transaction: IDBTransaction) => void): Promise<void> {\n    return new Promise((resolve, reject) => {\n      try {\n        const transaction = db.transaction(stores, 'readwrite');\n        transaction.oncomplete = () => resolve(); transaction.onerror = transaction.onabort = () => reject(transaction.error || new Error('Sequence cache transaction aborted'));\n        work(transaction);\n      } catch (error) { reject(error); }\n    });\n  }\n  private async flush(): Promise<void> {\n"
        },
        {
          "label": "src/features/imagery/sequenceCacheStore.ts live sequence playback block 6",
          "before": "    this.writing = true;\n    const generation = this.generation, [key, data] = this.pending.entries().next().value!;\n    this.pending.delete(key);\n    try {\n      const db = await this.open(); if (!db || generation !== this.generation) return;\n      await new Promise<void>(resolve => {\n        try {\n          const transaction = db.transaction('sequences', 'readwrite'), store = transaction.objectStore('sequences');\n          transaction.oncomplete = transaction.onerror = transaction.onabort = () => resolve();\n          store.put({ key, data, updated: Date.now() });\n          const count = store.count();\n          count.onsuccess = () => {\n            let extra = count.result - 6; if (extra <= 0) return;\n            const cursor = store.index('updated').openKeyCursor();\n            cursor.onsuccess = () => { const item = cursor.result; if (!item || extra-- <= 0) return; store.delete(item.primaryKey); item.continue(); };\n          };\n        } catch { resolve(); }\n      });\n    } finally { this.writing = false; this.kick(); }\n  }\n  /** Clear owned persistent coordinates and invalidate queued writes; unrelated widget data is untouched. */\n  async clear(): Promise<void> {\n    ++this.generation; this.pending.clear();\n    const db = await this.open(); if (!db) return;\n    try { db.transaction('sequences', 'readwrite').objectStore('sequences').clear(); } catch { /* Storage is optional. */ }\n  }\n}\n",
          "after": "    this.writing = true;\n    const generation = this.generation, [key, data] = this.pending.entries().next().value!;\n    this.pending.delete(key); this.writingEntry = { key, data, generation };\n    const parts: string[] = [];\n    let db: IDBDatabase | undefined, committed = false;\n    const current = () => generation === this.generation && !this.pending.has(key);\n    try {\n      db = await this.open(); if (!db || !current()) return;\n      const run = `${Date.now()}-${++this.serial}-${Math.random().toString(36).slice(2)}`;\n      if (Array.isArray(data) && data.length > this.chunkSize) {\n        for (let offset = 0; offset < data.length; offset += this.chunkSize) {\n          // Each structured clone contains at most 256 coordinates and runs in a separate idle slice.\n          await this.idle(); if (!current()) return;\n          const part = `${key}:${run}:${offset}`; parts.push(part);\n          await this.transaction(db, ['parts'], transaction => { transaction.objectStore('parts').put({ key: part, data: data.slice(offset, offset + this.chunkSize) }); });\n        }\n      }\n      await this.idle(); if (!current()) return;\n      await this.transaction(db, ['sequences', 'parts'], transaction => {\n        const store = transaction.objectStore('sequences'), chunks = transaction.objectStore('parts');\n        // Manifest replacement and old-part removal are atomic; partial writes never become readable.\n        const old = store.get(key); old.onsuccess = () => { for (const part of old.result?.parts || []) chunks.delete(part); };\n        store.put(parts.length ? { key, parts, length: (data as unknown[]).length, updated: Date.now() } : { key, data, updated: Date.now() });\n        const count = store.count(); count.onsuccess = () => {\n          let extra = count.result - 6; if (extra <= 0) return;\n          const cursor = store.index('updated').openCursor(); cursor.onsuccess = () => {\n            const item = cursor.result; if (!item || extra-- <= 0) return;\n            // Do not evict the record currently being committed if timestamps tie.\n            if (item.primaryKey === key) { ++extra; item.continue(); return; }\n            for (const part of item.value.parts || []) chunks.delete(part);\n            item.delete(); item.continue();\n          };\n        };\n      });\n      committed = true;\n    } catch { /* Persistence is optional. RAM and live image tracking remain available. */ }\n    finally {\n      if (db && !committed && parts.length) {\n        try { await this.transaction(db, ['parts'], transaction => { const store = transaction.objectStore('parts'); parts.forEach(part => store.delete(part)); }); } catch { /* Storage may have closed. */ }\n      }\n      this.writingEntry = null; this.writing = false; this.kick();\n    }\n  }\n  async clear(): Promise<void> {\n    ++this.generation; this.pending.clear(); this.writingEntry = null;\n    const db = await this.open(); if (!db) return;\n    try { await this.transaction(db, ['sequences', 'parts'], transaction => { transaction.objectStore('sequences').clear(); transaction.objectStore('parts').clear(); }); } catch { /* Storage is optional. */ }\n  }\n}\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    }
  ],
  "modules": [
    {
      "file": "src/features/imagery/LiveSequenceFrames.ts",
      "content": "import type { SequenceCoordinate } from './sequenceCoordinates';\n\nexport type LiveSequenceFrame = SequenceCoordinate & { sequenceId: string };\nexport interface ViewerFrameImage {\n  id?: string | number;\n  sequenceId?: string | null;\n  originalLngLat?: { lng: number; lat: number } | null;\n  lngLat?: { lng: number; lat: number } | null;\n}\nexport const LIVE_SEQUENCE_LIMITS = { markerCount: 128, markerStep: 32, markerZoom: 16, detailDelay: 300, progressInterval: 200, previewSegments: 32 } as const;\nconst valid = (lon: unknown, lat: unknown): boolean => typeof lon === 'number' && typeof lat === 'number' && Number.isFinite(lon) && Number.isFinite(lat) && Math.abs(lon) <= 180 && Math.abs(lat) <= 90;\n\n/** Viewer identity, partial coordinates and completed route are independent lifetimes.\n * The Mapillary v4 image event exposes originalLngLat and sequenceId. Original\n * coordinates match Graph geometry; computed lngLat is a last-resort fallback.\n */\nexport class LiveSequenceFrames {\n  sequenceId: string | null = null;\n  current: LiveSequenceFrame | null = null;\n  complete: SequenceCoordinate[] | null = null;\n  private known = new Map<string, SequenceCoordinate>();\n  private ordinals = new Map<string, number>();\n  private revision = 0;\n  private pending: AbortController | null = null;\n  constructor(private readonly fetchImage: (id: string, signal: AbortSignal) => Promise<any>) {}\n  begin(sequenceId: string, points: readonly SequenceCoordinate[]): void {\n    this.cancelPending();\n    if (this.sequenceId !== sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; }\n    this.sequenceId = sequenceId; this.current = null; this.remember(sequenceId, points);\n  }\n  remember(sequenceId: string, points: readonly SequenceCoordinate[]): void {\n    if (sequenceId !== this.sequenceId) return;\n    for (const point of points) if (point.id != null && valid(point.lon, point.lat)) this.known.set(String(point.id), point);\n  }\n  finish(sequenceId: string, points: SequenceCoordinate[]): boolean {\n    if (sequenceId !== this.sequenceId) return false;\n    this.remember(sequenceId, points); this.complete = points; this.ordinals.clear();\n    points.forEach((point, i) => this.ordinals.set(String(point.id), i));\n    return true;\n  }\n  find(id: string | null | undefined): SequenceCoordinate | undefined { return id == null ? undefined : this.known.get(String(id)); }\n  points(): SequenceCoordinate[] { return Array.from(this.known.values()); }\n  isCurrent(frame: LiveSequenceFrame): boolean { return this.current === frame; }\n  markerWindow(id: string): { key: number; points: readonly SequenceCoordinate[] } | null {\n    if (!this.complete) return null;\n    const ordinal = this.ordinals.get(id); if (ordinal === undefined) return null;\n    const count = LIVE_SEQUENCE_LIMITS.markerCount, step = LIVE_SEQUENCE_LIMITS.markerStep;\n    const start = Math.max(0, Math.min(this.complete.length - count, Math.floor(ordinal / step) * step - count / 2));\n    return { key: start, points: this.complete.slice(start, start + count) };\n  }\n  async resolve(image: ViewerFrameImage): Promise<LiveSequenceFrame | null> {\n    this.cancelPending(); const revision = this.revision;\n    const id = image?.id == null ? '' : String(image.id); if (!id) return null;\n    let sequenceId = image.sequenceId ? String(image.sequenceId) : null;\n    let point = !sequenceId || sequenceId === this.sequenceId ? this.find(id) : undefined;\n    if (point && !sequenceId) sequenceId = this.sequenceId;\n    // Prefer originalLngLat (Graph geometry), preserving coverage alignment.\n    const location = image.originalLngLat ?? image.lngLat;\n    if (!point && location && valid(location.lng, location.lat)) point = { id, lon: location.lng, lat: location.lat };\n    if (!point || !sequenceId) {\n      const controller = new AbortController(); this.pending = controller;\n      try {\n        const data = await this.fetchImage(id, controller.signal);\n        if (revision !== this.revision || controller.signal.aborted) return null;\n        const xy = data.geometry?.coordinates;\n        if (xy && valid(xy[0], xy[1])) point = { ...(point || {}), id, lon: xy[0], lat: xy[1] };\n        sequenceId = typeof data.sequence === 'string' ? data.sequence : data.sequence?.id || sequenceId;\n      } catch (error) {\n        if (revision !== this.revision || controller.signal.aborted) return null;\n        throw error;\n      } finally { if (this.pending === controller) this.pending = null; }\n    }\n    if (revision !== this.revision || !point || !sequenceId) return null;\n    if (sequenceId !== this.sequenceId) { this.known.clear(); this.ordinals.clear(); this.complete = null; this.sequenceId = sequenceId; }\n    const frame = { ...point, id, sequenceId };\n    this.known.set(id, frame); this.current = frame; return frame;\n  }\n  cancelPending(): void { ++this.revision; this.pending?.abort(); this.pending = null; this.current = null; }\n  clear(): void { this.cancelPending(); this.sequenceId = null; this.current = null; this.complete = null; this.known.clear(); this.ordinals.clear(); }\n}\n\n/** Coalesce secondary UI/network work; map tracking never waits for this queue. */\nexport class LatestFrameDetails {\n  private timer: ReturnType<typeof setTimeout> | null = null;\n  private latest: (() => void) | null = null;\n  queue(work: () => void): void {\n    this.latest = work;\n    if (this.timer !== null) return;\n    this.timer = setTimeout(() => { this.timer = null; const run = this.latest; this.latest = null; run?.(); }, LIVE_SEQUENCE_LIMITS.detailDelay);\n  }\n  clear(): void { if (this.timer !== null) clearTimeout(this.timer); this.timer = null; this.latest = null; }\n}\n\n/** Small route preparation slices, with prompt cancellation between slices. */\nexport function yieldSequenceWork(signal: AbortSignal): Promise<void> {\n  if (signal.aborted) return Promise.reject(new DOMException('Cancelled', 'AbortError'));\n  return new Promise((resolve, reject) => {\n    const abort = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(new DOMException('Cancelled', 'AbortError')); };\n    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 8);\n    signal.addEventListener('abort', abort, { once: true });\n    if (signal.aborted) abort();\n  });\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'live-sequence-playback-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-live-sequence-playback.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Live sequence playback is already uninstalled. No files changed.' : 'Live sequence playback is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'live-sequence-playback', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Live sequence playback ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Current-image tracking is independent of route loading. Full routes are retained; close zoom uses a bounded 128-frame blue-marker window. Persistent coordinates are written in idle-time chunks.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
