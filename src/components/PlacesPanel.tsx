/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { SelectedPlaceSummary, SelectedPlaceProps } from './SelectedPlaceCard';
import { LoadedPlacesList } from './LoadedPlacesList';
import type { Place, PlaceGroup } from '../features/places/placesModel';
import type { PlacesState } from '../features/places/PlacesController';
export const PlacesPanel: React.FC<{ onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {
 const { t, formatLocale:locale } = useWidgetLocale();

  const empty = props.status.kind === 'ready' && props.status.count === 0;
  const canShowAll = empty && props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0;
  const readyMessage = empty
    ? (props.group !== 'all' ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea'))
    : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});
  const readyHint = props.status.limited ? t('uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';
  const messages = { outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };
  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;
  const counts = props.status.kind === 'ready' ? props.status.loadedCounts : undefined;
  return <section aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong> {t('uiNearbyPlaces')} </strong><button type="button" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>
    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}
    <div role="group" aria-label={t('uiFilterLoadedPlaces')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>
      {categories.slice(0, 3).map(([value, label]) => <button key={value} type="button" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '4px 2px', font: 'inherit', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}>{label}{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}
    </div>
    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}> {t('uiMoreCategories')} </span><select aria-label={t('uiPlaceCategory')} value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>
      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}
    </select></label>
    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}> {t('uiCountsAreForLoadedPlaces')} </div>}
    <p role="status" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>
    {canShowAll && <button type="button" onClick={() => props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}
    {props.status.kind === 'outside' && props.onGoToArea && <button type="button" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}
    {props.status.kind === 'error' && <button type="button" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}
    {props.onSelect && !empty && <LoadedPlacesList places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}
    <span style={{ opacity: .7, fontSize: 10 }}> {t('uiSelectAPlaceForDetailsSourceOvertureMaps')} </span>
  </section>;
};
