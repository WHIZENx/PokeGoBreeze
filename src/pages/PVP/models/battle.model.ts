import { IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { StatsAtk, StatsDef, IStatsPokemon, StatsProd, StatsSta, IStatsBase, StatsPokemon } from '../../../core/models/stats.model';
import { IBattleBaseStats, IStatsProdCalculate } from '../../../util/models/calculate.model';

export interface PokemonBattleData {
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
  fmove: ICombat | null;
  cmove: ICombat | null;
  cmoveSec: ICombat | null;
  energy: number;
  block: number;
  turn: number;
  combatPoke?: IPokemonData;
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
}

export interface PokemonBattle {
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
  shadow?: boolean;
  pokemonData?: PokemonBattleData | null;
  fMove?: ICombat | null;
  cMovePri?: ICombat | null;
  cMoveSec?: ICombat | null;
  timeline: Timeline[];
  energy: number;
  block: number;
  audio?: any;
}

export interface Timeline {
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

export interface PokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: IPokemonData | undefined;
  form: string | null;
  stats: IStatsPokemon;
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  fmove: ICombat | undefined;
  cmovePri: ICombat | undefined;
  cmoveSec: ICombat | undefined;
  shadow: boolean;
  purified: boolean | undefined;
}

export interface IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  speciesId?: string;
  pokemon: IPokemonData | undefined;
  form: string | null;
  stats: IStatsPokemon;
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  prod: StatsProd | undefined;
  fmove: ICombat | undefined;
  cmovePri: ICombat | undefined;
  cmoveSec: ICombat | undefined;
  bestStats?: IStatsProdCalculate;
  shadow: boolean;
  purified: boolean | undefined;
  score: number;
}

export class PokemonBattleRanking implements IPokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number | undefined;
  name: string | undefined;
  speciesId?: string;
  pokemon: IPokemonData | undefined;
  form: string | null = '';
  stats: IStatsPokemon = new StatsPokemon();
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  prod: StatsProd | undefined;
  fmove: ICombat | undefined;
  cmovePri: ICombat | undefined;
  cmoveSec: ICombat | undefined;
  bestStats?: IStatsProdCalculate;
  shadow: boolean = false;
  purified: boolean | undefined = false;
  score: number = 0;

  constructor({ ...props }: IPokemonBattleRanking) {
    Object.assign(this, props);
  }
}
