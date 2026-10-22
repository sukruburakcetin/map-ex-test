#!/usr/bin/env node
"use strict";
/** Readable coverage selection anchor installer. No compressed payload.
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
      file: "src/runtime/widget.tsx",
      blocks: [
        {
          label: "Coverage selection target import",
          before: String.raw`import { SequenceHoverHighlight } from '../features/coverage/SequenceHoverHighlight';`,
          after: String.raw`import { SequenceHoverHighlight } from '../features/coverage/SequenceHoverHighlight';
import { CoverageSelectionTargets } from '../features/coverage/CoverageSelectionTargets';`,
          declarations: ["import { CoverageSelectionTargets }"],
        },
        {
          label: "Coverage selection target owner",
          before: String.raw`  private _currentHoveredFeatureId: string | null = null;`,
          after: String.raw`  private _currentHoveredFeatureId: string | null = null;
  private _coverageSelectionTargets = new CoverageSelectionTargets<__esri.Point>();`,
          declarations: ["private _coverageSelectionTargets"],
        },
        {
          label: "Coverage display context",
          before: String.raw`  /** Match selection visuals to the owned rendered point; API coordinates remain unchanged. */
  private getCoverageDisplayPosition`,
          after: String.raw`  /** Scope display anchors to the active coverage source and filter revision. */
  private coverageSelectionContext() {
    const view = this.state.jimuMapView?.view;
    const closeLayer = this._turboCloseView === view && this._turboCloseLayer &&
      view?.map?.layers.includes(this._turboCloseLayer) ? this._turboCloseLayer : null;
    return { view: view || this, layer: closeLayer || this.turboCoverageLayer,
      revision: this._turboRequestCount, enabled: !!view && this.state.turboModeActive,
      individual: !!view && view.zoom >= 14, stationary: !!view && view.stationary !== false };
  }

  /** Match selection visuals to the accepted tile point; API coordinates remain unchanged. */
  private getCoverageDisplayPosition`,
          declarations: ["private coverageSelectionContext()"],
        },
        {
          label: "Retain picked display coordinates during API redraws",
          before: String.raw`    return { lon, lat };
  }

  private getCoverageBarPresentation`,
          after: String.raw`    const selected = this._coverageSelectionTargets.anchor(this.coverageSelectionContext(), String(imageId));
    return selected ? { lon: selected.lon, lat: selected.lat, geometry: selected.geometry } : { lon, lat };
  }

  private getCoverageBarPresentation`,
        },
        {
          label: "Capture the individual hover identity",
          before: String.raw`    this.showTurboHover(graphic); // Visual feedback never waits for metadata or a tooltip.`,
          after: String.raw`    this.showTurboHover(graphic); // Visual feedback never waits for metadata or a tooltip.
    if (!attrs.turbo_representative) this._coverageSelectionTargets.hover(
      this.coverageSelectionContext(), imageId, graphic.geometry as __esri.Point, attrs.sequence_id);`,
        },
        {
          label: "Clear dismissed hover snapshots",
          before: String.raw`    if (this._turboHoverFrame != null) cancelAnimationFrame(this._turboHoverFrame);`,
          after: String.raw`    this._coverageSelectionTargets.clearHover();
    if (this._turboHoverFrame != null) cancelAnimationFrame(this._turboHoverFrame);`,
        },
        {
          label: "Release selection display anchors on unmount",
          before: String.raw`    this._sharedNotesDisposed = true;
    this.clearFieldNotesGroup();`,
          after: String.raw`    this._coverageSelectionTargets.clear();
    this._sharedNotesDisposed = true;
    this.clearFieldNotesGroup();`,
        },
        {
          label: "Snapshot individual image clicks before asynchronous work",
          before: String.raw`      // Snapshot the preview target before asynchronous hit tests or pointer movement can change it.
      const hoverPixel`,
          after: String.raw`      // Freeze the individual preview identity before hit tests or pointer movement.
      const coverageLayerAtClick = this.turboCoverageLayer;
      const coverageRevisionAtClick = this._turboRequestCount;
      const coverageClickCurrent = () => this.state.jimuMapView?.view === view && !view.destroyed &&
        this.state.turboModeActive && this.turboCoverageLayer === coverageLayerAtClick &&
        this._turboRequestCount === coverageRevisionAtClick;
      const hoveredPoint = this._coverageSelectionTargets.snapshot(this.coverageSelectionContext(), evt,
        TURBO_LIMITS.pickRadiusPx, geometry => view.toScreen(geometry));
      const pointPreviewAtClick = hoveredPoint ? new this.ArcGISModules.Graphic({
        geometry: hoveredPoint.geometry, attributes: { image_id: hoveredPoint.imageId,
          sequence_id: hoveredPoint.sequenceId || this._turboMetadataCache.get(hoveredPoint.imageId)?.sequence } }) : null;
      // Regional line previews keep their existing nearest-frame resolution.
      const hoverPixel`,
        },
        {
          label: "Prefer exact image preview before regional representative",
          before: String.raw`      const coveragePreviewAtClick = this.state.turboModeActive && view.zoom < 14 &&`,
          after: String.raw`      const coveragePreviewAtClick = pointPreviewAtClick || (this.state.turboModeActive && view.zoom < 14 &&`,
        },
        {
          label: "Close regional preview expression",
          before: String.raw`        : null;

      const point = (view.toMap(evt) || coveragePreviewAtClick?.geometry)`,
          after: String.raw`        : null);

      const point = (view.toMap(evt) || coveragePreviewAtClick?.geometry)`,
        },
        {
          label: "Prevent an active route from replacing the individual preview",
          before: String.raw`        // Active-sequence navigation takes precedence over a nearby coverage preview.
        // Exact blue points carry an image ID; lines use the already loaded coordinates.`,
          after: String.raw`        // A valid individual image preview owns this click. Otherwise blue route
        // navigation keeps its existing exact-point/nearest-loaded-frame behavior.
        if (pointPreviewAtClick && !coverageClickCurrent()) return;`,
        },
        {
          label: "Only use route hit when no individual preview owns the click",
          before: String.raw`        if (seqHit) {
          const attrs = (seqHit as any).graphic.attributes;`,
          after: String.raw`        if (seqHit && !pointPreviewAtClick) {
          const attrs = (seqHit as any).graphic.attributes;`,
        },
        {
          label: "Reject stale coverage context before using a click snapshot",
          before: String.raw`        if (this.state.turboModeActive) {
          this._turboHoverPickAbort?.abort();
          this._turboClickPickAbort?.abort();`,
          after: String.raw`        if (this.state.turboModeActive) {
          if (!coverageClickCurrent()) return;
          this._turboHoverPickAbort?.abort();
          this._turboClickPickAbort?.abort();`,
        },
        {
          label: "Anchor an individual selection to its picked point",
          before: String.raw`                  const anchor = this.getCoverageDisplayPosition(String(imageId), point.longitude, point.latitude);
                  this.drawClickRipple(anchor.lon, anchor.lat);`,
          after: String.raw`                  // Exact image targets keep their picked display position through
                  // metadata loading. Regional lines retain their geographic search point.
                  if (!attrs.turbo_representative && safeGraphic.geometry?.type === "point") {
                    this._coverageSelectionTargets.retain(this.coverageSelectionContext(), String(imageId),
                      safeGraphic.geometry as __esri.Point, String(seqId));
                  }
                  const anchor = this.getCoverageDisplayPosition(String(imageId), point.longitude, point.latitude);
                  this.drawClickRipple(anchor.lon, anchor.lat);`,
        },
      ],
      absentAfterUninstall: ["CoverageSelectionTargets", "_coverageSelectionTargets", "coverageSelectionContext", "pointPreviewAtClick", "coverageClickCurrent"],
      requiredOccurrences: [
        { text: "CoverageSelectionTargets", count: 3 },
        { text: "_coverageSelectionTargets", count: 7 },
        { text: "coverageSelectionContext", count: 5 },
        { text: "pointPreviewAtClick", count: 4 },
        { text: "coverageClickCurrent", count: 3 },
      ],
    },
  ],
  modules: [
    {
      file: "src/features/coverage/CoverageSelectionTargets.ts",
      content: String.raw`/** Identity and display positions for individual coverage-image interactions.
 * Display positions come from the picked tile point; geographic API data stays intact.
 * This owner performs no requests, map navigation, rendering or native hit testing.
 */
export interface CoverageSelectionContext {
  view: object;
  layer: object | null;
  revision: number;
  enabled: boolean;
  individual: boolean;
  stationary: boolean;
}
export interface CoverageSelectionPoint {
  longitude: number;
  latitude: number;
  clone?(): CoverageSelectionPoint;
}
export interface CoverageSelectionTarget<G> {
  imageId: string;
  sequenceId?: string;
  geometry: G;
  lon: number;
  lat: number;
}
type Pixel = { x: number; y: number };

/** Keep the accepted hover identity through asynchronous click handling and retain
 * a bounded set of display anchors through metadata/sequence redraws. A changed
 * view, layer or coverage revision invalidates both targets and anchors.
 */
export class CoverageSelectionTargets<G extends CoverageSelectionPoint> {
  private context: CoverageSelectionContext | null = null;
  private hovered: CoverageSelectionTarget<G> | null = null;
  private anchors = new Map<string, CoverageSelectionTarget<G>>();

  /** Record only a real individual image point, never a line's representative ID. */
  hover(context: CoverageSelectionContext, imageId: string, geometry: G, sequenceId?: string): void {
    if (!this.sync(context) || !context.individual || !context.stationary) { this.hovered = null; return; }
    this.hovered = this.target(imageId, geometry, sequenceId);
  }

  /** Snapshot before awaits. Reproject the point in the current view and accept it
   * only within the existing click radius; stale or distant previews never win.
   */
  snapshot(context: CoverageSelectionContext, pointer: Pixel, radius: number,
    project: (geometry: G) => Pixel | null | undefined): CoverageSelectionTarget<G> | null {
    if (!this.sync(context) || !context.individual || !context.stationary || !this.hovered ||
      !Number.isFinite(pointer.x) || !Number.isFinite(pointer.y) || !Number.isFinite(radius) || radius < 0) return null;
    let pixel: Pixel | null | undefined;
    try { pixel = project(this.hovered.geometry); } catch (_) { return null; }
    if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y) ||
      (pixel.x - pointer.x) ** 2 + (pixel.y - pointer.y) ** 2 > radius ** 2) return null;
    return this.target(this.hovered.imageId, this.hovered.geometry, this.hovered.sequenceId);
  }

  /** Remember a selected point independently of the hover card's lifetime. */
  retain(context: CoverageSelectionContext, imageId: string, geometry: G, sequenceId?: string): void {
    if (!this.sync(context) || !context.individual) return;
    const target = this.target(imageId, geometry, sequenceId);
    if (!target) return;
    this.anchors.delete(target.imageId);
    this.anchors.set(target.imageId, target);
    if (this.anchors.size > 64) this.anchors.delete(this.anchors.keys().next().value!);
  }

  /** Return presentation coordinates only; callers keep original API coordinates. */
  anchor(context: CoverageSelectionContext, imageId: string): CoverageSelectionTarget<G> | null {
    return this.sync(context) ? this.anchors.get(String(imageId)) || null : null;
  }

  /** Pointer leave dismisses the preview without moving an accepted selection. */
  clearHover(): void { this.hovered = null; }

  /** Release all view-owned references on teardown or a new coverage context. */
  clear(): void { this.context = null; this.hovered = null; this.anchors.clear(); }

  private sync(context: CoverageSelectionContext): boolean {
    if (!context.enabled || !context.layer) { this.clear(); return false; }
    if (this.context && (this.context.view !== context.view || this.context.layer !== context.layer ||
      this.context.revision !== context.revision)) this.clear();
    this.context = context;
    return true;
  }

  private target(imageId: string, geometry: G, sequenceId?: string): CoverageSelectionTarget<G> | null {
    if (!imageId || !geometry || !Number.isFinite(geometry.longitude) || !Number.isFinite(geometry.latitude)) return null;
    let copy: G;
    try { copy = geometry.clone ? geometry.clone() as G : { ...geometry }; } catch (_) { return null; }
    return { imageId: String(imageId), sequenceId, geometry: copy, lon: geometry.longitude, lat: geometry.latitude };
  }
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
const prefix = "coverage-selection-anchor-";

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
      if (block.declarations && block.declarations.some((name) => text.includes(name))) conflict(block.label + " (partially edited selection fix)");
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
  if (args.some((arg) => !allowed.includes(arg))) throw new Error("Usage: node apply-coverage-selection-anchor-fix-v2.cjs [--dry-run] [--skip-tests] [--uninstall]");
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
      conflict(entry.file + " (edited selection fix references remain)");
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some((rule) => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + " (selection fix references differ)");
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
  console.log("This installer changes only two source files; test files are preserved.");
  if (!writes.length) {
    console.log(uninstall ? "Selection fix is already uninstalled. No files changed." : "Selection fix is already installed. No files changed.");
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
  fs.writeFileSync(path.join(backup, "changes.json"), JSON.stringify({ installer: "coverage-selection-anchor-fix-v2", uninstall, changes: manifest }, null, 2) + "\n", {
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
  console.log("Coverage selection anchor fix " + (uninstall ? "uninstalled" : "installed") + ".");
  console.log("Backup: " + backupRelative);
  console.log(
    "Rebuild/reload Experience Builder before testing. Hover an individual point, click it and check that the selected image and green display position stay consistent.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
