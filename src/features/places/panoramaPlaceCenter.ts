/** Mapillary spherical projection of a horizontal ENU direction, including camera tilt/roll.
 * Matches the installed SDK's Rodrigues world-to-camera rotation and basic-coordinate mapping.
 * Does not estimate POI altitude, visibility or a building entrance.
 */
export function panoramaPlaceCenter(image: any, bearing: number): [number, number] | null {
  const rotation = image.rotation, width = image.width, height = image.height, orientation = image.exifOrientation ?? 1;
  if (!Array.isArray(rotation) || rotation.length !== 3 || !rotation.every((n: unknown) => typeof n === 'number' && Number.isFinite(n)) || !Number.isFinite(bearing) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || ![1, 3, 6, 8].includes(orientation)) return null;
  const theta = Math.hypot(...rotation), radians = bearing * Math.PI / 180;
  const v = [Math.sin(radians), Math.cos(radians), 0];
  let camera = v;
  if (theta > 0) {
    const [x, y, z] = rotation.map((n: number) => n / theta), [vx, vy, vz] = v;
    const cosine = Math.cos(theta), sine = Math.sin(theta), dot = x * vx + y * vy + z * vz;
    camera = [vx * cosine + (y * vz - z * vy) * sine + x * dot * (1 - cosine),
      vy * cosine + (z * vx - x * vz) * sine + y * dot * (1 - cosine),
      vz * cosine + (x * vy - y * vx) * sine + z * dot * (1 - cosine)];
  }
  const sfmX = Math.atan2(camera[0], camera[2]) / (2 * Math.PI);
  const sfmY = Math.atan2(camera[1], Math.hypot(camera[0], camera[2])) / (2 * Math.PI);
  const span = Math.max(width, height), x = .5 + sfmX * span / width, y = .5 + sfmY * span / height;
  const basic = orientation === 3 ? [1 - x, 1 - y] : orientation === 6 ? [1 - y, x] : orientation === 8 ? [y, 1 - x] : [x, y];
  return basic.every(Number.isFinite) ? [Math.min(1, Math.max(0, basic[0])), Math.min(1, Math.max(0, basic[1]))] : null;
}
