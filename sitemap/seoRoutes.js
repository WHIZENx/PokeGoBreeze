'use strict';

const canonicalOrigin = 'https://poke-go-breeze.vercel.app';

const staticRoutes = [
  [
    '/',
    'PokéGo Breeze - Pokémon GO Database & Tools',
    'Explore Pokémon GO stats, moves, counters, PvP rankings, raid guides, and battle tools.',
    'weekly',
    1,
  ],
  [
    '/news',
    'Pokémon GO News | PokéGo Breeze',
    'Read Pokémon GO news and data updates used by PokéGo Breeze tools.',
    'daily',
    0.8,
  ],
  [
    '/game-master-updates',
    'Pokémon GO Game Master Patch Notes | PokéGo Breeze',
    'Track Pokémon GO Game Master changes to Pokémon, moves, battles, items, and game systems.',
    'daily',
    0.9,
  ],
  [
    '/search-pokemon',
    'Search Pokémon GO Pokémon | PokéGo Breeze',
    'Search the Pokémon GO Pokédex by name, number, type, form, and battle data.',
    'weekly',
    0.8,
  ],
  [
    '/search-moves',
    'Search Pokémon GO Moves | PokéGo Breeze',
    'Compare Pokémon GO Fast and Charged moves, power, energy, DPS, and PvP values.',
    'weekly',
    0.8,
  ],
  [
    '/search-types',
    'Pokémon GO Type Search | PokéGo Breeze',
    'Browse Pokémon GO Pokémon and moves by type.',
    'weekly',
    0.7,
  ],
  [
    '/search-battle-stats',
    'Pokémon GO Battle Stats Search | PokéGo Breeze',
    'Search and compare Pokémon GO battle stats for raids and PvP.',
    'weekly',
    0.7,
  ],
  [
    '/type-effective',
    'Pokémon GO Type Effectiveness | PokéGo Breeze',
    'Check Pokémon GO type strengths, weaknesses, resistances, and damage effectiveness.',
    'monthly',
    0.8,
  ],
  [
    '/weather-boosts',
    'Pokémon GO Weather Boosts | PokéGo Breeze',
    'See which Pokémon GO types and moves receive bonuses from each weather condition.',
    'monthly',
    0.7,
  ],
  [
    '/battle-leagues',
    'Pokémon GO Battle Leagues | PokéGo Breeze',
    'Browse Pokémon GO battle league CP limits and formats.',
    'weekly',
    0.8,
  ],
  [
    '/pvp',
    'Pokémon GO PvP Tools | PokéGo Breeze',
    'Use Pokémon GO PvP rankings, team building, and battle simulation tools.',
    'weekly',
    0.9,
  ],
  [
    '/pvp/battle',
    'Pokémon GO PvP Battle Simulator | PokéGo Breeze',
    'Simulate Pokémon GO Trainer Battles using current Game Master battle data.',
    'weekly',
    0.8,
  ],
  [
    '/trainer',
    'Pokémon GO Team Leader Battle Simulator | PokéGo Breeze',
    'Simulate Pokémon GO battles against Blanche, Candela, and Spark.',
    'weekly',
    0.8,
  ],
  [
    '/find-cp-iv',
    'Pokémon GO CP & IV Finder | PokéGo Breeze',
    'Find Pokémon GO IV combinations from CP and level.',
    'monthly',
    0.7,
  ],
  [
    '/calculate-stats',
    'Pokémon GO Stats Calculator | PokéGo Breeze',
    'Calculate Pokémon GO battle stats from species, IVs, and level.',
    'monthly',
    0.7,
  ],
  [
    '/stats-table',
    'Pokémon GO Stats Table | PokéGo Breeze',
    'Compare Pokémon GO CP, attack, defense, and stamina values.',
    'monthly',
    0.7,
  ],
  [
    '/damage-calculate',
    'Pokémon GO Damage Calculator | PokéGo Breeze',
    'Calculate Pokémon GO move damage for raids and battles.',
    'monthly',
    0.7,
  ],
  [
    '/raid-battle',
    'Pokémon GO Raid Battle Simulator | PokéGo Breeze',
    'Simulate Pokémon GO raid battles and compare attackers.',
    'weekly',
    0.8,
  ],
  [
    '/calculate-point',
    'Pokémon GO Battle Point Calculator | PokéGo Breeze',
    'Calculate Pokémon GO battle values using current game data.',
    'monthly',
    0.7,
  ],
  [
    '/calculate-catch-chance',
    'Pokémon GO Catch Chance Calculator | PokéGo Breeze',
    'Estimate Pokémon GO catch chance with throws, balls, berries, and medals.',
    'monthly',
    0.7,
  ],
  [
    '/dps-tdo-sheets',
    'Pokémon GO DPS & TDO Rankings | PokéGo Breeze',
    'Compare Pokémon GO attackers by DPS and total damage output.',
    'monthly',
    0.7,
  ],
  [
    '/stats-ranking',
    'Pokémon GO Stats Rankings | PokéGo Breeze',
    'Rank Pokémon GO species by attack, defense, stamina, and stat product.',
    'monthly',
    0.7,
  ],
  ['/stickers', 'Pokémon GO Stickers | PokéGo Breeze', 'Browse Pokémon GO sticker artwork and data.', 'monthly', 0.6],
].map(([path, title, description, changefreq, priority]) => ({
  path,
  title,
  description,
  changefreq,
  priority,
}));

const manifestUrl = () => {
  const apiOrigin = (process.env.REACT_APP_DATA_API_URL || 'https://pokego-breeze-api.vercel.app').replace(/\/$/, '');
  return `${apiOrigin}/api/v1/seo-routes`;
};

const loadSeoRouteManifest = async () => {
  const url = manifestUrl();
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
  } catch (error) {
    throw new Error(`Unable to load SEO route manifest from ${url}: ${error.message}`);
  }
  if (!response.ok) throw new Error(`SEO route manifest returned HTTP ${response.status} from ${url}`);
  const body = await response.json();
  const data = body?.data;
  if (!data || !Array.isArray(data.routes) || typeof data.generatedAt !== 'string') {
    throw new Error(`Invalid SEO route manifest from ${url}`);
  }
  for (const route of data.routes) {
    if (
      !route ||
      typeof route.path !== 'string' ||
      !route.path.startsWith('/') ||
      typeof route.title !== 'string' ||
      typeof route.description !== 'string' ||
      typeof route.updatedAt !== 'string' ||
      !['pokemon', 'move', 'game-master-update', 'pvp'].includes(route.kind)
    ) {
      throw new Error(`Invalid SEO route entry from ${url}`);
    }
  }
  return data;
};

module.exports = { canonicalOrigin, loadSeoRouteManifest, staticRoutes };
