/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import type { Place } from '../features/places/placesModel';
import { placeCategoryIcon } from '../features/places/placeIcons';
import { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';
import type { PlaceListOrigin } from '../features/places/placeListUtils';
export const LoadedPlacesList:React.FC<{onAreaSearch?(text:string):void;searchText?:string;defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{
 const {t,formatLocale:locale,owned:text}=useWidgetLocale();
 const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(props.searchText||''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');
 const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null);
 const origin=held===undefined?props.origin:held;
 const matches=React.useMemo(()=>filterLoadedPlaces(props.places,props.onAreaSearch?'':query,sort==='distance'?origin:null),[props.places,query,!!props.onAreaSearch,sort,origin?.lon,origin?.lat]);
 const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);
 React.useEffect(()=>{setPage(0);},[props.places]);
 React.useEffect(()=>{if(!props.revealRequest||!props.selectedId)return;setOpen(true);if(!props.onAreaSearch)setQuery('');const all=filterLoadedPlaces(props.places,'',sort==='distance'?origin:null);const index=all.findIndex(place=>place.id===props.selectedId);if(index>=0)setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));},[props.revealRequest]);
 React.useEffect(()=>{if(!props.revealRequest||!open||query)return;const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});},[props.revealRequest,open,current,query]);
 const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};
 return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:6}}>
  <button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span>{t('uiBrowsePlaces')} {props.places.length})</span><span aria-hidden="true">{open?'▴':'▾'}</span></button>
  {open&&<div>
   <form onSubmit={event=>{event.preventDefault();props.onAreaSearch?.(query);setPage(0);}} style={{display:'flex',gap:4,margin:'4px 0'}}>
    <input type="search" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>
    {props.onAreaSearch&&<button type="submit" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden="true">⌕</span></button>}
    {props.onAreaSearch&&props.searchText&&<button type="button" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}
   </form>
   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}
   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value="distance" disabled={!origin}>{text('Closest first')}</option><option value="name">{text('Name')}</option></select></label>
   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}
   <div ref={rows} role="group" aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>
    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><button type="button" key={place.id} data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',minHeight:34,padding:'4px 3px',border:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt="" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>)}
    {!matches.length&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}
   </div>
   {pages>1&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type="button" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type="button" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}
   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}
  </div>}
 </div>;
};

const compactPageButton={minHeight:30,minWidth:30,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};
