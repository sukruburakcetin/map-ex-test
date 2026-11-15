import type { PointCloudProjection } from './PointCloudViewerRenderer';

/** SVG lasso vertices use canvas CSS pixels, not device pixels. */
export type LassoVertex = [number, number];
export interface LassoProjectedPoint { rawLon: number; rawLat: number; alt: number; }
export type LassoToEnu = (lon: number, lat: number, altitude: number, referenceLon: number, referenceLat: number, referenceAltitude: number) => number[];

/** Return indices in the filtered viewer array without mutating points, polygon or matrices.
 * Raw WGS84 degrees/source altitude become ENU using the last rendered reference.
 * The existing matrix/ray-casting math, behind-camera test and 1.2 NDC padding are
 * preserved. Map IDs must be resolved separately through confirmed map-owner mappings.
 */
export function selectLassoIndices(points: readonly LassoProjectedPoint[], lassoPolygon: LassoVertex[], projection: PointCloudProjection, width: number, height: number, toEnu: LassoToEnu): number[] {
    const viewMat = projection.viewMatrix;
    const projMat = projection.projectionMatrix;
    const ref = projection.reference;
    const selectedIndices: number[] = [];

    // Manual 4x4 Matrix by 4x1 Vector multiplication (Required for WebGL coordinate projection)
    const transform = (m: Float32Array, v: number[]) => {
      return [
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
      ];
    };

    // Ray-casting algorithm for Point in Polygon check
    const pointInPolygon = (point: number[], vs: [number, number][]) => {
      let x = point[0],
        y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0],
          yi = vs[i][1];
        let xj = vs[j][0],
          yj = vs[j][1];
        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Mathematically project all 3D map points back onto the 2D Screen
    points.forEach((p, idx) => {
      // 1. Convert WGS84 to local ENU (East-North-Up) relative to the camera
      const enuCoords = toEnu(p.rawLon, p.rawLat, p.alt, ref.lng, ref.lat, ref.alt);
      // 2. Project into camera view space
      const vView = transform(viewMat, [enuCoords[0], enuCoords[1], enuCoords[2], 1.0]);
      // 3. Project into clip space
      const vClip = transform(projMat, vView);

      // If W (vClip[3]) is negative, the point is physically behind the camera's FOV
      if (vClip[3] <= 0) return; // Point is behind camera

      // 4. Perspective Divide to get Normalized Device Coordinates (NDC: -1.0 to 1.0)
      const ndcX = vClip[0] / vClip[3];
      const ndcY = vClip[1] / vClip[3];

      // Reject points way off screen (slight padding allowed for edge-drawing)
      if (ndcX < -1.2 || ndcX > 1.2 || ndcY < -1.2 || ndcY > 1.2) return;

      // 5. Convert NDC to actual screen pixels
      const screenX = ((ndcX + 1) * width) / 2;
      const screenY = ((1 - ndcY) * height) / 2;

      // 6. Test if screen pixel is inside the user's drawn shape
      if (pointInPolygon([screenX, screenY], lassoPolygon)) {
        selectedIndices.push(idx);
      }
    });

    return selectedIndices;
}
