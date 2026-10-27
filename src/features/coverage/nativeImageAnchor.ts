import type { SequenceFeatureIndex } from './SequenceTileIndex';
import { nativeCoverageOffsetMeters } from './nativeCoverageAlignment';

/** Resolve one ID from already indexed immutable bytes, without scanning a sequence
 * or consulting API geometry. The result is the native circle's presentation center.
 */
export function nativeImageAnchor(buffer: ArrayBuffer, index: SequenceFeatureIndex,
  decode: (buffer: ArrayBuffer) => { layers: Record<string, any> },
  tile: [number, number, number], imageId: string): { x: number; y: number } | null {
  const position = index.imageIndex(imageId);
  if (position === undefined) return null;
  const feature = decode(buffer).layers.image?.feature(position);
  if (!feature || String(feature.properties.id) !== imageId) return null;
  const point = feature.loadGeometry()[0]?.[0], extent = feature.extent || 4096;
  if (!point || point.x < 0 || point.y < 0 || point.x >= extent || point.y >= extent) return null;
  const [x, y, z] = tile, world = 2 * Math.PI * 6378137, span = world / 2 ** z;
  const offset = nativeCoverageOffsetMeters(z);
  return { x: (x + point.x / extent) * span - world / 2 + offset,
    y: world / 2 - (y + point.y / extent) * span - offset };
}
