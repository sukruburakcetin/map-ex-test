/** Fetch bounded SfM neighborhoods. Completeness is relative to the requested search,
 * not a claim that the Mapillary website uses the same reconstruction selection. */
import pako from 'pako';
import { GRAPH_API, POINT_CLOUD_FETCH_LENGTH } from './constants';
import { distanceMeters } from './geoUtils';

// Types

export interface SfmRawPoint {
    x: number;   // East  offset from reference_lla origin, metres (ENU)
    y: number;   // North offset
    z: number;   // Up    offset
    r: number;   // 0-255
    g: number;
    b: number;
}

export interface ReferenceLla {
    latitude:  number;
    longitude: number;
    altitude:  number;
}

export interface PointCloudPoint {
    lon:    number;   // shifted: for ArcGIS map layer
    lat:    number;
    rawLon: number;   // unshifted: for Mapillary viewer overlay
    rawLat: number;
    alt:    number;
    r: number;
    g: number;
    b: number;
}

export interface PointCloudMeta {
    sfmClusterUrl:  string;
    referenceLla:   ReferenceLla | null;
    imageLocation:  { lon: number; lat: number };
    alignmentShift: { lon: number; lat: number };
    imageKey:       string;
    mergeCC:        number | null;  // connected-component ID
}

export interface PointCloudResult {
    points:         PointCloudPoint[];
    totalPoints:    number;           // raw count before any culling
    wasDownsampled: boolean;
    referenceLla:   ReferenceLla;
    imageId:        string;
    sfmClusterUrl:  string;           // primary cluster URL (for reference)
    mapImageLocation?: { lon: number; lat: number };
    diagnostics?: PointCloudDiagnostics;
    clusterCount:   number;           // how many sfm_cluster files were merged
    duplicatesRemoved: number;
    computedImageLocation: { lon: number; lat: number };
}

// Internal: one parsed OpenSfM reconstruction
interface ParsedReconstruction {
    refLla:    ReferenceLla;
    rawPoints: SfmRawPoint[];
    shotIds:   string[];
    _rawRec:   any;   // kept for camera-pose extraction
}

export const POINT_CLOUD_LIMITS = { cacheBytes: 32 * 1024 * 1024, downloads: 2, maxClusters: 64, maxPagesPerBox: 8, maxRawPoints: 1000000, maxDecodedBytes: 64 * 1024 * 1024, requestTimeoutMs: 20000 } as const;
export interface PointCloudDiagnostics {
    requestedClusters: number; loadedClusters: number; failedClusters: number; cacheHits: number; uncachedClusters?: number;
    discoveryFailures: number; budgetLimited: boolean; rawPoints: number; retainedPoints: number;
    rejectedByOrigin: number; croppedPoints: number; duplicatesRemoved: number; partial: boolean;
}

/** Conservative retained-data estimate, not an exact JavaScript heap measurement. */
export class PointCloudClusterCache {
    private entries = new Map<string, { data: ParsedReconstruction[]; bytes: number }>();
    private discovery = new Map<string, { expires: number; value: ClusterDiscovery }>();
    private retainedBytes = 0;
    constructor(readonly maxBytes: number = POINT_CLOUD_LIMITS.cacheBytes) {}
    get bytes(): number { return this.retainedBytes; }
    get size(): number { return this.entries.size; }
    get(url: string): ParsedReconstruction[] | undefined {
        const key = clusterKey(url), item = this.entries.get(key);
        if (!item) return undefined;
        this.entries.delete(key); this.entries.set(key, item); return item.data;
    }
    put(url: string, data: ParsedReconstruction[]) {
        const key = clusterKey(url);
        const bytes = data.reduce((sum, rec) => sum + rec.rawPoints.length * 160 + rec.shotIds.reduce((size, id) => size + id.length * 2 + 256, 0) + 256, 0);
        const previous = this.entries.get(key); if (previous) { this.retainedBytes -= previous.bytes; this.entries.delete(key); }
        if (bytes > this.maxBytes) return false;
        while (this.retainedBytes + bytes > this.maxBytes && this.entries.size) {
            const oldest = this.entries.keys().next().value as string; this.retainedBytes -= this.entries.get(oldest)!.bytes; this.entries.delete(oldest);
        }
        this.entries.set(key, { data, bytes }); this.retainedBytes += bytes; return true;
    }
    getDiscovery(key: string): ClusterDiscovery | undefined {
        const item = this.discovery.get(key); return item && item.expires > Date.now() ? { ...item.value, urls: [...item.value.urls] } : undefined;
    }
    putDiscovery(key: string, value: ClusterDiscovery) {
        if (value.discoveryFailures || value.budgetLimited) return;
        if (this.discovery.size >= 32) this.discovery.delete(this.discovery.keys().next().value as string);
        this.discovery.set(key, { expires: Date.now() + 60000, value: { ...value, urls: [...value.urls] } });
    }
    clear() { this.entries.clear(); this.discovery.clear(); this.retainedBytes = 0; }
}

