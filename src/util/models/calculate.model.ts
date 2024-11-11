import { ICombat } from '../../core/models/combat.model';
import { IEvoList, PokemonTypeCost, ITempEvo } from '../../core/models/evolution.model';
import { IOptions } from '../../core/models/options.model';
import { IPokemonData, PokemonData } from '../../core/models/pokemon.model';
import { IStatsBase, StatsBase, StatsPokemonGO } from '../../core/models/stats.model';
import { ITypeEff } from '../../core/models/type-eff.model';
import { IWeatherBoost } from '../../core/models/weatherBoost.model';
import { PokemonType } from '../../enums/type.enum';
import { getValueOrDefault, toNumber } from '../extension';
import { IPokemonQueryCounter, IPokemonQueryMove } from './pokemon-top-move.model';

export interface IBattleCalculate {
  atk?: number;
  def: number;
  hp?: number;
  fMove?: ICombat;
  cMove?: ICombat;
  types: string[];
  isShadow?: boolean;
  isStab?: boolean;
  weatherBoosts?: string;
  isPokemonFriend?: boolean;
  pokemonFriendLevel?: number;
  isDoubleCharge?: boolean;
  cMoveSec?: ICombat;
}

export class BattleCalculate implements IBattleCalculate {
  atk = 0;
  def = 0;
  hp?: number;
  fMove?: ICombat;
  cMove?: ICombat;
  types: string[] = [];
  isShadow?: boolean;
  isStab?: boolean;
  weatherBoosts?: string;
  isPokemonFriend?: boolean;
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

export class StatsLeagueCalculate implements IStatsLeagueCalculate {
  CP = 0;
  level = 0;

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
  resultBetweenStardust: number;
  resultBetweenStardustDiff?: number;
  resultBetweenCandy: number;
  resultBetweenCandyDiff?: number;
  resultBetweenXLCandy: number;
  resultBetweenXLCandyDiff?: number;
  powerUpCount?: number;
  type?: PokemonType;
  atkStat?: number;
  defStat?: number;
  atkStatDiff?: number;
  defStatDiff?: number;
}

export class BetweenLevelCalculate implements IBetweenLevelCalculate {
  CP = 0;
  resultBetweenStardust = 0;
  resultBetweenStardustDiff?: number;
  resultBetweenCandy = 0;
  resultBetweenCandyDiff?: number;
  resultBetweenXLCandy = 0;
  resultBetweenXLCandyDiff?: number;
  powerUpCount?: number;
  type?: PokemonType;
  atkStat?: number;
  defStat?: number;
  atkStatDiff?: number;
  defStatDiff?: number;

  constructor({ ...props }: IBetweenLevelCalculate) {
    Object.assign(this, props);
  }
}

export interface IBattleLeagueCalculate {
  isElidge: boolean;
  maxCP?: number;
  IV: IStatsBase;
  CP: number;
  level: number;
  isLimit: boolean;
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

export class PredictStatsModel implements IPredictStatsModel {
  atk = 0;
  def = 0;
  sta = 0;
  level = 0;
  percent = 0;
  hp = 0;

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

export class PredictCPModel implements IPredictCPModel {
  level = 0;
  CP = 0;
  hp = 0;

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

export class StatsBaseCalculate implements IStatsBaseCalculate {
  statsATK = 0;
  statsDEF = 0;
  statsSTA = 0;

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

export class StatsProdCalculate implements IStatsProdCalculate {
  IV = new StatsPokemonGO();
  CP = 0;
  level = 0;
  stats = new StatsBaseCalculate();
  statsProds = 0;
  ratio?: number;
  rank?: number;
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
  pokemonType?: PokemonType;
}

export class QueryStatesEvoChain implements IQueryStatesEvoChain {
  battleLeague = new BattleLeague();
  maxCP = 0;
  form = '';
  id = 0;
  name = '';
  prev?: string;
  evoList: IEvoList[] = [];
  tempEvo: ITempEvo[] = [];
  purified?: PokemonTypeCost;
  thirdMove?: PokemonTypeCost;
  pokemonType?: PokemonType;

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
  resultBetweenStardust?: number;
  resultBetweenStardustDiff?: number;
  resultBetweenXLCandy?: number;
  resultBetweenXLCandyDiff?: number;
  stats?: IStatsBaseCalculate;
  statsProds?: number;
  type?: string;
}

export class BattleBaseStats implements IBattleBaseStats {
  CP?: number;
  IV?: IStatsBase;
  form?: string;
  id = 0;
  league?: string;
  level?: number;
  maxCP?: number;
  name?: string;
  powerUpCount?: number;
  rank?: number;
  ratio?: number;
  resultBetweenCandy?: number;
  resultBetweenCandyDiff?: number;
  resultBetweenStardust?: number;
  resultBetweenStardustDiff?: number;
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

export class BattleLeague implements IBattleLeague {
  little = new BattleBaseStats();
  great = new BattleBaseStats();
  ultra = new BattleBaseStats();
  master = new BattleBaseStats();
}

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

export class QueryMovesPokemon {
  globalOptions: IOptions | undefined;
  typeEff: ITypeEff | undefined;
  weatherBoost: IWeatherBoost | undefined;
  combat: ICombat[] = [];
  pokemon = new PokemonData();
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

export class StatsCalculate implements IStatsCalculate {
  IV = new StatsBase();
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

export class BattleLeagueCalculate implements IBattleLeagueCalculate {
  isElidge = false;
  maxCP?: number;
  IV = new StatsBase();
  CP = 0;
  level = 0;
  isLimit = false;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsBase;

  constructor(isElidge: boolean, maxCP?: number, atk?: number, def?: number, sta?: number, CP?: number, level?: number, isLimit?: boolean) {
    this.isElidge = isElidge;
    this.maxCP = maxCP;
    this.IV = new StatsPokemonGO();
    this.IV.atk = toNumber(atk);
    this.IV.def = toNumber(def);
    this.IV.sta = toNumber(sta);
    this.CP = toNumber(CP);
    this.level = toNumber(level);
    this.isLimit = getValueOrDefault(Boolean, isLimit);
  }
}

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

export class PredictCPCalculate implements IPredictCPCalculate {
  IV: IStatsBase;
  result: IPredictCPModel[];

  constructor(atk: number, def: number, sta: number, result: IPredictCPModel[]) {
    this.IV = new StatsPokemonGO();
    this.IV.atk = atk;
    this.IV.def = def;
    this.IV.sta = sta;
    this.result = result;
  }
}
