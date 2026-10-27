#!/usr/bin/env node
'use strict';
/**
 * Places empty result recovery v6.60. Compatible current v6 sources.
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
      "file": "src/components/PlacesPanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "empty result recovery 1",
              "before": "import { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const messages = { outside: 'Outside this layer’s published Places area.', off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places…', ready: props.status.limited ? `${props.status.count} matching loaded places.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };\n  const categories = [['all', 'All'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Sights'], ['services', 'Services']] as const;\n  const counts = props.status.kind === 'ready' ? props.status.loadedCounts : undefined;\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>\n",
              "after": "import { LoadedPlacesList } from './LoadedPlacesList';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n  const empty = props.status.kind === 'ready' && props.status.count === 0;\n  const canShowAll = empty && props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0;\n  const readyMessage = empty\n    ? (props.group !== 'all' ? 'No loaded places match this category.' : 'No places loaded in this area.')\n    : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} shown.`;\n  const readyHint = props.status.limited ? ' Only part of this area is loaded. Zoom closer to check for more matches.' : empty && !canShowAll ? ' Try a nearby area or zoom closer.' : '';\n  const messages = { outside: 'Outside this layer’s published Places area.', off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places…', ready: readyMessage + readyHint, error: 'Places could not load. Try again.' };\n  const categories = [['all', 'All'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Sights'], ['services', 'Services']] as const;\n  const counts = props.status.kind === 'ready' ? props.status.loadedCounts : undefined;\n  return <section aria-label=\"Nearby places\" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type=\"button\" aria-label=\"Close nearby places filters\" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>\n"
            },
            {
              "label": "empty result recovery 2",
              "before": "    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}>More categories</span><select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}>Counts are for loaded places{props.status.limited ? ' · zoom closer for more' : ''}.</div>}\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}>Go to covered area</button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>\n  </section>;\n};\n",
              "after": "    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}>More categories</span><select aria-label=\"Place category\" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}>Counts are for loaded places.</div>}\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {canShowAll && <button type=\"button\" onClick={() => props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>Show all loaded places</button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}>Go to covered area</button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry}>Retry places</button>}\n    {props.onSelect && !empty && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>\n  </section>;\n};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "empty result recovery 1",
              "before": "            const detail = document.createElement('p'); detail.textContent = placeImageryChoiceMeta(image); detail.className = 'mly-place-meta mly-place-choice-meta';\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search farther · within 250 m';\n          status.textContent = 'No image found within 75 m. You can try a wider area.';\n        } else {\n          button.textContent = 'Search again · within 250 m'; status.textContent = 'No suitable image found within 250 m.';\n        }\n      } catch (error) {\n        if (!controller.signal.aborted && active()) { button.textContent = `Retry search · within ${radius} m`; status.textContent = 'Imagery search could not finish. Please try again.'; }\n      } finally {\n",
              "after": "            const detail = document.createElement('p'); detail.textContent = placeImageryChoiceMeta(image); detail.className = 'mly-place-meta mly-place-choice-meta';\n            alternatives.appendChild(option); alternatives.appendChild(detail);\n          }\n        } else if (radius === 75) {\n          radius = 250; button.textContent = 'Search within 250 m';\n          status.textContent = 'No nearby imagery found within 75 m. Search a wider area if you’d like.';\n        } else {\n          button.textContent = 'Search again · within 250 m'; status.textContent = 'No suitable imagery found within 250 m. Try another place or search again later.';\n        }\n      } catch (error) {\n        if (!controller.signal.aborted && active()) { button.textContent = `Retry search · within ${radius} m`; status.textContent = 'Imagery search could not finish. Please try again.'; }\n      } finally {\n"
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
              "label": "empty result recovery 1",
              "before": " const calls=[];let navigations=0;const place={id:'p',name:'Museum',category:'museum',address:'',website:'',release:'',lon:0,lat:0};const view={destroyed:false,watch(){return{remove(){}};},openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'popup',url:'https://host/FeatureServer/0',modules:{Point:class{constructor(p){Object.assign(this,p);}}},view:()=>view,busy:()=>false,status(){},geographic:x=>x,explore:(p,radius,signal)=>new Promise((resolve,reject)=>calls.push({radius,signal,resolve,reject})),openImagery(){navigations++;}});\n owner.ownerView=view;owner.graphics={visible:true,destroy(){}};owner.records.set('p',place);\n try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve([]);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search farther · within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[1].radius,250);calls[1].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search · within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[2].signal.aborted);calls[2].resolve([{id:'image',distance:30}]);await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','rankPlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.rankPlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n",
              "after": " const calls=[];let navigations=0;const place={id:'p',name:'Museum',category:'museum',address:'',website:'',release:'',lon:0,lat:0};const view={destroyed:false,watch(){return{remove(){}};},openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'popup',url:'https://host/FeatureServer/0',modules:{Point:class{constructor(p){Object.assign(this,p);}}},view:()=>view,busy:()=>false,status(){},geographic:x=>x,explore:(p,radius,signal)=>new Promise((resolve,reject)=>calls.push({radius,signal,resolve,reject})),openImagery(){navigations++;}});\n owner.ownerView=view;owner.graphics={visible:true,destroy(){}};owner.records.set('p',place);\n try{\n assert(owner.open([],'p'));let button=view.popup.content.children.find(x=>x.type==='button');const first=button.onclick();assert.equal(calls[0].radius,75);await button.onclick();assert.equal(calls.length,1);calls[0].resolve([]);await first;assert.equal(calls.length,1);assert.equal(button.textContent,'Search within 250 m');assert.equal(navigations,0);\n const emptyWide=button.onclick();assert.equal(calls[1].radius,250);calls[1].resolve([]);await emptyWide;assert.equal(calls.length,2);assert.equal(button.textContent,'Search again · within 250 m');assert.equal(navigations,0);\n const second=button.onclick();assert.equal(calls[2].radius,250);calls[2].reject(Error('offline'));await second;assert.equal(button.textContent,'Retry search · within 250 m');assert.equal(navigations,0);\n const third=button.onclick();assert(owner.open([],'p'));assert(calls[3].signal.aborted);calls[3].resolve([{id:'image',distance:30}]);await third;assert.equal(navigations,0);assert.equal(view.popup.content.children.find(x=>x.type==='button').textContent,'Find imagery within 75 m');\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('actual widget search returns a candidate without navigation and rejects superseded requests',async()=>{\n const method=widget.members.find(m=>m.name?.getText(sf)==='explorePlace').getText(sf);const Runtime=new Function('placeImageryBbox','rankPlaceImagery','distanceMeters','GRAPH_API',compile('class Runtime{'+method+'}\\nreturn Runtime;'))(nearby.placeImageryBbox,nearby.rankPlaceImagery,distance,{BASE:'https://graph.mapillary.com'});\n"
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
              "label": "empty result recovery 1",
              "before": "\n## v6.59 · Back to place\n\nThe selected-place summary offers Back to place inside the filters panel and in its standalone card. The explicit action centers the active 2D/3D map at the selected coordinates, retaining closer zooms or using zoom 16 when farther out. It uses the existing guarded navigation helper without animation. It does not select/load an image, open the popup, clear selection or reset category filters. Disabled Places, missing selection and unavailable views do nothing. Normal map/viewport loading may follow the navigation; normal imagery-follow behavior is unchanged.\n",
              "after": "\n## v6.59 · Back to place\n\nThe selected-place summary offers Back to place inside the filters panel and in its standalone card. The explicit action centers the active 2D/3D map at the selected coordinates, retaining closer zooms or using zoom 16 when farther out. It uses the existing guarded navigation helper without animation. It does not select/load an image, open the popup, clear selection or reset category filters. Disabled Places, missing selection and unavailable views do nothing. Normal map/viewport loading may follow the navigation; normal imagery-follow behavior is unchanged.\n\n## v6.60 · Empty-result recovery\n\nA category with zero loaded matches offers Show all loaded places when other loaded records exist. It reuses the local category callback and preserves selection. Empty whole-area results suggest a nearby area or closer zoom, without implying the service has no data. Limited results explicitly say only part of the area is loaded and suggest zooming closer; counts remain loaded-subset counts. The empty Browse list is hidden to avoid duplicate/conflicting guidance. Imagery with no result at 75m offers Search within 250 m, still only on explicit click. Empty 250m results suggest another place or a later retry; no automatic expansion or retry is added.\n"
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
const prefix = 'places-empty-results-v6-60-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.60 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-empty-results-v6-60' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.60 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.60 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.60 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-empty-results-v6-60.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places empty result recovery v6.60 is already installed. No files changed.');
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
  const manifest = { installer: 'places-empty-results-v6-60', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places empty result recovery v6.60 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
