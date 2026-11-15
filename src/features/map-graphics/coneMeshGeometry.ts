/** Closed, outward-wound wedge in local east/north/up metres. The shared apex,
 * upper arc and lower arc give each mesh edge exactly two incident triangles.
 * Local vertex space anchors the whole solid to the layer's ground placement;
 * faces cannot drift apart through independent polygon triangulation/draping.
 */
export function coneMeshGeometry(center: { x: number; y: number }, heading: number, radius: number, spread: number) {
 const segments = Math.max(8, Math.ceil(spread / 2));
 const position: number[] = [0, 0, 0];
 const rise = Math.min(radius * 0.15, 1.5);
 for (let i = 0; i <= segments; i++) {
  const degrees = heading - spread / 2 + spread * i / segments;
  const angle = degrees * Math.PI / 180;
  position.push(radius * Math.sin(angle), radius * Math.cos(angle), Math.min(0.08, radius * 0.008) + rise * Math.cos((degrees - heading) * Math.PI / 180));
 }
 for (let i = 0; i <= segments; i++) position.push(position[3 * (i + 1)], position[3 * (i + 1) + 1], 0);
 const upper = (i: number) => i + 1;
 const lower = (i: number) => segments + 2 + i;
 const top: number[] = [], walls: number[] = [], bottom: number[] = [];
 for (let i = 0; i < segments; i++) {
  const a = upper(i), b = upper(i + 1), c = lower(i), d = lower(i + 1);
  top.push(0, b, a);
  bottom.push(0, c, d);
  walls.push(a, b, c, b, d, c);
 }
 walls.push(0, upper(0), lower(0), 0, lower(segments), upper(segments));
 const material = (color: number[]) => ({ color, alphaMode: 'blend' as const, doubleSided: false });
 return { type: 'mesh' as const, spatialReference: { wkid: 3857 },
  vertexSpace: { type: 'local' as const, origin: [center.x, center.y, 0] },
  vertexAttributes: { position }, components: [
   { faces: top, shading: 'flat' as const, material: material([255, 165, 0, 0.25]) },
   { faces: walls, shading: 'flat' as const, material: material([220, 120, 0, 0.2]) },
   { faces: bottom, shading: 'flat' as const, material: material([220, 120, 0, 0.2]) },
  ] };
}
