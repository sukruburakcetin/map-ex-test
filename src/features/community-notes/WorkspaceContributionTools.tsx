/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { ContributionStatistics, WorkspaceCategory } from './communityWorkspace';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceHeadingStyle as headingStyle, workspaceSummaryStyle as summaryStyle } from '../../styles/communityWorkspace';

/** Exact server totals and explicit loaded-result scope; color is paired with text.
 * Search runs on the service, including contributions outside the loaded page.
 */
export function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,waiting,onComposition,onSubmit,onClear,onQuery,onMine}:{statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;waiting:boolean;onComposition(value:boolean):void;onSubmit():void;onClear():void;onQuery(value:string):void;onMine(value:boolean):void}) {
  const {owned:text}=useWidgetLocale();
  return <div className="mly-workspace-section" style={sectionStyle}>
    <h3 style={headingStyle}>{text('Find contributions')}</h3>
    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>
      <span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Total contributions')}: {statistics.total}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('My contributions')}: {statistics.mine}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Contributors')}: {statistics.contributors}</span>
    </div><details><summary style={summaryStyle}>{text('Category and status statistics')}</summary>
      {categories.map(category=><div key={category.name} style={row}><span aria-hidden="true" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5'}} />{category.name}: {statistics.by_category[category.name]||0}</div>)}
      {Object.entries(statistics.by_status).map(([status,count])=><span key={status} style={{display:'block'}}>{text(({open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'} as Record<string,string>)[status]||status)}: {count}</span>)}
    </details></React.Fragment>}
    <label style={field}>{text('Search contributions')}<input aria-label={text('Search contributions')} style={input} type="search" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} onCompositionStart={()=>onComposition(true)} onCompositionEnd={event=>{onQuery(event.currentTarget.value);onComposition(false);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();onSubmit();}}} placeholder={text('Title, category, description, status or follow-up')} /></label>
    {query&&<button type="button" style={button} onClick={onClear}>{text('Clear search')}</button>}
    <label style={{display:'flex',alignItems:'center',gap:8}}><input style={{margin:0,flexShrink:0}} type="checkbox" checked={mine} onChange={event=>onMine(event.target.checked)} /> {text('Only my contributions')}</label>
    <span role="status" aria-live="polite" style={{padding:'8px 10px',background:'#ffffff0a',borderInlineStart:'3px solid #88b39e',borderRadius:4}}>{waiting?text('Search starts after you stop typing. Press Enter to search now.'):busy?text('Loading contributions…'):statistics?`${statistics.matching} ${text('matching contributions')} · ${text('Results are directly below.')}`:text('Contributions have not loaded.')}</span>
    {statistics&&loaded<statistics.matching&&<small>{text('The list and map show the same loaded results. Use Load more notes below to see more matches.')}</small>}
  </div>;
}
