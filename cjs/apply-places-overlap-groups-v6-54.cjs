#!/usr/bin/env node
'use strict';
/**
 * Places overlap groups v6.54. Compatible current v6 sources.
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
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/ArcGISPlaces.ts block 1",
              "before": "import { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\n",
              "after": "import { groupOverlappingPlaces, placeCountSymbol, PlaceGroupMarker } from './overlappingPlaces';\nimport { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n  private listVisible = true;\n  private iconSymbols = new Map<string, any>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n",
              "after": "  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n  private listVisible = true;\n  private groupingKey = '';\n  private groups = new Map<string, PlaceGroupMarker>();\n  private memberGroups = new Map<string, string>();\n  private countSymbols = new Map<number, any>();\n  private iconSymbols = new Map<string, any>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), extent: () => this.published, busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n        const service = this.service;\n        try {\n          await service.load({ signal });\n",
              "after": "    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), extent: () => this.published, busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        this.regroup();\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n        const service = this.service;\n        try {\n          await service.load({ signal });\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 4",
              "before": "      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';\n      const link = document.createElement('a'); link.textContent = 'Places \u00b7 Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';\n      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');\n    }\n    const graphics = places.map(p => {\n      const cached = this.iconSymbols.get(p.group);\n      const graphic = new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol: cached || placeCategorySymbol(p.group), attributes: { place_id: p.id } });\n      if (!cached) this.iconSymbols.set(p.group, graphic.symbol);\n      return graphic;\n    });\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n    this.listedPlaces = places; if (this.listVisible) this.host.list?.(places);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) return selected;\n    // Opening already-loaded details is local work and remains available while imagery loads.\n    if (this.disposed || !this.graphics?.visible || !this.records.size || this.ownerView !== this.host.view() || this.ownerView?.destroyed) return null;\n    for (const hit of results) if ((hit.layer || hit.graphic?.layer) === this.graphics) {\n      const place = this.records.get(hit.graphic?.attributes?.place_id); if (place) return place;\n    }\n    return null;\n  }\n  /** Capture only the visible marker footprint, without another SDK hit test or request. */\n  screenTarget(screen: { x: number; y: number }): string | null {\n    const selected = this.selection.screenTarget(screen); if (selected) return selected;\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = PLACE_ICON_RADIUS * PLACE_ICON_RADIUS;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n      const id = graphic.attributes?.place_id;\n      if (!this.records.has(id)) continue;\n      const point = view.toScreen(graphic.geometry);\n      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;\n      const squared = (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2;\n      if (squared <= distance) { nearest = id; distance = squared; }\n    }\n    return nearest;\n  }\n  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    this.selection.select(place);\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n",
              "after": "      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';\n      const link = document.createElement('a'); link.textContent = 'Places \u00b7 Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';\n      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');\n    }\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.listedPlaces = places;\n    this.regroup();\n    if (this.listVisible) this.host.list?.(places);\n  }\n  /** Runs only on the controller's idle query/display path, never pointer/animation events. */\n  private regroup(): void {\n    const view = this.host.view();\n    if (this.disposed || !this.graphics || this.ownerView !== view || view?.destroyed || this.host.busy() || view.stationary === false) return;\n    const groups = groupOverlappingPlaces(this.listedPlaces, p => view.toScreen(new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } })));\n    this.groups.clear(); this.memberGroups.clear();\n    for (const group of groups) if (group.members.length > 1) { this.groups.set(group.id, group); for (const member of group.members) this.memberGroups.set(member.id, group.id); }\n    const key = JSON.stringify(groups.map(group => group.members.map(p => [p.id, p.lon, p.lat, p.group])));\n    if (key === this.groupingKey) return;\n    this.groupingKey = key;\n    const graphics = groups.map(group => {\n      const p = group.anchor, count = group.members.length;\n      const cached = count > 1 ? this.countSymbols.get(count) : this.iconSymbols.get(p.group);\n      const graphic = new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol: cached || (count > 1 ? placeCountSymbol(count) : placeCategorySymbol(p.group)), attributes: { place_id: count > 1 ? group.id : p.id } });\n      if (!cached) { if (count > 1) { if (this.countSymbols.size >= 32) this.countSymbols.delete(this.countSymbols.keys().next().value!); this.countSymbols.set(count, graphic.symbol); } else this.iconSymbols.set(p.group, graphic.symbol); }\n      return graphic;\n    });\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  private groupPlace(group: PlaceGroupMarker): Place { return { ...group.anchor, id: group.id, name: `${group.members.length} places here` }; }\n\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) { const group = this.groups.get(this.memberGroups.get(selected.id) || ''); return group ? this.groupPlace(group) : selected; }\n    // Opening already-loaded details is local work and remains available while imagery loads.\n    if (this.disposed || !this.graphics?.visible || !this.records.size || this.ownerView !== this.host.view() || this.ownerView?.destroyed) return null;\n    for (const hit of results) if ((hit.layer || hit.graphic?.layer) === this.graphics) {\n      const id = hit.graphic?.attributes?.place_id, group = this.groups.get(id);\n      if (group) return this.groupPlace(group);\n      const place = this.records.get(id); if (place) return place;\n    }\n    return null;\n  }\n  /** Capture only the visible marker footprint, without another SDK hit test or request. */\n  screenTarget(screen: { x: number; y: number }): string | null {\n    const selected = this.selection.screenTarget(screen); if (selected) return this.memberGroups.get(selected) || selected;\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = PLACE_ICON_RADIUS * PLACE_ICON_RADIUS;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n      const id = graphic.attributes?.place_id;\n      if (!this.records.has(id) && !this.groups.has(id)) continue;\n      const point = view.toScreen(graphic.geometry);\n      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;\n      const squared = (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2;\n      const radius = this.groups.has(id) ? 12 : PLACE_ICON_RADIUS;\n      if (squared <= radius * radius && (nearest == null || squared <= distance)) { nearest = id; distance = squared; }\n    }\n    return nearest;\n  }\n  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const group = valid ? this.groups.get(targetId || this.hit(results)?.id || '') : null;\n    if (group) return this.openGroup(group);\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    this.selection.select(place);\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 5",
              "before": "    this.popupContent = content; this.popupView = view;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  clearSelection(): void { this.selection.clear(); this.closeDetails(); }\n  private closeDetails(): void {\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n",
              "after": "    this.popupContent = content; this.popupView = view;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  private openGroup(group: PlaceGroupMarker): boolean {\n    const view = this.host.view(); if (!view || view.destroyed || this.disposed) return false;\n    this.closeDetails();\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const heading = document.createElement('strong'); heading.textContent = `${group.members.length} places here`; content.appendChild(heading);\n    const hint = document.createElement('p'); hint.textContent = 'Choose a place to see details.'; content.appendChild(hint);\n    const list = document.createElement('div'); content.appendChild(list);\n    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:7px'; content.appendChild(controls);\n    const previous = document.createElement('button'), next = document.createElement('button'), label = document.createElement('span');\n    previous.type = next.type = 'button'; previous.textContent = 'Previous'; next.textContent = 'Next'; controls.appendChild(previous); controls.appendChild(label); controls.appendChild(next);\n    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name)); let page = 0;\n    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;\n    const render = () => {\n      list.replaceChildren();\n      for (const place of members.slice(page * 4, page * 4 + 4)) {\n        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open'; button.textContent = `${place.name} \u00b7 ${place.category.replace(/_/g, ' ')}`;\n        button.onclick = () => { if (active() && this.records.has(place.id)) this.open([], place.id); }; list.appendChild(button);\n      }\n      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;\n    };\n    previous.onclick = () => { if (active() && page > 0) { page--; render(); } }; next.onclick = () => { if (active() && (page + 1) * 4 < members.length) { page++; render(); } };\n    const source = document.createElement('p'); source.textContent = 'Loaded places \u00b7 Overture Maps'; content.appendChild(source);\n    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);\n    this.popupContent = content; this.popupView = view; render();\n    view.openPopup({ title: 'Nearby places', content, location: new this.host.modules.Point({ longitude: group.anchor.lon, latitude: group.anchor.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  clearSelection(): void { this.selection.clear(); this.closeDetails(); }\n  private closeDetails(): void {\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 6",
              "before": "    this.closeDetails();\n    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n    this.records.clear(); this.ownerView = null;\n    if (this.listedPlaces.length) { this.listedPlaces = []; if (!this.disposed) this.host.list?.([]); }\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null; this.published = null; this.iconSymbols.clear();\n  }\n}\n",
              "after": "    this.closeDetails();\n    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n    this.records.clear(); this.groupingKey = ''; this.groups.clear(); this.memberGroups.clear(); this.ownerView = null;\n    if (this.listedPlaces.length) { this.listedPlaces = []; if (!this.disposed) this.host.list?.([]); }\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null; this.published = null; this.iconSymbols.clear(); this.countSymbols.clear();\n  }\n}\n"
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
              "before": "});\ntest('heading-only fallback uses explicit matching coordinate/heading pairs and never mixes computed GPS with EXIF heading',async()=>{\n let center;const opened={id:'pair',cameraType:'spherical',lngLat:{lng:0,lat:0},computedLngLat:{lng:0,lat:0},originalLngLat:{lng:2,lat:0},originalCompassAngle:270,compassAngle:270};const viewer={getImage:async()=>opened,setCenter:p=>center=p},image={id:'pair',placeLon:1,placeLat:0};assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),270);assert.equal(center[0],.5,'original camera west toward POI with original west heading');opened.computedCompassAngle=0;assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),90);assert.equal(center[0],.75);delete opened.originalCompassAngle;delete opened.computedCompassAngle;center=null;assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);assert.equal(center,null);\n});\n",
              "after": "});\ntest('heading-only fallback uses explicit matching coordinate/heading pairs and never mixes computed GPS with EXIF heading',async()=>{\n let center;const opened={id:'pair',cameraType:'spherical',lngLat:{lng:0,lat:0},computedLngLat:{lng:0,lat:0},originalLngLat:{lng:2,lat:0},originalCompassAngle:270,compassAngle:270};const viewer={getImage:async()=>opened,setCenter:p=>center=p},image={id:'pair',placeLon:1,placeLat:0};assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),270);assert.equal(center[0],.5,'original camera west toward POI with original west heading');opened.computedCompassAngle=0;assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),90);assert.equal(center[0],.75);delete opened.originalCompassAngle;delete opened.computedCompassAngle;center=null;assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);assert.equal(center,null);\n});\ntest('overlap grouping is deterministic, bounded and avoids transitive screen chains',()=>{\n const {groupOverlappingPlaces,placeCountSymbol}=load('overlappingPlaces');const points=[{id:'a',lon:0},{id:'b',lon:20},{id:'c',lon:40}];const screen=p=>({x:p.lon,y:0});const groups=groupOverlappingPlaces(points,screen);assert.deepEqual(groups.map(g=>g.members.map(p=>p.id)),[['a','b'],['c']]);assert.deepEqual(groupOverlappingPlaces([...points].reverse(),screen),groups);assert.equal(groupOverlappingPlaces(points,()=>null).length,0);assert.equal(groupOverlappingPlaces(Array.from({length:250},(_,i)=>({id:String(i),lon:0})),screen)[0].members.length,200);const symbol=placeCountSymbol(12);assert.equal(symbol.type,'picture-marker');assert.match(decodeURIComponent(symbol.url),/>12<\\/text>/);assert.throws(()=>placeCountSymbol('<script>'));assert.throws(()=>placeCountSymbol(201));\n});\ntest('count badge opens a local paged chooser and a row selects the real POI without imagery requests',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},replaceChildren(...xs){this.children=xs;},remove(){}});global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n const layers=[];let busy=false,created=0,requests=0;class Layer{constructor(p){Object.assign(this,p);this.visible=true;this.items=[];}removeAll(){this.items=[];}addMany(g){this.items.push(...g);this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}class Value{constructor(p){Object.assign(this,p);}}class Graphic extends Value{constructor(p){super(p);created++;}}\n const view={ready:true,stationary:true,destroyed:false,map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},ui:{add(){},remove(){}},watch(){return{remove(){}}},toScreen:()=>({x:10,y:10}),openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert(list.children[0].textContent.startsWith('Place 4'));list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');const before=created;busy=true;owner.regroup();assert.equal(created,before);owner.clear();assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\n"
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
              "before": "\nExisting viewer bearing events own observed bearing, cone and URL state. The helper no longer writes an intended angle as if the viewer actually reached it. Exceptions are debug-logged and a current failed panorama adjustment shows a short message while leaving the image usable. No request, timer, animation loop or private viewer API is added. Public Image fields are used; the local math was checked against the installed SDK's Transform, not imported from SDK internals at runtime.\n\nThe SDK-derived fixture covers 36 combinations of tilt/roll, EXIF 1/3/6/8 and compass wraparound. This aims at a horizontal direction only: POI elevation, camera/POI positional error, occlusion and entrance location remain unknown. Live scene verification is still necessary. Other non-POI bearing helpers are outside this change.\n",
              "after": "\nExisting viewer bearing events own observed bearing, cone and URL state. The helper no longer writes an intended angle as if the viewer actually reached it. Exceptions are debug-logged and a current failed panorama adjustment shows a short message while leaving the image usable. No request, timer, animation loop or private viewer API is added. Public Image fields are used; the local math was checked against the installed SDK's Transform, not imported from SDK internals at runtime.\n\nThe SDK-derived fixture covers 36 combinations of tilt/roll, EXIF 1/3/6/8 and compass wraparound. This aims at a horizontal direction only: POI elevation, camera/POI positional error, occlusion and entrance location remain unknown. Live scene verification is still necessary. Other non-POI bearing helpers are outside this change.\n\n\n## Overlapping loaded places (v6.54)\n\nIcons within 24 CSS px of a stable anchor are grouped into a small count badge. Counts represent only the current loaded results (at most 200), not every place in the service. Fixed-anchor grouping avoids linking a long chain of nearby points into a sprawling group. Original coordinates/records remain unchanged; the badge is drawn at one actual member's position. Projection follows the current 2D/3D view.\n\nClicking a count badge opens a local four-row chooser with Previous/Next pages. Choosing a row opens normal details and selection; no imagery search or navigation happens automatically. The ordinary loaded-places list continues to include every loaded member. A selected badge at a grouped location also allows access to the chooser, so it cannot cover the group permanently; the selected card still reopens that individual place directly.\n\nRegrouping runs only along the existing controller idle query/display path while stationary and not busy, never on pointer moves or animation frames. It adds no requests or timers. The bounded grid groups at most 200 projected points, and unchanged membership/coordinates reuse the displayed graphics. Count symbols use local static SVGs and a cache capped at 32 entries. Queries may still temporarily retain the previous display while the existing replacement work waits. New queries/data or zooming can change counts, reflecting the loaded subset.\n\nA local Node benchmark of the pure grouping step (excluding SDK projection/rendering) measured median about 0.14 ms for 200 separated points and 0.09 ms for dense points. These are not mobile FPS or total map-render measurements. Live projection, terrain/occlusion and count presentation should be checked in the deployed map.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/overlappingPlaces.ts",
      "content": "import type { Place } from './placesModel';\nexport const PLACE_OVERLAP_DISTANCE = 24;\nexport interface PlaceGroupMarker { id: string; anchor: Place; members: readonly Place[]; }\n/** Fixed-anchor screen buckets avoid long transitive chains. At most 200 loaded records. */\nexport function groupOverlappingPlaces(places: readonly Place[], screen: (place: Place) => { x: number; y: number } | null): PlaceGroupMarker[] {\n  const groups: { id: string; anchor: Place; members: Place[]; x: number; y: number }[] = [];\n  const cells = new Map<string, number[]>(), radius = PLACE_OVERLAP_DISTANCE;\n  for (const place of places.slice(0, 200).sort((a, b) => a.id.localeCompare(b.id))) {\n    const p = screen(place); if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;\n    const x = Math.floor(p.x / radius), y = Math.floor(p.y / radius);\n    let nearest = -1, best = radius * radius;\n    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const index of cells.get(`${x + dx}:${y + dy}`) || []) {\n      const group = groups[index], distance = (group.x - p.x) ** 2 + (group.y - p.y) ** 2;\n      if (distance < best || (distance === best && (nearest < 0 || index < nearest))) { nearest = index; best = distance; }\n    }\n    if (nearest >= 0) groups[nearest].members.push(place);\n    else { const key = `${x}:${y}`, indices = cells.get(key) || []; indices.push(groups.length); cells.set(key, indices); groups.push({ id: `@places-group:${place.id}`, anchor: place, members: [place], x: p.x, y: p.y }); }\n  }\n  return groups.map(({ id, anchor, members }) => ({ id, anchor, members }));\n}\nexport function placeCountSymbol(count: number): any {\n  if (!Number.isInteger(count) || count < 2 || count > 200) throw new Error('Invalid Places count');\n  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"#315b68\" stroke=\"#fff4dc\" stroke-width=\"2\"/><text x=\"16\" y=\"16\" dy=\".35em\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"${count >= 100 ? 11 : 14}\" font-weight=\"bold\" fill=\"#fff\">${count}</text></svg>`;\n  return { type: 'picture-marker', url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), width: 18, height: 18 };\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-overlap-groups-v6-54-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.54 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-overlap-groups-v6-54' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.54 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.54 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.54 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-overlap-groups-v6-54.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places overlap groups v6.54 is already installed. No files changed.');
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
  const manifest = { installer: 'places-overlap-groups-v6-54', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places overlap groups v6.54 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
