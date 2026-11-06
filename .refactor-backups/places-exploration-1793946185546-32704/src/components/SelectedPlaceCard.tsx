/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { placeCategoryIcon } from '../features/places/placeIcons';
import type { Place } from '../features/places/placesModel';
export interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; onBack?(): void; onLink(value: boolean): void; onDetails(): void; onClear(): void; }
export const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>
  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>
    <img src={placeCategoryIcon(props.place.group, true)} alt="" aria-hidden="true" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>
    <button type="button" title={t('uiOpenSelectedPlaceDetails')} onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>
    <button type="button" aria-label={t('uiClearSelectedPlace')} onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>×</button>
  </div>
  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} · <a href="https://docs.overturemaps.org/attribution/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}> {t('uiOverture')} </a></div>
  <div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{owned(props.cameraDistance || t('uiOpenImageDistance'))}</div>
  {props.onBack && <button type="button" onClick={props.onBack} title={t('uiCenterTheMapOnThisPlace')} style={{ display: 'block', width: '100%', minHeight: 28, marginTop: 5, padding: '4px 7px', border: '1px solid #61846e', borderRadius: 4, background: '#284b38', color: 'inherit', font: 'inherit', fontSize: 11, textAlign: 'left', cursor: 'pointer' }}> {t('uiBackToPlace')} </button>}
  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type="checkbox" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/> {t('uiShowCameraLink')} </label>
</div>; };
export const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <section aria-label={t('uiSelectedPlace')} style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>; };
