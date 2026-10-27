/** A single entrance fade; only the preparation indicator loops. */
export function getSplashOverlayStyle(filtersLoaded: boolean) {
  return { position: "absolute", inset: 0, zIndex: 999999999, display: "grid", placeItems: "center", overflow: "hidden",
    containerType: "size", background: "#10251f", opacity: filtersLoaded ? 0 : 1,
    pointerEvents: filtersLoaded ? "none" : "auto", transition: "opacity 220ms ease" } as const;
}
export const splashAnimationCss = `
@keyframes mly-intro-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes mly-intro-loading { to { transform: rotate(360deg); } }
.mly-intro-layout { display: grid; grid-template-columns: 1fr 1fr; width: min(620px,94%); max-height: 94%; overflow: auto; box-sizing: border-box; border: 1px solid #8cb79a30; border-radius: 14px; background: #172f26; color: #e6efe5; font-family: "Segoe UI",sans-serif; animation: mly-intro-enter 180ms ease-out both; }
.mly-intro-copy { display: flex; flex-direction: column; justify-content: center; padding: 28px 22px; min-width: 0; }
.mly-intro-brand { display: flex; align-items: center; gap: 8px; font-size: 9px; letter-spacing: .09em; color: #a3c7af; }
.mly-intro-brand img { border-radius: 6px; }
.mly-intro-copy h2 { font-size: 30px; font-weight: 500; line-height: 1.12; letter-spacing: -.045em; margin: 25px 0 12px; color: #edf4e8; }
.mly-intro-copy p { font-size: 12px; line-height: 1.6; margin: 0; color: #acc2b3; }
.mly-intro-bottom { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 22px; }
.mly-intro-bottom button { display: flex; align-items: center; gap: 18px; border: 1px solid #add5b766; border-radius: 6px; padding: 8px 12px; background: #bde5c7; color: #173829; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.mly-intro-bottom button:hover { background: #d0efd5; }
.mly-intro-bottom button:focus-visible { outline: 2px solid white; outline-offset: 3px; }
.mly-intro-status { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #95b4a0; }
.mly-intro-loading { width: 7px; height: 7px; border: 1px solid #70948055; border-top-color: #a0d7af; border-radius: 50%; animation: mly-intro-loading 1s linear infinite; }
.mly-intro-scene { position: relative; min-height: 280px; overflow: hidden; background: #244b3c; }
.mly-intro-scene svg { display: block; width: 100%; height: 100%; position: absolute; inset: 0; }
.mly-intro-caption { position: absolute; bottom: 10px; left: 12px; right: 12px; display: flex; justify-content: space-between; font-size: 7px; letter-spacing: .08em; color: #d3e5d6; }
@container (max-width: 460px) {
  .mly-intro-layout { grid-template-columns: 1fr; width: min(340px,94%); }
  .mly-intro-scene { grid-row: 1; min-height: 100px; }
  .mly-intro-scene svg { object-fit: cover; }
  .mly-intro-copy { padding: 16px; }
  .mly-intro-copy h2 { font-size: 24px; margin: 12px 0 8px; }
  .mly-intro-break { display: none; }
  .mly-intro-bottom { flex-direction: row; align-items: center; gap: 12px; margin-top: 14px; }
  .mly-intro-bottom button { white-space: nowrap; }
  .mly-intro-status { font-size: 9px; }
}
@container (max-height: 320px) {
  .mly-intro-copy { padding: 12px 14px; }
  .mly-intro-copy h2 { font-size: 21px; margin: 9px 0 6px; }
  .mly-intro-copy p { font-size: 10px; line-height: 1.4; }
  .mly-intro-bottom { margin-top: 10px; gap: 8px; }
  .mly-intro-scene { min-height: 64px; }
  .mly-intro-brand { font-size: 8px; }
  .mly-intro-brand img { width: 18px; height: 18px; }
  .mly-intro-caption { bottom: 5px; font-size: 6px; }
  .mly-intro-bottom button { font-size: 10px; padding: 6px 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .mly-intro-layout, .mly-intro-loading { animation: none; }
  .mly-intro { transition: none !important; }
}
`;
