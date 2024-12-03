export interface OptionsRank {
  minRank: number;
  maxRank: number;
  minStats: number;
  maxStats: number;
}

export interface IStatsRankAtk extends Partial<OptionsRank> {
  ranking: IStatsAtk[];
}

export class StatsRankAtk implements IStatsRankAtk {
  ranking: IStatsAtk[] = [];

  static create(value: IStatsRankAtk) {
    const obj = new StatsRankAtk();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsRankDef extends Partial<OptionsRank> {
  ranking: IStatsDef[];
}

export class StatsRankDef implements IStatsRankDef {
  ranking: IStatsDef[] = [];

  static create(value: IStatsRankDef) {
    const obj = new StatsRankDef();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsRankSta extends Partial<OptionsRank> {
  ranking: IStatsSta[];
}

export class StatsRankSta implements IStatsRankSta {
  ranking: IStatsSta[] = [];

  static create(value: IStatsRankSta) {
    const obj = new StatsRankSta();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsRankProd extends Partial<OptionsRank> {
  ranking: IStatsProd[];
}

export class StatsRankProd implements IStatsRankProd {
  ranking: IStatsProd[] = [];

  static create(value: IStatsRankProd) {
    const obj = new StatsRankProd();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsRank {
  attack: IStatsRankAtk;
  defense: IStatsRankDef;
  stamina: IStatsRankSta;
  statProd: IStatsRankProd;
}

export class StatsRank implements IStatsRank {
  attack = new StatsRankAtk();
  defense = new StatsRankDef();
  stamina = new StatsRankSta();
  statProd = new StatsRankProd();

  constructor({ ...props }: IStatsRank) {
    Object.assign(this, props);
  }
}

export interface IStatsBase {
  atk: number;
  def: number;
  sta: number;
}

export class StatsBase implements IStatsBase {
  atk = 0;
  def = 0;
  sta = 0;

  static setValue(atk = 0, def = 0, sta = 0) {
    const obj = new StatsBase();
    obj.atk = atk;
    obj.def = def;
    obj.sta = sta;
    return obj;
  }
}

export interface IStatsPokemonGO {
  atk: number;
  def: number;
  sta: number;
  prod: number;
}

export class StatsPokemonGO implements IStatsPokemonGO {
  atk = 0;
  def = 0;
  sta = 0;
  prod = 0;

  static create(value: IStatsPokemonGO) {
    const obj = new StatsPokemonGO();
    Object.assign(obj, value);
    return obj;
  }
}

export interface StatsRankingPokemonGO {
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  prod: IStatsProd | undefined;
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

export interface IHexagonStats {
  lead: number;
  atk: number;
  cons: number;
  closer: number;
  charger: number;
  switching: number;
}

export class HexagonStats implements IHexagonStats {
  lead = 0;
  atk = 0;
  cons = 0;
  closer = 0;
  charger = 0;
  switching = 0;

  static create(value: IHexagonStats) {
    const obj = new HexagonStats();
    Object.assign(obj, value);
    return obj;
  }
}

interface OptionsStats {
  rank: number;
  id?: number;
  form?: string;
}

export interface IStatsAtk extends Partial<OptionsStats> {
  attack: number;
  rank: number;
}

export class StatsAtk implements IStatsAtk {
  attack = 0;
  rank = 0;

  static create(value: IStatsAtk) {
    const obj = new StatsAtk();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsDef extends Partial<OptionsStats> {
  defense: number;
  rank: number;
}

export class StatsDef implements IStatsDef {
  defense = 0;
  rank = 0;

  static create(value: IStatsDef) {
    const obj = new StatsDef();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsSta extends Partial<OptionsStats> {
  stamina: number;
  rank: number;
}

export class StatsSta implements IStatsSta {
  stamina = 0;
  rank = 0;

  static create(value: IStatsSta) {
    const obj = new StatsSta();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsProd extends Partial<OptionsStats> {
  product: number;
  rank: number;
}

export class StatsProd implements IStatsProd {
  product = 0;
  rank = 0;

  static create(value: IStatsProd) {
    const obj = new StatsProd();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonStatsRanking {
  num: number;
  name: string;
  slug: string;
  forme: string | null;
  sprite: string;
  baseForme: string | undefined | null;
  baseSpecies: string | null;
  rank?: number;
  gen: number;
  region: string | null;
  version: string | null;
  weightkg: number;
  heightm: number;
  atk: IStatsAtk;
  def: IStatsDef;
  sta: IStatsSta;
  prod: IStatsProd;
  types: string[] | undefined;
  url?: string;
  releasedGO: boolean;
}

export class PokemonStatsRanking implements IPokemonStatsRanking {
  num = 0;
  name = '';
  slug = '';
  forme = '';
  sprite = '';
  baseForme = '';
  baseSpecies = '';
  rank?: number;
  gen = 0;
  region = '';
  version = '';
  weightkg = 0;
  heightm = 0;
  atk = new StatsAtk();
  def = new StatsDef();
  sta = new StatsSta();
  prod = new StatsProd();
  types: string[] | undefined = [];
  url?: string;
  releasedGO = false;

  static create(value: IPokemonStatsRanking) {
    const obj = new PokemonStatsRanking();
    Object.assign(obj, value);
    return obj;
  }
}

export class StatsPokemon implements IStatsPokemon {
  hp?: number;
  atk = 0;
  def = 0;
  sta?: number;
  spa?: number;
  spd?: number;
  spe?: number;

  static create(value: IStatsPokemon) {
    const obj = new StatsPokemon();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsRankPokemonGO {
  attackRank: number;
  defenseRank: number;
  staminaRank: number;
  statProdRank: number;
}

export class StatsRankPokemonGO implements IStatsRankPokemonGO {
  attackRank = 0;
  defenseRank = 0;
  staminaRank = 0;
  statProdRank = 0;
}
