export interface StatsModel {
  attack: {
    ranking: { id: number; form: string; attack: number; rank: number }[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  defense: {
    ranking: { id: number; form: string; defense: number; rank: number }[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  stamina: {
    ranking: { id: number; form: string; stamina: number; rank: number }[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  statProd: {
    ranking: { id: number; form: string; prod: number; rank: number }[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
}

export interface StatsPokemon {
  hp?: number;
  atk: number;
  def: number;
  sta?: number;
  spa?: number;
  spd?: number;
  spe?: number;
}

export interface HexagonStats {
  lead: number;
  atk: number;
  cons: number;
  closer: number;
  charger: number;
  switching: number;
}

export interface StatsAtk {
  attack: number;
  rank: number;
}

export interface StatsDef {
  defense: number;
  rank: number;
}

export interface StatsSta {
  stamina: number;
  rank: number;
}

export interface StatsProd {
  prod: number;
  rank: number;
}

export interface PokemonStatsRanking {
  num: number;
  name: string;
  slug: string;
  forme: string;
  sprite: string;
  baseSpecies: string;
  rank?: number;
  gen: number;
  region: string;
  version: string;
  weightkg: number;
  heightm: number;
  atk: StatsAtk;
  def: StatsDef;
  sta: StatsSta;
  statProd: StatsProd;
  types?: string[];
  url?: string | undefined;
}
