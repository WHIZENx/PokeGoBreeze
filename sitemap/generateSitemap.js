'use strict';

const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const { canonicalOrigin, loadSeoRouteManifest, staticRoutes } = require('./seoRoutes');

const sitemapNames = {
  static: 'sitemap-static.xml',
  pokemon: 'sitemap-pokemon.xml',
  move: 'sitemap-moves.xml',
  'game-master-update': 'sitemap-updates.xml',
  pvp: 'sitemap-pvp.xml',
};

const renderSitemap = async (routes) => {
  const links = routes.map((route) => ({
    url: route.path,
    changefreq: route.changefreq,
    priority: route.priority,
    ...(route.updatedAt ? { lastmod: route.updatedAt } : {}),
  }));
  const stream = new SitemapStream({ hostname: canonicalOrigin });
  return streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString());
};

const renderIndex = (names) => {
  const entries = names.map((name) => `  <sitemap><loc>${canonicalOrigin}/${name}</loc></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
};

async function generateSitemaps() {
  const manifest = await loadSeoRouteManifest();
  const groups = new Map([['static', staticRoutes]]);
  for (const route of manifest.routes) {
    const group = groups.get(route.kind) ?? [];
    group.push(route);
    groups.set(route.kind, group);
  }

  const files = {};
  for (const [kind, name] of Object.entries(sitemapNames)) {
    const routes = groups.get(kind) ?? [];
    if (routes.length > 0) files[name] = await renderSitemap(routes);
  }
  files['sitemap-index.xml'] = renderIndex(Object.keys(files));
  return { files, manifest };
}

module.exports = generateSitemaps;
