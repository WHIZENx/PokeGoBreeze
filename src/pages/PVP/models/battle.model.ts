import { Buff, Combat, CombatPokemon } from '../../../core/models/combat.model';
import { PokemonDataModel } from '../../../core/models/pokemon.model';
import { StatsPokemon } from '../../../core/models/stats.model';

export interface PokemonBattleData {
  speciesId?: string;
  name?: string;
  form?: string;
  id?: number;
  shadow: boolean;
  allStats?: any;
  hp: number;
  stats: any;
  bestStats: any;
  currentStats: any;
  pokemon: PokemonDataModel | null;
  fmove: Combat | null;
  cmove: Combat | null;
  cmoveSec: Combat | null;
  energy: number;
  block: number;
  turn: number;
  combatPoke?: CombatPokemon;
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
}

export interface PokemonBattle {
  disableCMoveSec?: boolean;
  disableCMovePri?: boolean;
  shadow: boolean;
  pokemonData: PokemonBattleData | null;
  fMove?: Combat | null;
  cMovePri?: Combat | null;
  cMoveSec?: Combat | null;
  timeline?: Timeline[];
  energy?: number;
  block?: number;
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
  speciesId: number;
  pokemonData: PokemonDataModel | undefined;
  form: string | null;
  stats: StatsPokemon;
  atk: { id: number; form: string; attack: number; rank: number } | undefined;
  def: { id: number; form: string; defense: number; rank: number } | undefined;
  sta: { id: number; form: string; stamina: number; rank: number } | undefined;
  fmove: Combat | undefined;
  cmovePri: Combat | undefined;
  cmoveSec: Combat | undefined;
  combatPoke: CombatPokemon | undefined;
  shadow: boolean;
  purified: boolean | undefined;
}
