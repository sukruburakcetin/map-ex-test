#!/usr/bin/env node
'use strict';
/**
 * Compact Overture places. Requires the preceding scale-aware POIs and paging update.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/components/PlacesPanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/PlacesPanel.tsx 1",
              "before": "export const PlacesPanel: React.FC<{ onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n const { t, owned, formatLocale:locale } = useWidgetLocale();\n\n  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && !!props.status.loadedCounts && props.status.count === 0;\n  const canShowAll = empty && (props.tileSource ? !!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0);\n  const readyMessage = empty\n    ? ((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea'))\n    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});\n  const readyHint = props.status.limited ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';\n  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };\n  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;\n  const counts = props.status.loadedCounts;\n  const searchDisabled=!!props.tileLoading||!!props.status.pageLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);\n  return <section className=\"mly-places-scroll\" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <style>{placesScrollCss}</style>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong> {t('uiNearbyPlaces')} </strong><button type=\"button\" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}>×</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    {props.tileLoading&&<p role=\"status\" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}\n    <fieldset disabled={!!props.tileLoading} style={{border:0,padding:0,margin:0,minWidth:0}}>\n    {props.tileSource ? <TileCategoryPicker value={props.tileFamily || 'all'} onChange={props.onTileFamily}/> : <div>\n    <div role=\"group\" aria-label={t('uiFilterLoadedPlaces')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>\n      {categories.slice(0, 3).map(([value, label]) => <button key={value} type=\"button\" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '5px 3px', font: 'inherit', fontSize: 10, lineHeight: 1.35, boxSizing: 'border-box', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}><span style={{ display: 'block', overflowWrap: 'anywhere', minWidth: 0 }}>{label}</span>{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}\n    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}> {t('uiMoreCategories')} </span><select aria-label={t('uiPlaceCategory')} value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}> {t('uiCountsAreForLoadedPlaces')} </div>}\n    </div>}\n    {props.tileSource && props.onTileQuality && <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>}\n    </fieldset>\n    {props.tileSource && <p style={{fontSize:10,lineHeight:1.4,opacity:.75,margin:'8px 0'}}>{t('uiTilesUpdateAutomatically')}</p>}\n    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{borderTop:'1px solid #506b5a',marginTop:10,paddingTop:8}:undefined}>\n    {props.tileSource && <strong>{t('uiLoadedPlaces')}</strong>}\n    {props.onAutoUpdate&&<div style={{marginTop:7}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0}}><input type=\"checkbox\" role=\"switch\" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{owned('Auto-update places')}</span></label><div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div></div>}\n    {props.onSearch&&<button type=\"button\" aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',boxSizing:'border-box',minHeight:32,marginTop:7,padding:'5px 7px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):owned('Search this area')}</button>}\n    <p role=\"status\" style={{ lineHeight: 1.4, margin: '8px 0' }}>{messages[props.status.kind]}</p>\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && !props.onSearch && <button type=\"button\" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedOutsideList')}</p>}\n    {props.tileSource&&<p style={{fontSize:9,lineHeight:1.4,opacity:.75}}>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onPreviousResults} style={{flex:1,minWidth:0,minHeight:32,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiPreviousResults')}</button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:32,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n    {props.onSelect && !empty && <LoadedPlacesList originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    </div>\n    <span style={{ opacity: .7, fontSize: 10 }}> {t('uiSelectAPlaceForDetailsSourceOvertureMaps')} </span>\n  </section>;\n};\n",
              "after": "export const PlacesPanel: React.FC<{ onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n const { t, owned, formatLocale:locale } = useWidgetLocale();\n\n  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && !!props.status.loadedCounts && props.status.count === 0;\n  const canShowAll = empty && (props.tileSource ? !!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0);\n  const readyMessage = empty\n    ? ((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea'))\n    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});\n  const readyHint = props.status.limited && !props.tileSource ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';\n  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };\n  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;\n  const counts = props.status.loadedCounts;\n  const qualityCount=Number(props.tileQuality?.minimum!=null)+Number(!!props.tileQuality?.hideClosed);\n  const searchDisabled=!!props.tileLoading||!!props.status.pageLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);\n  return <section className=\"mly-places-scroll\" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <style>{placesScrollCss}</style>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong> {t('uiNearbyPlaces')} </strong><button type=\"button\" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4, minWidth:32, minHeight:32 }}>×</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    {props.tileLoading&&<p role=\"status\" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}\n    <fieldset disabled={!!props.tileLoading} style={{border:0,padding:0,margin:0,minWidth:0}}>\n    {props.tileSource ? <TileCategoryPicker value={props.tileFamily || 'all'} onChange={props.onTileFamily}/> : <div>\n    <div role=\"group\" aria-label={t('uiFilterLoadedPlaces')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>\n      {categories.slice(0, 3).map(([value, label]) => <button key={value} type=\"button\" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '5px 3px', font: 'inherit', fontSize: 10, lineHeight: 1.35, boxSizing: 'border-box', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}><span style={{ display: 'block', overflowWrap: 'anywhere', minWidth: 0 }}>{label}</span>{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}\n    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}> {t('uiMoreCategories')} </span><select aria-label={t('uiPlaceCategory')} value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}> {t('uiCountsAreForLoadedPlaces')} </div>}\n    </div>}\n    {props.tileSource && props.onTileQuality && <details className=\"mly-place-quality\" style={{marginTop:5,borderBottom:'1px solid #506b5a55'}}>\n      <summary style={{cursor:'pointer',minHeight:36,boxSizing:'border-box',padding:'9px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</summary>\n      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>\n    </details>}\n    </fieldset>\n    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {props.onAutoUpdate&&<div style={{marginTop:props.tileSource?0:7,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:props.tileSource?36:undefined}}><input type=\"checkbox\" role=\"switch\" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{props.tileSource?t('uiPoiAutoShort'):owned('Auto-update places')}</span></label>{!props.tileSource&&<div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div>}</div>}\n    {props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:36,marginTop:props.tileSource?0:7,padding:'5px 7px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n    <p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && !props.onSearch && <button type=\"button\" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedOutsideList')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && !empty && <LoadedPlacesList defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 36px',minWidth:0,minHeight:36,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:36,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>\n      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>\n    </details>:<span style={{opacity:.7,fontSize:10}}>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</span>}\n  </section>;\n};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/LoadedPlacesList.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/LoadedPlacesList.tsx 1",
              "before": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nexport const LoadedPlacesList:React.FC<{originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{\n const {t,formatLocale:locale,owned:text}=useWidgetLocale();\n const [open,setOpen]=React.useState(false),[query,setQuery]=React.useState(''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');\n const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null);\n const origin=held===undefined?props.origin:held;\n const matches=React.useMemo(()=>filterLoadedPlaces(props.places,query,sort==='distance'?origin:null),[props.places,query,sort,origin?.lon,origin?.lat]);\n const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);\n React.useEffect(()=>{setPage(0);},[props.places]);\n React.useEffect(()=>{if(!props.revealRequest||!props.selectedId)return;setOpen(true);setQuery('');const all=filterLoadedPlaces(props.places,'',sort==='distance'?origin:null);const index=all.findIndex(place=>place.id===props.selectedId);if(index>=0)setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));},[props.revealRequest]);\n React.useEffect(()=>{if(!props.revealRequest||!open||query)return;const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});},[props.revealRequest,open,current,query]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',fontSize:11,cursor:'pointer'}}><span>{t('uiBrowsePlaces')} {props.places.length})</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n  {open&&<div>\n   <input type=\"search\" aria-label={t('uiFindALoadedPlace')} placeholder={t('uiFindALoadedPlace')} value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',margin:'5px 0',minHeight:28,padding:'4px 6px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n   <div ref={rows} role=\"group\" aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><button type=\"button\" key={place.id} data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',minHeight:34,padding:'4px 3px',border:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>)}\n    {!matches.length&&<p style={{fontSize:10,lineHeight:1.4}}>{query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   <p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>\n  </div>}\n </div>;\n};\n",
              "after": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nexport const LoadedPlacesList:React.FC<{defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{\n const {t,formatLocale:locale,owned:text}=useWidgetLocale();\n const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');\n const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null);\n const origin=held===undefined?props.origin:held;\n const matches=React.useMemo(()=>filterLoadedPlaces(props.places,query,sort==='distance'?origin:null),[props.places,query,sort,origin?.lon,origin?.lat]);\n const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);\n React.useEffect(()=>{setPage(0);},[props.places]);\n React.useEffect(()=>{if(!props.revealRequest||!props.selectedId)return;setOpen(true);setQuery('');const all=filterLoadedPlaces(props.places,'',sort==='distance'?origin:null);const index=all.findIndex(place=>place.id===props.selectedId);if(index>=0)setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));},[props.revealRequest]);\n React.useEffect(()=>{if(!props.revealRequest||!open||query)return;const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});},[props.revealRequest,open,current,query]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:32,fontSize:11,cursor:'pointer'}}><span>{t('uiBrowsePlaces')} {props.places.length})</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n  {open&&<div>\n   <input type=\"search\" aria-label={t('uiFindALoadedPlace')} placeholder={t('uiFindALoadedPlace')} value={query} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',margin:'5px 0',minHeight:props.compact?34:28,padding:'4px 6px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?32:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n   <div ref={rows} role=\"group\" aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><button type=\"button\" key={place.id} data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',minHeight:props.compact?38:34,padding:'4px 3px',border:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>)}\n    {!matches.length&&<p style={{fontSize:10,lineHeight:1.4}}>{query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n};\n\nconst compactPageButton={minHeight:36,minWidth:36,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/placesPanelRendering.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/placesPanelRendering.test.cjs 1",
              "before": " if(name.endsWith('SelectedPlaceCard'))return{placesScrollCss:'',SelectedPlaceSummary:()=>null};\n if(name.endsWith('LoadedPlacesList'))return{LoadedPlacesList:()=>null};\n throw Error(name);\n}\nnew Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/PlacesPanel.tsx'),'utf8'),{fileName:'PlacesPanel.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,localRequire);\nconst flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value?.children?flatten(value.children):'';\ntest('tile mode describes loaded results without claiming the number of rendered map points',()=>{\n const props={status:{kind:'ready',count:200,limited:true,loadedCounts:{all:200}},group:'all',onGroup(){},onRetry(){},onClose(){}};\n const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiPoiResultRange'));assert(native.includes('uiPoiMoreResultsAvailable'));assert(!native.includes('uiPlacesShown'));assert(!native.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));\n const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiPlacesShown'));assert(original.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));\n});\n\ntest('native list zoom message does not imply that tile rendering is unavailable',()=>{\n const props={status:{kind:'zoom',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}};\n const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiLoadedPlaces: appZoomCloser'));assert(!native.includes('uiZoomCloserToSeeNearbyPlaces'));\n const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiZoomCloserToSeeNearbyPlaces'));\n});\n",
              "after": " if(name.endsWith('SelectedPlaceCard'))return{placesScrollCss:'',SelectedPlaceSummary:()=>null};\n if(name.endsWith('LoadedPlacesList'))return{LoadedPlacesList:()=>null};\n throw Error(name);\n}\nnew Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/PlacesPanel.tsx'),'utf8'),{fileName:'PlacesPanel.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,localRequire);\nconst flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value?.children?flatten(value.children):'';\ntest('tile mode describes loaded results without claiming the number of rendered map points',()=>{\n const props={status:{kind:'ready',count:200,limited:true,loadedCounts:{all:200}},group:'all',onGroup(){},onRetry(){},onClose(){}};\n const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiPoiResultRange'));assert(native.includes('uiPoiLoadMore'));assert(!native.includes('uiPlacesShown'));assert(!native.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));\n const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiPlacesShown'));assert(original.includes('uiOnlyPartOfThisAreaIsLoadedZoom'));\n});\n\ntest('native list zoom message does not imply that tile rendering is unavailable',()=>{\n const props={status:{kind:'zoom',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}};\n const native=flatten(m.exports.PlacesPanel({...props,tileSource:true}));assert(native.includes('uiLoadedPlaces: appZoomCloser'));assert(!native.includes('uiZoomCloserToSeeNearbyPlaces'));\n const original=flatten(m.exports.PlacesPanel(props));assert(original.includes('uiZoomCloserToSeeNearbyPlaces'));\n});\n"
            },
            {
              "label": "tests/placesPanelRendering.test.cjs 2",
              "before": "test('filter loading disables controls and explains an independently selected place outside the list',()=>{\n const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileLoading:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n assert(flatten(panel).includes('uiPoiUpdating'));assert(flatten(panel).includes('uiPoiSelectedOutsideList'));assert.equal(nodes.find(n=>n.type==='fieldset').props.disabled,true);\n});\ntest('native paging exposes range navigation and keeps paging disabled for stale searches',()=>{\n const nodes=[];const panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'search',count:200,limited:true,pageOffset:200,canSearch:true},group:'all',onGroup(){},onRetry(){},onClose(){},onLoadMore(){},onPreviousResults(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n for(const label of ['uiPoiLoadMore','uiPoiPreviousResults'])assert.equal(nodes.find(n=>n.type==='button'&&flatten(n)===label).props.disabled,true);\n assert(flatten(panel).includes('uiPoiScaleHint'));assert(flatten(panel).includes('uiPoiPagedHint'));\n});\n",
              "after": "test('filter loading disables controls and explains an independently selected place outside the list',()=>{\n const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileLoading:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n assert(flatten(panel).includes('uiPoiUpdating'));assert(flatten(panel).includes('uiPoiSelectedOutsideList'));assert.equal(nodes.find(n=>n.type==='fieldset').props.disabled,true);\n});\ntest('native paging exposes range navigation and keeps paging disabled for stale searches',()=>{\n const nodes=[];const panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'search',count:200,limited:true,pageOffset:200,canSearch:true},group:'all',onGroup(){},onRetry(){},onClose(){},onLoadMore(){},onPreviousResults(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n for(const label of ['uiPoiLoadMore','uiPoiPreviousResults'])assert.equal(nodes.find(n=>n.type==='button'&&(flatten(n)===label||n.props['aria-label']===label)).props.disabled,true);\n assert(flatten(panel).includes('uiPoiScaleHint'));assert(flatten(panel).includes('uiPoiPagedHint'));\n});\n\ntest('compact tile panel keeps category and results available while advanced filters and help start collapsed',()=>{\n const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileFamily:'all',tileQuality:{minimum:.75,hideClosed:true},onTileFamily(){},onTileQuality(){},status:{kind:'ready',count:200,limited:true},places:[],group:'all',onGroup(){},onRetry(){},onClose(){},onSelect(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const sections=nodes.filter(n=>n.type==='details');assert.equal(sections.length,2);assert(sections.every(n=>!n.props.open));assert(flatten(sections[0]).includes('uiPoiQualityFilters'));assert(flatten(sections[1]).includes('uiPoiScaleHint'));assert(flatten(sections[1]).includes('uiSelectAPlaceForDetailsSourceOvertureMaps'));\n const list=nodes.find(n=>n.props?.defaultOpen===true);assert(list);assert.equal(list.props.compact,true);assert(nodes.some(n=>n.type===CategoryPickerStub));\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/runtimeMessages.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/runtimeMessages.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"More matching places are available.\",\n  \"uiPoiScaleHint\": \"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\n  \"uiPoiPageFailed\": \"Could not load this page. Current results are kept; try again.\",\n  \"uiPoiPreviousResults\": \"Previous results\",\n  \"uiPoiLoadingPage\": \"Loading…\",\n  \"uiPoiLoadMore\": \"Load more\",\n  \"uiPoiClusterDense\": \"These places overlap. Narrow the category or browse the results list.\",\n  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"More matching places are available.\",\n  \"uiPoiScaleHint\": \"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\n  \"uiPoiPageFailed\": \"Could not load this page. Current results are kept; try again.\",\n  \"uiPoiPreviousResults\": \"Previous results\",\n  \"uiPoiLoadingPage\": \"Loading…\",\n  \"uiPoiLoadMore\": \"Load more\",\n  \"uiPoiClusterDense\": \"These places overlap. Narrow the category or browse the results list.\",\n  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n  \"uiPoiQualityFilters\": \"Quality filters\",\n  \"uiPoiHelpSource\": \"Help & source\",\n  \"uiPoiAutoShort\": \"Auto\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/localization/translations.csv",
      "variants": [
        {
          "blocks": [
            {
              "label": "docs/localization/translations.csv 1",
              "before": "\"runtime\",\"uiPoiMoreResultsAvailable\",\"More matching places are available.\",\"More matching places are available.\",\"تتوفر أماكن مطابقة أخرى.\",\"Daha fazla eşleşen yer var.\",\"Hay más lugares coincidentes.\",\"D’autres lieux correspondants sont disponibles.\",\"Weitere passende Orte sind verfügbar.\",\"Há mais locais correspondentes.\",\"Sono disponibili altri luoghi corrispondenti.\",\"他にも一致する場所があります。\",\"일치하는 장소가 더 있습니다.\",\"还有更多匹配的地点。\",\"還有更多相符的地點。\"\n\"runtime\",\"uiPoiScaleHint\",\"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\"تلخّص الأعداد الأماكن عند التصغير. قرّب الخريطة لرؤية الرموز والتسميات الفردية.\",\"Uzak ölçekte sayılar yerleri özetler. Tekil simge ve etiketler için yakınlaştırın.\",\"Los recuentos resumen los lugares al alejar el mapa. Acércalo para ver iconos y etiquetas individuales.\",\"Les nombres résument les lieux à petite échelle. Zoomez pour voir les icônes et libellés individuels.\",\"Zahlen fassen Orte bei kleiner Ansicht zusammen. Vergrößern Sie die Karte für einzelne Symbole und Beschriftungen.\",\"As contagens resumem os locais com o mapa afastado. Aproxime para ver ícones e rótulos individuais.\",\"I conteggi riassumono i luoghi a scala ridotta. Ingrandisci per vedere icone ed etichette individuali.\",\"縮小時は場所の件数をまとめて表示します。拡大すると個別のアイコンとラベルが表示されます。\",\"축소하면 장소 수가 요약됩니다. 개별 아이콘과 라벨을 보려면 확대하세요.\",\"缩小时以数量汇总地点。放大可查看单独的图标和标签。\",\"縮小時以數量彙總地點。放大可查看個別圖示和標籤。\"\n\"runtime\",\"uiPoiPageFailed\",\"Could not load this page. Current results are kept; try again.\",\"Could not load this page. Current results are kept; try again.\",\"تعذر تحميل هذه الصفحة. تم الاحتفاظ بالنتائج الحالية؛ حاول مجددًا.\",\"Bu sayfa yüklenemedi. Mevcut sonuçlar korundu; yeniden deneyin.\",\"No se pudo cargar esta página. Se conservan los resultados actuales; inténtalo de nuevo.\",\"Impossible de charger cette page. Les résultats actuels sont conservés ; réessayez.\",\"Diese Seite konnte nicht geladen werden. Aktuelle Ergebnisse bleiben erhalten; versuchen Sie es erneut.\",\"Não foi possível carregar esta página. Os resultados atuais foram mantidos; tente novamente.\",\"Impossibile caricare questa pagina. I risultati attuali vengono mantenuti; riprova.\",\"このページを読み込めませんでした。現在の結果は保持されています。再試行してください。\",\"이 페이지를 불러올 수 없습니다. 현재 결과는 유지됩니다. 다시 시도하세요.\",\"无法加载此页。当前结果已保留，请重试。\",\"無法載入此頁。已保留目前的結果，請重試。\"\n\"runtime\",\"uiPoiPreviousResults\",\"Previous results\",\"Previous results\",\"النتائج السابقة\",\"Önceki sonuçlar\",\"Resultados anteriores\",\"Résultats précédents\",\"Vorherige Ergebnisse\",\"Resultados anteriores\",\"Risultati precedenti\",\"前の結果\",\"이전 결과\",\"上一页结果\",\"上一頁結果\"\n\"runtime\",\"uiPoiLoadingPage\",\"Loading…\",\"Loading…\",\"جارٍ التحميل…\",\"Yükleniyor…\",\"Cargando…\",\"Chargement…\",\"Wird geladen…\",\"Carregando…\",\"Caricamento…\",\"読み込み中…\",\"불러오는 중…\",\"正在加载…\",\"載入中…\"\n\"runtime\",\"uiPoiLoadMore\",\"Load more\",\"Load more\",\"تحميل المزيد\",\"Daha fazla yükle\",\"Cargar más\",\"Charger plus\",\"Mehr laden\",\"Carregar mais\",\"Carica altro\",\"さらに読み込む\",\"더 불러오기\",\"加载更多\",\"載入更多\"\n\"runtime\",\"uiPoiClusterDense\",\"These places overlap. Narrow the category or browse the results list.\",\"These places overlap. Narrow the category or browse the results list.\",\"هذه الأماكن متداخلة. حدّد فئة أدق أو تصفّح قائمة النتائج.\",\"Bu yerler üst üste geliyor. Kategoriyi daraltın veya sonuç listesine göz atın.\",\"Estos lugares se superponen. Limita la categoría o consulta la lista de resultados.\",\"Ces lieux se superposent. Précisez la catégorie ou parcourez la liste des résultats.\",\"Diese Orte überlappen sich. Grenzen Sie die Kategorie ein oder durchsuchen Sie die Ergebnisliste.\",\"Estes locais se sobrepõem. Restrinja a categoria ou consulte a lista de resultados.\",\"Questi luoghi si sovrappongono. Restringi la categoria o consulta l’elenco dei risultati.\",\"これらの場所は重なっています。カテゴリを絞り込むか、結果一覧をご覧ください。\",\"이 장소들은 겹쳐 있습니다. 카테고리를 좁히거나 결과 목록을 살펴보세요.\",\"这些地点相互重叠。请缩小类别范围或浏览结果列表。\",\"這些地點相互重疊。請縮小類別範圍或瀏覽結果清單。\"\n\"runtime\",\"uiPoiPagedHint\",\"Browse matching places in pages of up to 200.\",\"Browse matching places in pages of up to 200.\",\"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\"Explora los lugares coincidentes en páginas de hasta 200.\",\"Parcourez les lieux correspondants par pages de 200 maximum.\",\"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\"Explore os locais correspondentes em páginas de até 200.\",\"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\"一致する場所を1ページ最大200件ずつ表示します。\",\"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\"每页最多浏览 200 个匹配地点。\",\"每頁最多瀏覽 200 個相符地點。\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n",
              "after": "\"runtime\",\"uiPoiMoreResultsAvailable\",\"More matching places are available.\",\"More matching places are available.\",\"تتوفر أماكن مطابقة أخرى.\",\"Daha fazla eşleşen yer var.\",\"Hay más lugares coincidentes.\",\"D’autres lieux correspondants sont disponibles.\",\"Weitere passende Orte sind verfügbar.\",\"Há mais locais correspondentes.\",\"Sono disponibili altri luoghi corrispondenti.\",\"他にも一致する場所があります。\",\"일치하는 장소가 더 있습니다.\",\"还有更多匹配的地点。\",\"還有更多相符的地點。\"\n\"runtime\",\"uiPoiScaleHint\",\"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\"تلخّص الأعداد الأماكن عند التصغير. قرّب الخريطة لرؤية الرموز والتسميات الفردية.\",\"Uzak ölçekte sayılar yerleri özetler. Tekil simge ve etiketler için yakınlaştırın.\",\"Los recuentos resumen los lugares al alejar el mapa. Acércalo para ver iconos y etiquetas individuales.\",\"Les nombres résument les lieux à petite échelle. Zoomez pour voir les icônes et libellés individuels.\",\"Zahlen fassen Orte bei kleiner Ansicht zusammen. Vergrößern Sie die Karte für einzelne Symbole und Beschriftungen.\",\"As contagens resumem os locais com o mapa afastado. Aproxime para ver ícones e rótulos individuais.\",\"I conteggi riassumono i luoghi a scala ridotta. Ingrandisci per vedere icone ed etichette individuali.\",\"縮小時は場所の件数をまとめて表示します。拡大すると個別のアイコンとラベルが表示されます。\",\"축소하면 장소 수가 요약됩니다. 개별 아이콘과 라벨을 보려면 확대하세요.\",\"缩小时以数量汇总地点。放大可查看单独的图标和标签。\",\"縮小時以數量彙總地點。放大可查看個別圖示和標籤。\"\n\"runtime\",\"uiPoiPageFailed\",\"Could not load this page. Current results are kept; try again.\",\"Could not load this page. Current results are kept; try again.\",\"تعذر تحميل هذه الصفحة. تم الاحتفاظ بالنتائج الحالية؛ حاول مجددًا.\",\"Bu sayfa yüklenemedi. Mevcut sonuçlar korundu; yeniden deneyin.\",\"No se pudo cargar esta página. Se conservan los resultados actuales; inténtalo de nuevo.\",\"Impossible de charger cette page. Les résultats actuels sont conservés ; réessayez.\",\"Diese Seite konnte nicht geladen werden. Aktuelle Ergebnisse bleiben erhalten; versuchen Sie es erneut.\",\"Não foi possível carregar esta página. Os resultados atuais foram mantidos; tente novamente.\",\"Impossibile caricare questa pagina. I risultati attuali vengono mantenuti; riprova.\",\"このページを読み込めませんでした。現在の結果は保持されています。再試行してください。\",\"이 페이지를 불러올 수 없습니다. 현재 결과는 유지됩니다. 다시 시도하세요.\",\"无法加载此页。当前结果已保留，请重试。\",\"無法載入此頁。已保留目前的結果，請重試。\"\n\"runtime\",\"uiPoiPreviousResults\",\"Previous results\",\"Previous results\",\"النتائج السابقة\",\"Önceki sonuçlar\",\"Resultados anteriores\",\"Résultats précédents\",\"Vorherige Ergebnisse\",\"Resultados anteriores\",\"Risultati precedenti\",\"前の結果\",\"이전 결과\",\"上一页结果\",\"上一頁結果\"\n\"runtime\",\"uiPoiLoadingPage\",\"Loading…\",\"Loading…\",\"جارٍ التحميل…\",\"Yükleniyor…\",\"Cargando…\",\"Chargement…\",\"Wird geladen…\",\"Carregando…\",\"Caricamento…\",\"読み込み中…\",\"불러오는 중…\",\"正在加载…\",\"載入中…\"\n\"runtime\",\"uiPoiLoadMore\",\"Load more\",\"Load more\",\"تحميل المزيد\",\"Daha fazla yükle\",\"Cargar más\",\"Charger plus\",\"Mehr laden\",\"Carregar mais\",\"Carica altro\",\"さらに読み込む\",\"더 불러오기\",\"加载更多\",\"載入更多\"\n\"runtime\",\"uiPoiClusterDense\",\"These places overlap. Narrow the category or browse the results list.\",\"These places overlap. Narrow the category or browse the results list.\",\"هذه الأماكن متداخلة. حدّد فئة أدق أو تصفّح قائمة النتائج.\",\"Bu yerler üst üste geliyor. Kategoriyi daraltın veya sonuç listesine göz atın.\",\"Estos lugares se superponen. Limita la categoría o consulta la lista de resultados.\",\"Ces lieux se superposent. Précisez la catégorie ou parcourez la liste des résultats.\",\"Diese Orte überlappen sich. Grenzen Sie die Kategorie ein oder durchsuchen Sie die Ergebnisliste.\",\"Estes locais se sobrepõem. Restrinja a categoria ou consulte a lista de resultados.\",\"Questi luoghi si sovrappongono. Restringi la categoria o consulta l’elenco dei risultati.\",\"これらの場所は重なっています。カテゴリを絞り込むか、結果一覧をご覧ください。\",\"이 장소들은 겹쳐 있습니다. 카테고리를 좁히거나 결과 목록을 살펴보세요.\",\"这些地点相互重叠。请缩小类别范围或浏览结果列表。\",\"這些地點相互重疊。請縮小類別範圍或瀏覽結果清單。\"\n\"runtime\",\"uiPoiPagedHint\",\"Browse matching places in pages of up to 200.\",\"Browse matching places in pages of up to 200.\",\"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\"Explora los lugares coincidentes en páginas de hasta 200.\",\"Parcourez les lieux correspondants par pages de 200 maximum.\",\"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\"Explore os locais correspondentes em páginas de até 200.\",\"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\"一致する場所を1ページ最大200件ずつ表示します。\",\"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\"每页最多浏览 200 个匹配地点。\",\"每頁最多瀏覽 200 個相符地點。\"\n\"runtime\",\"uiPoiQualityFilters\",\"Quality filters\",\"Quality filters\",\"عوامل تصفية الجودة\",\"Kalite filtreleri\",\"Filtros de calidad\",\"Filtres de qualité\",\"Qualitätsfilter\",\"Filtros de qualidade\",\"Filtri di qualità\",\"品質フィルター\",\"품질 필터\",\"质量筛选\",\"品質篩選\"\n\"runtime\",\"uiPoiHelpSource\",\"Help & source\",\"Help & source\",\"المساعدة والمصدر\",\"Yardım ve kaynak\",\"Ayuda y fuente\",\"Aide et source\",\"Hilfe und Quelle\",\"Ajuda e fonte\",\"Guida e fonte\",\"ヘルプと出典\",\"도움말 및 출처\",\"帮助与来源\",\"說明與來源\"\n\"runtime\",\"uiPoiAutoShort\",\"Auto\",\"Auto\",\"تلقائي\",\"Otomatik\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"自動\",\"자동\",\"自动\",\"自動\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/ar.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/ar.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"تتوفر أماكن مطابقة أخرى.\",\n  \"uiPoiScaleHint\": \"تلخّص الأعداد الأماكن عند التصغير. قرّب الخريطة لرؤية الرموز والتسميات الفردية.\",\n  \"uiPoiPageFailed\": \"تعذر تحميل هذه الصفحة. تم الاحتفاظ بالنتائج الحالية؛ حاول مجددًا.\",\n  \"uiPoiPreviousResults\": \"النتائج السابقة\",\n  \"uiPoiLoadingPage\": \"جارٍ التحميل…\",\n  \"uiPoiLoadMore\": \"تحميل المزيد\",\n  \"uiPoiClusterDense\": \"هذه الأماكن متداخلة. حدّد فئة أدق أو تصفّح قائمة النتائج.\",\n  \"uiPoiPagedHint\": \"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\n};\nexport default ar;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"تتوفر أماكن مطابقة أخرى.\",\n  \"uiPoiScaleHint\": \"تلخّص الأعداد الأماكن عند التصغير. قرّب الخريطة لرؤية الرموز والتسميات الفردية.\",\n  \"uiPoiPageFailed\": \"تعذر تحميل هذه الصفحة. تم الاحتفاظ بالنتائج الحالية؛ حاول مجددًا.\",\n  \"uiPoiPreviousResults\": \"النتائج السابقة\",\n  \"uiPoiLoadingPage\": \"جارٍ التحميل…\",\n  \"uiPoiLoadMore\": \"تحميل المزيد\",\n  \"uiPoiClusterDense\": \"هذه الأماكن متداخلة. حدّد فئة أدق أو تصفّح قائمة النتائج.\",\n  \"uiPoiPagedHint\": \"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\n  \"uiPoiQualityFilters\": \"عوامل تصفية الجودة\",\n  \"uiPoiHelpSource\": \"المساعدة والمصدر\",\n  \"uiPoiAutoShort\": \"تلقائي\",\n};\nexport default ar;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/de.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/de.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"Weitere passende Orte sind verfügbar.\",\n  \"uiPoiScaleHint\": \"Zahlen fassen Orte bei kleiner Ansicht zusammen. Vergrößern Sie die Karte für einzelne Symbole und Beschriftungen.\",\n  \"uiPoiPageFailed\": \"Diese Seite konnte nicht geladen werden. Aktuelle Ergebnisse bleiben erhalten; versuchen Sie es erneut.\",\n  \"uiPoiPreviousResults\": \"Vorherige Ergebnisse\",\n  \"uiPoiLoadingPage\": \"Wird geladen…\",\n  \"uiPoiLoadMore\": \"Mehr laden\",\n  \"uiPoiClusterDense\": \"Diese Orte überlappen sich. Grenzen Sie die Kategorie ein oder durchsuchen Sie die Ergebnisliste.\",\n  \"uiPoiPagedHint\": \"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\n};\nexport default de;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"Weitere passende Orte sind verfügbar.\",\n  \"uiPoiScaleHint\": \"Zahlen fassen Orte bei kleiner Ansicht zusammen. Vergrößern Sie die Karte für einzelne Symbole und Beschriftungen.\",\n  \"uiPoiPageFailed\": \"Diese Seite konnte nicht geladen werden. Aktuelle Ergebnisse bleiben erhalten; versuchen Sie es erneut.\",\n  \"uiPoiPreviousResults\": \"Vorherige Ergebnisse\",\n  \"uiPoiLoadingPage\": \"Wird geladen…\",\n  \"uiPoiLoadMore\": \"Mehr laden\",\n  \"uiPoiClusterDense\": \"Diese Orte überlappen sich. Grenzen Sie die Kategorie ein oder durchsuchen Sie die Ergebnisliste.\",\n  \"uiPoiPagedHint\": \"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\n  \"uiPoiQualityFilters\": \"Qualitätsfilter\",\n  \"uiPoiHelpSource\": \"Hilfe und Quelle\",\n  \"uiPoiAutoShort\": \"Auto\",\n};\nexport default de;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/en-gb.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/en-gb.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"More matching places are available.\",\n  \"uiPoiScaleHint\": \"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\n  \"uiPoiPageFailed\": \"Could not load this page. Current results are kept; try again.\",\n  \"uiPoiPreviousResults\": \"Previous results\",\n  \"uiPoiLoadingPage\": \"Loading…\",\n  \"uiPoiLoadMore\": \"Load more\",\n  \"uiPoiClusterDense\": \"These places overlap. Narrow the category or browse the results list.\",\n  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n};\nexport default overrides;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"More matching places are available.\",\n  \"uiPoiScaleHint\": \"Counts summarize places when zoomed out. Zoom in for individual icons and labels.\",\n  \"uiPoiPageFailed\": \"Could not load this page. Current results are kept; try again.\",\n  \"uiPoiPreviousResults\": \"Previous results\",\n  \"uiPoiLoadingPage\": \"Loading…\",\n  \"uiPoiLoadMore\": \"Load more\",\n  \"uiPoiClusterDense\": \"These places overlap. Narrow the category or browse the results list.\",\n  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n  \"uiPoiQualityFilters\": \"Quality filters\",\n  \"uiPoiHelpSource\": \"Help & source\",\n  \"uiPoiAutoShort\": \"Auto\",\n};\nexport default overrides;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/es.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/es.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"Hay más lugares coincidentes.\",\n  \"uiPoiScaleHint\": \"Los recuentos resumen los lugares al alejar el mapa. Acércalo para ver iconos y etiquetas individuales.\",\n  \"uiPoiPageFailed\": \"No se pudo cargar esta página. Se conservan los resultados actuales; inténtalo de nuevo.\",\n  \"uiPoiPreviousResults\": \"Resultados anteriores\",\n  \"uiPoiLoadingPage\": \"Cargando…\",\n  \"uiPoiLoadMore\": \"Cargar más\",\n  \"uiPoiClusterDense\": \"Estos lugares se superponen. Limita la categoría o consulta la lista de resultados.\",\n  \"uiPoiPagedHint\": \"Explora los lugares coincidentes en páginas de hasta 200.\",\n};\nexport default es;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"Hay más lugares coincidentes.\",\n  \"uiPoiScaleHint\": \"Los recuentos resumen los lugares al alejar el mapa. Acércalo para ver iconos y etiquetas individuales.\",\n  \"uiPoiPageFailed\": \"No se pudo cargar esta página. Se conservan los resultados actuales; inténtalo de nuevo.\",\n  \"uiPoiPreviousResults\": \"Resultados anteriores\",\n  \"uiPoiLoadingPage\": \"Cargando…\",\n  \"uiPoiLoadMore\": \"Cargar más\",\n  \"uiPoiClusterDense\": \"Estos lugares se superponen. Limita la categoría o consulta la lista de resultados.\",\n  \"uiPoiPagedHint\": \"Explora los lugares coincidentes en páginas de hasta 200.\",\n  \"uiPoiQualityFilters\": \"Filtros de calidad\",\n  \"uiPoiHelpSource\": \"Ayuda y fuente\",\n  \"uiPoiAutoShort\": \"Auto\",\n};\nexport default es;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/fr.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/fr.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"D’autres lieux correspondants sont disponibles.\",\n  \"uiPoiScaleHint\": \"Les nombres résument les lieux à petite échelle. Zoomez pour voir les icônes et libellés individuels.\",\n  \"uiPoiPageFailed\": \"Impossible de charger cette page. Les résultats actuels sont conservés ; réessayez.\",\n  \"uiPoiPreviousResults\": \"Résultats précédents\",\n  \"uiPoiLoadingPage\": \"Chargement…\",\n  \"uiPoiLoadMore\": \"Charger plus\",\n  \"uiPoiClusterDense\": \"Ces lieux se superposent. Précisez la catégorie ou parcourez la liste des résultats.\",\n  \"uiPoiPagedHint\": \"Parcourez les lieux correspondants par pages de 200 maximum.\",\n};\nexport default fr;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"D’autres lieux correspondants sont disponibles.\",\n  \"uiPoiScaleHint\": \"Les nombres résument les lieux à petite échelle. Zoomez pour voir les icônes et libellés individuels.\",\n  \"uiPoiPageFailed\": \"Impossible de charger cette page. Les résultats actuels sont conservés ; réessayez.\",\n  \"uiPoiPreviousResults\": \"Résultats précédents\",\n  \"uiPoiLoadingPage\": \"Chargement…\",\n  \"uiPoiLoadMore\": \"Charger plus\",\n  \"uiPoiClusterDense\": \"Ces lieux se superposent. Précisez la catégorie ou parcourez la liste des résultats.\",\n  \"uiPoiPagedHint\": \"Parcourez les lieux correspondants par pages de 200 maximum.\",\n  \"uiPoiQualityFilters\": \"Filtres de qualité\",\n  \"uiPoiHelpSource\": \"Aide et source\",\n  \"uiPoiAutoShort\": \"Auto\",\n};\nexport default fr;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/it.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/it.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"Sono disponibili altri luoghi corrispondenti.\",\n  \"uiPoiScaleHint\": \"I conteggi riassumono i luoghi a scala ridotta. Ingrandisci per vedere icone ed etichette individuali.\",\n  \"uiPoiPageFailed\": \"Impossibile caricare questa pagina. I risultati attuali vengono mantenuti; riprova.\",\n  \"uiPoiPreviousResults\": \"Risultati precedenti\",\n  \"uiPoiLoadingPage\": \"Caricamento…\",\n  \"uiPoiLoadMore\": \"Carica altro\",\n  \"uiPoiClusterDense\": \"Questi luoghi si sovrappongono. Restringi la categoria o consulta l’elenco dei risultati.\",\n  \"uiPoiPagedHint\": \"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\n};\nexport default it;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"Sono disponibili altri luoghi corrispondenti.\",\n  \"uiPoiScaleHint\": \"I conteggi riassumono i luoghi a scala ridotta. Ingrandisci per vedere icone ed etichette individuali.\",\n  \"uiPoiPageFailed\": \"Impossibile caricare questa pagina. I risultati attuali vengono mantenuti; riprova.\",\n  \"uiPoiPreviousResults\": \"Risultati precedenti\",\n  \"uiPoiLoadingPage\": \"Caricamento…\",\n  \"uiPoiLoadMore\": \"Carica altro\",\n  \"uiPoiClusterDense\": \"Questi luoghi si sovrappongono. Restringi la categoria o consulta l’elenco dei risultati.\",\n  \"uiPoiPagedHint\": \"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\n  \"uiPoiQualityFilters\": \"Filtri di qualità\",\n  \"uiPoiHelpSource\": \"Guida e fonte\",\n  \"uiPoiAutoShort\": \"Auto\",\n};\nexport default it;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/ja.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/ja.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"他にも一致する場所があります。\",\n  \"uiPoiScaleHint\": \"縮小時は場所の件数をまとめて表示します。拡大すると個別のアイコンとラベルが表示されます。\",\n  \"uiPoiPageFailed\": \"このページを読み込めませんでした。現在の結果は保持されています。再試行してください。\",\n  \"uiPoiPreviousResults\": \"前の結果\",\n  \"uiPoiLoadingPage\": \"読み込み中…\",\n  \"uiPoiLoadMore\": \"さらに読み込む\",\n  \"uiPoiClusterDense\": \"これらの場所は重なっています。カテゴリを絞り込むか、結果一覧をご覧ください。\",\n  \"uiPoiPagedHint\": \"一致する場所を1ページ最大200件ずつ表示します。\",\n};\nexport default ja;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"他にも一致する場所があります。\",\n  \"uiPoiScaleHint\": \"縮小時は場所の件数をまとめて表示します。拡大すると個別のアイコンとラベルが表示されます。\",\n  \"uiPoiPageFailed\": \"このページを読み込めませんでした。現在の結果は保持されています。再試行してください。\",\n  \"uiPoiPreviousResults\": \"前の結果\",\n  \"uiPoiLoadingPage\": \"読み込み中…\",\n  \"uiPoiLoadMore\": \"さらに読み込む\",\n  \"uiPoiClusterDense\": \"これらの場所は重なっています。カテゴリを絞り込むか、結果一覧をご覧ください。\",\n  \"uiPoiPagedHint\": \"一致する場所を1ページ最大200件ずつ表示します。\",\n  \"uiPoiQualityFilters\": \"品質フィルター\",\n  \"uiPoiHelpSource\": \"ヘルプと出典\",\n  \"uiPoiAutoShort\": \"自動\",\n};\nexport default ja;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/ko.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/ko.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"일치하는 장소가 더 있습니다.\",\n  \"uiPoiScaleHint\": \"축소하면 장소 수가 요약됩니다. 개별 아이콘과 라벨을 보려면 확대하세요.\",\n  \"uiPoiPageFailed\": \"이 페이지를 불러올 수 없습니다. 현재 결과는 유지됩니다. 다시 시도하세요.\",\n  \"uiPoiPreviousResults\": \"이전 결과\",\n  \"uiPoiLoadingPage\": \"불러오는 중…\",\n  \"uiPoiLoadMore\": \"더 불러오기\",\n  \"uiPoiClusterDense\": \"이 장소들은 겹쳐 있습니다. 카테고리를 좁히거나 결과 목록을 살펴보세요.\",\n  \"uiPoiPagedHint\": \"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\n};\nexport default ko;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"일치하는 장소가 더 있습니다.\",\n  \"uiPoiScaleHint\": \"축소하면 장소 수가 요약됩니다. 개별 아이콘과 라벨을 보려면 확대하세요.\",\n  \"uiPoiPageFailed\": \"이 페이지를 불러올 수 없습니다. 현재 결과는 유지됩니다. 다시 시도하세요.\",\n  \"uiPoiPreviousResults\": \"이전 결과\",\n  \"uiPoiLoadingPage\": \"불러오는 중…\",\n  \"uiPoiLoadMore\": \"더 불러오기\",\n  \"uiPoiClusterDense\": \"이 장소들은 겹쳐 있습니다. 카테고리를 좁히거나 결과 목록을 살펴보세요.\",\n  \"uiPoiPagedHint\": \"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\n  \"uiPoiQualityFilters\": \"품질 필터\",\n  \"uiPoiHelpSource\": \"도움말 및 출처\",\n  \"uiPoiAutoShort\": \"자동\",\n};\nexport default ko;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/pt-br.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/pt-br.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"Há mais locais correspondentes.\",\n  \"uiPoiScaleHint\": \"As contagens resumem os locais com o mapa afastado. Aproxime para ver ícones e rótulos individuais.\",\n  \"uiPoiPageFailed\": \"Não foi possível carregar esta página. Os resultados atuais foram mantidos; tente novamente.\",\n  \"uiPoiPreviousResults\": \"Resultados anteriores\",\n  \"uiPoiLoadingPage\": \"Carregando…\",\n  \"uiPoiLoadMore\": \"Carregar mais\",\n  \"uiPoiClusterDense\": \"Estes locais se sobrepõem. Restrinja a categoria ou consulte a lista de resultados.\",\n  \"uiPoiPagedHint\": \"Explore os locais correspondentes em páginas de até 200.\",\n};\nexport default ptBR;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"Há mais locais correspondentes.\",\n  \"uiPoiScaleHint\": \"As contagens resumem os locais com o mapa afastado. Aproxime para ver ícones e rótulos individuais.\",\n  \"uiPoiPageFailed\": \"Não foi possível carregar esta página. Os resultados atuais foram mantidos; tente novamente.\",\n  \"uiPoiPreviousResults\": \"Resultados anteriores\",\n  \"uiPoiLoadingPage\": \"Carregando…\",\n  \"uiPoiLoadMore\": \"Carregar mais\",\n  \"uiPoiClusterDense\": \"Estes locais se sobrepõem. Restrinja a categoria ou consulte a lista de resultados.\",\n  \"uiPoiPagedHint\": \"Explore os locais correspondentes em páginas de até 200.\",\n  \"uiPoiQualityFilters\": \"Filtros de qualidade\",\n  \"uiPoiHelpSource\": \"Ajuda e fonte\",\n  \"uiPoiAutoShort\": \"Auto\",\n};\nexport default ptBR;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/tr.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/tr.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"Daha fazla eşleşen yer var.\",\n  \"uiPoiScaleHint\": \"Uzak ölçekte sayılar yerleri özetler. Tekil simge ve etiketler için yakınlaştırın.\",\n  \"uiPoiPageFailed\": \"Bu sayfa yüklenemedi. Mevcut sonuçlar korundu; yeniden deneyin.\",\n  \"uiPoiPreviousResults\": \"Önceki sonuçlar\",\n  \"uiPoiLoadingPage\": \"Yükleniyor…\",\n  \"uiPoiLoadMore\": \"Daha fazla yükle\",\n  \"uiPoiClusterDense\": \"Bu yerler üst üste geliyor. Kategoriyi daraltın veya sonuç listesine göz atın.\",\n  \"uiPoiPagedHint\": \"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\n};\nexport default tr;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"Daha fazla eşleşen yer var.\",\n  \"uiPoiScaleHint\": \"Uzak ölçekte sayılar yerleri özetler. Tekil simge ve etiketler için yakınlaştırın.\",\n  \"uiPoiPageFailed\": \"Bu sayfa yüklenemedi. Mevcut sonuçlar korundu; yeniden deneyin.\",\n  \"uiPoiPreviousResults\": \"Önceki sonuçlar\",\n  \"uiPoiLoadingPage\": \"Yükleniyor…\",\n  \"uiPoiLoadMore\": \"Daha fazla yükle\",\n  \"uiPoiClusterDense\": \"Bu yerler üst üste geliyor. Kategoriyi daraltın veya sonuç listesine göz atın.\",\n  \"uiPoiPagedHint\": \"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\n  \"uiPoiQualityFilters\": \"Kalite filtreleri\",\n  \"uiPoiHelpSource\": \"Yardım ve kaynak\",\n  \"uiPoiAutoShort\": \"Otomatik\",\n};\nexport default tr;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/zh-cn.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/zh-cn.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"还有更多匹配的地点。\",\n  \"uiPoiScaleHint\": \"缩小时以数量汇总地点。放大可查看单独的图标和标签。\",\n  \"uiPoiPageFailed\": \"无法加载此页。当前结果已保留，请重试。\",\n  \"uiPoiPreviousResults\": \"上一页结果\",\n  \"uiPoiLoadingPage\": \"正在加载…\",\n  \"uiPoiLoadMore\": \"加载更多\",\n  \"uiPoiClusterDense\": \"这些地点相互重叠。请缩小类别范围或浏览结果列表。\",\n  \"uiPoiPagedHint\": \"每页最多浏览 200 个匹配地点。\",\n};\nexport default zhCN;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"还有更多匹配的地点。\",\n  \"uiPoiScaleHint\": \"缩小时以数量汇总地点。放大可查看单独的图标和标签。\",\n  \"uiPoiPageFailed\": \"无法加载此页。当前结果已保留，请重试。\",\n  \"uiPoiPreviousResults\": \"上一页结果\",\n  \"uiPoiLoadingPage\": \"正在加载…\",\n  \"uiPoiLoadMore\": \"加载更多\",\n  \"uiPoiClusterDense\": \"这些地点相互重叠。请缩小类别范围或浏览结果列表。\",\n  \"uiPoiPagedHint\": \"每页最多浏览 200 个匹配地点。\",\n  \"uiPoiQualityFilters\": \"质量筛选\",\n  \"uiPoiHelpSource\": \"帮助与来源\",\n  \"uiPoiAutoShort\": \"自动\",\n};\nexport default zhCN;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/locales/zh-tw.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/i18n/locales/zh-tw.ts 1",
              "before": "  \"uiPoiMoreResultsAvailable\": \"還有更多相符的地點。\",\n  \"uiPoiScaleHint\": \"縮小時以數量彙總地點。放大可查看個別圖示和標籤。\",\n  \"uiPoiPageFailed\": \"無法載入此頁。已保留目前的結果，請重試。\",\n  \"uiPoiPreviousResults\": \"上一頁結果\",\n  \"uiPoiLoadingPage\": \"載入中…\",\n  \"uiPoiLoadMore\": \"載入更多\",\n  \"uiPoiClusterDense\": \"這些地點相互重疊。請縮小類別範圍或瀏覽結果清單。\",\n  \"uiPoiPagedHint\": \"每頁最多瀏覽 200 個相符地點。\",\n};\nexport default zhTW;\n",
              "after": "  \"uiPoiMoreResultsAvailable\": \"還有更多相符的地點。\",\n  \"uiPoiScaleHint\": \"縮小時以數量彙總地點。放大可查看個別圖示和標籤。\",\n  \"uiPoiPageFailed\": \"無法載入此頁。已保留目前的結果，請重試。\",\n  \"uiPoiPreviousResults\": \"上一頁結果\",\n  \"uiPoiLoadingPage\": \"載入中…\",\n  \"uiPoiLoadMore\": \"載入更多\",\n  \"uiPoiClusterDense\": \"這些地點相互重疊。請縮小類別範圍或瀏覽結果清單。\",\n  \"uiPoiPagedHint\": \"每頁最多瀏覽 200 個相符地點。\",\n  \"uiPoiQualityFilters\": \"品質篩選\",\n  \"uiPoiHelpSource\": \"說明與來源\",\n  \"uiPoiAutoShort\": \"自動\",\n};\nexport default zhTW;\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'overture-places-compact-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Compact Overture places installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-places-compact' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Compact Overture places installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Compact Overture places installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Compact Overture places installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-places-compact.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'Compact Overture places is already uninstalled. No files changed.' : 'Compact Overture places is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'overture-places-compact', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Compact Overture places ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
