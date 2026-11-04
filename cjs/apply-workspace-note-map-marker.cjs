#!/usr/bin/env node
'use strict';
/**
 * Workspace note map marker. Compatible current v6 sources.
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
              "label": "Workspace marker 1",
              "before": "  readShared(): { url?: string; loaded: boolean; view: V | null };\n  clearPending(): void;\n  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n * Preserve original readiness, asynchronous sharing, view/revision guards and error propagation.\n * No note cache, requests, timers, viewer updates or new draw supersession policy are introduced.\n */\nexport class FieldNoteMap<G extends NoteGroup<L>, L extends NoteGraphicsLayer<A>, A, V extends NoteMapView<G>> {\n  private currentGroup: G | null = null;\n  private currentLayer: L | null = null;\n  private groupView: V | null = null;\n  private groupVisible = true;\n  private revision = 0;\n",
              "after": "  readShared(): { url?: string; loaded: boolean; view: V | null };\n  clearPending(): void;\n  loadGroupFactory(): Promise<(properties: { id: string; title: string; visible: boolean; visibilityMode: 'independent' }) => G>;\n  loadLayerFactory(): Promise<(properties: { id: string; title: string; elevationInfo?: { mode: 'on-the-ground' } }) => L>;\n  /** Capture the live Graphic constructor once after removeAll, before iterating notes. */\n  readGraphicFactory(): (note: FieldNote, is3D: boolean) => A;\n}\n\n/** Own the existing note group/local graphics state; Enterprise layers remain runtime-owned children.\n * Preserve original readiness, asynchronous sharing, view/revision guards and error propagation.\n * Workspace navigation additionally owns one transient selection layer; it never saves notes.\n * No service requests, timers, viewer updates or local draw supersession policy are introduced.\n */\nexport class FieldNoteMap<G extends NoteGroup<L>, L extends NoteGraphicsLayer<A>, A, V extends NoteMapView<G>> {\n  private currentGroup: G | null = null;\n  private currentLayer: L | null = null;\n  private focusedLayer: L | null = null;\n  private focusRevision = 0;\n  private groupView: V | null = null;\n  private groupVisible = true;\n  private revision = 0;\n"
            },
            {
              "label": "Workspace marker 2",
              "before": "      const create = await d.loadGroupFactory();\n      if (revision !== this.revision || view.destroyed || !view.map || d.readContext().view !== view || d.readContext().disposed) return null;\n      if (this.currentGroup) {\n        this.groupVisible = this.currentGroup.visible;\n        this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n      }\n",
              "after": "      const create = await d.loadGroupFactory();\n      if (revision !== this.revision || view.destroyed || !view.map || d.readContext().view !== view || d.readContext().disposed) return null;\n      if (this.currentGroup) {\n        this.focusedLayer = null;\n        this.groupVisible = this.currentGroup.visible;\n        this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n      }\n"
            },
            {
              "label": "Workspace marker 3",
              "before": "   */\n  clear(): void {\n    ++this.revision;\n    this.dependencies.clearPending();\n    if (this.currentGroup) {\n      this.groupVisible = this.currentGroup.visible;\n      this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n    }\n    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n",
              "after": "   */\n  clear(): void {\n    ++this.revision;\n    ++this.focusRevision;\n    this.focusedLayer = null;\n    this.dependencies.clearPending();\n    if (this.currentGroup) {\n      this.groupVisible = this.currentGroup.visible;\n      this.groupView?.map?.remove(this.currentGroup); this.currentGroup.destroy();\n    }\n    this.currentGroup = null; this.groupView = null; this.currentLayer = null;\n  }\n\n  /** Show one navigation-only workspace note without adding it to local storage.\n   * A dedicated ground layer survives local redraws. New selections, cleanup and\n   * view changes invalidate pending SDK loads so an older marker cannot reappear.\n   * Passing null clears the selection when focusing a Local/Enterprise note.\n   */\n  async focusWorkspaceNote(note: FieldNote | null): Promise<void> {\n    const selection = ++this.focusRevision;\n    this.focusedLayer?.removeAll();\n    if (!note || !Number.isFinite(note.lon) || !Number.isFinite(note.lat)) return;\n    const d = this.dependencies, context = d.readContext(), view = context.view;\n    if (!view?.map || view.destroyed || !context.ready || context.disposed) return;\n    const revision = this.revision;\n    const current = () => selection === this.focusRevision && revision === this.revision\n      && d.readContext().view === view && !d.readContext().disposed && !view.destroyed;\n    const group = await this.ensureGroup(view);\n    if (!group || !current()) return;\n    if (!this.focusedLayer || this.focusedLayer.destroyed) {\n      const create = await d.loadLayerFactory();\n      if (!current()) return;\n      this.focusedLayer = create({ id: 'workspace-note-selection', title: 'Selected workspace note', elevationInfo: { mode: 'on-the-ground' } });\n    }\n    const layer = this.focusedLayer;\n    if (!group.layers.includes(layer)) group.layers.add(layer);\n    layer.removeAll();\n    layer.add(d.readGraphicFactory()(note, view.type === '3d'));\n  }\n\n  /** Rebuild local graphics using the existing layer/group readiness and live-view checks.\n"
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
              "label": "Workspace marker 1",
              "before": "  private focusFieldNote = (note: FieldNote) => {\n    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    this.navigateMapView(view, { center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });\n\n    // If the note has an associated image, jump the viewer there too\n",
              "after": "  private focusFieldNote = (note: FieldNote) => {\n    const view = this.state.jimuMapView?.view;\n    if (!view) return;\n    // Workspace records are navigation targets, not saved local graphics.\n    void this._fieldNoteMap.focusWorkspaceNote(note.id.startsWith('workspace:') ? note : null)\n      .catch(() => this.showToast(this._owned('Selected note marker could not be displayed. Try Show on map again.')));\n    this.navigateMapView(view, { center: [note.lon, note.lat], zoom: Math.max(view.zoom, 18) }, { animate: true, duration: 600 });\n\n    // If the note has an associated image, jump the viewer there too\n"
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
              "label": "Workspace marker 1",
              "before": " await compare(async h=>{h.w.ArcGISModules.Graphic=class{constructor(props){Object.assign(this,props);h.w.ArcGISModules.Graphic=class{constructor(){throw Error('registry changed')}}}};await h.draw();assert.equal(h.layers[0].graphics.length,2)});\n await compare(async h=>{const p=h.draw();h.resolve(0);await flush();h.w.state.fieldNotes=[];h.w.ArcGISModules=null;h.resolve(1);await assert.rejects(p);assert.equal(h.layers[0].graphics.length,0)},{hold:true});\n});\n",
              "after": " await compare(async h=>{h.w.ArcGISModules.Graphic=class{constructor(props){Object.assign(this,props);h.w.ArcGISModules.Graphic=class{constructor(){throw Error('registry changed')}}}};await h.draw();assert.equal(h.layers[0].graphics.length,2)});\n await compare(async h=>{const p=h.draw();h.resolve(0);await flush();h.w.state.fieldNotes=[];h.w.ArcGISModules=null;h.resolve(1);await assert.rejects(p);assert.equal(h.layers[0].graphics.length,0)},{hold:true});\n});\n\n// Workspace navigation has no local copy; selection belongs to the map owner only.\ntest('workspace focus renders a ground marker in 2D/3D with an empty local collection',async()=>{\n for(const type of ['2d','3d']){const h=setup('working',{type});h.w.state.fieldNotes=[];const target=note('workspace:remote',{alt:undefined});\n await h.w._fieldNoteMap.focusWorkspaceNote(target);\n const layer=h.layers.find(l=>l.id==='workspace-note-selection');assert(layer);assert.equal(layer.elevationInfo.mode,'on-the-ground');\n assert.equal(layer.graphics.length,1);assert.equal(layer.graphics[0].geometry.longitude,target.lon);assert.equal(layer.graphics[0].attributes.id,target.id);assert.equal(h.w.state.fieldNotes.length,0);\n await h.draw();assert.equal(layer.graphics.length,1);assert.equal(h.layer().graphics.length,0);\n }\n});\ntest('workspace selection replaces its marker and Local/Enterprise focus clears it',async()=>{\n const h=setup('working');await h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:first'));\n await h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:second',{lon:5}));assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics.length,1);assert.equal(h.layers[0].graphics[0].geometry.longitude,5);\n await h.w._fieldNoteMap.focusWorkspaceNote(null);assert.equal(h.layers[0].graphics.length,0);\n});\ntest('late workspace selections cannot replace a newer marker',async()=>{\n const h=setup('working',{hold:true});const old=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:old'));h.resolve(0);await flush();assert.equal(h.loads.length,2);\n const latest=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:latest'));await flush();h.resolve(2);await latest;h.resolve(1);await old;\n assert.equal(h.layers.length,1);assert.equal(h.layers[0].graphics[0].attributes.id,'workspace:latest');\n});\ntest('clear or view replacement during workspace SDK loading prevents stale attachment',async()=>{\n for(const mode of ['clear','view','local']){const h=setup('working',{hold:true});const pending=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:old'));h.resolve(0);await flush();\n if(mode==='clear')h.clear();else if(mode==='view')h.w.state.jimuMapView={view:h.view()};else await h.w._fieldNoteMap.focusWorkspaceNote(null);\n h.resolve(1);await pending;assert.equal(h.layers.length,0);\n }\n});\ntest('workspace layer loading failure is retryable and does not mutate local notes',async()=>{\n const h=setup('working',{hold:true});const before=structuredClone(h.w.state.fieldNotes);const failed=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:a'));h.resolve(0);await flush();h.loads[1].reject(Error('layer unavailable'));await assert.rejects(failed);\n const retry=h.w._fieldNoteMap.focusWorkspaceNote(note('workspace:a'));await flush();h.resolve(2);await retry;assert.equal(h.layers[0].graphics.length,1);assert.deepEqual(h.w.state.fieldNotes,before);\n});\ntest('actual Show on map dispatches workspace marker selection and preserves navigation',async()=>{\n const method=cl.members.find(n=>n.name?.getText(sf)==='focusFieldNote').getText(sf);\n const Harness=new Function(compile('class Widget{'+method+'};return Widget;'))();const w=new Harness(),selected=[],moves=[];\n w.state={jimuMapView:{view:{zoom:15}},imageId:null};w._fieldNoteMap={focusWorkspaceNote:async n=>selected.push(n)};w.navigateMapView=(...args)=>moves.push(args);w.showToast=()=>{};\n w.focusFieldNote(note('workspace:remote'));w.focusFieldNote(note('local'));await flush();assert.equal(selected[0].id,'workspace:remote');assert.equal(selected[1],null);assert.equal(moves.length,2);assert.deepEqual(moves[0][1],{center:[1,2],zoom:18});\n});\n"
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
const prefix = 'workspace-note-map-marker-';

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
    if (manifest.installer !== 'workspace-note-map-marker' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-note-map-marker.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace note map marker is already installed. No files changed.');
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
  const manifest = { installer: 'workspace-note-map-marker', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Workspace note map marker ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
