#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const prerenderSource = await readFile(new URL('../../sitemap/prerenderSeo.js', import.meta.url), 'utf8');
const responsiveAppBarSource = await readFile(
  new URL('../../src/components/Commons/Navbars/ResponsiveAppBar.tsx', import.meta.url),
  'utf8'
);
const [renderedHeaderIcon, headerIcon] = await Promise.all([
  readFile(new URL('../../public/app-icon.png', import.meta.url)),
  readFile(new URL('../../src/assets/pokedex.png', import.meta.url)),
]);
const vercelConfig = JSON.parse(await readFile(new URL('../../vercel.json', import.meta.url), 'utf8'));
const vercelPreviewConfig = JSON.parse(await readFile(new URL('../../vercel.preview.json', import.meta.url), 'utf8'));
const firebaseConfig = JSON.parse(await readFile(new URL('../../firebase.json', import.meta.url), 'utf8'));
const cloudflareHeaders = await readFile(new URL('../../public/_headers', import.meta.url), 'utf8');
const cloudflareRedirects = await readFile(new URL('../../public/_redirects', import.meta.url), 'utf8').catch(
  (error) => {
    if (error.code === 'ENOENT') return '';
    throw error;
  }
);

const immutableCacheControl = 'public, max-age=31536000, immutable';
const hasVercelImmutableCache = (config) => {
  const staticHeader = config.headers?.find((entry) => entry.source === '/static/(.*)');
  return (
    staticHeader?.headers?.find((header) => header.key.toLowerCase() === 'cache-control')?.value ===
    immutableCacheControl
  );
};

const hasVercelPvpDetailFallback = (config) =>
  config.rewrites?.some(
    (rewrite) => rewrite.source === '/pvp/:cp/:serie/:pokemon' && rewrite.destination === '/'
  );

const checks = [
  ['inline shell styles', indexHtml.includes('id="pre-hydration-shell-styles"')],
  ['themed loading shell', indexHtml.includes('id="seo-content" aria-busy="true"')],
  ['visually hidden SEO copy', indexHtml.includes('<div class="seo-shell-seo-copy">')],
  ['rendered header icon', indexHtml.includes('class="seo-shell-brand-icon" src="/app-icon.png"')],
  [
    'header icon dimensions match React',
    indexHtml.includes('class="seo-shell-brand-icon" src="/app-icon.png" width="30" height="30"') &&
      responsiveAppBarSource.includes('<img src={logo} width="30" height="30" alt="Home" />'),
  ],
  [
    'header brand matches React',
    indexHtml.includes('<span class="seo-shell-brand">PokéGoBreeze</span>') &&
      responsiveAppBarSource.includes('PokéGoBreeze'),
  ],
  [
    'mobile header matches React breakpoint',
    indexHtml.includes('@media (width < 900px)') && responsiveAppBarSource.includes('min-[900px]:tw-hidden'),
  ],
  [
    'mobile header controls match MUI dimensions',
    indexHtml.includes('class="seo-shell-mobile-menu"') &&
      indexHtml.includes('width: 48px') &&
      indexHtml.includes('width: 24px') &&
      indexHtml.includes('class="seo-shell-theme-toggle"') &&
      indexHtml.includes('width: 36px'),
  ],
  [
    'pre-hydration theme icons switch without overlap',
    indexHtml.includes('.seo-shell-theme-toggle .seo-shell-theme-moon') &&
      indexHtml.includes(":root[data-theme='dark'] .seo-shell-theme-toggle .seo-shell-theme-sun") &&
      indexHtml.includes(":root[data-theme='dark'] .seo-shell-theme-toggle .seo-shell-theme-moon"),
  ],
  [
    'header typography matches MUI',
    indexHtml.includes("font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif") &&
      indexHtml.includes('font-size: 16px') &&
      indexHtml.includes('line-height: 24px') &&
      indexHtml.includes('letter-spacing: 0.00938em'),
  ],
  [
    'header elevation matches MUI',
    indexHtml.includes('0 2px 4px -1px rgb(0 0 0 / 20%)') &&
      indexHtml.includes('0 4px 5px 0 rgb(0 0 0 / 14%)') &&
      indexHtml.includes('0 1px 10px 0 rgb(0 0 0 / 12%)'),
  ],
  [
    'dark header matches MUI paper overlay',
    indexHtml.includes('background: #333') &&
      indexHtml.includes('linear-gradient(rgb(255 255 255 / 9%), rgb(255 255 255 / 9%))'),
  ],
  ['header icon preloaded', indexHtml.includes('rel="preload" as="image" href="/app-icon.png"')],
  ['delayed progress indicator', indexHtml.includes('class="seo-shell-progress"') && indexHtml.includes('450ms')],
  ['no blocking loading card', !indexHtml.includes('seo-shell-card') && !indexHtml.includes('seo-shell-spinner')],
  ['header icon matches React', renderedHeaderIcon.equals(headerIcon)],
  ['viewport-safe progress width', indexHtml.includes('.seo-shell-progress {') && indexHtml.includes('width: 100%')],
  [
    'progress indicator aligns with rendered header top',
    indexHtml.includes('position: absolute') &&
      indexHtml.includes('top: 0') &&
      indexHtml.includes('<header class="seo-shell-bar">') &&
      indexHtml.indexOf('class="seo-shell-progress"') < indexHtml.indexOf('</header>'),
  ],
  ['reduced-motion support', indexHtml.includes('@media (prefers-reduced-motion: reduce)')],
  [
    'replaceable shell markers',
    indexHtml.includes('<!--seo-shell-start-->') && indexHtml.includes('<!--seo-shell-end-->'),
  ],
  ['route-specific shell renderer', prerenderSource.includes('renderLoadingShell(route.title.split')],
  [
    'route-specific responsive header',
    prerenderSource.includes('class="seo-shell-mobile-menu"') &&
      prerenderSource.includes('class="seo-shell-theme-toggle"'),
  ],
  ['Vercel production asset cache', hasVercelImmutableCache(vercelConfig)],
  ['Vercel preview asset cache', hasVercelImmutableCache(vercelPreviewConfig)],
  ['Vercel production PvP detail fallback', hasVercelPvpDetailFallback(vercelConfig)],
  ['Vercel preview PvP detail fallback', hasVercelPvpDetailFallback(vercelPreviewConfig)],
  [
    'Firebase asset cache',
    firebaseConfig.hosting.every((target) =>
      target.headers?.some(
        (entry) =>
          entry.source === '/static/**' &&
          entry.headers?.some(
            (header) => header.key.toLowerCase() === 'cache-control' && header.value === immutableCacheControl
          )
      )
    ),
  ],
  [
    'Firebase serves the app',
    firebaseConfig.hosting.every(
      (target) => target.rewrites?.some((rewrite) => rewrite.destination === '/index.html') && !target.redirects?.length
    ),
  ],
  [
    'Cloudflare asset cache',
    cloudflareHeaders.includes('/static/*') && cloudflareHeaders.includes(`Cache-Control: ${immutableCacheControl}`),
  ],
  ['Cloudflare has no cross-provider redirect', !cloudflareRedirects.includes('https://')],
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length) {
  console.error(`Pre-hydration shell audit failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`Pre-hydration shell audit passed (${checks.length} checks).`);
