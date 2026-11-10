#!/usr/bin/env node
'use strict';
/**
 * Places footer alignment. Applies after the compact locate icon spacing update.
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
      "file": "src/components/LoadedPlacesList.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/LoadedPlacesList.tsx 1",
              "before": "   reveal();\n },[props.revealRequest,props.selectedId,props.places,open,current,query,sort,props.visible]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n const listOptions=(<div>\n   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n </div>);\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span aria-live={props.heading?'polite':undefined}>{props.heading||`${t('uiBrowsePlaces')} ${props.places.length})`}</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n  {open&&<div>\n   <form onSubmit={event=>{event.preventDefault();props.onAreaSearch?.(query);setPage(0);}} style={{display:'flex',gap:4,margin:'4px 0'}}>\n    <input type=\"search\" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n    {props.onAreaSearch&&<button type=\"submit\" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden=\"true\">⌕</span></button>}\n    {props.onAreaSearch&&props.searchText&&<button type=\"button\" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}\n   </form>\n   {props.compact?<details style={{marginBottom:3,fontSize:10}}>\n     <summary style={{cursor:'pointer',minHeight:26,padding:'4px 0',boxSizing:'border-box'}}>{text('Sort')} · {text(origin&&sort==='distance'?'Closest first':'Name')}</summary>\n     {listOptions}\n   </details>:listOptions}\n   <div ref={rows} role=\"group\" aria-busy={!!props.loading} aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><div key={place.id} style={{display:'flex',alignItems:'stretch',gap:2,minWidth:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent'}}><button type=\"button\" data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',flex:1,minWidth:0,minHeight:34,padding:'4px 3px',border:0,borderRadius:5,background:'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>{props.onShowOnMap&&<button type=\"button\" aria-label={`${t('uiShowOnMap')}: ${place.name}`} title={`${t('uiShowOnMap')}: ${place.name}`} onClick={()=>props.onShowOnMap?.(place.id)} onFocus={()=>props.onHover?.(place.id)} style={{...compactPageButton,alignSelf:'center',flex:'0 0 28px',width:28,height:28,minWidth:28,minHeight:28,marginInlineEnd:4,marginBlock:2,boxSizing:'border-box',padding:6,display:'grid',placeItems:'center',lineHeight:1,background:'transparent'}}><svg aria-hidden=\"true\" focusable=\"false\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" style={{display:'block',width:14,height:14,minWidth:14,flexShrink:0}}><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 2v5m0 10v5M2 12h5m10 0h5\"/></svg></button>}</div>)}\n    {!matches.length&&!props.loading&&!props.failed&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n};\n\nconst compactPageButton={minHeight:30,minWidth:30,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};\n",
              "after": "   reveal();\n },[props.revealRequest,props.selectedId,props.places,open,current,query,sort,props.visible]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n const listOptions=(<div>\n   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n </div>);\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:props.compact?0:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span aria-live={props.heading?'polite':undefined}>{props.heading||`${t('uiBrowsePlaces')} ${props.places.length})`}</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n  {open&&<div>\n   <form onSubmit={event=>{event.preventDefault();props.onAreaSearch?.(query);setPage(0);}} style={{display:'flex',gap:4,margin:'4px 0'}}>\n    <input type=\"search\" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n    {props.onAreaSearch&&<button type=\"submit\" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden=\"true\">⌕</span></button>}\n    {props.onAreaSearch&&props.searchText&&<button type=\"button\" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}\n   </form>\n   {props.compact?<details style={{marginBottom:3,fontSize:10}}>\n     <summary style={{cursor:'pointer',minHeight:26,padding:'4px 0',boxSizing:'border-box'}}>{text('Sort')} · {text(origin&&sort==='distance'?'Closest first':'Name')}</summary>\n     {listOptions}\n   </details>:listOptions}\n   <div ref={rows} role=\"group\" aria-busy={!!props.loading} aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><div key={place.id} style={{display:'flex',alignItems:'stretch',gap:2,minWidth:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent'}}><button type=\"button\" data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',flex:1,minWidth:0,minHeight:34,padding:'4px 3px',border:0,borderRadius:5,background:'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>{props.onShowOnMap&&<button type=\"button\" aria-label={`${t('uiShowOnMap')}: ${place.name}`} title={`${t('uiShowOnMap')}: ${place.name}`} onClick={()=>props.onShowOnMap?.(place.id)} onFocus={()=>props.onHover?.(place.id)} style={{...compactPageButton,alignSelf:'center',flex:'0 0 28px',width:28,height:28,minWidth:28,minHeight:28,marginInlineEnd:4,marginBlock:2,boxSizing:'border-box',padding:6,display:'grid',placeItems:'center',lineHeight:1,background:'transparent'}}><svg aria-hidden=\"true\" focusable=\"false\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" style={{display:'block',width:14,height:14,minWidth:14,flexShrink:0}}><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 2v5m0 10v5M2 12h5m10 0h5\"/></svg></button>}</div>)}\n    {!matches.length&&!props.loading&&!props.failed&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={props.compact?{display:'grid',gridTemplateColumns:'30px minmax(0,1fr) 30px',alignItems:'center',gap:6,marginTop:6,paddingInline:4,boxSizing:'border-box',width:'100%',textAlign:'center',fontSize:10}:{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n};\n\nconst compactPageButton={boxSizing:'border-box' as const,width:30,height:30,minHeight:30,minWidth:30,padding:4,display:'inline-grid',placeItems:'center',lineHeight:1.2,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/PlacesPanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/PlacesPanel.tsx 1",
              "before": "    </div>\n    {!(props.tileSource&&props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry} style={{width:'100%',minHeight:30,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',cursor:'pointer'}}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.tileLoading&&['ready','search'].includes(props.status.kind)&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedNotInPage')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList failed={props.status.kind==='error'||!!props.status.pageError} visible={!collapsed} loading={!!props.tileLoading||['loading','paused'].includes(props.status.kind)||!!props.status.pageLoading} onShowOnMap={props.onShowOnMap} heading={props.tileSource&&props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>\n      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>\n    </details>:<span style={{opacity:.7,fontSize:10}}>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</span>}\n    </div>\n  </section>;\n};\n",
              "after": "    </div>\n    {!(props.tileSource&&props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry} style={{width:'100%',minHeight:30,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',cursor:'pointer'}}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.tileLoading&&['ready','search'].includes(props.status.kind)&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedNotInPage')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList failed={props.status.kind==='error'||!!props.status.pageError} visible={!collapsed} loading={!!props.tileLoading||['loading','paused'].includes(props.status.kind)||!!props.status.pageLoading} onShowOnMap={props.onShowOnMap} heading={props.tileSource&&props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:6,alignItems:'center',margin:'6px 4px 0',fontSize:10}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',boxSizing:'border-box',width:30,height:30,minWidth:30,minHeight:30,padding:4,display:'grid',placeItems:'center',lineHeight:1.2,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,boxSizing:'border-box',height:30,minWidth:0,minHeight:30,padding:'4px 6px',lineHeight:1.2,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:6,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>\n      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>\n    </details>:<span style={{opacity:.7,fontSize:10}}>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</span>}\n    </div>\n  </section>;\n};\n"
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
const prefix = 'overture-footer-alignment-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Places footer alignment installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-footer-alignment' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Places footer alignment installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Places footer alignment installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Places footer alignment installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-footer-alignment.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'Places footer alignment is already uninstalled. No files changed.' : 'Places footer alignment is already installed. No files changed.');
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
  const manifest = { installer: 'overture-footer-alignment', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places footer alignment ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
