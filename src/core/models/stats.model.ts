export interface IStatsRank {
  attack: {
    ranking: StatsAtk[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  defense: {
    ranking: StatsDef[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  stamina: {
    ranking: StatsSta[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  statProd: {
    ranking: StatsProd[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
}

export class StatsRank implements IStatsRank {
  attack!: {
    ranking: StatsAtk[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  defense!: {
    ranking: StatsDef[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  stamina!: {
    ranking: StatsSta[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };
  statProd!: {
    ranking: StatsProd[];
    min_rank: number;
    max_rank: number;
    min_stats: number;
    max_stats: number;
  };

  constructor({ ...props }: IStatsRank) {
    Object.assign(this, props);
  }
}

export interface IStatsBase {
  atk: number;
  def: number;
  sta?: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsBase implements IStatsBase {
  atk: number;
  def: number;
  sta?: number;

  constructor(atk: number, def: number, sta?: number) {
    this.atk = atk;
    this.def = def;
    this.sta = sta ?? 0;
  }
}

export interface StatsPokemonGO {
  atk: number;
  def: number;
  sta: number;
  prod: number;
}

export interface StatsRankingPokemonGO {
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  prod: StatsProd | undefined;
}

export interface IStatsPokemon {
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
  id?: number;
  form?: string;
}

export interface StatsDef {
  defense: number;
  rank: number;
  id?: number;
  form?: string;
}

export interface StatsSta {
  stamina: number;
  rank: number;
  id?: number;
  form?: string;
}

export interface StatsProd {
  prod: number;
  rank: number;
  id?: number;
  form?: string;
}

export interface PokemonStatsRanking {
  num: number;
  name: string;
  slug: string;
  forme: string;
  sprite: string;
  baseForme: string;
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
  releasedGO: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsPokemon implements IStatsPokemon {
  hp?: number;
  atk: number;
  def: number;
  sta?: number;
  spa?: number;
  spd?: number;
  spe?: number;

  constructor() {
    this.atk = 0;
    this.def = 0;
    this.hp = 0;
    this.spa = 0;
    this.spd = 0;
    this.spe = 0;
  }
}

export interface IStatsRankPokemonGO {
  attackRank: number;
  defenseRank: number;
  staminaRank: number;
  statProdRank: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsRankPokemonGO implements IStatsRankPokemonGO {
  attackRank: number;
  defenseRank: number;
  staminaRank: number;
  statProdRank: number;

  constructor() {
    this.attackRank = 0;
    this.defenseRank = 0;
    this.staminaRank = 0;
    this.statProdRank = 0;
  }
}
