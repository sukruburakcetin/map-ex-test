/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import { placeCategoryIcon } from '../features/places/placeIcons';
import type { PlaceNoteDestination } from '../features/places/placeNote';
import { placesWebsite } from '../features/places/placesModel';
import type { Place } from '../features/places/placesModel';
export interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; enterpriseEnabled?:boolean;onNote?(destination:PlaceNoteDestination):void;onImagery?():void;onBack?(): void; onLink(value: boolean): void; onDetails(): void; onClear(): void; }
export const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>
  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>
    <img src={placeCategoryIcon(props.place.group, true)} alt="" aria-hidden="true" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>
    <button type="button" title={t('uiOpenSelectedPlaceDetails')} onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>
    <button type="button" aria-label={t('uiClearSelectedPlace')} onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>×</button>
  </div>
  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} · <a href="https://docs.overturemaps.org/attribution/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}> {t('uiOverture')} </a></div>
  {props.place.address&&<div style={{fontSize:10,lineHeight:1.35,marginTop:4,overflowWrap:'anywhere'}}>{props.place.address}</div>}
  <div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{owned(props.cameraDistance || t('uiOpenImageDistance'))}</div>
  {props.onBack && <button type="button" onClick={props.onBack} title={t('uiCenterTheMapOnThisPlace')} style={{ display: 'block', width: '100%', minHeight: 28, marginTop: 5, padding: '4px 7px', border: '1px solid #61846e', borderRadius: 4, background: '#284b38', color: 'inherit', font: 'inherit', fontSize: 11, textAlign: 'left', cursor: 'pointer' }}> {t('uiBackToPlace')} </button>}
  {props.onImagery&&<button type="button" onClick={props.onImagery} style={{width:'100%',minHeight:28,marginTop:5,padding:'4px 7px',border:'1px solid #61846e',borderRadius:5,background:'#284b38',color:'inherit',fontSize:11,cursor:'pointer'}}>{owned('View nearby imagery')}</button>}
  {props.onNote&&<PlaceNoteActions key={props.place.id} enterpriseEnabled={!!props.enterpriseEnabled} onNote={props.onNote}/>}
  <details style={{marginTop:5,fontSize:10}}><summary style={{cursor:'pointer'}}>{owned('Place details')}</summary><div style={{display:'grid',gap:5,paddingTop:5,overflowWrap:'anywhere'}}>
    {!props.place.address&&<span>{owned('Address not supplied')}</span>}
    {placesWebsite(props.place.website)?<a href={placesWebsite(props.place.website)} target="_blank" rel="noopener noreferrer" style={{color:'#b7dfc5'}}>{owned('Website')}</a>:<span>{owned('Website not supplied')}</span>}
    <span>{owned('Overture ID')}: {props.place.id}</span><span>{owned('Data release')}: {props.place.release||owned('Not supplied')}</span>
  </div></details>
  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type="checkbox" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/> {t('uiShowCameraLink')} </label>
</div>; };
export const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <section aria-label={t('uiSelectedPlace')} style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', maxHeight:'calc(100% - 12px)',overflowY:'auto', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><SelectedPlaceSummary {...props}/></section>; };

function PlaceNoteActions({enterpriseEnabled,onNote}:{enterpriseEnabled:boolean;onNote:(destination:PlaceNoteDestination)=>void}){
 const {owned:text}=useWidgetLocale(),[open,setOpen]=React.useState(false),[destination,setDestination]=React.useState<PlaceNoteDestination>('local');
 const style:React.CSSProperties={width:'100%',minHeight:28,minWidth:0,padding:'4px 6px',border:'1px solid #61846e',borderRadius:5,background:'#284b38',color:'#e3eddf',fontSize:11,cursor:'pointer',boxSizing:'border-box'};
 return <div style={{display:'grid',gap:4,marginTop:5}}>{!open?<button type="button" style={style} onClick={()=>setOpen(true)}>{text('Add field note')}</button>:<React.Fragment><label style={{display:'grid',gap:3,color:'inherit',fontSize:10,margin:0}}>{text('Save to')}<select aria-label={text('Place note destination')} value={destination} style={style} onChange={event=>setDestination(event.target.value as PlaceNoteDestination)}><option value="local">{text('Local')}</option><option value="enterprise" disabled={!enterpriseEnabled}>{text('Enterprise')}</option><option value="workspace">{text('Workspace')}</option></select></label><button type="button" style={style} onClick={()=>onNote(destination)}>{text('Create draft here')}</button></React.Fragment>}</div>;
}
