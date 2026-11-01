import { en, MessageKey, Messages } from './messages';
export type WidgetLanguage = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'pt-BR';
export type LanguagePreference = 'auto' | WidgetLanguage;
export function languageOf(locale?: string): WidgetLanguage { return /^tr(?:[-_]|$)/i.test(locale || '') ? 'tr' : /^es(?:[-_]|$)/i.test(locale || '') ? 'es' : /^fr(?:[-_]|$)/i.test(locale || '') ? 'fr' : /^de(?:[-_]|$)/i.test(locale || '') ? 'de' : /^pt(?:[-_]|$)/i.test(locale || '') ? 'pt-BR' : 'en'; }
export function preferenceOf(value: unknown): LanguagePreference { return value === 'tr' || value === 'es' || value === 'fr' || value === 'de' || value === 'pt-BR' || value === 'en' ? value : 'auto'; }
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
