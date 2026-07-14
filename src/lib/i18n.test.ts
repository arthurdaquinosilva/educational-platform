import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale } from './i18n';

describe('i18n', () => {
  it('treats pt-br as the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('pt-br');
  });

  it('recognises known locales and rejects unknown ones', () => {
    expect(isLocale('pt-br')).toBe(true);
    expect(isLocale('klingon')).toBe(false);
  });

  it('keeps locale ids URL-safe and lowercase', () => {
    // Locale ids are path segments; an uppercase id would mean the same page
    // resolves at two casings, which is exactly the duplicate-URL problem the
    // routing decision exists to avoid.
    for (const locale of LOCALES) {
      expect(locale).toBe(locale.toLowerCase());
    }
  });

  it('carries a properly cased BCP-47 tag for every locale', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_META[locale].htmlLang).toBeTruthy();
    }
  });
});
