import { IBuff, ICombat } from '../../../core/models/combat.model';
import { IPokemonData } from '../../../core/models/pokemon.model';
import { RankingsPVP } from '../../../core/models/pvp.model';
import { StatsAtk, StatsDef, IStatsPokemon, StatsProd, StatsSta } from '../../../core/models/stats.model';
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

export interface PokemonBattleRanking {
  data: RankingsPVP | undefined;
  id: number;
  name: string;
  speciesId?: string;
  pokemon: IPokemonData | undefined;
  form: string;
  stats: IStatsPokemon;
  atk: StatsAtk | undefined;
  def: StatsDef | undefined;
  sta: StatsSta | undefined;
  prod: StatsProd | undefined;
  fmove: ICombat | undefined;
  cmovePri: ICombat | undefined;
  cmoveSec: ICombat | undefined;
  bestStats?: StatsProdCalculate;
  shadow: boolean;
  purified: boolean;
}
