#!/usr/bin/env node
'use strict';
/**
 * Compact selected place card. Requires the preceding full-area search update.
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
      "file": "src/components/SelectedPlaceCard.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/SelectedPlaceCard.tsx 1",
              "before": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { PlaceNoteActions } from '../features/places/PlaceNoteActions';\nimport type { DetectionPreviewLoader } from '../features/detections/detectionPreview';\nimport type { PlaceNoteOptions,PlaceNoteImageContext,PlaceNoteDestination } from '../features/places/placeNote';\nimport { placesWebsite } from '../features/places/placesModel';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; enterpriseEnabled?:boolean;onNote?(destination:PlaceNoteDestination,options?:PlaceNoteOptions):void;currentImageId?:string|null;onGetNoteImage?():Promise<PlaceNoteImageContext|null>;onLoadNotePreview?:DetectionPreviewLoader;notePhase?:'idle'|'capturing'|'picking';onCancelNote?():void;onImagery?():void;onBack?(): void; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <div style={{ borderLeft: '3px solid #ffda74', padding: '5px 0 4px 7px', minWidth: 0 }}>\n  <div style={{ display: 'flex', gap: 5, alignItems: 'start' }}>\n    <img src={placeCategoryIcon(props.place.group, true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}/>\n    <button type=\"button\" title={t('uiOpenSelectedPlaceDetails')} onClick={props.onDetails} style={{ flex: 1, minWidth: 0, padding: 0, textAlign: 'left', border: 0, background: 'none', color: '#f4ebd2', fontWeight: 600, fontSize: 11, overflowWrap: 'anywhere', cursor: 'pointer' }}>{props.place.name}</button>\n    <button type=\"button\" aria-label={t('uiClearSelectedPlace')} onClick={props.onClear} style={{ border: 0, background: 'none', color: 'inherit', padding: '0 3px', cursor: 'pointer' }}>×</button>\n  </div>\n  <div style={{ fontSize: 10, opacity: .8, marginTop: 3 }}>{props.place.category.replace(/_/g, ' ')} · <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{ color: 'inherit' }}> {t('uiOverture')} </a></div>\n  {props.place.address&&<div style={{fontSize:10,lineHeight:1.35,marginTop:4,overflowWrap:'anywhere'}}>{props.place.address}</div>}\n  <div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{ fontSize: 10, color: '#c0e5dc', marginTop: 4 }}>{owned(props.cameraDistance || t('uiOpenImageDistance'))}</div>\n  {props.onBack && <button type=\"button\" onClick={props.onBack} title={t('uiCenterTheMapOnThisPlace')} style={{ display: 'block', width: '100%', minHeight: 28, marginTop: 5, padding: '4px 7px', border: '1px solid #61846e', borderRadius: 4, background: '#284b38', color: 'inherit', font: 'inherit', fontSize: 11, textAlign: 'left', cursor: 'pointer' }}> {t('uiBackToPlace')} </button>}\n  {props.onImagery&&<button type=\"button\" onClick={props.onImagery} style={{width:'100%',minHeight:28,marginTop:5,padding:'4px 7px',border:'1px solid #61846e',borderRadius:5,background:'#284b38',color:'inherit',fontSize:11,cursor:'pointer'}}>{owned('View nearby imagery')}</button>}\n  {props.onNote&&<PlaceNoteActions place={props.place} currentImageId={props.currentImageId} onGetImage={props.onGetNoteImage} onLoadPreview={props.onLoadNotePreview} phase={props.notePhase} onCancel={props.onCancelNote} key={props.place.id} enterpriseEnabled={!!props.enterpriseEnabled} onNote={props.onNote}/>}\n  <details style={{marginTop:5,fontSize:10}}><summary style={{cursor:'pointer'}}>{owned('Place details')}</summary><div style={{display:'grid',gap:5,paddingTop:5,overflowWrap:'anywhere'}}>\n    {!props.place.address&&<span>{owned('Address not supplied')}</span>}\n    {placesWebsite(props.place.website)?<a href={placesWebsite(props.place.website)} target=\"_blank\" rel=\"noopener noreferrer\" style={{color:'#b7dfc5'}}>{owned('Website')}</a>:<span>{owned('Website not supplied')}</span>}\n    <span>{t('uiPoiConfidence')}: {typeof props.place.confidence==='number'&&Number.isFinite(props.place.confidence)?String(props.place.confidence):t('uiPoiNotProvided')}</span>\n    <span>{t('uiPoiOperatingStatus')}: {props.place.operatingStatus==='open'?t('uiPoiOpen'):props.place.operatingStatus==='temporarily_closed'?t('uiPoiTemporarilyClosed'):props.place.operatingStatus==='permanently_closed'?t('uiPoiPermanentlyClosed'):props.place.operatingStatus||t('uiPoiNotProvided')}</span>\n    <span>{owned('Overture ID')}: {props.place.id}</span><span>{owned('Data release')}: {props.place.release||owned('Not supplied')}</span>\n  </div></details>\n  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, margin: '5px 0 0', cursor: 'pointer' }}><input type=\"checkbox\" checked={props.link} onChange={e => props.onLink(e.target.checked)} style={{ margin: 0 }}/> {t('uiShowCameraLink')} </label>\n</div>; };\nexport const placesScrollCss = `.mly-places-scroll { scrollbar-width: thin; scrollbar-color: rgba(139,179,153,.20) transparent; } .mly-places-scroll::-webkit-scrollbar { width: 4px; height: 4px; } .mly-places-scroll::-webkit-scrollbar-track { background: transparent; } .mly-places-scroll::-webkit-scrollbar-thumb { background: rgba(139,179,153,.20); border-radius: 5px; } .mly-places-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,179,153,.40); } @media (forced-colors: active) { .mly-places-scroll { scrollbar-color: auto; } }`;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <section className=\"mly-places-scroll\" aria-label={t('uiSelectedPlace')} style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', maxHeight:'calc(100% - 12px)',overflowY:'auto', overflowX:'hidden', overflowWrap:'anywhere', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><style>{placesScrollCss}</style><SelectedPlaceSummary {...props}/></section>; };\n\n",
              "after": "/** @jsx jsx */\nimport { useWidgetLocale } from '../i18n/WidgetLocale';\nimport { React, jsx } from 'jimu-core';\nimport { TILE_CATEGORIES } from '../features/places/tileCategories';\nimport type { MessageKey } from '../i18n/messages';\nimport { placeCategoryIcon } from '../features/places/placeIcons';\nimport { PlaceNoteActions } from '../features/places/PlaceNoteActions';\nimport type { DetectionPreviewLoader } from '../features/detections/detectionPreview';\nimport type { PlaceNoteOptions,PlaceNoteImageContext,PlaceNoteDestination } from '../features/places/placeNote';\nimport { placesWebsite } from '../features/places/placesModel';\nimport type { Place } from '../features/places/placesModel';\nexport interface SelectedPlaceProps { place: Place; link: boolean; cameraDistance?: string | null; enterpriseEnabled?:boolean;onNote?(destination:PlaceNoteDestination,options?:PlaceNoteOptions):void;currentImageId?:string|null;onGetNoteImage?():Promise<PlaceNoteImageContext|null>;onLoadNotePreview?:DetectionPreviewLoader;notePhase?:'idle'|'capturing'|'picking';onCancelNote?():void;onImagery?():void;onBack?(): void; onLink(value: boolean): void; onDetails(): void; onClear(): void; }\n/** Localized icon-family label, with precise book-shop labels for the shown source categories. */\nexport function selectedPlaceCategory(place:Place,t:(key:MessageKey)=>string):string {\n  const category=place.category.trim().toLowerCase().replace(/[ -]+/g,'_');\n  if(category==='books_music_and_video_store')return t('uiPoiBooksMusicVideo');\n  if(['bookstore','book_store','book_shop'].includes(category))return t('uiPoiBookshop');\n  return t(TILE_CATEGORIES.find(([id])=>id===place.group)?.[1]||'uiPoiOther');\n}\nconst selectedAction:React.CSSProperties={width:'100%',minHeight:30,minWidth:0,boxSizing:'border-box',padding:'3px 6px',border:'1px solid #61846e',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',fontSize:11,lineHeight:1.3,cursor:'pointer'};\nexport const SelectedPlaceSummary: React.FC<SelectedPlaceProps> = props => {\n const {t,owned}=useWidgetLocale(),category=selectedPlaceCategory(props.place,t);\n return <div style={{borderInlineStart:'3px solid #ffda74',padding:'4px 0',paddingInlineStart:7,minWidth:0}}>\n  <div style={{display:'flex',gap:5,alignItems:'start',minWidth:0}}>\n    <img src={placeCategoryIcon(props.place.group,true)} alt=\"\" aria-hidden=\"true\" width={18} height={18} style={{flexShrink:0,marginTop:3}}/>\n    <button type=\"button\" title={props.place.name} aria-label={`${t('uiOpenSelectedPlaceDetails')}: ${props.place.name}`} onClick={props.onDetails} style={{flex:1,minWidth:0,minHeight:30,maxHeight:'2.7em',padding:0,textAlign:'start',border:0,background:'none',color:'#f4ebd2',fontFamily:'inherit',fontWeight:600,fontSize:11,lineHeight:1.35,overflowWrap:'anywhere',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',cursor:'pointer'}}>{props.place.name}</button>\n    <button type=\"button\" aria-label={t('uiClearSelectedPlace')} title={t('uiClearSelectedPlace')} onClick={props.onClear} style={{flexShrink:0,minHeight:30,padding:'2px 4px',border:'1px solid #61846e66',borderRadius:5,background:'transparent',color:'inherit',font:'inherit',fontSize:9,cursor:'pointer'}}>{t('uiPoiClearShort')}</button>\n  </div>\n  <div title={category} style={{fontSize:10,opacity:.8,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{category}</div>\n  {props.cameraDistance&&<div title={t('uiApproximateStraightLineDistanceNotWalkingDistanceOr')} style={{fontSize:10,color:'#c0e5dc',marginTop:3,overflowWrap:'anywhere'}}>{owned(props.cameraDistance)}</div>}\n  {props.onImagery&&<button type=\"button\" onClick={props.onImagery} style={{...selectedAction,marginTop:4}}>{owned('View nearby imagery')}</button>}\n  {props.onNote&&<PlaceNoteActions place={props.place} currentImageId={props.currentImageId} onGetImage={props.onGetNoteImage} onLoadPreview={props.onLoadNotePreview} phase={props.notePhase} onCancel={props.onCancelNote} key={props.place.id} enterpriseEnabled={!!props.enterpriseEnabled} onNote={props.onNote}/>}\n  <details key={props.place.id} style={{marginTop:4,fontSize:10}}>\n    <summary style={{cursor:'pointer',minHeight:30,boxSizing:'border-box',padding:'6px 0'}}>{owned('Place details')}{props.link&&<span aria-hidden=\"true\" style={{color:'#a9d6be',marginInlineStart:4}}>●</span>}</summary>\n    <div style={{display:'grid',gap:5,paddingTop:3,overflowWrap:'anywhere'}}>\n      <strong>{props.place.name}</strong>\n      <span>{t('uiPlaceCategory')}: {props.place.category.replace(/_/g,' ')||category}</span>\n      <span>{props.place.address||owned('Address not supplied')}</span>\n      {!props.cameraDistance&&<span>{t('uiOpenImageDistance')}</span>}\n      {props.onBack&&<button type=\"button\" onClick={props.onBack} title={t('uiCenterTheMapOnThisPlace')} style={selectedAction}>{t('uiBackToPlace')}</button>}\n      <label style={{display:'flex',alignItems:'center',gap:5,minHeight:30,fontSize:10,margin:0,cursor:'pointer'}}><input type=\"checkbox\" checked={props.link} onChange={event=>props.onLink(event.target.checked)} style={{margin:0}}/>{t('uiShowCameraLink')}</label>\n      {placesWebsite(props.place.website)?<a href={placesWebsite(props.place.website)} target=\"_blank\" rel=\"noopener noreferrer\" style={{color:'#b7dfc5'}}>{owned('Website')}</a>:<span>{owned('Website not supplied')}</span>}\n      <span>{t('uiPoiConfidence')}: {typeof props.place.confidence==='number'&&Number.isFinite(props.place.confidence)?String(props.place.confidence):t('uiPoiNotProvided')}</span>\n      <span>{t('uiPoiOperatingStatus')}: {props.place.operatingStatus==='open'?t('uiPoiOpen'):props.place.operatingStatus==='temporarily_closed'?t('uiPoiTemporarilyClosed'):props.place.operatingStatus==='permanently_closed'?t('uiPoiPermanentlyClosed'):props.place.operatingStatus||t('uiPoiNotProvided')}</span>\n      <span>{owned('Overture ID')}: {props.place.id}</span><span>{owned('Data release')}: {props.place.release||owned('Not supplied')}</span>\n      <a href=\"https://docs.overturemaps.org/attribution/\" target=\"_blank\" rel=\"noopener noreferrer\" style={{color:'inherit'}}>{t('uiOverture')}</a>\n    </div>\n  </details>\n </div>;\n};\nexport const placesScrollCss = `.mly-places-scroll { scrollbar-width: thin; scrollbar-color: rgba(139,179,153,.20) transparent; } .mly-places-scroll::-webkit-scrollbar { width: 4px; height: 4px; } .mly-places-scroll::-webkit-scrollbar-track { background: transparent; } .mly-places-scroll::-webkit-scrollbar-thumb { background: rgba(139,179,153,.20); border-radius: 5px; } .mly-places-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,179,153,.40); } @media (forced-colors: active) { .mly-places-scroll { scrollbar-color: auto; } }`;\nexport const SelectedPlaceCard: React.FC<SelectedPlaceProps> = props => { const { t, locale, owned } = useWidgetLocale(); return <section className=\"mly-places-scroll\" aria-label={t('uiSelectedPlace')} style={{ position: 'absolute', left: 42, top: 6, width: 190, maxWidth: 'calc(100% - 50px)', maxHeight:'calc(100% - 12px)',overflowY:'auto', overflowX:'hidden', overflowWrap:'anywhere', boxSizing: 'border-box', padding: 7, zIndex: 10004, borderRadius: 7, border: '1px solid #61846e', background: '#192e25ed', color: '#e3eddf', fontFamily: 'inherit' }}><style>{placesScrollCss}</style><SelectedPlaceSummary {...props}/></section>; };\n\n"
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
              "before": "  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n  \"uiPoiQualityFilters\": \"Quality filters\",\n  \"uiPoiHelpSource\": \"Help & source\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n",
              "after": "  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n  \"uiPoiQualityFilters\": \"Quality filters\",\n  \"uiPoiHelpSource\": \"Help & source\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n"
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
              "before": "\"runtime\",\"uiPoiPagedHint\",\"Browse matching places in pages of up to 200.\",\"Browse matching places in pages of up to 200.\",\"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\"Explora los lugares coincidentes en páginas de hasta 200.\",\"Parcourez les lieux correspondants par pages de 200 maximum.\",\"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\"Explore os locais correspondentes em páginas de até 200.\",\"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\"一致する場所を1ページ最大200件ずつ表示します。\",\"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\"每页最多浏览 200 个匹配地点。\",\"每頁最多瀏覽 200 個相符地點。\"\n\"runtime\",\"uiPoiQualityFilters\",\"Quality filters\",\"Quality filters\",\"عوامل تصفية الجودة\",\"Kalite filtreleri\",\"Filtros de calidad\",\"Filtres de qualité\",\"Qualitätsfilter\",\"Filtros de qualidade\",\"Filtri di qualità\",\"品質フィルター\",\"품질 필터\",\"质量筛选\",\"品質篩選\"\n\"runtime\",\"uiPoiHelpSource\",\"Help & source\",\"Help & source\",\"المساعدة والمصدر\",\"Yardım ve kaynak\",\"Ayuda y fuente\",\"Aide et source\",\"Hilfe und Quelle\",\"Ajuda e fonte\",\"Guida e fonte\",\"ヘルプと出典\",\"도움말 및 출처\",\"帮助与来源\",\"說明與來源\"\n\"runtime\",\"uiPoiAutoShort\",\"Auto\",\"Auto\",\"تلقائي\",\"Otomatik\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"自動\",\"자동\",\"自动\",\"自動\"\n\"runtime\",\"uiPoiSearchAreaPlaces\",\"Find a place in this area\",\"Find a place in this area\",\"ابحث عن مكان في هذه المنطقة\",\"Bu alanda yer ara\",\"Buscar un lugar en esta zona\",\"Rechercher un lieu dans cette zone\",\"Ort in diesem Bereich suchen\",\"Encontrar um local nesta área\",\"Trova un luogo in questa zona\",\"この範囲の場所を検索\",\"이 영역에서 장소 찾기\",\"查找此区域的地点\",\"尋找此區域的地點\"\n\"runtime\",\"uiPoiClearAreaSearch\",\"Clear area search\",\"Clear area search\",\"مسح البحث في المنطقة\",\"Alan aramasını temizle\",\"Borrar búsqueda de zona\",\"Effacer la recherche dans la zone\",\"Bereichssuche löschen\",\"Limpar pesquisa da área\",\"Cancella ricerca nella zona\",\"範囲内検索をクリア\",\"영역 검색 지우기\",\"清除区域搜索\",\"清除區域搜尋\"\n\"runtime\",\"uiPoiSearchAllAreaHint\",\"Search all matching places in this area.\",\"Search all matching places in this area.\",\"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\"Bu alandaki tüm eşleşen yerlerde arayın.\",\"Busca en todos los lugares coincidentes de esta zona.\",\"Recherchez parmi tous les lieux correspondants de cette zone.\",\"Alle passenden Orte in diesem Bereich durchsuchen.\",\"Pesquise todos os locais correspondentes nesta área.\",\"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\"この範囲の一致するすべての場所を検索します。\",\"이 영역의 일치하는 모든 장소를 검색합니다.\",\"搜索此区域内所有匹配的地点。\",\"搜尋此區域內所有相符的地點。\"\n\"runtime\",\"uiPoiNoSearchMatches\",\"No matching places in this area.\",\"No matching places in this area.\",\"لا توجد أماكن مطابقة في هذه المنطقة.\",\"Bu alanda eşleşen yer yok.\",\"No hay lugares coincidentes en esta zona.\",\"Aucun lieu correspondant dans cette zone.\",\"Keine passenden Orte in diesem Bereich.\",\"Nenhum local correspondente nesta área.\",\"Nessun luogo corrispondente in questa zona.\",\"この範囲に一致する場所はありません。\",\"이 영역에 일치하는 장소가 없습니다.\",\"此区域没有匹配的地点。\",\"此區域沒有相符的地點。\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n",
              "after": "\"runtime\",\"uiPoiPagedHint\",\"Browse matching places in pages of up to 200.\",\"Browse matching places in pages of up to 200.\",\"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\"Explora los lugares coincidentes en páginas de hasta 200.\",\"Parcourez les lieux correspondants par pages de 200 maximum.\",\"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\"Explore os locais correspondentes em páginas de até 200.\",\"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\"一致する場所を1ページ最大200件ずつ表示します。\",\"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\"每页最多浏览 200 个匹配地点。\",\"每頁最多瀏覽 200 個相符地點。\"\n\"runtime\",\"uiPoiQualityFilters\",\"Quality filters\",\"Quality filters\",\"عوامل تصفية الجودة\",\"Kalite filtreleri\",\"Filtros de calidad\",\"Filtres de qualité\",\"Qualitätsfilter\",\"Filtros de qualidade\",\"Filtri di qualità\",\"品質フィルター\",\"품질 필터\",\"质量筛选\",\"品質篩選\"\n\"runtime\",\"uiPoiHelpSource\",\"Help & source\",\"Help & source\",\"المساعدة والمصدر\",\"Yardım ve kaynak\",\"Ayuda y fuente\",\"Aide et source\",\"Hilfe und Quelle\",\"Ajuda e fonte\",\"Guida e fonte\",\"ヘルプと出典\",\"도움말 및 출처\",\"帮助与来源\",\"說明與來源\"\n\"runtime\",\"uiPoiAutoShort\",\"Auto\",\"Auto\",\"تلقائي\",\"Otomatik\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"自動\",\"자동\",\"自动\",\"自動\"\n\"runtime\",\"uiPoiSearchAreaPlaces\",\"Find a place in this area\",\"Find a place in this area\",\"ابحث عن مكان في هذه المنطقة\",\"Bu alanda yer ara\",\"Buscar un lugar en esta zona\",\"Rechercher un lieu dans cette zone\",\"Ort in diesem Bereich suchen\",\"Encontrar um local nesta área\",\"Trova un luogo in questa zona\",\"この範囲の場所を検索\",\"이 영역에서 장소 찾기\",\"查找此区域的地点\",\"尋找此區域的地點\"\n\"runtime\",\"uiPoiClearAreaSearch\",\"Clear area search\",\"Clear area search\",\"مسح البحث في المنطقة\",\"Alan aramasını temizle\",\"Borrar búsqueda de zona\",\"Effacer la recherche dans la zone\",\"Bereichssuche löschen\",\"Limpar pesquisa da área\",\"Cancella ricerca nella zona\",\"範囲内検索をクリア\",\"영역 검색 지우기\",\"清除区域搜索\",\"清除區域搜尋\"\n\"runtime\",\"uiPoiSearchAllAreaHint\",\"Search all matching places in this area.\",\"Search all matching places in this area.\",\"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\"Bu alandaki tüm eşleşen yerlerde arayın.\",\"Busca en todos los lugares coincidentes de esta zona.\",\"Recherchez parmi tous les lieux correspondants de cette zone.\",\"Alle passenden Orte in diesem Bereich durchsuchen.\",\"Pesquise todos os locais correspondentes nesta área.\",\"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\"この範囲の一致するすべての場所を検索します。\",\"이 영역의 일치하는 모든 장소를 검색합니다.\",\"搜索此区域内所有匹配的地点。\",\"搜尋此區域內所有相符的地點。\"\n\"runtime\",\"uiPoiNoSearchMatches\",\"No matching places in this area.\",\"No matching places in this area.\",\"لا توجد أماكن مطابقة في هذه المنطقة.\",\"Bu alanda eşleşen yer yok.\",\"No hay lugares coincidentes en esta zona.\",\"Aucun lieu correspondant dans cette zone.\",\"Keine passenden Orte in diesem Bereich.\",\"Nenhum local correspondente nesta área.\",\"Nessun luogo corrispondente in questa zona.\",\"この範囲に一致する場所はありません。\",\"이 영역에 일치하는 장소가 없습니다.\",\"此区域没有匹配的地点。\",\"此區域沒有相符的地點。\"\n\"runtime\",\"uiPoiClearShort\",\"Clear\",\"Clear\",\"مسح\",\"Temizle\",\"Limpiar\",\"Effacer\",\"Aufheben\",\"Limpar\",\"Deseleziona\",\"解除\",\"해제\",\"清除\",\"清除\"\n\"runtime\",\"uiPoiBooksMusicVideo\",\"Books, music & video\",\"Books, music & video\",\"الكتب والموسيقى والفيديو\",\"Kitap, müzik ve video\",\"Libros, música y vídeo\",\"Livres, musique et vidéo\",\"Bücher, Musik und Video\",\"Livros, música e vídeo\",\"Libri, musica e video\",\"書籍・音楽・映像\",\"도서, 음악 및 비디오\",\"图书、音乐与视频\",\"書籍、音樂與影片\"\n\"runtime\",\"uiPoiBookshop\",\"Bookshop\",\"Bookshop\",\"مكتبة لبيع الكتب\",\"Kitapçı\",\"Librería\",\"Librairie\",\"Buchhandlung\",\"Livraria\",\"Libreria\",\"書店\",\"서점\",\"书店\",\"書店\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n"
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
              "before": "  \"uiPoiPagedHint\": \"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\n  \"uiPoiQualityFilters\": \"عوامل تصفية الجودة\",\n  \"uiPoiHelpSource\": \"المساعدة والمصدر\",\n  \"uiPoiAutoShort\": \"تلقائي\",\n  \"uiPoiSearchAreaPlaces\": \"ابحث عن مكان في هذه المنطقة\",\n  \"uiPoiClearAreaSearch\": \"مسح البحث في المنطقة\",\n  \"uiPoiSearchAllAreaHint\": \"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\n  \"uiPoiNoSearchMatches\": \"لا توجد أماكن مطابقة في هذه المنطقة.\",\n};\nexport default ar;\n",
              "after": "  \"uiPoiPagedHint\": \"تصفّح الأماكن المطابقة في صفحات تضم حتى 200 مكان.\",\n  \"uiPoiQualityFilters\": \"عوامل تصفية الجودة\",\n  \"uiPoiHelpSource\": \"المساعدة والمصدر\",\n  \"uiPoiAutoShort\": \"تلقائي\",\n  \"uiPoiSearchAreaPlaces\": \"ابحث عن مكان في هذه المنطقة\",\n  \"uiPoiClearAreaSearch\": \"مسح البحث في المنطقة\",\n  \"uiPoiSearchAllAreaHint\": \"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\n  \"uiPoiNoSearchMatches\": \"لا توجد أماكن مطابقة في هذه المنطقة.\",\n  \"uiPoiClearShort\": \"مسح\",\n  \"uiPoiBooksMusicVideo\": \"الكتب والموسيقى والفيديو\",\n  \"uiPoiBookshop\": \"مكتبة لبيع الكتب\",\n};\nexport default ar;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\n  \"uiPoiQualityFilters\": \"Qualitätsfilter\",\n  \"uiPoiHelpSource\": \"Hilfe und Quelle\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Ort in diesem Bereich suchen\",\n  \"uiPoiClearAreaSearch\": \"Bereichssuche löschen\",\n  \"uiPoiSearchAllAreaHint\": \"Alle passenden Orte in diesem Bereich durchsuchen.\",\n  \"uiPoiNoSearchMatches\": \"Keine passenden Orte in diesem Bereich.\",\n};\nexport default de;\n",
              "after": "  \"uiPoiPagedHint\": \"Durchsuchen Sie passende Orte in Seiten mit bis zu 200 Ergebnissen.\",\n  \"uiPoiQualityFilters\": \"Qualitätsfilter\",\n  \"uiPoiHelpSource\": \"Hilfe und Quelle\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Ort in diesem Bereich suchen\",\n  \"uiPoiClearAreaSearch\": \"Bereichssuche löschen\",\n  \"uiPoiSearchAllAreaHint\": \"Alle passenden Orte in diesem Bereich durchsuchen.\",\n  \"uiPoiNoSearchMatches\": \"Keine passenden Orte in diesem Bereich.\",\n  \"uiPoiClearShort\": \"Aufheben\",\n  \"uiPoiBooksMusicVideo\": \"Bücher, Musik und Video\",\n  \"uiPoiBookshop\": \"Buchhandlung\",\n};\nexport default de;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n  \"uiPoiQualityFilters\": \"Quality filters\",\n  \"uiPoiHelpSource\": \"Help & source\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n};\nexport default overrides;\n",
              "after": "  \"uiPoiPagedHint\": \"Browse matching places in pages of up to 200.\",\n  \"uiPoiQualityFilters\": \"Quality filters\",\n  \"uiPoiHelpSource\": \"Help & source\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n};\nexport default overrides;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Explora los lugares coincidentes en páginas de hasta 200.\",\n  \"uiPoiQualityFilters\": \"Filtros de calidad\",\n  \"uiPoiHelpSource\": \"Ayuda y fuente\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Buscar un lugar en esta zona\",\n  \"uiPoiClearAreaSearch\": \"Borrar búsqueda de zona\",\n  \"uiPoiSearchAllAreaHint\": \"Busca en todos los lugares coincidentes de esta zona.\",\n  \"uiPoiNoSearchMatches\": \"No hay lugares coincidentes en esta zona.\",\n};\nexport default es;\n",
              "after": "  \"uiPoiPagedHint\": \"Explora los lugares coincidentes en páginas de hasta 200.\",\n  \"uiPoiQualityFilters\": \"Filtros de calidad\",\n  \"uiPoiHelpSource\": \"Ayuda y fuente\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Buscar un lugar en esta zona\",\n  \"uiPoiClearAreaSearch\": \"Borrar búsqueda de zona\",\n  \"uiPoiSearchAllAreaHint\": \"Busca en todos los lugares coincidentes de esta zona.\",\n  \"uiPoiNoSearchMatches\": \"No hay lugares coincidentes en esta zona.\",\n  \"uiPoiClearShort\": \"Limpiar\",\n  \"uiPoiBooksMusicVideo\": \"Libros, música y vídeo\",\n  \"uiPoiBookshop\": \"Librería\",\n};\nexport default es;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Parcourez les lieux correspondants par pages de 200 maximum.\",\n  \"uiPoiQualityFilters\": \"Filtres de qualité\",\n  \"uiPoiHelpSource\": \"Aide et source\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Rechercher un lieu dans cette zone\",\n  \"uiPoiClearAreaSearch\": \"Effacer la recherche dans la zone\",\n  \"uiPoiSearchAllAreaHint\": \"Recherchez parmi tous les lieux correspondants de cette zone.\",\n  \"uiPoiNoSearchMatches\": \"Aucun lieu correspondant dans cette zone.\",\n};\nexport default fr;\n",
              "after": "  \"uiPoiPagedHint\": \"Parcourez les lieux correspondants par pages de 200 maximum.\",\n  \"uiPoiQualityFilters\": \"Filtres de qualité\",\n  \"uiPoiHelpSource\": \"Aide et source\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Rechercher un lieu dans cette zone\",\n  \"uiPoiClearAreaSearch\": \"Effacer la recherche dans la zone\",\n  \"uiPoiSearchAllAreaHint\": \"Recherchez parmi tous les lieux correspondants de cette zone.\",\n  \"uiPoiNoSearchMatches\": \"Aucun lieu correspondant dans cette zone.\",\n  \"uiPoiClearShort\": \"Effacer\",\n  \"uiPoiBooksMusicVideo\": \"Livres, musique et vidéo\",\n  \"uiPoiBookshop\": \"Librairie\",\n};\nexport default fr;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\n  \"uiPoiQualityFilters\": \"Filtri di qualità\",\n  \"uiPoiHelpSource\": \"Guida e fonte\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Trova un luogo in questa zona\",\n  \"uiPoiClearAreaSearch\": \"Cancella ricerca nella zona\",\n  \"uiPoiSearchAllAreaHint\": \"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\n  \"uiPoiNoSearchMatches\": \"Nessun luogo corrispondente in questa zona.\",\n};\nexport default it;\n",
              "after": "  \"uiPoiPagedHint\": \"Esplora i luoghi corrispondenti in pagine di massimo 200.\",\n  \"uiPoiQualityFilters\": \"Filtri di qualità\",\n  \"uiPoiHelpSource\": \"Guida e fonte\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Trova un luogo in questa zona\",\n  \"uiPoiClearAreaSearch\": \"Cancella ricerca nella zona\",\n  \"uiPoiSearchAllAreaHint\": \"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\n  \"uiPoiNoSearchMatches\": \"Nessun luogo corrispondente in questa zona.\",\n  \"uiPoiClearShort\": \"Deseleziona\",\n  \"uiPoiBooksMusicVideo\": \"Libri, musica e video\",\n  \"uiPoiBookshop\": \"Libreria\",\n};\nexport default it;\n"
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
              "before": "  \"uiPoiPagedHint\": \"一致する場所を1ページ最大200件ずつ表示します。\",\n  \"uiPoiQualityFilters\": \"品質フィルター\",\n  \"uiPoiHelpSource\": \"ヘルプと出典\",\n  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"この範囲の場所を検索\",\n  \"uiPoiClearAreaSearch\": \"範囲内検索をクリア\",\n  \"uiPoiSearchAllAreaHint\": \"この範囲の一致するすべての場所を検索します。\",\n  \"uiPoiNoSearchMatches\": \"この範囲に一致する場所はありません。\",\n};\nexport default ja;\n",
              "after": "  \"uiPoiPagedHint\": \"一致する場所を1ページ最大200件ずつ表示します。\",\n  \"uiPoiQualityFilters\": \"品質フィルター\",\n  \"uiPoiHelpSource\": \"ヘルプと出典\",\n  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"この範囲の場所を検索\",\n  \"uiPoiClearAreaSearch\": \"範囲内検索をクリア\",\n  \"uiPoiSearchAllAreaHint\": \"この範囲の一致するすべての場所を検索します。\",\n  \"uiPoiNoSearchMatches\": \"この範囲に一致する場所はありません。\",\n  \"uiPoiClearShort\": \"解除\",\n  \"uiPoiBooksMusicVideo\": \"書籍・音楽・映像\",\n  \"uiPoiBookshop\": \"書店\",\n};\nexport default ja;\n"
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
              "before": "  \"uiPoiPagedHint\": \"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\n  \"uiPoiQualityFilters\": \"품질 필터\",\n  \"uiPoiHelpSource\": \"도움말 및 출처\",\n  \"uiPoiAutoShort\": \"자동\",\n  \"uiPoiSearchAreaPlaces\": \"이 영역에서 장소 찾기\",\n  \"uiPoiClearAreaSearch\": \"영역 검색 지우기\",\n  \"uiPoiSearchAllAreaHint\": \"이 영역의 일치하는 모든 장소를 검색합니다.\",\n  \"uiPoiNoSearchMatches\": \"이 영역에 일치하는 장소가 없습니다.\",\n};\nexport default ko;\n",
              "after": "  \"uiPoiPagedHint\": \"일치하는 장소를 페이지당 최대 200개씩 탐색합니다.\",\n  \"uiPoiQualityFilters\": \"품질 필터\",\n  \"uiPoiHelpSource\": \"도움말 및 출처\",\n  \"uiPoiAutoShort\": \"자동\",\n  \"uiPoiSearchAreaPlaces\": \"이 영역에서 장소 찾기\",\n  \"uiPoiClearAreaSearch\": \"영역 검색 지우기\",\n  \"uiPoiSearchAllAreaHint\": \"이 영역의 일치하는 모든 장소를 검색합니다.\",\n  \"uiPoiNoSearchMatches\": \"이 영역에 일치하는 장소가 없습니다.\",\n  \"uiPoiClearShort\": \"해제\",\n  \"uiPoiBooksMusicVideo\": \"도서, 음악 및 비디오\",\n  \"uiPoiBookshop\": \"서점\",\n};\nexport default ko;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Explore os locais correspondentes em páginas de até 200.\",\n  \"uiPoiQualityFilters\": \"Filtros de qualidade\",\n  \"uiPoiHelpSource\": \"Ajuda e fonte\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Encontrar um local nesta área\",\n  \"uiPoiClearAreaSearch\": \"Limpar pesquisa da área\",\n  \"uiPoiSearchAllAreaHint\": \"Pesquise todos os locais correspondentes nesta área.\",\n  \"uiPoiNoSearchMatches\": \"Nenhum local correspondente nesta área.\",\n};\nexport default ptBR;\n",
              "after": "  \"uiPoiPagedHint\": \"Explore os locais correspondentes em páginas de até 200.\",\n  \"uiPoiQualityFilters\": \"Filtros de qualidade\",\n  \"uiPoiHelpSource\": \"Ajuda e fonte\",\n  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Encontrar um local nesta área\",\n  \"uiPoiClearAreaSearch\": \"Limpar pesquisa da área\",\n  \"uiPoiSearchAllAreaHint\": \"Pesquise todos os locais correspondentes nesta área.\",\n  \"uiPoiNoSearchMatches\": \"Nenhum local correspondente nesta área.\",\n  \"uiPoiClearShort\": \"Limpar\",\n  \"uiPoiBooksMusicVideo\": \"Livros, música e vídeo\",\n  \"uiPoiBookshop\": \"Livraria\",\n};\nexport default ptBR;\n"
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
              "before": "  \"uiPoiPagedHint\": \"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\n  \"uiPoiQualityFilters\": \"Kalite filtreleri\",\n  \"uiPoiHelpSource\": \"Yardım ve kaynak\",\n  \"uiPoiAutoShort\": \"Otomatik\",\n  \"uiPoiSearchAreaPlaces\": \"Bu alanda yer ara\",\n  \"uiPoiClearAreaSearch\": \"Alan aramasını temizle\",\n  \"uiPoiSearchAllAreaHint\": \"Bu alandaki tüm eşleşen yerlerde arayın.\",\n  \"uiPoiNoSearchMatches\": \"Bu alanda eşleşen yer yok.\",\n};\nexport default tr;\n",
              "after": "  \"uiPoiPagedHint\": \"Eşleşen yerleri en fazla 200 sonuçluk sayfalarda inceleyin.\",\n  \"uiPoiQualityFilters\": \"Kalite filtreleri\",\n  \"uiPoiHelpSource\": \"Yardım ve kaynak\",\n  \"uiPoiAutoShort\": \"Otomatik\",\n  \"uiPoiSearchAreaPlaces\": \"Bu alanda yer ara\",\n  \"uiPoiClearAreaSearch\": \"Alan aramasını temizle\",\n  \"uiPoiSearchAllAreaHint\": \"Bu alandaki tüm eşleşen yerlerde arayın.\",\n  \"uiPoiNoSearchMatches\": \"Bu alanda eşleşen yer yok.\",\n  \"uiPoiClearShort\": \"Temizle\",\n  \"uiPoiBooksMusicVideo\": \"Kitap, müzik ve video\",\n  \"uiPoiBookshop\": \"Kitapçı\",\n};\nexport default tr;\n"
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
              "before": "  \"uiPoiPagedHint\": \"每页最多浏览 200 个匹配地点。\",\n  \"uiPoiQualityFilters\": \"质量筛选\",\n  \"uiPoiHelpSource\": \"帮助与来源\",\n  \"uiPoiAutoShort\": \"自动\",\n  \"uiPoiSearchAreaPlaces\": \"查找此区域的地点\",\n  \"uiPoiClearAreaSearch\": \"清除区域搜索\",\n  \"uiPoiSearchAllAreaHint\": \"搜索此区域内所有匹配的地点。\",\n  \"uiPoiNoSearchMatches\": \"此区域没有匹配的地点。\",\n};\nexport default zhCN;\n",
              "after": "  \"uiPoiPagedHint\": \"每页最多浏览 200 个匹配地点。\",\n  \"uiPoiQualityFilters\": \"质量筛选\",\n  \"uiPoiHelpSource\": \"帮助与来源\",\n  \"uiPoiAutoShort\": \"自动\",\n  \"uiPoiSearchAreaPlaces\": \"查找此区域的地点\",\n  \"uiPoiClearAreaSearch\": \"清除区域搜索\",\n  \"uiPoiSearchAllAreaHint\": \"搜索此区域内所有匹配的地点。\",\n  \"uiPoiNoSearchMatches\": \"此区域没有匹配的地点。\",\n  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"图书、音乐与视频\",\n  \"uiPoiBookshop\": \"书店\",\n};\nexport default zhCN;\n"
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
              "before": "  \"uiPoiPagedHint\": \"每頁最多瀏覽 200 個相符地點。\",\n  \"uiPoiQualityFilters\": \"品質篩選\",\n  \"uiPoiHelpSource\": \"說明與來源\",\n  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"尋找此區域的地點\",\n  \"uiPoiClearAreaSearch\": \"清除區域搜尋\",\n  \"uiPoiSearchAllAreaHint\": \"搜尋此區域內所有相符的地點。\",\n  \"uiPoiNoSearchMatches\": \"此區域沒有相符的地點。\",\n};\nexport default zhTW;\n",
              "after": "  \"uiPoiPagedHint\": \"每頁最多瀏覽 200 個相符地點。\",\n  \"uiPoiQualityFilters\": \"品質篩選\",\n  \"uiPoiHelpSource\": \"說明與來源\",\n  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"尋找此區域的地點\",\n  \"uiPoiClearAreaSearch\": \"清除區域搜尋\",\n  \"uiPoiSearchAllAreaHint\": \"搜尋此區域內所有相符的地點。\",\n  \"uiPoiNoSearchMatches\": \"此區域沒有相符的地點。\",\n  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"書籍、音樂與影片\",\n  \"uiPoiBookshop\": \"書店\",\n};\nexport default zhTW;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/selectedPlaceCompact.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst root=path.join(__dirname,'../src'),cache=new Map(),jsx=(type,props,...children)=>({type,props:props||{},children}),Note=()=>null;\nfunction load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,id=>{\n if(id==='jimu-core')return{React:{},jsx};if(id.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:k=>'localized:'+k,owned:x=>x})};if(id.endsWith('placeIcons'))return{placeCategoryIcon:()=>''};if(id.endsWith('PlaceNoteActions'))return{PlaceNoteActions:Note};\n return load(path.relative(root,path.resolve(root,path.dirname(file),id+'.ts')));\n});return m.exports;}\nconst {SelectedPlaceSummary,selectedPlaceCategory}=load('components/SelectedPlaceCard.tsx');\nconst flatten=n=>typeof n==='string'?n:Array.isArray(n)?n.map(flatten).join(' '):n&&typeof n==='object'?flatten(n.children):'';\nfunction nodes(tree){const result=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){result.push(n);walk(n.children)}}walk(tree);return result}\nconst base={place:{id:'book',name:'The First Edition Rare Books with a very long name',category:'books_music_and_video_store',group:'shop',address:'123 Main Street',website:'https://example.com',release:'2026-10',confidence:.9,operatingStatus:'open'},link:true,onDetails(){},onClear(){},onLink(){}};\ntest('selected header has distinct Clear action, two-line title and full accessible name',()=>{\n const all=nodes(SelectedPlaceSummary(base)),clear=all.find(n=>n.props['aria-label']==='localized:uiClearSelectedPlace'),title=all.find(n=>n.props.title===base.place.name);\n assert.equal(clear.props.onClick,base.onClear);assert.equal(flatten(clear),'localized:uiPoiClearShort');assert(!all.some(n=>n.type==='button'&&flatten(n)==='×'));\n assert.equal(title.props.onClick,base.onDetails);assert.equal(title.props.style.WebkitLineClamp,2);assert(title.props['aria-label'].includes(base.place.name));\n});\ntest('secondary details start collapsed with full identity, address, camera link and source retained',()=>{\n const tree=SelectedPlaceSummary({...base,onBack(){}}),all=nodes(tree),details=all.find(n=>n.type==='details');assert(details);assert(!details.props.open);assert.equal(details.props.key,base.place.id);\n for(const value of [base.place.name,base.place.address,'books music and video store',base.place.id,base.place.release,'localized:uiPoiConfidence','localized:uiPoiOperatingStatus','localized:uiOverture'])assert(flatten(details).includes(value));\n const checkbox=nodes(details).find(n=>n.type==='input');assert.equal(checkbox.props.checked,true);assert(all.some(n=>n.props.title==='localized:uiCenterTheMapOnThisPlace'));\n});\ntest('imagery and all note preparation props stay outside collapsed secondary details',()=>{\n const note=()=>{},image=()=>{},cancel=()=>{},props={...base,onImagery:image,onNote:note,enterpriseEnabled:true,currentImageId:'image',onGetNoteImage:async()=>null,onLoadNotePreview:()=>{},notePhase:'capturing',onCancelNote:cancel};\n const tree=SelectedPlaceSummary(props),all=nodes(tree),details=all.find(n=>n.type==='details'),actions=all.find(n=>n.type===Note);\n assert(all.some(n=>n.type==='button'&&n.props.onClick===image));assert(!nodes(details).some(n=>n.type===Note||n.props.onClick===image));assert.equal(actions.props.onNote,note);assert.equal(actions.props.enterpriseEnabled,true);assert.equal(actions.props.phase,'capturing');assert.equal(actions.props.onCancel,cancel);assert.equal(actions.props.onGetImage,props.onGetNoteImage);assert.equal(actions.props.currentImageId,'image');\n});\ntest('category summary uses localized families and precise book labels',()=>{\n const t=k=>'translated:'+k;assert.equal(selectedPlaceCategory(base.place,t),'translated:uiPoiBooksMusicVideo');assert.equal(selectedPlaceCategory({...base.place,category:'bookstore'},t),'translated:uiPoiBookshop');assert.equal(selectedPlaceCategory({...base.place,category:'new_unknown_shop_category'},t),'translated:uiPoiShop');assert.equal(selectedPlaceCategory({...base.place,category:'new',group:'unknown'},t),'translated:uiPoiOther');\n});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'overture-selected-card-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Compact selected place card installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-selected-card' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Compact selected place card installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Compact selected place card installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Compact selected place card installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-selected-card.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'Compact selected place card is already uninstalled. No files changed.' : 'Compact selected place card is already installed. No files changed.');
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
  const manifest = { installer: 'overture-selected-card', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Compact selected place card ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
