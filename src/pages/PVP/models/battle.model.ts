import { Buff, Combat } from '../../../core/models/combat.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { StatsAtk, StatsDef, StatsPokemon, StatsProd, StatsSta } from '../../../core/models/stats.model';
import { StatsProdCalculate } from '../../../util/models/calculate.model';

export interface PokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  shadow: boolean;
  allStats?: StatsProdCalculate[];
  hp: number;
  stats:
    | {
        atk: number;
        def: number;
        sta?: number;
      }
    | undefined;
  bestStats: StatsProdCalculate | undefined;
  currentStats: StatsProdCalculate | undefined;
  pokemon: PokemonDataModel | null;
  fmove: Combat | null;
  cmove: Combat | null;
  cmoveSec: Combat | null;
  energy: number;
  block: number;
  turn: number;
  combatPoke?: PokemonDataModel;
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
}

export interface PokemonBattle {
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
  shadow?: boolean;
  pokemonData?: PokemonBattleData | null;
  fMove?: Combat | null;
  cMovePri?: Combat | null;
  cMoveSec?: Combat | null;
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
  move: Combat | null;
  hp: number;
  buff: Buff[] | null;
  dmgImmune: boolean;
}

export interface PokemonTeamData {
  id: number | undefined;
  name: string | undefined;
  speciesId: string;
  pokemonData: PokemonDataModel | undefined;
  form: string | null;
  stats: StatsPokemon;
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  fmove: Combat | undefined;
  cmovePri: Combat | undefined;
  cmoveSec: Combat | undefined;
  shadow: boolean;
  purified: boolean | undefined;
}

export interface PokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number;
  name: string;
  speciesId?: string;
  pokemon: PokemonDataModel | undefined;
  form: string;
  stats: StatsPokemon;
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  prod: StatsProd | undefined;
  fmove: Combat | undefined;
  cmovePri: Combat | undefined;
  cmoveSec: Combat | undefined;
  bestStats?: StatsProdCalculate;
  shadow: boolean;
  purified: boolean;
}
