/** Imagery-loading presentation. Preserve style-tag placement and reduced-motion rules. */
export function getImageryLoadingOverlayStyle(hasImage: boolean) { return { position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: hasImage ? "flex-end" : "center", paddingBottom: hasImage ? 18 : 0, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box", zIndex: 9999, pointerEvents: "none" } as const; }

export const imageryLoadingAnimationCss = `
        @keyframes mly-imagery-spin { to { transform: rotate(360deg); } }
        .mly-imagery-spinner { animation: mly-imagery-spin 850ms linear infinite; }
        @media (prefers-reduced-motion: reduce) { .mly-imagery-spinner { animation: none; } }
      `;

export const imageryLoadingCardStyle = { display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", maxWidth: "100%", boxSizing: "border-box", borderRadius: 9, border: "1px solid #78c79e35", background: "rgba(15,28,24,0.94)", color: "#e0eee5", boxShadow: "0 4px 16px #0003" } as const;

export const imagerySpinnerStyle = { width: 15, height: 15, flexShrink: 0, border: "2px solid #68c99430", borderTopColor: "#72d8a0", borderRadius: "50%" } as const;

export const imageryLoadingTextStyle = { minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12, fontWeight: 500 } as const;
