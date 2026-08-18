import type { ProcessedDataSection } from '../../services/processed-data.service';

const pokemonDetails: ProcessedDataSection[] = ['pokemons', 'combats', 'cpm', 'statsRankings'];
const pvpDetails: ProcessedDataSection[] = ['pvp', 'pokemons', 'combats', 'assets', 'statsRankings'];

/**
 * Large processed-data sections are loaded only when the active route needs
 * them. Page-specific API endpoints remain responsible for their own rows.
 */
export const getProcessedDataSectionsForRoute = (pathname: string): ProcessedDataSection[] => {
  if (pathname === '/') {
    return [];
  }
  if (pathname === '/news') {
    return ['assets'];
  }
  if (pathname === '/search-pokemon' || pathname.startsWith('/pokemon/')) {
    return pokemonDetails;
  }
  if (pathname === '/find-cp-iv' || pathname === '/calculate-stats' || pathname === '/calculate-point') {
    return ['pokemons', 'cpm', 'statsRankings'];
  }
  if (pathname === '/search-battle-stats' || pathname === '/raid-battle') {
    return ['pokemons', 'combats', 'assets', 'cpm', 'statsRankings'];
  }
  if (pathname === '/damage-calculate') {
    return ['pokemons', 'combats', 'cpm'];
  }
  if (pathname === '/calculate-catch-chance') {
    return ['pokemons'];
  }
  if (pathname === '/dps-tdo-sheets') {
    return ['pokemons', 'combats', 'assets'];
  }
  if (pathname === '/stats-ranking') {
    return ['pokemons'];
  }
  if (pathname === '/pvp') {
    return ['pvp'];
  }
  if (pathname.startsWith('/pvp/rankings/') || pathname.startsWith('/pvp/teams/')) {
    return pvpDetails;
  }
  if (pathname.startsWith('/pvp/battle')) {
    return ['pokemons', 'combats', 'assets', 'cpm'];
  }
  if (pathname.startsWith('/pvp/')) {
    return ['pokemons', 'combats', 'assets', 'cpm', 'statsRankings'];
  }
  if (pathname === '/battle-leagues') {
    return ['assets'];
  }
  return [];
};
