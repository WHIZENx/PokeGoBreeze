import { Combat, IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import {
  IStatsAtk,
  IStatsDef,
  IStatsPokemonGO,
  IStatsProd,
  IStatsSta,
  StatsPokemonGO,
} from '../../../core/models/stats.model';
import { PokemonType } from '../../../enums/type.enum';
import { toNumber } from '../../../utils/extension';
import { defaultBlock } from '../../../utils/helpers/options-context.helpers';
import { IBattleBaseStats } from '../../../utils/models/calculate.model';
import { getPokemonType } from '../../../utils/utils';
import { AttackType } from '../Battle/enums/attack-type.enum';

export enum ChargeType {
  None = -1,
  Random,
  Primary,
  Secondary,
}

interface MoveAudio {
  fMove?: HTMLAudioElement;
  cMovePri?: HTMLAudioElement;
  cMoveSec?: HTMLAudioElement;
}

export interface IPokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  pokemonType: PokemonType;
  hp: number;
  stats: IStatsPokemonGO | undefined;
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
  form?: string;
  id?: number;
  pokemonType = PokemonType.Normal;
  hp = 0;
  stats: IStatsPokemonGO | undefined;
  bestStats: IBattleBaseStats | undefined;
  currentStats: IBattleBaseStats | undefined;
  pokemon: IPokemonData | undefined;
  fMove = new Combat();
  cMove = new Combat();
  cMoveSec: ICombat | undefined;
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
  chargeSlot: ChargeType;
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
  block = defaultBlock();
  chargeSlot = ChargeType.Primary;
  audio?: MoveAudio;

  static create(value: IPokemonBattle) {
    const obj = new PokemonBattle();
    obj.pokemonType = obj.pokemonData?.pokemonType ?? PokemonType.Normal;
    Object.assign(obj, value);
    return obj;
  }
}

export interface TimelineConfig {
  color?: string;
  timer: number;
  size?: number;
  isTap?: boolean;
  isDmgImmune?: boolean;
  type?: AttackType;
  move?: ICombat;
}

export interface ITimeline extends TimelineConfig {
  block: number;
  energy: number;
  hp: number;
  buff?: IBuff[];
}

export interface IPokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: IPokemonData | undefined;
  form: string | undefined;
  stats: IStatsPokemonGO;
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
  stats = new StatsPokemonGO();
  atk: IStatsAtk | undefined;
  def: IStatsDef | undefined;
  sta: IStatsSta | undefined;
  fMove: ICombat | undefined;
  cMovePri: ICombat | undefined;
  cMoveSec: ICombat | undefined;
  pokemonType = PokemonType.Normal;

  constructor({ ...props }: IPokemonTeamData) {
    if (props.pokemonType === PokemonType.Normal || props.pokemonType === PokemonType.None) {
      props.pokemonType = getPokemonType(props.speciesId);
    }
    Object.assign(this, props);
  }
}

export interface IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  pokemon: IPokemonData | undefined;
  form: string | undefined;
  stats: IStatsPokemonGO;
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
  stats = new StatsPokemonGO();
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
    if (props.pokemonType === PokemonType.Normal || props.pokemonType === PokemonType.None) {
      props.pokemonType = getPokemonType(props.form);
    }
    Object.assign(this, props);
  }
}
