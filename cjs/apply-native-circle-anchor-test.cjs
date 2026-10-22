#!/usr/bin/env node
'use strict';
/** Plain-text native circle anchoring test installer.
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
const payload = { entries: [{
  file: "src/features/coverage/NativeCoverageAlignmentDiagnostic.ts",
  blocks: [
    { label: "Native circle test block 1",
      before: `const finite = (value: any): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const delta = (a: Pixel | null, b: Pixel | null) => a && b ? { x: a.x - b.x, y: a.y - b.y } : null;
`,
      after: `const finite = (value: any): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const paintKeys = ['circle-radius', 'circle-color', 'circle-blur', 'circle-opacity', 'circle-stroke-color', 'circle-stroke-width', 'circle-stroke-opacity', 'circle-translate', 'circle-translate-anchor', 'circle-pitch-alignment', 'circle-pitch-scale'];
// Keep appearance expressions, but never expose style sources, URLs or arbitrary metadata.
const safePaintValue = (value: any): any => Array.isArray(value) ? value.slice(0, 80).map(safePaintValue) : typeof value === 'number' ? finite(value) : typeof value === 'string' && value.length <= 80 && /^[\\w .,#()%+*-]+$/.test(value) ? value : null;
const paintReport = (paint: Json = {}): Json => Object.fromEntries(paintKeys.filter(key => key in paint).map(key => [key, safePaintValue(paint[key])]));
const delta = (a: Pixel | null, b: Pixel | null) => a && b ? { x: a.x - b.x, y: a.y - b.y } : null;
` },
    { label: "Native circle test block 2",
      before: `      enable: () => { controls.forEach(value => value.enable()); return 'Enabled. Move off the dot, then hover it. Cyan = native placement; brown = existing hover. No change to picking.'; },
      disable: async () => {
`,
      after: `      enable: () => { controls.forEach(value => value.enable()); return 'Enabled. Move off the dot, then hover it. Cyan = native placement; brown = existing hover. No change to picking.'; },
      radiusTest: () => { controls.forEach(value => value.radiusTest()); return 'Radius test armed. Hover one dot and keep the view still: native cyan 2s, radius 1/stroke 0 3s, radius 4/stroke 0 3s, then original cyan restored.'; },
      disable: async () => {
` },
    { label: "Native circle test block 3",
      before: `  private chain: Promise<void> = Promise.resolve();
  private owned: { layer: any; id: string }[] = [];
  private lastHover: Json | null = null;
`,
      after: `  private chain: Promise<void> = Promise.resolve();
  private owned: { layer: any; id: string; style: Json; target: object }[] = [];
  private radiusState: Json | null = null;
  private radiusRevision = 0;
  private radiusTimer: ReturnType<typeof setTimeout> | null = null;
  private radiusLabel: HTMLElement | null = null;
  private radiusWatch: { remove(): void } | null = null;
  private lastHover: Json | null = null;
` },
    { label: "Native circle test block 4",
      before: `  private unregister: () => void;
  constructor(readonly host: AlignmentHost, root: any = typeof window === 'undefined' ? undefined : window) { this.unregister = register(this, root); }

`,
      after: `  private unregister: () => void;
  constructor(readonly host: AlignmentHost, private readonly root: any = typeof window === 'undefined' ? undefined : window) { this.unregister = register(this, root); }

` },
    { label: "Native circle test block 5",
      before: `  enable(): void { if (!this.disposed) this.enabled = true; }

`,
      after: `  enable(): void { if (!this.disposed) this.enabled = true; }

  /** Arm one fresh hover; stages alter only this instance's exact-ID cyan clones. */
  radiusTest(): void { if (!this.disposed) { this.enable(); this.clearHover(); this.radiusState = { status: 'armed' }; } }

` },
    { label: "Native circle test block 6",
      before: `  /** Return allowlisted diagnostics; no token, service URL, style source or image metadata. */
  report(): Json { return copy({ enabled: this.enabled, cleanupPending: this.enabled ? 0 : this.owned.length, hover: this.lastHover, nativeHit: this.lastNativeHit }); }

`,
      after: `  /** Return allowlisted diagnostics; no token, service URL, style source or image metadata. */
  report(): Json { return copy({ enabled: this.enabled, cleanupPending: this.enabled ? 0 : this.owned.length, hover: this.lastHover, nativeHit: this.lastNativeHit, ...(this.radiusState ? { radiusTest: this.radiusState } : {}) }); }

` },
    { label: "Native circle test block 7",
      before: `    if (this.target?.id === id && this.target.context.view === context.view && this.target.context.layer === context.layer && this.target.context.revision === context.revision) return;
    this.clearHover();
    context.geometry = graphic.geometry;
`,
      after: `    if (this.target?.id === id && this.target.context.view === context.view && this.target.context.layer === context.layer && this.target.context.revision === context.revision) return;
    const armed = this.radiusState?.status === 'armed';
    this.clearHover();
    if (armed) this.radiusState = { status: 'waiting', imageId: id };
    context.geometry = graphic.geometry;
