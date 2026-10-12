import de from './de.json';
import en from './en.json';
import ru from './ru.json';
import ua from './ua.json';

export const locales = ['de', 'en', 'ru', 'ua'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

// URL segment and file names use the country code `ua`; <html lang>, hreflang and og:locale need the language tag `uk`.
export const langTags: Record<Locale, string> = { de: 'de', en: 'en', ru: 'ru', ua: 'uk' };

export type PageId = 'home';

const dictionaries: Record<Locale, Record<string, unknown>> = { de, en, ru, ua };

function lookup(locale: Locale, key: string): unknown {
  let node: unknown = dictionaries[locale];
  for (const part of key.split('.')) {
    if (node && typeof node === 'object') {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return node;
}

export function getT(locale: Locale) {
  return (key: string): string => {
    const value = lookup(locale, key) ?? lookup(defaultLocale, key);
    return typeof value === 'string' ? value : key;
  };
}

export function getRaw<T>(locale: Locale, key: string): T {
  return (lookup(locale, key) ?? lookup(defaultLocale, key)) as T;
}

export function resolveLocale(param: string | undefined): Locale {
  return (locales as readonly string[]).includes(param ?? '') ? (param as Locale) : defaultLocale;
}

const pagePaths: Record<PageId, string> = { home: '' };

export function localizePath(locale: Locale, page: PageId): string {
  const suffix = pagePaths[page] ? `${pagePaths[page]}/` : '';
  return locale === defaultLocale ? `/${suffix}` : `/${locale}/${suffix}`;
}

export function getStaticLocaleParams() {
  return [
    { params: { locale: undefined } },
    { params: { locale: 'en' } },
    { params: { locale: 'ru' } },
    { params: { locale: 'ua' } },
  ];
}

export const whatsappNumber = '4368120925020';

export function whatsappHref(locale: Locale): string {
  const t = getT(locale);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t('whatsapp.prefill.home'))}`;
}
