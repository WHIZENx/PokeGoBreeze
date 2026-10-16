import { PVPInfo } from '../core/models/pvp.model';
import { ITier, Tier } from './models/constants.model';
import { DynamicObj } from './extension';
import { LeagueBattleType } from '../core/enums/league.enum';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from './compute';
import { BattleLeagueCPType, BattleLeagueIconType } from './enums/compute.enum';
import { PokemonType } from '../enums/type.enum';
import { SUPER_MEGA_RAID_PROFILE } from './raid-tier';

// Parameters
export class Params {
  public static Id = 'id';
  public static Form = 'form';
  public static FormType = 'formType';
  public static StatsType = 'statsType';
  public static MoveType = 'moveType';
  public static LeagueType = 'leagueType';
}

export const RAID_BOSS_TIER: DynamicObj<ITier> = {
  1: Tier.create({
    level: 20,
    CPm: 0.5974,
    sta: 600,
    timer: 180,
  }),
  2: Tier.create({
    level: 25,
    CPm: 0.667934,
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
    timer: 300,
  }),
  5: Tier.create({
    level: 40,
    CPm: 0.7903,
    sta: 15000,
    timer: 300,
  }),
  6: Tier.create({
    level: 40,
    CPm: 0.7903,
    sta: 22500,
    timer: 300,
  }),
  // Provisional Super Mega profile owned and validated by the API. The
  // current Game Master names the enhanced raid levels but omits boss HP/CPM.
  7: Tier.create({
    level: SUPER_MEGA_RAID_PROFILE.level,
    CPm: SUPER_MEGA_RAID_PROFILE.cpm,
    sta: SUPER_MEGA_RAID_PROFILE.hp,
    timer: SUPER_MEGA_RAID_PROFILE.timer,
  }),
};

export const RAID_BATTLE_EXCLUDED_POKEMON_TYPES: readonly PokemonType[] = [PokemonType.GMax];

export const genList: DynamicObj<number[]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

export const regionList: DynamicObj<string> = {
  0: 'Unknown',
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Paldea',
  10: 'Hisui',
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
  'Red Green Japan',
  'Ruby Sapphire',
  'Sun Moon',
  'Sword Shield',
  'Ultra Sun Ultra Moon',
  'X Y',
  'Scarlet Violet',
  'The Teal Mask',
  'The Indigo Disk',
  'Mega Dimension',
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
