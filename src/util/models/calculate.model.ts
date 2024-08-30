import { ICombat } from '../../core/models/combat.model';
import { IEvoList, PokemonTypeCost, ITempEvo } from '../../core/models/evolution.model';
import { IOptions } from '../../core/models/options.model';
import { IPokemonData, PokemonData } from '../../core/models/pokemon.model';
import { IStatsBase, StatsBase, StatsPokemonGO } from '../../core/models/stats.model';
import { ITypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';
import { IPokemonQueryCounter, IPokemonQueryMove } from './pokemon-top-move.model';

export interface IBattleCalculate {
  atk?: number;
  def: number;
  hp?: number;
  fMove?: ICombat;
  cMove?: ICombat;
  types: string[];
  shadow?: boolean;
  isStab?: boolean;
  weatherBoosts?: string;
  pokemonFriend?: boolean;
  pokemonFriendLevel?: number;
  isDoubleCharge?: boolean;
  cMoveSec?: ICombat;
}

export class BattleCalculate implements IBattleCalculate {
  atk?: number = 0;
  def: number = 0;
  hp?: number;
  fMove?: ICombat;
  cMove?: ICombat;
  types: string[] = [];
  shadow?: boolean;
  isStab?: boolean;
  weatherBoosts?: string;
  pokemonFriend?: boolean;
  pokemonFriendLevel?: number;
  isDoubleCharge?: boolean;
  cMoveSec?: ICombat;

  constructor({ ...props }: IBattleCalculate) {
    Object.assign(this, props);
  }
}

interface IStatsLeagueCalculate {
  CP: number;
  level: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsLeagueCalculate implements IStatsLeagueCalculate {
  CP: number = 0;
  level: number = 0;

  constructor({ ...props }: IStatsLeagueCalculate) {
    Object.assign(this, props);
  }
}

export interface IStatsCalculate {
  IV: IStatsBase;
  CP: number;
  level: number;
}

export interface IBetweenLevelCalculate {
  CP: number;
  resultBetweenStadust: number;
  resultBetweenStadustDiff?: number;
  resultBetweenCandy: number;
  resultBetweenCandyDiff?: number;
  resultBetweenXLCandy: number;
  resultBetweenXLCandyDiff?: number;
  powerUpCount?: number;
  type?: string;
  atkStat?: number;
  defStat?: number;
  atkStatDiff?: number;
  defStatDiff?: number;
}

// tslint:disable-next-line:max-classes-per-file
export class BetweenLevelCalculate implements IBetweenLevelCalculate {
  CP: number = 0;
  resultBetweenStadust: number = 0;
  resultBetweenStadustDiff?: number;
  resultBetweenCandy: number = 0;
  resultBetweenCandyDiff?: number;
  resultBetweenXLCandy: number = 0;
  resultBetweenXLCandyDiff?: number;
  powerUpCount?: number;
  type?: string;
  atkStat?: number;
  defStat?: number;
  atkStatDiff?: number;
  defStatDiff?: number;

  constructor({ ...props }: IBetweenLevelCalculate) {
    Object.assign(this, props);
  }
}

export interface IBattleLeagueCalculate {
  elidge: boolean;
  maxCP?: number;
  IV: IStatsBase;
  CP: number;
  level: number;
  limit: boolean;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsBase;
}

export interface IPredictStatsModel {
  atk: number;
  def: number;
  sta: number;
  level: number;
  percent: number;
  hp: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PredictStatsModel implements IPredictStatsModel {
  atk: number = 0;
  def: number = 0;
  sta: number = 0;
  level: number = 0;
  percent: number = 0;
  hp: number = 0;

  static create(value: IPredictStatsModel) {
    const obj = new PredictStatsModel();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPredictStatsCalculate {
  CP: number;
  minLevel: number;
  maxLevel: number;
  result: IPredictStatsModel[];
}

export interface IPredictCPModel {
  level: number;
  CP: number;
  hp: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PredictCPModel implements IPredictCPModel {
  level: number = 0;
  CP: number = 0;
  hp: number = 0;

  static create(value: IPredictCPModel) {
    const obj = new PredictCPModel();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IPredictCPCalculate {
  IV: IStatsBase;
  result: IPredictCPModel[];
}

interface IStatsBaseCalculate {
  statsATK: number;
  statsDEF: number;
  statsSTA: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsBaseCalculate implements IStatsBaseCalculate {
  statsATK: number;
  statsDEF: number;
  statsSTA: number;

  constructor() {
    this.statsATK = 0;
    this.statsDEF = 0;
    this.statsSTA = 0;
  }

  static create(value: IStatsBaseCalculate) {
    const obj = new StatsBaseCalculate();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IStatsProdCalculate {
  IV: IStatsBase;
  CP: number;
  level: number;
  stats: IStatsBaseCalculate;
  statsProds: number;
  ratio?: number;
  rank?: number;
}

// tslint:disable-next-line:max-classes-per-file
export class StatsProdCalculate implements IStatsProdCalculate {
  IV: IStatsBase;
  CP: number;
  level: number;
  stats: IStatsBaseCalculate;
  statsProds: number;
  ratio?: number;
  rank?: number;

  constructor() {
    this.IV = new StatsPokemonGO();
    this.CP = 0;
    this.level = 0;
    this.stats = new StatsBaseCalculate();
    this.statsProds = 0;
  }
}

export interface IQueryStatesEvoChain {
  battleLeague: IBattleLeague;
  maxCP: number;
  form: string;
  id: number;
  name: string;
  prev?: string;
  evoList: IEvoList[];
  tempEvo: ITempEvo[];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  canPurified?: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class QueryStatesEvoChain implements IQueryStatesEvoChain {
  battleLeague: IBattleLeague = new BattleLeague();
  maxCP: number = 0;
  form: string = '';
  id: number = 0;
  name: string = '';
  prev?: string;
  evoList: IEvoList[] = [];
  tempEvo: ITempEvo[] = [];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  canPurified?: boolean;

  constructor({ ...props }: IQueryStatesEvoChain) {
    Object.assign(this, props);
  }
}

export interface IBattleBaseStats {
  CP?: number;
  IV?: IStatsBase;
  form?: string;
  id: number;
  league?: string;
  level?: number;
  maxCP?: number;
  name?: string;
  powerUpCount?: number;
  rank?: number;
  ratio?: number;
  resultBetweenCandy?: number;
  resultBetweenCandyDiff?: number;
  resultBetweenStadust?: number;
  resultBetweenStadustDiff?: number;
  resultBetweenXLCandy?: number;
  resultBetweenXLCandyDiff?: number;
  stats?: IStatsBaseCalculate;
  statsProds?: number;
  type?: string;
}

// tslint:disable-next-line:max-classes-per-file
export class BattleBaseStats implements IBattleBaseStats {
  CP?: number;
  IV?: IStatsBase;
  form?: string;
  id: number = 0;
  league?: string;
  level?: number;
  maxCP?: number;
  name?: string;
  powerUpCount?: number;
  rank?: number;
  ratio?: number;
  resultBetweenCandy?: number;
  resultBetweenCandyDiff?: number;
  resultBetweenStadust?: number;
  resultBetweenStadustDiff?: number;
  resultBetweenXLCandy?: number;
  resultBetweenXLCandyDiff?: number;
  stats?: IStatsBaseCalculate;
  statsProds?: number;
  type?: string;

  static create(value: IBattleBaseStats) {
    const obj = new BattleBaseStats();
    Object.assign(obj, value);
    return obj;
  }
}

export interface IBattleLeague {
  little: IBattleBaseStats;
  great: IBattleBaseStats;
  ultra: IBattleBaseStats;
  master: IBattleBaseStats;
}

// tslint:disable-next-line:max-classes-per-file
export class BattleLeague implements IBattleLeague {
  little: IBattleBaseStats;
  great: IBattleBaseStats;
  ultra: IBattleBaseStats;
  master: IBattleBaseStats;

  constructor() {
    this.little = new BattleBaseStats();
    this.great = new BattleBaseStats();
    this.ultra = new BattleBaseStats();
    this.master = new BattleBaseStats();
  }
}

// tslint:disable-next-line:max-classes-per-file
export class QueryMovesCounterPokemon {
  globalOptions: IOptions | undefined;
  typeEff: ITypeEff | undefined;
  weatherBoost: IWeatherBoost | undefined;
  combat: ICombat[] = [];
  pokemon: IPokemonData;
  def: number;
  types: string[] = [];
  dataList: IPokemonQueryCounter[];

  constructor(
    globalOptions: IOptions | undefined,
    typeEff: ITypeEff | undefined,
    weatherBoost: IWeatherBoost | undefined,
    combat: ICombat[],
    pokemon: IPokemonData,
    def: number,
    types: string[],
    dataList: IPokemonQueryCounter[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combat = combat;
    this.pokemon = pokemon;
    this.def = def;
    this.types = types;
    this.dataList = dataList;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class QueryMovesPokemon {
  globalOptions: IOptions | undefined;
  typeEff: ITypeEff | undefined;
  weatherBoost: IWeatherBoost | undefined;
  combat: ICombat[] = [];
  pokemon: IPokemonData = new PokemonData();
  atk: number;
  def: number;
  sta: number;
  types: string[] = [];
  dataList: IPokemonQueryMove[];

  constructor(
    globalOptions: IOptions | undefined,
    typeEff: ITypeEff | undefined,
    weatherBoost: IWeatherBoost | undefined,
    combat: ICombat[],
    atk: number,
    def: number,
    sta: number,
    types: string[],
    dataList: IPokemonQueryMove[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combat = combat;
    this.atk = atk;
    this.def = def;
    this.sta = sta;
    this.types = types;
    this.dataList = dataList;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class StatsCalculate implements IStatsCalculate {
  IV: IStatsBase = new StatsBase();
  CP: number;
  level: number;

  constructor(atk: number, def: number, sta: number, CP: number, level: number) {
    this.IV.atk = atk;
    this.IV.def = def;
    this.IV.sta = sta;
    this.CP = CP;
    this.level = level;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class BattleLeagueCalculate implements IBattleLeagueCalculate {
  elidge: boolean = false;
  maxCP?: number;
  IV: IStatsBase = new StatsBase();
  CP: number = 0;
  level: number = 0;
  limit: boolean = false;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsBase;

  constructor(elidge: boolean, maxCP?: number, atk?: number, def?: number, sta?: number, CP?: number, level?: number, limit?: boolean) {
    this.elidge = elidge;
    this.maxCP = maxCP;
    this.IV = new StatsPokemonGO();
    this.IV.atk = atk ?? 0;
    this.IV.atk = def ?? 0;
    this.IV.atk = sta ?? 0;
    this.CP = CP ?? 0;
    this.level = level ?? 0;
    this.limit = limit ?? false;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PredictStatsCalculate implements IPredictStatsCalculate {
  CP: number;
  minLevel: number;
  maxLevel: number;
  result: IPredictStatsModel[];

  constructor(CP: number, minLevel: number, maxLevel: number, result: IPredictStatsModel[]) {
    this.CP = CP;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.result = result;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class PredictCPCalculate implements IPredictCPCalculate {
  IV: IStatsBase;
  result: IPredictCPModel[];

  constructor(atk: number, def: number, sta: number, result: IPredictCPModel[]) {
    this.IV = new StatsPokemonGO();
    this.IV.atk = atk;
    this.IV.atk = def;
    this.IV.atk = sta;
    this.result = result;
  }
}
