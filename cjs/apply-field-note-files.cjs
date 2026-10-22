#!/usr/bin/env node
'use strict';
/** Field-note files installer. Plain source payload.
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
          "before": "import { assertEnterpriseNoteUnchanged, buildEnterpriseNoteEditAttributes } from '../features/field-notes/enterpriseEdit';\nimport { prepareCurrentImageAttachment, validateNoteAttachmentFile } from '../features/field-notes/attachmentFiles';\nimport { fieldNotesFromGeoJson, fieldNotesToGeoJson } from '../features/field-notes/geoJson';\nimport { buildLocalNoteGraphic } from '../features/field-notes/mapGraphic';\nimport { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';\n",
          "after": "import { assertEnterpriseNoteUnchanged, buildEnterpriseNoteEditAttributes } from '../features/field-notes/enterpriseEdit';\nimport { prepareCurrentImageAttachment, validateNoteAttachmentFile } from '../features/field-notes/attachmentFiles';\nimport { FieldNoteFiles } from '../features/field-notes/FieldNoteFiles';\nimport { showFieldNoteFileFeedback } from '../features/field-notes/FieldNoteFileFeedback';\nimport { buildLocalNoteGraphic } from '../features/field-notes/mapGraphic';\nimport { PendingNoteMarker } from '../features/field-notes/PendingNoteMarker';\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 2",
          "before": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Coordinate local collection changes; storage, graphics and shared-save authority stay separate. */\n  private _localNoteCollection = new LocalNoteCollection({\n",
          "after": "  private _pointCloudAdaptiveDisplay: PointCloudAdaptiveDisplay | null = null;\n  private _pointCloudViewerRenderer: PointCloudViewerRenderer | null = null;\n  /** Bind file intent to local state/persistence/renderers; conversion and browser work stay in feature. */\n  private _fieldNoteFiles = new FieldNoteFiles({\n    readNotes: () => this.state.fieldNotes,\n    setNotes: (notes, callback) => this.setState({ fieldNotes: notes }, callback),\n    persist: notes => this.saveFieldNotesToStorage(notes),\n    drawMapNotes: () => this.drawFieldNoteGraphics(),\n    updateViewerNotes: () => this.updateViewerFieldNoteMarkers(),\n    notify: notice => showFieldNoteFileFeedback((...args) => this.showToast(...args), notice),\n    logExportError: error => console.error(\"Field notes export failed\", error),\n    logImportError: error => console.error(\"Field notes import failed:\", error),\n  });\n  /** Coordinate local collection changes; storage, graphics and shared-save authority stay separate. */\n  private _localNoteCollection = new LocalNoteCollection({\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 3",
          "before": "   * Preserves longitude, latitude, and altitude [lon, lat, alt] coordinates.\n   */\n  private exportFieldNotes = () => {\n    const { fieldNotes } = this.state;\n    if (!fieldNotes.length) {\n      this.showToast(\"D\u0131\u015fa aktar\u0131lacak not bulunamad\u0131.\");\n      return;\n    }\n\n    const featureCollection = fieldNotesToGeoJson(fieldNotes);\n\n    try {\n      const dataStr = \"data:text/json;charset=utf-8,\" + encodeURIComponent(JSON.stringify(featureCollection, null, 2));\n      const a = document.createElement(\"a\");\n      a.setAttribute(\"href\", dataStr);\n      a.setAttribute(\"download\", `field_notes_${Date.now()}.json`);\n      document.body.appendChild(a);\n      a.click();\n      a.remove();\n    } catch (err) {\n      console.error(\"Field notes export failed\", err);\n    }\n  };\n\n  /**\n   * Imports field notes from an external GeoJSON file.\n",
          "after": "   * Preserves longitude, latitude, and altitude [lon, lat, alt] coordinates.\n   */\n  private exportFieldNotes = () => this._fieldNoteFiles.export();\n  /**\n   * Imports field notes from an external GeoJSON file.\n"
        },
        {
          "label": "src/runtime/widget.tsx annotation cloud picking block 4",
          "before": "   * @param file The GeoJSON file selected by the user.\n   */\n  private importFieldNotesFile = (file: File) => {\n    const reader = new FileReader();\n\n    reader.onload = (e) => {\n      try {\n        const raw = e.target?.result as string;\n        const geojson = JSON.parse(raw);\n\n        const imported = fieldNotesFromGeoJson(geojson);\n\n        if (!imported.length) {\n          this.showToast(\"Dosyada ge\u00e7erli not bulunamad\u0131.\");\n          return;\n        }\n\n        // Deduplicate incoming notes against existing IDs\n        const existingIds = new Set(this.state.fieldNotes.map((n) => n.id));\n        const newOnes = imported.filter((n) => !existingIds.has(n.id));\n        const skipped = imported.length - newOnes.length;\n\n        const merged = [...this.state.fieldNotes, ...newOnes];\n\n        this.setState({ fieldNotes: merged }, () => {\n          this.saveFieldNotesToStorage(merged);\n          this.drawFieldNoteGraphics();\n          this.updateViewerFieldNoteMarkers();\n\n          this.showToast(\n            <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n              <Icons.Check size={14} color=\"#37d582\" />\n              {newOnes.length} not i\u00e7e aktar\u0131ld\u0131{skipped > 0 ? ` (${skipped} yinelenen atland\u0131)` : \"\"}\n            </span>,\n            3000,\n          );\n        });\n      } catch (err) {\n        console.error(\"Field notes import failed:\", err);\n        this.showToast(\"Dosya okunamad\u0131 \u2014 ge\u00e7erli bir Field Notes GeoJSON dosyas\u0131 olmal\u0131.\");\n      }\n    };\n\n    reader.onerror = () => {\n      this.showToast(\"Dosya okunamad\u0131.\");\n    };\n\n    reader.readAsText(file);\n  };\n\n  // #endregion FIELD NOTES\n\n",
          "after": "   * @param file The GeoJSON file selected by the user.\n   */\n  private importFieldNotesFile = (file: File) => this._fieldNoteFiles.import(file);\n  // #endregion FIELD NOTES\n\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteFiles",
        "showFieldNoteFileFeedback"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteFiles",
          "count": 3
        },
        {
          "text": "showFieldNoteFileFeedback",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/field-notes/geoJson.ts",
      "blocks": [
        {
          "label": "src/features/field-notes/geoJson.ts annotation cloud picking block 1",
          "before": "/** Field-note GeoJSON conversion only. File I/O, persistence and renderer updates belong to the runtime. */\nimport type { FieldNote } from '../../components/types';\n\n",
          "after": "/** Field-note GeoJSON conversion only. File I/O and update coordination belong to FieldNoteFiles; persistence/renderers keep their owners. */\nimport type { FieldNote } from '../../components/types';\n\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteFiles"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteFiles",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/field-notes/README.md",
      "blocks": [
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 1",
          "before": "| Concern | Entry point |\n| --- | --- |\n| Local restore/delete/clear guards and state/storage/renderer order | `LocalNoteCollection.ts` |\n| Local-clear feedback and Enterprise reminder | `LocalNoteCollectionFeedback.tsx` |\n",
          "after": "| Concern | Entry point |\n| --- | --- |\n| GeoJSON file import/export, live-ID merging and browser I/O | `FieldNoteFiles.ts` |\n| File feedback wording and import counts | `FieldNoteFileFeedback.tsx` |\n| Local restore/delete/clear guards and state/storage/renderer order | `LocalNoteCollection.ts` |\n| Local-clear feedback and Enterprise reminder | `LocalNoteCollectionFeedback.tsx` |\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 2",
          "before": "| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining edit/focus, import/export, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n",
          "after": "| Viewer selection, buffers and renderer | `viewerSelection.ts`, `viewerBuffers.ts`, `viewerRenderer.ts` |\n| Enterprise endpoint, attribute and edit helpers | `enterpriseEndpoint.ts`, `enterpriseAttributes.ts`, `enterpriseEdit.ts`, `enterpriseList.ts` |\n| Remaining edit/focus, SDK and shared-note orchestration | Field-note region in `../../runtime/widget.tsx` |\n\n## Annotation cloud picking\n"
        },
        {
          "label": "src/features/field-notes/README.md annotation cloud picking block 3",
          "before": "\n`tests/localNoteCollection.test.cjs` compares actual adapters against frozen original methods using real persistence helpers with memory storage. Tests cover payloads/source identity, per-ID versus global guards, unknown/duplicate IDs, missing/malformed storage, interrupted shared saves, queued/live callbacks, storage/draw failures and clear feedback. Host checks: restore after refresh, individual delete, confirmed local clear, blocked save/editor actions and Enterprise-note preservation.\n",
          "after": "\n`tests/localNoteCollection.test.cjs` compares actual adapters against frozen original methods using real persistence helpers with memory storage. Tests cover payloads/source identity, per-ID versus global guards, unknown/duplicate IDs, missing/malformed storage, interrupted shared saves, queued/live callbacks, storage/draw failures and clear feedback. Host checks: restore after refresh, individual delete, confirmed local clear, blocked save/editor actions and Enterprise-note preservation.\n\n## GeoJSON file coordination\n\n`FieldNoteFiles.ts` coordinates file intent through the unchanged conversion functions in `geoJson.ts`. `FieldNoteFileFeedback.tsx` keeps existing messages/language and imported/skipped counts together. Runtime supplies live local notes, state/persistence/renderer callbacks and error logs. Browser readers/anchors are created only when the user invokes the existing action.\n\n- `export` converts current local notes before the original try/catch, then keeps two-space JSON formatting, encoded `data:text/json;charset=utf-8,` URI, timestamp `.json` filename and append/click/remove order. Empty exports retain their toast; conversion exceptions propagate and browser/serialization failures retain export logging only.\n- `import` keeps one FileReader per invocation with the original onload/onerror/readAsText behavior. Constructor/read setup errors retain their synchronous boundary. No new cancellation, size limit, request guard or file validation is added.\n- On load, convert with the existing parser and compare IDs against then-current local notes. Do not deduplicate rows within the same incoming file; this preserves the original rule. All-existing valid imports still commit/save/refresh with a zero-added message.\n- State callbacks persist the captured merged array, refresh map/viewer, then show the original 3000 ms count feedback. Reader catch scope includes synchronous callback errors, while later queued React callback errors retain their existing scope. Persistence return values/render promises remain unawaited.\n\nNo local note store, storage schema, quota logic, Enterprise publication or renderer ownership is moved. Function comments explain I/O/catch/callback boundaries. `tests/fieldNoteFiles.test.cjs` compares actual runtime adapters to frozen original methods using real conversion, controlled readers/DOM/clocks and queued state. Host checks: export/open GeoJSON, import 2D/3D notes, duplicates/all-existing/empty/invalid files, local reload and metadata/altitude preservation.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteFiles",
        "## GeoJSON file coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteFiles",
          "count": 2
        },
        {
          "text": "## GeoJSON file coordination",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md annotation cloud picking block 1",
          "before": "Changed: runtime, field-note contributor README and roadmap. Added: collection coordinator, clear-feedback module, 15 baseline-backed cases and frozen original methods. Validation: 324 point-cloud/field-note/playback cases; strict actual collection/persistence/feedback boundary checks with real FieldNote/Editor types and local Jimu declarations; full runtime TSX parse; unaffected member/helper preservation and guarded installer checks. Host smoke checks remain restore/delete/confirmed local clear, shared-save/editor guards and Enterprise record preservation.\n\nNext: extract field-note GeoJSON import/export orchestration while preserving format conversion, duplicate-ID handling, file-reader/download behavior, persistence and feedback order.\n",
          "after": "Changed: runtime, field-note contributor README and roadmap. Added: collection coordinator, clear-feedback module, 15 baseline-backed cases and frozen original methods. Validation: 324 point-cloud/field-note/playback cases; strict actual collection/persistence/feedback boundary checks with real FieldNote/Editor types and local Jimu declarations; full runtime TSX parse; unaffected member/helper preservation and guarded installer checks. Host smoke checks remain restore/delete/confirmed local clear, shared-save/editor guards and Enterprise record preservation.\n\nField-note GeoJSON import/export orchestration is completed below, with conversion, duplicate-ID rules, browser I/O and persistence/feedback order retained.\n\n## Field-note GeoJSON file coordination\n\nExtracted file orchestration to `src/features/field-notes/FieldNoteFiles.ts` and existing messages/JSX to `FieldNoteFileFeedback.tsx`. Runtime is now 13,128 lines (56 fewer), with two forwarding methods and live collection/state/persistence/render/log adapters. Other existing members are token-identical; converter, storage, draft, collection and shared FieldNote code tokens are unchanged. Only the converter header now identifies its file-coordination owner.\n\nFunction comments document exact export URI/format/download order, conversion-before-catch behavior, reader setup/onload/onerror boundaries, live completion-time ID lookup, original within-file duplicate acceptance and captured merged-array callbacks. No new cancellation, validation, size policy, storage schema, publication path, resource ownership or error handling is introduced.\n\nChanged: runtime, converter header comment, field-note contributor README and roadmap. Added: file coordinator, feedback module, 15 baseline-backed cases and frozen original methods. Validation: 339 point-cloud/field-note/playback cases; strict actual adapter/browser/feedback checks with real DOM/FieldNote types and local Jimu declarations; full runtime TSX parse; unaffected token preservation and guarded installer checks. Host smoke checks remain actual GeoJSON export/import, metadata/altitudes, duplicates and invalid/empty files, plus persistence after reload.\n\nNext: review field-note rendering ownership, starting with map-layer lifecycle and graphic synchronization, while preserving local/shared grouping, map-switch guards and viewer update order.\n"
        }
      ],
      "absentAfterUninstall": [
        "FieldNoteFiles",
        "## Field-note GeoJSON file coordination"
      ],
      "requiredOccurrences": [
        {
          "text": "FieldNoteFiles",
          "count": 1
        },
        {
          "text": "## Field-note GeoJSON file coordination",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/field-notes/FieldNoteFiles.ts",
      "content": "import { fieldNotesFromGeoJson, fieldNotesToGeoJson } from './geoJson';\nimport type { FieldNote } from '../../components/types';\n\nexport type FieldNoteFileNotice = { kind: 'empty-export' | 'empty-import' | 'invalid-import' | 'read-error' } |\n  { kind: 'imported'; added: number; skipped: number };\nexport interface FieldNoteFilesDependencies {\n  /** Borrow current local records; imports read them after FileReader completes. */\n  readNotes(): FieldNote[];\n  setNotes(notes: FieldNote[], callback: () => void): void;\n  persist(notes: FieldNote[]): void;\n  drawMapNotes(): void;\n  updateViewerNotes(): void;\n  notify(notice: FieldNoteFileNotice): void;\n  logExportError(error: unknown): void;\n  logImportError(error: unknown): void;\n}\n\n/** Coordinate existing GeoJSON file intent without owning notes, storage, renderers or shared edits.\n * Browser objects are created only when invoked. No new reader cancellation, import validation,\n * request/version guard or download policy is introduced; conversion remains in geoJson.ts.\n */\nexport class FieldNoteFiles {\n  constructor(private readonly dependencies: FieldNoteFilesDependencies) {}\n\n  /** Convert current local notes before the original browser-download try/catch.\n   * Keep pretty JSON, encoded data URI, timestamp filename and append/click/remove sequence.\n   * Conversion errors still propagate; browser/serialization errors keep the export log only.\n   */\n  export(): void {\n    const d = this.dependencies;\n    const fieldNotes = d.readNotes();\n    if (!fieldNotes.length) { d.notify({ kind: 'empty-export' }); return; }\n    const featureCollection = fieldNotesToGeoJson(fieldNotes);\n    try {\n      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(featureCollection, null, 2));\n      const a = document.createElement('a');\n      a.setAttribute('href', dataStr);\n      a.setAttribute('download', `field_notes_${Date.now()}.json`);\n      document.body.appendChild(a); a.click(); a.remove();\n    } catch (error) { d.logExportError(error); }\n  }\n\n  /** Keep the reader's existing load/error handlers and synchronous setup/read error boundaries.\n   * Deduplicate against IDs in live state when loading finishes, not against other rows in this file.\n   * Persist the captured merged array after state commits, then refresh map/viewer and notify.\n   * Existing read/parse/conversion/callback catch scopes and unawaited rendering remain unchanged.\n   */\n  import(file: File): void {\n    const d = this.dependencies;\n    const reader = new FileReader();\n    reader.onload = event => {\n      try {\n        const raw = event.target?.result as string;\n        const imported = fieldNotesFromGeoJson(JSON.parse(raw));\n        if (!imported.length) { d.notify({ kind: 'empty-import' }); return; }\n        const existingIds = new Set(d.readNotes().map(note => note.id));\n        const newOnes = imported.filter(note => !existingIds.has(note.id));\n        const skipped = imported.length - newOnes.length;\n        const merged = [...d.readNotes(), ...newOnes];\n        d.setNotes(merged, () => {\n          d.persist(merged); d.drawMapNotes(); d.updateViewerNotes();\n          d.notify({ kind: 'imported', added: newOnes.length, skipped });\n        });\n      } catch (error) { d.logImportError(error); d.notify({ kind: 'invalid-import' }); }\n    };\n    reader.onerror = () => d.notify({ kind: 'read-error' });\n    reader.readAsText(file);\n  }\n}\n"
    },
    {
      "file": "src/features/field-notes/FieldNoteFileFeedback.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport * as Icons from '../../components/Icons';\nimport type { FieldNoteFileNotice } from './FieldNoteFiles';\n\n/** Keep existing file messages/language, duplicate-count wording and import-success duration. */\nexport function showFieldNoteFileFeedback(showToast: (content: React.ReactNode, duration?: number) => void, notice: FieldNoteFileNotice): void {\n  if (notice.kind === 'empty-export') { showToast('D\u0131\u015fa aktar\u0131lacak not bulunamad\u0131.'); return; }\n  if (notice.kind === 'empty-import') { showToast('Dosyada ge\u00e7erli not bulunamad\u0131.'); return; }\n  if (notice.kind === 'invalid-import') { showToast('Dosya okunamad\u0131 \u2014 ge\u00e7erli bir Field Notes GeoJSON dosyas\u0131 olmal\u0131.'); return; }\n  if (notice.kind === 'read-error') { showToast('Dosya okunamad\u0131.'); return; }\n  if (notice.kind === 'imported') {\n    const added = notice.added, skipped = notice.skipped;\n    showToast(\n      <span style={{ display: \"flex\", alignItems: \"center\", gap: \"6px\" }}>\n        <Icons.Check size={14} color=\"#37d582\" />\n        {added} not i\u00e7e aktar\u0131ld\u0131{skipped > 0 ? ` (${skipped} yinelenen atland\u0131)` : \"\"}\n      </span>,\n      3000,\n    );\n  }\n}\n"
    },
    {
      "file": "tests/fieldNoteFiles.test.cjs",
      "content": "/** Frozen original file methods versus actual adapters, unchanged conversion and recording browser I/O.\n * Controlled FileReader completion and queued state callbacks expose live merge/persist boundaries.\n */\nconst fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\nconst fixture=JSON.parse(fs.readFileSync(__dirname+'/fixtures/fieldNoteFiles.baseline.json','utf8')),source=fs.readFileSync(root+'/src/runtime/widget.tsx','utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),cl=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget');const actual=['_fieldNoteFiles','exportFieldNotes','importFieldNotesFile'].map(name=>cl.members.find(n=>n.name?.getText(sf)===name).getText(sf)).join('\\n');\nconst note=(id='A',extra={})=>({id,source:'manual',category:'Other',note:'hello',lon:1,lat:2,alt:3,imageId:'image',createdAt:1000,...extra});const collection=(ids=['B'])=>({type:'FeatureCollection',features:ids.map(id=>({type:'Feature',geometry:{type:'Point',coordinates:[4,5,6]},properties:{id,category:'Other',createdAt:'2020-01-01T00:00:00Z'}}))});\nfunction setup(kind,{batched=false}={}){\n const trace=[],readers=[],patches=[],callbacks=[];let failAt=null,failPersist=false;const record=(name,...args)=>{trace.push([name,...args]);if(failAt===name)throw Error('failed '+name)};\n class DateMock extends Date{static now(){record('now');return 12345}}const MathMock=Object.create(Math);MathMock.random=()=>.123;\n const document={createElement:tag=>{record('anchor',tag);return{setAttribute:(name,value)=>record('attribute',name,value),click:()=>record('click'),remove:()=>record('remove')}},body:{appendChild:()=>record('append')}};\n class FileReader{constructor(){record('reader');readers.push(this)}readAsText(file){record('read',file.name)}}\n const geometry={exports:{}};new Function('module','exports','Date','Math',compile(fs.readFileSync(root+'/src/features/field-notes/geoJson.ts','utf8')))(geometry,geometry.exports,DateMock,MathMock);\n const owner={exports:{}};new Function('require','module','exports','Date','document','FileReader',compile(fs.readFileSync(root+'/src/features/field-notes/FieldNoteFiles.ts','utf8')))(()=>geometry.exports,owner,owner.exports,DateMock,document,FileReader);\n const jsx=(tag,props,...children)=>({tag,props:props||{},children}),Icons={Check:'check'};const feedback={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(root+'/src/features/field-notes/FieldNoteFileFeedback.tsx','utf8')))(id=>id==='jimu-core'?{jsx}:Icons,feedback,feedback.exports);\n const console={error:(label,error)=>trace.push(['error',label,error.message])};const Harness=new Function('FieldNoteFiles','showFieldNoteFileFeedback','fieldNotesFromGeoJson','fieldNotesToGeoJson','Date','document','FileReader','jsx','Icons','console',compile('class Widget{'+(kind==='baseline'?fixture.handlers:actual)+'};return Widget;'))(owner.exports.FieldNoteFiles,feedback.exports.showFieldNoteFileFeedback,geometry.exports.fieldNotesFromGeoJson,geometry.exports.fieldNotesToGeoJson,DateMock,document,FileReader,jsx,Icons,console);const w=new Harness();\n const notes=[note()];w.state={fieldNotes:notes};w.setState=(patch,cb)=>{record('state',structuredClone(patch));const run=()=>{Object.assign(w.state,patch);if(batched)callbacks.push(cb);else cb()};if(batched)patches.push(run);else run()};w.showToast=(...args)=>record('toast',...args);w.saveFieldNotesToStorage=notes=>{record('persist',structuredClone(notes));return !failPersist};w.drawFieldNoteGraphics=()=>record('map');w.updateViewerFieldNoteMarkers=()=>record('viewer');\n return{w,trace,notes,readers,export:()=>w.exportFieldNotes(),import:()=>w.importFieldNotesFile({name:'notes.json'}),load:(value,index=0)=>readers[index].onload({target:{result:typeof value==='string'?value:JSON.stringify(value)}}),error:()=>readers[0].onerror(),patches:()=>{while(patches.length)patches.shift()()},callbacks:()=>{while(callbacks.length)callbacks.shift()()},fail:name=>failAt=name,persistFalse:()=>failPersist=true};\n}\nfunction compare(run,options){const a=setup('baseline',options),b=setup('working',options);run(a);run(b);assert.deepEqual(b.trace,a.trace);assert.deepEqual(b.w.state,a.w.state);return b}\ntest('export retains exact pretty JSON/data URI, metadata, filename and browser order',()=>{compare(h=>{h.export();assert.deepEqual(h.trace.map(x=>x[0]),['anchor','attribute','now','attribute','append','click','remove']);const href=h.trace.find(x=>x[0]==='attribute'&&x[1]==='href')[2];assert(href.startsWith('data:text/json;charset=utf-8,'));const output=JSON.parse(decodeURIComponent(href.split(',')[1]));assert.deepEqual(output.features[0].geometry.coordinates,[1,2,3]);assert(h.trace.some(x=>x[0]==='attribute'&&x[2]==='field_notes_12345.json'))})});\ntest('empty export keeps existing message without conversion/download work',()=>{compare(h=>{h.w.state.fieldNotes=[];h.export();assert.deepEqual(h.trace,[['toast','D\u0131\u015fa aktar\u0131lacak not bulunamad\u0131.']])})});\ntest('conversion failure stays outside export catch while browser failures log only',()=>{compare(h=>{h.w.state.fieldNotes[0].createdAt=NaN;assert.throws(()=>h.export(),RangeError);assert.equal(h.trace.length,0)});for(const step of ['anchor','attribute','append','click','remove'])compare(h=>{h.fail(step);h.export();assert.equal(h.trace.at(-1)[0],'error');assert(!h.trace.some(x=>x[0]==='toast'))})});\ntest('valid import retains conversion, captured merged storage payload and callback order',()=>{compare(h=>{h.import();assert.deepEqual(h.trace.map(x=>x[0]),['reader','read']);h.load(collection());assert.deepEqual(h.trace.slice(2).map(x=>x[0]),['state','persist','map','viewer','toast']);assert.strictEqual(h.w.state.fieldNotes[0],h.notes[0]);assert.equal(h.w.state.fieldNotes[1].alt,6);assert.equal(h.trace.at(-1)[2],3000)})});\ntest('dedup reads current local IDs at FileReader completion rather than input time',()=>{compare(h=>{h.import();h.w.state.fieldNotes=[note('B')];h.load(collection(['A','B']));assert.deepEqual(h.w.state.fieldNotes.map(n=>n.id),['B','A']);assert(JSON.stringify(h.trace.at(-1)).includes('yinelenen atland\u0131'))})});\ntest('duplicate IDs within the same file keep original acceptance behavior',()=>{compare(h=>{h.import();h.load(collection(['B','B']));assert.deepEqual(h.w.state.fieldNotes.map(n=>n.id),['A','B','B'])})});\ntest('all-existing imports retain zero-added save/refresh feedback behavior',()=>{compare(h=>{h.import();h.load(collection(['A']));assert.equal(h.w.state.fieldNotes.length,1);assert(h.trace.some(x=>x[0]==='persist'));assert.equal(h.trace.at(-1)[2],3000)})});\ntest('empty converted imports return the existing message without storage/state work',()=>{compare(h=>{h.import();h.load({features:[{geometry:null}]});assert.deepEqual(h.trace.at(-1),['toast','Dosyada ge\u00e7erli not bulunamad\u0131.']);assert(!h.trace.some(x=>x[0]==='state'))})});\ntest('malformed JSON and invalid GeoJSON retain log then exact failure feedback',()=>{for(const raw of ['bad-json','{}'])compare(h=>{h.import();h.load(raw);assert.deepEqual(h.trace.slice(-2).map(x=>x[0]),['error','toast']);assert.equal(h.trace.at(-1)[1],'Dosya okunamad\u0131 \u2014 ge\u00e7erli bir Field Notes GeoJSON dosyas\u0131 olmal\u0131.')})});\ntest('reader onerror keeps separate feedback while constructor/read setup errors propagate',()=>{compare(h=>{h.import();h.error();assert.deepEqual(h.trace.at(-1),['toast','Dosya okunamad\u0131.'])});for(const step of ['reader','read'])compare(h=>{h.fail(step);assert.throws(()=>h.import(),{message:'failed '+step});assert(!h.trace.some(x=>x[0]==='error'))})});\ntest('queued callback persists captured merged array and uses live renderer callback methods',()=>{compare(h=>{h.import();h.load(collection());assert(!h.trace.some(x=>x[0]==='persist'));h.patches();h.w.state.fieldNotes=[];h.w.drawFieldNoteGraphics=()=>h.trace.push(['replacementMap']);h.callbacks();assert.equal(h.trace.find(x=>x[0]==='persist')[1].length,2);assert(h.trace.some(x=>x[0]==='replacementMap'))},{batched:true})});\ntest('false persistence return retains success flow; synchronous callback errors retain load catch',()=>{compare(h=>{h.persistFalse();h.import();h.load(collection());assert.equal(h.trace.at(-1)[2],3000)});compare(h=>{h.fail('map');h.import();h.load(collection());assert.deepEqual(h.trace.slice(-2).map(x=>x[0]),['error','toast']);assert(!h.trace.some(x=>x[0]==='viewer'))})});\ntest('batched callback errors remain outside the completed reader catch',()=>{compare(h=>{h.import();h.load(collection());h.patches();h.fail('map');assert.throws(()=>h.callbacks(),{message:'failed map'});assert(!h.trace.some(x=>x[0]==='error'))},{batched:true})});\ntest('multiple readers retain independent completion and live merge order without new cancellation',()=>{compare(h=>{h.import();h.import();h.load(collection(['C']),1);h.load(collection(['B']),0);assert.deepEqual(h.w.state.fieldNotes.map(n=>n.id),['A','C','B'])})});\ntest('real converter retains altitude/status/date/shared metadata defaults and source records stay unchanged',()=>{compare(h=>{const before=structuredClone(h.notes);h.notes.forEach(Object.freeze);Object.freeze(h.notes);h.export();h.import();const input=collection(['B']);input.features[0].properties={id:'B',alt:99,status:'bad',sharedGlobalId:'global',sharedStatus:'saving'};h.load(input);const imported=h.w.state.fieldNotes[1];assert.equal(imported.alt,6);assert.equal(imported.status,'open');assert.equal(imported.sharedStatus,'failed');assert.equal(imported.createdAt,12345);assert.deepEqual(h.notes,before)})});\n"
    },
    {
      "file": "tests/fixtures/fieldNoteFiles.baseline.json",
      "content": "{\n  \"handlers\": \"  private exportFieldNotes = () => {\\n    const { fieldNotes } = this.state;\\n    if (!fieldNotes.length) {\\n      this.showToast(\\\"D\\u0131\\u015fa aktar\\u0131lacak not bulunamad\\u0131.\\\");\\n      return;\\n    }\\n\\n    const featureCollection = fieldNotesToGeoJson(fieldNotes);\\n\\n    try {\\n      const dataStr = \\\"data:text/json;charset=utf-8,\\\" + encodeURIComponent(JSON.stringify(featureCollection, null, 2));\\n      const a = document.createElement(\\\"a\\\");\\n      a.setAttribute(\\\"href\\\", dataStr);\\n      a.setAttribute(\\\"download\\\", `field_notes_${Date.now()}.json`);\\n      document.body.appendChild(a);\\n      a.click();\\n      a.remove();\\n    } catch (err) {\\n      console.error(\\\"Field notes export failed\\\", err);\\n    }\\n  };\\n\\n  private importFieldNotesFile = (file: File) => {\\n    const reader = new FileReader();\\n\\n    reader.onload = (e) => {\\n      try {\\n        const raw = e.target?.result as string;\\n        const geojson = JSON.parse(raw);\\n\\n        const imported = fieldNotesFromGeoJson(geojson);\\n\\n        if (!imported.length) {\\n          this.showToast(\\\"Dosyada ge\\u00e7erli not bulunamad\\u0131.\\\");\\n          return;\\n        }\\n\\n        // Deduplicate incoming notes against existing IDs\\n        const existingIds = new Set(this.state.fieldNotes.map((n) => n.id));\\n        const newOnes = imported.filter((n) => !existingIds.has(n.id));\\n        const skipped = imported.length - newOnes.length;\\n\\n        const merged = [...this.state.fieldNotes, ...newOnes];\\n\\n        this.setState({ fieldNotes: merged }, () => {\\n          this.saveFieldNotesToStorage(merged);\\n          this.drawFieldNoteGraphics();\\n          this.updateViewerFieldNoteMarkers();\\n\\n          this.showToast(\\n            <span style={{ display: \\\"flex\\\", alignItems: \\\"center\\\", gap: \\\"6px\\\" }}>\\n              <Icons.Check size={14} color=\\\"#37d582\\\" />\\n              {newOnes.length} not i\\u00e7e aktar\\u0131ld\\u0131{skipped > 0 ? ` (${skipped} yinelenen atland\\u0131)` : \\\"\\\"}\\n            </span>,\\n            3000,\\n          );\\n        });\\n      } catch (err) {\\n        console.error(\\\"Field notes import failed:\\\", err);\\n        this.showToast(\\\"Dosya okunamad\\u0131 \\u2014 ge\\u00e7erli bir Field Notes GeoJSON dosyas\\u0131 olmal\\u0131.\\\");\\n      }\\n    };\\n\\n    reader.onerror = () => {\\n      this.showToast(\\\"Dosya okunamad\\u0131.\\\");\\n    };\\n\\n    reader.readAsText(file);\\n  };\\n\"\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'field-note-files-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-field-note-files.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited file-coordination references remain)');
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
    console.log(uninstall ? 'Field-note files is already uninstalled. No files changed.' : 'Field-note files is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'field-note-files', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Field-note files ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Field-note files flow and feedback now have documented feature entry points. Full-cloud inputs, calibration timing, writers and browser download behavior are preserved. Regression files are included; tests do not run here.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
