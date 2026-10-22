#!/usr/bin/env node
"use strict";
/** Plain-text native coverage center measurement installer.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const skipTests = args.includes("--skip-tests") || args.includes("--skip-test");
const uninstall = args.includes("--uninstall");
const payload = {
  entries: [
    {
      file: "src/features/coverage/NativeCoverageAlignmentDiagnostic.ts",
      blocks: [
        {
          label: "Import native center measurement",
          before: `/** Temporary, opt-in coverage alignment inspection. It never fetches tile or image data.`,
          after: `import { measureNativeCircle } from './nativeCircleMeasurement';

/** Temporary, opt-in coverage alignment inspection. It never fetches tile or image data.`,
          declarations: ["import { measureNativeCircle }"],
        },
        {
          label: "Expose bounded numeric center measurement",
          before: `      radiusTest: () => { controls.forEach(value => value.radiusTest()); return 'Radius test armed. Hover one dot and keep the view still: native cyan 2s, radius 1/stroke 0 3s, radius 4/stroke 0 3s, then original cyan restored.'; },`,
          after: `      radiusTest: () => { controls.forEach(value => value.radiusTest()); return 'Radius test armed. Hover one dot and keep the view still: native cyan 2s, radius 1/stroke 0 3s, radius 4/stroke 0 3s, then original cyan restored.'; },
      measureCenter: async () => {
        const candidates = Array.from(controls, ([widget, owner]) => ({ widget, owner, snapshot: owner.report() }))
          .filter(item => item.snapshot.hover?.imageId && item.snapshot.hover.viewType === '2d')
          .sort((a, b) => Date.parse(b.snapshot.hover.timestamp || '') - Date.parse(a.snapshot.hover.timestamp || ''));
        const item = candidates[0];
        if (!item) return { status: 'unavailable', reason: 'Use 2D and hover an image point once before measuring.' };
        try {
          await item.owner.disable();
          if (item.owner.report().cleanupPending) return { widget: item.widget, status: 'cleanup-pending' };
          return { widget: item.widget, ...await measureNativeCircle(item.owner.host, item.snapshot.hover, alignmentStyle) };
        } catch (error) {
          return { widget: item.widget, status: 'unavailable', errorName: String((error as any)?.name || 'Error') };
        }
      },`,
          declarations: ["measureCenter: async () =>"],
        },
      ],
      absentAfterUninstall: ["measureNativeCircle", "measureCenter:"],
      requiredOccurrences: [
        { text: "measureNativeCircle", count: 2 },
        { text: "measureCenter:", count: 1 },
      ],
    },
  ],
  modules: [
    {
      file: "src/features/coverage/nativeCircleMeasurement.ts",
      content: `/** Temporary numeric-only measurement of an exact-ID native circle. No tiles are fetched. */
type Json = Record<string, any>;
type Pixel = { x: number; y: number };
export interface NativeCircleMeasurementHost {
  read(): { view: any; layer: any; revision: number; [key: string]: any } | null;
  project(context: any, lon: number, lat: number): Pixel | null;
}
const bases = ['turbo-images', 'turbo-images-good', 'turbo-images-fair', 'turbo-images-poor', 'turbo-images-unscored'];
type OwnedStyle = { layer: any; id: string };
type Slot = { owned: OwnedStyle[]; running: boolean; waiting: boolean };
const busy = new WeakMap<NativeCircleMeasurementHost, Slot>();
let serial = 0;
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const finite = (value: any): value is number => typeof value === 'number' && Number.isFinite(value);
const point = (value: any): value is Pixel => value && finite(value.x) && finite(value.y);
const minus = (a: Pixel, b: Pixel): Pixel => ({ x: a.x - b.x, y: a.y - b.y });
class MeasurementFailure extends Error { constructor(readonly code: string) { super(code); } }
const fail = (code: string): never => { throw new MeasurementFailure(code); };