export function clusterKey(url: string): string {
    try { const parsed = new URL(url); return `${parsed.origin}${parsed.pathname}`; } catch (_) { return url.split('?')[0]; }
}
function checkAbort(signal?: AbortSignal) { if (signal?.aborted) throw new DOMException('Point-cloud load cancelled', 'AbortError'); }
async function cloudFetch(url: string, token?: string, signal?: AbortSignal): Promise<{ ok: boolean; status: number; json(): Promise<any>; arrayBuffer(): Promise<ArrayBuffer> }> {
    checkAbort(signal);
    const controller = new AbortController(); const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, POINT_CLOUD_LIMITS.requestTimeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal, ...(token ? { headers: { Authorization: `OAuth ${token}` } } : {}) });
        // Keep cancellation/timeout live until the response body has finished loading.
        const bytes = await response.arrayBuffer();
        checkAbort(signal);
        return { ok: response.ok, status: response.status, json: async () => JSON.parse(new TextDecoder().decode(bytes)), arrayBuffer: async () => bytes };
    } catch (error) {
        checkAbort(signal);
        if (controller.signal.aborted) throw new Error('Point-cloud request timed out. Retry when the connection improves.');
        throw error;
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
interface ClusterDiscovery { urls: string[]; maxSearchRadius: number; discoveryFailures: number; budgetLimited: boolean; }
function graphPageUrl(next: string): string {
    const url = new URL(next, GRAPH_API.BASE + '/');
    if (url.username || url.password || url.origin !== new URL(GRAPH_API.BASE).origin || url.pathname !== '/images') throw new Error('Unexpected point-cloud pagination destination');
    url.searchParams.delete('access_token'); return url.toString();
}

// Camera pose extracted from an OpenSfM shot
interface CameraPose {
    rotation: number[][];               // 3x3 world-to-camera rotation matrix
    origin:   [number, number, number]; // camera position in ENU metres
}

// Internal helpers

function parseColor(raw: any): [number, number, number] {
    if (!raw) return [160, 160, 160];
    if (Array.isArray(raw) && raw.length >= 3) {
        const [r, g, b] = raw;
        if (r <= 1.0 && g <= 1.0 && b <= 1.0 && (r > 0 || g > 0 || b > 0)) {
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        return [Math.round(r), Math.round(g), Math.round(b)];
    }
    if (typeof raw === 'object' && 'r' in raw) {
        const { r, g, b } = raw;
        if (r <= 1.0 && g <= 1.0 && b <= 1.0) {
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        return [Math.round(r), Math.round(g), Math.round(b)];
    }
    return [160, 160, 160];
}

/** Rodrigues rotation vector -> 3x3 rotation matrix */
function rodrigues([rx, ry, rz]: [number, number, number]): number[][] {
    const theta = Math.sqrt(rx * rx + ry * ry + rz * rz);
    if (theta < 1e-9) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const kx = rx / theta, ky = ry / theta, kz = rz / theta;
    const c = Math.cos(theta), s = Math.sin(theta), t = 1 - c;
    return [
        [t*kx*kx + c,      t*kx*ky - s*kz, t*kx*kz + s*ky],
        [t*kx*ky + s*kz,   t*ky*ky + c,    t*ky*kz - s*kx],
        [t*kx*kz - s*ky,   t*ky*kz + s*kx, t*kz*kz + c   ],
    ];
}

function extractCameraPose(rec: any, shotId: string): CameraPose | null {
    const shot = rec?.shots?.[shotId];
    if (!shot) return null;
    const R = rodrigues(shot.rotation ?? [0, 0, 0]);
    const t: [number, number, number] = shot.translation ?? [0, 0, 0];
    // C = -R^T * t  (world position of camera)
    const origin: [number, number, number] = [
        -(R[0][0]*t[0] + R[1][0]*t[1] + R[2][0]*t[2]),
        -(R[0][1]*t[0] + R[1][1]*t[1] + R[2][1]*t[2]),
        -(R[0][2]*t[0] + R[1][2]*t[1] + R[2][2]*t[2]),
    ];
    return { rotation: R, origin };
}

/**
    * View-frustum test in camera space.
    * OpenSfM camera convention: optical axis = +Z in camera space.
*/
function isInFrustum(
    p:          SfmRawPoint,
    pose:       CameraPose,
    hFovDeg   = 100,
    maxDepthM = 100,
): boolean {
    const { rotation: R, origin } = pose;
    const dx = p.x - origin[0];
    const dy = p.y - origin[1];
    const dz = p.z - origin[2];
    const cx = R[0][0]*dx + R[0][1]*dy + R[0][2]*dz;
    const cy = R[1][0]*dx + R[1][1]*dy + R[1][2]*dz;
    const cz = R[2][0]*dx + R[2][1]*dy + R[2][2]*dz;
    if (cz <= 0 || cz > maxDepthM) return false;
    const tanH = Math.tan((hFovDeg / 2) * (Math.PI / 180));
    return Math.abs(cx / cz) <= tanH && Math.abs(cy / cz) <= tanH * 0.75;
}

export function enuToWgs84(
    p:   SfmRawPoint,
    ref: ReferenceLla
): { lon: number; lat: number; alt: number } {
    const a = 6378137, e2 = 6.6943799901413165e-3;
    const phi = ref.latitude * Math.PI / 180, lambda = ref.longitude * Math.PI / 180;
    const sp = Math.sin(phi), cp = Math.cos(phi), sl = Math.sin(lambda), cl = Math.cos(lambda);
    const n = a / Math.sqrt(1 - e2 * sp * sp), h = ref.altitude || 0;
    const x = (n + h) * cp * cl - sl * p.x - sp * cl * p.y + cp * cl * p.z;
    const y = (n + h) * cp * sl + cl * p.x - sp * sl * p.y + cp * sl * p.z;
    const z = (n * (1 - e2) + h) * sp + cp * p.y + sp * p.z;
    const radius = Math.hypot(x, y);
    let latitude = Math.atan2(z, radius * (1 - e2));
    for (let i = 0; i < 8; i++) {
        const sin = Math.sin(latitude), normal = a / Math.sqrt(1 - e2 * sin * sin);
        latitude = Math.atan2(z + e2 * normal * sin, radius);
    }
    const sin = Math.sin(latitude), normal = a / Math.sqrt(1 - e2 * sin * sin);
    const altitude = Math.abs(Math.cos(latitude)) > 1e-8
        ? radius / Math.cos(latitude) - normal : z / sin - normal * (1 - e2);
    return { lon: Math.atan2(y, x) * 180 / Math.PI, lat: latitude * 180 / Math.PI, alt: altitude };
}

// Step 1a: Fetch primary image metadata (with merge_cc)
export async function fetchPointCloudMeta(
    imageId:     string,
    accessToken: string,
    signal?: AbortSignal
): Promise<PointCloudMeta | null> {

    const tryFetch = async (fields: string) =>
        cloudFetch(`${GRAPH_API.BASE}/${imageId}?fields=${fields}`, accessToken, signal);

    let resp = await tryFetch('sfm_cluster,computed_geometry,geometry,merge_cc');
    if (!resp.ok && resp.status === 500)
        resp = await tryFetch('sfm_cluster,geometry,merge_cc');

    if (!resp.ok) {
        if (resp.status === 404) return null;
        throw new Error(`Graph API ${resp.status} for image ${imageId}`);
    }

    const data = await resp.json();
    if (!data.sfm_cluster?.url) return null;

    const rawGeom = data.geometry?.coordinates;
    if (!rawGeom || !rawGeom.slice(0,2).every(Number.isFinite)) throw new Error(`Image ${imageId} has no geometry`);

    const computed = data.computed_geometry?.coordinates;
    const compGeom = Array.isArray(computed) && computed.length >= 2 && computed.slice(0,2).every(Number.isFinite) ? computed : rawGeom;

    let refLla = data.reference_lla;
    if (!refLla || typeof refLla.latitude !== 'number') refLla = null;

return {
        sfmClusterUrl:  data.sfm_cluster.url,
        referenceLla:   refLla,
        imageLocation:  { lon: compGeom[0], lat: compGeom[1] },
        alignmentShift: { lon: rawGeom[0] - compGeom[0], lat: rawGeom[1] - compGeom[1] },
        imageKey:       String(imageId),
        mergeCC:        data.merge_cc ?? null,
    };
}

// Step 1b: Discover ALL sfm_cluster URLs sharing the same merge_cc

/**
    * Returns every unique sfm_cluster URL belonging to the same connected
    * component as the target image, including the primary one.
    * Strategy:
    *   - Query /images?bbox=... with fields=sfm_cluster,merge_cc
    *   - Keep only images whose merge_cc === targetMergeCC
    *   - Deduplicate cluster URLs (many images share a cluster)
    *   - Expand bbox and retry if clusters were found at the boundary
    * The bbox stays <= 0.01 deg^2 per the Mapillary API limit.
*/
export async function fetchAllClusterUrls(
    primaryUrl: string, imageLocation: { lon: number; lat: number }, targetMergeCC: number | null,
    accessToken: string, neighborLocations: { lon: number; lat: number }[] = [],
    onProgress?: (status: string) => void, signal?: AbortSignal,
): Promise<ClusterDiscovery> {
    // Neighborhood selection remains spatial: no unverified connected-component restriction.
    const urls = new Map<string, string>([[clusterKey(primaryUrl), primaryUrl]]);
    let discoveryFailures = 0, budgetLimited = false;
    const searchDeg = POINT_CLOUD_FETCH_LENGTH / 111320;
    const anchors = [imageLocation, ...neighborLocations.slice(0, 2)];
    for (let anchorIndex = 0; anchorIndex < anchors.length; anchorIndex++) {
        const anchor = anchors[anchorIndex];
        for (const half of [searchDeg * .5, searchDeg]) {
            const lonHalf = Math.min(.04, half / Math.max(.05, Math.cos(anchor.lat * Math.PI / 180)));
            let next = `${GRAPH_API.BASE}/images?fields=sfm_cluster,merge_cc&bbox=${anchor.lon-lonHalf},${anchor.lat-half},${anchor.lon+lonHalf},${anchor.lat+half}&limit=1000`;
            const seen = new Set<string>(); let page = 0;
            while (next) {
                checkAbort(signal);
                if (seen.has(next) || page >= POINT_CLOUD_LIMITS.maxPagesPerBox) { budgetLimited = true; break; }
                seen.add(next); page++;
                try {
                    const response = await cloudFetch(next, accessToken, signal);
                    if (!response.ok) throw new Error(`Point-cloud discovery HTTP ${response.status}`);
                    const json = await response.json();
                    if (!Array.isArray(json.data)) throw new Error('Invalid cluster discovery response');
                    for (const image of json.data) {
                        const url = image.sfm_cluster?.url;
                        if (!url) continue;
                        const key = clusterKey(url);
                        if (!urls.has(key) && urls.size >= POINT_CLOUD_LIMITS.maxClusters) { budgetLimited = true; continue; }
                        urls.set(key, url);
                    }
                    next = json.paging?.next ? graphPageUrl(json.paging.next) : '';
                    onProgress?.(`Scanning nearby coverage · ${urls.size} clusters`);
                } catch (error) { checkAbort(signal); discoveryFailures++; break; }
            }
        }
    }
    return { urls: [...urls.values()], maxSearchRadius: POINT_CLOUD_FETCH_LENGTH, discoveryFailures, budgetLimited };
}

// Step 2: Download + decompress a single cluster URL

export async function downloadAndDecompress(
    url: string, signal?: AbortSignal
): Promise<ParsedReconstruction[]> {
    const resp = await cloudFetch(url, undefined, signal);
    if (!resp.ok) throw new Error(`Point-cloud download HTTP ${resp.status}`);
    const compressed = await resp.arrayBuffer();
    checkAbort(signal);
    const decoded = await decodeClusterInWorker(compressed, signal);
    if (decoded !== null) return decoded;
    checkAbort(signal);
    let decompressed: string;
    try {
        const bytes = pako.inflate(new Uint8Array(compressed));
        checkAbort(signal);
        if (bytes.byteLength > POINT_CLOUD_LIMITS.maxDecodedBytes) throw new Error('Cluster exceeds the decoded-data budget');
        decompressed = new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
        checkAbort(signal);
        throw new Error(`Decompress error: ${error instanceof Error ? error.message : error}`);
    }
    checkAbort(signal);
    return parseReconstructionText(decompressed, parseColor);
}

/** Parse/normalize one reconstruction payload. The color parser is explicit so the same
 * function can run in a worker without depending on bundled/minified outer names. */
function parseReconstructionText(decompressed: string, colorParser: typeof parseColor): ParsedReconstruction[] {
    let parsed: any;
    try {
        parsed = JSON.parse(decompressed);
    } catch (e) {
        throw new Error(`JSON parse error: ${e instanceof Error ? e.message : e}`);
    }

    const reconstructions: any[] = Array.isArray(parsed) ? parsed : [parsed];
    const results: ParsedReconstruction[] = [];

    for (const rec of reconstructions) {
        if (!rec?.reference_lla || ![rec.reference_lla.latitude, rec.reference_lla.longitude, rec.reference_lla.altitude ?? 0].every(Number.isFinite)) {
            console.warn('Skipping reconstruction without reference_lla');
            continue;
        }

        const refLla: ReferenceLla = {
            latitude:  rec.reference_lla.latitude,
            longitude: rec.reference_lla.longitude,
            altitude:  rec.reference_lla.altitude ?? 0,
        };

        const rawPoints: SfmRawPoint[] = [];

        if (rec.points && !Array.isArray(rec.points)) {
            // Normal OpenSfM object-keyed format
            for (const ptId in rec.points) {
                const p = rec.points[ptId];
                if (!p?.coordinates || p.coordinates.length < 3 || !p.coordinates.slice(0,3).every(Number.isFinite)) continue;
                const [r, g, b] = colorParser(p.color);
                rawPoints.push({ x: p.coordinates[0], y: p.coordinates[1], z: p.coordinates[2], r, g, b });
            }
        } else if (Array.isArray(rec.points)) {
            for (const p of rec.points) {
                if (!p || ![p.x,p.y,p.z].every(Number.isFinite)) continue;
                const [r, g, b] = colorParser(p.color ?? [p.r, p.g, p.b]);
                rawPoints.push({ x: p.x, y: p.y, z: p.z, r, g, b });
            }
        }

        if (rawPoints.length > 0) {
            results.push({ refLla, rawPoints, shotIds: rec.shots ? Object.keys(rec.shots) : [], _rawRec: { shots: Object.fromEntries(Object.entries(rec.shots || {}).map(([id, shot]: [string, any]) => [id, { rotation: shot.rotation, translation: shot.translation }])) } });
        }
    }

    return results;
}

/** Native inflate plus JSON/point normalization stays off the UI thread; packed RGB/XYZ
 * buffers avoid a large point-object structured clone back to the caller. No imports or URLs. */
function pointCloudDecodeWorkerSource(): string {
    return `const parseReconstruction = ${parseReconstructionText.toString()};
const colorParser = ${parseColor.toString()};
onmessage = async event => {
    if (typeof DecompressionStream === 'undefined') { postMessage({ unsupported: true }); return; }
    try {
        let text;
        try {
            const header = new Uint8Array(event.data.bytes, 0, Math.min(2, event.data.bytes.byteLength));
            const format = header[0] === 31 && header[1] === 139 ? 'gzip' : 'deflate';
            const stream = new Blob([event.data.bytes]).stream().pipeThrough(new DecompressionStream(format));
            const reader = stream.getReader(), decoder = new TextDecoder('utf-8'), parts = [];
            let size = 0;
            try {
                while (true) {
                    const chunk = await reader.read(); if (chunk.done) break;
                    size += chunk.value.byteLength;
                    if (size > event.data.maxBytes) throw new Error('Cluster exceeds the decoded-data budget');
                    parts.push(decoder.decode(chunk.value, { stream: true }));
                }
                parts.push(decoder.decode()); text = parts.join('');
            } finally { await reader.cancel().catch(() => {}); }
        } catch (error) { throw new Error('Decompress error: ' + (error.message || error)); }
        const records = parseReconstruction(text, colorParser).map(record => {
            const packed = new Float64Array(record.rawPoints.length * 6);
            record.rawPoints.forEach((point, index) => packed.set([point.x,point.y,point.z,point.r,point.g,point.b], index * 6));
            return { refLla: record.refLla, shotIds: record.shotIds, _rawRec: record._rawRec, packed };
        });
        postMessage({ records }, records.map(record => record.packed.buffer));
    } catch (error) { postMessage({ error: String(error.message || error) }); }
};`;
}

let clusterDecodeWorkerUnavailable = false;
/** Caller abort terminates decoding immediately. Unsupported/CSP-blocked workers use the
 * existing pako path; input bytes remain available for that compatibility fallback.
 * Result materialization yields in bounded batches so Cancel remains actionable. */
async function decodeClusterInWorker(bytes: ArrayBuffer, signal?: AbortSignal): Promise<ParsedReconstruction[] | null> {
    checkAbort(signal);
    if (clusterDecodeWorkerUnavailable || typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof DecompressionStream === 'undefined') return null;
    let worker: Worker;
    const url = URL.createObjectURL(new Blob([pointCloudDecodeWorkerSource()], { type: 'text/javascript' }));
    try { worker = new Worker(url); }
    catch { URL.revokeObjectURL(url); clusterDecodeWorkerUnavailable = true; return null; }
    return new Promise((resolve, reject) => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout>;
        const finish = (error?: unknown, result: ParsedReconstruction[] | null = null) => {
            if (settled) return; settled = true;
            clearTimeout(timer); signal?.removeEventListener('abort', abort);
            worker.terminate(); URL.revokeObjectURL(url);
            if (error) reject(error); else resolve(result);
        };
        const abort = () => finish(new DOMException('Point-cloud decoding cancelled', 'AbortError'));
        signal?.addEventListener('abort', abort, { once: true });
        timer = setTimeout(() => finish(new Error('Point-cloud cluster decoding timed out. Reduce the range and retry.')), 60000);
        worker.onmessage = async event => {
            if (settled) return;
            if (event.data.unsupported) { clusterDecodeWorkerUnavailable = true; finish(); return; }
            if (event.data.error) { finish(new Error(event.data.error)); return; }
            try {
                const result: ParsedReconstruction[] = [];
                for (const record of event.data.records) {
                    const points: SfmRawPoint[] = [], packed: Float64Array = record.packed;
                    for (let i = 0; i < packed.length; i += 6) {
                        if (i % 49152 === 0) { checkAbort(signal); await new Promise<void>(done => setTimeout(done, 0)); checkAbort(signal); }
                        points.push({ x: packed[i], y: packed[i+1], z: packed[i+2], r: packed[i+3], g: packed[i+4], b: packed[i+5] });
                    }
                    result.push({ refLla: record.refLla, rawPoints: points, shotIds: record.shotIds, _rawRec: record._rawRec });
                }
                checkAbort(signal); finish(undefined, result);
            } catch (error) { finish(error); }
        };
        worker.onerror = () => { if (settled) return; clusterDecodeWorkerUnavailable = true; finish(); };
        try { worker.postMessage({ bytes, maxBytes: POINT_CLOUD_LIMITS.maxDecodedBytes }); if (signal?.aborted) abort(); }
        catch { clusterDecodeWorkerUnavailable = true; finish(); }
    });
}



// Step 3: Merge reconstructions -> PointCloudPoint[]

function buildMergedPoints(
    allRecs:          ParsedReconstruction[],
    meta:             PointCloudMeta,
    useFrustum:       boolean,
    cropRadiusMeters: number | undefined,   // legacy circular crop (unused when axis params set)
    allAnchors:       { lon: number; lat: number }[] = [],
    skipSanity:       boolean = false,
    maxSearchRadius:  number = 0,
    cropLengthMeters: number | undefined = undefined,  // N-S half-extent (y axis); undefined = unlimited
    cropWidthMeters:  number | undefined = undefined,  // E-W half-extent (x axis); undefined = unlimited
): { points: PointCloudPoint[]; duplicatesRemoved: number; rejectedByOrigin: number; croppedPoints: number } {
    const result: PointCloudPoint[] = [];
    const seen = new Set<string>(); let duplicatesRemoved = 0;
    const useAxisCrop = cropLengthMeters !== undefined || cropWidthMeters !== undefined;
    let rejectedByOrigin = 0, croppedPoints = 0;

    for (const rec of allRecs) {
        // A reference origin is not the extent of its points; do not drop a reconstruction solely for a distant origin.
        // Pre-compute the image's position in this reconstruction's ENU frame (metres).
        // Used for axis-based filtering below — avoids a geo round-trip per point.
        const mPerDegLat = 111320;
        const mPerDegLon = 111320 * Math.cos((rec.refLla.latitude * Math.PI) / 180);
        const imgENU_x = (meta.imageLocation.lon - rec.refLla.longitude) * mPerDegLon;
        const imgENU_y = (meta.imageLocation.lat - rec.refLla.latitude)  * mPerDegLat;

        let pose: CameraPose | undefined;
        if (useFrustum) {
            const shotId =
                rec.shotIds.find(id => id === meta.imageKey) ??
                rec.shotIds.find(id => id.endsWith(meta.imageKey)) ??
                rec.shotIds.find(id => meta.imageKey.endsWith(id));
            if (shotId) pose = extractCameraPose(rec._rawRec, shotId) ?? undefined;
        }

        for (const p of rec.rawPoints) {
            if (pose && !isInFrustum(p, pose)) { croppedPoints++; continue; }
            const { lon, lat, alt } = enuToWgs84(p, rec.refLla);

            if (useAxisCrop) {
                // Axis-based rectangular crop in ENU metres — each dimension is independent.
                // x = East-West (width), y = North-South (length).
                // undefined on either axis means that axis is unlimited.
                const dx = p.x - imgENU_x;  // E-W offset from image location (metres)
                const dy = p.y - imgENU_y;  // N-S offset from image location (metres)
                if (cropWidthMeters  !== undefined && Math.abs(dx) > cropWidthMeters) { croppedPoints++; continue; }
                if (cropLengthMeters !== undefined && Math.abs(dy) > cropLengthMeters) { croppedPoints++; continue; }
            } else if (cropRadiusMeters !== undefined) {
                // Legacy circular crop — kept for callers that do not pass axis params.
                const dist = distanceMeters(
                    lat, lon,
                    meta.imageLocation.lat, meta.imageLocation.lon
                );
                if (dist > cropRadiusMeters) { croppedPoints++; continue; }
            }
            const key = `${lon.toFixed(8)},${lat.toFixed(8)},${alt.toFixed(3)}`;
            if (seen.has(key)) { duplicatesRemoved++; continue; }
            seen.add(key);
            result.push({
                lon:    lon + meta.alignmentShift.lon,
                lat:    lat + meta.alignmentShift.lat,
                rawLon: lon,
                rawLat: lat,
                alt,
                r: p.r, g: p.g, b: p.b,
            });
        }
    }

    return { points: result, duplicatesRemoved, rejectedByOrigin, croppedPoints };

}

/** Worker source uses explicit dependency bindings, independent of bundler export names. */
export function pointCloudWorkerSource(): string {
    return [
        `const enuToWgs84 = ${enuToWgs84.toString()};`,
        `const distanceMeters = ${distanceMeters.toString()};`,
        `const rodrigues = ${rodrigues.toString()};`,
        `const extractCameraPose = ${extractCameraPose.toString()};`,
        `const isInFrustum = ${isInFrustum.toString()};`,
        `const buildMergedPoints = ${buildMergedPoints.toString().replace(/(?:[\w$]+\.)+enuToWgs84/g, 'enuToWgs84').replace(/(?:[\w$]+\.)+distanceMeters/g, 'distanceMeters')};`,
        `onmessage = event => { try { const result = buildMergedPoints(...event.data); const packed = new Float64Array(result.points.length * 8); result.points.forEach((p, i) => packed.set([p.lon,p.lat,p.rawLon,p.rawLat,p.alt,p.r,p.g,p.b],i*8)); result.points = []; postMessage({ result, packed }, [packed.buffer]); } catch (error) { postMessage({ error: String(error.message || error) }); } };`
    ].join('\n');
}
async function processMergedPoints(args: Parameters<typeof buildMergedPoints>, signal?: AbortSignal): Promise<ReturnType<typeof buildMergedPoints>> {
    checkAbort(signal);
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined') return buildMergedPoints(...args);
    let worker: Worker;
    const url = URL.createObjectURL(new Blob([pointCloudWorkerSource()], { type: 'text/javascript' }));
    try { worker = new Worker(url); } catch (_) { URL.revokeObjectURL(url); return buildMergedPoints(...args); }
    return new Promise((resolve, reject) => {
        const finish = () => { worker.terminate(); URL.revokeObjectURL(url); signal?.removeEventListener('abort', abort); clearTimeout(timer); };
        const abort = () => { finish(); reject(new DOMException('Point-cloud processing cancelled', 'AbortError')); };
        const timer = setTimeout(() => { finish(); reject(new Error('Point-cloud processing timed out. Reduce the range and retry.')); }, 60000);
        signal?.addEventListener('abort', abort, { once: true });
        worker.onmessage = async event => {
            if (event.data.error) { finish(); reject(new Error(event.data.error)); return; }
            try {
                const packed: Float64Array = event.data.packed, result = event.data.result;
                for (let i = 0; i < packed.length; i += 8) {
                    if (i % 32768 === 0) { checkAbort(signal); await new Promise<void>(done => setTimeout(done, 0)); }
                    result.points.push({ lon: packed[i], lat: packed[i+1], rawLon: packed[i+2], rawLat: packed[i+3], alt: packed[i+4], r: packed[i+5], g: packed[i+6], b: packed[i+7] });
                }
                finish(); resolve(result);
            } catch (error) { finish(); reject(error); }
        };
        worker.onerror = () => { finish(); reject(new Error('Point-cloud worker failed. Check worker permissions and retry.')); };
        try { worker.postMessage(args); if (signal?.aborted) abort(); } catch (error) { finish(); reject(error); }
    });
}

const corridorIndexes = new WeakMap<PointCloudResult, Map<string, number[]>>();
/** Conservative geographic envelope; exact oriented crop remains in the caller. */
export function pointCloudCandidates(result: PointCloudResult, lon: number, lat: number, length: number, width: number): number[] {
    if (length <= 0 || width <= 0) return result.points.map((_, i) => i);
    const cell = 0.001;
    let index = corridorIndexes.get(result);
    if (!index) {
        index = new Map();
        result.points.forEach((p, i) => { const key = `${Math.floor(p.lon / cell)},${Math.floor(p.lat / cell)}`; const ids = index!.get(key); if (ids) ids.push(i); else index!.set(key, [i]); });
        corridorIndexes.set(result, index);
    }
    const radius = Math.hypot(length, width), dy = radius / 110000;
    const dx = dy / Math.max(0.001, Math.abs(Math.cos(lat * Math.PI / 180)));
    const minX = Math.floor((lon - dx) / cell), maxX = Math.floor((lon + dx) / cell);
    const minY = Math.floor((lat - dy) / cell), maxY = Math.floor((lat + dy) / cell);
    if ((maxX - minX + 1) * (maxY - minY + 1) > 100000) return result.points.map((_, i) => i);
    const ids: number[] = [];
    for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) { const bucket = index.get(`${x},${y}`); if (bucket) for (const id of bucket) ids.push(id); }
    return ids.sort((a, b) => a - b);
}

// Public entry point

/**
    * Load a bounded, paginated neighborhood of SfM clusters and report partial results.
    * @param imageId      Mapillary numeric image ID
    * @param accessToken  OAuth token
    * @param options
    *   frustumCrop:       keep only points inside the camera's view frustum.
    *                      false (default) = full reconstruction cloud (most points).
    *                      true            = only what this camera can see.
    *   cropLengthMeters:  N-S half-extent in metres (undefined = unlimited).
    *                      Controls how far along the road the cloud extends.
    *   cropWidthMeters:   E-W half-extent in metres (undefined = unlimited).
    *                      Controls the corridor width perpendicular to the road.
    *   cropRadiusMeters:  Legacy circular crop — ignored when axis params are set.
*/
export async function loadPointCloud(
    imageId:     string,
    accessToken: string,
    options: {
        signal?: AbortSignal, cache?: PointCloudClusterCache, forceDiscovery?: boolean,
        frustumCrop?:       boolean,
        cropRadiusMeters?:  number,   // legacy; ignored when axis params are set
        cropLengthMeters?:  number,   // N-S half-extent; undefined = unlimited
        cropWidthMeters?:   number,   // E-W half-extent; undefined = unlimited
        onProgress?: (status: string) => void,
        sequenceImages?:   { id: string; lon: number; lat: number }[],
    } = {}
): Promise<PointCloudResult | null> {
    const { frustumCrop = false, cropRadiusMeters, cropLengthMeters, cropWidthMeters, onProgress, sequenceImages = [], signal, cache, forceDiscovery = false } = options;

    onProgress?.("Initializing...");
    const meta = await fetchPointCloudMeta(imageId, accessToken, signal);
    if (!meta) return null;

    // Check 1: If the image itself has no cluster metadata
    if (!meta || !meta.sfmClusterUrl) {
        throw new Error("No 3D metadata exists for this image.");
    }

    // 1. Collect far anchors for the BBOX search (to expand the physical boundaries)
    const bboxAnchors: { lon: number; lat: number }[] =[];
    const currentIdx = sequenceImages.findIndex(img => String(img.id) === String(imageId));

    if (currentIdx >= 0) {
        for (let i = currentIdx - 1; i >= 0; i--) {
            const img = sequenceImages[i];
            if (distanceMeters(img.lat, img.lon, meta.imageLocation.lat, meta.imageLocation.lon) > 150) {
                bboxAnchors.push({ lon: img.lon, lat: img.lat }); break;
            }
        }
        for (let i = currentIdx + 1; i < sequenceImages.length; i++) {
            const img = sequenceImages[i];
            if (distanceMeters(img.lat, img.lon, meta.imageLocation.lat, meta.imageLocation.lon) > 150) {
                bboxAnchors.push({ lon: img.lon, lat: img.lat }); break;
            }
        }
    }

    onProgress?.("Searching clusters...");
    const discoveryKey = `${Math.round(meta.imageLocation.lon*1000000)},${Math.round(meta.imageLocation.lat*1000000)}:${bboxAnchors.map(a=>`${Math.round(a.lon*1000000)},${Math.round(a.lat*1000000)}`).join(';')}`;
    let discovery = !forceDiscovery ? cache?.getDiscovery(discoveryKey) : undefined;
    if (!discovery) {
        discovery = await fetchAllClusterUrls(meta.sfmClusterUrl, meta.imageLocation, meta.mergeCC, accessToken, bboxAnchors, onProgress, signal);
        cache?.putDiscovery(discoveryKey, discovery);
    }
    const { urls: clusterUrls, maxSearchRadius } = discovery;

    if (!clusterUrls || clusterUrls.length === 0) {
        throw new Error("No 3D clusters found in this area.");
    }

    onProgress?.("Mapping nearby images...");

    const allClusterUrls = new Map<string, string>(clusterUrls.map(url => [clusterKey(url), url]));
    allClusterUrls.set(clusterKey(meta.sfmClusterUrl), meta.sfmClusterUrl);

    // 2. NEW: Explicitly sample sequence images every 20 meters.
    // This guarantees we don't miss the clusters representing the car right next to you!
    const denseNeighborIds = new Set<string>();
    if (currentIdx >= 0) {
        let lastDist = 0;
        // Walk backward up to 200m
        for (let i = currentIdx - 1; i >= 0; i--) {
            const img = sequenceImages[i];
            const d = distanceMeters(img.lat, img.lon, meta.imageLocation.lat, meta.imageLocation.lon);
            if (d - lastDist > 20) { denseNeighborIds.add(img.id); lastDist = d; }
            if (d > 200) break;
        }
        lastDist = 0;
        // Walk forward up to 200m
        for (let i = currentIdx + 1; i < sequenceImages.length; i++) {
            const img = sequenceImages[i];
            const d = distanceMeters(img.lat, img.lon, meta.imageLocation.lat, meta.imageLocation.lon);
            if (d - lastDist > 20) { denseNeighborIds.add(img.id); lastDist = d; }
            if (d > 200) break;
        }
    }

    // 3. Batch fetch their metadata in a single HTTP request (Lightning fast)
    const idsArray = Array.from(denseNeighborIds);
    if (idsArray.length > 0) {
        onProgress?.("Fetching local dense clusters...");
        try {
            // Mapillary API allows requesting multiple IDs by comma separation
            const resp = await cloudFetch(`${GRAPH_API.BASE}/?ids=${idsArray.join(',')}&fields=sfm_cluster`, accessToken, signal);
            if (!resp.ok) throw new Error(`Neighbor metadata HTTP ${resp.status}`);
            const data = await resp.json();
            for (const key in data) {
                const url = data[key]?.sfm_cluster?.url;
                if (url && !allClusterUrls.has(clusterKey(url))) {
                    if (allClusterUrls.size < POINT_CLOUD_LIMITS.maxClusters) allClusterUrls.set(clusterKey(url), url);
                    else discovery.budgetLimited = true;
                    // console.log(`[pointCloud] Found local dense cluster from sequence image ${key}`);
                }
            }
        } catch (e) {
            checkAbort(signal); discovery.discoveryFailures++;
        }
    }

    const finalUrls = [meta.sfmClusterUrl, ...[...allClusterUrls.values()].filter(url => clusterKey(url) !== clusterKey(meta.sfmClusterUrl))];
    const allRecs: ParsedReconstruction[] = [];
    // Pin this batch's existing entries before new downloads can evict them.
    const cachedBatch = new Map(finalUrls.map(url => [clusterKey(url), cache?.get(url)]));
    let nextIndex = 0, completed = 0, failedClusters = 0, loadedClusters = 0, cacheHits = 0, uncachedClusters = 0, rawPoints = 0;
    let budgetLimited = discovery.budgetLimited;
    const loadOne = async (url: string) => {
            checkAbort(signal);
            try {
                let recs = cachedBatch.get(clusterKey(url)); cachedBatch.delete(clusterKey(url));
                if (recs) cacheHits++;
                else { recs = await downloadAndDecompress(url, signal); if (recs.length && cache?.put(url, recs) === false) uncachedClusters++; }
                checkAbort(signal);
                if (!recs.length) throw new Error('Empty reconstruction');
                const count = recs.reduce((sum, rec) => sum + rec.rawPoints.length, 0);
                if (rawPoints + count > POINT_CLOUD_LIMITS.maxRawPoints) { budgetLimited = true; return; }
                rawPoints += count; allRecs.push(...recs); loadedClusters++;
            } catch (error) { checkAbort(signal); failedClusters++; if ((error as Error).message?.includes('budget')) budgetLimited = true; }
            finally { completed++; onProgress?.(`Clusters ${completed}/${finalUrls.length} ${cacheHits ? `· ${cacheHits} cached clusters` : ""}`); }
    };
    // Retain the selected frame's primary source before spending the working-set budget on neighbors.
    await loadOne(finalUrls[0]); nextIndex = 1;
    const worker = async () => {
        while (nextIndex < finalUrls.length) { checkAbort(signal); await loadOne(finalUrls[nextIndex++]); }
    };
    await Promise.all(Array.from({ length: Math.min(POINT_CLOUD_LIMITS.downloads, finalUrls.length) }, worker));
    checkAbort(signal);
    if (!allRecs.length) throw new Error('No point-cloud clusters could be loaded within the data budget. Check access/connection and retry.');

    onProgress?.("Processing points...");
    let { points, duplicatesRemoved, rejectedByOrigin, croppedPoints } = await processMergedPoints([
        allRecs, meta, frustumCrop, cropRadiusMeters, bboxAnchors, false, maxSearchRadius, cropLengthMeters, cropWidthMeters
    ], signal);

    if (frustumCrop && points.length === 0) {
        ({ points, duplicatesRemoved } = await processMergedPoints([
            allRecs, meta, false, cropRadiusMeters, bboxAnchors, false, maxSearchRadius, cropLengthMeters, cropWidthMeters
        ], signal));
    }

    if (points.length === 0) throw new Error('The loaded clusters contain no points in the requested corridor. Retry or adjust the range.');

    return {
        points,
        totalPoints: allRecs.reduce((s, r) => s + r.rawPoints.length, 0),
        wasDownsampled: false,
        referenceLla: allRecs[0].refLla,
        imageId,
        sfmClusterUrl: meta.sfmClusterUrl,
        clusterCount: loadedClusters,
        diagnostics: { requestedClusters: finalUrls.length, loadedClusters, failedClusters, cacheHits, uncachedClusters, discoveryFailures: discovery.discoveryFailures, budgetLimited, rawPoints, retainedPoints: points.length, rejectedByOrigin, croppedPoints, duplicatesRemoved, partial: !!(failedClusters || discovery.discoveryFailures || budgetLimited) },
        duplicatesRemoved,
        mapImageLocation: { lon: meta.imageLocation.lon + meta.alignmentShift.lon, lat: meta.imageLocation.lat + meta.alignmentShift.lat },
        computedImageLocation: meta.imageLocation
    };
}
export interface PointCloudFeature { attributes: Record<string, any>; geometry?: any; }
/** Stable ObjectIDs identify the original point; filtered pointIndex remains aligned with viewer picking. */
export function diffPointCloudFeatures(previous: Map<number, PointCloudFeature>, next: PointCloudFeature[]) {
    const logicalId = (feature: PointCloudFeature) => Number.isFinite(feature.attributes.originalIndex) ? feature.attributes.originalIndex + 1 : feature.attributes.ObjectID;
    const ids = new Set(next.map(logicalId));
    const addFeatures: PointCloudFeature[] = [], updateFeatures: PointCloudFeature[] = [], deleteFeatures: PointCloudFeature[] = [];
    for (const [id, feature] of previous) if (!ids.has(id)) deleteFeatures.push({ attributes: { ObjectID: feature.attributes.ObjectID, originalIndex: feature.attributes.originalIndex } });
    for (const feature of next) {
        const old = previous.get(logicalId(feature));
        if (!old) addFeatures.push(feature);
        else {
            // Client-side adds generate ObjectIDs. Preserve their confirmed IDs on updates/deletes.
            const update = { ...feature, attributes: { ...feature.attributes, ObjectID: old.attributes.ObjectID } };
            if (JSON.stringify(old.geometry) !== JSON.stringify(update.geometry) || JSON.stringify(old.attributes) !== JSON.stringify(update.attributes)) updateFeatures.push(update);
        }
    }
    return { addFeatures, updateFeatures, deleteFeatures };
}

export function summarizePointCloud(result: PointCloudResult, visible: number): string {
    const d = result.diagnostics;
    return `${d?.loadedClusters ?? result.clusterCount}/${d?.requestedClusters ?? result.clusterCount} clusters · ${(d?.rawPoints ?? result.totalPoints).toLocaleString()} raw · ${result.points.length.toLocaleString()} retained · ${visible.toLocaleString()} visible${d?.cacheHits ? ` · ${d.cacheHits} cached clusters` : ""}${d?.uncachedClusters ? ` · ${d.uncachedClusters} oversized clusters not cached` : ""}${d?.partial ? ` · Partial: ${d.failedClusters} failed, ${d.discoveryFailures} search failures${d.budgetLimited ? ', data budget reached' : ''}` : ' · bounded search loaded'}`;
}

/** Display-only filter. Original indices and stored geometry are never changed. */
export function pointCloudDisplayExpression(count: number, adaptive: boolean, moving: boolean, toolsActive: boolean, groundHeight?: number): string {
    const ground = groundHeight === undefined ? '1=1' : `relativeHeight < ${groundHeight}`;
    const stride = adaptive && moving && !toolsActive ? Math.max(1, Math.ceil(count / 20000)) : 1;
    return stride > 1 ? `(${ground}) AND MOD(originalIndex, ${stride}) = 0` : ground;
}

export function pointCloudCorridorCount(result: PointCloudResult, lon: number, lat: number, bearing: number, length: number, width: number, stopAfter = Infinity): number {
    const rad = bearing * Math.PI / 180, sin = Math.sin(rad), cos = Math.cos(rad), metresLon = 111320 * Math.cos(lat * Math.PI / 180);
    let count = 0;
    for (const p of result.points) {
        const dx = (p.lon - lon) * metresLon, dy = (p.lat - lat) * 111320;
        if (width > 0 && Math.abs(dx * cos - dy * sin) > width) continue;
        if (length > 0 && Math.abs(dx * sin + dy * cos) > length) continue;
        if (++count > stopAfter) break;
    }
    return count;
}

/** Binary PLY, local metric ENU; source height datum is deliberately not asserted. */
export async function buildPointCloudPly(points: PointCloudPoint[], nudgeX = 0, nudgeY = 0, nudgeZ = 0, cameraLatitude?: number): Promise<Blob> {
    if (!points.length) throw new Error('No points to export');
    const radians = Math.PI / 180, latitude = cameraLatitude ?? points[0].lat;
    const dLat = nudgeY / 111320, dLon = nudgeX / (111320 * Math.max(1e-8, Math.abs(Math.cos(latitude * radians))));
    const origin = { lon: points[0].lon + dLon, lat: points[0].lat + dLat, alt: points[0].alt + nudgeZ };
    const ecef = (lon: number, lat: number, height: number) => { const phi=lat*radians, lambda=lon*radians, n=6378137/Math.sqrt(1-6.6943799901413165e-3*Math.sin(phi)**2); return [(n+height)*Math.cos(phi)*Math.cos(lambda),(n+height)*Math.cos(phi)*Math.sin(lambda),(n*(1-6.6943799901413165e-3)+height)*Math.sin(phi)]; };
    const base=ecef(origin.lon,origin.lat,origin.alt), phi=origin.lat*radians, lambda=origin.lon*radians;
    const buffer=new ArrayBuffer(points.length*27), data=new DataView(buffer);
    for(let i=0;i<points.length;i++) {
        if(i && i%4096===0) await new Promise<void>(resolve=>setTimeout(resolve,0));
        const p=points[i], xyz=ecef(p.lon+dLon,p.lat+dLat,p.alt+nudgeZ), dx=xyz[0]-base[0],dy=xyz[1]-base[1],dz=xyz[2]-base[2],offset=i*27;
        data.setFloat64(offset,-Math.sin(lambda)*dx+Math.cos(lambda)*dy,true);
        data.setFloat64(offset+8,-Math.sin(phi)*Math.cos(lambda)*dx-Math.sin(phi)*Math.sin(lambda)*dy+Math.cos(phi)*dz,true);
        data.setFloat64(offset+16,Math.cos(phi)*Math.cos(lambda)*dx+Math.cos(phi)*Math.sin(lambda)*dy+Math.sin(phi)*dz,true);
        const colors=[p.r??160,p.g??160,p.b??160],scale=colors.every(c=>c<=1)&&colors.some(c=>c>0)?255:1;
        colors.forEach((c,j)=>data.setUint8(offset+24+j,Math.max(0,Math.min(255,Math.round(c*scale)))));
    }
    const header=`ply\nformat binary_little_endian 1.0\ncomment coordinate_frame local_ENU_meters\ncomment geographic_origin ${origin.lon} ${origin.lat} ${origin.alt}\ncomment horizontal_reference WGS84\ncomment altitude_reference source_SfM_datum_not_verified\ncomment includes_alignment_and_nudge_not_terrain_drape\nelement vertex ${points.length}\nproperty double x\nproperty double y\nproperty double z\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nend_header\n`;
    return new Blob([header,buffer],{type:'application/octet-stream'});
}

/** LAS 1.2 / format 2: projected WGS84 UTM, RGB, millimeter quantization.
 * Heights retain the source SfM datum; no vertical CRS is asserted.
 */
export async function buildPointCloudLas(points: PointCloudPoint[], nudgeX = 0, nudgeY = 0, nudgeZ = 0, cameraLatitude?: number): Promise<Blob> {
    if (!points.length || points.length > 0xffffffff) throw new Error('Invalid LAS point count');
    const rad = Math.PI / 180, latitude = cameraLatitude ?? points[0].lat;
    const dLat = nudgeY / 111320, dLon = nudgeX / (111320 * Math.max(1e-8, Math.abs(Math.cos(latitude * rad))));
    const originLon = points[0].lon + dLon, originLat = points[0].lat + dLat;
    let zone = Math.max(1, Math.min(60, Math.floor((originLon + 180) / 6) + 1));
    if (originLat >= 56 && originLat < 64 && originLon >= 3 && originLon < 12) zone = 32;
    if (originLat >= 72 && originLat < 84 && originLon >= 0 && originLon < 42) zone = originLon < 9 ? 31 : originLon < 21 ? 33 : originLon < 33 ? 35 : 37;
    const north = originLat >= 0, epsg = (north ? 32600 : 32700) + zone;
    const project = (p: PointCloudPoint): number[] => {
        const lon = p.lon + dLon, lat = p.lat + dLat, height = p.alt + nudgeZ;
        if (![lon, lat, height].every(Number.isFinite) || lat < -80 || lat >= 84 || lon < -180 || lon > 180) throw new Error('Points outside UTM coverage');
        const phi = lat * rad, delta = (lon - (zone * 6 - 183)) * rad;
        if (Math.abs(delta) > 12 * rad) throw new Error('Cloud spans too many UTM zones');
        const e2 = 6.6943799901413165e-3, ep2 = e2 / (1 - e2), sin = Math.sin(phi), cos = Math.cos(phi), tan = Math.tan(phi);
        const n = 6378137 / Math.sqrt(1 - e2 * sin * sin), t = tan * tan, c = ep2 * cos * cos, a = cos * delta;
        const m = 6378137 * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * phi
            - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * phi)
            + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * phi) - 35 * e2 ** 3 / 3072 * Math.sin(6 * phi));
        return [500000 + 0.9996 * n * (a + (1 - t + c) * a ** 3 / 6 + (5 - 18 * t + t * t + 72 * c - 58 * ep2) * a ** 5 / 120),
            (north ? 0 : 10000000) + 0.9996 * (m + n * tan * (a * a / 2 + (5 - t + 9 * c + 4 * c * c) * a ** 4 / 24 + (61 - 58 * t + t * t + 600 * c - 330 * ep2) * a ** 6 / 720)), height];
    };
    const offsets = project(points[0]).map(Math.floor), scale = 0.001;
    const metadata = new TextEncoder().encode('Source SfM height datum unverified; alignment and nudge included; no terrain drape or vertical CRS.\0');
    const pointOffset = 227 + 54 + 40 + 54 + metadata.length;
    const buffer = new ArrayBuffer(pointOffset + points.length * 26), data = new DataView(buffer);
    const ascii = (offset: number, text: string, length: number) => { for (let i = 0; i < Math.min(text.length, length); i++) data.setUint8(offset + i, text.charCodeAt(i)); };
    ascii(0, 'LASF', 4); data.setUint8(24, 1); data.setUint8(25, 2);
    ascii(26, 'Mapillary Explorer', 32); ascii(58, 'Mapillary Explorer LAS export', 32);
    data.setUint16(94, 227, true); data.setUint32(96, pointOffset, true); data.setUint32(100, 2, true);
    data.setUint8(104, 2); data.setUint16(105, 26, true); data.setUint32(107, points.length, true); data.setUint32(111, points.length, true);
    for (let axis = 0; axis < 3; axis++) { data.setFloat64(131 + axis * 8, scale, true); data.setFloat64(155 + axis * 8, offsets[axis], true); }
    // GeoTIFF key directory VLR, standard LAS CRS encoding for versions 1.0–1.3.
    ascii(229, 'LASF_Projection', 16); data.setUint16(245, 34735, true); data.setUint16(247, 40, true); ascii(249, 'WGS84 UTM horizontal CRS', 32);
    const keys = [1, 1, 0, 4, 1024, 0, 1, 1, 1025, 0, 1, 1, 2048, 0, 1, 4326, 3072, 0, 1, epsg];
    keys.forEach((value, index) => data.setUint16(281 + index * 2, value, true));
    const second = 321; ascii(second + 2, 'Mapillary', 16); data.setUint16(second + 18, 65000, true); data.setUint16(second + 20, metadata.length, true); ascii(second + 22, 'Source height and alignment', 32);
    new Uint8Array(buffer, second + 54, metadata.length).set(metadata);
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < points.length; i++) {
        if (i && i % 4096 === 0) await new Promise<void>(resolve => setTimeout(resolve, 0));
        const p = points[i], xyz = project(p), offset = pointOffset + i * 26;
        for (let axis = 0; axis < 3; axis++) {
            const integer = Math.round((xyz[axis] - offsets[axis]) / scale);
            if (integer < -2147483648 || integer > 2147483647) throw new Error('LAS coordinate exceeds millimeter range');
            data.setInt32(offset + axis * 4, integer, true);
            const value = integer * scale + offsets[axis]; min[axis] = Math.min(min[axis], value); max[axis] = Math.max(max[axis], value);
        }
        data.setUint8(offset + 14, 9); // First and only return.
        data.setUint8(offset + 15, 1); // Unclassified reconstructed point, not ground.
        const colors = [p.r ?? 160, p.g ?? 160, p.b ?? 160], factor = colors.every(c => c <= 1) && colors.some(c => c > 0) ? 255 : 1;
        colors.forEach((value, channel) => data.setUint16(offset + 20 + channel * 2, Math.max(0, Math.min(255, Math.round(value * factor))) * 257, true));
    }
    for (let axis = 0; axis < 3; axis++) { data.setFloat64(179 + axis * 16, max[axis], true); data.setFloat64(187 + axis * 16, min[axis], true); }
    return new Blob([buffer], { type: 'application/octet-stream' });
}
