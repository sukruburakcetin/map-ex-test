import { React } from 'jimu-core';
import type { CommunityWorkspaceClient, ContributionPage } from './communityWorkspace';

/** Debounced server search with independent read ownership; writes never wait for
 * typing. Workspace/filter changes clear old rows and retire late pages. Exact
 * service statistics remain separate from the progressively loaded map/list.
 */
export function useWorkspaceContributions(api: CommunityWorkspaceClient | null, workspace: string) {
  const [query,setQuery] = React.useState(''), [mine,setMine] = React.useState(false);
  const [search,setSearch] = React.useState(''), [revision,setRevision] = React.useState(0);
  const [page,setPage] = React.useState<ContributionPage | null>(null);
  const [busy,setBusy] = React.useState(false), [error,setError] = React.useState('');
  const generation = React.useRef(0), inFlight = React.useRef(false);
  const pending = React.useRef<AbortController|null>(null);
  const nextOffset = React.useRef(0);
  const source = React.useRef<{api: CommunityWorkspaceClient; workspace: string}|null>(null);
  const [composing,setComposing] = React.useState(false);
  // Wait through ordinary pauses and IME composition; Enter can apply immediately.
  React.useEffect(()=>{if(composing)return;const timer=setTimeout(()=>setSearch(query.trim()),700);return()=>clearTimeout(timer);},[query,composing]);
  React.useEffect(()=>{setQuery('');setSearch('');setMine(false);},[workspace]);
  React.useEffect(()=>{
    const current=++generation.current; pending.current?.abort();nextOffset.current=0;inFlight.current=false;setError('');
    // Preserve readable results while the same workspace searches/refreshes.
    if(source.current?.api!==api||source.current?.workspace!==workspace)setPage(null);
    if(!api||!workspace){setBusy(false);return;}
    const abort=new AbortController();pending.current=abort;
    inFlight.current=true;setBusy(true);
    void api.contributions(workspace,search,mine,0,abort.signal).then(result=>{if(current===generation.current){nextOffset.current=result.notes.length;source.current={api,workspace};setPage(result);}},failure=>{
      if(current===generation.current){setPage(null);setError((failure as Error).message||'Contributions could not load.');}
    }).finally(()=>{if(current===generation.current){setBusy(false);inFlight.current=false;}});
    return()=>{++generation.current;pending.current?.abort();};
  },[api,workspace,search,mine,revision]);
  function loadMore(){
    if(!api||!workspace||!page||inFlight.current||nextOffset.current>=page.statistics.matching)return;
    const current=generation.current, offset=nextOffset.current;const abort=new AbortController();pending.current=abort;inFlight.current=true;setBusy(true);setError('');
    void api.contributions(workspace,search,mine,offset,abort.signal).then(result=>{
      // Concurrent inserts/deletes can shift an offset page. Refresh the first
      // page rather than merging duplicates while claiming all matches loaded.
      if(current===generation.current&&(result.statistics.matching!==page.statistics.matching||result.notes.some(note=>page.notes.some(previous=>previous.id===note.id)))){
        setRevision(value=>value+1);return;
      }
      if(current===generation.current){nextOffset.current=offset+result.notes.length;setPage(previous=>({...result,notes:Array.from(new Map([...(previous?.notes||[]),...result.notes].map(note=>[note.id,note])).values())}));}
    },failure=>{if(current===generation.current)setError((failure as Error).message||'Contributions could not load.');})
      .finally(()=>{if(current===generation.current){setBusy(false);inFlight.current=false;}});
  }
  const refresh=React.useCallback(()=>setRevision(value=>value+1),[]);
  // Prevent a previous workspace's rows appearing during the render before effect cleanup.
  const visible = source.current?.api===api&&source.current?.workspace===workspace ? page : null;
  const waiting=composing||query.trim()!==search;
  return {query,setQuery,mine,setMine,page:visible,busy:busy||waiting,waiting,setComposing,submitSearch:()=>{if(!composing)setSearch(query.trim());},clearSearch:()=>{setQuery('');setSearch('');},error,hasMore:!!visible&&nextOffset.current<visible.statistics.matching,loadMore,refresh};
}
