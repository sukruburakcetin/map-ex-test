/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { PresentationText, Presentation, presentationFormatter, TextValues } from './PresentationText';
import { startupMessages, languageName } from './startupMessages';
import { en, MessageKey, Messages } from './messages';
import { requestedLanguage, preferenceOf, LanguagePreference, message, WidgetLanguage } from './core';
export interface LocaleValue {
 presentation: Presentation; owned(source:string,values?:TextValues):string;
 builderControlled?: boolean; allowSwitch: boolean; locale: WidgetLanguage; preference: LanguagePreference; loading: boolean; failed: boolean;
 setPreference(value: LanguagePreference): void; retry(): void;
 t(key: MessageKey, values?: Record<string,string|number>): string;
}
export const WidgetLocaleContext = React.createContext<LocaleValue>({presentation:new PresentationText(),owned:(source)=>source,allowSwitch:false,locale:'en',preference:'auto',loading:false,failed:false,setPreference(){},retry(){},t:(key,values)=>message(en,key,values)});
// No new localization framework. Experience Builder supplies appLocale; Intl formats values.
const loadCatalog = (language: 'tr'|'es'|'fr'|'de'|'pt-BR'|'it'|'ja'|'ko'|'zh-CN'|'zh-TW') => language === 'zh-TW'
 ? import(/* webpackChunkName: "mapillary-locale-zh-tw" */ './locales/zh-tw').then(module=>module.default)
 : language === 'zh-CN'
 ? import(/* webpackChunkName: "mapillary-locale-zh-cn" */ './locales/zh-cn').then(module=>module.default)
 : language === 'ko'
 ? import(/* webpackChunkName: "mapillary-locale-ko" */ './locales/ko').then(module=>module.default)
 : language === 'ja'
 ? import(/* webpackChunkName: "mapillary-locale-ja" */ './locales/ja').then(module=>module.default)
 : language === 'it'
 ? import(/* webpackChunkName: "mapillary-locale-it" */ './locales/it').then(module=>module.default)
 : language === 'pt-BR'
 ? import(/* webpackChunkName: "mapillary-locale-pt-br" */ './locales/pt-br').then(module=>module.default)
 : language === 'de'
 ? import(/* webpackChunkName: "mapillary-locale-de" */ './locales/de').then(module=>module.default)
 : language === 'fr'
 ? import(/* webpackChunkName: "mapillary-locale-fr" */ './locales/fr').then(module=>module.default)
 : language === 'es'
 ? import(/* webpackChunkName: "mapillary-locale-es" */ './locales/es').then(module=>module.default)
 : import(/* webpackChunkName: "mapillary-locale-tr" */ './locales/tr').then(module=>module.default);
