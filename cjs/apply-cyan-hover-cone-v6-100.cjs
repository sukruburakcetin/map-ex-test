#!/usr/bin/env node
'use strict';
/**
 * Cyan hover cone v6.100. Compatible current v6 sources.
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
      "file": "src/features/map-graphics/HoverBearingSector.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "steady ground target",
              "before": "/** Optional bearing decoration driven by the existing brown pulse clock. No own RAF or requests. */\nimport { groundFanMatrix } from './ScreenDirectionCone';\nexport class HoverBearingSector {\n private element: HTMLDivElement | null = null;\n private bearing: number | null = null;\n private last = -Infinity;\n private cache: { view: any; geometry: any; camera: any; zoom: number; rotation: number; bearing: number; transform: string } | null = null;\n constructor(private readonly point: (properties: any) => any, private readonly create: () => HTMLDivElement) {}\n show(parent: HTMLElement, bearing: unknown, _pano: boolean): void {\n  if(typeof bearing !== 'number' || !Number.isFinite(bearing)){this.clear();return;}\n  const normalized=((bearing%360)+360)%360;\n  if(this.element?.parentElement!==parent)this.clear();\n  if(!this.element){\n   const el=this.create();el.setAttribute('aria-hidden','true');\n   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'60px',height:'60px',left:'50%',top:'50%',transform:'translate(-50%,-50%)',display:'none'});\n   // The seven-pixel opening keeps the existing 6\u201311px brown pulse unobstructed.\n   const a=25*Math.PI/180,r=24,inner=7,x=Math.sin(a),y=Math.cos(a);\n   el.innerHTML=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><g><path d=\"M${30-inner*x} ${30-inner*y} L${30-r*x} ${30-r*y} A${r} ${r} 0 0 1 ${30+r*x} ${30-r*y} L${30+inner*x} ${30-inner*y} A${inner} ${inner} 0 0 0 ${30-inner*x} ${30-inner*y} Z\" fill=\"#ffb300\" fill-opacity=\"0.45\" stroke=\"#d88c00\" stroke-width=\"1\"/></g></svg>`;\n   parent.appendChild(el);this.element=el;\n  }\n  if(this.bearing!==normalized){this.cache=null;this.last=-Infinity;}\n  this.bearing=normalized;\n }\n update(view: any, geometry: any, pixel: {x:number;y:number} | null | undefined, now: number): void {\n  const el=this.element,bearing=this.bearing;if(!el||bearing===null)return;\n  if(!pixel || !Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)){el.style.display='none';return;}\n  if(now-this.last<32)return;this.last=now;\n  try {\n   const cached=this.cache;let orientation:string;\n   if(cached&&cached.view===view&&cached.geometry===geometry&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.rotation===view.rotation&&cached.bearing===bearing&&view.stationary===true&&view.updating===false)orientation=cached.transform;\n   else {\n    const lon=geometry.longitude,lat=geometry.latitude;\n    if(!Number.isFinite(lon)||!Number.isFinite(lat)){el.style.display='none';return;}\n    const rad=bearing*Math.PI/180,d=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(lat*Math.PI/180));\n    const project=(angle:number)=>view.toScreen(this.point({longitude:lon+Math.sin(angle)*d/(111320*cos),latitude:Math.max(-89,Math.min(89,lat+Math.cos(angle)*d/111320)),z:geometry.z||0,spatialReference:{wkid:4326}}));\n    const front=project(rad),right=view.type==='3d'?project(rad+Math.PI/2):null;\n    if(!front||!Number.isFinite(front.x)||!Number.isFinite(front.y)){el.style.display='none';return;}\n    const dx=front.x-pixel.x,dy=front.y-pixel.y;\n    orientation=view.type==='3d'&&right?groundFanMatrix({x:dx,y:dy},{x:right.x-pixel.x,y:right.y-pixel.y})||'':'';\n    if(!orientation)orientation=`rotate(${Math.atan2(dx,-dy)*180/Math.PI})`;\n    this.cache={view,geometry,camera:view.camera,zoom:view.zoom,rotation:view.rotation,bearing,transform:orientation};\n   }\n   const group=el.querySelector('g'),transform=`translate(30 30) ${orientation} translate(-30 -30)`;\n   if(group?.getAttribute('transform')!==transform)group?.setAttribute('transform',transform);\n   el.style.display='block';\n  }catch{el.style.display='none';}\n }\n clear(): void {this.element?.remove();this.element=null;this.cache=null;this.bearing=null;this.last=-Infinity;}\n}\n",
              "after": "/** Optional bearing decoration driven by the existing brown pulse clock. No own RAF or requests. */\nimport { groundFanMatrix } from './ScreenDirectionCone';\nexport class HoverBearingSector {\n private element: HTMLDivElement | null = null;\n private bearing: number | null = null;\n private last = -Infinity;\n private cache: { view: any; geometry: any; camera: any; zoom: number; rotation: number; bearing: number; transform: string } | null = null;\n constructor(private readonly point: (properties: any) => any, private readonly create: () => HTMLDivElement) {}\n show(parent: HTMLElement, bearing: unknown, _pano: boolean): void {\n  if(typeof bearing !== 'number' || !Number.isFinite(bearing)){this.clear();return;}\n  const normalized=((bearing%360)+360)%360;\n  if(this.element?.parentElement!==parent)this.clear();\n  if(!this.element){\n   const el=this.create();el.setAttribute('aria-hidden','true');\n   Object.assign(el.style,{position:'absolute',pointerEvents:'none',width:'60px',height:'60px',left:'50%',top:'50%',transform:'translate(-50%,-50%)',display:'none'});\n   // The seven-pixel opening keeps the existing 6\u201311px brown pulse unobstructed.\n   const a=25*Math.PI/180,r=24,inner=7,x=Math.sin(a),y=Math.cos(a);\n   el.innerHTML=`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><g><path d=\"M${30-inner*x} ${30-inner*y} L${30-r*x} ${30-r*y} A${r} ${r} 0 0 1 ${30+r*x} ${30-r*y} L${30+inner*x} ${30-inner*y} A${inner} ${inner} 0 0 0 ${30-inner*x} ${30-inner*y} Z\" fill=\"#22d3ee\" fill-opacity=\"0.45\" stroke=\"#0f8f9d\" stroke-width=\"1\"/></g></svg>`;\n   parent.appendChild(el);this.element=el;\n  }\n  if(this.bearing!==normalized){this.cache=null;this.last=-Infinity;}\n  this.bearing=normalized;\n }\n update(view: any, geometry: any, pixel: {x:number;y:number} | null | undefined, now: number): void {\n  const el=this.element,bearing=this.bearing;if(!el||bearing===null)return;\n  if(!pixel || !Number.isFinite(pixel.x)||!Number.isFinite(pixel.y)){el.style.display='none';return;}\n  if(now-this.last<32)return;this.last=now;\n  try {\n   const cached=this.cache;let orientation:string;\n   if(cached&&cached.view===view&&cached.geometry===geometry&&cached.camera===view.camera&&cached.zoom===view.zoom&&cached.rotation===view.rotation&&cached.bearing===bearing&&view.stationary===true&&view.updating===false)orientation=cached.transform;\n   else {\n    const lon=geometry.longitude,lat=geometry.latitude;\n    if(!Number.isFinite(lon)||!Number.isFinite(lat)){el.style.display='none';return;}\n    const rad=bearing*Math.PI/180,d=Math.min(50000,Math.max(10,156543.03392804097/2**(view.zoom||0)*40)),cos=Math.max(.01,Math.cos(lat*Math.PI/180));\n    const project=(angle:number)=>view.toScreen(this.point({longitude:lon+Math.sin(angle)*d/(111320*cos),latitude:Math.max(-89,Math.min(89,lat+Math.cos(angle)*d/111320)),z:geometry.z||0,spatialReference:{wkid:4326}}));\n    const front=project(rad),right=view.type==='3d'?project(rad+Math.PI/2):null;\n    if(!front||!Number.isFinite(front.x)||!Number.isFinite(front.y)){el.style.display='none';return;}\n    const dx=front.x-pixel.x,dy=front.y-pixel.y;\n    orientation=view.type==='3d'&&right?groundFanMatrix({x:dx,y:dy},{x:right.x-pixel.x,y:right.y-pixel.y})||'':'';\n    if(!orientation)orientation=`rotate(${Math.atan2(dx,-dy)*180/Math.PI})`;\n    this.cache={view,geometry,camera:view.camera,zoom:view.zoom,rotation:view.rotation,bearing,transform:orientation};\n   }\n   const group=el.querySelector('g'),transform=`translate(30 30) ${orientation} translate(-30 -30)`;\n   if(group?.getAttribute('transform')!==transform)group?.setAttribute('transform',transform);\n   el.style.display='block';\n  }catch{el.style.display='none';}\n }\n clear(): void {this.element?.remove();this.element=null;this.cache=null;this.bearing=null;this.last=-Infinity;}\n}\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/CYAN-HOVER-CONE.md",
      "content": "# v6.100: Cyan preview cone\n\nRequires v6.99. Install with `node apply-cyan-hover-cone-v6-100.cjs`, rebuild and refresh.\n\nCoverage-circle hover uses a translucent cyan sector with a teal outline. Brown pulse styling, selected-image orange cone, navigation-arrow indicator and rendering behavior remain unchanged. This changes two SVG color values only.\n\nRollback: `node apply-cyan-hover-cone-v6-100.cjs --uninstall`, rebuild and refresh.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'cyan-hover-cone-v6-100-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.100 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'cyan-hover-cone-v6-100' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.100 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.100 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.100 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-cyan-hover-cone-v6-100.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Cyan hover cone v6.100 is already installed. No files changed.');
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
  const manifest = { installer: 'cyan-hover-cone-v6-100', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Cyan hover cone v6.100 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
