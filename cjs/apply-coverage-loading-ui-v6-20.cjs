#!/usr/bin/env node
'use strict';
/**
 * Coverage loading UI v6.20. Compatible current v6 sources.
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
      "file": "src/features/coverage/CoverageAnalysisResults.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/coverage/CoverageAnalysisResults.tsx block 1",
              "before": "export const CoverageAnalysisResults: React.FC<CoverageAnalysisResultsProps> = props => {\n  const { coverageAnalysisLoading, coverageAnalysisProgress, onCancelCoverageAnalysis, coverageResult, coverageSegmentsVisible, onToggleCoverageSegments, onDismissCoverageResult, renderRoutingControls } = props;\n  return (\n<div\n              className=\"mly-coverage-results\"\n              style={coverageResultsPanelStyle}\n            >\n              {/* Header */}\n              <div\n                style={coverageResultsHeaderStyle}\n              >\n                <span>STREET COVERAGE</span>\n                <button\n                  onClick={onDismissCoverageResult}\n                  style={coverageResultsDismissStyle}\n                >\n                  \u00d7\n                </button>\n              </div>\n\n              {coverageAnalysisLoading && (\n                <>\n                  <style>{`\n      @keyframes mly-coverage-dot { 0%, 70%, 100% { opacity: .2; } 35% { opacity: 1; } }\n      .mly-coverage-loading-dots { display: inline-flex; width: 12px; justify-content: space-around; vertical-align: baseline; }\n      .mly-coverage-loading-dots > span { animation: mly-coverage-dot 1.2s ease-in-out infinite; }\n      .mly-coverage-loading-dots > span:nth-child(2) { animation-delay: .16s; }\n      .mly-coverage-loading-dots > span:nth-child(3) { animation-delay: .32s; }\n      @media (prefers-reduced-motion: reduce) { .mly-coverage-loading-dots > span { animation: none; opacity: .7; } }\n    `}</style>\n\n                  <div style={coverageResultsProgressStyle}>\n                    <span role=\"status\" aria-live=\"polite\">{(coverageAnalysisProgress || \"Analysing\").replace(/(?:\u2026|\\.{3})+\\s*$/, \"\")}<span className=\"mly-coverage-loading-dots\" aria-hidden=\"true\"><span>.</span><span>.</span><span>.</span></span></span>\n                  </div>\n                  <button onClick={onCancelCoverageAnalysis} style={coverageResultsCancelStyle}>Cancel</button>\n                </>\n              )}\n\n              {coverageResult &&\n",
              "after": "export const CoverageAnalysisResults: React.FC<CoverageAnalysisResultsProps> = props => {\n  const { coverageAnalysisLoading, coverageAnalysisProgress, onCancelCoverageAnalysis, coverageResult, coverageSegmentsVisible, onToggleCoverageSegments, onDismissCoverageResult, renderRoutingControls } = props;\n  return (\n<div\n              className={`mly-coverage-results${coverageAnalysisLoading ? \" is-loading\" : \"\"}`}\n              style={coverageResultsPanelStyle}\n            >\n              {/* Header */}\n              <div\n                style={coverageResultsHeaderStyle}\n              >\n                <span>{coverageAnalysisLoading ? \"Street coverage\" : \"STREET COVERAGE\"}</span>\n                {!coverageAnalysisLoading && <button type=\"button\" aria-label=\"Dismiss street coverage results\"\n                  onClick={onDismissCoverageResult}\n                  style={coverageResultsDismissStyle}\n                >\n                  \u00d7\n                </button>}\n              </div>\n\n              {coverageAnalysisLoading && (\n                <>\n                  <style>{`\n      @keyframes mly-coverage-scan { from { transform: translateX(-110%); } to { transform: translateX(330%); } }\n      .mly-coverage-results.is-loading { border-color: #78b49455 !important; background: linear-gradient(145deg,rgba(28,51,40,.9),rgba(14,28,22,.8)) !important; }\n      .mly-coverage-results.is-loading > div:first-child { border-bottom: 0 !important; min-height: 22px; margin: 0 !important; font-size: 9px; color: #e0eee5 !important; }\n      .mly-coverage-scan { height: 3px; border-radius: 3px; overflow: hidden; background: #a9d6b71c; margin: 3px 0 7px; }\n      .mly-coverage-scan > span { display: block; width: 32%; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#4daf7955,#9ae6b7,#4daf7955); animation: mly-coverage-scan 1.5s ease-in-out infinite; }\n      .mly-coverage-results.is-loading button:hover { background: #ffffff12 !important; }\n      @media (prefers-reduced-motion: reduce) { .mly-coverage-scan > span { animation: none; margin: 0 auto; } }\n    `}</style>\n\n                  <div style={coverageResultsProgressStyle} role=\"status\" aria-live=\"polite\" aria-atomic=\"true\">\n                    {(coverageAnalysisProgress || \"Analysing coverage\").replace(/(?:\u2026|\\.{3})+\\s*$/, \"\")}\n                  </div>\n                  <div className=\"mly-coverage-scan\" aria-hidden=\"true\"><span/></div>\n                  <button type=\"button\" onClick={onCancelCoverageAnalysis} style={coverageResultsCancelStyle}>Cancel</button>\n                </>\n              )}\n\n              {coverageResult &&\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/coverageAnalysis.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/coverageAnalysis.ts block 1",
              "before": "    marginBottom: \"3px\",\n    marginTop: \"1.5px\",\n};\nexport const coverageResultsDismissStyle: React.CSSProperties = { background: \"none\", border: \"none\", color: \"white\", cursor: \"pointer\", fontSize: \"10px\", margin: \"0\", padding: \"0\" };\nexport const coverageResultsProgressStyle: React.CSSProperties = { textAlign: \"center\", fontSize: \"8px\", color: \"#ccc\", padding: \"1px\" };\nexport const coverageResultsDotsStyle: React.CSSProperties = { display: \"inline-block\", width: \"12px\", textAlign: \"left\" };\nexport const coverageResultsCancelStyle: React.CSSProperties = { display: \"block\", margin: \"4px auto\", fontSize: \"10px\", padding: \"2px 6px\", background: \"transparent\", color: \"#ddd\", border: \"1px solid #68777a\", borderRadius: \"4px\", cursor: \"pointer\" };\nexport const coverageResultsTierRowStyle: React.CSSProperties = { marginBottom: \"3px\" };\nexport const coverageResultsTierLineStyle: React.CSSProperties = { display: \"flex\", justifyContent: \"space-between\", alignItems: \"center\", fontSize: \"7px\" };\nexport const coverageResultsTierLabelGroupStyle: React.CSSProperties = { display: \"flex\", alignItems: \"center\", gap: \"3px\" };\nexport const coverageResultsTierLabelStyle: React.CSSProperties = { color: \"rgba(255,255,255,0.9)\", fontWeight: 500 };\n",
              "after": "    marginBottom: \"3px\",\n    marginTop: \"1.5px\",\n};\nexport const coverageResultsDismissStyle: React.CSSProperties = { background: \"none\", border: \"none\", color: \"white\", cursor: \"pointer\", fontSize: \"10px\", margin: \"0\", padding: \"0\" };\nexport const coverageResultsProgressStyle: React.CSSProperties = { textAlign: \"left\", fontSize: \"8px\", lineHeight: 1.4, color: \"#b5ccbf\", padding: \"1px 0 3px\", overflowWrap: \"anywhere\" };\nexport const coverageResultsDotsStyle: React.CSSProperties = { display: \"inline-block\", width: \"12px\", textAlign: \"left\" };\nexport const coverageResultsCancelStyle: React.CSSProperties = { display: \"block\", width: \"100%\", boxSizing: \"border-box\", margin: \"0\", minHeight: 24, fontSize: \"9px\", padding: \"3px 6px\", background: \"rgba(255,255,255,0.04)\", color: \"#d7e6dd\", border: \"1px solid rgba(154,196,170,0.25)\", borderRadius: \"4px\", cursor: \"pointer\" };\nexport const coverageResultsTierRowStyle: React.CSSProperties = { marginBottom: \"3px\" };\nexport const coverageResultsTierLineStyle: React.CSSProperties = { display: \"flex\", justifyContent: \"space-between\", alignItems: \"center\", fontSize: \"7px\" };\nexport const coverageResultsTierLabelGroupStyle: React.CSSProperties = { display: \"flex\", alignItems: \"center\", gap: \"3px\" };\nexport const coverageResultsTierLabelStyle: React.CSSProperties = { color: \"rgba(255,255,255,0.9)\", fontWeight: 500 };\n"
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
const prefix = 'coverage-loading-ui-v6-20-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.20 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'coverage-loading-ui-v6-20' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.20 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.20 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.20 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-coverage-loading-ui-v6-20.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Coverage loading UI v6.20 is already installed. No files changed.');
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
  const manifest = { installer: 'coverage-loading-ui-v6-20', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Coverage loading UI v6.20 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
