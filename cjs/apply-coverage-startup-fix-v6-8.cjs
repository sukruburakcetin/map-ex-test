#!/usr/bin/env node
'use strict';
/**
 * Coverage startup coalescing v6.8. Compatible current v6 sources.
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
              "before": "  private _featureRequestCounts: Map<string, number> = new Map();\n  private _featureOidCounters: Map<string, number> = new Map();\n  private _loadedFeatureIds: Map<string, Set<string>> = new Map();\n  private _turboLoadTask: Promise<void> = Promise.resolve();\n  private _turboDecodeTask: Promise<void> = Promise.resolve();\n  private _selectionRequestId = 0;\n  private readonly _sharedTileRequests = new SharedTileRequests();\n  private readonly _sequenceTileIndex = new SequenceTileIndex();\n",
              "after": "  private _featureRequestCounts: Map<string, number> = new Map();\n  private _featureOidCounters: Map<string, number> = new Map();\n  private _loadedFeatureIds: Map<string, Set<string>> = new Map();\n  private _turboLoadTask: Promise<void> = Promise.resolve();\n  private _turboCoveragePending: {\n    view: __esri.MapView | __esri.SceneView; map: __esri.Map;\n    key: string; controller: AbortController; promise: Promise<void>;\n  } | null = null;\n  private _turboDecodeTask: Promise<void> = Promise.resolve();\n  private _selectionRequestId = 0;\n  private readonly _sharedTileRequests = new SharedTileRequests();\n  private readonly _sequenceTileIndex = new SequenceTileIndex();\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "  /** Native coverage at every zoom; local decoding supports picking without replacing tile circles. */\n  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {\n    const view = this.state.jimuMapView?.view;\n    if (!this.state.turboModeActive || !view?.map || !this.canInitializeCoverage(view)) return;\n    this._turboAbortController?.abort();\n    this._turboHoverPickAbort?.abort();\n    this.clearTurboHoverDetails();\n    this._turboClickPickAbort?.abort();\n",
              "after": "  /** Native coverage at every zoom; local decoding supports picking without replacing tile circles. */\n  private async enableTurboCoverageLayer(forceUsernameFilter?: string) {\n    const view = this.state.jimuMapView?.view;\n    if (!this.state.turboModeActive || !view?.map || !this.canInitializeCoverage(view)) return;\n    // Startup and stationary callbacks must not cancel the same unfinished style.\n    // Creator resolution belongs to that task; key by its input, not its result.\n    const key = JSON.stringify({ ...this.getTurboFilters(), creatorId: undefined,\n      username: (forceUsernameFilter ?? (this.state.turboFilterUsername || this.props.config.turboCreator || \"\")).trim(),\n      colorByDate: !!this.state.turboColorByDate, token: this.accessToken });\n    const pending = this._turboCoveragePending;\n    if (pending && pending.view === view && pending.map === view.map && pending.key === key &&\n        !pending.controller.signal.aborted) return pending.promise;\n    this._turboAbortController?.abort();\n    this._turboHoverPickAbort?.abort();\n    this.clearTurboHoverDetails();\n    this._turboClickPickAbort?.abort();\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "        }\n      }\n    });\n    this._turboLoadTask = task;\n    await task;\n  }\n\n  /** Delay the passive status so fast coverage transitions do not flash. */\n  private beginTurboLoading(requestId: number) {\n",
              "after": "        }\n      }\n    });\n    this._turboLoadTask = task;\n    this._turboCoveragePending = { view, map, key, controller, promise: task };\n    try { await task; }\n    finally {\n      if (this._turboCoveragePending?.promise === task) this._turboCoveragePending = null;\n    }\n  }\n\n  /** Delay the passive status so fast coverage transitions do not flash. */\n  private beginTurboLoading(requestId: number) {\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/coverageStartup.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget'),method=widget.members.find(m=>m.name?.getText(sf)==='enableTurboCoverageLayer').getText(sf);const code=ts.transpileModule('class Runtime{'+method+'}\\nreturn Runtime;',{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;const Runtime=new Function('LAYER_IDS',code)({COVERAGE_VT:'coverage'});\nfunction deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};}const tick=()=>new Promise(r=>setImmediate(r));\nfunction fixture(){const w=new Runtime(),layer={destroyed:false},view={map:{findLayerById:()=>layer},destroyed:false};Object.assign(w,{state:{turboModeActive:true,jimuMapView:{view},turboFilterUsername:'',turboColorByDate:false},props:{config:{}},accessToken:'test',_turboRequestCount:0,_turboLoadTask:Promise.resolve(),turboCoverageLayer:layer,filters:{},calls:[],finishes:0,helps:0,canInitializeCoverage:()=>true,getTurboFilters(){return this.filters;},clearTurboHoverDetails(){},beginTurboLoading(){},finishTurboLoading(){this.finishes++;},showTurboInteractionHelp(){this.helps++;},updateTurboPickWarning(){},loadTurboCoverageLayer(username,id,controller){const d=deferred();this.calls.push({username,id,controller,...d});return d.promise;}});return w;}\ntest('cold startup and repeated stationary events share one pending load without aborting it',async()=>{const w=fixture(),first=w.enableTurboCoverageLayer();await tick();const others=Array.from({length:20},()=>w.enableTurboCoverageLayer());await tick();assert.equal(w.calls.length,1);assert.equal(w._turboRequestCount,1);assert.equal(w.calls[0].controller.signal.aborted,false);w.calls[0].resolve();await Promise.all([first,...others]);assert.equal(w.finishes,1);assert.equal(w.helps,1);assert.equal(w._turboCoveragePending,null);});\ntest('changed filters cancel the old task and retain the newer pending owner',async()=>{const w=fixture(),a=w.enableTurboCoverageLayer();await tick();w.filters={isPano:true};const b=w.enableTurboCoverageLayer();assert(w.calls[0].controller.signal.aborted);const newer=w._turboCoveragePending;w.calls[0].resolve();await a;await tick();assert.equal(w._turboCoveragePending,newer);assert.equal(w.calls.length,2);w.calls[1].resolve();await b;assert.equal(w.finishes,1);assert.equal(w._turboCoveragePending,null);});\ntest('resolving the creator ID does not change the input identity of a pending task',async()=>{const w=fixture();w.state.turboFilterUsername='user';const a=w.enableTurboCoverageLayer();await tick();w.filters={creatorId:42};const b=w.enableTurboCoverageLayer('user');assert.equal(w._turboRequestCount,1);w.calls[0].resolve();await Promise.all([a,b]);});\nfor(const kind of ['username','color','token','view','map','aborted'])test(`${kind} change starts a distinct task`,async()=>{const w=fixture(),a=w.enableTurboCoverageLayer();await tick();if(kind==='username')w.state.turboFilterUsername='other';if(kind==='color')w.state.turboColorByDate=true;if(kind==='token')w.accessToken='replacement';if(kind==='view')w.state.jimuMapView={view:{...w.state.jimuMapView.view}};if(kind==='map')w.state.jimuMapView.view.map={findLayerById:()=>w.turboCoverageLayer};if(kind==='aborted')w._turboAbortController.abort();const b=w.enableTurboCoverageLayer();assert.equal(w._turboRequestCount,2);w.calls[0].resolve();await a;await tick();assert.equal(w.calls.length,2);w.calls[1].resolve();await b;});\ntest('settled loads can be retried rather than remaining permanently memoized',async()=>{const w=fixture(),a=w.enableTurboCoverageLayer();await tick();w.calls[0].resolve();await a;const b=w.enableTurboCoverageLayer();await tick();assert.equal(w.calls.length,2);w.calls[1].resolve();await b;});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'coverage-startup-fix-v6-8-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.8 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'coverage-startup-fix-v6-8' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.8 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.8 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.8 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-coverage-startup-fix-v6-8.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Coverage startup v6.8 is already installed. No files changed.');
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
  const manifest = { installer: 'coverage-startup-fix-v6-8', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Coverage startup v6.8 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
