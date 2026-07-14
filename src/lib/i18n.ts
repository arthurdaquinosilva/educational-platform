/**
 * The site ships pt-BR only, but the architecture is bilingual from day one —
 * retrofitting locales after launch would mean changing every URL, and URLs are
 * the one thing we cannot churn (see docs/decisions.md).
 *
 * Locale ids are lowercase because they appear in URLs. `htmlLang` carries the
 * properly cased BCP-47 tag for <html lang> and hreflang.
 */
export const LOCALES = ['pt-br', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'pt-br';

/** Locales with content ready to ship. English is authored but not launched. */
export const PUBLISHED_LOCALES: readonly Locale[] = ['pt-br'];

export const LOCALE_META: Record<Locale, { htmlLang: string; name: string }> = {
  'pt-br': { htmlLang: 'pt-BR', name: 'Português (Brasil)' },
  en: { htmlLang: 'en', name: 'English' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
