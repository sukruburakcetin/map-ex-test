import type { React } from 'jimu-core';
/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */
export const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:8,minHeight:0,overflowY:'auto',overflowX:'hidden',fontSize:11,color:'#d3e2d9'};
export const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:6,padding:8,border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};
export const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};
export const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};
export const workspaceInputStyle: React.CSSProperties = {width:'100%',minWidth:0,boxSizing:'border-box',padding:6,font:'inherit',background:'#14251d',color:'#eef6f0',border:'1px solid #526e60',borderRadius:4};
export const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'5px 8px',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};
