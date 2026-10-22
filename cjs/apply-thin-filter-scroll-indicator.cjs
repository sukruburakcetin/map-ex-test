#!/usr/bin/env node
'use strict';
/** Thin filter scroll indicator installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/components/FilterScrollRegion.tsx",
      "blocks": [
        {
          "label": "src/components/FilterScrollRegion.tsx thin position indicator block 1",
          "before": "const filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; margin-top:1px; border:1px solid #416756; border-radius:8px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll { flex:1 1 0; min-width:0; height:32px; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; scrollbar-color:#548b70 transparent; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n/* Chromium/WebKit prefer their explicit two-pixel scrollbar over CSS's platform \"thin\" width. */\n@supports selector(::-webkit-scrollbar) { .mly-filter-scroll { scrollbar-width:auto; } }\n.mly-filter-scroll::-webkit-scrollbar { height:2px; }\n.mly-filter-scroll::-webkit-scrollbar-button { display:none; width:0; height:0; }\n.mly-filter-scroll::-webkit-scrollbar-track { background:transparent; }\n.mly-filter-scroll::-webkit-scrollbar-thumb { background:#548b70; border-radius:4px; }\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n",
          "after": "const filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; margin-top:1px; border:1px solid #416756; border-radius:8px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:32px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:30px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-progress { position:absolute; left:0; right:0; bottom:0; height:2px; overflow:hidden; pointer-events:none; border-radius:1px; background:rgba(106,167,133,.10); }\n.mly-filter-progress > span { display:block; position:absolute; top:0; height:2px; border-radius:1px; background:#548b70; }\n.mly-filter-scroll:focus-visible, .mly-filter-panel button:focus-visible, .mly-filter-panel input:focus-visible, .mly-filter-panel select:focus-visible { outline:2px solid #76dba5 !important; outline-offset:-2px; }\n.mly-filter-row { display:flex; align-items:center; justify-content:center; gap:5px; width:max-content; min-width:100%; height:28px; box-sizing:border-box; }\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx thin position indicator block 2",
          "before": "  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n",
          "after": "  const viewport = React.useRef<HTMLDivElement>(null);\n  const row = React.useRef<HTMLDivElement>(null);\n  const progressThumb = React.useRef<HTMLSpanElement>(null);\n  const [id] = React.useState(() => `mly-filter-scroll-${++nextFilterScrollId}`);\n  const [edges, setEdges] = React.useState({ overflow: false, left: false, right: false });\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx thin position indicator block 3",
          "before": "    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n",
          "after": "    const update = () => {\n      const end = Math.max(0, el.scrollWidth - el.clientWidth);\n      // Update the two-pixel decoration directly; scrolling does not rerender filters.\n      if (progressThumb.current) {\n        progressThumb.current.style.width = `${el.scrollWidth ? Math.min(1, el.clientWidth / el.scrollWidth) * 100 : 100}%`;\n        progressThumb.current.style.left = `${el.scrollWidth ? Math.max(0, Math.min(end, el.scrollLeft)) / el.scrollWidth * 100 : 0}%`;\n      }\n      const next = { overflow: end > 1, left: el.scrollLeft > 1, right: el.scrollLeft < end - 1 };\n      setEdges(old => old.overflow === next.overflow && old.left === next.left && old.right === next.right ? old : next);\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx thin position indicator block 4",
          "before": "    <style>{filterPanelCss}</style>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters left\" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>\u2039</button>}\n    <div ref={viewport} id={id} className=\"mly-filter-scroll\" role=\"region\" aria-label=\"Mapillary filters\" tabIndex={0} onKeyDown={event => {\n      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;\n",
          "after": "    <style>{filterPanelCss}</style>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters left\" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}>\u2039</button>}\n    <div className=\"mly-filter-scroll-wrap\">\n    <div ref={viewport} id={id} className=\"mly-filter-scroll\" role=\"region\" aria-label=\"Mapillary filters\" tabIndex={0} onKeyDown={event => {\n      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;\n"
        },
        {
          "label": "src/components/FilterScrollRegion.tsx thin position indicator block 5",
          "before": "      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n",
          "after": "      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); el.scrollTo({ left: event.key === 'Home' ? 0 : el.scrollWidth, behavior: 'smooth' }); }\n    }}><div ref={row} className=\"mly-filter-row\">{children}</div></div>\n    <div className=\"mly-filter-progress\" aria-hidden=\"true\" style={{ display: edges.overflow ? 'block' : 'none' }}><span ref={progressThumb} /></div>\n    </div>\n    {edges.overflow && <button type=\"button\" className=\"mly-filter-nav\" aria-label=\"Scroll filters right\" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}>\u203a</button>}\n  </div>;\n"
        }
      ]
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'thin-filter-scroll-indicator-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
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

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-thin-filter-scroll-indicator.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited organization filter references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Thin filter scroll indicator is already uninstalled. No files changed.' : 'Thin filter scroll indicator is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
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
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'thin-filter-scroll-indicator', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Thin filter scroll indicator ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. The filter row hides the native scrollbar and uses a fixed two-pixel position indicator. Arrows, wheel, keyboard and touch scrolling remain available.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
