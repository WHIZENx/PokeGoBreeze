'use strict';

const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

/**
 * Generate a sitemap for PokeGoBreeze including both static and dynamic routes.
 */
async function generateSitemap() {
  const baseUrl =
    process.env.REACT_APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://poke-go-breeze.vercel.app');

  const lastmod = new Date().toISOString().split('T')[0];

  // ─── Static routes ─────────────────────────────────────────────────────────
  const staticRoutes = [
    // Core
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/news', changefreq: 'daily', priority: 0.9 },
    { url: '/pokedex', changefreq: 'weekly', priority: 0.9 },

    // Search
    { url: '/search-pokemon', changefreq: 'weekly', priority: 0.8 },
    { url: '/search-moves', changefreq: 'weekly', priority: 0.8 },
    { url: '/search-types', changefreq: 'weekly', priority: 0.8 },
    { url: '/search-battle-stats', changefreq: 'weekly', priority: 0.8 },

    // Game mechanics
    { url: '/type-effective', changefreq: 'monthly', priority: 0.8 },
    { url: '/weather-boosts', changefreq: 'monthly', priority: 0.8 },
    { url: '/battle-leagues', changefreq: 'monthly', priority: 0.8 },

    // PVP
    { url: '/pvp', changefreq: 'weekly', priority: 0.9 },
    { url: '/pvp/battle', changefreq: 'weekly', priority: 0.8 },

    // Tools
    { url: '/find-cp-iv', changefreq: 'monthly', priority: 0.7 },
    { url: '/calculate-stats', changefreq: 'monthly', priority: 0.7 },
    { url: '/stats-table', changefreq: 'monthly', priority: 0.7 },
    { url: '/damage-calculate', changefreq: 'monthly', priority: 0.7 },
    { url: '/raid-battle', changefreq: 'weekly', priority: 0.8 },
    { url: '/calculate-point', changefreq: 'monthly', priority: 0.7 },
    { url: '/calculate-catch-chance', changefreq: 'monthly', priority: 0.7 },

    // Stats & sheets
    { url: '/dps-tdo-sheets', changefreq: 'monthly', priority: 0.7 },
    { url: '/stats-ranking', changefreq: 'monthly', priority: 0.7 },

    // Misc
    { url: '/stickers', changefreq: 'monthly', priority: 0.6 },
  ];

  const dynamicRoutes = await generateDynamicRoutes();

  const links = [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: route.url,
    changefreq: route.changefreq || 'monthly',
    priority: route.priority || 0.5,
    lastmod,
  }));

  const stream = new SitemapStream({ hostname: baseUrl });
  return streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString());
}

/**
 * Generate dynamic routes from local data files and known URL patterns.
 */
async function generateDynamicRoutes() {
  const routes = [];

  try {
    // ─── Pokémon detail pages ─────────────────────────────────────────────────
    const pokemonDataPath = path.resolve(__dirname, '../public/data/pokemon.min.json');
    if (fs.existsSync(pokemonDataPath)) {
      const pokemonData = JSON.parse(await fs.promises.readFile(pokemonDataPath, 'utf8'));
      for (const pokemon of pokemonData) {
        routes.push({ url: `/pokemon/${pokemon.slug || pokemon.id}`, changefreq: 'monthly', priority: 0.6 });
      }
    }

    // ─── Move detail pages ────────────────────────────────────────────────────
    const moveDataPath = path.resolve(__dirname, '../public/data/moves.min.json');
    if (fs.existsSync(moveDataPath)) {
      const moveData = JSON.parse(await fs.promises.readFile(moveDataPath, 'utf8'));
      for (const move of moveData) {
        routes.push({ url: `/move/${move.id || move.track}`, changefreq: 'monthly', priority: 0.5 });
      }
    }

    // ─── PVP routes ───────────────────────────────────────────────────────────
    const leagues = [
      { name: 'great', cp: '1500' },
      { name: 'ultra', cp: '2500' },
      { name: 'master', cp: '10000' },
    ];
    const series = ['all', 'remix', 'premier'];
    const metaPokemon = ['registeel', 'azumarill', 'medicham', 'bastiodon', 'walrein', 'lickitung', 'jellicent'];

    for (const { cp } of leagues) {
      // Battle simulator — one URL per CP tier (no series in the path)
      routes.push({ url: `/pvp/battle/${cp}`, changefreq: 'weekly', priority: 0.7 });

      for (const serie of series) {
        // Rankings and team builder — one URL per CP + series combination
        routes.push({ url: `/pvp/rankings/${serie}/${cp}`, changefreq: 'weekly', priority: 0.7 });
        routes.push({ url: `/pvp/teams/${serie}/${cp}`, changefreq: 'weekly', priority: 0.7 });

        // Top meta Pokémon PVP pages
        for (const pokemon of metaPokemon) {
          routes.push({ url: `/pvp/${cp}/${serie}/${pokemon}`, changefreq: 'weekly', priority: 0.6 });
        }
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[sitemap] Error generating dynamic routes:', error.message);
  }

  return routes;
}

module.exports = generateSitemap;
