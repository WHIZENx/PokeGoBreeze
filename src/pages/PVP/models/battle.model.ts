/* eslint-disable no-unused-vars */
import { Combat, IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IStatsAtk, IStatsDef, IStatsProd, IStatsSta, IStatsBase, StatsBase } from '../../../core/models/stats.model';
import { IBattleBaseStats } from '../../../util/models/calculate.model';
import { DEFAULT_BLOCK } from '../Battle/Constants';

export enum ChargeType {
  None = -1,
  Random = 0,
  Primary = 1,
  Secondary = 2,
}

export interface IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  shadow: boolean;
  allStats?: IBattleBaseStats[];
  hp: number;
  stats: IStatsBase | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | undefined;
  fMove: ICombat | undefined | null;
  cMove: ICombat | undefined | null;
  cMoveSec: ICombat | undefined | null;
  energy: number;
  block: number;
  turn: number;
  disableCMoveSec: boolean;
  disableCMovePri: boolean;
}

export class PokemonBattleData implements IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  shadow = false;
  allStats?: IBattleBaseStats[];
  hp = 0;
  stats: IStatsBase | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | undefined;
  fMove = new Combat();
  cMove = new Combat();
  cMoveSec = new Combat();
  energy = 0;
  block = 0;
  turn = 0;
  disableCMoveSec = false;
  disableCMovePri = false;

  static create(value: IPokemonBattleData) {
    const obj = new PokemonBattleData();
    Object.assign(obj, value);
    return obj;
  }

  static setValue(energy: number, hp: number) {
    const obj = new PokemonBattleData();
    obj.energy = energy;
    obj.hp = hp;
    return obj;
  }
}

export interface IPokemonBattle {
  disableCMoveSec: boolean;
  disableCMovePri: boolean;
  shadow?: boolean;
  pokemonData?: IPokemonBattleData | null;
  fMove?: ICombat | null;
  cMovePri?: ICombat | null;
  cMoveSec?: ICombat | null;
  timeline: ITimeline[];
  energy: number;
  block: number;
  chargeSlot: number;
  audio?: any;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonBattle implements IPokemonBattle {
  disableCMoveSec = false;
  disableCMovePri = false;
  shadow?: boolean;
  pokemonData?: IPokemonBattleData | null;
  fMove?: ICombat | null;
  cMovePri?: ICombat | null;
  cMoveSec?: ICombat | null;
  timeline: ITimeline[];
  energy: number;
  block: number;
  chargeSlot: number;
  audio?: any;

  constructor() {
    this.timeline = [];
    this.energy = 0;
    this.block = DEFAULT_BLOCK;
    this.chargeSlot = ChargeType.Primary;
  }

  static create(value: IPokemonBattle) {
    const obj = new PokemonBattle();
    Object.assign(obj, value);
    return obj;
  }
}

export interface ITimeline {
  timer: number;
  type: string | undefined;
  color: string | undefined;
  size: number;
  tap: boolean;
  block: number;
  energy: number;
  move: ICombat | undefined;
  hp: number;
  buff?: IBuff[];
  dmgImmune: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class TimelineModel implements ITimeline {
  timer = 0;
  type: string | undefined;
  color: string | undefined;
  size = 0;
  tap = false;
  block = 0;
  energy = 0;
  move: ICombat | undefined;
  hp = 0;
  buff: IBuff[] | undefined;
  dmgImmune = false;

  constructor({ ...props }: ITimeline) {
    Object.assign(this, props);
  }
}

export interface IPokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: IPokemonData | undefined;
  form: string | undefined | null;
  stats: IStatsBase;
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  shadow: boolean;
  purified: boolean | undefined;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonTeamData implements IPokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId = '';
  pokemonData: IPokemonData | undefined;
  form = '';
  stats = new StatsBase();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  shadow = false;
  purified: boolean | undefined;

  constructor({ ...props }: IPokemonTeamData) {
    Object.assign(this, props);
  }
}

export interface IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  speciesId?: string;
  pokemon: IPokemonData | undefined;
  form: string | undefined | null;
  stats: IStatsBase;
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  prod: IStatsProd | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  bestStats?: IBattleBaseStats;
  shadow: boolean;
  purified: boolean | undefined;
  score: number;
}

// tslint:disable-next-line:max-classes-per-file
export class PokemonBattleRanking implements IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  speciesId?: string;
  pokemon: IPokemonData | undefined;
  form = '';
  stats = new StatsBase();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  prod: IStatsProd | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  bestStats?: IBattleBaseStats;
  shadow = false;
  purified = false;
  score = 0;

  constructor({ ...props }: IPokemonBattleRanking) {
    Object.assign(this, props);
  }
}

export interface TimelineEvent<T, E = object> extends React.SyntheticEvent<T, E>, React.MouseEvent<T, E> {
  nativeEvent: E;
  changedTouches: TouchList;
}

export interface TimelineElement<T> {
  (e: TimelineEvent<T>): void;
  bind?: any;
}
