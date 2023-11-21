import { Options } from '../core/models/options.model';
import { getOption } from '../core/options';
import APIService from '../services/API.service';

// KeyCode
export const KEY_ENTER = 13;
export const KEY_LEFT = 37;
export const KEY_UP = 38;
export const KEY_RIGHT = 39;
export const KEY_DOWN = 40;

export const SYNC_MSG = 'Waiting to sync current data';

export const TRANSITION_TIME = '0.3s';

export const BASE_CPM: any = {
  1: 0.094,
  10: 0.4225,
  20: 0.5974,
  30: 0.7317,
  40: 0.7903,
  50: 0.84029999,
  60: 0.91736427,
};

export const RAID_BOSS_TIER: any = {
  1: {
    level: 20,
    CPm: 0.61,
    sta: 600,
    timer: 180,
  },
  2: {
    level: 25,
    CPm: 0.6679,
    sta: 1800,
    timer: 180,
  },
  3: {
    level: 30,
    CPm: 0.7317,
    sta: 3600,
    timer: 180,
  },
  4: {
    level: 40,
    CPm: 0.7903,
    sta: 9000,
    timer: 180,
  },
  5: {
    level: 40,
    CPm: 0.79,
    sta: 15000,
    timer: 300,
  },
  6: {
    level: 40,
    CPm: 0.79,
    sta: 22500,
    timer: 300,
  },
};

export const DEFAULT_TYPES = [
  'BUG',
  'DARK',
  'DRAGON',
  'ELECTRIC',
  'FAIRY',
  'FIGHTING',
  'FIRE',
  'FLYING',
  'GHOST',
  'GRASS',
  'GROUND',
  'ICE',
  'NORMAL',
  'POISON',
  'PSYCHIC',
  'ROCK',
  'STEEL',
  'WATER',
];

export const FORM_NORMAL = 'NORMAL';
export const FORM_STANDARD = 'STANDARD';
export const FORM_INCARNATE = 'INCARNATE';
export const FORM_HERO = 'HERO';
export const FORM_MEGA = 'MEGA';
export const FORM_GMAX = 'GMAX';
export const FORM_PRIMAL = 'PRIMAL';
export const FORM_ALOLA = 'ALOLA';
export const FORM_HISUIAN = 'HISUIAN';
export const FORM_GALARIAN = 'GALARIAN';

export const TYPE_LEGENDARY = 'LEGENDARY';
export const TYPE_MYTHIC = 'MYTHIC';
export const TYPE_ULTRA_BEAST = 'ULTRA_BEAST';

export const DEFAULT_POKEMON_DEF_OBJ = 160;
export const DEFAULT_POKEMON_SHADOW = false;
export const DEFAULT_TRAINER_FRIEND = false;
export const DEFAULT_WEATHER_BOOSTS = false;
export const DEFAULT_POKEMON_FRIEND_LEVEL = 0;

export const DEFAULT_ENERGY_PER_HP_LOST = 0.5;
export const DEFAULT_DAMAGE_MULTIPLY = 0.5;
export const DEFAULT_DAMAGE_CONST = 1;
export const DEFAULT_ENEMY_ATK_DELAY = 2;

export const CURVE_INC_CHANCE = 1.7;
export const PLATINUM_INC_CHANCE = 1.4;
export const GOLD_INC_CHANCE = 1.3;
export const SILVER_INC_CHANCE = 1.2;
export const BRONZE_INC_CHANCE = 1.1;
export const POKE_BALL_INC_CHANCE = 1.0;
export const GREAT_BALL_INC_CHANCE = 1.5;
export const ULTRA_BALL_INC_CHANCE = 2.0;
export const RAZZ_BERRY_INC_CHANCE = 1.5;
export const SILVER_PINAPS_INC_CHANCE = 1.8;
export const GOLD_RAZZ_BERRY_INC_CHANCE = 2.5;

export const NORMAL_THROW_INC_CHANCE = [1.0, 1.0];
export const NICE_THROW_INC_CHANCE = [1.0, 1.3];
export const GREAT_THROW_INC_CHANCE = [1.3, 1.7];
export const EXCELLENT_THROW_INC_CHANCE = [1.7, 2.0];

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 51;

export const MIN_IV = 0;
export const MAX_IV = 15;

export const STAB_MULTIPLY = (options: Options | undefined) => {
  return getOption(options, ['battle_options', 'stab']);
};
export const MULTIPLY_LEVEL_FRIENDSHIP = (options: Options | undefined, level = DEFAULT_POKEMON_FRIEND_LEVEL) => {
  return getOption(options, ['trainer_friendship', level.toString(), 'atk_bonus']);
};
export const MULTIPLY_THROW_CHARGE = (options: Options | undefined, type: string) => {
  return getOption(options, ['throw_charge', type]);
};

/* Shadow exclusive bonus for Pokémon in battle */
export const SHADOW_ATK_BONUS = (options: Options | undefined) => {
  return getOption(options, ['combat_options', 'shadow_bonus', 'atk']);
};
export const SHADOW_DEF_BONUS = (options: Options | undefined) => {
  return getOption(options, ['combat_options', 'shadow_bonus', 'def']);
};

export const genList: any = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1008],
};

export const regionList: any = {
  0: 'Unknown',
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Hisui',
  6: 'Unova',
  7: 'Kalos',
  8: 'Alola',
  9: 'Galar',
  10: 'Paldea',
};

export const versionList: string[] = [
  'Pokémon GO',
  'Black 2 White 2',
  'Black White',
  'Diamond Pearl',
  'Emerald',
  'Firered Leafgreen',
  'Gold Silver',
  'Heartgold Soulsilver',
  'Legends Arceus',
  'Lets Go Pikachu Lets Go Eevee',
  'Omega Ruby Alpha Sapphire',
  'Platinum',
  'Red Blue',
  'Ruby Sapphire',
  'Sun Moon',
  'Sword Shield',
  'Ultra Sun Ultra Moon',
  'X Y',
  'Scarlet Violet',
];

export const typeCostPowerUp = (type: string) => {
  switch (type) {
    case 'shadow':
      return {
        stadust: 1.2,
        candy: 1.2,
        type,
      };
    case 'purified':
      return {
        stadust: 0.9,
        candy: 0.9,
        type,
      };
    case 'lucky':
      return {
        stadust: 0.5,
        candy: 1,
        type,
      };
    default:
      return {
        stadust: 1,
        candy: 1,
        type,
      };
  }
};

export const leaguesTeamBattle = [
  {
    id: 'all',
    name: 'Little Cup',
    cp: 500,
    logo: APIService.getPokeOtherLeague('GBL_littlecup'),
  },
  {
    id: 'all',
    name: 'Great League',
    cp: 1500,
    logo: APIService.getPokeLeague('great_league'),
  },
  {
    id: 'all',
    name: 'Ultra League',
    cp: 2500,
    logo: APIService.getPokeLeague('ultra_league'),
  },
  {
    id: 'all',
    name: 'Master League',
    cp: 10000,
    logo: APIService.getPokeLeague('master_league'),
  },
];

export const genRoman = (gen: number) => {
  switch (gen) {
    case 1:
      return 'I';
    case 2:
      return 'II';
    case 3:
      return 'III';
    case 4:
      return 'IV';
    case 5:
      return 'V';
    case 6:
      return 'VI';
    case 7:
      return 'VII';
    case 8:
      return 'VIII';
    case 9:
      return 'IX';
    default:
      return '';
  }
};

export const scoreType = ['Overall', 'Leads', 'Closers', 'Switches', 'Chargers', 'Attackers', 'Consistency'];
