#!/usr/bin/env node
'use strict';
/**
 * Nearby alignment and distance order confirmation. Compatible current v6 sources.
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
              "label": "Nearby alignment and distance order 1",
              "before": "  private currentGreenGraphic: __esri.Graphic | null = null;\n  private clickedLocationGraphic: __esri.Graphic | null = null;\n  private _directionHighlight: DirectionHoverMarker<__esri.Graphic> | null = null;\n  private _nearbyHighlight: NearbyImageHighlight<__esri.Graphic> | null = null;\n  private _routeGraphicLayer: __esri.GraphicsLayer | null = null;\n  private _routePointAGraphic: __esri.Graphic | null = null;\n",
              "after": "  private currentGreenGraphic: __esri.Graphic | null = null;\n  private clickedLocationGraphic: __esri.Graphic | null = null;\n  private _directionHighlight: DirectionHoverMarker<__esri.Graphic> | null = null;\n  private _nearbyHoverAbort:AbortController|null=null;\n  private _nearbyHighlight: NearbyImageHighlight<__esri.Graphic> | null = null;\n  private _routeGraphicLayer: __esri.GraphicsLayer | null = null;\n  private _routePointAGraphic: __esri.Graphic | null = null;\n"
            },
            {
              "label": "Nearby alignment and distance order 2",
              "before": "  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n      if(this._coneRedrawRaf!=null){cancelAnimationFrame(this._coneRedrawRaf);this._coneRedrawRaf=null;}\n      this._nativeCurrentImageMarker?.clear();this._screenDirectionCone?.clear();\n",
              "after": "  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this.highlightNearbyPin?.(null);\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n      if(this._coneRedrawRaf!=null){cancelAnimationFrame(this._coneRedrawRaf);this._coneRedrawRaf=null;}\n      this._nativeCurrentImageMarker?.clear();this._screenDirectionCone?.clear();\n"
            },
            {
              "label": "Nearby alignment and distance order 3",
              "before": "      // turn into a lateral jump that cancels the user's latest image request.\n      if ((this.state.isLoading || this._imageryOpeningRequest != null) && this._selectionRetry &&\n        String(event.image.id) !== String(this._selectionRetry.imageId)) return;\n      this._nearbyHighlight?.clear();\n      const firstImageForViewer = this._profileConfirmedViewer !== profileEventViewer;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n",
              "after": "      // turn into a lateral jump that cancels the user's latest image request.\n      if ((this.state.isLoading || this._imageryOpeningRequest != null) && this._selectionRetry &&\n        String(event.image.id) !== String(this._selectionRetry.imageId)) return;\n      this.highlightNearbyPin(null);\n      const firstImageForViewer = this._profileConfirmedViewer !== profileEventViewer;\n      this._profileConfirmedViewer = profileEventViewer;\n      this._profileConfirmedImageId = String(event.image.id);\n"
            },
            {
              "label": "Nearby alignment and distance order 4",
              "before": "    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this._nearbyHighlight?.clear();\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n    this._imageSequenceTiming?.cancel(); this._imageSequenceTiming = undefined;\n",
              "after": "    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.highlightNearbyPin(null);\n    this.clearSequenceDiagnostics();\n    this._hoverTimingAbort?.abort(); this._hoverSequenceTiming?.cancel();\n    this._imageSequenceTiming?.cancel(); this._imageSequenceTiming = undefined;\n"
            },
            {
              "label": "Nearby alignment and distance order 5",
              "before": "      markInitialLoadComplete: () => { this._isInitialImageLoad = false; },\n      runBackground: (work, signal) => this.runSequenceBackground(work, signal),\n    });\n    this._nearbyDiscovery.schedule(lat, lon, imageId);\n  }\n\n  /**\n",
              "after": "      markInitialLoadComplete: () => { this._isInitialImageLoad = false; },\n      runBackground: (work, signal) => this.runSequenceBackground(work, signal),\n    });\n    const anchor=this.getCoverageDisplayPosition(String(imageId),lon,lat);\n    this._nearbyDiscovery.schedule(anchor.lat, anchor.lon, imageId);\n  }\n\n  /**\n"
            },
            {
              "label": "Nearby alignment and distance order 6",
              "before": "  }\n\n  private highlightNearbyPin(img: NearbyImage | null) {\n    this._nearbyHighlight ??= new NearbyImageHighlight<__esri.Graphic>();\n    this._nearbyHighlight.update(this.state.jimuMapView?.view, this.ArcGISModules, this.state, img);\n  }\n\n  private getFeatureZoomThresholds(view: __esri.MapView | __esri.SceneView) {\n",
              "after": "  }\n\n  private highlightNearbyPin(img: NearbyImage | null) {\n    this._nearbyHoverAbort?.abort();this._nearbyHoverAbort=null;\n    this._nearbyHighlight ??= new NearbyImageHighlight<__esri.Graphic>();\n    const view=this.state.jimuMapView?.view,pose=img&&nearbyImagePose(img);\n    if(!view||!img||!pose||String(img.id)===String(this.state.imageId)||(this._currentImagePresentation&&!this._currentImagePresentation.owns(view.map))){\n      this._nearbyHighlight.update(view,this.ArcGISModules,this.state,null);return;\n    }\n    const context=this.coverageSelectionContext();\n    const anchor=this._coverageSelectionTargets.anchor(context,String(img.id));\n    if(anchor||!context.enabled||!context.individual){\n      this._nearbyHighlight.update(view,this.ArcGISModules,this.state,img,anchor?{lon:anchor.lon,lat:anchor.lat}:undefined);return;\n    }\n    // Resolve the exact ID from shared coverage bytes before displaying a new\n    // preview; nearby API coordinates must never snap to a neighbouring image.\n    this._nearbyHighlight.clear();\n    const controller=new AbortController();this._nearbyHoverAbort=controller;\n    void this.resolveNearbyPreviewAnchor(view,img,pose,controller);\n  }\n\n  private async resolveNearbyPreviewAnchor(view:__esri.MapView|__esri.SceneView,img:NearbyImage,pose:{lon:number;lat:number},controller:AbortController):Promise<void>{\n    const context={...this.coverageSelectionContext()},token=this.accessToken;\n    const current=()=>this._nearbyHoverAbort===controller&&!controller.signal.aborted&&this.state.jimuMapView?.view===view&&!view.destroyed&&\n      this.accessToken===token&&this.state.turboModeActive&&this.props.state!=='CLOSED'&&this.props.visible!==false&&\n      (!this._currentImagePresentation||this._currentImagePresentation.owns(view.map))&&\n      this.coverageSelectionContext().revision===context.revision&&this.coverageSelectionContext().layer===context.layer;\n    try{\n      const zoom=ZOOM.TILE_FETCH,n=2**zoom,latitude=Math.max(-85.05112878,Math.min(85.05112878,pose.lat));\n      const x=Math.max(0,Math.min(n-1,Math.floor((pose.lon+180)/360*n))),y=Math.max(0,Math.min(n-1,Math.floor((1-Math.asinh(Math.tan(latitude*Math.PI/180))/Math.PI)/2*n)));\n      const tiles:[number,number,number][]=[[x,y,zoom]];\n      for(const [key] of this._turboTileCache.snapshot()){\n        const [z,tx,ty]=key.split('/').map(Number);if(z===zoom&&Math.abs(tx-x)<=1&&Math.abs(ty-y)<=1&&(tx!==x||ty!==y))tiles.push([tx,ty,z]);\n      }\n      for(const tile of tiles){\n        if(!current())return;\n        const [tx,ty,z]=tile,buffer=this._turboTileCache.get(`${z}/${tx}/${ty}`)??await this.runSequenceBackground(signal=>this.getTurboTileBuffer(tile,signal),controller.signal);\n        if(!current())return;if(!buffer.byteLength)continue;\n        const index=this._sequenceTileIndex.has(buffer)?await this.getSequenceTileIndex(buffer,controller.signal):await this.runSequenceBackground(signal=>this.getSequenceTileIndex(buffer,signal),controller.signal);if(!current())return;\n        const point=nativeImageAnchor(buffer,index,bytes=>new VectorTile(new Pbf(new Uint8Array(bytes))),tile,String(img.id));\n        if(!point)continue;\n        this._coverageSelectionTargets.retain(this.coverageSelectionContext(),String(img.id),new this.ArcGISModules.Point({...point,spatialReference:{wkid:3857}}));break;\n      }\n    }catch(error){if(current()&&(error as any)?.name!=='AbortError')this.log('[Mapillary nearby] Coverage alignment unavailable:',error);}\n    if(current()){\n      const anchor=this.getCoverageDisplayPosition(String(img.id),pose.lon,pose.lat);\n      this._nearbyHighlight?.update(view,this.ArcGISModules,this.state,img,anchor);\n    }\n  }\n\n  private getFeatureZoomThresholds(view: __esri.MapView | __esri.SceneView) {\n"
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
              "label": "Nearby alignment and distance order 1",
              "before": " private view:any=null;\n private screen:ScreenDirectionCone|null=null;\n clear():void {this.screen?.clear();if(this.pin)this.view?.graphics?.remove(this.pin);this.pin=null;this.view=null;}\n update(view:any,modules:{Graphic:new(p:any)=>G;Point?:new(p:any)=>any}|null,state:{imageId:string|null},img:NearbyImage|null):void {\n  this.clear();\n  if(!view||!modules||!img||String(img.id)===String(state.imageId))return;\n  const pose=nearbyImagePose(img);if(!pose)return;\n  this.view=view;\n  const document=view.container?.ownerDocument;\n  if(document?.createElement&&modules.Point){\n   this.screen??=new ScreenDirectionCone(p=>new modules.Point!(p),()=>document.createElement('div'),\n    {request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)},undefined,\n    {fill:'#32cd32',opacity:'0.35',stroke:'#ffc800',markerRadius:5});\n   this.screen.showMarker(view,pose.lon,pose.lat,[255,200,0,1],String(img.id));\n   if(pose.heading!==null)this.screen.show(view,pose.lon,pose.lat,pose.heading,4,50);\n   return;\n",
              "after": " private view:any=null;\n private screen:ScreenDirectionCone|null=null;\n clear():void {this.screen?.clear();if(this.pin)this.view?.graphics?.remove(this.pin);this.pin=null;this.view=null;}\n update(view:any,modules:{Graphic:new(p:any)=>G;Point?:new(p:any)=>any}|null,state:{imageId:string|null},img:NearbyImage|null,anchor?:{lon:number;lat:number}):void {\n  this.clear();\n  if(!view||!modules||!img||String(img.id)===String(state.imageId))return;\n  const original=nearbyImagePose(img);if(!original)return;\n  const pose={...original,...anchor};\n  this.view=view;\n  const document=view.container?.ownerDocument;\n  if(document?.createElement&&modules.Point){\n   this.screen??=new ScreenDirectionCone(p=>new modules.Point!(p),()=>document.createElement('div'),\n    {request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)},undefined,\n    {fill:'#2bb83f',opacity:'0.35',stroke:'#ffc800',markerRadius:5});\n   this.screen.showMarker(view,pose.lon,pose.lat,[255,200,0,1],String(img.id));\n   if(pose.heading!==null)this.screen.show(view,pose.lon,pose.lat,pose.heading,4,50);\n   return;\n"
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
              "label": "Nearby alignment and distance order 1",
              "before": "/** Instance-owned idle nearby enrichment; playback and UI remain runtime-owned. */\nimport { GRAPH_API, TIMING } from '../../utils/constants';\nimport type { NearbyImage } from '../../components/types';\n\nexport interface NearbyDiscoveryDependencies {\n  getState: () => { imageId: string | null; nearbyLoading?: boolean };\n",
              "after": "/** Instance-owned idle nearby enrichment; playback and UI remain runtime-owned. */\nimport { GRAPH_API, TIMING } from '../../utils/constants';\nimport type { NearbyImage } from '../../components/types';\n\n/** Rank one bounded API batch by geodesic distance before choosing the visible20.\n * Stable ties and unknown coordinates retain server order; source data is untouched. */\nexport function nearestNearbyImages(images:readonly NearbyImage[],lat:number,lon:number,imageId:string,limit=20):NearbyImage[] {\n const valid=(p:any)=>Array.isArray(p)&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90;\n const seen=new Set<string>();\n return images.filter(image=>{const id=String(image.id||'');if(!id||id===String(imageId)||seen.has(id))return false;seen.add(id);return true;})\n  .map((image,index)=>{\n   const p=valid(image.computed_geometry?.coordinates)?image.computed_geometry!.coordinates:image.geometry?.coordinates;\n   let distance=Infinity;\n   if(valid(p)&&Number.isFinite(lat)&&Number.isFinite(lon)){\n    const radians=Math.PI/180,a=Math.sin((p[1]-lat)*radians/2)**2+Math.cos(lat*radians)*Math.cos(p[1]*radians)*Math.sin((p[0]-lon)*radians/2)**2;\n    distance=12742000*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));\n   }\n   return {image,index,distance};\n  }).sort((a,b)=>a.distance===b.distance?a.index-b.index:a.distance-b.distance).slice(0,Math.max(0,limit)).map(item=>item.image);\n}\n\nexport interface NearbyDiscoveryDependencies {\n  getState: () => { imageId: string | null; nearbyLoading?: boolean };\n"
            },
            {
              "label": "Nearby alignment and distance order 2",
              "before": "      // Never clear existing images, keep stale thumbnails visible during fetch\n      this.dependencies.update({ nearbyLoading: true });\n\n      const url = GRAPH_API.nearbyImages(lat, lon, 50, 21) + `&access_token=${this.dependencies.getToken()}`;\n\n      const request = async (signal: AbortSignal) => {\n        if (signal.aborted || ctrl.signal.aborted || this.controller !== ctrl ||\n",
              "after": "      // Never clear existing images, keep stale thumbnails visible during fetch\n      this.dependencies.update({ nearbyLoading: true });\n\n      const url = GRAPH_API.nearbyImages(lat, lon, 50, 100) + `&access_token=${this.dependencies.getToken()}`;\n\n      const request = async (signal: AbortSignal) => {\n        if (signal.aborted || ctrl.signal.aborted || this.controller !== ctrl ||\n"
            },
            {
              "label": "Nearby alignment and distance order 3",
              "before": "      run(request, ctrl.signal)\n        .then((data) => {\n          if (ctrl.signal.aborted || this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId || this.controller !== ctrl) return;\n          const images = (Array.isArray(data.data) ? data.data as NearbyImage[] : []).filter((img) => img.id !== imageId).slice(0, 20);\n          this.dependencies.update({ nearbyImages: images });\n        })\n        .catch(() => {\n",
              "after": "      run(request, ctrl.signal)\n        .then((data) => {\n          if (ctrl.signal.aborted || this.dependencies.isPaused() === false || this.dependencies.getState().imageId !== imageId || this.controller !== ctrl) return;\n          const images = nearestNearbyImages(Array.isArray(data.data)?data.data as NearbyImage[]:[],lat,lon,imageId);\n          this.dependencies.update({ nearbyImages: images });\n        })\n        .catch(() => {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/runtimeMessages.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Nearby alignment and distance order 1",
              "before": " \"uiClickToShowAllQualityBands\": \"Click to show all quality bands\",\n \"uiExportActiveSignsAndObjectsWithinTheMap\": \"Export active signs and objects within the map bounding box, using current filters\",\n \"uiExporting\": \"EXPORTING\u2026\",\n \"uiExportArea\": \"Export data\",\n \"uiShowOrHideDetectionOutlines\": \"Show or hide detection outlines\",\n \"uiDetectionOutlines\": \"Detection outlines\",\n \"uiAiOverlay\": \"AI OVERLAY\",\n",
              "after": " \"uiClickToShowAllQualityBands\": \"Click to show all quality bands\",\n \"uiExportActiveSignsAndObjectsWithinTheMap\": \"Export active signs and objects within the map bounding box, using current filters\",\n \"uiExporting\": \"EXPORTING\u2026\",\n \"uiExportArea\": \"Export Data\",\n \"uiShowOrHideDetectionOutlines\": \"Show or hide detection outlines\",\n \"uiDetectionOutlines\": \"Detection outlines\",\n \"uiAiOverlay\": \"AI OVERLAY\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/localization/translations.csv",
      "variants": [
        {
          "blocks": [
            {
              "label": "Nearby alignment and distance order 1",
              "before": "\"runtime\",\"uiClickToShowAllQualityBands\",\"Click to show all quality bands\",\"Click to show all quality bands\",\"\u0627\u0646\u0642\u0631 \u0644\u0625\u0638\u0647\u0627\u0631 \u0643\u0627\u0641\u0629 \u0646\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u062c\u0648\u062f\u0629\",\"T\u00fcm kalite gruplar\u0131n\u0131 g\u00f6stermek i\u00e7in t\u0131klay\u0131n\",\"Haz clic para mostrar todos los niveles de calidad\",\"Cliquez pour afficher tous les niveaux de qualit\u00e9\",\"Klicken, um alle Qualit\u00e4tsstufen anzuzeigen\",\"Clique para mostrar todas as faixas de qualidade\",\"Fai clic per mostrare tutte le fasce di qualit\u00e0\",\"\u30af\u30ea\u30c3\u30af\u3057\u3066\u3059\u3079\u3066\u306e\u54c1\u8cea\u533a\u5206\u3092\u8868\u793a\",\"\ud074\ub9ad\ud558\uc5ec \ubaa8\ub4e0 \ud488\uc9c8 \uad6c\uac04 \ud45c\uc2dc\",\"\u70b9\u51fb\u663e\u793a\u6240\u6709\u8d28\u91cf\u7b49\u7ea7\",\"\u6309\u4e00\u4e0b\u986f\u793a\u6240\u6709\u54c1\u8cea\u7b49\u7d1a\"\n\"runtime\",\"uiExportActiveSignsAndObjectsWithinTheMap\",\"Export active signs and objects within the map bounding box, using current filters\",\"Export active signs and objects within the map bounding box, using current filters\",\"\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u0631\u0628\u0639 \u0627\u0644\u0645\u062d\u064a\u0637 \u0628\u0627\u0644\u062e\u0631\u064a\u0637\u0629\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\",\"Ge\u00e7erli filtrelerle haritan\u0131n s\u0131n\u0131r kutusundaki etkin i\u015faretleri ve nesneleri d\u0131\u015fa aktar\",\"Exportar se\u00f1ales y objetos activos dentro de los l\u00edmites del mapa con los filtros actuales\",\"Exporter les panneaux et objets actifs dans l\u2019emprise de la carte avec les filtres actuels\",\"Aktive Verkehrszeichen und Objekte innerhalb des Kartenausschnitts mit den aktuellen Filtern exportieren\",\"Exportar placas e objetos ativos dentro dos limites do mapa usando os filtros atuais\",\"Esporta segnali e oggetti attivi entro i limiti della mappa usando i filtri correnti\",\"\u73fe\u5728\u306e\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u9069\u7528\u3057\u3066\u3001\u30de\u30c3\u30d7\u7bc4\u56f2\u5185\u306e\u6709\u52b9\u306a\u6a19\u8b58\u3068\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\ud604\uc7ac \ud544\ud130\ub97c \uc801\uc6a9\ud574 \uc9c0\ub3c4 \ubc94\uc704 \uc548\uc758 \ud65c\uc131 \ud45c\uc9c0\ud310\uacfc \uac1d\uccb4 \ub0b4\ubcf4\ub0b4\uae30\",\"\u6309\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u5bfc\u51fa\u5730\u56fe\u8303\u56f4\u5185\u7684\u6d3b\u52a8\u6807\u5fd7\u548c\u5bf9\u8c61\",\"\u6309\u76ee\u524d\u7be9\u9078\u689d\u4ef6\u532f\u51fa\u5730\u5716\u7bc4\u570d\u5167\u7684\u6d3b\u52d5\u6a19\u8a8c\u548c\u7269\u4ef6\"\n\"runtime\",\"uiExporting\",\"EXPORTING\u2026\",\"EXPORTING\u2026\",\"\u062a\u0635\u062f\u064a\u0631 ...\",\"AKTARILIYOR\u2026\",\"EXPORTANDO\u2026\",\"EXPORT EN COURS\u2026\",\"EXPORT L\u00c4UFT\u2026\",\"EXPORTANDO\u2026\",\"ESPORTAZIONE\u2026\",\"\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\u4e2d\u2026\",\"\ub0b4\ubcf4\ub0b4\ub294 \uc911\u2026\",\"\u6b63\u5728\u5bfc\u51fa\u2026\",\"\u6b63\u5728\u532f\u51fa\u2026\"\n\"runtime\",\"uiExportArea\",\"Export data\",\"Export data\",\"\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062a\u0635\u062f\u064a\u0631\",\"ALANI DI\u015eA AKTAR\",\"EXPORTAR \u00c1REA\",\"EXPORTER LA ZONE\",\"GEBIET EXPORTIEREN\",\"EXPORTAR \u00c1REA\",\"ESPORTA AREA\",\"\u7bc4\u56f2\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\uc601\uc5ed \ub0b4\ubcf4\ub0b4\uae30\",\"\u5bfc\u51fa\u533a\u57df\",\"\u532f\u51fa\u5340\u57df\"\n\"runtime\",\"uiShowOrHideDetectionOutlines\",\"Show or hide detection outlines\",\"Show or hide detection outlines\",\"\u0625\u0638\u0647\u0627\u0631 \u0623\u0648 \u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0639\u0631\u064a\u0636\u0629 \u0644\u0644\u0643\u0634\u0641\",\"Tespit s\u0131n\u0131rlar\u0131n\u0131 g\u00f6ster veya gizle\",\"Mostrar u ocultar contornos de detecci\u00f3n\",\"Afficher ou masquer les contours des d\u00e9tections\",\"Erkennungsumrisse ein- oder ausblenden\",\"Mostrar ou ocultar contornos de detec\u00e7\u00e3o\",\"Mostra o nascondi i contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\u3092\u8868\u793a\u30fb\u975e\u8868\u793a\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120 \ud45c\uc2dc \ub610\ub294 \uc228\uae30\uae30\",\"\u663e\u793a\u6216\u9690\u85cf\u68c0\u6d4b\u8f6e\u5ed3\",\"\u986f\u793a\u6216\u96b1\u85cf\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiDetectionOutlines\",\"Detection outlines\",\"Detection outlines\",\"\u0645\u062e\u0637\u0637\u0627\u062a \u0627\u0644\u0643\u0634\u0641 \u0639\u0646\",\"Tespit s\u0131n\u0131rlar\u0131\",\"Contornos de detecci\u00f3n\",\"Contours des d\u00e9tections\",\"Erkennungsumrisse\",\"Contornos de detec\u00e7\u00e3o\",\"Contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120\",\"\u68c0\u6d4b\u8f6e\u5ed3\",\"\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiAiOverlay\",\"AI OVERLAY\",\"AI OVERLAY\",\"\u062a\u0631\u0627\u0643\u0628 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\",\"YAPAY ZEK\u00c2 KATMANI\",\"SUPERPOSICI\u00d3N DE IA\",\"SUPERPOSITION IA\",\"KI-\u00dcBERLAGERUNG\",\"SOBREPOSI\u00c7\u00c3O DE IA\",\"SOVRAPPOSIZIONE IA\",\"AI\u30aa\u30fc\u30d0\u30fc\u30ec\u30a4\",\"AI \uc624\ubc84\ub808\uc774\",\"AI \u53e0\u52a0\u5c42\",\"AI \u758a\u52a0\u5c64\"\n",
              "after": "\"runtime\",\"uiClickToShowAllQualityBands\",\"Click to show all quality bands\",\"Click to show all quality bands\",\"\u0627\u0646\u0642\u0631 \u0644\u0625\u0638\u0647\u0627\u0631 \u0643\u0627\u0641\u0629 \u0646\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u062c\u0648\u062f\u0629\",\"T\u00fcm kalite gruplar\u0131n\u0131 g\u00f6stermek i\u00e7in t\u0131klay\u0131n\",\"Haz clic para mostrar todos los niveles de calidad\",\"Cliquez pour afficher tous les niveaux de qualit\u00e9\",\"Klicken, um alle Qualit\u00e4tsstufen anzuzeigen\",\"Clique para mostrar todas as faixas de qualidade\",\"Fai clic per mostrare tutte le fasce di qualit\u00e0\",\"\u30af\u30ea\u30c3\u30af\u3057\u3066\u3059\u3079\u3066\u306e\u54c1\u8cea\u533a\u5206\u3092\u8868\u793a\",\"\ud074\ub9ad\ud558\uc5ec \ubaa8\ub4e0 \ud488\uc9c8 \uad6c\uac04 \ud45c\uc2dc\",\"\u70b9\u51fb\u663e\u793a\u6240\u6709\u8d28\u91cf\u7b49\u7ea7\",\"\u6309\u4e00\u4e0b\u986f\u793a\u6240\u6709\u54c1\u8cea\u7b49\u7d1a\"\n\"runtime\",\"uiExportActiveSignsAndObjectsWithinTheMap\",\"Export active signs and objects within the map bounding box, using current filters\",\"Export active signs and objects within the map bounding box, using current filters\",\"\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u0631\u0628\u0639 \u0627\u0644\u0645\u062d\u064a\u0637 \u0628\u0627\u0644\u062e\u0631\u064a\u0637\u0629\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\",\"Ge\u00e7erli filtrelerle haritan\u0131n s\u0131n\u0131r kutusundaki etkin i\u015faretleri ve nesneleri d\u0131\u015fa aktar\",\"Exportar se\u00f1ales y objetos activos dentro de los l\u00edmites del mapa con los filtros actuales\",\"Exporter les panneaux et objets actifs dans l\u2019emprise de la carte avec les filtres actuels\",\"Aktive Verkehrszeichen und Objekte innerhalb des Kartenausschnitts mit den aktuellen Filtern exportieren\",\"Exportar placas e objetos ativos dentro dos limites do mapa usando os filtros atuais\",\"Esporta segnali e oggetti attivi entro i limiti della mappa usando i filtri correnti\",\"\u73fe\u5728\u306e\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u9069\u7528\u3057\u3066\u3001\u30de\u30c3\u30d7\u7bc4\u56f2\u5185\u306e\u6709\u52b9\u306a\u6a19\u8b58\u3068\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\ud604\uc7ac \ud544\ud130\ub97c \uc801\uc6a9\ud574 \uc9c0\ub3c4 \ubc94\uc704 \uc548\uc758 \ud65c\uc131 \ud45c\uc9c0\ud310\uacfc \uac1d\uccb4 \ub0b4\ubcf4\ub0b4\uae30\",\"\u6309\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u5bfc\u51fa\u5730\u56fe\u8303\u56f4\u5185\u7684\u6d3b\u52a8\u6807\u5fd7\u548c\u5bf9\u8c61\",\"\u6309\u76ee\u524d\u7be9\u9078\u689d\u4ef6\u532f\u51fa\u5730\u5716\u7bc4\u570d\u5167\u7684\u6d3b\u52d5\u6a19\u8a8c\u548c\u7269\u4ef6\"\n\"runtime\",\"uiExporting\",\"EXPORTING\u2026\",\"EXPORTING\u2026\",\"\u062a\u0635\u062f\u064a\u0631 ...\",\"AKTARILIYOR\u2026\",\"EXPORTANDO\u2026\",\"EXPORT EN COURS\u2026\",\"EXPORT L\u00c4UFT\u2026\",\"EXPORTANDO\u2026\",\"ESPORTAZIONE\u2026\",\"\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\u4e2d\u2026\",\"\ub0b4\ubcf4\ub0b4\ub294 \uc911\u2026\",\"\u6b63\u5728\u5bfc\u51fa\u2026\",\"\u6b63\u5728\u532f\u51fa\u2026\"\n\"runtime\",\"uiExportArea\",\"Export Data\",\"Export Data\",\"\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062a\u0635\u062f\u064a\u0631\",\"ALANI DI\u015eA AKTAR\",\"EXPORTAR \u00c1REA\",\"EXPORTER LA ZONE\",\"GEBIET EXPORTIEREN\",\"EXPORTAR \u00c1REA\",\"ESPORTA AREA\",\"\u7bc4\u56f2\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\uc601\uc5ed \ub0b4\ubcf4\ub0b4\uae30\",\"\u5bfc\u51fa\u533a\u57df\",\"\u532f\u51fa\u5340\u57df\"\n\"runtime\",\"uiShowOrHideDetectionOutlines\",\"Show or hide detection outlines\",\"Show or hide detection outlines\",\"\u0625\u0638\u0647\u0627\u0631 \u0623\u0648 \u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0639\u0631\u064a\u0636\u0629 \u0644\u0644\u0643\u0634\u0641\",\"Tespit s\u0131n\u0131rlar\u0131n\u0131 g\u00f6ster veya gizle\",\"Mostrar u ocultar contornos de detecci\u00f3n\",\"Afficher ou masquer les contours des d\u00e9tections\",\"Erkennungsumrisse ein- oder ausblenden\",\"Mostrar ou ocultar contornos de detec\u00e7\u00e3o\",\"Mostra o nascondi i contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\u3092\u8868\u793a\u30fb\u975e\u8868\u793a\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120 \ud45c\uc2dc \ub610\ub294 \uc228\uae30\uae30\",\"\u663e\u793a\u6216\u9690\u85cf\u68c0\u6d4b\u8f6e\u5ed3\",\"\u986f\u793a\u6216\u96b1\u85cf\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiDetectionOutlines\",\"Detection outlines\",\"Detection outlines\",\"\u0645\u062e\u0637\u0637\u0627\u062a \u0627\u0644\u0643\u0634\u0641 \u0639\u0646\",\"Tespit s\u0131n\u0131rlar\u0131\",\"Contornos de detecci\u00f3n\",\"Contours des d\u00e9tections\",\"Erkennungsumrisse\",\"Contornos de detec\u00e7\u00e3o\",\"Contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120\",\"\u68c0\u6d4b\u8f6e\u5ed3\",\"\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiAiOverlay\",\"AI OVERLAY\",\"AI OVERLAY\",\"\u062a\u0631\u0627\u0643\u0628 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\",\"YAPAY ZEK\u00c2 KATMANI\",\"SUPERPOSICI\u00d3N DE IA\",\"SUPERPOSITION IA\",\"KI-\u00dcBERLAGERUNG\",\"SOBREPOSI\u00c7\u00c3O DE IA\",\"SOVRAPPOSIZIONE IA\",\"AI\u30aa\u30fc\u30d0\u30fc\u30ec\u30a4\",\"AI \uc624\ubc84\ub808\uc774\",\"AI \u53e0\u52a0\u5c42\",\"AI \u758a\u52a0\u5c64\"\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/objectNearbyLifecycle.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Nearby alignment and distance order 1",
              "before": "new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/nearbyHighlight.ts','utf8')))(()=>({ScreenDirectionCone:Screen}),moduleFixture,moduleFixture.exports);const {nearbyImagePose,NearbyImageHighlight}=moduleFixture.exports;\nconst image={id:'A',geometry:{type:'Point',coordinates:[0,0]},compass_angle:90};\ntest('Nearby uses capture heading with paired computed position; zero coordinates/heading are valid',()=>{assert.deepEqual(nearbyImagePose(image),{lon:0,lat:0,heading:90});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]},computed_compass_angle:0}),{lon:1,lat:2,heading:0});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]}}),{lon:0,lat:0,heading:90});assert.equal(nearbyImagePose({...image,compass_angle:undefined}).heading,null);assert.equal(nearbyImagePose({...image,geometry:{coordinates:[NaN,2]}}),null)});\ntest('preview is bounded and subdued; missing heading never invents a bearing; view retirement clears old preview',()=>{const owner=new NearbyImageHighlight(),view={container:{ownerDocument:{createElement(){}}}},modules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};owner.update(view,modules,{imageId:'B'},image);assert.equal(lastPreview.fan[3],90);assert.equal(lastPreview.fan[4],4);assert.equal(lastPreview.appearance.markerRadius,5);assert.equal(lastPreview.appearance.opacity,'0.35');owner.clear();assert.equal(lastPreview.cleared,true);owner.update(undefined,null,{imageId:'B'},null);assert.equal(lastPreview.cleared,true);owner.update(view,modules,{imageId:'A'},image);assert.equal(lastPreview.cleared,true)});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);\nconst Harness=new Function('nearbyImagePose','LAYER_IDS','GRAPH_API',compile('class Harness{'+['_detectionToolsRequest','revealDetectionTools','_nearbySelectionRevision','selectedMapFeatureEnabled','clearSelectedMapFeature','toggleMapillaryTrafficSigns','toggleMapillaryObjects','selectNearbyImage','fetchAlternateImages'].map(method).join('\\n')+'};return Harness;'))(nearbyImagePose,{TRAFFIC_SIGNS_VT:'signs',TRAFFIC_SIGNS_FL:'signs-fl',OBJECTS_VT:'objects',OBJECTS_FL:'objects-fl'},{BASE:'https://fixture.invalid'});\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};\n",
              "after": "new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/imagery/nearbyHighlight.ts','utf8')))(()=>({ScreenDirectionCone:Screen}),moduleFixture,moduleFixture.exports);const {nearbyImagePose,NearbyImageHighlight}=moduleFixture.exports;\nconst image={id:'A',geometry:{type:'Point',coordinates:[0,0]},compass_angle:90};\ntest('Nearby uses capture heading with paired computed position; zero coordinates/heading are valid',()=>{assert.deepEqual(nearbyImagePose(image),{lon:0,lat:0,heading:90});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]},computed_compass_angle:0}),{lon:1,lat:2,heading:0});assert.deepEqual(nearbyImagePose({...image,computed_geometry:{coordinates:[1,2]}}),{lon:0,lat:0,heading:90});assert.equal(nearbyImagePose({...image,compass_angle:undefined}).heading,null);assert.equal(nearbyImagePose({...image,geometry:{coordinates:[NaN,2]}}),null)});\ntest('preview is bounded and subdued; missing heading never invents a bearing; view retirement clears old preview',()=>{const owner=new NearbyImageHighlight(),view={container:{ownerDocument:{createElement(){}}}},modules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};owner.update(view,modules,{imageId:'B'},image);assert.equal(lastPreview.fan[3],90);assert.equal(lastPreview.fan[4],4);assert.equal(lastPreview.appearance.markerRadius,5);assert.equal(lastPreview.appearance.opacity,'0.35');assert.equal(lastPreview.appearance.fill,'#2bb83f');owner.update(view,modules,{imageId:'B'},image,{lon:1.2,lat:3.4});assert.deepEqual(lastPreview.marker.slice(1,3),[1.2,3.4]);assert.equal(lastPreview.fan[3],90);owner.clear();assert.equal(lastPreview.cleared,true);owner.update(undefined,null,{imageId:'B'},null);assert.equal(lastPreview.cleared,true);owner.update(view,modules,{imageId:'A'},image);assert.equal(lastPreview.cleared,true)});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf);\nconst Harness=new Function('nearbyImagePose','LAYER_IDS','GRAPH_API',compile('class Harness{'+['_detectionToolsRequest','revealDetectionTools','_nearbySelectionRevision','selectedMapFeatureEnabled','clearSelectedMapFeature','toggleMapillaryTrafficSigns','toggleMapillaryObjects','selectNearbyImage','fetchAlternateImages'].map(method).join('\\n')+'};return Harness;'))(nearbyImagePose,{TRAFFIC_SIGNS_VT:'signs',TRAFFIC_SIGNS_FL:'signs-fl',OBJECTS_VT:'objects',OBJECTS_FL:'objects-fl'},{BASE:'https://fixture.invalid'});\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/panelControls.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Nearby alignment and distance order 1",
              "before": " const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n assert.equal(await exportButton.innerText(),'Export data');assert.equal(await exportButton.locator('span').evaluate(node=>getComputedStyle(node).whiteSpace),'nowrap');assert.equal(await labelsButton.count(),0);await page.evaluate(()=>window.renderInfo({detectionsActive:true}));await labelsButton.waitFor({state:'visible'});const bottomInset=await labelsButton.evaluate(node=>{const group=node.parentElement;return group.getBoundingClientRect().bottom-node.getBoundingClientRect().bottom});assert(bottomInset>=4);checks++;\n\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n",
              "after": " const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n assert.equal(await exportButton.innerText(),'Export Data');assert.equal(await exportButton.locator('span').evaluate(node=>getComputedStyle(node).whiteSpace),'nowrap');assert.equal(await labelsButton.count(),0);await page.evaluate(()=>window.renderInfo({detectionsActive:true}));await labelsButton.waitFor({state:'visible'});const bottomInset=await labelsButton.evaluate(node=>{const group=node.parentElement;return group.getBoundingClientRect().bottom-node.getBoundingClientRect().bottom});assert(bottomInset>=4);checks++;\n\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n"
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
              "label": "Nearby alignment and distance order 1",
              "before": "const root=path.join(__dirname,'../src');\nconst nearModule={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/nearbyDiscovery.ts'),'utf8')))(()=>({GRAPH_API:{nearbyImages:(lat,lon)=>`https://example.invalid/nearby?lat=${lat}&lon=${lon}`},TIMING:{SPLASH_FADE_MS:200}}),nearModule,nearModule.exports);\nconst queueModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/BackgroundRequestQueue.ts'),'utf8')))(queueModule,queueModule.exports);\nconst {NearbyImageDiscovery}=nearModule.exports,{BackgroundRequestQueue}=queueModule.exports;\nconst flush=()=>new Promise(r=>setImmediate(r));\nconst deferred=()=>{let resolve,reject;return{promise:new Promise((a,b)=>{resolve=a;reject=b}),resolve:value=>resolve(value),reject:error=>reject(error)}};\nfunction setup(t,{queue,initial=false}={}){\n",
              "after": "const root=path.join(__dirname,'../src');\nconst nearModule={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/nearbyDiscovery.ts'),'utf8')))(()=>({GRAPH_API:{nearbyImages:(lat,lon)=>`https://example.invalid/nearby?lat=${lat}&lon=${lon}`},TIMING:{SPLASH_FADE_MS:200}}),nearModule,nearModule.exports);\nconst queueModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'features/imagery/BackgroundRequestQueue.ts'),'utf8')))(queueModule,queueModule.exports);\nconst {NearbyImageDiscovery,nearestNearbyImages}=nearModule.exports,{BackgroundRequestQueue}=queueModule.exports;\nconst flush=()=>new Promise(r=>setImmediate(r));\nconst deferred=()=>{let resolve,reject;return{promise:new Promise((a,b)=>{resolve=a;reject=b}),resolve:value=>resolve(value),reject:error=>reject(error)}};\nfunction setup(t,{queue,initial=false}={}){\n"
            },
            {
              "label": "Nearby alignment and distance order 2",
              "before": "test('ordinary nearby request failure keeps existing thumbnails and clears only its own loader',async t=>{\n const {owner,state,idle}=setup(t);global.fetch=async()=>({ok:false});owner.schedule(41,29,'A');idle();await flush();assert.deepEqual(state.nearbyImages,[{id:'existing'}]);assert.equal(state.nearbyLoading,false);\n});\n",
              "after": "test('ordinary nearby request failure keeps existing thumbnails and clears only its own loader',async t=>{\n const {owner,state,idle}=setup(t);global.fetch=async()=>({ok:false});owner.schedule(41,29,'A');idle();await flush();assert.deepEqual(state.nearbyImages,[{id:'existing'}]);assert.equal(state.nearbyLoading,false);\n});\n\n\ntest('Nearby ranks the whole batch before taking20, excluding active and duplicate captures',()=>{\n const image=(id,d)=>({id,geometry:{coordinates:[d,0]}});\n const batch=[image('current',0),...Array.from({length:25},(_,i)=>image(String(i),.0025-i*.0001)),image('closest',.000001),image('closest',.000002)];\n const before=JSON.stringify(batch),ranked=nearestNearbyImages(batch,0,0,'current');\n assert.equal(ranked.length,20);assert.equal(ranked[0].id,'closest');assert.equal(ranked[1].id,'24');assert(!ranked.some(image=>image.id==='current'));assert.equal(JSON.stringify(batch),before);\n});\ntest('Nearby uses computed positions for distance and retains stable ties/unknown points last',()=>{\n const batch=[{id:'unknown'},{id:'far',geometry:{coordinates:[1,0]}},{id:'computed',geometry:{coordinates:[2,0]},computed_geometry:{coordinates:[0,0]}},{id:'same',geometry:{coordinates:[0,0]}}];\n assert.deepEqual(nearestNearbyImages(batch,0,0,'main').map(image=>image.id),['computed','same','far','unknown']);\n});\ntest('Nearby distance sorting handles the antimeridian',()=>{\n const batch=[{id:'far',geometry:{coordinates:[179,0]}},{id:'across',geometry:{coordinates:[-179.999,0]}}];assert.equal(nearestNearbyImages(batch,0,179.999,'main')[0].id,'across');\n});\n"
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
              "label": "Nearby alignment and distance order 1",
              "before": "  mockFetch(t, async (url, options) => { fetched.push({ url, signal: options.signal }); return held.promise; });\n  const viewer = {}, w = new Runtime(); w.accessToken = 'test'; w.mapillaryViewer = viewer;\n  w.state = { imageId: 'A', isLoading: false, jimuMapView: { view: {} } };\n  w.setState = patch => applied.push(patch); w.updateProfileIndicator = () => {};\n  w._liveSequenceFrames = { resolve: async () => null };\n  const pending = w.checkForTimeTravel('A');\n  const image = bindCallback(callback('this.mapillaryViewer.on', 'image'), w, { profileEventViewer: viewer });\n",
              "after": "  mockFetch(t, async (url, options) => { fetched.push({ url, signal: options.signal }); return held.promise; });\n  const viewer = {}, w = new Runtime(); w.accessToken = 'test'; w.mapillaryViewer = viewer;\n  w.state = { imageId: 'A', isLoading: false, jimuMapView: { view: {} } };\n  w.setState = patch => applied.push(patch); w.updateProfileIndicator = () => {}; w.highlightNearbyPin = image => assert.equal(image,null);\n  w._liveSequenceFrames = { resolve: async () => null };\n  const pending = w.checkForTimeTravel('A');\n  const image = bindCallback(callback('this.mapillaryViewer.on', 'image'), w, { profileEventViewer: viewer });\n"
            },
            {
              "label": "Nearby alignment and distance order 2",
              "before": "    _liveSequenceFrames: { resolve: async image => { resolved.push(image.id); return null; } },\n    _backgroundRequests: { setPaused: paused => queueChanges.push(paused) },\n    updateProfileIndicator() {},\n    setState() { throw new Error('An obsolete event must not update the current selection'); },\n  };\n  const image = bindCallback(callback('this.mapillaryViewer.on', 'image'), w, { profileEventViewer: viewer });\n",
              "after": "    _liveSequenceFrames: { resolve: async image => { resolved.push(image.id); return null; } },\n    _backgroundRequests: { setPaused: paused => queueChanges.push(paused) },\n    updateProfileIndicator() {},\n    highlightNearbyPin(image) { assert.equal(image,null); },\n    setState() { throw new Error('An obsolete event must not update the current selection'); },\n  };\n  const image = bindCallback(callback('this.mapillaryViewer.on', 'image'), w, { profileEventViewer: viewer });\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/nearbyCoverageAnchor.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst root=path.join(__dirname,'..'),source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=name=>widget.members.find(n=>n.name?.getText(sf)===name).getText(sf),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}},tick=()=>new Promise(r=>setImmediate(r));\nfunction fixture(){const draws=[],ids=[],anchors=new Map(),indexes=[],view={map:{}},layer={},context={view,layer,revision:1,enabled:true,individual:true};class Highlight{clear(){draws.push(['clear'])}update(view,modules,state,img,anchor){draws.push([img?.id||null,anchor])}}\n const Harness=new Function('NearbyImageHighlight','nearbyImagePose','ZOOM','nativeImageAnchor','VectorTile','Pbf',compile('class Harness{'+['highlightNearbyPin','resolveNearbyPreviewAnchor','getCoverageDisplayPosition'].map(method).join('\\n')+'};return Harness;'))(Highlight,()=>({lon:1,lat:2,heading:90}),{TILE_FETCH:14},(...args)=>{ids.push(args.at(-1));return{x:7,y:8}},class{},class{}),w=new Harness();w.props={state:'OPENED'};w.state={imageId:'main',turboModeActive:true,jimuMapView:{view}};w.accessToken='test';w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p,{longitude:p.x,latitude:p.y})}}};w.coverageSelectionContext=()=>context;w._coverageSelectionTargets={anchor:(ctx,id)=>anchors.get(id),retain:(ctx,id,point)=>anchors.set(id,{lon:point.longitude,lat:point.latitude,geometry:point})};w._sequenceTileIndex={has:()=>true};w._turboTileCache={snapshot:()=>[],get:()=>new ArrayBuffer(8)};w.getSequenceTileIndex=()=>{const task=deferred();indexes.push(task);return task.promise};w.runSequenceBackground=()=>assert.fail('warm hover should not fetch');w.log=()=>{};return {w,draws,ids,indexes,anchors,context,view}}\ntest('Nearby aligns to the exact retained coverage ID before showing its preview',async()=>{const x=fixture();x.w.highlightNearbyPin({id:'nearby'});assert(!x.draws.some(draw=>draw[0]==='nearby'));x.indexes[0].resolve({});await tick();assert.deepEqual(x.ids,['nearby']);assert.equal(x.draws.at(-1)[0],'nearby');assert.equal(x.draws.at(-1)[1].lon,7);assert.equal(x.draws.at(-1)[1].lat,8);assert(x.anchors.has('nearby'));x.w.highlightNearbyPin({id:'nearby'});assert.equal(x.indexes.length,1)});\ntest('new hover wins even if the earlier tile index finishes last',async()=>{const x=fixture();x.w.highlightNearbyPin({id:'old'});x.w.highlightNearbyPin({id:'new'});x.indexes[1].resolve({});await tick();x.indexes[0].resolve({});await tick();assert.deepEqual(x.ids,['new']);assert.equal(x.draws.at(-1)[0],'new');assert(!x.anchors.has('old'))});\ntest('leaving the thumbnail or changing coverage invalidates pending preview work',async()=>{for(const cancel of ['leave','coverage']){const x=fixture();x.w.highlightNearbyPin({id:'nearby'});if(cancel==='leave')x.w.highlightNearbyPin(null);else x.context.revision++;x.indexes[0].resolve({});await tick();assert(!x.draws.some(draw=>draw[0]==='nearby'));}});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'nearby-alignment-distance-order-';

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
    if (manifest.installer !== 'nearby-alignment-distance-order' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-nearby-alignment-distance-order.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Nearby alignment and distance order confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'nearby-alignment-distance-order', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Nearby alignment and distance order confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
