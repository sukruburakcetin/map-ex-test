/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { placeCategoryIcon } from '../features/places/placeIcons';
import type { Place } from '../features/places/placesModel';
export interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; onLink(value: boolean): void; onDetails(): void; onClear(): void; }
export const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>
  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>
    <img src={placeCategoryIcon(props.place.group, true)} alt="" aria-hidden="true" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>
    <button type="button" title="Open selected place details" onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>
    <button type="button" aria-label="Clear selected place" onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>×</button>
  </div>
  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} · <a href="https://docs.overturemaps.org/attribution/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Overture</a></div>
  <div title="Approximate straight-line distance, not walking distance or visibility" style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{props.cameraDistance || 'Open an image for camera distance'}</div>
  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type="checkbox" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/>Show camera link</label>
</div>;
export const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => <section aria-label="Selected place" style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>;
