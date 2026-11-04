import type { React } from 'jimu-core';
/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */
export const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:10,flex:'1 1 0',minHeight:0,minWidth:0,boxSizing:'border-box',paddingInline:'var(--mly-workspace-inset, 8px)',paddingBottom:'max(20px, env(safe-area-inset-bottom, 0px))',scrollPaddingBottom:48,overscrollBehavior:'contain',overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};
export const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:'var(--mly-workspace-card-padding, 10px)',background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};
export const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};
export const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};
export const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',fontSize:'var(--mly-workspace-input-size, 12px)',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};
export const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:'var(--mly-workspace-target-height, 32px)',justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};

/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */
export const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'var(--mly-workspace-surface, #13251e)',borderColor:'#49695a'};
export const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};
export const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};
export const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};
export const workspaceHeadingStyle: React.CSSProperties = {fontSize:'var(--mly-workspace-heading-size, 14px)',fontWeight:700,lineHeight:1.4,margin:0,color:'#f0f7f3'};
export const workspaceContributionCardStyle: React.CSSProperties = {...workspaceCardStyle,padding:'var(--mly-workspace-card-padding, 12px)',gap:9,background:'#1b3027',borderColor:'#567363'};
export const workspaceStatusBadgeStyle: React.CSSProperties = {display:'inline-flex',padding:'3px 7px',borderRadius:5,fontSize:11,fontWeight:600,background:'#303f38',color:'#ecf3ef'};
/** Pair category color with readable text; long names wrap at controller widths. */
export const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,
  padding:'4px 8px',borderRadius:5,border:'1px solid '+color,background:color+'26',color:'#f3f8f5',fontWeight:700,fontSize:12,minWidth:0,maxWidth:'100%',overflowWrap:'anywhere'});

/** Explicit inner layout keeps disclosure content spaced in browsers where
 * details does not establish a grid for its anonymous content wrapper. */
export const workspaceCategoryEditorBodyStyle: React.CSSProperties = {display:'grid',gap:12,minWidth:0,paddingTop:8};
export const workspaceCategoryEditorRowStyle: React.CSSProperties = {...workspaceRowStyle,gap:12,padding:8,border:'1px solid #496052',borderRadius:5};
export const workspaceColorInputStyle: React.CSSProperties = {display:'block',width:56,height:36,maxWidth:'100%',boxSizing:'border-box',padding:3,background:'#14251d',border:'1px solid #718d7d',borderRadius:4,cursor:'pointer'};

/** Keep submit/cancel together within the workspace's sole main scroll viewport. */
export const workspaceEditorActionsStyle: React.CSSProperties = {...workspaceRowStyle,position:'sticky',bottom:0,zIndex:2,
  gap:8,padding:'8px 0',background:'#13251e',borderTop:'1px solid #567363'};
export const workspacePickerResultsStyle: React.CSSProperties = {display:'grid',gap:6,maxHeight:220,minHeight:0,overflowY:'auto',overflowX:'hidden',padding:4,border:'1px solid #496052',borderRadius:5};

/** Neutral bands help scanning without competing with semantic category colors. */
export const workspaceReadabilityCss = `
/* Scope browser text inflation control to this UI; preserve browser/pinch zoom. */
.mly-workspace-scroll { container: mly-workspace / inline-size; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
.mly-workspace-scroll button { white-space: normal; overflow-wrap: anywhere; line-height: 1.35; }
.mly-workspace-scroll input, .mly-workspace-scroll select, .mly-workspace-scroll textarea { max-width: 100%; }
@container mly-workspace (max-width: 480px) {
 .mly-workspace-scroll > * {
  --mly-workspace-card-padding: 8px;
  --mly-workspace-heading-size: 13px;
  --mly-workspace-title-size: 14px;
  --mly-workspace-description-size: 12px;
 }
 .mly-workspace-scroll p { margin-block: 6px; }
 .mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 2px; }
 .mly-workspace-scroll details.mly-workspace-section > summary { padding-block: 6px; }
 .mly-workspace-scroll details.mly-workspace-section[open] > summary { margin-bottom: 6px; }
}
/* Compact touch controls use the same text size as the panel. Do not increase
 * form typography on coarse-pointer devices or scale the entire interface. */
@media (pointer: coarse) {
 .mly-workspace-scroll { --mly-workspace-target-height: 34px; --mly-workspace-input-size: 12px; }
 .mly-workspace-scroll label:has(input[type=checkbox]), .mly-workspace-scroll summary { min-height: 32px; box-sizing: border-box; }
 .mly-workspace-scroll input:not([type=checkbox]):not([type=radio]):not([type=color]),
 .mly-workspace-scroll select { min-height: 34px; line-height: 1.4; }
}

.mly-workspace-scroll > .mly-workspace-section:nth-child(even) { --mly-workspace-surface: #172b23; }
.mly-workspace-scroll > .mly-workspace-section:nth-child(odd) { --mly-workspace-surface: #102019; }
.mly-workspace-scroll .mly-workspace-section { flex-shrink: 0; }
.mly-workspace-scroll details.mly-workspace-section > summary { padding: 8px 2px; }
.mly-workspace-scroll details.mly-workspace-section[open] > summary { border-bottom: 1px solid #647e6f55; margin-bottom: 10px; }
.mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 10px; }
.mly-workspace-scroll .mly-workspace-category-row:nth-child(even) { background: #ffffff08; }
.mly-workspace-scroll .mly-workspace-category-row:nth-child(odd) { background: #00000014; }
.mly-workspace-scroll .mly-workspace-category-row:focus-within { outline: 2px solid #a5c9b6; outline-offset: 1px; }
.mly-workspace-scroll .mly-workspace-category-row:hover { border-color: #86a694; }
`;
