#!/usr/bin/env node
'use strict';
/** Viewport image follow installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx viewport follow 1",
          "before": "import { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport \"mapillary-js/dist/mapillary.css\";\nimport { InfoBox } from \"../components/InfoBox\";\nimport { sceneFollowCamera } from '../features/imagery/sceneFollowCamera';\nimport { FilterBar } from \"../components/FilterBar\";\nimport { ImageryLoading } from \"../components/ImageryLoading\";\n",
          "after": "import { Viewer, OutlineTag, PolygonGeometry, geodeticToEnu, RenderPass } from \"mapillary-js\";\nimport \"mapillary-js/dist/mapillary.css\";\nimport { InfoBox } from \"../components/InfoBox\";\nimport { shouldRecenterImage } from \"../features/imagery/imageFollowPolicy\";\nimport { sceneFollowCamera } from '../features/imagery/sceneFollowCamera';\nimport { FilterBar } from \"../components/FilterBar\";\nimport { ImageryLoading } from \"../components/ImageryLoading\";\n"
        },
        {
          "label": "src/runtime/widget.tsx viewport follow 2",
          "before": "  isFetchingAlternates: boolean;\n  targetDetectionId: string | null;\n  syncHeading: boolean;\n  imageryRepresentative?: boolean;\n  toastMessage?: React.ReactNode;\n  isMeasureMode: boolean;\n",
          "after": "  isFetchingAlternates: boolean;\n  targetDetectionId: string | null;\n  syncHeading: boolean;\n  lockToImage: boolean;\n  imageryRepresentative?: boolean;\n  toastMessage?: React.ReactNode;\n  isMeasureMode: boolean;\n"
        },
        {
          "label": "src/runtime/widget.tsx viewport follow 3",
          "before": "    isFetchingAlternates: false,\n    targetDetectionId: null,\n    syncHeading: false,\n    isLassoMode: false,\n    lassoPolygon: [],\n    lassoSelectedObjectIds: [],\n",
          "after": "    isFetchingAlternates: false,\n    targetDetectionId: null,\n    syncHeading: false,\n    lockToImage: false,\n    isLassoMode: false,\n    lassoPolygon: [],\n    lassoSelectedObjectIds: [],\n"
        },
        {
          "label": "src/runtime/widget.tsx viewport follow 4",
          "before": "      if (view && view.type === \"3d\" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading) {\n        const activeImg = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n\n        if (activeImg) {\n          this.navigateMapView(view,\n            {\n              center: [activeImg.lon, activeImg.lat],\n",
          "after": "      if (view && view.type === \"3d\" && this.props.config.syncMapWithImage === true && !this._isFlyInActive && this.state.syncHeading) {\n        const activeImg = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n\n        if (activeImg && this.state.lockToImage) {\n          this.navigateMapView(view,\n            {\n              center: [activeImg.lon, activeImg.lat],\n"
        },
        {
          "label": "src/runtime/widget.tsx viewport follow 5",
          "before": "          void this.refreshLocalSequence();\n\n          // 3. Map Synchronization Logic (With Offset)\n          if (this.props.config.syncMapWithImage === true && !this._isFlyInActive) {\n            const position = this.props.config.syncMapPosition || \"center\";\n            // Profile tracking follows the image position without letting goTo resolve a new zoom.\n            const followScale = view.scale;\n\n            const targetPoint = new this.ArcGISModules.Point({\n              longitude: activeImg.lon,\n              latitude: activeImg.lat,\n            });\n\n            // 3D SCENE: GPS NAVIGATION MODE\n            if (view.type === \"3d\") {\n              const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);\n              if (camera) this.navigateMapView(view, camera, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n            }\n            // 2D MAP MODE\n            else {\n              // Standard Center\n              if (position === \"center\") {\n                this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n              }\n              // Offset Logic\n              else {\n                try {\n                  const wmPoint = webMercatorUtils.geographicToWebMercator(targetPoint) as __esri.Point;\n                  const extent = view.extent;\n\n                  if (wmPoint && extent) {\n                    const width = extent.width;\n                    const height = extent.height;\n                    const offsetFactor = 0.25; // 25% shift\n\n                    let newCenterX = wmPoint.x;\n                    let newCenterY = wmPoint.y;\n\n                    if (position === \"east\") {\n                      // Widget Left -> Show point on Right -> Move Camera Left (West)\n                      newCenterX = wmPoint.x - width * offsetFactor;\n                    } else if (position === \"west\") {\n                      // Widget Right -> Show point on Left -> Move Camera Right (East)\n                      newCenterX = wmPoint.x + width * offsetFactor;\n                    } else if (position === \"north\") {\n                      // Widget Bottom -> Show point on Top -> Move Camera Down (South)\n                      newCenterY = wmPoint.y - height * offsetFactor;\n                    } else if (position === \"south\") {\n                      // Widget Top -> Show point on Bottom -> Move Camera Up (North)\n                      newCenterY = wmPoint.y + height * offsetFactor;\n                    }\n\n                    const newCenter = new this.ArcGISModules.Point({\n                      x: newCenterX,\n                      y: newCenterY,\n                      spatialReference: { wkid: 3857 },\n                    });\n\n                    this.navigateMapView(view, { center: newCenter, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n                  } else {\n                    this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n                  }\n                } catch (e) {\n                  this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n                }\n              }\n            }\n          }\n        }\n      });\n\n",
          "after": "          void this.refreshLocalSequence();\n\n          // 3. Map Synchronization Logic (With Offset)\n          if (this.props.config.syncMapWithImage === true) this.syncMapToImage(activeImg, view);\n        }\n      });\n\n"
        },
        {
          "label": "src/runtime/widget.tsx viewport follow 6",
          "before": "    return this._cameraCone ??= new CameraConeGraphics(properties => new this.ArcGISModules.GraphicsLayer(properties));\n  }\n\n  /**\n   * Draws a camera view cone polygon at the given location and bearing.\n   * 2D: flat orange polygon (draped onto layer)\n",
          "after": "    return this._cameraCone ??= new CameraConeGraphics(properties => new this.ArcGISModules.GraphicsLayer(properties));\n  }\n\n  /** Keep visible by default; explicit lock reuses the existing center/direction navigation. */\n  private syncMapToImage(activeImg: { id: string; lon: number; lat: number }, view: __esri.MapView | __esri.SceneView) {\n    const followAnchor = this.getCoverageDisplayPosition(String(activeImg.id), activeImg.lon, activeImg.lat);\n    const followPoint = followAnchor.geometry || new this.ArcGISModules.Point({ longitude: followAnchor.lon, latitude: followAnchor.lat });\n    if (this.props.config.syncMapWithImage === true && !this._isFlyInActive &&\n        shouldRecenterImage(view, followPoint, this.state.lockToImage)) {\n      const position = this.props.config.syncMapPosition || \"center\";\n      // Profile tracking follows the image position without letting goTo resolve a new zoom.\n      const followScale = view.scale;\n\n      const targetPoint = new this.ArcGISModules.Point({\n        longitude: activeImg.lon,\n        latitude: activeImg.lat,\n      });\n\n      // 3D SCENE: GPS NAVIGATION MODE\n      if (view.type === \"3d\") {\n        const camera = sceneFollowCamera(view, activeImg.lon, activeImg.lat);\n        if (camera) this.navigateMapView(view, camera, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n      }\n      // 2D MAP MODE\n      else {\n        // Standard Center\n        if (position === \"center\") {\n          this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n        }\n        // Offset Logic\n        else {\n          try {\n            const wmPoint = webMercatorUtils.geographicToWebMercator(targetPoint) as __esri.Point;\n            const extent = view.extent;\n\n            if (wmPoint && extent) {\n              const width = extent.width;\n              const height = extent.height;\n              const offsetFactor = 0.25; // 25% shift\n\n              let newCenterX = wmPoint.x;\n              let newCenterY = wmPoint.y;\n\n              if (position === \"east\") {\n                // Widget Left -> Show point on Right -> Move Camera Left (West)\n                newCenterX = wmPoint.x - width * offsetFactor;\n              } else if (position === \"west\") {\n                // Widget Right -> Show point on Left -> Move Camera Right (East)\n                newCenterX = wmPoint.x + width * offsetFactor;\n              } else if (position === \"north\") {\n                // Widget Bottom -> Show point on Top -> Move Camera Down (South)\n                newCenterY = wmPoint.y - height * offsetFactor;\n              } else if (position === \"south\") {\n                // Widget Top -> Show point on Bottom -> Move Camera Up (North)\n                newCenterY = wmPoint.y + height * offsetFactor;\n              }\n\n              const newCenter = new this.ArcGISModules.Point({\n                x: newCenterX,\n                y: newCenterY,\n                spatialReference: { wkid: 3857 },\n              });\n\n              this.navigateMapView(view, { center: newCenter, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n            } else {\n              this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n            }\n          } catch (e) {\n            this.navigateMapView(view, { center: targetPoint, scale: followScale }, { animate: this._userPaused, duration: this._userPaused ? 300 : 0 });\n          }\n        }\n      }\n    }\n  }\n\n  /**\n   * Draws a camera view cone polygon at the given location and bearing.\n   * 2D: flat orange polygon (draped onto layer)\n"
        },
        {
          "label": "src/runtime/widget.tsx viewport follow 7",
          "before": "            hasTimeTravel={this.state.hasTimeTravel}\n            isDownloading={this.state.isDownloading}\n            syncHeading={this.state.syncHeading}\n            is3D={this.state.jimuMapView?.view?.type === \"3d\"}\n            imageId={this.state.imageId}\n            sequenceImages={this.state.sequenceImages}\n",
          "after": "            hasTimeTravel={this.state.hasTimeTravel}\n            isDownloading={this.state.isDownloading}\n            syncHeading={this.state.syncHeading}\n            mapFollowEnabled={this.props.config.syncMapWithImage === true && !this.state.isFullscreen}\n            lockToImage={this.state.lockToImage}\n            onToggleImageLock={() => this.setState(previous => ({ lockToImage: !previous.lockToImage }), () => {\n              const view = this.state.jimuMapView?.view;\n              const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n              if (this.state.lockToImage && view && image && String(image.id) === String(this.state.imageId)) this.syncMapToImage(image, view);\n            })}\n            is3D={this.state.jimuMapView?.view?.type === \"3d\"}\n            imageId={this.state.imageId}\n            sequenceImages={this.state.sequenceImages}\n"
        }
      ],
      "absentAfterUninstall": [
        "syncMapToImage"
      ],
      "requiredOccurrences": [
        {
          "text": "syncMapToImage",
          "count": 3
        }
      ]
    },
    {
      "file": "src/components/ImageUtilityGroup.tsx",
      "blocks": [
        {
          "label": "src/components/ImageUtilityGroup.tsx viewport follow 1",
          "before": "    const cloudMode = props.is3D && !props.hidePointCloud;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload;\n    const close = (focus = false) => { setOpen(null); if (focus) trigger.current?.focus(); };\n    const hasNavigation = !props.hideCenterMapButton || (!props.hideTimeTravel && props.hasTimeTravel);\n    const hasSceneTools = props.is3D && (!props.hideSyncHeadingButton || !props.hidePointCloud);\n    const toolsActive = (props.is3D && !props.hidePointCloud && cloudOn) || (props.is3D && !props.hideSyncHeadingButton && props.syncHeading);\n    React.useLayoutEffect(() => {\n",
          "after": "    const cloudMode = props.is3D && !props.hidePointCloud;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload;\n    const close = (focus = false) => { setOpen(null); if (focus) trigger.current?.focus(); };\n    const hasNavigation = !!props.mapFollowEnabled || !props.hideCenterMapButton || (!props.hideTimeTravel && props.hasTimeTravel);\n    const hasSceneTools = props.is3D && (!props.hideSyncHeadingButton || !props.hidePointCloud);\n    const toolsActive = (props.is3D && !props.hidePointCloud && cloudOn) || (props.is3D && !props.hideSyncHeadingButton && props.syncHeading);\n    React.useLayoutEffect(() => {\n"
        },
        {
          "label": "src/components/ImageUtilityGroup.tsx viewport follow 2",
          "before": "    return <div ref={dock} className={`glass-image-utility-panel mly-utility-dock${mobile && collapsed ? ' is-collapsed' : ''}`} data-mobile={mobile ? 'true' : undefined} role=\"group\" aria-label=\"Image actions\">\n        <style>{utilityDockCss}</style>\n        {!props.hideCenterMapButton && <button type=\"button\" className=\"utility-button\" title=\"Center map on this image\" aria-label=\"Center map on this image\" onClick={props.onCenterMap}><Icons.Crosshair size={16}/></button>}\n        {!props.hideTimeTravel && props.hasTimeTravel && <button type=\"button\" className=\"utility-button\" title=\"Explore images from other dates\" aria-label=\"Time travel\" disabled={!currentImage}\n            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n        {hasNavigation && hasSceneTools && <span className=\"mly-dock-divider\" aria-hidden=\"true\"/>}\n",
          "after": "    return <div ref={dock} className={`glass-image-utility-panel mly-utility-dock${mobile && collapsed ? ' is-collapsed' : ''}`} data-mobile={mobile ? 'true' : undefined} role=\"group\" aria-label=\"Image actions\">\n        <style>{utilityDockCss}</style>\n        {!props.hideCenterMapButton && <button type=\"button\" className=\"utility-button\" title=\"Center map on this image\" aria-label=\"Center map on this image\" onClick={props.onCenterMap}><Icons.Crosshair size={16}/></button>}\n        {props.mapFollowEnabled && <button type=\"button\" className=\"utility-button\" aria-label=\"Lock to image\" aria-pressed={!!props.lockToImage}\n            title={props.lockToImage ? 'Lock to image on \u00b7 Click to follow only outside the map' : 'Keep image in view \u00b7 Click to lock to image'}\n            onClick={props.onToggleImageLock}><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" aria-hidden=\"true\"><rect x=\"5\" y=\"10\" width=\"14\" height=\"11\" rx=\"2\"/><path d={props.lockToImage ? 'M8 10V6a4 4 0 0 1 8 0v4' : 'M8 10V6a4 4 0 0 1 8 0'}/></svg></button>}\n        {!props.hideTimeTravel && props.hasTimeTravel && <button type=\"button\" className=\"utility-button\" title=\"Explore images from other dates\" aria-label=\"Time travel\" disabled={!currentImage}\n            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n        {hasNavigation && hasSceneTools && <span className=\"mly-dock-divider\" aria-hidden=\"true\"/>}\n"
        }
      ],
      "absentAfterUninstall": [
        "Lock to image"
      ],
      "requiredOccurrences": [
        {
          "text": "Lock to image",
          "count": 2
        }
      ]
    },
    {
      "file": "src/components/types.ts",
      "blocks": [
        {
          "label": "src/components/types.ts viewport follow 1",
          "before": "    hasTimeTravel: boolean;\n    isDownloading?: boolean;\n    syncHeading: boolean;\n    is3D: boolean;\n    imageId: string | null;\n    sequenceImages: { id: string; lat: number; lon: number }[];\n",
          "after": "    hasTimeTravel: boolean;\n    isDownloading?: boolean;\n    syncHeading: boolean;\n    mapFollowEnabled?: boolean;\n    lockToImage?: boolean;\n    onToggleImageLock?: () => void;\n    is3D: boolean;\n    imageId: string | null;\n    sequenceImages: { id: string; lat: number; lon: number }[];\n"
        }
      ],
      "absentAfterUninstall": [
        "mapFollowEnabled"
      ],
      "requiredOccurrences": [
        {
          "text": "mapFollowEnabled",
          "count": 1
        }
      ]
    },
    {
      "file": "src/config.ts",
      "blocks": [
        {
          "label": "src/config.ts viewport follow 1",
          "before": "\n  /**\n   * If true, synchronizes the map view with the currently displayed image.\n   * When the image changes, the map automatically centers on that image location.\n   * Accessed in widget via: this.props.config.syncMapWithImage\n   */\n  syncMapWithImage?: boolean;\n",
          "after": "\n  /**\n   * If true, synchronizes the map view with the currently displayed image.\n   * By default the map recenters only when the image leaves the viewport.\n   * The runtime Lock to image button enables continuous following.\n   * Accessed in widget via: this.props.config.syncMapWithImage\n   */\n  syncMapWithImage?: boolean;\n"
        }
      ],
      "absentAfterUninstall": [
        "runtime Lock to image"
      ],
      "requiredOccurrences": [
        {
          "text": "runtime Lock to image",
          "count": 1
        }
      ]
    },
    {
      "file": "src/setting/setting.tsx",
      "blocks": [
        {
          "label": "src/setting/setting.tsx viewport follow 1",
          "before": "            {/* Extended Position Options */}\n            {this.props.config.syncMapWithImage && (\n              <div className=\"mt-2 w-100\" style={{ paddingLeft: \"0px\" }}>\n                <div style={{ fontSize: \"12px\", fontWeight: 500, marginBottom: \"4px\" }}>Lock Position:</div>\n                <Select size=\"sm\" value={config.syncMapPosition || \"center\"} onChange={this.onSyncPositionChange} style={{ width: \"100%\" }}>\n                  <Option value=\"center\">Center (Default)</Option>\n                  <Option value=\"west\">West (Focus Left)</Option>\n",
          "after": "            {/* Extended Position Options */}\n            {this.props.config.syncMapWithImage && (\n              <div className=\"mt-2 w-100\" style={{ paddingLeft: \"0px\" }}>\n                <div style={{ fontSize: \"12px\", fontWeight: 500, marginBottom: \"4px\" }}>Recenter position:</div>\n                <Select size=\"sm\" value={config.syncMapPosition || \"center\"} onChange={this.onSyncPositionChange} style={{ width: \"100%\" }}>\n                  <Option value=\"center\">Center (Default)</Option>\n                  <Option value=\"west\">West (Focus Left)</Option>\n"
        },
        {
          "label": "src/setting/setting.tsx viewport follow 2",
          "before": "                  {config.syncMapPosition === \"west\" && \"Best if your widget is docked on the Right.\"}\n                  {config.syncMapPosition === \"north\" && \"Best if your widget is docked on the Bottom.\"}\n                  {config.syncMapPosition === \"south\" && \"Best if your widget is docked on the Top.\"}\n                  {(!config.syncMapPosition || config.syncMapPosition === \"center\") && \"Keeps the active frame in the center of the map.\"}\n                </div>\n              </div>\n            )}\n",
          "after": "                  {config.syncMapPosition === \"west\" && \"Best if your widget is docked on the Right.\"}\n                  {config.syncMapPosition === \"north\" && \"Best if your widget is docked on the Bottom.\"}\n                  {config.syncMapPosition === \"south\" && \"Best if your widget is docked on the Top.\"}\n                  {(!config.syncMapPosition || config.syncMapPosition === \"center\") && \"Recenters here when the image leaves view. Use Lock to image for continuous following.\"}\n                </div>\n              </div>\n            )}\n"
        }
      ],
      "absentAfterUninstall": [
        "Recenter position:"
      ],
      "requiredOccurrences": [
        {
          "text": "Recenter position:",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md viewport follow 1",
          "before": "The first native selection installer produced blue circles across unrelated sequences in the host; its portable filter tests did not establish actual renderer behavior. Replace incremental style-layer partitions with per-feature `case` color expressions on the existing styles through `setPaintProperties`. No selected style layers, membership filters or point Graphics are added. Only a matching sequence ID receives blue; other/missing IDs use the original quality/date color. All base filters and circle dimensions remain unchanged.\n\nRestore the existing cached faint overview and complete route line on the main map. Native marker refresh removes only legacy point graphics, preserving that overview. Full-coordinate route loading remains on demand for elevation. The earlier statement about suppressing the main-map overview is superseded. Refactoring remains paused at the field-note map checkpoint.\n",
          "after": "The first native selection installer produced blue circles across unrelated sequences in the host; its portable filter tests did not establish actual renderer behavior. Replace incremental style-layer partitions with per-feature `case` color expressions on the existing styles through `setPaintProperties`. No selected style layers, membership filters or point Graphics are added. Only a matching sequence ID receives blue; other/missing IDs use the original quality/date color. All base filters and circle dimensions remain unchanged.\n\nRestore the existing cached faint overview and complete route line on the main map. Native marker refresh removes only legacy point graphics, preserving that overview. Full-coordinate route loading remains on demand for elevation. The earlier statement about suppressing the main-map overview is superseded. Refactoring remains paused at the field-note map checkpoint.\n\n## Viewport-aware image follow\n\n`features/imagery/imageFollowPolicy.ts` owns the movement decision. Synchronization now defaults to keeping the current image visible: no position update while its projected ground point remains in the viewport. Explicit `Lock to image` restores continuous following and uses the existing directional recenter settings. The lock is session state, initially off; manual Center and heading follow remain separate. 3D bearing updates move the center only while position lock is enabled. Rendered-terrain sampling is synchronous and adds no elevation requests. Missing terrain defers automatic repositioning. The runtime's `syncMapToImage` adapter is shared by confirmed image updates and immediate lock activation. Validate panning, rotated/tilted views, every configured recenter position and playback in the host.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Viewport-aware image follow"
      ],
      "requiredOccurrences": [
        {
          "text": "## Viewport-aware image follow",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/imagery/imageFollowPolicy.ts",
      "content": "/** Minimal SDK boundary for checking the rendered viewport rather than its rotated extent. */\nexport interface ImageFollowView {\n type: string; width: number; height: number; stationary?: boolean;\n toScreen(point: any): { x: number; y: number } | null | undefined;\n groundView?: { elevationSampler?: { queryElevation(point: any): any; noDataValue?: number | null } | null } | null;\n}\n\n/** Default follow moves only after the image leaves the viewport; lock preserves continuous follow.\n * Scene projection needs ground height because toScreen does not apply graphic-layer draping.\n * Use only the synchronous rendered-terrain sampler, never a service request. While terrain or\n * viewport dimensions are unavailable, defer movement instead of jumping on a false projection.\n */\nexport function shouldRecenterImage(view: ImageFollowView, point: any, locked: boolean): boolean {\n if (locked) return true;\n if (view.stationary === false || view.width <= 0 || view.height <= 0) return false;\n let projection = point;\n if (view.type === '3d') {\n  try {\n   const sampler = view.groundView?.elevationSampler;\n   const ground = sampler?.queryElevation(point);\n   if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue) return false;\n   projection = ground;\n  } catch { return false; }\n }\n try {\n  const pixel = view.toScreen(projection);\n  return !pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||\n   pixel.x < 0 || pixel.y < 0 || pixel.x > view.width || pixel.y > view.height;\n } catch { return false; }\n}\n"
    },
    {
      "file": "tests/imageFollowPolicy.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,m={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/imagery/imageFollowPolicy.ts'),'utf8')))(m,m.exports);const {shouldRecenterImage:follow}=m.exports;\nconst view=(x=50,y=50)=>({type:'2d',width:100,height:100,toScreen:()=>({x,y})});\ntest('visible image and boundary positions do not move the map',()=>{for(const [x,y] of [[50,50],[0,0],[100,100]])assert.equal(follow(view(x,y),{},false),false)});\ntest('image outside any viewport edge recenters',()=>{for(const [x,y] of [[-1,50],[101,50],[50,-1],[50,101]])assert.equal(follow(view(x,y),{},false),true)});\ntest('lock restores continuous following even while image is visible',()=>assert.equal(follow(view(),{},true),true));\ntest('default mode respects an active map gesture and unavailable dimensions',()=>{assert.equal(follow({...view(101),stationary:false},{},false),false);assert.equal(follow({...view(101),width:0},{},false),false)});\ntest('3D checks ground projection rather than raw anchor altitude',()=>{const point={z:100000},ground={z:50};let projected;const v={...view(),type:'3d',groundView:{elevationSampler:{queryElevation:p=>(assert.equal(p,point),ground)}},toScreen:p=>(projected=p,{x:50,y:50})};assert.equal(follow(v,point,false),false);assert.equal(projected,ground);v.toScreen=()=>({x:101,y:50});assert.equal(follow(v,point,false),true)});\ntest('3D missing terrain and no-data defer follow rather than jumping',()=>{const v={...view(101),type:'3d'};assert.equal(follow(v,{},false),false);v.groundView={elevationSampler:{noDataValue:-999,queryElevation:()=>({z:-999})}};assert.equal(follow(v,{},false),false)});\nconst file=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',file,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');assert.equal(sf.parseDiagnostics.length,0);const method=cl.members.find(n=>n.name?.getText(sf)==='syncMapToImage').getText(sf);const Harness=new Function('shouldRecenterImage','sceneFollowCamera','webMercatorUtils',compile('class Harness{'+method+'};')+'return Harness;')(follow,()=>({camera:true}),{geographicToWebMercator:p=>({x:p.longitude,y:p.latitude})});\nfunction runtime(type='2d',position='center',locked=false){const w=new Harness();w.props={config:{syncMapWithImage:true,syncMapPosition:position}};w.state={lockToImage:locked,imageId:'A'};w.getCoverageDisplayPosition=()=>({lon:1,lat:2});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};w.moves=[];w.navigateMapView=(...a)=>w.moves.push(a);w._userPaused=false;const v={...view(),type,scale:1234,extent:{width:100,height:200},groundView:{elevationSampler:{queryElevation:()=>({z:30})}}};return{w,v}}\ntest('actual runtime keeps visible image still in all configured directions',()=>{for(const p of ['center','east','west','north','south']){const {w,v}=runtime('2d',p);w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)}});\ntest('actual runtime recenters outside, preserves scale and each direction offset',()=>{for(const [p,x,y] of [['center',undefined,undefined],['east',-24,2],['west',26,2],['north',1,-48],['south',1,52]]){const {w,v}=runtime('2d',p);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,1);assert.equal(w.moves[0][1].scale,1234);if(x!==undefined){assert.equal(w.moves[0][1].center.x,x);assert.equal(w.moves[0][1].center.y,y)}}});\ntest('actual 3D runtime follows only outside unless locked',()=>{for(const locked of [false,true]){const {w,v}=runtime('3d','center',locked);w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,locked?1:0);v.toScreen=()=>({x:101,y:50});w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,locked?2:1)}});\ntest('disabled sync and fly-in suppress navigation in both modes',()=>{for(const lock of [false,true]){const {w,v}=runtime('2d','center',lock);v.toScreen=()=>({x:101,y:50});w.props.config.syncMapWithImage=false;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0);w.props.config.syncMapWithImage=true;w._isFlyInActive=true;w.syncMapToImage({id:'A',lon:1,lat:2},v);assert.equal(w.moves.length,0)}});\ntest('bearing follow rotates without recentering unless image lock is enabled',()=>{let branch;function visit(n){if(ts.isIfStatement(n)&&n.expression.getText(sf).includes('this.state.syncHeading')&&n.expression.getText(sf).includes('syncMapWithImage'))branch=n;ts.forEachChild(n,visit)}visit(cl);assert(branch);const Heading=new Function(compile('class Heading{run(view,event){'+branch.getText(sf)+'}}')+'return Heading;')();for(const locked of [false,true]){const w=new Heading();w.props={config:{syncMapWithImage:true}};w.state={syncHeading:true,lockToImage:locked,imageId:'A'};w._liveSequenceFrames={current:{lon:1,lat:2}};let target;w.navigateMapView=(view,t)=>target=t;w.run({type:'3d'},{bearing:75});assert.equal(target.heading,75);assert.equal('center' in target,locked)}});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'viewport-image-follow-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-viewport-image-follow.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited native selection references remain)');
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
    console.log(uninstall ? 'Viewport image follow is already uninstalled. No files changed.' : 'Viewport image follow is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'viewport-image-follow', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Viewport image follow ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Default follow keeps the image visible; Lock to image restores continuous following. Use --uninstall to revert only this update.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
