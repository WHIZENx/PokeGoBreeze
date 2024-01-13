export interface LeaguePVP {
  id: string;
  name: string;
  cp: number | number[];
  logo: string | null;
}

export interface League {
  id: string | null;
  title: string;
  enabled: boolean;
  conditions: LeagueCondition;
  iconUrl: string | null;
  league: string;
}

export interface LeagueCondition {
  timestamp?: {
    start: number;
    end: number;
  };
  unique_selected: boolean;
  unique_type: string[];
  max_level: number | null;
  max_cp: number;
  whiteList: any[];
  banned: any[];
}

export interface LeagueReward {
  type: boolean | string;
  count: number;
  step: number;
}

interface RankRewardSetLeague {
  type: string | boolean;
  count: number;
  step: number;
}

export interface PokemonRewardSetLeague {
  guaranteedLimited: boolean;
  id: number;
  name: string;
  form: string;
  rank?: number;
}

interface RankRewardLeague {
  rank: number;
  free: RankRewardSetLeague[];
  premium: RankRewardSetLeague[];
}

export interface PokemonRewardLeague {
  rank: number;
  free: PokemonRewardSetLeague[];
  premium: PokemonRewardSetLeague[];
}

export interface SettingLeague {
  rankLevel: number;
  additionalTotalBattlesRequired?: number;
  additionalWinsRequired: number;
  minRatingRequired: number;
}

export interface LeagueData {
  allowLeagues: string[];
  data: League[];
  season: {
    season: number;
    timestamp: {
      start: number | string;
      end: number | string;
    };
    rewards: {
      rank: RankRewardLeague[];
      pokemon: PokemonRewardLeague[];
    };
    settings: SettingLeague[];
  };
}

export class LeagueOptionsDataModel {
  allowLeagues!: string[];
  data!: League[];
  season!: {
    season: number;
    timestamp: {
      start: number | string;
      end: number | string;
    };
    rewards: {
      rank: RankRewardLeague[];
      pokemon: PokemonRewardLeague[];
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
export class LeagueDataModel {
  id!: string | null;
  title!: string;
  enabled!: boolean;
  conditions!: LeagueCondition;
  iconUrl!: string | null;
  league!: string;

  constructor() {
    this.title = '';
    this.conditions = {
      unique_selected: false,
      unique_type: [],
      max_level: null,
      max_cp: 0,
      whiteList: [],
      banned: [],
    };
    this.league = '';
  }
}

// tslint:disable-next-line:max-classes-per-file
export class LeagueRewardDataModel {
  type!: boolean | string;
  count!: number;
  step!: number;

  constructor() {
    this.count = 0;
    this.step = 0;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class LeagueRewardPokemonDataModel {
  guaranteedLimited!: boolean;
  id?: number | null;
  name: string;
  form: string;

  constructor() {
    this.name = '';
    this.form = '';
  }
}

// tslint:disable-next-line:max-classes-per-file
export class LeaguePVPPokemonDataModel {
  id!: string;
  name: string;
  cp!: number | number[];
  logo!: string | null;

  constructor() {
    this.id = '';
    this.name = '';
    this.cp = 0;
  }
}
