import de from './de.json';
import en from './en.json';
import ru from './ru.json';
import uk from './uk.json';

export const locales = ['de', 'en', 'ru', 'uk'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

// 'new' is the NACHTSCHICHT redesign, served in parallel at /new for comparison.
// TODO(client): once a design is chosen, promote it to 'home' and drop this entry.
export type PageId = 'home' | 'new';

const dictionaries: Record<Locale, Record<string, unknown>> = { de, en, ru, uk };

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

const pagePaths: Record<PageId, string> = { home: '', new: 'new' };

export function localizePath(locale: Locale, page: PageId): string {
  const suffix = pagePaths[page] ? `${pagePaths[page]}/` : '';
  return locale === defaultLocale ? `/${suffix}` : `/${locale}/${suffix}`;
}

export function getStaticLocaleParams() {
  return [
    { params: { locale: undefined } },
    { params: { locale: 'en' } },
    { params: { locale: 'ru' } },
    { params: { locale: 'uk' } },
  ];
}

// TODO(client): replace placeholder number 43000000000 everywhere before launch.
export const whatsappNumber = '43000000000';
export const telHref = 'tel:+43000000000';

export function whatsappHref(locale: Locale): string {
  const t = getT(locale);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t('whatsapp.prefill.home'))}`;
}