/** Pixel coordinates are screenshot sample centers, transformed by the SDK's actual output size. */
function locate(data: any, area: Json): Json {
  const width = data?.width, height = data?.height, rgba = data?.data;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      width * height > 1048576 || !rgba || rgba.length !== width * height * 4) fail('invalid-screenshot');
  const sx = width / area.width, sy = height / area.height;
  const mask = new Uint8Array(width * height), queue = new Uint32Array(width * height);
  let total = 0;
  for (let i = 0; i < mask.length; i++) {
    const k = i * 4;
    if (rgba[k] <= 32 && Math.abs(rgba[k + 1] - 229) <= 26 && rgba[k + 2] >= 229 && rgba[k + 3] >= 200) {
      mask[i] = 1; total++;
    }
  }
  if (!total) fail('native-circle-not-found');
  if (total > Math.ceil(256 * sx * sy)) fail('excess-cyan');
  const components: Json[] = [];
  for (let seed = 0; seed < mask.length; seed++) {
    if (!mask[seed]) continue;
    let head = 0, tail = 1, sumX = 0, sumY = 0, minX = width, minY = height, maxX = 0, maxY = 0;
    queue[0] = seed; mask[seed] = 0;
    while (head < tail) {
      const index = queue[head++], x = index % width, y = Math.floor(index / width);
      sumX += x + 0.5; sumY += y + 0.5;
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, next = ny * width + nx;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && mask[next]) { mask[next] = 0; queue[tail++] = next; }
      }
    }
    if (minX === 0 || minY === 0 || maxX === width - 1 || maxY === height - 1) fail('clipped-cyan');
    components.push({ count: tail, sumX, sumY, minX, minY, maxX, maxY });
  }
  if (components.length !== 1) fail(components.length ? 'ambiguous-cyan' : 'native-circle-not-found');
  const c = components[0];
  const centroid = { x: area.x + c.sumX / c.count / sx, y: area.y + c.sumY / c.count / sy };
  const bounds = { x: area.x + c.minX / sx, y: area.y + c.minY / sy,
    width: (c.maxX - c.minX + 1) / sx, height: (c.maxY - c.minY + 1) / sy };
  const centerDelta = { x: bounds.x + bounds.width / 2 - centroid.x, y: bounds.y + bounds.height / 2 - centroid.y };
  const fillFraction = c.count / ((c.maxX - c.minX + 1) * (c.maxY - c.minY + 1));
  if (bounds.width < 3 || bounds.height < 3 || bounds.width > 12 || bounds.height > 12 || bounds.width / bounds.height < 0.5 || bounds.width / bounds.height > 2 ||
      fillFraction < 0.4 || Math.abs(centerDelta.x) > 1 || Math.abs(centerDelta.y) > 1) fail('invalid-circle-shape');
  return { pixelCount: c.count, centroid, bounds,
    quality: { components: 1, areaCssPixels: c.count / sx / sy, fillFraction, boundsCenterMinusCentroid: centerDelta },
    readback: { width, height, scaleX: sx, scaleY: sy, area } };
}

/** The caller suspends its ordinary cyan diagnostic first. Only this helper's clones are edited.
 * A timed-out SDK screenshot is not cancellable: retain the host slot until it actually settles.
 */