const loadedCatalogs:Partial<Record<WidgetLanguage,Messages>>={en};
export const WidgetLocaleProvider: React.FC<{appLocale?:string;widgetId:string;defaultLanguage?:LanguagePreference;allowUserChoice?:boolean;children:React.ReactNode}> = ({appLocale,widgetId,defaultLanguage='auto',allowUserChoice=true,children}) => {
 const storageKey=`mapillary-language-v1:${widgetId}`;
 const [preference,setLanguage]=React.useState<LanguagePreference>(()=>{try{return preferenceOf(localStorage.getItem(storageKey))}catch{return 'auto'}});
 const requested=requestedLanguage(appLocale,defaultLanguage,preference,allowUserChoice);
 const [catalog,setCatalog]=React.useState<{locale:WidgetLanguage;messages:Messages}>(()=>({locale:requested,messages:loadedCatalogs[requested] || {...en,...startupMessages[requested]}}));
 const [loading,setLoading]=React.useState(requested!=='en'&&!loadedCatalogs[requested]),[failed,setFailed]=React.useState(false),[attempt,setAttempt]=React.useState(0);
 const presentation=React.useRef(new PresentationText()).current;
 const known=React.useRef<Messages[]>(Object.values(loadedCatalogs).filter((catalog):catalog is Messages=>!!catalog));
 React.useEffect(()=>{
  let active=true;setFailed(false);
  const cached=loadedCatalogs[requested];
  if(cached){if(!known.current.includes(cached))known.current.push(cached);setCatalog({locale:requested,messages:cached});setLoading(false);return()=>{active=false};}
  setLoading(true);
  loadCatalog(requested).then(messages=>{loadedCatalogs[requested]=messages;if(active){if(!known.current.includes(messages))known.current.push(messages);setCatalog({locale:requested,messages});setLoading(false)}}).catch(()=>{if(active){setCatalog({locale:'en',messages:en});setLoading(false);setFailed(true)}});
  return()=>{active=false};
 },[requested,attempt]);
 const setPreference=React.useCallback((value:LanguagePreference)=>{
  if(!allowUserChoice || preferenceOf(defaultLanguage)!=='auto')return;
  const next=preferenceOf(value);setLanguage(next);try{if(next==='auto')localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,next)}catch{/* Language still works with storage disabled. */}
 },[storageKey,allowUserChoice,defaultLanguage]);
 const retry=React.useCallback(()=>setAttempt(value=>value+1),[]);
 const owned=React.useMemo(()=>presentationFormatter(en,catalog.messages,known.current),[catalog]);
 React.useLayoutEffect(()=>{presentation.update(catalog.locale,owned)},[catalog,owned,presentation]);
 React.useEffect(()=>()=>presentation.clear(),[presentation]);
 const value=React.useMemo<LocaleValue>(()=>({presentation,owned,allowSwitch:allowUserChoice,locale:catalog.locale,preference:preferenceOf(defaultLanguage)!=='auto'?preferenceOf(defaultLanguage):preference,builderControlled:preferenceOf(defaultLanguage)!=='auto',loading,failed,setPreference,retry,t:(key,values)=>message(catalog.messages,key,values)}),[catalog,preference,loading,failed,setPreference,retry,allowUserChoice,presentation,owned,defaultLanguage]);
 return <WidgetLocaleContext.Provider value={value}>{children}</WidgetLocaleContext.Provider>;
};
export const useWidgetLocale = (): LocaleValue => React.useContext(WidgetLocaleContext);
export const LanguageChoice: React.FC = () => {
 const {t,locale,preference,setPreference,loading,failed,retry,allowSwitch,builderControlled}=useWidgetLocale();
 if(!allowSwitch)return null;
 return <div style={{padding:'6px 8px',fontSize:12}}>
  <label style={{display:'grid',gap:4}}>{t('language')}<select aria-label={t('language')} value={preference} disabled={builderControlled} onChange={event=>setPreference(preferenceOf(event.target.value))} style={{width:'100%',minWidth:0,color:'#172b22',background:'#fff',font:'inherit',padding:4}}>
   <option value="auto">{t('automatic')}</option>{(['en','tr','es','fr','de','pt-BR','it','ja','ko','zh-CN','zh-TW'] as const).map(language=><option key={language} value={language} lang={locale}>{languageName(locale,language)}</option>)}
  </select></label>
  {loading&&<span role="status">{t('languageLoading')}</span>}
  {failed&&<div role="status">{t('languageError')} <button type="button" onClick={retry}>{t('retryLanguage')}</button></div>}
 </div>;
};

/** Render widget-owned JSX and bind imperative notices to this instance's locale. */
export const LocaleContent: React.FC<{render:(locale:LocaleValue)=>React.ReactNode;onCommit?:(locale:LocaleValue)=>void}> = ({render,onCommit}) => {
 const locale=useWidgetLocale();React.useLayoutEffect(()=>{onCommit?.(locale)},[locale,onCommit]);return <React.Fragment>{render(locale)}</React.Fragment>;
};

/** Stored React feedback follows locale changes without changing its captured data parameters. */
export const OwnedMessage: React.FC<{source:string;values?:TextValues}> = ({source,values}) => {
 const {owned,locale}=useWidgetLocale();const numeric=React.useMemo(()=>new Intl.NumberFormat(locale),[locale]);
 const parameters=values&&Object.fromEntries(Object.entries(values).map(([key,value])=>[key,typeof value==='number'?numeric.format(value):value]));
 return <React.Fragment>{owned(source,parameters)}</React.Fragment>;
};
export const OwnedNumber: React.FC<{value:number;options?:Intl.NumberFormatOptions}> = ({value,options}) => {
 const {locale}=useWidgetLocale();const formatter=React.useMemo(()=>new Intl.NumberFormat(locale,options),[locale,options]);return <React.Fragment>{formatter.format(value)}</React.Fragment>;
};
