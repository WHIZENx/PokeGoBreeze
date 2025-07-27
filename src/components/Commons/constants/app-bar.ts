import { IAppMenuItem } from '../models/menu.model';

export const POKEDEX = 'pokedex';
export const NEWS = 'news';
export const SEARCH = 'search';
export const EFFECTIVE = 'effective';
export const TOOLS = 'tools';
export const STATS_SHEETS = 'stats-sheets';
export const PVP = 'pvp';
export const STICKERS = 'stickers';

export const POKEMON = 'pokemon';
export const MOVE = 'move';
export const TYPE = 'type';

export const TYPES_EFFECTIVE = 'type-effective';
export const WEATHER_BOOSTS = 'weather-boots';

export const FIND_IV_CP = 'find-iv-cp';
export const SEARCH_BATTLE_STATS = 'search-battle-stats';
export const STATS_TABLE = 'stats-table';
export const CALCULATE_CATCH_CHANCE = 'calculate-catch-chance';
export const CALCULATE_STATS = 'calculate-stats';
export const CALCULATE_POINT = 'calculate-point';
export const DAMAGE_CALCULATE = 'damage-calculate';
export const RAID_BATTLE = 'raid-battle';

export const DPS_TDO_SHEETS = 'dps-tdo-sheets';
export const STATS_RANKING = 'stats-ranking';

export const SIMULATOR = 'simulator';
export const BATTLE_LEAGUES = 'battle-leagues';

const subMenuSearch: IAppMenuItem<string>[] = [
  { label: 'Pokémon', value: POKEMON, path: '/search-pokemon' },
  { label: 'Move', value: MOVE, path: '/search-moves' },
  { label: 'Type', value: TYPE, path: '/search-types' },
];

const subMenuEffective: IAppMenuItem<string>[] = [
  { label: 'Type Effective', value: TYPES_EFFECTIVE, path: '/type-effective' },
  { label: 'Weather Boosts', value: WEATHER_BOOSTS, path: '/weather-boosts' },
];

const subMenuTools: IAppMenuItem<string>[] = [
  { label: 'Search&Find', isHeader: true },
  { label: 'Find IV&CP', value: FIND_IV_CP, path: '/find-cp-iv' },
  { label: 'Search Battle Leagues Stats', value: SEARCH_BATTLE_STATS, path: '/search-battle-stats' },
  { label: 'Stats Table', value: STATS_TABLE, path: '/stats-table' },
  { label: 'Calculation', isHeader: true },
  { label: 'Calculate Catch Chance', value: CALCULATE_CATCH_CHANCE, path: '/calculate-catch-chance' },
  { label: 'Calculate Stats', value: CALCULATE_STATS, path: '/calculate-stats' },
  { label: 'Calculate Break&Bulk Point', value: CALCULATE_POINT, path: '/calculate-point' },
  { label: 'Battle Simulator', isHeader: true },
  { label: 'Damage Simulator', value: DAMAGE_CALCULATE, path: '/damage-calculate' },
  { label: 'Raid Battle', value: RAID_BATTLE, path: '/raid-battle' },
];

const subMenuStatsSheets: IAppMenuItem<string>[] = [
  { label: 'DPS&TDO Sheets', value: DPS_TDO_SHEETS, path: '/dps-tdo-sheets' },
  { label: 'Stats Ranking', value: STATS_RANKING, path: '/stats-ranking' },
];

const subMenuPvp: IAppMenuItem<string>[] = [
  { label: 'Simulator', value: SIMULATOR, path: '/pvp' },
  { label: 'Battle Leagues', value: BATTLE_LEAGUES, path: '/battle-leagues' },
];

export const pages: IAppMenuItem<string>[] = [
  { label: 'Pokédex', value: POKEDEX, path: '/' },
  { label: 'News', value: NEWS, path: '/news' },
  { label: 'Search', value: SEARCH, subMenus: subMenuSearch },
  { label: 'Effective', value: EFFECTIVE, subMenus: subMenuEffective },
  { label: 'Tools', value: TOOLS, subMenus: subMenuTools },
  { label: 'Stats Sheets', value: STATS_SHEETS, subMenus: subMenuStatsSheets },
  { label: 'PVP', value: PVP, subMenus: subMenuPvp },
  { label: 'Stickers', value: STICKERS, path: '/stickers' },
];
