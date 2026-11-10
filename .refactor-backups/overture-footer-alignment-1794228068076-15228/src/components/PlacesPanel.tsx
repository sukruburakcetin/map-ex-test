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
export const PlacesPanel: React.FC<{ onShowOnMap?(id:string):void;onAreaSearch?(text:string):void;onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {
 const { t, owned, formatLocale:locale } = useWidgetLocale();
 const [collapsed,setCollapsed]=React.useState(false),[pillPosition,setPillPosition]=React.useState<{left:number;top:number}|null>(null),panel=React.useRef<HTMLElement>(null),savedScroll=React.useRef(0),restoreButton=React.useRef<HTMLButtonElement>(null),minimizeButton=React.useRef<HTMLButtonElement>(null),wasMinimized=React.useRef(false),bodyId=React.useId();
 React.useEffect(()=>{
   if(panel.current)panel.current.scrollTop=collapsed?0:savedScroll.current;
   if(collapsed)restoreButton.current?.focus({preventScroll:true});
   else if(wasMinimized.current)minimizeButton.current?.focus({preventScroll:true});
   wasMinimized.current=collapsed;
 },[collapsed]);
 React.useEffect(()=>{
   if(!collapsed)return;
   const container=panel.current?.offsetParent as HTMLElement|null;
   const anchor=container?.querySelector<HTMLElement>('[data-mly-places-toggle]');
   if(!container||!anchor)return;
   const update=()=>{
     const box=container.getBoundingClientRect(),button=anchor.getBoundingClientRect();
     if(!box.width||!box.height)return;
     const sx=box.width/(container.offsetWidth||box.width),sy=box.height/(container.offsetHeight||box.height);
     const maxLeft=Math.max(6,container.clientWidth-(panel.current?.offsetWidth||100)-6),maxTop=Math.max(6,container.clientHeight-(panel.current?.offsetHeight||32)-6);
     const next={left:Math.min(maxLeft,Math.max(6,(button.right-box.left)/sx-container.clientLeft+container.scrollLeft+6)),top:Math.min(maxTop,Math.max(6,(button.top-box.top)/sy-container.clientTop+container.scrollTop))};
     setPillPosition(old=>old&&Math.abs(old.left-next.left)<.5&&Math.abs(old.top-next.top)<.5?old:next);
   };
   update();
   const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(update);
   observer?.observe(container);observer?.observe(anchor.closest('.mly-control-rail')||anchor);if(panel.current)observer?.observe(panel.current);
   container.addEventListener('scroll',update,true);window.addEventListener('resize',update);
   return()=>{observer?.disconnect();container.removeEventListener('scroll',update,true);window.removeEventListener('resize',update);};
 },[collapsed]);
 const toggleCollapsed=()=>{if(!collapsed)savedScroll.current=panel.current?.scrollTop||0;props.onHover?.(null);setCollapsed(!collapsed);};

  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && !!props.status.loadedCounts && props.status.count === 0;
  const canShowAll = empty && (props.tileSource ? !!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0);
  const readyMessage = empty
    ? (props.tileSource&&props.status.searchText?t('uiPoiNoSearchMatches'):((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea')))
    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});
  const readyHint = props.status.limited && !props.tileSource ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';
  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };
  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;
  const counts = props.status.loadedCounts;
  const qualityCount=Number(props.tileQuality?.minimum!=null)+Number(!!props.tileQuality?.hideClosed);
  const searchDisabled=!!props.tileLoading||!!props.status.pageLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);
  const filterControls=(
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
    {props.tileSource && props.onTileQuality && <div className="mly-place-quality" style={{marginTop:5,borderBottom:'1px solid #506b5a55'}}>
      <div style={{minHeight:20,boxSizing:'border-box',padding:'3px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</div>
      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>
    </div>}
    </fieldset>
  );
  const autoControl=(
    props.onAutoUpdate&&<div style={{marginTop:props.tileSource?0:7,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:props.tileSource?30:undefined}}><input type="checkbox" role="switch" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{props.tileSource?t('uiPoiAutoShort'):owned('Auto-update places')}</span></label>{!props.tileSource&&<div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div>}</div>
  );
  return <section ref={panel} className="mly-places-scroll" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: collapsed&&pillPosition?pillPosition.left:42, top: collapsed&&pillPosition?pillPosition.top:6, zIndex: 10004, width: collapsed?'auto':190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: collapsed?'hidden':'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: collapsed?0:9, border: '1px solid #61846e', borderRadius: collapsed?18:8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>
    <style>{placesScrollCss}</style>
    {collapsed&&<button ref={restoreButton} type="button" aria-label={t('uiPoiRestorePanel')} title={t('uiPoiRestorePanel')} aria-expanded={false} aria-controls={bodyId} onClick={toggleCollapsed} style={{display:'flex',alignItems:'center',gap:7,minHeight:30,maxWidth:'100%',padding:'4px 10px',boxSizing:'border-box',border:0,borderRadius:18,background:'transparent',color:'inherit',font:'inherit',cursor:'pointer'}}><span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t('uiPoiRestoreCount',{count:new Intl.NumberFormat(locale).format(props.status.count)})}</span><span aria-hidden="true">+</span></button>}
    <div hidden={collapsed} className="mly-places-panel-header" style={{position:'sticky',top:0,zIndex:3,background:'#192e25',margin:'-9px -9px 4px',padding:'3px 7px',borderBottom:'1px solid #506b5a55',display:collapsed?'none':'flex',justifyContent:'space-between',alignItems:'center',gap:3}}>
      <strong title={t('uiNearbyPlaces')} style={{minWidth:0,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t('uiNearbyPlaces')}</strong>
      {props.tileSource&&props.onSearch&&<button type="button" aria-label={owned('Search this area')} title={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{minHeight:30,minWidth:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',opacity:searchDisabled?.45:1,cursor:searchDisabled?'default':'pointer'}}><span aria-hidden="true">↻</span></button>}
      <button ref={minimizeButton} type="button" aria-label={t('uiPoiMinimizePanel')} title={t('uiPoiMinimizePanel')} aria-expanded={true} aria-controls={bodyId} onClick={toggleCollapsed} style={{minWidth:30,minHeight:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',cursor:'pointer'}}><span aria-hidden="true">−</span></button>
      <button type="button" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{border:0,background:'none',color:'inherit',cursor:'pointer',padding:3,minWidth:30,minHeight:30}}>×</button>
    </div>
    <div id={bodyId} hidden={collapsed} style={{display:collapsed?'none':undefined}}>
    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}
    {props.tileLoading&&<p role="status" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}
    {props.tileSource?<details className="mly-place-filters" style={{borderBottom:'1px solid #506b5a55',marginBottom:4}}><summary style={{cursor:'pointer',minHeight:30,padding:'6px 0',boxSizing:'border-box',fontSize:10}}>{t('uiFilterNearbyPlaces')}{qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all')>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all'))}</span>}</summary>{filterControls}{autoControl}</details>:filterControls}
    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>
    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>
    {!props.tileSource&&autoControl}
    {!props.tileSource&&props.onSearch&&<button type="button" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}
    </div>
    {!(props.tileSource&&props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role="status" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}
    {canShowAll && <button type="button" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}
    {props.status.kind === 'outside' && props.onGoToArea && <button type="button" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}
    {props.status.kind === 'error' && <button type="button" onClick={props.onRetry} style={{width:'100%',minHeight:30,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',cursor:'pointer'}}> {t('uiRetryPlaces')} </button>}
    {props.tileSource&&props.selection&&!props.tileLoading&&['ready','search'].includes(props.status.kind)&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedNotInPage')}</p>}
    {props.tileSource&&props.status.pageError&&<p role="alert">{t('uiPoiPageFailed')}</p>}
    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList failed={props.status.kind==='error'||!!props.status.pageError} visible={!collapsed} loading={!!props.tileLoading||['loading','paused'].includes(props.status.kind)||!!props.status.pageLoading} onShowOnMap={props.onShowOnMap} heading={props.tileSource&&props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}
    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>
      {(props.status.pageOffset||0)>0&&<button type="button" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden="true">‹</span></button>}
      {props.status.limited&&<button type="button" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}
    </div>}

    </div>
    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>
      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>
      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>
      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>
    </details>:<span style={{opacity:.7,fontSize:10}}>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</span>}
    </div>
  </section>;
};
