#!/usr/bin/env node
'use strict';
/**
 * Builder language priority v6.106. Compatible current v6 sources.
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
      "file": "src/i18n/core.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Builder language priority and labels",
              "before": "import { en, MessageKey, Messages } from './messages';\nexport type WidgetLanguage = 'en' | 'tr' | 'es';\nexport type LanguagePreference = 'auto' | WidgetLanguage;\nexport function languageOf(locale?: string): WidgetLanguage { return /^tr(?:[-_]|$)/i.test(locale || '') ? 'tr' : /^es(?:[-_]|$)/i.test(locale || '') ? 'es' : 'en'; }\nexport function preferenceOf(value: unknown): LanguagePreference { return value === 'tr' || value === 'es' || value === 'en' ? value : 'auto'; }\n/** React renders the result as text; substitution never generates HTML. */\nexport function message(catalog: Partial<Messages>, key: MessageKey, values: Record<string,string|number> = {}): string {\n return (catalog[key] || en[key]).replace(/\\{([a-zA-Z][a-zA-Z0-9]*)\\}/g, (placeholder, name) =>\n  Object.prototype.hasOwnProperty.call(values,name) ? String(values[name]) : placeholder);\n}\n\n/** Builder policy wins when viewer override is disabled. Auto means inherit builder/app default. */\nexport function requestedLanguage(appLocale: string | undefined, configured: unknown, preference: unknown, allowUserChoice: boolean): WidgetLanguage {\n const builder=preferenceOf(configured),user=preferenceOf(preference);\n const selected=allowUserChoice && user!=='auto' ? user : builder;\n return selected==='auto' ? languageOf(appLocale) : selected;\n}\n",
              "after": "import { en, MessageKey, Messages } from './messages';\nexport type WidgetLanguage = 'en' | 'tr' | 'es';\nexport type LanguagePreference = 'auto' | WidgetLanguage;\nexport function languageOf(locale?: string): WidgetLanguage { return /^tr(?:[-_]|$)/i.test(locale || '') ? 'tr' : /^es(?:[-_]|$)/i.test(locale || '') ? 'es' : 'en'; }\nexport function preferenceOf(value: unknown): LanguagePreference { return value === 'tr' || value === 'es' || value === 'en' ? value : 'auto'; }\n/** React renders the result as text; substitution never generates HTML. */\nexport function message(catalog: Partial<Messages>, key: MessageKey, values: Record<string,string|number> = {}): string {\n return (catalog[key] || en[key]).replace(/\\{([a-zA-Z][a-zA-Z0-9]*)\\}/g, (placeholder, name) =>\n  Object.prototype.hasOwnProperty.call(values,name) ? String(values[name]) : placeholder);\n}\n\n/** An explicit builder language always wins. Viewer choice applies only when the builder uses Auto. */\nexport function requestedLanguage(appLocale: string | undefined, configured: unknown, preference: unknown, allowUserChoice: boolean): WidgetLanguage {\n const builder=preferenceOf(configured),user=preferenceOf(preference);\n const selected=builder!=='auto' ? builder : allowUserChoice && user!=='auto' ? user : 'auto';\n return selected==='auto' ? languageOf(appLocale) : selected;\n}\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/WidgetLocale.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Builder language priority and labels",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { PresentationText, Presentation, presentationFormatter, TextValues } from './PresentationText';\nimport { startupMessages, languageName } from './startupMessages';\nimport { en, MessageKey, Messages } from './messages';\nimport { requestedLanguage, preferenceOf, LanguagePreference, message, WidgetLanguage } from './core';\nexport interface LocaleValue {\n presentation: Presentation; owned(source:string,values?:TextValues):string;\n allowSwitch: boolean; locale: WidgetLanguage; preference: LanguagePreference; loading: boolean; failed: boolean;\n setPreference(value: LanguagePreference): void; retry(): void;\n t(key: MessageKey, values?: Record<string,string|number>): string;\n}\nexport const WidgetLocaleContext = React.createContext<LocaleValue>({presentation:new PresentationText(),owned:(source)=>source,allowSwitch:false,locale:'en',preference:'auto',loading:false,failed:false,setPreference(){},retry(){},t:(key,values)=>message(en,key,values)});\n// No new localization framework. Experience Builder supplies appLocale; Intl formats values.\nconst loadCatalog = (language: 'tr'|'es') => language === 'es'\n ? import(/* webpackChunkName: \"mapillary-locale-es\" */ './locales/es').then(module=>module.default)\n : import(/* webpackChunkName: \"mapillary-locale-tr\" */ './locales/tr').then(module=>module.default);\nconst loadedCatalogs:Partial<Record<WidgetLanguage,Messages>>={en};\nexport const WidgetLocaleProvider: React.FC<{appLocale?:string;widgetId:string;defaultLanguage?:LanguagePreference;allowUserChoice?:boolean;children:React.ReactNode}> = ({appLocale,widgetId,defaultLanguage='auto',allowUserChoice=true,children}) => {\n const storageKey=`mapillary-language-v1:${widgetId}`;\n const [preference,setLanguage]=React.useState<LanguagePreference>(()=>{try{return preferenceOf(localStorage.getItem(storageKey))}catch{return 'auto'}});\n const requested=requestedLanguage(appLocale,defaultLanguage,preference,allowUserChoice);\n const [catalog,setCatalog]=React.useState<{locale:WidgetLanguage;messages:Messages}>(()=>({locale:requested,messages:loadedCatalogs[requested] || {...en,...startupMessages[requested]}}));\n const [loading,setLoading]=React.useState(requested!=='en'&&!loadedCatalogs[requested]),[failed,setFailed]=React.useState(false),[attempt,setAttempt]=React.useState(0);\n const presentation=React.useRef(new PresentationText()).current;\n const known=React.useRef<Messages[]>(Object.values(loadedCatalogs).filter((catalog):catalog is Messages=>!!catalog));\n React.useEffect(()=>{\n  let active=true;setFailed(false);\n  const cached=loadedCatalogs[requested];\n  if(cached){if(!known.current.includes(cached))known.current.push(cached);setCatalog({locale:requested,messages:cached});setLoading(false);return()=>{active=false};}\n  setLoading(true);\n  loadCatalog(requested).then(messages=>{loadedCatalogs[requested]=messages;if(active){if(!known.current.includes(messages))known.current.push(messages);setCatalog({locale:requested,messages});setLoading(false)}}).catch(()=>{if(active){setCatalog({locale:'en',messages:en});setLoading(false);setFailed(true)}});\n  return()=>{active=false};\n },[requested,attempt]);\n const setPreference=React.useCallback((value:LanguagePreference)=>{\n  if(!allowUserChoice)return;\n  const next=preferenceOf(value);setLanguage(next);try{if(next==='auto')localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,next)}catch{/* Language still works with storage disabled. */}\n },[storageKey,allowUserChoice]);\n const retry=React.useCallback(()=>setAttempt(value=>value+1),[]);\n const owned=React.useMemo(()=>presentationFormatter(en,catalog.messages,known.current),[catalog]);\n React.useLayoutEffect(()=>{presentation.update(catalog.locale,owned)},[catalog,owned,presentation]);\n React.useEffect(()=>()=>presentation.clear(),[presentation]);\n const value=React.useMemo<LocaleValue>(()=>({presentation,owned,allowSwitch:allowUserChoice,locale:catalog.locale,preference,loading,failed,setPreference,retry,t:(key,values)=>message(catalog.messages,key,values)}),[catalog,preference,loading,failed,setPreference,retry,allowUserChoice,presentation,owned]);\n return <WidgetLocaleContext.Provider value={value}>{children}</WidgetLocaleContext.Provider>;\n};\nexport const useWidgetLocale = (): LocaleValue => React.useContext(WidgetLocaleContext);\nexport const LanguageChoice: React.FC = () => {\n const {t,locale,preference,setPreference,loading,failed,retry,allowSwitch}=useWidgetLocale();\n if(!allowSwitch)return null;\n return <div style={{padding:'6px 8px',fontSize:12}}>\n  <label style={{display:'grid',gap:4}}>{t('language')}<select aria-label={t('language')} value={preference} onChange={event=>setPreference(preferenceOf(event.target.value))} style={{width:'100%',minWidth:0,color:'#172b22',background:'#fff',font:'inherit',padding:4}}>\n   <option value=\"auto\">{t('automatic')}</option>{(['en','tr','es'] as const).map(language=><option key={language} value={language} lang={locale}>{languageName(locale,language)}</option>)}\n  </select></label>\n  {loading&&<span role=\"status\">{t('languageLoading')}</span>}\n  {failed&&<div role=\"status\">{t('languageError')} <button type=\"button\" onClick={retry}>{t('retryLanguage')}</button></div>}\n </div>;\n};\n\n/** Render widget-owned JSX and bind imperative notices to this instance's locale. */\nexport const LocaleContent: React.FC<{render:(locale:LocaleValue)=>React.ReactNode;onCommit?:(locale:LocaleValue)=>void}> = ({render,onCommit}) => {\n const locale=useWidgetLocale();React.useLayoutEffect(()=>{onCommit?.(locale)},[locale,onCommit]);return <React.Fragment>{render(locale)}</React.Fragment>;\n};\n\n/** Stored React feedback follows locale changes without changing its captured data parameters. */\nexport const OwnedMessage: React.FC<{source:string;values?:TextValues}> = ({source,values}) => {\n const {owned,locale}=useWidgetLocale();const numeric=React.useMemo(()=>new Intl.NumberFormat(locale),[locale]);\n const parameters=values&&Object.fromEntries(Object.entries(values).map(([key,value])=>[key,typeof value==='number'?numeric.format(value):value]));\n return <React.Fragment>{owned(source,parameters)}</React.Fragment>;\n};\nexport const OwnedNumber: React.FC<{value:number;options?:Intl.NumberFormatOptions}> = ({value,options}) => {\n const {locale}=useWidgetLocale();const formatter=React.useMemo(()=>new Intl.NumberFormat(locale,options),[locale,options]);return <React.Fragment>{formatter.format(value)}</React.Fragment>;\n};\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\nimport { PresentationText, Presentation, presentationFormatter, TextValues } from './PresentationText';\nimport { startupMessages, languageName } from './startupMessages';\nimport { en, MessageKey, Messages } from './messages';\nimport { requestedLanguage, preferenceOf, LanguagePreference, message, WidgetLanguage } from './core';\nexport interface LocaleValue {\n presentation: Presentation; owned(source:string,values?:TextValues):string;\n builderControlled?: boolean; allowSwitch: boolean; locale: WidgetLanguage; preference: LanguagePreference; loading: boolean; failed: boolean;\n setPreference(value: LanguagePreference): void; retry(): void;\n t(key: MessageKey, values?: Record<string,string|number>): string;\n}\nexport const WidgetLocaleContext = React.createContext<LocaleValue>({presentation:new PresentationText(),owned:(source)=>source,allowSwitch:false,locale:'en',preference:'auto',loading:false,failed:false,setPreference(){},retry(){},t:(key,values)=>message(en,key,values)});\n// No new localization framework. Experience Builder supplies appLocale; Intl formats values.\nconst loadCatalog = (language: 'tr'|'es') => language === 'es'\n ? import(/* webpackChunkName: \"mapillary-locale-es\" */ './locales/es').then(module=>module.default)\n : import(/* webpackChunkName: \"mapillary-locale-tr\" */ './locales/tr').then(module=>module.default);\nconst loadedCatalogs:Partial<Record<WidgetLanguage,Messages>>={en};\nexport const WidgetLocaleProvider: React.FC<{appLocale?:string;widgetId:string;defaultLanguage?:LanguagePreference;allowUserChoice?:boolean;children:React.ReactNode}> = ({appLocale,widgetId,defaultLanguage='auto',allowUserChoice=true,children}) => {\n const storageKey=`mapillary-language-v1:${widgetId}`;\n const [preference,setLanguage]=React.useState<LanguagePreference>(()=>{try{return preferenceOf(localStorage.getItem(storageKey))}catch{return 'auto'}});\n const requested=requestedLanguage(appLocale,defaultLanguage,preference,allowUserChoice);\n const [catalog,setCatalog]=React.useState<{locale:WidgetLanguage;messages:Messages}>(()=>({locale:requested,messages:loadedCatalogs[requested] || {...en,...startupMessages[requested]}}));\n const [loading,setLoading]=React.useState(requested!=='en'&&!loadedCatalogs[requested]),[failed,setFailed]=React.useState(false),[attempt,setAttempt]=React.useState(0);\n const presentation=React.useRef(new PresentationText()).current;\n const known=React.useRef<Messages[]>(Object.values(loadedCatalogs).filter((catalog):catalog is Messages=>!!catalog));\n React.useEffect(()=>{\n  let active=true;setFailed(false);\n  const cached=loadedCatalogs[requested];\n  if(cached){if(!known.current.includes(cached))known.current.push(cached);setCatalog({locale:requested,messages:cached});setLoading(false);return()=>{active=false};}\n  setLoading(true);\n  loadCatalog(requested).then(messages=>{loadedCatalogs[requested]=messages;if(active){if(!known.current.includes(messages))known.current.push(messages);setCatalog({locale:requested,messages});setLoading(false)}}).catch(()=>{if(active){setCatalog({locale:'en',messages:en});setLoading(false);setFailed(true)}});\n  return()=>{active=false};\n },[requested,attempt]);\n const setPreference=React.useCallback((value:LanguagePreference)=>{\n  if(!allowUserChoice || preferenceOf(defaultLanguage)!=='auto')return;\n  const next=preferenceOf(value);setLanguage(next);try{if(next==='auto')localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,next)}catch{/* Language still works with storage disabled. */}\n },[storageKey,allowUserChoice,defaultLanguage]);\n const retry=React.useCallback(()=>setAttempt(value=>value+1),[]);\n const owned=React.useMemo(()=>presentationFormatter(en,catalog.messages,known.current),[catalog]);\n React.useLayoutEffect(()=>{presentation.update(catalog.locale,owned)},[catalog,owned,presentation]);\n React.useEffect(()=>()=>presentation.clear(),[presentation]);\n const value=React.useMemo<LocaleValue>(()=>({presentation,owned,allowSwitch:allowUserChoice,locale:catalog.locale,preference:preferenceOf(defaultLanguage)!=='auto'?preferenceOf(defaultLanguage):preference,builderControlled:preferenceOf(defaultLanguage)!=='auto',loading,failed,setPreference,retry,t:(key,values)=>message(catalog.messages,key,values)}),[catalog,preference,loading,failed,setPreference,retry,allowUserChoice,presentation,owned,defaultLanguage]);\n return <WidgetLocaleContext.Provider value={value}>{children}</WidgetLocaleContext.Provider>;\n};\nexport const useWidgetLocale = (): LocaleValue => React.useContext(WidgetLocaleContext);\nexport const LanguageChoice: React.FC = () => {\n const {t,locale,preference,setPreference,loading,failed,retry,allowSwitch,builderControlled}=useWidgetLocale();\n if(!allowSwitch)return null;\n return <div style={{padding:'6px 8px',fontSize:12}}>\n  <label style={{display:'grid',gap:4}}>{t('language')}<select aria-label={t('language')} value={preference} disabled={builderControlled} onChange={event=>setPreference(preferenceOf(event.target.value))} style={{width:'100%',minWidth:0,color:'#172b22',background:'#fff',font:'inherit',padding:4}}>\n   <option value=\"auto\">{t('automatic')}</option>{(['en','tr','es'] as const).map(language=><option key={language} value={language} lang={locale}>{languageName(locale,language)}</option>)}\n  </select></label>\n  {loading&&<span role=\"status\">{t('languageLoading')}</span>}\n  {failed&&<div role=\"status\">{t('languageError')} <button type=\"button\" onClick={retry}>{t('retryLanguage')}</button></div>}\n </div>;\n};\n\n/** Render widget-owned JSX and bind imperative notices to this instance's locale. */\nexport const LocaleContent: React.FC<{render:(locale:LocaleValue)=>React.ReactNode;onCommit?:(locale:LocaleValue)=>void}> = ({render,onCommit}) => {\n const locale=useWidgetLocale();React.useLayoutEffect(()=>{onCommit?.(locale)},[locale,onCommit]);return <React.Fragment>{render(locale)}</React.Fragment>;\n};\n\n/** Stored React feedback follows locale changes without changing its captured data parameters. */\nexport const OwnedMessage: React.FC<{source:string;values?:TextValues}> = ({source,values}) => {\n const {owned,locale}=useWidgetLocale();const numeric=React.useMemo(()=>new Intl.NumberFormat(locale),[locale]);\n const parameters=values&&Object.fromEntries(Object.entries(values).map(([key,value])=>[key,typeof value==='number'?numeric.format(value):value]));\n return <React.Fragment>{owned(source,parameters)}</React.Fragment>;\n};\nexport const OwnedNumber: React.FC<{value:number;options?:Intl.NumberFormatOptions}> = ({value,options}) => {\n const {locale}=useWidgetLocale();const formatter=React.useMemo(()=>new Intl.NumberFormat(locale,options),[locale,options]);return <React.Fragment>{formatter.format(value)}</React.Fragment>;\n};\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "tests/localizationCatalog.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Builder language priority and labels",
              "before": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nfunction load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/i18n',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)((req||((id)=>load(path.join(path.dirname(file),id.endsWith('.ts')?id:id+'.ts')))),m,m.exports);return m.exports}\nconst {en}=load('messages.ts'),tr=load('locales/tr.ts').default,{message,languageOf,preferenceOf}=load('core.ts',()=>({en}));\ntest('Turkish has all English keys with exactly matching placeholders',()=>{assert.deepEqual(Object.keys(tr).sort(),Object.keys(en).sort());const placeholders=s=>[...s.matchAll(/\\{([a-zA-Z][a-zA-Z0-9]*)\\}/g)].map(x=>x[1]).sort();for(const key of Object.keys(en)){assert.equal(typeof tr[key],'string');assert(tr[key].trim().length>0,key);assert.deepEqual(placeholders(tr[key]),placeholders(en[key]),key)}});\ntest('locale normalization and stored preference accept only supported choices',()=>{for(const locale of['tr','tr-TR','TR_tr'])assert.equal(languageOf(locale),'tr');for(const locale of[undefined,'en-US','ar','trailing','de-DE'])assert.equal(languageOf(locale),'en');assert.equal(preferenceOf('tr'),'tr');assert.equal(preferenceOf('en'),'en');for(const value of['auto','de','',null])assert.equal(preferenceOf(value),'auto')});\ntest('fallback and full-message substitution retain zero and literal user text',()=>{assert.equal(message({},'timeTravel'),'Time travel');assert.equal(message(tr,'captureOption',{date:'31 Eki 2026',distance:0}),'31 Eki 2026 \u00b7 0 m uzakta');assert.equal(message(en,'iconSize',{label:'<script>x</script>'}),'<script>x</script> icon size');assert.equal(message(en,'iconSize'),'{label} icon size')});\ntest('builder language policy controls defaults and optional viewer overrides',()=>{const{requestedLanguage}=load('core.ts',()=>({en}));assert.equal(requestedLanguage('tr-TR','auto','auto',true),'tr');assert.equal(requestedLanguage('tr-TR','en','auto',true),'en');assert.equal(requestedLanguage('en-US','tr','en',true),'en');assert.equal(requestedLanguage('en-US','tr','en',false),'tr');assert.equal(requestedLanguage('en-US','en','tr',false),'en');assert.equal(requestedLanguage('de-DE','auto','auto',false),'en')});\ntest('builder Turkish covers every setting message without changing service/config values',()=>{const{settingsEn}=load('settingsMessages.ts'),settingsTr=load('locales/settings-tr.ts').default;assert.deepEqual(Object.keys(settingsTr).sort(),Object.keys(settingsEn).sort());for(const key of Object.keys(settingsEn)){assert(settingsTr[key].trim(),key);assert.deepEqual([...settingsTr[key].matchAll(/\\{([^}]+)\\}/g)].map(x=>x[1]),[...settingsEn[key].matchAll(/\\{([^}]+)\\}/g)].map(x=>x[1]),key)}assert.equal(settingsTr.defaultWidgetLanguage,'Varsay\u0131lan Bile\u015fen Dili');assert.equal(settingsTr.customArcgisRouteService,'\u00d6zel ArcGIS rota servisi')});\n\ntest('settings headings use Turkish-aware Title Case',()=>{const tr=load('locales/settings-tr.ts').default,{settingsEn}=load('settingsMessages.ts');assert.equal(tr.appearanceSettings,'G\u00f6r\u00fcn\u00fcm Ayarlar\u0131');assert.equal(tr.hideImageDownload,'G\u00f6r\u00fcnt\u00fc \u0130ndirmeyi Gizle');assert.equal(settingsEn.defaultWidgetLanguage,'Default Widget Language')});\ntest('runtime continuation translates controls, full count messages and preserves brand/protocol terms',()=>{assert.equal(message(tr,'uiObjects'),'Nesneler');assert.equal(message(tr,'uiPlacesShown',{count:3}),'3 yer g\u00f6steriliyor.');assert.equal(message(tr,'uiEnterpriseCountMany',{count:2}),'2 Enterprise notu y\u00fcklendi');assert.equal(message(tr,'uiMapillaryExplorer'),'Mapillary Explorer');assert.equal(message(tr,'uiStatusProgress'),'Devam ediyor');assert.equal(message(en,'uiSequenceTitle',{number:2,date:'Oct 26'}),'Sequence 2 (Oct 26)')});\nconst {presentationFormatter,PresentationText}=load('PresentationText.ts');\ntest('owned notices translate both ways while unknown data stays literal',()=>{const toTr=presentationFormatter(en,tr,[tr]),toEn=presentationFormatter(en,en,[tr]);assert.equal(toTr('Select\u2026'),'Se\u00e7in\u2026');assert.equal(toTr('{count} notes imported',{count:3}),'3 not i\u00e7e aktar\u0131ld\u0131');assert.equal(toEn('3 not i\u00e7e aktar\u0131ld\u0131'),'3 notes imported');for(const text of ['My custom category','<img src=x>','Unknown server response 123'])assert.equal(toTr(text),text)});\ntest('presentation scopes refresh owned properties without overriding loaded image state',()=>{const p=new PresentationText(),other=new PresentationText(),node={textContent:''};p.bind(node,'textContent',()=>p.text('Select\u2026'));p.update('tr',presentationFormatter(en,tr));assert.equal(node.textContent,'Se\u00e7in\u2026');assert.equal(other.locale,'en');node.textContent='Loaded image';p.update('en',presentationFormatter(en,en,[tr]));assert.equal(node.textContent,'Loaded image');p.release(node);assert.equal(p.bindingCount,0)});\ntest('presentation listeners and number/date formatting follow locale and clean up',()=>{const p=new PresentationText();let calls=0;const handle=p.onChange(()=>calls++);p.update('tr',presentationFormatter(en,tr));assert.equal(p.number(12345),'12.345');assert(p.date(new Date('2026-10-31T12:00:00Z'),{month:'long',timeZone:'UTC'}).includes('Ekim'));handle.remove();p.update('en',presentationFormatter(en,en));assert.equal(calls,1);p.clear();assert.equal(p.bindingCount,0)});\nconst es=load('locales/es.ts').default;\ntest('Spanish runtime and builder catalogs cover every key with matching placeholders',()=>{const settings=load('locales/settings-es.ts').default,{settingsEn}=load('settingsMessages.ts');const tokens=s=>[...s.matchAll(/\\{([a-zA-Z][a-zA-Z0-9]*)\\}/g)].map(x=>x[1]).sort();for(const [base,translated]of [[en,es],[settingsEn,settings]]){assert.deepEqual(Object.keys(translated).sort(),Object.keys(base).sort());for(const key of Object.keys(base)){assert(translated[key].trim(),key);assert.deepEqual(tokens(translated[key]),tokens(base[key]),key)}}assert.equal(es.uiFindYourPointOfView,'Encuentra tu punto de vista.');assert.equal(settings.defaultWidgetLanguage,'Idioma Predeterminado del Widget');assert.equal(settings.customArcgisRouteService,'Servicio de Rutas ArcGIS Personalizado')});\ntest('Spanish locale variants, storage preference and builder policy select Spanish',()=>{const{requestedLanguage}=load('core.ts',()=>({en}));for(const locale of ['es','es-ES','es-MX','ES_ar','es-419'])assert.equal(languageOf(locale),'es');assert.equal(languageOf('estonian'),'en');assert.equal(preferenceOf('es'),'es');assert.equal(requestedLanguage('es-MX','auto','auto',true),'es');assert.equal(requestedLanguage('tr-TR','es','auto',false),'es');assert.equal(requestedLanguage('en','es','tr',false),'es');assert.equal(requestedLanguage('en','es','tr',true),'tr')});\ntest('Spanish full messages and three-language reverse matching preserve data',()=>{const spanish=presentationFormatter(en,es,[es,tr]),turkish=presentationFormatter(en,tr,[es,tr]),english=presentationFormatter(en,en,[es,tr]);assert.equal(spanish('{count} notes imported',{count:2}),'2 notas importadas');assert.equal(english('2 notas importadas'),'2 notes imported');assert.equal(turkish('2 notas importadas'),'2 not i\u00e7e aktar\u0131ld\u0131');assert.equal(spanish('2 not i\u00e7e aktar\u0131ld\u0131'),'2 notas importadas');assert.equal(spanish('My custom category'),'My custom category');assert.equal(spanish('Mapillary Explorer'),'Mapillary Explorer')});\ntest('Spanish catalogs contain valid TypeScript syntax',()=>{for(const f of ['locales/es.ts','locales/settings-es.ts']){const source=fs.readFileSync(path.join(__dirname,'../src/i18n',f),'utf8'),sf=ts.createSourceFile(f,source,ts.ScriptTarget.Latest,true);assert.deepEqual(sf.parseDiagnostics,[],f)}});\ntest('startup splash catalogs match full translations and language names follow UI language',()=>{const{startupMessages,startupSettings,languageName}=load('startupMessages.ts');for(const [locale,catalog]of [['es',es],['tr',tr]]){for(const[key,value]of Object.entries(startupMessages[locale]))assert.equal(value,catalog[key],locale+':'+key);const settings=load('locales/settings-'+locale+'.ts').default;for(const[key,value]of Object.entries(startupSettings[locale]))assert.equal(value,settings[key],locale+':'+key)}assert.equal(languageName('en','es'),'Spanish');assert.equal(languageName('en','tr'),'Turkish');assert.equal(languageName('es','es'),'Espa\u00f1ol');assert.equal(languageName('tr','es'),'\u0130spanyolca')});\n",
              "after": "const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nfunction load(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/i18n',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)((req||((id)=>load(path.join(path.dirname(file),id.endsWith('.ts')?id:id+'.ts')))),m,m.exports);return m.exports}\nconst {en}=load('messages.ts'),tr=load('locales/tr.ts').default,{message,languageOf,preferenceOf}=load('core.ts',()=>({en}));\ntest('Turkish has all English keys with exactly matching placeholders',()=>{assert.deepEqual(Object.keys(tr).sort(),Object.keys(en).sort());const placeholders=s=>[...s.matchAll(/\\{([a-zA-Z][a-zA-Z0-9]*)\\}/g)].map(x=>x[1]).sort();for(const key of Object.keys(en)){assert.equal(typeof tr[key],'string');assert(tr[key].trim().length>0,key);assert.deepEqual(placeholders(tr[key]),placeholders(en[key]),key)}});\ntest('locale normalization and stored preference accept only supported choices',()=>{for(const locale of['tr','tr-TR','TR_tr'])assert.equal(languageOf(locale),'tr');for(const locale of[undefined,'en-US','ar','trailing','de-DE'])assert.equal(languageOf(locale),'en');assert.equal(preferenceOf('tr'),'tr');assert.equal(preferenceOf('en'),'en');for(const value of['auto','de','',null])assert.equal(preferenceOf(value),'auto')});\ntest('fallback and full-message substitution retain zero and literal user text',()=>{assert.equal(message({},'timeTravel'),'Time travel');assert.equal(message(tr,'captureOption',{date:'31 Eki 2026',distance:0}),'31 Eki 2026 \u00b7 0 m uzakta');assert.equal(message(en,'iconSize',{label:'<script>x</script>'}),'<script>x</script> icon size');assert.equal(message(en,'iconSize'),'{label} icon size')});\ntest('builder language policy controls defaults and optional viewer overrides',()=>{const{requestedLanguage}=load('core.ts',()=>({en}));assert.equal(requestedLanguage('tr-TR','auto','auto',true),'tr');assert.equal(requestedLanguage('tr-TR','en','auto',true),'en');assert.equal(requestedLanguage('en-US','tr','en',true),'tr');assert.equal(requestedLanguage('en-US','tr','en',false),'tr');assert.equal(requestedLanguage('en-US','en','tr',false),'en');assert.equal(requestedLanguage('de-DE','auto','auto',false),'en')});\ntest('builder Turkish covers every setting message without changing service/config values',()=>{const{settingsEn}=load('settingsMessages.ts'),settingsTr=load('locales/settings-tr.ts').default;assert.deepEqual(Object.keys(settingsTr).sort(),Object.keys(settingsEn).sort());for(const key of Object.keys(settingsEn)){assert(settingsTr[key].trim(),key);assert.deepEqual([...settingsTr[key].matchAll(/\\{([^}]+)\\}/g)].map(x=>x[1]),[...settingsEn[key].matchAll(/\\{([^}]+)\\}/g)].map(x=>x[1]),key)}assert.equal(settingsTr.defaultWidgetLanguage,'Varsay\u0131lan Bile\u015fen Dili');assert.equal(settingsTr.customArcgisRouteService,'\u00d6zel ArcGIS rota servisi')});\n\ntest('settings headings use Turkish-aware Title Case',()=>{const tr=load('locales/settings-tr.ts').default,{settingsEn}=load('settingsMessages.ts');assert.equal(tr.appearanceSettings,'G\u00f6r\u00fcn\u00fcm Ayarlar\u0131');assert.equal(tr.hideImageDownload,'G\u00f6r\u00fcnt\u00fc \u0130ndirmeyi Gizle');assert.equal(settingsEn.defaultWidgetLanguage,'Default Widget Language')});\ntest('runtime continuation translates controls, full count messages and preserves brand/protocol terms',()=>{assert.equal(message(tr,'uiObjects'),'Nesneler');assert.equal(message(tr,'uiPlacesShown',{count:3}),'3 yer g\u00f6steriliyor.');assert.equal(message(tr,'uiEnterpriseCountMany',{count:2}),'2 Enterprise notu y\u00fcklendi');assert.equal(message(tr,'uiMapillaryExplorer'),'Mapillary Explorer');assert.equal(message(tr,'uiStatusProgress'),'Devam ediyor');assert.equal(message(en,'uiSequenceTitle',{number:2,date:'Oct 26'}),'Sequence 2 (Oct 26)')});\nconst {presentationFormatter,PresentationText}=load('PresentationText.ts');\ntest('owned notices translate both ways while unknown data stays literal',()=>{const toTr=presentationFormatter(en,tr,[tr]),toEn=presentationFormatter(en,en,[tr]);assert.equal(toTr('Select\u2026'),'Se\u00e7in\u2026');assert.equal(toTr('{count} notes imported',{count:3}),'3 not i\u00e7e aktar\u0131ld\u0131');assert.equal(toEn('3 not i\u00e7e aktar\u0131ld\u0131'),'3 notes imported');for(const text of ['My custom category','<img src=x>','Unknown server response 123'])assert.equal(toTr(text),text)});\ntest('presentation scopes refresh owned properties without overriding loaded image state',()=>{const p=new PresentationText(),other=new PresentationText(),node={textContent:''};p.bind(node,'textContent',()=>p.text('Select\u2026'));p.update('tr',presentationFormatter(en,tr));assert.equal(node.textContent,'Se\u00e7in\u2026');assert.equal(other.locale,'en');node.textContent='Loaded image';p.update('en',presentationFormatter(en,en,[tr]));assert.equal(node.textContent,'Loaded image');p.release(node);assert.equal(p.bindingCount,0)});\ntest('presentation listeners and number/date formatting follow locale and clean up',()=>{const p=new PresentationText();let calls=0;const handle=p.onChange(()=>calls++);p.update('tr',presentationFormatter(en,tr));assert.equal(p.number(12345),'12.345');assert(p.date(new Date('2026-10-31T12:00:00Z'),{month:'long',timeZone:'UTC'}).includes('Ekim'));handle.remove();p.update('en',presentationFormatter(en,en));assert.equal(calls,1);p.clear();assert.equal(p.bindingCount,0)});\nconst es=load('locales/es.ts').default;\ntest('Spanish runtime and builder catalogs cover every key with matching placeholders',()=>{const settings=load('locales/settings-es.ts').default,{settingsEn}=load('settingsMessages.ts');const tokens=s=>[...s.matchAll(/\\{([a-zA-Z][a-zA-Z0-9]*)\\}/g)].map(x=>x[1]).sort();for(const [base,translated]of [[en,es],[settingsEn,settings]]){assert.deepEqual(Object.keys(translated).sort(),Object.keys(base).sort());for(const key of Object.keys(base)){assert(translated[key].trim(),key);assert.deepEqual(tokens(translated[key]),tokens(base[key]),key)}}assert.equal(es.uiFindYourPointOfView,'Encuentra tu punto de vista.');assert.equal(settings.defaultWidgetLanguage,'Idioma Predeterminado del Widget');assert.equal(settings.customArcgisRouteService,'Servicio de Rutas ArcGIS Personalizado')});\ntest('Spanish locale variants, storage preference and builder policy select Spanish',()=>{const{requestedLanguage}=load('core.ts',()=>({en}));for(const locale of ['es','es-ES','es-MX','ES_ar','es-419'])assert.equal(languageOf(locale),'es');assert.equal(languageOf('estonian'),'en');assert.equal(preferenceOf('es'),'es');assert.equal(requestedLanguage('es-MX','auto','auto',true),'es');assert.equal(requestedLanguage('tr-TR','es','auto',false),'es');assert.equal(requestedLanguage('en','es','tr',false),'es');assert.equal(requestedLanguage('en','es','tr',true),'es')});\ntest('Spanish full messages and three-language reverse matching preserve data',()=>{const spanish=presentationFormatter(en,es,[es,tr]),turkish=presentationFormatter(en,tr,[es,tr]),english=presentationFormatter(en,en,[es,tr]);assert.equal(spanish('{count} notes imported',{count:2}),'2 notas importadas');assert.equal(english('2 notas importadas'),'2 notes imported');assert.equal(turkish('2 notas importadas'),'2 not i\u00e7e aktar\u0131ld\u0131');assert.equal(spanish('2 not i\u00e7e aktar\u0131ld\u0131'),'2 notas importadas');assert.equal(spanish('My custom category'),'My custom category');assert.equal(spanish('Mapillary Explorer'),'Mapillary Explorer')});\ntest('Spanish catalogs contain valid TypeScript syntax',()=>{for(const f of ['locales/es.ts','locales/settings-es.ts']){const source=fs.readFileSync(path.join(__dirname,'../src/i18n',f),'utf8'),sf=ts.createSourceFile(f,source,ts.ScriptTarget.Latest,true);assert.deepEqual(sf.parseDiagnostics,[],f)}});\ntest('startup splash catalogs match full translations and language names follow UI language',()=>{const{startupMessages,startupSettings,languageName}=load('startupMessages.ts');for(const [locale,catalog]of [['es',es],['tr',tr]]){for(const[key,value]of Object.entries(startupMessages[locale]))assert.equal(value,catalog[key],locale+':'+key);const settings=load('locales/settings-'+locale+'.ts').default;for(const[key,value]of Object.entries(startupSettings[locale]))assert.equal(value,settings[key],locale+':'+key)}assert.equal(languageName('en','es'),'Spanish');assert.equal(languageName('en','tr'),'Turkish');assert.equal(languageName('es','es'),'Espa\u00f1ol');assert.equal(languageName('tr','es'),'\u0130spanyolca')});\n\ntest('explicit builder language overrides every saved viewer preference',()=>{const{requestedLanguage}=load('core.ts',()=>({en}));for(const configured of ['en','tr','es'])for(const saved of ['auto','en','tr','es'])for(const allowed of [true,false])assert.equal(requestedLanguage('tr-TR',configured,saved,allowed),configured);assert.equal(requestedLanguage('en','auto','es',true),'es');assert.equal(requestedLanguage('tr','auto','es',false),'tr')});\n",
              "wholeFile": true
            }
          ]
        }
      ]
    },
    {
      "file": "docs/localization/BUILDER-PRIORITY-v6.106.md",
      "content": "# Builder language priority v6.106\n\nRequires v6.105. An explicit builder language (English, Turkish or Spanish) now overrides every saved runtime preference, even when Allow Users To Change Language is enabled. The in-widget language selector displays that same configured value and is disabled. The setter also rejects programmatic attempts to override a builder language.\n\nWhen the builder selects App language (auto), viewer choice remains available if enabled. Saved viewer choices are retained for this mode, but cannot override an explicit builder language. If viewer choice is disabled, auto follows the application locale. Existing startup translation and lazy catalog behavior are retained.\n\nValidation: sixteen localization checks, including all explicit builder languages against every saved preference with viewer choice enabled/disabled; Chromium tests stale stored Turkish versus builder Spanish, synchronized disabled selectors, programmatic change rejection, live builder changes across all three languages, Auto unlocking viewer choice, and preserved storage; Experience Builder development build. Installer dry-run, install, repeat install, byte-exact uninstall and conflict-before-writes passed.\n\nInstall from widget root: `node apply-builder-language-priority-v6-106.cjs`. Undo: `node apply-builder-language-priority-v6-106.cjs --uninstall`. No marker, hover, coverage or image-selection logic changes.\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'builder-language-priority-v6-106-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.106 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'builder-language-priority-v6-106' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.106 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.106 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.106 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-builder-language-priority-v6-106.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Builder language priority v6.106 is already installed. No files changed.');
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
  const manifest = { installer: 'builder-language-priority-v6-106', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Builder language priority v6.106 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
