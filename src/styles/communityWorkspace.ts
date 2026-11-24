import type { React } from 'jimu-core';
/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */
export const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:10,flex:'1 1 0',minHeight:0,minWidth:0,boxSizing:'border-box',paddingInline:'var(--mly-workspace-inset, 8px)',paddingBottom:'max(20px, env(safe-area-inset-bottom, 0px))',scrollPaddingBottom:48,overscrollBehavior:'contain',overflowY:'auto',overflowX:'hidden',fontSize:'var(--mly-notes-text-size, 11px)',lineHeight:1.4,color:'var(--mly-theme-text, #d3e2d9)'};
export const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:'var(--mly-workspace-card-padding, 10px)',background:'var(--mly-theme-panel, #101e18)',border:'1px solid var(--mly-theme-border, #3f5b4c)',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};
export const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};
export const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};
export const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',fontSize:'var(--mly-workspace-input-size, 11px)',background:'var(--mly-theme-input, #14251d)',color:'var(--mly-theme-text, #eef6f0)',border:'1px solid var(--mly-theme-border, #526e60)',borderRadius:4};
export const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:'var(--mly-workspace-target-height, 32px)',justifySelf:'start',maxWidth:'100%',background:'var(--mly-theme-control, #214233)',color:'var(--mly-theme-text, #e4f2ea)',border:'1px solid var(--mly-theme-border, #526e60)',borderRadius:4,cursor:'pointer'};

export const workspaceConnectStyle: React.CSSProperties = {
  ...workspaceCardStyle, width: "100%", boxSizing: "border-box",
  gap: 12, padding: "12px",
};
export const workspaceManualFieldsStyle: React.CSSProperties = {display:"grid",gap:8,paddingBlockStart:6};
export const workspaceConnectPrimaryStyle: React.CSSProperties = {
  ...workspaceButtonStyle, background:"var(--mly-theme-primary, #245c40)", color:"#fff",
};

/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */
export const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'var(--mly-workspace-surface, var(--mly-theme-panel, #13251e))',borderColor:'var(--mly-theme-border, #49695a)'};
export const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:11,fontWeight:700,color:'var(--mly-theme-text, #eef6f0)',cursor:'pointer'};
export const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'var(--mly-theme-border, #718d7d)'};
export const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'var(--mly-theme-danger, #ffcfbf)',borderColor:'#986c5d'};
export const workspaceHeadingStyle: React.CSSProperties = {fontSize:'var(--mly-workspace-heading-size, 12px)',fontWeight:700,lineHeight:1.4,margin:0,color:'var(--mly-theme-text, #f0f7f3)'};
export const workspaceContributionCardStyle: React.CSSProperties = {...workspaceCardStyle,padding:'var(--mly-workspace-card-padding, 12px)',gap:9,background:'var(--mly-theme-control, #1b3027)',borderColor:'var(--mly-theme-border, #567363)'};
export const workspaceStatusBadgeStyle: React.CSSProperties = {display:'inline-flex',padding:'3px 7px',borderRadius:5,fontSize:11,fontWeight:600,background:'var(--mly-theme-control, #303f38)',color:'var(--mly-theme-text, #ecf3ef)'};
/** Pair category color with readable text; long names wrap at controller widths. */
export const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,
  padding:'4px 8px',borderRadius:5,border:'1px solid '+color,background:color+'26',color:'var(--mly-theme-text, #f3f8f5)',fontWeight:700,fontSize:11,minWidth:0,maxWidth:'100%',overflowWrap:'anywhere'});

/** Explicit inner layout keeps disclosure content spaced in browsers where
 * details does not establish a grid for its anonymous content wrapper. */
export const workspaceCategoryEditorBodyStyle: React.CSSProperties = {display:'grid',gap:12,minWidth:0,paddingTop:8};
export const workspaceCategoryEditorRowStyle: React.CSSProperties = {...workspaceRowStyle,gap:12,padding:8,border:'1px solid #496052',borderRadius:5};
export const workspaceColorInputStyle: React.CSSProperties = {display:'block',width:56,height:36,maxWidth:'100%',boxSizing:'border-box',padding:3,background:'var(--mly-theme-input, #14251d)',border:'1px solid var(--mly-theme-border, #718d7d)',borderRadius:4,cursor:'pointer'};

