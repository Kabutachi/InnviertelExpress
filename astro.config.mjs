import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://innexp.at',
  trailingSlash: 'ignore',
  server: { port: Number(process.env.PORT) || 4321 },
  // The whole stylesheet is small; inlining it removes the render-blocking CSS request.
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !/\/new2\/?$/.test(page),
      lastmod: new Date(),
      i18n: { defaultLocale: 'de', locales: { de: 'de', en: 'en', ru: 'ru', ua: 'uk' } },
      // Mirror the <head>: German is the x-default for every page group.
      // Entries of one group share the same links array, so build a new one instead of pushing.
      serialize(item) {
        const de = item.links?.find((link) => link.lang === 'de');
        if (!de) return item;
        return { ...item, links: [...item.links, { lang: 'x-default', url: de.url }] };
      },
    }),
  ],
});
