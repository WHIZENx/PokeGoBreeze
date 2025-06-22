import { IPokemonDetail } from '../../core/models/API/info.model';
import { ICombat } from '../../core/models/combat.model';
import { IEvoList, PokemonTypeCost, ITempEvo } from '../../core/models/evolution.model';
import { IOptions } from '../../core/models/options.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { IStatsIV, IStatsPokemonGO, StatsIV } from '../../core/models/stats.model';
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
  types: string[] | undefined;
  pokemonType?: PokemonType;
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
  types: string[] | undefined = [];
  pokemonType?: PokemonType;
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
  IV: IStatsIV;
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
  pokemonType?: PokemonType;
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
  pokemonType?: PokemonType;
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
  IV: IStatsIV;
  CP: number;
  level: number;
  isLimit: boolean;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsPokemonGO;
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
  IV: IStatsIV;
  result: IPredictCPModel[];
}

interface IStatsBaseCalculate {
  statATK: number;
  statDEF: number;
  statSTA: number;
  statPROD: number;
}

export class StatsBaseCalculate implements IStatsBaseCalculate {
  statATK = 0;
  statDEF = 0;
  statSTA = 0;
  statPROD = 0;

  static create(atk: number, def: number, sta: number) {
    const obj = new StatsBaseCalculate();
    obj.statATK = atk;
    obj.statDEF = def;
    obj.statSTA = sta;
    obj.statPROD = atk * def * sta;
    return obj;
  }
}

export interface IStatsProdCalculate {
  IV: IStatsIV;
  CP: number;
  level: number;
  stats: IStatsBaseCalculate;
  ratio?: number;
  rank?: number;
}

export class StatsProdCalculate implements IStatsProdCalculate {
  IV = new StatsIV();
  CP = 0;
  level = 0;
  stats = new StatsBaseCalculate();
  ratio?: number;
  rank?: number;
}

export interface IQueryStatesEvoChain {
  battleLeague: IBattleLeague;
  maxCP: number | undefined;
  form: string | undefined;
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
  form: string | undefined;
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
  IV?: IStatsIV;
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
  pokemonType?: PokemonType;
}

export class BattleBaseStats implements IBattleBaseStats {
  CP?: number;
  IV?: IStatsIV;
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
  pokemonType?: PokemonType;

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
  combats: ICombat[] = [];
  pokemon: IPokemonData;
  def: number;
  types: string[] | undefined = [];
  dataList: IPokemonQueryCounter[];

  constructor(
    globalOptions: IOptions | undefined,
    typeEff: ITypeEff | undefined,
    weatherBoost: IWeatherBoost | undefined,
    combats: ICombat[],
    pokemon: IPokemonData,
    def: number,
    types: string[] | undefined,
    dataList: IPokemonQueryCounter[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combats = combats;
    this.pokemon = pokemon;
    this.def = def;
    this.types = getValueOrDefault(Array, types);
    this.dataList = dataList;
  }
}

export class QueryMovesPokemon {
  globalOptions: IOptions | undefined;
  typeEff: ITypeEff | undefined;
  weatherBoost: IWeatherBoost | undefined;
  combats: ICombat[] = [];
  pokemon: Partial<IPokemonDetail>;
  atk: number;
  def: number;
  sta: number;
  types: string[] = [];
  dataList: IPokemonQueryMove[];

  constructor(
    globalOptions: IOptions | undefined,
    typeEff: ITypeEff | undefined,
    weatherBoost: IWeatherBoost | undefined,
    combats: ICombat[],
    pokemon: Partial<IPokemonDetail>,
    atk: number | undefined,
    def: number | undefined,
    sta: number | undefined,
    types: string[] | undefined,
    dataList: IPokemonQueryMove[] = []
  ) {
    this.globalOptions = globalOptions;
    this.typeEff = typeEff;
    this.weatherBoost = weatherBoost;
    this.combats = combats;
    this.pokemon = pokemon;
    this.atk = toNumber(atk);
    this.def = toNumber(def);
    this.sta = toNumber(sta);
    this.types = getValueOrDefault(Array, types);
    this.dataList = dataList;
  }
}

export class StatsCalculate implements IStatsCalculate {
  IV = new StatsIV();
  CP: number;
  level: number;

  constructor(atkIV: number, defIV: number, staIV: number, CP: number, level: number) {
    this.IV = StatsIV.setValue(atkIV, defIV, staIV);
    this.CP = CP;
    this.level = level;
  }
}

export class BattleLeagueCalculate implements IBattleLeagueCalculate {
  isElidge = false;
  maxCP?: number;
  IV = new StatsIV();
  CP = 0;
  level = 0;
  isLimit = false;
  rangeValue?: IBetweenLevelCalculate;
  stats?: IStatsPokemonGO;

  constructor(
    isElidge: boolean,
    maxCP?: number,
    atkIV?: number,
    defIV?: number,
    staIV?: number,
    CP?: number,
    level?: number,
    isLimit?: boolean
  ) {
    this.isElidge = isElidge;
    this.maxCP = maxCP;
    this.IV = StatsIV.setValue(atkIV, defIV, staIV);
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
  IV: IStatsIV;
  result: IPredictCPModel[];

  constructor(atkIV: number, defIV: number, staIV: number, result: IPredictCPModel[]) {
    this.IV = StatsIV.setValue(atkIV, defIV, staIV);
    this.result = result;
  }
}

export interface ICalculateDPS {
  fastDamage: number;
  chargeDamage: number;
  fastDuration: number;
  fastDelay?: number;
  chargeDuration: number;
  chargeDelay?: number;
  fastEnergy: number;
  chargeDamageWindowStart: number;
  chargeEnergy: number;
  y: number;
  hp?: number;
}

export class CalculateDPS implements ICalculateDPS {
  fastDamage = 0;
  chargeDamage = 0;
  fastDuration = 0;
  fastDelay?: number;
  chargeDuration = 0;
  chargeDelay?: number;
  fastEnergy = 0;
  chargeDamageWindowStart = 0;
  chargeEnergy = 0;
  y = 0;
  hp?: number;

  constructor({ ...props }: ICalculateDPS) {
    Object.assign(this, props);
  }
}
