#!/usr/bin/env node
'use strict';
/**
 * Places bearing v6.41. Compatible current v6 sources.
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
              "label": "src/runtime/widget.tsx block 1",
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      return choosePlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n",
              "after": "    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry,compass_angle,computed_compass_angle,is_pano&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      return choosePlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "  private async openPlaceImagery(image: PlaceImagery) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n    view.closePopup();\n    try { await this.loadSequenceById(image.sequence, image.id, { lon: image.lon, lat: image.lat }); }\n    catch { this.showToast('Nearby imagery could not open. Choose another image point or try again.', 4000); }\n  }\n\n  private mapillaryVTLayer: __esri.VectorTileLayer | null = null;\n",
              "after": "  private async openPlaceImagery(image: PlaceImagery) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n    view.closePopup();\n    const request = this._selectionRequestId + 1;\n    try {\n      await this.loadSequenceById(image.sequence, image.id, { lon: image.lon, lat: image.lat });\n      const viewer = this.mapillaryViewer;\n      const current = () => this._selectionRequestId === request && this.state.jimuMapView?.view === view && !view.destroyed && this.mapillaryViewer === viewer && String(this.state.imageId) === image.id;\n      if (viewer && current()) {\n        // Optional local orientation must never turn a successful image open into an error.\n        try {\n          const bearing = await facePlaceInPanorama(viewer, image, current);\n          if (bearing != null && current()) { this._lastBearing = bearing; this.updateUrlWithCurrentImage(image.id); }\n        } catch { /* Keep the opened panorama usable when orientation is unavailable. */ }\n      }\n    }\n    catch { this.showToast('Nearby imagery could not open. Choose another image point or try again.', 4000); }\n  }\n\n  private mapillaryVTLayer: __esri.VectorTileLayer | null = null;\n"
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
              "before": "import { PlaceImagery } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n",
              "after": "import { PlaceImagery, placeImageryDirectionLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found) {\n          candidate = found; button.textContent = `Open imagery \u00b7 about ${Math.ceil(found.distance)} m away`;\n          status.textContent = 'Closest result in this search. The camera may not face this place.';\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther \u00b7 within 250 m';\n          status.textContent = 'No image found within 75 m. You can try a wider area.';\n        } else {\n",
              "after": "        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found) {\n          candidate = found; button.textContent = `Open imagery \u00b7 about ${Math.ceil(found.distance)} m away`;\n          status.textContent = `${placeImageryDirectionLabel(found)}. Direction is an estimate; visibility is not confirmed.`;\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther \u00b7 within 250 m';\n          status.textContent = 'No image found within 75 m. You can try a wider area.';\n        } else {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/nearbyPlaceImagery.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 1",
              "before": "import { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\n",
              "after": "import { calculateBearing } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\n"
            },
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 2",
              "before": "/** Rank only this bounded page, not all Mapillary imagery. Reject either reported position outside the radius. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  placeImageryBbox(place, radius);\n  let best: PlaceImagery | null = null;\n  for (const row of rows.slice(0, 40)) {\n    const p = coordinates(row.geometry);\n    if (!p || !row.id || !row.sequence) continue;\n    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);\n",
              "after": "/** Rank only this bounded page, not all Mapillary imagery. Reject either reported position outside the radius. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  placeImageryBbox(place, radius);\n  let best: PlaceImagery | null = null;\n  let bestRank = Infinity;\n  for (const row of rows.slice(0, 40)) {\n    const p = coordinates(row.geometry);\n    if (!p || !row.id || !row.sequence) continue;\n    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);\n"
            },
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 3",
              "before": "    if (!computed) continue;\n    const computedDistance = distance(place.lat, place.lon, computed[1], computed[0]);\n    const conservativeDistance = Math.max(originalDistance, computedDistance);\n    if (!Number.isFinite(conservativeDistance) || conservativeDistance > radius) continue;\n    const candidate = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius };\n    if (!best || candidate.distance < best.distance) best = candidate;\n  }\n  return best;\n}\n",
              "after": "    if (!computed) continue;\n    const computedDistance = distance(place.lat, place.lon, computed[1], computed[0]);\n    const conservativeDistance = Math.max(originalDistance, computedDistance);\n    if (!Number.isFinite(conservativeDistance) || conservativeDistance > radius) continue;\n    // Use a heading with its matching coordinate source; zero degrees is valid.\n    const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 360;\n    const computedHeading = row.computed_geometry != null && number(row.computed_compass_angle);\n    const heading = computedHeading ? row.computed_compass_angle : number(row.compass_angle) ? row.compass_angle : null;\n    const origin = computedHeading ? computed : p;\n    const originDistance = distance(place.lat, place.lon, origin[1], origin[0]);\n    const bearing = calculateBearing(origin[1], origin[0], place.lat, place.lon);\n    const angle = heading != null && originDistance >= 3 ? Math.abs(((bearing - heading + 540) % 360) - 180) : undefined;\n    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat };\n    if (!best || rank < bestRank || (rank === bestRank && candidate.distance < best.distance)) { best = candidate; bestRank = rank; }\n  }\n  return best;\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360\u00b0 panorama \u00b7 can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';\n}\n/** One local viewer read; never rotate a flat image or a newer user selection. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (image.direction !== 'panorama' || !Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n  const opened = await viewer.getImage();\n  if (!current() || String(opened?.id) !== image.id || opened?.isPano !== true || typeof opened.compassAngle !== 'number' || !Number.isFinite(opened.compassAngle)) return null;\n  const origin = opened.originalLngLat ?? opened.lngLat;\n  if (!origin || !Number.isFinite(origin.lng) || !Number.isFinite(origin.lat)) return null;\n  const bearing = calculateBearing(origin.lat, origin.lng, image.placeLat!, image.placeLon!);\n  const x = ((.5 + (bearing - opened.compassAngle) / 360) % 1 + 1) % 1;\n  if (!current()) return null;\n  await viewer.setCenter([x, .5]);\n  return current() ? bearing : null;\n}\n"
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
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,root=path.resolve(__dirname,'..');\nfunction load(name){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src/features/places',name+'.ts'),'utf8')))(id=>load(path.posix.basename(id)),m,m.exports);return m.exports;}\nconst model=load('placesModel'),{PlacesController}=load('PlacesController');\nconst row=(i=1,extra={})=>({attributes:{gers_id:'gers-'+i,place_name:'School '+i,category:'school',place_group:'education',confidence:.98,...extra},geometry:{x:.5,y:.5}});\nconst flush=()=>new Promise(resolve=>setImmediate(resolve));\nfunction fixture(){let now=0,id=0;const timers=new Map(),idle=new Map(),calls=[],displays=[],statuses=[];const f={view:{token:{},bbox:[0,0,1,1],zoom:16,stationary:true},busy:false,clears:0,visible:true,calls,displays,statuses};const host={view:()=>f.view,busy:()=>f.busy,query:(bbox,group,signal)=>new Promise((resolve,reject)=>calls.push({bbox,group,signal,resolve,reject})),display:(places,token)=>displays.push({places,token}),visible:v=>f.visible=v,clear:()=>f.clears++,status:s=>statuses.push(s),timer:(work,ms)=>{const key=++id;timers.set(key,{work,at:now+ms});return key;},cancelTimer:k=>timers.delete(k),idle:work=>{const key=++id;idle.set(key,work);return key;},cancelIdle:k=>idle.delete(k),now:()=>now};f.controller=new PlacesController(host);f.advance=async(ms=650)=>{now+=ms;for(const[k,t]of[...timers])if(t.at<=now){timers.delete(k);t.work();}for(const[k,work]of[...idle]){idle.delete(k);work();}await flush();};f.complete=async(features=[row()],limited=false)=>{calls.at(-1).resolve({features,limited});await flush();};f.pending=()=>timers.size+idle.size;return f;}\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,root=path.resolve(__dirname,'..');\nfunction load(name){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,name==='geoUtils'?'src/utils':'src/features/places',name+'.ts'),'utf8')))(id=>load(path.posix.basename(id)),m,m.exports);return m.exports;}\nconst model=load('placesModel'),{PlacesController}=load('PlacesController');\nconst row=(i=1,extra={})=>({attributes:{gers_id:'gers-'+i,place_name:'School '+i,category:'school',place_group:'education',confidence:.98,...extra},geometry:{x:.5,y:.5}});\nconst flush=()=>new Promise(resolve=>setImmediate(resolve));\nfunction fixture(){let now=0,id=0;const timers=new Map(),idle=new Map(),calls=[],displays=[],statuses=[];const f={view:{token:{},bbox:[0,0,1,1],zoom:16,stationary:true},busy:false,clears:0,visible:true,calls,displays,statuses};const host={view:()=>f.view,busy:()=>f.busy,query:(bbox,group,signal)=>new Promise((resolve,reject)=>calls.push({bbox,group,signal,resolve,reject})),display:(places,token)=>displays.push({places,token}),visible:v=>f.visible=v,clear:()=>f.clears++,status:s=>statuses.push(s),timer:(work,ms)=>{const key=++id;timers.set(key,{work,at:now+ms});return key;},cancelTimer:k=>timers.delete(k),idle:work=>{const key=++id;idle.set(key,work);return key;},cancelIdle:k=>idle.delete(k),now:()=>now};f.controller=new PlacesController(host);f.advance=async(ms=650)=>{now+=ms;for(const[k,t]of[...timers])if(t.at<=now){timers.delete(k);t.work();}for(const[k,work]of[...idle]){idle.delete(k);work();}await flush();};f.complete=async(features=[row()],limited=false)=>{calls.at(-1).resolve({features,limited});await flush();};f.pending=()=>timers.size+idle.size;return f;}\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','choosePlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.choosePlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate.id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert.equal(w._placesExploreAbort,null);\n w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\n",
              "after": " const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','choosePlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.choosePlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate.id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert.equal(w._placesExploreAbort,null);\n w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\ntest('heading ranking prefers facing images over closer away/unknown images and wraps north correctly',()=>{\n const place={lon:0,lat:0},image=(id,metres,heading,extra={})=>({id,sequence:'s',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,...extra});\n let chosen=nearby.choosePlaceImagery(place,[image('away',5,180),image('unknown',6,null),image('facing',50,0)],75,distance);assert.equal(chosen.id,'facing');assert.equal(chosen.direction,'facing');assert(chosen.angle<.001);\n chosen=nearby.choosePlaceImagery(place,[image('north-wrap',30,359),image('side',5,90)],75,distance);assert.equal(chosen.id,'north-wrap');assert.equal(chosen.angle,1);\n assert.equal(nearby.choosePlaceImagery(place,[image('unknown',10,null)],75,distance).direction,'unknown');assert.equal(nearby.choosePlaceImagery(place,[image('bad',10,'0')],75,distance).direction,'unknown');\n assert.equal(nearby.choosePlaceImagery(place,[image('coincident',0,0)],75,distance).direction,'unknown');\n assert.equal(nearby.choosePlaceImagery(place,[image('side',10,90)],75,distance).direction,'sideways');assert.equal(nearby.choosePlaceImagery(place,[image('away',10,180)],75,distance).direction,'away');\n});\ntest('matching computed heading/position is used; panorama is separate and distances break similar-angle ties',()=>{\n const place={lon:0,lat:0},base={sequence:'s',geometry:{coordinates:[0,-.0004]},compass_angle:180};\n const computed={...base,id:'computed',computed_geometry:{coordinates:[0,.0004]},computed_compass_angle:180};assert.equal(nearby.choosePlaceImagery(place,[computed],75,distance).direction,'facing');\n const pano={...base,id:'pano',is_pano:true};assert.equal(nearby.choosePlaceImagery(place,[base,pano],75,distance).direction,'panorama');\n const closer={...base,id:'close',compass_angle:10,geometry:{coordinates:[0,-.0002]}};const farther={...base,id:'far',compass_angle:5};assert.equal(nearby.choosePlaceImagery(place,[farther,closer],75,distance).id,'close');\n assert.match(nearby.placeImageryDirectionLabel({direction:'facing'}),/Facing toward/);assert.match(nearby.placeImageryDirectionLabel({}),/unknown/);\n});\ntest('panorama orientation uses the opened camera position and never rotates stale or flat imagery',async()=>{\n let centered=null,reads=0;const image={id:'pano',direction:'panorama',placeLon:1,placeLat:0};const viewer={getImage:async()=>{reads++;return{id:'pano',isPano:true,compassAngle:0,originalLngLat:{lng:0,lat:0}};},setCenter:p=>centered=p};\n const bearing=await nearby.facePlaceInPanorama(viewer,image,()=>true);assert.equal(bearing,90);assert.deepEqual(centered,[.75,.5]);centered=null;\n await nearby.facePlaceInPanorama(viewer,{...image,direction:'facing'},()=>true);assert.equal(reads,1);assert.equal(centered,null);\n await nearby.facePlaceInPanorama(viewer,image,()=>false);assert.equal(reads,1);\n let resolve;viewer.getImage=()=>new Promise(r=>resolve=r);let current=true;const pending=nearby.facePlaceInPanorama(viewer,image,()=>current);current=false;resolve({id:'pano',isPano:true,compassAngle:0,originalLngLat:{lng:0,lat:0}});assert.equal(await pending,null);assert.equal(centered,null);\n viewer.getImage=async()=>({id:'different',isPano:true,compassAngle:0});assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);\n});\n"
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
              "before": "The pilot includes curated health, education, parks, landmarks and everyday-service categories. Inspect the mapping in the exporter against each release. Its current schema uses `basic_category` and `taxonomy`, not the removed `categories` property. Confidence >=0.95 is an existence threshold, not a guarantee of positional accuracy or a correct entrance. Duplicate or outdated places may remain. Preserve Overture/source license notices, stable GERS IDs and the dated release.\n\n## Interaction and scheduling\n\nPlaces appear at zoom 15 and closer. This is a pilot density/performance policy, independent of Mapillary's object/sign interaction thresholds. Category filters and loading/error messages appear in a compact panel. Closing the filters leaves the layer on; the Places control turns it off. Hover shows a name; selecting a point opens source details, a safe website link when available, and an explicit **Explore nearby imagery** action. The first search checks at most 40 Mapillary candidates within 75 metres. It shows the distance and requires a separate Open click before using existing image/sequence loading. If empty, a separate Search farther button offers a 250-metre search (again capped at 40 results); it never widens automatically. Ranking covers only the returned page, not every Mapillary image. Both original and computed positions, when available, must lie within the chosen radius. The displayed distance conservatively uses the larger of those distances. A nearby image may not show the place or its entrance.\n\nThe service FeatureLayer is query-only and never added to the map. One owned GraphicsLayer below the Mapillary layers displays up to 200 points. Direct hits on visible Places markers open local details before sequence/coverage/object picking. Route/annotation modes, shared notes and point-cloud tools retain priority. Places reuses the existing hover/click hit-test path; clicks outside its markers continue through normal Mapillary picking. Enabling Places adds bounded querying/rendering/hit-test work; it cannot honestly be described as free.\n\nUpdates wait for a stationary map, a 650 ms debounce and an idle callback. Loading imagery, playback, fullscreen imagery, a hidden document or a closed widget pauses optional work. Foreground activity aborts optional requests and obsolete results cannot replace current data. Already-displayed Places details remain clickable during imagery loading or playback; this local popup does not start a Places request. One unsettled transport occupies the controller's request slot even if it ignores cancellation. Requests time out after 12 seconds, with manual retry and no automatic retry loop. Previous displayed points remain during an update, except when hidden below the zoom threshold, changing category/view, or turning the layer off.\n",
              "after": "The pilot includes curated health, education, parks, landmarks and everyday-service categories. Inspect the mapping in the exporter against each release. Its current schema uses `basic_category` and `taxonomy`, not the removed `categories` property. Confidence >=0.95 is an existence threshold, not a guarantee of positional accuracy or a correct entrance. Duplicate or outdated places may remain. Preserve Overture/source license notices, stable GERS IDs and the dated release.\n\n## Interaction and scheduling\n\nPlaces appear at zoom 15 and closer. This is a pilot density/performance policy, independent of Mapillary's object/sign interaction thresholds. Category filters and loading/error messages appear in a compact panel. Closing the filters leaves the layer on; the Places control turns it off. Hover shows a name; selecting a point opens source details, a safe website link when available, and an explicit **Explore nearby imagery** action. The first search checks at most 40 Mapillary candidates within 75 metres. It shows the distance and requires a separate Open click before using existing image/sequence loading. If empty, a separate Search farther button offers a 250-metre search (again capped at 40 results); it never widens automatically. Ranking covers only the returned page, not every Mapillary image. Camera headings now rank facing images (within 35 degrees) first, using 15-degree angle bands and then distance; panoramas follow, then unknown direction, sideways and away-facing fallbacks. The matching computed heading/position pair is preferred when available; otherwise the original pair is used. Very close points (under 3 m) have uncertain bearing. Labels describe direction estimates, never confirmed visibility. Both original and computed positions, when available, must lie within the chosen radius. The displayed distance conservatively uses the larger of those distances. A nearby image may not show the place or its entrance. A panorama is turned toward the place after opening only when the loaded image reports panorama/heading metadata and the current selection/viewer still matches. Flat images are not rotated; failed or missing orientation leaves the opened image usable. This adds heading fields to the existing request, not another network search.\n\nThe service FeatureLayer is query-only and never added to the map. One owned GraphicsLayer below the Mapillary layers displays up to 200 points. Direct hits on visible Places markers open local details before sequence/coverage/object picking. Route/annotation modes, shared notes and point-cloud tools retain priority. Places reuses the existing hover/click hit-test path; clicks outside its markers continue through normal Mapillary picking. Enabling Places adds bounded querying/rendering/hit-test work; it cannot honestly be described as free.\n\nUpdates wait for a stationary map, a 650 ms debounce and an idle callback. Loading imagery, playback, fullscreen imagery, a hidden document or a closed widget pauses optional work. Foreground activity aborts optional requests and obsolete results cannot replace current data. Already-displayed Places details remain clickable during imagery loading or playback; this local popup does not start a Places request. One unsettled transport occupies the controller's request slot even if it ignores cancellation. Requests time out after 12 seconds, with manual retry and no automatic retry loop. Previous displayed points remain during an update, except when hidden below the zoom threshold, changing category/view, or turning the layer off.\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-bearing-v6-41-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.41 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-bearing-v6-41' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.41 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.41 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.41 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-bearing-v6-41.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places bearing v6.41 is already installed. No files changed.');
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
  const manifest = { installer: 'places-bearing-v6-41', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places bearing v6.41 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
