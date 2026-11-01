/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { PresentationText, Presentation, presentationFormatter, TextValues } from './PresentationText';
import { en, MessageKey, Messages } from './messages';
import { requestedLanguage, preferenceOf, LanguagePreference, message, WidgetLanguage } from './core';
export interface LocaleValue {
 presentation: Presentation; owned(source:string,values?:TextValues):string;
 allowSwitch: boolean; locale: WidgetLanguage; preference: LanguagePreference; loading: boolean; failed: boolean;
 setPreference(value: LanguagePreference): void; retry(): void;
 t(key: MessageKey, values?: Record<string,string|number>): string;
}
export const WidgetLocaleContext = React.createContext<LocaleValue>({presentation:new PresentationText(),owned:(source)=>source,allowSwitch:false,locale:'en',preference:'auto',loading:false,failed:false,setPreference(){},retry(){},t:(key,values)=>message(en,key,values)});
// No new localization framework. Experience Builder supplies appLocale; Intl formats values.
const loadTurkish = () => import(/* webpackChunkName: "mapillary-locale-tr" */ './locales/tr').then(module=>module.default);
export const WidgetLocaleProvider: React.FC<{appLocale?:string;widgetId:string;defaultLanguage?:LanguagePreference;allowUserChoice?:boolean;children:React.ReactNode}> = ({appLocale,widgetId,defaultLanguage='auto',allowUserChoice=true,children}) => {
 const storageKey=`mapillary-language-v1:${widgetId}`;
 const [preference,setLanguage]=React.useState<LanguagePreference>(()=>{try{return preferenceOf(localStorage.getItem(storageKey))}catch{return 'auto'}});
 const [catalog,setCatalog]=React.useState<{locale:WidgetLanguage;messages:Messages}>({locale:'en',messages:en});
 const [loading,setLoading]=React.useState(false),[failed,setFailed]=React.useState(false),[attempt,setAttempt]=React.useState(0);
 const presentation=React.useRef(new PresentationText()).current;
 const known=React.useRef<Messages[]>([]);
 const requested=requestedLanguage(appLocale,defaultLanguage,preference,allowUserChoice);
 React.useEffect(()=>{
  let active=true;setFailed(false);
  if(requested==='en'){setCatalog({locale:'en',messages:en});setLoading(false);return()=>{active=false};}
  setCatalog({locale:'en',messages:en});setLoading(true);
  loadTurkish().then(messages=>{if(active){if(!known.current.includes(messages))known.current.push(messages);setCatalog({locale:'tr',messages});setLoading(false)}}).catch(()=>{if(active){setLoading(false);setFailed(true)}});
  return()=>{active=false};
 },[requested,attempt]);
 const setPreference=React.useCallback((value:LanguagePreference)=>{
  if(!allowUserChoice)return;
  const next=preferenceOf(value);setLanguage(next);try{if(next==='auto')localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,next)}catch{/* Language still works with storage disabled. */}
 },[storageKey,allowUserChoice]);
 const retry=React.useCallback(()=>setAttempt(value=>value+1),[]);
 const owned=React.useMemo(()=>presentationFormatter(en,catalog.messages,known.current),[catalog]);
 React.useLayoutEffect(()=>{presentation.update(catalog.locale,owned)},[catalog,owned,presentation]);
 React.useEffect(()=>()=>presentation.clear(),[presentation]);
 const value=React.useMemo<LocaleValue>(()=>({presentation,owned,allowSwitch:allowUserChoice,locale:catalog.locale,preference,loading,failed,setPreference,retry,t:(key,values)=>message(catalog.messages,key,values)}),[catalog,preference,loading,failed,setPreference,retry,allowUserChoice,presentation,owned]);
 return <WidgetLocaleContext.Provider value={value}>{children}</WidgetLocaleContext.Provider>;
};
export const useWidgetLocale = (): LocaleValue => React.useContext(WidgetLocaleContext);
export const LanguageChoice: React.FC = () => {
 const {t,preference,setPreference,loading,failed,retry,allowSwitch}=useWidgetLocale();
 if(!allowSwitch)return null;
 return <div style={{padding:'6px 8px',fontSize:12}}>
  <label style={{display:'grid',gap:4}}>{t('language')}<select aria-label={t('language')} value={preference} onChange={event=>setPreference(preferenceOf(event.target.value))} style={{width:'100%',minWidth:0,color:'#172b22',background:'#fff',font:'inherit',padding:4}}>
   <option value="auto">{t('automatic')}</option><option value="en" lang="en">English</option><option value="tr" lang="tr">Türkçe</option>
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
