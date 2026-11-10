#!/usr/bin/env node
'use strict';
/**
 * Places panel accordion. Requires the preceding mobile Places layout update.
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
              "before": "import { LoadedPlacesList } from './LoadedPlacesList';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport { PlaceQualityControls } from './PlaceQualityControls';\nimport { TileCategoryPicker } from './TileCategoryPicker';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onAreaSearch?(text:string):void;onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n const { t, owned, formatLocale:locale } = useWidgetLocale();\n\n  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && !!props.status.loadedCounts && props.status.count === 0;\n  const canShowAll = empty && (props.tileSource ? !!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0);\n  const readyMessage = empty\n    ? (props.tileSource&&props.status.searchText?t('uiPoiNoSearchMatches'):((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea')))\n    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});\n  const readyHint = props.status.limited && !props.tileSource ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';\n  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };\n",
              "after": "import { LoadedPlacesList } from './LoadedPlacesList';\nimport type { PlaceListOrigin } from '../features/places/placeListUtils';\nimport type { Place, PlaceGroup } from '../features/places/placesModel';\nimport { PlaceQualityControls } from './PlaceQualityControls';\nimport { TileCategoryPicker } from './TileCategoryPicker';\nimport type { PlacesState } from '../features/places/PlacesController';\nexport const PlacesPanel: React.FC<{ onAreaSearch?(text:string):void;onLoadMore?():void;onPreviousResults?():void;tileLoading?:boolean;tileQuality?:{minimum:number|null;hideClosed:boolean};onTileQuality?(minimum:number|null,hideClosed:boolean):void;tileSource?:boolean;tileFamily?:string;onTileFamily?(family:string):void;autoUpdate?:boolean;onAutoUpdate?(value:boolean):void;onSearch?():void;origin?:PlaceListOrigin|null;hoveredId?:string|null;revealRequest?:number;onHover?(id:string|null):void;onGoToArea?(): void; places?: readonly Place[]; onSelect?(id: string): void; selection?: SelectedPlaceProps; group: PlaceGroup; status: PlacesState; onGroup(group: PlaceGroup): void; onRetry(): void; onClose(): void }> = props => {\n const { t, owned, formatLocale:locale } = useWidgetLocale();\n const [collapsed,setCollapsed]=React.useState(false),panel=React.useRef<HTMLElement>(null),savedScroll=React.useRef(0),bodyId=React.useId();\n React.useEffect(()=>{if(panel.current)panel.current.scrollTop=collapsed?0:savedScroll.current;},[collapsed]);\n const toggleCollapsed=()=>{if(!collapsed)savedScroll.current=panel.current?.scrollTop||0;props.onHover?.(null);setCollapsed(!collapsed);};\n\n  const empty = (props.status.kind === 'ready'||props.status.kind === 'search') && !!props.status.loadedCounts && props.status.count === 0;\n  const canShowAll = empty && (props.tileSource ? !!props.onTileFamily && !!props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all' && (props.status.loadedCounts?.all || 0) > 0);\n  const readyMessage = empty\n    ? (props.tileSource&&props.status.searchText?t('uiPoiNoSearchMatches'):((props.tileSource ? props.tileFamily && props.tileFamily !== 'all' : props.group !== 'all') ? t('uiNoLoadedPlacesMatchThisCategory') : t('uiNoPlacesLoadedInThisArea')))\n    : props.tileSource ? t('uiPoiResultRange',{start:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+1),end:new Intl.NumberFormat(locale).format((props.status.pageOffset||0)+props.status.count)}) : t(props.status.count===1?'uiPlaceShown':'uiPlacesShown',{count:new Intl.NumberFormat(locale).format(props.status.count)});\n  const readyHint = props.status.limited && !props.tileSource ? t(props.tileSource?'uiPoiMoreResultsAvailable':'uiOnlyPartOfThisAreaIsLoadedZoom') : empty && !canShowAll ? t('uiTryANearbyAreaOrZoomCloser') : '';\n  const messages = { search:owned(props.status.reason||'Move the map, then tap Search this area.'),outside: t('uiOutsideThisLayerSPublishedPlacesArea'), off: t('uiPlacesAreOff'), paused: (props.status.reason==='Stop moving the map to load nearby places.'?t('uiStopMap'):props.status.reason==='Preparing nearby places…'?t('uiPlacesPrepare'):props.status.reason&&props.status.reason!=='Places will update when browsing pauses.'?props.status.reason:t('uiPlacesPause')), zoom: props.tileSource ? `${t('uiLoadedPlaces')}: ${t('appZoomCloser')}.` : t('uiZoomCloserToSeeNearbyPlaces'), loading: t('uiFindingNearbyPlaces'), ready: [readyMessage,readyHint].filter(Boolean).join(' '), error: t('uiPlacesCouldNotLoadTryAgain') };\n"
            },
            {
              "label": "src/components/PlacesPanel.tsx 2",
              "before": "      <div style={{minHeight:20,boxSizing:'border-box',padding:'3px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</div>\n      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>\n    </div>}\n    </fieldset>\n  );\n  const autoControl=(\n    props.onAutoUpdate&&<div style={{marginTop:props.tileSource?0:7,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:props.tileSource?30:undefined}}><input type=\"checkbox\" role=\"switch\" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{props.tileSource?t('uiPoiAutoShort'):owned('Auto-update places')}</span></label>{!props.tileSource&&<div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div>}</div>\n  );\n  return <section className=\"mly-places-scroll\" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: 9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <style>{placesScrollCss}</style>\n    <div className=\"mly-places-panel-header\" style={{position:'sticky',top:0,zIndex:3,background:'#192e25',margin:'-9px -9px 4px',padding:'3px 7px',borderBottom:'1px solid #506b5a55',display:'flex',justifyContent:'space-between',alignItems:'center',gap:3}}>\n      <strong style={{minWidth:0,flex:1}}>{t('uiNearbyPlaces')}</strong>\n      {props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} title={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{minHeight:30,minWidth:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',opacity:searchDisabled?.45:1,cursor:searchDisabled?'default':'pointer'}}><span aria-hidden=\"true\">↻</span></button>}\n      <button type=\"button\" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{border:0,background:'none',color:'inherit',cursor:'pointer',padding:3,minWidth:30,minHeight:30}}>×</button>\n    </div>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    {props.tileLoading&&<p role=\"status\" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}\n    {props.tileSource?<details className=\"mly-place-filters\" style={{borderBottom:'1px solid #506b5a55',marginBottom:4}}><summary style={{cursor:'pointer',minHeight:30,padding:'6px 0',boxSizing:'border-box',fontSize:10}}>{t('uiFilterNearbyPlaces')}{qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all')>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all'))}</span>}</summary>{filterControls}{autoControl}</details>:filterControls}\n    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {!props.tileSource&&autoControl}\n    {!props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n",
              "after": "      <div style={{minHeight:20,boxSizing:'border-box',padding:'3px 0',fontSize:10}}>{t('uiPoiQualityFilters')}{qualityCount>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount)}</span>}</div>\n      <PlaceQualityControls minimum={props.tileQuality?.minimum??null} hideClosed={props.tileQuality?.hideClosed??false} onChange={props.onTileQuality}/>\n    </div>}\n    </fieldset>\n  );\n  const autoControl=(\n    props.onAutoUpdate&&<div style={{marginTop:props.tileSource?0:7,flexShrink:0}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:10,cursor:'pointer',margin:0,minHeight:props.tileSource?30:undefined}}><input type=\"checkbox\" role=\"switch\" aria-label={owned('Auto-update places')} checked={props.autoUpdate!==false} onChange={event=>props.onAutoUpdate?.(event.target.checked)} style={{appearance:'none',flexShrink:0,width:28,height:16,margin:0,border:'1px solid #72947d',borderRadius:8,backgroundColor:props.autoUpdate!==false?'#38694b':'#213c2e',backgroundImage:'radial-gradient(circle, #e3eddf 5px, transparent 5.5px)',backgroundSize:'12px 12px',backgroundRepeat:'no-repeat',backgroundPosition:props.autoUpdate!==false?'right 1px center':'left 1px center',cursor:'pointer'}}/><span>{props.tileSource?t('uiPoiAutoShort'):owned('Auto-update places')}</span></label>{!props.tileSource&&<div style={{fontSize:9,lineHeight:1.35,opacity:.75,marginTop:3}}>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</div>}</div>\n  );\n  return <section ref={panel} className=\"mly-places-scroll\" aria-label={t('uiNearbyPlaces')} style={{ position: 'absolute', left: 42, top: 6, zIndex: 10004, width: 190, maxWidth: 'calc(100% - 50px)', boxSizing: 'border-box', maxHeight: 'calc(100% - 12px)', overflowY: 'auto', overflowX: 'hidden', overflowWrap: 'anywhere', padding: collapsed?'9px 9px 0':9, border: '1px solid #61846e', borderRadius: 8, background: '#192e25', color: '#e3eddf', fontFamily: 'inherit', fontSize: 11 }}>\n    <style>{placesScrollCss}</style>\n    <div className=\"mly-places-panel-header\" style={{position:'sticky',top:0,zIndex:3,background:'#192e25',margin:'-9px -9px 4px',padding:'3px 7px',borderBottom:'1px solid #506b5a55',display:'flex',justifyContent:'space-between',alignItems:'center',gap:3}}>\n      <button type=\"button\" aria-label={t(collapsed?'uiPoiExpandPanel':'uiPoiCollapsePanel')} title={t(collapsed?'uiPoiExpandPanel':'uiPoiCollapsePanel')} aria-expanded={!collapsed} aria-controls={bodyId} onClick={toggleCollapsed} style={{minWidth:0,minHeight:30,flex:1,display:'flex',gap:4,alignItems:'center',padding:0,border:0,background:'transparent',color:'inherit',font:'inherit',textAlign:'start',cursor:'pointer'}}>\n        <strong style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t('uiNearbyPlaces')}</strong><span aria-hidden=\"true\">{collapsed?'▸':'▾'}</span>\n      </button>\n      {props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} title={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{minHeight:30,minWidth:30,padding:3,border:0,borderRadius:5,background:'transparent',color:'inherit',font:'inherit',opacity:searchDisabled?.45:1,cursor:searchDisabled?'default':'pointer'}}><span aria-hidden=\"true\">↻</span></button>}\n      <button type=\"button\" aria-label={t('uiCloseNearbyPlacesFilters')} onClick={props.onClose} style={{border:0,background:'none',color:'inherit',cursor:'pointer',padding:3,minWidth:30,minHeight:30}}>×</button>\n    </div>\n    <div id={bodyId} hidden={collapsed} style={{display:collapsed?'none':undefined}}>\n    {props.selection && <div style={{ marginTop: 6 }}><SelectedPlaceSummary {...props.selection}/></div>}\n    {props.tileLoading&&<p role=\"status\" style={{fontSize:10,margin:'6px 0'}}>{t('uiPoiUpdating')}</p>}\n    {props.tileSource?<details className=\"mly-place-filters\" style={{borderBottom:'1px solid #506b5a55',marginBottom:4}}><summary style={{cursor:'pointer',minHeight:30,padding:'6px 0',boxSizing:'border-box',fontSize:10}}>{t('uiFilterNearbyPlaces')}{qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all')>0&&<span style={{marginInlineStart:5,padding:'1px 5px',borderRadius:8,background:'#345c43'}}>{new Intl.NumberFormat(locale).format(qualityCount+Number(!!props.tileFamily&&props.tileFamily!=='all'))}</span>}</summary>{filterControls}{autoControl}</details>:filterControls}\n    <div role={props.tileSource?'region':undefined} aria-label={props.tileSource?t('uiLoadedPlaces'):undefined} style={props.tileSource?{marginTop:5}:undefined}>\n    <div style={props.tileSource?{display:'flex',gap:6,alignItems:'center',marginTop:5}:undefined}>\n    {!props.tileSource&&autoControl}\n    {!props.tileSource&&props.onSearch&&<button type=\"button\" aria-label={owned('Search this area')} aria-busy={props.status.kind==='loading'} disabled={searchDisabled} onClick={props.onSearch} style={{display:'block',width:'100%',flex:props.tileSource?1:undefined,minWidth:0,boxSizing:'border-box',minHeight:30,marginTop:props.tileSource?0:7,padding:'3px 6px',border:'1px solid #72947d',borderRadius:5,background:'#284b38',color:'inherit',font:'inherit',opacity:searchDisabled?.5:1,cursor:searchDisabled?'default':'pointer'}}>{props.status.kind==='loading'?t('uiFindingNearbyPlaces'):props.tileSource?t('uiSearch'):owned('Search this area')}</button>}\n    </div>\n"
            },
            {
              "label": "src/components/PlacesPanel.tsx 3",
              "before": "    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>\n      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>\n    </details>:<span style={{opacity:.7,fontSize:10}}>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</span>}\n  </section>;\n};\n",
              "after": "    </div>}\n\n    </div>\n    {props.tileSource?<details style={{borderTop:'1px solid #506b5a55',marginTop:5,fontSize:9,lineHeight:1.4,opacity:.85}}>\n      <summary style={{cursor:'pointer',minHeight:32,padding:'7px 0',boxSizing:'border-box'}}>{t('uiPoiHelpSource')}</summary>\n      <p>{t('uiTilesUpdateAutomatically')}</p><p>{owned(props.autoUpdate!==false?'Refresh after meaningful map movement.':'Use Search this area to load places.')}</p>\n      <p>{t('uiPoiScaleHint')} {t('uiPoiPagedHint')}</p><p>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</p>\n    </details>:<span style={{opacity:.7,fontSize:10}}>{t('uiSelectAPlaceForDetailsSourceOvertureMaps')}</span>}\n    </div>\n  </section>;\n};\n"
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
              "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};\nconst categoryModule={exports:{}};\nnew Function('exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/places/tileCategories.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(categoryModule.exports);\nconst CategoryPickerStub=()=>null;\nconst jsx=(type,props,...children)=>({type,props,children});\nfunction localRequire(name){\n if(name.endsWith('PlaceQualityControls'))return{PlaceQualityControls:()=>null};\n if(name.endsWith('TileCategoryPicker'))return{TileCategoryPicker:CategoryPickerStub};\n if(name.endsWith('tileCategories'))return categoryModule.exports;\n if(name==='jimu-core')return{React:{},jsx};\n if(name.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:key=>key,owned:value=>value,formatLocale:'en-US'})};\n if(name.endsWith('SelectedPlaceCard'))return{placesScrollCss:'',SelectedPlaceSummary:()=>null};\n if(name.endsWith('LoadedPlacesList'))return{LoadedPlacesList:()=>null};\n throw Error(name);\n}\nnew Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/PlacesPanel.tsx'),'utf8'),{fileName:'PlacesPanel.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,localRequire);\nconst flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value?.children?flatten(value.children):'';\ntest('tile mode describes loaded results without claiming the number of rendered map points',()=>{\n",
              "after": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};\nconst categoryModule={exports:{}};\nnew Function('exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/places/tileCategories.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(categoryModule.exports);\nconst CategoryPickerStub=()=>null;\nconst jsx=(type,props,...children)=>({type,props,children});\nconst panelHooks={collapsed:false};\nconst ReactStub={useState:initial=>[panelHooks.collapsed,value=>{panelHooks.collapsed=typeof value==='function'?value(panelHooks.collapsed):value}],useRef:value=>({current:value}),useId:()=> 'test-places-body',useEffect(){}};\nfunction localRequire(name){\n if(name.endsWith('PlaceQualityControls'))return{PlaceQualityControls:()=>null};\n if(name.endsWith('TileCategoryPicker'))return{TileCategoryPicker:CategoryPickerStub};\n if(name.endsWith('tileCategories'))return categoryModule.exports;\n if(name==='jimu-core')return{React:ReactStub,jsx};\n if(name.endsWith('WidgetLocale'))return{useWidgetLocale:()=>({t:key=>key,owned:value=>value,formatLocale:'en-US'})};\n if(name.endsWith('SelectedPlaceCard'))return{placesScrollCss:'',SelectedPlaceSummary:()=>null};\n if(name.endsWith('LoadedPlacesList'))return{LoadedPlacesList:()=>null};\n throw Error(name);\n}\nnew Function('exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/PlacesPanel.tsx'),'utf8'),{fileName:'PlacesPanel.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText)(m.exports,localRequire);\nconst flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value?.children?flatten(value.children):'';\ntest('tile mode describes loaded results without claiming the number of rendered map points',()=>{\n"
            },
            {
              "label": "tests/placesPanelRendering.test.cjs 2",
              "before": " const close=()=>{},refresh=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onSelect(){},onAreaSearch(){},onAutoUpdate(){},onSearch:refresh,onClose:close,onTileFamily(){},onTileQuality(){},tileFamily:'cafe',tileQuality:{minimum:.75,hideClosed:true},status:{kind:'ready',count:140,loadedCounts:{all:140}},group:'all',onGroup(){},onRetry(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const header=nodes.find(n=>n.props?.className==='mly-places-panel-header');assert.equal(header.props.style.position,'sticky');assert(flatten(header).includes('uiNearbyPlaces'));\n const childNodes=[];function collect(n){if(Array.isArray(n))n.forEach(collect);else if(n&&typeof n==='object'){childNodes.push(n);collect(n.children)}}collect(header);\n assert(childNodes.some(n=>n.props?.onClick===close));assert(childNodes.some(n=>n.props?.onClick===refresh));assert.equal(nodes.filter(n=>n.props?.onClick===refresh).length,1);\n const filters=nodes.find(n=>n.props?.className==='mly-place-filters');assert.equal(filters.type,'details');assert(!filters.props.open);assert(flatten(filters).includes('uiPoiQualityFilters'));assert(flatten(filters).includes('uiPoiAutoShort'));\n const list=nodes.find(n=>n.props?.defaultOpen===true);assert.equal(list.props.heading,'uiPoiResultRange');assert(!nodes.some(n=>n.type==='p'&&n.props?.role==='status'&&flatten(n)==='uiPoiResultRange'));\n});\n",
              "after": " const close=()=>{},refresh=()=>{},nodes=[],panel=m.exports.PlacesPanel({tileSource:true,onSelect(){},onAreaSearch(){},onAutoUpdate(){},onSearch:refresh,onClose:close,onTileFamily(){},onTileQuality(){},tileFamily:'cafe',tileQuality:{minimum:.75,hideClosed:true},status:{kind:'ready',count:140,loadedCounts:{all:140}},group:'all',onGroup(){},onRetry(){}});\n function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){nodes.push(n);walk(n.children)}}walk(panel);\n const header=nodes.find(n=>n.props?.className==='mly-places-panel-header');assert.equal(header.props.style.position,'sticky');assert(flatten(header).includes('uiNearbyPlaces'));\n const childNodes=[];function collect(n){if(Array.isArray(n))n.forEach(collect);else if(n&&typeof n==='object'){childNodes.push(n);collect(n.children)}}collect(header);\n assert(childNodes.some(n=>n.props?.onClick===close));assert(childNodes.some(n=>n.props?.onClick===refresh));assert.equal(nodes.filter(n=>n.props?.onClick===refresh).length,1);\n const filters=nodes.find(n=>n.props?.className==='mly-place-filters');assert.equal(filters.type,'details');assert(!filters.props.open);assert(flatten(filters).includes('uiPoiQualityFilters'));assert(flatten(filters).includes('uiPoiAutoShort'));\n const list=nodes.find(n=>n.props?.defaultOpen===true);assert.equal(list.props.heading,'uiPoiResultRange');assert(!nodes.some(n=>n.type==='p'&&n.props?.role==='status'&&flatten(n)==='uiPoiResultRange'));\n});\n\ntest('accordion collapse keeps the Places contents mounted and never closes or disables the layer',()=>{\n panelHooks.collapsed=false;let closed=0,hover;\n const props={tileSource:true,onClose:()=>closed++,onHover:value=>hover=value,onSelect(){},onAreaSearch(){},onSearch(){},status:{kind:'ready',count:140,loadedCounts:{all:140}},group:'all',onGroup(){},onRetry(){}};\n const collect=tree=>{const all=[];function walk(n){if(Array.isArray(n))n.forEach(walk);else if(n&&typeof n==='object'){all.push(n);walk(n.children)}}walk(tree);return all};\n let all=collect(m.exports.PlacesPanel(props)),toggle=all.find(n=>n.props?.['aria-controls']==='test-places-body');assert.equal(toggle.props['aria-expanded'],true);toggle.props.onClick();\n all=collect(m.exports.PlacesPanel(props));const body=all.find(n=>n.props?.id==='test-places-body');assert.equal(body.props.hidden,true);assert.equal(body.props.style.display,'none');assert(all.some(n=>n.props?.defaultOpen===true));assert.equal(closed,0);assert.equal(hover,null);\n toggle=all.find(n=>n.props?.['aria-controls']==='test-places-body');assert.equal(toggle.props['aria-label'],'uiPoiExpandPanel');toggle.props.onClick();\n all=collect(m.exports.PlacesPanel(props));assert.equal(all.find(n=>n.props?.id==='test-places-body').props.hidden,false);assert.equal(closed,0);panelHooks.collapsed=false;\n});\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n  \"uiPoiCollapsePanel\": \"Collapse Places panel\",\n  \"uiPoiExpandPanel\": \"Expand Places panel\",\n} as const;\nexport type RuntimeMessages = { [K in keyof typeof runtimeEn]: string };\n"
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
              "before": "\"runtime\",\"uiPoiAutoShort\",\"Auto\",\"Auto\",\"تلقائي\",\"Otomatik\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"自動\",\"자동\",\"自动\",\"自動\"\n\"runtime\",\"uiPoiSearchAreaPlaces\",\"Find a place in this area\",\"Find a place in this area\",\"ابحث عن مكان في هذه المنطقة\",\"Bu alanda yer ara\",\"Buscar un lugar en esta zona\",\"Rechercher un lieu dans cette zone\",\"Ort in diesem Bereich suchen\",\"Encontrar um local nesta área\",\"Trova un luogo in questa zona\",\"この範囲の場所を検索\",\"이 영역에서 장소 찾기\",\"查找此区域的地点\",\"尋找此區域的地點\"\n\"runtime\",\"uiPoiClearAreaSearch\",\"Clear area search\",\"Clear area search\",\"مسح البحث في المنطقة\",\"Alan aramasını temizle\",\"Borrar búsqueda de zona\",\"Effacer la recherche dans la zone\",\"Bereichssuche löschen\",\"Limpar pesquisa da área\",\"Cancella ricerca nella zona\",\"範囲内検索をクリア\",\"영역 검색 지우기\",\"清除区域搜索\",\"清除區域搜尋\"\n\"runtime\",\"uiPoiSearchAllAreaHint\",\"Search all matching places in this area.\",\"Search all matching places in this area.\",\"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\"Bu alandaki tüm eşleşen yerlerde arayın.\",\"Busca en todos los lugares coincidentes de esta zona.\",\"Recherchez parmi tous les lieux correspondants de cette zone.\",\"Alle passenden Orte in diesem Bereich durchsuchen.\",\"Pesquise todos os locais correspondentes nesta área.\",\"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\"この範囲の一致するすべての場所を検索します。\",\"이 영역의 일치하는 모든 장소를 검색합니다.\",\"搜索此区域内所有匹配的地点。\",\"搜尋此區域內所有相符的地點。\"\n\"runtime\",\"uiPoiNoSearchMatches\",\"No matching places in this area.\",\"No matching places in this area.\",\"لا توجد أماكن مطابقة في هذه المنطقة.\",\"Bu alanda eşleşen yer yok.\",\"No hay lugares coincidentes en esta zona.\",\"Aucun lieu correspondant dans cette zone.\",\"Keine passenden Orte in diesem Bereich.\",\"Nenhum local correspondente nesta área.\",\"Nessun luogo corrispondente in questa zona.\",\"この範囲に一致する場所はありません。\",\"이 영역에 일치하는 장소가 없습니다.\",\"此区域没有匹配的地点。\",\"此區域沒有相符的地點。\"\n\"runtime\",\"uiPoiClearShort\",\"Clear\",\"Clear\",\"مسح\",\"Temizle\",\"Limpiar\",\"Effacer\",\"Aufheben\",\"Limpar\",\"Deseleziona\",\"解除\",\"해제\",\"清除\",\"清除\"\n\"runtime\",\"uiPoiBooksMusicVideo\",\"Books, music & video\",\"Books, music & video\",\"الكتب والموسيقى والفيديو\",\"Kitap, müzik ve video\",\"Libros, música y vídeo\",\"Livres, musique et vidéo\",\"Bücher, Musik und Video\",\"Livros, música e vídeo\",\"Libri, musica e video\",\"書籍・音楽・映像\",\"도서, 음악 및 비디오\",\"图书、音乐与视频\",\"書籍、音樂與影片\"\n\"runtime\",\"uiPoiBookshop\",\"Bookshop\",\"Bookshop\",\"مكتبة لبيع الكتب\",\"Kitapçı\",\"Librería\",\"Librairie\",\"Buchhandlung\",\"Livraria\",\"Libreria\",\"書店\",\"서점\",\"书店\",\"書店\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n",
              "after": "\"runtime\",\"uiPoiAutoShort\",\"Auto\",\"Auto\",\"تلقائي\",\"Otomatik\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"Auto\",\"自動\",\"자동\",\"自动\",\"自動\"\n\"runtime\",\"uiPoiSearchAreaPlaces\",\"Find a place in this area\",\"Find a place in this area\",\"ابحث عن مكان في هذه المنطقة\",\"Bu alanda yer ara\",\"Buscar un lugar en esta zona\",\"Rechercher un lieu dans cette zone\",\"Ort in diesem Bereich suchen\",\"Encontrar um local nesta área\",\"Trova un luogo in questa zona\",\"この範囲の場所を検索\",\"이 영역에서 장소 찾기\",\"查找此区域的地点\",\"尋找此區域的地點\"\n\"runtime\",\"uiPoiClearAreaSearch\",\"Clear area search\",\"Clear area search\",\"مسح البحث في المنطقة\",\"Alan aramasını temizle\",\"Borrar búsqueda de zona\",\"Effacer la recherche dans la zone\",\"Bereichssuche löschen\",\"Limpar pesquisa da área\",\"Cancella ricerca nella zona\",\"範囲内検索をクリア\",\"영역 검색 지우기\",\"清除区域搜索\",\"清除區域搜尋\"\n\"runtime\",\"uiPoiSearchAllAreaHint\",\"Search all matching places in this area.\",\"Search all matching places in this area.\",\"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\"Bu alandaki tüm eşleşen yerlerde arayın.\",\"Busca en todos los lugares coincidentes de esta zona.\",\"Recherchez parmi tous les lieux correspondants de cette zone.\",\"Alle passenden Orte in diesem Bereich durchsuchen.\",\"Pesquise todos os locais correspondentes nesta área.\",\"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\"この範囲の一致するすべての場所を検索します。\",\"이 영역의 일치하는 모든 장소를 검색합니다.\",\"搜索此区域内所有匹配的地点。\",\"搜尋此區域內所有相符的地點。\"\n\"runtime\",\"uiPoiNoSearchMatches\",\"No matching places in this area.\",\"No matching places in this area.\",\"لا توجد أماكن مطابقة في هذه المنطقة.\",\"Bu alanda eşleşen yer yok.\",\"No hay lugares coincidentes en esta zona.\",\"Aucun lieu correspondant dans cette zone.\",\"Keine passenden Orte in diesem Bereich.\",\"Nenhum local correspondente nesta área.\",\"Nessun luogo corrispondente in questa zona.\",\"この範囲に一致する場所はありません。\",\"이 영역에 일치하는 장소가 없습니다.\",\"此区域没有匹配的地点。\",\"此區域沒有相符的地點。\"\n\"runtime\",\"uiPoiClearShort\",\"Clear\",\"Clear\",\"مسح\",\"Temizle\",\"Limpiar\",\"Effacer\",\"Aufheben\",\"Limpar\",\"Deseleziona\",\"解除\",\"해제\",\"清除\",\"清除\"\n\"runtime\",\"uiPoiBooksMusicVideo\",\"Books, music & video\",\"Books, music & video\",\"الكتب والموسيقى والفيديو\",\"Kitap, müzik ve video\",\"Libros, música y vídeo\",\"Livres, musique et vidéo\",\"Bücher, Musik und Video\",\"Livros, música e vídeo\",\"Libri, musica e video\",\"書籍・音楽・映像\",\"도서, 음악 및 비디오\",\"图书、音乐与视频\",\"書籍、音樂與影片\"\n\"runtime\",\"uiPoiBookshop\",\"Bookshop\",\"Bookshop\",\"مكتبة لبيع الكتب\",\"Kitapçı\",\"Librería\",\"Librairie\",\"Buchhandlung\",\"Livraria\",\"Libreria\",\"書店\",\"서점\",\"书店\",\"書店\"\n\"runtime\",\"uiPoiCollapsePanel\",\"Collapse Places panel\",\"Collapse Places panel\",\"طي لوحة الأماكن\",\"Yerler panelini daralt\",\"Contraer panel de lugares\",\"Réduire le panneau des lieux\",\"Orte-Bereich einklappen\",\"Recolher painel de locais\",\"Comprimi pannello dei luoghi\",\"場所パネルを折りたたむ\",\"장소 패널 접기\",\"折叠地点面板\",\"摺疊地點面板\"\n\"runtime\",\"uiPoiExpandPanel\",\"Expand Places panel\",\"Expand Places panel\",\"توسيع لوحة الأماكن\",\"Yerler panelini genişlet\",\"Expandir panel de lugares\",\"Développer le panneau des lieux\",\"Orte-Bereich ausklappen\",\"Expandir painel de locais\",\"Espandi pannello dei luoghi\",\"場所パネルを展開\",\"장소 패널 펼치기\",\"展开地点面板\",\"展開地點面板\"\n\"runtime\",\"date\",\"Date\",\"Date\",\"التاريخ\",\"Tarih\",\"Fecha\",\"Date\",\"Datum\",\"Data\",\"Data\",\"日付\",\"날짜\",\"日期\",\"日期\"\n\"runtime\",\"today\",\"Today\",\"Today\",\"اليوم\",\"Bugün\",\"Hoy\",\"Aujourd’hui\",\"Heute\",\"Hoje\",\"Oggi\",\"今日\",\"오늘\",\"今天\",\"今天\"\n\"runtime\",\"previousYear\",\"Previous year\",\"Previous year\",\"السنة السابقة\",\"Önceki yıl\",\"Año anterior\",\"Année précédente\",\"Vorheriges Jahr\",\"Ano anterior\",\"Anno precedente\",\"前年\",\"이전 연도\",\"上一年\",\"上一年\"\n\"runtime\",\"nextYear\",\"Next year\",\"Next year\",\"السنة التالية\",\"Sonraki yıl\",\"Año siguiente\",\"Année suivante\",\"Nächstes Jahr\",\"Próximo ano\",\"Anno successivo\",\"翌年\",\"다음 연도\",\"下一年\",\"下一年\"\n\"runtime\",\"previousMonth\",\"Previous month\",\"Previous month\",\"الشهر السابق\",\"Önceki ay\",\"Mes anterior\",\"Mois précédent\",\"Vorheriger Monat\",\"Mês anterior\",\"Mese precedente\",\"前月\",\"이전 달\",\"上个月\",\"上個月\"\n\"runtime\",\"nextMonth\",\"Next month\",\"Next month\",\"الشهر التالي\",\"Sonraki ay\",\"Mes siguiente\",\"Mois suivant\",\"Nächster Monat\",\"Próximo mês\",\"Mese successivo\",\"翌月\",\"다음 달\",\"下个月\",\"下個月\"\n\"runtime\",\"onFoot\",\"On foot\",\"On foot\",\"سيرًا على الأقدام\",\"Yaya\",\"A pie\",\"À pied\",\"Zu Fuß\",\"A pé\",\"A piedi\",\"徒歩\",\"도보\",\"步行\",\"步行\"\n\"runtime\",\"otherTravel\",\"Other travel\",\"Other travel\",\"وسائل أخرى\",\"Diğer\",\"Otro transporte\",\"Autre déplacement\",\"Sonstige Fortbewegung\",\"Outro transporte\",\"Altro trasporto\",\"その他の移動手段\",\"기타 이동 수단\",\"其他出行方式\",\"其他移動方式\"\n"
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
              "before": "  \"uiPoiAutoShort\": \"تلقائي\",\n  \"uiPoiSearchAreaPlaces\": \"ابحث عن مكان في هذه المنطقة\",\n  \"uiPoiClearAreaSearch\": \"مسح البحث في المنطقة\",\n  \"uiPoiSearchAllAreaHint\": \"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\n  \"uiPoiNoSearchMatches\": \"لا توجد أماكن مطابقة في هذه المنطقة.\",\n  \"uiPoiClearShort\": \"مسح\",\n  \"uiPoiBooksMusicVideo\": \"الكتب والموسيقى والفيديو\",\n  \"uiPoiBookshop\": \"مكتبة لبيع الكتب\",\n};\nexport default ar;\n",
              "after": "  \"uiPoiAutoShort\": \"تلقائي\",\n  \"uiPoiSearchAreaPlaces\": \"ابحث عن مكان في هذه المنطقة\",\n  \"uiPoiClearAreaSearch\": \"مسح البحث في المنطقة\",\n  \"uiPoiSearchAllAreaHint\": \"ابحث في جميع الأماكن المطابقة في هذه المنطقة.\",\n  \"uiPoiNoSearchMatches\": \"لا توجد أماكن مطابقة في هذه المنطقة.\",\n  \"uiPoiClearShort\": \"مسح\",\n  \"uiPoiBooksMusicVideo\": \"الكتب والموسيقى والفيديو\",\n  \"uiPoiBookshop\": \"مكتبة لبيع الكتب\",\n  \"uiPoiCollapsePanel\": \"طي لوحة الأماكن\",\n  \"uiPoiExpandPanel\": \"توسيع لوحة الأماكن\",\n};\nexport default ar;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Ort in diesem Bereich suchen\",\n  \"uiPoiClearAreaSearch\": \"Bereichssuche löschen\",\n  \"uiPoiSearchAllAreaHint\": \"Alle passenden Orte in diesem Bereich durchsuchen.\",\n  \"uiPoiNoSearchMatches\": \"Keine passenden Orte in diesem Bereich.\",\n  \"uiPoiClearShort\": \"Aufheben\",\n  \"uiPoiBooksMusicVideo\": \"Bücher, Musik und Video\",\n  \"uiPoiBookshop\": \"Buchhandlung\",\n};\nexport default de;\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Ort in diesem Bereich suchen\",\n  \"uiPoiClearAreaSearch\": \"Bereichssuche löschen\",\n  \"uiPoiSearchAllAreaHint\": \"Alle passenden Orte in diesem Bereich durchsuchen.\",\n  \"uiPoiNoSearchMatches\": \"Keine passenden Orte in diesem Bereich.\",\n  \"uiPoiClearShort\": \"Aufheben\",\n  \"uiPoiBooksMusicVideo\": \"Bücher, Musik und Video\",\n  \"uiPoiBookshop\": \"Buchhandlung\",\n  \"uiPoiCollapsePanel\": \"Orte-Bereich einklappen\",\n  \"uiPoiExpandPanel\": \"Orte-Bereich ausklappen\",\n};\nexport default de;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n};\nexport default overrides;\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Find a place in this area\",\n  \"uiPoiClearAreaSearch\": \"Clear area search\",\n  \"uiPoiSearchAllAreaHint\": \"Search all matching places in this area.\",\n  \"uiPoiNoSearchMatches\": \"No matching places in this area.\",\n  \"uiPoiClearShort\": \"Clear\",\n  \"uiPoiBooksMusicVideo\": \"Books, music & video\",\n  \"uiPoiBookshop\": \"Bookshop\",\n  \"uiPoiCollapsePanel\": \"Collapse Places panel\",\n  \"uiPoiExpandPanel\": \"Expand Places panel\",\n};\nexport default overrides;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Buscar un lugar en esta zona\",\n  \"uiPoiClearAreaSearch\": \"Borrar búsqueda de zona\",\n  \"uiPoiSearchAllAreaHint\": \"Busca en todos los lugares coincidentes de esta zona.\",\n  \"uiPoiNoSearchMatches\": \"No hay lugares coincidentes en esta zona.\",\n  \"uiPoiClearShort\": \"Limpiar\",\n  \"uiPoiBooksMusicVideo\": \"Libros, música y vídeo\",\n  \"uiPoiBookshop\": \"Librería\",\n};\nexport default es;\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Buscar un lugar en esta zona\",\n  \"uiPoiClearAreaSearch\": \"Borrar búsqueda de zona\",\n  \"uiPoiSearchAllAreaHint\": \"Busca en todos los lugares coincidentes de esta zona.\",\n  \"uiPoiNoSearchMatches\": \"No hay lugares coincidentes en esta zona.\",\n  \"uiPoiClearShort\": \"Limpiar\",\n  \"uiPoiBooksMusicVideo\": \"Libros, música y vídeo\",\n  \"uiPoiBookshop\": \"Librería\",\n  \"uiPoiCollapsePanel\": \"Contraer panel de lugares\",\n  \"uiPoiExpandPanel\": \"Expandir panel de lugares\",\n};\nexport default es;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Rechercher un lieu dans cette zone\",\n  \"uiPoiClearAreaSearch\": \"Effacer la recherche dans la zone\",\n  \"uiPoiSearchAllAreaHint\": \"Recherchez parmi tous les lieux correspondants de cette zone.\",\n  \"uiPoiNoSearchMatches\": \"Aucun lieu correspondant dans cette zone.\",\n  \"uiPoiClearShort\": \"Effacer\",\n  \"uiPoiBooksMusicVideo\": \"Livres, musique et vidéo\",\n  \"uiPoiBookshop\": \"Librairie\",\n};\nexport default fr;\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Rechercher un lieu dans cette zone\",\n  \"uiPoiClearAreaSearch\": \"Effacer la recherche dans la zone\",\n  \"uiPoiSearchAllAreaHint\": \"Recherchez parmi tous les lieux correspondants de cette zone.\",\n  \"uiPoiNoSearchMatches\": \"Aucun lieu correspondant dans cette zone.\",\n  \"uiPoiClearShort\": \"Effacer\",\n  \"uiPoiBooksMusicVideo\": \"Livres, musique et vidéo\",\n  \"uiPoiBookshop\": \"Librairie\",\n  \"uiPoiCollapsePanel\": \"Réduire le panneau des lieux\",\n  \"uiPoiExpandPanel\": \"Développer le panneau des lieux\",\n};\nexport default fr;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Trova un luogo in questa zona\",\n  \"uiPoiClearAreaSearch\": \"Cancella ricerca nella zona\",\n  \"uiPoiSearchAllAreaHint\": \"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\n  \"uiPoiNoSearchMatches\": \"Nessun luogo corrispondente in questa zona.\",\n  \"uiPoiClearShort\": \"Deseleziona\",\n  \"uiPoiBooksMusicVideo\": \"Libri, musica e video\",\n  \"uiPoiBookshop\": \"Libreria\",\n};\nexport default it;\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Trova un luogo in questa zona\",\n  \"uiPoiClearAreaSearch\": \"Cancella ricerca nella zona\",\n  \"uiPoiSearchAllAreaHint\": \"Cerca tra tutti i luoghi corrispondenti in questa zona.\",\n  \"uiPoiNoSearchMatches\": \"Nessun luogo corrispondente in questa zona.\",\n  \"uiPoiClearShort\": \"Deseleziona\",\n  \"uiPoiBooksMusicVideo\": \"Libri, musica e video\",\n  \"uiPoiBookshop\": \"Libreria\",\n  \"uiPoiCollapsePanel\": \"Comprimi pannello dei luoghi\",\n  \"uiPoiExpandPanel\": \"Espandi pannello dei luoghi\",\n};\nexport default it;\n"
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
              "before": "  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"この範囲の場所を検索\",\n  \"uiPoiClearAreaSearch\": \"範囲内検索をクリア\",\n  \"uiPoiSearchAllAreaHint\": \"この範囲の一致するすべての場所を検索します。\",\n  \"uiPoiNoSearchMatches\": \"この範囲に一致する場所はありません。\",\n  \"uiPoiClearShort\": \"解除\",\n  \"uiPoiBooksMusicVideo\": \"書籍・音楽・映像\",\n  \"uiPoiBookshop\": \"書店\",\n};\nexport default ja;\n",
              "after": "  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"この範囲の場所を検索\",\n  \"uiPoiClearAreaSearch\": \"範囲内検索をクリア\",\n  \"uiPoiSearchAllAreaHint\": \"この範囲の一致するすべての場所を検索します。\",\n  \"uiPoiNoSearchMatches\": \"この範囲に一致する場所はありません。\",\n  \"uiPoiClearShort\": \"解除\",\n  \"uiPoiBooksMusicVideo\": \"書籍・音楽・映像\",\n  \"uiPoiBookshop\": \"書店\",\n  \"uiPoiCollapsePanel\": \"場所パネルを折りたたむ\",\n  \"uiPoiExpandPanel\": \"場所パネルを展開\",\n};\nexport default ja;\n"
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
              "before": "  \"uiPoiAutoShort\": \"자동\",\n  \"uiPoiSearchAreaPlaces\": \"이 영역에서 장소 찾기\",\n  \"uiPoiClearAreaSearch\": \"영역 검색 지우기\",\n  \"uiPoiSearchAllAreaHint\": \"이 영역의 일치하는 모든 장소를 검색합니다.\",\n  \"uiPoiNoSearchMatches\": \"이 영역에 일치하는 장소가 없습니다.\",\n  \"uiPoiClearShort\": \"해제\",\n  \"uiPoiBooksMusicVideo\": \"도서, 음악 및 비디오\",\n  \"uiPoiBookshop\": \"서점\",\n};\nexport default ko;\n",
              "after": "  \"uiPoiAutoShort\": \"자동\",\n  \"uiPoiSearchAreaPlaces\": \"이 영역에서 장소 찾기\",\n  \"uiPoiClearAreaSearch\": \"영역 검색 지우기\",\n  \"uiPoiSearchAllAreaHint\": \"이 영역의 일치하는 모든 장소를 검색합니다.\",\n  \"uiPoiNoSearchMatches\": \"이 영역에 일치하는 장소가 없습니다.\",\n  \"uiPoiClearShort\": \"해제\",\n  \"uiPoiBooksMusicVideo\": \"도서, 음악 및 비디오\",\n  \"uiPoiBookshop\": \"서점\",\n  \"uiPoiCollapsePanel\": \"장소 패널 접기\",\n  \"uiPoiExpandPanel\": \"장소 패널 펼치기\",\n};\nexport default ko;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Encontrar um local nesta área\",\n  \"uiPoiClearAreaSearch\": \"Limpar pesquisa da área\",\n  \"uiPoiSearchAllAreaHint\": \"Pesquise todos os locais correspondentes nesta área.\",\n  \"uiPoiNoSearchMatches\": \"Nenhum local correspondente nesta área.\",\n  \"uiPoiClearShort\": \"Limpar\",\n  \"uiPoiBooksMusicVideo\": \"Livros, música e vídeo\",\n  \"uiPoiBookshop\": \"Livraria\",\n};\nexport default ptBR;\n",
              "after": "  \"uiPoiAutoShort\": \"Auto\",\n  \"uiPoiSearchAreaPlaces\": \"Encontrar um local nesta área\",\n  \"uiPoiClearAreaSearch\": \"Limpar pesquisa da área\",\n  \"uiPoiSearchAllAreaHint\": \"Pesquise todos os locais correspondentes nesta área.\",\n  \"uiPoiNoSearchMatches\": \"Nenhum local correspondente nesta área.\",\n  \"uiPoiClearShort\": \"Limpar\",\n  \"uiPoiBooksMusicVideo\": \"Livros, música e vídeo\",\n  \"uiPoiBookshop\": \"Livraria\",\n  \"uiPoiCollapsePanel\": \"Recolher painel de locais\",\n  \"uiPoiExpandPanel\": \"Expandir painel de locais\",\n};\nexport default ptBR;\n"
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
              "before": "  \"uiPoiAutoShort\": \"Otomatik\",\n  \"uiPoiSearchAreaPlaces\": \"Bu alanda yer ara\",\n  \"uiPoiClearAreaSearch\": \"Alan aramasını temizle\",\n  \"uiPoiSearchAllAreaHint\": \"Bu alandaki tüm eşleşen yerlerde arayın.\",\n  \"uiPoiNoSearchMatches\": \"Bu alanda eşleşen yer yok.\",\n  \"uiPoiClearShort\": \"Temizle\",\n  \"uiPoiBooksMusicVideo\": \"Kitap, müzik ve video\",\n  \"uiPoiBookshop\": \"Kitapçı\",\n};\nexport default tr;\n",
              "after": "  \"uiPoiAutoShort\": \"Otomatik\",\n  \"uiPoiSearchAreaPlaces\": \"Bu alanda yer ara\",\n  \"uiPoiClearAreaSearch\": \"Alan aramasını temizle\",\n  \"uiPoiSearchAllAreaHint\": \"Bu alandaki tüm eşleşen yerlerde arayın.\",\n  \"uiPoiNoSearchMatches\": \"Bu alanda eşleşen yer yok.\",\n  \"uiPoiClearShort\": \"Temizle\",\n  \"uiPoiBooksMusicVideo\": \"Kitap, müzik ve video\",\n  \"uiPoiBookshop\": \"Kitapçı\",\n  \"uiPoiCollapsePanel\": \"Yerler panelini daralt\",\n  \"uiPoiExpandPanel\": \"Yerler panelini genişlet\",\n};\nexport default tr;\n"
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
              "before": "  \"uiPoiAutoShort\": \"自动\",\n  \"uiPoiSearchAreaPlaces\": \"查找此区域的地点\",\n  \"uiPoiClearAreaSearch\": \"清除区域搜索\",\n  \"uiPoiSearchAllAreaHint\": \"搜索此区域内所有匹配的地点。\",\n  \"uiPoiNoSearchMatches\": \"此区域没有匹配的地点。\",\n  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"图书、音乐与视频\",\n  \"uiPoiBookshop\": \"书店\",\n};\nexport default zhCN;\n",
              "after": "  \"uiPoiAutoShort\": \"自动\",\n  \"uiPoiSearchAreaPlaces\": \"查找此区域的地点\",\n  \"uiPoiClearAreaSearch\": \"清除区域搜索\",\n  \"uiPoiSearchAllAreaHint\": \"搜索此区域内所有匹配的地点。\",\n  \"uiPoiNoSearchMatches\": \"此区域没有匹配的地点。\",\n  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"图书、音乐与视频\",\n  \"uiPoiBookshop\": \"书店\",\n  \"uiPoiCollapsePanel\": \"折叠地点面板\",\n  \"uiPoiExpandPanel\": \"展开地点面板\",\n};\nexport default zhCN;\n"
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
              "before": "  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"尋找此區域的地點\",\n  \"uiPoiClearAreaSearch\": \"清除區域搜尋\",\n  \"uiPoiSearchAllAreaHint\": \"搜尋此區域內所有相符的地點。\",\n  \"uiPoiNoSearchMatches\": \"此區域沒有相符的地點。\",\n  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"書籍、音樂與影片\",\n  \"uiPoiBookshop\": \"書店\",\n};\nexport default zhTW;\n",
              "after": "  \"uiPoiAutoShort\": \"自動\",\n  \"uiPoiSearchAreaPlaces\": \"尋找此區域的地點\",\n  \"uiPoiClearAreaSearch\": \"清除區域搜尋\",\n  \"uiPoiSearchAllAreaHint\": \"搜尋此區域內所有相符的地點。\",\n  \"uiPoiNoSearchMatches\": \"此區域沒有相符的地點。\",\n  \"uiPoiClearShort\": \"清除\",\n  \"uiPoiBooksMusicVideo\": \"書籍、音樂與影片\",\n  \"uiPoiBookshop\": \"書店\",\n  \"uiPoiCollapsePanel\": \"摺疊地點面板\",\n  \"uiPoiExpandPanel\": \"展開地點面板\",\n};\nexport default zhTW;\n"
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
const prefix = 'overture-places-collapse-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Places panel accordion installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-places-collapse' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Places panel accordion installation)');
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
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Places panel accordion installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Places panel accordion installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-places-collapse.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'Places panel accordion is already uninstalled. No files changed.' : 'Places panel accordion is already installed. No files changed.');
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
  const manifest = { installer: 'overture-places-collapse', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places panel accordion ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
