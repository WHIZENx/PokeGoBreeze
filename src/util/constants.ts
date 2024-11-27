import { IOptions } from '../core/models/options.model';
import { PVPInfo } from '../core/models/pvp.model';
import { getOption } from '../core/options';
import { CostPowerUp, ITier, Tier } from './models/constants.model';
import { DynamicObj, getPropertyName, toNumber } from './extension';
import { LeagueType } from '../core/enums/league.enum';
import { ChargeAbility } from '../pages/Tools/BattleDamage/enums/damage.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from './compute';
import { BattleLeagueCPType, BattleLeagueIconType } from './enums/compute.enum';
import { PokemonType } from '../enums/type.enum';

// Parameters
export class Params {
  public static Id = 'id';
  public static Form = 'form';
  public static StatsType = 'statsType';
}

// KeyCode
export const KEY_ENTER = 13;
export const KEY_LEFT = 37;
export const KEY_UP = 38;
export const KEY_RIGHT = 39;
export const KEY_DOWN = 40;

export const SYNC_MSG = 'Waiting to sync current data';
export const PATH_ASSET_POKEGO = 'Addressable Assets';
export const DEFAULT_SPRITE_NAME = 'unknown-pokemon';

export const TRANSITION_TIME = '0.3s';

export const BASE_CPM: DynamicObj<number> = {
  1: 0.094,
  10: 0.4225,
  20: 0.5974,
  30: 0.7317,
  40: 0.7903,
  50: 0.84029999,
  60: 0.91736427,
};

export const RAID_BOSS_TIER: DynamicObj<ITier> = {
  1: Tier.create({
    level: 20,
    CPm: 0.61,
    sta: 600,
    timer: 180,
  }),
  2: Tier.create({
    level: 25,
    CPm: 0.6679,
    sta: 1800,
    timer: 180,
  }),
  3: Tier.create({
    level: 30,
    CPm: 0.7317,
    sta: 3600,
    timer: 180,
  }),
  4: Tier.create({
    level: 40,
    CPm: 0.7903,
    sta: 9000,
    timer: 180,
  }),
  5: Tier.create({
    level: 40,
    CPm: 0.79,
    sta: 15000,
    timer: 300,
  }),
  6: Tier.create({
    level: 40,
    CPm: 0.79,
    sta: 22500,
    timer: 300,
  }),
};

export const DEFAULT_TYPES = [
  'NORMAL',
  'FIGHTING',
  'FLYING',
  'POISON',
  'GROUND',
  'ROCK',
  'BUG',
  'GHOST',
  'STEEL',
  'FIRE',
  'WATER',
  'GRASS',
  'ELECTRIC',
  'PSYCHIC',
  'ICE',
  'DRAGON',
  'DARK',
  'FAIRY',
];

export const FORM_NORMAL = 'NORMAL';
export const FORM_SPECIAL = 'SPECIAL';
export const FORM_SHADOW = 'SHADOW';
export const FORM_PURIFIED = 'PURIFIED';
export const FORM_MEGA = 'MEGA';
export const FORM_GMAX = 'GMAX';
export const FORM_PRIMAL = 'PRIMAL';
export const FORM_ALOLA = 'ALOLA';
export const FORM_HISUIAN = 'HISUIAN';
export const FORM_GALARIAN = 'GALARIAN';

// Forms special
export const FORM_HERO = 'HERO';
export const FORM_STANDARD = 'STANDARD';
export const FORM_INCARNATE = 'INCARNATE';
export const FORM_ARMOR = 'ARMOR';
export const FORM_MEGA_X = 'MEGA_X';
export const FORM_MEGA_Y = 'MEGA_Y';

// Pokémon Class
export const CLASS_LEGENDARY = 'LEGENDARY';
export const CLASS_MYTHIC = 'MYTHIC';
export const CLASS_ULTRA_BEAST = 'ULTRA_BEAST';

export const DEFAULT_SHEET_PAGE = 1;
export const DEFAULT_SHEET_ROW = 10;

export const DEFAULT_POKEMON_DEF_OBJ = 160;
export const DEFAULT_POKEMON_SHADOW = false;
export const DEFAULT_TRAINER_FRIEND = false;
export const DEFAULT_WEATHER_BOOSTS = false;
export const DEFAULT_POKEMON_FRIEND_LEVEL = 0;
export const DEFAULT_POKEMON_LEVEL = 40;

export const DEFAULT_ENERGY_PER_HP_LOST = 0.5;
export const DEFAULT_DAMAGE_MULTIPLY = 0.5;
export const DEFAULT_DAMAGE_CONST = 1;
export const DEFAULT_ENEMY_ATK_DELAY = 2;

export const DEFAULT_TRAINER_MULTIPLY = 1.3;
export const DEFAULT_MEGA_MULTIPLY = 1.1;

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

export const STAB_MULTIPLY = (
  options: IOptions | undefined,
  settings = [getPropertyName(options, (o) => o.battleOptions), getPropertyName(options?.battleOptions, (o) => o.stab)]
) => getOption<number>(options, settings, 1);

