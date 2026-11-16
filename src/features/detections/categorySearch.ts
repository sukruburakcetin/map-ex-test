/** A precomputed catalog index keeps search local and out of the map/playback paths. */
export interface CategorySearchIndex { text: string; labels: readonly string[]; bases: readonly string[]; words: ReadonlySet<string>; }
function normalized(value: string, locale: string): string {
  return value.normalize('NFKC').toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu,'').replace(/ı/g,'i').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
export function categorySearchIndex(label: string, code: string, locale: string): CategorySearchIndex {
  const labels = [normalized(label,locale), normalized(code,locale)];
  const bases = labels.map(value=>value.replace(/(?:^| )g\d+$/,'').trim());
  const text = labels.join(' ');
  return { text, labels, bases, words: new Set(text.split(' ').filter(Boolean)) };
}
/** Exact categories and phrase prefixes outrank incidental substrings. All query
 * terms still match, while short/direct categories beat longer related names.
 * Variant ties use natural code order (G1, G2, ... G10); an empty query keeps
 * catalog order. The original rows and their selection identities are untouched.
 */
export function rankCategoryMatches<T extends { code: string; index: CategorySearchIndex }>(rows: readonly T[], query: string, locale: string): readonly T[] {
  const phrase = normalized(query,locale), terms = phrase.split(' ').filter(Boolean);
  if (!terms.length) return rows;
  const collator = new Intl.Collator(locale,{numeric:true,sensitivity:'base'});
  return rows.map((row,order)=>{
    const index = row.index;
    if (!terms.every(term=>index.text.includes(term))) return null;
    const texts = [...index.labels,...index.bases];
    const rank = texts.some(text=>text===phrase) ? 0
      : texts.some(text=>text.startsWith(phrase+' ')) ? 1
      : texts.some(text=>(' '+text+' ').includes(' '+phrase+' ')) ? 2
      : terms.every(term=>index.words.has(term)) ? 3 : 4;
    const extra = Math.min(...index.bases.map(text=>text.split(' ').length))-terms.length;
    return {row,order,rank,extra};
  }).filter((value): value is {row:T;order:number;rank:number;extra:number}=>value!==null)
    .sort((a,b)=>a.rank-b.rank||a.extra-b.extra||collator.compare(a.row.code,b.row.code)||a.order-b.order)
    .map(value=>value.row);
}
