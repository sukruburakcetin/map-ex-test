#!/usr/bin/env node
'use strict';
/**
 * Places note action key fix. Fixes duplicate sibling keys in the compact selected-place card.
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
              "label": "src/components/SelectedPlaceCard.tsx 1",
              "before": "  <div style={{display:'flex',gap:5,alignItems:'start',minWidth:0}}>\n    <img src={placeCategoryIcon(props.place.group,true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{flexShrink:0,marginTop:3}}/>\n    <button type=\"button\" title={props.place.name} aria-label={`${t('uiOpenSelectedPlaceDetails')}: ${props.place.name}`} onClick={props.onDetails} style={{flex:1,minWidth:0,minHeight:30,maxHeight:'2.7em',padding:0,textAlign:'start',border:0,background:'none',color:'#f4ebd2',fontFamily:'inherit',fontWeight:600,fontSize:11,lineHeight:1.35,overflowWrap:'anywhere',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',cursor:'pointer'}}>{props.place.name}</button>\n    <button type=\"button\" aria-label={t('uiClearSelectedPlace')} title={t('uiClearSelectedPlace')} onClick={props.onClear} style={{flexShrink:0,minHeight:30,padding:'2px 4px',border:'1px solid #61846e66',borderRadius:5,background:'transparent',color:'inherit',font:'inherit',fontSize:9,cursor:'pointer'}}>{t('uiPoiClearShort')}</button>\n  </div>\n  <div title={category} style={{fontSize:10,opacity:.8,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{category}</div>\n  {props.cameraDistance&&<div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{fontSize:10,color:'#c0e5dc',marginTop:3,overflowWrap:'anywhere'}}>{owned(props.cameraDistance)}</div>}\n  {props.onImagery&&<button type=\"button\" onClick={props.onImagery} style={{...selectedAction,marginTop:4}}>{owned('View nearby imagery')}</button>}\n  {props.onNote&&<PlaceNoteActions place={props.place} currentImageId={props.currentImageId} onGetImage={props.onGetNoteImage} onLoadPreview={props.onLoadNotePreview} phase={props.notePhase} onCancel={props.onCancelNote} key={props.place.id} enterpriseEnabled={!!props.enterpriseEnabled} onNote={props.onNote}/>}\n  <details key={props.place.id} style={{marginTop:4,fontSize:10}}>\n    <summary style={{cursor:'pointer',minHeight:30,boxSizing:'border-box',padding:'6px 0'}}>{owned('Place details')}{props.link&&<span aria-hidden=\"true\" style={{color:'#a9d6be',marginInlineStart:4}}>●</span>}</summary>\n    <div style={{display:'grid',gap:5,paddingTop:3,overflowWrap:'anywhere'}}>\n      <strong>{props.place.name}</strong>\n      <span>{t('uiPlaceCategory')}: {props.place.category.replace(/_/g,' ')||category}</span>\n      <span>{props.place.address||owned('Address not supplied')}</span>\n      {!props.cameraDistance&&<span>{t('uiOpenImageDistance')}</span>}\n      {props.onBack&&<button type=\"button\" onClick={props.onBack} title={t('uiCenterTheMapOnThisPlace')} style={selectedAction}>{t('uiBackToPlace')}</button>}\n      <label style={{display:'flex',alignItems:'center',gap:5,minHeight:30,fontSize:10,margin:0,cursor:'pointer'}}><input type=\"checkbox\" checked={props.link} onChange={event=>props.onLink(event.target.checked)} style={{margin:0}}/>{t('uiShowCameraLink')}</label>\n",
              "after": "  <div style={{display:'flex',gap:5,alignItems:'start',minWidth:0}}>\n    <img src={placeCategoryIcon(props.place.group,true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{flexShrink:0,marginTop:3}}/>\n    <button type=\"button\" title={props.place.name} aria-label={`${t('uiOpenSelectedPlaceDetails')}: ${props.place.name}`} onClick={props.onDetails} style={{flex:1,minWidth:0,minHeight:30,maxHeight:'2.7em',padding:0,textAlign:'start',border:0,background:'none',color:'#f4ebd2',fontFamily:'inherit',fontWeight:600,fontSize:11,lineHeight:1.35,overflowWrap:'anywhere',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',cursor:'pointer'}}>{props.place.name}</button>\n    <button type=\"button\" aria-label={t('uiClearSelectedPlace')} title={t('uiClearSelectedPlace')} onClick={props.onClear} style={{flexShrink:0,minHeight:30,padding:'2px 4px',border:'1px solid #61846e66',borderRadius:5,background:'transparent',color:'inherit',font:'inherit',fontSize:9,cursor:'pointer'}}>{t('uiPoiClearShort')}</button>\n  </div>\n  <div title={category} style={{fontSize:10,opacity:.8,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{category}</div>\n  {props.cameraDistance&&<div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{fontSize:10,color:'#c0e5dc',marginTop:3,overflowWrap:'anywhere'}}>{owned(props.cameraDistance)}</div>}\n  {props.onImagery&&<button type=\"button\" onClick={props.onImagery} style={{...selectedAction,marginTop:4}}>{owned('View nearby imagery')}</button>}\n  {props.onNote&&<PlaceNoteActions place={props.place} currentImageId={props.currentImageId} onGetImage={props.onGetNoteImage} onLoadPreview={props.onLoadNotePreview} phase={props.notePhase} onCancel={props.onCancelNote} key={'place-note:'+props.place.id} enterpriseEnabled={!!props.enterpriseEnabled} onNote={props.onNote}/>}\n  <details key={'place-details:'+props.place.id} style={{marginTop:4,fontSize:10}}>\n    <summary style={{cursor:'pointer',minHeight:30,boxSizing:'border-box',padding:'6px 0'}}>{owned('Place details')}{props.link&&<span aria-hidden=\"true\" style={{color:'#a9d6be',marginInlineStart:4}}>●</span>}</summary>\n    <div style={{display:'grid',gap:5,paddingTop:3,overflowWrap:'anywhere'}}>\n      <strong>{props.place.name}</strong>\n      <span>{t('uiPlaceCategory')}: {props.place.category.replace(/_/g,' ')||category}</span>\n      <span>{props.place.address||owned('Address not supplied')}</span>\n      {!props.cameraDistance&&<span>{t('uiOpenImageDistance')}</span>}\n      {props.onBack&&<button type=\"button\" onClick={props.onBack} title={t('uiCenterTheMapOnThisPlace')} style={selectedAction}>{t('uiBackToPlace')}</button>}\n      <label style={{display:'flex',alignItems:'center',gap:5,minHeight:30,fontSize:10,margin:0,cursor:'pointer'}}><input type=\"checkbox\" checked={props.link} onChange={event=>props.onLink(event.target.checked)} style={{margin:0}}/>{t('uiShowCameraLink')}</label>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/selectedPlaceCompact.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/selectedPlaceCompact.test.cjs 1",
              "before": "function nodes(tree){const result=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){result.push(n);walk(n.children)}}walk(tree);return result}\nconst base={place:{id:'book',name:'The First Edition Rare Books with a very long name',category:'books_music_and_video_store',group:'shop',address:'123 Main Street',website:'https://example.com',release:'2026-10',confidence:.9,operatingStatus:'open'},link:true,onDetails(){},onClear(){},onLink(){}};\ntest('selected header has distinct Clear action, two-line title and full accessible name',()=>{\n const all=nodes(SelectedPlaceSummary(base)),clear=all.find(n=>n.props['aria-label']==='localized:uiClearSelectedPlace'),title=all.find(n=>n.props.title===base.place.name);\n assert.equal(clear.props.onClick,base.onClear);assert.equal(flatten(clear),'localized:uiPoiClearShort');assert(!all.some(n=>n.type==='button'&&flatten(n)==='×'));\n assert.equal(title.props.onClick,base.onDetails);assert.equal(title.props.style.WebkitLineClamp,2);assert(title.props['aria-label'].includes(base.place.name));\n});\ntest('secondary details start collapsed with full identity, address, camera link and source retained',()=>{\n const tree=SelectedPlaceSummary({...base,onBack(){}}),all=nodes(tree),details=all.find(n=>n.type==='details');assert(details);assert(!details.props.open);assert.equal(details.props.key,base.place.id);\n for(const value of [base.place.name,base.place.address,'books music and video store',base.place.id,base.place.release,'localized:uiPoiConfidence','localized:uiPoiOperatingStatus','localized:uiOverture'])assert(flatten(details).includes(value));\n const checkbox=nodes(details).find(n=>n.type==='input');assert.equal(checkbox.props.checked,true);assert(all.some(n=>n.props.title==='localized:uiCenterTheMapOnThisPlace'));\n});\ntest('imagery and all note preparation props stay outside collapsed secondary details',()=>{\n const note=()=>{},image=()=>{},cancel=()=>{},props={...base,onImagery:image,onNote:note,enterpriseEnabled:true,currentImageId:'image',onGetNoteImage:async()=>null,onLoadNotePreview:()=>{},notePhase:'capturing',onCancelNote:cancel};\n const tree=SelectedPlaceSummary(props),all=nodes(tree),details=all.find(n=>n.type==='details'),actions=all.find(n=>n.type===Note);\n assert(all.some(n=>n.type==='button'&&n.props.onClick===image));assert(!nodes(details).some(n=>n.type===Note||n.props.onClick===image));assert.equal(actions.props.onNote,note);assert.equal(actions.props.enterpriseEnabled,true);assert.equal(actions.props.phase,'capturing');assert.equal(actions.props.onCancel,cancel);assert.equal(actions.props.onGetImage,props.onGetNoteImage);assert.equal(actions.props.currentImageId,'image');\n});\n",
              "after": "function nodes(tree){const result=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){result.push(n);walk(n.children)}}walk(tree);return result}\nconst base={place:{id:'book',name:'The First Edition Rare Books with a very long name',category:'books_music_and_video_store',group:'shop',address:'123 Main Street',website:'https://example.com',release:'2026-10',confidence:.9,operatingStatus:'open'},link:true,onDetails(){},onClear(){},onLink(){}};\ntest('selected header has distinct Clear action, two-line title and full accessible name',()=>{\n const all=nodes(SelectedPlaceSummary(base)),clear=all.find(n=>n.props['aria-label']==='localized:uiClearSelectedPlace'),title=all.find(n=>n.props.title===base.place.name);\n assert.equal(clear.props.onClick,base.onClear);assert.equal(flatten(clear),'localized:uiPoiClearShort');assert(!all.some(n=>n.type==='button'&&flatten(n)==='×'));\n assert.equal(title.props.onClick,base.onDetails);assert.equal(title.props.style.WebkitLineClamp,2);assert(title.props['aria-label'].includes(base.place.name));\n});\ntest('secondary details start collapsed with full identity, address, camera link and source retained',()=>{\n const tree=SelectedPlaceSummary({...base,onBack(){}}),all=nodes(tree),details=all.find(n=>n.type==='details');assert(details);assert(!details.props.open);assert.equal(details.props.key,'place-details:'+base.place.id);\n for(const value of [base.place.name,base.place.address,'books music and video store',base.place.id,base.place.release,'localized:uiPoiConfidence','localized:uiPoiOperatingStatus','localized:uiOverture'])assert(flatten(details).includes(value));\n const checkbox=nodes(details).find(n=>n.type==='input');assert.equal(checkbox.props.checked,true);assert(all.some(n=>n.props.title==='localized:uiCenterTheMapOnThisPlace'));\n});\ntest('imagery and all note preparation props stay outside collapsed secondary details',()=>{\n const note=()=>{},image=()=>{},cancel=()=>{},props={...base,onImagery:image,onNote:note,enterpriseEnabled:true,currentImageId:'image',onGetNoteImage:async()=>null,onLoadNotePreview:()=>{},notePhase:'capturing',onCancelNote:cancel};\n const tree=SelectedPlaceSummary(props),all=nodes(tree),details=all.find(n=>n.type==='details'),actions=all.find(n=>n.type===Note);\n assert(all.some(n=>n.type==='button'&&n.props.onClick===image));assert(!nodes(details).some(n=>n.type===Note||n.props.onClick===image));assert.equal(actions.props.onNote,note);assert.equal(actions.props.enterpriseEnabled,true);assert.equal(actions.props.phase,'capturing');assert.equal(actions.props.onCancel,cancel);assert.equal(actions.props.onGetImage,props.onGetNoteImage);assert.equal(actions.props.currentImageId,'image');\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/placesNoteActionIdentity.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),React=require('react'),{JSDOM}=require('jsdom');\nconst sourceRoot=path.join(__dirname,'../src');\nfunction loadCard(){const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);\n new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(sourceRoot,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText)(m.exports,id=>{\n if(id==='jimu-core')return{React,jsx:React.createElement};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>k,owned:s=>s,formatLocale:'en-US'})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=> 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\"/>'};if(id.endsWith('LinkedDetectionPreview'))return{DetectionCrop:()=>null};\n const relative=path.relative(sourceRoot,path.resolve(sourceRoot,path.dirname(file),id));return load(relative+(id.endsWith('PlaceNoteActions')?'.tsx':'.ts'));\n });return m.exports;}\n return load('components/SelectedPlaceCard.tsx').SelectedPlaceSummary;\n}\ntest('repeated POI selections keep exactly one note action and preserve/reset the right draft',async()=>{\n const dom=new JSDOM('<div id=\"root\"></div>',{url:'https://widget.test'}),saved=new Map();\n for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true})){saved.set(key,Object.getOwnPropertyDescriptor(global,key));Object.defineProperty(global,key,{value,writable:true,configurable:true});}\n const errors=[],originalError=console.error;console.error=(...args)=>errors.push(args.map(String).join(' '));\n const act=React.act||require('react-dom/test-utils').act;\n const {createRoot}=require('react-dom/client'),root=createRoot(document.getElementById('root')),Card=loadCard(),created=[];\n const places={a:{id:'a',name:'Place A',category:'bookstore',group:'shop',confidence:.9,lon:1,lat:1,address:'',website:'',release:''},b:{id:'b',name:'Place B',category:'cafe',group:'cafe',confidence:.9,lon:2,lat:2,address:'',website:'',release:''}};\n const button=name=>Array.from(document.querySelectorAll('button')).find(node=>node.textContent===name);\n const click=async name=>{const node=button(name);assert(node,'Missing button: '+name);await act(async()=>node.dispatchEvent(new window.MouseEvent('click',{bubbles:true})))};\n function App(){const [place,setPlace]=React.useState(places.a);return React.createElement('main',null,React.createElement('button',{onClick:()=>setPlace({...places.a})},'Select A'),React.createElement('button',{onClick:()=>setPlace({...places.b})},'Select B'),React.createElement(Card,{place,link:false,onLink(){},onDetails(){},onClear(){},enterpriseEnabled:true,onNote:destination=>created.push({destination,id:place.id})}));}\n try{\n  await act(async()=>root.render(React.createElement(App)));\n  const counts=[];for(let i=0;i<12;i++){await click(i%2?'Select A':'Select B');counts.push(Array.from(document.querySelectorAll('button')).filter(n=>n.textContent==='Add field note').length)}\n  assert.deepEqual(counts,Array(12).fill(1),'A field-note action accumulated after changing selected POIs');\n  assert(!errors.some(message=>/same key|unique.*key/i.test(message)),'React reported conflicting child keys: '+errors.join('\\n'));\n  await click('Add field note');let destination=document.querySelector('select[aria-label=\"Place note destination\"]');assert(destination);assert.deepEqual(Array.from(destination.options).map(o=>o.value),['local','enterprise','workspace']);\n  await act(async()=>{destination.value='workspace';destination.dispatchEvent(new window.Event('change',{bubbles:true}))});\n  await click('Select A');assert.equal(document.querySelector('select[aria-label=\"Place note destination\"]').value,'workspace','Same-POI updates should retain the draft');\n  await click('Select B');assert.equal(document.querySelector('select[aria-label=\"Place note destination\"]'),null,'A different POI needs fresh note state');assert(button('Add field note'));\n  await click('Add field note');destination=document.querySelector('select[aria-label=\"Place note destination\"]');assert.equal(destination.value,'local');\n  await act(async()=>{destination.value='enterprise';destination.dispatchEvent(new window.Event('change',{bubbles:true}))});await click('Create draft here');assert.deepEqual(created,[{destination:'enterprise',id:'b'}]);\n }finally{\n  await act(async()=>root.unmount());console.error=originalError;dom.window.close();for(const[key,descriptor]of saved){if(descriptor)Object.defineProperty(global,key,descriptor);else delete global[key];}\n }\n});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'overture-note-action-key-fix-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Places note action key fix installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-note-action-key-fix' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Places note action key fix installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Places note action key fix installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Places note action key fix installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-note-action-key-fix.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'Places note action key fix is already uninstalled. No files changed.' : 'Places note action key fix is already installed. No files changed.');
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
  const manifest = { installer: 'overture-note-action-key-fix', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places note action key fix ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
