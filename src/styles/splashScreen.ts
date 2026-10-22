/** Intro presentation and heartbeat CSS. Preserve reduced-motion rules and injection position. */
export function getSplashOverlayStyle(filtersLoaded: boolean) { return { position: "absolute", inset: 0, zIndex: 999999999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "radial-gradient(ellipse at 50% 40%, #17352b, #0d1719 65%)", opacity: filtersLoaded ? 0 : 1, pointerEvents: filtersLoaded ? "none" : "auto", transition: "opacity 350ms ease" } as const; }

export const splashAnimationCss = `
        @keyframes mly-intro-route { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes mly-intro-enter { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .mly-intro-route { stroke-dasharray: 1; animation: mly-intro-route 900ms ease-out both; }
        @keyframes mly-intro-flow { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes mly-intro-heartbeat { 0%, 100% { opacity: 0.35; } 18% { opacity: 0.85; } 27% { opacity: 0.45; } 36% { opacity: 0.95; } 60% { opacity: 0.35; } }
        .mly-intro .mly-intro-flow { stroke-dasharray: 0.075 0.025 0.04 0.86; stroke-linecap: round; stroke-width: 2.5; animation: mly-intro-flow 2400ms linear infinite, mly-intro-heartbeat 2400ms ease-in-out infinite !important; }
        @media (prefers-reduced-motion: reduce) { .mly-intro .mly-intro-flow { display: none; animation: none !important; } }
        .mly-intro-card { animation: mly-intro-enter 300ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .mly-intro-route, .mly-intro-card { animation: none; } .mly-intro { transition: none !important; } }
      `;

export const splashBackdropStyle = { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" } as const;

export const splashCardStyle = { position: "relative", padding: "24px 20px", textAlign: "center", maxWidth: 300, color: "#ecf4ef" } as const;

export const splashLogoStyle = { borderRadius: 11, boxShadow: "0 4px 20px #0004" } as const;

export const splashEyebrowStyle = { fontSize: 11, letterSpacing: "0.12em", color: "#95d4b2", marginTop: 14 } as const;

export const splashTitleStyle = { fontSize: 27, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 } as const;

export const splashTaglineStyle = { fontSize: 12, color: "#a8bdb4", margin: "8px 0 18px" } as const;

export const splashStatusStyle = { fontSize: 11, color: "#b4d9c5" } as const;
