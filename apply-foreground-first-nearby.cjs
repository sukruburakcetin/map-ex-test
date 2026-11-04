#!/usr/bin/env node
'use strict';
/**
 * Foreground first Nearby confirmation. Compatible current v6 sources.
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
              "label": "Foreground first Nearby 1",
              "before": "  nearbyImages?: NearbyImage[];\n  nearbyLoading?: boolean;\n  nearbyStripOpen?: boolean;\n  isAnnotationMode: boolean;\n  fieldNotes: FieldNote[];\n  sharedNotesMessage?: string;\n",
              "after": "  nearbyImages?: NearbyImage[];\n  nearbyLoading?: boolean;\n  nearbyStripOpen?: boolean;\n  nearbyCanExpand?: boolean;\n  isAnnotationMode: boolean;\n  fieldNotes: FieldNote[];\n  sharedNotesMessage?: string;\n"
            },
            {
              "label": "Foreground first Nearby 2",
              "before": "  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this.highlightNearbyPin?.(null);\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n      if(this._coneRedrawRaf!=null){cancelAnimationFrame(this._coneRedrawRaf);this._coneRedrawRaf=null;}\n",
              "after": "  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this._nearbyDiscovery?.cancel();\n      this.highlightNearbyPin?.(null);\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n      if(this._coneRedrawRaf!=null){cancelAnimationFrame(this._coneRedrawRaf);this._coneRedrawRaf=null;}\n"
            },
            {
              "label": "Foreground first Nearby 3",
              "before": "      const newId = String(event.image.id);\n      this._detectionAbort?.abort();\n      this._timeTravelAvailability?.cancelUnless(newId);\n      const view = this.state.jimuMapView?.view;\n      if (!view) return;\n      let newImg: LiveSequenceFrame | null;\n",
              "after": "      const newId = String(event.image.id);\n      this._detectionAbort?.abort();\n      this._timeTravelAvailability?.cancelUnless(newId);\n      this._nearbyDiscovery?.cancel();\n      const view = this.state.jimuMapView?.view;\n      if (!view) return;\n      let newImg: LiveSequenceFrame | null;\n"
            },
            {
              "label": "Foreground first Nearby 4",
              "before": "\n\n  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {\n    if(this._sharedStartupImageId&&String(startImageId)!==this._sharedStartupImageId){\n      this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n      (this.state.jimuMapView?.view as any)?.animation?.stop();\n",
              "after": "\n\n  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {\n    this._nearbyDiscovery?.cancel();\n    this.highlightNearbyPin?.(null);\n    if(this._sharedStartupImageId&&String(startImageId)!==this._sharedStartupImageId){\n      this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n      (this.state.jimuMapView?.view as any)?.animation?.stop();\n"
            },
            {
              "label": "Foreground first Nearby 5",
              "before": "    if (clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {\n      this.drawPulsingPoint(clickPoint.lon, clickPoint.lat, [0, 255, 0, 1], startImageId);\n    }\n    this._nearbyDiscovery?.cancel();\n    this.setState({ nearbyLoading: false, isLoading: true, imageryRepresentative: representative && !nearestToClick, sequenceRouteProgress: undefined, sequenceRouteLoading: false, selectionError: undefined, selectionCanRetry: false });\n\n    if (this.state.isElevationProfileActive && !reuseLoadedRoute) this.clearElevationProfile();\n",
              "after": "    if (clickPoint && Number.isFinite(clickPoint.lon) && Number.isFinite(clickPoint.lat)) {\n      this.drawPulsingPoint(clickPoint.lon, clickPoint.lat, [0, 255, 0, 1], startImageId);\n    }\n    this.setState({ nearbyLoading: false, isLoading: true, imageryRepresentative: representative && !nearestToClick, sequenceRouteProgress: undefined, sequenceRouteLoading: false, selectionError: undefined, selectionCanRetry: false });\n\n    if (this.state.isElevationProfileActive && !reuseLoadedRoute) this.clearElevationProfile();\n"
            },
            {
              "label": "Foreground first Nearby 6",
              "before": "    geometry: { type: \"Point\"; coordinates: [number, number] };\n  }) => {\n    if(!this.selectedMapFeatureEnabled())return;\n    this.revealDetectionTools();\n    this._alternateNavigationAbort?.abort();\n    const navigation = new AbortController();\n",
              "after": "    geometry: { type: \"Point\"; coordinates: [number, number] };\n  }) => {\n    if(!this.selectedMapFeatureEnabled())return;\n    this._nearbyDiscovery?.cancel();\n    this.revealDetectionTools();\n    this._alternateNavigationAbort?.abort();\n    const navigation = new AbortController();\n"
            },
            {
              "label": "Foreground first Nearby 7",
              "before": "      background: { ...this._backgroundRequests.stats, limit: this._backgroundRequests.concurrency },\n      routes: sequenceRouteMemoryStats(this.sequenceCoordsCache),\n      nearby: this._sequenceDemand.memoryStats,\n      view: this.state.jimuMapView?.view?.type ?? null,\n      imageTiling: this._viewerImageTiling ?? null,\n      places: { active: !!this.state.placesActive, status: this.state.placesStatus?.kind ?? 'off', ...this._places?.stats },\n",
              "after": "      background: { ...this._backgroundRequests.stats, limit: this._backgroundRequests.concurrency },\n      routes: sequenceRouteMemoryStats(this.sequenceCoordsCache),\n      nearby: this._sequenceDemand.memoryStats,\n      nearbyDiscovery:this._nearbyDiscovery?.stats??null,\n      view: this.state.jimuMapView?.view?.type ?? null,\n      imageTiling: this._viewerImageTiling ?? null,\n      places: { active: !!this.state.placesActive, status: this.state.placesStatus?.kind ?? 'off', ...this._places?.stats },\n"
            },
            {
              "label": "Foreground first Nearby 8",
              "before": "    this.clearSequenceDiagnostics();\n    if (!this.props.config.debugMode || this.props.state === 'CLOSED' || typeof window === 'undefined') return;\n    const registry = (window as any).__mapillarySequencePerformance ??= Object.create(null);\n    const entry = { snapshot: () => this.sequenceDiagnosticsSnapshot(), reset: () => this._sequencePerformance.reset() };\n    registry[this.props.id] = entry; this._sequenceDiagnosticsEntry = entry;\n    if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {\n      this._sequenceLongTaskObserver = new PerformanceObserver(list => {\n",
              "after": "    this.clearSequenceDiagnostics();\n    if (!this.props.config.debugMode || this.props.state === 'CLOSED' || typeof window === 'undefined') return;\n    const registry = (window as any).__mapillarySequencePerformance ??= Object.create(null);\n    const entry = { snapshot: () => this.sequenceDiagnosticsSnapshot(), reset: () => {this._sequencePerformance.reset();this._nearbyDiscovery?.resetStats();} };\n    registry[this.props.id] = entry; this._sequenceDiagnosticsEntry = entry;\n    if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {\n      this._sequenceLongTaskObserver = new PerformanceObserver(list => {\n"
            },
            {
              "label": "Foreground first Nearby 9",
              "before": "  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n\n    if (this._coverageAnalysisCurrent && !this._coverageAnalysisCurrent()) {\n      this.cancelCoverageAnalysis();\n",
              "after": "  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    const nearbyVisible=this.nearbyPanelVisible();\n    const wasNearbyVisible=this._nearbyDemandVisible;this._nearbyDemandVisible=nearbyVisible;\n    if(!nearbyVisible){\n      if(!this.state.nearbyStripOpen||this.state.imageTrayTab==='object'||this.props.visible===false||this.props.state==='CLOSED')this._nearbyPointerInside=false;\n      this._nearbyDiscovery?.cancel();\n    }else if(!wasNearbyVisible||prevState.imageId!==this.state.imageId||prevState.isLoading!==this.state.isLoading)\n      this.refreshNearbyAfterPause(!prevState.nearbyStripOpen||prevState.imageTrayTab==='object');\n\n\n    if (this._coverageAnalysisCurrent && !this._coverageAnalysisCurrent()) {\n      this.cancelCoverageAnalysis();\n"
            },
            {
              "label": "Foreground first Nearby 10",
              "before": "   * @param imageId - ID of the currently active image, excluded from results\n   *                  so the viewer does not show the current image as a \"nearby\" suggestion.\n   */\n  private refreshNearbyAfterPause = () => {\n    const image = this.state.sequenceImages.find((img: { id: string; lat: number; lon: number }) => String(img.id) === this.state.imageId);\n    if (image && this._userPaused) this.fetchNearbyImages(image.lat, image.lon, String(image.id));\n  };\n  private fetchNearbyImages(lat: number, lon: number, imageId: string) {\n    this._nearbyDiscovery ??= new NearbyImageDiscovery({\n      getState: () => this.state,\n      update: patch => this.setState(patch),\n      isPaused: () => this._userPaused,\n      getToken: () => this.accessToken,\n      isInitialLoad: () => this._isInitialImageLoad,\n      markInitialLoadComplete: () => { this._isInitialImageLoad = false; },\n      runBackground: (work, signal) => this.runSequenceBackground(work, signal),\n    });\n    const anchor=this.getCoverageDisplayPosition(String(imageId),lon,lat);\n    this._nearbyDiscovery.schedule(anchor.lat, anchor.lon, imageId);\n  }\n\n  /**\n",
              "after": "   * @param imageId - ID of the currently active image, excluded from results\n   *                  so the viewer does not show the current image as a \"nearby\" suggestion.\n   */\n  private refreshNearbyAfterPause = (immediate=false,expanded=false) => {\n    const image = this._liveSequenceFrames.find(String(this.state.imageId)) || this.state.sequenceImages.find((img: { id: string; lat: number; lon: number }) => String(img.id) === this.state.imageId);\n    if (image && this._userPaused) this.fetchNearbyImages(image.lat, image.lon, String(image.id),immediate,expanded);\n  };\n  private _nearbyDemandVisible=false;\n  private _nearbyPointerInside=false;\n  private nearbyPanelVisible=()=>!!this.state.nearbyStripOpen&&this.state.imageTrayTab!=='object'&&\n    this.props.state!=='CLOSED'&&this.props.visible!==false&&!this.state.isLoading&&this._imageryOpeningRequest==null&&\n    (!this._currentImagePresentation||!!this.state.jimuMapView?.view?.map&&this._currentImagePresentation.owns(this.state.jimuMapView.view.map));\n  private fetchNearbyImages(lat: number, lon: number, imageId: string,immediate=false,expanded=false) {\n    if(!this.nearbyPanelVisible())return;\n    this._nearbyDiscovery ??= new NearbyImageDiscovery({\n      getState: () => this.state,\n      update: patch => this.setState(patch),\n      isPaused: () => this._userPaused,\n      isVisible:()=>this.nearbyPanelVisible(),\n      isInteracting:()=>this._nearbyPointerInside,\n      getToken: () => this.accessToken,\n      isInitialLoad: () => this._isInitialImageLoad,\n      markInitialLoadComplete: () => { this._isInitialImageLoad = false; },\n      runBackground: (work, signal) => this.runSequenceBackground(work, signal),\n    });\n    const anchor=this.getCoverageDisplayPosition(String(imageId),lon,lat);\n    this._nearbyDiscovery.schedule(anchor.lat, anchor.lon, imageId,immediate,expanded);\n  }\n\n  /**\n"
            },
            {
              "label": "Foreground first Nearby 11",
              "before": "  private _nearbySelectionRevision=0;\n  private async selectNearbyImage(img:NearbyImage):Promise<void> {\n    const viewer=this.mapillaryViewer;if(!viewer)return;\n    const request=++this._nearbySelectionRevision;\n    const selection=this._selectionRequestId,view=this.state.jimuMapView?.view;\n    const current=()=>request===this._nearbySelectionRevision&&this.mapillaryViewer===viewer&&this._selectionRequestId===selection&&this.state.jimuMapView?.view===view;\n",
              "after": "  private _nearbySelectionRevision=0;\n  private async selectNearbyImage(img:NearbyImage):Promise<void> {\n    const viewer=this.mapillaryViewer;if(!viewer)return;\n    this._nearbyDiscovery?.cancel();\n    const request=++this._nearbySelectionRevision;\n    const selection=this._selectionRequestId,view=this.state.jimuMapView?.view;\n    const current=()=>request===this._nearbySelectionRevision&&this.mapillaryViewer===viewer&&this._selectionRequestId===selection&&this.state.jimuMapView?.view===view;\n"
            },
            {
              "label": "Foreground first Nearby 12",
              "before": "              <div role=\"tablist\" aria-label={this._t('appImageSources')} style={{ display: \"flex\", gap: 8 }}>\n                {([\"nearby\", \"object\"] as const).filter(tab=>tab==='nearby'||!!this.state.selectedFeatureMetadata).map(tab => <button key={tab} role=\"tab\" aria-selected={(this.state.imageTrayTab || \"nearby\") === tab} onClick={() => {this.highlightNearbyPin(null);if(tab==='object')this.revealDetectionTools();this.setState({ imageTrayTab: tab });}} style={{ background: \"none\", border: 0, color: (this.state.imageTrayTab || \"nearby\") === tab ? \"#8bdbb7\" : \"#bbb\", padding: \"6px\", cursor: \"pointer\" }}>{tab === \"nearby\" ? <OwnedMessage source={\"Nearby ({value0})\"} values={{value0:String((this.state.nearbyImages || []).length)}}/> : <OwnedMessage source={\"Selected object ({value0})\"} values={{value0:String(this.state.alternateImages.length)}}/>}</button>)}\n              </div>\n              <button\n                onClick={() => {this.highlightNearbyPin(null);this.setState({ nearbyStripOpen: false });}}\n                style={{\n",
              "after": "              <div role=\"tablist\" aria-label={this._t('appImageSources')} style={{ display: \"flex\", gap: 8 }}>\n                {([\"nearby\", \"object\"] as const).filter(tab=>tab==='nearby'||!!this.state.selectedFeatureMetadata).map(tab => <button key={tab} role=\"tab\" aria-selected={(this.state.imageTrayTab || \"nearby\") === tab} onClick={() => {this.highlightNearbyPin(null);if(tab==='object')this.revealDetectionTools();this.setState({ imageTrayTab: tab });}} style={{ background: \"none\", border: 0, color: (this.state.imageTrayTab || \"nearby\") === tab ? \"#8bdbb7\" : \"#bbb\", padding: \"6px\", cursor: \"pointer\" }}>{tab === \"nearby\" ? <OwnedMessage source={\"Nearby ({value0})\"} values={{value0:String((this.state.nearbyImages || []).length)}}/> : <OwnedMessage source={\"Selected object ({value0})\"} values={{value0:String(this.state.alternateImages.length)}}/>}</button>)}\n              </div>\n              {this.state.imageTrayTab!=='object'&&this.state.nearbyCanExpand&&<button type=\"button\" disabled={!!this.state.nearbyLoading}\n                title={this._owned('Search a larger sample and show the nearest 20 captures')}\n                onClick={()=>this.refreshNearbyAfterPause(true,true)}\n                style={{fontSize:9,padding:'2px 5px',border:'1px solid #648b73',borderRadius:4,background:'#214233',color:'#e1eee5',cursor:'pointer'}}>{this._owned('Search more')}</button>}\n              <button\n                onClick={() => {this.highlightNearbyPin(null);this.setState({ nearbyStripOpen: false });}}\n                style={{\n"
            },
            {
              "label": "Foreground first Nearby 13",
              "before": "            </div>\n\n            {/* Rows stay mounted while switching tabs, preserving independent scroll positions. */}\n            <div role=\"tabpanel\" aria-label={this._t('appNearbyImages')}\n              style={{\n                display: this.state.imageTrayTab === \"object\" ? \"none\" : \"flex\",\n                flex: \"1 1 0\",\n",
              "after": "            </div>\n\n            {/* Rows stay mounted while switching tabs, preserving independent scroll positions. */}\n            <div role=\"tabpanel\" aria-label={this._t('appNearbyImages')} aria-busy={!!this.state.nearbyLoading}\n              onPointerEnter={event=>{if(event.pointerType==='mouse'||event.pointerType==='pen')this._nearbyPointerInside=true;}}\n              onPointerLeave={()=>{this._nearbyPointerInside=false;this._nearbyDiscovery?.flush();}}\n              style={{\n                display: this.state.imageTrayTab === \"object\" ? \"none\" : \"flex\",\n                flex: \"1 1 0\",\n"
            },
            {
              "label": "Foreground first Nearby 14",
              "before": "                paddingBottom: \"2px\",\n              }}\n            >\n              {(this.state.nearbyImages ?? []).map((img) => {\n                // Use _nearbySelectedId for instant highlight on click,\n                // fall back to imageId so the current sequence image\n",
              "after": "                paddingBottom: \"2px\",\n              }}\n            >\n              {this.state.nearbyLoading&&!this.state.nearbyImages?.length&&<span role=\"status\" style={{fontSize:11,padding:8,color:'#b5ccbf'}}>{this._owned('Loading nearby captures\u2026')}</span>}\n              {(this.state.nearbyImages ?? []).map((img) => {\n                // Use _nearbySelectedId for instant highlight on click,\n                // fall back to imageId so the current sequence image\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/imagery/nearbyDiscovery.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Foreground first Nearby 1",
              "before": "\nexport interface NearbyDiscoveryDependencies {\n  getState: () => { imageId: string | null; nearbyLoading?: boolean };\n  update: (patch: { nearbyLoading?: boolean; nearbyImages?: NearbyImage[] }) => void;\n  isPaused: () => boolean;\n  getToken: () => string;\n  isInitialLoad: () => boolean;\n  markInitialLoadComplete: () => void;\n  runBackground?: <T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal) => Promise<T>;\n}\n\nexport class NearbyImageDiscovery {\n  private timer: ReturnType<typeof setTimeout> | null = null;\n  private controller: AbortController | null = null;\n  constructor(private readonly dependencies: NearbyDiscoveryDependencies) {}\n\n  /**\n   * Schedule idle enrichment, keeping previous thumbnails and rejecting stale image results.\n   * @param lat Anchor latitude in WGS84 decimal degrees.\n   * @param lon Anchor longitude in WGS84 decimal degrees.\n   * @param imageId Active image ID, excluded from nearby suggestions.\n   */\n  schedule(lat: number, lon: number, imageId: string): void {\n    this.controller?.abort(); this.controller = null;\n    if (this.dependencies.getState().nearbyLoading) this.dependencies.update({ nearbyLoading: false });\n    // Cancel previous pending timer, user is still navigating\n    if (this.timer) {\n      clearTimeout(this.timer);\n      this.timer = null;\n    }\n\n    const doFetch = () => {\n      this.timer = null;\n      if (this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId) return;\n      // Cancel any in-flight request from a previous stop\n      this.controller?.abort();\n      const ctrl = new AbortController();\n      this.controller = ctrl;\n\n      // Never clear existing images, keep stale thumbnails visible during fetch\n      this.dependencies.update({ nearbyLoading: true });\n\n      const url = GRAPH_API.nearbyImages(lat, lon, 50, 100) + `&access_token=${this.dependencies.getToken()}`;\n\n      const request = async (signal: AbortSignal) => {\n        if (signal.aborted || ctrl.signal.aborted || this.controller !== ctrl ||\n          this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId)\n          throw new DOMException('Cancelled', 'AbortError');\n        const response = await fetch(url, { signal });\n        if (signal.aborted || ctrl.signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n        if (!response.ok) throw new Error(\"Nearby images unavailable\");\n        const data = await response.json();\n        if (signal.aborted || ctrl.signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n        return data;\n      };\n      const run = this.dependencies.runBackground || ((work: (signal: AbortSignal) => Promise<any>) => work(ctrl.signal));\n      run(request, ctrl.signal)\n        .then((data) => {\n          if (ctrl.signal.aborted || this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId || this.controller !== ctrl) return;\n          const images = nearestNearbyImages(Array.isArray(data.data)?data.data as NearbyImage[]:[],lat,lon,imageId);\n          this.dependencies.update({ nearbyImages: images });\n        })\n        .catch(() => {\n          // Aborted or network error, keep previous images\n        })\n        .finally(() => {\n          if (this.controller !== ctrl) return;\n          this.controller = null;\n          if (!ctrl.signal.aborted) this.dependencies.update({ nearbyLoading: false });\n        });\n    };\n\n    if (this.dependencies.isInitialLoad()) {\n      // First image ever, wait for splash to finish then fetch immediately\n      this.dependencies.markInitialLoadComplete();\n      this.timer = setTimeout(doFetch, TIMING.SPLASH_FADE_MS + 300);\n    } else {\n      // Wait 1500ms after the user stops navigating before fetching\n      this.timer = setTimeout(doFetch, 1500);\n    }\n  }\n\n  /** Cancel owned work on navigation, playback or teardown; leave presentation state to the caller. */\n  cancel(): void {\n    this.cancelRequest();\n    this.cancelTimer();\n  }\n  /** Clear pending idle work while preserving teardown ordering. */\n  cancelTimer(): void {\n    if (this.timer) clearTimeout(this.timer);\n    this.timer = null;\n  }\n\n  /** Abort the current network request without acquiring new resources. */\n  cancelRequest(): void {\n    this.controller?.abort(); this.controller = null;\n  }\n\n}\n",
              "after": "\nexport interface NearbyDiscoveryDependencies {\n  getState: () => { imageId: string | null; nearbyLoading?: boolean };\n  update: (patch: { nearbyLoading?: boolean; nearbyImages?: NearbyImage[]; nearbyCanExpand?: boolean }) => void;\n  isPaused: () => boolean;\n  isVisible?: () => boolean;\n  isInteracting?: () => boolean;\n  now?: () => number;\n  getToken: () => string;\n  isInitialLoad: () => boolean;\n  markInitialLoadComplete: () => void;\n  runBackground?: <T>(work: (signal: AbortSignal) => Promise<T>, signal?: AbortSignal) => Promise<T>;\n}\n\n/** Demand-driven optional enrichment. A small, token-scoped cache never owns\n * foreground image opening or route work. Metadata only; no thumbnail blobs. */\nexport class NearbyImageDiscovery {\n  private timer: ReturnType<typeof setTimeout> | null = null;\n  private controller: AbortController | null = null;\n  private identity='';\n  private pendingApply:(()=>void)|null=null;\n  private cacheToken:string|null=null;\n  private cache=new Map<string,{at:number;limit:number;images:NearbyImage[]}>();\n  private metrics={requests:0,cacheHits:0,cancelledWork:0,responseBytes:0,sizedResponses:0,completedRequests:0,totalRequestMs:0,lastRequestMs:0};\n  constructor(private readonly dependencies: NearbyDiscoveryDependencies) {}\n  private now():number{return this.dependencies.now?.()??Date.now();}\n  get stats(){return {...this.metrics,cachedAreas:this.cache.size,inFlight:!!this.controller,waiting:!!this.timer,waitingForPointer:!!this.pendingApply};}\n  resetStats():void{for(const key of Object.keys(this.metrics) as (keyof typeof this.metrics)[])this.metrics[key]=0;}\n  flush():void{if(this.dependencies.isInteracting?.())return;const apply=this.pendingApply;this.pendingApply=null;apply?.();}\n  private visible():boolean{return this.dependencies.isVisible?.()!==false;}\n\n  /** Explicit panel opening can request immediately; passive frame updates wait\n   * for idle. Expansion is user-requested only, never automatic pagination. */\n  schedule(lat:number,lon:number,imageId:string,immediate=false,expanded=false):void {\n    if(!this.visible()||!this.dependencies.isPaused()){this.cancel();return;}\n    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){this.cancel();return;}\n    const token=this.dependencies.getToken(),limit=expanded?100:40,key=`${lat.toFixed(6)}:${lon.toFixed(6)}`;\n    if(this.cacheToken!==token){this.cache.clear();this.cacheToken=token;}\n    const identity=`${imageId}:${key}:${limit}`;\n    if(identity===this.identity&&(this.timer!==null||this.controller))return;\n    this.cancel();this.identity=identity;\n    const first=this.dependencies.isInitialLoad();if(first)this.dependencies.markInitialLoadComplete();\n    const current=()=>this.identity===identity&&this.dependencies.getState().imageId===imageId&&this.dependencies.getToken()===token&&this.visible()&&this.dependencies.isPaused();\n    const apply=(images:NearbyImage[],candidateLimit:number)=>{\n      const publish=()=>{if(current())this.dependencies.update({nearbyImages:nearestNearbyImages(images,lat,lon,imageId),nearbyLoading:false,nearbyCanExpand:candidateLimit<100&&images.length>=candidateLimit});};\n      if(this.dependencies.isInteracting?.()){this.pendingApply=publish;this.dependencies.update({nearbyLoading:false});}\n      else {this.pendingApply=null;publish();}\n    };\n    const cached=this.cache.get(key);\n    if(cached&&this.now()-cached.at<120000&&cached.limit>=limit&&current()){\n      ++this.metrics.cacheHits;this.cache.delete(key);this.cache.set(key,cached);apply(cached.images,cached.limit);return;\n    }\n    if(cached&&this.now()-cached.at>=120000)this.cache.delete(key);\n    const doFetch=()=>{\n      this.timer=null;if(!current())return;\n      const ctrl=new AbortController();this.controller=ctrl;\n      this.dependencies.update({nearbyLoading:true});\n      const url=GRAPH_API.nearbyImages(lat,lon,50,limit)+`&access_token=${token}`;\n      const request=async(signal:AbortSignal)=>{\n        if(signal.aborted||ctrl.signal.aborted||this.controller!==ctrl||!current())throw new DOMException('Cancelled','AbortError');\n        const start=this.now();++this.metrics.requests;\n        try{\n          const response=await fetch(url,{signal,priority:'low'} as RequestInit & {priority:'low'});\n          if(signal.aborted||ctrl.signal.aborted)throw new DOMException('Cancelled','AbortError');\n          if(!response.ok)throw new Error('Nearby images unavailable');\n          const size=response.headers?.get('content-length');\n          if(size!=null&&Number.isFinite(Number(size))&&Number(size)>=0){this.metrics.responseBytes+=Number(size);++this.metrics.sizedResponses;}\n          const data=await response.json();\n          if(signal.aborted||ctrl.signal.aborted)throw new DOMException('Cancelled','AbortError');\n          return data;\n        }finally{\n          const elapsed=Math.max(0,this.now()-start);this.metrics.lastRequestMs=elapsed;this.metrics.totalRequestMs+=elapsed;++this.metrics.completedRequests;\n        }\n      };\n      const run=this.dependencies.runBackground||((work:(signal:AbortSignal)=>Promise<any>)=>work(ctrl.signal));\n      run(request,ctrl.signal).then(data=>{\n        if(ctrl.signal.aborted||this.controller!==ctrl||!current())return;\n        const images=(Array.isArray(data.data)?data.data as NearbyImage[]:[]).slice(0,limit);\n        this.cache.delete(key);this.cache.set(key,{at:this.now(),limit,images});\n        for(const [cacheKey,entry]of this.cache)if(this.now()-entry.at>=120000)this.cache.delete(cacheKey);\n        while(this.cache.size>12)this.cache.delete(this.cache.keys().next().value!);\n        apply(images,limit);\n      }).catch(()=>{/* Optional failure retains loaded thumbnails. */}).finally(()=>{\n        if(this.controller!==ctrl)return;this.controller=null;\n        if(!ctrl.signal.aborted)this.dependencies.update({nearbyLoading:false});\n      });\n    };\n    if(immediate){doFetch();return;}\n    this.timer=setTimeout(doFetch,first?TIMING.SPLASH_FADE_MS+300:1500);\n  }\n  cancel():void{this.pendingApply=null;this.cancelRequest();this.cancelTimer();if(this.dependencies.getState().nearbyLoading)this.dependencies.update({nearbyLoading:false});}\n  cancelTimer():void{this.pendingApply=null;if(this.timer!==null)clearTimeout(this.timer);this.timer=null;this.identity='';}\n  cancelRequest():void{if(this.controller&&!this.controller.signal.aborted){++this.metrics.cancelledWork;this.controller.abort();}this.controller=null;this.identity='';}\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/nearbyDiscovery.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Foreground first Nearby 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst root=path.join(__dirname,'../src');\nconst nearModule={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/nearbyDiscovery.ts'),'utf8')))(()=>({GRAPH_API:{nearbyImages:(lat,lon)=>`https://example.invalid/nearby?lat=${lat}&lon=${lon}`},TIMING:{SPLASH_FADE_MS:200}}),nearModule,nearModule.exports);\nconst queueModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/BackgroundRequestQueue.ts'),'utf8')))(queueModule,queueModule.exports);\nconst {NearbyImageDiscovery,nearestNearbyImages}=nearModule.exports,{BackgroundRequestQueue}=queueModule.exports;\nconst flush=()=>new Promise(r=>setImmediate(r));\nconst deferred=()=>{let resolve,reject;return{promise:new Promise((a,b)=>{resolve=a;reject=b}),resolve:value=>resolve(value),reject:error=>reject(error)}};\nfunction setup(t,{queue,initial=false}={}){\n const timers=new Map(),delays=[],updates=[],state={imageId:'A',nearbyLoading:false,nearbyImages:[{id:'existing'}]},flags={paused:true,initial};let serial=0;\n const beforeSet=global.setTimeout,beforeClear=global.clearTimeout,beforeFetch=global.fetch;\n global.setTimeout=(work,delay)=>{const id=++serial;timers.set(id,work);delays.push(delay);return id};global.clearTimeout=id=>timers.delete(id);\n t.after(()=>{global.setTimeout=beforeSet;global.clearTimeout=beforeClear;global.fetch=beforeFetch});\n const owner=new NearbyImageDiscovery({getState:()=>state,update:patch=>{updates.push(patch);Object.assign(state,patch)},isPaused:()=>flags.paused,getToken:()=> 'test',isInitialLoad:()=>flags.initial,markInitialLoadComplete:()=>{flags.initial=false},runBackground:queue?(work,signal)=>queue.run(work,signal):undefined});\n const idle=()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(work=>work())};\n return{owner,state,flags,updates,timers,delays,idle};\n}\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst root=path.join(__dirname,'../src');\nconst nearModule={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/nearbyDiscovery.ts'),'utf8')))(()=>({GRAPH_API:{nearbyImages:(lat,lon,radius,limit)=>`https://example.invalid/nearby?lat=${lat}&lon=${lon}&limit=${limit}`},TIMING:{SPLASH_FADE_MS:200}}),nearModule,nearModule.exports);\nconst queueModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/BackgroundRequestQueue.ts'),'utf8')))(queueModule,queueModule.exports);\nconst {NearbyImageDiscovery,nearestNearbyImages}=nearModule.exports,{BackgroundRequestQueue}=queueModule.exports;\nconst flush=()=>new Promise(r=>setImmediate(r));\nconst deferred=()=>{let resolve,reject;return{promise:new Promise((a,b)=>{resolve=a;reject=b}),resolve:value=>resolve(value),reject:error=>reject(error)}};\nfunction setup(t,{queue,initial=false,visible=true}={}){\n const timers=new Map(),delays=[],updates=[],state={imageId:'A',nearbyLoading:false,nearbyImages:[{id:'existing'}]},flags={paused:true,initial,visible,token:'test',now:1000,interacting:false};let serial=0;\n const beforeSet=global.setTimeout,beforeClear=global.clearTimeout,beforeFetch=global.fetch;\n global.setTimeout=(work,delay)=>{const id=++serial;timers.set(id,work);delays.push(delay);return id};global.clearTimeout=id=>timers.delete(id);\n t.after(()=>{global.setTimeout=beforeSet;global.clearTimeout=beforeClear;global.fetch=beforeFetch});\n const owner=new NearbyImageDiscovery({getState:()=>state,update:patch=>{updates.push(patch);Object.assign(state,patch)},isPaused:()=>flags.paused,isVisible:()=>flags.visible,isInteracting:()=>flags.interacting,now:()=>flags.now,getToken:()=>flags.token,isInitialLoad:()=>flags.initial,markInitialLoadComplete:()=>{flags.initial=false},runBackground:queue?(work,signal)=>queue.run(work,signal):undefined});\n const idle=()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(work=>work())};\n return{owner,state,flags,updates,timers,delays,idle};\n}\n"
            },
            {
              "label": "Foreground first Nearby 2",
              "before": "test('Nearby distance sorting handles the antimeridian',()=>{\n const batch=[{id:'far',geometry:{coordinates:[179,0]}},{id:'across',geometry:{coordinates:[-179.999,0]}}];assert.equal(nearestNearbyImages(batch,0,179.999,'main')[0].id,'across');\n});\n",
              "after": "test('Nearby distance sorting handles the antimeridian',()=>{\n const batch=[{id:'far',geometry:{coordinates:[179,0]}},{id:'across',geometry:{coordinates:[-179.999,0]}}];assert.equal(nearestNearbyImages(batch,0,179.999,'main')[0].id,'across');\n});\n\n\ntest('closed Nearby panel schedules no optional work',async t=>{const x=setup(t,{visible:false});let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:async()=>({data:[]})}};x.owner.schedule(41,29,'A',true);assert.equal(x.timers.size,0);await flush();assert.equal(calls,0);assert.equal(x.owner.stats.requests,0)});\ntest('repeat demand shares one request and reopening reuses cached metadata',async t=>{const x=setup(t),body=deferred();let calls=0;global.fetch=async()=>{calls++;return{ok:true,json:()=>body.promise}};x.owner.schedule(41,29,'A',true);x.owner.schedule(41,29,'A',true);assert.equal(calls,1);body.resolve({data:[{id:'B'}]});await flush();x.owner.cancel();x.owner.schedule(41,29,'A',true);await flush();assert.equal(calls,1);assert.equal(x.owner.stats.cacheHits,1);assert.deepEqual(x.state.nearbyImages,[{id:'B'}])});\ntest('first demand requests40; only explicit expansion requests100 and reveals at most20',async t=>{const x=setup(t),limits=[];global.fetch=async url=>{const limit=Number(new URL(url).searchParams.get('limit'));limits.push(limit);return{ok:true,json:async()=>({data:Array.from({length:limit},(_,i)=>({id:'capture-'+i,geometry:{coordinates:[29+i*.00001,41]}}))})}};x.owner.schedule(41,29,'A',true);await flush();assert.deepEqual(limits,[40]);assert.equal(x.state.nearbyCanExpand,true);assert.equal(x.state.nearbyImages.length,20);x.owner.schedule(41,29,'A',true,true);await flush();assert.deepEqual(limits,[40,100]);assert.equal(x.state.nearbyCanExpand,false);assert.equal(x.state.nearbyImages.length,20);x.owner.schedule(41,29,'A',true);await flush();assert.deepEqual(limits,[40,100]);assert.equal(x.owner.stats.cacheHits,1)});\ntest('cache expires and credentials do not share cached results',async t=>{const x=setup(t);let calls=0;global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'capture-'+(++calls)}]})});x.owner.schedule(41,29,'A',true);await flush();x.flags.now+=120001;x.owner.schedule(41,29,'A',true);await flush();assert.equal(calls,2);x.flags.token='different-secret';x.owner.schedule(41,29,'A',true);await flush();assert.equal(calls,3);assert.equal(x.owner.stats.cachedAreas,1);assert(!JSON.stringify(x.owner.stats).includes('different-secret'))});\ntest('cache stays bounded to12 areas',async t=>{const x=setup(t);global.fetch=async()=>({ok:true,json:async()=>({data:[]})});for(let i=0;i<15;i++){x.owner.schedule(41,29+i*.001,'A',true);await flush();}assert.equal(x.owner.stats.cachedAreas,12)});\ntest('closing demand aborts transport and late responses never reorder the loaded strip',async t=>{const x=setup(t),body=deferred();let signal;global.fetch=async(url,options)=>{signal=options.signal;return{ok:true,json:()=>body.promise}};x.owner.schedule(41,29,'A',true);x.flags.visible=false;x.owner.cancel();assert.equal(signal.aborted,true);assert.equal(x.state.nearbyLoading,false);body.resolve({data:[{id:'late'}]});await flush();assert.deepEqual(x.state.nearbyImages,[{id:'existing'}]);assert.equal(x.owner.stats.cachedAreas,0)});\ntest('local metrics measure request/JSON time and reported bytes without storing identities',async t=>{const x=setup(t);global.fetch=async()=>{x.flags.now+=10;return{ok:true,headers:{get:()=> '2048'},json:async()=>{x.flags.now+=15;return{data:[]}}}};x.owner.schedule(41,29,'A',true);await flush();const stats=x.owner.stats;assert.equal(stats.requests,1);assert.equal(stats.lastRequestMs,25);assert.equal(stats.responseBytes,2048);assert.equal(stats.sizedResponses,1);x.owner.resetStats();assert.equal(x.owner.stats.requests,0);assert.equal(x.owner.stats.cachedAreas,1)});\n\n\ntest('completed results do not move thumbnails under a hovering pointer',async t=>{const x=setup(t);x.flags.interacting=true;global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'new'}]})});x.owner.schedule(41,29,'A',true);await flush();assert.deepEqual(x.state.nearbyImages,[{id:'existing'}]);assert.equal(x.state.nearbyLoading,false);x.flags.interacting=false;x.owner.flush();assert.deepEqual(x.state.nearbyImages,[{id:'new'}])});\ntest('cancelled deferred results cannot replace a new image list',async t=>{const x=setup(t);x.flags.interacting=true;global.fetch=async()=>({ok:true,json:async()=>({data:[{id:'old'}]})});x.owner.schedule(41,29,'A',true);await flush();x.owner.cancel();x.state.imageId='B';x.flags.interacting=false;x.owner.flush();assert.deepEqual(x.state.nearbyImages,[{id:'existing'}])});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/nearbyForegroundRuntime.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),member=name=>widget.members.find(n=>n.name?.getText(sf)===name),compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;\nconst update=member('componentDidUpdate').body.statements,prefix=update.slice(0,update.findIndex(node=>node.getText(sf).startsWith('if (this._coverageAnalysisCurrent'))).map(node=>node.getText(sf)).join('\\n');\nclass Discovery{constructor(deps){this.deps=deps;this.calls=[];this.cancelled=0;}schedule(...args){this.calls.push(args)}cancel(){this.cancelled++}}\nconst Harness=new Function('NearbyImageDiscovery',compile('class Harness{'+['_nearbyDemandVisible','_nearbyPointerInside','nearbyPanelVisible','refreshNearbyAfterPause','fetchNearbyImages'].map(name=>member(name).getText(sf)).join('\\n')+'\\n updateDemand(prevState){'+prefix+'}};return Harness;'))(Discovery);\nfunction setup(){const w=new Harness();w.props={state:'OPENED'};w.state={imageId:'A',sequenceImages:[],nearbyStripOpen:false,imageTrayTab:'nearby',isLoading:false};w._userPaused=true;w._imageryOpeningRequest=null;w._liveSequenceFrames={find:()=>({id:'A',lat:41,lon:29})};w.getCoverageDisplayPosition=(id,lon,lat)=>({lon,lat});w.setState=patch=>Object.assign(w.state,patch);return w}\ntest('closed panel creates no Nearby transport owner; explicit open uses immediate demand',()=>{const w=setup();w.fetchNearbyImages(41,29,'A');assert.equal(w._nearbyDiscovery,undefined);const before={...w.state};w.state.nearbyStripOpen=true;w.updateDemand(before);assert.equal(w._nearbyDiscovery.calls.length,1);assert.equal(w._nearbyDiscovery.calls[0][3],true);w.updateDemand({...w.state});assert.equal(w._nearbyDiscovery.calls.length,1)});\ntest('foreground busy state cancels Nearby and readiness resumes with idle priority, not a new immediate request',()=>{const w=setup(),before={...w.state};w.state.nearbyStripOpen=true;w.updateDemand(before);w._nearbyPointerInside=true;const opened={...w.state};w.state.isLoading=true;w._imageryOpeningRequest=3;w.updateDemand(opened);assert(w._nearbyDiscovery.cancelled>0);assert.equal(w._nearbyPointerInside,true);let previous={...w.state};w.state.isLoading=false;w.updateDemand(previous);assert.equal(w._nearbyDiscovery.calls.length,1);previous={...w.state};w._imageryOpeningRequest=null;w.updateDemand(previous);assert.equal(w._nearbyDiscovery.calls.length,2);assert.equal(w._nearbyDiscovery.calls[1][3],false)});\ntest('object-tab or closed widget suppresses Nearby; larger100 search requires explicit request',()=>{const w=setup();w.state.nearbyStripOpen=true;w.state.imageTrayTab='object';w.fetchNearbyImages(41,29,'A');assert.equal(w._nearbyDiscovery,undefined);w.state.imageTrayTab='nearby';w.refreshNearbyAfterPause(true,true);assert.equal(w._nearbyDiscovery.calls[0][4],true);w.props.state='CLOSED';w.fetchNearbyImages(41,29,'A');assert.equal(w._nearbyDiscovery.calls.length,1)});\ntest('real sequence opening cancels Nearby before reuse checks, state work or SDK dispatch',()=>{const statements=member('loadSequenceById').body.statements;assert.equal(statements[0].getText(sf),'this._nearbyDiscovery?.cancel();');const run=new Function(compile('return function(){'+statements.slice(0,2).map(node=>node.getText(sf)).join('\\n')+'}'))(),calls=[];run.call({_nearbyDiscovery:{cancel:()=>calls.push('cancel')},highlightNearbyPin:()=>calls.push('clear')});assert.deepEqual(calls,['cancel','clear'])});\n\ntest('retired presentation owner cannot restart Nearby enrichment',()=>{const w=setup();w.state.nearbyStripOpen=true;w.state.jimuMapView={view:{map:{}}};w._currentImagePresentation={owns:()=>false};w.fetchNearbyImages(41,29,'A',true);assert.equal(w._nearbyDiscovery,undefined)});\n"
    },
    {
      "file": "tests/nearbyDemand.browser.cjs",
      "content": "/** Real extracted runtime JSX, independent of live SDK/network. */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let tray;function visit(node){if(ts.isJsxElement(node)&&node.openingElement.attributes.properties.some(p=>p.name?.text==='className'&&p.initializer?.text==='mapillary-image-tray'))tray=node;ts.forEachChild(node,visit)}visit(sf);assert(tray);const code=ts.transpileModule('return function(){return '+tray.getText(sf)+'}',{compilerOptions:{jsx:ts.JsxEmit.React,jsxFactory:'React.createElement',target:ts.ScriptTarget.ES2020}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [240,393,900]){const page=await browser.newPage({viewport:{width:Math.max(width,393),height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<div id=\"root\" style=\"position:relative;height:300px;width:'+width+'px;background:#314c3c\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(code=>{const OwnedMessage=({source,values={}})=>React.createElement('span',null,source.replace(/\\{(\\w+)\\}/g,(_,k)=>values[k]??'')),render=new Function('React','OwnedMessage',code)(React,OwnedMessage),pixel='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';window.calls=[];window.w={state:{nearbyImages:[{id:'A',geometry:{coordinates:[1,2]},captured_at:1,thumb_256_url:pixel}],alternateImages:[],nearbyCanExpand:true,imageTrayTab:'nearby',nearbyLoading:false,nearbyStripOpen:true,selectedFeatureMetadata:{id:'object'}},_t:key=>key,_owned:text=>text,highlightNearbyPin(){},revealDetectionTools(){},refreshNearbyAfterPause:(...args)=>calls.push(args),_nearbyDiscovery:{flush:()=>calls.push('flush')},setState(patch){Object.assign(this.state,patch);root.render(render.call(this))}};window.root=ReactDOM.createRoot(document.getElementById('root'));root.render(render.call(w));},code);\n await page.getByRole('button',{name:'Search more',exact:true}).waitFor();await page.getByRole('button',{name:'Search more',exact:true}).click();assert.deepEqual(await page.evaluate(()=>calls.filter(Array.isArray)),[[true,true]]);checks++;\n const list=page.getByRole('tabpanel',{name:'appNearbyImages',exact:true});await list.hover();assert.equal(await page.evaluate(()=>w._nearbyPointerInside),true);await page.mouse.move(0,0);assert.equal(await page.evaluate(()=>w._nearbyPointerInside),false);assert(await page.evaluate(()=>calls.includes('flush')));checks++;\n await page.evaluate(()=>w.setState({nearbyLoading:true,nearbyImages:[]}));await page.getByRole('status').filter({hasText:'Loading nearby captures\u2026'}).waitFor();assert.equal(await page.getByRole('button',{name:'Search more',exact:true}).isDisabled(),true);checks++;\n assert.equal(await page.locator('.mapillary-image-tray').evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);assert.deepEqual(errors,[]);checks++;await page.close();}console.log(checks+' Nearby tray Chromium checks passed at240,393 and900px.');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'foreground-first-nearby-';

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
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'foreground-first-nearby' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-foreground-first-nearby.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Foreground first Nearby confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'foreground-first-nearby', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Foreground first Nearby confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
