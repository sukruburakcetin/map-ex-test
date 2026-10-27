#!/usr/bin/env node
'use strict';
/**
 * Utility mobile collapse v6.31. Compatible current v6 sources.
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
      "file": "src/components/ImageUtilityGroup.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/ImageUtilityGroup.tsx block 1",
              "before": "\n/** Compact viewer actions. SDK work remains in the supplied runtime callbacks. */\nexport const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = props => {\n    const [open, setOpen] = React.useState<\"more\" | \"cloud\" | null>(null);\n    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 148, maxHeight: 210 });\n    const dock = React.useRef<HTMLDivElement>(null);\n    const trigger = React.useRef<HTMLButtonElement>(null);\n    const menu = React.useRef<HTMLDivElement>(null);\n",
              "after": "\n/** Compact viewer actions. SDK work remains in the supplied runtime callbacks. */\nexport const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = props => {\n    const [open, setOpen] = React.useState<\"more\" | \"cloud\" | null>(null);\n    const [collapsed, setCollapsed] = React.useState(() => {\n        try { return sessionStorage.getItem('mly-utility-collapsed-v1') === '1'; } catch { return false; }\n    });\n    const [mobile, setMobile] = React.useState(false);\n    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 148, maxHeight: 210 });\n    const dock = React.useRef<HTMLDivElement>(null);\n    const trigger = React.useRef<HTMLButtonElement>(null);\n    const menu = React.useRef<HTMLDivElement>(null);\n"
            },
            {
              "label": "src/components/ImageUtilityGroup.tsx block 2",
              "before": "    const cloudBlocked = props.pointCloudAvailable === false && !props.pointCloudLoading && !cloudOn;\n    const cloudMode = props.is3D && !props.hidePointCloud;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload;\n    const close = (focus = false) => { setOpen(null); if (focus) trigger.current?.focus(); };\n\n    React.useLayoutEffect(() => { setOpen(null); }, [props.imageId, props.is3D]);\n    React.useEffect(() => { if ((open === \"more\" && !hasMore) || (open === \"cloud\" && !cloudMode)) setOpen(null); }, [open, hasMore, cloudMode]);\n    React.useLayoutEffect(() => {\n",
              "after": "    const cloudBlocked = props.pointCloudAvailable === false && !props.pointCloudLoading && !cloudOn;\n    const cloudMode = props.is3D && !props.hidePointCloud;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload;\n    const close = (focus = false) => { setOpen(null); if (focus) trigger.current?.focus(); };\n    const hasNavigation = !props.hideCenterMapButton || (!props.hideTimeTravel && props.hasTimeTravel);\n    const hasSceneTools = props.is3D && (!props.hideSyncHeadingButton || !props.hidePointCloud);\n    const toolsActive = (props.is3D && !props.hidePointCloud && cloudOn) || (props.is3D && !props.hideSyncHeadingButton && props.syncHeading);\n    React.useLayoutEffect(() => {\n        const host = dock.current?.parentElement;\n        if (!host) return;\n        const update = () => {\n            const width = host.getBoundingClientRect().width;\n            setMobile(window.matchMedia('(max-width: 480px)').matches || (width > 0 && width <= 480));\n        };\n        update();\n        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;\n        observer?.observe(host);\n        window.addEventListener('resize', update);\n        return () => { observer?.disconnect(); window.removeEventListener('resize', update); };\n    }, [hasNavigation, hasSceneTools, hasMore]);\n    React.useLayoutEffect(() => { if (mobile && collapsed) setOpen(null); }, [mobile, collapsed]);\n\n\n    React.useLayoutEffect(() => { setOpen(null); }, [props.imageId, props.is3D]);\n    React.useEffect(() => { if ((open === \"more\" && !hasMore) || (open === \"cloud\" && !cloudMode)) setOpen(null); }, [open, hasMore, cloudMode]);\n    React.useLayoutEffect(() => {\n"
            },
            {
              "label": "src/components/ImageUtilityGroup.tsx block 3",
              "before": "        const bounds = dock.current.parentElement?.getBoundingClientRect();\n        const left = Math.max(8, bounds?.left ?? 0), right = Math.min(window.innerWidth - 8, bounds?.right ?? window.innerWidth);\n        const top = Math.max(8, bounds?.top ?? 0), bottom = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);\n        const width = Math.max(0, Math.min(open === \"cloud\" ? 148 : 156, right - left));\n        const maxHeight = Math.max(0, Math.min(260, bottom - top));\n        const height = Math.min(menu.current.scrollHeight, maxHeight);\n        const above = anchor.top - top >= height + 6 || anchor.top - top >= bottom - anchor.bottom;\n        setPosition({ width, maxHeight, left: Math.max(left, Math.min(anchor.right - width, right - width)),\n            top: Math.max(top, Math.min(above ? anchor.top - height - 6 : anchor.bottom + 6, bottom - height)) });\n        menu.current.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();\n    }, [open, props.isDownloading, cloudMode]);\n    React.useEffect(() => {\n        if (!open) return;\n",
              "after": "        const bounds = dock.current.parentElement?.getBoundingClientRect();\n        const left = Math.max(8, bounds?.left ?? 0), right = Math.min(window.innerWidth - 8, bounds?.right ?? window.innerWidth);\n        const top = Math.max(8, bounds?.top ?? 0), bottom = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);\n        const width = Math.max(0, Math.min(open === \"cloud\" ? 148 : 156, right - left));\n        const dockBounds = dock.current.getBoundingClientRect();\n        const aboveSpace = Math.max(0, dockBounds.top - top - 6), belowSpace = Math.max(0, bottom - dockBounds.bottom - 6);\n        const maxHeight = Math.max(0, Math.min(260, bottom - top, Math.max(40, aboveSpace, belowSpace)));\n        const height = Math.min(menu.current.scrollHeight + 2, maxHeight);\n        const above = aboveSpace >= height || aboveSpace >= belowSpace;\n        setPosition({ width, maxHeight, left: Math.max(left, Math.min(anchor.right - width, right - width)),\n            top: Math.max(top, Math.min(above ? dockBounds.top - height - 6 : dockBounds.bottom + 6, bottom - height)) });\n        menu.current.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();\n    }, [open, props.isDownloading, cloudMode]);\n    React.useEffect(() => {\n        if (!open) return;\n"
            },
            {
              "label": "src/components/ImageUtilityGroup.tsx block 4",
              "before": "        };\n    }, [open]);\n\n    const cloudLabel = props.pointCloudLoading ? 'Cancel point-cloud loading' : cloudOn ? 'Close point cloud' : cloudBlocked ? 'No point cloud available for this image' : 'Load point cloud';\n    const hasNavigation = !props.hideCenterMapButton || (!props.hideTimeTravel && props.hasTimeTravel);\n    const hasSceneTools = props.is3D && (!props.hideSyncHeadingButton || !props.hidePointCloud);\n    if (!hasNavigation && !hasSceneTools && !hasMore) return null;\n    return <div ref={dock} className=\"glass-image-utility-panel mly-utility-dock\" role=\"group\" aria-label=\"Image actions\">\n        <style>{utilityDockCss}</style>\n        {!props.hideCenterMapButton && <button type=\"button\" className=\"utility-button\" title=\"Center map on this image\" aria-label=\"Center map on this image\" onClick={props.onCenterMap}><Icons.Crosshair size={16}/></button>}\n        {!props.hideTimeTravel && props.hasTimeTravel && <button type=\"button\" className=\"utility-button\" title=\"Explore images from other dates\" aria-label=\"Time travel\" disabled={!currentImage}\n            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n",
              "after": "        };\n    }, [open]);\n\n    const cloudLabel = props.pointCloudLoading ? 'Cancel point-cloud loading' : cloudOn ? 'Close point cloud' : cloudBlocked ? 'No point cloud available for this image' : 'Load point cloud';\n    if (!hasNavigation && !hasSceneTools && !hasMore) return null;\n    return <div ref={dock} className={`glass-image-utility-panel mly-utility-dock${mobile && collapsed ? ' is-collapsed' : ''}`} data-mobile={mobile ? 'true' : undefined} role=\"group\" aria-label=\"Image actions\">\n        <style>{utilityDockCss}</style>\n        {!props.hideCenterMapButton && <button type=\"button\" className=\"utility-button\" title=\"Center map on this image\" aria-label=\"Center map on this image\" onClick={props.onCenterMap}><Icons.Crosshair size={16}/></button>}\n        {!props.hideTimeTravel && props.hasTimeTravel && <button type=\"button\" className=\"utility-button\" title=\"Explore images from other dates\" aria-label=\"Time travel\" disabled={!currentImage}\n            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n"
            },
            {
              "label": "src/components/ImageUtilityGroup.tsx block 5",
              "before": "            <svg aria-hidden=\"true\" width=\"10\" height=\"10\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\"><path d=\"m3 4 3 3 3-3\"/></svg>\n        </button></div>}\n        {hasMore && <button type=\"button\" className=\"utility-button\" title=\"More image actions\" aria-label=\"More image actions\" aria-haspopup=\"dialog\" aria-expanded={open === \"more\"} aria-controls={open === \"more\" ? menuId : undefined}\n            onClick={event => { trigger.current = event.currentTarget; setOpen(value => value === \"more\" ? null : \"more\"); }}><svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"currentColor\"><circle cx=\"4\" cy=\"9\" r=\"1.3\"/><circle cx=\"9\" cy=\"9\" r=\"1.3\"/><circle cx=\"14\" cy=\"9\" r=\"1.3\"/></svg>{props.isDownloading && <span className=\"mly-dock-download-dot\" aria-hidden=\"true\"/>}</button>}\n        {open && ((open === \"more\" && hasMore) || (open === \"cloud\" && cloudMode)) && ReactDOM.createPortal(<div ref={menu} id={menuId} role=\"dialog\" aria-label={open === \"cloud\" ? \"Point-cloud mode\" : \"More image actions\"} className=\"mly-utility-popover\" style={{ ...position, position: 'fixed', zIndex: 2147483000 }}>\n            {open === \"more\" && !props.hideShareButton && <button type=\"button\" onClick={() => { close(true); props.onShare(); }}><Icons.Share size={15}/><span>Share view</span></button>}\n            {open === \"more\" && !props.hideImageDownload && <button type=\"button\" disabled={props.isDownloading} onClick={() => { close(true); props.onDownload(); }}><Icons.Download size={15}/><span>{props.isDownloading ? 'Downloading image\u2026' : 'Download image'}</span></button>}\n            {open === \"cloud\" && <div role=\"group\" aria-label=\"Point-cloud mode options\"><span className=\"mly-dock-menu-label\">Point-cloud mode</span>\n",
              "after": "            <svg aria-hidden=\"true\" width=\"10\" height=\"10\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\"><path d=\"m3 4 3 3 3-3\"/></svg>\n        </button></div>}\n        {hasMore && <button type=\"button\" className=\"utility-button\" title=\"More image actions\" aria-label=\"More image actions\" aria-haspopup=\"dialog\" aria-expanded={open === \"more\"} aria-controls={open === \"more\" ? menuId : undefined}\n            onClick={event => { trigger.current = event.currentTarget; setOpen(value => value === \"more\" ? null : \"more\"); }}><svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"currentColor\"><circle cx=\"4\" cy=\"9\" r=\"1.3\"/><circle cx=\"9\" cy=\"9\" r=\"1.3\"/><circle cx=\"14\" cy=\"9\" r=\"1.3\"/></svg>{props.isDownloading && <span className=\"mly-dock-download-dot\" aria-hidden=\"true\"/>}</button>}\n        {mobile && <button type=\"button\" className=\"utility-button mly-dock-collapse\" aria-label={collapsed ? (toolsActive ? 'Show image tools (tools active)' : 'Show image tools') : 'Hide image tools'}\n            title={collapsed ? 'Show image tools' : 'Hide image tools'} aria-expanded={!collapsed}\n            onClick={() => { const next = !collapsed; setOpen(null); setCollapsed(next); try { sessionStorage.setItem('mly-utility-collapsed-v1', next ? '1' : '0'); } catch { /* Storage may be unavailable in embedded browsers. */ } }}>\n            <svg aria-hidden=\"true\" width=\"18\" height=\"16\" viewBox=\"0 0 24 18\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.4\" strokeLinecap=\"round\" strokeLinejoin=\"round\">\n                {collapsed ? <React.Fragment><path d=\"M2 4h12M2 9h12M2 14h12M5 2v4M11 7v4M6 12v4\"/><path d=\"m21 5-4 4 4 4\"/></React.Fragment> : <path d=\"m9 4 5 5-5 5\"/>}\n            </svg>\n            {collapsed && toolsActive && <span className=\"mly-dock-collapsed-active\" aria-hidden=\"true\"/>}\n        </button>}\n        {open && ((open === \"more\" && hasMore) || (open === \"cloud\" && cloudMode)) && ReactDOM.createPortal(<div ref={menu} id={menuId} role=\"dialog\" aria-label={open === \"cloud\" ? \"Point-cloud mode\" : \"More image actions\"} className=\"mly-utility-popover\" style={{ ...position, position: 'fixed', zIndex: 2147483000 }}>\n            {open === \"more\" && !props.hideShareButton && <button type=\"button\" onClick={() => { close(true); props.onShare(); }}><Icons.Share size={15}/><span>Share view</span></button>}\n            {open === \"more\" && !props.hideImageDownload && <button type=\"button\" disabled={props.isDownloading} onClick={() => { close(true); props.onDownload(); }}><Icons.Download size={15}/><span>{props.isDownloading ? 'Downloading image\u2026' : 'Download image'}</span></button>}\n            {open === \"cloud\" && <div role=\"group\" aria-label=\"Point-cloud mode options\"><span className=\"mly-dock-menu-label\">Point-cloud mode</span>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/controlPanels.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/controlPanels.ts block 1",
              "before": "}\n@media (max-width: 768px) and (max-height: 440px) {\n  .mly-fullscreen-viewer:not(.mly-minimap-expanded) .glass-image-utility-panel.mly-utility-dock { top: calc(78px + env(safe-area-inset-top,0px)) !important; left: calc(114px + env(safe-area-inset-left,0px)) !important; }\n}\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n",
              "after": "}\n@media (max-width: 768px) and (max-height: 440px) {\n  .mly-fullscreen-viewer:not(.mly-minimap-expanded) .glass-image-utility-panel.mly-utility-dock { top: calc(78px + env(safe-area-inset-top,0px)) !important; left: calc(114px + env(safe-area-inset-left,0px)) !important; }\n}\n\n/* Mobile-only collapse tab: no extra grid row while the actions are expanded. */\n.glass-image-utility-panel.mly-utility-dock[data-mobile=\"true\"] .mly-dock-collapse { position: absolute; top: 0; left: -20px; width: 18px !important; height: 22px !important; border: 1px solid #95bea044; background: rgba(20,40,31,.9); }\n.glass-image-utility-panel.mly-utility-dock[data-mobile=\"true\"] .mly-dock-collapse svg { width: 18px !important; height: 16px !important; }\n.glass-image-utility-panel.mly-utility-dock[data-mobile=\"true\"].is-collapsed { display: flex !important; width: max-content; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed > .utility-button:not(.mly-dock-collapse),\n.glass-image-utility-panel.mly-utility-dock.is-collapsed > .mly-dock-divider,\n.glass-image-utility-panel.mly-utility-dock.is-collapsed > .mly-dock-cloud-group { display: none !important; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed > .mly-dock-cloud-group:has(> .is-loading) { display: flex !important; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed .mly-dock-mode-trigger { display: none !important; }\n.glass-image-utility-panel.mly-utility-dock[data-mobile=\"true\"].is-collapsed .mly-dock-collapse { position: relative; top: auto; left: auto; width: 26px !important; height: 26px !important; border-color: transparent; background: transparent; }\n.glass-image-utility-panel.mly-utility-dock.is-collapsed .utility-button::after, .glass-image-utility-panel.mly-utility-dock.is-collapsed .mly-dock-cloud-group::after { display: none; }\n.mly-dock-collapsed-active { position: absolute; right: 1px; bottom: 1px; width: 4px; height: 4px; border-radius: 50%; background: #8ae7ab; }\n.mly-fullscreen-viewer.mly-minimap-expanded .glass-image-utility-panel.mly-utility-dock { display: none !important; }\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n"
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
const prefix = 'utility-mobile-collapse-v6-31-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.31 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'utility-mobile-collapse-v6-31' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.31 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.31 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.31 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-utility-mobile-collapse-v6-31.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Utility mobile collapse v6.31 is already installed. No files changed.');
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
  const manifest = { installer: 'utility-mobile-collapse-v6-31', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Utility mobile collapse v6.31 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
