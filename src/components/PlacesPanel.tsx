/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { SelectedPlaceSummary, SelectedPlaceProps, placesScrollCss } from './SelectedPlaceCard';
import { LoadedPlacesList } from './LoadedPlacesList';
import type { PlaceListOrigin } from '../features/places/placeListUtils';
import type { Place } from '../features/places/placesModel';
import { PlaceQualityControls } from './PlaceQualityControls';
import { TileCategoryPicker } from './TileCategoryPicker';
import type { PlacesState } from '../features/places/PlacesController';
export const PlacesPanel: React.FC<{ onShowOnMap?(id:string):void;onAreaSearch?(text:string):void;onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; status: PlacesState; onRetry(): void; onClose(): void }> = props => {
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

  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && props.status.count === 0;
  const canShowAll = empty && (!!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all');
  const readyMessage = empty
    ? (props.status.searchText?t('uiPoiNoSearchMatches'):((props.tileFamily && props.tileFamily !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea')))
    : t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)});
  const readyHint = props.status.limited && !true ? t('uiPoiMoreResultsAvailable') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';
  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.`, loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };
  const qualityCount=Number(props.tileQuality?.minimum!=null)+Number(!!props.tileQuality?.hideClosed);
  const searchDisabled=!!props.tileLoading||!!props.status.pageLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);
  const filterControls=(
    <fieldset disabled={!!props.tileLoading} style={{border:0,padding:0,margin:0,minWidth:0}}>
    {<TileCategoryPicker value={props.tileFamily || 'all'} onChange={props.onTileFamily}/>}
    {props.onTileQuality && <div className="mly-place-quality" style={{marginTop:5,borderBottom:'1px solid #506b5a55'}}>
      <div style={{minHeight:20,boxSizing:'border-box',padding:'3px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</div>
      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>
    </div>}
    </fieldset>
  );
  const autoControl=(
    props.onAutoUpdate&&<div style={{marginTop:0,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:30}}><input type="checkbox" role="switch" disabled={!!props.tileLoading} aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{t('uiPoiAutoShort')}</span></label>{false}</div>
  );
  return <section ref={panel} className="mly-places-scroll" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: collapsed&&pillPosition?pillPosition.left:42, top: collapsed&&pillPosition?pillPosition.top:6, zIndex: 10004, width: collapsed?'auto':190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: collapsed?'hidden':'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: collapsed?0:9, border: '1px solid #61846e', borderRadius: collapsed?18:8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>
    <style>{placesScrollCss}</style>
    {collapsed&&<button className="mly-text-action" ref={restoreButton} type="button" aria-label={t('uiPoiRestorePanel')} title={t('uiPoiRestorePanel')} aria-expanded={false} aria-controls={bodyId} onClick={toggleCollapsed} style={{display:'flex',alignItems:'center',gap:7,minHeight:30,maxWidth:'100%',padding:'4px 10px',boxSizing:'border-box',border:0,borderRadius:18,background:'transparent',color:'inherit',font:'inherit',cursor:'pointer'}}><span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t('uiPoiRestoreCount',{count:new Intl.NumberFormat(locale).format(props.status.count)})}</span><span aria-hidden="true">+</span></button>}
    <div hidden={collapsed} className="mly-places-panel-header" style={{position:'sticky',top:0,zIndex:3,background:'#192e25',margin:'-9px -9px 4px',padding:'3px 7px',borderBottom:'1px solid #506b5a55',display:collapsed?'none':'flex',justifyContent:'space-between',alignItems:'center',gap:3}}>
      <strong title={t('uiNearbyPlaces')} style={{minWidth:0,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t('uiNearbyPlaces')}</strong>
      {props.onSearch&&<button type="button" aria-label={owned('Search this area')} title={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{minHeight:30,minWidth:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',opacity:searchDisabled?.45:1,cursor:searchDisabled?'default':'pointer'}}><span aria-hidden="true">↻</span></button>}
      <button ref={minimizeButton} type="button" aria-label={t('uiPoiMinimizePanel')} title={t('uiPoiMinimizePanel')} aria-expanded={true} aria-controls={bodyId} onClick={toggleCollapsed} style={{minWidth:30,minHeight:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',cursor:'pointer'}}><span aria-hidden="true">−</span></button>
      <button type="button" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{border:0,background:'none',color:'inherit',cursor:'pointer',padding:3,minWidth:30,minHeight:30}}>×</button>
    </div>
    <div id={bodyId} hidden={collapsed} style={{display:collapsed?'none':undefined}}>
    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}
    {props.tileLoading&&props.status.kind!=='loading'&&<p role="status" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}
    {<details className="mly-place-filters" style={{borderBottom:'1px solid #506b5a55',marginBottom:4}}><summary style={{cursor:'pointer',minHeight:30,padding:'6px 0',boxSizing:'border-box',fontSize:10}}>{t('uiFilterNearbyPlaces')}{qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all')>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all'))}</span>}</summary>{filterControls}{autoControl}</details>}
    <div role={'region'} aria-label={t('uiLoadedPlaces')} style={{marginTop:5}}>
    <div style={{display:'flex',gap:6,alignItems:'center',marginTop:5}}>
    </div>
    {!(props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role="status" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}
    {canShowAll && <button className="mly-text-action" type="button" onClick={() => props.onTileFamily?.('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}
    {props.status.kind === 'outside' && props.onGoToArea && <button className="mly-text-action" type="button" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}
    {props.status.kind === 'error' && <button className="mly-text-action" type="button" onClick={props.onRetry} style={{width:'100%',minHeight:30,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',cursor:'pointer'}}> {t('uiRetryPlaces')} </button>}
    {props.selection&&!props.tileLoading&&['ready','search'].includes(props.status.kind)&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedNotInPage')}</p>}
    {props.status.pageError&&<p role="alert">{t('uiPoiPageFailed')}</p>}
    {props.onSelect && (!empty||!!props.onAreaSearch) && (!props.tileLoading||!!props.places?.length) && <LoadedPlacesList failed={props.status.kind==='error'||!!props.status.pageError} visible={!collapsed} loading={!!props.tileLoading||['loading','paused'].includes(props.status.kind)||!!props.status.pageLoading} onShowOnMap={props.onShowOnMap} heading={props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={true} compact={true} originIsSnapshot={true} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}
    {((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:6,alignItems:'center',margin:'6px 4px 0',fontSize:10}}>
      {(props.status.pageOffset||0)>0&&<button type="button" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',boxSizing:'border-box',width:30,height:30,minWidth:30,minHeight:30,padding:4,display:'grid',placeItems:'center',lineHeight:1.2,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden="true">‹</span></button>}
      {props.status.limited&&<button className="mly-text-action" type="button" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,boxSizing:'border-box',height:30,minWidth:0,minHeight:30,padding:'4px 6px',lineHeight:1.2,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}
    </div>}

    </div>
    {<details style={{borderTop:'1px solid #506b5a55',marginTop:6,fontSize:9,lineHeight:1.4,opacity:.85}}>
      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>
      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>
      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>
    </details>}
    </div>
  </section>;
};
