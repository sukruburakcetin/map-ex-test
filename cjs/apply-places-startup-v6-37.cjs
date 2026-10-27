#!/usr/bin/env node
'use strict';
/**
 * Places startup v6.37. Compatible current v6 sources.
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
              "before": "  private _places: ArcGISPlaces | null = null;\n  private _placesView: __esri.MapView | __esri.SceneView | null = null;\n  private _placesUrl = '';\n  private _placesExploreAbort: AbortController | null = null;\n  private placesBusy = () => !!this.state.isLoading || this._imageryOpeningRequest != null || this._userPaused === false ||\n    this.state.isFullscreen || this.props.state === 'CLOSED' || (typeof document !== 'undefined' && document.visibilityState !== 'visible') || !!(this._placesExploreAbort && !this._placesExploreAbort.signal.aborted);\n  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n",
              "after": "  private _places: ArcGISPlaces | null = null;\n  private _placesView: __esri.MapView | __esri.SceneView | null = null;\n  private _placesUrl = '';\n  private _placesExploreAbort: AbortController | null = null;\n  private placesPauseReason = (): string => {\n    if (this.props.state === 'CLOSED') return 'Open the widget to load nearby places.';\n    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return 'Return to this tab to load nearby places.';\n    if (this.state.isFullscreen) return 'Return to the main map to load nearby places.';\n    if (this.state.isLoading || this._imageryOpeningRequest != null) return 'Places will update after the image finishes loading.';\n    if (this._userPaused === false) return 'Pause image playback to update nearby places.';\n    if (this._placesExploreAbort && !this._placesExploreAbort.signal.aborted) return 'Finding imagery near the selected place\u2026';\n    return '';\n  };\n  private placesBusy = () => !!this.placesPauseReason();\n  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        busy: this.placesBusy, status: placesStatus => this.setState({ placesStatus }), explore: place => { void this.explorePlace(place); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n",
              "after": "    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: place => { void this.explorePlace(place); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n"
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
              "before": "  private popupContent: HTMLDivElement | null = null;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    busy(): boolean; status(state: PlacesState): void; explore(place: Place): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), busy: host.busy,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n        const service = this.service;\n        try {\n",
              "after": "  private popupContent: HTMLDivElement | null = null;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n        const service = this.service;\n        try {\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "      display: (places, view) => this.display(places, view),\n      visible: visible => { if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible; },\n      clear: () => this.clear(), status: host.status,\n      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),\n      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work) } : { idle: false, id: setTimeout(work, 0) },\n      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),\n    });\n    this.watchView();\n    document.addEventListener('visibilitychange', this.visibility);\n",
              "after": "      display: (places, view) => this.display(places, view),\n      visible: visible => { if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible; },\n      clear: () => this.clear(), status: host.status,\n      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),\n      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work, { timeout: 1500 }) } : { idle: false, id: setTimeout(work, 0) },\n      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),\n    });\n    this.watchView();\n    document.addEventListener('visibilitychange', this.visibility);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/PlacesController.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/PlacesController.ts block 1",
              "before": "import { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';\nexport interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }\nexport interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error'; count: number; limited?: boolean; }\nexport interface PlacesHost {\n  view(): PlacesView | null;\n  busy(): boolean;\n  query(bbox: PlaceBbox, group: PlaceGroup, signal: AbortSignal): Promise<{ features: any[]; limited: boolean }>;\n  display(places: Place[], view: object): void;\n  visible(value: boolean): void;\n  clear(): void;\n",
              "after": "import { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';\nexport interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }\nexport interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error'; count: number; limited?: boolean; reason?: string; }\nexport interface PlacesHost {\n  view(): PlacesView | null;\n  busy(): boolean;\n  pauseReason?(): string;\n  query(bbox: PlaceBbox, group: PlaceGroup, signal: AbortSignal): Promise<{ features: any[]; limited: boolean }>;\n  display(places: Place[], view: object): void;\n  visible(value: boolean): void;\n  clear(): void;\n"
            },
            {
              "label": "src/features/places/PlacesController.ts block 2",
              "before": "      this.invalidate(); this.desired = ''; this.host.visible(false); this.status({ kind: 'zoom', count: 0 }); return;\n    }\n    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }\n    this.host.visible(true);\n    if (this.host.busy() || !view.stationary) { this.invalidate(); this.desired = ''; this.status({ kind: 'paused', count: 0 }); return; }\n    const bbox = view.bbox;\n    const key = JSON.stringify([this.group, ...bbox.map(n => n.toFixed(6))]);\n    if (this.desired === key) return;\n    this.invalidate(); this.desired = key;\n",
              "after": "      this.invalidate(); this.desired = ''; this.host.visible(false); this.status({ kind: 'zoom', count: 0 }); return;\n    }\n    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }\n    this.host.visible(true);\n    if (this.host.busy() || !view.stationary) { this.invalidate(); this.desired = ''; this.status({ kind: 'paused', count: 0, reason: this.host.busy() ? this.host.pauseReason?.() || 'Places will update when browsing pauses.' : 'Stop moving the map to load nearby places.' }); return; }\n    const bbox = view.bbox;\n    const key = JSON.stringify([this.group, ...bbox.map(n => n.toFixed(6))]);\n    if (this.desired === key) return;\n    this.invalidate(); this.desired = key;\n"
            },
            {
              "label": "src/features/places/PlacesController.ts block 3",
              "before": "      this.cache.delete(key); this.cache.set(key, cached); this.displayedView = view.token;\n      this.host.display(cached.places, view.token); this.status({ kind: 'ready', count: cached.places.length, limited: cached.limited }); return;\n    }\n    const revision = this.revision, token = view.token;\n    this.status({ kind: 'paused', count: 0 });\n    this.pendingTimer = this.host.timer(() => {\n      this.pendingTimer = null;\n      this.pendingIdle = this.host.idle(() => {\n        this.pendingIdle = null;\n",
              "after": "      this.cache.delete(key); this.cache.set(key, cached); this.displayedView = view.token;\n      this.host.display(cached.places, view.token); this.status({ kind: 'ready', count: cached.places.length, limited: cached.limited }); return;\n    }\n    const revision = this.revision, token = view.token;\n    this.status({ kind: 'paused', count: 0, reason: 'Preparing nearby places\u2026' });\n    this.pendingTimer = this.host.timer(() => {\n      this.pendingTimer = null;\n      this.pendingIdle = this.host.idle(() => {\n        this.pendingIdle = null;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/PlacesPanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/PlacesPanel.tsx block 1",
              "before": "import { React, jsx } from 'jimu-core';\nimport type { PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} places in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n",
              "after": "import { React, jsx } from 'jimu-core';\nimport type { PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} places in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n"
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
              "before": "test('sustained browsing respects both byte and entry budgets',async()=>{const f=fixture();f.controller.setEnabled(true);const rows=Array.from({length:200},(_,i)=>row(i,{place_name:(i+'x'.repeat(120)),category:'x'.repeat(80),address:'x'.repeat(180),website:'https://example.com/'+ 'x'.repeat(480),data_release:'x'.repeat(40)}));for(let i=0;i<12;i++){f.view={...f.view,bbox:[0,0,1+i*.01,1]};f.controller.sync();await f.advance();await f.complete(rows);assert(f.controller.stats.cacheBytes<=model.PLACES_LIMITS.cacheBytes);assert(f.controller.stats.entries<=6);}assert(f.controller.stats.entries<6);});\ntest('timeout aborts the request and exposes retry without an automatic loop',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();await f.advance(12000);assert(f.calls[0].signal.aborted);assert.equal(f.statuses.at(-1).kind,'error');await f.complete();await f.advance(12000);assert.equal(f.calls.length,1);f.controller.retry();await f.advance();assert.equal(f.calls.length,2);await f.complete();});\ntest('dispose releases tasks and cache, and no later call can restart work',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.controller.dispose();await f.complete();f.controller.retry();f.controller.setEnabled(true);f.controller.sync();await f.advance();assert.equal(f.calls.length,1);assert.equal(f.pending(),0);assert.equal(f.controller.stats.cacheBytes,0);});\nconst src=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['placesBusy','syncPlaces','togglePlaces','setPlacesGroup'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');\ntest('widget default-off path never constructs an ArcGIS service or optional owner',()=>{let owners=0;const Runtime=new Function('ArcGISPlaces','placesServiceUrl','PLACE_GROUPS','webMercatorUtils',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(class{constructor(){owners++;}},model.placesServiceUrl,model.PLACE_GROUPS,{});const w=new Runtime();w.props={config:{enablePlaces:true,placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,jimuMapView:{view:{ready:true}}};w.ArcGISModules={get FeatureLayer(){throw Error('must not load a service while off');}};for(let i=0;i<100;i++)w.syncPlaces();assert.equal(owners,0);});\ntest('ArcGIS adapter owns only bounded graphics, escapes popup content and removes its own resources',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,removed=0;const layers=[],ui=[];\n const element=()=>({children:[],style:{},appendChild(x){this.children.push(x);},remove(){}});\n",
              "after": "test('sustained browsing respects both byte and entry budgets',async()=>{const f=fixture();f.controller.setEnabled(true);const rows=Array.from({length:200},(_,i)=>row(i,{place_name:(i+'x'.repeat(120)),category:'x'.repeat(80),address:'x'.repeat(180),website:'https://example.com/'+ 'x'.repeat(480),data_release:'x'.repeat(40)}));for(let i=0;i<12;i++){f.view={...f.view,bbox:[0,0,1+i*.01,1]};f.controller.sync();await f.advance();await f.complete(rows);assert(f.controller.stats.cacheBytes<=model.PLACES_LIMITS.cacheBytes);assert(f.controller.stats.entries<=6);}assert(f.controller.stats.entries<6);});\ntest('timeout aborts the request and exposes retry without an automatic loop',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();await f.advance(12000);assert(f.calls[0].signal.aborted);assert.equal(f.statuses.at(-1).kind,'error');await f.complete();await f.advance(12000);assert.equal(f.calls.length,1);f.controller.retry();await f.advance();assert.equal(f.calls.length,2);await f.complete();});\ntest('dispose releases tasks and cache, and no later call can restart work',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.controller.dispose();await f.complete();f.controller.retry();f.controller.setEnabled(true);f.controller.sync();await f.advance();assert.equal(f.calls.length,1);assert.equal(f.pending(),0);assert.equal(f.controller.stats.cacheBytes,0);});\nconst src=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['placesPauseReason','placesBusy','syncPlaces','togglePlaces','setPlacesGroup'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');\ntest('widget default-off path never constructs an ArcGIS service or optional owner',()=>{let owners=0;const Runtime=new Function('ArcGISPlaces','placesServiceUrl','PLACE_GROUPS','webMercatorUtils',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(class{constructor(){owners++;}},model.placesServiceUrl,model.PLACE_GROUPS,{});const w=new Runtime();w.props={config:{enablePlaces:true,placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,jimuMapView:{view:{ready:true}}};w.ArcGISModules={get FeatureLayer(){throw Error('must not load a service while off');}};for(let i=0;i<100;i++)w.syncPlaces();assert.equal(owners,0);});\ntest('ArcGIS adapter owns only bounded graphics, escapes popup content and removes its own resources',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,removed=0;const layers=[],ui=[];\n const element=()=>({children:[],style:{},appendChild(x){this.children.push(x);},remove(){}});\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert(owner.open(hits));assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);view.popup.content.children.find(x=>x.textContent==='Explore nearby imagery').onclick();assert.equal(explored.id,'gers-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\n",
              "after": " const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert(owner.open(hits));assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);view.popup.content.children.find(x=>x.textContent==='Explore nearby imagery').onclick();assert.equal(explored.id,'gers-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n global.window={requestIdleCallback(work,options){captured={work,options};return 42;},cancelIdleCallback(id){cancelled=id;}};global.document={addEventListener(){},removeEventListener(){}};\n let owner;try{owner=new ArcGISPlaces({id:'deadline',url:'https://host/FeatureServer/0',modules:{},view:()=>null,geographic:x=>x,busy:()=>false,status(){},explore(){}});let ran=false;const handle=owner.controller.host.idle(()=>ran=true);assert.equal(captured.options.timeout,1500);assert.equal(ran,false);owner.controller.host.cancelIdle(handle);assert.equal(cancelled,42);}finally{owner?.dispose();global.window=oldWindow;global.document=oldDocument;}\n});\ntest('paused states distinguish foreground work from map movement and idle preparation',async()=>{\n const f=fixture();f.controller.host.pauseReason=()=> 'Pause image playback to update nearby places.';f.busy=true;f.controller.setEnabled(true);assert.equal(f.statuses.at(-1).reason,'Pause image playback to update nearby places.');f.busy=false;f.view.stationary=false;f.controller.sync();assert.equal(f.statuses.at(-1).reason,'Stop moving the map to load nearby places.');f.view.stationary=true;f.controller.sync();assert.equal(f.statuses.at(-1).reason,'Preparing nearby places\u2026');await f.advance();assert.equal(f.calls.length,1);await f.complete();f.controller.dispose();\n});\n"
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
const prefix = 'places-startup-v6-37-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.37 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-startup-v6-37' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.37 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.37 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.37 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-startup-v6-37.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places startup v6.37 is already installed. No files changed.');
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
  const manifest = { installer: 'places-startup-v6-37', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places startup v6.37 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
