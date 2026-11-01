/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from './WidgetLocale';
import { SettingsKey, SettingsMessages, settingsEn } from './settingsMessages';
import type { WidgetLanguage } from './core';
export const SettingsLocaleContext = React.createContext<{locale:WidgetLanguage;t(key:SettingsKey):string;owned(source:string):string}>({locale:'en',t:key=>settingsEn[key],owned:source=>source});
export const SettingsCatalogProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
 const {locale,t,owned,failed:baseFailed,retry:retryBase}=useWidgetLocale();
 const [catalog,setCatalog]=React.useState<{locale:WidgetLanguage;messages:SettingsMessages}>({locale:'en',messages:settingsEn});
 const [failed,setFailed]=React.useState(false),[attempt,setAttempt]=React.useState(0);
 React.useEffect(()=>{
  let active=true;setFailed(false);
  if(locale==='en'){setCatalog({locale:'en',messages:settingsEn});return()=>{active=false};}
  setCatalog({locale:'en',messages:settingsEn});
  const pending=locale==='es' ? import(/* webpackChunkName: "mapillary-settings-es" */ './locales/settings-es') : import(/* webpackChunkName: "mapillary-settings-tr" */ './locales/settings-tr');
  pending.then(module=>{if(active)setCatalog({locale,messages:module.default})}).catch(()=>{if(active)setFailed(true)});
  return()=>{active=false};
 },[locale,attempt]);
 const value=React.useMemo(()=>({locale:catalog.locale,owned,t:(key:SettingsKey)=>catalog.messages[key]||settingsEn[key]}),[catalog,owned]);
 return <SettingsLocaleContext.Provider value={value}>
  {(failed||baseFailed)&&<div role="status" style={{padding:8}}>{t('languageError')} <button type="button" onClick={()=>{if(baseFailed)retryBase();else setAttempt(n=>n+1)}}>{t('retryLanguage')}</button></div>}
  {children}
 </SettingsLocaleContext.Provider>;
};
