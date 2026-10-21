// Regenerates the static images in public/: OG cards per locale, favicon.ico and apple-touch-icon.png.
// Run with `node scripts/make-static-images.mjs` after changing the sources.
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));

const locales = ['de', 'en', 'ru', 'ua'];
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// OG cards: 1200x630, van photo with the brand name and the localized tagline.
mkdirSync(path('public/og/'), { recursive: true });
for (const locale of locales) {
  const dict = JSON.parse(readFileSync(path(`src/i18n/${locale}.json`), 'utf8'));
  const overlay = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#191511" stop-opacity="0.92"/>
          <stop offset="0.62" stop-color="#191511" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#191511" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="speed" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#c22410"/>
          <stop offset="0.55" stop-color="#e85312"/>
          <stop offset="1" stop-color="#f2a31b"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#fade)"/>
      <rect x="72" y="214" width="120" height="10" rx="5" fill="url(#speed)"/>
      <text x="72" y="320" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="82" fill="#f5f2ea">${escape(dict.common.brand)}</text>
      <text x="72" y="392" font-family="Arial, sans-serif" font-weight="700" font-size="40" fill="#f5f2ea">${escape(dict.home.hero.title)}</text>
      <text x="72" y="446" font-family="Arial, sans-serif" font-size="30" fill="#f5f2ea" fill-opacity="0.85">${escape(dict.home.hero.subtitle)}</text>
      <text x="72" y="560" font-family="Consolas, monospace" font-size="26" fill="#f5f2ea" fill-opacity="0.7">innexp.at</text>
      <rect y="622" width="1200" height="8" fill="url(#speed)"/>
    </svg>`;
  await sharp(path('src/assets/van-side.png'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([{ input: Buffer.from(overlay) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path(`public/og/og-${locale}.jpg`));
}

// Icons from favicon.svg. The .ico holds a single PNG image (valid since Windows Vista, read by all browsers).
const svg = readFileSync(path('public/favicon.svg'));
const png48 = await sharp(svg, { density: 300 }).resize(48, 48).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(48, 6); // width
header.writeUInt8(48, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png48.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync(path('public/favicon.ico'), Buffer.concat([header, png48]));

// Apple ignores transparency and adds its own rounding, so flatten onto the icon's dark background.
await sharp(svg, { density: 600 })
  .resize(180, 180)
  .flatten({ background: '#191511' })
  .png()
  .toFile(path('public/apple-touch-icon.png'));
