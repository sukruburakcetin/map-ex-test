#!/usr/bin/env node
'use strict';
/**
 * Hover thumbnail retention. Compatible current v6 sources.
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
      "file": "src/features/imagery/hoverCard.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Retain current hover thumbnail 1",
              "before": "  path.setAttribute('d', kind === 'creator' ? 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2' : 'M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16');\n  svg.appendChild(path); svg.style.flexShrink = '0'; return svg;\n}\n/** Build a non-interactive preview with textContent, stable dimensions and no HTML interpolation. */\nexport function renderImageryHoverCard(host: HTMLElement, data: any, fallbackDate?: unknown, loading = false, l10n: Presentation = englishPresentation): void {\n  Object.assign(host.style, styles.shell); if (!host.style.width || host.style.width === 'max-content') host.style.width = '240px'; host.style.display = 'block'; host.setAttribute('role', 'tooltip');\n  l10n.release(host); l10n.bind(host,'dir',()=>l10n.locale==='ar'?'rtl':'ltr'); host.textContent = ''; const doc = host.ownerDocument;\n  const portal = doc.fullscreenElement || doc.body;\n",
              "after": "  path.setAttribute('d', kind === 'creator' ? 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2' : 'M4 5h16v16H4ZM8 2v6M16 2v6M4 10h16');\n  svg.appendChild(path); svg.style.flexShrink = '0'; return svg;\n}\ninterface RetainedHoverImage { id: string; url: string; image: HTMLImageElement; preview: HTMLElement }\n// One current thumbnail per tooltip host. Detached/changed cards cannot reuse it.\nconst retainedHoverImages = new WeakMap<HTMLElement, RetainedHoverImage>();\n\n/** Build a non-interactive preview with textContent and stable dimensions.\n * Same-image enrichment keeps the existing loading/decoded image; target changes\n * never borrow its pixels. Weak ownership introduces no thumbnail history cache.\n */\nexport function renderImageryHoverCard(host: HTMLElement, data: any, fallbackDate?: unknown, loading = false, l10n: Presentation = englishPresentation): void {\n  const id = data?.id == null ? '' : String(data.id);\n  const url = typeof data?.thumb_256_url === 'string' ? data.thumb_256_url : '';\n  const previous = retainedHoverImages.get(host);\n  const reuse = !!id && !!url && previous?.id === id && previous.url === url &&\n    previous.preview.parentNode === host && host.style.display !== 'none' &&\n    (!previous.image.complete || previous.image.naturalWidth > 0);\n  retainedHoverImages.delete(host);\n  Object.assign(host.style, styles.shell); if (!host.style.width || host.style.width === 'max-content') host.style.width = '240px'; host.style.display = 'block'; host.setAttribute('role', 'tooltip');\n  l10n.release(host); l10n.bind(host,'dir',()=>l10n.locale==='ar'?'rtl':'ltr'); host.textContent = ''; const doc = host.ownerDocument;\n  const portal = doc.fullscreenElement || doc.body;\n"
            },
            {
              "label": "Retain current hover thumbnail 2",
              "before": "  date.appendChild(icon); date.appendChild(label); host.appendChild(date);\n  const preview = doc.createElement('div'); Object.assign(preview.style, styles.preview); l10n.bind(preview,\"textContent\",()=>loading || data?.thumb_256_url ? l10n.text(\"Loading preview\u2026\") : l10n.text(\"Preview unavailable\")); host.appendChild(preview);\n  if (data?.thumb_256_url) {\n    const image = doc.createElement('img'); Object.assign(image.style, styles.image); l10n.bind(image,\"alt\",()=>l10n.text(\"Street imagery preview\")); image.decoding = 'async';\n    image.onload = () => { if (preview.parentNode === host) { preview.textContent = ''; preview.appendChild(image); } };\n    image.onerror = () => { if (preview.parentNode === host) l10n.bind(preview,\"textContent\",()=>l10n.text(\"Preview unavailable\")); };\n    image.src = data.thumb_256_url;\n  }\n}\n/** Anchor once beside the hover target, clamped to the widget/viewport and its available width. */\n",
              "after": "  date.appendChild(icon); date.appendChild(label); host.appendChild(date);\n  const preview = doc.createElement('div'); Object.assign(preview.style, styles.preview); l10n.bind(preview,\"textContent\",()=>loading || data?.thumb_256_url ? l10n.text(\"Loading preview\u2026\") : l10n.text(\"Preview unavailable\")); host.appendChild(preview);\n  if (data?.thumb_256_url) {\n    const image = reuse ? previous!.image : doc.createElement('img');\n    Object.assign(image.style, styles.image); l10n.bind(image,\"alt\",()=>l10n.text(\"Street imagery preview\")); image.decoding = 'async';\n    const retained = { id, url, image, preview }; retainedHoverImages.set(host, retained);\n    const current = () => retainedHoverImages.get(host) === retained && preview.parentNode === host;\n    const show = () => { if (current()) { preview.textContent = ''; preview.appendChild(image); } };\n    image.onload = show;\n    image.onerror = () => { if (current()) l10n.bind(preview,\"textContent\",()=>l10n.text(\"Preview unavailable\")); };\n    if (reuse) { if (image.complete && image.naturalWidth > 0) show(); }\n    else image.src = data.thumb_256_url;\n  }\n}\n/** Anchor once beside the hover target, clamped to the widget/viewport and its available width. */\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/hoverThumbnailRetention.browser.cjs",
      "content": "/** Real Chromium DOM/image fixtures; no Experience Builder or Mapillary network required. */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst {chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright');\nconst root=process.env.MAPILLARY_WIDGET_ROOT||path.resolve(__dirname,'..');\nconst files={card:'src/features/imagery/hoverCard.ts',presentation:'src/i18n/PresentationText.ts',styles:'src/styles/imageryHoverCard.ts'};\nconst modules=Object.fromEntries(Object.entries(files).map(([key,file])=>[key,ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText]));\nconst script=`(()=>{const modules=${JSON.stringify(modules)},cache={};function load(key){if(cache[key])return cache[key].exports;const m=cache[key]={exports:{}};new Function('require','module','exports',modules[key])(id=>load(id.includes('PresentationText')?'presentation':'styles'),m,m.exports);return m.exports;}window.card=load('card');window.presentation=new(load('presentation').PresentationText)();window.host=document.createElement('div');document.body.appendChild(host);window.images=[];const original=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:original.get,set(value){images.push(this);original.set.call(this,value)}});window.render=(id='A',url='/thumb.svg',creator='before')=>card.renderImageryHoverCard(host,{id,thumb_256_url:url,creator:{username:creator},captured_at:1700000000000},undefined,false,presentation);})();`;\nasync function heldRoute(routes){const deadline=Date.now()+5000;while(!routes.length){if(Date.now()>deadline)throw Error('Held thumbnail request did not start');await new Promise(resolve=>setTimeout(resolve,10));}return routes[0];}\nconst svg='<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"><rect width=\"16\" height=\"16\" fill=\"green\"/></svg>';\n(async()=>{\n const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});\n const errors=[];let checks=0;\n async function fixture(){const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const held=[];await page.route('https://preview.test/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><body></body>'});if(url.pathname==='/held.svg'){held.push(route);return;}if(url.pathname==='/bad.svg')return route.fulfill({status:404,body:'missing'});return route.fulfill({contentType:'image/svg+xml',body:svg});});await page.goto('https://preview.test/');await page.addScriptTag({content:script});return{page,held};}\n try{\n  {\n   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);\n   assert.deepEqual(await page.evaluate(()=>{const image=host.querySelector('img');render('A','/thumb.svg','after');return{same:host.querySelector('img')===image,writes:images.length,text:host.textContent.includes('after')};}),{same:true,writes:1,text:true});checks++;await page.close();\n  }\n  {\n   const {page,held}=await fixture();await page.evaluate(()=>render('A','/held.svg'));await page.waitForFunction(()=>images.length===1);await page.evaluate(()=>render('A','/held.svg','enriched'));\n   assert.equal(await page.evaluate(()=>images.length),1);await (await heldRoute(held)).fulfill({contentType:'image/svg+xml',body:svg});await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);assert.equal(await page.evaluate(()=>host.querySelector('img')===images[0]),true);checks++;await page.close();\n  }\n  {\n   const {page,held}=await fixture();await page.evaluate(()=>render('A','/held.svg'));await heldRoute(held);await page.evaluate(()=>render('B','/thumb.svg','different image'));await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);await held[0].fulfill({contentType:'image/svg+xml',body:svg});await page.waitForFunction(()=>images[0].complete);assert.equal(await page.evaluate(()=>host.querySelector('img')===images[1]&&host.textContent.includes('different image')),true);checks++;await page.close();\n  }\n  {\n   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);\n   await page.evaluate(()=>render('A','/other.svg'));assert.equal(await page.evaluate(()=>images.length),2);await page.waitForFunction(()=>host.querySelector('img')===images[1]);checks++;await page.close();\n  }\n  {\n   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);\n   assert.equal(await page.evaluate(()=>{const image=host.querySelector('img');render('A','/thumb.svg','after');presentation.update('ar',text=>text==='Street imagery preview'?'\u0635\u0648\u0631\u0629 \u0627\u0644\u0634\u0627\u0631\u0639':text);return host.querySelector('img')===image&&image.alt==='\u0635\u0648\u0631\u0629 \u0627\u0644\u0634\u0627\u0631\u0639'&&host.dir==='rtl';}),true);checks++;await page.close();\n  }\n  {\n   const {page}=await fixture();await page.evaluate(()=>render('A','/bad.svg'));await page.waitForFunction(()=>host.textContent.includes('Preview unavailable'));\n   await page.evaluate(()=>render('A','/bad.svg'));assert.equal(await page.evaluate(()=>images.length),2);checks++;await page.close();\n  }\n  {\n   const {page}=await fixture();await page.evaluate(()=>render());await page.waitForFunction(()=>host.querySelector('img')?.naturalWidth>0);\n   assert.equal(await page.evaluate(()=>{host.textContent='';host.style.display='none';render();return images.length===2;}),true);checks++;await page.close();\n  }\n  assert.deepEqual(errors,[]);console.log(checks+' Chromium checks passed: decoded/pending retention, stale target exclusion, URL changes, live locale, failure retry and cleared-card isolation.');\n }finally{await browser.close();}\n})().catch(error=>{console.error(error);process.exitCode=1;});\n"
    },
    {
      "file": "docs/HOVER-THUMBNAIL-RETENTION.md",
      "content": "# Retain thumbnails during same-image hover enrichment\n\n`renderImageryHoverCard` previously created a new image element and assigned its thumbnail URL each time cached metadata was enriched. Even when the browser reused downloaded bytes, this replaced already visible pixels with a loading placeholder until the new element loaded.\n\nA WeakMap now retains one current image element per tooltip host. Reuse requires the same nonempty image ID, identical URL, an attached current preview, a visible card and either a pending image or a successfully loaded image. A loaded image is attached synchronously to the rebuilt metadata card; a pending image retains its request and receives the current card's callbacks. No second src assignment occurs during same-image enrichment.\n\nTarget/URL changes create a new element. Late load/error callbacks must match both the current WeakMap entry and attached preview before changing content. Failed images can be retried by later renders; hidden/cleared cards do not reuse prior thumbnails. Language bindings are refreshed for the retained image. The helper does not prefetch imagery or retain a history of hovered thumbnails.\n\n## Validation\n\nSeven Chromium checks exercise real image loading and the production card, styles and presentation owner: loaded-image identity and src-write count; pending-image reuse; stale target isolation; changed URLs; Arabic direction/alt text while retaining pixels; failed-image retry; and cleared-card isolation. The previous implementation fails the first case with a different image element and two src writes; the new implementation passes all seven. This demonstrates removal of DOM replacement/reload scheduling, not a measured reduction in network requests, GPU time or SDK image-opening latency.\n\nNo map picker, bearing policy, sequence overview, click handler or viewer code changes in this patch. A full Experience Builder host build and visual validation remain local-host checks.\n\n## Install and rollback\n\nFrom the widget root, outside `src`:\n\n    node apply-hover-thumbnail-retention.cjs\n\nRebuild and reload Experience Builder. `--dry-run` checks targets without writing source. The installer does not run browser tests/builds. The standalone uninstaller restores this card change and removes its added test/documentation, retaining previous hover and click fixes. Conflicting edits are refused.\n\nRun the browser fixture from the widget root with TypeScript, Playwright and Chromium available:\n\n    MAPILLARY_TYPESCRIPT=/path/to/typescript.js node tests/hoverThumbnailRetention.browser.cjs\n\nOptional paths: `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`, `MAPILLARY_WIDGET_ROOT`.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'hover-thumbnail-retention-';

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
    if (manifest.installer !== 'hover-thumbnail-retention' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-hover-thumbnail-retention.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Hover thumbnail retention is already installed. No files changed.');
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
  const manifest = { installer: 'hover-thumbnail-retention', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Hover thumbnail retention ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
