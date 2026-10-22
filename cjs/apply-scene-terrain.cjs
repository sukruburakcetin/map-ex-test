#!/usr/bin/env node
'use strict';
/** Optional 3D terrain installer. Plain source payload.
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
      "file": "src/config.ts",
      "blocks": [
        {
          "label": "src/config.ts scene terrain block 1",
          "before": "  enableSolar?: boolean;\n  enableElevationProfile?: boolean;\n\n  /**\n",
          "after": "  enableSolar?: boolean;\n  enableElevationProfile?: boolean;\n\n  /** Add World Elevation to a 3D map only when it has no terrain source. Default: false. */\n  enable3DTerrain?: boolean;\n\n  /**\n"
        }
      ],
      "absentAfterUninstall": [
        "enable3DTerrain"
      ],
      "requiredOccurrences": [
        {
          "text": "enable3DTerrain",
          "count": 1
        }
      ]
    },
    {
      "file": "src/setting/setting.tsx",
      "blocks": [
        {
          "label": "src/setting/setting.tsx scene terrain block 1",
          "before": "            <Switch checked={config.enableSolar === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set(\"enableSolar\", evt.target.checked) })} />\n          </SettingRow>\n          <SettingRow label=\"Enable Elevation Profiler\">\n            <Switch checked={config.enableElevationProfile === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set(\"enableElevationProfile\", evt.target.checked) })} />\n",
          "after": "            <Switch checked={config.enableSolar === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set(\"enableSolar\", evt.target.checked) })} />\n          </SettingRow>\n          <SettingRow label=\"Enable 3D terrain\">\n            <Switch checked={config.enable3DTerrain === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set(\"enable3DTerrain\", evt.target.checked) })} />\n          </SettingRow>\n          <SettingRow>\n            <span style={{ fontSize: \"12px\", opacity: 0.7 }}>Uses existing map terrain, or adds World Elevation in 3D. Independent of the elevation profile.</span>\n          </SettingRow>\n          <SettingRow label=\"Enable Elevation Profiler\">\n            <Switch checked={config.enableElevationProfile === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set(\"enableElevationProfile\", evt.target.checked) })} />\n"
        }
      ],
      "absentAfterUninstall": [
        "enable3DTerrain"
      ],
      "requiredOccurrences": [
        {
          "text": "enable3DTerrain",
          "count": 2
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx scene terrain block 1",
          "before": "import { SolarSceneLighting } from '../features/solar/SolarSceneLighting';\nimport { updateElevationIndicator } from '../features/elevation/profileIndicator';\nimport { ElevationProfileController } from '../features/elevation/ElevationProfileController';\nimport { SequenceHoverHighlight } from '../features/coverage/SequenceHoverHighlight';\n",
          "after": "import { SolarSceneLighting } from '../features/solar/SolarSceneLighting';\nimport { updateElevationIndicator } from '../features/elevation/profileIndicator';\nimport { SceneTerrainController } from '../features/elevation/SceneTerrainController';\nimport { ElevationProfileController } from '../features/elevation/ElevationProfileController';\nimport { SequenceHoverHighlight } from '../features/coverage/SequenceHoverHighlight';\n"
        },
        {
          "label": "src/runtime/widget.tsx scene terrain block 2",
          "before": "  // Elevation Profile\n  private _elevationProfile: ElevationProfileController | null = null;\n\n  private _playbackBindings: PlaybackBindings | null = null;\n",
          "after": "  // Elevation Profile\n  private _elevationProfile: ElevationProfileController | null = null;\n  private _sceneTerrain: SceneTerrainController | null = null;\n  private syncSceneTerrain(view = this.state.jimuMapView?.view): void {\n    this._sceneTerrain ??= new SceneTerrainController(async () => {\n      const [ElevationLayer] = await loadArcGISJSAPIModules([\"esri/layers/ElevationLayer\"]);\n      return ElevationLayer;\n    });\n    void this._sceneTerrain.sync(view, this.props.config.enable3DTerrain === true).catch(error => {\n      console.warn(\"[Mapillary terrain] Could not enable scene terrain:\", error);\n    });\n  }\n\n  private _playbackBindings: PlaybackBindings | null = null;\n"
        },
        {
          "label": "src/runtime/widget.tsx scene terrain block 3",
          "before": "\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    const previousOrganization = organizationFilterId(prevProps.config.turboOrganization || prevState.turboFilterOrganization);\n    if (previousOrganization !== this.getTurboOrganizationId()) this.scheduleOrganizationName();\n",
          "after": "\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevProps.config.enable3DTerrain !== this.props.config.enable3DTerrain) this.syncSceneTerrain();\n    const previousOrganization = organizationFilterId(prevProps.config.turboOrganization || prevState.turboFilterOrganization);\n    if (previousOrganization !== this.getTurboOrganizationId()) this.scheduleOrganizationName();\n"
        },
        {
          "label": "src/runtime/widget.tsx scene terrain block 4",
          "before": "  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._organizationNameDisposed = true; ++this._organizationNameRevision;\n    if (this._organizationNameTimer !== null) clearTimeout(this._organizationNameTimer);\n",
          "after": "  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._sceneTerrain?.dispose(); this._sceneTerrain = null;\n    this._organizationNameDisposed = true; ++this._organizationNameRevision;\n    if (this._organizationNameTimer !== null) clearTimeout(this._organizationNameTimer);\n"
        },
        {
          "label": "src/runtime/widget.tsx scene terrain block 5",
          "before": "    const view = jmv?.view;\n    if (!view?.map || view.destroyed) return;\n    const startupRevision = ++this._viewStartupRevision;\n    this._startupUrlParameters ??= readSharedLinkParameters();\n",
          "after": "    const view = jmv?.view;\n    if (!view?.map || view.destroyed) return;\n    this.syncSceneTerrain(view);\n    const startupRevision = ++this._viewStartupRevision;\n    this._startupUrlParameters ??= readSharedLinkParameters();\n"
        }
      ],
      "absentAfterUninstall": [
        "SceneTerrainController",
        "syncSceneTerrain",
        "_sceneTerrain",
        "enable3DTerrain"
      ],
      "requiredOccurrences": [
        {
          "text": "SceneTerrainController",
          "count": 4
        },
        {
          "text": "syncSceneTerrain",
          "count": 3
        },
        {
          "text": "_sceneTerrain",
          "count": 5
        },
        {
          "text": "enable3DTerrain",
          "count": 3
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/elevation/SceneTerrainController.ts",
      "content": "/** Adds optional scene terrain without replacing the host map's Ground. */\nexport interface SceneTerrainLayer {\n  load(): Promise<unknown>;\n  destroy(): void;\n}\nexport interface SceneTerrainGround {\n  layers: {\n    readonly length: number;\n    add(layer: SceneTerrainLayer): unknown;\n    remove(layer: SceneTerrainLayer): unknown;\n    includes(layer: SceneTerrainLayer): boolean;\n  };\n}\nexport interface SceneTerrainMap { ground: SceneTerrainGround; }\nexport interface SceneTerrainView {\n  type: string;\n  destroyed?: boolean;\n  map: SceneTerrainMap | null;\n  when(): Promise<unknown>;\n}\nexport type SceneTerrainConstructor = new (properties: { url: string; title: string }) => SceneTerrainLayer;\n\n/** Own only the layer created here. A shared 2D/3D map retains that layer during view\n * switches; 2D never starts terrain loading. External terrain is always reused.\n * Revision and Ground identity checks reject stale module/layer completions.\n */\nexport class SceneTerrainController {\n  private revision = 0;\n  private disposed = false;\n  private owned: { map: SceneTerrainMap; ground: SceneTerrainGround; layer: SceneTerrainLayer } | null = null;\n  private pending: SceneTerrainLayer | null = null;\n  constructor(private readonly loadConstructor: () => Promise<SceneTerrainConstructor>) {}\n\n  async sync(view: SceneTerrainView | null | undefined, enabled: boolean): Promise<void> {\n    const request = ++this.revision;\n    this.cancelPending();\n    const map = view?.map;\n    if (this.owned && (!enabled || this.owned.map !== map || this.owned.ground !== map?.ground || !this.owned.ground.layers.includes(this.owned.layer))) this.releaseOwned();\n    if (this.disposed || !enabled || !view || view.destroyed || !map || view.type !== '3d') return;\n    const ground = map.ground;\n    if (!ground?.layers || ground.layers.length) return;\n    const current = () => !this.disposed && request === this.revision && !view.destroyed && view.map === map && map.ground === ground;\n    let layer: SceneTerrainLayer | null = null;\n    try {\n      await view.when();\n      if (!current() || ground.layers.length) return;\n      const ElevationLayer = await this.loadConstructor();\n      if (!current() || ground.layers.length) return;\n      layer = new ElevationLayer({\n        url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',\n        title: 'Mapillary Explorer Terrain',\n      });\n      this.pending = layer;\n      await layer.load();\n      if (!current() || ground.layers.length) return;\n      ground.layers.add(layer);\n      this.owned = { map, ground, layer };\n    } catch (error) {\n      // A superseded/destroyed view or cancelled layer is an expected lifecycle exit.\n      if (current() && (error as { name?: string })?.name !== 'AbortError') throw error;\n    } finally {\n      if (layer && this.pending === layer) {\n        this.pending = null;\n        if (this.owned?.layer !== layer) layer.destroy();\n      }\n    }\n  }\n\n  private cancelPending(): void {\n    const layer = this.pending; this.pending = null;\n    layer?.destroy();\n  }\n  private releaseOwned(): void {\n    const owned = this.owned; this.owned = null;\n    if (!owned) return;\n    if (owned.ground.layers.includes(owned.layer)) owned.ground.layers.remove(owned.layer);\n    owned.layer.destroy();\n  }\n  dispose(): void {\n    this.disposed = true; ++this.revision;\n    this.cancelPending(); this.releaseOwned();\n  }\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'scene-terrain-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-scene-terrain.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Optional 3D terrain is already uninstalled. No files changed.' : 'Optional 3D terrain is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'scene-terrain', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Optional 3D terrain ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Enable Advanced Settings > Enable 3D terrain. Existing map terrain is reused; the elevation profile remains independent.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
