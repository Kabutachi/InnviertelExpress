import { defineConfig } from 'astro/config';

// TODO(client): replace with the real production domain before launch.
// Used for canonical URLs, hreflang alternates, and OG tags.
export default defineConfig({
  site: 'https://innviertel-express.at',
  trailingSlash: 'ignore',
});
