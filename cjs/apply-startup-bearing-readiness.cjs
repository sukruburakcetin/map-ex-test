#!/usr/bin/env node
'use strict';
/**
 * Startup bearing readiness confirmation. Compatible current v6 sources.
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
              "label": "Startup bearing readiness 1",
              "before": "  private _startupUrlParameters: URLSearchParams | null = null;\n  private _sharedStateRestoreComplete: boolean = false;\n  private _isFlyInActive: boolean = false;\n  private _hasAttemptedMapSwitch: boolean = false;\n\n  /** Live viewer readers preserve replacement behavior during delayed shared-link restoration. */\n  private readonly _sharedViewerBearingHost: SharedViewerBearingHost = {\n    getViewer: () => this.mapillaryViewer,\n    onBearing: bearing => { this._lastBearing = bearing; },\n    updateUrl: (imageId, latitude, longitude) => this.updateUrlWithCurrentImage(imageId, latitude, longitude),\n    warn: error => console.warn(\"Could not set shared bearing on viewer:\", error),\n  };\n\n",
              "after": "  private _startupUrlParameters: URLSearchParams | null = null;\n  private _sharedStateRestoreComplete: boolean = false;\n  private _isFlyInActive: boolean = false;\n  private _sharedStartupBearing: number | null = null;\n  private _sharedStartupImageId: string | null = null;\n  private _hasAttemptedMapSwitch: boolean = false;\n\n  /** Saved heading is applied to the ready image; final URL writes wait for the flight. */\n  private readonly _sharedViewerBearingHost: SharedViewerBearingHost = {\n    getViewer: () => this.mapillaryViewer,\n    onBearing: bearing => { this._lastBearing = bearing;const view=this.state.jimuMapView?.view;if(view)this.requestConeRedraw(view);this.updateMinimapTracking(); },\n    updateUrl: (imageId, latitude, longitude) => { if(!this._isFlyInActive)this.updateUrlWithCurrentImage(imageId, latitude, longitude); },\n    warn: error => console.warn(\"Could not set shared bearing on viewer:\", error),\n  };\n\n"
            },
            {
              "label": "Startup bearing readiness 2",
              "before": "        .getBearing()\n        .then((b: number) => {\n          if (typeof b === \"number\") {\n            this._lastBearing = b;\n            redrawCone();\n          }\n        })\n",
              "after": "        .getBearing()\n        .then((b: number) => {\n          if (typeof b === \"number\") {\n            this._lastBearing = this._sharedStartupBearing ?? b;\n            redrawCone();\n          }\n        })\n"
            },
            {
              "label": "Startup bearing readiness 3",
              "before": "    // 2. Bearing Change Event\n    this.mapillaryViewer.on(\"bearing\", (event: any) => {\n      if (this.mapillaryViewer !== profileEventViewer) return;\n      this._lastBearing = event.bearing;\n\n      /**\n       * Cone drawing in SceneView is relatively expensive.\n",
              "after": "    // 2. Bearing Change Event\n    this.mapillaryViewer.on(\"bearing\", (event: any) => {\n      if (this.mapillaryViewer !== profileEventViewer) return;\n      this._lastBearing = this._sharedStartupBearing ?? event.bearing;\n\n      /**\n       * Cone drawing in SceneView is relatively expensive.\n"
            },
            {
              "label": "Startup bearing readiness 4",
              "before": "\n\n  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {\n    // Reuse completed geometry in its current view. Other selections open first,\n    // then reuse cached geometry or request only a nearby coordinate window.\n    const loadedSequence = this.state.sequenceImages;\n",
              "after": "\n\n  private async loadSequenceById(sequenceId: string, startImageId: string, clickPoint?: { lon: number; lat: number }, representative = false, nearestToClick = false, clickStartedAt?: number) {\n    if(this._sharedStartupImageId&&String(startImageId)!==this._sharedStartupImageId){\n      this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n      (this.state.jimuMapView?.view as any)?.animation?.stop();\n    }\n    // Reuse completed geometry in its current view. Other selections open first,\n    // then reuse cached geometry or request only a nearby coordinate window.\n    const loadedSequence = this.state.sequenceImages;\n"
            },
            {
              "label": "Startup bearing readiness 5",
              "before": "  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.clearSequenceDiagnostics();\n",
              "after": "  // destroys Mapillary viewer instance, clears DOM container,\n  // and resets internal state if requested.\n  private cleanupWidgetEnvironment(resetState: boolean = false, fullRemove: boolean = true) {\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;\n    this._currentImagePresentation?.release();\n    if (resetState || fullRemove) { this._placesExploreAbort?.abort(); this._places?.dispose(); this._places = null; this._placesView = null; }\n    this.clearSequenceDiagnostics();\n"
            },
            {
              "label": "Startup bearing readiness 6",
              "before": "    const sharedView = this.state.jimuMapView?.view;\n    if (!sharedView?.map || sharedView.destroyed) return;\n    const sharedMap = sharedView.map;\n    const current = () => isStartupCurrent() && this.state.jimuMapView?.view === sharedView &&\n      sharedView.map === sharedMap && !sharedView.destroyed;\n    if (!current()) return;\n    // 1. Get the query string.\n    // We attempt to read the PARENT window (the main browser URL),\n",
              "after": "    const sharedView = this.state.jimuMapView?.view;\n    if (!sharedView?.map || sharedView.destroyed) return;\n    const sharedMap = sharedView.map;\n    const startupClickRevision=this._mapClickRevision;\n    const current = () => this._mapClickRevision===startupClickRevision && isStartupCurrent() && this.state.jimuMapView?.view === sharedView &&\n      sharedView.map === sharedMap && !sharedView.destroyed&&this.props.state!=='CLOSED'&&this.props.visible!==false&&\n      (!this._currentImagePresentation||this._currentImagePresentation.owns(sharedMap));\n    if (!current()) return;\n    // 1. Get the query string.\n    // We attempt to read the PARENT window (the main browser URL),\n"
            },
            {
              "label": "Startup bearing readiness 7",
              "before": "          const coords = data.geometry?.coordinates; // [lon, lat]\n\n          if (seqId && coords) {\n            // Take control of the camera and don't let anyone else in.\n            this._isFlyInActive = true;\n\n            // 1. Load the sequence in the viewer\n            await this.loadSequenceById(seqId, sharedId);\n            if (!current()) return;\n\n            // Restore only the originating view; a replacement owns its own camera.\n            if (this.ArcGISModules) {\n              const { Point } = this.ArcGISModules;\n              await restoreSharedMapCamera(sharedView, coords, bearing, mapZoom, properties => new Point(properties));\n              if (!current()) return;\n            }\n\n            // Flight complete, restore normal camera tracking.\n            setTimeout(() => {\n              if (current()) this._isFlyInActive = false;\n            }, 1500);\n\n            // 3. Apply camera angles after viewer is ready.\n            //    setBearing() is not a real Mapillary-JS API; the correct\n            //    way to point the viewer at a specific bearing is setCenter([x, 0.5])\n            //    where x is derived from the diff between target bearing and the\n            //    image's compassAngle (same pattern used in _handleSelectAlternateImage).\n            setTimeout(() => {\n              if (current()) void restoreSharedViewerBearing(sharedId, coords, bearing, this._sharedViewerBearingHost);\n            }, 1000);\n          }\n        }\n      } catch (err) {\n",
              "after": "          const coords = data.geometry?.coordinates; // [lon, lat]\n\n          if (seqId && coords) {\n            // Pin the saved heading while the SDK opens/centers the image.\n            this._isFlyInActive=true;this._sharedStartupImageId=String(sharedId);this._sharedStartupBearing=bearing;this._lastBearing=bearing;\n            try {\n              await this.loadSequenceById(seqId,sharedId);\n              const restoreCurrent=()=>current()&&String(this.state.imageId)===String(sharedId);\n              if(!restoreCurrent())return;\n              await restoreSharedViewerBearing(sharedId,coords,bearing,this._sharedViewerBearingHost,restoreCurrent);\n              if(!restoreCurrent())return;\n              // Anchoring can run in parallel with the camera flight when detail\n              // coverage is already available; it never blocks imagery or flight.\n              this.refreshActivePulseAnchor(sharedView);\n              if(this.ArcGISModules){\n                const {Point}=this.ArcGISModules;\n                await restoreSharedMapCamera(sharedView,coords,bearing,mapZoom,properties=>new Point(properties),restoreCurrent);\n              }\n              if(!restoreCurrent())return;\n              this.refreshActivePulseAnchor(sharedView);\n              this.requestConeRedraw(sharedView);\n            } finally {\n              if(current()){this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;}\n            }\n          }\n        }\n      } catch (err) {\n"
            },
            {
              "label": "Startup bearing readiness 8",
              "before": "        this._isFlyInActive = true;\n        try {\n          const { Point } = this.ArcGISModules;\n          await restoreSharedMapCamera(sharedView, [longitude, latitude], bearing, zoom, properties => new Point(properties));\n        } catch (error) {\n          if (current() && (error as any)?.name !== \"AbortError\") console.warn(\"[MapView] Could not restore the shared viewport:\", error);\n        } finally {\n",
              "after": "        this._isFlyInActive = true;\n        try {\n          const { Point } = this.ArcGISModules;\n          await restoreSharedMapCamera(sharedView, [longitude, latitude], bearing, zoom, properties => new Point(properties), current);\n        } catch (error) {\n          if (current() && (error as any)?.name !== \"AbortError\") console.warn(\"[MapView] Could not restore the shared viewport:\", error);\n        } finally {\n"
            },
            {
              "label": "Startup bearing readiness 9",
              "before": "    if (!view?.map || view.destroyed) return;\n    this.syncSceneTerrain(view);\n    const startupRevision = ++this._viewStartupRevision;\n    this._startupUrlParameters ??= readSharedLinkParameters();\n    this._isFlyInActive = false;\n    const startupMap = view.map;\n",
              "after": "    if (!view?.map || view.destroyed) return;\n    this.syncSceneTerrain(view);\n    const startupRevision = ++this._viewStartupRevision;\n    this._sharedStartupImageId=null;this._sharedStartupBearing=null;\n    this._startupUrlParameters ??= readSharedLinkParameters();\n    this._isFlyInActive = false;\n    const startupMap = view.map;\n"
            },
            {
              "label": "Startup bearing readiness 10",
              "before": "    // CLICK HANDLER\n    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\"||this.props.visible===false) return;\n      this.claimCurrentImagePresentation?.(view);\n      if(this._workspaceNoteLocation?.active){\n        evt.stopPropagation();const point=view.toMap(evt);\n",
              "after": "    // CLICK HANDLER\n    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\"||this.props.visible===false) return;\n      if(this._isFlyInActive)(view as any).animation?.stop();\n      this._sharedStartupImageId=null;this._sharedStartupBearing=null;this._isFlyInActive=false;this._sharedStateRestoreComplete=true;\n      this.claimCurrentImagePresentation?.(view);\n      if(this._workspaceNoteLocation?.active){\n        evt.stopPropagation();const point=view.toMap(evt);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/navigation/sharedLinkRestoration.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Startup bearing readiness 1",
              "before": "}\nexport interface SharedLinkMapView {\n  type: string;\n  when(): PromiseLike<unknown>;\n  goTo(target: any, options: any): PromiseLike<unknown>;\n}\nexport interface SharedLinkViewer {\n  getImage(): PromiseLike<{ compassAngle?: number | null }>;\n  setCenter(center: [number, number]): unknown;\n}\nexport interface SharedViewerBearingHost {\n",
              "after": "}\nexport interface SharedLinkMapView {\n  type: string;\n  zoom?: number;\n  center?: { longitude?: number; latitude?: number };\n  when(): PromiseLike<unknown>;\n  goTo(target: any, options: any): PromiseLike<unknown>;\n}\nexport interface SharedLinkViewer {\n  getImage(): PromiseLike<{ id?: string; compassAngle?: number | null }>;\n  setCenter(center: [number, number]): unknown;\n}\nexport interface SharedViewerBearingHost {\n"
            },
            {
              "label": "Startup bearing readiness 2",
              "before": "  return new URLSearchParams(search);\n}\n\n/** Restore the initial map flight after sequence loading; coordinates are [longitude, latitude].\n * Zoom is an ArcGIS map level, never Mapillary viewer zoom. The existing 3D heading/60\u00b0 tilt\n * and 2500 ms flight, or 2D 2000 ms flight, are awaited before the runtime updates its URL.\n */\nexport async function restoreSharedMapCamera(view: SharedLinkMapView, coordinates: readonly number[],\n  bearing: number, mapZoom: number, createPoint: (properties: any) => any): Promise<void> {\n  const targetPoint = createPoint({ longitude: coordinates[0], latitude: coordinates[1], spatialReference: { wkid: 4326 } });\n  await view.when();\n  if (view.type === '3d') {\n    await view.goTo({ target: targetPoint, heading: bearing, tilt: 60, zoom: mapZoom }, { animate: true, duration: 2500 });\n  } else {\n    await view.goTo({ target: targetPoint, zoom: mapZoom }, { animate: true, duration: 2000 });\n  }\n}\n\n/** Restore viewer bearing through normalized centre coordinates, without calling setZoom.\n * Reads the live viewer again after getImage resolves, preserving existing replacement behavior.\n * Viewer errors retain warning feedback; bearing and URL still update afterward, as before.\n * The runtime retains the 1000 ms invocation delay and its separate 1500 ms fly-in release.\n */\nexport async function restoreSharedViewerBearing(imageId: string, coordinates: readonly number[],\n  bearing: number, host: SharedViewerBearingHost): Promise<void> {\n  if (host.getViewer()) {\n    try {\n      const currentImage = await host.getViewer()!.getImage();\n      const imageBearing = currentImage.compassAngle ?? 0;\n      const diff = bearing - imageBearing;\n      const x = (((0.5 + diff / 360) % 1) + 1) % 1;\n      host.getViewer()!.setCenter([x, 0.5]);\n    } catch (error) { host.warn(error); }\n    host.onBearing(bearing);\n    host.updateUrl(imageId, coordinates[1], coordinates[0]);\n  }\n}\n",
              "after": "  return new URLSearchParams(search);\n}\n\n/** Duration reflects travel distance/zoom change, while SDK reduced-motion\n * preferences remain authoritative. Inputs may omit a geographic center. */\nexport function sharedMapFlightDuration(view: SharedLinkMapView, coordinates: readonly number[], zoom: number): number {\n const scene=view.type==='3d',delta=Number.isFinite(view.zoom)?Math.abs(zoom-view.zoom!):6;\n const lon=view.center?.longitude,lat=view.center?.latitude;\n let distance=0;\n if(Number.isFinite(lon)&&Number.isFinite(lat)){\n  const r=Math.PI/180,dlat=(coordinates[1]-lat!)*r,dlon=(coordinates[0]-lon!)*r;\n  const a=Math.sin(dlat/2)**2+Math.cos(lat!*r)*Math.cos(coordinates[1]*r)*Math.sin(dlon/2)**2;\n  distance=12742*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));\n }\n return Math.round(Math.min(scene?5000:4000,Math.max(scene?2000:1400,(scene?2000:1400)+delta*220+Math.log2(1+distance)*150)));\n}\n\n/** Await view readiness and camera completion; cancelled startup work never\n * starts a new flight. No fixed post-flight delay is added. */\nexport async function restoreSharedMapCamera(view: SharedLinkMapView, coordinates: readonly number[],\n  bearing: number, mapZoom: number, createPoint: (properties: any) => any, current:()=>boolean=()=>true): Promise<void> {\n  await view.when();\n  if(!current())return;\n  const targetPoint=createPoint({longitude:coordinates[0],latitude:coordinates[1],spatialReference:{wkid:4326}});\n  const target=view.type==='3d'?{target:targetPoint,heading:bearing,tilt:60,zoom:mapZoom}:{target:targetPoint,zoom:mapZoom};\n  await view.goTo(target,{animate:true,duration:sharedMapFlightDuration(view,coordinates,mapZoom),easing:'ease-in-out'});\n}\n\n/** Restore viewer bearing through normalized centre coordinates, without calling setZoom.\n * Apply as soon as the requested image is ready. A replacement viewer, different\n * image or cancelled startup cannot receive late center/bearing/URL writes.\n */\nexport async function restoreSharedViewerBearing(imageId: string, coordinates: readonly number[],\n  bearing: number, host: SharedViewerBearingHost, current:()=>boolean=()=>true): Promise<boolean> {\n  const viewer=host.getViewer();\n  if(!viewer||!current())return false;\n  try {\n    const image=await viewer.getImage();\n    if(!current()||host.getViewer()!==viewer||(image.id!=null&&String(image.id)!==String(imageId)))return false;\n    const diff=bearing-(image.compassAngle??0);\n    viewer.setCenter([(((0.5+diff/360)%1)+1)%1,0.5]);\n    host.onBearing(bearing);\n    host.updateUrl(imageId,coordinates[1],coordinates[0]);\n    return true;\n  } catch(error){if(current()&&host.getViewer()===viewer)host.warn(error);return false;}\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/sharedStartupReadiness.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst root=path.join(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/navigation/sharedLinkRestoration.ts','utf8')))(m,m.exports);const {restoreSharedMapCamera,restoreSharedViewerBearing,sharedMapFlightDuration}=m.exports;\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};const tick=()=>new Promise(r=>setImmediate(r));\ntest('long flights get more time than nearby moves and duration remains bounded',()=>{const near={type:'3d',zoom:19,center:{longitude:1,latitude:2}},far={type:'3d',zoom:2,center:{longitude:-90,latitude:40}};assert(sharedMapFlightDuration(far,[1,2],23)>sharedMapFlightDuration(near,[1,2],19));assert(sharedMapFlightDuration(far,[1,2],23)<=5000);assert(sharedMapFlightDuration(near,[1,2],19)>=2000)});\ntest('camera waits for view readiness and cancelled work cannot initiate a flight',async()=>{const ready=deferred(),calls=[],view={type:'3d',when:()=>ready.promise,goTo:(...args)=>{calls.push(args);return Promise.resolve()}};let current=true;const pending=restoreSharedMapCamera(view,[1,2],45,19,p=>p,()=>current);assert.equal(calls.length,0);current=false;ready.resolve();await pending;assert.equal(calls.length,0)});\ntest('bearing is applied immediately after requested image readiness, without a post-flight timer',async()=>{const image=deferred(),events=[],viewer={getImage:()=>image.promise,setCenter:point=>events.push(['center',point])},host={getViewer:()=>viewer,onBearing:b=>events.push(['bearing',b]),updateUrl:()=>events.push(['url']),warn:()=>assert.fail('warning')};const pending=restoreSharedViewerBearing('A',[1,2],90,host);assert.equal(events.length,0);image.resolve({id:'A',compassAngle:0});assert.equal(await pending,true);assert.deepEqual(events,[['center',[.75,.5]],['bearing',90],['url']])});\nfor(const kind of ['cancel','viewer','image'])test('late bearing read is ignored after '+kind+' replacement',async()=>{const image=deferred(),events=[],viewer={getImage:()=>image.promise,setCenter:()=>events.push('center')};let live=viewer,current=true;const pending=restoreSharedViewerBearing('A',[1,2],90,{getViewer:()=>live,onBearing:()=>events.push('bearing'),updateUrl:()=>events.push('url'),warn:()=>{}},()=>current);if(kind==='cancel')current=false;if(kind==='viewer')live={};image.resolve({id:kind==='image'?'B':'A',compassAngle:0});assert.equal(await pending,false);assert.deepEqual(events,[])});\nconst source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=widget.members.find(n=>n.name?.getText(sf)==='checkUrlForSharedState').getText(sf);\nfunction runtime(){const flight=deferred(),events=[],view={type:'3d',map:{},zoom:2,center:{longitude:0,latitude:0},when:()=>Promise.resolve(),goTo:()=>{events.push('flight');return flight.promise}};const Harness=new Function('fetch','GRAPH_API','SHARE_PARAMS','restoreSharedMapCamera','restoreSharedViewerBearing','readSharedLinkParameters',compile('class Harness{'+method+'};return Harness;'))(async()=>({ok:true,json:async()=>({sequence:'S',geometry:{coordinates:[1,2]}})}),{BASE:'https://fixture.invalid'},{IMAGE_ID:'pKey',BEARING:'b',ZOOM:'z',MAP_TYPE:'mt',LAT:'lat',LON:'lng'},restoreSharedMapCamera,restoreSharedViewerBearing,()=>new URLSearchParams());const w=new Harness();w.state={jimuMapView:{view},turboModeActive:false};w.props={};w._mapClickRevision=0;w._startupUrlParameters=new URLSearchParams('pKey=A&b=90&z=19');w.log=()=>{};w.setState=patch=>Object.assign(w.state,patch);w.loadSequenceById=async()=>{events.push(['open',w._lastBearing]);w.state.imageId='A'};w._sharedViewerBearingHost={getViewer:()=>({getImage:async()=>({id:'A',compassAngle:0})})};const viewer={getImage:async()=>({id:'A',compassAngle:0}),setCenter:()=>events.push('center')};w._sharedViewerBearingHost={getViewer:()=>viewer,onBearing:b=>{w._lastBearing=b;events.push('bearing')},updateUrl:()=>{},warn:()=>assert.fail('warning')};w.ArcGISModules={Point:function(p){return p}};w.refreshActivePulseAnchor=()=>events.push('anchor');w.requestConeRedraw=()=>events.push('redraw');w.syncMapLegendLayer=w.ensureAlwaysOnCoverageLayer=w.updateUrlWithCurrentImage=()=>{};return {w,view,flight,events}}\ntest('actual startup pins saved bearing before opening, centers before flight, and unlocks on camera completion',async()=>{const x=runtime(),pending=x.w.checkUrlForSharedState();await tick();assert.deepEqual(x.events.slice(0,3),[['open',90],'center','bearing']);assert(x.events.includes('flight'));assert.equal(x.w._isFlyInActive,true);assert.equal(x.w._sharedStartupBearing,90);x.flight.resolve();await pending;assert.equal(x.w._isFlyInActive,false);assert.equal(x.w._sharedStartupBearing,null);assert.equal(x.w._sharedStateRestoreComplete,true);assert(x.events.includes('redraw'));assert(!method.includes('setTimeout'))});\ntest('user selection while opening prevents late saved bearing and camera writes',async()=>{const x=runtime(),opening=deferred();x.w.loadSequenceById=()=>opening.promise;const pending=x.w.checkUrlForSharedState();await tick();x.w._mapClickRevision++;x.w.state.imageId='B';x.w._sharedStartupBearing=null;x.w._isFlyInActive=false;opening.resolve();await pending;assert(!x.events.includes('center'));assert(!x.events.includes('flight'));assert.equal(x.w.state.imageId,'B')});\n\ntest('aborted camera flight releases the saved heading and tracking lock',async()=>{const x=runtime();x.view.goTo=()=>Promise.reject(Object.assign(new Error('interrupted'),{name:'AbortError'}));await x.w.checkUrlForSharedState();assert.equal(x.w._isFlyInActive,false);assert.equal(x.w._sharedStartupBearing,null);assert.equal(x.w._sharedStartupImageId,null)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'startup-bearing-readiness-';

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
    if (manifest.installer !== 'startup-bearing-readiness' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-startup-bearing-readiness.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Startup bearing readiness confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'startup-bearing-readiness', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Startup bearing readiness confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
