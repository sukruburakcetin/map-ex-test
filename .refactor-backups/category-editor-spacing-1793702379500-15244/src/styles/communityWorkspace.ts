import type { React } from 'jimu-core';
/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */
export const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:8,minHeight:0,overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};
export const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:10,background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};
export const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};
export const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};
export const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};
export const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:32,justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};

/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */
export const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'#13251e',borderColor:'#49695a'};
export const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};
export const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};
export const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};
export const workspaceHeadingStyle: React.CSSProperties = {fontSize:14,fontWeight:700,lineHeight:1.4,margin:0,color:'#f0f7f3'};
export const workspaceContributionCardStyle: React.CSSProperties = {...workspaceCardStyle,padding:12,gap:9,background:'#1b3027',borderColor:'#567363'};
export const workspaceStatusBadgeStyle: React.CSSProperties = {display:'inline-flex',padding:'3px 7px',borderRadius:5,fontSize:11,fontWeight:600,background:'#303f38',color:'#ecf3ef'};
/** Pair category color with readable text; long names wrap at controller widths. */
export const getWorkspaceCategoryBadgeStyle = (color: string): React.CSSProperties => ({display:'inline-flex',alignItems:'center',gap:6,
  padding:'4px 8px',borderRadius:5,border:'1px solid '+color,background:color+'26',color:'#f3f8f5',fontWeight:700,fontSize:12,minWidth:0,maxWidth:'100%',overflowWrap:'anywhere'});
