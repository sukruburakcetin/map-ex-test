/** Imagery-loading presentation. Preserve style-tag placement and reduced-motion rules. */
export function getImageryLoadingOverlayStyle(hasImage: boolean) { return { position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: hasImage ? "flex-end" : "center", paddingBottom: hasImage ? "var(--mly-imagery-bottom-inset, 18px)" : 0, paddingInline: "clamp(8px, 3cqw, 16px)", boxSizing: "border-box", zIndex: 9999, pointerEvents: "none" } as const; }

export const imageryLoadingAnimationCss = `
@container (max-width: 480px) {
  .mly-imagery-loading-overlay { --mly-imagery-bottom-inset: 54px; }
}

.mly-imagery-cancel { pointer-events:auto; background:var(--mly-theme-control, rgba(131,201,165,.10)); border:1px solid var(--mly-theme-border, rgba(131,201,165,.35)); border-radius:7px; color:var(--mly-theme-text, #d4eadc); padding:7px 12px; font:inherit; cursor:pointer; min-height:44px; }
.mly-imagery-cancel:hover { background:var(--mly-theme-hover, rgba(131,201,165,.20)); }
.mly-imagery-cancel:focus-visible { outline:2px solid #83c9a5; outline-offset:2px; }

        @keyframes mly-imagery-spin { to { transform: rotate(360deg); } }
        .mly-imagery-spinner { animation: mly-imagery-spin 850ms linear infinite; }
        @media (prefers-reduced-motion: reduce) { .mly-imagery-spinner { animation: none; } }
      `;

export const imageryLoadingCardStyle = { display: "flex", alignItems: "center", gap: "clamp(5px, 1.5cqw, 9px)", padding: "clamp(5px, 1.7cqw, 10px) clamp(8px, 2.4cqw, 14px)", maxWidth: "min(100%, 420px)", minWidth: 0, fontSize: "clamp(11px, 2.8cqw, 12px)", boxSizing: "border-box", borderRadius: 9, border: "1px solid var(--mly-theme-border, #78c79e35)", background: "var(--mly-theme-chrome, rgba(15,28,24,0.94))", color: "var(--mly-theme-text, #e0eee5)", boxShadow: "0 4px 16px #0003" } as const;

export const imagerySpinnerStyle = { width: 15, height: 15, flexShrink: 0, border: "2px solid #68c99430", borderTopColor: "#72d8a0", borderRadius: "50%" } as const;

export const imageryLoadingTextStyle = { minWidth: 0, whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.25, fontWeight: 500 } as const;
