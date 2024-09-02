export interface OptionsRank {
  minRank: number;
  maxRank: number;
  minStats: number;
  maxStats: number;
}

interface IStatsRankAtk extends OptionsRank {
  ranking: IStatsAtk[];
}

export class StatsRankAtk implements IStatsRankAtk {
  ranking: IStatsAtk[] = [];
  minRank: number = 0;
  maxRank: number = 0;
  minStats: number = 0;
  maxStats: number = 0;

  static create(value: IStatsRankAtk) {
    const obj = new StatsRankAtk();
    Object.assign(obj, value);
    return obj;
  }
}

interface IStatsRankDef extends OptionsRank {
  ranking: IStatsDef[];
}

// tslint:disable-next-line:max-classes-per-file
export class StatsRankDef implements IStatsRankDef {
  ranking: IStatsDef[] = [];
  minRank: number = 0;
  maxRank: number = 0;
  minStats: number = 0;
  maxStats: number = 0;

  static create(value: IStatsRankDef) {
    const obj = new StatsRankDef();
    Object.assign(obj, value);
    return obj;
  }
}

interface IStatsRankSta extends OptionsRank {
  ranking: IStatsSta[];
}

// tslint:disable-next-line:max-classes-per-file
export class StatsRankSta implements IStatsRankSta {
  ranking: IStatsSta[] = [];
  minRank: number = 0;
  maxRank: number = 0;
  minStats: number = 0;
  maxStats: number = 0;

  static create(value: IStatsRankSta) {
    const obj = new StatsRankSta();
    Object.assign(obj, value);
    return obj;
  }
}

interface IStatsRankProd extends OptionsRank {
  ranking: IStatsProd[];
}

// tslint:disable-next-line:max-classes-per-file
export class StatsRankProd implements IStatsRankProd {
  ranking: IStatsProd[] = [];
  minRank: number = 0;
  maxRank: number = 0;
  minStats: number = 0;
  maxStats: number = 0;

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

// tslint:disable-next-line:max-classes-per-file
export class StatsRank implements IStatsRank {
  attack: IStatsRankAtk = new StatsRankAtk();
  defense: IStatsRankDef = new StatsRankDef();
  stamina: IStatsRankSta = new StatsRankSta();
  statProd: IStatsRankProd = new StatsRankProd();

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
  atk: number = 0;
  def: number = 0;
  sta?: number;

  static setValue(atk: number, def: number, sta?: number) {
    const obj = new StatsBase();
    obj.atk = atk;
    obj.def = def;
    obj.sta = sta ?? 0;
    return obj;
  }
}

export interface IStatsPokemonGO {
  atk: number;
  def: number;
  sta: number;
  prod: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsPokemonGO implements IStatsPokemonGO {
  atk: number = 0;
  def: number = 0;
  sta: number = 0;
  prod: number = 0;

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

// tslint:disable-next-line:max-classes-per-file
export class HexagonStats implements IHexagonStats {
  lead: number = 0;
  atk: number = 0;
  cons: number = 0;
  closer: number = 0;
  charger: number = 0;
  switching: number = 0;

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

export interface IStatsAtk extends OptionsStats {
  attack: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsAtk implements IStatsAtk {
  attack: number = 0;
  rank: number = 0;
  id?: number | undefined;
  form?: string | undefined;

  static create(value: IStatsAtk) {
    const obj = new StatsAtk();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsDef extends OptionsStats {
  defense: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsDef implements IStatsDef {
  defense: number = 0;
  rank: number = 0;
  id?: number | undefined;
  form?: string | undefined;

  static create(value: IStatsDef) {
    const obj = new StatsDef();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsSta extends OptionsStats {
  stamina: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsSta implements IStatsSta {
  stamina: number = 0;
  rank: number = 0;
  id?: number | undefined;
  form?: string | undefined;

  static create(value: IStatsSta) {
    const obj = new StatsSta();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsProd extends OptionsStats {
  prod: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsProd implements IStatsProd {
  prod: number = 0;
  rank: number = 0;
  id?: number | undefined;
  form?: string | undefined;

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
  baseForme: string | null;
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
  statProd: IStatsProd;
  types: string[];
  url?: string;
  releasedGO: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonStatsRanking implements IPokemonStatsRanking {
  num: number = 0;
  name: string = '';
  slug: string = '';
  forme: string | null = '';
  sprite: string = '';
  baseForme: string | null = '';
  baseSpecies: string | null = '';
  rank?: number;
  gen: number = 0;
  region: string | null = '';
  version: string | null = '';
  weightkg: number = 0;
  heightm: number = 0;
  atk: IStatsAtk = new StatsAtk();
  def: IStatsDef = new StatsDef();
  sta: IStatsSta = new StatsSta();
  statProd: IStatsProd = new StatsProd();
  types: string[] = [];
  url?: string;
  releasedGO: boolean = false;

  constructor({ ...props }: IPokemonStatsRanking) {
    Object.assign(this, props);
  }
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
