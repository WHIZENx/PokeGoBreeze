/* eslint-disable no-unused-vars */
import { Combat, IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IStatsAtk, IStatsDef, IStatsPokemon, IStatsProd, IStatsSta, IStatsBase, StatsPokemon } from '../../../core/models/stats.model';
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
  pokemon: IPokemonData | null;
  fMove: ICombat | null;
  cMove: ICombat | null;
  cMoveSec: ICombat | null;
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
  shadow: boolean = false;
  allStats?: IBattleBaseStats[];
  hp: number = 0;
  stats: IStatsBase | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | null = null;
  fMove: ICombat | null = new Combat();
  cMove: ICombat | null = new Combat();
  cMoveSec: ICombat | null = new Combat();
  energy: number = 0;
  block: number = 0;
  turn: number = 0;
  disableCMoveSec: boolean = false;
  disableCMovePri: boolean = false;

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
  disableCMoveSec: boolean = false;
  disableCMovePri: boolean = false;
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
  type: string | null;
  color: string | null;
  size: number;
  tap: boolean;
  block: number;
  energy: number;
  move: ICombat | null;
  hp: number;
  buff: IBuff[] | null;
  dmgImmune: boolean;
}

// tslint:disable-next-line:max-classes-per-file
export class TimelineModel implements ITimeline {
  timer: number = 0;
  type: string | null = null;
  color: string | null = null;
  size: number = 0;
  tap: boolean = false;
  block: number = 0;
  energy: number = 0;
  move: ICombat | null = null;
  hp: number = 0;
  buff: IBuff[] | null = null;
  dmgImmune: boolean = false;

  constructor({ ...props }: ITimeline) {
    Object.assign(this, props);
  }
}

export interface IPokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: IPokemonData | undefined;
  form: string | null;
  stats: IStatsPokemon;
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
  speciesId: string = '';
  pokemonData: IPokemonData | undefined;
  form: string | null = '';
  stats: IStatsPokemon = new StatsPokemon();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  shadow: boolean = false;
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
  form: string | null;
  stats: IStatsPokemon;
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
  form: string | null = '';
  stats: IStatsPokemon = new StatsPokemon();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  prod: IStatsProd | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  bestStats?: IBattleBaseStats;
  shadow: boolean = false;
  purified: boolean | undefined = false;
  score: number = 0;

  constructor({ ...props }: IPokemonBattleRanking) {
    Object.assign(this, props);
  }
}
