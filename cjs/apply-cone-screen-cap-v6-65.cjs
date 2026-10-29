#!/usr/bin/env node
'use strict';
/**
 * Cone screen cap v6.65. Compatible current v6 sources.
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
              "label": "cone screen cap 1",
              "before": "import { sequenceRouteMemoryStats } from \"../features/imagery/sequenceMemoryBudget\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { SelectionPulse } from '../features/map-graphics/SelectionPulse';\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\nimport { coneDisplayRadius } from \"../features/map-graphics/coneDisplayRadius\";\nimport { CameraConeGraphics } from '../features/map-graphics/CameraConeGraphics';\nimport { MapSymbolLegend } from '../features/map-graphics/MapSymbolLegend';\n",
              "after": "import { sequenceRouteMemoryStats } from \"../features/imagery/sequenceMemoryBudget\";\nimport { ActiveSequenceOverlay } from '../features/imagery/ActiveSequenceOverlay';\nimport { ClickRippleAnimations } from '../features/map-graphics/ClickRippleAnimations';\nimport { SelectionPulse } from '../features/map-graphics/SelectionPulse';\nimport { capConeFootprint } from \"../features/map-graphics/capConeFootprint\";\nimport { projectedConeRadius } from \"../features/map-graphics/projectedConeRadius\";\nimport { coneDisplayRadius } from \"../features/map-graphics/coneDisplayRadius\";\nimport { CameraConeGraphics } from '../features/map-graphics/CameraConeGraphics';\nimport { MapSymbolLegend } from '../features/map-graphics/MapSymbolLegend';\n"
            },
            {
              "label": "cone screen cap 2",
              "before": "  private coneSpreads = [60, 40, 30, 20];\n  private coneLengths = [10, 15, 20, 30];\n  private zoomStepIndex = 0;\n  private _lastBearing: number = 0;\n  private _coneRedrawRaf: number | null = null;\n\n  // Debounced function\n  private debouncedTurboFilter: (() => void) & { cancel?: () => void };\n",
              "after": "  private coneSpreads = [60, 40, 30, 20];\n  private coneLengths = [10, 15, 20, 30];\n  private zoomStepIndex = 0;\n  private _lastBearing: number = 0;\n  private _coneCameraWatch: __esri.WatchHandle | null = null;\n  private _coneRedrawRaf: number | null = null;\n\n  // Debounced function\n  private debouncedTurboFilter: (() => void) & { cancel?: () => void };\n"
            },
            {
              "label": "cone screen cap 3",
              "before": "\n    this._nativeSequenceSelection.detach();\n\n    // Clean up zoom watcher and cancel any pending zoom URL update\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n",
              "after": "\n    this._nativeSequenceSelection.detach();\n\n    // Clean up zoom watcher and cancel any pending zoom URL update\n    this._coneCameraWatch?.remove(); this._coneCameraWatch = null;\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n"
            },
            {
              "label": "cone screen cap 4",
              "before": "    /*\n     * Remove the previous MapView's watcher before\n     * attaching anything to the new 2D/3D view.\n     */\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n",
              "after": "    /*\n     * Remove the previous MapView's watcher before\n     * attaching anything to the new 2D/3D view.\n     */\n    this._coneCameraWatch?.remove(); this._coneCameraWatch = null;\n    if (this.zoomDisplayHandle) {\n      this.zoomDisplayHandle.remove();\n      this.zoomDisplayHandle = null;\n    }\n"
            },
            {
              "label": "cone screen cap 5",
              "before": "\n      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      // Share the existing cone frame: zoom events never rebuild imagery or add timers.\n      if (this._coneRedrawRaf == null) this._coneRedrawRaf = requestAnimationFrame(() => {\n        this._coneRedrawRaf = null;\n        if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n        const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n        if (image && String(image.id) === String(this.state.imageId))\n          this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n      });\n\n      /*\n       * Keep quality hint behavior.\n       */\n",
              "after": "\n      this._debouncedZoomUrlUpdate();\n      void this.refreshSequenceMarkerWindow();\n\n      this.requestConeRedraw(view);\n\n      /*\n       * Keep quality hint behavior.\n       */\n"
            },
            {
              "label": "cone screen cap 6",
              "before": "          this.clearZoomWarning();\n        }\n      }\n    });\n\n    // Restore manual Turbo Mode or Auto-Initialize if Config is ON\n    {\n      this.setState({ turboModeActive: true });\n",
              "after": "          this.clearZoomWarning();\n        }\n      }\n    });\n\n    if (view.type === '3d') this._coneCameraWatch = view.watch('camera', () => this.requestConeRedraw(view));\n\n    // Restore manual Turbo Mode or Auto-Initialize if Config is ON\n    {\n      this.setState({ turboModeActive: true });\n"
            },
            {
              "label": "cone screen cap 7",
              "before": "   * 3D: a low wedge with 3D edge lines and draped ground fill.\n   * Uses this.ensureConeLayer() with elevationInfo { mode: \"relative-to-ground\" }\n   * so that the cone is always rendered on the terrain surface regardless of elevation.\n   */\n  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    let displayRadius = coneDisplayRadius(radiusMeters, view.zoom);\n",
              "after": "   * 3D: a low wedge with 3D edge lines and draped ground fill.\n   * Uses this.ensureConeLayer() with elevationInfo { mode: \"relative-to-ground\" }\n   * so that the cone is always rendered on the terrain surface regardless of elevation.\n   */\n  /** Share one pending frame across zoom, camera and existing bearing updates. */\n  private requestConeRedraw(view: __esri.MapView | __esri.SceneView): void {\n    if (this.state.jimuMapView?.view !== view || view.destroyed || this._coneRedrawRaf != null) return;\n    this._coneRedrawRaf = requestAnimationFrame(() => {\n      this._coneRedrawRaf = null;\n      if (this.state.jimuMapView?.view !== view || view.destroyed) return;\n      const image = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId);\n      if (image && String(image.id) === String(this.state.imageId))\n        this.drawCone(image.lon, image.lat, this._lastBearing || 0, this.coneLengths[this.zoomStepIndex], this.coneSpreads[this.zoomStepIndex]);\n    });\n  }\n\n  private drawCone(lon: number, lat: number, heading: number, radiusMeters = 5, spreadDeg = 60) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || !this.ArcGISModules || ![lon, lat, heading, radiusMeters, spreadDeg].every(Number.isFinite) || radiusMeters <= 0 || spreadDeg <= 0 || spreadDeg >= 180) return null;\n    let displayRadius = coneDisplayRadius(radiusMeters, view.zoom);\n"
            },
            {
              "label": "cone screen cap 8",
              "before": "          return view.toScreen(ground);\n        } catch { return null; }\n      });\n      if (measured !== null) displayRadius = measured;\n    }\n    if (!displayRadius) { this.clearConeGraphics(); return null; }\n    const layer = this.ensureConeLayer();\n    if (!layer) return null;\n",
              "after": "          return view.toScreen(ground);\n        } catch { return null; }\n      });\n      if (measured !== null) displayRadius = measured;\n    }\n    // A direction indicator must not become a large ground footprint at close zoom.\n    const maxPixels = Math.max(40, Math.min(96, Math.min(view.width || 384, view.height || 384) * 0.25));\n    const scene = view.type === '3d', angle = heading * Math.PI / 180;\n    const mercatorScale = 1 / Math.max(0.01, Math.cos(anchor.lat * Math.PI / 180));\n    const bounded = displayRadius > 0 ? capConeFootprint(displayRadius, spreadDeg, scene, maxPixels, (distance, offset, up) => {\n      try {\n        const theta = angle + offset * Math.PI / 180;\n        const point = new this.ArcGISModules.Point({ x: center.x + distance * mercatorScale * Math.sin(theta), y: center.y + distance * mercatorScale * Math.cos(theta), spatialReference: { wkid: 3857 } });\n        if (!scene) return view.toScreen(point);\n        const sampler = (view as any).groundView?.elevationSampler, ground = sampler?.queryElevation(point);\n        if (!ground || !Number.isFinite(ground.z) || ground.z === sampler?.noDataValue) return null;\n        return view.toScreen(new this.ArcGISModules.Point({ x: ground.x, y: ground.y, z: ground.z + up, spatialReference: ground.spatialReference }));\n      } catch { return null; }\n    }) : 0;\n    if (bounded !== null) displayRadius = bounded;\n    else {\n      // Missing terrain/projection: retain a conservative zoom-derived ground cap.\n      const resolution = view.type === '2d' && Number.isFinite(view.resolution) && view.resolution > 0 ? view.resolution : 156543.03392804097 / 2 ** view.zoom;\n      const metresPerPixel = resolution / mercatorScale;\n      if (Number.isFinite(metresPerPixel) && metresPerPixel > 0) displayRadius = Math.min(displayRadius, maxPixels * metresPerPixel / 2);\n    }\n    if (!displayRadius) { this.clearConeGraphics(); return null; }\n    const layer = this.ensureConeLayer();\n    if (!layer) return null;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/CameraConeGraphics.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "cone screen cap 1",
              "before": "    heading: number, radiusMeters: number, spreadDeg: number, scene: boolean,\n    createGraphic: (properties: any) => G, createMesh: (properties: any) => any = properties => properties): G {\n    // One clockwise sector in projected coordinates avoids overlapping ground/top surfaces.\n    const radius = radiusMeters / Math.max(0.01, Math.cos(latitude * Math.PI / 180));\n    const z = scene ? 0.08 : 0;\n    // The apex belongs to the native ground image center; lift only the wedge's\n    // other surfaces. A fixed 8 cm apex lift becomes several pixels at close zoom.\n    const ring: number[][] = [[center.x, center.y, 0]];\n    const segments = Math.max(8, Math.ceil(spreadDeg / 2));\n",
              "after": "    heading: number, radiusMeters: number, spreadDeg: number, scene: boolean,\n    createGraphic: (properties: any) => G, createMesh: (properties: any) => any = properties => properties): G {\n    // One clockwise sector in projected coordinates avoids overlapping ground/top surfaces.\n    const radius = radiusMeters / Math.max(0.01, Math.cos(latitude * Math.PI / 180));\n    const z = scene ? Math.min(0.08, radiusMeters * 0.008) : 0;\n    // The apex belongs to the native ground image center; lift only the wedge's\n    // other surfaces. A fixed 8 cm apex lift becomes several pixels at close zoom.\n    const ring: number[][] = [[center.x, center.y, 0]];\n    const segments = Math.max(8, Math.ceil(spreadDeg / 2));\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/coneMeshGeometry.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "cone screen cap 1",
              "before": " const rise = Math.min(radius * 0.15, 1.5);\n for (let i = 0; i <= segments; i++) {\n  const degrees = heading - spread / 2 + spread * i / segments;\n  const angle = degrees * Math.PI / 180;\n  position.push(radius * Math.sin(angle), radius * Math.cos(angle), 0.08 + rise * Math.cos((degrees - heading) * Math.PI / 180));\n }\n for (let i = 0; i <= segments; i++) position.push(position[3 * (i + 1)], position[3 * (i + 1) + 1], 0);\n const upper = (i: number) => i + 1;\n const lower = (i: number) => segments + 2 + i;\n",
              "after": " const rise = Math.min(radius * 0.15, 1.5);\n for (let i = 0; i <= segments; i++) {\n  const degrees = heading - spread / 2 + spread * i / segments;\n  const angle = degrees * Math.PI / 180;\n  position.push(radius * Math.sin(angle), radius * Math.cos(angle), Math.min(0.08, radius * 0.008) + rise * Math.cos((degrees - heading) * Math.PI / 180));\n }\n for (let i = 0; i <= segments; i++) position.push(position[3 * (i + 1)], position[3 * (i + 1) + 1], 0);\n const upper = (i: number) => i + 1;\n const lower = (i: number) => segments + 2 + i;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/projectedConeRadius.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "cone screen cap 1",
              "before": "test('relative and absolute ground-distance caps remain bounded',()=>{assert.equal(size(10,projection(.1)),240);assert.equal(size(30,projection(.1)),360)});\ntest('overview hides a cone too small at its cap',()=>assert.equal(size(10,projection(.01)),0));\ntest('unavailable terrain/projection retains caller fallback',()=>{assert.equal(size(10,()=>null),null);assert.equal(size(10,()=>({x:NaN,y:1})),null);assert.equal(size(10,()=>({x:0,y:0})),null)});\ntest('projection work stays bounded even under perspective',()=>{let count=0;const r=size(10,d=>(count++,{x:d/(1+d*.01),y:0}));assert.equal(count,3);assert(r>=10&&r<=240)});\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(sf.parseDiagnostics.length,0);const cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(n=>n.name?.getText(sf)==='drawCone').getText(sf);const Runtime=new Function('projectedConeRadius','coneDisplayRadius','lonLatToWebMercator',ts.transpileModule('class Runtime{'+method+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'return Runtime;')(size,(r,z)=>z<12?0:z>=17?r:Math.min(r*2**(17-z),r*8,120),()=>({x:0,y:0}));\nfunction draw(type,zoom,terrain=true){const w=new Runtime(),pulse={unchanged:true};let queries=0,radius;const v={type,zoom,toScreen:p=>({x:p.x*.5,y:p.y*.5}),groundView:{elevationSampler:{queryElevation:p=>(queries++,terrain?{...p,z:30}:null)}}};w.state={imageId:'A',jimuMapView:{view:v}};w.currentGreenGraphic=pulse;w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};w.getCoverageDisplayPosition=()=>({lon:1,lat:0});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(...args)=>(radius=args[5],{})});w.clearConeGraphics=()=>radius=0;w.drawCone(1,0,90,10,60);assert.equal(w.currentGreenGraphic,pulse);return {radius,queries}}\ntest('actual runtime sizes 3D from projection at different zoom labels, preserving pulse',()=>{assert.equal(draw('3d',15.6).radius,120);assert.equal(draw('3d',11).radius,120);assert.equal(draw('3d',15.6).queries,3)});\ntest('actual runtime leaves 2D unchanged without terrain queries',()=>{assert.equal(draw('2d',15).radius,40);assert.equal(draw('2d',15).queries,0)});\ntest('actual runtime retains old fallback while terrain is unavailable',()=>assert.equal(draw('3d',15,false).radius,40));\n\ntest('distant views can extend the cone beyond a fixed-size pulse without exceeding caps',()=>{const radius=size(10,projection(.15));assert.equal(radius,240);assert.equal(radius*.15,36);assert(radius*.15>28)});\n",
              "after": "test('relative and absolute ground-distance caps remain bounded',()=>{assert.equal(size(10,projection(.1)),240);assert.equal(size(30,projection(.1)),360)});\ntest('overview hides a cone too small at its cap',()=>assert.equal(size(10,projection(.01)),0));\ntest('unavailable terrain/projection retains caller fallback',()=>{assert.equal(size(10,()=>null),null);assert.equal(size(10,()=>({x:NaN,y:1})),null);assert.equal(size(10,()=>({x:0,y:0})),null)});\ntest('projection work stays bounded even under perspective',()=>{let count=0;const r=size(10,d=>(count++,{x:d/(1+d*.01),y:0}));assert.equal(count,3);assert(r>=10&&r<=240)});\nconst cm={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/capConeFootprint.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(cm,cm.exports);const cap=cm.exports.capConeFootprint;\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);assert.equal(sf.parseDiagnostics.length,0);const cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=cl.members.find(n=>n.name?.getText(sf)==='drawCone').getText(sf);const Runtime=new Function('capConeFootprint','projectedConeRadius','coneDisplayRadius','lonLatToWebMercator',ts.transpileModule('class Runtime{'+method+'}',{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText+'return Runtime;')(cap,size,(r,z)=>z<12?0:z>=17?r:Math.min(r*2**(17-z),r*8,120),()=>({x:0,y:0}));\nfunction draw(type,zoom,terrain=true,scale=.5){const w=new Runtime(),pulse={unchanged:true};let queries=0,radius;const v={type,zoom,toScreen:p=>({x:p.x*scale,y:p.y*scale}),groundView:{elevationSampler:{queryElevation:p=>(queries++,terrain?{...p,z:30}:null)}}};w.state={imageId:'A',jimuMapView:{view:v}};w.currentGreenGraphic=pulse;w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}},Graphic:class{}};w.getCoverageDisplayPosition=()=>({lon:1,lat:0});w.ensureConeLayer=()=>({});w.ensureCameraConeOwner=()=>({render:(...args)=>(radius=args[5],{})});w.clearConeGraphics=()=>radius=0;w.drawCone(1,0,90,10,60);assert.equal(w.currentGreenGraphic,pulse);return {radius,queries}}\ntest('actual runtime sizes 3D from projection at different zoom labels, preserving pulse',()=>{assert.equal(draw('3d',15.6).radius,120);assert.equal(draw('3d',11).radius,120);assert(draw('3d',15.6).queries<=33)});\ntest('actual runtime leaves 2D unchanged without terrain queries',()=>{assert.equal(draw('2d',15).radius,40);assert.equal(draw('2d',15).queries,0)});\ntest('actual runtime retains old fallback while terrain is unavailable',()=>assert.equal(draw('3d',15,false).radius,40));\n\ntest('distant views can extend the cone beyond a fixed-size pulse without exceeding caps',()=>{const radius=size(10,projection(.15));assert.equal(radius,240);assert.equal(radius*.15,36);assert(radius*.15>28)});\n\ntest('actual close-view runtime shrinks the cone in both modes while retaining the image pulse',()=>{for(const type of ['2d','3d']){const value=draw(type,24,true,1000);assert(value.radius>0&&value.radius<.1);assert(value.queries<=48)}});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/map-graphics/capConeFootprint.ts",
      "content": "/** Upper screen-footprint bound only; preserves the requested radius when it fits.\n * Sample the arc's top and ground edges so shallow/rolled cameras cannot hide width\n * behind a short projected centreline. At most 45 local projections; no iteration loop.\n */\nexport function capConeFootprint(radius: number, spread: number, scene: boolean, maxPixels: number,\n  project: (distance: number, offsetDegrees: number, up: number) => { x: number; y: number } | null): number | null {\n  if (![radius, spread, maxPixels].every(Number.isFinite) || radius <= 0 || spread <= 0 || spread >= 180 || maxPixels <= 0) return null;\n  const footprint = (r: number): number | null => {\n    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;\n    const include = (p: { x: number; y: number } | null) => {\n      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;\n      left = Math.min(left, p.x); right = Math.max(right, p.x); top = Math.min(top, p.y); bottom = Math.max(bottom, p.y); return true;\n    };\n    if (!include(project(0, 0, 0))) return null;\n    for (let i = 0; i <= 6; i++) {\n      const offset = -spread / 2 + spread * i / 6;\n      if (!include(project(r, offset, 0))) return null;\n      if (scene && !include(project(r, offset, Math.min(0.08, r * 0.008) + Math.min(r * 0.15, 1.5) * Math.cos(offset * Math.PI / 180)))) return null;\n    }\n    return Math.max(right - left, bottom - top);\n  };\n  let result = radius;\n  // Two bounded shrink corrections plus a final verification, allowing 5% sampling margin.\n  for (let pass = 0; pass < 3; pass++) {\n    const pixels = footprint(result);\n    if (pixels === null) return null;\n    if (pixels <= maxPixels * 0.95) return result;\n    result *= maxPixels * 0.9 / pixels;\n  }\n  // Projection near the camera plane can remain unstable. Hide rather than draw a huge wedge.\n  return 0;\n}\n"
    },
    {
      "file": "tests/coneFootprintCap.test.cjs",
      "content": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/capConeFootprint.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m,m.exports);const cap=m.exports.capConeFootprint;\nconst project=(scale,tilt=1)=>(r,a,up)=>({x:r*Math.sin(a*Math.PI/180)*scale,y:r*Math.cos(a*Math.PI/180)*scale*tilt-up*scale});\ntest('close zoom can shrink below the requested metre radius, with width and height capped',()=>{for(const scale of [10,100,1000])for(const spread of [30,60,120]){const result=cap(30,spread,true,96,project(scale));assert(result>0&&result<30);const p=project(scale);const vertices=[[0,0],...Array.from({length:361},(_,i)=>{const a=-spread/2+spread*i/360,q=p(result,a,Math.min(.08,result*.008)+Math.min(result*.15,1.5)*Math.cos(a*Math.PI/180));return[q.x,q.y]})];assert(Math.max(...vertices.map(p=>p[0]))-Math.min(...vertices.map(p=>p[0]))<=96);assert(Math.max(...vertices.map(p=>p[1]))-Math.min(...vertices.map(p=>p[1]))<=96)}});\ntest('shallow view still caps width when the centreline looks short',()=>{const r=cap(30,120,true,96,project(10,.01));assert(r<6);assert(r>0)});\ntest('ordinary fitting cones retain their requested size in 2D and 3D',()=>{assert.equal(cap(10,60,false,96,project(2)),10);assert.equal(cap(10,60,true,96,project(2)),10)});\ntest('projection budget and invalid/camera-plane cases stay bounded',()=>{let calls=0;cap(30,120,true,96,(r,a,z)=>(calls++,project(100)(r,a,z)));assert(calls<=45);assert.equal(cap(30,60,true,96,()=>null),null);assert.equal(cap(30,60,true,96,()=>({x:Infinity,y:0})),null);assert.equal(cap(30,60,true,96,()=>({x:0,y:1000})),30)});\ntest('tiny mesh cones shrink their vertical lift and keep the apex at ground zero',()=>{const mm={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/coneMeshGeometry.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(mm,mm.exports);for(const radius of [.01,.1,1,10]){const mesh=mm.exports.coneMeshGeometry({x:123,y:456},90,radius,60),p=mesh.vertexAttributes.position;assert.deepEqual(p.slice(0,3),[0,0,0]);const maxZ=Math.max(...p.filter((_,i)=>i%3===2));assert(maxZ<=radius*.158+1e-9);assert.deepEqual(mesh.vertexSpace.origin,[123,456,0])}});\n"
    },
    {
      "file": "docs/CONE-SCREEN-CAP.md",
      "content": "# Cone screen footprint · v6.65\n\nStandalone cone-only update based on GitHub `85c38df`. Does not include or require v6.64 playback scheduling; apply with v6.64 uninstalled.\n\nThe direction cone retains its configured size when it fits. At close zoom, it may shrink below the requested ground-metre radius to avoid covering a large part of the map. Its upper screen-footprint limit is 96 CSS pixels, reduced to a quarter of the shorter viewport dimension on smaller views (minimum 40px). A small sampling margin keeps normal footprints below that limit.\n\nLocal projection samples cover the wedge's arc, ground edges and upper surface, checking both screen width and height. Two bounded shrink corrections and a verification accommodate perspective without an unbounded solver. An unstable valid projection that cannot satisfy the cap hides the cone for that redraw; the selected image marker remains. Unavailable terrain/projection uses a conservative zoom-derived ground cap, which is an estimate rather than a precise 3D screen bound. No elevation query over the network is introduced.\n\nFixed vertical lift now scales down below a 10m cone radius. The existing radius-based rise also shrinks, preventing the close-view wedge from retaining an outsized vertical thickness. Both the mesh and perimeter use the same lift formula. The apex stays at the same native ground anchor; bearing/spread and mesh topology remain.\n\nA 3D camera watcher requests a refresh when tilt/heading/position changes, sharing the existing pending cone animation frame with zoom/bearing work. It is removed with the existing view teardown/rebind. There is no new animation loop, timer, background request or sequence work. Projection work is bounded at 45 footprint samples per redraw, plus the existing centreline sizing work.\n\nSelection/hover modules, picking methods, click/pointer-move/image callbacks and zoom-driven sequence sizing/refreshes are unchanged.\n\n## Check in your app\n\n- With v6.64 uninstalled, refresh after applying v6.65. Open an image and zoom from normal to very close in 2D and 3D.\n- Tilt 3D toward ground level and rotate around the image. The cone should remain compact and its apex should stay at the image point.\n- Change the viewer cone-size control and bearing. The requested size remains an upper request constrained by screen readability.\n- Verify sequence hover/selection and blue coverage alignment as before, and confirm ordinary playback still advances.\n- Missing terrain can temporarily use the estimated cap. Real ArcGIS rendering and low-end-device frame cost need verification in your running app; synthetic projection tests are not deployment measurements.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'cone-screen-cap-v6-65-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.65 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'cone-screen-cap-v6-65' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.65 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.65 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.65 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-cone-screen-cap-v6-65.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Cone screen cap v6.65 is already installed. No files changed.');
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
  const manifest = { installer: 'cone-screen-cap-v6-65', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Cone screen cap v6.65 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
