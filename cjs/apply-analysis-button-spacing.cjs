#!/usr/bin/env node
'use strict';
/**
 * Analysis button spacing confirmation. Compatible current v6 sources.
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
      "file": "src/styles/coverageAnalysis.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Analysis button spacing 1",
              "before": "/** Coverage-analysis trigger presentation; analysis scheduling and result state remain runtime-owned. */\nimport type { React } from 'jimu-core';\nexport const coverageAnalysisTriggerRowStyle: React.CSSProperties = {\n    marginTop: \"5px\",\n    borderTop: \"1px solid rgba(255,255,255,0.08)\",\n    paddingTop: \"4px\",\n    display: \"flex\",\n",
              "after": "/** Coverage-analysis trigger presentation; analysis scheduling and result state remain runtime-owned. */\nimport type { React } from 'jimu-core';\nexport const coverageAnalysisTriggerRowStyle: React.CSSProperties = {\n    marginTop: \"4px\",\n    marginBottom: \"6px\",\n    borderTop: \"1px solid rgba(255,255,255,0.08)\",\n    paddingTop: \"4px\",\n    display: \"flex\",\n"
            },
            {
              "label": "Analysis button spacing 2",
              "before": "    return {\n        width: \"100%\",\n        textAlign: \"center\",\n        borderRadius: \"4px\",\n        border: `1px solid ${canRun ? \"rgba(30, 144, 255, 0.4)\" : \"rgba(255,255,255,0.1)\"}`,\n        background: btnBg,\n        color: canRun ? \"rgba(255,255,255,0.9)\" : \"rgba(255,255,255,0.65)\",\n        fontSize: \"7px\",\n        fontWeight: 500,\n        cursor: canRun ? \"pointer\" : \"not-allowed\",\n        display: \"flex\",\n        alignItems: \"center\",\n        justifyContent: \"center\",\n        gap: \"4px\",\n        transition: \"background 0.2s, color 0.2s\",\n        whiteSpace: \"nowrap\",\n        opacity: canRun ? 1 : 0.5,\n    };\n}\n",
              "after": "    return {\n        width: \"100%\",\n        textAlign: \"center\",\n        boxSizing: \"border-box\",\n        minHeight: 24,\n        padding: \"4px 6px\",\n        lineHeight: 1.3,\n        borderRadius: \"5px\",\n        border: `1px solid ${canRun ? \"rgba(30, 144, 255, 0.4)\" : \"rgba(255,255,255,0.1)\"}`,\n        background: btnBg,\n        color: canRun ? \"rgba(255,255,255,0.9)\" : \"rgba(255,255,255,0.65)\",\n        fontSize: \"9px\",\n        fontWeight: 600,\n        cursor: canRun ? \"pointer\" : \"not-allowed\",\n        display: \"flex\",\n        alignItems: \"center\",\n        justifyContent: \"center\",\n        gap: \"4px\",\n        transition: \"background 0.2s, color 0.2s\",\n        whiteSpace: \"normal\",\n        overflowWrap: \"anywhere\",\n        opacity: canRun ? 1 : 0.5,\n    };\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/CoverageAnalysisTrigger.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Analysis button spacing 1",
              "before": "    <React.Fragment>\n      {/* Coverage Analysis button */}\n      <div\n        style={coverageAnalysisTriggerRowStyle}\n      >\n        <button\n          type=\"button\" disabled={!canRun} aria-disabled={!canRun}\n",
              "after": "    <React.Fragment>\n      {/* Coverage Analysis button */}\n      <div\n        className=\"mly-coverage-analysis-trigger\" style={coverageAnalysisTriggerRowStyle}\n      >\n        <button\n          type=\"button\" disabled={!canRun} aria-disabled={!canRun}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/panelControls.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Analysis button spacing 1",
              "before": " if(!mobile){await exportButton.hover();assert.notEqual(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);await page.mouse.move(1,1);assert.equal(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);checks++;}\n await page.evaluate(()=>window.renderInfo({detectionsActive:false}));await labelsButton.waitFor({state:'detached'});assert.equal(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);checks++;\n await page.getByRole('button',{name:'Close image details and tools'}).click();await page.evaluate(()=>window.renderInfo({showAiTags:false}));assert.equal(await page.locator('.mly-info-body').isVisible(),false);await page.evaluate(()=>window.renderInfo({detectionToolsRequest:2}));await overlayButton.waitFor({state:'visible'});assert.equal(await page.locator('.mly-info-more').evaluate(node=>node.open),true);checks++;\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n",
              "after": " if(!mobile){await exportButton.hover();assert.notEqual(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);await page.mouse.move(1,1);assert.equal(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);checks++;}\n await page.evaluate(()=>window.renderInfo({detectionsActive:false}));await labelsButton.waitFor({state:'detached'});assert.equal(await exportButton.evaluate(node=>getComputedStyle(node).backgroundColor),resting);checks++;\n await page.getByRole('button',{name:'Close image details and tools'}).click();await page.evaluate(()=>window.renderInfo({showAiTags:false}));assert.equal(await page.locator('.mly-info-body').isVisible(),false);await page.evaluate(()=>window.renderInfo({detectionToolsRequest:2}));await overlayButton.waitFor({state:'visible'});assert.equal(await page.locator('.mly-info-more').evaluate(node=>node.open),true);checks++;\n await page.evaluate(()=>window.renderInfo({pointCloudVisible:false,turboModeActive:true,turboPointsAvailable:true}));\n const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n"
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
const prefix = 'analysis-button-spacing-';

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
    if (manifest.installer !== 'analysis-button-spacing' || !manifest.completed || manifest.uninstall) continue;
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
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-analysis-button-spacing.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Analysis button spacing confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'analysis-button-spacing', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Analysis button spacing confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
