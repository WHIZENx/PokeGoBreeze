import { PokemonType } from '../../enums/type.enum';
import { MAX_IV, MIN_IV } from '../../util/constants';
import { toNumber } from '../../util/extension';

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

export interface IStatsIV {
  atkIV: number;
  defIV: number;
  staIV: number;
}

export class StatsIV implements IStatsIV {
  atkIV = 0;
  defIV = 0;
  staIV = 0;

  static setValue(atkIV = MIN_IV, defIV = MIN_IV, staIV = MIN_IV) {
    const obj = new StatsIV();
    obj.atkIV = Math.max(MIN_IV, Math.min(atkIV, MAX_IV));
    obj.defIV = Math.max(MIN_IV, Math.min(defIV, MAX_IV));
    obj.staIV = Math.max(MIN_IV, Math.min(staIV, MAX_IV));
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

  constructor() {
    this.prod = this.atk * this.def * this.sta;
  }

  static create(atk?: number, def?: number, sta?: number, prod = 0) {
    const obj = new StatsPokemonGO();
    obj.atk = toNumber(atk);
    obj.def = toNumber(def);
    obj.sta = toNumber(sta);
    obj.prod = prod > 0 ? prod : obj.atk * obj.def * obj.sta;
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

  static create(scores: number[] | undefined) {
    const obj = new HexagonStats();
    obj.lead = toNumber(scores?.at(0));
    obj.closer = toNumber(scores?.at(1));
    obj.switching = toNumber(scores?.at(2));
    obj.charger = toNumber(scores?.at(3));
    obj.atk = toNumber(scores?.at(4));
    obj.cons = toNumber(scores?.at(5));
    return obj;
  }

  static render(value: IHexagonStats) {
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
  attack?: number;
  rank: number | undefined;
}

export class StatsAtk implements IStatsAtk {
  attack = 0;
  rank: number | undefined;

  static create(value: IStatsAtk) {
    const obj = new StatsAtk();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsDef extends Partial<OptionsStats> {
  defense?: number;
  rank: number | undefined;
}

export class StatsDef implements IStatsDef {
  defense = 0;
  rank: number | undefined;

  static create(value: IStatsDef) {
    const obj = new StatsDef();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsSta extends Partial<OptionsStats> {
  stamina?: number;
  rank: number | undefined;
}

export class StatsSta implements IStatsSta {
  stamina = 0;
  rank: number | undefined;

  static create(value: IStatsSta) {
    const obj = new StatsSta();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsProd extends Partial<OptionsStats> {
  product?: number;
  rank: number | undefined;
}

export class StatsProd implements IStatsProd {
  product = 0;
  rank: number | undefined;

  static create(value: IStatsProd) {
    const obj = new StatsProd();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPokemonStatsRanking {
  id?: number;
  num: number;
  name: string;
  slug: string;
  form: string | undefined;
  sprite: string;
  baseForme: string | undefined;
  baseSpecies: string | undefined;
  rank?: number;
  gen: number;
  region: string | undefined;
  version: string | undefined;
  weightKg: number;
  heightM: number;
  atk: IStatsAtk;
  def: IStatsDef;
  sta: IStatsSta;
  prod: IStatsProd;
  types: string[] | undefined;
  url?: string;
  releasedGO: boolean;
  fullName?: string;
  pokemonType?: PokemonType;
}

export class PokemonStatsRanking implements IPokemonStatsRanking {
  id?: number;
  num = 0;
  name = '';
  slug = '';
  form: string | undefined;
  sprite = '';
  baseForme: string | undefined;
  baseSpecies: string | undefined;
  rank?: number;
  gen = 0;
  region: string | undefined;
  version: string | undefined;
  weightKg = 0;
  heightM = 0;
  atk = new StatsAtk();
  def = new StatsDef();
  sta = new StatsSta();
  prod = new StatsProd();
  types: string[] | undefined = [];
  url?: string;
  releasedGO = false;
  fullName?: string;
  pokemonType?: PokemonType;

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
  attackRank: number | undefined;
  defenseRank: number | undefined;
  staminaRank: number | undefined;
  statProdRank: number | undefined;
}

export class StatsRankPokemonGO implements IStatsRankPokemonGO {
  attackRank: number | undefined;
  defenseRank: number | undefined;
  staminaRank: number | undefined;
  statProdRank: number | undefined;
}
