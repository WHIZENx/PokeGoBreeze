export interface LeaguePVP {
  id: string;
  name: string;
  cp: number;
  logo: string | null;
}

export interface League {
  id: any;
  title: string;
  enabled: boolean;
  conditions: any;
  iconUrl: any;
  league: string;
}

export interface LeagueCondition {
  timestamp: any;
  unique_selected: boolean;
  unique_type: boolean | string[];
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

export interface LeagueRewardPokemon {
  guaranteedLimited: boolean;
  id: number | null;
  name: string;
  form: string;
}

export interface LeagueData {
  allowLeagues: string[];
  data: any[];
  season: any;
}
