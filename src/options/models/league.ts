export interface leaguePVP {
    id: string
    name: string
    cp: number;
    logo: any;
}

export interface league {
    id: any;
    title: string;
    enabled: boolean;
    conditions: any;
    iconUrl: any;
    league: string;
}

export interface leagueCondition {
    timestamp: any;
    unique_selected: boolean;
    unique_type: boolean | string[];
    max_level: number | null;
    max_cp: number;
    whiteList: any[];
    banned: any[];
}

export interface leagueReward {
    type: boolean | string,
    count: number,
    step: number
}

export interface leagueRewardPokemon {
    guaranteedLimited: boolean,
    id: number | null,
    name: string,
    form: string
}

export interface leagueData {
    allowLeagues: string[],
    data: any[],
    season: any
}