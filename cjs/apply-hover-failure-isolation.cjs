#!/usr/bin/env node
'use strict';
/**
 * Hover failure isolation. Compatible current v6 sources.
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
              "label": "Optional hover failure isolation",
              "before": "          const mapFeature = obj || await this.pickMapFeature(screenPoint, view, hoverController.signal);",
              "after": "          // Optional detection failures must not dismiss independently successful\n          // imagery hover. A successful feature still owns the tooltip below.\n          const mapFeature = obj || await this.pickMapFeature(screenPoint, view, hoverController.signal).catch(() => {\n            if (!hoverController.signal.aborted && this.state.jimuMapView?.view === view)\n              this.log(\"[Hover] Optional feature lookup failed; imagery hover remains available.\");\n            return null;\n          });"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/hoverFailureIsolation.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst source=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);\nlet pointer;function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(sf)==='view.on'&&node.arguments[0]?.text==='pointer-move')pointer=node.arguments[1];ts.forEachChild(node,visit)}visit(sf);assert(pointer);\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nconst flush=()=>new Promise(resolve=>setImmediate(resolve));\nfunction deferred(){let resolve,reject;return{promise:new Promise((yes,no)=>{resolve=yes;reject=no}),resolve,reject};}\nfunction setup({type='3d',pick,feature,hit}={}){\n const jobs=[],trace=[],view={type,zoom:19.9,container:{getBoundingClientRect:()=>({left:0,top:0})}};\n const w={state:{turboModeActive:true,jimuMapView:{view}},turboCoverageLayer:{},tooltipDiv:{},\n  pickTurboGraphic:pick||(async()=>({attributes:{image_id:'image'}})),hitTestHoverLayers:hit||(async()=>({results:[]})),pickMapFeature:feature||(async()=>null),\n  updateTurboHover:()=>trace.push('imagery'),clearTurboHoverDetails:()=>trace.push('clear'),\n  log:()=>trace.push('debug'),updateTurboPickWarning:()=>trace.push('warning'),_t:key=>key};\n const handler=new Function('view','TURBO_LIMITS','LAYER_IDS','setTimeout','clearTimeout','renderMapFeatureHoverLabel',compile('let hoverHitTestTimeout=null;return ('+pointer.getText(sf)+');')).call(w,view,{pickRadiusPx:8,hoverRadiusPx:8},{OBJECTS_FL:'objects',TRAFFIC_SIGNS_FL:'signs'},fn=>{jobs.push(fn);return jobs.length},()=>{},()=>trace.push('feature label'));\n return{w,view,trace,move:()=>handler({x:100,y:100}),run:()=>jobs.shift()()};\n}\nfor(const type of ['2d','3d'])test(`${type}: failed native detection lookup preserves successful coverage hover without an imagery error`,async()=>{\n const x=setup({type,feature:async()=>{throw Error('optional feature unavailable')}});x.move();await x.run();\n assert(x.trace.includes('imagery'));assert(!x.trace.includes('clear'));assert(!x.trace.includes('warning'));\n});\ntest('a detection error before slow coverage completion does not cancel that coverage',async()=>{\n const coverage=deferred(),x=setup({pick:()=>coverage.promise,feature:async()=>{throw Error('feature failure')}});\n x.move();const task=x.run();await flush();coverage.resolve({attributes:{image_id:'image'}});await task;\n assert(x.trace.includes('imagery'));assert(!x.trace.includes('clear'));assert(!x.trace.includes('warning'));\n});\ntest('a successful native detection retains priority over imagery',async()=>{\n const x=setup({feature:async()=>({graphic:{attributes:{name:'Sign'}}})});x.move();await x.run();assert.equal(x.trace.at(-1),'feature label');assert(x.trace.includes('clear'));\n});\ntest('an SDK detection hit avoids the native fallback and retains priority',async()=>{\n let calls=0;const x=setup({hit:async()=>({results:[{layer:{id:'signs'},graphic:{attributes:{name:'Sign'}}}]}),feature:async()=>{calls++;throw Error('must not run')}});x.move();await x.run();assert.equal(calls,0);assert.equal(x.trace.at(-1),'feature label');\n});\ntest('a failed optional lookup cannot manufacture a hover when coverage misses',async()=>{\n const x=setup({pick:async()=>null,feature:async()=>{throw Error('feature failure')}});x.move();await x.run();assert(!x.trace.includes('imagery'));assert(x.trace.includes('clear'));assert(!x.trace.includes('warning'));\n});\ntest('late failure after pointer cancellation produces neither fallback feedback nor warnings',async()=>{\n const feature=deferred(),x=setup({feature:()=>feature.promise});x.move();const work=x.run();await flush();x.w._turboHoverPickAbort.abort();const before=x.trace.slice();feature.reject(Error('late failure'));await work;assert.deepEqual(x.trace,before);\n});\ntest('late failure after view replacement produces neither fallback feedback nor warnings',async()=>{\n const feature=deferred(),x=setup({feature:()=>feature.promise});x.move();const work=x.run();await flush();x.w.state.jimuMapView.view={};const before=x.trace.slice();feature.reject(Error('old view'));await work;assert.deepEqual(x.trace,before);\n});\n"
    },
    {
      "file": "docs/HOVER-FAILURE-ISOLATION.md",
      "content": "# Isolate optional detection-hover failures\n\nImagery coverage picking and object/sign picking run independently inside the shared pointer callback. Previously a rejected native detection lookup reached the outer catch, which cleared the imagery pulse/card/highlight and could display an imagery lookup warning even after coverage picking succeeded.\n\nThe detection lookup now handles its own rejected promise, returning no feature. The existing imagery result and Places branch can proceed. A successful SDK or native detection hit retains its original priority and clears/replaces the transient imagery tooltip as before. Current-view/current-pointer guards remain in place. An optional failure is logged only through the existing debug logger, with no error object, credentials or source URL included. Coverage misses remain misses; no placeholder image identity is invented.\n\nThe change adds no downloads, retries, timers, polling, or renderer work. It does not change click handling, hover bearing selection, thumbnail retention, selected sequence overview or native circle geometry.\n\n## Validation\n\nEight real pointer-callback tests cover successful coverage before and after an optional failure, both 2D and 3D, native/SDK detection priority, coverage misses, cancellation and view replacement. Five of those tests fail on the previous implementation; all eight pass with isolation. Together with existing click, preview, bearing, cache and selected-sequence checks, 133 targeted tests pass. These are controlled asynchronous fixtures; a full Experience Builder build/live-host visual check was not available in this workspace.\n\n## Install\n\nFrom the widget root outside `src`:\n\n    node apply-hover-failure-isolation.cjs\n\nRebuild and reload Experience Builder. `--dry-run` checks targets without writing source. A standalone uninstaller reverts only this change and its added test/documentation. Earlier hover/click improvements remain. Edited source blocks are refused. Tests and builds are not run inside the installer.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'hover-failure-isolation-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.121 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'hover-failure-isolation' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.121 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.121 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-hover-failure-isolation.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Hover failure isolation is already installed. No files changed.');
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
  const manifest = { installer: 'hover-failure-isolation', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Hover failure isolation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
