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
  timestamp: {
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

export interface LeagueRewardPokemon {
  guaranteedLimited: boolean;
  id?: number | null;
  name: string;
  form: string;
}

interface RankRewardSetLeague {
  type: string | boolean;
  count: number;
  step: number;
}

interface PokemonRewardSetLeague {
  guaranteedLimited: boolean;
  id: number;
  name: string;
  form: string;
}

interface RankRewardLeague {
  rank: number;
  free: RankRewardSetLeague[];
  premium: RankRewardSetLeague[];
}

interface PokemonRewardLeague {
  rank: number;
  free: PokemonRewardSetLeague[];
  premium: PokemonRewardSetLeague[];
}

interface SettingLeague {
  rankLevel: number;
  additionalTotalBattlesRequired?: number;
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
