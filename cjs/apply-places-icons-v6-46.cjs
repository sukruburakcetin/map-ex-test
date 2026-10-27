#!/usr/bin/env node
'use strict';
/**
 * Places icons v6.46. Compatible current v6 sources.
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
              "before": "import { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\n",
              "after": "import { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "  private service: any = null;\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n",
              "after": "  private service: any = null;\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private iconSymbols = new Map<string, any>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';\n      const link = document.createElement('a'); link.textContent = 'Places \u00b7 Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';\n      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');\n    }\n    const symbol = new this.host.modules.SimpleMarkerSymbol({ style: 'circle', size: 6, color: [232, 218, 176, .95], outline: { color: [45, 66, 51], width: 1 } });\n    const graphics = places.map(p => new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol, attributes: { place_id: p.id } }));\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n",
              "after": "      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';\n      const link = document.createElement('a'); link.textContent = 'Places \u00b7 Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';\n      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');\n    }\n    const graphics = places.map(p => {\n      const cached = this.iconSymbols.get(p.group);\n      const graphic = new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol: cached || placeCategorySymbol(p.group), attributes: { place_id: p.id } });\n      if (!cached) this.iconSymbols.set(p.group, graphic.symbol);\n      return graphic;\n    });\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 4",
              "before": "  screenTarget(screen: { x: number; y: number }): string | null {\n    const selected = this.selection.screenTarget(screen); if (selected) return selected;\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = 6 * 6;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n      const id = graphic.attributes?.place_id;\n      if (!this.records.has(id)) continue;\n      const point = view.toScreen(graphic.geometry);\n",
              "after": "  screenTarget(screen: { x: number; y: number }): string | null {\n    const selected = this.selection.screenTarget(screen); if (selected) return selected;\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = PLACE_ICON_RADIUS * PLACE_ICON_RADIUS;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n      const id = graphic.attributes?.place_id;\n      if (!this.records.has(id)) continue;\n      const point = view.toScreen(graphic.geometry);\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 5",
              "before": "  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null;\n  }\n}\n",
              "after": "  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null; this.iconSymbols.clear();\n  }\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/SelectedPlace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/SelectedPlace.ts block 1",
              "before": "import type { Place } from './placesModel';\n/** One selection ring and an optional camera link; no queries, watches or animation. */\nexport class SelectedPlace {\n  place: Place | null = null;\n",
              "after": "import { placeCategorySymbol, SELECTED_PLACE_ICON_RADIUS } from './placeIcons';\nimport type { Place } from './placesModel';\n/** One selection ring and an optional camera link; no queries, watches or animation. */\nexport class SelectedPlace {\n  place: Place | null = null;\n"
            },
            {
              "label": "src/features/places/SelectedPlace.ts block 2",
              "before": "  }\n  screenTarget(screen: { x: number; y: number }): string | null {\n    if (!this.place || !this.ring || this.view !== this.host.view() || this.view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    const point = this.view.toScreen(this.ring.geometry);\n    return point && Number.isFinite(point.x) && Number.isFinite(point.y) && (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2 <= 49 ? this.place.id : null;\n  }\n  rebind(): void { this.removeLayer(); this.render(); }\n  clear(notify = true): void { this.place = null; this.link = false; this.removeLayer(); if (notify) this.host.changed?.(null); }\n  dispose(): void { this.clear(false); this.camera = null; }\n",
              "after": "  }\n  screenTarget(screen: { x: number; y: number }): string | null {\n    if (!this.place || !this.ring || this.view !== this.host.view() || this.view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    const point = this.view.toScreen(this.ring.geometry);\n    return point && Number.isFinite(point.x) && Number.isFinite(point.y) && (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2 <= SELECTED_PLACE_ICON_RADIUS ** 2 ? this.place.id : null;\n  }\n  rebind(): void { this.removeLayer(); this.render(); }\n  clear(notify = true): void { this.place = null; this.link = false; this.removeLayer(); if (notify) this.host.changed?.(null); }\n  dispose(): void { this.clear(false); this.camera = null; }\n"
            },
            {
              "label": "src/features/places/SelectedPlace.ts block 3",
              "before": "      this.layer = new this.host.modules.GraphicsLayer({ id: `overture-selection-${this.host.id}`, title: 'Selected place', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      this.view.map.add(this.layer);\n    }\n    const geometry = new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });\n    if (this.ring) this.ring.geometry = geometry;\n    else {\n      this.ring = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-marker', style: 'circle', size: 11, color: [0, 0, 0, 0], outline: { color: '#ffe4a3', width: 2 } }, attributes: { place_id: place.id } });\n      this.layer.addMany([this.ring]);\n    }\n    this.ring.attributes = { place_id: place.id };\n    this.renderLink();\n",
              "after": "      this.layer = new this.host.modules.GraphicsLayer({ id: `overture-selection-${this.host.id}`, title: 'Selected place', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      this.view.map.add(this.layer);\n    }\n    const geometry = new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });\n    if (this.ring) { this.ring.geometry = geometry; this.ring.symbol = placeCategorySymbol(place.group, true); }\n    else {\n      this.ring = new this.host.modules.Graphic({ geometry, symbol: placeCategorySymbol(place.group, true), attributes: { place_id: place.id } });\n      this.layer.addMany([this.ring]);\n    }\n    this.ring.attributes = { place_id: place.id };\n    this.renderLink();\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/SelectedPlaceCard.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/SelectedPlaceCard.tsx block 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '2px solid #ffe4a3', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>\u00d7</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} \u00b7 <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <img src={placeCategoryIcon(props.place.group, true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>\u00d7</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} \u00b7 <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n"
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
              "before": " const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:17,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n",
              "after": " const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);selection.setLink(true);const line=layer.items[1];assert.equal(created,2);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,2);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],line);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:18,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\n",
              "after": " class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);assert.equal(ring.symbol.width,21);selection.setLink(true);const line=layer.items[1];assert.equal(created,2);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,2);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],line);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:23,y:10}),'p');assert.equal(selection.screenTarget({x:25,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\ntest('bundled category icons are distinct, self-contained and reject arbitrary category markup',()=>{\n const icons=load('placeIcons'),groups=['health','education','parks','landmarks','services'];const urls=groups.map(g=>icons.placeCategoryIcon(g));assert.equal(new Set(urls).size,5);\n for(const url of [...urls,icons.placeCategoryIcon(undefined),icons.placeCategoryIcon('parks',true)]){assert(url.startsWith('data:image/svg+xml;'));const svg=decodeURIComponent(url.split(',')[1]);assert(svg.startsWith('<svg'));assert(!/<script|<image|<foreignObject|href=|url\\(/i.test(svg));}\n assert.equal(icons.placeCategoryIcon('<script>evil</script>'),icons.placeCategoryIcon(undefined));assert.equal(icons.placeCategoryIcon('__proto__'),icons.placeCategoryIcon(undefined));assert.equal(icons.placeCategoryIcon('constructor'),icons.placeCategoryIcon(undefined));\n assert.equal(icons.placeCategorySymbol('parks').width,12);assert.equal(icons.placeCategorySymbol('parks',true).width,21);assert(icons.SELECTED_PLACE_ICON_RADIUS>icons.PLACE_ICON_RADIUS);\n});\n"
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
              "before": "\n**Show camera link** is optional and starts off. It connects the current loaded camera coordinate to the selected place with one dashed line. It is a spatial relationship, not a route, sightline analysis or evidence that the place is visible. The line updates only from existing image events; one retained line is reused. Neither selecting a place nor drawing the link adds a query, timer or animation loop. Selection retains one place outside the viewport's 200-record page and one ring plus at most one link graphic. Changing to a new active map transfers this tiny overlay and removes the old layer.\n\nOverture's [Places guide](https://docs.overturemaps.org/guides/places/) and [place schema](https://docs.overturemaps.org/schema/reference/places/place/) document category taxonomy/basic categories for map iconography, not an official icon asset pack. This integration keeps its existing dots. A local SVG symbol set could later map those categories without remote icon requests; such icons would be application styling, not Overture-supplied data.\n",
              "after": "\n**Show camera link** is optional and starts off. It connects the current loaded camera coordinate to the selected place with one dashed line. It is a spatial relationship, not a route, sightline analysis or evidence that the place is visible. The line updates only from existing image events; one retained line is reused. Neither selecting a place nor drawing the link adds a query, timer or animation loop. Selection retains one place outside the viewport's 200-record page and one ring plus at most one link graphic. Changing to a new active map transfers this tiny overlay and removes the old layer.\n\nOverture's [Places guide](https://docs.overturemaps.org/guides/places/) and [place schema](https://docs.overturemaps.org/schema/reference/places/place/) document category taxonomy/basic categories for map iconography, not an official icon asset pack. This integration keeps its existing dots. A local SVG symbol set could later map those categories without remote icon requests; such icons would be application styling, not Overture-supplied data.\n\n\n## Bundled category icons and stronger selection (v6.46)\n\nThe five pilot groups now use application-owned SVG badges: a medical cross, book, tree, museum and shop. Unrecognized groups use a generic place pin; data-provided category strings never become SVG markup. Icons are data URLs generated from static local strings, with no external font, icon CDN or remote image requests. Regular icons are 16 CSS px (12 ArcGIS points), and the selected badge is 28 CSS px (21 points), with a gold fill, dark halo and category glyph. The selected card repeats the category icon. No pulsing or animation is added.\n\nThe adapter reuses the first SDK-autocast picture symbol per category for subsequent records and viewport updates; it releases this bounded cache on disposal. The screen-space click footprints match the larger presentation: 9 CSS px for normal markers and 14 px for selection. The existing single selection graphic is reused rather than adding another halo graphic. Selection/link behavior, data queries and sequence loading are unchanged. Picture-marker decoding/rendering adds a small bounded local cost compared with plain dots; live mobile rendering should still be checked in dense areas.\n\nThese are application symbols, not an official Overture icon set. Health means a general health category; the cross is not an emergency-service guarantee.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/placeIcons.ts",
      "content": "/** Application-owned SVGs: no external assets, fonts, scripts or category-supplied markup. */\nconst glyphs: Record<string, string> = {\n  health: '<path d=\"M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z\"/>',\n  education: '<path d=\"M6 9c4-1 7 0 10 2 3-2 6-3 10-2v15c-4-1-7 0-10 2-3-2-6-3-10-2z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M16 11v15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/>',\n  parks: '<path d=\"M16 5 8 16h4l-5 7h7v5h4v-5h7l-5-7h4z\"/>',\n  landmarks: '<path d=\"m16 6 11 6H5zM6 25h20v3H6zM8 14h3v9H8zm7 0h3v9h-3zm7 0h3v9h-3z\"/>',\n  services: '<path d=\"M7 7h18l3 8H4zm0 10h3v9H7zm15 0h3v9h-3zM7 24h18v3H7zM13 18h6v6h-6z\"/>',\n  other: '<path d=\"M16 5a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z\" fill-rule=\"evenodd\"/>',\n};\nconst colors: Record<string, string> = { health: '#884b50', education: '#385d70', parks: '#3e6b45', landmarks: '#756042', services: '#5b5a76', other: '#38594d' };\nconst cache = new Map<string, string>();\nexport const PLACE_ICON_RADIUS = 9;\nexport const SELECTED_PLACE_ICON_RADIUS = 14;\nexport function placeCategoryIcon(group: string | undefined, selected = false): string {\n  const category = group && Object.prototype.hasOwnProperty.call(glyphs, group) ? group : 'other';\n  const key = `${category}:${selected}`;\n  let url = cache.get(key);\n  if (!url) {\n    const backdrop = selected ? '<circle cx=\"16\" cy=\"16\" r=\"15\" fill=\"#142b22\" stroke=\"#fff4cb\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"11.5\" fill=\"#ffda74\"/>' : `<circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"${colors[category]}\" stroke=\"#fff3d1\" stroke-width=\"1.8\"/>`;\n    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\">${backdrop}<g fill=\"${selected ? '#142b22' : '#fff4dc'}\" color=\"${selected ? '#142b22' : '#fff4dc'}\" transform=\"translate(4 4) scale(.75)\">${glyphs[category]}</g></svg>`;\n    url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); cache.set(key, url);\n  }\n  return url;\n}\n/** ArcGIS numeric dimensions are points: 12pt = 16 CSS px, 21pt = 28 CSS px. */\nexport function placeCategorySymbol(group: string | undefined, selected = false): any {\n  return { type: 'picture-marker', url: placeCategoryIcon(group, selected), width: selected ? 21 : 12, height: selected ? 21 : 12 };\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-icons-v6-46-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.46 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-icons-v6-46' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.46 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.46 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.46 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-icons-v6-46.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places icons v6.46 is already installed. No files changed.');
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
  const manifest = { installer: 'places-icons-v6-46', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places icons v6.46 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
