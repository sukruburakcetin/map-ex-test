#!/usr/bin/env node
'use strict';
/**
 * Places keyboard focus v6.63. Compatible current v6 sources.
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
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "keyboard focus 1",
              "before": "import { groupOverlappingPlaces, placeCountSymbol, PlaceGroupMarker } from './overlappingPlaces';\nimport { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategoryIcon, placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\n",
              "after": "import { PlacePopupFocus } from './PlacePopupFocus';\nimport { groupOverlappingPlaces, placeCountSymbol, PlaceGroupMarker } from './overlappingPlaces';\nimport { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategoryIcon, placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\n"
            },
            {
              "label": "keyboard focus 2",
              "before": "  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n  private popupView: any = null;\n  private popupContent: HTMLDivElement | null = null;\n  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n",
              "after": "  private handles: { remove(): void }[] = [];\n  private attribution: HTMLDivElement | null = null;\n  private disposed = false;\n  private searchAbort: AbortController | null = null;\n  private popupFocus = new PlacePopupFocus();\n  private popupView: any = null;\n  private popupContent: HTMLDivElement | null = null;\n  readonly selection: SelectedPlace;\n  readonly controller: PlacesController;\n"
            },
            {
              "label": "keyboard focus 3",
              "before": "  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const group = valid ? this.groups.get(targetId || this.hit(results)?.id || '') : null;\n    if (group) return this.openGroup(group);\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    this.setHover(null);\n    this.selection.select(place);\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const name = document.createElement('strong'); name.className = 'mly-place-name'; name.textContent = place.name; content.appendChild(name);\n",
              "after": "  open(results: any[], targetId?: string | null): boolean {\n    const view = this.host.view();\n    const valid = !this.disposed && this.graphics?.visible && this.ownerView === view && !view?.destroyed;\n    const group = valid ? this.groups.get(targetId || this.hit(results)?.id || '') : null;\n    if (group) return this.openGroup(group, this.popupFocus.capture(view));\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    const origin = this.popupFocus.capture(view);\n    this.setHover(null);\n    this.selection.select(place);\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const name = document.createElement('strong'); name.className = 'mly-place-name'; name.textContent = place.name; content.appendChild(name);\n"
            },
            {
              "label": "keyboard focus 4",
              "before": "    };\n    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' · ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.className = 'mly-place-source'; content.appendChild(source);\n    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);\n    this.popupContent = content; this.popupView = view;\n    view.openPopup({ title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  private openGroup(group: PlaceGroupMarker): boolean {\n    const view = this.host.view(); if (!view || view.destroyed || this.disposed) return false;\n    this.closeDetails();\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const heading = document.createElement('strong'); heading.textContent = `${group.members.length} places here`; content.appendChild(heading);\n",
              "after": "    };\n    const source = document.createElement('p'); source.textContent = `Overture Maps${place.release ? ' · ' + place.release : ''}. Imagery may be near this place rather than at its entrance.`; source.className = 'mly-place-source'; content.appendChild(source);\n    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);\n    this.popupContent = content; this.popupView = view;\n    this.popupFocus.open(view, { title: 'Nearby place', content, location: new this.host.modules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } }) }, origin);\n    return true;\n  }\n  private openGroup(group: PlaceGroupMarker, origin: HTMLElement | null): boolean {\n    const view = this.host.view(); if (!view || view.destroyed || this.disposed) return false;\n    this.closeDetails();\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const heading = document.createElement('strong'); heading.textContent = `${group.members.length} places here`; content.appendChild(heading);\n"
            },
            {
              "label": "keyboard focus 5",
              "before": "    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name));\n    const selectedIndex = members.findIndex(place => place.id === this.selection.place?.id);\n    let page = selectedIndex < 0 ? 0 : Math.floor(selectedIndex / 4);\n    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;\n    const render = () => {\n      list.replaceChildren();\n      for (const place of members.slice(page * 4, page * 4 + 4)) {\n        const selected = place.id === this.selection.place?.id, category = place.category.replace(/_/g, ' ');\n        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open mly-place-group-row'; button.title = place.name;\n",
              "after": "    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name));\n    const selectedIndex = members.findIndex(place => place.id === this.selection.place?.id);\n    let page = selectedIndex < 0 ? 0 : Math.floor(selectedIndex / 4);\n    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;\n    const render = (moveFocus = false) => {\n      list.replaceChildren();\n      for (const place of members.slice(page * 4, page * 4 + 4)) {\n        const selected = place.id === this.selection.place?.id, category = place.category.replace(/_/g, ' ');\n        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open mly-place-group-row'; button.title = place.name;\n"
            },
            {
              "label": "keyboard focus 6",
              "before": "        button.appendChild(text);\n        button.onclick = () => { if (active() && this.records.has(place.id)) this.open([], place.id); }; list.appendChild(button);\n      }\n      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;\n    };\n    previous.onclick = () => { if (active() && page > 0) { page--; render(); } }; next.onclick = () => { if (active() && (page + 1) * 4 < members.length) { page++; render(); } };\n    const source = document.createElement('p'); source.textContent = 'Loaded places · Overture Maps'; content.appendChild(source);\n    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);\n    this.popupContent = content; this.popupView = view; render();\n    view.openPopup({ title: 'Nearby places', content, location: new this.host.modules.Point({ longitude: group.anchor.lon, latitude: group.anchor.lat, spatialReference: { wkid: 4326 } }) });\n    return true;\n  }\n  clearSelection(): void { this.selection.clear(); this.closeDetails(); }\n  private closeDetails(): void {\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n    this.popupContent = null; this.popupView = null;\n  }\n",
              "after": "        button.appendChild(text);\n        button.onclick = () => { if (active() && this.records.has(place.id)) this.open([], place.id); }; list.appendChild(button);\n      }\n      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;\n      if (moveFocus) list.querySelector?.('button')?.focus({ preventScroll: true });\n    };\n    previous.onclick = () => { if (active() && page > 0) { page--; render(true); } }; next.onclick = () => { if (active() && (page + 1) * 4 < members.length) { page++; render(true); } };\n    const source = document.createElement('p'); source.textContent = 'Loaded places · Overture Maps'; content.appendChild(source);\n    const style = document.createElement('style'); style.textContent = PLACE_POPUP_CSS; content.appendChild(style);\n    this.popupContent = content; this.popupView = view; render();\n    this.popupFocus.open(view, { title: 'Nearby places', content, location: new this.host.modules.Point({ longitude: group.anchor.lon, latitude: group.anchor.lat, spatialReference: { wkid: 4326 } }) }, origin);\n    return true;\n  }\n  clearSelection(): void { this.selection.clear(); this.closeDetails(); }\n  private closeDetails(): void {\n    this.popupFocus.cancel();\n    this.searchAbort?.abort(); this.searchAbort = null;\n    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n    this.popupContent = null; this.popupView = null;\n  }\n"
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
              "label": "keyboard focus 1",
              "before": "  handler({x:20,y:20});await task();if(late){resolveCoverage(picked);await flush();}\n  assert.equal(tests,1);assert.equal(label,'Library · public library');assert.equal(hovered,'p');\n }\n});\n",
              "after": "  handler({x:20,y:20});await task();if(late){resolveCoverage(picked);await flush();}\n  assert.equal(tests,1);assert.equal(label,'Library · public library');assert.equal(hovered,'p');\n }\n});\ntest('popup focus returns to its original trigger across chooser/details and cleans up its watcher',async()=>{\n const {PlacePopupFocus}=load('PlacePopupFocus'),old=global.document;const body={},trigger={isConnected:true,hasAttribute:()=>false,getClientRects:()=>[{}],focus(){global.document.activeElement=this;}};let changes,removed=0,focused=0,options;\n global.document={body,activeElement:trigger};const popup={visible:true,content:null,container:{},watch(keys,callback){changes=callback;return{remove(){removed++;}}}},view={popup,container:{},openPopup(o){options=o;popup.content=o.content;popup.visible=true;global.document.activeElement={parentNode:o.content};},focus(){focused++;}};\n try{\n  const focus=new PlacePopupFocus(),chooser={};focus.open(view,{content:chooser},focus.capture(view));await flush();assert.equal(options.shouldFocus,true);assert.equal(focus.capture(view),trigger);\n  const origin=focus.capture(view),details={};focus.open(view,{content:details},origin);await flush();assert.equal(removed,1);popup.visible=false;changes();assert.equal(global.document.activeElement,trigger);assert.equal(removed,2);assert.equal(focused,0);\n  focus.open(view,{content:{}},trigger);await flush();trigger.isConnected=false;popup.visible=false;changes();assert.equal(focused,1);focus.cancel();assert.equal(removed,3);\n }finally{global.document=old;}\n});\ntest('popup focus never steals focus from another control, replacement popup or cancelled open',async()=>{\n const {PlacePopupFocus}=load('PlacePopupFocus'),old=global.document;let changes,removed=0,restored=0,resolve;\n const body={},trigger={isConnected:true,hasAttribute:()=>false,getClientRects:()=>[{}],focus(){restored++;}},popup={visible:true,content:null,watch(keys,callback){changes=callback;return{remove(){removed++;}}}},view={popup,focus(){restored++;},openPopup(o){popup.content=o.content;popup.visible=true;}};global.document={body,activeElement:trigger};\n try{\n  const focus=new PlacePopupFocus();focus.open(view,{content:{}},trigger);await flush();global.document.activeElement={};popup.visible=false;changes();assert.equal(restored,0);assert.equal(removed,1);\n  focus.open(view,{content:{}},trigger);await flush();global.document.activeElement=body;popup.content={};changes();assert.equal(restored,0);assert.equal(removed,2);\n  view.openPopup=o=>new Promise(r=>{popup.content=o.content;resolve=r;});focus.open(view,{content:{}},trigger);focus.cancel();resolve();await flush();assert.equal(removed,2);assert.equal(restored,0);\n }finally{global.document=old;}\n});\n"
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
              "label": "keyboard focus 1",
              "before": "\n## v6.62 · POI hover feedback\n\nThe existing shared map tooltip shows a place’s name and readable category, or a group count with Click to choose. Object/sign picking keeps priority; a direct loaded POI hit takes precedence over a nearby coverage hover. The same existing SDK hit test is reused. Hover enlarges only the existing local marker by 3pt in each dimension using a cloned symbol, leaving cached symbols and the gold selected marker unchanged. Repeated hits reuse the temporary symbol. Hover restores on exit, another feature, hiding/pausing, redraw, selection or disposal. No extra graphic, query, request, timer or animation loop is added. Touch selection remains click-driven.\n",
              "after": "\n## v6.62 · POI hover feedback\n\nThe existing shared map tooltip shows a place’s name and readable category, or a group count with Click to choose. Object/sign picking keeps priority; a direct loaded POI hit takes precedence over a nearby coverage hover. The same existing SDK hit test is reused. Hover enlarges only the existing local marker by 3pt in each dimension using a cloned symbol, leaving cached symbols and the gold selected marker unchanged. Repeated hits reuse the temporary symbol. Hover restores on exit, another feature, hiding/pausing, redraw, selection or disposal. No extra graphic, query, request, timer or animation loop is added. Touch selection remains click-driven.\n\n## v6.63 · Popup keyboard focus\n\nPlaces popups request native SDK focus with shouldFocus. A watcher scoped to the owned popup returns focus to the connected originating control on user close; if that control was removed, it falls back to the active map. It does not restore focus when another control already owns focus, a different popup replaces the content, or the view/feature is removed. Moving from a group chooser to details preserves the original return target. Paging focuses the first new row, avoiding focus left on disabled paging controls. SDK Escape/Tab behavior is unchanged; no key trap, document listener, polling or request is added. The watcher is removed on replacement/close/cleanup and pending opens are guarded.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/PlacePopupFocus.ts",
      "content": "/** Native popup entry plus one owned close watcher; no keyboard trap or polling. */\nexport class PlacePopupFocus {\n  private session: { view: any; content: HTMLElement; origin: HTMLElement | null; popup?: any; handle?: { remove(): void } } | null = null;\n  private active(): HTMLElement | null {\n    let node = typeof document === 'undefined' ? null : document.activeElement;\n    while (node?.shadowRoot?.activeElement) node = node.shadowRoot.activeElement;\n    return node as HTMLElement | null;\n  }\n  private inside(node: HTMLElement | null, session: NonNullable<PlacePopupFocus['session']>): boolean {\n    if (!node) return false;\n    // Follow composed ancestry so Calcite's shadow-DOM controls count as popup focus.\n    for (let current: any = node; current; current = current.parentNode || current.host) {\n      if (current === session.content || current === session.popup?.container) return true;\n    }\n    return false;\n  }\n  capture(view: any): HTMLElement | null {\n    const active = this.active(), session = this.session;\n    if (session && session.view === view && this.inside(active, session)) return session.origin;\n    return active && active !== document.body ? active : null;\n  }\n  open(view: any, options: { content: HTMLElement; [key: string]: any }, origin: HTMLElement | null): void {\n    this.cancel();\n    const session = { view, content: options.content, origin } as NonNullable<PlacePopupFocus['session']>;\n    this.session = session;\n    try {\n      void Promise.resolve(view.openPopup({ ...options, shouldFocus: true })).then(() => {\n        if (this.session !== session || view.destroyed) return;\n        const popup = view.popup;\n        if (!popup || popup.content !== session.content) { this.cancel(); return; }\n        session.popup = popup;\n        const changed = () => {\n          if (this.session !== session) return;\n          if (popup.content !== session.content) this.cancel();\n          else if (popup.visible === false) this.finish(session);\n        };\n        session.handle = popup.watch?.(['visible', 'content'], changed);\n        changed();\n      }).catch(() => { if (this.session === session) this.cancel(); });\n    } catch { this.cancel(); }\n  }\n  private finish(session: NonNullable<PlacePopupFocus['session']>): void {\n    const active = this.active();\n    const restore = !session.view.destroyed && (this.inside(active, session) || !active || active === document.body || active === session.view.container);\n    this.cancel();\n    if (!restore) return;\n    const origin = session.origin;\n    if (origin?.isConnected && !origin.hasAttribute('disabled') && origin.getClientRects().length) origin.focus({ preventScroll: true });\n    else session.view.focus?.();\n  }\n  cancel(): void {\n    const session = this.session; this.session = null;\n    session?.handle?.remove();\n  }\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-keyboard-focus-v6-63-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.63 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-keyboard-focus-v6-63' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.63 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.63 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.63 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-keyboard-focus-v6-63.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places keyboard focus v6.63 is already installed. No files changed.');
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
  const manifest = { installer: 'places-keyboard-focus-v6-63', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places keyboard focus v6.63 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
