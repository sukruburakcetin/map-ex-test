#!/usr/bin/env node
'use strict';
/**
 * Object panel and Nearby preview confirmation. Compatible current v6 sources.
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
              "label": "Object panel and Nearby preview 1",
              "before": "import { SharedSequenceRequests } from '../features/imagery/sharedSequenceRequests';\nimport { sequenceCacheStore } from '../features/imagery/sequenceCacheStore';\nimport { NearbyImageDiscovery } from '../features/imagery/nearbyDiscovery';\nimport { NearbyImageHighlight } from '../features/imagery/nearbyHighlight';\nimport type { SequenceCoordinate, SequenceProgress } from '../features/imagery/sequenceCoordinates';\ntype ResolvedRoutingProvider = {\n  kind: \"api-key\" | \"user\" | \"portal\" | \"custom\";\n",
              "after": "import { SharedSequenceRequests } from '../features/imagery/sharedSequenceRequests';\nimport { sequenceCacheStore } from '../features/imagery/sequenceCacheStore';\nimport { NearbyImageDiscovery } from '../features/imagery/nearbyDiscovery';\nimport { NearbyImageHighlight, nearbyImagePose } from '../features/imagery/nearbyHighlight';\nimport type { SequenceCoordinate, SequenceProgress } from '../features/imagery/sequenceCoordinates';\ntype ResolvedRoutingProvider = {\n  kind: \"api-key\" | \"user\" | \"portal\" | \"custom\";\n"
            },
            {
              "label": "Object panel and Nearby preview 2",
              "before": "  private _mapFeatureTiles = new TurboTileCache(4 * 1024 * 1024);\n  private _mapFeatureIndexes = new TurboIndexCache(8 * 1024 * 1024);\n  private _selectedMapFeature: any = null;\n  private _mapFeatureFilterCodes = new Map<string, string>();\n  private _mapFeatureClickAbort: AbortController | null = null;\n  private mapillaryTrafficSignsFeatureLayer: __esri.FeatureLayer | null = null;\n",
              "after": "  private _mapFeatureTiles = new TurboTileCache(4 * 1024 * 1024);\n  private _mapFeatureIndexes = new TurboIndexCache(8 * 1024 * 1024);\n  private _selectedMapFeature: any = null;\n  private _selectedMapFeatureKind: \"signs\" | \"objects\" | null = null;\n  private selectedMapFeatureEnabled(): boolean {\n    return this._selectedMapFeatureKind==='signs'?!!this.state.trafficSignsActive:this._selectedMapFeatureKind==='objects'?!!this.state.objectsActive:false;\n  }\n  private clearSelectedMapFeature(kind?:\"signs\"|\"objects\"):void {\n    if(kind&&this._selectedMapFeatureKind!==kind)return;\n    this._objectDetailsAbort?.abort();++this._objectDetailsRequest;\n    this._alternateNavigationAbort?.abort();++this._alternateNavigationRequest;\n    this._pendingDetectionFocus=null;this._selectedMapFeature=null;this._selectedMapFeatureKind=null;\n    if(this._objectPopupContent&&this._objectPopupView?.popup?.content===this._objectPopupContent)this._objectPopupView.closePopup();\n    this._objectPopupContent=null;this._objectPopupView=null;\n    this.setState({selectedFeatureMetadata:null,selectedFeatureLocation:null,alternateImages:[],isFetchingAlternates:false,\n      featureMetadataLoading:false,featureMetadataError:'',alternateImagesError:'',targetDetectionId:null,imageTrayTab:'nearby',\n      ...(this.state.imageTrayTab==='object'?{nearbyStripOpen:false}:{})});\n  }\n  private _mapFeatureFilterCodes = new Map<string, string>();\n  private _mapFeatureClickAbort: AbortController | null = null;\n  private mapillaryTrafficSignsFeatureLayer: __esri.FeatureLayer | null = null;\n"
            },
            {
              "label": "Object panel and Nearby preview 3",
              "before": "      // turn into a lateral jump that cancels the user's latest image request.\n      if ((this.state.isLoading || this._imageryOpeningRequest != null) && this._selectionRetry &&\n        String(event.image.id) !== String(this._selectionRetry.imageId)) return;\n      const firstImageForViewer = this._profileConfirmedViewer !== profileEventViewer;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n",
              "after": "      // turn into a lateral jump that cancels the user's latest image request.\n      if ((this.state.isLoading || this._imageryOpeningRequest != null) && this._selectionRetry &&\n        String(event.image.id) !== String(this._selectionRetry.imageId)) return;\n      this._nearbyHighlight?.clear();\n      const firstImageForViewer = this._profileConfirmedViewer !== profileEventViewer;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n"
            },
            {
              "label": "Object panel and Nearby preview 4",
              "before": "  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n    this._imageSequenceTiming?.cancel(); this._imageSequenceTiming = undefined;\n",
              "after": "  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this._nearbyHighlight?.clear();\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n    this._imageSequenceTiming?.cancel(); this._imageSequenceTiming = undefined;\n"
            },
            {
              "label": "Object panel and Nearby preview 5",
              "before": "    ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = null;\n    this._alternateNavigationAbort?.abort();\n    const attrs = this._selectedMapFeature?.graphic?.attributes || {};\n    const metadata = { id: String(featureId), name: attrs.name || attrs.value || \"Selected object\", firstSeen: attrs.first_seen_at, lastSeen: attrs.last_seen_at };\n    const current = () => !controller.signal.aborted && request === this._objectDetailsRequest;\n    const cached = this._objectDetailsCache.get(String(featureId));\n    this.setState({ selectedFeatureMetadata: cached?.metadata || metadata, featureMetadataLoading: !cached,\n      featureMetadataError: \"\", alternateImagesError: \"\", isFetchingAlternates: !cached,\n",
              "after": "    ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = null;\n    this._alternateNavigationAbort?.abort();\n    const layerId=this._selectedMapFeature?.layer?.id||this._selectedMapFeature?.graphic?.layer?.id;\n    this._selectedMapFeatureKind=[LAYER_IDS.TRAFFIC_SIGNS_VT,LAYER_IDS.TRAFFIC_SIGNS_FL].includes(layerId)?'signs':\n      [LAYER_IDS.OBJECTS_VT,LAYER_IDS.OBJECTS_FL].includes(layerId)?'objects':null;\n    if(!this.selectedMapFeatureEnabled())return;\n    const attrs = this._selectedMapFeature?.graphic?.attributes || {};\n    const metadata = { id: String(featureId), name: attrs.name || attrs.value || \"Selected object\", firstSeen: attrs.first_seen_at, lastSeen: attrs.last_seen_at };\n    const current = () => !controller.signal.aborted && request === this._objectDetailsRequest&&this.selectedMapFeatureEnabled();\n    const cached = this._objectDetailsCache.get(String(featureId));\n    this.setState({ selectedFeatureMetadata: cached?.metadata || metadata, featureMetadataLoading: !cached,\n      featureMetadataError: \"\", alternateImagesError: \"\", isFetchingAlternates: !cached,\n"
            },
            {
              "label": "Object panel and Nearby preview 6",
              "before": "    capturedAt: number;\n    geometry: { type: \"Point\"; coordinates: [number, number] };\n  }) => {\n    this._alternateNavigationAbort?.abort();\n    const navigation = new AbortController();\n    this._alternateNavigationAbort = navigation;\n    const request = ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = { imageId: String(img.id), detectionId: String(img.detectionId), request };\n    const featureLocation = this.state.selectedFeatureLocation;\n    const current = () => !navigation.signal.aborted && request === this._alternateNavigationRequest;\n    try {\n      this.setState({ targetDetectionId: img.detectionId, detectionsActive: !!(this.state.trafficSignsActive || this.state.objectsActive) });\n\n",
              "after": "    capturedAt: number;\n    geometry: { type: \"Point\"; coordinates: [number, number] };\n  }) => {\n    if(!this.selectedMapFeatureEnabled())return;\n    this._alternateNavigationAbort?.abort();\n    const navigation = new AbortController();\n    this._alternateNavigationAbort = navigation;\n    const request = ++this._alternateNavigationRequest;\n    this._pendingDetectionFocus = { imageId: String(img.id), detectionId: String(img.detectionId), request };\n    const featureLocation = this.state.selectedFeatureLocation;\n    const current = () => !navigation.signal.aborted && request === this._alternateNavigationRequest&&this.selectedMapFeatureEnabled();\n    try {\n      this.setState({ targetDetectionId: img.detectionId, detectionsActive: !!(this.state.trafficSignsActive || this.state.objectsActive) });\n\n"
            },
            {
              "label": "Object panel and Nearby preview 7",
              "before": "    if (signs) { this.mapillaryTrafficSignsFeatureLayer = null; this.trafficSignsZoomHandle?.remove(); this.trafficSignsStationaryHandle?.remove(); }\n    else { this.mapillaryObjectsFeatureLayer = null; this.objectsZoomHandle?.remove(); this.objectsStationaryHandle?.remove(); }\n    let layer = view.map.findLayerById(id) as __esri.VectorTileLayer;\n    if (!active) { this.setState(signs ? { showTrafficSignsFilterBox: false } : { showObjectsFilterBox: false }); if (layer) view.map.remove(layer); this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort(); this.clearTurboHoverDetails(); this._selectedMapFeature = null; return; }\n    if (!layer) {\n      if (signs) this.initMapillaryTrafficSignsLayer(); else this.initMapillaryObjectsLayer();\n      layer = (signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer)!;\n",
              "after": "    if (signs) { this.mapillaryTrafficSignsFeatureLayer = null; this.trafficSignsZoomHandle?.remove(); this.trafficSignsStationaryHandle?.remove(); }\n    else { this.mapillaryObjectsFeatureLayer = null; this.objectsZoomHandle?.remove(); this.objectsStationaryHandle?.remove(); }\n    let layer = view.map.findLayerById(id) as __esri.VectorTileLayer;\n    if (!active) { this.setState(signs ? { showTrafficSignsFilterBox: false } : { showObjectsFilterBox: false }); if (layer) view.map.remove(layer); this._mapFeatureClickAbort?.abort(); this._turboHoverPickAbort?.abort(); this.clearTurboHoverDetails(); return; }\n    if (!layer) {\n      if (signs) this.initMapillaryTrafficSignsLayer(); else this.initMapillaryObjectsLayer();\n      layer = (signs ? this.mapillaryTrafficSignsLayer : this.mapillaryObjectsLayer)!;\n"
            },
            {
              "label": "Object panel and Nearby preview 8",
              "before": "  }\n  private toggleMapillaryTrafficSigns = async () => {\n    const next = !this.state.trafficSignsActive;\n    this.setState({ trafficSignsActive: next }, () => { void this.syncMapFeatureCoverage(\"signs\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n",
              "after": "  }\n  private toggleMapillaryTrafficSigns = async () => {\n    const next = !this.state.trafficSignsActive;\n    this.setState({ trafficSignsActive: next }, () => { if(!next)this.clearSelectedMapFeature(\"signs\");void this.syncMapFeatureCoverage(\"signs\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n"
            },
            {
              "label": "Object panel and Nearby preview 9",
              "before": "  }\n  private toggleMapillaryObjects = async () => {\n    const next = !this.state.objectsActive;\n    this.setState({ objectsActive: next }, () => { void this.syncMapFeatureCoverage(\"objects\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n",
              "after": "  }\n  private toggleMapillaryObjects = async () => {\n    const next = !this.state.objectsActive;\n    this.setState({ objectsActive: next }, () => { if(!next)this.clearSelectedMapFeature(\"objects\");void this.syncMapFeatureCoverage(\"objects\"); this.syncDetectionLayerAvailability(); });\n  };\n\n\n"
            },
            {
              "label": "Object panel and Nearby preview 10",
              "before": "   * @param img - The nearby image whose coordinates should be pinned, or\n   *              `null` to remove the existing pin.\n   */\n  private highlightNearbyPin(img: NearbyImage | null) {\n    this._nearbyHighlight ??= new NearbyImageHighlight<__esri.Graphic>();\n    this._nearbyHighlight.update(this.state.jimuMapView?.view, this.ArcGISModules, this.state, img);\n",
              "after": "   * @param img - The nearby image whose coordinates should be pinned, or\n   *              `null` to remove the existing pin.\n   */\n  private _nearbySelectionRevision=0;\n  private async selectNearbyImage(img:NearbyImage):Promise<void> {\n    const viewer=this.mapillaryViewer;if(!viewer)return;\n    const request=++this._nearbySelectionRevision;\n    const selection=this._selectionRequestId,view=this.state.jimuMapView?.view;\n    const current=()=>request===this._nearbySelectionRevision&&this.mapillaryViewer===viewer&&this._selectionRequestId===selection&&this.state.jimuMapView?.view===view;\n    this.highlightNearbyPin(null);this._nearbySelectedId=img.id;this.forceUpdate();\n    try {\n      await viewer.moveTo(img.id);if(!current())return;\n      const image=await viewer.getImage();if(!current()||String(image.id)!==String(img.id))return;\n      const pose=nearbyImagePose(img);\n      if(pose?.heading!==null&&pose?.heading!==undefined){\n        const x=(((.5+(pose.heading-(image.compassAngle??0))/360)%1)+1)%1;\n        viewer.setCenter([x,.5]);this._lastBearing=pose.heading;if(view)this.requestConeRedraw(view);\n      }\n    }catch(error){if(current())this.log('[Mapillary nearby] Image selection failed:',error);}\n  }\n\n  private highlightNearbyPin(img: NearbyImage | null) {\n    this._nearbyHighlight ??= new NearbyImageHighlight<__esri.Graphic>();\n    this._nearbyHighlight.update(this.state.jimuMapView?.view, this.ArcGISModules, this.state, img);\n"
            },
            {
              "label": "Object panel and Nearby preview 11",
              "before": "              }}\n            >\n              <div role=\"tablist\" aria-label={this._t('appImageSources')} style={{ display: \"flex\", gap: 8 }}>\n                {([\"nearby\", \"object\"] as const).map(tab => <button key={tab} role=\"tab\" aria-selected={(this.state.imageTrayTab || \"nearby\") === tab} onClick={() => this.setState({ imageTrayTab: tab })} style={{ background: \"none\", border: 0, color: (this.state.imageTrayTab || \"nearby\") === tab ? \"#8bdbb7\" : \"#bbb\", padding: \"6px\", cursor: \"pointer\" }}>{tab === \"nearby\" ? <OwnedMessage source={\"Nearby ({value0})\"} values={{value0:String((this.state.nearbyImages || []).length)}}/> : <OwnedMessage source={\"Selected object ({value0})\"} values={{value0:String(this.state.alternateImages.length)}}/>}</button>)}\n              </div>\n              <button\n                onClick={() => this.setState({ nearbyStripOpen: false })}\n                style={{\n                  background: \"none\",\n                  border: \"none\",\n",
              "after": "              }}\n            >\n              <div role=\"tablist\" aria-label={this._t('appImageSources')} style={{ display: \"flex\", gap: 8 }}>\n                {([\"nearby\", \"object\"] as const).filter(tab=>tab==='nearby'||!!this.state.selectedFeatureMetadata).map(tab => <button key={tab} role=\"tab\" aria-selected={(this.state.imageTrayTab || \"nearby\") === tab} onClick={() => {this.highlightNearbyPin(null);this.setState({ imageTrayTab: tab });}} style={{ background: \"none\", border: 0, color: (this.state.imageTrayTab || \"nearby\") === tab ? \"#8bdbb7\" : \"#bbb\", padding: \"6px\", cursor: \"pointer\" }}>{tab === \"nearby\" ? <OwnedMessage source={\"Nearby ({value0})\"} values={{value0:String((this.state.nearbyImages || []).length)}}/> : <OwnedMessage source={\"Selected object ({value0})\"} values={{value0:String(this.state.alternateImages.length)}}/>}</button>)}\n              </div>\n              <button\n                onClick={() => {this.highlightNearbyPin(null);this.setState({ nearbyStripOpen: false });}}\n                style={{\n                  background: \"none\",\n                  border: \"none\",\n"
            },
            {
              "label": "Object panel and Nearby preview 12",
              "before": "                  <div\n                    key={img.id}\n                    onClick={() => {\n                      // Set instantly, no waiting for image event\n                      this._nearbySelectedId = img.id;\n                      // Force re-render so green border appears immediately\n                      this.forceUpdate();\n                      this.mapillaryViewer?.moveTo(img.id);\n                    }}\n                    onMouseEnter={(e) => {\n                      e.currentTarget.style.transform = \"scale(1.04)\";\n",
              "after": "                  <div\n                    key={img.id}\n                    onClick={() => {\n                      void this.selectNearbyImage(img);\n                    }}\n                    onMouseEnter={(e) => {\n                      e.currentTarget.style.transform = \"scale(1.04)\";\n"
            },
            {
              "label": "Object panel and Nearby preview 13",
              "before": "                );\n              })}\n            </div>\n            <div role=\"tabpanel\" aria-label={this._t('appSelectedObjectImages')} style={{ display: this.state.imageTrayTab === \"object\" ? \"flex\" : \"none\", gap: 6, flex: \"1 1 0\", minHeight: 0, overflowX: \"auto\", overflowY: \"hidden\", alignItems: \"flex-start\", color: \"#ddd\", fontSize: 12 }}>\n              {this.state.isFetchingAlternates && <span style={{ alignSelf: \"center\" }} role=\"status\"> {this._t('appLoadingAssociatedImages')} </span>}\n              {this.state.alternateImagesError && <span style={{ alignSelf: \"center\" }} role=\"alert\">{<OwnedMessage source={String(this.state.alternateImagesError ?? \"\")}/>} <button onClick={() => { const location = this.state.selectedFeatureLocation; const id = this.state.selectedFeatureMetadata?.id; if (location && id) void this.fetchAlternateImages(id, location.lat, location.lon); }}> {this._t('appRetry')} </button></span>}\n              {!this.state.isFetchingAlternates && !this.state.alternateImagesError && !this.state.alternateImages.length && <span> {this._t('appNoAssociatedImagesAvailableSelectASignOrObject')} </span>}\n",
              "after": "                );\n              })}\n            </div>\n            <div role=\"tabpanel\" aria-label={this._t('appSelectedObjectImages')} style={{ display: this.state.imageTrayTab === \"object\"&&this.state.selectedFeatureMetadata ? \"flex\" : \"none\", gap: 6, flex: \"1 1 0\", minHeight: 0, overflowX: \"auto\", overflowY: \"hidden\", alignItems: \"flex-start\", color: \"#ddd\", fontSize: 12 }}>\n              {this.state.isFetchingAlternates && <span style={{ alignSelf: \"center\" }} role=\"status\"> {this._t('appLoadingAssociatedImages')} </span>}\n              {this.state.alternateImagesError && <span style={{ alignSelf: \"center\" }} role=\"alert\">{<OwnedMessage source={String(this.state.alternateImagesError ?? \"\")}/>} <button onClick={() => { const location = this.state.selectedFeatureLocation; const id = this.state.selectedFeatureMetadata?.id; if (location && id) void this.fetchAlternateImages(id, location.lat, location.lon); }}> {this._t('appRetry')} </button></span>}\n              {!this.state.isFetchingAlternates && !this.state.alternateImagesError && !this.state.alternateImages.length && <span> {this._t('appNoAssociatedImagesAvailableSelectASignOrObject')} </span>}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/imagery/nearbyHighlight.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Object panel and Nearby preview 1",
              "before": "/** Nearby thumbnail pin and direction-cone presentation; no requests or playback state. */\nimport { calculateBearing, createConeGeometry } from '../../utils/geoUtils';\nimport type { NearbyImage } from '../../components/types';\n\ntype HighlightView<G> = { graphics: { add(graphic: G): unknown; remove(graphic: G): unknown } };\ntype HighlightState = { imageId: string | null; sequenceImages: { id: string; lat: number; lon: number }[] };\ntype HighlightModules<G> = { Graphic: new (properties: any) => G };\n\nexport class NearbyImageHighlight<G> {\n  private pin: G | null = null;\n  private direction: G | null = null;\n\n  /** Replace the hover pin/cone using WGS84 positions; null clears both graphics. */\n  update(view: HighlightView<G> | undefined, modules: HighlightModules<G> | null, state: HighlightState, img: NearbyImage | null): void {\n    if (!view || !modules) return;\n\n    // Remove previous pin and direction cone\n    if (this.pin) {\n      view.graphics.remove(this.pin);\n      this.pin = null;\n    }\n    if (this.direction) {\n      view.graphics.remove(this.direction);\n      this.direction = null;\n    }\n\n    if (!img) return;\n\n    const [lon, lat] = img.geometry.coordinates;\n    const { Graphic } = modules;\n\n    // 1. Yellow dot at hovered image position\n    this.pin = new Graphic({\n      geometry: {\n        type: \"point\",\n        longitude: lon,\n        latitude: lat,\n        spatialReference: { wkid: 4326 },\n      },\n      symbol: {\n        type: \"simple-marker\",\n        style: \"circle\",\n        color: [255, 200, 0, 0.95],\n        size: 12,\n        outline: { color: [255, 255, 255, 1], width: 2 },\n      },\n    });\n    view.graphics.add(this.pin);\n\n    // 2. Direction cone, get current camera position from sequenceImages\n    // (_cameraLat/_cameraLon are only populated during point cloud sessions)\n    const { imageId, sequenceImages } = state;\n    const activeImg = imageId ? sequenceImages.find((s) => s.id === imageId) : null;\n\n    const fromLat = activeImg?.lat ?? 0;\n    const fromLon = activeImg?.lon ?? 0;\n\n    if (!fromLat || !fromLon) return;\n\n    // Calculate bearing FROM hovered image TOWARD current camera position.\n    // This shows which direction the hovered image points back at you,\n    // giving a sense of what you would see if you jumped to it.\n    const bearing = calculateBearing(lat, lon, fromLat, fromLon);\n\n    const coneGeom = createConeGeometry(lon, lat, bearing, 10, 60);\n\n    this.direction = new Graphic({\n      geometry: coneGeom,\n      symbol: {\n        type: \"simple-fill\",\n        color: [50, 205, 50, 0.9],\n        outline: {\n          color: [255, 200, 0, 0.9],\n          width: 3,\n        },\n      } as any,\n    });\n    view.graphics.add(this.direction);\n  }\n}\n",
              "after": "/** Bounded thumbnail preview using the image's own pose, never a direction to\n * the current camera. Missing heading shows a point without inventing a cone. */\nimport { ScreenDirectionCone } from '../map-graphics/ScreenDirectionCone';\nimport type { NearbyImage } from '../../components/types';\nexport function nearbyImagePose(img:NearbyImage):{lon:number;lat:number;heading:number|null}|null {\n const valid=(p:any)=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90;\n const computed=valid(img.computed_geometry?.coordinates)&&Number.isFinite(img.computed_compass_angle);\n const coordinates=computed?img.computed_geometry!.coordinates:img.geometry?.coordinates;\n if(!valid(coordinates))return null;\n const heading=computed?img.computed_compass_angle:img.compass_angle;\n return {lon:coordinates[0],lat:coordinates[1],heading:Number.isFinite(heading)?((heading!%360)+360)%360:null};\n}\nexport class NearbyImageHighlight<G> {\n private pin:G|null=null;\n private view:any=null;\n private screen:ScreenDirectionCone|null=null;\n clear():void {this.screen?.clear();if(this.pin)this.view?.graphics?.remove(this.pin);this.pin=null;this.view=null;}\n update(view:any,modules:{Graphic:new(p:any)=>G;Point?:new(p:any)=>any}|null,state:{imageId:string|null},img:NearbyImage|null):void {\n  this.clear();\n  if(!view||!modules||!img||String(img.id)===String(state.imageId))return;\n  const pose=nearbyImagePose(img);if(!pose)return;\n  this.view=view;\n  const document=view.container?.ownerDocument;\n  if(document?.createElement&&modules.Point){\n   this.screen??=new ScreenDirectionCone(p=>new modules.Point!(p),()=>document.createElement('div'),\n    {request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)},undefined,\n    {fill:'#32cd32',opacity:'0.35',stroke:'#ffc800',markerRadius:5});\n   this.screen.showMarker(view,pose.lon,pose.lat,[255,200,0,1],String(img.id));\n   if(pose.heading!==null)this.screen.show(view,pose.lon,pose.lat,pose.heading,4,50);\n   return;\n  }\n  this.pin=new modules.Graphic({geometry:{type:'point',longitude:pose.lon,latitude:pose.lat,spatialReference:{wkid:4326}},\n   symbol:{type:'simple-marker',style:'circle',color:[255,200,0,1],size:8,outline:{color:'white',width:1.5}}});\n  view.graphics.add(this.pin);\n }\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/ScreenDirectionCone.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Object panel and Nearby preview 1",
              "before": " private geometryKey='';\n constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,\n  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void },\n  private onMarkerPresented?: (presented: boolean, view: any) => void) {}\n show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {\n  if(view!==this.view)this.clear();\n  this.fanVisible=true;\n",
              "after": " private geometryKey='';\n constructor(private point: (properties: any) => any, private createElement: () => HTMLDivElement,\n  private clock: { request(callback: FrameRequestCallback): number; cancel(frame: number): void },\n  private onMarkerPresented?: (presented: boolean, view: any) => void,\n  private appearance={fill:\"#ffb300\",opacity:\"0.55\",stroke:\"#ff9800\",markerRadius:7}) {}\n show(view: any, lon: number, lat: number, heading: number, metres: number, spread: number): void {\n  if(view!==this.view)this.clear();\n  this.fanVisible=true;\n"
            },
            {
              "label": "Object panel and Nearby preview 2",
              "before": "  if(this.geometryKey!==key){\n   const a=m.spread*Math.PI/360,inner=9,x=Math.sin(a),y=Math.cos(a),r=m.radius;\n   const left=`${60-r*x} ${60-r*y}`,right=`${60+r*x} ${60-r*y}`,start=`${60-inner*x} ${60-inner*y}`,end=`${60+inner*x} ${60-inner*y}`;\n   this.element.innerHTML=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><g data-direction-fan=\"true\"><path d=\"M${start} L${left} A${r} ${r} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z\" fill=\"#ffb300\" fill-opacity=\"0.55\" stroke=\"#ff9800\" stroke-width=\"1.25\" stroke-linejoin=\"round\"/></g><circle data-current-image-marker=\"true\" cx=\"60\" cy=\"60\" r=\"7\" fill=\"#00ff00\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>`;\n   this.geometryKey=key;\n  }\n  return true;\n",
              "after": "  if(this.geometryKey!==key){\n   const a=m.spread*Math.PI/360,inner=9,x=Math.sin(a),y=Math.cos(a),r=m.radius;\n   const left=`${60-r*x} ${60-r*y}`,right=`${60+r*x} ${60-r*y}`,start=`${60-inner*x} ${60-inner*y}`,end=`${60+inner*x} ${60-inner*y}`;\n   this.element.innerHTML=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><g data-direction-fan=\"true\"><path d=\"M${start} L${left} A${r} ${r} 0 0 1 ${right} L${end} A${inner} ${inner} 0 0 0 ${start} Z\" fill=\"${this.appearance.fill}\" fill-opacity=\"${this.appearance.opacity}\" stroke=\"${this.appearance.stroke}\" stroke-width=\"1.25\" stroke-linejoin=\"round\"/></g><circle data-current-image-marker=\"true\" cx=\"60\" cy=\"60\" r=\"${this.appearance.markerRadius}\" fill=\"#00ff00\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>`;\n   this.geometryKey=key;\n  }\n  return true;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/types.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Object panel and Nearby preview 1",
              "before": "}\n\nexport interface NearbyImage {\n  id: string;\n  thumb_256_url: string;\n  thumb_512_url: string;\n",
              "after": "}\n\nexport interface NearbyImage {\n  computed_geometry?: { type: 'Point'; coordinates: [number, number] };\n  computed_compass_angle?: number;\n  compass_angle?: number;\n  id: string;\n  thumb_256_url: string;\n  thumb_512_url: string;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/utils/constants.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Object panel and Nearby preview 1",
              "before": "  creatorLookup:(username: string) => `https://graph.mapillary.com/images?creator_username=${username}&limit=1&fields=creator`,\n\n  nearbyImages: (lat: number, lon: number, radius: number, limit: number) =>\n    `https://graph.mapillary.com/images?fields=id,thumb_256_url,thumb_512_url,captured_at,geometry,creator&lat=${lat}&lng=${lon}&radius=${Math.min(radius, 50)}&limit=${Math.min(limit, 100)}`,\n} as const;\n\n\n",
              "after": "  creatorLookup:(username: string) => `https://graph.mapillary.com/images?creator_username=${username}&limit=1&fields=creator`,\n\n  nearbyImages: (lat: number, lon: number, radius: number, limit: number) =>\n    `https://graph.mapillary.com/images?fields=id,thumb_256_url,thumb_512_url,captured_at,geometry,computed_geometry,compass_angle,computed_compass_angle,creator&lat=${lat}&lng=${lon}&radius=${Math.min(radius, 50)}&limit=${Math.min(limit, 100)}`,\n} as const;\n\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/objectNearbyLifecycle.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst root=path.join(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;\nconst moduleFixture={exports:{}};let lastPreview;\nclass Screen {constructor(point,element,clock,callback,appearance){this.appearance=appearance;lastPreview=this;}clear(){this.cleared=true}showMarker(...args){this.marker=args;this.cleared=false}show(...args){this.fan=args}}\nnew Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/nearbyHighlight.ts','utf8')))(()=>({ScreenDirectionCone:Screen}),moduleFixture,moduleFixture.exports);const {nearbyImagePose,NearbyImageHighlight}=moduleFixture.exports;\nconst image={id:'A',geometry:{type:'Point',coordinates:[0,0]},compass_angle:90};\ntest('Nearby uses capture heading with paired computed position; zero coordinates/heading are valid',()=>{assert.deepEqual(nearbyImagePose(image),{lon:0,lat:0,heading:90});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]},computed_compass_angle:0}),{lon:1,lat:2,heading:0});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]}}),{lon:0,lat:0,heading:90});assert.equal(nearbyImagePose({...image,compass_angle:undefined}).heading,null);assert.equal(nearbyImagePose({...image,geometry:{coordinates:[NaN,2]}}),null)});\ntest('preview is bounded and subdued; missing heading never invents a bearing; view retirement clears old preview',()=>{const owner=new NearbyImageHighlight(),view={container:{ownerDocument:{createElement(){}}}},modules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};owner.update(view,modules,{imageId:'B'},image);assert.equal(lastPreview.fan[3],90);assert.equal(lastPreview.fan[4],4);assert.equal(lastPreview.appearance.markerRadius,5);assert.equal(lastPreview.appearance.opacity,'0.35');owner.clear();assert.equal(lastPreview.cleared,true);owner.update(undefined,null,{imageId:'B'},null);assert.equal(lastPreview.cleared,true);owner.update(view,modules,{imageId:'A'},image);assert.equal(lastPreview.cleared,true)});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);\nconst Harness=new Function('nearbyImagePose','LAYER_IDS','GRAPH_API',compile('class Harness{'+['_nearbySelectionRevision','selectedMapFeatureEnabled','clearSelectedMapFeature','toggleMapillaryTrafficSigns','toggleMapillaryObjects','selectNearbyImage','fetchAlternateImages'].map(method).join('\\n')+'};return Harness;'))(nearbyImagePose,{TRAFFIC_SIGNS_VT:'signs',TRAFFIC_SIGNS_FL:'signs-fl',OBJECTS_VT:'objects',OBJECTS_FL:'objects-fl'},{BASE:'https://fixture.invalid'});\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};\nfunction fixture(){const w=new Harness(),events=[];w.state={trafficSignsActive:true,objectsActive:true,imageTrayTab:'object',nearbyStripOpen:true,selectedFeatureMetadata:{id:'sign'},alternateImages:[{id:'capture'}],jimuMapView:{view:{}}};w._selectedMapFeatureKind='signs';w._objectDetailsRequest=0;w._alternateNavigationRequest=0;w._objectDetailsAbort=new AbortController();w._alternateNavigationAbort=new AbortController();w.setState=(patch,done)=>{Object.assign(w.state,patch);done?.()};w.syncMapFeatureCoverage=()=>{};w.syncDetectionLayerAvailability=()=>{};w.highlightNearbyPin=value=>events.push(['preview',value]);w.forceUpdate=()=>{};w.requestConeRedraw=()=>events.push('redraw');w.log=()=>{};w._selectionRequestId=0;return {w,events}}\ntest('turning off selected source closes object UI, aborts work, and keeps independent Nearby data',async()=>{const {w}=fixture();w.state.nearbyImages=[{id:'nearby'}];await w.toggleMapillaryTrafficSigns();assert.equal(w.state.selectedFeatureMetadata,null);assert.deepEqual(w.state.alternateImages,[]);assert.equal(w.state.nearbyStripOpen,false);assert.equal(w.state.imageTrayTab,'nearby');assert.equal(w._objectDetailsAbort.signal.aborted,true);assert.equal(w._alternateNavigationAbort.signal.aborted,true);assert.equal(w.selectedMapFeatureEnabled(),false);assert.deepEqual(w.state.nearbyImages,[{id:'nearby'}])});\ntest('turning off unrelated source preserves the selected object',async()=>{const {w}=fixture();await w.toggleMapillaryObjects();assert.equal(w.state.selectedFeatureMetadata.id,'sign');assert.equal(w.state.alternateImages.length,1);assert.equal(w._objectDetailsAbort.signal.aborted,false);assert.equal(w.selectedMapFeatureEnabled(),true)});\ntest('Nearby click clears preview first, then applies the displayed capture heading on the confirmed image',async()=>{const {w,events}=fixture(),opened=deferred();w.mapillaryViewer={moveTo:()=>opened.promise,getImage:async()=>({id:'A',compassAngle:0}),setCenter:center=>events.push(['center',center])};const pending=w.selectNearbyImage(image);assert.deepEqual(events[0],['preview',null]);assert.equal(events.some(e=>e[0]==='center'),false);opened.resolve();await pending;assert.deepEqual(events.find(e=>e[0]==='center'),['center',[.75,.5]]);assert.equal(w._lastBearing,90)});\ntest('a superseded Nearby click cannot rotate the replacement image',async()=>{const {w,events}=fixture(),a=deferred(),b=deferred();let id='B';w.mapillaryViewer={moveTo:imageId=>imageId==='A'?a.promise:b.promise,getImage:async()=>({id,compassAngle:0}),setCenter:center=>events.push(['center',center])};const first=w.selectNearbyImage(image),second=w.selectNearbyImage({...image,id:'B',compass_angle:180});b.resolve();await second;a.resolve();await first;assert.equal(events.filter(e=>e[0]==='center').length,1);assert.deepEqual(events.find(e=>e[0]==='center')[1],[0,.5])});\ntest('alternate navigation rejects disabled sources before any request starts',async()=>{const member=method('_handleSelectAlternateImage'),Guarded=new Function(compile('class Guarded{'+method('selectedMapFeatureEnabled')+'\\n'+member+'};return Guarded;'))(),w=new Guarded();w.state={trafficSignsActive:false,objectsActive:false};w._selectedMapFeatureKind='signs';w.fetchMapillaryJson=()=>assert.fail('disabled source issued a request');await w._handleSelectAlternateImage({id:'A'})});\n\ntest('late selected-object responses cannot repopulate UI after its source is disabled',async()=>{const {w}=fixture(),requests=[];w._selectedMapFeature={layer:{id:'signs'},graphic:{attributes:{id:'selected',value:'stop'}}};w._objectDetailsCache=new Map();w.showSelectedObjectPopup=w.updateSelectedObjectPopup=()=>{};w.fetchMapillaryJson=()=>{const task=deferred();requests.push(task);return task.promise};const pending=w.fetchAlternateImages('selected',1,2);assert.equal(requests.length,2);await w.toggleMapillaryTrafficSigns();for(const request of requests)request.resolve({id:'selected',data:[]});await pending;assert.equal(w.state.selectedFeatureMetadata,null);assert.deepEqual(w.state.alternateImages,[]);assert.equal(w.state.nearbyStripOpen,false)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'object-panel-nearby-preview-';

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
    if (manifest.installer !== 'object-panel-nearby-preview' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-object-panel-nearby-preview.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Object panel and Nearby preview confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'object-panel-nearby-preview', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Object panel and Nearby preview confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
