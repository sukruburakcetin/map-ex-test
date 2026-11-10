/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { SelectedPlaceSummary, SelectedPlaceProps, placesScrollCss } from './SelectedPlaceCard';
import { LoadedPlacesList } from './LoadedPlacesList';
import type { PlaceListOrigin } from '../features/places/placeListUtils';
import type { Place, PlaceGroup } from '../features/places/placesModel';
import { PlaceQualityControls } from './PlaceQualityControls';
import { TileCategoryPicker } from './TileCategoryPicker';
import type { PlacesState } from '../features/places/PlacesController';
export const PlacesPanel: React.FC<{ tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {
 const { t, owned, formatLocale:locale } = useWidgetLocale();

  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && !!props.status.loadedCounts && props.status.count === 0;
  const canShowAll = empty && (props.tileSource ? !!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0);
  const readyMessage = empty
    ? ((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea'))
    : props.tileSource ? t(props.status.limited?'uiPoiNearestLimited':'uiPoiLoadedCount',{count:new Intl.NumberFormat(locale).format(props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});
  const readyHint = props.status.limited ? t(props.tileSource?'uiPoiZoomForMore':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';
  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };
  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;
  const counts = props.status.loadedCounts;
  const searchDisabled=!!props.tileLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);
  return <section className="mly-places-scroll" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>
    <style>{placesScrollCss}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong> {t('uiNearbyPlaces')} </strong><button type="button" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>
    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}
    {props.tileLoading&&<p role="status" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}
    <fieldset disabled={!!props.tileLoading} style={{border:0,padding:0,margin:0,minWidth:0}}>
    {props.tileSource ? <TileCategoryPicker value={props.tileFamily || 'all'} onChange={props.onTileFamily}/> : <div>
    <div role="group" aria-label={t('uiFilterLoadedPlaces')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>
      {categories.slice(0, 3).map(([value, label]) => <button key={value} type="button" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '5px 3px', font: 'inherit', fontSize: 10, lineHeight: 1.35, boxSizing: 'border-box', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}><span style={{ display: 'block', overflowWrap: 'anywhere', minWidth: 0 }}>{label}</span>{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}
    </div>
    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}> {t('uiMoreCategories')} </span><select aria-label={t('uiPlaceCategory')} value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>
      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}
    </select></label>
    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}> {t('uiCountsAreForLoadedPlaces')} </div>}
    </div>}
    {props.tileSource && props.onTileQuality && <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>}
    </fieldset>
    {props.tileSource && <p style={{fontSize:10,lineHeight:1.4,opacity:.75,margin:'8px 0'}}>{t('uiTilesUpdateAutomatically')}</p>}
    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{borderTop:'1px solid #506b5a',marginTop:10,paddingTop:8}:undefined}>
    {props.tileSource && <strong>{t('uiLoadedPlaces')}</strong>}
    {props.onAutoUpdate&&<div style={{marginTop:7}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0}}><input type="checkbox" role="switch" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{owned('Auto-update places')}</span></label><div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div></div>}
    {props.onSearch&&<button type="button" aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',boxSizing:'border-box',minHeight:32,marginTop:7,padding:'5px 7px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):owned('Search this area')}</button>}
    <p role="status" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>
    {canShowAll && <button type="button" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}
    {props.status.kind === 'outside' && props.onGoToArea && <button type="button" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}
    {props.status.kind === 'error' && !props.onSearch && <button type="button" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}
    {props.tileSource&&props.selection&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedOutsideList')}</p>}
    {props.onSelect && !empty && <LoadedPlacesList originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}
    </div>
    <span style={{ opacity: .7, fontSize: 10 }}> {t('uiSelectAPlaceForDetailsSourceOvertureMaps')} </span>
  </section>;
};
