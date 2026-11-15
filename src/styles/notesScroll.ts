/** Scoped, visible scrollbars: no global map/viewer scrollbar overrides.
 * Standards properties serve Firefox/current Chromium; WebKit rules cover older
 * embedded engines. Forced colors retains the browser's accessible colors.
 */
export const notesScrollCss = `
/* One control/body scale across sources, including host form-style overrides. */
.mly-notes-sheet { --mly-notes-text-size:11px; --mly-notes-heading-size:12px; --mly-notes-meta-size:10px; font-size:var(--mly-notes-text-size); line-height:1.4; }
.mly-notes-sheet :is(label, p, summary, button, input, select, textarea, code) { font-size:var(--mly-notes-text-size) !important; line-height:1.4 !important; }

.mly-notes-sheet *, .mly-notes-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(171,205,187,.4) transparent;
}
.mly-notes-sheet *::-webkit-scrollbar, .mly-notes-scroll::-webkit-scrollbar { width:6px; height:6px; }
.mly-notes-sheet *::-webkit-scrollbar-track, .mly-notes-scroll::-webkit-scrollbar-track { background:transparent; }
.mly-notes-sheet *::-webkit-scrollbar-thumb, .mly-notes-scroll::-webkit-scrollbar-thumb { background:rgba(171,205,187,.4); border-radius:6px; }
.mly-notes-sheet *::-webkit-scrollbar-thumb:hover, .mly-notes-scroll::-webkit-scrollbar-thumb:hover { background:rgba(190,224,206,.7); }
.mly-notes-sheet *::-webkit-scrollbar-button, .mly-notes-scroll::-webkit-scrollbar-button { display:none; width:0; height:0; }
.mly-notes-scroll { scrollbar-gutter:stable; }
.mly-workspace-scroll > * { flex-shrink:0; }
@media (forced-colors: active) { .mly-notes-sheet *, .mly-notes-scroll { scrollbar-color:auto; } }
`;
