#!/usr/bin/env node
'use strict';
/**
 * Places loaded category filters v6.57. Compatible current v6 sources.
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
      "file": "src/features/places/PlacesController.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "loaded categories 1",
              "before": "import { outsidePublishedExtent } from './publishedPlacesExtent';\nimport { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';\nexport interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }\nexport interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error' | 'outside'; count: number; limited?: boolean; reason?: string; }\nexport interface PlacesHost {\n  view(): PlacesView | null;\n  busy(): boolean;\n  pauseReason?(): string;\n",
              "after": "import { outsidePublishedExtent } from './publishedPlacesExtent';\nimport { Place, PlaceBbox, PlaceGroup, PLACE_GROUPS, PLACES_LIMITS, normalizePlaces, placesBytes } from './placesModel';\nexport interface PlacesView { token: object; bbox: PlaceBbox | null; zoom: number; stationary: boolean; }\nexport interface PlacesState { kind: 'off' | 'paused' | 'zoom' | 'loading' | 'ready' | 'error' | 'outside'; count: number; limited?: boolean; reason?: string; loadedCounts?: Partial<Record<PlaceGroup, number>>; }\nexport interface PlacesHost {\n  view(): PlacesView | null;\n  busy(): boolean;\n  pauseReason?(): string;\n"
            },
            {
              "label": "loaded categories 2",
              "before": "  private group: PlaceGroup = 'all';\n  private revision = 0;\n  private desired = '';\n  private displayedView: object | null = null;\n  private pendingTimer: any = null;\n  private pendingIdle: any = null;\n  private physical: Promise<void> | null = null;\n  private abort: AbortController | null = null;\n",
              "after": "  private group: PlaceGroup = 'all';\n  private revision = 0;\n  private desired = '';\n  private displayedView: object | null = null;\n  private requestedView: object | null = null;\n  private pendingTimer: any = null;\n  private pendingIdle: any = null;\n  private physical: Promise<void> | null = null;\n  private abort: AbortController | null = null;\n"
            },
            {
              "label": "loaded categories 3",
              "before": "  get stats() { return { cacheBytes: this.bytes, entries: this.cache.size, active: !!this.physical, enabled: this.enabled }; }\n  setEnabled(enabled: boolean): void {\n    if (this.disposed || this.enabled === enabled) return;\n    this.enabled = enabled; this.invalidate(); this.desired = '';\n    if (!enabled) { this.host.clear(); this.cache.clear(); this.bytes = 0; this.displayedView = null; this.status({ kind: 'off', count: 0 }); }\n    else this.sync();\n  }\n  setGroup(group: PlaceGroup): void {\n    if (this.disposed || !PLACE_GROUPS.includes(group) || this.group === group) return;\n    this.group = group; this.desired = ''; this.invalidate(); this.host.clear(); this.sync();\n  }\n  retry(): void { if (this.disposed || !this.enabled) return; this.desired = ''; this.invalidate(); this.sync(); }\n  sync(): void {\n    if (this.disposed || !this.enabled) return;\n",
              "after": "  get stats() { return { cacheBytes: this.bytes, entries: this.cache.size, active: !!this.physical, enabled: this.enabled }; }\n  setEnabled(enabled: boolean): void {\n    if (this.disposed || this.enabled === enabled) return;\n    this.enabled = enabled; this.invalidate(); this.desired = '';\n    if (!enabled) { this.host.clear(); this.cache.clear(); this.bytes = 0; this.displayedView = null; this.requestedView = null; this.status({ kind: 'off', count: 0 }); }\n    else this.sync();\n  }\n  setGroup(group: PlaceGroup): void {\n    if (this.disposed || !PLACE_GROUPS.includes(group) || this.group === group) return;\n    this.group = group;\n    if (this.enabled) {\n      const view = this.host.view(), cached = this.cache.get(this.desired);\n      if (view?.bbox && view.zoom + .0001 >= PLACES_LIMITS.minZoom && this.desired === JSON.stringify(view.bbox.map(n => n.toFixed(6))) && view.token === this.displayedView && cached && view.stationary && !this.host.busy()) { this.show(cached.places, view.token, cached.limited); return; }\n      this.sync();\n    }\n  }\n  retry(): void { if (this.disposed || !this.enabled) return; this.desired = ''; this.invalidate(); this.sync(); }\n  sync(): void {\n    if (this.disposed || !this.enabled) return;\n"
            },
            {
              "label": "loaded categories 4",
              "before": "    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }\n    this.host.visible(true);\n    if (this.host.busy() || !view.stationary) { this.invalidate(); this.desired = ''; this.status({ kind: 'paused', count: 0, reason: this.host.busy() ? this.host.pauseReason?.() || 'Places will update when browsing pauses.' : 'Stop moving the map to load nearby places.' }); return; }\n    const bbox = view.bbox;\n    const key = JSON.stringify([this.group, ...bbox.map(n => n.toFixed(6))]);\n    if (this.desired === key) return;\n    this.invalidate(); this.desired = key;\n    const cached = this.cache.get(key);\n    if (cached && this.host.now() - cached.at <= PLACES_LIMITS.cacheTtlMs) {\n      this.cache.delete(key); this.cache.set(key, cached); this.displayedView = view.token;\n      this.host.display(cached.places, view.token); this.status({ kind: 'ready', count: cached.places.length, limited: cached.limited }); return;\n    }\n    const revision = this.revision, token = view.token;\n    this.status({ kind: 'paused', count: 0, reason: 'Preparing nearby places…' });\n    this.pendingTimer = this.host.timer(() => {\n",
              "after": "    if (this.displayedView && this.displayedView !== view.token) { this.invalidate(); this.desired = ''; this.host.clear(); this.displayedView = null; }\n    this.host.visible(true);\n    if (this.host.busy() || !view.stationary) { this.invalidate(); this.desired = ''; this.status({ kind: 'paused', count: 0, reason: this.host.busy() ? this.host.pauseReason?.() || 'Places will update when browsing pauses.' : 'Stop moving the map to load nearby places.' }); return; }\n    const bbox = view.bbox;\n    const key = JSON.stringify([...bbox.map(n => n.toFixed(6))]);\n    if (this.desired === key && this.requestedView === view.token) return;\n    this.invalidate(); this.desired = key; this.requestedView = view.token;\n    const cached = this.cache.get(key);\n    if (cached && this.host.now() - cached.at <= PLACES_LIMITS.cacheTtlMs) {\n      this.cache.delete(key); this.cache.set(key, cached); this.displayedView = view.token;\n      this.show(cached.places, view.token, cached.limited); return;\n    }\n    const revision = this.revision, token = view.token;\n    this.status({ kind: 'paused', count: 0, reason: 'Preparing nearby places…' });\n    this.pendingTimer = this.host.timer(() => {\n"
            },
            {
              "label": "loaded categories 5",
              "before": "    this.status({ kind: 'loading', count: 0 });\n    const timeout = this.host.timer(() => { if (this.current(revision, token)) this.status({ kind: 'error', count: 0 }); controller.abort(); }, PLACES_LIMITS.timeoutMs);\n    const task = (async () => {\n      try {\n        const page = await this.host.query(bbox, this.group, controller.signal);\n        if (controller.signal.aborted || !this.current(revision, token)) return;\n        if (page.outside) { this.host.visible(false); this.status({ kind: 'outside', count: 0 }); return; }\n        const places = normalizePlaces(page.features, bbox, this.group);\n        const bytes = placesBytes(places);\n        if (bytes <= PLACES_LIMITS.cacheBytes) {\n          const prior = this.cache.get(key); if (prior) { this.bytes -= prior.bytes; this.cache.delete(key); }\n          while (this.cache.size && (this.bytes + bytes > PLACES_LIMITS.cacheBytes || this.cache.size >= PLACES_LIMITS.cacheEntries)) {\n            const first = this.cache.keys().next().value as string; this.bytes -= this.cache.get(first)!.bytes; this.cache.delete(first);\n          }\n          this.cache.set(key, { places, limited: page.limited, bytes, at: this.host.now() }); this.bytes += bytes;\n        }\n        this.displayedView = token; this.host.display(places, token);\n        this.status({ kind: 'ready', count: places.length, limited: page.limited });\n      } catch (error) {\n        if (!controller.signal.aborted && this.current(revision, token)) this.status({ kind: 'error', count: 0 });\n      } finally { this.host.cancelTimer(timeout); }\n    })();\n",
              "after": "    this.status({ kind: 'loading', count: 0 });\n    const timeout = this.host.timer(() => { if (this.current(revision, token)) this.status({ kind: 'error', count: 0 }); controller.abort(); }, PLACES_LIMITS.timeoutMs);\n    const task = (async () => {\n      try {\n        const page = await this.host.query(bbox, 'all', controller.signal);\n        if (controller.signal.aborted || !this.current(revision, token)) return;\n        if (page.outside) { this.host.visible(false); this.status({ kind: 'outside', count: 0 }); return; }\n        const places = normalizePlaces(page.features, bbox, 'all');\n        const bytes = placesBytes(places);\n        if (bytes <= PLACES_LIMITS.cacheBytes) {\n          const prior = this.cache.get(key); if (prior) { this.bytes -= prior.bytes; this.cache.delete(key); }\n          while (this.cache.size && (this.bytes + bytes > PLACES_LIMITS.cacheBytes || this.cache.size >= PLACES_LIMITS.cacheEntries)) {\n            const first = this.cache.keys().next().value as string; this.bytes -= this.cache.get(first)!.bytes; this.cache.delete(first);\n          }\n          this.cache.set(key, { places, limited: page.limited, bytes, at: this.host.now() }); this.bytes += bytes;\n        }\n        this.displayedView = token; this.show(places, token, page.limited);\n      } catch (error) {\n        if (!controller.signal.aborted && this.current(revision, token)) this.status({ kind: 'error', count: 0 });\n      } finally { this.host.cancelTimer(timeout); }\n    })();\n"
            },
            {
              "label": "loaded categories 6",
              "before": "      // A superseding view/filter may have waited for an abort-ignoring transport.\n      if (!this.disposed && this.enabled && revision !== this.revision) { this.desired = ''; this.sync(); }\n    });\n  }\n  private status(value: PlacesState): void { const key = JSON.stringify(value); if (key !== this.lastStatus) { this.lastStatus = key; this.host.status(value); } }\n  private invalidate(): void {\n    ++this.revision;\n    if (this.pendingTimer !== null) this.host.cancelTimer(this.pendingTimer);\n",
              "after": "      // A superseding view/filter may have waited for an abort-ignoring transport.\n      if (!this.disposed && this.enabled && revision !== this.revision) { this.desired = ''; this.sync(); }\n    });\n  }\n  private show(places: Place[], token: object, limited: boolean): void {\n    const loadedCounts: Partial<Record<PlaceGroup, number>> = { all: places.length };\n    for (const group of PLACE_GROUPS) if (group !== 'all') loadedCounts[group] = 0;\n    for (const place of places) loadedCounts[place.group as PlaceGroup] = (loadedCounts[place.group as PlaceGroup] || 0) + 1;\n    const filtered = this.group === 'all' ? places : places.filter(place => place.group === this.group);\n    this.host.display(filtered, token);\n    this.status({ kind: 'ready', count: filtered.length, limited, loadedCounts });\n  }\n  private status(value: PlacesState): void { const key = JSON.stringify(value); if (key !== this.lastStatus) { this.lastStatus = key; this.host.status(value); } }\n  private invalidate(): void {\n    ++this.revision;\n    if (this.pendingTimer !== null) this.host.cancelTimer(this.pendingTimer);\n"
            },
            {
              "label": "loaded categories 7",
              "before": "    this.abort?.abort(); this.abort = null;\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.invalidate(); this.enabled = false; this.cache.clear(); this.bytes = 0; this.displayedView = null; this.host.clear();\n  }\n}\n",
              "after": "    this.abort?.abort(); this.abort = null;\n  }\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true; this.invalidate(); this.enabled = false; this.cache.clear(); this.bytes = 0; this.displayedView = null; this.requestedView = null; this.host.clear();\n  }\n}\n"
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
              "label": "loaded categories 1",
              "before": "import { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { outside: 'Outside this layer’s published Places area.', off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places…', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}\n    </select></label>\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}>Go to covered area</button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n",
              "after": "import { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { outside: 'Outside this layer’s published Places area.', off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places…', ready: props.status.limited ? `${props.status.count} matching loaded places.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };\n  const categories = [['all', 'All'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Sights'], ['services', 'Services']] as const;\n  const counts = props.status.kind === 'ready' ? props.status.loadedCounts : undefined;\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    <div role=\"group\" aria-label=\"Filter loaded places\" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>\n      {categories.slice(0, 3).map(([value, label]) => <button key={value} type=\"button\" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '4px 2px', font: 'inherit', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}>{label}{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}\n    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}>More categories</span><select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}>Counts are for loaded places{props.status.limited ? ' · zoom closer for more' : ''}.</div>}\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}>Go to covered area</button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n"
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
              "label": "loaded categories 1",
              "before": "  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    savePlaceCategory(() => window.localStorage, this.placesPreferenceKey(), placesGroup);\n    if (placesGroup !== 'all' && this.state.selectedPlace?.group !== placesGroup) this._places?.clearSelection();\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private goToPlacesArea = () => {\n    const view = this.state.jimuMapView?.view, bounds = this._places?.coverageExtent;\n",
              "after": "  };\n  private setPlacesGroup = (placesGroup: PlaceGroup) => {\n    if (!PLACE_GROUPS.includes(placesGroup)) return;\n    savePlaceCategory(() => window.localStorage, this.placesPreferenceKey(), placesGroup);\n    this.setState({ placesGroup }, () => this._places?.controller.setGroup(placesGroup));\n  };\n  private goToPlacesArea = () => {\n    const view = this.state.jimuMapView?.view, bounds = this._places?.coverageExtent;\n"
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
              "label": "loaded categories 1",
              "before": "test('imagery/playback busy gate prevents starting requests until idle',async()=>{const f=fixture();f.busy=true;f.controller.setEnabled(true);await f.advance();assert.equal(f.calls.length,0);f.busy=false;f.controller.sync();await f.advance();assert.equal(f.calls.length,1);await f.complete();assert.equal(f.displays.length,1);});\ntest('repeated stationary notifications coalesce and do not restart the same query',async()=>{const f=fixture();f.controller.setEnabled(true);for(let i=0;i<50;i++)f.controller.sync();await f.advance();assert.equal(f.calls.length,1);await f.complete();f.controller.sync();await f.advance();assert.equal(f.calls.length,1);});\ntest('foreground activity aborts optional work and stale responses cannot replace displayed data',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();const old=f.calls[0];f.busy=true;f.controller.sync();assert(old.signal.aborted);await f.complete();assert.equal(f.displays.length,0);assert.equal(f.statuses.at(-1).kind,'paused');});\ntest('an abort-ignoring transport retains the physical slot while newer work waits',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.view={...f.view,bbox:[0,0,2,1]};f.controller.sync();await f.advance();assert.equal(f.calls.length,1);assert(f.calls[0].signal.aborted);await f.complete();await f.advance();assert.equal(f.calls.length,2);assert.equal(f.displays.length,0);await f.complete();assert.equal(f.displays.length,1);});\ntest('view changes and category changes invalidate pending results',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.view={...f.view,token:{}};f.controller.setGroup('health');await f.complete();await f.advance();assert.equal(f.calls.length,2);assert.equal(f.calls[1].group,'health');await f.complete([row(1,{place_group:'health'})]);assert.equal(f.displays[0].token,f.view.token);});\ntest('disabling clears retained records and suppresses obsolete completion',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.controller.setEnabled(false);assert(f.calls[0].signal.aborted);await f.complete();assert.equal(f.displays.length,0);assert.equal(f.controller.stats.cacheBytes,0);assert.equal(f.pending(),0);});\ntest('cache hits avoid another network query on return to an unchanged area',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete();f.view={...f.view,bbox:[0,0,2,1]};f.controller.sync();await f.advance();await f.complete();f.view={...f.view,bbox:[0,0,1,1]};f.controller.sync();await f.advance();assert.equal(f.calls.length,2);assert.equal(f.displays.length,3);});\ntest('sustained browsing respects both byte and entry budgets',async()=>{const f=fixture();f.controller.setEnabled(true);const rows=Array.from({length:200},(_,i)=>row(i,{place_name:(i+'x'.repeat(120)),category:'x'.repeat(80),address:'x'.repeat(180),website:'https://example.com/'+ 'x'.repeat(480),data_release:'x'.repeat(40)}));for(let i=0;i<12;i++){f.view={...f.view,bbox:[0,0,1+i*.01,1]};f.controller.sync();await f.advance();await f.complete(rows);assert(f.controller.stats.cacheBytes<=model.PLACES_LIMITS.cacheBytes);assert(f.controller.stats.entries<=6);}assert(f.controller.stats.entries<6);});\ntest('timeout aborts the request and exposes retry without an automatic loop',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();await f.advance(12000);assert(f.calls[0].signal.aborted);assert.equal(f.statuses.at(-1).kind,'error');await f.complete();await f.advance(12000);assert.equal(f.calls.length,1);f.controller.retry();await f.advance();assert.equal(f.calls.length,2);await f.complete();});\n",
              "after": "test('imagery/playback busy gate prevents starting requests until idle',async()=>{const f=fixture();f.busy=true;f.controller.setEnabled(true);await f.advance();assert.equal(f.calls.length,0);f.busy=false;f.controller.sync();await f.advance();assert.equal(f.calls.length,1);await f.complete();assert.equal(f.displays.length,1);});\ntest('repeated stationary notifications coalesce and do not restart the same query',async()=>{const f=fixture();f.controller.setEnabled(true);for(let i=0;i<50;i++)f.controller.sync();await f.advance();assert.equal(f.calls.length,1);await f.complete();f.controller.sync();await f.advance();assert.equal(f.calls.length,1);});\ntest('foreground activity aborts optional work and stale responses cannot replace displayed data',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();const old=f.calls[0];f.busy=true;f.controller.sync();assert(old.signal.aborted);await f.complete();assert.equal(f.displays.length,0);assert.equal(f.statuses.at(-1).kind,'paused');});\ntest('an abort-ignoring transport retains the physical slot while newer work waits',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.view={...f.view,bbox:[0,0,2,1]};f.controller.sync();await f.advance();assert.equal(f.calls.length,1);assert(f.calls[0].signal.aborted);await f.complete();await f.advance();assert.equal(f.calls.length,2);assert.equal(f.displays.length,0);await f.complete();assert.equal(f.displays.length,1);});\ntest('view changes and category changes invalidate pending results',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.view={...f.view,token:{}};f.controller.setGroup('health');await f.complete();await f.advance();assert.equal(f.calls.length,2);assert.equal(f.calls[1].group,'all');await f.complete([row(1,{place_group:'health'})]);assert.equal(f.displays[0].token,f.view.token);});\ntest('disabling clears retained records and suppresses obsolete completion',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();f.controller.setEnabled(false);assert(f.calls[0].signal.aborted);await f.complete();assert.equal(f.displays.length,0);assert.equal(f.controller.stats.cacheBytes,0);assert.equal(f.pending(),0);});\ntest('cache hits avoid another network query on return to an unchanged area',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete();f.view={...f.view,bbox:[0,0,2,1]};f.controller.sync();await f.advance();await f.complete();f.view={...f.view,bbox:[0,0,1,1]};f.controller.sync();await f.advance();assert.equal(f.calls.length,2);assert.equal(f.displays.length,3);});\ntest('sustained browsing respects both byte and entry budgets',async()=>{const f=fixture();f.controller.setEnabled(true);const rows=Array.from({length:200},(_,i)=>row(i,{place_name:(i+'x'.repeat(120)),category:'x'.repeat(80),address:'x'.repeat(180),website:'https://example.com/'+ 'x'.repeat(480),data_release:'x'.repeat(40)}));for(let i=0;i<12;i++){f.view={...f.view,bbox:[0,0,1+i*.01,1]};f.controller.sync();await f.advance();await f.complete(rows);assert(f.controller.stats.cacheBytes<=model.PLACES_LIMITS.cacheBytes);assert(f.controller.stats.entries<=6);}assert(f.controller.stats.entries<6);});\ntest('timeout aborts the request and exposes retry without an automatic loop',async()=>{const f=fixture();f.controller.setEnabled(true);await f.advance();await f.advance(12000);assert(f.calls[0].signal.aborted);assert.equal(f.statuses.at(-1).kind,'error');await f.complete();await f.advance(12000);assert.equal(f.calls.length,1);f.controller.retry();await f.advance();assert.equal(f.calls.length,2);await f.complete();});\n"
            },
            {
              "label": "loaded categories 2",
              "before": "});\ntest('manual audit takes bounded aggregate snapshots with no timers or network access',()=>{\n const vm=require('node:vm'),source=fs.readFileSync(path.join(root,'tools/performance/places-audit.js'),'utf8');let resets=0,clock=0;const entry={reset(){resets++;},snapshot:()=>({timings:{},places:{active:true,loaded:10},view:'2d'})};const context={window:{__mapillarySequencePerformance:{w:entry}},performance:{now:()=>clock,memory:{usedJSHeapSize:100}},setTimeout(){throw Error('no timers');},fetch(){throw Error('no requests');}};vm.runInNewContext(source,context);const audit=context.window.mapillaryPlacesAudit;for(let i=0;i<12;i++){audit.start('phase');clock+=100;const result=audit.stop();assert.equal(result.elapsedMs,100);}assert.equal(resets,12);assert.equal(audit.report().length,10);audit.clear();assert.equal(audit.report().length,0);assert.throws(()=>audit.stop());\n});\n",
              "after": "});\ntest('manual audit takes bounded aggregate snapshots with no timers or network access',()=>{\n const vm=require('node:vm'),source=fs.readFileSync(path.join(root,'tools/performance/places-audit.js'),'utf8');let resets=0,clock=0;const entry={reset(){resets++;},snapshot:()=>({timings:{},places:{active:true,loaded:10},view:'2d'})};const context={window:{__mapillarySequencePerformance:{w:entry}},performance:{now:()=>clock,memory:{usedJSHeapSize:100}},setTimeout(){throw Error('no timers');},fetch(){throw Error('no requests');}};vm.runInNewContext(source,context);const audit=context.window.mapillaryPlacesAudit;for(let i=0;i<12;i++){audit.start('phase');clock+=100;const result=audit.stop();assert.equal(result.elapsedMs,100);}assert.equal(resets,12);assert.equal(audit.report().length,10);audit.clear();assert.equal(audit.report().length,0);assert.throws(()=>audit.stop());\n});\n\ntest('local categories reuse all-group results, counts and cache without another request',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete([row(),row(2,{place_group:'health'}),row(3,{place_group:'services'})],true);\n assert.equal(f.calls[0].group,'all');assert.equal(f.statuses.at(-1).loadedCounts.all,3);\n for(const group of ['health','parks','services','all']) { f.controller.setGroup(group);await f.advance();assert.equal(f.calls.length,1);assert.equal(f.statuses.at(-1).count,group==='all'?3:group==='parks'?0:1);assert.equal(f.statuses.at(-1).loadedCounts.health,1);assert.equal(f.statuses.at(-1).limited,true); }\n f.controller.dispose();\n});\ntest('category changes during a pending request use its all-group result',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();f.controller.setGroup('health');assert.equal(f.calls[0].signal.aborted,false);await f.complete([row(),row(2,{place_group:'health'})]);assert.equal(f.displays.at(-1).places[0].group,'health');assert.equal(f.statuses.at(-1).loadedCounts.all,2);assert.equal(f.calls.length,1);f.controller.dispose();\n});\n\ntest('changing a category after cache age still filters the displayed records locally',async()=>{\n const f=fixture();f.controller.setEnabled(true);await f.advance();await f.complete([row(),row(2,{place_group:'health'})]);await f.advance(120001);f.controller.setGroup('health');assert.equal(f.calls.length,1);assert.equal(f.statuses.at(-1).count,1);assert.equal(f.displays.at(-1).places[0].group,'health');f.controller.dispose();\n});\n"
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
              "label": "loaded categories 1",
              "before": "\nThe existing debug-only sequence snapshot now includes Places counts/cache/selection statistics, read only when a snapshot is requested. There is no new sampling loop or observer. [The live audit workflow](../tools/performance/PLACES-AUDIT.md) and browser-console helper compare the same manual browsing actions with Places off/on using existing click/hover/playback/long-task summaries. The helper retains at most ten aggregate reports and makes no requests. Chromium heap data, when available, covers the entire page and excludes GPU memory. The helper does not measure FPS.\n\nThis cloud environment cannot access the user's localhost app, so deployment results remain unmeasured until that workflow is run in the actual browser. A local actual-ArcGIS object update check performed 1,000 camera updates in about 161 ms while retaining the same four Graphics and label instance; it excludes map rendering and network, and is not a live mobile performance result.\n",
              "after": "\nThe existing debug-only sequence snapshot now includes Places counts/cache/selection statistics, read only when a snapshot is requested. There is no new sampling loop or observer. [The live audit workflow](../tools/performance/PLACES-AUDIT.md) and browser-console helper compare the same manual browsing actions with Places off/on using existing click/hover/playback/long-task summaries. The helper retains at most ten aggregate reports and makes no requests. Chromium heap data, when available, covers the entire page and excludes GPU memory. The helper does not measure FPS.\n\nThis cloud environment cannot access the user's localhost app, so deployment results remain unmeasured until that workflow is run in the actual browser. A local actual-ArcGIS object update check performed 1,000 camera updates in about 161 ms while retaining the same four Graphics and label instance; it excludes map rendering and network, and is not a live mobile performance result.\n\n## v6.57 · Loaded category filters\n\nAll/Health/Education quick buttons and a compact category dropdown filter the same bounded, all-category viewport result locally. Counts describe loaded records (maximum 200), never service totals. Category changes do not query the service, restart pending work, or clear the selected place. Normal viewport refresh, cache expiry and retry retain existing idle/busy gates. A filtered subset may be empty even when the server has more matching records; zoom closer when the loaded result is limited. The published pilot groups remain unchanged; no Food or Shops data is implied.\n"
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
const prefix = 'places-loaded-categories-v6-57-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.57 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-loaded-categories-v6-57' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.57 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.57 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.57 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-loaded-categories-v6-57.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places loaded category filters v6.57 is already installed. No files changed.');
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
  const manifest = { installer: 'places-loaded-categories-v6-57', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places loaded category filters v6.57 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
