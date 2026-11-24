#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createLatestRequest } from '../../src/utils/hooks/useLatestRequest.ts';
import { getApiError, getApiErrorMessage } from '../../src/services/api-error.ts';

const results = createLatestRequest();
const independentResults = createLatestRequest();
const firstSignal = results.start();
const independentSignal = independentResults.start();
const nextSignal = results.start();
assert(firstSignal.aborted, 'Replacement cancels the older request for the same result');
assert(!independentSignal.aborted, 'Other callers of the same endpoint remain independent');
assert(!results.finish(firstSignal), 'A late result cannot clear the newer loading state');
assert(results.finish(nextSignal));
const abandonedSignal = results.start();
assert(results.cancel());
assert(abandonedSignal.aborted);
assert(!results.finish(abandonedSignal));

const requestError = (status, data) => ({ isAxiosError: true, response: { status, data } });
const error = requestError(400, {
  code: 'pvp_cp_limit_failed',
  detail: 'A Pokémon exceeds the CP limit for this league.',
  error: 'Invalid request.',
});
assert.equal(getApiError(error).code, 'pvp_cp_limit_failed');
assert.equal(
  getApiErrorMessage(error, 'Unable to simulate battle.'),
  'A Pokémon exceeds the CP limit for this league.'
);
assert.equal(
  getApiErrorMessage(requestError(404, { error: 'Move not found.', code: 'move_not_found' }), ''),
  'Move not found.'
);
assert.equal(
  getApiErrorMessage(requestError(404, { error: 'move_not_found' }), ''),
  'The requested data was not found.'
);
assert.equal(
  getApiErrorMessage(requestError(502, '<html>Proxy error</html>'), ''),
  'The service is temporarily unavailable. Try again shortly.'
);
assert.equal(
  getApiErrorMessage({ isAxiosError: true, code: 'ERR_NETWORK' }, ''),
  'Could not reach the service. Check your connection and try again.'
);
assert.equal(getApiErrorMessage({ isAxiosError: true, code: 'ECONNABORTED' }, ''), 'The request timed out. Try again.');
assert.equal(
  getApiErrorMessage(requestError(504, '<html>Proxy timeout</html>'), ''),
  'The request timed out. Try again.'
);
assert.equal(
  getApiErrorMessage(
    requestError(504, {
      code: 'upstream_timeout',
      detail: 'The data source took too long to respond. Try again shortly.',
    }),
    ''
  ),
  'The data source took too long to respond. Try again shortly.'
);
assert.equal(getApiErrorMessage(new Error('Private trace'), 'Unable to load Pokémon.'), 'Unable to load Pokémon.');

const indexHtml = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const appSource = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const entrySource = await readFile(new URL('../../src/index.tsx', import.meta.url), 'utf8');
const progressSource = await readFile(new URL('../../src/utils/helpers/progress-helpers.ts', import.meta.url), 'utf8');
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
  config.rewrites?.some((rewrite) => rewrite.source === '/pvp/:cp/:serie/:pokemon' && rewrite.destination === '/');

