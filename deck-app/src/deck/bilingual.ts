import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

/**
 * Both languages at once, on the same slide.
 *
 * LEAP is an international floor: whoever stops may read Arabic, or English, or be
 * scanning for a word they recognise. A language toggle serves none of them — a visitor
 * gets whichever language the loop happens to be in when they arrive. So every slide
 * carries both.
 *
 * The company's own LEAP deck already settles the hierarchy: on a tile the English name
 * leads ("E-Services") and the Arabic explains beneath it, while a headline runs the other
 * way — Arabic first, because that is the room's first language, English under it at a
 * smaller size. Both are always present; only which one is loud changes.
 *
 * `getFixedT` reads a bundle without switching the app's language, so nothing re-renders
 * and there is no second language state to keep in sync.
 */
export interface Bi {
  ar: string;
  en: string;
}

export function useBilingual() {
  const { i18n } = useTranslation();
  return useMemo(() => {
    const ar = i18n.getFixedT('ar');
    const en = i18n.getFixedT('en');
    // A key with no English falls back to the Arabic rather than rendering the key itself.
    return (key: string): Bi => {
      const a = String(ar(key));
      const e = String(en(key));
      return { ar: a, en: e === key ? a : e };
    };
  }, [i18n]);
}
