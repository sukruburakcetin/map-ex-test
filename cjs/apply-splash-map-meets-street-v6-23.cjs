#!/usr/bin/env node
'use strict';
/**
 * Map meets street intro v6.23. Compatible current v6 sources.
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
              "before": "/** @jsx jsx */\nimport { React, jsx } from \"jimu-core\";\nimport { SplashScreenProps } from \"./types\";\nimport { MAPILLARY_IMAGE } from \"../utils/mapillary-image-base64\";\nimport { getSplashOverlayStyle, splashAnimationCss, splashBackdropStyle, splashCardStyle, splashLogoStyle, splashEyebrowStyle, splashTitleStyle, splashTaglineStyle, splashStatusStyle } from '../styles/splashScreen';\n\n/** Existing route design with staggered heartbeat pulses; CSS only, reduced-motion safe. */\nexport const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {\n    const gradientId = React.useRef(`mly-intro-flow-${Math.random().toString(36).slice(2)}`).current;\n    React.useEffect(() => {\n        if (!showIntro || filtersLoaded || !onDismiss) return;\n        // Decorative intro must not block the map if optional filter preparation fails.\n        const timer = setTimeout(onDismiss, 8000);\n        return () => clearTimeout(timer);\n    }, [showIntro, filtersLoaded, onDismiss]);\n    if (!showIntro) return null;\n    return <div className=\"mly-intro\" style={getSplashOverlayStyle(filtersLoaded)}>\n      <style>{splashAnimationCss}</style>\n      <svg aria-hidden=\"true\" viewBox=\"0 0 600 400\" preserveAspectRatio=\"xMidYMid slice\" style={splashBackdropStyle}>\n        <defs><linearGradient id={gradientId} gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"400\" x2=\"600\" y2=\"0\"><stop offset=\"0\" stopColor=\"#52bd87\" stopOpacity=\"0\" /><stop offset=\"0.45\" stopColor=\"#87f2b4\" /><stop offset=\"0.65\" stopColor=\"#c8ffdd\" /><stop offset=\"1\" stopColor=\"#52bd87\" stopOpacity=\"0\" /></linearGradient></defs>\n        <g stroke=\"#7eb799\" strokeWidth=\"1\" fill=\"none\" opacity=\"0.17\"><path d=\"M0 80H600M0 170H600M0 280H600M100 0V400M230 0V400M390 0V400M510 0V400\" /><path d=\"M0 390L600 30\" /></g>\n        <path className=\"mly-intro-route\" opacity=\"0.17\" pathLength=\"1\" d=\"M40 280H230V170H390V80H550\" fill=\"none\" stroke=\"#6be4a0\" strokeWidth=\"3\" />\n        <g fill=\"none\" stroke={`url(#${gradientId})`} strokeWidth=\"2\">\n          {[\"M0 80H600\", \"M0 170H600\", \"M0 280H600\", \"M100 0V400\", \"M230 0V400\", \"M390 0V400\", \"M510 0V400\", \"M0 390L600 30\", \"M40 280H230V170H390V80H550\"].map((road, index) =>\n            <path key={road} className=\"mly-intro-flow\" pathLength=\"1\" d={road} style={{ animationDelay: `${-index * 260}ms`, animationPlayState: filtersLoaded ? \"paused\" : \"running\" }} />\n          )}\n        </g>\n      </svg>\n      <div className=\"mly-intro-card\" style={splashCardStyle}>\n        <img src={MAPILLARY_IMAGE} alt=\"\" width={42} height={42} style={splashLogoStyle} />\n        <div style={splashEyebrowStyle}>MAPILLARY</div>\n        <div style={splashTitleStyle}>Explorer</div>\n        <p style={splashTaglineStyle}>Explore imagery. Find coverage. Plan your next capture.</p>\n        <div role=\"status\" style={splashStatusStyle}>{filtersLoaded ? \"Ready to explore\" : \"Preparing imagery tools\u2026\"}</div>\n\n      </div>\n    </div>;\n};\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from \"jimu-core\";\nimport { SplashScreenProps } from \"./types\";\nimport { MAPILLARY_IMAGE } from \"../utils/mapillary-image-base64\";\nimport { getSplashOverlayStyle, splashAnimationCss } from '../styles/splashScreen';\n\n/** Quiet, responsive map-to-street introduction; optional preparation never blocks exploration. */\nexport const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {\n    React.useEffect(() => {\n        if (!showIntro || filtersLoaded || !onDismiss) return;\n        const timer = setTimeout(onDismiss, 8000);\n        return () => clearTimeout(timer);\n    }, [showIntro, filtersLoaded, onDismiss]);\n    if (!showIntro) return null;\n    return <div className=\"mly-intro\" style={getSplashOverlayStyle(filtersLoaded)}>\n      <style>{splashAnimationCss}</style>\n      <div className=\"mly-intro-layout\">\n        <div className=\"mly-intro-copy\">\n          <div className=\"mly-intro-brand\"><img src={MAPILLARY_IMAGE} alt=\"\" width={24} height={24}/><span>MAPILLARY / EXPLORER</span></div>\n          <h2>A different<br className=\"mly-intro-break\"/> view of the street.</h2>\n          <p>Follow the map. Step into imagery.<br/>Find your next place to capture.</p>\n          <div className=\"mly-intro-bottom\">\n            {onDismiss && <button type=\"button\" onClick={onDismiss}>Explore map <svg aria-hidden=\"true\" width=\"11\" height=\"11\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.4\"><path d=\"M2 10 10 2M3 2h7v7\"/></svg></button>}\n            <span className=\"mly-intro-status\" role=\"status\">{!filtersLoaded && <span className=\"mly-intro-loading\" aria-hidden=\"true\"/>}{filtersLoaded ? \"Ready to explore\" : \"Getting things ready\"}</span>\n          </div>\n        </div>\n        <div className=\"mly-intro-scene\" aria-hidden=\"true\">\n          <svg viewBox=\"0 0 300 300\" preserveAspectRatio=\"xMidYMid slice\">\n            <rect width=\"300\" height=\"300\" fill=\"#1d3d32\"/>\n            <path d=\"M0 0H152V300H0Z\" fill=\"#244b3c\"/>\n            <g fill=\"#305b46\"><path d=\"M0 0H52V60H0ZM67 0H136V60H67ZM0 78H52V141H0ZM67 78H136V141H67ZM0 158H52V224H0ZM67 158H136V224H67ZM0 242H52V300H0ZM67 242H136V300H67Z\"/></g>\n            <g fill=\"none\" stroke=\"#8da494\" strokeWidth=\"5\"><path d=\"M59 0V300M144 0V300M0 69H160M0 150H160M0 233H160\"/></g>\n            <path d=\"M26 270H59V150H144\" fill=\"none\" stroke=\"#8de0a7\" strokeWidth=\"3\" strokeLinecap=\"round\"/>\n            <circle cx=\"59\" cy=\"150\" r=\"7\" fill=\"#b9f1c8\" stroke=\"#244b3c\" strokeWidth=\"3\"/>\n            <path d=\"M153 0H300V300H153Z\" fill=\"#789689\"/>\n            <path d=\"M153 0H300V130L226 111 153 130Z\" fill=\"#acc3b2\"/>\n            <path d=\"M153 66L192 94V167L153 196Z\" fill=\"#3f6654\"/>\n            <path d=\"M153 82L180 101V155L153 174Z\" fill=\"#648673\"/>\n            <path d=\"M300 51L259 87V172L300 211Z\" fill=\"#375b4a\"/>\n            <path d=\"M300 73L270 96V153L300 181Z\" fill=\"#668776\"/>\n            <path d=\"M213 130H237L300 300H153Z\" fill=\"#314d42\"/>\n            <path d=\"M213 130L161 300M237 130L295 300\" fill=\"none\" stroke=\"#c1cabb\" strokeWidth=\"2\"/>\n            <path d=\"M225 146V158M225 173V195M225 220V260\" fill=\"none\" stroke=\"#d3d9bf\" strokeWidth=\"2\"/>\n            <path d=\"M144 0V300\" stroke=\"#b1d8bd\" strokeWidth=\"1\" opacity=\".5\"/>\n            <circle cx=\"144\" cy=\"150\" r=\"15\" fill=\"#c4eccd\"/>\n            <path d=\"M138 150H150M146 146L150 150 146 154\" fill=\"none\" stroke=\"#254b38\" strokeWidth=\"1.7\" strokeLinecap=\"round\" strokeLinejoin=\"round\"/>\n          </svg>\n          <span className=\"mly-intro-caption\">ON THE MAP <span>IN THE MOMENT</span></span>\n        </div>\n      </div>\n    </div>;\n};\n"
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
              "before": "/** Intro presentation and heartbeat CSS. Preserve reduced-motion rules and injection position. */\nexport function getSplashOverlayStyle(filtersLoaded: boolean) { return { position: \"absolute\", inset: 0, zIndex: 999999999, display: \"flex\", alignItems: \"center\", justifyContent: \"center\", overflow: \"hidden\", background: \"radial-gradient(ellipse at 50% 40%, #17352b, #0d1719 65%)\", opacity: filtersLoaded ? 0 : 1, pointerEvents: filtersLoaded ? \"none\" : \"auto\", transition: \"opacity 350ms ease\" } as const; }\n\nexport const splashAnimationCss = `\n        @keyframes mly-intro-route { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }\n        @keyframes mly-intro-enter { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }\n        .mly-intro-route { stroke-dasharray: 1; animation: mly-intro-route 900ms ease-out both; }\n        @keyframes mly-intro-flow { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }\n        @keyframes mly-intro-heartbeat { 0%, 100% { opacity: 0.35; } 18% { opacity: 0.85; } 27% { opacity: 0.45; } 36% { opacity: 0.95; } 60% { opacity: 0.35; } }\n        .mly-intro .mly-intro-flow { stroke-dasharray: 0.075 0.025 0.04 0.86; stroke-linecap: round; stroke-width: 2.5; animation: mly-intro-flow 2400ms linear infinite, mly-intro-heartbeat 2400ms ease-in-out infinite !important; }\n        @media (prefers-reduced-motion: reduce) { .mly-intro .mly-intro-flow { display: none; animation: none !important; } }\n        .mly-intro-card { animation: mly-intro-enter 300ms ease-out both; }\n        @media (prefers-reduced-motion: reduce) { .mly-intro-route, .mly-intro-card { animation: none; } .mly-intro { transition: none !important; } }\n      `;\n\nexport const splashBackdropStyle = { position: \"absolute\", inset: 0, width: \"100%\", height: \"100%\", pointerEvents: \"none\" } as const;\n\nexport const splashCardStyle = { position: \"relative\", padding: \"24px 20px\", textAlign: \"center\", maxWidth: 300, color: \"#ecf4ef\" } as const;\n\nexport const splashLogoStyle = { borderRadius: 11, boxShadow: \"0 4px 20px #0004\" } as const;\n\nexport const splashEyebrowStyle = { fontSize: 11, letterSpacing: \"0.12em\", color: \"#95d4b2\", marginTop: 14 } as const;\n\nexport const splashTitleStyle = { fontSize: 27, fontWeight: 600, letterSpacing: \"-0.02em\", marginTop: 2 } as const;\n\nexport const splashTaglineStyle = { fontSize: 12, color: \"#a8bdb4\", margin: \"8px 0 18px\" } as const;\n\nexport const splashStatusStyle = { fontSize: 11, color: \"#b4d9c5\" } as const;\n",
              "after": "/** A single entrance fade; only the preparation indicator loops. */\nexport function getSplashOverlayStyle(filtersLoaded: boolean) {\n  return { position: \"absolute\", inset: 0, zIndex: 999999999, display: \"grid\", placeItems: \"center\", overflow: \"hidden\",\n    containerType: \"size\", background: \"#10251f\", opacity: filtersLoaded ? 0 : 1,\n    pointerEvents: filtersLoaded ? \"none\" : \"auto\", transition: \"opacity 220ms ease\" } as const;\n}\nexport const splashAnimationCss = `\n@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }\n@keyframes mly-intro-loading { to { transform: rotate(360deg); } }\n.mly-intro-layout { display: grid; grid-template-columns: 1fr 1fr; width: min(620px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #8cb79a30; border-radius: 14px; background: #172f26; color: #e6efe5; font-family: \"Segoe UI\",sans-serif; animation: mly-intro-enter 180ms ease-out both; }\n.mly-intro-copy { display: flex; flex-direction: column; justify-content: center; padding: 28px 22px; min-width: 0; }\n.mly-intro-brand { display: flex; align-items: center; gap: 8px; font-size: 9px; letter-spacing: .09em; color: #a3c7af; }\n.mly-intro-brand img { border-radius: 6px; }\n.mly-intro-copy h2 { font-size: 30px; font-weight: 500; line-height: 1.12; letter-spacing: -.045em; margin: 25px 0 12px; color: #edf4e8; }\n.mly-intro-copy p { font-size: 12px; line-height: 1.6; margin: 0; color: #acc2b3; }\n.mly-intro-bottom { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 22px; }\n.mly-intro-bottom button { display: flex; align-items: center; gap: 18px; border: 1px solid #add5b766; border-radius: 6px; padding: 8px 12px; background: #bde5c7; color: #173829; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }\n.mly-intro-bottom button:hover { background: #d0efd5; }\n.mly-intro-bottom button:focus-visible { outline: 2px solid white; outline-offset: 3px; }\n.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #95b4a0; }\n.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #70948055; border-top-color: #a0d7af; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }\n.mly-intro-scene { position: relative; min-height: 280px; overflow: hidden; background: #244b3c; }\n.mly-intro-scene svg { display: block; width: 100%; height: 100%; position: absolute; inset: 0; }\n.mly-intro-caption { position: absolute; bottom: 10px; left: 12px; right: 12px; display: flex; justify-content: space-between; font-size: 7px; letter-spacing: .08em; color: #d3e5d6; }\n@container (max-width: 460px) {\n  .mly-intro-layout { grid-template-columns: 1fr; width: min(340px,94%); }\n  .mly-intro-scene { grid-row: 1; min-height: 100px; }\n  .mly-intro-scene svg { object-fit: cover; }\n  .mly-intro-copy { padding: 16px; }\n  .mly-intro-copy h2 { font-size: 24px; margin: 12px 0 8px; }\n  .mly-intro-break { display: none; }\n  .mly-intro-bottom { flex-direction: row; align-items: center; gap: 12px; margin-top: 14px; }\n  .mly-intro-bottom button { white-space: nowrap; }\n  .mly-intro-status { font-size: 9px; }\n}\n@container (max-height: 320px) {\n  .mly-intro-copy { padding: 12px 14px; }\n  .mly-intro-copy h2 { font-size: 21px; margin: 9px 0 6px; }\n  .mly-intro-copy p { font-size: 10px; line-height: 1.4; }\n  .mly-intro-bottom { margin-top: 10px; gap: 8px; }\n  .mly-intro-scene { min-height: 64px; }\n  .mly-intro-brand { font-size: 8px; }\n  .mly-intro-brand img { width: 18px; height: 18px; }\n  .mly-intro-caption { bottom: 5px; font-size: 6px; }\n  .mly-intro-bottom button { font-size: 10px; padding: 6px 8px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .mly-intro-layout, .mly-intro-loading { animation: none; }\n  .mly-intro { transition: none !important; }\n}\n`;\n"
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
const prefix = 'splash-map-meets-street-v6-23-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.23 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'splash-map-meets-street-v6-23' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.23 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.23 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.23 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-splash-map-meets-street-v6-23.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Map meets street intro v6.23 is already installed. No files changed.');
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
  const manifest = { installer: 'splash-map-meets-street-v6-23', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Map meets street intro v6.23 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