/** Keep submit/cancel together within the workspace's sole main scroll viewport. */
export const workspaceEditorActionsStyle: React.CSSProperties = {...workspaceRowStyle,position:'sticky',bottom:0,zIndex:2,
  gap:8,padding:'8px 0',background:'var(--mly-theme-panel, #13251e)',borderTop:'1px solid var(--mly-theme-border, #567363)'};
export const workspacePickerResultsStyle: React.CSSProperties = {display:'grid',gap:6,maxHeight:220,minHeight:0,overflowY:'auto',overflowX:'hidden',padding:4,border:'1px solid #496052',borderRadius:5};

/** Neutral bands help scanning without competing with semantic category colors. */
export const workspaceReadabilityCss = `
/* Scope browser text inflation control to this UI; preserve browser/pinch zoom. */
.mly-workspace-scroll {
 --mly-workspace-heading-size:var(--mly-notes-heading-size, 12px);
 --mly-workspace-title-size:var(--mly-notes-heading-size, 12px);
 --mly-workspace-description-size:var(--mly-notes-text-size, 11px);
 --mly-workspace-input-size:var(--mly-notes-text-size, 11px);
 container: mly-workspace / inline-size; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
.mly-workspace-field-help { position:relative; display:grid; gap:4px; min-width:0; }
.mly-workspace-field-label { display:flex; align-items:center; min-height:24px; padding-inline-end:30px; overflow-wrap:anywhere; }
.mly-workspace-field-help > .mly-workspace-help-toggle { position:absolute; inset-block-start:-2px; inset-inline-end:0; }
.mly-workspace-field-help > label:has(> input[type="checkbox"]) { display:flex; gap:6px; align-items:center; padding-inline-end:30px; }
.mly-workspace-field-help > label > input[type="checkbox"] { order:-1; flex-shrink:0; }
.mly-workspace-field-help > label:has(> input[type="checkbox"]) .mly-workspace-field-label { padding-inline-end:0; }
.mly-workspace-help-heading { display:grid; gap:4px; min-width:0; }
.mly-workspace-help-title { display:flex; align-items:center; flex-wrap:wrap; gap:6px; min-width:0; }
.mly-workspace-help-actions { margin-inline-start:auto; }
.mly-workspace-scroll .mly-workspace-help-toggle.mly-text-action {
 display:inline-grid; place-items:center; flex:0 0 auto; box-sizing:border-box;
 width:28px; min-width:28px; height:28px; min-height:28px; padding:0 !important;
 border:0; border-radius:50%;
 color:var(--mly-theme-text, #e4f2ea); background:transparent; cursor:pointer; font-weight:700;
}
.mly-workspace-help-toggle > span {
 display:grid; place-items:center; width:16px; height:16px; box-sizing:border-box;
 border:1px solid var(--mly-theme-border, #718d7d); border-radius:50%;
 font-size:10px; line-height:1;
}
.mly-workspace-scroll .mly-workspace-help-toggle[aria-expanded="true"] > span { background:var(--mly-theme-selected, #294c39); }
.mly-workspace-scroll .mly-workspace-help-toggle:focus-visible { outline:2px solid var(--mly-theme-accent, #a9dcba); outline-offset:2px; }
.mly-workspace-help-body {
 border-inline-start:2px solid var(--mly-theme-border, #718d7d); padding:4px 8px;
 color:var(--mly-theme-muted, #b5ccbf); overflow-wrap:anywhere;
}
.mly-workspace-help-body[hidden] { display:none !important; }
.mly-workspace-help-body :is(p, ol) { margin:0; }
.mly-workspace-help-body p + :is(p, ol) { margin-block-start:4px; }
.mly-workspace-help-body ol { padding-inline-start:20px; }
.mly-workspace-scroll button { white-space: normal; overflow-wrap: anywhere; line-height: 1.35; }
.mly-workspace-scroll input, .mly-workspace-scroll select, .mly-workspace-scroll textarea { max-width: 100%; }
@container mly-workspace (max-width: 480px) {
 .mly-workspace-scroll > * {
  --mly-workspace-card-padding: 6px;
  --mly-workspace-heading-size: 12px;
  --mly-workspace-title-size: 12px;
  --mly-workspace-description-size: 11px;
 }
 /* Host form rules can specify sizes/margins directly on labels and inputs;
  * inheritance alone does not constrain them. Keep overrides inside this panel. */
 .mly-workspace-scroll > * { font-size: 11px; line-height: 1.4; }
 .mly-workspace-scroll :is(label, p, summary, button, input, select, textarea, code) {
  font-size: 11px !important; line-height: 1.4 !important;
 }
 .mly-workspace-scroll :is(label, p) { margin: 0 !important; }
 .mly-workspace-scroll small { font-size: 10px; line-height: 1.4; }
 .mly-workspace-scroll :is(h3, h4) { font-size: 12px !important; }
 .mly-workspace-scroll button { padding: 5px 8px !important; min-height: 30px !important; }
 .mly-workspace-scroll :is(input, select, textarea):not([type=checkbox]):not([type=radio]):not([type=color]) {
  padding: 5px 6px !important; min-height: 30px !important; box-sizing: border-box;
 }
 .mly-workspace-scroll input:is([type=checkbox], [type=radio]) { width: 13px; height: 13px; }

 .mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 2px; }
 .mly-workspace-scroll details.mly-workspace-section > summary { padding-block: 6px; }
 .mly-workspace-scroll details.mly-workspace-section[open] > summary { margin-bottom: 6px; }
}
/* Compact touch controls use the same text size as the panel. Do not increase
 * form typography on coarse-pointer devices or scale the entire interface. */
@media (pointer: coarse) {
 .mly-workspace-scroll { --mly-workspace-target-height: 34px; --mly-workspace-input-size: 11px; }
 .mly-workspace-scroll label:has(input[type=checkbox]), .mly-workspace-scroll summary { min-height: 32px; box-sizing: border-box; }
 .mly-workspace-scroll input:not([type=checkbox]):not([type=radio]):not([type=color]),
 .mly-workspace-scroll select { min-height: 34px; line-height: 1.4; }
}

.mly-workspace-scroll .mly-workspace-setup-choice[aria-pressed="true"] { background: var(--mly-theme-selected, #294c39) !important; }
.mly-workspace-scroll .mly-workspace-connect-primary:disabled { opacity: .55; cursor: not-allowed; }
.mly-workspace-scroll .mly-workspace-connect-primary:focus-visible { outline: 2px solid var(--mly-theme-accent, #a9dcba); outline-offset: 2px; }
.mly-workspace-scroll > .mly-workspace-section:nth-child(even) { --mly-workspace-surface: var(--mly-theme-panel, #172b23); }
.mly-workspace-scroll > .mly-workspace-section:nth-child(odd) { --mly-workspace-surface: var(--mly-theme-panel, #102019); }
.mly-workspace-scroll .mly-workspace-section { flex-shrink: 0; }
.mly-workspace-scroll details.mly-workspace-section > summary { padding: 8px 2px; }
.mly-workspace-scroll details.mly-workspace-section[open] > summary { border-bottom: 1px solid #647e6f55; margin-bottom: 10px; }
.mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 10px; }
.mly-workspace-scroll .mly-workspace-category-row:nth-child(even) { background: #ffffff08; }
.mly-workspace-scroll .mly-workspace-category-row:nth-child(odd) { background: #00000014; }
.mly-workspace-scroll .mly-workspace-category-row:focus-within { outline: 2px solid #a5c9b6; outline-offset: 1px; }
.mly-workspace-scroll .mly-workspace-category-row:hover { border-color: var(--mly-theme-border, #86a694); }
`;
