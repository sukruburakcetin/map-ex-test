#!/usr/bin/env node
'use strict';
/**
 * Note selection and expandable sheet. Compatible current v6 sources.
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
      "file": "src/features/field-notes/FieldNoteMap.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": "  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n",
              "after": "  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean, selected?: boolean) => A;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n"
            },
            {
              "label": "Note selection and sheet 2",
              "before": "  private currentLayer: L | null = null;\n  private focusedLayer: L | null = null;\n  private focusRevision = 0;\n  private groupView: V | null = null;\n  private groupVisible = true;\n  private revision = 0;\n",
              "after": "  private currentLayer: L | null = null;\n  private focusedLayer: L | null = null;\n  private focusRevision = 0;\n  private focusedNote: FieldNote | null = null;\n  private groupView: V | null = null;\n  private groupVisible = true;\n  private revision = 0;\n"
            },
            {
              "label": "Note selection and sheet 3",
              "before": "    ++this.revision;\n    ++this.focusRevision;\n    this.focusedLayer = null;\n    this.dependencies.clearPending();\n    if (this.currentGroup) {\n      this.groupVisible = this.currentGroup.visible;\n",
              "after": "    ++this.revision;\n    ++this.focusRevision;\n    this.focusedLayer = null;\n    this.focusedNote = null;\n    this.dependencies.clearPending();\n    if (this.currentGroup) {\n      this.groupVisible = this.currentGroup.visible;\n"
            },
            {
              "label": "Note selection and sheet 4",
              "before": "    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Show one navigation-only workspace note without adding it to local storage.\n   * A dedicated ground layer survives local redraws. New selections, cleanup and\n   * view changes invalidate pending SDK loads so an older marker cannot reappear.\n   * Passing null clears the selection when focusing a Local/Enterprise note.\n   */\n  async focusWorkspaceNote(note: FieldNote | null): Promise<void> {\n    const selection = ++this.focusRevision;\n    this.focusedLayer?.removeAll();\n    if (!note || !Number.isFinite(note.lon) || !Number.isFinite(note.lat)) return;\n    const d = this.dependencies, context = d.readContext(), view = context.view;\n",
              "after": "    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Include note layers in SDK picking only while they contain selectable notes. */\n  get hasPickTargets(): boolean { return !!this.focusedNote || this.dependencies.readNotes().length > 0; }\n\n  /** Resolve only our own note graphics, preserving external feature-pick priority. */\n  noteForGraphic(graphic: { layer?: L; attributes?: { id?: string } }): FieldNote | null {\n    const id = graphic.attributes?.id;\n    if (graphic.layer === this.focusedLayer && id === this.focusedNote?.id) return this.focusedNote;\n    return graphic.layer === this.currentLayer ? this.dependencies.readNotes().find(note => note.id === id) || null : null;\n  }\n\n  /** Show one navigation-only selected note without adding it to local storage.\n   * A dedicated ground layer survives local redraws. New selections, cleanup and\n   * view changes invalidate pending SDK loads so an older marker cannot reappear.\n   * Passing null explicitly clears selection; Local/Enterprise targets are never saved.\n   */\n  async focusNote(note: FieldNote | null): Promise<void> {\n    const selection = ++this.focusRevision;\n    this.focusedNote = note;\n    this.focusedLayer?.removeAll();\n    if (!note || !Number.isFinite(note.lon) || !Number.isFinite(note.lat)) return;\n    const d = this.dependencies, context = d.readContext(), view = context.view;\n"
            },
            {
              "label": "Note selection and sheet 5",
              "before": "    if (!this.focusedLayer || this.focusedLayer.destroyed) {\n      const create = await d.loadLayerFactory();\n      if (!current()) return;\n      this.focusedLayer = create({ id: 'workspace-note-selection', title: 'Selected workspace note', elevationInfo: { mode: 'on-the-ground' } });\n    }\n    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    layer.add(d.readGraphicFactory()(note, view.type === '3d'));\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n",
              "after": "    if (!this.focusedLayer || this.focusedLayer.destroyed) {\n      const create = await d.loadLayerFactory();\n      if (!current()) return;\n      this.focusedLayer = create({ id: 'workspace-note-selection', title: 'Selected note', elevationInfo: { mode: 'on-the-ground' } });\n    }\n    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    layer.add(d.readGraphicFactory()(note, view.type === '3d', true));\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/mapGraphic.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": "/**\n * Build the existing source-colored diamond, WGS84 point and note popup.\n * Preserve altitude on the descriptor; hasZ is enabled only for 3D views with altitude.\n * This helper does not allocate SDK objects, access layers or decide whether a shared copy is visible.\n */\nexport function buildLocalNoteGraphic(note: FieldNote, is3D: boolean): __esri.GraphicProperties {\n  const color = note.source === \"manual\" ? [245, 166, 35, 1] : [53, 175, 109, 1];\n\n  const symbol = {\n    type: \"simple-marker\",\n    style: \"diamond\",\n    color,\n    size: 13,\n    outline: { color: \"white\", width: 1.5 },\n  };\n\n  return {\n",
              "after": "/**\n * Build the existing source-colored diamond, WGS84 point and note popup.\n * Preserve altitude on the descriptor; hasZ is enabled only for 3D views with altitude.\n * Selected navigation targets use a larger diamond with a cyan outline.\n * This helper does not allocate SDK objects, access layers or decide whether a shared copy is visible.\n */\nexport function buildLocalNoteGraphic(note: FieldNote, is3D: boolean, selected = false): __esri.GraphicProperties {\n  const color = note.source === \"manual\" ? [245, 166, 35, 1] : [53, 175, 109, 1];\n\n  const symbol = {\n    type: \"simple-marker\",\n    style: \"diamond\",\n    color,\n    size: selected ? 20 : 13,\n    outline: { color: selected ? \"#45e6ff\" : \"white\", width: selected ? 3 : 1.5 },\n  };\n\n  return {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/FieldNotesPanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": "import { EnterpriseNotesList } from '../features/field-notes/EnterpriseNotesList';\nimport { WorkspaceBoundary } from '../features/community-notes/WorkspaceBoundary';\nimport type { EnterpriseNotesLoader } from '../features/field-notes/enterpriseList';\nimport { notesTabsStyle, getNotesTabStyle, notesSheetStyle } from '../styles/enterpriseNotes';\nimport { FieldNote, FieldNoteEditor, FieldNoteAttachments, FIELD_NOTE_CATEGORIES } from \"./types\";\n\ninterface Props {\n",
              "after": "import { EnterpriseNotesList } from '../features/field-notes/EnterpriseNotesList';\nimport { WorkspaceBoundary } from '../features/community-notes/WorkspaceBoundary';\nimport type { EnterpriseNotesLoader } from '../features/field-notes/enterpriseList';\nimport { notesTabsStyle, getNotesTabStyle, notesSheetStyle, notesSheetHandleStyle, notesSheetGripStyle } from '../styles/enterpriseNotes';\nimport { FieldNote, FieldNoteEditor, FieldNoteAttachments, FIELD_NOTE_CATEGORIES } from \"./types\";\n\ninterface Props {\n"
            },
            {
              "label": "Note selection and sheet 2",
              "before": "    const [noteText, setNoteText] = React.useState(\"\");\n    const [share, setShare] = React.useState(false);\n    const fileInputRef = React.useRef<HTMLInputElement>(null);\n    const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);\n    const [noteSource, setNoteSource] = React.useState<\"local\" | \"enterprise\" | \"workspace\">(\"local\");\n    const enterpriseAvailable = !!props.enterpriseEnabled && !!props.onLoadEnterpriseNotes;\n",
              "after": "    const [noteText, setNoteText] = React.useState(\"\");\n    const [share, setShare] = React.useState(false);\n    const fileInputRef = React.useRef<HTMLInputElement>(null);\n    const [notesExpanded, setNotesExpanded] = React.useState(false);\n    const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);\n    const [noteSource, setNoteSource] = React.useState<\"local\" | \"enterprise\" | \"workspace\">(\"local\");\n    const enterpriseAvailable = !!props.enterpriseEnabled && !!props.onLoadEnterpriseNotes;\n"
            },
            {
              "label": "Note selection and sheet 3",
              "before": "\n            {/* Notes list: bottom-sheet with fixed header and scrollable notes */}\n            {(listOpen || workspaceVisited) && (\n                <div hidden={!listOpen} style={{ ...notesSheetStyle, display: listOpen ? 'flex' : 'none' }}>\n                    {props.sharedMessage && <div role=\"status\" style={noteMapMessageStyle}>{<OwnedMessage source={String(props.sharedMessage ?? \"\")}/>} <button type=\"button\" onClick={props.onRetrySharedDisplay} style={noteMapRefreshStyle}> {t('uiRefresh')} </button></div>}\n                    <div role=\"tablist\" aria-label={t('uiNoteSource')} style={{ ...notesTabsStyle, flexWrap: 'wrap' }} onKeyDown={event => {\n                      if (![\"ArrowLeft\", \"ArrowRight\", \"Home\", \"End\"].includes(event.key)) return;\n",
              "after": "\n            {/* Notes list: bottom-sheet with fixed header and scrollable notes */}\n            {(listOpen || workspaceVisited) && (\n                <div hidden={!listOpen} style={{ ...notesSheetStyle, display: listOpen ? 'flex' : 'none', ...(notesExpanded ? { height: '92%' } : {}) }}>\n                    {/* Native button supports touch, Enter and Space without stealing list scrolling. */}\n                    <button type=\"button\" aria-expanded={notesExpanded} aria-label={owned(notesExpanded ? 'Collapse notes panel' : 'Expand notes panel')}\n                      title={owned(notesExpanded ? 'Collapse notes panel' : 'Expand notes panel')} style={notesSheetHandleStyle}\n                      onClick={event => { event.stopPropagation(); setNotesExpanded(value => !value); }}\n                      onPointerDown={event => event.stopPropagation()}>\n                      <span aria-hidden=\"true\" style={notesSheetGripStyle} />\n                    </button>\n                    {props.sharedMessage && <div role=\"status\" style={noteMapMessageStyle}>{<OwnedMessage source={String(props.sharedMessage ?? \"\")}/>} <button type=\"button\" onClick={props.onRetrySharedDisplay} style={noteMapRefreshStyle}> {t('uiRefresh')} </button></div>}\n                    <div role=\"tablist\" aria-label={t('uiNoteSource')} style={{ ...notesTabsStyle, flexWrap: 'wrap' }} onKeyDown={event => {\n                      if (![\"ArrowLeft\", \"ArrowRight\", \"Home\", \"End\"].includes(event.key)) return;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/enterpriseNotes.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": "\nexport const notesLocalPanelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, flex: '1 1 0', overflow: 'hidden' };\n\n/** Fixed source-independent sheet height; only records scroll as tabs/loading state change. */\nexport const notesSheetStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 999999990,\n  height: 'min(300px, 65%)', boxSizing: 'border-box', background: 'rgba(12,12,12,0.92)', backdropFilter: 'blur(10px)',\n  borderTop: '1px solid rgba(255,255,255,0.1)', padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: 6,\n  overflowY: 'auto', animation: 'nearbySlideUp 0.2s ease-out' };\nexport const notesRowHeadingStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' };\nexport const notesRowMetaStyle: React.CSSProperties = { fontSize: 9, color: '#a0ada5' };\n",
              "after": "\nexport const notesLocalPanelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, flex: '1 1 0', overflow: 'hidden' };\n\n/** Default source-independent sheet height; only records scroll as tabs/loading state change. */\nexport const notesSheetStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 999999990,\n  height: 'min(300px, 65%)', boxSizing: 'border-box', background: 'rgba(12,12,12,0.92)', backdropFilter: 'blur(10px)',\n  borderTop: '1px solid rgba(255,255,255,0.1)', padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: 6,\n  overflowY: 'auto', animation: 'nearbySlideUp 0.2s ease-out' };\nexport const notesRowHeadingStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' };\nexport const notesRowMetaStyle: React.CSSProperties = { fontSize: 9, color: '#a0ada5' };\n\n/** Wide touch/keyboard target with a familiar sheet grip; records retain their own scrolling. */\nexport const notesSheetHandleStyle: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,\n  width: '100%', minHeight: 28, padding: 4, border: 0, borderRadius: 5, background: 'transparent', color: '#d3e2d9', cursor: 'pointer', touchAction: 'manipulation' };\nexport const notesSheetGripStyle: React.CSSProperties = { display: 'block', width: 44, height: 5, borderRadius: 4, background: 'currentColor' };\n"
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
              "label": "Note selection and sheet 1",
              "before": "    },\n    readGraphicFactory: () => {\n      const { Graphic } = this.ArcGISModules;\n      return (note, is3D) => new Graphic(buildLocalNoteGraphic(note, is3D));\n    },\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n",
              "after": "    },\n    readGraphicFactory: () => {\n      const { Graphic } = this.ArcGISModules;\n      return (note, is3D, selected) => new Graphic(buildLocalNoteGraphic(note, is3D, selected));\n    },\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n"
            },
            {
              "label": "Note selection and sheet 2",
              "before": "  private focusFieldNote = (note: FieldNote) => {\n    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    // Workspace records are navigation targets, not saved local graphics.\n    void this._fieldNoteMap.focusWorkspaceNote(note.id.startsWith('workspace:') ? note : null)\n      .catch(() => this.showToast(this._owned('Selected note marker could not be displayed. Try Show on map again.')));\n    this.navigateMapView(view, { center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });\n\n",
              "after": "  private focusFieldNote = (note: FieldNote) => {\n    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    // Selection is a transient highlight; it never creates a saved local copy.\n    void this._fieldNoteMap.focusNote(note)\n      .catch(() => this.showToast(this._owned('Selected note marker could not be displayed. Try Show on map again.')));\n    this.navigateMapView(view, { center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });\n\n"
            },
            {
              "label": "Note selection and sheet 3",
              "before": "\n      try {\n        const response = await coverageClickHitTest(!!pointPreviewAtClick, {\n          sharedNotes: !!this._sharedNotesLayer,\n          pointCloud: !!this._pointCloudMapLayer?.layer,\n          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n",
              "after": "\n      try {\n        const response = await coverageClickHitTest(!!pointPreviewAtClick, {\n          sharedNotes: !!this._sharedNotesLayer || this._fieldNoteMap.hasPickTargets,\n          pointCloud: !!this._pointCloudMapLayer?.layer,\n          places: !!this.state.placesActive,\n          detectionFeatures: !!this.mapillaryObjectsFeatureLayer || !!this.mapillaryTrafficSignsFeatureLayer,\n"
            },
            {
              "label": "Note selection and sheet 4",
              "before": "        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n          this._sharedNotesPopupHandle?.remove();\n          this._sharedNotesPopupHandle = view.popup?.on(\"trigger-action\", event => {\n",
              "after": "        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          const selected = (enterpriseNoteHit as any).graphic, location = selected.geometry;\n          if (location?.type === 'point') void this._fieldNoteMap.focusNote({\n            id: 'enterprise:selection', source: 'manual', category: String(selected.attributes?.category || 'Other'),\n            note: String(selected.attributes?.note_text || ''), lon: location.longitude, lat: location.latitude,\n            imageId: null, createdAt: Date.now()\n          }).catch(() => {});\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n          this._sharedNotesPopupHandle?.remove();\n          this._sharedNotesPopupHandle = view.popup?.on(\"trigger-action\", event => {\n"
            },
            {
              "label": "Note selection and sheet 5",
              "before": "          return;\n        }\n\n\n        if (this._pointCloudHits.route(response.results)) return;\n\n",
              "after": "          return;\n        }\n\n\n        // Note clicks select the same highlight as Show on map without moving the camera.\n        const noteHit = response.results.find((result: any) => result.graphic && this._fieldNoteMap.noteForGraphic(result.graphic));\n        if (noteHit && (noteHit as any).graphic) {\n          const graphic = (noteHit as any).graphic;\n          const note = this._fieldNoteMap.noteForGraphic(graphic);\n          if (note) void this._fieldNoteMap.focusNote(note).catch(() => {});\n          view.openPopup({ features: [graphic], location: graphic.geometry });\n          return;\n        }\n\n        if (this._pointCloudHits.route(response.results)) return;\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/fieldNoteMap.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": "// Workspace navigation has no local copy; selection belongs to the map owner only.\ntest('workspace focus renders a ground marker in 2D/3D with an empty local collection',async()=>{\n for(const type of ['2d','3d']){const h=setup('working',{type});h.w.state.fieldNotes=[];const target=note('workspace:remote',{alt:undefined});\n await h.w._fieldNoteMap.focusWorkspaceNote(target);\n const layer=h.layers.find(l=>l.id==='workspace-note-selection');assert(layer);assert.equal(layer.elevationInfo.mode,'on-the-ground');\n assert.equal(layer.graphics.length,1);assert.equal(layer.graphics[0].geometry.longitude,target.lon);assert.equal(layer.graphics[0].attributes.id,target.id);assert.equal(h.w.state.fieldNotes.length,0);\n await h.draw();assert.equal(layer.graphics.length,1);assert.equal(h.layer().graphics.length,0);\n }\n});\ntest('workspace selection replaces its marker and Local/Enterprise focus clears it',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:first'));\n await h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:second',{lon:5}));assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics.length,1);assert.equal(h.layers[0].graphics[0].geometry.longitude,5);\n await h.w._fieldNoteMap.focusWorkspaceNote(null);assert.equal(h.layers[0].graphics.length,0);\n});\ntest('late workspace selections cannot replace a newer marker',async()=>{\n const h=setup('working',{hold:true});const old=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:old'));h.resolve(0);await flush();assert.equal(h.loads.length,2);\n const latest=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:latest'));await flush();h.resolve(2);await latest;h.resolve(1);await old;\n assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics[0].attributes.id,'workspace:latest');\n});\ntest('clear or view replacement during workspace SDK loading prevents stale attachment',async()=>{\n for(const mode of ['clear','view','local']){const h=setup('working',{hold:true});const pending=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:old'));h.resolve(0);await flush();\n if(mode==='clear')h.clear();else if(mode==='view')h.w.state.jimuMapView={view:h.view()};else await h.w._fieldNoteMap.focusWorkspaceNote(null);\n h.resolve(1);await pending;assert.equal(h.layers.length,0);\n }\n});\ntest('workspace layer loading failure is retryable and does not mutate local notes',async()=>{\n const h=setup('working',{hold:true});const before=structuredClone(h.w.state.fieldNotes);const failed=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:a'));h.resolve(0);await flush();h.loads[1].reject(Error('layer unavailable'));await assert.rejects(failed);\n const retry=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:a'));await flush();h.resolve(2);await retry;assert.equal(h.layers[0].graphics.length,1);assert.deepEqual(h.w.state.fieldNotes,before);\n});\ntest('actual Show on map dispatches workspace marker selection and preserves navigation',async()=>{\n const method=cl.members.find(n=>n.name?.getText(sf)==='focusFieldNote').getText(sf);\n const Harness=new Function(compile('class Widget{'+method+'};return Widget;'))();const w=new Harness(),selected=[],moves=[];\n w.state={jimuMapView:{view:{zoom:15}},imageId:null};w._fieldNoteMap={focusWorkspaceNote:async n=>selected.push(n)};w.navigateMapView=(...args)=>moves.push(args);w.showToast=()=>{};\n w.focusFieldNote(note('workspace:remote'));w.focusFieldNote(note('local'));await flush();assert.equal(selected[0].id,'workspace:remote');assert.equal(selected[1],null);assert.equal(moves.length,2);assert.deepEqual(moves[0][1],{center:[1,2],zoom:18});\n});\n",
              "after": "// Workspace navigation has no local copy; selection belongs to the map owner only.\ntest('workspace focus renders a ground marker in 2D/3D with an empty local collection',async()=>{\n for(const type of ['2d','3d']){const h=setup('working',{type});h.w.state.fieldNotes=[];const target=note('workspace:remote',{alt:undefined});\n await h.w._fieldNoteMap.focusNote(target);\n const layer=h.layers.find(l=>l.id==='workspace-note-selection');assert(layer);assert.equal(layer.elevationInfo.mode,'on-the-ground');\n assert.equal(layer.graphics.length,1);assert.equal(layer.graphics[0].geometry.longitude,target.lon);assert.equal(layer.graphics[0].attributes.id,target.id);assert.equal(h.w.state.fieldNotes.length,0);\n await h.draw();assert.equal(layer.graphics.length,1);assert.equal(h.layer().graphics.length,0);\n }\n});\ntest('selection replaces its marker and explicit clearing removes it',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusNote(note('workspace:first'));\n await h.w._fieldNoteMap.focusNote(note('workspace:second',{lon:5}));assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics.length,1);assert.equal(h.layers[0].graphics[0].geometry.longitude,5);\n await h.w._fieldNoteMap.focusNote(null);assert.equal(h.layers[0].graphics.length,0);\n});\ntest('late workspace selections cannot replace a newer marker',async()=>{\n const h=setup('working',{hold:true});const old=h.w._fieldNoteMap.focusNote(note('workspace:old'));h.resolve(0);await flush();assert.equal(h.loads.length,2);\n const latest=h.w._fieldNoteMap.focusNote(note('workspace:latest'));await flush();h.resolve(2);await latest;h.resolve(1);await old;\n assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics[0].attributes.id,'workspace:latest');\n});\ntest('clear or view replacement during workspace SDK loading prevents stale attachment',async()=>{\n for(const mode of ['clear','view','local']){const h=setup('working',{hold:true});const pending=h.w._fieldNoteMap.focusNote(note('workspace:old'));h.resolve(0);await flush();\n if(mode==='clear')h.clear();else if(mode==='view')h.w.state.jimuMapView={view:h.view()};else await h.w._fieldNoteMap.focusNote(null);\n h.resolve(1);await pending;assert.equal(h.layers.length,0);\n }\n});\ntest('workspace layer loading failure is retryable and does not mutate local notes',async()=>{\n const h=setup('working',{hold:true});const before=structuredClone(h.w.state.fieldNotes);const failed=h.w._fieldNoteMap.focusNote(note('workspace:a'));h.resolve(0);await flush();h.loads[1].reject(Error('layer unavailable'));await assert.rejects(failed);\n const retry=h.w._fieldNoteMap.focusNote(note('workspace:a'));await flush();h.resolve(2);await retry;assert.equal(h.layers[0].graphics.length,1);assert.deepEqual(h.w.state.fieldNotes,before);\n});\ntest('actual Show on map dispatches workspace marker selection and preserves navigation',async()=>{\n const method=cl.members.find(n=>n.name?.getText(sf)==='focusFieldNote').getText(sf);\n const Harness=new Function(compile('class Widget{'+method+'};return Widget;'))();const w=new Harness(),selected=[],moves=[];\n w.state={jimuMapView:{view:{zoom:15}},imageId:null};w._fieldNoteMap={focusNote:async n=>selected.push(n)};w.navigateMapView=(...args)=>moves.push(args);w.showToast=()=>{};\n w.focusFieldNote(note('workspace:remote'));w.focusFieldNote(note('local'));await flush();assert.equal(selected[0].id,'workspace:remote');assert.equal(selected[1].id,'local');assert.equal(moves.length,2);assert.deepEqual(moves[0][1],{center:[1,2],zoom:18});\n});\n\ntest('selected diamond is visibly distinct while normal graphics keep their original symbol',()=>{\n const normal=descriptor.exports.buildLocalNoteGraphic(note(),false),selected=descriptor.exports.buildLocalNoteGraphic(note(),false,true);\n assert.equal(normal.symbol.size,13);assert.equal(normal.symbol.outline.color,'white');assert.equal(selected.symbol.size,20);assert.equal(selected.symbol.outline.color,'#45e6ff');assert.equal(selected.symbol.outline.width,3);\n});\ntest('only our local and selected graphics resolve for note click routing',async()=>{\n const h=setup('working');assert.equal(h.w._fieldNoteMap.hasPickTargets,true);await h.draw();\n assert.equal(h.w._fieldNoteMap.noteForGraphic({layer:h.layer(),attributes:{id:'A'}}).id,'A');assert.equal(h.w._fieldNoteMap.noteForGraphic({layer:{},attributes:{id:'A'}}),null);\n const target=note('workspace:a');await h.w._fieldNoteMap.focusNote(target);const layer=h.layers.find(l=>l.id==='workspace-note-selection');\n assert.equal(h.w._fieldNoteMap.noteForGraphic({layer,attributes:{id:target.id}}),target);\n h.w.state.fieldNotes=[];await h.w._fieldNoteMap.focusNote(null);assert.equal(h.w._fieldNoteMap.hasPickTargets,false);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/communityWorkspace.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": " try{\n  await page.goto('https://demo.test/');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/note-search-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/note-search-react-dom/package/umd/react-dom.development.js'});await page.addScriptTag({content:bootstrap});\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n  await page.waitForFunction(()=>window.workspaceImportAttempts===1);assert.equal(await page.getByText('Collaboration workspace',{exact:true}).count(),0);assert.equal(requests.length,0);checks++;\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).focus();await page.keyboard.press('End');await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);await page.getByRole('tab',{name:'Workspaces',exact:true}).focus();await page.keyboard.press('Home');await page.getByRole('searchbox').waitFor();checks++;\n  await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('heading').count();await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n",
              "after": " try{\n  await page.goto('https://demo.test/');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/note-search-react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/note-search-react-dom/package/umd/react-dom.development.js'});await page.addScriptTag({content:bootstrap});\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n  const expand=page.getByRole('button',{name:'Expand notes panel',exact:true});\n  const collapsed=await expand.evaluate(node=>node.parentElement.getBoundingClientRect().height);\n  await expand.click();const collapse=page.getByRole('button',{name:'Collapse notes panel',exact:true});assert.equal(await collapse.getAttribute('aria-expanded'),'true');\n  assert(await collapse.evaluate(node=>node.parentElement.getBoundingClientRect().height)>collapsed);assert.equal(requests.length,0);checks++;\n  await collapse.focus();await page.keyboard.press('Space');await page.getByRole('button',{name:'Expand notes panel',exact:true}).waitFor();checks++;\n\n  await page.waitForFunction(()=>window.workspaceImportAttempts===1);assert.equal(await page.getByText('Collaboration workspace',{exact:true}).count(),0);assert.equal(requests.length,0);checks++;\n  await page.getByRole('tab',{name:'Local (1)',exact:true}).focus();await page.keyboard.press('End');await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);await page.getByRole('tab',{name:'Workspaces',exact:true}).focus();await page.keyboard.press('Home');await page.getByRole('searchbox').waitFor();checks++;\n  await page.getByRole('tab',{name:'Workspaces',exact:true}).click();await page.getByRole('heading').count();await page.getByText('Collaboration workspace',{exact:true}).waitFor();assert.equal(requests.length,0);checks++;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/NOTE-SELECTION-AND-SHEET.md",
      "content": "# Note selection and expandable sheet\n\n`FieldNoteMap.focusNote` owns one transient selection graphic. Show on map selects it and keeps the existing camera/image navigation. SDK hits on Local/selected workspace markers select it without moving the camera; Enterprise hits keep their existing popup actions and highlight their point. The larger diamond uses a cyan outline. Selecting another note replaces the highlight; cleanup invalidates pending SDK work. This never publishes or saves a local copy.\n\n`mapGraphic.ts` owns selected/normal symbol descriptors. `FieldNotesPanel.tsx` owns the in-memory expanded state. Its native button grip supports touch, mouse, Enter and Space and exposes aria-expanded. Expanded height is 92% of the widget's available height; the default stays capped at 300px/65%. Lists continue to scroll inside the sheet. This is a click/tap toggle, not a draggable resize control.\n\nThe coverage click fast path requests an SDK hit test when note markers are available so note clicks retain priority over imagery. Without note targets, existing coverage picking remains unchanged.\n\nApply after the collaboration workspace, preload and workspace marker updates. Rebuild and reload the widget. Test a shared workspace with an empty Local list, select notes through Show on map and marker clicks, and expand/collapse at mobile/controller widths. Check 2D and 3D ground placement in Experience Builder; recording SDK tests do not replace this live check.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'note-selection-and-sheet-';

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
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'note-selection-and-sheet' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-note-selection-and-sheet.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Note selection and expandable sheet is already installed. No files changed.');
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
  const manifest = { installer: 'note-selection-and-sheet', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Note selection and expandable sheet ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
