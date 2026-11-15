/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { TILE_CATEGORIES } from '../features/places/tileCategories';
import type { MessageKey } from '../i18n/messages';
import { placeCategoryIcon } from '../features/places/placeIcons';
import { PlaceNoteActions } from '../features/places/PlaceNoteActions';
import type { DetectionPreviewLoader } from '../features/detections/detectionPreview';
import type { PlaceNoteOptions,PlaceNoteImageContext,PlaceNoteDestination } from '../features/places/placeNote';
import { placesWebsite } from '../features/places/placesModel';
import type { Place } from '../features/places/placesModel';
export interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; enterpriseEnabled?:boolean;onNote?(destination:PlaceNoteDestination,options?:PlaceNoteOptions):void;currentImageId?:string|null;onGetNoteImage?():Promise<PlaceNoteImageContext|null>;onLoadNotePreview?:DetectionPreviewLoader;notePhase?:'idle'|'capturing'|'picking';onCancelNote?():void;onImagery?():void;onBack?(): void; onLink(value: boolean): void; onDetails(): void; onClear(): void; }
/** Localized icon-family label, with precise book-shop labels for the shown source categories. */
export function selectedPlaceCategory(place:Place,t:(key:MessageKey)=>string):string {
  const category=place.category.trim().toLowerCase().replace(/[ -]+/g,'_');
  if(category==='books_music_and_video_store')return t('uiPoiBooksMusicVideo');
  if(['bookstore','book_store','book_shop'].includes(category))return t('uiPoiBookshop');
  return t(TILE_CATEGORIES.find(([id])=>id===place.group)?.[1]||'uiPoiOther');
}
const selectedAction:React.CSSProperties={width:'100%',minHeight:30,minWidth:0,boxSizing:'border-box',padding:'3px 6px',border:'1px solid #61846e',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',fontSize:11,lineHeight:1.3,cursor:'pointer'};
const selectedControlsCss=`
.mly-place-camera-check{appearance:none;box-sizing:border-box;flex-shrink:0;width:15px;height:15px;margin:0;border:1px solid #72947d;border-radius:3px;background:#213c2e;cursor:pointer;display:grid;place-content:center}
.mly-place-camera-check:checked{background:#38694b;border-color:#a9cdb2}
.mly-place-camera-check:checked::after{content:'';width:7px;height:4px;border-left:2px solid #e3eddf;border-bottom:2px solid #e3eddf;transform:rotate(-45deg) translateY(-1px)}
.mly-place-camera-check:focus-visible,.mly-place-center-action:focus-visible{outline:2px solid #b4d9bc;outline-offset:3px}
.mly-place-center-action{background:transparent}
.mly-place-center-action:hover{background:#284b38}
@media(forced-colors:active){.mly-place-camera-check{appearance:auto}.mly-place-camera-check:checked::after{display:none}}
`;
export const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => {
 const {t,owned}=useWidgetLocale(),category=selectedPlaceCategory(props.place,t);
 return <div style={{borderInlineStart:'3px solid #ffda74',padding:'4px 0',paddingInlineStart:7,minWidth:0}}>
  <style>{selectedControlsCss}</style>
  <div style={{display:'flex',gap:5,alignItems:'start',minWidth:0}}>
    <img src={placeCategoryIcon(props.place.group,true)} alt="" aria-hidden="true" width={18} height={18} style={{flexShrink:0,marginTop:3}}/>
    <button type="button" title={props.place.name} aria-label={`${t('uiOpenSelectedPlaceDetails')}: ${props.place.name}`} onClick={props.onDetails} style={{flex:1,minWidth:0,minHeight:30,maxHeight:'2.7em',padding:0,textAlign:'start',border:0,background:'none',color:'#f4ebd2',fontFamily:'inherit',fontWeight:600,fontSize:11,lineHeight:1.35,overflowWrap:'anywhere',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',cursor:'pointer'}}>{props.place.name}</button>
    <button className="mly-text-action" type="button" aria-label={t('uiClearSelectedPlace')} title={t('uiClearSelectedPlace')} onClick={props.onClear} style={{flexShrink:0,minHeight:30,padding:'2px 4px',border:'1px solid #61846e66',borderRadius:5,background:'transparent',color:'inherit',font:'inherit',fontSize:9,cursor:'pointer'}}>{t('uiPoiClearShort')}</button>
  </div>
  <div title={category} style={{fontSize:10,opacity:.8,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{category}</div>
  {props.cameraDistance&&<div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{fontSize:10,color:'#c0e5dc',marginTop:3,overflowWrap:'anywhere'}}>{owned(props.cameraDistance)}</div>}
  {props.onImagery&&<button className="mly-text-action" type="button" onClick={props.onImagery} style={{...selectedAction,marginTop:4}}>{owned('View nearby imagery')}</button>}
  {props.onNote&&<PlaceNoteActions place={props.place} currentImageId={props.currentImageId} onGetImage={props.onGetNoteImage} onLoadPreview={props.onLoadNotePreview} phase={props.notePhase} onCancel={props.onCancelNote} key={'place-note:'+props.place.id} enterpriseEnabled={!!props.enterpriseEnabled} onNote={props.onNote}/>}
  <details key={'place-details:'+props.place.id} style={{marginTop:4,fontSize:10}}>
    <summary style={{cursor:'pointer',minHeight:30,boxSizing:'border-box',padding:'6px 0'}}>{owned('Place details')}{props.link&&<span aria-hidden="true" style={{color:'#a9d6be',marginInlineStart:4}}>●</span>}</summary>
    <div style={{display:'grid',gap:5,paddingTop:3,overflowWrap:'anywhere'}}>
      <strong>{props.place.name}</strong>
      <span>{t('uiPlaceCategory')}: {props.place.category.replace(/_/g,' ')||category}</span>
      <div style={{display:'flex',gap:5,alignItems:'center',minWidth:0}}>
        <span style={{flex:1,minWidth:0}}>{props.place.address||owned('Address not supplied')}</span>
        {props.onBack&&<button type="button" className="mly-place-center-action" onClick={props.onBack} aria-label={t('uiBackToPlace')} title={t('uiCenterTheMapOnThisPlace')} style={{flex:'0 0 26px',width:26,height:26,boxSizing:'border-box',minWidth:26,minHeight:26,padding:4,display:'grid',placeContent:'center',border:0,borderRadius:5,color:'inherit',cursor:'pointer'}}><svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{display:'block',width:18,height:18,minWidth:18,flexShrink:0}}><circle cx="12" cy="12" r="5"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></svg></button>}
      </div>
      {!props.cameraDistance&&<span>{t('uiOpenImageDistance')}</span>}
      <label style={{display:'flex',alignItems:'center',gap:5,minHeight:30,fontSize:10,margin:0,cursor:'pointer'}}><input type="checkbox" className="mly-place-camera-check" checked={props.link} onChange={event=>props.onLink(event.target.checked)} style={{margin:0}}/>{t('uiShowCameraLink')}</label>
      {placesWebsite(props.place.website)?<a href={placesWebsite(props.place.website)} target="_blank" rel="noopener noreferrer" style={{color:'#b7dfc5'}}>{owned('Website')}</a>:<span>{owned('Website not supplied')}</span>}
      <span>{t('uiPoiConfidence')}: {typeof props.place.confidence==='number'&&Number.isFinite(props.place.confidence)?String(props.place.confidence):t('uiPoiNotProvided')}</span>
      <span>{t('uiPoiOperatingStatus')}: {props.place.operatingStatus==='open'?t('uiPoiOpen'):props.place.operatingStatus==='temporarily_closed'?t('uiPoiTemporarilyClosed'):props.place.operatingStatus==='permanently_closed'?t('uiPoiPermanentlyClosed'):props.place.operatingStatus||t('uiPoiNotProvided')}</span>
      <span>{owned('Overture ID')}: {props.place.id}</span><span>{owned('Data release')}: {props.place.release||owned('Not supplied')}</span>
      <a href="https://docs.overturemaps.org/attribution/" target="_blank" rel="noopener noreferrer" style={{color:'inherit'}}>{t('uiOverture')}</a>
    </div>
  </details>
 </div>;
};
export const placesScrollCss = `.mly-places-scroll { scrollbar-width: thin; scrollbar-color: rgba(139,179,153,.20) transparent; } .mly-places-scroll::-webkit-scrollbar { width: 4px; height: 4px; } .mly-places-scroll::-webkit-scrollbar-track { background: transparent; } .mly-places-scroll::-webkit-scrollbar-thumb { background: rgba(139,179,153,.20); border-radius: 5px; } .mly-places-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,179,153,.40); } @media (forced-colors: active) { .mly-places-scroll { scrollbar-color: auto; } }`;
export const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <section className="mly-places-scroll" aria-label={t('uiSelectedPlace')} style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', maxHeight:'calc(100% - 12px)',overflowY:'auto', overflowX:'hidden', overflowWrap:'anywhere', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><style>{placesScrollCss}</style><SelectedPlaceSummary {...props}/></section>; };

