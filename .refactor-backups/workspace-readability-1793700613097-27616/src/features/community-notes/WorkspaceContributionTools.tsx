/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import type { ContributionStatistics, WorkspaceCategory } from './communityWorkspace';
import { workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button } from '../../styles/communityWorkspace';

/** Exact server totals and explicit loaded-result scope; color is paired with text.
 * Search runs on the service, including contributions outside the loaded page.
 */
export function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,onQuery,onMine}:{statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;onQuery(value:string):void;onMine(value:boolean):void}) {
  const {owned:text}=useWidgetLocale();
  return <div style={card}>
    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>
      <span>{text('Total contributions')}: {statistics.total}</span><span>{text('My contributions')}: {statistics.mine}</span><span>{text('Contributors')}: {statistics.contributors}</span>
    </div><details><summary>{text('Category and status statistics')}</summary>
      {categories.map(category=><div key={category.name} style={row}><span aria-hidden="true" style={{width:12,height:12,background:category.color,border:'1px solid #9bb3a5'}} />{category.name}: {statistics.by_category[category.name]||0}</div>)}
      {Object.entries(statistics.by_status).map(([status,count])=><span key={status} style={{display:'block'}}>{text(({open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'} as Record<string,string>)[status]||status)}: {count}</span>)}
    </details></React.Fragment>}
    <label style={field}>{text('Search contributions')}<input aria-label={text('Search contributions')} style={input} type="search" maxLength={200} value={query} onChange={event=>onQuery(event.target.value)} placeholder={text('Category, description, status or resolution')} /></label>
    {query&&<button type="button" style={button} onClick={()=>onQuery('')}>{text('Clear search')}</button>}
    <label><input type="checkbox" checked={mine} onChange={event=>onMine(event.target.checked)} /> {text('Only my contributions')}</label>
    <span role="status">{busy?text('Loading contributions…'):statistics?`${loaded} / ${statistics.matching} ${text('matching contributions loaded on map')}`:text('Contributions have not loaded.')}</span>
    {statistics&&loaded<statistics.matching&&<small>{text('The map shows loaded results. Load more to display the remaining matches.')}</small>}
  </div>;
}
