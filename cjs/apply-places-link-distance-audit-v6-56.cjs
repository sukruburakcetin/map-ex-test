#!/usr/bin/env node
'use strict';
/**
 * Places link distance and audit v6.56. Compatible current v6 sources.
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
      "file": "src/features/places/SelectedPlace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/SelectedPlace.ts block 1",
              "before": "import { placeCategorySymbol, SELECTED_PLACE_ICON_RADIUS } from './placeIcons';\nimport type { Place } from './placesModel';\n/** One selection ring and an optional camera link; no queries, watches or animation. */\nexport class SelectedPlace {\n",
              "after": "import { cameraLinkDistance } from './cameraLinkDistance';\nimport { placeCategorySymbol, SELECTED_PLACE_ICON_RADIUS } from './placeIcons';\nimport type { Place } from './placesModel';\n/** One selection ring and an optional camera link; no queries, watches or animation. */\nexport class SelectedPlace {\n"
            },
            {
              "label": "src/features/places/SelectedPlace.ts block 2",
              "before": "  private view: any = null;\n  private ring: any = null;\n  private line: any = null;\n  private lineUnderlay: any = null;\n  private camera: [number, number] | null = null;\n  private link = false;\n  constructor(private host: { id: string; modules: any; view(): any; changed?(place: Place | null): void }) {}\n  select(place: Place): void {\n",
              "after": "  private view: any = null;\n  private ring: any = null;\n  private line: any = null;\n  private lineUnderlay: any = null;\n  private distanceLabel: any = null;\n  get stats() { return { selected: !!this.place, linkEnabled: this.link, graphics: Number(!!this.ring) + Number(!!this.line) + Number(!!this.lineUnderlay) + Number(!!this.distanceLabel) }; }\n  private camera: [number, number] | null = null;\n  private link = false;\n  constructor(private host: { id: string; modules: any; view(): any; changed?(place: Place | null): void }) {}\n  select(place: Place): void {\n"
            },
            {
              "label": "src/features/places/SelectedPlace.ts block 3",
              "before": "    this.renderLink();\n  }\n  private renderLink(): void {\n    if (!this.layer || !this.place) return;\n    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; if (this.lineUnderlay) this.lineUnderlay.visible = false; return; }\n    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };\n    if (this.line) {\n      this.line.geometry = geometry; this.line.visible = true;\n      this.lineUnderlay.geometry = geometry; this.lineUnderlay.visible = true;\n",
              "after": "    this.renderLink();\n  }\n  private renderLink(): void {\n    if (!this.layer || !this.place) return;\n    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; if (this.lineUnderlay) this.lineUnderlay.visible = false; if (this.distanceLabel) this.distanceLabel.visible = false; return; }\n    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };\n    if (this.line) {\n      this.line.geometry = geometry; this.line.visible = true;\n      this.lineUnderlay.geometry = geometry; this.lineUnderlay.visible = true;\n"
            },
            {
              "label": "src/features/places/SelectedPlace.ts block 4",
              "before": "      this.layer.addMany([this.lineUnderlay, this.line]);\n      // Keep the selected badge above both strokes where they meet the place.\n      this.layer.graphics?.reorder?.(this.ring, this.layer.graphics.length - 1);\n    }\n  }\n  private removeLayer(): void {\n    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }\n    this.layer = null; this.view = null; this.ring = null; this.line = null; this.lineUnderlay = null;\n  }\n}\n",
              "after": "      this.layer.addMany([this.lineUnderlay, this.line]);\n      // Keep the selected badge above both strokes where they meet the place.\n      this.layer.graphics?.reorder?.(this.ring, this.layer.graphics.length - 1);\n    }\n    const label = cameraLinkDistance(this.camera, [this.place.lon, this.place.lat]);\n    if (!label) { if (this.distanceLabel) this.distanceLabel.visible = false; return; }\n    const point = new this.host.modules.Point({ longitude: label.lon, latitude: label.lat, spatialReference: { wkid: 4326 } });\n    if (this.distanceLabel) {\n      this.distanceLabel.geometry = point; this.distanceLabel.visible = true;\n      if (this.distanceLabel.symbol.text !== label.text) this.distanceLabel.symbol = this.labelSymbol(label.text);\n    } else {\n      this.distanceLabel = new this.host.modules.Graphic({ geometry: point, symbol: this.labelSymbol(label.text) }); this.layer.addMany([this.distanceLabel]);\n    }\n    this.layer.graphics?.reorder?.(this.ring, this.layer.graphics.length - 1);\n  }\n  private labelSymbol(text: string): any {\n    return { type: 'text', text, color: '#16343b', haloColor: '#f3ffff', haloSize: 1.5, yoffset: 8, font: { size: 10, weight: 'bold' } };\n  }\n  private removeLayer(): void {\n    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }\n    this.layer = null; this.view = null; this.ring = null; this.line = null; this.lineUnderlay = null; this.distanceLabel = null;\n  }\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/ArcGISPlaces.ts block 1",
              "before": "/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\nexport class ArcGISPlaces {\n  private service: any = null;\n  private published: PlaceBbox | null = null;\n  get coverageExtent(): PlaceBbox | null { return this.published; }\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n",
              "after": "/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\nexport class ArcGISPlaces {\n  private service: any = null;\n  private published: PlaceBbox | null = null;\n  get stats() { return { ...this.controller.stats, loaded: this.records.size, rendered: this.graphics?.graphics?.length ?? 0, overlapGroups: this.groups.size, cachedSymbols: this.iconSymbols.size + this.countSymbols.size, selection: this.selection.stats }; }\n  get coverageExtent(): PlaceBbox | null { return this.published; }\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n"
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
              "label": "src/runtime/widget.tsx block 1",
              "before": "      routes: sequenceRouteMemoryStats(this.sequenceCoordsCache),\n      nearby: this._sequenceDemand.memoryStats,\n      view: this.state.jimuMapView?.view?.type ?? null,\n      imageTiling: this._viewerImageTiling ?? null,\n    };\n  }\n\n  private clearSequenceDiagnostics() {\n",
              "after": "      routes: sequenceRouteMemoryStats(this.sequenceCoordsCache),\n      nearby: this._sequenceDemand.memoryStats,\n      view: this.state.jimuMapView?.view?.type ?? null,\n      imageTiling: this._viewerImageTiling ?? null,\n      places: { active: !!this.state.placesActive, status: this.state.placesStatus?.kind ?? 'off', ...this._places?.stats },\n    };\n  }\n\n  private clearSequenceDiagnostics() {\n"
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
              "label": "tests/overturePlaces.test.cjs block 1",
              "before": " class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);assert.equal(ring.symbol.width,21);selection.setLink(true);const underlay=layer.items[1],line=layer.items[2];assert.equal(created,3);assert.deepEqual(line.symbol.color,[64,224,240,1]);assert.equal(line.symbol.width,1.25);assert.equal(line.symbol.style,'dash');assert.equal(underlay.symbol.style,'solid');assert(underlay.symbol.width>line.symbol.width);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,3);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],underlay);assert.equal(layer.items[2],line);assert.deepEqual(underlay.geometry.paths,line.geometry.paths);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:23,y:10}),'p');assert.equal(selection.screenTarget({x:25,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);assert.equal(underlay.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);assert.equal(underlay.visible,true);assert.deepEqual(underlay.geometry.paths,line.geometry.paths);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\ntest('bundled category icons are distinct, self-contained and reject arbitrary category markup',()=>{\n const icons=load('placeIcons'),groups=['health','education','parks','landmarks','services'];const urls=groups.map(g=>icons.placeCategoryIcon(g));assert.equal(new Set(urls).size,5);\n",
              "after": " class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);assert.equal(ring.symbol.width,21);selection.setLink(true);const underlay=layer.items[1],line=layer.items[2];assert.equal(created,4);const label=layer.items[3];assert.equal(label.symbol.type,'text');assert.match(label.symbol.text,/m|km/);assert.deepEqual(line.symbol.color,[64,224,240,1]);assert.equal(line.symbol.width,1.25);assert.equal(line.symbol.style,'dash');assert.equal(underlay.symbol.style,'solid');assert(underlay.symbol.width>line.symbol.width);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,4);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],underlay);assert.equal(layer.items[2],line);assert.deepEqual(underlay.geometry.paths,line.geometry.paths);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:23,y:10}),'p');assert.equal(selection.screenTarget({x:25,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);assert.equal(underlay.visible,false);assert.equal(label.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);assert.equal(underlay.visible,true);assert.equal(label.visible,true);assert.equal(layer.items[3],label);assert.deepEqual(underlay.geometry.paths,line.geometry.paths);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\ntest('bundled category icons are distinct, self-contained and reject arbitrary category markup',()=>{\n const icons=load('placeIcons'),groups=['health','education','parks','landmarks','services'];const urls=groups.map(g=>icons.placeCategoryIcon(g));assert.equal(new Set(urls).size,5);\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const ranked=nearby.rankPlaceImagery(place,[row('first',10),row('duplicate',11),row('farther',35),row('other-sequence',20,'b')],75,distance);assert.deepEqual(ranked.map(p=>p.id),['first','other-sequence','farther']);assert.equal(nearby.rankPlaceImagery(place,[row('a',10),row('b',11),row('c',12)],75,distance).length,1);assert.deepEqual(nearby.rankPlaceImagery(place,[row('facing',10),row('away',5,'b',180)],75,distance).map(p=>p.id),['facing']);\n const computed=[row('first',10,'a',0,{computed_geometry:{coordinates:[0,-10/111195]}}),row('gps-shift',30,'a',0,{computed_geometry:{coordinates:[0,-11/111195]}})];assert.equal(nearby.rankPlaceImagery(place,computed,75,distance).length,1);\n const dates=nearby.rankPlaceImagery(place,[row('old',10,'a',0,{captured_at:1704067200000}),row('new',10,'a',0,{captured_at:1704240000000})],75,distance);assert.deepEqual(dates.map(p=>p.id),['new','old']);\n});\n",
              "after": " const ranked=nearby.rankPlaceImagery(place,[row('first',10),row('duplicate',11),row('farther',35),row('other-sequence',20,'b')],75,distance);assert.deepEqual(ranked.map(p=>p.id),['first','other-sequence','farther']);assert.equal(nearby.rankPlaceImagery(place,[row('a',10),row('b',11),row('c',12)],75,distance).length,1);assert.deepEqual(nearby.rankPlaceImagery(place,[row('facing',10),row('away',5,'b',180)],75,distance).map(p=>p.id),['facing']);\n const computed=[row('first',10,'a',0,{computed_geometry:{coordinates:[0,-10/111195]}}),row('gps-shift',30,'a',0,{computed_geometry:{coordinates:[0,-11/111195]}})];assert.equal(nearby.rankPlaceImagery(place,computed,75,distance).length,1);\n const dates=nearby.rankPlaceImagery(place,[row('old',10,'a',0,{captured_at:1704067200000}),row('new',10,'a',0,{captured_at:1704240000000})],75,distance);assert.deepEqual(dates.map(p=>p.id),['new','old']);\n});\ntest('camera-link distance has safe units, a short-longitude midpoint and rejects invalid positions',()=>{\n const {cameraLinkDistance}=load('cameraLinkDistance');const label=cameraLinkDistance([0,0],[0,.0004]);assert.equal(label.text,'44 m');assert.equal(label.lon,0);assert.equal(label.lat,.0002);assert.equal(cameraLinkDistance([0,0],[0,0]).text,'<1 m');assert.equal(cameraLinkDistance([0,0],[0,.02]).text,'2.2 km');assert(Math.abs(cameraLinkDistance([179.9,0],[-179.9,0]).lon)===180);assert.equal(cameraLinkDistance([Infinity,0],[0,0]),null);\n});\ntest('manual audit takes bounded aggregate snapshots with no timers or network access',()=>{\n const vm=require('node:vm'),source=fs.readFileSync(path.join(root,'tools/performance/places-audit.js'),'utf8');let resets=0,clock=0;const entry={reset(){resets++;},snapshot:()=>({timings:{},places:{active:true,loaded:10},view:'2d'})};const context={window:{__mapillarySequencePerformance:{w:entry}},performance:{now:()=>clock,memory:{usedJSHeapSize:100}},setTimeout(){throw Error('no timers');},fetch(){throw Error('no requests');}};vm.runInNewContext(source,context);const audit=context.window.mapillaryPlacesAudit;for(let i=0;i<12;i++){audit.start('phase');clock+=100;const result=audit.stop();assert.equal(result.elapsedMs,100);}assert.equal(resets,12);assert.equal(audit.report().length,10);audit.clear();assert.equal(audit.report().length,0);assert.throws(()=>audit.stop());\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/OVERTURE-PLACES.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "docs/OVERTURE-PLACES.md block 1",
              "before": "\nCategory changes are saved as one validated local-storage string, scoped by this browser origin (inherent storage scope), app pathname, widget ID and credential-free service URL. The saved category is read when the user explicitly enables Places, not at startup. Places still starts off, and selection/link state is not restored. Choosing All places saves that choice. If storage is blocked, missing or invalid, the current in-memory category continues to work. No coordinates, image IDs, tokens or service responses are stored by this preference.\n\nImagery ranking preserves the best primary result. Alternatives prefer different sequences, then frames from the same sequence that are at least 15 m apart using computed camera positions when available, or captured at least 24 hours apart. Facing-image alternatives stay in the facing tier before considering panoramas. Other best-direction tiers stay within that tier, so diversity alone does not promote unknown/sideways/away-facing images above better directional choices. Duplicate IDs and near-identical same-sequence frames are not used to fill slots: a search may offer only one or two options. The same 40-record search page, radius checks and explicit wider search remain; no extra requests or thumbnail downloads are introduced.\n",
              "after": "\nCategory changes are saved as one validated local-storage string, scoped by this browser origin (inherent storage scope), app pathname, widget ID and credential-free service URL. The saved category is read when the user explicitly enables Places, not at startup. Places still starts off, and selection/link state is not restored. Choosing All places saves that choice. If storage is blocked, missing or invalid, the current in-memory category continues to work. No coordinates, image IDs, tokens or service responses are stored by this preference.\n\nImagery ranking preserves the best primary result. Alternatives prefer different sequences, then frames from the same sequence that are at least 15 m apart using computed camera positions when available, or captured at least 24 hours apart. Facing-image alternatives stay in the facing tier before considering panoramas. Other best-direction tiers stay within that tier, so diversity alone does not promote unknown/sideways/away-facing images above better directional choices. Duplicate IDs and near-identical same-sequence frames are not used to fill slots: a search may offer only one or two options. The same 40-record search page, radius checks and explicit wider search remain; no extra requests or thumbnail downloads are introduced.\n\n\n## Camera-link distance and live audit workflow (v6.56)\n\nShow camera link now includes a small distance label near the link midpoint, offset above the line for readability. It uses loaded camera/POI coordinates, approximate straight-line metres/kilometres and one reusable text Graphic. It updates only on the existing camera-coordinate path, hides with the link and is removed on selection teardown. The selected badge stays above the line/label. The selection budget is now at most four retained Graphics (badge, two strokes and label), even across repeated image updates. It is not a route distance, visibility result or POI elevation estimate.\n\nThe existing debug-only sequence snapshot now includes Places counts/cache/selection statistics, read only when a snapshot is requested. There is no new sampling loop or observer. [The live audit workflow](../tools/performance/PLACES-AUDIT.md) and browser-console helper compare the same manual browsing actions with Places off/on using existing click/hover/playback/long-task summaries. The helper retains at most ten aggregate reports and makes no requests. Chromium heap data, when available, covers the entire page and excludes GPU memory. The helper does not measure FPS.\n\nThis cloud environment cannot access the user's localhost app, so deployment results remain unmeasured until that workflow is run in the actual browser. A local actual-ArcGIS object update check performed 1,000 camera updates in about 161 ms while retaining the same four Graphics and label instance; it excludes map rendering and network, and is not a live mobile performance result.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/cameraLinkDistance.ts",
      "content": "import { distanceMeters } from '../../utils/geoUtils';\n/** Shortest-longitude midpoint, with approximate straight-line distance (not a route). */\nexport function cameraLinkDistance(camera: readonly number[], place: readonly number[]): { lon: number; lat: number; text: string } | null {\n  if (camera.length < 2 || place.length < 2 || ![camera[0], camera[1], place[0], place[1]].every(Number.isFinite) || Math.abs(camera[0]) > 180 || Math.abs(place[0]) > 180 || Math.abs(camera[1]) > 90 || Math.abs(place[1]) > 90) return null;\n  const distance = distanceMeters(camera[1], camera[0], place[1], place[0]);\n  const dx = ((place[0] - camera[0] + 540) % 360) - 180;\n  const lon = ((camera[0] + dx / 2 + 540) % 360) - 180;\n  const text = distance < 1 ? '<1 m' : distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`;\n  return { lon, lat: (camera[1] + place[1]) / 2, text };\n}\n"
    },
    {
      "file": "tools/performance/places-audit.js",
      "content": "/* Paste into the application's DevTools console after enabling widget debug mode.\n * Manual snapshots only: no polling, observers, network calls or automatic UI actions.\n */\n(() => {\n  let active = null;\n  const records = [];\n  const heap = () => Number.isFinite(performance.memory?.usedJSHeapSize) ? performance.memory.usedJSHeapSize : null;\n  const clone = value => JSON.parse(JSON.stringify(value));\n  window.mapillaryPlacesAudit = {\n    start(label, widgetId) {\n      if (active) throw new Error('Stop or cancel the current phase first.');\n      const registry = window.__mapillarySequencePerformance || {}, ids = Object.keys(registry);\n      const id = widgetId == null && ids.length === 1 ? ids[0] : String(widgetId ?? '');\n      const entry = registry[id];\n      if (!entry) throw new Error('Enable widget debug mode and choose the application frame. Pass a widget ID if several are active.');\n      entry.reset();\n      active = { label: String(label || 'phase').slice(0, 80), id, entry, started: performance.now(), heapStart: heap() };\n      return { label: active.label, widgetId: id, instruction: 'Perform the same browsing actions, then call mapillaryPlacesAudit.stop().' };\n    },\n    stop() {\n      if (!active) throw new Error('Start a phase first.');\n      const phase = active; active = null;\n      if (window.__mapillarySequencePerformance?.[phase.id] !== phase.entry) throw new Error('Widget diagnostics changed during this phase. Repeat it.');\n      const snapshot = phase.entry.snapshot();\n      const result = clone({ label: phase.label, elapsedMs: performance.now() - phase.started,\n        timings: snapshot.timings, counters: snapshot.counters, playbackFrameGaps: snapshot.playbackFrameGaps,\n        longTasks: snapshot.longTasks, places: snapshot.places, tiles: snapshot.tiles,\n        sequenceIndex: snapshot.sequenceIndex, background: snapshot.background, routes: snapshot.routes, nearby: snapshot.nearby,\n        view: snapshot.view, imageTiling: snapshot.imageTiling, allPageHeapStartBytes: phase.heapStart, allPageHeapEndBytes: heap() });\n      records.push(result); if (records.length > 10) records.shift();\n      return clone(result);\n    },\n    cancel() { active = null; },\n    report() { return clone(records); },\n    clear() { active = null; records.length = 0; },\n  };\n  return 'Places audit ready. Use mapillaryPlacesAudit.start(\"places-off\"), then .stop().';\n})();\n"
    },
    {
      "file": "tools/performance/PLACES-AUDIT.md",
      "content": "# Measure Places in your actual map\n\nThe cloud environment cannot open your localhost application. This workflow uses your running widget's existing diagnostics and manual browsing. It does not fetch data, poll, automate clicks or add observers. Enable widget **debug mode**, open the app and choose its frame in DevTools. Paste the contents of `tools/performance/places-audit.js` into the console once.\n\nThe script resets diagnostic counters at phase start, retains at most ten aggregate reports, and samples memory only at start/stop. It does not record URLs, coordinates, image identities or access tokens. Use `mapillaryPlacesAudit.cancel()` if you need to abandon a phase. Re-paste after a page reload.\n\n## Compare the same work\n\n1. Choose a dense part of the published area, with the same zoom/map mode, basemap and filters. Warm up a short imagery route, then pause. Keep the tab visible, network conditions stable and debug mode the same for both phases. Do not mix cold-refresh results with warm-cache results.\n2. Turn Places off; wait for the map to settle. Run:\n\n   ```js\n   mapillaryPlacesAudit.start('places-off-warm')\n   ```\n\n3. Perform a repeatable 30\u201360 second pass: the same ten image clicks, several coverage hovers, the same pan/zoom gestures, then a short playback segment. Pause and wait for outstanding work before running:\n\n   ```js\n   mapillaryPlacesAudit.stop()\n   ```\n\n4. Turn Places on, wait for its results, and repeat the same pass:\n\n   ```js\n   mapillaryPlacesAudit.start('places-on-warm')\n   // Perform the same actions, then:\n   mapillaryPlacesAudit.stop()\n   ```\n\n5. Repeat off/on once more to expose network/cache variance. Also check one pass with **Show camera link** enabled. Repeat in 3D and on the actual phone; browser device emulation is not a phone performance measurement.\n6. Inspect/export the aggregate reports:\n\n   ```js\n   mapillaryPlacesAudit.report()\n   // Chrome DevTools helper: copy JSON to clipboard.\n   copy(JSON.stringify(mapillaryPlacesAudit.report(), null, 2))\n   ```\n\nIf several widgets are active, pass the correct ID as the second `start` argument. List them with `Object.keys(window.__mapillarySequencePerformance)`.\n\n## Interpret carefully\n\n- Compare `timings['click-image']` and `timings['hover-highlight']` p50/p95 with comparable sample counts; fewer than ten samples is a weak comparison. These are existing widget timings, not isolated Places renderer timings.\n- `playbackFrameGaps` describes gaps between confirmed images, not GPU frames or proof of a playback stall. Compare its distribution and what you observe.\n- `longTasks` covers the page while debug diagnostics are enabled; other widgets/basemap work can contribute.\n- Places snapshot counts show loaded records, rendered/group counts, bounded symbol cache and selected-overlay graphic count. They contain counts only. Places-off should have no owned active controller/graphics. A link-enabled selection now retains at most four graphics: selected badge, two strokes and distance label.\n- `allPageHeap*` is Chromium's optional whole-page JS heap, not per-widget memory; other browsers may return null. It excludes GPU/decoded-image allocations. Sustained memory should be assessed over several minutes, not one delta. A higher retained cache is not by itself a leak.\n- To inspect pan/zoom rendering, record comparable traces in DevTools **Performance** and inspect frames/long tasks. This snapshot tool does not measure FPS. Check Network for duplicated requests with off/on; it deliberately does not export request URLs.\n\nThere is no measured deployment result until you run this comparison locally. Small one-run differences can be noise. If Places-on repeatedly worsens image latency/playback, share the aggregate reports and the matching trace so the cause can be narrowed down.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-link-distance-audit-v6-56-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.56 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-link-distance-audit-v6-56' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.56 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.56 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.56 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-link-distance-audit-v6-56.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places link distance and audit v6.56 is already installed. No files changed.');
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
  const manifest = { installer: 'places-link-distance-audit-v6-56', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places link distance and audit v6.56 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
