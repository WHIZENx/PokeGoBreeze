/* eslint-disable no-unused-vars */
import { Combat, IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { IStatsAtk, IStatsDef, IStatsProd, IStatsSta, IStatsBase, StatsBase } from '../../../core/models/stats.model';
import { PokemonType } from '../../../enums/type.enum';
import { toNumber } from '../../../util/extension';
import { IBattleBaseStats } from '../../../util/models/calculate.model';
import { getPokemonType } from '../../../util/utils';
import { DEFAULT_BLOCK } from '../Battle/Constants';

export enum ChargeType {
  None = -1,
  Random = 0,
  Primary = 1,
  Secondary = 2,
}

interface MoveAudio {
  fMove?: HTMLAudioElement;
  cMovePri?: HTMLAudioElement;
  cMoveSec?: HTMLAudioElement;
}

export interface IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string | null;
  id?: number;
  pokemonType: PokemonType;
  hp: number;
  stats: IStatsBase | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | undefined;
  fMove: ICombat | undefined;
  cMove: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  energy: number;
  block: number;
  turn: number;
  disableCMoveSec: boolean;
  disableCMovePri: boolean;
}

export class PokemonBattleData implements IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string | null;
  id?: number;
  pokemonType = PokemonType.Normal;
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
    obj.pokemonType = getPokemonType(obj.form);
    Object.assign(obj, value);
    return obj;
  }

  static setValue(energy: number | undefined, hp: number | undefined) {
    const obj = new PokemonBattleData();
    obj.energy = toNumber(energy);
    obj.hp = toNumber(hp);
    return obj;
  }
}

export interface IPokemonBattle {
  disableCMoveSec: boolean;
  disableCMovePri: boolean;
  pokemonType: PokemonType;
  pokemonData?: IPokemonBattleData;
  fMove?: ICombat;
  cMovePri?: ICombat;
  cMoveSec?: ICombat;
  timeline: ITimeline[];
  energy: number;
  block: number;
  chargeSlot: number;
  audio?: MoveAudio;
}

export class PokemonBattle implements IPokemonBattle {
  disableCMoveSec = false;
  disableCMovePri = false;
  pokemonType = PokemonType.Normal;
  pokemonData?: IPokemonBattleData;
  fMove?: ICombat;
  cMovePri?: ICombat;
  cMoveSec?: ICombat;
  timeline: ITimeline[] = [];
  energy = 0;
  block = DEFAULT_BLOCK;
  chargeSlot = ChargeType.Primary;
  audio?: MoveAudio;

  static create(value: IPokemonBattle) {
    const obj = new PokemonBattle();
    obj.pokemonType = obj.pokemonData?.pokemonType ?? PokemonType.Normal;
    Object.assign(obj, value);
    return obj;
  }
}

export interface ITimeline {
  timer: number;
  type?: string;
  color?: string;
  size: number;
  isTap?: boolean;
  block: number;
  energy: number;
  move?: ICombat;
  hp: number;
  buff?: IBuff[];
  isDmgImmune?: boolean;
}

export class TimelineModel implements ITimeline {
  timer = 0;
  type?: string;
  color?: string;
  size = 0;
  isTap?: boolean;
  block = 0;
  energy = 0;
  move?: ICombat;
  hp = 0;
  buff?: IBuff[];
  isDmgImmune?: boolean;

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
  pokemonType: PokemonType;
}

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
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonTeamData) {
    props.pokemonType = getPokemonType(props.form);
    Object.assign(this, props);
  }
}

export interface IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
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
  pokemonType: PokemonType;
}

export class PokemonBattleRanking implements IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
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
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonBattleRanking) {
    props.pokemonType = getPokemonType(props.form);
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