export async function measureNativeCircle(host: NativeCircleMeasurementHost, hover: Json,
  makeStyle: (base: Json, imageId: string, uniqueStyleId: string) => Json): Promise<Json> {
  const previous = busy.get(host);
  if (previous && (previous.running || previous.waiting)) return { status: 'busy' };
  const owned = previous?.owned || [], slot: Slot = { owned, running: true, waiting: false };
  busy.set(host, slot);
  const pending: Promise<void>[] = [];
  let result: Json = { status: 'unavailable' }, context: ReturnType<NativeCircleMeasurementHost['read']>;
  let movementWatch: { remove(): void } | undefined, moved = false;
  let verify = () => {};
  const cleanup = async () => {
    for (const item of owned.slice().reverse()) {
      let deleted = !!item.layer.destroyed;
      try { if (!deleted) await item.layer.deleteStyleLayer(item.id); deleted = true; } catch (_) {}
      let present = !item.layer.destroyed;
      try { present = present && !!item.layer.getStyleLayer(item.id); } catch (_) { present = !deleted; }
      if (!present) owned.splice(owned.indexOf(item), 1);
      try { host.read(); verify(); } catch (error) {
        if (result.status === 'measured') result = { status: error instanceof MeasurementFailure ? error.code : 'sdk-failed' };
      }
    }
  };
  try {
    if (owned.length) { await cleanup(); if (owned.length) fail('cleanup-failed'); }
    context = host.read();
    if (!context?.view || !context.layer) fail('no-context');
    const { view, layer, revision } = context;
    if (view.type !== '2d') fail('unsupported-view');
    if (context.hybridVisible || context.hybridFallback) fail('hybrid-active');
    if (view.stationary !== true || view.destroyed || layer.destroyed || layer.visible === false) fail('view-not-ready');
    if (typeof view.takeScreenshot !== 'function' || typeof layer.getStyleLayer !== 'function' ||
        typeof layer.setStyleLayer !== 'function' || typeof layer.deleteStyleLayer !== 'function') fail('unsupported-sdk');
    if (typeof hover?.imageId !== 'string' || !hover.imageId) fail('missing-image-id');
    const matches: Json[] = Array.isArray(hover.cached?.matches) ? hover.cached.matches : [];
    const canonical = matches.filter(match => match.canonical === true);
    const candidates = canonical.length ? canonical : matches;
    if (candidates.length !== 1) fail('ambiguous-cached-match');
    const match = candidates[0], tile = match.tile, raw = match.raw, extent = match.extent;
    if (!Array.isArray(tile) || tile.length !== 3 || !tile.every(Number.isInteger) || tile[2] < 0 || tile[2] > 24 ||
        !finite(extent) || extent <= 0 || !point(raw)) fail('invalid-cached-match');
    const toLonLat = (x: number, y: number): [number, number] => {
      const n = 2 ** tile[2];
      return [(tile[0] + x / extent) / n * 360 - 180,
        Math.atan(Math.sinh(Math.PI * (1 - 2 * (tile[1] + y / extent) / n))) * 180 / Math.PI];
    };
    const project = (x: number, y: number): Pixel => {
      const [lon, lat] = toLonLat(x, y), projected = host.project(context!, lon, lat);
      if (!point(projected)) fail('projection-unavailable');
      return { x: projected.x, y: projected.y };
    };
    const origin = project(raw.x, raw.y), px = project(raw.x + 1, raw.y), py = project(raw.x, raw.y + 1);
    const xBasis = minus(px, origin), yBasis = minus(py, origin);
    const determinant = xBasis.x * yBasis.y - yBasis.x * xBasis.y;
    if (!finite(determinant) || Math.abs(determinant) < 1e-8 * Math.max(1, Math.hypot(xBasis.x, xBasis.y) * Math.hypot(yBasis.x, yBasis.y))) fail('singular-basis');
    const pose = { zoom: view.zoom, rotation: view.rotation, resolution: view.resolution, width: view.width, height: view.height, revision };
    if (![pose.width, pose.height].every(value => finite(value) && value > 0)) fail('invalid-view-size');
    verify = () => {
      const fresh = host.read();
      if (!fresh || fresh.view !== view || fresh.layer !== layer || fresh.revision !== revision || view.destroyed || layer.destroyed) fail('stale-context');
      if (fresh.hybridVisible || fresh.hybridFallback) fail('hybrid-active');
      if (moved || view.stationary !== true) fail('view-moved');
      for (const key of ['zoom', 'rotation', 'resolution', 'width', 'height'] as const) if (view[key] !== pose[key]) fail('view-moved');
      const now = [project(raw.x, raw.y), project(raw.x + 1, raw.y), project(raw.x, raw.y + 1)];
      if (now.some((p, i) => Math.hypot(p.x - [origin, px, py][i].x, p.y - [origin, px, py][i].y) > 0.05)) fail('view-moved');
    };
    verify();
    if (typeof view.watch === 'function') movementWatch = view.watch('stationary', (still: boolean) => { if (!still) moved = true; });
    const active: Json[] = [];
    for (const id of bases) {
      let base: Json | undefined;
      try { base = layer.getStyleLayer(id); } catch (_) { /* Absent quality-band styles are normal. */ }
      if (base?.type === 'circle' && base['source-layer'] === 'image' && base.layout?.visibility !== 'none' &&
          !(finite(base.minzoom) && view.zoom < base.minzoom) && !(finite(base.maxzoom) && view.zoom >= base.maxzoom)) active.push(copy(base));
    }
    if (!active.length) fail('no-active-native-circle');
    const instance = ++serial;
    for (let index = 0; index < active.length; index++) {
      verify();
      const id = \`mly-center-\${instance}-\${index}\`;
      let existing: any;
      try { existing = layer.getStyleLayer(id); } catch (_) {}
      if (existing) fail('style-id-collision');
      const style = copy(makeStyle(active[index], hover.imageId, id));
      style.id = id;
      style.paint = { ...style.paint, 'circle-radius': 4, 'circle-opacity': 1, 'circle-stroke-width': 0 };
      owned.push({ layer, id }); // The SDK may apply a style before rejecting its promise.
      await layer.setStyleLayer(style);
      verify();
    }
    await new Promise(resolve => setTimeout(resolve, 180));
    verify();
    const left = Math.max(0, Math.floor(origin.x - 64)), top = Math.max(0, Math.floor(origin.y - 64));
    const area = { x: left, y: top, width: Math.min(view.width, Math.ceil(origin.x + 64)) - left,
      height: Math.min(view.height, Math.ceil(origin.y + 64)) - top };
    if (area.width < 1 || area.height < 1) fail('projection-outside-view');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const request = Promise.resolve().then(() => view.takeScreenshot({ format: 'png', area }));
    pending.push(request.then(() => {}, () => {}));
    let screenshot: any;
    try {
      screenshot = await Promise.race([request, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new MeasurementFailure('screenshot-timeout')), 2500);
      })]);
      verify();
    } finally { if (timer !== undefined) clearTimeout(timer); }
    const measured = locate(screenshot?.data, area);
    verify();
    const deltaPixels = minus(measured.centroid, origin);
    const deltaTileUnits = { x: (deltaPixels.x * yBasis.y - yBasis.x * deltaPixels.y) / determinant,
      y: (xBasis.x * deltaPixels.y - deltaPixels.x * xBasis.y) / determinant };
    result = { status: 'measured', ...measured, projected: origin, basis: { x: xBasis, y: yBasis, determinant },
      deltaPixels, deltaTileUnits, pose: Object.fromEntries(Object.entries(pose).filter(([, value]) => finite(value))),
      tile: tile.slice(), raw: { x: raw.x, y: raw.y }, extent, stylesAdded: owned.length };
  } catch (error) {
    result = { status: error instanceof MeasurementFailure ? error.code : 'sdk-failed' };
  } finally {
    await cleanup();
    try { movementWatch?.remove(); } catch (_) {}
    if (owned.length) result = { status: 'cleanup-failed', cleanupPending: owned.length };
    slot.running = false;
    // Do not retain ImageData in the slot; the settled promises carry no payload.
    if (pending.length) {
      slot.waiting = true;
      void Promise.all(pending).then(() => { slot.waiting = false; if (!owned.length && busy.get(host) === slot) busy.delete(host); });
    } else if (!owned.length && busy.get(host) === slot) busy.delete(host);
  }
  return result;
}
`,
    },
  ],
};

