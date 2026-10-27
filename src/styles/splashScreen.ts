/** Quiet panoramic viewfinder: static artwork, one entrance fade and preparation spinner. */
export function getSplashOverlayStyle(filtersLoaded: boolean) {
  return { position: "absolute", inset: 0, zIndex: 999999999, display: "grid", placeItems: "center", overflow: "hidden",
    containerType: "size", background: "radial-gradient(ellipse at 50% 45%, #29473a 0%, #172f28 38%, #10231f 75%, #0d1c19 100%)", opacity: filtersLoaded ? 0 : 1,
    pointerEvents: filtersLoaded ? "none" : "auto", transition: "opacity 220ms ease" } as const;
}
export const splashAnimationCss = `
@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes mly-intro-loading { to { transform: rotate(360deg); } }
.mly-intro-atlas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.mly-intro-layout { position: relative; z-index: 1; width: min(640px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #b0cabe2b; border-radius: 12px; background: #182e29; color: #e8efe6; font-family: "Segoe UI",sans-serif; box-shadow: 0 18px 55px #0005, 0 0 0 1px #b9d5c208; animation: mly-intro-enter 180ms ease-out both; }
.mly-intro-scene { position: relative; height: 240px; overflow: hidden; background: #36565e; }
.mly-intro-scene > svg { display: block; width: 100%; height: 100%; }
.mly-intro-brand { position: absolute; top: 16px; left: 20px; display: flex; align-items: center; gap: 7px; font-size: 11px; color: #e5eee4; text-shadow: 0 1px 4px #15342f; }
.mly-intro-brand img { border-radius: 5px; }
.mly-viewfinder-frame { position: absolute; inset: 58px 20px 35px; pointer-events: none; }
.mly-viewfinder-frame i { position: absolute; width: 13px; height: 13px; border: 1px solid #d4e6d380; }
.mly-viewfinder-frame i:nth-child(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.mly-viewfinder-frame i:nth-child(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.mly-viewfinder-frame i:nth-child(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.mly-viewfinder-frame i:nth-child(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }
.mly-intro-caption { position: absolute; bottom: 12px; left: 20px; font-size: 9px; color: #c1d4c5; }
.mly-intro-copy { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 23px 22px; }
.mly-intro-heading { min-width: 0; }
.mly-intro-copy h2 { font-size: 27px; font-weight: 450; line-height: 1.12; letter-spacing: -.04em; margin: 0 0 8px; color: #eff4e9; }
.mly-intro-copy p { font-size: 11px; line-height: 1.5; margin: 0; color: #9eb8aa; }
.mly-intro-bottom { display: flex; flex-direction: column; align-items: flex-start; gap: 9px; flex-shrink: 0; }
.mly-intro-bottom button { display: flex; align-items: center; justify-content: space-between; gap: 18px; border: 1px solid #b3ddbc; border-radius: 6px; padding: 9px 11px; background: #b3ddbc; color: #183e2a; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.mly-intro-bottom button:enabled:hover { background: #c9e9cf; }
.mly-intro-bottom button:focus-visible { outline: 2px solid #e1ffe8; outline-offset: 3px; }
.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 9px; color: #91af9c; }
.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #9ead8a55; border-top-color: #a3d7af; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }
@container (max-width: 460px) {
  .mly-intro-atlas { opacity: .65; }
  .mly-intro-layout { width: min(360px,94%); }
  .mly-intro-scene { height: 180px; }
  .mly-intro-copy { flex-direction: column; align-items: stretch; padding: 18px; gap: 15px; }
  .mly-intro-copy h2 { font-size: 25px; }
  .mly-intro-bottom { flex-direction: row; align-items: center; justify-content: space-between; gap: 8px; }
  .mly-intro-bottom button { gap: 10px; }
}
@container (max-height: 320px) {
  .mly-intro-scene { height: 92px; }
  .mly-intro-brand { top: 9px; left: 14px; font-size: 9px; }
  .mly-intro-brand img { width: 16px; height: 16px; }
  .mly-viewfinder-frame { inset: 33px 14px 22px; }
  .mly-viewfinder-frame i { width: 8px; height: 8px; }
  .mly-intro-caption { bottom: 6px; left: 14px; font-size: 7px; }
  .mly-intro-copy { padding: 12px 14px; gap: 11px; }
  .mly-intro-copy h2 { font-size: 21px; margin-bottom: 4px; }
  .mly-intro-copy p { font-size: 10px; }
  .mly-intro-bottom button { padding: 7px 9px; font-size: 10px; }
  .mly-intro-status { font-size: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .mly-intro-layout, .mly-intro-loading { animation: none; }
  .mly-intro { transition: none !important; }
}
`;
