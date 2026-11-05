#!/usr/bin/env node
'use strict';
/**
 * Route simulation preview confirmation. Compatible current v6 sources.
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
      "file": "src/features/coverage/CoverageAnalysisTrigger.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Route simulation preview 1",
              "before": "          )}\n        </button>\n      </div>\n      {!canRun && !coverageAnalysisLoading && <div role=\"status\" style={{ fontSize: 8, lineHeight: 1.35, color: \"#b5ccbf\", padding: \"3px 0\" }}>\n        {belowZoom ? t('uiMoveCloserToAnalyseTheseStreets') : t('uiWaitingForCoverageToFinishLoading')}\n      </div>}\n    </React.Fragment>\n",
              "after": "          )}\n        </button>\n      </div>\n      {!canRun && !coverageAnalysisLoading && <div role=\"status\" style={{ fontSize: 8, lineHeight: 1.35, color: \"#b5ccbf\", padding: \"3px 4px\", boxSizing: \"border-box\" }}>\n        {belowZoom ? t('uiMoveCloserToAnalyseTheseStreets') : t('uiWaitingForCoverageToFinishLoading')}\n      </div>}\n    </React.Fragment>\n"
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
              "label": "Route simulation preview 1",
              "before": "/** @file Shared prop types for Mapillary Explorer sub-components */\n\nimport { JimuMapView } from \"jimu-arcgis\";\n",
              "after": "import type { RoutePreviewHost } from '../features/routing/RoutePreviewSimulation';\n/** @file Shared prop types for Mapillary Explorer sub-components */\n\nimport { JimuMapView } from \"jimu-arcgis\";\n"
            },
            {
              "label": "Route simulation preview 2",
              "before": "\n// InfoBox props\nexport interface InfoBoxProps {\n  detectionToolsRequest?: number;\n  // visibility / config\n  hideInfoBox?: boolean;\n",
              "after": "\n// InfoBox props\nexport interface InfoBoxProps {\n  routePreviewHost?: RoutePreviewHost;\n  detectionToolsRequest?: number;\n  // visibility / config\n  hideInfoBox?: boolean;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/InfoBox.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Route simulation preview 1",
              "before": "          {(coverageAnalysisLoading || coverageResult) && (\n            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}\n              renderRoutingControls={() => (coverageSegmentsVisible && (\n                        <RouteControls runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />\n                      ))} />\n          )}\n\n",
              "after": "          {(coverageAnalysisLoading || coverageResult) && (\n            <CoverageAnalysisResults coverageAnalysisLoading={coverageAnalysisLoading} coverageAnalysisProgress={coverageAnalysisProgress} onCancelCoverageAnalysis={onCancelCoverageAnalysis} coverageResult={coverageResult} coverageSegmentsVisible={coverageSegmentsVisible} onToggleCoverageSegments={onToggleCoverageSegments} onDismissCoverageResult={onDismissCoverageResult}\n              renderRoutingControls={() => (coverageSegmentsVisible && (\n                        <RouteControls routePreviewHost={this.props.routePreviewHost} runtimeRoutingEngine={runtimeRoutingEngine} isGeneratingRoute={isGeneratingRoute} onChangeRuntimeRoutingEngine={onChangeRuntimeRoutingEngine} runtimeTravelMode={runtimeTravelMode} onChangeRuntimeTravelMode={onChangeRuntimeTravelMode} travelModeAvailability={travelModeAvailability} routeData={routeData} routePickMode={routePickMode} onSetRoutePickMode={onSetRoutePickMode} routeStartPoint={routeStartPoint} routeEndPoint={routeEndPoint} onResetRoutePoints={onResetRoutePoints} routeSpareMinutes={routeSpareMinutes} onChangeSpareMinutes={onChangeSpareMinutes} onGenerateRoute={onGenerateRoute} routeGenerationProgress={routeGenerationProgress} onDownloadRouteGPX={onDownloadRouteGPX} />\n                      ))} />\n          )}\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/routing/RouteControls.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Route simulation preview 1",
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\n/** Routing controls and extra-time picker UI. Route services, analysis and waypoint state remain parent-owned. */\nimport { OwnedMessage } from '../../i18n/WidgetLocale';\nimport { useWidgetLocale, WidgetLocaleContext } from '../../i18n/WidgetLocale';\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { RoutePreviewControls } from './RoutePreviewControls';\n/** Routing controls and extra-time picker UI. Route services, analysis and waypoint state remain parent-owned. */\nimport { OwnedMessage } from '../../i18n/WidgetLocale';\nimport { useWidgetLocale, WidgetLocaleContext } from '../../i18n/WidgetLocale';\n"
            },
            {
              "label": "Route simulation preview 2",
              "before": "}\n\n\nexport type RouteControlsProps = Pick<InfoBoxProps, 'runtimeRoutingEngine' | 'isGeneratingRoute' | 'onChangeRuntimeRoutingEngine' | 'runtimeTravelMode' | 'onChangeRuntimeTravelMode' | 'travelModeAvailability' | 'routeData' | 'routePickMode' | 'onSetRoutePickMode' | 'routeStartPoint' | 'routeEndPoint' | 'onResetRoutePoints' | 'routeSpareMinutes' | 'onChangeSpareMinutes' | 'onGenerateRoute' | 'routeGenerationProgress' | 'onDownloadRouteGPX'>;\n\n/** Render route drafting/progress/results and forward original callbacks; no requests or route calculation occur here. */\nexport const RouteControls: React.FC<RouteControlsProps> = props => {\n",
              "after": "}\n\n\nexport type RouteControlsProps = Pick<InfoBoxProps, 'routePreviewHost' | 'runtimeRoutingEngine' | 'isGeneratingRoute' | 'onChangeRuntimeRoutingEngine' | 'runtimeTravelMode' | 'onChangeRuntimeTravelMode' | 'travelModeAvailability' | 'routeData' | 'routePickMode' | 'onSetRoutePickMode' | 'routeStartPoint' | 'routeEndPoint' | 'onResetRoutePoints' | 'routeSpareMinutes' | 'onChangeSpareMinutes' | 'onGenerateRoute' | 'routeGenerationProgress' | 'onDownloadRouteGPX'>;\n\n/** Render route drafting/progress/results and forward original callbacks; no requests or route calculation occur here. */\nexport const RouteControls: React.FC<RouteControlsProps> = props => {\n"
            },
            {
              "label": "Route simulation preview 3",
              "before": "              </option>\n            </select>\n          </div>\n        </div>\n      )}\n      {!routeData ? (\n",
              "after": "              </option>\n            </select>\n          </div>\n          <RoutePreviewControls route={routeData} host={props.routePreviewHost}/>\n        </div>\n      )}\n      {!routeData ? (\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Route simulation preview 1",
              "before": "  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this._nearbyDiscovery?.cancel();\n      this.highlightNearbyPin?.(null);\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n",
              "after": "  private claimCurrentImagePresentation(view: __esri.MapView | __esri.SceneView): void {\n    if(!view?.map||view.destroyed||this.props.visible===false||this.props.state==='CLOSED')return;\n    this._currentImagePresentation.activate(view.map,String(this.props.id),()=>{\n      this._stopRoutePreview?.();\n      this._nearbyDiscovery?.cancel();\n      this.highlightNearbyPin?.(null);\n      this._nativeImageAnchorAbort?.abort();this._nativeImageAnchorAbort=null;this._nativeImageAnchorKey='';\n"
            },
            {
              "label": "Route simulation preview 2",
              "before": "        this.applyCustomCameraAngle();\n      }\n      const newId = String(event.image.id);\n      this._detectionAbort?.abort();\n      this._timeTravelAvailability?.cancelUnless(newId);\n      this._nearbyDiscovery?.cancel();\n",
              "after": "        this.applyCustomCameraAngle();\n      }\n      const newId = String(event.image.id);\n      this._stopRoutePreview?.();\n      this._detectionAbort?.abort();\n      this._timeTravelAvailability?.cancelUnless(newId);\n      this._nearbyDiscovery?.cancel();\n"
            },
            {
              "label": "Route simulation preview 3",
              "before": "  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {\n    this._nearbyDiscovery?.cancel();\n    this.highlightNearbyPin?.(null);\n    if(this._sharedStartupImageId&&String(startImageId)!==this._sharedStartupImageId){\n      this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n      (this.state.jimuMapView?.view as any)?.animation?.stop();\n",
              "after": "  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {\n    this._nearbyDiscovery?.cancel();\n    this.highlightNearbyPin?.(null);\n    this._stopRoutePreview?.();\n    if(this._sharedStartupImageId&&String(startImageId)!==this._sharedStartupImageId){\n      this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n      (this.state.jimuMapView?.view as any)?.animation?.stop();\n"
            },
            {
              "label": "Route simulation preview 4",
              "before": "  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n",
              "after": "  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._stopRoutePreview?.();\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    if(resetState||fullRemove)this.clearSelectedMapFeature?.();\n    this._currentImagePresentation?.release();\n"
            },
            {
              "label": "Route simulation preview 5",
              "before": "  };\n\n  // Exports the generated route as a GPX file.\n  private downloadRouteGPX = () => downloadCaptureRouteGPX(this.state.routeData);\n\n  /**\n",
              "after": "  };\n\n  // Exports the generated route as a GPX file.\n  private _stopRoutePreview:(()=>void)|null=null;\n  private downloadRouteGPX = () => downloadCaptureRouteGPX(this.state.routeData);\n\n  /**\n"
            },
            {
              "label": "Route simulation preview 6",
              "before": "          onGenerateRoute={this.generateCaptureRoute}\n          onClearRoute={this.clearCaptureRoute}\n          onDownloadRouteGPX={this.downloadRouteGPX}\n          routeStartPoint={this.state.routeStartPoint}\n          routeEndPoint={this.state.routeEndPoint}\n          routeSpareMinutes={this.state.routeSpareMinutes}\n",
              "after": "          onGenerateRoute={this.generateCaptureRoute}\n          onClearRoute={this.clearCaptureRoute}\n          onDownloadRouteGPX={this.downloadRouteGPX}\n          routePreviewHost={this.state.jimuMapView?.view&&this.ArcGISModules?{\n            view:this.state.jimuMapView.view,interactionElement:this.viewerContainer.current,registerStop:stop=>{this._stopRoutePreview=stop;return()=>{if(this._stopRoutePreview===stop)this._stopRoutePreview=null;};},createLayer:properties=>new this.ArcGISModules.GraphicsLayer(properties),\n            createGraphic:properties=>new this.ArcGISModules.Graphic(properties)}:undefined}\n          routeStartPoint={this.state.routeStartPoint}\n          routeEndPoint={this.state.routeEndPoint}\n          routeSpareMinutes={this.state.routeSpareMinutes}\n"
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
              "label": "Route simulation preview 1",
              "before": " const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n assert.equal(await exportButton.innerText(),'Export Data');assert.equal(await exportButton.locator('span').evaluate(node=>getComputedStyle(node).whiteSpace),'nowrap');assert.equal(await labelsButton.count(),0);await page.evaluate(()=>window.renderInfo({detectionsActive:true}));await labelsButton.waitFor({state:'visible'});const bottomInset=await labelsButton.evaluate(node=>{const group=node.parentElement;return group.getBoundingClientRect().bottom-node.getBoundingClientRect().bottom});assert(bottomInset>=4);checks++;\n\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n",
              "after": " const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n await page.evaluate(()=>window.renderInfo({turboPointsAvailable:false}));const help=page.locator('.mly-coverage-analysis-trigger + [role=\"status\"]');await help.waitFor({state:'visible'});const aligned=await help.evaluate(node=>{const button=node.previousElementSibling.querySelector('button');return Math.abs(node.getBoundingClientRect().left+parseFloat(getComputedStyle(node).paddingLeft)-button.getBoundingClientRect().left)<1});assert.equal(aligned,true);checks++;\n\n assert.equal(await exportButton.innerText(),'Export Data');assert.equal(await exportButton.locator('span').evaluate(node=>getComputedStyle(node).whiteSpace),'nowrap');assert.equal(await labelsButton.count(),0);await page.evaluate(()=>window.renderInfo({detectionsActive:true}));await labelsButton.waitFor({state:'visible'});const bottomInset=await labelsButton.evaluate(node=>{const group=node.parentElement;return group.getBoundingClientRect().bottom-node.getBoundingClientRect().bottom});assert(bottomInset>=4);checks++;\n\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/routing/RoutePreviewSimulation.ts",
      "content": "/** Local geometry/time simulation only: no GPS, imagery or routing requests. */\nexport interface RoutePreviewHost {view:any;interactionElement?:HTMLElement|null;registerStop?:(stop:()=>void)=>()=>void;createLayer(properties:any):any;createGraphic(properties:any):any;}\nexport type PreviewState='idle'|'playing'|'paused'|'finished';\nexport interface PreviewProgress {state:PreviewState;progress:number;}\nexport function prepareRoutePreview(geojson:any){\n const geometry=geojson?.type==='Feature'?geojson.geometry:geojson;\n if(geometry?.type!=='LineString'||!Array.isArray(geometry.coordinates)||geometry.coordinates.length<2)throw new Error('A valid A-to-B route is required.');\n const points=geometry.coordinates.map((p:any)=>{\n  if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>90)throw new Error('Route contains invalid coordinates.');\n  return [p[0],p[1]] as [number,number];\n });\n const distances:number[]=[0];\n for(let i=1;i<points.length;i++){\n  const a=points[i-1],b=points[i],r=Math.PI/180,h=Math.sin((b[1]-a[1])*r/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin((b[0]-a[0])*r/2)**2;\n  distances.push(distances[i-1]+12742000*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h)))));\n }\n const length=distances[distances.length-1];if(!(length>0))throw new Error('Route has no travel distance.');\n return {length,sample(progress:number){\n  const distance=Math.max(0,Math.min(1,progress))*length;\n  let low=1,high=points.length-1;while(low<high){const mid=(low+high)>>1;if(distances[mid]<distance)low=mid+1;else high=mid;}\n  while(low<points.length-1&&distances[low]===distances[low-1])low++;\n  const a=points[low-1],b=points[low],span=distances[low]-distances[low-1],fraction=span>0?(distance-distances[low-1])/span:1;\n  const delta=((b[0]-a[0]+540)%360)-180,r=Math.PI/180;\n  const bearing=(Math.atan2(Math.sin(delta*r)*Math.cos(b[1]*r),Math.cos(a[1]*r)*Math.sin(b[1]*r)-Math.sin(a[1]*r)*Math.cos(b[1]*r)*Math.cos(delta*r))*180/Math.PI+360)%360;\n  return {lon:((a[0]+delta*fraction+540)%360)-180,lat:a[1]+(b[1]-a[1])*fraction,bearing};\n }};\n}\nexport class RoutePreviewSimulation {\n private plan:ReturnType<typeof prepareRoutePreview>;\n private map:any=null;private layer:any=null;private graphic:any=null;private frame:number|null=null;private handles:any[]=[];\n private elapsed=0;private last:number|null=null;private lastDraw=-Infinity;private lastFollow=-Infinity;\n private state:PreviewState='idle';private duration:number;\n speed=10;follow=true;\n constructor(private host:RoutePreviewHost,geojson:any,duration:number,private notify:(progress:PreviewProgress)=>void,\n  private clock={request:(callback:FrameRequestCallback)=>requestAnimationFrame(callback),cancel:(id:number)=>cancelAnimationFrame(id)}){\n  this.plan=prepareRoutePreview(geojson);this.duration=Number.isFinite(duration)&&duration>0?duration:this.plan.length/13.89;\n }\n private emit(){this.notify({state:this.state,progress:Math.min(1,this.elapsed/this.duration)});}\n play():void {\n  if(this.state==='playing')return;\n  const view=this.host.view;if(!view?.map||view.destroyed)throw new Error('Map is not ready for preview.');\n  if(this.layer&&this.map!==view.map)this.stop();\n  if(this.state==='finished')this.elapsed=0;\n  if(!this.layer){\n   try{\n    this.map=view.map;\n    this.layer=this.host.createLayer({id:'mapillary-route-simulation',title:'Route simulation',listMode:'hide',elevationInfo:{mode:'on-the-ground'}});\n    const p=this.plan.sample(this.elapsed/this.duration);\n    this.graphic=this.host.createGraphic({geometry:{type:'point',longitude:p.lon,latitude:p.lat,spatialReference:{wkid:4326}},\n     symbol:view.type==='3d'?{type:'point-3d',symbolLayers:[{type:'icon',resource:{primitive:'circle'},material:{color:'#35c9ed'},size:12,outline:{color:'white',size:2}}]}:\n      {type:'simple-marker',style:'triangle',color:'#35c9ed',size:14,angle:p.bearing,outline:{color:'white',width:1.5}}});\n    this.layer.add(this.graphic);view.map.add(this.layer);\n    for(const event of ['pointer-down','drag','mouse-wheel']){const handle=view.on?.(event,()=>this.pause());if(handle)this.handles.push(handle);}\n    if(this.host.registerStop)this.handles.push({remove:this.host.registerStop(()=>this.stop())});\n    if(this.host.interactionElement){const element=this.host.interactionElement,interact=()=>this.pause();element.addEventListener('pointerdown',interact,{passive:true});this.handles.push({remove:()=>element.removeEventListener('pointerdown',interact)});}\n    const document=view.container?.ownerDocument;\n    if(document){const hidden=()=>{if(document.visibilityState==='hidden')this.pause();};document.addEventListener('visibilitychange',hidden);this.handles.push({remove:()=>document.removeEventListener('visibilitychange',hidden)});}\n   }catch(error){this.stop();throw error;}\n  }\n  this.state='playing';this.last=null;this.lastDraw=-Infinity;this.lastFollow=-Infinity;this.emit();\n  const tick=(now:number)=>{\n   this.frame=null;if(this.state!=='playing')return;\n   if(view.destroyed||view.map!==this.map||!this.layer){this.stop();return;}\n   if(this.last!==null)this.elapsed=Math.min(this.duration,this.elapsed+Math.min(250,Math.max(0,now-this.last))/1000*this.speed);\n   this.last=now;\n   if(now-this.lastDraw>=100||this.elapsed>=this.duration){\n    this.lastDraw=now;const p=this.plan.sample(this.elapsed/this.duration);\n    this.graphic.geometry={type:'point',longitude:p.lon,latitude:p.lat,spatialReference:{wkid:4326}};\n    if(view.type==='2d'){const symbol=this.graphic.symbol.clone?.()??{...this.graphic.symbol};symbol.angle=p.bearing;this.graphic.symbol=symbol;}\n    if(this.follow&&now-this.lastFollow>=250){\n     this.lastFollow=now;\n     try{const move=view.goTo(view.type==='3d'?{center:[p.lon,p.lat],heading:p.bearing}:{center:[p.lon,p.lat]},{animate:false});Promise.resolve(move).catch(()=>{});}catch{/* A map interaction can cancel following. */}\n    }\n    this.emit();\n   }\n   if(this.state!=='playing')return;\n   if(this.elapsed>=this.duration){this.state='finished';this.emit();return;}\n   this.frame=this.clock.request(tick);\n  };\n  this.frame=this.clock.request(tick);\n }\n pause():void {if(this.state!=='playing')return;this.state='paused';if(this.frame!==null)this.clock.cancel(this.frame);this.frame=null;this.last=null;this.emit();}\n stop():void {\n  if(this.frame!==null)this.clock.cancel(this.frame);this.frame=null;\n  for(const handle of this.handles)handle.remove();this.handles=[];\n  if(this.layer){try{this.map?.remove(this.layer);}catch{}try{this.layer.destroy();}catch{}}\n  this.map=null;this.layer=null;this.graphic=null;this.elapsed=0;this.last=null;this.state='idle';this.emit();\n }\n}\n"
    },
    {
      "file": "src/features/routing/RoutePreviewControls.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { RoutePreviewSimulation } from './RoutePreviewSimulation';\nimport type { RoutePreviewHost, PreviewProgress } from './RoutePreviewSimulation';\nimport type { RouteData } from '../../components/types';\nconst button:React.CSSProperties={font:'inherit',fontSize:9,padding:'4px 6px',minHeight:26,border:'1px solid #648b73',borderRadius:4,background:'#214233',color:'#e1eee5',cursor:'pointer'};\nexport function RoutePreviewControls({route,host}:{route:RouteData;host?:RoutePreviewHost}){\n const {owned:text}=useWidgetLocale(),controller=React.useRef<RoutePreviewSimulation|null>(null),mounted=React.useRef(true);\n const [progress,setProgress]=React.useState<PreviewProgress>({state:'idle',progress:0}),[error,setError]=React.useState(''),[speed,setSpeed]=React.useState(10),[follow,setFollow]=React.useState(true);\n React.useLayoutEffect(()=>{\n  mounted.current=true;setProgress({state:'idle',progress:0});setError('');\n  return()=>{mounted.current=false;controller.current?.stop();controller.current=null;};\n },[route,host?.view]);\n const play=()=>{if(!host)return;try{\n  if(!controller.current)controller.current=new RoutePreviewSimulation(host,route.geojson,route.duration,value=>{if(mounted.current)setProgress(value);});\n  controller.current.speed=speed;controller.current.follow=follow;controller.current.play();setError('');\n }catch(error){controller.current?.stop();controller.current=null;setError((error as Error).message);}};\n return <div role=\"group\" aria-label={text('Route simulation')} style={{display:'grid',gap:5,padding:6,marginTop:6,border:'1px solid #49695a',borderRadius:5,color:'#d3e2d9',fontSize:9}}>\n  <strong>{text('Route simulation')}</strong><small>{text('Preview only \u00b7 no GPS')}</small>\n  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>\n   <button type=\"button\" style={button} disabled={!host||progress.state==='playing'} onClick={play}>{text(progress.state==='paused'?'Resume':progress.state==='finished'?'Replay A \u2192 B':'Preview A \u2192 B')}</button>\n   {progress.state==='playing'&&<button type=\"button\" style={button} onClick={()=>controller.current?.pause()}>{text('Pause')}</button>}\n   {progress.state!=='idle'&&<button type=\"button\" style={button} onClick={()=>controller.current?.stop()}>{text('Stop')}</button>}\n  </div>\n  <label style={{display:'grid',gap:3}}>{text('Preview speed')}<select aria-label={text('Preview speed')} style={{...button,width:'100%'}} value={speed} onChange={event=>{const value=Number(event.target.value);setSpeed(value);if(controller.current)controller.current.speed=value;}}>{[1,5,10,25,50].map(value=><option key={value} value={value}>{value}\u00d7</option>)}</select></label>\n  <label style={{display:'flex',gap:5,alignItems:'center'}}><input type=\"checkbox\" checked={follow} onChange={event=>{setFollow(event.target.checked);if(controller.current)controller.current.follow=event.target.checked;}}/>{text('Follow on map')}</label>\n  <span role=\"status\">{text(progress.state==='playing'?'Playing':progress.state==='paused'?'Paused':progress.state==='finished'?'Finished':'Ready')}</span>\n  <progress aria-label={text('Route progress')} max={1} value={progress.progress} style={{width:'100%',height:6}}/><span aria-hidden=\"true\">{Math.round(progress.progress*100)}%</span>\n  {error&&<span role=\"alert\">{text(error)}</span>}\n </div>;\n}\n"
    },
    {
      "file": "tests/routePreviewSimulation.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};\nnew Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/routing/RoutePreviewSimulation.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m,m.exports);const {prepareRoutePreview,RoutePreviewSimulation}=m.exports;\nconst route={type:'LineString',coordinates:[[0,0],[.01,0],[.01,.01]]};\ntest('distance-based sampling starts at A, ends at B and turns along the full route',()=>{const plan=prepareRoutePreview(route);assert(Math.abs(plan.sample(0).lon)<1e-8);assert(Math.abs(plan.sample(1).lat-.01)<1e-8);assert(Math.abs(plan.sample(.25).lon-.005)<1e-5);assert(Math.abs(plan.sample(.25).bearing-90)<1e-5);assert(Math.abs(plan.sample(.75).bearing)<1e-5)});\ntest('invalid or stationary routes are rejected and dateline crossings remain short',()=>{assert.throws(()=>prepareRoutePreview({type:'LineString',coordinates:[[0,0],[NaN,0]]}));assert.throws(()=>prepareRoutePreview({type:'LineString',coordinates:[[0,0],[0,0]]}));const plan=prepareRoutePreview({type:'LineString',coordinates:[[179.9,0],[-179.9,0]]});assert(plan.length<30000);assert(Math.abs(plan.sample(.5).lon)>179.9)});\nfunction fixture(){let callback,serial=0,layer;const states=[],layers=[],handlers=new Map(),moves=[],view={type:'3d',map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},on:(name,callback)=>{handlers.set(name,callback);return{remove:()=>handlers.delete(name)}},goTo:(...args)=>{moves.push(args);return Promise.resolve()}};const host={view,createLayer:p=>(layer={...p,graphics:[],add(g){this.graphics.push(g)},destroy(){this.destroyed=true}}),createGraphic:p=>p};const preview=new RoutePreviewSimulation(host,route,10,value=>states.push(value),{request:cb=>{callback=cb;return++serial},cancel:()=>{callback=null}});return {preview,view,layers,states,handlers,moves,tick:t=>callback?.(t),layer:()=>layer}}\ntest('simulation plays, pauses/resumes without time jump, and stop removes only its own marker/listeners',()=>{const x=fixture();x.preview.speed=1;x.preview.play();x.tick(0);x.tick(100);assert.equal(x.layers.length,1);assert(x.states.at(-1).progress>0);assert.equal(x.layer().elevationInfo.mode,'on-the-ground');x.preview.pause();const progress=x.states.at(-1).progress;x.tick(10000);assert.equal(x.states.at(-1).progress,progress);x.preview.play();x.tick(20000);assert.equal(x.states.at(-1).progress,progress);x.tick(20100);assert(x.states.at(-1).progress>progress);x.preview.stop();assert.equal(x.layers.length,0);assert.equal(x.handlers.size,0);assert.equal(x.layer().destroyed,true)});\ntest('manual map interaction pauses follow and finish reaches B',()=>{const x=fixture();x.preview.play();x.handlers.get('pointer-down')();assert.equal(x.states.at(-1).state,'paused');x.preview.speed=50;x.preview.play();x.tick(0);x.tick(250);assert.equal(x.states.at(-1).state,'finished');assert.equal(x.layer().graphics[0].geometry.latitude,.01);x.preview.stop()});\ntest('destroyed view stops simulation and follow can be disabled',()=>{const x=fixture();x.preview.follow=false;x.preview.play();x.tick(0);assert.equal(x.moves.length,0);x.view.destroyed=true;x.tick(100);assert.equal(x.layers.length,0);assert.equal(x.states.at(-1).state,'idle')});\n\ntest('map replacement removes the marker from its original map',()=>{const x=fixture();x.preview.play();x.view.map={add(){},remove(){assert.fail('must not remove from replacement map')}};x.tick(0);assert.equal(x.layers.length,0);assert.equal(x.states.at(-1).state,'idle')});\ntest('foreground stop registration is released with simulation resources',()=>{const x=fixture();let stop,removed=false;const host=x.preview.host;host.registerStop=callback=>{stop=callback;return()=>{removed=true}};x.preview.play();assert.equal(typeof stop,'function');stop();assert.equal(x.layers.length,0);assert.equal(removed,true)});\n"
    },
    {
      "file": "tests/routePreviewControls.browser.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst compile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/routing',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [240,393]){const page=await browser.newPage({viewport:{width:Math.max(393,width),height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<div id=\"root\" style=\"width:'+width+'px;background:#14251d\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(({engine,controls})=>{const a={exports:{}};new Function('module','exports',engine)(a,a.exports);const b={exports:{}};new Function('require','module','exports',controls)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.includes('WidgetLocale')?{useWidgetLocale:()=>({owned:text=>text})}:a.exports,b,b.exports);const Component=b.exports.RoutePreviewControls;window.layers=[];window.handlers=new Map();window.host={view:{type:'2d',map:{add:layer=>layers.push(layer),remove:layer=>layers.splice(layers.indexOf(layer),1)},on:(name,callback)=>{handlers.set(name,callback);return{remove:()=>handlers.delete(name)}},goTo:()=>Promise.resolve(),container:{ownerDocument:document}},createLayer:props=>({...props,add(){},destroy(){}}),createGraphic:props=>props};window.route={duration:100,geojson:{type:'LineString',coordinates:[[1,2],[1.001,2]]}};window.root=ReactDOM.createRoot(document.getElementById('root'));window.render=()=>root.render(React.createElement(Component,{route,host}));render();},{engine:compile('RoutePreviewSimulation.ts'),controls:compile('RoutePreviewControls.tsx')});\n await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();assert.equal(await page.evaluate(()=>layers.length),1);checks++;\n await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.getByLabel('Preview speed',{exact:true}).selectOption('25');await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();checks++;\n await page.evaluate(()=>handlers.get('pointer-down')());await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.getByRole('button',{name:'Stop',exact:true}).click();assert.equal(await page.evaluate(()=>layers.length),0);checks++;\n await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>{window.route={...route,geojson:{type:'LineString',coordinates:[[1,2],[1.002,2]]}};render();});await page.waitForFunction(()=>layers.length===0);await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).waitFor();assert.equal(await page.evaluate(()=>layers.length),0);checks++;\n assert.equal(await page.getByRole('group',{name:'Route simulation',exact:true}).evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>root.unmount());assert.equal(await page.evaluate(()=>layers.length),0);assert.equal(await page.evaluate(()=>handlers.size),0);assert.deepEqual(errors,[]);checks++;await page.close();}console.log(checks+' route preview Chromium checks passed.');}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'route-simulation-preview-';

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
    if (manifest.installer !== 'route-simulation-preview' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-route-simulation-preview.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Route simulation preview confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'route-simulation-preview', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Route simulation preview confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
