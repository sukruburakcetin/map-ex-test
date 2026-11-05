/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { detectionGroups, detectionGroupNames } from './detectionExploration';
import type { DetectionExplorerOptions, DetectionSummary } from './detectionExploration';
export function DetectionExplorerControls({options,summary,onChange}:{options:DetectionExplorerOptions;summary:DetectionSummary;onChange:(options:DetectionExplorerOptions)=>void}){
 const {owned:text}=useWidgetLocale();
 const select:React.CSSProperties={width:'100%',minWidth:0,maxWidth:'100%',boxSizing:'border-box',background:'#182d24',color:'#e1eee5',border:'1px solid #648b73',borderRadius:4,fontSize:9,lineHeight:1.3,padding:'4px',height:26};
 const field:React.CSSProperties={display:'grid',gap:3,margin:0,color:'#d3e2d9',fontSize:9,minWidth:0};
 const check:React.CSSProperties={display:'flex',alignItems:'center',gap:4,margin:0,color:'#d3e2d9',fontSize:9,minWidth:0};
 return <details className="mly-detection-explorer" style={{fontSize:9,lineHeight:1.3,color:'#d3e2d9',minWidth:0,boxSizing:'border-box',background:'#12241c',border:'1px solid #648b7344',borderRadius:5,padding:'3px 5px'}}>
  <style>{`
   .mly-detection-explorer { color:#d3e2d9 !important; }
   .mly-detection-explorer :is(label,span,small,summary,select,option),
   .mly-info-panel .mly-info-body .mly-detection-explorer :is(label,span,small,summary,select,option) { color:#d3e2d9 !important; font-size:9px !important; line-height:1.3 !important; }
   .mly-detection-explorer label { margin:0 !important; }
   .mly-info-panel .mly-info-body .mly-detection-explorer summary { padding:3px 0 !important; }
   .mly-detection-explorer select { min-height:26px !important; height:26px !important; }
  `}</style>
  <summary style={{cursor:'pointer',paddingBlock:3}}>{text('Detections')}</summary>
  <div style={{display:'grid',gap:6,paddingBlock:4,minWidth:0}}>
   <label style={field}>{text('View')}<select aria-label={text('Detection scope')} title={text('Standard keeps the original detection visibility. Explore reveals additional categories.')} style={select} value={options.mode} onChange={event=>onChange({...options,mode:event.target.value as DetectionExplorerOptions['mode']})}><option value="filtered">{text('Standard')}</option><option value="explore">{text('Explore')}</option></select></label>
   <span role={summary.error?'alert':'status'} style={{color:'#b7cabe',fontSize:9}}>{summary.loading?text('Loading…'):summary.error?text('Load failed. Toggle AI Overlay to retry.'):`${summary.shown} / ${summary.total} ${text('shown')}`}</span>
   {options.mode==='explore'&&<React.Fragment>
    {detectionGroups.filter(group=>group!=='background'&&(summary.counts[group]||0)>0).map(group=><label key={group} style={check}><input type="checkbox" style={{margin:0,flexShrink:0}} checked={options.groups.includes(group)} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,group]:options.groups.filter(value=>value!==group)})}/><span style={{minWidth:0,overflowWrap:'anywhere'}}>{text(detectionGroupNames[group])} · {summary.counts[group]}</span></label>)}
    {!!summary.counts.background&&<details><summary style={{cursor:'pointer'}}>{text('Background')}</summary><label style={check}><input type="checkbox" style={{margin:0}} checked={options.groups.includes('background')} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,'background']:options.groups.filter(value=>value!=='background')})}/>{text('Show background')} · {summary.counts.background}</label></details>}
   </React.Fragment>}
   <label style={field}>{text('Labels')}<select aria-label={text('Label display')} style={select} value={options.labelMode} onChange={event=>onChange({...options,labelMode:event.target.value as DetectionExplorerOptions['labelMode']})}><option value="all">{text('All visible')}</option><option value="focus">{text('On hover/tap')}</option></select></label>
  </div>
 </details>;
}
