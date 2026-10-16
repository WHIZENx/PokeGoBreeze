#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const prerenderSource = await readFile(new URL('../../sitemap/prerenderSeo.js', import.meta.url), 'utf8');
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

const checks = [
  ['inline shell styles', indexHtml.includes('id="pre-hydration-shell-styles"')],
  ['themed loading shell', indexHtml.includes('id="seo-content" aria-busy="true"')],
  ['mobile layout', indexHtml.includes('@media (max-width: 575px)')],
  ['mobile width containment', indexHtml.includes('grid-template-columns: minmax(0, 1fr)')],
  ['reduced-motion support', indexHtml.includes('@media (prefers-reduced-motion: reduce)')],
  [
    'replaceable shell markers',
    indexHtml.includes('<!--seo-shell-start-->') && indexHtml.includes('<!--seo-shell-end-->'),
  ],
  ['route-specific shell renderer', prerenderSource.includes('renderLoadingShell(route.title.split')],
  ['Vercel production asset cache', hasVercelImmutableCache(vercelConfig)],
  ['Vercel preview asset cache', hasVercelImmutableCache(vercelPreviewConfig)],
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
