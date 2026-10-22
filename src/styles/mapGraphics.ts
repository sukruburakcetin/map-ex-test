/** DOM presentation for map graphics; SDK symbols stay with their graphics owners. */

/** Preserve the screen-projected pulse overlay layout and supplied RGBA color. */
export function selectionPulseOverlayStyle(baseColor: readonly number[]): Partial<CSSStyleDeclaration> {
 return { position: "absolute", pointerEvents: "none", zIndex: "10", width: "10px", height: "10px", border: "2px solid white", borderRadius: "50%", boxSizing: "border-box", background: `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${baseColor[3] ?? 1})`, transform: "translate(-50%, -50%)", display: "none" };
}
