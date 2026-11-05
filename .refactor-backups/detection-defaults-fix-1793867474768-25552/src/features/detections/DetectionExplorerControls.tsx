/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { detectionGroups, detectionGroupNames } from './detectionExploration';
import type { DetectionExplorerOptions, DetectionSummary } from './detectionExploration';
export function DetectionExplorerControls({options,summary,onChange}:{options:DetectionExplorerOptions;summary:DetectionSummary;onChange:(options:DetectionExplorerOptions)=>void}){
 const {owned:text}=useWidgetLocale();
 const select:React.CSSProperties={width:'100%',minWidth:0,boxSizing:'border-box',background:'#182d24',color:'#e1eee5',border:'1px solid #648b73',borderRadius:4,font:'inherit',padding:'4px 2px'};
 return <details className="mly-detection-explorer" style={{fontSize:9,minWidth:0,borderTop:'1px solid #648b7344',paddingTop:4}}>
  <summary style={{cursor:'pointer',paddingBlock:4}}>{text('Detection categories')}{summary.total>0?` · ${summary.shown}/${summary.total}`:''}</summary>
  <div style={{display:'grid',gap:6,paddingBlock:4}}>
   <label style={{display:'grid',gap:3}}>{text('Show')}<select aria-label={text('Detection scope')} style={select} value={options.mode} onChange={event=>onChange({...options,mode:event.target.value as DetectionExplorerOptions['mode']})}><option value="filtered">{text('Filtered')}</option><option value="explore">{text('Explore all')}</option></select></label>
   <span role={summary.error?'alert':'status'}>{summary.loading?text('Loading detections…'):summary.error?text('Could not load detections. Toggle AI Overlay to retry.'):`${summary.shown} / ${summary.total} ${text('detections shown')}`}</span>
   {options.mode==='filtered'&&<small>{text('Matches map filters; selected objects stay visible.')}</small>}
   {options.mode==='explore'&&<React.Fragment>
    {detectionGroups.filter(group=>group!=='background'&&(summary.counts[group]||0)>0).map(group=><label key={group} style={{display:'flex',alignItems:'center',gap:4}}><input type="checkbox" style={{margin:0,flexShrink:0}} checked={options.groups.includes(group)} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,group]:options.groups.filter(value=>value!==group)})}/><span style={{minWidth:0,overflowWrap:'anywhere'}}>{text(detectionGroupNames[group])} · {summary.counts[group]}</span></label>)}
    {!!summary.counts.background&&<details><summary style={{cursor:'pointer'}}>{text('Background categories')}</summary><label style={{display:'flex',gap:4,paddingTop:4}}><input type="checkbox" style={{margin:0}} checked={options.groups.includes('background')} onChange={event=>onChange({...options,groups:event.target.checked?[...options.groups,'background']:options.groups.filter(value=>value!=='background')})}/>{text('Background')} · {summary.counts.background}</label></details>}
   </React.Fragment>}
   <label style={{display:'grid',gap:3}}>{text('Label display')}<select aria-label={text('Label display')} style={select} value={options.labelMode} onChange={event=>onChange({...options,labelMode:event.target.value as DetectionExplorerOptions['labelMode']})}><option value="focus">{text('On hover/select')}</option><option value="all">{text('All visible')}</option></select></label>
   <small>{text('Tap an outline to select its label. Map selections stay visible.')}</small>
  </div>
 </details>;
}
