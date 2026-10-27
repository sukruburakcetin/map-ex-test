#!/usr/bin/env node
'use strict';
/**
 * Places preferences and variety v6.55. Compatible current v6 sources.
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
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n  private togglePlaces = () => {\n    if (!this.state.placesActive && (!this.state.jimuMapView?.view?.ready || !this.ArcGISModules?.FeatureLayer)) { this.showToast('The map is preparing. Try Places again shortly.', 3500); return; }\n    this.setState(previous => ({ placesActive: !previous.placesActive, placesPanelOpen: !previous.placesActive, ...(previous.placesActive ? { selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null } : {}) }), this.syncPlaces);\n  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private goToPlacesArea = () => {\n",
              "after": "      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n  private placesPreferenceKey = () => placePreferenceKey(this.props.id, typeof window !== 'undefined' ? window.location.pathname : '', this.props.config.placesServiceUrl);\n  private togglePlaces = () => {\n    if (!this.state.placesActive && (!this.state.jimuMapView?.view?.ready || !this.ArcGISModules?.FeatureLayer)) { this.showToast('The map is preparing. Try Places again shortly.', 3500); return; }\n    const placesGroup = this.state.placesActive ? this.state.placesGroup : readPlaceCategory(() => window.localStorage, this.placesPreferenceKey(), this.state.placesGroup);\n    this.setState(previous => ({ placesActive: !previous.placesActive, placesPanelOpen: !previous.placesActive, placesGroup, ...(previous.placesActive ? { selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null } : {}) }), this.syncPlaces);\n  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    savePlaceCategory(() => window.localStorage, this.placesPreferenceKey(), placesGroup);\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private goToPlacesArea = () => {\n"
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
              "before": "import { panoramaPlaceCenter } from './panoramaPlaceCenter';\nimport { calculateBearing, distanceMeters } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; capturedAt?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\n",
              "after": "import { panoramaPlaceCenter } from './panoramaPlaceCenter';\nimport { calculateBearing, distanceMeters } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; capturedAt?: number; cameraLon?: number; cameraLat?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\n"
            },
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 2",
              "before": "    const angle = heading != null && originDistance >= 3 ? Math.abs(((bearing - heading + 540) % 360) - 180) : undefined;\n    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat };\n    if (typeof row.captured_at === 'number' && row.captured_at > 0 && Number.isFinite(new Date(row.captured_at).getTime())) candidate.capturedAt = row.captured_at;\n    candidates.push({ image: candidate, rank });\n  }\n  candidates.sort((a, b) => a.rank - b.rank || a.image.distance - b.image.distance || (b.image.capturedAt || 0) - (a.image.capturedAt || 0) || a.image.id.localeCompare(b.image.id));\n  const unique = new Set<string>();\n  return candidates.filter(candidate => { if (unique.has(candidate.image.id)) return false; unique.add(candidate.image.id); return true; }).slice(0, 3).map(candidate => candidate.image);\n}\n/** Compatibility helper for callers that only need the first result. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  return rankPlaceImagery(place, rows, radius, distance)[0] || null;\n",
              "after": "    const angle = heading != null && originDistance >= 3 ? Math.abs(((bearing - heading + 540) % 360) - 180) : undefined;\n    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat, cameraLon: computed[0], cameraLat: computed[1] };\n    if (typeof row.captured_at === 'number' && row.captured_at > 0 && Number.isFinite(new Date(row.captured_at).getTime())) candidate.capturedAt = row.captured_at;\n    candidates.push({ image: candidate, rank });\n  }\n  candidates.sort((a, b) => a.rank - b.rank || a.image.distance - b.image.distance || (b.image.capturedAt || 0) - (a.image.capturedAt || 0) || a.image.id.localeCompare(b.image.id));\n  const unique = new Set<string>();\n  const ranked = candidates.filter(candidate => { if (unique.has(candidate.image.id)) return false; unique.add(candidate.image.id); return true; });\n  if (!ranked.length) return [];\n  const grade = (rank: number) => rank <= 2 ? 0 : rank - 2;\n  const bestGrade = grade(ranked[0].rank), selected = [ranked[0].image];\n  const distinct = (image: PlaceImagery) => selected.every(previous => image.sequence !== previous.sequence ||\n    distance(image.cameraLat ?? image.lat, image.cameraLon ?? image.lon, previous.cameraLat ?? previous.lat, previous.cameraLon ?? previous.lon) >= 15 ||\n    (image.capturedAt != null && previous.capturedAt != null && Math.abs(image.capturedAt - previous.capturedAt) >= 86400000));\n  // Preserve the best primary and direction quality. Facing choices may also offer panoramas.\n  for (const tier of bestGrade === 0 ? [0, 1] : [bestGrade]) {\n    for (const newSequenceOnly of [true, false]) for (const candidate of ranked) {\n      const image = candidate.image;\n      if (selected.length >= 3) return selected;\n      if (grade(candidate.rank) !== tier || selected.some(p => p.id === image.id)) continue;\n      if (newSequenceOnly && selected.some(p => p.sequence === image.sequence)) continue;\n      if (distinct(image)) selected.push(image);\n    }\n  }\n  return selected;\n}\n/** Compatibility helper for callers that only need the first result. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  return rankPlaceImagery(place, rows, radius, distance)[0] || null;\n"
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
              "before": " const method=widget.members.find(m=>m.name?.getText(sf)==='updatePlacesCamera').getText(sf),utils=load('placeListUtils');const Runtime=new Function('placeCameraDistanceLabel','distanceMeters',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(utils.placeCameraDistanceLabel,distance);const w=new Runtime();let writes=0,cameraUpdates=0;w.state={selectedPlace:{lat:0,lon:0},placesCameraDistance:null};w._places={selection:{updateCamera(){cameraUpdates++;}}};w.setState=p=>{writes++;Object.assign(w.state,p);};Object.defineProperty(w,'fetchMapillaryJson',{get(){throw Error('distance must not request metadata');}});w.updatePlacesCamera(0,.0004);assert.equal(w.state.placesCameraDistance,'44 m from camera');for(let i=0;i<50;i++)w.updatePlacesCamera(0,.0004);assert.equal(writes,1);assert.equal(cameraUpdates,51);w.updatePlacesCamera(0,.0005);assert.equal(writes,2);w.state.selectedPlace=null;w.updatePlacesCamera(0,.0006);assert.equal(writes,2);\n});\ntest('imagery choices cap three unique images, preserve bearing ranking and expose valid capture dates',()=>{\n const place={lon:0,lat:0},row=(id,metres,heading,captured_at)=>({id,sequence:'seq',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,captured_at});\n const choices=nearby.rankPlaceImagery(place,[row('away',5,180),row('a',25,0,1704067200000),row('a',25,0,1704067200000),row('b',30,0,0),row('c',35,0,Infinity),row('d',40,0,1704067200000)],75,distance);\n assert.deepEqual(choices.map(p=>p.id),['a','b','c']);assert.equal(choices[0].capturedAt,1704067200000);assert.match(nearby.placeImageryCaptureLabel(choices[0]),/2024/);assert.equal(nearby.placeImageryCaptureLabel(choices[1]),'Capture date unknown');assert.equal(nearby.placeImageryCaptureLabel(choices[2]),'Capture date unknown');assert.equal(nearby.rankPlaceImagery(place,[],75,distance).length,0);\n});\nconst extentUtils=load('publishedPlacesExtent');\ntest('published extent validation distinguishes outside, overlap and unknown metadata',()=>{\n",
              "after": " const method=widget.members.find(m=>m.name?.getText(sf)==='updatePlacesCamera').getText(sf),utils=load('placeListUtils');const Runtime=new Function('placeCameraDistanceLabel','distanceMeters',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(utils.placeCameraDistanceLabel,distance);const w=new Runtime();let writes=0,cameraUpdates=0;w.state={selectedPlace:{lat:0,lon:0},placesCameraDistance:null};w._places={selection:{updateCamera(){cameraUpdates++;}}};w.setState=p=>{writes++;Object.assign(w.state,p);};Object.defineProperty(w,'fetchMapillaryJson',{get(){throw Error('distance must not request metadata');}});w.updatePlacesCamera(0,.0004);assert.equal(w.state.placesCameraDistance,'44 m from camera');for(let i=0;i<50;i++)w.updatePlacesCamera(0,.0004);assert.equal(writes,1);assert.equal(cameraUpdates,51);w.updatePlacesCamera(0,.0005);assert.equal(writes,2);w.state.selectedPlace=null;w.updatePlacesCamera(0,.0006);assert.equal(writes,2);\n});\ntest('imagery choices cap three unique images, preserve bearing ranking and expose valid capture dates',()=>{\n const place={lon:0,lat:0},row=(id,metres,heading,captured_at)=>({id,sequence:'seq',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,captured_at});\n const choices=nearby.rankPlaceImagery(place,[row('away',5,180),row('a',25,0,1704067200000),row('a',25,0,1704067200000),row('b',45,0,0),row('c',65,0,Infinity),row('d',70,0,1704067200000)],75,distance);\n assert.deepEqual(choices.map(p=>p.id),['a','b','c']);assert.equal(choices[0].capturedAt,1704067200000);assert.match(nearby.placeImageryCaptureLabel(choices[0]),/2024/);assert.equal(nearby.placeImageryCaptureLabel(choices[1]),'Capture date unknown');assert.equal(nearby.placeImageryCaptureLabel(choices[2]),'Capture date unknown');assert.equal(nearby.rankPlaceImagery(place,[],75,distance).length,0);\n});\nconst extentUtils=load('publishedPlacesExtent');\ntest('published extent validation distinguishes outside, overlap and unknown metadata',()=>{\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert(list.children[0].textContent.startsWith('Place 4'));list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');const before=created;busy=true;owner.regroup();assert.equal(created,before);owner.clear();assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\n",
              "after": " const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert(list.children[0].textContent.startsWith('Place 4'));list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');const before=created;busy=true;owner.regroup();assert.equal(created,before);owner.clear();assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('category preferences are validated, scoped and safe when browser storage is blocked',()=>{\n const preferences=load('placePreferences'),data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},url='https://host/FeatureServer/0';const key=preferences.placePreferenceKey('w','/experience/0',url);assert(key);preferences.savePlaceCategory(()=>store,key,'parks');assert.equal(preferences.readPlaceCategory(()=>store,key),'parks');assert.notEqual(key,preferences.placePreferenceKey('w','/experience/1',url));assert.notEqual(key,preferences.placePreferenceKey('other','/experience/0',url));assert.notEqual(key,preferences.placePreferenceKey('w','/experience/0','https://host/FeatureServer/1'));assert.equal(preferences.placePreferenceKey('w','/experience/0',url+'?token=secret'),null);data.set(key,'<script>');assert.equal(preferences.readPlaceCategory(()=>store,key),'all');assert.equal(preferences.readPlaceCategory(()=>{throw Error('blocked')},key,'education'),'education');assert.doesNotThrow(()=>preferences.savePlaceCategory(()=>{throw Error('blocked')},key,'parks'));preferences.savePlaceCategory(()=>store,key,'all');assert.equal(data.get(key),'all');preferences.savePlaceCategory(()=>store,key,'invalid');assert.equal(data.get(key),'all');\n});\ntest('actual widget restores category on explicit enable without restoring startup activation',()=>{\n const preferences=load('placePreferences'),memberNames=['placesPreferenceKey','togglePlaces','setPlacesGroup'],body=memberNames.map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');const Runtime=new Function('PLACE_GROUPS','placePreferenceKey','readPlaceCategory','savePlaceCategory',compile('class Runtime{'+body+'}\\nreturn Runtime;'))(model.PLACE_GROUPS,preferences.placePreferenceKey,preferences.readPlaceCategory,preferences.savePlaceCategory);const oldWindow=global.window,data=new Map();let reads=0;global.window={location:{pathname:'/experience/0'},localStorage:{getItem:k=>{reads++;return data.get(k)||null;},setItem:(k,v)=>data.set(k,v)}};\n const make=()=>{const w=new Runtime();w.props={id:'w',config:{placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,placesGroup:'all',jimuMapView:{view:{ready:true}}};w.ArcGISModules={FeatureLayer:class{}};w.syncPlaces=()=>{};w.setState=(patch,done)=>{Object.assign(w.state,typeof patch==='function'?patch(w.state):patch);done?.();};return w;};try{const first=make();assert.equal(reads,0);assert.equal(first.state.placesActive,false);first.setPlacesGroup('landmarks');const second=make();assert.equal(second.state.placesActive,false);assert.equal(second.state.placesGroup,'all');assert.equal(reads,0);second.togglePlaces();assert.equal(second.state.placesActive,true);assert.equal(second.state.placesGroup,'landmarks');second.togglePlaces();assert.equal(second.state.placesActive,false);}finally{global.window=oldWindow;}\n});\ntest('imagery alternatives prefer distinct sequences and separated frames rather than filling near-duplicate slots',()=>{\n const place={lon:0,lat:0},row=(id,metres,sequence='a',heading=0,extra={})=>({id,sequence,geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,...extra});\n const ranked=nearby.rankPlaceImagery(place,[row('first',10),row('duplicate',11),row('farther',35),row('other-sequence',20,'b')],75,distance);assert.deepEqual(ranked.map(p=>p.id),['first','other-sequence','farther']);assert.equal(nearby.rankPlaceImagery(place,[row('a',10),row('b',11),row('c',12)],75,distance).length,1);assert.deepEqual(nearby.rankPlaceImagery(place,[row('facing',10),row('away',5,'b',180)],75,distance).map(p=>p.id),['facing']);\n const computed=[row('first',10,'a',0,{computed_geometry:{coordinates:[0,-10/111195]}}),row('gps-shift',30,'a',0,{computed_geometry:{coordinates:[0,-11/111195]}})];assert.equal(nearby.rankPlaceImagery(place,computed,75,distance).length,1);\n const dates=nearby.rankPlaceImagery(place,[row('old',10,'a',0,{captured_at:1704067200000}),row('new',10,'a',0,{captured_at:1704240000000})],75,distance);assert.deepEqual(dates.map(p=>p.id),['new','old']);\n});\n"
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
              "before": "\nRegrouping runs only along the existing controller idle query/display path while stationary and not busy, never on pointer moves or animation frames. It adds no requests or timers. The bounded grid groups at most 200 projected points, and unchanged membership/coordinates reuse the displayed graphics. Count symbols use local static SVGs and a cache capped at 32 entries. Queries may still temporarily retain the previous display while the existing replacement work waits. New queries/data or zooming can change counts, reflecting the loaded subset.\n\nA local Node benchmark of the pure grouping step (excluding SDK projection/rendering) measured median about 0.14 ms for 200 separated points and 0.09 ms for dense points. These are not mobile FPS or total map-render measurements. Live projection, terrain/occlusion and count presentation should be checked in the deployed map.\n",
              "after": "\nRegrouping runs only along the existing controller idle query/display path while stationary and not busy, never on pointer moves or animation frames. It adds no requests or timers. The bounded grid groups at most 200 projected points, and unchanged membership/coordinates reuse the displayed graphics. Count symbols use local static SVGs and a cache capped at 32 entries. Queries may still temporarily retain the previous display while the existing replacement work waits. New queries/data or zooming can change counts, reflecting the loaded subset.\n\nA local Node benchmark of the pure grouping step (excluding SDK projection/rendering) measured median about 0.14 ms for 200 separated points and 0.09 ms for dense points. These are not mobile FPS or total map-render measurements. Live projection, terrain/occlusion and count presentation should be checked in the deployed map.\n\n\n## Remembered categories and varied imagery (v6.55)\n\nCategory changes are saved as one validated local-storage string, scoped by this browser origin (inherent storage scope), app pathname, widget ID and credential-free service URL. The saved category is read when the user explicitly enables Places, not at startup. Places still starts off, and selection/link state is not restored. Choosing All places saves that choice. If storage is blocked, missing or invalid, the current in-memory category continues to work. No coordinates, image IDs, tokens or service responses are stored by this preference.\n\nImagery ranking preserves the best primary result. Alternatives prefer different sequences, then frames from the same sequence that are at least 15 m apart using computed camera positions when available, or captured at least 24 hours apart. Facing-image alternatives stay in the facing tier before considering panoramas. Other best-direction tiers stay within that tier, so diversity alone does not promote unknown/sideways/away-facing images above better directional choices. Duplicate IDs and near-identical same-sequence frames are not used to fill slots: a search may offer only one or two options. The same 40-record search page, radius checks and explicit wider search remain; no extra requests or thumbnail downloads are introduced.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/placePreferences.ts",
      "content": "import { PLACE_GROUPS, PlaceGroup, placesServiceUrl } from './placesModel';\ntype Store = Pick<Storage, 'getItem' | 'setItem'>;\nconst allowed = (value: unknown): value is PlaceGroup => typeof value === 'string' && PLACE_GROUPS.includes(value as PlaceGroup);\n/** localStorage already scopes origin; isolate app path, widget and credential-free service. */\nexport function placePreferenceKey(widgetId: unknown, appPath: string, serviceUrl: string | undefined): string | null {\n  const url = placesServiceUrl(serviceUrl);\n  if (!url || widgetId == null || !appPath) return null;\n  return 'mly:places:category:v1:' + JSON.stringify([appPath, String(widgetId), url]);\n}\nexport function readPlaceCategory(storage: () => Store, key: string | null, fallback: PlaceGroup = 'all'): PlaceGroup {\n  const safe = allowed(fallback) ? fallback : 'all';\n  if (!key) return safe;\n  try { const value = storage().getItem(key); return allowed(value) ? value : safe; } catch { return safe; }\n}\nexport function savePlaceCategory(storage: () => Store, key: string | null, category: PlaceGroup): void {\n  if (!key || !allowed(category)) return;\n  try { storage().setItem(key, category); } catch { /* In-memory selection still works when browser storage is blocked. */ }\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-preferences-variety-v6-55-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.55 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-preferences-variety-v6-55' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.55 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.55 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.55 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-preferences-variety-v6-55.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places preferences and variety v6.55 is already installed. No files changed.');
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
  const manifest = { installer: 'places-preferences-variety-v6-55', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places preferences and variety v6.55 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
