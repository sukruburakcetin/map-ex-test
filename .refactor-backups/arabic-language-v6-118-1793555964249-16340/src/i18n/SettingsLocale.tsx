/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from './WidgetLocale';
import { SettingsKey, SettingsMessages, settingsEn } from './settingsMessages';
import { startupSettings } from './startupMessages';
import type { WidgetLanguage } from './core';
export const SettingsLocaleContext = React.createContext<{locale:WidgetLanguage;t(key:SettingsKey):string;owned(source:string):string}>({locale:'en',t:key=>settingsEn[key],owned:source=>source});
const loadedSettings:Partial<Record<WidgetLanguage,SettingsMessages>>={en:settingsEn};
export const SettingsCatalogProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
 const {locale,t,owned,failed:baseFailed,retry:retryBase}=useWidgetLocale();
 const [settledCatalog,setCatalog]=React.useState<{requested:WidgetLanguage;locale:WidgetLanguage;messages:SettingsMessages}>(()=>({requested:locale,locale,messages:loadedSettings[locale] || {...settingsEn,...startupSettings[locale]}}));
 const catalog=React.useMemo(()=>settledCatalog.requested===locale?settledCatalog:{requested:locale,locale,messages:loadedSettings[locale] || {...settingsEn,...startupSettings[locale]}},[settledCatalog,locale]);
 const [failed,setFailed]=React.useState(false),[attempt,setAttempt]=React.useState(0);
 React.useEffect(()=>{
  let active=true;setFailed(false);
  const cached=loadedSettings[locale];
  if(cached){setCatalog({requested:locale,locale,messages:cached});return()=>{active=false};}
  const pending=locale==='en-GB' ? import(/* webpackChunkName: "mapillary-settings-en-gb" */ './locales/settings-en-gb').then(module=>({default:{...settingsEn,...module.default}})) : locale==='zh-TW' ? import(/* webpackChunkName: "mapillary-settings-zh-tw" */ './locales/settings-zh-tw') : locale==='zh-CN' ? import(/* webpackChunkName: "mapillary-settings-zh-cn" */ './locales/settings-zh-cn') : locale==='ko' ? import(/* webpackChunkName: "mapillary-settings-ko" */ './locales/settings-ko') : locale==='ja' ? import(/* webpackChunkName: "mapillary-settings-ja" */ './locales/settings-ja') : locale==='it' ? import(/* webpackChunkName: "mapillary-settings-it" */ './locales/settings-it') : locale==='pt-BR' ? import(/* webpackChunkName: "mapillary-settings-pt-br" */ './locales/settings-pt-br') : locale==='de' ? import(/* webpackChunkName: "mapillary-settings-de" */ './locales/settings-de') : locale==='fr' ? import(/* webpackChunkName: "mapillary-settings-fr" */ './locales/settings-fr') : locale==='es' ? import(/* webpackChunkName: "mapillary-settings-es" */ './locales/settings-es') : import(/* webpackChunkName: "mapillary-settings-tr" */ './locales/settings-tr');
  pending.then(module=>{loadedSettings[locale]=module.default;if(active)setCatalog({requested:locale,locale,messages:module.default})}).catch(()=>{if(active){setCatalog({requested:locale,locale:'en',messages:settingsEn});setFailed(true)}});
  return()=>{active=false};
 },[locale,attempt]);
 const value=React.useMemo(()=>({locale:catalog.locale,owned,t:(key:SettingsKey)=>catalog.messages[key]||settingsEn[key]}),[catalog,owned]);
 return <SettingsLocaleContext.Provider value={value}>
  {((failed&&settledCatalog.requested===locale)||baseFailed)&&<div role="status" style={{padding:8}}>{t('languageError')} <button type="button" onClick={()=>{if(baseFailed)retryBase();else setAttempt(n=>n+1)}}>{t('retryLanguage')}</button></div>}
  {children}
 </SettingsLocaleContext.Provider>;
};
