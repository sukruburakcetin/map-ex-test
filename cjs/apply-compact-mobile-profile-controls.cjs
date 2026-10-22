#!/usr/bin/env node
'use strict';
/** Compact mobile profile controls installer. Plain source payload.
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
      "file": "src/features/elevation/profileIndicator.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 1",
          "before": "}\nconst mobileProfileCss = `\n.mly-profile-summary, .mly-profile-mobile-altitudes, .mly-profile-mobile-toolbar, .mly-profile-mobile-layers { display: none; }\n/* The flow wrapper belongs to React, so SDK class/style updates cannot reset it. */\n.mly-profile-flow-dock > *,\n",
          "after": "}\nconst mobileProfileCss = `\n.mly-profile-header, .mly-profile-summary, .mly-profile-mobile-altitudes, .mly-profile-mobile-toolbar, .mly-profile-mobile-layers { display: none; }\n/* The flow wrapper belongs to React, so SDK class/style updates cannot reset it. */\n.mly-profile-flow-dock > *,\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 2",
          "before": ".mly-profile-flow-dock .esri-elevation-profile-legend { display: none !important; }\n.mly-profile-frame-chart.mly-profile-mobile { padding: 0 !important; display: flex; flex-direction: column; min-height: 0; max-height: var(--mly-profile-max-height); overflow: hidden; }\n.mly-profile-mobile .mly-profile-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 44px; flex: 0 0 44px; padding: 0 10px; border: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 600; line-height: 1.3; font-family: inherit; cursor: pointer; text-align: start; }\n.mly-profile-summary span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-mobile .mly-profile-body { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 6px; }\n.mly-profile-mobile.mly-profile-collapsed .mly-profile-body { display: none; }\n",
          "after": ".mly-profile-flow-dock .esri-elevation-profile-legend { display: none !important; }\n.mly-profile-frame-chart.mly-profile-mobile { padding: 0 !important; display: flex; flex-direction: column; min-height: 0; max-height: var(--mly-profile-max-height); overflow: hidden; }\n.mly-profile-mobile .mly-profile-header { display: flex; align-items: center; min-height: 44px; flex: 0 0 44px; min-width: 0; }\n.mly-profile-mobile .mly-profile-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; min-height: 44px; flex: 1 1 0; padding: 0 8px; border: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 600; line-height: 1.3; font-family: inherit; cursor: pointer; text-align: start; }\n.mly-profile-mobile:not(.mly-profile-collapsed) .mly-profile-summary span:first-child { white-space: normal; }\n.mly-profile-summary span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-mobile .mly-profile-body { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 6px; }\n.mly-profile-mobile.mly-profile-collapsed .mly-profile-body { display: none; }\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 3",
          "before": ".mly-profile-mobile .mly-profile-inspection { position: absolute; left: 48px; right: 4px; bottom: 22px; min-height: 0 !important; max-height: 40px; overflow: auto; padding: 2px 4px !important; font-size: 10px !important; background: var(--calcite-color-foreground-1, #faf8f8); opacity: .95 !important; pointer-events: none; }\n.mly-profile-mobile .mly-profile-inspection:empty { display: none; }\n.mly-profile-mobile .mly-profile-mobile-toolbar { display: flex; align-items: center; justify-content: flex-end; gap: 4px; min-height: 44px; flex: 0 0 44px; position: sticky; bottom: 0; z-index: 1; background: var(--calcite-color-foreground-1, #faf8f8); }\n.mly-profile-mobile-toolbar button { min-width: 44px; min-height: 44px; padding: 0 8px; color: inherit; background: transparent; border: 1px solid rgba(127,127,127,.45); border-radius: 4px; font: inherit; font-size: 11px; cursor: pointer; }\n.mly-profile-mobile .mly-profile-mobile-layers:not([hidden]) { display: block; flex: 0 0 auto; max-height: max(44px, calc(var(--mly-profile-max-height) - 88px)); overflow-y: auto; overscroll-behavior: contain; }\n.mly-profile-mobile-layers label { display: flex; align-items: center; gap: 8px; min-height: 44px; box-sizing: border-box; padding: 6px 8px; font-size: 11px; line-height: 1.3; cursor: pointer; }\n.mly-profile-mobile-layers input { width: 18px; height: 18px; flex-shrink: 0; margin: 0; }\n",
          "after": ".mly-profile-mobile .mly-profile-inspection { position: absolute; left: 48px; right: 4px; bottom: 22px; min-height: 0 !important; max-height: 40px; overflow: auto; padding: 2px 4px !important; font-size: 10px !important; background: var(--calcite-color-foreground-1, #faf8f8); opacity: .95 !important; pointer-events: none; }\n.mly-profile-mobile .mly-profile-inspection:empty { display: none; }\n.mly-profile-mobile .mly-profile-mobile-toolbar { display: flex; align-items: center; gap: 0; height: 44px; flex: 0 0 auto; }\n.mly-profile-mobile.mly-profile-collapsed .mly-profile-mobile-toolbar { display: none; }\n.mly-profile-mobile-toolbar button { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; width: 44px; height: 44px; min-width: 44px; min-height: 44px; padding: 0; color: inherit; background: transparent; border: 0; border-radius: 4px; font: inherit; font-size: 18px; line-height: 1; cursor: pointer; }\n.mly-profile-mobile-toolbar button:hover, .mly-profile-mobile-toolbar button[aria-expanded=\"true\"] { background: rgba(127,127,127,.12); }\n.mly-profile-mobile-toolbar button:focus-visible { outline: 2px solid #1684c4; outline-offset: -3px; }\n.mly-profile-mobile-toolbar svg { width: 18px; height: 18px; pointer-events: none; }\n.mly-profile-mobile .mly-profile-mobile-layers:not([hidden]) { display: block; flex: 0 0 auto; max-height: max(44px, calc(var(--mly-profile-max-height) - 44px)); overflow-y: auto; overscroll-behavior: contain; }\n.mly-profile-mobile-layers label { display: flex; align-items: center; gap: 8px; min-height: 44px; box-sizing: border-box; padding: 6px 8px; font-size: 11px; line-height: 1.3; cursor: pointer; }\n.mly-profile-mobile-layers input { width: 18px; height: 18px; flex-shrink: 0; margin: 0; }\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 4",
          "before": "    summary.setAttribute('aria-controls', body.id);\n    const altitudes = doc.createElement('div'); altitudes.className = 'mly-profile-mobile-altitudes'; this.mobileAltitudes = altitudes;\n    host.append(style, summary, body);\n    const label = doc.createElement('div'); this.frameLabel = label;\n    label.className = 'mly-profile-frame-label';\n",
          "after": "    summary.setAttribute('aria-controls', body.id);\n    const altitudes = doc.createElement('div'); altitudes.className = 'mly-profile-mobile-altitudes'; this.mobileAltitudes = altitudes;\n    const header = doc.createElement('div'); header.className = 'mly-profile-header';\n    header.appendChild(summary); host.append(style, header, body);\n    const label = doc.createElement('div'); this.frameLabel = label;\n    label.className = 'mly-profile-frame-label';\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 5",
          "before": "      ['\u2212', 'Zoom out along the sequence', () => this.zoom(2)],\n      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],\n      ['Reset', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],\n    ] as const) {\n      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.setAttribute('aria-label', title);\n      button.addEventListener('click', action); toolbar.appendChild(button);\n    }\n    const layerButton = doc.createElement('button'); layerButton.type = 'button'; layerButton.textContent = 'Layers';\n    layerButton.setAttribute('aria-expanded', 'false'); layerButton.setAttribute('aria-controls', layers.id);\n    layerButton.addEventListener('click', () => {\n",
          "after": "      ['\u2212', 'Zoom out along the sequence', () => this.zoom(2)],\n      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],\n      ['\u21ba', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],\n    ] as const) {\n      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.title = title; button.setAttribute('aria-label', title);\n      button.addEventListener('click', action); toolbar.appendChild(button);\n    }\n    const layerButton = doc.createElement('button'); layerButton.type = 'button';\n    layerButton.title = 'Layers'; layerButton.setAttribute('aria-label', 'Layers');\n    const layerIcon = doc.createElementNS(svgNS, 'svg'); layerIcon.setAttribute('viewBox', '0 0 24 24');\n    layerIcon.setAttribute('aria-hidden', 'true'); layerIcon.setAttribute('focusable', 'false');\n    const layerPath = doc.createElementNS(svgNS, 'path');\n    layerPath.setAttribute('d', 'M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5');\n    layerPath.setAttribute('fill', 'none'); layerPath.setAttribute('stroke', 'currentColor');\n    layerPath.setAttribute('stroke-width', '1.6'); layerPath.setAttribute('stroke-linejoin', 'round');\n    layerIcon.appendChild(layerPath); layerButton.appendChild(layerIcon);\n    layerButton.setAttribute('aria-expanded', 'false'); layerButton.setAttribute('aria-controls', layers.id);\n    layerButton.addEventListener('click', () => {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 6",
          "before": "      body.scrollTop = layers.hidden ? 0 : body.scrollHeight;\n    });\n    toolbar.appendChild(layerButton); body.append(layers, toolbar); native.before(host);\n    this.updateResponsive();\n    const win = doc.defaultView;\n",
          "after": "      body.scrollTop = layers.hidden ? 0 : body.scrollHeight;\n    });\n    toolbar.appendChild(layerButton); header.appendChild(toolbar); body.appendChild(layers); native.before(host);\n    this.updateResponsive();\n    const win = doc.defaultView;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 7",
          "before": "    const frame = this.frame;\n    if (this.mobileSummary) this.mobileSummary.textContent = frame\n      ? `Profile \u00b7 Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} \u00b7 ${frame.distance >= 1000 ? (frame.distance / 1000).toFixed(2) + ' km' : Math.round(frame.distance) + ' m'}`\n      : 'Profile \u00b7 Waiting for current image';\n    if (this.mobileAltitudes && this.mobile && this.mobileExpanded) {\n",
          "after": "    const frame = this.frame;\n    if (this.mobileSummary) this.mobileSummary.textContent = frame\n      ? `${this.mobileExpanded ? 'Frame ' + frame.ordinal.toLocaleString() : 'Profile \u00b7 Frame ' + frame.ordinal.toLocaleString() + '/' + this.index.images.length.toLocaleString()} \u00b7 ${frame.distance >= 1000 ? (frame.distance / 1000).toFixed(2) + ' km' : Math.round(frame.distance) + ' m'}`\n      : 'Profile \u00b7 Waiting for current image';\n    if (this.mobileAltitudes && this.mobile && this.mobileExpanded) {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts compact toolbar block 8",
          "before": "    // Short panes scroll within the profile; the map never loses space or moves.\n    const widgetHeight = dockParent?.clientHeight || win.innerHeight;\n    const panelMaxHeight = Math.max(44, Math.min(200, widgetHeight - 112));\n    const oldHeight = this.height;\n    this.height = mobile ? Math.max(80, Math.min(112, panelMaxHeight - 88)) : 200;\n    if (mobile) this.host.style.setProperty('--mly-profile-max-height', `${panelMaxHeight}px`);\n    else this.host.style.removeProperty('--mly-profile-max-height');\n",
          "after": "    // Short panes scroll within the profile; the map never loses space or moves.\n    const widgetHeight = dockParent?.clientHeight || win.innerHeight;\n    const panelMaxHeight = Math.max(44, Math.min(156, widgetHeight - 112));\n    const oldHeight = this.height;\n    this.height = mobile ? Math.max(80, Math.min(112, panelMaxHeight - 44)) : 200;\n    if (mobile) this.host.style.setProperty('--mly-profile-max-height', `${panelMaxHeight}px`);\n    else this.host.style.removeProperty('--mly-profile-max-height');\n"
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
const prefix = 'compact-mobile-profile-controls-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-compact-mobile-profile-controls.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Compact mobile profile controls is already uninstalled. No files changed.' : 'Compact mobile profile controls is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'compact-mobile-profile-controls', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Compact mobile profile controls ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. On phones, the profile occupies its own section above imagery. The map stays unobstructed; collapse the row to return space to the image. Desktop retains bottom-leading placement.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
