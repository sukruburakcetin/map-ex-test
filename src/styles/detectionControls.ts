import type { React } from 'jimu-core';
/** Action hover is transient CSS; pressed appearance belongs only to toggle state. */
const button:React.CSSProperties={boxSizing:'border-box',marginTop:0,padding:'4px 6px',width:'100%',minHeight:24,
 display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontSize:9,lineHeight:1.3,fontWeight:600,
 color:'#fff',border:'1px solid #648b7366',borderRadius:5,background:'rgba(55,213,130,0.3)',cursor:'pointer',
 transition:'background-color 120ms ease,border-color 120ms ease',pointerEvents:'auto'};
export const detectionExportButtonStyle:React.CSSProperties={...button};
export const detectionExportLabelStyle:React.CSSProperties={fontWeight:700,minWidth:0,overflow:'hidden',textOverflow:'ellipsis'};
export function detectionOverlayButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}
export const detectionOverlayLabelStyle:React.CSSProperties={fontSize:9,fontWeight:700};
export function detectionLabelsButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}
export const detectionControlsCss=`
.mly-info-panel .mly-info-more .mly-detection-export > span { white-space:nowrap !important; overflow-wrap:normal; }
.mly-detection-button > svg { flex-shrink:0; width:12px; height:12px; }
.mly-detection-button:focus-visible { outline:2px solid #c5f6d6; outline-offset:1px; }
.mly-detection-button:disabled { opacity:.55; cursor:wait; }
@media (hover:hover) and (pointer:fine) {
 .mly-info-panel .mly-detection-button:enabled:hover { background:rgba(55,213,130,.5) !important; }
 .mly-info-panel .mly-detection-button[aria-pressed="true"]:enabled:hover { background:rgba(55,213,130,.9) !important; }
}
`;
