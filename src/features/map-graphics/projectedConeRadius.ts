/** Size a 3D direction indicator from its projected ground length in CSS pixels.
 * Keep the requested close-view radius; enlarge toward 60 px at distance, bounded
 * by 2048x and 12,000 ground metres. Hide an indicator shorter than 6 px at that cap.
 * Projection uses the current camera/terrain, not SceneView's zoom number.
 * A missing/invalid terrain projection returns null so the caller can use its fallback.
 */
export function projectedConeRadius(radius: number, project: (metres: number) => { x: number; y: number } | null): number | null {
 const start = project(0), tip = project(radius);
 const valid = (p: { x: number; y: number } | null) => !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
 if (!valid(start) || !valid(tip)) return null;
 const length = Math.hypot(tip!.x - start!.x, tip!.y - start!.y);
 if (length < 0.001) return null;
 const cap = Math.max(radius, Math.min(radius * 2048, 12000));
 let result = Math.max(radius, Math.min(cap, radius * 60 / length));
 const projected = project(result);
 if (!valid(projected)) return null;
 const actual = Math.hypot(projected!.x - start!.x, projected!.y - start!.y);
 if (actual < 6 && result >= cap) return 0;
 // One bounded correction accommodates perspective without iterative layout work.
 if (actual > 0) result = Math.max(radius, Math.min(cap, result * 60 / actual));
 return result;
}
