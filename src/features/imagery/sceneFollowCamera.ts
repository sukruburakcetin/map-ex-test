/** Translate the existing scene camera instead of asking goTo to solve center/zoom over terrain. */
export interface FollowCameraPosition { longitude: number | null | undefined; latitude: number | null | undefined; z: number | null | undefined; }
export interface FollowCamera<C> { position: FollowCameraPosition; clone(): C; }
export interface SceneFollowView<C> {
  camera: C;
  width: number;
  height: number;
  center?: { longitude: number | null | undefined; latitude: number | null | undefined } | null;
  toMap(point: { x: number; y: number }): { longitude: number | null | undefined; latitude: number | null | undefined } | null | undefined;
}

/** Move the camera by the image-to-focus horizontal delta while retaining its cloned pose and altitude.
 * Use the actual center ray (and the view center if it misses). No elevation query, zoom fitting or
 * persistent zoom lock is introduced, so manual camera changes remain the next frame's starting point.
 */
export function sceneFollowCamera<C extends FollowCamera<C>>(view: SceneFollowView<C>, lon: number, lat: number): C | null {
  const focus = view.toMap({ x: view.width / 2, y: view.height / 2 }) || view.center;
  const position = view.camera.position;
  if (!focus || ![lon, lat, focus.longitude, focus.latitude, position.longitude, position.latitude, position.z].every(Number.isFinite)) return null;
  const deltaLon = ((lon - (focus.longitude as number) + 540) % 360) - 180;
  const latitude = (position.latitude as number) + lat - (focus.latitude as number);
  if (latitude < -90 || latitude > 90) return null;
  const camera = view.camera.clone();
  camera.position.longitude = (((position.longitude as number) + deltaLon + 540) % 360) - 180;
  camera.position.latitude = latitude;
  return camera;
}
