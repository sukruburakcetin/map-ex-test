import { en, MessageKey, Messages } from './messages';
export type WidgetLanguage = 'en' | 'en-GB' | 'ar' | 'tr' | 'es' | 'fr' | 'de' | 'pt-BR' | 'it' | 'ja' | 'ko' | 'zh-CN' | 'zh-TW';
export type LanguagePreference = 'auto' | WidgetLanguage;
/** Catalog IDs are separate from formatting locales. Legacy en remains the US base ID. */
function appTag(value?:string):Intl.Locale|undefined {
 try{return value?new Intl.Locale(value.replace(/_/g,'-')):undefined}catch{return undefined}
}
export function languageOf(value?:string):WidgetLanguage {
 const tag=appTag(value);if(!tag)return 'en';
 if(tag.language==='en')return tag.region==='GB'?'en-GB':'en';
 if(tag.language==='zh')return chineseLanguage(tag.baseName)||'en';
 if(tag.language==='pt')return 'pt-BR';
 if(tag.language==='ar'&&tag.script&&tag.script!=='Arab')return 'en';
 return ['ar','tr','es','fr','de','it','ja','ko'].includes(tag.language)?tag.language as WidgetLanguage:'en';
}
export function preferenceOf(value: unknown): LanguagePreference { return value === 'en-US' ? 'en' : value === 'en-GB' ? 'en-GB' : value === 'ar' ? 'ar' : value === 'tr' || value === 'es' || value === 'fr' || value === 'de' || value === 'pt-BR' || value === 'it' || value === 'ja' || value === 'ko' || value === 'zh-CN' || value === 'zh-TW' || value === 'en' ? value : 'auto'; }
/** React renders the result as text; substitution never generates HTML. */
export function message(catalog: Partial<Messages>, key: MessageKey, values: Record<string,string|number> = {}): string {
 return (catalog[key] || en[key]).replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, name) =>
  Object.prototype.hasOwnProperty.call(values,name) ? String(values[name]) : placeholder);
}

/** An explicit builder language always wins. Viewer choice applies only when the builder uses Auto. */
export function requestedLanguage(appLocale: string | undefined, configured: unknown, preference: unknown, allowUserChoice: boolean): WidgetLanguage {
 const builder=preferenceOf(configured),user=preferenceOf(preference);
 const selected=builder!=='auto' ? builder : allowUserChoice && user!=='auto' ? user : 'auto';
 return selected==='auto' ? languageOf(appLocale) : selected;
}

/** Explicit script wins over region; Traditional locales share Taiwan wording. */
function chineseLanguage(value?:string):'zh-CN'|'zh-TW'|undefined {
 const tag=(value||'').replace(/_/g,'-');if(!/^zh(?:-|$)/i.test(tag))return undefined;
 try{const locale=new Intl.Locale(tag);if(locale.script)return locale.script==='Hans'?'zh-CN':locale.script==='Hant'?'zh-TW':undefined;return ['TW','HK','MO'].includes(locale.region||'')?'zh-TW':'zh-CN';}catch{return undefined}
}

/** Explicit regional choices take precedence; App language preserves supported host regions. */
export function formattingLocale(appLocale:string|undefined,configured:unknown,preference:unknown,allowUserChoice:boolean):string {
 const selected=requestedLanguage(appLocale,configured,preference,allowUserChoice),builder=preferenceOf(configured),user=preferenceOf(preference);
 const explicit=builder!=='auto'||(allowUserChoice&&user!=='auto');
 const canonical=selected==='en'?'en-US':selected;
 if(explicit&&['en','en-GB','pt-BR','zh-CN','zh-TW'].includes(selected))return canonical;
 const host=appTag(appLocale);
 if(host&&languageOf(host.baseName)===selected&&(['en','ar','tr','es','fr','de','pt','it','ja','ko','zh'].includes(host.language))){
  if(selected==='en'&&host.language!=='en')return 'en-US';
  return host.language==='ar'?host.baseName+'-u-ca-gregory':host.baseName==='en'?'en-US':host.baseName;
 }
 return selected==='ar'?'ar-u-ca-gregory':canonical;
}
/** Use regional week metadata where available; older runtimes retain a small safe fallback. */
export function firstWeekday(formatLocale:string):number {
 const locale=appTag(formatLocale);if(!locale)return 0;
 const info=(locale as any).getWeekInfo?.() || (locale as any).weekInfo;
 if(info&&Number.isInteger(info.firstDay))return info.firstDay%7;
 const region=locale.maximize().region||'';
 if(['EG','DZ','BH','IQ','JO','KW','LY','OM','QA','SD','SY'].includes(region))return 6;
 return ['US','CA','JP','KR','BR','MX','TW','HK','MO','SG','SA'].includes(region)?0:1;
}

export function directionOf(language:WidgetLanguage):'rtl'|'ltr' {return language==='ar'?'rtl':'ltr';}
