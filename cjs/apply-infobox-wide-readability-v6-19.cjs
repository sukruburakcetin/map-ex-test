#!/usr/bin/env node
'use strict';
/**
 * Infobox readability v6.19. Compatible current v6 sources.
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
      "file": "src/styles/infoBox.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/infoBox.ts block 1",
              "before": ".mly-info-width-toggle[hidden] { display: none; }\n.mly-info-panel.is-wide { width: 144px; }\n.mly-info-panel.is-wide .mly-info-more > div { width: 100% !important; box-sizing: border-box; }\n@media (hover:hover) { .mly-info-width-toggle:hover { background: #ffffff12; } }\n@media (max-width: 600px), (pointer: coarse), (hover: none) {\n  .mly-info-width-toggle { display: none; }\n  .mly-info-panel.is-wide { width: 96px; }\n}\n",
              "after": ".mly-info-width-toggle[hidden] { display: none; }\n.mly-info-panel.is-wide { width: 144px; }\n.mly-info-panel.is-wide .mly-info-more > div { width: 100% !important; box-sizing: border-box; }\n@media (hover:hover) { .mly-info-width-toggle:hover { background: #ffffff12; } }\n\n/* Keep disclosures short; their content must not reserve empty card space. */\n.mly-info-panel .mly-info-more > summary, .mly-info-panel .mly-image-coordinates > summary { padding: 3px 4px; margin: 0; min-height: 0; line-height: 1.25; }\n.mly-info-panel .mly-info-more > .info-box { margin: 0 !important; padding: 0 4px !important; min-height: 0 !important; height: auto !important; }\n.mly-info-panel .mly-image-coordinates { margin: 0; padding: 0; }\n@media (min-width: 601px) and (hover: hover) and (pointer: fine) {\n  @container (min-width: 481px) {\n    .mly-info-panel.is-wide .mly-coverage-results, .mly-info-panel.is-wide .mly-cloud-export, .mly-info-panel.is-wide .mly-route-controls { width: 100% !important; max-width: 100%; box-sizing: border-box; min-width: 0; }\n    .mly-info-panel.is-wide .mly-cloud-export > button { width: 100% !important; }\n    .mly-info-panel.is-wide .mly-info-body { font-size: 11px; }\n    .mly-info-panel.is-wide .mly-info-body :is(div,span,label,summary,button,select,input) { font-size: 11px !important; }\n    .mly-info-panel.is-wide .mly-info-body :is(button,select) { min-height: 28px; box-sizing: border-box; }\n    .mly-info-panel.is-wide .mly-info-quick button { min-height: 34px; }\n    .mly-info-panel.is-wide .mly-info-quick .mly-quick-count { font-size: 9px !important; }\n    .mly-info-panel.is-wide .mly-info-toggle { font-size: 12px; min-height: 28px; }\n    .mly-info-panel.is-wide .mly-info-body summary { font-size: 10px !important; }\n    .mly-info-panel.is-wide .mly-coverage-results button, .mly-info-panel.is-wide .mly-route-controls button { white-space: normal; }\n    .mly-info-panel.is-wide .mly-route-controls select { min-width: 0; max-width: 100%; }\n  }\n}\n@media (max-width: 600px), (pointer: coarse), (hover: none) {\n  .mly-info-width-toggle { display: none; }\n  .mly-info-panel.is-wide { width: 96px; }\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/CoverageAnalysisResults.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/coverage/CoverageAnalysisResults.tsx block 1",
              "before": "export const CoverageAnalysisResults: React.FC<CoverageAnalysisResultsProps> = props => {\n  const { coverageAnalysisLoading, coverageAnalysisProgress, onCancelCoverageAnalysis, coverageResult, coverageSegmentsVisible, onToggleCoverageSegments, onDismissCoverageResult, renderRoutingControls } = props;\n  return (\n<div\n              style={coverageResultsPanelStyle}\n            >\n              {/* Header */}\n              <div\n",
              "after": "export const CoverageAnalysisResults: React.FC<CoverageAnalysisResultsProps> = props => {\n  const { coverageAnalysisLoading, coverageAnalysisProgress, onCancelCoverageAnalysis, coverageResult, coverageSegmentsVisible, onToggleCoverageSegments, onDismissCoverageResult, renderRoutingControls } = props;\n  return (\n<div\n              className=\"mly-coverage-results\"\n              style={coverageResultsPanelStyle}\n            >\n              {/* Header */}\n              <div\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/point-cloud/PointCloudExportControls.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/point-cloud/PointCloudExportControls.tsx block 1",
              "before": "/** Select an export format and forward the explicit download action.\n * InfoBox retains the selection across visibility changes; runtime owns file generation.\n */\nexport const PointCloudExportControls: React.FC<PointCloudExportControlsProps> = ({ format, onFormatChange, pointCloudExportLoading, onDownloadPointCloud }) => (\n<div style={cloudExportPanelStyle}>\n            <select disabled={pointCloudExportLoading} aria-label=\"Point-cloud export format\" title=\"CSV: geographic coordinates. PLY: local metric XYZ with RGB. LAS: georeferenced WGS84 UTM for QGIS.\" value={format} onChange={event => onFormatChange(event.target.value === \"las\" ? \"las\" : event.target.value === \"ply\" ? \"ply\" : \"csv\")} style={cloudExportSelectStyle}><option value=\"csv\">CSV \u00b7 Lat/Lon</option><option value=\"ply\">PLY \u00b7 XYZ/RGB</option><option value=\"las\">LAS \u00b7 QGIS/UTM</option></select>\n            <button\n              type=\"button\" disabled={pointCloudExportLoading} aria-busy={!!pointCloudExportLoading}\n              onClick={() => onDownloadPointCloud?.(format)}\n",
              "after": "/** Select an export format and forward the explicit download action.\n * InfoBox retains the selection across visibility changes; runtime owns file generation.\n */\nexport const PointCloudExportControls: React.FC<PointCloudExportControlsProps> = ({ format, onFormatChange, pointCloudExportLoading, onDownloadPointCloud }) => (\n<div className=\"mly-cloud-export\" style={cloudExportPanelStyle}>\n            <select disabled={pointCloudExportLoading} aria-label=\"Point-cloud export format\" title=\"CSV: geographic coordinates. PLY: local metric XYZ with RGB. LAS: georeferenced WGS84 UTM for QGIS.\" value={format} onChange={event => onFormatChange(event.target.value === \"las\" ? \"las\" : event.target.value === \"ply\" ? \"ply\" : \"csv\")} style={cloudExportSelectStyle}><option value=\"csv\">CSV \u00b7 Lat/Lon</option><option value=\"ply\">PLY \u00b7 XYZ/RGB</option><option value=\"las\">LAS \u00b7 QGIS/UTM</option></select>\n            <button\n              type=\"button\" disabled={pointCloudExportLoading} aria-busy={!!pointCloudExportLoading}\n              onClick={() => onDownloadPointCloud?.(format)}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/routing/RouteControls.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/routing/RouteControls.tsx block 1",
              "before": "/** Render route drafting/progress/results and forward original callbacks; no requests or route calculation occur here. */\nexport const RouteControls: React.FC<RouteControlsProps> = props => {\n  const { runtimeRoutingEngine, isGeneratingRoute, onChangeRuntimeRoutingEngine, runtimeTravelMode, onChangeRuntimeTravelMode, travelModeAvailability, routeData, routePickMode, onSetRoutePickMode, routeStartPoint, routeEndPoint, onResetRoutePoints, routeSpareMinutes, onChangeSpareMinutes, onGenerateRoute, routeGenerationProgress, onDownloadRouteGPX } = props;\n  return (\n    <div style={routeControlsStyle}>\n      {/* Runtime Routing Engine */}\n      {runtimeRoutingEngine && (\n        <div\n          style={routeChoiceRowStyle}\n",
              "after": "/** Render route drafting/progress/results and forward original callbacks; no requests or route calculation occur here. */\nexport const RouteControls: React.FC<RouteControlsProps> = props => {\n  const { runtimeRoutingEngine, isGeneratingRoute, onChangeRuntimeRoutingEngine, runtimeTravelMode, onChangeRuntimeTravelMode, travelModeAvailability, routeData, routePickMode, onSetRoutePickMode, routeStartPoint, routeEndPoint, onResetRoutePoints, routeSpareMinutes, onChangeSpareMinutes, onGenerateRoute, routeGenerationProgress, onDownloadRouteGPX } = props;\n  return (\n    <div className=\"mly-route-controls\" style={routeControlsStyle}>\n      {/* Runtime Routing Engine */}\n      {runtimeRoutingEngine && (\n        <div\n          style={routeChoiceRowStyle}\n"
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
const prefix = 'infobox-wide-readability-v6-19-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.19 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'infobox-wide-readability-v6-19' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.19 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.19 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.19 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-infobox-wide-readability-v6-19.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Infobox readability v6.19 is already installed. No files changed.');
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
  const manifest = { installer: 'infobox-wide-readability-v6-19', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Infobox readability v6.19 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
