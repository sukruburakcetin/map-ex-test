#!/usr/bin/env node
'use strict';
/** Local-note collection installer. Plain source payload.
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
          "before": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { FieldNoteDraft } from '../features/field-notes/FieldNoteDraft';\nimport type { PendingFieldNote } from '../features/field-notes/FieldNoteDraft';\n",
          "after": "import { pointCloudCorridorBasis, preparePointCloudMapGeometry } from '../features/point-cloud/pointCloudGeometry';\nimport { pointCloudMapRenderer } from '../features/point-cloud/pointCloudMapPolicy';\nimport { LocalNoteCollection } from '../features/field-notes/LocalNoteCollection';\nimport { showLocalNotesClearedFeedback } from '../features/field-notes/LocalNoteCollectionFeedback';\nimport { FieldNoteDraft } from '../features/field-notes/FieldNoteDraft';\nimport type { PendingFieldNote } from '../features/field-notes/FieldNoteDraft';\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind draft intent to existing state, marker, persistence and shared-note publication owners. */\n  private _fieldNoteDraft = new FieldNoteDraft({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Coordinate local collection changes; storage, graphics and shared-save authority stay separate. */\n  private _localNoteCollection = new LocalNoteCollection({\n    readNotes: () => this.state.fieldNotes,\n    isSaving: id => this._sharedNoteSaves.has(id),\n    anySaving: () => !!this._sharedNoteSaves.size,\n    isEditing: () => !!this.state.fieldNoteEditor?.saving,\n    restore: applyNotes => restoreLocalNotes(this.FIELD_NOTES_STORAGE_KEY, applyNotes),\n    persist: notes => this.saveFieldNotesToStorage(notes),\n    setNotes: (notes, callback) => this.setState({ fieldNotes: notes }, callback),\n    drawMapNotes: () => this.drawFieldNoteGraphics(),\n    updateViewerNotes: () => this.updateViewerFieldNoteMarkers(),\n    notifyCleared: () => showLocalNotesClearedFeedback((...args) => this.showToast(...args), this.props.config.sharedFieldNotesEnabled),\n  });\n  /** Bind draft intent to existing state, marker, persistence and shared-note publication owners. */\n  private _fieldNoteDraft = new FieldNoteDraft({\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 3",
          "before": "  };\n\n  private loadFieldNotesFromStorage() {\n    restoreLocalNotes(this.FIELD_NOTES_STORAGE_KEY, notes => {\n      this.setState({ fieldNotes: notes }, () => {\n        this.drawFieldNoteGraphics();\n        this.updateViewerFieldNoteMarkers();\n      });\n    });\n  }\n\n  /**\n",
          "after": "  };\n\n  /** Restore via the existing storage helper, then refresh both note renderers after state commits. */\n  private loadFieldNotesFromStorage() { this._localNoteCollection.load(); }\n\n  /**\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 4",
          "before": "   * @param id Unique identifier of the note to remove.\n   */\n  private deleteFieldNote = (id: string) => {\n    if (this._sharedNoteSaves.has(id) || this.state.fieldNoteEditor?.saving) return;\n    const updated = this.state.fieldNotes.filter((n) => n.id !== id);\n    this.setState({ fieldNotes: updated }, () => {\n      this.saveFieldNotesToStorage(updated);\n      this.drawFieldNoteGraphics();\n      this.updateViewerFieldNoteMarkers();\n    });\n  };\n\n  /**\n   * Clears all field notes, removes them from LocalStorage,\n   * and clears the 2D map graphics & 3D viewer markers.\n   */\n  private clearAllFieldNotes = () => {\n    if (!this.state.fieldNotes.length || this._sharedNoteSaves.size || this.state.fieldNoteEditor?.saving) return;\n\n    // the button handles confirmation\n    this.setState({ fieldNotes: [] }, () => {\n      this.saveFieldNotesToStorage([]);\n      this.drawFieldNoteGraphics();\n      this.updateViewerFieldNoteMarkers();\n      this.showToast(\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" /> {this.props.config.sharedFieldNotesEnabled ? \"Local notes cleared. Enterprise notes remain.\" : \"Local notes cleared.\"}\n        </span>,\n        2000,\n      );\n    });\n  };\n  /**\n   * Centers the ArcGIS map on the selected field note and navigates\n   * the Mapillary viewer to the associated image if one exists.\n",
          "after": "   * @param id Unique identifier of the note to remove.\n   */\n  private deleteFieldNote = (id: string) => this._localNoteCollection.remove(id);\n  /**\n   * Clears local notes by persisting an empty array and refreshing map/viewer graphics.\n   * The existing button owns confirmation; Enterprise notes remain unchanged.\n   */\n  private clearAllFieldNotes = () => this._localNoteCollection.clear();  /**\n   * Centers the ArcGIS map on the selected field note and navigates\n   * the Mapillary viewer to the associated image if one exists.\n"
        }
      ],
      "absentAfterUninstall": [
        "LocalNoteCollection",
        "showLocalNotesClearedFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "LocalNoteCollection",
          "count": 4
        },
        {
          "text": "showLocalNotesClearedFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/field-notes/README.md",
      "blocks": [
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 1",
          "before": "| Concern | Entry point |\n| --- | --- |\n| Annotation activation, draft open/submit/cancel and save callback order | `FieldNoteDraft.ts` |\n| Draft mode/saved-note toast wording, icons and durations | `FieldNoteDraftFeedback.tsx` |\n",
          "after": "| Concern | Entry point |\n| --- | --- |\n| Local restore/delete/clear guards and state/storage/renderer order | `LocalNoteCollection.ts` |\n| Local-clear feedback and Enterprise reminder | `LocalNoteCollectionFeedback.tsx` |\n| Annotation activation, draft open/submit/cancel and save callback order | `FieldNoteDraft.ts` |\n| Draft mode/saved-note toast wording, icons and durations | `FieldNoteDraftFeedback.tsx` |\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 2",
          "before": "| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining edit/delete/clear/focus, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n",
          "after": "| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining edit/focus, import/export, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 3",
          "before": "\n`tests/fieldNoteDraft.test.cjs` compares actual runtime adapters/feedback against frozen original methods with recorded clocks/randomness, immediate/batched state, storage/marker/publication callbacks and exact payloads. Host checks: Add Note on/off, opening/cancelling, altitude/image association, local save/reload and optional sharing through the existing Enterprise configuration.\n",
          "after": "\n`tests/fieldNoteDraft.test.cjs` compares actual runtime adapters/feedback against frozen original methods with recorded clocks/randomness, immediate/batched state, storage/marker/publication callbacks and exact payloads. Host checks: Add Note on/off, opening/cancelling, altitude/image association, local save/reload and optional sharing through the existing Enterprise configuration.\n\n## Local collection updates\n\n`LocalNoteCollection.ts` coordinates local restore/delete/clear only. Runtime retains the authoritative notes array and supplies existing persistence, shared-save/editor guards and renderer callbacks. `localPersistence.ts` still owns storage keys, parsing/interrupted-save normalization, serialization and quota recovery. No collection mirror, storage API, renderer, confirmation dialog or Enterprise deletion is owned by this coordinator.\n\n- `load` applies the same restored array, then refreshes map/viewer in the React callback. It does not write the restored data again or change the helper's error scope.\n- `remove(id)` checks only that ID's active shared save plus active editor saving. Other IDs' saves do not block deletion. Filter the current array and persist the captured filtered array after state commits, followed by map/viewer refresh. Unknown IDs and duplicate IDs keep their existing filter/refresh behavior.\n- `clear` requires nonempty local notes, no shared saves at all and no editor save. The existing button owns confirmation. State and persistence receive their original separate empty arrays; the callback keeps persist \u2192 map \u2192 viewer \u2192 feedback order.\n- Feedback reads the live sharing configuration after renderer callbacks and retains the 2000 ms local-only/Enterprise-reminder wording. Enterprise records are never deleted by these paths.\n\nPersistence false returns, synchronous exceptions, queued callback behavior and accepted-operation guard timing are unchanged. Draft creation, imports and shared edits keep their own write paths and ownership. Function comments explain callback phases, array authority and guards.\n\n`tests/localNoteCollection.test.cjs` compares actual adapters against frozen original methods using real persistence helpers with memory storage. Tests cover payloads/source identity, per-ID versus global guards, unknown/duplicate IDs, missing/malformed storage, interrupted shared saves, queued/live callbacks, storage/draw failures and clear feedback. Host checks: restore after refresh, individual delete, confirmed local clear, blocked save/editor actions and Enterprise-note preservation.\n"
        }
      ],
      "absentAfterUninstall": [
        "LocalNoteCollection",
        "## Local collection updates"
      ],
      "requiredOccurrences": [
        {
          "text": "LocalNoteCollection",
          "count": 3
        },
        {
          "text": "## Local collection updates",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md annotation cloud picking block 1",
          "before": "Changed: runtime, field-note contributor README and roadmap. Added: draft coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 309 point-cloud/field-note/playback cases; strict draft/feedback/actual adapter checks using the real FieldNote type and local Jimu declarations; full runtime TSX parse; unaffected member/resource preservation and guarded installer checks. Host smoke checks remain mode toggling, open/cancel, note altitude/image association, local save/reload and optional Enterprise sharing.\n\nNext: extract local field-note collection updates and renderer refresh coordination, preserving storage payloads, delete/clear guards, existing UI confirmation ownership and local/shared note separation.\n",
          "after": "Changed: runtime, field-note contributor README and roadmap. Added: draft coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 309 point-cloud/field-note/playback cases; strict draft/feedback/actual adapter checks using the real FieldNote type and local Jimu declarations; full runtime TSX parse; unaffected member/resource preservation and guarded installer checks. Host smoke checks remain mode toggling, open/cancel, note altitude/image association, local save/reload and optional Enterprise sharing.\n\nLocal field-note collection updates are completed below, with storage payloads, delete/clear guards, confirmation ownership and local/shared separation retained.\n\n## Local field-note collection coordination\n\nExtracted restore/delete/clear orchestration to `src/features/field-notes/LocalNoteCollection.ts` and existing clear feedback to `LocalNoteCollectionFeedback.tsx`. Runtime is now 13,184 lines (16 fewer), with three forwarding methods and live state/guard/persistence/renderer adapters. Other existing class members are token-identical; storage helpers, shared FieldNote types, draft coordinator, controlled list and Enterprise helpers remain byte-identical.\n\nFunction comments document current-array borrowing, per-ID versus all-save guards, captured callback payloads, restore error scope, original separate empty arrays, confirmation ownership and local-only behavior. No storage schema, quota recovery, shared-note operation, callback scheduling/error policy, duplicate store, request or SDK resource is introduced. The runtime clear comment now accurately describes persisting an empty array rather than removing the storage key.\n\nChanged: runtime, field-note contributor README and roadmap. Added: collection coordinator, clear-feedback module, 15 baseline-backed cases and frozen original methods. Validation: 324 point-cloud/field-note/playback cases; strict actual collection/persistence/feedback boundary checks with real FieldNote/Editor types and local Jimu declarations; full runtime TSX parse; unaffected member/helper preservation and guarded installer checks. Host smoke checks remain restore/delete/confirmed local clear, shared-save/editor guards and Enterprise record preservation.\n\nNext: extract field-note GeoJSON import/export orchestration while preserving format conversion, duplicate-ID handling, file-reader/download behavior, persistence and feedback order.\n"
        }
      ],
      "absentAfterUninstall": [
        "LocalNoteCollection",
        "## Local field-note collection coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "LocalNoteCollection",
          "count": 2
        },
        {
          "text": "## Local field-note collection coordination",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/field-notes/LocalNoteCollection.ts",
      "content": "import type { FieldNote } from '../../components/types';\n\nexport interface LocalNoteCollectionDependencies {\n  /** Borrow the current local array; no second collection is retained by this coordinator. */\n  readNotes(): FieldNote[];\n  isSaving(id: string): boolean;\n  anySaving(): boolean;\n  isEditing(): boolean;\n  /** Existing helper owns parsing/interrupted-save normalization and its catch scope. */\n  restore(applyNotes: (notes: FieldNote[]) => void): void;\n  persist(notes: FieldNote[]): void;\n  setNotes(notes: FieldNote[], callback: () => void): void;\n  drawMapNotes(): void;\n  updateViewerNotes(): void;\n  notifyCleared(): void;\n}\n\n/** Coordinate local restore/delete/clear through existing persistence and rendering callbacks.\n * No browser storage, array mirror, SDK layer, Enterprise deletion, confirmation UI or request is owned.\n * Keep state-callback boundaries and existing guard/return/error behavior unchanged.\n */\nexport class LocalNoteCollection {\n  constructor(private readonly dependencies: LocalNoteCollectionDependencies) {}\n\n  /** Apply exactly the restored array, then redraw map and viewer after the state commit.\n   * Do not persist it again or add guards; restore's existing helper retains its failure policy.\n   */\n  load(): void {\n    const d = this.dependencies;\n    d.restore(notes => d.setNotes(notes, () => {\n      d.drawMapNotes(); d.updateViewerNotes();\n    }));\n  }\n\n  /** Block deletion only for this note's shared save or an active editor save.\n   * Filter the current local array, preserving source object identity/order, then persist that\n   * captured array before map/viewer refresh. Unknown IDs retain the existing refresh behavior.\n   */\n  remove(id: string): void {\n    const d = this.dependencies;\n    if (d.isSaving(id) || d.isEditing()) return;\n    const updated = d.readNotes().filter(note => note.id !== id);\n    d.setNotes(updated, () => {\n      d.persist(updated); d.drawMapNotes(); d.updateViewerNotes();\n    });\n  }\n\n  /** Clear local notes only when nonempty and no shared/editor save is active.\n   * Confirmation stays with the existing button. Keep separate empty arrays for state/storage,\n   * then map/viewer refresh and callback-time feedback; Enterprise notes are never deleted here.\n   */\n  clear(): void {\n    const d = this.dependencies;\n    if (!d.readNotes().length || d.anySaving() || d.isEditing()) return;\n    d.setNotes([], () => {\n      d.persist([]); d.drawMapNotes(); d.updateViewerNotes(); d.notifyCleared();\n    });\n  }\n}\n"
    },
    {
      "file": "src/features/field-notes/LocalNoteCollectionFeedback.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\n\n/** Keep local-only clear wording and optional Enterprise reminder at the original 2000 ms duration. */\nexport function showLocalNotesClearedFeedback(showToast: (content: React.ReactNode, duration?: number) => void, sharingEnabled?: boolean): void {\n  showToast(\n        <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n          <Icons.Check size={14} color=\"#37d582\" /> {sharingEnabled ? \"Local notes cleared. Enterprise notes remain.\" : \"Local notes cleared.\"}\n        </span>,\n        2000,\n      );\n}\n"
    },
    {
      "file": "tests/localNoteCollection.test.cjs",
      "content": "/** Compare original collection methods with actual runtime adapters and unchanged storage helpers.\n * Memory storage, shared-save guards and split React queues expose payloads and callback ordering.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/localNoteCollection.baseline.json','utf8'));const source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const names=['loadFieldNotesFromStorage','deleteFieldNote','clearAllFieldNotes'];const actual=['_localNoteCollection',...names].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n'),save=cl.members.find(n=>n.name?.getText(sf)==='saveFieldNotesToStorage').getText(sf);\nconst constantSource=ts.createSourceFile('constants.ts',fs.readFileSync(root+'/src/utils/constants.ts','utf8'),ts.ScriptTarget.Latest,true);const constant=constantSource.statements.find(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(constantSource)==='CACHE_KEYS'));const CACHE_KEYS=new Function(compile(constant.getText(constantSource).replace(/^export /,'')+';return CACHE_KEYS;'))();\nconst note=(id='A',extra={})=>({id,source:'manual',category:'Other',note:'text',lon:1,lat:2,alt:3,imageId:'image',createdAt:1,...extra});\nfunction setup(kind,{batched=false}={}){\n const trace=[],patches=[],callbacks=[],data=new Map();let setFailure=null,getFailure=null,drawHook=()=>{};\n const localStorage={getItem:key=>{trace.push(['get',key]);if(getFailure)throw getFailure;return data.get(key)||null},setItem:(key,value)=>{trace.push(['put',key,value]);if(setFailure)throw setFailure;data.set(key,value)},get length(){return data.size},key:i=>[...data.keys()][i]??null,removeItem:key=>{trace.push(['removeKey',key]);data.delete(key)}};\n const console={warn:(message,error)=>trace.push(['warn',message,error.message])};const persistence={exports:{}};new Function('require','module','exports','localStorage','console',compile(fs.readFileSync(root+'/src/features/field-notes/localPersistence.ts','utf8')))(()=>({CACHE_KEYS}),persistence,persistence.exports,localStorage,console);\n const m={exports:{}};new Function('module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/LocalNoteCollection.ts','utf8')))(m,m.exports);\n const jsx=(tag,props,...children)=>({tag,props:props||{},children}),Icons={Check:'check'};const feedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/LocalNoteCollectionFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx}:Icons,feedback,feedback.exports);\n const Harness=new Function('LocalNoteCollection','showLocalNotesClearedFeedback','restoreLocalNotes','persistLocalNotes','jsx','Icons',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+save+'};return Widget;'))(m.exports.LocalNoteCollection,feedback.exports.showLocalNotesClearedFeedback,persistence.exports.restoreLocalNotes,persistence.exports.persistLocalNotes,jsx,Icons);const w=new Harness();\n const notes=[note('A'),note('B')];w.state={fieldNotes:notes,fieldNoteEditor:null};w.props={config:{sharedFieldNotesEnabled:false}};w._sharedNoteSaves=new Set();w.FIELD_NOTES_STORAGE_KEY='mly_field_notes_v1';\n w.setState=(patch,callback)=>{trace.push(['state',structuredClone(patch)]);const run=()=>{Object.assign(w.state,patch);if(batched)callbacks.push(callback);else callback()};if(batched)patches.push(run);else run()};w.drawFieldNoteGraphics=()=>{trace.push(['map']);drawHook()};w.updateViewerFieldNoteMarkers=()=>trace.push(['viewer']);w.showToast=(...args)=>trace.push(['toast',...args]);\n return{w,trace,data,notes,patches:()=>{while(patches.length)patches.shift()()},callbacks:()=>{while(callbacks.length)callbacks.shift()()},failSet:error=>setFailure=error,failGet:error=>getFailure=error,onDraw:fn=>drawHook=fn,load:()=>w.loadFieldNotesFromStorage(),remove:id=>w.deleteFieldNote(id),clear:()=>w.clearAllFieldNotes()};\n}\nfunction compare(run,options){const a=setup('baseline',options),b=setup('working',options);run(a);run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);assert.deepEqual([...b.data],[...a.data]);return b}\ntest('delete preserves local array/source identity and persistence before map/viewer updates',()=>{compare(h=>{h.remove('A');assert.equal(h.w.state.fieldNotes.length,1);assert.strictEqual(h.w.state.fieldNotes[0],h.notes[1]);assert.deepEqual(h.trace.map(x=>x[0]),['state','put','map','viewer'])})});\ntest('delete is blocked only by same-ID shared save or active editor save',()=>{for(const mode of ['same','other','editor'])compare(h=>{if(mode==='same')h.w._sharedNoteSaves.add('A');if(mode==='other')h.w._sharedNoteSaves.add('B');if(mode==='editor')h.w.state.fieldNoteEditor={saving:true};h.remove('A');assert.equal(h.trace.length===0,mode!=='other')})});\ntest('unknown IDs and duplicate IDs retain original filter and refresh semantics',()=>{for(const id of ['missing','A'])compare(h=>{h.w.state.fieldNotes=[h.notes[0],h.notes[0],h.notes[1]];h.remove(id);assert.equal(h.w.state.fieldNotes.length,id==='A'?1:3);assert.deepEqual(h.trace.map(x=>x[0]),['state','put','map','viewer'])})});\ntest('clear writes empty local payload and preserves exact refresh/feedback ordering',()=>{compare(h=>{h.clear();assert.equal(h.data.get('mly_field_notes_v1'),'[]');assert.deepEqual(h.trace.map(x=>x[0]),['state','put','map','viewer','toast']);assert.equal(h.trace.at(-1)[2],2000)})});\ntest('clear guards empty notes, any shared save and editor saving without confirmation/network work',()=>{for(const guard of ['empty','save','editor'])compare(h=>{if(guard==='empty')h.w.state.fieldNotes=[];if(guard==='save')h.w._sharedNoteSaves.add('unrelated');if(guard==='editor')h.w.state.fieldNoteEditor={saving:true};h.clear();assert.equal(h.trace.length,0)})});\ntest('clear feedback reads sharing config at callback time after map/viewer refresh',()=>{compare(h=>{h.clear();h.patches();h.onDraw(()=>h.w.props.config.sharedFieldNotesEnabled=true);h.callbacks();const toast=h.trace.find(x=>x[0]==='toast');assert(JSON.stringify(toast).includes('Enterprise notes remain.'))},{batched:true})});\ntest('delete callback persists captured filtered array despite later live collection replacement',()=>{compare(h=>{h.remove('A');assert(!h.trace.some(x=>x[0]==='put'));h.patches();h.w.state.fieldNotes=[];h.callbacks();assert.equal(JSON.parse(h.data.get('mly_field_notes_v1'))[0].id,'B')},{batched:true})});\ntest('later shared/editor guard changes do not cancel already accepted mutation callback',()=>{compare(h=>{h.remove('A');h.w._sharedNoteSaves.add('A');h.w.state.fieldNoteEditor={saving:true};h.patches();h.callbacks();assert(h.trace.some(x=>x[0]==='put'))},{batched:true})});\ntest('restore applies real stored payload and retains interrupted-shared-save normalization',()=>{compare(h=>{h.data.set('mly_field_notes_v1',JSON.stringify([note('restored',{sharedStatus:'saving'})]));h.load();assert.equal(h.w.state.fieldNotes[0].sharedStatus,'failed');assert.deepEqual(h.trace.map(x=>x[0]),['get','state','map','viewer']);assert(!h.trace.some(x=>x[0]==='put'))})});\ntest('missing storage is a no-op and malformed/get failures retain existing contained warnings',()=>{for(const mode of ['missing','malformed','get'])compare(h=>{if(mode==='malformed')h.data.set('mly_field_notes_v1','not-json');if(mode==='get')h.failGet(Error('storage denied'));h.load();assert.equal(h.trace.some(x=>x[0]==='warn'),mode!=='missing');assert(!h.trace.some(x=>x[0]==='state'))})});\ntest('restore graphics remain queued behind state and use current renderer callbacks',()=>{compare(h=>{h.data.set('mly_field_notes_v1',JSON.stringify([note('restored')]));h.load();assert.deepEqual(h.trace.map(x=>x[0]),['get','state']);h.patches();h.w.drawFieldNoteGraphics=()=>h.trace.push(['replacementMap']);h.callbacks();assert.deepEqual(h.trace.slice(-2).map(x=>x[0]),['replacementMap','viewer'])},{batched:true})});\ntest('persistence failure retains warning/false result while refresh and clear feedback still run',()=>{compare(h=>{h.failSet(Error('storage denied'));h.clear();assert.deepEqual(h.trace.map(x=>x[0]),['state','put','warn','map','viewer','toast'])})});\ntest('restore retains helper catch scope around synchronous rendering errors',()=>{compare(h=>{h.data.set('mly_field_notes_v1',JSON.stringify([note('restored')]));h.onDraw(()=>{throw Error('draw failed')});h.load();assert.equal(h.trace.at(-1)[0],'warn');assert(!h.trace.some(x=>x[0]==='viewer'))})});\ntest('delete/clear map failures keep original propagation and stop later callback work',()=>{for(const operation of ['remove','clear'])compare(h=>{h.onDraw(()=>{throw Error('draw failed')});assert.throws(()=>operation==='remove'?h.remove('A'):h.clear(),{message:'draw failed'});assert(!h.trace.some(x=>['viewer','toast'].includes(x[0])))})});\ntest('rapid queued local changes keep existing captured callback/persistence order',()=>{compare(h=>{h.remove('A');h.clear();h.patches();h.callbacks();assert.deepEqual(h.trace.filter(x=>x[0]==='put').map(x=>JSON.parse(x[2]).length),[1,0]);assert.equal(h.w.state.fieldNotes.length,0)},{batched:true})});\n"
    },
    {
      "file": "tests/fixtures/localNoteCollection.baseline.json",
      "content": "{\n  \"handlers\": \"  private loadFieldNotesFromStorage() {\\n    restoreLocalNotes(this.FIELD_NOTES_STORAGE_KEY, notes => {\\n      this.setState({ fieldNotes: notes }, () => {\\n        this.drawFieldNoteGraphics();\\n        this.updateViewerFieldNoteMarkers();\\n      });\\n    });\\n  }\\n  private deleteFieldNote = (id: string) => {\\n    if (this._sharedNoteSaves.has(id) || this.state.fieldNoteEditor?.saving) return;\\n    const updated = this.state.fieldNotes.filter((n) => n.id !== id);\\n    this.setState({ fieldNotes: updated }, () => {\\n      this.saveFieldNotesToStorage(updated);\\n      this.drawFieldNoteGraphics();\\n      this.updateViewerFieldNoteMarkers();\\n    });\\n  };\\n\\n  private clearAllFieldNotes = () => {\\n    if (!this.state.fieldNotes.length || this._sharedNoteSaves.size || this.state.fieldNoteEditor?.saving) return;\\n\\n    // the button handles confirmation\\n    this.setState({ fieldNotes: [] }, () => {\\n      this.saveFieldNotesToStorage([]);\\n      this.drawFieldNoteGraphics();\\n      this.updateViewerFieldNoteMarkers();\\n      this.showToast(\\n        <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n          <Icons.Check size={14} color=\\\"#37d582\\\" /> {this.props.config.sharedFieldNotesEnabled ? \\\"Local notes cleared. Enterprise notes remain.\\\" : \\\"Local notes cleared.\\\"}\\n        </span>,\\n        2000,\\n      );\\n    });\\n  };\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'local-note-collection-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-local-note-collection.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited collection references remain)');
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
    console.log(uninstall ? 'Local-note collection is already uninstalled. No files changed.' : 'Local-note collection is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'local-note-collection', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Local-note collection ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Local-note collection flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
