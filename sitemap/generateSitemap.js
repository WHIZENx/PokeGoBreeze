const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

/**
 * Generate a sitemap for PokeGoBreeze including both static and dynamic routes
 */
async function generateSitemap() {
  // Base URL of your production site - prioritize Vercel's environment variables
  // VERCEL_URL is automatically set by Vercel during deployment
  const baseUrl =
    process.env.REACT_APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://poke-go-breeze.vercel.app');

  // Get current date for lastmod
  const lastmod = new Date().toISOString().split('T')[0];

  // Define static routes with their priorities and change frequencies
  const staticRoutes = [
    // Main pages - high priority, updated frequently
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/news', changefreq: 'daily', priority: 0.9 },
    { url: '/pokedex', changefreq: 'weekly', priority: 0.9 },

    // Search pages
    { url: '/search-pokemon', changefreq: 'weekly', priority: 0.8 },
    { url: '/search-moves', changefreq: 'weekly', priority: 0.8 },
    { url: '/search-types', changefreq: 'weekly', priority: 0.8 },
    { url: '/search-battle-stats', changefreq: 'weekly', priority: 0.8 },

    // Game mechanics pages
    { url: '/type-effective', changefreq: 'monthly', priority: 0.8 },
    { url: '/weather-boosts', changefreq: 'monthly', priority: 0.8 },
    { url: '/battle-leagues', changefreq: 'monthly', priority: 0.8 },

    // PVP section
    { url: '/pvp', changefreq: 'weekly', priority: 0.9 },
    { url: '/pvp/battle', changefreq: 'weekly', priority: 0.8 },

    // Tools section
    { url: '/find-cp-iv', changefreq: 'monthly', priority: 0.7 },
    { url: '/calculate-stats', changefreq: 'monthly', priority: 0.7 },
    { url: '/stats-table', changefreq: 'monthly', priority: 0.7 },
    { url: '/damage-calculate', changefreq: 'monthly', priority: 0.7 },
    { url: '/raid-battle', changefreq: 'weekly', priority: 0.8 },
    { url: '/calculate-point', changefreq: 'monthly', priority: 0.7 },
    { url: '/calculate-catch-chance', changefreq: 'monthly', priority: 0.7 },

    // Stats and sheets
    { url: '/dps-tdo-sheets', changefreq: 'monthly', priority: 0.7 },
    { url: '/stats-ranking', changefreq: 'monthly', priority: 0.7 },

    // Miscellaneous
    { url: '/stickers', changefreq: 'monthly', priority: 0.6 },
  ];

  // Create dynamic routes based on your available data
  const dynamicRoutes = await generateDynamicRoutes();

  // Combine all routes
  const links = [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: route.url,
    changefreq: route.changefreq || 'monthly',
    priority: route.priority || 0.5,
    lastmod,
  }));

  // Create a stream to write to
  const stream = new SitemapStream({ hostname: baseUrl });

  // Return a promise that resolves with your XML string
  return streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString());
}

/**
 * Generate dynamic routes for the sitemap
 * This could fetch data from your APIs or data files to create URLs for dynamic content
 */
async function generateDynamicRoutes() {
  const routes = [];

  try {
    // Example: Pokemon routes from a JSON file or API
    // You would adapt this to use your actual data sources
    const pokemonDataPath = path.resolve(__dirname, '../public/data/pokemon.min.json');

    if (fs.existsSync(pokemonDataPath)) {
      const pokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, 'utf8'));

      // Generate routes for each Pokemon
      pokemonData.forEach((pokemon) => {
        routes.push({
          url: `/pokemon/${pokemon.slug || pokemon.id}`,
          changefreq: 'monthly',
          priority: 0.6,
        });
      });
    }

    // PVP routes - rankings and teams for different leagues and series
    const leagues = ['great', 'ultra', 'master'];
    const series = ['all', 'remix', 'premier'];
    const cpValues = {
      great: '1500',
      ultra: '2500',
      master: '10000',
    };

    // Generate routes for league rankings
    leagues.forEach((league) => {
      series.forEach((serie) => {
        const cp = cpValues[league];

        // Use correct paths from App.tsx - rankings not ranking
        routes.push({
          url: `/pvp/rankings/${serie}/${cp}`,
          changefreq: 'weekly',
          priority: 0.7,
        });

        routes.push({
          url: `/pvp/teams/${serie}/${cp}`,
          changefreq: 'weekly',
          priority: 0.7,
        });

        routes.push({
          url: `/pvp/battle/${cp}`,
          changefreq: 'weekly',
          priority: 0.7,
        });

        // Pokemon-specific PVP pages (likely higher traffic routes for specific meta Pokemon)
        const metaPokemon = ['registeel', 'azumarill', 'medicham', 'bastiodon', 'walrein', 'lickitung', 'jellicent'];
        metaPokemon.forEach((pokemon) => {
          routes.push({
            url: `/pvp/${cp}/${serie}/${pokemon}`,
            changefreq: 'weekly',
            priority: 0.6,
          });
        });
      });
    });

    // Example: Move routes
    const moveDataPath = path.resolve(__dirname, '../public/data/moves.min.json');

    if (fs.existsSync(moveDataPath)) {
      const moveData = JSON.parse(fs.readFileSync(moveDataPath, 'utf8'));

      // Generate routes for each move
      moveData.forEach((move) => {
        routes.push({
          url: `/move/${move.id || move.track}`,
          changefreq: 'monthly',
          priority: 0.5,
        });
      });
    }

    // Add other dynamic route generators as needed
  } catch (error) {
    // Log silently in production
  }

  return routes;
}

module.exports = generateSitemap;
