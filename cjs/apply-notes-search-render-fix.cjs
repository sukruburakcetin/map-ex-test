#!/usr/bin/env node
'use strict';
/**
 * Notes search module-resolution fix. Compatible current v6 sources.
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
      "file": "src/features/field-notes/LocalNotesList.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Distinct notes module 1",
              "before": "import { OwnedMessage } from '../../i18n/WidgetLocale';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { NoteSearch } from './NoteSearch';\nimport { filterNotes } from './noteSearch';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\n",
              "after": "import { OwnedMessage } from '../../i18n/WidgetLocale';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { NotesSearchControls } from './NotesSearchControls';\nimport { filterNotes } from './noteSearch';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\n"
            },
            {
              "label": "Distinct notes module 2",
              "before": "                        </div>\n                    </div>\n\n                    <NoteSearch query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} />\n                    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={noteListEmptyStyle}>{t('notesSearchEmpty')}</div>}\n                    {isConfirmingClear && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLocalRecordsWillBeRemovedEnterpriseNotesWill')} </div>}\n                    <div style={enterpriseRowsStyle}>\n",
              "after": "                        </div>\n                    </div>\n\n                    <NotesSearchControls query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} />\n                    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={noteListEmptyStyle}>{t('notesSearchEmpty')}</div>}\n                    {isConfirmingClear && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLocalRecordsWillBeRemovedEnterpriseNotesWill')} </div>}\n                    <div style={enterpriseRowsStyle}>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/EnterpriseNotesList.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Distinct notes module 1",
              "before": "/** Paged Enterprise records; mounted only for the open Enterprise tab. No automatic polling. */\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { NoteSearch } from './NoteSearch';\nimport { filterNotes } from './noteSearch';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\n",
              "after": "/** Paged Enterprise records; mounted only for the open Enterprise tab. No automatic polling. */\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { NotesSearchControls } from './NotesSearchControls';\nimport { filterNotes } from './noteSearch';\nimport { FIELD_NOTE_STATUSES } from '../../components/types';\nimport type { FieldNote } from '../../components/types';\n"
            },
            {
              "label": "Distinct notes module 2",
              "before": "      <div><button type=\"button\" style={noteActionStyle} disabled={busy} onClick={() => void load(0)}> {t('uiRefresh')} </button>{' '}\n      <button type=\"button\" style={noteActionStyle} onClick={props.onClose} aria-label={t('uiCloseNotesList')}> {t('uiClose')} </button></div>\n    </div>\n    <NoteSearch query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} loadedOnly />\n    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={notesSourceHintStyle}>{t('notesSearchEmpty')}</div>}\n    <p style={notesSourceHintStyle}> {t('uiOrganizationRecordsRefreshForLatestClearLocalKeeps')} </p>\n    {busy && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLoadingEnterpriseNotes')} </div>}\n",
              "after": "      <div><button type=\"button\" style={noteActionStyle} disabled={busy} onClick={() => void load(0)}> {t('uiRefresh')} </button>{' '}\n      <button type=\"button\" style={noteActionStyle} onClick={props.onClose} aria-label={t('uiCloseNotesList')}> {t('uiClose')} </button></div>\n    </div>\n    <NotesSearchControls query={query} onChange={setQuery} shown={visibleNotes.length} total={notes.length} loadedOnly />\n    {query.trim() && notes.length > 0 && visibleNotes.length === 0 && <div style={notesSourceHintStyle}>{t('notesSearchEmpty')}</div>}\n    <p style={notesSourceHintStyle}> {t('uiOrganizationRecordsRefreshForLatestClearLocalKeeps')} </p>\n    {busy && <div role=\"status\" style={notesSourceHintStyle}> {t('uiLoadingEnterpriseNotes')} </div>}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/README.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Distinct notes module 1",
              "before": "\n## Notes panel search\n\n`NoteSearch.tsx` owns only the controlled search field, clear/Escape behavior, live result count and loaded-record scope label. `noteSearch.ts` owns literal locale-aware, accent-insensitive matching across text, category, resolution and raw/localized status. All whitespace-separated terms must match, including across fields. The original records and their ordering remain unchanged; LocalNotesList retains newest-first rendering.\n\nBoth list components own transient query state and memoize their visible rows. Search never writes storage, changes map/viewer markers or starts a service request. Local search includes the complete local array. Enterprise search includes only pages loaded in that tab; its scope is explicit, paging remains available while filtering, and new pages participate automatically. Refresh, retry and context cancellation stay with the existing Enterprise list owner. Switching/unmounting a list resets its query.\n\n",
              "after": "\n## Notes panel search\n\n`NotesSearchControls.tsx` owns only the controlled search field, clear/Escape behavior, live result count and loaded-record scope label. `noteSearch.ts` owns literal locale-aware, accent-insensitive matching across text, category, resolution and raw/localized status. All whitespace-separated terms must match, including across fields. The original records and their ordering remain unchanged; LocalNotesList retains newest-first rendering.\n\nBoth list components own transient query state and memoize their visible rows. Search never writes storage, changes map/viewer markers or starts a service request. Local search includes the complete local array. Enterprise search includes only pages loaded in that tab; its scope is explicit, paging remains available while filtering, and new pages participate automatically. Refresh, retry and context cancellation stay with the existing Enterprise list owner. Switching/unmounting a list resets its query.\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/NOTES-SEARCH.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "Distinct notes module 1",
              "before": "## Contributor owners\n\n- `src/features/field-notes/noteSearch.ts`: normalization and pure matching.\n- `src/features/field-notes/NoteSearch.tsx`: accessible controlled search UI.\n- `src/styles/noteSearch.ts`: compact layout and theme styling.\n- LocalNotesList/EnterpriseNotesList: query state and memoized visible rows; existing mutations/paging remain with their owners.\n- `src/i18n/messages.ts`, language catalogs and community translation CSV: shared translations.\n",
              "after": "## Contributor owners\n\n- `src/features/field-notes/noteSearch.ts`: normalization and pure matching.\n- `src/features/field-notes/NotesSearchControls.tsx`: accessible controlled search UI.\n- `src/styles/noteSearch.ts`: compact layout and theme styling.\n- LocalNotesList/EnterpriseNotesList: query state and memoized visible rows; existing mutations/paging remain with their owners.\n- `src/i18n/messages.ts`, language catalogs and community translation CSV: shared translations.\n"
            },
            {
              "label": "Distinct notes module 2",
              "before": "    node apply-notes-search.cjs\n\nRebuild and reload Experience Builder. `--dry-run` checks compatibility without writing source. The installer does not run tests or a host build. The standalone uninstaller restores the exact pre-install files and removes newly created search helpers/tests/docs. It refuses changed targets rather than overwriting later edits. Existing hover/click fixes remain untouched.\n",
              "after": "    node apply-notes-search.cjs\n\nRebuild and reload Experience Builder. `--dry-run` checks compatibility without writing source. The installer does not run tests or a host build. The standalone uninstaller restores the exact pre-install files and removes newly created search helpers/tests/docs. It refuses changed targets rather than overwriting later edits. Existing hover/click fixes remain untouched.\n\n## Case-insensitive module resolution correction\n\nThe first delivery used `NoteSearch.tsx` for the component and `noteSearch.ts` for matching. With case-insensitive filename lookup and `.ts` before `.tsx`, importing `./NoteSearch` could resolve to the matching helper, which has no component export. React then received undefined and raised error #130. The browser fixture originally preferred `.tsx` and did not expose this platform difference.\n\nThe component now lives at `NotesSearchControls.tsx`, distinctly named from the helper. Both lists import that exact module. A guarded hotfix removes the unchanged old component, creates the distinctly named replacement and updates imports. The browser fixture uses `.ts` before `.tsx` and supports `NOTE_SEARCH_CASE_INSENSITIVE=1`; all fourteen interaction checks pass under that simulated resolution policy. Three module-resolution checks reproduce the old misresolution and verify unique stems/current exports. No search behavior, localization or stored note data changes.\n\nIf the first search installer is already installed, apply `apply-notes-search-render-fix.cjs`, then rebuild/reload. For a fresh installation use `apply-notes-search-fixed.cjs`. Keep the corresponding uninstaller and backups. Reverse the render hotfix before trying to uninstall the older original search installer; guards intentionally refuse modified targets.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/noteSearch.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Distinct notes module 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=path.resolve(__dirname,'..'),modules={};\nfunction add(file){const key=path.relative(root,file).replace(/\\\\/g,'/');if(modules[key])return key;const source=fs.readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;modules[key]={code,deps:{}};for(const match of code.matchAll(/require\\(\"([^\"]+)\"\\)/g)){const id=match[1];if(id==='jimu-core'||id.endsWith('WidgetLocale'))continue;let resolved=path.resolve(path.dirname(file),id);if(!path.extname(resolved))resolved=fs.existsSync(resolved+'.tsx')?resolved+'.tsx':resolved+'.ts';modules[key].deps[id]=add(resolved);}return key;}\nconst local=add(path.join(root,'src/features/field-notes/LocalNotesList.tsx')),enterprise=add(path.join(root,'src/features/field-notes/EnterpriseNotesList.tsx')),en=add(path.join(root,'src/i18n/messages.ts')),ar=add(path.join(root,'src/i18n/locales/ar.ts'));\nconst bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};window.Context=React.createContext(null);function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>React.useContext(Context),OwnedMessage:({source,values={}})=>source.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}')} :load(entry.deps[id]),m,m.exports);return m.exports;}\nconst Local=load(${JSON.stringify(local)}).LocalNotesList,Enterprise=load(${JSON.stringify(enterprise)}).EnterpriseNotesList,catalogs={en:load(${JSON.stringify(en)}).en,ar:load(${JSON.stringify(ar)}).default};\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=path.resolve(__dirname,'..'),modules={};\nfunction add(file){const key=path.relative(root,file).replace(/\\\\/g,'/');if(modules[key])return key;const source=fs.readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;modules[key]={code,deps:{}};for(const match of code.matchAll(/require\\(\"([^\"]+)\"\\)/g)){const id=match[1];if(id==='jimu-core'||id.endsWith('WidgetLocale'))continue;let resolved=path.resolve(path.dirname(file),id);if(!path.extname(resolved)){const directory=path.dirname(resolved),stem=path.basename(resolved),names=fs.readdirSync(directory);let found;for(const extension of ['.ts','.tsx']){found=names.find(name=>process.env.NOTE_SEARCH_CASE_INSENSITIVE==='1'?name.toLowerCase()===(stem+extension).toLowerCase():name===stem+extension);if(found)break;}if(!found)throw Error('Unresolved note fixture import: '+resolved);resolved=path.join(directory,found);}modules[key].deps[id]=add(resolved);}return key;}\nconst local=add(path.join(root,'src/features/field-notes/LocalNotesList.tsx')),enterprise=add(path.join(root,'src/features/field-notes/EnterpriseNotesList.tsx')),en=add(path.join(root,'src/i18n/messages.ts')),ar=add(path.join(root,'src/i18n/locales/ar.ts'));\nconst bootstrap=`(()=>{const modules=${JSON.stringify(modules)},cache={};window.Context=React.createContext(null);function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}},entry=modules[key];new Function('require','module','exports',entry.code)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.endsWith('WidgetLocale')?{useWidgetLocale:()=>React.useContext(Context),OwnedMessage:({source,values={}})=>source.replace(/\\\\{(\\\\w+)\\\\}/g,(_,k)=>values[k]??'{'+k+'}')} :load(entry.deps[id]),m,m.exports);return m.exports;}\nconst Local=load(${JSON.stringify(local)}).LocalNotesList,Enterprise=load(${JSON.stringify(enterprise)}).EnterpriseNotesList,catalogs={en:load(${JSON.stringify(en)}).en,ar:load(${JSON.stringify(ar)}).default};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/field-notes/NoteSearch.tsx",
      "removeIfContent": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { noteSearchStyle, noteSearchRowStyle, noteSearchInputStyle, noteSearchClearStyle, noteSearchStatusStyle } from '../../styles/noteSearch';\n\ninterface Props { query: string; onChange(value: string): void; shown: number; total: number; loadedOnly?: boolean }\n\n/** Accessible local-list filtering controls. No storage, network, or map selection ownership. */\nexport const NoteSearch: React.FC<Props> = ({ query, onChange, shown, total, loadedOnly }) => {\n  const { t, formatLocale } = useWidgetLocale();\n  const input = React.useRef<HTMLInputElement>(null);\n  const numbers = React.useMemo(() => new Intl.NumberFormat(formatLocale), [formatLocale]);\n  return <div style={noteSearchStyle} onClick={event => event.stopPropagation()}\n    onPointerDown={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>\n    <div style={noteSearchRowStyle}>\n      <label style={{ display: 'grid', gap: 4, minWidth: 0 }}>{t('notesSearch')}\n        <input ref={input} type=\"search\" value={query} placeholder={t('notesSearchPlaceholder')}\n          style={noteSearchInputStyle} onChange={event => onChange(event.target.value)}\n          onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape' && query) { event.preventDefault(); onChange(''); } }} />\n      </label>\n        {query && <button type=\"button\" style={{ ...noteSearchClearStyle, alignSelf: 'end' }} aria-label={t('notesClearSearch')}\n          onClick={() => { onChange(''); input.current?.focus(); }}>\u2715</button>}\n    </div>\n    <span role=\"status\" aria-live=\"polite\" style={noteSearchStatusStyle}>{t('notesSearchCount', { shown: numbers.format(shown), total: numbers.format(total) })}</span>\n    {loadedOnly && <span style={noteSearchStatusStyle}>{t('notesSearchLoadedScope')}</span>}\n  </div>;\n};\n"
    },
    {
      "file": "src/features/field-notes/NotesSearchControls.tsx",
      "content": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { useWidgetLocale } from '../../i18n/WidgetLocale';\nimport { noteSearchStyle, noteSearchRowStyle, noteSearchInputStyle, noteSearchClearStyle, noteSearchStatusStyle } from '../../styles/noteSearch';\n\ninterface Props { query: string; onChange(value: string): void; shown: number; total: number; loadedOnly?: boolean }\n\n/** Accessible local-list filtering controls. No storage, network, or map selection ownership. */\nexport const NotesSearchControls: React.FC<Props> = ({ query, onChange, shown, total, loadedOnly }) => {\n  const { t, formatLocale } = useWidgetLocale();\n  const input = React.useRef<HTMLInputElement>(null);\n  const numbers = React.useMemo(() => new Intl.NumberFormat(formatLocale), [formatLocale]);\n  return <div style={noteSearchStyle} onClick={event => event.stopPropagation()}\n    onPointerDown={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>\n    <div style={noteSearchRowStyle}>\n      <label style={{ display: 'grid', gap: 4, minWidth: 0 }}>{t('notesSearch')}\n        <input ref={input} type=\"search\" value={query} placeholder={t('notesSearchPlaceholder')}\n          style={noteSearchInputStyle} onChange={event => onChange(event.target.value)}\n          onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape' && query) { event.preventDefault(); onChange(''); } }} />\n      </label>\n        {query && <button type=\"button\" style={{ ...noteSearchClearStyle, alignSelf: 'end' }} aria-label={t('notesClearSearch')}\n          onClick={() => { onChange(''); input.current?.focus(); }}>\u2715</button>}\n    </div>\n    <span role=\"status\" aria-live=\"polite\" style={noteSearchStatusStyle}>{t('notesSearchCount', { shown: numbers.format(shown), total: numbers.format(total) })}</span>\n    {loadedOnly && <span style={noteSearchStatusStyle}>{t('notesSearchLoadedScope')}</span>}\n  </div>;\n};\n"
    },
    {
      "file": "tests/noteSearchModuleResolution.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst directory=path.join(__dirname,'../src/features/field-notes');\n/** Emulate case-insensitive filename lookup with the host's TS-before-TSX order. */\nfunction resolve(stem,names=fs.readdirSync(directory)){\n for(const extension of ['.ts','.tsx','.js']){\n  const found=names.find(name=>name.toLowerCase()===(stem+extension).toLowerCase());\n  if(found)return found;\n }\n}\ntest('the previous component/helper pair resolves the component request to the helper on a case-insensitive filesystem',()=>{\n const oldNames=['NoteSearch.tsx','noteSearch.ts'];assert.equal(resolve('NoteSearch',oldNames),'noteSearch.ts');\n const source=fs.readFileSync(path.join(directory,'noteSearch.ts'),'utf8'),m={exports:{}};\n new Function('module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);\n assert.equal(typeof m.exports.filterNotes,'function');assert.equal(m.exports.NoteSearch,undefined);\n});\ntest('note feature module stems are unique across case and TS/TSX extensions',()=>{\n const stems=new Map();for(const name of fs.readdirSync(directory).filter(name=>/\\.tsx?$/.test(name))){const key=name.replace(/\\.tsx?$/,'').toLowerCase();assert(!stems.has(key),`${name} collides with ${stems.get(key)}`);stems.set(key,name);}\n});\ntest('both lists import the distinctly named component and its runtime export exists',()=>{\n for(const file of ['LocalNotesList.tsx','EnterpriseNotesList.tsx']){\n  const source=fs.readFileSync(path.join(directory,file),'utf8');\n  assert(source.includes(\"import { NotesSearchControls } from './NotesSearchControls'\"));\n  assert.equal(resolve('NotesSearchControls'),'NotesSearchControls.tsx');\n }\n const source=fs.readFileSync(path.join(directory,'NotesSearchControls.tsx'),'utf8'),m={exports:{}};\n new Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText)(()=>({}),m,m.exports);\n assert.equal(typeof m.exports.NotesSearchControls,'function');\n});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'notes-search-render-fix-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed notes search module-resolution fix installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'notes-search-render-fix' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after notes search module-resolution fix installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after notes search module-resolution fix installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed notes search module-resolution fix installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-notes-search-render-fix.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Notes search module-resolution fix is already installed. No files changed.');
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
  const manifest = { installer: 'notes-search-render-fix', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Notes search module-resolution fix ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
