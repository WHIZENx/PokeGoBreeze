import { DynamicObj } from '../../util/models/util.model';
import { IPokemonPermission } from './options.model';

interface ILeaguePVP {
  id: string;
  name: string;
  cp: number | number[];
  logo?: string;
}

export interface ILeague {
  id?: string;
  title: string;
  enabled: boolean;
  conditions: ILeagueCondition;
  iconUrl?: string;
  league: string;
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

// tslint:disable-next-line:max-classes-per-file
class LeagueCondition implements ILeagueCondition {
  timestamp?: ILeagueTimestamp;
  uniqueSelected: boolean = false;
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
}

export interface IRankRewardLeague {
  rank?: number;
  free?: IRankRewardSetLeague[];
  premium?: IRankRewardSetLeague[];
}

export interface IPokemonRewardLeague {
  rank?: number;
  free?: IPokemonRewardSetLeague[];
  premium?: IPokemonRewardSetLeague[];
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonRewardLeague implements IPokemonRewardLeague {
  rank?: number;
  free?: IPokemonRewardSetLeague[];
  premium?: IPokemonRewardSetLeague[];

  constructor({ ...props }: IPokemonRewardLeague) {
    Object.assign(this, props);
  }
}

export interface SettingLeague {
  rankLevel: number;
  additionalTotalBattlesRequired?: number;
  additionalWinsRequired: number;
  minRatingRequired: number;
}

interface LeagueRewardItem {
  stardust: number;
  item: string;
  count: number;
}

export interface LeagueReward {
  pokemonReward: boolean;
  itemLootTable: boolean;
  item: LeagueRewardItem;
}

interface IReward {
  rank: DynamicObj<number, IRankRewardLeague>;
  pokemon: DynamicObj<number, IPokemonRewardLeague>;
}

// tslint:disable-next-line:max-classes-per-file
export class Reward implements IReward {
  rank: DynamicObj<number, IRankRewardLeague> = [];
  pokemon: DynamicObj<number, IPokemonRewardLeague> = [];
}

interface ISeason {
  season: number;
  timestamp: ILeagueTimestamp;
  rewards: IReward;
  settings: SettingLeague[];
}

// tslint:disable-next-line:max-classes-per-file
export class Season implements ISeason {
  season: number = 0;
  timestamp: ILeagueTimestamp = new LeagueTimestamp();
  rewards: IReward = new Reward();
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

// tslint:disable-next-line:max-classes-per-file
export class LeagueData implements ILeagueData {
  allowLeagues: string[];
  data: ILeague[];
  season: ISeason;

  constructor() {
    this.allowLeagues = [];
    this.data = [];
    this.season = new Season();
  }
}

// tslint:disable-next-line:max-classes-per-file
export class League implements ILeague {
  id?: string;
  title: string;
  enabled: boolean = false;
  conditions: ILeagueCondition;
  iconUrl?: string;
  league: string;

  constructor() {
    this.title = '';
    this.conditions = new LeagueCondition();
    this.league = '';
  }
}

// tslint:disable-next-line:max-classes-per-file
export class RankRewardSetLeague implements IRankRewardSetLeague {
  type: string = '';
  count: number;
  step: number;

  constructor() {
    this.count = 0;
    this.step = 0;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonRewardSetLeague implements IPokemonRewardSetLeague {
  guaranteedLimited: boolean = false;
  id: number;
  name: string;
  form: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.form = '';
  }

  static create(value: IPokemonRewardSetLeague) {
    const obj = new PokemonRewardSetLeague();
    Object.assign(obj, value);
    return obj;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class LeaguePVP implements ILeaguePVP {
  id: string;
  name: string;
  cp: number | number[];
  logo?: string;

  constructor() {
    this.id = '';
    this.name = '';
    this.cp = 0;
  }
}
