/** Shared layout for explicitly marked, widget-owned text actions.
 * Applies inside viewer/fullscreen portals and Builder without touching SDK or
 * icon-only controls. No font scaling, observers, measurement loop or truncation.
 */
export const textButtonCss = `
button.mly-text-action.mly-text-action {
  box-sizing: border-box !important;
  min-inline-size: 0 !important;
  max-inline-size: 100% !important;
  block-size: auto !important;
  min-block-size: 26px;
  flex-shrink: 1 !important;
  padding-inline: max(8px, .65em) !important;
  white-space: pre-line !important;
  overflow-wrap: anywhere !important;
  word-break: normal;
  line-height: 1.35 !important;
}
button.mly-text-action.mly-text-action :where(span:not([aria-hidden="true"])) {
  min-inline-size: 0;
  max-inline-size: 100%;
  white-space: pre-line !important;
  overflow-wrap: anywhere !important;
}
button.mly-text-action > :is(svg,img) { flex-shrink: 0; }
`;
