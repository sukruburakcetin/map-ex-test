#!/usr/bin/env node
'use strict';
/** Field-note draft installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 1",
          "before": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { PointCloudAnnotationPicker } from '../features/field-notes/PointCloudAnnotationPicker';\nimport type { AnnotationMapPoint } from '../features/field-notes/PointCloudAnnotationPicker';\n",
          "after": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { FieldNoteDraft } from '../features/field-notes/FieldNoteDraft';\nimport type { PendingFieldNote } from '../features/field-notes/FieldNoteDraft';\nimport { showFieldNoteDraftFeedback } from '../features/field-notes/FieldNoteDraftFeedback';\nimport { PointCloudAnnotationPicker } from '../features/field-notes/PointCloudAnnotationPicker';\nimport type { AnnotationMapPoint } from '../features/field-notes/PointCloudAnnotationPicker';\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 2",
          "before": "  fieldNoteEditor?: FieldNoteEditor | null;\n  fieldNoteAttachments?: FieldNoteAttachments | null;\n  pendingFieldNote: { lon: number; lat: number; imageId: string | null } | null;\n  fieldNotesListOpen: boolean;\n  isGeneratingRoute?: boolean;\n",
          "after": "  fieldNoteEditor?: FieldNoteEditor | null;\n  fieldNoteAttachments?: FieldNoteAttachments | null;\n  pendingFieldNote: PendingFieldNote | null;\n  fieldNotesListOpen: boolean;\n  isGeneratingRoute?: boolean;\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 3",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Resolve annotation coordinates from live retained cloud data; note creation stays with field notes. */\n  private _annotationCloudPick = new PointCloudAnnotationPicker({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind draft intent to existing state, marker, persistence and shared-note publication owners. */\n  private _fieldNoteDraft = new FieldNoteDraft({\n    readState: () => this.state,\n    setState: (update, callback) => this.setState(update, callback),\n    drawRipple: (...args) => this.drawClickRipple(...args),\n    drawPending: (...args) => this.drawPendingNoteGraphic(...args),\n    clearPending: () => this.clearPendingNoteGraphic(),\n    persist: notes => this.saveFieldNotesToStorage(notes),\n    drawMapNotes: () => this.drawFieldNoteGraphics(),\n    updateViewerNotes: () => this.updateViewerFieldNoteMarkers(),\n    publish: id => this.publishFieldNote(id),\n    notify: (kind, enabled) => showFieldNoteDraftFeedback((...args) => this.showToast(...args), kind, enabled),\n    now: () => Date.now(), random: () => Math.random(),\n  });\n  /** Resolve annotation coordinates from live retained cloud data; note creation stays with field notes. */\n  private _annotationCloudPick = new PointCloudAnnotationPicker({\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 4",
          "before": "   * When active, clicks on the map are intercepted to create new field notes.\n   */\n  private toggleAnnotationMode = () => {\n    this.setState(\n      (prev) => ({\n        isAnnotationMode: !prev.isAnnotationMode,\n        pendingFieldNote: null,\n        fieldNotesListOpen: false,\n        nearbyStripOpen: false,\n      }),\n      () => {\n        const isActive = this.state.isAnnotationMode;\n        this.showToast(\n          <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n            <Icons.Notes size={14} />\n            {isActive ? \"Field notes enabled\" : \"Field notes disabled\"}\n          </span>,\n          2000,\n        );\n      },\n    );\n  };\n\n  /**\n   * Draws one projected marker at the selected map location\n",
          "after": "   * When active, clicks on the map are intercepted to create new field notes.\n   */\n  private toggleAnnotationMode = () => this._fieldNoteDraft.toggle();\n  /**\n   * Draws one projected marker at the selected map location\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 5",
          "before": "   * @param alt Optional altitude in meters (from 3D point cloud or terrain).\n   */\n  private handleAnnotationMapClick = (lon: number, lat: number, alt?: number) => {\n    // 1. Show an orange/amber ripple effect at the clicked location\n    this.drawClickRipple(lon, lat, [245, 166, 35], 0.7, 2);\n\n    // 2. Add a temporary pulsing marker on the map while the form remains open\n    this.drawPendingNoteGraphic(lon, lat, alt);\n\n    // 3. Open the note input modal\n    this.setState({\n      pendingFieldNote: { lon, lat, alt, imageId: this.state.imageId },\n    });\n  };\n\n  /**\n   * Submits and saves a pending field note to state, LocalStorage, and 2D/3D renderers.\n",
          "after": "   * @param alt Optional altitude in meters (from 3D point cloud or terrain).\n   */\n  private handleAnnotationMapClick = (lon: number, lat: number, alt?: number) => this._fieldNoteDraft.open(lon, lat, alt);\n  /**\n   * Submits and saves a pending field note to state, LocalStorage, and 2D/3D renderers.\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 6",
          "before": "   * @param note Optional description or comment text.\n   */\n  private submitFieldNote = (category: string, note: string, share = false) => {\n    const { pendingFieldNote } = this.state;\n    if (!pendingFieldNote) return;\n\n    this.clearPendingNoteGraphic();\n\n    const newNote: FieldNote = {\n      id: `note_${Date.now()}_${Math.round(Math.random() * 1000)}`,\n      source: \"manual\",\n      category,\n      note,\n      lon: pendingFieldNote.lon,\n      lat: pendingFieldNote.lat,\n      alt: pendingFieldNote.alt,\n      imageId: pendingFieldNote.imageId,\n      createdAt: Date.now(),\n    };\n\n    const updated = [...this.state.fieldNotes, newNote];\n    this.setState({ fieldNotes: updated, pendingFieldNote: null }, () => {\n      this.saveFieldNotesToStorage(updated);\n      this.drawFieldNoteGraphics();\n      this.updateViewerFieldNoteMarkers();\n      if (share) void this.publishFieldNote(newNote.id);\n      this.showToast(\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" /> Object saved as note\n        </span>,\n        2000,\n      );\n    });\n  };\n\n  /**\n   * Cancels the currently pending field note creation and closes the entry modal.\n   */\n  private cancelPendingFieldNote = () => {\n    this.clearPendingNoteGraphic();\n    this.setState({ pendingFieldNote: null });\n  };\n\n  /**\n   * Deletes a field note by its unique identifier and synchronizes state, storage, and graphics.\n",
          "after": "   * @param note Optional description or comment text.\n   */\n  private submitFieldNote = (category: string, note: string, share = false) => this._fieldNoteDraft.submit(category, note, share);\n  /**\n   * Cancels the currently pending field note creation and closes the entry modal.\n   */\n  private cancelPendingFieldNote = () => this._fieldNoteDraft.cancel();\n  /**\n   * Deletes a field note by its unique identifier and synchronizes state, storage, and graphics.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteDraft",
        "showFieldNoteDraftFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteDraft",
          "count": 7
        },
        {
          "text": "showFieldNoteDraftFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/field-notes/README.md",
      "blocks": [
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 1",
          "before": "| Concern | Entry point |\n| --- | --- |\n| Annotation-mode cloud hits and local altitude estimation | `PointCloudAnnotationPicker.ts` |\n| Controlled note panels, drafts and editor | `NoteToolsSection.tsx`, `NoteDraftForm.tsx`, `NoteEditor.tsx` |\n",
          "after": "| Concern | Entry point |\n| --- | --- |\n| Annotation activation, draft open/submit/cancel and save callback order | `FieldNoteDraft.ts` |\n| Draft mode/saved-note toast wording, icons and durations | `FieldNoteDraftFeedback.tsx` |\n| Annotation-mode cloud hits and local altitude estimation | `PointCloudAnnotationPicker.ts` |\n| Controlled note panels, drafts and editor | `NoteToolsSection.tsx`, `NoteDraftForm.tsx`, `NoteEditor.tsx` |\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 2",
          "before": "| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining activation, draft, SDK and persistence orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n",
          "after": "| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining edit/delete/clear/focus, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 3",
          "before": "\nFunction comments document coordinate units, index policy, authority and catch boundaries. `tests/annotationCloudPicking.test.cjs` compares actual adapters against a frozen original branch with real distance math and held hitTests. It covers exact/fallback coordinates, aliases/visibility, percentile/bbox/radius behavior, cloud replacement, point mutation, errors and click interception. Host smoke checks: 2D/3D note placement on and off cloud points, hidden/empty cloud, sloped terrain and normal route/image/object/note navigation.\n",
          "after": "\nFunction comments document coordinate units, index policy, authority and catch boundaries. `tests/annotationCloudPicking.test.cjs` compares actual adapters against a frozen original branch with real distance math and held hitTests. It covers exact/fallback coordinates, aliases/visibility, percentile/bbox/radius behavior, cloud replacement, point mutation, errors and click interception. Host smoke checks: 2D/3D note placement on and off cloud points, hidden/empty cloud, sloped terrain and normal route/image/object/note navigation.\n\n## Annotation activation and draft coordination\n\n`FieldNoteDraft.ts` coordinates toggle/open/submit/cancel intent through existing React state, marker, storage, rendering and publication adapters. `FieldNoteDraftFeedback.tsx` keeps enable/disable and saved-note feedback together. There is no second draft state, note store, marker owner or publication queue.\n\n- `toggle` uses React previous state, clears the pending draft and closes list/nearby flags. Its callback reads current annotation mode before feedback. It retains the original absence of an explicit marker-cleanup call on toggle.\n- `open` draws the same amber ripple, places the existing pending marker, then captures the current image ID into `{lon, lat, alt, imageId}`. Coordinates are WGS84 degrees; optional altitude remains source meters. `PendingFieldNote` explicitly includes the altitude the runtime already reads/writes.\n- `submit` snapshots the pending draft before clearing the marker. It retains manual-note fields, two Date.now reads and the rounded random ID suffix, then appends to the current local array. The React callback persists that captured array, refreshes map/viewer graphics, optionally starts existing publication without awaiting it, then shows saved feedback.\n- `cancel` clears the marker before clearing draft state, preserving mode/list flags. Empty submit remains a no-op.\n\nPersist return values, publication promise handling, exceptions and independent queued callbacks retain their original behavior. Note payload/storage schema, Enterprise auth/edit/retry paths and controlled form behavior are unchanged. Function comments explain callback phases, coordinate/image capture and owner boundaries.\n\n`tests/fieldNoteDraft.test.cjs` compares actual runtime adapters/feedback against frozen original methods with recorded clocks/randomness, immediate/batched state, storage/marker/publication callbacks and exact payloads. Host checks: Add Note on/off, opening/cancelling, altitude/image association, local save/reload and optional sharing through the existing Enterprise configuration.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteDraft",
        "## Annotation activation and draft coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteDraft",
          "count": 4
        },
        {
          "text": "## Annotation activation and draft coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md annotation cloud picking block 1",
          "before": "Changed: runtime, point-cloud contributor README, ownership document and roadmap. Added: annotation picker/helper, field-note contributor README, 15 baseline-backed cases and frozen original annotation branch. Validation: 294 point-cloud/annotation/playback cases; strict actual adapter/SDK hitTest checks; full TSX parse; surrounding click-host token preservation; guarded installer checks. Host validation remains annotation placement in 2D/3D, exact/off-cloud/hidden-cloud picks, slopes, empty data and normal route/image/object/note navigation.\n\nNext: extract field-note annotation activation and draft coordination while preserving panel state, captured map/viewer coordinates, local/shared note paths, feedback and persistence ownership.\n",
          "after": "Changed: runtime, point-cloud contributor README, ownership document and roadmap. Added: annotation picker/helper, field-note contributor README, 15 baseline-backed cases and frozen original annotation branch. Validation: 294 point-cloud/annotation/playback cases; strict actual adapter/SDK hitTest checks; full TSX parse; surrounding click-host token preservation; guarded installer checks. Host validation remains annotation placement in 2D/3D, exact/off-cloud/hidden-cloud picks, slopes, empty data and normal route/image/object/note navigation.\n\nField-note annotation activation and draft coordination are completed below, with panel state, captured coordinates, local/shared paths and persistence ownership retained.\n\n## Field-note activation and draft coordination\n\nExtracted annotation toggle/open/submit/cancel coordination to `src/features/field-notes/FieldNoteDraft.ts`; existing enable/disable/saved JSX and durations live in `FieldNoteDraftFeedback.tsx`. Runtime is now 13,200 lines (51 fewer), with four forwarding methods and explicit live state/marker/storage/render/publication adapters. Other existing class members remain token-identical; pending marker, persistence, Enterprise helper, controlled form, shared FieldNote type and annotation picker remain byte-identical.\n\nA typed `PendingFieldNote` now includes optional altitude, matching the object already created/read by the runtime; no serialized schema changes. Function comments cover degrees/meters, capture timing, marker-before-state order, two-clock/random note IDs, captured-array persistence and unawaited optional publication. State ownership, callback timing, return/error behavior and existing queued submission semantics are preserved.\n\nChanged: runtime, field-note contributor README and roadmap. Added: draft coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 309 point-cloud/field-note/playback cases; strict draft/feedback/actual adapter checks using the real FieldNote type and local Jimu declarations; full runtime TSX parse; unaffected member/resource preservation and guarded installer checks. Host smoke checks remain mode toggling, open/cancel, note altitude/image association, local save/reload and optional Enterprise sharing.\n\nNext: extract local field-note collection updates and renderer refresh coordination, preserving storage payloads, delete/clear guards, existing UI confirmation ownership and local/shared note separation.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteDraft",
        "## Field-note activation and draft coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteDraft",
          "count": 2
        },
        {
          "text": "## Field-note activation and draft coordination",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/field-notes/FieldNoteDraft.ts",
      "content": "import type { FieldNote } from '../../components/types';\n\n/** Pending map coordinates in WGS84 degrees, optional source altitude in meters and clicked image ID. */\nexport interface PendingFieldNote { lon: number; lat: number; alt?: number; imageId: string | null; }\nexport type FieldNoteDraftNotice = 'mode' | 'saved';\nexport interface FieldNoteDraftState {\n  isAnnotationMode: boolean;\n  imageId: string | null;\n  pendingFieldNote: PendingFieldNote | null;\n  fieldNotes: FieldNote[];\n}\nexport interface FieldNoteDraftPatch {\n  isAnnotationMode?: boolean; pendingFieldNote?: PendingFieldNote | null;\n  fieldNotesListOpen?: boolean; nearbyStripOpen?: boolean; fieldNotes?: FieldNote[];\n}\nexport interface FieldNoteDraftDependencies {\n  readState(): FieldNoteDraftState;\n  setState(update: FieldNoteDraftPatch | ((previous: FieldNoteDraftState) => FieldNoteDraftPatch), callback?: () => void): void;\n  drawRipple(lon: number, lat: number, color: [number, number, number], opacity: number, outlineWidth: number): void;\n  drawPending(lon: number, lat: number, alt?: number): void;\n  clearPending(): void;\n  persist(notes: FieldNote[]): void;\n  drawMapNotes(): void;\n  updateViewerNotes(): void;\n  /** Start the existing shared-note publication without awaiting/retrying it here. */\n  publish(id: string): void;\n  notify(kind: FieldNoteDraftNotice, enabled?: boolean): void;\n  now(): number;\n  random(): number;\n}\n\n/** Coordinate annotation/draft intent while React state, marker resources and persistence stay owned.\n * No local draft mirror, storage, layer, timer, request or publication policy is introduced.\n */\nexport class FieldNoteDraft {\n  constructor(private readonly dependencies: FieldNoteDraftDependencies) {}\n\n  /** Toggle from React previous state, reset draft/list/nearby flags, then report live mode state.\n   * Preserve the original behavior: toggling does not add an explicit pending-marker cleanup call.\n   */\n  toggle(): void {\n    const d = this.dependencies;\n    d.setState(previous => ({ isAnnotationMode: !previous.isAnnotationMode,\n      pendingFieldNote: null, fieldNotesListOpen: false, nearbyStripOpen: false }),\n      () => d.notify('mode', d.readState().isAnnotationMode));\n  }\n\n  /** Draw ripple, draw the pending marker, then capture the current image ID into the draft.\n   * Preserve optional altitude and coordinate values; projection/marker lifecycle stay outside.\n   */\n  open(lon: number, lat: number, alt?: number): void {\n    const d = this.dependencies;\n    d.drawRipple(lon, lat, [245, 166, 35], 0.7, 2);\n    d.drawPending(lon, lat, alt);\n    d.setState({ pendingFieldNote: { lon, lat, alt, imageId: d.readState().imageId } });\n  }\n\n  /** Capture the pending draft, clear its marker, and create the same manual-note shape and ID.\n   * Keep two clock reads (ID and createdAt), the rounded random suffix and existing array append.\n   * The state callback persists the captured array, refreshes map/viewer, optionally publishes,\n   * then emits saved feedback. Persistence return values and publication promises remain unawaited.\n   */\n  submit(category: string, note: string, share = false): void {\n    const d = this.dependencies;\n    const { pendingFieldNote } = d.readState();\n    if (!pendingFieldNote) return;\n    d.clearPending();\n    const newNote: FieldNote = {\n      id: `note_${d.now()}_${Math.round(d.random() * 1000)}`,\n      source: 'manual', category, note,\n      lon: pendingFieldNote.lon, lat: pendingFieldNote.lat, alt: pendingFieldNote.alt,\n      imageId: pendingFieldNote.imageId, createdAt: d.now(),\n    };\n    const updated = [...d.readState().fieldNotes, newNote];\n    d.setState({ fieldNotes: updated, pendingFieldNote: null }, () => {\n      d.persist(updated); d.drawMapNotes(); d.updateViewerNotes();\n      if (share) void d.publish(newNote.id);\n      d.notify('saved');\n    });\n  }\n\n  /** Release the pending marker before clearing draft state; preserve mode/list flags. */\n  cancel(): void {\n    const d = this.dependencies;\n    d.clearPending(); d.setState({ pendingFieldNote: null });\n  }\n}\n"
    },
    {
      "file": "src/features/field-notes/FieldNoteDraftFeedback.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { FieldNoteDraftNotice } from './FieldNoteDraft';\n\n/** Preserve annotation enable/disable and saved-note wording, icons and 2000 ms duration. */\nexport function showFieldNoteDraftFeedback(showToast: (content: React.ReactNode, duration?: number) => void, kind: FieldNoteDraftNotice, enabled?: boolean): void {\n  if (kind === 'mode') {\n    const isActive = enabled;\n    showToast(\n          <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n            <Icons.Notes size={14} />\n            {isActive ? \"Field notes enabled\" : \"Field notes disabled\"}\n          </span>,\n          2000,\n        );\n    return;\n  }\n  showToast(\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" /> Object saved as note\n        </span>,\n        2000,\n      );\n}\n"
    },
    {
      "file": "tests/fieldNoteDraft.test.cjs",
      "content": "/** Frozen original annotation/draft methods versus actual feature and feedback adapters.\n * Recording clocks, marker/storage/publication callbacks and React queues verify ordering and payloads.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/fieldNoteDraft.baseline.json','utf8'));const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['toggleAnnotationMode','handleAnnotationMapClick','submitFieldNote','cancelPendingFieldNote'];const actual=['_fieldNoteDraft',...names].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nfunction setup(kind,{batched=false,random=.1234}={}){\n const trace=[],updaters=[],callbacks=[];let time=1000,persistHook=()=>true,markerHook=()=>{},clearHook=()=>{},publishHook=()=>{};\n const Date={now:()=>{const value=time++;trace.push(['now',value]);return value}},MathMock=Object.create(Math);MathMock.random=()=>{trace.push(['random',random]);return random};\n const jsx=(tag,props,...children)=>({tag,props:props||{},children}),Icons={Notes:'notes',Check:'check'};\n const m={exports:{}};new Function('module','exports','Math',compile(fs.readFileSync(root+'/src/features/field-notes/FieldNoteDraft.ts','utf8')))(m,m.exports,MathMock);\n const feedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/FieldNoteDraftFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx}:Icons,feedback,feedback.exports);\n const Harness=new Function('FieldNoteDraft','showFieldNoteDraftFeedback','Date','Math','jsx','Icons',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(m.exports.FieldNoteDraft,feedback.exports.showFieldNoteDraftFeedback,Date,MathMock,jsx,Icons);const w=new Harness();\n const existing={id:'existing',source:'manual',category:'Other',note:'old',lon:1,lat:2,imageId:'old',createdAt:1};w.state={isAnnotationMode:false,imageId:'image-A',pendingFieldNote:{lon:10,lat:20,alt:30,imageId:'picked-image'},fieldNotes:[existing],fieldNotesListOpen:true,nearbyStripOpen:true};\n w.setState=(update,callback)=>{const run=()=>{const patch=typeof update==='function'?update(w.state):update;trace.push(['state',structuredClone(patch)]);Object.assign(w.state,patch);if(batched){if(callback)callbacks.push(callback)}else callback?.()};if(batched)updaters.push(run);else run()};w.showToast=(...args)=>trace.push(['toast',...args]);w.drawClickRipple=(...args)=>trace.push(['ripple',...args]);w.drawPendingNoteGraphic=(...args)=>{trace.push(['pending',...args]);markerHook()};w.clearPendingNoteGraphic=()=>{trace.push(['clearPending']);clearHook()};\n w.saveFieldNotesToStorage=notes=>{trace.push(['persist',structuredClone(notes)]);return persistHook(notes)};w.drawFieldNoteGraphics=()=>trace.push(['map']);w.updateViewerFieldNoteMarkers=()=>trace.push(['viewer']);w.publishFieldNote=id=>{trace.push(['publish',id]);return publishHook(id)};\n return{w,trace,existing,patches:()=>{while(updaters.length)updaters.shift()()},callbacks:()=>{while(callbacks.length)callbacks.shift()()},onMarker:fn=>markerHook=fn,onClear:fn=>clearHook=fn,onPersist:fn=>persistHook=fn,onPublish:fn=>publishHook=fn};\n}\nfunction compare(run,options){const a=setup('baseline',options),b=setup('working',options);run(a);run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b}\ntest('annotation toggle resets draft/list/nearby flags with original enable/disable feedback',()=>{compare(h=>{h.w.toggleAnnotationMode();assert.equal(h.w.state.isAnnotationMode,true);assert.equal(h.w.state.pendingFieldNote,null);assert.equal(h.w.state.fieldNotesListOpen,false);assert.equal(h.w.state.nearbyStripOpen,false);h.w.toggleAnnotationMode();assert.equal(h.w.state.isAnnotationMode,false)})});\ntest('toggle callback reads current mode after queued state commits',()=>{compare(h=>{h.w.toggleAnnotationMode();h.w.toggleAnnotationMode();h.patches();h.callbacks();assert.equal(h.w.state.isAnnotationMode,false);assert.equal(h.trace.filter(x=>x[0]==='toast').length,2)},{batched:true})});\ntest('open preserves ripple/marker/state order, optional altitude and post-marker image capture',()=>{for(const alt of [undefined,0,-15,30])compare(h=>{h.onMarker(()=>h.w.state.imageId='marker-time-image');h.w.handleAnnotationMapClick(3,4,alt);assert.deepEqual(h.trace.slice(0,2),[['ripple',3,4,[245,166,35],.7,2],['pending',3,4,alt]]);assert.deepEqual(h.w.state.pendingFieldNote,{lon:3,lat:4,alt,imageId:'marker-time-image'})})});\ntest('submission without pending draft performs no marker/storage/publication/feedback work',()=>{compare(h=>{h.w.state.pendingFieldNote=null;h.w.submitFieldNote('Other','none',true);assert.equal(h.trace.length,0)})});\ntest('local save preserves exact manual note payload, two clocks and captured draft image ID',()=>{compare(h=>{h.w.submitFieldNote('Damage','text');const note=h.w.state.fieldNotes[1];assert.deepEqual(note,{id:'note_1000_123',source:'manual',category:'Damage',note:'text',lon:10,lat:20,alt:30,imageId:'picked-image',createdAt:1001});assert.strictEqual(h.w.state.fieldNotes[0],h.existing);assert.deepEqual(h.trace.map(x=>x[0]),['clearPending','now','random','now','state','persist','map','viewer','toast'])})});\ntest('share starts existing publication after graphics without awaiting it before feedback',()=>{compare(h=>{h.onPublish(()=>new Promise(()=>{}));h.w.submitFieldNote('Other','shared',true);assert.deepEqual(h.trace.slice(-5).map(x=>x[0]),['persist','map','viewer','publish','toast'])})});\ntest('queued submit callback persists captured append array rather than replacement live list',()=>{compare(h=>{h.w.submitFieldNote('Other','queued');assert(!h.trace.some(x=>x[0]==='persist'));h.patches();h.w.state.fieldNotes=[];h.callbacks();assert.equal(h.trace.find(x=>x[0]==='persist')[1].length,2)},{batched:true})});\ntest('submit retains pending snapshot captured before marker cleanup mutates live draft',()=>{compare(h=>{h.onClear(()=>h.w.state.pendingFieldNote={lon:99,lat:88,imageId:'new'});h.w.submitFieldNote('Other','snapshot');assert.equal(h.w.state.fieldNotes[1].lon,10);assert.equal(h.w.state.fieldNotes[1].imageId,'picked-image')})});\ntest('cancel clears marker before draft state and preserves mode/list flags',()=>{compare(h=>{h.w.state.isAnnotationMode=true;h.w.cancelPendingFieldNote();assert.deepEqual(h.trace,[['clearPending'],['state',{pendingFieldNote:null}]]);assert.equal(h.w.state.isAnnotationMode,true);assert.equal(h.w.state.fieldNotesListOpen,true)})});\ntest('mode toggle retains original absence of explicit marker cleanup',()=>{compare(h=>{h.w.toggleAnnotationMode();assert(!h.trace.some(x=>x[0]==='clearPending'))})});\ntest('false persistence return retains original map/viewer/publication and saved feedback',()=>{compare(h=>{h.onPersist(()=>false);h.w.submitFieldNote('Other','persist false',true);assert.deepEqual(h.trace.slice(-5).map(x=>x[0]),['persist','map','viewer','publish','toast'])})});\ntest('persistence exception keeps original propagation and stops later callback work',()=>{compare(h=>{h.onPersist(()=>{throw Error('storage failed')});assert.throws(()=>h.w.submitFieldNote('Other','failure'),{message:'storage failed'});assert(!h.trace.some(x=>['map','viewer','toast'].includes(x[0])))})});\ntest('rapid queued submissions retain independent captured arrays and publication intent',()=>{compare(h=>{h.w.submitFieldNote('First','one');h.w.submitFieldNote('Second','two',true);h.patches();h.callbacks();assert.equal(h.trace.filter(x=>x[0]==='persist').length,2);assert.equal(h.trace.filter(x=>x[0]==='publish').length,1)},{batched:true})});\ntest('ID suffix rounding and optional altitude/null image remain byte-for-byte payload compatible',()=>{for(const random of [0,.00049,.0005,.99999])compare(h=>{h.w.state.pendingFieldNote={lon:0,lat:0,imageId:null};h.w.submitFieldNote('','');assert.equal(h.w.state.fieldNotes[1].id,'note_1000_'+Math.round(random*1000));assert.equal(h.w.state.fieldNotes[1].alt,undefined);assert.equal(h.w.state.fieldNotes[1].imageId,null)},{random})});\ntest('saved and mode feedback preserve original JSX/icon properties and 2000ms duration',()=>{compare(h=>{h.w.toggleAnnotationMode();h.w.handleAnnotationMapClick(1,2);h.w.submitFieldNote('Other','');assert(h.trace.filter(x=>x[0]==='toast').every(x=>x[2]===2000))})});\n"
    },
    {
      "file": "tests/fixtures/fieldNoteDraft.baseline.json",
      "content": "{\n  \"handlers\": \"  private toggleAnnotationMode = () => {\\n    this.setState(\\n      (prev) => ({\\n        isAnnotationMode: !prev.isAnnotationMode,\\n        pendingFieldNote: null,\\n        fieldNotesListOpen: false,\\n        nearbyStripOpen: false,\\n      }),\\n      () => {\\n        const isActive = this.state.isAnnotationMode;\\n        this.showToast(\\n          <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n            <Icons.Notes size={14} />\\n            {isActive ? \\\"Field notes enabled\\\" : \\\"Field notes disabled\\\"}\\n          </span>,\\n          2000,\\n        );\\n      },\\n    );\\n  };\\n\\n  private handleAnnotationMapClick = (lon: number, lat: number, alt?: number) => {\\n    // 1. Show an orange/amber ripple effect at the clicked location\\n    this.drawClickRipple(lon, lat, [245, 166, 35], 0.7, 2);\\n\\n    // 2. Add a temporary pulsing marker on the map while the form remains open\\n    this.drawPendingNoteGraphic(lon, lat, alt);\\n\\n    // 3. Open the note input modal\\n    this.setState({\\n      pendingFieldNote: { lon, lat, alt, imageId: this.state.imageId },\\n    });\\n  };\\n\\n  private submitFieldNote = (category: string, note: string, share = false) => {\\n    const { pendingFieldNote } = this.state;\\n    if (!pendingFieldNote) return;\\n\\n    this.clearPendingNoteGraphic();\\n\\n    const newNote: FieldNote = {\\n      id: `note_${Date.now()}_${Math.round(Math.random() * 1000)}`,\\n      source: \\\"manual\\\",\\n      category,\\n      note,\\n      lon: pendingFieldNote.lon,\\n      lat: pendingFieldNote.lat,\\n      alt: pendingFieldNote.alt,\\n      imageId: pendingFieldNote.imageId,\\n      createdAt: Date.now(),\\n    };\\n\\n    const updated = [...this.state.fieldNotes, newNote];\\n    this.setState({ fieldNotes: updated, pendingFieldNote: null }, () => {\\n      this.saveFieldNotesToStorage(updated);\\n      this.drawFieldNoteGraphics();\\n      this.updateViewerFieldNoteMarkers();\\n      if (share) void this.publishFieldNote(newNote.id);\\n      this.showToast(\\n        <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n          <Icons.Check size={14} color=\\\"#37d582\\\" /> Object saved as note\\n        </span>,\\n        2000,\\n      );\\n    });\\n  };\\n\\n  private cancelPendingFieldNote = () => {\\n    this.clearPendingNoteGraphic();\\n    this.setState({ pendingFieldNote: null });\\n  };\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'field-note-draft-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
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

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-field-note-draft.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited draft references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Field-note draft is already uninstalled. No files changed.' : 'Field-note draft is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
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
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'field-note-draft', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Field-note draft ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Field-note draft flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
