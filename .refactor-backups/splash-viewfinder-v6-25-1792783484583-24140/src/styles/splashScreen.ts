/** Field-notebook layout: quiet paper, ink and a static map clipping. */
export function getSplashOverlayStyle(filtersLoaded: boolean) {
  return { position: "absolute", inset: 0, zIndex: 999999999, display: "grid", placeItems: "center", overflow: "hidden",
    containerType: "size", background: "#152a22", opacity: filtersLoaded ? 0 : 1,
    pointerEvents: filtersLoaded ? "none" : "auto", transition: "opacity 220ms ease" } as const;
}
export const splashAnimationCss = `
@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes mly-intro-loading { to { transform: rotate(360deg); } }
.mly-intro-layout { display: flex; flex-direction: column; width: min(480px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #cbd3bb; border-radius: 3px 14px 14px 3px; background: #f0eee1; color: #243d2e; font-family: "Segoe UI",sans-serif; box-shadow: -5px 0 0 #8ba183,0 14px 35px #0002; animation: mly-intro-enter 180ms ease-out both; }
.mly-intro-copy { padding: 24px 26px 20px; min-width: 0; border-bottom: 1px solid #a4b09566; }
.mly-intro-brand { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #536c55; }
.mly-intro-brand img { width: 20px; height: 20px; border-radius: 5px; }
.mly-intro-copy h2 { font-family: Georgia,"Times New Roman",serif; font-size: 39px; font-weight: 400; line-height: 1.02; letter-spacing: -.045em; margin: 19px 0 12px; color: #24412e; }
.mly-intro-copy p { font-size: 12px; line-height: 1.6; margin: 0; color: #66745e; }
.mly-intro-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
.mly-intro-bottom button { display: flex; align-items: center; justify-content: space-between; gap: 20px; border: 1px solid #2a4d37; border-radius: 4px; padding: 9px 12px; background: #2a4d37; color: #f2f2e5; font: inherit; font-size: 12px; cursor: pointer; }
.mly-intro-bottom button:hover { background: #3c6147; }
.mly-intro-bottom button:focus-visible { outline: 2px solid #43654b; outline-offset: 3px; }
.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #6c7c63; }
.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #9ead8a55; border-top-color: #3f684b; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }
.mly-intro-scene { position: relative; height: 105px; flex-shrink: 0; overflow: hidden; background: #d9dfca; }
.mly-intro-scene svg { display: block; width: 100%; height: 100%; }
.mly-intro-caption { position: absolute; bottom: 8px; left: 12px; right: 12px; display: flex; justify-content: space-between; font-size: 6px; letter-spacing: .09em; color: #36583f; }
@container (max-width: 460px) {
  .mly-intro-layout { width: min(340px,93%); }
  .mly-intro-copy { padding: 20px; }
  .mly-intro-copy h2 { font-size: 32px; }
  .mly-intro-scene { height: 80px; }
  .mly-intro-bottom { gap: 10px; }
  .mly-intro-status { font-size: 9px; }
}
@container (max-height: 320px) {
  .mly-intro-copy { padding: 12px 16px; }
  .mly-intro-copy h2 { font-size: 25px; margin: 9px 0 6px; }
  .mly-intro-break { display: none; }
  .mly-intro-copy p { font-size: 10px; line-height: 1.4; }
  .mly-intro-bottom { margin-top: 10px; gap: 8px; }
  .mly-intro-scene { height: 48px; }
  .mly-intro-brand { font-size: 9px; }
  .mly-intro-brand img { width: 16px; height: 16px; }
  .mly-intro-caption { bottom: 4px; font-size: 5px; }
  .mly-intro-bottom button { font-size: 10px; padding: 6px 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .mly-intro-layout, .mly-intro-loading { animation: none; }
  .mly-intro { transition: none !important; }
}
`;
