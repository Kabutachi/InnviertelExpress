import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://innexp.at',
  trailingSlash: 'ignore',
  server: { port: Number(process.env.PORT) || 4321 },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'de', locales: { de: 'de', en: 'en', ru: 'ru', ua: 'uk' } },
    }),
  ],
});
