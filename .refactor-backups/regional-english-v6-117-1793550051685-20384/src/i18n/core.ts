import { en, MessageKey, Messages } from './messages';
export type WidgetLanguage = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'pt-BR' | 'it' | 'ja' | 'ko' | 'zh-CN' | 'zh-TW';
export type LanguagePreference = 'auto' | WidgetLanguage;
export function languageOf(locale?: string): WidgetLanguage { return /^tr(?:[-_]|$)/i.test(locale || '') ? 'tr' : /^es(?:[-_]|$)/i.test(locale || '') ? 'es' : /^fr(?:[-_]|$)/i.test(locale || '') ? 'fr' : /^de(?:[-_]|$)/i.test(locale || '') ? 'de' : /^pt(?:[-_]|$)/i.test(locale || '') ? 'pt-BR' : /^it(?:[-_]|$)/i.test(locale || '') ? 'it' : /^ja(?:[-_]|$)/i.test(locale || '') ? 'ja' : /^ko(?:[-_]|$)/i.test(locale || '') ? 'ko' : chineseLanguage(locale) || 'en'; }
export function preferenceOf(value: unknown): LanguagePreference { return value === 'tr' || value === 'es' || value === 'fr' || value === 'de' || value === 'pt-BR' || value === 'it' || value === 'ja' || value === 'ko' || value === 'zh-CN' || value === 'zh-TW' || value === 'en' ? value : 'auto'; }
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
