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
