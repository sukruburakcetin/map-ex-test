#!/usr/bin/env node
'use strict';
/**
 * Places list v6.48. Compatible current v6 sources.
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
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "  placesGroup: PlaceGroup;\n  placesStatus: PlacesState;\n  selectedPlace: Place | null;\n  placesShowLink: boolean;\n  jimuMapView: JimuMapView | null;\n  imageId: string | null;\n  sequenceId: string | null;\n  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];\n",
              "after": "  placesGroup: PlaceGroup;\n  placesStatus: PlacesState;\n  selectedPlace: Place | null;\n  placesShowLink: boolean;\n  placesList: readonly Place[];\n  placesCameraDistance: string | null;\n  jimuMapView: JimuMapView | null;\n  imageId: string | null;\n  sequenceId: string | null;\n  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n      this._places?.dispose(); this._places = null; this._placesView = null; this._placesUrl = '';\n      if (this.state.selectedPlace) this.setState({ selectedPlace: null, placesShowLink: false });\n      return;\n    }\n    if (this._places && this._placesUrl !== url) { this._places.dispose(); this._places = null; this.setState({ selectedPlace: null, placesShowLink: false }); }\n    if (this._places && this._placesView !== view) { this._placesView = view; this._places.rebindView(); }\n    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        selected: selectedPlace => {\n          this.setState({ selectedPlace, ...(!selectedPlace ? { placesShowLink: false } : {}) });\n          const frame = this._liveSequenceFrames.current;\n          if (selectedPlace && frame) this._places?.selection.updateCamera(frame.lon, frame.lat);\n        }, busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: (place, radius, signal) => this.explorePlace(place, radius, signal), openImagery: image => { void this.openPlaceImagery(image); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n  private togglePlaces = () => {\n    if (!this.state.placesActive && (!this.state.jimuMapView?.view?.ready || !this.ArcGISModules?.FeatureLayer)) { this.showToast('The map is preparing. Try Places again shortly.', 3500); return; }\n    this.setState(previous => ({ placesActive: !previous.placesActive, placesPanelOpen: !previous.placesActive, ...(previous.placesActive ? { selectedPlace: null, placesShowLink: false } : {}) }), this.syncPlaces);\n  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n",
              "after": "    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n      this._places?.dispose(); this._places = null; this._placesView = null; this._placesUrl = '';\n      if (this.state.selectedPlace || this.state.placesList?.length) this.setState({ selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null });\n      return;\n    }\n    if (this._places && this._placesUrl !== url) { this._places.dispose(); this._places = null; this.setState({ selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null }); }\n    if (this._places && this._placesView !== view) { this._placesView = view; this._places.rebindView(); }\n    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        list: placesList => this.setState({ placesList }),\n        selected: selectedPlace => {\n          const frame = this._liveSequenceFrames.current;\n          const placesCameraDistance = selectedPlace && frame ? placeCameraDistanceLabel(distanceMeters(frame.lat, frame.lon, selectedPlace.lat, selectedPlace.lon)) : null;\n          this.setState({ selectedPlace, placesCameraDistance, ...(!selectedPlace ? { placesShowLink: false } : {}) });\n          if (selectedPlace && frame) this._places?.selection.updateCamera(frame.lon, frame.lat);\n        }, busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: (place, radius, signal) => this.explorePlace(place, radius, signal), openImagery: image => { void this.openPlaceImagery(image); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n  private togglePlaces = () => {\n    if (!this.state.placesActive && (!this.state.jimuMapView?.view?.ready || !this.ArcGISModules?.FeatureLayer)) { this.showToast('The map is preparing. Try Places again shortly.', 3500); return; }\n    this.setState(previous => ({ placesActive: !previous.placesActive, placesPanelOpen: !previous.placesActive, ...(previous.placesActive ? { selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null } : {}) }), this.syncPlaces);\n  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n    if (!place) return;\n    const label = placeCameraDistanceLabel(distanceMeters(lat, lon, place.lat, place.lon));\n    if (label !== this.state.placesCameraDistance) this.setState({ placesCameraDistance: label });\n  }\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null> {\n    const view = this.state.jimuMapView?.view;\n    if (!view || view.destroyed || signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n"
            },
            {
              "label": "src/runtime/widget.tsx block 4",
              "before": "    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },\n    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],\n    filtersLoaded: false,\n    showIntro: true,\n    placesActive: false, placesPanelOpen: false, placesGroup: 'all', placesStatus: { kind: 'off', count: 0 }, selectedPlace: null, placesShowLink: false,\n    hasTimeTravel: false,\n    showMinimap: true,\n    detectionsActive: false,\n    showAiTags: true,\n",
              "after": "    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },\n    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],\n    filtersLoaded: false,\n    showIntro: true,\n    placesActive: false, placesPanelOpen: false, placesGroup: 'all', placesStatus: { kind: 'off', count: 0 }, selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null,\n    hasTimeTravel: false,\n    showMinimap: true,\n    detectionsActive: false,\n    showAiTags: true,\n"
            },
            {
              "label": "src/runtime/widget.tsx block 5",
              "before": "        return;\n      }\n      if (!newImg || this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(newImg)) return;\n      const frame = newImg;\n      this._places?.selection.updateCamera(frame.lon, frame.lat);\n      this._sequencePerformance?.playbackFrame(!this._userPaused, typeof document === 'undefined' || document.visibilityState === 'visible');\n      this._reverseGeocodeAbort?.abort();\n      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n",
              "after": "        return;\n      }\n      if (!newImg || this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(newImg)) return;\n      const frame = newImg;\n      if (this._places) this.updatePlacesCamera(frame.lon, frame.lat);\n      this._sequencePerformance?.playbackFrame(!this._userPaused, typeof document === 'undefined' || document.visibilityState === 'visible');\n      this._reverseGeocodeAbort?.abort();\n      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 6",
              "before": "      this.setState({\n        imageId: null,\n        sequenceId: null,\n        sequenceImages: [],\n        placesActive: false, placesPanelOpen: false, selectedPlace: null, placesShowLink: false,\n        lon: null,\n        lat: null,\n        isFullscreen: false,\n        address: null,\n",
              "after": "      this.setState({\n        imageId: null,\n        sequenceId: null,\n        sequenceImages: [],\n        placesActive: false, placesPanelOpen: false, selectedPlace: null, placesShowLink: false, placesList: [], placesCameraDistance: null,\n        lon: null,\n        lat: null,\n        isFullscreen: false,\n        address: null,\n"
            },
            {
              "label": "src/runtime/widget.tsx block 7",
              "before": "            });\n          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel group={this.state.placesGroup} status={this.state.placesStatus}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n",
              "after": "            });\n          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id)}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink} cameraDistance={this.state.placesCameraDistance}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n"
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
              "before": "  private service: any = null;\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private iconSymbols = new Map<string, any>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n",
              "after": "  private service: any = null;\n  private graphics: any = null;\n  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n  private listVisible = true;\n  private iconSymbols = new Map<string, any>();\n  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    selected?(place: Place | null): void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n",
              "after": "  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    list?(places: readonly Place[]): void; selected?(place: Place | null): void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "          throw error;\n        }\n      },\n      display: (places, view) => this.display(places, view),\n      visible: visible => { if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible; },\n      clear: () => this.clear(), status: host.status,\n      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),\n      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work, { timeout: 1500 }) } : { idle: false, id: setTimeout(work, 0) },\n      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),\n",
              "after": "          throw error;\n        }\n      },\n      display: (places, view) => this.display(places, view),\n      visible: visible => {\n        if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible;\n        if (this.listVisible !== visible) { this.listVisible = visible; this.host.list?.(visible ? this.listedPlaces : []); }\n      },\n      clear: () => this.clear(), status: host.status,\n      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),\n      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work, { timeout: 1500 }) } : { idle: false, id: setTimeout(work, 0) },\n      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 4",
              "before": "      return graphic;\n    });\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) return selected;\n",
              "after": "      return graphic;\n    });\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n    this.listedPlaces = places; if (this.listVisible) this.host.list?.(places);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) return selected;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 5",
              "before": "    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n    this.records.clear(); this.ownerView = null;\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n",
              "after": "    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n    this.records.clear(); this.ownerView = null;\n    if (this.listedPlaces.length) { this.listedPlaces = []; if (!this.disposed) this.host.list?.([]); }\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n"
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
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';\nimport type { PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} places in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>\n  </section>;\n};\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';\nimport { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>\n  </section>;\n};\n"
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
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <img src={placeCategoryIcon(props.place.group, true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>\u00d7</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} \u00b7 <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type=\"checkbox\" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/>Show camera link</label>\n</div>;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => <section aria-label=\"Selected place\" style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>;\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <img src={placeCategoryIcon(props.place.group, true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>\u00d7</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} \u00b7 <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n  <div title=\"Approximate straight-line distance, not walking distance or visibility\" style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{props.cameraDistance || 'Open an image for camera distance'}</div>\n  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type=\"checkbox\" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/>Show camera link</label>\n</div>;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => <section aria-label=\"Selected place\" style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>;\n"
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
              "before": "const src=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['placesPauseReason','placesBusy','syncPlaces','togglePlaces','setPlacesGroup'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');\ntest('widget default-off path never constructs an ArcGIS service or optional owner',()=>{let owners=0;const Runtime=new Function('ArcGISPlaces','placesServiceUrl','PLACE_GROUPS','webMercatorUtils',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(class{constructor(){owners++;}},model.placesServiceUrl,model.PLACE_GROUPS,{});const w=new Runtime();w.props={config:{enablePlaces:true,placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,jimuMapView:{view:{ready:true}}};w.ArcGISModules={get FeatureLayer(){throw Error('must not load a service while off');}};for(let i=0;i<100;i++)w.syncPlaces();assert.equal(owners,0);});\ntest('ArcGIS adapter owns only bounded graphics, escapes popup content and removes its own resources',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,openedImage=null,removed=0,busy=false;const layers=[],ui=[];\n const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},remove(){}});\n const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n",
              "after": "const src=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');\nconst methods=['placesPauseReason','placesBusy','syncPlaces','togglePlaces','setPlacesGroup'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');\ntest('widget default-off path never constructs an ArcGIS service or optional owner',()=>{let owners=0;const Runtime=new Function('ArcGISPlaces','placesServiceUrl','PLACE_GROUPS','webMercatorUtils',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(class{constructor(){owners++;}},model.placesServiceUrl,model.PLACE_GROUPS,{});const w=new Runtime();w.props={config:{enablePlaces:true,placesServiceUrl:'https://host/FeatureServer/0'}};w.state={placesActive:false,jimuMapView:{view:{ready:true}}};w.ArcGISModules={get FeatureLayer(){throw Error('must not load a service while off');}};for(let i=0;i<100;i++)w.syncPlaces();assert.equal(owners,0);});\ntest('ArcGIS adapter owns only bounded graphics, escapes popup content and removes its own resources',async()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');let serviceCount=0,query=null,explored=null,openedImage=null,removed=0,busy=false,listed=[];const layers=[],ui=[];\n const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},remove(){}});\n const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " for(const url of [...urls,icons.placeCategoryIcon(undefined),icons.placeCategoryIcon('parks',true)]){assert(url.startsWith('data:image/svg+xml;'));const svg=decodeURIComponent(url.split(',')[1]);assert(svg.startsWith('<svg'));assert(!/<script|<image|<foreignObject|href=|url\\(/i.test(svg));}\n assert.equal(icons.placeCategoryIcon('<script>evil</script>'),icons.placeCategoryIcon(undefined));assert.equal(icons.placeCategoryIcon('__proto__'),icons.placeCategoryIcon(undefined));assert.equal(icons.placeCategoryIcon('constructor'),icons.placeCategoryIcon(undefined));\n assert.equal(icons.placeCategorySymbol('parks').width,12);assert.equal(icons.placeCategorySymbol('parks',true).width,21);assert(icons.SELECTED_PLACE_ICON_RADIUS>icons.PLACE_ICON_RADIUS);\n});\n",
              "after": " for(const url of [...urls,icons.placeCategoryIcon(undefined),icons.placeCategoryIcon('parks',true)]){assert(url.startsWith('data:image/svg+xml;'));const svg=decodeURIComponent(url.split(',')[1]);assert(svg.startsWith('<svg'));assert(!/<script|<image|<foreignObject|href=|url\\(/i.test(svg));}\n assert.equal(icons.placeCategoryIcon('<script>evil</script>'),icons.placeCategoryIcon(undefined));assert.equal(icons.placeCategoryIcon('__proto__'),icons.placeCategoryIcon(undefined));assert.equal(icons.placeCategoryIcon('constructor'),icons.placeCategoryIcon(undefined));\n assert.equal(icons.placeCategorySymbol('parks').width,12);assert.equal(icons.placeCategorySymbol('parks',true).width,21);assert(icons.SELECTED_PLACE_ICON_RADIUS>icons.PLACE_ICON_RADIUS);\n});\ntest('loaded-list filtering is local, bounded, deterministic and does not mutate cached records',()=>{\n const utils=load('placeListUtils'),records=[{id:'b',name:'Zoo',category:'public_park'},{id:'a',name:'Museum',category:'art_museum'},{id:'c',name:'Museum',category:'library'}];const before=JSON.stringify(records);assert.deepEqual(utils.filterLoadedPlaces(records,' MUSEUM ').map(p=>p.id),['a','c']);assert.deepEqual(utils.filterLoadedPlaces(records,'public park').map(p=>p.id),['b']);assert.equal(utils.filterLoadedPlaces(records,'missing').length,0);assert.equal(JSON.stringify(records),before);assert.equal(utils.filterLoadedPlaces(Array.from({length:300},(_,i)=>({id:String(i),name:'Place '+i,category:'park'})),'').length,200);assert.equal(utils.PLACE_LIST_PAGE_SIZE,4);\n for(const [metres,label] of [[0,'Under 1 m from camera'],[42.3,'42 m from camera'],[1234,'1.2 km from camera'],[NaN,null],[-1,null],[Infinity,null]])assert.equal(utils.placeCameraDistanceLabel(metres),label);\n});\ntest('camera-distance hook reads only loaded coordinates and avoids repeated state updates for unchanged labels',()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='updatePlacesCamera').getText(sf),utils=load('placeListUtils');const Runtime=new Function('placeCameraDistanceLabel','distanceMeters',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(utils.placeCameraDistanceLabel,distance);const w=new Runtime();let writes=0,cameraUpdates=0;w.state={selectedPlace:{lat:0,lon:0},placesCameraDistance:null};w._places={selection:{updateCamera(){cameraUpdates++;}}};w.setState=p=>{writes++;Object.assign(w.state,p);};Object.defineProperty(w,'fetchMapillaryJson',{get(){throw Error('distance must not request metadata');}});w.updatePlacesCamera(0,.0004);assert.equal(w.state.placesCameraDistance,'44 m from camera');for(let i=0;i<50;i++)w.updatePlacesCamera(0,.0004);assert.equal(writes,1);assert.equal(cameraUpdates,51);w.updatePlacesCamera(0,.0005);assert.equal(writes,2);w.state.selectedPlace=null;w.updatePlacesCamera(0,.0006);assert.equal(writes,2);\n});\n"
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
              "before": "\n## Camera link contrast (v6.47)\n\nThe optional camera link now uses cyan dashes (the existing 1.25 pt width/dash style) over a thin dark solid underlay (2.5 pt). Both strokes reuse their graphics on image changes and toggle off together. The selected badge stays above the strokes. This adds just one underlay Graphic while the link is used, with no extra network, timer or animation work. The overlay budget is now one selected badge plus two link strokes; a camera link still does not assert visibility or routing.\n",
              "after": "\n## Camera link contrast (v6.47)\n\nThe optional camera link now uses cyan dashes (the existing 1.25 pt width/dash style) over a thin dark solid underlay (2.5 pt). Both strokes reuse their graphics on image changes and toggle off together. The selected badge stays above the strokes. This adds just one underlay Graphic while the link is used, with no extra network, timer or animation work. The overlay budget is now one selected badge plus two link strokes; a camera link still does not assert visibility or routing.\n\n\n## Loaded places list and camera distance (v6.48)\n\n**Browse places** is collapsed initially. It shows only the already-loaded map results, sorted alphabetically. Local search matches name/category; paging renders four rows at a time rather than 200 DOM rows. Selecting a row uses the existing selection/details path and does not fetch more places or open imagery automatically. Limited results remain labelled by the existing 200-record message. The panel scrolls within its available height on short viewers. Below the Places zoom threshold or after clearing a viewport/category, the list is cleared/hidden along with normal points; a persistent selected place may remain independently.\n\nThe selected-place summary shows the approximate straight-line distance to the current loaded image's camera coordinate. Both the integrated filter summary and compact selected card show it. Existing image events update the label; there is no metadata request, timer or polling. Equal formatted distances do not cause another label-state update. Without a loaded camera position the card says to open an image. Distance is not walking distance and does not establish visibility. The list reuses references to the bounded loaded records rather than duplicating records or introducing another query/cache.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/placeListUtils.ts",
      "content": "import type { Place } from './placesModel';\nexport const PLACE_LIST_PAGE_SIZE = 4;\n/** The adapter already caps records at 200; never search outside those loaded records. */\nexport function filterLoadedPlaces(places: readonly Place[], query: string): Place[] {\n  const term = query.trim().toLocaleLowerCase();\n  return places.slice(0, 200).filter(place => !term || `${place.name} ${place.category.replace(/_/g, ' ')}`.toLocaleLowerCase().includes(term))\n    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));\n}\nexport function placeCameraDistanceLabel(metres: number): string | null {\n  if (!Number.isFinite(metres) || metres < 0) return null;\n  if (metres < 1) return 'Under 1 m from camera';\n  return metres < 1000 ? `${Math.round(metres)} m from camera` : `${(metres / 1000).toFixed(1)} km from camera`;\n}\n"
    },
    {
      "file": "src/components/LoadedPlacesList.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE } from '../features/places/placeListUtils';\nexport const LoadedPlacesList: React.FC<{ places: readonly Place[]; selectedId?: string; onSelect(id: string): void }> = props => {\n  const [open, setOpen] = React.useState(false), [query, setQuery] = React.useState(''), [page, setPage] = React.useState(0);\n  const matches = React.useMemo(() => filterLoadedPlaces(props.places, query), [props.places, query]);\n  const pages = Math.max(1, Math.ceil(matches.length / PLACE_LIST_PAGE_SIZE)), current = Math.min(page, pages - 1);\n  React.useEffect(() => { setPage(0); }, [props.places]);\n  return <div style={{ borderTop: '1px solid #61846e55', paddingTop: 6, marginBottom: 6 }}>\n    <button type=\"button\" aria-expanded={open} onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', border: 0, background: 'none', color: 'inherit', padding: '3px 0', fontSize: 11, cursor: 'pointer' }}><span>Browse places ({props.places.length})</span><span aria-hidden=\"true\">{open ? '\u25b4' : '\u25be'}</span></button>\n    {open && <div>\n      <input type=\"search\" aria-label=\"Find a loaded place\" placeholder=\"Find a loaded place\" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} style={{ boxSizing: 'border-box', width: '100%', margin: '5px 0', minHeight: 28, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#213c2e', color: 'inherit', fontSize: 11 }}/>\n      <div role=\"group\" aria-label=\"Loaded places\">\n        {matches.slice(current * PLACE_LIST_PAGE_SIZE, (current + 1) * PLACE_LIST_PAGE_SIZE).map(place => <button type=\"button\" key={place.id} aria-pressed={place.id === props.selectedId} title={place.name} onClick={() => props.onSelect(place.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 34, padding: '4px 3px', border: 0, borderBottom: '1px solid #61846e33', background: place.id === props.selectedId ? '#496047' : 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>\n          <img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{ flexShrink: 0 }}/><span style={{ minWidth: 0 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{place.name}</span><span style={{ display: 'block', fontSize: 9, opacity: .75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.category.replace(/_/g, ' ')}</span></span>\n        </button>)}\n        {!matches.length && <p style={{ fontSize: 10, lineHeight: 1.4 }}>{query ? 'No loaded places match this search.' : 'No places loaded here yet.'}</p>}\n      </div>\n      {pages > 1 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, fontSize: 10 }}><button type=\"button\" aria-label=\"Previous places\" disabled={current === 0} onClick={() => setPage(current - 1)}>\u2039</button><span>{current + 1} / {pages}</span><button type=\"button\" aria-label=\"Next places\" disabled={current + 1 >= pages} onClick={() => setPage(current + 1)}>\u203a</button></div>}\n      <p style={{ margin: '5px 0 0', fontSize: 9, opacity: .75 }}>Loaded map results only.</p>\n    </div>}\n  </div>;\n};\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-list-v6-48-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.48 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-list-v6-48' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.48 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.48 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.48 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-list-v6-48.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places list v6.48 is already installed. No files changed.');
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
  const manifest = { installer: 'places-list-v6-48', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places list v6.48 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