export const MULTIPLY_LEVEL_FRIENDSHIP = (
  options: IOptions | undefined,
  level = DEFAULT_POKEMON_FRIEND_LEVEL,
  settings = [
    getPropertyName(options, (o) => o.trainerFriendship),
    getPropertyName(options?.trainerFriendship, (o) => o[level.toString()]),
    getPropertyName(options?.trainerFriendship[level.toString()], (o) => o.atkBonus),
  ]
) => getOption<number>(options, settings, 1);

export const MULTIPLY_THROW_CHARGE = (
  options: IOptions | undefined,
  type = ChargeAbility.NORMAL,
  settings = [
    getPropertyName(options, (o) => o.throwCharge),
    getPropertyName(options?.throwCharge, (o) =>
      type === ChargeAbility.NORMAL ? o.normal : type === ChargeAbility.NICE ? o.nice : type === ChargeAbility.GREAT ? o.great : o.excellent
    ),
  ]
) => getOption<number>(options, settings, 1);

export const DODGE_REDUCE = (
  options: IOptions | undefined,
  settings = [
    getPropertyName(options, (o) => o.battleOptions),
    getPropertyName(options?.battleOptions, (o) => o.dodgeDamageReductionPercent),
  ]
) => getOption<number>(options, settings, 0);

export const MAX_ENERGY = (
  options: IOptions | undefined,
  settings = [getPropertyName(options, (o) => o.battleOptions), getPropertyName(options?.battleOptions, (o) => o.maxEnergy)]
) => getOption<number>(options, settings, 0);

/* Shadow exclusive bonus for Pokémon in battle */
export const SHADOW_ATK_BONUS = (
  options: IOptions | undefined,
  settings = [
    getPropertyName(options, (o) => o.combatOptions),
    getPropertyName(options?.combatOptions, (o) => o.shadowBonus),
    getPropertyName(options?.combatOptions.shadowBonus, (o) => o.atk),
  ]
) => getOption<number>(options, settings, 1);

export const SHADOW_DEF_BONUS = (
  options: IOptions | undefined,
  settings = [
    getPropertyName(options, (o) => o.combatOptions),
    getPropertyName(options?.combatOptions, (o) => o.shadowBonus),
    getPropertyName(options?.combatOptions.shadowBonus, (o) => o.def),
  ]
) => getOption<number>(options, settings, 1);

/* Purified exclusive bonus for Pokémon in battle */
export const PURIFIED_ATK_BONUS = (
  options: IOptions | undefined,
  settings = [
    getPropertyName(options, (o) => o.combatOptions),
    getPropertyName(options?.combatOptions, (o) => o.purifiedBonus),
    getPropertyName(options?.combatOptions.purifiedBonus, (o) => o.atk),
  ]
) => getOption<number>(options, settings, 1);

export const PURIFIED_DEF_BONUS = (
  options: IOptions | undefined,
  settings = [
    getPropertyName(options, (o) => o.combatOptions),
    getPropertyName(options?.combatOptions, (o) => o.purifiedBonus),
    getPropertyName(options?.combatOptions.purifiedBonus, (o) => o.def),
  ]
) => getOption<number>(options, settings, 1);

export const genList: DynamicObj<number[]> = {
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

export const regionList: DynamicObj<string> = {
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

export const versionList = [
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

export const typeCostPowerUp = (type: PokemonType | undefined) => {
  switch (type) {
    case PokemonType.Shadow:
      return CostPowerUp.create({
        stardust: 1.2,
        candy: 1.2,
        type,
      });
    case PokemonType.Purified:
      return CostPowerUp.create({
        stardust: 0.9,
        candy: 0.9,
        type,
      });
    case PokemonType.Lucky:
      return CostPowerUp.create({
        stardust: 0.5,
        candy: 1,
        type,
      });
    default:
      return CostPowerUp.create({
        stardust: 1,
        candy: 1,
        type,
      });
  }
};

export const leaguesTeamBattle: PVPInfo[] = [
  {
    id: LeagueType.All,
    name: getPokemonBattleLeagueName(BattleLeagueCPType.Little),
    cp: [BattleLeagueCPType.Little],
    logo: getPokemonBattleLeagueIcon(BattleLeagueCPType.Little),
  },
  {
    id: LeagueType.All,
    name: getPokemonBattleLeagueName(BattleLeagueCPType.Great),
    cp: [BattleLeagueCPType.Great],
    logo: getPokemonBattleLeagueIcon(BattleLeagueCPType.Great),
  },
  {
    id: LeagueType.All,
    name: getPokemonBattleLeagueName(BattleLeagueCPType.Ultra),
    cp: [BattleLeagueCPType.Ultra],
    logo: getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra),
  },
  {
    id: LeagueType.All,
    name: getPokemonBattleLeagueName(),
    cp: [BattleLeagueCPType.InsMaster],
    logo: getPokemonBattleLeagueIcon(),
  },
];

export const genRoman = (gen: number | string) => {
  switch (toNumber(gen)) {
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
export const leaguesDefault = [BattleLeagueIconType.Great, BattleLeagueIconType.Ultra, BattleLeagueIconType.Master];
export const levelList = Array.from({ length: (MAX_LEVEL - MIN_LEVEL) / 0.5 + 1 }, (_, i) => 1 + i * 0.5);
