/** Upper screen-footprint bound only; preserves the requested radius when it fits.
 * Sample the arc's top and ground edges so shallow/rolled cameras cannot hide width
 * behind a short projected centreline. At most 45 local projections; no iteration loop.
 */
export function capConeFootprint(radius: number, spread: number, scene: boolean, maxPixels: number,
  project: (distance: number, offsetDegrees: number, up: number) => { x: number; y: number } | null): number | null {
  if (![radius, spread, maxPixels].every(Number.isFinite) || radius <= 0 || spread <= 0 || spread >= 180 || maxPixels <= 0) return null;
  const footprint = (r: number): number | null => {
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    const include = (p: { x: number; y: number } | null) => {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;
      left = Math.min(left, p.x); right = Math.max(right, p.x); top = Math.min(top, p.y); bottom = Math.max(bottom, p.y); return true;
    };
    if (!include(project(0, 0, 0))) return null;
    for (let i = 0; i <= 6; i++) {
      const offset = -spread / 2 + spread * i / 6;
      if (!include(project(r, offset, 0))) return null;
      if (scene && !include(project(r, offset, Math.min(0.08, r * 0.008) + Math.min(r * 0.15, 1.5) * Math.cos(offset * Math.PI / 180)))) return null;
    }
    return Math.max(right - left, bottom - top);
  };
  let result = radius;
  // Two bounded shrink corrections plus a final verification, allowing 5% sampling margin.
  for (let pass = 0; pass < 3; pass++) {
    const pixels = footprint(result);
    if (pixels === null) return null;
    if (pixels <= maxPixels * 0.95) return result;
    result *= maxPixels * 0.9 / pixels;
  }
  // Projection near the camera plane can remain unstable. Hide rather than draw a huge wedge.
  return 0;
}
