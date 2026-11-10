#!/usr/bin/env node
'use strict';
/**
 * Mobile Places layout. Requires the preceding compact Places and full-area search updates.
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
              "before": "    ? (props.tileSource&&props.status.searchText?t('uiPoiNoSearchMatches'):((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea')))\n    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});\n  const readyHint = props.status.limited && !props.tileSource ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';\n  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };\n  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;\n  const counts = props.status.loadedCounts;\n  const qualityCount=Number(props.tileQuality?.minimum!=null)+Number(!!props.tileQuality?.hideClosed);\n  const searchDisabled=!!props.tileLoading||!!props.status.pageLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);\n  return <section className=\"mly-places-scroll\" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <style>{placesScrollCss}</style>\n    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong> {t('uiNearbyPlaces')} </strong><button type=\"button\" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 4, minWidth:32, minHeight:32 }}>×</button></div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    {props.tileLoading&&<p role=\"status\" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}\n    <fieldset disabled={!!props.tileLoading} style={{border:0,padding:0,margin:0,minWidth:0}}>\n    {props.tileSource ? <TileCategoryPicker value={props.tileFamily || 'all'} onChange={props.onTileFamily}/> : <div>\n    <div role=\"group\" aria-label={t('uiFilterLoadedPlaces')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>\n      {categories.slice(0, 3).map(([value, label]) => <button key={value} type=\"button\" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '5px 3px', font: 'inherit', fontSize: 10, lineHeight: 1.35, boxSizing: 'border-box', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}><span style={{ display: 'block', overflowWrap: 'anywhere', minWidth: 0 }}>{label}</span>{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}\n    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}> {t('uiMoreCategories')} </span><select aria-label={t('uiPlaceCategory')} value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}> {t('uiCountsAreForLoadedPlaces')} </div>}\n    </div>}\n    {props.tileSource && props.onTileQuality && <details className=\"mly-place-quality\" style={{marginTop:5,borderBottom:'1px solid #506b5a55'}}>\n      <summary style={{cursor:'pointer',minHeight:30,boxSizing:'border-box',padding:'6px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</summary>\n      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>\n    </details>}\n    </fieldset>\n    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {props.onAutoUpdate&&<div style={{marginTop:props.tileSource?0:7,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:props.tileSource?30:undefined}}><input type=\"checkbox\" role=\"switch\" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{props.tileSource?t('uiPoiAutoShort'):owned('Auto-update places')}</span></label>{!props.tileSource&&<div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div>}</div>}\n    {props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n    <p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && !props.onSearch && <button type=\"button\" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedOutsideList')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n",
              "after": "    ? (props.tileSource&&props.status.searchText?t('uiPoiNoSearchMatches'):((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea')))\n    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});\n  const readyHint = props.status.limited && !props.tileSource ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';\n  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };\n  const categories = [['all', t('uiAll')], ['health', t('uiHealth')], ['education', t('uiEducation')], ['parks', t('uiParks')], ['landmarks', t('uiSights')], ['services', t('uiServices')]] as const;\n  const counts = props.status.loadedCounts;\n  const qualityCount=Number(props.tileQuality?.minimum!=null)+Number(!!props.tileQuality?.hideClosed);\n  const searchDisabled=!!props.tileLoading||!!props.status.pageLoading||['off','zoom','outside','loading','paused'].includes(props.status.kind)||(props.status.kind==='search'&&!props.status.canSearch);\n  const filterControls=(\n    <fieldset disabled={!!props.tileLoading} style={{border:0,padding:0,margin:0,minWidth:0}}>\n    {props.tileSource ? <TileCategoryPicker value={props.tileFamily || 'all'} onChange={props.onTileFamily}/> : <div>\n    <div role=\"group\" aria-label={t('uiFilterLoadedPlaces')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 7 }}>\n      {categories.slice(0, 3).map(([value, label]) => <button key={value} type=\"button\" aria-pressed={props.group === value} onClick={() => props.onGroup(value)} style={{ minHeight: 32, minWidth: 0, padding: '5px 3px', font: 'inherit', fontSize: 10, lineHeight: 1.35, boxSizing: 'border-box', cursor: 'pointer', borderRadius: 5, border: props.group === value ? '1px solid #b4d9bc' : '1px solid #506b5a', background: props.group === value ? '#345c43' : '#213c2e', color: 'inherit' }}><span style={{ display: 'block', overflowWrap: 'anywhere', minWidth: 0 }}>{label}</span>{counts && <span style={{ display: 'block', opacity: .75, fontSize: 10 }}>{counts[value] || 0}</span>}</button>)}\n    </div>\n    <label style={{ display: 'block', marginTop: 5 }}><span style={{ fontSize: 10, opacity: .8 }}> {t('uiMoreCategories')} </span><select aria-label={t('uiPlaceCategory')} value={props.group} onChange={e => props.onGroup(e.target.value as PlaceGroup)} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', minHeight: 30, display: 'block', marginTop: 3, background: '#213c2e', color: 'inherit', border: '1px solid #72947d', borderRadius: 4 }}>\n      {categories.map(([value, label]) => <option key={value} value={value}>{label}{counts ? ` · ${counts[value] || 0}` : ''}</option>)}\n    </select></label>\n    {counts && <div style={{ marginTop: 4, fontSize: 10, opacity: .75 }}> {t('uiCountsAreForLoadedPlaces')} </div>}\n    </div>}\n    {props.tileSource && props.onTileQuality && <div className=\"mly-place-quality\" style={{marginTop:5,borderBottom:'1px solid #506b5a55'}}>\n      <div style={{minHeight:20,boxSizing:'border-box',padding:'3px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</div>\n      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>\n    </div>}\n    </fieldset>\n  );\n  const autoControl=(\n    props.onAutoUpdate&&<div style={{marginTop:props.tileSource?0:7,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:props.tileSource?30:undefined}}><input type=\"checkbox\" role=\"switch\" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{props.tileSource?t('uiPoiAutoShort'):owned('Auto-update places')}</span></label>{!props.tileSource&&<div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div>}</div>\n  );\n  return <section className=\"mly-places-scroll\" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <style>{placesScrollCss}</style>\n    <div className=\"mly-places-panel-header\" style={{position:'sticky',top:0,zIndex:3,background:'#192e25',margin:'-9px -9px 4px',padding:'3px 7px',borderBottom:'1px solid #506b5a55',display:'flex',justifyContent:'space-between',alignItems:'center',gap:3}}>\n      <strong style={{minWidth:0,flex:1}}>{t('uiNearbyPlaces')}</strong>\n      {props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} title={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{minHeight:30,minWidth:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',opacity:searchDisabled?.45:1,cursor:searchDisabled?'default':'pointer'}}><span aria-hidden=\"true\">↻</span></button>}\n      <button type=\"button\" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{border:0,background:'none',color:'inherit',cursor:'pointer',padding:3,minWidth:30,minHeight:30}}>×</button>\n    </div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    {props.tileLoading&&<p role=\"status\" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}\n    {props.tileSource?<details className=\"mly-place-filters\" style={{borderBottom:'1px solid #506b5a55',marginBottom:4}}><summary style={{cursor:'pointer',minHeight:30,padding:'6px 0',boxSizing:'border-box',fontSize:10}}>{t('uiFilterNearbyPlaces')}{qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all')>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all'))}</span>}</summary>{filterControls}{autoControl}</details>:filterControls}\n    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {!props.tileSource&&autoControl}\n    {!props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n    {!(props.tileSource&&props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && !props.onSearch && <button type=\"button\" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedOutsideList')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList heading={props.tileSource&&props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n"
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
              "before": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nexport const LoadedPlacesList:React.FC<{onAreaSearch?(text:string):void;searchText?:string;defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{\n const {t,formatLocale:locale,owned:text}=useWidgetLocale();\n const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(props.searchText||''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');\n const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null);\n const origin=held===undefined?props.origin:held;\n const matches=React.useMemo(()=>filterLoadedPlaces(props.places,props.onAreaSearch?'':query,sort==='distance'?origin:null),[props.places,query,!!props.onAreaSearch,sort,origin?.lon,origin?.lat]);\n const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);\n React.useEffect(()=>{setPage(0);},[props.places]);\n React.useEffect(()=>{if(!props.revealRequest||!props.selectedId)return;setOpen(true);if(!props.onAreaSearch)setQuery('');const all=filterLoadedPlaces(props.places,'',sort==='distance'?origin:null);const index=all.findIndex(place=>place.id===props.selectedId);if(index>=0)setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));},[props.revealRequest]);\n React.useEffect(()=>{if(!props.revealRequest||!open||query)return;const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});},[props.revealRequest,open,current,query]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span>{t('uiBrowsePlaces')} {props.places.length})</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n  {open&&<div>\n   <form onSubmit={event=>{event.preventDefault();props.onAreaSearch?.(query);setPage(0);}} style={{display:'flex',gap:4,margin:'4px 0'}}>\n    <input type=\"search\" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n    {props.onAreaSearch&&<button type=\"submit\" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden=\"true\">⌕</span></button>}\n    {props.onAreaSearch&&props.searchText&&<button type=\"button\" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}\n   </form>\n   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n   <div ref={rows} role=\"group\" aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><button type=\"button\" key={place.id} data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',minHeight:34,padding:'4px 3px',border:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>)}\n    {!matches.length&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n",
              "after": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nexport const LoadedPlacesList:React.FC<{heading?:string;onAreaSearch?(text:string):void;searchText?:string;defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{\n const {t,formatLocale:locale,owned:text}=useWidgetLocale();\n const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(props.searchText||''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');\n const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null);\n const origin=held===undefined?props.origin:held;\n const matches=React.useMemo(()=>filterLoadedPlaces(props.places,props.onAreaSearch?'':query,sort==='distance'?origin:null),[props.places,query,!!props.onAreaSearch,sort,origin?.lon,origin?.lat]);\n const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);\n React.useEffect(()=>{setPage(0);},[props.places]);\n React.useEffect(()=>{if(!props.revealRequest||!props.selectedId)return;setOpen(true);if(!props.onAreaSearch)setQuery('');const all=filterLoadedPlaces(props.places,'',sort==='distance'?origin:null);const index=all.findIndex(place=>place.id===props.selectedId);if(index>=0)setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));},[props.revealRequest]);\n React.useEffect(()=>{if(!props.revealRequest||!open||query)return;const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});},[props.revealRequest,open,current,query]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n const listOptions=(<div>\n   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n </div>);\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span aria-live={props.heading?'polite':undefined}>{props.heading||`${t('uiBrowsePlaces')} ${props.places.length})`}</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n  {open&&<div>\n   <form onSubmit={event=>{event.preventDefault();props.onAreaSearch?.(query);setPage(0);}} style={{display:'flex',gap:4,margin:'4px 0'}}>\n    <input type=\"search\" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n    {props.onAreaSearch&&<button type=\"submit\" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden=\"true\">⌕</span></button>}\n    {props.onAreaSearch&&props.searchText&&<button type=\"button\" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}\n   </form>\n   {props.compact?<details style={{marginBottom:3,fontSize:10}}>\n     <summary style={{cursor:'pointer',minHeight:26,padding:'4px 0',boxSizing:'border-box'}}>{text('Sort')} · {text(origin&&sort==='distance'?'Closest first':'Name')}</summary>\n     {listOptions}\n   </details>:listOptions}\n   <div ref={rows} role=\"group\" aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><button type=\"button\" key={place.id} data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',minHeight:34,padding:'4px 3px',border:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>)}\n    {!matches.length&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n"
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
              "before": " const list=nodes.find(n=>n.props?.defaultOpen===true);assert(list);assert.equal(list.props.compact,true);assert(nodes.some(n=>n.type===CategoryPickerStub));\n});\n\ntest('full-area search stays available after an empty result so the user can clear or retry',()=>{\n const search=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onAreaSearch:search,onSelect(){},status:{kind:'ready',count:0,loadedCounts:{all:0},searchText:'missing'},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const list=nodes.find(n=>n.props?.onAreaSearch===search);assert(list);assert.equal(list.props.searchText,'missing');assert(flatten(panel).includes('uiPoiNoSearchMatches'));\n});\n",
              "after": " const list=nodes.find(n=>n.props?.defaultOpen===true);assert(list);assert.equal(list.props.compact,true);assert(nodes.some(n=>n.type===CategoryPickerStub));\n});\n\ntest('full-area search stays available after an empty result so the user can clear or retry',()=>{\n const search=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onAreaSearch:search,onSelect(){},status:{kind:'ready',count:0,loadedCounts:{all:0},searchText:'missing'},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const list=nodes.find(n=>n.props?.onAreaSearch===search);assert(list);assert.equal(list.props.searchText,'missing');assert(flatten(panel).includes('uiPoiNoSearchMatches'));\n});\ntest('mobile hierarchy keeps refresh and close in a sticky header and groups all native filters',()=>{\n const close=()=>{},refresh=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onSelect(){},onAreaSearch(){},onAutoUpdate(){},onSearch:refresh,onClose:close,onTileFamily(){},onTileQuality(){},tileFamily:'cafe',tileQuality:{minimum:.75,hideClosed:true},status:{kind:'ready',count:140,loadedCounts:{all:140}},group:'all',onGroup(){},onRetry(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const header=nodes.find(n=>n.props?.className==='mly-places-panel-header');assert.equal(header.props.style.position,'sticky');assert(flatten(header).includes('uiNearbyPlaces'));\n const childNodes=[];function collect(n){if(Array.isArray(n))n.forEach(collect);else if(n&&typeof n==='object'){childNodes.push(n);collect(n.children)}}collect(header);\n assert(childNodes.some(n=>n.props?.onClick===close));assert(childNodes.some(n=>n.props?.onClick===refresh));assert.equal(nodes.filter(n=>n.props?.onClick===refresh).length,1);\n const filters=nodes.find(n=>n.props?.className==='mly-place-filters');assert.equal(filters.type,'details');assert(!filters.props.open);assert(flatten(filters).includes('uiPoiQualityFilters'));assert(flatten(filters).includes('uiPoiAutoShort'));\n const list=nodes.find(n=>n.props?.defaultOpen===true);assert.equal(list.props.heading,'uiPoiResultRange');assert(!nodes.some(n=>n.type==='p'&&n.props?.role==='status'&&flatten(n)==='uiPoiResultRange'));\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/placesAreaSearchInput.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/placesAreaSearchInput.test.cjs 1",
              "before": "test('area search drafts without requests or filtering only the current page, then submits explicitly',()=>{\n const h=setup(true);let nodes=h.render();nodes.find(n=>n.type==='input').props.onChange({target:{value:'missing'}});nodes=h.render();assert.equal(h.submissions.length,0);assert.equal(nodes.filter(n=>n.props['data-place-id']).length,2);assert.equal(nodes.find(n=>n.type==='input').props.maxLength,120);\n nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});assert.deepEqual(h.submissions,['missing']);\n h.props.searchText='missing';h.props.places=[];nodes=h.render();const clear=nodes.find(n=>n.type==='button'&&n.props['aria-label']==='uiPoiClearAreaSearch');assert(clear);clear.props.onClick();assert.equal(h.submissions.at(-1),'');assert.equal(h.render().find(n=>n.type==='input').props.value,'');\n});\ntest('legacy list still filters loaded results locally',()=>{\n const h=setup(false);h.render().find(n=>n.type==='input').props.onChange({target:{value:'Alpha'}});assert.equal(h.render().filter(n=>n.props['data-place-id']).length,1);assert.equal(h.submissions.length,0);\n});\n",
              "after": "test('area search drafts without requests or filtering only the current page, then submits explicitly',()=>{\n const h=setup(true);let nodes=h.render();nodes.find(n=>n.type==='input').props.onChange({target:{value:'missing'}});nodes=h.render();assert.equal(h.submissions.length,0);assert.equal(nodes.filter(n=>n.props['data-place-id']).length,2);assert.equal(nodes.find(n=>n.type==='input').props.maxLength,120);\n nodes.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});assert.deepEqual(h.submissions,['missing']);\n h.props.searchText='missing';h.props.places=[];nodes=h.render();const clear=nodes.find(n=>n.type==='button'&&n.props['aria-label']==='uiPoiClearAreaSearch');assert(clear);clear.props.onClick();assert.equal(h.submissions.at(-1),'');assert.equal(h.render().find(n=>n.type==='input').props.value,'');\n});\ntest('legacy list still filters loaded results locally',()=>{\n const h=setup(false);h.render().find(n=>n.type==='input').props.onChange({target:{value:'Alpha'}});assert.equal(h.render().filter(n=>n.props['data-place-id']).length,1);assert.equal(h.submissions.length,0);\n});\ntest('compact list keeps search and result rows outside collapsed sort options',()=>{\n const h=setup(true),all=h.render(),options=all.find(n=>n.type==='details');assert(options);assert(!options.props.open);\n const nested=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nested.push(n);walk(n.children)}}walk(options);\n assert(nested.some(n=>n.type==='select'));assert(!nested.some(n=>n.type==='form'||n.props['data-place-id']));assert(all.some(n=>n.type==='form'));assert.equal(all.filter(n=>n.props['data-place-id']).length,2);\n});\n"
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
const prefix = 'overture-mobile-layout-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Mobile Places layout installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-mobile-layout' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Mobile Places layout installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Mobile Places layout installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Mobile Places layout installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-mobile-layout.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'Mobile Places layout is already uninstalled. No files changed.' : 'Mobile Places layout is already installed. No files changed.');
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
  const manifest = { installer: 'overture-mobile-layout', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Mobile Places layout ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