const root = fs.realpathSync(process.cwd());
const normalize = (value) =>
  String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = "native-coverage-center-";

function conflict(label) {
  throw new Error("Conflict in " + label + ". No source files changed. Preserve local edits.");
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== "string" || !relative || relative.includes("\\") || relative.includes(":") || relative.includes("\0")) throw new Error("Invalid patch path.");
  const parts = relative.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) throw new Error("Invalid patch path.");
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith(".." + path.sep) || path.isAbsolute(relation)) throw new Error("Patch path escapes the widget folder.");
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try {
      stat = fs.lstatSync(parent);
    } catch (error) {
      if (error.code === "ENOENT") break;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error("Symbolic links are not supported: " + relative + ". No source files changed.");
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error("Parent path is not a folder: " + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error("Unsupported target type: " + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error("Target is not a regular file: " + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    if (required) throw new Error("Required file missing: " + relative + ". No source files changed.");
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString("utf8");
  const bom = raw.startsWith("\uFEFF") ? "\uFEFF" : "";
  return Buffer.from(bom + (raw.includes("\r\n") ? text.replace(/\n/g, "\r\n") : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before),
    after = normalize(block.after);
  if (!before || !after || before === after) throw new Error("Invalid block: " + block.label);
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
      if (block.declarations && block.declarations.some((name) => text.includes(name))) conflict(block.label + " (partially edited diagnostic)");
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some((name) => text.includes(name))) conflict(block.label + " (existing declaration)");
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split("/");
  segments.pop();
  let current = "";
  for (const segment of segments) {
    current = current ? current + "/" + segment : segment;
    const directory = targetFor(current);
    try {
      fs.mkdirSync(directory);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Unsafe parent directory: " + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error("File changed during validation: " + item.relative + ". No source files changed.");
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error("File write made no progress.");
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
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original))
      throw new Error("File changed before write: " + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
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
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error("Created file replaced by another process.");
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, "wx", item.mode & 0o777);
        try {
          fs.writeFileSync(descriptor, item.original);
        } finally {
          fs.closeSync(descriptor);
        }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try {
          fs.ftruncateSync(descriptor, 0);
          writeExact(descriptor, item.original);
        } finally {
          fs.closeSync(descriptor);
        }
      }
    } catch (error) {
      errors.push(item.relative + ": " + error.message);
    }
  }
  return errors;
}

