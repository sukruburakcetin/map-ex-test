#!/usr/bin/env node
'use strict';
/**
 * Places nearby imagery v6.40. Compatible current v6 sources.
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
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: place => { void this.explorePlace(place); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n",
              "after": "    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: (place, radius, signal) => this.explorePlace(place, radius, signal), openImagery: image => { void this.openPlaceImagery(image); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n    const request = this._selectionRequestId;\n    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    this.showToast('Finding imagery near this place\u2026', 3000);\n    try {\n      const dy = 250 / 111320, dx = dy / Math.max(.1, Math.cos(place.lat * Math.PI / 180));\n      const bbox = [Math.max(-180, place.lon - dx), place.lat - dy, Math.min(180, place.lon + dx), place.lat + dy];\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) return;\n      const candidates = (data.data || []).filter((p: any) => p.id && p.sequence && Array.isArray(p.geometry?.coordinates) && p.geometry.coordinates.length >= 2 && p.geometry.coordinates.every(Number.isFinite))\n        .map((p: any) => ({ ...p, distance: distanceMeters(place.lat, place.lon, p.geometry.coordinates[1], p.geometry.coordinates[0]) }))\n        .filter((p: any) => p.distance <= 250).sort((a: any, b: any) => a.distance - b.distance);\n      const selected = candidates[0];\n      if (!selected) { this.showToast('No nearby imagery was found for this place.', 4000); return; }\n      view.closePopup();\n      await this.loadSequenceById(String(selected.sequence), String(selected.id), { lon: selected.geometry.coordinates[0], lat: selected.geometry.coordinates[1] });\n    } catch (error) { if (current()) this.showToast('Nearby imagery could not load. Try another place or image point.', 4000); }\n    finally { if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); } }\n  }\n\n  private mapillaryVTLayer: __esri.VectorTileLayer | null = null;\n  private mapillaryTrafficSignsLayer: __esri.VectorTileLayer | null = null;\n",
              "after": "    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n    this._placesExploreAbort?.abort(); const controller = new AbortController(); this._placesExploreAbort = controller;\n    const abort = () => controller.abort(); signal.addEventListener('abort', abort, { once: true });\n    const timeout = setTimeout(abort, 12000);\n    const request = this._selectionRequestId;\n    const current = () => !controller.signal.aborted && this.state.jimuMapView?.view === view && request === this._selectionRequestId;\n    this._places?.controller.sync();\n    try {\n      const bbox = placeImageryBbox(place, radius);\n      const data = await this.fetchMapillaryJson(`${GRAPH_API.BASE}/images?fields=id,sequence,geometry,computed_geometry&bbox=${bbox.join(',')}&limit=40`, this.accessToken, controller.signal);\n      if (!current()) throw new DOMException('Cancelled', 'AbortError');\n      return choosePlaceImagery(place, Array.isArray(data.data) ? data.data : [], radius, distanceMeters);\n    } finally {\n      clearTimeout(timeout); signal.removeEventListener('abort', abort);\n      if (this._placesExploreAbort === controller) { this._placesExploreAbort = null; this._places?.controller.sync(); }\n    }\n  }\n  private async openPlaceImagery(image: PlaceImagery) {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed) return;\n    view.closePopup();\n    try { await this.loadSequenceById(image.sequence, image.id, { lon: image.lon, lat: image.lat }); }\n    catch { this.showToast('Nearby imagery could not open. Choose another image point or try again.', 4000); }\n  }\n\n  private mapillaryVTLayer: __esri.VectorTileLayer | null = null;\n  private mapillaryTrafficSignsLayer: __esri.VectorTileLayer | null = null;\n"
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
              "before": "import { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n",
              "after": "import { PlaceImagery } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "  private records = new Map<string, Place>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private popupContent: HTMLDivElement | null = null;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.controller = new PlacesController({\n",
              "after": "  private records = new Map<string, Place>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n  private popupContent: HTMLDivElement | null = null;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.controller = new PlacesController({\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "    const content = document.createElement('div');\n    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);\n    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }\n    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Explore nearby imagery'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; button.onclick = () => this.host.explore(place); content.appendChild(button);\n    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' \u00b7 ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.style.fontSize = '11px'; content.appendChild(source);\n    this.popupContent = content;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  private clear(): void {\n    if (!this.ownerView?.destroyed && this.popupContent && this.ownerView?.popup?.content === this.popupContent) this.ownerView.closePopup();\n    this.popupContent = null;\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n",
              "after": "    const content = document.createElement('div');\n    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);\n    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }\n    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }\n    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.cssText = 'font-size:11px;line-height:1.4'; content.appendChild(status);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.ownerView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n      if (candidate) { this.host.openImagery(candidate); return; }\n      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;\n      button.disabled = true; status.textContent = `Looking within ${radius} m\u2026`;\n      try {\n        const found = await this.host.explore(place, radius, controller.signal);\n        if (controller.signal.aborted || !active()) return;\n        if (found) {\n          candidate = found; button.textContent = `Open imagery \u00b7 about ${Math.ceil(found.distance)} m away`;\n          status.textContent = 'Closest result in this search. The camera may not face this place.';\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther \u00b7 within 250 m';\n          status.textContent = 'No image found within 75 m. You can try a wider area.';\n        } else {\n          button.textContent = 'Search again \u00b7 within 250 m'; status.textContent = 'No suitable image found within 250 m.';\n        }\n      } catch (error) {\n        if (!controller.signal.aborted && active()) { button.textContent = `Retry search \u00b7 within ${radius} m`; status.textContent = 'Imagery search could not finish. Please try again.'; }\n      } finally {\n        button.disabled = false;\n        if (this.searchAbort === controller) this.searchAbort = null;\n      }\n    };\n    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' \u00b7 ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.style.fontSize = '11px'; content.appendChild(source);\n    this.popupContent = content;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  private clear(): void {\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.ownerView?.destroyed && this.popupContent && this.ownerView?.popup?.content === this.popupContent) this.ownerView.closePopup();\n    this.popupContent = null;\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n"
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
              "before": "const src=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['placesPauseReason','placesBusy','syncPlaces','togglePlaces','setPlacesGroup'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');\ntest('widget default-off path never constructs an ArcGIS service or optional owner',()=>{let owners=0;const Runtime=new Function('ArcGISPlaces','placesServiceUrl','PLACE_GROUPS','webMercatorUtils',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(class{constructor(){owners++;}},model.placesServiceUrl,model.PLACE_GROUPS,{});const w=new Runtime();w.props={config:{enablePlaces:true,placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,jimuMapView:{view:{ready:true}}};w.ArcGISModules={get FeatureLayer(){throw Error('must not load a service while off');}};for(let i=0;i<100;i++)w.syncPlaces();assert.equal(owners,0);});\ntest('ArcGIS adapter owns only bounded graphics, escapes popup content and removes its own resources',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,removed=0,busy=false;const layers=[],ui=[];\n const element=()=>({children:[],style:{},appendChild(x){this.children.push(x);},remove(){}});\n const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:p=>explored=p});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:17,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);view.popup.content.children.find(x=>x.textContent==='Explore nearby imagery').onclick();assert.equal(explored.id,'gers-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n",
              "after": "const src=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['placesPauseReason','placesBusy','syncPlaces','togglePlaces','setPlacesGroup'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');\ntest('widget default-off path never constructs an ArcGIS service or optional owner',()=>{let owners=0;const Runtime=new Function('ArcGISPlaces','placesServiceUrl','PLACE_GROUPS','webMercatorUtils',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(class{constructor(){owners++;}},model.placesServiceUrl,model.PLACE_GROUPS,{});const w=new Runtime();w.props={config:{enablePlaces:true,placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,jimuMapView:{view:{ready:true}}};w.ArcGISModules={get FeatureLayer(){throw Error('must not load a service while off');}};for(let i=0;i<100;i++)w.syncPlaces();assert.equal(owners,0);});\ntest('ArcGIS adapter owns only bounded graphics, escapes popup content and removes its own resources',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,openedImage=null,removed=0,busy=false;const layers=[],ui=[];\n const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},remove(){}});\n const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:17,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const owner={screenTarget:()=> 'gers-1'};\n const w={props:{state:'OPENED'},state:{jimuMapView:{view},turboModeActive:true,placesActive:true},_places:owner,_coverageSelectionTargets:{snapshot:()=>null},coverageSelectionContext:()=>({}),_sharedNotesLayer:null,_pointCloudHits:{route:()=>false},setState(){},showPlacesHit(results,id){assert.deepEqual(results,[]);target=id;opened++;return true;}};\n const handler=new Function('view','TURBO_LIMITS',compile('return '+callback.getText(sf))).call(w,view,{pickRadiusPx:10});const pending=handler({x:10,y:10,stopPropagation(){stopped++;}});assert.equal(stopped,1);assert.equal(opened,0);resolve({results:[]});await pending;assert.equal(target,'gers-1');assert.equal(opened,1);\n});\n",
              "after": " const owner={screenTarget:()=> 'gers-1'};\n const w={props:{state:'OPENED'},state:{jimuMapView:{view},turboModeActive:true,placesActive:true},_places:owner,_coverageSelectionTargets:{snapshot:()=>null},coverageSelectionContext:()=>({}),_sharedNotesLayer:null,_pointCloudHits:{route:()=>false},setState(){},showPlacesHit(results,id){assert.deepEqual(results,[]);target=id;opened++;return true;}};\n const handler=new Function('view','TURBO_LIMITS',compile('return '+callback.getText(sf))).call(w,view,{pickRadiusPx:10});const pending=handler({x:10,y:10,stopPropagation(){stopped++;}});assert.equal(stopped,1);assert.equal(opened,0);resolve({results:[]});await pending;assert.equal(target,'gers-1');assert.equal(opened,1);\n});\nconst nearby=load('nearbyPlaceImagery');const geoModule={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(root,'src/utils/geoUtils.ts'),'utf8')))(geoModule,geoModule.exports);const distance=geoModule.exports.distanceMeters;\ntest('nearby imagery starts within 75m and rejects original/computed coordinate jumps',()=>{\n const place={lon:-86.13,lat:39.78},image=(id,metres,computed)=>({id,sequence:'seq',geometry:{coordinates:[place.lon,place.lat+metres/111195]},...(computed===undefined?{}:{computed_geometry:{coordinates:[place.lon,place.lat+computed/111195]}})});\n assert(nearby.choosePlaceImagery(place,[image('near',30),image('far',200)],75,distance).distance<31);\n assert.equal(nearby.choosePlaceImagery(place,[image('far',80)],75,distance),null);\n assert.equal(nearby.choosePlaceImagery(place,[image('shifted',10,400)],250,distance),null);\n assert.equal(nearby.choosePlaceImagery(place,[image('shifted-original',400,10)],250,distance),null);\n assert.equal(nearby.choosePlaceImagery(place,[image('wider',200)],250,distance).id,'wider');\n assert.equal(nearby.choosePlaceImagery(place,[{id:'bad',sequence:'seq',geometry:{coordinates:['x',0]}}],75,distance),null);\n assert.throws(()=>nearby.placeImageryBbox(place,1000));assert.throws(()=>nearby.placeImageryBbox({lon:Infinity,lat:0},75));\n});\ntest('nearby imagery considers at most 40 records and conservative distances',()=>{\n const place={lon:0,lat:0};const rows=Array.from({length:40},(_,i)=>({id:String(i),sequence:'seq',geometry:{coordinates:[0,.0004]},computed_geometry:{coordinates:[0,.0005]}}));rows.push({id:'outside-page',sequence:'seq',geometry:{coordinates:[0,0]}});const result=nearby.choosePlaceImagery(place,rows,75,distance);assert.notEqual(result.id,'outside-page');assert(result.distance>55&&result.distance<56);\n});\ntest('popup wider search is explicit, duplicate clicks are blocked and obsolete results cannot navigate',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;\n const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},remove(){}});global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n const calls=[];let navigations=0;const place={id:'p',name:'Museum',category:'museum',address:'',website:'',release:'',lon:0,lat:0};const view={destroyed:false,watch(){return{remove(){}};},openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'popup',url:'https://host/FeatureServer/0',modules:{Point:class{constructor(p){Object.assign(this,p);}}},view:()=>view,busy:()=>false,status(){},geographic:x=>x,explore:(p,radius,signal)=>new Promise((resolve,reject)=>calls.push({radius,signal,resolve,reject})),openImagery(){navigations++;}});\n owner.ownerView=view;owner.graphics={visible:true,destroy(){}};owner.records.set('p',place);\n try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve(null);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search farther \u00b7 within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[1].radius,250);calls[1].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search \u00b7 within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[2].signal.aborted);calls[2].resolve({id:'image',distance:30});await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','choosePlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.choosePlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n const w=new Runtime(),view={destroyed:false};w.state={jimuMapView:{view}};w._selectionRequestId=1;w.accessToken='test';let url,resolve;w.fetchMapillaryJson=async(u,t,signal)=>{url=u;assert.equal(t,'test');assert(!signal.aborted);return {data:[{id:'i',sequence:'s',geometry:{coordinates:[0,.0001]}}]};};w.loadSequenceById=()=>{throw Error('search must not navigate');};const candidate=await w.explorePlace({lon:0,lat:0},75,new AbortController().signal);assert.equal(candidate.id,'i');assert(url.includes('limit=40'));assert(url.includes('computed_geometry'));assert.equal(w._placesExploreAbort,null);\n w.fetchMapillaryJson=()=>new Promise(r=>resolve=r);const pending=w.explorePlace({lon:0,lat:0},75,new AbortController().signal);w._selectionRequestId++;resolve({data:[]});await assert.rejects(pending,{name:'AbortError'});assert.equal(w._placesExploreAbort,null);\n});\n"
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
              "before": "The pilot includes curated health, education, parks, landmarks and everyday-service categories. Inspect the mapping in the exporter against each release. Its current schema uses `basic_category` and `taxonomy`, not the removed `categories` property. Confidence >=0.95 is an existence threshold, not a guarantee of positional accuracy or a correct entrance. Duplicate or outdated places may remain. Preserve Overture/source license notices, stable GERS IDs and the dated release.\n\n## Interaction and scheduling\n\nPlaces appear at zoom 15 and closer. This is a pilot density/performance policy, independent of Mapillary's object/sign interaction thresholds. Category filters and loading/error messages appear in a compact panel. Closing the filters leaves the layer on; the Places control turns it off. Hover shows a name; selecting a point opens source details, a safe website link when available, and an explicit **Explore nearby imagery** action. The action checks at most 40 Mapillary candidates within 250 metres and uses existing image/sequence loading. A nearby image may not show the place or its entrance.\n\nThe service FeatureLayer is query-only and never added to the map. One owned GraphicsLayer below the Mapillary layers displays up to 200 points. Direct hits on visible Places markers open local details before sequence/coverage/object picking. Route/annotation modes, shared notes and point-cloud tools retain priority. Places reuses the existing hover/click hit-test path; clicks outside its markers continue through normal Mapillary picking. Enabling Places adds bounded querying/rendering/hit-test work; it cannot honestly be described as free.\n\nUpdates wait for a stationary map, a 650 ms debounce and an idle callback. Loading imagery, playback, fullscreen imagery, a hidden document or a closed widget pauses optional work. Foreground activity aborts optional requests and obsolete results cannot replace current data. Already-displayed Places details remain clickable during imagery loading or playback; this local popup does not start a Places request. One unsettled transport occupies the controller's request slot even if it ignores cancellation. Requests time out after 12 seconds, with manual retry and no automatic retry loop. Previous displayed points remain during an update, except when hidden below the zoom threshold, changing category/view, or turning the layer off.\n",
              "after": "The pilot includes curated health, education, parks, landmarks and everyday-service categories. Inspect the mapping in the exporter against each release. Its current schema uses `basic_category` and `taxonomy`, not the removed `categories` property. Confidence >=0.95 is an existence threshold, not a guarantee of positional accuracy or a correct entrance. Duplicate or outdated places may remain. Preserve Overture/source license notices, stable GERS IDs and the dated release.\n\n## Interaction and scheduling\n\nPlaces appear at zoom 15 and closer. This is a pilot density/performance policy, independent of Mapillary's object/sign interaction thresholds. Category filters and loading/error messages appear in a compact panel. Closing the filters leaves the layer on; the Places control turns it off. Hover shows a name; selecting a point opens source details, a safe website link when available, and an explicit **Explore nearby imagery** action. The first search checks at most 40 Mapillary candidates within 75 metres. It shows the distance and requires a separate Open click before using existing image/sequence loading. If empty, a separate Search farther button offers a 250-metre search (again capped at 40 results); it never widens automatically. Ranking covers only the returned page, not every Mapillary image. Both original and computed positions, when available, must lie within the chosen radius. The displayed distance conservatively uses the larger of those distances. A nearby image may not show the place or its entrance.\n\nThe service FeatureLayer is query-only and never added to the map. One owned GraphicsLayer below the Mapillary layers displays up to 200 points. Direct hits on visible Places markers open local details before sequence/coverage/object picking. Route/annotation modes, shared notes and point-cloud tools retain priority. Places reuses the existing hover/click hit-test path; clicks outside its markers continue through normal Mapillary picking. Enabling Places adds bounded querying/rendering/hit-test work; it cannot honestly be described as free.\n\nUpdates wait for a stationary map, a 650 ms debounce and an idle callback. Loading imagery, playback, fullscreen imagery, a hidden document or a closed widget pauses optional work. Foreground activity aborts optional requests and obsolete results cannot replace current data. Already-displayed Places details remain clickable during imagery loading or playback; this local popup does not start a Places request. One unsettled transport occupies the controller's request slot even if it ignores cancellation. Requests time out after 12 seconds, with manual retry and no automatic retry loop. Previous displayed points remain during an update, except when hidden below the zoom threshold, changing category/view, or turning the layer off.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/nearbyPlaceImagery.ts",
      "content": "import { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n  const p = geometry?.coordinates;\n  return Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90 ? [p[0], p[1]] : null;\n};\nexport function placeImageryBbox(place: Pick<Place, 'lon' | 'lat'>, radius: number): number[] {\n  if (!PLACE_IMAGERY_RADII.includes(radius as 75 | 250) || !Number.isFinite(place.lon) || !Number.isFinite(place.lat) || Math.abs(place.lon) > 180 || Math.abs(place.lat) > 85) throw new Error('Invalid nearby imagery search');\n  const dy = radius / 111320, dx = dy / Math.max(.08, Math.cos(place.lat * Math.PI / 180));\n  return [Math.max(-180, place.lon - dx), Math.max(-90, place.lat - dy), Math.min(180, place.lon + dx), Math.min(90, place.lat + dy)];\n}\n/** Rank only this bounded page, not all Mapillary imagery. Reject either reported position outside the radius. */\nexport function choosePlaceImagery(place: Pick<Place, 'lon' | 'lat'>, rows: any[], radius: number, distance: (a: number, b: number, c: number, d: number) => number): PlaceImagery | null {\n  placeImageryBbox(place, radius);\n  let best: PlaceImagery | null = null;\n  for (const row of rows.slice(0, 40)) {\n    const p = coordinates(row.geometry);\n    if (!p || !row.id || !row.sequence) continue;\n    const originalDistance = distance(place.lat, place.lon, p[1], p[0]);\n    const computed = row.computed_geometry == null ? p : coordinates(row.computed_geometry);\n    if (!computed) continue;\n    const computedDistance = distance(place.lat, place.lon, computed[1], computed[0]);\n    const conservativeDistance = Math.max(originalDistance, computedDistance);\n    if (!Number.isFinite(conservativeDistance) || conservativeDistance > radius) continue;\n    const candidate = { id: String(row.id), sequence: String(row.sequence), lon: p[0], lat: p[1], distance: conservativeDistance, radius };\n    if (!best || candidate.distance < best.distance) best = candidate;\n  }\n  return best;\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-nearby-imagery-v6-40-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.40 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-nearby-imagery-v6-40' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.40 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.40 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.40 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-nearby-imagery-v6-40.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places nearby imagery v6.40 is already installed. No files changed.');
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
  const manifest = { installer: 'places-nearby-imagery-v6-40', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places nearby imagery v6.40 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
