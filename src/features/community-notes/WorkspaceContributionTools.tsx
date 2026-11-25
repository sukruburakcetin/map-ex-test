/** @jsx jsx */
import { WorkspaceFieldHelp } from "./WorkspaceFieldHelp";
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { ContributionStatistics, WorkspaceCategory } from './communityWorkspace';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceHeadingStyle as headingStyle, workspaceSummaryStyle as summaryStyle } from '../../styles/communityWorkspace';

/** Exact server totals and explicit loaded-result scope; color is paired with text.
 * Search runs on the service, including contributions outside the loaded page.
 */
export function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,waiting,onComposition,onSubmit,onClear,onQuery,onMine,moreActions}:{moreActions?:React.ReactNode;statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;waiting:boolean;onComposition(value:boolean):void;onSubmit():void;onClear():void;onQuery(value:string):void;onMine(value:boolean):void}) {
  const {owned:text}=useWidgetLocale();
  return <div className="mly-workspace-section" style={sectionStyle}>
    <h3 style={headingStyle}>{text('Find notes')}</h3>
    <WorkspaceFieldHelp label={text('Search notes')} help={text("Search shared contributions in the selected workspace. Use the filters to narrow the list.")}><input aria-label={text('Search notes')} style={input} type="search" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} onCompositionStart={()=>onComposition(true)} onCompositionEnd={event=>{onQuery(event.currentTarget.value);onComposition(false);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){event.preventDefault();onSubmit();}}} placeholder={text('Title, category, description, status or follow-up')} /></WorkspaceFieldHelp>
    {query&&<button className="mly-text-action" type="button" style={button} onClick={onClear}>{text('Clear search')}</button>}
    <WorkspaceFieldHelp label={text('Only my contributions')} help={text('Show shared contributions created by your signed-in account.')}>
      <input type="checkbox" checked={mine} onChange={event=>onMine(event.target.checked)} />
    </WorkspaceFieldHelp>
    <details>
      <summary style={summaryStyle}>{text('More note tools')}</summary>
      <div className="mly-workspace-tab-content">
        {moreActions}
    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>
      <span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Total contributions')}: {statistics.total}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('My contributions')}: {statistics.mine}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Contributors')}: {statistics.contributors}</span>
    </div><details><summary style={summaryStyle}>{text('Category and status statistics')}</summary>
      {categories.map(category=><div key={category.name} style={row}><span aria-hidden="true" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5'}} />{category.name}: {statistics.by_category[category.name]||0}</div>)}
      {Object.entries(statistics.by_status).map(([status,count])=><span key={status} style={{display:'block'}}>{text(({open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'} as Record<string,string>)[status]||status)}: {count}</span>)}
    </details></React.Fragment>}
      </div>
    </details>
    <span role="status" aria-live="polite" style={{padding:'8px 10px',background:'#ffffff0a',borderInlineStart:'3px solid #88b39e',borderRadius:4}}>{waiting?text('Search starts after you stop typing. Press Enter to search now.'):busy?text('Loading contributions…'):statistics?`${statistics.matching} ${text('matching contributions')} · ${text('Results are directly below.')}`:text('Contributions have not loaded.')}</span>
    {statistics&&loaded<statistics.matching&&<small>{text('The list and map show the same loaded results. Use Load more notes below to see more matches.')}</small>}
  </div>;
}