const hasVercelPokemonDetailFallback = (config) =>
  config.rewrites?.some((rewrite) => rewrite.source === '/pokemon/:id' && rewrite.destination === '/');

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
    indexHtml.includes('@media (width < 900px)') && responsiveAppBarSource.includes('md1:tw-hidden'),
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
    indexHtml.includes("font-family: var(--font-family-sans, 'Roboto', 'Helvetica', 'Arial', sans-serif)") &&
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
  [
    'persistent startup header and progress outside the React mount',
    indexHtml.includes('<!--seo-shell-end-->\n    <div id="startup-progress"') &&
      indexHtml.includes('<div id="root"></div>') &&
      entrySource.includes('<PersistGate loading={null}') &&
      /useLayoutEffect\(\(\) => \{\s*document\.getElementById\('seo-content'\)\?\.remove\(\)/.test(appSource) &&
      indexHtml.includes('#seo-content ~ #root:empty'),
  ],
  [
    'one startup progress bar remains until first route or failure',
    indexHtml.includes('#startup-progress ~ #root .app-navigation-progress') &&
      appSource.includes('if (finishStartupProgress())') &&
      /errorProgress: \(error: ErrorModel\) => \{\s*finishStartupProgress\(\)/.test(progressSource),
  ],
  [
    'delayed progress indicator uses MUI dimensions and animation timings',
    indexHtml.includes('class="seo-shell-progress"') &&
      indexHtml.includes('450ms') &&
      indexHtml.includes('height: 4px') &&
      indexHtml.includes('seo-shell-progress-first 2.1s') &&
      indexHtml.includes('seo-shell-progress-second 2.1s'),
  ],
  ['no blocking loading card', !indexHtml.includes('seo-shell-card') && !indexHtml.includes('seo-shell-spinner')],
  ['header icon matches React', renderedHeaderIcon.equals(headerIcon)],
  ['viewport-safe progress width', indexHtml.includes('.seo-shell-progress {') && indexHtml.includes('width: 100%')],
  [
    'progress indicator aligns with rendered header top',
    indexHtml.includes('position: fixed') &&
      indexHtml.includes('inset: 0 0 auto') &&
      responsiveAppBarSource.includes('app-navigation-progress tw-absolute tw-inset-x-0 tw-top-0'),
  ],
  ['reduced-motion support', indexHtml.includes('@media (prefers-reduced-motion: reduce)')],
  [
    'replaceable shell markers',
    indexHtml.includes('<!--seo-shell-start-->') && indexHtml.includes('<!--seo-shell-end-->'),
  ],
  [
    'prerendered routes reuse the responsive shell and replace only its SEO copy',
    prerenderSource.includes("replaceShellCopy(html, 'seo-shell-title'") &&
      prerenderSource.includes("replaceShellCopy(html, 'seo-shell-description'") &&
      !prerenderSource.includes('class="seo-shell-bar"'),
  ],
  ['Vercel production asset cache', hasVercelImmutableCache(vercelConfig)],
  ['Vercel preview asset cache', hasVercelImmutableCache(vercelPreviewConfig)],
  ['Vercel production PvP detail fallback', hasVercelPvpDetailFallback(vercelConfig)],
  ['Vercel preview PvP detail fallback', hasVercelPvpDetailFallback(vercelPreviewConfig)],
  ['Vercel production Pokémon detail fallback', hasVercelPokemonDetailFallback(vercelConfig)],
  ['Vercel preview Pokémon detail fallback', hasVercelPokemonDetailFallback(vercelPreviewConfig)],
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

// Public shell metadata and image assets
const webRoot = new URL('../../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('public/manifest.json', webRoot), 'utf8'));

const readPngSize = async (relativePath, imageBytes) => {
  const image = imageBytes ?? (await readFile(new URL(relativePath, webRoot)));
  const pngSignature = '89504e470d0a1a0a';
  if (image.subarray(0, 8).toString('hex') !== pngSignature || image.subarray(12, 16).toString() !== 'IHDR') {
    throw new Error(`${relativePath} is not a valid PNG.`);
  }
  return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
};

const [openGraphImage, appIcon, appleTouchIcon] = await Promise.all([
  readPngSize('public/og-image.png'),
  readPngSize('public/app-icon.png', renderedHeaderIcon),
  readPngSize('public/apple-touch-icon.png'),
]);

const manifestAppIcon = manifest.icons?.find((icon) => icon.src === 'app-icon.png');
const seoChecks = [
  ['Open Graph image is 1200x630', openGraphImage.width === 1200 && openGraphImage.height === 630],
  [
    'Open Graph metadata declares 1200x630',
    indexHtml.includes('property="og:image:width" content="1200"') &&
      indexHtml.includes('property="og:image:height" content="630"'),
  ],
  ['PWA icon is 512x512', appIcon.width === 512 && appIcon.height === 512],
  ['manifest uses the square PWA icon', manifestAppIcon?.sizes === '512x512' && manifestAppIcon?.type === 'image/png'],
  ['Apple touch icon is 180x180', appleTouchIcon.width === 180 && appleTouchIcon.height === 180],
  ['HTML uses the dedicated Apple touch icon', indexHtml.includes('href="/apple-touch-icon.png"')],
];

checks.push(...seoChecks);

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length) {
  console.error(`App shell and SEO assets regression failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`App shell and SEO assets regression passed (${checks.length} checks).`);
