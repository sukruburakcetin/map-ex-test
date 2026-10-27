#!/usr/bin/env node
'use strict';
/**
 * Splash atlas background v6.35. Compatible current v6 sources.
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
      "file": "src/components/SplashScreen.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/SplashScreen.tsx block 1",
              "before": "    }, [showIntro, filtersLoaded, onDismiss]);\n    if (!showIntro) return null;\n    return <div className=\"mly-intro\" style={getSplashOverlayStyle(filtersLoaded)}>\n      <style>{splashAnimationCss}</style>\n      <div className=\"mly-intro-layout\">\n        <div className=\"mly-intro-scene\">\n          <svg aria-hidden=\"true\" viewBox=\"0 0 640 280\" preserveAspectRatio=\"xMidYMid slice\">\n            <defs><linearGradient id={`${sceneId}-sky`} x2=\"0\" y2=\"1\"><stop stopColor=\"#36565e\"/><stop offset=\"1\" stopColor=\"#93aaa1\"/></linearGradient></defs>\n",
              "after": "    }, [showIntro, filtersLoaded, onDismiss]);\n    if (!showIntro) return null;\n    return <div className=\"mly-intro\" style={getSplashOverlayStyle(filtersLoaded)}>\n      <style>{splashAnimationCss}</style>\n      <svg className=\"mly-intro-atlas\" aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 1200 800\" preserveAspectRatio=\"xMidYMid slice\" fill=\"none\">\n        <g stroke=\"#82b297\" strokeWidth=\"1\" opacity=\".17\">\n          {[0, 1, 2, 3, 4, 5, 6].map(line => <path key={line} transform={`translate(${line * 24} ${line * -19})`} d=\"M-160 240C30 80 150 105 228 212S365 355 440 250 537 82 690 110 872 231 1010 115 1220 80 1370 185\"/>)}\n          {[0, 1, 2, 3, 4, 5].map(line => <path key={line} transform={`translate(${line * -24} ${line * 20})`} d=\"M-110 635C70 485 160 555 252 642S420 763 533 657 655 496 797 563 925 695 1040 580 1220 476 1380 559\"/>)}\n        </g>\n        <g stroke=\"#6b9d83\" strokeWidth=\"1\" opacity=\".12\">\n          <path d=\"M110 0V800M290 0V800M910 0V800M1090 0V800M0 145H1200M0 655H1200\"/>\n          <path d=\"M0 410 260 410 260 145 510 145M690 655H940V390H1200\"/>\n        </g>\n        <path d=\"M-40 720 170 590H290V440L530 310H750L960 170H1240\" stroke=\"#94c9a5\" strokeWidth=\"1.5\" strokeDasharray=\"3 9\" opacity=\".2\"/>\n        <g fill=\"#b5d6bc\" opacity=\".35\"><circle cx=\"170\" cy=\"590\" r=\"3\"/><circle cx=\"960\" cy=\"170\" r=\"3\"/></g>\n        <g stroke=\"#a1c9b1\" strokeWidth=\"1\" opacity=\".3\"><path d=\"M104 145h12M110 139v12M1084 655h12M1090 649v12\"/></g>\n      </svg>\n      <div className=\"mly-intro-layout\">\n        <div className=\"mly-intro-scene\">\n          <svg aria-hidden=\"true\" viewBox=\"0 0 640 280\" preserveAspectRatio=\"xMidYMid slice\">\n            <defs><linearGradient id={`${sceneId}-sky`} x2=\"0\" y2=\"1\"><stop stopColor=\"#36565e\"/><stop offset=\"1\" stopColor=\"#93aaa1\"/></linearGradient></defs>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/splashScreen.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/splashScreen.ts block 1",
              "before": "/** Quiet panoramic viewfinder: static artwork, one entrance fade and preparation spinner. */\nexport function getSplashOverlayStyle(filtersLoaded: boolean) {\n  return { position: \"absolute\", inset: 0, zIndex: 999999999, display: \"grid\", placeItems: \"center\", overflow: \"hidden\",\n    containerType: \"size\", background: \"#11221f\", opacity: filtersLoaded ? 0 : 1,\n    pointerEvents: filtersLoaded ? \"none\" : \"auto\", transition: \"opacity 220ms ease\" } as const;\n}\nexport const splashAnimationCss = `\n@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }\n@keyframes mly-intro-loading { to { transform: rotate(360deg); } }\n.mly-intro-layout { width: min(640px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #b0cabe2b; border-radius: 12px; background: #182e29; color: #e8efe6; font-family: \"Segoe UI\",sans-serif; box-shadow: 0 16px 40px #0003; animation: mly-intro-enter 180ms ease-out both; }\n.mly-intro-scene { position: relative; height: 240px; overflow: hidden; background: #36565e; }\n.mly-intro-scene > svg { display: block; width: 100%; height: 100%; }\n.mly-intro-brand { position: absolute; top: 16px; left: 20px; display: flex; align-items: center; gap: 7px; font-size: 11px; color: #e5eee4; text-shadow: 0 1px 4px #15342f; }\n.mly-intro-brand img { border-radius: 5px; }\n",
              "after": "/** Quiet panoramic viewfinder: static artwork, one entrance fade and preparation spinner. */\nexport function getSplashOverlayStyle(filtersLoaded: boolean) {\n  return { position: \"absolute\", inset: 0, zIndex: 999999999, display: \"grid\", placeItems: \"center\", overflow: \"hidden\",\n    containerType: \"size\", background: \"radial-gradient(ellipse at 50% 45%, #29473a 0%, #172f28 38%, #10231f 75%, #0d1c19 100%)\", opacity: filtersLoaded ? 0 : 1,\n    pointerEvents: filtersLoaded ? \"none\" : \"auto\", transition: \"opacity 220ms ease\" } as const;\n}\nexport const splashAnimationCss = `\n@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }\n@keyframes mly-intro-loading { to { transform: rotate(360deg); } }\n.mly-intro-atlas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\n.mly-intro-layout { position: relative; z-index: 1; width: min(640px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #b0cabe2b; border-radius: 12px; background: #182e29; color: #e8efe6; font-family: \"Segoe UI\",sans-serif; box-shadow: 0 18px 55px #0005, 0 0 0 1px #b9d5c208; animation: mly-intro-enter 180ms ease-out both; }\n.mly-intro-scene { position: relative; height: 240px; overflow: hidden; background: #36565e; }\n.mly-intro-scene > svg { display: block; width: 100%; height: 100%; }\n.mly-intro-brand { position: absolute; top: 16px; left: 20px; display: flex; align-items: center; gap: 7px; font-size: 11px; color: #e5eee4; text-shadow: 0 1px 4px #15342f; }\n.mly-intro-brand img { border-radius: 5px; }\n"
            },
            {
              "label": "src/styles/splashScreen.ts block 2",
              "before": ".mly-intro-bottom button:focus-visible { outline: 2px solid #e1ffe8; outline-offset: 3px; }\n.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 9px; color: #91af9c; }\n.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #9ead8a55; border-top-color: #a3d7af; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }\n@container (max-width: 460px) {\n  .mly-intro-layout { width: min(360px,94%); }\n  .mly-intro-scene { height: 180px; }\n  .mly-intro-copy { flex-direction: column; align-items: stretch; padding: 18px; gap: 15px; }\n  .mly-intro-copy h2 { font-size: 25px; }\n",
              "after": ".mly-intro-bottom button:focus-visible { outline: 2px solid #e1ffe8; outline-offset: 3px; }\n.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 9px; color: #91af9c; }\n.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #9ead8a55; border-top-color: #a3d7af; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }\n@container (max-width: 460px) {\n  .mly-intro-atlas { opacity: .65; }\n  .mly-intro-layout { width: min(360px,94%); }\n  .mly-intro-scene { height: 180px; }\n  .mly-intro-copy { flex-direction: column; align-items: stretch; padding: 18px; gap: 15px; }\n  .mly-intro-copy h2 { font-size: 25px; }\n"
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
const prefix = 'splash-atlas-background-v6-35-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.35 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'splash-atlas-background-v6-35' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.35 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.35 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.35 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-splash-atlas-background-v6-35.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Splash atlas background v6.35 is already installed. No files changed.');
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
  const manifest = { installer: 'splash-atlas-background-v6-35', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Splash atlas background v6.35 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
