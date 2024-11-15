import { PokemonType } from '../../enums/type.enum';
import { DynamicObj } from '../../util/extension';
import { getPokemonType } from '../../util/utils';
import { IPokemonPermission } from './options.model';

interface ILeaguePVP {
  id: string;
  name: string;
  cp: number[];
  logo?: string;
}

export interface ILeague {
  id?: string;
  title: string;
  enabled: boolean;
  conditions: ILeagueCondition;
  iconUrl?: string;
  league: string;
  pokemonCount: number;
}

export interface ILeagueTimestamp {
  start?: number;
  end?: number;
}

export class LeagueTimestamp implements ILeagueTimestamp {
  start?: number;
  end?: number;

  static create(value: ILeagueTimestamp) {
    const obj = new LeagueTimestamp();
    Object.assign(obj, value);
    return obj;
  }
}

interface ILeagueCondition {
  timestamp?: ILeagueTimestamp;
  uniqueSelected: boolean;
  uniqueType: string[];
  maxLevel?: number;
  maxCp?: number;
  whiteList: IPokemonPermission[];
  banned: IPokemonPermission[];
}

class LeagueCondition implements ILeagueCondition {
  timestamp?: ILeagueTimestamp;
  uniqueSelected = false;
  uniqueType: string[] = [];
  maxLevel?: number;
  maxCp?: number;
  whiteList: IPokemonPermission[] = [];
  banned: IPokemonPermission[] = [];
}

interface IRankRewardSetLeague {
  type: string;
  count: number;
  step: number;
}

export interface IPokemonRewardSetLeague {
  guaranteedLimited: boolean;
  id: number;
  name: string;
  form: string;
  rank?: number;
  pokemonType: PokemonType;
}

export interface IRankRewardLeague {
  rank?: number;
  free: IRankRewardSetLeague[];
  premium: IRankRewardSetLeague[];
}

export class RankRewardLeague implements IRankRewardLeague {
  rank?: number;
  free: IRankRewardSetLeague[] = [];
  premium: IRankRewardSetLeague[] = [];

  static create(rank: number) {
    const obj = new RankRewardLeague();
    obj.rank = rank;
    return obj;
  }
}

export interface IPokemonRewardLeague {
  rank?: number;
  free: IPokemonRewardSetLeague[];
  premium: IPokemonRewardSetLeague[];
}

export class PokemonRewardLeague implements IPokemonRewardLeague {
  rank?: number;
  free: IPokemonRewardSetLeague[] = [];
  premium: IPokemonRewardSetLeague[] = [];

  static create(rank: number) {
    const obj = new PokemonRewardLeague();
    obj.rank = rank;
    return obj;
  }
}

export interface SettingLeague {
  rankLevel: number;
  additionalTotalBattlesRequired?: number;
  additionalWinsRequired: number;
  minRatingRequired: number;
}

interface LeagueRewardItem {
  stardust?: boolean;
  item: string;
  count: number;
}

export interface LeagueReward {
  pokemonReward: boolean;
  itemLootTable: boolean;
  item: LeagueRewardItem;
}

interface IReward {
  rank: DynamicObj<IRankRewardLeague>;
  pokemon: DynamicObj<IPokemonRewardLeague>;
}

export class Reward implements IReward {
  rank: DynamicObj<IRankRewardLeague> = {};
  pokemon: DynamicObj<IPokemonRewardLeague> = {};
}

interface ISeason {
  season: number;
  timestamp: ILeagueTimestamp;
  rewards: IReward;
  settings: SettingLeague[];
}

export class Season implements ISeason {
  season = 0;
  timestamp = new LeagueTimestamp();
  rewards = new Reward();
  settings: SettingLeague[] = [];

  static create(value: ISeason) {
    const obj = new Season();
    Object.assign(obj, value);
    return obj;
  }
}

export interface ILeagueData {
  allowLeagues: string[];
  data: ILeague[];
  season: ISeason;
}

export class LeagueData implements ILeagueData {
  allowLeagues: string[] = [];
  data: ILeague[] = [];
  season = new Season();
}

export class League implements ILeague {
  id?: string;
  title = '';
  enabled = false;
  conditions = new LeagueCondition();
  iconUrl?: string;
  league = '';
  pokemonCount = 0;
}

export class RankRewardSetLeague implements IRankRewardSetLeague {
  type = '';
  count = 0;
  step = 0;
}

export class PokemonRewardSetLeague implements IPokemonRewardSetLeague {
  guaranteedLimited = false;
  id = 0;
  name = '';
  form = '';
  pokemonType = PokemonType.Normal;

  static create(value: IPokemonRewardSetLeague) {
    const obj = new PokemonRewardSetLeague();
    obj.pokemonType = getPokemonType(obj.form);
    Object.assign(obj, value);
    return obj;
  }
}

export class LeaguePVP implements ILeaguePVP {
  id = '';
  name = '';
  cp: number[] = [];
  logo?: string;
}