try {
  const allowed = ["--dry-run", "--skip-tests", "--skip-test", "--uninstall"];
  if (args.some((arg) => !allowed.includes(arg))) throw new Error("Usage: node apply-native-coverage-center-measurement.cjs [--dry-run] [--skip-tests] [--uninstall]");
  readTarget("src/runtime/widget.tsx", true);
  const writes = [],
    seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error("Duplicate patch path: " + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString("utf8"));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some((marker) => text.includes(marker))) {
      conflict(entry.file + " (edited diagnostic references remain)");
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some((rule) => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + " (diagnostic references differ)");
    }
    if (text !== normalize(current.bytes.toString("utf8"))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error("Duplicate patch path: " + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString("utf8")) !== normalize(module.content)) conflict(module.file + " (existing module)");
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log("Existing test files are preserved. This installer does not run tests.");
  if (!writes.length) {
    console.log(uninstall ? "Center measurement is already uninstalled. No files changed." : "Center measurement is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log(
      "Dry run passed. Would " +
        (uninstall ? "uninstall" : "install") +
        ":\n" +
        writes.map((item) => "  " + (item.content === null ? "remove " : item.original === null ? "create " : "update ") + item.relative).join("\n"),
    );
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
  const backupRelative = ".refactor-backups/" + prefix + (uninstall ? "uninstall-" : "") + Date.now() + "-" + process.pid;
  ensureParents(backupRelative + "/changes.json");
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + "/" + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), "wx");
    try {
      fs.writeFileSync(descriptor, item.original);
    } finally {
      fs.closeSync(descriptor);
    }
  }
  const manifest = writes.map((item) => ({
    file: item.relative,
    operation: item.content === null ? "remove" : item.original === null ? "create" : "update",
    originalSha256: item.original === null ? null : digest(item.original),
    resultSha256: item.content === null ? null : digest(item.content),
  }));
  fs.writeFileSync(path.join(backup, "changes.json"), JSON.stringify({ installer: "native-coverage-center-measurement", uninstall, changes: manifest }, null, 2) + "\n", {
    flag: "wx",
  });
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
        const descriptor = fs.openSync(targetFor(item.relative), "wx");
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev;
        item.createdIno = stat.ino;
        item.started = true;
        try {
          fs.writeFileSync(descriptor, item.content);
        } finally {
          fs.closeSync(descriptor);
        }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + "\nRollback needs attention; original bytes are in " + backupRelative + ":\n" + errors.join("\n"));
    throw new Error(error.message + "\nInstaller writes rolled back. Original source files restored. Backup: " + backupRelative);
  }
  console.log("Native coverage center measurement " + (uninstall ? "uninstalled" : "installed") + ".");
  console.log("Backup: " + backupRelative);
  console.log("Rebuild/reload Experience Builder before testing. Run the supplied console measurement command in a 2D preview.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
