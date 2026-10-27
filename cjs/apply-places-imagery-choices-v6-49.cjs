#!/usr/bin/env node
'use strict';
/**
 * Places imagery choices v6.49. Compatible current v6 sources.
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
      "file": "src/features/places/nearbyPlaceImagery.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 1",
              "before": "import { calculateBearing } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\n",
              "after": "import { calculateBearing } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; capturedAt?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\n"
            },
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 2",
              "before": "  const dy = radius / 111320, dx = dy / Math.max(.08, Math.cos(place.lat * Math.PI / 180));\n  return [Math.max(-180, place.lon - dx), Math.max(-90, place.lat - dy), Math.min(180, place.lon + dx), Math.min(90, place.lat + dy)];\n}\n/** Rank only this bounded page, not all Mapillary imagery. Reject either reported position outside the radius. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  placeImageryBbox(place, radius);\n  let best: PlaceImagery | null = null;\n  let bestRank = Infinity;\n  for (const row of rows.slice(0, 40)) {\n    const p = coordinates(row.geometry);\n    if (!p || !row.id || !row.sequence) continue;\n    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);\n",
              "after": "  const dy = radius / 111320, dx = dy / Math.max(.08, Math.cos(place.lat * Math.PI / 180));\n  return [Math.max(-180, place.lon - dx), Math.max(-90, place.lat - dy), Math.min(180, place.lon + dx), Math.min(90, place.lat + dy)];\n}\n/** Rank only this bounded page, not all Mapillary imagery. Reject either reported position outside the radius. */\nexport function rankPlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery[] {\n  placeImageryBbox(place, radius);\n  const candidates: { image: PlaceImagery; rank: number }[] = [];\n  for (const row of rows.slice(0, 40)) {\n    const p = coordinates(row.geometry);\n    if (!p || !row.id || !row.sequence) continue;\n    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);\n"
            },
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 3",
              "before": "    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat };\n    if (!best || rank < bestRank || (rank === bestRank && candidate.distance < best.distance)) { best = candidate; bestRank = rank; }\n  }\n  return best;\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360\u00b0 panorama \u00b7 can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';\n",
              "after": "    const direction: NonNullable<PlaceImagery['direction']> = row.is_pano === true ? 'panorama' : angle == null ? 'unknown' : angle <= 35 ? 'facing' : angle <= 90 ? 'sideways' : 'away';\n    // Comparable facing angles share a 15-degree band, then nearer imagery wins.\n    const rank = direction === 'facing' ? Math.floor(angle! / 15) : direction === 'panorama' ? 3 : direction === 'unknown' ? 4 : direction === 'sideways' ? 5 : 6;\n    const candidate: PlaceImagery = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius, direction, angle, placeLon: place.lon, placeLat: place.lat };\n    if (typeof row.captured_at === 'number' && row.captured_at > 0 && Number.isFinite(new Date(row.captured_at).getTime())) candidate.capturedAt = row.captured_at;\n    candidates.push({ image: candidate, rank });\n  }\n  candidates.sort((a, b) => a.rank - b.rank || a.image.distance - b.image.distance || (b.image.capturedAt || 0) - (a.image.capturedAt || 0) || a.image.id.localeCompare(b.image.id));\n  const unique = new Set<string>();\n  return candidates.filter(candidate => { if (unique.has(candidate.image.id)) return false; unique.add(candidate.image.id); return true; }).slice(0, 3).map(candidate => candidate.image);\n}\n/** Compatibility helper for callers that only need the first result. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  return rankPlaceImagery(place, rows, radius, distance)[0] || null;\n}\nexport function placeImageryCaptureLabel(image: PlaceImagery): string {\n  if (!image.capturedAt || !Number.isFinite(image.capturedAt) || !Number.isFinite(new Date(image.capturedAt).getTime())) return 'Capture date unknown';\n  return 'Captured ' + new Date(image.capturedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });\n}\n\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360\u00b0 panorama \u00b7 can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';\n"
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
              "before": "import { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n",
              "after": "import { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryCaptureLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    list?(places: readonly Place[]): void; selected?(place: Place | null): void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n",
              "after": "  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    list?(places: readonly Place[]): void; selected?(place: Place | null): void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }\n    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.cssText = 'font-size:11px;line-height:1.4'; content.appendChild(status);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n",
              "after": "    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }\n    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.cssText = 'font-size:11px;line-height:1.4'; content.appendChild(status);\n    const alternatives = document.createElement('div'); content.appendChild(alternatives);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 4",
              "before": "      button.disabled = true; status.textContent = `Looking within ${radius} m\u2026`;\n      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found) {\n          candidate = found; button.textContent = `Open imagery \u00b7 about ${Math.ceil(found.distance)} m away`;\n          status.textContent = `${placeImageryDirectionLabel(found)}. Direction is an estimate; visibility is not confirmed.`;\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther \u00b7 within 250 m';\n          status.textContent = 'No image found within 75 m. You can try a wider area.';\n        } else {\n",
              "after": "      button.disabled = true; status.textContent = `Looking within ${radius} m\u2026`;\n      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found.length) {\n          candidate = found[0]; button.textContent = `Open imagery \u00b7 about ${Math.ceil(candidate.distance)} m away`;\n          status.textContent = `${placeImageryDirectionLabel(candidate)} \u00b7 ${placeImageryCaptureLabel(candidate)}. Visibility is not confirmed.`;\n          for (const [index, image] of found.slice(1, 3).entries()) {\n            const option = document.createElement('button'); option.type = 'button'; option.textContent = `Open option ${index + 2} \u00b7 about ${Math.ceil(image.distance)} m away`;\n            option.style.cssText = 'display:block;width:100%;margin-top:6px;padding:7px;text-align:left;cursor:pointer';\n            option.onclick = () => { if (active()) this.host.openImagery(image); };\n            const detail = document.createElement('p'); detail.textContent = `${placeImageryDirectionLabel(image)} \u00b7 ${placeImageryCaptureLabel(image)}`; detail.style.cssText = 'font-size:11px;margin:3px 0 6px;line-height:1.4';\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther \u00b7 within 250 m';\n          status.textContent = 'No image found within 75 m. You can try a wider area.';\n        } else {\n"
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
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "    const label = placeCameraDistanceLabel(distanceMeters(lat, lon, place.lat, place.lon));\n    if (label !== this.state.placesCameraDistance) this.setState({ placesCameraDistance: label });\n  }\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });\n",
              "after": "    const label = placeCameraDistanceLabel(distanceMeters(lat, lon, place.lat, place.lon));\n    if (label !== this.state.placesCameraDistance) this.setState({ placesCameraDistance: label });\n  }\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry,compass_angle,computed_compass_angle,is_pano&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      return choosePlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n      if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); }\n    }\n",
              "after": "    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry,compass_angle,computed_compass_angle,is_pano,captured_at&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      return rankPlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n      if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); }\n    }\n"
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
              "before": " class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n",
              "after": " class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open option'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const calls=[];let navigations=0;const place={id:'p',name:'Museum',category:'museum',address:'',website:'',release:'',lon:0,lat:0};const view={destroyed:false,watch(){return{remove(){}};},openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'popup',url:'https://host/FeatureServer/0',modules:{Point:class{constructor(p){Object.assign(this,p);}}},view:()=>view,busy:()=>false,status(){},geographic:x=>x,explore:(p,radius,signal)=>new Promise((resolve,reject)=>calls.push({radius,signal,resolve,reject})),openImagery(){navigations++;}});\n owner.ownerView=view;owner.graphics={visible:true,destroy(){}};owner.records.set('p',place);\n try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve(null);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search farther \u00b7 within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[1].radius,250);calls[1].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search \u00b7 within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[2].signal.aborted);calls[2].resolve({id:'image',distance:30});await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','choosePlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.choosePlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate.id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert.equal(w._placesExploreAbort,null);\n w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\ntest('heading ranking prefers facing images over closer away/unknown images and wraps north correctly',()=>{\n const place={lon:0,lat:0},image=(id,metres,heading,extra={})=>({id,sequence:'s',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,...extra});\n",
              "after": " const calls=[];let navigations=0;const place={id:'p',name:'Museum',category:'museum',address:'',website:'',release:'',lon:0,lat:0};const view={destroyed:false,watch(){return{remove(){}};},openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'popup',url:'https://host/FeatureServer/0',modules:{Point:class{constructor(p){Object.assign(this,p);}}},view:()=>view,busy:()=>false,status(){},geographic:x=>x,explore:(p,radius,signal)=>new Promise((resolve,reject)=>calls.push({radius,signal,resolve,reject})),openImagery(){navigations++;}});\n owner.ownerView=view;owner.graphics={visible:true,destroy(){}};owner.records.set('p',place);\n try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve([]);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search farther \u00b7 within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[1].radius,250);calls[1].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search \u00b7 within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[2].signal.aborted);calls[2].resolve([{id:'image',distance:30}]);await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','rankPlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.rankPlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate[0].id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert(url.includes('captured_at'));assert.equal(w._placesExploreAbort,null);\n w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\ntest('heading ranking prefers facing images over closer away/unknown images and wraps north correctly',()=>{\n const place={lon:0,lat:0},image=(id,metres,heading,extra={})=>({id,sequence:'s',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,...extra});\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 3",
              "before": "});\ntest('camera-distance hook reads only loaded coordinates and avoids repeated state updates for unchanged labels',()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='updatePlacesCamera').getText(sf),utils=load('placeListUtils');const Runtime=new Function('placeCameraDistanceLabel','distanceMeters',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(utils.placeCameraDistanceLabel,distance);const w=new Runtime();let writes=0,cameraUpdates=0;w.state={selectedPlace:{lat:0,lon:0},placesCameraDistance:null};w._places={selection:{updateCamera(){cameraUpdates++;}}};w.setState=p=>{writes++;Object.assign(w.state,p);};Object.defineProperty(w,'fetchMapillaryJson',{get(){throw Error('distance must not request metadata');}});w.updatePlacesCamera(0,.0004);assert.equal(w.state.placesCameraDistance,'44 m from camera');for(let i=0;i<50;i++)w.updatePlacesCamera(0,.0004);assert.equal(writes,1);assert.equal(cameraUpdates,51);w.updatePlacesCamera(0,.0005);assert.equal(writes,2);w.state.selectedPlace=null;w.updatePlacesCamera(0,.0006);assert.equal(writes,2);\n});\n",
              "after": "});\ntest('camera-distance hook reads only loaded coordinates and avoids repeated state updates for unchanged labels',()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='updatePlacesCamera').getText(sf),utils=load('placeListUtils');const Runtime=new Function('placeCameraDistanceLabel','distanceMeters',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(utils.placeCameraDistanceLabel,distance);const w=new Runtime();let writes=0,cameraUpdates=0;w.state={selectedPlace:{lat:0,lon:0},placesCameraDistance:null};w._places={selection:{updateCamera(){cameraUpdates++;}}};w.setState=p=>{writes++;Object.assign(w.state,p);};Object.defineProperty(w,'fetchMapillaryJson',{get(){throw Error('distance must not request metadata');}});w.updatePlacesCamera(0,.0004);assert.equal(w.state.placesCameraDistance,'44 m from camera');for(let i=0;i<50;i++)w.updatePlacesCamera(0,.0004);assert.equal(writes,1);assert.equal(cameraUpdates,51);w.updatePlacesCamera(0,.0005);assert.equal(writes,2);w.state.selectedPlace=null;w.updatePlacesCamera(0,.0006);assert.equal(writes,2);\n});\ntest('imagery choices cap three unique images, preserve bearing ranking and expose valid capture dates',()=>{\n const place={lon:0,lat:0},row=(id,metres,heading,captured_at)=>({id,sequence:'seq',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,captured_at});\n const choices=nearby.rankPlaceImagery(place,[row('away',5,180),row('a',25,0,1704067200000),row('a',25,0,1704067200000),row('b',30,0,0),row('c',35,0,Infinity),row('d',40,0,1704067200000)],75,distance);\n assert.deepEqual(choices.map(p=>p.id),['a','b','c']);assert.equal(choices[0].capturedAt,1704067200000);assert.match(nearby.placeImageryCaptureLabel(choices[0]),/2024/);assert.equal(nearby.placeImageryCaptureLabel(choices[1]),'Capture date unknown');assert.equal(nearby.placeImageryCaptureLabel(choices[2]),'Capture date unknown');assert.equal(nearby.rankPlaceImagery(place,[],75,distance).length,0);\n});\n"
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
              "before": "\n**Browse places** is collapsed initially. It shows only the already-loaded map results, sorted alphabetically. Local search matches name/category; paging renders four rows at a time rather than 200 DOM rows. Selecting a row uses the existing selection/details path and does not fetch more places or open imagery automatically. Limited results remain labelled by the existing 200-record message. The panel scrolls within its available height on short viewers. Below the Places zoom threshold or after clearing a viewport/category, the list is cleared/hidden along with normal points; a persistent selected place may remain independently.\n\nThe selected-place summary shows the approximate straight-line distance to the current loaded image's camera coordinate. Both the integrated filter summary and compact selected card show it. Existing image events update the label; there is no metadata request, timer or polling. Equal formatted distances do not cause another label-state update. Without a loaded camera position the card says to open an image. Distance is not walking distance and does not establish visibility. The list reuses references to the bounded loaded records rather than duplicating records or introducing another query/cache.\n",
              "after": "\n**Browse places** is collapsed initially. It shows only the already-loaded map results, sorted alphabetically. Local search matches name/category; paging renders four rows at a time rather than 200 DOM rows. Selecting a row uses the existing selection/details path and does not fetch more places or open imagery automatically. Limited results remain labelled by the existing 200-record message. The panel scrolls within its available height on short viewers. Below the Places zoom threshold or after clearing a viewport/category, the list is cleared/hidden along with normal points; a persistent selected place may remain independently.\n\nThe selected-place summary shows the approximate straight-line distance to the current loaded image's camera coordinate. Both the integrated filter summary and compact selected card show it. Existing image events update the label; there is no metadata request, timer or polling. Equal formatted distances do not cause another label-state update. Without a loaded camera position the card says to open an image. Distance is not walking distance and does not establish visibility. The list reuses references to the bounded loaded records rather than duplicating records or introducing another query/cache.\n\n\n## Imagery choices and capture dates (v6.49)\n\nA POI imagery search now offers up to three unique image IDs from the same bounded 40-record page. Every option shows its direction estimate, distance and capture date; missing/invalid timestamps say Capture date unknown. Ranking retains direction bands and distance, using recency only to break equal rank/distance ties. Results may be adjacent images from the same sequence; this is not an exhaustive best-view search.\n\nThe existing request adds `captured_at`. There are no additional searches, thumbnail downloads or automatic image opens. The first result and alternatives each require an explicit Open click. The 75 m initial search, explicit 250 m expansion, timeout, cancellation and original/computed-coordinate checks remain. Closing/replacing the popup makes old option buttons inert. Dates are displayed using the browser locale with UTC capture day to avoid timezone day shifts.\n"
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
const prefix = 'places-imagery-choices-v6-49-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.49 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-imagery-choices-v6-49' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.49 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.49 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.49 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-imagery-choices-v6-49.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places imagery choices v6.49 is already installed. No files changed.');
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
  const manifest = { installer: 'places-imagery-choices-v6-49', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places imagery choices v6.49 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
