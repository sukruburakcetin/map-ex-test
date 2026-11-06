#!/usr/bin/env node
'use strict';
/**
 * Places imagery cache. Compatible current v6 sources.
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
              "label": "Places imagery cache 1",
              "before": "import { enterprisePopupContent } from '../i18n/enterprisePopup';\nimport { englishPresentation } from '../i18n/PresentationText';\nimport type { LocaleValue } from '../i18n/WidgetLocale';\nimport type { MessageKey } from '../i18n/messages';\nimport { en } from '../i18n/messages';\nimport { message } from '../i18n/core';\nimport { LocaleContent, WidgetLocaleProvider } from '../i18n/WidgetLocale';\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { placeNoteDescription } from '../features/places/placeNote';\nimport type { PlaceNoteDestination, ExternalContributionSeed } from '../features/places/placeNote';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\n",
              "after": "import { enterprisePopupContent } from '../i18n/enterprisePopup';\nimport { englishPresentation } from '../i18n/PresentationText';\nimport type { LocaleValue } from '../i18n/WidgetLocale';\nimport type { MessageKey } from '../i18n/messages';\nimport { en } from '../i18n/messages';\nimport { message } from '../i18n/core';\nimport { LocaleContent, WidgetLocaleProvider } from '../i18n/WidgetLocale';\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { PlaceImageryCache } from '../features/places/PlaceImageryCache';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { placeNoteDescription } from '../features/places/placeNote';\nimport type { PlaceNoteDestination, ExternalContributionSeed } from '../features/places/placeNote';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\n"
            },
            {
              "label": "Places imagery cache 2",
              "before": "  private _cancelObjectsFetch: boolean = false;\n  private _isInitialImageLoad = true;\n\n  // Layers\n  private accessToken: string = \"\";\n  private _places: ArcGISPlaces | null = null;\n  private _placesView: __esri.MapView | __esri.SceneView | null = null;\n  private _placesUrl = '';\n  private _placesExploreAbort: AbortController | null = null;\n  private placesPauseReason = (): string => {\n    if (this.props.state === 'CLOSED') return this._owned(\"Open the widget to load nearby places.\");\n    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return this._owned(\"Return to this tab to load nearby places.\");\n    if (this.state.isFullscreen) return this._owned(\"Return to the main map to load nearby places.\");\n    if (this.state.isLoading || this._imageryOpeningRequest != null) return this._owned(\"Places will update after the image finishes loading.\");\n    if (this._userPaused === false) return this._owned(\"Pause image playback to update nearby places.\");\n    if (this._placesExploreAbort && !this._placesExploreAbort.signal.aborted) return this._owned(\"Finding imagery near the selected place\u2026\");\n    return '';\n  };\n  private placesBusy = () => !!this.placesPauseReason();\n  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n      this._places?.dispose(); this._places = null; this._placesView = null; this._placesUrl = '';\n      if (this.state.selectedPlace || this.state.placesList?.length) this.setState({ selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null });\n      return;\n    }\n    if (this._places && this._placesUrl !== url) { this._places.dispose(); this._places = null; this.setState({ selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null }); }\n    if (this._places && this._placesView !== view) { this._placesView = view; this._places.rebindView(); }\n    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, presentation:this._presentation, modules: this.ArcGISModules,\n",
              "after": "  private _cancelObjectsFetch: boolean = false;\n  private _isInitialImageLoad = true;\n\n  // Layers\n  private accessToken: string = \"\";\n  private _places: ArcGISPlaces | null = null;\n  private _placesView: __esri.MapView | __esri.SceneView | null = null;\n  private _placesUrl = '';\n  private _placesImageryCache:PlaceImageryCache|null=null;\n  private _placesExploreAbort: AbortController | null = null;\n  private placesPauseReason = (): string => {\n    if (this.props.state === 'CLOSED') return this._owned(\"Open the widget to load nearby places.\");\n    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return this._owned(\"Return to this tab to load nearby places.\");\n    if (this.state.isFullscreen) return this._owned(\"Return to the main map to load nearby places.\");\n    if (this.state.isLoading || this._imageryOpeningRequest != null) return this._owned(\"Places will update after the image finishes loading.\");\n    if (this._userPaused === false) return this._owned(\"Pause image playback to update nearby places.\");\n    if (this._placesExploreAbort && !this._placesExploreAbort.signal.aborted) return this._owned(\"Finding imagery near the selected place\u2026\");\n    return '';\n  };\n  private placesBusy = () => !!this.placesPauseReason();\n  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n      this._placesImageryCache?.clear();this._places?.dispose(); this._places = null; this._placesView = null; this._placesUrl = '';\n      if (this.state.selectedPlace || this.state.placesList?.length) this.setState({ selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null });\n      return;\n    }\n    if (this._places && this._placesUrl !== url) { this._places.dispose(); this._places = null; this.setState({ selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null }); }\n    if (this._places && this._placesView !== view) { this._placesView = view; this._places.rebindView(); }\n    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, presentation:this._presentation, modules: this.ArcGISModules,\n"
            },
            {
              "label": "Places imagery cache 3",
              "before": "  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });\n    const timeout = setTimeout(abort, 12000);\n    const request = this._selectionRequestId;\n    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry,compass_angle,computed_compass_angle,is_pano,captured_at&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      return rankPlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n      if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); }\n    }\n  }\n  private async openPlaceImagery(image: PlaceImagery) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n",
              "after": "  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });\n    const timeout = setTimeout(abort, 12000);\n    const request = this._selectionRequestId;\n    const current = () => !controller.signal.aborted && !view.destroyed && this._placesExploreAbort===controller && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const cache=this._placesImageryCache||(this._placesImageryCache=new PlaceImageryCache());\n      cache.scope(view,this.accessToken,this.props?.config?.placesServiceUrl||'');\n      const cached=cache.get(place,radius);\n      if(cached!==undefined){if(!current())throw new DOMException('Cancelled','AbortError');return cached;}\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry,compass_angle,computed_compass_angle,is_pano,captured_at&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      const images=rankPlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n      cache.put(place,radius,images);return images;\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n      if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); }\n    }\n  }\n  private async openPlaceImagery(image: PlaceImagery) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n"
            },
            {
              "label": "Places imagery cache 4",
              "before": "  }\n\n  // Cleanup lifecycle\n  // - Ensures all intervals, observers, and event listeners are removed\n  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._coverageHoverResume?.dispose(); this._coverageHoverResume = null; this._coverageHoverHandler = null;\n    this._presentationHandle?.remove(); this._presentationHandle=null;\n    this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null;\n    document.removeEventListener('visibilitychange', this._sequenceVisibilityChange);\n    this._hoverTimingAbort?.abort();\n    this.clearSequenceDiagnostics();\n    this._sequencePerformance.dispose();\n    if (this._nearbyFramesHintTimer !== null) clearTimeout(this._nearbyFramesHintTimer);\n    this._nearbyFramesHintTimer = null;\n    this._sceneTerrain?.dispose(); this._sceneTerrain = null;\n",
              "after": "  }\n\n  // Cleanup lifecycle\n  // - Ensures all intervals, observers, and event listeners are removed\n  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._coverageHoverResume?.dispose(); this._coverageHoverResume = null; this._coverageHoverHandler = null;\n    this._presentationHandle?.remove(); this._presentationHandle=null;\n    this._placesImageryCache?.clear();this._placesImageryCache=null;\n    this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null;\n    document.removeEventListener('visibilitychange', this._sequenceVisibilityChange);\n    this._hoverTimingAbort?.abort();\n    this.clearSequenceDiagnostics();\n    this._sequencePerformance.dispose();\n    if (this._nearbyFramesHintTimer !== null) clearTimeout(this._nearbyFramesHintTimer);\n    this._nearbyFramesHintTimer = null;\n    this._sceneTerrain?.dispose(); this._sceneTerrain = null;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/overturePlaces.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Places imagery cache 1",
              "before": " try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve([]);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search within 250 m');assert.equal(navigations,0);\n const emptyWide=button.onclick();assert.equal(calls[1].radius,250);calls[1].resolve([]);await emptyWide;assert.equal(calls.length,2);assert.equal(button.textContent,'Search again \u00b7 within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[2].radius,250);calls[2].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search \u00b7 within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[3].signal.aborted);calls[3].resolve([{id:'image',distance:30}]);await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','rankPlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.rankPlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate[0].id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert(url.includes('captured_at'));assert.equal(w._placesExploreAbort,null);\n w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\ntest('heading ranking prefers facing images over closer away/unknown images and wraps north correctly',()=>{\n const place={lon:0,lat:0},image=(id,metres,heading,extra={})=>({id,sequence:'s',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,...extra});\n let chosen=nearby.choosePlaceImagery(place,[image('away',5,180),image('unknown',6,null),image('facing',50,0)],75,distance);assert.equal(chosen.id,'facing');assert.equal(chosen.direction,'facing');assert(chosen.angle<.001);\n chosen=nearby.choosePlaceImagery(place,[image('north-wrap',30,359),image('side',5,90)],75,distance);assert.equal(chosen.id,'north-wrap');assert.equal(chosen.angle,1);\n assert.equal(nearby.choosePlaceImagery(place,[image('unknown',10,null)],75,distance).direction,'unknown');assert.equal(nearby.choosePlaceImagery(place,[image('bad',10,'0')],75,distance).direction,'unknown');\n assert.equal(nearby.choosePlaceImagery(place,[image('coincident',0,0)],75,distance).direction,'unknown');\n assert.equal(nearby.choosePlaceImagery(place,[image('side',10,90)],75,distance).direction,'sideways');assert.equal(nearby.choosePlaceImagery(place,[image('away',10,180)],75,distance).direction,'away');\n",
              "after": " try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve([]);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search within 250 m');assert.equal(navigations,0);\n const emptyWide=button.onclick();assert.equal(calls[1].radius,250);calls[1].resolve([]);await emptyWide;assert.equal(calls.length,2);assert.equal(button.textContent,'Search again \u00b7 within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[2].radius,250);calls[2].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search \u00b7 within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[3].signal.aborted);calls[3].resolve([{id:'image',distance:30}]);await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('PlaceImageryCache','placeImageryBbox','rankPlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(load('PlaceImageryCache').PlaceImageryCache,nearby.placeImageryBbox,nearby.rankPlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate[0].id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert(url.includes('captured_at'));assert.equal(w._placesExploreAbort,null);\n w._placesImageryCache.clear();w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\ntest('heading ranking prefers facing images over closer away/unknown images and wraps north correctly',()=>{\n const place={lon:0,lat:0},image=(id,metres,heading,extra={})=>({id,sequence:'s',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,...extra});\n let chosen=nearby.choosePlaceImagery(place,[image('away',5,180),image('unknown',6,null),image('facing',50,0)],75,distance);assert.equal(chosen.id,'facing');assert.equal(chosen.direction,'facing');assert(chosen.angle<.001);\n chosen=nearby.choosePlaceImagery(place,[image('north-wrap',30,359),image('side',5,90)],75,distance);assert.equal(chosen.id,'north-wrap');assert.equal(chosen.angle,1);\n assert.equal(nearby.choosePlaceImagery(place,[image('unknown',10,null)],75,distance).direction,'unknown');assert.equal(nearby.choosePlaceImagery(place,[image('bad',10,'0')],75,distance).direction,'unknown');\n assert.equal(nearby.choosePlaceImagery(place,[image('coincident',0,0)],75,distance).direction,'unknown');\n assert.equal(nearby.choosePlaceImagery(place,[image('side',10,90)],75,distance).direction,'sideways');assert.equal(nearby.choosePlaceImagery(place,[image('away',10,180)],75,distance).direction,'away');\n"
            },
            {
              "label": "Places imagery cache 2",
              "before": " const expected=nearby.rankPlaceImagery(place,rows,75,distance).map(i=>i.id);assert.deepEqual(nearby.rankPlaceImagery(place,[...rows].reverse(),75,distance).map(i=>i.id),expected);\n});\ntest('suggestion metadata is distance-first, compact and uses locale number formatting',()=>{\n const base=load('src/i18n/PresentationText.ts').englishPresentation;\n const l10n={...base,number:value=>'n'+value};\n const text=nearby.placeImageryChoiceMeta({distance:24.2,capturedAt:1735689600000},l10n);\n assert.equal(text,'About n25 m away \u00b7 Captured Jan 2025');assert(!text.includes('Jan 1,'));\n});\n",
              "after": " const expected=nearby.rankPlaceImagery(place,rows,75,distance).map(i=>i.id);assert.deepEqual(nearby.rankPlaceImagery(place,[...rows].reverse(),75,distance).map(i=>i.id),expected);\n});\ntest('suggestion metadata is distance-first, compact and uses locale number formatting',()=>{\n const base=load('src/i18n/PresentationText.ts').englishPresentation;\n const l10n={...base,number:value=>'n'+value};\n const text=nearby.placeImageryChoiceMeta({distance:24.2,capturedAt:1735689600000},l10n);\n assert.equal(text,'About n25 m away \u00b7 Captured Jan 2025');assert(!text.includes('Jan 1,'));\n});\ntest('imagery cache expires results and empty searches independently and returns isolated copies',()=>{\n const {PlaceImageryCache}=load('PlaceImageryCache');let now=0;const cache=new PlaceImageryCache(()=>now),place={id:'p',lon:0,lat:0,release:'r'},image={id:'i',sequence:'s',distance:10,lon:0,lat:0,radius:75};cache.scope({},'credential','service');cache.put(place,75,[image]);image.id='changed';assert.equal(cache.get(place,75)[0].id,'i');const returned=cache.get(place,75);returned[0].id='mutated';assert.equal(cache.get(place,75)[0].id,'i');assert.equal(cache.get(place,250),undefined);assert.equal(cache.get({...place,lon:1},75),undefined);assert.equal(cache.get({...place,release:'new'},75),undefined);\n cache.put(place,250,[]);now=20000;assert.equal(cache.get(place,250),undefined);assert.equal(cache.get(place,75)[0].id,'i');now=120000;assert.equal(cache.get(place,75),undefined);assert.equal(cache.stats.entries,0);assert.equal(cache.stats.bytes,0);\n});\ntest('imagery cache bounds memory with LRU eviction and clears on map, service or credential changes',()=>{\n const {PlaceImageryCache}=load('PlaceImageryCache'),cache=new PlaceImageryCache(()=>0),view={},place={id:'p',lon:0,lat:0,release:''};cache.scope(view,'a','s');for(let i=0;i<12;i++)cache.put({...place,id:String(i)},75,[]);cache.get({...place,id:'0'},75);cache.put({...place,id:'12'},75,[]);assert.equal(cache.stats.entries,12);assert.deepEqual(cache.get({...place,id:'0'},75),[]);assert.equal(cache.get({...place,id:'1'},75),undefined);\n cache.put(place,75,[{id:'x'.repeat(40000)}]);assert.equal(cache.get(place,75),undefined);assert(cache.stats.bytes<=65536);\n cache.scope(view,'a','s');assert.equal(cache.stats.entries,12);cache.scope(view,'b','s');assert.equal(cache.stats.entries,0);cache.put(place,75,[]);cache.scope(view,'b','other');assert.equal(cache.stats.entries,0);cache.put(place,75,[]);cache.scope({},'b','other');assert.equal(cache.stats.entries,0);cache.put(place,75,[]);cache.clear();assert.equal(cache.stats.entries,0);\n});\ntest('actual widget reuses successful searches without fetching and does not cache failed or stale work',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('PlaceImageryCache','placeImageryBbox','rankPlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(load('PlaceImageryCache').PlaceImageryCache,nearby.placeImageryBbox,nearby.rankPlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false},place={id:'p',lon:0,lat:0,release:''};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='a';let calls=0;w.fetchMapillaryJson=async()=>{calls++;return{data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};\n await w.explorePlace(place,75,new AbortController().signal);await w.explorePlace(place,75,new AbortController().signal);assert.equal(calls,1);await w.explorePlace(place,250,new AbortController().signal);assert.equal(calls,2);w.accessToken='b';await w.explorePlace(place,75,new AbortController().signal);assert.equal(calls,3);\n w._placesImageryCache.clear();w.fetchMapillaryJson=async()=>{calls++;throw Error('offline');};await assert.rejects(w.explorePlace(place,75,new AbortController().signal),/offline/);assert.equal(w._placesImageryCache.stats.entries,0);\n let resolve;w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const abort=new AbortController(),pending=w.explorePlace(place,75,abort.signal);abort.abort();resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesImageryCache.stats.entries,0);assert.equal(w._placesExploreAbort,null);\n const pendingDestroyed=w.explorePlace(place,75,new AbortController().signal);view.destroyed=true;resolve({data:[]});await assert.rejects(pendingDestroyed,{name:'AbortError'});assert.equal(w._placesImageryCache.stats.entries,0);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/PlaceImageryCache.ts",
      "content": "import type { Place } from './placesModel';\nimport type { PlaceImagery } from './nearbyPlaceImagery';\n/** Per-widget, memory-only LRU. No timers, persistence, requests or shared pending promises. */\nexport class PlaceImageryCache {\n private entries=new Map<string,{images:PlaceImagery[];expires:number;bytes:number}>();\n private view:object|null=null;\n private credential='';\n private service='';\n private bytes=0;\n constructor(private readonly now:()=>number=()=>Date.now()){}\n scope(view:object,credential:string,service:string):void {\n  if(view!==this.view||credential!==this.credential||service!==this.service){this.clear();this.view=view;this.credential=credential;this.service=service;}\n }\n private key(place:Pick<Place,'id'|'lon'|'lat'|'release'>,radius:number):string {return JSON.stringify([place.id,place.lon,place.lat,place.release,radius]);}\n private remove(key:string):void {const entry=this.entries.get(key);if(entry)this.bytes-=entry.bytes;this.entries.delete(key);}\n private prune():void {for(const[key,entry]of this.entries)if(entry.expires<=this.now())this.remove(key);}\n get(place:Place,radius:number):PlaceImagery[]|undefined {\n  this.prune();const key=this.key(place,radius),entry=this.entries.get(key);if(!entry)return undefined;\n  this.entries.delete(key);this.entries.set(key,entry);return entry.images.map(image=>({...image}));\n }\n put(place:Place,radius:number,images:readonly PlaceImagery[]):void {\n  this.prune();const key=this.key(place,radius);this.remove(key);\n  const copy=images.slice(0,3).map(image=>({...image})),bytes=2*(key.length+JSON.stringify(copy).length);\n  if(bytes>65536)return;\n  this.entries.set(key,{images:copy,expires:this.now()+(copy.length?120000:20000),bytes});this.bytes+=bytes;\n  while(this.entries.size>12||this.bytes>65536)this.remove(this.entries.keys().next().value!);\n }\n clear():void {this.entries.clear();this.bytes=0;this.view=null;this.credential='';this.service='';}\n get stats(){this.prune();return{entries:this.entries.size,bytes:this.bytes};}\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-imagery-cache-';

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
    if (manifest.installer !== 'places-imagery-cache' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-imagery-cache.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places imagery cache is already installed. No files changed.');
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
  const manifest = { installer: 'places-imagery-cache', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places imagery cache ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
