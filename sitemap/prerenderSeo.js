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
  const shell = `<main id="seo-content"><h1>${escapeHtml(route.title.split('|')[0].trim())}</h1><p>${escapeHtml(
    route.description
  )}</p></main>`;
  return html.replace('<div id="root"></div>', `<div id="root">${shell}</div>`);
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
