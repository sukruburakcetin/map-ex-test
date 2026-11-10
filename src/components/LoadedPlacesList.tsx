/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import type { Place } from '../features/places/placesModel';
import { placeCategoryIcon } from '../features/places/placeIcons';
import { filterLoadedPlaces, PLACE_LIST_PAGE_SIZE, placeListDistance } from '../features/places/placeListUtils';
import type { PlaceListOrigin } from '../features/places/placeListUtils';
export const LoadedPlacesList:React.FC<{visible?:boolean;loading?:boolean;failed?:boolean;onShowOnMap?(id:string):void;heading?:string;onAreaSearch?(text:string):void;searchText?:string;defaultOpen?:boolean;compact?:boolean;originIsSnapshot?:boolean;places:readonly Place[];selectedId?:string;hoveredId?:string|null;revealRequest?:number;origin?:PlaceListOrigin|null;onSelect(id:string):void;onHover?(id:string|null):void}> = props=>{
 const {t,formatLocale:locale,owned:text}=useWidgetLocale();
 const [open,setOpen]=React.useState(!!props.defaultOpen),[query,setQuery]=React.useState(props.searchText||''),[page,setPage]=React.useState(0),[sort,setSort]=React.useState<'distance'|'name'>('distance');
 const [held,setHeld]=React.useState<PlaceListOrigin|null|undefined>(undefined),rows=React.useRef<HTMLDivElement>(null),lastReveal=React.useRef(0),pendingReveal=React.useRef(false),wasVisible=React.useRef(props.visible!==false);
 const origin=held===undefined?props.origin:held;
 const matches=React.useMemo(()=>filterLoadedPlaces(props.places,props.onAreaSearch?'':query,sort==='distance'?origin:null),[props.places,query,!!props.onAreaSearch,sort,origin?.lon,origin?.lat]);
 const pages=Math.max(1,Math.ceil(matches.length/PLACE_LIST_PAGE_SIZE)),current=Math.min(page,pages-1);
 React.useEffect(()=>{setPage(0);},[props.places]);
 React.useEffect(()=>{
   const requested=!!props.revealRequest&&props.revealRequest!==lastReveal.current;lastReveal.current=props.revealRequest||0;
   if(!props.selectedId)return;
   if(requested){setOpen(true);if(!props.onAreaSearch)setQuery('');}
   const all=filterLoadedPlaces(props.places,props.onAreaSearch||requested?'':query,sort==='distance'?origin:null),index=all.findIndex(place=>place.id===props.selectedId);
   if(index>=0){setPage(Math.floor(index/PLACE_LIST_PAGE_SIZE));if(props.visible===false)pendingReveal.current=true;}
 },[props.revealRequest,props.selectedId,props.places,sort]);
 React.useEffect(()=>{
   const restoring=props.visible!==false&&!wasVisible.current;wasVisible.current=props.visible!==false;
   if(!props.selectedId||!open||props.visible===false||(!props.onAreaSearch&&query))return;
   if(restoring&&!pendingReveal.current)return;
   pendingReveal.current=false;
   const reveal=()=>{const row=Array.from(rows.current?.querySelectorAll<HTMLButtonElement>('[data-place-id]')||[]).find(node=>node.dataset.placeId===props.selectedId);row?.scrollIntoView({block:'nearest',inline:'nearest'});};
   // Run after the parent restores its saved scroll position; never scroll hidden rows.
   if(typeof requestAnimationFrame==='function'){const frame=requestAnimationFrame(reveal);return()=>cancelAnimationFrame(frame);}
   reveal();
 },[props.revealRequest,props.selectedId,props.places,open,current,query,sort,props.visible]);
 const distance=(place:Place)=>{if(!origin)return '';const metres=placeListDistance(place,origin);return metres<1000?`${new Intl.NumberFormat(locale).format(Math.round(metres))} m`:`${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(metres/1000)} km`;};
 const listOptions=(<div>
   {props.onAreaSearch&&<div style={{fontSize:9,opacity:.75,marginBottom:4}}>{t('uiPoiSearchAllAreaHint')}</div>}
   <label style={{display:'flex',gap:5,alignItems:'center',fontSize:10,color:'inherit',margin:'0 0 5px'}}>{text('Sort')}<select aria-label={text('Sort loaded places')} value={origin?sort:'name'} onChange={event=>{setSort(event.target.value as 'distance'|'name');setPage(0);}} style={{flex:1,minWidth:0,background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:5,fontSize:10,padding:3,minHeight:props.compact?30:undefined}}><option value="distance" disabled={!origin}>{text('Closest first')}</option><option value="name">{text('Name')}</option></select></label>
   {origin&&<div style={{fontSize:9,color:'#b5cfbc',marginBottom:4}}>{text(held!==undefined&&props.origin&&(held?.lon!==props.origin.lon||held?.lat!==props.origin.lat)?'Distances held while browsing':props.originIsSnapshot?origin.kind==='image'?'Distances from the image used for this search.':'Distances from the map center used for this search.':origin.kind==='image'?'Distances from viewed image':'Distances from map center')}</div>}
 </div>);
 return <div style={{borderTop:'1px solid #61846e55',paddingTop:6,marginBottom:props.compact?0:6}}>
  <button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} style={{width:'100%',display:'flex',justifyContent:'space-between',border:0,background:'none',color:'inherit',padding:'3px 0',minHeight:30,fontSize:11,cursor:'pointer'}}><span aria-live={props.heading?'polite':undefined}>{props.heading||`${t('uiBrowsePlaces')} ${props.places.length})`}</span><span aria-hidden="true">{open?'▴':'▾'}</span></button>
  {open&&<div>
   <form onSubmit={event=>{event.preventDefault();props.onAreaSearch?.(query);setPage(0);}} style={{display:'flex',gap:4,margin:'4px 0'}}>
    <input type="search" aria-label={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} placeholder={t(props.onAreaSearch?'uiPoiSearchAreaPlaces':'uiFindALoadedPlace')} value={query} maxLength={props.onAreaSearch?120:undefined} onChange={event=>{setQuery(event.target.value);setPage(0);}} style={{boxSizing:'border-box',width:'100%',minWidth:0,minHeight:30,padding:'3px 5px',border:'1px solid #72947d',borderRadius:4,background:'#213c2e',color:'inherit',fontSize:11}}/>
    {props.onAreaSearch&&<button type="submit" aria-label={t('uiPoiSearchAreaPlaces')} title={t('uiPoiSearchAreaPlaces')} style={compactPageButton}><span aria-hidden="true">⌕</span></button>}
    {props.onAreaSearch&&props.searchText&&<button type="button" aria-label={t('uiPoiClearAreaSearch')} title={t('uiPoiClearAreaSearch')} onClick={()=>{setQuery('');setPage(0);props.onAreaSearch?.('');}} style={compactPageButton}>×</button>}
   </form>
   {props.compact?<details style={{marginBottom:3,fontSize:10}}>
     <summary style={{cursor:'pointer',minHeight:26,padding:'4px 0',boxSizing:'border-box'}}>{text('Sort')} · {text(origin&&sort==='distance'?'Closest first':'Name')}</summary>
     {listOptions}
   </details>:listOptions}
   <div ref={rows} role="group" aria-busy={!!props.loading} aria-label={t('uiLoadedPlaces')} onPointerEnter={event=>{if(event.pointerType!=='touch')setHeld(props.origin||null);}} onPointerLeave={()=>{if(!rows.current?.contains(document.activeElement))setHeld(undefined);props.onHover?.(null);}} onFocusCapture={()=>setHeld(previous=>previous===undefined?props.origin||null:previous)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setHeld(undefined);props.onHover?.(null);}}}>
    {matches.slice(current*PLACE_LIST_PAGE_SIZE,(current+1)*PLACE_LIST_PAGE_SIZE).map(place=><div key={place.id} style={{display:'flex',alignItems:'stretch',gap:2,minWidth:0,borderBottom:'1px solid #61846e33',borderRadius:5,background:place.id===props.selectedId?'#496047':place.id===props.hoveredId?'#294d38':'transparent'}}><button type="button" data-place-id={place.id} aria-pressed={place.id===props.selectedId} title={place.name} onClick={()=>props.onSelect(place.id)} onPointerEnter={event=>{if(event.pointerType!=='touch')props.onHover?.(place.id);}} onPointerLeave={()=>props.onHover?.(null)} onFocus={()=>props.onHover?.(place.id)} style={{display:'flex',alignItems:'center',gap:6,width:'100%',flex:1,minWidth:0,minHeight:34,padding:'4px 3px',border:0,borderRadius:5,background:'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}><img src={placeCategoryIcon(place.group)} alt="" width={16} height={16} style={{flexShrink:0}}/><span style={{minWidth:0}}><span style={{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>{place.name}</span><span style={{display:'block',fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[distance(place),place.category.replace(/_/g,' ')].filter(Boolean).join(' · ')}</span></span></button>{props.onShowOnMap&&<button type="button" aria-label={`${t('uiShowOnMap')}: ${place.name}`} title={`${t('uiShowOnMap')}: ${place.name}`} onClick={()=>props.onShowOnMap?.(place.id)} onFocus={()=>props.onHover?.(place.id)} style={{...compactPageButton,alignSelf:'center',flex:'0 0 28px',width:28,height:28,minWidth:28,minHeight:28,marginInlineEnd:4,marginBlock:2,boxSizing:'border-box',padding:6,display:'grid',placeItems:'center',lineHeight:1,background:'transparent'}}><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{display:'block',width:14,height:14,minWidth:14,flexShrink:0}}><circle cx="12" cy="12" r="5"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></svg></button>}</div>)}
    {!matches.length&&!props.loading&&!props.failed&&<p style={{fontSize:10,lineHeight:1.4}}>{props.onAreaSearch&&props.searchText?t('uiPoiNoSearchMatches'):query?t('uiNoLoadedPlacesMatchThisSearch'):t('uiNoPlacesLoadedHereYet')}</p>}
   </div>
   {pages>1&&<div style={props.compact?{display:'grid',gridTemplateColumns:'30px minmax(0,1fr) 30px',alignItems:'center',gap:6,marginTop:6,paddingInline:4,boxSizing:'border-box',width:'100%',textAlign:'center',fontSize:10}:{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5,fontSize:10}}><button type="button" aria-label={t('uiPreviousPlaces')} style={props.compact?{...compactPageButton,opacity:current===0?.45:1,cursor:current===0?'default':'pointer'}:undefined} disabled={current===0} onClick={()=>setPage(current-1)}>‹</button><span>{current+1} / {pages}</span><button type="button" aria-label={t('uiNextPlaces')} style={props.compact?{...compactPageButton,opacity:current+1>=pages?.45:1,cursor:current+1>=pages?'default':'pointer'}:undefined} disabled={current+1>=pages} onClick={()=>setPage(current+1)}>›</button></div>}
   {!props.compact&&<p style={{margin:'5px 0 0',fontSize:9,opacity:.75}}>{t('uiLoadedMapResultsOnly')}</p>}
  </div>}
 </div>;
};

const compactPageButton={boxSizing:'border-box' as const,width:30,height:30,minHeight:30,minWidth:30,padding:4,display:'inline-grid',placeItems:'center',lineHeight:1.2,border:'1px solid #72947d',borderRadius:5,background:'#213c2e',color:'inherit',font:'inherit',cursor:'pointer'};
