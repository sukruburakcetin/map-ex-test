/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import type { Place } from '../features/places/placesModel';
import { placeCategoryIcon } from '../features/places/placeIcons';
import { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE } from '../features/places/placeListUtils';
export const LoadedPlacesList: React.FC<{ places: readonly Place[]; selectedId?: string; onSelect(id: string): void }> = props => {
  const [open, setOpen] = React.useState(false), [query, setQuery] = React.useState(''), [page, setPage] = React.useState(0);
  const matches = React.useMemo(() => filterLoadedPlaces(props.places, query), [props.places, query]);
  const pages = Math.max(1, Math.ceil(matches.length / PLACE_LIST_PAGE_SIZE)), current = Math.min(page, pages - 1);
  React.useEffect(() => { setPage(0); }, [props.places]);
  return <div style={{ borderTop: '1px solid #61846e55', paddingTop: 6, marginBottom: 6 }}>
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', border: 0, background: 'none', color: 'inherit', padding: '3px 0', fontSize: 11, cursor: 'pointer' }}><span>Browse places ({props.places.length})</span><span aria-hidden="true">{open ? '▴' : '▾'}</span></button>
    {open && <div>
      <input type="search" aria-label="Find a loaded place" placeholder="Find a loaded place" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} style={{ boxSizing: 'border-box', width: '100%', margin: '5px 0', minHeight: 28, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#213c2e', color: 'inherit', fontSize: 11 }}/>
      <div role="group" aria-label="Loaded places">
        {matches.slice(current * PLACE_LIST_PAGE_SIZE, (current + 1) * PLACE_LIST_PAGE_SIZE).map(place => <button type="button" key={place.id} aria-pressed={place.id === props.selectedId} title={place.name} onClick={() => props.onSelect(place.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 34, padding: '4px 3px', border: 0, borderBottom: '1px solid #61846e33', background: place.id === props.selectedId ? '#496047' : 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
          <img src={placeCategoryIcon(place.group)} alt="" width={16} height={16} style={{ flexShrink: 0 }}/><span style={{ minWidth: 0 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{place.name}</span><span style={{ display: 'block', fontSize: 9, opacity: .75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.category.replace(/_/g, ' ')}</span></span>
        </button>)}
        {!matches.length && <p style={{ fontSize: 10, lineHeight: 1.4 }}>{query ? 'No loaded places match this search.' : 'No places loaded here yet.'}</p>}
      </div>
      {pages > 1 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, fontSize: 10 }}><button type="button" aria-label="Previous places" disabled={current === 0} onClick={() => setPage(current - 1)}>‹</button><span>{current + 1} / {pages}</span><button type="button" aria-label="Next places" disabled={current + 1 >= pages} onClick={() => setPage(current + 1)}>›</button></div>}
      <p style={{ margin: '5px 0 0', fontSize: 9, opacity: .75 }}>Loaded map results only.</p>
    </div>}
  </div>;
};
