import { PVPInfo } from '../core/models/pvp.model';
import { ITier, Tier } from './models/constants.model';
import { DynamicObj } from './extension';
import { LeagueBattleType } from '../core/enums/league.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from './compute';
import { BattleLeagueCPType, BattleLeagueIconType } from './enums/compute.enum';

// Parameters
export class Params {
  public static Id = 'id';
  public static Form = 'form';
  public static FormType = 'formType';
  public static StatsType = 'statsType';
  public static MoveType = 'moveType';
  public static LeagueType = 'leagueType';
}

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

export const leaguesTeamBattle: PVPInfo[] = [
  {
    id: LeagueBattleType.All,
    name: getPokemonBattleLeagueName(BattleLeagueCPType.Little),
    cp: [BattleLeagueCPType.Little],
    logo: getPokemonBattleLeagueIcon(BattleLeagueCPType.Little),
  },
  {
    id: LeagueBattleType.All,
    name: getPokemonBattleLeagueName(BattleLeagueCPType.Great),
    cp: [BattleLeagueCPType.Great],
    logo: getPokemonBattleLeagueIcon(BattleLeagueCPType.Great),
  },
  {
    id: LeagueBattleType.All,
    name: getPokemonBattleLeagueName(BattleLeagueCPType.Ultra),
    cp: [BattleLeagueCPType.Ultra],
    logo: getPokemonBattleLeagueIcon(BattleLeagueCPType.Ultra),
  },
  {
    id: LeagueBattleType.All,
    name: getPokemonBattleLeagueName(),
    cp: [BattleLeagueCPType.InsMaster],
    logo: getPokemonBattleLeagueIcon(),
  },
];

export const leaguesDefault = [BattleLeagueIconType.Great, BattleLeagueIconType.Ultra, BattleLeagueIconType.Master];
