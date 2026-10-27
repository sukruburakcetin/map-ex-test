#!/usr/bin/env node
'use strict';
/**
 * Places selection v6.45. Compatible current v6 sources.
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
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\nimport { fetchCoverageRoads } from \"../features/coverage/fetchCoverageRoads\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { choosePlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { SelectedPlaceCard } from '../components/SelectedPlaceCard';\nimport { PlacesPanel } from \"../components/PlacesPanel\";\nimport { PLACE_GROUPS, Place, PlaceGroup, placesServiceUrl } from \"../features/places/placesModel\";\nimport { PlacesState } from \"../features/places/PlacesController\";\nimport { fetchCoverageRoads } from \"../features/coverage/fetchCoverageRoads\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "  placesActive: boolean;\n  placesPanelOpen: boolean;\n  placesGroup: PlaceGroup;\n  placesStatus: PlacesState;\n  jimuMapView: JimuMapView | null;\n  imageId: string | null;\n  sequenceId: string | null;\n  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];\n",
              "after": "  placesActive: boolean;\n  placesPanelOpen: boolean;\n  placesGroup: PlaceGroup;\n  placesStatus: PlacesState;\n  selectedPlace: Place | null;\n  placesShowLink: boolean;\n  jimuMapView: JimuMapView | null;\n  imageId: string | null;\n  sequenceId: string | null;\n  sequenceImages: { id: string; lat: number; lon: number; captured_at?: number }[];\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n      this._places?.dispose(); this._places = null; this._placesView = null; this._placesUrl = ''; return;\n    }\n    if (this._places && this._placesUrl !== url) { this._places.dispose(); this._places = null; }\n    if (this._places && this._placesView !== view) { this._placesView = view; this._places.rebindView(); }\n    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: (place, radius, signal) => this.explorePlace(place, radius, signal), openImagery: image => { void this.openPlaceImagery(image); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n  private togglePlaces = () => {\n    if (!this.state.placesActive && (!this.state.jimuMapView?.view?.ready || !this.ArcGISModules?.FeatureLayer)) { this.showToast('The map is preparing. Try Places again shortly.', 3500); return; }\n    this.setState(previous => ({ placesActive: !previous.placesActive, placesPanelOpen: !previous.placesActive }), this.syncPlaces);\n  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null> {\n",
              "after": "  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n      this._places?.dispose(); this._places = null; this._placesView = null; this._placesUrl = '';\n      if (this.state.selectedPlace) this.setState({ selectedPlace: null, placesShowLink: false });\n      return;\n    }\n    if (this._places && this._placesUrl !== url) { this._places.dispose(); this._places = null; this.setState({ selectedPlace: null, placesShowLink: false }); }\n    if (this._places && this._placesView !== view) { this._placesView = view; this._places.rebindView(); }\n    if (!this._places && this.ArcGISModules?.FeatureLayer) {\n      this._placesView = view; this._placesUrl = url;\n      this._places = new ArcGISPlaces({ id: String(this.props.id), url, modules: this.ArcGISModules,\n        view: () => this.state.jimuMapView?.view, geographic: extent => webMercatorUtils.webMercatorToGeographic(extent),\n        selected: selectedPlace => {\n          this.setState({ selectedPlace, ...(!selectedPlace ? { placesShowLink: false } : {}) });\n          const frame = this._liveSequenceFrames.current;\n          if (selectedPlace && frame) this._places?.selection.updateCamera(frame.lon, frame.lat);\n        }, busy: this.placesBusy, pauseReason: this.placesPauseReason, status: placesStatus => this.setState({ placesStatus }), explore: (place, radius, signal) => this.explorePlace(place, radius, signal), openImagery: image => { void this.openPlaceImagery(image); } });\n      this._places.controller.setGroup(this.state.placesGroup); this._places.controller.setEnabled(true);\n    }\n    this._places?.controller.sync();\n  };\n  private togglePlaces = () => {\n    if (!this.state.placesActive && (!this.state.jimuMapView?.view?.ready || !this.ArcGISModules?.FeatureLayer)) { this.showToast('The map is preparing. Try Places again shortly.', 3500); return; }\n    this.setState(previous => ({ placesActive: !previous.placesActive, placesPanelOpen: !previous.placesActive, ...(previous.placesActive ? { selectedPlace: null, placesShowLink: false } : {}) }), this.syncPlaces);\n  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private showPlacesHit(results: any[], targetId?: string | null): boolean { return !!this._places?.open(results, targetId); }\n  private async explorePlace(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null> {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 4",
              "before": "    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },\n    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],\n    filtersLoaded: false,\n    showIntro: true,\n    placesActive: false, placesPanelOpen: false, placesGroup: 'all', placesStatus: { kind: 'off', count: 0 },\n    hasTimeTravel: false,\n    showMinimap: true,\n    detectionsActive: false,\n    showAiTags: true,\n",
              "after": "    objectsFilterValue: { value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null },\n    objectsOptions: [{ value: DEFAULT_FILTER_LABELS.OBJECTS, label: DEFAULT_FILTER_LABELS.OBJECTS, iconUrl: null }],\n    filtersLoaded: false,\n    showIntro: true,\n    placesActive: false, placesPanelOpen: false, placesGroup: 'all', placesStatus: { kind: 'off', count: 0 }, selectedPlace: null, placesShowLink: false,\n    hasTimeTravel: false,\n    showMinimap: true,\n    detectionsActive: false,\n    showAiTags: true,\n"
            },
            {
              "label": "src/runtime/widget.tsx block 5",
              "before": "        return;\n      }\n      if (!newImg || this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(newImg)) return;\n      const frame = newImg;\n      this._sequencePerformance?.playbackFrame(!this._userPaused, typeof document === 'undefined' || document.visibilityState === 'visible');\n      this._reverseGeocodeAbort?.abort();\n      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n",
              "after": "        return;\n      }\n      if (!newImg || this.mapillaryViewer !== profileEventViewer || this.state.jimuMapView?.view !== view || !this._liveSequenceFrames.isCurrent(newImg)) return;\n      const frame = newImg;\n      this._places?.selection.updateCamera(frame.lon, frame.lat);\n      this._sequencePerformance?.playbackFrame(!this._userPaused, typeof document === 'undefined' || document.visibilityState === 'visible');\n      this._reverseGeocodeAbort?.abort();\n      const didLateralJump = this.state.sequenceId !== frame.sequenceId;\n      if (didLateralJump) {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 6",
              "before": "      this.setState({\n        imageId: null,\n        sequenceId: null,\n        sequenceImages: [],\n        placesActive: false, placesPanelOpen: false,\n        lon: null,\n        lat: null,\n        isFullscreen: false,\n        address: null,\n",
              "after": "      this.setState({\n        imageId: null,\n        sequenceId: null,\n        sequenceImages: [],\n        placesActive: false, placesPanelOpen: false, selectedPlace: null, placesShowLink: false,\n        lon: null,\n        lat: null,\n        isFullscreen: false,\n        address: null,\n"
            },
            {
              "label": "src/runtime/widget.tsx block 7",
              "before": "          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel group={this.state.placesGroup} status={this.state.placesStatus}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {/* Splash Screen */}\n        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />\n\n",
              "after": "          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel group={this.state.placesGroup} status={this.state.placesStatus}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />\n\n"
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
              "before": "import { PlaceImagery, placeImageryDirectionLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n",
              "after": "import { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\nconst FIELDS = ['gers_id', 'place_name', 'category', 'place_group', 'confidence', 'address', 'website', 'data_release'];\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 2",
              "before": "  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n  private popupContent: HTMLDivElement | null = null;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n",
              "after": "  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n  private popupView: any = null;\n  private popupContent: HTMLDivElement | null = null;\n  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n  constructor(private host: {\n    id: string; url: string; modules: any; view(): any; geographic(extent: any): any;\n    selected?(place: Place | null): void; busy(): boolean; pauseReason?(): string; status(state: PlacesState): void; explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery | null>; openImagery(image: PlaceImagery): void;\n  }) {\n    const url = placesServiceUrl(host.url);\n    if (!url) throw new Error('Invalid Places service URL');\n    this.selection = new SelectedPlace({ id: host.id, modules: host.modules, view: host.view, changed: host.selected });\n    this.controller = new PlacesController({\n      view: () => this.snapshot(), busy: host.busy, pauseReason: host.pauseReason,\n      query: async (bbox, group, signal) => {\n        if (!this.service) this.service = new host.modules.FeatureLayer({ url, outFields: FIELDS, popupEnabled: false });\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 3",
              "before": "    this.handles.forEach(handle => handle.remove()); this.handles = [];\n    const view = this.host.view();\n    if (view) this.handles.push(view.watch(['stationary', 'zoom', 'extent'], () => this.controller.sync()));\n  }\n  rebindView(): void { this.clear(); this.watchView(); this.controller.sync(); }\n  private visibility = () => this.controller.sync();\n  private snapshot(): PlacesView | null {\n    const view = this.host.view();\n    if (!view?.map || view.destroyed || !view.ready) return null;\n",
              "after": "    this.handles.forEach(handle => handle.remove()); this.handles = [];\n    const view = this.host.view();\n    if (view) this.handles.push(view.watch(['stationary', 'zoom', 'extent'], () => this.controller.sync()));\n  }\n  rebindView(): void { this.clear(); this.selection.rebind(); this.watchView(); this.controller.sync(); }\n  private visibility = () => this.controller.sync();\n  private snapshot(): PlacesView | null {\n    const view = this.host.view();\n    if (!view?.map || view.destroyed || !view.ready) return null;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 4",
              "before": "    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    // Opening already-loaded details is local work and remains available while imagery loads.\n    if (this.disposed || !this.graphics?.visible || !this.records.size || this.ownerView !== this.host.view() || this.ownerView?.destroyed) return null;\n    for (const hit of results) if ((hit.layer || hit.graphic?.layer) === this.graphics) {\n      const place = this.records.get(hit.graphic?.attributes?.place_id); if (place) return place;\n",
              "after": "    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) return selected;\n    // Opening already-loaded details is local work and remains available while imagery loads.\n    if (this.disposed || !this.graphics?.visible || !this.records.size || this.ownerView !== this.host.view() || this.ownerView?.destroyed) return null;\n    for (const hit of results) if ((hit.layer || hit.graphic?.layer) === this.graphics) {\n      const place = this.records.get(hit.graphic?.attributes?.place_id); if (place) return place;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 5",
              "before": "    return null;\n  }\n  /** Capture only the visible marker footprint, without another SDK hit test or request. */\n  screenTarget(screen: { x: number; y: number }): string | null {\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = 6 * 6;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n",
              "after": "    return null;\n  }\n  /** Capture only the visible marker footprint, without another SDK hit test or request. */\n  screenTarget(screen: { x: number; y: number }): string | null {\n    const selected = this.selection.screenTarget(screen); if (selected) return selected;\n    const view = this.host.view();\n    if (this.disposed || !this.graphics?.visible || this.ownerView !== view || view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    let nearest: string | null = null, distance = 6 * 6;\n    for (const graphic of this.graphics.graphics?.toArray?.() || []) {\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 6",
              "before": "  }\n  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const place = (valid && targetId ? this.records.get(targetId) : null) || this.hit(results);\n    if (!place || !view) return false;\n    const content = document.createElement('div');\n    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);\n    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }\n    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }\n    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.cssText = 'font-size:11px;line-height:1.4'; content.appendChild(status);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.ownerView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n      if (candidate) { this.host.openImagery(candidate); return; }\n      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;\n",
              "after": "  }\n  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    this.selection.select(place);\n    const content = document.createElement('div');\n    const name = document.createElement('strong'); name.textContent = place.name; content.appendChild(name);\n    for (const text of [place.category.replace(/_/g, ' '), place.address]) if (text) { const line = document.createElement('p'); line.textContent = text; content.appendChild(line); }\n    if (place.website) { const link = document.createElement('a'); link.textContent = 'Website'; link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }\n    this.searchAbort?.abort(); this.searchAbort = null;\n    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Find imagery within 75 m'; button.style.cssText = 'display:block;margin-top:10px;padding:7px 9px;cursor:pointer'; content.appendChild(button);\n    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.cssText = 'font-size:11px;line-height:1.4'; content.appendChild(status);\n    let radius = 75, candidate: PlaceImagery | null = null;\n    const active = () => this.popupContent === content && this.popupView === view && !view.destroyed && view.popup?.content === content;\n    button.onclick = async () => {\n      if (!active() || button.disabled) return;\n      if (candidate) { this.host.openImagery(candidate); return; }\n      const controller = new AbortController(); this.searchAbort?.abort(); this.searchAbort = controller;\n"
            },
            {
              "label": "src/features/places/ArcGISPlaces.ts block 7",
              "before": "        if (this.searchAbort === controller) this.searchAbort = null;\n      }\n    };\n    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' \u00b7 ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.style.fontSize = '11px'; content.appendChild(source);\n    this.popupContent = content;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  private clear(): void {\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.ownerView?.destroyed && this.popupContent && this.ownerView?.popup?.content === this.popupContent) this.ownerView.closePopup();\n    this.popupContent = null;\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n    this.records.clear(); this.ownerView = null;\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null;\n  }\n}\n",
              "after": "        if (this.searchAbort === controller) this.searchAbort = null;\n      }\n    };\n    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' \u00b7 ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.style.fontSize = '11px'; content.appendChild(source);\n    this.popupContent = content; this.popupView = view;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  clearSelection(): void { this.selection.clear(); this.closeDetails(); }\n  private closeDetails(): void {\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n    this.popupContent = null; this.popupView = null;\n  }\n  private clear(): void {\n    this.closeDetails();\n    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n    this.records.clear(); this.ownerView = null;\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.controller.dispose(); this.selection.dispose(); this.handles.forEach(h => h.remove()); this.handles = [];\n    document.removeEventListener('visibilitychange', this.visibility);\n    this.service?.destroy(); this.service = null;\n  }\n}\n"
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
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport type { PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} places in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';\nimport type { PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places\u2026', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} places in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>\u00d7</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n"
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
              "before": " const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:17,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n",
              "after": " const oldDocument=global.document,oldWindow=global.window;global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n class FeatureLayer{constructor(){serviceCount++;this.fields=['gers_id','place_name','category','place_group','confidence','address','website','data_release'].map(name=>({name}));}async load(){}async queryFeatures(q){query=q;return{features:[row(1,{place_name:'<img onerror=evil()>',website:'javascript:evil()'})]};}destroy(){}}\n class GraphicsLayer{constructor(p){Object.assign(this,{visible:true},p);}removeAll(){this.items=[];}addMany(xs){this.items=xs;this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}\n class Value{constructor(p){Object.assign(this,p);}}\n const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},explore:async(p,radius)=>{explored=p;return {id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius};},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:17,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Open imagery \u00b7 about 32 m away');await searchButton.onclick();assert.equal(openedImage.id,'img-1');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\ntest('idle scheduling has a deadline and retains cancellation without bypassing foreground gates',()=>{\n const {ArcGISPlaces}=load('ArcGISPlaces');const oldWindow=global.window,oldDocument=global.document;let captured,cancelled;\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": " await nearby.facePlaceInPanorama(viewer,image,()=>false);assert.equal(reads,1);\n let resolve;viewer.getImage=()=>new Promise(r=>resolve=r);let current=true;const pending=nearby.facePlaceInPanorama(viewer,image,()=>current);current=false;resolve({id:'pano',isPano:true,compassAngle:0,originalLngLat:{lng:0,lat:0}});assert.equal(await pending,null);assert.equal(centered,null);\n viewer.getImage=async()=>({id:'different',isPano:true,compassAngle:0});assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);\n});\n",
              "after": " await nearby.facePlaceInPanorama(viewer,image,()=>false);assert.equal(reads,1);\n let resolve;viewer.getImage=()=>new Promise(r=>resolve=r);let current=true;const pending=nearby.facePlaceInPanorama(viewer,image,()=>current);current=false;resolve({id:'pano',isPano:true,compassAngle:0,originalLngLat:{lng:0,lat:0}});assert.equal(await pending,null);assert.equal(centered,null);\n viewer.getImage=async()=>({id:'different',isPano:true,compassAngle:0});assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);\n});\ntest('persistent selection reuses its ring/link and survives base viewport refresh without network work',()=>{\n const {SelectedPlace}=load('SelectedPlace');const layers=[],changes=[];let created=0;\n class Layer{constructor(p){Object.assign(this,p);this.items=[];}addMany(g){this.items.push(...g);}destroy(){this.destroyed=true;}}\n class Graphic{constructor(p){created++;Object.assign(this,p);}}\n class Point{constructor(p){Object.assign(this,p);}}\n const makeView=()=>({ready:true,destroyed:false,toScreen:()=>({x:10,y:10}),map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)}});let view=makeView();\n const selection=new SelectedPlace({id:'test',modules:{GraphicsLayer:Layer,Graphic,Point},view:()=>view,changed:p=>changes.push(p)});\n assert.equal(layers.length,0);selection.updateCamera(1,2);assert.equal(created,0);const place={id:'p',lon:1.01,lat:2.01,name:'Museum'};selection.select(place);const layer=layers[0],ring=layer.items[0];assert.equal(created,1);selection.setLink(true);const line=layer.items[1];assert.equal(created,2);assert.deepEqual(line.geometry.paths,[[[1,2],[1.01,2.01]]]);selection.updateCamera(1.001,2.001);assert.equal(created,2);assert.equal(layer.items[0],ring);assert.equal(layer.items[1],line);assert.equal(selection.screenTarget({x:10,y:10}),'p');assert.equal(selection.screenTarget({x:18,y:10}),null);assert.equal(selection.hit([{layer,graphic:ring}]),place);assert.equal(selection.hit([{layer,graphic:line}]),null);\n selection.setLink(false);assert.equal(line.visible,false);const geometry=line.geometry;selection.updateCamera(2,3);assert.equal(line.geometry,geometry);selection.setLink(true);assert.deepEqual(line.geometry.paths,[[[2,3],[1.01,2.01]]]);\n view=makeView();selection.rebind();assert.equal(layer.destroyed,true);assert.equal(layers.length,1);assert.equal(selection.place,place);selection.clear();assert.equal(layers.length,0);assert.equal(selection.place,null);assert.equal(changes.at(-1),null);selection.dispose();\n});\n"
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
              "before": "\nBefore production rollout, measure the same AOI with Places off/on on a representative phone and desktop: click-to-image, hover latency, playback stalls, request count and memory during sustained browsing in 2D/3D. Test sharing/authentication, source attribution, empty areas, service errors, limited results and switching map views. These measurements are necessary to quantify real deployment overhead.\n\nReferences: [Overture Places](https://docs.overturemaps.org/guides/places/), [getting data](https://docs.overturemaps.org/getting-data/), [attribution](https://docs.overturemaps.org/attribution/).\n",
              "after": "\nBefore production rollout, measure the same AOI with Places off/on on a representative phone and desktop: click-to-image, hover latency, playback stalls, request count and memory during sustained browsing in 2D/3D. Test sharing/authentication, source attribution, empty areas, service errors, limited results and switching map views. These measurements are necessary to quantify real deployment overhead.\n\nReferences: [Overture Places](https://docs.overturemaps.org/guides/places/), [getting data](https://docs.overturemaps.org/getting-data/), [attribution](https://docs.overturemaps.org/attribution/).\n\n\n## Persistent place selection (v6.45)\n\nClicking a place keeps one selection ring and a compact name/category card after the details popup closes, including when imagery opens. The card is integrated into the filters while those are open and remains as a separate compact card when they close. Click the name to reopen details; Clear removes the selection and its owned popup/search. The selection survives viewport queries, zooming out below the normal Places density threshold, and a direct 2D/3D view rebind. Turning Places off, changing its service URL, or choosing a category that excludes it clears selection. No local-storage persistence is added.\n\n**Show camera link** is optional and starts off. It connects the current loaded camera coordinate to the selected place with one dashed line. It is a spatial relationship, not a route, sightline analysis or evidence that the place is visible. The line updates only from existing image events; one retained line is reused. Neither selecting a place nor drawing the link adds a query, timer or animation loop. Selection retains one place outside the viewport's 200-record page and one ring plus at most one link graphic. Changing to a new active map transfers this tiny overlay and removes the old layer.\n\nOverture's [Places guide](https://docs.overturemaps.org/guides/places/) and [place schema](https://docs.overturemaps.org/schema/reference/places/place/) document category taxonomy/basic categories for map iconography, not an official icon asset pack. This integration keeps its existing dots. A local SVG symbol set could later map those categories without remote icon requests; such icons would be application styling, not Overture-supplied data.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/SelectedPlace.ts",
      "content": "import type { Place } from './placesModel';\n/** One selection ring and an optional camera link; no queries, watches or animation. */\nexport class SelectedPlace {\n  place: Place | null = null;\n  private layer: any = null;\n  private view: any = null;\n  private ring: any = null;\n  private line: any = null;\n  private camera: [number, number] | null = null;\n  private link = false;\n  constructor(private host: { id: string; modules: any; view(): any; changed?(place: Place | null): void }) {}\n  select(place: Place): void {\n    this.place = place; this.render(); this.host.changed?.(place);\n  }\n  setLink(visible: boolean): void { if (this.link === visible) return; this.link = visible; this.renderLink(); }\n  updateCamera(lon: number, lat: number): void {\n    if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 90) return;\n    if (this.camera?.[0] === lon && this.camera?.[1] === lat) return;\n    this.camera = [lon, lat]; if (this.link && this.place) this.renderLink();\n  }\n  hit(results: any[]): Place | null {\n    if (!this.place || !this.layer || this.view !== this.host.view() || this.view?.destroyed) return null;\n    return results.some(hit => (hit.layer || hit.graphic?.layer) === this.layer && hit.graphic === this.ring) ? this.place : null;\n  }\n  screenTarget(screen: { x: number; y: number }): string | null {\n    if (!this.place || !this.ring || this.view !== this.host.view() || this.view?.destroyed || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return null;\n    const point = this.view.toScreen(this.ring.geometry);\n    return point && Number.isFinite(point.x) && Number.isFinite(point.y) && (point.x - screen.x) ** 2 + (point.y - screen.y) ** 2 <= 49 ? this.place.id : null;\n  }\n  rebind(): void { this.removeLayer(); this.render(); }\n  clear(notify = true): void { this.place = null; this.link = false; this.removeLayer(); if (notify) this.host.changed?.(null); }\n  dispose(): void { this.clear(false); this.camera = null; }\n  private render(): void {\n    const view = this.host.view(), place = this.place;\n    if (!place || !view?.map || view.destroyed || !view.ready) return;\n    if (this.view !== view || !this.layer) {\n      this.removeLayer(); this.view = view;\n      this.layer = new this.host.modules.GraphicsLayer({ id: `overture-selection-${this.host.id}`, title: 'Selected place', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      this.view.map.add(this.layer);\n    }\n    const geometry = new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });\n    if (this.ring) this.ring.geometry = geometry;\n    else {\n      this.ring = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-marker', style: 'circle', size: 11, color: [0, 0, 0, 0], outline: { color: '#ffe4a3', width: 2 } }, attributes: { place_id: place.id } });\n      this.layer.addMany([this.ring]);\n    }\n    this.ring.attributes = { place_id: place.id };\n    this.renderLink();\n  }\n  private renderLink(): void {\n    if (!this.layer || !this.place) return;\n    if (!this.link || !this.camera) { if (this.line) this.line.visible = false; return; }\n    const geometry = { type: 'polyline', paths: [[this.camera, [this.place.lon, this.place.lat]]], spatialReference: { wkid: 4326 } };\n    if (this.line) { this.line.geometry = geometry; this.line.visible = true; }\n    else { this.line = new this.host.modules.Graphic({ geometry, symbol: { type: 'simple-line', color: [255, 228, 163, .8], width: 1.25, style: 'dash' } }); this.layer.addMany([this.line]); }\n  }\n  private removeLayer(): void {\n    if (this.layer) { if (!this.view?.destroyed) this.view?.map?.remove(this.layer); if (!this.layer.destroyed) this.layer.destroy(); }\n    this.layer = null; this.view = null; this.ring = null; this.line = null;\n  }\n}\n"
    },
    {
      "file": "src/components/SelectedPlaceCard.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '2px solid #ffe4a3', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>\u00d7</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} \u00b7 <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type=\"checkbox\" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/>Show camera link</label>\n</div>;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => <section aria-label=\"Selected place\" style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>;\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-selection-v6-45-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.45 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-selection-v6-45' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.45 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.45 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.45 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-selection-v6-45.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places selection v6.45 is already installed. No files changed.');
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
  const manifest = { installer: 'places-selection-v6-45', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places selection v6.45 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
