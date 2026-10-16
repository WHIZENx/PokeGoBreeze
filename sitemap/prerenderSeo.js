'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { canonicalOrigin, loadSeoRouteManifest, staticRoutes } = require('./seoRoutes');

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const replaceTagValue = (html, id, attribute, value) =>
  html.replace(
    new RegExp(`(<[^>]+id=["']${id}["'][^>]*?${attribute}=["'])[^"']*(["'][^>]*>)`, 'i'),
    `$1${escapeHtml(value)}$2`
  );

const renderLoadingShell = (title, description) => `<!--seo-shell-start-->
      <main id="seo-content" aria-busy="true">
        <header class="seo-shell-bar">
          <div class="seo-shell-toolbar">
            <div class="seo-shell-mobile-menu" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </div>
            <div class="seo-shell-brand-lockup">
              <img class="seo-shell-brand-icon" src="/app-icon.png" width="30" height="30" alt="" />
              <span class="seo-shell-brand">PokéGoBreeze</span>
            </div>
            <div class="seo-shell-theme-toggle" aria-hidden="true">
              <svg class="seo-shell-theme-sun" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z"></path>
              </svg>
              <svg class="seo-shell-theme-moon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1"></path>
              </svg>
            </div>
          </div>
          <div class="seo-shell-progress" role="progressbar" aria-label="Loading"></div>
        </header>
        <div class="seo-shell-seo-copy">
          <h1 id="seo-shell-title">${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
      </main>
      <!--seo-shell-end-->`;

const breadcrumbs = (route) => {
  const segments = route.path.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${canonicalOrigin}/` }];
  if (segments.length > 1) {
    const isPvp = route.kind === 'pvp' || route.path.startsWith('/pvp/');
    const parentName =
      route.kind === 'pokemon' ? 'Pokémon' : route.kind === 'move' ? 'Moves' : isPvp ? 'PvP' : 'Game Master Updates';
    const parentPath =
      route.kind === 'pokemon'
        ? '/search-pokemon'
        : route.kind === 'move'
          ? '/search-moves'
          : isPvp
            ? '/pvp'
            : '/game-master-updates';
    items.push({ '@type': 'ListItem', position: 2, name: parentName, item: `${canonicalOrigin}${parentPath}` });
  }
  if (segments.length > 0) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: route.title.split('|')[0].trim(),
      item: `${canonicalOrigin}${route.path}`,
    });
  }
  return { '@type': 'BreadcrumbList', itemListElement: items };
};

const renderRoute = (template, route, isProduction) => {
  const url = `${canonicalOrigin}${route.path}`;
  const image = `${canonicalOrigin}/og-image.png`;
  let html = template.replace(
    /<title id="page-title">[\s\S]*?<\/title>/i,
    `<title id="page-title">${escapeHtml(route.title)}</title>`
  );
  for (const id of ['meta-description', 'og-description', 'twitter-description']) {
    html = replaceTagValue(html, id, 'content', route.description);
  }
  for (const id of ['og-title', 'twitter-title']) html = replaceTagValue(html, id, 'content', route.title);
  for (const id of ['og-url', 'twitter-url']) html = replaceTagValue(html, id, 'content', url);
  for (const id of ['og-image-alt', 'twitter-image-alt']) html = replaceTagValue(html, id, 'content', route.title);
  html = replaceTagValue(html, 'og-type', 'content', route.kind === 'game-master-update' ? 'article' : 'website');
  html = replaceTagValue(html, 'canonical-url', 'href', url);
  if (!isProduction) html = html.replace('content="index, follow"', 'content="noindex, nofollow, noarchive"');

  const graph = [
    {
      '@type': route.kind === 'game-master-update' ? 'Article' : 'WebPage',
      '@id': url,
      url,
      name: route.title,
      description: route.description,
      image,
      inLanguage: 'en',
      ...(route.updatedAt ? { dateModified: route.updatedAt } : {}),
      ...(route.kind === 'game-master-update'
        ? {
            headline: route.title.split('|')[0].trim(),
            datePublished: route.updatedAt,
            author: { '@type': 'Organization', name: 'PokéGo Breeze', url: canonicalOrigin },
            publisher: {
              '@type': 'Organization',
              name: 'PokéGo Breeze',
              url: canonicalOrigin,
              logo: { '@type': 'ImageObject', url: image },
            },
          }
        : {}),
    },
    breadcrumbs(route),
  ];
  html = html.replace(
    /<script id="ld-json" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="ld-json" type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    })}</script>`
  );
  return html.replace(
    /<!--seo-shell-start-->[\s\S]*?<!--seo-shell-end-->/i,
    renderLoadingShell(route.title.split('|')[0].trim(), route.description)
  );
};

const deploymentMode = process.env.APP_DEPLOYMENT_MODE || process.env.REACT_APP_DEPLOYMENT_MODE;
const isProduction = deploymentMode === 'production' || process.env.VERCEL_ENV === 'production';

async function prerender() {
  try {
    const distPath = path.resolve(__dirname, '../dist');
    const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
    const manifest = await loadSeoRouteManifest();
    const routes = [...staticRoutes, ...manifest.routes].filter((route) => route.path !== '/');
    for (const route of routes) {
      const outputPath = path.join(distPath, route.path.slice(1), 'index.html');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, renderRoute(template, route, isProduction));
    }
    if (!isProduction) {
      fs.writeFileSync(
        path.join(distPath, 'index.html'),
        template.replace('content="index, follow"', 'content="noindex, nofollow, noarchive"')
      );
      fs.writeFileSync(path.join(distPath, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
      for (const name of fs.readdirSync(distPath).filter((name) => /^sitemap(?:-|\.)/.test(name))) {
        fs.rmSync(path.join(distPath, name));
      }
    }
    console.log(
      `[seo] Prerendered ${routes.length} routes (${isProduction ? 'indexable production' : 'noindex deployment'}).`
    );
  } catch (error) {
    console.error('[seo] Prerender failed:', error.message);
    process.exit(1);
  }
}

prerender();
