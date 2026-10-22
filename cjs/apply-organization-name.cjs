#!/usr/bin/env node
'use strict';
/** Organization display-name lookup installer. Plain source payload.
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
const payload = { entries: [
  { file: "src/runtime/widget.tsx", blocks: [
    { label: "src/runtime/widget.tsx organization name block 1", before: `import { buildAllFilters } from "../utils/filterBuilder";
import { organizationFilterId } from "../utils/organizationFilter";
import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudCandidates, pointCloudDisplayExpression, pointCloudCorridorCount, buildPointCloudPly, buildPointCloudLas } from "../utils/pointCloudUtils";
import { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';
`,
      after: `import { buildAllFilters } from "../utils/filterBuilder";
import { organizationFilterId } from "../utils/organizationFilter";
import { OrganizationNameLookup } from "../features/coverage/organizationNameLookup";
import { loadPointCloud, PointCloudClusterCache, diffPointCloudFeatures, summarizePointCloud, pointCloudCandidates, pointCloudDisplayExpression, pointCloudCorridorCount, buildPointCloudPly, buildPointCloudLas } from "../utils/pointCloudUtils";
import { PointCloudAdaptiveDisplay } from '../features/point-cloud/PointCloudAdaptiveDisplay';
`, declarations: ["import { OrganizationNameLookup }"] },
    { label: "src/runtime/widget.tsx organization name block 2", before: `  turboFilterUsername: string;
  turboFilterOrganization: string;
  showTurboFilterBox: boolean;
  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;
`,
      after: `  turboFilterUsername: string;
  turboFilterOrganization: string;
  organizationName: { id: string; name: string } | null;
  showTurboFilterBox: boolean;
  trafficSignsOptions: Array<{ value: string; label: string; iconUrl: string | null }>;
` },
    { label: "src/runtime/widget.tsx organization name block 3", before: `    turboFilterUsername: "",
    turboFilterOrganization: this.props.config.turboOrganization || "",
    turboFilterStartDate: "",
    turboFilterEndDate: "",
`,
      after: `    turboFilterUsername: "",
    turboFilterOrganization: this.props.config.turboOrganization || "",
    organizationName: null,
    turboFilterStartDate: "",
    turboFilterEndDate: "",
` },
    { label: "src/runtime/widget.tsx organization name block 4", before: `    this.setState({ turboFilterOnFoot: onFoot }, () => { void this.enableTurboCoverageLayer(); });
  };

  private getTurboOrganizationId(): number | undefined {
`,
      after: `    this.setState({ turboFilterOnFoot: onFoot }, () => { void this.enableTurboCoverageLayer(); });
  };

  private _organizationNames: OrganizationNameLookup | null = null;
  private _organizationNameRevision = 0;
  private _organizationNameDisposed = false;
  private _organizationNameTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleOrganizationName() {
    ++this._organizationNameRevision;
    if (this._organizationNameTimer !== null) clearTimeout(this._organizationNameTimer);
    this._organizationNameTimer = setTimeout(() => {
      this._organizationNameTimer = null;
      void this.updateOrganizationName();
    }, 300);
  }

  /** Names are presentation metadata; coverage continues using the numeric ID. */
  private async updateOrganizationName() {
    const revision = ++this._organizationNameRevision;
    const id = this.getTurboOrganizationId();
    if (this._organizationNameDisposed) return;
    if (id === undefined || id < 1) {
      if (this.state.organizationName) this.setState({ organizationName: null });
      return;
    }
    this._organizationNames ??= new OrganizationNameLookup();
    const name = await this._organizationNames.resolve(String(id), this.accessToken);
    if (this._organizationNameDisposed || revision !== this._organizationNameRevision || this.getTurboOrganizationId() !== id) return;
    const next = name ? { id: String(id), name } : null;
    if (this.state.organizationName?.id !== next?.id || this.state.organizationName?.name !== next?.name) {
      this.setState({ organizationName: next });
    }
  }

  private getOrganizationDisplayName(): string | undefined {
    return this.state.organizationName?.id === String(this.getTurboOrganizationId()) ? this.state.organizationName.name : undefined;
  }

  private getTurboOrganizationId(): number | undefined {
`, declarations: ["  private _organizationNames:"] },
    { label: "src/runtime/widget.tsx organization name block 5", before: `  // - and attaches resize/fullscreen event listeners.
  async componentDidMount() {
    this.installCoverageAlignmentDiagnostic();
    try {
`,
      after: `  // - and attaches resize/fullscreen event listeners.
  async componentDidMount() {
    void this.updateOrganizationName();
    this.installCoverageAlignmentDiagnostic();
    try {
` },
    { label: "src/runtime/widget.tsx organization name block 6", before: `
  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {
    if (prevState.pointCloudAdaptive !== this.state.pointCloudAdaptive || prevState.isMeasureMode !== this.state.isMeasureMode || prevState.isLassoMode !== this.state.isLassoMode || prevState.isSightMode !== this.state.isSightMode || prevState.isViewshedMode !== this.state.isViewshedMode) this.updatePointCloudDisplay();
    if (prevProps.config.sharedFieldNotesEnabled !== this.props.config.sharedFieldNotesEnabled || prevProps.config.sharedFieldNotesUrl !== this.props.config.sharedFieldNotesUrl || prevProps.config.sharedFieldNotesReadUrl !== this.props.config.sharedFieldNotesReadUrl) {
`,
      after: `
  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {
    const previousOrganization = organizationFilterId(prevProps.config.turboOrganization || prevState.turboFilterOrganization);
    if (previousOrganization !== this.getTurboOrganizationId()) this.scheduleOrganizationName();
    if (prevState.pointCloudAdaptive !== this.state.pointCloudAdaptive || prevState.isMeasureMode !== this.state.isMeasureMode || prevState.isLassoMode !== this.state.isLassoMode || prevState.isSightMode !== this.state.isSightMode || prevState.isViewshedMode !== this.state.isViewshedMode) this.updatePointCloudDisplay();
    if (prevProps.config.sharedFieldNotesEnabled !== this.props.config.sharedFieldNotesEnabled || prevProps.config.sharedFieldNotesUrl !== this.props.config.sharedFieldNotesUrl || prevProps.config.sharedFieldNotesReadUrl !== this.props.config.sharedFieldNotesReadUrl) {
` },
    { label: "src/runtime/widget.tsx organization name block 7", before: `  // - to prevent memory leaks when widget is closed or reloaded.
  componentWillUnmount() {
    this._coverageAlignmentDiagnostic?.dispose();
    this._coverageAlignmentDiagnostic = null;
`,
      after: `  // - to prevent memory leaks when widget is closed or reloaded.
  componentWillUnmount() {
    this._organizationNameDisposed = true; ++this._organizationNameRevision;
    if (this._organizationNameTimer !== null) clearTimeout(this._organizationNameTimer);
    this._organizationNameTimer = null;
    this._organizationNames?.dispose(); this._organizationNames = null;
    this._coverageAlignmentDiagnostic?.dispose();
    this._coverageAlignmentDiagnostic = null;
` },
    { label: "src/runtime/widget.tsx organization name block 8", before: `          hideInfoBox={this.props.config.hideInfoBox}
          turboCreator={this.props.config.turboCreator}
          turboOrganization={this.props.config.turboOrganization}
          imageId={this.state.imageId}
          address={this.state.address}
`,
      after: `          hideInfoBox={this.props.config.hideInfoBox}
          turboCreator={this.props.config.turboCreator}
          turboOrganization={this.props.config.turboOrganization || this.state.turboFilterOrganization}
          turboOrganizationName={this.getOrganizationDisplayName()}
          imageId={this.state.imageId}
          address={this.state.address}
` },
  ], absentAfterUninstall: ["OrganizationNameLookup", "turboOrganizationName", "organizationName", "_organizationName"], requiredOccurrences: [{"text": "OrganizationNameLookup", "count": 3}, {"text": "turboOrganizationName", "count": 1}, {"text": "organizationName", "count": 32}, {"text": "_organizationName", "count": 22}] },
  { file: "src/components/types.ts", blocks: [
    { label: "src/components/types.ts organization name block 1", before: `  turboCreator?: string;
  turboOrganization?: string;
  // state
  imageId: string | null;
`,
      after: `  turboCreator?: string;
  turboOrganization?: string;
  turboOrganizationName?: string;
  // state
  imageId: string | null;
` },
  ], absentAfterUninstall: ["turboOrganizationName"], requiredOccurrences: [{"text": "turboOrganizationName", "count": 1}] },
  { file: "src/components/InfoBox.tsx", blocks: [
    { label: "src/components/InfoBox.tsx organization name block 1", before: `      turboCreator,
      turboOrganization,
      imageId,
      address,
`,
      after: `      turboCreator,
      turboOrganization,
      turboOrganizationName,
      imageId,
      address,
` },
    { label: "src/components/InfoBox.tsx organization name block 2", before: `              style={infoStatusCardStyle}
            >
              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={address} turboCreator={turboCreator} turboOrganization={turboOrganization} onCopyCoordinates={this.props.onCopyCoordinates} />

              {turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}
`,
      after: `              style={infoStatusCardStyle}
            >
              <StatusSummary currentImg={currentImg} currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} address={address} turboCreator={turboCreator} turboOrganization={turboOrganization} turboOrganizationName={turboOrganizationName} onCopyCoordinates={this.props.onCopyCoordinates} />

              {turboModeActive && !hideCoverageAnalysis && <CoverageAnalysisTrigger currentZoom={currentZoom} jimuMapViewZoom={jimuMapViewZoom} turboPointsAvailable={turboPointsAvailable} coverageAnalysisLoading={coverageAnalysisLoading} coverageResult={coverageResult} onRunCoverageAnalysis={onRunCoverageAnalysis} turboMinZoom={turboMinZoom} />}
` },
  ], absentAfterUninstall: ["turboOrganizationName"], requiredOccurrences: [{"text": "turboOrganizationName", "count": 3}] },
  { file: "src/components/info-box/StatusSummary.tsx", blocks: [
    { label: "src/components/info-box/StatusSummary.tsx organization name block 1", before: `import { infoStatusHeaderStyle, infoStatusTitleStyle, infoStatusSearchStyle, infoStatusZoomStyle, infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';

export type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'turboOrganization' | 'onCopyCoordinates'> & {
 currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;
};
`,
      after: `import { infoStatusHeaderStyle, infoStatusTitleStyle, infoStatusSearchStyle, infoStatusZoomStyle, infoStatusAddressStyle, infoStatusGlobeStyle, infoStatusCoordinatesStyle, infoStatusCoordinateRowStyle, infoStatusCoordinateLabelStyle, infoStatusCreatorStyle } from '../../styles/infoBox';

export type StatusSummaryProps = Pick<InfoBoxProps, 'currentZoom' | 'jimuMapViewZoom' | 'address' | 'turboCreator' | 'turboOrganization' | 'turboOrganizationName' | 'onCopyCoordinates'> & {
 currentImg: InfoBoxProps['sequenceImages'][number] | null | undefined;
};
` },
    { label: "src/components/info-box/StatusSummary.tsx organization name block 2", before: ` * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({ currentZoom, jimuMapViewZoom, address, turboCreator, turboOrganization, onCopyCoordinates, currentImg }) => (
<React.Fragment>
              {/* Header / zoom */}
`,
      after: ` * the runtime clipboard callback. This component performs no lookup, geocoding or clipboard access.
 */
export const StatusSummary: React.FC<StatusSummaryProps> = ({ currentZoom, jimuMapViewZoom, address, turboCreator, turboOrganization, turboOrganizationName, onCopyCoordinates, currentImg }) => (
<React.Fragment>
              {/* Header / zoom */}
` },
    { label: "src/components/info-box/StatusSummary.tsx organization name block 3", before: `                </div>
              )}
              {turboOrganization && <div style={infoStatusCreatorStyle} title="Organization filter set in widget settings">Org: {turboOrganization}</div>}
</React.Fragment>
);
`,
      after: `                </div>
              )}
              {turboOrganization && <div
                style={{ ...infoStatusCreatorStyle, maxWidth: "100%", minWidth: 0, boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={turboOrganizationName ? \`\${turboOrganizationName} · Organization ID: \${turboOrganization}\` : \`Organization ID: \${turboOrganization}\`}
                aria-label={\`Organization: \${turboOrganizationName || turboOrganization}\`}>
                Org: {turboOrganizationName || turboOrganization}
              </div>}
</React.Fragment>
);
` },
  ], absentAfterUninstall: ["turboOrganizationName"], requiredOccurrences: [{"text": "turboOrganizationName", "count": 6}] },
], modules: [
  { file: "src/features/coverage/organizationNameLookup.ts", content: `import { GRAPH_API } from '../../utils/constants';
import { organizationFilterId } from '../../utils/organizationFilter';

interface CachedName { name: string | null; expires: number }
interface PendingName { controller: AbortController; promise: Promise<string | null> }

/** Small per-widget metadata cache. No map, tile, sequence or rendering work. */
export class OrganizationNameLookup {
  private readonly cache = new Map<string, CachedName>();
  private readonly pending = new Map<string, PendingName>();
  private disposed = false;
  constructor(private readonly request: typeof fetch = fetch, private readonly now: () => number = Date.now,
    private readonly timeoutMs = 5000) {}

  resolve(value: string, token: string): Promise<string | null> {
    const id = organizationFilterId(value);
    if (this.disposed || id === undefined || id < 1 || !token) return Promise.resolve(null);
    const key = String(id), cached = this.cache.get(key);
    if (cached && cached.expires > this.now()) {
      this.cache.delete(key); this.cache.set(key, cached);
      return Promise.resolve(cached.name);
    }
    this.cache.delete(key);
    const shared = this.pending.get(key);
    if (shared) return shared.promise;
    if (this.pending.size >= 16) return Promise.resolve(null);
    const controller = new AbortController();
    const promise = this.load(key, token, controller).then(name => {
      if (!this.disposed) {
        while (this.cache.size >= 16) this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(key, { name, expires: this.now() + (name ? 10 * 60 * 1000 : 30000) });
      }
      return name;
    }).finally(() => { this.pending.delete(key); });
    this.pending.set(key, { controller, promise });
    return promise;
  }

  private async load(id: string, token: string, controller: AbortController): Promise<string | null> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let abort: (() => void) | undefined;
    try {
      const cancelled = new Promise<never>((_resolve, reject) => {
        abort = () => reject(new DOMException('Cancelled', 'AbortError'));
        controller.signal.addEventListener('abort', abort, { once: true });
      });
      timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const work = (async () => {
        const response = await this.request(\`\${GRAPH_API.BASE}/\${id}?fields=name\`, {
          headers: { Authorization: \`OAuth \${token}\` }, signal: controller.signal,
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (organizationFilterId(data?.id) !== Number(id) || typeof data?.name !== 'string') return null;
        const name = data.name.trim();
        return name && name.length <= 512 ? name : null;
      })();
      return await Promise.race([work, cancelled]);
    } catch {
      // The existing numeric badge remains useful when optional metadata is unavailable.
      return null;
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      if (abort) controller.signal.removeEventListener('abort', abort);
    }
  }

  dispose(): void {
    this.disposed = true;
    for (const entry of this.pending.values()) entry.controller.abort();
    this.pending.clear(); this.cache.clear();
  }
}
` },
] };

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'organization-name-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-organization-name.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Organization name badge is already uninstalled. No files changed.' : 'Organization name badge is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'organization-name', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Organization name badge ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. The info box resolves the organization name using the existing token; hover the badge for its ID. Numeric IDs remain the fallback.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
