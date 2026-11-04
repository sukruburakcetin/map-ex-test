#!/usr/bin/env node
'use strict';
/**
 * Native note highlight. Compatible current v6 sources.
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
              "before": "  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean, selected?: boolean) => A;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n",
              "after": "  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n  highlightNote?(view: V, layer: L, graphic: A, current: () => boolean): Promise<{ remove(): void }>;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n"
            },
            {
              "label": "Note selection and sheet 2",
              "before": "  private currentLayer: L | null = null;\n  private focusedLayer: L | null = null;\n  private focusRevision = 0;\n  private focusedNote: FieldNote | null = null;\n  private groupView: V | null = null;\n  private groupVisible = true;\n",
              "after": "  private currentLayer: L | null = null;\n  private focusedLayer: L | null = null;\n  private focusRevision = 0;\n  private highlightHandle: { remove(): void } | null = null;\n  private focusedNote: FieldNote | null = null;\n  private groupView: V | null = null;\n  private groupVisible = true;\n"
            },
            {
              "label": "Note selection and sheet 3",
              "before": "      const create = await d.loadGroupFactory();\n      if (revision !== this.revision || view.destroyed || !view.map || d.readContext().view !== view || d.readContext().disposed) return null;\n      if (this.currentGroup) {\n        this.focusedLayer = null;\n        this.groupVisible = this.currentGroup.visible;\n        this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n",
              "after": "      const create = await d.loadGroupFactory();\n      if (revision !== this.revision || view.destroyed || !view.map || d.readContext().view !== view || d.readContext().disposed) return null;\n      if (this.currentGroup) {\n        this.highlightHandle?.remove();\n        this.highlightHandle = null;\n        this.focusedLayer = null;\n        this.groupVisible = this.currentGroup.visible;\n        this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n"
            },
            {
              "label": "Note selection and sheet 4",
              "before": "   */\n  clear(): void {\n    ++this.revision;\n    ++this.focusRevision;\n    this.focusedLayer = null;\n    this.focusedNote = null;\n    this.dependencies.clearPending();\n",
              "after": "   */\n  clear(): void {\n    ++this.revision;\n    this.clearHighlight();\n    this.focusedLayer = null;\n    this.focusedNote = null;\n    this.dependencies.clearPending();\n"
            },
            {
              "label": "Note selection and sheet 5",
              "before": "      this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n    }\n    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Include note layers in SDK picking only while they contain selectable notes. */\n",
              "after": "      this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n    }\n    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Release native selection and retire any pending highlight/popup work.\n   * Keep the normal workspace marker available for later clicks.\n   */\n  clearHighlight(): void {\n    ++this.focusRevision;\n    this.highlightHandle?.remove();\n    this.highlightHandle = null;\n  }\n\n  /** Include note layers in SDK picking only while they contain selectable notes. */\n"
            },
            {
              "label": "Note selection and sheet 6",
              "before": "   * Passing null explicitly clears selection; Local/Enterprise targets are never saved.\n   */\n  async focusNote(note: FieldNote | null): Promise<void> {\n    const selection = ++this.focusRevision;\n    this.focusedNote = note;\n    this.focusedLayer?.removeAll();\n    if (!note || !Number.isFinite(note.lon) || !Number.isFinite(note.lat)) return;\n",
              "after": "   * Passing null explicitly clears selection; Local/Enterprise targets are never saved.\n   */\n  async focusNote(note: FieldNote | null): Promise<void> {\n    this.clearHighlight();\n    const selection = this.focusRevision;\n    this.focusedNote = note;\n    this.focusedLayer?.removeAll();\n    if (!note || !Number.isFinite(note.lon) || !Number.isFinite(note.lat)) return;\n"
            },
            {
              "label": "Note selection and sheet 7",
              "before": "    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    layer.add(d.readGraphicFactory()(note, view.type === '3d', true));\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n",
              "after": "    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    const graphic = d.readGraphicFactory()(note, view.type === '3d');\n    layer.add(graphic);\n    if (d.highlightNote) {\n      const handle = await d.highlightNote(view, layer, graphic, current);\n      if (current()) this.highlightHandle = handle; else handle.remove();\n    }\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n"
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
              "before": "/**\n * Build the existing source-colored diamond, WGS84 point and note popup.\n * Preserve altitude on the descriptor; hasZ is enabled only for 3D views with altitude.\n * Selected navigation targets use a larger diamond with a cyan outline.\n * This helper does not allocate SDK objects, access layers or decide whether a shared copy is visible.\n */\nexport function buildLocalNoteGraphic(note: FieldNote, is3D: boolean, selected = false): __esri.GraphicProperties {\n  const color = note.source === \"manual\" ? [245, 166, 35, 1] : [53, 175, 109, 1];\n\n  const symbol = {\n    type: \"simple-marker\",\n    style: \"diamond\",\n    color,\n    size: selected ? 20 : 13,\n    outline: { color: selected ? \"#45e6ff\" : \"white\", width: selected ? 3 : 1.5 },\n  };\n\n  return {\n",
              "after": "/**\n * Build the existing source-colored diamond, WGS84 point and note popup.\n * Preserve altitude on the descriptor; hasZ is enabled only for 3D views with altitude.\n * This helper does not allocate SDK objects, access layers or decide whether a shared copy is visible.\n */\nexport function buildLocalNoteGraphic(note: FieldNote, is3D: boolean): __esri.GraphicProperties {\n  const color = note.source === \"manual\" ? [245, 166, 35, 1] : [53, 175, 109, 1];\n\n  const symbol = {\n    type: \"simple-marker\",\n    style: \"diamond\",\n    color,\n    size: 13,\n    outline: { color: \"white\", width: 1.5 },\n  };\n\n  return {\n"
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
              "before": "import { FieldNoteMap } from '../features/field-notes/FieldNoteMap';\nimport { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\nimport { buildLocalNoteGraphic } from '../features/field-notes/mapGraphic';\nimport { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';\nimport { createFieldNoteViewerRenderer } from '../features/field-notes/viewerRenderer';\n",
              "after": "import { FieldNoteMap } from '../features/field-notes/FieldNoteMap';\nimport { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\nimport { startNoteHighlight } from '../features/field-notes/nativeNoteHighlight';\nimport { buildLocalNoteGraphic } from '../features/field-notes/mapGraphic';\nimport { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';\nimport { createFieldNoteViewerRenderer } from '../features/field-notes/viewerRenderer';\n"
            },
            {
              "label": "Note selection and sheet 2",
              "before": "    },\n    readGraphicFactory: () => {\n      const { Graphic } = this.ArcGISModules;\n      return (note, is3D, selected) => new Graphic(buildLocalNoteGraphic(note, is3D, selected));\n    },\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n  private _fieldNoteFiles = new FieldNoteFiles({\n",
              "after": "    },\n    readGraphicFactory: () => {\n      const { Graphic } = this.ArcGISModules;\n      return (note, is3D) => new Graphic(buildLocalNoteGraphic(note, is3D));\n    },\n    highlightNote: (view, layer, graphic, current) => startNoteHighlight(view, layer, graphic, current),\n  });\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n  private _fieldNoteFiles = new FieldNoteFiles({\n"
            },
            {
              "label": "Note selection and sheet 3",
              "before": "    // CLICK HANDLER\n    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\") return;\n      this._coverageHoverResume?.leave();\n      // Claim the click before any await. SDK hit tests cannot be aborted, so\n      // late results must lose ownership before they can open imagery or tools.\n",
              "after": "    // CLICK HANDLER\n    this.mapClickHandle = view.on(\"click\", async (evt) => {\n      if (this.props.state === \"CLOSED\") return;\n      this._fieldNoteMap.clearHighlight();\n      this._coverageHoverResume?.leave();\n      // Claim the click before any await. SDK hit tests cannot be aborted, so\n      // late results must lose ownership before they can open imagery or tools.\n"
            },
            {
              "label": "Note selection and sheet 4",
              "before": "        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          const selected = (enterpriseNoteHit as any).graphic, location = selected.geometry;\n          if (location?.type === 'point') void this._fieldNoteMap.focusNote({\n            id: 'enterprise:selection', source: 'manual', category: String(selected.attributes?.category || 'Other'),\n            note: String(selected.attributes?.note_text || ''), lon: location.longitude, lat: location.latitude,\n            imageId: null, createdAt: Date.now()\n          }).catch(() => {});\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n          this._sharedNotesPopupHandle?.remove();\n          this._sharedNotesPopupHandle = view.popup?.on(\"trigger-action\", event => {\n",
              "after": "        if (!clickCurrent()) return;\n        const enterpriseNoteHit = response.results.find((result: any) => (result.layer || result.graphic?.layer) === this._sharedNotesLayer);\n        if (enterpriseNoteHit && (enterpriseNoteHit as any).graphic) {\n          view.openPopup({ features: [(enterpriseNoteHit as any).graphic], location: (enterpriseNoteHit as any).graphic.geometry });\n          this._sharedNotesPopupHandle?.remove();\n          this._sharedNotesPopupHandle = view.popup?.on(\"trigger-action\", event => {\n"
            },
            {
              "label": "Note selection and sheet 5",
              "before": "          const graphic = (noteHit as any).graphic;\n          const note = this._fieldNoteMap.noteForGraphic(graphic);\n          if (note) void this._fieldNoteMap.focusNote(note).catch(() => {});\n          view.openPopup({ features: [graphic], location: graphic.geometry });\n          return;\n        }\n\n",
              "after": "          const graphic = (noteHit as any).graphic;\n          const note = this._fieldNoteMap.noteForGraphic(graphic);\n          if (note) void this._fieldNoteMap.focusNote(note).catch(() => {});\n          return;\n        }\n\n"
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
              "before": " class Layer{constructor(props){Object.assign(this,props);this.number=layers.length;this.graphics=[];layers.push(this);trace.push(['layer',structuredClone(props)])}removeAll(){this.graphics=[];trace.push(['removeAll',this.number])}add(g){this.graphics.push(g);trace.push(['graphic',this.number,structuredClone(g)])}destroy(){this.destroyed=true;trace.push(['destroy-layer',this.number])}}\n class Graphic{constructor(props){if(graphicFailure)throw Error('graphic failed');Object.assign(this,props)}}\n const load=names=>{trace.push(['load',names]);const d=deferred();d.kind=names[0].includes('GroupLayer')?'group':'layer';loads.push(d);if(!hold)d.resolve([d.kind==='group'?Group:Layer]);return d.promise};\n const Harness=new Function('FieldNoteMap','loadArcGISJSAPIModules','buildLocalNoteGraphic',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.FieldNoteMap,load,descriptor.exports.buildLocalNoteGraphic);const w=new Harness();\n function view(type='3d'){const v={type,destroyed:false,map:{add:g=>trace.push(['map-add',views.indexOf(v),g.number]),remove:g=>trace.push(['map-remove',views.indexOf(v),g.number])}};views.push(v);return v}\n w.state={jimuMapView:{view:view(type)},fieldNotes:[note(),note('B',{source:'mapillary-detection',alt:undefined})]};w.props={config:{sharedFieldNotesUrl:' https://enterprise/notes/ '}};w.ArcGISModules={Graphic};w._sharedNotesDisposed=false;w._sharedNotesLayer=null;w._sharedNotesView=null;w.clearPendingNoteGraphic=()=>trace.push(['pending-clear']);w._fieldNotesGroup=null;w._fieldNotesLayer=null;w._fieldNotesGroupView=null;w._fieldNotesGroupVisible=true;w._fieldNotesGroupRevision=0;w._fieldNotesGroupLoad=null;\n return{w,trace,groups,layers,loads,views,view,Group,Layer,draw:()=>w.drawFieldNoteGraphics(),ensure:v=>w.ensureFieldNotesGroup(v||w.state.jimuMapView.view),clear:()=>w.clearFieldNotesGroup(),group:()=>kind==='baseline'?w._fieldNotesGroup:w._fieldNoteMap.group,layer:()=>kind==='baseline'?w._fieldNotesLayer:w._fieldNoteMap.layer,visible:()=>kind==='baseline'?w._fieldNotesGroupVisible:w._fieldNoteMap.visible,resolve:i=>loads[i].resolve([loads[i].kind==='group'?Group:Layer]),graphicFailure:value=>graphicFailure=value};\n",
              "after": " class Layer{constructor(props){Object.assign(this,props);this.number=layers.length;this.graphics=[];layers.push(this);trace.push(['layer',structuredClone(props)])}removeAll(){this.graphics=[];trace.push(['removeAll',this.number])}add(g){this.graphics.push(g);trace.push(['graphic',this.number,structuredClone(g)])}destroy(){this.destroyed=true;trace.push(['destroy-layer',this.number])}}\n class Graphic{constructor(props){if(graphicFailure)throw Error('graphic failed');Object.assign(this,props)}}\n const load=names=>{trace.push(['load',names]);const d=deferred();d.kind=names[0].includes('GroupLayer')?'group':'layer';loads.push(d);if(!hold)d.resolve([d.kind==='group'?Group:Layer]);return d.promise};\n const Harness=new Function('FieldNoteMap','loadArcGISJSAPIModules','buildLocalNoteGraphic','startNoteHighlight',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.FieldNoteMap,load,descriptor.exports.buildLocalNoteGraphic,async(view,layer,graphic,current)=>{const handle={removed:false,remove(){this.removed=true}};if(current())trace.push(['native-highlight',graphic.attributes.id,handle]);return handle;});const w=new Harness();\n function view(type='3d'){const v={type,destroyed:false,map:{add:g=>trace.push(['map-add',views.indexOf(v),g.number]),remove:g=>trace.push(['map-remove',views.indexOf(v),g.number])}};views.push(v);return v}\n w.state={jimuMapView:{view:view(type)},fieldNotes:[note(),note('B',{source:'mapillary-detection',alt:undefined})]};w.props={config:{sharedFieldNotesUrl:' https://enterprise/notes/ '}};w.ArcGISModules={Graphic};w._sharedNotesDisposed=false;w._sharedNotesLayer=null;w._sharedNotesView=null;w.clearPendingNoteGraphic=()=>trace.push(['pending-clear']);w._fieldNotesGroup=null;w._fieldNotesLayer=null;w._fieldNotesGroupView=null;w._fieldNotesGroupVisible=true;w._fieldNotesGroupRevision=0;w._fieldNotesGroupLoad=null;\n return{w,trace,groups,layers,loads,views,view,Group,Layer,draw:()=>w.drawFieldNoteGraphics(),ensure:v=>w.ensureFieldNotesGroup(v||w.state.jimuMapView.view),clear:()=>w.clearFieldNotesGroup(),group:()=>kind==='baseline'?w._fieldNotesGroup:w._fieldNoteMap.group,layer:()=>kind==='baseline'?w._fieldNotesLayer:w._fieldNoteMap.layer,visible:()=>kind==='baseline'?w._fieldNotesGroupVisible:w._fieldNoteMap.visible,resolve:i=>loads[i].resolve([loads[i].kind==='group'?Group:Layer]),graphicFailure:value=>graphicFailure=value};\n"
            },
            {
              "label": "Note selection and sheet 2",
              "before": " w.focusFieldNote(note('workspace:remote'));w.focusFieldNote(note('local'));await flush();assert.equal(selected[0].id,'workspace:remote');assert.equal(selected[1].id,'local');assert.equal(moves.length,2);assert.deepEqual(moves[0][1],{center:[1,2],zoom:18});\n});\n\ntest('selected diamond is visibly distinct while normal graphics keep their original symbol',()=>{\n const normal=descriptor.exports.buildLocalNoteGraphic(note(),false),selected=descriptor.exports.buildLocalNoteGraphic(note(),false,true);\n assert.equal(normal.symbol.size,13);assert.equal(normal.symbol.outline.color,'white');assert.equal(selected.symbol.size,20);assert.equal(selected.symbol.outline.color,'#45e6ff');assert.equal(selected.symbol.outline.width,3);\n});\ntest('only our local and selected graphics resolve for note click routing',async()=>{\n const h=setup('working');assert.equal(h.w._fieldNoteMap.hasPickTargets,true);await h.draw();\n assert.equal(h.w._fieldNoteMap.noteForGraphic({layer:h.layer(),attributes:{id:'A'}}).id,'A');assert.equal(h.w._fieldNoteMap.noteForGraphic({layer:{},attributes:{id:'A'}}),null);\n",
              "after": " w.focusFieldNote(note('workspace:remote'));w.focusFieldNote(note('local'));await flush();assert.equal(selected[0].id,'workspace:remote');assert.equal(selected[1].id,'local');assert.equal(moves.length,2);assert.deepEqual(moves[0][1],{center:[1,2],zoom:18});\n});\n\ntest('only our local and selected graphics resolve for note click routing',async()=>{\n const h=setup('working');assert.equal(h.w._fieldNoteMap.hasPickTargets,true);await h.draw();\n assert.equal(h.w._fieldNoteMap.noteForGraphic({layer:h.layer(),attributes:{id:'A'}}).id,'A');assert.equal(h.w._fieldNoteMap.noteForGraphic({layer:{},attributes:{id:'A'}}),null);\n"
            },
            {
              "label": "Note selection and sheet 3",
              "before": " assert.equal(h.w._fieldNoteMap.noteForGraphic({layer,attributes:{id:target.id}}),target);\n h.w.state.fieldNotes=[];await h.w._fieldNoteMap.focusNote(null);assert.equal(h.w._fieldNoteMap.hasPickTargets,false);\n});\n",
              "after": " assert.equal(h.w._fieldNoteMap.noteForGraphic({layer,attributes:{id:target.id}}),target);\n h.w.state.fieldNotes=[];await h.w._fieldNoteMap.focusNote(null);assert.equal(h.w._fieldNoteMap.hasPickTargets,false);\n});\n\ntest('native highlight is released on another click while its normal marker stays selectable',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusNote(note('workspace:a'));const event=h.trace.find(x=>x[0]==='native-highlight');assert(event);h.w._fieldNoteMap.clearHighlight();assert.equal(event[2].removed,true);assert.equal(h.layers[0].graphics.length,1);assert.equal(h.layers[0].graphics[0].symbol.size,13);\n});\ntest('clearing while SDK loads prevents a late highlight or popup',async()=>{\n const h=setup('working',{hold:true});const pending=h.w._fieldNoteMap.focusNote(note('workspace:a'));h.resolve(0);await flush();h.w._fieldNoteMap.clearHighlight();h.resolve(1);await pending;assert.equal(h.trace.filter(x=>x[0]==='native-highlight').length,0);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/NOTE-SELECTION-AND-SHEET.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Note selection and sheet 1",
              "before": "# Note selection and expandable sheet\n\n`FieldNoteMap.focusNote` owns one transient selection graphic. Show on map selects it and keeps the existing camera/image navigation. SDK hits on Local/selected workspace markers select it without moving the camera; Enterprise hits keep their existing popup actions and highlight their point. The larger diamond uses a cyan outline. Selecting another note replaces the highlight; cleanup invalidates pending SDK work. This never publishes or saves a local copy.\n\n`mapGraphic.ts` owns selected/normal symbol descriptors. `FieldNotesPanel.tsx` owns the in-memory expanded state. Its native button grip supports touch, mouse, Enter and Space and exposes aria-expanded. Expanded height is 92% of the widget's available height; the default stays capped at 300px/65%. Lists continue to scroll inside the sheet. This is a click/tap toggle, not a draggable resize control.\n\nThe coverage click fast path requests an SDK hit test when note markers are available so note clicks retain priority over imagery. Without note targets, existing coverage picking remains unchanged.\n\n",
              "after": "# Note selection and expandable sheet\n\n`FieldNoteMap.focusNote` owns one transient selection graphic. Show on map selects it and keeps the existing camera/image navigation. SDK hits on Local/selected workspace markers select it without moving the camera; Enterprise hits keep their existing popup actions and highlight their point. The normal diamond keeps its original symbol. `nativeNoteHighlight.ts` uses ArcGIS GraphicsLayerView.highlight and opens the selected graphic's popup. Any new map click clears the owned highlight/popup before picking; closing the popup releases native handles too. Late SDK/popup responses check selection ownership. Enterprise map clicks retain their existing native popup/highlight and action behavior. Selecting another note replaces the highlight; cleanup invalidates pending SDK work. This never publishes or saves a local copy.\n\n`mapGraphic.ts` owns unchanged note symbol descriptors; native selection styling belongs to ArcGIS. `FieldNotesPanel.tsx` owns the in-memory expanded state. Its native button grip supports touch, mouse, Enter and Space and exposes aria-expanded. Expanded height is 92% of the widget's available height; the default stays capped at 300px/65%. Lists continue to scroll inside the sheet. This is a click/tap toggle, not a draggable resize control.\n\nThe coverage click fast path requests an SDK hit test when note markers are available so note clicks retain priority over imagery. Without note targets, existing coverage picking remains unchanged.\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/nativeNoteHighlight.ts",
      "content": "import { loadArcGISJSAPIModules } from 'jimu-arcgis';\n\nexport interface NoteHighlightHandle { remove(): void }\n\n/** Use ArcGIS's layer-view highlight and popup, never a replacement marker symbol.\n * Load SDK readiness before selecting; late results cannot reopen an old popup.\n * Closing the popup releases both handles. The map owner also removes them on\n * another click, a newer selection, view replacement or widget cleanup.\n */\nexport async function startNoteHighlight(\n  view: __esri.MapView | __esri.SceneView,\n  layer: __esri.GraphicsLayer,\n  graphic: __esri.Graphic,\n  current: () => boolean\n): Promise<NoteHighlightHandle> {\n  const [layerView, [reactiveUtils]] = await Promise.all([\n    view.whenLayerView(layer), loadArcGISJSAPIModules(['esri/core/reactiveUtils'])\n  ]);\n  if (!current()) return { remove() {} };\n  const highlight = (layerView as __esri.GraphicsLayerView).highlight(graphic);\n  let watcher: NoteHighlightHandle | undefined;\n  let removed = false;\n  const closeOwnedPopup = () => { if (view.popup?.selectedFeature === graphic) view.closePopup(); };\n  const remove = () => {\n    if (removed) return;\n    removed = true;\n    highlight.remove();\n    watcher?.remove();\n    closeOwnedPopup();\n  };\n  try {\n    watcher = reactiveUtils.watch(() => view.popup?.visible, (visible: boolean | undefined) => {\n      if (visible === false) remove();\n    });\n    // openPopup may return a promise; report rejection without retaining a highlight.\n    const opening = view.openPopup({ features: [graphic], location: graphic.geometry as __esri.Point });\n    if (opening && typeof opening.then === 'function') void opening.then(() => { if (removed || !current()) { remove(); closeOwnedPopup(); } }, remove);\n    if (!current()) remove();\n    return { remove };\n  } catch (error) { remove(); throw error; }\n}\n"
    },
    {
      "file": "tests/nativeNoteHighlight.test.cjs",
      "content": "/** Native ArcGIS adapter with recording SDK handles and controlled readiness. */\nconst fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/features/field-notes/nativeNoteHighlight.ts'),'utf8');\nconst code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{resolve,promise}};\nfunction setup(){\n const ready=deferred(),sdk=deferred(),events=[];let current=true,watch;const graphic={geometry:{type:'point'}};\n const view={popup:{visible:false,selectedFeature:null},whenLayerView:()=>ready.promise,openPopup:options=>{events.push('popup');view.popup.visible=true;view.popup.selectedFeature=options.features[0];},closePopup:()=>{events.push('close');view.popup.visible=false;watch?.(false)}};\n const layerView={highlight:target=>{assert.equal(target,graphic);events.push('highlight');return{remove:()=>events.push('remove-highlight')}}};\n const reactive={watch:(read,callback)=>{watch=callback;return{remove:()=>events.push('remove-watch')}}};const m={exports:{}};\n new Function('require','module','exports',code)(()=>({loadArcGISJSAPIModules:()=>sdk.promise}),m,m.exports);\n return{events,view,graphic,setCurrent:v=>current=v,ready:()=>{ready.resolve(layerView);sdk.resolve([reactive])},start:()=>m.exports.startNoteHighlight(view,{},graphic,()=>current),dismiss:()=>{view.popup.visible=false;watch(false)}};\n}\ntest('selects using layerView.highlight and opens the corresponding native popup',async()=>{const h=setup(),pending=h.start();assert.deepEqual(h.events,[]);h.ready();const handle=await pending;assert.deepEqual(h.events,['highlight','popup']);handle.remove();assert.deepEqual(h.events,['highlight','popup','remove-highlight','remove-watch','close']);handle.remove();assert.equal(h.events.length,5)});\ntest('closing popup releases the highlight and observer',async()=>{const h=setup(),pending=h.start();h.ready();await pending;h.dismiss();assert.equal(h.events.filter(x=>x==='remove-highlight').length,1);assert.equal(h.events.filter(x=>x==='remove-watch').length,1)});\ntest('retired selection cannot highlight or open popup after SDK readiness',async()=>{const h=setup(),pending=h.start();h.setCurrent(false);h.ready();await pending;assert.deepEqual(h.events,[])});\ntest('cleanup does not close a popup owned by another feature',async()=>{const h=setup(),pending=h.start();h.ready();const handle=await pending;h.view.popup.selectedFeature={};handle.remove();assert(!h.events.includes('close'))});\ntest('synchronous popup failure releases all native handles',async()=>{const h=setup();h.view.openPopup=()=>{throw Error('popup unavailable')};const pending=h.start();h.ready();await assert.rejects(pending,{message:'popup unavailable'});assert.deepEqual(h.events,['highlight','remove-highlight','remove-watch'])});\ntest('late asynchronous popup opening checks selection ownership again',async()=>{const h=setup(),opened=deferred();h.view.openPopup=options=>{h.view.popup.selectedFeature=options.features[0];return opened.promise};const pending=h.start();h.ready();await pending;h.setCurrent(false);opened.resolve();await Promise.resolve();assert(h.events.includes('remove-highlight'));assert(h.events.includes('close'))});\n\ntest('popup that finishes opening after handle removal is closed again',async()=>{const h=setup(),opened=deferred();h.view.openPopup=()=>opened.promise;const pending=h.start();h.ready();const handle=await pending;h.setCurrent(false);handle.remove();h.view.popup.selectedFeature=h.graphic;h.view.popup.visible=true;opened.resolve();await Promise.resolve();assert.equal(h.view.popup.visible,false);assert.equal(h.events.filter(x=>x==='remove-highlight').length,1)});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'native-note-highlight-';

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
    if (manifest.installer !== 'native-note-highlight' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-native-note-highlight.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Native note highlight is already installed. No files changed.');
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
  const manifest = { installer: 'native-note-highlight', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Native note highlight ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
