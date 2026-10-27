#!/usr/bin/env node
'use strict';
/**
 * Viewfinder intro v6.25. Compatible current v6 sources.
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
              "before": "import { SplashScreenProps } from \"./types\";\nimport { MAPILLARY_IMAGE } from \"../utils/mapillary-image-base64\";\nimport { getSplashOverlayStyle, splashAnimationCss } from '../styles/splashScreen';\n\n/** A quiet field-notebook introduction; optional preparation never blocks exploration. */\nexport const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {\n    React.useEffect(() => {\n        if (!showIntro || filtersLoaded || !onDismiss) return;\n        const timer = setTimeout(onDismiss, 8000);\n        return () => clearTimeout(timer);\n",
              "after": "import { SplashScreenProps } from \"./types\";\nimport { MAPILLARY_IMAGE } from \"../utils/mapillary-image-base64\";\nimport { getSplashOverlayStyle, splashAnimationCss } from '../styles/splashScreen';\n\n/** Static panoramic viewfinder; preparation and dismissal stay independent of the artwork. */\nexport const SplashScreen: React.FC<SplashScreenProps> = ({ showIntro, filtersLoaded, onDismiss }) => {\n    const sceneId = React.useId().replace(/:/g, '');\n    React.useEffect(() => {\n        if (!showIntro || filtersLoaded || !onDismiss) return;\n        const timer = setTimeout(onDismiss, 8000);\n        return () => clearTimeout(timer);\n"
            },
            {
              "label": "src/components/SplashScreen.tsx block 2",
              "before": "    if (!showIntro) return null;\n    return <div className=\"mly-intro\" style={getSplashOverlayStyle(filtersLoaded)}>\n      <style>{splashAnimationCss}</style>\n      <div className=\"mly-intro-layout\">\n        <div className=\"mly-intro-copy\">\n          <div className=\"mly-intro-brand\"><img src={MAPILLARY_IMAGE} alt=\"\" width={24} height={24}/><span>Mapillary Explorer</span></div>\n          <h2>Every street<br className=\"mly-intro-break\"/> has a story.</h2>\n          <p>Take a closer look at the places around you.<br/>Find imagery. Trace a route. See what\u2019s next.</p>\n          <div className=\"mly-intro-bottom\">\n            {onDismiss && <button type=\"button\" onClick={onDismiss}>Start exploring <svg aria-hidden=\"true\" width=\"11\" height=\"11\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.4\"><path d=\"M2 10 10 2M3 2h7v7\"/></svg></button>}\n            <span className=\"mly-intro-status\" role=\"status\">{!filtersLoaded && <span className=\"mly-intro-loading\" aria-hidden=\"true\"/>}{filtersLoaded ? \"Ready to explore\" : \"Preparing your tools\"}</span>\n          </div>\n        </div>\n        <div className=\"mly-intro-scene\" aria-hidden=\"true\">\n          <svg viewBox=\"0 0 480 112\" preserveAspectRatio=\"xMidYMid slice\">\n            <rect width=\"480\" height=\"112\" fill=\"#d9dfca\"/>\n            <g fill=\"#c5ceb5\"><path d=\"M0 0H60V41H0ZM76 0H155V41H76ZM171 0H259V41H171ZM275 0H350V41H275ZM366 0H480V41H366ZM0 57H60V112H0ZM76 57H155V112H76ZM171 57H259V112H171ZM275 57H350V112H275ZM366 57H480V112H366Z\"/></g>\n            <g stroke=\"#f4f2e6\" strokeWidth=\"4\" fill=\"none\"><path d=\"M68 0V112M163 0V112M267 0V112M358 0V112M0 49H480\"/></g>\n            <path d=\"M0 85H68V49H163V16H267V49H358V85H480\" fill=\"none\" stroke=\"#35624d\" strokeWidth=\"2.5\" strokeLinejoin=\"round\"/>\n            <circle cx=\"267\" cy=\"49\" r=\"10\" fill=\"#f4f2e6\"/>\n            <circle cx=\"267\" cy=\"49\" r=\"4\" fill=\"#35624d\"/>\n            <circle cx=\"68\" cy=\"85\" r=\"3\" fill=\"#35624d\"/>\n            <circle cx=\"358\" cy=\"85\" r=\"3\" fill=\"#35624d\"/>\n          </svg>\n          <span className=\"mly-intro-caption\">FIND A STREET <span>FOLLOW ITS STORY</span></span>\n        </div>\n      </div>\n    </div>;\n};\n",
              "after": "    if (!showIntro) return null;\n    return <div className=\"mly-intro\" style={getSplashOverlayStyle(filtersLoaded)}>\n      <style>{splashAnimationCss}</style>\n      <div className=\"mly-intro-layout\">\n        <div className=\"mly-intro-scene\">\n          <svg aria-hidden=\"true\" viewBox=\"0 0 640 280\" preserveAspectRatio=\"xMidYMid slice\">\n            <defs><linearGradient id={`${sceneId}-sky`} x2=\"0\" y2=\"1\"><stop stopColor=\"#36565e\"/><stop offset=\"1\" stopColor=\"#93aaa1\"/></linearGradient></defs>\n            <rect width=\"640\" height=\"280\" fill={`url(#${sceneId}-sky)`}/>\n            <circle cx=\"414\" cy=\"83\" r=\"24\" fill=\"#d7d5b0\" opacity=\".7\"/>\n            <path d=\"M0 137 95 121 139 135 219 109 285 125 332 111 419 129 514 104 640 135V280H0Z\" fill=\"#607f77\"/>\n            <path d=\"M0 74 94 93V225L0 280Z\" fill=\"#203f3f\"/>\n            <path d=\"M96 100 169 118V203L96 242Z\" fill=\"#315553\"/>\n            <path d=\"M172 121 239 133V183L172 215Z\" fill=\"#456a60\"/>\n            <path d=\"M640 60 548 96V229L640 280Z\" fill=\"#214744\"/>\n            <path d=\"M545 106 477 124V202L545 241Z\" fill=\"#365b50\"/>\n            <path d=\"M475 128 415 138V184L475 215Z\" fill=\"#4f7362\"/>\n            <g fill=\"#abc2a3\" opacity=\".35\"><path d=\"M19 109 37 112V144L19 144ZM54 116 73 120V144H54ZM112 129 127 132V155H112ZM143 136 156 139V155H143ZM564 116 584 110V144H564ZM605 101 625 95V144H605ZM489 143 503 139V158H489ZM517 135 532 131V158H517Z\"/></g>\n            <path d=\"M304 146H349L523 280H124Z\" fill=\"#293f40\"/>\n            <path d=\"M304 146 147 280M349 146 500 280\" fill=\"none\" stroke=\"#9eb5a2\" strokeWidth=\"2\"/>\n            <path d=\"M326 153V163M326 178V196M326 220V259\" fill=\"none\" stroke=\"#d4d4ad\" strokeWidth=\"2\"/>\n            <g stroke=\"#294b45\" strokeWidth=\"2\"><path d=\"M265 150V100M390 150V106\"/><path d=\"M265 100H278M390 106H380\"/></g>\n            <g fill=\"#a3baa5\"><ellipse cx=\"280\" cy=\"100\" rx=\"5\" ry=\"2\"/><ellipse cx=\"378\" cy=\"106\" rx=\"4\" ry=\"2\"/></g>\n            <path d=\"M0 266H640V280H0Z\" fill=\"#203b35\" opacity=\".35\"/>\n          </svg>\n          <div className=\"mly-intro-brand\"><img src={MAPILLARY_IMAGE} alt=\"\" width={22} height={22}/><span>Mapillary Explorer</span></div>\n          <div className=\"mly-viewfinder-frame\" aria-hidden=\"true\"><i/><i/><i/><i/></div>\n          <span className=\"mly-intro-caption\" aria-hidden=\"true\">A wider world. One street at a time.</span>\n        </div>\n        <div className=\"mly-intro-copy\">\n          <div className=\"mly-intro-heading\"><h2>Find your point of view.</h2><p>Street imagery, connected by the map.</p></div>\n          <div className=\"mly-intro-bottom\">\n            {onDismiss && <button type=\"button\" onClick={onDismiss} disabled={filtersLoaded}>Start exploring <svg aria-hidden=\"true\" width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.4\"><path d=\"M2 6h8M6 2l4 4-4 4\"/></svg></button>}\n            <span className=\"mly-intro-status\" role=\"status\">{!filtersLoaded && <span className=\"mly-intro-loading\" aria-hidden=\"true\"/>}{filtersLoaded ? \"Ready to explore\" : \"Preparing your tools\"}</span>\n          </div>\n        </div>\n      </div>\n    </div>;\n};\n"
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
              "before": "/** Field-notebook layout: quiet paper, ink and a static map clipping. */\nexport function getSplashOverlayStyle(filtersLoaded: boolean) {\n  return { position: \"absolute\", inset: 0, zIndex: 999999999, display: \"grid\", placeItems: \"center\", overflow: \"hidden\",\n    containerType: \"size\", background: \"#152a22\", opacity: filtersLoaded ? 0 : 1,\n    pointerEvents: filtersLoaded ? \"none\" : \"auto\", transition: \"opacity 220ms ease\" } as const;\n}\nexport const splashAnimationCss = `\n@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }\n@keyframes mly-intro-loading { to { transform: rotate(360deg); } }\n.mly-intro-layout { display: flex; flex-direction: column; width: min(480px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #cbd3bb; border-radius: 3px 14px 14px 3px; background: #f0eee1; color: #243d2e; font-family: \"Segoe UI\",sans-serif; box-shadow: -5px 0 0 #8ba183,0 14px 35px #0002; animation: mly-intro-enter 180ms ease-out both; }\n.mly-intro-copy { padding: 24px 26px 20px; min-width: 0; border-bottom: 1px solid #a4b09566; }\n.mly-intro-brand { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #536c55; }\n.mly-intro-brand img { width: 20px; height: 20px; border-radius: 5px; }\n.mly-intro-copy h2 { font-family: Georgia,\"Times New Roman\",serif; font-size: 39px; font-weight: 400; line-height: 1.02; letter-spacing: -.045em; margin: 19px 0 12px; color: #24412e; }\n.mly-intro-copy p { font-size: 12px; line-height: 1.6; margin: 0; color: #66745e; }\n.mly-intro-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 20px; }\n.mly-intro-bottom button { display: flex; align-items: center; justify-content: space-between; gap: 20px; border: 1px solid #2a4d37; border-radius: 4px; padding: 9px 12px; background: #2a4d37; color: #f2f2e5; font: inherit; font-size: 12px; cursor: pointer; }\n.mly-intro-bottom button:hover { background: #3c6147; }\n.mly-intro-bottom button:focus-visible { outline: 2px solid #43654b; outline-offset: 3px; }\n.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #6c7c63; }\n.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #9ead8a55; border-top-color: #3f684b; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }\n.mly-intro-scene { position: relative; height: 105px; flex-shrink: 0; overflow: hidden; background: #d9dfca; }\n.mly-intro-scene svg { display: block; width: 100%; height: 100%; }\n.mly-intro-caption { position: absolute; bottom: 8px; left: 12px; right: 12px; display: flex; justify-content: space-between; font-size: 6px; letter-spacing: .09em; color: #36583f; }\n@container (max-width: 460px) {\n  .mly-intro-layout { width: min(340px,93%); }\n  .mly-intro-copy { padding: 20px; }\n  .mly-intro-copy h2 { font-size: 32px; }\n  .mly-intro-scene { height: 80px; }\n  .mly-intro-bottom { gap: 10px; }\n  .mly-intro-status { font-size: 9px; }\n}\n@container (max-height: 320px) {\n  .mly-intro-copy { padding: 12px 16px; }\n  .mly-intro-copy h2 { font-size: 25px; margin: 9px 0 6px; }\n  .mly-intro-break { display: none; }\n  .mly-intro-copy p { font-size: 10px; line-height: 1.4; }\n  .mly-intro-bottom { margin-top: 10px; gap: 8px; }\n  .mly-intro-scene { height: 48px; }\n  .mly-intro-brand { font-size: 9px; }\n  .mly-intro-brand img { width: 16px; height: 16px; }\n  .mly-intro-caption { bottom: 4px; font-size: 5px; }\n  .mly-intro-bottom button { font-size: 10px; padding: 6px 8px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .mly-intro-layout, .mly-intro-loading { animation: none; }\n  .mly-intro { transition: none !important; }\n",
              "after": "/** Quiet panoramic viewfinder: static artwork, one entrance fade and preparation spinner. */\nexport function getSplashOverlayStyle(filtersLoaded: boolean) {\n  return { position: \"absolute\", inset: 0, zIndex: 999999999, display: \"grid\", placeItems: \"center\", overflow: \"hidden\",\n    containerType: \"size\", background: \"#11221f\", opacity: filtersLoaded ? 0 : 1,\n    pointerEvents: filtersLoaded ? \"none\" : \"auto\", transition: \"opacity 220ms ease\" } as const;\n}\nexport const splashAnimationCss = `\n@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }\n@keyframes mly-intro-loading { to { transform: rotate(360deg); } }\n.mly-intro-layout { width: min(640px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #b0cabe2b; border-radius: 12px; background: #182e29; color: #e8efe6; font-family: \"Segoe UI\",sans-serif; box-shadow: 0 16px 40px #0003; animation: mly-intro-enter 180ms ease-out both; }\n.mly-intro-scene { position: relative; height: 240px; overflow: hidden; background: #36565e; }\n.mly-intro-scene > svg { display: block; width: 100%; height: 100%; }\n.mly-intro-brand { position: absolute; top: 16px; left: 20px; display: flex; align-items: center; gap: 7px; font-size: 11px; color: #e5eee4; text-shadow: 0 1px 4px #15342f; }\n.mly-intro-brand img { border-radius: 5px; }\n.mly-viewfinder-frame { position: absolute; inset: 58px 20px 35px; pointer-events: none; }\n.mly-viewfinder-frame i { position: absolute; width: 13px; height: 13px; border: 1px solid #d4e6d380; }\n.mly-viewfinder-frame i:nth-child(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }\n.mly-viewfinder-frame i:nth-child(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }\n.mly-viewfinder-frame i:nth-child(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }\n.mly-viewfinder-frame i:nth-child(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }\n.mly-intro-caption { position: absolute; bottom: 12px; left: 20px; font-size: 9px; color: #c1d4c5; }\n.mly-intro-copy { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 23px 22px; }\n.mly-intro-heading { min-width: 0; }\n.mly-intro-copy h2 { font-size: 27px; font-weight: 450; line-height: 1.12; letter-spacing: -.04em; margin: 0 0 8px; color: #eff4e9; }\n.mly-intro-copy p { font-size: 11px; line-height: 1.5; margin: 0; color: #9eb8aa; }\n.mly-intro-bottom { display: flex; flex-direction: column; align-items: flex-start; gap: 9px; flex-shrink: 0; }\n.mly-intro-bottom button { display: flex; align-items: center; justify-content: space-between; gap: 18px; border: 1px solid #b3ddbc; border-radius: 6px; padding: 9px 11px; background: #b3ddbc; color: #183e2a; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }\n.mly-intro-bottom button:enabled:hover { background: #c9e9cf; }\n.mly-intro-bottom button:focus-visible { outline: 2px solid #e1ffe8; outline-offset: 3px; }\n.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 9px; color: #91af9c; }\n.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #9ead8a55; border-top-color: #a3d7af; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }\n@container (max-width: 460px) {\n  .mly-intro-layout { width: min(360px,94%); }\n  .mly-intro-scene { height: 180px; }\n  .mly-intro-copy { flex-direction: column; align-items: stretch; padding: 18px; gap: 15px; }\n  .mly-intro-copy h2 { font-size: 25px; }\n  .mly-intro-bottom { flex-direction: row; align-items: center; justify-content: space-between; gap: 8px; }\n  .mly-intro-bottom button { gap: 10px; }\n}\n@container (max-height: 320px) {\n  .mly-intro-scene { height: 92px; }\n  .mly-intro-brand { top: 9px; left: 14px; font-size: 9px; }\n  .mly-intro-brand img { width: 16px; height: 16px; }\n  .mly-viewfinder-frame { inset: 33px 14px 22px; }\n  .mly-viewfinder-frame i { width: 8px; height: 8px; }\n  .mly-intro-caption { bottom: 6px; left: 14px; font-size: 7px; }\n  .mly-intro-copy { padding: 12px 14px; gap: 11px; }\n  .mly-intro-copy h2 { font-size: 21px; margin-bottom: 4px; }\n  .mly-intro-copy p { font-size: 10px; }\n  .mly-intro-bottom button { padding: 7px 9px; font-size: 10px; }\n  .mly-intro-status { font-size: 8px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .mly-intro-layout, .mly-intro-loading { animation: none; }\n  .mly-intro { transition: none !important; }\n"
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
const prefix = 'splash-viewfinder-v6-25-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.25 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'splash-viewfinder-v6-25' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.25 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.25 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.25 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-splash-viewfinder-v6-25.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Viewfinder intro v6.25 is already installed. No files changed.');
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
  const manifest = { installer: 'splash-viewfinder-v6-25', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Viewfinder intro v6.25 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