` },
    { label: "Native circle test block 8",
      before: `  clearHover(): void {
    ++this.revision;
`,
      after: `  clearHover(): void {
    this.stopRadius();
    ++this.revision;
` },
    { label: "Native circle test block 9",
      before: `      if (!bases.length) { result = { status: 'unavailable', reason: 'No active Turbo image-circle style; replacement graphics or a style refresh may be active.' }; return; }
      result = { status: 'added', color: '#00e5ff', sameRadiusAndStroke: true, baseStyleIds: bases.map(base => base.id), styleIds: [], filterId: target.id };
      for (let index = 0; index < bases.length; index++) {
`,
      after: `      if (!bases.length) { result = { status: 'unavailable', reason: 'No active Turbo image-circle style; replacement graphics or a style refresh may be active.' }; return; }
      result = { status: 'added', color: '#00e5ff', sameRadiusAndStroke: true, baseStyleIds: bases.map(base => base.id), styleIds: [], filterId: target.id,
        originalPaint: bases.map(base => ({ styleId: base.id, paint: paintReport(base.paint) })) };
      for (let index = 0; index < bases.length; index++) {
` },
    { label: "Native circle test block 10",
      before: `        if (existing) { result.status = 'collision'; result.reason = 'Existing diagnostic-style ID preserved.'; break; }
        this.owned.push({ layer, id });
        await layer.setStyleLayer(alignmentStyle(bases[index], target.id, id));
        result.styleIds.push(id);
`,
      after: `        if (existing) { result.status = 'collision'; result.reason = 'Existing diagnostic-style ID preserved.'; break; }
        const style = alignmentStyle(bases[index], target.id, id);
        this.owned.push({ layer, id, style, target });
        await layer.setStyleLayer(copy(style));
        result.styleIds.push(id);
` },
    { label: "Native circle test block 11",
      before: `
  /** Pair one image identity across native style, raw/indexed data, projection and DOM. */
`,
      after: `
  private stopRadius(): void {
    ++this.radiusRevision;
    if (this.radiusTimer) clearTimeout(this.radiusTimer);
    this.radiusTimer = null;
    this.radiusLabel?.remove(); this.radiusLabel = null;
    this.radiusWatch?.remove(); this.radiusWatch = null;
    if (this.radiusState && ['armed', 'waiting', 'running'].includes(this.radiusState.status)) this.radiusState = { ...this.radiusState, status: 'interrupted' };
  }

  /** Stage waits are outside the mutation queue, so clear/disable never waits eight seconds. */
  private radiusStage(target: { context: AlignmentContext; id: string }, revision: number, index = 0, radiusRevision = this.radiusRevision): void {
    const stages = ['baseline', 'small', 'large', 'restored'];
    const valid = () => radiusRevision === this.radiusRevision && this.current(target, revision) && target.context.view.stationary !== false;
    const interrupted = async () => { if (radiusRevision === this.radiusRevision) this.stopRadius(); await this.removeOwned(); };
    const work = this.chain.then(async () => {
      if (!valid()) { await interrupted(); return; }
      if (index) for (const item of this.owned.filter(item => item.target === target)) {
        if (!valid()) break;
        const style = copy(item.style);
        if (index < 3) style.paint = { ...style.paint, 'circle-radius': index === 1 ? 1 : 4, 'circle-stroke-width': 0 };
        await item.layer.setStyleLayer(style);
        if (!valid()) { await interrupted(); return; }
      }
      if (!valid()) { await interrupted(); return; }
      this.radiusState = { status: index === 3 ? 'completed' : 'running', stage: stages[index], imageId: target.id, radius: index === 1 ? 1 : index === 2 ? 4 : 'native', strokeWidth: index === 1 || index === 2 ? 0 : 'native' };
      const container = target.context.view.container, bounds = container?.getBoundingClientRect?.();
      if (!this.radiusLabel && bounds && container?.ownerDocument?.createElement && container?.appendChild) {
        this.radiusLabel = container.ownerDocument.createElement('div');
        this.radiusLabel!.style.cssText = \`position:fixed;left:\${bounds.left + 8}px;top:\${bounds.top + 8}px;z-index:2147483647;pointer-events:none;background:#12232b;color:#fff;padding:5px 8px;font:12px sans-serif;\`;
        container.appendChild(this.radiusLabel);
      }
      if (this.radiusLabel) this.radiusLabel.textContent = \`Native same-ID cyan: \${index === 1 ? 'radius 1, stroke 0 (3s)' : index === 2 ? 'radius 4, stroke 0 (3s)' : index === 3 ? 'original paint restored' : 'original paint (2s)'}\`;
      if (!index && typeof target.context.view.watch === 'function') this.radiusWatch = target.context.view.watch('stationary', (still: boolean) => { if (!still) this.clearHover(); });
      console.info(\`[Mapillary alignment] Radius test \${stages[index]} for image \${target.id}.\`);
      if (index < 3) this.radiusTimer = setTimeout(() => { this.radiusTimer = null; this.radiusStage(target, revision, index + 1, radiusRevision); }, index ? 3000 : 2000);
      else { this.radiusWatch?.remove(); this.radiusWatch = null; this.radiusLabel?.remove(); this.radiusLabel = null; }
    });
    this.chain = work.catch(async error => { if (radiusRevision === this.radiusRevision) { this.stopRadius(); this.radiusState = { status: 'failed', imageId: target.id, errorName: String(error?.name || 'Error') }; } await this.removeOwned(); });
  }

  /** Pair one image identity across native style, raw/indexed data, projection and DOM. */
` },
    { label: "Native circle test block 12",
      before: `      const css = host && typeof getComputedStyle === 'function' ? getComputedStyle(host) : null;
      this.lastHover = { timestamp: new Date().toISOString(), imageId: id, viewType: view.type, zoom: finite(view.zoom), rotation: finite(view.rotation), heading: finite(view.camera?.heading), tilt: finite(view.camera?.tilt),
        sourceZoom: context.sourceZoom, closeZoom: context.closeZoom, hybrid: { ready: context.hybridReady, visible: context.hybridVisible, fallback: context.hybridFallback }, nativeStyle, cached,
        pointerClient, pickerPixel: pixel({ x: attributes.turbo_screen_x, y: attributes.turbo_screen_y }), projectedPixel: projected,
`,
      after: `      const css = host && typeof getComputedStyle === 'function' ? getComputedStyle(host) : null;
      const lods = context.layer.tileInfo?.lods;
      const finalLOD = Array.isArray(lods) ? lods[lods.length - 1] : lods?.length && typeof lods.getItemAt === 'function' ? lods.getItemAt(lods.length - 1) : null;
      this.lastHover = { timestamp: new Date().toISOString(), imageId: id, viewType: view.type, zoom: finite(view.zoom), rotation: finite(view.rotation), heading: finite(view.camera?.heading), tilt: finite(view.camera?.tilt),
        sourceZoom: context.sourceZoom, closeZoom: context.closeZoom, hybrid: { ready: context.hybridReady, visible: context.hybridVisible, fallback: context.hybridFallback }, nativeStyle, cached,
        rendering: { tileSize: Array.isArray(context.layer.tileInfo?.size) ? context.layer.tileInfo.size.slice(0, 2).map(finite) : finite(context.layer.tileInfo?.size), finalLODResolution: finite(finalLOD?.resolution), viewResolution: finite(view.resolution), devicePixelRatio: finite(this.root?.devicePixelRatio), visualViewportScale: finite(this.root?.visualViewport?.scale) },
        pointerClient, pickerPixel: pixel({ x: attributes.turbo_screen_x, y: attributes.turbo_screen_y }), projectedPixel: projected,
` },
    { label: "Native circle test block 13",
      before: `      console.info('[Mapillary alignment] Comparison ready. Cyan = native image; brown = existing hover. Use window.__mlyCoverageAlignment.report().');
    } catch (error) {
      if (this.current(target, revision) && !signal.aborted) this.lastHover = { imageId: id, status: 'unavailable', errorName: String((error as any)?.name || 'Error'), reason: 'Cached comparison could not complete; normal picking is unchanged.' };
    } finally {
`,
      after: `      console.info('[Mapillary alignment] Comparison ready. Cyan = native image; brown = existing hover. Use window.__mlyCoverageAlignment.report().');
      if (this.radiusState?.status === 'waiting' && this.radiusState.imageId === id) {
        if (nativeStyle.status === 'added') this.radiusStage(target, revision);
        else this.radiusState = { status: 'unavailable', imageId: id, reason: 'Exact-ID native cyan style was not ready.' };
      }
    } catch (error) {
      if (this.current(target, revision) && !signal.aborted) {
        this.lastHover = { imageId: id, status: 'unavailable', errorName: String((error as any)?.name || 'Error'), reason: 'Cached comparison could not complete; normal picking is unchanged.' };
        if (this.radiusState?.status === 'waiting' && this.radiusState.imageId === id) this.radiusState = { status: 'unavailable', imageId: id, errorName: String((error as any)?.name || 'Error'), reason: 'Cached comparison could not complete.' };
      }
    } finally {
` },
  ],
  absentAfterUninstall: ["radiusTest"],
  requiredOccurrences: [{"text": "radiusTest", "count": 4}],
}], modules: [] };

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'native-circle-anchor-test-';

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
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited diagnostic)');
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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-native-circle-anchor-test.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited diagnostic references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (diagnostic references differ)');
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
  console.log('Only the existing alignment diagnostic is updated. Test files are preserved.');
  if (!writes.length) {
    console.log(uninstall ? 'Circle test is already uninstalled. No files changed.' : 'Circle test is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'native-circle-anchor-test', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Native circle anchoring test ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. Run window.__mlyCoverageAlignment.radiusTest(), then hover one image point and hold still.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}