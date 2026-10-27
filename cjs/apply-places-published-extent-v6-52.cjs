#!/usr/bin/env node
'use strict';
/**
 * Places published extent v6.52. Compatible current v6 sources.
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
              "before": "import { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryCaptureLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\nexport class ArcGISPlaces {\n  private service: any = null;\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n",
              "after": "import { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryCaptureLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, PlaceBbox, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n/** The service FeatureLayer is query-only; only bounded local Graphics reach the map. */\nexport class ArcGISPlaces {\n  private service: any = null;\n  private published: PlaceBbox | null = null;\n  get coverageExtent(): PlaceBbox | null { return this.published; }\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n        const service = this.service;\n        try {\n          await service.load({ signal });\n          if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n          if (!FIELDS.every(name => service.fields.some((field: any) => field.name === name))) throw new Error('Places service schema mismatch');\n          const where = `confidence >= 0.95${group === 'all' ? '' : ` AND place_group = '${group}'`}`;\n          const page = await service.queryFeatures({ where, geometry: { type: 'extent', xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3], spatialReference: { wkid: 4326 } },\n            spatialRelationship: 'intersects', outFields: FIELDS, returnGeometry: true, outSpatialReference: { wkid: 4326 }, num: PLACES_LIMITS.maxFeatures,\n            ...(service.capabilities?.query?.supportsOrderBy === false ? {} : { orderByFields: ['confidence DESC', 'gers_id ASC'] }) }, { signal });\n          return { features: (page.features || []).slice(0, PLACES_LIMITS.maxFeatures), limited: !!page.exceededTransferLimit || page.features?.length >= PLACES_LIMITS.maxFeatures };\n        } catch (error) {\n          if (service.loadStatus === 'failed' && this.service === service) { this.service = null; service.destroy(); }\n          throw error;\n        }\n      },\n      display: (places, view) => this.display(places, view),\n",
              "after": "    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), extent: () => this.published, busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n        const service = this.service;\n        try {\n          await service.load({ signal });\n          if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n          if (!FIELDS.every(name => service.fields.some((field: any) => field.name === name))) throw new Error('Places service schema mismatch');\n          this.published = publishedPlacesExtent(service.fullExtent, host.geographic);\n          if (outsidePublishedExtent(bbox, this.published)) return { features: [], limited: false, outside: true };\n          const where = `confidence >= 0.95${group === 'all' ? '' : ` AND place_group = '${group}'`}`;\n          const page = await service.queryFeatures({ where, geometry: { type: 'extent', xmin: bbox[0], ymin: bbox[1], xmax: bbox[2], ymax: bbox[3], spatialReference: { wkid: 4326 } },\n            spatialRelationship: 'intersects', outFields: FIELDS, returnGeometry: true, outSpatialReference: { wkid: 4326 }, num: PLACES_LIMITS.maxFeatures,\n            ...(service.capabilities?.query?.supportsOrderBy === false ? {} : { orderByFields: ['confidence DESC', 'gers_id ASC'] }) }, { signal });\n          return { features: (page.features || []).slice(0, PLACES_LIMITS.maxFeatures), limited: !!page.exceededTransferLimit || page.features?.length >= PLACES_LIMITS.maxFeatures };\n        } catch (error) {\n          if (service.loadStatus === 'failed' && this.service === service) { this.service = null; this.published = null; service.destroy(); }\n          throw error;\n        }\n      },\n      display: (places, view) => this.display(places, view),\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null; this.iconSymbols.clear();\n  }\n}\n",
              "after": "  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null; this.published = null; this.iconSymbols.clear();\n  }\n}\n"
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
              "before": "import { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';\nexport interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }\nexport interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error'; count: number; limited?: boolean; reason?: string; }\nexport interface PlacesHost {\n  view(): PlacesView | null;\n  busy(): boolean;\n  pauseReason?(): string;\n  query(bbox: PlaceBbox, group: PlaceGroup, signal: AbortSignal): Promise<{ features: any[]; limited: boolean }>;\n  display(places: Place[], view: object): void;\n  visible(value: boolean): void;\n  clear(): void;\n  status(value: PlacesState): void;\n",
              "after": "import { outsidePublishedExtent } from './publishedPlacesExtent';\nimport { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';\nexport interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }\nexport interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error' | 'outside'; count: number; limited?: boolean; reason?: string; }\nexport interface PlacesHost {\n  view(): PlacesView | null;\n  busy(): boolean;\n  pauseReason?(): string;\n  extent?(): PlaceBbox | null;\n  query(bbox: PlaceBbox, group: PlaceGroup, signal: AbortSignal): Promise<{ features: any[]; limited: boolean; outside?: boolean }>;\n  display(places: Place[], view: object): void;\n  visible(value: boolean): void;\n  clear(): void;\n  status(value: PlacesState): void;\n"
            },
            {
              "label": "src/features/places/PlacesController.ts block 2",
              "before": "  retry(): void { if (this.disposed || !this.enabled) return; this.desired = ''; this.invalidate(); this.sync(); }\n  sync(): void {\n    if (this.disposed || !this.enabled) return;\n    const view = this.host.view();\n    if (!view?.bbox || view.zoom + .0001 < PLACES_LIMITS.minZoom) {\n      this.invalidate(); this.desired = ''; this.host.visible(false); this.status({ kind: 'zoom', count: 0 }); return;\n    }\n    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }\n",
              "after": "  retry(): void { if (this.disposed || !this.enabled) return; this.desired = ''; this.invalidate(); this.sync(); }\n  sync(): void {\n    if (this.disposed || !this.enabled) return;\n    const view = this.host.view();\n    if (view?.bbox && outsidePublishedExtent(view.bbox, this.host.extent?.())) {\n      this.invalidate(); this.desired = ''; this.host.visible(false); this.status({ kind: 'outside', count: 0 }); return;\n    }\n    if (!view?.bbox || view.zoom + .0001 < PLACES_LIMITS.minZoom) {\n      this.invalidate(); this.desired = ''; this.host.visible(false); this.status({ kind: 'zoom', count: 0 }); return;\n    }\n    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }\n"
            },
            {
              "label": "src/features/places/PlacesController.ts block 3",
              "before": "    const task = (async () => {\n      try {\n        const page = await this.host.query(bbox, this.group, controller.signal);\n        if (controller.signal.aborted || !this.current(revision, token)) return;\n        const places = normalizePlaces(page.features, bbox, this.group);\n        const bytes = placesBytes(places);\n        if (bytes <= PLACES_LIMITS.cacheBytes) {\n          const prior = this.cache.get(key); if (prior) { this.bytes -= prior.bytes; this.cache.delete(key); }\n",
              "after": "    const task = (async () => {\n      try {\n        const page = await this.host.query(bbox, this.group, controller.signal);\n        if (controller.signal.aborted || !this.current(revision, token)) return;\n        if (page.outside) { this.host.visible(false); this.status({ kind: 'outside', count: 0 }); return; }\n        const places = normalizePlaces(page.features, bbox, this.group);\n        const bytes = placesBytes(places);\n        if (bytes <= PLACES_LIMITS.cacheBytes) {\n          const prior = this.cache.get(key); if (prior) { this.bytes -= prior.bytes; this.cache.delete(key); }\n"
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
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n",
              "after": "  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private goToPlacesArea = () => {\n    const view = this.state.jimuMapView?.view, bounds = this._places?.coverageExtent;\n    if (!view?.ready || view.destroyed || !bounds || !this.ArcGISModules?.Point) return;\n    const [west, south, east, north] = paddedPlacesExtent(bounds);\n    const Point = this.ArcGISModules.Point;\n    this.navigateMapView(view, { target: [new Point({ longitude: west, latitude: south, spatialReference: { wkid: 4326 } }), new Point({ longitude: east, latitude: north, spatialReference: { wkid: 4326 } })] }, { animate: false });\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "            });\n          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id)}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n",
              "after": "            });\n          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel onGoToArea={this.goToPlacesArea} group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id)}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n"
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
              "before": "import { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';\nimport { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>\n  </section>;\n",
              "after": "import { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';\nimport { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { outside: 'Outside this layer\u2019s published Places area.', off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}>Go to covered area</button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>\n  </section>;\n"
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
              "before": " const place={lon:0,lat:0},row=(id,metres,heading,captured_at)=>({id,sequence:'seq',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,captured_at});\n const choices=nearby.rankPlaceImagery(place,[row('away',5,180),row('a',25,0,1704067200000),row('a',25,0,1704067200000),row('b',30,0,0),row('c',35,0,Infinity),row('d',40,0,1704067200000)],75,distance);\n assert.deepEqual(choices.map(p=>p.id),['a','b','c']);assert.equal(choices[0].capturedAt,1704067200000);assert.match(nearby.placeImageryCaptureLabel(choices[0]),/2024/);assert.equal(nearby.placeImageryCaptureLabel(choices[1]),'Capture date unknown');assert.equal(nearby.placeImageryCaptureLabel(choices[2]),'Capture date unknown');assert.equal(nearby.rankPlaceImagery(place,[],75,distance).length,0);\n});\n",
              "after": " const place={lon:0,lat:0},row=(id,metres,heading,captured_at)=>({id,sequence:'seq',geometry:{coordinates:[0,-metres/111195]},compass_angle:heading,captured_at});\n const choices=nearby.rankPlaceImagery(place,[row('away',5,180),row('a',25,0,1704067200000),row('a',25,0,1704067200000),row('b',30,0,0),row('c',35,0,Infinity),row('d',40,0,1704067200000)],75,distance);\n assert.deepEqual(choices.map(p=>p.id),['a','b','c']);assert.equal(choices[0].capturedAt,1704067200000);assert.match(nearby.placeImageryCaptureLabel(choices[0]),/2024/);assert.equal(nearby.placeImageryCaptureLabel(choices[1]),'Capture date unknown');assert.equal(nearby.placeImageryCaptureLabel(choices[2]),'Capture date unknown');assert.equal(nearby.rankPlaceImagery(place,[],75,distance).length,0);\n});\nconst extentUtils=load('publishedPlacesExtent');\ntest('published extent validation distinguishes outside, overlap and unknown metadata',()=>{\n const box=extentUtils.publishedPlacesExtent({xmin:1,ymin:2,xmax:3,ymax:4,spatialReference:{wkid:4326}},()=>{throw Error('no projection needed')});assert.deepEqual(box,[1,2,3,4]);assert.equal(extentUtils.outsidePublishedExtent([4,2,5,3],box),true);assert.equal(extentUtils.outsidePublishedExtent([3,3,5,5],box),false);assert.equal(extentUtils.outsidePublishedExtent([2,3,5,6],box),false);assert.equal(extentUtils.outsidePublishedExtent([4,2,5,3],null),false);assert.equal(extentUtils.publishedPlacesExtent(null,x=>x),null);assert.equal(extentUtils.publishedPlacesExtent({xmin:5,ymin:2,xmax:3,ymax:4,spatialReference:{wkid:4326}},x=>x),null);assert.equal(extentUtils.publishedPlacesExtent({spatialReference:{wkid:9999}},x=>x),null);assert.deepEqual(extentUtils.publishedPlacesExtent({spatialReference:{wkid:3857}},()=>({xmin:1,ymin:2,xmax:3,ymax:4})),box);const padded=extentUtils.paddedPlacesExtent([1,2,1,2]);assert(padded[0]<1&&padded[2]>1&&padded[1]<2&&padded[3]>2);\n});\ntest('known outside extent schedules no queries and returning inside resumes normal loading',async()=>{\n const f=fixture();f.controller.host.extent=()=>[10,10,11,11];f.controller.setEnabled(true);assert.equal(f.statuses.at(-1).kind,'outside');assert.equal(f.pending(),0);await f.advance();assert.equal(f.calls.length,0);f.view={...f.view,bbox:[10,10,11,11]};f.controller.sync();await f.advance();assert.equal(f.calls.length,1);await f.complete([]);assert.equal(f.statuses.at(-1).kind,'ready');f.view={...f.view,bbox:[0,0,1,1]};f.controller.sync();assert.equal(f.visible,false);assert.equal(f.statuses.at(-1).kind,'outside');f.controller.dispose();\n});\ntest('leaving the published extent aborts in-flight work and suppresses stale display',async()=>{\n const f=fixture();f.controller.host.extent=()=>[0,0,1,1];f.controller.setEnabled(true);await f.advance();f.view={...f.view,bbox:[10,10,11,11]};f.controller.sync();assert(f.calls[0].signal.aborted);await f.complete();assert.equal(f.displays.length,0);assert.equal(f.statuses.at(-1).kind,'outside');assert.equal(f.pending(),0);f.controller.dispose();\n});\ntest('first metadata load outside the service extent skips feature querying and subsequent panning needs no metadata request',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;global.document={addEventListener(){},removeEventListener(){}};global.window={};let loads=0,queries=0,last;\n class FeatureLayer{constructor(){this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));this.fullExtent={xmin:10,ymin:10,xmax:11,ymax:11,spatialReference:{wkid:4326}};}async load(){loads++;}async queryFeatures(){queries++;throw Error('outside should not query');}destroy(){}}\n const view={ready:true,map:{},stationary:true,zoom:16,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},watch(){return{remove(){}}}};\n const owner=new ArcGISPlaces({id:'extent',url:'https://host/FeatureServer/0',modules:{FeatureLayer},view:()=>view,busy:()=>false,geographic:x=>x,status:s=>last=s,explore:async()=>[],openImagery(){}});\n try{owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));assert.equal(last.kind,'outside');assert.deepEqual(owner.coverageExtent,[10,10,11,11]);assert.equal(loads,1);assert.equal(queries,0);for(let i=0;i<20;i++)owner.controller.sync();assert.equal(loads,1);assert.equal(queries,0);}finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('covered-area button handler navigates only on explicit action using existing Point constructors',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToPlacesArea').getText(sf);const Runtime=new Function('paddedPlacesExtent',compile('class Runtime{'+member+'}\\nreturn Runtime;'))(extentUtils.paddedPlacesExtent);const w=new Runtime(),view={ready:true,destroyed:false};let calls=0;w.state={jimuMapView:{view}};w._places={coverageExtent:[10,20,11,21]};w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p);}}};w.navigateMapView=(actual,target,options)=>{calls++;assert.equal(actual,view);assert.equal(target.target.length,2);assert(target.target[0].longitude<10&&target.target[1].longitude>11);assert.equal(options.animate,false);};assert.equal(calls,0);w.goToPlacesArea();assert.equal(calls,1);view.destroyed=true;w.goToPlacesArea();assert.equal(calls,1);\n});\n"
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
              "before": "\n## Neutral imagery buttons (v6.51)\n\nRemoves the v6.50 popup shell, Calcite token, content, category, link and footer theme. Only the imagery buttons are styled: neutral light backgrounds, subtle borders, compact full-width layout, hover/disabled states and keyboard focus. The SDK's normal popup header/content appearance is restored. Refresh and reopen the popup so an already-open v6.50 DOM stylesheet is replaced.\n",
              "after": "\n## Neutral imagery buttons (v6.51)\n\nRemoves the v6.50 popup shell, Calcite token, content, category, link and footer theme. Only the imagery buttons are styled: neutral light backgrounds, subtle borders, compact full-width layout, hover/disabled states and keyboard focus. The SDK's normal popup header/content appearance is restored. Refresh and reopen the popup so an already-open v6.50 DOM stylesheet is replaced.\n\n\n## Published extent feedback (v6.52)\n\nThe query-only service's normal first eligible load provides `fullExtent`. A wholly non-overlapping viewport then shows Outside this layer\u2019s published Places area and an explicit Go to covered area button. That first outside load skips querying features; later outside pans use the retained metadata without querying or reloading it. No metadata request is added while Places is off or waiting below the normal zoom threshold. If metadata has not loaded yet, ordinary zoom/idle instructions remain.\n\nThe button fits padded extent corners through the existing guarded map navigation path and never navigates automatically. A large extent may fit below zoom 15; the existing zoom-closer instruction then applies. Normal POI markers/list are hidden outside, while a selected place may persist. Returning inside resumes the existing cache/query flow. Metadata errors retain normal error handling; missing, unsupported or invalid extents do not invent an outside classification. Geographic and Web Mercator metadata are supported.\n\n`fullExtent` is the layer's bounding envelope, not the export AOI polygon or guaranteed complete coverage. Partial overlap, touching edges, holes between points and category-empty areas remain normal queries/zero results. Metadata can be stale after republishing; reload the app after updating the hosted dataset. No per-pan extent query or secondary feature-count query is introduced.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/publishedPlacesExtent.ts",
      "content": "import type { PlaceBbox } from './placesModel';\n/** Service fullExtent is a bounding envelope, not a polygon or a completeness guarantee. */\nexport function publishedPlacesExtent(extent: any, geographic: (extent: any) => any): PlaceBbox | null {\n  try {\n    if (!extent) return null;\n    const sr = extent.spatialReference;\n    if (sr?.isWebMercator || [3857, 102100, 102113].includes(sr?.wkid)) extent = geographic(extent);\n    else if (!sr?.isGeographic && sr?.wkid !== 4326 && sr?.latestWkid !== 4326) return null;\n    const bbox: PlaceBbox = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];\n    return bbox.every(Number.isFinite) && bbox[0] >= -180 && bbox[2] <= 180 && bbox[1] >= -90 && bbox[3] <= 90 && bbox[0] <= bbox[2] && bbox[1] <= bbox[3] ? bbox : null;\n  } catch { return null; }\n}\nexport function outsidePublishedExtent(view: PlaceBbox, published: PlaceBbox | null | undefined): boolean {\n  return !!published && (view[2] < published[0] || view[0] > published[2] || view[3] < published[1] || view[1] > published[3]);\n}\nexport function paddedPlacesExtent(bounds: PlaceBbox): PlaceBbox {\n  const dx = Math.max(.001, (bounds[2] - bounds[0]) * .05), dy = Math.max(.001, (bounds[3] - bounds[1]) * .05);\n  return [Math.max(-180, bounds[0] - dx), Math.max(-85, bounds[1] - dy), Math.min(180, bounds[2] + dx), Math.min(85, bounds[3] + dy)];\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-published-extent-v6-52-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.52 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-published-extent-v6-52' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.52 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.52 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.52 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-published-extent-v6-52.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places published extent v6.52 is already installed. No files changed.');
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
  const manifest = { installer: 'places-published-extent-v6-52', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places published extent v6.52 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
