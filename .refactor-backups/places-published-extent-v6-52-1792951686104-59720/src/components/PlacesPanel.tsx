/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';
import { LoadedPlacesList } from './LoadedPlacesList';
import type { Place, PlaceGroup } from '../features/places/placesModel';
import type { PlacesState } from '../features/places/PlacesController';
export const PlacesPanel: React.FC<{ places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {
  const messages = { off: 'Places are off.', paused: props.status.reason || 'Places will update when browsing pauses.', zoom: 'Zoom closer to see nearby places.', loading: 'Finding nearby places…', ready: props.status.limited ? `${props.status.count} places shown. Zoom closer to see a smaller area.` : `${props.status.count} ${props.status.count === 1 ? 'place' : 'places'} in this area.`, error: 'Places could not load. Try again.' };
  return <section aria-label="Nearby places" style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Nearby places</strong><button type="button" aria-label="Close nearby places filters" onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>
    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}
    <label style={{ display: 'block', marginTop: 7 }}>Show<select aria-label="Place category" value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 4, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>
      {[['all', 'All places'], ['health', 'Health'], ['education', 'Education'], ['parks', 'Parks'], ['landmarks', 'Landmarks'], ['services', 'Everyday services']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select></label>
    <p role="status" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>
    {props.status.kind === 'error' && <button type="button" onClick={props.onRetry}>Retry places</button>}
    {props.onSelect && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}
    <span style={{ opacity: .7, fontSize: 10 }}>Select a place for details. Source: Overture Maps.</span>
  </section>;
};
