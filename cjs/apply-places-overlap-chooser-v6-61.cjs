#!/usr/bin/env node
'use strict';
/**
 * Places overlap chooser v6.61. Compatible current v6 sources.
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
              "label": "overlap chooser 1",
              "before": "import { groupOverlappingPlaces, placeCountSymbol, PlaceGroupMarker } from './overlappingPlaces';\nimport { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryChoiceMeta } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, PlaceBbox, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\n",
              "after": "import { groupOverlappingPlaces, placeCountSymbol, PlaceGroupMarker } from './overlappingPlaces';\nimport { publishedPlacesExtent, outsidePublishedExtent } from './publishedPlacesExtent';\nimport { PLACE_POPUP_CSS } from './placePopupStyles';\nimport { placeCategoryIcon, placeCategorySymbol, PLACE_ICON_RADIUS } from './placeIcons';\nimport { SelectedPlace } from './SelectedPlace';\nimport { PlaceImagery, placeImageryDirectionLabel, placeImageryChoiceMeta } from './nearbyPlaceImagery';\nimport { Place, PlaceGroup, PlaceBbox, placesServiceUrl, PLACES_LIMITS } from './placesModel';\nimport { PlacesController, PlacesState, PlacesView } from './PlacesController';\n"
            },
            {
              "label": "overlap chooser 2",
              "before": "    const list = document.createElement('div'); content.appendChild(list);\n    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:7px'; content.appendChild(controls);\n    const previous = document.createElement('button'), next = document.createElement('button'), label = document.createElement('span');\n    previous.type = next.type = 'button'; previous.textContent = 'Previous'; next.textContent = 'Next'; controls.appendChild(previous); controls.appendChild(label); controls.appendChild(next);\n    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name)); let page = 0;\n    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;\n    const render = () => {\n      list.replaceChildren();\n      for (const place of members.slice(page * 4, page * 4 + 4)) {\n        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open'; button.textContent = `${place.name} · ${place.category.replace(/_/g, ' ')}`;\n        button.onclick = () => { if (active() && this.records.has(place.id)) this.open([], place.id); }; list.appendChild(button);\n      }\n      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;\n    };\n",
              "after": "    const list = document.createElement('div'); content.appendChild(list);\n    const controls = document.createElement('div'); controls.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:7px'; content.appendChild(controls);\n    const previous = document.createElement('button'), next = document.createElement('button'), label = document.createElement('span');\n    previous.type = next.type = 'button'; previous.textContent = 'Previous'; next.textContent = 'Next'; controls.appendChild(previous); controls.appendChild(label); controls.appendChild(next);\n    const members = [...group.members].sort((a, b) => a.name.localeCompare(b.name));\n    const selectedIndex = members.findIndex(place => place.id === this.selection.place?.id);\n    let page = selectedIndex < 0 ? 0 : Math.floor(selectedIndex / 4);\n    const active = () => !this.disposed && this.host.view() === view && this.popupContent === content && view.popup?.content === content;\n    const render = () => {\n      list.replaceChildren();\n      for (const place of members.slice(page * 4, page * 4 + 4)) {\n        const selected = place.id === this.selection.place?.id, category = place.category.replace(/_/g, ' ');\n        const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-place-open mly-place-group-row'; button.title = place.name;\n        button.setAttribute('aria-label', `${place.name}, ${category}${selected ? ', selected' : ''}. Open place details`);\n        if (selected) button.setAttribute('aria-current', 'true');\n        const icon = document.createElement('img'); icon.src = placeCategoryIcon(place.group, selected); icon.alt = ''; icon.width = icon.height = 20; icon.setAttribute('aria-hidden', 'true'); button.appendChild(icon);\n        const text = document.createElement('span'); text.className = 'mly-place-group-text';\n        const name = document.createElement('span'); name.className = 'mly-place-group-name'; name.textContent = place.name; text.appendChild(name);\n        const detail = document.createElement('span'); detail.className = 'mly-place-group-category'; detail.textContent = category; text.appendChild(detail);\n        if (selected) { const badge = document.createElement('span'); badge.className = 'mly-place-group-selected'; badge.textContent = 'Selected'; text.appendChild(badge); }\n        button.appendChild(text);\n        button.onclick = () => { if (active() && this.records.has(place.id)) this.open([], place.id); }; list.appendChild(button);\n      }\n      previous.disabled = page === 0; next.disabled = (page + 1) * 4 >= members.length; label.textContent = `${page + 1} / ${Math.ceil(members.length / 4)}`; controls.hidden = members.length <= 4;\n    };\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/placePopupStyles.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "overlap chooser 1",
              "before": "/** Neutral imagery controls and their metadata; the popup shell uses SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n.mly-place-popup .mly-place-choice-meta{margin:4px 0 8px;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup .mly-place-choice-note{margin:9px 0;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n`;\n",
              "after": "/** Neutral imagery controls, overlap rows and their metadata; the popup shell uses SDK defaults. */\nexport const PLACE_POPUP_CSS = `\n.mly-place-popup button.mly-place-open{box-sizing:border-box;display:block;width:100%;min-height:34px;margin:10px 0 0;padding:8px 10px;border:1px solid #c8cdd2;border-radius:5px;background:#fff;color:#25313d;font-family:inherit;font-weight:500;font-size:12px;line-height:1.35;text-align:left;white-space:normal;overflow-wrap:anywhere;cursor:pointer}\n.mly-place-popup button.mly-place-open-primary{background:#f2f4f6;border-color:#9da7b1;color:#1f2933;font-weight:600}\n.mly-place-popup button.mly-place-open:hover{background:#e9edf1;border-color:#89939c}\n.mly-place-popup button.mly-place-open:disabled{opacity:.6;cursor:wait}\n.mly-place-popup button.mly-place-open:focus-visible{outline:2px solid #2765a5;outline-offset:2px}\n.mly-place-popup .mly-place-choice-meta{margin:4px 0 8px;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup .mly-place-choice-note{margin:9px 0;font-size:11px;line-height:1.4;overflow-wrap:anywhere}\n.mly-place-popup button.mly-place-group-row{display:flex;align-items:center;gap:8px;min-height:46px;margin-top:6px;padding:7px 9px}\n.mly-place-popup .mly-place-group-row img{flex-shrink:0}\n.mly-place-popup .mly-place-group-text{display:block;min-width:0;overflow-wrap:anywhere}\n.mly-place-popup .mly-place-group-name{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-weight:600}\n.mly-place-popup .mly-place-group-category{display:block;margin-top:2px;font-size:11px;color:#56616c}\n.mly-place-popup button.mly-place-group-row[aria-current=\"true\"]{border-color:#a18842;border-left-width:3px;background:#fff8e5}\n.mly-place-popup button.mly-place-group-row[aria-current=\"true\"]:hover{background:#fff0c5}\n.mly-place-popup .mly-place-group-selected{display:inline-block;margin-top:3px;padding:1px 5px;border-radius:3px;background:#f3e0a7;color:#534215;font-size:10px;font-weight:600}\n`;\n"
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
              "label": "overlap chooser 1",
              "before": " const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},replaceChildren(...xs){this.children=xs;},remove(){}});global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n const layers=[];let busy=false,created=0,requests=0;class Layer{constructor(p){Object.assign(this,p);this.visible=true;this.items=[];}removeAll(){this.items=[];}addMany(g){this.items.push(...g);this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}class Value{constructor(p){Object.assign(this,p);}}class Graphic extends Value{constructor(p){super(p);created++;}}\n const view={ready:true,stationary:true,destroyed:false,map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},ui:{add(){},remove(){}},watch(){return{remove(){}}},toScreen:()=>({x:10,y:10}),openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert(list.children[0].textContent.startsWith('Place 4'));list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');const before=created;busy=true;owner.regroup();assert.equal(created,before);owner.clear();assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('category preferences are validated, scoped and safe when browser storage is blocked',()=>{\n const preferences=load('placePreferences'),data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},url='https://host/FeatureServer/0';const key=preferences.placePreferenceKey('w','/experience/0',url);assert(key);preferences.savePlaceCategory(()=>store,key,'parks');assert.equal(preferences.readPlaceCategory(()=>store,key),'parks');assert.notEqual(key,preferences.placePreferenceKey('w','/experience/1',url));assert.notEqual(key,preferences.placePreferenceKey('other','/experience/0',url));assert.notEqual(key,preferences.placePreferenceKey('w','/experience/0','https://host/FeatureServer/1'));assert.equal(preferences.placePreferenceKey('w','/experience/0',url+'?token=secret'),null);data.set(key,'<script>');assert.equal(preferences.readPlaceCategory(()=>store,key),'all');assert.equal(preferences.readPlaceCategory(()=>{throw Error('blocked')},key,'education'),'education');assert.doesNotThrow(()=>preferences.savePlaceCategory(()=>{throw Error('blocked')},key,'parks'));preferences.savePlaceCategory(()=>store,key,'all');assert.equal(data.get(key),'all');preferences.savePlaceCategory(()=>store,key,'invalid');assert.equal(data.get(key),'all');\n",
              "after": " const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},replaceChildren(...xs){this.children=xs;},remove(){}});global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n const layers=[];let busy=false,created=0,requests=0;class Layer{constructor(p){Object.assign(this,p);this.visible=true;this.items=[];}removeAll(){this.items=[];}addMany(g){this.items.push(...g);this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}class Value{constructor(p){Object.assign(this,p);}}class Graphic extends Value{constructor(p){super(p);created++;}}\n const view={ready:true,stationary:true,destroyed:false,map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},ui:{add(){},remove(){}},watch(){return{remove(){}}},toScreen:()=>({x:10,y:10}),openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert.equal(list.children[0].children[1].children[0].textContent,'Place 4');assert(list.children[0].children[0].src.startsWith('data:image/svg+xml;'));assert.equal(list.children[0].children[1].children[1].textContent,'museum');list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');assert(owner.open([],target));const chosenList=view.popup.content.children[2];assert.equal(view.popup.content.children[3].children[1].textContent,'2 / 2');assert.equal(chosenList.children[0].children[1].children[2].textContent,'Selected');assert.equal(owner.selection.place.id,'p4');const staleRow=chosenList.children[1];owner.clear();staleRow.onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(requests,0);const before=created;busy=true;owner.regroup();assert.equal(created,before);assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('category preferences are validated, scoped and safe when browser storage is blocked',()=>{\n const preferences=load('placePreferences'),data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},url='https://host/FeatureServer/0';const key=preferences.placePreferenceKey('w','/experience/0',url);assert(key);preferences.savePlaceCategory(()=>store,key,'parks');assert.equal(preferences.readPlaceCategory(()=>store,key),'parks');assert.notEqual(key,preferences.placePreferenceKey('w','/experience/1',url));assert.notEqual(key,preferences.placePreferenceKey('other','/experience/0',url));assert.notEqual(key,preferences.placePreferenceKey('w','/experience/0','https://host/FeatureServer/1'));assert.equal(preferences.placePreferenceKey('w','/experience/0',url+'?token=secret'),null);data.set(key,'<script>');assert.equal(preferences.readPlaceCategory(()=>store,key),'all');assert.equal(preferences.readPlaceCategory(()=>{throw Error('blocked')},key,'education'),'education');assert.doesNotThrow(()=>preferences.savePlaceCategory(()=>{throw Error('blocked')},key,'parks'));preferences.savePlaceCategory(()=>store,key,'all');assert.equal(data.get(key),'all');preferences.savePlaceCategory(()=>store,key,'invalid');assert.equal(data.get(key),'all');\n"
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
              "label": "overlap chooser 1",
              "before": "\n## v6.60 · Empty-result recovery\n\nA category with zero loaded matches offers Show all loaded places when other loaded records exist. It reuses the local category callback and preserves selection. Empty whole-area results suggest a nearby area or closer zoom, without implying the service has no data. Limited results explicitly say only part of the area is loaded and suggest zooming closer; counts remain loaded-subset counts. The empty Browse list is hidden to avoid duplicate/conflicting guidance. Imagery with no result at 75m offers Search within 250 m, still only on explicit click. Empty 250m results suggest another place or a later retry; no automatic expansion or retry is added.\n",
              "after": "\n## v6.60 · Empty-result recovery\n\nA category with zero loaded matches offers Show all loaded places when other loaded records exist. It reuses the local category callback and preserves selection. Empty whole-area results suggest a nearby area or closer zoom, without implying the service has no data. Limited results explicitly say only part of the area is loaded and suggest zooming closer; counts remain loaded-subset counts. The empty Browse list is hidden to avoid duplicate/conflicting guidance. Imagery with no result at 75m offers Search within 250 m, still only on explicit click. Empty 250m results suggest another place or a later retry; no automatic expansion or retry is added.\n\n## v6.61 · Overlapping-place chooser\n\nCount-badge choosers show the existing local category icon, a readable place name and a separate category line. Names take at most two lines, with full text in the accessible action label and hover title. The current selection has a gold accent, Selected badge and aria-current marker. Reopening a group starts on the selected member’s page, if present. Four rows per page, alphabetical ordering, explicit details navigation and stale-popup guards remain. Names/categories use textContent and icons use the application-owned SVG set. No new request, thumbnail, dependency or background work is added; neutral styling leaves the SDK popup shell unchanged.\n"
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
const prefix = 'places-overlap-chooser-v6-61-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.61 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-overlap-chooser-v6-61' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.61 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.61 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.61 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-overlap-chooser-v6-61.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places overlap chooser v6.61 is already installed. No files changed.');
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
  const manifest = { installer: 'places-overlap-chooser-v6-61', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places overlap chooser v6.61 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
