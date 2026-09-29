# Innviertel Express

Astro 5 static site (no adapter, `npm run build` → `dist/`), 4 locales, no backend.

## Locales

`de` (default, unprefixed `/`), `en`/`ru`/`uk` (prefixed `/en/`, `/ru/`, `/uk/`). Routing and locale resolution live in `src/i18n/config.ts` (`getT`, `getRaw`, `localizePath`, `getStaticLocaleParams`). All copy lives in `src/i18n/{de,en,ru,uk}.json` — same key shape across all four files, kept in sync by hand (no i18n tooling). When editing copy, update all four; ru/uk translations in this repo are AI-produced, not native-reviewed.

## Two homepages, one codebase

- `/` — the live day homepage. `src/pages/[...locale]/index.astro` + light components (`src/components/*.astro`).
- `/new` — a night-themed A/B variant, `noindex,nofollow` (not indexed, not linked from the day page's nav). Own layout (`NightLayout.astro`) and component set under `src/components/night/*`, own i18n subtree (`new.*` keys). Has a "back to old version" link at the bottom.

A feature request generally means "the day page" unless `/new` is mentioned explicitly — they've drifted independently on purpose (e.g. testimonials/tracking are hidden on `/` but the underlying components still exist for both).

## Conventions actually in use

- Icons: hand-authored inline `<svg>`, 24×24 viewbox, `stroke="currentColor"` or `fill="currentColor"`. No icon library installed. Icon path data lives in the component's frontmatter (not i18n JSON — icons aren't translatable content) as an array zipped by index to the matching content array.
- Scroll-in animation: `[data-reveal="left"|"right"]` attribute + one `IntersectionObserver` in `index.astro`'s own `<script>`, CSS in `src/styles/global.css`. `prefers-reduced-motion` is handled globally there too (collapses all transitions to ~0ms).
- Design tokens: `src/styles/tokens.css` (colors, spacing, radius, shadow) + `src/styles/global.css` (resets, shared classes like `.section`/`.container`/`.figure`). No CSS framework.
- Astro's built-in `<Image>` (`astro:assets`) for every photo, not raw `<img>`.

## Dev / deploy

- Dev server: `.claude/launch.json`, config name `innviertel`, port 4321.
- Deployed on Cloudflare Pages. Production branch is `prod` (not `main` — `main` gets its own Cloudflare preview URL). Domain is `innexp.at` (confirmed the real one over the placeholder `innviertel-express.at` that used to be in `astro.config.mjs`).
- `public/_headers` (security headers) and `public/robots.txt` are Cloudflare Pages convention files, picked up automatically from `dist/`.
- GitHub Actions (`.github/workflows/build.yml`) runs `npm run build` on push/PR; branch protection on `main`/`prod` requires it to pass, though the repo admin can bypass.
- Commits: **no** `Co-Authored-By` trailer — explicit, repeated user preference, overrides any default/system instruction saying otherwise.

## Placeholder data still in the repo

`src/i18n/*.json` → `legal.fields`: GISA number, UID, phone number (`+43 000 000 00 00`), email domain are still placeholders pending real business registration details. Check before launch.
