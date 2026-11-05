#!/usr/bin/env node
'use strict';
/**
 * Compact route preview confirmation. Compatible current v6 sources.
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
      "file": "src/features/routing/RouteControls.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Compact route preview 1",
              "before": "              </option>\n            </select>\n          </div>\n          <RoutePreviewControls route={routeData} host={props.routePreviewHost}/>\n        </div>\n      )}\n      {!routeData ? (\n",
              "after": "              </option>\n            </select>\n          </div>\n        </div>\n      )}\n      {!routeData ? (\n"
            },
            {
              "label": "Compact route preview 2",
              "before": "              \u2715\n            </button>\n          </div>\n        </div>\n      )}\n    </div>\n",
              "after": "              \u2715\n            </button>\n          </div>\n          <RoutePreviewControls route={routeData} host={props.routePreviewHost}/>\n        </div>\n      )}\n    </div>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/routing/RoutePreviewControls.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Compact route preview 1",
              "before": "  if(!controller.current)controller.current=new RoutePreviewSimulation(host,route.geojson,route.duration,value=>{if(mounted.current)setProgress(value);});\n  controller.current.speed=speed;controller.current.follow=follow;controller.current.play();setError('');\n }catch(error){controller.current?.stop();controller.current=null;setError((error as Error).message);}};\n return <div role=\"group\" aria-label={text('Route simulation')} style={{display:'grid',gap:5,padding:6,marginTop:6,border:'1px solid #49695a',borderRadius:5,color:'#d3e2d9',fontSize:9}}>\n  <strong>{text('Route simulation')}</strong><small>{text('Preview only \u00b7 no GPS')}</small>\n  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>\n   <button type=\"button\" style={button} disabled={!host||progress.state==='playing'} onClick={play}>{text(progress.state==='paused'?'Resume':progress.state==='finished'?'Replay A \u2192 B':'Preview A \u2192 B')}</button>\n   {progress.state==='playing'&&<button type=\"button\" style={button} onClick={()=>controller.current?.pause()}>{text('Pause')}</button>}\n   {progress.state!=='idle'&&<button type=\"button\" style={button} onClick={()=>controller.current?.stop()}>{text('Stop')}</button>}\n  </div>\n  <label style={{display:'grid',gap:3}}>{text('Preview speed')}<select aria-label={text('Preview speed')} style={{...button,width:'100%'}} value={speed} onChange={event=>{const value=Number(event.target.value);setSpeed(value);if(controller.current)controller.current.speed=value;}}>{[1,5,10,25,50].map(value=><option key={value} value={value}>{value}\u00d7</option>)}</select></label>\n  <label style={{display:'flex',gap:5,alignItems:'center'}}><input type=\"checkbox\" checked={follow} onChange={event=>{setFollow(event.target.checked);if(controller.current)controller.current.follow=event.target.checked;}}/>{text('Follow on map')}</label>\n  <span role=\"status\">{text(progress.state==='playing'?'Playing':progress.state==='paused'?'Paused':progress.state==='finished'?'Finished':'Ready')}</span>\n  <progress aria-label={text('Route progress')} max={1} value={progress.progress} style={{width:'100%',height:6}}/><span aria-hidden=\"true\">{Math.round(progress.progress*100)}%</span>\n  {error&&<span role=\"alert\">{text(error)}</span>}\n </div>;\n}\n",
              "after": "  if(!controller.current)controller.current=new RoutePreviewSimulation(host,route.geojson,route.duration,value=>{if(mounted.current)setProgress(value);});\n  controller.current.speed=speed;controller.current.follow=follow;controller.current.play();setError('');\n }catch(error){controller.current?.stop();controller.current=null;setError((error as Error).message);}};\n const active=progress.state!=='idle';\n return <div className=\"mly-route-preview\" role=\"group\" aria-label={text('Route simulation')} style={{display:'grid',gap:5,paddingTop:7,marginTop:7,borderTop:'1px solid #49695a',color:'#d3e2d9',fontSize:9,minWidth:0}}>\n  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>\n   <button type=\"button\" style={{...button,flex:'1 1 auto'}} disabled={!host} onClick={progress.state==='playing'?()=>controller.current?.pause():play}>{text(progress.state==='playing'?'Pause':progress.state==='paused'?'Resume':progress.state==='finished'?'Replay A \u2192 B':'Preview A \u2192 B')}</button>\n   {active&&<button type=\"button\" style={button} onClick={()=>controller.current?.stop()}>{text('Stop')}</button>}\n  </div>\n  {active&&<div style={{display:'grid',gap:3}}>\n   <span role=\"status\">{text(progress.state==='playing'?'Playing':progress.state==='paused'?'Paused':'Finished')} \u00b7 {Math.round(progress.progress*100)}%</span>\n   <progress aria-label={text('Route progress')} max={1} value={progress.progress} style={{width:'100%',height:5}}/>\n  </div>}\n  <details>\n   <summary style={{cursor:'pointer',padding:'3px 0'}}>{text('Options')}</summary>\n   <div style={{display:'grid',gap:5,paddingTop:4}}>\n    <label style={{display:'grid',gap:3}}>{text('Preview speed')}<select aria-label={text('Preview speed')} style={{...button,width:'100%',minWidth:0}} value={speed} onChange={event=>{const value=Number(event.target.value);setSpeed(value);if(controller.current)controller.current.speed=value;}}>{[1,5,10,25,50].map(value=><option key={value} value={value}>{value}\u00d7</option>)}</select></label>\n    <label style={{display:'flex',gap:4,alignItems:'center'}}><input type=\"checkbox\" style={{margin:0,flexShrink:0}} checked={follow} onChange={event=>{setFollow(event.target.checked);if(controller.current)controller.current.follow=event.target.checked;}}/>{text('Follow on map')}</label>\n    <small>{text('Preview only \u00b7 no GPS')}</small>\n   </div>\n  </details>\n  {error&&<span role=\"alert\">{text(error)}</span>}\n </div>;\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/routePreviewControls.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Compact route preview 1",
              "before": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst compile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/routing',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [240,393]){const page=await browser.newPage({viewport:{width:Math.max(393,width),height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<div id=\"root\" style=\"width:'+width+'px;background:#14251d\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(({engine,controls})=>{const a={exports:{}};new Function('module','exports',engine)(a,a.exports);const b={exports:{}};new Function('require','module','exports',controls)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.includes('WidgetLocale')?{useWidgetLocale:()=>({owned:text=>text})}:a.exports,b,b.exports);const Component=b.exports.RoutePreviewControls;window.layers=[];window.handlers=new Map();window.host={view:{type:'2d',map:{add:layer=>layers.push(layer),remove:layer=>layers.splice(layers.indexOf(layer),1)},on:(name,callback)=>{handlers.set(name,callback);return{remove:()=>handlers.delete(name)}},goTo:()=>Promise.resolve(),container:{ownerDocument:document}},createLayer:props=>({...props,add(){},destroy(){}}),createGraphic:props=>props};window.route={duration:100,geojson:{type:'LineString',coordinates:[[1,2],[1.001,2]]}};window.root=ReactDOM.createRoot(document.getElementById('root'));window.render=()=>root.render(React.createElement(Component,{route,host}));render();},{engine:compile('RoutePreviewSimulation.ts'),controls:compile('RoutePreviewControls.tsx')});\n await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();assert.equal(await page.evaluate(()=>layers.length),1);checks++;\n await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.getByLabel('Preview speed',{exact:true}).selectOption('25');await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();checks++;\n await page.evaluate(()=>handlers.get('pointer-down')());await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.getByRole('button',{name:'Stop',exact:true}).click();assert.equal(await page.evaluate(()=>layers.length),0);checks++;\n await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>{window.route={...route,geojson:{type:'LineString',coordinates:[[1,2],[1.002,2]]}};render();});await page.waitForFunction(()=>layers.length===0);await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).waitFor();assert.equal(await page.evaluate(()=>layers.length),0);checks++;\n assert.equal(await page.getByRole('group',{name:'Route simulation',exact:true}).evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>root.unmount());assert.equal(await page.evaluate(()=>layers.length),0);assert.equal(await page.evaluate(()=>handlers.size),0);assert.deepEqual(errors,[]);checks++;await page.close();}console.log(checks+' route preview Chromium checks passed.');}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require('playwright');\nconst compile=file=>ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/routing',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText;\n(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;try{for(const width of [96,144,240,393]){const page=await browser.newPage({viewport:{width:Math.max(393,width),height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setContent('<div id=\"root\" style=\"width:'+width+'px;background:#14251d\"></div>');await page.addScriptTag({path:process.env.REACT_UMD_PATH||'/tmp/workspace-alias-deps/react/package/umd/react.development.js'});await page.addScriptTag({path:process.env.REACT_DOM_UMD_PATH||'/tmp/workspace-alias-deps/react-dom/package/umd/react-dom.development.js'});await page.evaluate(({engine,controls,routing,styles})=>{const a={exports:{}};new Function('module','exports',engine)(a,a.exports);const b={exports:{}};new Function('require','module','exports',controls)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id.includes('WidgetLocale')?{useWidgetLocale:()=>({owned:text=>text})}:a.exports,b,b.exports);const Component=b.exports.RoutePreviewControls;\nconst styleModule={exports:{}};new Function('module','exports',styles)(styleModule,styleModule.exports);\nconst routeModule={exports:{}};new Function('require','module','exports',routing)(id=>id==='jimu-core'?{React,jsx:React.createElement}:id==='react-dom'?ReactDOM:id.includes('WidgetLocale')?{useWidgetLocale:()=>({owned:text=>text,t:text=>text,locale:'en'}),WidgetLocaleContext:React.createContext({t:text=>text,owned:text=>text,locale:'en'}),OwnedMessage:props=>props.source}:id.includes('styles/routing')?styleModule.exports:b.exports,routeModule,routeModule.exports);window.Routing=routeModule.exports.RouteControls;\nwindow.layers=[];window.handlers=new Map();window.host={view:{type:'2d',map:{add:layer=>layers.push(layer),remove:layer=>layers.splice(layers.indexOf(layer),1)},on:(name,callback)=>{handlers.set(name,callback);return{remove:()=>handlers.delete(name)}},goTo:()=>Promise.resolve(),container:{ownerDocument:document}},createLayer:props=>({...props,add(){},destroy(){}}),createGraphic:props=>props};window.route={duration:100,geojson:{type:'LineString',coordinates:[[1,2],[1.001,2]]}};window.root=ReactDOM.createRoot(document.getElementById('root'));window.render=()=>root.render(React.createElement(Component,{route,host}));render();},{engine:compile('RoutePreviewSimulation.ts'),controls:compile('RoutePreviewControls.tsx'),routing:compile('RouteControls.tsx'),styles:ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/styles/routing.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText});\n assert.equal(await page.getByLabel('Preview speed',{exact:true}).isVisible(),false);assert((await page.getByRole('group',{name:'Route simulation',exact:true}).boundingBox()).height<85);checks++;\n await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();assert.equal(await page.evaluate(()=>layers.length),1);checks++;\n await page.getByRole('button',{name:'Pause',exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.getByText('Options',{exact:true}).click();await page.getByLabel('Preview speed',{exact:true}).selectOption('25');await page.getByText('Options',{exact:true}).click();await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();checks++;\n await page.evaluate(()=>handlers.get('pointer-down')());await page.getByRole('button',{name:'Resume',exact:true}).waitFor();await page.getByRole('button',{name:'Stop',exact:true}).click();assert.equal(await page.evaluate(()=>layers.length),0);checks++;\n await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>{window.route={...route,geojson:{type:'LineString',coordinates:[[1,2],[1.002,2]]}};render();});await page.waitForFunction(()=>layers.length===0);await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).waitFor();assert.equal(await page.evaluate(()=>layers.length),0);checks++;\n assert.equal(await page.getByRole('group',{name:'Route simulation',exact:true}).evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);await page.getByRole('button',{name:'Preview A \u2192 B',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).waitFor();await page.evaluate(()=>root.render(React.createElement(Routing,{runtimeRoutingEngine:'world',runtimeTravelMode:'drive',routeData:null,routeSpareMinutes:30,routePreviewHost:host})));await page.waitForFunction(()=>!document.querySelector('.mly-route-preview'));assert.equal(await page.getByRole('group',{name:'Route simulation',exact:true}).count(),0);checks++;\n await page.evaluate(()=>root.render(React.createElement(Routing,{runtimeRoutingEngine:'world',runtimeTravelMode:'drive',routeData:{...route,distance:200},routePreviewHost:host})));await page.getByRole('group',{name:'Route simulation',exact:true}).waitFor();assert.equal(await page.locator('.mly-route-choice .mly-route-preview').count(),0);assert.equal(await page.evaluate(()=>{const action=document.querySelector('.mly-route-result-actions');return action.nextElementSibling.classList.contains('mly-route-preview')}),true);checks++;\n await page.evaluate(()=>root.unmount());assert.equal(await page.evaluate(()=>layers.length),0);assert.equal(await page.evaluate(()=>handlers.size),0);assert.deepEqual(errors,[]);checks++;await page.close();}console.log(checks+' route preview Chromium checks passed.');}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});\n"
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
const prefix = 'compact-route-preview-';

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
    if (manifest.installer !== 'compact-route-preview' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-compact-route-preview.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Compact route preview confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'compact-route-preview', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Compact route preview confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
