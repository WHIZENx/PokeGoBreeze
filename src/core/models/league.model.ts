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

interface ILeagueCondition {
  timestamp?: {
    start?: number;
    end?: number;
  };
  uniqueSelected: boolean;
  uniqueType: string[];
  maxLevel?: number;
  maxCp?: number;
  whiteList: IPokemonPermission[];
  banned: IPokemonPermission[];
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

export interface LeagueReward {
  pokemonReward: boolean;
  itemLootTable: boolean;
  item: { stardust: number; item: string; count: number };
}

export interface ILeagueData {
  allowLeagues: string[];
  data: ILeague[];
  season: {
    season: number;
    timestamp: {
      start: number | string;
      end: number | string;
    };
    rewards: {
      rank: { [x: number]: IRankRewardLeague };
      pokemon: { [x: number]: IPokemonRewardLeague };
    };
    settings: SettingLeague[];
  };
}

// tslint:disable-next-line:max-classes-per-file
export class LeagueData implements ILeagueData {
  allowLeagues: string[];
  data: ILeague[];
  season: {
    season: number;
    timestamp: {
      start: number | string;
      end: number | string;
    };
    rewards: {
      rank: { [x: number]: IRankRewardLeague };
      pokemon: { [x: number]: IPokemonRewardLeague };
    };
    settings: SettingLeague[];
  };

  constructor() {
    this.allowLeagues = [];
    this.data = [];
    this.season = {
      season: 0,
      timestamp: {
        start: '',
        end: '',
      },
      rewards: {
        rank: [],
        pokemon: [],
      },
      settings: [],
    };
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
    this.conditions = {
      uniqueSelected: false,
      uniqueType: [],
      whiteList: [],
      banned: [],
    };
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
