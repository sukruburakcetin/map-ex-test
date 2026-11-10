#!/usr/bin/env node
'use strict';
/**
 * Places selection and feedback. Requires the preceding Places minimize/restore update.
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
              "before": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nexport const LoadedPlacesList:React.FC<{heading?:string;onAreaSearch?(text:string):void;searchText?:string;defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{\n const {t,formatLocale:locale,owned:text}=useWidgetLocale();\n const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(props.searchText||''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');\n const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null);\n const origin=held===undefined?props.origin:held;\n const matches=React.useMemo(()=>filterLoadedPlaces(props.places,props.onAreaSearch?'':query,sort==='distance'?origin:null),[props.places,query,!!props.onAreaSearch,sort,origin?.lon,origin?.lat]);\n const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);\n React.useEffect(()=>{setPage(0);},[props.places]);\n React.useEffect(()=>{if(!props.revealRequest||!props.selectedId)return;setOpen(true);if(!props.onAreaSearch)setQuery('');const all=filterLoadedPlaces(props.places,'',sort==='distance'?origin:null);const index=all.findIndex(place=>place.id===props.selectedId);if(index>=0)setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));},[props.revealRequest]);\n React.useEffect(()=>{if(!props.revealRequest||!open||query)return;const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});},[props.revealRequest,open,current,query]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n const listOptions=(<div>\n   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n </div>);\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span aria-live={props.heading?'polite':undefined}>{props.heading||`${t('uiBrowsePlaces')} ${props.places.length})`}</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n",
              "after": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport type { Place } from '../features/places/placesModel';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nexport const LoadedPlacesList:React.FC<{visible?:boolean;loading?:boolean;failed?:boolean;onShowOnMap?(id:string):void;heading?:string;onAreaSearch?(text:string):void;searchText?:string;defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{\n const {t,formatLocale:locale,owned:text}=useWidgetLocale();\n const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(props.searchText||''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');\n const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null),lastReveal=React.useRef(0),pendingReveal=React.useRef(false),wasVisible=React.useRef(props.visible!==false);\n const origin=held===undefined?props.origin:held;\n const matches=React.useMemo(()=>filterLoadedPlaces(props.places,props.onAreaSearch?'':query,sort==='distance'?origin:null),[props.places,query,!!props.onAreaSearch,sort,origin?.lon,origin?.lat]);\n const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);\n React.useEffect(()=>{setPage(0);},[props.places]);\n React.useEffect(()=>{\n   const requested=!!props.revealRequest&&props.revealRequest!==lastReveal.current;lastReveal.current=props.revealRequest||0;\n   if(!props.selectedId)return;\n   if(requested){setOpen(true);if(!props.onAreaSearch)setQuery('');}\n   const all=filterLoadedPlaces(props.places,props.onAreaSearch||requested?'':query,sort==='distance'?origin:null),index=all.findIndex(place=>place.id===props.selectedId);\n   if(index>=0){setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));if(props.visible===false)pendingReveal.current=true;}\n },[props.revealRequest,props.selectedId,props.places,sort]);\n React.useEffect(()=>{\n   const restoring=props.visible!==false&&!wasVisible.current;wasVisible.current=props.visible!==false;\n   if(!props.selectedId||!open||props.visible===false||(!props.onAreaSearch&&query))return;\n   if(restoring&&!pendingReveal.current)return;\n   pendingReveal.current=false;\n   const reveal=()=>{const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});};\n   // Run after the parent restores its saved scroll position; never scroll hidden rows.\n   if(typeof requestAnimationFrame==='function'){const frame=requestAnimationFrame(reveal);return()=>cancelAnimationFrame(frame);}\n   reveal();\n },[props.revealRequest,props.selectedId,props.places,open,current,query,sort,props.visible]);\n const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};\n const listOptions=(<div>\n   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}\n   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value=\"distance\" disabled={!origin}>{text('Closest first')}</option><option value=\"name\">{text('Name')}</option></select></label>\n   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}\n </div>);\n return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>\n  <button type=\"button\" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span aria-live={props.heading?'polite':undefined}>{props.heading||`${t('uiBrowsePlaces')} ${props.places.length})`}</span><span aria-hidden=\"true\">{open?'▴':'▾'}</span></button>\n"
            },
            {
              "label": "src/components/LoadedPlacesList.tsx 2",
              "before": "    <input type=\"search\" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n    {props.onAreaSearch&&<button type=\"submit\" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden=\"true\">⌕</span></button>}\n    {props.onAreaSearch&&props.searchText&&<button type=\"button\" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}\n   </form>\n   {props.compact?<details style={{marginBottom:3,fontSize:10}}>\n     <summary style={{cursor:'pointer',minHeight:26,padding:'4px 0',boxSizing:'border-box'}}>{text('Sort')} · {text(origin&&sort==='distance'?'Closest first':'Name')}</summary>\n     {listOptions}\n   </details>:listOptions}\n   <div ref={rows} role=\"group\" aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><button type=\"button\" key={place.id} data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',minHeight:34,padding:'4px 3px',border:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>)}\n    {!matches.length&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n};\n\nconst compactPageButton={minHeight:30,minWidth:30,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};\n",
              "after": "    <input type=\"search\" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>\n    {props.onAreaSearch&&<button type=\"submit\" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden=\"true\">⌕</span></button>}\n    {props.onAreaSearch&&props.searchText&&<button type=\"button\" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}\n   </form>\n   {props.compact?<details style={{marginBottom:3,fontSize:10}}>\n     <summary style={{cursor:'pointer',minHeight:26,padding:'4px 0',boxSizing:'border-box'}}>{text('Sort')} · {text(origin&&sort==='distance'?'Closest first':'Name')}</summary>\n     {listOptions}\n   </details>:listOptions}\n   <div ref={rows} role=\"group\" aria-busy={!!props.loading} aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>\n    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><div key={place.id} style={{display:'flex',alignItems:'stretch',gap:2,minWidth:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent'}}><button type=\"button\" data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',flex:1,minWidth:0,minHeight:34,padding:'4px 3px',border:0,borderRadius:5,background:'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt=\"\" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>{props.onShowOnMap&&<button type=\"button\" aria-label={`${t('uiShowOnMap')}: ${place.name}`} title={`${t('uiShowOnMap')}: ${place.name}`} onClick={()=>props.onShowOnMap?.(place.id)} onFocus={()=>props.onHover?.(place.id)} style={{...compactPageButton,alignSelf:'center',background:'transparent'}}><span aria-hidden=\"true\">⌖</span></button>}</div>)}\n    {!matches.length&&!props.loading&&!props.failed&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}\n   </div>\n   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type=\"button\" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type=\"button\" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}\n   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}\n  </div>}\n </div>;\n};\n\nconst compactPageButton={minHeight:30,minWidth:30,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};\n"
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
              "before": "import { React, jsx } from 'jimu-core';\nimport { SelectedPlaceSummary, SelectedPlaceProps, placesScrollCss } from './SelectedPlaceCard';\nimport { LoadedPlacesList } from './LoadedPlacesList';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport { PlaceQualityControls } from './PlaceQualityControls';\nimport { TileCategoryPicker } from './TileCategoryPicker';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onAreaSearch?(text:string):void;onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n const { t, owned, formatLocale:locale } = useWidgetLocale();\n const [collapsed,setCollapsed]=React.useState(false),[pillPosition,setPillPosition]=React.useState<{left:number;top:number}|null>(null),panel=React.useRef<HTMLElement>(null),savedScroll=React.useRef(0),restoreButton=React.useRef<HTMLButtonElement>(null),minimizeButton=React.useRef<HTMLButtonElement>(null),wasMinimized=React.useRef(false),bodyId=React.useId();\n React.useEffect(()=>{\n   if(panel.current)panel.current.scrollTop=collapsed?0:savedScroll.current;\n   if(collapsed)restoreButton.current?.focus({preventScroll:true});\n   else if(wasMinimized.current)minimizeButton.current?.focus({preventScroll:true});\n   wasMinimized.current=collapsed;\n },[collapsed]);\n",
              "after": "import { React, jsx } from 'jimu-core';\nimport { SelectedPlaceSummary, SelectedPlaceProps, placesScrollCss } from './SelectedPlaceCard';\nimport { LoadedPlacesList } from './LoadedPlacesList';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport { PlaceQualityControls } from './PlaceQualityControls';\nimport { TileCategoryPicker } from './TileCategoryPicker';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onShowOnMap?(id:string):void;onAreaSearch?(text:string):void;onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n const { t, owned, formatLocale:locale } = useWidgetLocale();\n const [collapsed,setCollapsed]=React.useState(false),[pillPosition,setPillPosition]=React.useState<{left:number;top:number}|null>(null),panel=React.useRef<HTMLElement>(null),savedScroll=React.useRef(0),restoreButton=React.useRef<HTMLButtonElement>(null),minimizeButton=React.useRef<HTMLButtonElement>(null),wasMinimized=React.useRef(false),bodyId=React.useId();\n React.useEffect(()=>{\n   if(panel.current)panel.current.scrollTop=collapsed?0:savedScroll.current;\n   if(collapsed)restoreButton.current?.focus({preventScroll:true});\n   else if(wasMinimized.current)minimizeButton.current?.focus({preventScroll:true});\n   wasMinimized.current=collapsed;\n },[collapsed]);\n"
            },
            {
              "label": "src/components/PlacesPanel.tsx 2",
              "before": "    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {!props.tileSource&&autoControl}\n    {!props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n    {!(props.tileSource&&props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && !props.onSearch && <button type=\"button\" onClick={props.onRetry}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedOutsideList')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList heading={props.tileSource&&props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n",
              "after": "    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {!props.tileSource&&autoControl}\n    {!props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n    {!(props.tileSource&&props.status.kind==='ready'&&props.status.count>0&&props.onSelect)&&<p role=\"status\" style={{ lineHeight: 1.35, margin: '5px 0',fontSize:10 }}>{messages[props.status.kind]}</p>}\n    {canShowAll && <button type=\"button\" onClick={() => props.tileSource ? props.onTileFamily?.('all') : props.onGroup('all')} style={{ width: '100%', minHeight: 30, marginBottom: 7, padding: '4px 6px', border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', font: 'inherit' }}> {t('uiShowAllLoadedPlaces')} </button>}\n    {props.status.kind === 'outside' && props.onGoToArea && <button type=\"button\" onClick={props.onGoToArea} style={{ width: '100%', minHeight: 30, marginBottom: 7, border: '1px solid #72947d', borderRadius: 4, background: '#284b38', color: 'inherit', cursor: 'pointer', fontSize: 11 }}> {t('uiGoToCoveredArea')} </button>}\n    {props.status.kind === 'error' && <button type=\"button\" onClick={props.onRetry} style={{width:'100%',minHeight:30,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',cursor:'pointer'}}> {t('uiRetryPlaces')} </button>}\n    {props.tileSource&&props.selection&&!props.tileLoading&&['ready','search'].includes(props.status.kind)&&!props.places?.some(place=>place.id===props.selection?.place.id)&&<p style={{fontSize:10,lineHeight:1.4}}>{t('uiPoiSelectedNotInPage')}</p>}\n    {props.tileSource&&props.status.pageError&&<p role=\"alert\">{t('uiPoiPageFailed')}</p>}\n    {props.onSelect && (!empty||!!props.onAreaSearch) && <LoadedPlacesList failed={props.status.kind==='error'||!!props.status.pageError} visible={!collapsed} loading={!!props.tileLoading||['loading','paused'].includes(props.status.kind)||!!props.status.pageLoading} onShowOnMap={props.onShowOnMap} heading={props.tileSource&&props.status.kind==='ready'&&props.status.count>0?readyMessage:undefined} onAreaSearch={props.onAreaSearch} searchText={props.status.searchText} defaultOpen={props.tileSource} compact={props.tileSource} originIsSnapshot={props.tileSource} origin={props.origin} hoveredId={props.hoveredId} revealRequest={props.revealRequest} onHover={props.onHover} places={props.places || []} selectedId={props.selection?.place.id} onSelect={props.onSelect}/>}\n    {props.tileSource&&((props.status.pageOffset||0)>0||props.status.limited)&&<div aria-busy={!!props.status.pageLoading} style={{display:'flex',gap:5,alignItems:'stretch',margin:'7px 0'}}>\n      {(props.status.pageOffset||0)>0&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} aria-label={t('uiPoiPreviousResults')} title={t('uiPoiPreviousResults')} onClick={props.onPreviousResults} style={{flex:'0 0 30px',minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit'}}><span aria-hidden=\"true\">‹</span></button>}\n      {props.status.limited&&<button type=\"button\" disabled={props.tileLoading||props.status.pageLoading||props.status.kind!=='ready'} onClick={props.onLoadMore} style={{flex:1,minWidth:0,minHeight:30,padding:5,border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit'}}>{t(props.status.pageLoading?'uiPoiLoadingPage':'uiPoiLoadMore')}</button>}\n    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/ArcGISPlaces.ts 1",
              "before": "    let extent = view.extent;\n    if (extent && !extent.spatialReference?.isGeographic) extent = extent.spatialReference?.isWebMercator ? this.host.geographic(extent) : null;\n    const valid = extent && [extent.xmin, extent.ymin, extent.xmax, extent.ymax].every(Number.isFinite) && extent.xmin >= -180 && extent.xmax <= 180 && extent.xmin < extent.xmax && extent.ymin < extent.ymax && extent.ymin >= -85.051129 && extent.ymax <= 85.051129;\n    return { token: view, bbox: valid ? [extent.xmin, extent.ymin, extent.xmax, extent.ymax] : null, zoom: view.zoom, stationary: view.stationary !== false };\n  }\n  private display(places: Place[], view: any): void {\n    if (this.disposed || this.host.view() !== view || this.host.busy() || view.destroyed) return;\n    if (this.host.externalSelection) {\n      this.ownerView = view; this.records = new Map(places.map(place => [place.id, place])); this.listedPlaces = places;\n      if (this.listVisible) this.host.list?.(places);\n      return;\n    }\n    if (this.ownerView !== view || !this.graphics) {\n      this.clear(); this.ownerView = view;\n      this.graphics = new this.host.modules.GraphicsLayer({ id: `overture-places-${this.host.id}`, title: 'Nearby places · Overture', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      view.map.add(this.graphics, 0);\n",
              "after": "    let extent = view.extent;\n    if (extent && !extent.spatialReference?.isGeographic) extent = extent.spatialReference?.isWebMercator ? this.host.geographic(extent) : null;\n    const valid = extent && [extent.xmin, extent.ymin, extent.xmax, extent.ymax].every(Number.isFinite) && extent.xmin >= -180 && extent.xmax <= 180 && extent.xmin < extent.xmax && extent.ymin < extent.ymax && extent.ymin >= -85.051129 && extent.ymax <= 85.051129;\n    return { token: view, bbox: valid ? [extent.xmin, extent.ymin, extent.xmax, extent.ymax] : null, zoom: view.zoom, stationary: view.stationary !== false };\n  }\n  private display(places: Place[], view: any): void {\n    if (this.disposed || this.host.view() !== view || this.host.busy() || view.destroyed) return;\n    if (this.host.externalSelection) {\n      this.setHover(null);\n      this.ownerView = view; this.records = new Map(places.map(place => [place.id, place])); this.listedPlaces = places;\n      if (this.listVisible) this.host.list?.(places);\n      return;\n    }\n    if (this.ownerView !== view || !this.graphics) {\n      this.clear(); this.ownerView = view;\n      this.graphics = new this.host.modules.GraphicsLayer({ id: `overture-places-${this.host.id}`, title: 'Nearby places · Overture', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });\n      view.map.add(this.graphics, 0);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/runtime/widget.tsx 1",
              "before": "  };\n  private goToPlacesArea = () => {\n    const view = this.state.jimuMapView?.view, bounds = this._places?.coverageExtent;\n    if (!view?.ready || view.destroyed || !bounds || !this.ArcGISModules?.Point) return;\n    const [west, south, east, north] = paddedPlacesExtent(bounds);\n    const Point = this.ArcGISModules.Point;\n    this.navigateMapView(view, { target: [new Point({ longitude: west, latitude: south, spatialReference: { wkid: 4326 } }), new Point({ longitude: east, latitude: north, spatialReference: { wkid: 4326 } })] }, { animate: false });\n  };\n  private goToSelectedPlace = () => {\n    const place = this.state.selectedPlace, view = this.state.jimuMapView?.view;\n    if (!this.state.placesActive || !place || !view?.ready || view.destroyed || !this.ArcGISModules?.Point || !Number.isFinite(place.lon) || !Number.isFinite(place.lat) || Math.abs(place.lon) > 180 || Math.abs(place.lat) > 85.051129) return;\n    const center = new this.ArcGISModules.Point({ longitude: place.lon, latitude: place.lat, spatialReference: { wkid: 4326 } });\n    this.navigateMapView(view, { center, zoom: Number.isFinite(view.zoom) ? Math.max(view.zoom, 16) : 16 }, { animate: false });\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n    if (!place) return;\n    const label = placeCameraDistanceLabel(distanceMeters(lat, lon, place.lat, place.lon), this._presentation);\n    if (label !== this.state.placesCameraDistance) this.setState({ placesCameraDistance: label });\n  }\n",
              "after": "  };\n  private goToPlacesArea = () => {\n    const view = this.state.jimuMapView?.view, bounds = this._places?.coverageExtent;\n    if (!view?.ready || view.destroyed || !bounds || !this.ArcGISModules?.Point) return;\n    const [west, south, east, north] = paddedPlacesExtent(bounds);\n    const Point = this.ArcGISModules.Point;\n    this.navigateMapView(view, { target: [new Point({ longitude: west, latitude: south, spatialReference: { wkid: 4326 } }), new Point({ longitude: east, latitude: north, spatialReference: { wkid: 4326 } })] }, { animate: false });\n  };\n  private goToSelectedPlace = () => this.centerPlaceOnMap(this.state.selectedPlace);\n  private showListedPlaceOnMap = (id:string) => {\n    const place=this.state.placesList.find(value=>value.id===id);\n    if(place&&this._places?.open([],id,false,'list'))this.centerPlaceOnMap(place);\n  };\n  private centerPlaceOnMap = (place:Place|null) => {\n    const view=this.state.jimuMapView?.view;\n    if(!this.state.placesActive||!place||!view?.ready||view.destroyed||!this.ArcGISModules?.Point||!Number.isFinite(place.lon)||!Number.isFinite(place.lat)||Math.abs(place.lon)>180||Math.abs(place.lat)>85.051129)return;\n    const target=new this.ArcGISModules.Point({longitude:place.lon,latitude:place.lat,spatialReference:{wkid:4326}});\n    this.navigateMapView(view,{target,zoom:Number.isFinite(view.zoom)?Math.max(view.zoom,16):16},{animate:false});\n  };\n  private updatePlacesCamera(lon: number, lat: number): void {\n    this._places?.selection.updateCamera(lon, lat);\n    const place = this.state.selectedPlace;\n    if (!place) return;\n    const label = placeCameraDistanceLabel(distanceMeters(lat, lon, place.lat, place.lon), this._presentation);\n    if (label !== this.state.placesCameraDistance) this.setState({ placesCameraDistance: label });\n  }\n"
            },
            {
              "label": "src/runtime/widget.tsx 2",
              "before": "                const code = Object.keys(spriteData).find((c) => (objectNameMap[c] || c) === newName);\n                filterCode = code || newName;\n              }\n              this.filterObjectsVTLayer(filterCode);\n            });\n          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel onAreaSearch={this._placesTilesPrototype?text=>this._places?.controller.setSearchText(text):undefined} onLoadMore={()=>this._places?.controller.loadMore()} onPreviousResults={()=>this._places?.controller.previousPage()} tileLoading={this.state.placesSourceLoading} tileQuality={this._placesTilesPrototype?.quality} onTileQuality={this._placesTilesPrototype?.supportsFamilyFilter ? this.setPlacesTileQuality : undefined} tileSource={!!this._placesTilesPrototype} tileFamily={this._placesTilesPrototype?.supportsFamilyFilter ? this.state.placesTileCategory : 'all'} onTileFamily={this._placesTilesPrototype?.supportsFamilyFilter ? this.setPlacesTileCategory : undefined} autoUpdate={this.state.placesAutoUpdate} onAutoUpdate={this.setPlacesAutoUpdate} onSearch={()=>this._places?.controller.searchArea()} origin={this._placesTilesPrototype?this.state.placesStatus.resultOrigin||null:this.placesListOrigin()} hoveredId={this.state.placesHoveredId} revealRequest={this.state.placesRevealRequest} onHover={id=>this._places?.setHover(id)} onGoToArea={this.goToPlacesArea} group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id,false,'list')}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            enterpriseEnabled:!!(this.props.config.sharedFieldNotesEnabled&&this.props.config.sharedFieldNotesUrl),onNote:this.createPlaceFieldNote,currentImageId:this.state.imageId,onGetNoteImage:this.getPlaceNoteImage,onLoadNotePreview:this.loadDetectionPreview,notePhase:this.state.placeNotePhase,onCancelNote:this.cancelPlaceNotePreparation,onImagery:()=>this._places?.open([],this.state.selectedPlace?.id,true,'card'),\n            onBack: this.goToSelectedPlace, onDetails: () => this._places?.open([], this.state.selectedPlace?.id,false,'card'), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink} cameraDistance={this.state.placesCameraDistance}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n",
              "after": "                const code = Object.keys(spriteData).find((c) => (objectNameMap[c] || c) === newName);\n                filterCode = code || newName;\n              }\n              this.filterObjectsVTLayer(filterCode);\n            });\n          }}\n        />\n\n        {this.state.placesActive && this.state.placesPanelOpen && <PlacesPanel onShowOnMap={this.showListedPlaceOnMap} onAreaSearch={this._placesTilesPrototype?text=>this._places?.controller.setSearchText(text):undefined} onLoadMore={()=>this._places?.controller.loadMore()} onPreviousResults={()=>this._places?.controller.previousPage()} tileLoading={this.state.placesSourceLoading} tileQuality={this._placesTilesPrototype?.quality} onTileQuality={this._placesTilesPrototype?.supportsFamilyFilter ? this.setPlacesTileQuality : undefined} tileSource={!!this._placesTilesPrototype} tileFamily={this._placesTilesPrototype?.supportsFamilyFilter ? this.state.placesTileCategory : 'all'} onTileFamily={this._placesTilesPrototype?.supportsFamilyFilter ? this.setPlacesTileCategory : undefined} autoUpdate={this.state.placesAutoUpdate} onAutoUpdate={this.setPlacesAutoUpdate} onSearch={()=>this._places?.controller.searchArea()} origin={this._placesTilesPrototype?this.state.placesStatus.resultOrigin||null:this.placesListOrigin()} hoveredId={this.state.placesHoveredId} revealRequest={this.state.placesRevealRequest} onHover={id=>this._places?.setHover(id)} onGoToArea={this.goToPlacesArea} group={this.state.placesGroup} status={this.state.placesStatus} places={this.state.placesList} onSelect={id => this._places?.open([], id,false,'list')}\n          selection={this.state.selectedPlace ? { place: this.state.selectedPlace, link: this.state.placesShowLink, cameraDistance: this.state.placesCameraDistance,\n            onLink: value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); },\n            enterpriseEnabled:!!(this.props.config.sharedFieldNotesEnabled&&this.props.config.sharedFieldNotesUrl),onNote:this.createPlaceFieldNote,currentImageId:this.state.imageId,onGetNoteImage:this.getPlaceNoteImage,onLoadNotePreview:this.loadDetectionPreview,notePhase:this.state.placeNotePhase,onCancelNote:this.cancelPlaceNotePreparation,onImagery:()=>this._places?.open([],this.state.selectedPlace?.id,true,'card'),\n            onBack: this.goToSelectedPlace, onDetails: () => this._places?.open([], this.state.selectedPlace?.id,false,'card'), onClear: () => this._places?.clearSelection() } : undefined}\n          onGroup={this.setPlacesGroup} onRetry={() => this._places?.controller.retry()} onClose={() => this.setState({ placesPanelOpen: false })}/>}\n\n        {this.state.placesActive && !this.state.placesPanelOpen && this.state.selectedPlace && <SelectedPlaceCard place={this.state.selectedPlace} link={this.state.placesShowLink} cameraDistance={this.state.placesCameraDistance}\n          onLink={value => { this.setState({ placesShowLink: value }); this._places?.selection.setLink(value); }}\n"
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
              "before": "test('unsupported native adapters do not present an enabled family control',()=>{\n const panel=m.exports.PlacesPanel({tileSource:true,tileFamily:'all',status:{kind:'ready',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}}),nodes=[];\n function walk(value){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'){nodes.push(value);walk(value.children)}}walk(panel);\n assert.equal(nodes.find(node=>node.type===CategoryPickerStub).props.onChange,undefined);\n});\ntest('filter loading disables controls and explains an independently selected place outside the list',()=>{\n const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileLoading:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n assert(flatten(panel).includes('uiPoiUpdating'));assert(flatten(panel).includes('uiPoiSelectedOutsideList'));assert.equal(nodes.find(n=>n.type==='fieldset').props.disabled,true);\n});\ntest('native paging exposes range navigation and keeps paging disabled for stale searches',()=>{\n const nodes=[];const panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'search',count:200,limited:true,pageOffset:200,canSearch:true},group:'all',onGroup(){},onRetry(){},onClose(){},onLoadMore(){},onPreviousResults(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n for(const label of ['uiPoiLoadMore','uiPoiPreviousResults'])assert.equal(nodes.find(n=>n.type==='button'&&(flatten(n)===label||n.props['aria-label']===label)).props.disabled,true);\n assert(flatten(panel).includes('uiPoiScaleHint'));assert(flatten(panel).includes('uiPoiPagedHint'));\n});\n\n",
              "after": "test('unsupported native adapters do not present an enabled family control',()=>{\n const panel=m.exports.PlacesPanel({tileSource:true,tileFamily:'all',status:{kind:'ready',count:0},group:'all',onGroup(){},onRetry(){},onClose(){}}),nodes=[];\n function walk(value){if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object'){nodes.push(value);walk(value.children)}}walk(panel);\n assert.equal(nodes.find(node=>node.type===CategoryPickerStub).props.onChange,undefined);\n});\ntest('filter loading disables controls and explains an independently selected place outside the list',()=>{\n const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,tileLoading:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n assert(flatten(panel).includes('uiPoiUpdating'));assert(!flatten(panel).includes('uiPoiSelectedNotInPage'));assert.equal(nodes.find(n=>n.type==='fieldset').props.disabled,true);\n});\ntest('native paging exposes range navigation and keeps paging disabled for stale searches',()=>{\n const nodes=[];const panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'search',count:200,limited:true,pageOffset:200,canSearch:true},group:'all',onGroup(){},onRetry(){},onClose(){},onLoadMore(){},onPreviousResults(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n for(const label of ['uiPoiLoadMore','uiPoiPreviousResults'])assert.equal(nodes.find(n=>n.type==='button'&&(flatten(n)===label||n.props['aria-label']===label)).props.disabled,true);\n assert(flatten(panel).includes('uiPoiScaleHint'));assert(flatten(panel).includes('uiPoiPagedHint'));\n});\n\n"
            },
            {
              "label": "tests/placesPanelRendering.test.cjs 2",
              "before": "});\n\ntest('panel title is a plain heading and minimize is distinct from close',()=>{\n panelHooks.collapsed=false;const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'ready',count:140},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const minimize=nodes.find(n=>n.props?.['aria-label']==='uiPoiMinimizePanel');assert(minimize);assert.equal(flatten(minimize),'−');assert(nodes.some(n=>n.type==='strong'&&flatten(n)==='uiNearbyPlaces'));assert(!nodes.some(n=>n.type==='button'&&flatten(n)==='uiNearbyPlaces'));\n assert(nodes.some(n=>n.props?.['aria-label']==='uiCloseNearbyPlacesFilters'));\n});\n",
              "after": "});\n\ntest('panel title is a plain heading and minimize is distinct from close',()=>{\n panelHooks.collapsed=false;const nodes=[],panel=m.exports.PlacesPanel({tileSource:true,status:{kind:'ready',count:140},group:'all',onGroup(){},onRetry(){},onClose(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const minimize=nodes.find(n=>n.props?.['aria-label']==='uiPoiMinimizePanel');assert(minimize);assert.equal(flatten(minimize),'−');assert(nodes.some(n=>n.type==='strong'&&flatten(n)==='uiNearbyPlaces'));assert(!nodes.some(n=>n.type==='button'&&flatten(n)==='uiNearbyPlaces'));\n assert(nodes.some(n=>n.props?.['aria-label']==='uiCloseNearbyPlacesFilters'));\n});\n\ntest('outside-page selection is explained after loading and failure offers an explicit retry',()=>{\n const props={tileSource:true,status:{kind:'ready',count:0},places:[],selection:{place:{id:'outside'}},group:'all',onGroup(){},onRetry(){},onClose(){},onSearch(){},onSelect(){}};\n assert(flatten(m.exports.PlacesPanel(props)).includes('uiPoiSelectedNotInPage'));\n const nodes=[],retry=()=>{},tree=m.exports.PlacesPanel({...props,status:{kind:'error',count:0},onRetry:retry});function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(tree);\n assert(nodes.some(n=>n.type==='button'&&n.props?.onClick===retry));assert.equal(nodes.find(n=>n.props?.defaultOpen===true).props.failed,true);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/tilePlaceIntegration.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/tilePlaceIntegration.test.cjs 1",
              "before": " const owner=new ArcGISPlaces({externalSelection:true,id:'hover',url:'',view:()=>view,externalMapVisible:()=>true,modules:{Graphic,GraphicsLayer:Layer,Point:Value},geographic:x=>x,busy:()=>false,status(){},hovered:id=>hovered.push(id),explore:async()=>{queries++;return[]},openImagery(){}});\n const place=id=>({id,name:'Place '+id,category:'cafe',group:'other',confidence:null,lon:-86.13,lat:39.775,address:'',website:'',release:'2026-10-21.0'});\n try{\n  owner.display([place('loaded-1'),place('loaded-2')],view);owner.setHover('loaded-1');for(let i=0;i<30;i++)owner.setHover('loaded-1');\n  assert.equal(graphics,1);assert.equal(owner.stats.hoverGraphics,1);assert.deepEqual(hovered,['loaded-1']);owner.setHover('loaded-2');assert.equal(graphics,1);assert.equal(hovered.at(-1),'loaded-2');\n  owner.setHover(null);owner.setExternalHover(place('outside-list'));assert.equal(graphics,1);assert.equal(hovered.at(-1),'outside-list');\n  const members=Array.from({length:6},(_,i)=>place('choice-'+i));assert(owner.openExternalChoices(members));assert.equal(owner.stats.externalChoices,6);assert.equal(owner.stats.rendered,0);assert.equal(queries,0);assert.equal(view.popup.title,'Nearby places');\n  let list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);list.children[0].onclick();assert.equal(owner.selection.place.id,'choice-4');assert.equal(graphics,2);\n  owner.controller.host.visible(false);owner.setExternalHover(place('map-only'));assert.equal(hovered.at(-1),'map-only');assert.equal(graphics,2);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:tile:'));assert(owner.open([],target));list=view.popup.content.children[2];list.children[1].onclick();assert.equal(owner.selection.place.id,'choice-5');assert.equal(graphics,2);\n  assert(!owner.openExternalChoices(Array.from({length:33},(_,i)=>place('x'+i))));assert.equal(owner.stats.externalChoices,6);\n  owner.clear();assert.equal(owner.stats.externalChoices,0);\n }finally{owner.dispose();assert.equal(layers.length,0);global.document=savedDocument;global.window=savedWindow}\n});\nconst hoverStart=widget.indexOf('          let place = this._places?.hit(hit.results);'),hoverEnd=widget.indexOf('          if (place && !hoverController.signal.aborted)',hoverStart);\nassert(hoverStart>=0&&hoverEnd>hoverStart);\nconst hoverCompiled=ts.transpileModule('return async () => {'+widget.slice(hoverStart,hoverEnd)+'; return { place, nativeNearbyCount }; }',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\n",
              "after": " const owner=new ArcGISPlaces({externalSelection:true,id:'hover',url:'',view:()=>view,externalMapVisible:()=>true,modules:{Graphic,GraphicsLayer:Layer,Point:Value},geographic:x=>x,busy:()=>false,status(){},hovered:id=>hovered.push(id),explore:async()=>{queries++;return[]},openImagery(){}});\n const place=id=>({id,name:'Place '+id,category:'cafe',group:'other',confidence:null,lon:-86.13,lat:39.775,address:'',website:'',release:'2026-10-21.0'});\n try{\n  owner.display([place('loaded-1'),place('loaded-2')],view);owner.setHover('loaded-1');for(let i=0;i<30;i++)owner.setHover('loaded-1');\n  assert.equal(graphics,1);assert.equal(owner.stats.hoverGraphics,1);assert.deepEqual(hovered,['loaded-1']);owner.setHover('loaded-2');assert.equal(graphics,1);assert.equal(hovered.at(-1),'loaded-2');\n  owner.setHover(null);owner.setExternalHover(place('outside-list'));assert.equal(graphics,1);assert.equal(hovered.at(-1),'outside-list');\n  const members=Array.from({length:6},(_,i)=>place('choice-'+i));assert(owner.openExternalChoices(members));assert.equal(owner.stats.externalChoices,6);assert.equal(owner.stats.rendered,0);assert.equal(queries,0);assert.equal(view.popup.title,'Nearby places');\n  let list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);list.children[0].onclick();assert.equal(owner.selection.place.id,'choice-4');assert.equal(graphics,2);\n  owner.setExternalHover(place('stale-preview'));owner.display([place('new-page')],view);assert.equal(owner.selection.place.id,'choice-4');assert.equal(owner.nativeHover.stats.visible,false);assert.equal(hovered.at(-1),null);\n  owner.controller.host.visible(false);owner.setExternalHover(place('map-only'));assert.equal(hovered.at(-1),'map-only');assert.equal(graphics,2);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:tile:'));assert(owner.open([],target));list=view.popup.content.children[2];list.children[1].onclick();assert.equal(owner.selection.place.id,'choice-5');assert.equal(graphics,2);\n  assert(!owner.openExternalChoices(Array.from({length:33},(_,i)=>place('x'+i))));assert.equal(owner.stats.externalChoices,6);\n  owner.clear();assert.equal(owner.stats.externalChoices,0);\n }finally{owner.dispose();assert.equal(layers.length,0);global.document=savedDocument;global.window=savedWindow}\n});\nconst hoverStart=widget.indexOf('          let place = this._places?.hit(hit.results);'),hoverEnd=widget.indexOf('          if (place && !hoverController.signal.aborted)',hoverStart);\nassert(hoverStart>=0&&hoverEnd>hoverStart);\nconst hoverCompiled=ts.transpileModule('return async () => {'+widget.slice(hoverStart,hoverEnd)+'; return { place, nativeNearbyCount }; }',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\n"
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
              "before": "  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n  \"uiPoiCollapsePanel\": \"Collapse Places panel\",\n  \"uiPoiExpandPanel\": \"Expand Places panel\",\n  \"uiPoiMinimizePanel\": \"Minimize Places panel\",\n  \"uiPoiRestorePanel\": \"Restore Places panel\",\n  \"uiPoiRestoreCount\": \"Places · {count}\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n",
              "after": "  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n  \"uiPoiCollapsePanel\": \"Collapse Places panel\",\n  \"uiPoiExpandPanel\": \"Expand Places panel\",\n  \"uiPoiMinimizePanel\": \"Minimize Places panel\",\n  \"uiPoiRestorePanel\": \"Restore Places panel\",\n  \"uiPoiRestoreCount\": \"Places · {count}\",\n  \"uiPoiSelectedNotInPage\": \"The selected place is outside this results page or search. Its details remain available.\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n"
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
              "before": "\"runtime\",\"uiPoiClearShort\",\"Clear\",\"Clear\",\"مسح\",\"Temizle\",\"Limpiar\",\"Effacer\",\"Aufheben\",\"Limpar\",\"Deseleziona\",\"解除\",\"해제\",\"清除\",\"清除\"\n\"runtime\",\"uiPoiBooksMusicVideo\",\"Books, music & video\",\"Books, music & video\",\"الكتب والموسيقى والفيديو\",\"Kitap, müzik ve video\",\"Libros, música y vídeo\",\"Livres, musique et vidéo\",\"Bücher, Musik und Video\",\"Livros, música e vídeo\",\"Libri, musica e video\",\"書籍・音楽・映像\",\"도서, 음악 및 비디오\",\"图书、音乐与视频\",\"書籍、音樂與影片\"\n\"runtime\",\"uiPoiBookshop\",\"Bookshop\",\"Bookshop\",\"مكتبة لبيع الكتب\",\"Kitapçı\",\"Librería\",\"Librairie\",\"Buchhandlung\",\"Livraria\",\"Libreria\",\"書店\",\"서점\",\"书店\",\"書店\"\n\"runtime\",\"uiPoiCollapsePanel\",\"Collapse Places panel\",\"Collapse Places panel\",\"طي لوحة الأماكن\",\"Yerler panelini daralt\",\"Contraer panel de lugares\",\"Réduire le panneau des lieux\",\"Orte-Bereich einklappen\",\"Recolher painel de locais\",\"Comprimi pannello dei luoghi\",\"場所パネルを折りたたむ\",\"장소 패널 접기\",\"折叠地点面板\",\"摺疊地點面板\"\n\"runtime\",\"uiPoiExpandPanel\",\"Expand Places panel\",\"Expand Places panel\",\"توسيع لوحة الأماكن\",\"Yerler panelini genişlet\",\"Expandir panel de lugares\",\"Développer le panneau des lieux\",\"Orte-Bereich ausklappen\",\"Expandir painel de locais\",\"Espandi pannello dei luoghi\",\"場所パネルを展開\",\"장소 패널 펼치기\",\"展开地点面板\",\"展開地點面板\"\n\"runtime\",\"uiPoiMinimizePanel\",\"Minimize Places panel\",\"Minimize Places panel\",\"تصغير لوحة الأماكن\",\"Yerler panelini küçült\",\"Minimizar panel de lugares\",\"Réduire le panneau des lieux\",\"Orte-Bereich minimieren\",\"Minimizar painel de locais\",\"Riduci pannello dei luoghi\",\"場所パネルを最小化\",\"장소 패널 최소화\",\"最小化地点面板\",\"最小化地點面板\"\n\"runtime\",\"uiPoiRestorePanel\",\"Restore Places panel\",\"Restore Places panel\",\"استعادة لوحة الأماكن\",\"Yerler panelini geri aç\",\"Restaurar panel de lugares\",\"Rétablir le panneau des lieux\",\"Orte-Bereich wiederherstellen\",\"Restaurar painel de locais\",\"Ripristina pannello dei luoghi\",\"場所パネルを復元\",\"장소 패널 복원\",\"还原地点面板\",\"還原地點面板\"\n\"runtime\",\"uiPoiRestoreCount\",\"Places · {count}\",\"Places · {count}\",\"الأماكن · {count}\",\"Yerler · {count}\",\"Lugares · {count}\",\"Lieux · {count}\",\"Orte · {count}\",\"Locais · {count}\",\"Luoghi · {count}\",\"場所 · {count}\",\"장소 · {count}\",\"地点 · {count}\",\"地點 · {count}\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n",
              "after": "\"runtime\",\"uiPoiClearShort\",\"Clear\",\"Clear\",\"مسح\",\"Temizle\",\"Limpiar\",\"Effacer\",\"Aufheben\",\"Limpar\",\"Deseleziona\",\"解除\",\"해제\",\"清除\",\"清除\"\n\"runtime\",\"uiPoiBooksMusicVideo\",\"Books, music & video\",\"Books, music & video\",\"الكتب والموسيقى والفيديو\",\"Kitap, müzik ve video\",\"Libros, música y vídeo\",\"Livres, musique et vidéo\",\"Bücher, Musik und Video\",\"Livros, música e vídeo\",\"Libri, musica e video\",\"書籍・音楽・映像\",\"도서, 음악 및 비디오\",\"图书、音乐与视频\",\"書籍、音樂與影片\"\n\"runtime\",\"uiPoiBookshop\",\"Bookshop\",\"Bookshop\",\"مكتبة لبيع الكتب\",\"Kitapçı\",\"Librería\",\"Librairie\",\"Buchhandlung\",\"Livraria\",\"Libreria\",\"書店\",\"서점\",\"书店\",\"書店\"\n\"runtime\",\"uiPoiCollapsePanel\",\"Collapse Places panel\",\"Collapse Places panel\",\"طي لوحة الأماكن\",\"Yerler panelini daralt\",\"Contraer panel de lugares\",\"Réduire le panneau des lieux\",\"Orte-Bereich einklappen\",\"Recolher painel de locais\",\"Comprimi pannello dei luoghi\",\"場所パネルを折りたたむ\",\"장소 패널 접기\",\"折叠地点面板\",\"摺疊地點面板\"\n\"runtime\",\"uiPoiExpandPanel\",\"Expand Places panel\",\"Expand Places panel\",\"توسيع لوحة الأماكن\",\"Yerler panelini genişlet\",\"Expandir panel de lugares\",\"Développer le panneau des lieux\",\"Orte-Bereich ausklappen\",\"Expandir painel de locais\",\"Espandi pannello dei luoghi\",\"場所パネルを展開\",\"장소 패널 펼치기\",\"展开地点面板\",\"展開地點面板\"\n\"runtime\",\"uiPoiMinimizePanel\",\"Minimize Places panel\",\"Minimize Places panel\",\"تصغير لوحة الأماكن\",\"Yerler panelini küçült\",\"Minimizar panel de lugares\",\"Réduire le panneau des lieux\",\"Orte-Bereich minimieren\",\"Minimizar painel de locais\",\"Riduci pannello dei luoghi\",\"場所パネルを最小化\",\"장소 패널 최소화\",\"最小化地点面板\",\"最小化地點面板\"\n\"runtime\",\"uiPoiRestorePanel\",\"Restore Places panel\",\"Restore Places panel\",\"استعادة لوحة الأماكن\",\"Yerler panelini geri aç\",\"Restaurar panel de lugares\",\"Rétablir le panneau des lieux\",\"Orte-Bereich wiederherstellen\",\"Restaurar painel de locais\",\"Ripristina pannello dei luoghi\",\"場所パネルを復元\",\"장소 패널 복원\",\"还原地点面板\",\"還原地點面板\"\n\"runtime\",\"uiPoiRestoreCount\",\"Places · {count}\",\"Places · {count}\",\"الأماكن · {count}\",\"Yerler · {count}\",\"Lugares · {count}\",\"Lieux · {count}\",\"Orte · {count}\",\"Locais · {count}\",\"Luoghi · {count}\",\"場所 · {count}\",\"장소 · {count}\",\"地点 · {count}\",\"地點 · {count}\"\n\"runtime\",\"uiPoiSelectedNotInPage\",\"The selected place is outside this results page or search. Its details remain available.\",\"The selected place is outside this results page or search. Its details remain available.\",\"المكان المحدد غير موجود في صفحة النتائج أو البحث الحالي. تبقى تفاصيله متاحة.\",\"Seçili yer bu sonuç sayfasında veya aramada değil. Ayrıntıları erişilebilir durumda.\",\"El lugar seleccionado no está en esta página de resultados o búsqueda. Sus detalles siguen disponibles.\",\"Le lieu sélectionné ne figure pas sur cette page de résultats ou dans cette recherche. Ses détails restent disponibles.\",\"Der ausgewählte Ort gehört nicht zu dieser Ergebnisseite oder Suche. Seine Details bleiben verfügbar.\",\"O local selecionado está fora desta página de resultados ou pesquisa. Os detalhes continuam disponíveis.\",\"Il luogo selezionato non è in questa pagina di risultati o ricerca. I dettagli restano disponibili.\",\"選択した場所は現在の結果ページまたは検索に含まれていません。詳細は引き続き確認できます。\",\"선택한 장소가 현재 결과 페이지 또는 검색에 포함되어 있지 않습니다. 상세 정보는 계속 볼 수 있습니다.\",\"所选地点不在当前结果页或搜索中。仍可查看其详情。\",\"所選地點不在目前的結果頁或搜尋中。仍可查看其詳細資料。\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n"
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
              "before": "  \"uiPoiClearShort\": \"مسح\",\n  \"uiPoiBooksMusicVideo\": \"الكتب والموسيقى والفيديو\",\n  \"uiPoiBookshop\": \"مكتبة لبيع الكتب\",\n  \"uiPoiCollapsePanel\": \"طي لوحة الأماكن\",\n  \"uiPoiExpandPanel\": \"توسيع لوحة الأماكن\",\n  \"uiPoiMinimizePanel\": \"تصغير لوحة الأماكن\",\n  \"uiPoiRestorePanel\": \"استعادة لوحة الأماكن\",\n  \"uiPoiRestoreCount\": \"الأماكن · {count}\",\n};\nexport default ar;\n",
              "after": "  \"uiPoiClearShort\": \"مسح\",\n  \"uiPoiBooksMusicVideo\": \"الكتب والموسيقى والفيديو\",\n  \"uiPoiBookshop\": \"مكتبة لبيع الكتب\",\n  \"uiPoiCollapsePanel\": \"طي لوحة الأماكن\",\n  \"uiPoiExpandPanel\": \"توسيع لوحة الأماكن\",\n  \"uiPoiMinimizePanel\": \"تصغير لوحة الأماكن\",\n  \"uiPoiRestorePanel\": \"استعادة لوحة الأماكن\",\n  \"uiPoiRestoreCount\": \"الأماكن · {count}\",\n  \"uiPoiSelectedNotInPage\": \"المكان المحدد غير موجود في صفحة النتائج أو البحث الحالي. تبقى تفاصيله متاحة.\",\n};\nexport default ar;\n"
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
              "before": "  \"uiPoiClearShort\": \"Aufheben\",\n  \"uiPoiBooksMusicVideo\": \"Bücher, Musik und Video\",\n  \"uiPoiBookshop\": \"Buchhandlung\",\n  \"uiPoiCollapsePanel\": \"Orte-Bereich einklappen\",\n  \"uiPoiExpandPanel\": \"Orte-Bereich ausklappen\",\n  \"uiPoiMinimizePanel\": \"Orte-Bereich minimieren\",\n  \"uiPoiRestorePanel\": \"Orte-Bereich wiederherstellen\",\n  \"uiPoiRestoreCount\": \"Orte · {count}\",\n};\nexport default de;\n",
              "after": "  \"uiPoiClearShort\": \"Aufheben\",\n  \"uiPoiBooksMusicVideo\": \"Bücher, Musik und Video\",\n  \"uiPoiBookshop\": \"Buchhandlung\",\n  \"uiPoiCollapsePanel\": \"Orte-Bereich einklappen\",\n  \"uiPoiExpandPanel\": \"Orte-Bereich ausklappen\",\n  \"uiPoiMinimizePanel\": \"Orte-Bereich minimieren\",\n  \"uiPoiRestorePanel\": \"Orte-Bereich wiederherstellen\",\n  \"uiPoiRestoreCount\": \"Orte · {count}\",\n  \"uiPoiSelectedNotInPage\": \"Der ausgewählte Ort gehört nicht zu dieser Ergebnisseite oder Suche. Seine Details bleiben verfügbar.\",\n};\nexport default de;\n"
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
              "before": "  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n  \"uiPoiCollapsePanel\": \"Collapse Places panel\",\n  \"uiPoiExpandPanel\": \"Expand Places panel\",\n  \"uiPoiMinimizePanel\": \"Minimize Places panel\",\n  \"uiPoiRestorePanel\": \"Restore Places panel\",\n  \"uiPoiRestoreCount\": \"Places · {count}\",\n};\nexport default overrides;\n",
              "after": "  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n  \"uiPoiCollapsePanel\": \"Collapse Places panel\",\n  \"uiPoiExpandPanel\": \"Expand Places panel\",\n  \"uiPoiMinimizePanel\": \"Minimize Places panel\",\n  \"uiPoiRestorePanel\": \"Restore Places panel\",\n  \"uiPoiRestoreCount\": \"Places · {count}\",\n  \"uiPoiSelectedNotInPage\": \"The selected place is outside this results page or search. Its details remain available.\",\n};\nexport default overrides;\n"
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
              "before": "  \"uiPoiClearShort\": \"Limpiar\",\n  \"uiPoiBooksMusicVideo\": \"Libros, música y vídeo\",\n  \"uiPoiBookshop\": \"Librería\",\n  \"uiPoiCollapsePanel\": \"Contraer panel de lugares\",\n  \"uiPoiExpandPanel\": \"Expandir panel de lugares\",\n  \"uiPoiMinimizePanel\": \"Minimizar panel de lugares\",\n  \"uiPoiRestorePanel\": \"Restaurar panel de lugares\",\n  \"uiPoiRestoreCount\": \"Lugares · {count}\",\n};\nexport default es;\n",
              "after": "  \"uiPoiClearShort\": \"Limpiar\",\n  \"uiPoiBooksMusicVideo\": \"Libros, música y vídeo\",\n  \"uiPoiBookshop\": \"Librería\",\n  \"uiPoiCollapsePanel\": \"Contraer panel de lugares\",\n  \"uiPoiExpandPanel\": \"Expandir panel de lugares\",\n  \"uiPoiMinimizePanel\": \"Minimizar panel de lugares\",\n  \"uiPoiRestorePanel\": \"Restaurar panel de lugares\",\n  \"uiPoiRestoreCount\": \"Lugares · {count}\",\n  \"uiPoiSelectedNotInPage\": \"El lugar seleccionado no está en esta página de resultados o búsqueda. Sus detalles siguen disponibles.\",\n};\nexport default es;\n"
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
              "before": "  \"uiPoiClearShort\": \"Effacer\",\n  \"uiPoiBooksMusicVideo\": \"Livres, musique et vidéo\",\n  \"uiPoiBookshop\": \"Librairie\",\n  \"uiPoiCollapsePanel\": \"Réduire le panneau des lieux\",\n  \"uiPoiExpandPanel\": \"Développer le panneau des lieux\",\n  \"uiPoiMinimizePanel\": \"Réduire le panneau des lieux\",\n  \"uiPoiRestorePanel\": \"Rétablir le panneau des lieux\",\n  \"uiPoiRestoreCount\": \"Lieux · {count}\",\n};\nexport default fr;\n",
              "after": "  \"uiPoiClearShort\": \"Effacer\",\n  \"uiPoiBooksMusicVideo\": \"Livres, musique et vidéo\",\n  \"uiPoiBookshop\": \"Librairie\",\n  \"uiPoiCollapsePanel\": \"Réduire le panneau des lieux\",\n  \"uiPoiExpandPanel\": \"Développer le panneau des lieux\",\n  \"uiPoiMinimizePanel\": \"Réduire le panneau des lieux\",\n  \"uiPoiRestorePanel\": \"Rétablir le panneau des lieux\",\n  \"uiPoiRestoreCount\": \"Lieux · {count}\",\n  \"uiPoiSelectedNotInPage\": \"Le lieu sélectionné ne figure pas sur cette page de résultats ou dans cette recherche. Ses détails restent disponibles.\",\n};\nexport default fr;\n"
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
              "before": "  \"uiPoiClearShort\": \"Deseleziona\",\n  \"uiPoiBooksMusicVideo\": \"Libri, musica e video\",\n  \"uiPoiBookshop\": \"Libreria\",\n  \"uiPoiCollapsePanel\": \"Comprimi pannello dei luoghi\",\n  \"uiPoiExpandPanel\": \"Espandi pannello dei luoghi\",\n  \"uiPoiMinimizePanel\": \"Riduci pannello dei luoghi\",\n  \"uiPoiRestorePanel\": \"Ripristina pannello dei luoghi\",\n  \"uiPoiRestoreCount\": \"Luoghi · {count}\",\n};\nexport default it;\n",
              "after": "  \"uiPoiClearShort\": \"Deseleziona\",\n  \"uiPoiBooksMusicVideo\": \"Libri, musica e video\",\n  \"uiPoiBookshop\": \"Libreria\",\n  \"uiPoiCollapsePanel\": \"Comprimi pannello dei luoghi\",\n  \"uiPoiExpandPanel\": \"Espandi pannello dei luoghi\",\n  \"uiPoiMinimizePanel\": \"Riduci pannello dei luoghi\",\n  \"uiPoiRestorePanel\": \"Ripristina pannello dei luoghi\",\n  \"uiPoiRestoreCount\": \"Luoghi · {count}\",\n  \"uiPoiSelectedNotInPage\": \"Il luogo selezionato non è in questa pagina di risultati o ricerca. I dettagli restano disponibili.\",\n};\nexport default it;\n"
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
              "before": "  \"uiPoiClearShort\": \"解除\",\n  \"uiPoiBooksMusicVideo\": \"書籍・音楽・映像\",\n  \"uiPoiBookshop\": \"書店\",\n  \"uiPoiCollapsePanel\": \"場所パネルを折りたたむ\",\n  \"uiPoiExpandPanel\": \"場所パネルを展開\",\n  \"uiPoiMinimizePanel\": \"場所パネルを最小化\",\n  \"uiPoiRestorePanel\": \"場所パネルを復元\",\n  \"uiPoiRestoreCount\": \"場所 · {count}\",\n};\nexport default ja;\n",
              "after": "  \"uiPoiClearShort\": \"解除\",\n  \"uiPoiBooksMusicVideo\": \"書籍・音楽・映像\",\n  \"uiPoiBookshop\": \"書店\",\n  \"uiPoiCollapsePanel\": \"場所パネルを折りたたむ\",\n  \"uiPoiExpandPanel\": \"場所パネルを展開\",\n  \"uiPoiMinimizePanel\": \"場所パネルを最小化\",\n  \"uiPoiRestorePanel\": \"場所パネルを復元\",\n  \"uiPoiRestoreCount\": \"場所 · {count}\",\n  \"uiPoiSelectedNotInPage\": \"選択した場所は現在の結果ページまたは検索に含まれていません。詳細は引き続き確認できます。\",\n};\nexport default ja;\n"
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
              "before": "  \"uiPoiClearShort\": \"해제\",\n  \"uiPoiBooksMusicVideo\": \"도서, 음악 및 비디오\",\n  \"uiPoiBookshop\": \"서점\",\n  \"uiPoiCollapsePanel\": \"장소 패널 접기\",\n  \"uiPoiExpandPanel\": \"장소 패널 펼치기\",\n  \"uiPoiMinimizePanel\": \"장소 패널 최소화\",\n  \"uiPoiRestorePanel\": \"장소 패널 복원\",\n  \"uiPoiRestoreCount\": \"장소 · {count}\",\n};\nexport default ko;\n",
              "after": "  \"uiPoiClearShort\": \"해제\",\n  \"uiPoiBooksMusicVideo\": \"도서, 음악 및 비디오\",\n  \"uiPoiBookshop\": \"서점\",\n  \"uiPoiCollapsePanel\": \"장소 패널 접기\",\n  \"uiPoiExpandPanel\": \"장소 패널 펼치기\",\n  \"uiPoiMinimizePanel\": \"장소 패널 최소화\",\n  \"uiPoiRestorePanel\": \"장소 패널 복원\",\n  \"uiPoiRestoreCount\": \"장소 · {count}\",\n  \"uiPoiSelectedNotInPage\": \"선택한 장소가 현재 결과 페이지 또는 검색에 포함되어 있지 않습니다. 상세 정보는 계속 볼 수 있습니다.\",\n};\nexport default ko;\n"
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
              "before": "  \"uiPoiClearShort\": \"Limpar\",\n  \"uiPoiBooksMusicVideo\": \"Livros, música e vídeo\",\n  \"uiPoiBookshop\": \"Livraria\",\n  \"uiPoiCollapsePanel\": \"Recolher painel de locais\",\n  \"uiPoiExpandPanel\": \"Expandir painel de locais\",\n  \"uiPoiMinimizePanel\": \"Minimizar painel de locais\",\n  \"uiPoiRestorePanel\": \"Restaurar painel de locais\",\n  \"uiPoiRestoreCount\": \"Locais · {count}\",\n};\nexport default ptBR;\n",
              "after": "  \"uiPoiClearShort\": \"Limpar\",\n  \"uiPoiBooksMusicVideo\": \"Livros, música e vídeo\",\n  \"uiPoiBookshop\": \"Livraria\",\n  \"uiPoiCollapsePanel\": \"Recolher painel de locais\",\n  \"uiPoiExpandPanel\": \"Expandir painel de locais\",\n  \"uiPoiMinimizePanel\": \"Minimizar painel de locais\",\n  \"uiPoiRestorePanel\": \"Restaurar painel de locais\",\n  \"uiPoiRestoreCount\": \"Locais · {count}\",\n  \"uiPoiSelectedNotInPage\": \"O local selecionado está fora desta página de resultados ou pesquisa. Os detalhes continuam disponíveis.\",\n};\nexport default ptBR;\n"
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
              "before": "  \"uiPoiClearShort\": \"Temizle\",\n  \"uiPoiBooksMusicVideo\": \"Kitap, müzik ve video\",\n  \"uiPoiBookshop\": \"Kitapçı\",\n  \"uiPoiCollapsePanel\": \"Yerler panelini daralt\",\n  \"uiPoiExpandPanel\": \"Yerler panelini genişlet\",\n  \"uiPoiMinimizePanel\": \"Yerler panelini küçült\",\n  \"uiPoiRestorePanel\": \"Yerler panelini geri aç\",\n  \"uiPoiRestoreCount\": \"Yerler · {count}\",\n};\nexport default tr;\n",
              "after": "  \"uiPoiClearShort\": \"Temizle\",\n  \"uiPoiBooksMusicVideo\": \"Kitap, müzik ve video\",\n  \"uiPoiBookshop\": \"Kitapçı\",\n  \"uiPoiCollapsePanel\": \"Yerler panelini daralt\",\n  \"uiPoiExpandPanel\": \"Yerler panelini genişlet\",\n  \"uiPoiMinimizePanel\": \"Yerler panelini küçült\",\n  \"uiPoiRestorePanel\": \"Yerler panelini geri aç\",\n  \"uiPoiRestoreCount\": \"Yerler · {count}\",\n  \"uiPoiSelectedNotInPage\": \"Seçili yer bu sonuç sayfasında veya aramada değil. Ayrıntıları erişilebilir durumda.\",\n};\nexport default tr;\n"
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
              "before": "  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"图书、音乐与视频\",\n  \"uiPoiBookshop\": \"书店\",\n  \"uiPoiCollapsePanel\": \"折叠地点面板\",\n  \"uiPoiExpandPanel\": \"展开地点面板\",\n  \"uiPoiMinimizePanel\": \"最小化地点面板\",\n  \"uiPoiRestorePanel\": \"还原地点面板\",\n  \"uiPoiRestoreCount\": \"地点 · {count}\",\n};\nexport default zhCN;\n",
              "after": "  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"图书、音乐与视频\",\n  \"uiPoiBookshop\": \"书店\",\n  \"uiPoiCollapsePanel\": \"折叠地点面板\",\n  \"uiPoiExpandPanel\": \"展开地点面板\",\n  \"uiPoiMinimizePanel\": \"最小化地点面板\",\n  \"uiPoiRestorePanel\": \"还原地点面板\",\n  \"uiPoiRestoreCount\": \"地点 · {count}\",\n  \"uiPoiSelectedNotInPage\": \"所选地点不在当前结果页或搜索中。仍可查看其详情。\",\n};\nexport default zhCN;\n"
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
              "before": "  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"書籍、音樂與影片\",\n  \"uiPoiBookshop\": \"書店\",\n  \"uiPoiCollapsePanel\": \"摺疊地點面板\",\n  \"uiPoiExpandPanel\": \"展開地點面板\",\n  \"uiPoiMinimizePanel\": \"最小化地點面板\",\n  \"uiPoiRestorePanel\": \"還原地點面板\",\n  \"uiPoiRestoreCount\": \"地點 · {count}\",\n};\nexport default zhTW;\n",
              "after": "  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"書籍、音樂與影片\",\n  \"uiPoiBookshop\": \"書店\",\n  \"uiPoiCollapsePanel\": \"摺疊地點面板\",\n  \"uiPoiExpandPanel\": \"展開地點面板\",\n  \"uiPoiMinimizePanel\": \"最小化地點面板\",\n  \"uiPoiRestorePanel\": \"還原地點面板\",\n  \"uiPoiRestoreCount\": \"地點 · {count}\",\n  \"uiPoiSelectedNotInPage\": \"所選地點不在目前的結果頁或搜尋中。仍可查看其詳細資料。\",\n};\nexport default zhTW;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/overturePlaces.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/overturePlaces.test.cjs 1",
              "before": "test('imagery choice labels preserve uncertain directions and compact existing metadata',()=>{\n for(const [direction,label] of [['facing','Facing the place'],['panorama','Panorama'],['sideways','Side view'],['away','Facing away'],['unknown','Direction unknown'],[undefined,'Direction unknown']]) assert.equal(nearby.placeImageryDirectionLabel({direction}),label);\n assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'About 33 m away · Capture date unknown');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^About 0 m away · Captured .*2024$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Distance unknown · Capture date unknown');\n});\n\ntest('Back to place centers either map mode without touching imagery or selection',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToSelectedPlace').getText(sf);const Runtime=new Function(compile('class Runtime{'+member+'}\\nreturn Runtime;'))();\n for(const type of ['2d','3d']) {\n  const w=new Runtime(),place={id:'poi',lon:-86.13,lat:39.78},view={ready:true,destroyed:false,type,zoom:13};let calls=0;\n  w.state=Object.freeze({placesActive:true,selectedPlace:place,jimuMapView:{view}});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};\n  w.setState=()=>{throw Error('must retain state')};w.openPlaceImagery=()=>{throw Error('must not navigate imagery')};\n  w.navigateMapView=(actual,target,options)=>{calls++;assert.equal(actual,view);assert.equal(target.center.longitude,place.lon);assert.equal(target.center.latitude,place.lat);assert.equal(target.center.spatialReference.wkid,4326);assert.equal(target.zoom,Math.max(Number.isFinite(view.zoom)?view.zoom:16,16));assert.equal(options.animate,false)};\n  w.goToSelectedPlace();view.zoom=19;w.goToSelectedPlace();view.zoom=NaN;w.goToSelectedPlace();assert.equal(calls,3);assert.equal(w.state.selectedPlace,place);\n  view.destroyed=true;w.goToSelectedPlace();view.destroyed=false;view.ready=false;w.goToSelectedPlace();view.ready=true;\n  w.state={...w.state,placesActive:false};w.goToSelectedPlace();w.state={...w.state,placesActive:true,selectedPlace:null};w.goToSelectedPlace();w.state={...w.state,selectedPlace:{lon:Infinity,lat:0}};w.goToSelectedPlace();assert.equal(calls,3);\n }\n});\ntest('POI hover reuses one SDK hit test and keeps its label when coverage resolves earlier or later',async()=>{\n let callback;function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='view.on'&&n.arguments[0]?.text==='pointer-move')callback=n.arguments[1];ts.forEachChild(n,visit);}visit(sf);assert(callback);\n for(const late of [false,true]){\n",
              "after": "test('imagery choice labels preserve uncertain directions and compact existing metadata',()=>{\n for(const [direction,label] of [['facing','Facing the place'],['panorama','Panorama'],['sideways','Side view'],['away','Facing away'],['unknown','Direction unknown'],[undefined,'Direction unknown']]) assert.equal(nearby.placeImageryDirectionLabel({direction}),label);\n assert.equal(nearby.placeImageryChoiceMeta({distance:32.2}),'About 33 m away · Capture date unknown');\n assert.match(nearby.placeImageryChoiceMeta({distance:0,capturedAt:1704067200000}),/^About 0 m away · Captured .*2024$/);\n assert.equal(nearby.placeImageryChoiceMeta({distance:NaN}),'Distance unknown · Capture date unknown');\n});\n\ntest('Back to place centers either map mode without touching imagery or selection',()=>{\n const member=['goToSelectedPlace','centerPlaceOnMap'].map(name=>widget.members.find(m=>m.name?.getText(sf)===name).getText(sf)).join('\\n');const Runtime=new Function(compile('class Runtime{'+member+'}\\nreturn Runtime;'))();\n for(const type of ['2d','3d']) {\n  const w=new Runtime(),place={id:'poi',lon:-86.13,lat:39.78},view={ready:true,destroyed:false,type,zoom:13};let calls=0;\n  w.state=Object.freeze({placesActive:true,selectedPlace:place,jimuMapView:{view}});w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};\n  w.setState=()=>{throw Error('must retain state')};w.openPlaceImagery=()=>{throw Error('must not navigate imagery')};\n  w.navigateMapView=(actual,target,options)=>{calls++;assert.equal(actual,view);assert.equal(target.target.longitude,place.lon);assert.equal(target.target.latitude,place.lat);assert.equal(target.target.spatialReference.wkid,4326);assert.equal(target.zoom,Math.max(Number.isFinite(view.zoom)?view.zoom:16,16));assert.equal(options.animate,false)};\n  w.goToSelectedPlace();view.zoom=19;w.goToSelectedPlace();view.zoom=NaN;w.goToSelectedPlace();assert.equal(calls,3);assert.equal(w.state.selectedPlace,place);\n  view.destroyed=true;w.goToSelectedPlace();view.destroyed=false;view.ready=false;w.goToSelectedPlace();view.ready=true;\n  w.state={...w.state,placesActive:false};w.goToSelectedPlace();w.state={...w.state,placesActive:true,selectedPlace:null};w.goToSelectedPlace();w.state={...w.state,selectedPlace:{lon:Infinity,lat:0}};w.goToSelectedPlace();assert.equal(calls,3);\n }\n});\ntest('POI hover reuses one SDK hit test and keeps its label when coverage resolves earlier or later',async()=>{\n let callback;function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='view.on'&&n.arguments[0]?.text==='pointer-move')callback=n.arguments[1];ts.forEachChild(n,visit);}visit(sf);assert(callback);\n for(const late of [false,true]){\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/placesSelectionReveal.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst root=path.join(__dirname,'../src');\nfunction fixture(){\n let index=0,dirty=false;const slots=[],pending=[],scrolls=[],jsx=(type,props,...children)=>({type,props:props||{},children}),cache=new Map();\n const React={useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return[slots[i],value=>{const next=typeof value==='function'?value(slots[i]):value;if(next!==slots[i]){slots[i]=next;dirty=true}}]},useRef(initial){const i=index++;return slots[i]||(slots[i]={current:initial})},useMemo:fn=>fn(),useEffect(fn,deps){const i=index++;if(!slots[i]||deps.some((v,n)=>v!==slots[i][n])){slots[i]=deps;pending.push(fn)}}};\n function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,id=>{\n if(id==='jimu-core')return{React,jsx};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>k,owned:s=>s,formatLocale:'en-US'})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=>''};if(id.endsWith('PresentationText'))return{englishPresentation:{text:s=>s}};\n return load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts')));\n });return m.exports;}\n const {LoadedPlacesList}=load('components/LoadedPlacesList.tsx');\n const places=Array.from({length:12},(_,i)=>({id:'p'+i,name:'Place '+String(11-i).padStart(2,'0'),category:'school',group:'education',lat:i*.001,lon:0}));\n const props={defaultOpen:true,compact:true,visible:true,places,origin:{lon:0,lat:0,kind:'map'},onSelect(){},onAreaSearch(){},onShowOnMap(){},searchText:'school'};\n function render(){let nodes;\n  for(let turns=0;turns<10;turns++){\n   index=0;dirty=false;const tree=LoadedPlacesList(props);nodes=[];\n   function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(tree);\n   const rowNodes=nodes.filter(n=>n.props['data-place-id']);for(const n of nodes)if(n.props.ref&&n.props.role==='group')n.props.ref.current={querySelectorAll:()=>rowNodes.map(row=>({dataset:{placeId:row.props['data-place-id']},scrollIntoView:()=>scrolls.push(row.props['data-place-id'])}))};\n   while(pending.length)pending.shift()();if(!dirty)return nodes;\n  }throw Error('Effects did not settle');\n }\n return{props,places,render,scrolls};\n}\nconst selected=nodes=>nodes.filter(n=>n.props['data-place-id']&&n.props['aria-pressed']);\ntest('map selection reveals its row even with an active area search, after result replacement and sorting',()=>{\n const h=fixture();h.props.selectedId='p9';h.props.revealRequest=1;let nodes=h.render();assert.equal(selected(nodes)[0].props['data-place-id'],'p9');assert(h.scrolls.includes('p9'));\n nodes.find(n=>n.type==='select').props.onChange({target:{value:'name'}});nodes=h.render();assert.equal(selected(nodes)[0].props['data-place-id'],'p9');\n h.props.places=[h.places[9]];nodes=h.render();assert.equal(selected(nodes).length,1);\n h.props.places=[h.places[0]];nodes=h.render();assert.equal(selected(nodes).length,0);\n});\ntest('minimized lists do not scroll the page or override manual paging on restore',()=>{\n const h=fixture();h.props.selectedId='p1';h.props.revealRequest=1;let nodes=h.render();h.props.visible=false;h.render();const initialScrolls=h.scrolls.length;h.props.visible=true;nodes=h.render();assert.equal(h.scrolls.length,initialScrolls);nodes.find(n=>n.props['aria-label']==='uiNextPlaces').props.onClick();nodes=h.render();assert.equal(selected(nodes).length,0);\n h.props.visible=false;h.render();const previous=h.scrolls.length;h.props.visible=true;nodes=h.render();assert.equal(selected(nodes).length,0);assert.equal(h.scrolls.length,previous);\n h.props.visible=false;h.props.selectedId='p9';h.props.revealRequest=2;h.render();assert.equal(h.scrolls.length,previous);h.props.visible=true;nodes=h.render();assert.equal(selected(nodes)[0].props['data-place-id'],'p9');assert.equal(h.scrolls.at(-1),'p9');\n});\ntest('Show on map is a separate row action and loading/failure suppress misleading empty messages',()=>{\n const h=fixture(),calls=[];h.props.onShowOnMap=id=>calls.push(id);let nodes=h.render();nodes.find(n=>n.props['aria-label']==='uiShowOnMap: Place 11').props.onClick();assert.deepEqual(calls,['p0']);\n h.props.places=[];h.props.loading=true;nodes=h.render();assert(!nodes.some(n=>n.type==='p'));assert(nodes.some(n=>n.props['aria-busy']===true));\n h.props.loading=false;h.props.failed=true;nodes=h.render();assert(!nodes.some(n=>n.type==='p'));h.props.failed=false;nodes=h.render();assert(nodes.some(n=>n.type==='p'));\n});\ntest('Show on map centers the clicked row instead of a stale asynchronous selection',()=>{\n const source=ts.createSourceFile('widget.tsx',fs.readFileSync(path.join(root,'runtime/widget.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const widget=source.statements.find(n=>ts.isClassDeclaration(n));\n const names=new Set(['goToSelectedPlace','showListedPlaceOnMap','centerPlaceOnMap']);const methods=widget.members.filter(n=>n.name&&names.has(n.name.getText(source))).map(n=>n.getText(source)).join('\\n');assert.equal(methods.includes('showListedPlaceOnMap'),true);\n const m={exports:{}};new Function('exports',ts.transpileModule('export class Fixture {\\n'+methods+'\\n}',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);\n const h=new m.exports.Fixture(),old={id:'old',lon:1,lat:1},clicked={id:'clicked',lon:2,lat:2},calls=[];h.state={placesActive:true,selectedPlace:old,placesList:[clicked],jimuMapView:{view:{ready:true,zoom:17}}};h.ArcGISModules={Point:class{constructor(p){Object.assign(this,p)}}};h._places={open:(_,id)=>{calls.push(id);return true}};h.navigateMapView=(view,target)=>calls.push(target);h.showListedPlaceOnMap('clicked');assert.equal(calls[0],'clicked');assert.equal(calls[1].target.longitude,2);assert.equal(calls[1].zoom,17);h.showListedPlaceOnMap('missing');assert.equal(calls.length,2);\n});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'overture-selection-feedback-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Places selection and feedback installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-selection-feedback' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Places selection and feedback installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Places selection and feedback installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Places selection and feedback installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-selection-feedback.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'Places selection and feedback is already uninstalled. No files changed.' : 'Places selection and feedback is already installed. No files changed.');
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
  const manifest = { installer: 'overture-selection-feedback', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places selection and feedback ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
