#!/usr/bin/env node
'use strict';
/**
 * Places back to place v6.59. Compatible current v6 sources.
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
      "file": "src/components/SelectedPlaceCard.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "back to selected place 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <img src={placeCategoryIcon(props.place.group, true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>×</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} · <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n  <div title=\"Approximate straight-line distance, not walking distance or visibility\" style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{props.cameraDistance || 'Open an image for camera distance'}</div>\n  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type=\"checkbox\" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/>Show camera link</label>\n</div>;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => <section aria-label=\"Selected place\" style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>;\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; onBack?(): void; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <img src={placeCategoryIcon(props.place.group, true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>\n    <button type=\"button\" title=\"Open selected place details\" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label=\"Clear selected place\" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>×</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} · <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}>Overture</a></div>\n  <div title=\"Approximate straight-line distance, not walking distance or visibility\" style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{props.cameraDistance || 'Open an image for camera distance'}</div>\n  {props.onBack && <button type=\"button\" onClick={props.onBack} title=\"Center the map on this place\" style={{ display: 'block', width: '100%', minHeight: 28, marginTop: 5, padding: '4px 7px', border: '1px solid #61846e', borderRadius: 4, background: '#284b38', color: 'inherit', font: 'inherit', fontSize: 11, textAlign: 'left', cursor: 'pointer' }}>Back to place</button>}\n  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type=\"checkbox\" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/>Show camera link</label>\n</div>;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => <section aria-label=\"Selected place\" style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>;\n"
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
              "label": "back to selected place 1",
              "before": "    if (!view?.ready || view.destroyed || !bounds || !this.ArcGISModules?.Point) return;\n    const [west, south, east, north] = paddedPlacesExtent(bounds);\n    const Point = this.ArcGISModules.Point;\n    this.navigateMapView(view, { target: [new Point({ longitude: west, latitude: south, spatialReference: { wkid: 4326 } }), new Point({ longitude: east, latitude: north, spatialReference: { wkid: 4326 } })] }, { animate: false });\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n",
              "after": "    if (!view?.ready || view.destroyed || !bounds || !this.ArcGISModules?.Point) return;\n    const [west, south, east, north] = paddedPlacesExtent(bounds);\n    const Point = this.ArcGISModules.Point;\n    this.navigateMapView(view, { target: [new Point({ longitude: west, latitude: south, spatialReference: { wkid: 4326 } }), new Point({ longitude: east, latitude: north, spatialReference: { wkid: 4326 } })] }, { animate: false });\n  };\n  private goToSelectedPlace = () => {\n    const place = this.state.selectedPlace, view = this.state.jimuMapView?.view;\n    if (!this.state.placesActive || !place || !view?.ready || view.destroyed || !this.ArcGISModules?.Point || !Number.isFinite(place.lon) || !Number.isFinite(place.lat) || Math.abs(place.lon) > 180 || Math.abs(place.lat) > 85.051129) return;\n    const center = new this.ArcGISModules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });\n    this.navigateMapView(view, { center, zoom: Number.isFinite(view.zoom) ? Math.max(view.zoom, 16) : 16 }, { animate: false });\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n"
            },
            {
              "label": "back to selected place 2",
              "before": "\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel onGoToArea={this.goToPlacesArea} group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id)}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink} cameraDistance={this.state.placesCameraDistance}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />\n\n",
              "after": "\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel onGoToArea={this.goToPlacesArea} group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id)}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            onBack: this.goToSelectedPlace, onDetails: () => this._places?.open([], this.state.selectedPlace?.id), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink} cameraDistance={this.state.placesCameraDistance}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n          onBack={this.goToSelectedPlace} onDetails={() => this._places?.open([], this.state.selectedPlace?.id)} onClear={() => this._places?.clearSelection()}/>}\n\n        {/* Splash Screen */}\n        <SplashScreen showIntro={this.state.showIntro} filtersLoaded={this.state.filtersLoaded} onDismiss={this.dismissIntro} />\n\n"
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
              "label": "back to selected place 1",
              "before": " assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'Capture date unknown · About 33 m away');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^Captured .*2024 · About 0 m away$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Capture date unknown · Distance unknown');\n});\n",
              "after": " assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'Capture date unknown · About 33 m away');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^Captured .*2024 · About 0 m away$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Capture date unknown · Distance unknown');\n});\n\ntest('Back to place centers either map mode without touching imagery or selection',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToSelectedPlace').getText(sf);const Runtime=new Function(compile('class Runtime{'+member+'}\\nreturn Runtime;'))();\n for(const type of ['2d','3d']) {\n  const w=new Runtime(),place={id:'poi',lon:-86.13,lat:39.78},view={ready:true,destroyed:false,type,zoom:13};let calls=0;\n  w.state=Object.freeze({placesActive:true,selectedPlace:place,jimuMapView:{view}});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};\n  w.setState=()=>{throw Error('must retain state')};w.openPlaceImagery=()=>{throw Error('must not navigate imagery')};\n  w.navigateMapView=(actual,target,options)=>{calls++;assert.equal(actual,view);assert.equal(target.center.longitude,place.lon);assert.equal(target.center.latitude,place.lat);assert.equal(target.center.spatialReference.wkid,4326);assert.equal(target.zoom,Math.max(Number.isFinite(view.zoom)?view.zoom:16,16));assert.equal(options.animate,false)};\n  w.goToSelectedPlace();view.zoom=19;w.goToSelectedPlace();view.zoom=NaN;w.goToSelectedPlace();assert.equal(calls,3);assert.equal(w.state.selectedPlace,place);\n  view.destroyed=true;w.goToSelectedPlace();view.destroyed=false;view.ready=false;w.goToSelectedPlace();view.ready=true;\n  w.state={...w.state,placesActive:false};w.goToSelectedPlace();w.state={...w.state,placesActive:true,selectedPlace:null};w.goToSelectedPlace();w.state={...w.state,selectedPlace:{lon:Infinity,lat:0}};w.goToSelectedPlace();assert.equal(calls,3);\n }\n});\n"
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
              "label": "back to selected place 1",
              "before": "\n## v6.58 · Clearer imagery choices\n\nThe first existing ranked image is labeled Suggested view; each button shows Facing the place, Panorama, Side view, Facing away or Direction unknown. A compact line underneath gives capture date and approximate straight-line distance. One shared note explains that direction is estimated and visibility is not confirmed. Neutral button styling and the SDK popup shell remain. Ranking, radius choices, explicit navigation, pending-click guards and stale-response cleanup are unchanged. No thumbnail, request, timer or background work is introduced.\n",
              "after": "\n## v6.58 · Clearer imagery choices\n\nThe first existing ranked image is labeled Suggested view; each button shows Facing the place, Panorama, Side view, Facing away or Direction unknown. A compact line underneath gives capture date and approximate straight-line distance. One shared note explains that direction is estimated and visibility is not confirmed. Neutral button styling and the SDK popup shell remain. Ranking, radius choices, explicit navigation, pending-click guards and stale-response cleanup are unchanged. No thumbnail, request, timer or background work is introduced.\n\n## v6.59 · Back to place\n\nThe selected-place summary offers Back to place inside the filters panel and in its standalone card. The explicit action centers the active 2D/3D map at the selected coordinates, retaining closer zooms or using zoom 16 when farther out. It uses the existing guarded navigation helper without animation. It does not select/load an image, open the popup, clear selection or reset category filters. Disabled Places, missing selection and unavailable views do nothing. Normal map/viewport loading may follow the navigation; normal imagery-follow behavior is unchanged.\n"
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
const prefix = 'places-back-to-place-v6-59-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.59 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-back-to-place-v6-59' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.59 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.59 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.59 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-back-to-place-v6-59.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places back to place v6.59 is already installed. No files changed.');
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
  const manifest = { installer: 'places-back-to-place-v6-59', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places back to place v6.59 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
