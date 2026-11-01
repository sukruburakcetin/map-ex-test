import { en, MessageKey, Messages } from './messages';
export type WidgetLanguage = 'en' | 'tr';
export type LanguagePreference = 'auto' | WidgetLanguage;
export function languageOf(locale?: string): WidgetLanguage { return /^tr(?:[-_]|$)/i.test(locale || '') ? 'tr' : 'en'; }
export function preferenceOf(value: unknown): LanguagePreference { return value === 'tr' || value === 'en' ? value : 'auto'; }
/** React renders the result as text; substitution never generates HTML. */
export function message(catalog: Partial<Messages>, key: MessageKey, values: Record<string,string|number> = {}): string {
 return (catalog[key] || en[key]).replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, name) =>
  Object.prototype.hasOwnProperty.call(values,name) ? String(values[name]) : placeholder);
}

/** Builder policy wins when viewer override is disabled. Auto means inherit builder/app default. */
export function requestedLanguage(appLocale: string | undefined, configured: unknown, preference: unknown, allowUserChoice: boolean): WidgetLanguage {
 const builder=preferenceOf(configured),user=preferenceOf(preference);
 const selected=allowUserChoice && user!=='auto' ? user : builder;
 return selected==='auto' ? languageOf(appLocale) : selected;
}
