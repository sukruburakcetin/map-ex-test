#!/usr/bin/env node
'use strict';
/** Explicit camera altitude sources and missing-data fix. Plain source payload.
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
      "file": "src/features/imagery/sequenceCoordinates.ts",
      "blocks": [
        {
          "label": "src/features/imagery/sequenceCoordinates.ts camera altitude source block 1",
          "before": "import { CACHE_KEYS, GRAPH_API } from '../../utils/constants';\nimport { sequenceCacheStore } from './sequenceCacheStore';\n\nexport type SequenceCoordinate = { id: string; lat: number; lon: number; captured_at?: number };\nexport type SequenceProgress = (points: SequenceCoordinate[], batch: number, loaded: number, total: number) => void;\n\n",
          "after": "import { CACHE_KEYS, GRAPH_API } from '../../utils/constants';\nimport { sequenceCacheStore } from './sequenceCacheStore';\nimport { imageAltitudeFields } from '../../utils/imageAltitude';\nimport type { ImageAltitude } from '../../utils/imageAltitude';\n\nexport type SequenceCoordinate = ImageAltitude & { id: string; lat: number; lon: number; captured_at?: number };\nexport type SequenceProgress = (points: SequenceCoordinate[], batch: number, loaded: number, total: number) => void;\n\n"
        },
        {
          "label": "src/features/imagery/sequenceCoordinates.ts camera altitude source block 2",
          "before": " */\nexport async function fetchSequenceCoordinates(dependencies: SequenceCoordinateDependencies, sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {\n    const valid = (value: any) => Array.isArray(value) && value.length > 0 && value.every(p => p && p.id != null && Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90);\n    const ram = dependencies.cache[sequenceId];\n    if (valid(ram)) return ram;\n    const cacheKey = `${CACHE_KEYS.GEO_PREFIX}${sequenceId}`;\n    const persisted = await sequenceCacheStore.read(cacheKey);\n    if (signal?.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n",
          "after": " */\nexport async function fetchSequenceCoordinates(dependencies: SequenceCoordinateDependencies, sequenceId: string, accessToken: string, signal?: AbortSignal, onProgress?: SequenceProgress): Promise<SequenceCoordinate[]> {\n    const valid = (value: any) => Array.isArray(value) && value.length > 0 && value.every(p => p && p.id != null && p.heightDataVersion === 2 && Number.isFinite(p.lon) && Number.isFinite(p.lat) && Math.abs(p.lon) <= 180 && Math.abs(p.lat) <= 90);\n    const ram = dependencies.cache[sequenceId];\n    if (valid(ram)) return ram;\n    const cacheKey = `${CACHE_KEYS.GEO_PREFIX}height-v2:${sequenceId}`;\n    const persisted = await sequenceCacheStore.read(cacheKey);\n    if (signal?.aborted) throw new DOMException(\"Cancelled\", \"AbortError\");\n"
        },
        {
          "label": "src/features/imagery/sequenceCoordinates.ts camera altitude source block 3",
          "before": "          const value = data[id], xy = value?.geometry?.coordinates;\n          if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) || Math.abs(xy[0]) > 180 || Math.abs(xy[1]) > 90) continue;\n          results[index].push({ id, lon: xy[0], lat: xy[1], alt: value.computed_altitude ?? value.altitude ?? 0, captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined });\n        }\n        onProgress?.(results[index], index, results.reduce((count, points) => count + (points?.length || 0), 0), unique.length);\n",
          "after": "          const value = data[id], xy = value?.geometry?.coordinates;\n          if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1]) || Math.abs(xy[0]) > 180 || Math.abs(xy[1]) > 90) continue;\n          results[index].push({ id, lon: xy[0], lat: xy[1], ...imageAltitudeFields(value), captured_at: value.captured_at ? new Date(value.captured_at).getTime() : undefined });\n        }\n        onProgress?.(results[index], index, results.reduce((count, points) => count + (points?.length || 0), 0), unique.length);\n"
        }
      ],
      "absentAfterUninstall": [
        "imageAltitudeFields",
        "height-v2:"
      ],
      "requiredOccurrences": [
        {
          "text": "imageAltitudeFields",
          "count": 2
        },
        {
          "text": "height-v2:",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/elevation/profileTracking.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileTracking.ts camera altitude source block 1",
          "before": "/** Metres throughout. Frame identity/order come from the exact profile input snapshot. */\nexport interface ElevationIndicatorImage { id: string; lat: number; lon: number; alt?: number; }\nexport interface ProfileSample { distance: number; elevation?: number | null; }\nexport interface FramePosition { id: string; ordinal: number; distance: number; altitude?: number; }\nexport interface FrameDistanceIndex {\n  images: readonly ElevationIndicatorImage[];\n",
          "after": "import { finiteAltitude } from '../../utils/imageAltitude';\nimport type { ImageAltitude } from '../../utils/imageAltitude';\n\n/** Metres throughout. Frame identity/order come from the exact profile input snapshot. */\nexport interface ElevationIndicatorImage extends ImageAltitude { id: string; lat: number; lon: number; }\nexport interface ProfileSample { distance: number; elevation?: number | null; }\nexport interface FramePosition { id: string; ordinal: number; distance: number; computedAltitude?: number; reportedAltitude?: number; }\nexport interface FrameDistanceIndex {\n  images: readonly ElevationIndicatorImage[];\n"
        },
        {
          "label": "src/features/elevation/profileTracking.ts camera altitude source block 2",
          "before": "    }\n    frames.set(String(image.id), { id: String(image.id), ordinal: i + 1, distance,\n      altitude: typeof image.alt === 'number' && Number.isFinite(image.alt) ? image.alt : undefined });\n  });\n  return { images, frames, total: distance };\n",
          "after": "    }\n    frames.set(String(image.id), { id: String(image.id), ordinal: i + 1, distance,\n      computedAltitude: finiteAltitude(image.computedAltitude), reportedAltitude: finiteAltitude(image.reportedAltitude) });\n  });\n  return { images, frames, total: distance };\n"
        },
        {
          "label": "src/features/elevation/profileTracking.ts camera altitude source block 3",
          "before": "export function sameProfileInput(a: readonly ElevationIndicatorImage[], b: readonly ElevationIndicatorImage[]): boolean {\n  return a === b || a.length === b.length && a.every((p, i) => {\n    const q = b[i]; return String(p.id) === String(q.id) && p.lon === q.lon && p.lat === q.lat && Object.is(p.alt, q.alt);\n  });\n}\n",
          "after": "export function sameProfileInput(a: readonly ElevationIndicatorImage[], b: readonly ElevationIndicatorImage[]): boolean {\n  return a === b || a.length === b.length && a.every((p, i) => {\n    const q = b[i]; return String(p.id) === String(q.id) && p.lon === q.lon && p.lat === q.lat && Object.is(p.computedAltitude, q.computedAltitude) && Object.is(p.reportedAltitude, q.reportedAltitude);\n  });\n}\n"
        }
      ],
      "absentAfterUninstall": [
        "finiteAltitude"
      ],
      "requiredOccurrences": [
        {
          "text": "finiteAltitude",
          "count": 3
        }
      ]
    },
    {
      "file": "src/features/elevation/ElevationProfileController.ts",
      "blocks": [
        {
          "label": "src/features/elevation/ElevationProfileController.ts camera altitude source block 1",
          "before": "    this.view = view;\n    if (sequenceImages.length < 2) return;\n    const snapshot = sequenceImages.map(image => ({ id: String(image.id), lon: image.lon, lat: image.lat, alt: image.alt }));\n    this.pendingImages = snapshot;\n    const request = ++this.revision;\n",
          "after": "    this.view = view;\n    if (sequenceImages.length < 2) return;\n    const snapshot = sequenceImages.map(image => ({ id: String(image.id), lon: image.lon, lat: image.lat, computedAltitude: image.computedAltitude, reportedAltitude: image.reportedAltitude }));\n    this.pendingImages = snapshot;\n    const request = ++this.revision;\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts camera altitude source block 2",
          "before": "      if (!(index.total > 0)) { this.pendingImages = null; return; }\n      const Graphic = this.getGraphic();\n      const hasAltitude = snapshot.some(image => typeof image.alt === 'number' && Number.isFinite(image.alt));\n      const polyline = new Polyline({ paths: [snapshot.map(image => [image.lon, image.lat, image.alt || 0])], hasZ: hasAltitude, spatialReference: { wkid: 4326 } });\n      const inputGraphic = new Graphic({ geometry: polyline, elevationInfo: { mode: 'absolute-height' } });\n      if (needsTerrainSource) this.terrainSource = new ElevationLayer({ url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer' });\n      const profiles: any[] = [needsTerrainSource\n        ? { type: 'query', source: this.terrainSource, title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }\n        : { type: 'ground', title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }];\n      if (hasAltitude) profiles.push({ type: 'input', title: 'Vehicle Altitude', color: '#f39c12', viewVisualizationEnabled: false });\n      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n",
          "after": "      if (!(index.total > 0)) { this.pendingImages = null; return; }\n      const Graphic = this.getGraphic();\n      // Camera curves use explicit per-frame metadata in the renderer. Native\n      // terrain/infrastructure queries share the horizontal path, without fake Zs.\n      const polyline = new Polyline({ paths: [snapshot.map(image => [image.lon, image.lat])], hasZ: false, spatialReference: { wkid: 4326 } });\n      const inputGraphic = new Graphic({ geometry: polyline });\n      if (needsTerrainSource) this.terrainSource = new ElevationLayer({ url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer' });\n      const profiles: any[] = [needsTerrainSource\n        ? { type: 'query', source: this.terrainSource, title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }\n        : { type: 'ground', title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }];\n      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/elevation/profileIndicator.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileIndicator.ts camera altitude source block 1",
          "before": "  private readonly right = 12;\n  private root: HTMLElement | null = null;\n  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex) {\n    this.end = index.total;\n    const container = widget.container;\n    this.root = typeof container === 'string' ? document.getElementById(container) : container || null;\n",
          "after": "  private readonly right = 12;\n  private root: HTMLElement | null = null;\n  private readonly cameraLines: ProfileLine[];\n  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex) {\n    this.end = index.total;\n    this.cameraLines = ([\n      ['computedAltitude', 'Computed camera altitude', '#f39c12'],\n      ['reportedAltitude', 'Reported camera altitude', '#a855f7'],\n    ] as const).map(([field, title, color]) => ({ title, visible: true, color: { toCss: () => color },\n      samples: [...index.frames.values()].map(frame => ({ distance: frame.distance, elevation: frame[field] ?? null })),\n    })).filter(line => line.samples.some(sample => sample.elevation !== null));\n    const container = widget.container;\n    this.root = typeof container === 'string' ? document.getElementById(container) : container || null;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts camera altitude source block 2",
          "before": "    Object.assign(inspect.style, { fontSize: '10px', lineHeight: '1.35', minHeight: '26px', paddingTop: '4px', overflowWrap: 'anywhere', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    host.append(label, loading, controls, svg, inspect); native.before(host);\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n",
          "after": "    Object.assign(inspect.style, { fontSize: '10px', lineHeight: '1.35', minHeight: '26px', paddingTop: '4px', overflowWrap: 'anywhere', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    host.append(label, loading, controls, svg, inspect);\n    const cameraLegend = doc.createElement('div');\n    cameraLegend.className = 'esri-elevation-profile-legend';\n    for (const line of this.cameraLines) {\n      const row = doc.createElement('label'); row.className = 'esri-elevation-profile-legend-item';\n      Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', marginBottom: '3px', cursor: 'pointer', borderLeft: `3px solid ${line.color.toCss()}` });\n      row.title = 'Mapillary camera-height estimate. Missing values are gaps; this is not a surveyed bridge-deck elevation.';\n      const check = doc.createElement('input'); check.type = 'checkbox'; check.checked = line.visible;\n      check.setAttribute('aria-label', line.title || 'Camera altitude');\n      check.addEventListener('change', () => { line.visible = check.checked; this.refresh(); });\n      const name = doc.createElement('span'); name.textContent = line.title || 'Camera altitude';\n      Object.assign(name.style, { fontSize: '12px', lineHeight: '1.3' });\n      row.append(check, name); cameraLegend.appendChild(row);\n    }\n    if (!this.cameraLines.length) {\n      const unavailable = doc.createElement('div'); unavailable.textContent = 'Camera altitude unavailable in this sequence.';\n      Object.assign(unavailable.style, { fontSize: '10px', lineHeight: '1.35', padding: '4px 0' }); cameraLegend.appendChild(unavailable);\n    }\n    host.appendChild(cameraLegend); native.before(host);\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts camera altitude source block 3",
          "before": "    else schedule();\n  };\n  private lines(): ProfileLine[] { return this.widget.profiles.toArray().filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || this.disposed) return;\n",
          "after": "    else schedule();\n  };\n  private lines(): ProfileLine[] { return [...this.widget.profiles.toArray(), ...this.cameraLines].filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || this.disposed) return;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts camera altitude source block 4",
          "before": "    if (this.frameLabel) {\n      this.frameLabel.textContent = frame\n        ? `Current image \u00b7 Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} \u00b7 ${Math.round(frame.distance).toLocaleString()} m${frame.altitude !== undefined ? ` \u00b7 GPS altitude ${frame.altitude.toFixed(1)} m` : ''}`\n        : 'Waiting for a confirmed image in this profile\u2026';\n      this.frameLabel.title = frame ? `Current Mapillary image ID: ${frame.id}` : '';\n",
          "after": "    if (this.frameLabel) {\n      this.frameLabel.textContent = frame\n        ? `Current image \u00b7 Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} \u00b7 ${Math.round(frame.distance).toLocaleString()} m${frame.computedAltitude !== undefined ? ` \u00b7 Computed camera altitude ${frame.computedAltitude.toFixed(1)} m` : ''}${frame.reportedAltitude !== undefined ? ` \u00b7 Reported camera altitude ${frame.reportedAltitude.toFixed(1)} m` : ''}${frame.computedAltitude === undefined && frame.reportedAltitude === undefined ? ' \u00b7 Camera altitude unavailable' : ''}`\n        : 'Waiting for a confirmed image in this profile\u2026';\n      this.frameLabel.title = frame ? `Current Mapillary image ID: ${frame.id}` : '';\n"
        }
      ],
      "absentAfterUninstall": [
        "cameraLines"
      ],
      "requiredOccurrences": [
        {
          "text": "cameraLines",
          "count": 5
        }
      ]
    },
    {
      "file": "src/features/elevation/README.md",
      "blocks": [
        {
          "label": "src/features/elevation/README.md camera altitude source block 1",
          "before": "`ElevationProfileController` builds the ArcGIS profile input and an immutable frame-distance index from the same ordered sequence snapshot. Segment distances use the SDK's geodesic calculation in metres, in bounded batches. Identical inputs are reused; image playback does not regenerate profiles or scan the sequence.\n\n`profileIndicator.ts` renders a small SVG chart from the public `ElevationProfileLine.samples` API. Its explicit distance axis positions the dashed blue current-image line. The frame label includes its ordinal, distance, optional GPS altitude and an image-ID tooltip. Distance-axis zoom, pan and reset use the chart buttons. All elevations and stored distances are metres; long horizontal axes are labelled in kilometres.\n\nOnly confirmed viewer image events may drive the current-image line. An optimistic selection, missing frame, or mismatching route/viewer hides the line. A separate grey line and \u201cInspecting profile\u201d text show interpolated sample values under the pointer. Inspection neither changes imagery nor navigates the map. ArcGIS's sample-snapped map visualizations are disabled, leaving the existing green active-image marker authoritative.\n",
          "after": "`ElevationProfileController` builds the ArcGIS profile input and an immutable frame-distance index from the same ordered sequence snapshot. Segment distances use the SDK's geodesic calculation in metres, in bounded batches. Identical inputs are reused; image playback does not regenerate profiles or scan the sequence.\n\n`profileIndicator.ts` renders a small SVG chart from the public `ElevationProfileLine.samples` API. Its explicit distance axis positions the dashed blue current-image line. The frame label includes its ordinal, distance, source-labelled computed/reported camera altitudes and an image-ID tooltip. Distance-axis zoom, pan and reset use the chart buttons. All elevations and stored distances are metres; long horizontal axes are labelled in kilometres.\n\nOnly confirmed viewer image events may drive the current-image line. An optimistic selection, missing frame, or mismatching route/viewer hides the line. A separate grey line and \u201cInspecting profile\u201d text show interpolated sample values under the pointer. Inspection neither changes imagery nor navigates the map. ArcGIS's sample-snapped map visualizations are disabled, leaving the existing green active-image marker authoritative.\n"
        },
        {
          "label": "src/features/elevation/README.md camera altitude source block 2",
          "before": "\nRoute replacement and view transfer remove the old chart, watch, widget and fallback terrain source. The controller removes widgets from their creating view. The elevation profile never changes the visible map's Ground; the independent 3D-terrain setting owns optional scene terrain.\n",
          "after": "\nRoute replacement and view transfer remove the old chart, watch, widget and fallback terrain source. The controller removes widgets from their creating view. The elevation profile never changes the visible map's Ground; the independent 3D-terrain setting owns optional scene terrain.\n\nCamera height sources are preserved independently by `imageAltitudeFields`: `computed_altitude` becomes `computedAltitude`, and `altitude` becomes `reportedAltitude`. The renderer plots separate orange/purple curves with independent visibility controls. Missing or invalid values are gaps; legitimate zero and negative heights are retained. Ambiguous legacy `alt` values are not plotted. These are camera-height estimates, not surveyed road/bridge elevations; no terrain substitution or bridge flattening is applied.\n\nCamera curves use the frame index directly instead of an SDK input profile, so no extra terrain-based camera query is generated. Terrain/infrastructure queries receive a horizontal polyline without synthetic Z=0 values. Coordinate caches use the `height-v2:` namespace and mark downloaded records with `heightDataVersion: 2`; old combined-height caches receive a one-time metadata refresh, then normal bounded RAM/IndexedDB reuse resumes. Existing imagery preview caches and field notes are untouched.\n"
        }
      ],
      "absentAfterUninstall": [
        "imageAltitudeFields",
        "height-v2:"
      ],
      "requiredOccurrences": [
        {
          "text": "imageAltitudeFields",
          "count": 1
        },
        {
          "text": "height-v2:",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/utils/imageAltitude.ts",
      "content": "/** Keep camera height sources distinct. Missing metadata is never sea-level zero. */\nexport interface ImageAltitude {\n  computedAltitude?: number;\n  reportedAltitude?: number;\n  /** Compatibility value for other features; profile curves use explicit sources. */\n  alt?: number;\n  heightDataVersion?: number;\n}\nexport function finiteAltitude(value: unknown): number | undefined {\n  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;\n}\nexport function imageAltitudeFields(value: { computed_altitude?: unknown; altitude?: unknown }): ImageAltitude {\n  const computedAltitude = finiteAltitude(value.computed_altitude);\n  const reportedAltitude = finiteAltitude(value.altitude);\n  return { computedAltitude, reportedAltitude, alt: computedAltitude ?? reportedAltitude, heightDataVersion: 2 };\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'camera-altitude-sources-fix-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-camera-altitude-sources-fix.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Camera altitude sources fix is already uninstalled. No files changed.' : 'Camera altitude sources fix is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'camera-altitude-sources-fix', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Camera altitude sources fix ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Camera height sources are separate curves with missing-data gaps. Legacy combined-height coordinate caches refresh metadata once; normal cache reuse then resumes.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
