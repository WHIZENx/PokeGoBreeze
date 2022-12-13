import { getOption } from '../options/options';
import APIService from '../services/API.service';

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

export const DEFAULT_POKEMON_DEF_OBJ = 160;
export const DEFAULT_POKEMON_SHADOW = false;
export const DEFAULT_TRAINER_FRIEND = false;
export const DEFAULT_WEATHER_BOOSTS = false;
export const DEFAULT_POKEMON_FRIEND_LEVEL = 0;

export const DEFAULT_ENERYGY_PER_HP_LOST = 0.5;
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

export const STAB_MULTIPLY = (options: any) => {
  return getOption(options, ['battle_options', 'stab']);
};
export const MULTIPLY_LEVEL_FRIENDSHIP = (options: any, level: number = DEFAULT_POKEMON_FRIEND_LEVEL) => {
  return getOption(options, ['trainer_friendship', level.toString(), 'atk_bonus']);
};
export const MULTIPLY_THROW_CHARGE = (options: any, type: string) => {
  return getOption(options, ['throw_charge', type]);
};

/* Shadow exclusive bonus for Pokémon in battle */
export const SHADOW_ATK_BONUS = (options: any) => {
  return getOption(options, ['combat_options', 'shadow_bonus', 'atk']);
};
export const SHADOW_DEF_BONUS = (options: any) => {
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
};

export const regionList: any = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
};

export const typeCostPowerUp = (type: string) => {
  if (type === 'shadow') {
    return {
      stadust: 1.2,
      candy: 1.2,
      type,
    };
  } else if (type === 'purified') {
    return {
      stadust: 0.9,
      candy: 0.9,
      type,
    };
  } else if (type === 'lucky') {
    return {
      stadust: 0.5,
      candy: 1,
      type,
    };
  } else {
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
